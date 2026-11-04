# B round 335 → 336 planning (2026-11-04)

**Decision: CONTINUE.** Round 336 = **RETRO 336** (window 321–335) + whole-screen and journey review on `f1def9c`. No app code; A changes nothing; C checks traceability and runs three browser rows.
- The task is in `current-task.md`.
- The round-335 task is archived as `tasks/round-335.md`, a byte-equal copy (`cmp` checked before the overwrite; claim K16).

## 1. Round 335 closed from evidence
- **C:** `c-round-335.json` is PASS, with `browserVerified` and `realVerified` both true.
  - 11 rows passed, 0 bugs, 0 blocked.
  - The six gate rows are not claimed by C.
- **Gate:** `gates/gate-round-335.json` is `published`, commit `f1def9c`, and both remotes equal it. The review says COMMIT OK, 9/10. **The baseline for round 336 is `f1def9c`.** The store HEAD and a clean tree were confirmed with git at planning: `b-round-335/head-at-planning.txt` and `git-status-at-planning.txt`. `context/head-sha.txt` still said `0d22ab9` and was stale.
- **Backlog (D-29z1011):**
  - PERF-DRAG-PREVIEW stage c3-i → done;
  - the stage stays `in_progress`, because c3-ii, c4, c5 and the conversions remain;
  - `c-round-335/lane-rows.txt` is the c3-ii baseline.

## 2. Rulings on the round-335 findings
| Id | Origin | Ruling |
|---|---|---|
| GATE335-S1-MOUSE-UP-FINALLY | gate reviewer 1 | Low. If a read throws, the mouse button stays down. Scheduled in SYS-R336 with a mutant row (D-29z1012, D-29z1019) |
| GATE335-S2-PERMOVE-DENOMINATOR | gate reviewer 2 | Closed as info. It matches `measureDrag`, and the doc's accounting is correct |
| GATE335-S3-LANE-SEGMENT-CONSTANTS, GATE335-S4-REPEATED-NOTES | gate reviewer 3, 4 | Low → SYS-R336 |
| ARCH-R335-DRAG-WINDOW-HELPER | gate reviewer Architecture note + A's note | A signal, scheduled as SYS-R336. This is the RETRO systemic task, not an automatic refactor |
| A-R335-REVIEW-WHOLE-NOTE | A code-reviewer | `deferred_low_polish` (D-29z1013) → SYS-R336 |
| INFO-A335-SEQUENCE-ORDER | A (pre-existing) | Info → SYS-R336, which owns the file |

There are no open Critical or High findings. The open Mediums are root-only or manual, and the 2026-10-23 clarification says they do not block.

