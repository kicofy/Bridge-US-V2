from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    user_id: str
    display_name: str
    avatar_url: str | None = None
    school_level: str | None = None
    location: str | None = None
    bio: str | None = None
    credibility_score: int = 0
    helpfulness_score: int = 0
    accuracy_score: int = 0


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=100)
    avatar_url: str | None = None
    school_level: str | None = None
    location: str | None = None
    bio: str | None = None

