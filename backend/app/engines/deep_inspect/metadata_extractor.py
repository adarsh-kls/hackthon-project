"""Shared metadata extraction helpers.

The function ``extract_basic_metadata`` returns a dictionary with a few common
attributes (size, modification/creation timestamps, and a SHA‑256 checksum).
It does **not** read any file content, so it works for any binary type and
avoids loading large files into memory.
"""

import pathlib
import hashlib
import json
from typing import Dict, Any

def _sha256(file_path: pathlib.Path) -> str:
    """Calculate a SHA‑256 checksum for *file_path* in a memory‑efficient way."""
    h = hashlib.sha256()
    with file_path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def extract_basic_metadata(file_path: pathlib.Path) -> Dict[str, Any]:
    """Return a small metadata dictionary for *file_path*.

    The dictionary is deliberately tiny – only the fields that are useful for
    the deep‑inspect engine and that do not require parsing the file format.
    """
    stat = file_path.stat()
    return {
        "size_bytes": stat.st_size,
        "modified": stat.st_mtime,
        "created": stat.st_ctime,
        "sha256": _sha256(file_path),
    }
