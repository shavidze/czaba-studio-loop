COMMIT: OK

The change only swaps internal `<a href>` for Remix `<Link>` and adds a small focus helper. Nothing in it touches auth, purchase, download, token or checkout code. `Footer` is also rendered in `checkout.success` and `checkout.cancel`, but only its link elements changed. I read the diff, the new files and `verify.log` (lint warnings only, such as the existing `ScrollReveal` key warning). I did not run the app in a browser, so real-browser event ordering is judged from the code and the round-479 C result, not observed.

## Findings (ranked)

1. **Medium, accessibility regression (known and documented).**
   - Client navigation no longer announces the new page title to screen readers, which a full reload used to do.
   - The implementation doc already tracks this as SIG-R479-ROUTE-ANNOUNCE (item 2 under "HEAD-ისგან განსხვავებები").
   - The fix belongs in `root.tsx` (a route announcer), which is outside this scope.
   - It is acceptable to commit only if that item stays on the backlog. The `root.tsx` change should follow soon, because 13 links are now affected.

2. **Low, `app/lib/link-focus.ts:14-21`.**
   - `click` also fires on keyboard Enter, so a keyboard user's next Tab starts from the top of the document, as it did after a reload. This is the intended behaviour.
   - There are no listeners or timers, and the `tabindex` is removed synchronously, so nothing can leak.
   - If the click handler throws between lines 18 and 20, `tabindex=-1` would stay on `body`. Wrapping lines 19-20 in `try/finally` would remove that risk. It is optional and the risk is very small.

3. **Low, `app/lib/__tests__/store-internal-links.test.ts:51-55`.**
   - `isInternalHref` only detects `href="/…"` and `href={viewAllLink|ROUTES.x}`.
   - A future internal link written as `` href={`/x/${id}`} `` or `href={someVar}` would pass IL1 silently.
   - Fix: also flag any `<a` whose `href={…}` is not an `https:` or `mailto:` literal, and review those cases by hand.

4. **Low, behaviour change (documented).**
   - Clicking the footer link for the page you are already on now scrolls to the top instead of reloading (item 3 in the doc).
   - `/license`, linked from the footer and from `terms.tsx:70`, still has no route. It was already a 404 on HEAD, so it is not a regression (B-R478-DEAD-LICENSE-LINK is awaiting Saba). With `Link` the 404 now renders client-side through `$.tsx`.

## Checked and clean
- **Router context:** every non-test `Footer` usage is inside `app/routes/*`, and `CookieConsent` is a root child, so there is no `Link` outside a router.
- **Render cost:** `Link` without prefetch adds no network or render cost.
- **Tailwind/tokens:** classes are unchanged, with no new CSS or hardcoded colours.
- **TypeScript:** no `any`, suppression directives or type assertions.
- **`Link` `onClick` typing:** `releaseLinkFocus` is typed with `MouseEvent<HTMLAnchorElement>`, which matches `Link`'s `onClick`.
- **Modifier clicks:** Ctrl, Meta, Shift, Alt, middle button and `defaultPrevented` are guarded and covered by LF3.
- **CookieConsent:** the privacy link deliberately has no focus release because the banner stays mounted. IL4 locks this in.

## Architecture note
- **Signal (mixed responsibilities / repeated wiring):** `releaseLinkFocus` is attached by hand in 13 places across `Footer.tsx:40-67`, `ProductSection.tsx:67`, `faq.tsx:168`, `privacy.tsx:334` and `terms.tsx:72`. A source-text test (IL2) is currently the only guard, and it is the brittle part (finding 3).
- **Keep for now.** That is one small helper, and it has focused tests.
- **Proposal for the planner (one bounded task):** add an `InternalLink` wrapper in `app/components/ui` that wraps Remix `Link` with `releaseLinkFocus` by default and an opt-out prop for `CookieConsent`. Then migrate the 13 call sites and replace the IL1/IL2 text scanning with render tests.
  - **Cost:** low.
  - **Risk:** low, but it should wait until the route-announcer work in `root.tsx`, so one owner handles navigation behaviour.
  - **Not for this round.**

This note covers the diff only and does not claim a full module review.