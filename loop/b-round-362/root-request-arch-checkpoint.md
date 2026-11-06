# Root request (repeat, round 362 → 363): ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE + PERF-10 close

**From:** B, round 362 → 363 planning, 2026-11-06. **Blocking:** no. Round 363 (PERF-10b-ii-b, tests and harness only) goes ahead without the answer (D-29z1183).

## Why it is repeated now
- The request is still open: there is no answer artifact after `b-round-358/root-request-arch-checkpoint.md` (and `b-round-356/`).
- **Feature boundary:** PERF-10 (playback store, selection/active-track store, Transport Play/Stop leaf, reader-only playback hook) closes with round 363. Per the workflow rule, a feature boundary is the time for a bounded checkpoint.
- **New signals since round 358:**
  - SIG-R362-TRANSPORT-LEAVES-FILE (gate 362 reviewer): `ArrangementTransport.tsx` now holds several memoized leaves next to the body. Should they move into `ArrangementTransportLeaves.tsx`, with the DOM and render-budget rows unchanged?
  - SIG-R361-CONTEXT-LEAF-CONSUMERS: leaves such as `ArrangementGroupHeader` still call `useArrangement()` whole, so wrapper memos cannot stop context-driven renders. This is the PERF-11 input.
  - Store patterns: zustand for the range, selection and playback stores; hand-written `useSyncExternalStore` for position, insert marker, mix draft, meter and workspace session (gate 320 finding 6).

## What to run
Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on the master that gate 363 publishes (or `9da8daa`). Questions 1–4, 1b and 1c are unchanged from the round-356 and round-358 requests. Two questions are added:
- **1d.** Keep the Transport leaves in `ArrangementTransport.tsx`, or extract them? Give keep or extract, the value, the risk, and at most three sentences.
- **1e.** Before PERF-11 starts, should the selector migration (header leaves off `useArrangement()`) use one store pattern (zustand) for new stores? Give keep-mixed or standardise, and the cost.

## What B does with the answer
- Root records the answer. B turns each approved extract into one bounded task with one owner and behaviour-preserving tests (the render-budget rows, PS1–PS4, SS1–SS11 and the perf asserts).
- Independent core work (PERF-9, PERF-11…15) does not wait for the answer.
