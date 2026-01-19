from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    id: str
    url: str
    mime: str | None = None
    size: int | None = None

