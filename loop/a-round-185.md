# A — round 185: STORE-0 mock API

Implementer: A (Claude Opus 5.5) · Date: 2026-10-26 · Task: `current-task.md` round 185 (D-29z150)
No commit, no push. No store code changed. No installs.

## Start checks
- HEAD `3eb4cdb`; `git status` clean; `sha256sum -c --quiet b-round-184-r185-tree-sha256.txt` OK (1010).
- Doc 152 start hash `e337efaf…` matched. `mock-api/` did not exist. **:5199 was not listening at start**, so A started its own mock.

## Changed / new files
| ID | File | Change |
|---|---|---|
| K1 | `tmp/studio-real-loop/mock-api/server.mjs` (new) | Node 22 HTTP mock that uses only `node:http`, `node:process` and `node:url`. It covers §1.1: products (list/filter/sort/page, by handle, by id), empty cart, 501 on cart mutation, 401 on auth, 401 on downloads/orders/payments/sfx-library/recordings/gift-cards/sfx-scenes/chat, health, OPTIONS 204, 404 for everything else. Anchored CORS echoes only `http://127.0.0.1:<port>` / `http://localhost:<port>`, on every response. It binds `127.0.0.1` and `::1` only. Busy port → exit 1. SIGINT/SIGTERM → exit 0. One log line per request, with `auth=yes/no` only. Fixture: 8 products (5 Track, 2 SFX, 1 Loop, 1 inactive SFX `archived-rain`), with `middle-east` present. 2 Tracks have Standard/Premium variants (Premium `includesStems: true`), and the assets are local only. |
| K2 | `tmp/studio-real-loop/mock-api/selftest.mjs` (new) | Spawns the server on a free port, runs 134 checks and prints one line per check. rc 0 means all passed. |
| K3 | `tmp/studio-real-loop/mock-api/README.md` (new) | Written in Georgian. It covers purpose, a scenario, start/stop, port/env, the endpoint table, CORS, the log, the fixture table, P1–P4, "not the real backend / mock PASS ≠ backend evidence", and how to add a product. |
| D1 | store `docs/implementation/2026/quarter-IV/152-studio-grid-test-harness.md` | l.4 → `Completed`. l.71 → struck through + "შესრულდა: C round 184 PASS, გამოქვეყნდა `3eb4cdb`." l.74 → "შემდეგი: STORE-0 mock API (round 185), შემდეგ REGRESSION round." `git diff -U0` hunks are exactly @@ -4, -71, -74. |

There is no store implementation doc (ruling R50), no store tests and no loop file outside the owned ones. A also created its own evidence under `a-round-185/` and helper scripts under `a-round-185/tools/`. **Process note:** the helper scripts (`gen-fixture-typecheck.mjs`, `tsconfig.fixture.json`, and the negative-control copy under `tools/neg/` plus `tsconfig.neg.json`) were written with bash heredoc/sed, not Edit/Write. All lasting deliverables (K1–K3, D1, this report) were written with Edit/Write.

## Checks actually run
- **Selftest:** `node mock-api/selftest.mjs` → **rc 0, 134/134** (`a-round-185/selftest.log`). This is the run after the review fixes; before them it was 102/102.
  - It covers every §1.1 row, plus CORS (allowed, localhost, error 401/404, foreign: `localhost.evil.test`, `127.0.0.1.evil.test`, https, `null`, portless) and traversal (`/api/downloads/../products/1`, `%2e%2e`, `%2f`, `%5c`, `/..`).
  - P1 is checked with POST/PUT/DELETE/PATCH/HEAD and with Origin+Authorization together.
  - Further checks: 0 `Set-Cookie`, IPv6 `::1` answers 200, busy port gives exit 1 with a message, SIGTERM and SIGINT give exit 0, the startup line shows loopback only, the log shows `auth=yes`/`auth=no` and never the token value, the fixture keys are inside the `Product`/`ProductVariant`/`VariantAudioMetadata` allow-lists, and a static P2/P3 source scan passes.
- **Live SSR proof** (mock on :5199, store dev server :5173 already running):
  - `/` 200 and `/store` 200, each containing the 7 active titles and not "Archived Rain" (`ssr-titles-summary.txt`).
  - `/store?search=harbour` shows only Harbour Lights. `/store?category=SFX` shows only Door Slams.
  - `/products/middle-east` 200 and `/products/harbour-lights` 200. `/products/does-not-exist` → **404**.
  - `mock.log` shows the Origin-less SSR requests (`origin=- auth=no 200/404`). Files: `ssr-*.txt`, `mock.log`.
