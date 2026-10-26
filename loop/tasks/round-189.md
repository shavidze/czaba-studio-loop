# CURRENT TASK — Round 189: STORE-1d — D10 entrance loader (≤ 1.2 s, skippable, once per session, off under reduced motion; no heading; never blocks the card Play)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z154** (`backlog.json` → STORE-REDESIGN `store1d_plan_d29z154`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the Store-redesign section (2026-10-25). They take precedence over older text.
- **Spec (DATA):** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-1, item **D10**: "entrance loader ≤ 1.2 s, skippable, once per session, off under `prefers-reduced-motion`". Research: `research/luxury-and-galleries.md:105`: "a short, interruptible reveal (≤1.2s, skippable, shown once per session) instead of a spinner". Added acceptance: **C-R187-I1** (the loader must not block the `/` card Play) and **C-R188-I1** (a second h1 while the loader is up).
- **Previous task:** `tasks/round-188.md` is an exact copy of the round-188 `current-task.md` (checked with `cmp`). The reasoning for this round is in `b-round-188.md`.

## Baseline = HEAD `850445c` (gate 188 published)
- **Gate:** `gates/gate-round-188.json` is `published`, and its `commit` is `850445c` on both remotes. Its `head` field (`cb24362`) is the pre-commit parent; the baseline is the `commit`. `git status` is clean, with **1017 tracked files**.
- **Frozen list:** `b-round-188-r189-tree-sha256.txt`, **1015 entries** (every tracked file except the 2 grants). B checked it from the store root: OK.
- **Grants:** `b-round-188-r189-grants.txt`, 2 files:
  - `app/components/loading/SpotlightLoader.tsx`;
  - `docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md` (status lines only, K7).

  **Start hashes:** `b-round-188-r189-granted-start-sha256.txt` (`abfe013b…`, `b47bec15…`). **Start copies:** `b-round-188/r189-granted-start/`.
