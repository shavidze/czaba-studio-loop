# B round 249 → 250 planning (2026-10-29)

**Decision: CONTINUE.** Round 250 is **SABA-B-10a stage 2a**: four edit commands now use the Insert Marker, and the past-end refusal names its start point. The same code also gets three fixes:
- **Edit commands.** Paste, library add and Ctrl+E without a time selection act at the Insert Marker, both stopped and while playing. M uses the selection start; without one, it uses the Insert Marker when stopped and the playback position while playing.
- **Past-end refusal.** The message now names the start point that was refused.
- **Fixes:**
  - C's two Medium test-strength findings (IM3, IM13);
  - B-R250-GESTURE-KEYS (gate 249 S6, reproduced in Chromium);
  - a pin for GATE249-S1 (IM21).

Decisions are D-29z435…D-29z443. The baseline is HEAD `dcb7eb1` (gate 249 `commit`), clean. The round grants 13 files: 12 from B's applied diff plus doc 191. 1,097 files are frozen.

**Advisor:** available. It was consulted after orientation and before any writing. It asked for these steps, and all were done:
- the housekeeping;
- splitting stage 2 into 2a and 2b;
- the command × state table;
- the past-end wording per path, with a test grep;
- the copy sweep, without renaming the ruler, handle or zoom titles;
- fixing the two Mediums with C's and A's own mutants as red proofs;
- fixing GATE249-S6 now;
- a browser divergence recipe, because C's paste probe had been inconclusive;
- checking paste against the manual (no reference found);
- verifying the backlog ids before citing them.

A final advisor check follows this report.

**Consults:** none new. The Ableton facts come from the local manual captures (`b-round-71/ableton-*-20261021.txt`: 6.4, 6.9, 6.12, 42.5), `transport-grid-review.md` §10a and `reference/youtube/SABA-B-9-10-11-transcripts.md`. The transcript's CHECK for `tBfi` 0:57 (locators set during playback are quantized) is resolved against manual 6.4 and becomes Saba question (d).

## 1. Inputs read
- **Gate 249:** `published`, commit `dcb7eb1` on both remotes. Review 8.5/10, no Critical issues. 9 suggestions plus an Architecture note. `verify.log`: 215 files and 3,123 tests passed; the build passed.
- **C round 249:** PASS. `browserVerified` and `realVerified` are true, and 26 rows passed. The purchased origin is BLOCKED (backend unavailable). There are two Medium test-strength findings and four info notes.
- **A round 249:** no STOP. A forwarded three reviewer Mediums: M1 does not reproduce in Chromium, and M2 and M3 are C's two Mediums. A also forwarded Lows and an Architecture note.
- **Regression:** `regression-last.json` is round 199 (2026-10-27), so the next one is due on or after 2026-10-30. Today is 2026-10-29 (`date -u`), so it is **not due**. RETRO is next due at round 260.
- **User-review folder:** no new decision file. AGREE-SABA-B-7 is still unanswered.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are the same old snapshots. They hold no new finding for this round.
- **Archive:**
  - `tasks/round-249.md` is a byte copy of the round-249 `current-task.md`. `cmp` showed it identical before the overwrite, and it did not exist before this planning.
  - Before-copies are in `b-round-249/*-before-250.*`.

