# B: Round 207 → 208 planning (D-29z176; C-R207-01 ruling D-29z177; R114 D-29z178)

Date: 2026-10-27.
- **Advisor:** available and used before writing. It is used again at the end.
- **Consults:** `performance-optimizer` and `tech-lead` (the policy requires both for each PERF task). Both are read-only and changed no file.

## 1. Inputs read
- `current-task.md` (round 207). It is archived unchanged as `tasks/round-207.md` (`cmp` identical).
- `a-round-207.md`, `c-round-207.md` and `c-round-207.json`.
- `gates/gate-round-207.json`: status **published**, commit `d2a920c`, on both remotes. This is the baseline for round 208.
- `env-status.json` (store 200), `regression-last.json` (round 199, 2026-10-27) and `lessons.md`.
- `b-round-206.md`, `context/active-summary.md`, and `backlog.json` (by id).
- `docs/technical/performance/perf-plan.md`, and the `perf/` harness source (read-only).

## 2. Acceptance results used (independently evidenced by C)
- **C round 207: PASS on 9/9 rows.** `browserVerified: true`, `realVerified: true`. Gate 207 published `d2a920c`.
  - **SABA-B-6 → done (მზადაა).**
    - CUR-ENV: 18/18 `pointer`, and a grid scan finds 0 "+" cursors.
    - CUR-POINT: `pointer` through the drag, and the gain changes.
    - CUR-VIDEO: `grab` / `grabbing` / `grab`, and the box moves 40 × 8 px.
    - CUR-UNCHANGED: 0 new or missing pairs against B's map.
    - Both viewports.
  - **R113:** done.
  - **Ableton parity of the cursor shape:** unconfirmed (no source). D1–D3 are listed deviations.
- **Not used as evidence:** A's own runs, and the gate rows.

## 3. Rulings (L10)
- **D-29z177: C-R207-01** (= A-R207-01, deduplicated).
  - **Facts:** the ⠿ video handle computes `pointer` despite `cursor-grab`. So do 11 disabled buttons that have `disabled:cursor-not-allowed`.
  - **Cause, proven in the browser by C:** the unlayered `button { cursor: pointer; }` in protected `app/styles/app.css:476` wins over them.
  - **Not a regression.** It existed before round 207, and the round-207 diff did not touch it. B's own 207 probe skipped `pointer`, so the CUR-VIDEO clause "handle still grab" rested on an unmeasured premise. The round stands.
  - **Ruling:** Low → `deferred_low_polish`. The fix needs a narrow grant of `app/styles/app.css` (layer the rule or remove it) in the polish pass, and root decides that grant.
  - **Lesson candidate for the next RETRO:** cursor probes record each element's own class against its computed cursor, and never skip `pointer`.
