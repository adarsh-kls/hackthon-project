"""Create initial SENTINEL entities.

Revision ID: 0001_initial_schema
Revises:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None
_JSON_VALUE = sa.JSON().with_variant(postgresql.JSONB(), "postgresql")


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=127), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("storage_ref", sa.String(length=512), nullable=False),
        sa.Column(
            "uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "processing_status", sa.String(length=32), server_default="queued", nullable=False
        ),
        sa.CheckConstraint("file_size >= 0", name="ck_documents_file_size_nonnegative"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_ref"),
    )
    op.create_index("ix_documents_uploaded_at", "documents", ["uploaded_at"])

    op.create_table(
        "scans",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("document_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="queued", nullable=False),
        sa.Column("risk_score", sa.Numeric(5, 2), nullable=True),
        sa.Column("risk_level", sa.String(length=32), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("analysis_stages", _JSON_VALUE, nullable=True),
        sa.CheckConstraint(
            "risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100)",
            name="ck_scans_risk_score_range",
        ),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_scans_document_id", "scans", ["document_id"])
    op.create_index("ix_scans_status", "scans", ["status"])

    op.create_table(
        "findings",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("scan_id", sa.Uuid(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("finding_type", sa.String(length=128), nullable=False),
        sa.Column("severity", sa.String(length=32), nullable=False),
        sa.Column("confidence", sa.Numeric(5, 4), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("location", _JSON_VALUE, nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="ck_findings_confidence_range",
        ),
        sa.ForeignKeyConstraint(["scan_id"], ["scans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_findings_scan_id", "findings", ["scan_id"])
    op.create_index("ix_findings_category_severity", "findings", ["category", "severity"])

    op.create_table(
        "sanitization_records",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("original_document_id", sa.Uuid(), nullable=False),
        sa.Column("protected_storage_ref", sa.String(length=512), nullable=False),
        sa.Column("applied_actions", _JSON_VALUE, nullable=False),
        sa.Column("verification_status", sa.String(length=32), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["original_document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("protected_storage_ref"),
    )
    op.create_index(
        "ix_sanitization_records_original_document_id",
        "sanitization_records",
        ["original_document_id"],
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("scan_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(length=128), nullable=False),
        sa.Column("event_metadata", _JSON_VALUE, nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["scan_id"], ["scans.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_scan_id", "audit_logs", ["scan_id"])
    op.create_index(
        "ix_audit_logs_event_type_created_at", "audit_logs", ["event_type", "created_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_audit_logs_event_type_created_at", table_name="audit_logs")
    op.drop_index("ix_audit_logs_scan_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_sanitization_records_original_document_id", table_name="sanitization_records")
    op.drop_table("sanitization_records")
    op.drop_index("ix_findings_category_severity", table_name="findings")
    op.drop_index("ix_findings_scan_id", table_name="findings")
    op.drop_table("findings")
    op.drop_index("ix_scans_status", table_name="scans")
    op.drop_index("ix_scans_document_id", table_name="scans")
    op.drop_table("scans")
    op.drop_index("ix_documents_uploaded_at", table_name="documents")
    op.drop_table("documents")
