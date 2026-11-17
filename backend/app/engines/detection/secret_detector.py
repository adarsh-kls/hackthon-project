from __future__ import annotations

import re

from .finding import Finding, build_finding

_SECRET_PATTERNS = (
    ("AWS_ACCESS_KEY", re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "CRITICAL"),
    ("GITHUB_TOKEN", re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"), "HIGH"),
    ("JWT_TOKEN", re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b"), "HIGH"),
    ("PRIVATE_KEY", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"), "CRITICAL"),
    (
        "DATABASE_CONNECTION_STRING",
        re.compile(r"\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://[^\s\"']+"),
        "CRITICAL",
    ),
    (
        "GENERIC_SECRET",
        re.compile(
            r"(?i)\b(?:api[_ -]?key|access[_ -]?token|client[_ -]?secret|password)\b"
            r"\s*[:=]\s*[\"']?([A-Za-z0-9_./+=-]{8,})"
        ),
        "HIGH",
    ),
)


def detect_secrets(
    text: str,
    *,
    source: str = "document_content",
    location: dict[str, object] | None = None,
) -> list[Finding]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    findings: list[Finding] = []
    for finding_type, pattern, severity in _SECRET_PATTERNS:
        for match in pattern.finditer(text):
            value = match.group(0)
            if finding_type == "GENERIC_SECRET" and len(value.rsplit("=", 1)[-1].strip(" \"'")) < 8:
                continue
            findings.append(
                build_finding(
                    category="SECRET",
                    finding_type=finding_type,
                    severity=severity,
                    confidence=0.97 if finding_type != "GENERIC_SECRET" else 0.82,
                    source=source,
                    location=location,
                    value=value,
                    description=f"Potential {finding_type.replace('_', ' ').lower()} detected",
                    recommendation="Revoke or rotate the credential before sharing",
                )
            )
    return findings
