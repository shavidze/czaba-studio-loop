# B round 84 review → round 85 task (D-29z50)

Author: B · Date: 2026-10-22 · Decision: **CONTINUE** (`b-next.json`)

## 1. Inputs read
- `context/active-summary.md`, `context/active-backlog.json` (partial; full backlog looked up by ID only);
- the round-84 task (`current-task.md`, now archived as `tasks/round-84.md`, an exact copy: sha256 `59075581…`);
- `a-round-84.md`, `c-round-84.md`, `c-round-84.json`;
- `gates/gate-round-84.json`: **published**, commit `88b0262bda6bdc928bbc39c4cbca77c8a2ca9504` on both remotes. This is the baseline HEAD for round 85;
- `env-status.json` (store 200), `regression-last.json` (2026-10-21, round 71).
- App source at `88b0262`, read-only: `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementExportDialog.tsx`, `graph.client.ts` (`renderArrangementWav`), `ArrangementContext.tsx` (`exportWav`), `schedule.ts` (`planSchedule`), and the tests `graph.test.ts`, `export-dialog-focus.test.tsx` and `master-ui.test.tsx`.
- Live 12 manual §5.1.3 / §5.1.3.1 was fetched with curl into `b-round-84/web/` and treated as untrusted data.
- **Advisor:** the configured advisor tool was available and was consulted twice: once before the plan was written and once to review the written artifacts. Its advice on round shape, the M1 mechanism, the C-R84-L1 harness rule and the SRW-20 stage split was adopted. One divergence: B prefers lane-body `isolate` over clip-root `isolate`, because the lane-body token also covers the ghosts. The clip root is granted as the alternative.

## 2. Evidence-based backlog updates (C evidence only)
| Item | Before | After | Evidence |
|---|---|---|---|
| SRW-19 (FB-07) | in_progress | **c_pass_tech_lead_manual** (feature-status: მოწმდება); R19-F1 and R19-F2 pass; stage 1 `c_pass_published`, `browserVerified=true`, `realVerified=true` | `c-round-84.json` passed[] (VF-*), gate 84 `88b0262` |
| C-R83-L1 | scheduled X1 | **closed** | X1-ALIGN: 0 px at 40 and 32 px/s, both viewports |
| GATE83-M1 | probe | **reproduced → C-R84-M1 (Medium)** | `pm1b-*.json` |
| C-R84-L1 | — | open, Low, Lows batch + harness rule HR-C-R84-L1-EXPORT-JITTER | `r2-1280x720-{a,b}.json` |
| SRW19-RESCHEDULE / VIDEO-FADE-SOUND | signal | signal with C numbers (4 restarts per drag; video sound present and not faded, max 0.507) | `c-round-84.json` signals |
| R84-T, R85-T | — | Tech Lead manual checks added | — |

Not moved to done: SRW-19 stays below **მზადაა** until Tech Lead R84-T and the final regression are done, following the SRW-18 handling. The fake-Bearer 403 sub-check stays BLOCKED (backend unavailable in the cloud) as open evidence.

## 3. Round 85 decision and rationale
- **Ordering.** C bugs come first. C-R84-M1 is the only open Medium; there is no open Critical, High, security or data-loss bug.
  - M1 can cause data edits (a hidden clip changed through the header), but it is not data loss: Undo restores it. So it opens the round as a labelled bounded fix (X1) with its own C rows. This follows the round-84 precedent of one bounded fix plus one feature stage, and the files do not overlap.
- **The regression round is not due.** Today is 2026-10-22; the last regression baseline is 2026-10-21; due on or after 2026-10-24. It is likely due at round-86 planning.
- **Next scope in dependency order: SRW-20.** It depends on SRW-13, whose export rows R13-M3 and R13-M4 are C PASS. The split keeps every SRW-20 acceptance:
  - stage 1, range export: R20-X1, plus a re-check of R20-X3;
  - stage 2, MP3 with a clear CDN error: R20-X2;
  - stage 3, worker encoding with progress and cancel: R20-X4.

  Nothing is deferred.
