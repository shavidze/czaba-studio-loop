# B round 336 → 337 planning (2026-11-04)

**Decision: CONTINUE.** Round 337 = **SYS-R336-PERF-DRAG-WINDOW**: a test-only refactor of the interactions perf harness, plus accurate notes. Every perf row value stays the same.
- The task is in `current-task.md`.
- The round-336 task is archived as `tasks/round-336.md`, a byte-equal copy (`cmp` was checked before anything was written).

## 1. Round 336 closed from evidence (D-29z1023)
- **C:** `c-round-336.json` is PASS, with `browserVerified` and `realVerified` true.
  - 10 rows passed, 0 bugs.
  - The six gate rows are not claimed.
- **Gate:** `gates/gate-round-336.json` is `skipped`, "no real changes", head `f1def9c`. It was not `published`, so the baseline stays gate 335's commit, `f1def9c`. Store HEAD and a clean tree were confirmed with git at planning.
- **Backlog:** RETRO 336 → done; `retro_runs[336]` → done; next RETRO due at round 351. SR-336-1/2 stay `awaiting_user`.

## 2. C's notes (D-29z1024)
| Id | Origin | Ruling |
|---|---|---|
| INFO-B336-SMOKE-UNDO-LABEL | B spec | Closed info. B's task expected "Undo: Move clip" for a cross-lane drag; the app's title is "Move to track — Stems" (`historyMoveToTrack`). Not an app bug. It is L29 evidence (an expectation not probed at the baseline) for RETRO 351 |
| INFO-C336-PERF-STATUS-WORDING | C | Closed info |
| INFO-C336-COLLECT-OVERWRITE | B script | Open info → RC-R336-SCRIPT-OUTPUT-DIR (watch to RETRO 351). This round's scripts (`apply-sketch.py`, `make-mutant.py`) write only where they are told |
| SR-336-1/2 | — | Reproduced by C; still Saba's questions |

There are no open Critical or High findings. The open Mediums are root-only or manual, and the 2026-10-23 clarification says they do not block.

## 3. Why SYS-R336 now
- D-29z1021 fixed the outcome: all rows PASS and the planning date (2026-11-04) is before 2026-11-05, so round 337 = SYS-R336.
- `regression-last.json` is 2026-11-02, so REGRESSION is due at the first planning on or after 2026-11-05 (D-29z1029).

## 4. Premise check and the sketch (L29, L58)
- **GATE335-S1 premise did not hold (D-29z1025).** Neither drag function has a `try`. A throw aborts the pass in `runInteractionPass`'s catch, and `context.close()` drops the button. The fix is kept as hygiene, with an observable the harness really has: the in-page `pointerup` record, read in the pass's catch (mutants P and M).
- **Budget file (D-29z1026):** the notes-only grant wins over ARCH-R335's "unchanged budgets". 58 notes change. The 32 older drag notes are included under L7, because they have the same denominator wording as A-R335-REVIEW-WHOLE-NOTE.
- **Sketch:** made in `/home/runner/b336-scratch/sc` (a `git archive` of `f1def9c`; `store/` untouched). Results are in `current-task.md` §0.3.
- **Sketch review (D-29z1027):** `tech-lead`. `code-reviewer` is not on this phase's consult list (root prompt: product-designer, tech-lead, performance-optimizer, ableton-arrangement-expert). There were no Medium+ findings; RV-1…3 are applied in v2. Details: `b-round-336/sketch-review.md`.
- **Advisor:** the configured advisor was available. It was consulted after orientation, before writing, and again before declaring the planning done. After the second call: per-command working directories, the mutant-copy recipe, a non-vacuous example for C's own mutant, the doc-232/perf-lib stale-text sweep (K20 = 0), the hook-live EQUAL note and the sketch-review file wording.

## 4b. Sketch evidence (all on v2; the files are listed in `current-task.md` §0.3)
- **Perf, alone, production build:** 193 rows, `complete` true, 0 failures, 36/36 asserted rows pass, liveness 1 in all passes.
  - 139 EQUAL, 0 DIFF, 0 NEW vs `c-round-335`; `ids-equal 193`.
  - v1 gave the same.
- **Notes-only check:** 58 ids, 0 non-note diffs. **perf-lib:** 34/34. **typecheck:** rc 0.
- **Mutants (1 pass, 1×):**
  - P: `up-after-last-down true`;
  - M: `false`;
  - D: 9 DIFF, exactly the predicted rows, and 73 EQUAL.
  - These runs exit rc 1 by design, because the 6× rows are unmeasured.
- **Claims:** `claims-337-planning-output.txt` (HEAD) and `claims-337-sketch-output.txt` (sketch). Both have empty stderr. They differ only in K2–K7.

## 5. Policy checks
- **No full suite for A or C:** gate rows stay in `"gate"`.
- **`browserVerified`:** PERF and MUTANT (real Chromium) and G337-AUTH (both viewports) can all run here.
- **Protected files:** 11/11 untouched (K8). The purchase guard is re-checked in the browser (G337-AUTH).
- **Scope:** nothing is dropped. Every FB/phase item keeps its queue position. Architecture notes stay signals. SYS-R336 is the one scheduled from RETRO 336.
- **Saba-reported issues:** none new.

## 6. Commit readiness
- Round 336 changed no source, and gate 336 recorded that.
- Round 337 is one test-only change (4 files) and is ready for the normal gate after C PASS.

## 7. Housekeeping and backups
- **Backups:** `b-round-336/backlog-before-337.json`, `feature-status-before-337.md`, `b-next-before-337.json`, `regression-last-before-337.json` (unchanged).
- **Scripts:**
  - `b-round-336/update-backlog.py` (v295 → v296, once-only marker `update-backlog.done`);
  - `update-feature-status.py`;
  - `claims-337.sh`, with outputs `claims-337-planning-output.txt` (HEAD) and `claims-337-sketch-output.txt` (sketch).
- **Scratch dirs** `/home/runner/b336-scratch/{sc,muP,muM,muD,v2check}` are outside `store/` and do not survive the job; every result C needs is copied under `b-round-336/`.

## 8. For root: architecture checkpoint (non-blocking)
- Checkpoint D-29z915 is still unanswered (SIG-R331-DETAIL-PICK and SIG-R332-OVERVIEW-PICK, deadline the close of c5).
- SYS-R336 stays inside the perf spec, so it needs no new checkpoint.
