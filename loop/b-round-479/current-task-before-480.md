# Round 479: DPG-FOOTER-LINKS. Store internal links navigate inside the app (DPG P1)

**Planned by:** B, at the round 478 → 479 planning on 2026-11-12 (`b-round-478.md`).
- **Advisor:** available. Consulted twice: after orientation, and before hand-off. The second pass found that the focus helper also fired on Ctrl/middle clicks that do not navigate. Both passes are closed below.
- **Archive:** the round-478 task is `tasks/round-478.md` (byte-identical, `cmp`).
- **Regression is not due.** `date -u` was 2026-11-12 20:58, and `regression-last.json` says on or after 2026-11-13.

**What this round is:** DPG-FIX P1 item 3, "Change `<a>` to `<Link>` in Footer.tsx (full page reload kills premium feel)". The scope is widened to the same root cause: a full document reload on an internal Store link. Nothing on screen changes. What changes is that the page no longer reloads, so the entrance cover, fonts and app state are not re-fetched or re-run.

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1695, round 478 result:**
  - C PASS. `browserVerified`/`realVerified` are true. Gate 478 published `75a6028`.
  - DPG-DOCS-UPDATE is C-verified and **awaits the DP gate**. DPG P0 is complete on C evidence, so root re-runs the DP gate.
  - C-R478-01 → `deferred_low_polish`.
- **D-29z1696, rulings on A-478's open review items:**
  - H2 is accepted.
  - M3, L9 and L11 → Low B-R478-BANNER-DATE (origin: B spec), deferred.
  - M4 and gate finding 3 → input to DPG-COLOR-CONSOLIDATE (SIG-R478-COOL-NEUTRAL-HUE).
  - L6 extends SIG-R478-AWWWARDS-GLOW.
  - The `direction-decision.md:18` misquote → Low B-R478-DD-QUOTE.
  - The gate's checker-as-CI note → SIG-R478-DOC-TOKEN-CHECKER-CI. It is not tasked.
- **D-29z1697, scope and P1 order:**
  - **Order.** DPG-LOGO's serif half is `awaiting_user`. DPG-BUTTON-CLEANUP needs `app/styles/app.css`, which is globally forbidden and needs a narrow grant, plus a Button migration across six files and a product-designer pass, so it is the next P1 round. FOOTER-LINKS depends on neither.
  - **Inventory.** It covers every `<a` tag in `app/**`, parsed as whole tags.
  - **In scope:**
    - Footer: 9 links;
    - `CookieConsent` → `/privacy`;
    - `ProductSection` "View all" → `/store` (home);
    - `privacy.tsx` → `/cookies`;
    - `terms.tsx` → `/license`;
    - `faq.tsx` "Contact Us" → `/hire-us`.
  - **Ruled out:**

    | Link | Reason |
    |---|---|
    | `ErrorBoundary` "/" | A full reload is the error recovery |
    | `UserDropdown` | Imported nowhere (SIG-R479-USERDROPDOWN-DEAD) |
    | `SignUpForm` | Inside the auth modal, which would stay open (SIG-R479-AUTH-MODAL-LINKS) |
    | `account.orders` `/music` | Dead target (B-R478-DEAD-MUSIC-LINK) |
    | `account.downloads` | Protected |
    | Every `mailto:` and `https:` link | Not internal |
- **D-29z1698, the focus contract (L47).** A client navigation keeps the document, so Chrome keeps the sequential-focus start at the link that unmounted.
  - **Measured on B's sketch dev server:** after Enter on footer "Support", the first Tab lands on the `/support` "Live Chat" button. At HEAD (full reload) it lands on the header logo.
  - `blur()` does not fix it. Focusing `document.body` does: a temporary `tabindex=-1`, `focus({ preventScroll: true })`, then the attribute is removed. The first Tab is then the header logo at both viewports, for footer and in-page links.
  - The helper acts **only on a plain primary activation**. With Ctrl, Meta, Shift or Alt held, a non-zero button, or `defaultPrevented`, it does nothing: the browser opens a new tab and focus stays on the link, as at HEAD (`b-round-478/probe/modifier-sketch.json` vs `modifier-head.json`).
  - **Implementation:** the shared helper `releaseLinkFocus` in `app/lib/link-focus.ts` (a 3-word name, per `AGENT_DISCOVERABLE_CODE.md` rule 1), used on every route-content Link. It is not a duplicate of `app/lib/focus-source.ts`, which tracks pointer vs keyboard focus for `:focus-visible`.
  - **Exception:** the persistent CookieConsent banner link stays mounted, so it does **not** use the helper.
