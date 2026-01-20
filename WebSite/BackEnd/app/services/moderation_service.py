from datetime import datetime, timezone
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AppError
from app.models.models import Appeal, ModerationAction, ModerationLog, Post, PostTranslation
from app.services.ai_service import moderate_text
from app.services.notification_service import create_notification


logger = logging.getLogger(__name__)


async def screen_post(db: AsyncSession, post: Post, title: str, content: str) -> ModerationLog:
    try:
        result = moderate_text(title, content)
        risk_score = int(result.get("risk_score", 0))
        labels = result.get("labels", [])
        decision = result.get("decision", "pass")
        reason = result.get("reason", "")
    except AppError as exc:
        if exc.code == "ai_not_configured":
            risk_score = 0
            labels = ["ai_disabled"]
            decision = "pass"
            reason = "AI moderation disabled"
        else:
            risk_score = settings.moderation_review_threshold
            labels = ["ai_error", exc.code]
            decision = "review"
            reason = "AI moderation unavailable"
        logger.warning(
            "Moderation fallback for post %s (code=%s, decision=%s)",
            post.id,
            exc.code,
            decision,
        )
    except Exception as exc:  # broader catch to avoid blocking publish on provider errors
        risk_score = settings.moderation_review_threshold
        labels = ["ai_error", exc.__class__.__name__]
        decision = "review"
        reason = "AI moderation failed"
        logger.exception("Moderation error for post %s", post.id)

    if risk_score >= settings.moderation_reject_threshold:
        decision = "reject"
    elif risk_score >= settings.moderation_review_threshold:
        decision = "review"
    else:
        decision = "pass"

    log = ModerationLog(
        target_type="post",
        target_id=post.id,
        user_id=post.author_id,
        risk_score=risk_score,
        labels=labels,
        decision=decision,
        reason=reason,
    )
    db.add(log)
    await db.flush()

    if decision == "pass":
        post.status = "published"
        if post.published_at is None:
            post.published_at = datetime.now(timezone.utc)
    else:
        post.status = "pending"
    logger.info(
        "Moderation result for post %s: decision=%s risk=%s labels=%s",
        post.id,
        decision,
        risk_score,
        labels,
    )
    return log


async def list_logs(db: AsyncSession, limit: int, offset: int) -> list[ModerationLog]:
    result = await db.execute(
        select(ModerationLog).order_by(ModerationLog.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def list_user_logs(db: AsyncSession, user_id: str, limit: int, offset: int) -> list[ModerationLog]:
    result = await db.execute(
        select(ModerationLog)
        .where(ModerationLog.user_id == user_id)
        .order_by(ModerationLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def get_log(db: AsyncSession, log_id: str) -> ModerationLog:
    result = await db.execute(select(ModerationLog).where(ModerationLog.id == log_id))
    log = result.scalar_one_or_none()
    if log is None:
        raise AppError(code="log_not_found", message="Log not found", status_code=404)
    return log


async def create_appeal(db: AsyncSession, user_id: str, target_type: str, target_id: str, reason: str) -> Appeal:
    appeal = Appeal(user_id=user_id, target_type=target_type, target_id=target_id, reason=reason)
    db.add(appeal)
    await db.commit()
    await db.refresh(appeal)
    return appeal


async def list_appeals(db: AsyncSession, limit: int, offset: int) -> list[Appeal]:
    result = await db.execute(
        select(Appeal).order_by(Appeal.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def list_user_appeals(db: AsyncSession, user_id: str, limit: int, offset: int) -> list[Appeal]:
    result = await db.execute(
        select(Appeal)
        .where(Appeal.user_id == user_id)
        .order_by(Appeal.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def resolve_appeal(db: AsyncSession, appeal_id: str, reviewer_id: str, status: str) -> Appeal:
    result = await db.execute(select(Appeal).where(Appeal.id == appeal_id))
    appeal = result.scalar_one_or_none()
    if appeal is None:
        raise AppError(code="appeal_not_found", message="Appeal not found", status_code=404)
    appeal.status = status
    appeal.reviewer_id = reviewer_id
    appeal.reviewed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(appeal)
    await create_notification(
        db,
        appeal.user_id,
        "appeal_resolved",
        {"appeal_id": appeal.id, "status": appeal.status},
        dedupe_key=str(appeal.id),
    )
    return appeal


async def list_pending_posts(db: AsyncSession, limit: int, offset: int) -> list[Post]:
    result = await db.execute(
        select(Post).where(Post.status == "pending").order_by(Post.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def resolve_post_review(
    db: AsyncSession, post_id: str, reviewer_id: str, action: str, reason: str | None
) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if action == "approve":
        post.status = "published"
        if post.published_at is None:
            post.published_at = datetime.now(timezone.utc)
    elif action == "reject":
        post.status = "hidden"
    else:
        raise AppError(code="invalid_action", message="Invalid action", status_code=400)

    db.add(
        ModerationAction(
            moderator_id=reviewer_id,
            target_type="post",
            target_id=post.id,
            action=action,
            reason=reason,
        )
    )
    await db.commit()
    await db.refresh(post)
    title_result = await db.execute(
        select(PostTranslation.title).where(
            PostTranslation.post_id == post.id,
            PostTranslation.language == post.original_language,
        )
    )
    post_title = title_result.scalar_one_or_none()
    await create_notification(
        db,
        post.author_id,
        "post_reviewed",
        {
            "post_id": post.id,
            "post_title": post_title,
            "status": post.status,
            "action": action,
            "reason": reason,
        },
        dedupe_key=f"post_review:{post.id}:{action}",
    )
    return post

