# B round 334 → 335 planning (2026-11-04)

**Decision: CONTINUE.** Round 335 = PERF-DRAG-PREVIEW stage c3-i on `0d22ab9`: a test-only cross-lane move row in the interactions perf harness, recorded at HEAD.
- The task is in `current-task.md`.
- The round-334 task is archived as `tasks/round-334.md`, a byte-equal copy (`cmp` checked).

## 1. Round 334 closed from evidence
- **C:** `c-round-334.json` is PASS, with `browserVerified` and `realVerified` both true.
  - 13 rows passed, 0 bugs, 0 blocked.
  - The six gate rows are not claimed by C.
- **Gate:** `gates/gate-round-334.json` is `published`, commit `0d22ab9`, and both remotes equal it. The review says COMMIT OK. **The baseline for round 335 is `0d22ab9`.**
- **Backlog:**
  - stage c2b-iii → done, and PERF-CAND-PEAK-PRIMITIVE-PROPS → done (D-29z1004);
  - PERF-DRAG-PREVIEW stays `in_progress`, because c3–c5 remain.
- **Evidence for the numbers:** `c-round-334/perf-rowcmp-vs-c333.txt` has fade 9.833 per move (max 10) and move 24.267 (max 101), equal to B's sketch. 104 rows are EQUAL and 17 lower.

## 2. Rulings on the round-334 findings
| Id | Origin | Ruling |
|---|---|---|
| Gate finding 1 (`clipWaveformScale` has no production caller) | gate reviewer | Evidence on SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY (D-29z1005) |
| Gate finding 2 (inline dB in the context) | gate reviewer | Evidence on SIG-R334-INLINE-DB-GAIN (D-29z1005) |
| GATE334-I3 (doc cites the sketch numbers) | gate reviewer | Closed as info. C's measured values equal them |
| GATE334-I4 (exact render-count pins) | gate reviewer | Accepted as info |
| ARCH-R334-PEAKPATH-FILE | gate reviewer (Architecture note) | Backlog signal, not scheduled. It runs after c3–c5 and is added to checkpoint D-29z915 |
| A-R334-REVIEW-WG9-UNDEF, -DP-ORDER, -DP43-DETAIL | A code-reviewer | `deferred_low_polish` (D-29z1006). Round 335 does not own those files |

There are no open Critical or High findings. The open Mediums are root-only or manual (Tech Lead), and the 2026-10-23 clarification says they do not block.

## 3. Why c3-i now
- **REGRESSION is not due.** `regression-last` is 2026-11-02, and today is 2026-11-04: 2 days, where the rule needs 3.
- **The checkpoint gets no more waiting.** D-29z915 stayed unanswered through rounds 332–334. B applies the recorded default, keep (D-29z1007), as for ARCH-R207 (D-29z182), and adds a short addendum (`b-round-334-checkpoint-addendum.md`). It is not BLOCKED: nothing external is required.
- **Split (D-29z1008).** The harness has no cross-lane scenario: no matching hits in `perf/` or `app/` [K5], and `dragNames` is horizontal only [K3]. Under L37 and L58, no c3 row can be asserted before it has been measured. So:
  - c3-i adds the row and records HEAD;
  - c3-ii does the store change.
- **The premise was measured at HEAD in the browser** (`b-round-334/cross-head-1440-summary.txt`; two identical runs, `cross-head-stability.txt`):
  - a same-lane move commits 19/19/101/19 components with no provider render;
  - a cross-lane move commits **87 per move, and `ArrangementProvider` renders on every move** (provider hooks 0 and 35 change);
  - the ghost appears on `stems` and clears on return;
  - release commits 93, and Undo restores.
- **Not applicable:** reference-first, `product-designer`, the screen budget and the YouTube request (test-only round). No consult was run this round; c3-ii will consult `performance-optimizer` and `tech-lead`.

## 4. Scope and policy checks
- **Ownership:** A owns 4 files: the perf spec, the interactions budget file, doc 232 and three sections of doc 168.
  - `app/**`, `perf/lib/**` and the protected files are untouched [K15, K8].
- **No full suite for A or C.** A runs typecheck, lint and the perf spec alone (plus one mutant run). The full suite stays a gate row.
- **Every new row is `record`** (L58). The liveness row is converted to assert in c3-ii.
- **L37:** the segment windows are `wallclock`. One kind change (deterministic → wallclock) is pre-ruled, so it is not a STOP (L10).
- **Lessons:** unchanged. The round-334 candidate (perf mutant sets must include a stale-derived-value mutant) is still seen once and stays a RETRO candidate.
- **Advisor fixes applied to the task** (backup `b-round-334/current-task-before-advisor-fixes.md`, script `apply-task-fixes.py`):
  - A-REVIEW is required (4 files, the 3+ rule).
  - The max comparison is report-only.
  - Ghost reads settle with rAF or `waitFor`, not `waitForQuiet`.
  - `setLive` runs after the reset, and (d) is a re-read.
  - The lane window starts at `firstMove`.
  - The L23 sweep found DC-KINDS in `perf/lib/report.test.ts` (no new `commits-per-move` metric). It is now an A and C row through the scratch config `b-round-334/vitest.perf-lib.config.mjs`, 34/34 at HEAD [K17–K20].
- **Claims:** `b-round-334/claims-335.sh`. Its output at HEAD is `b-round-334/claims-335-planning-output.txt`, run again after the last edit.

## 5. Architecture checkpoint
- D-29z915 is unanswered, so the default keep applies (D-29z1007).
- The addendum asks two questions:
  - Should c3-ii follow the PERF-8a store pattern in place?
  - Should ARCH-R334-PEAKPATH-FILE and the preview-readers extraction be one no-behaviour round after c5, or two?
- It does not block anything.

## 6. Order after round 335 (D-29z1009)
1. **Round 336:**
   - if its planning is on or after 2026-11-05, 336 is the REGRESSION round, then 337 is RETRO;
   - if it is earlier, 336 is RETRO, then REGRESSION follows on the first planning on or after 2026-11-05.
   - The REGRESSION entry gained a c2b-iii row and a c3-i row.
2. c3-ii (the `clipLaneDrag` store, against `c-round-335/lane-rows.txt`), then c4, then c5.
3. The record → assert conversions.
4. PERF-9…15, then SYS-R2-FAKE-FIDELITY, then SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3, then STORE-2b…5.
6. REVIEW-RECOMMENDATIONS, then T12-ADVANCED, then the phase-2 entries (skip rule).

## 7. Commit readiness
- Round 334 is published (`0d22ab9`).
- Round 335 is ready only after C PASS and the root gate.

## 8. Advisor
The configured advisor was available. It was consulted before the approach (c3 vs waiting for the checkpoint, the split check, the bookkeeping) and again before declaring the planning done.

## 9. Housekeeping
- **Store:** unchanged; `git status` shows 0 entries. B ran only the read-only probe against the existing :5173 dev server.
- **Backups:** `b-round-334/backlog-before.json`, `b-next-before.json` and `feature-status-before.md`.
- **Update scripts:** `b-round-334/update-backlog.py` (backlog v293 → v294) and `update-feature-status.py`.
