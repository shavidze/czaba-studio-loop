# B round 281 → 282 planning (2026-10-31)

**Advisor:** available and consulted three times: before the design, before writing the task, and before finishing. Its points were applied: the second long task was identified, the settled window was used, the worker chunk was checked for a circular pull-in (clean), the sketch was made byte-identical, the unit-test rulings were written, the ceiling-assert environment rule was added, and the perf-plan target was worded honestly. The final call led to pinning the exact MU-SYNC-FALLBACK mutation (`b-round-281/mu-sync-fallback.diff`) and to two checks: no stale PERF-2 line in `feature-status.md`, and ST51 skips `__tests__`.

**Consults** (read-only, told not to run processes during B's perf runs):
- `tech-lead`: layout, fallbacks, test plan, TS pitfalls, one round;
- `performance-optimizer`: worker vs yield vs lazy, measurement window, determinism.

The second consult made two false data claims ("perf-plan.md does not exist", "no export sha check"). They were not used and are recorded as INFO-B282-CONSULT-FALSE-CLAIMS.

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `c-round-281.json` | **PASS**: 15 rows, `browserVerified: true`, `realVerified: true`, 0 implementation bugs. 1 Low planning finding, C-R281-01. Gate rows were not claimed |
| `a-round-281.md` | done within the grants, code byte-identical to B's sketch, mutants gave their signals; code-reviewer 9/10 (2 Lows, info, Architecture note) |
| `gates/gate-round-281.json` | **published**, commit `000da42` on both remotes. This is the new baseline |
| `gates/round-281/review.md` | COMMIT OK, 9/10. Suggestions 1–4 Low, 5 info, plus 2 Architecture signals |
| env-status | store 200 (round 281) |
| `regression-last.json` | round 258, 2026-10-30. REGRESSION is due on/after 2026-11-02, so it is not due today |
| `tasks/round-281.md` | archived (a copy of the round-281 `current-task.md`; it did not exist before) |

## 2. Backlog changes (only from evidence)
**Done (D-29z658)**, by C round 281 PASS and gate 281 published:
- PERF-HARNESS-DIAG-281 → **done / მზადაა**;
- GATE279-S1 (Medium), B-R280-CLICK-LIVE-LANE-ID and A-R279-REVIEW-LANE-NULL → closed.

**Recorded (D-29z659, D-29z660):**
- **Lows → `deferred_low_polish`** (482 entries now): GATE281-S1, GATE281-S3, GATE281-S4, A-R281-REVIEW-SETTLED-GROUP and A-R281-REVIEW-STATUS-REREAD. S1 and STATUS-REREAD share a root cause; they are marked to be fixed together.
- **Folded into round 282:** GATE281-S2, one doc-169 sentence (doc 169 is granted anyway).
- **Info:** GATE281-S5 (the existing Biome `perf/**` gap).
- **Architecture signals (recorded, not scheduled):**
  - GATE281-ARCH-COLLECTION-STATE-ATTR: a `data-collection-state` attribute in place of text patterns;
  - GATE281-ARCH-DOC-TODO-CHANGELOG;
  - A-R281-ARCH-PAGE-READINESS (keep).
- **C-R281-01** closed by amending L29 in place: a doc-line reference inside a protection clause gets a tag. `lessons.md` stays at 59 lines.
- **New signals from planning:**
  - PERF2-FIRST-FRAME-LONGTASK (info; PERF-11/PERF-7 candidates);
  - PERF2-STEREO-COPY (Low, for PERF-5);
  - INFO-B282-CONSULT-FALSE-CLAIMS.
- **Data:** PERF-1A-TIMEOUT-HEADROOM. PERF-1a took 7.3–7.4 min in B's runs (49 %). ROOT-REQ-PERF-TIMEOUT stays open.

**Dispatched:** PERF-2 → round 282 (D-29z661…D-29z665).

**Also updated:**
- `decisions_log_b` D-29z658…D-29z665;
- STUDIO-PERFORMANCE: status, `consults_round_282`, PERF-2 `measured_d29z662` and `done_definition_d29z662`;
- `rounds` (281 done, 282 dispatched);
- `feature-status.md` (header, the round bullet, the STUDIO-PERFORMANCE row);
- `lessons.md` (L29, header);
- `b-next.json`.

**Backups:** `b-round-281/*-before-282.*`. **Script:** `b-round-281/backlog-update.py`. It ran once.

## 3. Pre-check (L23; everything in `b-round-281/`)
- **Attribution at HEAD.** On a production build, LoAF with script attribution (`loaf-head.json`):
  - the synth task is 363–367 ms (`MessagePort.onmessage`);
  - the first-frame task is 83–131 ms, with no script over 5 ms.
  - Node timing: composition 413 ms, impact 6 ms, rise 24 ms.
- **The sketch** (`sketch.diff`, six code files):
  - tsc rc 0; Biome clean after format;
  - the 4 existing covering test files pass (89 tests).
  - The built worker chunk is 1959 bytes with no client code.
- **Three-spec perf run (v1):**
  - 1b-i and 1b-ii pass;
  - 1a failed only on `load.commits` [5, 5, 6] and `load.components` [371, 371, 464]: the worker races the mp3 decode.
  - v2 makes both rows wallclock, and its PERF-1a run gave rc 0, `load.script-max` 42/49/63.
- **EQUIV** (`equiv-check-r282.py`), each with 0 problems:
  - 1a (v2) vs C round 281, with the new and reclassified rows;
  - 1b-i;
  - 1b-ii, with the bytes and used-ready rows named.
- **Mutant MU-SYNC-FALLBACK:** `assert failed load.script-max: measured median 375`.
- **Browser, HEAD vs sketch, both viewports:**
  - the WAV sha256 is identical (pulse `1fea093b…` = C's reference; all 7 synth sources `72228706…`);
  - the library states are identical (9 items, durations, Add, 96 wave bars, the status sequence).
- **Claims:** `claims.sh` → `claims-output-at-000da42.txt` (K1–K22, SW-A…SW-C). **Grants:** 10 paths. **Frozen:** 1139 files, `sha256sum -c` rc 0.

## 4. Rulings
| D-ID | Ruling |
|---|---|
| D-29z658 | round 281 closed (§2) |
| D-29z659 | gate-281 review and A notes (§2) |
| D-29z660 | C-R281-01 → L29 clause |
| D-29z661 | PERF-2 design: a worker with a sync fallback; impact and rise stay sync; no abort wiring; `ArrangementContext.tsx` and `demo-synth.ts` frozen; stereo-copy drop and peaks-in-worker deferred to PERF-5 |
| D-29z662 | the harness contract (`scriptMax`, 4 rows, the ceiling assert < 100, commits/components → wallclock); done = script-max < 100 and the synth task gone; the perf-plan row is not claimed as met (first-frame signal) |
| D-29z663 | code byte-identical to the sketch; the five EQUIV commands |
| D-29z664 | docs: new doc 211; doc 163 sections; doc 169 row + TODO bullet |
| D-29z665 | the outcome table |

## 5. Architecture checkpoint
No request this round.
- PERF-2 adds two small files beside the existing `export-wav.client`/`.worker` pattern and touches no shared owner: `ArrangementContext.tsx` is frozen.
- The harness signals are small. GATE281-ARCH-COLLECTION-STATE-ATTR would need an app change and stays a recorded proposal.
- ARCH-CHECKPOINT-SYS5-SOFT-DISABLED stays optional and non-blocking.
- PERF-8/PERF-10 (the context split) is the boundary where B should ask root for a bounded `frontend-architect` checkpoint on `ArrangementContext.tsx`, before dispatch.

## 6. Next
- **If C passes and the gate publishes:** PERF-2 is done. Round 283 = REGRESSION if planned on or after 2026-11-02 (it is due then), otherwise PERF-3, after the consults and re-measuring (scope addition: a Ctrl+wheel zoom baseline row).
- **After that:** PERF-COMMIT-RESCHEDULE, PERF-4 … per `execution_order_d29z645`. RETRO at round 290.

## 7. Commit readiness
- Rounds through 281 are published (`000da42`).
- Round 282 changes `app/**` (3 files + 1 test) and the perf harness. It becomes ready for the gate after C PASS, and the gate runs the full verify.
