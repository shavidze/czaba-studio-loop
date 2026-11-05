# CURRENT TASK — Round 349: PERF-CAND-VIDEO-TRIM-FADE-ROWS. The interactions harness measures a video clip's trim-start and fade-in drags (22 new `record` rows)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 348 → 349 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v310 → v311, D-29z1106…D-29z1110):
- **D-29z1106:** round 348 closed as PASS from C's evidence (`c-round-348.json`: PASS, `browserVerified`/`realVerified` true, 10 rows, 0 bugs, 0 blocked). Gate 348 `published` **`70751a5`** on both remotes [K1]. **Baseline = `70751a5`**, clean tree [K2]. Stage conversions → done. Oracle: `c-round-348/perf-store-results/latest-interactions.json` (230 rows, 70/70 asserted pass).
- **D-29z1107:** round-348 notes routed (§5).
- **D-29z1108:** the L31 ruling for this round (§0.3). ROOT-REQ-PERF-TIMEOUT is overdue under L46.
- **D-29z1109:** the shape (§0.2). 22 rows, all `record`, owner `PERF-CAND-VIDEO-TRIM-FADE-ROWS`.
- **D-29z1110:** this task.

**Read first:**
- `lessons.md` items 10, 11, 22, 29, 34, 37, 38, 56, 57 and 58. For C, also 59 and 60 (destructive commands only inside `c-round-349/`, with absolute paths).
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md` (doc 232). No app source changes, so `AUDIO_ARCHITECTURE.md` is background only.

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, the screen budget and the YouTube request do not apply.** This is a perf-harness round. App source, DOM, audio and behaviour do not change.

## Baseline
- HEAD `70751a5` (gate 348, published), clean tree [K2]. Protected files 11/11 OK [K8]. No dependency change.
- **Oracle:** `c-round-348/perf-store-results/latest-interactions.json`. It has 230 rows, is `complete`, has 0 failures, and its 70 asserted rows all pass [K3]. The video block measures only the name-bar move drag (`interact.drag.video.*`, 10 rows, plus `interact.harness.drag-video-live`) [K3][K4].

## 0. Why, and B's evidence

### 0.1 Premise
D-29z1088 and D-29z1104 queued PERF-CAND-VIDEO-TRIM-FADE-ROWS right after the conversions. They asked for record rows first and asserts after C has measured them (L58). Video clips have trim edges and fade handles:
- the fade handle's testid is `arrangement-video-fade-in-handle` [K5];
- the trim-start edge has the same title as on audio clips [K5];
- the handles render when the clip is at least 24 px wide [K5];
- the fade preview goes through the same `previewGeometry` path as audio [K5].

The harness has never dragged any of these. Its fade target is hard-coded to the audio testid [K4]. No other test file consumes `drag.video` ids. The sweep over `app`, `perf` and `e2e` hits only the spec [K12]. `report.test.ts` pins only the 16 windowed `commits-per-move` rows, and this task adds none [K6].

### 0.2 The change (`b-round-348/sketch/`)
- **Spec** (`spec.patch.txt`, made by `apply-spec.py`):
  - `dragTarget` gets a `kind` argument (`'audio'` by default) and picks the video fade testid for video;
  - `DragMeasure` gets an optional `kind`;
  - the 1×-only video block loops over move, trim and fade: stopped first, then Space, then playing (each playing drag after Home), then Space;
  - each drag is reset with Ctrl+Z, as before;
  - helpers `videoDrags`, `videoDragBaseId`, `videoDragLiveId` and `videoDragMeasure`;
  - the sequence text is updated.

  The move drag keeps its ids, its `liveId` and `rows: 'all-but-ratio'`.
- **Budgets** (`budgets.patch.txt`, made by `apply-budgets.py`): 22 rows are inserted after `interact.harness.drag-video-live`, all `record`, with budget `null` and owner `PERF-CAND-VIDEO-TRIM-FADE-ROWS`:
  - `interact.drag.video-trim.<state>.*` and `interact.drag.video-fade.<state>.*`. Each has the four rows `move-components-per-move`, `move-components-max`, `release-commits` and `move-to-paint-p95`, and the playing state adds `move-restarts` and `release-restarts`. That makes 10 rows per gesture. Each row copies its `kind` from the matching `interact.drag.video.<state>.<metric>` row.
  - `interact.harness.drag-video-trim-live` and `interact.harness.drag-video-fade-live`. Each is 1 only when both the stopped and the playing drag were live.

  Rows go from 230 to 252. Asserted rows stay at 70 [K3].

### 0.3 B's runs and the L31 ruling (D-29z1108)
Both runs used a production build, ran alone, one after the other (`b-round-348/run-sketch-perf.sh`), and are summarised by `b-round-348/summarize-perf.py` in `b-round-348/perf-summary.txt`:

| Run | rc | Rows | Asserted pass | NEW | Deterministic rows ≠ C348 | `durationMs` |
|---|---|---|---|---|---|---|
| HEAD control (`perf-head-results/`) | 0 | 230 | 70/70 | 0 | 0 | 459503 |
| Sketch (`perf-sketch-results/`) | 0 | 252 | 70/70 | 22 (all expected) | 0 | 496938 |

New rows on the sketch. Every deterministic row was identical in all 3 passes, and the two liveness rows read 1 in 3/3 passes:

| Gesture | per-move (stopped / playing) | max | release-commits | move-restarts | release-restarts |
|---|---|---|---|---|---|
| video trim-start | 18.683 / 18.717 | 19 | 1 | 0 | 31 |
| video fade-in | 8.85 / 8.85 | 9 | 2 | 0 | 31 |
| (existing) video move | 15.75 / 15.783 | 17 | 1 | 0 | 31 |

The sketch's budget notes differ from the run's bytes in one word ("video video clip" → "video clip", reviewer L2). Notes are not read by the harness.

**L31 ruling.**
- The declared limit is 900000 ms (`playwright.perf.config.ts`) [K7], so the L31 bound is 450000 ms.
- The HEAD control took 459503 ms (51 %) and C round 348 took 454664 ms. The bound was already crossed before this round.
- The new rows add a measured +37435 ms on the same machine, so the sketch took 496938 ms (55 %).
- Ruled: accepted for this round, because 55 % leaves 45 % headroom and one pass takes about 2.5 min.
- **A STOP** if any A run has `durationMs` > **540000** (60 %).
- **No further interactions-spec rows are added after this round** until root applies ROOT-REQ-PERF-TIMEOUT (`timeout: 25 * 60 * 1000`) or a split lands. B cannot split the spec now: the shared drag measurers are question 3 of the unanswered ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (ARCH-R339-DRAG-MEASURE-EXTRACT). The request is overdue under L46; see `b-round-348.md` "For root".

**What the numbers mean (recorded, not a budget).** The video trim moves render 18.683 components per move, above the item's ≤ 15 target. The video fade renders 8.85 per move, against 3.933 for the audio fade. A video edit released during playback restarts the graph (31 `start()` calls), the same as the video move. These go to PERF-CAND-VIDEO-TRIM-FADE-COST, the next stage, and assert rows follow once C has measured them (L58).

**Sketch review (L58).** `tech-lead` stood in for the code-reviewer, which is not on the planner's consult list. Its findings and B's rulings:
- **M1 (Medium):** the trim and fade grabs need timeline x ≈ 0 on screen, and the zoom keys anchor on the playhead. **Ruled (no change):** the sketch grabbed live in 6/6 drags × 3 passes (liveness 1, 3/3). A missing grab throws inside the pass (after the locator's `toHaveCount(1)` wait), so the pass aborts at that step. The rows of every later step get no sample. For the asserted rows this is `interact.drag.video.playing.release-commits` and `.move-restarts`, which `report.ts` then reports as failed asserts with no samples [K14]. The run also reports `N rows short of 3 samples because a pass aborted` [K14]. The failure is loud, not vacuous. `interact.harness.drag-video-live` keeps the sample of the stopped move, which ran first. Adding Home before the zoom-in loop would change the setup state of the asserted video move rows, so it is not done in this round. If C or the gate sees an aborted video step, it is a finding against this ruling.
- **L1:** `report.ts` checks determinism on `record` rows too. The new deterministic rows were identical 3/3 on the sketch.
- **L2:** typo, fixed.
- **L3:** the spec line is 100 characters. Biome does not process `perf/` (L30), and `npm run typecheck` covers it.

## 1. Scope (A)

### 1.1 Files (exactly 3)
| # | File | Change |
|---|---|---|
| 1 | `perf/studio-lab-interactions.perf.spec.ts` | `git apply b-round-348/sketch/spec.patch.txt` (or `python3 -I b-round-348/sketch/apply-spec.py <store> --allow-store`; same bytes) |
| 2 | `perf/budgets.interactions.json` | `git apply b-round-348/sketch/budgets.patch.txt` (or `python3 -I b-round-348/sketch/apply-budgets.py <store> --allow-store`; same bytes) |
| 3 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.2 |

Untouched: all of `app/`, `perf/lib`, the other perf specs and budget files, `e2e`, config (including `playwright.perf.config.ts`) and the protected files.

### 1.2 Doc 232 (Georgian, technical terms in English)
L34: the task grants the doc's whole harness-contract text, so every place that lists the video block's steps or rows is updated.
- **l.4 status:** `In Progress (stage conversions of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii, c6-i, c6-ii, conversions, video-trim-fade; C round 349 pending)`. "C round 348 pending" is removed [K11].
- **Title line:** append `, ეტაპი video-trim-fade — video კლიპის trim/fade-ის perf row-ები`.
- **New section** `### ეტაპი video-trim-fade: video კლიპის trim და fade-ის perf row-ები (round 349, D-29z1109)`, after the conversions section. It covers:
  - the new rows (record);
  - the table in §0.3;
  - the L31 ruling and the no-more-rows rule;
  - the M1 ruling;
  - the cost finding (PERF-CAND-VIDEO-TRIM-FADE-COST).
