# B round 317 → 318 planning

**Date:** 2026-11-03
**Baseline:** gate 317 `published` `a5a9c97` (both remotes; rounds 316–317). HEAD `a5a9c97` with a clean tree. Root's `chore(deps)` commit adds zustand on top.
**Decision:** CONTINUE → round 318 = PERF-8a (the range store).

**Advisor:** available, and consulted after orientation. Its advice was adopted:
- PERF-8 is split into 8a/8b;
- the deps request is filed at the loop folder root, as in round 217;
- A STOPs if zustand is missing;
- the target is the component count, and commits per move stays wallclock;
- `range` leaves both the value memo and its deps;
- explicit rows for the neighbouring behaviour;
- the warm-up timeout is recorded as an info finding.

**Advisor, second call (before hand-off):** its two fixes and three sharpenings were applied to `current-task.md`.
- **RS4:** the check runs with a pointer gesture active, because outside a gesture `setRange` may legitimately rewrite the status.
- **PERF-RANGE / PERF-LOAD:** a load-time row may rise by at most A's named count of new always-mounted components. Any rise in an interaction row stays a finding.
- **Subscription placement:** Lane draws only its own overlay; each clip reads its range at clip level; StudioWorkspace's range uses become small subscriber components.
- **Typecheck exception:** it now covers `ArrangementContextValue` literals in tests as well as reads.
- **A-UNIT:** adds `perf/lib/report.test.ts`, run through a scratch config.

## 1. Round 317 ruled (D-29z859)
- **C round 317: PASS.** 13/13 rows, 0 findings, `browserVerified` and `realVerified` true (`c-round-317.json`, `c-round-317.md`).
- **Gate 317:** `published` `a5a9c97`.
- **Done:**
  - **PERF-7** is done (feature-status: მზადაა).
  - **C-R316-01** is closed on C's BYTE-IDENTITY (25/25, 0 kit URLs), FONT-BYTES (equal on 4 routes) and FONT-PIXEL (`/store` 0 px at both viewports) rows.
- **Archive:** `tasks/round-317.md` is a byte copy of the round-317 `current-task.md` (`cmp` equal).
- **Evidence used:** `c-round-317.json`, `c-round-317.md`, `gates/gate-round-317.json`, `a-round-317.md`. B did not re-run C's rows. The round had no failure to confirm.
- **`root-pre-push-review.md` / `publication-checkpoint.json`:** they carry the 2026-10-07 content (rounds 3 and 50–58), which earlier B rounds triaged. They hold no new finding for round 317.

## 2. Next scope (D-29z860)
- **Schedule:**
  - REGRESSION is not due: `regression-last` is 2026-11-02, so the next falls on or after 2026-11-05.
  - RETRO is at round 320.
  - So round 318 is the next STUDIO-PERFORMANCE stage in `execution_order_d29z852`: **PERF-8**.
- **Split** (perf-plan: 2 rounds):
  - **8a = `range`.** It is the measured range-drag scenario.
  - **8b = `selectedClipIds`.** It is measured on the select commit.
- Clip click and play/pause stay with PERF-10.
- **PERF-DRAG-PREVIEW is kept separate.** Its backlog note left the merge open; tech-lead's ruling is that it changes the document (`history.present`), not a transient overlay.

**Measurement** (L37; C's production run of 2026-11-03, `c-round-306/perf/perf-1b-i-…json`):

| Metric | Value |
|---|---|
| components per move | 108.167 |
| commits per move | 1.983 (wallclock) |
| largest commit | 105 |
| playing restarts | 0 |

So each move makes one large commit and one of about 3 components. C's PERF-RANGE row includes a baseline control on the real baseline.

## 3. Consults (both required before a PERF dispatch)
- **performance-optimizer:**
  - **Second commit:** it comes from `ArrangementDetailContentInner`'s start/end layout effect (FACT). It is untouched; commits per move stays a record row.
  - **Gesture count:** `gestureCountRef > 0` during the drag (FACT).
  - **Readers of `range`:** listed in task §0.2.
  - **Feasibility:** ≤ 15 per move is realistic with `range` alone (INFERENCE).
  - **Selectors:** they must return the stored reference or primitives; zustand v5 loops on fresh objects.
- **tech-lead:**
  - **Store:** `app/lib/arrangement/range-store.ts`, one per provider, exposed through `ArrangementRangeContext` and `useArrangementRange(selector)`.
  - **Writers:** `setRange` keeps its `rewriteStoppedTruth` branch.
  - **Reads:** every imperative read moves to `getState()`.
  - **Context:** `range` leaves the value and its deps.
  - **Per-clip blocker:** the lane's `clipRange`.
  - **Risks:** the ordering of the range store and the selection; stale imperative reads; the undo clear path.
  - **Note:** tech-lead could not open `docs/technical/performance/`, because it sits outside `store/`. B checked the zustand rule there itself.

## 4. Pre-check and claims
**Inventory (L23):**
- 22 test files read `range` off the context (`b-round-317/range-test-files.txt`), with 3,139 `expect(` calls (`expect-count-head.txt`).
- `range` is destructured in 8 app files, and there are 7 + 6 imperative reads.

**No scratch sketch.** zustand is not installed in this job. This is stated in task §0.3 as a known limit of the pre-check.

**Claims:** `b-round-317/claims-318.sh` K1–K16, head output `claims-318-head-output.txt`.

## 5. Bookkeeping (D-29z861, D-29z862)
**`root-deps-request.json`:** `{"add": ["zustand"], "remove": []}`. zustand 5.0.16 is on `cloud/deps-allowlist.json`. **For root:** install it before round 318's A phase, or A STOPs.

**Backlog v277:**
- round 317 → `c_pass_published`, and round 318 is `dispatched`;
- stage statuses: PERF-7 `done`; PERF-8 → in_progress with `split_d29z860`; new stages PERF-8a/8b;
- PERF-DRAG-PREVIEW gains `merge_ruling_d29z860`;
- `consults_round_318`;
- `execution_order_d29z860`;
- C-R316-01 closed;
- new info `INFO-C317-WARMUP-TIMEOUT`;
- `ROOT-REQ-DEPS-ZUSTAND`.

**`feature-status.md`:** PERF-7 მზადაა; PERF-8a მუშავდება.

**`lessons.md`:** unchanged (59 lines). No new failure class this round.

**Backups:** `b-round-317/{backlog-before-318.json, feature-status-before-318.md, lessons-before-318.md, b-next-before-318.json}`.

**Architecture:** the structural signals on `ArrangementContext` (ARCH-R315-*) stay signals. A bounded frontend-architect checkpoint will be requested at the end of PERF-8b/PERF-10, the context-split boundary. It does not block now.

**Signals:**
- `/studio-lab` FCP − DCL → PERF-11;
- the source of the noto-sans-georgian-latin glyph is undetermined;
- A-R316-REVIEW-P4 (CSP `font-src data:`) is unchanged.

## 6. Commit readiness
- **Round 317:** its tree is already published (`a5a9c97`).
- **Round 318:** nothing is ready yet. The §2.1 paths become ready after C PASS and gate 318.
