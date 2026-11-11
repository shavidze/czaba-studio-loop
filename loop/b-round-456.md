# B round 456 → 457 planning

**Date:** 2026-11-11.

**Advisor:** available, consulted twice. The first consult, after orientation and before writing, set the approach, and I followed its advice:
- re-dispatch 2b-3c-2a with an L10 ruling (no regression round: today is 11-11 and the next one is due 11-13);
- keep the baseline `db95f40`, because gate 456 is `skipped`;
- rule on the whole class of the bug, not only on ScrollReveal;
- make the fix a union, so it cannot fail open;
- re-pin every number;
- add mutants;
- have `tech-lead` review the exact sha;
- close nothing in the backlog.

The second consult came before hand-off. It found two gaps, and I fixed both:
- C2's clean-clone row would have mismatched on K8. B now saved `claims-457-head-output.txt` from a real clean clone.
- The L58 checker had not been run. It now passes (`b-round-456/l58-check.txt`), and the review names the full sha.

I also made these changes from that consult:
- added K13 (the pinned precheck numbers) and K14 (cited paths exist: 0 missing);
- rebuilt the `b-next.json` `remaining` list from the previous one, so nothing was dropped;
- recorded SIG-R457-LT9-COVERING: later store rounds include `store-live-teal.test.ts` in their covering set.

**Consults:** `tech-lead` reviewed the delta three times (`b-round-456/sketch-review.md`):
- v1: APPROVE-WITH-CHANGES, 8 findings;
- v2: APPROVE-WITH-CHANGES, N1/N2 Medium and N3 Low;
- v3: **APPROVE** on the dispatched sha `2b97313c…`.

`product-designer` was not consulted: this is a test-only round with no user-visible change.

## Inputs read
- `current-task.md`, archived to `tasks/round-456.md` (`cmp` OK).
- `a-round-456.md` (STOP on A-R456-REVIEW-M1), `c-round-456.md`, `c-round-456.json` (FAIL, `browserVerified`/`realVerified` true), `gates/gate-round-456.json` (`skipped`: C taskStatus FAIL), `env-status.json` (store 200).
- `context/active-summary.md`; `backlog.json` (ids only); `lessons.md` (the B part, plus L10, L11, L22, L28, L57, L58, L60).
- `b-round-455.md` and its artifacts. No root answer to ARCH-CHECKPOINT-STYLE-SCAN has arrived, and there is no new Saba or root decision file.
- Backups: `b-round-456/{backlog,feature-status,b-next,lessons}-before-457.*`. The store's status and shas at the start are in `store-status-start.txt` and `tree-start-sha256.txt`.

## Round 456 result (independent evidence only) — D-29z1620
- C round 456 FAILed on the short route (L22): A had stopped on an unruled Medium.
  - C confirmed A-R456-REVIEW-M1 independently.
  - C1–C4, C6 (counts), C7 (Studio + purchase protection in a real browser at 1440 and 1280), C8 and C9 passed. C5 (mutants) and the C6 assert map were not run.
- Gate 456 was skipped, so **nothing was published and no item becomes done.**
- A-R454-REVIEW-M-DEAD-UNCHECKED and the Lows owned by 2a stay in progress, carried to round 457.
- A-R456-REVIEW-L1 and L2 move to `deferred_low_polish`. INFO-A-R456-PREFLIGHT-LATE is logged.
- The reviewer's suggestion to move the walker into `import-graph.ts` is recorded as a signal on ARCH-CHECKPOINT-STYLE-SCAN, not as a task.

## Ruling on A-R456-REVIEW-M1 — D-29z1621
- **Accepted as a Medium, origin B spec.** B swept every local specifier literal in `app/` against the matcher (`b-round-456/probe/sweep-sketch456.txt`).
  - It found the commented barrel (ScrollReveal) and five `new URL(…, import.meta.url)` worker edges.
  - The tech-lead added `export * as N`, side-effect imports, `?query`/`#` and trailing-slash forms.
- **The fix lives in the walker** (`mountGraphImports`), as a plain union:
  - the matcher on the raw source;
  - the matcher on the comment-stripped source;
  - `export * as N` aliases;
  - side-effect imports;
  - `import.meta.url` edges.
  - `resolveSpecifier` strips the query, the hash and trailing slashes.
  - GT5b uses the same edges. This adds a 6th grant, `store-gradient-text.test.ts`.
- **New LT9:** every local specifier must be followed by the walker and resolve to a file, with a reasoned allow-list that is empty today.
- **Measured** (`probe/flips-288-to-v2.txt`): reached goes from 288 to 294 files, a strict superset (lost 0). LT7's verdicts at HEAD do not change.
- **Pinned on the sketch** (`/tmp/b457-scratch` = `db95f40` + sketch-456 + delta):
  - covering: 4 files / 27 tests;
  - full suite: 284 / 4151, rc 0;
  - `tsc`: rc 0;
  - lint: 205 warnings, the same as HEAD;
  - scoped Biome: clean;
  - mutants: 34 lines (BASE and C1 green, M1–M32 red);
  - `expect(` count in live-teal: 62;
  - `git apply --check` of the delta on the current store tree: rc 0;
  - claims K1–K12, with the planning, sketch and expected-after outputs and empty stderr.

## Round 457 = STORE-2b-3c-2a re-dispatch (test-only)
The task is `current-task.md`:
- A applies `b-round-456/sketch-457-delta.patch.txt` on top of the round-456 tree and rewrites doc 299 (l.4 `… C round 457 PASS`, the walker sentence, an M1 entry).
- C runs C1–C10, with the mutants first, plus the new C8 walker-class row and the C7 browser row.

**Store tree:** this phase made no change to it. The 5 round-456 paths are untouched; check with `sha256sum -c b-round-456/tree-start-sha256.txt`. The scratch is `/tmp` only.

## Order after this round
Unchanged:
1. REGRESSION-2026-11-13, if round 458 is planned on or after 11-13; otherwise SABA-B-13 (entrance).
2. 2b-3c-2b.
3. 2b-3d.
4. 2b-4.
5. STORE-2c…5.
6. DP-GATE (root).
7. ARCH-SPLIT.
8. REVIEW-RECOMMENDATIONS.
9. T12-ADVANCED.
10. Phase 2, under the skip rule.

The next RETRO is round 465.

## Architecture checkpoint
ARCH-CHECKPOINT-STYLE-SCAN is still requested from root and is non-blocking. `style-scan.ts` has now been edited in six rounds. The checkpoint now carries the walker signal and asks for a split into `css-rules.ts` and `module-graph.ts` (or `import-graph.ts`). I recommend root answers it before 2b-3c-2b is planned.

## Ready to publish
No. Round 456 was not published. Round 457 needs C PASS, then the gate.

## Decision
**CONTINUE** (`b-next.json`).
