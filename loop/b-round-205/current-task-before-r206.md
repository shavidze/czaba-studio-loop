# CURRENT TASK — Round 205: LeadMagnet popup as a real dialog (B-R203-LEADMAGNET-AUTO-OPEN-FOCUS), scroll lock keeps the page position (B-R204-SCROLLLOCK-POSITION-LOST), gate-204 fix-up (GATE204-B1)

Decision: **D-29z170** · Planned by B on 2026-10-27 (from 07:50 UTC) · Dispatcher B · Implementer A · Verifier C.

**Read first:** `lessons.md` (loop root). The previous task is `tasks/round-204.md` (an exact copy). B's rationale is in `b-round-204.md`.

## Baseline: HEAD `135b880` plus the round-204 work (gate 204 **blocked**, not published)
- `gates/gate-round-204.json`: status `blocked`, reason "reviewer did not return COMMIT: OK", head `135b880`. `verify.log` is green (194 test files, Biome clean, build OK). The only blocker is `gates/round-204/review.md` Critical #1 (see GATE204-B1).
- `git status --short --untracked-files=all` at planning (`b-round-204/git-status-at-planning.txt`) shows the round-204 work, which is **the baseline. Never revert, stash or re-create it**:
  - ` M app/components/home/StudioShowcase.tsx`
  - ` M app/components/layout/Header.tsx`
  - `?? app/lib/__tests__/store-hidden-focusables.test.tsx`
  - `?? docs/implementation/2026/quarter-IV/161-hidden-focusables-runtime.md`
