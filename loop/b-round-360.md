# B round 360 → 361 planning

**Decision: CONTINUE.** Round 361 is **PERF-10b-i**: the active track (`activeTrackId`) moves from provider state into the existing selection store. A clip click that changes the active lane drops from 83 to 42 rendered components. Two click rows become asserts, and the three stale budget notes from C-R360-NOTE-STALE are fixed in the same patch. The task is in `current-task.md`.
- The round-360 task is archived as `tasks/round-360.md`, a byte-equal copy (`cmp` OK). Nothing was deleted.
- Advisor: available, and consulted after orientation and before declaring done.

## 1. Inputs read
- `context/active-summary.md`, the old `current-task.md` (now `tasks/round-360.md`), `a-round-360.md`, `c-round-360.md` and `c-round-360.json`.
- `gates/gate-round-360.json`: status **published**, commit `93ea6c1`. That is the round-361 baseline; `git log` agrees, and the tree is clean. (`context/head-sha.txt` still shows the pre-gate `a977b97`.)
- `regression-last.json`: 2026-11-05, so the next regression is due on or after 2026-11-08. Today is 2026-11-06: not due.
- `lessons.md` (the B part, plus L37, L38 and L58). No lesson was added; the file stays at 60 lines.
- Backlog ids were looked up by id only: PERF-10 `split_d29z1153` and `required_rows_d29z880`, C-R320-01, SIG-R322 (D-29z891, archive), SIG-R360, the architecture checkpoint request.
- Source was read only: `selection-store.ts`, `playback-store.ts`, `ArrangementContext.tsx` (`activeTrackId` sites), `ArrangementLane.tsx`, `ArrangementLibraryPreview.tsx`, `StudioWorkspace.tsx` (group header wrapper, edge navigation), the probe helper, `selection-store.test.tsx`, UC7 in `track-group-collapse-ui.test.tsx`, `clipboard.ts`, `perf/budgets.interactions.json` and the harness's active-lane reader.

## 2. Round 360 closed from C's evidence (D-29z1167)
- **PASS**, `browserVerified` and `realVerified` true: PERF 93/93 asserted, 0 NEW, 181 deterministic rows equal to C359; PERF-LIB 40/40; C's own mutant MU-C (the Ruler subscribes to `isPlaying`) is red at 30 > 28 on exactly the two predicted rows; VIDEO-FAIL-STOP-1/2/3 and G360-AUTH PASS.
- Blocked only: the fake-bearer 403 check (the mock backend is down; the request fails closed with 500). Not a PASS and not an A fault.
- Gate 360 published `93ea6c1` on both remotes.

## 3. Round-360 notes routed (D-29z1168)
- **C-R360-NOTE-STALE** (Low, origin B spec) is fixed now, not deferred: round 361 owns `perf/budgets.interactions.json`, and the 2026-10-23 rule allows an early Low fix when the round owns the code. A's review Lows 1–2 are merged into it. It closes on C PASS.
- Info only: the 0-commit side of `== 1` (TL-R360-3); the VFS-v2 cold first attempt; the 1 px / 11 ms FOLLOW jitter.

## 4. PERF-10b split and round-361 evidence (D-29z1169, D-29z1170), all in `b-round-360/`
- **Split:** 10b-i = the active-track store and the click budgets (this round). 10b-ii = the Transport play leaf (≤ 20), B-R356-PLAYBACK-SETTER, the C-R320-01 render-budget row and the GATE320-S3 record row. No 13th store, so the ARCH-R338 trigger does not fire again.
- **Premise measured first (L37):** C360 at HEAD has 83 components for a cross-lane click against 15 for a same-lane click.
- **Consults** (`sketch-review.md`, which opens with the sketch's sha256): `tech-lead` TL-R361-1…4 and `performance-optimizer` PO-R361-1…4. All adopted or ruled; no Medium+ is left open. TL-R361-4(c) (nothing reconciles the active track if a lane disappears) was checked against the source: no track-removal path exists at `93ea6c1`, so it is recorded as an info signal for STEM-LANES (`TL-R361-ACTIVE-TRACK-DANGLING`), not as a bug.
- **Sketch** (`sketch.patch.txt`, 9 app files; `budgets.patch.txt`): typecheck rc 0; lint 205 warnings, equal to HEAD; full suite 248 files and 3639 tests, rc 0; SS8–SS11 11/11.
- **Production perf, alone, in sequence** (`perf-summary.txt`):
  - Sketch with `record` budgets: rc 0, 93/93, 0 NEW. Only `interact.click.components` and its `.6x` copy differ from C360: 83 → 42 (×3 each). `click.commits` stays 2.
  - MU-1 (the workspace subscribes at its top): 82.
  - The same two runs with the asserting budgets file: the sketch passes 95/95 with 0 NEW; MU-1 fails only `interact.click.components` (82 > 42).
- **jsdom mutants:** MU-2…MU-5 are each red on exactly SS8…SS11, and MU-6 is red on UC7 only.
- **Added after the advisor review:**
  - MU-7 (a delayed status write per active-track change) is the red-proof for `click.commits <= 2`: with the asserting budgets, commits 3 and components 113 are red, as predicted; 20 further drag rows also go red (recorded).
  - perf-lib 40/40 and the full suite on the final sketch: 248 files, 3643 tests, rc 0.
  - The three new browser rows were run at HEAD `93ea6c1` on :5173 (`lane-probe.mjs`; `lane-probe/head-1440x900.json`, `head-1280x720.json`). The recipes work: the active lane follows each click, Enter adds on Stems, the collapsed group shows `data-contains-active="true"` and loses it on a Music click, and paste lands on SFX. C compares against these values.
- **Claims:** `claims-361.sh` (K1–K18). The planning output (on HEAD) and the sketch output are saved.

## 5. Order (D-29z1171)
1. Round 361: PERF-10b-i.
2. REGRESSION, at any planning on or after 2026-11-08.
3. PERF-10b-ii.
4. PERF-9, then PERF-11…15, SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries.

RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE. The architecture checkpoint request is still unanswered and does not block.

## 6. Files written by B
- `tasks/round-360.md` (a copy) and `current-task.md` (round 361).
- `b-round-360.md` and `b-next.json` (the previous one is backed up as `b-round-360/b-next-before-361.json`).
- `backlog.json`, v323 → v324: `update-backlog.py`, then the one-off reclassification recorded in `update-backlog-fix-dangling.py`, then `update-backlog-addendum.py` (MU-7, the HEAD browser runs and the final-sketch checks into D-29z1170). The backup is `b-round-360/backlog-before-361.json`.
- `feature-status.md` (`update-feature-status.py`). The backup is `b-round-360/feature-status-before-361.md`.
- `b-round-360/`: checkpoint, sketch and budgets patches, the SS rows, mutants and their logs, perf runs and summary, the sketch review, and the claims.

B did not modify `store/`: `git status` shows 0 entries. All sketch and mutant work ran in `/home/runner/b360-scratch`. B started no long-running server.

## 7. Readiness for commit
- Round 360 is already published (`93ea6c1`).
- Round 361 is not ready. Root publishes only after C PASS on round 361 and the gate.