- **D-29z1699, new findings:**
  - **B-R478-DEAD-LICENSE-LINK (Medium, `awaiting_user`).** Footer "License" and the Terms link go to `/license`, which has no route; the 404 page renders with HTTP 200. Licence copy is legal content, so it goes to Saba (`user-review/questions-round-478.md` Q1). This round keeps the target and only makes the link client-side; C records the 404 and does not FAIL on it.
  - **B-R478-DEAD-MUSIC-LINK (Medium).** Scheduled later.
  - **B-R478-SOFT-404 (Low).** Deferred.

## Reference: how the reference does it
This is a navigation behaviour on a Store page. The reference is the current Store itself (full reload, measured) and the framework's documented Link behaviour. There is no Ableton reference (Store).

| Point | Source | Confirmed behaviour | CZABA after this round | C row |
|---|---|---|---|---|
| Internal navigation | Remix 2.13.1 `<Link>` docs, https://remix.run/docs/en/2.13.1/components/link (the version from the dev server log; B did not open the page this round, so the doc is a pointer, not evidence). Measured instead: `b-round-478/probe/modifier-head.json` and `modifier-sketch.json` | **Measured:** a `<Link>` click changes the path with no reload (marker alive). Ctrl+click, Ctrl+Enter and a middle click open one new page and leave the current page, path and focus unchanged, at HEAD and on the sketch | All in-scope links use `<Link to>`. The href is unchanged | C5, C8, C9 |
| Scroll after navigation | Remix `<ScrollRestoration>` in `root.tsx`; B measured HEAD's existing header `<Link>`s and the sketch (`b-round-478/probe/nav-final-*.json`) | A new location lands at `scrollY 0` (400 ms and 3 s), with Lenis on. One wheel step afterwards moves about 171–200 px, with no jump back | Same as the full reload: `scrollY 0` | C5, C7 |
| Focus after navigation | HEAD full reload (`nav-final-5173.json`) | After the reload, focus is on `body` and the first Tab is the header logo `a[href="/"]` | Same (D-29z1698) | C6 |
| Same-route click | Measured: footer "FAQ" on `/faq` from the page bottom (`modifier-*.json`) | HEAD reloads and Chrome restores `scrollY` ≈ 2158 (1440) | The sketch lands at `scrollY 0` (deviation 3) | C5 |
| Persistent chrome | Measured: CookieConsent is rendered by `root.tsx` and is not unmounted by navigation | The banner stays until a decision is made | Its Privacy link navigates client-side; the banner stays, and so does focus on the link | C10 |

**Deviations from HEAD:**
1. **No document reload.** This is the item's purpose (DPG-FIX P1 "full page reload kills premium feel").
2. **The new page title is not announced.** A reload makes screen readers announce the new page title; a client navigation does not. Fixing that needs a root-level route announcer in `root.tsx`, which is root-only. It is recorded as SIG-R479-ROUTE-ANNOUNCE and is not tasked here.
3. **A same-route click goes to the top.** Clicking the link of the page you are on now scrolls to the top instead of reloading in place. That is the common single-page-app result of clicking the current page's link; the reload's restored position is a side effect, not a design.

