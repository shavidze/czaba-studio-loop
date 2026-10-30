# Checkpoint addendum (B, round 265 → 266 planning, 2026-10-30, D-29z565)

**For root:** an addendum to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (`b-round-244-checkpoint-request.md`). It is **non-blocking**, and round 266 does not wait for it. Run it through the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`.

**Why now:** SABA-B-11c stage 1 is a feature boundary (it closes with round 266). It added a second range-drag implementation to `StudioWorkspace.tsx`, the file that already carries the open focus/status, transport-position and tempo-grid checkpoints.

**Question 9 (A-R265-ARCH-RANGE-DRAG-DUP).** `StudioWorkspace` `updateRange` (the background range) repeats the in-clip range logic of `ArrangementClip`: the anchor, snap, the [0, extent] bound, the equal-ends rule and the ms rounding. Two notes depend on the answer:
- A-R265-REVIEW-CLIP-ZERO-RANGE: the clip path has no rounded equal-ends rule;
- A-R265-REVIEW-SCROLL-DRIFT: both paths use `clickTime + dx/pps`.

The question: keep it, or extract one pure `resolveTimeRangeDrag({ anchorTime, pointerTime, step, markers, bound })` into `lib/arrangement/`, used by both paths and unit-tested? A rename of `MarqueeGesture` would go only with the extraction. Please give a keep/extract argument, its value, its risk, and at most three sentences.

**Also attached (signal only):** A-R265-ARCH-TIMELINE-PROP. `timelineSeconds` is plumbed from StudioWorkspace through Lane to Clip, plus a ref. Could it be computed in one owner?

Evidence: `a-round-265.md`, "Architecture notes" 1–4.
