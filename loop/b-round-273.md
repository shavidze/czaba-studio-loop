# B: round 273 → 274 planning (2026-10-30, D-29z601…D-29z604)

**Decision: CONTINUE.** Round 274 is **SYS-6 STATUS-LIFETIME, stage 3 of 3 (final)**.
- **Task:** `current-task.md`.
- **Grants:** `b-round-273-r274-grants.txt`.
- **Baseline:** HEAD `52b17e4`. `gates/gate-round-273.json` is `published` and its commit is `52b17e4`; the gate's `head` field `b288be7` is the pre-commit HEAD. The tree is clean.

## 1. Inputs read
- **Context:** `context/active-summary.md` (head only), `lessons.md` (59 lines) and `b-round-272.md`. Specific ids were looked up in `backlog.json` with Python and in `feature-status.md` with grep.
- **Round 273:** `current-task.md`, archived as **`tasks/round-273.md`**. The archive did not exist; it was copied with no-clobber and `cmp`-checked before the new task was written.
- **Reports:** `a-round-273.md`, `c-round-273.md` and `c-round-273.json`.
- **Gate:** `gates/gate-round-273.json` and `gates/round-273/review.md` (8.5/10, COMMIT OK, 5 suggestions plus an Architecture note).
- **Source at `52b17e4`:** `nudgeSelectedClip`, `applyEdit`, `restoreHistory`/`undo`, Rule W, the classifier, `reduceArrangementStatus`, the live region, the Detail panel commit paths, the drag-release status texts and the arrow-key branch in `StudioWorkspace`.
- **Regression date:** `regression-last.json` says 2026-10-30 (round 258). The next regression is due on or after 2026-11-02, so it is **not due**.
- **User-review folder:** no new decision files since round 272.
- **Advisor:** available, consulted before the contract and at the final review. The final review led to three corrections: measured B-AUDIO bounds, LT rows rebuilt on the real fixture (one clip `p1` at 0; the group rows moved to SK14/SK15), and the measured cause of the hidden Start field at 1280.
- **Project subagents:** not consulted. This is a bug round with no new feature, so neither reference-first nor `product-designer` applies.

## 2. Round 273 result (D-29z601)
- **C PASS:** 18 rows at both viewports, `browserVerified` and `realVerified` true. One Low planning finding, C-R273-01.
- **Gate 273:** published `52b17e4` on both remotes.
- **Closed** on C's independent browser evidence (L7):
  - GATE272-S1-LATE-READ (Medium), B-R272-STOPPED-TEXT-WHILE-PLAYING, C-R272-01, GATE272-S3-SELECTION-PASTEND-STALE, GATE272-S2-RENDER-REF and INFO-C272-K11.
  - Removed from `deferred_low_polish`: the four of those that were there.
- **SYS-6 stage 2 is done.** Every browser row ran, so no browser half is pending.

## 3. Gate-273 and C/A notes (D-29z602)
**Gate findings**
| Finding | Ruling |
|---|---|
| S1 (a no-op `setRange` re-renders the provider) | **GATE273-S1-NOOP-RANGE-RERENDER**, a STUDIO-PERFORMANCE candidate. No behaviour row can turn it red (text and sequence do not change), so it waits for the PERF re-render harness |
| S2 (two announcements per play/stop cycle) | ruled deliberate: it is the round-273 contract (the state after the action). Info |
| S3 (state the late-read contract in doc 204) | closed: C's DOC-204 row verified the sentence |
| S4 + A's Info (stage-1 describe titles) | dispatched in 274 as title renames only |
| Architecture note | **GATE273-ARCH-STATUS-SPLIT**, added to the open checkpoint (§5) |

**C and A notes**
- **C-R273-01** (an untagged code fact in task l.86, true at HEAD): closed as planning-only. The round-274 task ran the L29 sweep before dispatch and tags every hit. It is the second instance for retro candidate **RC-R272-UNPROBED-PREMISE**.
- **A-R273-TOPLAYHEAD-REWRITE:** the rewritten text is true, so it is ruled expected under round-273 §3.8 and recorded in `deferred_low_polish`.
- **A-R273-REPEAT-PASTEND:** probed by B (`repeatPastEnd`: 4 mutations over 3 steps, all texts true). Superseded by round 274, where the nudge writes its own text. It closes on C 274 (B-NUDGE-PASTEND).

**B's premise probes at `52b17e4`** (`b-round-273/probe-r274-head.json`, both viewports, 0 page errors):
- **GATE270-S2-REPEAT-ANNOUNCE: the premise is false.** Enter twice in Detail Start or in Clip Gain gives 2 mutations per Enter, because a string write always bumps the sequence and the span is keyed on it. SK8 and SK12 already pin this. No code change; it closes on C 274's B-ENTER-TWICE row.
- **B-R273-PLAYING-TEXT-WITH-RANGE: real.** While playing with a range, Ctrl+← says "Stop, then Space plays from here", but Space then plays from the selection start (2.56). It is now a **Low in `deferred_low_polish`**. The fix needs two templates and two classifier kinds, which is beyond one round's bug budget; it fits the checkpoint outcome.
- **A-R272-REVIEW-SEL-AT-END-WORDING** stays deferred: it is the same template family.

**`deferred_low_polish`:** 464 − 4 closed + 2 added (B-R273-PLAYING-TEXT-WITH-RANGE, A-R273-TOPLAYHEAD-REWRITE) = **462**.

## 4. Round 274 plan (D-29z603)
**One owner function, one class:** an edit that writes no result text leaves the previous text standing, now false. B reproduced C-R271-01 at both viewports:
- a single nudge left `“…” added … at 00:00.000.` with the clip at 1.000 (0 mutations);
- a group nudge left the clip-added text the same way.

