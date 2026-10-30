# B: round 274 → 275 planning (2026-10-30, D-29z605…D-29z612)

**Decision: CONTINUE.** Round 275 is **RETRO 275** (window 260–274) with the whole-screen review.
- **Task:** `current-task.md`. No app code, 0 grants, and 1,138 tracked files frozen at the gate-274 baseline `a4c0e24`.
- **Grants:** `b-round-274-r275-grants.txt` (empty).
- **Frozen list:** `b-round-274-r275-tree-sha256.txt`.

## 1. Inputs read
- **Gate:** `gates/gate-round-274.json` is `published` with commit `a4c0e24` on both remotes, so the baseline HEAD is `a4c0e24`. `git status` was empty at planning (`b-round-274/git-status-at-planning.txt`).
- **Round 274:** `current-task.md`, archived as **`tasks/round-274.md`**. The archive did not exist; it was copied with no-clobber and `cmp`-checked before the new task was written.
- **Reports:** `a-round-274.md`, `c-round-274.md`, `c-round-274.json`, and `gates/round-274/review.md` (8.5/10, COMMIT OK, 5 suggestions plus an Architecture note).
- **Context:** `context/active-summary.md` (head only), `lessons.md`, `b-round-273.md`, `retros/retro-260.md`. Specific ids were looked up in `backlog.json` with Python and in `feature-status.md` (FB-01…FB-16, §5, §7) with grep.
- **Regression date:** `regression-last.json` says round 258, 2026-10-30. The next regression is due on or after 2026-11-02, so it is **not due**.
- **User-review folder:** no new decision files. `grep SABA-B-1[2-9]` finds 0.
- **Advisor:** available and consulted twice. The first call was before the approach; the second resolved the `tech-lead` disagreement on GATE274-S1.
- **Project consults (read-only, all actually run):**
  - `tech-lead` and `consequence-tester` (retro);
  - `product-designer`, `design-philosopher` and `first-visit-host` (screen review). `design-philosopher` was told to write nothing, and the store tree hash was re-checked afterwards: rc 0.

  `qa-engineer` is not in B's consult list.

## 2. Round 274 result (D-29z605)
- **C PASS:** 18 rows at both viewports, `browserVerified` and `realVerified` true, 0 bugs. Two info notes.
- **Gate 274:** published `a4c0e24`.
- **Closed** on C's independent browser evidence:
  - C-R271-01-NUDGE-STALE-STATUS;
  - GATE270-S2-REPEAT-ANNOUNCE (premise false: B-ENTER-TWICE gave 2 mutations per Enter);
  - A-R273-REPEAT-PASTEND (superseded);
  - GATE273-S4.

  The first two were removed from `deferred_low_polish` and kept in `open_findings` as closed.
- **SYS-6 STATUS-LIFETIME is done** (stages 272, 273 and 274). No browser half is pending.

## 3. Gate-274 triage (D-29z606)
| Finding | Ruling |
|---|---|
| S1 (Medium): a held ArrowRight on one clip announces every repeat | **GATE274-S1-HELD-REPEAT-ANNOUNCE, `open_tech_lead_manual`**, manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290. <ul><li>Why: it is the round-274 contract (SK13, doc 205), and the reviewer said to test it with a real screen reader before deciding. Under the 2026-10-23 root clarification it does not block.</li><li>`tech-lead` wanted a settle/keyup fix now. B did not take that, because each replacement is a contract change with no evidence yet; the advisor agreed.</li><li>The jsdom-testable half (the re-key count) is recorded as the future fix target.</li></ul> |
| S2 (group hold text), S3 (anchor guard; INFO-C274-02 folded in), S4 (`>=`), S5 / A-R274-GROUP-NUDGE-FLOAT-DRIFT (INFO-C274-01: model only) | `deferred_low_polish`: 462 − 2 + 4 = **464** |
| Architecture note | **GATE274-ARCH-NUDGE-DESCRIBE**, a signal. `b-round-274-checkpoint-addendum.md` re-requests the checkpoint **once**, now that the SYS-6 boundary has been reached; it adds a third question. It is non-blocking, with no automatic default: under the policy, root approves first and a separate B task follows |

## 4. RETRO 275 (D-29z607…D-29z611)
**`retros/retro-275.md`.** The numbers come from `b-round-274/*.py` run on the before-copy of the backlog.
- **Rounds and gates:**
  - 15 rounds: C PASS 12, FAIL 3 (260, 265, 267);
  - gate: published 11, skipped 3, failed 1 (262);
  - cost: $334.94 (B $154.14, A $101.42, C $79.38).
