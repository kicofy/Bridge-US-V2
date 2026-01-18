from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AppError
from app.models.models import AIUsage


async def enforce_ai_limit(db: AsyncSession, user_id: str) -> None:
    if settings.ai_daily_limit <= 0:
        return
    today = date.today()
    result = await db.execute(
        select(AIUsage).where(AIUsage.user_id == user_id, AIUsage.usage_date == today)
    )
    usage = result.scalar_one_or_none()
    if usage is None:
        usage = AIUsage(user_id=user_id, usage_date=today, count=1)
        db.add(usage)
        await db.commit()
        return
    if usage.count >= settings.ai_daily_limit:
        raise AppError(code="ai_rate_limited", message="AI daily limit reached", status_code=429)
    usage.count += 1
    await db.commit()

