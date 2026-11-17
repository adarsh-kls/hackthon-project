from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from urllib.parse import urlsplit

import httpx


@dataclass(frozen=True)
class ReputationResult:
    status: str
    source: str
    confidence: float
    explanation: str


class ReputationProvider:
    def check(self, url: str) -> ReputationResult:
        raise NotImplementedError


class LocalHeuristicReputation(ReputationProvider):
    """Explicitly local assessment; it is not an external malicious verdict."""

    def check(self, url: str) -> ReputationResult:
        parsed = urlsplit(url)
        host = (parsed.hostname or "").lower()
        if not host or parsed.scheme not in {"http", "https"}:
            return ReputationResult("unknown", "local_heuristic", 0.99, "Invalid HTTP(S) URL")
        if host.endswith((".zip", ".mov")) or host.count(".") > 4:
            return ReputationResult(
                "suspicious",
                "local_heuristic",
                0.65,
                "Local heuristic matched domain indicators",
            )
        return ReputationResult(
            "unknown",
            "local_heuristic",
            0.5,
            "No local indicator matched; external reputation was not checked",
        )


class VirusTotalReputation(ReputationProvider):
    def __init__(self, api_key: str, *, client: httpx.Client | None = None) -> None:
        if not api_key.strip():
            raise ValueError("VirusTotal API key must not be empty")
        self._api_key = api_key
        self._client = client

    def check(self, url: str) -> ReputationResult:
        if urlsplit(url).scheme not in {"http", "https"}:
            return ReputationResult("unknown", "virustotal", 0.99, "Invalid HTTP(S) URL")
        client = self._client or httpx.Client(timeout=5.0)
        close_client = self._client is None
        try:
            response = client.post(
                "https://www.virustotal.com/api/v3/urls",
                headers={"x-apikey": self._api_key},
                data={"url": url},
            )
            response.raise_for_status()
            payload: dict[str, Any] = response.json()
            analysis_id = payload.get("data", {}).get("id")
            if not isinstance(analysis_id, str):
                return ReputationResult("unknown", "virustotal", 0.0, "VirusTotal returned no analysis ID")
            return ReputationResult(
                "submitted",
                "virustotal",
                0.5,
                "URL submitted to VirusTotal; analysis result requires a separate lookup",
            )
        except (httpx.HTTPError, OSError, RuntimeError, ValueError, TypeError, AttributeError) as exc:
            return ReputationResult("unavailable", "virustotal", 0.0, f"VirusTotal request failed: {type(exc).__name__}")
        finally:
            if close_client:
                client.close()


class GoogleSafeBrowsingReputation(ReputationProvider):
    def __init__(self, api_key: str, *, client: httpx.Client | None = None) -> None:
        if not api_key.strip():
            raise ValueError("Google Safe Browsing API key must not be empty")
        self._api_key = api_key
        self._client = client

    def check(self, url: str) -> ReputationResult:
        if urlsplit(url).scheme not in {"http", "https"}:
            return ReputationResult("unknown", "google_safe_browsing", 0.99, "Invalid HTTP(S) URL")
        client = self._client or httpx.Client(timeout=5.0)
        close_client = self._client is None
        payload = {
            "client": {"clientId": "sentinel", "clientVersion": "1.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}],
            },
        }
        try:
            response = client.post(
                "https://safebrowsing.googleapis.com/v4/threatMatches:find",
                params={"key": self._api_key},
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            malicious = bool(result.get("matches"))
            return ReputationResult(
                "malicious" if malicious else "clean",
                "google_safe_browsing",
                0.99 if malicious else 0.9,
                "Google Safe Browsing returned a threat match"
                if malicious
                else "Google Safe Browsing returned no threat match",
            )
        except (httpx.HTTPError, OSError, RuntimeError, ValueError, TypeError, AttributeError) as exc:
            return ReputationResult(
                "unavailable",
                "google_safe_browsing",
                0.0,
                f"Google Safe Browsing request failed: {type(exc).__name__}",
            )
        finally:
            if close_client:
                client.close()
