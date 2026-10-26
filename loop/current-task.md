# CURRENT TASK — Round 186: STORE-1a — three store bugs on the product and home pages (C bugs first)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z151** (`backlog.json` → STORE-REDESIGN `store1_split_d29z151`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the Store-redesign section (2026-10-25). They take precedence over older text.
- **Spec:** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-1. The spec is DATA. B checked every code claim used here at `4a73ced` (§0).
- **Previous task:** `tasks/round-185.md` is an exact copy of the round-185 `current-task.md` (sha256 `a9c57f00…`, checked with `cmp`). The reasoning for this round is in `b-round-185.md`.

## Baseline = HEAD `4a73ced` (gate 185 published)
- **Gate:** `gates/gate-round-185.json` is `published`, commit `4a73ced`, on both remotes. `git status` is clean, with **1011 tracked files**.
- **Frozen list:** `b-round-185-r186-tree-sha256.txt`, **1009 entries** (every tracked file except the 2 grants). B checked it: OK.
- **Grants:** `b-round-185-r186-grants.txt`, 2 files: `app/routes/products.$handle.tsx` and `app/components/home/SpecialOffersSection.tsx`. **Start hashes:** `b-round-185-r186-granted-start-sha256.txt` (`ecdb2c54…`, `531649af…`). **Start copies:** `b-round-185/r186-granted-start/`.
- **New files:** `b-round-185-r186-new-files.txt`: `app/lib/__tests__/product-handle-route.test.tsx` and `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md`.
- **A's first step:** check that HEAD is `4a73ced`, that `sha256sum -c --quiet b-round-185-r186-tree-sha256.txt` is OK, that both start hashes match, and that neither new file exists yet. If anything differs, stop and report.
- **Mock API:** `tmp/studio-real-loop/mock-api/server.mjs` (STORE-0, round 185 C PASS) serves the store data on 127.0.0.1:5199. The cloud hook starts it only at job start. **A and C:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` and stop it at the end. Record which you did. Do not edit the mock.

## 0. Why this round (D-29z151)
- **Round 185: C PASS.** `browserVerified` and `realVerified` are true, and 11 rows passed. Root published it as `4a73ced`. **STORE-0 → მზადაა.**
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24 and today is 2026-10-26, which is 2 days. The first planning on or after **2026-10-27** makes the next round the REGRESSION round, expected to be round 187.
- **Bug gate:** no Critical, High or Medium finding is open.
- **C's two Lows from round 185 come first.** They are store bugs inside STORE-1's "bugs and quick wins" scope. The 2026-10-23 rule allows a Low to be fixed now when the round owns that code and the fix is cheap. Here both are.
- **The round is limited to three bugs** (workflow rule: one feature or at most three tightly related bugs). The spec's STORE-1 holds 5 bugs and 2 features, so B splits it into **1a–1d** (§7). Nothing is dropped.
- **B checked the source at `4a73ced` (read-only):**
  - `products.$handle.tsx` l.39–58: the loader returns `json({ product })` for any product the API returns. **It never checks `isActive`.** `_index.tsx` l.50–67 and `store.tsx` l.86–117 already filter on `isActive`, so an inactive product is hidden from the lists but still on sale at its direct URL. C saw this at round 185 (C-R185-02): `/products/archived-rain` showed "TOTAL PRICE $0.00 USD" with working Add to Cart and Buy Now buttons.
  - `products.$handle.tsx` l.16: the meta description is a fixed template: `${title} - Professional ${type} pack for producers and creators. Studio-quality audio with complete creative freedom.` It ignores `product.description` (an optional `string` in `Product`, `client.ts` l.74) and makes claims that are the same for every product. The same string goes to `og:description` and `twitter:description` (l.22, l.28).
  - `SpecialOffersSection.tsx` l.15: the Gift Cards card loads `https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800`, a forbidden remote host (C-R185-01). `public/images/gift-card.png` exists in the repo: 1024×1024 PNG, a CZABA gift card, 1.1 MB. B looked at it. No component references it yet.
  - SpecialOffers is on **Saba's keep-list** ("restyle only, never remove or reword"). Swapping a decorative background photo for the repo's own gift-card picture changes no text, behaviour, timing or placement (ruling R53, §1).
  - `ArtistBioSection.tsx:12` also has an unsplash URL, but no route imports that component (grep). It is recorded as info, not changed.
  - `mapProductType` (`app/lib/product-utils.ts` l.49–54) returns `'Music' | 'Presets' | 'Sound Effects'`.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| **K1** (C-R185-02) | `app/routes/products.$handle.tsx` loader | After `getProductByHandle` resolves, if `product.isActive === false`, throw `new Response('Product not found', { status: 404 })`, the **same** Response the API-404 path throws. Only a strict `false` is refused. If `isActive` is `true` or missing, the page renders as today. The existing `catch` must not turn this 404 into a 503: rethrow a `Response` unchanged, or do the check outside the `try`. The API 404 → 404 and the other-error → 503 paths stay as they are. |
| **K2** (meta) | `app/routes/products.$handle.tsx` `meta` | `description` = `product.description` with whitespace collapsed and trimmed, when that is non-empty. If it is longer than 160 characters, cut it at the last space at or before character 159 and add `…`, so the result is at most 160 characters. If there is no space in that range, hard-cut at 159 and add `…`. If the description is empty or missing, use the factual fallback `` `${product.title} — ${productType} by CZABA.` ``. No other wording. The same string goes to `description`, `og:description` and `twitter:description`. The title, image, `og:type`, `product:*` and the not-found branch stay byte-identical. A small module-local helper is allowed. **Do not** export it from the route file (only Remix route exports are exported there). |
| **K3** (C-R185-01) | `app/components/home/SpecialOffersSection.tsx` l.15 | `src` → `/images/gift-card.png`. Add `loading="lazy"` and `decoding="async"`: the section is below the fold, and the PNG is 1.1 MB. `alt`, the classes, the overlay, the text, the link and the second card stay byte-identical. That is one changed JSX element and nothing else. |
| **T1** | **new** `app/lib/__tests__/product-handle-route.test.tsx` | See §3. |
| **D1** | **new** `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md` | Georgian, following `TEMPLATE.md`: date, status `In Progress (awaiting C round 186)`, project, context (C-R185-01/02 and the meta template), approach and rulings R52/R53, changed files, problem → solution, testing, TODO. The TODO lists STORE-1b, 1c and 1d (§7). |

**Rulings (vetoable, recorded in the backlog):**
- **R52:** an inactive product's direct URL gives **404**, not a new "unavailable" page. This is the smallest honest behaviour: the lists already hide it, and it must not be sellable at $0.00. Owners do not lose access, because downloads come from `/account/downloads` and the Studio route, not from this page. The real backend's answer for an inactive handle is unknown, so this stays in BACKEND-ONLY-EVIDENCE.
- **R53:** in the keep-listed SpecialOffers section, the decorative photo becomes the local `gift-card.png`. The text, link, layout and behaviour do not change. STORE-2 restyles the section later (glow and gradient removal); that is not part of this round.
- **R54:** the meta fallback says only what the data supports: title, mapped type and the vendor, CZABA. No quality or licence claims.

## 2. A — files you own (everything else is frozen)
- **Grants:** `app/routes/products.$handle.tsx` (K1, K2) and `app/components/home/SpecialOffersSection.tsx` (K3).
- **New:** T1 and D1, plus your own `a-round-186.md` and `a-round-186/`.
- **Protected, byte-identical:** every other tracked file. That includes `client.ts`, `productAdapter.ts`, `product-utils.ts`, `_index.tsx`, `store.tsx`, every Studio-owned file (`app/components/arrangement/*`, `app/lib/arrangement/*`, `studio-lab.tsx`, `app.css`, `CookieConsent.tsx`), the protected purchase and auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `app/lib/auth.ts`, `firebase.client.ts`), `public/`, `e2e/`, `.claude/**`, `package.json` and the configs. Do not touch the `mock-api/` folder or any other loop file.
- **Read first** (rule `read-primitives.md`): `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `API_ERROR_HANDLING.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-route.md` (loader and meta conventions), `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.
- Make every lasting edit with Edit/Write. Helper scripts go under `a-round-186/tools/`. Write `a-round-186/end-sha256.txt` (the 2 grants + 2 new files) and `a-round-186/diff-vs-start.patch`. No commit and no push.

## 3. A — tests and checks (speed rules)
**T1 must contain at least these cases.** Each one must fail on the start copy, or on a one-line mutation of K1/K2, and pass after the change. Prove that in the report: run T1 against a scratch copy of the start route, or list the mutation and its red run.
- **L1:** `isActive: false` → the loader throws a `Response` with status **404**, not 503. Mock `apiClient.getProductByHandle`, following the `sfx-scene-route.test.tsx` mock pattern.
- **L2:** `isActive: true` and `isActive` missing → `{ product }` is returned unchanged.
- **L3:** `ApiError(…, 404)` → 404. Another error → 503. Both unchanged.
- **M1:** a description of 40 characters with inner newlines and double spaces → the collapsed text, identical in `description`, `og:description` and `twitter:description`.
- **M2:** a description of 300 characters → length ≤ 160, ends with `…`, and is not cut inside a word.
- **M3:** empty, whitespace-only and missing description → exactly `` `${title} — Music by CZABA.` `` for a `Track` and `… — Sound Effects by CZABA.` for an `SFX`.
- **M4:** no `data` → the existing not-found meta, unchanged. The meta array for a normal product has the same keys, in the same order, as at the start.
- **M5:** the string `"complete creative freedom"` appears in no meta value.
- **Test notes:** mock `~/components/product` and `~/components/loading` when you import the route module. Build a full `MetaArgs` object for `meta(...)`, because a type assertion is not allowed. Add a case for a 300-character description with no spaces: the result is a hard cut plus `…`.
- **K3** gets no unit test: it is a static `src`. C checks it in the browser (PX-NET-186).

**Run:** `npx vitest run app/lib/__tests__/product-handle-route.test.tsx app/lib/__tests__/product-presentation.test.tsx app/lib/__tests__/product-utils.test.ts`, then `npm run typecheck` and `npm run lint`. Do not run the full suite: that is the gate's job.
**Live proof** (mock on :5199, store on :5173), saved to `a-round-186/ssr-*.txt`:
- `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/products/archived-rain` → **404**. `/products/middle-east` → 200.
- `curl -s http://127.0.0.1:5173/products/middle-east | grep -o '<meta name="description"[^>]*>'` → the fixture description.
- `curl -s http://127.0.0.1:5173/ | grep -c images.unsplash.com` → 0.

**Code review:** use the `code-reviewer` subagent, since there are 4 files. Pass its Architecture note to B verbatim.

## 4. C — rows
Use real Playwright Chromium on the shared :5173 server, with a fresh anonymous context per session, at **1440×900, 1280×720 and 375×812**. Pixel reads run at DPR 2 with `--disable-lcd-text`. Start the mock if :5199 is not listening, log to `c-round-186/mock.log`, and stop it at the end if you started it.

| Row | What | Pass |
|---|---|---|
| **INACTIVE-186** (C-R185-02) | `/products/archived-rain` at the 3 viewports. Then `/products/middle-east` and `/products/door-slams` (the active SFX). | archived-rain: document response **404**, the store's Not Found page, no "TOTAL PRICE", no Add to Cart or Buy Now. `mock.log` shows the SSR `handle/archived-rain` request answered 200, which proves the **store** refused, not the mock. The two active products: 200, h1 = title, variants and prices as at round 185. |
| **META-186** | Read the `<head>` of `/products/middle-east`, `/products/door-slams` and `/products/harbour-lights` from the SSR HTML **and** after hydration (`document.querySelector`). | `description`, `og:description` and `twitter:description` all equal the fixture `description` of that product. No value contains "Professional", "Studio-quality" or "creative freedom". `<title>`, `og:title`, `og:image`, `og:type` and `product:category` are unchanged: compute the expected values from the fixture and the start route (`b-round-185/r186-granted-start/`), since round 185 did not capture the meta tags. The fallback branch is covered by T1 only, because every fixture product has a description. Report that as a fact, not a gap. |
| **PX-NET-186** (C-R185-01) | `/` at the 3 viewports, scrolled through to the bottom so lazy images load. Then every other page C opens. | **0** requests to `images.unsplash.com`, the R2 worker host or any remote host except the Google Fonts hosts already present at round 185. The Gift Cards card's `<img>` has `currentSrc` ending in `/images/gift-card.png`, `complete === true` and `naturalWidth === 1024`, and its response is 200. |
| **OFFERS-VIS-186** | Scroll the section into view and wait for the Gift Cards `img` to have `complete && naturalWidth > 0`. Then screenshot the Special Offers section at the 3 viewports vs the same crop in `c-round-185/shots/store-before/{1440,1280,375}-home.png`. | The heading "Give the Gift of Sound", the paragraph, the "Gift Cards" pill, the "Browse Gift Cards" link and the second card ("The Complete Collection") are unchanged: same text and the same bounding boxes, ±1 px. Only the background photo differs. Measure the contrast of the heading and paragraph text against the darkest and lightest overlay pixels behind them: the heading ≥ 3:1 (large text), the paragraph ≥ 4.5:1. Report the values. A miss is a finding with its numbers, not an automatic FAIL of K3: the overlay is unchanged and STORE-2 owns it. |
| **STORE-AFTER-186** | `/`, `/store` and `/products/middle-east` at the 3 viewports (the spec's before and after rule). Diff against `c-round-185/shots/store-before/`. | Before each full-page shot, scroll through the page and wait until every `img` has `complete && naturalWidth > 0`. The only pixel differences on `/` are inside the Gift Cards card. `/store` and `/products/middle-east` show **0** changed px. On all three pages, C may mask dynamic regions that it identifies, with the reason. On `/` that means the auto-rotating hero (STORE-3) and the LeadMagnet popup. Home LCP and CLS: 3 loads, median. **Pass:** LCP ≤ 2.5 s and CLS < 0.1 (round-185 baseline: 420/412/500 ms, CLS 0.0197/0.0014/0). |
| **PREVIEW-186** | Click Play preview on `/products/middle-east` at 1440. | Real `HTMLAudioElement` `currentTime` advances ≥ 1 s within 3 s (neighbour check; the product page loader changed). |
| **G186-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` without a header and with `Authorization: Bearer fake`. | `/studio-lab`: no `auth_user`, 0 cookies. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. No header → 401. Fake Bearer → **403** `Unable to verify ownership`, with `mock.log` showing `/api/downloads auth=yes 401`. This is mock-backed: it is not real-backend evidence. |
| **STUDIO-RV-186** | `/studio-lab` rest screenshot at 1440 and 1280 with the mock running, vs `c-round-185/shots/c185-1440-1/rest-full.png` and `c-round-185/shots/c185-1280-1/rest-full.png`. | 0 changed px. Studio console: 0 errors (the round-185 baseline; the cart answers now). One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **SCOPE-186** | Frozen list (1009) at C's start and end; A's `end-sha256.txt`; `git status`. | Frozen OK. `git status` = exactly 2 ` M` (the grants) and 2 `??` (T1, D1). `SpecialOffersSection.tsx` diff = one `<img>` element (`src`, `loading`, `decoding`). The `products.$handle.tsx` diff touches only `meta` and `loader`. |
| **T-RUN-186** | Run T1 yourself: `npx vitest run app/lib/__tests__/product-handle-route.test.tsx`. Then copy the start route into a scratch path, point T1 at it there (or apply A's mutation), and check that L1, M1–M3 and M5 go red. | T1 green on the tree. The listed cases are red on the start code or the mutation. |
| **AN-REVIEW-186** | Read the K1–K3 diffs and D1. | The `Response` from K1 is not caught and re-thrown as 503. Only strict `false` is refused. No new export from the route file. No hardcoded colour or custom CSS was added. D1 is in Georgian and has the TEMPLATE sections. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror. 0 hydration messages on the product pages and on `/`. Report any warning with its text. The known `AudioPreviewButton` mismatch belongs to STORE-1b and is info here. 0 Authorization headers from the page. |

**Outcomes written in advance:**
- If `/` still requests unsplash from a component other than SpecialOffers, C reports which file. That is a new Low, not a FAIL of K3.
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- active products, or products with no `isActive` field, start to 404 → INACTIVE-186 and L2;
- the API error paths change (404 vs 503) → L3;
- social share previews lose their image or title → META-186;
- the home layout or the keep-listed SpecialOffers text changes → OFFERS-VIS-186 and STORE-AFTER-186;
- the home LCP gets worse because of the large PNG → `loading="lazy"` plus the STORE-AFTER-186 LCP check;
- the Studio look → STUDIO-RV-186; purchase protection → G186-3.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store product page, meta and home image (no Studio behaviour) | **None.** This is store pages, not an Arrangement feature. | Nothing. | Saba approved STORE-REDESIGN (2026-10-25); rulings R52–R54. | STUDIO-RV-186. Parity: **არ ეხება** (not applicable) |

## 6. Evidence and reporting
- **A:** `a-round-186.md` and `a-round-186/`.
- **C:** `c-round-186.md`, `c-round-186.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-186/`. Put the after screenshots in `c-round-186/shots/store-after/`.
- **Both:** write the report files as you go.

## 7. STORE-1 split and the outcome, fixed in advance
Nothing from STORE-1 is dropped. B split it into bounded rounds:
- **STORE-1a (this round):** C-R185-02, C-R185-01 and the meta template.
- **STORE-1b:** the AudioPlayer progress and volume fill (`AudioPlayer.tsx` l.127 and l.189 use `var(--color-primary)`, which is defined nowhere in `app/`, so the whole track is invisible) → `var(--color-brand)`. Also the `AudioPreviewButton` SSR/CSR difference (`isClient` l.14–44: the server and first client render show the "Preview" label, and the post-mount render drops it, which shifts the layout) → one markup in both states, with a `renderToStaticMarkup` vs first-render test.
- **STORE-1c:** the D15 header (Collections · Studio · About · Sign in + the kept Free Samples link; Gift Cards and Hire Us move to the footer; "Studio Lab — Demo" → "Studio"; a plain wordmark without the gradient), the double h1 (`Header.tsx` l.53 `<h1>CZABA</h1>` plus the hero h1), and the footer's "Czaba Music" (`Footer.tsx` l.74). `ableton-export.ts` "Czaba Music Store" is Studio export metadata and out of scope.
- **STORE-1d:** the D10 entrance loader: at most 1.2 s, skippable, once per session, off under `prefers-reduced-motion`.

| Condition | Round 187 |
|---|---|
| **C PASS**, planning on or after 2026-10-27 | Root publishes round 186. STORE-1a → **მზადაა**; C-R185-01/02 resolved. Round 187 = **REGRESSION round** (M1, M3, M4, e2e smoke, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN, the harness gate-log check and a store smoke against the mock, at both viewports). Then STORE-1b. |
| **C PASS**, planning still on 2026-10-26 | STORE-1b. Regression on the first planning on or after 2026-10-27. |
| C FAIL on K1 (an active product 404s, or a 503 instead of a 404) | **Medium** (purchase path). A bounded fix-up in the route comes first. |
| C FAIL on META, PX-NET or OFFERS text/box | A bounded fix-up in the granted files. |
| A browser row that can run here did not run | `browserVerified=false`, so STORE-1a is not done and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the 2 grants plus T1 and D1. The mock stays in the loop folder.
- **Standing C expectations reset from round 186:** Studio cart-noise console errors = **0**, and the fake-Bearer row is a mock-backed 403. BACKEND-ONLY-EVIDENCE stays open.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered. Fallback (c) continues, and it does not block this round. The next checkpoint point is the STORE-REDESIGN exit.
