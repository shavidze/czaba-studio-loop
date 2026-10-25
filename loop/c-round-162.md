# C — Round 162 (V-3c-2: lane / group header / clip glyphs → lucide icons) — **PASS**

Verifier C, 2026-10-25. Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720. `browserVerified` = `realVerified` = **true**. Bugs: **0**. Blocked: only the fake-Bearer 403 (backend unavailable in cloud). Env: `env-status.json` store 200.

## Verdict per row
| Row | Result | Evidence |
|---|---|---|
| T162-TARGETED | PASS: the 19 files are **358/358**, equal to A. LV1, LGH1, LC1-audio (`clip-strings-ui`), LC1-video (`lane-strings-ui`, as §2 allows) and LG2 are present and green. | `c-round-162/out/vitest.json` |
| SOURCE-SCOPE | PASS: HEAD `f08c7ce`. The 969 frozen files are OK at start and at end. The end hashes equal `a-round-162/end-sha256.txt`. `git status` shows 11 ` M` grants + 1 `??` (doc 131) and nothing else, so every protected path is byte-identical to `f08c7ce`. C's start and end sha files are identical, so no source changed during C's phase. | `out/c-start-sha256.txt`, `out/c-end-sha256.txt` |
| AN-REVIEW | PASS. Details below. | `git diff f08c7ce` |
| ICON-V3C2 | PASS at both viewports in all 4 states. | `out/ana162-{1440,1280}.json`, `shots/lane-*.png` |
| RV1-V3C2 | PASS. With the 6 renames applied there are 0 missing keys, 0 added keys and 0 collisions. The max delta is **0 px** in S0, S1 and S2 at both viewports. | `out/rv1-v3c2.json`, `out/d6/`, `shots/D6-*.png` |
| LANE-STATES-BOX | PASS. Every keyed element is **0.000 px**. The only movers are inner title spans, at ≤ 0.344 px. There are no unexpected keys. | `out/lane-states-box.json` |
| FUNC-SMOKE-LANE | PASS at both viewports. Every pointer action landed on the svg centre (`elementFromPoint` returns the svg or its path). | `out/c162-{1440,1280}.json` → `func` |
| G162-3 | PASS on 3 rows; the fake-Bearer 403 is BLOCKED (backend unavailable in cloud). | `out/g162-3.json`, `shots/g162-3-*.png` |
| PX-NET / REG-HYD | PASS. In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. The only noise is the expected cart noise (10 per run). | `func`/`net` in the run JSONs, d6 `net` |

Not re-run (code unchanged, task §4): ICON-V3C1, LIB-STATES-BOX, ICON-V3B, SURFACE-STYLE, CASCADE-SCOPE, CONTRAST-V3A and the V-2 rows. Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-*) belong to the root gate.

### Invalid runs (replaced)
1. **Warm-up load.** This is ENV-FIRST-LOAD-LUCIDE: the first cold Vite load after the new lucide imports gave "Invalid hook call", a pageerror (`useState` of null) and 1 hydration message. It was not a measurement. Warm-2 was clean (`out/warm*.log`).
2. **1440 FUNC attempt 1: a defect in C's harness, not in the app.**
   - Ctrl+G already selects the new group, so the "unselected → selected" check had no unselected start.
   - The Undo title reads "Move clip" both before and after a second move.
   - Fix: deselect first through the SFX name. The criterion is now that one Ctrl+Z restores the start, Redo re-applies it, and the Undo title is "Undo: Move clip".
   - Every later run was green (`out/c162-1440-attempt1-harness.json`).

### Which run is cited
- The final icon, box and func numbers come from a **second full run of both viewports** (`out/c162-{1440,1280}.json`).
- Run 1 (`out/c162-{1440,1280}-run1.json`) did not save the raw `measure()` list that the re-keyed pairing of the text-keyed video row needs. Run 1 and run 2 agree on every icon and func result; this was not a flaky retry.
- `out/ana162-*.json` is the authority for icons, hover, names, glyphs, placeholder, group-name fonts and the selected clip. Its box fields are superseded by `out/lane-states-box.json` and are marked so in the file.
- The scripts that actually ran are listed with their sha256 in `c-round-162/tools-sha256.txt`. The other copies in `tools/` were not used.

