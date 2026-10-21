# A — Round 2 report (C-R1-01..04, SRW-02, SRW-03, SRW-04)

Date: 2026-10-07 · Implementer: A (Claude Opus 5.5) · Task: `tmp/studio-real-loop/current-task.md`.
Status: implementation done; waiting for C. **No acceptance ID is claimed as PASS.**
Advisor: used before writing code, once more when the measured video drift contradicted its earlier advice (see §6), and once before finishing.

## 0. Pre-flight gate (posted before editing)

- **Assumptions**
  1. The video `<video>` stays `muted` forever; the file's audio is decoded into an `AudioBuffer` and becomes a normal mix lane (D-13). Live playback and export therefore share one graph.
  2. The audio clock (`AudioContext.currentTime` via the transport anchor) is the master; video follows with seek/play.
  3. Telling "no audio track" apart from "decode failed" is not possible from `decodeAudioData` alone (Chrome throws `EncodingError` for both). I use a byte-level audio-track marker check (`soun`, `A_OPUS`, `A_VORBIS`, `A_AAC`, `OpusHead`, …), and only after a decode failure. Verified against all fixtures (markers present exactly in the 4 files with audio).
  4. "Position" for Play is the single position (D-15). Undo/Redo does not move the playhead (D-12, untouched).
- **Smallest version:** pure modules (`transport.ts`, `video.ts`) + one client module (`video.client.ts`) + one component (dock); context gets import/decode/scrub; lane/clip/ruler/dialog/workspace get the UI. No loop, grid, multi-select, master or panel-resize UI.
- **Files:** exactly the §2 list (see §2 below).
- **Success:** `npx vitest run app/lib/arrangement` green with the named tests; full vitest ≥ 517 + new; tsc 0; biome owned paths 0; build OK; protected hashes OK; browser: picker + drop import, rejections, sync drift, scrub counter, export oracle.

## 1. R2-V0 — FB-15 reproduction (before writing import code)

**Browser codec facts (gstack, `HeadlessChrome/145.0.7632.6`):**

| `canPlayType(...)` | result |
| --- | --- |
| `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` | `probably` |
| `video/webm; codecs="vp9, opus"` | `probably` |
| `video/quicktime` | `""` |
| `video/mp4` (extra) | `maybe` |

So this gstack Chromium **does** support H.264/AAC. MP4/MOV positive paths were exercised here (not only env-limited). `video/quicktime` is `""` but the `.mov` fixture still probes and plays: the probe, not `canPlayType`, is the gate.

**SRW-01 build:** there was no import path at all (video lane said "ვიდეოს დამატება შემდეგ ეტაპზე ჩაირთვება").

**Prototype** (`file:///…/output/studio-workspace-prototype/index.html` loaded in gstack):

| Case | Result |
| --- | --- |
| Picker MP4 (`beeps-6s-h264-aac.mp4`) | accepted, clip 0–6.000 |
| Picker WebM (`beeps-6s-vp9-opus.webm`) | accepted, clip 6–12.008 |
| Picker MOV (`clip-3s-h264-aac.mov`) | accepted, clip 12.008–15.008 |
| OS-file drop on video lane (page-JS `DataTransfer` + `File`, `clip-4s-vp9-opus.webm`) | **rejected**: 0 clips added, hint "აუდიო გადაიტანე მუსიკის, სტემების ან SFX ხაზზე. საკუთარი ვიდეოსთვის გამოიყენე + საკუთარი ვიდეო." |
| Empty-MIME `.mov` drop (`File` from `clip-3s` bytes, `type:''`) | **rejected** with the same hint, 0 added |

C's hypotheses:
1. *Lane `ondrop` only accepts library `text/plain`* — **confirmed** (`workspace.js:1087–1100`: `assets.find(entry => entry.id === event.dataTransfer.getData("text/plain"))`, else the warn above; files are never read).
2. *Video lane sets `dropEffect="none"`* — **confirmed by code** (`workspace.js:1052`: `dropEffect = lane ? "copy" : "none"`, lane 0 = video). Note: reading `dt.dropEffect` after a synthetic `DataTransfer` dragover returned `none` on *every* lane (also lane 1 and in the new build), so the runtime value is a synthetic-event artifact, not evidence.
3. *Real Studio's MIME allowlist rejects an empty `file.type`* — **confirmed by code**: `StudioContext.tsx:436–437` and `components/studio/VideoUploadZone.tsx:20–26` use `validTypes.includes(file.type)` with `['video/mp4','video/quicktime','video/webm','video/x-msvideo']`; `''` is not in it.

