COMMIT: OK

I reviewed the diff and the final files by reading them. I did not run a browser, so the event-ordering findings below come from reading the code and the tests.

The candidate touches no auth, purchase, download, Studio or audio code. The only `.ts/.tsx` changes are chat UI, `IconButton.tsx`, and tests. The verify log shows `fail 0`. The `Error: use… must be used within an ArrangementProvider` lines in it look like negative-test output, not failures.

## Findings, ranked
There are no blockers and no critical issues.

1. **Low, behavior note, `ChatInput.tsx:19-23` and `ChatWindow.tsx:38`.**
   - `focusOnMount` only fires when `document.activeElement === document.body`. Clicking "Start Chat" or pressing Enter in the form unmounts the focused element, so focus falls back to `body` and the textarea takes it. Tests B2D-7 and B2D-9 cover both the focus move and the case where the user focused something else.
   - `useState(isGuestFormVisible)` is a one-time snapshot, so a window that opens with an existing session never grabs focus. That is the intended behavior.
   - There is no timer or listener, and no leak.
   - A guest session that ends and restarts while `ChatWindow` stays mounted would refocus. This is harmless.
   - No fix is needed.

2. **Low, `ChatInput.tsx:33`.**
   - `textareaRef.current?.focus()` runs after `setValue('')` in the submit handler. Send then becomes disabled with `pointer-events-none`. A mouse click or Tab+Enter on the button would otherwise drop focus to `body`, and the explicit refocus prevents that.
   - It also keeps the mobile keyboard open. Safari doesn't focus buttons on click, so there it is a no-op.
   - The Enter-key path (`:39-52`) doesn't refocus because focus never left the textarea. That is correct.

3. **Low, `IconButton.tsx:35`.**
   - The `brand` variant lost `active:scale-95` and `hover:shadow-glow`. The global rule `button:active:not(:disabled)` scale(0.98) in `app/styles/base/utilities.css:18` and `app/styles/app.css:230` still applies.
   - Brand's `active:scale-95` would have stacked on that global `:active` rule, and removing it removes the clash.
   - The visual change is small and documented. The `default` and `ghost` variants are unchanged.

4. **Low, accessibility, `ChatInput.tsx:88-96`.**
   - `label` sets both `aria-label` and `title`. The accessible name is unchanged ("Send message"), and the `w-10 h-10` hit area is larger than the old ~36px button.
   - While disabled, `pointer-events-none` means no tooltip appears. That is expected.
   - If the project wants a visible focus ring for keyboard users on this button, confirm that the global `:focus-visible` rule in `app.css` (around line 235) covers it. The diff itself adds none.

5. **Info, `GuestForm.tsx:93`.**
   - "Start Chat" moves from `rounded-lg` to `Button`'s `rounded-md` shape. This is documented in `DESIGN_SYSTEM.md`.
   - `Button` defaults to `variant='primary'`. `type="submit"` is passed explicitly, so form validation still runs (B2D-2).
   - The now-unused `cn` import in `GuestForm.tsx` is not visible in the diff, but the file uses `cn` elsewhere and verify passed lint.

6. **Info, tests.**
   - Removing the `IconButton.tsx` entries from the allow-lists in `store-glow-shadow.test.ts` and `store-undefined-tokens.test.ts` matches the removal of `shadow-glow`. The `toHaveLength(5)` to `(4)` change is consistent with that.
   - B2D-8 reads source with regexes, which is brittle but acceptable for a design-system guard.
   - There are no `any`, no type assertions and no `@ts-ignore` in the production code.

Other checks:
- **Listeners and timers:** none added.
- **Render cost:** one extra `useState` and one effect, which is negligible.
- **Tailwind and tokens:** only token classes (`bg-brand`, `text-background`, `shadow-sm`).
- **XSS and secrets:** nothing relevant.
- **Reach:** `ChatWidget` is dead code, and the live consumer is `routes/support.tsx`. `IconButton` had no importers outside the barrel before this change, so nothing else regresses.

## Architecture note
- **Signal:** none that needs action. `ChatWindow.tsx:38` plus `ChatInput.tsx:11,19-23` add a small piece of lifecycle: "focus once when the guest form gives way to the chat". It sits in the owner that already decides the guest form versus the chat.
- **Keep:** it is cohesive and has one lifecycle. Extracting it would cost more in prop plumbing than it saves, and the tests B2D-6, B2D-7 and B2D-9 pin the behavior.
- **Planner proposal (optional):** if more "focus handoff" cases appear in the chat (for example, focus after the session resets), have the planner consider one bounded task. It would move the `focusOnMount` decision into a single place, with `ChatWindow` and `ChatInput` tests as the acceptance criteria. Don't do this now.

This review covers only the diff and the files it touches. It is not a full-module audit.