# B round 320 → 321 planning (2026-11-03)

**Decision: CONTINUE.** Round 321 = RETRO 321 (window 305–320), no app code. Baseline `53c5c79` (gate 320 published).

## 1. Inputs read
- `context/active-summary.md` (head), `current-task.md` (round 320), `a-round-320.md` (§3 notes, signals), `c-round-320.md`, `c-round-320.json`, `gates/gate-round-320.json`, `gates/round-320/review.md`, `regression-last.json`, `lessons.md`, `retros/retro-305.md` (§9–§13), `tasks/round-305.md` (form), `tasks/round-318.md` l.102 (the grant). Backlog entries looked up by id only.
- `root-pre-push-review.md` and `publication-checkpoint.json` are dated 2026-10-07; their findings were handled long ago. Nothing new.
- **Gate 320:** `published`, commit `53c5c79…` on both remotes. That is the round-321 baseline.
- **Archive:** `tasks/round-320.md` did not exist, so I copied `current-task.md` there before writing the new task (`cmp` equal; claim K16).
- **Advisor:** available and used once before the approach. A second call follows at the end.

## 2. Evidence-based closure (only from C's independent results)
- **Round 320:** C PASS, `browserVerified` and `realVerified` true, 24 rows in `passed`, gate rows not claimed. **PERF-8a → done (D-29z880).** It is "მზადაა" because every browser row of the round ran at both viewports.
- **Closed** by C round 320's evidence: C-R318-01/02/03/04 and C-R319-01/02/03.
- **Not closed:** C-R318-06 (Low, provisional; its repro row goes to the next REGRESSION). C-R320-01 is new and goes to PERF-10 as a required row.
- **Store tree after all five consults:** `sha256sum -c --quiet b-round-320-r321-tree-sha256.txt` rc 0, `git status` empty, HEAD `53c5c79`. `design-philosopher` (it has Write) was told to write nothing, and nothing changed.

## 3. Commands behind the one-line data files (run from the loop root)
- `l57-fields.txt`: a python loop over `c-round-305…320.json` printing ABSENT / null / set for the 7 L57 keys.
- `stops-count.txt`: `for n in $(seq 305 320); do printf "%s " $n; grep -c 'STOP — needs B ruling' a-round-$n.md || echo none; done`. `grep -c` prints 0 and then "none" on a 0 count, so a 0 line followed by "none" means 0.
- `task-titles.txt`: `head -1 tasks/round-N.md | cut -c1-230` for 305…320.
- `b-running-median.txt`: running median of column 2 of `cost-rows.json`.
- `unfailable-assert-fields.txt`: `assertsSpecified` / `mutantsRecorded` / `mutantRedOnSketch` of `c-round-310/311/319/320.json`.
- **Correction after `update-backlog.py`:** the STOP-round sum in `RC-R275-STOP-ROUTES-TO-B.status` was typed as $77.52. The sum from `cost.txt` per-round is 18.59 + 32.79 + 26.80 = **$78.18**. I fixed it by a one-off python replace in `backlog.json` and in `retro-321.md` §12. I also corrected two numbers in `retro-321.md` while cross-checking: the gate review.md count is 10 files (not 11), and line 3 is 808 bytes (`wc -c`). After the advisor review I restated L23 and line 3 in bytes (L23 5,058, +789 since RETRO 305) and fixed the inventory count to 10 ids.

## 4. Consults (read-only)
| Agent | Used for | Key conclusion (opinion) |
|---|---|---|
| `tech-lead` | the retro: causes, lessons, gate-320 items | All three chains wrote asserted numbers, names or byte pins from inference, not from C's command on the sketch → one unconditional rule (L58). Merge L16 into L3. GATE320-S2 is Low/signal and settled by a browser experiment. Request a checkpoint at the PERF-8 boundary. C-R320-01 → PERF-10 required row |
| `consequence-tester` | EXP-R305 verdict, successor experiment | Stopped and refuted literally; the design failed first (`mutantRedOnSketch` measured A's tree in 318–320). Successor EXP-R321-PRECHECK-GATES. The missing manifest fields break L57 but are not an EXP stop |
| `product-designer` | screen and journey review | No visible change since 305. Three new candidates (SR-321-1/2/3); the weakest step is still SR-305-3 |
| `design-philosopher` | screen review | Five items; three are new (SR-321-4/5, part of SR-321-6's area); the rest map to existing ids |
| `first-visit-host` | journey review | The stall point is still the arrival; four items, of which N4 is new (SR-321-6) |

`qa-engineer` is not on B's consult list. `performance-optimizer` was not needed: no PERF task is planned this round.

**Disagreement handled:** C wanted C-R320-01 promoted to a required row now. RETRO changes no code, so it becomes a PERF-10 required row (with `tech-lead`), not a deferred Low. DP's "1 audio files", "Undo: Ad…" and export range repeat were already queued (STORE-4 F3, SR-245-7, SR-290-1/2), so they are not new candidates.

## 5. Architecture checkpoint request for root (ARCH-CHECKPOINT-PERF8-STORE-PATTERN, non-blocking)
Trigger (`architecture-checkpoint.md` timing): a stage boundary (PERF-8a done, PERF-8b next), plus an ownership signal (range moved from the context into a zustand store) with file evidence, plus an invariant change found by the gate (the `useArrangement()` shape). Questions, each with keep/extract, value, risk, max three sentences:
1. Confirm D-29z193 (zustand for new Studio stores; mix draft onto zustand in PERF-8/PERF-10) as the standard. Should `REACT_CONTEXT.md` record it? That is a proposal for Saba; the loop does not edit `.claude/**`.
2. Accept the `useArrangement()` shape change (range out, read with `useArrangementRange`) as an invariant change, granted in `tasks/round-318.md` l.102.
3. Keep or extract: the detail panel's range subscription (A-R319-ARCH-DETAIL-SUBSCRIPTION, A-R320-ARCH-USE-DETAIL-RANGE).

If there is no answer before the PERF-8b planning, PERF-8b follows D-29z193. Independent work is not delayed.

## 6. Scope bookkeeping
- No scoped item is shrunk or deferred without authorisation. Out of scope stays as before: professional plugins/effects, pitch, multiple video layers. Grid tempo is not audio stretch.
- `/studio-lab` stays demo-only and public. Purchase protection is checked by G321-AUTH. No protected file has a grant.
- **COMPLETE is not possible.** Many scoped entries remain (STUDIO-PERFORMANCE stages, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, `deferred_low_polish`, SRW-21 `deferred_user`).
- **BLOCKED does not apply.** Nothing needs external information to proceed.
- **Commit readiness:** nothing in `store/` changes this round. Root records the loop state only.
- **For the next planner (L57 new clause):** the PERF-8b or REGRESSION task must list the complete L57 field set: the eight fields of this task, `mutantRedOnTree`, and the three EXP-R321 fields. A shorter list breaks the lesson written here.

## 7. Files written by B this planning
`tasks/round-320.md` (archive), `current-task.md`, `retros/retro-321.md`, `lessons.md`, `user-review/screen-review-321.md`, `backlog.json` (v280), `feature-status.md`, `b-round-320.md`, `b-next.json`, `b-round-320-r321-tree-sha256.txt`, and everything under `b-round-320/`. The mock backend I started for the captures was stopped (`b-round-320/mock.pid`).
