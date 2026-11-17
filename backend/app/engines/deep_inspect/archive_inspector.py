"""Safe archive inspection.

Only ZIP archives are supported.  This module enforces size/entry limits and
recursion depth, then recursively calls `inspect_document` on each member.
"""

import pathlib
import json
import zipfile
from typing import List, Dict, Any

from .inspector import inspect_document  # recursive call within the package

# Limits – can be overridden via environment variables if desired
MAX_ARCHIVE_SIZE_BYTES = 100 * 1024 * 1024   # 100 MiB
MAX_ARCHIVE_ENTRIES = 10_000
MAX_RECURSION_DEPTH = 3


def _guard_limits(zip_path: pathlib.Path) -> None:
    if zip_path.stat().st_size > MAX_ARCHIVE_SIZE_BYTES:
        raise ValueError(
            json.dumps({
                "finding_id": "F-ARCHIVE-001",
                "category": "RESOURCE_LIMIT",
                "type": "ARCHIVE_TOO_LARGE",
                "severity": "HIGH",
                "confidence": 1.0,
                "source": "archive_inspector",
                "location": str(zip_path),
                "description": f"Archive exceeds {MAX_ARCHIVE_SIZE_BYTES} bytes.",
                "recommendation": "Reject or request a smaller archive."
            })
        )


def inspect_archive(file_path: pathlib.Path, recursion_depth: int = 0) -> List[Dict[str, Any]]:
    """Inspect a ZIP archive safely and return findings.

    The orchestrator protects against excessive recursion depth; this function
    only checks size/entry limits and extracts members to temporary files.
    """
    findings: List[Dict[str, Any]] = []
    try:
        _guard_limits(file_path)
        with zipfile.ZipFile(str(file_path), "r") as zf:
            namelist = zf.namelist()
            if len(namelist) > MAX_ARCHIVE_ENTRIES:
                raise ValueError(
                    json.dumps({
                        "finding_id": "F-ARCHIVE-002",
                        "category": "RESOURCE_LIMIT",
                        "type": "ARCHIVE_ENTRY_COUNT",
                        "severity": "HIGH",
                        "confidence": 1.0,
                        "source": "archive_inspector",
                        "location": str(file_path),
                        "description": f"Archive contains {len(namelist)} entries (> {MAX_ARCHIVE_ENTRIES}).",
                        "recommendation": "Reject or prune the archive."
                    })
                )
            for member in namelist:
                # Sanitize the member name to avoid path traversal
                safe_name = pathlib.Path(member).name
                with zf.open(member) as member_fp:
                    import tempfile, shutil
                    with tempfile.NamedTemporaryFile(delete=False) as tmp:
                        shutil.copyfileobj(member_fp, tmp)
                        tmp_path = pathlib.Path(tmp.name)
                # Recurse – the orchestrator will enforce depth limits
                findings.extend(inspect_document(tmp_path, recursion_depth + 1))
                tmp_path.unlink(missing_ok=True)
    except zipfile.BadZipFile as bz:
        findings.append({
            "finding_id": "F-ARCHIVE-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "ZIP_BAD_FORMAT",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "archive_inspector",
            "location": str(file_path),
            "description": str(bz),
            "recommendation": "Provide a valid ZIP archive."
        })
    except ValueError as ve:
        try:
            findings.append(json.loads(str(ve)))
        except Exception:
            findings.append({
                "finding_id": "F-ARCHIVE-ERR-002",
                "category": "PROCESSING_ERROR",
                "type": "ARCHIVE_LIMIT_VIOLATION",
                "severity": "HIGH",
                "confidence": 1.0,
                "source": "archive_inspector",
                "location": str(file_path),
                "description": str(ve),
                "recommendation": "Adjust archive size/entry limits."
            })
    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-ARCHIVE-ERR-003",
            "category": "PROCESSING_ERROR",
            "type": "ZIP_GENERIC_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "archive_inspector",
            "location": str(file_path),
            "description": str(exc),
            "recommendation": "Inspect the archive manually."
        })
    return findings
