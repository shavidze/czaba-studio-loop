# C round 345 — PERF-DRAG-PREVIEW c5-ii — PASS (browserVerified true)

Tree: HEAD c79642c + A's 6 files, 0 untracked. Dev :5173 = A's tree. Evidence in `c-round-345/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | equals A's final; differs from sketch output only in K2 (`c79642c 6`) and K12 (`stage c5-ii of 7 1 11`) | claims-first.txt |
| SOURCE-SCOPE | 6 files only; source and budgets patches reverse-apply; tests patch fails in the two hunks A named (DP13 label, DP60) | git diff --stat |
| READ | `endStaleClipGesture` unchanged; `hasVideo`/`groupHasVideoClip`/`previewGroup` gone; dock's 4 readers use `videoLaneArrangement`, `hasVideoClips` reads `arrangement`; ArrangementContext untouched | diff |
| UNIT | 5 files, 136/136 | — |
| PERF-LIB | 34/34 | — |
| PERF (production, alone) | rc 0, complete, failures [], 230 rows, 60/60 asserted pass; vs C344 162 EQUAL, 3 DIFF (stopped per-move 98.35→23.617 [x3]; both max 100→25), 0 NEW. Playing ratio [23.65, 23.617, 23.617]; drag-video-live [1,1,1]; release-commits 1/1; playing move-restarts 0. durationMs 465718 | perf-results/, perf-rowcmp-vs-c344.txt |
| MUTANT (own, scratch, deleted) | (1) group branch via previewArrangement, predicted DP53 red: DP51, 52, 53, 54, 56 red (broader than predicted, includes DP53). (2) caption reads committed arrangement, predicted green = gap: 64/64 green → Low C-R345-CAPTION-MUTANT-GAP | mut1-group-video.log, mut2-caption.log |
| DOCK-FOLLOWS (browser) | 1440 and 1280: every field of move and fade (before/mid/held/end/afterUndo), undo titles and undoAfterImport equal to HEAD probe; pageErrors [] | dock-1440.json, dock-1280.json |
| RENDERS (browser, dev) | providerRenders 0 for move/trim/fade, stopped and playing, both viewports. workspace 0 for trim-stopped 1440 and all fades; move workspace 3 (≤3, project-end crossings). perMove: move 28.4 (HEAD 99.4), trim 26.95 (100.7), fade 15.7 (94.4). Release commits move/trim 1 = HEAD; fade 2 stopped / 4 playing (HEAD 1/3, recorded: status-preview flush). dockRenders 59 per move (known, ARCH-R344-DOCK-SUBTREE). Clip states equal to HEAD. 1280 trim behaves like fade (known probe artifact, recorded only) | video-1440.json, video-1280.json |
| G345-AUTH | fresh anonymous contexts both viewports: /studio-lab workspace + demo badge, auth_user null; /studio/middle-east "Sign in required", 0 audio[src]; /api/studio-token 401 / 400 / 500 (mock :5199 down, health refused; 500 allowed only then); no token in bodies. First attempt hit a transient 60 s timeout on first dev compile of the legacy route, rerun passed | tools/g345-auth.json |
| DOCS | doc 232 l.1 and l.4 as specified, 7 `##`, one c5-ii section, DP ids exist (DP1 cites preview-store.test.ts); doc 168 hunks only in its two sections | git diff |
| FLOW (extra, browser) | Add "Soft impact", import 10.mp4, drag video +90 px (start 0 → 2.250, Undo "Move clip"), Export WAV at both viewports: 48 kHz stereo 24-bit, 9.466 s = 2.25 + 7.216, RIFF header consistent, 0 non-finite, SFX audio active 0–2.0 s, silence after (video has no sound track), files identical in size/measure across viewports. 2 samples at full scale come from the SFX source, not this round | export-*.wav, wav.py, flow-*.png |

Gate rows not claimed: full vitest, build, Biome, typecheck, verify, e2e smoke.
Ableton conformance: not applicable (performance change; behaviour proven unchanged).

## Findings (both Low, for B)
- C-R345-CAPTION-MUTANT-GAP: nothing observes the dock caption during a drag.
- C-R345-PERF-DURATION: 465718 ms > 450000 (ROOT-REQ-PERF-TIMEOUT).
Observation, not a bug of this round: an SFX added with Music as the active lane lands on the Music lane.
