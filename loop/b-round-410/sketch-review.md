# Sketch review — PERF-15b-i (round 411)
Dispatched sketch sha256: 26266d04016d290ad4706e801708cadcc530c39ffad13aa21e09d19eb01fd279 (sketch-411.patch.txt, v4)
Reviewed v2 sha256: b0a5841fff4fbcfba5c3b1ec15a0a669e271d663ce169ad6ceaf51941cc45b67 (sketch-411-v2.patch.txt)

## tech-lead on v2: APPROVE WITH LOWS (no Critical/High)
- TL-R411-M1 (Medium, reproducibility): generator only in the loop folder -> FIXED in v4 (scripts/peaks/generate-demo-peaks.mjs + demo-peaks-meta.json; regeneration byte-identical).
- TL-R411-L2 (Low): peaks files not tied to the MP3 -> FIXED in v4 (PS17 asserts MP3 byte sizes; MU-411-MP3-SIZE-UNTIED red).
- TL-R411-L3 (Low): evidence HeadlessChrome 143 only; Firefox/Safari decode lengths may differ by > 1 bucket -> worker path (safe) -> 15b-ii Firefox probe.
- TL-R411-L4 (Low): size cap only when content-length is present (chunked/gzip unbounded) -> 15b-ii streamed-bytes cap (signed URLs).
- TL-R411-L5 (Low): demoPeaksUrls repeats demoUrls keys -> kept; PS16 pins both maps.
- Answers: logic correct; body?.cancel() safe with null body; credentials 'omit' right for signed R2 URLs (bearer via injected SourceFetch still works; do not cache by expiring signed URL); PPC1-11 cover the peaks x decode matrix (15a); evict-then-reload never recomputes peaks (ArrangementContext reload path) -> no row needed; HTML-200 response -> json() throws -> null.

## Ordering matrix (L58) — inherited
The concurrency contract (peaks hit / 404 / 8-bit / mismatch / late / abort / swap x decode ok / error) is 15a's, unchanged in this sketch (ArrangementContext.tsx not touched); cells -> PPC1..PPC11 (b-round-409/sketch-review.md). New in 15b-i only the request policy (PP8) and refused-body cancel (PP9).

## Delta re-review v2 -> v4 (tech-lead): APPROVE WITH LOWS
v4 sha256 26266d04016d290ad4706e801708cadcc530c39ffad13aa21e09d19eb01fd279 (sketch-411-v4.patch.txt).
No new Critical/High/Medium. Strip title on role=slider OK (aria-label is the name; title = description; same reason as the Preview button). Nothing in repo checks scripts/**/*.mjs (biome ./app, tsconfig *.ts(x), vitest app/**, check-agents .claude/agents, lint-staged *.js etc.).
- TL-R411-L6 (Low) generator relative paths -> FIXED v5 (repoPath via import.meta.url).
- TL-R411-L7 (Low) 5-line header comment vs CLAUDE.md no-comments -> FIXED v5 (no comments).
- TL-R411-L8 (Low) meta vs PS17 drift -> FIXED v5 (PS17 reads the meta; MU-411-META-LENGTH-DRIFT, MU-411-MP3-SIZE-UNTIED red).

## Delta re-review v4 -> v5 (tech-lead): APPROVE
Dispatched v5 sha256 e9b149c4be701ad13c6819856082674cf94702b94c0d51b71712e1576dd39025 (recomputed by the reviewer). No Critical/High/Medium; L6/L7/L8 closed; delta touches only scripts/peaks/generate-demo-peaks.mjs and app/data/__tests__/studio-lab-demo.test.ts.
- TL-R411-L9 (Low, optional): the meta `file` field is not checked against peaksFiles[].path -> 15b-ii (owns the same test file).
