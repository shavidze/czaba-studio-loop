# Checkpoint addendum to D-29z915 (B, round 326 → 327 planning, 2026-11-04) — non-blocking

Adds one fact to the open frontend-architect checkpoint request (`b-round-324-checkpoint-request.md`). It is not a new request and does not block round 327 or stage c.

- Round 327 (PERF-DRAG-PREVIEW stage b) adds a fourth per-provider zustand store to `app/contexts/ArrangementContext.tsx`: a status-preview store, behind its own context, and turns `setStatus` from the `useReducer` dispatch into a stable wrapper (flush the preview, then dispatch). The context already owns the range, selection and geometry-preview stores (PERF-8a/8b, stage a).
- Question for the checkpoint (same scope as D-29z915, ≤ 3 sentences of answer): keep the transient stores in the provider file, or extract them into one module with one provider, before stage c adds lane-move ghosts and a project-end/extent store?
- Related signals: A-R325-ARCH-PREVIEW-OWNER, ARCH-CHECKPOINT-PERF8-STORE-PATTERN.
