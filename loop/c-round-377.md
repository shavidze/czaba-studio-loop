# C round 377 — PERF-11c-iii-c1 close-out: verdict PASS (browserVerified true)

C did not edit app source (SOURCE-SCOPE equal at start and end). All evidence is under `c-round-377/`. Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) belong to the root gate and are not claimed.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 7 lines (6 M + doc 243) at start and end; frozen rc 0; protected rc 0 | `scope-start.txt`, `scope-end.txt` |
| CLAIMS | PASS: rc 0, 0 MISSING. vs sketch output only K2 (7 on store/) and K11 differ; vs before-A output only K6, K10, K11, K12 differ | `claims-C.txt` |
| SKETCH-EQUAL | PASS 6/6 | — |
| ASSERT-COUNT | PASS: 187/18, 530/74, 38/7, 137/21 | `claims-C.txt` K12 |
| UNIT | PASS: 140 files / 2,201 tests; shuffle seed 42: 41/41. No test above 50 % of its declared timeout (CP12a 6.3 s of 30 s describe; TC10 4.1 s of 15 s) | `unit140.log`, `shuffle.log` |
| MUTANTS-TREE | PASS: 11/11 red, alone, on a copy. Extra red RB-LEAF4b on 3 mutants (allowed). MU-T-UNDO-FRESH-PER-EDIT red on RB-LEAF4b only. Context file restored (cmp) | `mutants/`, `mutants-summary.txt`, `mutant377.log` |
| PERF-INTERACT | PASS: 1 passed (8.8 min), 0 failures; 189 count rows equal the sketch column; zoom.1 41, zoom.30 128, click 29, range move max 27 | `perf-interact.log`, `perf-interactions-A.json` |
| PERF-RESOURCES | PASS; `export-1-produced` == 1 | `perf-resources.log` |
| LEAF-PROBE (browser) | PASS: 260 cells per viewport, 0 diffs vs `leaf-sketch-376.json` | `leaf-A.json` |
| TRANSPORT-BROWSER (f) (browser) | PASS: A == HEAD (6b11be7, port 5174, own cacheDir) at 1440×900 and 1280×720. Ring on Fit when reached by keyboard: 1 px brass, offset 2 px, same as HEAD | `rows-A.json`, `rows-HEAD.json`, `ring.json` |
| TRANSPORT-BROWSER (a, c) | PASS: equal HEAD | same |
| G377-AUTH (browser) | PASS: lab workspace with auth_user null; `/studio/middle-east` Sign in required, 0 workspace, 0 audio[src]; token API 401, no token in body. Fake bearer 500: BLOCKED (backend unavailable) | `rows-A.json` auth, `rows-A-auth-*.png` |
| STUDIO-SMOKE-377 (browser) | PASS: Bass add, Play 00:01.46 after 1.5 s, lane drag + Ctrl+Z, Master Mute, preview Play/Stop; RB-LEAF4b in the browser: Undo title/text identical after the 1st and 2nd Master Mute click | `rows-A.json` smoke |
| DOCS | PASS (l.4 exact, headings 7/7, ids exist, red row matches the B log, 0 pending) | — |

**Bugs: none.** Observation only: playback position after 1.5 s differs 9 ms between trees (jitter, row needs ≥ 1.000 s).
**Conformance:** Ableton check and screen budget not applicable (invisible performance refactor).
**Honest limits:** the 140-file run and the mutants ran on A's tree on this runner; HEAD comparison covers the browser rows only. PERF timing rows were not compared (75 wallclock rows vary by machine); only deterministic count rows were.
**Process note for B:** a range drag that starts on a clip body makes no time selection (by design); use the lane background.

**Addenda (after review).**
- Fit ring: on the mouse path focus lands on Fit with `:focus-visible` false and no ring, identical on A and HEAD and consistent with the SABA-B-4 rule; on the keyboard path the ring is 1 px brass, offset 2 px, identical on A and HEAD. The row's "visible ring" wording expects a ring on a click path the project rule forbids; B may reword it. Not A's bug.
- `restore-check rc 1` in the mutant log is a script path artifact (looks for `sketch-files-sha256.txt` beside the tree's parent), not a dirty tree: 0 failing lines against `sketch-v3-files-sha256.txt`, and `ArrangementContext.tsx` cmp equal.
- LEAF-PROBE: one replacement attempt (first died at C's 110 s wrapper, rc 124); the second was clean.
- Fake bearer 500: not attempted this round (round-376 `auth.mjs` observed it); BLOCKED, backend unavailable.
