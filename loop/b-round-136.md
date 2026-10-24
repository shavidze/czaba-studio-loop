# B — Round 136 → 137 planning (D-29z102)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing; once before finishing).

## 1. Inputs read (as data)
- `context/active-summary.md` (open findings and other open items), `tasks/round-136.md` (the round-136 task), `a-round-136.md`, `c-round-136.md`, `c-round-136.json`.
- `gates/gate-round-136.json`: **published** at `7d9fed0f434b506b42e0d3bc86346202a28273f2`, the same hash on both remotes. `gates/round-136/review.md`: COMMIT OK, 9/10, 3 findings.
- `env-status.json`: store 200. `regression-last.json`: 2026-10-24, round 122, so the next regression is due on or after 2026-10-27.
- `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`: **do not exist**.
- Strings-split checkpoint result: none.
- `root-pre-push-review.md` and `publication-checkpoint.json`: both date from 2026-10-07 (round 3, commit `375ee3b`). Their findings were triaged in earlier rounds (CHECKPOINT-OCT13-REVIEW-TRIAGE and the round-3/4 follow-ups), and nothing newer is in them. The one item still open from them is the inherited purchased-loader limitation, which stays with SRW-21 `deferred_user`. There is no new follow-up for this round.
- Only specific IDs were looked up in `backlog.json`, `plan.md` and `feature-status.md`.
- B re-measured the V-0.3d source and pins with grep at `7d9fed0`.

