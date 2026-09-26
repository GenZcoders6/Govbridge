"""
GovBridge Application Configuration
"""
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "dev-secret-key-change-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://govbridge_user:govbridge_password@localhost:5432/govbridge"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "jwt-dev-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://frontend:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Mock Service URLs
    MOCK_IDENTITY_URL: str = "http://localhost:8001"
    MOCK_EDUCATION_URL: str = "http://localhost:8002"
    MOCK_EMPLOYMENT_URL: str = "http://localhost:8003"
    MOCK_SKILL_URL: str = "http://localhost:8004"
    MOCK_REVENUE_URL: str = "http://localhost:8005"
    MOCK_WELFARE_URL: str = "http://localhost:8006"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        # Support SQLite for local dev (when postgres not available)
        if url.startswith("sqlite"):
            if not url.startswith("sqlite+aiosqlite"):
                url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
            return url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
