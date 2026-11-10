# B round 433 → 434 planning (2026-11-10)

**Decision: CONTINUE.** Round 434 is SABA-B-12 stage 3b, the Studio dialog scrollbar, on baseline `0c22ac9` (gate 433 published).
- Task: `current-task.md`. Decisions: D-29z1532 … D-29z1537, `backlog.json` v417.
- The previous task is archived as `tasks/round-433.md` (a copy, byte-identical; nothing deleted). Pre-edit copies are in `b-round-433/{backlog-before-434.json, feature-status-before-434.md, b-next-before-434.json, current-task-before-434.md}`.
- **Advisor:** consulted after orientation (available and used). Its traps, the cascade, the standard-property win, the shared Modal, Export overflow and the hidden-scrollbar geometry, were each measured before the sketch was written.
- **Consults:** `tech-lead` reviewed the sketch: approve-with-lows (`b-round-433/sketch-review.md`). `product-designer` was not consulted: this is a fix-up inside SABA-B-12 with no new interaction, and the skin is the existing Studio scroller skin.

## 1. Round 433 result (B's own re-runs, not reports)
- `c-round-433.json`: PASS, 0 bugs, `browserVerified`/`realVerified` true. The gate rows are listed as gate. Fake-bearer and Firefox/Safari are BLOCKED (cloud).
- **B re-ran:**
  - `tools/l57-check.py`: L57 OK (`b-round-433/l57-check-c433.txt`).
  - `compare-clear.py` on `c-round-433/probe/after`: ALL OK (2 cells).
  - The mutant summary is identical to B's.
  - Auth measured `pass: true`; the warm-up `false` is a cold server.
- Gate 433 published `0c22ac9` on both remotes; review COMMIT OK. **Stage 3 is done** (D-29z1532).
- **Lows to `deferred_low_polish` (D-29z1533):**
  - A's 4: SC3 selector copy, no Space unit row, no sheet-strings key pin, SF2 blind spots.
  - Gate suggestions 1 and 2, both doc-only: the doc-281 Safari TODO is wrong, and the lesson ids read like line numbers.
- **B self-finding B-R433-HEAD-BLUE-PX-MISCOUNT (Low):** the round-433 task said "HEAD 8 blue px", but B's own `probe/head/clear.json` says 32. That is an L58 miss.
  - `tools/l58-check.py` checks only the review sha and the verdict, so it could not catch a number copied wrongly.
  - It goes to RETRO 435 as an input: a checker that compares numbers asserted in the task with the saved probe JSON. There is no new lesson, because lessons.md is at 60 lines and L58 already states the rule.
  - The pass condition was unaffected.

## 2. Stage 3b facts (D-29z1534; all B's own runs in `b-round-433/probe/`)
- **Harness:** Chromium 143 launched with `ignoreDefaultArgs: ['--hide-scrollbars']`.
  - With bars visible, the sheet search is 660 wide, not the 670 measured with bars hidden. The 670 figure in round 433's row 4 holds only for headless with hidden bars, which is what the clear probe uses. REG-SABA-B-12-SEARCH-CLEAR keeps its own probe, so it is unaffected.
- **HEAD:**
  - The sheet scrolls (1410 vs 808/646) with computed `scrollbar-color` `rgba(18,217,200,0.4)` and `thin`, about 1,750 teal pixels in the strip.
  - Export scrolls only at 1280×720 (691 vs 646), also teal.
  - The Library reference is `auto` with a 10 px bar.
- **Experiments:**
  - Studio classes alone: still teal.
  - `scrollbar-color: auto` with `styled-scrollbar` kept: a 4 px bar with an invisible thumb.
  - So the sketch removes `styled-scrollbar` through a Modal prop instead of overriding it.
- **Sketch** `sketch-434.patch.txt`, sha `8aed38f3…`, 5 files:
  - Modal `scrollbarClassName` (default `styled-scrollbar`);
  - `STUDIO_DIALOG_SCROLLBAR_CLASS` (the lane skin without the gutter; the lane constant stays byte-identical);
  - the two Studio dialogs pass it;
  - DS1–DS4.
