# B round 248 → 249 planning (2026-10-29)

**Decision: CONTINUE.** Round 249 is **SABA-B-10a stage 1**: a separate Insert Marker.
- Space plays from it (or from the time-selection start).
- Shift+Space continues from the stop point.
- Ctrl/Cmd+Shift+Space moves the marker to the playhead.
- A click during playback moves only the marker (Saba decision 1).

Decisions D-29z426…D-29z434. The baseline is HEAD `0e862be` (gate 248 `commit`), clean, with 11 grants (10 by B's applied diff, plus doc 191) and 1,099 frozen files.

**Advisor:** available and consulted after orientation and the first pre-check, before writing. It asked for:
- the housekeeping;
- packaging the pre-check and a mutant set;
- rulings on the stale range, Home/↤, the `seekTo` callers, the Cut Time remap, the edit-command divergence, the D-27 text, the L51 clobber list and the transcript CHECK;
- two signal fixes: the lane-centre y, and the `data-range-start` render condition.

All of these were done (§3). A final advisor check follows this report.

**Consults:** none new. The Ableton facts come from the local manual captures `b-round-71/ableton-*-20261021.txt` (42.16 and 42.20 quoted on 2026-10-29), `transport-grid-review.md` §2 and `reference/youtube/SABA-B-9-10-11-transcripts.md`. The behaviour of a click during playback has no reference; Saba's decision 1 settles it.

## 1. Inputs read
- **Gate 248:** `published`, commit `0e862be`, pushed to both remotes. Review 8.5/10, no Critical issues. Suggestions:
  - S1: no visual paused state;
  - S2: screen reader;
  - S3: repeated visibility check;
  - S4: info;
  - an Architecture note (`resolveEffectiveSnap`).
  `verify.log`: 214 files, 3,109 tests and the build passed.
- **C round 248:** PASS. `browserVerified` and `realVerified` are true, 16 rows passed, and the purchased origin is BLOCKED (backend). One Low (C-R248-01) and three info notes.
- **A round 248:** no STOP. A flagged the two doc-186 lines that C later filed as C-R248-01.
- **Regression:** `regression-last.json` is round 199, 2026-10-27, so it is due on or after 2026-10-30. Today is 2026-10-29: **not due**. RETRO is next at round 260.
- **User-review folder:** no new decision file. AGREE-SABA-B-7 is still unanswered.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are the unchanged old snapshots (2026-10-07 content; the same as at the round-247 planning). No new finding for this round.
- **Archive:** `tasks/round-248.md` is a byte copy of the round-248 `current-task.md` (`cmp` identical; it did not exist before). Before-copies are in `b-round-248/*-before-249.*`.

## 2. Backlog changes from independent evidence (D-29z426…D-29z428)
- **Closed by C round 248 PASS and gate 248:** SABA-B-11b (stages 1, 2a, 2b) and ABL-R-8.
- **To `deferred_low_polish` (403 → 406):**
  - C-R248-01: round 249 does not own doc 186, so the cheap-fix exception does not apply;
  - GATE248-S1: also added as option (e) of SABA-Q-11B-HIDDEN-SNAP, because it is a UX decision;
  - GATE248-S2.
- **Info:**
  - GATE248-S4;
  - INFO-C248-STALE-NOTE (already part of SABA-Q (d));
  - INFO-C248-ADAPTIVE-3: B did not check it against the D-29z361 chooser in this planning, so it becomes the regression row C-ADAPTIVE3-CHECK, and a mismatch becomes a Low.
- **Architecture:** GATE248-S3 and the Architecture note become the signal GATE248-ARCH-EFFECTIVE-SNAP (not scheduled), recorded as ARCH-CHECKPOINT-TEMPO-GRID addendum 11. Both pending checkpoints are re-asked in `b-round-248-checkpoint-request.md`. Neither is answered yet, and neither blocks.
- **Regression scope:** C-INSERT-MARKER-249 (conditional on round 249) and C-ADAPTIVE3-CHECK are added to REGRESSION-ROUND-2026-10-30.

## 3. Round 249 (D-29z429…D-29z433)
- **The bug, measured at HEAD `0e862be` in Chromium at both viewports:**
  - Space after a stop resumes from the stop point (3.700) instead of the click point (2.0);
  - Shift+Space is the same as Space;
  - Ctrl+Shift+Space does nothing;
  - a lane click during playback jumps playback (9 → 9.861);
  - Space ignores a time selection (1.232 instead of 5).
- **The model (D-29z430):** two positions. While stopped, every positioning action moves both; only Stop separates them. A point replaces a selection (Live 6.9). D-27 now applies to the start point.
- **Path rulings (D-29z431):**
  - `seekTo` writes the marker and keeps the range. EN3 went red when it cleared the range, so it was ruled, not granted.
  - `playFrom` clears the range: without that, a strip click followed by Stop and Space jumped to a stale selection (prototype v3, measured).
  - Home and ↤ use `returnToStart`, which jumps while playing, as at HEAD. Saba's decision 1 covers timeline clicks; this one is a question for him.
  - The playhead handle keys move the playhead (`onScrubEnd`).
  - Cut Time remaps the marker.
  - Paste, add, split and M are unchanged until stage 2; C records the divergence as info.
  - The "Pause" label stays until SABA-B-9 (B-R249-PAUSE-LABEL).
  - The review's "status on every Space" is not adopted (L51).
  - The new statuses are event lines (INFO-B249-STALE-MARKER-STATUS).
- **B's pre-check:**
  - `precheck-scratch.diff`, 10 files, sha256 `dd9b5198…2686`;
  - tsc and Biome clean;
  - **the full suite on the scratch: 215 files, 3,123/3,123**;
  - covering set 122 files, 1,815 tests;
  - 16 mutant runs, each with the expected red rows;
  - Chromium HEAD vs fix at both viewports.
- **A measured finding:** the review predicted that 44 test files pin the Space contract. Version 1 of the prototype ran all 214 HEAD files: 3,108/3,109, and only BR4b went red. No existing test played, stopped and played again, so the 14 IM rows add that coverage. Recorded as a RETRO 260 candidate.
- **Invalid attempts, kept:**
  - a lane click at the lane's bottom edge missed (re-run at the centre);
  - a run with no clip in the project;
  - prototype v3's stale range.
- **Saba questions (L44, D-29z432):** SABA-Q-10A-HOME-PLAYING, SABA-Q-10A-CTRL-ARROW-RANGE and SABA-Q-10A-DEVIATIONS. The seconds-ruler click that now clears a selection is attached to SABA-Q-TIME-RULER-ROLE. None blocks.
- **Mac chord:** Cmd+Shift+Space cannot be browser-verified in the cloud. It is on the Tech Lead list as TLM-R249-MAC-CMD-SHIFT-SPACE, with a RETRO 260 deadline (L46).
- **Advisor's final check:** it added the HEAD-differs note to C-POINT-RANGE-249, the flag single click while playing to C-FLAG-249, the Mac TLM row, the root-files line and the checkpoint file. All five are done.
- **Transcript CHECK resolved:** m84w 0:58 says Alt+Space plays the selection; KS 42.20 gives plain Space, and Ctrl/Option+Space is "Stop at End of Selection". The manual wins.
- **Why we missed it:** `transport-grid-review.md` §2.4 by reference. L44 already exists, so no new lesson is needed (`lessons.md` unchanged, 57 lines).

## 4. Stage split (D-29z429)
- **Stage 1 (round 249):** the model, the keys, the click paths, the range start and the hidden signal.
- **Stage 2:**
  - marker-aware paste, Enter-add, Ctrl+E and M while stopped (Live 6.4);
  - M while playing keeps the live position (ABL-R-10);
  - the D-27 text names the marker;
  - **C-R235-02** Follow pause and resume (Live 6.2) and the seconds-ruler role.
- **SABA-B-9** brings the Stop button, its double-click and the label. **SABA-B-10b** brings the visible flashing marker and the sheet rows.

Nothing is dropped, and nothing is deferred without authority.

## 5. Next (D-29z434)
1. Round 250 = **REGRESSION** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry, including C-INSERT-MARKER-249 and C-ADAPTIVE3-CHECK.
2. If that planning is still on 2026-10-29: SABA-B-10a stage 2 (or a fix-up if round 249 fails).
3. Then 10b, 9 and 11c. SABA-B-7 runs when Saba answers. Then SYS-5, PERF b-ii and the rest of the queue, unchanged.

- **Commit readiness for root:** round 249 changes 7 source files and 3 test files (1 of them new) and adds doc 191. Publish only after C PASS and the gate. Round 248 is already published (`0e862be`). The loop-state commit carries this planning.

## 6. Completion check
- **Not COMPLETE.**
  - SABA-B-10a is dispatched, not verified.
  - 10a stage 2, 10b, 9 and 11c, SABA-B-7, SYS, PERF, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2 remain.
  - All 406 deferred Lows must be fixed and C-verified before final acceptance.
- **Not BLOCKED.** Runnable work exists. Only SABA-B-7 and PHASE2-VIDEO-SCORING wait for Saba.

## 7. Self-check
- **Backlog edits** come only from C-248 and gate-248 evidence, plus B's own probe and mutant files.
- **Protected files** are untouched and frozen, each listed once. `/studio-lab` stays demo-only (the Auth row).
- **The store tree was not modified:**
  - every experiment ran in `/tmp/b249-*` and on `:5174`, which is now stopped;
  - `git status` is empty, and the frozen list gives rc 0;
  - `:5173` still answers 200.
- **Speed rule:** no task row asks A or C for the full suite; those are gate rows. B's own full run on the scratch is planning evidence, not an acceptance row.
- **Real behaviour:** C plays real audio (output tap RMS), checks the video `currentTime` with a real webm, and checks the export hash. These are not simulations.
