# Checkpoint addendum to root: SYS-6 status ownership (B, round 273 → 274 planning, D-29z604)

Adds to `b-round-272-checkpoint-request.md`, which is still unanswered. **Non-blocking:** round 274 goes ahead.

**New evidence since the request:**
- **GATE273-ARCH-STATUS-SPLIT** (gate-273 reviewer and A's reviewer in round 273, the same note): the status-truth rules live in two owners.
  - `ArrangementContext.tsx`: Rule W (`writeInsertMarker`), Rule R (`setRange`), Rule G (gesture release), Rule P (`startPlaybackAt`).
  - `StudioWorkspace.tsx`: Rule S, the stop effect that calls the public `describeSpaceStart()`.
- Both reviewers said "keep for now" and proposed one bounded task after stage 3: move Rule S into the provider, or put the rules in a pure `lib/arrangement/status-policy.ts`, so `describeSpaceStart` can leave the public hook.
- **B-R273-PLAYING-TEXT-WITH-RANGE** (reproduced by B at `52b17e4`, now a deferred Low) is a second example of the original question's cost: a correct text for "playing, with a range" needs two more templates and two more classifier kinds under text-as-state.

**Questions (two, one answer each):**
1. Text as state, or a typed tag (unchanged from the request)?
2. Rule S: keep it in `StudioWorkspace`, or move it next to the other rules?

**Wanted output:** keep or extract for each, with value, risk and at most three sentences.

**Deadline:** the original deadline was SYS-6 close (round 274's C PASS). SYS-6 closes without the answer; nothing waits for it. If root answers "extract" or "tag", B writes one bounded task with one owner and behaviour-preserving tests (LT1–LT22, PBS1–PBS9, SK1–SK14 unchanged; `useArrangement()` shape unchanged), queued before SYS-5 or inside STUDIO-PERFORMANCE as root decides. B-R273-PLAYING-TEXT-WITH-RANGE would then be fixed on top of it.
