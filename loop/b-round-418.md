# B round 418 → 419 planning (2026-11-09)

**Decision:** CONTINUE. **Next:** round 419 = SYS-R369-STEM-CACHE-WRITE-COORDINATOR, D-29z1458…D-29z1461.
- **Advisor:** available, and used after orientation (gate-418 review and A report first, baseline `3579fcc`, matrix and per-Low rulings). A final check follows after the files were written.
- **Consults:** `tech-lead` reviewed the frozen sketch (L58): **Verdict: approve with changes**. All four changes are documentation only, with no Critical, High or Medium findings (`b-round-418/sketch-review.md`). Reference-first, `product-designer` and the screen budget do not apply: this is a cache-internal fix round, and the browser rows prove equality with HEAD.

## 1. Accepted from independent evidence
- **C round 418: PASS** (`c-round-418.json`): 8 rows passed, `browserVerified`/`realVerified` true. The only BLOCKED row is the fake-bearer path (no backend in the cloud).
- **Gate 418: `published`** at `3579fcc`, with verify 3934/3934 (`gates/round-418/verify.log`). It is the round-419 baseline. HEAD = `3579fcc` and the tree is clean.
  - `context/head-sha.txt` still read `061068d`, because it was written before the gate commit. It is stale and is noted in the task.
- **SYS-R416-PREVIEW-CONTROLLER is done (მზადაა)** (D-29z1458).
  - Its 7 ids are closed.
  - C-R417-L58-SKETCH-REVIEW-MISSING is also closed: C row 1 showed K19 `L58 OK`.
- **REGRESSION is not due:** `regression-last.json` is 2026-11-07 and today is 2026-11-09, so it is due on or after 2026-11-10. The file is unchanged.
- **Archive:** `tasks/round-418.md` is a byte copy of the round-418 task (K13 `identical`). The before-copies are in `b-round-418/*-before-419.*`.

## 2. Rulings on round-418 findings (D-29z1459, L10)
- These go to `deferred_low_polish`:
  - A-R418-REVIEW-L1/L2/L3;
  - the three C confirmations (merged into them);
  - GATE418-L4 (the fallback microtask on unmount, same root as TL-R418-L1).
- L1 and L2 close together in one round that owns `preview.client.ts`.
- **Architecture note** from the A-418 reviewer and the gate-418 reviewer: recorded as SIG-R418-PREVIEW-CONTROLLER-EXTRACT. It is a signal, not a scheduled task, and it is the same item as ARCH-CHECKPOINT-PREVIEW-AFTER-13C (counted once).

## 3. Round 419 task (`current-task.md`)
- **Root answer:** none was found for ARCH-CHECKPOINT-PERF9-STEM-CACHE (searched the loop folder). Under the L46 default the code stays in `stem-cache.client.ts`.
- **STEM-LANES coupling:** public demo previews load through `publicPreviewSourceFetch`, which uses the stem cache. Purchased stems use their own `fetchAudio`. A stem set will load several keys together, so this round lands before STEM-LANES.
- **Model:** one per-key operation map (write `{signals, open}` | delete) replaces `writes` and `deletes`.
- **Closes 8 Lows:**

| Low | Fix | Row |
|---|---|---|
| A-R368-REVIEW-L1 | tombstone | SC34 |
| B-R367-TL3-1 | atomic `open` close; accepted-equivalent mutant with a structural reason | — |
| A-R367-REVIEW-L-c | `idle()` drains every operation | SC35 |
| A-R367-REVIEW-L-d | victim-loop check | SC36 |
| A-R367-REVIEW-L-e | integrity deletes only the record it read | SC37 |
| GATE368-L1 | unique `time-counter-random` names | SC38 |
| GATE368-L1 | store name guard | SC39 |
| A-R368-REVIEW-L3 | chain-start check pinned | SC40 |
| A-R367-REVIEW-L-g | SC26 assert made real | SC26 |

  SC41 is a surface lock.