- **New files:** `b-round-188-r189-new-files.txt`: `app/lib/__tests__/store-entrance-loader.test.tsx` and `docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md`.
- **A's first step:** check these four things. If anything differs, stop and report.
  1. HEAD is `850445c`.
  2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-188-r189-tree-sha256.txt`, run **from the store root**, is OK.
  3. The two start hashes match.
  4. Neither new file exists yet.
- **Mock API:** `tmp/studio-real-loop/mock-api/server.mjs` serves the store data on 127.0.0.1:5199. **A and C:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24 and today is 2026-10-26, which is 2 days. Round 188 §7 ("C PASS, planning still on 2026-10-26") sends us to **STORE-1d**. The first planning on or after 2026-10-27 makes the next round the REGRESSION round.
- **C bugs first:** C round 188 found **0 bugs** (PASS, `browserVerified=true`, `realVerified=true`, 14 rows). No Critical, High or Medium finding is open. Two of its info items belong to this round's code: C-R188-I1 (the loader h1) and C-R187-I1 (the loader blocks the card Play). The other items are routed in `b-round-188.md`.
- **Correction of B's earlier text:**
  - **The loader h1 is in `SpotlightLoader`.** Round 188 §4 said `SpotlightLoader` has no h1, and the backlog's STORE-1d addition named `CinemaCurtainLoader`. Both were wrong. The h1 is `SpotlightLoader.tsx:191` (`motion.h1` "CZABA"). `CinemaCurtainLoader` is exported from `app/components/loading/index.ts:3` and `app/components/common/index.ts:3`, but no route mounts it (grep). It is dead code: a STORE-5 signal, not touched here.
  - **`.text-glow` is still used.** B's round-188 signal said it would become unused. A, C and the gate reviewer showed it is still used in 9 files.
- **Code facts B checked at `850445c`:**
  - **Where it mounts:** `SpotlightLoader` is mounted only at `app/routes/_index.tsx:160` (imported from `~/components/common`, l.40). Its export name and props (none) stay the same.
  - **Timing** (l.5-9, l.43-69): 800 ms dark, then 1.2 s spotlight, then 600 ms logo delay, then 2000 ms hold, then 1.0 s exit. The total is **5.6 s**, which matches C's 0.64 → 6.3 s probe.
  - **Show rule** (l.12-29): `localStorage` key `czaba_spotlight_last_shown`, with a random interval of 5–7 h. It is not per session, and nothing checks reduced motion.
  - **Overlay** (l.79-85): `fixed inset-0 z-50`. It has no `pointer-events-none` and no skip handler, so it swallows hover and clicks on the page below for the whole 5.6 s.
  - **SSR:** `shouldShow` starts `false`, so the server renders nothing. The overlay appears only after hydration.
  - **Reduced-motion precedent:** `useReducedMotion` from framer-motion (`ProductAccordion.tsx:13`). jsdom has no `window.matchMedia`, so a test must stub it.
  - **e2e:** `e2e/navigation.spec.ts:9` uses `page.locator('h1').filter({ hasText: 'CZABA' })` on `/`. While the loader's h1 is up, it matches 2 elements. Removing the heading only makes this test safer.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| **K1** (≤ 1.2 s) | `SpotlightLoader.tsx` | From mount to unmount, the overlay is on screen for **at most 1200 ms, exit fade included**. A chooses the phase split (dark, spotlight, logo, hold, exit) and keeps the existing visuals: black stage, spotlight cone, glow, logo, rule line, tagline, dust, vignette and grain. The logo must actually be seen: its wrapper reaches opacity ≥ 0.9 for at least 200 ms. Use one constant for the total `T` (≤ 1200). The framer `transition.duration` values must shrink to fit: the logo wrapper currently fades in over 0.8 s, which cannot reach ≥ 0.9 opacity for 200 ms inside 1.2 s together with a dark phase and an exit. The test asserts the behaviour and the bound, not a particular split. Timer type: `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout`. All timers are cleared on unmount and on skip. |
| **K2** (never blocks) | `SpotlightLoader.tsx` | From the start of the exit phase until unmount, the overlay root has `pointer-events-none`, so hover, clicks and `elementFromPoint` reach the page below while it fades. |
| **K3** (skippable) | `SpotlightLoader.tsx` | A `click` on the overlay, or a document `keydown` with `key === 'Escape'`, ends the loader **immediately**: no exit fade, timers cleared, the component renders `null` from then on. Use `click`, not `pointerdown`: if the overlay unmounted on pointerdown, the pointerup and the compatibility `click` would land on whatever is underneath (mouse and touch). With `click`, the whole gesture completes on the overlay, so nothing beneath receives it (R63). The keydown listener exists only while the overlay is shown and is removed on skip, on finish and on unmount. No visible "Skip" control (R63). |
| **K4** (once per session) | `SpotlightLoader.tsx` | Replace the `localStorage` 5–7 h rule. In the mount effect, read `sessionStorage` key `czaba_entrance_seen`. If it is `'1'`, render nothing. Otherwise show the loader once and write `'1'`. If `sessionStorage` throws, as with blocked storage, render nothing and do not throw (R61). The old `localStorage` key is no longer read or written, and it is not deleted (R61). |
| **K5** (reduced motion) | `SpotlightLoader.tsx` | In the same mount effect, before deciding to show: if `window.matchMedia` exists and `matchMedia('(prefers-reduced-motion: reduce)').matches`, render nothing and do **not** write the session key (R64). One synchronous decision, so there is no flash of the overlay. A may use framer's `useReducedMotion` only if the overlay can never render for even one commit under reduce; the test enforces this. |
| **K6** (no heading) | `SpotlightLoader.tsx` | The overlay root gets `aria-hidden="true"`. `motion.h1` "CZABA" becomes a non-heading `motion.span` with `block` and the same classes and inline styles, so it looks identical. No `h1`–`h6` and no `role="heading"` anywhere in the component. The tagline `<motion.p>` stays (R65). |
| **K7** (doc 155) | doc 155 l.4 and l.72 | l.4 → `**სტატუსი:** Completed`. l.72 → C round 188 PASS (`c-round-188.md`, browserVerified), published as `850445c`. Two lines only; this is the gate-188 reviewer's item 1. |
| **T1** | **new** `app/lib/__tests__/store-entrance-loader.test.tsx` | See §3. |
| **D1** | **new** `docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md` | In Georgian, with the `TEMPLATE.md` sections: date, status `In Progress (awaiting C round 189)`, project, context (D10, C-R187-I1, C-R188-I1), approach (rulings R61–R66 with the rejected alternatives), changed files, problem → solution, testing, and TODO (§8 signals). |

**Unchanged on purpose:**
- `_index.tsx`, both barrels, `CinemaCurtainLoader.tsx`, `PianoCurtainLoader.tsx` and `HeroSection.tsx` are byte-identical.
- The **existing inline colours and gradients** in `SpotlightLoader.tsx` (`#000`, the `rgba(19,217,204,…)` glows, the `hsl(…)` gradient text, the grain SVG) stay as they are. The Obsidian retheme, the glow removal and the gradient-text removal belong to STORE-2. **Add no new** hardcoded colour, inline colour or custom CSS.

