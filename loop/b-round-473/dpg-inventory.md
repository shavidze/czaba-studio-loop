# DPG-FIX inventory at 58fc56e (B, round 473 → 474 planning, 2026-11-12)

Scanner: `scan/hue-scan-v2.py` finds colour literals with hue 160–200°, saturation ≥ 25 % and lightness 12–90 %. It reads:
- hex in #rgb, #rgba, #rrggbb and #rrggbbaa form;
- `rgb()` and `rgba()`, with commas or spaces;
- `hsl()` and `hsla()`, including `deg`;
- Tailwind `teal-`, `cyan-`, `emerald-` and `sky-` classes;
- the words teal or cyan, recorded only.

Mutant proof is in `scan/mut-lines.txt`: 6 of 6 teal forms caught. Brass, grey and orange are not flagged.

## Counts
- **`app/` at HEAD:** 41 hits (`scan/app-counts-head.txt`).
- **`app/` after sketch-474:** 20 hits (`scan/app-counts-sketch.txt`). All 20 are frozen legacy Studio code or non-colour words:
  - `components/studio/StudioTrack.tsx` 1 (hsl);
  - `components/studio/VideoPlayer.tsx` 2 (the class name `slider-thumb-teal`);
  - `styles/studio.css` 8 and `styles/pages/studio.css` 8 (4 hex + 4 selector words each);
  - `utils/ableton-export.ts` 1 (comment "Cyan" on Ableton clip colour index 21; this is export data, not UI).
- **`docs/`:** 281 hits (`scan/docs-counts.txt`). Most are history records under `docs/implementation` and `docs/bugs`; these stay as written. In scope for DPG-DOCS-UPDATE: `docs/design/DESIGN_SYSTEM.md` 13 hits, plus the other `docs/design/*` reference files.
- **`.claude/`:** 17 hits (`scan/claude-counts.txt`). `.claude/**` is forbidden for the loop, so these go to root as a patch proposal.

## The policy's "~100 teal" claim
The hue scan of `app.css` at a8599a2 (2026-11-11, before STORE-2b-3) gives exactly **61** hits (claim K15). The "61" therefore matches a pre-STORE-2b-3 tree, counted as every teal colour literal rather than only `rgba(19, 217, 204` (line counts of that literal: 46 rgba plus 19 hsl until 2026-10-26).

Hits fell over STORE-2b:
- a8599a2 (2026-11-11): 41 / 13
- db641ec: 39 / 10
- 2e26962: 22 / 10
- d55ec17 (2026-11-12): 7 / 5

The gate review most likely read that tree, for example an older Vercel preview. Root is asked to name the commit (ROOT-REQ-DPG-GATE-REPORT).

## Per DPG id
| DPG id | Tree evidence at 58fc56e | Class | Stage |
|---|---|---|---|
| DPG-TEAL-PURGE | 14 hits in `app.css`: `@theme` 6, dead rules 8. 3 in `utilities.css` (`.stems-loader-list`). 1 in `StemControl.tsx:23` and 1 in `StemsPlayerModal.tsx:66`; both are unreachable, because `createDisplayVersions` never sets `stems` [K5]. Policy-named files `ProductCard`, `SpotlightLoader`, `NewsletterSection`, `SpecialOffersSection`, `StudioMockup` and `hire-us` have 0 hits; they are pinned teal-free by `GRANTED_TEAL_FREE_SOURCES`. `email.server.ts` was deleted in round 462 | dead + unreachable; frozen legacy listed separately | **P0-1 (round 474)** |
| DPG-GRADIENT-TOKENS | `--gradient-primary`, `card`, `hero`, `accent` and `glow`, `--color-glow-primary` and `--color-glow-secondary`: 0 readers [K7]. `--gradient-text` and `--shadow-glow` do not exist in `app/styles` | dead tokens | **P0-1** (redefined to brass and obsidian) |
| DPG-DECORATIVE-PURGE (tokens part) | the 7 `--color-crystal-*` and `--color-premium-*` tokens: 0 readers [K6] | dead | **P0-1** (pulled forward; the rest of DPG-DECORATIVE-PURGE stays in P2) |
| DPG-UNDEFINED-TOKENS | `--primary-hue` 2 refs (`.artist-photo-border` and `.artist-photo-glow`, used by `ArtistBioSection`; reachability unchecked). `--radius-xs` 3 refs. `--color-text-primary` 5 refs; `.code-4` is byte-pinned in `store-live-teal` LIVE_RULE_BLOCKS. `radius_full` 0. `ProductCard.tsx:101` uses undefined `bg-primary/90 text-primary-foreground` [K11] | live (visible) | P0-2 |
| DPG-SPOTLIGHT-FIX | 0 teal in `SpotlightLoader.tsx`; it uses white light, black and `bg-brand/50`. Saba's SABA-B-16 logo is unconfirmed | design decision | P0-3 (product-designer + root's gate report) |
| DPG-DOCS-UPDATE | `DESIGN_SYSTEM.md` 13 hits ("რატომ Teal + Orange?" l.720). `.claude/primitives/DESIGN_TOKENS.md` l.9, l.26 and l.108 (root). `direction-decision.md` sits outside the store repo (root) | docs | P0-3 (or P0-2, if the P0-2 tokens change documented values) |
| Frozen legacy Studio | `components/studio/StudioTrack.tsx:155`, `VideoPlayer.tsx` `slider-thumb-teal`, `styles/studio.css` and `styles/pages/studio.css` (`#14b8a6` and `#0d9488`) | frozen and forbidden | question to Saba and root (SABA-Q-DPG-LEGACY-STUDIO-TEAL) |
