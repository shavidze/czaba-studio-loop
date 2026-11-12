# product-designer consult for DPG-P0-2 (B round 474 → 475 planning, 2026-11-12)

The consult was read-only. B's brief cited the HEAD 297f5ae probes in `probe/`. Below is the verbatim ruling summary as returned, with B's resolution of the one protected-file conflict at the end.

- **The token values were checked** in app.css l.46-71: background `#0e0d0c`, muted-bg `#24201c`, accent `#c9a46a`. `primary`, `primary-foreground`, `card`, `accent-hover` and `text-muted` are all missing from `@theme`. **Correction to B's brief:** the card price is `text-foreground`, not brass. The only brass on the card is the "New" chip.

## Rulings

1. **The badge (ProductCard l.101): (a) `bg-background/70 text-foreground`.**
   - Why: it matches the hover overlay `bg-background/60` (l.92), and brass stays on "New" only. The worst case, a white cover, is about 6:1, so AA passes.
   - Rejected:
     - (b) `surface/80`: the same look, but a second dark layer;
     - (c) muted text: it risks AA;
     - (d) plain text: this is the bug.
   - Row: on `/` at 1440, read the non-New badge computed bg. PASS is `rgba(14, 13, 12, 0.7)`, colour `rgb(236, 230, 218)`, and contrast against the brightest cover ≥ 4.5:1.
2. **The image wrapper (l.78): `bg-surface`.**
   - Rejected:
     - `bg-elevated`: it means hover or raised;
     - transparent: it leaves a hole on failure.
   - Row: block the image requests. PASS is `rgb(22, 20, 18)`, and the square keeps its 1:1 size.
3. **The title hover (l.113): (b) remove `group-hover:text-primary` and its `transition-colors`.**
   - Why: brass is for meaning, and hover is not meaning. The card scale 1.02 and the image scale 1.10 already give feedback.
   - Rejected: (a) and (c), because they spend brass on decoration.
   - Row: hover a card. PASS is that the h3 stays `rgb(236, 230, 218)` before and after, with no `primary` or `card` class on the card.
4. **`.nav-loading-bar`: (b) do not turn it on in this round.**
   - Why not: fixing the token would show a brass line, animating forever with no reduced-motion rule, on every client navigation. That is new flashing UI.
   - Remove the dead rule and its render line in `root.tsx` l.145.
   - Open a separate design task, "pending-navigation feedback": show after about 300 ms, include a reduced-motion variant, and decide muted vs brass.
   - Row: Slow 3G navigation `/` → product. PASS is 0 `.nav-loading-bar` nodes, 0 `accent-hover` in app.css, and nothing new in the top 4 px.
5. **The stub copy (`search.tsx` l.7 and the login stub): swap to `var(--color-muted)`.**
   - Converting the whole stub (inline styles, `button button-primary`, the copy, and whether the routes should exist) is a separate copy/route task.
   - Row: the paragraph colour is `rgb(163, 155, 142)` on `/search` and `/account/login`.

- **Keep out of this round:** the pending-navigation feedback design, and the stub-route rewrite and copy.
- **Saba:** no position or layout moves. This round changes colour only, plus removing a declaration that renders nothing today. The "Limited" keep-list badges are a different component.

## B resolution: protected `root.tsx`
`app/root.tsx` is in `global_forbidden_files`, so B cannot follow item 4 in full.

- **This round:** B replaces the rule body with `display: none;` and deletes the `navLoadingProgress` keyframes. While a navigation is pending, the still-rendered div paints nothing and takes no layout. This is the same look as HEAD, where the invalid background painted nothing, and it also removes the infinite width animation.
- **Root:** removing the render line is ROOT-REQ-NAV-LOADING-BAR-RENDER. Root deletes `root.tsx` l.145 together with the then-orphan rule.
- **Row change:** PD's "0 nodes" row becomes "0 painted px and no layout shift".
- **Follow-up:** the pending-navigation feedback design goes to Saba once as SABA-Q-PENDING-NAV-FEEDBACK (L44), because the loop does not decide whether to add a new visible element.
