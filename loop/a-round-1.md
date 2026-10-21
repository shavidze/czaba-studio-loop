# A — Round 1 report (SRW-01)

Date: 2026-10-07 · Implementer: A (Claude Opus 5.5) · Task: `tmp/studio-real-loop/current-task.md`.
Status: implementation done, waiting for C. I am **not** marking any acceptance ID as PASS.

## 0. Pre-flight gate (posted before editing)

- **Assumptions**
  1. `/studio-lab` starts **empty**: the 1 video lane + მუსიკა / სტემები / SFX tracks, no clips. A music clip at 0 would need the decoded duration before load.
  2. Demo sources decode at mount with a decode-only `OfflineAudioContext` at 48 kHz, so no gesture is needed and MP3s are resampled once. The live `AudioContext` is created and resumed only on the first Play. This is my reading of "lazy AudioContext on first gesture".
  3. Default track volume is 1, so E5's sample oracle holds (clipGain, pan and master are all identity).
  4. The synthetic impact is full scale at sample 0 (0.7 + 0.3 = 1.0). Export clamps to `[-1, 8388607/8388608]` before `encodeSfxWav`, because the encoder has no clamp and would wrap +1.0 to −1.0. The clamp error at the onset is 1.2e-7, which is inside 2⁻²².
  5. Edits reschedule on **commit** (drag end, undo, split, delete, add), not on every pointermove.
- **Smallest version:** the 22 files in §2. One pure engine (model / schedule / peaks / synth) and one `applySchedule` shared by live playback and offline export. No video, loop or grid UI.
- **Files:** exactly the §2 list (below).
- **Success:** `npx vitest run app/lib/arrangement` green; full vitest ≥ 464 + new; tsc 0; biome 0 errors on owned paths; build OK; protected hashes OK; `/studio-lab` loads anonymously on :5173.

## 1. Files created (all new; nothing else changed)

```
app/types/arrangement.ts
app/lib/arrangement/model.ts
app/lib/arrangement/schedule.ts
app/lib/arrangement/graph.client.ts
app/lib/arrangement/peaks.ts
app/lib/arrangement/demo-synth.ts
app/lib/arrangement/__tests__/model.test.ts      (33 tests)
app/lib/arrangement/__tests__/schedule.test.ts   (8)
app/lib/arrangement/__tests__/graph.test.ts      (9)
app/lib/arrangement/__tests__/peaks.test.ts      (3)
app/contexts/ArrangementContext.tsx
app/components/arrangement/StudioWorkspace.tsx
app/components/arrangement/ArrangementTransport.tsx
app/components/arrangement/ArrangementRuler.tsx
app/components/arrangement/ArrangementLane.tsx
app/components/arrangement/ArrangementClip.tsx
app/components/arrangement/ArrangementLibrary.tsx
app/components/arrangement/ArrangementExportDialog.tsx
app/components/arrangement/index.ts
app/data/studio-lab-demo.ts
app/routes/studio-lab.tsx
docs/implementation/2026/quarter-IV/010-studio-lab-arrangement-core.md
../tmp/studio-real-loop/a-round-1.md   (this file)
../tmp/studio-real-loop/a-browse.json  (gstack browse state)
```

Extra artefacts, not source: `tmp/studio-real-loop/a-r1-1440x900.png` and `a-r1-1280x720.png`. These are screenshots from my smoke. Browse helper scripts are in `%TEMP%` (`a-helpers.js`, `a-export-check.js`) and are not in the repo.
Not touched: root.tsx, StudioContext, AudioContext, types/studio, components/studio, lib/sfx-*, auth/R2/purchase code, api routes, public/, package.json, .claude/, backend.

## 2. Command output (verbatim tails, final run after review fixes)

`npx vitest run app/lib/arrangement`
```
 ✓ app/lib/arrangement/__tests__/schedule.test.ts (8 tests) 6ms
 ✓ app/lib/arrangement/__tests__/model.test.ts (33 tests) 13ms
 ✓ app/lib/arrangement/__tests__/graph.test.ts (9 tests) 8ms
 Test Files  4 passed (4)
      Tests  53 passed (53)
```
(`peaks.test.ts` 3 tests is in the same run; its line scrolled above the tail.)

