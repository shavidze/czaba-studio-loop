COMMIT: OK

This commit changes only tests and docs; no `src/` file is touched, so the running app can't regress from it. The verify log shows every suite passing, including the new `dom-queries.test.ts` (4 tests), `busy-buttons-focus` (9) and `selection-after-folder-switch` (8).

**Findings**

- **critical / high / medium:** none.
- **low** – `tests/renderer/components/busy-buttons-focus.test.ts:258` (f9): the test sets `useSchemaStore.setState({ fields: [] })` directly. That is safe only if the suite's `beforeEach` restores the schema store; otherwise tests that run after it inherit an empty field list. The suite passes today. **Fix:** confirm the reset exists, or reset the store inside the test.
- **low** – `tests/renderer/components/selection-after-folder-switch.test.ts:223` (x8): this is a pure store test placed in a component suite, and it calls `setFiles` with the same file list it seeded. It still tells order-preserving filtering apart from re-sorting by file order (`[A3, B, A]` gives `[A3, A]`, which is not file order). **Fix (optional):** move it to `tests/renderer/stores/file-store.test.ts`.
- **Checked and fine:**
  - **f9 matches the source.** `SchemaEditor.tsx:138` returns early when `fields.length === 0`, and `:280` sets `aria-disabled={isApplying || fields.length === 0}`.
  - **The `g`/`y` guard in `getButtonByText`** throws before any matching. The type narrowing is correct and the error text matches q4.
  - **`TESTING.md` additions** match the helper's behaviour: whole-text match after trimming, flags rejected, visibility and `aria-label` ignored. The jsdom focus caveat agrees with the bug log entry (21).
  - **Bug log updates** (entries (18), (20), (21)): the test names listed match the `it(...)` titles in the diff exactly.
  - **Conventions:** no `any`, semicolons present, no source comments, Georgian docs.

**Architecture note (proposal only)**

`getButtonByText` now has fixed rules (exactly one match, whole text, no stateful regex flags). It would be worth adding a sibling `queryButtonByText` that returns `null` when nothing matches, so tests that check a button is absent don't fall back to the expensive `getByRole` queries. Tests that check accessible names should keep using `getByRole`. Separately, store-only checks like x8 belong in the `stores/` suites, so component suites stay focused on how the UI is wired.