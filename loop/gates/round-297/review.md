COMMIT: OK. The change is two files: the new test `studio-link-hydrate-ui.test.tsx` and the implementation doc 220. It touches no product code and nothing in auth, purchase or download. `verify.log` shows 228 test files and 3416 tests passing, and the build succeeded. Finding 1 below should be fixed in the next round. It doesn't block this commit.

## Code Review: `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` + `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md`

### Critical Issues
1. **LH3 can never catch a hydration mismatch when the whole file runs** (`studio-link-hydrate-ui.test.tsx:181-188`)
   - **Why:** React only prints one mismatch warning per load. After the first one, a shared flag (`node_modules/react-dom/cjs/react-dom.development.js:9510`) silences all later ones, including the structural ones at `:10471-10516`.
   - **What happens here:** LH1 trips that flag first: the `muted` warning appears at `verify.log:3163`, and no mismatch warning appears under LH3. So LH3 always gets an empty list, even if something really doesn't match. The `filter(... !== 'muted')` and `≤ 1` checks pass without testing anything.
   - **The fix works:** vitest gives each test file a fresh copy of React. NG9 in `studio-narrow-gate-ui.test.tsx` prints its own `muted` warning (`verify.log:2141`), which proves this.
   - **Fix:** move LH3 into its own file, e.g. `studio-link-hydrate-ssr-ui.test.tsx`. Making it the first `it` here also works but depends on test order. Don't use the `muted` warning as a check that warnings are still on: that ties the test to a product bug NG9 already tracks.
   - **Doc:** line 26 of the doc says LH3 passes "hydration warning-ის გარეშე" (without a hydration warning). That isn't proven. Until the file is split, change it to what LH3 actually checks: the server HTML has `aria-selected="true"` and the option has focus after hydration.

### Suggestions
2. **The warning regex works only because of call order** (`:102`, `:181`)
   - `/hydrat/i` also matches "non-hydrated" in React's `useLayoutEffect does nothing on the server` warning (`verify.log:2890`).
   - That warning isn't counted only because `mountServerHtml()` runs before `vi.spyOn(console, 'error')`. Nothing in the test says this order matters.
   - **Fix:** narrow the regex to `/did not match|Expected server HTML|Hydration failed/i`.
3. **A failing test leaves its React root running** (`:112-122`, `:142-146`)
   - `unmount()` runs only if every `expect` before it passes. `afterEach` only clears `innerHTML`.
   - If LH1 fails, its root stays live into LH2, with its matchMedia listeners, effects and promises that never resolve. That's the kind of leak this review looks for.
   - **Fix:** push each unmount function into an array at module level and call them all in `afterEach`.
4. **One doc line is out of date** (`220-…md:30`)
   - The TODO still says "STUDIO-LINK-b (რაუნდი 297)" (round 297), but the status line now says round 297 was the tests.
   - **Fix:** move STUDIO-LINK-b to round 298 or later.
5. **The `muted` mismatch in the product code is still there** (`ArrangementVideoDock.tsx:210`; the server renders `false`, the client `true`). This round didn't introduce it, but it's a real SSR mismatch on `<video>`. Keep it tracked as a separate ticket.

### Good Practices Found
- **TypeScript strict:** no `any`, no `@ts-ignore`, no type assertions. `importOriginal<T>()` and `querySelector<T>` are generics, not casts.
- **LH1 checks its own setup:** it asserts `firstOptionSourceId() !== PREVIEW_SOURCE_ID`. So if the reversed demo collection stops putting the preview out of first place, the test fails instead of passing for the wrong reason.
- **LH4 is deterministic:** `setWide` is wrapped in `act`, so the workspace mount and the focus effect finish before the assertions run.
- **LH4 covers a real-browser order:** hydrate on a narrow window, then widen. The exit link gets focus; no option does.
- **The doc records mutant results honestly,** including the equivalent mutant (f).
- **No Tailwind or token changes. Every global is stubbed and reset** with `vi.unstubAllGlobals` and `vi.restoreAllMocks`.

### Architecture note
- None beyond the signal already recorded in the doc (GATE296-ARCH-ROUTE-DOM-FOCUS: focus the option through the library's `optionRefs` instead of a DOM query in the route). This diff adds no new signal. This covers the diff only, not a full check of the module.

### Alternative Approach (critical-logic hydration check)
- **Current:** spy on `console.error` and filter warning text with a regex.
- **Alternative:** pass `onRecoverableError` to `hydrateRoot`, which catches structural mismatches, and keep the `console.error` check for prop mismatches only.
- **Verdict:** keep the current approach, but run it in its own file. Prop mismatches only go through `console.error`, so `onRecoverableError` alone wouldn't catch them. Moving LH3 to a separate file is the cheapest fix that makes its check real.

### Score: 7/10