# B round 417 → 418 planning (2026-11-08)

**Decision:** CONTINUE. **Next:** round 418 = SYS-R416-PREVIEW-CONTROLLER, D-29z1454…D-29z1457.
- **Advisor:** available, and used after orientation (baseline, rulings, matrix-first shaping, pre-check clauses). A final check follows after the files were written.
- **Consults:** `tech-lead` reviewed the frozen sketch (L58) and gave **Verdict: approve**: no Critical, High or Medium findings, and 4 Lows deferred (`b-round-417/sketch-review.md`). Reference-first, `product-designer` and the screen budget do not apply: this is a behaviour-preserving fix round, and the browser rows prove equality with HEAD.

## 1. Accepted from independent evidence
- **C round 417: PASS** (`c-round-417.json`): 8 rows passed, `browserVerified`/`realVerified` true. The only BLOCKED row is the fake-bearer path (no backend in the cloud).
- **Gate 417: `published`** at `061068d`, with verify 3922/3922. It is the round-418 baseline; HEAD = `061068d` and the tree is clean.
- **SYS-CLOCK-DETERMINISM is done (მზადაა)** (D-29z1454). Its 6 ids are closed. C-R416-CLAIMS-K22-ARCHIVE is also closed: C row 1 showed K14 complete with empty stderr.
- **REGRESSION is not due:** `regression-last.json` is 2026-11-07, so the next one is due on or after 2026-11-10. The file is unchanged.
- `tasks/round-417.md` is a byte copy of the round-417 task (K13 `identical`). The before-copies are in `b-round-417/*-before-418.*`.

## 2. Rulings on round-417 findings (D-29z1455, L10)
- **A-R417-REVIEW-M1 / C-R417-BW5-HOIST-FRAGILE:** the reviewer's Medium on the ruled BW5 method is **downgraded to Low with a reason**.
  - It is latent: it would need a hoist refactor and a full-build regression together, and MU-BW5-FULLBUILD is red on the published tree.
  - C rated it Low independently.
  - It goes to `deferred_low_polish`, merged with GATE417-L2. It is fixed when a round owns `tempo-window.test.ts`, with a read-independent work signal.
- A-R417-REVIEW-L1/L2/L3 and GATE417-L1/L3 go to `deferred_low_polish`.
- A-R417-REVIEW-M2 is closed: A fixed doc 268. The SIG-R415-WORKSPACE-ENV-CONVERGENCE scope is corrected to EN10 and VDS3, and A's architecture note is recorded there as a signal, not a task.
- **C-R417-L58-SKETCH-REVIEW-MISSING** (a B process repeat, rounds 415 and 417) is fixed in this planning:
  - `b-round-417/sketch-review.md` names the dispatched sha;
  - `claims-418.sh` K19 runs `tools/l58-check.py current-task.md`, and it prints `L58 OK`.

  It closes when C round 418 row 1 shows that output.

## 3. Round 418 task (`current-task.md`)
- **Region:** the region was found by grep. `decidePreviewMode` and `useLibraryPreviewController` do not exist; the preview logic lives in `startLibraryPreview` and `stopLibraryPreview` in `ArrangementContext.tsx`, plus `preview.client.ts`.
- **No root answer:** no root answer to the preview checkpoint was found in the loop folder (`find -L`), so the L46 default runs.
- **Changes:**
  - a per-request token;
  - a stream fallback deferred by `queueMicrotask` and checked against the token;
  - the null-owner refusal written before any stop;
  - `setErrorHandler` on a same-url seek;
  - a guarded `readTime`, read once per watchdog tick;
  - a local const in the seek branch.
- **Rows:** 12 new rows, PC1–PC12, under the 20-row split rule, so this is one round. PS8, PS13 and PS27 change only to `await act(async …)`.
- **Sketch evidence:**
  - the sketch is `sketch-418.patch.txt`, sha `146bce6c…`;
  - 12 mutant lines, each red on its named rows; PC7 is a lock row;
  - full suite 3934/3934; typecheck, lint and biome rc 0;
  - loaded replicate 40/40;
  - claims stderr empty for both planning and sketch, and the diff is K1, K2, K5, K9 and K10 only.
