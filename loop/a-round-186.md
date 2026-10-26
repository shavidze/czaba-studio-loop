# A — Round 186 report: STORE-1a (K1 inactive 404, K2 meta description, K3 local gift-card image)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-26 · Task: `current-task.md` (round 186, D-29z151). Nothing committed or pushed.

## Start check (§ Baseline)
- HEAD `4a73ced`, `git status` clean at start.
- `sha256sum -c --quiet b-round-185-r186-tree-sha256.txt` → OK (1009 entries), both at start and at end.
- Both grant start hashes OK. Neither new file existed.
- **Mock:** :5199 was **not** listening at start. A started `node mock-api/server.mjs > a-round-186/mock.log` (pid in `a-round-186/mock.pid`) and **stopped it** at the end. After the kill, `ss -ltn` showed :5199 closed and :5173 still listening (untouched). The mock was not edited. The second Biome `--write` on T1 was checked in the patch: it only re-wrapped the `cases` lines.
- Server :5173 was already running (orchestrator). A used it and did not restart or stop it.

## Pre-flight (posted before coding)
- Assumptions: K1 refuses strict `false` only, with the same 404 Response, and the check sits outside the `try`. K2 replaces the template with collapsed or truncated `product.description`, or the fallback `${title} — ${type} by CZABA.`. K3 is one `<img>`.
- Files: exactly the 2 grants plus T1 and D1.
- Success: T1 plus 2 neighbour suites green, and T1 red on the start copy or on mutants. typecheck and lint exit 0. archived-rain → 404, middle-east → 200 with the fixture description, and `/` has 0 unsplash.
- Primitives and templates read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, API_ERROR_HANDLING, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/new-route.md, prompts/new-test.md, docs/implementation/TEMPLATE.md, skills/pre-flight.

## Changed files (end hashes in `a-round-186/end-sha256.txt`, full diff in `a-round-186/diff-vs-start.patch`)
| File | Change |
|---|---|
| `app/routes/products.$handle.tsx` (grant) | **K1:** `let product: Product` is declared before the `try`. After the `try`/`catch`, `if (product.isActive === false) throw new Response('Product not found', { status: 404 })`, then `return json({ product })`. The catch body is unchanged. **K2:** a module-local, non-exported `buildProductMetaDescription(description, fallback)` and a constant `PRODUCT_META_DESCRIPTION_MAX = 160`. The `description` constant now uses it. The import line gains `type Product`. Nothing else in `meta` changed: same keys, order, title, image, `og:type`, `product:*` and not-found branch. |
| `app/components/home/SpecialOffersSection.tsx` (grant) | **K3:** one `<img>`: `src="/images/gift-card.png"`, plus `loading="lazy"` and `decoding="async"`. `alt`, classes, overlay, text, link and the second card are byte-identical (diff = 3 lines in one element). |
| `app/lib/__tests__/product-handle-route.test.tsx` (new, T1) | 12 tests: L1, L2 ×2, L3, M1, M2 ×4, M3 (including runtime `null`), M4, M5. No `any` cast, no assertion, and a full `MetaArgs<typeof loader>`. |
| `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md` (new, D1) | Georgian, TEMPLATE sections, status `In Progress (awaiting C round 186)`, R52–R54, TODO for STORE-1b/1c/1d. |

**Process disclosure:** D1 was created with Write. One later text update to D1 (after the code review) was applied with a small python string replace instead of Edit. The content is as intended and the end hash is recorded. Biome `--write` (format only) was run on the 3 owned code files and changed nothing else.

## K2 interpretation (vetoable by B)
"Cut at the last space at or before character 159": A reads 159 as an **index**, so `collapsed.lastIndexOf(' ', 159)`. The kept text is at most 159 characters and the result at most 160, which matches "hard-cut at 159".
- A first implemented `slice(0,159).lastIndexOf(' ')`. The code-reviewer showed that this cannot see a space at index 159 and drops a whole word that fits.
- If B wants the 1-based reading, it is a one-character change (`cutLimit - 1`). Mutant `m-boundary-158` shows the test that would then need its expectation flipped.

