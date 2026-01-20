from datetime import datetime

from pydantic import BaseModel, Field


class ReplyCreateRequest(BaseModel):
    content: str = Field(min_length=1)


class ReplyUpdateRequest(BaseModel):
    content: str | None = Field(default=None, min_length=1)
    status: str | None = None


class ReplyResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str | None = None
    content: str
    helpful_count: int = 0
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

