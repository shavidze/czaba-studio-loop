COMMIT: OK

The candidate is a CSS token cleanup. I found no Critical issues and no changes to auth, purchase or download code. I read the diff and the three new files and checked token definitions in `app/styles/app.css` and leftover references with grep. I did not run a browser. The verify log and the C round PASS were taken from your message, not re-read.

## Code Review: ProductCard.tsx, app.css, account_.login.tsx, search.tsx, token tests

### Critical Issues
- None.

### Suggestions (ranked)
1. **`app/components/product/ProductCard.tsx:~113`: the title lost its hover colour change.**
   - I removed `group-hover:text-primary` because `text-primary` does not emit a utility, so it did nothing at HEAD. The card therefore keeps only the `scale-[1.02]` hover cue.
   - Fix (optional, separate round): add `group-hover:text-brand` and `group-focus-within:text-brand`. The link has no visible focus style, so keyboard users get no cue.
2. **`app/styles/app.css:190`: `.nav-loading-bar { display: none; }` is a stopgap.**
   - It matches HEAD, where the invalid `--color-accent-hover` already left the bar unpainted. So there is no visual regression, but users still get no navigation feedback.
   - `app/root.tsx:145` still mounts the div on every navigation, which is cheap.
   - Fix: when root removes the render line (ROOT-REQ-NAV-LOADING-BAR-RENDER), delete the rule and its UT5 assertion. Test UT5 locks `display: none` in, so it will need updating then.
3. **`app/routes/account_.login.tsx:7` and `app/routes/search.tsx:7`: these two stub routes still use inline `style={{…}}`.**
   - That breaks the Tailwind-first rule. The diff only swaps the token, so this is existing debt.
   - Fix: convert them to Tailwind classes (`text-muted`, `p-16`, and so on) when the real pages replace the stubs.
4. **`app/lib/__tests__/helpers/token-resolve.ts`: the tests load a full Tailwind compile and a TypeScript AST scan.**
   - UT1 to UT5 run with a 30 s timeout. Slow CI could make them flaky, but nothing ships to the browser from this.
   - `createRequire` and `readFileSync` are used for tests only. The helper has no `any` and no type assertions, and `Array<string>(2).fill(...)` is fine.
   - Fix: if the suite gets slow, share the `compile()` result across the tests. `resolver` is already shared, but `nonEmittingColourUtilities` and `undefinedPropertyReads` each build their own.

### Good Practices Found
- Every replacement token is defined: `--color-surface`, `--color-foreground`, `--color-muted`, `--color-brand-rgb` (`app.css:133`) and `--color-background`.
- No `--color-text-primary`, `--color-text-muted`, `--primary-hue` or `--color-accent-hover` remain outside tests. The one remaining test mention is a deliberate negative fixture.
- The badge `bg-background/70 text-foreground` is readable over the image, thanks to `backdrop-blur-sm`. The brand badge keeps `bg-brand/90 text-background`.
- The patch has no listeners, timers, effects or state. There is no render-cost change and no event-ordering risk.
- The new tests verify the diff in two ways: they check that Tailwind emits (or doesn't emit) each removed and added class, and they check that every non-fallback `var()` read resolves to a declared property.
- The allow-list pins the exact dead or frozen files, and UT2b checks that the dead ones stay unmounted.
- The `store-live-teal.test.ts` expectation was updated to match the `.code-4` change.
- The implementation doc is in `docs/implementation/2026/quarter-IV/`, as the rule requires.

### Architecture note
- none. No mixed responsibilities, no ownership or coupling change, no new lifecycle. The only candidate is the `app.css` / `root.tsx` coupling around `nav-loading-bar`, which is already recorded as ROOT-REQ-NAV-LOADING-BAR-RENDER. Keep it as is.

### Alternative Approach
- Not critical logic (no auth, checkout or Studio audio code).

### Score: 9/10