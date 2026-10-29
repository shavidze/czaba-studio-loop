# B round 239 → 240 planning

**Date:** 2026-10-29. **Decisions:** D-29z360…D-29z366. **Next task:** `current-task.md` = round 240, SABA-B-11b-FIX-1. The previous task is archived unchanged as `tasks/round-239.md` (a byte-identical copy, checked with `cmp`).

**Advisor:** available, and used after orientation, before writing. I followed its advice:
- treat the 960-case simulation as decisive for GATE239-S1;
- extend the simulation to the musical families;
- rule on the density model under L10 instead of dispatching a no-op fix;
- scope GATE239-S2 tightly (no flag on the triplet branch, `5` unchanged);
- make round 240 a fix round, with stage 2 after it.

A second advisor call was made before declaring done; its edits are listed in §9.

## 1. Inputs read
- `context/active-summary.md` (header and the findings list).
- `lessons.md`.
- `tasks/round-239.md` (as `current-task.md`), `a-round-239.md`, `c-round-239.md`, `c-round-239.json`.
- `gates/gate-round-239.json`: `published`, commit `d0afa64…`, both remotes. Also `gates/round-239/review.md` and the tail of `verify.log`.
- `regression-last.json` (2026-10-27).
- The `backlog.json` structure and the specific ids only.
- `b-round-238.md`, and `b-round-234-checkpoint-request.md` addendum 4.
- Source at HEAD: `StudioWorkspace.tsx` l.1390–1603 and `grid-divisions.ts` l.110–234.

## 2. Round 239 result → backlog (independent evidence only)
- **C PASS:** `c-round-239.json` has 17 passed rows, `browserVerified: true` and `realVerified: true`. The purchased-origin browser row is BLOCKED (backend unavailable in the cloud) and stays open evidence. The gate rows are listed as `gate`.
- **Gate 239 published** `d0afa64` on both remotes. `verify.log`: 214 files and 3,065 tests green, build OK.
- **SABA-B-11b stage 1 → done (D-29z360).** It is the first of two stages, so the SABA-B-11b item stays in progress. This planning has no browserVerified=false item to reschedule.

