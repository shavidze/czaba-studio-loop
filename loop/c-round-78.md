# C round 78: SRW-16 stage 2b-3. Playhead seeks, the in-clip time range and the loop brace snap to markers (D-29z43)

**Verdict: PASS. browserVerified=true, realVerified=true. No bugs.** C did not edit `store/` and did not commit or push.
Env: `env-status.json` (round 78, store 200). The backend at :5199 is unavailable, which is expected in the cloud.

## Method
- Real Playwright Chromium (headless, installed), at **1440x900 and 1280x720**. Each group ran in a new context with no credentials, on `http://127.0.0.1:5173/studio-lab`. Input was real `page.mouse` moves and clicks and real key presses. Alt was held with `keyboard.down('Alt')` around the gesture.
- Tools: `c-round-78/tools/mt78.cjs` runs groups A–D, each on a fresh page. `g78.cjs` and `tok.cjs` cover G78-3. Raw results: `mt78-<vp>-<group>.json`, `meter-<vp>.json`, `g78-<vp>.json`, `token-api.json`, `vitest-targeted.txt`. Screenshots are in `c-round-78/shots/`. Evidence index: `c-browse.json`.
- **Fixture (actual values, identical at both viewports):** fresh load has 0 clips.
  - With Snap off, **Middle East** dropped on music at **0.350**. The project end is 01:41.702.
  - A ruler click at 6.375 read back as 6.375 (x=767), then M, Enter → marker **6.375**.
  - A ruler click at 12 read back as 12 (x=992), then M, Enter → marker **12.000**.
  - Then Snap on, grid **1 s**. Zoom 40 px/s, ruler left x=512, scrollLeft 0. One px = 25 ms.
- **Raw times** come from integer clientX: raw = (x − 512)/40.
  - Every measured ruler click is at y = ruler bottom − 4. That is below the 20 px playhead handle, which avoids the click-on-playhead trap A described.
  - Before each click, `elementFromPoint` was recorded; it was `arrangement-ruler` every time, never the handle. The playhead was also moved away first.
  - Drag expectations are computed from the actual pointer delta.
- Positions come from `arrangement-position`; loop edges from `arrangement-loop-times`; ranges from `arrangement-range`. Snapped values are checked at ±1.1 ms, raw values at ±1 px.

