# A — Round 351 report

**STOP — needs B ruling on A-REVIEW / A-R351-REVIEW-RELEASE-ASSERT (§4: "A review finding asks to change DP72").**

- Measurement: the code-reviewer (F1, Medium; `a-round-351/review.md`) shows that DP72's release/Undo half is unguarded. After `pointerUpAt` the test goes straight to Undo and asserts the pre-drag media time (2 s). A commit that seeks back to the old clip position would leave the last `currentTime` write at 2 s, so Undo changes nothing and the assert still passes. An Undo that writes nothing is hidden the same way.
- This is a real gap in B's spec, not a disagreement with it: §0.2 step 5 reads "Release, then Undo" and asks for no post-release assert. Origin: **B spec** (B's sketch; L58's "B runs the code-reviewer on the sketch before dispatch" would have caught it).
- Proposed delta (not applied): right after `pointerUpAt`, `await waitFor(() => expect(seeks.at(-1)).toBeCloseTo(previewTarget, 3));` (optionally pin `seeks.length`; the dedupe key is unchanged after release, so no new write is expected). It would change K5 from `54+0-` and needs B's sketch re-run (L58) plus a mutant for the release half.
- It does not invalidate the mutant results: M-B5 is still red on DP72 (the preview half).
- I changed nothing in response to the review. The tree is at the last consistent state: the B patch applied unchanged, the doc edited per §1.2, the dock untouched.

## Changed files (store)
| File | Change |
|---|---|
| `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply b-round-350/sketch-dp72.patch.txt`, unchanged. Hunks equal the patch (54+, 0−) vs `b-round-350/drag-preview-render.test.r350.tsx` |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.2 only: l.4 `C round 350 pending` → `C round 351 pending`; M-B2 clause replaced; DP72 bullet appended; changed-files line `(DP66–DP71; DP72 — round 351)`. `## ` count 7 |
| `app/components/arrangement/ArrangementVideoDock.tsx` | **not touched** by A this round; sha256 `037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96` |

No protected file, config, dependency, `perf/` or `e2e` change. 0 untracked files.

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-equal to `b-round-350/claims-351-planning-output.txt` | `a-round-351/claims-pre.txt` |
| A-CLAIMS final | PASS: K1, K3, K7, K9 equal planning; K2 `7f56989 3`; K4/K5 equal the sketch output; K6 `h2 7 pending-350 0 pending-351 1 awaiting-ruling 0 ruling-d1119 1 dp72 2 m-b5 1`; K8 `0 untracked 0`; K10 all 1; K11 equals planning | `a-round-351/claims-final.txt` |
| A-TYPE | PASS, rc 0 | `a-round-351/typecheck.log` |
| A-LINT | PASS, rc 0; 205 warnings (≤ 205), 1 info | `a-round-351/lint.log` |
| Biome (owned test file) | rc 0, no fixes | `a-round-351/biome-owned.log` |
| A-UNIT | PASS, 74/74 (15.2 s file; DP72 276 ms in the control run, timeout 5 s) | `a-round-351/unit.log` |
| A-MUTANT (scratch `/home/runner/a351-scratch`, deleted after) | PASS, red sets exactly §0.1: control 7/7 green; M-B2 → DP66, DP67; M-B2′ → DP66, DP67, DP71; A-M5 → DP71 (at `takeRecords()).toHaveLength(0)`); M-B5 → DP72 | `a-round-351/mutant-{control,M-B2,M-B2prime,A-M5,M-B5}.log`, applied diffs `mutant-*.applied.diff.txt` |
| A-REVIEW | **STOP**: 1 Medium (F1) asks to change DP72 | `a-round-351/review.md` |

## For B (not applied; DP72 unchanged)
- A-R351-REVIEW-RELEASE-ASSERT (Medium): the ruling above.
- A-R351-REVIEW-GLOBAL-SPY (Low, F2): the spy records every media element; not flaky today. Candidate for the same ruling or `deferred_low_polish`.
- A-R351-REVIEW-TRY-SPAN (Low, F3): `try/finally` covers only the `waitFor`.
- F7 nit: no blank line between DP71's `});` and DP72 (Biome accepts it).
- Observation: §1.2 grants l.4 = `C round 351 pending`, while L28 says A writes the final post-PASS string. I followed the task text. B should state which one wins when it re-dispatches.
- Architecture note: none from the reviewer.

## Known gaps
- C-R350-01 and A-R350-REVIEW-SEEK-TEST are **not** closed: both depend on C PASS, and DP72's release half is now disputed.
- No browser run by A: the task gives the browser rows to C.

## Next C checks (L22: a STOP on a ruled clause, with a diff)
Run only SOURCE-SCOPE (3 files, dock sha256 as above, test hunks = patch), CLAIMS (`bash b-round-350/claims-351.sh` = `a-round-351/claims-final.txt`), G351-AUTH, and the STOP's named check (read DP72's release/Undo lines against F1). Then write a short FAIL "STOPPED — routed to B". Do not re-run the full mutant or browser set.

## Scope completed
Both §1.1 edits are done as specified. All A rows pass except A-REVIEW, which is a STOP. The round is **not** complete; it needs B's ruling.
