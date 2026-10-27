# B: Round 210 → 211 planning (D-29z188 … D-29z194)

Date: 2026-10-27.
- **Advisor:** available. Used once before writing; used again at the end.
- **Consults:** `tech-lead` and `performance-optimizer`. The policy asks for both before each PERF task. Both are read-only and changed no file.

## 1. Inputs read
- **Round 210 task.** `current-task.md` (round 210), archived unchanged as `tasks/round-210.md`. `cmp` shows it identical; no earlier archive existed.
- **Round 210 reports:**
  - `a-round-210.md`;
  - `c-round-210.md` and `c-round-210.json`;
  - `gates/gate-round-210.json`: **published**, commit `180dd2e` on both remotes. This is the round-211 baseline; the tree is clean;
  - `gates/round-210/review.md` (score 9/10, suggestions S1–S5, Architecture note).
- **Loop state:**
  - `lessons.md`;
  - `regression-last.json` (round 199; next regression due on or after 2026-10-30);
  - `context/active-summary.md`, and `backlog.json` by id;
  - `tasks/round-209.md`, `b-round-209.md`.
- **Root notes:** `root-pre-push-review.md` and `publication-checkpoint.json` have not changed since 15:26, so there are no new root findings.
- **Source, read-only:**
  - `ArrangementContext.tsx`: the clip-gain preview, commit, cancel and begin blocks (l.2963–3200), `MixOverride` / `withMixOverride` (l.433–459) and the `syncPlayback` setter (l.1135–1145);
  - `ArrangementDetailPanel.tsx`: the waveform at l.186–250 and the Clip Gain block at l.478–860;
  - `ArrangementClip.tsx` l.313–316;
  - `StudioWorkspace.tsx`: the group span, l.2170–2192;
  - `useRelativeFaderDrag.ts`;
  - the perf spec's pass sequence;
  - the clip-gain test files (the L23 scan).

