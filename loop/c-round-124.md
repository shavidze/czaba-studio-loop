# C — Round 124 report (ABLETON-EXPERT-REVIEW part 2)

taskStatus **PASS** · browserVerified True · areas done Q1, Q2, Q3, Q4, Q5, Q6, Q7 · spilled none · reviewComplete True

Main deliverable: `user-review/ableton-review.md` (Georgian, part 1 kept intact; backup `c-round-124/ableton-review-part1.md`). Evidence: `c-round-124/{tools,out,shots,manual,md}`.

## Scope and method
- Areas Q1-Q6 reviewed in the real browser (Playwright Chromium headless, fresh context per session, no storage or credentials) at 1440x900 and 1280x720. Every Q script ran in full at both viewports (Q1 and Q5 required; Q2-Q4 and Q6 also ran in full). Q7 = merged verdict (no new experiments).
- Reference: Live 12 manual captures b-round-71 (ch. 6, ch. 42), b-round-78 (ch. 18), plus new captures in c-round-124/manual: working-with-video, automation, clip-envelopes, managing-files-and-sets, mixing (all 2026-10-24, saved as .txt, treated as data).
- Audio measured on the output: realtime ScriptProcessor tap with per-channel peak/RMS (c-round-124/tools/rec2.cjs, realtime contexts only) and WAV exports compared by window RMS/peak, onset frame, frame count and max LSB. MP3 decoded in the browser and aligned by best lag.
- Harness: copied from c-round-123/tools (lib.cjs, lib122.cjs with shot path changed, h3.cjs, rec.cjs, wav.cjs, report.cjs; g123-3.cjs adapted to g124-3.cjs with a 1280 check); new: rec2.cjs, survey.cjs, q1-q6.cjs, q5w.cjs, q6dbg.cjs, q6key.cjs, build124.py.
- The ableton-arrangement-expert agent could not be invoked (no subagent tool on this runner). C used its role file as a checklist; every conclusion rests only on C's browser observations and manual text.
## Per-area summary
- Q1 transport/video: Space/Stop per D-15 (resume from stop point; Home -> 0), video import by button and synthetic drop, broken.mp4 and WAV refused with clear messages, video clip move/trim with source offset, picture follows playhead (exact when paused; <= 11 ms while playing, 3 points per viewport), video-lane Mute silences the output (0.511 -> 0.000) while the picture runs, video fade picture-only with Undo/Redo.
- Q2 loop: Ctrl+L creates/replaces/toggles one brace; brace and edge drags with Snap off/on; 3 wraps at 2.000 s +-1 block with the video back at 2.00 s; Ctrl+Shift+L multi-lane range -> loop; brace keys left/right and Shift+left/right work, up/down and Ctrl+up/down do nothing (ABL-R-11).
- Q3 groups: Ctrl+G, nested group, F2 rename, fold with clip overview, U, Ctrl+A + arrow moves hidden clips; WAV: group mute 0, group solo, mute beats child solo (plan R3), exclusive child solo, group volume -6 dB = 0.5012, outer mute; Ungroup + Undo/Redo.
- Q4 fades/envelope: linear fades (0.25/0.50/0.75 at quarters), in+out limited to clip length, no crossfade (T12-ADVANCED), envelope add/drag/delete with exact linear interpolation (0.875/0.75/0.625), breakpoints free with Snap on (ENVELOPE-SNAP -> ABL-R-13), move/trim/split keep the sound.
- Q5 mix: Clip Gain and Volume -6 dB = 0.5012 on the output; waveform follows Clip Gain only (x0.500) not Volume; Shift fine 10x on lanes, Master still 0.5 dB steps (ABL-R-15); pan hard L/R leaves the other channel at 0; mute; exclusive/additive solo; Master -6 and Master mute in export; meters show over/clip and a resettable peak; Delete on a fader does nothing (ABL-R-14).
- Q6 export: sample-exact onsets and frame counts for project and range exports, range = project at the same offset (0 LSB), MP3 (CDN reachable) correlation 1.000 at lag 0, cancel with no file, overload warning, video sound included and muted by its lane; Live's extra render options listed (ABL-R-16..18).
## Screenshot descriptions (each opened with Read)
- survey-1440: fresh workspace; library left, toolbar, overview + video placeholder 'ვიდეო ჯერ არ დაგიმატებია', Snap/1 წმ/Env/1x row, BPM/Markers/Loop rows, 4 lanes (ვიდეო, მუსიკა, სტემები, SFX), detail panel open, shortcut hint line at the bottom.
- Q1-playing-1440: Pause button amber, time 00:02.593, video dock top right showing the colour test pattern, video clip 'beeps-6s-h264-aac.mp4' with beep ticks on the video lane, pad clip selected on stems, playhead at ~2.6 s.
- Q1-fade-in-1280: video clip at 1.5-7 s selected (mint frame) with a diagonal fade line from its left edge, status 'Video Fade In: 1.000 წმ.', detail panel collapsed (1280), Follow/Zoom wrapped to a second toolbar row.
- Q1-broken-1440: empty project, status line 'broken.mp4: ბრაუზერმა ეს ვიდეო ვერ გახსნა — სცადე MP4 (H.264) ან WebM.', no clip, no error overlay.
- Q2-multilane-range-loop-1280: grey range band 0:08-0:10 across all 4 lanes with label '00:08.000 – 00:10.000 · 2.000 წმ · ყველა ხაზი', amber 'Loop' brace above it, Loop button amber, status 'Loop ჩანაცვლდა ახალი მონაკვეთით'.
- Q2-video-gap-1440: playhead at 7.5 s past the 6 s video; dock shows 'ვიდეო არ არის · 00:07.500' on a dark background.
- Q3-nested-1280: group rows 'ჯგუფი 1' (outer) and indented 'Score' with M/S/volume, child lanes მუსიკა/სტემები under Score, SFX under the outer group; Soft impact clips at 1, 4 and 7 s.
- Q3-inner-folded-1440: Score folded (▸) with two dark clip bars in its row (1-3 s, 4-6 s), SFX lane below, outer group S shown half-filled (mixed).
- Q4-fades-1440: pad clip selected with square handles at 0:02 and 0:14 and diagonal fade lines from both clip edges; status 'Fade Out: 2.000 წმ.'.
- Q4-envelope-1280: Env button amber; orange envelope line flat at the top 0-6 s, falling to mid-height at 10 s, flat after; two square breakpoints; fade lines still visible; status 'Envelope: 10.000 წმ · −6.0 dB.'
- Q5-waveform-cg-minus6-1440: pad waveform visibly thinner on the lane and in the detail panel; Clip Gain field '-6.0' focused.
- Q5-meters-over-1280: playing at 00:02.993; Master readout box red '+6.0'; Soft impact clip selected with Clip Gain 6.0 in the detail panel; stems lane meter green.
- Q6-dialog-1280: Export dialog, WAV selected, MP3, WAV+MP3, disabled 'ვიდეო (აუდიოთი)', 'მთელი პროექტი · 00:00.000 — 00:09.250' selected; the 'მონიშნული მონაკვეთი' card is partly under the footer.
- Q6-progress-1280: 'რენდერი · 19%' with green progress bar, buttons გაუქმება / დახურვა / მიმდინარეობს….
- Q6-overload-1440: green 'WAV შეიქმნა: 00:16.000…' and amber 'გადატვირთვა: პიკი +6.0 dBFS — 5256 sample შეიზღუდა 0 dBFS-ზე…'.
- g124-3-protected-1280 (and 1440): lock icon, 'Sign in required', Sign In button, no workspace.

