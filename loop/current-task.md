# Round 509: B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD. The product-page "Complimentary Download" button does nothing. Make it an honest "Get it free" that runs the Buy Now path

**Planned by:** B at the round 508 → 509 planning, 2026-11-14 (`b-round-508.md`). Round 508's task is archived as `tasks/round-508.md`.

## Decisions (`backlog.json` v513, `decisions_log_b`)
- **D-29z1837:** round 508 passed C (`c-round-508.json`, `browserVerified` true) and was published as `cf89736`. NONBRAND N1 is verified.
- **D-29z1838:** follow-ups from round 508 are recorded. All of them are Low or info and deferred.
- **D-29z1839:** this round. It contains:
  - the product-designer ruling (a);
  - B's browser stub proof;
  - the shared hook;
  - the NONBRAND `ProductSidebar` l.75 migration in the same edit.
- **D-29z1840:** three questions for Saba in `user-review/questions-round-509.md`. The defaults below are what ships.

## Rules
- **Read `lessons.md` first.** These lessons apply: L4, L10, L12, L23, L29, L36, L47, L50, L52, L54, L57, L58 and L59.
- **No byte sketch this round.** A writes the code. Any number below that B did not run on a sketch is marked **record**. It is not an assert (L58).
- **STOP (L10).** Write "STOP — needs B ruling" and change nothing more if any of these happens:
  - a Medium-or-higher finding needs a change outside the grants;
  - a test outside the grants fails;
  - a covering test is slow (> 2,500 ms);
  - a frozen check is not rc 0;
  - a protected file would need to change.
- **Pre-ruled Lows.** If one is raised again, it goes under "For B", not a STOP:
  - **#1:** the focused button loses focus when it becomes disabled during checkout, as header Buy Now does at HEAD;
  - **#2:** the header still says "Buy Now" at $0 (D1, SABA-Q-509-BUYNOW-FREE-LABEL);
  - **#3:** `begin_checkout` and `InitiateCheckout` fire with price 0. This is the unchanged Buy Now analytics;
  - **#4:** the real $0 order is unverified (D2, FREE-CHECKOUT-REAL-BACKEND);
  - **#5:** AuthModal has no `role=dialog` and no focus move or trap (B-R509-AUTHMODAL-NOT-A-DIALOG, pre-existing, SYS-R495-SHARED-DIALOG);
  - **#6:** no hooks barrel export (§2);
  - **#7:** the store still says "Complimentary" on cards, the badge and `/free-downloads` while the button says "Get it free" (SABA-Q-509-FREE-LABEL-WORDING).
- **Purchase protection.** Protected files stay byte-identical (check 2). No new download path or URL is created. No file is served without ownership. The preview MP3 is never offered as the product.
- **Persistent screen text (L39).** Nothing is added. The existing button's label changes: "Complimentary Download" becomes "Get it free". The new toast is transient.
- **Out of scope:**
  - the header's Buy Now/Add to Cart labels and markup;
  - `CartContext.tsx`, `/free-downloads` and Studio;
  - the other NONBRAND stages.
- **Paths:**
  - loop: `/home/runner/czaba-project/tmp/studio-real-loop`;
  - store: `/home/runner/czaba-project/store`.

## Baseline
- **HEAD is `cf89736`** (gate 508 published it on both remotes). The worktree was clean at planning.
- **Frozen checks.** Run each from `store/`. All were rc 0 at planning.
  1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-508/r509-tree-sha256.txt` covers all 1,421 tracked files except the grants.
  2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt` covers the protected files.
  3. Before editing: `sha256sum -c b-round-508/r509-pre-sha.txt` covers the four granted tracked files at HEAD.

## 0. Why this round
- **Bugs first.** B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD is a Medium. B reproduced it in the real browser at 1440 and 1280 (`b-round-508/probe/free-stub.json`, `free-1440.png`):
  - the element is a `BUTTON` with no `href` or `type`;
  - clicking it leaves the URL unchanged, opens 0 dialogs and logs 0 page errors.
- **The cloud stub works.** The probe uses `page.route` on the client-navigation request `/products/harbour-lights?_data=routes%2Fproducts.%24handle` and rewrites every price to 0. That page then shows "Complimentary Download", and the header shows "$0.00 USD" with Add to Cart and Buy Now.
  - So the free-fixture half of ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE is not needed.