- **B browser pre-check:** a second dev server ran on the scratch (port 5174, its own `cacheDir`). It **found a regression in the first sketch.** R1b, a seek followed by a stall, gave no fallback: the seek bumped the token while the player kept the old error closure. The fix (`setErrorHandler`, PC12, MU-SEEK-KEEPS-OLD-HANDLER) went in before review. The final sketch matches HEAD in **14/14 cells** (`probe/compare-head-vs-sketch.txt`).
- **C's rows:**
  - claims, with K19 `L58 OK`;
  - patch identity and 117/117;
  - mutants equal to B's, plus a loaded replicate;
  - 7 preview browser rows at both viewports, compared with B's HEAD run;
  - a Play/Stop smoke;
  - AUTH;
  - doc 269.

## 4. Environment note (for C/root)
- **Shared cache exposure:** a scratch reset briefly reverted the scratch `vite.config.ts` `cacheDir` (20:20:53–20:21:01 UTC). The 5174 server restarted once against the shared `node_modules/.vite`. Root :5173 was checked afterwards with a real browser row (R10 at HEAD, OK), and every later HEAD row ran on :5173 without error. 5174 was stopped after the sketch rows.
- **Cold start:** the first sketch R1 run at 1440 hit a cold-start null status element (L38 class). It was re-run clean.

## 5. Schedule (D-29z1457, unchanged order)
418 SYS-R416-PREVIEW-CONTROLLER → SYS-R369 (L46 default) → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).
- REGRESSION-2026-11-10 goes first at the first planning on or after 2026-11-10.
- The next RETRO is round 431, or the end of STUDIO-PERFORMANCE.

## 6. Architecture
No new checkpoint request.
- This round is the L46 default of the open preview checkpoint (ARCH-CHECKPOINT-PREVIEW-AFTER-13C), on one owner, and it is behaviour-preserving.
- `tech-lead` noted one pre-existing gap outside the region: a collection change does not stop the preview (TL-R418-L4, deferred).
- ARCH-CHECKPOINT-DECODE-REGION stays open for root.

## 7. For root
- **Publish:** nothing pending from 417 (already published at `061068d`). After C PASS in round 418, the diff is ready for the gate: 3 files plus doc 269.
- **Open root items (unchanged):** ROOT-REQ-PLAYWRIGHT-FIREFOX and ROOT-REQ-VITEST-PERF-INCLUDE.

## 8. Files written (B-owned only)
- `b-round-417/`:
  - sketch: `make-sketch-src.py`, `make-sketch-test.py`, `sketch-418.patch.txt`, `sketch-418.sha256`, `sketch-review.md`;
  - mutants: `mutants/` (`run.py`, 12 logs, `summary.txt`);
  - pre-check logs: `precheck-{full,typecheck,lint,biome3,loaded}.log`;
  - browser probe: `probe/` (`rows-418.mjs`, `rows.mjs`, `compare.py`, `head/`, `sketch/`, `compare-head-vs-sketch.txt`);
  - grants and manifest: `grants-418.txt`, `r418-frozen-sha256.txt`;
  - claims: `claims-418.sh` with its planning and sketch outputs, stderr files and diff;
  - updaters: `update-backlog.py` and `update-feature-status.py` (each with `.done`);
  - `checkpoint.md` and the before-copies.
- Loop folder: `tasks/round-417.md`, `current-task.md`, `backlog.json` (v393 → v394), `feature-status.md`, `b-next.json`, and this file. `lessons.md` is unchanged: L58 already holds the checker clause, and this planning applies it.
- No app source was edited. The scratch copies are outside the store (`/tmp/b417-scratch`, `/tmp/b417-review`).
