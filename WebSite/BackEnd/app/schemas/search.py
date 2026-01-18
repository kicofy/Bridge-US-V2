from pydantic import BaseModel, Field

from app.schemas.post import PostResponse


class SearchResponse(BaseModel):
    items: list[PostResponse] = Field(default_factory=list)
    total: int = 0


class SuggestionResponse(BaseModel):
    items: list[str] = Field(default_factory=list)


class TrendingResponse(BaseModel):
    items: list[PostResponse] = Field(default_factory=list)

