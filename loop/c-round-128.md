# C round 128 — VISUAL-A V-0.1 fix-up (C-R127-01 + C-R127-L1)

Verifier: C · 2026-10-24 · Verdict: **PASS** · `browserVerified` = `realVerified` = **true**
env-status: store 200 (06:39:10Z, round 128). Real Playwright Chromium, fresh context per session, 1440×900 and 1280×720, `http://127.0.0.1:5173/studio-lab`. No `store/` writes.

## Rows
| ID | Result | Evidence |
|---|---|---|
| T128-TARGETED | **PASS**: A's exact 25 files → 25 passed, 316 tests passed, 0 failed (= A). The 15 round-127 P1 tests are green; HE8 runs and passes (verbose 8/8) | `c-round-128/out/vitest-targeted.log` |
| SOURCE-SCOPE | **PASS**: HEAD 608187f; 27 entries, the same at C's start and end; frozen list OK at start and end; 10 grant hashes = A's end hashes, unchanged during C's phase; Modal `741c2341`; protected hashes unchanged, `git diff 608187f` empty | `out/git-status-{start,end}.txt`, `out/grant-hashes-c-start.txt` |
| AN-REVIEW | **PASS**: `strings.ts` changes only the W0–W4 values; W3 covers exactly the 8 keys, and `videoDecodingNoFile` stays `No file was created.`. `strings.test.ts` changes only those literals, plus the `mp3Done` sample input (A's deviation 2, accepted: it is the W4 shape). Hold-enter: `within` import, the describe title, HE1–HE7 titles and +HE8. The 6 title-only files: all 14 changed lines are `it(` titles, and the line counts are unchanged. Doc 104 has the W rows, the P1 ruling, the glossary amendment and the key-name reason. No fact is dropped or added | `out/granted.diff` |
| EX-KEYS (both) | **PASS**: idle `Close`=1 (✕), `Done`=1 (footer), names `[Close, Done, Export WAV]`. During a render: `[Close, Cancel, Done, Rendering…]`, unique; `Done` is disabled and ✕ is enabled. The done and cancelled states are unique too. This was checked with Playwright `getByRole` exact counts **and** `ariaSnapshot`. Focus on open → `Done`. Tab: Done → Export WAV → ✕ → format-wav → scope-project → Done; Shift+Tab → Export WAV. Escape closes, and focus returns to the toolbar Export. Held Enter on Done closes once, and the repeats are prevented. Held Enter on the toolbar Export opens once, with no render and no download. Identical to round 127 with `Done` in place of the footer `Close` | `out/main128-{1440-r2,1280-r1}.json` (S2.idleCensus, RENDER_REGWAV.renderCensus, KEYS_range, HOLD_ENTER), `shots/RENDER-census-1440-r2.png` |
| EX-COPY | **PASS**: (a) `…in this version — …` (1440). (b) Ctrl+L on the 2–6 s selection (Loop 00:02.000 — 00:06.000): range `…the time selection is exported (00:02.000 — 00:06.000, 4.000 s).`, project `…the entire project is exported (00:00.000 — 02:30.372).` (both sizes). (c) `Export cancelled — no file was created.` (both). (d) MP3 cancelled at `Creating MP3 · 0%`: `Export cancelled — no file was created. The MP3 encoder will load again on the next MP3 export.` (e) `WAV created: time selection 00:02.000 — 00:06.000 (4.000 s), 24-bit · 48 kHz · stereo.`, 192000 frames (both). Georgian net 0 in all of these | `out/s2r128-range-*-r1.json`, `out/s2r128-video-1440-r1.json`, shots `RANGE-loop-*`, `RANGE-done-*`, `CANCEL-*`, `VIDEO-*` |
| EX-LAYOUT (both) | **PASS**: S0/S1 vs c-round-125: 0 boxes >1 px. S2 vs round 127: Close 70 px → Done 68 px (x +2, right-aligned); Export WAV, y, h and footerBox are identical; one row; no overflow. 1280 overlap: 45 px (S1) / 13 px (range) = F-2 unchanged | `out/layout-compare.json` |
| REG-WAV | **PASS**: `czaba-studio-lab.wav`, 7217877 frames, 48 kHz / 24-bit / 2 ch, 0 NaN, rms 0.2913; the status and overload alert equal round 127. The sha differs between runs by ≤1 LSB on 0.09 % of samples, as in round 127 | `out/regwav-*.wav` |
| G128-3 (last, alone) | **PASS**: `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", 0 workspace, 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** | `out/g128-3.json`, `shots/g128-3-*.png` |
| PX-NET / REG-HYD | **PASS**: every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror. Only the known cart noise | `net` in each out json |

- **Invalid run:** `main128-1440-r1` hit the ENV-FIRST-LOAD hydration error and invalid hook call. It is kept as `out/invalid-main128-1440-r1.json` and was replaced by r2.
- **Inconclusive (not claimed):** `emptyProjectNoFile`, `invalidRangeNoFile`, `encoderLoadFailed`, `exportFailed`, `mp3Failed`, `encoderLoadTimeout` cannot be reached in the browser. They are covered only by ST1/ST2.
- **Gate rows (not claimed):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Screenshots (all 28 opened and checked)
- `S0-1440-r2`, `S0-1280-r1`, `g128-3-lab-1440`: empty demo workspace, 4 lanes, toolbar `Export`, demo badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება".
- `S1-1440-r2`, `S1-1280-r1`: video, music, stems and SFX clips; group "ჯგუფი 1"; Marker 1; Loop 00:02–00:04 on; SFX clip selected with its detail panel.
- `S2-idle-range-1440-r2`, `S2-idle-range-1280-r1`: footer `Done` + `Export WAV` on one row, ✕ at the top right, Video reason "in this version". At 1440 the project loop note and "Original video sound: Included" are visible.
- `S2-loop-project-1440/1280`, `RANGE-loop-project-1440/1280`: project scope checked. At 1440 the note "the entire project is exported (00:00.000 — 02:30.372)" is visible; at 1280 it is below the fold (the text was read from the DOM).
- `RANGE-loop-dialog-1440/1280`: Time selection 00:02.000 — 00:06.000 (4.000 s) is checked. The 1440 shot shows the note "the time selection is exported (…, 4.000 s)".
- `RENDER-census-1440-r2`, `RENDER-census-1280-r1`: "Rendering · 24 % / 39 %"; `Cancel` enabled, `Done` dimmed, `Rendering…`.
- `RUN-done-1440/1280`: "WAV created: 02:30.372, 24-bit · 48 kHz · stereo." plus the overload alert (the same as round 127); `Done` / `Export WAV`.
- `CANCEL-wav-1440/1280`: "Export cancelled — no file was created."; `Done` / `Export WAV`.
- `CANCEL-mp3-1440-r2`: the MP3 cancel text in lowercase "no file was created …"; `Done` / `Export MP3`.
- `RANGE-done-1440-r1`: "WAV created: time selection 00:02.000 — 00:06.000 (4.000 s) …"; the ✕ is fully visible.
- `RANGE-done-1280-r1`: the same message, but the ✕ is half cut by the dialog's top edge because the body scrolled. The same thing is in `c-round-127/shots/RANGE-done-1280-r1.png`, so it is **pre-existing**. Recorded as **C-R128-L1 (Low)**.
- `VIDEO-included/off/fade-1440`: "in this version" reason; video sound "Included" / "Off (M/Solo)"; fade note "Video fades are preview only …".
- `VIDEO-noaudio-1440`: the second video line ends in Georgian "ვიდეოს ხმა არ აქვს" (`source.audioNote`, V-0.2, subtracted).
- `g128-3-protected-1440/1280`: lock icon, "Sign in required", Sign In button, no workspace.

## Two ratings
- **CZABA requirement:** met. C-R127-01 is removed in the product: one name per button in the idle, render, done and cancelled states. W1–W4 show correctly.
- **Ableton correspondence:**
  - `Done` label: არ ეხება (not applicable).
  - "time selection" in the done message: **confirmed**. C grepped B's capture `b-round-71/ableton-arrangement-view-20261021.txt` (Live 12 manual, Arrangement View, captured 2026-10-21). It uses "time selection", e.g. "Zoom to Arrangement Time Selection".
  - Export behaviour: არ ეხება (not applicable); the output is unchanged.

## Notes for B
1. **One new Low: C-R128-L1** (pre-existing, not caused by this round). After a range WAV export at 1280×720, the ✕ is half clipped at the top of the dialog. Steps and evidence are in the JSON. It goes to `deferred_low_polish`. Known Lows that are still visible:
   - C-R127-L1e: `Rendering…` shows during the MP3 encode.
   - Reviewer Low (d): `invalidRangeNoFile` says "range" while W4 says "time selection".
2. Process note: my first targeted vitest command mis-expanded the file list and ran the whole suite (123 files / 1920 tests, all green; `out/vitest-accidental-fullsuite.log`). It is **not** claimed; the gate owns the full suite. I re-ran the exact 25 files.
3. During a WAV render, focus sits on the dialog container. This round cannot have changed it: `ArrangementExportDialog.tsx`, `ArrangementContext.tsx` and `Modal.tsx` are frozen at their round-127 hashes (frozen list OK at C's start and end), and only `strings.ts` values changed.
4. Outcome per §8: V-0.1 → `c_pass`; round 129 = V-0.2.
