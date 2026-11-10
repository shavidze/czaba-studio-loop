# Round 424: PERF-FIX-R423-LANE-SHELL — a clip drag renders the lane once again (fix-up of C-R423-01, from B's reviewed sketch)

**Planned by:** B, at the round 423 → 424 planning, 2026-11-10 (`b-round-423.md`). The advisor was used after orientation and before close. The round-423 task is archived as `tasks/round-423.md` [K11].
**Decisions:** D-29z1479 … D-29z1482 (`backlog.json` v400) [K14].

## Read first
- **`lessons.md` in full** [K16]. Most relevant here:
  - L11: STOP rules.
  - L23: grants and collisions; the memo/rename clause.
  - L29, L56: claims.
  - L37, L58: perf asserts come from B's sketch run, and "equal to round N" is an assert.
  - L38: perf runs alone; warm `/studio-lab` in a browser first.
  - L57: all harness fields.
  - L59: heaviest first.
  - L60: destructive commands only in your own folder.
- **Primitives (A):** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-423/claims-424.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-423/claims-424-planning-output.txt` (stderr `claims-424-planning.err`, empty).
  - Output on B's sketch scratch: `b-round-423/claims-424-sketch-output.txt`.
  - Output on the scratch in A's end state (sketch applied, not committed, plus a stub doc 273 with the l.4 line): `b-round-423/claims-424-a5-stub-output.txt` (stderr empty).
- **Sketch review (L58):** `b-round-423/sketch-review.md` names the dispatched sha256 and holds the verdict (approve-with-lows). K15 must print `L58 OK`.

## Baseline: HEAD `875ff37`, clean tree
- **Gate 423 is `skipped`** (C FAIL) [K7], so nothing was published after round 422 and the baseline stays `875ff37` [K1]. The tree is clean (K2 `total 0`).
- **Frozen:** `b-round-423/r424-frozen-sha256.txt` has **1,319** entries: every tracked file except the 2 granted source/test files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. No auth, route, purchase or download file is touched.
- **If K1 differs at A1** (root published in between): a root-only commit that leaves `git diff 875ff37 HEAD -- app perf` empty is accepted with a note. Otherwise STOP if K5 is `no` or K3 is not rc 0.

## 0. Why this round (D-29z1479 … D-29z1481)
- **C round 423 failed on one Medium.** C-R423-01: 17 deterministic `move-components` asserts of the interactions perf spec fail. Every other row of REGRESSION-2026-11-10 part 1 passed, with `browserVerified` true.
  - The failing values: fade 6 (budget 4), trim 17 (15), video 15/14 (13/12), video-trim 17 (15), video-fade 5 (3).
  - Task 423 §7 sends a cloud-reproducible Medium to its fix-up first; part 2 of the regression moves to round 425.
- **Cause (B named it before dispatch, L37):**
  - Every clip drag gets exactly **+2 fibers per rendered lane** compared with the last green run (round 404; `b-round-423/move-components-404-vs-423.txt`).
  - The browser name probe at HEAD (`b-round-423/probe/fade-names-head.json`) shows the two extra fibers per fade-drag commit: the shell `ArrangementLane` and `Memo(ArrangementLaneViewInner)`.
  - Round 409 split the Lane into a shell that subscribes to the per-lane preview and ghost stores [K9 shell-preview-sub 1], over `memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual)` [K9 memo 1].
  - The harness counts tags 0/1/11/14/15 [K17], so shell + Memo + inner = 3 fibers where round 404 had 1.
- **Ruling: RESTORE (D-29z1481).** tech-lead: restore; the comparator always fails during a drag, and the budgets have no headroom by design. performance-optimizer dissented (accept +2; latency unchanged, `b-round-423/latency-404-vs-423.txt`). Its latency-budget idea is filed as candidate PERF-CAND-DRAG-LATENCY-BUDGET. **No budget changes** [K18 = 4 15 3].
- **Why we missed it:** `test:perf` is not a gate row and ran in no round between 405 and 422. Round 409 was dispatched from B's sketch with a leaf-name probe but without the interactions spec on the sketch (L58's "equal to round N's run is an assert" was not applied). Origin `B spec`. Retro candidate RC-R423-PERF-SPEC-ON-STRUCTURE (RETRO 435).

## Reference
Not applicable. This is a performance fix-up with no visible or behavioural change, which the reference-first rule excludes. The screen budget (L39), `product-designer`, Ableton and YouTube steps do not apply.

## 1. What A changes (sketch `b-round-423/sketch-424.patch.txt`, sha256 `942dfdb6…` [K13], 2 files)
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-423/sketch-424.patch.txt`, then `git apply` the same file. **Do not edit those two files afterwards.** If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11); do not edit around it. The sketch does this:
   - **`ArrangementLane.tsx` inner:** subscribes to the preview store itself (`useStore(useArrangementPreviewStore(), useShallow(…))`), falling back to the new prop `committedLaneClips`. It also subscribes to the lane-drag ghosts and computes `laneSources` and `laneGhostTitles`. Ghost titles read `getArrangement().clips` inside a `useMemo` keyed on the ghosts (TL-R424-L1, ruled Low).
   - **`ArrangementLane.tsx` shell:** keeps `useArrangement()`. It passes `committedLaneClips` (kept stable by `useShallow(fn)(arrangement)`), `collection`, `sourcePeaks`, `videoSources`, `sourceDurations`, `pxPerSecond` and `hasArrangementClips` [K9 sketch: shell-preview-sub 0, inner-store-sub 1].
   - **`drag-preview-render.test.tsx`:** DP2, DP49 and DP21 move `rendersOf('ArrangementLane')).toBe(2)` to `ArrangementLaneViewInner` with the same value. DP29 moves `toBeGreaterThan(0)` to the inner. All four add `rendersOf('ArrangementLane')).toBe(0)` [K10 HEAD: lane-2 3, lane-0 1, inner-2 0, lane-gt0 2 → sketch: 0, 5, 3, 1]. No assertion is lost; this is an equal-or-stronger replacement (L4).