## 2. Files changed (subset of task §2)

Modified: `app/types/arrangement.ts`, `app/lib/arrangement/model.ts`, `schedule.ts`, `graph.client.ts`, `__tests__/model.test.ts`, `__tests__/schedule.test.ts`, `__tests__/graph.test.ts`, `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementTransport.tsx` (**not changed** in the end — ↤ already calls `seekTo(0)`), `ArrangementRuler.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementExportDialog.tsx`, `index.ts`.

Created: `app/lib/arrangement/video.ts`, `video.client.ts`, `transport.ts`, `__tests__/video.test.ts`, `__tests__/transport.test.ts`, `app/components/arrangement/ArrangementVideoDock.tsx`, `docs/implementation/2026/quarter-IV/011-studio-lab-video-transport.md`, `../tmp/studio-real-loop/a-round-2.md`, `../tmp/studio-real-loop/a-browse.json` (gstack state). Extra artefacts (not source): `tmp/studio-real-loop/a-r2-1440x900.png`, `a-r2-1280x720.png`. Helper scripts live in `%TEMP%` (`a-r2-helpers.js`, `a-setup.js`, `a-sync.js`, `a-export.js`, `a-oracle.js`, `a-scrub.js`, `a-scrub2.js`, `a-home.js`, `a-mute.js`, `a-pp.js`, `a-seeks.js`, `a-drag.js`, `a-edit.js`, `a-move.js`).

Not touched: `ArrangementLibrary.tsx`, `studio-lab-demo.ts`, `routes/studio-lab.tsx`, `demo-synth.ts`, `peaks.ts`, all protected/forbidden files. No installs, no deletions, no commits.

## 3. What was implemented (short)

- **C-R1-01** `transport.ts`: anchor `{startAt, position, holdUntil}`, `positionAt = max(0, position + max(t, holdUntil) − startAt)`. Fresh start → `holdUntil = startAt` (holds at `from`). Continuous reschedule (`reschedulePlaybackAnchor`) keeps the previous `holdUntil`, so the position function is identical before/after the handoff, even when the previous anchor is still holding. Delete Time passes `remapTime` as the map → one jump. Context: `livePosition`, `startGraph`, `syncPlayback`, `seekTo`, Play all go through these.
- **C-R1-02** `studio-container` class on the workspace root (root CSS `:has()` rules then apply). No CSS/root edit.
- **C-R1-03** no code (D-12).
- **C-R1-04** status `<output>` is its own full-width wrapping row (`basis-full break-words`, no `truncate`); range / clip / shortcuts follow on the next row.
- **SRW-02** "＋ საკუთარი ვიდეო" + hidden `<input accept="video/*,.mov,.mkv,.m4v" multiple data-testid="arrangement-video-input">`; video lane body `data-testid="arrangement-video-dropzone"` (dragover with `Files` → `preventDefault`, `dropEffect='copy'`, ring + "ჩააგდე ვიდეო აქ"); audio lanes also accept the drop only to reject it with the required messages. `classifyVideoFile` → probe (10 s timeout always cleared, URL revoked on failure) → `appendVideoClip` (one history entry `ვიდეოს დამატება — <name>`) → `seekTo(clip.start)`; playback is paused first. Imports run in one promise queue in given order; the status accumulates one message per file. `videoSources` registry (no `'local'` origin); durations merged into `sourceDurations`; object URLs revoked only on unmount.
- **SRW-03** `ArrangementVideoDock` (one `<video muted playsInline>`; empty / gap / active states; `data-testid` dock + gap). Stopped: `seekSfxVideo` with abortable controller per change. Playing: native play; hard seek if drift > 80 ms, ≤ 1 per 250 ms; forced seek on source change or a non-continuous clip boundary; `play()` rejection (non-`AbortError`) → `pausePlaybackWithStatus('ვიდეოს დაკვრა ვერ მოხერხდა — სცადე MP4 (H.264) ან WebM.')`. Pre-roll: in a gap the next clip is loaded+seeked 0.5 s early but stays **paused and hidden**; adjacent clips of a different source start `play()` 50 ms early. Video audio decoded in the background on the shared 48 kHz decode context; on success → `buffersRef`, peaks, forced continuous reschedule if playing. `planSchedule` includes video clips; `applySchedule` creates trackGain+panner for every track; `isTrackAudible` treats video like any track. Video lane M/S/Volume with the exact aria labels + caption "ორიგინალი ხმა". Export dialog: per video source `ვიდეოს ორიგინალი ხმა (<name>): შედის / გამორთულია (M/Solo) / <audioNote> / იშიფრება — დაელოდე`; WAV disabled while a used source is decoding; silence note when no clip has a sounding buffer; video render option disabled with its D-11 reason.
- **SRW-04** ruler handle `role="slider"`, `aria-label="Playhead"`, `aria-valuenow` (s), 12×20 px, pointer capture; stopped → position (and frame) follow; playing → `scrubPlayhead` reschedules ≤ 1/100 ms (`shouldRescheduleScrub`) and `tick` stops overwriting the position while scrubbing; release → one fresh reschedule. ←/→ on the focused handle = ±0.1 s (global clip-nudge skips `role="slider"` targets). `Home` → 0 (ignored in typing targets and on range inputs).

