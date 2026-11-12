# B round 462 → 463 planning (2026-11-12)

**Decision: CONTINUE.** Round 463 is STORE-2b-3d-2: delete the dead Store CSS rules, and fix C-R462-01. The task is in `current-task.md`. D-29z1632 records the round-462 result, and D-29z1633 records this dispatch.

## For root first
- **GATE462-M1-EMAIL-SERVER-POLICY (Medium, policy flag; `open_root`, non-blocking).** Round 462 deleted `app/lib/email.server.ts`, a dead builder for the order-paid email (it called `getDownloadUrl`).
  - The path is not in `global_forbidden_files` (claims-463 K11).
  - It had 0 importers.
  - The live download path is unchanged: `r2-tokens.server.ts` and the download, studio-token and recording routes.
  - C round 462 C8 (purchase protection) passed.
  - Saba saw the deletion in `questions-retro-450.md` Q6, whose default was delete.
  - **Question (ROOT-REQ-EMAIL-SERVER-DELETION):** is the deletion acceptable, or must the file be restored? B reverts nothing.
- **Correction to my round-461 note.** "The CSS bundle shrinks by 12 utilities" was false for the published round-462 tree (C-R462-01, below). Round 463 makes it true. B also wrongly cited `b-round-461/css-removed-selectors.txt`, which does not exist; the real file is `css-removed-live-grep.txt`. The doc-301 correction cites the right file.

## Setup
- **Advisor:** available. B consulted it after orientation and before writing. Its advice, all applied:
  - close round 462 only from C's files;
  - rule A's K23 STOP;
  - record gate-462 finding 1 for root;
  - delete only rules with zero consumers;
  - make the pre-check tree equal the delivered tree;
  - use a style-sensitive browser row.
- **Project agents:** `tech-lead` approved v1 with 2 Mediums, TL-R463-M1 and TL-R463-M2. B fixed both in **v2** (sha `f299877b…`). tech-lead then delta-reviewed v2: **APPROVE**, no new Medium+. Details are in `b-round-462/sketch-review.md`. `product-designer`, `performance-optimizer` and `ableton-arrangement-expert` were not needed: there is no visible change, no performance path and no Studio behaviour.
- **Archive:** `tasks/round-462.md` is a byte-identical copy of the round-462 task (`cmp` OK). The pre-edit copies are in `b-round-462/`: `current-task-before-463.md`, `backlog-before-463.json`, `feature-status-before-463.md` and `b-next-before-463.json`.
- **Baseline:** gate 462 is `published`, commit `eb4d6df`, and the store tree is clean. B edited no store file; all sketch work ran in `/tmp/b463-scratch`, `/tmp/b463-mut` and `/tmp/b463-prune`.

## Round 462 result, from the evidence
- **C PASS:** `c-round-462.json` C1–C10, `browserVerified`/`realVerified` true. Gate 462 published `eb4d6df` (review COMMIT OK, 8/10).
- **Done:** STORE-2b-3d-1. **Closed:** TL-R449-D1-LOADING-BRAND-CLASS (C4, C5 M4) and TL-R449-D2-BARREL-ALIAS (C3, C5 M2).
- **K23 STOP (L10 ruling): accepted delta, origin B spec.** B's placeholder doc 301 lacked the line 4 that §2.3 required. A kept §2.3, which was correct. Recorded as INFO-B-R462-K23-PLACEHOLDER (closed).
- **C-R462-01 (Low, B spec).** Doc 301 named the 12 retired utilities literally. Tailwind v4 also scans `docs/*.md`, so they stayed in the shipped CSS. Scheduled in round 463.
  - K23 and C-R462-01 share one cause: the pre-check tree was not the delivered tree. That is 2 events, recorded as RETRO465-B-PRECHECK-TREE-NOT-DELIVERED.
- **Gate findings:**
  - 2, the `sendOrderEmail` key: scheduled in round 463 (GATE462-L2).
  - 3: confirms TL-R462-L2 (`confirmedBy`).
  - 4: the dead CSS is round 463's scope.
- **A's code-reviewer:**
  - CR-R462-L1, L2, L3 and L5 → `deferred_low_polish`.
  - L4 is resolved by the sketch.
  - Its and the gate's Architecture notes → SIG-R462-DEAD-MODULE-GUARD (signal, not a task).