## 3. Why RETRO now, and how the numbers were made
- **D-29z1009 fixed the order:** this planning is on 2026-11-04, before 2026-11-05. So round 336 is RETRO and REGRESSION follows.
- **`retro_policy.next_due`** = round 336, window 321–335.
- **Scripts:** retro 321's scripts were copied to `b-round-335/` and re-parametrised to 321–335 and `backlog-before-336.json`.
  - `retro-numbers.py` was rebuilt: its groups come from `task-titles.txt`.
  - New: `exp-fields.py`, `retro336-mentions.py` (wider regex), `gate-reviews-hand.txt` (334's review has no `###` heading) and `fails-cause-hand.txt`.
  - Every number in `retro-336.md` names its file.
- **Screens:** `b-round-335/screens/capture.mjs` (retro 321's script; only the 321 → 336 file names change) ran with the mock backend.
  - B started its own mock, because none was running, and stopped it afterwards (`b-round-335/mock.log`).
  - The visible rows equal RETRO 321 (`compare-321-336.txt`).
- **Consults (real):**
  - `tech-lead`: lessons, the EXP reading, the systemic task and RC-R275;
  - `product-designer`: screen and journey review.

  The others named by the RETRO policy are not in this phase's consult list. That is recorded in `retro_runs[336].consults`, and nobody's opinion is invented. After both consults: `git status` was empty and `sha256sum -c` rc 0.
- **Advisor:** the configured advisor was available. It was consulted after orientation and before writing, and again before declaring the planning done.

## 4. Policy checks
- **No full suite for A or C.** The gate rows go to `"gate"`.
- **`browserVerified` rule:** three browser rows at both viewports (RT-SCREEN, G336-AUTH, STUDIO-SMOKE-336). The smoke now also exercises the c3-i cross-lane move and its Undo.
- **Lessons:** 59 → 59 lines (D-29z1015). Four lines change: l.3, L22, L57 and L58, all appends except the sources span on l.3. L23 is unchanged at 5058 bytes.
- **Saba-reported issues in the window:** 0 new SABA-B ids. The 2026-10-28 rule has nothing to count.
- **Protected files:** untouched, 11/11 (K4). The purchase guard is re-checked in the browser (G336-AUTH).
- **Scope:** nothing is dropped. All FB/phase items keep their queue position. The screen candidates are `awaiting_user`, not deferred by B.

## 5. Systemic task and queue
- **SYS-R336-PERF-DRAG-WINDOW** (D-29z1019) closes six ids.
  - It is test-only, and it runs before c3-ii (`tech-lead`).
  - The gate reviewer preferred after c3-ii. The disagreement is recorded in `retro-336.md` §7.
- **Order (D-29z1021):**
  1. 336 RETRO;
  2. 337 REGRESSION if planned on or after 2026-11-05, otherwise SYS-R336;
  3. SYS-R336;
  4. c3-ii (with the liveness assert), c4, c5 and the conversions;
  5. PERF-9…15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM;
  6. STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED;
  7. the phase-2 entries (skip rule).

## 6. Commit readiness
- Round 335 is published (`f1def9c`).
- Round 336 changes no source. Root records the loop state only after C's verdict.

## 7. Housekeeping
- **Store:** unchanged; `git status` shows 0 entries.
- **Backups:** `b-round-335/backlog-before-336.json`, `lessons-before-336.md`, `feature-status-before-336.md`, `b-next-before-336.json`, `current-task-before-336.md` and `regression-last-before-336.json`.
- **Update script:** `b-round-335/update-backlog.py` (v294 → v295, once-only; marker `update-backlog.done`). The content diff is additive only: the list lengths grow, and only `version`, `updated`, `current_task` and `retro_policy` change in place.
- **Serialisation:** the dump writes raw UTF-8. `grep -c '\\u10'` gives 338 in the before-copy and 0 now, so root sees a large textual diff of `backlog.json`. A normalised compare (both files loaded and re-dumped the same way) shows only the changes above.
- **Small data files:** `b-round-335/misc-outputs.sh` re-creates `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt` and `c-models.txt`. A scratch run gave byte-equal files. `candidates.txt` was consult input only.
- **Advisor fixes, second call:** traceable sources for the closures and the two archived Mediums; the model change as a fact; an unambiguous smoke target lane. Backups: `retro-336-before-advisor-fixes.md` and `current-task-before-advisor-fixes.md`.
- **For root:** `optimize-backlog.py` archived R80-RECORDINGS-FIELD-BORDERS (Medium). It is still open backend evidence, so it should stay in the active view (`retro-336.md` §1, §12.4).
- **Claims:** `b-round-335/claims-336.sh`. Its output is `claims-336-output.txt` (stderr empty), re-run after the last edit.

## 8. For root: architecture checkpoint (bounded, non-blocking)
Checkpoint **D-29z915** has been unanswered since round 327. The addenda are `b-round-327/328/331/334-checkpoint-addendum.md`, and the default keep applies (D-29z1007). Two L46 deadlines reached RETRO 336 and are added here as questions for the read-only `frontend-architect` (per `store/.claude/references/architecture-checkpoint.md`):
1. **SIG-R331-DETAIL-PICK:** should the detail panel read a `Pick` projection of the clip (only the fields it shows) instead of the whole clip? Keep or extract, with value and risk.
2. **SIG-R332-OVERVIEW-PICK:** the same question for the overview: does it read only the shown set and the committed loop?

The new deadline for both is the close of PERF-DRAG-PREVIEW c5. Nothing is blocked. SYS-R336 is test-only and inside the perf spec, so it needs no checkpoint.
