"""Recursive handling of embedded files.

The engine may encounter embedded Office documents or PDFs.  This module
provides a thin wrapper that calls the top‑level `inspect_document` while
respecting the global recursion depth limit.
"""

import pathlib
from typing import List, Dict, Any

from .inspector import inspect_document


def inspect_embedded(file_path: pathlib.Path, parent_path: pathlib.Path, depth: int) -> List[Dict[str, Any]]:
    """Inspect an *embedded* file.

    - ``parent_path`` is used only for the locating description.
    - ``depth`` is the current recursion depth; the orchestrator will enforce
      ``MAX_RECURSION_DEPTH`` before we get here.
    """
    findings: List[Dict[str, Any]] = []
    try:
        findings.extend(inspect_document(file_path, recursion_depth=depth + 1))
    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-EMBED-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "EMBEDDED_INSPECTION_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "embedded_files",
            "location": str(parent_path),
            "description": f"Failed to inspect embedded file {file_path}: {exc}",
            "recommendation": "Inspect the embedded file manually."
        })
    return findings
