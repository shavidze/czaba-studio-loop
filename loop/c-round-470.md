# C round 470: SABA-B-15 stage 2b (glow shape s6)

**Verdict: PASS** (browser-verified; all rows C1–C13 have a result; `gate` row not claimed).
Builds: HEAD 9ba13ac :3471, S0 (round-469 tree) :3474, TREE :3472, mutant (TREE + lenis-off) :3475; extra diagnostic `noglow` :3476. Probes ran one at a time (L38). No replacement attempts used. Evidence: `c-round-470/data/*`, `shots/look/*`, `progress.json`.

| # | Row | Result | Evidence |
|---|---|---|---|
| C1 | HEAD control p95 | PASS: `/` p95 33.3–33.4 in 6/6 passes (≥2/3 per viewport). Old field movingOver33 median: 1440 = 5, 1280 = 4 (recorded) | data/c1-1.log |
| C2 | TREE frozen | PASS: `/` p95 16.7–16.8 in 18/18 passes (≤17), movingOver33 median 0, moving 168–193, finalY 2400. `/free-downloads` p95 ≤16.8, over33 0, finalY 575/755. See caveat F1 | data/c2-p*.log, c2-tree-p*.json |
| C3 | TREE full-page | PASS: `/` over33 median 0 (max 2), finalY 4121 = maxScroll, moving 274–279, p95 16.7–16.8 (record). `/gift-cards` median 0, finalY 2581/2761 | data/c3-p*.log |
| C4 | Lenis-off mutant | PASS: moving 20 (<100) in 6/6 | data/c4.log |
| C5 | Computed | PASS: TREE glowCount 2 / 1, filter `none`, `radial-gradient` bg, willChange `auto`; HEAD `blur(120px)`/`blur(100px)`/`blur(120px)` | data/look.json |
| C6a | Mean | PASS: ratioToHead 1.21 / 0.94 (1440), 1.18 / 0.94 (1280) | data/look-profile.txt |
| C6b | Bright patches | PASS: tree ratios 0.78–1.08 (all ≥0.7, ≤1.3). Mutant S0 product 0.43–0.63 (<0.7) | data/patch-summary.json |
| C6c | Patch delta | PASS: tree max 0.54–0.78 (≤1.5). S0 2.64–2.77 (>1.5) | same |
| C6d | Lean | PASS: product (ratio outside 0.9–1.1) +16/−7 and +15/−8, mixed; studio ratio in band | same |
| C7 | Shape/edges | PASS: edgeJump tree PS 0/1, SS 1.67/0 vs HEAD PS 1/0.33, SS 1/0 (≤HEAD+1). No ring/banding/seam at 100%. Accent patch (0.8,0.2) 0.79×/0.78× (record). product-designer review: no visible defect; 3 Low notes (below) | shots/look |
| C8 | Overflow | PASS: scrollWidth==clientWidth at 1440/1280/375; scrollHeight equal HEAD vs TREE (4841/4841/5683) | data/overflow.json |
| C9 | Unit+mutant | PASS: 3 passed at tree; HEAD ProductSection → SP1,SP2 red; HEAD StudioShowcase → SP1,SP2 red | data/c9-* |
| C10 | Source scope | PASS: 4 status paths; hunks only l.38–39 and l.75; `+` lines equal sketch byte for byte; test sha b53b4529…252b; no will-change/transform-gpu/translate-z; protected rc 0 | c10-diff.txt |
| C11 | Doc 305 | PASS: 7 TEMPLATE headings in order, l.4 exact, SP1–SP3 exist, names C-R469-01, R-470-1 | — |
| C12 | Auth + studio smoke | PASS at 1440 and 1280: `/studio-lab` anonymous, demo ready, Enter adds 6→8 clips; premium `/studio/middle-east` "Sign in required", 0 audio src, `/api/studio-token` 401. Fake-bearer path BLOCKED (no backend in cloud) | auth.mjs output |
| C13 | Claims | PASS: only K1 sha (ca2df2fa…) and K4 differ (allowed); 0 MISSING | data/claims.txt |
| gate | verify/review/publish | Root, not claimed | — |

## Findings
- **C-R470-F1 (Low/info, origin: pre-existing, environment-independent of the fix).** One slow frame (50 ms) at scrollY 372, t≈585–600, appears in 7/18 TREE frozen passes (+1 full-page pass ×3), both viewports. Literal reading of "cluster inside 360–900 in ≥2 passes" would flag it. Not a glow cluster: it is a single isolated frame at the same y, HEAD shows it in 3/6 passes, and a diagnostic build with all three glows deleted (`noglow`) shows it in 3/6 passes too (`data/diag-noglow.json`). It is independent of the glow change. I judged C2 PASS on that ground; B should decide whether the row wording ("cluster" = ≥2 frames) is the intended reading. Cause not investigated (likely first-scroll start/reveal).
- **PD Low notes (not defects):** outer oval outline of the product glow is softer than HEAD (0.94 edge ratio); upper-right accent patch barely visible at 0.78–0.79×; showcase pool slightly brighter. No action required.
- Tooling note: `pkill -n` in my shell killed a command once; no state lost.

Open (unchanged): TLM-R468-SABA-SCROLL-DEVICE (real device, Saba). Whole SABA-B-15 closes only after that.
