# B round 380 → 381 planning

**Date:** 2026-11-07 · **Backlog:** v346 → v347 · **Decisions:** D-29z1267 … D-29z1271 · **Next task:** `current-task.md` (round 381, PERF-13a) · **Archive:** `tasks/round-380.md` (byte-equal copy of the round-380 task) · **Baseline HEAD:** `9a05c82` (`gates/gate-round-380.json` status `published`).

## 1. Round 380 acceptance (D-29z1267)
Accepted from independent evidence only:
- **C PASS** (`c-round-380.json`): 13 rows passed and 0 bugs, with `browserVerified` and `realVerified` both true.
  - WAV-BYTES: E1–E4 sha equals HEAD at 1440×900 and 1280×720.
  - CANCEL, MP3 and G380-AUTH ran in the browser at both viewports.
  - PERF-RES: 22 asserts PASS on the production build, including the four flipped rows (0.1 / 0.2 MiB; 0 / 0 ms at 6×).
  - Mutants: 8/8 unit and 2/2 perf mutants red.
- **L57 check:** `tools/l57-check.py` reports OK at planning.
- **Blocked:** the fake-bearer 500 is `blocked` (backend unavailable). The gate rows are not claimed.
- **Gate 380:** `published`, commit `9a05c82` on both remotes.

PERF-12a is done. The round-379 `rounds` entry, which was left as "dispatched", is corrected to done.

## 2. Gate 380 review and A/C notes (D-29z1268)
| Source | Item | Ruling |
|---|---|---|
| Gate finding 1 | `longtask-max.6x` asserts a wallclock metric | `GATE380-L1-LONGTASK-WALLCLOCK-FLAKE`, deferred Low. If it flakes, loosen it to 150–200 ms and never send it back to record. The mutant is ≥ 1221 ms |
| Gate findings 2, 3 | Error cause lost; stall timer armed late | Info, closed |
| Gate finding 4 | Worker double buffer | = SIG-R380-WORKER-DOUBLE-BUFFER (existing) |
| A delta review | Inferred `any` in `export-wav-stream.test.ts` | `A-R380-REVIEW-INFERRED-ANY`, deferred Low |
| A note | Lint count of 205 warnings not compared with HEAD | Info, closed: Biome is clean on the changed files and gate verify is green |
| A rulings | Test-strength Mediums fixed inside the grants and re-reviewed (no STOP); FileReader Blob reads (both ruled options were measured broken in jsdom) | Accepted |
| Architecture notes | Two copies of the WAV header; the export client lifecycle | `SIG-R380-WAV-HEADER-TWO-COPIES` (a candidate after 12b) and `SIG-R380-EXPORT-CLIENT-LIFECYCLE` (keep). Signals only, not scheduled |

No Critical, High or Medium finding was opened.

## 3. Next round choice (D-29z1269, D-29z1270)
- **REGRESSION is not due.** It last ran on 2026-11-05, and 2026-11-07 is 2 days later; the rule needs 3. The next planning on or after 2026-11-08 is REGRESSION.
- **PERF-12b goes to `awaiting_user` (D-29z1269).**
  - Tech-lead ruled that windowed renders cannot be bit-exact (TL-R380-12B). L44 says a tolerance the planner records is not a Saba decision.
  - The loop has no way to build a change and hold it back: C PASS goes straight to the gate, which publishes.
  - So 12b waits for SABA-Q-PERF12B-TOLERANCE. This supersedes the D-29z1265 clause "built and measured".
- **PERF-11c-iii-d/e** wait for the checkpoint or RETRO 384. PERF-11b is `awaiting_user`.
- **So PERF-13 is next.**
- **Premise re-measured (L37).** The plan says "backing ≤ 60 MB (140)", and that row reads 19.3 MiB today. It cannot see decoded audio.
  - **B's HEAD probe** is `b-round-380/probe/pcm-probe-381.mjs`. It keeps a WeakRef registry of decoded buffers and reads it after two GCs.
  - **Result:** 124.04 MiB of decoded PCM is alive at ready, in 9 buffers. The value was identical in 6 of 6 runs at both viewports (`pcm-head-381.json`).
  - **Breakdown** (`pcm-detail-head-381.json`): 92.18 MiB comes from the two decoded MP3s (101.35 s and 150.37 s).
  - **Nothing frees them:** `buffersRef` has 0 delete or clear sites.
