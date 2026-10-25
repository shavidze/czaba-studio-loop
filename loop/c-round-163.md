# C round 163 — V-3c-3a: video dock icons (GripVertical, Maximize2, X) and the "Esc or Close" sentences

**Verdict: PASS.** `browserVerified` and `realVerified` are true. 0 bugs. One row is blocked: the fake-Bearer 403, because the backend is not available in the cloud. The env check was `store: 200` (round 163, 11:39:50Z). HEAD is `9a83018`.

I ran everything below myself. I did not rely on A's claims. Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context for each session, at 1440×900 and 1280×720. Each session waited for `document.fonts.ready`, and all fonts loaded with 0 non-200 font responses.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T163-TARGETED | PASS: 200/200, the same as A. LVD1, LVD2 and LG3 are present and pass. | `c-round-163/out/vitest.json` |
| SOURCE-SCOPE | PASS. HEAD is `9a83018`. The 975 frozen files are OK at start and end. `a-round-163/end-sha256.txt` matches. `git status` is 6 ` M` plus doc 132 `??`. The protected diff is empty. The start and end hashes from my phase are identical. | `out/c-start-sha256.txt`, `out/c-end-sha256.txt` |
| AN-REVIEW | PASS. The dock diff is exactly D0–D3 (the import plus 3 children). `strings.ts` changes only the 2 R3 values. The tests change only l.129/131 and l.839/841, plus LVD1, LVD2 and LG3. `expect(` counts: 527→531, 168→181, 27→44, none dropped. Doc 131 changes only D4. Doc 132 has every TEMPLATE section. There is no new style, hex, arbitrary value, or logic change. | `git diff` read by C |
| ICON-V3C3A | PASS at both viewports in 4 states (table below). | `out/c163-{1440,1280}-run1.json`, `shots/icon-*` |
| RV1-V3C3A | PASS. One d6 run per viewport; d6 sha256 `3abc88fe…` is unchanged. S0/S1/S2: 0 missing or added keys, max delta **0 px**. The rename was applied in each contrast section with 0 collisions. Contrast entries are unchanged. | `out/rv1-v3c3a.json` |
| DOCK-STATES-BOX | PASS. Every key matches B's `before` arrays (148/151/155 at 1440, 137/140/144 at 1280). 0 missing, 0 added, max delta **0.00 px**. All buttons are 24×24, and the D2 box position equals the baseline. | the same JSON, `box` section |
| FUNC-SMOKE-DOCK | PASS at both viewports (details below). | `func` section, `shots/func-*` |
| G163-3 | PASS: `/studio-lab` is anonymous (no `auth_user`, 0 cookies) with the demo badge. `/studio/middle-east` shows "Sign in required" at 1440 and 1280, with no workspace and 0 `audio[src]`. `/api/studio-token` returns 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud). | `out/g163-3.json` |
| PX-NET / REG-HYD | PASS: in 10 measured sessions, 2 d6 sessions and the G session, 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerrors. Only the expected cart noise appeared (2 per session). | `netDetail` |

**Invalid run:** the first cold warm-up load hit ENV-FIRST-LOAD-LUCIDE ("Invalid hook call"). It was replaced once, and warm-2 was clean. It was not a measurement.

## ICON-V3C3A table (identical at both viewports except position)
| State | Site | svg | class | aria-hidden | box | stroke-width | stroke rest / hover | centre Δ | CDP name | title |
|---|---|---|---|---|---|---|---|---|---|---|
| D0, D1 | expand | 1 | lucide-maximize-2 | true | 10×10 | 2.4 | muted rgb(163,155,142) / foreground rgb(236,230,218) | 0,0 | Expand video | Expand video |
| D2, D2-lib-opened | drag | 1 | lucide-grip-vertical | true | 10×10 | 2.4 | muted / foreground | 0,0 | Move the video (arrow keys: 16 px) | Move the video |
| D2, D2-lib-opened | expand | 1 | lucide-maximize-2 | true | 10×10 | 2.4 | muted / foreground | 0,0 | Return the video to the compact view | (same) |
| D2, D2-lib-opened | close | 1 | lucide-x | true | 10×10 | 2.4 | muted / foreground | 0,0 | Close the expanded video | Close (Esc) |

- In D0 and D1, drag and close are absent from the DOM.
- No ⠿⤢✕ appears in the dock's text, `aria-label` or `title`, compact or expanded.
- Each button's `textContent` is `''`.
- Positions: at 1440, expand is at (1400,96) compact; in D2 the buttons are at x 196/224/252, y 507. At 1280, expand is at (1240,134) compact; in D2 the buttons are at x 113.33/141.33/169.33, y 373.5.