## 4. Changed round-1 tests (contract change, §5.3)

| Test | Reason |
| --- | --- |
| `schedule.test.ts` › `excludes the video track this round` → replaced by `plans video-track clips so the original video sound plays` | D-13: video clips are now planned. |
| `schedule.test.ts` › `honours the until bound` — expectation `['early','m']` → `['early','v','m']` | Same contract change: the video clip `v` (start 0) is now inside the window. |

No round-1 test asserted "`isTrackAudible` false for video" explicitly; new tests cover the new behaviour instead. All other round-1 tests are unchanged.

New tests: `video.test.ts` (22, incl. `resolveVideoTarget` ×4 and `nextVideoSeekLead` ×2), `transport.test.ts` (8); `schedule.test.ts` +4 (`plans a muted video clip too…`, `treats the video track like any other track`, `solo on an audio track silences the video lane`, `solo on the video lane silences the audio lanes`); `graph.test.ts` +3 (`creates a video trackGain…`, `keeps a muted video clip scheduled with track gain 0`, `solo on the video lane silences audio lanes and vice versa`); `model.test.ts` +3 (`appendVideoClip` sequential, invalid duration, `trimClipEnd on a video clip stops at the probed duration`).

## 5. Command tails (verbatim)

```
$ npx vitest run app/lib/arrangement          (final, after review fixes)
 Test Files  6 passed (6)
      Tests  93 passed (93)

$ npx vitest run
 Test Files  38 passed (38)
      Tests  557 passed (557)

$ npx tsc --noEmit ; echo TSC_EXIT=$?
TSC_EXIT=0

$ npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx
Checked 27 files in 53ms. No fixes applied.

$ npx biome check ./app
Checked 290 files in 131ms. No fixes applied.
Found 218 warnings.
Found 1 info.
(0 errors; 0 format diffs; no diagnostic in an owned file; the 218 warnings + 1 info are pre-existing, e.g. cart-helpers.test.ts:219)

$ npm.cmd run check      (allowed: read-only run showed no format/safe-fix diffs outside owned files)
Checked 290 files in 163ms. No fixes applied.
Found 218 warnings.
Found 1 info.

$ npm run build ; echo BUILD_EXIT=$?
✓ built in 2.19s
BUILD_EXIT=0

$ node -e "…protected-baseline.json…"     (run before and after npm.cmd run check)
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK

$ git status --short
 M app/lib/__tests__/download-routes.test.ts      (pre-existing, other agent; hash OK)
 M app/routes/account.downloads.tsx               (pre-existing; hash OK)
 M app/routes/api.studio-token.ts                 (pre-existing; hash OK)
 M app/routes/studio.$productId.tsx               (pre-existing; hash OK)
?? .agents/  ?? .claude/agents/ableton-arrangement-expert.md  ?? .codex/  ?? AGENTS.md   (pre-existing, not mine)
?? app/components/arrangement/  ?? app/contexts/ArrangementContext.tsx  ?? app/data/studio-lab-demo.ts
?? app/lib/arrangement/  ?? app/routes/studio-lab.tsx  ?? app/types/arrangement.ts
?? docs/implementation/2026/quarter-IV/010-studio-lab-arrangement-core.md
?? docs/implementation/2026/quarter-IV/011-studio-lab-video-transport.md
```