`npx vitest run`
```
 Test Files  36 passed (36)
      Tests  517 passed (517)
```
That is 464 baseline + 53 new.

`npx tsc --noEmit` → no output, exit 0 (`TSC_EXIT=0`).

Transparency: once during development I ran `npx biome check --write --unsafe app/contexts/ArrangementContext.tsx` (that file only) to apply hook dependency-array fixes. It touched no other file, and tsc, tests and smoke passed afterwards. Every other `--write` was safe-only and limited to my paths.

The final full gate, re-run after the last change: vitest 517/517, build `✓ built`, biome `./app` 0 errors / 218 warnings, hashes 4× OK.

`npx biome check <owned paths>`
```
Checked 21 files in 55ms. No fixes applied.
```
0 errors, 0 warnings on my paths.

`npx biome check ./app` (read-only gate)
```
Checked 284 files in 278ms. No fixes applied.
Found 218 warnings.
Found 1 info.
```
0 errors. None of the warnings are in my files (grep over the diagnostics with `arrangement|studio-lab` returned nothing). Because the read-only gate showed no format or safe-fix diffs, I also ran `npm.cmd run check` ("Checked 284 files … No fixes applied") and re-ran the hash check afterwards: all OK.

`npm run build`
```
build/server/index.js                    1,001.49 kB
✓ built in 5.31s
```

Protected hashes
```
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```

`git status --short`
```
 M app/lib/__tests__/download-routes.test.ts
 M app/routes/account.downloads.tsx
 M app/routes/api.studio-token.ts
 M app/routes/studio.$productId.tsx
?? .agents/
?? .claude/agents/ableton-arrangement-expert.md
?? .codex/
?? AGENTS.md
?? app/components/arrangement/
?? app/contexts/ArrangementContext.tsx
?? app/data/studio-lab-demo.ts
?? app/lib/arrangement/
?? app/routes/studio-lab.tsx
?? app/types/arrangement.ts
?? docs/implementation/2026/quarter-IV/010-studio-lab-arrangement-core.md
```
The 4 `M` files and `.agents/ .codex/ AGENTS.md .claude/agents/ableton-arrangement-expert.md` were there before I started.

Same-graph grep:
```
app/lib/arrangement/graph.client.ts:166:  applySchedule(ctx, planSchedule(arrangement, 0), {   ← renderArrangementWav (OfflineAudioContext)
app/contexts/ArrangementContext.tsx:256:      const handle = applySchedule(ctx, planSchedule(arrangement, from), {   ← live AudioContext
```

## 3. code-reviewer subagent (actually invoked; agentId af2a1893122518906)

Result: **Critical 0, High 0, Medium 3, Low 12, score 8/10.** The reviewer confirmed: model math matches §3; P3/P4 go through `setTrackGain`; P5 holds (no Web Audio in updaters); P6 holds (no setTimeout restarts); the handoff is gapless; export uses the same graph with clamping; there are no `any`, `as` or comment violations; only the 2 allowed URLs are used.

Fixed:
- **M1** Range sliders counted as typing targets, so Space/Delete/Ctrl+Z were dead after touching a fader. Now only text-like inputs, textarea, select and contenteditable count. Arrow keys still go to a focused slider. Browser-verified: ArrowLeft ×2 on the music volume, then Ctrl+Z with the slider focused → "Undo: Volume", value back to 0.99.
- **M2** Ctrl shortcuts now use `event.code` (`KeyZ` / `KeyE` / `KeyY`), falling back to `key`, for non-Latin (Georgian) layouts. I have **not** tested on a real Georgian layout.
- **M3** A render-time overwrite of `latestRef` could drop a source-state patch. Removed: refs are now written only by the sync setter wrappers (single writer). This also fixes my own smoke bug (§4, first item).
- **L4** Space on a focused button: `preventDefault` now also runs on keyup. Browser-verified with a real `press Space` while `Mute — SFX` had focus: playback started, mute stayed `false`, 1 source started.
- **L6** A drag or nudge past 0 now clamps to 0 instead of stopping short.
- **L7** Nudge is rounded to milliseconds.
- **L8** `PEAK_BUCKETS_PER_SECOND` is exported once from `peaks.ts`.
- **L9** The rAF end check uses the scheduled arrangement's end, not the drag preview.
- **L13** The status now says how many sources failed to load.
- **Reviewer suggestion** Lookahead raised from 30 ms to 50 ms.
- **Advisor follow-up** A volume preview that never got its pointerup, keyup or blur commit could fold into the next edit's undo entry. Now `applyEdit`, `undo` and `redo` first flush a pending volume preview as its own "Volume" entry (`flushPendingVolume`). Browser-checked (§4, item 12c).

