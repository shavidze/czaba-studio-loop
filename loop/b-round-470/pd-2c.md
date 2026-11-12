# product-designer consult — STORE-2c split (B round 470 → 471 planning, 2026-11-12)

This is a summary of the read-only agent's answer, written down by B. The agent checked `app/styles/app.css` l.122–123, l.337 and l.1623–1644, `app/assets/fonts/fonts.css` l.466–683, and spec l.9, l.27 and l.36–37.

## Q1: Can 2c-1 (the family swap only) be published on its own?
- **Chosen:** publish 2c-1 alone. 2c-2 (display and body scale) must land **within 3 rounds** of it. The headings keep their size and weight contrast and lose only the serif contrast. An all-sans site is tidy and matches the Studio.
- **Rejected:** the family swap plus the display scale in one round. It touches about 28 files, and a bad screenshot could not be traced to one change.
- **Rejected:** keeping Playfair until 2c-2. Two families would sit side by side for longer.
- **Trade-off:** for a few rounds the hierarchy is a little flatter, and `font-bold` headings look heavier than the final 500.
- **Weights.**
  - A 700 request renders with the 600 face, and Chromium does not fake bold when a face of 600 or more exists. This comes from the agent's memory, not from the Chromium source.
  - `font-light` (300) falls back to 400.
  - Bold Georgian text is faked: Noto Sans Georgian ships 400 and 500 only.

## Q2: When does `--font-mono` change?
Switch the token in 2c-1. Today the store has no `--font-mono` and falls back to the system monospace, which differs on every OS. Uppercase, tracking and `tabular-nums` stay in 2c-3. Plex Mono ships weight 400 only, so bold mono text gets fake bold; the C row checks this.

## Q3: Rows the agent requires
Viewports: 1440×900, 1280×720 and 375×812, with before and after screenshots.
1. **Home.** Covers the hero, SpecialOffers, testimonials and stats. Body and h1/h2 use Instrument Sans, no new overflow at 375, and CLS stays below 0.1.
2. **LeadMagnet "FREE DOWNLOAD" popup, open.** The layout is kept, nothing is clipped, and the focus ring is visible.
3. **/store cards.** The "Limited" badge stays on one line, mono numbers do not overflow, and no bold text is visibly faked.
4. **Product page with a long title.** The h1 wraps cleanly at 375 with no horizontal scroll.
5. **Glyph fallback.** Georgian renders in Noto Sans Georgian, and "— · → €" show no empty boxes.
6. **Network.** No Inter or Playfair requests, and every font request returns 200.
7. **Legacy `/studio/<handle>`.** A screenshot at 1280×720, and the change noted in the round log.

## Q4: Does the legacy `/studio/<handle>` route change?
Yes, through the cascade only:
- `StemsLoadingAnimation.tsx:235` uses `font-serif` and becomes sans.
- 15 `font-mono` uses (for example `TransportBar.tsx:309`) become Plex Mono.
- `StudioTrack.tsx:256/268` use `font-bold` and render at 600.

No protected file is edited. The agent's default is to accept this; whether to freeze the legacy route visually is a question for Saba.

**Guard:** the store stack must equal `app.css:1643` exactly, Noto Sans Georgian included.
