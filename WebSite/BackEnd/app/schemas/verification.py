from pydantic import BaseModel, Field


class VerificationSubmitRequest(BaseModel):
    docs_url: str = Field(min_length=5)


class VerificationStatusResponse(BaseModel):
    request_id: str
    status: str

