# B round 498 → 499 planning (2026-11-13)

**Decision: CONTINUE.** The next round is 499: DPG-BUTTON-CLEANUP-2, stage 2b-1. The shared `EmptyState`, the error page ("Try Again" and "Go Home") and the `/store` error "Try again" move to `Button` / `buildButtonClassName`.

**Advisor:** available. Consulted after orientation, and again at the closing check.

## Inputs read
- `context/active-summary.md`
- `current-task.md` (round 498), now archived as `tasks/round-498.md` (`cmp` identical)
- `a-round-498.md`, `c-round-498.md`, `c-round-498.json`
- `gates/gate-round-498.json`: **published**, commit `82e118a` on both remotes. This is the baseline for round 499. The gate's `head` field `5d12c75` is the pre-publish HEAD; store HEAD is `82e118a` (`git rev-parse`). `context/head-sha.txt` still reads `5d12c75` and is stale.
- `gates/round-498/review.md`: 3 Lows, 1 info and an Architecture note.
- `regression-last.json`: 2026-11-13, next due on or after 2026-11-16, so **not due**. The next RETRO is round 510.
- `user-review/`: every file has the same restore mtime, so B compared names instead. The only files without a `.notified` partner are `ableton-decisions.md` and `design-ux-decisions.md`, both old and both already referenced in `backlog.json` (37 and 21 hits). There are no new Saba answers.
- The 11-12 and 11-13 Saba items are already recorded (L42): SABA-B-17-ENTRANCE-3-4S (done, round 490), SABA-Q-CTRLK-CONTENT and SABA-Q-GIFTCARDS-HEADER (`awaiting_user`).
- `lessons.md`.

## Round 498 result (D-29z1787): from C evidence only
- **C PASS**, with `browserVerified` and `realVerified` true. C0–C13 passed with 0 bugs. The gate published `82e118a`.
- **DPG-BUTTON-CLEANUP-2 stage 2a is C-verified.** The item is not done: 2b–2e, NONBRAND and the DP gate remain.

## Findings (D-29z1788)
- **GATE498-L1** (the builder has no focus-visible style): **closed as not reproduced.** C3 measured the ring, and so did B on all 10 round-499 targets (`b-round-498/measure/summary.txt`).
- **GATE498-L2** (barrel import): deferred Low.
- **GATE498-L3**: `confirmedBy` on A-R498-TL-B2-2-TIMER-PIN.
- **GATE498-L4**: info, closed.
- The Architecture note is recorded as `confirmedBy` on SIG-R498-BUTTONLINK-WRAPPER. It is a signal; **no checkpoint request** is made.
- **A For B #1** (doc 320 l.4) is a B spec gap: **B-R498-DOC320-L28** (Low). It is fixed by a one-line grant in the round-499 sketch.
- **A's four reviewer Lows** go to `deferred_low_polish`.

## Stage 2b split and round 499 (D-29z1789, D-29z1790)
- **Reachability first.** `b-round-498/probe/reach.mjs` checked that every target renders in the cloud browser:
  - `/store` error: with the mock off;
  - cart empty: with the mock on;
  - recordings denied, not-found and empty, and the downloads empty state: with L36 stubs (the `{success,data}` envelope plus CORS headers);
  - the root error page: with a malformed catalog;
  - the route error page: `/products/<missing>`.

  On the way, B found the pre-existing **B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML** (Low, deferred).
- **The split:**
  - **2b-1**, this round: the empty and error states;
  - **2b-2**: `<button>` and submit sites, including the hire-us submit with its ST5 pin;
  - **2b-3**: recordings "Create a scene", cart and StudioShowcase.
- **product-designer** (`b-round-498/consult-product-designer.md`):
  - primary → primary/lg/pill; paired secondary or exit → ghost/lg/pill;
  - the error page's "Try Again" becomes primary.
  - It raised two Saba copy questions (`user-review/questions-round-499.md`). They do not block, and the defaults hold until he answers.
