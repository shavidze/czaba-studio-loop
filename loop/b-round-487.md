# B round 487 → 488 planning (2026-11-13)

**Decision: CONTINUE.** Round 488 = fix-up of B-R486-PROFILE-NAME-KEYBOARD for **C-R487-01** (Medium focus steal). Task: `current-task.md`; archive of round 487: `tasks/round-487.md` (byte-equal, `cmp`; B copy `b-round-487/current-task-before-488.md`).

- **Advisor:** available and consulted twice (before finalising and at the end). It caught a stale mutant regex, task text still describing v1, the order of the remaining steps, and the overlay check. All of these were applied (§4).
- **Consults:** `tech-lead` ×2. v1: APPROVE WITH CHANGES (Safari Medium). v2: APPROVE. See `b-round-487/sketch-review.md`.
- **Resume note:** attempt 1 ended on an API 403. Its partial work was kept and continued: the archive, the backups, the v1 sketch, the probes and the mutants (`b-round-487/checkpoint.md`).

## 1. Input evidence
- **C round 487 (`c-round-487.json`):** taskStatus FAIL, `browserVerified` true, `realVerified` true.
  - All PN browser rows pass.
  - **C-R487-01** (= A-R487-REVIEW-FOCUS-STEAL) was reproduced in 4 of 4 runs (`c-round-487/focus-steal-replay.json`).
  - OWN-BACKEND is BLOCKED (cloud).
- **Gate 487:** `skipped` (C FAIL). Nothing was published, so the baseline stays HEAD `bb82154` plus A's uncommitted round-487 tree (sha in `b-round-487/a-tree-start.sha256`, K5 `equal` at planning).
- **A round 487:** STOP on the unruled Medium, which was correct per §2. A also reported a §1/§2 clause conflict, resolved in the new task (§2 is the only STOP rule; A never edits a sketch line).

## 2. Backlog changes (only from evidenced results)
- **D-29z1738:**
  - B-R486-PROFILE-NAME-KEYBOARD stays **not done** (status "ბაგია").
  - C-R487-01 is opened as Medium and dispatched in round 488.
  - Reviewer Lows: L1 (no unit test for the ✓ click) and L2 (an unawaited save) are closed by the sketch, pending C. L3 (PN8 weak) and L4 (no unmount test) go to `deferred_low_polish`.
  - The Architecture note becomes signal **SIG-R487-PROFILE-NAME-EDITOR-EXTRACT** (signal only, not scheduled; a frontend-architect checkpoint request goes to root if a third round adds editor state).
- **D-29z1739:** new findings from the sketch review and B's probes:
  - **B-R488-PASSWORD-MODAL-DIALOG**, Medium, pre-existing: no dialog role, no initial focus, and Esc does not close it (`probe/overlays-sketch.json`). It goes to round 491.
  - **B-R488-SAFARI-MENU-SETTLE-FOCUS**, Low, deferred.
  - **A-R488-SKETCH-L2-CLOSED-DIALOG-TEST**, Low, deferred.
  - The real WebKit and Firefox-mac halves of the new guard are added to SAFARI-CHECKS and FIREFOX-CHECKS (non-blocking).
- **D-29z1740:** order is 488 fix-up, then 489 SABA-B-17-ENTRANCE-3-4S, then 490 B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, then 491 B-R488-PASSWORD-MODAL-DIALOG, then DPG-BUTTON-CLEANUP. A REGRESSION round comes first from 2026-11-16 (`regression-last.json`: 2026-11-13, round 484; not due now, so it is unchanged).
- `feature-status.md` is updated (header, the round 487/488 paragraph, the rows for B-R486, C-R487-01, B-R488-PASSWORD-MODAL-DIALOG, SABA-B-17 → 489 and narrow overflow → 490).
- Nothing is marked done this round. No item with `browserVerified=false` was promoted.

## 3. The fix (sketch v3, sha `9062855b…`)
- **Rule:** focus moves on settle only while the editor still owns it:
  - the password dialog is closed (`passwordModalOpenRef`, set synchronously by `openPasswordModal`/`closePasswordModal`);
  - and `activeElement` is null, `<body>`, or inside the editor row.
- The same guard covers the API-failure focus. `void handleNameSave()` is added.
- **Tests:** PN10–PN10h (8 new; 18 in the file).
- **Evidence on the B scratch** (`/tmp/b488-scratch`, port 5188, its own Vite cache):
  - covering: 5 files, 82 tests;
  - tsc: rc 0;
  - Biome: 4 pre-existing warnings;
  - 24 mutants, all red (`b-round-487/mutants/mutants-summary.txt`). M00, the round-487 file, is red on PN10/b/e/f/g; M000, the v1 file, is red on PN10f/g;
  - full suite on v3: 293 files, 4,281 tests, rc 0 (`b-round-487/precheck-full-488.log`). v2 gave the same counts (`precheck-full-488-v2.log`).
- **Browser (Chromium), 1440 and 1280:**
  - On the round-487 tree, focus is stolen in `click-password`, `click-password-nofocus` and `tab-away`.
  - On v2, focus stays where the user moved it. `stay-*` and `orders-tab` are unchanged (`probe/r487tree-v2-inflight.json` vs `probe/sketch-v2-inflight.json`).
  - `click-password-nofocus` is a Chromium emulation of the Safari mouse model, not a Safari check.

## 4. Advisor follow-ups applied
- The mutant regex was widened to `PN\d+[a-z]?`. The bad-regex v2 run is kept in `mutants-v2-badregex/` and is not evidence.
- The task was rewritten for v3:
  - the forbidden list now allows the call-site handlers;
  - C-SCOPE compares against the sketch output;
  - counts are 82 tests and 24 mutants;
  - v2 probes and the IF-PASSWORD-NOFOCUS row are added, with BODY recorded but not expected (L47).
- B probed the other header overlays: the ⌘K palette is safe, and the Safari model on the User menu is a Low.
- The claims outputs were saved after the task was final.
- Second advisor call: B re-ran the round-487 PN probes and the C replay on v3 (`probe/v3/`). PN values are 0 diffs from C round 487; the replay shows no steal in 4/4 runs. The scratch `app/` equals the store's except the 2 sketch files (`probe/v3/scratch-app-diff.txt`). IF-OVERLAYS now asserts only ⌘K.

## 5. Scope status (whole request)
**Not COMPLETE.** Many scoped items remain open in `backlog.json`, among them:
- DPG-FIX P1/P2;
- STORE-REDESIGN 2c+, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED;
- the phase-2 queue entries;
- every deferred Low;
- 19 Critical/High/Medium open findings in the active view.

**Not BLOCKED:** the next task needs no external input.

Ready for commit: no; round 487 failed, and root publishes only after C PASS on round 488.
