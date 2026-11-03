# B round 313 → 314 planning

**Date:** 2026-11-03 · **Baseline:** HEAD `dfa4502` (gate 313 `skipped`, "C taskStatus FAIL") + A's round-312 and round-313 tree, uncommitted (11 entries) · **Decision:** CONTINUE → round 314 = PERF-5a close-out (C-R313-01 + round 313's docs and review)

**Advisor:** available and consulted before the ruling (its advice: probe what the extra commit renders before ruling; no contract relaxation without a cause) and before hand-off.

## 1. Round 313 ruled on evidence (D-29z841)
**C round 313: FAIL.** `browserVerified` and `realVerified` are true.
- **Passed:** CARRY-312, HARNESS-PASS (2/2, live ≥ 50, `loafEntries` 1), HARNESS-HEAD-CONTROL, MU-LIVE-BUSY0 (red as required), LOAF (C's own 4 mutants red), PK-SANITY and G313-AUTH at both viewports.
- **Failed:**
  - DOC and A-REVIEW: not done, because A stopped.
  - A-PERF: A's 2 runs failed on **C-R313-01**.
- **A's STOP was correct** under §9. The round-313 sketch stays applied and is not re-applied.
- **`tasks/round-313.md`** is a byte copy of the old `current-task.md` (`b-round-313/round-313-task-copy.md`, claim K15).

## 2. C-R313-01: cause found, not guessed (D-29z842)
**What C saw.**
- `fader.clipgain.playing.commits-per-move.6x` and `release-commits.6x` read 91/1 or 92/2.
- A run whose three 6× passes mix the two values fails.
- The 92/2 value also appeared on the HEAD app and under the HEAD harness, so it predates rounds 312 and 313.
- A scan of every saved perf JSON (3,424 release-commit row samples) found no other within-run variation.

**B's probe** (`b-round-313/probe/`, scratch `/tmp/b314s`, 2 runs alone):
- **Setup.** The instrumentation recorded the component names of each commit, and the spec recorded the release window's commits relative to pointerup.
- **Result.** Run 2 caught a 92/2 pass:
  - release commit 1, at +6 ms: `Pm, Pm, ArrangementDetailClipGain` (the fader's own release, as in every 91/1 pass);
  - release commit 2, at +28 ms: `_0, D0, A0`. In the production bundle (`minified-names.txt`) these are `ArrangementRuler`, its ticks and its ruler playhead. The ruler subscribes to timeline scroll.

**Mechanism.** tech-lead, from code:
- Follow is `'on'` by default.
- The Follow position subscriber returns early while a pointer gesture is active (`StudioWorkspace.tsx:1963-1969`).
- So a page turn that falls due during a drag fires on the first position tick after pointerup.
- The playing fader drags run back to back on one playback, and clip gain is the last and slowest at 6×. Whether the turn lands right after its pointerup depends on the run's timing.
- The 92/2 pass had the longest drag.

**Ruling.**
- This is a harness scenario confound, not an app defect: following the playhead is correct, and it is not a fader cost.
- It is also not a reason to loosen the rows. The fix keeps every row exact:
  - The harness turns Follow off after the `play.idle-*` window and before the playing faders. It stays off through Stop and Play.
  - Each playing drag asserts that Follow is off.
  - Each drag asserts that `scrollLeft` is unchanged from before pointerdown until quiet.
  - An idle bracket asserts no scroll from idle start until after Follow off.
- **Rejected:** a `wallclock` kind, an allowed set, a re-run budget, seek-before-drag, an app change, and editing 24+ budget notes.

## 3. B's pre-check (L23/L37: the perf spec on the final sketch)
| Check | Result |
|---|---|
| `tsc --noEmit` | rc 0 |
| `report.test.ts` (scratch config) | 34/34 (29 + 5 SCROLL1) |
| Unit mutants (`unit-mutants.sh`) | 5/5 red; restored 34 |
| k1, k2 (sketch before the idle bracket) | 0 failures; 6× clip gain 91/1 in all 6 passes; **164/164 deterministic rows equal** to the HEAD-harness control (`precheck-row-compare.txt`) |
| k3 (final sketch) | 0 failures; 6× clip gain 91/1 in all 3 passes; 164/164 deterministic rows equal to the control |
| Browser mutant (Follow-off removed + `scrollLeft += 50` after pointerup) | 117 failures, all from the new guards: 81 scroll, 12 "Follow is on", 24 "Follow is paused" |

`git apply --check` of `b-round-313/sketch.patch.txt` succeeds on A's tree.

## 4. Consults
- **tech-lead:** change (small).
  - Adopted: the idle bracket.
  - Not adopted: Follow-off wording in `budgets.json` notes. The precondition is one fact about the scenario, so it lives in one place: `passSequence` and doc 163.
  - Recorded: R313-METER-OVER-LATCH-WATCH (info) and R313-FOLLOW-PAGE-TURN-COVERAGE (signal). Scroll-event counting is optional.
- **performance-optimizer:** not consulted. This is a harness fix-up, not a new PERF task.

## 5. Findings and bookkeeping
| Id | Severity | Ruling |
|---|---|---|
| C-R313-01 | Medium | Round 314 (D-29z842) |
| C-R312-01 | Medium | Fix applied in round 313; it closes with round 314's C PASS and the gate |
| R224-WINDOW-BOUNDARY-WATCH | info | Note added: the first variation had a scenario cause; the watch is kept |
| R313-METER-OVER-LATCH-WATCH | info | New watch |
| R313-FOLLOW-PAGE-TURN-COVERAGE | signal | Not scheduled; decided at PERF-5b or PERF-7 planning |

- No Critical or High finding is open. C-R313-01 is the only open Medium in this stream, and it is scheduled now.
- **REGRESSION is not due:** the last one was 2026-11-02, so the next falls on or after 2026-11-05.
- **Updated:** `backlog.json` v273 (D-29z841…D-29z844), `feature-status.md`, and `lessons.md`, where L37 gains the name-the-extra-commit clause (59 lines).
- **Backups:** `b-round-313/backlog-before-314.json`, `feature-status-before-314.md` and `lessons-before-314.md`.

## 6. Architecture checkpoint
None requested. This round touches only the perf harness. There is no new structural risk on one owner.

## 7. Commit readiness
After C PASS on round 314 and the gate, root can publish:
- round 312's 7 paths;
- the 4 perf files of rounds 313 and 314;
- doc 163.

PERF-5a is then done.
