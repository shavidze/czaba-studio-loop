# C round 77: SRW-16 stage 2b-2, Ctrl/Option+←/→ also stop at clip edges of the selected tracks (D-29z42)

**Verdict: PASS. browserVerified=true, realVerified=true. No bugs.** C did not edit `store/` and did not commit or push.
Env: `env-status.json` (round 77, store 200). I re-checked that `/studio-lab` returns 200. The backend at :5199 is unavailable, which is expected in the cloud.

## Method
- Real Playwright Chromium (headless, installed), new context, no credentials, `http://127.0.0.1:5173/studio-lab`, at **1440x900 and 1280x720**. Pointer input was real `page.mouse` moves and clicks. Keys were real CDP key presses; Ctrl was held with `keyboard.down` for Ctrl+click.
- Tools are in `c-round-77/tools/`: `ek77.cjs` runs groups A/B/C, each on a fresh page; `g77.cjs` and `tok.cjs` cover G77-3. Raw results: `c-round-77/ek77-<vp>-<group>.json`, `meter-<vp>.json`, `g77-<vp>.json`, `token-api.json` and `vitest-targeted.txt`. Screenshots are in `c-round-77/shots/`.
- **Fixture (actual values, identical at both viewports).** A fresh load has **0 clips** and the project end is 00:00.000. Without a long clip, the stems clip end would equal the project end, and playback could not run past 6.3. So, with Snap off:
  - **Middle East** on music at **0.350**–101.702. This sets the project end to 01:41.702.
  - **Soft impact** on stems at **4.700**–6.700.
  - **Soft impact** on sfx at **3.450**–5.450.
  - A marker at **6.300** (ruler click with Snap off, M, Enter).
  
  Each drop made its own lane active and selected the dropped clip. Zoom was 40 px/s.
  - Music is never part of the selected tracks in EK-ACTIVE or EK-SELECT. Its off-grid start 0.350 is therefore the discriminator for Ctrl+Shift+L.
  - Positions come from `arrangement-position`. Markers, clip starts, the end and 0 are checked at ±1.1 ms. Clip ends are checked at ±26 ms (1 px), because the fixture derived them from width/zoom. The observed ends were exactly 5.450 and 6.700 at both viewports, so the wider tolerance hid nothing.
- **Harness fixes (no app fault, disclosed).**
  - In the first 1440 run, my "empty lane" click hit the 6 px track-height handle at the lane bottom (`elementFromPoint` = `arrangement-track-height`). That click did not clear the selection. I moved it to mid-lane, where it clears selection and makes the lane active.
  - My first "no status on success" check also failed on status text left over from an earlier action. I changed it to "the status text does not change on a successful stop".
  - The first EK-GUARDS run focused the **Pan** slider (the first range input), so I added the **Volume** fader.
  - Every row below is from the corrected runs. No tolerance was changed. `meter-1440x900.json` comes from the corrected group-A run; it overwrote the first run's file, whose audio half-results were also PASS (onset 70 ms, silent negative control). No server was started or stopped.

