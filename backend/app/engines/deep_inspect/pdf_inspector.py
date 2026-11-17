"""PDF inspection utilities.

The function ``inspect_pdf`` returns a list of findings that conform to the
shared SENTINEL finding contract.  Only a subset of the required checks is
implemented here – the rest can be added later without changing the public
interface.
"""

import pathlib
import json
from typing import List, Dict, Any

import fitz  # PyMuPDF
import pikepdf

from .metadata_extractor import extract_basic_metadata

def _find_javascript(pdf: pikepdf.Pdf) -> List[Dict[str, Any]]:
    """Detect JavaScript actions in a PDF.

    PDF JavaScript is stored in the ``/JavaScript`` name tree.  We walk the
    catalog and record any entries we encounter.
    """
    findings: List[Dict[str, Any]] = []
    try:
        js_tree = pdf.Root.get("/Names", {}).get("/JavaScript", {})
        if js_tree:
            # ``/Names`` is a flat list [key1, obj1, key2, obj2, ...]
            names = js_tree.get("/Names", [])
            for i in range(0, len(names), 2):
                name = names[i]
                obj = names[i + 1]
                findings.append({
                    "finding_id": f"F-PDF-JS-{name}",
                    "category": "POTENTIAL_MALWARE",
                    "type": "PDF_JAVASCRIPT",
                    "severity": "HIGH",
                    "confidence": 1.0,
                    "source": "pdf_inspector",
                    "location": str(name),
                    "description": "PDF contains embedded JavaScript which may be malicious.",
                    "recommendation": "Review and remove JavaScript before accepting the document.",
                })
    except Exception:  # pragma: no cover
        pass
    return findings

def _find_embedded_files(pdf: pikepdf.Pdf) -> List[Dict[str, Any]]:
    """Detect embedded files (FileSpec objects) in a PDF.
    Returns a finding per embedded file.
    """
    findings: List[Dict[str, Any]] = []
    try:
        embedded = pdf.Root.get("/Names", {}).get("/EmbeddedFiles", {})
        if embedded:
            names = embedded.get("/Names", [])
            for i in range(0, len(names), 2):
                name = names[i]
                fs = names[i + 1]
                findings.append({
                    "finding_id": f"F-PDF-EMB-{name}",
                    "category": "EMBEDDED_CONTENT",
                    "type": "EMBEDDED_FILE",
                    "severity": "MEDIUM",
                    "confidence": 1.0,
                    "source": "pdf_inspector",
                    "location": str(name),
                    "description": "PDF contains an embedded file.",
                    "recommendation": "Extract and scan the embedded file with appropriate engines.",
                })
    except Exception:  # pragma: no cover
        pass
    return findings

def inspect_pdf(file_path: pathlib.Path) -> List[Dict[str, Any]]:
    """Inspect a PDF document.

    Returns a list of findings compatible with the SENTINEL contract.
    The function is deliberately defensive – any unexpected error is turned
    into a ``PROCESSING_ERROR`` finding.
    """
    findings: List[Dict[str, Any]] = []
    try:
        # --- Basic metadata ---------------------------------------------------
        meta = extract_basic_metadata(file_path)
        if meta:
            findings.append({
                "finding_id": "F-PDF-META-001",
                "category": "METADATA",
                "type": "PDF_METADATA",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "pdf_inspector",
                "location": str(file_path),
                "description": f"PDF metadata: {meta}",
                "recommendation": "Review metadata for sensitive information.",
            })

        # --- Text extraction ---------------------------------------------------
        doc = fitz.open(str(file_path))
        text = "".join(page.get_text() for page in doc)
        if text.strip():
            findings.append({
                "finding_id": "F-PDF-TEXT-001",
                "category": "CONTENT",
                "type": "EXTRACTABLE_TEXT",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "pdf_inspector",
                "location": str(file_path),
                "description": "PDF contains extractable text.",
                "recommendation": "Process the text with downstream analysis engines.",
            })
        else:
            # No extractable text – could be a scanned document (OCR needed)
            findings.append({
                "finding_id": "F-PDF-OCR-001",
                "category": "CONTENT",
                "type": "SCANNED_IMAGE",
                "severity": "MEDIUM",
                "confidence": 1.0,
                "source": "pdf_inspector",
                "location": str(file_path),
                "description": "PDF appears to contain only images; OCR may be required.",
                "recommendation": "Run OCR on each page to extract hidden text.",
            })

        # --- JavaScript -------------------------------------------------------
        with pikepdf.open(str(file_path)) as pdf:
            findings.extend(_find_javascript(pdf))
            findings.extend(_find_embedded_files(pdf))

        # --- Annotations & hyperlinks (lightweight detection) -----------------
        for page in doc:
            for annot in page.annots() or []:
                subtype = annot.type[1] if annot.type else "UNKNOWN"
                findings.append({
                    "finding_id": f"F-PDF-ANNOT-{subtype}",
                    "category": "ANNOTATION",
                    "type": "PDF_ANNOTATION",
                    "severity": "LOW",
                    "confidence": 1.0,
                    "source": "pdf_inspector",
                    "location": f"page_{page.number+1}",
                    "description": f"PDF contains an annotation of type {subtype}.",
                    "recommendation": "Review annotation content for hidden links or data.",
                })

    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-PDF-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "PDF_PARSE_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "pdf_inspector",
            "location": str(file_path),
            "description": str(exc),
            "recommendation": "Ensure the file is a valid PDF and retry.",
        })
    return findings
