# Checkpoint addendum to D-29z915 (B, round 331 → 332 planning, 2026-11-04). Non-blocking, but now an explicit nudge

This adds signals to the open frontend-architect checkpoint request (`b-round-324-checkpoint-request.md`; earlier addenda for rounds 326, 327 and 328). It is not a new request. It blocks neither round 332 (stage c2b-i) nor the REGRESSION round. As of this planning the checkpoint has no recorded answer.

## Why B asks root to run it now (accumulated risk on one owner)
- Gate 331's reviewer flagged signal 3: `StudioWorkspace.tsx` l.637–864 (the preview-reader wrappers: readout, detail wrapper, overview wrapper, and now `useEqualityStableSelector`) was edited in rounds 328, 329, 330 and 331. Round 332 (c2b-i) is the 5th consecutive edit of that region (the overview wrapper selector). The owner is 3472 lines.
- This is the "accumulated risk on one owner" trigger in the workflow's architecture-checkpoint rule. B therefore asks root to run the bounded frontend-architect checkpoint **after round 332 publishes and before stage c3** (cross-lane ghosts, which moves `clipLaneDrag` into a store and touches the same region again).

## Signals for the checkpoint (D-29z979)
- **ARCH-R331-PREVIEW-READERS** (gate 331 reviewer): after c2b, one bounded no-behaviour task moves `useEqualityStableSelector` and the three `*WithPreview` / `*WithSelection` wrappers into `app/components/arrangement/ArrangementPreviewReaders.tsx`. Must stay: the `useArrangement()` shape, the gesture lifecycle, DP1–DP32 and PS-* unchanged, identical render counts. Estimated cost: low.
- **ARCH-R331-PREVIEW-ISEQUAL** (A round 331 code-reviewer): add an optional `isEqual` to `useArrangementPreview(selector, isEqual?)` in `ArrangementContext.tsx` and move the lane hook onto the same path. Acceptance: DP1, DP25–DP32 and PS-* green; `useArrangement()` shape unchanged.
- **ARCH-R330-LANE-MEMO-WIDTH** (gate 330, still open): memo `ArrangementLane` and let lanes read the timeline width from a store.
- Tech-lead (round 332 consult) advised: keep the hook in `StudioWorkspace.tsx` while all callers are in that file; do not extract inside a behaviour round; do the extraction as its own round once D-29z915 is answered, so the overview reader is not moved twice.

## Question (≤ 3 sentences)
Keep or extract: should the preview readers and the equality hook move to one module (`ArrangementPreviewReaders.tsx`, or a hook in `ArrangementContext.tsx` with `isEqual`) before stage c3, and should lane and overview geometry (timeline width, extent) come from a store? Give value, risk and the order relative to c3.
