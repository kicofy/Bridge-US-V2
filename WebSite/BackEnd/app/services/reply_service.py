from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import Post, Reply
from app.services.notification_service import create_notification
from app.schemas.reply import ReplyCreateRequest, ReplyUpdateRequest


async def list_replies(
    db: AsyncSession, post_id: str, limit: int, offset: int, include_hidden: bool = False
) -> list[Reply]:
    stmt = select(Reply).where(Reply.post_id == post_id)
    if not include_hidden:
        stmt = stmt.where(Reply.status == "visible")
    result = await db.execute(
        stmt.order_by(Reply.created_at.asc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def list_user_replies(db: AsyncSession, user_id: str, limit: int, offset: int) -> list[Reply]:
    result = await db.execute(
        select(Reply)
        .where(Reply.author_id == user_id)
        .order_by(Reply.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def list_all_replies(
    db: AsyncSession, limit: int, offset: int, status: str | None = None
) -> list[Reply]:
    stmt = select(Reply)
    if status and status != "all":
        stmt = stmt.where(Reply.status == status)
    result = await db.execute(stmt.order_by(Reply.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all())


async def create_reply(db: AsyncSession, post_id: str, author_id: str, payload: ReplyCreateRequest) -> Reply:
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    reply = Reply(post_id=post_id, author_id=author_id, content=payload.content, status="visible")
    db.add(reply)
    await db.commit()
    await db.refresh(reply)
    if post.author_id != author_id:
        await create_notification(
            db,
            post.author_id,
            "reply_created",
            {"post_id": post.id, "reply_id": reply.id},
            dedupe_key=f"reply:{reply.id}",
        )
    return reply


async def update_reply(db: AsyncSession, reply_id: str, author_id: str, payload: ReplyUpdateRequest) -> Reply:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    if reply.author_id != author_id:
        raise AppError(code="forbidden", message="Not allowed", status_code=403)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(reply, key, value)
    await db.commit()
    await db.refresh(reply)
    return reply


async def delete_reply(db: AsyncSession, reply_id: str, author_id: str) -> None:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    if reply.author_id != author_id:
        raise AppError(code="forbidden", message="Not allowed", status_code=403)
    await db.delete(reply)
    await db.commit()


async def admin_hide_reply(db: AsyncSession, reply_id: str) -> Reply:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    reply.status = "hidden"
    await db.commit()
    await db.refresh(reply)
    return reply


async def admin_restore_reply(db: AsyncSession, reply_id: str) -> Reply:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    reply.status = "visible"
    await db.commit()
    await db.refresh(reply)
    return reply


async def admin_delete_reply(db: AsyncSession, reply_id: str) -> None:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    await db.delete(reply)
    await db.commit()

