# Root request: bounded frontend-architect checkpoint, library preview region (D-29z1346)

**When:** after PERF-13c-ii-b passes C (the PERF-13c feature boundary). This does not block rounds 394 and 395.
**Procedure:** `store/.claude/references/architecture-checkpoint.md`. Read-only `frontend-architect`.

**Question:** `startLibraryPreview` in `app/contexts/ArrangementContext.tsx` has four branches: stream, decode, not-ready and buffer. It also holds the stream-fallback memory, three preview-player creation blocks and an 8-dependency `useCallback`. Should it be:
- **(a) kept** as is;
- **(b) extracted** as a pure `decidePreviewMode` (A-R393-ARCH-DECIDE-PREVIEW-MODE) plus the settle helper (ARCH-CAND-SETTLE-HELPER-EXTRACT); or
- **(c) extracted** as a `useLibraryPreviewController` hook with `ensurePreviewPlayer` (GATE393-ARCH-PREVIEW-CONTROLLER)?

**Constraints for any extraction:**
- The `useArrangement()` shape is unchanged.
- PS1–PS24, EV*, and the round-392 preview tests stay green.
- One owner and one round.

**Answer format:** keep/extract with the reason, value, risk, and at most three sentences.

**Also still open:** ARCH-CHECKPOINT-DECODE-REGION (`b-round-383/root-request-arch-checkpoint-decode-region.md`). It is the same region, and both can be answered in one checkpoint.
