# B — Round 352 → 353 planning

## Round 352 outcome (evidence only)
- `c-round-352.json`: **PASS**. `browserVerified` and `realVerified` are true, 0 bugs. The 9 C rows passed; the gate rows are not claimed.
- Gate 352 **published `a55543b`** on both remotes (`gates/gate-round-352.json`). That commit is the round-353 baseline. HEAD was clean at planning (`b-round-352/head-at-planning.txt`, empty `git-status-at-planning.txt`).
- **Backlog, from that evidence only** (`b-round-352/update-backlog.py`, v314 → v315, D-29z1127…D-29z1129):
  - **PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 is done.** Its product rows passed in C round 350 (checked by the dock hash) and its test rows in C round 352. PERF-DRAG-PREVIEW itself is **not** done: stage 2, the record → assert conversion, remains.
  - **Closed:** C-R351-01 and A-R350-REVIEW-SEEK-TEST (Medium), and C-R350-01, A-R351-REVIEW-GLOBAL-SPY and A-R351-REVIEW-TRY-SPAN (Low).
  - **To `deferred_low_polish`:** A-R352-REVIEW-COMMIT-EXACT, -DRAG-DISTANCE and -WINDOW-PRECONDITION; GATE352-S1 (reviewer label "medium-low, latent", the same root cause as A-R350-REVIEW-CACHED-TRACKS, no reproducible defect); GATE352-S2. GATE352-S3 is joined to -WINDOW-PRECONDITION.
  - **Architecture note:** GATE352-ARCH-DOCK-LIFECYCLE is recorded as a signal only, not a task.
- **Previous task archived:** `tasks/round-352.md` is a byte-equal copy (K16). Nothing was deleted.

## Architecture checkpoint (feature boundary + risk on one owner)
`ArrangementVideoDock.tsx` changed in rounds 345, 349 and 350–352, and two reviewers flagged it. ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has been "wanted" since D-29z1104 and has no answer. I asked root for the bounded `frontend-architect` checkpoint now and added question 4 on the dock reader (`b-round-352/root-request-arch-checkpoint.md`, D-29z1129). The request is non-blocking.

## Round 353 = RETRO 353 (window 336–352)
- **Why now:** RETRO was due at 351 and slipped twice while the open Mediums closed first. Nothing Critical, High or Medium in the app is open and schedulable. REGRESSION is due on or after 2026-11-08.
- **Outputs:**
  - `retros/retro-353.md` (Georgian);
  - `lessons.md`, still 60 lines (l.3, L28, L57, L58);
  - the new checker `tools/l57-check.py`;
  - `user-review/screen-review-353.md` (SR-353-1…5);
  - the systemic task SYS-R353-DP-TEST-POLISH;
  - backlog v316 (`update-backlog-part2.py`, D-29z1130…D-29z1134);
  - `feature-status.md` (`update-feature-status.py`).
- **Headline:** C PASS 14 / FAIL 2 / BLOCKED 1, gate failed 0, $277.65. Both failures came from B, and both broke a rule that already existed (L58). The remedy makes those rules checkable artifacts, not new prose.
- **How the work was done:**
  - **Numbers and captures:** two forks of B produced the data (`b-round-352/*`) and the screen captures (`b-round-352/screens/`).
  - **Consults:** B ran both, `tech-lead` and `product-designer`. A fork cannot call subagents.
  - **Checks:** B spot-checked the fork outputs and corrected two of its own report claims against the sources: the §4 categories, and a wrong "first gate-clean window since 305" statement.
- **Lesson deviation from advice:** `tech-lead` asked that L58 not grow. My first edit removed the rule "an unruled Medium that A's reviewer finds is a planning FAIL" and the evidence id A-R327-REVIEW-SAME-TEXT-REMOUNT. I restored both, so L58 is 2908 bytes against 2803 before (retro-353 §7). `update-backlog-part2.py` was edited after it ran, only to show the final byte count. The backlog text was patched to match (D-29z1131).
- **C task:** RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-L57, RT-SABA, RT-SCREEN (browser, mock), G353-AUTH, STUDIO-SMOKE-353 at both viewports, and CLAIMS (`b-round-352/claims-353.sh`, 22 tags, output saved, stderr empty, K8 `done`). The outcome table is fixed in advance.

## Scope and rules kept
- **Scope:** nothing was shrunk or deferred without Saba. SR-353-1…5 are questions, not decisions. The SR-353-1 behaviour change and the ROOT-REQ-PERF-TIMEOUT choice go to Saba.
- **Next feature work:** round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (or REGRESSION first if planned on or after 2026-11-08). Then SYS-R353-DP-TEST-POLISH, PERF-CAND-MASTER-GROUP-FADER-PROPS, PERF-9…15, STEM-LANES, SYS-1…3, STORE-2b…5 (direction A is decided), REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2 under the skip rule. SRW-21 stays `deferred_user`.
- **Protected files and access:** untouched. `/studio-lab` stays demo-only and anonymous. The purchase guard is re-checked by G353-AUTH.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` add nothing new to this round, as at round 351.

## Advisor
The advisor was available and used twice: before the substantive work (it set the order and the durable-first steps) and before closing. The closing review led to: removing an unprobed video step from STUDIO-SMOKE-353 (L29), fixing one line reference (`c-round-340.md` l.7), moving the L28 clause to the end of its line, and saving the inline backlog patch as `b-round-352/patch-l58-bytes.py`.

## Readiness
Nothing in `store/` changes this round. Only the loop-state commit records the retro. Stage 1 of PERF-CAND-VIDEO-TRIM-FADE-COST is already published (`a55543b`).
