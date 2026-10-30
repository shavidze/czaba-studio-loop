# C round 271: SABA-B-11c stage 2 (relative snap of clip drags), independent verification

**Verdict: PASS.** `browserVerified` = `realVerified` = true. 0 round bugs. One pre-existing Low (out of scope) and two info notes for B.
Baseline: HEAD `4b912a9` + A's working tree (9 paths). `git diff` sha256 `eb4571c5…` was identical at the start and end of C's phase, so no source changed while C ran.
Env: env-status.json round 271 store 200. Real Chromium (Playwright), fresh anonymous contexts, 1440×900 and 1280×720. New build on :5173; C's own HEAD scratch (`git archive 4b912a9`) on :5185 for before/after.

## Rows
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: exactly the 9 granted paths (7 M + doc 198 M + doc 202 ??) | `git status` |
| HUNK-SCOPE | PASS. `ArrangementClip.tsx`: the import line + the one `moveStartOnGrid` call. `grid.ts`: one pure addition block (`GRID_OFFSET_TOLERANCE`, `isOnGrid`, `relativeGridStart`, exported `snapRelativeMoveStartToGridOrEdges`, `relativeGroupDelta`) + the 3 `snapGroupMoveDelta` body lines. `snapMoveStartToGridOrEdges`, `snapGroupDelta`, `snapTimeToGrid` and `adjacentGridLine` are not touched | `c-round-271/a271.diff` |
| CLAIMS | PASS: K1–K9, K11 and K12 re-run at HEAD (`git show` / HEAD scratch) and all match. K1 now shows 9 dirty paths, which is A's work. K10/K13 were re-done by C's own HEAD browser run (below) | `claims.txt`, `ui-head.json` |
| TESTS-TARGETED | PASS: 7 files, 197/197, on C's scratch (patched copy of the tree). Slowest GU1 833 ms, under 2500 ms | `vitest.json` |
| TEST-REWRITES | PASS: 15 removed `expect` lines, each replaced on the same subject (GS5/GS5b/GS6/GS6b/GS10/HS2/CM11 values, the 3 title literals); 0 lines removed from `grid-edges.test.ts`; RS1–RS5, RU1–RU8, RG1 and RG2 are additions | `git diff` |
| MUTANTS | PASS: C's own script, mutants written independently. Every §7 mutant is red as listed: ABS-SINGLE (CM11 GS6 GS10 HS2 RS1–4), ABS-GROUP (RG1 RG2 GS5 GS5b GS6b), TOL-0 (RU2), TOL-WIDE (RU6), DRIFT (RU5 RU7), EDGE-OFF (RU4 RS3 + 16 existing), GROUP-CLAMP-ZERO (RG1 RG2 GS5b), NO-BOUND-CHECK (RG2), TITLE (GS3 HS1 ST23). C extras: ROUND-TRUNC red (10 rows), FALLBACK-AT-BOUND red (RG1 GS5b), ONGRID-ALWAYS red (20 rows); NO-FLOOR survives (as B predicted); NO-INNER survives (note below) | `mutants.json`, `scripts/c271-mutants.py` |
| RS-B-OFFSET | PASS (both viewports): Alt +12 px → 10.300; +48 → 11.300; +48 → 12.300; Ctrl+Z → 11.300; Ctrl+Z → 10.300 | `ui-new.json` |
| RS-B-JITTER (F1) | PASS (both): +5 px and −5 px → 10.300; status exactly `Move clip: nothing changed — the Undo history is unchanged.`; Undo title `Undo: Move clip (Ctrl+Z)` is the same before and after. **HEAD (C's run): 10.000**, status `Move clip: start 00:10.000…` | `ui-new.json`, `ui-head.json` |
| RS-B-XLANE | PASS (both): ghost `['13.300']` read before release; lands 13.300 on `stems`; status `Move to track — Stems: start 00:13.300.` (HEAD ghost 13.000) | `shots/new-xlane-*.png` |
| RS-B-ONGRID | PASS (both): fresh context, +56 px → 11.000 (HEAD 11.000) | |
| RS-B-TRIM | PASS (both): the handle `title="Trim — left edge"` (1 handle), +30 px from 13.300 → 14.000; status `Trim — left edge: start 00:14.000…` (HEAD 14.000) | |
| RS-B-NUDGE | PASS (both): from 10.300, ArrowRight → 11.000, Undo label `Nudge clip`, Ctrl+Z → 10.300 (HEAD the same) | |
| RS-B-GROUP | PASS (both): 11.300 / 16.000, status exactly `Move (2): 2 clips moved 00:01.000 to the right.` (HEAD 12.000 / 16.700, `00:01.700`) | `shots/new-group-*.png` |
| SNAP-TITLE | PASS (both): on `Snap on — clips follow the grid (G)`; off `Snap off — free movement (G)`; paused (zoomed out with `−` until `data-snap-paused=true`) `Snap on — paused: grid lines are hidden at this zoom. Zoom in. (G)`, unchanged | `paused-new.json`, `shots/new-paused-*.png` |
| SCREEN-BUDGET | PASS: persistent text outside the timeline, HEAD vs new, the same state after RS-B-OFFSET: 1440 117/62/107 = 117/62/107; 1280 89/47/107 = 89/47/107 (line boxes / rows / texts). Empty page is equal too | `ui-*.json` screenAfterOffset |
| G271-AUTH | PASS: `/studio-lab` anonymous loads 4 lanes, `auth_user` null, no cookies (both viewports). `/studio/middle-east` signed out: "Sign in required", 0 clips, 0 audio/token requests. `/api/studio-token` with no header → 401 `Please sign in…`; with a fake Bearer → 500 `Unable to prepare Studio access`; no token in either body | `auth.json` |
| DOC-202 | PASS: l.4 byte-exact `**სტატუსი:** Completed (C round 271 PASS)`; the 7 TEMPLATE headings in order; all 17 cited test ids exist exactly once under `app` | |
| DOC-198 | PASS: l.4 byte-exact; the diff is that 1 line only | |
| LESSON-EXISTS | PASS: task §1 'Why we missed it' names L45 and L46; both are in `lessons.md` (lines 31–32). The C probes in lessons 16–38 (copy/font, tokens, focus, file chooser, perf) do not apply to this round | `lessons.md` |

Gate rows (full vitest, build, full Biome, verify, e2e smoke): `gate`, not claimed.

### C extra: real audio output (EXPORT-SHIFT)
- WAV exported with the clip at 10.000 (before) and at 12.300 (after Alt-drag + two relative-snap drags). 48 kHz / 24-bit / stereo, RIFF/data sizes valid, 0 non-finite samples.
- Duration 111.352 → 113.652 s (+2.300).
- First non-zero sample 10.0240625 → 12.3240625 s: a shift of 110400 samples (= 2.3 × 48000). 0 non-zero samples before 12.3 s.
- With the 2.3 s shift applied, 10 689 792 / 10 689 792 samples are bit-identical, at both viewports.
- So the relative-snap destination drives the rendered audio exactly (`wav-analysis.json`).

## Ableton conformance (rated separately from the CZABA requirement)
- Clip moves snap to the grid and to clip edges, with the nearer edge winning: **confirmed** (manual §6.7, B's citation, not re-fetched by C).
- An off-grid clip keeps its offset: **unconfirmed** (no source; Saba's decision (a); LIVE-MEAS-11C-OFFSET open).
- Alt bypasses snap: **confirmed** (manual §6.10, B's citation).
- Edge trims snap to the absolute grid: video riOD 2:22, as summarised by root; C did not watch it.
- Arrow nudge: **unconfirmed** (Saba question SABA-Q-11C-NUDGE); the unchanged behaviour is verified.

F1-ABSOLUTE-SNAP closes on RS-B-JITTER (browser, both viewports) + RS1 (unit). R49-T part (1) closes with it.

## For B
- **C-R271-01-NUDGE-STALE-STATUS (Low, pre-existing, out of scope). Does not change the round verdict; candidate for SYS-6 / `deferred_low_polish`.**
  - What happens: after a successful ArrowRight nudge, the clip is at 11.000 and Undo reads `Nudge clip`, but the status line still says `Move clip: start 00:10.300…`.
  - Where: `ArrangementContext.nudgeSelectedClip`'s success path calls `applyEdit` with no `setStatus`.
  - It is the same at HEAD (B's own `probe-group-nudge-head.json` shows it).
  - Next: fits SYS-6 STATUS-LIFETIME (round 272) or `deferred_low_polish`.
- **INFO-C271-MUTANT-NO-INNER.** The inner one-step-back fallback in `relativeGroupDelta` is not pinned by any row: replacing it with `return 0` survives. Optional guard row: a musical step with whole ≥ 2 that overshoots by under 1 ms.
- **INFO-C271-VITE-CACHE.** C's first HEAD scratch shared `store/node_modules`, so its Vite dep optimisation rewrote the untracked `node_modules/.vite/deps`. C fixed this with a private `node_modules` of symlinks. The mutant/vitest scratch also wrote the vitest cache under `store/node_modules/.vite/vitest` (the same pattern as A's and B's scratches). `node_modules` is git-ignored, and the tracked diff hash is unchanged. :5173 stayed healthy, and no tracked file changed.
- **A's reviewer Low (HS2 title).** Alt with Snap off now takes the relative path (HS2 7.525). The test title was not updated; doc 202 states the behaviour. No action needed beyond B's awareness.
