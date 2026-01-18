from datetime import datetime

from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    payload: dict | None = None
    read_at: datetime | None = None
    created_at: datetime | None = None


class NotificationCreateRequest(BaseModel):
    user_id: str
    type: str = Field(min_length=2, max_length=64)
    payload: dict | None = None
    dedupe_key: str = Field(min_length=1, max_length=64)


class NotificationReadRequest(BaseModel):
    ids: list[str] = Field(min_length=1)

