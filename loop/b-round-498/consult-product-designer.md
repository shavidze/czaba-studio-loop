# product-designer consult, stage 2b-1 (B, round 498 -> 499 planning, 2026-11-13)

Real subagent run (read-only). Input: HEAD 82e118a browser probe `probe/mock-on/*.png`, `probe/mock-off/STORE-ERROR.png`. Summary of its rulings (verbatim choices, condensed reasons):

- **Q1 EmptyState primary:** primary / lg / pill. All callers are Store CTAs; rejected: keeping `rounded-lg` (a third button shape).
- **Q2 EmptyState secondary ("Browse the store"):** ghost / lg / pill (same concept as the status-page pair). Rejected: bordered `secondary` (competes as a second primary next to a brass pill).
- **Q3 EmptyState `<button>` branches:** keep; move to `<Button type="button">` with the same variant/size/shape. Rejected: deleting the dead branches (code-scope decision, not design).
- **Q4 ErrorDisplay pair:** "Try Again" -> primary / lg / pill; "Go Home" -> ghost / lg / pill; order unchanged (Try Again left). Reason: RouteErrorBoundary passes `showHome={false}`, so Try Again is often the only action; same verb, same weight as /store "Try again". "Go Home" stays a plain `<a href="/">`. Emphasis swap only, no position move: product-designer's call; noted for Saba.
- **Q5 /store "Try again":** primary / lg / pill. Rejected: keeping `px-5` (drift).
- **Q6 C checks:** focus-visible ring on Link/`<a>` built with the builder; ghost hover visible on `bg-background`; 375 px stack (ragged widths?); height parity 48/48; icons 16 px with gap inside the pill; no disabled/loading callers; reduced motion: colour transitions only.
- **Questions for Saba (copy only, not changed in this stage):** (1) mixed capitalisation ("Try Again"/"Go Home" vs "Try again", "Browse the store") -> default Title Case; (2) if Saba wants "Go Home" dominant on the root error page, Q4 reverses -> default keep Try Again primary.
