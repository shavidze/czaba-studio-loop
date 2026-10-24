# C — Round 125 report (DESIGN-UX-REVIEW part 1)

_Written incrementally._

## Rows
- **SOURCE-SCOPE-start**: PASS — HEAD 608187f, git status empty, sha256 list OK.
- invalid run: first survey load — ENV-FIRST-LOAD hydration error, discarded once.
- **D6-baseline**: PASS — bbox at 1280/1440 for S0/S1/S2 captured twice in fresh contexts: max difference 0 px in all six states (keys identical). Contrast on composited surfaces + pixel samples. Under-24 px list: 50 keys (1280), 48 (1440).

### D6 screenshots (opened and described)
- `shots/D6-S0-1440.png`: empty Studio; toolbar on one row (Play, ↤, time 00:00.000, Undo/Redo/Split/წაშლა/Loop disabled-grey, Follow, Zoom slider 40 px/წმ, Fit, Export); library with 9 demo items; four empty lanes (ვიდეო, მუსიკა active-teal, სტემები, SFX); empty detail panel expanded; status line + grey hint line at the bottom, hint on one line.
- `shots/D6-S1-1440.png`: video clip 0–6 s (amber) with colour-bar picture in the dock; group row «ჯგუფი 1» over მუსიკა+სტემები; hero clip at 0, pulse stem from 2 s, Soft impact selected at 4 s (teal ring); Marker 1 at 1 s; orange Loop brace 2–4 s; Loop button lit; Undo shows "Undo: Gr…"; detail panel shows Soft impact fields 4 / 6, Clip Gain 0.0; footer shows status, selected-clip line, hint line.
- `shots/D6-S2-1440.png`: Export dialog over a darkened Studio: WAV/MP3/WAV+MP3/video(disabled) cards, scope project selected, range card disabled (no range), loop note, video original sound line, footer დახურვა / WAV-ის ექსპორტი. Everything visible.
- `shots/D6-S0-1280.png`: toolbar wraps: Follow/Zoom/Fit/Export on a second row; detail panel collapsed (გაშლა ▸); library list is short (scroll), hint line on one line.
- `shots/D6-S1-1280.png`: same fixture; with the detail panel expanded the SFX lane (with the selected clip) is cut off behind the detail panel: only its top edge shows. "＋ საკუთარი ვიდეო" collapses to a 20x20 "+" icon. (Layout observation for part 2, not a bug here.)
- `shots/D6-S2-1280.png`: Export dialog; the range card is under the footer (only its top edge shows) — this is the known C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER, measured, not re-reported.
- **D1-scorecard**: PASS — 11 tasks, 24 paths at 1440 and 13 at 1280 (T1, T6, T8, T10, T11), each in a fresh context; counts by wrapper; one-step Undo checked. Result: equal T1–T6, T9, T11; CZABA easier T10 (M opens the name field); Live easier T8 lane Volume (typed value, 42.6 F); T7 and T8 Clip Gain not comparable (Live ?).
- **D2-shortcuts**: PASS — 81 Live ch.42 rows + 17 CZABA rows, ~160 key presses at 1440 with before/after snapshots (d2, d2-redo, d2c, d2d, d2e); discoverability at 1440 and 1280. same 31 / different 15 / missing 27 / n/a 6 / blocked: CDP 2 (Ctrl+F, Ctrl+Shift+R) / CZABA-only 14 (+3 code-only or side effect). Shift+click selects one clip, not first-to-last (Live 42.5) → different. Marker menu Shift+F10 reached via CDP. Detail range fields: Esc does not revert the draft (no contract; part 2). Hint line fits on one line at both (right edge 1201 px).
- **G125-3**: PASS — /studio-lab workspace + demo badge; /studio/middle-east "Sign in required", 0 workspace, 0 audio[src] at 1440 and 1280; GET /api/studio-token 401. Fake-Bearer 403: BLOCKED (backend unavailable in cloud).
- **SOURCE-SCOPE-end**: PASS — HEAD 608187f, git status empty, sha256 list OK.

## Summary
taskStatus **PASS** · browserVerified **true** · sections done D6, D1, D2 · spilled none · partComplete true.
Deliverable: `user-review/design-ux-review.md` (Georgian; sections 4–5 left for part 2 with DUX-R-1/2 recorded).

### Bugs
- **DUX-B-1 (Low)**: the `dim` token is 3.67:1 on the surface (pixel-confirmed) and 3.08:1 on the selected library row. It is used for informational text: the hint line, the detail-panel labels, library counts and video captions. All 53 `dim` elements are below 4.5:1. Selected-row `muted` meta is 4.38:1. Contract: `visual-direction-a.md` l.45/l.113. Fix path: the VISUAL-A dim token. → `deferred_low_polish` or VISUAL-A V-stage.

### Recommendations (awaiting_user)
- **DUX-R-1 (Medium, behaviour)**: typed number entry for lane and Master Volume. Today −3 dB takes 30 × ↓ or a ~45 px Shift-drag; Live 42.6 lets you type the value.
- **DUX-R-2 (Low, new UI)**: a shortcut reference. Ten working behaviours are not shown anywhere on screen.

