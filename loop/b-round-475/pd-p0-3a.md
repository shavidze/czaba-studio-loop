# product-designer ruling: DPG-P0-3a SpotlightLoader palette (B consult, 2026-11-12, round 475 → 476 planning)

Read-only consult. Verbatim summary of the rulings:

1. **Background.** Use `var(--color-background)` (#0e0d0c) in three places:
   - the overlay's inline style;
   - `bg-black`, which becomes `bg-background`;
   - the `ENTRANCE_COVER_CSS` failsafe.

   The cover, the loader and the page then share one colour, so there is no step at hand-off. Rejected: #000 (a cold step) and surface (lighter than the page).
   Risk: the cover goes transparent if app.css has not loaded. The cover is rendered right after the stylesheet links (test E11), and HEAD has the same dependency on `var(--color-black)`.
2. **Cone, pool and top glow:** `rgba(var(--color-brand-rgb), a)`. The alphas rise slightly, because brass is about half as bright as white:
   - cone 0.04 / 0.10 / 0.04;
   - pool 0.18 / 0.06;
   - top glow 0.12.

   Rejected: the same alphas, which leave a muddy, invisible beam.
3. **Dust:** `bg-foreground/50` (ivory). Rejected: brass dust (it reads as glitter) and white.
4. **Vignette:** `color-mix(in srgb, var(--color-background) 80%, transparent)`. Rejected: `rgba(0,0,0,0.8)`, which steps at hand-off.
5. **Wordmark:** `text-brand`, keeping `font-bold`.
   - **Moved into this round:** the DPG-LOGO header colour. `Header.tsx` wordmark `text-foreground` → `text-brand`. Without it the loader logo would fade into an ivory header logo, and that may be what SABA-B-16 means.
   - **`font-serif` is left out:** it is the same face as `font-sans`, so it changes nothing. Saba is told, not silently given a no-op.
   - The weight difference (bold vs extrabold) is typography, outside a colour round.
   - Side effect to check: two brass items in the header (logo + active nav).
6. **Divider and tagline:** keep `bg-brand/50` and `text-muted`.
7. **Acceptance rows** (Chromium, 1440×900 and 1280×720):
   - **A:** the loader, `body` after exit and `body::before` (cover) are all `rgb(14, 13, 12)`.
   - **B:** the loader wordmark and the header logo are `rgb(201, 164, 106)`.
   - **C:** wordmark contrast against neighbouring pixels during hold is ≥ 4.5:1, measured.
   - **D:** no white or black literals in the loader; the timing tests pass unedited.

SABA-B-16 stays open: the asset is still unconfirmed, and the favicon and og-image are root-only.

## B notes on the rulings
- **Measured on the sketch (`probe/probe-sketch.json`, `contrast-wordmark.json`):**
  - row A holds at both viewports;
  - row B holds;
  - row C: 7.55–7.56:1 against the median ring pixel and 6.73–6.81:1 against the lightest (HEAD white: 15.39–15.4:1).
- **The two-brass header side effect:** on `/store`, "Collections" is active (brass, `bg` rgb(29, 26, 23)) and the logo is brass (`probe/sketch-store-header-*.png`). This is recorded for the DP gate, not decided by the loop.
