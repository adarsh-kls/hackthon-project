from __future__ import annotations

import hashlib
import re
from typing import TypeAlias

Finding: TypeAlias = dict[str, object]


def mask_value(value: str) -> str:
    """Return a stable, non-reversible representation for logs and evidence."""
    normalized = re.sub(r"\s+", "", value)
    if len(normalized) <= 4:
        return "*" * len(normalized)
    return f"{normalized[:2]}***{normalized[-2:]}"


def build_finding(
    *,
    category: str,
    finding_type: str,
    severity: str,
    confidence: float,
    source: str,
    description: str,
    recommendation: str,
    value: str,
    location: dict[str, object] | None = None,
) -> Finding:
    if not 0 <= confidence <= 1:
        raise ValueError("confidence must be between 0 and 1")

    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]
    return {
        "finding_id": f"F-{digest}",
        "category": category,
        "type": finding_type,
        "finding_type": finding_type,
        "severity": severity,
        "confidence": round(confidence, 4),
        "source": source,
        "location": location or {},
        "description": description,
        "recommendation": recommendation,
        "evidence": mask_value(value),
    }
