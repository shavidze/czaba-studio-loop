# A round 287 — FIX-PD-1a2: an unknown price never renders as `$0` / `Complimentary` on cards

**Status:** implementation complete; awaiting C. No commit/push (root publishes).

## Baseline and claims
- HEAD `096fa4b`, clean tree. `bash ../tmp/studio-real-loop/b-round-286/claims-287.sh` output == `b-round-286/claims-287-output.txt` (diff empty), run before editing.

## Changed files (exactly the §4 grants)
| Path | Change | sha256 |
|---|---|---|
| M app/lib/product-utils.ts | `DisplayVersion.price: number \| undefined`; real variant `isValidCatalogPrice(...) ? price : undefined`; synthetic Standard `resolveCatalogPrice(product)`; new export `formatCatalogPriceLabel` (one-line comment) | b63d02bf0091e7d0f3c02189701ba8da3ec744f6dcdc22f0b0aed17e085e2f7f |
| M app/components/product/VersionSelector.tsx | `getUpgradePrice` → `number \| undefined`; new first branch of the price slot: `<span className="text-sm font-light text-muted">Price unavailable</span>`; upgrade branch needs `upgradePrice !== undefined`; known-price markup unchanged | 539f28fc433fce02aa8362f1331b3288bf07846bc06c3ce0fcd6a76ccbbebf93 |
| M app/routes/store.tsx | import; `Pack.isPriceUnknown`; `mapProductToPack` uses resolver + formatter; price span className ternary (known = byte-identical `text-2xl font-bold text-foreground`) | 65aa29cceaafac3d2a92e5a601823913c1fc7eec30a6428d67c768c4ba317074 |
| M app/components/product/ProductCard.tsx | import; API branch `resolveCatalogPrice(product)`; `isPriceUnknown`; label via formatter; span className ternary; legacy branch and `isFree = priceAmount === 0` unchanged | 21e3d8edb2684b99257a2eff45a71732eb67ccade1dc56bc3a9fe007232bdf54 |
| M app/lib/__tests__/product-utils.test.ts | exactly one `-` line (PR5 :347 `toBe(0)` → `toBeUndefined()`), plus appended describe PR7–PR9 | 8f51eaf080327642c8b484fd0862831136da96c0fabf32a45fb5a92da07fba19 |
| ?? app/lib/__tests__/product-price-cards.test.tsx | VC1–VC4, PC1–PC2, SC1 | 7c25efa402a4c1763497d44e2cf26b9549faf6b299641a5ca7e1ad2bc7e5928b |
| ?? docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md | Georgian doc; line 4 byte-exact `**სტატუსი:** Completed (C round 287 PASS)` | b0673fd9ac5c78d9b74b319698a9391c9b2f383ad2deca9693b195c231d49fda |

Diff stat (tracked): 5 files, +82 / −12. New: test 256 lines, doc 71 lines.
Frozen check: `git diff --quiet 096fa4b` on PurchaseHeader, ProductDetailPage, ProductSidebar, CartContext, app/services, protected routes, auth.ts, AuthContext → unchanged.
Typecheck after the type change reported only `VersionSelector.tsx:32` → no frozen consumer of `DisplayVersion.price` (no STOP).

