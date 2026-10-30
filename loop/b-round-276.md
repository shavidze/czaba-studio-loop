# B round 276 → 277 planning (2026-10-30)

**Advisor:** available and consulted (before the approach and before finishing).

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `c-round-276.json` | **PASS**: 28 rows, `browserVerified: true`, `realVerified: true`. One half-row failed: V-HOVER-SOFT's cursor half (C-R276-01, Low, pre-existing). There is one more Low (C-R276-02). RT-FIX-276 PASS closes C-R275-01/02 |
| `gates/gate-round-276.json` | **failed**, `verify exit 1`. The full vitest run had 3 failing tests in 2 files: NS1 and NS6 in `navigation-strings-ui`, TC9 in `transport-centre-ui`. Lint had warnings only, and typecheck passed. Nothing was published, so the baseline stays `a4c0e24` plus A's uncommitted round-276 tree |
| `a-round-276.md` | A raised a STOP on the cursor (needs a B ruling). A's reviewer found a Low (DELETE-NAME) and wrote an Architecture note (guard in helper) |
| env-status | store 200 |
| regression-last.json | round 258, 2026-10-30. The next regression is due on or after 2026-11-02, so it is not due now |

## 2. Rulings (D-29z618…D-29z623)
- **D-29z618: round 277 = GATE276 test-only fix-up.**
  - B pre-applied it on a scratch copy (`b-round-276/sketch.diff`). The two files pass 18/18 (`sketch-vitest.log`) and Biome is clean.
  - Mutant N1 (no `aria-disabled`) makes NS1, NS6 and TC9 red. Mutant N2 (old Split title) makes NS1 red.
  - Every replacement is equal or stronger: NS1 keeps the old literal in the clip-selected state.
- **D-29z619: C-R276-01.**
  - Option (b), `aria-disabled:cursor-not-allowed!`, goes into stage 2 (round 278).
  - The app-wide form becomes a new deferred Low, B-R276-CURSOR-UNLAYERED-GLOBAL.
  - L29 premise gap: B never probed HEAD's cursor.
- **D-29z620: C-R276-02 is kept** (intended, no data loss). Stage 2 adds it as an explicit row.
- **D-29z621: DELETE-NAME and the guard-in-helper note.**
  - A-R276-REVIEW-DELETE-NAME goes into stage 2.
  - A-R276-ARCH-GUARD-IN-HELPER is an architecture signal, ruled at the stage-2 planning, where the helper moves anyway.
- **D-29z622: L23 amended.** The sweep must cover every assertion form, filter by accessible name, and grep the old literals.
  - Root cause: round 276's SW1 omitted the `hasAttribute`/`toHaveProperty` forms and filtered by helper ids.
  - The round-229 list had `navigation-strings-ui` in it, and the narrower filter dropped it.
  - The lesson count stays at 59 lines.
- **D-29z623:** the outcome table (task §9).
- **Sweep note:** SW-B still gives 6 hits after the edit. NS1 deliberately keeps the old Split literal in the clip-selected state, so the `navigation-strings-ui` hits move to l.227 and l.229, and NS6's read moves to l.434. B checked this on the sketch.

## 3. Backlog changes (only from evidence)
- **Round entries:** round 276 is recorded as C PASS / gate FAIL; round 277 as dispatched.
- **Open findings:**
  - C-R275-01/02 are closed (C RT-FIX-276 PASS).
  - New entries: GATE276-T1 (Medium, open → round 277), C-R276-01, C-R276-02 and A-R276-REVIEW-DELETE-NAME.
- **`deferred_low_polish`:** + B-R276-CURSOR-UNLAYERED-GLOBAL (467 in total).
- **`architecture_signals`:** + A-R276-ARCH-GUARD-IN-HELPER.
- **SYS-5:** status and the stage-2 additions updated. **SYS-5 is not მზადაა:** stage 1 is unpublished, and stage 2 has not started.

## 4. Artifacts
`tasks/round-276.md` (an archive copy of the round-276 task), `current-task.md` (round 277), `b-round-276-r277-grants.txt`, `b-round-276-r277-tree-sha256.txt` (1136 files) and `b-round-276/`:
- the sketch, the vitest/mutant/Biome logs and `claims.sh` with its output;
- the sweeps and the planning copies;
- the state backups (`*-before-277.*`).

## 5. Architecture checkpoint
No new checkpoint request. The earlier addenda (`b-round-272-checkpoint-request.md`, `b-round-273/274-checkpoint-addendum.md`) are still unanswered and non-blocking. The guard-in-helper note fits the stage-2 helper move. It does not justify a separate checkpoint.

## 6. Commit readiness
Not ready yet. Rounds 276 + 277 become ready for the root gate after C PASS on round 277. That would be SYS-5 stage 1, not a release.
