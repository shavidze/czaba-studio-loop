# C round 132 — V-0.2c2: tempo, metronome and zoom-readout texts in English

**Verdict: PASS.** `browserVerified` = `realVerified` = true. No new bugs.
One check is BLOCKED because the backend is not available in the cloud: the fake-Bearer 403 part of G132-3.
Gate rows are not claimed here: full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-*.

Environment: `env-status.json` (store 200, round 132). Real Playwright Chromium was used, with a fresh context per session, at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`.
- Tools: `c-round-132/tools/`. These are copies of the round 131 tools, with output paths changed to round 132, plus `c132.cjs`, `reg131.cjs` and `g132-3.cjs`.
- Measurements: `c-round-132/out/`.
- Screenshots: `c-round-132/shots/`.

## Invalid runs
- `c132-1440-r1`: ENV-FIRST-LOAD. The first dev-server load threw React "Invalid hook call" and replaced the hydrated content. The status region did not exist.
  - It was discarded, and the evidence kept as `out/INVALID-ENV-FIRST-LOAD-c132-1440-r1.json`.
  - It was replaced once by `c132-1440-r2`. Every later session loaded cleanly.

## Rows

| ID | Result | Evidence |
|---|---|---|
| T132-TARGETED | PASS. I ran the same 21-file list: 21 files and 364 tests passed, the same counts as A | `out/vitest-targeted.log` |
| SOURCE-SCOPE | PASS. See the details below | — |
| AN-REVIEW | PASS. See the details below | `out/c-granted.diff` |
| TEMPO (both) | PASS. See the TEMPO table below | `out/c132-1440-r2.json`, `out/c132-1280-r1.json` |
| METRO (both) | PASS. See the METRO table below | same |
| ZOOM (both) | PASS. See the ZOOM details below | same |
| GEO-COUNT (both) | PASS. The net count is 0 on all five surfaces at every step | see the GEO-COUNT section |
| LAYOUT (both) | PASS. See the LAYOUT details below | `out/layout-compare.json`, `out/layout130-*-r1.json` |
| REG-131 (1440) | PASS. The status was exactly `“beeps-6s-h264-aac.mp4” added to the video track: 00:00.000 — 00:06.000`, with one video clip at 0.000 that is 240 px wide (6 s × 40 px/s) | `out/reg131-1440-r1.json`, `shots/reg131-1440-r1.png` |
| G132-3 (last, alone) | PASS. See the G132-3 details below. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)** | `out/g132-3.json`, `shots/g132-3-*.png` |
| PX-NET / REG-HYD | PASS. See the details below | the `net` fields in every out JSON |

**SOURCE-SCOPE details**
- HEAD is `c8ff326`. `git status` shows 18 ` M` and 1 `??` (doc 108).
- The frozen list `b-round-131-r132-tree-sha256.txt` was OK at the start and at the end.
- The protected files have an empty `git diff c8ff326`.
- A's `a-round-132/end-sha256.txt` (19 paths) was OK at the start and at the end, so no source changed during C's phase.
- The start copies matched their start hashes.

**AN-REVIEW details**
- I made my own `diff -u` against `b-round-131/r132-granted-start/` (`out/c-granted.diff`). Its +/- lines are identical to A's `granted.diff`.
- **`strings.ts`:** only the 3 new objects were added, and `grep -c '^import'` returns 0.
- **`tempo.ts`, `metronome.ts`, `view.ts`:** only the import and string expressions changed. The parse pattern, bounds, rounding `Math.round(pxPerSecond*10)/10`, scheduling and the `null` branches are unchanged.
- **Doc 107:** only l.4 changed.
- **Tests:**
  - The literal → module changes keep the same matcher.
  - The hand-written `'40 px/s'` lines and the R3 literal are in place.
  - The 8 forward-rule `expect`s were added inside existing `it`s.
  - The only new `it`s are ST17–ST19.
  - No `skip`, `only` or `todo` appears.
- **Meaning check, Georgian side by side with English:**

| Row | Georgian → English | Facts kept |
|---|---|---|
| T1 | ტემპი უნდა იყოს 20–999 BPM (მაგ. 90 ან 92.5) — არ შეიცვალა → Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed. | Bounds and examples kept |
| T2 | ტაქტები: მიუთითე BPM — მხოლოდ ბადე, აუდიო არ იწელება → Bars: set a BPM — grid only, audio is not stretched | Both facts kept |
| T3 | ტემპი წაიშალა — ტაქტების სახაზავი დამალულია. აუდიო არ შეცვლილა. → Tempo cleared — the bars ruler is hidden. Audio is unchanged. | Kept |
| T4 | ტემპი {bpm} BPM · 4/4 — ტაქტების სახაზავი განახლდა. მხოლოდ ბადეა: აუდიო არ იწელება. → Tempo {bpm} BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched. | Kept |
| M1 | მეტრონომი — ჯერ მიუთითე BPM → Metronome — set a BPM first | Kept |
| M2 | Click on every beat, the 4/4 accent, "Master volume and Mute also apply" and "Not included in the export" | All kept |
| M3 | Off | Kept |
| M4 | On, BPM, 4/4, the accent and "Not included in the export" | All kept |
| Z1 | px/წმ → px/s | Kept |

No fact was dropped or added. A listed its shell writes (m14–m18 sed/python and the report rewrite). All of them were restored, and the hashes confirm it.

**TEMPO.** Identical at both viewports. The library add put one clip, "CZABA hero — საჯარო preview", on the music track at 2.000 s.

| Step | Status (exact, observer recorded) | Effect |
|---|---|---|
| (a) `90` Enter | `Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.` | `data-bpm=90`. Bar marks: 69 at 1440, 57 at 1280. Clip start 2.000, width 150.372 s, unchanged |
| (b) `1000` Enter | `Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.` | The field went back to `90`; the bars stayed. Clip unchanged |
| (c) clear Enter (division 1 s) | `Tempo cleared — the bars ruler is hidden. Audio is unchanged.` | 0 bar marks. The strip reads `Bars: set a BPM — grid only, audio is not stretched`. Clip unchanged |
| (d) 0.5 → `90` → `1/4` → clear | `Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.` (R3, exact) | The select went back to `0.5`. Clip unchanged |

The division changes in (d) wrote these Georgian grid statuses, which are V-0.3 work:
- `ბადე: 0.5 წმ (Snap გამორთულია)`
- `ბადე: 1/4 · 0.667 წმ 90 BPM-ზე (Snap გამორთულია)`

**METRO.** Identical at both viewports.

| Step | Result |
|---|---|
| (a) no BPM | The toggle is `disabled` with `aria-pressed=false` and title `Metronome — set a BPM first` |
| (b) BPM 120 | Tempo status exact. The title is exactly the full M2 text with `4/4` |
| (c) click | `aria-pressed=true`. Status: `Metronome is on — 120 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.` |
| (d) play from Home for 2 s, then Space | See the measurements below |
| (e) click | `aria-pressed=false`, status `Metronome is off.` |

Step (d) measurements:
- The playhead went 0 → 1.97 / 1.961 s, and stopped at 1.97.
- The AudioContext was `running`, and 9 BufferSources were created.
- Real output was tapped at the destination. The clip starts at 2 s, so everything before 2 s is metronome only. The peak was 0.484, which is consistent with the 0.5 accent click peak, in 16 / 19 analyser frames above 0.01.
- The master meter showed −6.3 in the screenshots.
- No `pageerror`.

**ZOOM.** Same at both viewports.
- The readout `textContent` and slider `aria-valuetext` were equal at load, after `+` and after `−`: `40 px/s` → `50 px/s` → `40 px/s`. All match `^\d+(\.\d)? px/s$`.
- The slider `aria-label` `Zoom (px/წმ)` is frozen (R4) and subtracted by name.
- The readout box stays 64×16 with no overflow (sw = cw = 64).

**LAYOUT.**
- S0 and S1 have 0 box deltas against `c-round-125` at 1440 (111/122 elements) and at 1280 (103/121).
- S2 shows only the 4 known export-dialog button keys from earlier rounds, the same as in round 131.
- The zoom readout is 64 px wide (`w-16`) at x = 1132 (1440) and x = 972 (1280), so no neighbour moved.
- In the screenshots, the bars-strip hint fits on one line at both viewports.
- The tempo-row box is x = 288, w = 224, h = 20 (y = 219 at 1440 and 257 at 1280). It did not change at any step.
- `docSW` equals the viewport width, so there is no horizontal overflow.
- **Final source check, after all C writes:** 18 M + 1 ??, the frozen list OK, and the 19 end hashes OK.

**G132-3.**
- `/studio-lab` shows the workspace and the demo badge.
- `/studio/middle-east` at 1440 and 1280 shows "Sign in required", with no workspace and 0 `audio[src]`.
- `GET /api/studio-token?product=middle-east&file=stem1.wav` returned **401** `{"error":"Please sign in to access Studio."}`.
- The page made no forbidden requests and sent no `Authorization` header.

**PX-NET / REG-HYD.**
- Every valid session had 0 forbidden requests (`studio-token` outside G132-3, `recording-*`, `download`, R2) and 0 `Authorization` headers.
- There were 0 hydration errors and 0 `pageerror`s.
- Only the known cart / connection noise appeared, 2 per session.

## GEO-COUNT
Net Georgian is **0** on all five surfaces at every row step and at both viewports: the status after each action, the metronome `title`, the zoom readout, `aria-valuetext` and the bars-strip hint.

Subtracted by name:
- the R3 tail `ბადე დაბრუნდა წამებზე: 0.5 წმ.`;
- the `მეტრონომი` button label;
- `Zoom (px/წმ)`;
- the BPM field `aria-label` / `title` (not a counted surface);
- the grid-division statuses: `ბადე: 0.5 წმ …`, `ბადე: 1/4 · 0.667 წმ 90 BPM-ზე …` and `ბადე: 1 წმ …`;
- the track name `მუსიკა` and the sound title in the add status.

Evidence: `out/geo-summary.json` applies every named subtraction per step. Raw status counts before subtraction: 12 at TEMPO start, 16 at d1, 18 at d3 and 21 at d4; all of them net 0.

Not counted: the load-time status `დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).`. It appears before any row action and comes from outside tempo, metronome and view. It belongs to a later V-0 stage. Round 131 handled it the same way (`c-round-131.md` l.42: V-0.4/V-0.5). Its raw count is 50 on the four steps before any action.

## Screenshots (each opened and checked)
- **tempo-a (1440 / 1280):** BPM 90, bar numbers 1…9 / 1…8 on the bars strip, the clip at 0:02, and the English T4 status in the status line.
- **tempo-b (1440 / 1280):** the field shows 90, the bars are kept, and the T1 status is shown.
- **tempo-c (1440 / 1280):** the BPM field is empty and the bars strip shows the English hint. The metronome button is greyed and the T3 status is shown.
- **tempo-d (1440 / 1280):** the division is `0.5 წმ`, the hint is shown, and the status line shows the mixed R3 line.
- **metro-a (1440 / 1280):** the empty project, with the metronome button greyed.
- **metro-c (1440 / 1280):** BPM 120, the metronome button highlighted amber, and the M4 status.
- **metro-d (1440 / 1280):** the playhead at 00:01.970, the master meter at −6.3, and the M4 status kept.
- **metro-e (1440 / 1280):** the button is no longer highlighted and the status reads `Metronome is off.`.
- **zoom-load (1440 / 1280):** `40 px/s` next to the Zoom slider.
- **S0, S1 and S2 (both):** S0 and S1 match the baseline layout. S2 is the English Export dialog, with Done / Export WAV.
- **reg131:** the beeps clip spans 0:00–0:06 on the video track and the status is exact.
- **g132-3:** the lab with the demo badge, and the protected page showing "Sign in required" at both sizes.

## Ableton
- **CZABA requirement:** met.
- **Ableton correspondence:** not applicable / unconfirmed. This is a text-only round, and no new Live behaviour is claimed.
- The deliberate difference D-10 / SRW-15 (BPM is grid only, and audio is never stretched, unlike warped clips in Live 12 §9.1.1) was confirmed in the browser. The clip's start and width stayed unchanged through every tempo step.

## Notes for B
1. V-0.2c2 → `c_pass`. Per §8, round 133 is V-0.2c3. The regression round is due from 2026-10-27.
2. GATE132-TEMPO-CLEARED-MIXED was observed exactly as ruled. V-0.3 must close it together with `grid.ts` `formatGridDivision` and the Georgian grid statuses listed above.
3. The R4 split was observed: `aria-valuetext` is in px/s, while the `aria-label` is in px/წმ.
4. The load-time demo-ready status is still Georgian. Keep it on the V-0 list.
5. A's SP6 `not.toBe` blind spot (Low, pre-existing) can go to `deferred_low_polish` if B wants. It is not a finding of this round.
