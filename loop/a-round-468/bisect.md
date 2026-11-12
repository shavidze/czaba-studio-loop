# A bisect, round 468 (HEAD 9ba13ac prod build on :3468, mock API :5199, frozen probes from b-round-467/probe, 1x CPU, 3 passes; renderer SwiftShader software raster)

Screens use `store-scroll-floor-probe.cjs` with HIDE_CSS on the one HEAD build (no rebuild). "slow" = count of rAF frames > 33.4 ms per pass (the median is over 3 passes). Full per-frame y values: `screens/summary.txt`.

| Build / screen | Change | / median frames >33.4 ms 1440 / 1280 | moving frames | Result file |
|---|---|---|---|---|
| HEAD 9ba13ac (A repro) | none | 6 / 5 (passes 11,6,4 / 6,4,5) | 166-178 | scroll-head.json |
| s1 hero Ken Burns static | `.homepage > section img{transform:none!important}` | 5 / 4 | 164-178 | screens/s1-hero-img-static.json |
| s2 all large blur glows hidden | `[class*="blur-[1"],[class*="blur-[8"],[class*="blur-[4"]{visibility:hidden}` | 0 / 0 | 165-180 | screens/s2-glows-hidden.json |
| s3 ProductSection 2 glows hidden | blur-[120px] left-1/4 + blur-[100px] right-1/4 hidden | 2 / 1 (band 1 gone; band 2 ~1930-2020 remains) | 174-179 | screens/s3-product-glows-hidden.json |
| s4 StudioShowcase glows hidden | size-[800px] blur-[120px] + blur-[40px] hidden | 3 / 2 (band 2 gone; band 1 ~370-890 remains) | 166-181 | screens/s4-showcase-glows-hidden.json |
| s5 glows promoted (will-change) | `will-change:transform` on the glows (keeps look) | 71 / 57 (much worse: compositor applies the filter every frame) | 102-119 | screens/s5-glows-willchange.json |
| s6 Product 2 glows + Showcase 800px glow hidden | 3 round glows hidden, reflection kept | 0 / 0 | 174-179 | screens/s6-product-plus-showcase800-hidden.json |
| s7 Product 2 glows + reflection hidden | Showcase 800px glow kept | 3 / 2 (band 2 remains) | 172-181 | screens/s7-product-plus-reflection-hidden.json |

Narrowed set: the three large round `filter: blur()` glows: ProductSection.tsx l.38 (500px, blur 120), l.39 (400px, blur 100), StudioShowcase.tsx l.75 (800px, blur 120). Band 1 (scrollY ~360-900) = ProductSection glows; band 2 (~1850-2020) = StudioShowcase glow. The reflection glow (blur 40) and the hero Ken Burns are not needed.
| Proposal build (3 lines, real source) | gradient swap of the 3 glows (proposal.diff.txt) | 0 / 0, run 2: 0 / 0 | 167-190 | scroll-fix-1.json, scroll-fix-2.json |
| ProductSection-only build (2 lines, real source) | product-only.diff.txt (first hunk set of the proposal) | 2 / 0 (passes 2,2,3 / 2,0,0; band 2 ~1920-2040 remains) | 172-179 | scroll-product-only.json |
