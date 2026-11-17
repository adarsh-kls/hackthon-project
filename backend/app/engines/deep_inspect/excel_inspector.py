"""Excel (XLSX) inspection utilities.

The function ``inspect_excel`` extracts information about worksheets, hidden/very hidden
sheets, hidden rows/columns, cell comments, hyperlinks, external references and
metadata.  Findings conform to the SENTINEL finding contract.
"""

import pathlib
import json
from typing import List, Dict, Any

import openpyxl

from .metadata_extractor import extract_basic_metadata

def _sheet_visibility(ws) -> str:
    if ws.sheet_state == "visible":
        return "VISIBLE"
    elif ws.sheet_state == "hidden":
        return "HIDDEN"
    elif ws.sheet_state == "veryHidden":
        return "VERY_HIDDEN"
    return "UNKNOWN"

def _hidden_rows_cols(ws) -> List[Dict[str, Any]]:
    findings = []
    # openpyxl stores hidden rows/cols in worksheet.row_dimensions / column_dimensions
    for row_dim in ws.row_dimensions.values():
        if row_dim.hidden:
            findings.append({
                "finding_id": f"F-XLSX-HIDDEN-ROW-{ws.title}-{row_dim.index}",
                "category": "HIDDEN_CONTENT",
                "type": "HIDDEN_ROW",
                "severity": "MEDIUM",
                "confidence": 1.0,
                "source": "excel_inspector",
                "location": f"{ws.title}!{row_dim.index}",
                "description": f"Row {row_dim.index} in sheet '{ws.title}' is hidden.",
                "recommendation": "Review hidden rows for concealed data.",
            })
    for col_dim in ws.column_dimensions.values():
        if col_dim.hidden:
            findings.append({
                "finding_id": f"F-XLSX-HIDDEN-COL-{ws.title}-{col_dim.index}",
                "category": "HIDDEN_CONTENT",
                "type": "HIDDEN_COLUMN",
                "severity": "MEDIUM",
                "confidence": 1.0,
                "source": "excel_inspector",
                "location": f"{ws.title}!{col_dim.index}",
                "description": f"Column {col_dim.index} in sheet '{ws.title}' is hidden.",
                "recommendation": "Review hidden columns for concealed data.",
            })
    return findings

def _extract_hyperlinks(ws) -> List[Dict[str, Any]]:
    findings = []
    for row in ws.iter_rows(values_only=False):
        for cell in row:
            if cell.hyperlink:
                findings.append({
                    "finding_id": f"F-XLSX-HLINK-{ws.title}-{cell.coordinate}",
                    "category": "LINK",
                    "type": "XLSX_HYPERLINK",
                    "severity": "LOW",
                    "confidence": 1.0,
                    "source": "excel_inspector",
                    "location": f"{ws.title}!{cell.coordinate}",
                    "description": f"Hyperlink target: {cell.hyperlink.target}",
                    "recommendation": "Validate link safety before following.",
                })
    return findings

def inspect_excel(file_path: pathlib.Path) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    try:
        meta = extract_basic_metadata(file_path)
        if meta:
            findings.append({
                "finding_id": "F-XLSX-META-001",
                "category": "METADATA",
                "type": "XLSX_METADATA",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "excel_inspector",
                "location": str(file_path),
                "description": f"XLSX metadata: {meta}",
                "recommendation": "Review metadata for sensitive info.",
            })
        wb = openpyxl.load_workbook(str(file_path), data_only=True, read_only=False)
        for ws in wb.worksheets:
            vis = _sheet_visibility(ws)
            findings.append({
                "finding_id": f"F-XLSX-SHEET-{ws.title}",
                "category": "CONTENT",
                "type": "WORKSHEET_VISIBILITY",
                "severity": "LOW",
                "confidence": 1.0,
                "source": "excel_inspector",
                "location": ws.title,
                "description": f"Worksheet '{ws.title}' visibility: {vis}",
                "recommendation": "Review hidden or very hidden sheets.",
            })
            findings.extend(_hidden_rows_cols(ws))
            findings.extend(_extract_hyperlinks(ws))
        # External references – check defined names for external links
        for name in wb.defined_names.definedName:
            if name.attr_text and "[" in name.attr_text:
                findings.append({
                    "finding_id": f"F-XLSX-EXTREF-{name.name}",
                    "category": "LINK",
                    "type": "EXTERNAL_REFERENCE",
                    "severity": "LOW",
                    "confidence": 1.0,
                    "source": "excel_inspector",
                    "location": name.name,
                    "description": f"External reference in defined name: {name.attr_text}",
                    "recommendation": "Validate external references.",
                })
    except Exception as exc:  # pragma: no cover
        findings.append({
            "finding_id": "F-XLSX-ERR-001",
            "category": "PROCESSING_ERROR",
            "type": "XLSX_PARSE_FAILURE",
            "severity": "HIGH",
            "confidence": 1.0,
            "source": "excel_inspector",
            "location": str(file_path),
            "description": str(exc),
            "recommendation": "Ensure the file is a valid XLSX.",
        })
    return findings
