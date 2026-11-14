# product-designer consult — stage 2c PurchaseHeader (B round 503 → 504 planning, 2026-11-14)

Read-only consult. Input: HEAD measurements `probe/head.out` (stubbed owner states, 1440/1280/375). Rulings condensed by B from the consult reply (meaning kept; not verbatim):

**Q1 shape — (a) default 8px on all three; do not widen.** Cases 1 and 2 are status notices ("You own…"); an action inside a notice is default-shape (same as cart "Upgrade"). Case 3 is the upgrade-purchase card, same purchase-panel family; pill would apply a standalone-CTA treatment in the wrong place.
- (b) rejected: `buildButtonClassName` joins without `twMerge`; `rounded-lg` after `rounded-md` fights over the same property and the winner depends on Tailwind's stylesheet order, not class order.
- (c) rejected: no brass-outline / accent-outline variant exists in `Button.tsx`; moving Open in Studio / Downloads / Add to Cart needs a new variant (design-auditor). Buy Now → `variant: 'buy'` is frozen and would break the one-`bg-buy`-attribute pin.
- Cost accepted: rows mix 8px and 12px corners until NONBRAND (record as NONBRAND debt "in-card siblings → 8px").

**Q2 size — `lg` on all three; keep `min-w-[160px]` and `whitespace-nowrap` as className extras.** Accept the builder's `shadow-sm` and `active:opacity-90` (link now dims on press). "Go to Downloads" goes `flex` → `inline-flex`; in the `flex-col` parent at 375 it should still stretch to 277px — C must confirm.

**Q3 — "Upgrade to Premium" is primary brass, not accent.** The accent card is status; the button leads to Premium, whose identity is brass; accent would blend into the card it should lead out of. Accent hover is an unpinned `brightness-110`. Matches the SABA-Q-502-UPGRADE-VARIANT default; if Saba rules accent there, this site follows in the same round. Pure black → `text-background`, `brand/90` → `brand-hover` is a deliberate consistency fix (contrast 8.32).

**Q4 — `<Button disabled={isDisabled}>` with its own spinner + "Processing..." children is correct.** Losing hover while busy is right. Low, flag only: `pointer-events-none` also hides `cursor-not-allowed` and any `title`; `isDisabled` also covers `!isSupportedVersion` and `isAddingToCart`; the unsupported case already gives no reason today, so not a regression — log for later. No `isLoading`, no `aria-busy` this round.

**Q5 — rows for C (Chromium, stubbed owner states, 1440/1280/375):**
1. Rest: radius 8px, padding 12/24, 16px/600, brass rgb(201,164,106), text `background` token, `shadow-sm`, min-width 160px, one text line.
2. Hover: bg `brand-hover`; Upgrade to Premium hover contrast ≥ 7.
3. Press: `<button>`s scale 0.98 and opacity 0.9; the Link only opacity 0.9.
4. Keyboard focus: ring 1px brass 0.8, offset 2px, not clipped by the card; Tab order in each row unchanged.
5. Busy (Unlock Premium): spinner + "Processing...", opacity 0.5, `disabled`, hover does not change bg; width change does not push Add to Cart to a new line at 1280.
6. 375 wrap: Go to Downloads still full width (277px); case 2/3 rows wrap without horizontal overflow; no text cut.
7. Regression: `bg-buy` count in PurchaseHeader.tsx exactly 1; Buy Now still 139×52, radius 12px.

**Must not change:** "Go to Downloads" stays a `<Link>` (middle-click / semantics).
