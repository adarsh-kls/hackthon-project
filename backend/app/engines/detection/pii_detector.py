from __future__ import annotations

import re
from collections.abc import Iterator

from .finding import Finding, build_finding
from .nlp_classifier import classify_context

_PATTERNS = {
    "AADHAAR_NUMBER": re.compile(r"(?<!\d)(?:\d{4}[- ]?){2}\d{4}(?!\d)"),
    "PAN_NUMBER": re.compile(r"(?<![A-Z0-9])[A-Z]{5}\d{4}[A-Z](?![A-Z0-9])", re.IGNORECASE),
    "EMAIL_ADDRESS": re.compile(
        r"(?<![\w.+-])[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+(?![\w.-])",
        re.IGNORECASE,
    ),
    "PHONE_NUMBER": re.compile(r"(?<!\w)(?:\+?\d[\d ()-]{8,}\d)(?!\w)"),
    "PAYMENT_CARD": re.compile(r"(?<!\d)(?:\d[ -]?){13,19}(?!\d)"),
    "PASSPORT_LIKE": re.compile(r"(?<![A-Z0-9])[A-Z]{1,2}\d{6,8}(?![A-Z0-9])", re.IGNORECASE),
    "IBAN": re.compile(r"(?<![A-Z0-9])[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}(?![A-Z0-9])", re.IGNORECASE),
}


def _luhn_valid(value: str) -> bool:
    digits = [int(char) for char in value if char.isdigit()]
    if not 13 <= len(digits) <= 19 or len(set(digits)) == 1:
        return False
    checksum = 0
    parity = len(digits) % 2
    for index, digit in enumerate(digits):
        if index % 2 == parity:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


def _aadhaar_valid(value: str) -> bool:
    digits = re.sub(r"\D", "", value)
    return len(digits) == 12 and digits[0] not in "01" and len(set(digits)) > 2


def _pan_valid(value: str) -> bool:
    return bool(re.fullmatch(r"[A-Z]{5}\d{4}[A-Z]", value, re.IGNORECASE)) and value[3].upper() in "PFCHAITL"


def _iban_valid(value: str) -> bool:
    compact = re.sub(r"\s+", "", value).upper()
    if not 15 <= len(compact) <= 34 or not re.fullmatch(r"[A-Z]{2}\d{2}[A-Z0-9]+", compact):
        return False
    rotated = compact[4:] + compact[:4]
    numeric = "".join(str(ord(char) - 55) if char.isalpha() else char for char in rotated)
    return int(numeric) % 97 == 1


def _phone_valid(value: str) -> bool:
    digits = re.sub(r"\D", "", value)
    return 10 <= len(digits) <= 15 and len(set(digits)) > 2


def _iter_matches(text: str) -> Iterator[tuple[str, str]]:
    for finding_type, pattern in _PATTERNS.items():
        for match in pattern.finditer(text):
            value = match.group(0)
            valid = {
                "AADHAAR_NUMBER": _aadhaar_valid,
                "PAN_NUMBER": _pan_valid,
                "PAYMENT_CARD": _luhn_valid,
                "IBAN": _iban_valid,
                "PHONE_NUMBER": _phone_valid,
            }.get(finding_type, lambda _: True)
            if valid(value):
                yield finding_type, value


def detect_pii(
    text: str,
    *,
    source: str = "document_content",
    location: dict[str, object] | None = None,
) -> list[Finding]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    findings: list[Finding] = []
    for finding_type, value in _iter_matches(text):
        severity = "HIGH" if finding_type in {"AADHAAR_NUMBER", "PAN_NUMBER", "PAYMENT_CARD", "IBAN"} else "MEDIUM"
        confidence = 0.96 if finding_type in {"AADHAAR_NUMBER", "PAN_NUMBER", "PAYMENT_CARD", "IBAN"} else 0.9
        start = text.find(value)
        context = classify_context(text, start, start + len(value))
        confidence = max(0.5, min(0.99, confidence + float(context["adjustment"])))
        findings.append(
            build_finding(
                category="PII",
                finding_type=finding_type,
                severity=severity,
                confidence=confidence,
                source=source,
                location=location,
                value=value,
                description=(
                    f"Potential {finding_type.replace('_', ' ').lower()} detected "
                    f"in {context['label'].replace('_', ' ')} context"
                ),
                recommendation="Redact before sharing",
            )
        )
    return findings
