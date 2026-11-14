# Doc 324 ledger (L26, RETRO 495): every declarative sentence → its source

Doc: `docs/implementation/2026/quarter-IV/324-dpg-button-cleanup-stage-2b-3.md` as written by the dispatched sketch (`sketch-503.patch.txt`; sha in `sketch-sha.txt`).
Kinds: **T** = test row in `store-button-cleanup-2b3.test.tsx`; **B** = browser probe file (`probe/…`, HEAD and sketch on the same code, mouse and keyboard where stated); **K** = claim in `claims-503.sh`; **R** = loop record or consult (inference/decision wording, not a code fact).

| # | Doc sentence (short) | Kind | Source |
|---|---|---|---|
| 1 | l.4 status `In Progress (stage 2b-3 of DPG-BUTTON-CLEANUP-2; C round 503 PASS)` | K | L28 form for a stage of a longer feature; K15 |
| 2 | Saba DPG P1 item 7 "Use Button.tsx component only" | R | agent-workflow.md DPG-FIX P1 item 7 |
| 3 | stages 2a, 2b-1, 2b-2 moved Store brass CTAs (docs 320, 321, 322) | K | K17 (docs exist) |
| 4 | 2b-3 closes the last three hand-rolled brass `<Link>` of inventory row A2 | R + B | `b-round-497/stage2-inventory.md` l.15; scanner `scan-head.json` → `scan-sketch.json` (104/41 → 100/38), K11 |
| 5 | Upgrade shows when the buyer already owns the same version | K | K6 (`owns_same` branch, `getItemOwnershipStatus`); T B2B3-1/B2B3-2 |
| 6 | Create a scene shows for a Universal collection with at least one recording | K + T | K7 (condition line); T B2B3-3, B2B3-4; mutant M9 |
| 7 | all three are navigation, `<Link>` stays, class via `buildButtonClassName` | T | B2B3-1, B2B3-3, B2B3-5 (`href`, class); B2B3-6 |
| 8 | mapping from product-designer | R | `b-round-501/consult-product-designer.md` |
| 9 | Upgrade: primary sm default, `min-h-11 shrink-0`; not a pill (inside the notice) | T + R | B2B3-0/B2B3-1; consult rationale |
| 10 | `min-h-11` raises the target to 44 px; `shrink-0` | B | `probe/sketch/sketch.json` CART-UPGRADE `rest.h` 44 (HEAD 32), `rest.flexShrink` 0 (HEAD 1) |
| 11 | Create a scene: primary md pill, `mb-6 min-h-11`; size 44 px, 16 px side padding unchanged | T + B | B2B3-3; `rest.h` 44 both, `rest.padding` `0px 16px` → `10px 16px` |
| 12 | Browse the Collection: primary lg pill like Hero; motion wrapper unchanged | T + K | B2B3-5; K8 (HeroSection builder call); patch touches only the `<Link>` line and import |
| 13 | optional arrow nudge not added (PD-R502-SHOWCASE-ARROW-NUDGE) | R | D-29z1804 |
| 14 | D1 numbers: 32→44, black→`rgb(14, 13, 12)`, 500→600, 4→8 px, hover `bg-brand/90`→`bg-brand-hover`, shadow-sm, press opacity 0.9 | B | `probe/head/head.json`, `probe/sketch/sketch.json` CART-UPGRADE `rest.h/color/font/radius/shadow`, `hover.bg`, `press.opacity` (mouse) |
| 15 | notice 64→70 px and item card 219→225 px at 1440/1280; at 375 notice 168 and card 323 unchanged | B | same files, `context.notice.h`, `context.card.h` |
| 16 | contrast 9 → 8.32 (hover 10.28) | B | `restContrast` 9 (HEAD), 8.32 / `hoverContrast` 10.28 (sketch) |
| 17 | D2: radius 12 → pill, padding `0 16px` → `10px 16px`, 131×44 unchanged, shadow, press 0.9 | B | REC-SCENE `rest.radius/padding/w/h/shadow`, `press.opacity` |
| 18 | D3: 257×58 → 241×48, padding `16px 32px` → `12px 24px`, scale 1.05/0.98 gone | B | SHOWCASE-BROWSE `rest.w/h/padding`, `hover.transform`, `press.transform` (HEAD `matrix(1.05…)`/`matrix(0.98…)`, sketch `none`) |
| 19 | Link has no `<button>` `:active` scale (SIG-R496-LINK-NO-PRESS-SCALE) | K | K9 (app.css rule targets `button` and `[role="button"]` only; DESIGN_SYSTEM sentence) |
| 20 | serves DPG-INTERACTION-FIX | R | agent-workflow.md DPG P2 item 14 (reduce scale) |
| 21 | section 1454 → 1445 at 1440, 1713 → 1703 at 375 | B | SHOWCASE-BROWSE `context.section.h` |
| 22 | unchanged: text, icons, `href`, tab order, focus ring (`:focus-visible`, solid, offset 2 px) | B + T + K | tab order: `sketch-503.patch.txt` changes no element order and adds no `tabindex` (only three `className` values and three import lines in code);  `focus.focusVisible` true, `outline` `solid 1px …/0.8`, `offset` 2px on HEAD and sketch (keyboard: Escape then focus); `href` in T rows and journey `arrived` |
| 23 | Saba question SABA-Q-502-UPGRADE-VARIANT, default brass | R | `user-review/questions-round-502.md` Q1 |
| 24 | Architecture diagram: three builder calls; Browse → `_index.tsx` | K | K10 (`_index.tsx` renders `StudioShowcase`) |
| 25 | Changed files list (7 entries incl. doc 323 status line) | K | `sketch-503.patch.txt` file list; K16 (doc 323 l.4) |
| 26 | Problem: builder does not merge classes → className adds only what builder does not set | T | B2B3-0 oracles end with the `className` extras; no radius/padding override |
| 27 | Problem: "Browse the Collection" appears twice on home (ProductSection view-all) | K | K12 (`_index.tsx` `viewAllText="Browse the Collection"`) |
| 28 | Problem: cart/recordings need a signed-in user + backend → jsdom mocks, browser `page.route` | T + B | test mocks; `probe/measure-503.mjs` stubs |
| 29 | Problem: vacuous class tests → B2B3-0..7 roles; mutants in `mutants-503.txt` | T | `mutants-503.txt` M1–M16 OK |
| 30 | Testing: A logs, B pre-check files, probes, journeys, cart neighbours equal | K | K32 (files exist); K30 (journeys equal); K31 (`probe/nb-head` vs `probe/nb-sketch` actions and c7 JSON equal) |
| 31 | TODO list (2c, 2d, 2e, NONBRAND, ButtonLink/scanner signals, Saba answer, DP gate) | R | backlog DPG-BUTTON-CLEANUP-2 status, SIG-R498-BUTTONLINK-WRAPPER, SIG-R501-SHARED-BUTTON-SCANNER |

Contradiction grep (open/deferred findings on touched files): `cart.tsx` → B-R502-CART-SUMMARY-SCROLLBAR-GUTTER, A-R502-CR-1..5, C-R502-SUMMARY-CARD-WIDTH-375 (none contradicts doc 324; doc 324 says nothing about scroll or widths); `StudioShowcase.tsx` → PD-R502-SHOWCASE-ARROW-NUDGE (cited, consistent), B-R496-HOME-NESTED-BUTTONS-IN-LINKS (not this link); `recordings.$productId.tsx` → none.
