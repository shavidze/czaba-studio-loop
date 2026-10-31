# C round 296 — STUDIO-LINK-a verification

**Verdict: PASS**, with one row failing on its number (B-SCREEN-BUDGET, Low C-R296-01, a B spec arithmetic error) and one new Low (C-R296-02). `browserVerified` and `realVerified` are true. Every browser row ran in Playwright Chromium against `http://127.0.0.1:5173`. The HEAD comparison ran on a `git archive` scratch server on :5297 with its own Vite cacheDir, and product pages used the mock API on :5199. Both helper servers are stopped; :5173 still returns 200; the store tree still has the same 10 entries (C changed no source).

**Why PASS even though one row failed:** A applied B's sketch byte for byte (C reverse-applied `sketch-studio-link-a.diff`, dry-run rc 0), and §8 made any deviation a STOP. The growth is exactly the new `<p>` box and nothing else moves. The 2026-10-28 screen-budget rule counts only an *unjustified* increase as a bug, and B justified this line in §7. The miss is B's: it measured the 20 px link box, not the 25.6 px `<p>` line box. This matches the D-29z747 precedent (a B spec omission is not an A defect). B-SCREEN-BUDGET stays out of `passed`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS. Diff against `claims-296-after-sketch.txt` is only the added K1–K3 lines (K2 10, K3 rc 1) and K14 0→1. | `c-round-296/claims-after.txt` |
| SOURCE-SCOPE | PASS. 10 entries = §4. `sha256sum -c` fails on exactly the 7 modified paths. Protected files OK. | shell log in this report |
| TYPECHECK | PASS, rc 0. | `tsc.log` |
| UNIT | PASS. 9 files, 89 tests. LK1–LK7 present. Slowest: LK3 at 749 ms of 15 s. | `covering.log` |
| UNIT-MUTANTS | PASS. On C's own scratch: (a) LK5 red, (b) LK4 second/third red, (c) LK1 `__proto__`/`constructor`/`toString` red, (d) LK3 red. Restores were `cmp`-equal. | `mutant-{a..d}.log` |
| B-LINK | PASS at both viewports. One link with href `/studio-lab?preview=middle-east` and no target. Its colour `rgb(163,155,142)` equals "by CZABA". harbour-lights 0 and door-slams 0 (a real SFX page rendered). Button names and order are identical to HEAD. | `probe-a.json`, `probe-head.json` |
| B-LINK-KEYBOARD | PASS. Tab ×11 reaches the link; `:focus-visible`, 1 px solid brass at 0.8, offset 2 px. Enter opens the deep link, and the option is focused with its ring. | `shots/a-kb-*` |
| B-LANDING | PASS. After a mouse click: the option `demo-middle-east` has focus, `aria-selected=true`, `tabindex=0`, and sits inside the list box and the viewport. 0 `[data-clip-id]`. Status equals HEAD's plain load. | `shots/a-journey-2-*` |
| B-ADD-PLAY | PASS. Enter adds 1 clip on `music` with the status "…added to the Music track at 00:00.000." Ctrl+Z → 0, Ctrl+Shift+Z → 1. Space plays 00:00.000 → 00:01.471 in 1502 ms. An analyser tap on the destination reads RMS 0.017–0.100 while playing and 0 after stop. | `probe-a.json` journey |
| B-JOURNEY | PASS. Screenshots 1–6 per viewport. WAV: 29.19 MB, RIFF/data sizes consistent, 24-bit 2-ch 48 kHz, 101.352 s, RMS of the first 2 s 0.074, 0 non-finite samples. "← CZABA" has href `/` and leads to `/`. | `wav/journey-a-*.wav` |
| B-DEEP-NEGATIVE | PASS. With no parameter, harbour-lights, `__proto__` and empty: focus BODY, selected = default, status = plain, 0 errors. | `probe-a.json` neg |
| B-NARROW | PASS. 860×700 shows the narrow text, focus BODY, 0 errors. After widening, focus is on `arrangement-exit`, the same as HEAD. | `shots/*-narrow-*` |
| B-PAGE-ERRORS | PASS. 0 page errors and 0 console errors or warnings in every A row and every HEAD row. Warm-up loads are untimed and excluded (L38). | probe JSONs |
| B-SCREEN-BUDGET | **FAIL on the threshold.** The only new line is "Try it in the Studio". The `/studio-lab` whole-page text-line count equals HEAD (146/146 and 139/139; my timeline selector matched nothing, so the count covers the whole page). The sidebar grows **37.59 px**, more than the ≤ 32 px limit. | C-R296-01 |
| G296-AUTH | PASS. Fresh context: `/studio-lab` loads anonymously with the demo badge and `auth_user` null. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. The token endpoint returns 401 with no token. | `auth.json` |
| DOC-220 | PASS. Line 4 is exact, the 7 headings are in order, all 10 files are listed, and the cited ids exist. | grep |
| gate | Root's gate (full suite, build, verify, smoke). C did not run these. | — |

Extra checks:
- Bundle: on `/products/middle-east` the browser requested `studio-lab-links` once and no `studio-lab-demo` or arrangement module (`bundle.json`). `ProductSidebar.tsx` has no `studio-lab-demo` import.
- Cold direct load of `?preview=middle-east` at both viewports: the option is focused with its ring and there are 0 hydration warnings. This covers in the browser the path behind A's reviewer finding 1.

## Findings for B
- **C-R296-01 (Low, origin B).** The sidebar grows 37.59 px instead of ≤ 32 px. Cause: the `<p class="mt-3">` takes the base line-height (25.59 px) plus 12 px of margin. B's choices: `leading-5`/`leading-none` on the `<p>`, or accept 38 px as the budget.
- **C-R296-02 (Low, confirms A's reviewer finding 3).** After a mouse click, `data-focus-source=pointer` survives the client navigation. The option has focus, but `:focus-visible` is false and there is no outline. Middle East is also the default selection, so a mouse user sees the same screen as a plain `/studio-lab` load. The keyboard path and a cold load show the ring. Compare `shots/a-journey-2-landing-*` with `shots/a-kb-landing-*`.
- Passed through as still open (A's reviewer): the SSR→hydrate unit test is missing (Medium; the browser COLD row covers it meanwhile), the route prop wiring is mutation-vacuous (Medium, A's mutant (e); C did not re-run it), and LK7 `!isWide` and StrictMode (Low).

## Ableton conformity
Not applicable: this is a hand-off from the store to the Studio. Library selection and Enter-to-add are unchanged.

## Environment at close
Manifest check: all paths exist. Ports: :5199 (mock) 000, :5297 (HEAD scratch) 000, :5173 (store) 200. Store `git status --short`: 10 entries (A's 10; C changed no source).
