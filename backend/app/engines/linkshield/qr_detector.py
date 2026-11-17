from __future__ import annotations

from collections.abc import Callable, Iterable

from .url_analyzer import analyze_urls
from .url_extractor import extract_urls

QRDecoder = Callable[[bytes], Iterable[str]]


def _default_decoder(_: bytes) -> Iterable[str]:
    try:
        from pyzbar.pyzbar import decode
        import cv2
        import numpy as np
    except ImportError as exc:
        raise RuntimeError("QR decoding requires the approved pyzbar and OpenCV dependencies") from exc

    image = cv2.imdecode(np.frombuffer(_, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("QR image bytes are not a decodable image")
    for result in decode(image):
        yield result.data.decode("utf-8", errors="replace")


def analyze_qr_codes(
    images: Iterable[bytes],
    *,
    decoder: QRDecoder | None = None,
) -> list[dict[str, object]]:
    decoder = decoder or _default_decoder
    findings: list[dict[str, object]] = []
    for image in images:
        if not isinstance(image, bytes):
            raise TypeError("QR images must be bytes")
        decoded = list(decoder(image))
        for value in decoded:
            urls = extract_urls(value)
            if urls:
                findings.extend(analyze_urls(urls))
            else:
                findings.append(
                    {
                        "finding_id": "QR-TEXT",
                        "category": "LINK",
                        "type": "QR_PLAIN_TEXT",
                        "finding_type": "QR_PLAIN_TEXT",
                        "severity": "LOW",
                        "confidence": 0.99,
                        "source": "qr_code",
                        "location": {},
                        "description": "QR code contains non-URL text",
                        "recommendation": "Verify the QR content before sharing or opening it",
                        "evidence": value[:2] + "***" if len(value) > 4 else "***",
                    }
                )
    return findings
