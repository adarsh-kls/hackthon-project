# SENTINEL

SENTINEL is an AI-powered data protection and threat detection platform. The
backend is a Python 3.12 FastAPI modular monolith, integrated with the React
web application and Chrome extension through REST/JSON.

## Backend development

From `backend/`, install the declared dependencies and run the application:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The health endpoint is `GET /api/v1/health`. Run backend tests from the
repository root with `python -m pytest -c backend/pytest.ini`, or run Ruff with
`python -m ruff check backend`.

## Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API specification and contract status](docs/API_SPECIFICATION.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Module ownership](docs/MODULE_OWNERSHIP.md)
- [Development workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Agent instructions](AGENTS.md)