## Tests actually run
- `npx vitest run app/lib/__tests__/product-handle-route.test.tsx app/lib/__tests__/product-presentation.test.tsx app/lib/__tests__/product-utils.test.ts` → **3 files, 53 tests passed** (`a-round-186/vitest-targeted.txt`).
- `npm run typecheck` → exit 0. `npm run lint` → exit 0 (218 warnings repo-wide, none in the owned files: `npx biome lint` on the 3 files reports nothing). `npx biome check` on the 3 owned code files → 0 errors.
- **Red on the start copy** (`a-round-186/t1-red-on-start.txt`; scratch config `a-round-186/tools/vitest.start-copy.config.ts` aliases `~/routes/products.$handle` to `b-round-185/r186-granted-start/...`; no repo file added). **8 of 12 red:** L1, M1, M2 (all 4), M3, M5. The 4 green ones are the preservation cases L2 ×2, L3 and M4.
- **Mutants** (`a-round-186/tools/run-mutants.sh` → `a-round-186/t1-mutants.txt`; scratch copies of the final route). Each mutant turns tests red, and the tree is 12/12 green:
  - `!product.isActive` → L2 (missing field)
  - `404→400` → L3
  - `503→500` → L3
  - check moved inside `try` → L1
  - whitespace collapse removed → M1
  - word cut removed → M2 ×2
  - `indexOf` instead of `lastIndexOf` → M2 ×2
  - boundary 158 → M2 boundary
  - boundary 160 → M2 boundary
  - `og:type` changed → M4
  - `og:image` fallback changed → M4