- **A second defect in the same control.** `ProductSidebar.tsx:35` decides "free" from `resolveCatalogPrice` (the Standard or catalogue price). `PurchaseHeader` charges `resolvePurchasePrice(product, selectedVersion)` (`ProductDetailPage.tsx:68`). With Standard at $0 and Premium at $9, the sidebar still offers "free" while Premium is selected.
- **Timing:**
  - REGRESSION is due on or after 2026-11-16, so not yet;
  - RETRO is round 510, so this is the last normal round before it.

## 1. Reference: how established stores do it, and the product-designer ruling
- **Ableton:** not applicable (Store).
- **Store practice:** the consult (`b-round-508/consult-product-designer.md`) rules on the store's own rule, "a control does what its label says". On a $0 product the primary action is the normal acquisition flow with the price shown as $0. A separate "download" button that bypasses ownership is not that flow.
- **No external reference was found.** B grepped `docs/technical/store-redesign/research/` for "free product", "$0" and "complimentary": 0 files. B fetched no competitor page this round. The rule rests on the consult and on the existing Buy Now path, not on a competitor claim.

| Point | Ruling (product-designer) | C row |
|---|---|---|
| Behaviour | It runs the **same** Buy Now handler, extracted once into a hook. It is not a copy | C2, C6, grep C8 |
| Visibility | Shown only when `currentPrice === 0` for the **selected** version, the version is sellable (standard/premium/universal), `product.id > 0`, and the user does not own the product | C1, C4, C5, C7 |
| Element | `<Button type="button" variant="primary" size="lg" fullWidth>` | C1 |
| Text / name | "Get it free". The Download icon is removed, because nothing downloads on click | C1 |
| Anonymous | Toast "Sign in to get it free." (info) and the sign-in modal | C2, C3 |
| Busy | Uses the shared `isBuyingNow`. Both the sidebar button and header Buy Now are disabled. The sidebar shows a spinner and "Processing..." (not Button `isLoading`, which shows "Loading...") | jsdom SF4, C6 |
| Error | The existing CartContext toast. The button becomes active again | jsdom SF4b |
| Owned | Hidden. The header shows its owned state | C7 |
| Signed in, purchases loading | Rendered but disabled, so there is no layout jump | jsdom SF7 |

**Deviations and defaults:**
- **D1, the header stays unchanged.** A $0 product still says "Buy Now" in the header. Changing it is SABA-Q-509-BUYNOW-FREE-LABEL. This round keeps the smallest change.
- **D2, delivery = the existing checkout.** The real $0 order needs the backend, and Stripe may refuse a $0 session. This is SABA-Q-509-FREE-DELIVERY and FREE-CHECKOUT-REAL-BACKEND.

## 2. What changes (grants: `b-round-508/grants-509.txt`, 7 paths)

