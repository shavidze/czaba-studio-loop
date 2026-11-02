# B round 303 → 304 planning

**Date:** 2026-11-02. **Decisions:** D-29z793 to D-29z798. **Next task:** `current-task.md`, round 304, PERF-3c (zoom harness rows and the recorded PERF-3 exit decision).

The round-303 task was copied to `tasks/round-303.md`. No archive existed before; nothing was moved.

## 1. Evidence read
- **C round 303** (`c-round-303.json`, `c-round-303.md`): **PASS**.
  - Every H-* row passed at both viewports. RV-EN, G303-AUTH (second, valid run), SOURCE-SCOPE, CLAIMS and DOC passed. C re-ran NB1–NB9 + NB4b and the 12 collision rows.
  - 0 bugs. `browserVerified` and `realVerified` are true.
  - 1 row BLOCKED: backend unavailable in cloud (the purchased first add).
  - Gate rows are not claimed.
- **A round 303:** 9 paths. Grants 1 and 2 are byte-equal to B's sketches. Covering set 20 files / 386 tests. Mutants m1–m9 red. A raised a STOP on K9/K10 only.
- **Gate 303** (`gates/gate-round-303.json`): `published`, commit `53fc8df…`, on both remotes. Review score 9/10, no blocker:
  - Low 1: the hint names only a mouse action.
  - Low 2: the first-add test helper exists 3 times.
  - Info 3 and 4.
  - Architecture signals 3 and 4.
- **Baseline for round 304:** HEAD = `53fc8df`, clean tree (B checked; claims K1/K2).
- **No new Saba, root or user-review decision file.** `user-review/` has nothing newer than `b-round-302.md` except the existing `design-ux-decisions.md` and `ableton-decisions.md` (unchanged content, already scheduled).
- **Regression:** `regression-last.json` is 2026-11-02 (round 301), so the next one is due on 2026-11-05. Round 304 is not a regression round.

## 2. Backlog updates (C and gate evidence only)
Script: `b-round-303/update-backlog.py`. The backlog version is now 263. Backups: `b-round-303/backlog-before-304.json`, `feature-status-before-304.md` and `b-next-before-304.json`.

- **D-29z793:**
  - Round 303 → `c_pass_published`.
  - NAME-AND-HINT-b → done, and NAME-AND-HINT → done (browser-verified at both stages).
  - **K9/K10 ruling:** C's reading is confirmed. The +1 line shift was forced by B's own byte-equal grant 2, so the contradiction was in B's task and A's STOP was correct.
  - Standing rule: a line claim on a granted file is compared by content.
- **D-29z794 (findings triage):**
  - Gate L1 → `SABA-Q-NAME-HINT-KEYBOARD` (`awaiting_user`), plus deferred Low `GATE303-L1-HINT-KEYBOARD`. Keyboard move does exist: Nudge with ← / → (shortcut sheet, `shortcuts.ts` l.106 at 53fc8df). So the question is about copy only.
  - Gate L2, Architecture signal 3 and A's reviewer naming/NB9 Lows → one deferred Low, `GATE303-L2-FIRST-ADD-HELPER`. Signal `GATE303-ARCH-STATUS-EXPECTATIONS` is added to the open ARCH-CHECKPOINT-STUDIO-LINK request.
  - A's reviewer restored-hint Low → info `A-R303-INFO-RESTORED-HINT`.
  - `INFO-C303-WAV-PEAK` recorded.
  - No Medium+ finding.
- **D-29z795:** the PERF-3 exit was measured at HEAD (§3). It is not met. PERF-3d is added as a fourth stage.
- **D-29z796:** the PERF-3c rulings.
- **D-29z797:** architecture signal `B-R303-PERF-HARNESS-METRIC-FAMILY`.
- **D-29z798:** round 304 is dispatched. RETRO is round 305, and PERF-3d is round 306.
- **No item became done without a browser.** Round 303's browser rows all ran.

## 3. Round 304: PERF-3c

### 3.1 B's HEAD measurement
B built HEAD in scratch (`/tmp/b304/head`, from `git archive`), started a production server on :5304, ran the probes and stopped the server. The store tree was not touched.

**Probe setup:**
- Probes: `b-round-303/zoom-probe.cjs`; `zoom-probe-realwheel.cjs` (real `keyboard.down('Control')` + `mouse.wheel`).
- 30 clips; 2 runs × 1440/1280 for each mode.
- Results: `b-round-303/probe/*.json`.

| Mode | Per-key / per-step | Crossings (30 `d` rewrites) |
|---|---|---|
| in-first keys | ET 16–24 ms on every key, LoAF 0 | none |
| out-first keys | key 3 **56** ms, key 8 **80–88** ms, others ≤ 24 | keys 3 and 8 |
| wheel, synthetic (in-page `WheelEvent`) | wheel→2rAF 20–31 ms; crossings 46 / 75–85 ms | steps 4 and 7 |
| wheel, real input | LoAF 75–76 ms on step 7; wheel→2rAF has a ~65 ms CDP floor, so it is not used | steps 4 and 7 |

The synthetic wheel numbers are labelled synthetic and are not used as the recipe. The real-input recipe moves the slider and crosses at the same steps.

**Exit:** the target in perf-plan l.29 (p95 < 50 ms with 30 clips, ≤ 1 commit per step) is not met on the band-crossing keys. The criterion is not relabelled. With n = 10 the p95 is the maximum per key, and the target is read as the median of 3 runs in both directions.

### 3.2 Why harness first, and the fix in PERF-3d
- One stage per round.
- The fix must be measured against rows that can see the crossing. The current harness's in-only path cannot.
- performance-optimizer and tech-lead both recommend closing 3c as a measurement stage.
- PERF-3d is round 306, after the fixed RETRO at 305, unless a Medium+ comes first.

