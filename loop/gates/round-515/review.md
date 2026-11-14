COMMIT: OK

Review of the CookieConsent diff, which has 3 files: `CookieConsent.tsx`, its test and implementation doc 333. It touches no auth, purchase, download or Studio code. I read the diff and the full component, and I did not run any code. I rely on C's PASS and `verify.log` for the browser and verify results.

## Findings, ranked

No Critical issues. All findings are Low.

1. **Low, `CookieConsent.tsx:84-85` (`handleBannerBlur`).** The ref is cleared on every focus-out whose `relatedTarget` is outside the banner. `relatedTarget` is also `null` when the browser window loses focus while a banner control is focused.
   - After an alt-tab, a keyboard dismissal falls through to the header logo instead of the original element.
   - Doc 333 lists this as a known limitation inherited from HEAD, so it is not a regression.
   - Fix, if it ever matters: in the `null` case, skip clearing when `document.hasFocus()` is false. I agree with leaving it out of this round.

2. **Low, `CookieConsent.tsx:38`.** `previous?.matches(...)` yields `boolean | undefined`, so `skipPrevious` is typed `boolean | undefined`.
   - It is valid under TS strict, with no `any` and no assertions.
   - Tidier form: `const skipPrevious = !fromKeyboard && previous !== null && previous.matches(...)`.

3. **Low, `CookieConsent.tsx:28` (`COOKIE_CONSENT_KEYBOARD_FIELD_SELECTOR`).**
   - The `input` selector is a deny-list of types, so new or unknown input types (for example `type="datetime-local"`) default to "opens a keyboard". For pointer dismissal this errs toward skipping the field, which is the safe side.
   - A `readonly` or `disabled` text input is also skipped. That is harmless, because focus goes to the logo and the field never opened a keyboard.
   - Fix, optional: add a one-line comment, or an allow-list, if that bothers you.

4. **Info, `CookieConsent.tsx:114-117` (pre-existing).** The inline `style` uses hardcoded rgba and `backdropFilter`, which violates "Tailwind-first, no hardcoded colors". This diff did not add it. Fix in a separate task: `bg-gradient-to-t from-black/95 to-black/90 backdrop-blur-md`.

## Checks on what tests cannot catch

- **Event ordering.**
  - In `handleAccept` and `handleDecline`, `focus()` on a candidate outside the banner fires focusout on the banner. That calls `handleBannerBlur`, which sets the ref to `null`.
  - The ref is read as an argument before `focus()` runs, so this is harmless.
  - Banner-internal moves, such as Tab from the Privacy link to Close, have a banner-contained `relatedTarget`. They keep the stored element, which `R515-T4` covers.
- **Real-browser focus.**
  - Safari does not focus a button on click, so focus never enters the banner and the ref stays `null`. That is the intended C-R514-01 fix.
  - The doc defers Safari verification.
  - jsdom `fireEvent` cannot prove the ring, scroll and keyboard behavior. C's browser rows (C1–C4) are the evidence for that.
- **Leaks.** No new listeners or timers. The 1500 ms timer keeps its cleanup, and the tests use fake timers with `useRealTimers` in `afterEach`.
- **Render cost.** No new state. The ref write and the `onBlur` handler do not cause re-renders.
- **Accessibility.**
  - A pointer dismissal from a text field moves focus to the logo. A screen-reader cursor can jump upward, which doc 333 accepts as limitation 3.
  - A keyboard dismissal still returns to the field, so keyboard and AT users keep their place.
  - A virtual click from AT or voice control with `detail === 0` takes the keyboard path. That is the safe side.
- **TS, security and tokens.** No `any`, `@ts-ignore` or assertions. There is no XSS or input-handling surface, and `instanceof` guards cover the `relatedTarget` handling.

## Architecture note

- **Signal (repeated costly change, region = focus-restore logic).** `CookieConsent.tsx:20-52` and `:76-86` have changed in rounds 512, 514 and 515. Each round adds a rule: the fallback selectors, the skip-field rule and the blur-clear.
- **Keep for now.**
  - The logic has one lifecycle and one consumer.
  - The gesture-lifecycle invariants (`event.detail === 0`, the ordering of `focus()` and `setIsVisible`) are coupled to the component's handlers.
  - Extracting now would add prop plumbing and gain nothing.
- **Proposal for the planner, conditional.** Do this only when a second non-modal surface needs it, as SIG-R513-COOKIE-FOCUS-GROWTH already says. Task: move `focusAfterCookieDismiss` and the selectors into a `lib/` helper with unit tests. Accept only if the public behavior and all R512–R515 tests stay unchanged.
- This is a review of the diff only, not a full audit of the module.

## Score: 9/10