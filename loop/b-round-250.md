# B round 250 → 251 planning

Written 2026-10-29 by B. **Decision: CONTINUE.** The next task is round 251, the SABA-B-10a stage 2a fix-up (`current-task.md`, D-29z444…D-29z451).

**Advisor:** available and consulted twice: after orientation, before writing, and before declaring done. Every point of the first call was followed (see `backlog.json` `advisor_used_by_B`). No project subagent was consulted. This is a bug fix-up whose reference question was answered by the Live 12 manual through WebFetch (§4).

## 1. Evidence read
- **`current-task.md`:** round 250, archived unchanged as `tasks/round-250.md` (`cmp` identical).
- **`a-round-250.md`:** A reported a STOP for the export-progress flake, the mutant results and the reviewer's 8/10 note with its Architecture note.
- **`c-round-250.md` / `.json`:** **FAIL**. `browserVerified` and `realVerified` are true. 19 rows passed, and the purchased origin is BLOCKED (backend).
  - **C-R250-01** (Medium, a regression of round 250): the library line above Add names the playhead.
  - **A-R250-REVIEW-PASTE-SPLIT-PLAYING** (Medium, test strength).
  - Two Lows.
- **`gates/gate-round-250.json`:** `skipped`, "C taskStatus FAIL". It is **not published**, so the next baseline stays HEAD `dcb7eb1` plus the 13 unpublished round-250 files.
- **`regression-last.json`:** 2026-10-27, round 199, so REGRESSION is due at the first planning on or after 2026-10-30. Today is 2026-10-29, so it is not due yet.

## 2. Backlog changes, from independent C evidence only
- **Nothing is marked done.** Round 250 failed and is unpublished.
  - Its passed rows stay as evidence. The files they ran on are frozen byte for byte in round 251.
  - Its six target findings carry the note "closes at the round-251 C PASS and gate" (D-29z444).
- **New open findings:**
  - C-R250-01 and A-R250-REVIEW-PASTE-SPLIT-PLAYING (Medium);
  - A-R250-REVIEW-IM18-IM20-ASSERTS (Low, fixed in round 251);
  - A-R250-REVIEW-SHEET-MARKER-COPY (Low, scheduled in SABA-B-10b);
  - B-R251-PASTEND-AT-END (info, stage 2b);
  - EXPORT-PROGRESS-LOAD-FLAKE-250 (watch).
- **`deferred_low_polish`:** + A-R250-REVIEW-STALE-PASTE-TITLE (410 entries).
- **REGRESSION-ROUND-2026-10-30 `scope_additions`:** + C-CAPTION-251.
- **Architecture signal GATE249-ARCH-TRANSPORT-POSITIONS:** + addendum 1, A's round-250 note proposing a pure position-source resolver. It is not scheduled, and the checkpoint is still requested at the 10a/10b boundary.
- **Queue:** the SABA-B-10a status and stage plan are updated, and 10b gains the sheet `marker` copy. `rounds` gains 250 (FAIL) and 251 (dispatched).
- **`feature-status.md`:**
  - round 250 → **ბაგია**;
  - round 251 → **მუშავდება**;
  - the queue row is updated.
- **`lessons.md`:** L29 gains the changed-meaning clause (D-29z450). The file stays at 57 lines.

## 3. Rulings
- **D-29z445: the line shows** `Active track: <lane> · insert marker <time>`.
  - It uses a direct `textContent` write from the insert-marker store and needs no render.
  - Rejected: dropping the time, and showing the playhead while playing.
- **D-29z447: A's STOP is a load flake.** The evidence is listed in the task. It becomes a watch item, and gate 251's `verify.log` decides it.
- **D-29z449: the Lows are triaged** as in §2.
- **The baseline is the dirty working tree** (the round-203 precedent):
  - the frozen list (1,102 files) is hashed from the working tree;
  - C's control is a tar copy with the granted files restored, not `git archive`.

## 4. Pre-check (L23), in `b-round-250/`
- **The diff and the scratch:** `precheck-251.diff` (sha256 `77b07ca8…0fef`, 7 files) applies to the working tree and reproduces the scratch byte for byte. The expected final hashes are in `expected-final-sha256.txt`.
- **Static checks and tests:**
  - `tsc` rc 0, and Biome is clean;
  - the full suite on the scratch: 215 files, **3,132/3,132**;
  - the covering set is 123 files.
- **Mutants:** 10 runs, all red as planned. They include C's C-MU-PASTE-SPLIT-LOCATOR equivalent, which now turns IM15 and IM17 red.
- **Chromium, both viewports, round-250 tree vs fix:**
  - the line now reads `insert marker 00:03.000` stopped and while playing, and Add lands at 3.000;
  - the widest state (the Video lane note) is 2 lines in its 32 px box at the 288 px library width.
  - One invalid cold-load attempt is kept.
- **The copy sweep over `app/**`** (`copy-sweep-251.txt`) finds no other stale position word outside the stage-2b items.
- **Reference:** the Live 12 manual 4.10 confirms that Enter or double-click loads a sample onto the selected track. It says nothing about the time position, and Live has no readout ("no reference found").

## 5. Next
1. **Round 251 PASS and gate** → stage 2a is done, and rounds 250–251 are published.
2. **REGRESSION-ROUND-2026-10-30** at the next planning, which is almost certainly on 2026-10-30.
3. **SABA-B-10a stage 2b.**
4. **10b, 9 and 11c.** SABA-B-7 follows when Saba answers.

This is not a commit boundary: round 250 is unpublished until round 251 passes. Root's gate 251 decides.
