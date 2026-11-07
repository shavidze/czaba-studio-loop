# B round 377 → 378 planning (2026-11-07)

**Decision: CONTINUE.** Round 378 = PERF-11c-iii-c2a, the loop brace leaf (`current-task.md`). D-29z1254…D-29z1257, backlog v343.

## 1. Round 377 result (D-29z1254)
- **C round 377 PASS** (`c-round-377.json`): 16 rows passed, among them RB-LEAF4b in the browser (Master Mute clicked twice). `browserVerified` and `realVerified` are true, and C found 0 bugs. B ran the L57 checker on C's JSON: OK (`b-round-377/l57-check-c377.txt`).
- **Gate 377 published `79ed8a9`** on both remotes. `verify.log` shows 252 files and 3,723 tests. This commit is the round-378 baseline, and the store tree is clean. The context snapshot `head-sha.txt` (`6b11be7`) and the gate's `head` field were taken before the gate, so they are stale.
- **Done:** PERF-11c-iii-c1 (rounds 376–377). **Closed:** A-R376-REVIEW-M1-EDIT-IDENTITY-ROW.
- **Archive:** `tasks/round-377.md` is a byte copy of the dispatched task (sha256 `6895798c…`). Nothing was deleted.

## 2. Gate review and C notes (D-29z1255)
- **Gate 377 review:** COMMIT OK, Lows only.
  - Finding 1: GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO, a deferred Low. The in-repo text-scan test the reviewer proposed is the fix. Until it lands, every PERF task that touches these files repeats the K5/K6 tripwire claim. Round 378 does this as K6.
  - Finding 2 is the same item as A-R376-REVIEW-L1-RAF-UNARMED, which is already deferred. It is not filed twice (L7).
- **Architecture note:**
  - Signal 3 becomes SIG-R377-RENDER-COUNT-CONSTANTS: one shared test helper for the render-count names.
  - Signal 4 (the hand-off hook) is keep.
  - SIG-R377 is the **fifth echo** of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. It is not scheduled.
- **C notes, recorded as info:**
  - INFO-C377-FIT-RING-WORDING: rings are checked on the keyboard path only. The round-378 task says so.
  - INFO-C377-RUNALL-RESTORE-PATH: the old runner's restore-check path. The round-378 runner checks both files with `cmp`.
  - INFO-C377-RANGE-DRAG-ON-BODY: range drags start on the lane background.
- **L28:** docs 232 and 238 still read `In Progress (stage`. Both belong to open backlog stages: PERF-DRAG-PREVIEW and the PERF-11c group header.
- **Open Critical/High: none.** The open Mediums are manual, root or awaiting_user: A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE and GATE304-M1. None of them blocks round 378.

## 3. Round 378 = PERF-11c-iii-c2a (D-29z1256)
- **REGRESSION is not due.** `regression-last.json` is 2026-11-05 and the planning date is 2026-11-07, which is 2 days. The rule needs 3, so REGRESSION is due at the first planning on or after 2026-11-08. Round 377 predicted "likely round 378"; the date arithmetic settles it the other way.
- **Split of c2, with the scope unchanged:**
  - c2a is LoopBrace: 277 lines, 5 callbacks plus `arrangement.loop`.
  - c2b is MarkerRow: a 946-line forwardRef with an imperative handle and editor focus hand-offs, so it needs its own L47/L50 rows. It follows REGRESSION.
- **Premise.** C's round-377 leaf probe (HEAD tree) and B's re-run: the brace renders on every workspace commit.
- **Sketch** `b-round-377/sketch.patch.txt`, sha `28d86d7b…`, 3 files, pattern A:
  - `ArrangementLoopBraceView = memo(Inner)` with `loop` + layout props + `actions`;
  - `useArrangementLoopBraceActions`;
  - the wrapper kept;
  - row RB-LEAF5.
- **Pre-check on the sketch:**
  - tsc rc 0 and Biome rc 0. The full suite passes: 252 files, 3,724 tests (`precheck-full.log`).
  - **Mutants:** MU-LB-NO-MEMO, MU-LB-ACTIONS-FRESH and MU-LB-SITE-REVERT (HEAD workspace) are each red only on RB-LEAF5 (`mutants/sketch-run/`).
  - **Production perf (interactions, alone):** 1 passed, 0 FAIL, and 0 count-row differences from HEAD (`perf-sketch-vs-head.txt`). The harness scenarios contain no mute, undo or preview step. The gain shows in jsdom and in the leaf probe.
  - **Leaf probe (dev, both viewports):** only the 14 brace cells differ per viewport. The wrapper reads 0. The view reads 0 on lane mute, Ctrl+Z and preview start/stop; it renders on add, zoom and the Undo/Redo buttons, because the project end changes there. Every other leaf equals HEAD (`probe/leaf-sketch-vs-head-378.txt`).
  - **Loop browser recipe** (create, mute, undo, mid-drag, drag, Ctrl+Z, arrows, toggle): the sketch equals HEAD at both viewports (`probe/loop-*-378.json`).
  - **Timeout headroom (L31):** render-budget's slowest rows under full load are 2.9 s of a 15 s option and 1.9 s of the 5 s default. RB-LEAF5 takes about 80 ms.
- **Review:** `tech-lead` reviewed the frozen sketch with sha = dispatched and gave **APPROVE** with 3 Lows, each ruled in `sketch-review.md`. No Medium.
- **Claims:** `b-round-377/claims-378.sh`, K1–K23, 0 MISSING. The HEAD output, the sketch output and their diff (`claims-378-allowed-delta.txt`) are saved.
- The scratch tree was removed after its outputs were saved. The patch reproduces it.

## 4. Order, checkpoint, RETRO (D-29z1257)
- Order: REGRESSION at the first planning on or after 2026-11-08, then c2b, then d/e (these wait for the checkpoint or RETRO 384), then PERF-11b, PERF-12…15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and the phase-2 entries under the skip rule.
- **Bounded request to root, restated:** run the read-only `frontend-architect` checkpoint ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`) before PERF-11c-iii-d.
  - The questions are pattern A vs pattern B, the wrapper policy (GATE375-L1), the comparator home (SIG-R375) and the shared render-count helper (SIG-R377).
  - c2a and c2b do not wait for it.
- RETRO is due at about round 384.
- `lessons.md` is unchanged at 60 lines. No Saba-reported issue arose this round.

## 5. Ready for the gate after C PASS
Round 378's 3 code/test files and doc 244 (`b-round-377/grants-378.txt`). Nothing else in the store tree changes.

## Consults
- **Advisor:** available, consulted after orientation (it led to the c2 split, the loop-identity check and the use of C's HEAD probe as the premise) and before declaring done.
- **Project agents:** `tech-lead` (sketch review, APPROVE). `product-designer`, `performance-optimizer` and `ableton-arrangement-expert` were not needed. This is an invisible performance refactor, and the perf harness and leaf probe measured it directly.
