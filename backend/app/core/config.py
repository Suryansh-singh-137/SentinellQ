"""
SentinelIQ – Application Settings
Loaded from environment variables via pydantic-settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── General ──────────────────────────────────────────────
    PROJECT_NAME: str = "SentinelIQ AI Risk Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── Security / JWT ───────────────────────────────────────
    SECRET_KEY: str = "sentineliq_dev_secret_key_minimum_32_characters_long_for_security"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+psycopg://sentineliq:sentineliq_dev_password@localhost:5432/sentineliq"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "sentineliq"
    POSTGRES_PASSWORD: str = "sentineliq_dev_password"
    POSTGRES_DB: str = "sentineliq"

    # ── Redis ────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── CORS ─────────────────────────────────────────────────
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
