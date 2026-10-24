# B — Round 140 → 141 planning (D-29z106)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing; once before finishing).

## 1. Inputs read (as data)
- `context/active-summary.md`.
- `tasks/round-140.md`: archived this run as an exact copy of the round-140 `current-task.md` (sha256 `dc06b7ec…`; no earlier archive existed). I also read `a-round-140.md`, `c-round-140.md` and `c-round-140.json`.
- `gates/gate-round-140.json`: **published** `6ebbf3ec1c7954e5a33f15e4ac1d20aa2b313414`, with the same hash on both remotes. This is the round-141 baseline (HEAD; the tree is clean).
- `gates/round-140/review.md`: COMMIT OK, 9/10, verify 165 files / 2478 tests, build OK. It has 5 suggestions and an Architecture note.
- `env-status.json`: store 200.
- `regression-last.json`: 2026-10-24 (round 122). The next regression is due on or after 2026-10-27, so not now.
- `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` **do not exist**. There is no strings-split checkpoint result.
- I opened `backlog.json`, `plan.md` and `feature-status.md` only to look up specific IDs.
- I re-measured the V-0.4d source and test lines with grep at `6ebbf3e`.

## 2. Evidence → backlog (only independent C and gate results)
| Item | Evidence | New status |
|---|---|---|
| V-0.4c | `c-round-140.json`: PASS, `browserVerified` = `realVerified` = true. Every browser row ran at both viewports, with real audio (envelope ≈14 dB, group Mute/Solo ≈179/180 dB, real Master and track over). Gate 140 published `6ebbf3e` | `c_pass_published` → **მზადაა** |
| GATE139-DOC113-L21, GATE139-DOC115-STATUS | C AN-REVIEW | closed |
| A round-140 deviations 1–3 | C AN-REVIEW + gate-140 #2 | ratified |
| Gate-140 #1 (doc 116 status), #3 (ST39 `toBe(17)`) | review.md | folded into round 141 (owned files) |
| Gate-140 #4 (plural branch) | review.md: tested, correct | info, no action |
| Gate-140 #5 (ST38 weak loop) | review.md | `deferred_low_polish` (197 → 198) |
| Architecture note (gate + A) | review.md, a-round-140.md | ARCH-R140-STRINGS-TEST-SPLIT signal + checkpoint addendum (not a task) |
| LAYOUT group-row inconclusive | no round-139 baseline existed | C's recorded boxes are now the baseline (C-R140-GROUPROW-BASELINE) |
| C-R86-OBS | C METER note | annotated: the current demo starts empty, so the latch trips only at Master +6 dB or with a Clip Gain boost |
| G140-3 fake-Bearer 403 | BLOCKED | open backend evidence |
| Tech Lead | — | R140-T added |

No Critical, High or Medium finding is open.

## 3. Why V-0.4d now, and its shape
`tasks/round-140.md` §8 set this step: C PASS → V-0.4d, re-measured first. Nothing overrides it: the regression is not due, there are no decision files and there is no checkpoint result.

**Measured at `6ebbf3e`:**
- `groups.ts` l.4 holds the prefix.
- Context l.548/549 hold the fallback names (used only without `initialArrangement`; no test mounts the provider that way).
- `studio-lab.tsx` l.13–15 hold the route track names.
- 191 `ჯგუფი` lines in 10 test files; `e2e/` has 0.
- No persistence, so no migration is needed.
- No case-insensitive `group` matchers.
- Name buttons are `flex-1 truncate`, so their boxes cannot move.

**Rulings (summary; full text in `current-task.md` and plan.md D-29z106):**
- **R1 — route names move in.** The backlog kept them for V-0.5 "unless re-measurement moves them". Re-measurement shows they are the only default track names a user ever sees. Changing only the fallback would leave C nothing to observe in the browser.
- **R2 — where the texts live.** The prefix becomes `studioTrackGroupStrings.defaultNamePrefix`, and `TRACK_GROUP_NAME_PREFIX` keeps its export. Track names stay data literals (like `'SFX'`), pinned by ST13 and ST40.
- **R3 — sweep.** Every `ჯგუფი` token in the 10 test files changes; the track-name fixtures in tests are data and are not swept.
- **R6 — no split.** The sweep is a mechanical token replace, similar in size to round 140.

**Test strength:**
- ST22 loses its prefix exception (allowance → 0).
- ST13 drops to the one V-0.5 line.
- ST40 pins the prefix, numbering and route names.
- DS1–DS2 render the real route on the server.
- Mutations m77–m81 cover the prefix value, the literal coming back, a Georgian route name, a Georgian fallback name and the numbering separator.

**C checks behaviour, not only text:**
- TRACK-NAMES: headers, selection, the add-sound status and the meter title.
- GROUP-DEFAULT: Group 1/2, ungroup, a rename that frees the number, and Undo/Redo.
- GROUP-MIX-REG: the Mute label, the Undo title and a paired RMS drop of ≥ 20 dB.
- LAYOUT against the stored round-140 group-row baseline.

**Ableton:** the capture has only the §18.3 title. Live's default Group Track name is unconfirmed, and the task makes no Live claim.

## 4. Planning artifacts written
- `tasks/round-140.md` (exact copy) and `current-task.md` (round 141, V-0.4d).
- Backups: `b-round-140-{backlog.json,feature-status.md,b-next.json,current-task.md,regression-last.json,b-round-136-checkpoint-request.md,plan.md}-before`.
- `b-round-140-r141-grants.txt` (17 entries; the last 2 are new files).
- `b-round-140-r141-tree-sha256.txt` (944 entries; `sha256sum -c` OK).
- `b-round-140-r141-granted-start-sha256.txt` (15) and `b-round-140/r141-granted-start/` (OK).
- `b-round-140-r141-prefix-lines.txt` (191 sweep lines).
- `backlog.json` v133, with these changes:
  - round 140 result and ratified deviations; round 141 record;
  - V-0.4c done and V-0.4d dispatched, with `measurement_d29z106`, `rulings_d29z106`, forward constraints and glossary;
  - 2 findings closed, 4 added, 1 deferred Low, 1 architecture signal, R140-T;
  - `baseline_tree_at_round141`.
- `feature-status.md`: V-0.4c → მზადაა; V-0.4d → მუშავდება.
- `docs/technical/studio-real-workspace/plan.md`: D-29z106 block and ownership line.
- `b-round-136-checkpoint-request.md`: round-140 addendum appended (earlier text unchanged).
- `regression-last.json`: unchanged (due on or after 2026-10-27).

## 5. Request to root (bounded, non-blocking)
I am still requesting the strings-split / test-locator checkpoint from the read-only `frontend-architect`, per `store/.claude/references/architecture-checkpoint.md`. The request is `b-round-136-checkpoint-request.md` plus its addenda, now including ARCH-R140-STRINGS-TEST-SPLIT. Recommended timing: answer before V-0.5 ends, so any approved split runs as its own round right after V-0. V-0.4d/e are not delayed by it.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - VISUAL-A V-0.4d–e, V-0.5, V-1…V-3 and M1/M3/M4;
  - T12-ADVANCED;
  - the 198 deferred Lows;
  - the Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the regression due 2026-10-27 and the final full regression;
  - Saba's ABL-R/DUX-R answers;
  - the phase-2 go-ahead;
  - backend-only evidence.
- **Not BLOCKED:** nothing external is missing.

## 7. Commit readiness
Round 140 is published (`6ebbf3e`). Root may publish round 141 only after C PASS, the gate's verify and the independent review.
