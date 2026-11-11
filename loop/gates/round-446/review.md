COMMIT: OK

Nothing blocks this commit. I read the diff, the full text of the three hooks and the popup, the new test file and the implementation doc, and the call sites in `app/root.tsx`. I did not run a browser. The browser results come from C's round 446 PASS, and `verify.log` shows 4105 tests passed. The specific scroll-restore order in the first finding is my own reading of the code.

**Scope:** None of the changed files touch auth, purchase, download or token code. `cart` and `checkout` appear only as pathname strings in `isLeadMagnetExcludedPath`. `useScrollLock`'s other callers, `ui/Modal.tsx:66` and `AuthModal.tsx:35`, still use the default `restoreScrollOnUnlock = true`, so they behave as before.

**Event ordering and leaks**
- When a route change hides the popup, the render has `isRouteExcluded` true and `shouldShow` masked to false. The `restoreScrollOnUnlock` ref is written during that render, before any effect cleanup. The old lock's cleanup therefore reads `false` and skips `scrollTo`, which fits the Back-navigation case in the implementation doc.
- The `useLeadMagnet` effect re-runs when `isExcludedRoute` changes. Its cleanup clears the timer and both listeners. On an excluded route it returns early without registering anything, so there are no leaks.
- `hasScrolled` lives inside the effect closure, so it resets on every re-run. That is the intended "scroll on an excluded page doesn't carry over" behaviour. The allowed-to-allowed carry-over (LMR8) works because `isExcludedRoute` doesn't change, so the effect doesn't re-run.

**Findings, ranked (all non-blocking)**
1. **Low. `app/hooks/useScrollLock.ts:22-23`.** The ref is assigned during render. It works and the tests cover it, but it relies on the render running before the cleanup, which is the pattern React discourages under concurrent rendering. Fix, only if you want it cleaner: assign the ref in a layout effect, or have the caller pass the flag through effect dependencies. This is not needed for this commit.
2. **Low. `app/root.tsx:147-153`.** The popup is unmounted on `/studio`, not hidden. If the popup is open on `/` and the user goes to `/studio`, the unmount cleanup runs with the flag `true` and calls `scrollTo` with the old position. That was already the behaviour before this commit and is out of scope here. Fix: pass `isRouteExcluded`-style logic for `/studio` as well, in a later round.
3. **Low. `app/hooks/useLeadMagnet.ts:25`.** The comment says "Max 2 views" but the constant is 10. This is already tracked as `SIG-R446-LEADMAGNET-CAP-COMMENT` and waits on a decision from Saba.
4. **Info. `app/hooks/useLeadMagnet.ts:88`.** `useLocation` now makes the hook require a Router context. The only production call site is inside `AppContent`, which is inside the Remix router, so that is fine. Any future test or Storybook render of `LeadMagnetPopup` without a router will throw.
5. **Info. `app/lib/__tests__/store-lead-magnet-routes.test.tsx:1-6`.** The tests use `react-router-dom`'s `MemoryRouter` while the hook imports `useLocation` from `@remix-run/react`. This works because Remix re-exports the same React Router context, but it depends on the two resolving to a single instance.

TypeScript strict shows no problems: no `any`, no suppressions and no type assertions in the diff. Accessibility and Tailwind are unchanged because the popup's markup and classes weren't touched. The cost per render is one string comparison.

### Architecture note
- Signal: new state and lifecycle in an existing owner, at `app/hooks/useLeadMagnet.ts:88-100`. Route awareness joins the existing scroll, timer, view-count and submit logic in one hook. The popup's local `email` and `validationError` state (`LeadMagnetPopup.tsx:21-22`) is not reset by a route hide. That is already tracked as `TL-R446-L3-LOCAL-STATE`.
- Keep it. It's a single lifecycle, and it was done in the hook because `root.tsx` is a protected file. Splitting it would add prop plumbing and wouldn't make the behaviour any easier to test.
- Proposal for the planner, to run only if more exclusion rules or popups follow: a bounded task to move the route-exclusion list into one shared module such as `lib/overlayRoutes`. Acceptance would be that LMR1 keeps passing and the `useScrollLock` public signature stays unchanged. This is a proposal, not a fix for this round.

This is a review of the diff only. It doesn't claim the whole module was audited.

### Score: 9/10