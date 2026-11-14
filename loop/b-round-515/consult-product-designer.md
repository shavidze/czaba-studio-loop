# product-designer consult: NONBRAND N4 (B round 515 -> 516, 2026-11-14)

Read-only consult (files read only, nothing edited or run). B's transcription of the final answer.

## Control 1: SpecialOffersSection l.37, l.65 — confirmed
- `buildButtonClassName({ variant: 'secondary', size: 'lg', className: 'w-fit' })`, default shape (not pill).
- Radius and weight change (rounded-lg -> rounded-md, font-medium -> semibold) = restyle, not reword/move. Keep `w-fit` (flex-col parent would stretch it). Padding/text size unchanged.

## Control 2: LeadMagnetPopup Close
- `IconButton variant="ghost" size="lg" label="Close"`, `className="absolute top-4 right-4"`, `<X size={24} />`, `ref={closeButtonRef}`.
- Which rule wins: Saba owns keep-list positions, so the inset is compensated: top-4/right-4 puts the 48 px box centre at 16 + 24 = 40 px from the edges, where today's 32 px glyph centre is (24 + 16 = 40). 0 px shift, no Saba question.
- Glyph 24 px (IconButton lg standard); hit area 32 -> 48 px. Visible cross shrinks (restyle).
- Colour: ghost `text-muted` (#a39b8e on #0e0d0c ~7.0:1, consult's calculation) vs today's foreground/60 (~6.1:1); both pass 3:1.
- Native `title="Close"` is acceptable (matches the accessible name).

## States
Rest / hover (secondary: bg-outline + border-outline-hover; Close: bg-elevated + foreground glyph) / keyboard focus (global :focus-visible ring, hidden for pointer focus; no own ring) / pressed (secondary opacity 90 %; Close scale 95 %) / 375, 1280, 1440 (Close 16 px from the corner, no overlap with the CZABA wordmark; links do not wrap or stretch) / reduced motion (150 ms acceptable).

## Proposed rows
1. 1280: Close box 48x48; centre 40 +-2 px from top and right edges.
2. Popup open: activeElement = Close; name and title "Close".
3. Keyboard focus on Close: outline 1.5 px brand.
4. Hover Close: background elevated, glyph foreground.
5. 1440 and 375: both links width = content, radius as rounded-md, text and href unchanged.
6. 375: Close box and wordmark do not intersect; no horizontal scroll.