## Acceptance (both viewports, identical results unless stated)
| ID | Evidence (1440 / 1280) | CZABA req. | Ableton match |
|---|---|---|---|
| MT-RULER | Raw 6.45 / 6.10 / 6.45 / 6.45 / 6.45 with Snap on / on / off / on+Alt / off+Alt → **6.375 / 6.000 / 6.450 / 6.450 / 6.375**; hit = ruler | PASS | Alt bypass and grid snap confirmed (§6.10); marker candidate is a CZABA decision (unconfirmed in Live) |
| MT-SCRUB | Handle dragged 2.025 → raw 6.45 with a 400 ms pause. During the hover: position 6.375 and handle `aria-valuenow` 6.375. After release: 6.375. With Alt held: hover and release both 6.450 | PASS | CZABA decision |
| MT-LANE | Mid-lane click in the empty sfx lane (hit `arrangement-timeline-scroller`, not the height handle) at raw 6.45: Snap on → 6.375, Snap off → 6.450 | PASS | CZABA decision |
| MT-CLIPCLICK | Click in the Middle East waveform (75 % of clip height) at raw 6.45 → 6.375. Clip start stays 0.35, no range, Undo title unchanged | PASS | CZABA decision |
| MT-RANGE | 3.2 → 6.45: `00:03.000 — 00:06.375`. 6.40 → 6.45 (2 px, under `DRAG_THRESHOLD_PX` 3, so it is a click): no range, seek 6.375. **Extra discriminating** 6.20 → 6.45 (10 px; both edges resolve to 6.375): no range (T4). Snap on + Alt 3.2 → 6.45: `00:03.200 — 00:06.450`. No history entry | PASS | CZABA decision |
| MT-LOOP-RESIZE | Range 2–4 → Ctrl+L → `Loop 00:02.000 — 00:04.000`. End edge dragged to raw 6.45 → **2.000–6.375**, Undo title `Loop შეიქმნა` → `Loop-ის დიაპაზონი` (one entry). Ctrl+Z → 2.000–4.000 with the title back. End to raw 6.8 → **7.000** (grid nearer); Undo → 4.000 | PASS | CZABA decision |
| MT-LOOP-MOVE | Body moved to raw start 6.45 → **6.375–8.375** (length 2.000), one entry; Undo → 2–4. Raw start 4.425 / end 6.425 → **4.375–6.375**; Undo → 2–4 | PASS | CZABA decision |
| MT-AUDIO | Grid 10 s. Soft impact dropped on sfx at raw 6.45 → start **6.375** (2b-1). Solo sfx and video Mute, by real clicks. (1) Ruler raw 4.0 → **6.375**, Space: master meter −inf → 0.0 dB, onset at **132 ms and 63 ms** at 1440 (run 1 and the group-C re-run) and **60 ms and 70 ms** at 1280 (`meter-<vp>.json` holds the re-run values). (2) Alt ruler raw 4.0 → **4.000**, Space for 1.3 s (position 4.0 → 5.25): max **−60 (−inf) dB**, nothing above −15 dB. Solo/Mute were restored to false and grid to 1 s | PASS | CZABA decision |
| REG-SNAP-SEEK | Both markers deleted (focus + Delete → 0 markers). Ruler raw 6.45 → **6.000**. Range 3.2 → 6.45 → `00:03.000 — 00:06.000` | PASS | Confirmed (§6.10 grid cursor) |
| REG-LOOP-KEYS | Loop 2–4 focused, 5 × → : starts 3, 4, 5, 6, 7 (no stop at 6.375), length kept at 2. 5 × ← back to 2 | PASS | n/a (round 68 behaviour) |
| REG-CLIP-SNAP | Soft impact header drag +100 px → 9.000 (grid). Drag back to raw 6.45 → **6.375** (2b-1). Empty video lane active, Home, Ctrl+→ ×2 → 6.375, 12.000 (2b-2) | PASS (after a harness fix, see below) | Clips → locators confirmed (§6.7) |
| REG-MARKERS | Marker 12.000 dragged with Snap on to raw 6.45 → **6.000** (not 6.375); markers [6.000, 6.375]; Undo `Move Marker` → [6.375, 12.000]. Right-click menu (1 menu: rename / play from here / delete). Play from here → 12.15 → 12.75 (playing), then stopped | PASS | n/a |
| RU-DBLCLICK | 10 real `page.mouse.dblclick` per viewport on the ruler, alternating zoomed in (3 × `=`, 17.6 / 14.5 px/s) and scrolled (scrollLeft ≈ 455–608). Every attempt returned to Fit: **9 px/s at 1440 and 7.4 px/s at 1280, scrollLeft 0. 10/10 + 10/10** | PASS | n/a |
| T78-TARGETED | `npx vitest run $(cat a-round-78/targeted-files.txt)`: **26 files, 508 tests passed** (exit 0) | PASS | — |
| REG-HYD | Console in all 8 group runs: 0 hydration or `useLayoutEffect` warnings, 0 non-noise errors | PASS | — |
| G78-3 | Header link `/studio-lab` → workspace with the demo badge (both viewports). `/studio/middle-east` anonymous → "Sign in required", 0 workspace. Anonymous `/api/studio-token?product=middle-east&file=stem1.wav` → **401** (request API and in-page fetch). Page network: no `/api/recording-*`, `/api/download` or R2 host requests, and 0 Authorization headers; the only `/api/studio-token` requests were C's own probes. localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id` | PASS | — |
| G78-3 fake Bearer | 500 "Unable to prepare Studio access" instead of 403 | **BLOCKED: backend unavailable in cloud** | — |
| SOURCE-UNCHANGED | At start and end: HEAD `60006d4`, status 6 M + 3 ??, frozen 455/455 OK, protected 4/4 (cd68eb6e, 9f738237, 13914809, fa2cf0bc). A's hashes match: 0eb7b0e2, b9ce9cf9, 5fa05648, e8bbab9a, 56e7ef00, eb388458, fbd1e948, 8e6e5801, ddd6b35c. Doc 067 line 4 is B's exact line | PASS | — |

Gate rows (marked `gate`, not run by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

## Harness fixes (no app fault, disclosed)
- **REG-CLIP-SNAP, 1280x720, first run: FAIL from C's own fault.** I clicked the "empty video lane" at x=1312, which is outside the 1280 px viewport (`elementFromPoint` = null). The click did nothing, so sfx stayed active and selected, and Ctrl+→ stopped at 6.375 and then at the sfx clip end 8.375. That is correct 2b-2 behaviour for the sfx selection. I moved the click to 15 s (x=1112; hit `arrangement-video-dropzone`, active = video, selected = none) and re-ran group C at both viewports: PASS. MT-AUDIO, REG-MARKERS and REG-SNAP-SEEK passed in both runs. No tolerance was changed.
- In MT-SCRUB the grab point was the handle centre, x=593 (2.025 s). The playhead drag uses the absolute pointer time, so the expected value does not depend on it.

## Ableton (judged separately from the CZABA requirement)
- Live 12 §6.4, §6.7 and §6.10 do not say whether the cursor, the time selection or the loop brace snap to **locators**. MT-RULER/SCRUB/LANE/CLIPCLICK/RANGE/LOOP-* are a **CZABA decision** (FB-10, D-29z43); their Ableton match is unconfirmed, and C makes no claim that Live behaves the same way.
- Grid snap of the cursor and the Alt bypass are confirmed by the stored §6.10 text captures. Clips snapping to locators (REG-CLIP-SNAP) is confirmed by §6.7.
- No new web research was done; this relies on B's stored captures.

## Notes for B
- A's fixture used 12.000 for the second marker (§5 says 12.000; §1 said 20.000). C used 12.000.
- Signals: reviewer findings 5–6 (naming, per-move `markerSnapTimes` allocation) and the Architecture note (fold `resolveGridTime` into `resolveGridTimeWithTargets`) remain B backlog signals; C found no behaviour cost.
- Tech Lead manual check R78-T (how marker capture feels on a 10 s grid with no pixel radius, ROOT-R64-M1) is still open. MT-AUDIO shows the consequence on purpose: at grid 10 s, a ruler click 2.375 s away from a marker lands on the marker.
- SRW-16 stage 2b can close with this evidence after the root gate.
