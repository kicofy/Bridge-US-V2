from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: str
    moderator_id: str
    moderator_email: str | None = None
    target_type: str
    target_id: str
    target_email: str | None = None
    action: str
    reason: str | None = None
    created_at: datetime | None = None

