# C — Round 149 verification: V-1a scoped Obsidian & Brass colour tokens

Verifier: C · Date: 2026-10-25 · Tree: b292ff4 + A round-149 working tree (`a-round-149/end-sha256.txt`, 5/5 OK)
Browser: Playwright Chromium (installed), fresh context per session, `http://127.0.0.1:5173/studio-lab`, 1440×900 and 1280×720. Snap at session start: `off`.

## Verdict: **FAIL (Low only)** — browserVerified = true

All rows ran in the real browser. Two Low findings were **caused by this round**, so §7 routes the round to a bounded fix-up:
- **C-R149-1 (Low, RV-2):** the Loop brace label "Loop" is now 4.32:1 (computed) and 4.38:1 (pixel). The threshold is 4.5. At post-V-0 it was 4.97.
- **C-R149-2 (Low, STATE-DISTINCT):** in the Overview, the playhead (`bg-accent`) is drawn over the audio bar (`bg-brand`). The two are now the same gold, at 1.03:1 by pixel. Before V-1a they were different hues (orange on teal).

Everything else passes. Tokens are scoped correctly, including both portals. Layout moved 0 px. All 61 DUX-B-1/B-4 elements are now ≥ 4.5 (lowest 4.57): 53 `text-dim` and 8 `text-muted` on the selected row. Store pages are unchanged. Behaviour is unchanged, and auth is not bypassed.

## Rows

