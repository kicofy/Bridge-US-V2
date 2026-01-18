from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.services.profile_service import get_profile, update_profile


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await get_profile(db, user.id)
    return ProfileResponse(
        user_id=profile.user_id,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        school_level=profile.school_level,
        location=profile.location,
        bio=profile.bio,
        credibility_score=profile.credibility_score,
        helpfulness_score=profile.helpfulness_score,
        accuracy_score=profile.accuracy_score,
    )


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    payload: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await update_profile(db, user.id, payload)
    return ProfileResponse(
        user_id=profile.user_id,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        school_level=profile.school_level,
        location=profile.location,
        bio=profile.bio,
        credibility_score=profile.credibility_score,
        helpfulness_score=profile.helpfulness_score,
        accuracy_score=profile.accuracy_score,
    )

