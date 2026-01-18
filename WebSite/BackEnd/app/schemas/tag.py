from pydantic import BaseModel, Field


class TagCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=64)
    slug: str = Field(min_length=2, max_length=64)


class TagUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=64)
    slug: str | None = Field(default=None, min_length=2, max_length=64)


class TagResponse(BaseModel):
    id: str
    name: str
    slug: str

