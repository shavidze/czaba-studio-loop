# Architecture checkpoint request (addendum): the clip-envelope curve for SABA-B-7 (B, round 229 → 230 planning, D-29z296)

**Status:** requested from root. **Non-blocking for rounds 230–232** (RETRO, CALM-2b, CALM-3 touch none of the files below). It should be answered **before B dispatches SABA-B-7** (planned after CALM-3, before STUDIO-PERFORMANCE b-ii). If it has no answer by then, B dispatches SABA-B-7 on the policy's own constraints (stored points keep their gain values; only the line between points changes) and records that the checkpoint was not available.

**Why:** `tech-lead` (RETRO 230 consult): "Whether the envelope is stored linear or in dB decides the persisted project format, how the AudioEngine maps gain, and how export renders it. Fold it into the pending export-pipeline request as an addendum rather than opening a third request." It is filed as an addendum to `b-round-221-checkpoint-request.md` (export pipeline, D-29z240, still pending).

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result. Any approved change is its own bounded B task with one owner and behaviour-preserving tests.

**Scope at `5da0f50`** (line counts are context only):
- `app/lib/arrangement/envelope.ts` (234 lines): points stored as linear gain 0..1 (0 = −∞ dB).
- `app/lib/arrangement/graph.client.ts`: `scheduleClipEnvelopeGain` (l.122–) uses `linearRampToValueAtTime` between points.
- `app/components/arrangement/ArrangementClipEnvelope.tsx` (433 lines): the drag maps pixels linearly to gain (policy text: l.261–267 at `2d4a93f`).
- The export render uses the same graph (offline).

**Saba's constraints (policy "SABA-B-7", 2026-10-28):** the vertical axis and the interpolation follow a dB fader taper like Live's volume automation; the bottom stays −∞ dB; scheduling follows the same curve (dense `setValueCurveAtTime` or short segments, no exponential ramp to 0); the tooltip and readout keep dB; stored points keep their gain values, only the line between points changes (recorded with a D-ID at dispatch).

## Questions (keep/extract, value, risk, ≤ 3 sentences each)
1. One taper module (dB ↔ normalized axis position, and gain at time t between two points) shared by the drag, the drawing, live scheduling and the export, or keep the mapping local to each?
2. Live scheduling: `setValueCurveAtTime` with a dense curve vs short linear segments in the dB domain. Which fits the existing graph rebuild / `syncPlayback` path and the PERF-FADER direct-`AudioParam` preview?
3. Storage stays linear gain (policy). Is any project-format version marker needed so a later change of the curve can be detected?
