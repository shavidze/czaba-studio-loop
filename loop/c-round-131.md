# C — Round 131 verification: VISUAL-A V-0.2c1 — video import messages in English

Verifier: C (Opus 5.5) · 2026-10-24 · env-status: store 200 (09:06:45Z, round 131) · Playwright Chromium (headless), a fresh context for each session, at 1440×900 and 1280×720.

**Verdict: PASS.** `browserVerified` = `realVerified` = **true**. 0 new bugs from this round. One **Low pre-existing** signal: C-R131-01.

## 1. Rows

| ID | Result | Evidence |
|---|---|---|
| T131-TARGETED | **PASS.** The same 13-file list A ran: **13 files, 233 tests**, all green. Counts per file match A: strings 16, video 27, video-import-status-ui 4, export-mp3 11, waveform-zoom 9, ArrangementContext 21, gesture-reentry 14, status-announcement-ui 33, video-sync 58, video-fades 12, video-fades-ui 10, collection-load-status 10, failed-source-refusal 8 | `c-round-131/out/vitest.log` |
| SOURCE-SCOPE | **PASS.** HEAD `ba54297`. `git status` shows 7 ` M` and 2 `??`, and no other path. The frozen list (935 entries) is OK at the start and the end. The 5 protected files have an empty `git diff ba54297`. My start sha256 of the 9 paths equals A's end hashes, and it is unchanged at the end, so no source changed during C's phase. The start copies equal `git show ba54297` | `out/git-status-{start,end}.txt`, `out/c-start-sha256.txt` |
| AN-REVIEW | **PASS.** I made my own `diff -u` against the start copies (340 lines, identical to A's `granted.diff`). **strings.ts:** only `studioVideoStrings` was added, and there is still no import. **video.ts:** the import plus l.66/71/72/85; the `extension ? … : file.type \|\| …` condition is unchanged. **video.client.ts:** the import plus the 8 literals; the timeout, the `reason` order and the abort checks are unchanged. **Context:** 4 hunks: the import, `opening` (l.2231), `addToTrackFailed` + `historyAddVideo` (same hunk), `added({…})` with the same `formatArrangementTime` arguments, and `importFailed` with the same detail expression. No condition, dependency array or call-order change. l.546–547, the `გადატანა` label and l.3462 are untouched. **Doc 106:** only l.4. **Tests:** imports, literal → module with the same matcher (`toBe` / `toContain`), ST13 shortened to 4 lines, ST14–ST16, and the new file. VI1–VI4 use hand-written English. No skip, only or todo. **Meaning check** (side by side with the Georgian): V1–V15 keep every fact. V13 is "won't go into the export" → "it is not in the export". Shell writes are listed in A §8 | `out/diff-c.txt` |
| VID-ADD (both) | **PASS.** (a) The observer saw `Opening “beeps-6s-h264-aac.mp4”…`, then `“beeps-6s-h264-aac.mp4” added to the video track: 00:00.000 — 00:06.000`. The clip is on the video lane at 0 and lasts 6 s (an independent `<video>` probe gave 6.000). The playhead went from 1.5 to 0. (d) The Undo title is `Undo: Add video — beeps-6s-h264-aac.mp4`. Undo leaves 0 video clips and the status `Undo: Add video — …`. Redo restores the clip, with the status `Redo: Add video — …`. (b) webm: `00:06.000 — 00:12.008` (probe 6.008), seek to 6. (c) .mov is accepted: `00:12.008 — 00:15.008`, seek to 12.008. The Opening text was seen for every file | `out/vid131-add-1440-r2.json`, `out/vid131-add-1280-r1.json`, `shots/add-c-1440-r2.png` (3 video clips, playhead at 12.008, English status) |
| VID-REJECT (both) | **PASS.** (a) V6 exact. (b) `“doc.pdf”: the format is not video (.pdf).` (c) `“noext”: the format is not video (unknown type).` (a File with type `''`, made in the page). (d) `Opening “broken.mp4”…` → V9 exact. (e) V6 · V7 joined with ` · `. In every case the clips were unchanged and the Undo stayed `Undo` (disabled), so no history entry | `out/vid131-reject-{1440,1280}-r2.json`, `shots/rej-e-*.png` |
| VID-NOAUDIO (both) | **PASS.** The Export list reads `Original video sound (noaudio-2s-h264.mp4): The video has no sound`. At 1440, r3 used the shared `media/noaudio-2s-vp9.webm` (sha256 `1fbf7560…`, which matches `SHA256SUMS.txt`). It was added at `00:02.000 — 00:04.000`, and the second line is the same English text. The lane badge `ხმა არ არის` was subtracted by name. At 1280×720 the list sits below the dialog fold; this layout is not new, and the text was read from the DOM | `out/vid131-noaudio-1440-r3.json`, `out/vid131-noaudio-1280-r1.json`, `shots/noaudio-export-1440-r3.png` (both English lines) |
| VID-LANE-DROP (both) | **PASS.** The synthetic drop reached the handler: the default was prevented. The webm drop on the music lane gives `Drop the video on the video track.`, and the wav drop gives V6. No clip and no history entry | `out/vid131-drop-*.json`, `shots/drop-webm-1280-r1.png` |
| GEO-COUNT (both) | **PASS.** 0 Georgian characters, after subtraction, in the status, the Undo title, the Export video-sound list and every observer transition, in all valid runs. Subtracted by name: the lane badge and the hint only, which sit outside the measured regions; no track name occurred in a V text | `out/aggregate.json` |
| LAYOUT (both) | **PASS.** S0 and S1 against `c-round-125` bbox baselines: 0 deltas at both viewports. S2 (Export) differs only in button keys from V-0.1, already known. After the longest message (the V6 · V7 batch), only the status element changed, keyed by its text. All other boxes (110 at 1440, 102 at 1280) are within 1 px. The status box is unchanged: 12,838,1416×16 at 1440 and 12,658,1256×16 at 1280, one line, with scrollWidth equal to clientWidth. The document is not wider than the viewport | `out/layout-compare.json`, `out/longmsg-*.json`, `shots/longmsg-1280.png` |
| REG-130 (1440) | **PASS.** `Loop created and turned on: 00:01.000 — 00:03.000.` and `Nothing to play — add a clip from the library first.` exact. The rest of the loop/play set also passed | `out/reg131-copy130-{loop,play}-1440-r1.json` |
| G131-3 (last, alone) | **PASS.** `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`, at both widths. The token API returns **401**. The fake-Bearer 403 check is **BLOCKED** (backend unavailable in cloud) | `out/g131-3.json`, `shots/g131-3-protected-1440.png` (lock + Sign In) |
| PX-NET / REG-HYD | **PASS.** Every valid session had 0 forbidden requests, 0 `Authorization` headers, 0 hydration errors and 0 page errors. Only 2 cart-noise lines per session | the `net` field of each JSON |

**Inconclusive (cannot be reached in cloud Chromium; covered only by ST14/ST15/VI):** V2, V5, V11, V12, V13, V14 and V15.

**Gate rows (not claimed):** the full vitest suite, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 2. Invalid runs and harness reruns
- **`vid131 add 1440 r1`:** ENV-FIRST-LOAD. The first load of the fresh dev server hit a hydration error and an "Invalid hook call". The r2 rerun was clean (`out/INVALID-vid131-add-1440-r1.json`).
- **REJ-c r1:** Playwright `setInputFiles` with `mimeType: ''` sends `application/octet-stream`, and the app correctly wrote `(application/octet-stream)`. This is the real-world observation. In r2, a synthetic `File` with type `''` went through the real `change` handler and gave `(unknown type)` exactly.
- **NOAUDIO 1440 r1/r2:** by mistake, C used its own MediaRecorder WebM instead of the shared `media/noaudio-2s-vp9.webm`. The r1 file had no Duration and was rejected; that is how C-R131-01 was found. r2 added a Duration element (`tools/fixdur.py`). **r3 used the shared fixture**, and that is the row's evidence.
- **C's own media**, all under `c-round-131/media/`: `doc.pdf`, `noext`, `noaudio-2s-vp9.webm` and `noaudio-2s-vp9-raw-noduration.webm`. All are synthetic. Nothing was uploaded.

## 3. Bugs
- **C-R131-01 — Low, pre-existing, not a regression.**
  - **Problem:** a browser-recorded WebM (from MediaRecorder) has no Duration in its header. `probeVideoFile` rejects it on `!Number.isFinite(duration)` with V9, "the browser could not open this video — try MP4 (H.264) or WebM". The message is misleading: the file is a playable WebM.
  - **Status:** round 131 did not change this condition. It is a candidate for `deferred_low_polish` or a product question.
  - **Repro:** `c-round-131/media/noaudio-2s-vp9-raw-noduration.webm` → + own video. It was found through C's synthetic file; the shared fixture has a duration and is accepted.

## 4. Notes for B
- V-0.2c1 is ready for `c_pass`. A's Architecture note stands for the checkpoint.
- The fresh-load status `დემო კოლექცია მზადაა…`, the `+ საკუთარი ვიდეო` button and the empty-lane hint are still Georgian. They belong to V-0.4/V-0.5 and are outside this round's scope.
- **Ableton:** the CZABA requirement is met. Ableton correspondence is not applicable or unconfirmed, since this round changes text only.

## 5. Screenshots opened and described
- **Opened (11):**
  - `add-c-1440-r2`: 3 video clips; playhead at 12.008; English status.
  - `add-a-1280-r1`: 1 clip at 0–6; status `… 00:00.000 — 00:06.000`; Undo is enabled.
  - `rej-d-1440-r2`: the V9 status; no clip; Undo is disabled.
  - `longmsg-1280`: the V6 · V7 batch on one line; nothing moved.
  - `drop-webm-1280-r1`: V8; the lanes are empty.
  - `drop-wav-1440-r1`: V6; no clip.
  - `noaudio-export-1440-r2/r3`: two English video-sound lines.
  - `noaudio-export-1280-r1`: the list is below the fold.
  - `g131-3-lab-1440`: the workspace and the demo badge.
  - `g131-3-protected-1440`: the lock with Sign in required.
- **Not opened:** the other start and intermediate shots, the S0/S1/S2 layout shots, the REG-130 shots and `g131-3-protected-1280`. Those rows rest on DOM measurements in `out/`.
- **End check after every browser session:** the grant hashes are unchanged, the frozen list is OK, and `git status` has 9 paths.
