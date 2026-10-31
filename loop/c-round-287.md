# C round 287: FIX-PD-1a2 (unknown price on cards). Verdict: **FAIL** (1 Low layout finding, an explicit acceptance row fails)

**Verifier:** C, 2026-10-31. Source read-only; no app edits. Evidence: `c-round-287/`.

## Environment
- `env-status.json`: store 200, round 287.
- Dev server :5173 serves A's live tree; it was used for G287-AUTH.
- I made production builds of HEAD `096fa4b` (`git archive` → `/tmp/c287head`) and of A's tree (copy `/tmp/c287a`, sha256 equal to A's 7 paths, `sha-start.txt`). Each build has its own Vite `cacheDir` (L38) and was served on :3287 (HEAD) and :3288 (A). Both were warmed up before probing.
- Mock API :5199 ran `c-round-287/mock-c287.mjs`, a copy of my round-286 `mock-priceless2.mjs` plus `free-pack` (id 11, `standardPrice: 0`, `minPrice: 0`); health returned `products: 11`.
- **Cleanup:** :3287 and :3288 are stopped by PID. The standard `mock-api/server.mjs` is running again, and health returns `products: 8`. The store tree is unchanged at the end (`git status` = the 7 §4 paths; sha256 7/7 OK).

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS | `claims-287.sh` on a `git archive 096fa4b` scratch equals `claims-287-output.txt` except K1 `(archive)` (`claims-c.txt`). The L29 sweep ruling is below |
| SOURCE-SCOPE | PASS | `git status` lists exactly the 5 M + 2 ?? §4 paths. `product-utils.test.ts` diff has exactly 1 `-` line (`expect(standard?.price).toBe(0);`). `git diff 096fa4b` is empty for PurchaseHeader, ProductDetailPage, ProductSidebar, `app/contexts`, `app/services`, the auth files, the 3 protected routes, package.json and the lock file. sha256 equals A's report |
| TYPECHECK | PASS | rc 0 (`typecheck.log`) |
| UNIT | PASS | 7 covering files + `product-price-cards.test.tsx`: **8 files / 134 tests passed** (`unit.log`). PR7, PR8, PR9, VC1–VC4, PC1, PC2 and SC1 each exist exactly once by name |
| UNIT-MUTANTS | PASS | My own script `mutants-c.py` on `/tmp/c287a`; each file was restored and its sha re-checked. N1 red PR5, PR7, VC1 (+VC2). N2 red VC1, VC2 (+VC3). N3 red PR9, PC1 (+SC1). N4 red PC1. N5 red PR8 (+VC3). N6 red VC3 (`mutants-c.txt`) |
| B-VERSION-CARD | PASS | `/products/priceless-track`, A, both viewports:<br>• the card reads `Standard` / `Price unavailable` in `rgb(163,155,142)` (= `--color-muted` `#a39b8e`);<br>• the page text has no `$0`, `$NaN` or `NaN`;<br>• the panel reads `Price unavailable`, and both buttons are `aria-disabled="true"`;<br>• the version-card bbox is 684×124 on A and on HEAD at both viewports (x 612/532, y 335). HEAD shows `Standard $0`.<br>Shots: `shots/{a,head}/version-card-priceless-track-{1440,1280}.png`, `probe/{a,head}.json` |
| B-STORE-CARD | **FAIL** (bbox clause) | Text and colour pass: the `priceless-pack` and `priceless-track` cards read `Price unavailable` in `rgb(163,155,142)` with no `$0` (HEAD: `$0`). The bbox clause fails: **the card's outer box is 400×577.6 on A and 400×589.6 on HEAD, at 1440 and at 1280** (−12 px). See **C-R287-01** |
| B-HOME-CARD | PASS on text/badge; §10 height clause fails (C-R287-01) | Both priceless fixtures appear in the home "Latest Releases" row (the first 8 active products). A, both viewports:<br>• `priceless-track` reads `Price unavailable` with no badge;<br>• `priceless-pack` reads `Price unavailable` with the `Pack` badge;<br>• neither shows `Complimentary` or `$0`.<br>HEAD: `Complimentary` text and a `Complimentary` badge on both (`probe/badges-{a,head}.json`, `shots/{a,head}/home-row-*.png`). The card `article` is 409.6 px high on A and 417.6 px on HEAD |
| B-FREE | PASS | `free-pack`, A = HEAD at both viewports: `/store` card `$0` (`text-2xl font-bold text-foreground`, 589.6 high); home card `Complimentary` with a `Complimentary` badge; panel `$0.00USD` with the buttons enabled |
| B-REGRESS | PASS | 7 standard fixtures, A vs HEAD, both viewports:<br>• `/store` prices `$29 $24 $19 $21 $17 $9 $12` are byte-equal;<br>• price-span and card boxes are identical;<br>• home cards `$29 $24 $19 $21 $17` are byte-equal with identical boxes. `door-slams` and `pulse-loop-kit` are not in the home row, which shows the first 8 active products only;<br>• the panel figures are byte-equal;<br>• the version-card texts are byte-equal with identical boxes; `middle-east` reads `$29` / `$99` |
| B-JOURNEY (L54) | PASS | For all 9 active fixtures plus `free-pack`, the `/store` card label equals the page figure:<br>• `Price unavailable` ↔ `Price unavailable` (2);<br>• `$N` ↔ `$N.00` (7);<br>• `$0` ↔ `$0.00` (free).<br>Clicking `priceless-track` from `/store` opens a page that reads `Price unavailable`. Shots: `shots/a/journey-priceless-track-{1-card,2-page}-{1440,1280}.png` |
| R286-KEEP | PASS | `priceless-pack` reads `Price unavailable`, and both buttons are `aria-disabled="true"`. Click, Enter and Space on Add to Cart and Buy Now produce 0 `/api/cart\|auth\|orders` requests after activation, with no sign-in modal or toast, at both viewports. `door-slams` still shows `$9.00` |
| G287-AUTH | PASS | Dev :5173, fresh context, 0 cookies, both viewports:<br>• `/studio-lab` shows the workspace, the demo badge and 2 Add buttons, with `auth_user` null;<br>• `/studio/middle-east` shows `Sign in required`, 0 `audio[src]` and no workspace;<br>• the token API with no header returns 401 `Please sign in to access Studio.`;<br>• with a fake bearer it returns 403 `Unable to verify ownership` from the route itself. That is not 200 and carries no token.<br>A real-backend 403 is BLOCKED (`probe/auth-dev.json`, `shots/auth/`) |
| DOC-215 | PASS | Line 4 is byte-exact: `**სტატუსი:** Completed (C round 287 PASS)`. The headings equal doc 214's (the same TEMPLATE structure; compared with the H1 title excluded, because the TEMPLATE file's own preamble and its `### წერის სტილი` are guidance). Cited ids N1–N6, PC1–PC2, PR5, PR7–PR9, SC1 and VC1–VC4 all exist. Line 4 presumes PASS, per L28; the fix-up round re-checks it |
| gate | not claimed | Full suite, build, Biome, `verify` and `test:e2e:smoke` are the gate's rows |