- **tech-lead** (`b-round-498/sketch-review.md`): v1 came back APPROVE-WITH-CHANGES.
  - Item 3 is applied.
  - Item 1 (doc 321) is ruled: the prose stays A's job, and the status line keeps the L28 form.
  - The v2 delta came back APPROVE and accepted the ruling.
- **Pre-check on scratch copies outside `store/`:**
  - tsc and Biome rc 0;
  - covering tests 14 files / 137;
  - build rc 0 with an unchanged CSS bundle;
  - mutants N1–N9 all RED, each on its named rows. N8 first survived, which exposed a wrong B2B-5 anchor; it was fixed and now goes RED;
  - browser at 1440/1280/375 for 10 targets, HEAD vs sketch, plus nav and journey: identical paths;
  - scanner 116/48 → 109/44;
  - the patch reproduces the tree byte for byte on a fresh `82e118a` archive;
  - claims rc 0 on HEAD and on the sketch;
  - L58 OK.
- **Full suite:**
  - v0 passed: 297 files / 4,328 tests.
  - The first v2 run failed one test, PS17, with `ENOENT public/middle-east.mp3`. B's mutant copy was missing that tracked file, so the run was environment-invalid. Its log is kept as `precheck-full-v2-mutcopy-env-invalid.log`.
  - v2 was re-run on the fresh archive-plus-patch copy. The result is in `precheck-full.log` and in the closing note below.

## No source change by B
- B wrote only loop artifacts, plus scratch copies under `/home/runner/czaba-project/tmp/b498-*`, which are outside `store/`.
- `git status` in `store/` is clean. Frozen checks 1–3 and the protected manifest are rc 0 at HEAD.
- The mock API and B's sketch dev server (:5174) were stopped. The root server on :5173 still answers 200.

## Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - DPG-BUTTON-CLEANUP-2: 2b-1 through 2e, and NONBRAND;
  - the rest of DPG P1/P2 and the DP gate;
  - STORE-2c..5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, the STUDIO-PERFORMANCE remainder, T12-ADVANCED, phase 2 and STEM-LANES;
  - the High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (with root);
  - all deferred Lows before final acceptance.
- **Not BLOCKED:** round 499 needs no external input.
- **Ready for commit:** nothing new from B. Root already published stage 2a.

## Closing note (full suite v2)
See the end of this file, which is appended after the run.

- **Full suite v2** (fresh `82e118a` archive + v2, `b498-verify`): 297 files, 4,328 tests (4328 passed), rc 0 (`b-round-498/precheck-full.log`).

## Advisor closing check (D-29z1791)
1. Doc 321 was removed from `r499-post-sketch-sha.txt`, because A's prose changes it. Check 4 is now plain rc 0, and A re-runs checks 1, 2 and 4 after writing the prose.
2. The build was re-run on the fresh archive-plus-patch tree `b498-verify`: rc 0, with the same CSS bundle (`precheck-build-sketch.log`).
3. The HEAD Biome log is saved (`head-biome.log`, 8 warnings).
4. K14 now covers every cited artifact, including the env-invalid log, the mutant logs, the probe outputs and `questions-round-499.md`.
5. Ghost hover at 1.12:1 → PD-R499-GHOST-HOVER-FAINT, as a signal input to DPG-COLOR-CONSOLIDATE.
6. EmptyState's caller-less `<button>` branches are kept as API. The decision is recorded as B-R499-EMPTYSTATE-ONACTION-UNUSED, which cites the legacy-removal policy.
7. B viewed three sketch screenshots: the root-error pair at 1440 and 375, and the denied pair at 375.
8. Status strings now follow the `closed (D-…)` / `C PASS (D-…)` convention.
9. C's mock stop gained a port fallback (`ss`).
10. C13 now has a downloads criterion: anonymous → "Sign in required".

Claims were re-run on HEAD and on the sketch with no MISSING, and L58 is OK.