## 6. Dev smoke (gstack browse, own state `a-browse.json`, existing :5173)

Drags are synthetic `PointerEvent`s, drops are synthetic `DragEvent`s with `new DataTransfer()` built from files that gstack `upload`ed into a scratch `<input id="a-stage">` I appended to the page. Keys are synthetic `KeyboardEvent`s on `document.body`. Positions are read from the rAF-rendered `arrangement-position` text (up to one frame stale, so my drift numbers can be ~16 ms optimistic versus C's audio-clock harness). Source counts come from a patched `AudioBufferSourceNode.prototype.start/stop`.

| # | Action | Observed |
| --- | --- | --- |
| 1 | Fresh load 1440×900 | 1 `<video>`; dock "ვიდეო ჯერ არ დაგიმატებია"; dropzone "ვიდეო არ არის — „＋ საკუთარი ვიდეო“ ან ჩააგდე ფაილი აქ"; `scrollHeight 900 = innerHeight`; console errors 0 |
| 2 | Picker `beeps-6s-vp9-opus.webm` | clip 0–6.008 (240.32 px @40), status „beeps-6s-vp9-opus.webm“ დაემატა ვიდეოხაზზე 00:00.000 — 00:06.008, Undo label `ვიდეოს დამატება — beeps-6s-vp9-opus.webm`, peaks drawn |
| 3 | Drop `clip-4s-vp9-opus.webm` on dropzone | dragover `defaultPrevented=true`; clip 6.008–10.016 (starts exactly at first end) |
| 4 | Ctrl+Z / Ctrl+Shift+Z | Undo removes only the 2nd clip; Redo restores the **same id** (`a85986de…`) |
| 5 | Drop `tone-2s.wav` on dropzone | audio rejection message, Undo label unchanged, clip count unchanged |
| 6 | Drop `broken.mp4` | „broken.mp4“: ბრაუზერმა ეს ვიდეო ვერ გახსნა — სცადე MP4 (H.264) ან WebM. — history unchanged |
| 7 | Drop page-built `doc.pdf` | „doc.pdf“: ფორმატი არ არის ვიდეო (.pdf). — history unchanged |
| 8 | Drop webm on music lane / wav on music lane | `ვიდეო ჩააგდე ვიდეოხაზზე.` / audio rejection — history unchanged |
| 9 | Drop `File` from `clip-3s-h264-aac.mov` bytes with `type:''` | classified video, **accepted** 10.016–13.016, audio decoded (peaks) |
| 10 | Drop `noaudio-2s-vp9.webm` | clip added, label "ხმა არ არის", no peaks |
| 11 | Sync (R3-V1-like): beeps 0–6.008, clip-4s moved to 8.008–12.016 (gap), Home, Play, 52 samples / 250 ms; excluding 300 ms after 0 and 8.008 | **Final code, 3 runs:** median 0.006 / 0.024 / 0.008 s; max 0.063 / **0.219** / **0.110** s (see §9). Gap→clip-2 |d| ≤ 0.007 s. Gap samples always show the gap element + `video.paused`; `video.muted` true throughout. Earlier versions: play gated on advance → median 0.048 (constant −50 ms lag); intermediate → median 0.007 / max 0.043 |
| 12 | Stopped ruler seeks 1/3/5/9 s (wait 400 ms) | `video.currentTime` 1, 3, 5, 0.992 → drift 0 each, paused |
| 13 | Play/Pause ×5 (10 Space keydowns, 8 ms apart) at 20.000 | 20.000 → **20.000**, 5 source starts total (1 clip at 20 s), ends paused |
| 14 | Play @0, toggle video-lane M at 0.8 s, 6 samples/100 ms, unmute | `paused=false`, `muted=true` throughout; source starts Δ0, stops Δ0 (no restart); aria-pressed true→false |
| 15 | Space ×10 synthetic burst (8 ms) while playing inside a video clip | 15 starts = 5 plays × 3 clips (no doubling); ends playing with `video.paused=false`; then Pause → `video.paused=true`; 1 `<video>` |
| 16 | Export oracle (R3-V3-like): beeps imported at 0, left-trim +20 px → offset 0.5, header move → start 2.000 (status "start 00:02.000, length 00:05.508, source offset 00:00.500") | WAV 2 ch / 48000 / 24-bit, 7.508 s; beep onsets (|x|>0.05) at **2.5, 3.5, 4.5, 5.5, 6.5**; 0–2 s max 0; `max|out[96000+k] − decode(fixture)[24000+k]|` = **5.96e-8** ≤ 2⁻²² over 264000 frames × 2 ch (fixture decodes to 6.000 s while the video is 6.008 s → last 8 ms silent); dialog "ვიდეოს ორიგინალი ხმა (beeps-6s-vp9-opus.webm): შედის" |
| 17 | Same with video-lane M | dialog "… გამორთულია (M/Solo)"; WAV all samples **0** (only clip on the project) |
| 18 | + `noaudio-2s-vp9.webm` | dialog lists "… (noaudio-2s-vp9.webm): ვიდეოს ხმა არ აქვს"; WAV valid 9.508 s, button enabled |
| 19 | Playhead drag while playing: 60 moves × 16 ms (1.19 s) | **10** reschedules during drag + **1** on release (1 source per reschedule here); position 0.406 → 3.356 → release 3.594, still playing, video playing; Undo label unchanged (no history) |
| 20 | Playhead drag while stopped: 20 × 8 px | position 4.025, `video.currentTime` 2.525 (= 4.025 − 2 + 0.5), 0 sources |
| 21 | Select video clip, focus handle, → then ← ← | 4.025 → 4.125 → 4.025; clip did **not** move; `aria-valuenow` 4.025 |
| 22 | Home while playing at 4.567 | → 0.059 after 120 ms; 1 reschedule |
| 23 | Body-range drag on the video clip while playing (10 moves × 30 ms) | range 3.525–4.875 created; position kept advancing 0.371 → 0.710 (no jump) |
| 24 | Layout 1440×900 / 1280×720 (cookie declined) | `scrollHeight === innerHeight` (900 / 720); after `scrollTo(0,500)` header top 0; dock 288 px wide, fully visible (1280×720: dock 482–671, footer top 671, library list scrolls 228/194). Screenshots `a-r2-1440x900.png` (active frame), `a-r2-1280x720.png` |
| 25 | Status at 1440 with selected clip | status `scrollWidth 1416 = clientWidth`, `scrollHeight 16 = clientHeight` (own row). I did **not** reproduce the exact long blocked-trim message with a range + selected clip; C's R2-F3 check is still needed |
| 28 | R2-V3-like: beeps @0, left-trim 0.5, split at 3 (Ctrl+E), range 1.025–2.025, Delete; SFX "Slow rise" @0 also cut | clips video 0.5–1.025 (off .5), 1.025–2.0 (off 2.025), 2.0–5.008 (off 3); audio 0–1.025 + 1.025–4.0. Playback drift excluding 300 ms after start/boundaries, **final code, 3 runs:** median 0.038 / 0.036 / 0.026 s, max 0.065 / 0.045 / 0.042 s (before §7a: max 0.113) |
| 29 | Regression after review fixes | mute: paused false / muted true, starts Δ0; Space ×10 burst: 10 starts = 5 × 2 clips, ends playing with video playing, Pause → paused; scrub while playing: 22 starts = 11 reschedules × 2 clips in 1.23 s + 1 on release; stray drop on header prevented; wav drop rejected, history unchanged |
| 27 | R2-F1-like: rAF trace of the position text from Play @0, header-drag the 2nd video clip +0.5 s at ~0.7 s, 700 ms more | 81 frames; first frame = from (0.000); **min delta 0** (never backwards); max delta 0.040 s near the edit (frame deltas around the edit: 0.021 0.008 0.021 0.040 0.019 0.011 …). With text sampling I cannot tell a slow frame from a 20 ms step → C's audio-clock harness decides the ≤ 20 ms handoff criterion |
| 26 | Network during import of webm + mov | only `GET blob:http://127.0.0.1:5173/…` (206). No POST of the file. Root GA (`google-analytics.com/g/collect`, `en=scroll`, consent denied) fired independently — root-owned, carries no file data. Fresh load: no `studio-token / recording / /api/download / r2 / cloudflarestorage` |

## 7. Code review (actual `code-reviewer` subagent)

Summary quoted: *"Transport anchor fix, privacy constraint, and TS/project rules are clean. The real risks are a data-loss path (stray file drop navigates the tab), unbounded memory in video audio decoding (full-file reads, concurrent decodes, no size cap), and two `<video>` element race/edge cases that can show frame 0 or leave video paused while transport plays."* Score 7/10. Findings and actions:

| # | Sev | Finding | Action |
| --- | --- | --- | --- |
| 1 | High | File dropped outside a lane opens it in the tab (project lost) | **Fixed**: window `dragover`/`drop` guard in `StudioWorkspace` (`preventDefault`, `dropEffect='none'` unless already handled). Browser: drop on header → both events `defaultPrevented`, URL stays `/studio-lab` |
| 2 | High | Memory: full-file reads, second read for marker, concurrent decodes, no size cap | **Fixed**: decodes serialized (`decodeChainRef`); size cap 1 GiB → note `ხმა არ წაიკითხა: ფაილი 1 GB-ზე დიდია`; marker sniff reads only head+tail 8 MiB |
| 3 | Med | `play()` on an ended element restarts at frame 0 | **Fixed**: no `play()` when `video.ended` or target ≥ duration − 1/30 |
| 4 | Med | Play skipped if it lands while an `AbortError` from a quick pause is pending | **Fixed**: one retry in the `AbortError` branch when the dock still wants playback |
| 5 | Med | Probe resolving after unmount leaks the URL | **Fixed**: `signal.aborted` check after probe → revoke + return |
| 6 | Med | Import completing during a clip drag commits on top of the uncommitted preview | **Fixed**: `previewActiveRef`; import waits (50 ms poll, 30 s cap) before committing |
| 7 | Med | Failed `appendVideoClip` leaks source + URL | **Fixed** |
| 8 | Med (suggestion) | Windows drops as `application/octet-stream` | **Done** (extension fallback); test added |
| 9 | Low | Retired graphs not released while scrubbing | **Fixed** |
| 10 | Low | Caption names current clip during preroll | **Fixed** |
| 11 | Low | `isPlayingRef.current = isPlaying` during render | Not changed (same pattern as round-1 `workspaceRef`) |
| 12 | Low | slider `aria-valuetext`; `lostpointercapture`; Enter on slider adds a source | **Fixed** all three |
| 13 | Low | `<video>` without accessible name | **Fixed** `aria-label="ვიდეოს პრევიუ"` |
| 14 | Low | Silence note shown while decoding | **Fixed** |
| 15 | Low | Random 4-byte marker match in huge files | Mitigated by #2 |

The reviewer's playbackRate soft-sync alternative was **not** adopted (spec: "otherwise do nothing").

### 7a. Sync work after the review (found by my own R2-V3 smoke)

After Delete Time created a same-source media jump, drift reached −0.11 s: a boundary seek fired on a continuous boundary (0.03 s threshold) and every hard seek while playing landed ~0.1 s behind (headless VP9 seek latency), so the 80 ms rule re-triggered without converging. Changes:
- boundary seek only when drift > 0.08 (without the 250 ms limit);
- seeks of a **running** video (same source) aim ahead by a learned lead (`nextVideoSeekLead`: half-step towards the lag measured ≥150 ms after the seek, clamp 0–0.2 s, ignore |drift| > 0.3; prior 0.05 s). Seeks of a paused video (Play start, source switch) use no lead (the 50 ms hold covers `play()` start-up);
- gap preload (paused, hidden) seeks ahead by a learned start lead (prior 0.05 s);
- preroll target = virtual media time (`lead.mediaTime − 0.05`), clamped to the clip in-point.
The hard-seek rule itself is unchanged (> 80 ms, ≤ 1 per 250 ms).

## 8. Deviations (with reasons)

1. **Dock width ≈ 288 px, not 320.** `ArrangementLibrary` (`aside w-72`) is not mine this round; the dock shares that column. The wrapper uses `[&>aside]:min-h-0 [&>aside]:flex-1` so the library list scrolls and the dock stays visible at 1280×720.
2. **Video pre-roll/preload.** The spec says "on a clip boundary or source change → set src, seek, then play()". I do the src/seek up to 0.5 s early in gaps (video stays paused/hidden) and start `play()` 50 ms early only for adjacent clips of a different source. Reason: measured `play()` start-up latency (~45 ms headless) otherwise leaves a constant lag (clip after a gap measured −0.07 s). No `playbackRate` soft-sync (spec: "otherwise do nothing").
3. **`decodeVideoAudio` takes a 4th argument** (`duration`) for the D-14 20-minute guard. It returns `{buffer: AudioBuffer, reason: null} | {buffer: null, reason: 'no-audio' | 'decode-failed' | 'too-long' | 'too-large'}` instead of a bare `AudioBuffer | null`. Only `no-audio` maps to `audio: 'none'` (clip label "ხმა არ არის"); decode failure, >20 min and >1 GiB map to `'error'` (label "ხმა ვერ წაიკითხა"), with the specific `audioNote` in the export dialog.
4. **Status row**: plain wrap (`break-words`), no `line-clamp`.
5. **`ArrangementTransport.tsx` not modified** (↤ already maps to `seekTo(0)`).
6. **Adaptive seek/start lead** (§7a) — only changes where a seek lands; when it fires is per spec.
7. **Size cap 1 GiB** for audio decode (review #2), with its own note, in addition to D-14.
8. **`application/octet-stream` + video extension → video** (review #8).
9. Export dialog lists the video-sound line **per used video source** (a project can mix sources with different states); wording per line is one of the required strings.

## 9. Known gaps / not ready

- **Not ready:** none of R2/R3/R4 IDs is knowingly unimplemented. Items I could not verify myself (for C):
  - R2-F3 exact long blocked-trim message at 1440 with range + selected clip (I measured a shorter message only).
  - R3-V2 master RMS (< −80 dBFS muted, audible ≤ 100 ms after unmute) — I verified gain-only behaviour via source counters and the muted export (exact zeros), not live RMS.
  - R2-R1 regression (R1-B5, B11, B12, E1, E3, E5 with a video clip present) — not re-run by me.
  - R4-P3 `Home` inside a text input — no text input exists in the workspace; logic uses the same `isTypingTarget` guard as Space.
  - Real presses (gstack `press`) were not used this round; all keys were synthetic.
- **R3-V1 max drift is environment-sensitive here**: final code, 3 runs → max 0.063 / 0.219 / 0.110 s (medians 0.006 / 0.024 / 0.008). The outliers are clip-1 excursions with no seek trigger and irregular sampling (180–330 ms), consistent with headless decoder/main-thread starvation. Treat as a known risk; next lever would be B allowing `playbackRate` correction for 30–80 ms drift.
- Console: one `useArrangement must be used within an ArrangementProvider` at 10:55:18Z during my edit of `ArrangementContext.tsx` (Vite HMR transient); not reproduced on later loads. Other errors: root `CartProvider` → `localhost:5199` (backend off).
- Running-seek target is clamped below to the clip in-point but not above to its media end; a lead (≤ 0.2 s) right at a clip tail could seek past the source end. The `ended` guard prevents a frame-0 restart, so the effect is cosmetic.
- Final re-check after the last edit: stopped seeks 1/3/5/9 → drift 0 each; `npx vitest run` 557/557; tsc 0; biome clean; hashes 4× OK.
- Mono video audio would pass the pan-0 `StereoPanner` at −3 dB (A's L11), same live and in export; fixtures are stereo.
- Cookie banner (root) covers the footer until declined — root-owned, noted only.

## 10. Exact next C checks

R2-F1 (anchor: 5× Play/Pause @20, per-frame deltas ≥ 0, handoff step ≤ 20 ms on header drag), R2-F2 (scrollHeight both viewports), R2-F3 (long blocked-trim message), R2-F4 (D-12 regression), R2-V0 (repeat one prototype case), R2-V1 (picker + drop, Undo/Redo id, MP4/MOV — here `canPlayType` says supported), R2-V2 (rejections + history length), R2-V3 (trim 0.5 / split 3 / Delete Time 1–2 mapping during playback), R2-V4 (network), R3-V1 (drift with audio-clock harness), R3-V2 (RMS), R3-V3 (export oracle + muted zeros + noaudio note), R3-V4 (Space ×10 real + burst), R4-P1/P2/P3, R2-U1..U3, R2-G1, R2-S1, R2-S2, R2-R1, R2-V-shots.