- **D-29z178: R114** (GATE207-DOC164-STATUS, L28). `git show d2a920c` shows doc 164 l.4 still reads "In Progress (C round 207 check pending)". B grants the post-PASS line in round 208, the same precedent as R112 and R113. This is the third time (L28, 3×).
- **A-R207-02** (`:active` verified in Chromium only): goes to the Tech Lead manual list. Non-blocking.
- **Architecture note** (A's code-reviewer): "none … Keep as is." No signal.

## 4. PERF-FADER planning (D-29z176)
**Re-measurement.** `git diff --stat 60c82ed d2a920c` touches no fader, context or `perf/` file. So C's round-206 medians are still the current measurement:

| Fader | Components per commit |
|---|---|
| track | 83 |
| group | 85 |
| master | 80 |
| clip gain | 79 / 87 |
| pan | 4 |

Restarts while playing: 0. This is a code-path argument, not a new run. The new metrics are first measured in round 208 (WINDOW-208 is the "before" evidence).

**B's own check of the harness** (`perf/studio-lab.perf.spec.ts:240-275`):
- `components-per-commit` is the median over all commits from pointerdown until quiet, release commit included.
- After the fix, the history commit on release (about 80 components) would dominate that median. The ≤ 3 budget could then fail even with a correct fix, or pass vacuously.
- Separately, `event-share-16` can never be above 0 (C-R206-01).
- So a metric stage comes first.

**performance-optimizer (summary).**
- **Stale readers during a ref preview:**
  - lane, group and master faders: value, aria-valuetext, fill and readout;
  - clip gain in the detail panel, including the number-input sync at l.318-320;
  - the detail and lane waveforms, through `clipLinearGain`;
  - the multi-select span memo at `StudioWorkspace.tsx:2167-2193`;
  - the status text after commit.
- **Not stale:** the meters, which tap after the gain node; group effective gain, which no component reads; envelopes.
- **Pattern:** a draft display value plus a context override applied in `startGraph` and in the `syncPlayback` setters. On commit, clear the override, then `applyEdit`.
- **Blocker to cover:** while a loop plays, `resyncLoopRef` restarts the graph mid-drag. It must read the override, so stage a needs a row with a loop on.
- **Keyboard, Shift and double-click** stay on the pending path. Shift-fine is pointer-only.
- **Metric:** `move-to-paint` (capture `pointermove` → rAF → `MessageChannel`), with an injected 30 ms sync and deferred red-proof. LoAF reports only frames ≥ 50 ms, so it cannot resolve a 16 ms budget.
- **Split:** a0 (metric), then a, then b.

**tech-lead (summary).**
- **Choose a context override,** not component-local state. `trackEffectiveGains(arrangement)` is the only route for group volume, and `startGraph` and `syncPlayback` both rebuild gains from the arrangement.
- **Fork on `volumeGestureRef`,** so PV1-PV8 and the `pending-status` tests stay as they are.
- **The display store matters** because the inputs are controlled; without it, any re-render snaps the thumb back.
- **Space can start or stop playback mid-drag,** because `togglePlayback` has no gesture refusal.
- **Clear the new ref on unmount.**
- **Test files to grant in stage a** (15):

| Reason | Files |
|---|---|
| Call the preview APIs directly | `context-hygiene`, `pending-status`, `master-ui`, `track-volume-db`, `group-volume-db`, `track-group-mix-ui`, `clip-gain`, `clip-gain-waveform`, `meter-ui` |
| Drive the fader gestures | `fader-guards`, `fader-click`, `fader-touch`, `fader-focus-order`, `clip-gain-multi` |
| Pan reference | `track-pan` |

- **Split:** a = track + group + master; b = clip gain.
- **Stage-b design point:** `clip-gain-waveform.test.tsx` WG4 (l.376-399) asserts that the waveform redraws mid-drag, and that the arrangement gain changes mid-drag. B rules on it at stage-b planning.
- **Top 3 risks:**
  1. A group drag while playing, with a restart mid-drag, and the revert of every member.
  2. The keyboard and pending paths staying byte-identical.
  3. The commit writing the exact previewed value, without re-deriving it from dB.

**Decision:**
- **Round 208 = PERF-FADER-a0.** It changes only the harness, and `app/` is frozen.
- **Why a0 first:** if the metric and the behaviour change landed in one round, a red result could not tell a harness bug from a regression. a0 also gives C live "before" numbers for stage a.
- **What a0 does:**
  - closes C-R206-01 and GATE206-S4 by replacing the metric;
  - adds the move-window component metrics and `release-commits`;
  - covers I-206-d;
  - rewrites doc 163 l.60;
  - R114.
- **Stages a and b** are written into `backlog.json` (STUDIO-PERFORMANCE stages) with the consult findings, so round-209 planning starts from them.

**Uncertain contract, smallest honest behaviour.** The policy's "≤ 3 committed components per move" is defined as: commits strictly between the first `pointermove` and the in-page `pointerup`. The single release commit that writes the history entry is excluded and counted separately (`release-commits`).
- **Rationale:** the policy itself requires one history entry on pointerup. That commit is the intended cost of a gesture, not a per-move cost.

**Architecture.** Stage a hits the "third target kind" trigger of ARCH-R81-VOLUME-STATE-MACHINE. The non-blocking request is `b-round-207-checkpoint-addendum.md`. If root does not answer, the default is keep, with only a small store module added.

**Advisor review fixes applied:**
- Liveness drags never write `fader.pan.*` (R-4).
- 4 new assert rows plus 1 control row; the task count is consistent.
- `components-per-commit` budgets are set to null.
- The cross-rate safety of `-per-move` is checked against `run1.json`: `commits-per-move` is identical at 1× and 6×.
- The new-files list holds bare paths.
- The config timeout is 15 min, so it needs no grant.

## 5. Bookkeeping
- **Archived:** `tasks/round-207.md`, plus the `b-round-207/` snapshots of the backlog, feature-status and b-next taken before this edit.
- **`backlog.json`:**
  - round 207 → `c_pass_published` (`d2a920c`); round 208 added;
  - SABA-B-6 done; SABA-B-5 updated;
  - C-R206-01 and GATE206-S4 scheduled for 208;
  - GATE207-DOC164-STATUS added;
  - C-R207-01 → `deferred_low_polish` only (the list now has 305 entries; not duplicated in `open_findings`, the same as GATE206-S1/S2); A-R207-01 is a duplicate; A-R207-02 goes to the Tech Lead list;
  - STUDIO-PERFORMANCE stages: PERF-1a done, plus PERF-FADER-a0, -a and -b;
  - architecture request recorded.
- **`feature-status.md`:** the 207 line → მზადაა, the 208 line added, the SABA-B-6 row → მზადაა, the SABA-B-5 row updated, and the STUDIO-PERFORMANCE row updated.
- **Frozen-tree artifacts:** `b-round-207-r208-{tree-sha256,grants,granted-start-sha256,new-files}.txt` and `b-round-207/r208-granted-start/`. `sha256sum -c` returns OK on the clean tree.
- **Policy grep (D-29z173 prevention):** `policy.local.md` names SABA-B-1 to SABA-B-6, and every one has an `open_findings` entry. There is no new SABA id.
- **Schedule:** the next regression round is due on or after 2026-10-30, so it is not due now. The next RETRO is at round 215, so it is not due either.
- **Ready to commit:** gate 207 is already published. Round 208 is not ready until C passes.

## 6. For Saba (the loop does not wait)
- **Your slow-fader fix (SABA-B-5) lands in round 209 (PERF-FADER-a: track, group and master), not in round 208.** Round 208 first replaces two harness metrics that could not fail honestly, so the fix can be graded against a real budget. Clip gain follows in PERF-FADER-b.
- The open questions from `b-round-206.md` §8 and `b-round-205.md` §8 are unchanged. That includes SABA-B-6-R1: should the envelope react only near the line, as in Live?
- **New FYI:** C-R207-01 needs an `app/styles/app.css` grant in the polish pass. It is Low and deferred.