**BLOCKED:** the owned-Standard upgrade state in the browser (backend unavailable in cloud; the mock's auth returns 401). Unit rows VC3 and VC4 carry it. This does not make `browserVerified` false.

## C-R287-01 (Low): the unknown-price label shortens the card (/store −12 px, home −8 px)
**Steps**
1. Serve A's tree with `c-round-287/mock-c287.mjs` on :5199.
2. Open `/store` at 1440×900 or 1280×720.
3. Measure the `priceless-pack` and `priceless-track` cards (`a[href="/products/…"]`, the grid item).
4. Click the `SFX` filter and compare `priceless-pack` with its row neighbour `free-pack`.
5. On `/`, measure the `article` of the priceless cards.

**Expected:** §8 B-STORE-CARD says the card's outer bbox equals HEAD's ±1 px. §10 says the muted label must not change the card height.

**Actual:**
- **`/store`:** the card is 577.6 high on A and 589.6 on HEAD, at both viewports.
  - The price line keeps its top (`priceY` 503 on both); only the line itself shrinks, so the last line moves from 547 to 535.
  - In the "All" view both priceless cards share a row, so every row below moves up 12 px: `free-pack` is at y 1276.2 on A and 1288.2 on HEAD, and so on down to `door-slams`.
  - In the SFX-filtered row, the grid item stretches to 589.6, but the visible card frame stays 577.6 while `free-pack`'s frame is 589.6. The two card bottoms in one row are visibly ragged (`shots/a/store-sfx-row-{1440,1280}.png`).
- **Home:** the priceless `article` is 409.6 high on A and 417.6 on HEAD (−8 px). Its neighbours are 417.6.

**Cause:**
- The span changes from `text-2xl` (32 px line) on `/store`, or `text-lg` (28 px line) on home, to `text-sm` (20 px line), as §2.3 and §2.4 mandate.
- The cards are content-sized, so their height follows the line.

**Severity:** Low by the project table (a layout/UX defect with no logic, data or security impact, in a rare state: a product with no price). However, this is an explicit acceptance clause, so the row fails and the round is FAIL (§11: "every runnable row passes").

**For B (L4 "one element, one rule"):**
- The task mandated both `text-sm font-light` in the existing slot and an unchanged card bbox. These two clauses conflict, because the slot's line height is part of the card height.
- Rule which one wins:
  - (a) keep the slot's line box inside the granted files, e.g. a fixed line height or minimum height equal to the known-price line on the unknown branch, with tokens only and no focus/ring tokens;
  - (b) or accept the −12 / −8 px change and drop the bbox bound.
- It is cheap in this round's owned files (§11 "unless this round's files own them cheaply").
- The version card is not affected: its box is unchanged at 124 px.

**Evidence:**
- `probe/p2-{a,head}.json` (`storeAll`, `storeSfx`, `home`);
- `probe/bbox-{a,head}.json`;
- `shots/{a,head}/store-card-priceless-*-{1440,1280}.png`;
- `shots/a/store-sfx-row-*.png`;
- `shots/{a,head}/home-row-*.png`.

## L29 sweep ruling
I ran `grep -nE 'l\.[0-9]+|(app|perf|docs)/[^ `]+|data-testid|aria-[a-z-]+'` over `current-task.md` and kept the untagged hits:
- **§2/§3 headings and the §4/§9 grant lists** (file names): these name files to edit; they do not state facts about code. Not a finding.
- **§8 C rows:** these are acceptance checks. Not a finding.
- **§2.2 "Unchanged: selection, `aria-pressed`, …":** a protection clause that states current behaviour without a tag. My version-card probe covers it (`aria-pressed` present, boxes identical). **Info only**, not a planning FAIL.

