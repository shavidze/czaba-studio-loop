# C round 447: STORE-2b-2a teal sweep. Verdict: PASS

Real Chromium (Playwright) at 1440x900, 1280x720 and 375x812. Tree on :5173, HEAD control `5df7717` on :5178 (own cacheDir), mock API on :5199. `browserVerified` is true. Scripts, JSON and shots are in `c-round-447/`.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS. 7 granted source files + the test + doc 292 only; K18 = 0 | `claims-after.txt` |
| C2 claims | PASS. Only K3 (44 to 23), K4 (granted files 0), K9 (3 to 1), K10 (1 to 0), K13, K14 differ; K11 = 1 | `claims-after.txt` |
| C3 teal scan 1440 | PASS. `/` HEAD 34 (rerun alone; B's count), tree 18, all on `hero-title-glow`/`text-glow`/`light-flicker-effect` (2b-3's CSS), 0 on svg/path. `/store`, product, `/checkout/success` 0. `/gift-cards` HEAD 1 to tree 0. 375 scan is record-only and was not run | `teal-tree-1440.json`, `teal-head-1440-r2.json` |
| C4 hover | PASS at 1440 and 1280. Card: 0 radial-gradient descendants (HEAD 2), `scale` 1.02, no teal shadow. Both offers and Newsletter: no teal shadow (HEAD true). Newsletter bg rgb(217,184,127). Gift amount: no teal shadow (HEAD true) | `states-tree.json`, `states-head.json`, `rows-tree.json` |
| C5 loader | PASS at all 3. Wordmark colour and fill rgb(236,230,218), `background-image` none, `filter` none, 0 teal elements (HEAD gradient, drop-shadow, 3 teal). Sweep line brass oklab(0.739 0.018 0.085 / 0.5), width 48.5 px at 450 ms | `rows-tree.json` |
| C6 reduced motion | PASS as parity. The loader is not shown under reduce on tree or HEAD (same behaviour) | `rows2-*.json` |
| C7 showcase | PASS. Tree strokes are foreground, brass, text-dim, 0 teal, no svg filter (HEAD teal, yellow, drop-shadow, 8 hits). Export Mix is `text-brand` on `bg-brand/15`; A's pixel contrast 5.82:1 not re-measured by me (the colours match) | `shots/*-showcase-*.png` |
| C8 checkout | PASS at 3 viewports. Tree has 1 `div.absolute.inset-0.rounded-full`, shadow none; HEAD has 2, one with a teal ring | `states-*.json` |
| C9 full-page | PASS. Pixel diff vs HEAD: `/store` and the product page 0 px; home 375 0 px; home 1440 7 px and 1280 75 px, in the hero band, not a mapped hit (O3) | `pdiff.json` |
| C10 keep-list | PASS. Full-scroll `innerText` and all hrefs are byte-identical to HEAD at 3 viewports (Gift Cards, Complete Collection, Subscribe, Limited present) | `rows2-*.json` |
| C11 LCP/CLS | PASS. Tree LCP 0.26 to 1.9 s (one cold outlier each at 1440 and 375), CLS at most 0.0198. HEAD has the same CLS range (store 1440 HEAD 0.0197) | `rows2-*.json` |
| C12 covering | PASS. 8 files, 126 tests green (incl. teal-sweep, 4) | run in store |
| C13 mutants | PASS. Re-run on a scratch clone at 5df7717 + a.diff: M1 TS1+TS3, M2 TS1, M3 TS2, M4 TS3, M5 TS4 red; base green. Equal to A's results. I confirmed base green, not each post-revert state | this run |
| C14 Studio | PASS. `/studio-lab` at 1440 and 1280: add a clip, Play advances the clock to 1.47 s, Stop halts and the clock holds. Anonymous `/studio/middle-east`: blank page on tree and HEAD (backend unavailable, so the "Sign in required" text is BLOCKED), 0 `audio[src]`, 0 media requests | `studio-tree.json`, `shots/studio-*.png` |
| C15 docs | PASS. l.4 exact, 7 headings in order, M1-M5 and TS1-TS4 named, 0 `pending` | doc 292 |

Gate rows (full vitest, typecheck, build, verify) are not claimed.

## Findings
No bugs. Observations O1-O6 are in `c-round-447.json` (sweep-line contrast 1.59:1 is decorative; the S button is still yellow, outside this round; the small hero pixel diff is unattributed).

## For B
- A-R447-REVIEW-L1..L4 (exact-count pinning, inline `boxShadow` coverage, `perf/` scan, solo/active waveform equality) are Lows for the polish pass.
- Sweep-line contrast and the S/M button colours belong to the next STORE or visual stage.
- Two HEAD teal scans run at once under-count (O6). Run them one at a time.
