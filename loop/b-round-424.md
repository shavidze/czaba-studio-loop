# B round 424 → 425 planning (2026-11-10)

**Decision: CONTINUE.** Next is round 425: REGRESSION-2026-11-10 part 2 on `f6c76f4` (`current-task.md`). A changes nothing.

**Advisor:** available. It was consulted after orientation, and its points were followed:
- Part 2 also covers rounds 343–388 (the round-389 rows), not only the round-390 template;
- gate 424 review read first;
- every carry is named;
- the RR-PERF carry only with a byte-equality proof;
- a lane re-check on the new baseline.

A second call was made before close (§8).

**Consults:** none this round. A regression round has no new behaviour, sketch or perf decision. The `product-designer`, Ableton and YouTube steps do not apply.

## 1. Round 424, from C's evidence only (D-29z1483)
- **C PASS** (`c-round-424.json`):
  - 9 rows passed, 0 failed, 0 bugs;
  - `browserVerified` and `realVerified` are true;
  - fake bearer BLOCKED (backend unavailable in the cloud), kept as open backend evidence.
- **Evidence checked independently:**
  - `c-round-424/perf-compare.txt`: all 17 C-R423-01 ids pass at the sketch medians, and no components row is above round 423;
  - `c-round-424/perf-results/` has 5 files;
  - L57 OK (`b-round-424/l57-check-c424.txt`). Five fields are `null` without a written reason; that is a bookkeeping INFO only, and task 425 asks for reasons.
- **Gate 424** published `f6c76f4` on both remotes:
  - `gates/round-424/verify.log`: 264 files / 3,957 tests;
  - review score 9/10, no Medium+.
- **Closed and moved:**
  - C-R423-01 is closed.
  - PERF-11c-iii-e-ii: ბაგია → **მზადაა**.
  - PERF-FIX-R423-LANE-SHELL: მზადაა.
- **To `deferred_low_polish`** (2026-10-23 rule): A-R424-DP30-SHELL-RENDER, A-R424-PREVIEW-WRAPPER-STYLE and INFO-B424-MUTANT-LINE-DRIFT (a B artifact).
- **L7 sweep:**
  - TL-R424-L1…L3 are already deferred.
  - The wrapper-style Low is a different point from TL-R424-L3.
  - The gate review's Low 2 (`useShallow` in render) was ruled harmless by the reviewer, so it gets no new id.

## 2. Round 425 = REGRESSION part 2 (D-29z1484)
- **Fixed in advance:** task 424 §6, PASS row.
- **Scope = everything finished up to round 390:**
  - the round-389 rows (343–388);
  - the round-390 rows (≤ 342, the round-340 template, parked RP rows).
- **Why one round:**
  - `metrics/rounds.csv` shows 1.03 h + 0.34 h for C rounds 389 + 390.
  - Rounds 341 + 342 ran the same template in 3.16 h + 0.44 h, so expect up to about 4.6 h of a 350-minute job.
  - A time-limit stop is PARTIAL and resumes from `progress.json`.
- **RR-PERF is carried, not re-run.** `b-round-424/rrperf-carry-proof.txt` shows:
  - both code files at `f6c76f4` are sha-equal to `sketch-424` applied to `875ff37`;
  - `875ff37..f6c76f4` touches exactly the 3 granted paths;
  - `perf/` is unchanged.

  C round 424 ran all 5 specs on that code. PERF-LIB and RG-SMOKE run again; they are cheap and the baseline moved.
- **New row R425-LANE-REBASE.** `ArrangementLane.tsx` changed after part 1. Round 424 did not re-run virtualization (frames200, pin-blur-group) or lane peaks. These run again on `f6c76f4` against the c-round-423 outputs.
- **One journey.** R389-JOURNEY and R340-JOURNEY run once, export included.
- **Frozen tree:** `b-round-424/r425-tree-sha256.txt` (1,322 entries). Claims `b-round-424/claims-425.sh`; planning output `claims-425-planning-output.txt` (stderr empty).

## 3. Carries of REGRESSION-2026-11-08 ruled (D-29z1485, L6)
| Carry | Ruling |
|---|---|
| NO-SHIFT-203 | **Retired as a tree-vs-ref row.** Its reference was the pre-203 tree, and it went unrun in rounds 301, 340 and 390. Its intent is only partly covered by RS-4B (`/` and a product page). R425-NOSHIFT-BOXES records the AuthModal and `/store` boxes as the next regression's oracle |
| INFO-C390-HARNESS-DRIFT | Folded by use. The four adapted probes are already in `c-round-390/t258/tools` and `c-round-390/tools`, which are tool priority 1. C keeps its copies under `c-round-425/` as the next base. It closes when C reports the four lookups by name |
| INFO-C390-RV-M-HYDRATION-GLITCH | Named row R425-RVM-FRESH: 4 fresh-context loads per viewport, with nothing else running |
| INFO-C390-VIDEO-SNAP | R425-VIDEO-SOUND windows are written against the snapped `data-clip-start` [K9] |

