# B round 461 → 462 planning (2026-11-12)

**Decision: CONTINUE.** Round 462 is STORE-2b-3d-1: delete 6 dead Store modules. ArtistBioSection is held, see below. The task is in `current-task.md`. D-29z1630 records the round-461 result, and D-29z1631 records the dispatch, the reorder and the 2b-3d split.

- **Advisor:** available, consulted after orientation and before any artifact was written. Its advice, all applied:
  - read the gate-461 review and look for new Saba/root answers first;
  - dispatch 2b-3d-1, not 2b-3c-2b;
  - split 2b-3d;
  - close items only from C's files;
  - use `a7fa78e` as the baseline.
- **Project agents:** `tech-lead` approved v1 (sha `59a9293f…`) with 0 Medium+ and 4 Lows, each ruled. It then delta-reviewed the dispatched **v2** (sha `2ce4b5e5…`): **APPROVE**, 0 Medium+. Both verdicts are in `b-round-461/sketch-review.md`. `product-designer`, `performance-optimizer` and `ableton-arrangement-expert` were not needed: no UI changes, no perf path and no Studio behaviour.
- **Archive:** `tasks/round-461.md` is a byte-identical copy of the round-461 task (`cmp` OK). The pre-edit copies are in `b-round-461/`: `current-task-before-462.md`, `backlog-before-462.json`, `feature-status-before-462.md` and `b-next-before-462.json`.
- **Baseline:** gate 461 is `published`, commit `a7fa78e`. The store tree was clean, and B edited no store file. All sketch work ran in `/tmp/b462-scratch` and `/tmp/b462-mut`.

## Round 461 result, from the evidence
- **C PASS:** `c-round-461.json`, rows C1–C10, `browserVerified`/`realVerified` true, 0 bugs, L57 OK.
- **B spot-checks:**
  - `c-round-461/mutants/mutants.txt` is `cmp`-equal to `b-round-460/mutants/mutants.txt`;
  - `covering.log` shows 3 files / 62 tests and 0 `Hydration failed`;
  - `c8.json` shows the Studio at 1440 and 1280 plus anonymous protection ("Sign in required", `audioSrc` 0).
- **Gate 461:** published `a7fa78e`; the review says COMMIT OK, 8/10.
- **Closed:** A-R460-REVIEW-1, -6 and -7. The E11 part of A-R459-REVIEW-R8 and the E8 part of TL-R459-TEST-NITS are done; both parents stay deferred.
- **New from the gate:**
  - GATE461-1, -2 and -3 (Lows) → `deferred_low_polish`.
  - Gate finding 4 (production gaps only the browser covers) is info and already in doc 300.
  - The gate's Architecture note (extract the entrance test harness) → a signal on SIG-R459-ENTRANCE-HANDSHAKE, not a task.
- **A's process note:** `mutants.py` needs its output folder created first. Logged as INFO-A461-MUTANTS-MKDIR. The round-462 `mutants.sh` creates its own folder.
- **SABA-B-13 status:** stays მზადაა for Chromium. Firefox/Safari is TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465.

## Why round 462 is STORE-2b-3d-1
- **No in-loop Medium+ is open.** The open Mediums are manual (A-R73, GATE232-S2, GATE274), `awaiting_user` (GATE271), `open_root` (GATE304-M1) or scheduled in REVIEW-RECOMMENDATIONS (STUDIO-VIS-5, SABA-B-12 stage 4).
- **No new answers.** No new decision file has arrived from Saba or root (`user-review/`; AGREE-STEM-LANES is still unanswered), and ARCH-CHECKPOINT-STYLE-SCAN is still unanswered.
- **The reorder (D-29z1631):**
  - 2b-3c-2b is Low/info only and would be the fourth round on `helpers/style-scan.ts`, which is exactly the extraction trigger tech-lead named.
  - 2b-3d-1 is product cleanup Saba approved: his 2026-11-10 legacy policy, plus the Q6 default with no objection.
  - 2b-3c-2b stays queued after 2b-3d-2.
