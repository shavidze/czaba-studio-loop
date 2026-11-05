# B — Round 342 → 343 planning

Decision: **CONTINUE**. D-IDs D-29z1075 … D-29z1078. Backlog v301 → v302 (`b-round-342/update-backlog.py`, `update-feature-status.py`). Backups are in `b-round-342/*-before-343.*`. Round 342's task is archived as `tasks/round-342.md` (a copy; nothing was deleted).

**Advisor:** available. I consulted it after orientation and before writing. I followed its steps, including the K8 drift and the 403 auth oracle. I consulted it again before declaring done.

## Inputs read
- `context/active-summary.md`.
- `gates/gate-round-342.json`: `skipped`, "no real changes", HEAD `99a5912`. Gates 340 and 341 are also `skipped`, so 339 is the last publication.
- `regression-last.json`, `env-status.json` (store 200).
- `current-task.md` (round 342), `a-round-342.md`, `c-round-342.md` and `c-round-342.json`.
- `b-round-341.md`, `b-next.json`, and the c4-ii draft with its claims in `b-round-339/`.
- `root-pre-push-review.md` and `publication-checkpoint.json` are old (October); they hold no new remaining findings.
- I did not read the full backlog or plan; I edited `backlog.json` by script only.

## Round 342 result (independent C evidence)
- **Status:** `taskStatus` PASS, with `browserVerified` and `realVerified` true. `stopSignal`: "all 12 rows have a result".
- **PASS:**
  - SOURCE-SCOPE at start and end;
  - WK-GUARD;
  - WK-HEAD-CONTROL (the control differs from the guard, as required);
  - RS-1280;
  - RS-MAP;
  - RG22-NARROW;
  - PRICE;
  - G342-AUTH: "Sign in required", 0 `audio[src]`, 401/400/403, no token in any body, `/studio-lab` anonymous.
- **Recorded:** RP301, RP-BUILT, POSCTL.
- **0 new bugs and 0 Medium+.** The re-seen Lows are already deferred: C-R186-02, C-R301-01 and C-R331-01.
- **Outcome table (D-29z1074), row 1 applies (D-29z1075):**
  - REGRESSION-ROUND-2026-11-05 (rounds 340–342) is done;
  - `regression-last.json` = 2026-11-05 / round 342, so the next regression is due on or after 2026-11-08;
  - no item changes status.
- **Oracles for the next regression (D-29z1076):**
  - POSCTL = the `c-round-342` run (`valid=false`, starts=1);
  - FONT-PIXEL = `c-round-341/out/fonts/`;
  - sc-tree-1280 tabs = 27.
- **INFO-C340-EARLY-END** did not repeat this round. No lesson changes: C's lesson evidence is already in L38. `lessons.md` stays at 60 lines.
- **Limit carried:** the RP-SAME-TEXT-RACE and GATE328-S1 triggers cannot be reached from the page, so the race is not proven absent. A-R328-REVIEW-SAME-TEXT-RACE stays open.

## Next task: round 343 = PERF-DRAG-PREVIEW c4-ii (D-29z1077)
- **The package, applied as the carry-forward said.** It is the `b-round-339` package. HEAD is unchanged (`99a5912`), so nothing was re-measured. What I checked at this planning:
  - `git apply --check`: 3/3 OK;
  - `claims-340.sh` output equals the planning output (checked before `regression-last` changed);
  - round 341's RR-PERF gave 0 DIFF against `c-round-339`.
- **Budgets patch regenerated** for the "(round 343)" note text: `b-round-342/sketch/budgets.patch.txt`, made by `apply-budgets-343.py`.
  - It applies on HEAD.
  - Its diff to the old patch is the note text and the git header only.
  - K6 on the patched tree is `219 26 12 55 10`.
- **New claims script:** `b-round-342/claims-343.sh`, with K12 extended. The expected outputs are regenerated, because K8 moved to 2026-11-05.
- **The auth oracle is corrected (D-29z1078).** The draft expected fake Bearer → 500. C measured 403 with the mock API up in rounds 341 and 342, so the row now expects 403 while the mock is up (500 only when it is down).
- The task is built by `b-round-342/build-task-343.py`, which takes the draft and adds `task-343-head.md` on top. D-29z1049 … D-29z1058 are kept as history.
- **Not applicable to this round,** because it is a pure performance round and behaviour is held to HEAD: reference-first, the product-designer consult, the screen budget and the YouTube request. That is unchanged from the draft. C's browser rows (GROUP-BEHAVIOUR, OVERVIEW-FOLLOWS, BLOCKED-STATUS) hold the behaviour.

## Scope and gates
- **No scope was shrunk** and no feature request was deferred. Professional plugins, pitch and multi-video layers stay out of scope as before.
- **Bugs:** no open Critical or High. The open Mediums are root, manual or `awaiting_user` only (2026-10-23 clarification).
- **Purchase protection:** G342-AUTH PASS. `/studio-lab` opens anonymously.
- **Decision:**
  - not COMPLETE: 34 items remain in `b-next.json`;
  - not BLOCKED: nothing external is missing.
- **Architecture:** the reviewer notes stay signals. The frontend-architect checkpoint `ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE` is still requested after c5, so it is not due now.
- **Commit readiness:** none. Round 342 changed no source.
- **RETRO:** the last was 336; the next is due around round 351.
- **Still open for root:**
  - checkpoint D-29z915;
  - ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS.
