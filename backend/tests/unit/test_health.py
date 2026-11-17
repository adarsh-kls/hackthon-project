import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.main import app
from app.models import Base, Document, Finding, Scan

client = TestClient(app)


def test_health_returns_documented_liveness_response() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_settings_reject_wildcard_cors_origin() -> None:
    with pytest.raises(ValidationError, match="Wildcard CORS origins are not allowed"):
        Settings(cors_origins=["*"])


def test_database_entities_persist_relationships() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        document = Document(
            original_filename="synthetic.pdf",
            file_type="application/pdf",
            file_size=128,
            storage_ref="documents/test",
        )
        scan = Scan(document=document, analysis_stages={"deep_inspect": "completed"})
        scan.findings.append(
            Finding(
                category="synthetic",
                finding_type="test",
                severity="low",
                confidence=0.95,
                source="test",
                description="Synthetic test finding",
            )
        )
        session.add(scan)
        session.commit()

        assert document.scans[0].findings[0].description == "Synthetic test finding"
