# C — Round 156 verification: V-2b-3a, sentence timecodes go mono (D-29z121)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (round 156) · **Verdict: PASS** · `browserVerified` = `realVerified` = **true** · 0 bugs

I used real Playwright Chromium with a fresh context per session on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720. `envStatus`: store 200 (`env-status.json`, 2026-10-25T05:45:05Z). Tools are in `c-round-156/tools/`; the round's scripts are `c156.cjs`, `g156-3.cjs` and `sum156.py`. `c156.cjs` was adapted from `c155.cjs`; I also used `g156-3.cjs` (from `g155-3.cjs`) and `sum156.py`. Raw output is in `c-round-156/out/` and screenshots are in `c-round-156/shots/`.

## Sessions
| Run | Status | Note |
|---|---|---|
| c156-1440-r1 | **INVALID (ENV-FIRST-LOAD)** | A cold Vite first load caused "Invalid hook call" and the hydration replace, so every section failed. This is the same symptom as round 155 r1, and it used the one allowed replacement. Files are kept as `*-INVALID-envfirstload.*`. |
| c156-1440-r2 | valid | 9 font responses, all 200, 0 failed. The FUNC-SMOKE cross-lane step was invalid because of my harness (see the note below). Every other row is valid. |
| c156-1280-r1 | valid | Fixed harness. 9 font responses, all 200. |
| c156-1440-r3 | valid | Fixed harness. 9 font responses, all 200. |
| g156-3 | valid | Fresh contexts with no credentials. |

**Harness note (r2, not an app bug):** I dragged the SFX clip with dt = 0 onto Stems at 4–6 s, which is occupied. The app correctly answered "Move clip: nothing changed — the Undo history is unchanged." My script then pressed Ctrl+Z anyway, which undid the earlier "Add — Soft impact" as it should. I fixed the step to dt = 20 s (free space), with Ctrl+Z only when the table changed, and re-ran it in r3 and 1280-r1.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T156-TARGETED | **PASS** | I re-ran the 34 files in `a-round-156/vitest-files.txt`: 576/576, the same as A. ST-TP1/2/3, TH11, WSU3/4/5 and the extended CSU1 are present and green, and TH10 is green. `out/vitest.json` |
| SOURCE-SCOPE | **PASS** | HEAD is `4c07d5f`. The frozen 963 match at start and at end, and A's `end-sha256.txt` matches 12/12. `git status` shows exactly the 10 ` M` and 2 `??` paths. The protected diff vs `4c07d5f` is empty (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, the auth files, `AuthContext`, `StudioContext`, `root.tsx`, `app.css`, `studio-lab.tsx`, `ArrangementExportDialog.tsx`, `package.json`; no Modal, Cookie or download-routes path in the diff). My start and end hashes of all 975 files are byte-identical, so no source changed during my phase (`out/c-start-sha256.txt`, `out/c-end-sha256.txt`). |
| AN-REVIEW | **PASS** | I read `git diff 4c07d5f` myself. S1: `StudioTimeTextPart` and `studioTimeTextParts` with 7 + 6 parts and stable ids. `rangeReadout` and `selectedClipDetailText` are now joins, and no other key or text changed. C1 is a fragment with exactly one span class and keyed `Fragment`s. W1/W2 add the two imports and two replacements; `title`, `{' '}`, the all-lanes span and the hint are unchanged. L1 adds one span, L2 adds two, and the N6 ghost is untouched. K1 adds two spans. V1 adds the class only, and `ref` is kept. Every new span is exactly `font-mono font-normal tabular-nums`. The test diffs remove 0 lines, so the TH1–TH10 and CSU1 lines are unchanged. Doc 125 changed only its status line. Doc 126 is in Georgian and has every TEMPLATE section (კონტექსტი … TODO). A grep confirms the required D2 content: R1–R5 by label, R6 as B-R155-EXPORT-ZERO (the „R6“ label itself is absent, info only), the 6 sites, m143–m146, and the TODO items V-2b-3b, css2 and FONT-FAIL. *Info:* T1 added one import line inside the existing `../strings` import block (not a pure append). No existing line changed. |
| TEXT-BYTES (a)–(f) | **PASS** (both viewports, 3 valid sessions) | See the table below. |
| MONO-STYLE-N7…N12 | **PASS** | See the tables below. |
| LAYOUT-FIT | **PASS** (no new truncation or wrap) | See the table below. |
| PLEX500-INVENTORY-S | **PASS** | 1440 r2 and r3. See below. |
| FUNC-SMOKE-S | **PASS** (both viewports) | See below. |
| G156-3 | **PASS**; fake-Bearer 403 **BLOCKED** | `/studio-lab` loads anonymously with the workspace and the "Demo collection — no sign-in required" badge. `/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]`, at 1440 and at 1280. `GET /api/studio-token` returns 401 `{"error":"Please sign in to access Studio."}`. The page made 0 forbidden requests, sent 0 Authorization headers, and logged 0 errors and 0 hydration messages. The fake-Bearer 403 check is blocked because the backend is unavailable in the cloud. `out/g156-3.json` |
| PX-NET / REG-HYD | **PASS** | Every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. The only noise was the 2 expected cart messages. The hook/hydration errors appeared only in the invalid cold-Vite r1. |