## 2. Evidence → backlog (only from independent C and gate results)
| Item | Evidence | New status |
|---|---|---|
| V-0.3c | `c-round-136.json`: PASS. `browserVerified` = `realVerified` = true. Every row passed (the browser rows at both viewports); `failed`, `inconclusive` and `bugs` are empty. Gate 136 published `7d9fed0` | `c_pass_published` → feature-status **მზადაა** |
| GATE135-DOC111-STATUS | C AN-REVIEW PASS (doc 111 l.4/146, l.150 deleted) | closed |
| GATE135-MIXED-LANGUAGE | C GEO-COUNT 0 on the marker surface | marker part closed; the rest moves with V-0.3d / V-0.4 / V-0.5 |
| C notesForB 1, 2, 6 | `c-round-136.json` | **C-R136-NAV-TASK-TEXT** (info). The corrected V-0.3c expectations are written into the backlog stage entry (`corrected_expectations_c136`) and into round 137 REG-136, so the regression round does not hit the same wall |
| C notesForB 2 (silent drag refusal), 3 (stale edge status) | same | C-R136-DRAG-REFUSAL-SILENT and C-R136-STALE-EDGE-STATUS. Both are info notes about unchanged code; not scheduled |
| Gate-136 finding 1 (doc 112 status) | `gates/round-136/review.md` | GATE136-DOC112-STATUS (Low), folded into round 137 |
| Gate-136 finding 2 (marker local aliases) | same | GATE136-MARKER-ALIASES (info); question 3 of the checkpoint |
| Gate-136 finding 3 (group rename) | same | already the V-0.3d forward constraint (D-29z101 R4) → WS8/WS9 |
| Architecture note (gate + A's reviewer) | Signal 3, `strings.ts` growth | `architecture_signals` ARCH-R136-STRINGS-GROWTH (signal) + a bounded checkpoint request (§5) |

C did not claim the gate rows (full vitest, build, verify, smoke). They are taken from gate 136: `verify.log` shows 161 files / 2450 tests OK and the build OK. No new Low appeared, so `deferred_low_polish` stays at 188.

## 3. Why V-0.3d now
- No Critical, High or Medium finding is open, and the regression round is not due. `tasks/round-136.md` §8 fixed the step: **PASS → V-0.3d, re-measured first.**
- **Re-measured at `7d9fed0`:**
  - Source: StudioWorkspace has 23 Georgian lines, exactly the ST25 list, and `waveform-zoom.ts` has 1.
  - Pins: 23 lines in 7 files, plus ST25. `e2e/` has 0.
  - That fits one round. The round-133 estimate (~83 lines in 34 files) was high again, because most fragment hits are V-0.4/V-0.5 copy. Those false matches are listed in the task's §0.
- **Rulings (D-29z102):**
  - **R1:** the l.325 selector stays until V-0.4. It matches the ArrangementLane l.697 label, which is pinned in 9 files. The honest guard is ST33: exactly that one line, and 0 `«»`.
  - **R2:** each text goes to its area object; there are two new objects, Envelope and Workspace.
  - **R3:** group `renameEmpty` must give the same output as the MK12 marker sentence, and ST33 asserts the equality.
  - **R4:** the mixed state for one round (lane overlay, dock buttons) is named. "compact view" becomes a forward constraint for V-0.5.
- **Smallest honest choices recorded:**
  - "Workspace" for `სამუშაო სივრცე`.
  - "Time selection" (the Live term) for the readout.
  - `studioEditStrings.allTracks` is reused, so no duplicate key is made.
  - Waveform Zoom formatters take the already rounded percent, so the leaf rule holds.
  - `waveform-zoom.ts` imports `./strings`, so there is no cycle.
- **Test strength:**
  - The pins stay hand-written English with the same matchers.
  - The two keys that had no UI pin get WSU1–WSU2.
  - Mutations m45–m52 include the ternary swap and the drift from the marker sentence.
  - C checks real behaviour, not just text: the lane drag with Shift, the four video expand/return paths, the group rename with Undo, an Envelope point, the Delete gap, and the Waveform Zoom output tap within ±0.5 dB (view only).
- **Ableton:** "time selection" (§6) and clip envelopes (§3.19, §26.6.2) are confirmed terms. The `Env`/A toggle, F2 and Waveform Zoom are deliberate CZABA choices. The Shift time-lock is marked unconfirmed in Live.

## 4. Planning artifacts written
- `tasks/round-136.md`: exact copy of the round-136 `current-task.md` (sha256 `9068d99e7c9798f5…`, matched before the overwrite).
- `current-task.md`: round 137.
- Backups taken before editing: `b-round-136-backlog.json-before`, `b-round-136-feature-status.md-before`, `b-round-136-plan.md-before`, `b-round-136-b-next.json-before`, `b-round-136-current-task.md-before`.
- `b-round-136-r137-grants.txt` (14 paths; 2 are new).
- `b-round-136-r137-tree-sha256.txt` (939 frozen; `sha256sum -c` OK).
- `b-round-136-r137-granted-start-sha256.txt` (12).
- `b-round-136/r137-granted-start/` (copies; `sha256sum -c` OK).
- `backlog.json` v129:
  - the V-0.3c result and its corrected expectations;
  - the V-0.3d measurement, rulings and status;
  - the forward constraints for V-0.4/V-0.5;
  - the glossary additions d29z102;
  - the findings and the signal;
  - the round-136 and round-137 records.
- `feature-status.md`: V-0.3c → მზადაა, V-0.3d → მუშავდება, and the GATE128-S1 queue row.
- `docs/technical/studio-real-workspace/plan.md`: D-29z102 and its ownership line.
- `b-round-136-checkpoint-request.md` (§5).

## 5. Request to root (bounded, non-blocking)
- **Strings-split checkpoint at the V-0.3 boundary:** `b-round-136-checkpoint-request.md`.
  - Three questions: split `strings.ts` behind a barrel, the shape of the test maps, and the local aliases.
  - Run it with the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`, after C round 137 PASS and before V-0.4 is planned.
  - It replaces the earlier open addenda (e)–(h).
- B will not schedule a split without root's result. V-0.4 goes ahead on the same import path if there is still no answer.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - V-0.3d, V-0.4, V-0.5, V-1…V-3, M1/M3/M4;
  - T12-ADVANCED;
  - the 188 deferred Lows (polish pass);
  - the Tech Lead manual checks;
  - SRW-21 `deferred_user`;
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the regression due 2026-10-27 and the final full regression;
  - Saba's ABL-R and DUX-R answers;
  - the go-ahead for phase 2.
- **Not BLOCKED.** No external information, approval or credentials are missing for the next step.

## 7. Commit readiness
Round 136 is already published (`7d9fed0`). Round 137 is ready for root to publish only after C PASS, the gate's verify and the independent review.
