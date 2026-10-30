# B: round 265 → 266 planning

**Date:** 2026-10-30. **Role:** B. I changed planning artifacts only; no app source was touched. `store/` holds A's uncommitted round-265 diff, unchanged; the frozen list check returns rc 0. **Decisions:** D-29z559…D-29z565.

**Advisor:** available. I consulted it once after orientation, before writing, and I will consult it once more after the artifacts are written. **Project subagent:** `ableton-arrangement-expert` (Split on a selection that crosses a clip edge; §3).

## 1. Inputs read
- **Archive:** `tasks/round-265.md` did not exist. It is now an exact copy of the old `current-task.md` (`cmp` equal); nothing was deleted. The before-copies are in `b-round-265/`: `backlog-before-266.json`, `feature-status-before-266.md`, `b-next-before-266.json` and `questions-11c-before-266.md`.
- **A:** `a-round-265.md`, no STOP:
  - 9 edited files and 2 new ones;
  - 166/166 targeted tests;
  - M1–M5 red;
  - code-reviewer 8/10, with 4 Architecture notes.
- **C:** `c-round-265.md` and `c-round-265.json` = **FAIL**:
  - 20/20 §4 rows PASS at both viewports;
  - `browserVerified` and `realVerified` true;
  - Medium **C-R265-01**: a regression caused by the round, in a §3 neighbour;
  - Low **C-R265-02**: copy.