**The contract:**
- **Single:** `Nudge clip: start <t>.`, a new `studioMoveStrings.nudged`. The start is read from the committed arrangement.
- **Group:** the existing `groupMovedRight` / `groupMovedLeft`, with the `historyMoveClips(n)` label of the same Undo entry.
- **Where and how:** written after `applyEdit` and `setRange(null)`. Key-repeat writes use the function form:
  - single steps change the text, so each step is announced;
  - identical group texts are not re-announced during a hold.
- **L51 clobber:** the edit result wins over every earlier text.
- **Lifetime:** the next nudge, a drag, Undo or Redo each write their own text. Space, Stop and marker moves keep it; it is still true then.

**Rejected:** clearing the line, silent repeats, re-deriving the transport text, and a new group wording.

**B's pre-check (L23)**, all files in `b-round-273/`:
- **Sketch:** `sketch.diff`, on a `git archive 52b17e4` scratch with a private per-entry `node_modules`. `tsc` rc 0, and Biome is clean.
- **Full vitest: 3278/3281.** The 3 failures are exactly the granted rows: ST12, SK7 l.606 and NZ3 l.1031. Each is a stronger exact-list replacement; the refusal-once filter stays.
- **Refined sketch** (key-repeat function form): the 8 related files gave 185/187, the same 2.
- **Browser:** HEAD on :5173 against the sketch on :5186, both viewports, 0 errors. The sketch gives the §1 "after" texts.
- **Cleanup:** the scratch server has been stopped, and `store/` is untouched.

**Rows and checks:**
- **New test rows:** LT20–LT21 (the file's fixture clip `p1` at 0) and SK13–SK15 (the group rows need two clips, so they live in `status-announcement-ui`).
- **7 mutants.**
- **C browser rows:** B-NUDGE-SINGLE/HELD/GROUP/UNDO/BLOCKED/PASTEND, B-AUDIO, B-ENTER-TWICE, LT-WIDTH, SCREEN-BUDGET and G274-AUTH.
- **B-AUDIO bounds are measured at HEAD** (`nudgeAudio`, `baselineAudio`, both viewports): with the clip nudged to 1.000, RMS is 0 at every sample below 0.99 s, then 0.0857 at 1.08 s; without the nudge, 0.097 at 0.07 s. The row uses < 0.0005 before 0.85 s and > 0.05 between 1.05 and 2.10 s.
- **The 1280 Detail Start field:** the Clip details panel is collapsed by default at 1280×720 (36 px, `Expand`), so C expands it first (`detail1280`).
- **Docs:** 203 and 204 l.4 plus the new 205, all `Completed (C round 274 PASS)` (L28). `grep 'In Progress (stage'` then leaves only doc 176, which belongs to the open STUDIO-PERFORMANCE work.

**Not in 274:**
- INFO-C248-STALE-NOTE: carried; it waits for SABA-Q-11B-HIDDEN-SNAP (d).
- B-R273-PLAYING-TEXT-WITH-RANGE: deferred Low.
- GATE273-S1: PERF candidate.
- The Rule S move and the typed tag: wait for the checkpoint.

## 5. Order, checkpoint and lessons (D-29z604)
**Order:**
1. Round 274: SYS-6 stage 3; SYS-6 closes on its PASS.
2. **RETRO 275**: 15 rounds after RETRO 260. Consults `tech-lead`, `qa-engineer` and `consequence-tester`. The whole-screen review uses `design-philosopher`, `first-visit-host` and `product-designer`.
3. SYS-5.
4. STUDIO-PERFORMANCE.

REGRESSION goes first when it is due (on or after 2026-11-02); B re-checks this at every planning.

**Checkpoint:**
- `b-round-272-checkpoint-request.md` is still unanswered, and its deadline was SYS-6 close.
- `b-round-273-checkpoint-addendum.md` adds GATE273-ARCH-STATUS-SPLIT, with B-R273-PLAYING-TEXT-WITH-RANGE as cost evidence.
- It is non-blocking. A Rule S move or a typed tag becomes a bounded task only after root answers.

**Lessons:** no Saba-found issue this round, so `lessons.md` is unchanged (59 lines). RC-R272-UNPROBED-PREMISE now has 2 instances and goes to RETRO 275.

## 6. Not COMPLETE, not BLOCKED
**Not COMPLETE.** Still to do:
- SYS-6 stage 3 (round 274);
- RETRO 275 and SYS-5;
- STUDIO-PERFORMANCE and SYS-1..3;
- STORE-2b..5 (paused; ordered after STUDIO-PERFORMANCE and SYS-1..3 by Saba's 2026-10-27 update);
- REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the phase-2 entries (PHASE2-VIDEO-SCORING is gated on the user's go-ahead);
- 462 deferred Lows;
- GATE271-S1 (Medium, `awaiting_user`).

**Not BLOCKED.** Nothing external is missing.

**Ready for commit:** nothing new. Round 273 is published (`52b17e4`).

## 7. Artifacts
**`b-round-273/`:**
- `probe-r274.cjs`, `probe-r274-{head,sketch}.json` and `shots/`;
- `sketch.diff` and `precheck-vitest.{json,log}`;
- `scratch-server.log`;
- pre-edit copies: `backlog.before.json`, `feature-status-before.md` and `b-next-before.json`.

**Updated:**
- `backlog.json` (version 238);
- `feature-status.md`;
- `current-task.md`;
- `b-next.json`;
- `tasks/round-273.md` (the archive).

**New:** `b-round-273-r274-grants.txt` and `b-round-273-checkpoint-addendum.md`.
