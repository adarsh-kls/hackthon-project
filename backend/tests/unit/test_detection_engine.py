from app.engines.detection import detect_sensitive_content
from app.engines.detection.nlp_classifier import classify_context
from app.engines.detection.ocr_analyzer import analyze_ocr_text


def test_detects_validated_pii_and_masks_evidence() -> None:
    findings = detect_sensitive_content(
        "PAN ABCPE1234F, card 4111 1111 1111 1111, invalid card 4111 1111 1111 1112"
    )

    assert {finding["type"] for finding in findings} == {"PAN_NUMBER", "PAYMENT_CARD"}
    assert all("***" in finding["evidence"] for finding in findings)


def test_rejects_repeated_or_invalid_identifiers() -> None:
    findings = detect_sensitive_content("0000 0000 0000 0000 12345")

    assert findings == []


def test_context_classifier_distinguishes_personal_context() -> None:
    result = classify_context("Employee personal phone: +91 9876543210", 25, 38)

    assert result["label"] == "personal_sensitive"
    assert result["adjustment"] > 0


def test_public_contact_context_reduces_confidence() -> None:
    findings = detect_sensitive_content("Company support phone: +91 9876543210")

    assert findings[0]["type"] == "PHONE_NUMBER"
    assert findings[0]["confidence"] < 0.9


def test_ocr_source_is_preserved() -> None:
    findings = analyze_ocr_text("Contact: person@example.com", page_number=2)

    assert findings[0]["source"] == "ocr_text"
    assert findings[0]["location"] == {"page": 2, "source_type": "ocr"}


def test_detects_credentials_without_returning_raw_secret() -> None:
    findings = detect_sensitive_content("Authorization: Bearer eyJabcdefgh.ijklmnop.qrstuvwx")

    assert findings[0]["type"] == "JWT_TOKEN"
    assert "eyJabcdefgh" not in str(findings[0])
