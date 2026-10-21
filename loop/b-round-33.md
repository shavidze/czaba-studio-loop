# B — round 33 result → round 34 dispatch (D-29y)

Dispatcher: B · Date: 2026-10-13 · Inputs read: `tasks/round-33.md` (= the dispatched round-33 task, `cmp`-identical), `a-round-33.md`, `c-round-33.md`, `c-round-33.json`, `c-round-33/checkpoint.md`, `c-round-33/runs/rec-text-stale.txt`, `backlog.json` v34, `feature-status.md`, `plan.md` (D-29x and the round table), `b-round-32.md`, `publication-checkpoint.json` (keys and `oct13Checkpoint`), `root-pre-push-review.md` (headings; unchanged since 2026-10-07, read in full in round 32). Sources read for the decision: `StudioWorkspace.tsx` (predicates l.206–235, `releaseFaderFocusOnTimelinePointerDown`, keydown head, scroller JSX), `ArrangementDetailPanel.tsx` (`commitClipGain`, the Clip Gain and start/end inputs, the `key` on `ArrangementDetailContent` l.801), `ArrangementLibrary.tsx` (search input), `ArrangementContext.tsx` (`setClipGain`, `applyEdit`), `ArrangementTransport.tsx` (the Zoom range), `studio-scrollbar.ts`.

**Advisor:** available; called once before writing. Applied: a general `isTypingTarget` predicate; the Clip Gain commit oracle shaped like round-33 case 5, plus a Tab-blur-equivalent invalid case; the scrollbar exclusion stated as a contract amendment with its own mutation; the Backspace hazard stated and routed to the Tech Lead (R34-T); backlog changes from C evidence only; an explicit FB-05 ruling; snapshots retaken. **One deviation from the advice:** the advisor suggested excluding `event.target === scroller`. That would also exclude the empty scroller area below the lanes and bring C-R32-01 back there. B specified a geometric gutter test instead (client box, `scrollbar-gutter: stable`), with mutation (c) to pin the difference.

## 1. Archive and backups

- `tasks/round-33.md` — a copy of the dispatched `current-task.md` (`cmp` SAME). It did not exist before; nothing was overwritten or deleted.
- Backups: `feature-status.before-b-round-33.md`, `backlog.json.bak-before-b-round-33`, `b-next.before-b-round-33.json`, `plan.before-b-round-33.md`.
- Checkpoint: `b-round-33-checkpoint.md`. Scripts: `b-scripts/b-round-33-backlog.cjs`, `b-round-33-feature-status.cjs`, `b-round-33-plan.cjs`.

## 2. Independent verification of C's round-33 result

B re-ran the gates on the current tree (`b-round-33/gates.txt`; `node.exe` 8 at start, 7 at the end):

| Gate | B result | C result |
|---|---|---|
| `sha256sum -c b-round-32-tree-sha256.txt` | 0 non-OK (376 OK) | 376 OK |
| protected | 4/4 OK | 4/4 OK |
| A's files | SW `be01135c`, FG `9a973aef`, doc 036 `91c1547b` | the same |
| tsc | exit 0 | exit 0 |
| vitest | 69 files, **1230/1230** | 1230/1230 |
| build | exit 0 | ✓ |
| Biome `./app` | 2 errors (CRLF auth, root) + 218 warnings + 1 info | the same |
| HEAD / status | `1cefea1`, 9 lines | the same |

B did not re-run the browser oracles. They come from C's evidence files (`c-round-33/runs/*`), which C produced independently of A. The backlog changes rest only on C's results and B's gate re-run.

## 3. Round-33 verdict

