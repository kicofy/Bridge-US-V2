from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Notification


async def create_notification(
    db: AsyncSession,
    user_id: str,
    type_: str,
    payload: dict | None = None,
    dedupe_key: str | None = None,
) -> Notification:
    if dedupe_key:
        existing = await db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.type == type_,
                Notification.dedupe_key == dedupe_key,
            )
        )
        found = existing.scalar_one_or_none()
        if found is not None:
            return found
    notification = Notification(user_id=user_id, type=type_, payload=payload, dedupe_key=dedupe_key)
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def list_notifications(
    db: AsyncSession, user_id: str, limit: int, offset: int
) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def mark_read(db: AsyncSession, user_id: str, ids: list[str]) -> None:
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id, Notification.id.in_(ids))
    )
    items = result.scalars().all()
    now = datetime.now(timezone.utc)
    for item in items:
        item.read_at = now
    await db.commit()


async def mark_all_read(db: AsyncSession, user_id: str) -> None:
    result = await db.execute(select(Notification).where(Notification.user_id == user_id))
    items = result.scalars().all()
    now = datetime.now(timezone.utc)
    for item in items:
        item.read_at = now
    await db.commit()

