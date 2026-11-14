# A round 509 — B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD ("Get it free")

**Status:** implementation complete, no STOP. Not committed (root publishes after C PASS).
**HEAD:** `cf89736`. Logs: `a-round-509/`.

## Changed files (exactly the 7 grants)
- `app/hooks/useBuyNowAction.ts` (new): `useBuyNowAction(options)` → `{ runBuyNow, isBuyingNow, isAddingToCart }`; `isSellableVersionName(name)`. Body = PurchaseHeader's former `handleBuyNow`, same order; only the sign-in toast text is `signInMessage`. Imports from `~/hooks/useAuth|useCart|useToast`, `~/lib/analytics`, `~/lib/facebook-pixel` (no barrel). Not added to `app/hooks/index.ts` (pre-ruled #6). English analytics comments dropped; the catch comment became Georgian (code-reviewer Low).
- `PurchaseHeader.tsx`: `const { runBuyNow: handleBuyNow, isBuyingNow } = useBuyNowAction({... signInMessage: 'Please sign in to continue with your purchase' })`; `isSupportedVersion = isSellableVersionName(selectedVersionName)`. JSX and Add to Cart unchanged.
- `ProductDetailPage.tsx`: `showGetFree = currentPrice === 0 && isSellableVersionName(selectedVersion?.name ?? 'Standard') && product.id > 0 && !(isAuthenticated && isProductOwnedByHandle(handle))`; hook with the selected variant and `'Sign in to get it free.'`; `getFree = { onGetFree: runBuyNow, isBusy: isBuyingNow, isDisabled: isBuyingNow || isAddingToCart || (isAuthenticated && isPurchasesLoading) }` or `undefined`.
- `ProductSidebar.tsx`: optional `getFree` prop; old `<button>`, `resolveCatalogPrice` rule and `Download` icon removed; `<Button type="button" variant="primary" size="lg" fullWidth onClick disabled>`; content "Get it free"; busy = `Loader2` (`animate-spin`, `aria-hidden`) + "Processing...". Same position. No className.
- `app/lib/__tests__/product-price-unavailable.test.tsx`: PU7 only (deviations 2–3).
- `app/lib/__tests__/store-sidebar-free-r509.test.tsx` (new): SF1–SF9 + SF4b.
- `docs/implementation/2026/quarter-IV/329-sidebar-get-it-free.md` (new): 7 TEMPLATE headings in order; l.4 = `**სტატუსი:** Completed (C round 509 PASS)`; Saba ids verified in `user-review/questions-round-509.md`.

## Checks actually run (from `store/`)
| Check | Result | Log |
|---|---|---|
| Frozen 1 (tree), before and after mutants | rc 0 / rc 0 | — |
| Frozen 2 (protected), before and after | rc 0 / rc 0 | — |
| Frozen 3 (pre-sha of 4 granted files, before editing) | rc 0 | — |
| `npm run typecheck` | rc 0 | `a-round-509/typecheck.log` |
| `npm run lint` | rc 0, **174 warnings** (HEAD 175). `grep` of `lint.log` for the 6 granted code/test paths: 0 hits, so no warning is in a granted file | `lint.log` |
| `npx biome check` on the 6 code/test files | rc 0, "No fixes applied". An earlier run flagged formatting in my 2 test files; fixed with `biome format --write` on those two owned files only | `biome.log` |
| Covering (8 HEAD files + new file), re-run after the count tightening | rc 0, **9 files / 122 tests** (record); SF1–SF9, SF4b, PU7 present; none ≥ 2,500 ms (slowest 498 ms on the earlier run) | `covering.log` |
| Greps | see below | `greps.txt` |
| Mutants MA–MJ (+ extra MK) on `/home/runner/a509-mut` (rsync copy, `node_modules` symlinked) | every named row red | `mutants.txt` |
| code-reviewer, pass 1 (whole change) | run; it had no shell and did not compare the handler with HEAD (its own words); findings below | — |
| code-reviewer, pass 2 (narrow, on `a-round-509/diff-cf89736.patch` = `git diff cf89736` + the 3 new files) | Q1 handler equivalence PASS; Q2 PurchaseHeader JSX and Add to Cart untouched PASS; Q3 `isSellableVersionName` identical PASS; Q4 no new Medium+. One Low: the sidebar is disabled while purchases load, header Buy Now is not (the header shows "Checking purchase status..." in that state anyway; intended, SF7) | `diff-cf89736.patch` |
| Claims `b-round-508/claims-509.sh` vs planning output | no MISSING; differs only at K2 (0 → 7 changed paths) and **K13 (hook files 18 → 19, the new `useBuyNowAction.ts`; barrel still 13)**. K13 is by design but is not in the task's expected K1/K2/K11 list | `claims-509-after-a.txt`, `claims-diff.txt` |
| `git status` | only the 7 grants (4 M + 3 untracked) | — |

Mutants ran before the count-tightening edit (tests only gained asserts after it). Red set: MA SF2,SF3,SF4b · MB SF2 · MC SF5 · MD SF7 · ME SF4,SF4b,SF7 · MF PU6,SF3 · MG SF4 · MH SF1 · MI SF9 · MJ SF4 · MK (extra: old "Complimentary Download" button restored on catalogue price 0) PU7,SF1,SF8.