## Acceptance (both viewports, identical results)
| ID | Evidence (1440 / 1280) | Result |
|---|---|---|
| EK-ACTIVE | Mid-lane click on empty sfx at 15 s → active `[sfx]`, selected `[]`, range none. Home, then Ctrl+→: **3.450, 5.450, 6.300, 101.702**, then the refusal `წინ მარკერი აღარ არის`. Stems 4.700 was **skipped**. Ctrl+←: **6.300, 5.450, 3.450, 0.000**, then `უკან მარკერი აღარ არის`. The status text did not change on any successful stop | PASS |
| EK-SELECT | Clicked the sfx clip, then held-Ctrl clicked the stems clip → selected `[stems 4.700, sfx 3.450]`, active `[sfx]`. Ctrl+→: **3.450, 4.700, 5.450, 6.300, 6.700, 101.702** | PASS |
| EK-RANGE | Empty sfx click (selection and range cleared), then a drag in the stems clip waveform from 5.0 to 5.6. **The drag also selects the stems clip and makes stems active** (active `[stems]`, selected `[stems 4.700]`), range `00:05.000 — 00:05.600`. Ctrl+→: **4.700, 6.300, 6.700, 101.702** (sfx edges not stops). After Ctrl+Shift+L (`ყველა ხაზი` present): **0.350, 3.450, 4.700, 5.450, 6.300, 6.700, 101.702**. The music start 0.350 appears only with all lanes. The range survived the steps. The pure range-only N2(c) case is vitest EN3 plus A's mutation (c) | PASS |
| EK-BUTTONS | From 0: ▶ gives **6.300**, then **101.702**, then a refusal. ◀ gives **6.300**, then **0**, then a refusal. Clip edges were skipped | PASS |
| EK-MARKER-SEL | In the EK-SELECT sequence, the 6.300 flag is `aria-current` at the marker stop and stays so after the 6.700 clip-edge stop, with no new status. **Stronger extra (group C):** I added a second marker at 12.000, which became `aria-current`, then selected the stems clip. Ctrl+→ gave 4.700 (current stays **12**), 6.300 (current → **6.3**), 6.700 (stays **6.3**), 12.000 (→ **12**), then end (stays 12). This is discriminating for N4 | PASS |
| EK-AUDIO (real audio) | State: sfx active, no clip selected, SFX Solo on and video Mute on (real clicks). (1) Home, Ctrl+→ → **3.450**, Space: the master `data-level-db` (10 ms sampler) went from −inf to **0.0 dB, onset 71 ms (1440) / 82 ms (1280)**; the transport advanced to 4.31. (2) Space stop, Home, real click on ▶ → **6.300**, Space: the meter stayed **−inf for 1.3 s** (0 samples ≥ −15 dB) while the transport ran to 7.55. Solo and Mute restored (`aria-pressed` false). Round-76 behaviour would have landed on 6.3 in (1) | PASS |
| EK-PLAYING | Home, Space; at 0.55–0.56 s, Ctrl+→ → **3.458**, then 3.859 400 ms later, so playback kept running from the stop. Space stopped it at 3.87 | PASS |
| EK-ALT-LINUX | sfx clip selected, Snap on (grid 1 s), playhead 0. **Alt+→** moved the clip 3.450 → **4.000** (undo `კლიპის ჩაჩოჩება`) and the playhead stayed at 00:00.000. Ctrl+Z restored 3.450. Plain → gave the identical result (4.000, same undo title, playhead unchanged) | PASS |
| EK-GUARDS | **BPM input** focused, Ctrl+→: position unchanged. **Volume — SFX** focused, Ctrl+→: position unchanged (value 1 at max, unchanged). **Pan — SFX** focused, Ctrl+→: position unchanged. The slider kept its own key behaviour (pan 0 → 1, one history entry, which I undid). **Focused flag** (sfx active), Ctrl+→ twice: 3.450, then 5.450. Marker times unchanged, undo title unchanged | PASS |
| REG-NUDGE | Selected sfx clip. Snap on: → 4.000, ← 3.000; two Ctrl+Z → 4.000 → 3.450 (one entry each). Snap off: → 3.550, ← 3.450; two Ctrl+Z → 3.550 → 3.450. The undo title returned to `Add Marker` | PASS |
| REG-MARKERS | Marker 6.3 dragged +40 px with Snap on → **7.000**, `Undo: Move Marker`. Right-click opened exactly one menu: `[სახელის შეცვლა (F2), დაკვრა აქედან, წაშლა (Delete)]`. "Play from here": 7.18 → 7.78 | PASS |
| T77-TARGETED | A's 9-file list run once from `store/`: **9 files / 202 tests passed** (`vitest-targeted.txt`) | PASS |
| REG-HYD | Every page (groups A/B/C, both viewports): 0 hydration / `useLayoutEffect` lines, 0 errors other than known noise | PASS |
| G77-3 | Header link (visible) → `/studio-lab`: workspace present, demo badge shown (both viewports). Anonymous `/studio/middle-east` → "Sign in required", 0 workspaces. Anonymous `/api/studio-token?product=…&file=…` → **401**, both from the request context and in-page. Page network: 0 forbidden requests (the only 2 `/api/studio-token` requests were C's probes), 0 Authorization headers. localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id` | PASS (fake-Bearer sub-check BLOCKED) |
| SOURCE-UNCHANGED | Start and end: HEAD db9cc25, status 8 lines (4 M + 4 ??). A's hashes `f6a45cdd3c1c 3ffac3132a77 e9b38eeee0a3 dbc6895e5582 49b775fc2d52 4957dbc94cc2 5a2dcc2c9a94 f0e786c63d53` are equal to the report. Frozen 453/453 OK; protected 4/4 (cd68eb6e, 9f738237, 13914809, fa2cf0bc) | PASS |

**Not a browser row:** the Apple Option+←/→ path (N6/N7). Linux Chromium cannot be an Apple platform. Per §5 it is covered by vitest EN7/EN9/EN11 (green in T77-TARGETED) and the Tech Lead check R77-T. It does not affect `browserVerified`.
**Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
**Blocked:** the fake-Bearer 403 sub-check of G77-3. A fake Bearer returns 500 "Unable to prepare Studio access" because the backend is unavailable in the cloud.
**Out of scope:** export was not re-measured. This round does not touch the audio graph or export, and EK-AUDIO covers the real output of the changed path.

## CZABA requirement vs Ableton match (judged separately)
| Behaviour | CZABA (this round) | Ableton match |
|---|---|---|
| Ctrl+←/→ stops at locators and clip edges of the selected track(s) | PASS (N1, browser) | Confirmed (text, Live 12 §6.9, B capture 2026-10-21). Deliberate difference: CZABA moves the playhead, not an insert marker |
| Option+←/→ on Mac | vitest only (not runnable here) | Confirmed (text, §6.9); unverified on a real Mac (R77-T) |
| "Selected tracks" = active ∪ selected-clip tracks ∪ range track(s) | PASS (N2, browser) | Unconfirmed (no definition in §6.9; CZABA decision) |
| Coincident locator + edge → one stop, the marker | vitest EN5 only | Unconfirmed |
| ◀ ▶ buttons marker-only, then start/end | PASS (N5, browser + audio negative control) | Confirmed (text, §6.4) |
| Windows/Linux Alt+arrows unchanged | PASS (N8, Linux browser) | Not a Live shortcut for this; not applicable |

## For B (observations, not bugs)
1. **"Edges in the interval" wording:** §5 EK-RANGE said that after Ctrl+Shift+L "the edges of every lane's clips **in the interval**" are stops. The code (N2: `allTracks` → every track) uses every clip edge on every track, even outside the range. Here 0.350 and 101.702 are outside 5.0–5.6 and are stops. This matches N2 and the §6.9 text, which has no interval limit. If B meant the interval, that is a contract change, not an A defect.
2. **A range drag in a clip's waveform also selects that clip and makes its lane active.** So in the browser a range always brings in its clip's track through rule (a)/(b) as well. Only vitest EN3 isolates N2(c).
3. **Empty-lane click target:** the bottom 6 px of a lane is the track-height handle. A click there does not clear the clip selection. This is not a bug, but future harnesses should click mid-lane.
4. A's open points carried forward:
   - EN7 now locks Mac Option+Shift+→ = clip nudge, which B never specified.
   - `adjacentMarkerTarget` / `stepMarker` now return non-marker stops, so their names are misleading.
   - Ctrl+← while playing can repeat a stop (pre-existing).
   - Non-Apple Alt+arrows with a selected clip prevent browser Back/Forward (pre-existing N8).
   - R77-BUTTON-SHORTCUT-SUPERSET: the buttons' `aria-keyshortcuts` still advertise Control+Arrow; this stays in the Lows batch.
5. **Architecture signal (A/code-reviewer):** a pure key-event → action resolver for `handleKeyDown`, and a `timeline-stops` module if stage 2b-3 reuses the stop set. Keep for now; this goes to the SRW-16 checkpoint.
6. Root pre-push and gate findings: nothing new from C. The GATE75/GATE76 signals remain as recorded in the active summary.
