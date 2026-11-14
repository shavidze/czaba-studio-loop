# B round 516 → 517 planning (2026-11-14)

- **Inputs read:** `context/active-summary.md`, `tasks/round-516.md` (archived byte copy of the round-516 task; `cmp` equal), `a-round-516.md`, `c-round-516.md`, `c-round-516.json`, `gates/gate-round-516.json` (status **skipped**, "C taskStatus FAIL"; no publication, so the baseline stays `63c8894`), `regression-last.json` (2026-11-13), and backlog ids by lookup.
- **Advisor:** available. Consulted twice. The first call came after orientation, before writing. The second came before hand-off; its fixes are applied: time excess on pinned code is recorded rather than a STOP, logs use absolute paths, drift precedence is stated, the allowed-delta file is saved, the exact "CONTINUE" name is asserted, K9 is sorted, and B-R505 is dropped from `remaining`.
- **Other inputs checked:** `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 (commit `375ee3b`, round 3) and were handled long ago, so no new findings come from them. The `user-review/` files are not newer in content: their mtimes come from the job checkout (14:46–14:47), and no new decisions file was found. Its points were applied: completion round, an L31-based bound, drop the re-apply and check 3, l.4 = round 517, code-reviewer names the untracked test, absolute l57 path, the C6 lint source, the C4 browser half with a `page.route` stub, and mutants carried only under check 4.
- **Consults:** none. The round adds no new user-visible scope, and the round-515 product-designer and tech-lead rulings stand.

## Acceptance of round 516 (D-29z1876)
- C: **taskStatus FAIL** (incomplete round).
  - `browserVerified`/`realVerified` are true for C1/C2/C3/C7 on A's unpublished tree.
  - C0, C5 and C6 hold.
  - C8 FAIL: doc 334 and the ledger are absent.
  - C9 is unverified: the l57 path was missing from the task.
- Nothing moves to **მზადაა**. N4 stays in progress.
- **BC1b timing:** BC1b is the next slowest test, at 1.7–1.9 s against its 2.5 s bound. Task 517 rules that a time excess on byte-pinned code is recorded, not a STOP; a failing test is still a STOP.
- **New findings:**
  - C-R516-01 (Medium, origin B spec): the incomplete round. Scheduled now.
  - C-R516-02 (Low, origin B spec): a wrong time clause and a wrong K13 figure. Ruled now; it closes when C5/C9 apply the ruling.
- C's own JSON is L57-incomplete (`tools/l57-check.py c-round-516.json` → INCOMPLETE). Task 517 asks C to write all 12 fields.

## STOP ruling (D-29z1877, L10)
- **The covering-time bound is now L31: 50 % of each test's declared timeout.**
  - UT2 has a describe-level `{ timeout: 30_000 }` (l.94; present since `edeba5a`, round 475), so its bound is 15,000 ms.
  - Every other covering test is bounded at 2,500 ms. `vitest.config.ts` sets no `testTimeout`.
- **Measured UT2:** A 2.9–3.0 s, C 2.9 s, B 2.3 s. That is about 10 % of the timeout.
- **The task-516 K13 figure "1,532 ms" was B's error.** The regenerated slowest three are UT2 2,299 ms, BC1b 1,736 ms and B2B2-1 358 ms (claims K9).
- **B-R505-UT2-TIMEOUT-HEADROOM is closed.** Its premise ("under the 5 s vitest default") was wrong. C-R516-02 confirms the 30 s timeout.
- **A's observation** that `.claude/primitives/DESIGN_TOKENS.md` still says teal at HEAD is added as `confirmedBy` on ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD (root-owned). Task 517 pre-rules brass `#C9A46A` as the truth for doc 334.

## Next task (D-29z1878): round 517 = N4 completion
- **No code edits.** The tree stays at the post-sketch pin, and the task drops frozen check 3. A writes:
  - doc 334, with l.4 `Completed (C round 517 PASS)`;
  - the ledger `a-round-517/doc-ledger.md`;
  - the code-reviewer run on `git diff 63c8894`, the untracked n4 test and doc 334.
- **C reruns:**
  - the n4 probe (C1/C2), the journey (C3) and Studio/protection (C7);
  - the **new browser copy half** (C4): offers text, then the popup offer, email and success steps, with `/api/subscribe` stubbed (L36);
  - covering under the L31 bound (C5). Mutants are carried from `c-round-516` only while check 4 is rc 0;
  - grep/scanner (C6), with lint taken from A's log and rerun by the gate;
  - doc 334 (C8);
  - claims plus `tools/l57-check.py` (C9).
- **Evidence:**
  - `b-round-516/claims-517.sh`, `claims-517-planning-output.txt` (K1–K20; all as expected at planning, K20 L58 rc 0) and `claims-517-allowed-delta.txt`;
  - backlog script `b-round-516/update-backlog-517.py`: v523 → v524, with the backup `backlog-before-517.json`;
  - board backup `b-round-516/feature-status-before-517.md`.

## Gates and queue
- **REGRESSION:** not due. The last one ran 2026-11-13, so the next is on or after 2026-11-16. RETRO is at 525.
- **Bug gate:** no cloud-reproducible Critical/High/Medium blocks this round.
  - C-R516-01 is this round's own task.
  - The open High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED needs root and the backend.
  - The other open Mediums are manual, root-only or awaiting Saba.
- **Architecture checkpoint:** not requested. This is a completion round with no new structural risk. SIG-R513/SIG-R507 stay as signals.
- **Ready for commit:** not yet. Root publishes only after C PASS on round 517 and the gate (verify + review).
- **Scope is unchanged.** NONBRAND N5–N9, the rest of DPG-FIX and the DP gate (both 10/10), STORE-2c..5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE remainder, STEM-LANES, T12-ADVANCED, phase-2 entries (PHASE2-VIDEO-SCORING still waits for the user go-ahead), the deferred Lows and the manual device/Safari checks all remain.
