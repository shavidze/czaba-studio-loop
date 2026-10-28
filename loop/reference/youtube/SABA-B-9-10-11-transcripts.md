# YouTube findings: SABA-B-9 / 10 / 11 (root, 2026-10-28)

Root searched YouTube, picked the relevant videos and read their transcripts on Saba's computer. These are summaries with timestamps, not transcripts. The manual stays the primary source; where a video adds to or differs from `docs/technical/studio-real-workspace/transport-grid-review.md`, it is marked **NEW** or **CHECK**.

| Video | Channel | Views | What it shows |
|---|---|---|---|
| [Learn Live: Arrangement View](https://www.youtube.com/watch?v=riOD-fnyCsg) | Ableton (official) | 182k | Insert marker, time selection, snap and Alt bypass, locators, Loop |
| [Learn Live: Transport bar and Follow behavior](https://www.youtube.com/watch?v=m84wUU8CQnY) | Ableton (official) | 48k | Play, Stop, Space, Shift+Space, Alt+Space, the position display, Follow |
| [How to change the grid size in Ableton Live 11](https://www.youtube.com/watch?v=GRGGPLLpUTw) | OSCILLATR | 16k | The grid-spacing readout, adaptive grid, Ctrl+1/2/3/5 |
| [Ableton Playhead Tricks For Speedy Editing](https://www.youtube.com/watch?v=7LvBBIWFLfg) | Flow Prod | 10k | "Set Song Start Time Here" on a locator, so Space always auditions from it |
| [Essential Ableton Live Tips (7/33): Locators](https://www.youtube.com/watch?v=tBfiUAqQCTQ) | Form Labs NYC (Ableton Certified Trainer) | 0.7k | Set/Del button, prev/next arrows, quantized Set during playback, right-click rename |
| [Easy to Use PLAYBACK CONTROLLERS for Live Shows](https://www.youtube.com/watch?v=72pGtn2v56U) (Saba's link) | Scott Uhl | 11k | MIDI-mapped Play/Stop/Next/Prev locator on a foot controller (4:22–5:13, 14:15–14:44) |

## SABA-B-10: Insert Marker and playback

- **Insert marker (riOD 1:37).** Clicking the arrangement background shows a flashing insert marker. Dragging from it selects a time range in one track or across several tracks. This is the review's 11c scope: a time selection on the empty background, across tracks.
- **Space (m84w 0:00–0:58).** Space is both Play and Stop. Clicking anywhere in the arrangement places the flashing insert marker, which sets the playback position.
- **Shift+Space (m84w 0:58)** plays from the current song position, that is, where playback stopped.
- **NEW: Alt+Space on Windows, Option+Space on Mac (m84w 0:58)** is "play selection". The review says plain Space plays a time selection from its start. **CHECK** against manual 6.3 before dispatch: if Live separates the two, we need Alt+Space too.
- **Locators (riOD 2:22–3:08):**
  - **NEW:** right-click in the scrub area → Add Locator. Today our marker menu opens only on an existing flag.
  - Double-clicking a locator starts playback from it.
  - Selecting a locator during playback jumps there, quantized to the global quantization setting.
- **Set during playback is quantized (tBfi 0:57–1:16).** The locator lands on the bar, following the quantization setting, and None turns that off. **CHECK** against our M during playback (ABL-R-10).
- **Set Song Start Time Here (7LvB 0:45).** A locator can become the start point, so Space always auditions from it while editing. This is the review's "related setting". B lists it as a later candidate, not in scope.

## SABA-B-11: grid

- **Grid-spacing readout, bottom-right of the track display (GRGG 0:00).** It shows the current spacing as bar/division ("1/1", "1/4", "1/16", "1/8T") and changes with zoom. **NEW** for 11b: our equivalent readout sits next to master volume bottom-right, so B checks how the two share the corner within the screen budget.
- **Adaptive grid by default (GRGG 0:44).** Ctrl/Cmd+1 makes the grid finer, Ctrl/Cmd+2 coarser, Ctrl/Cmd+5 toggles adaptive or fixed, and Ctrl/Cmd+3 toggles triplets (1:27).
- **Snap (riOD 2:22).** Clip moves and edge trims snap to the edit grid. Alt on Windows (Cmd on Mac) bypasses snap while dragging.

## SABA-B-9: transport

- **Transport (m84w 0:00–1:50).** Play and Stop are separate buttons. The position display shows bars.beats.sixteenths and can be dragged or typed into. Follow is on by default, with Ctrl/Cmd+Shift+F.
- **Mixer layout (riOD 0:51).** The mixer sits to the right of the track names; Live 12 shows the Main track's mixer at the bottom of the track list. This matches Saba's "master volume bottom-right".

## Out of scope (Saba's link)

- MIDI-mapped transport on a hardware controller (72pG) is for live performers, so it is not queued.
- We already have locators with Ctrl+←/→ and play from a marker.
