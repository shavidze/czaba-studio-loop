# Store redesign: "One house, two rooms" (Obsidian & Brass across the store)

**Date:** 2026-10-25 · **Status:** approved by Saba (2026-10-25) · **Queue entry:** `STORE-REDESIGN`, after VISUAL-A-OBSIDIAN and before REVIEW-RECOMMENDATIONS.

Source: the design research and the design-philosopher review written for Saba ("CZABA — design research: Apple-level perceived value", a Claude Doc). The research files are in `research/`: `competitors.md` (16 competitors), `luxury-and-galleries.md` (Apple, gallery and luxury sites, research basis) and `visual-pass.md` (computed styles from live competitor homepages). Every claim below about the store's code was made by design-philosopher, with `file:line` references to store master as of 2026-10-25. Re-check each one before relying on it.

## Saba's decisions (2026-10-25)

1. **The store adopts Obsidian & Brass.** Same palette and fonts as the Studio: Instrument Sans for UI, IBM Plex Mono for numerals and metadata, Noto Sans Georgian as the fallback, and **no display serif**. One brass accent (#C9A46A) on #0E0D0C. Playfair, Inter, teal, orange and the buy-blue (#006AFF) leave the store. The store and the Studio differ in pace and density only: the store is a gallery (generous space, large type, 400–600 ms reveals), the Studio is an instrument (dense, 180 ms).
2. **KEEP the marketing and social-proof content as it is for now. Do not remove or reword it.** This covers:
   - the LeadMagnet "FREE DOWNLOAD" popup;
   - Free downloads / Free Samples, including the nav link;
   - the SpecialOffers section;
   - the "Limited" badges;
   - the "2,500+ Happy Customers" and "Netflix Original Score" testimonials;
   - all other stats and claims.

   They may be **restyled** to the new tokens: colour, type, radius and the removal of glow and gradients. Their content, behaviour, timing and placement stay. Saba will remove them himself later if needed. Removing one of them always requires his approval.
3. **Hero headline:** provisionally "Music you finish yourself." Sub: "Every piece arrives in stems. Shape it in the Studio, then take home your version. Buy once, keep it forever." Primary CTA "Listen", secondary text link "Open the Studio →". Keep the copy in one strings place so Saba can change it in one edit. The site language stays English (`lang="en"`).

## Scope by stage (B may split the stages further; one bounded task per round)

| Stage | Contents (design-philosopher ids) |
|---|---|
| STORE-0 | **Cloud verification harness (loop folder only, no store code).** The cloud has no backend, and the store's SSR loaders call `API_URL` (default `http://localhost:5199`). Build `tmp/studio-real-loop/mock-api/server.mjs`: a dependency-free Node HTTP server on 127.0.0.1:5199. It answers the endpoints that the home page, `/store`, `/products/:handle` and the cart need, with a small realistic fixture: 6–9 products (music, SFX, stems), with preview URLs that point at the public demo audio the Studio Lab already uses. Use the response shapes the API client expects (`app/services/api/client.ts` and its types). Cart and auth endpoints return empty or anonymous answers. The cloud job starts this server automatically when the file exists. Verify it serves the routes before STORE-1. |
| STORE-1 | Bugs and quick wins: `AudioPlayer` progress uses the undefined `--color-primary`, so the filled part is invisible; the `AudioPreviewButton` SSR/CSR "Preview" mismatch (layout shift); the template product meta description; the double h1 (Header + Hero); "Czaba Music" in the footer; **D10** entrance loader ≤ 1.2 s, skippable, once per session, off under `prefers-reduced-motion`; **D15** header: Collections · Studio · About · Sign in **plus the existing Free Samples link (kept by decision 2)**; Gift Cards and Hire Us move to the footer; "Studio Lab — Demo" becomes "Studio"; plain wordmark, no gradient. |
| STORE-2 | **D2–D4, D11** tokens and type. Move the store `@theme` to Obsidian & Brass. Replace the hardcoded teal (about 40 uses in about 14 files; recount). Remove the 6 blur "glow" blobs, the gradient text and `shadow-glow`. Text brightness: titles #ECE6DA, body around #CFC7BA, captions #A39B8E. Typography: display in Instrument Sans 500, never 700, with size-dependent tracking (88px −0.02em … 32px 0em, line-height 1.05→1.2); body 17px / 1.5; metadata in Plex Mono 11–12px uppercase +0.1em with `tabular-nums`. Load fonts in `root.tsx` and remove Inter's render-blocking `@import`. Apply negative tracking only to `:lang(en)`. Motion: remove `--ease-bounce`, hovers 200–280 ms (PackCard is 800 ms today), reveals 400–600 ms, scale ≤ 1.01, global `prefers-reduced-motion` including Lenis. **Do not** add `data-studio-theme` to store markup: test TH4 requires it on StudioWorkspace only. The store changes its own `@theme` values. Coordinate any `app.css` edit with the Studio's obsidian block, which must stay byte-identical. |
| STORE-3 | **D1** hero: one still or an 8–12 s muted loop with a poster (AVIF ≤ 150 KB, preloaded, no video on mobile) in place of the 10-slide auto-rotation. H1 = the headline, sized `clamp(48px,7vw,88px)`. Eyebrow in Plex Mono 11px uppercase +0.12em. The first sound starts only from the user's gesture ("Listen"). |
| STORE-4 | **D5–D8** product and listening. Catalogue number + piece name as the product h1 (48–64px, e.g. `CZ-014 · Echoes of a Forgotten City`), shown only if the data has a number; otherwise the name alone. Play on every `/store` card (≥ 44px). Player shows "Now playing — {piece} · {composer}" and reacts in ≤ 100 ms. Product page order: scene line → play → stems → credits → licence → "Make it yours — open in Studio". Price without ".00 USD". Credits and provenance come **only from real data fields**; when a field is empty, it is hidden, never invented. An inline stems mini-mixer replaces the modal where that is feasible, with an 80–120 ms stagger and a "Solo the strings" first-win hint. |
| STORE-5 | **D9** (store part): loading text that shows the real work ("Loading Strings — 48 kHz / 24-bit — 3 of 7") in place of "Loading stems...". Update the design docs: `docs/design/brand-vision.md` (one accent, no serif), `.claude/primitives/DESIGN_TOKENS.md` (Obsidian & Brass, no glow; Saba approved the direction on 2026-10-25), `docs/design/DESIGN_SYSTEM.md`, and `visual-direction-a.md` line 60 (Cormorant is obsolete since the 2026-10-25 no-serif decision). |

Later and out of this entry: D12 UI sound palette, D13 licence / ZIP / BWF, D14 seasonal or numbered collections (a business decision), and the Studio's D9 texts. They are listed in the research doc.

## Rules for every stage

- Do not touch the Studio-owned files: `app/components/arrangement/*`, `app/lib/arrangement/*`, `app/routes/studio-lab.tsx`, the obsidian block in `app.css`, or `CookieConsent.tsx`. The protected files stay untouched as always.
- C verifies each stage in the real browser (Playwright) against the mock API from STORE-0, at 1440×900, 1280×720 and 375×812. Each stage measures LCP ≤ 2.5 s and CLS < 0.1 on the home page, text contrast ≥ 4.5:1 (≥ 3:1 for UI parts), and `prefers-reduced-motion`. Take before and after screenshots of the home page, `/store` and one product page.
- The 2026-10-23 bug gate applies: Medium and above are fixed now, Lows go to `deferred_low_polish`.
- Content that would need a real fact (credits, room, catalogue number, counts) is shown only from data. Never invent it.
