# C round 121 — T12 stage 4b Waveform Vertical Zoom: verification report

**Verdict: PASS.** 0 app bugs. `browserVerified: true`, `realVerified: true`. Env: `env-status.json` round 121, store 200 (00:00:44 UTC).
Tool: Playwright with headless Chromium, a fresh context per session and no credentials. Evidence is in `c-round-121/{tools,out,shots}`; the state file is `c-round-121/c-browse.json`.

## Checkpoint log
- 00:01 UTC: SOURCE-SCOPE start OK. AN-REVIEW done. T121-TARGETED: 24 files / 379 tests.
- 00:05:25–00:07:46 UTC: the `wz.cjs` rows ran at both viewports (`out/wz-1440-1.json`, then `out/wz-1280-1.json`).
- 00:08:50–00:10:15 UTC: WZ-AUDIO, WZ-METER (runs 1 and 2) and G121-3 ran. SOURCE-SCOPE end check at 00:10:23 UTC.
- (An earlier interim checkpoint line said "00:20 UTC" for the wz rows. That was an estimate, not a clock reading; the times above come from the artifacts' `utc` fields and file mtimes.)

## Rows

| ID | Result | Evidence / measurement |
|---|---|---|
| T121-TARGETED | PASS | 24 files / 379 tests passed, rc=0. Same counts as A. `out/t121-targeted.log` |
| AN-REVIEW | PASS | **ArrangementClip:** the optional `waveformZoom = 1` prop, and `peakScale = clipWaveformScale(...)` replaces `gainScale` in both the memo and its deps. `buildPeakShape` is unchanged.<br>**Lane:** the prop, its default and the pass-through, nothing else.<br>**Workspace:** the state, the inline handler, the select as the last grid child, `data-waveform-zoom` and the lane prop. No context, history, localStorage or onKeyDown.<br>**Module:** matches R1. `parseWaveformZoom` accepts only the listed levels.<br>**Tests:** WZ1–WZ9 are present, and the WZ1 literals match §3.2 character for character.<br>**Doc 103:** has all 7 TEMPLATE sections.<br>`out/an-diff.txt` |
| A's shell writes (listed per AN-REVIEW) | noted | mkdir; tee logs; Python temporary mutations m1–m5, each restored from `.bak` with sha256 verified; `sed -i` on A's own probe script; an accidental read-only `git stash list`. No lasting store edit by shell |
| SOURCE-SCOPE | PASS | HEAD `0a75ba8`. The §2 end state is exact (3 ` M`, 3 `??`). `sha256sum -c` is OK at the start and at the end. DetailPanel is `87c878e5…`. All 4 protected files are unchanged. The owned files are byte-identical between the start and end of C's phase. `out/source-scope-{start,end}.txt` |
| WZ-PRESENT 1440 / 1280 | PASS / PASS | The select is the last child and shows `1×` with `data-waveform-zoom="1"`. It is 28 px wide and ends at 210 px (≤ 216). scrollWidth 223 ≤ clientWidth 223. Grid row 28 px. Chrome rows `[28,20,20,16]`. Lane y and h equal the baseline (1440: 275/356/437/518 at h 81; 1280: 313/374/454/534 at h 61/80/80/80). **All four 1× `d` sha256 equal the baseline** (be86af38 / 43e96d8a / 9fa65c46 / e1890358) |
| WZ-T7 (Test 7) 1440 / 1280 | PASS / PASS | 2× was chosen with a real mouse click, which opens the popup, and a keyboard pick (ArrowDown + Enter). The ratio rule with s = 2 holds:<br>• music: 2269 judged, 1580 clamped at y = 0.000;<br>• stems: 288 judged;<br>• sfx: 39 judged, 7 clamped.<br>maxErr 0.001, 0 violations, 0 columns past the clip edge. The video `d` is unchanged. The detail panel `d` (stems, 480 columns) is identical at 1× and 2×. Status `Waveform Zoom 200% — მხოლოდ ხედი, ხმა არ იცვლება.` The title shows 200 % and the accent classes are on. Chrome rows and lanes are unchanged. Back at 1×, all 4 shas equal the baseline. `shots/WZ-T7-{1x,2x}-{1440,1280}-1.png` |
| WZ-LEVELS (1440) | PASS (valid) | ½×: music 3835 judged and 201 at the floor (y = 0.980). 4×: music 651 / stems 256 / sfx 33 judged. 8×: music 216 / stems 192 / sfx 24 judged (≥ 10). 0 violations at every level; maxErr ≤ 0.004 against a tolerance of 0.0054 at 8×. Statuses 50/400/800 %. The video is unchanged. Back at 1×, all 4 shas equal the baseline |
| WZ-GAIN (1440) | PASS | Field −6.0 Enter, then 2×: ratio s = 1.002374, 288 judged, maxErr 0.00087. A fader drag of −20 px, sampled mid-drag at valuetext −23.5 dB: ratio s = 10^(−23.5/20) × 2, 64 judged and 576 at the floor, 0 violations. The Undo title during the drag stayed the previous one. After release: `Undo: Clip Gain`, and one Ctrl+Z returns −6.0 with the zoom still at 2× |
| WZ-HISTORY (1440) | PASS | The Undo/Redo titles and disabled states are identical before and after choosing 4× (`Undo: Clip Gain`/`Redo` disabled). Ctrl+Z restores the gain to 0.0 and the zoom stays 4× (both the value and the attribute). Ctrl+Shift+Z brings back −6.0, and the zoom is still 4× |
| WZ-AUDIO (1440) | PASS | Stems only (music and SFX muted, no video, the round-120 isolation). The 1× and 2× WAV exports are **byte-identical**: sha256 `3946976d…`, 29 189 420 B, PCM 24-bit 48 kHz stereo, 4 864 896 frames, 101.352 s. Max \|Δ\| 0 LSB, peak and RMS ratio 1.000000, 0 NaN, 0 full-scale, peak 0.2967. `out/audio-1440-1.json`, `out/exports-sha.txt` (the WAVs were deleted after comparison) |
| WZ-METER (1440) | PASS (run 2) | Loop `00:02.500 — 00:04.500`. The output tap gave a peak of −10.555 dB in every iteration (1×, 1×, mixed, 2×, 2×): paired Δ 0.000 / 0.000 dB. Each iteration had 3 `createBufferSource` calls (all equal) and lasted 2000 ms. 0 stalls, the playhead was monotonic within each iteration, and it was still playing at the end. The stems track meter `data-peak` read −10.6 throughout. Run 1 is harness-invalid (only one bounded 1× iteration); it was replaced once |
| WZ-NEWCLIP (1440) | PASS | At 2×, `demo-soft-impact` was added to SFX at 8 s. Its 2× drawing against its own 1× reading: ratio s = 2, 39 judged and 7 clamped, 0 violations |
| WZ-KEYS (1440) | PASS | Stems selected and the select focused:<br>• ArrowDown → 2×, ArrowUp → 1×, ArrowLeft → ½×. These are native select changes, and the drawing follows each one.<br>• Delete and Space do nothing. Headless Chromium does not expose whether Space opened the popup, so that state is not observable. After Space, the zoom, the focus, the playhead and the transport were unchanged, and Escape was pressed afterwards.<br>The clip start (2.000), the clip count (4), the playing state (stopped), the playhead (0) and the Undo title were unchanged after every key. Focus stayed on the select |
| WZ-RELOAD (1280) | PASS | Chose 4× (attribute 4), then reloaded: the control shows `1×` with `data-waveform-zoom="1"`. There is no zoom key in localStorage |
| Neighbours (1440) | PASS | **Zoom:** at 2×, zoom-in 40→50 px/s and zoom-out 50→40 both pass the ratio rule at the new column counts (music 4096 / 4054 columns).<br>**Move + Undo:** a clip move of 2.000→2.500 is undone back to 2.000, and the zoom stays 2×.<br>**Grid controls:** the Snap toggle works on and off, the grid division changes 1→10, and Env turns on and off. The zoom stays 2× throughout.<br>**Overlay:** fade-in 1.000 and one envelope point are drawn over the 2× waveform (`shots/NB-fade-envelope-2x-1440-1.png`).<br>**1280 lane fit:** the 61/80 heights are unchanged (WZ-PRESENT 1280) |
| G121-3 | PASS (+1 BLOCKED) | `/studio-lab`: the workspace and the demo badge are shown. `/studio/middle-east`: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token`: **401** `Please sign in to access Studio.` Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)**. `out/g121-3.json` |
| PX-NET / REG-HYD | PASS | Every session had 0 forbidden-host requests, 0 Authorization headers, 0 hydration messages, 0 pageerrors and 0 non-noise console errors. The only console errors were the known cloud noise (2–4 per session) |

**Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Method notes
- **Zoom changes:** in headless Chromium, a real mouse click on the select opens the native popup; the arrow keys move the highlight and Enter commits. All 22 zoom changes used this method, with 0 `selectOption` fallbacks.
- **Ratio rule:** the same as round 120. `h0` is the 1× / 0 dB reading at the same horizontal zoom.
- **Invalid run:** `meter-1440-1`. It was a C harness wait condition, not an app result.

## CZABA requirement vs Ableton correspondence
| Behaviour | CZABA requirement | Ableton correspondence |
|---|---|---|
| A separate control enlarges the drawing and does not change gain or audio | Met (WZ-T7, WZ-AUDIO, WZ-METER, WZ-GAIN) | **Confirmed** (Live 12 §6.1, B capture b-round-71) |
| Applies to all audio tracks and to new clips | Met (WZ-T7, WZ-NEWCLIP) | **Confirmed** (§6.1) |
| Video clips are not zoomed | Met (video sha unchanged at ½×–8×) | Matches the manual's "audio clips" wording. Video in Live is not tested, so this is a CZABA decision |
| Stepped `½×–8×` select in the grid row | Met (WZ-PRESENT, WZ-LEVELS) | **Unconfirmed.** A deliberate CZABA difference from Live's slider; the range and position are not in the manual |
| Not an Undo step | Met (WZ-HISTORY) | Inference, **unconfirmed** |
| The detail panel is not zoomed | Met (detail sha unchanged) | **Unconfirmed** |

The unconfirmed rows go to ABLETON-EXPERT-REVIEW.

## Observations for B (not bugs)
- **Select affordance:** because of `appearance-none` (which the spec requires to fit 224 px), the select has no dropdown arrow. At non-1× it looks like the accent Snap/Env chips. Its discoverability is a candidate for DESIGN-UX-REVIEW.
- **Architecture:** the reviewer's note (a 5th view-preference prop threaded Workspace → Lane → ClipView, verdict keep) belongs in the ARCH-CHECKPOINT-SRW14-PREFS addendum, as A reported.
- **Outcome:** T12 stage 4b qualifies for `c_pass`. After publication, T12 V1 (T12.27 items 1–8) is complete. Per §8, the next planning is the REGRESSION round.