### Cited, not re-reported
ABL-B-1/2, ABL-R-1…18, R77-BUTTON-SHORTCUT-SUPERSET (◀ ▶ buttons say "marker", while Ctrl+→ also stops at clip edges: measured 1 → 4), C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER (D6-S2-1280), ROOT-R65-L2, ROOT-R73-S3-MARKER-BUTTON-SIZE, GATE83-L2-POINT-HIT-AREA, HR-ESCAPE-NO-DESELECT, INFO-C101-SPACE-A-VS-C.

### Notes for B (data, not findings)
- S1 export: 159 full-scale samples in the 4 s range (hero + pulse summed at 0 dB); relevant to T12 meters.
- 1280 with the detail panel expanded: the SFX lane sits behind the panel, and right-clicks hit the panel (part 2 friction).
- Ctrl+Alt+V pastes and Ctrl+Alt+E splits (Alt is not excluded; Windows AltGr = Ctrl+Alt). No contract exists, so part 2 judges it.
- Volume fader: a 6 px drag does nothing; 0.66 dB/px; Shift gives 1/10.
- Harness mishap: a d2 redo run overwrote the main evidence file. The main groups were re-run, and the evidence is in `out/d2/d2-1440-main.json`.

### Exports measured (user's real-output check)
- Project WAV: 150.37244 s, 7217877 frames, 48 kHz / 24-bit / stereo, no NaN, non-silent (RMS 0.29). Rendered in 1.96 s.
- Range WAV 6–10 s: exactly 192000 frames (4.000 s). The range scope was preselected because a time selection existed.
- The 1280 and 1440 runs gave the same sizes.
- Loop playback wraps from 7.85 back to 6.10 (loop 6–8).

### Roles consulted
ableton-arrangement-expert, flow-sage, first-visit-host and accessibility-auditor were read as checklists (no subagent tool on this runner).

### Not reachable / blocked
- Ctrl+R, Ctrl+F, Ctrl+Shift+R and Ctrl+1…5 are browser-reserved (blocked: CDP).
- The fake-Bearer 403 check needs the backend, which is unavailable in the cloud.

### Gate rows (not claimed)
full vitest, typecheck, build, Biome, npm run verify → gate-round-125.

### Invalid runs
The first /studio-lab load hit ENV-FIRST-LOAD (hydration error + invalid hook call, Vite cold start). It was discarded once; the re-run was clean.

### D1 / D2 / G125-3 screenshots (opened and described)
- `shots/D1-T1-drag-1440.png`: Soft impact dropped on the SFX lane at 3 s (teal selected clip 3–5 s); detail panel shows start 00:03.000, length 00:02.000; status "„Soft impact“ დაემატა SFX ხაზზე 00:03.000-ზე."; Undo label "Undo: და…". (The 1280 file is the same result.)
- `shots/D1-T2-lane-1440.png`: the pulse clip is moved from stems to SFX at 2 s (selected, 2–18 s); the detail panel says ხაზი SFX; status "გადატანა ხაზზე — SFX: start 00:02.000."
- `shots/D1-T10-1440.png` / `D1-T10-1280.png`: a "Drop" marker at 7 s next to Marker 1 at 1 s; after Home + Ctrl+→ ×2 the playhead stands at 4.000 (start of the SFX clip), not at Drop. At 1280 the SFX lane is mostly under the detail panel.
- `shots/D2-hint-1440.png` / `D2-hint-1280.png`: footer strip with the status line, the selected-clip line and the grey hint line. The hint is complete on one line at both sizes and ends "F2 · U"; it is legible but low contrast (DUX-B-1).
- `shots/D2-menu-clip-1440.png`: right-click on the selected SFX clip opens the grid menu (10 წმ … 0.1 წმ, ✓1 წმ, "Snap (G)") over the detail panel. `D2-menu-clip-1280.png`: no menu; the click lands on the detail panel because the SFX lane is behind it.
- `shots/D2-menu-ruler-1440.png`: right-click on the ruler opens no menu; the state is the unchanged S1.
- `shots/D2-marker-menu-1440.png`: right-click on "Marker 1" at 9 s opens "სახელის შეცვლა (F2) / დაკვრა აქედან / წაშლა (Delete)" under the marker row.
- `shots/D2-video-expanded-1440.png`: the expanded video floats over the library (272 px wide) with drag/collapse/✕ handles; the dock shows "ვიდეო გაფართოებულია · დაბრუნება"; status "ვიდეო გაფართოვდა ბიბლიოთეკის თავზე. გადაათრიე სასურველ ადგილას; Esc ან ✕ აბრუნებს." Escape returned it to 160 px.
- `shots/g125-3-lab-1440.png`: a fresh /studio-lab with the amber demo badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება", four empty lanes and the library. `g125-3-protected-1280.png` (and 1440): a lock icon with "Sign in required" and a Sign In button; no Studio UI.
- `shots/survey-1440.png` / `survey-1280.png`: the same empty workspace as D6-S0 (orientation only).

### Advisor follow-ups applied
- Ctrl+F and Ctrl+Shift+R are now `blocked: CDP` (no longer counted as missing).
- Shift+click was re-tested on one lane; it adds one clip, not first-to-last, so the row is now `different`.
- Previously unpressed component keys were probed (d2d/d2e): grid menu, marker menu, fold Space, tempo Enter/Esc, detail range Enter/Esc, preview Enter, expanded-video Esc/arrows.
- The unread screenshots were read. `under24px.json` now carries the baseline label.
