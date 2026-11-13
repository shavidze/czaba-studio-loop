COMMIT: OK

I read the diff, the new test file and the `studio-repeat-safe` helper. I did not run a browser; the points about event ordering and focus are from reading the code.

**Scope.** The candidate commit touches only `app/routes/account.tsx`, the new test `app/lib/__tests__/account-profile-name.test.tsx` and the implementation doc. Nothing in auth, purchase or download code changes. `updateProfile` and `updatePassword` are still called exactly as before, and there is no new `any`, assertion or suppression directive.

**Findings, ranked (none blocking):**

1. **Low – `app/routes/account.tsx:276`, `active:transform-none!`.**
   - A global rule in `app/styles/app.css:230` (`button:active…`) applies a press transform to every button.
   - The override is a Tailwind v4 important modifier, and `account.orders.tsx:69` already uses the same pattern, so it is consistent.
   - It does leave the name button without any press feedback. Only fix this if that matters to you; if so, drop the override and accept the global press effect.

2. **Low – `app/routes/account.tsx:10`, import from `~/components/arrangement/studio-repeat-safe`.**
   - The account route now depends on a helper that lives in the arrangement (Studio) folder.
   - The helper is a pure 5-line function with no Studio state, so behavior is fine. The cost is the coupling direction.
   - Fix: when convenient, move it to a neutral place such as `~/lib`, or `~/components/ui`. Don't do this in this commit.

3. **Low – `app/routes/account.tsx:262-264`, Save and Cancel buttons.**
   - These two icon buttons still have no `focus-visible` ring classes and no `disabled:` styling. Disabled state is conveyed only by the `disabled` attribute.
   - This predates the diff. The visible-focus check belongs in the real-browser pass, since the global focus style may already cover it.

4. **Info – `app/routes/account.tsx:96,132-137`, the `restoreNameFocusRef` / `isNameEditorFocusUnclaimed` logic.**
   - **Safari and iOS:** buttons don't take focus on click there, so `activeElement` is `body` after clicking Save. That case is handled as "unclaimed", so focus returns to the name button, and the tests PN10c and PN10d cover it.
   - **Disabled Save button:** after the click, Save is disabled while the save is in flight. In Chrome the disabled button can stay as `activeElement`, and `contains` still counts it as inside the editor, so that case is covered too.
   - **Unmount during a save:** `setIsEditingName` and `setNameSaving` run after unmount, but they are harmless no-ops in React 18. There are no timers or listeners to leak, because the diff adds only refs and one effect that has a deps array.
   - **Stale focus-restore flag:** if the effect doesn't run (the editor is already closed), `restoreNameFocusRef` stays true. The next `isEditingName` false-to-true change takes the focus-input branch first. It only restores after the editor closes again, and that is the intended behavior.

5. **Info – render cost.** There are no new state updates and no per-render allocations beyond two small closures. `useId` is stable. Cost is negligible.

6. **Info – accessibility is improved.**
   - The `<p onClick>` is now a native `<button type="button">`.
   - The name is labelled "Full Name &lt;value&gt;" via `aria-labelledby`, and the inputs and icon buttons get distinct names.
   - Repeated Enter is suppressed on the name button and in the inputs. This avoids the held-Enter loop of reopening and saving.
   - `preventRepeatedEnterKeyDown` returns early in `handleNameKeyDown`. A repeated Escape isn't blocked, but it is idempotent and also guarded by `nameSaveInFlightRef`.
   - Test PN8 asserts that a repeated Enter on the name button is blocked and that a repeated Space is not.
   - **Not blocked:** a held Space on the name button can still fire its click (the helper blocks only Enter). Opening the editor is idempotent, so this is harmless.

7. **Info – Tailwind and tokens.** Only utility classes and existing tokens (`text-foreground`, `text-brand`, `text-muted`) are used. There is no custom CSS and there are no hardcoded colors. Semicolons are consistent.

**Architecture note.**
- Signal: `app/routes/account.tsx:115-199` → **keep**. `ProfileContent` now holds five refs, the focus-claim logic and the save-in-flight guard. That is a new lifecycle (focus management) added to an existing owner (signal 4), and it is still cohesive: one editor, one set of invariants.
- It is covered by tests PN1–PN10h, and no hook shape or public API is involved.
- Extraction cost is medium, because the refs and state are interleaved. The benefit is currently low.
- Proposal for the planner, only if a second change lands in this region: one bounded task to extract a `useInlineNameEditor` hook from `ProfileContent`.
  - Ownership: `account.tsx` only.
  - Acceptance: the existing PN tests pass unchanged.
- This is a review of the diff, not an audit of the whole module.

**Score: 8.5/10**