## Bugs

## Recommendations
- ABL-R-11 (Low, Q2): Loop brace keys from Live: Up/Down shift the brace by its own length, Ctrl+Up/Down double/halve it (today Up/Down and Ctrl+Up/Down do nothing on the focused brace and show no status)
- ABL-R-12 (Low, Q4): Fade curve handle: let the user bend a clip fade (today every fade is a straight linear-amplitude ramp; measured 0.25/0.50/0.75 at the quarter points)
- ABL-R-13 (Low, Q4): Envelope breakpoints snap to the grid while Snap is on, with Alt to bypass (today a breakpoint dragged by 0.37 s with Snap on lands at 6.370; ENVELOPE-SNAP signal)
- ABL-R-14 (Low, Q5): Delete on a focused Volume, Pan, Master or Clip Gain control returns it to its default (today Delete on a focused fader does nothing; it also does not delete the selected clip, which must stay true)
- ABL-R-15 (Low, Q5): Master Shift-drag uses a finer step (for example 0.1 dB like the lane faders); today Shift only slows the drag, and the value still jumps in 0.5 dB steps (Shift −3 px stays 0.0, Shift −10 px gives −0.5)
- ABL-R-16 (Medium, Q6): Question for Saba: export each lane (or each group) as its own WAV of equal length, like Live's 'All Individual Tracks' / 'Selected Tracks Only'
- ABL-R-17 (Medium, Q6): Question for Saba: render the edited video with the mixed audio (today the 'ვიდეო (აუდიოთი)' option is shown disabled with 'not in this cycle')
- ABL-R-18 (Low, Q6): Optional render settings: Normalize, 44.1 kHz, 16-bit (with dither) next to today's fixed 24-bit 48 kHz stereo

