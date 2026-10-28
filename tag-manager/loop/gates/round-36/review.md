COMMIT: OK

The change only touches tests and docs. No `src/` file changes, so nothing changes at runtime, in security or in accessibility. The verify log is all green: Biome gives 8 warnings, all in untouched `src/` files and already there before this change; tsc is clean; 289 renderer and 93 main tests pass; 7 of 7 E2E tests pass.

**Findings**

*Critical / High:* none.

*Medium:* none.

*Low:*
1. **Weak assertion in test (b7)**, `tests/renderer/components/schema-editor-done-busy.test.ts` (b7, `reads[1].schema.some((f) => f.key === "qtwo")`). Both re-reads probably read the schema at the moment they run, so both may include `qtwo`. If so, this line can't tell Done #1 from Done #2 and doesn't prove which re-read is which. The test still checks the right outcome: it resolves `reads[2]` and then `reads[1]`, and the stale `STALE1` title must not stick. Fix: either drop the assertion, or record which Done each read belongs to (for example, check which `onSave` call resolves which read) so the comment "#2 first then #1" is backed by evidence.
2. **The helper has no visibility filter**, `tests/renderer/helpers/dom-queries.ts:7`. It uses `document.querySelectorAll("button")`, so unlike `getByRole` it also sees hidden buttons (`aria-hidden`, `display:none`, buttons outside the accessibility tree), and it ignores `aria-label`. Because it requires exactly one match, a hidden duplicate makes the test fail loudly instead of passing by mistake, so this is safe. The drawback is that these tests no longer show whether a button has an accessible name. TESTING.md §6 says to use `getByTitle` for icon-only buttons. Fix: add one sentence to §6 saying a11y-name checks must still use `getByRole`.
3. **Stateful regex risk**, `dom-queries.ts:3`. `name.test(text)` keeps state between calls if a regex has the `g` or `y` flag. No current caller uses either flag. Fix: add `name.lastIndex = 0` before the test, or reject regexes with `g`/`y`.
4. **Agent name in project docs**, `.claude/primitives/TESTING.md` §6. The phrase "B-ის გაზომვით" ("by B's measurement") names a loop agent, which means nothing to someone reading the docs later. Fix: write it as "measured on one runner" instead.

**Checks I ran:**
- Search for `getByRole("button"` and `buttonByText(` across `tests/`: 0 matches left.
- Every changed test file still uses `screen.`, so no `screen` import was left unused.
- The local `buttonByText` was removed cleanly and its callers now use the helper.
- The edits to docs D-40, D-41 and the (e5) entry match the renamed test titles.
- Biome only lints `src/`, so these test files aren't linted. tsc does cover them through `tsconfig.test.json` and passes.

**Architecture note (proposal only):** add `tests/` to the Biome scope, since right now `biome check src/` lets lint problems in tests through. Also consider wrapping these tests' button lookups in one shared helper like `clickButton(name)`. About 8 suites each define their own copy, and a shared one would stop them drifting apart.