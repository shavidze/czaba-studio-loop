# B round 434 → 435 planning (2026-11-10)

**Decision: CONTINUE.** Round 435 is **RETRO 435** (window 420–434), a code-free round, on baseline `8233840` (gate 434 published).
- Task: `current-task.md`. Decisions: D-29z1538 … D-29z1543. `backlog.json` is now v419.
- The previous task is archived as `tasks/round-434.md`. It is a byte-identical copy and nothing was deleted.
- Pre-edit copies are in `b-round-434/`: backlog, feature-status, b-next, current-task, lessons, regression-last and l57-check (`*-before-435.*`). Progress notes are in `b-round-434/checkpoint.md`.
- **Live workflow file:** `grep '^## '` shows that `docs/technical/studio-real-workspace/agent-workflow.md` ends at "Loop v2 — 2026-10-19", so it is older than the policy snapshot in the prompt. It has no newer or conflicting section, so the snapshot's later user decisions stay applied.
- **Close review (advisor) fixes:**
  - K22 now prints found/NOT-FOUND, so it no longer depends on where the optimizer archives an id. K23's self-`cmp` was dropped.
  - `misc-outputs.sh` now reads the archive snapshot.
  - `collect.py` skips the B phase, so C's `cmp` will not drift.
  - Row 3's teal check was dropped: it was vacuous under headless `--hide-scrollbars`.
  - The stage sums now come from `data/stage-sums.txt`.
  - The gate-review severity count now uses word boundaries: low 18, info 4, unlabelled 24. The wording says "0 labelled Medium+".
- **Advisor:** available and used after orientation. It flagged three things: copied template numbers, the archive/snapshot question, and the expiring L46 deadlines. Each is handled below.
- **Consults (actually called):**
  - `tech-lead` (`b-round-434/consult-tech-lead.md`).
  - `product-designer` (`b-round-434/consult-product-designer.md`).
  - `qa-engineer`, `consequence-tester`, `design-philosopher` and `first-visit-host` are not on B's consult list and were not called.

## 1. Round 434 result (from B's own re-runs, not from the reports)
- `c-round-434.json`: PASS, 0 bugs, `browserVerified`/`realVerified` true. Three rows are BLOCKED by the cloud: the cart ConfirmDialog in a browser, the fake bearer, and Firefox/Safari.
- **B re-ran:**
  - `l57-check` gives L57 OK.
  - `compare-scrollbar.py` gives ALL OK on C's after-probe and NOT ALL OK on HEAD.
  - The mutant summary is `cmp`-identical to B's.
  - The auth log says `pass: true`.
  - Gate verify: 272 files and 4018 tests passed; the build succeeded.
- Gate 434 published `8233840` with review COMMIT OK, 9/10. **SABA-B-12 stage 3b is done** (D-29z1538).
- **Lows (D-29z1539):**
  - GATE434-S1 (scrollbarClassName replaces the skin) and GATE434-S2 (DS4 scan scope) go to `deferred_low_polish`.
  - B-R434-CONFIRMMODAL-NAME (B spec) also goes to `deferred_low_polish`.
  - Gate finding 3 (Firefox) is recorded as `confirmedBy` on TLM-SABA-B-12-FIREFOX-SAFARI (L7).
  - The Architecture note is a signal on ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS Q4. It is not scheduled.

## 2. RETRO 435 (full text: `retros/retro-435.md`)
- **Window:** 15 rounds, 14 PASS and 1 FAIL (423, C-R423-01 Medium, perf budgets). The FAIL was fixed in 424. Total cost $255.35. Round median $15.62, B median $11.63. A STOP 0. `browserVerified` 15/15.
- **Counters:** every RETRO-420 target is met except one. "origin on every bug" is only partly met: 2 of the 4 origins are not enum values.
- **Lessons (60 lines):**
  - L37 gains "Fiber-structure change → full perf suite on the sketch".
  - L56 gains "a number or name in a task names its file and JSON key; C greps it".
  - l.3 pointer updated.
  - `tools/l57-check.py` now validates the `origin` enum. On the old files, 423 and 425 would fail and 434 passes.
- **Systemic task:** SYS-R435-SOURCE-SCAN-HELPER, test-only. It closes 11 Lows and must land before ARCH-SPLIT.
- **L46 deadlines:** `user-review/questions-retro-435.md` asks Q1–Q4, each with a default.
  - TLM-PERF15-FIREFOX is reopened as a task blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX.
  - The other deadlines move to RETRO 450.
- **Screen:** `user-review/screen-review-435.md`. Line counts equal those of 420.
  - SR-435-1 (the From/To unit) goes to Saba as Q4, with his approved wording as the default.
  - SR-435-2 (the footer "source offset") joins the STUDIO-VIS-4 scope.
  - B checked both against `journey435-2-studio-playing-1440x900.png` and `screen435.json`.
- **Project-rule proposals for Saba** (§12, not applied):
  - add a perf subset and `perf/lib` to verify;
  - Playwright Firefox;
  - a "no browser-default control chrome" rule.
- **The one disagreement, resolved by B (D-29z1543):** `tech-lead` ordered SYS-R435 before COPY-PD-VIS. B puts COPY-PD-VIS first because the open Mediums STUDIO-VIS-4/6 come first under the 2026-10-23 bug gate. Both orders still land SYS-R435 before ARCH-SPLIT.

## 3. Order after round 435
1. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13. It gains REG-PERF-FULL-SUITE.
2. COPY-PD-VIS: STUDIO-VIS-4/6/7/10, SABA-LANE-RESIZE-HANDLE and SR-435-2. Its "Why we missed it" section is due for the lane handle.
3. SYS-R435-SOURCE-SCAN-HELPER.
4. SYS-1.
5. SYS-3.
6. STORE-REDESIGN 2b…5 (direction-decision.md exists).
7. ARCH-SPLIT. Its first stage needs a frontend-architect checkpoint through root, as the policy requires.
8. REVIEW-RECOMMENDATIONS (SABA-B-12 stage 4).
9. T12-ADVANCED.
10. Phase 2 (skip rule).

STEM-LANES jumps ahead when Saba answers. Next RETRO: round 450.

## 4. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Open work remains:
  - SABA-B-12 stage 4;
  - COPY-PD-VIS;
  - SYS-1 and SYS-3;
  - the STORE stages;
  - ARCH-SPLIT;
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the phase-2 queues;
  - STEM-LANES (Saba);
  - SRW-21 (deferred_user);
  - the deferred Lows.
- **Not BLOCKED.** Every row of round 435 can run in the cloud, except the fake-bearer backend row.

## 5. Readiness for commit
- Round 434 is published.
- This planning wrote only loop artifacts and the loop tool `tools/l57-check.py`.
- The store tree is clean at `8233840`.
- B's mock API (:5199) was stopped after the capture. No B dev server is left running; only root's :5173 runs.
- Round 435 changes no source, so the gate will skip publishing. The loop-state commit records the retro.
