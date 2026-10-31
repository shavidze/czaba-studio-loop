# B round 282 → 283 planning (2026-10-31)

**Advisor:** available and consulted twice: before the task was written, and before finishing. The second check fixed the claims script for archive scratches and moved LIBRARY-STATES to C's production build. The first check's points were applied: Its points were applied:
- the narrowed baseline and freeze (A's tree preserved, the sketch is not re-applied);
- a byte-identical test sketch;
- the DW10 timing facts;
- doc 211 l.4 = round 283;
- an explicit browser contract with carried evidence;
- the bookkeeping order and an L23 amendment.

**Consults:** none. This is a test- and docs-only fix-up of a design whose `tech-lead` and `performance-optimizer` consults were done at the round-282 planning. No new behaviour or user-visible change is planned. The 2026-10-27/28 policy exempts test-only rounds from reference-first, `product-designer`, AGREE and the screen budget.

**Gate 282:** `skipped` ("C taskStatus FAIL"). The baseline stays HEAD `000da42` plus A's preserved round-282 tree (4 M + 3 ??). The last publication is still `000da42`.

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `a-round-282.md` | **STOP**: DW3/DW9 cannot pass against the byte-frozen sketch. The six code files are byte-identical to the sketch. Perf 3/3, EQUIV 0, MU-SYNC-FALLBACK 372, MU-U1…U3 red. Doc 211 and the doc sections were not written. Reviewer 7/10: DW11 gap, 4 Lows, an Architecture note |
| `c-round-282.json` | **FAIL**, `browserVerified: true`, `realVerified: true`. 15 rows PASS (SOURCE-SCOPE, HUNK-SCOPE, CLAIMS, SWEEP, TYPECHECK, UNIT-MUTANTS, PERF-RUN, EQUIV, SCRIPT-MAX median 44, SYNC-FALLBACK median 371, WORKER-BROWSER, LIBRARY-STATES, EXPORT-BITEXACT, SSR, G282-AUTH). FAIL: UNIT (DW3, DW9) and DOC-211. Bugs: C-R282-01 M, C-R282-02 M, C-R282-03 L. Gate rows were not claimed |
| `gates/gate-round-282.json` | `skipped` |
| `regression-last.json` | 2026-10-30, round 258. Next due 2026-11-02, so REGRESSION is **not** due today (2026-10-31) |

## 2. Backlog updates (only from evidenced C results)
- PERF-2 is **ბაგია**, not მზადაა. Its runtime rows passed in C's real browser, but the round failed on its test and doc rows. No item was promoted.
- `rounds[282]` → C FAIL. `rounds[283]` was added (dispatched).
- `open_findings`:
  - C-R282-01, C-R282-02 and C-R282-03: fix dispatched in round 283;
  - A-R282-REVIEW-DW11: fix dispatched;
  - B-R282-DW-UNRUN (the planning gap): closed by the L23 amendment;
  - GATE281-S2: re-dispatched (doc 169).
- `deferred_low_polish` (2026-10-23 bug gate; the code bytes stay frozen for the PERF-2 evidence): A-R282-REVIEW-UNTYPED-ENTRIES, A-R282-REVIEW-MSG-TYPE-IGNORED and A-R282-REVIEW-ABORT-AFTER-AWAIT (already ruled in round-282 §2.3; record only).
- `architecture_signals`: A-R282-REVIEW-WORKER-PROTOCOL is recorded and **not scheduled**. It is a natural candidate when PERF-5 moves peaks into the worker and touches the same protocol. No frontend-architect checkpoint is requested now: this is one Low structural note on two new small files, with no repeated risk on one owner.
- Decisions D-29z666…D-29z670. `post_current_stage_queue` STUDIO-PERFORMANCE status updated. The backlog backup before the edit: `b-round-282/backlog-before-283.json`.

## 3. Ruling on A's STOP (D-29z667)
**Option (a).** The client rebuilds the wrapper to narrow the type without `as` (client l.35). The meaningful property is the zero-copy hand-off: the five `Float32Array`s are the very objects received. The new rows pin that with `toBe` per array and the wrapper with `toStrictEqual`. DW3 also checks that every caller gets one shared result. Option (b) would need a type assertion (CLAUDE.md forbids it) and would void the bytes rows, EQUIV and all mutant evidence.

## 4. B's pre-check on a scratch (L23 as amended)
Scratch: `/tmp/b283/tree` = `git archive 000da42` + A's 7 round-282 files + the test sketch, with `node_modules` symlinked. Store untouched.

- **The test sketch:** `b-round-282/demo-synth-worker.test.sketch.ts`, sha256 `test-sketch-sha256.txt`, diff `test-sketch.diff` (115 lines). Applying the diff to A's file with `patch -p1` was verified to give the sketch sha256.
- `npm run typecheck` rc 0; Biome on the test file 0 fixes. The 5 covering files: **5 files / 101 tests PASS** (`covering-5files.txt`).
- **Mutants** (`mutants.txt`, script `mu.sh`):

  | Mutant | Red rows |
  |---|---|
  | MU-U1 | DW2, DW3, DW9 |
  | MU-U2 | DW4 |
  | MU-U3 | DW10 |
  | MU-U4 | DW10 |
  | MU-U5 | DW11 |
  | MU-U4 **control** on A's round-282 test | DW3 and DW9 only, so DW10 stays green: the vacuity of C-R282-03 is independently reproduced |

- **The timing finding:**
  - a first DW10 draft with `expect(a).not.toBe(b)` on the 768 000-float arrays took **16.6 s**, timing out at the 5 s default;
  - the `=== … toBe(false)` form takes **0.89 s**;
  - this is written into the task as a do-not-revert fact and a STOP threshold (2.5 s).
- **Claims:** `b-round-282/claims-283.sh` (absolute paths). On the live tree before A's edits its output is `claims-283-output.txt`. On a `git archive` scratch it is `claims-283-output-archive.txt`, which differs only in K1 and K15 (`(archive)`).

## 5. The browser contract (D-29z669)
The six code files keep their bytes (`code-six-sha256.txt`). C's round-282 runtime rows were real-browser rows on these exact bytes, so they are **carried**, listed under `"carried"` and never under `"passed"`. C re-runs LIBRARY-STATES (on its own production build of A's tree, because the oracle `library-head.json` was measured on production) and G283-AUTH (on `:5173`) in real Chromium at both viewports, so the round has its own current browser evidence and purchase protection is re-checked for publication. A 13-minute perf re-run on identical bytes adds no information (L38 cost).

## 6. Next task
**Round 283: the PERF-2 fix-up** (test file = sketch, doc 211, doc 163/169 sections). Three tightly related findings in one file, plus the reviewer's DW11 gap in the same file. This is within the "≤ 3 related bugs" round size: C-R282-01/03 and DW11 are test rows of one file, and C-R282-02 is the docs of the same feature.

## 7. Decision
**CONTINUE.**
- **Not COMPLETE:** PERF-2 is not done. STUDIO-PERFORMANCE PERF-3…15, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, the deferred Lows and the Saba-owned items all remain.
- **Not BLOCKED:** nothing external is missing.