- **Frozen list:** `b-round-204-r205-tree-sha256.txt`, **1035 entries**: every tracked file (1037) minus the 2 tracked grants. `Header.tsx` and `StudioShowcase.tsx` are frozen at their **round-204 hashes** (`e907a1de…`, `f04726d9…`, which equal `a-round-204/end-sha256.txt`). From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-204-r205-tree-sha256.txt`.
- **Grants (4):** `b-round-204-r205-grants.txt`. Start copies are in `b-round-204/r205-granted-start/`, and their hashes are in `b-round-204-r205-granted-start-sha256.txt`.
- **New files (2):** `b-round-204-r205-new-files.txt`. Neither exists at start.
- **Protected, never touched:** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `.claude/**`, `CLAUDE.md`, and every frozen file. The frozen files include `AuthModal.tsx`, `ui/Modal.tsx`, `useLeadMagnet.ts`, `root.tsx`, `Header.tsx`, `StudioShowcase.tsx`, `store-focus-ring.test.ts`, `store-theme-tokens.test.ts` and `e2e/**`.

## 0. Why this round
- **Bug gate:** the three items below are one class: focus and position are lost when an overlay opens or closes on a store page. All three are Medium or a gate blocker.
- **Round 204 is C-PASSed but not published.** Its publication waits for GATE204-B1. Root publishes rounds 204 and 205 together after C PASS (the round-105 precedent).
- **The regression round is not due:** `regression-last.json` is 2026-10-27 / round 199, so the next one is on or after 2026-10-30.
- **RETRO is not due:** the next one comes at round 215 or at the end of STORE-REDESIGN.

| ID | Severity | What B measured | Where |
|---|---|---|---|
| **GATE204-B1** | gate blocker (reviewer "Critical") | Doc 161 l.111 says a jsdom test proves that the user menu closes when `isAuthenticated` becomes false. No such test exists (10 tests: HF1–HF9, HF8b). The doc status l.4 still says it waits for C, although C round 204 PASSed. | `store-hidden-focusables.test.tsx`, doc 161 |
| **B-R203-LEADMAGNET-AUTO-OPEN-FOCUS** | Medium (pre-existing; supersedes the LeadMagnet half of C-R202-06) | The "FREE DOWNLOAD" popup (keep-list) auto-opens. On HEAD (`b-round-204/out/lm-head-1280.json`, `lm-head-mid-1280.json`) focus stays on the page behind it, Tab walks the header and page (Free Samples, About, Search, Cart; or Subscribe, Browse Gift Cards…), Escape does nothing, and there is no `role="dialog"`. | `LeadMagnetPopup.tsx` |
| **B-R204-SCROLLLOCK-POSITION-LOST** | Medium (pre-existing, new at this planning) | `useScrollLock` sets `position: fixed` on the body **before** it reads `window.scrollY` for `top`. The document collapses, `scrollY` is already 0, so `top = 0px`, and on unlock the page restores to 0. **Measured on HEAD:** LeadMagnet opened at scrollY 2037 and closed with ✕ at 0 (`lm-head-close-1280.json`); Sign In (AuthModal) opened at 1500 and closed with Escape at 0 (`authmodal-scroll-5173.json`). A reader loses their place, and a restored focus would land off-screen. | `app/hooks/useScrollLock.ts` (used by `LeadMagnetPopup`, `ui/Modal`, `AuthModal`) |

**B's scratch proof** (copy at `/tmp/b205s` on :5176, now stopped; sketches saved as `b-round-204/out/leadmagnet-sketch.tsx`, `usescrolllock-sketch.ts`, `hf6b-sketch.test.tsx`, `b205-probe.test.tsx`; tools in `b-round-204/tools/`):
- **Sketch** (dialog semantics, initial focus on ✕, Tab wrap, Escape → `close()`, focus restore, plus `scrollY` read before the lock):
  - opens with focus on ✕;
  - Tab and Shift+Tab alternate ✕ ↔ FREE DOWNLOAD only;
  - Escape closes it;
  - focus returns to the pre-open element ("Browse the Collection") at **scrollY 2037** (`lm-sketch2-mid-1280.json`, `lm-sketch2-close-1280.json`);
  - the AuthModal closes at 1500 (`authmodal-scroll-5176.json`);
  - the brass ring shows on ✕ and FREE DOWNLOAD after keyboard entry (`fv true, solid 1px`).
- **Lenis does not fight the restore:** 2037 holds at +1.8 s.
- **Collision tests (L23):** `store-focus-ring.test.ts` (STF2: no focus-variant, outline or ring token, no bare `outline-none` in `LeadMagnetPopup.tsx`) and `store-theme-tokens.test.ts` (ST5 submit-button class attribute, ST7 email-field class region) were run on the sketch: **48/48 green**. No other test references `useScrollLock` or LeadMagnet (grep).
- **jsdom feasibility:**
  - A scroll-lock row with a `scrollY` getter that returns 0 while the body is `position: fixed` (the browser's clamp) is red on HEAD and green on the fix.
  - A dialog-focus row is red on HEAD and green on the sketch.
  - HF6b is green on the round-204 tree and red when the `isAuthenticated` effect is removed.
  - **Harness note:** `rerender` must get a *new* element (`ui()`), or React bails out and the mocked `useAuth` is never re-read. B's first HF6b attempt failed on the good tree for this reason.

## 1. Rulings (recorded in `backlog.json` → `leadmagnet_dialog_rulings_d29z170`; Saba or root may veto)

| ID | Ruling | Why |
|---|---|---|
| **R108** (GATE204-B1) | (1) Add **HF6b** to `store-hidden-focusables.test.tsx`, signed in: open the user menu (`aria-expanded="true"`) → `isAuthenticated=false`, `user=null`, rerender → `isAuthenticated=true`, `user=signedInUser`, rerender → the new "User menu" button has `aria-expanded="false"`. Each `rerender` gets a freshly created element (see the harness note). Do not change any other HF row.<br>(2) Optional, the reviewer's Low #4, in the same file: HF8b's real `setTimeout(50)` becomes deterministic (`vi.useFakeTimers()`/`advanceTimersByTime`, or `waitFor`). HF8b must stay red under m9.<br>(3) Doc 161: l.111 stays and now names **HF6b**. Status l.4 uses the TEMPLATE vocabulary, `In Progress`, followed by a parenthetical: implementation done, C round 204 PASS (`c-round-204.md`), publication together with round 205 after the gate fix. Add HF6b to the testing section and the mutant list (m11 below). Record B's ruling on DEVIATION 1 (accepted, §1 note) and the reviewer's Lows as TODO ids (§5 of `b-round-204.md`). | Deleting l.111 would leave the shipped effect (`Header.tsx:43-45`) untested, and docs are the regression dataset. Header stays frozen: the fix is test + doc only. |
| **R109** (B-R203-LEADMAGNET-AUTO-OPEN-FOCUS) | In `LeadMagnetPopup.tsx` only. Keep every visible string, class string and step flow; keep-list: restyle-only rules apply, and nothing is removed or reworded.<br>(1) **Semantics:** the outer `fixed inset-0` element gets `role="dialog"`, `aria-modal="true"` and `aria-labelledby` pointing at the **current step's own heading(s)** (offer: both h2 → name "Get Your Tracks, Sound Effects & More"; email: "CONTINUE TO CLAIM YOUR OFFER"; success: "We've sent your free mystery pack to your email!"). Add `id`s to the existing h2 elements; no new visible text and no invented `aria-label`.<br>(2) **Initial focus** when it opens: the ✕ button ("Close", the first control in DOM order; it does not opt the user in to anything).<br>(3) **Step focus:** offer → email moves focus to the email input; → success moves it to "BACK TO SITE". A failed submit leaves focus where it is.<br>(4) **Escape** (keydown inside the dialog) calls the existing `close()` (the same as ✕: `dismissed: true`; no new snooze state) and `stopPropagation()`. It is ignored while `event.nativeEvent.isComposing` is true (the SYS-3 class).<br>(5) **Tab containment:** Tab from the last enabled control wraps to the first, and Shift+Tab from the first wraps to the last, in every step (offer: ✕, FREE DOWNLOAD; email: ✕, input, CONTINUE; success: ✕, BACK TO SITE). After a mouse click on non-focusable dialog content, Tab and Shift+Tab still never reach an element outside the dialog (e.g. `tabIndex={-1}` on the dialog element so the click focuses it; the choice is A's, the behaviour is the contract).<br>(6) **Focus restore:** when it closes (✕, Escape, BACK TO SITE), focus returns to the element that had it before opening, if that element is still connected, with `preventScroll: true`. This runs in an effect keyed on open → closed and declared **after** `useScrollLock` (never inside the click or key handler), so the scroll position is restored first. If nothing had focus (body), nothing is focused.<br>(7) The error `<p>` gets `role="alert"` (one attribute; text unchanged).<br>(8) `type="button"` on the ✕, FREE DOWNLOAD and BACK TO SITE buttons (Biome `useButtonType`); the submit button keeps `type="submit"`.<br>**Forbidden here** (STF2, ST5, ST7 pin these): any `focus:`, `focus-visible:`, `ring-*`, `outline-*` or bare `outline-none` token, and any edit to the submit button's or the email field's class string. The ring comes only from the global rule. | APG modal-dialog pattern, kept to the minimum that fixes WCAG 2.4.3 and 4.1.2 and gives a keyboard way out: initial focus inside, Escape, containment, restore. ✕ as the initial target avoids an accidental "FREE DOWNLOAD" on Enter. `inert` on the page is rejected (React 18 has no typed prop, and `root.tsx` is frozen). A portal or `ui/Modal` reuse is rejected: it would change the keep-list markup and visuals, and `Modal` has no focus management either (`shared-modal-no-focus-management`). |
| **R110** (B-R204-SCROLLLOCK-POSITION-LOST) | In `useScrollLock.ts` only. Read `window.scrollY` into a constant **before** any body style is set, and use it for `top`. Nothing else changes: not the unlock or cleanup paths, not the scrollbar padding, and not the export or signature. | It is the actual cause of the "focus off-screen / page jumps to top" half of the LeadMagnet finding, and of the same jump on every Sign-In modal close. It is a one-line order fix in a shared hook; all three consumers want the documented behaviour ("Save current scroll position"). |

**DEVIATION 1 of round 204** (CTA `hover:[transform:scale(1.05)] active:[transform:scale(0.98)]` instead of `hover:scale-105`) is **accepted by B**. C independently confirmed that the ruled form snaps because of the unlayered global transition rule. The in-grant `isAuthenticated` reset effect is accepted too; HF6b now covers it.

**Ableton:** does not apply (store overlay and hook; no Arrangement counterpart). Compliance status: **არ ეხება**. Do not claim parity.

## 2. A — files you own (everything else is frozen)
**Grants (4):**
- `app/components/marketing/LeadMagnetPopup.tsx`: R109 only.
- `app/hooks/useScrollLock.ts`: R110 only.
- `app/lib/__tests__/store-hidden-focusables.test.tsx`: R108 (1)–(2) only.
- `docs/implementation/2026/quarter-IV/161-hidden-focusables-runtime.md`: R108 (3) only.

**New files (2):**
- `app/lib/__tests__/store-lead-magnet-dialog.test.tsx` (jsdom), rows LM1–LM9 (step 3).
- `docs/implementation/2026/quarter-IV/162-lead-magnet-dialog-focus.md`, in Georgian per `docs/implementation/TEMPLATE.md`. It covers:
  - R109 and R110;
  - the rejected alternatives (`inert`, portal or `ui/Modal` reuse, focus on FREE DOWNLOAD, Escape as snooze);
  - B's probe numbers (2037 → 0 on HEAD, 2037 kept on the fix; AuthModal 1500 → 0 vs 1500);
  - TODOs: the command palette half of C-R202-06 and `shared-modal-no-focus-management` (`ui/Modal` / AuthModal focus) stay open.

**Primitives to read first:** `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md`, `.claude/prompts/new-hook.md` (hook edit).

**Steps:**
1. **Start checks**, from `store/`. If any fails, it is a **STOP** (L11):
   - HEAD is `135b880`;
   - `git status` equals the four baseline lines above, exactly;
   - the frozen list checks OK;
   - the 4 grants equal `b-round-204-r205-granted-start-sha256.txt`;
   - neither new file exists.
2. **Collision grep (L23, already done by B; re-run it):** `grep -rln "useScrollLock\|LeadMagnet\|FREE DOWNLOAD\|czaba_lead_magnet" app --include=*.test.* ; grep -rln "FREE DOWNLOAD\|lead" e2e`.
   - **Expected hits:** `store-focus-ring.test.ts` (GRANTED_STORE_SOURCES list + STF2 scan) and `store-theme-tokens.test.ts` (ST5, ST7). Both stay green. Any e2e hit is not run by you or the gate; list it.
   - **Any other hit** in a frozen test is a STOP.
3. **Implement R108–R110**, then write `store-lead-magnet-dialog.test.tsx`.
   - **Setup:** mock `~/hooks` so that `useLeadMagnet` returns a mutable fixture (`shouldShow`, `currentStep`, `close` spy, `isSubmitting`, `error`) and `useScrollLock` is the **real** hook (`vi.importActual('~/hooks/useScrollLock')`). See `b-round-204/out/b205-probe.test.tsx`. Find elements by role, name and `aria-*`; **no styling-class assertions** (L12).
   - **LM1:** with `shouldShow`, there is exactly one `role="dialog"` with `aria-modal="true"`. Its accessible name (from `aria-labelledby`) is "Get Your Tracks, Sound Effects & More" in offer, "CONTINUE TO CLAIM YOUR OFFER" in email, and "We've sent your free mystery pack to your email!" in success. `getAllByRole('button', {name})` returns 1 for every button name (L14).
   - **LM2:** a button outside has focus; the dialog opens → `document.activeElement` is the "Close" button.
   - **LM3:** switching the fixture step to `email` focuses the email input; switching it to `success` focuses "BACK TO SITE".
   - **LM4:** Escape on a control inside → `close` called once, and a `document` keydown listener added by the test does not see it. Escape with `isComposing: true` → `close` is not called.
   - **LM5:** containment per step: Tab on the last control → focus is on the first, with `preventDefault`; Shift+Tab on the first → focus is on the last. Use `fireEvent.keyDown` and assert `activeElement` (jsdom does not move focus on Tab by itself).
   - **LM6:** after the dialog element itself is focused (the simulated click on non-focusable content), Shift+Tab lands on the last control (a handler case). Forward Tab from the dialog element is the browser's default move to ✕; jsdom cannot show it, so it is proven only by C's LM-TAB-205 post-click Tab. Do not add a handler for it.
   - **LM7:** open (pre-focus an outside button), then `shouldShow=false` and rerender with a fresh element → `activeElement` is that outside button. If it was removed from the DOM before closing, no error is thrown and focus is not forced anywhere.
   - **LM8 (`useScrollLock`, real hook):** spy `window.scrollTo`, and give `scrollY` a getter that returns 0 while `document.body.style.position === 'fixed'`, else 1500. Lock → `body.style.top === '-1500px'`. Unlock → `scrollTo(0, 1500)`, and `position`, `overflow`, `top` and `width` are removed. Unmount while locked → the same restore.
   - **LM9:** the error `<p>` (fixture `error: 'x'`) has `role="alert"`, and its text is unchanged.
   - Plus **HF6b** in the round-204 file (R108).
4. **Mutants** (on a scratch copy, never in `store/`). Each must turn the listed row red; report the table:
   - m1 the `role`/`aria-modal` removed → LM1;
   - m2 no initial focus → LM2;
   - m3 no step focus → LM3;
   - m4 Escape not handled → LM4;
   - m5 `isComposing` not checked → LM4;
   - m6 no Tab wrap → LM5;
   - m7 the wrap only handles `activeElement === last` (no dialog-element case) → LM6;
   - m8 no focus restore → LM7;
   - m9 restore inside the ✕ handler only → LM7 (closing through the fixture);
   - m10 the original `useScrollLock` order → LM8;
   - m11 the `isAuthenticated` effect removed from a **scratch** `Header.tsx` → HF6b;
   - m12 `role="alert"` removed → LM9.
5. **Self-checks:**
   - `npm run typecheck`;
   - `npm run lint` (no new warnings in the grants; `useButtonType` in `LeadMagnetPopup.tsx` goes to 0);
   - `npx vitest run app/lib/__tests__/store-lead-magnet-dialog.test.tsx app/lib/__tests__/store-hidden-focusables.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-header-footer.test.tsx`.
   - No full suite and no `npm run verify` (gate rows).
6. **Browser self-check** (Playwright on :5173; the mock on :5199 is not needed for these rows). Copy `lmprobe.cjs`, `lmprobe-mid.cjs`, `lmprobe-close.cjs` and `authmodal-scroll.cjs` from `b-round-204/tools/` into `a-round-205/tools/`, change their output dir to `a-round-205/out/`, and run them at 1280×720. Expect what B saw on the sketch: focus on ✕ at open, Tab wraps, Escape closes, focus returns, scrollY 2037 (±2) kept, AuthModal 1500 kept. Put the output paths in the report.
7. **code-reviewer** on the 6 files (3+ changed). Fix Low findings in your own files only. Report the Architecture note verbatim; do not act on it.
8. **Report** `a-round-205.md`, plus `a-round-205/end-sha256.txt` over the 4 grants and the 2 new files. **Before handing over (L26):** grep each test id and behaviour that doc 161 and doc 162 cite (HF*, LM*); each must exist by name in the named test file, and each doc's mutant table must match your report.

**STOP conditions** (L11: write "STOP — needs B ruling" at the top and change nothing else):
- a start check fails;
- a frozen test turns red;
- an item needs a file outside the grants (`root.tsx`, `ui/Modal.tsx`, `AuthModal.tsx`, `useLeadMagnet.ts`, `Header.tsx`);
- the probe shows focus or scroll lost after R109/R110.

## 3. C — rows (1280×720 and 1440×900; 375×812 where marked; settle ≥ 1.2 s per key on store pages because Lenis animates 1.2 s, L1)
**Setup:**
- **Ref** = a tar of `store/` minus node_modules/.git/build/.vite, with node_modules symlinked, the 4 grants restored from `b-round-204/r205-granted-start/`, the 2 new files removed, and its own `cacheDir`, served on :5174. Ref is the round-204 tree, not HEAD.
- **Tree** = :5173 (root). The mock on :5199 is needed only by rows that load product data; start it if `curl :5199/__mock/health` fails.
- **Popup trigger (deterministic):**
  - fresh `czaba_lead_magnet` (absent, or `dismissed:false, submitted:false, viewCount:0` with today's date), anonymous, cookies declined;
  - scroll to ≥ 55 % of the page and wait until "FREE DOWNLOAD" is visible (it opens 8 s after load);
  - the exit-intent path (`mouseleave` at `clientY ≤ 0` after the scroll) is a second trigger for one row.
- **Other rows** suppress the popup with the round-204 seed (`dismissed:true`).

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-205** (start and end) | HEAD; `git status`; frozen 1035; grant diffs vs the start copies; new files; `a-round-205/end-sha256.txt` | only the 4 grants + 2 new files differ from the baseline; the diffs are R108–R110 and nothing else; `Header.tsx` and `StudioShowcase.tsx` still at their round-204 hashes; protected files, `.claude` and `CLAUDE.md` unchanged |
| **LM-OPEN-205** (1280, 1440, 375) | popup trigger; before it opens, `focus()` a visible link in the viewport at 55 % (as `lmprobe-mid.cjs`); read `role`, `aria-modal`, the accessible name (Playwright `getByRole('dialog', {name})` or CDP AX tree), `activeElement` and its ring | one dialog, modal, name "Get Your Tracks, Sound Effects & More"; focus on "Close" within 500 ms of the popup being visible; ring per the global rule (keyboard source: solid ≥ 1px brass, offset 2px; record the pointer-source state as observed). Ref: no dialog, focus stays on the page (before-picture) |
| **LM-TAB-205** (1280, 1440, 375) | from open: Tab ×4, Shift+Tab ×2, each step's `activeElement`; then mouse-click on the CZABA wordmark (non-focusable) and Tab ×2, Shift+Tab ×2 | every stop is inside the dialog: offer cycles Close ↔ FREE DOWNLOAD; no header/page element is ever focused; after the wordmark click the same. Each focused control shows the ring after keyboard. Ref lists the page stops behind the overlay |
| **LM-STEPS-205** (1280) | Enter on FREE DOWNLOAD → email step; Tab cycle; empty submit (Enter on CONTINUE) → error; `page.route('**/api/subscribe', …)` fulfils 200 `{}` → type a valid address, submit → success; Tab cycle; Enter on BACK TO SITE | email step: focus on the email input, name "CONTINUE TO CLAIM YOUR OFFER", cycle ✕ → input → CONTINUE → ✕; the error text "Please enter your email address" is in a `role="alert"` element; success: focus on BACK TO SITE, name = the success heading, cycle ✕ ↔ BACK TO SITE; BACK TO SITE closes and focus returns to the pre-open element. The `page.route` fixture is browser-side only (no backend needed; it is not BLOCKED) |
| **LM-CLOSE-205** (1280, 1440, 375) | three separate opens from scrollY ≈ 55 % with a focused mid-page link: (a) Escape; (b) mouse click on ✕; (c) Enter on ✕. Record scrollY before open, during open (`body.style.top`), +300 ms and +1.8 s after close; `activeElement`; body inline styles | popup gone; `czaba_lead_magnet.dismissed === true`; scrollY after = before ±2 px at +300 ms and +1.8 s; `body.style.top` during open = `-<before>px`; body `position/overflow/top/width` cleared; focus back on the pre-open link and the link is on screen. A reload does not show the popup again (dismissed). Ref: scrollY 0 after ✕ (before-picture) |
| **LM-EXIT-205** (1440) | exit-intent trigger: scroll ≥ 40 %, then mouse to `clientY 0` and out | the same dialog opens with focus on Close; Escape closes and restores (one sample) |
| **SCROLL-LOCK-205** (1280, 1440; popup suppressed) | (a) `/`: scroll to 1500, click header "Sign In", Escape; (b) the same, close with the modal ✕; (c) `/store`: scroll to ~800, open Sign In, close; record scrollY before/after and `body.style.top` while open. (d) `ui/Modal` consumer reachable in the cloud: `/studio-lab`, open the Export dialog (`ArrangementExportDialog`, built on `ui/Modal`), close it with Escape and with its ✕ | (a)–(c): after = before ±2 px; `top` = `-<before>px` while open; the AuthModal still opens once and closes; ref: after = 0 (before-picture). (d): the dialog opens once and closes; afterwards the body `position/overflow/top/width` inline styles are cleared, scrollY is unchanged (= before, normally 0), and the workspace responds (Space starts and stops playback, or a clip click selects it) = ref |
| **HF6B-205** | run HF6b on the tree copy; on a scratch copy with the `isAuthenticated` effect removed from `Header.tsx` | green on the tree; red on the mutant; HF1–HF9 and HF8b unchanged and green |
| **NO-SHIFT-205** (1280, 1440, 375) | box diff of the popup's ✕, headings, FREE DOWNLOAD, email field, CONTINUE and BACK TO SITE, tree vs ref, in the same step and scroll state; screenshots of offer and email | 0 diffs beyond ±1 px; no new visible text; keep-list strings identical |
| **T-RUN-205** | the 5 targeted test files on a tree copy; LM1–LM9 + HF6b on the start copy (expected: LM1–LM9 red; HF6b green on the start copy because the round-204 Header already has the effect, so HF6b's red-proof is m11, per L23); A's mutant table re-run plus at least 1 C mutant | targeted green on the tree; each mutant reds its row as listed; any green mutant that should be red = FAIL |
| **AN-REVIEW-205** | added lines: no `as`, `any` or `@ts-ignore`, no hex, no custom CSS, no focus-variant/outline/ring token; doc 162 in Georgian with R109/R110, the rejected alternatives, the probe numbers and the TODOs; doc 161 status line and HF6b updated; **L26:** every test id or test behaviour cited in doc 161 and doc 162 exists by name in the named test file (grep each HF/LM id), and each doc's mutant table matches `a-round-205.md` | all true; any cited test that does not exist = FAIL (the gate-204 block class) |
| **G205-3** | fresh contexts at 1440 and 1280: `/studio-lab` opens anonymously (demo collection) and shows no LeadMagnet; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` returns 401 without a header and 403 with a fake Bearer | all true; 0 forbidden requests |
| **gate** | full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | not claimed by C (root gate) |

**Not in scope for C failures** (report new findings with severity; Lows go to `deferred_low_polish`):
- the CommandPalette half of C-R202-06;
- `ui/Modal`/AuthModal focus management (`shared-modal-no-focus-management`);
- C-R204-01 and C-R204-02 (deferred Lows).

## 4. Adjacent behaviour that could break (C probes it, A guards it)
- `useLeadMagnet`'s show rules are unchanged:
  - no popup when signed in (seam `auth_user`);
  - no popup after dismiss or submit;
  - at most one show per load.
- AuthModal Sign In opens once from the header (desktop and 375 mobile menu) and its Escape still closes it.
- The popup's fade-in animation still plays.
- A Lenis wheel scroll works after the popup closes: scroll down 300 px with the mouse wheel and confirm that scrollY changes.
- `/studio-lab` never mounts the popup (`isStudioPage`).
- **`useScrollLock` consumers (R110 is shared infrastructure):** `LeadMagnetPopup`, `AuthModal`, and `ui/Modal`, which is used by `ArrangementExportDialog` (`/studio-lab`, row SCROLL-LOCK-205 (d)), `studio/ExportDialog` (`/studio/:id`, backend-blocked) and the `ConfirmDialog` in `cart.tsx` (needs a backend cart). The last two are not rows; C lists them as backend-blocked evidence, not FAIL.
- The round-204 rows HIDDEN, USERMENU and SHOWCASE are not re-run unless a diff touches them: frozen hashes prove they did not change.

## 5. Publication
On C PASS, root publishes **rounds 204 and 205 together** against `135b880`: the 2 round-204 grants (`Header.tsx`, `StudioShowcase.tsx`), the round-204 test and doc 161, the 2 round-205 code grants (`LeadMagnetPopup.tsx`, `useScrollLock.ts`) and the 2 new files.

The reviewer's Suggestion #2 is a note for root's commit message: the Logout `onClick` now calls `setIsUserMenuOpen(false)` before `signOut()`, and the account links got a menu-closing `onClick`. `signOut`, `~/lib/auth` and `AuthContext` are unchanged. Do not write "auth not touched".