### Rulings (vetoable by Saba; record them in D1)
- **R61: "once per session" means `sessionStorage`.** The key is `czaba_entrance_seen`. The first visit to `/` in a tab session shows the loader once, even if the visitor opened other pages first. Reloads, client navigation back to `/` and later visits in the same tab session do not show it. A new tab or window is a new session, as `sessionStorage` defines it. Blocked storage means no loader.
  - Rejected: keep `localStorage` with an interval, because the spec says per session.
  - Rejected: show the loader on every visit when storage is blocked, because it would replay on every navigation to `/`.
  - The old `localStorage` key stays inert. It is harmless, and deleting it would add a write for no benefit.
  - Trade-off, recorded for Saba: the server cannot read `sessionStorage`, so the overlay still appears only after hydration (about 0.6 s after first paint). Rendering it on the server would show it on every visit, against "once per session".
- **R62: ≤ 1.2 s is measured from mount to unmount, exit fade included.** The page is interactive from the start of the exit phase (K2). Rejected: ≤ 1.2 s before the fade starts, because the overlay would still be up past 1.2 s.
- **R63: skip by a click on the overlay or by Escape, with no visible button.** The skipping click completes on the overlay and never reaches the page: clicking a black screen should not press an invisible button. Rejected:
  - a visible "Skip" button, because it adds a focus target and visual noise to a 1.2 s reveal;
  - any key skips, because Tab and screen-reader keys should not have side effects;
  - pass-through clicks, because they would activate controls the user cannot see.
- **R64: reduced motion means no loader at all,** not a shorter or fade-only one, and the session key is not written. The spec says "off". If the visitor turns reduced motion off later in the same session, the loader may show once.
- **R65: the overlay is decorative.** It gets `aria-hidden="true"` and has no heading. The page's own h1 (the hero "CZABA") is the only h1 at all times.
- **R66: the visual stays and only the timing is compressed.** Colours, glow and gradient text are STORE-2's job (direction A), so this round does not half-restyle them.

