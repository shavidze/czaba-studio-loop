# C — Round 123 report (ABLETON-EXPERT-REVIEW part 1)

taskStatus **PASS** · browserVerified True · areas done P1, P2, P3, P4, P5, P6, P7, P8 · spilled none

Main deliverable: `user-review/ableton-review.md` (Georgian). Evidence: `c-round-123/{tools,out,shots,manual,md}`.

## Scope and method
- Areas P1–P8 reviewed in the real browser (Playwright Chromium headless, fresh context per session, no storage/credentials) at 1440x900, with 1280x720 repeated for every area (P1 and P8 in full; all other scripts ran both viewports).
- Reference: Live 12 manual captures b-round-71 (ch. 6, ch. 42), b-round-78, plus new captures c-round-123/manual/working-with-the-browser-20261024.txt and recording-new-clips-20261024.txt (saved as .txt, treated as data).
- Audio measured on the output: realtime ScriptProcessor tap (c-round-123/tools/rec.cjs, realtime contexts only) and exported WAV data (frames, onset sample, max LSB). Screenshots were opened and described.
- Harness adapted from c-round-121/tools/lib.cjs and c-round-122/tools/lib122.cjs (copied into c-round-123/tools; shot path changed); new helpers h3.cjs, rec.cjs, build.py.
- The ableton-arrangement-expert agent could not be invoked (no subagent tool on this runner). C read its role file; all conclusions rest only on C's browser observations and manual text.
## Per-area summary
- P1 layout: regions mapped; library collapse/resize, detail panel toggle/resize, track height drag and fold work; Ctrl+Alt+B, Alt+/-, U on a normal lane absent (ABL-R-1..3).
- P2 library: AND search, keyboard, preview follow/scrub, double-click/Enter add, drag with Snap/Alt and refused overlap all OK; ABL-B-1 (Low) playing badge overflows; ABL-R-4..6.
- P3 clips: select/move/trim/split/duplicate/delete/Cut Time match the manual or user decisions; Escape does not cancel a drag (known signal).
- P4 clipboard: copy/paste/cut gap/Cut Time OK; occupied paste refused; Copy/Paste/Duplicate Time, Insert Silence missing (ABL-R-7, Medium).
- P5 grid/snap: divisions, digits, triplet, G, Alt both directions, edge snap with Snap on OK; fixed grid only (ABL-R-8).
- P6 ruler/BPM/metronome: BPM does not move audio (WAV onset 96000 at 4 BPMs); metronome accent -6.2 dB, absent from export; empty project refuses Play (ABL-R-9 question).
- P7 markers: add/jump/play/rename/prev-next/drag/delete per 6.4; during playback M steals Space focus and honours a stale range (ABL-R-10, Medium).
- P8 navigation: overview/ruler drag/double-click, +/-, Z/X, Follow pause/resume, waveform zoom OK; ABL-B-2 (Low) duplicate zoom-history step on repeated Z.
## Screenshot descriptions (each opened with Read)
- P1-fresh-1440/1280: library left, toolbar (1280: Follow/Zoom/Fit/Export wrap to a 2nd row), overview + video dock, Snap/1 წმ/Env/1× grid row, BPM/Markers/Loop rows, 4 lanes, detail panel (1440 open, 1280 collapsed).
- P1-lib-resized-1440: library ~368 px with full option titles; P1-lib-collapsed-1440/1280: 40 px rail with ▶, timeline full width, horizontal scrollbar visible under lanes.
- P1-track-taller-1440: music lane taller with amber height bar; SFX lane partly pushed below; P1-music-folded-1440: music lane folded to a thin bar with the clip as a strip.
- P1-clip-selected-1280 / P1-range-selected-1280: detail panel shows name, lane, start, length, source offset, 3/5 fields; at 1280 the open panel leaves only the video and music lanes visible.
- P2-search-two-words-1440: search field 'middle' with 1 result (shot taken after the last query; the two-word results are only in JSON). P2-preview-playing-1440 + P2-badge-*: '▶' outside the option card, 'ისმის' clipped (ABL-B-1).
- P2-drag-ghost-snapoff-1440: dashed mint ghost '00:03.350' on SFX; P2-drag-ghost-snapon-1440: ghost '00:06.000' on stems, Snap button amber; P2-drag-occupied-1440: dashed amber ghost '00:07.350 · აქ ადგილი არ არის' over Slow rise.
- P3-range-on-waveform-1440: grey range 3–5 s with label '00:03.000 – 00:05.000 · 2.000 წმ', clip stays selected; P3-marquee-1440: translucent rectangle across music/stems/SFX, detail '2 კლიპი'.
- P3-move-to-stems-1440: Soft impact on stems at 2 s, status 'გადატანა ხაზზე — სტემები: start 00:02.000'; P3-move-occupied-ghost-1280: dashed amber ghost on music with 'აქ ადგილი არ არის'.
- P3-trim-past-end-1440: music clip 4.37–20.37 (16 s), status 'Trim შეჩერდა: წყაროს დასასრული…'; P3-split-range-1440: stems split in 3, middle 8–10 selected, status 'შუა ნაწილი არჩეულია'.
- P3-trim-past-end-1440 and P3-split-range-1440 also show blue native text-selection boxes on the SFX header (▾, C, M, S, +0.0). Not reproduced in 4 targeted probes (selprobe.cjs, selprobe2.cjs: drags, Escape, marquee, Ctrl+A; selection length 0). The preceding first-run drag started on a clip off-screen at 1440 (x≈1447), so it is treated as a harness artifact; see notesForB.
- P3-dup-group-1440: copies after 20.37 s, status 'დუბლირება (2): ასლები 00:20.370-დან'; P3-ctrl-shift-l-1440: grey range band across all 4 lanes, label '… · ყველა ხაზი'; P3-cut-time-1440: gap closed, Soft impact moved left; P3-range-all-delete-1440: 10–12 s gap on music and stems.
- P4-paste-other-lane-1440: Soft impact copy on music at 3 s, status 'ჩასმა (1): 00:03.000-ზე · მუსიკა ხაზზე'; P4-paste-occupied-1440: status 'ჩასმა ვერ შესრულდა: სტემები ხაზზე 00:08.000–00:10.000 დაკავებულია'; P4-cut-time-single-lane-1440: stems 6–8 + 8–20, status 'Cut Time 00:08.000 — 00:10.000 …'.
- P5-bpm-120-grid-1440: BPM 120, bar numbers 1–12 under the seconds ruler, grid 0.5 წმ; P6-rulers-bpm120-1280: bars 1–10, detail panel open (C-R114-01 cut line visible).
- P6-empty-play-metronome-1440: metronome amber/on, BPM 120, status 'დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.', playhead 0.
- P7-three-markers-1280: Marker 1, Marker 2 flags and the 'Marker 3' name editor open over a 11.2–12.8 range; P7-m-during-play-norange-1440: Pause visible, editor 'Marker 1' selected in the Markers row at ~1.5 s; P7-m-during-play-editor-1440: Pause visible, Marker 1 at 11.2 focused, status 'ამ დროზე მარკერი უკვე არის'; P7-after-ops-1280: Pause visible with an empty marker editor open (Space went into the name).
- P8-overview-fit-1280: overview frame spans the whole width, ruler 0:00–2:20, status 'Fit: მთლიანი პროექტი ჩანს (02:30.372). X აბრუნებს.'; P8-z-zoomed-1440: 137.2 px/წმ, ruler 0:02.5–0:09, range label 4.014–8.029; P8-follow-after-restart-1440: 78.1 px/წმ, view at 0:23–0:34 with playhead 28.57, status 'Follow შეჩერდა ხელით ნავიგაციისას. Follow ან Play აბრუნებს.'.
- P8-waveform-zoom-4x-detail-1440 / -1280: 4× button amber, lane waveforms enlarged and clipped to the lane, new SFX clip also enlarged, detail waveform normal; status 'Waveform Zoom 400% — მხოლოდ ხედი, ხმა არ იცვლება.'.
- g123-3-lab-1440: workspace with the amber demo badge 'დემო კოლექცია — ავტორიზაცია არ სჭირდება'; g123-3-protected-1440: lock icon, 'Sign in required', Sign In button, no workspace.

