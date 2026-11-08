COMMIT: OK

The candidate is test-only: three jsdom suites now use one new helper, plus a Georgian implementation doc. I touched no runtime, auth, purchase or download code. My checks were reading the diff, the helper and the doc, and grepping the three suites. I did not run the tests; I relied on C's PASS and `verify.log`.

## Code Review: fake-web-audio.ts + 3 migrated suites

### Critical Issues
- None.

### Suggestions (ranked, all Low)
1. **`fake-web-audio.ts:162-168` (`stubSetInterval` guard).**
   - The `Object.is` guard only fires when `stubSetInterval: true` is passed. If the flag is dropped from `install({...})` at `schedule-failure-ui.test.tsx:302-308`, SF11 stays green with no signal.
   - The doc admits this (mutant `GUARD-AND-STUB-REMOVED`).
   - Fix, in a later round: add a one-line SF11 assertion that `window.setInterval` is the stub, for example `expect(window.setInterval(() => undefined, 1)).toBe(0)`. Do not fix it now, because the `it()` bodies are meant to stay byte-identical.
2. **`fake-web-audio.ts:12-197`, leak risk.** The factory is called at module scope in each suite. The state is shared across tests in that file and reset only by `install()`, so a test that forgets `install()` would inherit stale state. All three suites call it in `beforeEach` and `unstubAllGlobals` in `afterEach`, so this is fine today.
3. **`fake-web-audio.ts:139-147`, timer-leak check.**
   - `vi.stubGlobal('setInterval', ...)` is undone by `vi.unstubAllGlobals()`. That call is present at `schedule-failure-ui.test.tsx:128` and `:314`.
   - `window.addEventListener('error')` is removed in the suites' own `afterEach`, which I did not change.
   - `cancelAnimationFrame` is a no-op, as it was before, so captured frames are not dropped on cancel. Behavior is unchanged from HEAD.
4. **`fake-web-audio.ts:182-196`, API surface.** The helper returns classes and state that no suite reads: `FakeAudioContext`, `MeteredAudioContext`, `FakeOfflineAudioContext`, `FakeAudioBuffer`, `FakeResizeObserver`, `fakeClock`. The doc says this is intentional, to ease a future `createWorkspaceTestEnvironment` delegation. Dead surface is cheap, but drop it if that delegation is never scheduled.

### Behavior preserved
- **Event ordering and clock.**
  - rAF is `() => 1` or captured, as in HEAD.
  - The clock lead is 5 for SF and 0 for HT and EV, as in HEAD.
  - Metering is opt-in, so EV stays unmetered.
  - The extra `setValueAtTime` and `linearRampToValueAtTime` no-ops are only reached through `?.()` calls.
- **State reset.** `install()` resets frames, sources, failure counters, meter signal and clock, so nothing leaks between the two SF describes.
- **Source tracking.** HT now records `createdSources` where it didn't before. This is harmless because `install()` clears them each test.
- **Imports.** `act` is still used in all three suites, and `vi` is still imported.
- **Test count.** The doc reports 49 rows across the three suites, the same as HEAD.
- **Accessibility, Tailwind and render cost.** None of these apply to this diff.
- **TypeScript.** I saw no `any`, `@ts-ignore` or type assertions in the diff or the helper. `FakeNode.connect(destination: FakeNode)` is structurally typed.
- **Semicolons and comments.** Semicolons are consistent and there are no code comments.

### Good Practices Found
- The helper builds fresh state on every `createFakeWebAudio()` call, and every behavior flag is off by default.
- Mutant evidence is documented, including the GREEN mutants and why they are green.
- The implementation doc follows the required structure and says plainly where the guard falls short.

### Architecture note
- signal 3 (repeated costly change): `fake-web-audio.ts` and `createWorkspaceTestEnvironment` are now two parallel fake Web Audio implementations. Playback bug rounds 385–388 copied the fake graph repeatedly. **Keep for now.** The helper already reduces the copies from three to one, and the 25-suite environment is out of scope and behavior-pinned.
- Proposal for the planner, only if the other 25 suites need the same fix again: a bounded task to delegate `createWorkspaceTestEnvironment` to `createFakeWebAudio`. Acceptance would be unchanged results across all 25 suites and no change to the signature. This matches the doc's own SIG-R415-WORKSPACE-ENV-CONVERGENCE.
- This note covers the diff only. It is not a full audit of the module.

### Alternative Approach
Not critical logic: this is test infrastructure only.

### Score: 9/10