## 3. New findings and rulings
| Id | Severity (B) | Ruling |
|---|---|---|
| GATE239-S2 | **Medium** | D-29z362, round 240. Since round 239, adaptive `1`/`2` bypass `changeGridDivision`, so `gridHandChosen` is never set. B reproduced it on HEAD in Chromium at both viewports: `1` (0.5 s), then the seed → `adaptive 1/4` (`b-round-239/probe-240-head.json`). The fix sets the flag after both refusal guards. GAU16 is red on HEAD code; GAU17 is the refused-key control. |
| GATE239-S1 | Low (the gate said Medium) | D-29z361, ruled by design. The reviewer's formula equals A's loop, with 0 differences: `b-round-239/eq2.mjs` ran 19,710 cases and `eq.mjs` ran 960. Under it, the reviewer's own scenario still gives 5 s. At a clamped end, no model gives both "one visible step per key" and "the net key count after a zoom back". The rejected alternative is round-239 reviewer Medium #2. The ruled values are pinned by GAU12, GAU14 and GAU15. |
| C-R239-01 | Low | Same ruling and same pin (GAU14 = C's own recipe, `2` s). |
| GATE239-S3 | Low | Round 240: the end check moves before the loop. Owned code, little cost, equivalent behaviour. |
| GATE239-S4 | Low | Stage 2 scope: the mode must be programmatic, through the menu items and a mode name that does not depend on hover. |
| GATE239-S5 | Low | `deferred_low_polish` (383 entries). Stage 2 may take it if it rewrites the title anyway. |
| GATE239-S6 | trivial | Round 240: the describe id becomes D-29z356. |
| A-R239-5B-DENSITY-TEMPO-CLEAR | info | Intended (D-29z365): the density is a family-independent view preference. The mirror case becomes GAU15. |
| INFO-C239-ZOOM-DURING-DRAG, INFO-C239-STATUS-STALE-AFTER-ZOOM | info | Recorded. The second is linked to SABA-Q-11B-READOUT. |
| GATE239-ARCH-USESTUDIOGRID | signal | D-29z364. Addendum 5 of `b-round-234-checkpoint-request.md` (question 7). Not scheduled; to be re-asked after stage 2. |

**L28 grep** (`In Progress (stage`): two hits, each tied to an open stage. Doc 186 belongs to SABA-B-11b, stage 2 open, and round 240 rewrites its l.4. Doc 176 belongs to the PERF determinism contract, whose stage 2 stays open as PERF-HARNESS-SHARED-LIB-b-ii.

No other Critical, High or Medium is open on runnable code. The open Mediums are on the Tech Lead / manual list or are `awaiting_user` (SABA-B-7), as before.

## 4. Why round 240 is a fix round
- A Medium regression comes before new scope (bug gate 2026-10-23; precedent rounds 236–238).
- The regression round is not due (2026-10-27 + 3 days = 2026-10-30, and today is 2026-10-29). RETRO comes at round 245.
- Round size: one Medium plus two Lows and one trivial item, all in `stepGridDivision` or its test file. That is within "at most three tightly related bugs"; the trivial item is a label.
- **Stage 2 is round 241**, unless the round-241 planning lands on or after 2026-10-30. In that case the REGRESSION round comes first; its `scope_additions` now carry SABA-B-11b stage 1 and C-HAND-240.

## 5. Smallest honest behaviour (rationale)
- **What counts as a hand choice:** any accepted grid-width change by the user before the seed: the select, the menu, fixed-mode `1`/`2`, and now adaptive `1`/`2`. These are the same keys, with the same "Grid: 0.5 s" status, so the TU5 promise must hold.
  - A refused key does not count, the same as l.160 of round 234.
  - `5` stays a mode switch, not a width choice. GAU6 is unchanged; changing it would be a new contract with its own D-ID.
- **The density model:** re-anchoring keeps every key press visible, which is Live 6.10's "narrows the grid" taken literally. Live publishes nothing for a clamped end, so Saba gets one question (SABA-Q-11B-DENSITY-MODEL, L44, non-blocking).

## 6. For Saba (non-blocking; `awaiting_user`)
- **New: SABA-Q-11B-DENSITY-MODEL.** Example: at maximum zoom the grid is already 0.1 s, and you press "wider" once. CZABA widens it at once. When you zoom back out, the grid is then wider than your key count suggests (2 s instead of 0.5 s). The alternative keeps the count, but then 1–2 presses at maximum zoom visibly do nothing. Which do you prefer?
- **Still open:** SABA-Q-11B-READOUT, SABA-Q-11B-DENSITY, SABA-Q-11B-PLAIN-DIGITS, `user-review/AGREE-SABA-B-7.md`, and the earlier SABA-Q-* list in `b-next.json`.

## 7. Architecture checkpoint
- Addendum 5 has been appended to `b-round-234-checkpoint-request.md`. It records the `useStudioGrid` signal, with GATE239-S2 as concrete evidence that the flag rule is spread out.
- It is non-blocking. Root: run the read-only `frontend-architect` checkpoint after SABA-B-11b stage 2 and before SABA-B-10a, if possible.

## 8. Commit readiness
Round 239 is already published (`d0afa64`). No store change exists at planning: `git status` in `store/` is empty, and HEAD is `d0afa64`. My scratch work is in `/tmp/b240-scratch` and `/tmp/b240`, outside the repo. The scratch dev server on `:5174` was stopped; `:5173` still answers 200.

## 9. Files written by B
- `current-task.md` (round 240), `tasks/round-239.md` (archive), `b-round-239.md`, `b-next.json`.
- `b-round-239-r240-grants.txt` (3), `-tree-sha256.txt` (1,101), `-root-files.txt`, `-root-files-start-sha256.txt`, `-grants-start-sha256.txt`.
- `b-round-239/`:
  - `precheck-scratch.diff`, `code.diff`, `covering.txt`, `covering.log`, `tsc.log`;
  - `eq.mjs`, `eq2.mjs`;
  - `probe-240.cjs`, `probe-240-head.json`, `probe-240-scratch.json`, `probe-240-scratch-attempt1.err`, `dev5174.log`;
  - `head-at-planning.txt`, `git-status-at-planning.txt`;
  - backups `backlog-before-r240-planning.json`, `feature-status-before-r240-planning.md` and `lessons-before-r240-planning.md`.
- Updated:
  - `backlog.json`: the round 239 result, the round 240 entry, 10 `open_findings`, 1 `deferred_low_polish`, 1 architecture signal, a checkpoint status, 1 retro candidate, 2 regression `scope_additions`, the SABA-B-9-10-11 status, and D-29z360…366;
  - `feature-status.md`: the header, the round-239 row → მზადაა, a new round-240 row, and the queue row;
  - `b-round-234-checkpoint-request.md` (addendum 5);
  - `lessons.md` (L49, 59 lines, nothing dropped).
- **Edits after the second advisor call:**
  - `current-task.md`:
    - §4 step 6: `code-reviewer` is required (3 files is 3+; the project rule);
    - C-REF-240 gains C's own run of `eq.mjs`/`eq2.mjs` and a read-through of both scripts, so the D-29z361 evidence is verified independently;
    - the case counts are split (`eq2.mjs` 19,710, `eq.mjs` 960) in §1, §2.4 and AN-REVIEW-240.
  - `b-round-239.md`: the split counts, and the L28 grep tie for docs 176 and 186.
  - `backlog.json`: the D-29z361 text and GATE239-S1 `severity_source` have the split counts, and `advisor_used_by_B` was updated.