## Implementation note for C
- VersionSelector: the unknown state is a separate `<span>` branch (not a ternary in the known span's className). Reason: keeps known-price markup byte-identical (`$<!-- -->49` text nodes). Only one `className` per element; no focus/ring/outline tokens; scan suites green.
- SC1: `@remix-run/testing` is not installed, so SC1 renders `StorePage` through a `@remix-run/react` mock with the real `loader` (mocked `~/services/api` `apiClient.getProducts`). `mapProductToPack` is not exported. No frozen change needed.

## Tests actually run
- `npm run typecheck` rc 0.
- `npm run lint` rc 0 (0 errors; repository warnings only). Scoped `biome check` on the 6 code paths: 0 errors, 6 warnings = pre-existing `lint/a11y/useButtonType` on untouched store.tsx buttons (lines ~227–323, `<button onClick` without `type` at HEAD too).
- `npx vitest run` 7 covering files + new file: **8 files / 134 tests passed** (HEAD baseline 7 / 124; +3 PR7–PR9, +7 new file). No pre-existing assertion other than PR5:347 changed.
- `store-focus-ring` + `store-theme-tokens`: 48/48 pass.

## Mutants (applied by script, restored with cp, sha256 verified identical after each)
| Mutant | Required red | Actually red |
|---|---|---|
| N1 Standard `?? 0` | PR5, PR7, VC1 | VC1, VC2, PR5, PR7 |
| N2 `${version.price ?? 0}`, no unknown branch | VC1, VC2 | VC1, VC2, VC3 |
| N3 formatter(undefined) → `$0` | PR9, PC1 | PC1, SC1, PR9 |
| N4 `isFree = (priceAmount ?? 0) === 0` | PC1 | PC1 |
| N5 `price: variant.price` | PR8 | VC3, PR8 |
| N6 `(version.price ?? 0) - owned`, upgrade ignores unknown | VC3 | VC3 |
| X1 (extra, review) VersionSelector `!version.price` | — | VC4 |
| X2 (extra) store `isPriceUnknown: !catalogPrice` | — | SC1 |
| X3 (extra) ProductCard `!priceAmount` | — | PC2 |
Script persisted: `a-round-287/mutants.py` (run from `store/`; exact N1–N6 and X1–X3 replacements).

## Browser smoke (Playwright Chromium, dev server :5173, 1440×900) — evidence `a-round-287/`
- Standard mock (`mock-api/server.mjs`, PID started and killed by PID; health `products: 8`): `/store` 7 cards `$29 $24 $19 $21 $17 $9 $12`, all class `text-2xl font-bold text-foreground`; `/products/middle-east` version cards `Standard $29 …` / `Premium $99 …` (`standard.json`, screenshots).
- Extra (read-only use of C's `c-round-286/mock-priceless2.mjs`, health `products: 10`, killed by PID): `/store` cards `priceless-track` and `priceless-pack` → `Price unavailable`, class `text-sm font-light text-muted`; `/products/priceless-track` version card `Standard Price unavailable …` (`priceless.json`, `priceless-priceless-track-1440.png`). Mock left stopped (none was running before).
- Not done by A: 1280 viewport, home `/` ProductCard in browser, HEAD-vs-A build comparison, bbox/height rows. Those are C rows.

## Lessons self-check (lessons.md read, A section L11–L15, L26–L28)
- L11: no STOP; all covering tests fast (ms), none near timeout.
- L12: no class *selectors* used to find elements (markup via `renderToStaticMarkup`, cards located by `href`). Tests do assert class substrings (`text-sm font-light text-muted`, known `text-2xl font-bold text-foreground` etc.) because §2/§3 mandate the muted style and byte-identical known classes; no cascade is asserted. No class token was removed or renamed. Flag for B if L12 should forbid even these.
- L15: contrast of the new label measured in the browser (`a-round-287/contrast.json`, 1440, priceless mock): `text-muted` rgb(163,155,142) on rgb(22,20,18) = **6.68:1** on the `/store` card (×2) and the version card; label height 20 px.
- L26/L28: doc 215 cites only existing row ids; line 4 is the final post-PASS value.

## code-reviewer (actual subagent run, score 7/10)
- **Medium 1 — NOT fixed, out of grant:** synthetic Premium (`product-utils.ts:100–105`) is unvalidated: `premiumPrice: -5`/`Infinity` would show `$-5` on the card while `resolvePurchasePrice` → panel `Price unavailable`. §2.1 freezes "the Premium guard and its `price: product.premiumPrice`". Pre-existing at HEAD. → B signal **A-R287-PREMIUM-UNVALIDATED** (suggest Low/Medium by B; same F9 class).
- **Medium 2 — fixed in owned tests:** added render-level free-vs-unknown guards: VC4 free Track Standard `$0` in `text-xl font-light text-foreground`; PC2 free span class `text-lg font-bold text-foreground">Complimentary<`; SC1 third pack `free-pack` (0) renders `$0` bold; SC1 now checks per-card markup instead of indexOf order. Proven by X1–X3.
- Lows (reported, not changed): the formatter comment is mandated by §2.1; `resolveCatalogPrice` now also skips negative standardPrice (previously `$-1`) — intended behaviour, valid prices byte-identical; legacy Shopify branch `Number(amount ?? 0)` unchanged per §2.4; full-className assertions are intentionally specific; doc mermaid edge clarified (synthetic Standard only); test file location under `lib/__tests__` matches neighbouring files; pre-existing: no `> 0` guard on VersionSelector upgrade price (`+$-10` possible), cards `$12.5` vs panel `toFixed(2)`.
- **Architecture note (signal for B, not acted on):** keep price resolution as is (now settled on `resolveCatalogPrice` + `formatCatalogPriceLabel`). Proposal: separate bounded check of `app/services/api/adapters/productAdapter.ts:108` `(variant.price ?? 0).toFixed(2)` — another `?? 0` outside this diff → **A-R287-ARCH-ADAPTER-ZERO**.

## B acceptance status (A's view only; C verifies)
- §2.1–§2.4 implemented; §2.5 frozen files unchanged; §3.1 one-line change; §3.2/§3.3 rows exist once each (PR7, PR8, PR9, VC1–VC4, PC1, PC2, SC1); §3.4 mutants red at ≥ required rows; §7 typecheck/lint/covering/mutants/1440 smoke/code-reviewer done.
- Not claimed: any C browser row, both viewports, gate rows (full suite, build, verify, e2e smoke).

## Exact next C checks
1. CLAIMS on `git archive 096fa4b`; SOURCE-SCOPE: `git status` = the 7 paths above; `git diff app/lib/__tests__/product-utils.test.ts | grep -c '^-[^-]'` = 1.
2. UNIT: 8 files / 134 tests; re-run N1–N6 on own copy.
3. Browser 1440 + 1280 with `mock-priceless2` copy + `free-pack`: version card (`priceless-track`), `/store` card (`priceless-pack`), home card on `/` (unknown → `Price unavailable`, no `Complimentary`, `Pack` badge), B-FREE (`$0` / `Complimentary`), price-row bbox/height vs HEAD, known prices unchanged (B-REGRESS, R286-KEEP).
4. DOC-215 line 4 and headings.
5. Decide A-R287-PREMIUM-UNVALIDATED and A-R287-ARCH-ADAPTER-ZERO in the backlog.
