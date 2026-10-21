# B — round 34 result → round 35 dispatch (D-29z)

Dispatcher: B · Date: 2026-10-13

**Inputs read:**
- `tasks/round-34.md` (= the dispatched round-34 task, `cmp`-identical), `a-round-34.md`, `c-round-34.md`, `c-round-34.json`;
- `backlog.json` v35, `feature-status.md`, `plan.md` (D-29y and the round table), `b-round-33.md`, `b-next.json`;
- `root-pre-push-review.md` and `publication-checkpoint.json`. Both are unchanged since round 33 (mtime 2026-10-07 and 2026-10-13 11:45). HEAD is still `1cefea1`.

**Sources read for the decision:**
- `StudioWorkspace.tsx`: predicates l.206–246, `releaseEditFocusOnTimelinePointerDown` l.895–910, the root div l.1316, the Master/Transport placement l.1334–1343;
- `ArrangementDetailPanel.tsx` `commitClipGain` (l.325–354);
- `ArrangementMaster.tsx`: the range and its `onPointerDown` → `beginMasterGainGesture`;
- `ArrangementLane.tsx`: the Pan/Volume ranges and the height handle;
- `ArrangementTransport.tsx` (Zoom);
- the `preventDefault`/`claimPointerGesture` sites in Overview, VideoDock, DetailPanel and Lane.

**Advisor:** available; called once before writing, and its advice was applied in full:
- a separate root-level handler, restricted to a focused typing target, a range target and no active gesture. Round 34's handler stays byte-identical;
- the contract stated as an amendment, with the exact chronological history tail;
- red-first cases including Master (outside the scroller), the gesture-active must-not and the decision-4 guard, plus mutations a–f;
- statuses changed from C evidence only;
- the doc/wording Lows bundled into the round;
- the root commit timing made the most prominent root note;
- the 4b-survival note;
- the renumbering.

There was no conflict between the advice and B's evidence.

## 1. Archive and backups

- `tasks/round-34.md` is a copy of the dispatched `current-task.md` (`cmp` SAME). It did not exist before; nothing was overwritten or deleted.
- Backups: `feature-status.before-b-round-34.md`, `backlog.json.bak-before-b-round-34`, `b-next.before-b-round-34.json`, `plan.before-b-round-34.md`.
- Checkpoint: `b-round-34-checkpoint.md`.
- Scripts: `b-scripts/b-round-34-backlog.cjs`, `b-round-34-plan.cjs`, `b-round-34-feature-status.cjs`.

## 2. Independent verification of C's round-34 result

B re-ran the gates on the current tree (`b-round-34/gates.txt`, 16:23–16:25; `node.exe` 7 → 7):

| Gate | B result | C result |
|---|---|---|
| `sha256sum -c b-round-34-tree-sha256.txt` (= round-33 list) | 0 non-OK (376 OK) | 376 OK |
| protected | 4/4 OK | 4/4 OK |
| A's files | SW `b64a2cf6`, FG `11a19bf6`, doc 036 `e86072b8` | the same |
| tsc | exit 0 | exit 0 |
| vitest | 69 files, **1247/1247** | 1247/1247 |
| build | exit 0 | ✓ |
| Biome `./app` | 2 errors (CRLF auth, root) + 218 warnings + 1 info | the same |
| HEAD / status | `1cefea1`, 9 lines | the same |

B did not re-run the browser oracles. They come from C's evidence files (`c-round-34/runs/*`), which C produced independently of A. The backlog changes rest only on C's results and B's gate re-run.

## 3. Round-34 verdict

**C PASS on every ID:** G34-1..3, R34-TS, R34-CG, R34-SB, R34-R33, R34-K, R34-S, R34-U (mutations a–g killed), R34-Doc.

**Statuses (C evidence only):**
- **FOCUS-TEXT-STALE → closed.** R34-TS covers search → header / lane / clip body / ruler, with Delete and Backspace; the search text is kept; the 1280 spot check and the must-not row pass.
- **CLIP-GAIN-CLICK-DISCARD → closed** for clip and lane targets (R34-CG CG-1..5, the unchanged contract, CG-6 live). Range targets were excluded by the round-34 contract and are now C-R34-01.
- **A-R33-REVIEW-SCROLLBAR → closed for code.**
  - The gutter rule passed synthetically (labelled; headless hides the scrollbar). The empty area passed with a real click. Mutations b, c and g were killed.
  - The real-scrollbar confirmation stays with the Tech Lead (R34-T(3)), now with a Firefox overlay variant. This is the same ruling as FB-05: a review finding whose user-level check needs real hardware.
- **SRW-13 4a-fix3 → done.**
- **C-R34-01 → new, Medium** (= A-R34-REVIEW-1, browser-confirmed: `c-round-34/runs/rec-a-r34-review-1.txt`).
- **C-R34-02 → new, Low (doc).**
- **A-R34-REVIEW-RESIDUALS → new, Low** (RTL gutter, overlay scrollbars, right-button commit, transform/zoom). These go to 4b or the final regression.
- **SRW-12 → მოწმდება.** Its only open bug, FOCUS-TEXT-STALE, is closed. What remains is manual: R12-L4, R17-T, R34-T.
- **SRW-24 → stays მოწმდება.** Search → clip → Delete/Backspace now passes.
- **FB-04 → stays ბაგია.** C-R34-01 breaks the same D-29u contract. **SRW-13 → ბაგია** (C-R34-01, and C-R27-01 with the Tech Lead).

**A's round-34 work is accepted as dispatched.** Its test count (17 ≥ 12) and the SC-b rewrite are within the task.

