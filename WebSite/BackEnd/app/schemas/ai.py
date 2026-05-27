from pydantic import BaseModel, Field
from typing import Literal


class AIMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class AIAskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    history: list[AIMessage] = Field(default_factory=list, max_length=20)


class AIAskResponse(BaseModel):
    answer: str


class AITranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source_lang: str = Field(min_length=2, max_length=8)
    target_lang: str = Field(min_length=2, max_length=8)


class AITranslateResponse(BaseModel):
    text: str


class AIModerateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=5000)


class AIModerateResponse(BaseModel):
    risk_score: int
    labels: list[str]
    decision: str
    reason: str
