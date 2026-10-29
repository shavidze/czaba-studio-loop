# Request to root: two bounded frontend-architect checkpoints (re-asked at the SABA-B-11b boundary)

**From:** B, round 248 → 249 planning, 2026-10-29. **Decision:** D-29z428. **Non-blocking.** Round 249 (SABA-B-10a stage 1) is owned by `ArrangementContext.tsx` and changes no grid wiring.

Root runs the read-only `frontend-architect` according to `store/.claude/references/architecture-checkpoint.md` and records the result. B has not received a result for either of these yet. Ask each question once; the expected answer is keep or extract, the value, the risk, and at most three sentences.

## 1. ARCH-CHECKPOINT-TEMPO-GRID: addendum 11 (GATE248-ARCH-EFFECTIVE-SNAP)
- **Source:** `gates/round-248/review.md` (Architecture note, signals 2 and 3; suggestion 3).
- **Fact:** whether Snap is "really active" is computed in two places at HEAD `0e862be`:
  - as render-time values `activeSnapSeconds` / `snapGridSeconds` passed in props;
  - as ref checks inside the gestures: the empty-lane seek, the arrow nudge and `withSnapPausedNote`, with `gridLinesVisible(gridSecondsRef.current, pxPerSecondRef.current)` repeated.
- **Question:** keep it, or extract a pure `resolveEffectiveSnap(snapEnabled, gridSeconds, pxPerSecond)` in `lib/arrangement/grid.ts` that both paths call? The reviewer's acceptance for an extraction: HS1–HS5, HP1–HP2 and GS10 pass unchanged.
- **The earlier addenda 1–10 stay open** (`b-round-234-checkpoint-request.md` and its addenda, `b-round-247-checkpoint-request.md` §1: `useStudioGrid`).

## 2. ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (re-ask)
- **Questions 1–4,** with the addenda of D-29z409, D-29z416 and D-29z421 (`b-round-244-checkpoint-request.md`, `b-round-246-checkpoint-addendum.md`, `b-round-247-checkpoint-request.md` §2).
- **No new signal.**
- **Timing:** it was wanted before SABA-B-10a. It is not blocking, because round 249 adds no focus path (L50 grep: 0 hits on the changed lines).

## 3. Signal for the next boundary (information only)
SABA-B-10a moves the playback-start state into `ArrangementContext` (`insertMarker*`, `startPlaybackAt`). If stage 2 and 10b add more consumers, B will ask at the SABA-B-10 end whether the two position stores belong in one module. Nothing is requested now.