**CG-6 oracle wording:** C counted 2 `setTargetAtTime` calls per commit inside the loop window (the playing source plus the scheduled next-iteration source) and 1 outside. B accepts this and rewords the oracle to "one per live or scheduled SFX source node, 0 restarts". It is applied in round 35 §4.3, `plan.md` D-29z and `backlog.json`.

## 4. Why round 35 is C-R34-01 + C-R34-02 (D-29z)

C-R34-01 is a C-confirmed Medium bug. Bugs go before stage 4b (workflow). C-R34-02 is a one-line doc correction in the same doc A already owns, so the round stays within "one feature or at most three related bugs".

**The source finding behind the fix:**
- Every non-range pointer-gesture owner calls `preventDefault()`: Overview l.177, VideoDock l.764, the detail divider l.690, the lane height handle l.421, and clip and loop brace (round 34).
- So focus stays in the text field and nothing is lost.
- A native range claims its gesture in `onPointerDown`, and only then does the browser move focus. `commitClipGain` then refuses with `GESTURE_EDIT_BLOCKED`.
- Native ranges are therefore the only loss path. A verifies this list in §1.4 and stops if it finds another.

**Decisions** (each states the smallest honest behaviour):
1. **A separate root-level capture handler** on `studio-container`. Master is in the header, outside the scroller, so A's reviewer's scroller-only suggestion would leave Master broken. Round 34's handler stays byte-identical. In capture order the root runs first, and after a blur the scroller handler sees `body` and does nothing.
2. **Only a focused text field, only a range target, no active gesture.** Focused ranges are 4b territory (A-R32-REVIEW-1, no-jump). Outside-scroller non-range targets stay as D-29y decision 4.
3. **Commit, not discard** (D-29u). `ArrangementDetailPanel.tsx` stays frozen.
4. **The fader jump stays** (native; no-jump is 4b). 4b must keep this capture working.
5. **No status, no `preventDefault`, no focus move.**

**Renumbering:** 4b → round 36, 4c + polish → round 37. Round 36 may split 4b into two checkable stages without reducing its scope.

## 5. Round-35 baseline and ownership

- HEAD `1cefea1` plus the 9 uncommitted lines (`b-round-34-git-status.txt`).
- Frozen: `b-round-34-tree-sha256.txt` (a copy of round 33's list), **376 OK**. It excludes the same 3 owned files. `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx` and `clip-gain.test.tsx` are in it.
- Owned snapshots in `b-round-34-snapshots/`: `StudioWorkspace.tsx` `b64a2cf6`, `fader-guards.test.tsx` `11a19bf6`, doc 036 `e86072b8`. These equal the files C verified in round 34.
- A appends one `describe` (≥ 10 `it`) to `fader-guards.test.tsx`. The 54 existing tests stay byte-identical.
- Expected end status: the same 9 lines, or 3 if root commits rounds 31–34 first.

## 6. Ableton

The saved §18.1 capture (`b-round-29/ableton-mixing-20261012.txt`) says nothing about when a value box commits a typed value, or what happens when the user grabs a fader. It also does not describe whether a fader press jumps to the click point.
- The round-35 row is **დაუდასტურებელი** and recorded as a CZABA requirement (D-29u).
- The double-click reset is **confirmed** in §18.1 and stays in 4b.
- B did not browse a new source; a bug round did not need one, and no Ableton behaviour is claimed.

## 7. Root and Tech Lead items (carried; from `root-pre-push-review.md`, `publication-checkpoint.json`, `c-round-34.md`)

**Commit readiness:**
- **Rounds 31 + 32 + 33 + 34 (the same 9 status lines) are C-verified and B-re-gated, so they are ready for root's checkpoint commit.** Root runs its own check/typecheck/tests/build and review, and pushes to both remotes per the 2026-10-13 authorization.
- **Round 35 touches the same 3 files for the fourth round in a row.** Commit **before A starts round 35** or after C passes it, never mid-round. An intermediate checkpoint is not a release.

**Unchanged since round 34:**
- `publication-checkpoint.json` `oct13Checkpoint`: both remotes at `1cefea1`, and HEAD is still `1cefea1`;
- `root-pre-push-review.md` (2026-10-07): nothing new; every finding is closed or carried.

**Still open (root):**
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- CRLF Biome errors on `auth.ts`/`auth-bugs.test.ts`;
- `frontend-architect.md` grants Write/Bash;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the fake Bearer gets 500;
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability;
- the `publication-checkpoint.json` requirements: library/stems done; scrollbars with the Tech Lead; T12; the final commit/push.

**Tech Lead:**
- C-R23-01 (React 19 or an `entry.server.tsx` grant; still 2 NUL at 28013/28014, 63 520 bytes);
- C-R27-01/C-R6-02/C-R8-01 (quiet Chrome);
- DEMO-SFX-FULL-SCALE;
- TL-Q-FB05-FB11;
- R30-T, R31-T and R33-T;
- **R34-T**, now with a Firefox overlay-scrollbar variant of (3). B corrected its "headless 0 px" wording in `feature-status.md` §5 (R11-SB, R34-T);
- **R35-T (new):** with a real mouse, Clip Gain typed → a click on Volume/Pan/Master keeps the value;
- the rest of `feature-status.md` §5.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - C-R34-01 (Medium) is open, and round 35 fixes it;
  - FB-06, FB-07 and FB-09..13 are not started (SRW-14..20);
  - stage 4b/4c and the polish items are open;
  - the SRW-21 adapter is not done;
  - the Medium bugs C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are with the Tech Lead;
  - the full regression and the root review are owed;
  - then T12.
- **Not BLOCKED:** round 35 needs no external information, approval or credentials, and the dev server answered 200 during C round 34.
- **No Critical/High bug is open.**
- **Ready for root commit:** rounds 31–34 (9 status lines).