### 3.3 Consults
- **performance-optimizer:**
  - Add both directions.
  - Wall-clock rows are `record`.
  - Assert the deterministic rows.
  - Wheel via `keyboard.down` + `mouse.wheel`.
  - Band cost = `buildPeakShape` ×30 with `toFixed(3)` (~3 MB of path text) plus SVG re-parse.
  - Fix options: (a) integer path heights; (b) a shape cache.
  - Deferring the swap would break the ≤ 1 commit rule.
- **tech-lead:**
  - A separate `measureZoomPath`; the existing rows stay byte-identical.
  - 1× only, so no `.6x` rows.
  - The wheel runs last, after "stop with 30 clips".
  - The observer goes in its own lib module, switched on only around zoom, filtered to the waveform testid; the ruler is observed via a stable ancestor.
  - New doc 222.
  - Architecture debt: per-spec report builders.
- **B's ruling where they differ:** tech-lead suggested asserting the in-first p95 < 50. B keeps every wall-clock row as `record`, because the runner is shared and with n = 10 the p95 is the maximum. The 50 ms target becomes C's EXIT decision row. Only deterministic rows are asserted.
- **Advisor:** available and consulted once before writing. B followed its points:
  - do not mark PERF-3 Completed;
  - check the determinism units;
  - probe the real wheel recipe;
  - read `oss-adoption.md` (no zoom item);
  - tag the timeout (K9);
  - re-grep the consult file:line references (claims K5–K25);
  - write the task after the consults;
  - leave `lessons.md` to RETRO 305.

  - **Departure from the advisor, recorded:** the advisor first suggested doc l.4 "In Progress (stage 3 of 4)". B followed tech-lead instead. Docs 212 and 213 close as stage docs ("Completed (PERF-3x stage; …; PERF-3 exit → doc 222)"), and the PERF-3 exit is tracked in doc 222 and the backlog (task §4 ruling).
- **Second advisor call (hand-off review):** acted on all of it:
  - tags K27–K32 (`median`, `report.test.ts`, the vitest include, the waveform `svg > path` structure, perf-plan l.29, the C285 runtime of 300.7 s = 33 %);
  - m1 is now a unit mutant in a required `zoom-probe.test.ts`, run with a scratch vitest config. The HEAD probe saw 0 foreign `d` writes during zoom, so a browser m1 could not turn red;
  - the K19 after-change comparison;
  - the stage-doc ruling;
  - the stale feature-status clause.
- **Reference-first** does not apply to a perf/harness round (policy: "Not in scope: pure performance…"). product-designer is not needed, because nothing user-visible changes.

### 3.4 What C checks, and what counts as success
- **Browser rows:**
  - PERF-RUN: alone; rc 0; every assert PASSes; new rows in/out/wheel rewrites 0/60/60.
  - PROBE-EQUIV: an independent probe at 1440×900 and 1280×720 agrees on the crossing keys.
  - EXIT: a written decision with numbers, whatever the outcome.
  - G304-AUTH.
- **Offline rows:** SOURCE-SCOPE (no `app/**` diff), CLAIMS, DOC and MUTANTS.

### 3.5 Neighbours at risk
- the `interact.drag.fade.30.*` rows (state after the new paths);
- the existing zoom rows;
- total perf runtime against the 15-minute timeout;
- an observer leaking into later rows.

## 4. Order after 304
1. Round 305: RETRO (window 290–304), with the whole-screen and journey review (product-designer, design-philosopher, first-visit-host) and the For-Saba proposals.
2. Round 306: PERF-3d.
3. PERF-COMMIT-RESCHEDULE, PERF-4, PERF-5, PERF-7, PERF-8, PERF-DRAG-PREVIEW, PERF-9…15.
4. STEM-LANES.
5. SYS-1…3.
6. STORE-2b…5.
7. REVIEW-RECOMMENDATIONS.
8. T12-ADVANCED.
9. The phase-2 entries, under the skip rule.

SRW-21-PLAN stays parallel. A REGRESSION round is due on or after 2026-11-05 and takes precedence when it falls due.

## 5. Frontend-architect checkpoint
NAME-AND-HINT closed a feature boundary. The open request ARCH-CHECKPOINT-STUDIO-LINK still covers it. Signal `GATE303-ARCH-STATUS-EXPECTATIONS` is added to its inputs, so B files no second request. It is non-blocking.

PERF-3c gives a new perf-harness signal, `B-R303-PERF-HARNESS-METRIC-FAMILY`. It is recorded only and is not yet a checkpoint request.

## 6. Ready for commit?
- **Round 303:** published as `53fc8df`.
- **Round 304:** after C PASS and the gate, root publishes the §5 paths (perf/** and docs only). PERF-3 stays in progress until PERF-3d.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE.** These all remain:
  - PERF-3c/3d and the rest of STUDIO-PERFORMANCE;
  - STEM-LANES and SYS-1…3;
  - STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - every deferred Low, which must be fixed and verified before final acceptance.

  SRW-21 is `deferred_user`.
- **Not BLOCKED.** Nothing external is missing, and the Saba questions do not block.

## 8. Housekeeping
- **The store tree is untouched.** HEAD is `53fc8df` and `git status` is empty after planning. B wrote only to `/tmp/b304/` and the loop folder.
- **Server:** B started a production server from `/tmp/b304/head` on :5304 and stopped it (curl → 000).
- **`lessons.md` is unchanged** (59 lines). The K9/K10 lesson is recorded as a ruling (D-29z793), not as a clause added to L29. retro-260 flagged L29's clause growth, so RETRO 305 decides on it.
- **`context/active-*`** files are root-generated and were not edited.
