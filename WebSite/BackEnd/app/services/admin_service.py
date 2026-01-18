from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import Post, Reply, User
from app.services.audit_service import log_action
from app.services.notification_service import create_notification


async def list_users(db: AsyncSession, limit: int, offset: int) -> list[User]:
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all())


async def set_user_status(db: AsyncSession, user_id: str, status: str, admin_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="user_not_found", message="User not found", status_code=404)
    user.status = status
    await log_action(db, admin_id, "user", user_id, f"user_{status}", None)
    await create_notification(
        db,
        user_id,
        "account_status",
        {"status": status},
        dedupe_key=f"account_status:{user_id}:{status}",
    )
    await db.commit()
    await db.refresh(user)
    return user


async def admin_set_post_status(
    db: AsyncSession, post_id: str, admin_id: str, status: str, reason: str | None
) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    post.status = status
    if status == "published" and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    await log_action(db, admin_id, "post", post_id, f"post_{status}", reason)
    await db.commit()
    await db.refresh(post)
    return post


async def admin_set_reply_status(
    db: AsyncSession, reply_id: str, admin_id: str, status: str, reason: str | None
) -> Reply:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    reply.status = status
    await log_action(db, admin_id, "reply", reply_id, f"reply_{status}", reason)
    await db.commit()
    await db.refresh(reply)
    return reply