- **M1 mechanism (pinned from source).** The header is `sticky z-20`. The lane body and an unselected clip root form no stacking context, so the clip's handles (z-30/40), trim strips (z-20, later in the DOM) and ghosts (z-30) compete directly with the header. Envelope points are covered only because their parent is z-10.
  - **Smallest honest fix:** one `isolate` token. The header z stays, and the frozen `z-40` assertion stays.
  - **Honest test label:** jsdom cannot hit-test, so A's test is a structural regression lock. C's browser rows are the proof.
- **Range export: uncertain UI contracts, smallest honest choices.**
  - **Render the window, don't slice the full render.** The window uses the same `from` / `startAt` mid-start path as live playback (C-verified FD-MIDSTART / EN-MIDSTART). It costs less on long projects (stage 3) and matches Live's Render Start.
  - **Master mix whatever lane holds the range.** Live's "Main" default.
  - **Range is the default when it exists.** Live §5.1.3.1.
  - **No typed start/length fields.** A conscious simplification under the user's "simple editing" scope.
  - **Separate filename** `czaba-studio-lab-range.wav`, so the project export stays byte-identical, including the frozen DONE_MESSAGE.
  - **`round()` for the window length.** The project export keeps `ceil()`.
  - **Frozen-test grant:** the literal assertion `graph.test.ts` l.388 must change with the new call. Exactly that line is granted, plus one added assertion.
- **The harness rule from C-R84-L1 is written into §5,** so a correct range export is not failed by the ±1 LSB video-sound jitter.

## 4. Architecture
- A's round-84 Architecture note goes into the backlog: signals A-R84-ARCH-FADES-HELPERS, A-R84-ARCH-DOCK-WRITER and A-R84-BORDER-CONSTANTS, plus the `architecture_signals` entry. These are signals, not scheduled tasks.
- SRW-19 is a feature boundary. Root has still not answered the SRW-16 / round-83 checkpoint request, so B appended a bounded **round-84 addendum (q12)** to `b-round-83-checkpoint-request.md`. It also adds C's reschedule numbers to q3.
- The request is non-blocking: independent core features continue.
- **Request to root:** please run the bounded frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`) on that request at the next publish.

## 5. Artifacts written (B-owned only)
- `tasks/round-84.md` (copy);
- `current-task.md` (round 85);
- `b-round-84-r85-tree-sha256.txt` (481 entries, 481/481 OK at `88b0262`) and `b-round-84-r85-snapshots/` (7 files + SHA256SUMS);
- `backlog.json` v84 (pre-copy `b-round-84-pre-backlog.json`; script `b-round-84/update_backlog.py`);
- `feature-status.md` (pre-copy `b-round-84-pre-feature-status.md`);
- `docs/technical/studio-real-workspace/plan.md` D-29z50 + the FB-07 row (pre-copy `b-round-84/plan.before-b-round-84.md`);
- the checkpoint-request addendum (pre-copy `b-round-84/checkpoint-request.before-addendum.md`);
- `b-next.json` (previous copy in `b-round-84/b-next.before.json`);
- `b-round-84-checkpoint.md`.
- No app source, test, gate or other agent's file was modified. No commit or push.

The review fixed the end-state count (6 M + 4 ??, counting doc 074), kept the project-scope dialog description byte-identical, made the `graph.test.ts` extra assertion optional, and added a "not reachable" path to XR-PASTEND.

## 6. Commit readiness
Round 84 is already published by root (`88b0262`). There is nothing for root to publish from B. Round 85 starts from a clean tree.

## 7. Task summary
Round 85 has two parts:
- **X1 = C-R84-M1:** the sticky track header must cover the clip content scrolled under it (one `isolate` token).
- **SRW-20 stage 1:** range export (WAV window render, Export dialog scope radios, `czaba-studio-lab-range.wav`, project path byte-identical).

C verifies 18 rows at 1440x900 and 1280x720. Next is the regression round (likely due at round-86 planning), otherwise SRW-20 stage 2 (MP3).
