# C round 72 — SRW-16 named markers, stage 1 — verdict FAIL (1 medium bug)

Verifier C · 2026-10-21 · Linux cloud · Playwright Chromium, fresh incognito contexts, 1440x900 and 1280x720. Artifacts: `c-round-72/` (tools, shots, WAV exports, run logs), `c-round-72.json`.
`:5173/studio-lab` 200 at start/end; backend `:5199` unavailable (expected). Source untouched: HEAD 1e469e5, 10 status lines, owned-file sha256 equal at start and end.

## Bug C-R72-01 (medium) — Delete/arrows hit a focused marker instead of the selected clip
Normal flow: add a marker (focus returns to its flag), click a clip (selected, brand ring), press Delete. Result: the **marker** is deleted, the clip stays; plain → does not nudge the clip. Control with focus blurred: the clip is deleted, marker kept. Reproduced at both viewports (`tools/dbg3.cjs`, `dbg6.cjs`, `bug-b72-1-1280.txt`). The task (R10/MU8) expects the clip click to leave the marker unfocused. A's tests miss it: MU8 never clicks a clip after a marker has focus, and mutation h (remove the window-branch guard) survives. Undo restores the marker, so no permanent data loss, but a destructive key acts on the wrong object.

## What passed (real browser, both viewports unless noted)
Add (M, button; name editor; Undo `Add Marker`; Undo/Redo), flag x equals the 12 s ruler tick (0 px), add at range.start (20.000, default `Marker 1`), add during playback (marker within 20 ms of the readout, monotonic position, 0 extra `createBufferSource` also for rename and delete), Escape, duplicate refusal, click jump (playing continues), double-click play with a master-meter rise within 0.6 s and 12.96 s after 1 s, Ctrl+←/→ and ◀/▶ (12, 20, 40, end 101.352, then status; back to 0), rename/Escape/empty-name (status keeps old name, Delete in the input does not delete the marker), Cut Time (12/20/40 → 12/30, `1 მარკერი წაიშალა.`, clip tail moved 10 s, Undo/Redo), layout (row 20 px, no overlap, titles carry the full name), typing `m` in search and BPM, Ctrl+→ ignored in BPM, export before/after 3 markers (24-bit 48 kHz stereo, 4,864,896 frames = 101.352 s, 0 NaN, 30 full-scale, maxDelta 0, byte-identical), ruler seek/Fit 3/3, playhead alignment, BPM 90, loop brace create+drag, marquee, Ctrl+Shift+L, Space/Home/G/1/2/arrow nudge (focus on body), no hydration warnings, 0 forbidden requests, 0 Authorization headers.
G72-3: `/studio-lab` anonymous shows the demo badge; `/studio/middle-east` shows "Sign in required"; anonymous token API 401.

## Not verified / blocked (so browserVerified=false)
Fake-Bearer 403 (backend down: got 500), header-link entry, vertical-scroll stickiness of the marker row (no vertical overflow to scroll), C mutations beyond a, c, h (a and c killed; h survives), gate rows (vitest/verify/build/Biome are the root gate's).

## Info for B
- M uses `range.start` while a range exists, even after a later ruler click; Live drops the selection on click. Consider clearing or documenting.
- A's two deviations (blur during a gesture does not commit; blur never moves focus) behaved as described: ruler click and library-search click both committed, focus stayed with the user's click.
- Ableton verdicts are in the JSON (`ableton`).