## 2. Backlog changes from independent evidence (D-29z435…D-29z441)
- **Closed by C round 249 PASS and gate 249:** SABA-B-10a stage 1.
- **Scheduled in round 250:**
  - A-R249-REVIEW-IM3-CMD and A-R249-REVIEW-IM13-LEAK (Medium);
  - B-R250-GESTURE-KEYS (Medium, new, B's own reproduction);
  - GATE249-S1 (as IM21);
  - C-EDIT-DIVERGE-249 and C-R249-INFO-PASTEND-WORDING (info).
- **To `deferred_low_polish` (406 → 409):** GATE249-S3, A-R249-REVIEW-IM14-VACUOUS and A-R249-REVIEW-SETINSERT-SCRUBREF. Round 250 does not own the Ruler; the other two are below the cheap-fix bar.
- **Info / scope:**
  - GATE249-S2 = SABA-Q-10A-CTRL-ARROW-RANGE;
  - S4 and S7 go to SABA-B-10b;
  - S5 is info;
  - S8 = B-R249-PAUSE-LABEL;
  - S9 = the Mac TLM.
- **Tech Lead list:** TLM-R249-KEYUP-ORDER (Firefox and Safari) is added.
- **Scheduled in stage 2b, not deferred:**
  - B-R250-NAV-ORIGIN: Ctrl+←/→ steps from the playhead while stopped;
  - B-R250-PLAYHEAD-TITLES: the ruler and range titles say "click = playhead".
- **Architecture:** the gate-249 note and A's note become the signal GATE249-ARCH-TRANSPORT-POSITIONS. It is not scheduled. ARCH-CHECKPOINT-TRANSPORT-POSITIONS will be requested from root at the 10a/10b boundary. The two older checkpoint requests are still pending, and none of them blocks.
- **Saba questions:** SABA-Q-10A-DEVIATIONS gains (d), M while playing is not quantized (Live 6.4), and (e), the ABL-R-6 add point now follows the insert marker (a reconciliation of two Saba decisions, shown to him once).
- **Regression scope:** C-EDIT-MARKER-250 is added to REGRESSION-ROUND-2026-10-30. It is conditional on round 250 passing.

## 3. Round 250 (D-29z436…D-29z439, D-29z442)
- **Measured at HEAD `dcb7eb1` in Chromium, at both viewports (`b-round-249/edit-head*.json`).** After play from 2 and Stop at 3.48, each command acts at the stop point, not the marker:
  - Paste lands at 3.483.
  - Ctrl+E splits at 6.49, both stopped and playing.
  - M adds at 3.483.
  - Enter-add lands at 4.49 when stopped and 4.65 while playing.
  - The past-end refusal says "Playhead" when the refused start was the marker.
  - During a range drag, Ctrl+Shift+Space or Home moves the marker and the playhead to 0 and loses the selection.
- **The fix in the scratch (`edit-proto*.json`):** every command lands at the marker (2.000 / 5.000 / 3.000), and M while playing stays at the live position. The refusal names the start point. The selection survives the keys. Statuses and sheet rows keep their box sizes (`box-*.json`).
- **Pre-check:**
  - `precheck-scratch.diff`: 12 files, sha256 `928c4950…2811`;
  - tsc rc 0; Biome clean;
  - the v1 collision scan gave 3,113/3,123, and the 10 red rows were text or signature collisions only;
  - **the final full suite on the scratch: 215 files, 3,130/3,130**;
  - covering set: 123 files;
  - 18 mutant runs, each with the expected red rows;
  - the L50 grep gives 0 hits.
- **A measured gap:** no existing test pinned paste, add, split or M after a Stop, so no behaviour row went red in v1. IM15–IM18 add that coverage.
- **A mutant-design note (RETRO 260 candidate):** a mutant of a helper cannot fail rows that compute their expected value with the same helper (MU-PASTEND-ONE-SUBJECT). Caller-side mutants replaced it. Both C Mediums share a related cause: one branch with OR'd modifiers needs one red proof per arm, with the positions separated first. Also recorded as a RETRO 260 candidate. `lessons.md` is unchanged, because this is not a Saba-found issue.
- **Invalid attempts, kept:**
  - the cold `:5174` load timed out once;
  - one empty-lane drag made no selection (re-run on the clip).
- **Why no "Why we missed it" section:** this round fixes no Saba-reported issue.

## 4. Stage split (D-29z436)
- **2a (round 250):** commands that edit at a position.
- **2b:** navigation:
  - C-R235-02 Follow (Live 6.2);
  - B-R250-NAV-ORIGIN, with the `noneAfter`/`noneBefore` copy in four test files;
  - B-R250-PLAYHEAD-TITLES;
  - the seconds-ruler role (SABA-Q-TIME-RULER-ROLE).

  Doc 191 is `Completed` at the 2b PASS.
- **Then:**
  - SABA-B-10b: the visible marker; it also retires the hidden node and adds the sheet rows;
  - SABA-B-9: the Stop button and its label;
  - SABA-B-11c.

Nothing is dropped, and nothing is deferred without authority.

## 5. Next (D-29z443)
1. Round 251 = **REGRESSION** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry, including C-INSERT-MARKER-249 and C-EDIT-MARKER-250.
2. If that planning is still on 2026-10-29, the next round is SABA-B-10a stage 2b. If round 250 fails, a fix-up comes first.
3. Then 10b, 9 and 11c. SABA-B-7 runs when Saba answers. Then SYS-5, PERF b-ii and the rest of the queue, unchanged.

- **Commit readiness for root:** round 250 changes 6 source files and 6 test files, and updates doc 191. Publish only after C PASS and the gate. Round 249 is already published (`dcb7eb1`). The loop-state commit carries this planning.

## 6. Completion check
- **Not COMPLETE.** The following remain:
  - SABA-B-10a stage 2a (dispatched) and 2b;
  - 10b, 9 and 11c;
  - SABA-B-7;
  - SYS and PERF;
  - STORE-2b…5;
  - REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - phase 2.

  All 409 deferred Lows must also be fixed and verified by C before final acceptance.
- **Not BLOCKED.** Runnable work exists. Only SABA-B-7 and PHASE2-VIDEO-SCORING wait for Saba.

## 7. Self-check
- **Backlog edits** come only from the C-249 and gate-249 evidence, plus B's own probe and mutant files.
- **Protected files** are untouched and frozen, each listed once. `/studio-lab` stays demo-only (the Auth row).
- **The store tree was not modified:**
  - every experiment ran in `/tmp/b250-*` and on `:5174`, which is now stopped;
  - `git status` is empty, and the frozen list gives rc 0;
  - `:5173` still answers 200.
- **Speed rule:** no task row asks A or C for the full suite; those are gate rows. B's own full run on the scratch is planning evidence, not an acceptance row.
- **Real behaviour:** C checks every command in the browser at both viewports, with HEAD control values, plus the export hash and the auth guard. None of these is a simulation.
