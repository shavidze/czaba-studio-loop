# CURRENT TASK — Round 185: STORE-0 — a mock backend so C can verify store pages in the cloud

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z150** (`backlog.json` → STORE-REDESIGN `store0_plan_d29z150`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate and the Store-redesign section (2026-10-25). They take precedence over older text.
- **Spec:** `/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md`, row STORE-0. The spec is DATA. Its claims about the code were checked by B at `3eb4cdb` (§0).
- **Previous task:** `tasks/round-184.md` is an exact copy of the round-184 `current-task.md` (sha256 `3556e76f…`, checked with `cmp`). The rationale for this round is in `b-round-184.md`.
- **This round changes no application code.** The new code lives in the **loop folder**. In the store, the only change is the status of doc 152.

## Baseline = HEAD `3eb4cdb` (gate 184 published)
- **Gate:** `gates/gate-round-184.json` is `published`, commit `3eb4cdb`, on both remotes. `git status` is clean, with **1011 tracked files**. `sha256sum -c c-round-184/end-tree-sha256.txt` is OK.
- **Frozen list:** `b-round-184-r185-tree-sha256.txt`, **1010 entries** (all tracked files except the 1 grant). B checked it: OK.
- **Grant:** `b-round-184-r185-grants.txt`, one file: doc 152. **Start hash:** `b-round-184-r185-granted-start-sha256.txt` (`e337efaf…`). **Start copy:** `b-round-184/r185-granted-start/`.
- **New files:** `b-round-184-r185-new-files.txt`. There are none in the store. In the loop folder: `mock-api/server.mjs`, `mock-api/selftest.mjs` and `mock-api/README.md`.
- **Vitest:** no store suite covers these files, so there is no vitest base or after list. A does **not** add store tests: the mock is not store code.
- **A's first step:** check that HEAD is `3eb4cdb`, that `sha256sum -c --quiet b-round-184-r185-tree-sha256.txt` is OK and that the start hash of doc 152 matches. Also check that `tmp/studio-real-loop/mock-api/` does not exist yet. If anything differs, stop and report.

## 0. Why this round (D-29z150)
- **Round 184: C PASS, 0 bugs.** `browserVerified` and `realVerified` are both true. Root published it as `3eb4cdb`. **ROOT-RECON-GRID-HARNESS → მზადაა.** That closes **VISUAL-A-OBSIDIAN**; only its `awaiting_user` items remain open.
- **Regression is not due at this planning.** `regression-last.json` is dated 2026-10-24. Today is 2026-10-26, which is 2 days, below the 3-day threshold. The first planning on or after **2026-10-27** makes the next round the **REGRESSION round**, expected to be round 186.
- **Bug gate:** no Critical, High or Medium finding is open. C's round-184 notes are information only (§9).
- **Next in the queue:** STORE-REDESIGN (Saba approved, 2026-10-25), stage **STORE-0**. It comes first and does not depend on the direction. Direction A has been decided anyway (`direction-decision.md`).
- **Why STORE-0 is needed:** the cloud has no backend. The store's SSR loaders call `API_URL`, whose default is `http://localhost:5199`. Today `/`, `/store` and `/products/:handle` render only their error or empty states, so C cannot verify STORE-1…5. The cloud job already starts `node $LOOP/mock-api/server.mjs` when the file exists (backlog `mock_api_hook_confirmed`, `cloud/run.sh` l.127–131 in the loop repo). The root question about that hook is closed, so do not reopen it.
- **B checked the source at `3eb4cdb` (read-only):**
  - `app/services/api/client.ts`:
    - Every call goes through `request<T>()`. It expects the envelope `{ success, data, message? }` (l.35–40, l.450–456).
    - A non-OK status throws `ApiError(message, status)`, using `error.detail || error.message` (l.444–448).
    - A 401 with no stored refresh token throws "Please sign in to continue." (l.389–441).
  - `_index.tsx` l.50–67: `getProducts({ pageSize: 12, sortDesc: true })`, keeps `isActive` items.
  - `store.tsx` l.86–117: `getProducts({ search, category, genre, pageSize: 50, sortDesc: true })`, keeps `isActive` items. `mapCategory` l.63–70: `track` → music, `sfx` / `sound effects` → sfx, `loop` → loops, `preset(s)` → sounds.
  - `products.$handle.tsx` l.39–59: `getProductByHandle`. An `ApiError` 404 becomes a 404 Response; any other error becomes 503.
  - `productAdapter.ts`: `normalizePreviewUrl(audioPreviewUrl) || getPreviewUrl(handle)`. **An empty preview URL falls back to the R2 worker host**, which is a forbidden host.
  - `CartContext.tsx:140` calls `getCart(sessionId)` from the **browser**. That is a cross-origin request from :5173 with `credentials: 'include'`, `Content-Type: application/json` and `X-Session-Id`. It needs a real CORS preflight answer.
  - `PurchasesContext.tsx:56` → `/api/downloads`. `ChatContext.tsx:128` → `/hubs/chat`.
  - **`api.studio-token.ts` l.21–50:** with any `Bearer` header, it calls `${API_URL}/api/downloads`. It treats `success: true` plus a product with the matching `handle`, `isAvailable`, category `track` and a standard or premium licence as **owned**, and then signs an R2 token. So **a mock that answers `/api/downloads` with data would bypass purchase protection.**
  - Category strings used in the existing tests: `'Track'`, `'SFX'`, `'Loop'`, `'preset'`.
  - `playwright.smoke.config.ts` uses `API_URL=http://127.0.0.1:51999`, so the mock on :5199 does not affect the e2e smoke gate.

## 1. What changes (exact)
| ID | File (loop folder unless stated) | Change |
|---|---|---|
| **K1** | **new** `tmp/studio-real-loop/mock-api/server.mjs` | A dependency-free Node HTTP server (Node 22, `node:` built-ins only, no `npm install`). Endpoints and rules are in §1.1. |
| **K2** | **new** `tmp/studio-real-loop/mock-api/selftest.mjs` | Starts the server on a free port (env `MOCK_API_PORT`), calls every row of §1.1 and checks its status and shape. Exit code 0 means every check passed. It prints one line per check. |
| **K3** | **new** `tmp/studio-real-loop/mock-api/README.md` | In Georgian, with technical terms in English. Cover: purpose (the cloud C harness for STORE-1…5); start and stop; port and env; the endpoint table; the fixture list; the protection rules (§1.2); "this is not the real backend, and a mock PASS is not backend evidence"; and how to add a product. |
| **D1** | store `docs/implementation/2026/quarter-IV/152-studio-grid-test-harness.md` | l.4: status → `Completed`. l.71: strike the TODO and mark it done: "C round 184 PASS, published `3eb4cdb`". l.74: the next step becomes "STORE-0 mock API (round 185), then the REGRESSION round". l.72–73 stay as they are. Nothing else changes. |

**No store implementation doc for STORE-0 (ruling R50, vetoable).** STORE-0 is loop-folder-only by design ("no store code"), and the store repository cannot point at a file it does not contain. `mock-api/README.md` is its documentation. The first store-code stage, STORE-1, gets doc 153.

### 1.1 Endpoints (every JSON body uses the `client.ts` envelope)
| Method + path | Answer |
|---|---|
| `GET /api/products` | 200 `{ success: true, data: { items, totalCount, pageNumber, pageSize } }`, exactly these four keys (`PagedResult`, `client.ts` l.42–47). It applies `category` (case-insensitive equality), `search` (case-insensitive substring of `title`, `description`, `tags`, `genre`), `genre`, `isNew`, `isPremium`, `page` (default 1) and `pageSize` (default 20, at most 100). `sortDesc=true` gives newest `createdAt` first. Other parameters are ignored. `totalCount` is the count after filtering. |
| `GET /api/products/handle/:handle` | 200 with the `Product`, including its `variants`. Unknown handle → **404** `{ success: false, message: 'Product not found' }`. |
| `GET /api/products/:id` (digits) | The same, by id. |
| `GET /api/cart` | 200 with the empty `Cart`: `{ id: null, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 }`. |
| `POST/PUT/DELETE /api/cart/**` (items, coupon, gift card, checkout) | **501** `{ success: false, message: 'Cart changes are not available in the CZABA mock API.' }`. This is ruling R51 (vetoable). The spec says "empty or anonymous answers". A fake success would show items that no real backend accepted, so the honest answer is a clear refusal. |
| `/api/auth/**` (login, register, social, refresh, profile, forgot and reset password) | **401** `{ success: false, message: 'Sign-in is not available in the CZABA mock API.' }`. |
| `/api/downloads`, `/api/downloads/**`, `/api/orders/**`, `/api/payments/**`, `/api/sfx-library`, `/api/products/:id/recordings`, `/api/products/*/recordings/**`, `/api/gift-cards/**`, `/api/sfx-scenes/**`, `/api/chat/**` | **401** `{ success: false, message: 'Please sign in to continue.' }`, **whatever `Authorization` header is sent**. |
| `GET /__mock/health` | 200 `{ ok: true, products: <n>, port: <port> }`, with no envelope. |
| `OPTIONS *` | **204** with the CORS headers below. |
| anything else, including `/hubs/**` and path-traversal attempts | **404** `{ success: false, message: 'Not found' }`. Never 500. The server serves **no files**. |

**CORS on every response, including errors:** if the request `Origin` is `http://127.0.0.1:<port>` or `http://localhost:<port>`, echo it back in `Access-Control-Allow-Origin`, with `Vary: Origin`, `Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Id` and `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`. Never send `*`. Any other origin gets no CORS headers.

**Fixture (K1, in code or as a constant):** **8 products**, all typed exactly as `Product` / `ProductVariant` / `VariantAudioMetadata` in `client.ts`. No field outside those interfaces: no catalogue number, credits or counts. Those come in STORE-4, and only from real data.
- **5 × `category: 'Track'`.** One has **`handle: 'middle-east'`**. At least 2 have Standard and Premium `variants`, the Premium one with `includesStems: true`. At least one has `isNew: true` and one has `isPremium: true`.
- **2 × `'SFX'`** and **1 × `'Loop'`**.
- **Every** product has a non-empty `audioPreviewUrl`, either `/middle-east.mp3` or `/videos/hero/hero-music.mp3`. These are store `public/` files that `/studio-lab` already uses.
- **Every** product has an `imageUrl` from `/images/packs/*` (`1.png` … `6.jpg`, `cover.jpg`).
- No remote URL anywhere, so no unsplash and no R2.
- 7 products have `isActive: true`. 1 SFX has **`isActive: false`**, so C can prove the store's filter.
- Titles and descriptions are plain test data: no claims about real people, awards or counts. `vendor: 'CZABA'`.
- `createdAt` is an ISO string, and the values are distinct so the sort is checkable.

**Process and network rules:**
- Listen on `127.0.0.1:5199`, and also on `[::1]:5199` when the host has IPv6 loopback, so that `http://localhost:5199` works from Node SSR and from Chromium. Never `0.0.0.0` or `::`.
- `MOCK_API_PORT` overrides the port.
- If the port is busy, exit with a non-zero code and a clear message.
- Log one line per request to stdout: ISO time, method, path with query, `Origin`, whether an `Authorization` header was present (**yes/no only, never its value**), and the status.
- `SIGINT` / `SIGTERM` close the server cleanly.

### 1.2 Protection rules (binding; any breach is a FAIL)
- **P1.** The mock never answers `success: true` on `/api/downloads*`, `/api/auth/*` or `/api/orders*`, whatever the headers. So `api.studio-token.ts` with a fake Bearer must end in **403 "Unable to verify ownership"**, never in a token.
- **P2.** The mock never sends `Set-Cookie`. The `/studio-lab` acceptance "0 cookies, no `auth_user`" must still hold.
- **P3.** No secrets, no `.env` reads, no network calls out, and no file reads outside its own folder.
- **P4.** The mock does not edit, start or stop any store process. It is not a store dependency and is not committed to the store.

## 2. A — files you own (everything else is frozen)
- **The grant:** doc 152 (D1 only).
- **New, in the loop folder:** `mock-api/server.mjs`, `mock-api/selftest.mjs`, `mock-api/README.md`, plus your own `a-round-185.md` and `a-round-185/`. Touch no other loop file. That includes `backlog.json`, `feature-status.md`, `current-task.md` and the `cloud/` / `loop-v2/` scripts.
- **Protected, byte-identical:** every tracked store file except doc 152. That covers all of `app/` (Studio, contexts, routes, `client.ts`, the protected `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `app/lib/auth.ts`, `firebase.client.ts`), `e2e/`, `.claude/**`, `package.json`, the configs and `public/`.
- **Process rules:**
  - Read first: `GEORGIAN_DOCS.md`, `API_ERROR_HANDLING.md` (for the envelope and status semantics only), `SECURITY_AUDIT.md` (for P1–P3) and `docs/implementation/TEMPLATE.md` (for D1's sections).
  - Make every lasting edit with Edit/Write. Helper scripts go under `a-round-185/tools/`.
  - Write `a-round-185/end-sha256.txt` (doc 152 plus the 3 mock files) and `a-round-185/diff-vs-start.patch` (doc 152 against the start copy, plus the 3 new files in full).
  - No commit and no push.

## 3. A — checks (speed rules)
- `node mock-api/selftest.mjs`: rc 0, with the log in `a-round-185/selftest.log`.
- **Live SSR proof.** If nothing listens on :5199, start `node mock-api/server.mjs > a-round-185/mock.log 2>&1 &`. Then:
  - `curl -s http://127.0.0.1:5173/`, `/store` and `/products/middle-east` must contain fixture titles;
  - `/products/does-not-exist` must give status 404;
  - `mock.log` must show the SSR requests (they have no `Origin`).
  - Save the outputs to `a-round-185/ssr-*.txt`.
  - **If SSR does not reach the mock** (no log lines, for example because the dev server has a different `API_URL`), report it as an environment fact for root. Do not change any store file or env to make it work.
- **Protection proof:** `curl -i 'http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem1.wav'` → 401. The same request with `-H 'Authorization: Bearer fake'` → **403** `Unable to verify ownership`. Check that `mock.log` shows `/api/downloads auth=yes 401`.
- **Type proof of the fixture** (B tested this recipe: a clean probe gives rc 0, and an extra field gives TS2353, rc 2; see `b-round-184/tools/tsconfig.fixture.json` and `fixture-typecheck-probe.ts`):
  - Generate `a-round-185/tools/fixture-typecheck.ts`. It does `import type { Product } from '/home/runner/czaba-project/store/app/services/api/client';` and declares local copies of `PagedResult<T>` and `ApiResponse<T>`, copied from `client.ts` l.35–47 (they are not exported).
  - It assigns the **raw** `/api/products?pageSize=100` response to `const list: ApiResponse<PagedResult<Product>> = …;` and each handle response to `ApiResponse<Product>`, all as literals.
  - Add `a-round-185/tools/tsconfig.fixture.json` with `extends` = the store `tsconfig.json`, `compilerOptions` `{ "noEmit": true, "typeRoots": ["/home/runner/czaba-project/store/node_modules/@types"] }` and `include` = the fixture file plus `/home/runner/czaba-project/store/app/env.d.ts`.
  - Run `npx tsc -p <that json>` from `store/`. It must print **0 errors**. Do not run single-file `tsc`: it drops the Vite and Node ambient types and fails inside `client.ts`.
- `npm run typecheck` and `npm run lint` are not needed: no store code changes. Do not run the full suite.
- **Code review:** the `code-reviewer` subagent on K1/K2 for P1–P3, CORS and robustness. That is 3 new files. Pass its Architecture note to B verbatim.
- Stop the mock you started at the end, unless it was already running before you started. Record which.

## 4. C — rows
Use real Playwright Chromium on the shared :5173 server, with a fresh anonymous context per session, at **1440×900, 1280×720 and 375×812** (spec rule). Pixel reads run at DPR 2 with `--disable-lcd-text`. **Start the mock yourself** if :5199 is not listening, logging to `c-round-185/mock.log`, and stop it at the end if you started it.

| Row | What | Pass |
|---|---|---|
| **MOCK-SELF-185** | Run `node mock-api/selftest.mjs`, then run your **own** checks with `curl`: every row of §1.1, including OPTIONS with `Origin: http://127.0.0.1:5173` and `Access-Control-Request-Headers: content-type,x-session-id`, an unknown path, `/api/../../etc/passwd` and a foreign Origin. | selftest rc 0. Every status and body matches §1.1. CORS echoes the allowed Origin with credentials and never `*`, and a foreign Origin gets no ACAO. 0 `Set-Cookie` headers in every response (P2). `ss -ltn` shows :5199 only on `127.0.0.1` / `[::1]`. |
| **MOCK-TYPES-185** | Build your **own** literal file from the raw `GET /api/products?pageSize=100` envelope plus each `handle` envelope, typed as `ApiResponse<PagedResult<Product>>` / `ApiResponse<Product>` with local interface copies, and typecheck it with your own `tsconfig.fixture.json`, using the §3 recipe. | 0 tsc errors. 8 products: 5 Track, 2 SFX, 1 Loop. 1 inactive. `middle-east` is present. Every `audioPreviewUrl` and `imageUrl` is a local `/` path that answers 200 on :5173. |
| **STORE-HOME-185** | `/` at the 3 viewports. | The SSR HTML already contains the 7 active fixture titles: the home asks for 12 and none is filtered out besides the inactive one. No "Error loading homepage products" in the server output, where visible. A full-page screenshot per viewport is the **STORE "before" baseline**. Capture LCP and CLS (PerformanceObserver, 3 loads, median) **as baseline only**: no store pixel changed, so they are not pass/fail. |
| **STORE-LIST-185** | `/store`, `/store?search=<a word unique to 1 fixture title>` and `/store?category=SFX`, at the 3 viewports. | The list shows the 7 active packs. Search shows exactly the matching one. Category shows only the active SFX product. The inactive product never shows. Screenshots are the "before" baseline. |
| **STORE-PRODUCT-185** | `/products/middle-east` and one other Track with variants, at the 3 viewports. Then `/products/does-not-exist`. | The title renders and there is no 503 page. Variant names and prices come from the fixture. Click the page's preview/play control: a real `<audio>` gets `src` = the fixture's local mp3, and `currentTime` advances ≥ 1 s within 3 s of the click. The unknown handle → the 404 page, with response status 404. |
| **CART-185** | `/cart` and `/` at 1440. Read the console and the network. | `GET :5199/api/cart` is preceded by a successful preflight and returns 200 in the browser. **0** "Failed to load cart" console errors and 0 CORS errors. The cart shows its empty state. **New baseline:** report the remaining console errors exactly. ChatContext's `/hubs/chat` 404, if present, is expected. |
| **G185-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` without a header and **with `Authorization: Bearer fake`**. | `/studio-lab` opens with no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. No header → **401**. Fake Bearer → **403** `{"error":"Unable to verify ownership"}`, and `mock.log` shows that `/api/downloads` answered 401. **This replaces the long-BLOCKED fake-Bearer row with a mock-backed check.** It proves that the store side refuses when the backend refuses. It is **not** evidence of the real backend's ownership logic, which stays in BACKEND-ONLY-EVIDENCE. |
| **STUDIO-RV-185** | `/studio-lab` rest screenshot at 1440 and 1280, **with the mock running**, vs `c-round-184/shots/c184-1440-1/rest-full.png` and `c-round-184/shots/c184-1280-1/rest-full.png`. | 0 changed px. If the first cold 1440 load is blank (ENV-FIRST-LOAD), discard it and replace it once. If pixels differ, also take one shot with the mock stopped. Report both. B rules on whether the difference is legitimate data, for example a header the cart now fills. |
| **SCOPE-185** | Frozen list (1010) at C's start and C's end; A's `end-sha256.txt`; `git status`. | Frozen 1010 OK. `git status` = exactly 1 ` M` (doc 152) and **0** `??`. `git diff 3eb4cdb --stat` lists doc 152 only, and D1's hunks are only l.4, l.71 and l.74. `mock-api/` contains exactly the 3 files. |
| **AN-REVIEW-185** | Read K1–K3. | P1–P4 hold in the code: no `success: true` path for downloads, auth or orders; no `Set-Cookie`; no `fs` read outside the folder; no outbound `fetch` or `http.request`; the `Authorization` value is never logged. Only `node:` imports. README K3 is in Georgian and has the sections listed in §1. |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts. Requests to `127.0.0.1:5199` and `localhost:5199` are allowed now, but there must be no R2 worker, unsplash or other remote host. 0 Authorization headers sent by the page. 0 hydration messages and 0 pageerror. Report any hydration warning on the store pages **as information** with its text: it is pre-existing store behaviour, for example the known `AudioPreviewButton` SSR/CSR mismatch that STORE-1 fixes, not A's work. |

**Outcomes written in advance:**
- If SSR never reaches the mock (`mock.log` has no Origin-less requests) while the browser cart call succeeds, the store rows are **BLOCKED-env for root** (the dev server's `API_URL`). That is not A's FAIL. `browserVerified` stays true for the rows that ran. **Discriminator:** in that case the fake-Bearer studio-token request returns **500** "Unable to prepare Studio access", because the fetch throws, instead of 403. Record a 500 there as BLOCKED-env, not as a FAIL of A's work.
- A row that needs the real backend stays BLOCKED with "backend unavailable in cloud".

**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL. The gate publishes doc 152 only.

**Adjacent behaviour that could break, with the check that catches it:**
- purchase protection through the mock → G185-3 fake Bearer, plus P1 in AN-REVIEW;
- anonymous Studio cookies → G185-3, plus P2;
- the Studio look under a working cart → STUDIO-RV-185;
- forbidden hosts through the preview fallback → MOCK-TYPES (every preview URL non-empty) and PX-NET;
- the e2e smoke gate → it uses :51999 and is unaffected (B checked `playwright.smoke.config.ts`).

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Mock backend for store verification (no Studio behaviour) | **None.** This is verification infrastructure for the store, not an Arrangement feature. | Nothing. | Saba approved STORE-0 (2026-10-25). | STUDIO-RV-185. Parity: **არ ეხება** (not applicable) |

## 6. Evidence and reporting
- **A:** `a-round-185.md` and `a-round-185/`.
- **C:** `c-round-185.md`, `c-round-185.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-185/`, including the STORE "before" screenshots in `c-round-185/shots/store-before/`.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance (B at round 186 planning)
| Condition | Round 186 |
|---|---|
| **C PASS**, planning on or after 2026-10-27 | Root publishes round 185 (doc 152). STORE-0 → **მზადაა**. Round 186 = **REGRESSION round**: M1, M3, M4, e2e smoke, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN and the harness, at both viewports, **plus one store smoke against the mock**. Then STORE-1 (doc 153). |
| **C PASS**, planning still on 2026-10-26 | STORE-1, part 1. Regression on the first planning on or after 2026-10-27. |
| C FAIL on P1 or P2 | A **High** finding. A bounded fix-up in the 3 mock files comes first. |
| C FAIL on a shape, CORS or fixture row | A bounded fix-up in the 3 mock files. |
| SSR is BLOCKED-env | Root fixes the env. B re-plans only the blocked rows. |
| A browser row that can run here did not run | `browserVerified=false`, so STORE-0 is not done and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** doc 152 only. The `mock-api/` folder lives in the loop folder. It is not store code and is not published to the store.
- **The cloud hook** already starts `mock-api/server.mjs` at job start once the file exists, so from round 186 the mock is up for every phase. Two standing C expectations change then. The "2 expected cart-noise console errors" become 0. The fake-Bearer row becomes a mock-backed 403 instead of BLOCKED. B resets both in the round-186 task. If the gate's verify or e2e behaves differently while the mock is running, root records it. B expects no effect, because smoke uses :51999 and vitest does not use the network.
- **Checkpoint:** `b-round-183-checkpoint-request.md` is still unanswered. Fallback (c) continues, and it does not block this round.
