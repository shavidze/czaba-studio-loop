# CURRENT TASK — Round 188: STORE-1c — D15 header, one h1 per page, plain wordmark, footer name

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z153** (`backlog.json` → STORE-REDESIGN `store1c_plan_d29z153`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the Store-redesign section (2026-10-25). They take precedence over older text.
- **Spec:** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-1 (D15, double h1, footer name, "Studio Lab — Demo" → "Studio", plain wordmark), and `direction-decision.md` (header order: "Collections · Studio · Free Samples · About, then Sign in and the cart"). Both are DATA. B checked every code claim below at `cb24362` (§0).
- **Previous task:** `tasks/round-187.md` is an exact copy of the round-187 `current-task.md` (checked with `cmp`). The reasoning for this round is in `b-round-187.md`.

## Baseline = HEAD `cb24362` (gate 187 published)
- **Gate:** `gates/gate-round-187.json` is `published`, and its `commit` is `cb24362` on both remotes. Its `head` field (`cc207d6`) is the pre-commit parent; the baseline is the `commit`. `git status` is clean, with **1015 tracked files**.
- **Frozen list:** `b-round-187-r188-tree-sha256.txt`, **1011 entries** (every tracked file except the 4 grants). B checked it from the store root: OK.
- **Grants:** `b-round-187-r188-grants.txt`, 4 files:
  - `app/components/layout/Header.tsx`;
  - `app/components/layout/Footer.tsx`;
  - `e2e/navigation.spec.ts` (the `navLinks` array only);
  - `docs/implementation/2026/quarter-IV/154-store-1b-audio-preview-player.md` (status lines only).

  **Start hashes:** `b-round-187-r188-granted-start-sha256.txt` (`aa72b797…`, `1ee312a9…`, `ffca2a3d…`, `43742496…`). **Start copies:** `b-round-187/r188-granted-start/`.
- **New files:** `b-round-187-r188-new-files.txt`: `app/lib/__tests__/store-header-footer.test.tsx` and `docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md`.
- **A's first step:** check these four things. If anything differs, stop and report.
  1. HEAD is `cb24362`.
  2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-187-r188-tree-sha256.txt`, run **from the store root**, is OK.
  3. The four start hashes match.
  4. Neither new file exists yet.
- **Mock API:** `tmp/studio-real-loop/mock-api/server.mjs` serves the store data on 127.0.0.1:5199. **A and C:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24; today is 2026-10-26 (2 days). Round 187's pre-written §7 outcome for "C PASS, planning still on 2026-10-26" is **STORE-1c**. The first planning on or after 2026-10-27 makes the next round the REGRESSION round.
- **C bugs first:** C round 187 found **0 bugs** (PASS, `browserVerified=true`, `realVerified=true`, 11 rows). No Critical, High or Medium finding is open. Its four info items are routed in `b-round-187.md`. C-R187-I1 goes into STORE-1d's acceptance, not here.
- **Code facts B checked at `cb24362`:**
  - **Wordmark** (`Header.tsx:52-54`): `<h1 className="text-2xl font-extrabold text-glow tracking-tighter">CZABA</h1>` inside `<Link to="/">`. `.text-glow` (`app/styles/app.css:1132`) is the `--gradient-text` clip, i.e. the gradient wordmark.
  - **Two h1s on every store page.** Every store route has its own h1 (the home page's is `HeroSection.tsx:159`), and the header adds a second one. The header is not rendered on `/studio*` (`root.tsx:137,144`).
  - **Current nav** (`Header.tsx:57-87` desktop, `175-225` mobile): Store, Gift Cards, Free Samples, About, Hire Us, and "Studio Lab" with a "Demo" badge span.
  - **Footer:** `Footer.tsx:41-46` already links Gift Cards and Hire Us. `Footer.tsx:74` says `© {year} Czaba Music. All rights reserved.`, while `APP_NAME = 'CZABA'` is on l.4.
  - **No `/collections` route.** The only catalogue pages in `app/routes` are `_index.tsx` and `store.tsx`.
  - **e2e:** `e2e/navigation.spec.ts:27-33` lists Gift Cards and Hire Us as header nav links behind an `isVisible()` guard, so after this round it would silently skip them. Line 9 (an `h1` containing "CZABA") keeps passing through the hero h1.
  - **Router in tests:** there is no `@remix-run/testing` devDependency. Round 187 used `MemoryRouter` from the hoisted `react-router-dom`. B keeps that precedent here, which closes the round-187 reviewer item, and adds no new package.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| **K1** (D15, desktop) | `Header.tsx` l.57-87 | The desktop `<nav>` holds exactly four links, in this order: **Collections** → `/store` (`getNavLinkClass('/store')`), **Studio** → `/studio-lab` (`getNavLinkClass('/studio-lab')`), **Free Samples** → `/free-downloads`, **About** → `/about`. Keep `prefetch="intent"` and the existing class helpers. Remove the Gift Cards and Hire Us links, the "Demo" badge `<span>`, and the `whitespace-nowrap` on the Studio link (it is one word, so it has no visual effect). |
| **K2** (D15, mobile) | `Header.tsx` l.175-225 | The mobile `<nav>` holds the **same four links in the same order with the same hrefs**. Each keeps `getMobLinkClass(...)` and `onClick={() => setIsOpen(false)}`. Remove the Gift Cards and Hire Us links and the "Demo" span. |
| **K3** (one h1, plain wordmark) | `Header.tsx` l.53 | `<h1 …text-glow…>CZABA</h1>` → `<span className="block text-2xl font-extrabold tracking-tighter text-foreground">CZABA</span>`. `block` keeps the header's height unchanged, and `text-foreground` is an existing token. Do **not** edit `.text-glow` in `app.css` (`app/styles/**` is frozen). |
| **K4** (footer name) | `Footer.tsx` l.74 | `© {new Date().getFullYear()} {APP_NAME}. All rights reserved.` Nothing else in `Footer.tsx` changes; its Gift Cards and Hire Us links stay. |
| **K5** (e2e list) | `e2e/navigation.spec.ts` l.27-33 | Replace the `navLinks` entries with `{ text: 'Collections', path: '/store' }`, `{ text: 'Studio', path: '/studio-lab' }`, `{ text: 'Free Samples', path: '/free-downloads' }` and `{ text: 'About', path: '/about' }`. No other line changes. |
| **K6** (doc 154) | doc 154 l.4 and l.61 | l.4 → `**სტატუსი:** Completed`. l.61 → C round 187 PASS (`c-round-187.md`, browserVerified), published as `cb24362`. Two lines only; this is the gate-187 reviewer's item 1. |
| **T1** | **new** `app/lib/__tests__/store-header-footer.test.tsx` | See §3. |
| **D1** | **new** `docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md` | In Georgian, with the `TEMPLATE.md` sections: date, status `In Progress (awaiting C round 188)`, project, context, approach (rulings R56–R60 with the rejected alternatives), changed files, problem → solution, testing, and TODO (STORE-1d with C-R187-I1; the STORE-2 signals in §8). |

**Unchanged on purpose (byte-identical in the diff):**
- **`Header.tsx`:**
  - the whole auth block: l.110-157 on desktop (skeleton, user menu, Sign In) and l.226-265 on mobile (`<hr>`, skeleton, Sign In, account links, Logout);
  - the cart link and its badge animation;
  - `CommandPalette` and the toggle button;
  - the use of `useAuth`, `openModal` and `signOut`, and the imports.
- **`Footer.tsx`:** the layout and the links.
- **`HeroSection.tsx`:** its h1 stays; STORE-3 owns the hero.
- **`studio-lab.tsx`:** it is Studio-owned. Its page title "Studio Lab — Demo workspace" and the in-workspace demo badge stay, so `/studio-lab` still declares itself a demo.

### Rulings (vetoable by Saba; record them in D1)
- **R56: "Collections" points to `/store`.** No collections route exists, and seasonal or numbered collections (D14) are a later business decision. The smallest honest behaviour is the existing catalogue under the spec's label. Rejected:
  - a new `/collections` route, because it invents structure;
  - keeping "Store", because it ignores the approved D15.
- **R57: Gift Cards and Hire Us leave the header only.** The footer already links both, so "move to the footer" needs no footer change. Their routes stay, and so do the CommandPalette search entry and the SpecialOffers "Browse Gift Cards" link. Neither page is on Saba's keep-list. **Free Samples is on the keep-list and stays** in both header lists.
- **R58: the footer uses `APP_NAME` ("CZABA").** `ableton-export.ts:440` "Czaba Music Store" is Studio export metadata and out of scope (recorded in the STORE-1 split).
- **R59: the wordmark is a non-heading `<span>` in plain `text-foreground`.** Its link keeps the accessible name "CZABA" and `href="/"`. Each page's own h1 becomes the only h1. The font and size stay; STORE-2 owns typography.
- **R60: the "Sign In" casing is unchanged.** The spec writes "Sign in", but casing is typography, and the button lives in the auth block that this round keeps byte-identical. Owner: STORE-2.

## 2. A — files you own (everything else is frozen)
- **Grants:** `Header.tsx` (K1–K3), `Footer.tsx` (K4, one line), `e2e/navigation.spec.ts` (K5, the array only), doc 154 (K6, two lines).
- **New:** T1 and D1, plus your own `a-round-188.md` and `a-round-188/`.
- **Protected, byte-identical:** every other tracked file. That includes:
  - store files: `HeroSection.tsx`, `root.tsx`, `app/styles/app.css`, `app/components/layout/index.ts`, `PageContainer.tsx`, `CommandPalette`, `app/hooks/*` and `e2e/main-flow.spec.ts`;
  - every Studio-owned file: `app/components/arrangement/*`, `app/lib/arrangement/*`, `studio-lab.tsx` and `CookieConsent.tsx`;
  - the protected purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth.ts` and `firebase.client.ts`;
  - the loader files (owned by STORE-1d), `public/`, `.claude/**`, `package.json` and the configs.

  Do not touch `mock-api/` or any other loop file.
- **Read first** (rule `read-primitives.md`):
  - primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `SECURITY_AUDIT.md` (Header touches the auth UI, even though that block stays identical), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
  - templates: `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

  This is not a forwardRef refactor; the `Header` and `Footer` props stay as they are.
- Make every lasting edit with Edit/Write. Helper scripts go under `a-round-188/tools/`. Write `a-round-188/end-sha256.txt` (the 4 grants and the 2 new files) and `a-round-188/diff-vs-start.patch`. No commit and no push.

## 3. A — tests and checks (speed rules)
**Test setup:**
- Mock `~/hooks` with a controllable `useAuth`: `isAuthenticated`, `isInitializing`, `user`, and `vi.fn()` for `openModal` and `signOut`.
- Mock `~/components/search` with a trivial `CommandPalette` stub.
- Never import `AuthContext`.
- Render inside a `MemoryRouter` with controllable `initialEntries`.
- No type assertions and no `any`.

**T1 must contain at least these cases:**
- **N1 (desktop inventory):** the first `<nav>` in `<header>` has exactly these anchors, text and `href` in order: `[["Collections","/store"],["Studio","/studio-lab"],["Free Samples","/free-downloads"],["About","/about"]]`.
- **N2 (mobile inventory):** the second `<nav>` in `<header>` has exactly the same list. A click on "Toggle menu" and then on the **mobile** "Studio" link (inside the second `<nav>`; the desktop one is also in the DOM) closes the menu: the collapsed classes `max-h-0 opacity-0` are back on the menu wrapper.
- **N3 (what left):** inside `<header>` there are:
  - 0 `h1`–`h6`;
  - no text "Gift Cards", "Hire Us", "Demo" or "Studio Lab";
  - no element with the class `text-glow`;
  - no `href` `/gift-cards` or `/hire-us`.

  The accessible name of the `href="/"` link is "CZABA".
- **N4 (active state):** with `initialEntries={['/store']}`, the Collections link has `after:scale-x-100` and `text-foreground`, and the other three have `after:scale-x-0`.
- **N5 (auth block preserved):** these cases stay green on the start code; they guard what must not change.
  - Anonymous (`isInitializing: false`, `isAuthenticated: false`): a "Sign In" button exists, and a click calls `openModal('signin')` once.
  - Authenticated with `user.firstName: 'Ana'`: the "User menu" button and the text "Hi, Ana!" exist, and "Logout" calls `signOut`.
  - Initializing: the skeleton renders and there is no Sign In button.
- **F1 (footer):** `Footer` renders the text `© {current year} CZABA. All rights reserved.` and no "Czaba Music". The links "Gift Cards" → `/gift-cards` and "Hire Us" → `/hire-us` exist.
- **S1 (SSR):** `renderToString` of `<Header />` in a `MemoryRouter` contains no `<h1` and no `text-glow`.

**Red proof:** run T1 against the start code. Either copy the start copies (`b-round-187/r188-granted-start/`) temporarily over the two code grants, then restore your end copies and check them against `end-sha256.txt`, or list one-line mutants with their red runs. **N1, N2, N3, F1 and S1 must be red on the start code**, and N5 must stay green.

**Run:**
- `npx vitest run app/lib/__tests__/store-header-footer.test.tsx`;
- `npm run typecheck` and `npm run lint`;
- `npx biome check` on the 3 code files. Report the warnings. The pre-existing `useButtonType` warnings in the untouched auth block stay (see §8).

Do not run the full suite: that is the gate's job.

**Live proof** (mock on :5199, store on :5173), saved under `a-round-188/`:
- `curl -s http://127.0.0.1:5173/ | grep -o '<h1' | wc -l` → **1** (the hero; B measured **2** at `cb24362`: header + hero; the loaders render nothing on the server). The same for `/store`, `/products/middle-east` and `/about` → **1** each. The `curl` of `/` contains no `Czaba Music` and no `Studio Lab</a` in the header.
- One Playwright Chromium check at 1440 on `/store`: the header nav inventory, the header height, the wordmark's computed `-webkit-text-fill-color` (not `transparent`), and one screenshot of the header.

**Code review:** use the `code-reviewer` subagent (6 files). Pass its Architecture note to B verbatim.

## 4. C — rows
Setup:
- Use real Playwright Chromium on the shared :5173 server, with a fresh anonymous context per session, at **1440×900, 1280×720 and 375×812**. Pixel reads run at DPR 2 with `--disable-lcd-text`.
- Start the mock if :5199 is not listening, log to `c-round-188/mock.log`, and stop it at the end if you started it.
- Dismiss the LeadMagnet popup (or use non-scrolled shots) before any screenshot comparison (C-R187-I2).
- On `/`, wait for the entrance loader to unmount and hit-test before clicking (C-R187-I1).

| Row | What | Pass |
|---|---|---|
| **NAV-188** (K1, K2) | 1440 and 1280: inventory the visible desktop header nav; click each link from `/` and check the URL. 375: open "Toggle menu", inventory the mobile list, click **Studio**, then check that the menu closed and the URL. | The desktop and mobile lists are both exactly: Collections `/store`, Studio `/studio-lab`, Free Samples `/free-downloads`, About `/about`, in that order. No Gift Cards, Hire Us or "Demo" anywhere in the header. Collections shows its active underline on `/store`. "Studio" lands on `/studio-lab` with the workspace and the in-page demo badge, and `auth_user` is null. Sign In is visible at 1440/1280 (desktop) and inside the 375 menu. |
| **H1-188** (K3) | `/`, `/store`, `/products/middle-east`, `/about`, `/free-downloads`, `/gift-cards`, `/hire-us` and a 404 URL: hydrated (after the loader unmounted) and as SSR HTML (JS off). | Exactly **1** `h1` per page **outside the entrance loader overlay**, in both the SSR and the hydrated DOM. The header contains 0 headings. B checked: `SpotlightLoader` (mounted on `/`) is client-only (`shouldShow` starts `false`) and has no h1, and `CinemaCurtainLoader` (which has an h1) is not mounted on `/` at `cb24362`. If a loader h1 nevertheless appears while it is up, record the count and the duration as info for STORE-1d (not a FAIL of this round). |
| **MARK-188** (K3) | The wordmark at the 3 viewports. | Computed `-webkit-text-fill-color` is not `transparent` and `background-image` is `none`. The colour equals the `text-foreground` token (runtime probe). Contrast against the header background is ≥ 4.5:1. The link's accessible name is "CZABA", with `href="/"`; a click from `/store` goes to `/`. The header's height is unchanged: the content below the header is not shifted (checked by STORE-AFTER-188). Report the header box height. |
| **FOOT-188** (K4) | The footer on `/` and `/store` at the 3 viewports. | The text reads `© 2026 CZABA. All rights reserved.`. 0 "Czaba Music" in the rendered DOM of the 8 H1-188 pages. The footer's Gift Cards and Hire Us links are present and go to `/gift-cards` and `/hire-us` (200, page h1 visible); the same pages also open by direct URL. |
| **KEEP-188** | The keep-list on `/` and in the header. | The Free Samples link is present in both header lists. The LeadMagnet popup still appears as before. SpecialOffers (incl. "Browse Gift Cards"), the "Limited" badges and the testimonials and stats are unchanged (via STORE-AFTER-188). |
| **STORE-AFTER-188** | `/`, `/store` and `/products/middle-east` at the 3 viewports, vs `c-round-187/shots/store-after/` (e.g. `1440-store.png`, `1440-product-middle-east.png`, `*-home.png`; fallback `c-round-186/shots/store-after/`). Use the non-scrolled shots and the 185seq method, with the popup dismissed or excluded. | Changed pixels only inside the header band (wordmark, nav) and the footer copyright line; report both bboxes. 0 changed px elsewhere, except the masked auto-rotating hero on `/`. Home LCP ≤ 2.5 s and CLS < 0.1 (3 loads, median; round-187 baseline 376/352/344 ms, CLS 0.0009/0.0014/0). |
| **E2E-NAV-188** (K5) | Run the command printed below the table, with the mock and the shared :5173 server. | The three tests pass. If the runner cannot reuse the server here, record the reason and rely on NAV-188; that is not a FAIL of A. |
| **G188-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` without a header and with `Authorization: Bearer fake`. | `/studio-lab`: no `auth_user`, 0 cookies, the workspace and the demo badge are present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. No header → 401. Fake Bearer → **403** "Unable to verify ownership", and `mock.log` shows `/api/downloads auth=yes 401`. This is mock-backed, not real-backend evidence. |
| **STUDIO-RV-188** | `/studio-lab` rest screenshot at 1440 and 1280, vs `c-round-187/shots/c187-{1440,1280}-1/rest-full.png` (fallback `c-round-186/shots/c186-{1440,1280}-1/rest-full.png`). | 0 changed px (the header is not rendered on `/studio*`). 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **SCOPE-188** | The frozen list (1011) at C's start and end, run from the store root; A's `end-sha256.txt`; `git status`; the diffs. | The frozen list is OK. `git status` is exactly 4 ` M` and 2 `??`. `Header.tsx` has added or removed lines only at the wordmark line and in the two nav lists: **no added or removed line** in l.89-166 or l.226-269 of the start file (unchanged context lines inside a hunk are fine). The `Footer.tsx` diff is 1 line. The `navigation.spec.ts` diff is only inside the `navLinks` array. The doc 154 diff is 2 lines. |
| **T-RUN-188** | Run T1 yourself. Then run it against the start copies (a scratch config, or a temporary copy with a restore) or against your own mutants: restore the h1/text-glow, restore "Czaba Music", restore one removed link. | T1 is green on the tree. N1, N2, N3, F1 and S1 are red on the start code. N5 is green on both. |
| **AN-REVIEW-188** | Read the diffs, T1 and D1. | No new export, no hardcoded colour, no custom CSS, no `as`/`any`/`@ts-ignore`. D1 is in Georgian, has the TEMPLATE sections and records R56–R60 with the rejected alternatives. Doc 154: l.4 is `Completed`, and the C line cites the round-187 PASS and `cb24362`. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror. 0 hydration messages on the store pages. 0 requests to remote hosts other than the Google Fonts hosts. 0 Authorization headers from the page. |

**E2E-NAV-188 command** (type it exactly; the pipes are plain regex alternation): `CI= npx playwright test e2e/navigation.spec.ts -g "desktop nav links|homepage loads|header logo"`. `CI=` sets an empty `CI`, so `!process.env.CI` is true and `reuseExistingServer` reuses :5173.

**Outcomes written in advance:**
- A second h1 that comes only from the entrance loader is info for STORE-1d, not a FAIL here.
- A header-height change that shifts page content is a K3 fix-up, with Low or Medium severity according to C's CLS evidence.
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- Sign In, the user menu or Logout stop working → N5, SCOPE-188 (no auth hunks) and NAV-188;
- the mobile menu does not close after navigation → N2 and NAV-188;
- the sticky header's height changes and shifts every page → MARK-188 and STORE-AFTER-188 (CLS);
- Gift Cards or Hire Us become unreachable → FOOT-188;
- the Studio look or purchase protection changes → STUDIO-RV-188 and G188-3.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store header, wordmark and footer (no Studio behaviour) | **None.** These are store pages, not an Arrangement feature. | Nothing. | Saba approved STORE-REDESIGN and direction A (2026-10-25). Rulings R56–R60. | STUDIO-RV-188. Parity: **არ ეხება** (not applicable) |

## 6. Evidence and reporting
- **A:** `a-round-188.md` and `a-round-188/`.
- **C:** `c-round-188.md`, `c-round-188.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-188/`. Put the after screenshots in `c-round-188/shots/store-after/` as the next baseline: non-scrolled shots with the popup dismissed, plus full-page shots with every image complete.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 189 |
|---|---|
| **C PASS**, planning on or after 2026-10-27 (expected) | Root publishes round 188, and STORE-1c → **მზადაა**. Round 189 = **REGRESSION round**: one short check per done or c_pass item at both Studio viewports, plus `npm run test:e2e:smoke`. Additions: M1, M3, M4, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN, the harness gate-log check, a store smoke against the mock (`/`, `/store`, `/products/middle-east`, `/products/door-slams` for C-R186-01, `/products/archived-rain` 404, meta from data, 0 unsplash), the STORE-1b fill, the flip **on the `/` card buttons** (`/store` has none), and the STORE-1c header inventory, one h1 and footer name. Then STORE-1d. |
| **C PASS**, planning still on 2026-10-26 | STORE-1d, with C-R187-I1 in its acceptance. Regression on the first planning on or after 2026-10-27. |
| C FAIL on NAV, H1, MARK or FOOT | A bounded fix-up in the granted files (severity by C's evidence) comes first, before the regression round if it is cheap. |
| A browser row that can run here did not run | `browserVerified=false`, so STORE-1c is not done and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 4 grants plus T1 and D1. The mock stays in the loop folder.
- **Signals recorded, not scheduled** (gate-187 review and A-187):
  - Move the card preview overlay out of the `Link` (`ProductCard.tsx:117-133`) and rebuild the slider fill on the `--progress`/`--color-outline` pattern → STORE-2 proposal.
  - `aria-hidden` on the 4 play/pause SVGs in `AudioPreviewButton.tsx` → `deferred_low_polish`.
  - The `doUnmock` test isolation in T1-187 → signal.
  - The gold fill on Studio pages under the obsidian theme → info.
  - `ProductCard.tsx:141` uses the undefined tokens `bg-primary`/`text-primary-foreground` on the non-new badge → deferred Low, owner STORE-2. Restyle only: "Limited" is on the keep-list.
  - Loosen T1-187 P2 if STORE-2 adds a `primary` token.
- **New signals from B:**
  - In the Header auth block, the buttons lack `type="button"`, the toggle lacks `aria-expanded`, and the collapsed mobile links stay focusable → STORE-2 signals. The block stays byte-identical this round.
  - `.text-glow` becomes unused after K3 → STORE-2/5 cleanup.
  - `e2e/main-flow.spec.ts:58-61` still lists `/music` and `/hire-us` behind `isVisible()` → signal.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered. Fallback (c) continues and blocks nothing. The next checkpoint point is the STORE-REDESIGN exit.
