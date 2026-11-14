COMMIT: OK

The change touches no auth, purchase, download or Studio audio code. It is limited to `CookieConsent.tsx`, its test file and one implementation doc. The doc is in Georgian and follows the required structure. I read the diff, the full component and `IconButton`. I did not run it in a browser. `verify.log` shows no failures. The `must be used within an ArrangementProvider` lines in it are expected error-path test output.

## Findings, ranked (none block the commit)

1. **Medium (mobile, real-browser): the keyboard can reopen after a tap.** `CookieConsent.tsx:72` and `:41`. `relatedTarget` records any previously focused element, including a text input or search field. After a pointer dismissal (`detail ≥ 1`), focus is moved back to that input, which on iOS and Android reopens the on-screen keyboard. The user only tapped Accept.
   - **Fix:** in the pointer branch, skip a `previous` that is editable (`input`, `textarea`, `select`, or `isContentEditable`). Fall through to the next candidate, or leave focus where it is. Keep returning to `previous` for keyboard dismissal.
   - This is not listed under the doc's "known limitations", and none of the R514 tests cover it.

2. **Low: stale DOM reference.** `CookieConsent.tsx:50` and `:72`. `focusBeforeBannerRef` keeps pointing at the previous element after dismissal. The component stays mounted and returns `null`, so a detached node, for example from an old route, is retained for the life of the app.
   - **Fix:** set `focusBeforeBannerRef.current = null` at the end of `handleAccept` and `handleDecline`, or in the focus helper.

3. **Low: the fallback selector is not scoped to the site header.** `CookieConsent.tsx:20-23`. `header a[href]` also matches the `<header>` elements in `SfxSceneBuilder`, `SfxSoundLibrary` and `SfxSceneExport`. The site header (`Header.tsx:69`) normally comes first in the DOM, so this works today. If the first match is hidden, `focus()` fails and the loop moves to the next candidate. Focus is only lost if no later candidate takes it.
   - **Fix:** give the site header a `data-site-header` attribute or `id`, and scope both selectors to it.

4. **Low, informational: `detail === 0` is only a proxy for keyboard use.** `CookieConsent.tsx:77` and `:89`. Programmatic `.click()` and some assistive-technology activations also send `detail` 0. Those cases take the scrolling `focus()` path, which is acceptable. The doc already lists the opposite case, screen-reader mouse simulation.

## Checked and fine

- **Event ordering:** `focus()` runs synchronously in the click handler, before `setIsVisible(false)`. The element that has focus is never unmounted first, so there is no blur to `body` in between.
- **Listeners and timers:** no new ones. `onFocus` is React's delegated `focusin`, and the existing 1500 ms timer is still cleaned up.
- **Render cost:** only refs, with no new state, so there are no extra renders.
- **TypeScript:** no `any`, no assertions and no suppressions. Narrowing uses `instanceof Node` and `instanceof HTMLElement`, and semicolons are present.
- **SSR:** `document` is only used inside event handlers.
- **Tailwind:** only tokens and utilities were added, with no hardcoded colors. `IconButton` `md` is `w-10 h-10` with a 20 px icon, which matches the test.
- **Layout:** `px-10` is 40 px, plus the container's 16 px padding, so the text starts 56 px from the edge. The Close button spans 8 to 48 px, so they no longer overlap.
- **Accessibility:** the label and the Tab order are unchanged, and the target grows from 32 px to 40 px.
- **Existing flows:** `setAnalyticsConsent`, `fbq`, the timer and hiding on Studio routes are unchanged.

## Architecture note

- **Signal:** new state and lifecycle in an existing owner, at `CookieConsent.tsx:20-45` and `:69-73`. A module-level focus-restore helper, two refs and an `onFocus` handler have been added to a small banner component.
- **Keep, because:** the banner is the only non-modal surface that needs this. The behaviour is cohesive and has one lifecycle. There is no coupling to audio, auth or contexts. The tests cover it directly (R514-F1 to F9). The extra size is about 40 lines.
- **Proposal for the planner, not for this round:** the doc already names SIG-R513-COOKIE-FOCUS-GROWTH. I agree with its trigger. When a second non-modal surface needs this, extract `restoreFocusAfterDismiss(banner, previous, fromKeyboard)` into `lib/` or a hook. Acceptance criteria: the same R514 tests pass unchanged, and findings 1 to 3 are folded in as part of the move. There is no case for extracting it now.