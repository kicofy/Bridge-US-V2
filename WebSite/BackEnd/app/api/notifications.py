from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user, get_current_user
from app.core.database import get_db
from app.core.errors import AppError
from app.models.models import User
from app.schemas.notification import (
    NotificationCreateRequest,
    NotificationReadRequest,
    NotificationResponse,
)
from app.services.audit_service import log_action
from app.services.notification_service import (
    create_notification,
    list_notifications,
    mark_all_read,
    mark_read,
)


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_my_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items = await list_notifications(db, user.id, limit, offset)
    return [NotificationResponse(**item.__dict__) for item in items]


@router.post("/read")
async def mark_read_items(
    payload: NotificationReadRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await mark_read(db, user.id, payload.ids)
    return {"status": "ok"}


@router.post("/read-all")
async def mark_read_all(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await mark_all_read(db, user.id)
    return {"status": "ok"}


@router.post("", response_model=NotificationResponse)
async def admin_create_notification(
    payload: NotificationCreateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="user_not_found", message="User not found", status_code=404)
    item = await create_notification(
        db, payload.user_id, payload.type, payload.payload, payload.dedupe_key
    )
    await log_action(db, admin.id, "notification", item.id, "notification_create", None)
    await db.commit()
    return NotificationResponse(**item.__dict__)

