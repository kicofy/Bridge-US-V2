from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from app.core.auth import get_current_admin_user, get_current_user, get_optional_user
from app.core.database import get_db
from app.core.errors import AppError
from app.models.models import Post, Profile, User
from app.schemas.reply import ReplyCreateRequest, ReplyResponse, ReplyUpdateRequest
from app.services.reply_service import (
    admin_delete_reply,
    admin_hide_reply,
    admin_restore_reply,
    create_reply,
    delete_reply,
    list_replies,
    list_all_replies,
    list_user_replies,
    update_reply,
)


router = APIRouter(prefix="/replies", tags=["replies"])


@router.get("", response_model=list[ReplyResponse])
async def get_replies(
    post_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if post.status != "published":
        if not user or (user.id != post.author_id and user.role != "admin"):
            raise AppError(code="post_not_found", message="Post not found", status_code=404)
    replies = await list_replies(db, post_id, limit, offset)
    author_ids = {item.author_id for item in replies}
    author_map: dict[str, str | None] = {}
    if author_ids:
        result = await db.execute(
            select(Profile.user_id, Profile.display_name).where(Profile.user_id.in_(author_ids))
        )
        author_map = {user_id: display_name for user_id, display_name in result.all()}
    return [
        ReplyResponse(
            id=item.id,
            post_id=item.post_id,
            author_id=item.author_id,
            author_name=author_map.get(item.author_id),
            content=item.content,
            helpful_count=item.helpful_count,
            status=item.status,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in replies
    ]


@router.get("/admin", response_model=list[ReplyResponse])
async def get_all_replies(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: str | None = Query(default=None),
    _: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    replies = await list_all_replies(db, limit, offset, status)
    author_ids = {item.author_id for item in replies}
    author_map: dict[str, str | None] = {}
    if author_ids:
        result = await db.execute(
            select(Profile.user_id, Profile.display_name).where(Profile.user_id.in_(author_ids))
        )
        author_map = {user_id: display_name for user_id, display_name in result.all()}
    return [
        ReplyResponse(
            id=item.id,
            post_id=item.post_id,
            author_id=item.author_id,
            author_name=author_map.get(item.author_id),
            content=item.content,
            helpful_count=item.helpful_count,
            status=item.status,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in replies
    ]


@router.get("/me", response_model=list[ReplyResponse])
async def get_my_replies(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    replies = await list_user_replies(db, user.id, limit, offset)
    author_ids = {item.author_id for item in replies}
    author_map: dict[str, str | None] = {}
    if author_ids:
        result = await db.execute(
            select(Profile.user_id, Profile.display_name).where(Profile.user_id.in_(author_ids))
        )
        author_map = {user_id: display_name for user_id, display_name in result.all()}
    return [
        ReplyResponse(
            id=item.id,
            post_id=item.post_id,
            author_id=item.author_id,
            author_name=author_map.get(item.author_id),
            content=item.content,
            helpful_count=item.helpful_count,
            status=item.status,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in replies
    ]


@router.post("", response_model=ReplyResponse)
async def create(
    payload: ReplyCreateRequest,
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reply = await create_reply(db, post_id, user.id, payload, is_admin=user.role == "admin")
    author_result = await db.execute(
        select(Profile.display_name).where(Profile.user_id == reply.author_id)
    )
    author_name = author_result.scalar_one_or_none()
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
        author_name=author_name,
        content=reply.content,
        helpful_count=reply.helpful_count,
        status=reply.status,
        created_at=reply.created_at,
        updated_at=reply.updated_at,
    )


@router.patch("/{reply_id}", response_model=ReplyResponse)
async def update(
    reply_id: str,
    payload: ReplyUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reply = await update_reply(db, reply_id, user.id, payload)
    author_result = await db.execute(
        select(Profile.display_name).where(Profile.user_id == reply.author_id)
    )
    author_name = author_result.scalar_one_or_none()
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
        author_name=author_name,
        content=reply.content,
        helpful_count=reply.helpful_count,
        status=reply.status,
        created_at=reply.created_at,
        updated_at=reply.updated_at,
    )


@router.delete("/{reply_id}")
async def remove(
    reply_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_reply(db, reply_id, user.id)
    return {"status": "ok"}


@router.patch("/{reply_id}/hide", response_model=ReplyResponse)
async def admin_hide(
    reply_id: str,
    user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    reply = await admin_hide_reply(db, reply_id)
    author_result = await db.execute(
        select(Profile.display_name).where(Profile.user_id == reply.author_id)
    )
    author_name = author_result.scalar_one_or_none()
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
        author_name=author_name,
        content=reply.content,
        helpful_count=reply.helpful_count,
        status=reply.status,
        created_at=reply.created_at,
        updated_at=reply.updated_at,
    )


@router.patch("/{reply_id}/restore", response_model=ReplyResponse)
async def admin_restore(
    reply_id: str,
    user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    reply = await admin_restore_reply(db, reply_id)
    author_result = await db.execute(
        select(Profile.display_name).where(Profile.user_id == reply.author_id)
    )
    author_name = author_result.scalar_one_or_none()
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
        author_name=author_name,
        content=reply.content,
        helpful_count=reply.helpful_count,
        status=reply.status,
        created_at=reply.created_at,
        updated_at=reply.updated_at,
    )


@router.delete("/{reply_id}/admin-delete")
async def admin_remove(
    reply_id: str,
    user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    await admin_delete_reply(db, reply_id)
    return {"status": "ok"}

