from __future__ import annotations

from .nlp_classifier import classify_context


def classify_finding_context(
    text: str,
    *,
    start: int,
    end: int,
) -> dict[str, object]:
    """Public context-analysis interface for orchestration and future NLP models."""
    return classify_context(text, start, end)
