from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


@lru_cache
def get_engine() -> Engine:
    database_url = get_settings().database_url
    if database_url is None:
        raise RuntimeError("SENTINEL_DATABASE_URL must be configured")

    url = database_url.get_secret_value()
    if not url.startswith("postgresql+psycopg://"):
        raise ValueError("SENTINEL_DATABASE_URL must use postgresql+psycopg")
    return create_engine(url, pool_pre_ping=True)


def get_session() -> Iterator[Session]:
    session_factory = sessionmaker(bind=get_engine())
    with session_factory() as session:
        yield session
