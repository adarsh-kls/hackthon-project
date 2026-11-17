# SENTINEL Module Ownership

| Member | Owned modules |
| --- | --- |
| M1 | `extension/` |
| M2 | `backend/app/engines/deep_inspect/` |
| M3 | `backend/app/engines/detection/`, `backend/app/engines/linkshield/` |
| M4 | `frontend/` |
| M5 | `backend/app/api/`, `core/`, `database/`, `models/`, `schemas/`, `services/`, `engines/risk/`, `engines/protection/`, `main.py` |

M5 coordinates `shared/contracts/`, `shared/types/`, and `docs/`; shared
interfaces require team approval. Integration does not authorize rewriting
another member's modules. Coordinate first when a change crosses ownership
boundaries.