# CURRENT TASK — SRW-01 (Round 1): shared arrangement core + /studio-lab central flow

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-07
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (decisions D-01..D-11). Backlog: `tmp/studio-real-loop/backlog.json` → `SRW-01`. C's code audit: `tmp/studio-real-loop/c-baseline.md` (P1–P14 pitfalls, T1–T15 tests). Read all three.
Working dir for paths below: `C:/Apps/czaba-project/store` (paths prefixed `../` are relative to it).

## 0. Goal

Ship a buildable vertical slice: **one** new, reusable arrangement engine (model → `planSchedule` → `applySchedule` on a `BaseAudioContext`) used **identically** by live playback and offline WAV export. It is mounted anonymously at `/studio-lab` with a clearly labelled demo collection, and supports this central flow: add clip → move/trim/range/split/delete/Delete Time → undo/redo → play/seek → export a real WAV.

**Not** in this round: video import or sync (SRW-02/03), loop, multi-select or marquee, clipboard, zoom gestures, grid, markers, groups, fades, MP3 and range export. Do not build superficial UI for those. Where they would naturally appear (video lane, export formats), say plainly that they are not available yet. Do not fork `StudioContext` or `lib/sfx-*` into a fourth engine.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`; prompts `new-route.md`, `new-context.md`, `new-test.md`, `studio-feature.md`; skill `pre-flight`. **Code and this task win over stale primitive examples.** The ffmpeg `amix` export and the 3-layer diagram in AUDIO_ARCHITECTURE are outdated, and its pattern of creating nodes inside `setState` is a known bug (C P5).
2. Read for behaviour only, not to copy: `../output/studio-workspace-prototype/workspace.js` (`freeStart`, `trimClip`, `schedule`, `deleteTime`, clip header/body/edge zones in `render`) and `../docs/technical/ableton-live-current-workflow.md` §3, §7.3, §7.5, §7.7.
3. Read the reused code: `app/lib/sfx-edit.ts` (`encodeSfxWav`, import only), `app/components/ui/*`, `app/lib/utils.ts` (`cn`), `app/routes/scenes.$productId.tsx` (route/meta style), `app/data/index.ts`.
4. Post the **pre-flight gate** (assumptions, smallest version, files and why each, success commands) at the top of your report before editing.

## 2. File ownership (exact; nothing else may change)

| File | Responsibility |
| --- | --- |
| `app/types/arrangement.ts` | `ArrangementTrack {id, kind:'audio'\|'video', name, volume, mute, solo}`; `ArrangementClip {id, trackId, sourceId, start, sourceOffset, duration}` (`start` = timeline seconds, `sourceOffset` = seconds into the source; never call either `offset`); `Arrangement {tracks, clips}`; `TimeRange {start, end, trackId}`; `WorkspaceSource {id, title, collectionLabel, kind:'music'\|'stem'\|'sfx', origin:'demo'\|'purchased'}`; `WorkspaceCollection {id, label, origin, sources, loadSource(source, ctx: BaseAudioContext, signal: AbortSignal): Promise<AudioBuffer>}`; `ScheduledClip`. |
| `app/lib/arrangement/model.ts` | Pure, no DOM: `createArrangement`, `projectEnd`, `findFreeStart`, `addClip`, `moveClip`, `trimClipStart`, `trimClipEnd`, `splitClipAt`, `splitClipsByRange`, `deleteClip`, `deleteTime(arr, a, b)`, `setTrackMix`, `toggleSolo(arr, trackId, additive)`, `remapTime(t, a, b)`; history `createHistory/commit/undo/redo` (snapshot `{tracks, clips}` + label; a commit equal to the current snapshot is ignored; commit clears redo). Source durations are passed as `ReadonlyMap<string, number>`. |
| `app/lib/arrangement/schedule.ts` | `isTrackAudible(track, tracks)` (mute overrides; if any track is soloed, only soloed tracks are audible); `planSchedule(arr, from, until?) → ScheduledClip[] {clipId, trackId, sourceId, when, sourceOffset, duration}` covering clips on **all** audio tracks, muted ones included. Video-kind tracks are excluded this round. |
| `app/lib/arrangement/graph.client.ts` | `applySchedule(ctx, plan, {buffers, tracks, from, startAt}) → {stop(), setTrackGain(trackId, value), activeSourceCount()}`. Graph: per clip `AudioBufferSource → clipGain(1)`; per track `trackGain(isTrackAudible ? volume : 0) → StereoPanner(0)`; one `masterGain(1) → ctx.destination`. `renderArrangementWav(arr, buffers) → Promise<Blob>`: `OfflineAudioContext({numberOfChannels:2, length: ceil(projectEnd·48000), sampleRate:48000})` + **the same `applySchedule`** + `encodeSfxWav` → `audio/wav`. Use a narrow structural context type if a fake needs it; no type assertions. |
| `app/lib/arrangement/peaks.ts` | `computePeaks(channels, sampleRate, bucketsPerSecond) → Float32Array` (max abs per bucket). Clips draw the `[sourceOffset, sourceOffset+duration]` slice. |
| `app/lib/arrangement/demo-synth.ts` | Deterministic pure sample generators for "Soft impact" (2 s, full-scale onset in the first sample, exponential decay) and "Slow rise" (5 s sweep). They produce `Float32Array` channels **at exactly 48000 Hz** (no resampling, so C can compare samples exactly). |
| `app/lib/arrangement/__tests__/model.test.ts`, `schedule.test.ts`, `graph.test.ts`, `peaks.test.ts` | §5. |
| `app/contexts/ArrangementContext.tsx` | `ArrangementProvider({collection, initialArrangement?, children})`, `useArrangement()`. State: arrangement + history, `selectedClipId`, `range`, `activeTrackId`, `position`, `isPlaying`, `pxPerSecond`, `status`, per-source load state, `exporting`. Refs: a lazy `AudioContext` created/resumed on the first user gesture (never at module scope or during SSR), `buffers: Map`, the live schedule handle, an `AbortController` for loads. **All Web Audio side effects run in handlers/effects, never inside setState updaters (C P5).** Edits while playing reschedule from the live position without stopping and without a silence gap (no `setTimeout` restarts, C P6). Mute/solo/volume → `setTrackGain` via `setTargetAtTime`, no restart; unmute while playing is audible immediately (C P3); a volume change never makes a muted track audible (C P4). Playback stops at `projectEnd`. Unmount stops sources, aborts loads and closes the context. Export → `renderArrangementWav` → `URL.createObjectURL` → anchor `download` click → revoke. |
| `app/components/arrangement/StudioWorkspace.tsx` | Layout + keyboard. Shortcuts are ignored in input/textarea/select/contenteditable. Space = play/pause; Ctrl/Cmd+E = split; Delete/Backspace = Delete Time if a range exists, otherwise delete the selected clip; Ctrl/Cmd+Z = undo; Ctrl/Cmd+Shift+Z or Ctrl+Y = redo; ←/→ = nudge the selected clip 0.1 s; Enter = add the selected library source. |
| `app/components/arrangement/ArrangementTransport.tsx` | Play/Pause, ↤ to 0, time `mm:ss.mmm`, project end, Undo/Redo with action label, simple zoom slider (px/s), Export button. |
| `app/components/arrangement/ArrangementRuler.tsx` | Seconds ruler, width = `max(projectEnd + 30 s, viewport)`. A click seeks and does not start playback when stopped. |
| `app/components/arrangement/ArrangementLane.tsx` | Track header (name, M, S, volume; plain S click is exclusive, Ctrl/Cmd+S click is additive) + lane body. A click on empty lane space sets the active track, seeks and clears the selection. The video lane shows "ვიდეოს დამატება შემდეგ ეტაპზე ჩაირთვება" (no fake button). |
| `app/components/arrangement/ArrangementClip.tsx` | Three zones: **header bar** drag = move (same track this round); **body** drag = time range inside the clip (bright fill + start/end/length); **edges** (≥ 6 px hit area) = trim. Peaks honour `sourceOffset`. Selected-clip ring, range and playhead must look distinct. Use pointer capture. One history entry per drag. A blocked move/trim shows a status message and adds no history. A range drag while playing does not move the playhead (Ableton S3). |
| `app/components/arrangement/ArrangementLibrary.tsx` | List grouped by collection label; selection; "＋ დამატება" adds to the active audio track at the playhead, or the nearest free start. Header: "დემო კოლექცია · CZABA-ს საჯარო preview + სინთეზური ხმები". |
| `app/components/arrangement/ArrangementExportDialog.tsx` | Whole project → WAV 24-bit 48 kHz stereo, enabled only if at least one clip exists; otherwise disabled with the reason stated. MP3, range and video are shown disabled with "ამ ეტაპზე ხელმისაწვდომი არ არის". Progress and error states; no file on error. |
| `app/components/arrangement/index.ts` | Barrel. |
| `app/data/studio-lab-demo.ts` | `studioLabDemoCollection: WorkspaceCollection`, origin `'demo'`: `/middle-east.mp3` ("Middle East — საჯარო preview", music), `/videos/hero/hero-music.mp3` ("CZABA hero — საჯარო preview", music), "Soft impact" and "Slow rise" (synthetic, sfx; built with `new AudioBuffer({numberOfChannels, length, sampleRate:48000})`). URLs are fetched with `credentials:'omit'` + `decodeAudioData`. **No other URLs.** |
| `app/routes/studio-lab.tsx` | Anonymous route: no `RequireAuth`, no backend loader, `meta` title + `robots noindex`. Renders `<ArrangementProvider collection={studioLabDemoCollection}><StudioWorkspace/></ArrangementProvider>`. Initial arrangement: 1 video lane + audio tracks "მუსიკა", "სტემები", "SFX"; any source may go on any audio track. Starts empty or with one music clip at 0 (state which in the report). `root.tsx` already hides the store chrome for `/studio*`; do not touch it. |
| `docs/implementation/2026/quarter-IV/NNN-studio-lab-arrangement-core.md` | Per `.claude/rules/implementation-docs.md` + `docs/implementation/TEMPLATE.md`. NNN = next free number (010 unless already taken). Georgian. |
| `../tmp/studio-real-loop/a-round-1.md` | Your report (§6). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state file. |

Read-only imports allowed: `~/lib/sfx-edit` (`encodeSfxWav`), `~/components/ui`, `~/lib/utils`. Do **not** import `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`.

**Forbidden to modify** (sha256-checked by C): `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`. Also forbidden: `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `root.tsx`, `lib/sfx-*`, firebase/r2/auth/purchase code, `routes/api.*`, `public/**`, `package.json`/lockfile, `.claude/**`, `../backend/**`, user settings, env/config. No new dependencies, no installs, no deleting files/tests, no git commit/push/deploy.

## 3. Rules that must hold

- Seconds as float; `EPS = 1e-4`; minimum clip 0.05 s; no overlap on one track (CZABA rule); exactly one video track; `projectEnd = max(start + duration)`, 0 if empty. There is **no** 60 s cap anywhere.
- `trimClipStart(t)`: `start' = clamp(t, max(prevNeighbourEnd, start − sourceOffset, 0), end − 0.05)`, `sourceOffset' = sourceOffset + (start' − start)`, end fixed. `trimClipEnd(t)`: `end' ≤ min(nextNeighbourStart, start + sourceDuration − sourceOffset)`, `end' ≥ start + 0.05`.
- `splitClipAt(t)`, `start < t < end`: left `{duration: t − start}`; right `{new id, start: t, sourceOffset: sourceOffset + (t − start), duration: end − t}`.
- `deleteTime(a, b)` applies to **all** tracks including video. Clips ending ≤ a are unchanged. Clips starting ≥ b shift by −(b − a). Straddlers keep `[start, a)` and/or a right part `{start: a, sourceOffset: sourceOffset + (b − start), duration: end − b}`. Clips fully inside are removed. Parts < 0.001 s are dropped. `remapTime`: `t ≤ a → t; t < b → a; else t − (b − a)` (applied to position).
- Delete (D-09): with a range → Delete Time, UI label "⌫ დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე". Without a range → only the selected clip (the gap remains).
- Schedule: `when = max(start, from)`, `sourceOffset' = sourceOffset + max(0, from − start)`, `duration' = start + duration − when`. Exclude end ≤ from, and start ≥ until when given. Live start = `startAt + (when − from)` with `startAt = ctx.currentTime + small lookahead`.
- Delete Time (or any edit) while playing: compute the live position p, remap it with `remapTime(p, a, b)` when the edit is Delete Time, then reschedule from the remapped position. Playback continues with no gap and stays aligned with the shifted clips (reference: prototype `deleteTime` uses `map(livePosition())`).
- The same `applySchedule` serves `AudioContext` and `OfflineAudioContext` (grep-verifiable). Muted/non-soloed tracks get gain 0, not a missing source.
- Comments: if the primitive hook injects AGENT_DISCOVERABLE_CODE, follow its naming rules. The comment rule stays: no code comments except TODO (store CLAUDE.md).
- UI (D-07): Georgian; DAW terms in English (Play, Undo/Redo, M, S, Export). Design tokens only (`bg-surface`, `bg-background`, `border-outline`, `text-brand`, `text-accent`, `text-muted`…); no hardcoded colours, no new CSS file, no code comments, semicolons, no `any`/`@ts-ignore`/`as` assertions, `type="button"`, visible focus, `aria-label` on icon buttons.

## 4. Commands (paste real output tails in the report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx
npx biome check ./app                       # read-only /check gate: must show 0 errors
npm run build
git status --short
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**/check rule:** `npm run check` = `biome check --write ./app`, which touches all of app. As of 2026-10-07 it would change nothing: 0 errors, only unsafe fixes, no format diffs. But other agents' unfinished files may change that. So: use `--write` only on your owned paths. Run `npm.cmd run check` only if the read-only `npx biome check ./app` shows no format or safe-fix diffs outside your files, then re-run the hash check. Never run `npm run format`.