| File | Change |
|---|---|
| `app/hooks/useBuyNowAction.ts` (**new**) | `export function useBuyNowAction(options)`. The options are `productId`, `productTitle`, `price: number \| undefined`, `productVariantId: number \| undefined`, `isSupportedVersion: boolean`, `currencyCode: string` and `signInMessage: string`. It returns `{ runBuyNow: () => Promise<void>; isBuyingNow: boolean; isAddingToCart: boolean }`. The same file also exports `isSellableVersionName(name: string): boolean`, the existing `['standard', 'premium', 'universal'].includes(name.toLowerCase())` rule. PurchaseHeader and ProductDetailPage both use this one predicate; no second copy may exist. Its body is `PurchaseHeader`'s current `handleBuyNow`, moved without changes except that the sign-in toast text becomes `signInMessage`. The order stays the same: price guard, sign-in toast and `openModal('signin')`, sellable/valid-id toast, then `trackBeginCheckout`, `trackFBInitiateCheckout` and `buyNow(productId, productVariantId)` inside `try`/`catch`. It imports `useAuth`, `useCart` and `useToast` from `~/hooks/useAuth`, `~/hooks/useCart` and `~/hooks/useToast`, and the trackers from `~/lib/analytics` and `~/lib/facebook-pixel`: the same specifiers the tests mock. Do not use the `~/hooks` barrel (A-R506-CR-1). Read `.claude/prompts/new-hook.md` first. **Pre-ruled deviation:** its checklist item "Added to hooks/index.ts barrel export" is **not** done. `app/hooks/index.ts` is not granted, 5 of the 18 hook files are already outside the barrel, which has 13 exports [K13] (for example `useStableHandler` and `useRelativeFaderDrag`), and barrel imports break partial hook mocks (A-R506-CR-1) |
| `PurchaseHeader.tsx` | `handleBuyNow` is replaced by the hook, with `signInMessage: 'Please sign in to continue with your purchase'`. The JSX and the Add to Cart handler do not change. Existing source scans must stay green: B2C-8 (two `Button` tags, one builder call, one `bg-buy` tag) and store-theme-tokens (one `bg-buy` class attribute) |
| `ProductDetailPage.tsx` | Compute `showGetFree` from the rule in §1, using `currentPrice`, `isSellableVersionName(selectedVersion?.name ?? 'Standard')` (the same name the header receives), `product.id`, `isAuthenticated` and `usePurchases().isProductOwnedByHandle(product.handle)`. Then call `useBuyNowAction` with the selected version and `signInMessage: 'Sign in to get it free.'`. Pass `ProductSidebar` an optional prop, for example `getFree?: { onGetFree: () => void; isBusy: boolean; isDisabled: boolean }`. It is `undefined` when `showGetFree` is false. `isDisabled` is `isBuyingNow`, or `isAddingToCart` (as header Buy Now), or (signed in and `usePurchases().isLoading`) |
| `ProductSidebar.tsx` | Remove the `isFree` / `resolveCatalogPrice` logic and the hand-rolled `<button>` (l.74–79). When `getFree` is set, render `<Button type="button" variant="primary" size="lg" fullWidth onClick=… disabled=…>`. When not busy, its content is the text "Get it free" with no icon. When busy, it shows `Loader2` (`animate-spin`, `aria-hidden`) and "Processing...". The rendered position stays the same: after the title block, before the BPM/Key grid. Do not pass a `className`. Remove any import left unused |
| `app/lib/__tests__/product-price-unavailable.test.tsx` | Rewrite PU7 to the new contract. No assertion may be lost; equal or stronger replacements are allowed (L4). The old "shows for 0, not for undefined or 9" becomes "Get it free" for `ProductDetailPage` with a $0 price and absent for undefined or 9, and `queryByText('Complimentary Download')` is null in all three. Nothing else in the file changes |
| `app/lib/__tests__/store-sidebar-free-r509.test.tsx` (**new**) | Rows SF1–SF9 below |
| `docs/implementation/2026/quarter-IV/329-sidebar-get-it-free.md` (**new**) | The seven TEMPLATE headings, in order (L26). l.4 must be exactly `**სტატუსი:** Completed (C round 509 PASS)` (L28). It names `useBuyNowAction`, the visibility rule, D1, D2, both Saba ids and the test rows. It cites only rows that exist |

**jsdom rows (new file).** Find elements by role and name only (L12). Pass a fresh element on each rerender (L52). Clear mocks before each click and assert every action's count after every click (RC-R507).
- **SF1:** `ProductDetailPage`, $0 (standard, premium and variants all 0), anonymous.
  - Exactly 1 `button` named "Get it free", with `type="button"` and no `svg` child.
  - Its sorted class set equals that of a rendered `<Button variant="primary" size="lg" fullWidth type="button">` reference.
  - `queryByText('Complimentary Download')` is null.
- **SF2:** anonymous, click "Get it free". `showToast` is called once with `('Sign in to get it free.', 'info')` and `openModal` once with `'signin'`. `buyNow`, `trackBeginCheckout` and `trackFBInitiateCheckout` are each called 0 times. Then clear the mocks and click the header's "Buy Now": the toast text is `'Please sign in to continue with your purchase'` (this is the swap guard).
- **SF3:** signed in, not owned. Click "Get it free": `buyNow` is called once with `(product.id, <selected variant id>)`, `trackBeginCheckout` once with `productPrice: 0`, and `openModal` 0 times. Clear the mocks, then click the header's Buy Now: `buyNow` receives the same arguments.
- **SF4:** `isBuyingNow` is true. The sidebar button is disabled and reads "Processing...", and the header's Buy Now is disabled. With `isAddingToCart` true (`isBuyingNow` false), both are disabled, and the sidebar reads "Get it free".
  - **SF4b:** `buyNow` rejects. There is no unhandled rejection, and after the rerender with `isBuyingNow` false the button is enabled again.