- **Gate:** `gates/gate-round-265.json` = `skipped` ("C taskStatus FAIL"). **The baseline stays HEAD `2ea196e`** (gate 264's published commit), plus A's uncommitted diff.
- **Env:** `env-status.json` store 200 (round 265). The regression is next due on or after 2026-11-02, so it is not due now. The next RETRO is at round 275.
- **Saba:** no new answer file.

## 2. Backlog updates (only from C's evidence)
- **Round 265** → `C FAIL` (D-29z559). Nothing is marked done. SABA-B-11c stage 1 → **ბაგია** in `feature-status.md`.
  - Under V2, the 20 PASS rows are browser-verified. The stage is still not done, because a Medium regression from the same round is open.
- **`open_findings`:**
  - C-R265-01 (Medium) and C-R265-02 (Low) are added. Both are scheduled for round 266.
  - B-R264-RANGE-HOW-COPY has the same root cause as C-R265-02. It is scheduled with it (L7).
- **`deferred_low_polish`** (+3, now 440): A's reviewer Lows A-R265-REVIEW-CLIP-ZERO-RANGE, -SCROLL-DRIFT and -OVERLAP-OVERLAY. All three behave the same way at HEAD.
- **`architecture_signals`:** A-R265-ARCH-RANGE-DRAG-DUP, A-R265-ARCH-TIMELINE-PROP and B-R265-DETAIL-RANGE-CLAMP. They are recorded as signals and not scheduled.
- **`regression_rounds`:** a new planned entry, REGRESSION-ROUND-2026-11-02, with the scope addition REG-11C-HIDDEN-GRID-BG.
- **Rounds:** round 266 → dispatched.

## 3. Why round 266 is a fix-up, and the split rule (D-29z560)
- **Bug gate.** C-R265-01 is a Medium regression caused by the round. Under the pre-fixed outcome, it is fixed with ≤ 3 related bugs. A redo is not needed: every §4 row passed.
- **Reference.**
  - Manual 12 §6.12 (fetched by B) covers only a selection inside one clip. §42.16 names the command "Split Clip at Selection".
  - `ableton-arrangement-expert` labelled all four edge cases **UNKNOWN**: past the edge, over a gap with two clips, a whole clip covered, and all tracks. It found that §6.14.2 confirms splitting across tracks only for linked tracks. Its guesses match D3.
  - B's WebSearch found only forum posts. They are recorded as a community report, not as a source.
- **D3 is the smallest honest rule.**
  - It restores HEAD's result for C's gesture.
  - It agrees with what the model already does for ranges that cross clips (`deleteRangeKeepingGap`, `deleteTime`, and the multi-clip split at the marker).
  - It goes to Saba as **SABA-Q-11C-SPLIT-SPAN**, `user-review/questions-11c.md` §4 (L44). That section also asks the separate question of whether Split should work on an all-tracks range.
- **C-R265-02** is bundled because round 266 already owns `strings.ts` for the new status, and the fix is two literals (D-29z561). The old text "or on the ruler" was untrue at HEAD: no ruler code writes a time range (K7).

## 4. B's pre-checks (L23, L29, L50)
- **Scratch sketch** (`tmp/b266-scratch`, a copy of the working tree **including A's round-265 diff**; diff in `b-round-265/sketch.diff`):
  - tsc shows only the expected `model.test.ts` l.201 `middleId` error;
  - all 168 test files in `app/lib/arrangement` + `app/components` give **4 failed | 2455 passed**: the `model.test.ts` split row and `strings.test.ts` ST1, ST8 and ST10. All four are granted.
  - `perf/**` and `e2e/**` have 0 hits for every changed token.
- **Browser** (B's own scripts; both viewports, 0 page errors, identical per viewport):
  - `probe-split.mjs` on the current tree (`probe-split-before.json`) reproduces C-R265-01.
  - The same script on the sketch, served from the scratch copy on :5175 (`probe-split-sketch.json`), gives:
    - past start → `["10.000","12.500"]` + `splitRangeDone`;
    - range 1–15 → `["10.000","15.000"]`;
    - gap + 2 clips → 4 clips + "Clips split at the edges of the time selection; the 2 parts inside it are selected.", and Delete then removes exactly those 2;
    - empty range or full cover → the unchanged refusal;
    - video-lane background drag → 1 overlay in the `video` row;
    - copy → the new texts; the export reason is 310 × 16 px, 1 line.
  - `probe-neighbours.mjs`: the marker split, the all-tracks refusal and the Split-button focus all match their baseline.
  - The scratch server was stopped afterwards; :5173 is still 200.
- **L50:** 0 hits in the 3 granted sources. The callers of `splitSelection` are frozen. The focus target equals the baseline (row FOCUS-SPLIT).
- **Freeze:** 1,118 entries, hashed on the working tree. A's 9 round-265 files are frozen at the content C tested (K2: `git diff` of the 3 sources is byte-identical to `c-round-265/source.diff`). That is why C's 20 rows can be carried.

## 5. Rulings on A's and C's notes (L10, D-29z562)
1. A's "null for any equal ends" deviation is **accepted** (BT9 + M5; no HEAD regression).
2. The clip-path {0, 0} range, the scroll drift and the overlapping overlays go to `deferred_low_polish`.
3. Hidden-grid snap on the background path: no row now (`StudioWorkspace.tsx` is frozen). It becomes REGRESSION scope addition REG-11C-HIDDEN-GRID-BG.
4. `rangeInvalid` (the details-panel clamp) becomes a signal and a Saba question, not a bug.
5. The video-lane background drag gets row VIDEO-BG.
6. Doc 198 l.4 → "C round 266 PASS" (L28).

## 6. Architecture (D-29z565)
- A's 4 notes are recorded as signals only.
- SABA-B-11c stage 1 is a feature boundary, and `StudioWorkspace.tsx` has accumulated risk. So I wrote a **non-blocking** addendum for root, `b-round-265-checkpoint-addendum.md` (question 9: keep vs extract `resolveTimeRangeDrag`), to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS. Independent core work does not wait for it.
- **RETRO-275 candidate RC-R265-AT-RISK-NO-ROW:** a command named "at risk" in §3 had no browser row and was not run on the sketch at planning. Proposed L23 clause: run each §3 at-risk command once in the browser on the sketch.

## 7. Next and remaining
- **Round 266** = the fix-up (`current-task.md`).
- **Then:** REGRESSION if planned on or after 2026-11-02; otherwise GATE264-S2, then SYS-6.
- **SABA-B-11c stage 2** waits for Saba (R49-T).
- **Not COMPLETE:** see `b-next.json` `remaining`.
- **Not BLOCKED:** round 266 needs no credentials or approval. D3 is implemented as a default and asked as a question.
- **Commit readiness:** none this round. Round 265's work is publishable only after round 266's C PASS and the gate.

## 8. Final advisor check (applied)
The second advisor call found four gaps, all fixed in `current-task.md`:
1. **The carry relied on two partly granted files.** `strings.ts` and `ArrangementContext.tsx` feed the carried rows. They now have a HUNK-SCOPE row, with line windows tied to K4/K5/K6.
2. **Two untracked files had no "before" copy.** The round-265 test file and doc 198 are saved to `b-round-265/*.r265.txt` (K16 hashes). K15 now reads the saved copy, and REWRITES diffs the UI file as add-only.
3. **BS2 was self-contradictory.** It is reworded to start inside clip A, cross the gap and end inside clip B.
4. **The CLAIMS row and the probe scripts.** The row now covers K1–K16 and says how K13/K14 read before and after A's fix. C copies the probe scripts and changes their `DIR` before running them.

Afterwards the store frozen check is still rc 0, and the L29 grep leaves only rule references.