Not fixed, recorded as known limitations:
- L5: a keyboard edit during an active drag isn't cancelled.
- L10: undoing Delete Time during playback doesn't map the position back.
- L11: mono sources come out at −3 dB through the StereoPanner. This is identical in live and export; the synths are stereo.
- L12: `activeSourceCount()` counts sources that are scheduled but not yet started.
- L14: clips can't be selected by keyboard, and clips under ~16 px are covered by the trim edges.
- L15: about 60 fps context re-renders while playing; clips are memoised.
- The context-level fake-AudioContext tests the reviewer suggested were not added (no file for them in §2).

## 4. Dev smoke (gstack browse, `BROWSE_STATE_FILE=tmp/studio-real-loop/a-browse.json`, existing :5173 server)

Drags used synthetic `PointerEvent`s dispatched from page JS (gstack has no mouse-drag command). Keys were synthetic `KeyboardEvent`s on `document.body`, except where marked "real press" (gstack `press`). I did not listen to anything; audio claims come from counters and decoded samples.

1. **Load:** `/studio-lab` → 200. The status reads "დემო კოლექცია მზადაა…". The library shows Middle East 01:41.352, CZABA hero 02:30.372, Soft impact 00:02.000 and Slow rise 00:05.000, under the header "დემო კოლექცია · CZABA-ს საჯარო preview + სინთეზური ხმები".
2. **Bug found and fixed:** selecting the SFX lane, then Soft impact, then ＋ in one synchronous sequence originally added *Middle East* to *მუსიკა* (stale ref). After the fix: "„Soft impact“ დაემატა SFX ხაზზე 00:00.000-ზე." With seek 3 first, it lands at 00:03.000.
3. **Undo/redo:** Ctrl+Z → clip gone, status "Undo: დამატება — Soft impact". Ctrl+Shift+Z → clip back with the same id. Ctrl+Y also redoes.
4. **Header drag** +2 s → "კლიპის გადატანა: start 00:02.000 … source offset 00:00.000".
5. **Music clip:** seek 5 → add Middle East → at 00:05.000. A right-edge drag of −91.352 s → "length 00:10.000", project end 00:15.000. Undo restores end 01:46.352; Ctrl+Y re-applies.
6. **Left-edge trim** +0.25 on the impact → "start 00:02.250, length 00:01.750, source offset 00:00.250". A header drag of +0.75 → start 00:03.000 with offset 0.250 unchanged.
7. **Body range drag** on music 1→3 s → footer "მონიშვნა: 00:06.000 — 00:08.000 · სიგრძე 00:02.000". The delete button label switches to "⌫ დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე".
8. **Delete Time while playing:** clips on 3 tracks, range 6–8 on music, seek 9, Space, then after ~1 s Delete.
   - Position read just before = 10.381; just after = 08.661 (≈ −2 s + elapsed). Still playing; 1 s later 10.111.
   - Slow rise on stems moved 11.229 → 9.229 s. Music split into 5–6 + 6–13; the impact (before the range) didn't move.
   - Counters: +2 started / +2 stopped, i.e. one handoff for the 2 clips still sounding.
   - One Ctrl+Z restored all 3 original clips (status "Undo: დროის წაშლა").
