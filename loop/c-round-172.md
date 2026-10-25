# C — Round 172 verification: V-3c-5a — 10 px panel radius (`--radius-panel`)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (D-29z137) · A report: `a-round-172.md` (read as data, not trusted)
Env: `env-status.json` store 200 (2026-10-25T19:16:46Z). Real Playwright Chromium (headless), fresh context per session, `http://127.0.0.1:5173/studio-lab`, 1440×900 and 1280×720. Fonts were `ok` in every measured session, and every Google Fonts response returned 200.

## Verdict: **PASS**. browserVerified = realVerified = **true**
All contracted rows pass. There is two new **Low** findings. Both predate this round and neither was caused by A's change: **C-R172-01**, the 1280 group-reason text crosses the P2 box's bottom border; **C-R172-02**, Set selection adds a footer line and the Clip details panel jumps 20 px. Fake-Bearer 403 is BLOCKED (backend unavailable in cloud).

## T172-TARGETED: PASS
`npx vitest run $(cat a-round-172/vitest-files.txt)` → **362/362** (21 files), same as A. PNR1, PNR2, PNR3a/b/c, `detail-panel-polish` (l.358 lock), OV1, TH1, TH10/11, VFR1, RF1, `floating-video` and the grid/marker menu suites are present and green. Output: `c-round-172/out/vitest-c.json`.

## SOURCE-SCOPE: PASS
- HEAD `13ad2bd`. `sha256sum -c b-round-171-r172-tree-sha256.txt` is OK at start and end (983 files). `a-round-172/end-sha256.txt` is OK for all 9 paths.
- `git status`: 7 ` M` (the grants) + 2 `??` (`panel-radius-ui.test.tsx`, doc 141). Nothing else.
- Protected diff vs `13ad2bd` is empty: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `Modal.tsx`, `ArrangementOverview.tsx`, `ArrangementExportDialog.tsx`, `strings.ts`, `studio-lab.tsx`, `app/contexts`. The obsidian block has 0 `radius` properties.
- No source change during C's phase: `c-round-172/start-tree-sha256.txt` equals `end-tree-sha256.txt` (`cmp` OK, 992 files).

## AN-REVIEW: PASS (C read `git diff 13ad2bd` itself)
- `app.css` has exactly 1 added line, `--radius-panel: 0.625rem; /* 10px - Studio panels */`, inside `@theme` after `--radius-md`.
- P1–P6 each change one token (`rounded-sm`/`rounded-md` → `rounded-panel`) and nothing else. The menu row constants (`rounded-sm`) and the Overview are untouched.
- L1 changes one token in `WAVEFORM_BOX_CLASS`.
- No arbitrary value, text, aria, role, handler, size, padding, colour or shadow change.
- `expect(` counts: `detail-panel-polish` **53** (unchanged), `panel-radius-ui` **25**. Doc 140 changes only l.4 (exact status text) and strikes the l.114 TODO. Doc 141 has the TEMPLATE sections (context, approach, architecture, files, problems, testing, TODO).

## RADIUS-V3C5A: PASS (computed style on the compiled class)
Tool: `c-round-172/tools/c172-radius.cjs`. Data: `out/radius/rad-{1440,1280}-2.json`. Crops: `out/radius/rad-*-1-crops.json` and `shots/radius/corner4x-*`, `site4x-*` at DPR 4.

| Site / state | 1440 radii | 1280 radii | border | background | box-shadow |
|---|---|---|---|---|---|
| P1 waveform box (D1) | 10/10/10/10 | 10/10/10/10 | 1px solid rgb(36,33,30) | rgb(14,13,12) | none |
| P2 group reason box (D2) | 10 ×4 | 10 ×4 | 1px solid rgb(36,33,30) | rgb(14,13,12) | none |
| P3 placeholder (V1) | 10 ×4 | 10 ×4 | 1px **dashed** rgb(36,33,30) | rgb(14,13,12) | none |
| P4 video box compact (V0) | 10 ×4 | 10 ×4 | 0px | rgb(14,13,12) | none |
| P4 video box floating (V1) | 10 ×4 | 10 ×4 | 0px | rgb(14,13,12) | 1px ring rgb(36,33,30) + 0 4px 16px rgba(4,5,6,.5); no before-value, class string unchanged in the diff |
| P5 Grid menu (G1) | 10 ×4 | 10 ×4 | 1px solid rgb(36,33,30) | rgb(22,20,18) | 0 4px 16px rgba(4,5,6,.5) (no before-value) |
| P6 Marker menu (K1) | 10 ×4 | 10 ×4 | 1px solid rgb(36,33,30) | rgb(22,20,18) | 0 4px 16px rgba(4,5,6,.5) (no before-value) |
| Grid menu rows (8) / Marker rows (3) | 6px | 6px | — | hover rgb(29,26,23) | — |
| Overview root / overlay / frame | 6 / 6 / 6 | 6 / 6 / 6 | unchanged (V-3c-5b) | | |

