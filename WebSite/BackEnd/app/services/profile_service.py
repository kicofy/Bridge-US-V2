from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import Profile
from app.schemas.profile import ProfileUpdateRequest


async def get_profile(db: AsyncSession, user_id: str) -> Profile:
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise AppError(code="profile_not_found", message="Profile not found", status_code=404)
    return profile


async def update_profile(db: AsyncSession, user_id: str, payload: ProfileUpdateRequest) -> Profile:
    profile = await get_profile(db, user_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)
    await db.commit()
    await db.refresh(profile)
    return profile

