# CURRENT TASK — Round 341: REGRESSION-ROUND-2026-11-05, continued. C runs every row that round 340 did not run. A changes nothing

Dispatcher: B · Implementer: A (no change; baseline report only) · Verifier: C · Planned 2026-11-05 (after the round 340 C phase).
Decisions: **D-29z1059 … D-29z1066** (`backlog.json` → `decisions_log_b`, `rounds[341]`, `regression_rounds` id `REGRESSION-ROUND-2026-11-05`).

**Read first:**
- `lessons.md` in full, especially:
  - L38: perf runs alone, warm up first;
  - L57: all harness fields;
  - **L59 (new): do not end the C phase early.**
- **The full row definitions are in `tasks/round-340.md`.** This is the exact copy of the round-340 task: §2 method and changed UI facts, §3, §4/§4.S/§4b/§4c, §4d, §5, §6, §8 and §9. **This task lists only what differs from it. Where they differ, this task wins.**
- Round 340's partial C run: `c-round-340.md`, `c-round-340.json` and `c-round-340/`. B's reasoning: `b-round-340.md`.

## Baseline: unchanged, HEAD `99a5912`, clean tree
- Gate 340 was `skipped` ("C taskStatus BLOCKED", `gates/gate-round-340.json`), so nothing new was published. The baseline stays the published `99a5912` of gate 339.
- `context/head-sha.txt` = `99a5912…` and `context/git-status.txt` is empty. A confirmed both in `a-round-340.md`, and B re-read HEAD `99a5912` at planning.
- The frozen tree `b-round-339/r340-tree-sha256.txt` (1239 entries) and the claims script `b-round-339/claims-r340.sh` stay valid for this round. Run `sha256sum -c` from `store/` at start and at end (0 failures), and re-run the claims at start and at end (only K6, the mock port, may differ once you have started the mock).
- Protected files: `b-round-318/protected-sha256.txt`, 11/11 OK.

## 0. Why this round (D-29z1059, D-29z1060)
- **Round 340 ran 6 rows and stopped.** C's report gives "time/budget" as the reason, but `c-round-340-result.json` shows `terminal_reason: completed` / `stop_reason: end_turn` after about 13 minutes (00:16 → 00:29 UTC) at $0.79. The job limit did not stop it. Round 301, in one C phase, ran 133 rows in about 3 hours. No turn or time cap appears in the runner files visible to B: C used 31 turns, against 272 in round 301 and 40 in round 339. This is a C-process observation (`INFO-C340-EARLY-END`), not an app bug. If a runner cap that B cannot see stopped it, C names that cap as the stop signal.
- **Task §7 of round 340 fixed the outcome in advance** (D-29z1058): rows that did not run continue first, `regression-last.json` is not updated, and c4-ii follows.
- **No bug was found.** No Critical or High finding is open. The open Mediums are root-only or manual-only, so they do not block (2026-10-23 clarification). Nothing outranks this round.
- **Not split into two rounds** (advisor). One C phase has already done the whole sweep (round 301). If a real job limit stops C, `progress.json` lets the next job resume the same phase.

## 1. A — no code or doc change
This is the same as round 340 §1.
- From `store/`: HEAD must be `99a5912…` and `git status --short --untracked-files=all` must be empty. Otherwise, write "STOP — baseline differs" in `a-round-341.md` and change nothing.
- Write `a-round-341.md` with the HEAD, the status output and "no change by design (REGRESSION round continued, D-29z1059)".
- Run no checks. Do not restart the dev server.

## 2. C — how to run this round (changes to round 340 §2)
1. **Do not end the phase early (L59).** Run rows until every row in §3 has a result (PASS, FAIL, inconclusive after the budget, BLOCKED with a cloud-backend reason, or carried with a stated reason), or until the job's real time limit stops you.
   - "Not run" is valid only for a row that is still queued when the job is killed.
   - `taskStatus` BLOCKED for time needs the real stop signal; ending the phase yourself is not one.