## 4. Pre-rulings and signals (D-29z1486)
- **R389-DECODE-CACHE BROWSER-L2-OK:** streaming previews (393+) may sound before the decode ends. That is the round-393 S1 contract.
  - Pass: audible, one start, stops on Play.
  - A **Medium**: never sounds, or keeps sounding after Play or Stop.
  - This is the same family as INFO-C423-DECODE-ORACLE-DRIFT, which stays open as a pointer for later regressions.
- **The other changed UI facts are tagged** [K9]: held Enter, `data-clip-count` and peaks.
- **Architecture:**
  - Gate review signal 3 and A's For B note become SIG-R424-BOUNDARY-FIBER-GUARD: a fiber-count guard for component-boundary changes in `components/arrangement/`.
  - It is merged with RC-R423-PERF-SPEC-ON-STRUCTURE and GATE304-M1 for RETRO 435, and attached to the open ARCH-CHECKPOINT-STEM-LANES request, because STEM-LANES touches the same lane code. It is a signal, not a task.
  - No architecture checkpoint request: the owner is single and contained, and the fix is verified. The open requests ARCH-CHECKPOINT-PREVIEW-AFTER-13C and ARCH-CHECKPOINT-STEM-LANES stand.

## 5. Order after this round
1. 425: this regression part 2. When it closes, `regression-last.json` is updated to C's completion date and round 425.
2. STEM-LANES, if Saba answers. `AGREE-STEM-LANES.md` is still `awaiting_user` [K19].
3. Otherwise SYS-2 stage 2a, then 2b, SYS-1 and SYS-3.
4. STORE-2b…5 (the direction file exists), then REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2 (skip rule).

RETRO 435 stays on its schedule. Root's parallel lanes (COPY-PD, SRW-21-PLAN) are unaffected: this round changes no source.

## 6. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - the regression is open;
  - SYS-2 stages 2a/2b, SYS-1 and SYS-3 are open;
  - STEM-LANES is not started (awaiting Saba);
  - STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries are open;
  - every deferred Low must be fixed and verified before final acceptance.
- **Not BLOCKED:** every row runs in the cloud except the fake-bearer auth path, which is a BLOCKED row and not a blocker.

## 7. Files written by B this planning
- `tasks/round-424.md`: a copy of the round-424 task; nothing deleted.
- In `b-round-424/`:
  - the before-copies of task, backlog, feature-status and b-next;
  - `checkpoint.md`, `update-backlog.py` + `.done` (`backlog.json` v401, D-29z1483…D-29z1486);
  - `claims-425.sh` + planning output;
  - `r425-tree-sha256.txt`, `rrperf-carry-proof.txt`, `l57-check-c424.txt`.
- `current-task.md` (round 425), `feature-status.md` (header, PERF-11c-iii-e-ii, the next block, the C-R423-01 row), `b-next.json`.
- **No app source was touched.** The store tree is clean at `f6c76f4` (K2 0, K3 rc 0).
- **Ready for commit:** nothing new. Round 424 is already published as `f6c76f4`.

## 8. Second advisor call (before close) and what changed
- **Pre-391 pins in R389-DECODE-CACHE** (HEAP live counts, EVICT "one `stop()`") are now `record`, with a B ruling at the next planning. The §4 escape clause sends diffs C can attribute to a named round 391–424 to `lookups`; an unattributed diff is a finding.
- **Auth recipe:** B ran it at the baseline. `file=mix.wav` with no header gives 401, and bare gives 400 [K20].
- **Round-390 oracle path:** each row's evidence path in `c-round-390.md` (`out/`, `t258/out/`, `t301/`, `t301x/`) or the older oracle it used.
- **Time:** the real range is stated (up to about 4.6 h).
- **NO-SHIFT-203:** "partly covered"; a record-only box capture R425-NOSHIFT-BOXES was added.
- **Signal 3** is attached to ARCH-CHECKPOINT-STEM-LANES.
- **Backlog:** second pass `b-round-424/update-backlog-2.py` + `.done` (v401, no bump; D-29z1484, D-29z1485 texts and the checkpoint note).
- **Claims:** re-run after the last edit; planning output overwritten.
