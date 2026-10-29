# B round 254 → 255 planning (2026-10-29)

**Decision: CONTINUE.** Next task: **round 255, the SABA-B-10b fix-up** (`current-task.md`): B's ruling on C-R254-01, doc 192's status line, and C's re-verification of the frozen round-254 diff. Decisions: D-29z475…D-29z480.

**Advisor:** used once, before writing. Its points were adopted:
- ground the acceptance in the sheet's existing multi-line pattern, and replace the clause with a measured bound;
- doc 192 l.4 is now false, so the round needs that one grant;
- freeze the round-254 diff by hash, and carry the unchanged rows by diff identity, listed by name;
- close nothing until the round passes;
- regression comes after, not merged in.

**Consults:** none of the project agents was needed. The ruling rests on C's measurements, and no new Ableton behaviour is involved.

## 1. Inputs read
- `tasks/round-254.md`: the archived copy of the round-254 task, copied at the start of this planning; nothing was overwritten.
- `a-round-254.md`
- `c-round-254.md` and `c-round-254.json`
- `gates/gate-round-254.json`: **skipped**, "C taskStatus FAIL", so there is no new baseline commit.
- `lessons.md`
- `context/active-summary.md` (head)
- `regression-last.json`: 2026-10-27.
- Backlog entries by ID.

**Snapshots before editing:** `b-round-254/*-before-255`.

## 2. C round 254 evidence → backlog (D-29z475, D-29z478)
**Verdict:** FAIL, with `browserVerified` and `realVerified` both true.
- **18 rows PASS:** C-SCOPE, C-UNIT, C-MUT, C-MARKER-VISIBLE, C-BLINK, C-CONTRAST, C-TWO-LINES, C-MARKER-PLAYING, C-MARKER-RANGE, C-HOME, C-ZOOM, C-TITLES, C-FOCUS, C-BUDGET, C-LESSON, AN-REVIEW, LAB-SMOKE and Auth.
- **The only failure** is C-SHEET-254 (C-R254-01).
- Because C failed, **SABA-B-10b is not done** and stays in progress. None of its findings close yet (GATE249-S4, GATE249-S7, A-R250-REVIEW-SHEET-MARKER-COPY, INFO-B249-STALE-MARKER-STATUS); each is marked "carried to round 255".

**Routing:**

| ID | Severity | Route |
|---|---|---|
| C-R254-01 | Low | Ruled, D-29z476 (§3). Closes on C-SHEET-255 PASS. |
| C-R254-OBS-01 | Low (pre-existing, same on HEAD) | `deferred_low_polish`, with C-R253-01 |
| A-R254-SHEET-SCROLL-DELTA | info | Closed: C measured +30 px, not +132. |
| A-R254-WRONG-TIMEOUT-PREMISE | info | Recorded. It corrects D-29z471's premise; the ruling is kept. L29 evidence. |
| Reviewer #4, #5, #9 | Low | `deferred_low_polish` as A-R254-REVIEW-FRAMES-ROW, -BLINK-WCAG222 and -SC5-BLANK. #5 is also appended to SABA-Q-10B-MARKER-LOOK as (e). |
| Architecture note | signal | A-R254-ARCH-POSITION-WRITER, in `architecture_signals`. It is input for the pending ARCH-CHECKPOINT-TRANSPORT-POSITIONS. No new checkpoint request is needed: that request already covers the transport positions owner. |

- **Lows total:** `deferred_low_polish` has **425** entries. No finding is Medium or above.
- **Regression list:** C-SHEET-255 and C-VIDEO-ZORDER-255 are added to REGRESSION-ROUND-2026-10-30's `scope_additions`.

## 3. The ruling on C-R254-01 (D-29z476)
**C's measurements** (HEAD control, both viewports):
- `scrollHeight` is 1,230 at HEAD and 1,260 now. With `nowrap`, both are 1,070.
- So the +30 px is wrapping only: +10 px in the Transport/Edit grid row and +20 px from the `marker` row.
- **At HEAD, the sheet already scrolled** (by 422 px and 584 px) and already had rows of 40–64 px.

**Ruling:**
- **The clause was a B spec error.** It was tighter than the sheet's own pattern, and it was written without measuring HEAD.
- **Accept, with a measured bound:**
  - `scrollHeight` ≤ 1,260;
  - `clientHeight` unchanged;
  - no horizontal overflow;
  - the changed or added rows are ≤ 40 px;
  - the other rows equal HEAD.
- **Shortening the copy is rejected.** It would drop one of Space's or M's honest cases (insert marker, selection start, playhead while playing), and that would reopen A-R250-REVIEW-SHEET-MARKER-COPY.
- **A layout change is not proposed.** It would need Saba.
- **The sheet is an on-demand modal,** so the screen budget (L39) is unaffected.

**Why we missed it:** B's pre-check had a scratch server but did not measure the container against HEAD, and A estimated the growth instead of measuring it. L3's evidence is extended (D-29z479), with no new line; `lessons.md` stays at 58 lines.

## 4. Round 255 design (D-29z477)
**Why there are no app changes:** the code C verified is the code that will ship.

**Freezing the code C verified:**
- The 7 `M` files are frozen by sha256: `b-round-254-r255-carried-sha256.txt`.
- The diff hash is `a8492a4c…46d5`, with a copy in `b-round-254/round254-carried.diff`.
- Their mtimes (20:26–20:48 UTC) are before C started (about 20:59), so this is the diff C checked.
- The frozen list `b-round-254-r255-tree-sha256.txt` has 1,110 files; the protected and root checks give rc 0.

**The one grant:** doc 192. l.4 becomes `Completed (C round 255 PASS)`, and it gets one Problem → Solution bullet.

**What C runs:**
- the amended C-SHEET-255;
- C-VIDEO-ZORDER-255, the neighbour C did not probe in 254;
- C-SCOPE, C-UNIT, C-LESSON, AN-REVIEW, LAB-SMOKE and Auth.

**Carried rows:**
- **Which:** 12 round-254 rows, carried by diff identity under a separate `carried` key, never under `passed`.
- **The condition:** they hold only if C-SCOPE-255 passes.
- **Why this is allowed:** it follows the workflow rule that C checks changed criteria and directly related regressions.

## 5. Order (D-29z480)
**Round 255:**
- **PASS + gate:** SABA-B-10b is done, and its findings close.
- **FAIL:** a fix-up or a ruling.

**Then:**
1. **REGRESSION-ROUND-2026-10-30:** it is due at the next planning on or after 2026-10-30.
2. **SABA-B-9:** with double-click Stop and the Stop label.
3. **SABA-B-11c.**
4. **SABA-B-7:** once Saba answers.

**Not due yet:**
- **RETRO:** the next one is at round 260.
- **Not COMPLETE:** large approved scope remains.
- **Not BLOCKED:** nothing waits on outside input.

**Ready for commit:** not yet. The round-254 diff becomes publishable only after C passes round 255 and the root gate runs.

## 6. Files written by B
- `tasks/round-254.md` (archive copy)
- `current-task.md` (round 255)
- `b-next.json`
- `b-round-254.md`
- `backlog.json`, via `b-round-254/update-backlog.py`
- `feature-status.md`
- `lessons.md`: the L3 and L29 evidence was extended.

**Hash lists:**
- `b-round-254-r255-{grants,carried,root-files}.txt`
- `*-sha256.txt`
- `b-round-254-r255-tree-sha256.txt`

**Snapshots and scratch:** `b-round-254/` (snapshots, the diff copy, the granted-start copy, the planning status and HEAD).

**No app source and no other agent's files were modified.**