9. **Split at playhead while playing** (selected music, Ctrl+E) → "კლიპი გაიყო 00:08.821-ზე"; the right part shows source offset 00:03.821 (= 8.821 − 5). **Delete** without a range removed only that right part, and the other clips didn't move ("სიცარიელე დარჩა").
10. **>60 s:** moved Slow rise to start 70 → project end 01:15.000; ruler width 4200 px = (75 + 30) s × 40 px/s; last labels 1:42 / 1:44.
11. **Rapid Space ×10** (patched `AudioBufferSourceNode.prototype.start/stop`) during playback with 2 clips: starts +10, stops +10 (5 play/pause pairs × 2 clips). It ended in the playing state, with no extra sources.
12. **Mute → volume while muted → unmute, live during playback** (Middle East at 0, Space, then M on, real ArrowLeft ×2 on the muted slider, then M off):
    - Counters: `created 1 / stopped 0` both before and after, so no restart.
    - Position kept advancing (01.291 → 04.921) and it was still playing.
    - Final state: mute `false`, volume 0.98.
    - The audible-within-100 ms check and "muted + volume stays silent" by RMS (B11) are **not done by me**; they need C's AnalyserNode.
12b. **Blocked trim (B3, second half):** dragged the right edge of a full-length Middle East clip +5 s past the source end.
    - During the drag the status read "Trim შეჩერდა: წყაროს დასასრული…".
    - On release: "Trim — მარჯვენა კიდე: ცვლილება არ მოხდა — ისტორია არ შეიცვალა."
    - Undo label was unchanged ("Undo: დამატება — Middle East…") and the end stayed 01:41.352.
12c. **Pending volume preview + Ctrl+Z:** set the slider value with only an `input` event (no pointerup, keyup or blur), then pressed Ctrl+Z → "Undo: Volume", volume back to 1. This is the new flush; see §3.
13. **Real-press checks after the fixes:** see M1 and L4 in §3.
14. **Network** (fresh load):
    - Media: only `GET /middle-east.mp3` and `GET /videos/hero/hero-music.mp3`.
    - No `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 or cloudflarestorage (`grep -ci` = 0).
    - Other requests: Google Fonts, GA/gtag, and **`GET http://localhost:5199/api/cart` from the root `CartProvider`** (not my code; it fails because no backend is running). C should check it for an Authorization header; it is not issued by the workspace.
15. **Console** on a fresh load: only the root cart errors ("Failed to load cart"). Errors seen earlier at 09:27 UTC were a transient HMR state during my rename.
16. **Screenshots** (1440×900, 1280×720), **retaken after the final UI changes** with the cookie banner declined first: transport, library, 1 video lane + 3 audio lanes, Export and the status footer are visible.
    - Selected clip = teal ring + teal header; range = light fill with white edges (raised to `foreground/60` after the first screenshot); playhead = amber line.
    - At 1280 the transport wraps to 2 rows without overlap.
    - The **root cookie banner** (fixed bottom, root-owned) covers the bottom ~68 px, including my status footer, until it is accepted or declined. I moved "＋ დამატება" to the top of the library for that reason.

## 5. Export self-check (method: blob captured via patched `URL.createObjectURL`, WAV parsed manually in page JS)

| Case | Result |
| --- | --- |
| impact 2–4 s (SFX) + music 5–15 s | RIFF/WAVE, 2 ch, 48000 Hz, 24-bit, 15.000 s; RMS impact window −13.4 dBFS; gap 4–5 s = −240 dB (exact zeros); music 6–14 s −22.5 dBFS; filename `czaba-studio-lab.wav`, type `audio/wav` |
| Oracle at start 2, offset 0 | `max|out[(2+k)·48000] − src[k]|` over 0.5 s = 5.96e-8 (tolerance 2⁻²² = 2.38e-7); 100 ms before the onset = 0 |
| **E5 setup:** impact start 3.0, sourceOffset 0.25 (left trim + move) | `max|out[(3+k)·48000] − src[(0.25+k)·48000]|` = 5.96e-8; 100 ms before 3.0 = 0. `src` is computed from the generator formula in page JS, not from a second render |
| SFX muted | impact window −240 dB (silent), music still −22.5 dBFS |

## 6. Deviations and limitations