- **B's runs on the sketch:**
  - Real Chromium at :5174 (own `cacheDir`, then stopped): ALL OK (2 cells). HEAD: NOT ALL OK.
  - Geometry is equal to HEAD.
  - Thumb contrast is 5.38:1 (HEAD teal ≈ 2.60:1).
  - Mutants M1–M8 red, sketch green 4/4.
  - Covering 30 files, 442/442.
  - typecheck rc 0; lint rc 0 (205 warnings + 1 info = HEAD).
  - Claims: planning rc 0 with empty stderr. The sketch-side diff shows only K1/K2 (scratch repo; `git add -N` shows `A` where the store will show `??`), K5, K8, K8b, K8c and K17.
- **Reference:** Live 12 manual pages "Working with the Browser" and "Arrangement View", fetched and searched in full (`reference-scrollbar.txt`). There is no scroll-bar look, so "no reference found" for the look; behaviour is unchanged.

## 3. Other records
- **ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS** was filed with root as promised after stage 3 (`b-round-433-checkpoint-request.md`, D-29z1535). It is non-blocking.
- **TLM-SABA-B-12-FIREFOX-SAFARI** gains the Firefox OS-default dialog scrollbar. Its deadline is **RETRO 435**: at that retro, its unchecked rows go to Saba as one question (L46).
- **REGRESSION-2026-11-13** gains REG-SABA-B-12-DIALOG-SCROLLBAR.
- **Close review (advisor, D-29z1537):** L61 was amended in place to name the scrollbar and the `--hide-scrollbars` trap (still 60 lines; copy in `lessons-before-434.md`). Round 433's clear probe on the sketch (hidden-bar harness) gives ALL OK with 670×38 (`probe/neighbour-clear/compare.txt`), which is now C row 4b. The rest of the gate-433 review has only the Architecture note, which equals TL-R433-06. The store's Modal user is `/cart`'s ConfirmDialog (default skin; it needs a backend, so DS1 covers it and the regression row is BLOCKED in the cloud). STEM-LANES has no answer (K21 0).
- **Scratch:** `/tmp/b434` (HEAD + sketch; its `vite.config` was restored after the probe; the :5174 server was stopped) is outside the store. The store tree is clean at `0c22ac9`.

## 4. Order after round 434
1. **RETRO-435** at round 435. B runs it with tech-lead, qa-engineer and consequence-tester consults. Inputs:
   - the B-R433 miscount;
   - the hidden-scrollbar harness gap as a lessons merge;
   - the TLM deadline;
   - the whole-screen journey review.
2. REGRESSION-2026-11-13, when due.
3. COPY-PD-VIS (STUDIO-VIS-4/6/7/10), with SABA-LANE-RESIZE-HANDLE.
4. SYS-1, then SYS-3.
5. STORE-REDESIGN 2b…5 (direction A exists).
6. ARCH-SPLIT.
7. REVIEW-RECOMMENDATIONS (includes SABA-B-12 stage 4, the selects, and STUDIO-VIS-3/5/8/9).
8. T12-ADVANCED.
9. The phase-2 queues, under their gates.

STEM-LANES jumps ahead when Saba answers.

## 5. Open items carried
- TLM-SABA-B-12-FIREFOX-SAFARI (deadline RETRO 435).
- ARCH-CHECKPOINT-SYS-2, ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS and ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING: with root.
- Saba-dependent: STEM-LANES, SRW-21 (`deferred_user`), PHASE2-VIDEO-SCORING and SABA-Q-NUMBER-FIELD-DRAG.

## 6. Readiness for commit
Round 433 is published. This planning wrote only loop artifacts. The store tree is clean (`git status` empty at `0c22ac9`), and no B dev server is left running; only root's :5173 runs.
