from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SENTINEL_",
        env_file=_REPOSITORY_ROOT / ".env",
        extra="ignore",
    )

    cors_origins: list[str] = Field(default_factory=list)
    database_url: SecretStr | None = None

    @field_validator("cors_origins")
    @classmethod
    def reject_wildcard_cors_origins(cls, origins: list[str]) -> list[str]:
        if "*" in origins:
            raise ValueError("Wildcard CORS origins are not allowed")
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
