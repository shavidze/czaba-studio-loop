# C round 344 — PERF-DRAG-PREVIEW c5-i (video-move harness row): PASS

Verdict: **PASS**, browserVerified true. Evidence is in `c-round-344/`; `c-round-344.json` has the machine fields. Time to verdict: about 20 min.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | At start and end the output equals `a-round-344/claims-final.txt` | `claims-start.txt`, `claims-end.txt` |
| SOURCE-SCOPE | The 4 granted files only; `app/`, `perf/lib/` and `e2e/` have 0 diff lines. `git apply -R --check` passes for budgets.patch. For spec.patch it fails, as expected, on A's two strengthened hunks: (1) an "import added no Undo entry" problem in `setupVideoClip`; (2) the `setLive(…drag-video-live, true)` call moved after the playing drag, so liveness is the AND of both drags. The 219 old budget rows are unchanged by id; 11 new rows, all `record`, `budget` null, owner c5-i. | `spec.diff`, `budget-bytes.txt` |
| PERF | Production build, spec run alone: rc 0, `complete` true, `failures` [], 230 rows, 55/55 asserted pass. Against c343: **157 EQUAL, 0 DIFF, 8 NEW**. The 8 values are 98.35, 100, 1, 100, 1, 0, 31, 1. `durationMs` 466 839. Wallclock video rows (not compared): playing `move-components-per-move` [98.35 ×3]; stopped p95 [7.2, 7.4, 7.3] ms; playing p95 [13.7, 11.7, 12.6] ms. | `perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c343.txt`, `video-rows.txt` |
| PREMISE | Video stopped move 98.35 components per move > audio single-clip move 22.8, which is about 4.3×. The 11 rows' 3 pass values are in `video-rows.txt` (c5-ii baseline). | `video-rows.txt` |
| MUTANT | `videoGrabWidthPx` 480 → 5000 on a scratch copy. Predicted a setup problem, liveness 0 and a red run. Observed: problem "video setup: name bar 3090 px wide after 16 zoom-in keys; want 5000" in 3/3 passes, 9 "row not measured 3 times" failures, `drag-video-live` [0,0,0], rc 1. Scratch deleted. | `mutant.log`, `mutant-latest.json` |
| VIDEO-PREMISE (browser, dev) | 1440 and 1280, against B's head probe. Stopped move/trim/fade: every field equal (perMove 99.433/100.7/94.4, max, provider/workspace/dock 59, release commits 1). Playing: provider/workspace/dock 59 in all, max equal, move perMove 99.5 vs 99.467 (within ±0.1), commits 62→63 (recorded), fade release 3. pageErrors [], undoAfterImport equal. | `probe/compare.txt`, `probe/c-*.json` |
| HARNESS-READ | Setup has the empty-lane check, fixture, count, clip id, the bounded zoom-in with a problem, and the Undo-entry check (strengthened). Teardown has the Ctrl+Z presses, 0 clips and the Undo title. The block runs after `measureSelectSameLane` inside `cpuRate === 1`. A failed setup gives live 0 with `{setup:'failed'}`. `setLive` has AND semantics. `'all-but-ratio'` skips only `commits-per-move`. Other drags are untouched in the diff. | `spec.diff` |
| PERF-LIB | 34/34 | `perf-lib.log` |
| G344-AUTH | Fresh anonymous contexts at both viewports: `/studio-lab` has the workspace and the demo badge, `auth_user` null. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token`: no header 401, bare 400, fake Bearer 403 (mock health 200). No tokens in bodies. Premium auth is not bypassed. | `tools/g344-auth.json` |
| DOCS | Doc 232: l.1 and l.4 as specified, 7 `## ` headings, one `### ეტაპი c5-i` section, items 67–71, numbers (22.8, 98.35, 99.433) present. Doc 168: hunks only at l.34, l.61 and l.128, matching the live spec and budgets. | `git diff` |

Note: doc 232 l.4 already says "C round 344 PASS". This was prewritten by the spec and is consistent with this verdict.

## Findings
- **C-R344-PERF-DURATION (Low).** `durationMs` 466 839 is above the 450 000 bound (A saw 469 442 and 463 678). Evidence for ROOT-REQ-PERF-TIMEOUT. Not a STOP.
- A's six reviewer Lows (failed-setup state, rateRowId, all-but-ratio name, liveness scenario text, sequence text, partial live) go to `deferred_low_polish`.
- Observation (not a bug): the mutant's liveness 0 reaches `failures` through the setup problem, not through the record row itself. This matches the c3-i precedent.

Gate rows not claimed by C: full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
Ableton conformance: not applicable (measurement round; the app is unchanged).
Cleanup: the scratch copy is deleted. The mock API I started is stopped. No file under `store/` was changed by C.
