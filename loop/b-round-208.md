# B: Round 208 → 209 planning (D-29z179; D-29z180; D-29z181; D-29z182)

Date: 2026-10-27.
- **Advisor:** available. Used before writing (and once more at the end).
- **Consults:** `tech-lead` and `performance-optimizer` (the policy asks for both before each PERF task). Both are read-only and changed no file.

## 1. Inputs read
- `current-task.md` (round 208). Archived unchanged as `tasks/round-208.md` (`cmp` identical; no earlier archive existed).
- `a-round-208.md`, `c-round-208.md`, `c-round-208.json`, `c-round-208/out/perf-run2.json` (row details).
- `gates/gate-round-208.json`: **published**, commit `f535ab3` on both remotes → the round-209 baseline.
- `lessons.md`, `regression-last.json` (round 199, 2026-10-27; next due on or after 2026-10-30), `context/active-summary.md`, and `backlog.json` (by id), `b-round-207.md`, `b-round-207-checkpoint-addendum.md`.
- Source, read-only: `ArrangementContext.tsx` (startGraph l.849, syncPlayback l.1056, previewVolumeTarget l.2365, pan l.2600–2707, master l.2727), `ArrangementLane.tsx` (pan draft l.193/403, volume input l.806–840), `ArrangementMaster.tsx`, `ArrangementGroupHeader.tsx`, and the 15 fader test files (L23 scan).

## 2. Acceptance results used (independently evidenced by C)
- **C round 208: PASS on 8/8 rows**, `browserVerified: true`, `realVerified: true`. Gate 208 published `f535ab3`.
  - **PERF-FADER-a0 → done (მზადაა).** PERF-RUN ×2 (18/18 asserts, 266 rows), METRIC-LIVE (C's own sampler: sync 31.6–31.8, deferred 31.1–31.3, control 1.2–1.3 ms), WINDOW (C's own commit probe = harness ±0), DRAG-ENDS, DOC, AN-REVIEW, G208-3 (401 / 500 without mock; no token).
  - **C-R206-01 and GATE206-S4 → closed** (`event-share-16` removed; the replacement metric is proven live).
  - **GATE207-DOC164-STATUS (R114) → closed** (doc 164 l.4 exact text, C SCOPE-208).
- **Not used as evidence:** A's own runs and red-proofs (C independently supported red-proof ii), gate rows.

## 3. PERF-FADER-a planning
**Re-measurement:** `git diff --stat d2a920c f535ab3` touches only `perf/` and docs, so C's WINDOW-208 numbers are the current "before": move-window max 83 (track), 85 (group), 80 (master), 4 (pan), release commit 83, 0 restarts.

**New fact B found that the round-207 plan did not settle:** pan's 4 components per move is over the ≤ 3 budget. Its rows are owned by PERF-FADER-a. The cause is the lane-level `setPanDraft` state: each move re-renders the lane. So "copy the pan pattern" alone cannot meet the budget for any fader.

**tech-lead (summary):** put the subscription in a leaf below lane/group header/master: one shared `ArrangementMixFader` owning the input, fill, `aria-valuetext`/`title` and readout, reading a keyed `mix-draft-store.ts` via `useSyncExternalStore`. Pan moves to the same store now. One small commit per move, not zero: ref DOM writes fight the controlled `value` and snap back on any parent render. `useRelativeFaderDrag` is indifferent; `readStoredValue` must keep returning the committed value. Risks: a stale draft if any cancel path misses the clear; commit-value drift (re-deriving from slider dB, lane l.420); unstable props / `React.memo` with a custom comparator.

**performance-optimizer (summary):** flip `move-components-max` / `-per-move` ≤ 3 and `release-commits` ≥ 1 to assert for track/group/master (and pan); keep wall-clock rows record; no row exists for export bit-identity (B: C browser row + A unit row FP12, rather than growing the harness). `harness.move-window-live` survives with 1–2 commits per move (B keeps it; the alternative clip-header liveness is recorded, not scheduled). Fix pan in the same stage. Needed scenarios: loop wrap mid-drag (biggest risk: `resyncLoopRef` rebuilds from `present`), Space mid-drag, a start below max.

