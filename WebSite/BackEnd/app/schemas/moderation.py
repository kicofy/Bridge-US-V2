from datetime import datetime

from pydantic import BaseModel, Field


class ModerationLogResponse(BaseModel):
    id: str
    target_type: str
    target_id: str
    user_id: str | None
    risk_score: int
    labels: list[str] | None = None
    decision: str
    reason: str | None = None
    created_at: datetime | None = None


class AppealCreateRequest(BaseModel):
    target_type: str = Field(min_length=3)
    target_id: str = Field(min_length=3)
    reason: str = Field(min_length=5)


class AppealResponse(BaseModel):
    id: str
    user_id: str
    target_type: str
    target_id: str
    reason: str
    status: str
    reviewed_at: datetime | None = None
    created_at: datetime | None = None


class ModerationDecisionRequest(BaseModel):
    reason: str | None = None