## 2. A — files you own (everything else is frozen)
- **Grants:** `SpotlightLoader.tsx` (K1–K6) and doc 155 (K7, two lines).
- **New:** T1 and D1, plus your own `a-round-189.md` and `a-round-189/`.
- **Protected, byte-identical:** every other tracked file. That includes:
  - store files: `_index.tsx`, `HeroSection.tsx`, `root.tsx`, `app/styles/app.css`, `app/components/loading/index.ts`, `app/components/common/index.ts`, `CinemaCurtainLoader.tsx`, `ProductCard.tsx`, `AudioPreviewButton.tsx`, `Header.tsx`, `Footer.tsx` and every `e2e/*`;
  - every Studio-owned file: `app/components/arrangement/*`, `app/lib/arrangement/*`, `studio-lab.tsx` and `CookieConsent.tsx`;
  - the protected purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth.ts` and `firebase.client.ts`;
  - `public/`, `.claude/**`, `package.json` and the configs.

  Do not touch `mock-api/` or any other loop file.
- **Read first** (rule `read-primitives.md`):
  - primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
  - templates: `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

  `SpotlightLoader` keeps its plain function signature; this is not a forwardRef refactor.
- Make every lasting edit with Edit/Write. Helper scripts go under `a-round-189/tools/`. Write `a-round-189/end-sha256.txt` (the 2 grants and the 2 new files) and `a-round-189/diff-vs-start.patch`. No commit and no push.

## 3. A — tests and checks (speed rules)
**Test setup:**
- Use `vi.useFakeTimers()`, rendering with `@testing-library/react` and `act`.
- Stub `window.matchMedia` per test (default: no match).
- Clear `sessionStorage` and `localStorage` in `beforeEach`.
- framer-motion is real, not mocked. If jsdom needs a `requestAnimationFrame` shim for framer, record it.
- No type assertions, no `any`, no `@ts-ignore`.

**T1 must contain at least these cases:**
- **L1 (SSR guard):** `renderToString(<SpotlightLoader />)` is `''`. This guard is green on the start code too.
- **L2 (shown, decorative):** on a first mount after effects:
  - the overlay root exists (find it by `aria-hidden="true"` or a stable `data-testid` that A adds) and has `aria-hidden="true"`;
  - `container.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')` is empty;
  - the text "CZABA" is inside the overlay.
- **L3 (≤ 1.2 s):** let `T` be A's total duration; the test asserts `T ≤ 1200`. The overlay is present at 600 ms and at `T − 1` ms, and it is gone at `T`. It stays gone after advancing to 1200 + 5000 ms. The test may read `T` from A's constant for timing, but it must also assert the bound.
- **L4 (non-blocking exit):** at `T − 1` ms the overlay root has the `pointer-events-none` class. At 100 ms it does not, so it is still skippable by click.
- **L5 (skip by click):** `fireEvent.click(overlay)` at 300 ms. The overlay is gone after `act`, and advancing 5000 ms never brings it back.
- **L6 (skip by Escape and listener hygiene):**
  - At 300 ms, `fireEvent.keyDown(document, { key: 'Escape' })` makes the overlay disappear.
  - At 300 ms in a fresh mount, `{ key: 'Tab' }` does **not** remove it.
  - Spy on `document.addEventListener` and `document.removeEventListener`: every `keydown` listener added is removed after skip, after natural finish and after unmount mid-animation.
- **L7 (once per session):** after a first mount, `sessionStorage.getItem('czaba_entrance_seen') === '1'` and `localStorage.getItem('czaba_spotlight_last_shown')` is `null`. Unmount, then mount again: nothing renders.
- **L8 (old key inert):** with only `localStorage.czaba_spotlight_last_shown = String(Date.now())` preset, the overlay **is** shown. With `sessionStorage.czaba_entrance_seen = '1'` preset, nothing renders.
- **L9 (reduced motion):** with `matchMedia` stubbed so `(prefers-reduced-motion: reduce)` matches:
  - nothing renders after mount, and the overlay never appears at any `advanceTimersByTime` step (0, 100, 1200);
  - the session key is not written.
- **L10 (blocked storage):** with `sessionStorage.getItem` spied to throw, mount does not throw and nothing renders.
- **L11 (no stray timers):** unmount at 500 ms, then advance 5000 ms. There is no React state-update warning (spy on `console.error`) and no throw.

**Red proof:** run T1 against the start code. Either copy the start copy `b-round-188/r189-granted-start/SpotlightLoader.tsx` temporarily over the grant, then restore your end copy and check it against `end-sha256.txt`, or use a scratch Vite alias (C's round-188 method). **L2, L3, L4, L5, L6 (Escape), L7, L8, L9 and L10 must be red on the start code.** L1 must be green on both.

**Run:**
- `npx vitest run app/lib/__tests__/store-entrance-loader.test.tsx`;
- `npm run typecheck` and `npm run lint` (report the warning count against round 188's 214 warnings + 1 info);
- `npx biome check` on `SpotlightLoader.tsx` and T1. Report the warnings; the pre-existing inline-style ones in untouched lines are expected.

Do not run the full suite: that is the gate's job.

**Live proof** (mock on :5199, store on :5173), saved under `a-round-189/`:
- One Playwright Chromium probe at 1440 on `/`, in a fresh context. A MutationObserver plus `performance.now()` measures from overlay insertion to removal, and the h1 count is sampled every animation frame until 1 s after removal.
- A second load in the same context: no overlay within 3 s.
- A fresh context with `reducedMotion: 'reduce'`: no overlay within 3 s.
- One screenshot mid-loader showing the logo.

**Code review:** use the `code-reviewer` subagent (4 files). Pass its Architecture note to B verbatim.

## 4. C — rows
Setup:
- Use real Playwright Chromium on the shared :5173 server, with a fresh anonymous context per session unless the row says otherwise, at **1440×900, 1280×720 and 375×812**. Pixel reads run at DPR 2 with `--disable-lcd-text`.
- Start the mock if :5199 is not listening, log to `c-round-189/mock.log`, and stop it at the end if you started it.
- Dismiss the LeadMagnet popup, or use non-scrolled shots, before any screenshot comparison. Park the mouse at (1,1) before screenshots (round-188 harness fix).
- Install the timing probe with `addInitScript`: a MutationObserver on `document` that records `performance.now()` when the overlay root (`[aria-hidden="true"].fixed.inset-0`, or A's `data-testid`) is inserted and removed, plus a rAF sampler that counts `h1` elements.

| Row | What | Pass |
|---|---|---|
| **DUR-189** (K1) | Fresh context on `/`, 3 loads × 3 viewports. | The overlay appears on every load. Insertion → removal: median **≤ 1250 ms** and every load **≤ 1300 ms** (unit L3 holds the exact 1200; the margin covers timer and observer jitter). Report the raw values. The logo is really seen: on a mid-loader screenshot at each viewport "CZABA" is visible, and the sampled logo opacity reaches ≥ 0.9. |
| **HIT-189** (K2, C-R187-I1) | Fresh context on `/`, 3 viewports. Locate a card **Play preview** button on `/` (the hover overlay at 1440/1280, the `md:hidden` corner button at 375; use the same card as round 187 PREVIEW). The cards sit below the hero fold, so first scroll the chosen card into view with `evaluate` (`scrollIntoView({block:'center'})`, at or before overlay insertion; document scrolling works under the fixed overlay). Keep the LeadMagnet popup out of the measurement: dismiss it if it appears, as in the round-187 PREVIEW harness. Then sample `elementFromPoint` at the card's centre every frame from overlay insertion onwards. | `elementFromPoint` hits the button, or a descendant of it, **no later than 1250 ms** after insertion, and from the start of the exit fade onwards (record that time). Then a real click, after hover at 1440/1280, starts the real preview: an `audio` element's `currentTime` advances ≥ 0.5 s and the button shows Pause. Record the time from insertion to the first successful hit. |
| **SKIP-189** (K3) | Fresh context per case, 1440 and 375. (a) At about 300 ms after insertion, `mouse.click` at the viewport centre. (b) At about 300 ms, press `Escape`. (c) At about 300 ms, press `Tab`. | (a) and (b): the overlay is removed ≤ 50 ms after the input, `elementFromPoint` on the card Play hits the button in the next frame, the URL is unchanged and no audio started (the skipping click did not reach the page). (c): the overlay is **not** removed by Tab; it ends by itself within the DUR-189 bound. |
| **SESSION-189** (K4) | 1440. (a) A fresh context loads `/` (overlay shown), then reloads: no overlay within 3 s. (b) Same context, client navigation `/` → Collections → `/` via the wordmark: no overlay. (c) A fresh context opens `/store` first, then clicks the wordmark: the overlay shows once; reload: none. (d) Read storage after (a). | (a)–(c) as stated. (d) `sessionStorage.czaba_entrance_seen === '1'`, and `localStorage.czaba_spotlight_last_shown` is absent in a fresh context (it is never written). (e) A **new page in a new context** shows the overlay again. Observe each "no overlay" case for 3 s with the MutationObserver: 0 insertions. |
| **RM-189** (K5) | A fresh context with `reducedMotion: 'reduce'` at 1440 and 375, on `/`. | 0 overlay insertions in 3 s (the MutationObserver is installed before navigation, so even a one-frame flash counts). `sessionStorage.czaba_entrance_seen` is absent. Then, in the same context, `page.emulateMedia({ reducedMotion: 'no-preference' })` and reload: the overlay shows once (R64). The hero and cards still render. |
| **H1-189** (K6, C-R188-I1) | Fresh context on `/`, 3 viewports. The rAF sampler runs from DOMContentLoaded until 1 s after the overlay is removed. Accessibility snapshot taken mid-loader. | **Max `h1` count = 1 at every sample**, and it is the hero "CZABA". The overlay root has `aria-hidden="true"` and contains no `h1`–`h6` or `role="heading"`. The mid-loader accessibility snapshot has exactly one heading level 1. SSR (JS off): 1 h1, no overlay. |
| **E2E-189** | Run the command printed below the table, with the mock and the shared :5173 server. | Both tests pass. If the runner cannot reuse the server here, record why and rely on H1-189; that is not a FAIL of A. |
| **STORE-AFTER-189** | `/`, `/store` and `/products/middle-east` at the 3 viewports after the loader is gone (or in a context where it was already seen), vs `c-round-188/shots/store-after/` (non-scrolled, popup dismissed, mouse parked, hero masked on `/`). Home LCP and CLS: 3 loads per viewport in **fresh** contexts (the loader shows) **and** 3 in seen contexts. | 0 changed px outside the masked hero on all 9 shots. Home LCP ≤ 2.5 s and CLS < 0.1 (median) in both modes. Report whether the LCP element is ever inside the overlay, and compare with round 188 (LCP 528/524/460 ms, CLS 0.0198/0.0014/0; C-R188-I5). |
| **KEEP-189** | `/` after the loader, 1440 and 375. | The LeadMagnet popup still appears after scrolling (about 6 s, as in round 188). "Browse Gift Cards" and a "Limited" badge are present. The header is unchanged (via STORE-AFTER). |
| **G189-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` without a header and with `Authorization: Bearer fake`. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present, and **no entrance overlay** (it is mounted only on `/`). `/studio/middle-east`: "Sign in required", 0 `audio[src]`. No header → 401. Fake Bearer → **403** "Unable to verify ownership", and `mock.log` shows `/api/downloads auth=yes 401`. This is mock-backed, not real-backend evidence. |
| **STUDIO-RV-189** | `/studio-lab` rest screenshot at 1440 and 1280 vs `c-round-188/shots/c188-{1440,1280}-1/rest-full.png`. | 0 changed px. 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **SCOPE-189** | The frozen list (1015) at C's start and end, run from the store root; A's `end-sha256.txt`; `git status`; the diffs. | The frozen list is OK. `git status` is exactly 2 ` M` (`SpotlightLoader.tsx` and doc 155) and 2 `??` (T1, D1). The doc 155 diff is 2 lines (l.4 and l.72). `SpotlightLoader` is still exported under the same name, with no props. |
| **T-RUN-189** | Run T1 yourself. Then run it against the start copy (scratch Vite alias, as in C round 188) or against your own mutants. Mutants: restore `motion.h1`; drop `pointer-events-none`; restore the 2000 ms hold; skip on `pointerdown` instead of `click` (L5 turns red); switch `sessionStorage` back to `localStorage`; remove the reduced-motion check; remove the `removeEventListener`. | T1 is green on the tree. L2–L10 are red on the start code as listed in §3; L1 is green on both. Each mutant turns at least one named case red. |
| **AN-REVIEW-189** | Read the diff, T1 and D1. | Checks: <ul><li>no **new** hardcoded colour, inline colour or custom CSS (the pre-existing inline styles are unchanged, so compare against the start copy);</li><li>no `as`, `any` or `@ts-ignore`;</li><li>no new export apart from an optional duration constant;</li><li>every listener and timer has a cleanup;</li><li>D1 is in Georgian, has the TEMPLATE sections and records R61–R66 with the rejected alternatives;</li><li>doc 155 l.4 is `Completed` and cites C round 188 PASS and `850445c`.</li></ul> |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror. 0 hydration messages on store pages. 0 requests to remote hosts other than the Google Fonts hosts. 0 Authorization headers from the page. The mock's `digital-gift-card` 404 console error (C-R188-I3) is expected and not counted. |

**E2E-189 command** (type it exactly; the pipe is plain regex alternation): `CI= npx playwright test e2e/navigation.spec.ts -g "homepage loads|header logo"`. `CI=` sets an empty `CI`, so `reuseExistingServer` reuses :5173.

**Outcomes written in advance:**
- The overlay is inserted only after hydration, because SSR cannot read `sessionStorage` (R61). The page content therefore paints first, and the loader covers it about 0.6 s later (C measured 0.64 s in round 188). Report the insertion time as **info, not a bug**; it is a recorded trade-off for Saba.
- If the overlay is removed in 1250–1300 ms on a single load while the median is within bound, record it as info (timer jitter), not a FAIL.
- If the logo never reaches 0.9 opacity, the timing compression hid the reveal: that is a K1 FAIL (Medium).
- If the skipping click activates something under the overlay, that is a K3 FAIL (Medium).
- If a one-frame overlay flash appears under reduced motion, that is a K5 FAIL (Low; fix it now, since this round owns the code).
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- The hero or cards render late or shift → STORE-AFTER-189 (pixels, LCP, CLS).
- The card Play is dead or plays on a skip click → HIT-189, SKIP-189.
- The loader replays on every visit to `/` → SESSION-189.
- The e2e hero check flakes → E2E-189, H1-189.
- The Studio look or purchase protection changes → STUDIO-RV-189, G189-3.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store home entrance loader (no Studio behaviour) | **None.** This is a store page, not an Arrangement feature. | Nothing. | Saba approved STORE-REDESIGN, direction A and D10 (2026-10-25). Rulings R61–R66. | STUDIO-RV-189. Parity: **არ ეხება** (not applicable) |

## 6. Evidence and reporting
- **A:** `a-round-189.md` and `a-round-189/`.
- **C:** `c-round-189.md`, `c-round-189.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-189/`. Put the after screenshots in `c-round-189/shots/store-after/`; they are the next baseline (non-scrolled with the popup dismissed, plus full-page with every image complete).
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 190 |
|---|---|
| **C PASS**, planning on or after 2026-10-27 (expected) | Root publishes round 189. STORE-1d → **მზადაა**, which completes STORE-1. Round 190 = **REGRESSION round**: one short check per done or c_pass item at both Studio viewports, plus `npm run test:e2e:smoke`. The additions are listed in `backlog.json` `regression_rounds` → `REGRESSION-ROUND-2026-10-27` (M1, M3, M4, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN, the harness gate-log check, and the store smoke against the mock: STORE-1a/1b/1c and the STORE-1d DUR/SESSION/RM/H1 checks). Then the first STORE-2 sub-stage. |
| **C PASS**, planning still on 2026-10-26 | The first STORE-2 sub-stage, which B splits at that planning. The `@theme` move touches frozen `app.css` and may affect Studio pages (the gold-fill signal), so the split must keep Studio-owned visuals unchanged. Regression runs at the first planning on or after 2026-10-27. |
| C FAIL on DUR, HIT, SKIP, SESSION, RM or H1 | A bounded fix-up in `SpotlightLoader.tsx` comes first, before the regression round if it is cheap. |
| A browser row that can run here did not run | `browserVerified=false`, so STORE-1d is not done, and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 2 grants plus T1 and D1. The mock stays in the loop folder.
- **Root request (C-R188-I3):** the mock has no `digital-gift-card` product, so `/` and `/gift-cards` log a 404 in the cloud. B does not own `mock-api/`. Root may add a fixture entry; nothing is blocked.
- **Signals recorded, not scheduled** (gate-188 review, A-188, C-188):
  - Mobile menu: `aria-expanded`/`aria-controls` and an `inert` collapsed wrapper; N2 selects the wrapper through `parentElement`; one shared brand constant; a `NAV_ITEMS` array → **STORE-2**.
  - `e2e/main-flow.spec.ts:58-61`, plus the `isVisible()` guard and the missing text assertion in `navigation.spec.ts` → signal.
  - The footer is absent on `/store`, products, `/free-downloads`, `/hire-us` and 404, so Gift Cards and Hire Us are reachable there only through the CommandPalette or by URL. R57's premise holds only partly (C-R188-I2) → STORE-2/3 decision with Saba.
  - The Studio link no longer says "Demo" before the click; the page itself still does (reviewer item 6) → note for Saba.
  - `root.tsx:137` `startsWith('/studio')` hides the header on `/studio-lab` too (pre-existing) → signal.
  - `Footer.tsx` uses `<a href>`, which causes full reloads → STORE-2 signal.
- **New signals from B:**
  - `CinemaCurtainLoader`, `PianoCurtainLoader` and `PianoLoadingAnimation` are exported from both barrels but mounted by no route (grep at `850445c`) → STORE-5 cleanup signal.
  - The loader's hardcoded teal and gradient → STORE-2 (direction A).
- **Keep-list question (C-R188-I6):** `TestimonialsSection` ("Netflix Original Score", "2,500+ Happy Customers") is mounted by no route at `850445c`. Recorded as `awaiting_user`. STORE-3 must not treat it as deleted, and must not mount or remove it without Saba.
- **Unknown URL returns 200 (C-R188-I4):** an open Low, moved to `deferred_low_polish`.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered. Fallback (c) continues and blocks nothing. The next checkpoint point is the STORE-REDESIGN exit.
