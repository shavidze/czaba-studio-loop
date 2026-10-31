# B round 286 → 287 planning

**Date:** 2026-10-31. **Baseline:** `gates/gate-round-286.json` is `published` at commit `096fa4b` on both remotes. Its `head` field reads `60bfb38`; the commit field is the baseline. The store tree is clean. **Advisor:** available and consulted (1 call before writing, 1 at completion). **Consult:** none. This is a bug fix-up that reuses round 286's approved state; see D-29z702.

## 1. Round 286 result (evidence only from C)
- **Result.** `c-round-286.json`: **PASS**, `browserVerified: true`, `realVerified: true`. 12 rows passed at both viewports; the gate rows were not claimed.
- **BLOCKED (backend unavailable in cloud).** Two browser checks could not run: the owner and signed-in states, and a real-backend 403. The unit rows PU4/PU5 cover the first.
- **FIX-PD-1a → მზადაა as scoped** (D-29z700). On `door-slams`, `$0.00` became `$9.00`. A product with no price shows `Price unavailable` with soft-disabled buttons and makes 0 requests. The card price equals the page price for all 7 fixtures.
- **F9 is not closed.** C found two pre-existing remainders, both outside the round-286 grants:
  - **C-R286-01 (Medium):** the version card of a priceless Track reads `Standard $0`.
  - **C-R286-02 (Low):** the `/store` card of a priceless product reads `$0`.

  Both go to the new stage **FIX-PD-1a2**. A-R286-REVIEW-TRACK-VERSION-ZERO is merged into C-R286-01.
- **A's Lows and signals** (D-29z703):
  - **To `deferred_low_polish`:** A-R286-REVIEW-HOVER-SOFT-DISABLED and A-R286-REVIEW-DOUBLE-ANNOUNCE.
  - **The unlayered `button{cursor:pointer}`:** attached as a note to the existing B-R276-CURSOR-UNLAYERED-GLOBAL, not duplicated.
  - **A-R286-UNIT-KEY-ACTIVATION:** recorded as info. The browser covered it.
- **Architecture note A-R286-ARCH-ONE-RESOLVER:** adopted inside round 287, because the Medium fix edits that very line. It is not a separately scheduled refactor.

## 2. Next task: round 287 = FIX-PD-1a2 (C-R286-01 + C-R286-02)
- **Why now:**
  - the bug gate puts Medium findings first;
  - no Critical or High finding is open;
  - REGRESSION is not due (the last one was 2026-10-30; it is due on or after 2026-11-02);
  - RETRO is at round 290.
- **Why the Low is fixed now** (D-29z701):
  - it has the same cause, an unknown price collapsing to 0 through `?? 0`;
  - it uses the same scratch fixtures;
  - L54 says card = page;
  - B's L49 sweep found the home `ProductCard` has the same chain, and it would read **`Complimentary`** for an unknown price, which advertises a free product.

  That makes these at most 3 tightly related bugs.
- **The design** (D-29z702):
  - `DisplayVersion.price` becomes `number | undefined`. The synthetic Standard uses `resolveCatalogPrice`, and an invalid variant price becomes `undefined`.
  - `resolvePurchasePrice` is unchanged, and the purchase panel is untouched.
  - One new export, `formatCatalogPriceLabel`.
  - The version card, the `/store` card and the home card show a muted `Price unavailable` in their existing price slot.
  - An explicit 0 is unchanged everywhere.
- **Rejected:**
  - passing `product` into `VersionSelector`, because it keeps two resolvers;
  - "—", because it is ambiguous and differs from the panel;
  - hiding the slot, because the layout would jump.
- **The one changed existing test line:** `product-utils.test.ts:347`, from `toBe(0)` to `toBeUndefined()`. This is a contract change and is listed in the task (2026-10-28 rule). Every other assertion that turns red is a STOP.
- **Consumer sweep (L49):** `RelatedTracksCarousel.tsx:120` and `TrackRow.tsx:149` have no consumer at `096fa4b`. They are signal B-R286-UNUSED-PRICE-RENDERERS. The local `ProductCard` in the protected `account.downloads.tsx` is out of scope.
- **The browser contract:** C reuses its own priceless fixtures (`mock-priceless2.mjs`) as scratch copies and adds a `free-pack` (explicit 0) for B-FREE. `mock-api/server.mjs` is not edited. The owned-upgrade state is unit only (BLOCKED in the browser: backend unavailable in cloud).
- **Purchase protection:** the cart, checkout, auth, `PurchaseHeader`, `ProductDetailPage` and the protected Studio routes are frozen. R286-KEEP and G287-AUTH are kept.
- **Baseline evidence:** `b-round-286/claims-287.sh` and its output on `096fa4b`. Covering tests on HEAD: 7 files / 124 tests pass (`b-round-286/covering-run-head.txt`).

## 3. Order after 287
1. REGRESSION, if round 288 is planned on or after 2026-11-02.
2. FIX-PD-1b.
3. FIX-PD-1c.
4. STUDIO-LINK.
5. NAME-AND-HINT.
6. PERF-3c, then the rest of STUDIO-PERFORMANCE.
7. STEM-LANES.
8. SYS-1..3.
9. STORE-2b..5 (the direction gate).
10. COPY-PD and REVIEW-RECOMMENDATIONS.
11. SR-BEHAVIOUR.
12. T12-ADVANCED.
13. The phase-2 entries.

RETRO-290 takes precedence when it falls due. SRW-21-PLAN (plan doc only) runs in parallel when scheduled.

## 4. Architecture checkpoint
None requested. This is a small Store fix-up with one owner; there is no feature boundary and no accumulated structural risk.

## 5. Ready for commit
Nothing new from B; round 286 is already published (`096fa4b`). Changed loop files:
- `backlog.json` (version 249)
- `feature-status.md`
- `current-task.md`
- `tasks/round-286.md` (archive)
- `b-round-286/` (backups, claims, covering baseline, backlog-update.py)
- `b-round-286.md`
- `b-next.json`

`lessons.md` is unchanged at 60 lines.
