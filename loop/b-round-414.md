# B round 414 → 415 planning (2026-11-08)

**Decision:** CONTINUE. **Next:** round 415 = SYS-R388-FAKE-WEB-AUDIO-HELPER, a test-only round (D-29z1441…D-29z1443).
- **Advisor:** used after orientation (bookkeeping order, apply-schedule-rollback ruling, no duplicate of the workspace helper, clock stays, browser rows).
- **Consult:** `tech-lead` once: APPROVE WITH CHANGES (aligned return names; per-suite clock lead; `captureFrames`/`metered` default off; one reset of every field). All applied before the sha was taken.
- **Reference-first, `product-designer`, screen budget:** N/A (test-only, no user-visible change).

## 1. Inputs, independently checked
- **C round 414: PASS** (`c-round-414.json`): 8 rows passed, `browserVerified`/`realVerified` true, 0 bugs. `node --test` 83/83; the mutant summary equals B's (13 red, 1 equivalent). BLOCKED only: the fake-bearer path (backend unavailable in the cloud). L57 check OK.
- **A round 414:** no STOP; A1–A7 passed; reviewer 0 Medium+, two doc Lows fixed in the doc, two note-only Lows.
- **Gate 414:** `published`, commit `5be9294`, both remotes. It is the round-415 baseline [K1, K11]. `context/head-sha.txt` still shows `dc536a6` (the pre-gate snapshot); `git rev-parse HEAD` is `5be9294`.
- **Archive:** `tasks/round-414.md` is a byte copy of the round-414 task [K15]. Backups of every file B edits are in `b-round-414/*-before-415.*`.

## 2. Backlog changes from that evidence (version 390, `b-round-414/update-backlog.py`)
- **SYS-R2-FAKE-FIDELITY done** (D-29z1441). Closed: C-R311-01, A-R311-REVIEW-L4, GATE311-L1, A-R309-REVIEW-TEST-GAPS.
- **New Lows → `deferred_low_polish`:** A-R414-REVIEW-PR20-LABEL, GATE414-S1-FLAG-COMBINATION, GATE414-S2-PR19-PR20-LABELS. Recorded info: GATE414-I3-I5. A-R414-DOC-DELTA-NOT-REREVIEWED closed (gate reviewer read doc 266; C row 7 PASS).
- **Unchanged:** B-R414-RANGE-UNIT-CASE and B-R414-HEAD-RANGE-206 (deferred); ROOT-REQ-VERIFY-WORKER-TESTS open (gate 414 still did not run the worker tests).
- **Architecture notes are signals, not tasks:** SIG-R414-R2-FAKE-SCENARIO (A's reviewer + gate reviewer: one R2 object factory / scenario descriptor in `workers/r2-proxy.test.mjs`); SIG-R415-WORKSPACE-ENV-CONVERGENCE (tech-lead).
- `feature-status.md`: SYS-R2-FAKE-FIDELITY → **მზადაა** (browser rows ran: `browserVerified` true); round 415 → მუშავდება.

## 3. Round 415 design (D-29z1442)
- **Scope:** new `helpers/fake-web-audio.ts` + migrate `schedule-failure-ui`, `master-hold-tick`, `decoded-buffer-eviction-ui`. Every `it(...)` block byte-identical to HEAD (49 rows; hash check `it-bodies.py`).
- **Excluded with reason:** `apply-schedule-rollback.test.ts` (typed `ScheduleAudioContext<string>` recording fake; AR1–AR5 meaning would change). This differs from SIG-R388's four-file list; recorded as a ruling, not a scope cut of a user feature.
- **Not touched:** `createWorkspaceTestEnvironment` (25 suites) — convergence is a signal. Wall-clock `currentTime` stays → A-R388-REVIEW-L4 handed to SYS-CLOCK-DETERMINISM (added to its `closes`).
- **Owned-file Lows stay deferred:** A-R388-REVIEW-L1/L2 (ruling 8: the byte-identical `it()` contract wins). No pending root patches (no `cloud/root-commits/`). Lint 205 warnings / 1 info was measured on the sketch scratch (L58).
- **Closes on C PASS:** A-R388-REVIEW-L3 (the helper asserts `window.setInterval` is the stub).
- **Sketch** `b-round-414/sketch-415.patch.txt` (sha `2d04d6eb73025527…`, 4 files, +213/−370), `git apply --check` clean on `5be9294`. On B's committed scratch: typecheck rc 0, Biome rc 0 (no fixes), 4 files 54/54 (same as HEAD), it-body hashes equal HEAD.
- **Mutants** (`b-round-414/mutants/summary.txt`): 8/8 helper mutants red on the expected rows; 3 green by design (clock lead not load-bearing; metered control; stub+guard removed shows the old L3 dependency). Pristine rc 0 before and after; scratch status 0.
- **Browser in a test-only round:** runtime frozen, so C runs the meter play/stop no-regression row and the auth/demo row at both viewports.

## 4. Architecture
No new checkpoint request: test-only round, no structural risk on one owner. Open requests unchanged (ARCH-CHECKPOINT-DECODE-REGION, ARCH-CHECKPOINT-PERF15-PEAKS, ARCH-CHECKPOINT-PERF11C-III-BOUNDARY). SIG-R388 itself is now being addressed by this round.

## 5. Schedule (D-29z1443)
- **Next rounds:** 415 SYS-R388 → 416 RETRO (window 401–415; TLM-PERF15-FIREFOX deadline) → SYS-CLOCK-DETERMINISM → SYS-R369 → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).
- **REGRESSION-2026-11-10:** first at the first planning on or after 2026-11-10, ahead of RETRO if both are due. `regression-last.json` unchanged (2026-11-07).
- **Commit readiness:** round 414 is published. Nothing new is ready for root until C round 415 passes.

## 6. Files written (B-owned only)
- `b-round-414/`: `sketch-415.patch.txt`, `sketch-415.sha256`, `fake-web-audio.ts.txt`, `make-sketch.py`, `it-bodies.py`, `it-bodies-head.txt`, `it-bodies-sketch.txt`, `claims-415.sh` + planning/sketch outputs and diff, `grants-415.txt`, `r415-frozen-sha256.txt`, `mutants/` (`run.py`, `summary.txt`), `update-backlog.py`, backups `*-before-415.*`.
- Loop folder: `current-task.md`, `b-next.json`, `backlog.json` (v390), `feature-status.md`, `tasks/round-414.md`, this file.
- Scratch outside the repo: `/tmp/b415`, `/tmp/b415-mut`. No app source edited; no server left running.
