# product-designer consult — SABA-B-17 (round 489 planning, 2026-11-13)

Two read-only consults (B's prompts quoted the HEAD measurements in `b-round-488/probe/head/`).

## Consult 1 (pacing)
- Floor/cap: **3500 ms floor** ("at least" 3–4 s; 3000 would sit at the edge of Saba's lower number). Skipping stays possible at any time.
- Pacing order is right (light → name → what we do → hold). Cone-only beat ≈ 0.7–0.9 s is fine, not longer.
- **Overlay exit 500 ms, separate from the no-JS failsafe fade (250 ms)**; `entranceTimeline` must use the new constant in its min/max math.
- C rows: Esc/Tab/click in each phase; click on the black cover before takeover; reduced motion; same-tab reload; client nav back to `/`; 4× CPU floor and logo ≥ 1.2 s; 1280×720 not clipped.
- Saba questions: wheel/touch skip (default yes); background tab (already asked as SABA-Q-ENTRANCE-BACKGROUND-TAB, default unchanged).

## Consult 2 (slow first visit, after B's network-throttled HEAD probes)
- **Takeover window 2000 ms** (recommended over 1000). Fast 3G (~2260 ms) still misses it; "don't stretch the window further" with a React-only logo.
- Its preferred fix for the slow user — a CSS-only logo on the boot cover — is a change of look: that is **SABA-Q-ENTRANCE-WORDMARK** (default "no", asked 2026-11-12). B re-asks it with the new evidence; not built this round.
- **5000 ms cap accepted** (only when hydration is slow).
- Wheel/touch skip: product-designer would ask Saba first (default yes) but says the **unseen scroll must be fixed now**: the gesture that skips must not scroll the page; the page is at the top when the cover lifts.
- Rows: reduced motion; returning visit; skip on the black cover before takeover; tab hidden mid-entrance; back navigation; focus after exit; overlay hidden from screen readers; page at top after any skip.

## B's ruling (product-designer states the choice; B does not average)
| Point | Chosen | Rejected | Why |
|---|---|---|---|
| Floor / cap | 3500 / 5000 ms from the first cover frame | 3000 / 4000 | Saba: "at least 3–4 s"; cap = 2000 + 2500 + 500 so a late takeover is never clipped |
| Takeover window | 2000 ms | 1000 (HEAD), > 2000 | slow first visits (4G + 4× CPU, JS +1.5 s) now play; longer black waits need Saba (SABA-Q-ENTRANCE-SLOW-WAIT) |
| Exit | overlay 500 ms; CSS failsafe 250 ms unchanged | one shared 500 ms | failsafe is the no-JS path; changing it is not needed |
| Wheel / touchmove | skip + swallow (preventDefault, stopPropagation, capture on `window`) before and after hydration | leave as is; block scroll without skipping | blind scroll is a defect the longer floor amplifies (B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER); skip-on-scroll is the default of SABA-Q-ENTRANCE-SCROLL-SKIP, reversible |
| Scroll keys (ArrowDown, PageDown, Space) | unchanged (HEAD test "other keys do not skip" kept) | add as skip | out of scope; recorded Low B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER for Saba's answer |
| CSS logo on cover | not built | build now | look change → Saba (SABA-Q-ENTRANCE-WORDMARK) |
