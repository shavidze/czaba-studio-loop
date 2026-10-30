I checked every path in the commit and every derived string against the source; the verdict is below.

COMMIT: OK

The commit only touches `perf/**` and one implementation doc. Nothing in `app/**` changes, and nothing touches auth, purchase, download, the cart or protected files. There's no runtime, rendering, Tailwind or accessibility surface in this diff, so those focus areas don't apply.

## Code Review: perf harness strings drift (round 261)

### Critical Issues
- None.

### What I checked against the source
- **Derived strings match the old literals.** Every value now built from `app/lib/arrangement/strings.ts` comes out identical to the literal it replaced:
  - `wavDone(sentinel,'')` gives the prefix `"WAV created: "`, the marker `"WAV created:"`, the text pattern `^WAV created:` and the length pattern `WAV created: (\d+):(\d+\.\d+)` (strings.ts:89–90).
  - `moveTitle` gives ` — drag to move$` (strings.ts:693).
  - `volumeLabel` gives `^Volume — .+ \(group\)$` (strings.ts:740).
  - The plain labels `Play`, `Export WAV`, `Done`, `Zoom (px/s)`, `Trim — left edge`, `Add`, the range body title and the active-track builder all match strings.ts.
- **Browser-side code is safe.** The `waitForFunction` and `evaluate` callbacks get the label as an argument (`perfLibraryAddLabel`, `perfWavDoneMarker`), not through a closure. That's correct, because the callback is serialized and runs in the browser.
- **The import chain is safe.** `strings.ts` only imports `./shortcuts`, which imports nothing. So the relative import doesn't need the `~` alias in the Playwright loader.
- **The regexes are stateless.** None uses the `/g` flag, so reusing `wavDonePattern.exec` keeps no state between calls.
- **The typecheck gate covers perf.** `tsconfig.json:19` includes `**/*.ts`, so renaming a key in strings.ts now fails `npm run typecheck` inside `perf/`.
- **The six inline-label needles exist today:** ArrangementDetailPanel.tsx:429, ArrangementLane.tsx:797 and 832, ArrangementMaster.tsx:208, ArrangementTransport.tsx:153 and 397.
- **Verify passed:** 216 test files and 3162 tests passed (verify.log:2098–2099).

### Suggestions (ranked, none blocking)
1. **`perf/lib/app-labels.ts:50-87`**: nothing reads `sourceFile` or `sourceNeedle`. The data looks like a drift guard but doesn't act as one; the doc admits this in limitation 2. **Fix:** in a later round, add a small Node test that reads each `sourceFile` and checks it contains its `sourceNeedle`. That turns class (b) into a gated check without touching `app/**`.
2. **`perf/lib/app-labels.ts:80`**: the needle `'          Export'` depends on leading whitespace, so a reformat or re-indent would break it silently. **Fix:** if the test from item 1 is added, match a trimmed line or a JSX-aware pattern instead. Better still, move the label into `studioTransportStrings` (see the Architecture note).
3. **`perf/lib/app-labels.ts:97-101`**: `perfFixtureTracks` isn't declared `as const`. **Fix:** add `as const`, or `satisfies Record<string, string>` to match line 87.
4. **`perf/studio-lab.perf.spec.ts:274` and `perf/studio-lab-resources.perf.spec.ts:128`**: `membersSourceTitle` and `wavDonePattern` are now just aliases of the imports. **Fix:** use the imported names directly. This is cosmetic.
5. **Doc limitation 1 (a key still exists but its value isn't rendered any more) is real.** Only `npm run test:perf` catches it, and that isn't a gate row. A planner should decide whether it becomes a smoke gate.

### Good Practices Found
- `splitAtSentinel` throws when a template contains the placeholder zero times or more than once. That fails loudly when the module loads, instead of quietly producing a regex that never matches.
- `escapeRegExp` is applied to every fragment taken from a template.
- Step descriptions and error messages are rebuilt from the same source, so their text stays identical.
- TypeScript stays strict: no `any`, no suppressions, no `as` casts, and `satisfies` is used for the allowlist.
- The doc's limitations section is honest.

### Architecture note
- **Signal 2 (ownership/coupling):** `perf/lib/app-labels.ts:1-9` makes the `perf/` harness depend on `app/lib/arrangement/strings.ts` at compile time. The dependency runs one way only. **Keep:** this coupling is the point of the change, and it sits in one adapter file. The only risk is the future `~` import the doc mentions (limitation 4).
- **Proposal for the planner (SIG-R261-INLINE-LABELS):** a small task to move the six inline labels (`Clip Gain — fader`, `Volume — ${…}`, `Pan — ${…}`, `Master Volume`, `Export`, `Undo`) into strings.ts.
  - **Ownership:** `ArrangementDetailPanel`, `ArrangementLane`, `ArrangementMaster` and `ArrangementTransport`, plus `perf/lib/app-labels.ts`.
  - **Acceptance:** rendered text stays identical; existing unit and e2e selectors pass unchanged; `perfInlineLabels` is deleted.
  - **Tests:** the existing Transport/Master/Lane tests, plus a mutant check that renaming a key breaks the typecheck.
  - **Until then:** consider suggestion 1 as a cheaper stop-gap.
  - **Invariants:** no audio, refs or Undo/Redo behaviour changes. This is a proposal, not approved scope.

### Alternative Approach
- **Current:** a perf-side adapter imports the typed keys, and the inline labels sit in a data allowlist that nothing checks.
- **Alternative:** move every label into strings.ts first, so perf has nothing hard-coded.
- **Verdict:** the current approach is right for this round, because `app/**` wasn't granted. The alternative is cleaner and should be the follow-up. Neither touches critical business logic.

### Score: 9/10