## AN-REVIEW (C read the diff itself)
- **Components:**
  - ArrangementLane: N0–N3.
  - ArrangementGroupHeader: G0–G2. The `before:content` pair and `data-fold-glyph` are removed, the chevron children are added, the name class goes `gap-1` → `gap-1.25`, and the mark is `Layers size-2.5 shrink-0 text-muted`, stroke 2.4.
  - ArrangementClip: C0–C1. The header class goes `gap-1` → `gap-0.75`, and the marks are `Film`/`GripVertical`.
  - Nothing else changed: handlers, aria, title, testids and the Mute/Solo `before:content-['M'/'S']` are untouched.
- **strings.ts:** one non-exported `STUDIO_VIDEO_IMPORT_LABEL = 'Your own video'` and exactly 2 values (`videoImportLabel`, `videoEmptyHint` template). `videoImportTitle` and l.735/736 are unchanged.
- **Tests:** only the listed edits plus LV1/LGH1/LC1/LG2. Every removed assertion has a 1:1 or stronger replacement (glyph text → `svg.lucide-*` count + `textContent ''`; `dataset.foldGlyph` → chevron class + `hasAttribute('data-fold-glyph') === false`; `'group:▣Group 1'` → `'group:Group 1'`).
- **`expect(` counts** (C recount): strings 523→527, track-layout 234→237, lane-strings-ui 17→45, track-group-collapse-ui 139→163, track-groups-ui 123→123, clip-strings-ui 12→24. No file drops.
- **Docs:** doc 130 changes only on l.4 (Completed …f08c7ce). Doc 131 exists with the D3 sections (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები, ტესტირება, TODO) and states both closures and the TODOs (V-3c-3..5, Q-V3-ICON-SIZE, `.replace('▣','')` no-ops, M1/M3/M4).
- **Forbidden content:** no new `style=`, CSS file, hex, arbitrary `[...]` value or surface change.