## Bugs
- ABL-B-1 (low, P2): the badge row overflows the option: scrollWidth 139-152 px > clientWidth 126 px; '▶' sits past the card edge and 'ისმის' wraps to a second line clipped by the list edge — c-round-123/shots/P2-badge-demo-soft-impact-1440.png, c-round-123/shots/P2-preview-playing-1440.png, c-round-123/out/P2c.json
- ABL-B-2 (low, P8): the second Z pushes a duplicate entry: the first X leaves the view at 137.7 px/s while the status says 'წინა ხედი აღდგა. X კიდევ ერთი ნაბიჯით აბრუნებს.'; only the second X returns to 40 px/s. Same at 1280x720 — c-round-123/out/P8b.json (zTwice, both viewports), c-round-123/tools/p8b.cjs

## Recommendations
- ABL-R-1 (Low, P1/P6): Live view/transport keys: Ctrl+Alt+B toggles the library, Ctrl+Alt+3 toggles the detail panel, O toggles the metronome (all three do nothing today)
- ABL-R-2 (Low, P1): Alt+= / Alt+- change the selected lane height (and Alt while dragging the split line resizes all lanes)
- ABL-R-3 (Low, P1): U folds/unfolds the selected ordinary lane (today U only acts on groups and answers 'select a group')
- ABL-R-4 (Low, P2): a key to focus the library search (Live Ctrl+F; in a browser Ctrl+F is find-in-page, so CZABA needs another key such as '/' or Ctrl+Shift+F)
- ABL-R-5 (Low, P2): question for Saba: should a drop below the last lane create a new lane? (Live creates a new track; CZABA has a fixed lane set)
- ABL-R-6 (Low, P2): question (B-R107-ENTER-ON-BODY, open user question): Enter / double-click adds at the playhead on the active lane; confirm this is the wanted target
- ABL-R-7 (Medium, P4): add the missing time commands Paste Time (Ctrl+Shift+V), Duplicate Time (Ctrl+Shift+D) and Insert Silence (Ctrl+I); at least show a status line for the keys that do nothing today (Ctrl+Shift+C/V, Ctrl+I give no feedback)
- ABL-R-8 (Low, P5): optional zoom-adaptive grid mode (the division follows the zoom) next to today's fixed division, toggled by a key (Live Ctrl+5; CZABA would need a plain key such as 5)
- ABL-R-9 (Low, P6): question for Saba: allow Play (transport + metronome) in an empty project, so a user can set BPM and listen to the click before adding sound
- ABL-R-10 (Medium, P7): during playback, M adds the marker at the playhead even when a time range is still selected (today it goes to range.start, ROW-RANGE-M), and does not open the name field (today the field takes focus, so the next Space types a space into the name instead of stopping)