- **SF5:** Standard is $0 and Premium is $9. The button is present. Click the Premium version card and it is absent; click Standard and it is present again.
- **SF6:** a $9 product → absent. An unknown price (L36 shape from PU tests) → absent, and the header shows "Price unavailable".
- **SF7:**
  - signed in, `isProductOwnedByHandle` returns true → absent;
  - signed in, not owned, purchases `isLoading` true → present and disabled;
  - anonymous, purchases `isLoading` true → enabled.
- **SF8:**
  - `<ProductSidebar product={$0 product} />` with no `getFree` prop → no "Get it free" and no "Complimentary Download" (the studio-link-ui render shape);
  - `product.id` 0 with a $0 price on `ProductDetailPage` → absent.
- **SF9:** an unsupported version name (for example "Custom") at $0 → absent.

**Mutants.** A runs them on a copy outside `store/`, with `node_modules` symlinked. Each must turn at least the named row red. A writes `a-round-509/mutants.txt` (L52, L58). B did not run these, so the red sets are **record** beyond the named row.
- **MA:** the sidebar `onClick` is removed → SF2.
- **MB:** the two `signInMessage` strings are swapped → SF2.
- **MC:** visibility uses `resolveCatalogPrice(product) === 0` → SF5.
- **MD:** the owned check is dropped → SF7.
- **ME:** `disabled` is dropped from the sidebar Button → SF4.
- **MF:** the hook calls `buyNow(productId)` without the variant → SF3.
- **MG:** the sidebar uses `isLoading` instead of its own busy content → SF4.
- **MH:** `type="button"` is dropped → SF1.
- **MI:** the `isSupportedVersion` term is dropped from `showGetFree` → SF9.
- **MJ:** `isAddingToCart` is dropped from the sidebar's `isDisabled` → SF4.

