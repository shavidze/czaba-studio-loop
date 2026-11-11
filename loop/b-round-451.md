# B round 451 → 452 planning

**Date:** 2026-11-11. **Advisor:** available; consulted after orientation and before writing (and again before finishing). **Consults:** `tech-lead` (review 4 on sketch v5, read-only, own clone `/tmp/tl452`).

## Inputs read
`current-task.md` (round 451, archived byte-identical as `tasks/round-451.md`), `a-round-451.md`, `c-round-451.md`, `c-round-451.json`, `gates/gate-round-451.json` (`skipped`, C FAIL), `context/active-summary.md`, `lessons.md`, `regression-last.json` (2026-11-10). Backups: `b-round-451/{current-task-before-452.md, backlog-before-452.json, feature-status-before-452.md, b-next-before-452.json}`.

## Round 451 result (only C's independent evidence counts)
- C: `taskStatus` FAIL, short route "STOPPED — routed to B" (L22), `browserVerified`/`realVerified` true. `tools/l57-check.py` gives L57 OK (`b-round-451/l57-check-c451.txt`).
- PASS rows: C1, C2, C3, C10 (anonymous auth guard at both viewports), C11 (Studio smoke at both viewports), C12, plus the STOP's named check (reproduced).
- Not C-verified: C4–C9. A's own results for them do not count.
- Gate 451 is `skipped`, so the baseline stays `a8599a2`.
- **Bug A-R451-REVIEW-M1-GT5-BARREL-SCOPE (Medium, origin `B spec`).** v4 widened GT5's exclusion list (3 → 5 barrels). This is B's planning miss: the L4 pin map called it "stronger", and no mutant removed a HEAD exclusion pin.
- **Backlog changes (v440 → v441):**
  - The Medium is added as `open_findings`, scheduled for round 452.
  - SYS-R450 and its 7 ids **stay open**; nothing is closed.
  - A's reviewer Lows L1–L3 go to `deferred_low_polish`, marked as not C-verified (L2 confirmed by tech-lead).
  - `confirmedBy` on TL-R449-D2-BARREL-ALIAS, TL-R451-L1…L4, the three INFO-TL-R451 ids and SIG-R451-STYLE-SCAN-ENGINE-POLICY (A's architecture note).
  - INFO-A451-L60-SED-DOC, INFO-C451-AUTH-COLD-START and INFO-TL-R452-SELECTOR-SHIFT are logged.
  - Retro candidate RETRO465-B-EXCLUSION-LIST-AS-STRONGER is added.
- **Nothing is marked done or მზადაა.** Round 451 is "ბაგია" on the board.

## Ruling and next task (D-29z1605…D-29z1607)
**Ruling (L10).** The Medium is **fixed, not accepted**. Sketch v5:
- **GT5:** `BARREL_FILES` goes back to HEAD's 3, so GT5 behaves exactly as at HEAD.
- **GT5b:** it excludes only each dead module's own barrels (`deadModuleBarrelFiles`).
- **Dispatch:** a v4→v5 delta (sha 2acc3672…), plus a ruled fallback (the full v5 patch, sha c7b048d4…) if the tree comes back clean.

**Evidence** (`b-round-451/`):

| Check | Result |
|---|---|
| Mutants on v5 | 57; new N8h, N11, N11b red as predicted |
| HEAD control | 37; N11 and N11b red at HEAD |
| v4 control | N11 and N11b green, which is the bug |
| Golden G1 | equal, the same JSON as v4 |
| Prechecks | typecheck rc 0; lint 205 warnings; covering 16/16; full suite 282 files / 4,128 tests on the sketch |
| `git apply --check` | on a copy of A's tree: rc 0 |
| Scope sweep | every HEAD constant, list and filter, in `scope-sweep.md` |
| `tech-lead` review 4 | **APPROVE**, no Medium+. It started on the frozen v5 commit while the HEAD-control mutants and the full-suite precheck were still running (L58 asks for the review after them). The reviewer re-ran N11/N11b at HEAD itself, and both later runs matched the predictions, so no re-review was needed |
| Claims K1–K33 | both outputs written; stderr empty |
| L58 | OK |

**Next task:** round 452 = SYS-R450-STORE-STYLE-SCAN re-dispatch (`current-task.md`).
- **Grants:** the same 5 paths, but only the gradient test file (via `git apply`) and doc 295 actually change.
- **C runs the full C1–C12.**

## Queue position, unchanged
After round 452:
- **Round 453:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13, otherwise STORE-2b-3b.
- **Then:** STORE-2b-3c, 2b-3d, 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
- **Next RETRO:** round 465.
- **Architecture checkpoint:** none requested. This is a test-only helper inside a systemic task, and the architecture note is a signal only (SIG-R451). It is not a feature boundary and not a repeated structural risk on a runtime owner.

## Readiness
- Nothing in this round is ready for a commit: gate 451 skipped, and A's v4 tree must not be published until C passes round 452.
- Not COMPLETE: STORE-REDESIGN remains, with the rest of the queue, the deferred Lows and the Tech Lead manual checks.
- Not BLOCKED: every round-452 row runs in the cloud. The only exception is the fake-bearer premium path, which needs the backend.
