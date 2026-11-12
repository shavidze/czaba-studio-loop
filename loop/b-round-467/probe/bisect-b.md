# B bisect, round 467 -> 468 planning (prod builds of 9ba13ac with one scratch change each; frozen probe store-scroll-probe.cjs, 1x CPU, 3 passes)

| Build | Change (diff file) | / median frames >33.4 ms 1440 / 1280 | moving frames / | Result file |
|---|---|---|---|---|
| HEAD 9ba13ac | none | 9 / 8 | 165-175 | scroll-prod-9ba13ac-cpu1.json |
| Lenis off | useSmoothScroll early return (lenis-off.diff.txt) | 5 / 4 (of only 20 moving frames; LoAF 50-116 ms with no script) | 20 (wheel not eased) | scroll-prod-lenis-off-cpu1.json |
| Header no blur | Header.tsx backdrop-blur-lg removed (header-noblur.diff.txt) | 10 / 8 | 165-183 | scroll-prod-header-noblur-cpu1.json |
| Hero no blur | HeroSection.tsx 2 backdrop-blur removed (hero-noblur.diff.txt) | 10 / 9 | 164-177 | scroll-prod-hero-noblur-cpu1.json |
| Hero no autoplay | HeroSection.tsx autoPlay removed (hero-noautoplay.diff.txt) | 9 / 6 | 165-178 | scroll-prod-hero-noautoplay-cpu1.json |
| Floor control | HEAD build, `body * { visibility: hidden !important; }` injected by store-scroll-floor-probe.cjs (layout and height unchanged) | 0 / 0 | 140 | scroll-prod-floor-allhidden-cpu1.json |

Conclusion: the frame cost is painting visible content on / (it remains with Lenis off; it is 0 with all content hidden at the same page height, so the bound <= 2 is reachable in this environment), not the Lenis hook; header blur, hero blurs and hero video are not the cause. Lenis off also proves the eased-scroll guard (>= 100 moving frames on /) is red without Lenis.
Where (slowFrames [t, dt, y] in scroll-prod-9ba13ac-cpu1.json): slow frames cluster while scrollY is about 360-850 and again about 1850-2000 (plus one at the end near 2398); with Lenis off, about 360-960 and 2040-2280. These are the bands to screen first.
/free-downloads renders its 3 free items (free-downloads-fullpage.png; 1475 px tall; free-downloads-content.json used a main selector that matched nothing, so cite the PNG) and stays at 0 slow frames in every build.
