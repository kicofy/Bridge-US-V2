from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import AccuracyFeedback, HelpfulnessVote, Post, PostTranslation, Profile, Reply
from app.schemas.interaction import AccuracyFeedbackRequest
from app.services.notification_service import create_notification


async def mark_helpful_post(db: AsyncSession, user_id: str, post_id: str) -> None:
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    try:
        db.add(HelpfulnessVote(user_id=user_id, target_type="post", target_id=post_id))
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AppError(code="already_voted", message="Already voted", status_code=409)
    await _recompute_post_helpful(db, post_id)
    await _recompute_user_helpfulness(db, post.author_id)
    if post.author_id != user_id:
        title_result = await db.execute(
            select(PostTranslation.title).where(
                PostTranslation.post_id == post_id,
                PostTranslation.language == post.original_language,
            )
        )
        post_title = title_result.scalar_one_or_none()
        author_result = await db.execute(select(Profile.display_name).where(Profile.user_id == user_id))
        from_user_name = author_result.scalar_one_or_none()
        await create_notification(
            db,
            post.author_id,
            "post_helpful",
            {"post_id": post_id, "post_title": post_title, "from_user_name": from_user_name},
            dedupe_key=f"post_helpful:{post_id}:{user_id}",
        )


async def unmark_helpful_post(db: AsyncSession, user_id: str, post_id: str) -> None:
    await db.execute(
        delete(HelpfulnessVote).where(
            HelpfulnessVote.user_id == user_id,
            HelpfulnessVote.target_type == "post",
            HelpfulnessVote.target_id == post_id,
        )
    )
    await db.commit()
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is not None:
        await _recompute_post_helpful(db, post_id)
        await _recompute_user_helpfulness(db, post.author_id)


async def mark_helpful_reply(db: AsyncSession, user_id: str, reply_id: str) -> None:
    reply_result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = reply_result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    try:
        db.add(HelpfulnessVote(user_id=user_id, target_type="reply", target_id=reply_id))
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AppError(code="already_voted", message="Already voted", status_code=409)
    await _recompute_reply_helpful(db, reply_id)
    await _recompute_reply_author_helpfulness(db, reply.author_id)
    if reply.author_id != user_id:
        excerpt = " ".join(reply.content.split()).strip()
        if len(excerpt) > 120:
            excerpt = f"{excerpt[:120]}..."
        author_result = await db.execute(select(Profile.display_name).where(Profile.user_id == user_id))
        from_user_name = author_result.scalar_one_or_none()
        await create_notification(
            db,
            reply.author_id,
            "reply_helpful",
            {"reply_id": reply_id, "reply_excerpt": excerpt, "from_user_name": from_user_name},
            dedupe_key=f"reply_helpful:{reply_id}:{user_id}",
        )


async def unmark_helpful_reply(db: AsyncSession, user_id: str, reply_id: str) -> None:
    await db.execute(
        delete(HelpfulnessVote).where(
            HelpfulnessVote.user_id == user_id,
            HelpfulnessVote.target_type == "reply",
            HelpfulnessVote.target_id == reply_id,
        )
    )
    await db.commit()
    reply_result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = reply_result.scalar_one_or_none()
    if reply is not None:
        await _recompute_reply_helpful(db, reply_id)
        await _recompute_reply_author_helpfulness(db, reply.author_id)


async def submit_accuracy_feedback(
    db: AsyncSession, user_id: str, post_id: str, payload: AccuracyFeedbackRequest
) -> None:
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    if post_result.scalar_one_or_none() is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    try:
        db.add(
            AccuracyFeedback(
                user_id=user_id,
                post_id=post_id,
                rating=payload.rating,
                note=payload.note,
            )
        )
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AppError(code="already_rated", message="Already rated", status_code=409)
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is not None:
        await _recompute_post_accuracy(db, post_id)
        await _recompute_user_accuracy(db, post.author_id)
        if post.author_id != user_id:
            title_result = await db.execute(
                select(PostTranslation.title).where(
                    PostTranslation.post_id == post_id,
                    PostTranslation.language == post.original_language,
                )
            )
            post_title = title_result.scalar_one_or_none()
            author_result = await db.execute(select(Profile.display_name).where(Profile.user_id == user_id))
            from_user_name = author_result.scalar_one_or_none()
            await create_notification(
                db,
                post.author_id,
                "post_rated",
                {
                    "post_id": post_id,
                    "post_title": post_title,
                    "from_user_name": from_user_name,
                    "rating": payload.rating,
                },
                dedupe_key=f"post_rated:{post_id}:{user_id}",
            )


