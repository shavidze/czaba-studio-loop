# C round 348 — PASS (browserVerified true, 0 bugs)

Scope: test/budget/doc only (3 modified files, 0 untracked; HEAD 95774e6). Evidence in `c-round-348/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS: identical to A's final; vs sketch only K2 (`95774e6 3`) and K11 differ, as expected | claims.txt |
| SOURCE-SCOPE | PASS: 3 modified, 0 untracked; both `b-round-347/sketch/*.patch.txt` reverse-apply | git |
| READ | PASS: python diff of budgets vs HEAD: exactly the 14 rows listed (trim 6, move 4, fade 4), mode/budget/owner only, 230 ids unchanged, 70 asserted. Test diff: only `let released`/try/finally in DP63 and DP65, no catch, assertions same order | – |
| UNIT | PASS 67/67 | unit.log |
| PERF-LIB | PASS 40/40 | perflib.log |
| PERF (prod build, alone, port 5188) | PASS rc 0, complete, failures [], 230 rows, 70/70 asserted pass, 165 EQUAL / 0 DIFF vs C347. trim 14.75 (max 15), move 15.317, fade 3.933 (max 4); release trim 1 / move 1; fade release 3 stopped / 2 playing (record). durationMs 454664 | perf-store-results/, rowcmp-vs-c347.txt |
| MUTANT (own, scratch, predicted) | `memo` removed from `ArrangementMixFader` only. Predicted: 10 component rows red, release rows green. Actual: exactly 10 red (fade per-move 5.9 / max 6 x2 states; trim 16.717 / 17 x2; move per-move 17.483 x2), no release-commits row red, matches COMBO's component values. Scratch deleted, store git status unchanged (3 files) | mu-mixfader.log, mu-mixfader-results/ |
| G348-AUTH (1440, 1280, fresh anon context) | PASS: /studio-lab opens with workspace + demo notice, `auth_user` null; /studio/<id> shows "Sign in required", 0 `audio[src]`; `/api/studio-token` GET 400, POST 405 | auth.out, auth-*.png |
| DRAG-SMOKE (1440, 1280, dev) | PASS: trim, move, fade-in each preview mid-drag, commit one entry ("Undo: Trim — left edge / Move clip / Fade In"), one Ctrl+Z restores state and undo label | drag.json, drag-*.png |
| DOCS | PASS: l.4 status ok, 1 conversions section, 7 `##`, 0 "C round 347 pending", item 18 and table state fade `<= 4` matching live file | – |

Gate (not claimed): full vitest, build, Biome, typecheck, verify, e2e smoke.

Notes for B (no bug):
- Perf run 454664 ms exceeds L31's 450000 ms bound (A saw 453013; same class, environment variance, no app change). Consider raising the bound or trimming the spec.
- This round does not complete PERF-DRAG-PREVIEW (move steady state 15.317 > 15 because of the crossing commit); fade release-commits and 6x rows remain unasserted.
- Ableton conformance: not applicable.
