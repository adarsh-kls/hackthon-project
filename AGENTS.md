# SENTINEL Agent Instructions

## Before changing code

1. Read the root README and relevant documentation in `docs/`.
2. Inspect the current branch, worktree, module ownership, and existing code.
3. Keep changes within the assigned ownership area. Coordinate before touching
   another member's files or changing shared contracts.
4. Present a plan and wait for approval before major implementation.

## Technology and architecture

- Backend and document-intelligence engines use Python 3.12.
- Frontend and Chrome extension use TypeScript.
- The backend is a FastAPI modular monolith using PostgreSQL, SQLAlchemy 2.0,
  Pydantic v2, Alembic, pytest, and Ruff.
- APIs use REST/JSON under `/api/v1`; uploads use multipart form data.
- Follow `docs/API_SPECIFICATION.md` and the approved shared findings contract.
  Do not invent endpoint names or independently change response schemas.
- Do not add a competing service, database, framework, or duplicate capability.

## Security

- Treat uploaded files and external URLs as untrusted.
- Never execute uploaded content, overwrite originals, or silently transfer
  documents.
- Do not log raw sensitive values or commit secrets, private documents, or
  unnecessary generated binaries.
- Validate inputs, handle failures explicitly, and do not claim protection or
  security beyond what has been verified.

## Verification and delivery

- Add focused tests for behavior introduced or fixed.
- Run the relevant tests, Ruff checks, and integration checks.
- Update the relevant documentation with approved changes.
- Keep commits small and meaningful; changes reach `main` and `dev` only
  through reviewed pull requests.