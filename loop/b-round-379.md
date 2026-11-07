# B round 379 → 380 planning

**Date:** 2026-11-07 · **Backlog:** v345 → v346 · **Decisions:** D-29z1262 … D-29z1266 · **Next task:** `current-task.md` (round 380, PERF-12a) · **Archive:** `tasks/round-379.md`, byte-equal copy of the round-379 task.

## 1. Round 379 acceptance (D-29z1262)
Round 379 is accepted from independent evidence only:
- **C PASS** (`c-round-379.json`).
  - 13 rows passed, 0 bugs, `browserVerified` true and `realVerified` true.
  - LEAF-PROBE, MARKER-BROWSER, G379-AUTH and STUDIO-SMOKE-379 ran at 1440×900 and 1280×720 against a HEAD copy.
  - The fake-bearer 500 is `blocked` (backend unavailable in the cloud). The gate rows are not claimed.
- **Gate 379:** `published`; commit `ed634d5` on both remotes (`gates/gate-round-379.json`).

PERF-11c-iii-c2b and c2 are done. PERF-11c-iii stays in progress, because d/e remain.

## 2. Gate 379 review and A/C notes (D-29z1263)
The review verdict is COMMIT OK, 9/10.

| Source | Item | Ruling |
|---|---|---|
| Gate 379 finding 1 | Pending-focus clear | Info, closed. Keep the line |
| Gate 379 finding 2 | Stale handle | Info, closed. The RB-LEAF6 final M assertion is the only guard and stays |
| Gate 379 finding 3 | Memo depends on 11 stable callbacks | `GATE379-L3-ACTIONS-STABILITY-NOTE`, deferred Low |
| Gate 379 findings 4 and 5 | Fiber name; in-place mutation | Info, closed. Finding 5 = GATE378-L2, still deferred |
| A-R379-REVIEW-L1 | RB-LEAF6 has no source-state step | Deferred Low |
| A-R379-REVIEW-I1 | The `return true` on a detached flag | Info. Same as HEAD; TL-R379-L1 ruling |
| C/A note | `l50-focus-origins.txt` lists v1 lines | `INFO-B379-L50-STALE-LINES`, closed: a planning artifact only |
| Architecture note | One stable actions context | `SIG-R379-GATE-ACTIONS-CONTEXT`. This is the eighth echo of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. It is a signal, not a task |

No Critical, High or Medium finding was opened.

## 3. Next round choice (D-29z1264)
- **REGRESSION is not due.** `regression-last.json` says 2026-11-05; on 2026-11-07 that is 2 days, and the rule needs 3. It is planned at the first planning on or after 2026-11-08.
- **Waiting:** PERF-11c-iii-d/e wait for the checkpoint answer or RETRO 384 (L46). PERF-11b is `awaiting_user` (protected `auth.ts`).
- **Choice:** by execution_order_d29z1237, PERF-12 is next.
- **Premise re-measured (L37):** `b-round-379/probe/backing-model-1440.json`, with HEAD numbers from `c-round-377/perf-resources.log`.
  - The plan's "123 ms long task / +161 MB" predates PERF-5 and PERF-16.
  - Today: export.1 uses +65 MiB page backing; export.2 uses +130 MiB, with longtask-max 171 / 304 ms at 6×.
  - The cause, measured: the page holds the `getChannelData` views (+37 MiB), the `slice` copies (+37 MiB) and the WAV bytes (+28 MiB).
- **Split:**
  - **12a** keeps one render and streams chunks with `copyFromChannel` to the worker, which returns a Blob. It is bit-identical to HEAD by construction.
  - **12b** does windowed renders, after a determinism ruling.

## 4. Sketch, consults and measurements (D-29z1266)
Details are in `b-round-379/sketch-review.md`.
- **Sketch.**
  - Source: `sketch-src.patch.txt` (v2 = v1 + the tech-lead fixes; `sketch-v1-to-v2.interdiff.txt`).
  - Fakes: `sketch-fakes.patch.txt` (one shared `fakeRenderedBuffer` helper; 9 fake files and 1 source pin).
  - Both apply cleanly to `ed634d5` and their sha values are in `sketch-dispatched.sha256`.