| Row | Result | Evidence |
|---|---|---|
| T149-TARGETED | **PASS**: 77/77. Per-file counts: studio-lab-demo 13, default-track-names-ssr 2, render-budget 7, strings 51, studio-theme-obsidian 4. These equal A's counts. I used A's corrected path `app/data/__tests__/studio-lab-demo.test.ts`, because the task's path does not exist. | `c-round-149/out/vitest.json`, `vitest.log` |
| SOURCE-SCOPE | **PASS**. Frozen 965 OK at the start and the end. The 5 end hashes equal `a-round-149/end-sha256.txt`. `git status` = 3 M + 2 ??. `git diff b292ff4 --name-only` lists only the 3 granted files. The protected diff is 0 lines (studio.$productId, api.studio-token, account.downloads, download-routes.test, auth*, AuthContext, StudioContext, Modal, root). The C start and end hashes are identical, so no source changed during C's phase. | `out/c-start-sha256.txt`, `out/c-end-sha256.txt` |
| AN-REVIEW | **PASS**. `app.css`: the last 22 lines are byte-equal to the §1.1 block extracted from current-task.md (`diff` empty). numstat is 22/0, the block is at EOF after `.glass-button:hover`, and the trailing newline is kept. StudioWorkspace: 1/0, and the attribute is the only added line. Doc 121: exactly the l.4, l.125 and l.129 texts (3/3). Doc 122: Georgian, all 7 TEMPLATE sections, status `In Progress (C round 149 — ჯერ არ გაშვებულა)`. TH1–TH4 use hand-written literals: an 18-entry map, the selector string and the regexes. No module-against-module pin. | `git diff`, test file read |
| TOKENS-SCOPED | **PASS** at both viewports. All 18 values equal §1.1 on `.studio-container`, `body`, the Export panel (`[role=dialog][aria-labelledby=arrangement-export-title] > div`) and the marker menu. The menu was opened with Shift+F10 on a focused flag; it is portalled (outside `.studio-container`). `html` equals the Store values (`storebase149.json` root), both at the start and after the dialog and menu. Backgrounds: workspace `rgb(14, 13, 12)`, header `rgb(22, 20, 18)`, Export panel `rgb(22, 20, 18)` with border `rgb(36, 33, 30)`, title `rgb(236, 230, 218)`. Marker menu: bg `rgb(22, 20, 18)`, border `rgb(36, 33, 30)`. | `out/c149-1440.json`, `out/c149-1280.json` (`tokensS0`, `markerMenu`, `exportDlg`, `finalTokens`) |
| RV-1 | **PASS**: max delta 0 px in S0/S1/S2 at both viewports. Element counts equal round 148 (1280: 103/121/130; 1440: 111/122/131), with 0 missing and 0 added keys. Run-to-run determinism is 0 px. The first 1440 r1 session hit the known cold-Vite first load (hydration error plus "Invalid hook call", the same as rounds 131–139). It was marked invalid and replaced once, and the replacement was clean. Nothing was written under `c-round-125/` or `c-round-148/out/`: `find -newer out/c-start-sha256.txt` over both dirs is empty, and their reference files keep their 23:50 timestamps. | `out/rv1-compare.json`, `out/bbox-post-v1a-{1280,1440}.json`, `out/d6-1440-r1-invalid1.log` |
| RV-2 | **FAIL-Low (C-R149-1)**. Tooling check: the `bg-brand/10` selected row resolves to a concrete `rgb(40,35,27)`, not `?`. The pixel sampler agrees wherever the glyph is large enough. One exception: `arrangement-library-tree:9` (dim on the selected row, computed 4.57) sampled at pixRatio 1.0, because the glyph is too small for the dominant-colour method; this is not a disagreement. **DUX-B-1/B-4:** all **61** elements are ≥ 4.5 (53 dim + 8 muted on the selected row). 33 were matched by key, 12 by a box match within 6 px, and 16 by position, because V-0 renamed their strings (`out/rv2-dux-map.json`). The `▣` glyph was in the c-round-125 failing list but was classed as an icon pass in the design review, not as DUX-B-4. `text-dim` is 5.38 on surface and 4.57 on the selected row (B predicted 4.60). `text-muted` on the selected row is ≥ 4.5. **Other enabled text:** (a) the group glyph `▣` is 4.32, which passes as an icon (≥ 3; B predicted 4.33). (b) **The Loop brace label "Loop"** (`text-accent` on `bg-accent/30` over surface) is 4.32 computed and 4.38 pixel, below 4.5 at both viewports; post-V-0 it was 4.97. **Exempt (inactive controls):** 30 items, all `disabled` or `aria-disabled`: Undo/Redo, Split/Delete/Loop when disabled, Zoom-back, zoom range, Metronome. **Unknown backdrop:** 24, pixel-sampled (clip headers over waveform 13.0, video-dock text 7.48). **Export dialog (extra):** 18 text elements, min 5.38, 0 fails. | `out/d6/contrast-post-v1a.json`, `out/rv2-dux-map.json`, `out/dlgcontrast-{1280,1440}.json` |
| RV-2-FIELDS (record only) | BPM, library search, detail From/To and Clip Gain: border `rgb(36,33,30)` vs surface `rgb(22,20,18)` = **1.15**; fill vs surface 1.06; border vs fill 1.21. This is the same at both viewports. The group-name field is only visible in edit mode (F2). There its border is `brand` against the elevated header `rgb(29,26,23)`, ≈ 7.3 computed. Input for V-1b (DUX-B-3). | `c149-*.json` `fieldsS1`; `c149b-*.json` `groupField`; `shots/group-field-1440.png` |
| RV-3 | **PASS**. (a) 0 hex values and 0 colour functions in `app/components/arrangement` (non-test). `data-studio-theme` appears only at StudioWorkspace:2186 and app.css:3916–3917. (b) `/`, `/cart` and `/login` (404) at both viewports: `html` and `body` `--color-*` are equal to `storebase149.json`, there are 0 `[data-studio-theme]` elements, and body bg is `rgb(8, 10, 12)`. Screenshots are next to B's. Visual check of `rv3-149-home-1280.png` against `storebase149-home-1280.png`: the same cool intro (teal-tinted CZABA wordmark) at a different animation frame. On `/studio-lab`, body takes the warm values, as intended. **Reviewer L4 probe:** clicking "← CZABA" navigates client-side to `/`, which leaves 0 markers, body `--color-brand` = Store teal and body bg `rgb(8,10,12)` after it settles (it was not sampled during the transition). | `out/rv3.json`, `out/rv3-compare.json`, `shots/rv3-149-*`, `c149-*.json` `navProbe` |
| STATE-DISTINCT | **FAIL-Low (C-R149-2)**; the table is below. | `shots/SD-*-1440.png`, `shots/LOOP-*`, `shots/OV-playhead-*` |
| FUNC-SMOKE | **PASS**. With clips (S1): Play 2 s from 0 moves the playhead 0 → 1.97 s and `createBufferSource` +3, at both viewports. Dragging the SFX clip header +1 s gives 4 → 5; Ctrl+Z restores 4 ("Undo: Move clip") at 1440. At 1280, the S1-session drag did not grab the clip, because the clip was off-screen behind the expanded detail panel; that is a tool issue. A clean retry gave 4 → 5 → 4 (`out/drag-1280.json`). In that 1280 S1 session, the Ctrl+Z after the failed drag undid "Group Tracks". So the later `states` styles in `c149-1280.json` were taken with the group ungrouped. No reported value depends on it: the group field was measured again in `c149b-1280.json`. The Export dialog opens and Escape closes it. The marker menu opens with Shift+F10 and Escape closes it. Note: on an empty project (S0), Space does not advance the playhead. That is unrelated to colour and was not compared with earlier rounds. | `c149-*.json` `playS1`, `dragUndo`, `exportDlg`, `markerMenu` |
| VISUAL | **PASS**. Full-window shots: `shots/S0-*`, `S1-*`, `export-dialog-*`, `D6-S*-*`. The Export dialog matches B's `probe149-export-*` (the warm panel and gold selected option). A computed-colour hue scan of every visible element (text, bg, border, outline, SVG fill/stroke) inside `.studio-container` and in the body portals found **0 teal, 0 orange and 0 blue** in S0, S1 and the open Export dialog. The lane grid lines are warm, as in R3. Colourful pixels are only test-video content (SMPTE bars) and Chromium's native text-selection highlight in an edited input. | `c149-*.json` `hueS0`, `tokensS1.hue`, `exportDlg.hue` |
| G149-3 | **PASS** (fake-Bearer 403: **BLOCKED**, backend unavailable in cloud). `/studio-lab` opens anonymously with the workspace and the "Demo collection — no sign-in required" badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]` (1440 and 1280). `GET /api/studio-token` returns 401. | `out/g149-3.json`, `shots/g149-3-*` |
| PX-NET / REG-HYD | **PASS**. In every valid session there were 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. Cart noise was 2 per session. The invalid cold-load session is excluded (see RV-1). In the RV-3 tool's first attempt (original script, unchanged reads), one evaluate failed with "Execution context was destroyed" on `/` and was rerun; it was not an app error. | `*.json` `net` |

### STATE-DISTINCT (1440, also measured at 1280)
Before V-1a: brand = teal (playhead, selected clip, marker, Solo, Follow, overview bars); accent = orange (Loop brace, Loop button, overview playhead). Now both are `#c9a46a`.

