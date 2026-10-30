I've finished the diff and the playback re-plan path, and I'm writing up the verdict now.

COMMIT: OK

## Code Review: SABA-B-7 envelope dB taper (round 269)

I read the diff, the full `envelope.ts`, `scheduleClipEnvelopeGain` in `graph.client.ts`, the gesture code in `ArrangementClipEnvelope.tsx` and the playback re-plan path in `ArrangementContext.tsx`. I also read the implementation doc, `architecture-checkpoint.md`, `SECURITY_AUDIT.md` and `ERROR_TAXONOMY.md`. `verify.log` passes: 218 test files and 3230 tests, Biome clean, build OK. This is a review of the diff only, not of the whole module.

### Critical Issues
- None. The diff doesn't touch auth, purchase or download code. It adds no listeners, timers or effects, adds no `any`, no type assertions and no suppression directives, and changes no styling.

### Suggestions (ranked)
1. **Too many ramp events on very short segments.** `app/lib/arrangement/envelope.ts:170-174`: the step count depends only on the dB span, not on how long the segment lasts. Two points 1 ms apart (`CLIP_ENVELOPE_MIN_GAP_SECONDS`) going from 0 dB to −∞ produce 120 `linearRampToValueAtTime` events within about 48 samples. The sound is correct, but it wastes AudioParam timeline entries on every replay and every loop `appendPlan`.
   - **Fix:** cap the count with something like `Math.min(count, Math.max(1, Math.ceil((to - from) / MIN_STEP_SECONDS)))`, using a step of roughly 1 ms. Tests DB4 and EV5 would need a short-segment case.
2. **Each step re-searches the whole envelope.** `envelope.ts:173` calls `clipEnvelopeGainAtSource(points, time)` for every step. That function searches all the points each time, so the cost is points × steps for each clip on every `startGraph`. `startGraph` runs on play, seek and commit. It does not run on each pointermove: `previewArrangement` (`ArrangementContext.tsx:1715`) doesn't call `syncPlayback`.
   - **Fix:** the step's segment is already known, so call `interpolateEnvelopeGain(fromGain, toGain, step / count)` there. Check that DB4's `fromMiddle` still lines up with the line value.
3. **A small vertical wobble can still rewrite an old gain below −60 dB.** `app/components/arrangement/ArrangementClipEnvelope.tsx:269-271`: old gains are only kept when `depthDelta === 0` exactly. A mostly horizontal drag that drifts 1 px vertically turns a stored 0.0005 (−66 dB) into about −59 dB. The doc says no such points exist in `/studio-lab`, so this is low priority.
   - **Fix (optional):** treat a vertical move under `ENVELOPE_DRAG_THRESHOLD_PX` as zero once the gesture has started.
4. **Lookup and audio disagree on one segment type.** `envelope.ts:92-97` and `envelope.ts:111-112`: between an old gain below −60 dB and 0, both ends sit at the bottom of the scale. The lookup therefore returns 0 inside the segment, while the scheduler plays a single linear ramp. A point added there gets 0 even though the audio plays at about −66 dB. This is documented as an accepted limitation in implementation doc 200; it is only flagged here so it gets a backlog line.

### What I checked in the browser-only areas
- **Event order:** `setValueAtTime` comes first, then the steps in strictly increasing time. The last step lands on `lastSource`, which gives the same time as the old final ramp at `item.when + item.duration`, so the order is the same as before.
- **Leaks and timers:** none added. The node lifecycle and disconnect at `graph.client.ts:298` and `:344` are unchanged.
- **Render cost:** the polyline still uses one vertex per point. Because the interpolation is linear in dB and the vertical scale is linear in dB, the straight segments match what plays (apart from item 4). No per-frame work was added.
- **Accessibility, Tailwind and tokens:** only the inline `top` value changed. It was already an inline style and is computed at runtime, so that's acceptable.
- **Undo:** one entry per drag is preserved (tests EUDB2 and EUDB3).

### Good Practices Found
- A single scale source: depth uses `TRACK_VOLUME_DB_MIN`, and test DB3 proves it matches `trackVolumeFromDb`.
- Stored data is unchanged and needs no migration. A horizontal-only drag keeps the stored gain byte for byte.
- Step tests check the unrounded calls and use literal step counts, so they can catch a broken helper. The accepted limitations are written down honestly in the doc.

### Architecture note
- Keep the current structure. `envelope.ts` (lines 75-177) now covers the gain↔dB scale, the interpolation and the scheduler step plan. That's one responsibility (how the envelope maps to sound), there's no new state or lifecycle, and the coupling stays one-way (graph → envelope). Extracting anything would gain nothing and risk changing audio timing.
- **Proposal for the planner (one bounded task, not a fix for this round):** "Envelope ramp density": add the time-based cap from item 1 and the segment-local interpolation from item 2. Owner: `envelope.ts`. Acceptance: DB4 still passes, plus a new case where a 1 ms segment produces no more than N events.

### Alternative Approach (critical logic: Studio audio pipeline)
- **Current:** break each segment into linear ramps of at most 0.5 dB and land exactly on every point.
- **Alternatives:**
  - `setValueCurveAtTime`: the user (Saba) rejected it, and it can't overlap other events on the same AudioParam.
  - Exponential ramp: cheaper, but it can't reach 0, so it would need a special case for the last segment into silence.
- **Verdict:** keep the current approach. It's the only one of the three that is exact at the points, reaches true silence and shares one code path between playback and export. Its only cost is the number of events, which items 1 and 2 bound.

### Score: 8.5/10