### How each state was made
- **(a) and (e):** a real-mouse body drag on the hero clip (Music) from 3 s to 5 s (`X.rangeDrag`). **Info for B (wording):** the task says "ruler drag 3 s → 5 s", but a ruler drag in this build is view navigation (scroll/zoom, `ArrangementRuler.tsx` `rulerDragView`) and never makes a time selection. I used the body drag, which is also the CSU1 gesture. The footer readout is the same `<p>` either way.
- **(d):** Ctrl+Shift+L on that range. Status: "Selection on all tracks: 00:03.000 — 00:05.000." The label renders only on the range's own track (`music`).
- **(b):** a click on the hero clip header (the longest title) and on Soft impact.
- **(c):** a real-mouse library drag of Soft impact held over SFX at 12 s (free) and at 4.5 s (occupied, `data-blocked="true"`). The blocked hold was cancelled with Escape before release, and the table was unchanged.
- **(f):** video import of `media/clip-4s-vp9-opus.webm` (synthetic test media, local only; readyState 4, duration 4.008 s, on the video lane at 0 s). The playhead was then seeked to 8 s (a gap).

### TEXT-BYTES (identical at 1440 r2, 1440 r3 and 1280 r1)
| Site | Reference (R5 dashes) | Measured `textContent` | Result |
|---|---|---|---|
| (a) range readout, prefix | `Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · ` (U+2014) | `…· length 00:02.000 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time` | prefix equal |
| (a′) with all tracks, prefix | `… · length 00:02.000 · all tracks · ` | same + hint | prefix equal |
| (b) selected clip, hero | = its `title` | `Clip: CZABA hero — საჯარო preview · start 00:00.000 · length 02:30.372 · source offset 00:00.000` | equal, and `textContent === title` |
| (b) selected clip, Soft impact | `Clip: Soft impact · start 00:04.000 · length 00:02.000 · source offset 00:00.000` | the same | equal, and `=== title` |
| (c) drop ghost, free | `00:12.000` | `00:12.000` | equal |
| (c) drop ghost, occupied | `00:04.500 · No room here` | the same | equal |
| (d) all-tracks lane label | `00:03.000 – 00:05.000 · 2.000 s · all tracks` (U+2013) | the same | equal. The Biome `· {seconds}` reformatting gives identical bytes in the browser. |
| (e) clip badge | `00:03.000 – 00:05.000 · 2.000 s` (U+2013) | the same | equal |
| (f) video gap | `No video · 00:08.000` | the same | equal |

### MONO-STYLE-N7…N12 (identical at 1440 and 1280)
Every mono span below has computed family `"IBM Plex Mono"`, weight **400** and `font-variant-numeric: tabular-nums`. CDP `getPlatformFontsForNode` returns **"IBM Plex Mono [web]"** (never "Medium"). Each span is 63 px wide.

| N | Site | Mono spans (texts) | Sans container: family / weight / CDP |
|---|---|---|---|
| N7 | (a) footer range `<p>` | 3: `00:03.000`, `00:05.000`, `00:02.000` | Instrument Sans **400** (the round-154/155 footer weight); Instrument Sans [web] + Plex Mono [web]. The all-lanes span (class "") and the hint (`text-accent`, 400) are not mono. |
| N8 | (b) selected-clip `<p>` | 3: start, length, offset | Instrument Sans 400; Instrument Sans [web] + Noto Sans Georgian [web] (title) + Plex Mono [web] |
| N9 | (c) drop-ghost label span | 1: start | Instrument Sans **500** (`font-medium` container); the "· No room here" glyphs are Instrument Sans [web] |
| N10 | (d) lane range label | 2: min, max | Instrument Sans **500**; Instrument Sans [web] |
| N11 | (e) clip badge | 2: start, end | Instrument Sans **500**; Instrument Sans [web] |
| N12 | (f) video gap `<p>` | 1: time | Instrument Sans 400; Instrument Sans [web]. During playback in the gap, 4 samples 350 ms apart read 00:08.290 → 00:09.340 (4 distinct values, class and weight kept), so the imperative `ref` update still works. The gap hides inside the video (at 1 s). |

The status announcement stays sans as R2 requires: "Move to track — Stems: start 00:24.000.", Instrument Sans 400, 0 mono elements inside.

### LAYOUT-FIT
"Natural width" is measured in the page on a hidden clone of the same element, once as rendered (mono) and once with the mono class stripped (the sans equivalent).

