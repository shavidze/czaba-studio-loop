# product-designer consult 2 (round 501 -> 502 planning): /cart at lg on short screens

**Recommendation: (a).** It is the smallest fix for a broken state. The layout, positions and labels stay the same.

| Option | Trade-off |
|---|---|
| **(a) Summary scrolls inside its own column** | Behaves like the items column next to it. The only cost is a second scroll area, and it appears only when the summary is too tall. |
| (b) Natural page scroll with a sticky summary | Common, but changes how desktop scrolls for every cart; needs Saba; not needed for this bug. |
| (c) Checkout block stuck to the bottom of the summary | Moves the button, could cover coupon/gift-card fields at 600px; a position move, needs Saba. |

Classes: l.614 `lg:col-span-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain styled-scrollbar lg:pr-2`; l.595 add `lg:grid-rows-[minmax(0,1fr)]`. `lg:` prefixes keep the below-1024 fix unaffected. `OrderSummary` (l.308) `sticky top-24` should do nothing inside the scroll column (only child); add `lg:static` only if it jumps.

States: 1366 wide at 600/657/720/900 high plus 1280x600: (1) coupon + gift card: wheel scrolls the summary to Checkout, clickable; (2) ownership warning: same; (3) both at 600: reachable, no overlap; (4) three items: items column scrolls on its own and does not move the summary; (5) keyboard Tab coupon -> Checkout brings it into view, focus ring not cut (pr-2 side, bottom edge); (6) 720 and 900 with a short summary: no scrollbar, page exactly as now; (7) apply then remove coupon: column shrinks, no empty scroll space.

Approval: none needed (a broken state is fixed; no layout or position change). Option (b) would need Saba.

B ruling (D-29z1805): option (a) adopted. State 7 (apply/remove coupon live) is recorded as a C row with a stubbed POST /api/cart/coupon only if the stub path runs; otherwise it is `record`.
