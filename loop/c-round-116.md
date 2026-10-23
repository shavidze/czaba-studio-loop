# C — Round 116 verification (T12 stage 3a: lane Volume in dB with −∞)

**Verdict: FAIL.** Every REAL-browser row passes. The only failure is **T116-TARGETED**: C re-ran A's targeted test list and got 367/370 (C-R116-01, a test-scope ruling for B, not a lane defect). `browserVerified = realVerified = true`.

- Environment: `env-status.json` store 200 (2026-10-23T20:19Z). HEAD `d5de68f`. Playwright Chromium (headless), fresh context per session, no credentials.
- Tools, outputs and screenshots: `c-round-116/{tools,out,shots}/`.
- No `c-browse.json` state file: every session ran in a fresh, stateless Playwright context with no credentials. Exported WAVs were deleted after analysis (round-115 precedent); their sha256 and sizes are in `out/wav-sha256.txt`.
- Source: read-only. git status and the frozen list are identical at C's start and end (status md5 `49a4b7cd…`).

## Setup
- Music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s, SFX `demo-soft-impact` @4 s, each added from the library at the insert marker. Snap off, Stop state.
- Lane Volume slider: `[data-track-id=X] input[type=range][aria-label^="Volume"]`; the readout is its next sibling.
- Lane slider width `w` = 103 px (91 px nested). Clip Gain fader 96 px.
- **One entry:** before each row C wrote a distinct sentinel entry (`Undo: Pan — SFX`). "One entry" means one Ctrl+Z restores the value and the Undo title returns to the sentinel.

