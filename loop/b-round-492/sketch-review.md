# Sketch review, round 493 (re-dispatch of B-R488-PASSWORD-MODAL-DIALOG, docs-only)

**Dispatched full sketch (v5):** `b-round-492/sketch-493.patch.txt`, sha256 `ea441270f326dfabb9e2f3f5cf4cb91195aa44053c68a6a14c61f3bf3ed10b36`.
**Dispatched delta (v3 → v5, docs only):** `b-round-492/sketch-493-delta-v3-to-v4.patch.txt`, sha256 `c70366dbf866b3b00efb2aa2a740f9e17992c71cc8a4d37d44fb78f01d3acd43`. The file name keeps "v4" for continuity; its content is v3 → v5.

**History:**
- v3 `f530e0f3f9661e5dcc3b209125da9e637b3a8eb64dc3bae2e3bf4c7d7f0bc5c8` is the round-492 dispatch. Code reviews (v1–v3) and the ordering matrix are in `b-round-491/sketch-review.md`. They still rule every code finding, because code and tests are byte-equal to v3.
- v4 `7eab067c359caf5f123583b4edb3f22f3fc6815ba191f9db246718d609172a28` was saved as `v4-sketch-493.patch.txt`. The v4 delta was `59d3c1d1818121131d0f663d4636f6c52167be6244383f2557730d9c60b90101` (`v4-sketch-493-delta-v3-to-v4.patch.txt`). Review: CHANGES REQUIRED.
- v5 = v4 plus three sentence fixes in doc 318. The v4 → v5 diff of the full patches is in `sketch-493-v4-to-v5.diff.txt`. Review: APPROVE.

Reviewer: `tech-lead` (read-only; on B's consult list). Scope: a sentence-by-sentence truth check of doc 318 and the changed lines of docs 315 and 317, against the code, the tests, `c-round-492/pw-check.txt` and `b-round-491/probe/`. B's brief to the v4 reviewer had the two v4 sha values swapped. The reviewer noticed this: each file matches its own `.sha256`, so the error was in the brief only.

## v4 review: CHANGES REQUIRED
| # | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R493-D1 | Low (STOP class: false doc line) | l.22 "pixel-identical, 0 px". `open-pxdiff.mjs` counts only pixels whose channel difference is above 16/255. Unthresholded, 823–1158 px differ by at most 8/255 | **Fixed in v5:** "matches HEAD visually (threshold 16/255: 0 px; without a threshold 823–1158 px differ by at most 8/255)". Pin: K10 `d318-px-threshold`, `open-pxdiff-threshold` |
| TL-R493-D2 | Low (STOP class) | l.93 "one Esc closes both (HEAD too)". At HEAD Esc did not close the modal (P6 RED at HEAD). Only the Ctrl+K stacking holds at HEAD | **Fixed in v5:** "opens over the dialog (also at HEAD); now one Esc closes both — separate Low". Pin: K10 `d318-ctrlk`, `d318-ctrlk-old=0`, `cp-esc-listener` |
| TL-R493-D3 | Low (STOP class) | l.25 and l.94 "the same instance keeps values (HEAD too)". No test or browser row checks it | **Fixed in v5:** worded as an inference ("probably"; framer-motion behaviour; not checked by a test or the browser). Pin: K10 `d318-inference` |
| TL-R493-C1 | Conditional | l.4 `Completed (C round 493 PASS)` is a claim pending C | Ruled by L28 (the post-PASS form). Same as v3 |

**Verified true by the reviewer (v4):**
- l.9: the HEAD defects, against `pw-check-head.txt`.
- l.24–30 and l.34, against the code. The Esc guard matches `LeadMagnetPopup.tsx` l.77.
- l.63 "browser P11, P12".
- l.85: 20 mutants.
- l.86, against P1–P18.
- l.90 and l.95.
- l.55 and l.84.
- Docs 315 and 317: the changed lines.
- PD1–PD15 all exist in the test file.
- The 7 TEMPLATE headings, in order.

## v5 delta re-review: APPROVE
- All three fixes are true and complete. The l.93 Esc claim rests on a code read: both document listeners, and no `stopPropagation`. The sentence does not claim a browser run.
- l.20–30 and l.88–95 have nothing false, checked against `pw-check.txt`: P2/P8/P9 `none 0px`, P6/P7 `solid 1px`, P18, and P5 with 8 Tabs.
- Both sha256 values match. The scratch doc is byte-equal to the sketch copy.

**Verdict: APPROVE** (v5, sha256 `ea441270f326dfabb9e2f3f5cf4cb91195aa44053c68a6a14c61f3bf3ed10b36`; delta `c70366dbf866b3b00efb2aa2a740f9e17992c71cc8a4d37d44fb78f01d3acd43`).

## Pre-checks on v5 (B, `/tmp/b493-scratch`)
- **Covering:** 6 files / 97 passed on v5 (`sketch-493-covering.log`, re-run on v5 after the v4 run).
- **B re-ran the reviewer's numbers and code-read claims** (`probe/`):
  - The zero-threshold pixel diff gives 823 / 823 / 1158 px, max 8/255 (`open-pxdiff-zero.txt`), which matches TL-R493-D1.
  - Ctrl+K then Esc (`ctrlk-esc-probe.json`): at HEAD the palette closes and the dialog stays; on v5 both close. This matches TL-R493-D2 and the v5 l.93 wording.
- **Production build:** v5 vs v3 is byte-identical. `build-diff.txt` is empty and the CSS sha256 values are equal (`css-compare.txt`, `build-v5.log`, `build-v3.log`).
- **Apply:** the full patch applies on a clean `e4e1d1c`; the delta applies on v3 and on the store tree (`--check`). Both results are byte-equal to the scratch (6 files).
- **Mutants:** unchanged from v3, because code and tests are equal: `b-round-491/mutants/mutants-summary.txt` (20 RED) and `b-round-491/probe/pw-check-mutO.txt`.
