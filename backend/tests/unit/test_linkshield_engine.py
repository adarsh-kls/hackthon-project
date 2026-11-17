import pytest

from app.engines.linkshield.qr_detector import analyze_qr_codes
from app.engines.linkshield.reputation import (
    GoogleSafeBrowsingReputation,
    LocalHeuristicReputation,
    VirusTotalReputation,
)
from app.engines.linkshield.redirect_analyzer import analyze_redirects
from app.engines.linkshield.url_analyzer import analyze_url
from app.engines.linkshield.url_extractor import extract_urls


def test_extract_urls_deduplicates_and_trims_punctuation() -> None:
    urls = extract_urls("See https://example.com/a, then https://example.com/a.")

    assert urls == ["https://example.com/a"]


def test_url_analyzer_flags_shortener_and_redirect_parameter() -> None:
    findings = analyze_url("https://bit.ly/go?next=https://example.com")

    assert {finding["type"] for finding in findings} == {
        "URL_SHORTENER",
        "SUSPICIOUS_REDIRECT_PARAMETER",
    }


def test_qr_plain_text_is_not_treated_as_url() -> None:
    findings = analyze_qr_codes([b"invite-code"], decoder=lambda _: ["invite-code"])

    assert findings[0]["type"] == "QR_PLAIN_TEXT"
    assert findings[0]["severity"] == "LOW"


def test_qr_url_uses_url_analysis() -> None:
    findings = analyze_qr_codes(
        [b"unused"],
        decoder=lambda _: ["https://192.0.2.10/login"],
    )

    assert findings[0]["type"] == "IP_ADDRESS_URL"


def test_redirect_analysis_rechecks_each_destination(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "app.engines.linkshield.redirect_analyzer._is_private_destination",
        lambda _: False,
    )
    destinations = {
        "https://start.example": (302, "/next"),
        "https://start.example/next": (200, None),
    }

    chain = analyze_redirects(
        "https://start.example",
        getter=lambda url, timeout: destinations[url],
    )

    assert chain == ["https://start.example", "https://start.example/next"]


def test_redirect_depth_is_bounded(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "app.engines.linkshield.redirect_analyzer._is_private_destination",
        lambda _: False,
    )

    with pytest.raises(ValueError, match="depth limit"):
        analyze_redirects(
            "https://start.example",
            getter=lambda url, timeout: (302, "/next"),
            max_depth=1,
        )


def test_local_reputation_is_explicitly_heuristic() -> None:
    result = LocalHeuristicReputation().check("https://safe.example")

    assert result.source == "local_heuristic"
    assert result.status == "unknown"


def test_external_reputation_failure_is_not_malicious() -> None:
    class FailedClient:
        def post(self, *args: object, **kwargs: object) -> object:
            raise RuntimeError("network unavailable")

        def close(self) -> None:
            return None

    provider = VirusTotalReputation("test-key", client=FailedClient())  # type: ignore[arg-type]
    result = provider.check("https://example.com")

    assert result.status == "unavailable"
    assert result.confidence == 0.0


def test_safe_browsing_match_is_classified_from_provider_response() -> None:
    class Response:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict[str, object]:
            return {"matches": [{"threatType": "MALWARE"}]}

    class Client:
        def post(self, *args: object, **kwargs: object) -> Response:
            return Response()

    provider = GoogleSafeBrowsingReputation("test-key", client=Client())  # type: ignore[arg-type]

    assert provider.check("https://example.com").status == "malicious"
