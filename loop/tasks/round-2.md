# CURRENT TASK — Round 2: C-R1 fixes + SRW-02 video import (FB-15) + SRW-03 unified video/audio transport (FB-16) + SRW-04 playhead

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-07
Previous task (SRW-01, PASS 24/24 by C): `tmp/studio-real-loop/tasks/round-1.md`. C's report: `c-round-1.md` / `c-round-1.json`. B's decision record: `b-round-1.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-01..D-15; **D-12..D-15 are new and binding for this round**). Backlog: `tmp/studio-real-loop/backlog.json` → `SRW-02`, `SRW-03`, `SRW-04`, `SRW-01.open_bugs`.
Working dir for paths below: `C:/Apps/czaba-project/store` (paths with `../` are relative to it).

## 0. Goal and order of work (do the steps in this order)

1. **Fix C's four round-1 bugs** (§3). They are small. Do them first, so a failure later does not block them.
2. **R2-V0: reproduce FB-15 before writing import code** (§4.1). Record facts in your report.
3. **SRW-02:** import the user's own video into the single video lane, via a file picker and an OS drag-and-drop (§4).
4. **SRW-03:** one transport drives both the video and the audio. The video's original sound becomes a real audio lane, with its own Mute and Volume. Its sound reaches the WAV export through the same graph (§5).
5. **SRW-04:** draggable playhead, `Home`, and scrub rescheduling (§6).

If you cannot finish an item, list its acceptance IDs under **"not ready"** in your report. C fails them and B carries them over. Do not fake or soften an item to make it fit. Do not build UI for later items (loop, multi-select, clipboard, grid, markers, groups, fades, clip gain, pan, master, MP3/range export, panels resize, library search).

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`, then these primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`. Also read the prompts `studio-feature.md`, `new-component.md`, `new-test.md` and the skill `pre-flight`. As in round 1, **the code and this task win over stale primitive examples**.
2. Read for behaviour only, do not copy:
   - `../output/studio-workspace-prototype/workspace.js`: `syncVideo` (≈2408), the `upload.onchange` sequential placement (≈3200), lane `ondragover`/`ondrop` (≈1047–1100).
   - `../docs/technical/ableton-live-current-workflow.md`: TRN-01..05, VID rows, CLP-06.
   - `../tmp/studio-real-loop/c-baseline.md`: P10, P11, T8, T9, T10.
3. Read the code you reuse: all round-1 files in §2, and `app/lib/sfx-video.client.ts` (`seekSfxVideo`; import only, never modify).
4. Before editing, post the **pre-flight gate** at the top of your report: assumptions, smallest version, files and why each, success commands.

## 2. File ownership (exact; nothing else may change)

Modify (round-1 files you own):
`app/types/arrangement.ts`, `app/lib/arrangement/model.ts`, `app/lib/arrangement/schedule.ts`, `app/lib/arrangement/graph.client.ts`, `app/lib/arrangement/__tests__/model.test.ts`, `app/lib/arrangement/__tests__/schedule.test.ts`, `app/lib/arrangement/__tests__/graph.test.ts`, `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementExportDialog.tsx`, `index.ts`.

Create:

| File | Responsibility |
| --- | --- |
| `app/lib/arrangement/video.ts` | Pure, no DOM. `classifyVideoFile({name, type})` returns `'video' \| 'audio' \| 'unsupported'` (§4.2). `findVideoClipAt(arrangement, position)` returns `{clip, mediaTime}` or `null`, where `mediaTime = position − clip.start + clip.sourceOffset`. It is half-open: `start ≤ position < start+duration`. `nextVideoStart(arrangement)` = the max end of the video-lane clips, or 0. `videoDriftAction(currentMediaTime, targetMediaTime, isPlaying)` returns `'none' \| 'seek'` (§5.2 thresholds). |
| `app/lib/arrangement/video.client.ts` | `probeVideoFile(file, signal)` returns `{url, duration, width, height}`. It uses a detached `<video preload="metadata">` with a 10 s timeout that is **always cleared**, and on failure it revokes the URL and rejects with a Georgian `Error`. `decodeVideoAudio(file, ctx, signal)` returns an `AudioBuffer`, or `null` with a reason (no audio track / decode failed / longer than 20 min, see D-14). |
| `app/lib/arrangement/transport.ts` | Pure transport clock. `createPlaybackAnchor(...)` and `positionAt(anchor, ctxTime)` implement the C-R1-01 rule (§3.1). `shouldRescheduleScrub(lastRescheduleCtxTime, now)` returns true at most every 0.1 s. |
| `app/lib/arrangement/__tests__/video.test.ts`, `__tests__/transport.test.ts` | §7 |
| `app/components/arrangement/ArrangementVideoDock.tsx` | The one and only `<video>` element (always `muted`, `playsInline`), the gap state and the empty state (§5.1). |
| `docs/implementation/2026/quarter-IV/011-studio-lab-video-transport.md` | Per `.claude/rules/implementation-docs.md` + `docs/implementation/TEMPLATE.md`. Georgian. If 011 is already taken, use the next free number. |
| `../tmp/studio-real-loop/a-round-2.md` | Your report (§9). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

Not changed this round: `ArrangementLibrary.tsx`, `app/data/studio-lab-demo.ts`, `app/routes/studio-lab.tsx`, `demo-synth.ts`, `peaks.ts`.

Read-only imports allowed: `~/lib/sfx-edit` (`encodeSfxWav`), `~/lib/sfx-video.client` (`seekSfxVideo`), `~/components/ui`, `~/lib/utils`.
Do **not** import `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`.

**Forbidden to modify** (sha256-checked by C, unchanged from round 1):
- `app/lib/__tests__/download-routes.test.ts`
- `app/routes/account.downloads.tsx`
- `app/routes/api.studio-token.ts`
- `app/routes/studio.$productId.tsx`

Also forbidden: `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `root.tsx`, `app/styles/**`, `lib/sfx-*`, firebase/r2/auth/purchase code, `routes/api.*`, `public/**`, `package.json`/lockfile, `.claude/**`, `../backend/**`, user settings, env/config.

