# B round 349 → 350 planning

**Decision: CONTINUE.** Round 350 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 (`current-task.md`; D-29z1111…D-29z1117; backlog v311 → v312). The video dock stops re-rendering on every pointermove of a video clip's trim, fade or move drag. Behaviour is unchanged, and C proves that in the browser.

## For root (read first)
1. **ROOT-REQ-PERF-TIMEOUT is still overdue (L46).**
   - **The request:** in `store/playwright.perf.config.ts`, `timeout: 15 * 60 * 1000` → `25 * 60 * 1000`. The text is in `b-round-278-root-request-perf-timeout.md`.
   - **Round 349 run times:** A 490693 ms, C 491771 ms. The L31 bound is 450000 ms and A's STOP is at 540000 ms.
   - **Freeze:** no interactions-spec rows are added until it lands. Round 350 adds none.
   - **Deadline:** RETRO 351 is the next round. If the request is still open, B puts it to Saba as one question there.
2. **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is still wanted (non-blocking).** There is no answer artifact. Question 3 (the shared drag measurers, splitting the spec) now also gathers A-R349-ARCH-VIDEO-SPEC-SPLIT and GATE349-ARCH-SPEC-SPLIT. Round 350 touches the video dock. If root runs the checkpoint, question 2 (the size of the gesture handler) may add the dock reader as a fourth keep/extract item.
3. **Ready for publication after C PASS:** round 350 changes 3 store files (§3). Nothing in this planning step changed `store/`: K2 reads `7f56989 0`. The sketch is outside it, in `/home/runner/b349-scratch/sk`.

## 1. Round 349 close-out (D-29z1111)
- **C round 349: PASS.**
  - `browserVerified`/`realVerified` true; 10 rows; 0 bugs; 0 blocked (`c-round-349.json`).
  - PERF: 252 rows, 70/70 asserted, 22 NEW, 0 DIFF against C348, `durationMs` 491771.
  - GRAB-PROBE 3/3; C's own harness mutant was red as predicted.
  - G349-AUTH and VIDEO-SMOKE pass at both viewports: purchase protection holds, and `/studio-lab` opens anonymously.
- **Gate 349 published `7f56989`** on both remotes. It sits on root's docs-only `aca59b3` (the store direction decision). That is the baseline for round 350.
- The video-trim-fade stage is done. PERF-DRAG-PREVIEW stays in progress: the video costs remain, along with the master/group props and the crossing.

## 2. Notes routed (D-29z1112, D-29z1117)
- **GATE349-S1 → closed_info:** the run time, which is evidence on the timeout request.
- **GATE349-S2 → `deferred_low_polish`:** the grab depends on the scroll. If it flakes, press Home before the first playing video drag.
- **GATE349-S3/S4, C-R349-INFO-LIVE and C-R349-COLD-VITE → closed_info.**
- **Architecture signals, not scheduled:** A-R349-ARCH-VIDEO-SPEC-SPLIT and GATE349-ARCH-SPEC-SPLIT join ARCH-R339-DRAG-MEASURE-EXTRACT.
- **Store direction decided** (`aca59b3`: A Obsidian & Brass, a choice Saba delegated to root). STORE-2b…5 no longer wait on the direction. They keep their queue place after STUDIO-PERFORMANCE and SYS-1…3 (the D-29z172 order is unchanged).

## 3. Round 350 shape (D-29z1113…D-29z1115)
- **Cause** (B names probe on HEAD dev):
  - Per move, video trim renders 19 components, fade 9 and move 17.
  - 6 of them are the dock subtree, because `ArrangementVideoDock` subscribes to the preview store in its body.
- **Fix** (one source file):
  - The dock gets a `VideoLanePreviewReader`, memoised per commit.
  - Caption and gap caption read through `useSyncExternalStore` with a string snapshot.
  - The fade overlay writes imperatively.
  - The stopped seek subscribes to the reader.
- **Consults:** `tech-lead` and `performance-optimizer` reviewed the first sketch independently. Both found the same **High** issue: on release, the reader saw the pre-drag clips. The reader now reads `getArrangement()`, and the lane clips are reused when they are element-wise equal (tech-lead's Medium). The first sketch is kept as mutant M-B1.
- **B's measurements on the fixed sketch:**
  - Names per move: trim 13, fade 3, move 11.
  - Behaviour probe identical to HEAD. Release probe: 0 writes, as on HEAD; M-B1 writes 1.000.
  - Covering vitest: 107 files, 1768/1768.
  - tsc and Biome clean.
  - PERF_SKETCH_LINE
- **The rows stay `record`** (L58; performance-optimizer). The 22 rows are converted after C round 350 as a budgets-only change. No spec rows are added.
- **New recorded candidate:** the video move's 4th probe sample renders the whole tree (82) on HEAD. This is the project-end crossing, and it joins PERF-CAND-MASTER-GROUP-FADER-PROPS.
- **Advisor:** available, and consulted before the shape and before finishing.

## 4. Order after 350
1. **RETRO 351** (window 336–350). It includes the whole-screen review with the journey, and the ROOT-REQ-PERF-TIMEOUT question to Saba if still open.
2. Convert the 22 video rows to assert (budgets only), together with PERF-CAND-MASTER-GROUP-FADER-PROPS / the project-end crossing.
3. PERF-CAND-FADE-RELEASE-COMMITS.
4. PERF-9…15.
5. SYS-R2-FAKE-FIDELITY.
6. SYS-CLOCK-DETERMINISM.
7. STEM-LANES.
8. SYS-1…3.
9. STORE-2b…5.
10. REVIEW-RECOMMENDATIONS.
11. T12-ADVANCED.
12. The phase-2 entries (skip rule).

REGRESSION is due on or after 2026-11-08.