**C PASS on every ID:** G33-1..3, R33-FT, R33-KO, R33-G, R33-K, R33-S, R33-U (mutations a–f killed; the snapshot run also showed A's 3 unrun post-hoc tests red), R33-Doc.

**Statuses (C evidence only):**
- **C-R32-01 → closed** (R33-FT: 5 faders × header/lane/clip body/ruler, Delete and Backspace; `dk-focus-retention` B/C/D now delete; 1280 spot check 3/3).
- **C-R31-02 → closed** (with C-R32-01; the round-32 must-not rows are 5/5 unchanged).
- **SRW-13 4a-fix2 → done.**
- **FOCUS-TEXT-STALE → open, Medium** (C confirmed it: `rec-text-stale.txt` REC-1).
- **CLIP-GAIN-CLICK-DISCARD → new, Medium** (B ID for C's REC-2: a typed Clip Gain value is lost when another clip is clicked).
- **A-R33-REVIEW-SCROLLBAR → new, Low** (A's reviewer). **A-R33-REVIEW-TOUCH → new, Low → stage 4b.**
- **OUTSIDE-SCROLLER-DELETE → accepted** (C's `rec-outside.txt`; decision 4 below).
- **FB-05 → მოწმდება.** Every C ID passed, and its three C bugs (C-R31-01, C-R31-02, C-R32-01) are closed. The only remaining FB-05 code item is A-R32-REVIEW-1. It is a review finding, and C showed that a real mouse `pointerup` clears it, so it is not a C-reproduced user failure. It is queued in 4b with the double-click reset. This differs from the round-32 ruling, where the open item (C-R31-01) was a C bug.
- **FB-04 → ბაგია** (CLIP-GAIN-CLICK-DISCARD breaks its D-29u commit-on-blur contract). **SRW-12 → ბაგია** (FOCUS-TEXT-STALE) until C passes R34-TS.

**A's round-33 work is accepted as dispatched.** The `focused instanceof HTMLElement` addition is TS narrowing only (C R33-S).

## 4. Why round 34 is these three bugs (D-29y)

The two Medium bugs are C-confirmed, pre-existing, and have the same root cause as C-R32-01: timeline pointerdowns call `preventDefault()`, so focus never leaves the field. Bugs go before stage 4b (workflow). One predicate in one handler fixes all three, so they are "tightly related" in the workflow's sense.

**Source finding behind CLIP-GAIN-CLICK-DISCARD:** `ArrangementDetailContent` is keyed by the selected clip id (`ArrangementDetailPanel.tsx:801`). A click on another clip changes the selection, React remounts the content, and the focused input is removed. A removed element fires no `blur`, and `commitClipGain` also returns early once `isContentMountedRef` is false. That matches C's REC-2 exactly (focus BODY, no entry, gain unchanged).

**Decisions** (each states the smallest honest behaviour):
1. **Extend the round-33 release to text-entry fields** (`isTypingTarget`). The keydown handler and every predicate stay byte-identical.
2. **Commit, not discard.** D-29u says Clip Gain commits on blur. The capture blur runs before the clip handler changes the selection, so the existing `commitClipGain('blur')` writes the value to the clip it was typed for. `ArrangementDetailPanel.tsx` stays frozen: no new commit path.
3. **Exclude the scrollbar gutter by geometry.** A pointerdown whose target is the scroller itself and whose point is outside its client box does not blur. Inside the client box (the empty area below the lanes), focus is still released. Rejected: excluding `target === scroller` outright (it brings C-R32-01 back in the empty area), and leaving the residual (once text fields blur, a scrollbar drag followed by Backspace would delete the selected clip).
4. **Outside the scroller is unchanged and accepted.** After a click on a library item, Delete deletes the timeline selection. The library has no delete action, and workspace keys act on the timeline selection unless focus is in a text field or on a native range.
5. **A-R33-REVIEW-TOUCH → Low, stage 4b.** There is no data loss (the preview is written early, not lost), C cannot produce trusted touch input, and 4b reworks the fader gesture machine.
6. **The new hazard is stated.** After search typing and a clip click, Backspace deletes the clip (undoable, one entry, a gap). That is the browser's behaviour without `preventDefault`, and it is consistent with SRW-24. The Tech Lead checks it as R34-T.

**Renumbering:** 4b → round 35 (adds A-R33-REVIEW-TOUCH); 4c + polish → round 36.

## 5. Round-34 baseline and ownership

- HEAD `1cefea1` plus the 9 uncommitted lines (`b-round-33-git-status.txt`).
- Frozen: `b-round-33-tree-sha256.txt` (a copy of round 32's list), **376 OK**. It excludes the same 3 owned files. `ArrangementDetailPanel.tsx`, `ArrangementLibrary.tsx` and `clip-gain.test.tsx` are in it.
- Owned snapshots in `b-round-33-snapshots/`: `StudioWorkspace.tsx` `be01135c`, `fader-guards.test.tsx` `9a973aef`, doc 036 `91c1547b`.
- A appends one `describe` (≥ 12 `it`) to `fader-guards.test.tsx`. All 37 existing tests stay byte-identical.
- Expected end status: the same 9 lines, or 3 if root commits rounds 31–33 first.

## 6. Ableton

The saved §18.1 capture (`b-round-29/ableton-mixing-20261012.txt`) says nothing about keyboard focus after an Arrangement click, the Browser search field, or when a value box commits a typed value. Every round-34 row is **დაუდასტურებელი** and recorded as a CZABA requirement. B did not browse a new source; a bug fix did not need one, and no Ableton behaviour is claimed.

## 7. Root and Tech Lead items (carried; from `root-pre-push-review.md`, `publication-checkpoint.json`, `c-round-33.md`)

**Commit readiness:**
- **Rounds 31 + 32 + 33 (all 9 status lines) are C-verified and B-re-gated, so they are ready for root's checkpoint commit.** Root runs its own check/typecheck/tests/build and review, and pushes to both remotes per the 2026-10-13 authorization.
- Once A starts round 34, `StudioWorkspace.tsx`, `fader-guards.test.tsx` and doc 036 are active implementation files. Commit them before A starts or after C passes round 34. An intermediate checkpoint is not a release.

**Unchanged since round 32 (re-checked):**
- `publication-checkpoint.json` `oct13Checkpoint`: both remotes at `1cefea1` (`git remote -v` shows both push URLs; HEAD is still `1cefea1`).
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
- C-R23-01 (React 19 or an `entry.server.tsx` grant);
- C-R27-01/C-R6-02/C-R8-01 (quiet Chrome);
- DEMO-SFX-FULL-SCALE;
- TL-Q-FB05-FB11;
- R31-T and R33-T;
- **R34-T (new):** with a real mouse: search typing → clip click → Backspace deletes the clip and keeps the search text; a typed Clip Gain survives a click on another clip; a scrollbar drag keeps search focus;
- the rest of `feature-status.md` §5.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - FOCUS-TEXT-STALE and CLIP-GAIN-CLICK-DISCARD (Medium) are open, and round 34 fixes them;
  - FB-06, FB-07 and FB-09..13 are not started (SRW-14..20);
  - stage 4b/4c and the polish items are open;
  - the SRW-21 adapter is not done;
  - the Medium bugs C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are with the Tech Lead;
  - the full regression and the root review are owed;
  - then T12.
- **Not BLOCKED:** round 34 needs no external information, approval or credentials, and the dev server answered 200 during C round 33.
- **No Critical/High bug is open.**
