from __future__ import annotations

import ipaddress
import socket
from collections.abc import Callable
from urllib.parse import urljoin, urlsplit

RedirectGetter = Callable[[str, float], tuple[int, str | None]]


def _is_private_destination(url: str) -> bool:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        return True
    hostname = parsed.hostname.rstrip(".").lower()
    if hostname in {"localhost", "localhost.localdomain"} or hostname.endswith(".local"):
        return True
    try:
        addresses = {info[4][0] for info in socket.getaddrinfo(hostname, None)}
    except socket.gaierror:
        return True
    for address in addresses:
        ip = ipaddress.ip_address(address)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_unspecified:
            return True
    return False


def analyze_redirects(
    url: str,
    *,
    getter: RedirectGetter,
    max_depth: int = 5,
    timeout_seconds: float = 3.0,
) -> list[str]:
    if max_depth < 0 or max_depth > 10:
        raise ValueError("max_depth must be between 0 and 10")
    if timeout_seconds <= 0 or timeout_seconds > 30:
        raise ValueError("timeout_seconds must be between 0 and 30")

    chain: list[str] = []
    current = url
    for _ in range(max_depth + 1):
        if _is_private_destination(current):
            raise ValueError("redirect destination is private, local, or invalid")
        if current in chain:
            raise ValueError("redirect cycle detected")
        chain.append(current)
        status, destination = getter(current, timeout_seconds)
        if status not in {301, 302, 303, 307, 308} or not destination:
            return chain
        current = urljoin(current, destination)
    raise ValueError("redirect depth limit exceeded")
