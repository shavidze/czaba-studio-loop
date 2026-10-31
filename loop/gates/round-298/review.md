COMMIT: OK. All three paths are tests or docs: two test files under `app/lib/arrangement/__tests__/` and doc 220. No production code changes, so nothing touches auth, purchase or download. C-298 passed and verify passed (229 files, 3416 tests). The new warning regex is stricter than HEAD's: it no longer counts the server's "useLayoutEffect does nothing" warnings, and the one warning it does catch is the known `muted` one (verify.log:3701). Nothing here is a regression.

## Code Review: round 298 (`studio-link-hydrate-ui.test.tsx`, `studio-link-hydrate-ssr-ui.test.tsx`, doc 220)

### Critical Issues
- None that block the commit.

### Suggestions (most important first)
1. **Doc 220 makes claims this round's own evidence contradicts.** `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md:111`
   - "Root-ები `afterEach`-ში ყოველთვის unmount-დება, row-ის ჩავარდნის შემთხვევაშიც" is too strong. If hydration throws inside `act`, the cleanup is never registered (see #3).
   - "library მათ შორისაა" is too strong. C-R298-01 showed that an extra-attribute mismatch on the library option still passes all 4 tests. Only node and text mismatches before the video dock are caught.
   - Line 68 still says "9 ფაილი, 89 ტესტი", which is out of date (INFO-C298-02).
   - **Fix:** narrow the first claim to "roots whose hydration completed" and the second to "node/text mismatches before the dock", and update the count. This can be done next round without touching code.

2. **The warning regex misses some React 18 hydration warnings (C-R298-01, medium).** `studio-link-hydrate-ssr-ui.test.tsx:103`. `Extra attributes from the server: …` is printed but not matched, so LH3 stays green when the server and client attributes differ.
   - **Fix:** add `|Extra attributes from the server`.
   - Check the `react-dom` dev build before also adding `Did not expect server HTML to contain`. I haven't confirmed that exact string.

3. **Cleanup is registered after the step that can throw.** This is in `hydrateRoute`, in both files: `studio-link-hydrate-ssr-ui.test.tsx:116-130` and `studio-link-hydrate-ui.test.tsx:108-122`. `mountedRouteUnmounts.push(unmount)` runs only after `await act(...)` succeeds. If hydration throws, the root and its matchMedia/ResizeObserver listeners stay mounted into the next test.
   - **Fix:** build `unmount` and push it before the `act`; it reads `root` when it runs, so this works. Or wrap the `act` in `try/finally`.
   - Low severity, since the test fails anyway, but it is the leak class this review was asked to look for.

4. **Minor:**
   - `studio-link-hydrate-ssr-ui.test.tsx:182`: `toBeLessThanOrEqual(1)` adds nothing beyond line 181.
   - `installViewportStub(true)` returns a value that the SSR file never uses.
   - Neither causes harm.

### Good Practices Found
- `afterEach` unmounts before `vi.unstubAllGlobals()` and `vi.restoreAllMocks()`, so `removeEventListener` still runs against the live stub.
- Calling unmount twice is safe: `root = null` on the first call, and C exercised this.
- Moving LH3 into its own file is the right fix. Vitest isolates each file by default and `vitest.config.ts` doesn't override that, so React's "warn about one hydration mismatch only" flag starts fresh in each file.
- The `args[1] !== 'muted'` filter fits React's `%s` warning format and doesn't hide other mismatches.
- TypeScript strict: no `any`, no `@ts-ignore`, no type assertions. Every statement ends with a semicolon.
- No Tailwind, accessibility or render-cost impact, because no production code changed.

### Architecture note
- **Signal 3, repeated costly change.** About 120 identical lines now appear in both hydrate files: lines 1-149 / 1-157, including the `@remix-run/react`, `demo-synth` and `studio-lab-demo` mocks, `installViewportStub`, `hydrateRoute`, and the `beforeEach`/`afterEach` stubs. Doc 220:95-96 shows the same mock line is already repeated in three more test files.
- **Keep for this round:** behaviour is unchanged and no production ownership is affected.
- **Proposal for the planner:** one bounded task to move this block into something like `__tests__/helpers/hydrate-route-test-environment.ts`, accepted when LH1-LH4 still pass. The task should also apply fix #3 in that one place.

### Alternative Approach
- **Current:** separate files so LH3 gets React's one-time hydration warning to itself, plus a regex over `console.error` output.
- **Alternative:** pass `onRecoverableError` to `hydrateRoot` and fix the `<video muted>` mismatch at its source (GATE297-S5-VIDEO-MUTED-SSR). With that mismatch gone, the one-time warning is no longer used up by the dock, and any warning at all can fail the test.
- **Verdict:** the current approach is fine for a test-only round. The real fix is GATE297-S5. Once it lands, the `muted` filter and the separate file are no longer needed.

### Score: 8/10

This is a review of the diff only; I didn't do a full check of the module.