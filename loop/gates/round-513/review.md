COMMIT: OK

Only the three candidate paths changed: `CookieConsent.tsx`, its test file and doc 331. Nothing touches auth, purchase, download, checkout or Studio code. The consent logic is unchanged. That covers `setAnalyticsConsent`, `fbq` (the Facebook Pixel call), the 1500 ms timer with its `clearTimeout` cleanup, and the Studio-route hiding. No listeners or timers were added. I read the diff and the `Button`/`IconButton` sources. I did not run a browser.

## Findings, ranked

No blockers. All of these are non-blocking.

1. **Low, accessibility.** `CookieConsent.tsx:83-91`. The Close `IconButton` is `w-8 h-8` (32 px). That is below the usual 44 px touch target, though it is slightly smaller than the old 34 px. It is only visible on mobile, below `sm`, so the size matters most there. It is already in the deferred 514 work with B-R512-COOKIE-CLOSE-OVERLAPS-TEXT. Fix: add a hit-area wrapper or use `size="md"` when you handle it.
2. **Low, accessibility.** `Button.tsx` and `IconButton.tsx` define no `focus-visible` style, so keyboard focus on the three banner controls depends on the browser default or a global style. The old raw buttons had none either, so this is not a regression. Fix: add `focus-visible:ring-*` tokens to the shared components. That is its own task, outside this scope.
3. **Low, accessibility.** Focus falls to `body` after the banner is dismissed (`CookieConsent.tsx:45-48`). It was the same on HEAD and is already planned for round 514 (B-R512-COOKIE-DISMISS-FOCUS-LOST).
4. **Info, UX decision.** `CookieConsent.tsx:74-79`. Accept and Decline now have identical classes. That is a deliberate equal-weight default. It is consistent with the GDPR and EDPB concern, and one prop can change it if Saba answers SABA-Q-507 differently.
5. **Info, pre-existing.** `CookieConsent.tsx:54-58` still has an inline `style` with `rgba(0,0,0,…)` and `backdropFilter`. The Tailwind-first rule and the "no hardcoded colors" rule are not met there. It is not part of this diff, and N3-5 only checks `<button>` tags and white, black and neutral classes. Fix: move it to a token or utility class in a later NONBRAND stage.
6. **Info, test robustness.** `CookieConsent.test.tsx` N3-5 reads the source with `process.cwd()` and a regex. It breaks if vitest runs from a different working directory. It is fine under the current `npm run test:run`. N3-3 renders a reference `IconButton` into the same document, which `afterEach` cleanup removes. It is slightly redundant, but it works.
7. **Info, a11y/TS.** `Button` and `IconButton` do not default to `type="button"`. The banner is not inside a `<form>`, so there is no impact. TS strict is satisfied: there is no `any`, no assertions, and `Reflect.set` and `Reflect.deleteProperty` stand in for casts in the tests. The semicolons are present.

**Render cost:** unchanged. The components are the same size, there are no new hooks, and the banner mounts only after the 1500 ms timer. The `forwardRef` wrappers add negligible overhead.

**Event ordering:** `onClick` calls `setAnalyticsConsent`, then `setIsVisible(false)`, then `fbq`. This is the same sequence as before, and Close still routes to `handleDecline`. N3-4 and N3-6 cover this.

## Architecture note
- None. No signal appears in this diff. The change swaps raw elements for shared UI components, with no new state or lifecycle and no change of ownership. Keep `CookieConsent` as a single owner of consent UI plus handlers. Extracting anything would be premature. The deferred focus-restore work (finding 3) will add a ref and an effect to the same component, so a checkpoint might be worth it only if that grows beyond about one effect. This is an observation about the diff, not an audit of the module.