- **Not run (gate's job):** full vitest, `npm run verify`, build, e2e smoke.

## Live proof (mock :5199 + store :5173)
- `a-round-186/ssr-status.txt`: archived-rain **404**, middle-east 200, door-slams 200, harbour-lights 200, no-such-handle 404.
- `a-round-186/ssr-archived-body.txt`: 0 "TOTAL PRICE" / "Add to Cart" / "Buy Now" markers, and `mock.log` shows `GET /api/products/handle/archived-rain … 200`. The **store** refused, not the mock.
- `a-round-186/ssr-meta.txt`: for all 3 products, `description`, `og:description` and `twitter:description` = the fixture `description` (9/9 matches). 0 hits on Professional / Studio-quality / creative freedom. Titles: `X | CZABA`. `og:type` product. `product:category` Music / Sound Effects / Music.
- `a-round-186/ssr-home-unsplash.txt`: `/` unsplash count **0**, and the SSR `<img src="/images/gift-card.png" … loading="lazy" decoding="async">`.
- **Playwright Chromium** (fresh context, 1440×900, no persistent state file; `a-round-186/browse-check.json`, `a-round-186/home-special-offers-1440.png`):
  - `/`: after a full scroll the Gift Cards img has `currentSrc` …/images/gift-card.png, `complete` true, `naturalWidth` 1024. The only remote hosts are fonts.googleapis.com / fonts.gstatic.com. 0 pageerror, 0 console error or warning.
  - `/products/middle-east`: the hydrated meta equals the fixture. 0 pageerror, 0 console error or warning.
  - `/products/archived-rain`: 404, h1 "Not Found", 0 buy markers. The only console line is the document's own 404 resource error.
- This is **A's own evidence, not C verification.** A did not run C's rows (3 viewports, pixel diffs, LCP/CLS, contrast, preview audio, G186-3, Studio rest shot).

## Code review (code-reviewer subagent, actually invoked)
Score 7/10, no Critical. Findings and handling:
- **Medium, K2 boundary (space at index 159 not seen)** → fixed (`lastIndexOf(' ', 159)`) and covered by the new M2 boundary test. The reading is flagged to B above.
- **Medium, M2 did not catch an `indexOf` mutant** → fixed: M2 now asserts that the next word would pass index 159. The mutant is killed.
- **Low, missing 161-char / 158 / 159 / `null` cases** → added.
- **Low, `JSON.parse` any** → replaced with `Reflect.deleteProperty`.
- **Low, console spy not restored** → `afterEach(vi.restoreAllMocks)`.
- **Low, unresolved:** a hard cut (no space in the first 160 chars) can split a UTF-16 surrogate pair (for example an emoji at index 158). A did not fix it: the spec says "hard-cut at 159" and BMP text, including Georgian, is unaffected. **B may schedule it, or record it under `deferred_low_polish`.**
- **Info (pre-existing, not changed):**
  - `json({ product })` serialises whatever the API returns, including the optional `standardFileUrl` / `premiumFileUrl` fields of `Product`. Neither the mock nor the store renders them, so whether the public endpoint leaks them is a backend question (BACKEND-ONLY-EVIDENCE).
  - The SpecialOffers `hover:shadow-[…rgba(19,217,204,0.3)]` hardcoded colour belongs to STORE-2.
  - The imports below `meta` are older than this change.

**Architecture note (verbatim, for B):** "None of the four signals fire. The helper is pure string formatting with one caller in the same route and no state or lifecycle, so keep it there. Move it to `app/lib/` as a separate, bounded task only if a second route needs the same cut, and take the boundary tests with it." The reviewer's alternative-approach note: long term, the backend should also return 404 for inactive handles, with the loader check kept as a safety net. Keep the loader approach for this round.

## B acceptance criteria — what A truly passed
- K1, K2, K3, T1 (all listed cases plus the no-space hard cut), D1: done. Evidence above.
- T1 red/green proof: done (start copy plus mutants).
- `npx vitest run` (3 files), typecheck, lint: run, all green.
- Live SSR proofs (3 curl checks): done, all as specified.
- code-reviewer: invoked, findings addressed or reported.
- `end-sha256.txt` and `diff-vs-start.patch`: written.
- **Not claimed:** any C row (INACTIVE-186 at 3 viewports, META-186 hydration at 3 products, PX-NET-186, OFFERS-VIS-186, STORE-AFTER-186, PREVIEW-186, G186-3, STUDIO-RV-186, SCOPE-186, T-RUN-186, AN-REVIEW-186, REG-HYD), or any gate row.

## Known gaps
- The surrogate-pair hard-cut Low (above).
- The K2 boundary reading is A's interpretation (above).
- The real backend's behaviour for inactive handles is unknown (BACKEND-ONLY-EVIDENCE).
- `ArtistBioSection.tsx:12` still has an unsplash URL, but no route imports it (info, as B noted).
- The home `Header.tsx` h1 "CZABA" double-h1 is seen on the product pages too (STORE-1c).

## Exact next C checks
1. SCOPE-186: frozen list OK. `git status` = 2 ` M` + 2 `??`. Compare with `a-round-186/end-sha256.txt`.
2. T-RUN-186: `npx vitest run app/lib/__tests__/product-handle-route.test.tsx` → 12/12. To reproduce the red runs: `npx vitest run --config /home/runner/czaba-project/tmp/studio-real-loop/a-round-186/tools/vitest.start-copy.config.ts` (start copy, expect 8 red) and `bash a-round-186/tools/run-mutants.sh`.
3. INACTIVE-186, META-186 (SSR plus hydrated), PX-NET-186, OFFERS-VIS-186, STORE-AFTER-186, PREVIEW-186, G186-3, STUDIO-RV-186, REG-HYD at 1440 / 1280 / 375 as in the task §4. A's mock is stopped at the end of this round, so C must start its own (`c-round-186/mock.log`).
4. AN-REVIEW-186: confirm the K1 Response is outside the `try`, there is no new route export, and the K2 boundary reading.

## Scope completed
STORE-1a implementation (A half) is complete and awaits C round 186. STORE-1a is **not** done until C passes it. The backlog is not complete: STORE-1b/1c/1d and the rest of the queue remain.
