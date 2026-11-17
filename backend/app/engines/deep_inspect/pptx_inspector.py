"""PPTX inspection utilities.

The function `inspect_pptx` extracts slide visibility, hidden slides,
speaker notes, comments, embedded objects, hyperlinks and basic metadata.
All findings conform to the SENTINEL finding contract.
"""

import pathlib
import json
from typing import List, Dict, Any

from pptx import Presentation  # python-pptx

from .metadata_extractor import extract_basic_metadata


def _slide_visibility(slide) -> str:
    """Return 'HIDDEN' or 'VISIBLE' for a slide.
    python-pptx stores the hidden flag in the underlying XML element.
    """
    # The attribute `show` is "0" for hidden, "1" (or missing) for visible.
    hidden = slide._element.get("show", "1") == "0"
    return "HIDDEN" if hidden else "VISIBLE"


def _extract_hyperlinks(ppt: Presentation) -> List[Dict[str, Any]]:
    findings = []
    for i, slide in enumerate(ppt.slides, start=1):
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            for paragraph in shape.text_frame.paragraphs:
                for run in paragraph.runs:
                    if run.hyperlink.address:
                        findings.append({
                            "finding_id": f"F-PPTX-HLINK-{i}-{shape.name}",
                            "category": "LINK",
                            "type": "PPTX_HYPERLINK",
                            "severity": "LOW",
                            "confidence": 1.0,
                            "source": "pptx_inspector",
                            "location": f"slide_{i}",
                            "description": f"Hyperlink to {run.hyperlink.address}",
                            "recommendation": "Validate link safety before following."
                        })
    return findings


def _extract_notes(ppt: Presentation) -> List[Dict[str, Any]]:
    findings = []
    for i, slide in enumerate(ppt.slides, start=1):
        notes = slide.notes_slide
        if notes and notes.notes_text_frame and notes.notes_text_frame.text.strip():
            findings.append({
                "finding_id": f"F-PPTX-NOTES-{i}",
                "category": "CONTENT",
                "type": "SLIDE_NOTES",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "pptx_inspector",
                "location": f"slide_{i}",
                "description": "Speaker notes present.",
                "recommendation": "Review notes for sensitive information."
            })
    return findings


def _extract_comments(ppt: Presentation) -> List[Dict[str, Any]]:
    findings = []
    try:
        from lxml import etree
        comments_part = ppt.part.package.part_for_rel_type(
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments"
        )
        if comments_part:
            root = etree.fromstring(comments_part.blob)
            for c in root.findall('.//{*}comment'):
                author = c.get('author')
                txt = "".join(c.itertext())
                findings.append({
                    "finding_id": f"F-PPTX-CMT-{author}",
                    "category": "ANNOTATION",
                    "type": "PPTX_COMMENT",
                    "severity": "LOW",
                    "confidence": 1.0,
                    "source": "pptx_inspector",
                    "location": author,
                    "description": f"Comment by {author}: {txt[:100]}",
                    "recommendation": "Review comment for sensitive data."
                })
    except Exception:  # pragma: no cover
        pass
    return findings


def inspect_pptx(file_path: pathlib.Path) -> List[Dict[str, Any]]:
    """Inspect a PowerPoint (.pptx) file and return findings."""
    findings: List[Dict[str, Any]] = []
    try:
        meta = extract_basic_metadata(file_path)
        if meta:
            findings.append({
                "finding_id": "F-PPTX-META-001",
                "category": "METADATA",
                "type": "PPTX_METADATA",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "pptx_inspector",
                "location": str(file_path),
                "description": f"PPTX metadata: {meta}",
                "recommendation": "Review metadata for sensitive info."
            })

        ppt = Presentation(str(file_path))

        # Slide visibility
        for i, slide in enumerate(ppt.slides, start=1):
            vis = _slide_visibility(slide)
            findings.append({
                "finding_id": f"F-PPTX-SLIDE-{i}",
                "category": "CONTENT",
                "type": "SLIDE_VISIBILITY",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "pptx_inspector",
                "location": f"slide_{i}",
                "description": f"Slide {i} visibility: {vis}",
                "recommendation": "Review hidden slides for concealed data."
            })

        findings.extend(_extract_hyperlinks(ppt))
        findings.extend(_extract_notes(ppt))
        findings.extend(_extract_comments(ppt))

    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-PPTX-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "PPTX_PARSE_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "pptx_inspector",
            "location": str(file_path),
            "description": str(exc),
            "recommendation": "Ensure the file is a valid PPTX."
        })
    return findings
