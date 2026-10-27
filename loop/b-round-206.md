# B: Round 206 → 207 planning (D-29z173; C-R206-01 ruling D-29z174)

Date: 2026-10-27. **Advisor:** available and used twice, before writing and at the end.

**Consults:**
- `ableton-arrangement-expert`, on the cursor reference.
- `tech-lead` and `performance-optimizer` were not needed. This round is not a PERF task; they come back at PERF-FADER planning.

## 1. Inputs read
- `context/active-summary.md` and `context/active-backlog.json` (by grep).
- `current-task.md` (round 206, archived unchanged as `tasks/round-206.md`).
- `a-round-206.md`, `c-round-206.md` and `c-round-206.json`.
- `gates/gate-round-206.json`: status **published**, commit `60c82ed`, pushed to both remotes. This is the baseline for 207.
- `gates/round-206/review-result.json`.
- `lessons.md`, `regression-last.json` and `env-status.json` (store 200).
- The policy sections "Saba's bug and the performance queue" (SABA-B-5 and SABA-B-6) and "Reference first".

## 2. Acceptance results used (independently evidenced by C)
- **C round 206: PASS.** 8/8 rows: SCOPE, PERF-RUN ×2, HARNESS-LIVE, FADER (C's own probe), PERF-RED (a)+(b), ISOLATION, AN-REVIEW and G206-3. `browserVerified: true`, `realVerified: true`. Gate 206 published `60c82ed`.
  - **R111 PERF-1a harness: done.** R112, the doc 162 l.4 status line: done.
- **SABA-B-5 stays open** (Medium); it is measured and not yet fixed. C's medians are identical in both runs, and counts are equal at 1× and 6×:

| Fader | Components per commit (stopped / playing) | Frame p95 while playing, 6× |
|---|---|---|
| track | 83 / 83 | 33.4 ms |
| group | 85 / 85 | 33.4 ms |
| master | 80 / 80 | 33.4 ms |
| pan | 4 / 4 | 33.3 ms |
| clip gain | 79 / 87 | **66.7 ms** |

  - Restarts while playing: 0 in all 10 playing rows.
  - Root's graph-rebuild hypothesis is still not supported.
- **Not used as evidence:** A's own runs (A is the writer), and the gate rows (vitest, typecheck, build, verify), which are root's.

## 3. Rulings (L10)
- **D-29z173: ordering correction.**
  - **What happened.** The policy note on SABA-B-6 (Saba, 2026-10-27) says: "One small round right after SABA-B-4 closes (after round 205), before PERF-1." Round 206 ran PERF-1a. SABA-B-6 was not in `backlog.json` at 207 planning (a grep finds 0 hits), and it is not in `b-round-205.md`.
  - **Cause: unverified.** B did not establish whether the note existed when round 206 was planned. SABA-B-5, with the same date, was recorded, which is consistent with SABA-B-6 arriving later. No cause is claimed.
  - **Correction.** Round 207 = SABA-B-6, before PERF-FADER and PERF-1b. The harness that has already shipped stays, and nothing is reverted.
  - **Prevention.** At every planning, B greps the policy for each `SABA-B-n` id and checks that `open_findings` has it. This is a lesson candidate for the next RETRO, with its cause recorded as unverified.
- **D-29z175: R113, GATE206-DOC163-STATUS (L28).** Doc 163 l.4 was published still reading `In Progress (C round 206 check pending)`, because root did not amend it at gate 206. Per L28, B grants the post-PASS line in round 207. This is a one-line doc fix, the same precedent as R112.
- **D-29z174: C-R206-01 (`event-share-16` can never go above 0).** C proposed Medium. **B rules Low (harness/doc), bound to PERF-FADER and not deferred to polish.**
  - **Why Low.** The row is `record` only, so nothing asserts on it today and there is no false PASS yet. It is not an app or user defect. The gate reviewer reached the same view independently (GATE206-S4, Low).
  - **Hard constraint, written into the STUDIO-PERFORMANCE entry now.** Before PERF-FADER flips any `event-share-16` row to `assert`, the metric must be replaced (for example, a per-move frame/LoAF metric with a liveness red-proof showing it is > 0 on a slow drag) or proven live.
  - **Owner of the false sentences.** PERF-FADER rewrites doc 163 l.60 and the event-share `note` in `budgets.json` in the same task, because it owns those rows. They are not granted in 207, which keeps 207 to one bug (round-size rule).
- **I-206-d** (the track drag to 95 % only reaches 0 dB): goes to PERF-FADER's harness (the drag changes the value at both ends).
- **I-206-a** (the fake Bearer got 500 without the :5199 mock): recorded as a `root_note`. G207-3 accepts "403 with the mock / 500 without it, no token either way", and C records which applied.
- **GATE206-S1..S6** (gate reviewer, all Low):
  - **S1** perf global types are visible to `app/` → a root/B tooling decision (`tsconfig` split), `deferred_low_polish`.
  - **S2** Biome does not cover `perf/` → a root/B tooling decision; `biome.json` is frozen. `deferred_low_polish`.
  - **S3** the fiber walk depends on React 18 internals → PERF-1b (record `renderer.version`).
  - **S4** = C-R206-01 (dedupe; closes with it in PERF-FADER).
  - **S5** `test:perf` rewrites the shared `build/` → document in PERF-1b (do not run it in parallel with verify).
  - **S6** `harness.audio-running` is weak → PERF-1b (running context plus ≥ 1 `start()`).
- **Architecture signal** (A's code-reviewer): if PERF-1b grows the spec, move aggregation and report writing to `perf/lib/report.ts`. This goes to `architecture_signals`, unscheduled. B folds it into PERF-1b's grants only if PERF-1b adds scenarios to the spec file.

## 4. B's probes at planning (real Chromium, `b-round-206/tools/`)
- **`cursormap.cjs` at 1440 and 1280.** Computed `cursor` of `elementFromPoint` on a 6 px grid, in three states: (a) clips and video, Env off; (b) Env on with one point; (c) the floating video. The "+"-shaped cursors found:
  - `crosshair` on the envelope editor overlay (the whole clip body with Env on): 1303 / 1095 hits.
  - `move` on the breakpoint, at hover and during the drag.
  - `move` on the floating video box and its `<video>`, at hover and during the drag.
  - Nothing else is "+"-shaped. The legacy `TransportBar` crosshair is not rendered on `/studio-lab`.
  - Outputs: `out/cursormap-{1440,1280}.json`.
  - **Known limitation:** the probe's single `hoverEditor` call returned null (a wrong coordinate). The grid scan, with its hit at (522, 384/402), is the hover evidence. C writes its own probe.
- **`grabcheck.cjs`.** The clip title bar is `grab` at rest and `grabbing` on down and during the drag (`out/grabcheck-1440.json`).
- **`videograb.cjs`.** With `cursor-grab active:cursor-grabbing` injected on the floating box (whose handler calls `preventDefault`), the cursor is `grab` at rest, `grabbing` on down and during the drag, and `grab` after. The box moved (`out/videograb-1440.json`). So the ruling is implementable without new state.
- **L23 scratch run.** On a tar copy at `/tmp/b207`, B applied exactly the three token edits and ran `clip-envelope-ui`, `floating-video`, `affordance-colour-ui` and `panel-radius-ui`: **86/86 pass**. The grep shows no test pins `cursor-crosshair`, `cursor-move` or the video-box class string.

## 5. Reference (the "Reference first" rule)
- **Behaviour (CONFIRMED in the manual).** Line segments and breakpoints are draggable. A click on a segment adds a point. A value readout shows on hover and drag, and a guide line on drag. Only the clip bar drags; the waveform selects time.
- **Cursor shape: no reference found.** The expert searched 11 Live 12 manual chapters plus help.ableton.com and found no official video. B's WebFetch of the whole automation chapter and one WebSearch found the same. No secondary source names the shape either; they only say the segment is highlighted.
- **Decision.** `cursor-pointer` is applied as **Saba's requirement** (the policy text's default), not as an Ableton claim.
- **Deviations D1–D3** are in the task.
- **D1** (the finger shows over the whole body, and double-click anywhere adds a point) is the existing SRW-18 behaviour. Narrowing the hit area to the line, as in Live, is a behaviour change, so it is recorded as recommendation **SABA-B-6-R1**, `awaiting_user`, and not scheduled.

## 6. Decision: round 207 = SABA-B-6 (one Low, fix now)
- 4 grants: 2 components with 3 cursor-token edits, and 2 test files with appended rows.
- 2 new files: the CU4 guard test and doc 164.
- Plus R113: the doc 163 l.4 status line (the fifth grant). The frozen list is 1,043 files.
- C rows: computed cursor at rest and during drags at both viewports, unchanged neighbours, behaviour next to the change, reference parity, review and the auth guard.
- **Next (round 208): PERF-FADER** (SABA-B-5), consulting `performance-optimizer` and `tech-lead` and re-measuring. It also includes the C-R206-01 metric constraint, the doc 163 l.60 and `budgets.json` note rewrite, and I-206-d. Then PERF-1b.

## 7. Bookkeeping
- `backlog.json`:
  - round 206 → `c_pass_published` (`60c82ed`); round 207 entry added;
  - the SABA-B-6 open finding added;
  - SABA-B-5 updated with C's medians;
  - C-R206-01 and GATE206-S1..S6 recorded (S1/S2 → `deferred_low_polish`);
  - the architecture signal recorded;
  - the STUDIO-PERFORMANCE status updated with the PERF-FADER constraint;
  - SABA-B-6-R1 recorded as `awaiting_user`.
- `feature-status.md`: the 206 line → მზადაა (PERF-1a), the 207 line added, a §3 SABA-B-6 row added, and the SABA-B-5 row updated.
- `regression-last.json`: unchanged. The next regression is due on or after 2026-10-30.
- **Ready to commit:** gate 206 is already published. Round 207 is not ready until C PASSes.

## 8. For Saba (the loop does not wait)
- **SABA-B-6-R1.** Should the envelope only react near the line, as in Live: the finger only near the line, a click on the line adds a point, and the body keeps time selection? Today the whole clip body is the envelope editor while Env is on.
- The earlier questions from `b-round-205.md` §8 are still open.
