# Sketch review — round 432 (SABA-B-12 stage 2b)

Dispatched sketch: `b-round-431/sketch-432.patch.txt`, sha256 `55d39d7577826fc98f192eaa8d53e3d4b3096ced454a2fdedf116075922c82af` (4 `diff --git` headers; base `1197dcb`; scratch `/tmp/b432`, commits "sketch" + "sketch v2 (TL-R432-02, -05)").

## product-designer (consult, 2026-11-10)
Keep native `<progress>` + shared `STUDIO_PROGRESS_CLASS`. Track `outline-hover`, fill `foreground` (neutral; DXL7c's role), rounded, h-2 box. Indeterminate = option (b): dimmed `foreground/30` full track + `motion-safe:indeterminate:animate-pulse`; static dimmed under reduced motion. Rejected: `div role=progressbar` (rebuilds free semantics, breaks pins, second pattern); (a) empty track (reads as 0 % or stalled; load can last 120 s); (c) sliding segment (new `@keyframes`, Tailwind-first, too much motion for < 2 s). Cancelled/error/done: bar unmounts (unchanged). Forced colours: `appearance-auto`.

## tech-lead (sketch v1 review): approve-with-lows, no Medium+
| id | sev | item | B action |
|---|---|---|---|
| TL-R432-01 | info | v4 variants compile as intended (`&:indeterminate { &::-webkit-progress-bar }`; `@media (prefers-reduced-motion: no-preference) { &:indeterminate }`) — compiled with the repo's Tailwind 4.1.18 | none |
| TL-R432-02 | low | Firefox indeterminate `::-moz-progress-bar` may fill full width solid | **applied**: `indeterminate:[&::-moz-progress-bar]:bg-foreground/30` + PG1 + mutant MU-PG-MOZ-IND |
| TL-R432-03 | low | `border-0` duplicates preflight; `overflow-hidden` harmless | kept (overflow clips the Firefox fill to the rounded ends) |
| TL-R432-04 | info | no global `progress` rule in app.css | none |
| TL-R432-05 | low | PG2 regex could mis-capture a `<progress>…</progress>` pair | **applied**: PG2 counts openings, self-closing tags and closing tags; mutant MU-PG-CLOSING-PAIR |
| TL-R432-06 | low | `SfxSceneExport.tsx` `<progress>` outside the scan | already recorded: SABA-B-12-RECORDINGS-NUMBER → STORE-REDESIGN acceptance (TL-R430-10); doc 280 lists it |
| TL-R432-07 | low | forced colours with author backgrounds unproven | measured: Chromium emulated forced colours draws an all-white bar at HEAD and on the sketch, both states (`probe/forced-determinate.txt`, forced indeterminate in `progress-probe.json`); record row for C; real Windows High Contrast → TLM-SABA-B-12-FIREFOX-SAFARI scope_r432 |
| TL-R432-08 | nit | DXL8 `'h-2 w-full accent-foreground', 0` implied by `'accent-foreground', 0` | kept (names the retired literal) |

The v2 changes are token/test-only; B re-ran every pre-check on v2 (see b-round-431.md §3).
