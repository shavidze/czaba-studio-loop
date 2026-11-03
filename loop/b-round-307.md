# B round 307 → 308 planning

**Date:** 2026-11-03. **Decision:** CONTINUE. **Next:** round 308, PERF-COMMIT-RESCHEDULE-b-close (`current-task.md`).
**Baseline:** gate 307 `published` with commit `d8e5ce52` (`gates/gate-round-307.json`). HEAD is `d8e5ce5` and the tree is clean.
**Advisor:** configured and used three times: once before choosing the approach, once to reconcile the measurement with its first suggestion, and once to review the result. The review added the click rule and K21. No project subagent was consulted. The round-306 consults (`performance-optimizer`, `tech-lead`, `b-round-306/consults.md`) still cover the a/b split, and closing the stage needs no new design input.

## 1. Round 307 result (checked by B before updating the backlog)
- `c-round-307.json`: PASS. 7 rows passed: NO-CHANGE, PLAY-SMOKE-307, G307-AUTH (both viewports), SOURCE-SCOPE, CLAIMS, TESTS-READ and DOC. `browserVerified` and `realVerified` are true, there are 0 bugs, and 3 INFO notes are recorded.
- **B checked C's evidence independently:**
  - All 17 evidence paths exist.
  - `c-round-307/probe/a-1440.json` and `a-1280.json`: 12/12 releases with `starts` 30, `playing` "true", `loafMax` 0, and the position advancing.
  - `smoke307.json`: fade-in 0 → 3.000 committed during playback; WAV 48 kHz, 16.000 s, peak 0.217.
  - `g307-auth.json`: `auth_user` null; the legacy route shows Sign in with 0 `audio[src]`.
- Gate 307: `verify.log` passed and the commit was pushed to both remotes. Review score 8.5/10, 5 findings, none blocking (§3).
- **Backlog:** PERF-COMMIT-RESCHEDULE-a is `done` (D-29z816). The round-307 archive is `tasks/round-307.md`, byte-equal to `b-round-307/round-307-task-copy.md` [K16].

## 2. Stage b premise measured at planning (D-29z813 → D-29z817)
D-29z813 required stage b to measure churn and continuity before any wiring, and to close the stage if there was no benefit. B measured both on HEAD `d8e5ce5`:

| Probe | Result | File |
|---|---|---|
| `ended` for a source stopped before its start (Chromium 143) | fires at the stop time (0.311 s). A second, later `stop()` wins (0.908 s, no throw) | `b-round-307/probe/onended-probe.json` |
| Continuity, 1 clip: fade-out edit at about 2.5 s during playback, AudioWorklet tap on the real output | 6/6 valid. 1 start per release. Largest splice step 0.0016–0.0019 vs baseline p99.9 0.0035, always 114–399 samples away from the splice, so from the content. Zero run 0. RMS ratio 0.79–1.08 | `probe/continuity-head-dev.json` |
| Continuity, 30 clips (Add + 29× Ctrl+D, edit on clip 1) | 6/6 valid. 30 starts per release. Largest step 0.0013–0.0015 vs 0.0035, 45–441 samples away from the splice. Zero run 0. RMS ratio 0.77–0.90 | `probe/continuity-head-dev-30.json` |

**How the probe developed.** The first version used a ScriptProcessor tap. It dropped blocks: `contiguous` was false, so its runs were invalid. Its output was overwritten by the next run (same output path) and was not kept. That is noted here instead of being presented as evidence. The AudioWorklet version captured gap-free spans of more than 2.9 s before the splice and more than 0.5 s after it.

**Baseline check.** The baseline window is relative to each splice (`iS − sr` to `iS − 20 ms`). The runs splice within about 20 ms of the same stem position, so identical p99.9 values are expected. An earlier run at another position gave different values (0.003561 / 0.05054).

**Ruling (D-29z817):** the full rebuild has no measured main-thread cost (round 306) and no audible discontinuity, so wiring would remove nothing a user can notice.
- The stage **closes on evidence**. It becomes final when C reproduces CONT-1 and CONT-30 on a production build in round 308.
- A click in any valid run reopens the stage as b-ii wiring.
- PERF-COMMIT-RESCHEDULE was a planner candidate (doc 168 and the tech-lead consult of 2026-10-28), not an item of Saba's `perf-plan.md`. Closing it removes no user scope.

**Not measured (D-29z819, inferences):**
- an edit while many clips sound at the same time;
- `ended` in Firefox and Safari;
- a gain-changing edit at the playhead.