## Why round 463 is STORE-2b-3d-2
- **No in-loop Medium+ is open.** GATE462-M1 is root-only and non-blocking.
- The recorded order is 2b-3d-1 → 2b-3d-2 → 2b-3c-2b → 2b-4 → STORE-2c…5 (D-29z1631).
- **Permission:** Saba's 2026-11-10 legacy policy.
- **Regression** is due on 2026-11-13, not today. **The next planning on or after 2026-11-13 is REGRESSION-2026-11-13.** It covers each done item on both viewports plus `npm run test:e2e:smoke`, and `regression-last.json` is updated when that round closes.
- **No new answers from Saba or root.** B checked this, re-read, at 07:38 UTC (`date -u` gives 2026-11-12):
  - `root-pre-push-review.md` and `publication-checkpoint.json` are still the 2026-10-07 round-3 records.
  - `user-review/` holds only the already-processed decision files (ableton, design-ux, store direction); AGREE-STEM-LANES is unanswered.
  - The live `agent-workflow.md` has no section newer than this prompt's snapshot (it ends at Loop v2; ROOT-NOTE-R454-WORKFLOW-DOC-SNAPSHOT is already recorded).
- **Advisor closing check, applied:**
  - C7's full-fingerprint clause is strict on 22 rows only. `/` and the 404 path, whose infinite animations jitter on every read, use reduced equality plus `headTreeDiffering` ≤ 6.
  - The keyframes matcher misses an `animate-[name_1s]` use. A git grep at `eb4d6df` finds 0 such uses of the 6 removed names, so this is recorded as the Low B-R463-DC2-UNDERSCORE.
  - The keep-list ruling line is added.
  - TL-R463-L3, TL-R463-L7 and B-R463-DC2-UNDERSCORE are in doc 302's TODO.

## Pre-check on sketch v2 (`b-round-462/`; v1 runs in `v1-superseded/`, `probe/superseded/`)
- **Deletion rule (v2):** a block is dead when none of its top-level selector branches has every required class rendered by non-test app source or set at runtime by Lenis.
  - Result: 306 blocks and 6 orphan `@keyframes` (`pruned-list.txt`).
  - The diff is pure deletion, and the obsidian block is byte-identical.
  - `css-prune.py` reproduces both CSS files sha-identically on a clean `eb4d6df` clone.
- **Static checks:** tsc rc 0; lint 192 warnings (equal to HEAD); covering set 14 files / 148 tests; **full suite 285 files / 4185 tests**.
- **Mutants:** BASE GREEN, M1–M11 RED.
- **Production build:**
  - server and all 101 JS chunks are equal;
  - CSS goes from 2068 to 1794 selectors, 274 removed and 0 added;
  - every removed selector is explained (`build-compare-explained.txt`).
- **Browser (prod, mock API):** 13 pages × 2 viewports, comparing the computed style of every element, HEAD vs tree, with a HEAD-HEAD control.
  - The reduced fingerprint is equal on all 26 rows.
  - 0 elements match any of the 222 removed selector branches.
  - 0 removed keyframes appear in a computed `animation-name`.
  - Non-vacuity was shown with an injected rule (`probe/nonvacuity/`).
- **Claims:**
  - `claims-463.sh` has 16 claims, and both stderr files are empty;
  - the after-A expectation differs only in K3, K4, K7, K8, K9, K10, K14, K15 and K16;
  - L29 gives 6 hits (`l29-planning.txt`).
- **Backlog:** version 454 → 455, applied by `update-backlog-463.py` (`.done` marker).

## Other notes
- **New signal:** SIG-R463-TAILWIND-DOCS-SOURCE. The systemic fix for C-R462-01 is an `@source not` rule for `docs/` in `app.css`. Until then, every implementation doc avoids class and utility literals.
- **Architecture checkpoint:** none requested. The round adds a self-contained test file and leaves `helpers/style-scan.ts` untouched (ARCH-CHECKPOINT-STYLE-SCAN is still pending, non-blocking).
- **RETRO:** RETRO 465 comes after round 464 (the 15-round rule).
- **Commit readiness:** round 462 is published. Round 463's tree can be published after C PASS and the root gate. **Note for root:** `app.css` loses about 2160 lines (pure deletion), and two new untracked files appear (one test, doc 302).
- **Not COMPLETE.** Still open:
  - STORE-2b-3c-2b, 2b-4 and STORE-2c…5;
  - the LEGACY-DEAD remainder;
  - ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STEM-LANES (`awaiting_user`), T12-ADVANCED and phase 2;
  - the deferred Lows and the Tech Lead manual rows.
- **Not BLOCKED:** no external input is needed. The root question does not stop the loop.
