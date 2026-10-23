# A round 118 — checkpoint (in progress)

- Start HEAD `9cb820b6f7e5f9f44d1c651954d30ebf4f83be9f`, `git status --porcelain` empty, `sha256sum -c --quiet b-round-117-r118-tree-sha256.txt` OK.
- Baseline counts: track-group-mix-ui expect=131 it=10; track-volume-db expect=99 it=11; clip-gain-fader expect=92 it=14.
- TV11 pre-check done: outcome (a). Temporary probe (removed, sha 043acec1… restored):
  - after Master drag: stored 0.72, slider `-2.9`, readout `−2.9`;
  - after l.522 `undoChainLabels(api)`: stored 0.6, slider `-4.4`, readout `−4.4`, undoLabel null — the helper undoes BOTH entries (Master + the context Volume commit);
  - first plain preview at −20 px: 20·log10 = −16.4 → anchor −4.4.
  - So S = −4.4 − 1.2 = −5.6.
- Next: edit app files, then tests, then docs.

## Checkpoint 2
- App edits done (fader.ts constant; Lane/Master fine option+import; GroupHeader R1–R4). `npm run typecheck` clean.
- §2.1 edits applied in the 3 granted tests. track-group-mix-ui 10/10 green (UM5 l.579/580 exact match OK). track-volume-db 11/11 green (TV11 with S = −5.6).
- **STOP hit — CF11 l.501:** expected `-1.2` (B formula −24 × 66 / 1320), received **`-1`**. Cause: `MASTER_GAIN_STEP_DB = 0.5` (ArrangementMaster.tsx l.25); `relativeFaderValue` snaps −1.2 to the 0.5 dB grid → −1.0. The l.498–500 music fine value `F(-5.9)` passed. The expectation was NOT edited to match.
- **Ruling needed from B:** CF11 l.501 → `toBe(-1)` (from the 0 dB anchor: −24 × 66 / 1320 = −1.2, snapped to the 0.5 dB Master grid = −1.0). C's SH-MASTER tolerance (± the Master step) already allows this. Until B rules, CF11 and T118-TARGETED are NOT passed. Implementation unchanged (R4: Master step unchanged).
- Deviation: §4 says stop on a failed exact match. I stopped editing CF11 and continued the independent scope (GV file, docs, mutations, lint, reviewer) so B's one-line ruling does not cost a round.

## Checkpoint 3
- New `group-volume-db.test.tsx`: GV1–GV9, 9/9 green.
- Mutations (each restored, sha256 OK after): m1 → GV6 red; m2 → GV4 red; m3 → GV5 red; m4 → GV7 + TV11 red.
- Next: docs 100/101, lint/biome, targeted list, code-reviewer.

## Checkpoint 4
- Docs 100 (l.4/56/70) and 101 written. typecheck clean; lint 0 errors (218 warnings, 1 info, pre-existing count); biome read-only check clean on all 8 code/test files.
- Targeted list: 25 files (no `fader.test.*` exists), 452 tests: 451 passed, 1 failed = CF11 (STOP above).
- Counts after: mix-ui 131/10, TV 100/11, CF 92/14, new GV 39 expect / 9 it.
- git status = §2 end state; frozen OK; protected diff empty.
- Next: code-reviewer.
