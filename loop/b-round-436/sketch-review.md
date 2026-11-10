Reviewed sha256: 88259112492496c19b2cfe59cd4c17627ba93dbf034a905b71956b913a41dde9

# Sketch review: round 437 (COPY-PD-VIS stage 2: STUDIO-VIS-7, STUDIO-VIS-10, SABA-LANE-RESIZE-HANDLE)

- **Reviewer:** `tech-lead` (read-only subagent, 2026-11-10, B round 436 → 437 planning). It reviewed the frozen `sketch-437.patch.txt` (12 `diff --git` headers) against store HEAD `69de9bd`.
- **Verdict: approve-with-lows.** Nothing at Medium or above.
- **Dispatched sketch = reviewed sketch:** the sha256 above equals `sketch-437.sha256`. There was no edit after the review.
- **Inputs the reviewer read:** `probe/summary.txt`, `probe/rows-decoded.txt`, `mutants/summary.txt` (12/12 red, sketch green).

## Findings and B rulings
| id | Sev | Finding (short) | B ruling |
|---|---|---|---|
| TL-R437-01 | Low | The Clip-details hairline sits under the panel's `border-t` (`overflow-hidden` clips `after:-top-px`), so on hover it reads as 2 rows: border 36,33,30 + hairline 75,73,68 | **Accepted, measured.** Element ruling: *Detail separator hairline: "box and overflow unchanged" wins over "line overlays the border"*. Recolouring `border-t` through a `has-[]` variant on the panel root would touch the panel's own classes, and DXM/PNR tests pin them; that is not worth it for a Low. Doc 284 records it. C row C7 asserts the measured rows |
| TL-R437-02 | Low | The lane hover hairline is ~2.1:1 against the border pixel, below doc 144's 3:1 hover rule; the override is not recorded | **Fixed in the task:** doc 284 must name the override (Saba 2026-11-10 request; WCAG 1.4.11 does not cover hover-only paint; the keyboard ring is unchanged), and DXA5/DXM5 lock the new tokens. Doc 144 is history and is not edited |
| TL-R437-03 | Low | `!folded &&` drops the drag paint if a lane folds mid-drag | **Accepted.** A folded handle is `pointer-events-none`, so this is barely reachable with one pointer. No row |
| TL-R437-04 | Low | Process: sketch-green covered only the 8 covering files | **Already done:** B ran the full suite on the final sketch: 272 files, 4019 tests, rc 0 (`precheck-full.log`). The gate runs `npm run verify` |

**Architecture note:** there are now two separator hairline recipes. When a third separator adopts the style, a shared constant goes in `studio-focus.ts`, with the edge as its parameter. This is recorded as an `architecture_signals` entry. It is not scheduled.

## Product-designer rulings (consult before the sketch)
B applied these from `product-designer`:
- **Export:** filled brass; `border-transparent`; hover `bg-brand-hover`; active `bg-brand`; disabled stays at 40 %; busy gets `aria-busy` and 70 %; the shared ring keeps its 2 px offset.
- **Exit link:** `group text-foreground`, with the arrow `text-muted group-hover:text-foreground`; the narrow screen gets the same.
- **Lane:** a 1 px `::after` on the border, /25 on hover, /40 while dragging.
- **Detail separator:** follows for consistency.
- **Library edge, trim and loop-brace edges:** out of scope.

B deviated in two places, from browser measurement:
1. **`cursor-progress` was dropped.** The unlayered `button { cursor:pointer }` (`app/styles/app.css` l.482) overrides every cursor utility on buttons, so the computed cursor stays `pointer` on HEAD and on the sketch. Recorded as B-R437-BUTTON-CURSOR-UNLAYERED (Low, pre-existing).
2. **The drag hairline swaps out the hover class.** Pointer capture keeps `:hover` during a drag, so `hover:after:bg-foreground/25` beat `after:bg-foreground/40`: the first probe read /25 while dragging. The class is now chosen by `isHeightDragging`. Mutant M10 locks this.
