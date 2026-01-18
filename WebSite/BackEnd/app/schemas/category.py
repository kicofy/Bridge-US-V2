from pydantic import BaseModel, Field


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=64)
    slug: str = Field(min_length=2, max_length=64)
    sort_order: int = 0
    status: str = "active"


class CategoryUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=64)
    slug: str | None = Field(default=None, min_length=2, max_length=64)
    sort_order: int | None = None
    status: str | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    sort_order: int
    status: str