## 3. A: what to implement
1. Run frozen checks 1–3 (rc 0). Read `prompts/new-hook.md` and the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `API_ERROR_HANDLING.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. Implement §2. Change only the 7 granted paths. Use semicolons, no `any`, no assertions and no comments (Georgian context comments that already exist may move with the code they describe).
3. Run the following and save the logs under `a-round-509/`:
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0. Record the warning count; HEAD is 175 (`b-round-507/precheck-lint.log`). A higher count is a STOP unless every new warning is in a granted file and listed.
   - `npx biome check` on the 6 granted code and test files: rc 0, no fixes.
   - **Covering:** `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-508/covering-files-head.txt) app/lib/__tests__/store-sidebar-free-r509.test.tsx`. Expect rc 0, 9 files, every SF row present, and no test above 2,500 ms. HEAD is 8 files / 112 tests, all < 2,500 ms (`b-round-508/head-covering.log`). The new total is **record**.
   - **Grep:**
     - `grep -rn "Complimentary Download" app` → 0;
     - `grep -rln "trackBeginCheckout(" app/components app/hooks` → only `app/hooks/useBuyNowAction.ts`;
     - `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/scan-nonbrand.py . /tmp/n.json` → 53 hits, with no `ProductSidebar.tsx` entry. HEAD is 54 with one ProductSidebar l.75 entry, so 53 is **record**. Any other change is a STOP.
   - **Mutants MA–MI** on a copy outside `store/`. Afterwards, frozen checks 1 and 2 are rc 0 and `git status` shows only the grants.
   - **code-reviewer** (3 or more files) on `git diff cf89736` plus the 3 untracked files. Include its Architecture note.
4. Write `a-round-509.md`. Do not run the full suite or the build: they are gate rows.

## 4. C: what to verify
Write `c-round-509.md`, `c-round-509.json` and `c-round-509/progress.json` as you go, heaviest rows first (L59).

**Environment**
- Dev server: `:5173`. Mock API: `:5199`. Start the mock if `__mock/health` fails: `node mock-api/server.mjs`.
- Before every product page: `localStorage` `czaba_lead_magnet_dismissed=1` and `sessionStorage` `czaba_entrance_seen=1`. Use an init script, as in `journey-504.mjs`.
- **Free stub (-STUBBED, L36):** adapt `b-round-508/probe/free-stub.cjs`:
  1. open `/products/middle-east`;
  2. `page.route(/\/products\/harbour-lights\?.*_data=/)`, fetch the real response and set `standardPrice`, `premiumPrice`, `minPrice` and every variant's `price` to 0;
  3. navigate on the client with `window.__remixRouter.navigate('/products/harbour-lights')`.
  - **Split stub** for C4: Standard variant 0, Premium 9, `standardPrice` 0, `minPrice` 0, `premiumPrice` 9.
- **Signed-in stub:** take the auth, profile, downloads, cart, `cart/checkout`, `payments/checkout` and `__stripe-stub` routes from `b-round-503/probe/journey-504.mjs`, plus the free `_data` stub.
- **Warm-up (L38):** one throwaway run; discard it.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start and end) | `git status --short --untracked-files=all`; frozen checks 1 and 2 | Only the grants changed (4 M + 3 untracked); rc 0 |
| C1 | RENDER-STUBBED (1440×900, 1280×720, 375×812) | Free stub, anonymous | Exactly 1 `button` named "Get it free", `type=button`, no `svg`; "Complimentary Download" count 0. Width equals the sidebar column ±1 px. Label on one line (the text span's height equals its line-height). The button height is **record**. Computed bg equals the resolved `--color-brand` value (record the rgb). One screenshot per viewport. Header still shows "$0.00 USD", Add to Cart and Buy Now |
| C2 | ANON CLICK-STUBBED | Click it at 1440 and 1280 | The sign-in modal opens. It has no `role=dialog` at HEAD (B-R509-AUTHMODAL-NOT-A-DIALOG), so detect it by its email field and its "Close" button: each count goes 0 → 1. A toast with the text "Sign in to get it free." is visible; URL unchanged; 0 page errors. Then close the modal and click header Buy Now: its toast reads "Please sign in to continue with your purchase" |
| C3 | KEYBOARD-STUBBED | Tab from the page top until focus reaches the button; record the previous stop | Focus reaches "Get it free", with `:focus-visible` true and a visible ring (crop). Enter gives the C2 result. After Esc, `document.activeElement` is the "Get it free" button with `:focus-visible` true. This is the HEAD behaviour of header Buy Now (`b-round-508/probe/focus-head.json`: Buy Now keeps focus, `fv` true, at 1440 and 1280) |
| C4 | VERSION-STUBBED | Split stub | Standard is selected: the button is present. Click the Premium card: absent, and the header shows $9.00. Click Standard: present again |
| C5 | PAID UNSTUBBED | `/products/middle-east` (real mock, $29) | No "Get it free" and no "Complimentary Download"; header Buy Now and Add to Cart unchanged; anonymous Buy Now still shows its toast and modal |
| C6 | SIGNED-IN CLICK-STUBBED | Signed-in stub, not owned, free stub | One click: POST `/api/cart/items` ×1 with `productVariantId` = the Standard variant id, `cart/checkout` ×1 and `payments/checkout` ×1. While checkout is held, both the sidebar button ("Processing...") and header Buy Now are disabled. Then the page lands on `/__stripe-stub`. A double-click still sends 1 checkout POST. The counts are the CartContext `buyingRef` contract, measured for the header by the same harness in round 504 (J3/J4). B did not run them on this button, so a different count is reported with its log, not ruled in advance |
| C7 | OWNED-STUBBED | Signed-in stub, `/api/downloads` lists harbour-lights as available | No "Get it free"; the header shows its owned state |
| C8 | GREP | From `store/` | `Complimentary Download` 0 in `app/`; `trackBeginCheckout(` only in `useBuyNowAction.ts` among `app/components` and `app/hooks`; nonbrand scan 53, no ProductSidebar entry; `ProductSidebar.tsx` has no `<button` |
| C9 | REAL $0 ORDER | Backend | **BLOCKED**: backend unavailable in the cloud (FREE-CHECKOUT-REAL-BACKEND). Not PASS, and not A's fail |
| C10 | TESTS + MUTANTS | The covering command from §3; then mutants MA–MI on a copy outside `store/` | rc 0, 9 files, SF1–SF9 and PU7 present, no test > 2,500 ms. Each mutant turns its named row red. The copy is restored |
| C11 | DOCS | Doc 329 | 7 headings in order; l.4 byte-equal to `**სტატუსი:** Completed (C round 509 PASS)`; every cited test row exists |
| C12 | PROTECTION + STUDIO | Fresh context with no credentials | `/studio/1` and `/account/downloads` show "Sign in required" and no download link; `/studio-lab` opens the demo at 1440 and 1280; check 2 rc 0 |
| C13 | JOURNEY (L54) | 1440 | `/store` → free-stubbed product (screenshot) → "Get it free" → sign-in modal (screenshot). STUBBED |
| C14 | CLAIMS + L57 | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-508/claims-509.sh`, compared with `b-round-508/claims-509-planning-output.txt`; `python3 -I tools/l57-check.py c-round-509.json c-round-509/l57-check.txt` | No MISSING. Only the K1/K2 tree state and the K11 grant files differ, as expected after A. L57 rc 0 |

- **Gate rows** (in `gate`, never in `passed`): the full vitest suite, build, Biome and `npm run verify`.
- **Blocked:** only C9.
- **Neighbours that could break:**
  - the header's Buy Now: SF2, SF3, C2, C5 and C6;
  - the Studio link in the sidebar: studio-link-ui is in the covering set;
  - PurchaseHeader source scans: B2C-8 and store-theme-tokens;
  - the price-unavailable state: SF6 and PU rows.
- **L22:** if A STOPs with no diff, run only C0, C12 and C14. A STOP that names an unruled Medium or higher is a short FAIL.
- **On closing:** C PASS with `browserVerified` true closes B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD for the cloud. FREE-CHECKOUT-REAL-BACKEND stays open.

## 5. B's pre-check (`b-round-508/`)

| Check | Result | File |
|---|---|---|
| Bug in the browser (stub) | 1440 and 1280: BUTTON, no href/type; click changes nothing, 0 dialogs, 0 page errors | `probe/free-stub.json`, `free-1440.png`, `free-1280.png` |
| Covering at HEAD | 8 files / 112 tests, rc 0, none ≥ 1,000 ms | `head-covering.log`, `covering-files-head.txt` |
| Frozen pins | tree 1,421 files rc 0; protected rc 0; pre-sha of 4 granted files | `r509-tree-sha256.txt`, `r509-pre-sha.txt` |
| Nonbrand scan at HEAD | 54 hits; ProductSidebar l.75 is one of them | `b-round-508/nonbrand-head-509.json` |
| L23 collision grep | `Complimentary Download` in tests: only PU7 (granted). `ProductSidebar` is rendered alone in `studio-link-ui.test.tsx` l.146/153 (the prop is optional, so the file is unchanged). PurchaseHeader is scanned by B2C-8 and store-theme-tokens l.696 (JSX unchanged) | this table |
| Consult | product-designer ruling (a) | `consult-product-designer.md` |
| L23 scratch run | Archive `cf89736` + the hook extracted + `PurchaseHeader` on the hook + the sidebar `Button` (at `/home/runner/b508-scratch`): tsc rc 0; full suite 304 files, 1 failed (only PU7, granted), 303 passed | `scratch-full.log` |
| HEAD focus probe | Header Buy Now → Enter → toast + modal (email field 1, Close 1, `role=dialog` 0) → Esc → focus stays on Buy Now, `fv` true | `probe/focus-head.json`, `probe/focus-head.cjs` |
| Claims | `claims-509.sh` K1–K14; no MISSING | `claims-509-planning-output.txt` |

## 6. After this round
1. **RETRO at round 510.** It also takes RC-R507-SWAP-MUTANT and the round 509 result.
2. **REGRESSION** is due on or after 2026-11-16, so it is first if the planning happens then.
3. **NONBRAND N2–N9** in the consult's order. Stage 2 (product page) now has PurchaseHeader ×3 and PlayStems. The StemsPlayerModal pair waits for the stems fixture.
4. **Then:**
   - PD-R498-404-SECONDARY-ALIGN;
   - the stage-2 close-out;
   - the rest of DPG P1;
   - the DP gate;
   - P2.

## Claims (`b-round-508/claims-509.sh`; planning output `claims-509-planning-output.txt`)
- **K1–K2:** store HEAD and changed-path count.
- **K3:** gate 508 published `cf89736`.
- **K4:** `c-round-508` PASS, browser and real verification true, 0 bugs.
- **K5:** the free-stub probe (dead button).
- **K6:** the HEAD focus and modal probe.
- **K7:** HEAD covering run, 8 files / 112 tests.
- **K8:** scratch full suite; only PU7 fails.
- **K9:** nonbrand scan at HEAD, 54 hits including ProductSidebar l.75.
- **K10:** at HEAD the sidebar has the dead label and the catalogue-price rule.
- **K11:** grants and tree pins.
- **K12:** PurchaseHeader at HEAD: sign-in text, sellable list, and `isAddingToCart` in `isDisabled`.
- **K13:** hooks barrel count.
- **K14:** artifacts present.