**Keep vs remove (D-29z818):** keep stage a as prepared code, and harden it while it has no caller:
- the stop guard never moves a stop later. This is gate F1, confirmed by the probe, where the later stop wins;
- `clipFades` and `clipEnvelopes` become required;
- one TODO line points at doc 224.

The guard does not change today's runtime: all 3 `.stop(` callers in `ArrangementContext.tsx` (l.1015, 1022, 1093 [K8]) either stop immediately or stop a retired handle once. `metronome.test.ts` M10 stays green.

Signal PERF-RESCHEDULE-UNUSED-CODE: revisit keep-vs-remove at the end of phase 2.

## 3. Findings ruled
| Id | Severity | Origin | Ruling |
|---|---|---|---|
| GATE307-F1-STOP-LATER | Low (no caller) | gate reviewer | fixed in round 308 (RC12/RC13, 3 mutants) |
| GATE307-F2-ENDED-PRESTART | info | gate reviewer | resolved for Chromium by B's probe; Firefox and Safari are an inference in doc 224 |
| GATE307-F3-SPLICE-CONTINUITY | info | gate reviewer | answered for the current runtime by CONT rows; the replace-splice probe moves to doc 224 TODO |
| GATE307-F4-GAINDB-TWICE | info | gate reviewer | moot without wiring; doc 224 TODO |
| GATE307-F5-SHAPES-OPTIONAL | Low | gate reviewer + A reviewer | fixed in round 308 (required fields) |
| INFO-C307-K14-COUNT | info | B spec | claims-308 K10 counts `it('RC` rows by name |
| INFO-C307-RC1-WORDING | info | B spec | recorded; the archive is not edited |
| INFO-C307-COLD-DEV | info | environment | warm-up (L38) |

No Critical, High or Medium finding is open on the Studio. The bug gate is clear.

**Architecture notes → `architecture_signals`.** These are not tasks, and no new checkpoint request is filed. They are attached to `b-round-306-checkpoint-request.md` (D-29z815):
- A-R307-ARCH-SOURCE-REGISTRY: extract a source registry once a caller exists.
- GATE307-ARCH-SHARED-RECORDING-FAKES: one shared helper for the automation-recording test fakes. Candidate test-only task.

## 4. Round 308 task (summary)
- **A**, 3 modified paths:
  - `graph.client.ts`: the stop guard in both loops, the required shapes and the TODO;
  - `graph.test.ts`: inside `describe('replaceClips')` only, call-site arguments plus RC12/RC13;
  - doc 224: `Completed (C round 308 PASS)`.

  3 mutants, and the covering set of 12 files. No `ArrangementContext.tsx` change and no runtime change.
- **C:**
  - CONT-1 and CONT-30 on a production build, 3 valid runs per viewport, within the sync budget. The click rule needs the largest step to sit at the splice (|offset| ≤ 3 samples) or above the baseline maximum, or a dropout; a content transient away from the splice is inconclusive and is replaced;
  - ENDED;
  - NO-CHANGE (30 starts per release);
  - PLAY-SMOKE-308 and G308-AUTH at both viewports;
  - SOURCE-SCOPE, CLAIMS, TESTS-READ and DOC.
- **Frozen list:** `b-round-307-r308-tree-sha256.txt` (1,181 entries). The 3 new round-307 files were added; nothing else differs from round 306's list. **Claims:** `b-round-307/claims-308.sh`, HEAD output `claims-308-head-output.txt` (K1–K21, run after the last edit; K21 = 2 non-test files name the reschedule API, so it has no caller).

## 5. Queue and gates
- **REGRESSION** is due on or after 2026-11-05 (`regression-last.json`: round 301, 2026-11-02). It takes precedence at the first planning on or after that date. Next RETRO: round 320.
- **After round 308:** PERF-4, the R2 worker. Before dispatch: locate the worker code, list the exact header changes (perf-plan rule: purchased files stay private), and consult `performance-optimizer` and `tech-lead`. Then PERF-5 … PERF-15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries (skip rule). The `execution_order_d29z817` field in `backlog.json` holds the order.
- **Root:**
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1, Medium, open_root) is still open.
  - The frontend-architect checkpoint requests are unanswered and non-blocking: ARCH-CHECKPOINT-STUDIO-LINK, D-29z811 (end of STUDIO-PERFORMANCE) and D-29z815.
  - **Commit readiness:** round 307 is published. Round 308 is ready for root after C PASS and the gate.
- **Note on the root prompt's "FB-01..FB-16":** the original FB items were planned long ago. The live scope is `post_current_stage_queue` plus `deferred_low_polish`, `awaiting_user` and the Tech Lead manual items. None is dropped (b-next `remaining`).
