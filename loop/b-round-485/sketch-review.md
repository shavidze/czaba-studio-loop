# Sketch review — round 486 (B-R480-ORDER-CARD-KEYBOARD)

Dispatched sketch (v2): `b-round-485/sketch-486.patch.txt` sha256 `794821b0d13b4059015722410340247ebcd8c8b21fea51b3e960a991146df1c2`.
v1 (kept as `b-round-485/sketch-486-v1.patch.txt`) sha256 `ebcfe669df8dbcf2bec5ba9dbc15ec250a0b1c4102d11d09d55a47bd66a9b8f3`.
Reviewer: `tech-lead` (read-only), 2026-11-13. **v1 verdict: APPROVE**; **v2 delta re-review verdict: APPROVE** — no Critical, High or Medium in either.

Reviewer checked the sha, read the patch against HEAD 0341229, `app/styles/app.css` l.215-243 and `store-focus-ring.test.ts`; confirmed APG Accordion structure, `useId` SSR-safe, all button content phrasing (spans), `hidden` panel works (no display utility on it), functional state update, project rules on every touched line, each OC row has a red mutant and the HEAD file fails all four.

## Findings and B rulings
| # | Severity | Finding | B ruling |
|---|---|---|---|
| L1 | Low | `[--focus-offset:-2px]` is the first component use of the `--focus-offset` hook; nothing guards the escape hatch | Accepted for this round (the shared rule stays the only ring; only its offset moves inside an `overflow-hidden` card). Recorded as `deferred_low_polish` B-R486-FOCUS-OFFSET-GUARD (document the hook / allow-list in store-focus-ring) |
| L2 | Low | OC4 (jsdom) proves only "no remount"; `fireEvent.click` never moves focus | Accepted. OC4's title says what it pins (node identity + focus kept), M5 turns it red. Real keyboard focus is C's browser row OC-KEYS. Doc 314 must say so |
| L3 | Low | Test file in `app/lib/__tests__/` though it covers a route | Convention: `app/lib/__tests__/account-orders-empty-state.test.tsx` (round 481) is the precedent. Keep |
| a | Low (agreed) | global `button:active` scale(0.98) now applies while the header is mouse-pressed | Accepted; same as ProductAccordion; C row OC-PRESS records the computed transform |
| b | Low (agreed) | h3 accessible name now includes status/date/price/count | Accepted (APG: the heading holds the button); order number comes first |
| c | record (agreed) | held Enter toggles on each repeat, held Space once | Native button behaviour; record-only row OC-HELD |
| d | agreed | hidden panel content stays in DOM; find-in-page will not match collapsed items | Accepted; HEAD did not render them at all |
| e | Low | outline measures 1px (1.5px subpixel) | Same as HEAD shared rule (L15 engine rounding); not new |
| f | Low | up to 50 extra Tab stops | Inherent to the pattern |

Architecture note (signal only): extract a shared `Disclosure`/`AccordionItem` primitive if the pattern appears a third time (ProductAccordion + OrderCard today) -> `architecture_signals` SIG-R486-DISCLOSURE-PRIMITIVE.

## Mutants (`mutants/mutants-summary.txt`, run from `/tmp/b486-mut`, never from store/)
M0 HEAD file (OC1-4 red), M1 no aria-expanded, M2 no hidden, M3 wrong aria-controls, M4 constant panel id, M5 remount toggle, M6 no type, M7 no heading, M8 panel id inside button — all red on the expected rows.

## v2 delta re-review (tech-lead, sha 794821b0…)
Delta: the toggle className gains `select-text` and `active:transform-none!` (one line). Reason: B's browser probe (`probe/x-head.json`, `x-mutant-v1.json`, `x-mutant-select-only.json`, `x-sketch.json`) showed v1 blocked mouse selection of the order number and added the 0.98 press scale; v2 equals HEAD on press, drag and double-click, 0 px in 12 screenshot pairs (incl. 375×812).
**Verdict: APPROVE.** Reviewer confirmed the important suffix is needed (unlayered `button:active` beats layered utilities) and is an established project pattern (`motion-safe:transition-[...]!` in Studio files).
| # | Severity | Finding | B ruling |
|---|---|---|---|
| V2-L1 | Low | `select-text` on a clickable control is unusual | Accepted: it restores HEAD behaviour; a11y unchanged (OC-SELECT, OC-AX) |
| V2-L2 | Low | differs from ProductAccordion (keeps the press scale) | Accepted as a listed deviation in the task; a shared rule belongs to a design-system round (SIG-R486-DISCLOSURE-PRIMITIVE) |
Ruling (a) of v1 (accept the press scale) is superseded by v2: the scale is suppressed.
Mutants re-run on v2: 9/9 red on the same rows; full suite 292/4263 rc 0; covering 5/68; tsc rc 0.
