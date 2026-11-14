# product-designer consult, round 501 -> 502 planning (2026-11-14), stage 2b-3 mapping

Verbatim ruling (read-only consult; B's prompt listed the three sites with HEAD classes and the earlier rules):

| Site | variant / size / shape | className | Dropped or changed | Acceptable? | Rationale |
|---|---|---|---|---|---|
| 1. Cart "Upgrade" (`cart.tsx:160`) | primary / sm / default | `min-h-11 shrink-0` | `text-black` -> `text-background`; weight 500 -> 600; radius 4px -> 8px; hover `brand/90` -> `brand-hover`; gains shadow-sm; height 32px -> 44px | Yes | Inside a notice row, not a standalone CTA -> default shape. sm keeps it compact; `shrink-0` stops wrapping at 375. |
| 2. "Create a scene" (`recordings.$productId.tsx:188`) | primary / md / pill | `mb-6 min-h-11` | radius 12px -> pill; gains shadow-sm, active opacity 0.9, 150 ms transition; stays 44px tall, 16px side padding | Yes | Standalone page action -> pill. md + `min-h-11` keeps today's size. |
| 3. "Browse the Collection" (`StudioShowcase.tsx:153`) | primary / lg / pill | `group` | 56 -> 48px tall; side padding 32 -> 24px; hover scale 1.05 and press scale 0.98 removed; 200 -> 150 ms; gains shadow-sm | Yes, better | Matches Hero CTA (`HeroSection.tsx:184`, lg pill `group`). Removing scale serves DPG-INTERACTION-FIX. |

Notes:
- (a) All three migrate. Keep the framer-motion wrapper on site 3; only the inner Link changes.
- Site 3 arrow (optional): `transition-transform group-hover:translate-x-1 motion-reduce:transition-none` to match Hero.
- (b) Touch >= 44px at 375: site 1 needs `min-h-11` (sm = 32px), site 2 needs it (md = 40px), site 3 is 48px from lg. Cart notice row ~8px taller.
- Focus: builder has no focus ring; global `:focus-visible` must paint on Tab (C row).
- Labels, icons, targets and tab order unchanged.
- (c) Question for Saba: Upgrade inside an accent-tinted notice stays brass primary (recommended default) or becomes `accent`? Asked only because of adjacency.

B rulings on the consult (D-29z1804):
- Adopted the three mappings as written.
- Site 3 arrow nudge: NOT adopted this round. It adds a new hover motion that is not a 2b-3 migration need; the Hero arrow lacks motion-reduce, so copying it would need a second fix. Recorded as PD-R502-SHOWCASE-ARROW-NUDGE (info, candidate for DPG-INTERACTION-FIX). `group` is therefore not added either (no group-hover consumer; a dead class).
- (c) goes to Saba as SABA-Q-502-UPGRADE-VARIANT, default "stay brass primary", awaiting_user, non-blocking.
