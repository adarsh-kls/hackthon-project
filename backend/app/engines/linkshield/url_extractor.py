from __future__ import annotations

import re
from collections.abc import Iterable
from urllib.parse import urlsplit

_URL_PATTERN = re.compile(r"(?i)\bhttps?://[^\s<>\[\]{}\"']+")


def extract_urls(values: str | Iterable[str]) -> list[str]:
    """Extract and de-duplicate HTTP(S) URLs from text or supplied URL values."""
    candidates = [values] if isinstance(values, str) else values
    result: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        if not isinstance(candidate, str):
            raise TypeError("URL sources must contain strings")
        matches = _URL_PATTERN.findall(candidate)
        if not matches and urlsplit(candidate).scheme.lower() in {"http", "https"}:
            matches = [candidate]
        for value in matches:
            normalized = value.rstrip(".,;:!?)]}")
            if normalized not in seen:
                seen.add(normalized)
                result.append(normalized)
    return result