## Guard rows / passed
- SOURCE-SCOPE-start
- P1-review
- P2-review
- P3-review
- P4-review
- P5-review
- P6-review
- P7-review
- P8-review
- G123-3
- SOURCE-SCOPE-end
- PX-NET/REG-HYD (38 review sessions + G123-3: 0 forbidden, 0 Authorization, 0 hydration, 0 pageerror)
- LIVE-KEYS Ctrl+Alt+3 / O exercised (out/keys.json)

## Blocked
- G123-3 fake-Bearer 403 sub-check: backend unavailable in cloud
- blocked: CDP — Ctrl/Cmd+digit grid keys (CTRL-DIGIT-BROWSER-RESERVED), lone Alt (ALT-CHROME-MENU), ContextMenu key / Shift+F10 marker and grid menus, real touch hardware

## Invalid runs
- {'row': 'P1 survey', 'reason': 'first /studio-lab load of the job: page.evaluate saw document.body null (ENV-FIRST-LOAD); discarded once and replaced', 'utc': '2026-10-24T01:45Z'}
- {'row': 'P3 deselect/lane-move (first run)', 'reason': 'harness clicked the lane background at t=30 s, off-screen at both viewports, so the selection was not cleared and later moves dragged 3 clips; replaced by p3b.cjs (visible point)'}
- {'row': 'P3/P5 1280 right-edge trims', 'reason': 'clip right edge beyond the 1280 viewport; trim drag started off-screen (harness); 1440 result used'}
- {'row': 'P4 first run', 'reason': 'an unconditional Undo after a correctly refused paste removed an earlier clip; replaced by p4b.cjs (Undo only when history changed)'}
- {'row': 'P6 metronome first capture', 'reason': 'the script had deleted the only clip, and Play is refused in an empty project; replaced by p6n.cjs (clip at 6 s)'}
- {'row': 'P7 first run add rows', 'reason': 'M opens the name editor; the marker renders only after commit, so rows read one step late; re-read step by step in p7b.cjs'}
- {'row': 'P8 follow/ruler-H first run', 'reason': 'zoom too far out (whole view visible) for Follow paging or ruler scroll; replaced by p8b.cjs at 78 px/s'}

## Notes for B
- ableton-arrangement-expert could not be invoked (no subagent tool on this runner); C read its role file and used only browser observation + manual text.
- Outcome per current-task §7 row 1: every P area done, no ABL-B at Medium or above -> round 124 = ABLETON-EXPERT-REVIEW part 2 (Q1-Q7). Transcribe ABL-B-1 and ABL-B-2 (Low) into deferred_low_polish and ABL-R-1..10 into backlog.json as awaiting_user.
- ABL-R-10 touches plan R3 (user asked that the name field opens at once); it is only proposed for playback, so Saba must decide.
- Round-121 inputs: waveform zoom is not an Undo step and the detail panel waveform is not zoomed (browser-confirmed); Live parity for both stays '?'.
- Unreproduced observation (not a bug): native text-selection highlight on the SFX header in two first-run P3 screenshots; 4 targeted probes found selection length 0. If it appears again with a reproducible gesture, record it then.