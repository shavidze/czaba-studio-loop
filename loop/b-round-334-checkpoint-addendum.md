# Checkpoint addendum to D-29z915 (B, round 334 → 335 planning, 2026-11-04). Non-blocking

This is not a new request. It adds to the open frontend-architect checkpoint (`b-round-324-checkpoint-request.md`, plus the addenda for rounds 326, 327, 328 and 331).

## Status
- Rounds 332, 333 and 334 were published without a recorded answer.
- B applies the recorded default, **keep** (D-29z1007), as was done for ARCH-R207 (D-29z182). It does not wait any longer.
- Round 335 (stage c3-i) is test-only: `perf/` and docs. It touches neither `StudioWorkspace.tsx` nor `ArrangementContext.tsx`.

## New signals since the round-331 addendum
- **ARCH-R334-PEAKPATH-FILE** (gate 334 reviewer). Move `ArrangementPeakPath`, `buildPeakShape` and the props type into `ArrangementPeakPath.tsx`.
  - Keep the `ArrangementPeakPathInner` name.
  - DP43–DP48, WG1–WG10 and WZ1 stay unchanged.
  - Do this after c3–c5.
- **SIG-R334-INLINE-DB-GAIN** and **SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY** (gate 334 findings 1–2): small no-behaviour cleanups.
- **The c3 premise** (`b-round-334/cross-head-1440-summary.txt`):
  - A cross-lane move re-renders `ArrangementProvider` on every move: 87 components per move, against 19 on the same lane. Two provider hooks change on each move.
  - Stage c3-ii will move `clipLaneDrag` (provider `useState`) into a per-provider store, as PERF-8a/8b did.
  - That edits `ArrangementContext.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx` and the `StudioWorkspace.tsx` hint reader, the same region the round-331 addendum flagged.

## Question (≤ 3 sentences)
1. Should c3-ii follow the PERF-8a store pattern inside `ArrangementContext.tsx`? The alternative is to first move the preview readers and the equality hook into one module (`ArrangementPreviewReaders.tsx`).
2. Should ARCH-R334-PEAKPATH-FILE and that extraction be one no-behaviour round after c5, or two?

Without an answer by the c3-ii planning, B keeps the default: c3-ii in place, and the extraction as its own round after c5.
