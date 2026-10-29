# B round 240 → 241 planning

**Date:** 2026-10-29. **Decisions:** D-29z367…D-29z374. **Next task:** `current-task.md` = round 241, SABA-B-11b stage 2a. The round-240 task is archived as `tasks/round-240.md`, a byte-identical copy (checked with `cmp`; no earlier archive existed).

**Baseline:** `gates/gate-round-240.json` is `published`, commit `04c2a5b4517c70fa2a040fd845c6f257fab24d33` on both remotes. The store HEAD is `04c2a5b` with a clean tree, so it is the baseline of round 241.

**Advisor:** available and used twice. I followed its advice:
- **First call (after orientation):**
  - split stage 2 into 2a and 2b;
  - one check mark per mode, with a D-ID;
  - an L49 table for the new menu path;
  - `4` as a silent alias;
  - a concrete S4 mechanism.
- **Second call (after the pre-check, before writing):**
  - the `checkedIndex` fallback, fixed before freezing the diff and re-run;
  - the Mac bypass question;
  - the ABL-R-8 closing point;
  - the menu-height row;
  - the Lows;
  - the housekeeping.

## 1. Inputs read
- `context/active-summary.md` (header and findings) and `lessons.md`.
- `tasks/round-240.md` (as `current-task.md`), `a-round-240.md`, `c-round-240.md`, `c-round-240.json`.
- `gates/gate-round-240.json`, `gates/round-240/review.md` and the `verify.log` per-file times.
- `regression-last.json` (2026-10-27), `b-round-239.md`, `b-next.json`.
- `tasks/round-239.md` (the stage-2 scope and the §3 table).
- `transport-grid-review.md` §4.3 11b and `reference/youtube/SABA-B-9-10-11-transcripts.md` (grep).
- The specific backlog ids only, plus `user-review/` (no new Saba answers: `AGREE-SABA-B-7.md` is unanswered).
- Source at HEAD: `ArrangementGridMenu.tsx` (all), and from `StudioWorkspace.tsx` the grid state l.525–600, the callbacks l.1325–1660, the key handler l.2195–2265 and the grid control l.2570–2660; also `grid-divisions.ts` l.100–234, `grid.ts` `resolveSnapStep`, `shortcuts.ts` and `strings.ts` `studioGridStrings`.
- Live 12 manual 6.10 (WebFetch).
- WebSearch for the menu labels.
- Consults: `docs-explorer` and `ableton-arrangement-expert`, both read-only.

## 2. Round 240 result → backlog (independent evidence only)
- **C PASS:** `c-round-240.json` has 13 rows passed, `browserVerified: true` and `realVerified: true`.
  - The purchased-origin row is BLOCKED (backend unavailable in cloud) and stays open evidence.
  - The gate rows are listed as `gate`.
- **Gate 240 published** `04c2a5b`. Its reviewer scored 9/10, with no Critical, High or Medium finding.
- **SABA-B-11b-FIX-1 → done** (D-29z367).
  - Closed: GATE239-S2 (C-HAND-240, plus MU-FLAG-MISSING red), GATE239-S3 and GATE239-S6.
  - Closed by design: GATE239-S1 and C-R239-01. D-29z361 is pinned, and C re-ran `eq.mjs`/`eq2.mjs` with 0 differences.
- No item has `browserVerified=false`, so there is nothing to reschedule.
- SABA-B-11b itself stays **მუშავდება**: 2a and 2b remain.

## 3. New findings and rulings
| Id | Severity | Ruling |
|---|---|---|
| C-R240-01 | Low | Doc 186 l.128. Folded into round-241 grant 14 (L7: the doc is granted anyway), D-29z371 |
| GATE240-S2 | Low | The GAU14 magic number. Folded into grant 6 (the file is granted anyway) |
| GATE240-S1 | Low | `pxPerSecond ≤ 0` message. Moved to `deferred_low_polish` with the reviewer's repro. It cannot be reached in the browser (the zoom is clamped at 0.5 px/s) |
| GATE240 Architecture note | signal | The same as GATE239-ARCH-USESTUDIOGRID. Addendum 6 records the third writer of `gridHandChosenRef` (D-29z373) |
| A-R240 reviewer Low: doc l.4 claims a PASS before C runs | info | By rule (L28); no action |
| A-R240 observation: `1` then `2` counts as a hand choice | info | Same as fixed mode; no action |
| B-R240-MENU-HEIGHT | signal | The menu is 641 px tall with a BPM and has 79 px spare at 1280×720. No `max-h` (D-29z374); C row C-MENU-GROUPS-241 |
| B-R240-SNAP-ARIA-TOOLTIP-MISMATCH | signal | The Snap tooltip keeps `(G)` while the aria lists `G 4`. Deliberate (D-29z370) |
| B-R240-FIXED-RADIOS-HELPER-DUP | signal | `fixedGridRadios` is copied into 3 tests; fold it in at the next harness extraction |

**L28 grep** (`In Progress (stage`): two hits, each tied to an open stage.
- Doc 186 belongs to SABA-B-11b; round 241 rewrites its l.4 to `stage 2 of 3`.
- Doc 176 belongs to PERF b-ii, which is open.

No Critical, High or Medium finding is open on runnable code. The open Mediums are on the Tech Lead / manual list or are `awaiting_user` (SABA-B-7).

## 4. Why round 241 is SABA-B-11b stage 2a
- The bug gate is clear (no Medium or above open on runnable code), so the next dependency-ordered scope comes: SABA-B-11b stage 2 → 10a → 10b → 9 → 11c.
- The regression round is not due: 2026-10-27 + 3 days = 2026-10-30, and today is 2026-10-29. RETRO comes at round 245.
- **Split (D-29z368).** 2a is the menu, `4` and GATE239-S4: 2 code files, 3 support files and the tests. 2b ("no snap on an invisible grid") touches every snap consumer and the independent Alt path of `resolveSnapStep`, so it gets its own round, ruling and rows. No scope is dropped; 2b is written into the `stage_plan` with its known facts.
- **ABL-R-8** closes at the 2b C PASS.

