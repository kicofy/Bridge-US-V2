from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import ModerationAction


async def log_action(
    db: AsyncSession,
    moderator_id: str,
    target_type: str,
    target_id: str,
    action: str,
    reason: str | None,
) -> None:
    db.add(
        ModerationAction(
            moderator_id=moderator_id,
            target_type=target_type,
            target_id=target_id,
            action=action,
            reason=reason,
        )
    )

