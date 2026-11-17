from __future__ import annotations

from . import detect_sensitive_content


def analyze_ocr_text(
    text: str,
    *,
    page_number: int | None = None,
) -> list[dict[str, object]]:
    """Analyze OCR output supplied by the extraction pipeline."""
    location = {"page": page_number, "source_type": "ocr"} if page_number is not None else {"source_type": "ocr"}
    return detect_sensitive_content(text, source="ocr_text", location=location)
