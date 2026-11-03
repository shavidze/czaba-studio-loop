COMMIT: OK (stage a only. `replaceClips` and `diffClipSchedule` have no callers in app code, so playback behaviour doesn't change. Nothing in auth, purchase or download is touched. C round 307 passed and `verify.log` passed.)

## Code Review: round-307 — `reschedule.ts`, `graph.client.ts` (+ tests, doc 224)

### Critical Issues
- None for this commit.

### Findings, ranked (none block this commit)

1. **`stop(when)` can move a stop set by `replaceClips` later** — `app/lib/arrangement/graph.client.ts:323` (the metronome click loop has the same check at `:337`).
   - **Cause:** `stop()` skips a source only when `state.stopAt <= ctx.currentTime`. Say `replaceClips` sets `stopAt = startAt₁`, still in the future. A full rebuild then runs within the same short scheduling window and calls `previous.stop(startAt₂)` with `startAt₂ > startAt₁` (`ArrangementContext.tsx:1090-1093`).
   - **Effect:** the source gets a second `stop()` call. In Web Audio the last `stop()` call wins, so the old source keeps playing past its splice point. It overlaps its replacement and plays doubled for `startAt₂ − startAt₁`.
   - **Why tests miss it:** RC10 only covers `replaceClips` followed by `replaceClips`. The fake source just records `stops` and doesn't apply "last call wins".
   - **Reach:** this path has no caller today, so it can't happen yet. It is the only hazard this diff adds to existing code.
   - **Fix:** skip when `state.stopAt !== null && state.stopAt <= (when ?? ctx.currentTime)`, so a stop can never move later. Do the same in the click loop. Add an RC12 test: `replaceClips(…, startAt=3)` then `handle.stop(3.5)`, and expect `oldB.stops` to stay `[3]`. Land this before stage b at the latest; it's cheap enough to do now.

2. **Prune depends on `ended` firing for sources stopped before they start** — `graph.client.ts:421-430` together with `:440-442` (the RC3/RC10 path). Prune only removes states marked `ended`. If a browser doesn't fire `onended` for a source stopped before its start time, a state piles up on every edit. Doc 224 already lists this as trap (ბ). It needs real Chrome and Firefox evidence before stage b connects `syncPlayback`. Fix if needed: in `replaceClips`, mark `ended` (or drop the state) when it was stopped before its start time.

3. **The splice depends on `stop` and `start` being issued together** — `graph.client.ts:442` and `:465`. A seamless splice needs `stop(startAt)` and the new `start(startAt + when − from)` to reach the audio thread in the same batch, before the 128-sample block that contains `startAt`. A full rebuild has the same exposure, so this isn't a regression. For stage b: keep the scheduling lead at least a few blocks, and include the case of editing the clip that is currently playing (the RC2 case) in the planned continuity probe. Right now that probe only covers editing a silent clip while another one plays. A fade or envelope change on a playing clip is also an instant gain step at `startAt`, which can click. Worth one probe row.

4. **The `gainDb` exclusion rule is written twice** — `reschedule.ts:9` and `ArrangementContext.tsx:633-636` (`scheduleKey`). Doc trap (გ). In stage b, one should import the other so the two can't drift apart.

5. **Asymmetric `ReplaceClipShapes` semantics** — `graph.client.ts:447-464`. A missing gain keeps the old value, but a missing fade or envelope deletes it. This is correct given that mix sync goes through `setClipGain`, and doc 224 describes it, but the interface doesn't say it. Suggestion: one JSDoc-free fix is to make `clipFades` and `clipEnvelopes` required in `ReplaceClipShapes`, so stage b has to pass them on purpose.

### Suggestions
- `items.filter((item) => ids.has(item.clipId))` at `:466` repeats the filtering in `planChangedClips`. It's a harmless guard; keep it.
- `diffClipSchedule` compares clips with `JSON.stringify`, which depends on key order. A clip rebuilt with keys in a different order shows up as changed, which only costs an extra replace. It never misses a real change, and it matches `scheduleKey`. Acceptable.

### Not applicable to this diff
- **Accessibility, Tailwind/tokens, render cost:** no UI, components or React code changed.
- **Listener/timer leaks:** no new listeners or timers. `onended` is set per source the same way as before. See finding 2 for the one gap.
- **TS strict:** no `any`, `@ts-ignore` or `as` assertions. `Parameters<typeof planChangedClips>[0]` and the `instanceof` narrowing in the tests are the right pattern. Semicolons are present.
- **Security:** nothing touched by this diff falls under `SECURITY_AUDIT.md`. No error codes are involved, so `ERROR_TAXONOMY.md` doesn't apply.

### Good Practices Found
- Copying `options.clipFades` and `options.clipEnvelopes` into handle-owned maps stops a replaced clip from bringing back an old fade, including through the `appendPlan` loop refill (RC9).
- Stops only ever move earlier (`stopAt <= startAt` skip). RC10 tests both orderings.
- `diffClipSchedule` falls back to a full rebuild whenever the loop, the track id order or the set of clip ids changes. That's stricter than `scheduleKey`, which ignores tracks.
- The tests check behaviour against real automation timing: offset continuity to 1e-9, and automation compared against a fresh `applySchedule`. Mutants are documented.
- Splitting the work into a stage a (no runtime change) and a stage b (measure first) is the right risk control.

### Architecture note
- **Signal 3 (the same costly region keeps changing):** `app/lib/arrangement/__tests__/graph.test.ts` (new `AutomationParam`, `AutomationGain`, `AutomationContext`). The shared `FakeParam` only records `setTargetAtTime`. So each graph feature (fades, then envelopes, clip gain, and now replace) needs its own fake subclasses before automation can be compared. The mock cost keeps growing in one place.
  - **Keep `applySchedule` as it is:** one owner and one lifecycle, the public `ScheduleHandle` only gained a method, audio timing is unchanged, and the existing tests are unchanged.
  - **Proposal for the planner (one bounded task, proposal only):** move the recording fakes (`setValueAtTime` / `linearRampToValueAtTime` capture) into a shared test helper under `app/lib/arrangement/__tests__/`. Done when every existing graph, RC, fade and envelope test passes without changes to what it asserts. Ownership: test files only, no production code.
  - Don't split the clip chain out of `applySchedule`. The change adds code without mixing concerns, so a split isn't justified.

### Alternative Approach (critical logic: Studio audio pipeline)
- **Current:** at `startAt`, hard-stop the replaced sources and start new ones with the same source offset. Fade, envelope and gain targets are updated per clip.
- **Alternative:** a short crossfade (about 5-10 ms). Ramp the old source's `clipGain` to 0 while the new one ramps up, then stop the old one at `startAt + xfade`.
- **Verdict:** keep the current approach for stage a. With matching offsets and gain, a hard splice is lossless and fully testable. A crossfade adds automation on a gain node that `setClipGain` also drives, so the two would conflict, and a crossfade of identical audio causes a small comb-filter dip. Revisit only if the stage b continuity probe hears clicks when a fade or envelope changes on a playing clip.

### Score: 8.5/10