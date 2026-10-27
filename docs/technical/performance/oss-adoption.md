# Open-source adoption plan (for B to detail)

**Date:** 2026-10-27 · **Status:** approved by Saba · **Source:** an independent open-source survey (about 50 projects, each checked on its GitHub or npm page, licences included). This page keeps only what the loop needs.

**Principle:** use a well-maintained library where it removes real code or risk. Write it ourselves where the job is small (a WAV writer, a peak pyramid). Most adoptions fold into tasks that are already queued, so the plan adds **one** new round (OSS-LIC) and drops one (PERF-6).

## Dependencies: how they get in

A must not change `package.json`. When a dispatched task needs one of the packages below, B writes `loop/root-deps-request.json` at planning:

```json
{"add": ["zustand"], "remove": []}
```

At the start of the next job, root (`cloud/run.sh`) installs exactly the version listed in `cloud/deps-allowlist.json` with `--save-exact`. Root commits one `chore(deps): …` commit on store master, pushes both remotes and records it in `loop/root-deps-done.json`.

- B asks one job before the task's round, or in the same planning step as the dispatch. The round's baseline is then the `chore(deps)` commit.
- A name that is not on the allowlist is skipped and logged. Adding a package to the allowlist is root's (Saba's) decision.
- **Baseline rule:** when HEAD is a root `chore(deps): …` commit directly on top of the baseline named in `current-task.md`, and it changes only `package.json` and `package-lock.json`, it counts as the baseline. A and C do not stop on it.

| Package (exact) | Licence | For |
|---|---|---|
| `zustand@5.0.16` | MIT | PERF-FADER, PERF-8, PERF-10 |
| `mediabunny@1.62.1` | MPL-2.0 | PERF-16, PERF-12 (WAV writer, optional), later phase 2 (SRW-41/40) |
| `@mediabunny/mp3-encoder@1.62.1` | MPL-2.0 (wraps LAME, LGPL) | PERF-16 |
| remove `@ffmpeg/ffmpeg`, `@ffmpeg/util` | (`@ffmpeg/core` is GPL-2.0+) | PERF-16 |

## Mapping onto the queued PERF tasks

| Task | What changes | Reference | Rounds |
|---|---|---|---|
| **PERF-FADER-a/b, PERF-8, PERF-10** | The external stores use `zustand/vanilla` (`createStore`) with `useStore(store, selector)` and `useShallow` for components. Continuous gestures (fader, pan, gain, range drag) write through `store.subscribe` / refs to the `AudioParam` and the control's own display, with no React state per move. Keep the existing `positionStore` pattern; zustand replaces only the hand-rolled context slices. One store per concern (mix, selection/range, view); actions stay stable. | [zustand](https://github.com/pmndrs/zustand) README "transient updates" | unchanged |
| **PERF-16 (moved before PERF-6, PERF-6 dropped)** | MP3 export through `mediabunny` + `@mediabunny/mp3-encoder` in the existing export worker (~130 kB gzip in place of ~31 MB from unpkg). Remove `@ffmpeg/*` and the unpkg URL. MP3 export then becomes testable in the cloud (it is not today). Keep the export dialog, progress, cancel and file names exactly as they are. | [@mediabunny/mp3-encoder](https://github.com/Vanilagy/mediabunny/blob/main/packages/mp3-encoder/README.md) | 1–2 |
| PERF-6 | **Dropped.** It only self-hosted the ffmpeg core that PERF-16 removes. B records the drop with a D-ID. | — | −1 |
| **PERF-5, PERF-14** | Build the peak pyramid ourselves (min/max per power-of-two level, computed in the peaks worker). Draw only the visible window on canvas tiles; the clip DOM shell stays for drag, handles and a11y. gl-waveform is the design reference, not a dependency, unless B's spike shows it saves real code. | [gl-waveform](https://github.com/audio-lab/gl-waveform) (MIT) | unchanged |
| PERF-12 | The streaming WAV writer is ~60 lines; write it ourselves. Using mediabunny's WAVE output is allowed if it is already installed for PERF-16 and measures no worse. | Mediabunny docs | unchanged |
| PERF-13 | Keep `decodeAudioData` (it decodes off the main thread already). Lazy decode and the LRU budget are our code. No decoder library now; `mpg123-decoder` is LGPL upstream, so it is not on the allowlist. | — | unchanged |

**New round: OSS-LIC (1 round, right after the first new dependency lands).**
- Add `THIRD_PARTY_NOTICES.md` (package, version, licence, link) for every runtime dependency, with the LAME note: the LAME wasm ships as its own file, unmodified, and the licence text is linked.
- Add a unit test that reads `package-lock.json` and fails on a runtime dependency whose licence is GPL-* or AGPL-* (devDependencies excluded), with an explicit allow-list for exceptions. Today `@ffmpeg/core` is not in the lock; the test must pass on master after PERF-16.

## Later entries (no new rounds; B uses these when it details them)

- **PHASE2B-SPOTTING (SRW-46a hits):** keep the spec's own detector. If its accuracy rows fail, Meyda (MIT) spectral flux is the allowed fallback. It needs a root allowlist entry first.
- **SRW-44 ducking (phase 2):** dialogue detection by Silero VAD (MIT model) through `onnxruntime-web`, lazy-loaded only when the user asks for ducking. `@ricky0123/vad-web` documents only live microphone input, so file analysis runs our own frame loop. It needs Saba's go-ahead for phase 2 and an allowlist entry.
- **STUDIO-AGENT-COMMANDS (CMD-3 plan executor):** take the patterns, not the code:
  - typed commands with `additionalProperties: false`;
  - structured errors (for example `LOCKED_REGION`);
  - `validate → simulate → execute`, where simulate is a dry run that returns the diff;
  - one atomic undo step per plan.

  References: [wavecraft](https://github.com/lazyperspective/wavecraft) (MIT) and [ableton-mcp](https://github.com/ahujasid/ableton-mcp) (MIT). OpenChatCut is AGPL: ideas only, never code.
- **Recording analysis (backend, outside the loop):** LUFS, true peak and LRA with ffmpeg's `ebur128` filter or libebur128 (MIT). Scene cuts with PySceneDetect (BSD-3) on the backend.
- **Find sound / auto-tag (K-6, needs Saba and a legal check):** LAION-CLAP weights are Apache-2.0, but the training data's rights are unclear. Not queued.

## Never copy code from

openDAW, GridSound and OpenChatCut (AGPL); aubio (GPL); essentia.js (AGPL, models CC BY-NC-ND); `@ffmpeg/core` (GPL-2.0+). peaks.js and waveform-data.js are LGPL-3.0: not on the allowlist. Do not download anything from look-alike "official" repos (for example `Audacity2026/.github`, `ardour-digital-daw`).
