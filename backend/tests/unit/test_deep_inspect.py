import pathlib
import pytest

from backend.app.engines.deep_inspect import inspector

FIXTURE_ROOT = pathlib.Path(__file__).parents[3] / "sample-data"

@pytest.mark.parametrize(
    "fixture,expected_category",
    [
        ("pdf/clean.pdf", "CONTENT"),
        ("docx/comments.docx", "ANNOTATION"),
        ("xlsx/hidden_sheet.xlsx", "HIDDEN_CONTENT"),
        ("pptx/hidden_slide.pptx", "HIDDEN_CONTENT"),
        ("image/qr_code.png", "LINK"),
        ("archive/nested.zip", "CONTENT"),
    ],
)
def test_deep_inspect(fixture: str, expected_category: str):
    file_path = FIXTURE_ROOT / fixture
    findings = inspector.inspect_document(file_path)
    assert any(f.get("category") == expected_category for f in findings), f"Expected {expected_category} in findings for {fixture}"