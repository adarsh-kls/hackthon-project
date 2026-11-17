"""Helper utilities for hidden‑content detection.

Used by the Excel and PPTX inspectors to keep visibility‑logic in a single
place, making future extensions easier.
"""

from typing import Dict, Any
import pathlib


def hidden_sheet_finding(sheet_name: str, visibility: str, file_path: pathlib.Path) -> Dict[str, Any]:
    """Create a finding for a hidden or very‑hidden worksheet.

    * ``visibility`` must be "hidden" or "veryHidden" (case‑sensitive).
    """
    return {
        "finding_id": f"F-HIDDEN-SHEET-{sheet_name}",
        "category": "HIDDEN_CONTENT",
        "type": "HIDDEN_WORKSHEET",
        "severity": "MEDIUM",
        "confidence": 1.0,
        "source": "hidden_content",
        "location": sheet_name,
        "description": f"Worksheet '{sheet_name}' is {visibility.lower()}.",
        "recommendation": "Review hidden worksheets for concealed data."
    }


def hidden_slide_finding(slide_idx: int, visibility: str, file_path: pathlib.Path) -> Dict[str, Any]:
    """Create a finding for a hidden PowerPoint slide.

    * ``visibility`` must be "HIDDEN" or "VISIBLE".
    """
    return {
        "finding_id": f"F-HIDDEN-SLIDE-{slide_idx}",
        "category": "HIDDEN_CONTENT",
        "type": "HIDDEN_SLIDE",
        "severity": "MEDIUM",
        "confidence": 1.0,
        "source": "hidden_content",
        "location": f"slide_{slide_idx}",
        "description": f"Slide {slide_idx} is {visibility.lower()}.",
        "recommendation": "Review hidden slides for concealed data."
    }