- **Consults:**
  - **tech-lead:** bytes match by construction. Three fixes are adopted in v2 (B1 progress-throw stall, L1 empty chunk, L2 'wav' 0). TL-R380-12B: windowed renders need a tolerance.
  - **performance-optimizer:** the chunk size is fine; assert peak-backing at 1× and longtask-max at 6×; process memory is not reachable without COOP/COEP. Its ack window of 2 is ruled out as PO-R380-W1: wall-ms is already not worse than HEAD.
- **Runs on the sketch** (L58):
  - **Unit:** 475/495; the 20 failures are exactly the old-API rows that A migrates.
  - **Perf v1 and v2:** 3 runs each. Peak-backing 0.1 / 0.2 MiB. longtask-max 0 at 1× and 6×. Bytes equal to HEAD.
  - **Perf mutants:** GCD gives 37.2 / 74.4 MiB and FALLBACK gives 1454 / 2668 ms at 6×. Both are red on the rows to be asserted.
  - **Browser** (dev servers, both viewports): E1–E4 sha equal HEAD. Sketch attempt 1 was environment-invalid (a cold re-optimise reload).
- **After the advisor's final check:**
  - **Biome:** the fakes helper was reformatted, so Biome is clean on all 15 patched `app/**` files. `sketch-fakes.patch.txt` was regenerated.
  - **Budgets:** the change now ships as a third patch, `sketch-budgets.patch.txt`, so A makes no hand edit.
  - **Assert run:** the resources spec ran with the four rows really asserting (`perf-res-sketch-v2-assert.log`): all PASS (0.1 / 0.2 MiB; 0 / 0 ms at 6×).
  - **Perf `lib` tests:** 40/40 with the flipped budgets (`sketch-perf-lib.log`).
  - **Perf mutants re-run on v2 with the flipped budgets** (`mutants/sketch-perf-v2/perf-summary.txt`): GCD gives 37.2 / 74.4 MiB and FALLBACK gives 1419 / 2513 ms; both make the spec fail.
  - **Apply check:** the three patches applied to a fresh HEAD copy (`scratch/apply-check/`, git-ignored) give 14/14 stable sha and the unit set 475/495, with the same 20 old-API rows failing.
  - **Task rulings added:** every migrated test file keeps at least one row; a throwing `onProgress` no longer fails the fallback path (a ruling, covered by SW2e).
- **Gap stated honestly:** the E4 recipe (Master +6 dB) does not clip on either tree, so the browser does not exercise the overload text. Unit rows and mutants cover it.
- **Claims:** `claims-380.sh`, with outputs for HEAD and the sketch and the allowed delta. K16: all 29 artifacts exist.

## 5. Question for Saba (L44)
**SABA-Q-PERF12B-TOLERANCE** is in `user-review/questions-perf12b.md` (Georgian), as `awaiting_user` in `open_findings`.
- The plan says "bit-exact" for chunked export. Tech-lead rules that windowed renders cannot be bit-exact.
- The recommended answer: ≤ 1 LSB at 24-bit near the window edges, with identical peak and clipped counts.
- It blocks nothing now. 12b is built and measured, and its tolerance asserts and publication follow the answer.

## 6. Status and completion
- **Decision: CONTINUE.**
- **Why not COMPLETE:**
  - STUDIO-PERFORMANCE (PERF-12a/b, 11c-iii-d/e, 13–15) is unfinished.
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries remain.
  - `deferred_low_polish` is not fixed.
- **Not BLOCKED:** the open Mediums are manual, root or awaiting_user items under the 2026-10-23 clarification, and none blocks the loop. No external input is needed for round 380.
- **Purchase protection is unchanged:** round 380 touches no protected file (`b-round-318/protected-sha256.txt` rc 0). G380-AUTH re-checks the signed-out guard.
- **Reusable workspace opens anonymously:** `/studio-lab` loaded in B's probes at both viewports with no auth.
- **lessons.md:** unchanged at 60 lines; no Saba-reported issue this round.
- **Architecture checkpoint:** no new request. The existing ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING is still unanswered, at its eighth echo; RETRO 384 is its deadline (L46).
- **New signal:** `SIG-R380-WORKER-DOUBLE-BUFFER`. It is a 12b candidate, not scheduled.

## 7. Advisor and agents
- The advisor was consulted before the approach and again before handover.
- Project agents consulted (read-only): `tech-lead` and `performance-optimizer`.
- Not consulted: `product-designer` and `ableton-arrangement-expert`. This round has no visible change.