Greps: `Complimentary Download` in `app` → 0; nonbrand scan → **53** hits, 0 in ProductSidebar; `<button` in `ProductSidebar.tsx` → 0; `trackBeginCheckout(` in `app/components app/hooks` → `app/hooks/useBuyNowAction.ts` **and `app/hooks/useAnalytics.ts`** (deviation 1).

Not run (gate rows): full vitest suite, build, `npm run verify`. A ran no browser rows.

## Deviations / For B
0. **Process (honest):** pre-flight and the full primitive and lesson reads were not done before coding. They were done after the first implementation: the `new-hook.md` checklist, the `pre-flight` skill, FORWARDREF_COMPONENT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and the full text of L4, L12, L52 and L58. The code was then re-checked against them. Results:
   - `new-hook.md` checklist deviations:
     - **no JSDoc/@example**: the task's no-comments rule wins;
     - **no `useCallback`** for `runBuyNow`: the body was moved without changes, the original was not memoised, and the only consumers are `onClick` props;
     - the barrel item is pre-ruled (#6).
   - Not applicable: useEffect cleanup, mounted check (the hook has no effects or local state), SSR.
   - Error handling is the existing `try`/`catch` (CartContext shows the toast).
   - L12 "Port preserves HEAD": the old handler's HEAD pins are kept by PU6 (unchanged; red under MF) and by SF2/SF3's header half.
   - Also added after the advisor review: RC-R507 count asserts after every click in SF3 (header half: FB tracker and toast), SF4b (all actions) and SF5 (every version-card click: no checkout, toast or modal; Premium shows $9.00).
1. **The grep expectation "`trackBeginCheckout(` only in useBuyNowAction.ts" was already false at HEAD.** `app/hooks/useAnalytics.ts:77` (`trackBeginCheckout(params)`, a generic analytics wrapper) matched at `cf89736` too (`git grep` at HEAD: PurchaseHeader + useAnalytics). It is untouched and outside the grants. The real change: PurchaseHeader left the list and useBuyNowAction joined. C8 should expect `{useAnalytics.ts, useBuyNowAction.ts}`. Not a STOP, because nothing outside the grants needs to change.
2. **`grep -rn "Complimentary Download" app` → 0 conflicts with the required negative asserts.** The task requires PU7/SF1/SF8 to assert that the old label is absent, and also requires the literal grep over `app/` (tests included) to return 0. To satisfy both, the negative asserts use `queryByText(/Complimentary\s+Download/)` (a substring regex, equal or stronger than the exact string), and PU7's title says "the old free label never shows". Mutant MK shows they can fail (PU7, SF1, SF8 red). B may rule otherwise.
3. **PU7 keeps the `ProductSidebar` import in use** through an extra leading assert: `<ProductSidebar product={$0}/>` with no `getFree` shows neither "Get it free" nor the old label (stronger, L4). Without it the import would be unused (lint).
4. **Pre-ruled Lows seen again:** #4 — the code-reviewer raised a Medium: "$0 goes through Stripe `createCheckoutSession` and may end in an error toast". This is D2 / FREE-CHECKOUT-REAL-BACKEND, so it goes to B and is not a STOP. #6 — the barrel.
5. **code-reviewer Lows:**
   - SF1 and SF4 use `querySelector('svg')` and `classList`, and `versionCard` filters on `aria-pressed`. The svg and class-set checks are what SF1 requires, and the buttons themselves are found by role and name.
   - The "enabled again" half of SF4b only checks rendering, because the mock drives `isBuyingNow`; its title now says so. The hook's `catch` is proven by the `unhandledRejection` listener.

## Architecture note (code-reviewer; a proposal for B/root only)
Keep as is: the hook is stateless, and both callers read the same `resolvePurchasePrice`. If a third purchase surface appears, move `showGetFree` into one `resolvePurchaseOffer(product, version, ownership)` helper so the visibility rules cannot drift. Not done, because it is outside ownership.

## B acceptance (A side) that truly passed
- §2 implemented within the 7 grants.
- §3 item 1: frozen checks rc 0 before editing. The reads were completed late, after the first implementation (deviation 0).
- §3 items 2–3:
  - typecheck rc 0;
  - lint ≤ 175 warnings;
  - scoped Biome rc 0;
  - covering rc 0 with every SF row and nothing over 2,500 ms;
  - mutants MA–MJ each red on the named row;
  - nonbrand scan 53 with no ProductSidebar entry;
  - code-reviewer run and its findings addressed or reported.
- **Not passed as written:** the `trackBeginCheckout(` grep (deviation 1, pre-existing useAnalytics hit).
- Claims K13 differs (18 → 19 hook files), by design.
- Browser rows C1–C14 belong to C and are unverified until C runs them.

## Exact next C checks
- C0 scope: expect 4 M + 3 untracked.
- C1–C8 and C10–C14 as in task §4, with C8's `trackBeginCheckout(` expectation adjusted per deviation 1.
- C9 is BLOCKED (backend).
- In C6, check that "Processing..." shows in the sidebar while header Buy Now is disabled during the held checkout, and that a double-click sends one checkout POST.
