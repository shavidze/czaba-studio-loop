# B → root: bounded frontend-architect checkpoint at the T12 V1 boundary (2026-10-24)

**Status:** requested; does not block anything. The regression round 122 and ABLETON-EXPERT-REVIEW (no code) do not wait for it.

**Why now:** the workflow asks for a checkpoint at each feature boundary, and T12 V1 is complete as of gate 121 (`425a807`). The earlier requests are still unanswered:
- ARCH-CHECKPOINT-SRW14-PREFS (b-round-48 onward);
- ARCH-CHECKPOINT-SRW16 (`b-round-78-checkpoint-request.md`);
- ARCH-CHECKPOINT-SRW20 / PHASE1-BOUNDARY (`b-round-91-checkpoint-request.md`, addenda up to (ad)).

Integrity-checker PASS is not evidence that an audit took place.

**Method:** `store/.claude/references/architecture-checkpoint.md`, using the read-only `frontend-architect`.
- For each question: keep or extract, the value, the risk, and at most three sentences.
- "Not worth it now" is a valid answer.

## Questions (at most four; pick these if the full addenda list is too long)
1. **View preferences (ARCH-R121-LANE-VIEW-OPTIONS + SRW14-PREFS (a)).** `StudioWorkspace` now threads five view-preference props (`folded`, `snapSeconds`, `gridSeconds`, `envelopeMode`, `waveformZoom`) through `ArrangementLane` into the memoised `ArrangementClipView`.
   - Options: keep the props as they are, or use one memoised `LaneViewOptions` object / a workspace view-preferences hook.
   - Acceptance if extracted:
     - 1× drawings stay byte-identical;
     - the Undo/Redo and `useArrangement()` shape do not change;
     - the existing grid/env/zoom tests stay unchanged;
     - plus a render-count test.
2. **Fader mapping (ARCH-R117-HOOK-SLIDER-MAPPING / addendum (ac)).** The stored ↔ slider mapping and the gesture start capture now exist twice (lane and group).
   - Options: keep both, or give `useRelativeFaderDrag` an optional mapping.
3. **Peak geometry (ARCH-R120-PEAKSHAPE-TO-PEAKS / addendum (ad)).** `buildPeakShape` and `PeakShape` are exported from a component file and imported by the detail panel.
   - Options: keep them there, or move them to `lib/arrangement/peaks.ts`.
4. **Export orchestration (SRW20 q14).** The longest-standing question.
   - Options: keep the export orchestration in `ArrangementContext`, or extract it to a hook or module.

## What B does with the answer
- An approved extraction becomes its own B task:
  - one owner;
  - tests that preserve behaviour;
  - no new behaviour.
- B schedules it after the review rounds, unless root orders otherwise. VISUAL-A does not depend on it.
- B does not schedule any refactor without root's recorded result.