| Site | VP | clientWidth / scrollWidth | lines | Natural width mono vs sans | Visible in clip ancestor |
|---|---|---|---|---|---|
| (a) range readout | 1440 / 1280 | 654 / 654 | 1 | 654 vs 630 (+24) | full |
| (a′) range, all tracks | 1440 / 1280 | 707 / 707 | 1 | 707 vs 683 (+24) | full |
| (b) selected clip, hero (longest title) | 1440 | 1416 / 1416 | 1 | 551 vs 527 | full, no truncation |
| (b) selected clip, hero | 1280 | 1256 / 1256 | 1 | 551 vs 527 | full |
| (b) Soft impact | 1440 / 1280 | 1416 / 1416 · 1256 / 1256 | 1 | 436 vs 412 | full. Round 154 measured the same line at the same 1416 / 1256 and 1 line. |
| (c) ghost, free | both | 71 / 71 | 1 | 71 vs 63 | full |
| (c) ghost, occupied | both | 152 / 152 | 1 | 152 vs 144 | full |
| (d) lane label | both | 248 / 248 | 1 | 248 vs 242 (+6) | full inside the timeline scroller |
| (e) clip badge | both | 191 / 191 | 1 | 191 vs 185 (+6) | full inside the clip (`overflow-hidden`) |
| (f) video gap | both | 160 / 160 (the box) | 1 | 130 vs 122 | full inside the 160 px video box |

There is no new truncation, no new wrap and no unreachable content. Mono adds +6 to +24 px per site. The footer stays on one line with the delete hint. Shared limit, info only: the lane label and the ghost label sit over the clip header title. This overlay existed before this round (z-10 over the clip). This round makes it only 6–8 px wider (`shots/c156-alltracks-*.png`, `shots/c156-ghost-blocked-*.png`).

### PLEX500-INVENTORY-S (1440, r2 and r3)
**r3 is the canonical single-session evidence, and r2 corroborates it.** In r2, the harness Ctrl+Z had removed the SFX clip before the menu, Export and video-gap states. The results are the same either way.
- **States scanned while active:** S0, (a)+(e) range, (d) all tracks, (b) selected clip, (c) free ghost, (c) blocked ghost, marker menu (open = 1), grid menu (open = 1), Export dialog and (f) video gap.
- **Plex Mono at weight ≥ 500:** 0 visible elements in every state. Every visible Plex Mono element is weight 400 (50 to 218 per state).
- **`document.fonts`:** IBM Plex Mono 500 is `unloaded`. The loaded faces are IBM Plex Mono 400, Instrument Sans 400/500/600 and Noto Sans Georgian 400/500.
- **Visible elements at weight ≥ 600:** none in S0, the marker menu or the grid menu. The only one is the Export `h2` "Export" at 600 (the protected `ModalTitle`).

### FUNC-SMOKE-S (1440 r3 and 1280 r1; 1440 r2 for every step except the cross-lane drag)
- **Play 2 s:** the playhead goes 0 → 1.97, and the real output tap peaks at 0.1266.
- **Range Delete → Ctrl+Z:** "⌫ Deleted 00:03.000 — 00:05.000 on all tracks; the gap remains." The table became `music@0+3 music@5+145.372 sfx@5+1 stems@2+1 stems@5+13`. Then "Undo: Delete time selection (all tracks)" restored the table exactly. *Info:* the time selection itself is not re-shown after the undo. This code is unchanged this round, so it is not a finding. I have no Live source checked for this.
- **Cross-lane drag:** "Move to track — Stems: start 00:24.000." Then "Undo: Move to track — Stems" restored the table.
- **Library drop with ghost:** the ghost showed `00:12.000`, the drop added `sfx@12`, and "Undo: Add — Soft impact" restored the table. The blocked hold added nothing.
- **Lane M:** peak 0.1266 → muted 0 → "Undo: Mute — Music" → 0.1266.

## Ableton parity
Not applicable. Monospaced timecodes are a CZABA brand decision (`visual-direction-a.md` § „ტიპოგრაფია“), and no Ableton source was used or needed. The requirement itself is verified by TEXT-BYTES and MONO-STYLE.

## For B
- **0 bugs.** Outcome §7: C PASS → root may publish round 156 (12 paths). V-2b-3a → მზადაა. Round 157 = V-2b-3b. Regression is due on or after 2026-10-27.
- **Info:**
  - The TEXT-BYTES (a) wording "ruler drag" does not match the build: a ruler drag navigates the view. Future tasks should say "clip-body or lane drag".
  - The time selection is not restored by Ctrl+Z after a range Delete (pre-existing; Live behaviour unconfirmed).
  - The lane and ghost labels overlay the clip title (pre-existing).
  - T1 inserted one import line in `strings.test.ts`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke.
