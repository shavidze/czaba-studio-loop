# Round 288: FIX-PD-1a2 fix-up. The "Price unavailable" label keeps the card's line box (C-R287-01, Low), and an invalid synthetic Premium price reads "Price unavailable" (A-R287-PREMIUM-UNVALIDATED, Low)

**Planned by:** B, at the round 287 → 288 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z704:** round 287 closed with C **FAIL**. `browserVerified` and `realVerified` are both true.
  - 12 rows passed at both viewports, including B-VERSION-CARD, B-FREE, B-REGRESS, B-JOURNEY and R286-KEEP.
  - Only the box/height clauses of B-STORE-CARD and B-HOME-CARD failed (C-R287-01).
  - Gate 287 was **skipped**, so the baseline is still `096fa4b` and A's round-287 work is **uncommitted in the tree**. This round builds on it.
  - The stage id stays FIX-PD-1a2.
- **D-29z705:** B's ruling on C-R287-01 (L4, L10). **Option (a) wins: the card height is preserved.**
  - The unknown-price branch keeps `text-sm font-light text-muted` and adds the line height of the known price line.
  - Rejected option (b), "accept −12/−8 px": under the SFX filter it makes the card bottoms in one grid row visibly ragged.
  - **The cause was B's spec.** Round 287 bound one element with two clauses, `text-sm` and "bbox unchanged", and named no winner (L4). Its bound was written without measuring `text-sm` (L3). Both lessons already exist, so no lesson is added.
  - A's L12 question is ruled: the class-substring pins in `product-price-cards.test.tsx` are allowed here. The task mandates the exact class set, so these are source pins, not cascade assertions. The browser box rows remain the real guard.
- **D-29z706:**
  - **A-R287-PREMIUM-UNVALIDATED** is ruled **Low**. The reviewer rated it Medium, but no fixture or known backend emits the price. It is folded in here because `product-utils.ts` is owned and it is the same F9 "card = page" class.
  - The adapter note is a signal only.
  - Two reviewer Lows go to `deferred_low_polish`.

**Owner:** A. **Verifier:** C. **Grants:** §4. This round touches no Studio, auth, cart, checkout or purchase-header code.

## Baseline: HEAD `096fa4b` [K1] plus A's round-287 tree (7 paths, sha256 fixed) [K2]
- `gates/gate-round-287.json` is `skipped` (C FAIL), so no new commit exists.
- **Claims (L29):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-287/claims-288.sh` **before editing**. Its output must equal `b-round-287/claims-288-output.txt`.
  - **The K2 state is preserved as files:** `b-round-287/k2-snapshot/` holds A's 7 round-287 paths (relative paths kept; sha256 equal to K2). Each job runs on a fresh machine, so this snapshot is the only after-the-fact copy of the baseline.
  - C runs the claims on a `git archive 096fa4b` scratch with `k2-snapshot/` copied over it; the output equals `claims-288-output.txt` except K1 `(archive)`.
  - Any difference is a STOP (§8).
- Do not revert, rewrite or reformat any of A's round-287 changes except the lines named in §2.

## 0. Read first
1. `lessons.md` (every role), especially L3, L4, L10, L12, L23, L26, L28, L29 and L54.
2. This task.
3. `tasks/round-287.md` §2–§3 for the design this round finishes.
4. `c-round-287.md` §C-R287-01 and `a-round-287.md` §code-reviewer.
5. A's primitives:
   - `FORWARDREF_COMPONENT.md` (component edits)
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (one line-height utility, tokens only)
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`
   - `GEORGIAN_DOCS.md`

## 1. What C found, and the reference

### 1.1 C-R287-01 (Low, C's evidence)
On A's tree with C's priceless mock, `/store` and the home page measure:

| Card | A | HEAD |
|---|---|---|
| `/store` card | 400×577.6 | 400×589.6 |
| home `article` | 409.6 | 417.6 |

Both values hold at 1440×900 and 1280×720.
- In the "All" view, every row below the priceless cards moves up 12 px.
- In the SFX-filtered row, the card frames are ragged next to `free-pack`.
- **Cause:** the unknown branch's `text-sm` sets a 20 px line. The known `text-2xl` line is 32 px on `/store` and the known `text-lg` line is 28 px on home, and the cards are content-sized [K3, K4].
- **The version card is not affected.** C measured 124 px on A and on HEAD.
- Evidence: `c-round-287/probe/{p2,bbox}-{a,head}.json`, `shots/a/store-sfx-row-{1440,1280}.png`.

