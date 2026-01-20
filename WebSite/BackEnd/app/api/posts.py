import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user, get_optional_user
from app.core.database import SessionLocal, get_db
from app.core.errors import AppError
from app.models.models import User
from app.schemas.post import PostCreateRequest, PostResponse, PostUpdateRequest
from app.services.post_service import (
    create_post,
    delete_post,
    get_post,
    list_posts,
    list_user_posts,
    publish_post,
    process_post_submission,
    set_post_visibility,
    update_post,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostResponse])
async def list_items(
    language: str = Query(default="en"),
    author_id: str | None = Query(default=None),
    include_hidden: bool = Query(default=False),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    if include_hidden and (user is None or user.role != "admin"):
        raise AppError(code="forbidden", message="Admin only", status_code=403)
    return await list_posts(
        db,
        language,
        limit,
        offset,
        author_id=author_id,
        include_hidden=include_hidden,
    )


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
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_post(db, post_id, language, user)


@router.post("", response_model=PostResponse)
async def create_item(
    payload: PostCreateRequest,
    user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    post = await create_post(db, user.id, payload)

    async def _process(post_id: str) -> None:
        try:
            async with SessionLocal() as session:
                await process_post_submission(session, post_id)
        except Exception:
            logger.exception("Post background processing failed", extra={"post_id": post_id})

    background_tasks.add_task(_process, post.id)
    return await get_post(db, post.id, payload.language, user)


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


@router.post("/{post_id}/hide", response_model=PostResponse)
async def hide_item(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await set_post_visibility(db, post_id, user.id, "hidden", is_admin=user.role == "admin")
    return await get_post(db, post.id, post.original_language, user)


@router.post("/{post_id}/restore", response_model=PostResponse)
async def restore_item(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await set_post_visibility(db, post_id, user.id, "published", is_admin=user.role == "admin")
    return await get_post(db, post.id, post.original_language, user)


@router.post("/{post_id}/publish", response_model=PostResponse)
async def publish_item(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await publish_post(db, post_id)
    return await get_post(db, post.id, post.original_language)

