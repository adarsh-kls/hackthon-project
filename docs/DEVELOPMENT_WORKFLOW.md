# SENTINEL Development Workflow

## Branches and pull requests

- `main` is the stable release branch; `dev` is the integration branch.
- Work on an assigned feature branch. Do not push directly to `main` or `dev`.
- Submit changes through pull requests, with small, meaningful commits.
- Use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`,
  `docs:`, or `chore:`.

## Backend local development

Use Python 3.12. From `backend/`, install dependencies and start FastAPI:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Set `SENTINEL_DATABASE_URL` and `SENTINEL_CORS_ORIGINS` in the environment or
copy the root `.env.example` to `.env`. The settings loader reads that root
`.env`; wildcard CORS origins are rejected.

With the database configured, run migrations from `backend/`:

```powershell
python -m alembic upgrade head
```

Run backend tests and Ruff from the repository root:

```powershell
python -m pytest -c backend/pytest.ini
python -m ruff check backend
```

## Change sequence

1. Read `AGENTS.md` and relevant project documentation.
2. Inspect ownership, existing code, and current branch/worktree.
3. Propose implementation, affected files, dependencies, interfaces, and
   security considerations; obtain approval for major work.
4. Agree shared API and findings contracts with affected owners before
   implementation.
5. Implement within ownership, add focused tests, and update documentation.
6. Run tests, lint, and relevant integration/security checks.
7. Review through a pull request before merging.

## Definition of done

Implementation, tests, error handling, documentation, contract compatibility,
and integration verification are required. A locally working but
non-integrated module is not complete.