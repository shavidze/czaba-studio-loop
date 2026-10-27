# CURRENT TASK — Round 204: hidden focusables, runtime state (C-R202-04 mobile menu, C-R202-05 StudioShowcase reveal, B-R201-HEADER-USERMENU-KEYBOARD)

Decision: **D-29z169** · Planned by B on 2026-10-27 (from 05:20 UTC) · Dispatcher B · Implementer A · Verifier C.

**Read first:** `lessons.md` (loop root). At this planning, L1 gained a "backward entry, keys ≥ 1.2 s apart, check for scroll-lock popups, signed-in seam" clause and L23 gained a "repo-scan tests" clause.

## Baseline: clean HEAD `135b880` (gate 203 published rounds 200–203)
- `git status --short --untracked-files=all` is **empty** at planning (`b-round-203/git-status-at-planning.txt`).
- **Frozen list:** `b-round-203-r204-tree-sha256.txt`, **1035 entries** = every tracked file (1037) minus the 2 grants. From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-203-r204-tree-sha256.txt`.
- **Grants (2):** `b-round-203-r204-grants.txt`. Start copies are in `b-round-203/r204-granted-start/`, hashes in `b-round-203-r204-granted-start-sha256.txt` (both equal HEAD).
- **New files (2):** `b-round-203-r204-new-files.txt`. Neither exists at start.
- **Protected, never touched:** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `.claude/**`, `CLAUDE.md`, and every frozen file. Frozen files include `ScrollReveal.tsx`, `_index.tsx`, `LeadMagnetPopup.tsx`, `useLeadMagnet.ts`, `useScrollLock.ts`, `useSmoothScroll.ts`, `root.tsx`, `store-header-footer.test.tsx` and `e2e/**`.

## 0. Why this round
All three items are pre-existing **Medium** a11y bugs of one class: a keyboard user meets a focusable that is invisible at runtime, or cannot reach one at all. Under the bug gate they come before SYS-1 and STORE-2b. Two of them live in `Header.tsx`. SABA-B-4's own stage rows all passed (done, `135b880`). These runtime-hidden focusables are tracked as their own Mediums, and the store-wide rule "Tab reaches each focusable and its ring is visible" is only fully met once they close.

| Finding | What was measured | Where |
|---|---|---|
| **C-R202-04** | At 375×812 the closed mobile menu leaves 5 tab stops (Collections, Studio, Free Samples, About, Sign In) focused at effective opacity 0 inside a 0-height box. | `Header.tsx` mobile wrapper (`max-h-0 opacity-0 overflow-hidden`) |
| **C-R202-05** | On `/`, two "Browse the Collection" stops sit at effective opacity 0 after 3 s: the CTA link, and a DIV with no role. This happens at 1280 and 375; at 1440, 1 of 3 stops at the first sample. | `StudioShowcase.tsx` |
| **B-R201-HEADER-USERMENU-KEYBOARD** | Signed-in desktop user menu (`opacity-0 invisible group-hover:visible`): My Account, Orders, Downloads and Logout cannot be reached by keyboard (WCAG 2.1.1). | `Header.tsx` user menu |

**B's evidence at planning** (`b-round-203/out/`, tools in `b-round-203/tools/`; HEAD on :5173, scratch copy on :5176, now stopped and deleted):
- **L1 Tab probe** (`tabprobe.cjs`; `/`, `/store`, `/products/middle-east`, `/about`, `/free-downloads`; 375/1280/1440; a stop below 0.99 effective opacity, or not visible, or clipped is re-measured after 2 s):
  - **HEAD** (`tabprobe-head-*.json`): hidden stops are exactly C-R202-04 (5 stops on every page at 375) and C-R202-05 (2 stops on `/` at 375 and 1280). There are no others.
  - **Scratch with the rulings below** (`tabprobe-scratch*-*.json`): **0 hidden stops** on every page at every width.
  - **Stop counts on `/`:** 375: 42 → 36; 1280: 41 → 40; 1440: 41 → 40. `/store` at 375: 18 → 13. At 1280 and 1440, `/store`, product, `/about` and `/free-downloads` are unchanged (23, 16, 20, 11).
- **Cause of the DIV stop** (confirmed fact, not a guess): the `motion.div` around the CTA has `whileTap`. motion-dom's press gesture sets `tabIndex = 0` on any non-button/link target without a `tabindex` attribute (`node_modules/motion-dom/dist/es/gestures/press/index.mjs:76`, `utils/is-keyboard-accessible.mjs`).
- **Cause of the link at opacity 0:** the section uses `setIsInView(entry.isIntersecting)` with threshold 0.3. Focus can land on the CTA while less than 30 % of the 1778 px section is in view. The section also re-hides whenever it scrolls out.
- **Backward entry** (`backward-end.cjs`: End key, then Shift+Tab, 1.2 s settle): on HEAD the CTA stays at effective opacity 0 at 375, 1280 and 1440; on scratch it is 1 at all three.
- **Signed-in menu, browser-testable without a backend** (`usermenu.cjs`, `usermenu-5176-1280.json` vs `usermenu-5173-1280.json`):
  - **Seam:** with `localStorage.auth_user = {"id":7,"firstName":"Ana","lastName":"Test","email":"ana@example.com"}` (no `accessToken`), `AuthContext` sets the user without a network call (`AuthContext.tsx:93-94`), so the signed-in Header renders.
  - **HEAD:** Enter does nothing, and Tab skips the 4 items.
  - **Scratch:** Enter/Space toggle, Tab walks My Account → Orders → Downloads → Logout, Escape closes and refocuses the button, tabbing out closes, an outside click closes, and hover is unchanged.
- **Mobile close animation** (`mobile.cjs`): 100 ms after closing, the links are still visible at opacity 0.95. At 600 ms they are hidden (visibility hidden, opacity 0). The 300 ms fade survives because `visibility` flips at the end of the transition.

## 1. Rulings (recorded in `backlog.json` → `hidden_focusables_rulings_d29z169`; Saba or root may veto)

| ID | Ruling | Why |
|---|---|---|
| **R105** (C-R202-04) | In `Header.tsx`, the mobile wrapper gets `id="header-mobile-menu"`. Its closed class string is `max-h-0 opacity-0 invisible` and its open string is `max-h-[80vh] opacity-100 visible`, with the rest of the classes unchanged. The "Toggle menu" button gets `aria-expanded={isOpen}`, `aria-controls="header-mobile-menu"` and `type="button"`. Nothing else in the mobile menu changes. | `visibility: hidden` takes the links out of the tab order and the accessibility tree. Under `transition-all`, visibility steps at the end when closing, so the fade is kept. React 18 has no typed `inert` prop, so it is rejected (it would need an assertion or a string hack, which is forbidden). Conditional rendering is rejected: it kills the close animation and breaks frozen N2 / N5. Frozen N2 asserts the substring `max-h-0 opacity-0`, which survives. |
| **R106** (B-R201-HEADER-USERMENU-KEYBOARD) | The desktop user menu becomes a **disclosure**: a button with links, not `role="menu"`, so there is no arrow-key contract.<br>(1) State `isUserMenuOpen`, false at start. The button gets `type="button"`, `aria-expanded`, `aria-controls="header-user-menu"`, and `onClick` toggles it (Enter and Space come natively).<br>(2) The panel gets `id="header-user-menu"`. When open: `opacity-100 visible translate-y-0`. When closed: the current `opacity-0 invisible translate-y-[-10px]` **plus the existing `group-hover:` reveal**, kept unchanged.<br>(3) **Closes on:** Escape while focus is inside the wrapper (it also calls `stopPropagation` and focuses the button); focus leaving the wrapper (`onBlur` with `relatedTarget` outside or null); a `pointerdown` outside the wrapper (document listener, only while open); a click on My Account, Orders or Downloads; Logout (which still calls `signOut()` exactly once).<br>(4) Moving focus inside the wrapper (button → items) keeps it open.<br>(5) Add `type="button"` to every other `<button>` in `Header.tsx`. These are pre-existing Biome `useButtonType` warnings; a mobile **Logout** with `type` is fine.<br>**Not in scope:** route-change close (links already close it), arrow keys, focus trap, and the mobile account links (already reachable once R105 is in). | **Hover vs `aria-expanded` (a conscious trade-off, vetoable):** hovering still shows the panel while `aria-expanded` stays `false`. Rationale: mouse behaviour is unchanged, as the user asked only for keyboard reach, and `aria-expanded` truthfully reports the keyboard/click disclosure state that assistive tech uses. Driving the state from hover is rejected: hover-open plus a click would toggle the menu closed under the pointer. Dropping hover is rejected because it changes mouse behaviour nobody asked to change. The remaining WCAG 1.4.13 gap (no Escape for the hover-only reveal) is pre-existing → Low `B-R203-USERMENU-HOVER-ESCAPE` → `deferred_low_polish`. |
| **R107** (C-R202-05) | In `StudioShowcase.tsx`:<br>(1) **Reveal once:** the observer callback becomes `if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); }`. The threshold **stays 0.3**.<br>(2) **Reveal on focus:** `<section onFocus={() => setIsInView(true)}>` (React `onFocus` bubbles from descendants).<br>(3) **Remove the tabbable wrapper:** delete the `motion.div whileHover/whileTap` around the CTA. The `Link` keeps its classes, with `transition-colors` replaced by `transition-[background-color,transform] hover:scale-105 active:scale-[0.98]`.<br>Nothing else changes: not the other motion blocks, not the copy, not `springFast` (still used by the badge and features). | (1) Without once, scrolling out re-hides content that may still hold focus; `ScrollReveal` already defaults to `once`. Threshold 0.3 is kept to minimise the visual change: it is not the keyboard cause, and scroll reveal works at 375 on HEAD (`mobile-5173.json`). (2) This is the actual keyboard fix: focus inside the section reveals it whatever the scroll position. (3) It removes the duplicate, role-less DIV stop, and is Tailwind-first. The CSS transition replaces the spring; the hover lift is kept at scale 1.05. |

**Separate finding, not this round:** **B-R203-LEADMAGNET-AUTO-OPEN-FOCUS (Medium, pre-existing; supersedes the LeadMagnet half of C-R202-06).**
- **Repro** (`popupcheck2-5173-1280.json`, `heightpoll-5173-1280.json`): on `/`, anonymous, press End. The scroll passes the 40 % engagement threshold, and 8 s after load (`SHOW_DELAY_MS`, `useLeadMagnet.ts`) the "FREE DOWNLOAD" popup (keep-list) opens. `useScrollLock` fixes the body (`position: fixed`), so `scrollHeight` 4841 → 720 and `scrollY` → 0.
- **Result:** focus stays on the page and the popup is not announced: it has no `role="dialog"`/`aria-modal`, no Escape and no initial focus. Tab walks the header and page behind the overlay. Any element that had focus is now off-screen.
- **Earlier hypothesis withdrawn:** B first suspected Lenis. A Lenis no-op stub (`lenistrace-nolenis-5173-1280.json`) showed the same jump, and no JS scroll API ran (`scrollculprit-5173.json`).
- **Owner:** `app/components/marketing/LeadMagnetPopup.tsx`. It is keep-list content: add semantics and focus only, never remove or reword.
- **Plan:** scheduled as **round 205**, ahead of SYS-1.
- **In this round:** C suppresses the popup on every row except where noted, by seeding `localStorage.czaba_lead_magnet = {"viewCount":0,"lastResetDate":"2026-10-27","dismissed":true,"submitted":false}` in `addInitScript`. The `dismissed` check runs before the date logic. A popup that appears in any row anyway is listed, not failed.

**Ableton:** does not apply (store header and homepage; no Arrangement counterpart). Compliance status: **არ ეხება**. Do not claim parity.

## 2. A — files you own (everything else is frozen)
**Grants (2):**
- `app/components/layout/Header.tsx`: R105 + R106 only.
- `app/components/home/StudioShowcase.tsx`: R107 only.

**New files (2):**
- `app/lib/__tests__/store-hidden-focusables.test.tsx` (jsdom), rows HF1–HF9 (step 3).
- `docs/implementation/2026/quarter-IV/161-hidden-focusables-runtime.md`, in Georgian per `docs/implementation/TEMPLATE.md`. It covers:
  - R105–R107;
  - the rejected alternatives (`inert`, conditional render, hover-driven state, dropping hover, threshold change);
  - B's probe numbers;
  - B-R203-LEADMAGNET-AUTO-OPEN-FOCUS as TODO.

**Primitives to read first:** `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md` (you only read `useAuth`; the context is protected), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md`.

**Steps:**
1. **Start checks**, from `store/`. If any fails, it is a **STOP** (L11):
   - HEAD is `135b880`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen list and the granted-start hashes check OK;
   - neither new file exists.
2. **Collision grep (L23, already done by B; re-run it):** `grep -rn "Toggle menu\|User menu\|Browse the Collection\|max-h-0" app/**/__tests__ e2e`.
   - **Expected hits:** `store-header-footer.test.tsx` (N2, N5, both stay green) and `e2e/accessibility.spec.ts`, `e2e/responsive.spec.ts`, `e2e/homepage.spec.ts`. The e2e specs are not run by you or the gate.
   - **Known pre-existing failure:** `responsive.spec.ts:80` asserts `toBeVisible()` on the closed 0-height container. It already returns false on HEAD (`e2e-collide` probe: `closedContainerVisible false` on both servers) → Low `B-R203-E2E-RESPONSIVE-CLOSED-ASSERT`, deferred. Do not edit it.
   - **Any other hit** in a frozen file is a STOP.
3. **Implement R105–R107**, then write `store-hidden-focusables.test.tsx`.
   - **Setup:** mock `~/hooks` `useAuth` like `store-header-footer.test.tsx` does (copy the pattern, do not import that file), and mock `~/components/search`. Render inside `MemoryRouter`. Find elements by role and name, or by `id`/`aria-controls`; **no styling-class assertions** (L12).
   - **HF1:** "Toggle menu" has `aria-expanded="false"` and `aria-controls="header-mobile-menu"`. The element with that id contains the mobile nav. After a click, `aria-expanded="true"`. After a mobile link click, `"false"`.
   - **HF2 (signed in):** "User menu" has `type="button"`, `aria-expanded="false"` and `aria-controls="header-user-menu"`, and that id contains My Account, Orders, Downloads and Logout. After a click, `"true"`; after a second click, `"false"`.
   - **HF3:** open, focus My Account, press Escape (`fireEvent.keyDown`) → `"false"`, `document.activeElement` is the "User menu" button, and the keydown did not propagate to a `document` listener added by the test.
   - **HF4:** open, then `focusout` from My Account to Orders → still `"true"`. Then `focusout` from Logout with `relatedTarget` = an outside button → `"false"`. Then `relatedTarget: null` → `"false"`.
   - **HF5:** open, `pointerdown` on `document.body` → `"false"`. Open again, `pointerdown` on Orders → still `"true"`.
   - **HF6:** open, click Downloads → `"false"`. Open, click Logout → `"false"` and `signOut` called exactly once.
   - **HF7:** every `<button>` in the rendered header (anonymous and signed-in) has `type="button"`.
   - **HF8 (StudioShowcase):**
     - Stub `IntersectionObserver` with a class that records the callback, options and a `disconnect` spy.
     - **On mount:** no element inside the section has a `tabindex` attribute, and the section contains exactly one focusable named "Browse the Collection" (a link to `/store`).
     - **Observer:** the threshold is 0.3. A callback with `isIntersecting: true` calls `disconnect`.
   - **HF9 (StudioShowcase, focus reveal):**
     - Set `MotionGlobalConfig.skipAnimations = true` (export of `framer-motion`) in `beforeAll` and restore it in `afterAll`.
     - With an observer that never intersects, `fireEvent.focus` on the CTA link makes the CTA's motion wrapper style `opacity` become `"1"` (read the inline style of the link's parent, which is not a cascade).
     - If skipAnimations does not give a deterministic inline style in jsdom, replace HF9 with a note in the report ("covered by C SHOWCASE-204"). This is **not** a STOP.
4. **Mutants** (on a scratch copy, never in `store/`). Each must turn the listed row red; report the table:
   - m1 drop `invisible` → C's browser row only (jsdom cannot see it; expected green, list it);
   - m2 drop `aria-expanded` on Toggle → HF1;
   - m3 user-menu `onClick` removed → HF2;
   - m4 Escape without `focus()` → HF3;
   - m5 `onBlur` closes on any blur → HF4;
   - m6 the pointerdown listener ignores `contains` → HF5;
   - m7 Logout without `setIsUserMenuOpen(false)` → HF6;
   - m8 the restored `motion.div whileTap` wrapper → HF8;
   - m9 `setIsInView(entry.isIntersecting)` restored → HF8;
   - m10 `onFocus` removed → HF9 (or C).
5. **Self-checks:**
   - `npm run typecheck`;
   - `npm run lint` (no new warnings in the 2 grants; the `useButtonType` warnings in `Header.tsx` go to 0);
   - `npx vitest run app/lib/__tests__/store-hidden-focusables.test.tsx app/lib/__tests__/store-header-footer.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/focus-source.test.tsx`.
   - No full suite and no `npm run verify` (gate rows).
6. **Browser self-check** (Playwright on :5173 + the mock on :5199; `cloud/run.sh` starts the mock from `mock-api/server.mjs`, so start it yourself if `curl :5199/api/products` fails): copy `tabprobe.cjs`, `usermenu.cjs`, `fl.cjs` and `png.cjs` from `b-round-203/tools/` into `a-round-204/tools/` and run them from there, so the output lands in `a-round-204/out/`, not in B's folder. Run `tabprobe.cjs 5173 <W> a204` at 375, 1280 and 1440, and `usermenu.cjs 5173 1280`. Expect 0 hidden stops, and the stop counts and menu sequence from §0. Put the output paths in the report.
7. **code-reviewer** on the 4 files (3+ changed). Fix Low findings in your own files only. Report the Architecture note verbatim; do not act on it.
8. **Report** `a-round-204.md`, plus `a-round-204/end-sha256.txt` over the 2 grants and the 2 new files.

**STOP conditions** (L11: write "STOP — needs B ruling" at the top and change nothing else):
- a start check fails;
- a frozen test turns red;
- an item needs a file outside the grants (e.g. `ScrollReveal.tsx` or `LeadMagnetPopup.tsx`);
- the tab probe still shows a hidden stop after R105–R107.

## 3. C — rows (1440×900, 1280×720 **and** 375×812 where marked; settle ≥ 1.2 s per key on store pages, because Lenis animates 1.2 s; L1)
**Setup:**
- Ref = a tar of `store/` minus node_modules/.git/build/.vite, with node_modules symlinked, the 2 grants restored from `b-round-203/r204-granted-start/`, the 2 new files removed, and its own `cacheDir`, served on :5174. The mock runs on :5199.
- **LeadMagnet suppression** (all rows): seed `czaba_lead_magnet` as in §1, the separate finding.
- **Signed-in seam** for R106 rows: `page.addInitScript(() => localStorage.setItem('auth_user', JSON.stringify({id:7,firstName:'Ana',lastName:'Test',email:'ana@example.com'})))`, with **no `accessToken`**. This is a UI fixture, not auth. It makes no backend call, and G204-3 stays anonymous.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-204** (start and end) | HEAD, `git status`, frozen 1035, grant diffs vs start copies, new files, `a-round-204/end-sha256.txt` | only the 2 grants + 2 new files changed; the diffs are R105–R107 and nothing else; protected files, `.claude` and `CLAUDE.md` unchanged |
| **HIDDEN-204** (375, 1280, 1440) | Tab sweep of `/`, `/store`, `/products/middle-east`, `/about`, `/free-downloads`, both tree and ref; re-measure any stop below 0.99 effective opacity, not visible, or clipped after 2 s | tree: 0 such stops on every page and width; ref reproduces C-R202-04/05; `/` stop counts tree 36/40/40 vs ref 42/41/41 (±0 unless C explains a difference) |
| **MOBILE-204** (375) | Toggle via keyboard (Enter) and via mouse; Tab through the open menu; close; sample at +100 ms and +600 ms; `aria-expanded` each time; screenshots open and closed | open: 5 stops (anonymous) visible at opacity 1, in order Collections, Studio, Free Samples, About, Sign In; at +100 ms still visible (fade kept); at +600 ms visibility hidden and none tabbable; `aria-expanded` false → true → false; closed-state boxes = ref (±1 px) |
| **USERMENU-204** (1280, 1440; seam) | Tab to "User menu"; Tab once more with it closed; Shift+Tab back; Enter; Tab ×4; Escape; Space; Space; Enter then Tab out past Logout; hover then unhover; mouse click open + move away; click outside; click Orders | closed: the next Tab skips the 4 items; Enter/Space open (`aria-expanded` true, panel visible, opacity 1); Tab order My Account → Orders → Downloads → Logout, each with the solid 1px brass ring (round-202 rule); Escape closes and focus is on the button with the ring; tabbing out closes; hover shows and unhover hides (= ref); click-open stays open after the pointer leaves; an outside click closes; a click on Orders closes and navigates; ref: Enter does nothing (before-picture) |
| **SHOWCASE-204** (375, 1280, 1440) | (a) forward Tab to the CTA from the top; (b) End key, then Shift+Tab to the CTA (1.2 s settle, popup suppressed); (c) scroll-only reveal (no keyboard); (d) hover and press on the CTA; (e) scroll the section fully out and back after the reveal | (a), (b): the CTA effective opacity is 1 within 1.5 s, with one stop named "Browse the Collection" in the section (the DIV is gone); (c) reveal at the same scroll point as ref (±1 frame of the spring); (d) hover transform ≈ scale(1.05), press ≈ 0.98, background brand-hover; (e) stays revealed (does not re-hide). With the popup suppressed, (b) the CTA must also be on screen; if it is not, list it with its ref result (L24) |
| **NO-SHIFT-204** (375, 1280, 1440) | box diff of the header, the mobile menu closed, and the showcase CTA block, tree vs ref | 0 diffs beyond ±1 px, except the removed wrapper DIV (its Link box must equal ref ±1 px) |
| **RING-204** (spot) | keyboard-focused ring on Toggle menu, a mobile link, User menu, My Account and the CTA | solid outline ≥ 1px painted, offset 2px, brass, no box-shadow, bg or border change; contrast vs the background ≥ 3:1 (L24: ref-identical elements listed the same way) |
| **T-RUN-204** | the 4 targeted test files on a tree copy; HF1–HF9 on the start copy. Expected: HF1–HF7 and HF9 red; HF8 red on its tabindex and disconnect assertions, green on "threshold is 0.3"; A's mutant table re-run plus at least 1 C mutant | targeted green on the tree; each mutant reds its row as listed (m1 expected green, browser only); any green mutant that should be red = FAIL |
| **AN-REVIEW-204** | added lines: no `as`, `any` or `@ts-ignore`, no hex, no custom CSS; doc 161 in Georgian with R105–R107, the rejected alternatives and the TODO | all true |
| **G204-3** | fresh contexts at 1440 and 1280: `/studio-lab` opens anonymously (demo collection); `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` returns 401 without a header and 403 with a fake Bearer | all true; 0 forbidden requests |
| **gate** | full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | not claimed by C (root gate) |

**Not in scope for C failures:**
- the LeadMagnet auto-open focus issue (B-R203-LEADMAGNET-AUTO-OPEN-FOCUS, round 205);
- CommandPalette Escape focus restore (C-R203-02, Low, deferred);
- the AuthModal focus trap (`shared-modal-no-focus-management`).
Report new findings with severity; Lows go to `deferred_low_polish`.

## 4. Adjacent behaviour that could break (C probes it, A guards it)
- the cart badge animation and the cart link;
- Sign In (desktop and mobile) still opens the modal once;
- the CommandPalette button stays reachable;
- desktop nav underline active state (N4);
- the mobile menu link click still closes the menu (N2);
- the homepage Latest Releases "Browse the Collection" (the `_index.tsx` ScrollReveal link, stop 24) is unchanged;
- the StudioShowcase badge, heading and feature cards animate as before on scroll.

## 5. Publication
On C PASS, root publishes round 204 against `135b880`: the 2 grants and the 2 new files.