2. **Write `c-round-341/progress.json` after every row** (`done`, `next`, `invalid`). Round 340 had none. Also update `c-round-341.json` and `c-round-341.md` after every row. On resume, continue from `next` and do not repeat finished rows.
3. **Start order:**
   1. SOURCE-SCOPE start: HEAD, status, protected 11/11, `sha256sum -c b-round-339/r340-tree-sha256.txt`, and the claims;
   2. **the mock API, as step 2.** First check `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5199/__mock/health`. If it returns 200 (for example `cloud/run.sh` started it), use that mock, record "started by runner" and do not stop it. Only on a non-200: start it from the loop folder with `node mock-api/server.mjs > c-round-341/mock.log 2>&1 &`, write its PID to `c-round-341/mock.pid`, and re-check until 200. Do this before any store, NAME or JOURNEY row. At the end, stop only a PID you started. Mock data is client-path evidence only.
   
   A store row that did not run because you did not start the mock is **not** "backend unavailable in cloud". It must not be listed under `blocked`.
4. **One server rule (D-29z1057, unchanged):** every dev row runs on :5173. Never start a second dev server. The production-build rows (R340-FONTS) use the scratch build in §2.6.
5. **Warm up in a browser** before the first timed probe, and again after any build or perf run (L38).
6. **Production build for the font rows (D-29z1063).**
   - Steps:
     1. `rm -rf /tmp/r341-build && mkdir /tmp/r341-build`;
     2. `git -C /home/runner/czaba-project/store archive HEAD | tar -x -C /tmp/r341-build`;
     3. `ln -s /home/runner/czaba-project/store/node_modules /tmp/r341-build/node_modules`;
     4. in `/tmp/r341-build`, run `npx remix vite:build > <c-round-341>/build.log 2>&1`;
     5. `PORT=5192 npx remix-serve ./build/server/index.js > <c-round-341>/serve.log 2>&1 &`, with its PID saved.
   - Nothing is written under `store/`. A vite build does not use the dev deps optimiser.
   - Do not build while perf runs (L38). Stop the server by its PID after the font rows.
   - If the build fails for an environment reason, the row is inconclusive with the log. It is not a FAIL of the app.
7. **Copy every script you use into `c-round-341/tools/`** and write outputs only under `c-round-341/`. Never write into an earlier round's folder. A script adapted only for a changed UI fact from round 340 §2 is a **lookup, not a deviation**.
8. **Budget per row:** this is unchanged. At most 2 replacement attempts, for environment-invalid runs only, and thresholds are not relaxed.

