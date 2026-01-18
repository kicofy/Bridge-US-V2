from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreateRequest(BaseModel):
    target_type: str = Field(min_length=2, max_length=16)
    target_id: str
    reason: str = Field(min_length=2, max_length=500)
    evidence: str | None = None


class ReportResolveRequest(BaseModel):
    action: str = Field(min_length=2, max_length=16)
    note: str | None = None


class ReportResponse(BaseModel):
    id: str
    reporter_id: str
    target_type: str
    target_id: str
    reason: str
    evidence: str | None = None
    status: str
    created_at: datetime | None = None
    resolved_at: datetime | None = None