No new dependencies, no installs, no deleting files or tests, no git commit/push/deploy.
Editing an existing test is allowed **only** where this task changes the contract (§5.3). Name each changed test, with a one-line reason, in your report.

## 3. Round-1 bug fixes (C-R1-01..04)

### 3.1 C-R1-01 — Play/Pause lookahead moves the playhead backwards (Low)

Cause: the anchor is `{ctxTime: now + 0.05, position: from}`, so before `startAt` the computed position is below `from`. A naive clamp to `anchor.position` is **wrong**: on a reschedule while playing (`syncPlayback`), the new anchor position is the *future* handoff position, and clamping would step the playhead forward ~50 ms on every edit. Implement the two-case rule in `transport.ts`:

- **Fresh start** (Play from stopped, or a seek/ruler click/playhead drag while playing): until `startAt`, the position **holds at `from`**. After that it is `from + (ctxTime − startAt)`.
- **Continuous reschedule** (an edit while playing that does not change the position): the position stays continuous with the previous anchor. `position(ctxTime)` is the same before and after the handoff, with no hold and no step.
- **Delete Time while playing:** the position jumps by the remap once, as in round 1. Before and after that jump it never moves backwards.
- **Pause before `startAt`** stores `from` exactly.

### 3.2 C-R1-02 — the page scrolls 90 px (Low)

The cause is the root `body { padding-bottom: 90px }`. The existing app CSS already contains `body:has(.studio-container){padding-bottom:0}` and `.page-transition-wrapper:has(.studio-container){min-height:auto}` (`app/styles/app.css:458` and `:284`, used by the protected Studio route).

Fix: add the marker class `studio-container` to the root `<div>` of `StudioWorkspace`. Do **not** edit `app.css` or `root.tsx`.

The root cookie banner, which covers the footer until it is accepted or declined, is root-owned and **not** yours. Only note it.

### 3.3 C-R1-03 — Undo of Delete Time while playing keeps the playhead (decision D-12, no code)

D-12: Undo/Redo **does not move the playhead**. The audio follows the restored timeline from the current timeline time (Ableton-like). C confirmed that the current code already behaves this way, so **do not change it**. Do not add an inverse remap.

