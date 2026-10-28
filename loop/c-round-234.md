# C round 234 — SABA-B-11a stage 1 (tempo from the asset's catalogue BPM)

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs from C. Gate rows (full suite, verify, build, e2e smoke) are left to root.
Environment: env-status.json store 200 (2026-10-28T21:10Z). Playwright Chromium, a fresh context per case, `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720.
Scripts: `c-round-234/c234.cjs` (rows), `c234play.cjs` (audio output), `c234drop.cjs` (drag-drop probe). Results: `c-round-234/out/*.json` and screenshots.

## Rows

| Row | Result | Evidence (both viewports unless noted) |
|---|---|---|
| C-SCOPE-234 | PASS | HEAD `db5c297`. Only the 6 grants are `M`, plus the 4 new files. Frozen and root `sha256sum -c` give rc 0. Protected files: `git diff --quiet` rc 0. The tree was rechecked at the end of C's phase: identical (`git-status-start.txt`, `changed-sha256-start.txt`). The 2 removed test lines are the granted replacements (key list, ST19 path list). |
| C-UNIT-234 | PASS | tempo-seed 6, tempo-seed-ui 8, strings 64, studio-lab-demo 14, tempo-ui 12: **104/104**, rc 0 (`unit.log`). |
| C-SEED-STEM | PASS | Tempo `120`, `1/4`, grid-seconds `0.5`, Snap `on`. Bars marks: 92 at 1440, 76 at 1280. The status is exactly `“ღამის პულსი · პულსი” added to the Music track at 00:00.000.` + seeded + ` Snap on — grid 1/4 (G)`. 0 page errors. |
| C-SEED-ENTER | PASS | Enter on `demo-synth-mix` gives the same state, with the `… · სრული მიქსი` title. |
| C-NO-BPM | PASS | soft-impact; middle-east; slow-rise then hero-music: tempo empty, `1`, `off`, 0 marks. `/\b120\b/` is not in `body.innerText` in all 6 cases. |
| C-MIXED | PASS | After soft-impact nothing changes. After stem-bass (placed at 2.000): 120, `1/4`, on, with the bass title. |
| C-USER-WINS | PASS | (a) 90 is kept and the status has no `from “`. (b) After 90 then cleared, the tempo stays empty and the grid stays `1`. (c) Enter in the empty field, then Tab, then Add pulse: **seeds** 120/`1/4`/on. |
| C-HAND | PASS | (a) Grid `0.5` chosen first: 120, `0.5`, on; the status reads "Snap on — grid 0.5 s (G)". (b) g, g: 120, `1/4`, `off`, and the status has no "Snap on". |
| C-ONESHOT | PASS | (a) 100 after the seed, then Add lead: the tempo stays 100. (b) Ctrl+Z: 0 clips; 120, `1/4` and on remain ("Undo: Add — …"). Extra case: Delete the clip, then Add soft-impact: 120 remains. |
| C-SNAP | PASS | A 0.7 s drag ends at `0.500`. An Alt drag of 0.3 s ends at `0.800`. An extra 0.2 s drag ends at `1.000`, with no jump larger than one division (F1 is not triggered). |
| C-EXPORT | PASS | Seeded WAV and WAV after clearing the tempo: sha256 `1fea093b…` is the **same**. 48 kHz, 24-bit, stereo, 768000 frames = 16.000 s. RMS −24.91 dB, peak 0.2967, 0 clipped samples, first sound at 1 frame. The clip stays at 0.000. Offline sources start at when=0, offset=0, duration=16. |
| C-STATUS-FIT | PASS | The Enter status (190 chars) is 16 px high, with scrollWidth = clientWidth (1416 and 1256). |
| C-BUDGET | PASS | **Method substitution:** C did not diff B's pre-change `baseline-after-add-*.png`. Instead it compared the seeded build against the unchanged no-BPM path (soft-impact) in the same build, which isolates what the seed adds. Text inventory outside the timeline, after Add with a BPM vs. without one. At 1440 both have 102 entries. Every difference is clip content: the title, the 00:16 vs 00:02 length, and the status text. At 1280, 86 vs 76: the extra entries are 2 library option titles (პადი, მელოდია) that come into view because the selection is in the synthetic group. That is library content scroll, not a new line. Bars numerals are inside the timeline. No new persistent strip or line. |
| C-REF-234 | PASS | See the table below. C re-fetched manual chapter 9 on 2026-10-28. The 9.1.1 and 9.2 quotes are confirmed, and nothing there says adding a clip changes the Set tempo (the read covered 100k of 123k chars). |
| C-LESSON-234 | PASS | `lessons.md` has 57 lines. L43–L46 are present (l.29–32). Doc 182 cites L45 (l.20). |
| AN-REVIEW-234 | PASS | l.4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 234 PASS)`, the same line form as docs 180/181 (C checked `sed -n 4p`: `**სტატუსი:** Completed (C round 232/233 PASS)`). The 7 TEMPLATE `## ` headings appear in order. Cited ids TS1–TS6, TU1–TU8, DL-BPM, ST17–ST19 and MU-A all exist (grep). |
| LAB-SMOKE-234 | PASS | Seeded project, Play: 1 AudioBufferSourceNode started (when 0.05, offset 0, dur 16). Analyser on the destination: RMS alternates about 0.011 and 0.0003 every 250 ms, i.e. the 120 BPM pulse. After Pause the RMS is 0. The playhead moved about 80 px (about 2.0 s at 40 px/s). 0 page errors. |
| C-SHOTS-234 | PASS | `out/empty-*.png`, `seeded-stem-*.png`, `seeded-enter-*.png`, `nobpm-*.png`, `budget-*.png`, `play-*.png`, `drop-*.png`. |
| Auth (task standing check) | PASS | In a new context with no credentials: `/studio-lab` opens the demo and `auth_user` is null. `/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`. `api/studio-token` returns 401 with no header. A fake Bearer gets 500 "Unable to prepare Studio access" and no token (backend unavailable in cloud). |
| gate | gate | Full vitest, typecheck, lint, build, verify, e2e smoke: root gate. |

## Extra probes (beyond the rows)
- **Library drag-drop** onto the Music lane, with a real mouse: the clip lands at 7.400 (Snap was still off at the drop), then the seed runs: 120, `1/4`, on, and the status is the placement text + seeded + Snap on. Both viewports (`out/c234drop.json`).
- **After a seed, selecting the 1 s grid** works: division `1`, Snap on, and the clip snaps to 1.000. The grid select lists the seconds steps (10 … 0.1 s) and the musical ones (bar … 1/32). The metronome is enabled.
- Clearing the tempo after a seed sets the grid to 1 s and leaves Snap on. This is the existing `changeTempo` behaviour.

## Ableton conformance (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| Tempo from the asset | Deliberate deviation (Saba decision 3). Manual 9.1.1: tempo is a Set value. |
| Musical grid; snapped moves; Alt bypass | Confirmed (6.10 and the riOD video per B; the Alt behaviour was observed in CZABA). |
| Tempo does not stretch audio | Confirmed in behaviour (9.2 warp-off; byte-identical export). |
| Two rulers | Confirmed (6.1 per B). |
| Live's default grid and Snap | Unconfirmed (not in the manual). CZABA follows Saba's decision. |
| 1/4 default | Deliberate deviation, a stand-in until SABA-B-11b. |
| Tempo outside Undo | Deliberate deviation D-29z30 R4. Sent to Saba as SABA-Q-TEMPO-UNDO. |
| Seconds grid | Deliberate deviation (Saba; Live has none). |

## For B
- **A-R234-REVIEW-M1, Medium** (A's own reviewer; A confirmed it in TU8): when an initial arrangement already has a clip, the seed's status text is overwritten when the project mounts. C tried to reach it in `/studio-lab` through a reload: add pulse, reload → 0 clips, tempo empty, 1 s, Snap off. There is no IndexedDB, and localStorage holds only `czaba_session_id`. Clearing the tempo and reloading again gives the same empty state (`out/c234reload.json`, both viewports). So it cannot be reached here today. It is not a C-found bug, and its Medium severity stays open for B. B should rule on it before SRW-21 or any initial-arrangement path ships.
- Clearing the tempo after a seed keeps Snap on with a 1 s grid. This is existing behaviour; just noting it in case stage 2 wants a different rule.
- No browser row was skipped.
