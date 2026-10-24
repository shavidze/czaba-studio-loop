# B — Round 135 → 136 planning (D-29z101)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing, once before finishing).

## 1. Inputs read (as data)
- `context/active-summary.md` (headings and open findings only), `tasks/round-135.md` (round-135 task), `a-round-135.md` (reviewer Architecture note), `c-round-135.json` and the C row results.
- `gates/gate-round-135.json`: **published** at `70f1e4270028a8b46a734ae9647bbc0db7982244`, the same hash on both remotes. `gates/round-135/review.md`: COMMIT OK, 9/10.
- `env-status.json`: store 200. `regression-last.json`: 2026-10-24, round 122, so the next regression is due on or after 2026-10-27.
- `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`: **do not exist**.
- Strings-split checkpoint result: none in `gates/`, the loop folder or `store/.claude/references/`.
- Only specific IDs were looked up in `backlog.json`, `plan.md` and `feature-status.md`, by targeted read and grep.

## 2. Evidence → backlog (only from independent C and gate results)
| Item | Evidence | New status |
|---|---|---|
| V-0.3b | `c-round-135.json`: PASS, `browserVerified` = `realVerified` = true, every row passed at both viewports, `failed` and `inconclusive` empty; gate 135 published `70f1e42` | `c_pass_published` → feature-status **მზადაა** |
| GATE134-TEMPOROW-TITLE-MIXED | C TEMPO row (TR19 English in the browser) | closed |
| GATE134-DOC110-STATUS | C AN-REVIEW PASS (doc 110 l.4/132/136) | closed |
| C-R135-01 (Low) | `c-round-135.json` bugs[0] | `deferred_low_polish` (188). Not folded: its pin lives in `navigation-strings-ui`, outside the marker surface |
| Gate-135 finding 1 (doc 111 status) | `gates/round-135/review.md` | GATE135-DOC111-STATUS → folded into round 136 |
| Gate-135 finding 2 (mixed language) | same | GATE135-MIXED-LANGUAGE, accepted temporary state (V-0.3c/d) |
| Gate-135 finding 3 (Delete label-in-name) | same | GATE135-DELETE-LABEL-IN-NAME, info, pre-existing |
| C notesForB 1 and 2 | `c-round-135.json` | C-R135-NV17-SAME-TICK and C-R135-Z-MARGINS, both info notes about unchanged code, no task |
| Architecture note (gate + A reviewer) | Signal 3, `strings.ts` growth | `architecture_signals` ARCH-R135-STRINGS-GROWTH. This is a signal only and is **not scheduled** |

The gate rows (full vitest, build, verify, smoke) are taken from gate 135 (`verify.log`: 160 files / 2444 tests OK, build OK). C did not claim them.

## 3. Why V-0.3c now
- No Critical, High or Medium finding is open, and the regression round is not due. `tasks/round-135.md` §8 fixed the step: **PASS → V-0.3c, re-measured first.**
- **Re-measured at `70f1e42`:** 20 Georgian source lines (MarkerRow 16, MarkerMenu 4) plus 2 quote-only flag lines, and 23 pin lines in 4 test files. That fits one round. The round-133 fragment estimate (~84 in 15 files) was high again.
- **Rulings (D-29z101):**
  - **R1:** add one new area object, `studioMarkerStrings`.
  - **R2:** change «» to “” on the whole marker surface, including the flag aria-label and title and the `status-announcement-ui` selector. These are granted explicitly.
  - **R3:** use the `Ctrl+←` / `Ctrl+→` notation in the titles, the same as the aria-labels.
  - **R4:** the empty-name sentence is shared with the V-0.3d group rename, so it becomes a forward constraint.
- **Smallest honest choices recorded:**
  - "Marker", not "Locator": the English aria-labels already say marker, so this is a deliberate difference from Live.
  - MK8/MK9 name the playhead because `stepMarker` steps from `getLivePosition()`. Their shared fragment `No more markers` keeps the existing negative pin meaningful.
  - MK3 `Delete (Delete)` keeps the key in parentheses, the same pattern as MK1 `Rename (F2)`.
- **Test strength:**
  - The two negative pins move to English fragments, and mutations m40/m41 must show they still bite.
  - Six keys had no UI pin before, so they are covered in the new `marker-strings-ui.test.tsx`. No `it` is added to the frozen test files.
- **Ableton:** B re-read Live 12 §6.4 from the saved manual text (sha256 `2b9a3007…`). These points are confirmed: add at the insert marker or the start of the time selection, double-click plays, drag and arrow keys move, Delete deletes, Rename. The deliberate differences are listed in `current-task.md` §6.

## 4. Planning artifacts written
- `tasks/round-135.md`: exact copy of the round-135 `current-task.md` (sha256 `c8124336ee61f9d9…`, matched before overwrite).
- `current-task.md`: round 136.
- Backups taken before editing: `b-round-135-backlog.json-before`, `b-round-135-feature-status.md-before`, `b-round-135-plan.md-before`, `b-round-135-b-next.json-before`.
- `b-round-135-r136-grants.txt` (11 paths; 2 are new).
- `b-round-135-r136-tree-sha256.txt` (940 frozen; `sha256sum -c` OK).
- `b-round-135-r136-granted-start-sha256.txt` (9).
- `b-round-135/r136-granted-start/` (copies; `sha256sum -c` OK).
- `backlog.json` v128:
  - V-0.3b result;
  - the V-0.3c measurement and rulings;
  - the V-0.3d forward constraint;
  - glossary additions d29z101;
  - the C-R135-01 deferral;
  - the findings and the signal;
  - the round 135 and round 136 records.
- `feature-status.md`: V-0.3b → მზადაა, V-0.3c → მუშავდება.
- `docs/technical/studio-real-workspace/plan.md`: D-29z101 and its ownership line.

## 5. Request to root (non-blocking, repeated)
- **Strings-split checkpoint.** This is `b-round-130-checkpoint-request.md` addenda (e)–(g) and (h) of `b-round-134.md`. It still has no result after four plannings. The gate-134 and gate-135 reviewers and A's round-135 reviewer all recommend **one bounded read-only `frontend-architect` checkpoint after V-0.3d**, per `store/.claude/references/architecture-checkpoint.md`. The question it should answer:
  - keep `strings.ts` whole, or split it into `strings/<area>.ts` re-exported from `~/lib/arrangement/strings`;
  - whether to derive the `*_KEYS` lists in `strings.test.ts` from the expected maps;
  - acceptance: the ST tests pass byte-for-byte and the public object names stay the same.
- B will not schedule a split without root's result. V-0.3c and V-0.3d go ahead on the same import path.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - V-0.3c and V-0.3d, V-0.4, V-0.5, V-1…V-3, M1/M3/M4;
  - T12-ADVANCED;
  - the 188 deferred Lows (polish pass);
  - the Tech Lead manual checks;
  - SRW-21 `deferred_user`;
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the final full regression;
  - Saba's ABL-R and DUX-R answers;
  - the go-ahead for phase 2.
- **Not BLOCKED.** No external information, approval or credentials are missing for the next step.

## 7. Commit readiness
Round 135 is already published (`70f1e42`). Round 136 is ready for root to publish only after C PASS, the gate's verify and the independent review.
