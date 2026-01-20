from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="allow",
    )
    app_name: str = "BridgeUS-Backend"
    environment: str = "local"
    log_level: str = "INFO"
    api_prefix: str = "/api"
    cors_origins: str = "*"
    database_url: str = "sqlite+aiosqlite:///./bridgeus.db"
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 14
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    supported_languages: str = "en,zh,ko"
    moderation_review_threshold: int = 60
    moderation_reject_threshold: int = 85
    email_code_expire_minutes: int = 10
    email_debug_return_code: bool = False
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    smtp_from: str | None = None
    email_provider: str | None = None
    email_host: str | None = None
    email_port: int = 587
    email_user: str | None = None
    email_password: str | None = None
    email_use_tls: bool = True
    email_use_ssl: bool = False
    email_from: str | None = None
    email_smtp_host: str | None = None
    email_smtp_port: int = 587
    email_smtp_auth: bool = True
    email_smtp_secure: str | None = None
    email_username: str | None = None
    root_account: str | None = Field(default=None, validation_alias=AliasChoices("ROOT_ACCOUNT", "Root_Account"))
    root_password: str | None = Field(default=None, validation_alias=AliasChoices("ROOT_PASSWORD", "Root_Password"))
    ai_daily_limit: int = 0
    uploads_dir: str = "uploads"
    uploads_url: str = "/uploads"
    upload_max_mb: int = 5
    upload_allowed_types: str = "image/jpeg,image/png,image/webp,image/gif"


settings = Settings()