async def update_accuracy_feedback(
    db: AsyncSession, user_id: str, post_id: str, payload: AccuracyFeedbackRequest
) -> None:
    result = await db.execute(
        select(AccuracyFeedback).where(
            AccuracyFeedback.user_id == user_id,
            AccuracyFeedback.post_id == post_id,
        )
    )
    feedback = result.scalar_one_or_none()
    if feedback is None:
        raise AppError(code="feedback_not_found", message="Feedback not found", status_code=404)
    feedback.rating = payload.rating
    feedback.note = payload.note
    await db.commit()
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is not None:
        await _recompute_post_accuracy(db, post_id)
        await _recompute_user_accuracy(db, post.author_id)


async def delete_accuracy_feedback(db: AsyncSession, user_id: str, post_id: str) -> None:
    result = await db.execute(
        select(AccuracyFeedback).where(
            AccuracyFeedback.user_id == user_id,
            AccuracyFeedback.post_id == post_id,
        )
    )
    feedback = result.scalar_one_or_none()
    if feedback is None:
        raise AppError(code="feedback_not_found", message="Feedback not found", status_code=404)
    await db.delete(feedback)
    await db.commit()
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is not None:
        await _recompute_post_accuracy(db, post_id)
        await _recompute_user_accuracy(db, post.author_id)


async def _recompute_post_helpful(db: AsyncSession, post_id: str) -> None:
    count_result = await db.execute(
        select(func.count(HelpfulnessVote.id)).where(
            HelpfulnessVote.target_type == "post",
            HelpfulnessVote.target_id == post_id,
        )
    )
    count = count_result.scalar_one() or 0
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is None:
        return
    post.helpful_count = int(count)
    await db.commit()


async def _recompute_post_accuracy(db: AsyncSession, post_id: str) -> None:
    avg_result = await db.execute(
        select(func.avg(AccuracyFeedback.rating), func.count(AccuracyFeedback.id)).where(
            AccuracyFeedback.post_id == post_id
        )
    )
    avg, count = avg_result.one()
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is None:
        return
    post.accuracy_avg = float(avg or 0)
    post.accuracy_count = int(count or 0)
    await db.commit()


async def _recompute_user_helpfulness(db: AsyncSession, user_id: str) -> None:
    post_ids = select(Post.id).where(Post.author_id == user_id)
    reply_ids = select(Reply.id).where(Reply.author_id == user_id)
    count_result = await db.execute(
        select(func.count(HelpfulnessVote.id)).where(
            or_(
                (HelpfulnessVote.target_type == "post") & (HelpfulnessVote.target_id.in_(post_ids)),
                (HelpfulnessVote.target_type == "reply") & (HelpfulnessVote.target_id.in_(reply_ids)),
            )
        )
    )
    count = count_result.scalar_one() or 0
    profile_result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        return
    profile.helpfulness_score = int(count)
    await db.commit()


async def _recompute_reply_author_helpfulness(db: AsyncSession, user_id: str) -> None:
    await _recompute_user_helpfulness(db, user_id)


async def _recompute_reply_helpful(db: AsyncSession, reply_id: str) -> None:
    count_result = await db.execute(
        select(func.count(HelpfulnessVote.id)).where(
            HelpfulnessVote.target_type == "reply",
            HelpfulnessVote.target_id == reply_id,
        )
    )
    count = count_result.scalar_one() or 0
    reply_result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = reply_result.scalar_one_or_none()
    if reply is None:
        return
    reply.helpful_count = int(count)
    await db.commit()


async def _recompute_user_accuracy(db: AsyncSession, user_id: str) -> None:
    post_ids = select(Post.id).where(Post.author_id == user_id)
    avg_result = await db.execute(
        select(func.avg(AccuracyFeedback.rating)).where(AccuracyFeedback.post_id.in_(post_ids))
    )
    avg = avg_result.scalar_one() or 0
    profile_result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        return
    profile.accuracy_score = int(round(avg, 0))
    await db.commit()

