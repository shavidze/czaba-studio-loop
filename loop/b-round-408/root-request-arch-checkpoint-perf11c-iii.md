# Root request: bounded frontend-architect checkpoint ARCH-CHECKPOINT-PERF11C-III-BOUNDARY (D-29z1418), non-blocking

**From:** B, round 408 → 409 planning, 2026-11-08. **Why now:** PERF-11c-iii-e-ii (round 409) is the last stage of PERF-11c-iii, the "context leaf consumers" feature. D-29z1414 asked for a feature-boundary checkpoint at e-ii planning. After round 409 every former `useArrangement()` leaf (Library, LibraryPreview, LoopBrace, MarkerRow, Master, Transport, VideoDock, Lane) follows one of two shapes: a shell that reads the value context plus a `memo` inner, or a direct read of the actions context. Five reviewers in a row (rounds 404–408, A and gate) answered "keep" on the open request `ARCH-CHECKPOINT-SYS-R385-ACTIONS` (`b-round-404/root-request-arch-checkpoint-sys-r385.md`). This request replaces its scope with the boundary question. The old request stays open only as a pointer.

Please run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on HEAD **after round 409 publishes**. For each question, record keep/extract, value, risk and at most three sentences:

1. **The triple 59-key actions list** in `app/contexts/ArrangementContext.tsx`: the `ArrangementActions` Pick, the actions memo object and its deps array. These are SIG-R408-ACTIONS-TRIPLE-LIST, TL-R403-SK-L1, and gate 408's proposal "derive object and deps from one declaration without type assertions". Keep it, or extract it, and in what form? A `satisfies` declaration was suggested. `as const` is not allowed (it is a type assertion).
2. **The shell + memo inner pattern** across the leaves. Is there a shared helper worth extracting, such as a typed field-compare comparator? The Lane's `areArrangementLaneViewPropsEqual` is the first custom comparator. Or is per-leaf code the right cost?
3. **`ArrangementContext.tsx` size and ownership.** Decode/peaks (ARCH-CHECKPOINT-DECODE-REGION) and lane peaks/pins (ARCH-CHECKPOINT-PERF14-LANE-PEAKS) are also open. Is any one extraction now cheaper than the risk it carries for Undo/Redo atomicity and audio timing?

**Constraints:** read-only, no code changes. The public shapes of `useArrangement()` and `useArrangementActions()` stay unchanged. An approved change becomes a separate bounded B task with one owner and behaviour-preserving tests (agent-workflow §არქიტექტურული checkpoint).

**The loop does not wait.** If there is no result by the planning after round 409, B continues with PERF-15 (the next queue item) and records that the checkpoint is still pending.
