# B round 355 → 356 planning

**Decision: CONTINUE.** Round 356 = PERF-CAND-VIDEO-MOVE-BUDGET (budgets + doc 232 only). Task: `current-task.md`; the round-355 task is archived as `tasks/round-355.md` (byte-equal copy, nothing deleted).

## Inputs read
- `context/active-summary.md`, the round-355 task, `a-round-355.md`, `c-round-355.md`, `c-round-355.json`, `gates/gate-round-355.json` (published `6588f08` on both remotes), `gates/round-355/review.md`, `lessons.md`; backlog ids by lookup only.
- `regression-last.json`: 2026-11-05 (round 342), so REGRESSION is due on or after 2026-11-08. Not due today.
- RETRO: next due at round 368 or the end of STUDIO-PERFORMANCE (`retro_policy.next_due`). Not due.

## Round 355 closed from C's evidence (D-29z1145)
- `c-round-355.json`: PASS, `browserVerified` true, `realVerified` true, 0 bugs. Fake-bearer 403 is `blocked` (mock :5199 down), which is the cloud backend rule, not a browser gap.
- B's `tools/l57-check.py` on it: rc 0 (`b-round-355/l57-check-c355.txt`); two `null` fields with a reason.
- Closed in `open_findings` and `deferred_low_polish`: A-R350-REVIEW-TEST-NITS (a)(b), A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION. Part (c) stays as ruled and is tracked as GATE355-L2.
- SYS-R353-DP-TEST-POLISH is `done` in `feature-status.md` (მზადაა) and the queue.

## Gate 355 review (D-29z1146)
| id | sev | routing |
|---|---|---|
| GATE355-L1 | Low | `deferred_low_polish`; for the next round that owns `drag-preview-render.test.tsx` |
| GATE355-L2 | Low | `deferred_low_polish`; trigger: next task touching `ArrangementClip.tsx` |
| GATE355-L3 | Low | `deferred_low_polish`; same owner rule as L1 |
| GATE355-I4 | info | recorded; doc 232 item 111 already states it |
| GATE355-L5 | Low | joins signal GATE354-ARCH-DOC232-SPLIT |
| Architecture note | signal | GATE355-ARCH-DP-VIDEO-SPLIT, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; not scheduled |

## Round 356 (D-29z1147)
- Three video move rows: stopped per-move `<= 24` → `<= 10`; stopped max and playing max `record` → `<= 13` / `<= 12`. Asserts 82 → 84.
- GATE354-S1, widened by class: "Record until …" removed from all 19 asserted notes that had it.
- **B sketch runs (production, alone; `b-round-355/perf-summary.txt`; predictions in `b-round-355/checkpoint.md` first):**
  - sketch 84/84, 0 NEW, 0 higher than C354, 449712 ms;
  - M-B2 red on exactly the 9 predicted rows, including all 3 new ones (15.75 / 17 / 17);
  - perf-lib 40/40.
- **Consults:**
  - `tech-lead`: 0 Medium+. TL-R356-2 was fixed in the sketch, and TL-R356-1 was ruled keep-assert.
  - `performance-optimizer`: assert the playing max `<= 12`, because tick commits do not merge with pointermove commits.
  - Review file: `b-round-355/sketch-review.md`.
- Claims: `b-round-355/claims-356.sh`. Its outputs on HEAD and on the sketch are saved, and K11 reports `39 listed, 0 missing`.

## Architecture checkpoint and Saba questions
- ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE: still no answer artifact (requested in `b-round-352/root-request-arch-checkpoint.md`). It is non-blocking, and it now also carries GATE355-ARCH-DP-VIDEO-SPLIT. PERF-CAND-MASTER-GROUP-FADER-PROPS waits for it, and the queue proceeds without it (D-29z1148).
- ROOT-REQ-PERF-TIMEOUT, SR-353-1 and SR-353-4 stay `awaiting_user`.

## Advisor
The configured advisor was available and consulted twice: after orientation, before writing, and before declaring done.

## Next (D-29z1148)
1. PERF-CAND-MASTER-GROUP-FADER-PROPS if the checkpoint is answered; otherwise PERF-CAND-FADE-RELEASE-COMMITS or PERF-9.
2. Then PERF-9…15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2, under the skip rule.

REGRESSION comes first at any planning on or after 2026-11-08.

Ready for commit after C PASS: the root gate publishes. B made no store change: `store/` git status is clean.
