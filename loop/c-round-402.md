# C round 402 — PERF-14b-ii lane clip virtualization: **PASS** (0 bugs)

Browser rows ran at 1440×900 and 1280×720 (Playwright/Chromium). Working tree built in a scratch copy (port 5189) for the probes; dev server :5173 for AUTH/SMOKE. Source untouched by C. Gate rows (full vitest, typecheck, build, Biome, verify) are not claimed.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start/end | PASS: claims differ from planning only in K2/K5/K6/K7/K8; status = 9 granted paths (7 M, 2 ??), nothing staged; frozen 1,287 rc 0; protected rc 0 (start and end) | claims-start.txt, claims-end.txt |
| 2 | PATCH-IDENTITY | PASS: diff of the 6 files vs sketch-402.patch.txt (ignoring `index`) is empty | mine.diff, patch.diff |
| 3 | AUTH | PASS both viewports: `/studio-lab` opens, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; token API without Authorization 401 `Please sign in to access Studio.`. Fake bearer: 500 "Unable to prepare Studio access", no token (BLOCKED, backend unavailable) | smoke-*.json, auth-premium-*.png |
| 4 | VIRT-FRAMES | PASS: gapFrames 0, n 454/453; afterScroll.page 1533/1698; selectAll.mounted 55/46; held 1; afterNextPage 0; model 200; no page errors | frames-*.json/png |
| 5 | PIN-BLUR-GROUP | PASS both: A held 1, afterBlur 0, model 30, undoUnchanged; B member 0/0/1, deltaMember = deltaPressed = 2, Undo "Move (30)", memberAfterUndo = rest; no errors | pin-*.json/png |
| 6 | STUDIO-SMOKE | PASS both: Add → clip start 0 → drag name bar → 2.500 → Ctrl+Z → 0; Play 1.5 s clock 00:00.000 → 00:01.471; Stop holds 00:01.593/.581 (stable); export dialog opens, Esc closes; 0 page errors | smoke-*.json, smoke-*.png |
| 7 | SCALE | PASS rc 0, complete, failures [], 7 asserts: 950 / 1532 / 1868 / 200 / 42.4 / 42.4 / 116.5 | perf-scale.json |
| 8 | INTERACT | PASS rc 0, complete, failures [], problems 0 ×6 passes; 189 deterministic rows, 0 mismatches vs B's final; path-rewrites [2,2,2]; drag-group-live [1,1,1] | perf-interactions.json, interactions-compare.txt |
| 9 | RES + STUDIO-LAB | PASS rc 0 each, failures [] | latest-resources.json, latest-studiolab.json |
| 10 | VZ + MUTANT | PASS: 7 files / 189 tests; MU-402-NO-BLUR-UNPIN (own scratch) → VZ8 and VZ9 red, 8 green | vitest-a3.log, mutant-no-blur.log |
| 11 | BUDGET-SHAPE | PASS: same ids/order; exactly 7 scale rows differ (mode/budget/note, prefix = HEAD note minus suffix); interactions only path-rewrites 3→2 | checked by script |
| 12 | DOCS | PASS: doc 256 l.4 exact, 7 headings in order (after the Prompt section), 254/255 l.4 unchanged, `In Progress (stage` = 6, `C round N pending` = 0, cited files exist, budget tables match live files | — |
| 13 | RT-FIX-401 | PASS: only l.3 differs, names retro-401.md (385–400), 60 lines; retro §10 pointer matches | — |
| 14 | L57 | PASS (`l57-check.txt` OK) | |

## Notes for B (no bugs)
- A's F4 (focus falls to BODY when a clip leaves the window) is not reproducible: clips have no tab stop (no tabIndex/button in ArrangementClip or its children; probe `focusTarget` null). Close unless a clip gains a tab stop.
- A's Lows F1 residual, F2, F3, F5 (VZ11), F8 (1868 vs 2000 headroom ~7%) carry to `deferred_low_polish`; F1's early-return citation verified (StudioWorkspace.tsx:2464-2471).
- Not measured (by design): export WAV data/duration/sample integrity and audio graph output — REGRESSION-2026-11-10. Ableton conformance: n/a (PERF round).