| Pair | Non-hue cue now | Verdict |
|---|---|---|
| Playhead vs Loop brace | Playhead: a 2 px full-height line with a ruler handle. Brace: a filled box in its own Loop strip with the text "Loop". | distinct |
| Selected clip vs Loop brace / playhead | Selected clip: gold header fill, 2 px ring and dark header text; it sits inside the lane. | distinct |
| Clip inside a time selection | A light overlay with a time label ("00:02.500 – 00:03.500 · 1.000 s") inside the clip. | distinct |
| Loop brace on / off | On: solid gold border, gold/30 fill, "Loop". Off: dashed muted border, no fill, "Loop off". | distinct |
| Loop button on / off | On: gold border, gold/20 fill, gold text, `aria-pressed=true`. Off: outline border, elevated bg, foreground text. | distinct |
| Loop button on vs Follow on | Loop has a gold border and fill. Follow has only gold text on an outline border. Their labels differ. | distinct |
| Marker vs Loop brace | Marker: a flag with a stem in the Markers row, named "Marker 1". Brace: in the Loop row. | distinct (row, text, stem) |
| Solo on / off | On: gold fill with dark "S". Off: transparent with muted "S". | distinct |
| Follow on / off | Text gold vs cream (≈ 1.9:1), border outline vs outline-hover, `aria-pressed`. Before V-1a this was also a colour-only text cue (teal vs light), so it is not a brand/accent loss. | unchanged, observation |
| **Overview playhead vs Overview audio bar** | Playhead `bg-accent` (2 px) over `bg-brand` bars. Where it crosses a full bar, pixels are 201,164,106 vs 202,167,111 = **1.03:1**. Over `bg-brand/50` bars it is 2.62:1. The line stays visible above and below the bars, on the dark Overview background. | **lost on overlap → C-R149-2 (Low)** |