- **Feature stages:** 1 of 7 failed C at the first check (the previous window: 4 of 6).
- **Cause of the failures:** 3 of the 4 trace to B's task and 1 to B's retro text; 0 trace to A.
- **Experiment:** retro 260's claims-block experiment is **refuted on the count clause** (`consequence-tester`): 5 findings accepted, 1 of them Medium. The failures moved from claims to consumer sweeps.

**Lessons (59 → 59 lines):**
- **L49** gains the consumer-sweep `SWEEP` clause. Its evidence is 3×, and placing it in L49 follows `tech-lead`, which keeps L29 untouched.
- **L29**'s code-premise type gains a prose-ruling evidence clause (RC-R272-UNPROBED-PREMISE, 2×).
- Nothing was merged. L21 → L20 and L27 → L52 are candidates for RETRO 290.

**Screen review:** `user-review/screen-review-275.md`, with SR-275-1…8 and the questions Q1/Q2.

**L46:** A-R204 and the platform halves are now Saba-owned manual items in the final acceptance list (`final_acceptance_saba_manual_items`).

**Harness rules:**
- HR-TRUNCATE-LEAF-BOXES;
- HR-C-SHADOW-FIELDS: C writes `claimRerunMinutes` and `shadowRowSeverityVerdict`. RC-R260-ROW-SEVERITY runs in shadow mode only.

**Proposal for root and Saba:** RC-R275-STOP-ROUTES-TO-B (after an A STOP, the round goes back to B, not to C).

**Checks B ran itself:**
- **Smoke export at HEAD `a4c0e24`:** sha `1fea093b…` and 401/500 auth at both viewports (`b-round-274/smoke/`).
- **Screen capture:** counts 142 / 170 / 121 / 147, equal to round 260.
- **Frozen tree:** rc 0 after every consult.

## 5. Order (D-29z612)
1. **Round 275: RETRO 275.**
2. **Round 276: SYS-5 stage 1** (keyboard-reachable disabled reasons, owner `ArrangementTransport.tsx`). Its planning:
   - applies the L49 `SWEEP` grep, because `aria-disabled` replaces `disabled`;
   - runs `tech-lead`'s `setStatus` check;
   - follows reference-first and consults `product-designer`.
3. **STUDIO-PERFORMANCE.**
4. SYS-1…3, then STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries.

REGRESSION goes first when it is due (on or after 2026-11-02).

## 6. Not COMPLETE, not BLOCKED
**Not COMPLETE.** Still to do:
- RETRO 275 (C check);
- SYS-5;
- STUDIO-PERFORMANCE;
- SYS-1…3;
- STORE-2b…5;
- REVIEW-RECOMMENDATIONS;
- T12-ADVANCED;
- the phase-2 entries;
- 464 deferred Lows;
- the open Mediums: GATE271-S1 (`awaiting_user`), GATE274-S1 and GATE232-S2 (Tech Lead manual);
- the Saba-owned manual items.

All FB items except FB-03 and FB-15 (both მზადაა) are still **მოწმდება**, because their Tech Lead manual rows are open.

**Not BLOCKED.** Nothing external is missing.

**Ready for commit:** nothing new from `store/`. Round 274 is published (`a4c0e24`).

## 7. Artifacts
**`b-round-274/`:**
- the scripts `*.py` and their outputs `*.txt` / `*.json`;
- the hand files `fails-cause-hand.txt`, `claims-findings-hand.txt` and `stops.txt`;
- `claims-count.txt`;
- `screens/` (the capture);
- `smoke/` (B's HEAD smoke);
- the before-copies: `backlog-before-275.json`, `lessons-before-275.md`, `feature-status-before-275.md`, `b-next-before-275.json`, `current-task-before-275.md` and `regression-last-before-275.json`;
- `update-backlog.py` and `update-backlog-2.py` (adds `l46_retro275` to GATE232-S2 in `open_findings` and GATE244-S4 in `deferred_low_polish`; no version bump);
- `l29-inserted-clause.txt` (the exact L29 insertion, for RT-LESSONS).

**Updated:**
- `backlog.json` (version 239);
- `lessons.md`;
- `feature-status.md`;
- `current-task.md`;
- `b-next.json`;
- `tasks/round-274.md` (the archive).

**New:**
- `retros/retro-275.md`;
- `user-review/screen-review-275.md`;
- `b-round-274-checkpoint-addendum.md`;
- `b-round-274-r275-{grants,new-files}.txt` (empty) and `b-round-274-r275-tree-sha256.txt`.