3. **Doc:** create `docs/implementation/2026/quarter-IV/273-perf-fix-lane-shell-subscriptions.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 424 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings, in order (L26).
   - Content:
     - the cause (shell + Memo + inner);
     - the RESTORE ruling and the dissent;
     - the HEAD → sketch table from `b-round-423/perf-sketch/compare-404-423-sketch.txt`, the 17 ids only;
     - the name probe lines from `b-round-423/probe/names-summary.txt`, byte for byte;
     - the mutant block, copying the 3 lines of `b-round-423/mutants/summary.txt` byte for byte;
     - what did not return to round 404 (INFO-B423-LANE-RESTORE-PARTIAL: zoom 41 → 45, move/lane max 40 → 44, group max 44 → 48, per-move +0.2…0.5; all record-only or within budget) and the surviving round-409 saving (play start/stop 11 → 7);
     - TODO: TL-R424-L1…L3 (deferred Lows) and PERF-CAND-DRAG-LATENCY-BUDGET.
   - It cites only rows and files that exist (L26).
4. Write `a-round-424.md` as you go:
   - changed files;
   - each check with its rc and log path (`a-round-424/`);
   - reviewer findings;
   - a For B section with any Architecture note.

## 2. Grants (`b-round-423/grants-424.txt`, 3 paths)
- `app/components/arrangement/ArrangementLane.tsx` (sketch only)
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (sketch only)
- `docs/implementation/2026/quarter-IV/273-perf-fix-lane-shell-subscriptions.md` (new, whole file)
- **Nothing else.** `perf/**`, the budgets, `ArrangementContext.tsx` and `clip-lane-drag-store.ts` stay as they are. At the end, `git status --short --untracked-files=all` shows 2 ` M` lines and 1 `??` line.

## 3. A's checks (the full suite, the perf spec and verify belong to the gate and to C)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-423/claims-424.sh` at the start | Equals `claims-424-planning-output.txt`, except K12, which is compared by "every id located, none `NOT-FOUND`"; stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-423/covering-files.txt)` (12 files: every test that names the lane fibers, the preview lane hook or the lane ghosts) | rc 0; **12 files, 291/291** (`b-round-423/precheck-a2.log`). `drag-preview-render` alone is 77/77 |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each (B: `precheck-typecheck.log`; lint rc 0 with 205 warnings and 1 info, `precheck-lint.log`) |
| A4 | `npx biome check` on the 2 granted code files | rc 0, no fixes (`precheck-biome2.log`) |
| A5 | Claims at the end | K1 stays `875ff37`. K2, K3, K5, K6, K9, K10 and K20 equal `claims-424-a5-stub-output.txt` (K2 `status  1 ??  2 M total 3`, K5 `no`, K6 `1` with the l.4 line). K4 rc 0. Every other line equals the planning output (K12 by "every id located") |
| A6 | `code-reviewer` on the diff and doc 273 (3 files) | No Critical, High or Medium in the sketch logic (otherwise STOP, L11). TL-R424-L1…L4 are not new findings. Fix doc findings in the doc |

A does not run `npm run test:perf`; C runs it (L38: alone).

## 4. C's acceptance
**Before hand-off:** write `c-round-424.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-423/mutants/summary.txt` and `affectedChecksRunOnSketch` = `b-round-423/perf-sketch/compare-404-423-sketch.txt`, `precheck-a2.log`. Then run `python3 -I tools/l57-check.py c-round-424.json c-round-424/l57-check.txt`.

**Order (L59, heaviest first):** rows 1, 3 (perf, alone), 4–7 (browser), then 2, 8, 9. Write `c-round-424/progress.json` after every row. Never run vitest or a build while the perf spec or a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation and stderr is empty. K15 prints `L58 OK`. K12 lists every id with a location, none `NOT-FOUND`. Status shows only the 3 granted paths; frozen 1,319 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-424.patch.txt` to a `git archive HEAD` scratch under `c-round-424/` (or `/tmp`) and `cmp` the 2 files against the working tree: identical. A2's command gives 12 files, 291/291. The patch has 2 `diff --git` headers |
| 3 | **RR-PERF** (C-R423-01) | `npm run test:perf` in `store/`, **alone**, after a browser warm-up of `/studio-lab`. Pass: rc 0; all 5 specs pass; `complete` true; 0 aborts; 0 page errors (B's full run on the sketch: 5 passed in 19.1 min, every spec `complete` with 0 failing asserts, `b-round-423/perf-sketch-full/summary.txt`). **Every one of the 17 ids in `c-round-423.json` bug C-R423-01 passes, with the median equal to B's sketch run** (`b-round-423/perf-sketch/compare-404-423-sketch.txt`: fade 4 / 3.933, trim 15 / 14.75, video stopped 13 / 9.883, video playing max 12, video-trim 15 / 12.817, video-fade 3 / 2.95). No `components` row is above its round-423 value (`c-round-423/perf-results/latest-interactions.json`). **Record:** `interact.drag.video.playing.move-components-per-move` and `interact.drag.video-trim.playing.move-components-per-move` (record rows; they moved by ±0.07 between B's two sketch runs). Save `latest*.json` under `c-round-424/perf-results/`. Mutant: HEAD = the round-423 run (17 red) |
| 4 | **NAME-PROBE** (browser, dev :5173 = A's tree; **1440×900 only**, as B's probe) | Copy `b-round-423/probe/fade-names.mjs` to `c-round-424/probe/` and run it with `fade`, then `trim`. **Assert** (equal to the sketch lines of `b-round-423/probe/names-summary.txt`): fade maxSize = meanSize = 4; trim maxSize = meanSize = 15; `ArrangementLane` 0 and `Memo(ArrangementLaneViewInner)` 0; `ArrangementLaneViewInner` = the commit count; 0 errors. **Record:** the commit count (wallclock, L37; B saw 59). The HEAD lines in the same file are the control (6 / 17, shell = commits) |
| 5 | **GHOST-TITLE** (browser, both viewports) | Copy `b-round-423/probe/ghost-title.mjs`, run it on :5173. Pass: equal to `b-round-423/probe/ghost-title-summary.txt` (HEAD = sketch): one ghost on lane `stems`, label `00:00.250Middle East — public preview`, 0 errors |
| 6 | **LANE + LEAF** (browser) | Copy B's sketch-run copies: `b-round-423/probe/lane/leaf-probe-409.mjs`, `b-round-423/probe/lane/lane-actions-probe.mjs` (both viewports) and `b-round-423/probe/tools/leaf.cjs` (change its `SH` to `c-round-424/shots`; it writes `../out/<OUTN>.json` relative to its folder). **Oracle = B's sketch outputs** (`b-round-423/probe/lane/leaf-probe-sketch.json`, `lane-sketch-*.json`, `b-round-423/probe/out/leaf-sketch.json`; compare in `b-round-423/probe/lane-leaf-video-compare.txt`: 0 diffs vs C round 423 on the first two, 0 non-timing diffs on `leaf.cjs`). **Assert:** every leaf-probe count equal to the oracle, except LibraryPreviewViewInner ±1 (C round 423 jitter); lane-actions `ok` true with steps equal; every `leaf.cjs` field equal except `.pos` and `.aud.ctx`. **Record:** `.pos` and `.aud.ctx` (wallclock; B saw `.pos` differ by up to 50 ms between runs of the same code path) |
| 7 | **VIDEO + PLAY SMOKE** (browser, both viewports) | Video: copy `b-round-423/probe/video/video-probe-c406.mjs`. **Assert** (round 406 VIDEO-SYNC, `tasks/round-406.md` row 3): every sample `paused` false and \|drift\| ≤ 0.05 s; swaps and fallbacks 0. **Record:** max \|drift\| (C round 423: 0.013 s; B sketch: 0.012 / 0.007 s, `lane-leaf-video-compare.txt`). Play smoke as R423-HELD-ENTER (`c-round-422/scripts/smoke.mjs`): Space plays (≥ 0.9 s per ≥ 1 s, L48), stops frozen 500 ms, 0 page errors. The drag-and-undo behaviour of fade, trim, move and video drags is covered by the perf spec's `interact.harness.*-live` rows in row 3 |
| 8 | **AUTH** (fresh context, both viewports) | As G423-AUTH (`c-round-423/auth/`): `/studio-lab` opens anonymously with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 9 | **DOC + SOURCE-SCOPE end + L57** | Doc 273 l.4 is byte-exact `**სტატუსი:** Completed (C round 424 PASS)`; the 7 TEMPLATE headings are in order; the mutant block equals `b-round-423/mutants/summary.txt` byte for byte; every cited row and file exists. The end claims equal the start claims. `git diff HEAD --stat` lists only the 2 granted code files. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's full run on the sketch: `b-round-423/precheck-full.log` (264 files, 3,957/3,957) |

**Retries (rows 3–8):** a cold-server first load, a port in use or an overlapped job is an environment problem (L38). Keep the log; retry at most twice; it is never a FAIL. A failing budget on a valid isolated run is a finding.

## 5. Rows and mutants (`b-round-423/mutants/summary.txt`)
| Row | What it proves | Red under |
|---|---|---|
| DP2, DP49, DP21, DP29 (`ArrangementLane` 0) | a drag commit does not re-render the shell | MU-SHELL-SUBSCRIBES: HEAD `ArrangementLane.tsx` with the sketch tests, 4 red (`mutants/mutant-SHELL-SUBSCRIBES-HEAD.log`) |
| the 17 C-R423-01 perf ids | the fiber count per drag commit is back at round 404 | MU-PERF-HEAD: the C round 423 run, 17 red |
| NAME-PROBE | shell and Memo(lane) at 0 per drag commit in a real browser | HEAD lines of `probe/names-summary.txt` (shell 59) |

**Neighbouring behaviour that could break (watch first):**
- **RB-LEAF7…9:** a clip move renders only one inner, and unaffected lanes skip (`render-budget`, in A2).
- **Ghost titles on a cross-lane or group drag:** row 5.
- **Waveform peaks and video-audio status on lane clips:** `laneSources` moved into the inner (rows 6 and 7).
- **The meter, fader and clip-gain no-lane-render rows:** `track-meter-ui`, `fader-pointer-preview` and `clip-gain-pointer-preview`, all in A2.
- **Undo during and after a drag:** row 7.

## 6. Outcome, fixed in advance (D-29z1481)
| C result | B at the 424 → 425 planning |
|---|---|
| PASS (no Medium+ finding; Lows → `deferred_low_polish`) | C-R423-01 closes. Round 425 = REGRESSION-2026-11-10 part 2 on the new baseline (the round-390 template). When part 2 closes, B updates `regression-last.json`. Then SYS-2 stage 2a, unless Saba has answered `AGREE-STEM-LANES.md` (then STEM-LANES first) |
| A perf id still red on a valid run | Round 425 = re-plan with the named fibers of the failing drag (L37); part 2 follows |
| A STOP | B rules on it before anything is re-dispatched (L10) |
| PARTIAL (time limit) | Round 425 continues from `progress.json` |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |
