# B — Round 139 → 140 planning (D-29z105)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing; once before finishing).

## 1. Inputs read (as data)
- `context/active-summary.md`. `tasks/round-139.md` is an exact copy of the round-139 `current-task.md`, archived this run (sha256 `6649610b…`; no earlier archive existed). Also read `a-round-139.md`, `c-round-139.md` and `c-round-139.json`.
- `gates/gate-round-139.json`: **published** `3f2c187118ee4e3a1a3f71251fbbc05bf00a711e`, with the same hash on both remotes. This is the round-140 baseline (HEAD; the tree is clean). `gates/round-139/review.md`: COMMIT OK, 9/10, verify 164 files / 2470 tests, build OK. It lists 3 suggestions, 1 note and an Architecture note.
- `env-status.json`: store 200.
- `regression-last.json`: 2026-10-24 (round 122). The next regression is due on or after 2026-10-27, so not now.
- `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` **do not exist**. There is no strings-split checkpoint result yet.
- `backlog.json`, `plan.md` and `feature-status.md`: I looked up only specific IDs.
- I re-measured the V-0.4c source and pins with grep at `3f2c187`.

## 2. Evidence → backlog (only independent C and gate results)
| Item | Evidence | New status |
|---|---|---|
| V-0.4b | `c-round-139.json`: PASS, `browserVerified` = `realVerified` = true, all browser rows at both viewports. The `failed` entry is the pre-existing C-R139-01. Inconclusive: not-ready ghost (synthetic only) and the audio-note error state (unit only). Gate 139 published `3f2c187` | `c_pass_published` → **მზადაა** |
| GATE130-S1, GATE137-SELECTED-CLIP-HALF-MOVED, GATE138-DOC114-STATUS, C-R138-01 | C LIBRARY-GHOST, SELECTED-CLIP and AN-REVIEW | closed in `open_findings`, with the evidence cited |
| C-R139-01 (Low) | Same as INFO-R64-BLOCKED-NO-STATUS: with dropEffect none, no drop event fires. **The round-139 row expectation was my error**, not an A defect | `deferred_low_polish`, kept as a duplicate pointer; INFO-R64 annotated |
| C-R139-02 (Low, pre-existing) | `ghostprobe-*.json` | `deferred_low_polish` + Tech Lead check R139-T |
| Gate-139 #2, #4 (docs 113/115) | review.md | folded into round 140 |
| Gate-139 #3 (`videoEmptyPlaceholder`) | review.md | `deferred_low_polish` (Lane is not granted) |
| Gate-139 #1 + Architecture note, A's note | review.md, a-round-139.md | ARCH-R139-TRACK-NAME-TESTID signal + checkpoint addendum (not a task) |
| C notesForB (track fold compact, group fold 0 clips, video density) | c-round-139.json | harness notes in round-140 §5 |
| G139-3 fake-Bearer 403 | BLOCKED | open backend evidence |

`deferred_low_polish`: 194 → 197. No Critical, High or Medium finding is open.

## 3. Why V-0.4c now
`tasks/round-139.md` §8 fixed this step: if C passes, the next stage is V-0.4c, re-measured first. The regression is not due, there are no decision files and there is no checkpoint result.

**Measured at `3f2c187`:**
- Source lines with Georgian:
  - Envelope: 10
  - GroupHeader: 10
  - TrackMeter: 2
  - Master: 2
  - `e2e/`: 0
- Pins: 30 lines in 6 files. The advisor flagged that my first regex grep for `(ჯგუფი)` was misleading. A literal `-F` grep, plus prefix and role-name matcher checks, confirmed that `^Volume — ${name}`, `aria-label^="Volume — "` and `Mute — (track)` keep matching. `Mute — ჯგუფი 1` is an Undo label built from default-name data (V-0.4d). StudioWorkspace finds groups by testid.

