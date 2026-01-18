from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import ModerationAction, Post, Report, Reply
from app.services.notification_service import create_notification


async def create_report(
    db: AsyncSession,
    reporter_id: str,
    target_type: str,
    target_id: str,
    reason: str,
    evidence: str | None,
) -> Report:
    if target_type not in {"post", "reply"}:
        raise AppError(code="invalid_target", message="Invalid target", status_code=400)
    report = Report(
        reporter_id=reporter_id,
        target_type=target_type,
        target_id=target_id,
        reason=reason,
        evidence=evidence,
        original_status=await _get_target_status(db, target_type, target_id),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def list_reports(db: AsyncSession, limit: int, offset: int) -> list[Report]:
    result = await db.execute(
        select(Report).order_by(Report.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def list_my_reports(db: AsyncSession, reporter_id: str, limit: int, offset: int) -> list[Report]:
    result = await db.execute(
        select(Report)
        .where(Report.reporter_id == reporter_id)
        .order_by(Report.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def resolve_report(
    db: AsyncSession,
    report_id: str,
    moderator_id: str,
    action: str,
    note: str | None,
) -> Report:
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if report is None:
        raise AppError(code="report_not_found", message="Report not found", status_code=404)

    if action not in {"hide", "restore", "reject"}:
        raise AppError(code="invalid_action", message="Invalid action", status_code=400)

    if action == "hide":
        await _apply_content_status(db, report.target_type, report.target_id, "hidden")
    elif action == "restore":
        await _apply_content_status(
            db,
            report.target_type,
            report.target_id,
            report.original_status or "published",
        )

    report.status = "resolved" if action != "reject" else "rejected"
    report.resolved_at = datetime.now(timezone.utc)

    db.add(
        ModerationAction(
            moderator_id=moderator_id,
            target_type=report.target_type,
            target_id=report.target_id,
            action=f"report_{action}",
            reason=note,
        )
    )
    await db.commit()
    await db.refresh(report)
    await create_notification(
        db,
        report.reporter_id,
        "report_resolved",
        {"report_id": report.id, "status": report.status},
        dedupe_key=str(report.id),
    )
    author_id = await _get_target_author(db, report.target_type, report.target_id)
    if author_id and author_id != report.reporter_id:
        await create_notification(
            db,
            author_id,
            "report_result",
            {"report_id": report.id, "status": report.status},
            dedupe_key=f"{report.id}:author",
        )
    return report


async def _apply_content_status(db: AsyncSession, target_type: str, target_id: str, status: str) -> None:
    if target_type == "post":
        result = await db.execute(select(Post).where(Post.id == target_id))
        post = result.scalar_one_or_none()
        if post is None:
            raise AppError(code="post_not_found", message="Post not found", status_code=404)
        post.status = status
    if target_type == "reply":
        result = await db.execute(select(Reply).where(Reply.id == target_id))
        reply = result.scalar_one_or_none()
        if reply is None:
            raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
        reply.status = "hidden" if status == "hidden" else "visible"


async def _get_target_status(db: AsyncSession, target_type: str, target_id: str) -> str | None:
    if target_type == "post":
        result = await db.execute(select(Post).where(Post.id == target_id))
        post = result.scalar_one_or_none()
        return post.status if post is not None else None
    if target_type == "reply":
        result = await db.execute(select(Reply).where(Reply.id == target_id))
        reply = result.scalar_one_or_none()
        return reply.status if reply is not None else None
    return None


async def _get_target_author(db: AsyncSession, target_type: str, target_id: str) -> str | None:
    if target_type == "post":
        result = await db.execute(select(Post).where(Post.id == target_id))
        post = result.scalar_one_or_none()
        return post.author_id if post is not None else None
    if target_type == "reply":
        result = await db.execute(select(Reply).where(Reply.id == target_id))
        reply = result.scalar_one_or_none()
        return reply.author_id if reply is not None else None
    return None