## Rows (1440 runs r1/r2/r3, 1280 run r1)
| ID | 1440 | 1280 | Measurement |
|---|---|---|---|
| TV-PRESENT | P/P/P | P | Video, music, stems and SFX: `min -60`, `max 0`, `step 0.1`, `value "0"`, `aria-valuetext` `+0.0 dB`, readout `+0.0`, readout title `+0.0 dB`. Group fader `100%`. |
| TV-LAYOUT | P/P/P | P | Worst cases: music −59.9, stems −∞, then SFX −59.9 nested (Ctrl+G stems+SFX). Each lane was swept by keyboard from its default height to the minimum (52–84 px at both viewports), covering the full, regular and tight densities. Readout `scrollWidth−clientWidth` max 0, height 16 px (one line), inside the header. Slider min 91 px (nested), ≥ 24. Header 224 px everywhere. Shots: `layout-*`. |
| TV-DRAG | P/P/P | P | −20 px at w 103: Δ −11.7 (expected −11.65 ± 0.683). No jump on press. Readout and valuetext agree (`−11.7` / `−11.7 dB`). One `Volume` entry; Ctrl+Z → `+0.0`, title back to the sentinel. |
| TV-EXACT-UNDO (extra, R4) | P/P/P | P | A press without movement: no entry, value `0`. Within one gesture, −20 px (at −11.7) and back to start: value `0`, **no entry**. |
| TV-INF | P/P/P | P | Far-left drag → `-60`, `−∞ dB`, readout `−∞` (U+2212 U+221E verified). ArrowRight → `−59.9`; ArrowLeft → `−∞`. 3 entries. |
| TV-KEY | P/P/P | P | ArrowLeft ×3 → `−0.3`; 3 entries (−0.2, −0.1, 0 on Undo). |
| TV-DBL | P/P/P | P | From −11.7, double-click → `+0.0` (one entry). A second double-click adds none. Undo → −11.7, then the sentinel. |
| TV-PLAY | P/P/P | — | Music only, play from 10 s, −30 px while sounding → `−17.5 dB`. Output peak (analyser on destination): −9.45 → −20.24 dBFS, a drop of **10.78** dB (threshold min(10, 17.5−8) = 9.5). **0** `createBufferSource` between press and release. Playhead monotonic (10.10→12.50); still playing. |
| G-T3 | P | P | Master −12 baseline peak −12.000 dBFS, 0 clipped. Lane −6.0 export: peak/RMS ratio **0.501187 / 0.501187** (0.000 % error). Per-sample max |m − t·b| = 0.81 LSB (24-bit). Same frames (4 864 896, 101.352 s, 48 kHz, stereo); 0 NaN. |
| G-T4 | P | P | Clip Gain field `+6` + Enter, lane −3.0: ratio **1.412537** (target 1.412538), per-sample ≤ 1.52 LSB, 0 clipped, no overload message. Headroom: baseline −12 + 3 ≤ −1. |
| G-INF | P | P | Lane `−∞ dB`, music alone: **0 non-zero samples** of 9 729 792 (baseline had 9 706 993 non-zero), same length. |
| G-VIDEO | P | — | Video `beeps-6s-vp9-opus.webm`, audio lanes muted. Export at video lane +0.0 vs −6.0: ratio **0.501187**, ≤ 0.78 LSB. Live: drag −30 px during playback → −17.5 dB. Beep peak −5.9 → −23.5 dBFS. Dock video currentTime 0.99 → 1.97 (through the drag) → 4.48, monotonic, never paused. 0 buffer sources during the drag. (`muted` is true before and after the drag; the source sets it (`ArrangementVideoDock.tsx` l.662 `slot.element.muted = true`, l.934/944). The sound comes through Web Audio: the no-drag probe `play-video-1440-2-nodrag.json` shows −5.9 dBFS beeps once per second.) |
| NB-GROUP | P/P/P | P | Group fader −20 px (w 48): `100%` → `58%` (Δ −0.42, expected −0.417), title `Volume 58%`. One entry; Undo → `100%`. Lanes inside stay `+0.0` / `+0.0 dB`. |
| NB-TRACK-SHIFT | P/P/P | P | Plain −20 px = Shift −20 px = `−11.7`. |
| NB-MASTER | P/P/P | P | Master −20 px: plain −13.5 = Shift −13.5; Undo → 0 (same as round 115). |
| NB-CLIP | P/P/P | P | Round-115 harness unchanged. Single stems +20 px: Δ 17.5 at w 96. Stems+SFX multi +20 px: Δ 17.5 each, difference 7 kept, one entry. |
| NB-PAN-MS | P/P/P | P | Pan +20 px → `42R`; double-click → `C`. Mute and Solo toggle aria-pressed. Volume readouts stay `+0.0` throughout. |
| PX-NET / REG-HYD | P | P | 27 sessions (incl. G116-3): 0 forbidden-host requests, 0 Authorization headers, 0 pageerror, 0 hydration, 0 non-noise console errors. |
| G116-3 (alone, last) | P | — | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token?...` **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)**. |
| SOURCE-SCOPE | P | | `git status`: 11 ` M` + 3 `??`, exactly A's §2 end state (pan-release-recovery and pending-status untouched). Frozen sha256 list OK at start and end. Protected files fa2cf0bc / 13914809 / 56f5b76f / bf9ee257 unchanged; their diff vs d5de68f is empty. |
| AN-REVIEW | P | | The lane diff touches only the Volume fader. Context, model, groups, schedule, graph and export are unchanged (frozen list). In the test diff (140 ± lines), every removed line is a `toBe(...)`, a change value, a `musicVolume` field or a title. 0 lines touch `previewTrackVolume`, Master, group or Clip Gain. 0 `toBeCloseTo`. The `expect(` counts are identical in all 9 changed files. No type assertion in the lane or the module; the new test has one `as const` (OBS-3). No CSS file. A read-only `biome check` on the 12 changed code files is clean. |
| DOC-100 / DOC-099 | P | | Doc 100 has every template section; l.4 = „Round 116 — C-ის შემოწმებას ელოდება (D-29z81; T12 ეტაპი 3a).“ Doc 099 l.4 = „Round 115 — C PASS (`c-round-115.json`, gate 115 `d5de68f`).“ (the `**სტატუსი:**` prefix is kept, as in 100). |
| **T116-TARGETED** | **FAIL** | | C re-run of the same 19 files: **367/370**. 3 red, all in `track-group-mix-ui`: UM3 l.482, UM5 l.571, UM9 l.660. Same counts as A. |

Gate rows (not claimed by C): full vitest, typecheck, build, repo Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Finding for B
- **C-R116-01 (Medium: blocks the gate's full vitest; a test-scope ruling, not a lane defect).**
  - `track-group-mix-ui.test.tsx` still drives the **lane** slider with linear values:
    - UM3 l.480 `dragFader(stems, -50)` → now −30 dB = 0.0316 (expected 0.5; again at l.522);
    - UM5 l.569 `'0.5'` and UM9 l.657 `'0.7'` clamp to 0 dB → 1.
  - C read these lines: each is a lane write. The group-fader and context lines there are not involved.
  - Needs a B grant for that file (scale-only, A's proposed `trackVolumeFromDb(-30/-6/-3.1)`) and a matcher ruling for UM5 l.575 (`liveTrackGains` derived track × group product).
  - Repro: `npx vitest run app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx`. Log: `c-round-116/out/vitest-targeted.log`.

## Observations (not bugs; B rules)
1. **0 dB wording.** The lane shows `+0.0` (as the rows require); the Master shows `0.0 dB` (A deviation 1). See `shots/layout-worst-music-min-1280-1.png`.
2. **Readout read twice.** The visible readout is not `aria-hidden`, which is inherited from the old `%` readout. A proposed `deferred_low_polish`; C did not test with a real screen reader.
3. **`as const`** in `track-volume-db.test.tsx:42`. This is a const assertion and an existing repo pattern.
4. **TV-PLAY is content-dominated with music** (10.78 dB for a 17.5 dB drag). The synthetic beep lane shows the exact 17.5 dB live (−5.9 → −23.5 dBFS).
5. Harness note: one re-run of TV-EXACT-UNDO (`lane-1440-NaN.json`) was a fix to C's own read point (the mid-gesture value had been read after the return movement); the logic is unchanged and all 4 runs pass.

## Ableton correspondence (separate from the CZABA requirement)
- Volume changes the track output (Live 12 §18.1): **confirmed** behaviour. The export ratios are exact.
- −∞…+6 dB range: **unconfirmed** (no source on this runner). The CZABA decision (−∞…0 dB) is recorded; boost is a signal.
- Numeric field: **deliberate difference** (readout only).
- Shift fine: not applicable in 3a (plain = Shift verified).
- Double-click reset: **unconfirmed** for Live mixer faders; the CZABA behaviour is kept.

## Next for B
- Rule on C-R116-01: grant `track-group-mix-ui` scale edits plus the l.575 matcher. Then C re-runs T116-TARGETED only; every browser row is already evidenced.
- Rule on OBS-1 and OBS-2.
