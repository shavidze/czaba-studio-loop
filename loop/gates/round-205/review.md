COMMIT: OK (nothing blocks this commit. All findings below are Low or deferred polish, and the change does not touch auth, purchase or download code.)

## Code Review: round 205 — Header.tsx, StudioShowcase.tsx, LeadMagnetPopup.tsx, useScrollLock.ts, plus 2 tests and 2 docs

This reviews the diff only, not the full modules. The verify log shows `tsc --noEmit` passing, 195 of 195 test files passing and the build succeeding.

**Auth, purchase and download check:**
- `paths.txt` contains no `lib/auth`, `AuthContext`, `services/api`, cart, checkout or download-route file.
- In `Header.tsx`, the only change near those areas is:
  - The Logout `onClick` now closes the menu before calling the same `signOut()` (`Header.tsx:179-182`). The call count is unchanged, and test HF6 checks it is called once.
  - The `/account/downloads` link gained an `onClick` that closes the menu (`:170`). The link target is unchanged.
- No auth logic changed.

### Critical Issues
- none

### Suggestions (ranked)
1. **Low, existing problem — two scroll locks at once.** In `useScrollLock.ts:19-33`, the lead-magnet popup can open from exit-intent while the sign-in modal (`AuthModal`) is already open. `useLeadMagnet.ts:137-148` has no guard against that.
   - The second lock reads `scrollY = 0`, because the body is already fixed, and overwrites `top`.
   - When the popup closes, its cleanup unlocks the body while `AuthModal` is still open, and scrolls to 0.
   - This is not a regression: on HEAD, `top` was always `-0px`. The fix improves the single-lock case but doesn't cover nesting.
   - Fix: a module-level lock counter, or skip lock and unlock when `body.style.position === 'fixed'` was already set by someone else.
2. **Low — refines the deferred C-R204-02.** `Header.tsx:130-134` closes the menu when `relatedTarget === null`. In desktop Safari:
   - A keyboard user opens the menu, so focus is on the button.
   - They then mouse-click the same button. Mousedown blurs to body with a null target, so the menu closes. The click then toggles it open again.
   - Result: the menu flickers and stays open.
   - Fix: don't close on a `null` target, because the outside-pointerdown listener already covers mouse. Note that `Header.tsx` is frozen this round and HF4 tests the `null` case, so this belongs on the deferred list.
3. **Low — focus-trap selector misses links.** `LeadMagnetPopup.tsx:78` only queries `button, input`. A future `<a>` inside the dialog (for example a privacy link) would let focus escape the trap without any error. Fix: use the standard tabbable selector (`a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])`).
4. **Low — focus during submit (already a TODO in doc 162).** While `isSubmitting` is true, focus sits on `body`. A Tab in that window can reach the header behind the dialog. One option: in the submit handler, focus the dialog itself (`dialogRef.current?.focus({preventScroll:true})`) before the controls become disabled.
5. **Low — StudioShowcase CTA.** `StudioShowcase.tsx:155`:
   - `transition-[background-color,transform]` has no effect, because the global rule in `app.css:307` overrides it. This is already recorded in doc 161.
   - The arbitrary `hover:[transform:scale(1.05)]` is an accepted deviation.
   - There is no reduced-motion variant. Add `motion-reduce:hover:[transform:none] motion-reduce:active:[transform:none]` when `Header` is no longer frozen (GATE204-S3).
6. **Low — Escape doesn't dismiss the hover-only panel (WCAG 1.4.13).** If the mouse is over the menu wrapper, `group-hover` keeps the panel visible after Escape. This existed before and is deferred as B-R203-USERMENU-HOVER-ESCAPE.
7. **Low — menu stays open after back/forward.** The user menu does not close on `location.pathname` changes, so it stays open after browser back/forward. Fix: add an effect on `location.pathname` that calls `setIsUserMenuOpen(false)`.
8. **Nit — render cost.** Toggling `isUserMenuOpen` re-renders the whole `Header`, including `CommandPalette`, which is not memoized (`CommandPalette.tsx:36`). This only happens on click, so the cost is negligible.
9. **Nit — typing.** `focusedStepRef` is typed `useRef<string | null>` (`LeadMagnetPopup.tsx:23`). It could use the hook's step union type instead. No `any`, `@ts-ignore` or type assertions were added.

### Good Practices Found
- **`useScrollLock`:** reading `scrollY` before fixing the body is a real fix, and LM8 tests it properly with a `scrollY` getter that depends on the body being fixed.
- **Popup effect order is correct:** the scroll-lock cleanup restores the scroll position before the focus cleanup, which uses `preventScroll`. Focus is only restored to an element that is still connected.
- **Popup keyboard handling:** Escape is ignored while an IME composition is active, and `stopPropagation` keeps it away from document listeners. The dialog name follows the current step's own `h2` elements, so no visible text changed.
- **Header listener:** the document `pointerdown` listener only exists while the menu is open and is removed in cleanup, so nothing leaks.
- **Mobile menu:** adding `invisible` removes the hidden tab stops and still keeps the 300ms close transition.
- **StudioShowcase:**
  - Removing the `motion.div whileTap` wrapper fixes the stray `tabIndex=0` DIV at the source.
  - Disconnecting the observer after the first reveal removes repeat work on later scrolls.
- All new buttons have `type="button"`. Only token colours are used, with no new custom CSS.

### Architecture note (a proposal for the planner, not a fix for this round)
- **Signal 4 (new state and lifecycle in an existing owner):** `Header.tsx:14-28, 43-45` adds the menu's open state, a document listener and an auth-sync effect. `Header` already owns the mobile-menu state and the cart-badge timer. **Keep:** it is one lifecycle with no change in ownership or coupling, and extracting it now would gain little. Track it if `Header` gets more additions.
- **Repeated region / shared gap:** `LeadMagnetPopup.tsx:33-91` adds 4 effects and 7 refs of dialog focus handling. `ui/Modal` and `AuthModal` lack the same thing (`shared-modal-no-focus-management`).
  - **Proposal:** one bounded task to create a concrete `useDialogFocus` hook (initial focus, Tab trap, Escape, focus return) for exactly these three consumers.
  - The task should also add the `useScrollLock` lock counter (Suggestion 1), since all three call it.
  - Acceptance: the LM1–LM9 tests stay green unchanged, and AuthModal/Modal get equivalent tests. The visible markup of the lead-magnet popup must not change.

### Alternative Approach (focus and dialog handling)
- **Current:** hand-written trap and focus return inside the popup, with no portal or `inert`, so the markup on the keep list is unchanged.
- **Alternative:** a shared dialog-focus hook, or native `<dialog>` with `showModal()`. With `showModal()` the browser handles the trap, Escape and making the background inert.
- **Verdict:** the current approach is right for this round, because `root.tsx` and `Modal` are frozen and typed `inert` isn't available in React 18. Native `<dialog>` would change the top-layer and backdrop styling of a component on the keep list. The shared hook (see the architecture note) is the right next step.

### Score: 8/10