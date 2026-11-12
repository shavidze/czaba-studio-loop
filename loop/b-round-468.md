# B round 468 → 469 planning (2026-11-12)

**Decision:** CONTINUE. The next task is round 469, SABA-B-15 stage 2: the fix (`current-task.md`).

**Consults.** The advisor was available. I consulted it after orientation (before writing) and before hand-off (§6). `product-designer` was consulted read-only on the look change; its ruling is in `b-round-468/pd-ruling.md`. No other project agent was needed.

## 1. Round 468 result (only from `c-round-468.json`, plus C's own files)
- **C PASS:** C1–C9, `browserVerified` and `realVerified` true, 0 bugs. The fake-bearer path is BLOCKED (backend unavailable in cloud) and stays open backend evidence.
- **Gate 468:** `skipped`, "no real changes", head `9ba13ac`. The baseline is still `9ba13ac`, clean (K1, K2).
- **D-29z1650:** the stage-1 cause is confirmed in cloud: three large `filter: blur()` glows (`ProductSection.tsx` l.38–39 and `StudioShowcase.tsx` l.75, K3). C applied A's gradient swap itself, and `/` went to 0 / 0 with the scroll still eased (C2, C3).
  - A's "For B" items are recorded as backlog signals, not as tasks:
    - SIG-R469-UNMEASURED-BLURS;
    - SIG-R469-GLOW-PROMOTION-TRAP (ruled as R-469-2);
    - INFO-R468-HERO-KENBURNS-INVALIDATION.
  - There is no new bug and no Low to defer.

## 2. B's pre-check on the sketch (L58), in `b-round-468/`
- **Builds:** HEAD, A's proposal (`sketch`) and the tuned sketch (`sketch2`), each a production build of a `9ba13ac` copy. `sketch2` is A's diff with only the opacity stops lowered. Probes ran one at a time.
- **Full-page probe** (`store-scroll-probe-full.cjs`: 40 ticks to the bottom, plus `/gift-cards`):
  - On HEAD, `/` is 8 / 5. So the cost reaches below scrollY 2400 too.
  - On `sketch2`, `/` is 1 / 1, with finalY = maxScroll 4121.
  - `/gift-cards` is 0 even at HEAD. So the grants stay at A's 3 lines; Newsletter, SpecialOffers and gift-cards are not touched.
- **Look check.** product-designer found A's glow 2.4–3.1× today's strength and set a band of 0.8–1.3× (R-469-1).
  - `sketch2` measures 1.09–1.21.
  - The band is two-sided: A's opacities are red above it, and a deleted glow (contribution 0) is red below it.
- **Computed style.** Every glow on the sketch is `radial-gradient` with `filter: none`. Tailwind emitted every new class (`built-css-classes.txt`).
- **Two consult rows were changed, with reasons in `pd-ruling.md`:**
  - **The centre-line peak is a record, not an assert.** Card `backdrop-blur` confounds it: on HEAD, `maxStep ≈ peak`.
  - **Edge jump ≤ HEAD's + 1 level.** HEAD itself measures 1.0.
- **Guard test** `store-scroll-paint.test.ts`:
  - SP1–SP3 pass on the sketch.
  - On HEAD's two files, SP1 and SP2 are red (the mutant).
  - It forbids large blurs and does not pin the new classes (L8).
  - The scan suites pass with the sketch: 15 files, 212 tests. typecheck and Biome return rc 0 on the sketch.
- **Observation:** one `sketch2` full-page pass at 1440 had 8 frames of 50 ms at scrollY 1796–2032, with no long task. The medians stay ≤ 2.
- **Claims:** `claims-469.sh` K1–K18. The run is `claims-469-planning-output.txt`; stderr is empty and there is no `MISSING`.
- **Cleanup:** I removed the scratch trees with absolute paths. Ports 3480–3482 are closed.

## 3. Why this is the next task
- There are no open C bugs.
- SABA-B-15 is Saba's Medium, and round 468 was planned as stage 1 of 2 (D-29z1649).
- The regression is not due: 2026-11-10 + 3 days = 2026-11-13, and this planning is dated 2026-11-12.
- **SABA-B-15 does not close in round 469.** Saba named `/free-downloads`, which is 0 here and is not touched, and every measurement was in software raster.
  - After a C PASS, its status becomes "home cause fixed in cloud".
  - TLM-R468-SABA-SCROLL-DEVICE stays open (deadline RETRO 480).
  - The question is `user-review/questions-round-468.md` Q1, with the Lenis-feel options for L44 and R-468-1.

## 4. Backlog and boards
- **`backlog.json` v465**, via `update-backlog-469.py` (`.done`):
  - D-29z1650 and D-29z1651;
  - the SABA-B-15 and TLM statuses;
  - 3 architecture signals;
  - REGRESSION-2026-11-13 moved, with the REG-SCROLL-HOME-FRAMES update;
  - round 468 done, round 469 dispatched.

  The round-468 entries held no stale `useSmoothScroll` grant text; it had already been corrected at the 467 planning.
- **`feature-status.md`:** the round-468 row (მზადაა) and the round-469 row (მუშავდება), via `update-feature-status-469.py`.
- **`lessons.md`:** unchanged (60 lines). The round taught no new rule that is not already in L18 or L58.
- **Backups and archive:** `b-round-468/*-before-469.*`; the task archive is `tasks/round-468.md` (byte-identical to the round-468 task).

## 5. Architecture and root
- **Architecture:** round 468 has no code-reviewer note, because nothing in the store changed. No checkpoint is requested: the change is 2 class strings and 1 test. ARCH-CHECKPOINT-STYLE-SCAN stays with root.
- **Root, non-blocking:**
  - ROOT-REQ-DP-GATE-FIRST, as before.
  - **Disk:** `c-round-468/{head,fix,mut}`, about 325 MB each, can be removed by root. C said they rebuild from `9ba13ac` plus the diffs.

## 6. Second advisor consult (before hand-off) and its fixes
- **K6 and K16 are pinned to `9ba13ac`.** Read from the working tree, they would have changed once A adds doc 305 and the test, so C13 would fail. The planning output was regenerated; stderr is empty and a re-run is identical.
- **C9:** C copies the untracked test and doc into the scratch copies with `cp`, never with `git add -N` or stash.
- **The `Why we missed it` section was added to the task.** Round 468's near-miss is RETRO480-LOOK-CONTROL in `retro_candidates`: whole-section pixel stats called a 2.4–3.1× glow "a touch brighter".
- **R-469-1 wording:** the control is HEAD with its glows hidden, as the tool computes it. C6 says "0 by construction", with no K tag.
- **Environment-invalid is defined for C2/C3.** Only an L38 overlap or a failing C1 counts; a slow pass is never replaced. A slow-frame cluster inside a fix band in 2 or more passes is a FAIL.
- **`root-pre-push-review.md` and `publication-checkpoint.json`:** both are from 2026-10-07 (round 3, commit `375ee3b`), already handled in the early rounds. There is nothing new to carry.

## 7. Ready for commit
Nothing new is in the store tree: round 468 was a diagnosis round. Round 469 starts from a clean `9ba13ac`.