- **Testing, changed files and TODO:** add A's run. In TODO, mark the conversions line done (C round 348 PASS), and replace "PERF-CAND-VIDEO-TRIM-FADE-ROWS (შემდეგი ეტაპი)" with PERF-CAND-VIDEO-TRIM-FADE-COST (next stage) → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS.
- **The `## ` count stays 7** [K11].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-348/claims-349.sh` from the loop root | equals `b-round-348/claims-349-planning-output.txt` |
| A-CLAIMS final | same | K3, K4, K5, K6, K7, K12, K13 and K14 equal `b-round-348/claims-349-sketch-output.txt`. K2 = `70751a5 3`. K8 = 11. K10 = `0` and `untracked 0`. K11 = `7 1 0 1` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 (the ceiling is exactly met at HEAD, see `a-round-348.md`; `perf/` is not linted) |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-348/perf-store-results/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | rc 0; `complete`; `failures` []; 252 rows; **70/70** asserted pass; NEW = exactly the 22 ids of §0.2; 0 existing deterministic rows that differ from C348; both new liveness rows 1 in 3/3 passes; each new deterministic row identical across its 3 passes; `durationMs` ≤ 540000 and recorded |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` | 40/40 (reads `budgets.interactions.json`) |
| A-REVIEW | `code-reviewer` (3 files) | 0 Medium+ open, or each one ruled by id in §0.3 (M1); Architecture note passed to B |

