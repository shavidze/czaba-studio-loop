# A round 208 — PERF-FADER-a0: per-move metrics (harness only)

**Status: implemented, handed to C.** No STOP. Baseline `d2a920c`; `app/` 0 changes. No commit/push.

## Changed files (5 of the 6 grants; optional `perf/lib/move-latency.ts` not created, `perf/lib/stats.ts` untouched)
- `perf/lib/instrumentation.ts`: capture-phase passive window listeners for `pointerdown` (`downs`) and `pointerup` (`ups`). The existing pointermove listener is now `{capture, passive}` and adds the `move-to-paint` sampler: t0 → rAF → MessageChannel → `moveLatency {move, t, latency}`. Adds the `Window.__czabaPerfInjected` slot type.
- `perf/studio-lab.perf.spec.ts`:
  - `dragFader` + `moveWindow` + `moveToPaint` + `measureFader`.
  - New rows: `move-to-paint-p95|over-16|samples` (wall-clock, `.1x/.6x`); `move-components-max|per-move` (deterministic, in `determinismMetrics` and `crossRateMetrics`); `release-commits` (deterministic record, not determinism-checked).
  - Liveness scenario `harness.move-latency-live.sync/.deferred` and `harness.move-latency-control`, 1× only at the end of the pass after `fader.group.playing` → Space stop. The injected listener is removed in `finally`, and the window `pointermove` listener count is checked through CDP `DOMDebugger.getEventListeners` (a mismatch is a run problem). A control p95 ≥ 30 ms is a run problem.
  - `harness.move-samples-live` and `harness.move-window-live` come from the track stopped drag, 1×.
  - I-206-d ends check with `endsCase`. A missing in-page pointerdown/pointerup, or a missing `max` attribute, fails the run.
  - `event-share-16` and `slowEventMs` removed.
- `perf/budgets.json`: 161 → **266** rows (−20 `event-share-16`, +120 fader rows, +5 harness rows). The 20 `components-per-commit` rows now have `budget: null` and the R-3 note. Asserts: 14 → 18 (the 4 new liveness rows). No existing assert row changed (R-2). The JSON round-trips byte-identically with `indent=2, ensure_ascii=False`.
- `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`:
  - l.4 is the conditional status (L28).
  - l.60 is now the `move-to-paint` definition and its limits.
  - l.54: the `components-per-commit` table row says it is not the per-move metric.
  - 5 new metric-table rows (l.66–70).
  - New section "PERF-FADER-a0 (round 208)" (l.114–146) with the medians and red-proof results.
- `docs/implementation/2026/quarter-IV/164-timeline-cursor-pointer.md`: l.4 only, exact R114 text.

## Interpretation for B to ratify
- **Move window start.** Contract §2.2 says "after the first pointermove". The first dispatched move is the hover move before pointerdown, so a literal reading would put the pointerdown commit into the per-move metric. I open the window at the first move **after the in-page pointerdown**. The pointerdown commits are reported in detail only (`downCommits`, `downComponentsMax`; both are 0 at baseline). The `-per-move` divisor is the 120 moves in the window. `move-to-paint` uses all 121. The advisor and the code-reviewer both endorsed this.
- `harness.move-samples-live` metric = `moves − samples`, assert `<= 2` (equivalent to samples ≥ moves − 2).

## Tests actually run
- `npm run typecheck`: exit 0 (final tree). `npm run lint`: exit 0, with 205 pre-existing warnings, all in `app/`. Biome does not cover `perf/`, so `biome check` was run on a scratch copy (`a-round-208/biome-scratch`, includes widened): the 4 perf ts files show 0 issues and no fixes.
- `npm run test:perf`, 4 separate invocations, never in parallel with another build:
  - run1/run2 on the pre-review code;
  - **run3/run4 on the final code: both exit 0** (7m14s / 7m15s; test 419 s / 421 s, under the 12 min limit), `complete: true`, 0 failures, 0 problems, **18/18 assert PASS**, every row has 3 samples, 0 `event-share-16` rows. Deterministic medians are identical between run3 and run4 (0 diffs) and between run1 and run2. run1 vs run3: 0 diffs over all 141 deterministic rows. Evidence: `a-round-208/run{1..4}.json|.log`.
- Liveness (run3 / run4):
  - `.sync` 31.8 / 31.7 ms and `.deferred` 31.3 / 31.2 ms, both against `>= 30`.
  - The control is 1.3 ms; window `pointermove` listener count 1 → 1.
  - `move-samples-live` 0; `move-window-live` 83.
  - The margin over 30 is about 1–2 ms: the 30 ms busy-wait sets the floor.