## Bugs (for B)

### C-R149-1 — Low — Loop brace label below 4.5:1 after V-1a
- Steps: open a fresh context on `/studio-lab` (1440×900 or 1280×720) → add a clip → make a time selection → Ctrl+L.
- Expected: the enabled "Loop" label is ≥ 4.5:1 (normal 12 px text, RV-2 rule). It was 4.97 at post-V-0.
- Actual: `text-accent` rgb(201,164,106) on `bg-accent/30` over surface, composited rgb(76,64,45) = **4.32** computed and **4.38** pixel (pixel bg rgb(76,63,44)).
- Cause, observed: the accent tint and the accent text are now one hue with a smaller lightness gap. `ArrangementLoopBrace.tsx` l.239 (`bg-accent/30`) and l.256 (`text-accent`).
- Evidence: `c-round-149/out/d6/contrast-post-v1a.json` (key `arrangement-loop-brace:Loop`), `out/d6/d6-*-r1.json` `pixS1`, `shots/LOOP-on-1440.png`.
- Routing (§7): a colour-value failure. It joins V-1b with DUX-B-3, for example by lowering the brace fill alpha or using `text-foreground`; B decides the token.

### C-R149-2 — Low — Overview playhead invisible where it crosses the audio bar
- Steps: open a fresh context on `/studio-lab` → add "CZABA hero" to Music at 0 → click the ruler at 1, 3, 10 and 30 s → look at the Overview strip.
- Expected (STATE-DISTINCT): the playhead and the content bar can still be told apart; before V-1a they were orange on teal.
- Actual: `arrangement-overview-playhead` (`bg-accent`, `ArrangementOverview.tsx` l.334) and the `bg-brand` bars (l.17) are the same `#c9a46a`. Pixel ratio 1.03 at both viewports, at every sampled time. Above and below the bar, the line is still visible against the dark Overview background, so the position is still readable (Low; a user reading the Overview loses the line inside the bar).
- Evidence: `c-round-149/out/c149b-{1440,1280}.json` (`overview`), `shots/OV-playhead-t{1,3,10,30}-{1280,1440}.png`.
- Routing (§7): a STATE-DISTINCT Low. If it is fixed colour-only, it can join V-1b (for example a `foreground` playhead, or an outline). Otherwise it is its own bounded fix-up.

## Observations (not findings)
- The S1-session drag at 1280 hit an off-screen clip, which was a tool issue. The retry is clean.
- The Chromium native text-selection highlight (blue) shows in the group-name editor; the app sets no `::selection` rule. It is pre-existing and not V-1a scope. VISUAL-A may want a `selection:` token later.
- Reviewer L2 (no `:has()`) was not tested; Chromium supports `:has()`.

## Ableton parity
| Behaviour | Requirement (CZABA) | Ableton parity |
|---|---|---|
| Obsidian & Brass palette | Met, except C-R149-1 | Not applicable (CZABA brand decision; no source used) |
| One accent for playhead, selection and loop | Met with the C-R149-2 exception | Unconfirmed (no Live source captured) |

## Gate rows (not C)
Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL belong to the root gate (`gates/gate-round-149.json`, not present yet).

## Root review follow-ups
The evidence supports closing DUX-B-1, DUX-B-4 and GATE148-S1 (doc 121's three lines were verified in AN-REVIEW). Under §7, closure on a FAIL-Low round is B's decision.