## ICON-V3C2 table (each lane fold is the same; the music lane is listed per state)
| VP | State | Site | Lucide class | Box px | stroke-width | stroke = expected | Centre dx/dy | AX name |
|---|---|---|---|---|---|---|---|---|
| 1440 | S0 | laneFold (video) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1440 | S0 | laneFold (music) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Music |
| 1440 | S0 | importFull (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | n/a | Your own video |
| 1440 | S0-folded | laneFold (video) | lucide-chevron-right | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1440 | S0-folded | laneFold (music) | lucide-chevron-right | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Music |
| 1440 | S0-folded | importCompact (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | 0/0 | Your own video |
| 1440 | S1 | laneFold (video) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1440 | S1 | laneFold (music) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Music |
| 1440 | S1 | importFull (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | n/a | Your own video |
| 1440 | S1 | groupFold | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold group — Group 1 |
| 1440 | S1 | groupName | lucide-layers | 10×10 | 2.4 | yes rgb(163, 155, 142) | n/a | Group 1 — group, selected |
| 1440 | S1 | clip-video (video) | lucide-film | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1440 | S1 | clip-audio (music) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1440 | S1 | clip-audio (stems) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1440 | S1 | clip-audio (sfx) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1440 | S1-group-collapsed | laneFold (video) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1440 | S1-group-collapsed | importFull (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | n/a | Your own video |
| 1440 | S1-group-collapsed | groupFold | lucide-chevron-right | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold group — Group 1 |
| 1440 | S1-group-collapsed | groupName | lucide-layers | 10×10 | 2.4 | yes rgb(163, 155, 142) | n/a | Group 1 — group, folded, 2 clips, selected |
| 1440 | S1-group-collapsed | clip-video (video) | lucide-film | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1440 | S1-group-collapsed | clip-audio (sfx) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1280 | S0 | laneFold (video) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1280 | S0 | laneFold (music) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Music |
| 1280 | S0 | importFull (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | n/a | Your own video |
| 1280 | S0-folded | laneFold (video) | lucide-chevron-right | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1280 | S0-folded | laneFold (music) | lucide-chevron-right | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Music |
| 1280 | S0-folded | importCompact (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | 0/0 | Your own video |
| 1280 | S1 | laneFold (video) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1280 | S1 | laneFold (music) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Music |
| 1280 | S1 | importCompact (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | 0/0 | Your own video |
| 1280 | S1 | groupFold | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold group — Group 1 |
| 1280 | S1 | groupName | lucide-layers | 10×10 | 2.4 | yes rgb(163, 155, 142) | n/a | Group 1 — group, selected |
| 1280 | S1 | clip-video (video) | lucide-film | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1280 | S1 | clip-audio (music) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1280 | S1 | clip-audio (stems) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1280 | S1 | clip-audio (sfx) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1280 | S1-group-collapsed | laneFold (video) | lucide-chevron-down | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold — Video |
| 1280 | S1-group-collapsed | importFull (video) | lucide-plus | 10×10 | 2.4 | yes rgb(201, 164, 106) | n/a | Your own video |
| 1280 | S1-group-collapsed | groupFold | lucide-chevron-right | 12×12 | 2 | yes rgb(163, 155, 142) | 0/0 | Fold or unfold group — Group 1 |
| 1280 | S1-group-collapsed | groupName | lucide-layers | 10×10 | 2.4 | yes rgb(163, 155, 142) | n/a | Group 1 — group, folded, 2 clips, selected |
| 1280 | S1-group-collapsed | clip-video (video) | lucide-film | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |
| 1280 | S1-group-collapsed | clip-audio (sfx) | lucide-grip-vertical | 10×10 | 2.4 | yes rgb(236, 230, 218) | n/a |  |

The table covers sizes, strokes and centring. The other ICON-V3C2 checks also pass:
- **Lucide class and direction:** every site has exactly one svg with `aria-hidden="true"` and the R2 lucide class. The chevron direction follows `aria-expanded`.
- **Hover:**
  - The fold stroke changes muted `rgb(163,155,142)` → foreground `rgb(236,230,218)` and follows the host colour (lane folds and the group fold).
  - Plus stays brand `rgb(201,164,106)` on hover.
  - Layers = the muted token, while its host is foreground.
  - The clip marks follow the header colour. The selected clip is `bg-brand`, and its stroke is brand-foreground `rgb(14,13,12)`.
- **Glyph scan:** there are 0 of `▶◀×▾▸■＋⌫▣⠿` in the track headers, the group header and the clips, both in text and in aria-label/title.
- **Accessible names:**
  - Lane folds read `Fold or unfold — <Track>`.
  - The group fold reads `Fold or unfold group — Group 1`.
  - The group name reads `Group 1 — group[, folded, 2 clips][, selected]`.
  - The full and compact import both read `Your own video`.
- **C-R154-02 closure:** the group name button has no U+25A3 text node. `CSS.getPlatformFontsForNode` lists only **Instrument Sans** (glyphCount 7) at both viewports, in S1 and S1-group-collapsed. There is no DejaVu.
- **Placeholder:** it reads exactly `No video — use “Your own video” or drop a file here` (S0 and S0-folded, both viewports). This closes GATE139-EMPTY-VIDEO-FORMATTER, with LG2 also green.
- **Fonts:** every session had fonts ready, 0 non-200 font responses and 0 failures.

## RV1-V3C2 (d6 sha256 3abc88fe… unchanged; reference `c-round-161/out/d6/d6-*-r1.json`)
Every rename key in `b-round-161-r162-d6-key-renames.json` was found where its `where` field says it is: the `button:` key at 1440 S0/S1/S2 and 1280 S0, the `al:` key at 1280 S1/S2, and the 4 clip keys in S1/S2.
| VP | State | Ref/Cur keys | Renames applied | Missing | Added | Max delta px | Focus keys (headers, group, clips, import) max |
|---|---|---|---|---|---|---|---|
| 1440 | S0 | 111/111 | 1 | 0 | 0 | 0 | 10 keys, max 0 |
| 1440 | S1 | 122/122 | 5 | 0 | 0 | 0 | 19 keys, max 0 |
| 1440 | S2 | 131/131 | 5 | 0 | 0 | 0 | 19 keys, max 0 |
| 1280 | S0 | 103/103 | 1 | 0 | 0 | 0 | 10 keys, max 0 |
| 1280 | S1 | 121/121 | 5 | 0 | 0 | 0 | 19 keys, max 0 |
| 1280 | S2 | 130/130 | 5 | 0 | 0 | 0 | 19 keys, max 0 |

## LANE-STATES-BOX (baseline: B's `v3c2-probe-final.json` `before`, same `measure()` and preparation)
| VP | State | Compared | Max delta px | >1 px | Movers (>0.01 px) | Renamed pairs (delta) | Missing (allowed glyph spans) | Added svg / label span | Unexpected |
|---|---|---|---|---|---|---|---|---|---|
| 1440 | S0 | 215/215 | 0 | 0 | none | div:VideoYour own videoM 0; button:Your own video 0; div:VideoYour own video 0 | 0 | 5 / 1 | 0 |
| 1440 | S0-folded | 205/205 | 0 | 0 | none | div:VideoMSNo video — us 0 | 0 | 5 / 0 | 0 |
| 1440 | S1 | 259/264 | 0.344 | 0 | span:beeps-6s-h264-aac.mp4 0.234; span:Group 1 0.344; span:CZABA hero — საჯარო preview 0.203; span:ღამის პულსი · პულსი 0.203; span:Soft impact 0.203 | div:VideoYour own videoM 0; button:Your own video 0; div:VideoYour own video 0 | 5 | 11 / 1 | 0 |
| 1440 | S1-group-collapsed | 191/194 | 0.344 | 0 | span:beeps-6s-h264-aac.mp4 0.234; span:Group 1 0.344; span:Soft impact 0.203 | div:VideoYour own videoM 0; button:Your own video 0; div:VideoYour own video 0 | 3 | 7 / 1 | 0 |
| 1280 | S0 | 203/203 | 0 | 0 | none | div:VideoYour own videoM 0; button:Your own video 0; div:VideoYour own video 0 | 0 | 5 / 1 | 0 |
| 1280 | S0-folded | 194/194 | 0 | 0 | none | div:VideoMSNo video — us 0 | 0 | 5 / 0 | 0 |
| 1280 | S1 | 247/252 | 0.344 | 0 | span:beeps-6s-h264-aac.mp4 0.234; span:Group 1 0.344; span:CZABA hero — საჯარო preview 0.203; span:ღამის პულსი · პულსი 0.203; span:Soft impact 0.203 | none | 5 | 11 / 0 | 0 |
| 1280 | S1-group-collapsed | 180/183 | 0.344 | 0 | span:beeps-6s-h264-aac.mp4 0.234; span:Group 1 0.344; span:Soft impact 0.203 | div:VideoYour own videoM 0; button:Your own video 0; div:VideoYour own video 0 | 3 | 7 / 1 | 0 |

- **Renamed pairs:** the full-import button key loses its leading space. The text-keyed video row and inner header div lose the space after the removed ＋. Their boxes are identical (0 px).
- **Re-keyed video row:** `[data-track-id=video]` compared with the baseline row is 0 px. The `arrangement-track-header|track:video#1` testid key is 0 px.
- **(a)** Lane fold 20×20, compact import 20×20, group fold 24×24 (all states).
- **(b)** The full import is 107×22, and every track-name button is unchanged (0 px).
- **(c)** The clip header height is 20 and every clip box is unchanged (0 px).
- **Title spans:** group name 0.344, video title 0.234, audio titles 0.203 px (B predicted ≤ 0.35).

Sample keyed rows (1440 S1):
| VP/State | Key | Before x,y,w,h | After x,y,w,h | Max |
|---|---|---|---|---|
| 1440 S1 | arrangement-track-header|track:video#1 | 288,275,224,80 | 288,275,224,80 | 0 |
| 1440 S1 | button: Your own video|track:video#1 | 396,278,107,22 | 396,278,107,22 | 0 |
| 1440 S1 | arrangement-group-header|group#1 | 288,356,224,27 | 288,356,224,27 | 0 |
| 1440 S1 | arrangement-group-name|group#1 | 322,357.5,79,24 | 322,357.5,79,24 | 0 |
| 1440 S1 | arrangement-track-header|track:music#1 | 288,384,224,80 | 288,384,224,80 | 0 |
| 1440 S1 | arrangement-track-header|track:stems#1 | 288,465,224,80 | 288,465,224,80 | 0 |
| 1440 S1 | arrangement-track-header|track:sfx#1 | 288,546,224,80 | 288,546,224,80 | 0 |
| 1440 S1 | div:beeps-6s-h264-aac.mp4|clip@0.000#1 | 513,280,238,20 | 513,280,238,20 | 0 |
| 1440 S1 | div:|clip@0.000#1 | 513,300,238,50 | 513,300,238,50 | 0 |
| 1440 S1 | div:|clip@0.000#2 | 513,280,8,70 | 513,280,8,70 | 0 |
| 1440 S1 | div:|clip@0.000#3 | 743,280,8,70 | 743,280,8,70 | 0 |
| 1440 S1 | div:CZABA hero — საჯარო preview|clip@0.000#1 | 513,389,6012.89,20 | 513,389,6012.89,20 | 0 |
| 1440 S1 | div:|clip@0.000#4 | 513,409,6012.89,50 | 513,409,6012.89,50 | 0 |
| 1440 S1 | div:|clip@0.000#5 | 513,389,8,70 | 513,389,8,70 | 0 |

## FUNC-SMOKE-LANE (identical at 1440 and 1280)
- **Lane fold:**
  - Clicking the chevron centre folds Music: the row drops 81→36 px at 1440 (80→36 at 1280), `aria-expanded=false`, and the chevron points right. A second click unfolds it.
  - Space on the focused fold does the same twice, and transport does not start.
- **Video import:**
  - With the video lane folded, clicking the centre of the **compact Plus** opened a real `filechooser`. Choosing `beeps-6s-h264-aac.mp4` placed one clip, 0→6.000 s. Ctrl+Z removed it.
  - The **full** button's Plus centre also opened a chooser and placed a 6.000 s clip.
- **Group fold:** clicking the chevron hides Music and Stems, shows the overview band and turns the chevron right. A second click restores them. With the group selected, `U` collapses it and `U` again expands it.
- **Group name:** with the group not selected, a click on the **Layers** centre selects it (the aria-label gains `, selected`).
- **Clip move by the icon (Snap off, 40 px/s):**
  - A drag from the **GripVertical** centre moved SFX from 4 → 5.5 s (error 0 px). The Undo title became "Undo: Move clip". One Ctrl+Z restored 4 s and the previous title "Undo: Group Tracks". Redo restored 5.5 s.
  - A drag from the **Film** centre moved the video from 0 → 1 s (0 px). One Ctrl+Z restored 0, and Redo restored 1.
- **Audio:** Play with the moved clips gives a real output tap peak of **0.7624**, with the playhead at 2.48 s after 2.5 s.

## G162-3
- `/studio-lab` is anonymous: `auth_user` null, 0 cookies, the workspace is shown and the demo badge "Demo collection — no sign-in required" is present.
- `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`, at 1440 and 1280.
- `GET /api/studio-token` returns **401** `{"error":"Please sign in to access Studio."}`.
- Fake-Bearer 403: **BLOCKED**, backend unavailable in cloud.
- 0 forbidden requests, 0 auth headers, 0 errors and 0 hydration messages.

## Ableton
- **Requirement:** PASS (ICON-V3C2, RV1-V3C2, LANE-STATES-BOX, FUNC-SMOKE-LANE).
- **Parity:** not applicable. This is a CZABA brand decision under visual-direction-a § icons, and Layers/Film/GripVertical are B's R2 rulings. No claim is made about how Live draws these.

## Notes for B (no findings)
- The video import `<input>` is `multiple` (chooser `isMultiple=true`). This is pre-existing and not touched this round. Choosing one file places one clip.
- At 1280 the S1 header shows the compact import (nested group indent), and S1-group-collapsed shows the full one. This matches the f08c7ce baseline.
- A's review Lows go to the polish pass: the dead `text-sm leading-none` / `text-xs` classes on the icon-only buttons, the stale `.replace('▣','')` no-ops, and docs 070/115 describing the old glyphs.
- **Closures if root publishes:** C-R154-02 and GATE139-EMPTY-VIDEO-FORMATTER.
- **Outcome per task §7 "C PASS":** V-3c-2 → მზადაა. Round 163 = V-3c-3, unless the regression round (due from 2026-10-27) comes first.