**Dev server:** the loop runner already serves `http://127.0.0.1:5173`. Do not start a second server and do not stop it. Browser smoke via gstack `/browse` only (not Claude-in-Chrome), state file `../tmp/studio-real-loop/a-browse.json`.

**Review:** this round changes 3+ files, so invoke the actual `code-reviewer` subagent, fix its findings and quote the result summary in the report.

## 5. Required tests (named, behavioural)

- `model.test.ts`: addClip at a free spot + nearest-free fallback; moveClip blocked by a neighbour; trimClipStart adjusts `sourceOffset` and stops at the source start; trimClipEnd stops at the source end and at the neighbour; splitClipAt offsets; splitClipsByRange → 3 parts; deleteClip leaves a gap; **deleteTime** on 3 tracks incl. video covering every case (before / after / straddling left / straddling right / inside / spanning both edges); remapTime; projectEnd > 60 s; toggleSolo exclusive vs additive; undo/redo deep-equal; no-op commit ignored; redo cleared after a new commit.
- `schedule.test.ts`: from inside a clip, from before a clip, a clip that ended before `from` excluded, the `until` bound, muted tracks still planned, isTrackAudible (solo exclusive, mute overrides solo), video track excluded.
- `graph.test.ts`: a fake context records `start(at, offset, duration)` and `connect` chains. Assert `startAt + (when − from)`, the clip→track→pan→master→destination chain, track gain 0 for muted/non-soloed tracks, `setTrackGain` updates, `stop()` stops all sources and `activeSourceCount()` returns to 0.
- `peaks.test.ts`: bucket count and max-abs values.