- **Advisor closing check, and v2.** The advisor found three gaps, and B fixed them before dispatch.
  - **Keep-list.** `ArtistBioSection.tsx` is the only renderer of the NEWSLETTER_STATS stats (Downloads, Products, "10K+ Happy Producers") [K6]. The keep-list protects "all other stats and claims", and Q6 had wrongly told Saba that only Testimonials held keep-list content. Sketch v2 therefore keeps the file, and the question goes to Saba as **SABA-Q-ARTISTBIO-STATS** (`user-review/questions-round-462.md`, default: keep).
  - **C6** is now a saved script (`build-compare.py`), and C compares its output to B's with `cmp`. The old hash-only normalization would have failed on the manifest line.
  - **C7** was run by B on the sketch (`probe/store-pages.cjs` → `probe/run1/store-pages.json`). It covers 6 pages × 2 viewports, compares HEAD and tree text with a HEAD-HEAD control, and checks that 0 elements carry the 12 removed tokens and that no chunk returns 404.
  - **Also re-checked:** `agents:check` and `test:agents` give rc 0 on the sketch; `questions-retro-450.md` is `.notified`; L28 doc forms (STORE-2b docs 292, 293, 294, 296 and 297 use "stage 2b-… of STORE-2b"); doc 299 stays tied to 2b-3c-2b (backlog).
- **Scope ruled:**
  - ArtistBioSection and TestimonialsSection are kept (keep-list; SABA-Q-ARTISTBIO-STATS, SABA-Q-TESTIMONIALS-UNMOUNTED).
  - IconButton and ChatButton are kept, because they were not in the Q6 list Saba saw.
  - The dead CSS goes to 2b-3d-2.

## Pre-check on sketch v2 (all in `b-round-461/`; the v1 runs are in `v1-superseded/`)
- **Static checks:**
  - tsc rc 0;
  - lint 192 warnings, against 207 at HEAD;
  - the covering set, 6 files / 77 tests, is green;
  - **the full suite passes, 284 files / 4182 tests** (`precheck-full.log`).
- **Mutants:** BASE GREEN, M1–M9 RED with named rows (`mutants/mutants.txt`); M9 deletes ArtistBioSection and turns GT3, GT5 and GT6 red.
- **Production build, HEAD vs sketch (`build-compare.txt`):**
  - the server bundle and every JS chunk are equal after hash normalization, except the manifest;
  - **the CSS loses 12 Tailwind utilities** that only the deleted files' class strings generated. The whole-token scan finds 0 live users (`css-removed-selectors.txt`, `css-removed-live-grep.txt`); the scanner was shown non-vacuous on `origin-top` in PianoCurtainLoader.
  - **Browser:** HEAD and tree text are equal on all 12 rows (`probe/run1/store-pages.json`) [K22].
- **Claims:**
  - the planning output (`claims-462-planning-output.txt`) and the after-A output (`claims-462-expected-after-A.txt`) differ only in K2, K3, K5, K8 and K15;
  - both stderr files are empty;
  - L58 OK (`l58-check.txt`);
  - L29: 19 hits (`l29-planning.txt`), each a grant path, a planned change, a command argument or a tagged claim.
- **Backlog:** version 453 → 454, applied by `update-backlog-462.py` and the v2 corrections in `update-backlog-462b.py`, each with a `.done` marker. TL-R462-L1's title now says 3 names.

## Other notes
- **Regression:** `regression-last.json` says 2026-11-10. It is not due today; it becomes due on 2026-11-13. **The next planning on or after 2026-11-13 is REGRESSION-2026-11-13**, and its round updates `regression-last.json` when it closes.
- **RETRO:** RETRO 465 comes after round 464 (15-round rule).
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are unchanged since round 3. Nothing new is carried.
- **Architecture:** ARCH-CHECKPOINT-STYLE-SCAN is still pending with root and does not block this round, which deletes allow-list entries and adds no helper code. No new checkpoint request.
- **Commit readiness:** round 461 is published. Round 462's tree can be published after C PASS and the root gate. **Note for root:** this round deletes 6 tracked files (`git status` shows `D`), and the CSS bundle shrinks by 12 utilities.
- **Not COMPLETE.** Still open:
  - STORE-2b-3d-2, 2b-3c-2b, 2b-4 and STORE-2c…5;
  - ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STEM-LANES (`awaiting_user`), T12-ADVANCED and phase 2;
  - the deferred Lows and the Tech Lead manual rows.
- **Not BLOCKED:** no external input is needed. SABA-Q-ARTISTBIO-STATS has a default and does not stop the loop.
