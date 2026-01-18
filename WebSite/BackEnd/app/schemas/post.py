from datetime import datetime

from pydantic import BaseModel, Field


class PostCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    content: str = Field(min_length=5)
    category_id: str | None = None
    tags: list[str] = Field(default_factory=list)
    language: str = Field(default="en", min_length=2, max_length=8)
    status: str = Field(default="draft")


class PostUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    content: str | None = Field(default=None, min_length=5)
    category_id: str | None = None
    tags: list[str] | None = None
    status: str | None = None


class PostResponse(BaseModel):
    id: str
    author_id: str
    category_id: str | None
    status: str
    language: str
    title: str
    content: str
    tags: list[str] = Field(default_factory=list)
    helpful_count: int = 0
    accuracy_avg: float = 0
    accuracy_count: int = 0
    created_at: datetime | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None