## Other observations (info, no new bug)
- In the first probe, the home screenshots `shots/{a,head}/home-card-*.png` are covered by the LeadMagnet popup (keep-list; it auto-opens after scrolling). The second probe set `czaba_lead_magnet` to dismissed; cite `home-row-*.png` from it.
- On `/store` at 1440 and 1280, the middle grid column is empty in both A and HEAD. This is pre-existing and not caused by this round.
- **A's signals for B** (not adjudicated by C):
  - **A-R287-PREMIUM-UNVALIDATED:** the synthetic Premium `price: product.premiumPrice` is unvalidated, so a card could show `$-5` while the panel reads `Price unavailable`. Pre-existing.
  - **A-R287-ARCH-ADAPTER-ZERO:** `productAdapter.ts:108` `(variant.price ?? 0).toFixed(2)`, another `?? 0`.
- A's Low list includes a known-price behaviour change: `resolveCatalogPrice` now skips a negative `standardPrice` on cards (previously `$-1`). The probe fixtures have no negative price, so it is not browser-tested.

## Ableton conformity
Does not apply (Store pages).

## Findings for B
1. **C-R287-01 (Low).** B rules on the clause conflict (a) or (b). Under (a), the fix-up is one class on the unknown branch in `store.tsx` and `ProductCard.tsx`, plus a bbox row.
2. Carry the signals A-R287-PREMIUM-UNVALIDATED and A-R287-ARCH-ADAPTER-ZERO.
3. The L29 info on the §2.2 protection clause.