- **History API names:** `createHistory`, `commitHistory`, `undoHistory`, `redoHistory` (spec said `createHistory/commit/undo/redo`; renamed for AGENT_DISCOVERABLE_CODE). `commitHistory` takes an optional `before` snapshot for one-entry drags.
- **Extra exports beyond the spec:** `isSameArrangement`, `ARRANGEMENT_EPS`, `MIN_CLIP_DURATION`, `findFreeStart` (spec'd), `PEAK_BUCKETS_PER_SECOND`, `formatArrangementTime`.
- **`ScheduleHandle`:** has `stop(when?)` (scheduled handoff) and `disconnect()` in addition to the spec'd `stop / setTrackGain / activeSourceCount`.
- **Inline `style`:** used only for computed geometry (left/width).
- **Video lane:** text only, "ვიდეოს დამატება შემდეგ ეტაპზე ჩაირთვება". No button.
- **Export dialog:** MP3, range and video are disabled with "ამ ეტაპზე ხელმისაწვდომი არ არის". An empty project shows "ექსპორტი გამორთულია: პროექტი ცარიელია — დაამატე მინიმუმ ერთი კლიპი." (Browser-checked on a fresh empty project: the WAV button has `disabled=true`, the note above is shown, and there are 3 disabled radios with the reason text. No screenshot.)
- **Play** on an empty project shows a status message and does not start. Play at or after projectEnd restarts from 0. Playback auto-stops at projectEnd.
- **Click vs drag in a clip body:** a plain click (no drag) seeks the playhead, including while playing (reschedule). A body drag only sets a range and never seeks.
- **A drag move into a neighbour** keeps the last valid preview and shows an amber-style status, with no auto-jump past the neighbour. No history entry is added if nothing changed.
- **Not implemented, per §0:** video, loop, multi-select, clipboard, grid/snap, markers, fades, MP3/range export, follow/auto-scroll.

## 7. Ready for C (exact checks)

- **R1-U1/U2/U3:** `npx vitest run app/lib/arrangement` (named tests in `model.test.ts`: addClip free/nearest, moveClip blocked, trim start/end limits, split offsets, range→3 parts, deleteClip gap, deleteTime 6 cases incl. video, remapTime, projectEnd 75, solo exclusive/additive, undo/redo, no-op, redo cleared). Also `grep -n "applySchedule(" app/lib/arrangement/graph.client.ts app/contexts/ArrangementContext.tsx`.
- **R1-G1:** tsc / full vitest (expect 517) / build / biome on the §4 path list.
- **R1-S1:** the hash command + `git status --short` (expected output in §2 above).
- **R1-S2:** fresh anonymous `/studio-lab`, network log. Expect only the 2 mp3s as media. Note the root `/api/cart` call (root `CartProvider`, outside SRW-01) and check that it carries no Authorization header.
- **R1-B1..B12:** DOM hooks you can use:
  - `[data-track-id]` rows (child 0 = header, child 1 = lane body).
  - `[data-clip-id]` clips: child 0 = header (move), 1 = body (range), 2 = left edge, 3 = right edge.
  - Ruler `[title^="Click = playhead"]`.
  - `[data-testid=arrangement-position|arrangement-project-end|arrangement-status|arrangement-range|arrangement-selected-clip|arrangement-playhead]`.
  - Mute/Solo/Volume buttons by `aria-label="Mute — SFX"` etc.
  - Space/Ctrl+E/Delete/Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y/←/→/Enter on `window`.
  - **For B11:** AnalyserNode RMS for unmute-while-playing within 100 ms, and volume on a muted track staying silent. Not verified by me.
- **R1-E1..E5:** patch `URL.createObjectURL` before clicking Export → "WAV-ის ექსპორტი". For E5: lay out Soft impact at 3.0 with left trim 0.25 as in §5, and compare against the `demo-synth.ts` formula `(0.7·cos(2π·62t) + 0.3·cos(2π·187t))·e^(−3.2t)`, stereo identical, 48 kHz.
- **R1-V1:** screenshots at 1440×900 and 1280×720. Accept or decline the root cookie banner first, otherwise it covers the footer.

## 8. Not done

- No commits, pushes or deploys (per instructions).
- No AnalyserNode / audible verification.
- No real-mouse drag test.
- No Georgian-keyboard test of Ctrl shortcuts.
- No context-level unit tests with a fake AudioContext.
- B11 audibility (RMS) is unverified by me. The no-restart part is verified (§4, item 12).
- The page's scrollHeight is about 90 px taller than the viewport even with the banner dismissed. This comes from a root-level wrapper outside my `h-screen` container; I didn't investigate root.tsx (protected).
