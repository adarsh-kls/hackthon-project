# SENTINEL Database Schema

## Status

The initial M5-owned schema and Alembic migration are implemented at
`backend/app/database/migrations/versions/0001_initial_schema.py`. They cover
the MVP entities below. The migration has not been applied to a live
PostgreSQL instance. This storage schema does not approve or define shared
API/finding contracts. Confirm retention requirements before deployment.

## Entities

- **Documents:** opaque document ID, original filename, validated file type
  and size, private storage reference, upload time, and processing status.
- **Scans:** scan ID, document reference, status, risk score and level, start
  and completion times, and stage completion/failure metadata.
- **Findings:** finding ID, scan reference, approved category/type/severity/
  confidence/source, non-sensitive location metadata, description, and
  recommendation. Raw sensitive values are not stored by default.
- **Sanitization records:** record ID, original document reference, separate
  protected-file reference, applied actions, verification status, and creation
  time.
- **Audit logs:** event ID/type, related scan where applicable, action,
  timestamp, and non-sensitive metadata.
- **Users:** excluded until authentication and user ownership are approved for
  the MVP.

The models use UUID primary keys, foreign keys, nonnegative file-size and
bounded risk/confidence constraints, indexes for common lookups, and explicit
deletion behavior. JSON fields use PostgreSQL JSONB with a generic JSON variant
for unit-test portability. Alembic migrations must be reviewed and verified
against PostgreSQL before deployment.