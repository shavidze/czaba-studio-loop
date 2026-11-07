# B round 376 → 377 planning (2026-11-07)

**Decision: CONTINUE.** Round 377 = PERF-11c-iii-c1 close-out (`current-task.md`). D-29z1250…D-29z1253, backlog v342.

## Inputs read
- `context/active-summary.md`, `a-round-376.md` (STOP), `c-round-376.md`/`.json` (BLOCKED, 0 bugs, `browserVerified` false), `gates/gate-round-376.json` (skipped: C taskStatus BLOCKED; there is no published commit, so the baseline stays `6b11be7` + A's uncommitted round-376 tree), `tasks/round-376.md` (archived copy of the dispatched task, byte-equal), lessons 10/11/22/58.

## Backlog updates (only from evidence)
- Round 376 **not** accepted. No item moved to done. PERF-11c-iii-c1 stays in progress, because C's browser rows were incomplete (`browserVerified` false, V2 rule).
- New findings: A-R376-REVIEW-M1 (Medium, scheduled in 377); A-R376-REVIEW-M2 (Low, ruled, K5 tripwire); INFO-A376-TC10-DESCRIBE-TIMEOUT (closed); A-R376-REVIEW-L1/L2/L3 → `deferred_low_polish`.
- Architecture signal SIG-R376-THREE-ACTION-HOOKS → input to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (fourth echo). The request to root is repeated: a bounded `frontend-architect` checkpoint before PERF-11c-iii-d/e (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`).

## Rulings (L10)
1. **TC10:** A measured against the 5 s default. The test is inside a describe with `timeout: 15_000` (claims K3), and every time is 11–21 % of 15 s (K4). No STOP condition. The advisor first suggested a timeout grant; the file evidence superseded that suggestion.
2. **M1:** accepted. RB-LEAF4b was pre-run on a scratch copy of A's tree. Its mutant (`undo` deps + `history`) is red only on the new row, so the gap was real.
3. **M2:** Low; no transition API on the path (K5 = 0).

## Evidence (`b-round-376/`)
`sketch-v3-delta.patch.txt` (+ sha), `sketch-v3-files-sha256.txt`, `grants-377.txt`, `rbleaf4b-sketch.log`, `shuffle-sketch.log`, `covering-sketch-v3.log` (140/2201), `sketch-typecheck.log`, `sketch-biome.log`, `expect-counts-377.txt`, `mutants/run-mutant-377.sh`, `mutants/sketch-run/`, `claims-377.sh` + outputs (0 MISSING), `backlog-update.py`, and backups of backlog, b-next and feature-status. The scratch was removed after the sketch outputs were saved; the delta patch reproduces it.

## Not run by B
Perf and the browser leaf probe on v3. The delta is test-only, so the round-375 sketch numbers stand. C runs both on A's tree.

## Next
After C PASS, rounds 376 and 377 go to the gate as one stage. REGRESSION follows at the first planning on or after 2026-11-08, then PERF-11c-iii-c2.

## Consults
- Advisor: available. Consulted after orientation and before declaring done.
- Project agents: none needed. The delta is a single test row whose design follows the code-reviewer's own proposal.
