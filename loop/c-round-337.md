# C round 337 - SYS-R336-PERF-DRAG-WINDOW

**Verdict: PASS** (browserVerified true; 0 bugs). Test-only perf harness; Ableton conformance not applicable. Source untouched by C.

| Row | Result |
|---|---|
| CLAIMS | PASS - K2 f1def9c 4; K3-K7 equal sketch output; K16 1 11 0 8; K20 2 hits both in doc 233 only; start==end (c-round-337/claims-*.txt) |
| SOURCE-SCOPE | PASS - 4 files, doc 233 only untracked, app/ and perf/lib/ no diff, K8 protected 11 OK |
| NOTES | PASS - notes-only-check: ids equal order equal nonnote-diffs 0 notes-changed 58 matches-expected True; read lane/commits-per-move/move-components-per-move notes: window and denominator match dragWindow (moves t>downAt && t<up, first included) |
| PERF | PASS - production build, spec alone, rc 0, complete true, failures [], 193 rows, 36/36 asserted pass, rowcmp 139 EQUAL 0 DIFF 0 NEW, ids-equal 193, all liveness rows [1,1,1] |
| MUTANT | PASS - P true, M false (both abort at drag lane stopped), D 9 DIFF exact listed set, own mutant W (commits .slice(1)) 13 DIFF vs predicted family (move-components-per-move incl lane + range max), none outside; copies deleted |
| HARNESS-READ | PASS - dragWindow bounds, filters, pressedGesture (release swallowed, original rethrown), read/timestamp order in both gestures equal HEAD |
| PERF-LIB | PASS - 34/34 |
| G337-AUTH | PASS - fresh anonymous contexts 1440x900 and 1280x720: /studio-lab workspace + demo badge, auth_user null; /studio/middle-east Sign in required, 0 audio[src]; /api/studio-token no header 401, fake bearer not a token (500), bare 400 |
| DOCS | PASS - doc 233 l.4 exact, 7 TEMPLATE headings in order, tests named exist; doc 168 hunks l.87/88/111 inside ## მეტრიკები (83-112) |

## Notes
- Own mutant W predicted before running (`c-round-337/own-mutant-prediction.md`); result: 13 DIFF in the move-components family (incl. lane rows and range `move-components-max`), 0 elsewhere.
- `typecheck` was not re-run by C (gate row; A rc 0). Full vitest/build/verify/smoke are gate rows.
- G337 auth script copy fixed for the removed `arrangement-status` testid (own artifact).
- Evidence: `c-round-337/` (perf-results, perf-rowcmp.txt, mutants/, g337-auth.json, shots/).
