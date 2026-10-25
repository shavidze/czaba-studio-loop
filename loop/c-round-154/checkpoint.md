# C round 154 checkpoint
- DONE: SOURCE-SCOPE start (HEAD 037e25f, frozen 959 OK, A end hashes OK, 13M+1??, protected empty, app.css/studio-lab/package.json unchanged; c-start 973 files), AN-REVIEW diff, T154-TARGETED 293/293 (21 files).
- DONE: d6 x4 valid (1440 r1 first attempt INVALID envfirstload, replaced). RV-1 compare: only clip-gain-reset dw+3 (1280 S1/S2, 1440 S0/S1/S2), 0 vert/panel/missing/added, det 0.
- NEXT: c154 probe (WEIGHT-STYLE, MONO-STYLE, NO-CLIP, LANE-GHOST, MASTER-OVER, INVENTORY), FONTS-SCOPED, FUNC-SMOKE, G154-3.
- DONE: c154 x2 (WEIGHT/MONO/NOCLIP/GHOST/MASTER-OVER/M-S/group/clip gain/inventory), c154b x2 (slider zoom sweep), c154c x2 (range sans, grid menu). FINDING: N6 ghost start = IBM Plex Mono 500 (ghost container font-medium) -> MONO-STYLE fails N6; ghost title cw 9->1 px (info). Peak "−∞" ∞ glyph DejaVu fallback (pre-existing?). ruler min gap 12.8 px @2.7 px/s (B predicted >=14), 0 overlaps.
- NEXT: c153s + fs3 (FUNC-SMOKE), rv3b (FONTS-SCOPED), g153-3 (G154-3), end hashes, report.
- DONE: all rows; c-round-154.md/json written (FAIL: C-R154-01 low N6 Plex Mono 500). NEXT: advisor review.
- FINAL: advisor fixes applied (LANE-GHOST moved to passed, h2 box measured 47->46, TH10 l.420-424 confirmed, JSON WEIGHT-STYLE carve-out).
