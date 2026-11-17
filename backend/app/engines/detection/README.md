# Detection engine

The detection engine analyzes extracted text only; it does not open files or
perform document extraction. `detect_sensitive_content()` combines validated
PII and credential detection and returns masked, explainable finding
dictionaries. `analyze_ocr_text()` is the integration point for OCR output.

The current implementation is a dependency-light baseline. Context scoring is
local and explainable; it is not a trained model and does not transmit
document content to an external AI service. Presidio/spaCy integration can be
added after the shared contract and dependency ownership are approved.

The public interfaces are `detect_sensitive_content(text)`,
`detect_pii(text)`, `detect_secrets(text)`, `analyze_ocr_text(text)`, and
`classify_finding_context(text, start, end)`.