- **Protection proof** (`protection-studio-token.txt`): no header → **401** "Please sign in to access Studio." `Authorization: Bearer fake` → **403** `{"error":"Unable to verify ownership"}`. `mock.log`: `GET /api/downloads origin=- auth=yes 401`. 0 `Set-Cookie`. The literal value "fake" does not appear in the log.
- **CORS preflight** against `http://localhost:5199/api/cart` with Origin `http://127.0.0.1:5173` → 204, ACAO echoed, credentials true, allow-headers include `X-Session-Id` (`preflight-cart.txt`). This was a curl check only; the browser check is C's CART-185.
- **Type proof** (§3 recipe): `tools/gen-fixture-typecheck.mjs` writes the raw `/api/products?pageSize=100` envelope and the 8 handle envelopes as literals typed `ApiResponse<PagedResult<Product>>` / `ApiResponse<Product>`. `npx tsc -p a-round-185/tools/tsconfig.fixture.json` from `store/` → **rc 0, 0 errors** (`tsc-fixture.log`). **Negative control:** an extra `catalogueNumber` gives TS2353, rc 2 (`tsc-negative-control.log`).
- **Local assets:** every fixture `imageUrl` / `audioPreviewUrl` returns 200 on :5173 (`local-assets.txt`).
- **Scope:** frozen 1010 OK. `git status` = exactly ` M` doc 152, 0 `??`. `mock-api/` contains exactly 3 files. `end-sha256.txt` covers doc 152 + 3 mock files. `diff-vs-start.patch` = doc 152 vs `b-round-184/r185-granted-start/` + 3 new files in full.
- Not run, by design (§3): `npm run typecheck`, `npm run lint`, vitest, build, Biome (no store code changed; Biome is not configured for the loop folder). These belong to the gate.

## Code review (actual `code-reviewer` subagent on K1/K2)
- Critical 0, High 0. Fixed:
  - **M1:** a raw path such as `/api/downloads/../products/1` or `/api/auth/%2e%2e/...` normalized into a product route and returned `success: true`. Now any raw dot-segment, `%2e`, `%2f`, `%5c` or `\` gives 404 before routing. `api.studio-token.ts` was not affected, because it fetches the exact path.
  - **M2:** the traversal check in the selftest was vacuous. There are now real traversal cases.
  - **M3:** added key allow-list checks.
  - **M4:** the selftest now waits for `close` instead of `exit`.
  - **M5:** spawned children are killed in `finally`.
  - **L1:** non-printable characters in the URL/Origin are masked in the log.
  - **L2:** added a server `error` listener and `main().catch`.
  - **L3:** a `clientError` handler sends a raw 404 envelope.
  - **L4:** the Origin must have a port.
  - **L5:** a 204 no longer sends `Content-Length`.
  - **L6:** HEAD is now handled like GET on read-only product routes, so it returns a status with no body.
  - **L7:** the default-sort length check, CORS credentials/Vary on 401/404, P1 on other methods, the SIGINT test, the startup-line check and the static P3 scan were added.
- Remaining: L3's raw 404 has no CORS headers (it is a malformed-request path the store never produces). It was not re-reviewed after the fixes.
- **Architecture note (verbatim, for B):** "none. Both files sit in the loop folder, outside the store. They change no store ownership or coupling, add no state or lifecycle to an existing store owner, and touch no region that keeps getting reworked. None of the four signals in `/home/runner/czaba-project/store/.claude/references/architecture-checkpoint.md` applies."

## B acceptance — what A truly passed
- §3 selftest rc 0 ✔ · SSR proof ✔ (SSR reaches the mock; no BLOCKED-env) · protection proof 401/403 + `auth=yes 401` ✔ · type proof 0 errors ✔ · scope ✔ · code review done and addressed ✔.
- **Not A's to claim:** every C row (MOCK-SELF, MOCK-TYPES, STORE-HOME/LIST/PRODUCT, CART-185, G185-3, STUDIO-RV-185, SCOPE, AN-REVIEW, PX-NET/REG-HYD). A ran **no browser**.

## Known gaps / facts for C and B
- The browser preflight/cart call, `<audio>` playback, the hydration warnings and the console baseline were not checked by A.
- `/hubs/chat` → 404 by design. ChatContext may log it.
- HEAD on `/api/cart` → 404 (only GET returns the cart).
- The fixture has `isNew` on 2 products (1 Track, 1 Loop), `isPremium` on 1. `genre=electronic` → 2.
- **Mock process:**
  - :5199 was **not** listening at A's start. A started pid 3679 (pre-review code), stopped it, then started pid 4233 at 06:15:49Z (final code). A stopped pid 4233 with SIGTERM at 06:17:50Z; `mock.log` ends with "SIGTERM, closing".
  - `ss -ltn | grep 5199` is now empty, so :5199 is **not** listening at A's end. **C must start the mock itself.** From round 186 the cloud hook starts it.
- **M1 mutation proof** (`mutation-m1.txt`): a scratch copy with the traversal guard removed (`tools/mut/`, port 51987, stopped afterwards) answered `GET --path-as-is /api/downloads/../products/1` with `{"success":true,…}`. The real server answers 404 `Not found`. So the new selftest traversal rows really discriminate M1.
- Pre-review live-proof files are kept as `pre-review-*.txt` and `mock-pre-review.log`.

## Exact next C checks
1. `node mock-api/selftest.mjs` rc 0, then C's own curl rows (§4 MOCK-SELF-185), including `ss -ltn` for :5199 on loopback only.
2. Start the mock if :5199 is not listening (A stopped its own), then run STORE-HOME/LIST/PRODUCT at 1440/1280/375, CART-185 (preflight + 200 + 0 "Failed to load cart"), G185-3 (fake Bearer → 403, `mock.log` shows `/api/downloads auth=yes 401`), STUDIO-RV-185 vs `c-round-184` rest shots, PX-NET/REG-HYD.
3. SCOPE-185: frozen 1010, ` M` doc 152 only, `sha256sum -c a-round-185/end-sha256.txt`.

## Scope completed
K1, K2, K3, D1. STORE-0 is **not** done until C's browser PASS. The backlog is not marked complete.