### 1.2 B's sketch (L23: tried before dispatch)
- **Method:** dev :5173 (A's tree) with C's `c-round-287/mock-c287.mjs`. On the `Price unavailable` spans, B set inline `line-height` to 2rem on `/store` and 1.75rem on home.
- **Result:** every priceless card measured **589.6 on `/store` and 417.6 on home** at both viewports. These equal `free-pack` and `middle-east` and equal HEAD. The price line's top stayed at 503 and 389.6.
- Evidence: `b-round-287/probe/lh-sketch.cjs` and `lh-sketch.json`.
- The standard mock was restored (`products: 8`).
- **Tailwind:** numeric `leading-N` already compiles in this app (`leading-4`, 4 uses) [K8]. In Tailwind v4, `leading-8` = `calc(var(--spacing) * 8)` = 2rem and `leading-7` = 1.75rem.

### 1.3 A-R287-PREMIUM-UNVALIDATED (Low)
`createDisplayVersions` pushes the synthetic Premium when `product.premiumPrice` is truthy, and copies it unvalidated: `price: product.premiumPrice` [K5].
- For `premiumPrice: -5` (or `Infinity`), the version card reads `$-5`.
- The panel, through `resolvePurchasePrice` (id −2 ≠ −1 → `isValidCatalogPrice`), reads `Price unavailable`.
- This breaks L54, card = page.

### 1.4 Reference and design
- **Reference:** none. This is a Store bug fix-up; the round-286 search (D-29z697) is reused.
- **product-designer:** not consulted, because no new state is introduced.
- **Ableton conformity:** does not apply. **Screen budget:** does not apply.
- **Smallest honest behaviour:**
  - the same label in a line box of the same height;
  - an invalid Premium reads the same words as the panel.
  - Hiding an invalid Premium was rejected: the panel would then still offer a Premium choice that the cards don't show, so card and page would differ again.

### 1.5 Why we missed it
B wrote two binding clauses on one element without a winner (L4) and wrote the bbox bound without measuring `text-sm` (L3). C caught it with exactly the bbox row the task carried. No new lesson.

## 2. The change

### 2.1 `app/routes/store.tsx`: one string, the unknown branch only [K3]
- **Line 559:** `'text-sm font-light text-muted'` → `'text-sm leading-8 font-light text-muted'`.
- The known branch `'text-2xl font-bold text-foreground'` (line 560) is byte-identical.
- Nothing else changes.

### 2.2 `app/components/product/ProductCard.tsx`: one string, the unknown branch only [K4]
- **Line 162:** `'text-sm font-light text-muted'` → `'text-sm leading-7 font-light text-muted'`.
- The known branch `'text-lg font-bold text-foreground'` (line 163) is byte-identical.
- Nothing else changes.

### 2.3 `app/lib/product-utils.ts`: the synthetic Premium [K5]
- **Line 105:** `price: product.premiumPrice,` → `price: isValidCatalogPrice(product.premiumPrice) ? product.premiumPrice : undefined,`
- **Line 100 is unchanged:** `if (product.premiumPrice) {`. That keeps today's presence rule: 0, `undefined` and `NaN` still push no Premium, and only truthy-but-invalid values (−5, `Infinity`) change, to `undefined`.
- `isValidCatalogPrice` stays module-private. Every other function is unchanged.

### 2.4 Not changed
- **`VersionSelector.tsx` stays byte-identical to A's round-287 tree** (sha256 in K2). Do not "harmonise" its unknown span; its card height is already equal.
- `PurchaseHeader.tsx`, `ProductDetailPage.tsx` and `ProductSidebar.tsx`.
- Cart, auth, services and the protected routes.

## 3. Tests

### 3.1 Changed pins in `app/lib/__tests__/product-price-cards.test.tsx` (A's round-287 file; replacements, not removals) [K7]
| Line | Before | After | Why |
|---|---|---|---|
| 180 (PC1) | `toContain('text-sm font-light text-muted')` | `toContain('text-sm leading-7 font-light text-muted')` | §2.2 |
| 192 (PC2) | `not.toContain('text-sm font-light text-muted')` | `not.toContain('leading-7')` | The free span must not carry the unknown line box. This is equal or stronger: the old substring no longer exists anywhere after §2.2, so keeping it would be vacuous |
| 246 (SC1) | `'<span class="text-sm font-light text-muted">Price unavailable</span>'` | `'<span class="text-sm leading-8 font-light text-muted">Price unavailable</span>'` | §2.1 |

- Every other assertion in the file is unchanged.
- No row is deleted.
- If any other existing assertion turns red, that is a STOP (§8).

### 3.2 Appended rows
| File | Row | What it checks |
|---|---|---|
| `product-utils.test.ts`, inside the existing `describe('display version and card price labels')` | **PR10** | `createDisplayVersions` for a Track with `standardPrice` 19:<br>• `premiumPrice: -5` → the Premium version exists with `price === undefined`;<br>• `premiumPrice: Infinity` → the same;<br>• `premiumPrice: 59` → 59;<br>• `premiumPrice: 0` → no Premium, the version names equal `['Standard']`. |
| `product-price-cards.test.tsx`, version-card describe | **VC5** | The `VersionSelector` render for a Track with `standardPrice` 19 and `premiumPrice` −5:<br>• the Premium card contains `Price unavailable`;<br>• the markup has no `$-5`, no `$<!-- -->-5` and no `NaN` (do not assert a bare `-5`: class names such as `gap-5` contain it);<br>• the Standard card still reads `$19` (the `$(<!-- -->)?19` regex, as VC2 does). |

- **PR6 is unchanged.** `product-utils.test.ts:351` covers premiumPrice 59 resolving to 59 [K12].
- PR1–PR9, VC1–VC4, PC1, PC2 and SC1 keep their names.

### 3.3 Mutants (A runs them and records the red rows; C re-runs them; L23 lower bound)
| Mutant | Change | Must go red at |
|---|---|---|
| N7 | `store.tsx`: drop `leading-8` from the unknown branch | SC1 |
| N8 | `ProductCard.tsx`: drop `leading-7` from the unknown branch | PC1 |
| N9 | `product-utils.ts:105` back to `price: product.premiumPrice,` | PR10, VC5 |
| N10 | `product-utils.ts:100` becomes `if (isValidCatalogPrice(product.premiumPrice)) {` (Premium hidden instead of unknown, and 0 would push a Premium) | PR10 |

Round 287's N1–N6 still apply. A re-runs them once on the final tree and reports the red rows.

## 4. Grants (exact)
**Allowed changes:**
- **M** `app/routes/store.tsx`: §2.1 only.
- **M** `app/components/product/ProductCard.tsx`: §2.2 only.
- **M** `app/lib/product-utils.ts`: §2.3 only.
- **M** `app/lib/__tests__/product-utils.test.ts`: append PR10 only.
- **??** `app/lib/__tests__/product-price-cards.test.tsx`: the §3.1 lines plus VC5.
- **??** `docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md` (§5).

**Frozen:**
- `VersionSelector.tsx` (at its K2 sha256);
- every other file, including `PurchaseHeader.tsx`, `ProductDetailPage.tsx`, `ProductSidebar.tsx`, `app/contexts/**`, `app/services/**`, the auth files, `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, every Studio file, `package.json`, the lock file and every loop file (including `mock-api/server.mjs`). A may create files only under the loop folder's `a-round-288/` and write `a-round-288.md`; C likewise under `c-round-288/`.

At the end, `git status` lists the same 7 paths as K2, and no other.

## 5. Doc 215 (A's round-287 doc, same feature; Georgian, technical terms in English)
- **Line 4** becomes exactly `**სტატუსი:** Completed (C round 288 PASS)` (L28).
- **Problem → Solution** gains two entries:
  - C-R287-01 (the line box, D-29z705);
  - A-R287-PREMIUM-UNVALIDATED.
- **Testing** gains PR10, VC5 and N7–N10. Cite only rows that exist (L26).
- **TODO** gains A-R287-ARCH-ADAPTER-ZERO (signal).
- The headings stay TEMPLATE's, in order.

## 6. What A runs (speed rules)
1. Run the claims (see Baseline).
2. Make the edits.
3. Run `npm run typecheck` and `npm run lint`.
4. Run `npx vitest run` on the 7 files in `b-round-286/covering-files.txt` plus `app/lib/__tests__/product-price-cards.test.tsx`. Round 287 ended at 8 files / 134 tests, so the expected result is 8 files / 136 tests.
5. Also run `store-focus-ring` and `store-theme-tokens`. They were 48/48 in round 287.
6. Run mutants N7–N10 and the re-run of N1–N6. Restore the tree after each one and check that its sha256 equals your own post-edit sha256 (record those first). The persisted script may extend `a-round-287/mutants.py` as `a-round-288/mutants.py`.
7. Run one browser smoke at 1440:
   - Use a copy of C's `c-round-287/mock-c287.mjs` in `a-round-288/`, with one added active fixture `bad-premium-track`: `category: 'Track'` (not SFX), **no `variants`** (empty or absent), `standardPrice` 19, `premiumPrice` −5. Without variants and outside SFX, the synthetic Standard/Premium path is the one taken [K14]; a fixture with variants would test real variants and prove nothing. Stop the standard mock by PID first and restore it at the end (`products: 8`).
   - Report the `/store` and home card heights for `priceless-pack`, `priceless-track` and `free-pack`.
   - Report the `bad-premium-track` version cards.
8. Run `code-reviewer`; the round changes 3 or more files.

**Report in `a-round-288.md`:**
- the diff stat against A's round-287 tree;
- the test counts;
- the mutant table;
- the 7 sha256 values;
- any Architecture note, as a backlog signal.

Do not run the full suite or `npm run verify`; the gate does.

## 7. C rows (both viewports, 1440×900 and 1280×720, unless stated)
**Servers:**
- HEAD `096fa4b` build and A's build, each with its own port and `cacheDir`, warmed up (L38).
- The mock is C's `c-round-287/mock-c287.mjs` copied to `c-round-288/`, plus `bad-premium-track` exactly as in §6 step 7 (Track, **no variants**, `standardPrice` 19, `premiumPrice` −5) [K14].
- `mock-api/server.mjs` is never edited. Restore it at the end (`products: 8`).

| Row | Check |
|---|---|
| CLAIMS | `git archive 096fa4b` scratch + `b-round-287/k2-snapshot/` overlaid → `claims-288.sh` equals `claims-288-output.txt` except K1 `(archive)`. Run the L29 sweep |
| SOURCE-SCOPE | `git status` = the 7 K2 paths. `diff` each live path against `b-round-287/k2-snapshot/<path>`:<br>• `VersionSelector.tsx` is unchanged;<br>• the `store.tsx`, `ProductCard.tsx` and `product-utils.ts` diffs are exactly §2.1, §2.2 and §2.3;<br>• the `product-utils.test.ts` diff vs K2 has only `+` lines (PR10);<br>• the `product-price-cards.test.tsx` diff vs K2 has exactly the three §3.1 `-` lines.<br>The frozen files are unchanged against `096fa4b` |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | 8 covering files pass. PR10 and VC5 each exist exactly once |
| UNIT-MUTANTS | C re-runs N7–N10 on its own copy; each is red at least at its §3.3 rows |
| B-LINE-BOX | On A, for every `Price unavailable` span, computed `line-height`:<br>• **32px** on `/store` (`priceless-pack`, `priceless-track`);<br>• **28px** on home;<br>• font-size 14px, colour `rgb(163,155,142)`.<br>Card heights:<br>• `/store` card = 589.6 ±1 = HEAD's card for the same handle;<br>• home `article` = 417.6 ±1 = HEAD.<br>In the SFX-filtered row, the visible card frames of `priceless-pack` and `free-pack` are equal ±1 px. The y of `free-pack` in the All view equals HEAD's ±1 px. Screenshot the SFX row and the home row |
| B-PREMIUM | `/products/bad-premium-track` on A:<br>• the version cards read `Standard $19` and `Premium` + `Price unavailable`;<br>• the page text has no `$-5`, `-$5` or `NaN`;<br>• selecting Premium makes the panel read `Price unavailable` with both buttons `aria-disabled="true"` (card = page).<br>HEAD shows `$-5`; screenshot both. The version-card box is equal to HEAD's ±1 px |
| B-KEEP-287 | Re-check the round-287 rows that this round could touch, at both viewports:<br>• **`priceless-track` version card:** `Price unavailable`, 124 px;<br>• **`/store` and home labels:** `Price unavailable`, no `$0` and no `Complimentary`, and the `Pack` badge on `priceless-pack` home;<br>• **B-FREE:** `free-pack` `$0` / `Complimentary`;<br>• **B-REGRESS:** the 7 standard fixtures. Price strings and card boxes are byte-equal to HEAD; `middle-east` reads `$29` / `$99`, with no Premium change;<br>• **R286-KEEP:** `priceless-pack` buttons soft-disabled, 0 cart/auth/orders requests after activation |
| B-JOURNEY (L54) | For all 10 active fixtures (9 + `bad-premium-track`), the `/store` card label equals the page figure.<br>For `bad-premium-track`, the card reads `$19`. The page opens with Standard selected (the default without `?upgrade=premium` [K13]), and Standard reads `$19.00`. Then Premium is selected, and both the Premium card and the panel read `Price unavailable`.<br>Screenshot card → page → Premium |
| G288-AUTH | Fresh context, no credentials:<br>• `/studio-lab` shows the demo badge, `auth_user` is null, and Add is present;<br>• `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`;<br>• `/api/studio-token?product=middle-east&file=stem-01.wav` returns 401 with no header, and with a fake bearer it is not 200 and has no token.<br>A real-backend 403 is BLOCKED: backend unavailable in cloud |
| DOC-215 | Line 4 is byte-exact `**სტატუსი:** Completed (C round 288 PASS)`. The headings are TEMPLATE's, in order. Every cited row id exists, including PR10, VC5 and N7–N10 |
| gate | The full suite, the build, Biome, `verify` and `test:e2e:smoke` are gate rows. C does not claim them |

**BLOCKED, not a FAIL:** the owned-Standard upgrade state in the browser (backend unavailable in cloud; unit VC3/VC4 carry it).

## 8. STOP conditions (L11)
Write a STOP and change nothing else when:
- the claims output differs;
- a frozen file would need a change, `VersionSelector.tsx` included;
- an existing assertion other than the three §3.1 pins turns red;
- `leading-8` or `leading-7` does not produce a 32 px or 28 px computed line height in A's smoke. Report the measured value; do not substitute an arbitrary value or inline style;
- a row cannot be written without a type assertion.

## 9. Neighbour risk
- **Known prices:** byte-identical classes on the known branch (B-KEEP-287 / B-REGRESS).
- **Vertical alignment:** the price row is `flex items-center`. A taller line box centres the 14 px text in the same 32/28 px band; the price line's top must stay at its HEAD y (B's sketch: 503 / 389.6).
- **Premium presence:** line 100 is unchanged, so `premiumPrice` 0, `undefined` and `NaN` still show no Premium card (PR10, N10). `middle-east` (premiumPrice 99) is unchanged.
- **Scans:** `store-focus-ring` and `store-theme-tokens` must stay green. `leading-*` is not a colour, focus or opacity token. There is one `className` per element, as in round 287.

## 10. Outcome, fixed in advance
- **PASS:** every runnable row passes at both viewports, with `browserVerified` true. Then, after gate publication:
  - FIX-PD-1a2 → **მზადაა**;
  - C-R286-01, C-R286-02, C-R287-01 and A-R287-PREMIUM-UNVALIDATED close;
  - F9 closes.

  The next round is REGRESSION if it is planned on or after 2026-11-02, otherwise FIX-PD-1b.
- **Fix-up:** a Medium or higher finding in B-LINE-BOX, B-PREMIUM, B-KEEP-287 or B-JOURNEY makes the next round a fix-up.
- **Lows:** they go to `deferred_low_polish`, unless the round's own regression is cheap in owned files.

## 11. Deliverables
- **A:** the §4 edits and `a-round-288.md` (with a checkpoint).
- **C:** `c-round-288.md`, `c-round-288.json` and the evidence in `c-round-288/`.

## Claims block (L29)
Every fact about current code in this task carries a K tag from `b-round-287/claims-288.sh`; the output is in `claims-288-output.txt`.

| Tag | Fact |
|---|---|
| K1 | HEAD `096fa4b` |
| K2 | `git status` = 5 M + 2 ?? (A's round-287 paths), with their 7 sha256 values (equal to `a-round-287.md`) |
| K3 | `store.tsx:558–560`: `pack.isPriceUnknown` ? `'text-sm font-light text-muted'` : `'text-2xl font-bold text-foreground'` |
| K4 | `ProductCard.tsx:37` `const isPriceUnknown`; `:161–163`: `isPriceUnknown` ? `'text-sm font-light text-muted'` : `'text-lg font-bold text-foreground'` |
| K5 | `product-utils.ts:100` `if (product.premiumPrice) {`, `:105` `price: product.premiumPrice,` and `:116` `function isValidCatalogPrice` |
| K6 | `VersionSelector.tsx:105`, the unknown span (frozen) |
| K7 | `product-price-cards.test.tsx:180`, `:192` and `:246` hold the `text-sm font-light text-muted` pins |
| K8 | Numeric `leading-N` in `app/**/*.tsx`: `leading-4` ×4; `min-h-11` ×18 (the v4 spacing multiplier is live) |
| K9 | Doc 215 line 4 = `**სტატუსი:** Completed (C round 287 PASS)` |
| K10 | `createVariants`/adapters has no consumer outside `app/services/api/adapters/productAdapter.ts` |
| K11 | The last docs are `214-…` and `215-…` (215 is A's, uncommitted) |
| K13 | `ProductDetailPage.tsx:46/54`: the default selection is Standard unless `?upgrade=premium` |
| K14 | `product-utils.ts:65` maps real variants first; `:85` is the SFX `return [];`. The synthetic Standard/Premium exists only for a non-SFX product without variants |
| K12 | The premium tests: `product-utils.test.ts:154` (39.99) and `:351` PR6; `product-price-cards.test.tsx:78` (99) |