## 6. Report `../tmp/studio-real-loop/a-round-1.md`

Include: the pre-flight gate; files actually created/changed (must equal §2); verbatim tails of every §4 command; the code-reviewer findings and how you addressed them; the dev smoke (what you clicked, what happened); any export self-check and its method; limitations and deviations with reasons; anything not done and why. Do not claim C's acceptance IDs as PASS: list them as "ready for C" with the exact checks C should run.

## 7. What C will verify (backlog `SRW-01`)

- R1-U1..U3: unit tests.
- R1-G1: tsc, vitest, build, biome.
- R1-S1: hashes and git status.
- R1-S2: anonymous load and network log. No `/api/studio-token`, `/api/recording-*` or `/api/download` requests, no R2 host, no Authorization header. Media only from `/middle-east.mp3` and `/videos/hero/hero-music.mp3`.
- R1-B1..B12: the central flow, including Delete Time during playback (B12), including rapid Space ×10 producing no doubled sources (C counts `createBufferSource`/`stop` via a patched prototype) and unmute-while-playing being audible.
- R1-E1..E5: export decoded in-browser. Checks: 24-bit, 48 kHz, stereo; duration = projectEnd; RMS in clip windows vs silent gaps; the shift after a move; mute reflected; empty project disabled. **E5 is an independent oracle:** for a synthetic clip with a left trim, `out[(start+k)·48000] == src[(sourceOffset+k)·48000]` within 24-bit quantisation (±2⁻²³ ·2). It is not compared against a second render of the same graph.
- R1-V1: 1440×900 and 1280×720 screenshots.

C intercepts the export through `URL.createObjectURL`, so export must use a blob URL + anchor download.
