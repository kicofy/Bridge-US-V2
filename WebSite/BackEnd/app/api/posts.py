from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.post import PostCreateRequest, PostResponse, PostUpdateRequest
from app.services.post_service import (
    create_post,
    delete_post,
    get_post,
    list_posts,
    list_user_posts,
    publish_post,
    update_post,
)


router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostResponse])
async def list_items(
    language: str = Query(default="en"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await list_posts(db, language, limit, offset)


@router.get("/me", response_model=list[PostResponse])
async def list_my_posts(
    language: str = Query(default="en"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_user_posts(db, user.id, language, limit, offset)


@router.get("/{post_id}", response_model=PostResponse)
async def get_item(
    post_id: str,
    language: str = Query(default="en"),
    db: AsyncSession = Depends(get_db),
):
    return await get_post(db, post_id, language)


@router.post("", response_model=PostResponse)
async def create_item(
    payload: PostCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await create_post(db, user.id, payload)
    return await get_post(db, post.id, payload.language)


@router.patch("/{post_id}", response_model=PostResponse)
async def update_item(
    post_id: str,
    payload: PostUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await update_post(db, post_id, user.id, payload, is_admin=user.role == "admin")
    return await get_post(db, post.id, post.original_language)


@router.delete("/{post_id}")
async def delete_item(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_post(db, post_id, user.id, is_admin=user.role == "admin")
    return {"status": "ok"}


@router.post("/{post_id}/publish", response_model=PostResponse)
async def publish_item(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await publish_post(db, post_id)
    return await get_post(db, post.id, post.original_language)

