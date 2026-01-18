from pydantic import BaseModel, Field


class AccuracyFeedbackRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    note: str | None = None


class HelpfulnessResponse(BaseModel):
    status: str


class AccuracyResponse(BaseModel):
    status: str

