# SENTINEL Coding Standards

- Backend and document-intelligence engines use Python 3.12.
- Frontend and Chrome extension use TypeScript.
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2.0, PostgreSQL, Alembic,
  Uvicorn, pytest, and Ruff.
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide React,
  React Router, Axios, and Vitest.
- Extension: Chrome Manifest V3, TypeScript, React, Vite, Tailwind CSS, Zod,
  and Vitest.
- Keep the system a modular monolith and use REST/JSON between clients and the
  backend.
- Validate untrusted input, handle failures explicitly, avoid hardcoded
  secrets, and keep sensitive values out of logs.
- Add focused tests and update directly related documentation.
- Do not introduce duplicate document-processing capabilities or dependencies
  without discussing them with M5.
- Backend dependencies are constrained in `backend/requirements.txt`;
  `backend/ruff.toml` configures Ruff and `backend/pytest.ini` configures test
  discovery.