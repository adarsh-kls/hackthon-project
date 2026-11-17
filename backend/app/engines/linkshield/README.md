# LinkShield engine

LinkShield extracts HTTP(S) URLs, performs explainable local heuristic
analysis, and exposes QR and redirect-analysis integration points. It never
opens a URL in a browser or downloads response content.

`analyze_redirects()` requires an injected bounded transport so the
application owner can enforce its network policy. Every redirect is
revalidated, private destinations are rejected, and the chain has a depth and
timeout limit. Reputation results from `LocalHeuristicReputation` are
explicitly labelled as local and must not be presented as external verdicts.

`VirusTotalReputation` and `GoogleSafeBrowsingReputation` require API keys
provided by the application configuration. They return `unavailable` on
provider or network failure and never convert an unavailable result into a
malicious verdict. The providers submit URLs only; they do not submit
document content.

The public interfaces are `extract_urls(text)`, `analyze_urls(urls)`,
`analyze_qr_codes(images)`, `analyze_redirects(url, getter=...)`, and the
reputation provider classes.
