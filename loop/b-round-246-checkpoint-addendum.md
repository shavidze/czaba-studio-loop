# ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS: addendum to question 4 (D-29z416, B round 246 → 247 planning, 2026-10-29)

**For root.** This is a bounded request for the existing read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. It is not blocking: round 247 goes ahead with its own grants. It is wanted before SABA-B-10a. Base request: `b-round-244-checkpoint-request.md`.

**Why now.** This is the feature boundary of the focus-after-removal work. After round 247 the same pattern lives in two owners:
- `ArrangementMarkerRow.tsx` (round 246, `869d767`): `detachedFocusRef`, recorded in the inline flag ref's null branch, then `focusSuccessorAfterRemoval`. This is the fourth focus ref in that file (`pendingFocusRef`, `restoreFocusRef`, `blurSuccessorRef`).
- `StudioWorkspace.tsx` together with `ArrangementGroupHeader.tsx` (round 247 plan): `onFocusedRowDetach`, recorded in the row-root ref, then `detachedRowFocusRef` and `focusRowSuccessor`. It yields to `pendingRowFocusRef`.

Gate 246's reviewer (signals 3+4, `gates/round-246/review.md`) proposed one shared focus-successor mechanism.

**Question (max 3 sentences back, keep/extract with cost and risk):**
- Should the two rescues stay per owner, or should one helper (for example a `useFocusSuccessorOnRemoval(order, focusTarget)` hook or a ref factory) own the shared parts: the detach record, the order snapshot, the next-then-previous walk and the yield to an explicit request?
- If extract: which owner first?
- Which behaviour-preserving tests must be the acceptance? The candidates are MU18–MU23, GF1–GF7 and the 17 mutant runs of rounds 246–247.

**Evidence:** `current-task.md` (round 247) §1 and §0.2; `tasks/round-246.md` §1; `b-round-246/precheck-scratch.diff`; `gates/round-246/review.md`.
