# B round 463 → 464 planning (2026-11-12)

**Decision: CONTINUE.** Round 464 is STORE-2b-3d-3. It deletes the 4 orphan keyframes and makes DC2 count only real animation use. The task is in `current-task.md`. D-29z1634 records the round-463 result, and D-29z1635 records this dispatch.

## Setup
- **Advisor:** available. B consulted it after orientation and before writing. Its advice, all applied:
  - read the gate-463 review;
  - re-run the new-input check;
  - classify all 15 keyframes;
  - check every hit of the 4 names (including pre-hydration strings);
  - keep Tailwind from scanning the test fixtures;
  - keep the matcher out of `helpers/style-scan.ts`;
  - close C-R462-01 only on a build check;
  - state the order of RETRO and REGRESSION.
- **Project agents:** `tech-lead` reviewed sketch v1 and returned **APPROVE WITH CHANGES**, with no High or Medium.
  - Its Low on the comment stripper (`/*` inside a string was read as a comment) is fixed in v2 for block comments. On the advisor's closing check, v3 fixes line comments too. Two DC4 fixtures and mutants M8 and M9 cover it.
  - tech-lead's **delta review of v3: APPROVE**, with no Medium or above. The dispatched sketch is v3, sha `35f0fb1f…`.
  - The other Lows are ruled in `b-round-463/sketch-review.md`.
  - `product-designer`, `performance-optimizer` and `ableton-arrangement-expert` were not needed: the round has no visible change, no performance path and no Studio behaviour.
- **Archive:** `tasks/round-463.md` is a byte-identical copy of the round-463 task (`cmp` OK). The pre-edit copies are in `b-round-463/`: `current-task-before-464.md`, `backlog-before-464.json`, `feature-status-before-464.md` and `b-next-before-464.json`.
- **Baseline:** gate 463 is `published`, commit `d55ec17`, and the store tree is clean. B edited no store file. All sketch work ran in `/tmp/b464-scratch`, `/tmp/b464-head`, `/tmp/b464-head2` and `/tmp/b464-after`.
- **New input:** none. `root-pre-push-review.md` and `publication-checkpoint.json` were read: both are still the 2026-10-07 round-3 records (commit `375ee3b`), with no remaining findings for this round. The `user-review/` file list is unchanged since round 462: every review file has its `.notified` marker, and the decision files are the ones already processed. AGREE-STEM-LANES is still unanswered. The live `agent-workflow.md` has no section newer than Loop v2.

## Round 463 result, from the evidence
- **C PASS:** `c-round-463.json` C1–C10, `browserVerified`/`realVerified` true. Gate 463 published `d55ec17` (review "COMMIT OK", 6 Lows and 2 architecture notes).
- **Done:** STORE-2b-3d-2.
- **Closed:**
  - C-R462-01. B also built `d55ec17`: 0 of the 12 retired utilities remain (`b-round-463/c-r462-01-head-utilities.txt`, with a positive control).
  - A-R453-REVIEW-L-BOXSHADOW-TRANSITION, GATE453-I5-BRAND-TINT-GLOWS-OUTSIDE-GRANT (c-round-463 claims K15 0/0) and GATE462-L2-SENDORDEREMAIL-KEY (claims K10, mutant M7 red), all from round 463's C PASS.
- **A-R463-REVIEW-M1 stays Medium (test contract).** C-R463-01 (Low, origin B spec) and gate finding 1 are recorded as `confirmedBy` on it (L7). It has no visible effect: C7 `deadAnim` was 0/0.
- **Gate 463 findings:**
  - 2 → `confirmedBy` on TL-R463-L7;
  - 3 → A-R463-REVIEW-L2;
  - 4 → A-R463-REVIEW-L3 (scheduled);
  - 5 → A-R463-REVIEW-L5;
  - 6 → `confirmedBy` on SIG-R463-TAILWIND-DOCS-SOURCE.
