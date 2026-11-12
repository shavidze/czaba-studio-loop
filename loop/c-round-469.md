# C round 469: SABA-B-15 stage 2 (home glows -> radial gradients)

**Verdict: BLOCKED (not PASS).** Every row except C1 passes in the real browser. C1, the HEAD control, could not show the scroll jank in three attempts, so the improvement over HEAD is not demonstrated this run. This is an environment limit, not an A defect. One Low finding (C-R469-01). `browserVerified` true: every browser row that can run here ran.

Builds: HEAD 9ba13ac on :3471, TREE (HEAD + `git diff`) on :3472, Lenis-off mutant on :3473, all production builds (rc 0). Mock API on :5199. One probe at a time (L38).

| Row | Result | Evidence |
|---|---|---|
| C1 HEAD-CONTROL | **FAIL / env-invalid x3.** Medians of frames >33 ms: 2/1, 2/1, 2/1 (required >=5 at either viewport). Budget spent. | data/c1*.log, c1-a2/a3 |
| C2 FRAMES (frozen) | PASS. TREE 3 passes x 2 viewports: 0 slow frames in every pass, moving 176-180, finalY 2400. `/free-downloads` 0, 575/755 | data/c2-p1..p3.log |
| C3 FRAMES-FULL | PASS. `/` medians 0 (1 isolated 50-66 ms frame at scrollY 1547 and 3394 in 18 passes, none in the bands, no 2-pass cluster); finalY = 4121 = max; `/gift-cards` 0. HEAD 1/1 here (non-discriminating) | data/c3-p*.log, c3-head.log |
| C4 GUARD-MUTANT | PASS. Lenis-off on TREE: moving 20 (<100) in all 6 passes | data/c4.log |
| C5 COMPUTED | PASS. TREE product 2 glows, showcase 1: `filter none`, `radial-gradient(...)` bg, no will-change/transform. HEAD blur(120px)/blur(100px) | data/look.json |
| C6 LOOK-BAND | PASS. ratioToHead 1.19/1.21 (1440), 1.09/1.20 (1280) | data/look-profile.txt |
| C7 SHAPE/EDGES | PASS on the stated criteria; see C-R469-01. edgeJump top/bottom TREE 1/1 and 1.67/0 vs HEAD 1/0.33 and 1/0 (<= HEAD+1). No ring or seam at 100%; 10x amplified crops show finer banding than HEAD, not more. | shots/amp10-*, data/look-profile-head.txt |
| C8 OVERFLOW | PASS. scrollWidth = clientWidth at 1440/1280/375; scrollHeight equal HEAD vs TREE (4841/4841/5683) | data/overflow.json |
| C9 UNIT+MUTANT | PASS. tree 3/3; HEAD ProductSection -> SP1+SP2 red; HEAD StudioShowcase -> SP1+SP2 red | data/c9-*.log |
| C10 SOURCE-SCOPE | PASS. 4 paths exactly; hunks `@@ -38,2` and `@@ -75`; no will-change/gpu; useSmoothScroll/root/styles untouched; protected manifest rc 0 | git status, sha256 -c |
| C11 DOC | PASS. 7 template headings in order, l.4 `Completed (C round 469 PASS)`, cites SP1-SP3 only (exist) | doc 305 |
| C12 AUTH+STUDIO | PASS at 1440 and 1280. `/studio-lab` in a fresh incognito context opens the demo, no `auth_user`; `/studio/middle-east` shows "Sign in required", no audio src; `/api/studio-token` 401. Same as round 468. Fake-bearer path BLOCKED (no backend) | data/auth.json |
| C13 CLAIMS | PASS. Only K1 (4 status lines) and K9 (diff already applied) differ; no MISSING | data/claims-c.txt |

## Finding C-R469-01 (Low): glow is wider and flatter than HEAD
Section-mean ratio passes, but 40x40 patch means (7x7 grid, `patches.cjs`) show: at HEAD's glow peaks TREE adds 2.1 levels over the no-glow control where HEAD adds 4.7-4.9 (product section, lower left, both viewports) and 6.1 vs 8.9 (showcase, centre top); far from the glow TREE is 1.1-2.9 levels brighter (scale-220/225/175 spreads it). Max delta 2.8 of 255 on near-black. product-designer (eyeball only, no measurement) rated the product section "weaker, closer to hidden" as Medium; the measured shortfall supports Low. B/Saba decide if R-469-1 should also bound the peak or per-patch delta.

## Notes
- The HEAD control failed on this machine; round 468 C1 saw 6/4 and B saw 8/5 on full-page. Slow-frame counts are machine-dependent, so the TREE 0/0 shows no jank but not a reduction. Device check stays TLM-R468-SABA-SCROLL-DEVICE.
- Verify/full test rows are gate rows and not claimed.
