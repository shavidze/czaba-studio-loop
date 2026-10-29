# B round 251 → 252 planning

Written 2026-10-29 by B. **Decision: CONTINUE.** The next task is round 252: SABA-B-10a stage 2b (the final 10a stage) plus the IM22 test-strength fix (`current-task.md`, D-29z452…D-29z460).

**Advisor:** available and consulted after orientation, before writing. A second call comes before declaring done. Every point was followed except one, recorded in `backlog.json` `advisor_used_by_B`:
- The advisor suggested a lane click might resume Follow.
- B parses Live 6.2's "the Arrangement or clip scrub area" as two scrub areas, so the lane stays unchanged (an inference, written as such in task §1.1 and §3).

No project subagent was consulted. The reference question was answered from the Live 12 manual (WebFetch, chapter 6) and root's transcript notes.

## 1. Evidence read
- **`current-task.md`:** round 251, archived as `tasks/round-251.md` (`cmp` identical; it did not exist before). Snapshots of every file B edits are in `b-round-251/*-before-252*`.
- **`a-round-251.md`:**
  - no STOP;
  - the covering run passed 1,843/1,843;
  - 10 mutant runs, red as planned;
  - the reviewer's 8/10 note: one Medium (IM22), Lows and an Architecture note.
- **`c-round-251.md` / `.json`:** **PASS**, with `browserVerified` and `realVerified` both true.
  - 17 rows passed.
  - The purchased origin is BLOCKED (backend unavailable in cloud), which is open evidence, not a failure.
  - One Medium is open: A-R251-REVIEW-IM22-PLAYING.
- **`gates/gate-round-251.json`:** **published**, commit `83b7c756ce3108d0e31f023a1aa2b0e59547d913`, the same hash on both remotes.
  - `verify.log` shows 215/215 files.
  - `export-progress-ui.test.tsx` passed 8/8 (1,242 ms).
  - The review is `COMMIT: OK`, 8.5/10, with 3 Lows, 2 infos and an Architecture note.
  - **The next baseline is `83b7c75`, and the tree is clean.**
- **`regression-last.json`:** 2026-10-27, round 199. Today is 2026-10-29, 2 days later, so REGRESSION is **not due** (the rule is ≥ 3 days). It is due at the first planning on or after 2026-10-30.
- **`root-pre-push-review.md` / `publication-checkpoint.json`:** from round 3 (2026-10-07). Their findings were triaged long ago, and there is nothing new.
- **`user-review/`:** no new Saba answer. SABA-B-7 (AGREE) is still `awaiting_user`.

## 2. Backlog changes, from independent C evidence only
- **Closed** (D-29z452; C round 251 PASS plus the gate 251 publication):
  - C-R250-01;
  - A-R250-REVIEW-PASTE-SPLIT-PLAYING;
  - A-R250-REVIEW-IM18-IM20-ASSERTS;
  - A-R249-REVIEW-IM3-CMD;
  - A-R249-REVIEW-IM13-LEAK;
  - B-R250-GESTURE-KEYS;
  - GATE249-S1;
  - C-EDIT-DIVERGE-249;
  - C-R249-INFO-PASTEND-WORDING.
- **Board (`feature-status.md`):**
  - SABA-B-10a stage 2a (rounds 250 and 251) → **მზადაა**;
  - round 252 → **მუშავდება**;
  - the queue row is updated.
- **SABA-B-10a as a whole stays `in_progress`.** Stage 2b is not built yet.
- **EXPORT-PROGRESS-LOAD-FLAKE-250:** gate 251 did not reproduce it. It stays on watch, and no isolation task is scheduled.
- **New findings:**
  - A-R251-REVIEW-IM22-PLAYING (Medium, round 252 item 0);
  - SABA-Q-FOLLOW-EDIT-RESTART (info, `awaiting_user`, L44);
  - GATE251-REVIEW-HOME-DRAG-INFO (info, a REGRESSION neighbour probe).
- **`deferred_low_polish`** grows to 413:
  - GATE251-S1;
  - A-R251-REVIEW-ADD-DESCRIBEDBY;
  - A-R251-REVIEW-CLASS-SELECTORS.
- **L7 (same root cause):** B-R236-END-WORDING, a deferred Low, is the same text issue as B-R251-PASTEND-AT-END. It is dispatched with round 252 and closes with it.
- **Superseded:** C-R145-OBS-LIBRARY-PLAYHEAD, because round 251 renamed the readout.
- **REGRESSION-ROUND-2026-10-30 `scope_additions`:**
  - C-FOLLOW-252 and C-NAV-ORIGIN-252 (if round 252 passes);
  - the Home-during-drag probe.
