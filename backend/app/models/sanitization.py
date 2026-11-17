from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.types import JSON_VALUE


class SanitizationRecord(Base):
    __tablename__ = "sanitization_records"
    __table_args__ = (
        Index("ix_sanitization_records_original_document_id", "original_document_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    original_document_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        nullable=False,
    )
    protected_storage_ref: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    applied_actions: Mapped[list[str]] = mapped_column(JSON_VALUE, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
