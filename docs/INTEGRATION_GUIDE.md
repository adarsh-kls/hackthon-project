# SENTINEL Integration Guide

The backend is a single FastAPI application. Start it from `backend/` with
`python -m uvicorn app.main:app --reload`; it serves OpenAPI at `/docs` and
process liveness at `GET /api/v1/health`.

The current foundation does not yet invoke M2/M3 engines or implement document
upload, scan, risk, reporting, or protection workflows. The shared findings
and engine API contracts must be approved with the relevant owners before
those integrations are implemented. The current endpoint status is tracked in
[API_SPECIFICATION.md](API_SPECIFICATION.md), and ownership is in
[MODULE_OWNERSHIP.md](MODULE_OWNERSHIP.md).