- Before-values for border, background and radius exist only for P3 and P4 (round 171 `surf-*-1.json`; round 171 did not record box-shadow, so no site has a shadow before-value). Border and effective background are the same; only the radius changed from 6px to 10px. P1, P2, P5 and P6 have **no before-value**; their values are recorded above.
- **The video is clipped at the corner (P4, real frame, 640×360 H.264).** The pixel at each geometric corner (inset 0.75 px) equals the page background (rgb ≈ 20,18,16). The edge midpoints and the pixels 10 px inside show the video's colour bars (for example top-left inside = 254,0,0). No square video corner shows through, compact or floating, at either viewport (`clip` in the JSON). Crop: `shots/radius/site4x-1440-V1-P4-1.png`.
- P1: real peaks (SVG, 408×89) are clipped by the rounded corners, and the corner pixels equal the parent surface (`site4x-1440-D1-P1-1.png`). P3: dashed corners render along the 10 px curve (`corner4x-*-V1-P3-*`). P5 and P6: the hovered first row (6 px) sits concentric inside the 10 px container (`site4x-*-G1hover-P5-1.png`, `site4x-*-K1hover-P6-1.png`).

## BOX-V3C5A: PASS (`out/box-v3c5a.json`)
| Site | 1440 vs r171 | 1280 vs r171 |
|---|---|---|
| P4 V0 [1268,92,160,90] / [1108,130,160,90] | 0.00 | 0.00 |
| P4 V1 [8,503,272,153] / [8,369.5,189.33,106.48] | 0.00 | 0.00 |
| P3 V1 | 0.00 | 0.00 |
| dock Expand / Drag / Close / Return (V0, V1) | 0.00 | 0.00 |

- **No before-value** (recorded): P1 D1 1440 [600,732,410,91], 1280 [600,576,250,67]. P2 D2 1440 [600,712,410,91], 1280 [600,556,250,67]. P5 1440 [1012,315,144,243], 1280 [1012,339,144,243]. P6 1440 [600,249,160,94], 1280 [600,287,160,94]. Children and rows are in the JSON. For these sites the 0 px claim rests on RV1 plus the fact that `border-radius` does not change layout boxes.
- Run-to-run stability at 1440 (attempt 1 vs 2, G1 excluded): 0.00 px.

## RV1-V3C5A: PASS (`out/rv1-v3c5a.json`)
I ran the copied `d6.cjs` (sha `3abc88fe…`) through `d6-fontwrap.cjs` (sha `175e3773…`) once per viewport and compared it with `c-round-171/out/d6/d6-*-r1.json`. S0/S1/S2 have 0 missing and 0 added keys, with a max delta of **0** at both viewports. The contrast lists have the same keys, and the failing set is identical to the reference (the disabled Undo/Redo/Split/Delete/Loop/Zoom/Metronome).

## FUNC-SMOKE-V3C5A: PASS (real mouse at element centres, `elementFromPoint` hit = true for every target, both viewports)
- **P1:** a click inside the waveform box keeps the selection; the status, detail text and errors are unchanged and there was no crash. Set selection (From 2, To 4 → Set selection) gives the status "Time selection: 00:02.000 — 00:04.000 · Music." and the range overlay appears inside P1. At 1280 the Clip details panel is collapsed by default (720 px height); C expanded it with `arrangement-detail-toggle`, as a user would.
- **P2** (Music clip click + **Ctrl+click** on the video clip; 2 selected): the reasons read exactly as RF1, "A time selection is set on one clip — select only one" and "Clip Gain works on audio clips only — remove the video from the selection". Start input `aria-describedby` = reason id; Clip Gain field `aria-describedby` = gain reason id.
- **P3/P4:** Expand makes the box `fixed` and shows the placeholder. Focus on Drag + ArrowRight moves it **+16.00 px** (dy 0). Space plays: video currentTime 0 → 1.46 in the floating box with the playhead at 1.47–1.48, and Space pauses. Placeholder Return goes back to compact with focus on "Expand video". Expand, then Escape, goes back to compact with focus on "Expand video".
- **P5:** right-clicking an empty part of the Video lane opens the menu. Choosing "10 s" closes it, the grid readout goes from 1 to 10 and the status reads "Grid: 10 s (Snap off)". On a reopened menu, Escape closes it. **Note:** focus goes to BODY. In the real browser the right press on the non-focusable lane blurs the previously focused select before the menu opens, so BODY is "the element that had focus". GM11 dispatches contextmenu without a press. The logic is unchanged this round, so this is an observation for B, not a FAIL.
- **P6:** Add marker at 2 s, then right-click the flag to open the menu. Escape closes it with focus on the marker flag. Reopen, then "Delete (Delete)" closes the menu, leaves 0 markers and shows the status "Marker “Marker 1” deleted.".

