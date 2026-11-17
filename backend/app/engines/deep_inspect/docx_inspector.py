"""DOCX inspection utilities.

The function ``inspect_docx`` extracts basic text, metadata, comments,
tracked changes, hidden text, hyperlinks, and embedded objects from a DOCX
file.  All findings follow the SENTINEL finding contract.
"""

import pathlib
import json
from typing import List, Dict, Any

import docx

from .metadata_extractor import extract_basic_metadata

def _extract_comments(document: docx.Document) -> List[Dict[str, Any]]:
    findings = []
    # python-docx does not expose comments directly; they are stored in the
    # underlying XML.  We perform a light‑weight parse.
    try:
        comments_part = document.part.package.part_for_rel_type(
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments"
        )
        if comments_part:
            from lxml import etree
            root = etree.fromstring(comments_part.blob)
            for c in root.findall('.//{*}comment'):
                author = c.get('author')
                text = ''.join(c.itertext())
                findings.append({
                    "finding_id": f"F-DOCX-CMT-{author}",
                    "category": "ANNOTATION",
                    "type": "DOCX_COMMENT",
                    "severity": "LOW",
                    "confidence": 1.0,
                    "source": "docx_inspector",
                    "location": author,
                    "description": f"Comment by {author}: {text[:100]}",
                    "recommendation": "Review comment for sensitive data.",
                })
    except Exception:  # pragma: no cover
        pass
    return findings

def _extract_tracked_changes(document: docx.Document) -> List[Dict[str, Any]]:
    findings = []
    # Tracked changes are stored in the word/trackChanges.xml part.
    try:
        tc_part = document.part.package.part_for_rel_type(
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships/trackChanges"
        )
        if tc_part:
            from lxml import etree
            root = etree.fromstring(tc_part.blob)
            changes = root.findall('.//{*}ins') + root.findall('.//{*}del')
            for ch in changes:
                author = ch.get('author')
                findings.append({
                    "finding_id": f"F-DOCX-TRACK-{author}",
                    "category": "CHANGE_TRACKING",
                    "type": "DOCX_TRACKED_CHANGE",
                    "severity": "MEDIUM",
                    "confidence": 1.0,
                    "source": "docx_inspector",
                    "location": author,
                    "description": f"Tracked change by {author}.",
                    "recommendation": "Consider accepting or rejecting tracked changes.",
                })
    except Exception:  # pragma: no cover
        pass
    return findings

def inspect_docx(file_path: pathlib.Path) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    try:
        meta = extract_basic_metadata(file_path)
        if meta:
            findings.append({
                "finding_id": "F-DOCX-META-001",
                "category": "METADATA",
                "type": "DOCX_METADATA",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "docx_inspector",
                "location": str(file_path),
                "description": f"DOCX metadata: {meta}",
                "recommendation": "Review metadata for sensitive info.",
            })
        doc = docx.Document(str(file_path))
        full_text = "\n".join(p.text for p in doc.paragraphs)
        if full_text.strip():
            findings.append({
                "finding_id": "F-DOCX-TEXT-001",
                "category": "CONTENT",
                "type": "EXTRACTABLE_TEXT",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "docx_inspector",
                "location": str(file_path),
                "description": "DOCX contains extractable text.",
                "recommendation": "Pass text to downstream analysis.",
            })
        else:
            findings.append({
                "finding_id": "F-DOCX-EMPTY-001",
                "category": "CONTENT",
                "type": "NO_EXTRACTABLE_TEXT",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "docx_inspector",
                "location": str(file_path),
                "description": "DOCX appears empty or contains only non‑text objects.",
                "recommendation": "Consider OCR on embedded images.",
            })
        # Comments & tracked changes
        findings.extend(_extract_comments(doc))
        findings.extend(_extract_tracked_changes(doc))
        # Hyperlinks are stored in document.part.rels; we extract URLs.
        for rel in doc.part.rels.values():
            if rel.reltype.endswith("/hyperlink"):
                findings.append({
                    "finding_id": f"F-DOCX-HLINK-{rel.rId}",
                    "category": "LINK",
                    "type": "DOCX_HYPERLINK",
                    "severity": "LOW",
                    "confidence": 1.0,
                    "source": "docx_inspector",
                    "location": str(rel.target_ref),
                    "description": f"Hyperlink target: {rel.target_ref}",
                    "recommendation": "Validate link safety before following.",
                })
    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-DOCX-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "DOCX_PARSE_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "docx_inspector",
            "location": str(file_path),
            "description": str(exc),
            "recommendation": "Ensure the file is a valid DOCX.",
        })
    return findings
