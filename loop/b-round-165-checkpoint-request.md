# B → root: addendum to the pending frontend-architect checkpoint (2026-10-25, D-29z131)

**Status:** `requested_from_root`, **non-blocking**. This file adds **one question (Q-COMMIT)** to the pending request `b-round-160-checkpoint-request.md`. It does not replace that request, and it re-asks none of its questions. Procedure: `store/.claude/references/architecture-checkpoint.md` (read-only `frontend-architect`; keep/extract argument, value, risk, at most three sentences).

## Why this is requested now (workflow: "repeated structural risk on one owner")
- Round 165 added two more gesture guards to `ArrangementMarkerRow.tsx` (F2, and Enter in the editor).
- Two reviewers independently wrote the same Architecture note about it:
  - **A's code-reviewer** (`a-round-165.md`): "Is a gesture active?" is hand-written at 4 sites with 3 different behaviours. Every new keyboard entry point must remember the guard, and F2 was the one that was missed.
  - **The gate-165 reviewer** (`gates/round-165/review.md`): the rule now lives at 7+ call sites in this component, and the real cause is in `ArrangementContext.commitArrangement`.
- Both proposed the same fix and both said "keep for now". The owner of the fix, `ArrangementContext.tsx`, is protected.
- The underlying contract is B's signal `B-R164-COMMIT-DURING-PREVIEW`. `commitArrangement` accepts a commit while a pointer gesture holds a preview built from `gesture.before`. The next preview then overwrites that commit and leaves an Undo step that does nothing.

## Q-COMMIT (bounded)
Should `commitArrangement` **reject** commits while a pointer-gesture preview is live, or **defer** them to the gesture's end? Or should the per-entry-point guards stay load-bearing (keep)?

**Acceptance for any change** (quoted from the gate-165 reviewer, plus B):
- MU11 and MU13–MU17 and the drag/Undo tests stay green **unchanged**.
- The Move clip → Undo order is preserved.
- The public shape of `useArrangement()` does not change.
- No commit during a gesture leaves a no-op Undo entry.
- Owner: one bounded B task, `ArrangementContext.tsx` only, which needs root approval because the file is protected.

**Value / risk as reported:**
- Value: medium. The guards become defence-in-depth instead of load-bearing.
- Risk: it touches Undo/Redo atomicity and the gesture lifecycle.

## What this request is not
- It is not a scheduled task. Ownership is unchanged.
- It does not block V-3c-3b (round 166) or V-3c-4. V-3c-4 still uses fallback (c) if `b-round-160-checkpoint-request.md` Q4 has no answer.
- B records the answer in `backlog.json` (`B-R164-COMMIT-DURING-PREVIEW`) and only then plans a task.
