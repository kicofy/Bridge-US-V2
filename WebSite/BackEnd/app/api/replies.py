from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_admin_user, get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.reply import ReplyCreateRequest, ReplyResponse, ReplyUpdateRequest
from app.services.reply_service import (
    admin_delete_reply,
    admin_hide_reply,
    admin_restore_reply,
    create_reply,
    delete_reply,
    list_replies,
    update_reply,
)


router = APIRouter(prefix="/replies", tags=["replies"])


@router.get("", response_model=list[ReplyResponse])
async def get_replies(
    post_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    replies = await list_replies(db, post_id, limit, offset)
    return [
        ReplyResponse(
            id=item.id,
            post_id=item.post_id,
            author_id=item.author_id,
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
    reply = await create_reply(db, post_id, user.id, payload)
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
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
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
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
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
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
    return ReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author_id=reply.author_id,
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

