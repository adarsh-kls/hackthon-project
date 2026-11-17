"""Image inspection utilities.

Extracts EXIF metadata (via `exifread`), runs OCR (`pytesseract`) and QR‑code
 detection (`pyzbar`). Findings conform to the SENTINEL finding contract.
"""

import pathlib
import json
from typing import List, Dict, Any

from PIL import Image  # pillow
import exifread
import pytesseract
from pyzbar.pyzbar import decode as qr_decode

from .metadata_extractor import extract_basic_metadata


def _extract_exif(file_path: pathlib.Path) -> Dict[str, Any]:
    """Extract a subset of EXIF tags from an image file."""
    with file_path.open("rb") as f:
        tags = exifread.process_file(f, details=False)
    # Keep only a few useful tags
    selected = {}
    for tag in (
        "Image Make",
        "Image Model",
        "EXIF DateTimeOriginal",
        "EXIF Artist",
        "EXIF Copyright",
    ):
        if tag in tags:
            selected[tag] = str(tags[tag])
    return selected


def _run_ocr(img: Image.Image) -> str:
    """Run OCR on the provided Pillow image and return plain text."""
    return pytesseract.image_to_string(img)


def _detect_qrcodes(img: Image.Image) -> List[str]:
    """Return a list of decoded QR code strings from the image."""
    return [code.data.decode("utf-8") for code in qr_decode(img)]


def inspect_image(file_path: pathlib.Path) -> List[Dict[str, Any]]:
    """Inspect an image file (PNG, JPEG, etc.) and return findings."""
    findings: List[Dict[str, Any]] = []
    try:
        meta = extract_basic_metadata(file_path)
        if meta:
            findings.append({
                "finding_id": "F-IMG-META-001",
                "category": "METADATA",
                "type": "IMAGE_METADATA",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "image_inspector",
                "location": str(file_path),
                "description": f"Image metadata: {meta}",
                "recommendation": "Review metadata for privacy‑relevant fields.",
            })

        img = Image.open(str(file_path))

        # EXIF metadata
        exif = _extract_exif(file_path)
        if exif:
            findings.append({
                "finding_id": "F-IMG-EXIF-001",
                "category": "METADATA",
                "type": "EXIF",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "image_inspector",
                "location": str(file_path),
                "description": f"EXIF data: {exif}",
                "recommendation": "Sanitize EXIF before sharing if needed.",
            })

        # OCR – only add a finding when text is detected
        ocr_text = _run_ocr(img).strip()
        if ocr_text:
            findings.append({
                "finding_id": "F-IMG-OCR-001",
                "category": "CONTENT",
                "type": "OCR_TEXT",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "image_inspector",
                "location": str(file_path),
                "description": "OCR extracted visible text.",
                "recommendation": "Pass OCR text to downstream analysis.",
            })

        # QR codes
        codes = _detect_qrcodes(img)
        for code in codes:
            findings.append({
                "finding_id": f"F-IMG-QR-{code[:8]}",
                "category": "LINK",
                "type": "QR_CODE",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "image_inspector",
                "location": str(file_path),
                "description": f"QR code detected: {code}",
                "recommendation": "Validate QR target before opening.",
            })

        # Simple size heuristic – flag very high‑resolution images
        if img.width * img.height > 5_000_000:  # >5 MP
            findings.append({
                "finding_id": "F-IMG-LARGE-001",
                "category": "CONTENT",
                "type": "HIGH_RESOLUTION",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "image_inspector",
                "location": str(file_path),
                "description": "Image resolution exceeds 5 MP; may contain detailed data.",
                "recommendation": "Consider down‑sampling if high resolution is unnecessary.",
            })

    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-IMG-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "IMAGE_PARSE_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "image_inspector",
            "location": str(file_path),
            "description": str(exc),
            "recommendation": "Ensure the file is a valid image.",
        })
    return findings