- **A's other code-review Lows:** L1, L2, L4, L5 and L6 → `deferred_low_polish`.
- **Architecture notes → signals, not tasks:**
  - SIG-R463-USED-DEFINED-TWICE (A's note; fold into ARCH-CHECKPOINT-STYLE-SCAN);
  - SIG-R463-APPCSS-MIXED (the gate's note; split the surviving `app.css` after the LEGACY-DEAD remainder; ARCH-SPLIT candidate).

## Why round 464 is STORE-2b-3d-3
- **Bug gate:** A-R463-REVIEW-M1 is a Medium the loop can fix in code it already owns. It goes before 2b-3c-2b.
- **The round closes three ids with one root cause:** A-R463-REVIEW-M1 (= C-R463-01), B-R463-DC2-UNDERSCORE and A-R463-REVIEW-L3.
- **No new scope is mixed in.** The duplicate project `pulse` keyframes, which overrides Tailwind's `animate-pulse`, would be a visible change. It is recorded as SIG-R464-PULSE-KEYFRAMES-SHADOW (info) and is not scheduled.
- **Regression:** `regression-last.json` is dated 2026-11-10, and `date -u` gives 2026-11-12, so it is not due.
- **RETRO 465** comes next (the 15-round rule). If the round-465 planning happens on or after 2026-11-13, REGRESSION-2026-11-13 goes first and RETRO 465 right after it (precedent D-29z1448). Then 2b-3c-2b, 2b-4 and STORE-2c…5.

## Pre-check on sketch v3 (`b-round-463/`; v1 and v2 in `v1-superseded/`, deltas `sketch-464-delta-*.diff.txt`)
- **Scope:** 45 lines are deleted from `app.css` and 0 are added. The obsidian block is unchanged (K6).
- **Consumer checks:**
  - a grep for animation consumers of the 4 names finds 0 each (K4);
  - tech-lead independently checked `root.tsx`, the EntranceCover pre-hydration string, `public/`, `var()` and `element.animate`.
- **Static checks:**
  - **full suite 285 files / 4186 tests green** (`precheck-full.log`);
  - the covering set (14 files) passes 149 tests;
  - tsc rc 0;
  - lint gives 192 warnings, the same as HEAD.
- **Mutants** (`mutants/mutants.txt`): BASE is green, and M1–M9 are each red. M1, M2 and M5 turn DC2 red. M3–M9 turn DC4 red.
- **DC2 at HEAD:** v3's DC2 fails with exactly the 4 names, so the test is red on the start copy (`dc2-v3-on-head.log`).
- **Bundled code:** the built HEAD client and server bundle has no animation consumer of the 4 names (`bundle-animation-grep.txt`).
- **Production build:**
  - The server bundle is equal.
  - JS differs only in `root`, by identifier renames only (`non-identifier-changes=0`). The HEAD-vs-HEAD control is equal (`build-compare-head-head.txt`).
  - CSS: 5 percent selectors removed and 0 added. The built keyframes are HEAD's minus exactly the 4.
  - The v3 CSS is byte-identical to the v1 CSS (`css-v3-vs-v1.txt`), so the browser probe below holds for v3.
- **Browser (prod, mock API):** 13 pages × 2 viewports (`probe/run1`).
  - The reduced fingerprint is equal on 26 of 26 rows.
  - The full fingerprint is equal on the 22 rows other than `/` and the 404 page; those two show ≤ 4 jitter, as in round 463.
  - `deadAnim` is 0/0.
  - Non-vacuity was shown with an injected `animation-name: float` on `/store`: `deadAnimTree` 1 and reduced compare false (`probe/nonvacuity`).
- **Claims:** `claims-464.sh` has 20 claims (K1–K20), and both stderr files are empty. The after-A expectation differs only in K3, K5, K7, K8 and K17. The L29 grep gives 7 hits (`l29-planning.txt`): grant or planned paths, or tagged facts. `l58-check` OK.
- **Backlog:** version 455 → 456, applied by `update-backlog-464.py` (`.done` marker). Follow-up edits after the advisor checks:
  - the v3 sha and mutant text;
  - the two suffixed gate ids closed;
  - tech-lead's accepted Lows filed as TL-R464-L1-COMMENT-AFTER-UNLISTED-CHAR (passes silently; 0 cases today) and TL-R464-L2-MATCHER-FAILS-RED-FORMS (fails red) in `deferred_low_polish`;
  - the retro input RETRO465-B-GENERATOR-TEST-SHARED-RULE in `retro_candidates`.
- **Disk:** the two served prod store copies (`probe/prod-head`, `probe/prod-tree`, 325 MB each) were moved out of the loop folder to `/tmp`; the probe results (`probe/run1`, `probe/nonvacuity`) stay.

## Other notes
- **RETRO 465 input:** the deletion generator and its guard test (DC2) shared one matching rule, so the test could not disagree with the generator (RETRO465-B-GENERATOR-TEST-SHARED-RULE).
- **Architecture checkpoint:** none requested. The round leaves `helpers/style-scan.ts` untouched; ARCH-CHECKPOINT-STYLE-SCAN is still pending and non-blocking.
- **Commit readiness:** round 463 is published. Round 464's tree can be published after C PASS and the root gate. **For root:** 2 modified files (`app.css`, a test) and 1 new doc (303).
- **Still open for root:** GATE462-M1-EMAIL-SERVER-POLICY (ROOT-REQ-EMAIL-SERVER-DELETION), which is non-blocking.
- **Not COMPLETE.** Still open:
  - STORE-2b-3c-2b, 2b-4 and STORE-2c…5;
  - the LEGACY-DEAD remainder;
  - ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STEM-LANES (`awaiting_user`), T12-ADVANCED and phase 2;
  - the deferred Lows and the Tech Lead manual rows.
- **Not BLOCKED:** no external input is needed.
