COMMIT: OK. Nothing blocks this commit. It only touches the perf harness (`perf/**`) and docs: no app code, no auth, purchase or download code, and no CSS or tokens.

## Code Review: perf harness playing signal (round 259, C-R258-01)

### Critical Issues
- None.

### What I checked
- **Play button lookup.** `ArrangementTransport.tsx:244` sets the button's name to `'Play'` all the time (`strings.ts:223`), and line 248 sets `data-playing` to `'true'` or `'false'`. Stop is a separate button named `Stop` (line 268). No other part of `app/` (outside tests) uses the name `Play`, so `getByRole('button', { name: 'Play', exact: true })` (`perf/lib/page.ts:63`) finds exactly one button. The button also has `aria-describedby` and `title`, but the name comes from `aria-label`, so they don't change it.
- **Playback check is not weaker than before.** `isPlaying` (`page.ts:68-70`) still needs both `data-playing === 'true'` and a running AudioContext. `harness.audio-running` still separately requires at least one `start()`. The attribute alone can't make the check pass.
- **Clip-body title.** `studio-lab-interactions.perf.spec.ts:110` now matches `strings.ts:694` (`rangeBodyTitle`) exactly.
- **Leftover old labels.** Searching `perf/` for `Pause`, `click = playhead` and `aria-label` finds nothing. `studio-lab.perf.spec.ts` and `studio-lab-resources` only use the updated shared helpers.
- **Budgets.** Only the `note` text changed in `budgets.json` and `budgets.interactions.json`. Every id, mode, budget value and determinism setting is the same.
- **Verify log.** 216 test files and 3162 tests passed, and the agent-references check passed. `test:perf` is not part of the gate. The only evidence it now passes is A's own run as written in doc 194:59 (rc 0, 3/3 specs).

### Suggestions (ranked)
1. **Low: `perf/lib/page.ts:63` and `perf/studio-lab-interactions.perf.spec.ts:110`.** The harness copies UI text by hand again, and that is exactly how this bug happened. Fix: import `studioPlaybackStrings.playLabel` and `rangeBodyTitle` from `app/lib/arrangement/strings.ts`, or for the button use `locator('[data-playing]')`. Doc 194 already plans this as PERF-HARNESS-STRINGS-DRIFT, so it's not needed this round.
2. **Low: no automatic check.** The gate doesn't run `test:perf`, so a future rename in `app/` will break the harness silently again. The new rule (D-29z512: search `perf/**` too) depends on people remembering it. A short `test:perf` smoke in the gate, or a unit test that checks the harness strings against `strings.ts`, would catch it. Proposal only.
3. **Info: Biome doesn't check `perf/**`.** Doc 194:54 says the files are formatted, and the four changed lines follow the semicolon and quote rules.

### Not affected by this diff
- Real-browser event order, listener or timer leaks, render cost, accessibility, Tailwind: the diff changes no app code. `toHaveAttribute` keeps the 15 s timeout, so waiting behaves as before.
- TS strict: no `any`, `as` or `@ts-ignore`, and `getAttribute` returning `string | null` is compared with `===`.
- Security and error taxonomy (`SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`): nothing applies, since there's no token, input, API or error-code handling.

### Good Practices Found
- The playback check still requires the AudioContext to be running, not just the UI attribute.
- `exact: true` is used for both locators.
- Docs 163 and 168 say from which round the signal changed, and doc 194 explains the cause and lists the alternatives.

### Architecture note
- Signal 3 (the same region keeps needing changes): `perf/lib/page.ts:62-99` and `perf/studio-lab-interactions.perf.spec.ts:107-110`. App renames in rounds 252–253 and 256 forced harness fixes later in round 259. This is coupling to UI text that is copied, not imported.
  - **Keep for now:** the fix is 4 lines, the shared helpers already keep changes in one place, and none of the invariants are touched (audio timing, refs, gesture lifecycle, Undo/Redo).
  - **Proposal for the planner (RETRO 260, PERF-HARNESS-STRINGS-DRIFT):** the harness imports its labels and titles from `app/lib/arrangement/strings.ts`, and the round gate gets a short `test:perf` smoke. Done means: no UI text copied by hand in `perf/**`, and `npm run typecheck` still covers `perf/`. Test: rename a test label and check that typecheck or the smoke fails.

### Alternative Approach
- **Current:** the playing state is read from `data-playing` and the label is matched as a string.
- **Alternative:** find the button by `[data-playing]` and import the label from `strings.ts`.
- **Verdict:** the current fix is fine for this round, because it is small, correct and keeps the AudioContext check. The alternative removes this kind of drift and belongs in the planned RETRO 260 task.

### Score: 9/10