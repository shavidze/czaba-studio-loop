# B round 337 → 338 planning (2026-11-04)

**Decision: CONTINUE.** Round 338 = **PERF-DRAG-PREVIEW stage c3-ii**. During a cross-lane drag, the ghost state moves from the provider's `useState` into a per-provider zustand store, and the cross-lane branch stops writing history on every move. The 7 lane perf rows become `assert`.
- The task is in `current-task.md`.
- The round-337 task is archived as `tasks/round-337.md`, a byte-equal copy. `cmp` was checked before anything was written, and again before `current-task.md` was overwritten.

## 1. Round 337 closed from evidence (D-29z1031)
- **C:** `c-round-337.json` PASS, with `browserVerified` and `realVerified` true. 9 rows passed and 0 bugs. The six gate rows are not claimed.
- **Gate:** `gates/gate-round-337.json` is `published` `bbc281f` on both remotes. **The baseline is `bbc281f`**, which equals store HEAD, and the tree is clean (claims K1, K2).
- **Backlog:** SYS-R336-PERF-DRAG-WINDOW → done. It closes GATE335-S1/S3/S4, A-R335-REVIEW-WHOLE-NOTE, INFO-A335-SEQUENCE-ORDER and ARCH-R335-DRAG-WINDOW-HELPER (L7).

## 2. Round-337 notes (D-29z1032)
| Id | Origin | Ruling |
|---|---|---|
| A-R337-REVIEW-HELPER-NAMES (#1–#4) | A reviewer | `deferred_low_polish`. The names were pinned by the round-337 task |
| A-R337-REVIEW-DOC168-WORDING | A re-review | Fixed in round 338: doc 168 `## მეტრიკები` is granted again |
| INFO-A337-MAKE-MUTANT-DOC, INFO-C337-AUTH-SCRIPT | A / C script | Closed info |
| Gate 337 reviewer: `pressedGesture` note | gate | No fix needed; recorded |
| Gate 337 reviewer: helpers to `perf/lib/` | gate | ARCH-R337-PERF-HELPERS-TO-LIB, a signal only (waits for ROOT-REQ-VITEST-PERF-INCLUDE) |

There are no open Critical or High findings. The open Mediums are root-only or manual, and the 2026-10-23 clarification says they do not block. C reported no bugs, so there was no C bug to schedule first.

## 3. Why c3-ii now (D-29z1033)
- `regression-last.json` is 2026-11-02, and the planning date is 2026-11-04, 2 days later. REGRESSION is due at the first planning on or after 2026-11-05, so round 338 takes the next item in the dependency order: PERF-DRAG-PREVIEW c3-ii (D-29z1029).
- Nothing is dropped from scope. The FB/SRW/T12/phase items keep their queue positions. Architecture notes stay signals.

## 4. Premise and the sketch (L37, L58)
- **Premise (D-29z1034).** At `bbc281f`, 4 cross-lane moves render 87 components each, with the provider and `StudioWorkspace` rendered every time. Provider hooks 0 (history) and 35 (`clipLaneDrag`) change on every move.
  - Mutant A shows that hook 35 is the cost: with the drag in a store and the history write restored, a move costs 25.25 instead of 24.906.
- **Sketch** in `/home/runner/b337-scratch/sc` (a `git archive` of `bbc281f`; `store/` untouched). It is built by the four scripts and two hand steps named in the task, §0.2. The final patches are in `b-round-337/sketch/`, and each passes `git apply --check` on HEAD.
- **Results:**
  - typecheck rc 0, Biome rc 0;
  - covering units 18 files / 446 tests;
  - 6 unit mutants, each red on its row;
  - perf runs 1–3, the last on the final tree: 43/43 asserted pass, lane per-move 58.969 → 24.906, 131 EQUAL, 8 DIFF (all explained), `ids-equal 193`, liveness [1,1,1] at both rates;
  - perf mutant AE: A 25.25 > 25, so it is red; E makes liveness 0;
  - browser probe vs HEAD: **0 behaviour diffs** at 1440×900 and 1280×720, and cross-lane commits 87 → 5.
- **Claims:** `claims-338-planning-output.txt` (HEAD) and `claims-338-sketch-output.txt` (sketch). Both have empty stderr.

## 5. Consults (D-29z1035)
- **`tech-lead`** reviewed the sketch, because `code-reviewer` is not on this phase's list.
  - **TL-1 (Medium):** B's v2 guard would have left `previewActiveRef` false on a direct cross-lane drag, so a video import could publish mid-drag. Fixed in v3, pinned by DP49, with mutant MU-GUARD-V2.
  - TL-2…TL-5 (Low): applied.
- **`performance-optimizer`:**
  - which rows to assert and with what headroom;
  - `max`, wallclock and `.6x` rows stay record;
  - liveness check (e);
  - the DP49 early preview-null assert;
  - two signals.
- Everything is in `b-round-337/sketch-review.md`.
- **Advisor:** the configured advisor was available. It was consulted after orientation, before the sketch. The second call, before declaring done, is recorded below.

## 6. Policy checks
- **No full suite for A or C:** the gate rows stay in `"gate"`.
- **`browserVerified`:** PERF, CROSS-NAMES, CROSS-BEHAVIOUR, G338-AUTH and STUDIO-SMOKE-338 can all run in the cloud. None needs the backend.
- **Protected files:** 11/11 untouched (K8). The purchase guard is re-checked in the browser (G338-AUTH). The `/studio-lab` demo opens anonymously.
- **Reference-first, product-designer and screen budget:** not applicable (pure performance; behaviour held to HEAD).
- **Saba-reported issues:** none new. Escape not cancelling a cross-lane drag is pre-existing and already ruled (C-R85-L1 / ESCAPE-CANCEL-GESTURE).

## 7. Commit readiness
- Round 337 is published (`bbc281f`).
- Round 338 is one 16-file change, ready for the normal gate after C PASS.

## 8. Housekeeping and backups
- **Backups:** `b-round-337/backlog-before-338.json`, `feature-status-before-338.md`, `b-next-before-338.json`, `regression-last-before-338.json` (unchanged).
- **Scripts:** `update-backlog.py` (v296 → v297, once-only marker `update-backlog.done`), `update-feature-status.py`, and `claims-338.sh`.
- **Scratch dirs:** `/home/runner/b337-scratch/{sc,muA,head,headfull}` are outside `store/` and do not survive the job. Every result C needs is under `b-round-337/`.
- **Second dev server:** the sketch's :5198 server (Vite cache `/tmp/b337-vite-cache`) is stopped, and the scratch `vite.config.ts` is restored. The root :5173 server was left running.

## 9. For root: architecture checkpoint (non-blocking)
- Checkpoint D-29z915 is still unanswered (SIG-R331/SIG-R332, deadline the close of c5).
- c3-ii adds a sixth per-provider store, following the PERF-8a pattern. That is not a new structural pattern, so no new checkpoint request is made.
- At the close of stage c (after c5), B will request the bounded frontend-architect checkpoint that covers the store set and the preview readers.

## 10. Advisor (second call) and resume
- Attempt 1 stopped after it had written all the artifacts and before the final advisor call. Attempt 2 checked them: the 3 patches pass `git apply --check` on `bbc281f`, `b-next.json` is valid, backlog is v297 (`update-backlog.py` was not re-run; its once-only marker exists), and store tree is clean.
- The configured advisor was available and was called a second time, before declaring done. It found no change to make to the plan. `context/active-summary.md` is left to root, because root regenerated it at 20:02 and no earlier B round edited it.
