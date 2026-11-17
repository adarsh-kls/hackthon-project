from __future__ import annotations

import ipaddress
import re
from urllib.parse import parse_qsl, urlsplit

from ..detection.finding import Finding, build_finding

_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"}
_SUSPICIOUS_QUERY_KEYS = {"redirect", "url", "target", "next", "return", "continue", "cmd", "exec"}
_BRAND_NAMES = {"paypal", "microsoft", "google", "apple", "amazon", "銀行"}


def _finding(url: str, finding_type: str, severity: str, confidence: float, description: str) -> Finding:
    return build_finding(
        category="LINK",
        finding_type=finding_type,
        severity=severity,
        confidence=confidence,
        source="url",
        location={"url_host": urlsplit(url).hostname or ""},
        value=url,
        description=description,
        recommendation="Do not open the link; verify the destination through a trusted channel",
    )


def analyze_url(url: str) -> list[Finding]:
    if not isinstance(url, str):
        raise TypeError("url must be a string")
    parsed = urlsplit(url)
    findings: list[Finding] = []
    if parsed.scheme.lower() not in {"http", "https"} or not parsed.hostname:
        return [
            _finding(url, "INVALID_URL", "MEDIUM", 0.99, "URL is not a valid HTTP(S) link")
        ]

    host = parsed.hostname.rstrip(".").lower()
    try:
        host_ip = ipaddress.ip_address(host)
    except ValueError:
        host_ip = None
    if host_ip is not None:
        findings.append(_finding(url, "IP_ADDRESS_URL", "HIGH", 0.93, "URL uses an IP address instead of a domain"))
    if host in _SHORTENERS:
        findings.append(_finding(url, "URL_SHORTENER", "MEDIUM", 0.98, "URL uses a shortening service"))
    if host.startswith("xn--") or ".xn--" in host:
        findings.append(_finding(url, "PUNYCODE_DOMAIN", "HIGH", 0.95, "URL uses an internationalized punycode domain"))
    if parsed.username or parsed.password:
        findings.append(_finding(url, "URL_USERINFO", "HIGH", 0.97, "URL contains deceptive user-information syntax"))
    if host.count(".") >= 4:
        findings.append(_finding(url, "DEEP_SUBDOMAIN", "MEDIUM", 0.76, "URL contains an unusually deep subdomain"))
    if re.search(r"[%\u0000-\u001f]", url) or any(char in url for char in ("@", "\\")):
        findings.append(_finding(url, "UNUSUAL_URL_CHARACTER", "MEDIUM", 0.84, "URL contains an unusual or deceptive character"))
    if any(key.lower() in _SUSPICIOUS_QUERY_KEYS for key, _ in parse_qsl(parsed.query, keep_blank_values=True)):
        findings.append(_finding(url, "SUSPICIOUS_REDIRECT_PARAMETER", "MEDIUM", 0.82, "URL contains a redirect-like query parameter"))
    labels = set(re.split(r"[^a-z0-9]+", host))
    for brand in _BRAND_NAMES:
        if brand in labels and not host.endswith(f"{brand}.com"):
            findings.append(_finding(url, "LOOKALIKE_DOMAIN", "HIGH", 0.87, "Domain contains a brand name outside its expected domain"))
            break
    return findings


def analyze_urls(urls: list[str]) -> list[Finding]:
    if not isinstance(urls, list):
        raise TypeError("urls must be a list of strings")
    findings: list[Finding] = []
    for url in urls:
        findings.extend(analyze_url(url))
    return findings