### 3.4 C-R1-04 — status is truncated at 1440 (Low)

The footer status must never be cut off. Remove `truncate` from the status `<output>` and give it its own wrapping row (full width, `line-clamp-2` at most, or plain wrap). The range, clip details and shortcut hint go on the next row.

## 4. SRW-02 — Video import into the single video lane (FB-15)

### 4.1 R2-V0 reproduction first (record facts, do not fix the prototype)

In your report, under "R2-V0", record the following:

- **Browser codec facts.** In the gstack browser, record `document.createElement('video').canPlayType(...)` for:
  - `video/mp4; codecs="avc1.42E01E, mp4a.40.2"`
  - `video/webm; codecs="vp9, opus"`
  - `video/quicktime`

  Playwright's bundled Chromium may lack H.264/AAC. If it does, that is an environment fact, not a bug, and the MP4/MOV positive paths are verified by the Tech Lead in real Chrome (C will mark them "env-limited").
- **SRW-01 build:** there is no import path. State it plainly.
- **Prototype:** open `file:///C:/Apps/czaba-project/output/studio-workspace-prototype/index.html` in gstack if it loads. If it doesn't, do a code-level check with line refs. For each case, record the exact result or message:
  - picker MP4 / WebM / MOV;
  - an OS-file drop on the video lane, via a page-JS `DataTransfer` drop with a `File`;
  - an empty-MIME `.mov` drop.

  C's hypothesis to confirm or refute:
  - Lane `ondrop` only accepts library `text/plain`.
  - The video lane sets `dropEffect="none"`.
  - The real Studio's MIME allowlist rejects an empty `file.type`.

### 4.2 Contract

- **Entry points.**
  - The video-lane header gets a button "＋ საკუთარი ვიდეო". It opens a hidden `<input type="file" accept="video/*,.mov,.mkv,.m4v" multiple data-testid="arrangement-video-input">`.
  - The video-lane body is a drop zone (`data-testid="arrangement-video-dropzone"`). On `dragover` with `Files` it sets `dropEffect='copy'` and shows a visible "ჩააგდე ვიდეო აქ" state.
  - Remove the round-1 placeholder text "ვიდეოს დამატება შემდეგ ეტაპზე ჩაირთვება". When the lane is empty it reads "ვიდეო არ არის — „＋ საკუთარი ვიდეო“ ან ჩააგდე ფაილი აქ".
- **Classification (`classifyVideoFile`).**
  - `type` starts with `video/` → `'video'`.
  - Empty `type` with extension `mp4|m4v|mov|webm|mkv|ogv` → `'video'`. Never reject only because the MIME is empty (P10).
  - `type` starts with `audio/`, or extension `wav|mp3|aac|m4a|flac|ogg|opus` → `'audio'`.
  - Anything else → `'unsupported'`.