## Rules
- **Read `lessons.md` first,** in particular L12 (no class selectors in tests), L13 (whole-tag guards), L23, L29, L47, L52, L56 and L58.
- **Claims (L29):** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-478/claims-479.sh`. B's output at HEAD is `b-round-478/claims-479-planning-output.txt`, and on the sketch it is `claims-479-sketch-output.txt`.
- **Sketch (L58):**
  - The sketch is `b-round-478/sketch-479/`: 11 files, with hashes in `sketch-479.sha256` and the diff against HEAD in `sketch-479.patch.txt`.
  - It is Biome-formatted, `tsc` rc 0 on a scratch copy, and all 162 tests in the 10 covering files pass (`sketch-vitest-final.log`).
  - A may apply it as is. Any byte difference from the sketch is listed in `a-round-479.md` with its reason (K10).
- **Screen budget (L39):** nothing visible changes. There is no new text, class or element. `onClick` handlers and the element type change only.
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md` (new export `releaseLinkFocus`), `FORWARDREF_COMPONENT.md` (components touched), `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests), and `GEORGIAN_DOCS.md` (doc 311).

## Baseline
- **HEAD `75a6028`** (gate 478 published). The working tree is clean [K7: 0 lines].

### Grants (exactly these 12 paths)
| Path | What |
|---|---|
| `app/components/layout/Footer.tsx` | All 9 `<a href={ROUTES.*}>` become `<Link to={ROUTES.*} … onClick={releaseLinkFocus}>`. Text, classes and order are unchanged. `Link` comes from `@remix-run/react` |
| `app/components/common/CookieConsent.tsx` | The Privacy Policy `<a href="/privacy">` becomes `<Link to="/privacy">` with the same classes and **no** focus helper |
| `app/components/home/ProductSection.tsx` | The "View all" `<a href={viewAllLink}>` becomes `<Link to={viewAllLink} onClick={releaseLinkFocus}>` |
| `app/routes/privacy.tsx`, `app/routes/terms.tsx`, `app/routes/faq.tsx` | The one internal `<a>` in each (`/cookies`, `/license`, `/hire-us`) becomes a `Link` with the helper. `mailto:` and `https:` links stay `<a>` |
| `app/lib/link-focus.ts` (new) | `releaseLinkFocus(event)`: on a plain primary activation only (no modifier, button 0, not `defaultPrevented`), focus `body` with `preventScroll`, adding a temporary `tabindex=-1` only when the body had none, then removing it |
| `app/lib/__tests__/link-focus.test.tsx` (new) | LF1, LF2 and LF3 (Ctrl, Meta, Shift, Alt and middle-button clicks keep focus on the link) |
| `app/lib/__tests__/store-internal-links.test.ts` (new) | IL1 (6 files), IL2 (4 targets carry the helper), IL3 (the scanner mutant), IL4 (the CookieConsent link has no helper) |
| `app/lib/__tests__/store-header-footer.test.tsx` | F1 renders inside `MemoryRouter`, with **no assertion lost**. Add F2 (9 links: router navigation + focus on `body`, no tabindex left) and F3 (exactly the 9 internal links in order) |
| `app/components/common/__tests__/CookieConsent.test.tsx` | The `@remix-run/react` mock keeps the real module (`importOriginal`) and overrides only `useLocation`. Renders use `wrapper: MemoryRouter`. CC1–CC5 are unchanged, with no assertion lost. Add CC6 (the Privacy link has href `/privacy` and the Remix Link marker `data-discover="true"`) |
| `docs/implementation/2026/quarter-IV/311-dpg-footer-links.md` (new) | TEMPLATE headings in order; l.4 exactly `**სტატუსი:** Completed (C round 479 PASS)`. It names D-29z1697…D-29z1699 and the focus measurement, and cites only test ids that exist (L26) |

**Everything else is unchanged:**
- `app/root.tsx`, `app/styles/**`, the auth components, every protected file, `public/**` and `.claude/**`;
- every other route and component.

`ErrorBoundary`, `SignUpForm`, `UserDropdown` and `account.*` stay `<a>` (D-29z1697).

## 1. A: steps
1. **STOP (L11)** if `claims-479.sh` K1–K9 differ from `b-round-478/claims-479-planning-output.txt` before your first edit.
2. **Apply the sketch:** copy the 11 files from `b-round-478/sketch-479/`, or write the same change yourself. Then write doc 311.
3. **Checks:**
   - `npm run typecheck`;
   - `npm run lint`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-478/covering-candidates.txt) app/components/common/__tests__/CookieConsent.test.tsx app/lib/__tests__/store-internal-links.test.ts app/lib/__tests__/link-focus.test.tsx`.

   The expected result is 10 files and 162 tests, all passing. The full suite belongs to the gate.
4. **Claims:** run the script and save it to `a-round-479/claims.txt`.
5. **Code-reviewer:** run it once (12 files). Report Medium+ findings; an unruled Medium is a STOP (L10).
6. **Report** in `a-round-479.md`.

## 2. C: what to verify
Write `c-round-479.md`, `c-round-479.json` (with all L57 fields; `mutantRedOnSketch` = `b-round-478/mutant-*.log`) and `c-round-479/progress.json` as you go.

**Browser setup.** Seed `localStorage.czaba_lead_magnet` as dismissed and submitted, as in `b-round-478/probe/nav-probe-sketch.mjs`, except in C10 and C13. Wait at least 3.5 s after `networkidle` for hydration. Use B's probe script as a starting point, not as evidence.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all` | Exactly the 12 granted paths. K8 `0` |
| C2 | CLAIMS | `bash b-round-478/claims-479.sh` | K1 `HEAD 75a6028`. K2 `footer-anchor-routes 0 footer-to-routes 9`. K3: each of the 5 lines `href… 0 to… 1`. K4 `license:0 collections.music:0`. K5 `exists`, with the 5 files `ProductSection Footer faq privacy terms`. K6 all `exists`. K7 12 lines. K8 `0`. K10 `0` (or each differing file is explained in `a-round-479.md`) |
| C3 | TESTS | The A step-3 vitest command | 10 files, 162 tests, 0 failed. F1 and CC1–CC5 keep every original `expect` (diff the test files: no removed `expect(` line) |
| C4 | TESTS MEAN SOMETHING | On your own copy of the whole tree, made the way B's scratch was (store minus `.git`, `docs` and `public`, with `node_modules` and `public` symlinked, so the vitest config is present): (a) restore HEAD's 6 source files; (b) turn the CookieConsent Link back into `<a>`; (c) turn footer Support back into `<a>`; (d) make the helper a no-op; (e) remove `onClick` from `faq.tsx`; (f) delete the helper's modifier guard. Run the 4 test files `store-header-footer`, `CookieConsent`, `store-internal-links` and `link-focus` | Each run is red: (a) 21 failed; (b) 3 (IL1, IL4, CC6); (c) 2 (IL1, F2-Support); (d) 11 (LF1, LF2, 9× F2); (e) 1 (IL2-faq); (f) 5 (LF3). Then the real tree is green again. B's logs: `b-round-478/mutant-*.log` (`baseline-sources`, M1–M5) |
| C5 | NO RELOAD, SCROLL TOP | At 1440×900 and 1280×720: on `/faq` and on `/`, wheel to the bottom, set `window.__probeMarker`, then mouse-click footer "Support". Also on `/faq`, click footer "FAQ" (same route) | The path is `/support`, the marker survives, and `scrollY` is 0 at 400 ms and at 3 s. Same route: the path stays `/faq`, the marker survives and `scrollY` is 0 (deviation 3). **Control at baseline** (or B's `nav-final-5173.json`): the marker is lost |
| C6 | FOCUS START (L47) | At both viewports: (a) focus footer "Support" with the keyboard and press Enter; (b) the same with `/faq` "Contact Us"; (c) mouse-click footer "Support" | After each: `document.activeElement` is `BODY`, `body` has no `tabindex`, `body` does not match `:focus-visible` (no visible ring), the first Tab focuses the header logo `a[href="/"]`, and the marker survives |
| C7 | NO SCROLL JUMP-BACK | After C5, one mouse-wheel step of 200 | `scrollY` ≤ 250 (B measured 171 at 1440 and 200 at 1280) |
| C8 | EVERY TARGET | At 1440×900, from a page whose layout includes the footer: click each of the 9 footer links, plus privacy → Cookie Policy link, terms → License page, faq → Contact Us, and home "View all" | Each one changes `location.pathname` to its href with the marker alive. `/license` shows the 404 page; record it under B-R478-DEAD-LICENSE-LINK, it is not a FAIL |
| C9 | MODIFIER CLICK | At both viewports, from `/faq` scrolled to the bottom: (a) Ctrl+click footer "FAQ"; (b) focus it and press Ctrl+Enter; (c) middle-click it | Each opens exactly one new page at `/faq`. The current page keeps its path, `scrollY` and marker, and **focus stays on the link** (`document.activeElement` is that `a`), as at HEAD (`b-round-478/probe/modifier-head.json`) |
| C10 | COOKIE BANNER | A fresh context with no consent decision and LeadMagnet seeded: wait for the banner, then click "Privacy Policy" | The path is `/privacy`, the marker survives, the banner is still visible with Accept and Decline, and no consent is stored |
| C11 | AUTH + STUDIO OPENS | `/studio/middle-east` anonymous; `/api/studio-token?product=middle-east&file=x` with no bearer; `/studio-lab` in a fresh context at 1440×900 and 1280×720 | "Sign in required" with 0 audio `src`; 401; `/studio-lab` opens as the demo. The real-owner path is BLOCKED (backend unavailable in cloud) |
| C12 | DOC 311 | Headings, l.4, D-IDs, test ids | TEMPLATE headings in order; l.4 exact; it names D-29z1697…D-29z1699; every test id it names exists (grep) |
| C13 | LEADMAGNET AFTER CLIENT NAV (record) | A fresh context, LeadMagnet **not** seeded: on `/`, scroll more than 40 %, client-navigate via footer "FAQ" within 8 s, then wait 10 s | Record whether the popup opens on `/faq`, and compare with HEAD (a reload restarts the 8 s timer). Not a FAIL row. A popup that opens over a page where it is excluded (`/products/*`, `/cart`, `/checkout*`) would be a bug |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- tests that render these components without a router (C3);
- hydration on content routes (C5, C8);
- the persistent cookie banner (C10);
- the LeadMagnet timer across client navigation (C13);
- browser default behaviour for modifier clicks (C9).

## 3. After this round
1. **On C PASS:** DPG-FOOTER-LINKS is C-verified. It awaits the P1 DP gate (DPG rule 4), so it is not მზადაა until then.
2. **The next planning:**
   1. **REGRESSION-2026-11-13** (due on or after 2026-11-13);
   2. **RETRO 480**;
   3. DPG-BUTTON-CLEANUP;
   4. then the rest of P1 and any DP-gate findings root files.
3. **Saba:** `user-review/questions-round-478.md` (the License page and the `/music` links).
4. **Root, non-blocking:**
   - ROOT-REQ-DPG-PRIMITIVES-PATCH (before the DP-gate re-run);
   - the DP-gate re-run after P0;
   - ROOT-REQ-NAV-LOADING-BAR-RENDER.
