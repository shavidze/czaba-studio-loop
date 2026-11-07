# C round 385: RETRO 385 traceability + browser rows — PASS (browserVerified true)

No bugs. Source untouched (git status 0 lines at start and end; r385 manifest 1280 entries rc 0; protected manifest rc 0). JSON: `c-round-385.json`, progress: `c-round-385/progress.json`, L57 checks: `c-round-385/l57-check.txt` (rc 0) and `l57-c384.txt` (rc 0). Full suite / verify are gate rows, not claimed.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS | 0 lines; both manifests rc 0 |
| 2 | G385-AUTH (1440x900, 1280x720) | PASS | `auth-smoke.json`: fresh context, `auth_user` null, `/studio-lab` opens; `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, no timeline; `/api/studio-token?product=middle-east&file=stem.mp3` without Authorization → 401 `{"error":"Please sign in to access Studio."}`, no token. Premium auth not bypassed. Fake bearer: BLOCKED (no backend) |
| 3 | STUDIO-SMOKE-385 (both) | PASS | Enter adds 1 clip; Play 1.5 s: 00:00.000 → 00:01.462/00:01.471; after Stop the clock is identical 0.8 s later; Export dialog opens, Esc closes (`screens/smoke-*.png`) |
| 4 | RT-SCREEN (both) | PASS | PNGs match their description (viewed). `capture.mjs` re-run: visible-text rows 138/168/118/144, per-row text identical to B's; journey URL `/studio-lab?preview=middle-east`, clips left 512/1152/1792/2432, export range 01:04.000 |
| 5 | CLAIMS | PASS | 0 MISSING; only K25 differs (INFO-C385-K25-ARCHIVE: closed findings moved to `archive/findings-archived.json` by the backlog optimizer; checked there) |
| 6 | RT-NUM | PASS | scripts re-run from `c-round-385/scripts` to `c-round-385/data`: cost-rows, retro-numbers, classify, fails-detail, exp-fields, gate-reviews, l57-coverage, manifest-fields, awaiting-user etc. byte-identical. $320.36 / B 195.21 / A 102.83 / C 22.32 / 60.9 % / 19.63 / 12.505, 5.885, 1.01; 70.84; 36.78; 54.07; 13/1/2; skipped [369,376,382,383]; STOP 376, 382; 46/32; 715/1106/96; L57 15/16 (383 absent). Only diffs: collect b_cost for 384 (8.7 vs 0: B's later planning cost), dict order, and archived-mediums (archive moves) — explained. L23/L58 = 5057/3716 raw (5058/3717 with newline) |
| 7 | RT-CAUSE | PASS | a-round-376 (TC10 62 % at l.5; l.3 is the STOP header, cosmetic), c-round-376 33 %, reviewer M1 text matches; c-round-382.json origins A/B-premise; a-round-382 l.1 STOP; c-round-383 400 not 401 (c-round-383.md l.13), no manifest fields, no progress.json; b-round-381 has no sketch-review (l58-l30-application: 380–383 none); c-round-377 FL11 + PASS; C-R382-02 closed D-29z1281 with c-round-384 row 10 EVICT-B2-COUNT PASS. Opinions labelled `tech-lead`/`product-designer`. No invented cause found |
| 8 | RT-IDS | PASS | D-29z1285…1292 present; retro_runs has 385; next_due starts "round 400"; closed ids verified in archive; GATE384-M1 scheduled; SYS-R385 has 8 `closes`, all exist; ARCH-CHECKPOINT awaiting_user; ROOT-REQ-L57-CHECK-PROGRESS, Q-SR-385-1, STEM-LANES scope_additions, REGRESSION-2026-11-08 exist |
| 9 | RT-LESSONS | PASS | 60 lines, 3 parts; changed lines exactly 3, 18, 20, 41, 59; 18/20/41/59 keep the old text as a byte prefix and append one clause; 51 ids, none lost |
| 10 | RT-L57 | PASS | c-round-384 rc 0; c-round-385 rc 0 |
| 11 | RT-SABA | PASS | retro §12, screen-review and questions file are information/proposal/question; nothing presented as Saba's decision |
| 12 | SOURCE-SCOPE end + L57 | PASS | 0 lines, rc 0/0; l57 rc 0 |

Extra (real measurement, beyond rows): two 16 s stems exported as WAV = 32.000 s, 24-bit/48 kHz stereo PCM, peak 0.297, 0 NaN (`export-wav.json`). This confirms the retro's "stems lay out one after another" product gap that STEM-LANES owns. It is not an acceptance row.

Info notes (not bugs): see `infoNotes` in the JSON.
