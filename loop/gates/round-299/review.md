COMMIT: OK. This round only touches three test files and one implementation doc. No production code changes, and nothing touches auth, purchase or download code. The verify log shows 229 test files and 3416 tests passing, and the build passes.

## Code Review: round-299 (studio-link-hydrate-ssr-ui, studio-link-hydrate-ui, studio-narrow-gate-ui, doc 220)

### Critical Issues
- None.

### Suggestions (ranked)
1. **NG9 can now be silently disabled by a test placed before it** — `studio-narrow-gate-ui.test.tsx:418-436`. React 18 prints hydration warnings only once per file load, using a module-level flag (`didWarnInvalidHydration`). NG9 (line 386) is currently the first hydration in the file, so its zero-warning check works. NG9c (line 418) does not call `applyBrowserParsedMutedState`, so it still triggers the jsdom `muted` warning. If anyone moves NG9c, or adds another hydration test, above NG9, that warning uses up the flag and NG9 passes no matter what. This is the same failure that moved LH3 into its own file in round 298.
   **Fix:** call `applyBrowserParsedMutedState(container)` in NG9c after line 422 as well. It costs nothing and removes the dependence on test order.
2. **NG9 still leaks its root if anything fails** — `studio-narrow-gate-ui.test.tsx:395-415`. The root is unmounted at the end of the test body, and the file's `afterEach` (line 111) never unmounts roots. With the check now at zero tolerance, a failure at line 412 is more likely, and it leaves a live route with listeners and timers into the next tests. The SSR file already fixed this (`hydrate-ssr-ui.test.tsx:124-138` registers the unmount before hydrating).
   **Fix:** use the same unmount registry and `afterEach` pattern in this file for NG9 and NG9c.
3. **The warning regex is copied, so the two checks can drift apart** — `studio-narrow-gate-ui.test.tsx:407` writes the regex inline, while `hydrate-ssr-ui.test.tsx:99-100` has it as `HYDRATION_WARNING_PATTERN`. `applyBrowserParsedMutedState` is also copied (`ssr:108-112`, `narrow:76-80`). If React is upgraded and one copy gets updated but not the other, one of the gates quietly gets weaker.
   **Fix:** this belongs to the shared-harness task (see the Architecture note), not this round.

### Checked and confirmed
- **The regex covers every hydration warning in React 18.3.1.** In `react-dom.development.js`, every place that sets `didWarnInvalidHydration = true` (lines 9569, 9579, 9637, 10475, 10486, 10497, 10516) prints text the new regex matches, including `Extra attributes from the server: %s` at 9585. The doc's claim is accurate.
- **"Hydration failed" may not reach `console.error`.** React reports it through `reportError` when that exists (line 29312), so this part of the regex may never match in jsdom. That's harmless: in development an "Expected server HTML…" / "Did not expect…" warning is always printed first, and the regex catches those.
- **The `muted` workaround matches real browsers.** Browser parsers set the `muted` property from the attribute, including for `innerHTML`, and C's round-298 check in Chromium saw 0 warnings. Fixing this in the test setup instead of adding `suppressHydrationWarning` is the right call, as the doc explains: the suppression would also hide real mismatches on other `<video>` attributes.
- **The `console.error` spy is installed after `renderToString`** in LH3 and NG9, so the server's "useLayoutEffect does nothing on the server" warnings are correctly left out.
- Strict TypeScript: no `any`, no assertions, no suppressions. Semicolons are present. Tailwind and the token rules don't apply (no UI changes).

### Good Practices Found
- In `hydrateRoute`, the unmount is registered before `hydrateRoot`, so a hydration that throws still gets cleaned up in `afterEach`.
- The old "allow one `muted` warning" exception is gone; the check is now strict `toEqual([])`.
- The doc lists mutants that each fail the test (x/v/y/h/r/r2), so the stricter check is shown to catch something.

### Architecture note
- **Signal 3, the same region changed at high cost repeatedly:** `studio-link-hydrate-ssr-ui.test.tsx:41-165`, `studio-link-hydrate-ui.test.tsx` and `studio-narrow-gate-ui.test.tsx:76-80, 386-436`. Rounds 297, 298 and 299 all changed the same hydration test setup, and each time the copies had to be fixed in parallel (the hydration flag, the `muted` warning, the regex, the unmount registry). Suggestions 1–3 come from that duplication.
  - **Keep for now:** this is test-only, it doesn't touch audio timing, refs, Undo/Redo or the public hook shape, and the round's tests are green.
  - **Proposal for the planner** (this is the doc's A-R298-ARCH-HYDRATE-HARNESS): one bounded task to create a shared helper, `__tests__/helpers/hydrate-route-harness.ts`, exporting `HYDRATION_WARNING_PATTERN`, `applyBrowserParsedMutedState`, `mountServerHtml` and `hydrateRoute` with the unmount registry. Done when:
    - all three files use it;
    - NG9 and NG9c run through the registry;
    - mutants (x) and (v) still fail LH3 and NG9;
    - the covering set (7 files, 58 tests) stays green.
  - **Cost:** low. **Risk:** low.

### Alternative Approach
- **Current:** fix the `muted` property in the test DOM so it matches what a browser parser does, then require zero warnings.
- **Alternative:** move the video dock behind a client-only boundary, or give `muted` a server/client-consistent setup in production code.
- **Verdict:** keep the current approach. Real browsers show no mismatch, so changing production code would mean extra SSR complexity to work around jsdom. The test-side fix is the smallest correct one.

### Score: 8.5/10