- The 1×/6× component counts agree for every fader, so the fallback was not needed.
- Main medians: track/group/master/clip gain `move-components-max` 83/85/80/87, pan 4. `release-commits` is 1 (pan 2). Wall-clock: clip gain `move-to-paint-p95` 1× is 27.6–30.3 ms stopped and 64.4–66.2 ms playing; track 1× is 4.1–5.6 ms. The full table is in doc 163.
- **Red-proofs** on scratch copies in `test-results/` (gitignored; 1 pass, 1×, existing build, `PERF_BUDGETS` = real file; scratch deleted afterwards):
  - (i) rAF step removed → `harness.move-latency-live.deferred` = **0.8 ms → `assert failed`**; `.sync` 30.9 still passes. Evidence: `a-round-208/redproof-i.json|.log`.
  - (ii) window widened to include release → pan `move-components-max` **4 → 83** (stopped and playing). `-per-move` changed for all 10 fader×state combinations. The max is unchanged for track/group/master/clip gain because the release commit is no larger than the largest move commit. Evidence: `a-round-208/redproof-ii.json|.log`.
  - Both scratch runs also list the 6× `restarts` asserts as failed with 0 samples. That is an artefact of the 1×-only scratch, not harness behaviour. The first red-proof attempt hit a scratch config path bug (webServer cwd / "No tests found"); it was fixed and rerun. Only the reruns count.
- I-206-d ends: `endsCase` is `max` for track and group (stopped and playing), master playing and clip gain playing. It is `strict` for pan, master stopped and clip gain stopped. The path (50 → 5 → 95 %) and the 121 moves are unchanged.
- **Code-reviewer** (project subagent) ran on the diff, score 7/10, no critical issues. Addressed:
  - `downComponentsMax` added;
  - control-p95 guard added;
  - `max` attribute guard added;
  - CDP detach moved into `finally`;
  - the `move-to-paint` note now says the real paint is not measured directly;
  - the `samples-live` note was updated;
  - the missing doc section was added.
  - Run3/run4 were rerun after these fixes.
- Probe for the drag ends: `a-round-208/tools/probe-ends.cjs` on dev :5173.

## Code-reviewer Architecture note (verbatim, for B)
> Signal 4 (new lifecycle in an existing owner): `perf/studio-lab.perf.spec.ts:435–517` adds the injected-listener, CDP-session and `__czabaPerfInjected` lifecycle to the spec. Its global type lives in `perf/lib/instrumentation.ts:78`, a light coupling across two grants. → **keep.** It is perf-only, touches no app invariant (audio timing, refs, gesture lifecycle, Undo/Redo, public hooks), and costs little. Declining the optional `perf/lib/move-latency.ts` is fine for this round. No proposal for the planner.

## Known gaps / for B
- **Stale doc 163 text outside this round's grant (not edited, flagged by the reviewer):**
  - l.16 and l.83: "161 სტრიქონი" (161 rows; now 266). l.16 also says no `wallclock` row is assert; the two `harness.move-latency-live.*` rows are the deliberate exception, stated in the new section;
  - l.18: the "rejected alternative" paragraph;
  - l.24–31: the pass sequence has no step 9 (liveness);
  - l.74: the Determinism paragraph does not list `move-components-*`;
  - l.149, TODO: it still says PERF-FADER flips `components-per-commit` to assert.
  - The new section states each correction. B can grant these lines in round 209.
- The doc 163 status line is conditional; root amends it at publication (L28).
- The reviewer's Low "post `{move, t}` as payload instead of FIFO queue" was not applied. Push and post happen in the same rAF callback, so FIFO pairing holds, and `move-samples-live` = 0 missing confirms it.
- Run time: about 7.2 min per run, including the liveness scenario.

## Exact next C checks
- **SCOPE-208:** `sha256sum -c --quiet b-round-207-r208-tree-sha256.txt` (1,044 OK at handover). `git status` shows 5 modified files and 0 untracked. `perf/lib/stats.ts` is unchanged and `perf/lib/move-latency.ts` is absent. Doc 164 differs at l.4 only. Doc 163 diff hunks: 4c4, 54c54, 60c60, 65a66–70, 108a114–146.
- **PERF-RUN-208:** `npm run test:perf` twice. Expect 18 asserts PASS, 266 rows, 3 samples each, and the liveness rows ≥ 30 by about 1–2 ms.
- **METRIC-LIVE-208** and **WINDOW-208:** C's own probe. Note that C's window split should treat the pointerdown commit per the interpretation above. At baseline `downCommits` = 0, so the counts should agree either way.
- **DRAG-ENDS-208:** the `components-per-commit` details carry `valueStart/Low/High/Max/endsCase`.
- **DOC-208, AN-REVIEW-208:** no `any`, no `as` (including `as const`), no `@ts-ignore`, no `route(`.
- **G208-3:** not touched by A.

## Scope completed
Task §2 items 1–5 are implemented, and the A self-checks were run: typecheck, lint, test:perf ×2 on the final code, red-proofs (i) and (ii), and the code-reviewer. No B acceptance row is self-marked PASS; the C rows are for C.

Checkpoint (final): wall-clock-assert exception sentence added to the doc 163 section; run1 vs run3 deterministic identity verified. Handover complete.