## Passed
- SOURCE-SCOPE-start
- Q1-review
- Q2-review
- Q3-review
- Q4-review
- Q5-review
- Q6-review
- G124-3
- Q7-verdict
- SOURCE-SCOPE-end
- PX-NET/REG-HYD (14 review sessions + 2 survey + G124-3: 0 forbidden requests, 0 Authorization headers, 0 hydration, 0 pageerror)

## Gate (not claimed)
- full vitest
- typecheck
- build
- Biome
- npm run verify

## Blocked
- G124-3 fake-Bearer 403 sub-check: backend unavailable in cloud
- blocked: CDP — Ctrl/Cmd+digit, lone Alt, ContextMenu key / Shift+F10, real touch hardware, real pointercancel, real OS file drag (Q1 drop used a synthetic DataTransfer drop event), Ctrl+Shift+R (browser hard-reload accelerator; via CDP the page neither reloaded nor opened the export dialog)

## Invalid runs
- {'row': 'survey (first /studio-lab load of the job)', 'reason': "ENV-FIRST-LOAD: hydration error + 'Invalid hook call' console errors and an empty DOM on the first load after the dev server warm-up; discarded once and replaced (second survey clean)", 'utc': '2026-10-24T02:40Z'}
- {'row': 'Q6 first run, range export (1440)', 'reason': "harness: the range drag started 0.2 s (8 px) inside the SFX clip's left edge, so it trimmed the clip instead of making a range; the range radio stayed disabled and the click timed out. Replaced by a range drag inside the 16 s pad clip (q6.cjs current version), both viewports"}
- {'row': 'Q6 first rerun, MP3 correlation (1440)', 'reason': 'harness: the MP3 was compared with an older export without the pad (corr 0.9227); compared with the matching export the correlation is 1.000 at lag 0; rerun replaced it'}

## Notes for B
- ableton-arrangement-expert could not be invoked (no subagent tool on this runner); C read its role file as a checklist and used only browser observation + manual text.
- Q5: the first q5.cjs check 'waveChanged:false' after Clip Gain was a harness error (it compared only a 60-character prefix of the path); q5w.cjs compared the full path: Clip Gain -6 scales the waveform x0.500, Volume -6 leaves it unchanged (both viewports).
- Outcome per current-task section 7: reviewComplete true (P1-P8 in round 123, Q1-Q6 + Q7 here), no ABL-B at Medium or above (part 2 found no new bug) -> ABLETON-EXPERT-REVIEW done; round 125 = DESIGN-UX-REVIEW (first step of VISUAL-A-OBSIDIAN), unless B plans on/after 2026-10-27 (regression first).
- Transcribe ABL-R-11..ABL-R-18 into backlog.json ableton_recommendations as awaiting_user. ABL-R-16 and ABL-R-17 are questions with Medium priority (recommendations, not bugs; the bug gate does not apply).
- Known signals re-confirmed with fresh evidence (no new finding): VIDEO-FADE-SOUND (video sound not faded: RMS 0.118 in fade vs 0.117 after), ENVELOPE-SNAP (6.370 with Snap on), ENVELOPE-CLEAR, MASTER-FINE-STEP (scored: Shift still 0.5 dB steps -> ABL-R-15), C-R76-OBS-SOLO-MUTE-HISTORY (Mute/Solo/Master clicks are Undo steps), GROUP-VOLUME-VISIBLE-READOUT (for DESIGN-UX-REVIEW).
- For DESIGN-UX-REVIEW: at 1280x720 the Export dialog's 'მონიშნული მონაკვეთი' option sits partly under the footer until scrolled (shots/Q6-dialog-1280.png); group Volume has no visible value next to the fader.
- INFO-C101-SPACE-A-VS-C: in this round every Space press toggled play/stop at both viewports (keyboard.press after blur); no new information on the A-side observation.

## Attempt 2 (2026-10-24 03:10 UTC)
- Attempt 1 had already completed Q1–Q7, G124-3 and SOURCE-SCOPE-end. Attempt 2 checked the artifacts: progress `next=done`, all sections and the index in `user-review/ableton-review.md`, every evidence path it cites exists, and part-1 rows are intact against `ableton-review-part1.md`.
- G124-3 re-run in a fresh browser context: the lab shows the workspace and the demo badge; `/studio/middle-east` shows "Sign in required" at 1440 and 1280 (0 `audio[src]`, no workspace); `/api/studio-token` returns 401; 0 forbidden requests, 0 Authorization headers, 0 pageerror, 0 hydration messages. Evidence: `out/g124-3.json` (the attempt-1 copy is `out/g124-3-attempt1.json`) and `shots/g124-3-protected-1280.png`, which shows the lock icon, "Sign in required" and the Sign In button.
- SOURCE-SCOPE re-checked: HEAD is `608187f`, `git status` is empty, `sha256sum -c` is OK. No new findings.
