# B round 314 → 315 planning

**Date:** 2026-11-03 · **Baseline:** HEAD `abfcf78` (gate 314 `published`), clean tree · **Decision:** CONTINUE → round 315 = PERF-5b (batching closed on evidence; PERF-5 robustness batch A-R312-REVIEW-L1…L5)

**Advisor:** available and consulted three times; every piece of advice was adopted.
1. **After orientation:** measure the premise first; close batching if no row is red at HEAD; watch the ready-order and synchronous-rethrow traps; follow the bookkeeping list.
2. **Before hand-off.** Fixes applied:
   - doc 228 grants now include `## არქიტექტურა` and `## შეცვლილი ფაილები`;
   - PW19's step 5 was checked (K23) and its STOP extended;
   - PK-LOAD and PK-COLD-START wording;
   - an add-only diff check for the test file;
   - round 314's review notes recorded;
   - a perf row-equality row, made safe by B's own perf run (K24).
3. **At close:** the HEAD-build recipe for PK-COLD-START, and this line.

## 1. Round 314 ruled (D-29z845)
**C round 314: PASS.**
- 10 rows passed; `browserVerified` and `realVerified` are true; 0 bugs.
- Rows passed: SOURCE-SCOPE, CLAIMS, CARRY, HARNESS-PASS 2/2, ROW-EQUALITY 164/164, MU-FOLLOW-SCROLL (117 = 81 + 12 + 24, red as required), UNIT with 3 C mutants, FOLLOW-UI and G314-AUTH at both viewports, and DOC.
- Gate 314 published `abfcf78` on both remotes.

**Results:**
- PERF-5a is done.
- C-R312-01 and C-R313-01 are closed.
- INFO-C314-DOC-PENDING-SENTENCE is granted in round 315.
- `tasks/round-314.md` is a byte copy of the old `current-task.md` (K16).

**Evidence check:** every number above comes from `c-round-314.json` and `gates/gate-round-314.json`. B did not re-run them.

## 2. PERF-5b premise measured; batching closed (D-29z846)
**Probe.** A scratch production build of HEAD, with commit component names and a mark per peaks delivery, 3 loads each at 1× and 6× (`b-round-314/probe/`). Per load:
- 9 deliveries and 9 commits, each re-rendering 94 components;
- gaps under 16 ms: 3, 3 and 2 of 8 at 1×; 0 at 6×;
- 0 long tasks overlapping a delivery→commit window.

**Ruling.** Batching would merge at most 2–3 of 9 commits at 1× (timing-dependent) and none at 6×. `startTransition` could hold back `ready`. No deterministic row is red at HEAD, so batching is closed on evidence. performance-optimizer agrees.

**Signals:**
- 94 components per delivery → PERF-10;
- the 6× demo-buffer task (142–168 ms) and PERF2-STEREO-COPY → PERF-13;
- the first-frame task → PERF-11.

PERF-5's plan target "load long tasks > 50 ms = 0" is not owned by PERF-5.

## 3. Round 315 scope (D-29z847)
One owner: the peaks client, its two context call sites and its tests.

| Low | Fix |
|---|---|
| L1 | 10 s cold-start budget until the worker's first reply, then 3 s per reply |
| L2 | `deliver` helper: a callback error is rethrown from a timer and never reaches the scheduler or a `.catch` |
| L3 | `buffersRef` is set inside the peaks callbacks; the collection callback re-syncs playback when a clip uses the source |
| L4 | PW15, PW19 (A writes it) and PW20 |
| L5 | PW13b |

**PW9 ruling line:** L1 wins over the old assertion. PW14 and PW9 replace it.

## 4. B's pre-check (L23, L37)
| Check | Result |
|---|---|
| tsc | rc 0 |
| biome on the 3 files | clean |
| `peaks-worker.test.ts` | 25/25 |
| Mutants | 10/11 red; MU-REPLIED-AFTER-FILTER is equivalent by design |
| The 8 covering files | 97/97 |
| Full unit suite on the scratch | 235 files, 3502 tests, rc 0 |
| Perf spec on the sketch, run alone | rc 0, `failures` empty; 164/164 deterministic rows equal C round 314's run |
| Browser cold-start probe, first peaks reply held for 4 s | HEAD: the worker is terminated at +3,000 ms. Sketch: it survives at 1440 and 1280. 0 page errors |

`git apply --check` of the sketch succeeds on HEAD.

## 5. Consults (D-29z848)
- **performance-optimizer:** close batching. Found the synchronous-rethrow hazard (adopted: timer rethrow) and the missing collection re-sync (adopted).
- **tech-lead:** the plan holds with corrections (all adopted):
  - set the reply flag before the job-id filter;
  - one `deliver` helper;
  - rewrite PW9;
  - use the covering list of 8 files.

  The export gate for a source still `loading` is out of this round → B-R314-EXPORT-LOADING-GATE (info, revisit at SRW-21-PLAN).
- **Not consulted:** product-designer and ableton-arrangement-expert. Nothing user-visible changes shape.

## 6. Findings and bookkeeping (D-29z849)
| Id | Severity | Ruling |
|---|---|---|
| C-R312-01, C-R313-01 | Medium | Closed (C 314 PASS + gate) |
| A-R312-REVIEW-L1…L5 | Low | Round 315 |
| PERF2-STEREO-COPY | low signal | → PERF-13 |
| R313-FOLLOW-PAGE-TURN-COVERAGE | signal | Decided: PERF-10 planning |
| R314-PEAKS-COMMIT-COMPONENTS | info | New signal → PERF-10 |
| R314-DEMO-BUFFER-LONGTASK-6X | info | New signal → PERF-13 (hypothesis, unconfirmed) |
| B-R314-EXPORT-LOADING-GATE | info | New signal → SRW-21-PLAN |
| INFO-C314-DOC-PENDING-SENTENCE | info | Round 315 |

- No Critical, High or Medium finding is open in this stream.
- **REGRESSION is not due:** the last one was 2026-11-02, so the next falls on or after 2026-11-05. **RETRO:** at round 320.
- **Updated:** `backlog.json` v274, `feature-status.md`, `current-task.md`. `lessons.md` is unchanged: no new failure class.
- **Backups:** `b-round-314/backlog-before-315.json`, `feature-status-before-315.md` and `lessons-before-315.md`.

## 7. Architecture checkpoint
None requested: one owner and a small diff. Signals kept, not scheduled:
- round 312's reviewer note: keep; propose a `useSourcePeaksComputer` hook only if a second consumer appears;
- round 314's reviewer note, recorded now as **ARCH-R314-FENCE-FADER-WINDOW**: keep `runPass`/`dragFader` linear; if a fourth guard round comes, fold the per-drag preconditions into one `fenceFaderWindow` helper.

Round 314's other review notes are recorded too:
- A-R314-REVIEW-L2: the scroll guard cannot tell "not scrollable" from "did not scroll";
- A-R314-REVIEW-L3 and L4: info;
- A-R314-WARM-SCRIPT-COLD: the warm-up helper crashes on a cold server.

## 8. Commit readiness
After C PASS on round 315 and the gate, root can publish 6 paths:
- M `ArrangementContext.tsx`, `peaks.client.ts`, `peaks-worker.test.ts`, docs 228 and 163;
- new `peaks-worker-video.test.tsx`.

PERF-5 is then done.

## 9. Not COMPLETE, not BLOCKED
Many scoped items remain (PERF-7…15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries, deferred Lows), so the work is not complete. Nothing external blocks round 315.