## 3. C — rows to run
### 3a. Carried from round 340 (PASS; do not re-run)
G340-AUTH, R340-GROUP-MOVE, R340-CROSS-LANE (B accepts C's own playing run, `c-round-340/out/exp340.json`, as the "while playing" half; D-29z1061), R340-HINT (ruling below), R340-RESCHEDULE CONT-1, and the Studio half of the journey (Export WAV). The evidence is `c-round-340/`. They count toward the round as PASS.

**R340-HINT ruling (D-29z1062).** The round-303 contract is "once per page load" (`tasks/round-303.md` l.32/l.57: per mount of the Studio provider in this tab). H-RELOAD expects "the hint is back" (l.129), and C round 303 passed it. The words "once per profile … not after reload" in round 340 §2 and §4d were B's wording error. C's observation matches the contract, so the row is PASS and there is no finding. **In this round, read the round-340 R340-JOURNEY step "hint once" as "once in this page load".** The question to Saba stays SABA-Q-NAME-HINT-LIFETIME (`awaiting_user`, D-29z791).

### 3b. §4d rows still to run (newest risk first). Script → oracle
"Oracle" means the accepted output of that round. Compare your run on :5173 (HEAD `99a5912`) with it. Every difference must be explained by a changed UI fact listed in round 340 §2 (lookup); otherwise it is a finding.

| Row (round 340 §4d) | Script(s) to copy and run | Oracle |
|---|---|---|
| R340-WAVEFORM | `b-round-333/waveform-d-probe.mjs` (WAVEFORM-D); `c-round-334/trim-end.mjs` (trim-end); `c-round-334/video-wave.mjs` (VIDEO-WAVE) | `c-round-334/` (`trimend-a-<w>.json`, `video-a-<w>.json`); `c-round-334/wd-sketch-<w>.json` (C's accepted run; `wd-head-<w>.json` is the control), compared with `b-round-333/wd-compare.py` (as `c-round-334/wd-compare.txt`) |
| R340-DETAIL-TEXT | `c-round-333/detail-text.mjs` (+ `c-round-333/warm.mjs`) | the accepted A-run outputs in `c-round-333/` |
| R340-OVERVIEW-METER (+ SA-14 L-toggle) | `c-round-332/ovr-probe.mjs`, `latch.mjs`, `lib.mjs`; compare with `c-round-332/cmp-ovr.py` | the accepted A-run outputs in `c-round-332/` |
| R340-SHOWN-READERS | `c-round-331/shown-probe.mjs`; compare with `shown-compare.py` | the accepted A-run outputs in `c-round-331/` |
| R340-PROJECT-END | `node b-round-328/end-bound-probe.mjs http://127.0.0.1:5173 <abs out>` | `c-round-330/end-bound-a.json` |
| R340-FADE-STATUS + R340-DRAG-A (one harness: D-ROWS) | `ROWS_DIR=<abs c-round-341/rows> node b-round-328/rows.mjs http://127.0.0.1:5173 head341`, then `python3 -I b-round-328/rows-diff.py c-round-334/rows/rows-a.json <dir>/rows-head341.json`. For D-NOFLASH, D-MIXED and the srcmark rows that rows.mjs does not cover, use `c-round-325/c325-rows.mjs` and `c-round-328/c328-rows.mjs` | `c-round-334/rows/rows-a.json` (the latest accepted D-ROWS); `c-round-325/rows-a*.json`; `c-round-328/`. The EXPORT WAV sha equals the oracle's (1440 only) |
| R340-SELECTION | `c-round-324/c324-rows.mjs`, `c324-group.mjs` (+ `warm.cjs`) | the accepted A-run outputs in `c-round-324/`; WAV byte-compare at 1440 only |
| R340-RANGE | `c-round-320/c320-rows.mjs`, `c320-wave.mjs`, `c320-export-esc.mjs` (driver `rows.sh`; compare with `diffrows.py`) | the accepted A-run outputs in `c-round-320/`; R-EXPORT at 1440 only |
| R340-FONTS (all four) | `c-round-317/fontnet.cjs`, `font-bytes.cjs`, `pxdiff.cjs`, `shots.cjs` against the §2.6 build on :5192 (FONT-NET, FONT-PRELOAD, FONT-CACHE: `/s/` path and 2 CORS preloads; FONT-PIXEL). The :5173 0-Google-request half is already done (`c-round-340/out/font.json`) | `c-round-317/fontnet-a-<w>.json`, `font-bytes-a.json`, and the A screenshots in `c-round-317/` |
| R340-PEAKS | `c-round-315/pk-load.cjs`, `pk-video-sound.cjs`; cold start per `b-round-314/probe/cold-start.cjs` (+ `c-round-314/warm.cjs`) | the accepted outputs in `c-round-315/` |
| R340-WORKER-R2 | `c-round-311/run-wk.sh` with `worker-server.mjs`, `head-r2-proxy.mjs` and `browser-probe-311.cjs` (local worker proxy, as in round 311) | the accepted outputs in `c-round-311/`. If the proxy cannot start here, mark the row BLOCKED with the log; do not FAIL it |
| R340-RESCHEDULE (CONT-30, ENDED, NO-CHANGE) | `c-round-308/continuity-probe.cjs` (30 clips), `onended-probe.cjs`, `release-probe.cjs`, `posctl-probe.cjs` | the accepted outputs in `c-round-308/` |
| R340-PERF3D | `c-round-306/probe/scroll-after-crossing.cjs` (SCROLL-UPGRADE); `visible-d.cjs` + `compare-visible-d.py` (VIS-EQUIV); the PLAY-SMOKE-306 steps in `c-round-306.md` l.17 | `c-round-306/probe/scroll-a-<w>.json`, `a-out-<w>.json` |
| R340-NAME (mock) | `c-round-302/main.cjs` (+ `budget.cjs` / `budget2.cjs` for N-NARROW) | `c-round-302/main.json` |
| R340-JOURNEY (store half, mock) | `c-round-301/tools/journey/journey301.cjs`, extended by the "CZABA Studio" title check and the hint text (read as in §3a) | `c-round-301/tools/journey/journey301.json` |

Where a round kept no script for a sub-row, rebuild it from the row text in that `c-round-N.md` and record a lookup.

### 3c. Round 301 sections (unchanged definitions: round 340 §3, §4, §4.S, §4b, §4c)
- Run them by replaying round 301's bundle:
  - `c-round-301/tools/rNNN` and the round-specific probes;
  - `c-round-301/t258/tools/` (the §4b driver is `run-4b.sh`; redirect every output and report sink into `c-round-341/`, as round 301 did).
- Rows:
  - §3: RG-01 … RG-24 and RG-T1 … RG-T4B, at both viewports (RG-03 at 1440 only);
  - §4 and §4.S, with the mock API for the store rows;
  - §4b: RR-*;
  - §4c: R301-MASTER … R301-JOURNEY. R301-JOURNEY is covered by R340-JOURNEY above.
- Compare against round 301's accepted outputs. Round 301's own lookups (`c-round-301.json` → `lookups`) remain valid lookups.
- NO-SHIFT-203 stays carried, unless you start a reference server.

### 3d. §5 parked rows and §6
- **§5 parked rows** (round 301's seven + RP-C301-01, RP-C318-06, RP-FOLD-SELECTION, RP-NOBPM-RULER, RP-SAME-TEXT-RACE, RP-GATE328-S1, RP-C331-01): as in round 340 §5. RP-C318-06 and RP-NOBPM-RULER can open a Medium; the rest are record only unless stated.
- **RR-PERF:** as in round 340 §6, alone, after §5:
  - rc 0, 3/3 specs, every budget row passes, `complete` true, 0 aborts and 0 page errors;
  - `interact.harness.drag-lane-live` = 1 and `interact.harness.drag-group-live` = 1;
  - `python3 -I b-round-329/perf-rowcmp.py` against `c-round-339/perf-results/latest-interactions.json` expects **0 DIFF**;
  - `latest.json` and `latest-resources.json` against `c-round-301/perf/` are report only.
- **RG-SMOKE:** `npm run test:e2e:smoke` in `store/`, alone, after RR-PERF.
- **G341-AUTH** at the end: copy `c-round-340/tools/g340-auth.cjs`. With the mock running, a fake Bearer is expected to give **403** (round 301). 500 is expected only without the mock.
- **SOURCE-SCOPE end**, as at start.

## 4. Outcome, fixed in advance (D-29z1064)
| C result | B at the 341 → 342 planning |
|---|---|
| Every row in §3 has a result, with no Medium+ finding (Lows → `deferred_low_polish`) | `regression-last.json` = `{"date": <C's completion date>, "round": 341, "note": "REGRESSION-ROUND-2026-11-05 ran in rounds 340+341"}`. Round 342 = **PERF-DRAG-PREVIEW c4-ii** from `b-round-339/current-task-c4-ii-draft.md`, with its carry-forward note applied to round 342 |
| Any Critical, High or Medium finding, including a regression | Round 342 = a bounded fix-up (≤ 3 related bugs, Critical first), and C re-runs the failed rows. `regression-last.json` is still updated when every row ran. c4-ii follows, re-checked first on the new HEAD |
| A job limit stops C with rows queued | The same phase resumes from `progress.json`. If the round still closes incomplete, round 342 continues with the remainder, and `regression-last.json` is not updated |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |

Item status does not change from a failed row by itself; a failed row opens a finding linked to the item. No item becomes "მზადაა" from this round.

## 5. Neighbour risk
| Risk | Check |
|---|---|
| The scratch build or the :5192 server writes into `store/` or disturbs :5173 | It is built in `/tmp/r341-build` only; SOURCE-SCOPE and `sha256sum -c` at start and at end; the :5173 warm-up after the build |
| Perf or smoke overlaps another browser job | Serial order; L38 |
| The mock overrides the auth expectations | The fake-Bearer expectation in G341-AUTH (403 with the mock) |
| A pre-302 script reports a retired name or the first-add hint | The round 340 §2 changed UI facts, recorded as lookups |
| The phase ends early again | L59, `progress.json`, the stop signal named in the report |

## 6. Deliverables
- **A:** `a-round-341.md` (baseline only).
- **C:**
  - `c-round-341.json`, with `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `carried` (the §3a rows with `c-round-340/` paths), `notRun`, `gate`, `bugs`, `observations`, `invalidRuns`, `lookups`, `stopSignal`, and **all L57 fields**: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`. Write `null` with a reason where a field does not apply (no sketch this round);
  - `c-round-341.md`;
  - `c-round-341/progress.json`;
  - evidence under `c-round-341/{tools,out,shots}`.
- **Every bug gets:** an id `C-R341-NN`, a severity, the item, the steps, the evidence path, and "regression yes/no" with the round of its last pass.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome and `npm run verify`.

## 7. Root notes
- No source change is expected. Nothing is published when no source changed; the loop-state commit records the sweep.
- **Frontend-architect checkpoint:** `ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE` is still planned for after c5. It is not due now.
- **Still open for root:**
  - checkpoint D-29z915;
  - ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS.