- **Architecture signal GATE249-ARCH-TRANSPORT-POSITIONS:**
  - addendum 2: gate 251's `resolveCommandPosition`;
  - addendum 3: A's `useArrangementInsertMarkerWriter`, at 10b's third subscriber.

  These are signals only. The checkpoint request goes to root after the round-252 PASS, at the 10a/10b boundary.
- **`lessons.md`:** new **L52** (D-29z459), a while-playing readout assert in jsdom (2×). The file has 58 lines.

## 3. Rulings (details in the task)
- **D-29z453: stage 2b as one round, plus IM22 as item 0** (the bug gate puts the Medium first). There is a seam if A STOPs on the behaviour item.
- **D-29z454: the Follow rules from Live 6.2.**
  - While playing, a beat-time ruler click pauses Follow.
  - A scrub-strip click and Stop resume a paused Follow.
  - `off` stays off.
  - Lane clicks are unchanged.
- **D-29z455: the logic sits at the `StudioWorkspace` call sites** (`placeInsertMarkerFromRuler`, the `playFromRuler` resume, and the stop effect).
  - It does not go in the context, because `setInsertMarker` is shared with lane clicks.
  - It does not use `pauseFollowForNavigation`, because of the status clobber.
- **D-29z456:** Ctrl+←/→ reads `getLocatorPosition`, and the "none" text depends on the state.
- **D-29z457:**
  - The seconds ruler pauses Follow too. This is a CZABA inference, appended as part (b) of SABA-Q-TIME-RULER-ROLE, which stays `awaiting_user`.
  - New Saba question: SABA-Q-FOLLOW-EDIT-RESTART.
  - The titles and the at-end wording.

## 4. Pre-check (L23, L29, L50), in `b-round-251/`
- **Browser baseline at HEAD, both viewports** (`probe/follow-baseline.json`):
  - a lower-zone click while playing leaves Follow `on`;
  - a strip click leaves it `paused`;
  - Stop leaves it `paused`.

  This reproduces C-R235-02 and the stop gap. The recipe was run once: pulse → tempo 120 → `=` ×4 → 97.7 px/s.
- **The copy changes on a scratch:** `tsc` rc 0, with 7 collisions, all in grants (`precheck-copy-fails.txt`). The frozen `ArrangementContext.test.ts` is unaffected.
- **IM22 fix sketch:** green. With MU-CAPTION-POSITION and the stopped asserts removed, it goes red at the playing line. HEAD's IM22 under the same changes is green, which proves the vacuity (`precheck-im22.txt`).
- **Focus grep:** 32 hits over grants 1–2, all ruled out of scope.
- **Covering set:** `covering-252.txt`, 130 files.
- **Frozen list:** 1,097 files (`b-round-251-r252-tree-sha256.txt`, rc 0). The 7 protected files each appear once.

## 5. Next
1. **Round 252 PASS and gate** → SABA-B-10a is done. B writes the ARCH-CHECKPOINT-TRANSPORT-POSITIONS request for root (non-blocking).
2. **REGRESSION-ROUND-2026-10-30** at the next planning, if it is on or after 2026-10-30.
3. **SABA-B-10b**, then SABA-B-9, then SABA-B-11c. SABA-B-7 follows when Saba answers.

**Commit readiness:** round 251 was published by gate 251. Round 252 is not a commit boundary until its C PASS.

## 6. Second advisor call (before done): all four points applied to the task
1. **FW7** is now a neighbour pin with no mutant. The lane takes `setInsertMarker` from the context, so a routing mutant would need a frozen prop.
2. **C-FOLLOW-RESUME-252** now clicks the strip about 100 px left of the viewport's right edge, so the follow scroll comes within 2 s. In C-FOLLOW-PAUSE-252, the discriminators are `data-follow-mode` and the status; the scroll sample is a neighbour observation.
3. **§3 gains two rows:**
   - the Follow toggle key (Live Ctrl/Cmd+Shift+F, from root's transcript note; CZABA has the button only), recorded as SABA-Q-FOLLOW-EDIT-RESTART (c);
   - the ruler, strip and Follow visuals, unchanged.
4. **IM24 lives in grant 4.** One more change: one aria-live announcement for the batched status writes is checked if `setStatus` announces per call.