## 2. Acceptance results used (independently evidenced by C)
- **C round 210: PASS on 13/13 rows,** `browserVerified: true`, `realVerified: true`. Gate 210 published `180dd2e`.
  - **PERF-FADER-a is done (მზადაა).** SABA-B-5 part 1 is done: 1 component per move instead of 80–85, 0 restarts, p95 1.7–3.8 ms. Behaviour, labels and export are bit-identical to the baseline.
  - **Closed (D-29z188):** C-R209-01, C-R209-02, C-R209-03 (FP13, with C's own re-run of mutant M13), A-R209-REVIEW-PAN-CANCEL, A-R209-REVIEW-GROUP-PENDING and I-209-WINDOW-THRESHOLD.
  - **I-209-RELEASE-REBUILD is downgraded.** C's production build saw no graph rebuild after pointerup or after Ctrl+Z; the round-209 note came from the dev build. It is re-measured only if PERF-2+ sees it again.
- **SABA-B-5 stays Medium and in progress** until part 2 (Clip Gain) passes C.
- **Not used as acceptance:** A's own runs, and the gate rows.

## 3. PERF-FADER-b planning
**Re-measurement.** Round 210 did not touch clip gain, so A's round-210 perf run on the current code is the fresh "before" (`a-round-210/run1.json`):
- move-components-max 95;
- per-move 89.8 stopped / 73.5 playing;
- 220 window commits for 120 moves: each move commits twice, the second time through the `clipGainText` sync effect;
- p95 26.5 / 61.2 ms at 1×.

**performance-optimizer (summary):**
- ≤ 3 is realistic for a single clip: block + lane path + detail path.
- The members count is **N + 1**. With multi-select the detail selection is `null`, so no detail waveform renders.
- Add a members scenario to the harness after `fader.group.playing`, estimated at about +70 s; the run stays under 12 min.
- The path should update through a React commit. A ref-only `d` write would leave a stale path when a drag ends at its start value, and the metric would stop seeing the work. No rAF coalescing either, because the counts must stay deterministic across 1× and 6×.
- Optionally memoise the gain-independent column max.
- Flip 12 rows.

**tech-lead (summary):** the design holds, and the members count is 1 + N. Three traps:
1. The early returns on `next === present` at l.2977 and l.3032 would leave a stale draft when the drag returns to the stored value.
2. The commit must apply the exact override through the normalizing helpers. They drop `gainDb` at 0; the reset button's `disabled` depends on that.
3. `startGraph` passes `clipGains: clipLinearGains(arrangement)` (l.951), and the setter loop (l.1143) ignores any override; both must use the overridden arrangement. The live write must be exactly `10 ** (dB/20)`, because WG8 checks it with `toBe`.

Further points from the consult:
- **DOM contracts the leaves must keep:** svg first child, svg parent, column order, label text, detail-box className.
- **MG11:** the block must not get a `key`.
- **Override shape:** a dedicated override ref is acceptable. B lets A choose between that and a union kind.
- **Export mid-drag** uses the committed value. This is accepted, and documented.
- **L23 scan:** the consult matched B's own scan line for line. It added CF4 l.374–376 and WG8; it found no hits in `gesture-guard`, `fader-guards`, `pending-status`, `context-hygiene`, `group-volume-db`, `affordance-colour-ui` or `fader-style-ui`, so no grant is needed there.

**Rulings:**
- **D-29z188.** Round 210 accepted and the closures listed in §2. A dated commitment: B writes the frontend-architect checkpoint request at the 211→212 planning, whatever round 211's verdict. It covers the round-211 publish commit (ARCH-R209-MIX-OVERRIDE, ARCH-R210-OVERRIDE-UNIFY, ARCH-R207, GATE210-S4) and does not block. The A-R210 review Lows are filed in `deferred_low_polish` (A-R210-REVIEW-L2-GV405 and A-R210-REVIEW-FP11-GAP).
- **D-29z189: scope and design.** Clip Gain, single clip and members.
  - **Pointer path:** an override, plus live `setClipGain` for the affected clips only, plus draft keys. No history, sync or status per move.
  - **Pending path:** unchanged.
  - **Restarts** (`startGraph` and the setter) use the override.
  - **WG4 ruling:** the waveform keeps following the drag. This keeps today's visible feedback and is the smallest honest behaviour for a performance round.
  - **Leaves:** the redraw goes through one shared path leaf (lane and detail). One block leaf renders every draft-dependent node: the number field, range, fader and pending marker.
  - **Number field:** it follows the drag, as today. The tech-lead's cheaper alternative (the field stays committed until pointerup) was rejected, because it would change behaviour.
  - **Budget:** single 3, members N + 1.
- **D-29z190: harness.** A members scenario after `fader.group.playing`. 12 clip-gain flips, members rows asserted (≤ 3 with N = 2; release ≥ 1; restarts 0), and no other row changes. A STOP if an existing deterministic row would move.
- **D-29z191: docs.**
  - Doc 165 l.4 gets the exact Completed line (GATE210-S1; L28 has now failed 5 times, which goes to RETRO as a signal).
  - Doc 163 l.68/69/71 plus the pass sequence are fixed (C-R210-01). This is not deferred: it is the same owner, and doc 163 is the harness contract.
  - New doc 166, with a conditional status line.
- **D-29z192: gate-210 suggestions.**
  - S2 (`withMixOverride` exported) is mandatory. It is small and in the same file, and it also closes the deferred Low A-R209-REVIEW-L-EXPORT-UNUSED (the bug gate allows an early Low fix when the round owns the code).
  - S3 is the same finding as A-R209-REVIEW-L-WRITE-ALL-TRACKS. It is optional, and otherwise stays deferred.
  - S4 is optional, and a signal.
  - S5 becomes a C row (no one-frame snap-back).
- **D-29z193: no zustand.** PERF-FADER-a shipped a hand-rolled store, so stage b extends it, and PERF-8/PERF-10 migrate it (`oss-adoption.md`). There is no dependency request.
- **D-29z194: OSS queue changes, recorded late.** Saba approved them on 2026-10-27, and they had not been recorded:
  - PERF-6 is dropped;
  - PERF-16 moves up to right after PERF-1b;
  - OSS-LIC runs right after the first new dependency lands.

  The `execution_order_d29z194` field is in the STUDIO-PERFORMANCE queue entry.

**L23 (mandatory change vs tests).** The scan was done by B and matched independently by tech-lead. The hits are granted and listed in the task with a ruling for each. Frozen neighbours that rely on the DOM or on typed-field behaviour are named as "must stay green unedited", and A runs them as self-checks. No hit was found in a frozen file, so `gesture-guard` (round 209's miss) is not at risk this time.

**Uncertain UI contracts: the smallest honest behaviour.**
- **The number field during the drag** follows, as today. Freezing it would be a visible change in a performance round.
- **Export mid-drag** renders the committed value, the same as the PERF-FADER-a faders. It is documented, not changed.
- **Esc** is not a fader cancel, as today. C compares with the baseline.

## 4. Architecture
- **Two notes recorded as ARCH-R210-OVERRIDE-UNIFY**, verdict keep:
  - the gate-210 reviewer: pan onto the `MixOverride` union, plus one draft-clear helper;
  - A's round-210 reviewer: four near-identical `begin*Gesture` blocks, and two pan-draft writers.
- **Not scheduled.** They are folded into the post-PERF-FADER-b checkpoint request (D-29z188), which is due at the 211→212 planning.
- **Ownership stays the same this round.** `ArrangementContext.tsx` (3,968 lines) carries rounds 208–211 on one owner. That is why the request is dated and not left open-ended.

## 5. Bookkeeping
- **Archived and snapshotted:** `tasks/round-210.md`, and `b-round-210/{backlog-before-211.json, feature-status-before-211.md, b-next-before-211.json}`.
- **Frozen-tree artifacts** (baseline `180dd2e`, clean tree):
  - `b-round-210-r211-tree-sha256.txt`: 1,041 files; `sha256sum -c` returns rc 0;
  - `b-round-210-r211-grants.txt`: 14;
  - `b-round-210-r211-granted-start-sha256.txt`;
  - `b-round-210-r211-new-files.txt`: 4;
  - start copies in `b-round-210/r211-granted-start/`.
- **`backlog.json` v194:**
  - round 210 → `c_pass_published`, with the result; round 211 added;
  - closures as in §2;
  - new open findings: C-R210-01, GATE210-S1 to S5 and I-210-PAN-DELTA-UNREACHABLE;
  - deferred Lows: + 2, and the two A-R209 entries annotated;
  - architecture signal and checkpoint commitment added;
  - STUDIO-PERFORMANCE stages: PERF-FADER-a done, PERF-FADER-b dispatched, PERF-6 dropped, PERF-16 and OSS-LIC placed;
  - RETRO signal: L28 5×.
- **`feature-status.md`:**
  - round 210 → მზადაა;
  - round 211 → მუშავდება;
  - the SABA-B-5 and STUDIO-PERFORMANCE rows are updated.
- **Schedule.** The regression is not due (on or after 2026-10-30). RETRO at round 215 or at the end of STUDIO-PERFORMANCE. Bug gate: no Critical or High is open; the open Medium (SABA-B-5) is this round's own.
- **Ready to commit:** nothing new. Round 210 is already published, and round 211 is not ready until C passes.

## 6. For Saba (the loop does not wait)
- **The slow faders are fixed** for track, group and master Volume and for Pan, and published. A drag now updates about 1 small piece of the screen per mouse move instead of 80 or more, and the sound and the exported mix are unchanged.
- **Clip Gain is next (round 211).** It is the slowest one now. While you drag, the waveform will still grow and shrink as it does today.
- **Earlier open questions are unchanged:** `b-round-205.md` §8, `b-round-206.md` §8 and SABA-B-6-R1.

## 7. Advisor end review: two fixes applied to the task
- **Perf comparison split (D-29z190).** "Every existing deterministic row = round 210" would wrongly fail `load.components` (baseline 344), because the new leaves mount at load. The rows are now split into three sets:
  - **must be identical:** `harness.*`, `load.commits`, `play.idle-*`, all track/group/master/pan deterministic rows, and the clipgain `moves-dispatched` / `restarts`;
  - **may shift:** `load.components`, by A's reported leaf count, which C verifies;
  - **change by design:** the clipgain component rows.

  The STOP clause now applies only to a placement-caused change in a must-be-identical row.
- **Reset button mid-drag.** The reset button's `disabled`/`title` read the model, so on the baseline they change mid-drag. They are now draft-dependent nodes of the block leaf (D-29z189 item 7, CP10), so this is not a new unruled delta. This follows the C-R209-03 lesson.
- **MG11.** The block reads per-clip drafts for the displayed ids, so the toSingle case matches the baseline.
- **Frozen-neighbour test file names** cited in §2 self-checks were verified with `ls`: all exist.