**Rulings:**
- **D-29z179:** stage a = track + group + master Volume **and Pan**. Required design: pointer path writes an override ref and live params only (no `updateHistory`/`syncPlayback`/`setStatus` per move); `withMixOverride` in `startGraph` and the `syncPlayback` setter branch; one exact-value `applyEdit` on commit; cancel restores every member; display via the keyed store and the leaf (≤ 3 per move, zero-commit forbidden); visuals unchanged. 48 budget rows flipped. Clip gain stays stage b.
- **D-29z180 (I-208-a, L10):** move window ratified as A implemented it; a pointerdown commit is allowed only with `downComponentsMax ≤ 3`.
- **D-29z181:** C-R208-01 + R115 (doc 163 l.4 published conditional, L28 4×) fixed in round 209, not deferred (same owner, small, the harness contract). **RETRO signal:** L28 has now failed 4 times at root publication; the next RETRO should propose a structural fix (e.g. root's gate amends the status line, or B grants the post-PASS line by default).
- **D-29z182:** ARCH-R207-MIX-PREVIEW-STORE unanswered → recorded default keep.

**L23 (mandatory change vs tests):** B cannot run the change on a scratch copy (B never edits app code), so instead B grepped the 15 fader test files for model reads and listed every candidate line in the task, with a per-hit ruling (after-pointerup or keyboard path: keep; mid-gesture model read: re-express as leaf DOM + live gain + model unchanged until pointerup; contradicting §1: STOP). Frozen clip-gain tests are neighbours that must stay green unedited. This is the smallest honest substitute; A reports every edit with old/new assertion and C checks each hunk is on the list.

**Uncertain UI contracts — smallest honest behaviour:**
- **Esc during a fader drag:** no Esc cancel exists today (`grep 'Escape'` finds none on the fader path). The policy says Esc-cancel "stays exactly as now", so no new cancel key is added; C compares with the baseline build.
- **Space mid-drag:** the shortcut is ignored on role-slider targets; whether a drag leaves focus on the slider is not certain. C records the baseline behaviour; if playback toggles, the restart must use the dragged value.

## 4. Architecture
- A round 208 code-reviewer Signal 4 (perf spec owns the injected-listener/CDP lifecycle): **keep**, recorded in `architecture_signals`, not scheduled.
- **Checkpoint request:** STUDIO-PERFORMANCE boundary and ARCH-R207 remain non-blocking (`b-round-205-checkpoint-request.md`, `b-round-207-checkpoint-addendum.md`). After PERF-FADER-b (when the third override kind, clip gain, lands), B asks root for the bounded frontend-architect checkpoint on the `ArrangementContext.tsx` volume machine before PERF-8/PERF-10 touch the same owner.

## 5. Bookkeeping
- **Archived:** `tasks/round-208.md`; snapshots `b-round-208/backlog-before-209.json`, `feature-status-before-209.md`, `b-next-before-209.json`.
- **`backlog.json` (v192):** round 208 → `c_pass_published` (`f535ab3`); round 209 added; PERF-FADER-a0 done; PERF-FADER-a dispatched with the D-29z179 scope; C-R206-01, GATE206-S4, GATE207-DOC164-STATUS closed; C-R208-01 and GATE208-DOC163-STATUS scheduled for 209; I-208-a ratified, I-208-b carried, I-208-c info; SABA-B-5 in progress; ARCH-R207 default keep; architecture signal added.
- **`feature-status.md`:** round 208 → მზადაა, round 209 → მუშავდება, SABA-B-5 → მუშავდება, STUDIO-PERFORMANCE row updated.
- **Frozen-tree artifacts:** `b-round-208-r209-{tree-sha256,grants,granted-start-sha256,new-files}.txt` and `b-round-208/r209-granted-start/`. `sha256sum -c` is OK on the clean tree at `f535ab3` (1,031 frozen + 19 grants = 1,050 tracked).
- **Schedule:** regression not due (on or after 2026-10-30); RETRO at round 215 or at the end of STUDIO-PERFORMANCE.
- **Ready to commit:** gate 208 already published. Round 209 is not ready until C passes.

## 6. For Saba (the loop does not wait)
- **Your slow-fader fix lands now, in round 209**, for track, group and master Volume and for Pan: the drag no longer rebuilds the whole Studio on each move (target ≤ 3 components instead of 80+). Clip Gain follows in the next stage (PERF-FADER-b).
- Open questions from `b-round-205.md` §8 and `b-round-206.md` §8 are unchanged, including SABA-B-6-R1.

## 7. Advisor end review — applied
- **Frozen neighbours (L23):** `clip-gain-multi.test.tsx` MG13 drags track Volume and Master but reads the model only after release → stays frozen and must stay green. No test builds `ArrangementContextValue` by hand (all mount the real provider); the store is exposed through its own context + hook, like the position store, so the context type does not change.
- **L23 list is a starting scan:** A extends it for mid-gesture `undoLabel` / `status` / readout / `aria-valuetext` reads, same ruling, each reported.
- **Release always clears the draft** (also for drags that end at their start value; that clear is the counted release commit). C's history/undo checks use drags that end at a different value.
- FP12 compares against the pending `onChange` path (Shift-fine values included); EXPORT-209 uses a plain drag; WINDOW-209 uses the harness path and step count; the leaf adds no new cursor/focus tokens (repo-scan tests stay green).
