from .pii_detector import detect_pii
from .secret_detector import detect_secrets
from .context_analyzer import classify_finding_context


def detect_sensitive_content(
    text: str,
    *,
    source: str = "document_content",
    location: dict[str, object] | None = None,
) -> list[dict[str, object]]:
    """Detect validated PII and credential-like secrets in extracted text."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    return [
        *detect_pii(text, source=source, location=location),
        *detect_secrets(text, source=source, location=location),
    ]


__all__ = [
    "classify_finding_context",
    "detect_pii",
    "detect_secrets",
    "detect_sensitive_content",
]