- **Not in this round: GATE368-L3.** A cap needs a measured limit, and STEM-LANES changes how many stems load together. The entry now names both buffer-holding points (`await after` and the commit chain), per tech-lead TL-R419-L2.
- **Split rule:** 8 new rows, under the 20-row threshold, so this is one round.
- **Sketch evidence:**
  - sketch `b-round-418/sketch-419.patch.txt`, sha `fb665319…`;
  - 15 mutant lines: SKETCH green, each fix red on its row, MU-JOIN-IGNORES-OPEN equivalent, and the HEAD-test control for SC26;
  - covering run 49/49;
  - loaded replicate 43/43;
  - full suite 264 files, 3942/3942;
  - typecheck rc 0; lint and Biome rc 0 (205 warnings, as HEAD);
  - claims stderr empty for both planning and sketch, and the diff is K1, K2, K5, K9 and K10 only.
- **B browser pre-check:** production builds of HEAD and the sketch, each on its own port (5181/5182) and outside `store/`, at both viewports.
  - Phases: cold, truncate, delete-file, stale-etag.
  - Result: **ALL EQUAL**, 8 phase cells plus 2 INFO lines (`b-round-418/probe/compare-head-vs-sketch.txt`).
  - The sketch file names have the new form, every sketch phase played (`starts` 1, peak > 0), and there were 0 page errors. `compare.py` fails the row on any of these.
- **C's rows:**
  - claims, with K19 `L58 OK`;
  - patch identity and 49/49;
  - mutants equal to B's, plus a loaded replicate;
  - the production-build stem-cache browser compare at both viewports;
  - a Play/Stop smoke;
  - AUTH;
  - doc 270.

## 4. New Lows from the sketch review (D-29z1460)
- **TL-R419-L1 (info):** the `open` invariant. It is written into ruling 3 and doc 270, and closes on C PASS.
- **TL-R419-L3:** `idle()` now drains until no operation is left. Accepted as a behaviour change, because `idle()` is a test hook with no production caller.
- **Known gaps** (pre-existing or latent, not regressions): TL-R419-L4a, L4b and L4c go to `deferred_low_polish`.

## 5. Schedule (D-29z1461)
419 SYS-R369 → **REGRESSION-2026-11-10** at the first planning on or after 2026-11-10 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).
- STEM-LANES gets the reference-first section, a `product-designer` consult and the LIVE-MEAS-STEM-DROP request.
- The next RETRO is round 431, or the end of STUDIO-PERFORMANCE.

## 6. Architecture
No new checkpoint request.
- The stem-cache region gets one owner and one session lifecycle. The A-367, A-368 and gate-368 reviewers and tech-lead all said keep.
- ARCH-CHECKPOINT-PERF9-STEM-CACHE stays open with root and does not block.
- ARCH-CHECKPOINT-DECODE-REGION stays open for root.

## 7. For root
- **Publish:** nothing is pending from 418 (already published at `3579fcc`). After C PASS in round 419, the diff is ready for the gate: 2 files plus doc 270.
- **Open root items (unchanged):** ROOT-REQ-PLAYWRIGHT-FIREFOX and ROOT-REQ-VITEST-PERF-INCLUDE.
- **Environment:** the B probe built in `/tmp/b419-head` and `/tmp/b419-scratch`, with `node_modules` symlinked. It never built inside `store/`, and the :5173 dev server was not touched. Ports 5181 and 5182 are stopped.

## 8. Files written
- `current-task.md` and `tasks/round-418.md` (archive).
- `backlog.json` (v395, D-29z1458…D-29z1461).
- `feature-status.md`.
- `b-next.json`.
- `b-round-418/`:
  - sketch and generators;
  - sha;
  - `sketch-review.md`;
  - `mutants/` (runner, logs, summary);
  - `precheck-*.log` and `precheck-testdiff.txt` (the test-file `-U0` diff: 1 removed line, 6 hunks);
  - `probe/` (scripts, out/head, out/sketch, compare);
  - `claims-419.sh` and its outputs and diff;
  - grants;
  - frozen manifest;
  - before-copies;
  - update scripts and their `.done` files.