## 5. Smallest honest behaviour (rationale)
- **One check across the menu (D-29z369).** Two checked radios in one menu would hide the mode, which is the GATE239-S4 complaint. Live's check rule was not found, so the single check is CZABA's decision.
  - The current adaptive pick stays visible in the select and in its accessible description.
  - This replaces the round-239 "checked = current pick" contract. GM1 and GU9 change only their expected values for this reason.
- **Choosing a width** is absolute (−2…2), so it needs no refusal guards. It counts as a hand choice, the same as adaptive `1`/`2`, and it switches a fixed grid to adaptive. `toggleGridMode`'s reset to 0 is dropped because the user picked a level.
- **`4` is a silent alias** of G. The statuses and the tooltip keep `(G)`, because changing them would ripple through about 40 tests and every C recipe for no user gain. The second key is listed in the sheet and in the `aria-keyshortcuts`.
- **GATE239-S4** closes with no new element: the menu groups, plus the title exposed as the accessible description (CDP-verified). An `sr-only` `describedby` would drop the `1`/`2` hint from screen readers.
- **Flat groups instead of Live's (recollected) submenus:** one click, and the legend names the mode. There is no "Off" item; Snap is CZABA's off switch, and Saba is asked once.

## 6. For Saba (non-blocking, `awaiting_user`)
- **New: SABA-Q-11B-MENU-OFF.** Live's grid menu has an "Off" choice. CZABA turns the grid off with Snap (G, `4`, or the menu's Snap item). Add an "Off" next to the widths, or keep it as it is?
- **New: SABA-Q-11B-MAC-BYPASS.** On a Mac, Live ignores snap while Cmd is held. CZABA uses Option, because Cmd+click and Cmd+drag do other things in the browser. Keep Option, or also accept Cmd?
- **Still open:** SABA-Q-11B-DENSITY-MODEL, -READOUT, -DENSITY, -PLAIN-DIGITS, `user-review/AGREE-SABA-B-7.md`, and the earlier SABA-Q-* list in `b-next.json`.

## 7. Architecture checkpoint
- Addendum 6 has been appended to `b-round-234-checkpoint-request.md` (ARCH-CHECKPOINT-TEMPO-GRID). It is non-blocking.
- Root: please run the read-only `frontend-architect` checkpoint after SABA-B-11b stage 2b and before SABA-B-10a. Question 7: keep, or extract `useStudioGrid`.

## 8. Commit readiness
Round 240 is already published (`04c2a5b`). At planning, no store change exists: `git status` in `store/` is empty and HEAD is `04c2a5b`.
- My scratch work is in `/tmp/b241-scratch` and `/tmp/b241`, outside the repo.
- The scratch dev server on `:5174` was stopped; `:5173` answers 200.

## 9. Files written by B
- `current-task.md` (round 241), `tasks/round-240.md` (archive), `b-round-240.md`, `b-next.json`.
- `b-round-240-r241-grants.txt` (14), `-tree-sha256.txt` (1,090), `-root-files.txt`, `-root-files-start-sha256.txt`, `-grants-start-sha256.txt`.
- `b-round-240/`:
  - `precheck-scratch.diff` (822 lines), `covering.txt` (49), `covering.log`, `tsc.log`, `biome.log`;
  - `mutants/` (5 logs + `mutate.py`);
  - `probe-241.cjs`, `probe-241-head.json`, `probe-241-scratch.json`, `probe-241-scratch-attempt1.err`, `shots-head/`, `shots-scratch/`, `dev5174.log`;
  - `head-at-planning.txt`, `git-status-at-planning.txt`;
  - backups `backlog-before-r241-planning.json`, `feature-status-before-r241-planning.md` and `lessons-before-r241-planning.md`.
- **Updated:**
  - `backlog.json`:
    - rounds 240 (result) and 241;
    - `current_task`, `updated`;
    - 6 `open_findings` status updates and 4 new ones;
    - 1 `deferred_low_polish`;
    - 3 new architecture signals and 1 extended;
    - the checkpoint status;
    - the SABA-B-11b `stage_plan`, status and decisions;
    - the SABA-B-9-10-11 status;
    - ABL-R-8 (two entries);
    - 1 regression `scope_addition`;
    - D-29z367…374;
    - `advisor_used_by_B`.
  - `feature-status.md`: the header, round 240 → მზადაა, a new round-241 row, and the queue row.
  - `b-round-234-checkpoint-request.md` (addendum 6).
- `lessons.md` is unchanged (59 lines): no new failure class in this planning.
- **Edits after the second advisor call** (`current-task.md`):
  - C-MENU-CHECK-241: focus on a mouse-opened menu is `activeElement` only; the ring is checked on the keyboard path.
  - C-MENU-CHOOSE-241 (a) and C-MENU-REG-241 Escape: focus the Snap toggle first, then expect it back (not BODY, L47).
  - The mutant-log timing note in §0.2.
  - Signal B-R240-SNAP-ARIA-TOOLTIP-MISMATCH (also added to `backlog.json` and `b-next.json`).

## 10. Attempt 2 (root resume)
Attempt 2 re-checked the artifacts and changed nothing:
- both JSON files parse;
- `current-task.md` is complete through §7;
- the archive `tasks/round-240.md` is intact;
- `B-R240-SNAP-ARIA-TOOLTIP-MISMATCH` is in `backlog.json`;
- store HEAD `04c2a5b` is clean.
Advisor was used a third time, for this check.
