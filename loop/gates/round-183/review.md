COMMIT: OK

## Code Review: `CookieConsent.tsx` + `CookieConsent.test.tsx` + docs 150/151 (round 183, M4)

This review covers the diff and the place it is used (`app/root.tsx:161`). The analytics module was not reviewed in full.

**Scope checks**
- **Auth, purchase and download code:** none of it is touched. `handleAccept`, `handleDecline` and the `fbq` calls are unchanged.
- **Verify log:** 179 files and 2629 tests pass, including `CookieConsent.test.tsx` (8 tests). `tsc --noEmit` passes and the build passes. Biome's warnings were already there before this round.

### Critical Issues
- None.

### Suggestions (ranked; none blocks the commit)
1. **`CookieConsent.tsx:73,79,88`:** three `<button>`s have no `type="button"`. Biome already flags `useButtonType` across the project.
   - **Fix:** add `type="button"` to all three.
   - This is outside M4's scope and should be its own small cleanup task.
2. **`CookieConsent.tsx:54-57,81`:** an inline `style` sets the rgba gradient and `backdropFilter`, and `bg-white text-black hover:bg-neutral-100` are hardcoded colours. Both break the Tailwind-first rule and the design tokens.
   - These were already there. Doc 151 L19 leaves them out of scope on purpose.
   - **Fix (later round):** a token-based class such as `bg-gradient-to-t from-black/95 to-black/90 backdrop-blur-md`, and a brand token for Accept.
3. **`CookieConsent.test.tsx:29,64`:** CC1 checks the exact root class string. This is on purpose: it replaces a Store screenshot. The cost is that any later class change, even a harmless one, will make CC1 fail. The test name or the doc should say so, so the next person knows why it failed.
4. **`docs/implementation/2026/quarter-IV/151-...md:4`:** the status still says "In Progress (awaiting C round 183)" even though C has passed. Doc 150 in this same diff was switched to Completed one round late, so this follows the existing pattern. It is a process note only.

**Real-browser behaviour (tests can't prove this)**
- **Hydration:** `isVisible` is `false` both on the server and on the first client render, whatever the route. There is no mismatch. `useLocation` returns the same `pathname` on both sides.
- **Timers and listeners:** nothing new is added. In the Studio, the existing 1500 ms timer still starts, fires once and leads to a `null` render. The cleanup (`clearTimeout`) is unchanged. Nothing leaks.
- **Render cost:** no extra cost. `CookieConsent` is an unmemoised child of `AppContent`, which already subscribes to `useLocation` (`root.tsx:130`), so it already re-rendered on every navigation.
- **Leaving the Studio:**
  - **Client-side `<Link>`:** the banner appears straight away, because the component stays mounted (R45 intent).
  - **Full reload:** a new mount, so the banner appears after 1500 ms again.
  - **Small side effect:** because of `AnimatePresence mode="wait"`, the banner can show while the Studio page's exit animation is still running. This is cosmetic and doesn't block.
- **Path prefix:** `startsWith('/studio')` also matches future routes like `/studios`. It is the same rule as `root.tsx:137`, so the behaviour is consistent.

### Good Practices Found
- **Accessibility gain:** the `fixed bottom-0 z-50` overlay no longer covers the Studio's `aria-live` status line or its shortcut hint bar. Pointer events and screen-reader order there are no longer blocked.
- **Hooks:** they run on every render, in the same order, before any `return`.
- **Size:** only 3 lines changed. No new prop, context or export, and `root.tsx` is byte-identical.
- **Mocks:** `vi.hoisted` avoids the TDZ problem with hoisted mocks. Tests find elements by role.
- **Navigation cases:** CC4 and CC4b cover moving between the Studio and the Store in both directions, and check that consent is not set by accident (`setConsent` is not called).
- **Strict TS:** no `any`, no type assertions, semicolons present.

### Architecture note
- **Coupling signal (mild): `CookieConsent.tsx:16`** repeats `root.tsx:137` (`pathname.startsWith('/studio')`). A global overlay now decides for itself which route it is on.
  - **Keep:** it is two one-line checks, `root.tsx` is frozen, and the behaviour is meant to be identical. The cost of keeping it is low.
  - **Proposal for the planner (not this round):** once `root.tsx` is unfrozen, add one `isStudioPathname(pathname)` in `~/lib` and use it in both places, or have `AppContent` pass a `hidden` prop.
  - **Acceptance:** CC1-CC5 stay green, and the root-level Header and AudioPlayer hiding is unchanged.

### Alternative Approach
- **Current:** the component checks the route itself with `useLocation` and stays mounted. The timer keeps running, so when the user leaves the Studio for a Store page the banner appears straight away (R45).
- **Alternative:** `{!isStudioPage && <CookieConsent />}` in `root.tsx:161`. This gives one source of truth and no repeated check. But it unmounts the banner in the Studio and remounts it on the Store. The timer then starts again and the banner appears after 1500 ms instead of straight away, which changes R45. It would also edit the frozen `root.tsx`.
- **Verdict:** the current approach is right for this round. The root-level version only makes sense if R45 (ask again immediately) is renegotiated with Saba.

### Score: 9/10