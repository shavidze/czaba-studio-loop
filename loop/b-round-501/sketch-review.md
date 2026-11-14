# tech-lead sketch reviews, round 501 -> 502 planning

**Dispatched sketch:** `b-round-501/sketch-502.patch.txt` v5, sha256 `7d14eae235a5b35caa8943ae4cb50c7a9f024a06e635f92a7e92b7b04a5667c0`. Review of record: Review 3 (delta v2 -> v5), verdict APPROVE. History: `sketch-sha-history.txt`.

## Review 1: sketch v1 (sha f26e5958…), verdict APPROVE
- **Medium 1:** CML1 (`cart-mobile-layout.test.ts:24`) only bans unprefixed fixed height/overflow; a future `md:h-[calc(100vh-80px)] md:overflow-hidden`, `h-screen` or `max-h-*` on `main` would pass. Fix: allow height/overflow-clip classes only with `lg:`/`xl:`/`2xl:` prefixes.
- **Low 2:** the class reader reads plain `className="..."` only; a `cn()` switch fails the length checks with a confusing message (fails, does not pass silently). Fix: clearer message.
- **Low 3:** CML3 self-tests the helper only; M1 already shows CML1 rejects HEAD.
- **Low 4 (pre-existing, out of scope):** at lg on short screens (1280x600 with coupon + gift card) the summary has no scroll and `lg:overflow-hidden` cuts Checkout; and a fixed AudioPlayer bar (`app/root.tsx:151`) might cover Checkout at the bottom of the taller mobile page (py-12 probably prevents it; probe with the player open).
- **Low 5:** doc 323 l.4 states "C round 502 PASS" before C runs (L28 form, as docs 320-322).
- Checked: CSS fix correct below lg; EmptyCart/CartSkeleton/ConfirmDialog (portal) unaffected; no site footer in root.tsx; 1024-1440 equal to HEAD; project rules; mutants M1-M7; doc numbers 47/79/0/339/303, 7052f82 2026-01-08, 323 next free; purchase protection (className only).

B rulings: see b-round-501.md (D-29z1805).

## Review 2: sketch v2 (sha 68601496…), verdict APPROVE with conditions
- **Conditions:** full suite green (it finished: 299 files / 4,341 tests rc 0, `precheck-full.log`); below-lg wheel/touch rows (Medium 1).
- **Medium 1:** the items column keeps `overflow-y-auto overscroll-contain` at every width; below lg it no longer overflows, an empty scroll container with overscroll-contain, unmeasured. Cheaper fix: `lg:overflow-y-auto lg:overscroll-contain` like the summary column, update CML2. D1 also applies at lg whenever a column does not overflow or is at its end (window scrolls natively: `sketch-wheel.json` 900-high rows, `sketch-items-wheel.json` 1440x900 win 170). The attribute cannot follow a breakpoint without JS or Lenis's `prevent` option in `useSmoothScroll`.
- **Low 1:** focus ring checked by geometry (3px reach vs 32px card padding), not measured; the probe records outline style only.
- **Low 2:** summary column has no scrollbar gutter; when it scrolls the scrollbar sits on the card border and narrows the card. Cosmetic; `lg:pr-2` would break lg equality. Leave and note.
- **Low 3:** CML1 regex misses `max-lg:`/`max-md:` variants; widen the prefix group.
- **Low 4:** doc 323 l.4 L28 form (carried).
- Project rules OK on every line; tests anchored; doc numbers match (D2 501->442 not opened by the reviewer); purchase protection unchanged.

## B rulings on review 2 (D-29z1806)
- Medium 1: fixed in v3 (items column `lg:overflow-y-auto lg:overscroll-contain`, CML2 updated, mutant M6/M11 strings updated); C5 keeps a below-lg wheel row and adds touch (C5b); doc 323 D1 now names the lg case.
- Low 1: C3 views the 1366x600 focus screenshot (ring not cut). Low 2: recorded as doc 323 D3 and deferred Low B-R502-CART-SUMMARY-SCROLLBAR-GUTTER. Low 3: fixed in v3 (prefix group includes max-* variants; CML3 banned list adds `max-lg:overflow-hidden`). Low 4: pre-ruled Low #3.

## Review 3: delta v2 (68601496…) -> v5 (7d14eae2…), the dispatched sketch. Verdict: APPROVE
Reviewed sha: 7d14eae235a5b35caa8943ae4cb50c7a9f024a06e635f92a7e92b7b04a5667c0 (delta from v2 6860149625453463e309eed59ff142b6ed6a8e428b435bcb1d59e175f891000a). Delta file: `sketch-delta-v2-v5.diff.txt`.
- v2 Medium 1 resolved (items column lg-only scroll; CML2 rejects unprefixed overflow/overscroll; M14 RED; `sketch-below-lg.json` column visible 482/482, window scrolls by wheel and touch; D1 covers lg). Low 1 resolved through C3. Low 2 deferred (D3). Low 3 resolved (max-* prefixes; M15 RED). Low 4 carried. Both doc wording fixes match the evidence.
- **Low A:** doc 323 approach bullet says the items column's overscroll applies "only from lg", but `.styled-scrollbar` sets `overscroll-behavior-y: contain` at every width (`utilities.css:36`); no effect because the column does not scroll below lg.
- **Low B:** CML1 regex misses stacked/arbitrary variants (`md:max-lg:`, `max-[1023px]:`). Optional.
- Evidence gap (non-blocking): `precheck-full.log` was mid-run at review time; the v5 full-suite result must be recorded (B re-ran it: see `precheck-full.log` tail and claims K14).
- Project rules hold on every changed line.
Verdict: APPROVE

## B rulings on review 3 (D-29z1806)
- Low A: pre-ruled Low #9 in task 502 (C5 already states the `.styled-scrollbar` origin [K30]); no sketch change.
- Low B: pre-ruled Low #10; no sketch change.
- Evidence gap: closed by the v5 full-suite and build re-run on the delivered tree (claims K14, K22).
