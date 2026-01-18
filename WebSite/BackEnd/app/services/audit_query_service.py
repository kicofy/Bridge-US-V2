from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import ModerationAction


async def list_audit_logs(db: AsyncSession, limit: int, offset: int) -> list[ModerationAction]:
    result = await db.execute(
        select(ModerationAction)
        .order_by(ModerationAction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())

