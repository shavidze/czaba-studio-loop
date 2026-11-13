# Sketch review — round 489 (SABA-B-17)

**Dispatched sketch:** `sketch-489.patch.txt` sha256 `4a15bff396cb6fb0ed42146cc6c7e5eb4ed4b55ae33a5b104a577c2b10df956c` (v3). Verdict on v3: **APPROVE** (tech-lead delta review of the doc-only change; v2 `dd413c11…` APPROVE).

## v1 — sha256 `fe221c54e2dea3550145438934a9d31f85371171ab81f6cebf6c85fa962225f7` (kept as `sketch-489-v1.patch.txt`, files in `sketch-489-v1/`)
Reviewer: `tech-lead` (read-only). Verdict: **APPROVE WITH CHANGES**. B's ruling per finding:
| Id | Severity | Finding | Ruling |
|---|---|---|---|
| TL-R489-M1 | Medium | ctrl+wheel (browser zoom) and pinch blocked by the scroll-skip listeners | fixed in v2: zoom gestures skip without preventDefault/stopPropagation (`isZoomGesture`; boot `!e.ctrlKey&&!(e.touches&&e.touches.length>1)`); rows S3, E8e; mutants M18–M20 |
| TL-R489-M2 | Medium | doc 316 claimed C results; "page stays at top" over-claims one synthetic event; mermaid no-JS branch wrong | fixed in v2 (B probe numbers, "first gesture event", touch jsdom-only, split mermaid branches). l.4 keeps `Completed (C round 489 PASS)` per lessons L28 (accepted by the reviewer in the delta review) |
| TL-R489-L3 | Low | listener tracker ignores the capture flag | fixed: tracker keys `(type, capture)` per listener; E8d also dispatches after the failsafe; mutant M21 |
| TL-R489-L4 | Low | `EXIT_AFTER_TAKEOVER_MIN_MS` exported from the component without the `ENTRANCE_` prefix; boot event list hardcoded | fixed: `ENTRANCE_EXIT_AFTER_TAKEOVER_MIN_MS` in `EntranceCover.tsx`; boot listeners built from `ENTRANCE_SCROLL_SKIP_EVENTS` |
| TL-R489-L5 | Low | constant-only pins (`toBe(500)`, literal 1400) | fixed: dropped (E6 literal `holdInMs` values still pin the hold) |
| TL-R489-L6 | Low | wheel still swallowed during the 500 ms exit fade | accepted (task ruling line; doc TODO) |
| TL-R489-I7 | Info | remFc reads below 3500 because the first covered sample trails `data-start` | written into task §3 "Measurement base" |

## v2 — sha256 `dd413c11c0a7d31af88be248773174d09cf15b1b300e7fbb03e2c2b9c695825b` (delta `sketch-489-v1-to-v2.diff.txt`)
Reviewer: `tech-lead`, delta re-review. Verdict: **APPROVE**. No new Medium+.
- Info TL-R489-V2-I1: a one-finger touchmove with ctrl held passes the boot script but is blocked by React — practically unreachable; no change.
- Info TL-R489-V2-I2: an iOS pinch whose fingers land one after the other may start with `touches.length === 1`; its first touchmove is blocked, then the listeners are gone. Belongs to TLM-R489-TOUCH-SWIPE (real phone).

## v3 — sha256 `4a15bff396cb6fb0ed42146cc6c7e5eb4ed4b55ae33a5b104a577c2b10df956c` (delta `sketch-489-v2-to-v3.diff.txt`; v2 kept as `sketch-489-v2.patch.txt`)
Doc 316 line 65 only: the browser numbers now come from the v2 sketch matrix (`probe/sketch/table.txt`) and the HEAD matrix (`probe/head-matrix/table.txt`). Reviewer: `tech-lead`, delta review. Verdict: **APPROVE**; every number was checked against both tables, and nothing else changed.

## Mutants (run on v3, `mutants/mutants-summary.txt`)
22 mutants (M0 = HEAD source files with the new tests; M1–M21); each must be red on the rows listed in the summary. Project-rule check on touched lines (L10): no new inline styles, no `any`, no type assertions (`Object.defineProperty` in the test, `instanceof` narrowing in source), semicolons, Tailwind classes unchanged.