- **Audio files are rejected.** D-05: own audio is never imported. Message: `„<name>“: აუდიო ფაილის დამატება აქ არ შეიძლება — საკუთარი შეიძლება მხოლოდ ვიდეო; ხმები ბიბლიოთეკიდან ემატება.` Nothing is added and history is unchanged.
- **Unsupported files** → `„<name>“: ფორმატი არ არის ვიდეო (<ext or type>).`
- **Probe failure** (broken file, or a codec the browser can't open) → `„<name>“: ბრაუზერმა ეს ვიდეო ვერ გახსნა — სცადე MP4 (H.264) ან WebM.` Probe failures also cover a duration that is not finite or ≤ 0, and `videoWidth === 0`.
- **File drops on an audio lane** → `ვიდეო ჩააგდე ვიდეოხაზზე.`, and for an audio file the audio message above. Nothing is added. Library-source drag is not part of this round.
- **Placement.**
  - Each accepted file is appended at `nextVideoStart` (sequential: A at 0–dA, B at dA–dA+dB) with `sourceOffset 0` and `duration = probe duration`.
  - There is no 60 s cap. The project extends (FB-01).
  - Multiple files are processed **in the given order**. Each file is **one** history entry: `ვიდეოს დამატება — <name>`.
  - If playback is running when the import starts, pause first (prototype behaviour). After the import, the position is set to the new clip's start.
- **Source registry.** Add `WorkspaceVideoSource {id, name, url, duration, width, height, audio: 'decoding' | 'ready' | 'none' | 'error', audioNote: string | null}` to `types/arrangement.ts`. The context exposes `videoSources: ReadonlyMap<string, WorkspaceVideoSource>`.
  - Do **not** add a `'local'` origin to `WorkspaceSource`/`WorkspaceCollection`. The collection contract stays `demo | purchased` (D-06).
  - Video durations are merged into the `sourceDurations` map, so `trimClipEnd` stops at the video source end.
  - Object URLs are revoked **only on unmount**: undo can bring a deleted clip back.
- **Model.** Add `appendVideoClip(arrangement, {sourceId, sourceDuration})`; it uses the single video track. `addClip` stays audio-only.
  - move, trim, split, range split, deleteClip and deleteTime already work on any track. They must work on video clips, with exactly the same offset maths.
  - Moving a video clip stays inside the video lane (cross-lane moves are SRW-08).
  - Clip title lookup covers `videoSources` as well as `collection.sources`.
- **Privacy.** The file never leaves the browser: no `fetch`/XHR/POST of the file and no new hosts. Only `blob:` URLs are used.
- **Clip visual.**
  - A video clip shows its name, plus peaks of its decoded audio when `audio === 'ready'`.
  - Otherwise it shows the text "ხმა არ არის" / "ხმა ვერ წაიკითხა", depending on the reason.
  - It looks distinct from audio clips through tokens only (for example `bg-accent/…`), with no new colours.

## 5. SRW-03 — Unified transport and the video's original sound (FB-16)

### 5.1 Video dock (`ArrangementVideoDock.tsx`)

- **Placement.** A compact dock (16:9, about 320 px wide) in the left column, below the library. The library keeps a usable height at 1280×720. Final panel placement is SRW-11 (FB-08); do not build resize/expand now.
- **States.**
  - Empty, when there are no video clips: "ვიდეო ჯერ არ დაგიმატებია".
  - Gap: the playhead is in the video lane but outside any video clip. It shows "ვიდეო არ არის · mm:ss.mmm"; the `<video>` is paused and hidden.
  - Active: the clip name and the frame.
  - The dock has `data-testid="arrangement-video-dock"`, and the gap element has `data-testid="arrangement-video-gap"`.
- **Exactly one `<video>` element exists** in the page. It is `muted` at all times (D-13). Its `src` is switched when the active clip's source changes.

### 5.2 Sync contract (audio clock is the master)

- **Target.** `targetMediaTime = findVideoClipAt(arrangement, position).mediaTime`.
- **When stopped**, on seek, ruler click, playhead drag, edit, undo/redo or import: seek the video to the target, using `seekSfxVideo` with an `AbortController` that is aborted by the next seek.
- **When playing**, the video plays natively.
  - Each frame: if `|video.currentTime − target| > 0.08 s` → hard seek (`videoDriftAction`), but at most once per 250 ms. Otherwise do nothing.
  - On a clip boundary or source change → set src, seek, then `play()`.
  - Handle a `play()` rejection: when it is not an `AbortError`, pause the transport and show the status `ვიდეოს დაკვრა ვერ მოხერხდა — სცადე MP4 (H.264) ან WebM.`
- **Pause/stop** pauses the video. Rapid Space ×10 must end with `video.paused === !isPlaying`.

### 5.3 The video's original sound as an audio lane (D-13)

- **Decode.** After a successful probe, decode the file's audio with `decodeVideoAudio`: `file.arrayBuffer()` → `decodeAudioData` on the existing 48 kHz decode context. Run it in the background; the clip may already be visible.
  - On success: store the buffer in `buffersRef` under the video `sourceId`, and set `audio: 'ready'`.
  - On failure or no audio: set `audio: 'none' | 'error'`, plus `audioNote` (Georgian): `ვიდეოს ხმა ვერ წაიკითხა — ექსპორტში არ შევა` or `ვიდეოს ხმა არ აქვს`.
  - D-14 limit: if the duration is over 20 min, skip the decode with the note `ხმა არ წაიკითხა: ვიდეო 20 წუთზე გრძელია` (memory guard).
- **Schedule and graph.** The video track becomes a normal mix lane for its sound:
  - `planSchedule` now includes video-track clips.
  - `applySchedule` creates trackGain + panner for **every** track (audio and video), and still skips clips without a buffer.
  - `isTrackAudible` treats the video track like any other track: Mute overrides; if any track (audio **or video**) is soloed, only soloed tracks are audible.
  - A source buffer that arrives while playing must become audible without a restart. Reschedule through the existing continuous `syncPlayback` path when the buffer map changes.
- **Contract change, tests updated with reasons.** Round 1 asserted "video track excluded" (schedule.test) and "isTrackAudible false for video". Replace these with the new assertions:
  - video clips planned;
  - video track audible unless muted or excluded by solo;
  - the graph creates a video trackGain.

  Name the changed tests in your report.
- **Video-lane header.** M, S and Volume, exactly like the audio lanes, with labels:
  - `aria-label="Mute — ვიდეოს ორიგინალი ხმა"`;
  - `Solo — ვიდეოს ორიგინალი ხმა (Ctrl/Cmd+click ამატებს)`;
  - `Volume — ვიდეოს ორიგინალი ხმა`.

  A small caption reads "ორიგინალი ხმა".
- **Mute** only changes the gain: the video keeps playing (`paused === false`), there is no restart and no position jump.
- **The `<video>` element is never unmuted.** This is what keeps live playback and the WAV export identical (D-02, D-11).
- **Export dialog.**
  - The WAV includes the video's original sound when its lane is audible and the audio is `ready`.
  - The dialog states one of: `ვიდეოს ორიგინალი ხმა: შედის` / `გამორთულია (M/Solo)` / `<audioNote>`.
  - Video render stays disabled with its reason (D-11).
  - A project containing only a video clip without audio still exports a WAV of `projectEnd` length (silence). The dialog says so; it is not a fake.

## 6. SRW-04 — Playhead and transport keys (D-15)

- **Single position (D-15).** Keep the prototype's single position model: Play resumes from the current position, and there is no separate insert marker. `Home` (and the existing ↤ button) → 0. `Home` is ignored in typing targets.
- **Draggable playhead.**
  - A handle at the top of the playhead line in the ruler (≥ 10 px hit area, `aria-label="Playhead"`, `role="slider"`, `aria-valuenow` in seconds). It is draggable with pointer capture. ←/→ while the handle is focused moves it by 0.1 s.
  - While stopped: the position follows the pointer and the video frame follows.
  - While playing: the position follows the pointer; audio reschedules **at most every 100 ms** during the drag (`shouldRescheduleScrub`) and **once on release**. The video follows.
  - No history entry.
- **Existing behaviour to keep (regression):**
  - A ruler click while stopped seeks and does not play.
  - A body-range drag while playing does not move the playhead (Ableton S3, TRN-03).

## 7. Required tests (behavioural, named)

- `video.test.ts`:
  - `classifyVideoFile`: mp4/webm/quicktime types; empty-type `.mov`/`.MKV` (case-insensitive) → `video`; `audio/mpeg` and empty-type `.wav` → `audio`; `.pdf` → `unsupported`.
  - `findVideoClipAt`: inside, at exact start, at exact end (→ next clip or null), in a gap, honouring `sourceOffset`.
  - `nextVideoStart`: empty → 0; after two clips → the max end.
  - `appendVideoClip`: sequential placement and project end > 60.
  - Video clip after `trimClipStart` + `deleteTime` → the `mediaTime` mapping is still correct.
  - `videoDriftAction`: thresholds.
- `transport.test.ts`:
  - A fresh start holds at `from` before `startAt`.
  - A continuous reschedule gives an identical position before and after the handoff.
  - Pause before `startAt` returns `from` exactly.
  - Five Play/Pause pairs leave the position unchanged.
  - `shouldRescheduleScrub` 100 ms throttle.
- `schedule.test.ts` / `graph.test.ts`:
  - Updated as described in §5.3.
  - New: solo on an audio track silences the video lane; solo on the video lane silences the audio lanes.
  - Muted video clip still planned with gain 0.
- `model.test.ts`: `appendVideoClip` and `trimClipEnd` on a video clip stop at the probed duration.

## 8. Commands (paste real output tails in the report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx
npx biome check ./app
npm run build
git status --short
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

- **`/check` rule (unchanged):**
  - Use `--write` only on your owned paths.
  - Run `npm.cmd run check` only if the read-only `npx biome check ./app` shows no format or safe-fix diffs outside your files. Re-run the hash check afterwards.
  - Never run `npm run format`.
- **Dev server:** use the running `http://127.0.0.1:5173`. Do not start or stop servers. Browser work goes through gstack `/browse` only, with state `../tmp/studio-real-loop/a-browse.json`.
- **Review:** invoke the actual `code-reviewer` subagent, fix its findings and quote its summary.

**Test media** (B-generated, sha256 in `../tmp/studio-real-loop/media/SHA256SUMS.txt`; feed them with `$B upload "[data-testid=arrangement-video-input]" <abs path>`; for drops, read `input.files[0]` in page JS and dispatch `dragenter/dragover/drop` with a `new DataTransfer()` on the dropzone):

| File | Content |
| --- | --- |
| `beeps-6s-vp9-opus.webm` | 6.008 s VP9 + Opus stereo, 1 kHz beep 100 ms at every integer second (open codecs: the primary positive path) |
| `clip-4s-vp9-opus.webm` | 4 s VP9 + Opus, 500 Hz beeps |
| `noaudio-2s-vp9.webm` | 2 s VP9, no audio |
| `beeps-6s-h264-aac.mp4` | same beeps, H.264 + AAC |
| `clip-3s-h264-aac.mov` | 3 s, QuickTime container, H.264 + AAC |
| `noaudio-2s-h264.mp4` | 2 s H.264, no audio |
| `broken.mp4` | random bytes |
| `tone-2s.wav` | audio file (must be rejected) |

## 9. Report `../tmp/studio-real-loop/a-round-2.md`

Include:
- the pre-flight gate;
- the R2-V0 reproduction facts;
- the files actually changed (must be a subset of §2);
- verbatim command tails;
- the changed round-1 tests, with reasons;
- the code-reviewer findings and fixes;
- the dev smoke: what you clicked or uploaded, what happened, which fixtures;
- any export self-check and its method;
- deviations with reasons;
- **"not ready" acceptance IDs**.

Do not claim PASS. List C's checks.

## 10. What C will verify

**Fixes**
- **R2-F1 (C-R1-01):**
  - 5 Play/Pause pairs 8 ms apart at 20.000 → exactly 20.000.
  - With no edits, the per-frame position deltas are ≥ 0 while playing, and the first frame after Play is ≥ `from`.
  - A non-Delete-Time edit while playing (header drag): the |position step| at the handoff is ≤ one frame (≤ 20 ms), with no backward step.
- **R2-F2 (C-R1-02):** `document.documentElement.scrollHeight === innerHeight` at 1440×900 and 1280×720 (cookie banner declined). `window.scrollTo(0,500)` leaves the header at top 0.
- **R2-F3 (C-R1-04):** at 1440 with a range and a selected clip, the status element shows the full blocked-trim message, with no ellipsis (`scrollWidth ≤ clientWidth`, `scrollHeight ≤ clientHeight`).
- **R2-F4 (D-12 regression):** Undo of Delete Time while playing keeps the playhead's timeline time, and the audio matches the restored timeline.

**SRW-02**
- **R2-V0:** C reads A's reproduction and repeats one prototype case.
- **R2-V1:**
  - Upload `beeps-6s-vp9-opus.webm` via the picker, then drop `clip-4s-vp9-opus.webm` on the dropzone → the first clip is 0–d₁, with d₁ = 6.008 ± 0.02 (the browser-reported duration), and the second clip starts exactly at the first clip's end.
  - One Undo removes only the second clip; Redo restores the same id.
  - The status names each file.
  - MP4/MOV: accepted where `canPlayType` supports them; otherwise there is the clear probe error and nothing is added. C marks the positive MP4/MOV path "env-limited → Tech Lead in real Chrome".
- **R2-V2:**
  - `broken.mp4` → probe error.
  - `tone-2s.wav` via drop → the audio rejection message.
  - A `.pdf` (constructed in page JS) → unsupported.
  - A webm dropped on an audio lane → `ვიდეო ჩააგდე ვიდეოხაზზე.`
  - Empty-type `.mov` (a `File` built from `clip-3s` bytes with `type:''`) → classified as video, then accepted or a probe error, never a MIME rejection.
  - For every rejection, the history length is unchanged.
- **R2-V3:**
  - Trim the left edge of the webm clip by 0.5, split it at 3 s, and run Delete Time 1–2 on the video lane plus an audio clip.
  - The offsets match the unit maths.
  - During playback, `video.currentTime` follows the edited mapping (R3-V1 tolerance).
- **R2-V4:** the network log during import shows only `blob:`. There is no request carrying the file and no POST.

**SRW-03**
- **R3-V1:**
  - Video clips at 0–6 and 8–12 (gap 6–8) plus a music clip; Play from 0. Sample every 250 ms. Excluding 300 ms after a seek or boundary: median |drift| ≤ 0.05 s, max ≤ 0.1 s.
  - In the gap, `arrangement-video-gap` is visible with the time and the video is paused.
  - Stopped seeks to 1/3/5/9 s: after `seeked`, |drift| < 80 ms (C T8).
- **R3-V2:**
  - Toggle video-lane M during playback: `video.paused === false` throughout, `video.muted === true` always, and the source counters are unchanged (no restart).
  - Master RMS in the beep windows: < −80 dBFS while muted; audible within 100 ms of unmute.
  - Solo on music silences the video beeps.
- **R3-V3:**
  - `beeps-6s-vp9-opus.webm` imported at 0, left-trimmed to `sourceOffset 0.5`, moved to start 2.0.
  - Export WAV beep onsets at `2.0 + k − 0.5` for k = 1..5. Oracle: compare against C's own `decodeAudioData` of the same fixture at 48 kHz, max diff ≤ 2⁻²². Nominal onset time ±25 ms for WebM/Opus. For the AAC fixtures (env-limited), allow ±50 ms because of AAC priming; the same-decode comparison remains the oracle. The fixtures are stereo, so the pan-0 path is identity. Mono sources remain A's known L11 (−3 dB, identical live and in export); this oracle does not test them.
  - With video-lane M on: those windows are exact zeros, and other tracks are unchanged.
  - With `noaudio-2s-vp9.webm`: the dialog shows the audioNote and the WAV is still valid.
- **R3-V4:** Space ×10 (real presses + an 8 ms synthetic burst) with video + audio → there are no doubled sources, `video.paused === !isPlaying` at the end, and there is exactly one `<video>` in the DOM.

**SRW-04**
- **R4-P1:**
  - Drag the playhead handle stopped (the position and the video frame follow) and while playing: count reschedules via patched `AudioBufferSourceNode.start` — ≤ 1 per 100 ms of drag + 1 on release.
  - No history entry.
  - Focused handle ←/→ = ±0.1 s.
- **R4-P2 (regression of R1 S3):** a body-range drag while playing does not move the playhead.
- **R4-P3 (D-15):** Pause at 3 s → Play resumes at 3 s. `Home` → 0, both stopped and while playing (reschedule, no doubled sources). `Home` inside a text input does nothing.

**Gates and regression**
- **R2-U1..U3:** `video.test.ts`, `transport.test.ts`, and the updated `schedule`/`graph` tests (C reads the names and re-runs R1-U2 explicitly).
- **R2-G1:** tsc 0; vitest ≥ 517 + new, 0 failures; build; biome 0 errors.
- **R2-S1:** hashes; `git status` limited to §2 plus pre-existing files.
- **R2-S2:** anonymous `/studio-lab`: no `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, no Authorization header. The media is only the 2 demo MP3s plus `blob:`.
- **R2-R1 regression:** R1-B5, B11, B12, E1 (silent window **4–5 s**, corrected wording), E3 and E5 re-run with a video clip present on the video lane.
- **R2-V-shots:** 1440×900 and 1280×720 with the video dock visible. There is no overlap, and the library is still usable.