- **Consults** (both read-only):

  | Agent | Advice |
  |---|---|
  | `performance-optimizer` | Measure PCM with an init-script WeakRef registry; memory-infra tracing is record-only at most. 13a should be harness-only. An LRU may evict only sources no clip uses. The R314 6× long task is its own stage |
  | `tech-lead` | Pin `present.clips` plus the source being previewed or exported, never history: history is unbounded, and `applySchedule` silently skips a clip with no buffer. Peaks and duration survive eviction. 13b needs a "known" vs "decoded" state. The stem cache makes a re-decode cheap. Module: `decoded-buffer-cache.ts` |

  Both consults assumed the demo was too small to show eviction. B's probe disproves that: the unplaced 150 s source makes 13b testable in the browser.
- **Split (D-29z1270):**
  - **13a:** harness PCM rows, all `record`. This is round 381.
  - **13b:** the cache with a budget.
  - **13c:** media-element preview.
  - **13d:** the R314 long task and the stereo copy.
- **Tech-lead's alternative not taken.** Tech-lead proposed 13a as the module plus wiring at an Infinity budget. That would edit ArrangementContext while the checkpoint is open, with no measurable gain, so it becomes part of 13b.

## 4. Task design notes
- **The rows are `record`.** By L58, nothing is asserted that B did not run on a sketch.
  - The ready values were measured at HEAD in the dev build; app code is unchanged, so they carry over.
  - The after-export row ships as "record — not run on sketch".
- **Liveness guard (L37).** The guard uses its own injected probe buffer, and the count must equal the number of library sources. Its two browser mutants are drop-decode-wrap and drop-ctor-wrap.
- **GC ordering** is part of the contract: GC twice, then read.
- **The `instanceof AudioBuffer` claim** (0 hits) is what makes the subclass hook safe.
- **Doc 247** says stage 1 of 4.
- **L28 multi-stage grep** finds docs 232, 238 and 246 in progress. Each is tied to an open stage: PERF-DRAG-PREVIEW, PERF-11c-iii-d/e and PERF-12b.
- **Claims:** `claims-381.sh` (output `claims-381-output.txt`). The frozen manifest has 1,271 entries; protected rc 0.

## 5. Root notes
- **ROOT-NOTE-PERF13-PLAN-ROW.** Row 39 of `docs/technical/performance/perf-plan.md` should target `res.mem.pcm-live-mib-ready`, not backing-ready. B does not own that file and made no edit.
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING is still unanswered.** Its ninth echo is `SIG-R381-ARRANGEMENT-BUFFER-CACHE-OWNER`: 13b adds a cache next to ArrangementContext. No new request is filed; RETRO 384 is the L46 deadline.
- **SABA-Q-PERF12B-TOLERANCE** blocks only PERF-12b.

## 6. Status and completion
- **Decision: CONTINUE.**
- **Why not COMPLETE.** These remain:
  - STUDIO-PERFORMANCE: PERF-12b, 13a–d, 14, 15, 11b, 11c-iii-d/e, 9c/d, 4b/c and DRAG-PREVIEW;
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - `deferred_low_polish`.
- **Not BLOCKED.** 12b waits, but 13a runs. The open Mediums are manual, root or awaiting_user items and block nothing.
- **Purchase protection unchanged.** Round 381 touches no `app/**` file and no protected file. G381-AUTH re-checks the guard.
- **The workspace opens anonymously.** B's probe loaded `/studio-lab` with no auth at both viewports.
- **lessons.md** is unchanged at 60 lines; no Saba-reported issue this round.
- **Commit readiness.** Round 380 is already published. Round 381 is ready for the gate after C PASS.

## 7. Advisor and agents
- **Advisor:** consulted three times: before choosing the approach, before writing the task, and before handover. The last check added K20–K23 (collection-ready wait, pinned locator, WeakRef types, HEAD problems) and fixed the K10 count.
- **Project agents:** `performance-optimizer` and `tech-lead`, read-only.
- **Not consulted:** `product-designer` and `ableton-arrangement-expert`, because nothing visible changes.