## RV1-V3C3A table (d6 vs `c-round-162/out/d6/d6-{vp}-r1.json`, after 1 rename)
| Viewport | State | ref keys | current keys | missing | added | max Δ px | video-expand / video-dock Δ |
|---|---|---|---|---|---|---|---|
| 1440 | S0 | 111 | 111 | 0 | 0 | 0 | 0 / 0 |
| 1440 | S1 | 122 | 122 | 0 | 0 | 0 | 0 / 0 |
| 1440 | S2 | 131 | 131 | 0 | 0 | 0 | 0 / 0 |
| 1280 | S0 | 103 | 103 | 0 | 0 | 0 | 0 / 0 |
| 1280 | S1 | 121 | 121 | 0 | 0 | 0 | 0 / 0 |
| 1280 | S2 | 130 | 130 | 0 | 0 | 0 | 0 / 0 |

- **Contrast sections:** contrastS0 has 170/170 entries at 1440 and 144/144 at 1280; contrastS1 has 188/188 at 1440 and 177/177 at 1280. Each has 0 missing, 0 added and 0 changed (fg, bg, ratio, pass and box), and 0 collisions.
- d6 states S0 to S2 never show the float buttons, so the drag and close deltas come from DOCK-STATES-BOX D2.

## DOCK-STATES-BOX table (raw rects vs B's probe `before` at `9a83018`)
| Viewport | State | base keys | current keys | missing / added | max Δ px | buttons (w×h) | dock section | video box |
|---|---|---|---|---|---|---|---|---|
| 1440 | D0-empty | 148 | 148 | 0 / 0 | 0.00 | expand 24×24 | 288,84,1152×107 Δ0 | 1268,92,160×90 Δ0 |
| 1440 | D1-video | 151 | 151 | 0 / 0 | 0.00 | expand 24×24 | Δ0 | Δ0 |
| 1440 | D2-expanded | 155 | 155 | 0 / 0 | 0.00 | drag, expand, close 24×24 (x 196/224/252, y 507) Δ0 | Δ0 | float 8,503,272×153 Δ0 |
| 1280 | D0-empty | 137 | 137 | 0 / 0 | 0.00 | expand 24×24 | 288,122,992×107 Δ0 | 1108,130,160×90 Δ0 |
| 1280 | D1-video | 140 | 140 | 0 / 0 | 0.00 | expand 24×24 | Δ0 | Δ0 |
| 1280 | D2-expanded | 144 | 144 | 0 / 0 | 0.00 | drag, expand, close 24×24 (x 113.33/141.33/169.33, y 373.5) Δ0 | Δ0 | float 8,369.5,189.33×106.48 Δ0 |

**R3 layout consequence:** the longer "Esc or Close" sentence did not move the status line. In D2, `arrangement-status` is 12,838,1416×16 at 1440 and 12,658,1256×16 at 1280, a 0 px delta from the baseline at both viewports.

## FUNC-SMOKE-DOCK (both viewports; every pointer action started on the svg centre)
- **Expand:** clicking the Maximize2 svg expanded the video. The placeholder reads "Video expanded", all 3 buttons show, and the status reads exactly "…Esc or Close brings it back."
- **Library-opened sentence:** with the library collapsed first (40 px), the status is exactly the R3 `expandedLibraryOpened` text. After Esc, the library collapsed again.
- **No drag from the actions:** a 60 px drag starting on the X svg (the real hit lands on its `<path>`), and one starting on the Maximize2 svg: the box did not move, during or after the drag, and it stayed floating.
- **Drag:** starting on the GripVertical svg with a drag of (+100, −60), the box moved by exactly (100, −60). Focus was on the drag button during the press and after the release. Then ArrowRight moved it +16 px.
- **Real video and audio:** expanded, after Home and Play, the active `<video>` `currentTime` advanced 1.003 s (1440) and 1.000 s (1280) over 1.00 s of wall time. The real output tap peak was 0.555.
- **Close:** clicking the X svg returned the video to compact, and focus went to the expand button. Esc returns it. Maximize2 in the return state (aria "Return the video to the compact view") also returns it. The `<video>` nodes are the same objects throughout, so nothing remounted.

## Ableton
- **Requirement:** PASS.
- **Parity:** not applicable. This is a CZABA brand decision under `visual-direction-a.md` § icons. Live has no video dock like this. GripVertical and X are B's rulings (R2), not Ableton claims.

## For B (non-blocking notes)
- B's rename count is confirmed: the old key `arrangement-video-expand:⤢` appears 4 times per viewport in the reference (contrastS0, pixS0, contrastS1, pixS1). In the current run, each of those sections holds the new key `:Expand video` once, with no ⤢ left (pixS0 has 23 entries, pixS1 has 28, the same as the reference).
- The pre-existing contrast `pass=false` entries for the disabled toolbar items are unchanged from the round-162 reference.
- The user-vetoable decisions (R1 10 px in 24 px, R2 Minimize2 alternative, R3 wording) remain for Saba under Q-V3-ICON-SIZE.