## G172-3: PASS (+1 BLOCKED)
A fresh context with no credentials opens `/studio-lab` with the workspace and the demo badge; `auth_user` is null and there are 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]` at 1440 and at 1280. `GET /api/studio-token?product=middle-east&file=stem1.wav` returns **401** ("Please sign in to access Studio."). So the premium route is not bypassed. Fake-Bearer 403: **BLOCKED**, backend unavailable in cloud. (`out/g172-3.json`)

## PX-NET / REG-HYD: PASS
14 valid sessions (10 radius, 2 d6, 2 g172-3 contexts): 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The only noise is the expected cart noise (4 per radius run).

## Findings for B
### C-R172-01 (Low, pre-existing, not caused by round 172): the 1280 group-reason text crosses the P2 border
- **Steps:** 1280×720 → load `beeps-6s-h264-aac.mp4` → add `demo-middle-east` to Music at 1 s → expand Clip details → click the Music clip, then Ctrl+click the video clip.
- **Measured:** P2 is 250×67 (y 556–623). The range reason takes 2 lines (561–593) and the Clip Gain reason 2 lines (595–627). The last line runs **4 px past the outer bottom edge**, and the bottom border and bottom-left curve cross the glyphs (`shots/radius/site4x-1280-D2-P2-1.png`). At 1440 it fits (767 vs 803).
- **Why pre-existing:** round 41 measured the same state at 1280 with the range reason on 1 line, and it fit (c-round-41.md l.138/153). A class-only radius change cannot alter wrapping or box size, and BOX/RV1 are 0.00 px vs round 171. The likely cause is the later VISUAL-A typography (inference, not verified).
- **Expected:** the text stays inside the framed box (the box grows, scrolls, or the text fits).
- **Routing:** C judged this under the §7 "Low only" row, not the "visual defect at a rounded corner" row. The text crosses the straight bottom border too, not only the curve, and the cause is wrapping, not radius. **A fix is not possible within R21–R23**: it needs a layout change in `ArrangementDetailPanel` (P2 height/grow, scroll, or reason fit). B decides: a bounded fix-up, or `deferred_low_polish`.

### C-R172-02 (Low, pre-existing): Set selection makes the Clip details panel jump 20 px
- **Steps:** 1440×900 or 1280×720 → load the video → add `demo-middle-east` to Music at 1 s → select it → From 2, To 4 → Set selection.
- **Measured:** the footer gains a 4th line ("Time selection: 00:02.000 — 00:04.000 · length 00:02.000 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time"). Clip details, P1 and the library preview jump up **20 px** (P1 y 732 → 712 at 1440, 576 → 556 at 1280; size unchanged), with no transition. Evidence: `shots/radius/rad-1440-2-D1.png` vs `rad-1440-2-D1-setsel.png`; `rad-*-2.json` `func.P1.applied.p1` vs `states.D1.m.P1.box`.
- **Context:** C-R11-02 reserved the selected-clip footer line for the same reason; the range line is not reserved. Related: A-R28-REVIEW-4-ALL-LANE-FOOTER, C-R28-INFO-STALE-STATUS. This is not a round-172 change (class-only diff).

### Notes (not bugs)
- Grid menu Escape focus returns to BODY after a real right press (see P5).
- With a real mouse on a non-focusable opener (the lane), the FUNC-SMOKE wording "focus back on its opener" cannot be met. B should revisit either the acceptance wording or GM11's setup (it dispatches contextmenu without a prior press).
- A's mutations m227–m234 were **not re-run by C** (speed rules); they remain A's claim.
- D2 used audio + **video** (Ctrl+click the video clip), as in RF1, so both group reasons show. The task's audio + SFX example would show only the range reason.

## Ableton parity
Not applicable. This is a CZABA brand decision (`visual-direction-a.md` § „ღილაკები და ზედაპირები“). No Live 12 source was consulted and no claim is made that Live looks like this. CZABA requirement: met.

## Not run / gate
- Not re-run (unchanged since rounds 158–171, per task): transport, toolbar, lane/group header, library/preview, Export dialog, clip, marker row, icon rows, ENV-VIS, OV-CORNERS.
- Gate (not C's): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- Invalid or replaced runs: warm-1 hit the cold-Vite first load and was replaced by warm-2. `rad-1280-1` was a harness error: the panel was collapsed, and then the SFX lane was not reachable at 1280. Attempt 2 is canonical at both viewports.

## Tools (`c-round-172/tools/`)
Copied unchanged: `lib.cjs`, `lib122.cjs`, `wav.cjs`, `h3.cjs`, `report.cjs`, `warm.cjs`, `d6-fontwrap.cjs` (c-round-171/170), `d6.cjs` (c-round-169, sha `3abc88fe…`). New: `c172-radius.cjs`, `png.cjs` (minimal PNG decoder for the corner pixels), `cmp-box-172.cjs`, `cmp-d6-172.cjs` (cmp-d6-171 with refs moved forward), `g172-3.cjs` (g171-3 with output names changed).
