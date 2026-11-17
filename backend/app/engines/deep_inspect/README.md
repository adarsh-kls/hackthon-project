# Deep Inspect Engine (`backend/app/engines/deep_inspect`)

## Purpose
The **Deep Inspect** engine performs exhaustive forensic analysis of user‑uploaded
documents. Findings are emitted in the **shared SENTINEL finding contract** so
 downstream risk, detection, sanitisation, and reporting modules can consume
 them uniformly.

## Supported formats
| Type | Extension | Main inspector |
|------|-----------|----------------|
| PDF  | `.pdf`    | `pdf_inspector.py` |
| Word | `.docx`   | `docx_inspector.py` |
| Excel| `.xlsx`   | `excel_inspector.py` |
| PowerPoint | `.pptx` | `pptx_inspector.py` |
| Image | `.png`, `.jpg`, `.jpeg` | `image_inspector.py` |
| Archive | `.zip` | `archive_inspector.py` (recurses into embedded files) |

## Resource limits (configurable via env vars)
- **Maximum file size** – 50 MiB (`MAX_FILE_SIZE_BYTES` in `inspector.py`).
- **Maximum archive size** – 100 MiB (`MAX_ARCHIVE_SIZE_BYTES`).
- **Maximum archive entries** – 10 000 (`MAX_ARCHIVE_ENTRIES`).
- **Recursion depth** – 3 (`MAX_RECURSION_DEPTH`).

Exceeding a limit produces a `RESOURCE_LIMIT` finding rather than a hard
failure.

## Security guarantees
- No JavaScript execution, URL fetching, or external network calls.
- All temporary files are created inside `tempfile.TemporaryDirectory()` and
  removed automatically.
- Path traversal is prevented by sanitising extracted member names.
- Errors are never exposed to the API layer; they are transformed into a
  `PROCESSING_ERROR` finding.

## Adding a new format
1. Create `<format>_inspector.py` exposing `inspect_<format>(file_path: Path)`.
2. Import the function in `inspector.py` and add a dispatch case based on MIME
   type.
3. Write unit tests in `tests/unit/test_deep_inspect.py`.

## Running tests
```bash
cd backend
pytest -q tests/unit/test_deep_inspect.py
```

## Dependencies (pinned)
```
# backend/requirements.txt
pymupdf==1.24.2
pikepdf==9.2.0
python-docx==1.1.0
openpyxl==3.1.5
python-pptx==0.6.23
pillow==10.3.0
pytesseract==0.3.13
opencv-python==4.9.0.80
pyzbar==0.1.9
exifread==3.0.0
python-magic==0.4.27
```

*All dependencies are listed in `backend/requirements.txt` and are installed
 during the CI build.*