**Rulings:**
- **R1 objects.** The envelope keys go into the existing `studioClipEnvelopeStrings` (one object per feature). New objects: `studioGroupHeaderStrings` and `studioMeterStrings`.
- **R2 reuse.** This applies the D-29z104 forward constraints plus `historyUnchanged('Envelope')` and `seconds()`.
- **R3 branches in the caller.** The `1 clip` / `{n} clips` choice is one of them. Groups with one clip exist, and Georgian had no plural.
- **R4 terminology.** "point" keeps the existing CZABA English; Live's "breakpoint" is a deliberate difference. `Group Tracks` / `Ungroup Tracks` match the existing Undo labels. `overload (Clip)` is lowercase after a dash.

**Test strength:**
- Pins keep their matchers. Six previously unpinned texts get HM1–HM6.
- Mutations m69–m76 cover:
  - the group role word (role-regex files stop finding buttons);
  - the inverted plural branch;
  - a copied no-change literal;
  - the unit built inline;
  - the swapped meter and Master branches;
  - a Solo title literal;
  - a Georgian letter (scan).

**C checks behaviour, not only text:**
- Envelope: add, move, delete and no-change, with Undo titles, plus a paired RMS drop of ≥ 6 dB.
- Group: create, fold (0 clips), F2 rename input, and Mute/Solo with paired RMS of ≥ 20 dB, plus additive Solo.
- Meter and Master: the real over-state from the default demo; the click clears it with no history entry.
- If a track cannot honestly be driven over 0 dBFS, the track-over row is inconclusive.

**Ableton:** the saved capture has only the TOC titles §18.3, §26.6.1 and §38.3 (the CPU overload indicator). The task makes no Live behaviour claims.

## 4. Planning artifacts written
- `tasks/round-139.md` (exact copy) and `current-task.md` (round 140, V-0.4c).
- Backups: `b-round-139-{backlog.json,feature-status.md,b-next.json,current-task.md,regression-last.json,b-round-136-checkpoint-request.md,plan.md}-before`.
- `b-round-139-r140-grants.txt` (16 entries; 2 new).
- `b-round-139-r140-tree-sha256.txt` (943 entries; `sha256sum -c` OK).
- `b-round-139-r140-granted-start-sha256.txt` (14) and `b-round-139/r140-granted-start/` (OK).
- `backlog.json` v132:
  - V-0.4b done, V-0.4c dispatched;
  - `measurement_d29z105`, `rulings_d29z105`, glossary d29z105 and forward constraints;
  - round 139 result and the round 140 record;
  - `baseline_tree_at_round140`;
  - 3 deferred Lows, 4 findings closed and 4 added, 1 architecture signal and Tech Lead R139-T.
- `feature-status.md`: V-0.4b → მზადაა; V-0.4c → მუშავდება.
- `docs/technical/studio-real-workspace/plan.md`: D-29z105 decision block + ownership line.
- `b-round-136-checkpoint-request.md`: round-139 addendum (earlier text unchanged).
- `regression-last.json`: unchanged (due on or after 2026-10-27).

## 5. Request to root (bounded, non-blocking)
The strings-split / test-locator checkpoint (`b-round-136-checkpoint-request.md` + addenda, now including the `data-testid="arrangement-track-name"` proposal) is still requested from the read-only `frontend-architect`, per `store/.claude/references/architecture-checkpoint.md`. The independent V-0.4 stages are not delayed by it.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE:**
  - VISUAL-A stages: V-0.4c–e, V-0.5, V-1…V-3, M1/M3/M4;
  - T12-ADVANCED;
  - the 197 deferred Lows;
  - the Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the regression due 2026-10-27 and the final full regression;
  - Saba's ABL-R/DUX-R answers;
  - the phase-2 go-ahead;
  - backend-only evidence.
- **Not BLOCKED:** nothing external is missing.

## 7. Commit readiness
Round 139 is published (`3f2c187`). Round 140 is ready for root to publish only after C PASS, the gate's verify and the independent review.
