# B round 361 → 362 planning

Planned on 2026-11-06 by B. The advisor was consulted before the approach was fixed.

## 1. Round 361 result (from evidence only)
- **C:** `c-round-361.json` taskStatus PASS, browserVerified true, realVerified true. All 12 C rows passed: PERF 95/95 asserted, 0 NEW, `interact.click.components` 83 → 42 ×3 at 1× and 6×; C's own mutant MU-C361 went red (44 > 42); ACTIVE-LANE, GROUP-RING, PASTE-LANE, VIDEO-FAIL-STOP-1, G361-AUTH and DOCS passed.
- **Gate 361:** `gates/gate-round-361.json` is published, commit `6fdd82f` on both remotes. `verify.log` shows 248 files and 3643 tests passing, and the build passing.
- **Backlog updates (D-29z1172):**
  - PERF-10 stage 3 (PERF-10b-i) is done.
  - C-R360-NOTE-STALE is closed, together with the two A-R360 notes merged into it.
  - SIG-R322-ACTIVE-TRACK-STORE is adopted.
- **Baseline for round 362:** HEAD `6fdd82f`. `regression-last.json` is unchanged: the next regression is due on 2026-11-08 or later, and today is 2026-11-06.

## 2. Rulings on round-361 findings (D-29z1173)
| Id | Ruling | Evidence |
|---|---|---|
| A's L11 STOP / INFO-A-R361-L11-TIMING | **Accepted delta: the slowdown comes from runner load.** TG1 and UC1 were equally slow on the HEAD scratch (3561/3204 ms). Run in isolation they take 1.7 s. In gate 361, TG1 took 3343 ms and UC1 3235 ms, but the whole suite took 307 s, against 175 s at gate 360 (×1.76; TG1 ×1.86). By L31, `track-groups-ui.test.tsx` and `track-group-collapse-ui.test.tsx` get no new rows until they are split or measured again under 50 % | `a-round-361/a-tests-head-scratch.log`, `gates/round-360/verify.log`, `gates/round-361/verify.log` |
| **GATE361-S1-COLLAPSED-HEADER-RENDERS** (gate reviewer finding 1, Medium) merged with A-R361-REVIEW-CANDIDATES-ARRANGEMENT-DEP (Low) | **Not a regression from round 361. The proposed fix saves only the wrapper render, not the leaf. Re-graded to Low (perf signal) and routed to PERF-11.** B measured how often the collapsed group's leaf `ArrangementGroupHeader` renders when a clip *outside* the group is nudged (test GHR1, scratch only): **1 render at `93ea6c1` (before round 361) and 1 at `6fdd82f`.** With both `activeCandidateTrackIds` and `overviewClips` kept stable per group, the memo comparator reports no changed prop, so the `…WithSelectionInner` wrapper is skipped, but the leaf header still renders once (leaf count 1 → 1). The reason is that `ArrangementGroupHeader` calls `useArrangement()` itself (body l.48), so every new context value re-renders it. The real fix is for the header to subscribe through selectors, plus a collapsed-group row in the perf harness (the reviewer's own Architecture proposal). That belongs to PERF-11, which owns context consumers. It is not a Medium-first bug fix | `b-round-361/ghr1-old.log` (93ea6c1), `ghr1-sc.log` (6fdd82f), `ghr1-stable-props.log` + `stable-props-experiment.diff.txt`, `ghr1-test.tsx.txt` |
| GATE361-L2-DOC234-UC7-WORDING (gate Low 2) | Fix it in the next round that grants doc 234. Round 362 grants doc 234 (§1.2 of the task), so it is fixed there: `UC7 (არსებული, უკვე HEAD-ზე)`, as in task §1.2 | `gates/round-361/review-result.json` finding 2 |
| GATE361-L3-LIBRARY-ACTIVE-RAW (gate Low 3) | **Deferred Low** (`deferred_low_polish`). `ArrangementLibraryPreview` is a single panel and already reads the whole `useArrangement()`. The raw id costs at most one extra render per active-lane change. The reviewer calls it "no regression" | reviewer finding 3 |
| Reviewer info 4/5 | No action | — |
| Architecture notes (A reviewer and gate reviewer) | Recorded as `architecture_signals` SIG-R361-SELECTION-STORE-OWNER (keep) and SIG-R361-CONTEXT-LEAF-CONSUMERS (PERF-11 input). They are not tasks. The checkpoint request in `b-round-358/root-request-arch-checkpoint.md` stays open and does not block | — |

## 3. Next round (D-29z1174)
- Round 362 is **PERF-10b-ii-a: the Transport Play/Stop leaf** plus B-R356-PLAYBACK-SETTER.
- PERF-10b-ii is split again (D-29z1175), because it bundled four items:
  - **10b-ii-a** is the app change: the play leaf and the reader-only store type.
  - **10b-ii-b** covers the harness rows: C-R320-01 (with A-R320-REVIEW-WAVEFORM-NAME-POSITIVE) and GATE320-S3.
- B's sketch and its perf evidence are in `b-round-361/`, as described in `current-task.md` §0.

## 4. Order after 362 (D-29z1176)
1. REGRESSION at the first planning on or after 2026-11-08.
2. PERF-10b-ii-b.
3. PERF-9, then PERF-11 (it absorbs GATE361-S1 and SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE), then PERF-12…15.
4. SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries.

RETRO runs at round 368 or at the end of STUDIO-PERFORMANCE.

## 5. Round-362 evidence (B's sketch, `b-round-361/`)
- **Sketch.** `sketch.patch.txt` covers 5 app and test files, and `budgets.patch.txt` covers 3 rows. Both sha256 are in `sketch-dispatched.sha256`. typecheck rc 0, biome clean, lint 205. The 15 covering files pass, 284 tests (`sketch-covering-final.log`).
- **Perf, leaf only** (`perf-sketch.log`): Play/Stop 28 → 11, click 42 → 38. 44 rows differ from C361, all of them decreases.
- **Perf, final full sketch with asserting budgets** (`perf-final.log`): 95/95. The 44 DIFF rows are the same as in the leaf-only run. `durationMs` 503995.
- **Mutants.**
  - MU-A goes red in jsdom on 3 rows.
  - MU-B goes red in perf only on `click.components`: 43 > 38. B predicted 42; the one-component miss is recorded in `checkpoint.md`.
  - MU-C goes red on PS4.
- **L23 collision found by B first:** `render-budget.test.tsx` has three `ArrangementTransport > 0` positive controls. They are granted in the patch as equal-or-stronger replacements.
- **Full vitest on the sketch** (`precheck-full.log`): 248 files, 3644 tests, rc 0.
- **Claims:** `claims-362.sh`, with outputs `claims-362-planning-output.txt` (`6fdd82f`, clean) and `claims-362-sketch-output.txt`. K10 shows 0 missing.

## 6. Advisor and consults
- **Advisor:** consulted before the approach was fixed. It asked B to measure GHR1 on `93ea6c1`, which was done, and to check the ≤ 20 premise, which was done: the 28 comes from the Transport body.
- **Project consult agents:** none this round. The design follows the PERF-10 split already reviewed by tech-lead and performance-optimizer (D-29z1153, `b-round-356/sketch-review.md`), and B's measurement replaces an estimate.

## 7. Status
Planning is complete. The decision is CONTINUE (`b-next.json`). The store is unchanged by B: only the scratch under `/home/runner/b362-scratch` was edited.
