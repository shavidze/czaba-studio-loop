# C round 449 — STORE-2b-3a gradient text → light ink: PASS

Real Chromium (Playwright), HEAD control `48e16b8` on :5178 (git archive, own cacheDir), tree on :5173, mock API :5199 started by C. Both warmed. Evidence in `c-round-449/`.

| Row | Result |
|---|---|
| C1 SOURCE-SCOPE | PASS — 12 dirty paths = `grants-449.txt` exactly (comm empty); no Studio/root/contexts/protected file |
| C2 CLAIMS | PASS — `claims-c.txt` differs from planning only at K3 (12→3, 3→0), K3b, K4, K6 (5→0), K9, K9b, K16, K19, K21, K24; K2 differs as B noted; K8 unchanged |
| C3 HEADING-INK | PASS — `gt-compare.txt`: `ROWS 24 ALL_OK True` against my own HEAD capture. Head: transparent fill + gradient, teal 0.341–0.804; tree: fill rgb(236,230,218), no bg image, teal ≤ 0.001, contrast 13.61–15.7, boxes equal at 1440/1280/375 |
| C4 DEFAULT-MOTION | PASS (record) — `gt-default-tree.json`/`c4.log`: default motion, 1440, all 8 words fill light ink, teal ≤ 0.001 |
| C5 LEADMAGNET | PASS — `c5-lm.json`: textEqual, tagsEqual, boxEqual true; head text-glow 1 → tree 0; eyebrow light ink [232,226,214] |
| C6 SELECTION | PASS — selected "Releases"/"Cinema", bluishFraction 0.754/0.829 (HEAD 0.756/0.831) |
| C7 FORCED-COLORS | PASS — forcedMediaMatches true; tree fill rgb(236,230,218), inkFraction 0.82/0.79/0.819 |
| C8 WEBKIT | BLOCKED — no WebKit on cloud runner (TLM-R449-WEBKIT-HEADING-INK) |
| C9 STUDIO 0 px | PASS on third run. Runs 1 and 2 had HEAD-vs-HEAD 8 px at 1440 (y309–311, control invalid per L37; tree-vs-HEAD was 0 in both); run 3 all pairs 0 px at 1440 and 1280 (`c9.json`, earlier runs kept) |
| C10 COVERING | PASS — 16 files / 190 tests |
| C11 MUTANTS | PASS — committed C scratch `34e4e8a`: BASE none, M1 GT1 GT2 GT3, M2 GT2, M3 GT3, M4 GT1, M5 GT1, M6 none, M7 GT3, M8 GT4, M9 GT1, M10 GT5, M11 GT4 = K13 (`mutants-run.log`) |
| C12 STUDIO + PURCHASE | PASS — tree = HEAD at 1440 and 1280: 1 clip, Playing posPlay ~1.46 s, Stop held; anonymous `/studio/middle-east`: audioSrc 0, media 0, "Sign in required" (premium not bypassed) |
| C13 DOCS | PASS — l.3/l.4 exact, 7 TEMPLATE headings in order, GT1–GT5 + NM2 exist, supersede line present, 0 "pending" |

Note: no Studio audio-graph/export WAV measurement applies (Store CSS/class change; Studio files untouched and 0 px identical). Gate rows (full vitest/typecheck/build/lint/verify) are `gate`. A's code-reviewer Medium A-R449-REVIEW-GT1-TSX (GT1 scans CSS only) is B's follow-up, not a bug in this round; no live regression today.
