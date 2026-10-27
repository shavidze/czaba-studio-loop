COMMIT: OK. No blocking issues. In the auth, purchase and download files the diff only changes `className` values, plus `aria-invalid` in `ui/Input`. No handlers, state, API calls, routes or token code are touched.

## Code Review: round 203 (SABA-B-4 stage 2, one shared focus ring for the store pages)

**Basis.** I read `paths.txt`, `diff.patch`, the 5 untracked files, `verify.log`, `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md`. `verify.log` shows 193 test files and 2780 tests passing, and the build finished. I did not run anything myself. `c-round-203.json` is not in the gate folder, so its PASS is taken from your brief, not checked. This is a review of the diff only, not of the whole modules.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium, accessibility: soft keyboards and IME** — `app/lib/focus-source.ts:62`. Android soft keyboards send `key === 'Unidentified'`, and some IME composition keydowns are not `'Process'`. Both switch the page to `keyboard` mid-typing, so the ring shows up on mobile and CJK input. The doc already lists this as a TODO.
   - **Fix:** add `if (event.isComposing || event.key === 'Unidentified') return true;` after the target check. This needs B's ruling, so it belongs in round 204, not this commit.
2. **Low: number inputs** — `focus-source.ts:20-28`. `number` counts as a single-line text input, so ArrowUp/ArrowDown on it switches to `keyboard`. Clicking a number field with the mouse and then stepping with the arrows shows the ring.
   - **Fix:** if that's unwanted, allow ArrowUp/ArrowDown when `target.type === 'number'`. Either way it's a product decision.
3. **Low: regression in the "Choose video" control** — `SfxVideoSync.tsx:35-54`. Turning it into a real button with a hidden file input fixes keyboard focus, but you can no longer drag a file onto it. Before, the invisible input covered the label and accepted the drop. The doc records this.
   - **Fix (separate task):** add `onDragOver`/`onDrop` on the button that call `onChoose(e.dataTransfer.files[0])`.
   - Also checked:
     - `.click()` on a `display:none` input works in Chromium, Firefox and Safari when called inside a user click.
     - `<fieldset disabled={busy}>` disables both the button and the input.
     - `tabIndex={-1}` does nothing extra on a `display:none` element. It's harmless.
4. **Low: mouse focus in text fields now only shows the caret** — GiftCardInput, cart DiscountCodeInput, store search, hire-us, account PasswordModal and others. Removing `focus:border-brand` means a field clicked with the mouse looks the same as an unfocused one, apart from the caret. This is Saba's deliberate trade-off (R103), and keyboard users still get the shared outline. I'm noting it because it's the most visible UX change, and Saba can still veto it.
5. **Low: old styles kept** — `app.css:742,751`. The new `color-mix(...)` shadows use design tokens, which is good. But `.audio-preview-overlay-button` is still custom CSS that predates this round. Leave it alone this round; converting it to Tailwind is a separate cleanup.
6. **Info: event order checks out on paper.** I did not test this in a browser.
   - `keydown` and `pointerdown` are both capture listeners on `document`. They set the attribute before focus moves, on both Tab and mouse-down, so `:focus-visible` gets the right source.
   - Ctrl+K and ⌘K go through the predicate's modifier check and become `keyboard`, so the palette input gets the ring.
   - The effect runs once and its cleanup removes both listeners and the attribute. No leaks, and no render cost because the attribute lives in the DOM, not React state.
   - Before hydration there is no attribute, so the browser's default focus behaviour applies. That's acceptable.
7. **Info: Input/Textarea** — `Input.tsx:108,113,223,231`.
   - The `aria-[invalid=true]:` selector outranks `border-outline-strong`, so the red error border now wins regardless of class order.
   - `aria-invalid` comes before `{...props}`, so a value the caller passes still wins (test IE3).
   - No hover border class competes with it.
   - Screen readers now announce the field as invalid, which is a real accessibility gain.

### Good Practices Found
- One unlayered global `:focus-visible` rule plus `html[data-focus-source="pointer"]`. A future `outline-none` utility can't quietly switch it off.
- The hook is mounted once, in `root.tsx` `AppContent`. Moving it out of `StudioWorkspace` removes the case where the attribute disappeared when Studio unmounted.
- The predicate is narrow:
  - it never fires when Ctrl, Meta or Alt is held;
  - `typeof key` stops autofill keydowns (which have no key) from throwing;
  - `isContentEditable === true` guards jsdom, where that property is undefined;
  - the FT6 test covers every target and key combination.
- TS strict is clean: no `any`, no type assertions, semicolons present, `ReadonlySet` used.
- The `ProductCard` Link gets `block rounded-xl`, and `focus-within:opacity-100` on the overlay means a keyboard-focused Play button is no longer invisible (opacity was 0 before).

### Architecture note
- **Signal 2 (ownership change):** `root.tsx:551` and `StudioWorkspace.tsx:17`, the focus-source lifecycle moves from a Studio component up to the app root. → **Keep it there.** It's a single document-level lifecycle with no props passed down, and it doesn't touch audio timing, refs or `useArrangement()`.
- **Signal 2 (two definitions of a text-input target):** `focus-source.ts:49-66` (`isFocusSourceFieldEditingKey`) and Studio's own `isTypingTarget` define it separately. They will drift, for example on number inputs or a contenteditable. → **Proposal for the planner:** one small task to extract a shared `isTextEditingTarget(target)` into `app/lib/` and use it in both places.
  - Acceptance: FT1–FT6 and the existing Studio keyboard-shortcut tests stay green, and Studio shortcut behaviour doesn't change.
  - Ownership: `lib/` plus the Studio call site, which needs root's approval because `StudioWorkspace.tsx` is frozen.
  - Cost: low.

### Alternative Approach (critical logic: focus-source heuristic)
- **Current:** any non-modifier key switches to `keyboard`, except editing keys pressed in a text field.
- **Alternative:** only Tab, Shift+Tab and Escape switch to `keyboard`.
  - Simpler, and typing can never trigger the ring.
  - But arrow-key moves like Studio's library ArrowDown → first result, or a roving tabindex, would lose the ring. That's the reason B rejected it.
- **Verdict:** the current approach is better. Its remaining gaps (Unidentified/IME, number inputs) can be closed by adding to the predicate, without changing the model.

### Score: 8/10