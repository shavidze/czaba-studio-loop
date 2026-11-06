# C round 373 — PERF-11c-ii-b (committed status into the status store)

Verdict: **PASS**, browserVerified/realVerified true, 0 bugs. Evidence in `c-round-373/`; machine-readable `c-round-373.json` (L57 check OK).

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 9 status lines at start and end; frozen, protected and sketch sha lists rc 0 | — |
| CLAIMS | PASS: equals sketch output except K2=9 and K17 (doc 240 files 1, doc 239 l.4), as expected | `claims-out.txt` |
| SKETCH-EQUAL | PASS 7/7 | — |
| ASSERT-COUNT | PASS: render-budget 125→129, selection-wrappers-render 34→37, status-lifetime 145→145; `it(` counts equal | `assert-count.txt` |
| UNIT | PASS: 136 files / 2153 tests; shuffle seed 42: 43 pass; no test above 50% of its declared timeout | `unit.log`, `unit-shuffle.log` |
| MUTANTS-TREE | PASS: red counts 2,3,1,16,1,11; failing ids identical to B's logs for all 6 | `mutants/` |
| PERF-INTERACT | PASS: 0 failures; start/stop components 11/11; fade release-commits 2, others 1; range rows 0 | `perf-latest-interactions.json` |
| MU-B-RECORD (record) | start/stop components 12/12, fade release-commits 4 (as B); mutant red | `perf-mub.log`, `perf-mub-latest.json` |
| STATUS-BROWSER | PASS: every text, Undo title and mutation count on A's tree equals HEAD's at 1440×900 and 1280×720 | `status-A.json`, `status-HEAD.json`, `extra-*.json`, `screens/` |
| G373-AUTH | PASS: anonymous `/studio-lab` shows the workspace, `auth_user` null; `/studio/middle-east` "Sign in required", 0 workspace, 0 `audio[src]`; token API 401 without token; no token in any body | `auth.json` |
| STUDIO-SMOKE-373 | PASS: Play position 00:01.471 after 1.5 s; move/undo statuses equal round 372; WAV RIFF/WAVE 24-bit 48 kHz 16 s, peak 0.217, 0 NaN | `smoke.json`, `exports/` |
| DOCS | PASS: l.4 of docs 239/240 byte-exact, headings in TEMPLATE order, named files and ids exist, 0 "pending" hits | `docs-*.txt` |

## Records and caveats (not findings)
- **(a) ruler strip:** the click starts playback, but the status line stays the add text in both trees. The expected LT12 text ("Insert marker at <t> — playback continues…") was not seen in the real browser, nor on strip click while playing, ruler-body click or Space. Equal to HEAD, so no bug; the LT12 text is covered only in jsdom. B may want a browser probe if the text is meant to show.
- **(d) ArrowLeft hold:** the clip was already at 0, so no move happened; the 0-mutation equality is weak. Neutral for the status path; a later round could hold ArrowRight.
- **Blocked:** fake bearer on `/api/studio-token` gives a fail-closed 500 (no backend or mock in the cloud); B named 403 for the mock.
- **Gate rows** (full vitest, typecheck, build, Biome, verify, e2e smoke) are not claimed.
- A's reviewer Lows (describeSpaceStart during a gesture, statusSequence +2, `getStatus` naming) stay inputs for B; no browser-observable difference found.
- Ableton conformance: not applicable (performance refactor).
