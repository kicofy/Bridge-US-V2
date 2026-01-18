from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user
from app.core.database import get_db
from app.core.errors import AppError
from app.models.models import PostTag, Tag, User
from app.services.audit_service import log_action
from app.schemas.tag import TagCreateRequest, TagResponse, TagUpdateRequest


router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).order_by(Tag.name.asc()))
    return [TagResponse(id=tag.id, name=tag.name, slug=tag.slug) for tag in result.scalars().all()]


@router.post("", response_model=TagResponse)
async def create_tag(
    payload: TagCreateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    tag = Tag(name=payload.name, slug=payload.slug)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    await log_action(db, admin.id, "tag", tag.id, "tag_create", None)
    await db.commit()
    return TagResponse(id=tag.id, name=tag.name, slug=tag.slug)


@router.patch("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: str,
    payload: TagUpdateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if tag is None:
        raise AppError(code="tag_not_found", message="Tag not found", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise AppError(code="invalid_request", message="No fields to update", status_code=400)
    for key, value in data.items():
        setattr(tag, key, value)
    await log_action(db, admin.id, "tag", tag.id, "tag_update", None)
    await db.commit()
    await db.refresh(tag)
    return TagResponse(id=tag.id, name=tag.name, slug=tag.slug)


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if tag is None:
        raise AppError(code="tag_not_found", message="Tag not found", status_code=404)
    await db.execute(PostTag.__table__.delete().where(PostTag.tag_id == tag_id))
    await log_action(db, admin.id, "tag", tag.id, "tag_delete", None)
    await db.delete(tag)
    await db.commit()
    return {"status": "ok"}

