from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: str
    moderator_id: str
    target_type: str
    target_id: str
    action: str
    reason: str | None = None
    created_at: datetime | None = None

