# SENTINEL Architecture

## Architecture

SENTINEL is a modular monolith. One FastAPI application coordinates document
inspection, detection, URL/QR analysis, risk assessment, protection, reporting,
and audit history. Backend engines are Python modules imported by this
application; they are not separately deployed services. PostgreSQL is the
shared database. The React frontend and Chrome extension communicate with the
backend using REST/JSON.

The backend API prefix is `/api/v1`. Uploads use `multipart/form-data`;
structured request and response bodies use JSON and Pydantic schemas.

## Current repository layout

- `backend/app/api/`: versioned FastAPI routers and route handlers.
- `backend/app/core/`: shared configuration and core application concerns.
- `backend/app/database/`: SQLAlchemy base/session and Alembic migrations.
- `backend/app/models/`: persistence models split by entity.
- `backend/app/schemas/`: Pydantic API schemas.
- `backend/app/services/`: orchestration, storage, and reporting services.
- `backend/app/engines/`: in-process inspection, detection, LinkShield,
  risk, and protection modules, respecting member ownership.
- `backend/tests/unit/` and `backend/tests/integration/`: backend tests.
- `shared/contracts/` and `shared/types/`: team-coordinated shared interfaces.

## Implemented foundation

The backend creates the FastAPI application, serves process liveness at
`GET /api/v1/health`, validates configured CORS origins, provides PostgreSQL
session configuration, and defines initial document, scan, finding,
sanitization, and audit-log models with an Alembic migration.

Document uploads, storage, scanning, reports, risk scoring, sanitization,
and engine integrations are not implemented by this foundation. See
[API_SPECIFICATION.md](API_SPECIFICATION.md) for contract status.

## Security constraints

- Uploaded content and external URLs are untrusted.
- Originals must be retained unchanged; protected outputs are separate files.
- URL inspection must deny loopback, private, link-local, and cloud metadata
  destinations and apply network and resource timeouts.
- CORS origins are explicit environment configuration; wildcard origins are
  rejected.
- Sensitive values must not be written to logs or unnecessary database fields.