from __future__ import annotations

import re

PUBLIC_CONTEXT = re.compile(r"\b(?:support|sales|contact|company|office|public|helpdesk)\b", re.IGNORECASE)
PERSONAL_CONTEXT = re.compile(r"\b(?:personal|employee|private|home|emergency|confidential)\b", re.IGNORECASE)


def classify_context(text: str, start: int, end: int, *, window: int = 80) -> dict[str, object]:
    """Classify nearby wording without sending document text to an external model."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    if not 0 <= start <= end <= len(text):
        raise ValueError("start and end must identify a range in text")

    context = text[max(0, start - window) : min(len(text), end + window)]
    personal = len(PERSONAL_CONTEXT.findall(context))
    public = len(PUBLIC_CONTEXT.findall(context))
    if personal > public:
        return {"label": "personal_sensitive", "confidence": 0.86, "adjustment": 0.08}
    if public > personal:
        return {"label": "public_contact", "confidence": 0.8, "adjustment": -0.12}
    return {"label": "undetermined", "confidence": 0.5, "adjustment": 0.0}
