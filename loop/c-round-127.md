# C round 127 — VISUAL-A V-0.1 (Export copy → English) — independent verification

**Verdict: FAIL.** One Medium bug, C-R127-01: two buttons in the dialog now share the accessible name "Close". This is A's P1, and A stopped for a B ruling. It turns 15 granted tests red, and the browser shows the same thing. Every copy row passed in the real browser: Georgian count 0, and export output unchanged.
`browserVerified` = `realVerified` = **true**: every browser row that can run here was run. envStatus: store 200 (round 127, 05:55 UTC).

## Checkpoints
- 1: SOURCE-SCOPE and T127-TARGETED.
- 2: 1440 main session.
- Final: everything else. Work ran from 05:57 to 06:10 UTC.

## Rows
| ID | Result | Evidence |
|---|---|---|
| T127-TARGETED | **FAIL**. 28 files, 353 tests: **15 failed**, 338 passed. The 15 are exactly A's P1 list: a11y-copy NC3, hold-enter HE1–HE7, export-mp3 MX1/MX5/MX6, export-range-ui XU3/XU5, the master-ui overload alert and video-fades-ui VU4. All fail with `Found multiple elements with the role "button" and name "Close"`. C ran B's §4 list literally: 28 files. A's 29th file is outside that list (probably picked up by A's glob). Not a finding | `c-round-127/out/vitest-targeted.log` |
| SOURCE-SCOPE | PASS. HEAD 608187f. `git status` shows 24 ` M` granted files plus 3 `??`. The frozen sha256 list is OK at the start and again at the end (06:09). The protected hashes are unchanged: fa2cf0bc, 13914809, 56f5b76f, bf9ee257. `Modal.tsx` has no diff. `strings.ts` is `387f7f73…` with `closeButton: 'Close'`, so A's attempt-2 restore is confirmed. No source changed during my phase | shell checks |
| AN-REVIEW | PASS (the findings are listed separately). Details below | diff + doc 104 |
| EX-EN-IDLE (both) | PASS. Checked in the S fixture (no time selection) and in the time-selection state, at 1440 and 1280. **Georgian count 0** in all four. All text uses the §1.1 terms. The disabled Time selection card shows "Make a time selection in the Arrangement (drag on a clip or on the ruler)" | `out/main-{1440-r2,1280-r1}.json` S2, `out/s2-range-{1440,1280}-r1.json`, shots `S2-idle-range-*`, `RANGE-dialog-*` |
| EX-EN-RUN (1440 + 1280) | PASS. Progress read every frame: `Rendering · 24/64/100%` → `Writing WAV · 4…73%`. Done: `WAV created: 02:30.372, 24-bit · 48 kHz · stereo.` Alert: `Overload: peak +6.0 dBFS — 5388 samples clipped to 0 dBFS. Lower Master by at least 6.0 dB and export again.` (at this fixture the peak is +6.0, not +1.7). The WAV has **7217877 frames**, PCM 48 kHz / 24-bit / 2 ch, NaN 0, and is named `czaba-studio-lab.wav`, at both viewports. That equals the round-125 project figure | `out/main-*.json` RUN_project_wav, shots `RUN-done-*` |
| EX-EN-RANGE | PASS. Time selection 00:02–00:06 (Snap on), checked at both viewports. The scope reads `Time selection · 00:02.000 — 00:06.000 (4.000 s)`. The file `czaba-studio-lab-range.wav` has **192000 frames**. Done: `WAV created: range 00:02.000 — 00:06.000 (4.000 s), …` | `out/s2-range-*.json`, shots `RANGE-done-*` |
| EX-EN-MP3 | PASS. The CDN was reachable. The sequence was `Loading the MP3 encoder (ffmpeg.wasm, ~31 MB the first time)…` / `Loading MP3 encoder…` → `Creating MP3 · 0…93%` → `MP3 created: 02:30.372, 48 kHz · stereo.` WAV + MP3 made two files and showed `WAV and MP3 created: …`. Its WAV is 7217877 frames | main-1440 MP3/BOTH, shots `MP3-done`, `BOTH-done` |
| EX-EN-CANCEL | PASS. A WAV cancelled during rendering showed `Export cancelled — No file was created.` (1440 and 1280). An MP3 cancelled while `Creating MP3 · 0%` showed `… The MP3 encoder will load again on the next MP3 export.` 0 downloads. Focus stayed on the footer Close, and after closing it went back to the toolbar Export (as before) | main-* CANCEL_wav/CANCEL_mp3, shots `CANCEL-*` |
| EX-EN-MUTE | PASS. The note reads `Master is muted (M) — WAV will be created with 02:30.372 of silence. Unmute Master if you need sound.` Done: `… stereo. Master is muted — the file is silent.` The WAV has 7217877 frames, peak 0 | main-1440 MUTE, shots `MUTE-*` |
| EX-EN-EMPTY (1280) | PASS. After deleting the only clip, the note reads `Export is disabled: the project is empty — add at least one clip.` and `Export WAV` is disabled. Georgian count 0 | `out/s2-empty-1280-r1.json`, shot `EMPTY-1280-r1` |
| EX-EN-VIDEO (1440) | PASS. The video sound line showed `Original video sound (beeps-6s-h264-aac.mp4): Included`, and `Off (M/Solo)` after the video lane Mute. The file name is unchanged. A +40 px drag gave video fade-in 1.000 and the note `Video fades are preview only — video is not rendered, the export is audio only.` The video option stays disabled. **Not reached:** `Decoding — please wait` (decoding finished before the first read at 548 ms), so it is inconclusive and covered by jsdom only. The no-audio source shows the V-0.2 `audioNote` `ვიდეოს ხმა არ აქვს`, which was subtracted | `out/s2-video-1440-r1.json`, shots `VIDEO-*` |
| EX-LAYOUT (both) | PASS. **Outside the dialog (S0/S1): 0 boxes differ by more than 1 px** at either viewport (1440: 111 and 122 elements; 1280: 103 and 121). The S2 headers match. Inside the dialog only the two footer buttons changed: Close 91→70 px and Export WAV 155→113 px, with the same y and h, right-aligned. Both changes come from the shorter text. The footer stays on one row. No new `scrollWidth > clientWidth`: the sr-only `Format` legend is clipped by design. The 1280 range-card/footer overlap is **45 px** (S fixture) and **13 px** (time selection), equal to F-2 | `out/layout-compare.json` |
| EX-KEYS (both) | **FAIL**, only because of the duplicate name. Otherwise everything matches the round-101/102 baseline. The Tab order from Close is Export WAV → ✕ → format-wav → the scope radio → Close …, and Shift+Tab goes back. Escape closes, and focus goes to the toolbar Export. A held Enter on the footer Close closes once, and the 3 repeats are `defaultPrevented`. A held Enter on the toolbar Export opens once, with no render and no download. The accessible names are English, but two of them are "Close" | main-* KEYS_range, HOLD_ENTER |
| G127-3 (alone, last) | PASS. `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401** `{"error":"Please sign in to access Studio."}`. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud) | `out/g127-3.json`, shots `g127-3-*` |
| PX-NET / REG-HYD | PASS. Every valid session had 0 forbidden requests, 0 `Authorization` headers, 0 hydration errors and 0 pageerrors (2 cart-noise lines per session). The invalid r1 run is listed below | `sessions` in each out JSON |

Gate rows (not claimed by C): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## AN-REVIEW
- **Hunk ranges:**
  - `graph.client.ts`: the import at l.11, the `formatExportOverloadWarning` return and the Error at l.465. Nothing else.
  - `ArrangementContext.tsx`: the import at l.148, l.205, and hunks 3030–3303, all inside `exportWav`/`exportMp3` (+1 shift). The download file-name lines (3071/3267/3273) are untouched.
- **Leaf rule:** `strings.ts` has no imports. It has one export, `studioExportStrings`, no assertions and no `as const`.
- **Test hunks sampled (12 hunks in 8 files), all literal → module with the same matcher:**
  - export-cancel `toBe(exportCancelled)` and the encoder message;
  - export-dialog-footer WAV/BUSY/CLOSE constants, and the `^WAV created` regex prefix;
  - export-progress-ui `toBe(progressRendering(50))`, the aria-label and `progressWavWrite(25)`;
  - export-wav FAILED/STALLED `toBe`;
  - master.test overload `toBe(overloadWarning({…}))` ×3, plus the `toContain` fragments (the same parts);
  - meter-ui `masterGainNote('−5.0 dB')`;
  - export-range-ui noSound `toBe` ×4 and the regex prefix;
  - a11y-copy `NAME_LEAK`.
  - ST1/ST2 pin the English literals exactly (68 `toBe`), including the overload cases, `4.000 s`, the progress texts at 0/57 % and the stall text.
- **Meaning check (doc 104, rows 46–108):**
  - No row drops or adds a fact. "No file was created", every reason, the times, the formats and the 120/30 seconds are all kept.
  - Pluralization (`sample`/`samples`) is an addition with no new fact.
  - Wording nits → C-R127-L1 (Low).
- **A's shell writes**, as A reported them:
  - `cat >>` to the report;
  - `mkdir` plus `git diff > diff.patch` in the loop folder;
  - m1–m4 `cp`/`sed -i`/`cp` restores, all verified by sha256;
  - the m3b leftover, restored in attempt 2 (C confirmed the hash);
  - temp files in `/tmp`.
  - Note: `a-round-127/diff.patch` (05:39) is older than the final tree. C reviewed the live `git diff 608187f`.

## Bugs
### C-R127-01 — Medium — two "Close" buttons in the Export dialog (P1)
- **Steps:**
  1. Open `/studio-lab` and add a clip.
  2. Click Export.
  3. Run `getByRole('dialog').getByRole('button', {name:'Close', exact:true}).count()`. It returns **2**.
  4. Start a WAV export. During the render the footer "Close" is disabled and the ✕ "Close" is enabled.
- **Expected:** a unique accessible name and copy-only changes (R2); the §4 tests green.
- **Actual:**
  - The frozen Modal ✕ has `aria-label="Close"`, and the footer text is now also `Close`.
  - 15 granted tests are red.
  - A screen reader announces two "Close" buttons with different states.
- **Evidence:** `out/vitest-targeted.log`, `out/main-1440-r2.json` (`S2.roleCloseCount`, `RUN_project_wav.duringRender.closeBtns`), `out/main-1280-r1.json`, `out/s2-range-*`.

### C-R127-L1 — Low — wording (→ deferred_low_polish)
- "in this cycle" should be "in this version".
- "the time selection / entire project is created" should be "… is exported".
- "— No file was created." has a capital letter mid-sentence.
- The busy button shows "Rendering…" during the MP3 encoder load and the encode.
- The done message says lowercase "range" where the dialog says "Time selection".

## Georgian counts
- 0 in every row and at both viewports.
- One subtraction: `ვიდეოს ხმა არ აქვს` (15 codepoints), the `source.audioNote` from `video.client.ts`, which belongs to V-0.2.
- The sound titles do not appear in the dialog. The video file names are Latin.

## invalidRuns
- `main-1440-r1`: the first load crashed with a hydration error and an invalid hook call (ENV-FIRST-LOAD). Saved as `out/invalid-main-1440-r1.json` and replaced by r2.

## Screenshots (all opened and checked)
- Dialog states, all in English: S2 idle, RANGE, RUN, MP3, BOTH, CANCEL, MUTE, EMPTY and VIDEO.
- S0/S1: the workspace is still Georgian outside Export, which is expected during V-0.
- `g127-3`: the lab with the demo badge, and "Sign in required".
- In EMPTY-1280 the disabled reason sits below the fold in the scroll area. That is pre-existing layout, and the text was read from the DOM.

## Ableton
- "Export" and "Time selection" match Live 12 terminology only: ch. 42 "Export Audio/Video" and ch. 6 "time selection", per B's capture.
- Export behaviour: not applicable (copy only).
- CZABA requirement: **not met** while P1 is open.

## Notes for B
- Round 128 can be a bounded P1 fix-up. After it, re-run only T127-TARGETED and EX-KEYS: the copy, export output and layout are already verified.
- C asks that the ruling remove the duplicate name in the product, not only in the tests. Relabelling the footer button does that without touching the frozen `Modal.tsx`.
- V-0.2 must translate the `audioNote` that appears in the Export dialog.
- `export-cancel.test` still has the title "exports the exact Georgian messages". Some tests compare a constant with its module source, and ST1/ST5 pin the literals. Both go to Low polish.
- Reviewer Architecture note (keep; decide on conditional copy and a file split before V-0.3): passed on as a signal.
- **Artifact naming:** `RUN_range_wav` in `main-1440-r2.json` / `main-1280-r1.json` is a second **project** export, not a range export. The S fixture has no time selection (the range radio is disabled), so `run-*-range-czaba-studio-lab.wav` has 7217877 frames. The real 4.000 s range evidence is `s2-range-*-r1.json`.
- Observation, pre-existing and not R2: the MP3-only and WAV+MP3 runs gave MP3s of different sizes (4647573 vs 4647669 B). This round touched no encode code, and earlier rounds only claimed audio correlation, not byte determinism.
- Harness: `c-round-127/tools/{c127lib,main,s2,g127-3,layout.py}`. These reuse the round-125 lib, d6 collect and buildS1.
