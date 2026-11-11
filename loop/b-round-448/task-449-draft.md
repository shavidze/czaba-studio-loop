# Round 449: STORE-2b-3a — gradient text leaves the Store; the emphasised heading word is plain light ink

**Planned by:** B, at the round 448 → 449 planning, 2026-11-11 (`b-round-448.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-448 task is archived as `tasks/round-448.md` (byte-identical copy made before this file was rewritten).
- **Baseline:** gate 448 is `published`, commit `48e16b8` [K1]. The store tree is at `48e16b8` and clean at planning [K2, K18, K19]. `context/head-sha.txt` still says `cce5eda`; the gate's `commit` wins.
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **RETRO:** round 450 (next round).

## Why this round
- C round 448 PASS (`browserVerified`/`realVerified` true, C1–C6 and C8–C13 passed, 0 bugs; C7 real mail send BLOCKED, no Brevo key in the cloud) and gate 448 published `48e16b8`. **STORE-2b-2b is done** and B-R447-HIREUS-EMAIL-LIGHT-CLIENT is closed (D-29z1593).
- **STORE-2b-3 is split** (D-29z1594). `app.css` holds 70 teal hits [K21] plus glow, blur and gradient rules. That is too much for one checkable round. The stages are:
  - **2b-3a (this round):** gradient text.
  - **2b-3b:** glow shadows (`--shadow-glow`/`-accent` and their TSX users, incl. `ui/Button` and `ui/IconButton`).
  - **2b-3c:** the remaining live teal CSS rules.
  - **2b-3d:** dead tokens and rules, which go to the LEGACY cleanup.

  B re-greps every stage at its own planning. The inventory script of this planning counts rules, not consumers, and is not a claim.
- **Why gradient text first:**
  - It is self-contained. It touches 2 CSS rules + 1 token, has 8 live sites and no Studio consumer [K4].
  - The Studio stays at 0 px [K11].
  - It does not touch the obsidian block [K8].
  - It is fully browser-measurable: the HEAD paint is a teal gradient on the glyphs (34–80 % teal ink [K10]).
  - `--shadow-glow` (2b-3b) has no obsidian override and has `ui/Button` users, so it needs its own Studio rows.

## What changes (user-visible)
- **Eight emphasised heading words** stop being painted with the light-grey → teal gradient. Each takes the heading's own light ink #ECE6DA:
  - "CZABA" in the home hero h1;
  - "Releases" (Latest Releases);
  - "Studio" (CZABA Studio);
  - "Inner Circle" (Join the Inner Circle);
  - "Cinema" and "Stand For" on `/about`;
  - "Sound" on the 404 page;
  - the LeadMagnet popup's "CZABA" eyebrow (keep-list: restyle only, text and behaviour unchanged).
- **Nothing moves:** the word boxes, the heading boxes and the line count equal HEAD [K10].
- **Nothing else changes:** no other page, no Studio file, no token value. The obsidian block is byte-identical [K8].

## Reference
- **Store spec:** `store-redesign-spec.md` row STORE-2 says "Remove the 6 blur glow blobs, **the gradient text** and `shadow-glow`. Text brightness: titles #ECE6DA…". The keep-list paragraph (spec l.18) allows "removal of glow and gradients" on keep-list items, with their content, behaviour, timing and placement kept. Direction A ("Obsidian & Brass gallery", `direction-decision.md`) has one accent: brass.
- **`product-designer` consult (this planning):**
  - **Chosen option A:** the emphasised word is solid light ink. The gradient was decoration, not meaning, and round 447 already put titles and the loader wordmark in light ink.
  - **Rejected option B:** a brass word. Brass in 10 headings stops marking clickable things, reads as a link, and weakens the brass CTAs.
  - **Rejected option C:** muting the rest of the heading lowers title contrast.
  - **Exception:** none. The LeadMagnet eyebrow could be caption grey #A39B8E, but the popup is restyle-only, so it takes light ink and Saba is asked once (SABA-Q-LEADMAGNET-EYEBROW-TONE, default ships).
  - **States the designer named:** the pages above at 1440/1280/375, text selection, forced-colors, WebKit (Safari), no leftover gradient, the same line wraps. All are C rows below; WebKit is a Tech Lead row.
- Ableton does not apply: this is Store marketing typography.

**Deviations:** none from the spec.

**Screen budget:** no element is added, moved or removed. Only the paint of 8 existing words changes.

## Ruling lines (L4)
- **"Keep-list: restyle only" vs "remove the class token from `LeadMagnetPopup.tsx`":** the class removal wins. It is a paint-only restyle: the text, the remaining classes `tracking-[0.5em] uppercase`, the DOM structure and the behaviour stay. C5 checks the dialog text against HEAD.
- **"Dead code is not restyled" (round 447 rule) vs "no file names the retired class":** the dead-code rule wins. `ArtistBioSection.tsx`, `TestimonialsSection.tsx` and `VideoShowcase.tsx` have 0 importers outside the barrel [K5] and keep their `text-glow` token, allow-listed with exact counts in GT3. The dead `.loading-brand` rule (its consumer `PianoLoadingAnimation` has 0 importers [K5]) keeps its clip and is allow-listed in GT1.
- **`.product-detail-title` (0 users [K5b]):** its 4 gradient declarations are removed, because they read the removed token. It is the one dead rule this round edits, and only that much of it.
- **`.hero-title-glow`'s `text-shadow`:** it reads `--primary-hue`, which is defined nowhere [K7], so it paints nothing at HEAD. Removing it changes no pixel.
- **The span elements stay.** Only the `className` attribute goes, so the DOM tree and the `NM2` test's `heading.querySelector('span')` are unchanged [K9b].

## 1. Changes (A applies `b-round-448/sketch-449.patch.txt`; sha256 in `b-round-448/sketch-review.md` [K12])

| # | File | Change |
|---|---|---|
| 1 | `app/styles/app.css` | • the `--gradient-text` token goes (the only definition; 4 `var()` reads [K6])<br>• `.text-glow` and `.hero-title-glow` rules removed<br>• `.product-detail-title` loses `background: var(--gradient-text)` and the 3 clip/fill lines<br>• nothing else; the obsidian block byte-identical [K8] |
| 2 | `app/styles/base/utilities.css` | its duplicate `.text-glow` rule and comment removed |
| 3 | `HeroSection.tsx`, `NewsletterSection.tsx`, `StudioShowcase.tsx`, `LeadMagnetPopup.tsx`, `routes/$.tsx`, `routes/_index.tsx`, `routes/about.tsx` (×2) | the `text-glow` / `hero-title-glow` class token removed from the span [K4] |
| 4 | NEW `app/lib/__tests__/store-gradient-text.test.ts` (node) | GT1–GT4 |
| 5 | `app/lib/__tests__/studio-naming.test.tsx` | (title-only change if the review keeps it; see §1b) |
| 6 | NEW doc `docs/implementation/2026/quarter-IV/294-store-2b-3a-gradient-text.md` [K16] | see A step 4 |