No `app/` file changes, so A runs no `app/**` vitest file; the spec is checked by A-PERF and `npm run typecheck`.

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-348/claims-349.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check` of both `b-round-348/sketch/*.patch.txt` | 3 modified, 0 untracked; both patches reverse-apply |
| READ | read the diff | Existing video move ids, `liveId` and `rows` unchanged; the audio `dragTarget` calls still default to `'audio'`; 22 budget rows added, all `record`, 0 existing rows changed (python diff of the JSON vs HEAD) |
| PERF (browser, production, alone) | A-PERF's command | as A-PERF; values within the §0.3 table for the deterministic new rows (identical, or any difference listed as a finding with its `details`) |
| GRAB-PROBE (browser, production run's own results) | from C's PERF result, read each new row's `details` (`stoppedBefore`/`Mid`/`End`, `playingBefore`/…) on the two liveness rows | trim: `data-clip-start` grows start → mid → end; fade: `data-fade-in` grows start → mid → end, in all 3 passes. This proves the new rows measure the real gestures, not an aborted step |
| MUTANT (C's own, scratch, predicted before running) | One harness mutant on a scratch copy (L59/L60), run alone. Suggested: `dragTarget`'s video branch returns the audio fade testid. Predicted: rc 1; each 1× pass has `abortedAt` = `drag interact.drag.video-fade stopped` (after the `toHaveCount(1)` wait); `passes[].problems` records the abort; `failures` lists `rows short of 3 samples because a pass aborted` and failed asserts with no samples on `interact.drag.video.playing.release-commits` and `interact.drag.video.playing.move-restarts`; `interact.harness.drag-video-live` stays 1 and passes (stopped move sample); the video-trim stopped rows have 3 samples; the video-fade and all playing video rows have 0. The 6× rows are unchanged | red as predicted; scratch deleted; `store/` unchanged |
| PERF-LIB | A-PERF-LIB | 40/40 |
| G349-AUTH (browser, both viewports) | fresh anonymous context | `/studio-lab` opens with the workspace and demo badge, `auth_user` is null; `/studio/<id>` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` refuses (401/400/405; 500 only when the mock on :5199 is down, and then it is listed under `blocked`) |
| VIDEO-SMOKE (browser, 1440×900 and 1280×720, dev :5173) | `/studio-lab`: import `public/videos/hero/1.mp4` via the video lane, zoom in, drag its trim-start edge and its fade-in handle with the mouse, then Undo each | each previews during the drag, commits one history entry on release, and Undo restores it (no behaviour change; checks that the measured gestures are real user gestures) |
| DOCS | doc 232 | l.4 as in §1.2; one `### ეტაპი video-trim-fade` section; 7 `## `; 0 "C round 348 pending"; every row count and value the doc states matches the live file and A's run (L34) |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** PERF, GRAB-PROBE, MUTANT, G349-AUTH and VIDEO-SMOKE all run here; none needs the backend.
**Ableton conformance:** not applicable (harness only; behaviour identical).
**All L57 fields** go in `c-round-349.json`. `mutantRedOnSketch` = null with the reason "record rows; no B mutant; C's harness mutant is in `mutantRedOnTree`". `affectedChecksNamed` = the interactions perf spec and `perf/lib/report.test.ts`; `affectedChecksRunOnSketch` = `b-round-348/perf-sketch-results/latest-interactions.json`, `b-round-348/perf-head-results/latest-interactions.json`.

## 3. Neighbouring behaviour that could break
- **The asserted video move rows** run in the same block. On the sketch they were unchanged against C348 (0 deterministic differences). If a trim or fade step aborts, they lose their samples (M1).
- **The spec's duration** goes up by about 37 s (§0.3).
- **The 6× passes** do not run the video block, so nothing changes there.
- **`report.ts` determinism check** now covers 22 more rows. They were all 3/3 identical on the sketch.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- A patch does not apply, or a change is needed outside the 3 files.
- A-PERF: any asserted row fails; any NEW row outside the 22; any existing deterministic row that differs from C348; a liveness row below 1; a new deterministic row that differs across its passes (`report.ts` reports it); an aborted step; or `durationMs` > 540000.

## 5. Routed from round 348 (D-29z1107), not in scope
- **GATE348-S1 = A-R348-REVIEW-L1** (Low): in DP63/DP65, if `pointerUpAt` inside `try` throws, the `finally` calls it again and can hide the first error. → `deferred_low_polish`, joined to ARCH-R348-DP-GESTURE-CYCLE.
- **GATE348-S2** (Low): after a failed assertion, the `finally` releases the pointer but skips `undo()`. → `deferred_low_polish`, joined to ARCH-R348-DP-GESTURE-CYCLE.
- **GATE348-S3/S4/S5** (info): zero headroom on `max` rows (intended), the move `<= 16` hides about 1.5 components of steady-state regression (tracked by PERF-CAND-MASTER-GROUP-FADER-PROPS), and the doc is consistent. → closed_info.
- **A-R348-REVIEW-INFO** ("ceil of 15" wording in a note) → closed_info.
- **C-R348-PERF-DURATION** (C's note: 454664 ms > 450000) → evidence on ROOT-REQ-PERF-TIMEOUT, ruled in D-29z1108.
- **Architecture signals** (not scheduled):
  - ARCH-R348-DP-GESTURE-CYCLE: the gate proposes a `runGestureCycle` helper for DP63/DP65 (rounds 346–348 all edited these blocks). It joins ARCH-R346-DP-HARNESS-EXTRACT.
  - The crossing-commit note is already ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.
- **Later, recorded:** PERF-CAND-VIDEO-TRIM-FADE-COST (next stage), PERF-CAND-MASTER-GROUP-FADER-PROPS, PERF-CAND-FADE-RELEASE-COMMITS and PERF-CAND-CHROME-ICONS.

## 6. Deliverables
- **A:** the 3 files; `a-round-349.md` with the A rows; logs in `a-round-349/`.
- **C:** `c-round-349.md`, `c-round-349.json` and `c-round-349/`.

## 7. Claims
Run `bash b-round-348/claims-349.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.
- **Expected outputs:** `b-round-348/claims-349-planning-output.txt` (HEAD) and `b-round-348/claims-349-sketch-output.txt` (B's sketch `/home/runner/b348-scratch/sk`: spec and budgets applied, no doc change; K2 reads `no-git` there).
- **K1:** gate 348 `published` `70751a5`.
- **K2:** HEAD and the `git status` entry count.
- **K3:** budgets: row count, asserted count, the rows this task owns (all `record`), and the video-trim, video-fade, liveness and video-move row counts.
- **K4:** spec: the video and audio fade testids, the `videoDrags` constant, the old literal move `liveId`, and the `rows: 'all-but-ratio'` count.
- **K5:** `ArrangementClip.tsx`:
  - the fade testid prefix line;
  - the trim-start title, rendered once for both kinds;
  - `FADE_HANDLE_MIN_CLIP_PX = 24`;
  - `data-fade-in`;
  - `setFade` picks the video setter;
  - the `previewGeometry` line.
- **K6:** `report.test.ts` pins 16 windowed drag rows and reads `budgets.interactions.json`.
- **K7:** `playwright.perf.config.ts` timeout is `15 * 60 * 1000`.
- **K8:** protected files OK.
- **K9:** `regression-last` date.
- **K10:** `app/`, `perf/`, `e2e/` and `docs/` diff lines outside the 3 files; untracked files.
- **K11:** doc 232 `## ` count, the video-trim-fade section, "C round 348 pending" and "C round 349 pending".
- **K12:** the `SWEEP` of `drag\.video|drag-video` over `app`, `perf` and `e2e`, excluding the budgets JSON: only the spec.
- **K13:** the kept B artifacts exist (`test -f`, 7 files).
- **K14:** `perf/lib/report.ts`: an assert row is reported when the run is `complete`, even with no samples, and an aborted pass adds the "rows short" failure (two line greps).
