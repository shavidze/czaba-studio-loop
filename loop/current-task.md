# Round 447: STORE-2b-2a — the hardcoded teal leaves the reachable Store screens

**Planned by:** B, at the round 446 → 447 planning, 2026-11-11 (`b-round-446.md`).
- The advisor was available and was consulted after orientation and before hand-off.
- The round-446 task is archived as `tasks/round-446.md` (byte-identical copy made before this file was rewritten).
- **Baseline:** gate 446 is `published`, commit `5df7717` [K1]. The store tree is at `5df7717` and clean at planning [K2, K18].
- **Regression:** not due (last 2026-11-10, round 425; due on or after 2026-11-13). **RETRO:** round 450.

## Why this round
- C round 446 PASS (`browserVerified`/`realVerified` true, 1 Low) and gate 446 published `5df7717`. **STORE-2b-1 is done.**
- **C-R446-01 ruling (L10, D-29z1586).** C asked whether change 3 of round 446 ("the last submit error is cleared") covers a submit that is still in flight when the hide happens. It does not: round 446 specified the reset at hide time only, so this is a spec gap (origin **B sketch**; A applied the patch unchanged). It is the same issue as the code-reviewer's A-R446-REVIEW-L1, so C-R446-01 is recorded as `confirmedBy` on that id (L7). Severity stays Low: the path is rare and loses no data. It moves to `deferred_low_polish` and is attached to the next stage that touches `useLeadMagnet.ts` (the store polish pass), with C's probe `c-round-446/tools/inflight.cjs` as its acceptance row. Round 447 does not own that file.
- Order (D-29z1583): STORE-2b-2 is next. STEM-LANES is still `awaiting_user`.
- **STORE-2b-2 is split (D-29z1587):** the full recount at `5df7717` is **44 teal hits in 14 TS/TSX files** [K3, K4], not 24 in 9. The earlier recount missed `rgba(19, 217, 204 …)` and the `hsl(175 …)` forms. The hits fall into four groups:
  - **2b-2a (this round): 21 hits in 7 files that render on Store pages C can reach** [K4, K19].
  - **Stems modal, 2 hits:** `StemsPlayerModal.tsx` (1) and `StemControl.tsx` (1) [K4]. No mock product renders "Play Stems" (B probe: 0 of 6 handles [K19]). The product loader runs on the server, so a `page.route` stub cannot reach it. These hits move to **STORE-4**, whose D8 replaces the modal with an inline stems mini-mixer; the mapping there is Solo = `bg-foreground text-background`, spinner `text-muted`. That stage needs a mock product with stems: **ROOT-REQ-MOCK-API-STEMS** (the mock API is root's STORE-0 harness).
  - **2b-2b (next): 8 hits in the e-mail HTML** (`app/lib/email.server.ts` 5, `app/routes/hire-us.tsx` 3) [K4]. E-mail HTML cannot use tokens and cannot be sent in the cloud, so it gets its own round. That round adds a row that renders the generated HTML in Chromium and measures contrast against the e-mail's own dark background.
  - **Dead code, 12 hits:** `app/components/audio/Timeline.tsx` (5; 0 importers outside the barrel) [K5] and `app/components/loading/CinemaCurtainLoader.tsx` (7; 0 users) [K6]. `PianoLoadingAnimation.tsx` (orange; 0 users) [K7] joins them. Nothing is restyled here, and no browser row could prove a restyle. They are recorded as **LEGACY-DEAD-STORE-COMPONENTS** for the next cleanup or ARCH-SPLIT round, under Saba's legacy removal policy (2026-11-10).
  - **Frozen legacy, 1 hit:** `app/components/studio/StudioTrack.tsx:155` (`app/components/studio/**` is `global_forbidden`). It is recorded under SRW-21 / legacy Studio removal and stays as it is.

## What changes (user-visible)
1. **Home page.**
   - The **Studio showcase illustration** loses its teal. Waveforms become light ink and the volume fill brass, with a light thumb. The play button becomes brass with dark text, and the "Export Mix" pill brass on a faint brass fill. The waveform glow goes.
   - The **entrance loader** wordmark "CZABA" becomes solid light ink, with no gradient and no glow. The teal halo goes. The sweep line becomes a solid thin brass line that keeps its width animation.
   - The two **Special Offers** cards and the **Newsletter** button lose their teal hover glow. The image zoom and `hover:bg-brand-hover` still show the hover.
2. **Product cards on the home page** (`ProductSection`; `ProductCard` renders on no other public route, and also on the protected `account.downloads.tsx`). The mouse-follow teal spotlight and the teal edge glow go. The card's hover scale and the preview overlay stay.
3. **`/gift-cards`.** The selected amount card loses its teal glow and keeps `border-brand bg-brand/5`.
4. **`/checkout/success`.** The one-shot teal ripple ring around the check icon goes. The brass check icon's scale-in stays.
5. **Nothing else changes.** The keep-list content (SpecialOffers, LeadMagnet, Free downloads, badges, testimonials and stats) keeps its text, behaviour, timing and placement. Only the glow is removed, as Saba's decision 2 allows. Layout, sizes and copy do not change.

## Reference
Ableton does not apply: this is a Store restyle. The authority is Saba's spec (`docs/technical/store-redesign/store-redesign-spec.md`). It sets one brass accent #C9A46A on #0E0D0C, says teal leaves the store, and makes "removal of glow and gradients" a permitted restyle on keep-list sections. The STORE-2 row says to remove the glow and the gradient text, with titles in #ECE6DA. For in-product consistency, the real Studio is the reference: Solo on is `border-foreground bg-foreground text-background` [K12], and Play is brass while playing.

**`product-designer` consult (this planning), adopted as the per-hit rulings in §1.**
- Every glow or halo goes (X).
- Brass stays only on flat fills and strokes (R).
- Solo uses the light fill, not brass (brass means "playing" in the Studio) and not yellow (a second accent). This applies to the stems modal in STORE-4. In this round it decides that the StudioMockup solo waveform uses foreground, not yellow.
- The checkout ripple was a judgement call. It is removed, because the check icon's scale-in is already the success beat. A brass ripple is the rejected option and is offered to Saba once as `SABA-Q-CHECKOUT-RIPPLE` (`awaiting_user`; the default ships).
- The designer also spotted things outside this round, recorded but not touched:
  - the white floor-reflection blur in the loader;
  - the loader's `font-bold` [K11] against "500, never 700";
  - ProductCard's `scale-[1.02]` and 500 ms transitions against the motion limits;
  - the StudioMockup mute `bg-red-500` and window dots;
  - StemControl's missing `aria-pressed` [K17].

  These belong to STORE-2c/2d (type and motion) and the polish pass. B records them in the backlog (D-29z1587).

**Deviations:** none from the spec. In the loader, the block under the comment "Secondary glow - brand color" (l.141–158) **is** the teal halo, and 6a removes it. The non-teal glow blobs in TSX (`NewsletterSection.tsx` "Background glow", `gift-cards.tsx` "Background glow", the loader's white "Main spotlight glow" l.120–139 and white floor reflection) and the CSS classes `text-glow`, `hero-title-glow` and `light-flicker-effect` are **2b-3's** inventory, not this round's. They stay byte-unchanged here.

Screen budget: nothing is added; decoration is removed. LCP/CLS, contrast and reduced-motion rows apply (STORE stage rule).

## Ruling lines (L4)
- **Glow removal vs keep-list.** On SpecialOffers, glow removal is a permitted restyle (Saba decision 2). The content, link targets, text and image stay byte-identical outside the removed class token.
- **"Teal goes" vs "glow outside the list stays".** Only the 21 listed hits change. Any other glow in a granted file is untouched this round.
- **ProductCard.** The spotlight layers go, and with them the state and handlers that exist only for them (`mousePosition`, `isHovering`, `handleMouseMove`, `onMouseMove/Enter/Leave`). `cardRef` stays if anything else uses it; A greps it, and if its only use was the spotlight, it goes too. The preview overlay wrapper (the one `opacity-0 group-hover:opacity-100 focus-within:opacity-100` tag) stays, so `store-focus-ring` (c) keeps exactly 1 wrapper. The 2 spotlight tags are self-closing and are not counted by that helper [K9].
- **Muted waveform.** It keeps its neutral look but uses a token class (`text-dim` if defined in the theme, else `text-muted`; A cites the `@theme` line), not hex. No hex colour remains in StudioMockup's colour map.

## 1. Per-hit mapping (A implements exactly this; tokens only, no hex)

| # | File:line at `5df7717` | Now | After |
|---|---|---|---|
| 1 | `ProductCard.tsx:96-116` | two mouse-follow radial teal layers | removed (layers + spotlight-only state/handlers, ruling above) |
| 2 | `SpecialOffersSection.tsx:11`, `:47` | `transition-shadow hover:shadow-[0_0_20px_rgba(19,217,204,0.3)]` | both tokens removed; other classes unchanged |
| 3 | `NewsletterSection.tsx:84` | `hover:shadow-[0_0_30px_rgba(19,217,204,0.3)]` | removed; `hover:bg-brand-hover` stays |
| 4 | `gift-cards.tsx:291` | `shadow-[0_0_20px_rgba(19,217,204,0.2)]` | removed; `border-brand bg-brand/5` stays |
| 5 | `checkout.success.tsx:63-70` | `motion.div` teal box-shadow ripple | the whole ripple `motion.div` removed |
| 6a | `SpotlightLoader.tsx:141-158` ("Secondary glow - brand color", teal at l.155) | teal radial halo `motion.div` | removed with its comment |
| 6b | `SpotlightLoader.tsx:200-203` | gradient wordmark (`background` + `WebkitBackgroundClip` + `WebkitTextFillColor` + `backgroundClip`) [K10] | removed; wordmark gets class `text-foreground`; `font-bold` and size unchanged (STORE-2c) |
| 6c | `SpotlightLoader.tsx:204-205` | teal `drop-shadow` filter | removed |
| 6d | `SpotlightLoader.tsx:218-222` | teal gradient sweep line (inline `background`) | inline `background` removed; class `bg-brand/50` added; width/opacity animation unchanged |
| 7a | `StudioMockup.tsx:26-55` | `colorMap` hex (`#13D9CC`, `#F9A80C`, `#525252`), teal `drop-shadow` | drop-shadow removed; `stroke="currentColor"` on both paths; the svg gets `text-foreground` for normal and solo, and the muted token class (ruling above) for muted; the opacities 0.8/0.4 stay |
| 7b | `StudioMockup.tsx:126` | fill `bg-teal-500` | `bg-brand` |
| 7b' | `StudioMockup.tsx:130` | thumb `bg-teal-500` | `bg-foreground` |
| 7c | `StudioMockup.tsx:180` | `bg-teal-500 text-white` | `bg-brand text-brand-foreground` |
| 7d | `StudioMockup.tsx:211` | `bg-teal-500/20 text-teal-400` | `bg-brand/15 text-brand` |

A renames StudioMockup's `color` prop values only if needed to remove the word "teal" (for example `'active' | 'solo' | 'neutral'`). Every caller in the same file is updated. The prop is file-local [K4].

## 2. A: steps
1. Run `bash b-round-446/claims-447.sh` before editing. K1, K2, K3, K4 and K18 must equal `b-round-446/claims-447-planning-output.txt`. Otherwise STOP (L11).
2. Apply §1 to the 7 files.
3. Add `app/lib/__tests__/store-teal-sweep.test.ts`. It uses the same regex as the claims script (`R=` in `claims-447.sh`).
   - **TS1:** scan every `app/**/*.{ts,tsx}` outside `__tests__`. Every teal hit must be in an explicit allow-list map of file → reason: `components/studio/StudioTrack.tsx` frozen legacy; `lib/email.server.ts` and `routes/hire-us.tsx` STORE-2b-2b; `components/audio/Timeline.tsx` and `components/loading/CinemaCurtainLoader.tsx` LEGACY-DEAD-STORE-COMPONENTS; `components/audio/StemsPlayerModal.tsx` and `components/audio/StemControl.tsx` STORE-4 (stems modal).
   - **TS2 (non-vacuous):** the walker lists ≥ 200 files and contains the 7 granted paths, and the allow-listed files still have ≥ 1 hit each. A stale allow-list entry fails, so a later stage must shrink the list.
   - **TS3:** the 7 granted files contain no `shadow-[0_0_` and no `drop-shadow(0 0`. The colour part reuses the claims regex `R`, not a bare `rgba(19` substring.
   - **TS4:** `SpotlightLoader.tsx` has no `WebkitBackgroundClip` and no `backgroundClip`.
   - Name the mutants in the doc and run each one on a scratch copy: M1 `bg-teal-500` re-added in StudioMockup → TS1 red; M2 an allow-list entry removed → TS1 red; M3 a fake allow-list entry for a clean file → TS2 red; M4 `hover:shadow-[0_0_20px_rgba(201,164,106,0.3)]` (brass glow) in SpecialOffers → TS3 red; M5 `WebkitBackgroundClip: 'text'` re-added → TS4 red. Revert each one. Save the results in `a-round-447/mutants.txt`.
4. Write `docs/implementation/2026/quarter-IV/292-store-2b-2a-teal-sweep.md` in Georgian, with technical terms in English.
   - l.3 `**თარიღი:** 2026-11-11`.
   - l.4 exactly `**სტატუსი:** In Progress (stage 2b-2a of STORE-2b; C round 447 PASS)` (L28).
   - The seven TEMPLATE headings in order (L26).
   - Content: the inventory (44/14 → 23/9 here), the split, the per-hit table in prose, the product-designer rulings, the frozen and dead dispositions, mutants M1–M5, and only test ids that exist.
   - TODO: 2b-2b e-mails, the stems-modal hits in STORE-4 (ROOT-REQ-MOCK-API-STEMS), 2b-3, 2b-4, LEGACY-DEAD-STORE-COMPONENTS, SABA-Q-CHECKOUT-RIPPLE.
5. Checks (speed rules, no full suite):
   - `npx vitest run $(cat b-round-446/covering-files.txt)`: all green. A red or slow (> 50 % of its timeout) covering file is a STOP (L11).
   - `npm run typecheck` rc 0.
   - `npm run lint` rc 0, with the warning count ≤ HEAD's (205).
   - `npx biome check` on the 8 code/test paths rc 0.
   - code-reviewer (3+ files).
6. `bash b-round-446/claims-447.sh` after the edits. Only K3, K4 (the 7 granted files → 0), K9 (→ 1), K10 (→ 0), K11 (unchanged = 1), K13 and K14 may differ from the planning output. Save the diff as `a-round-447/claims-diff.txt`.
7. `git status` shows only paths in `b-round-446/grants-447.txt`. No forbidden file is touched [K18].

## 3. C: acceptance rows
Real Chromium (Playwright) on `http://127.0.0.1:5173`, with the mock API on `:5199` (start `node tmp/studio-real-loop/mock-api/server.mjs` if it is down).
- **Viewports:** 1440×900, 1280×720 and 375×812. Fresh context per cell, empty storage, cookies declined, LeadMagnet dismissed through `localStorage` only where it covers the element under test.
- **HEAD control:** on `:5178` via `bash b-round-445/probe/sketch-server.sh start <c-round-447 dir> 5178 none` (own Vite cacheDir, L38).
- **Probe:** copy `b-round-446/probe/teal-scan.cjs` into `c-round-447/` before editing it (L60).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` | only paths in `grants-447.txt`; `root.tsx`, `app/components/studio/**`, `app/styles/**` and the protected routes unchanged [K18] |
| C2 CLAIMS | `bash b-round-446/claims-447.sh` vs the planning output | only the keys allowed in A step 6 differ; K4 = 0 for each of the 7 granted files; the 7 excluded files keep their counts |
| C3 TEAL-SCAN | `teal-scan.cjs` on tree and HEAD at 1440 and 375, on `/`, `/store`, `/products/pulse-loop-kit`, `/gift-cards`, `/checkout/success` | tree: every remaining hit's element class contains `hero-title-glow`, `text-glow` or `light-flicker-effect` (2b-3's CSS), and 0 hits are on `svg`/`path`. At 1440, HEAD reproduces B's counts (`/` 34, `/gift-cards` 1 [K16]); at 375 the HEAD counts are `record` |
| C4 HOVER-STATES (1440, 1280) | on `/`: hover the first product card in `ProductSection` (an `article` with a `/products/` link), each SpecialOffers card (`div.group.relative.min-h-[300px]`, nth 0 and 1) and the Newsletter submit; on `/gift-cards` click the first amount | tree: computed `box-shadow` of each hovered or selected element contains no `19, 217, 204`. The card has 0 descendants whose `background-image` includes `radial-gradient` (the measured element is the card; HEAD has 2). The card still scales: computed `scale` = `1.02`, as HEAD (transform stays `none`). The Newsletter background is brand-hover rgb(217, 184, 127) and the selected amount's border is brand. HEAD: the teal box-shadow is true on all 4, and the card has 2 radials (`b-round-446/probe/head-states.json` [K19]) |
| C5 LOADER | fresh context, `/` at 3 viewports; read at about 450 ms inside `[data-testid="entrance-loader"]` (B's recipe in `head-states.cjs`) | tree: the wordmark span "CZABA" has `color` rgb(236, 230, 218), `-webkit-text-fill-color` not transparent, `background-image` none, `filter` none; 0 loader descendants with teal in `background-image`/`filter`; the sweep line's `background-color` is brass with alpha 0.5, and its width at the holding phase is > 0. HEAD: gradient + teal drop-shadow, 3 teal elements [K19]. Screenshot per viewport, tree and HEAD |
| C6 REDUCED-MOTION | `prefers-reduced-motion: reduce`, `/` at 1440 and 375 | the loader behaves as at HEAD under reduced motion (same presence and duration); no new motion |
| C7 STUDIO-SHOWCASE | `/`, scroll the Studio showcase into view at 3 viewports | tree: 0 `svg path` with teal stroke or teal svg filter (HEAD 8 [K19]); waveform stroke = foreground (the muted track = the muted token); the volume fill is brass and the thumb foreground; the play button is brass with dark text, contrast ≥ 4.5:1; "Export Mix" text-brand on `bg-brand/15`, contrast ≥ 4.5:1 measured on the composited background; screenshots tree and HEAD |
| C8 CHECKOUT-SUCCESS | `/checkout/success` at 3 viewports (renders without a session, h1 "Your Collection Awaits") | tree: 0 elements matching `div.absolute.inset-0.rounded-full` with a box-shadow other than `none`, and no teal; the check icon renders and scales in. HEAD: the ripple element with a teal box-shadow [K19] |
| C9 FULL-PAGE SHOTS (stage rule) | full-page screenshots of `/`, `/store` and `/products/pulse-loop-kit` at 1440, 1280 and 375, tree and HEAD, after the loader | saved; C lists every visible difference. Allowed: the 21 mapped hits only (showcase colours, the hover glows that are not visible at rest). Any other difference is a finding |
| C10 KEEP-LIST | `/` at 3 viewports: SpecialOffers, Newsletter, the "Limited" badge, testimonials and stats; `innerText` and link `href`s of each section, HEAD vs tree | byte-identical |
| C11 LCP-CLS | `/` and `/store` at 1440 and 375, 3 loads each, tree and HEAD | LCP ≤ 2.5 s and CLS < 0.1 on tree (`record` the HEAD values beside them) |
| C12 COVERING | `b-round-446/covering-files.txt` | green; test counts recorded |
| C13 MUTANTS | re-run A's M1–M5 on a `git clone --shared` scratch at `5df7717` + A's diff (never in the store tree) | each red on its named row, green after revert; equal to `a-round-447/mutants.txt` |
| C14 STUDIO+AUTH | `/studio-lab` add a clip, Play advances the clock, Stop halts (1440, 1280); anonymous `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` | as HEAD; purchase protection preserved |
| C15 DOCS | doc 292 | l.4 exact; TEMPLATE headings in order; M1–M5 named; the cited test ids exist; no `pending` |

Gate rows (full vitest, typecheck, build, Biome, verify) are `gate` and are not claimed by C. Write all L57 fields in `c-round-447.json`, with an `origin` on every finding; `mutantRedOnSketch` is `null` with the reason "no B sketch this round; A's mutants (C13)".

**Neighbours that could break:**
- `store-focus-ring` (c), the ProductCard overlay wrapper count;
- `store-entrance-loader` (the loader's timing, skip and once-per-session contract);
- the ProductCard price and Buy rows (`product-price-cards`), which `account.downloads.tsx` (protected) also renders. That page needs sign-in and the backend, so its browser half is BLOCKED "backend unavailable in cloud"; the jsdom covering file `product-price-cards` covers the card itself.

## 4. Claims
`b-round-446/claims-447.sh` (K1–K19); planning output `b-round-446/claims-447-planning-output.txt`. HEAD probes: `b-round-446/probe/teal-scan.cjs` with `teal-head-1440.json` [K15, K16], and `head-states.cjs` with `head-states.json` (3 viewports) [K19].
