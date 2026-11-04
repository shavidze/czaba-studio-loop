# A round 330: PERF-DRAG-PREVIEW stage c1 fix-up (C-R329-01 memo leaf, C-R329-02 loop extent)

No STOP. HEAD is `dae81bf`. No commit or push. A ran no browser or perf row; C runs those (§2.1).

## Changed files (4, the same set as round 329; nothing untracked)
- `app/components/arrangement/ArrangementTransport.tsx`: B's sketch hunk, verbatim. It adds `memo` to the `react` import, the `ArrangementProjectEndTextInner` leaf and `const ArrangementProjectEndText = memo(ArrangementProjectEndTextInner);`.
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: B's sketch hunk plus one A strengthening of DP21. No `expect(` was removed.
  - DP21 now captures `endAtRest` and `extentAtRest` at mount.
  - After release it calls `undo()` and expects the end text and `data-extent` to return to those values, with the end text no longer containing `00:12.750`.
  - That is 3 more `expect(` lines.
  - **Grant note:** DP21's Undo lines are a strengthening by A that goes beyond the §3 DP21 item, which grants only the key rename. A read it under §2.2's generic "unless A strengthened a test". B may rule it out: reverting it drops 7 lines and has no other effect.
- `app/components/arrangement/StudioWorkspace.tsx`: not touched in this round; it keeps the round-329 content.
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.3):
  - l.4 is byte-exact.
  - c1 item 23 covers the memo leaf. It notes that it supersedes item 22's round-329 sentence "memo არ დაემატა". The old "უცვლელი" item becomes 24.
  - A Problem → Solution entry for C-R329-01. It also names DP24 / C-R329-02.
  - A note on the DP21 key rename.
  - A round-330 testing line: DP23, DP24, the DP21 strengthening, and B's sketch perf numbers cited to `b-round-329/perf-rowcmp-vs-c328.txt`. C measures the real numbers.
  - A TODO line for A-R329-REVIEW-VIEWPORT-BOUND (D-29z957).
  - The 7 headings are unchanged and in order.

## A rows (actually run)
| Row | Result |
|---|---|
| A-CLAIMS | PASS. `a-round-330/claims-before.txt` equals `claims-330-planning-output.txt` exactly |
| A-IMPL | PASS. `git apply` rc 0; §1.3 done by hand |
| A-CLAIMS-AFTER | PASS. `a-round-330/claims-after.txt` differs from the sketch output only at K2 `dae81bf 4`, K7 (new l.4), K8 `11` and K6 `176 26 2 0 4 2`. K6 is 3 above the sketch's 173 because of the DP21 strengthening. K10 = 16, K11 = `4 1` |
| A-SCOPE | PASS. Exactly the 4 modified files, nothing untracked. `git apply -R --check` of the full sketch patch still passes |
| A-TYPE / A-LINT | PASS. `npm run typecheck` rc 0. `npm run lint` rc 0: its warnings are pre-existing and K10 stays 16. `npx biome check` is clean on the 3 code files (`a-round-330/biome-owned.log`) |
| A-UNIT | PASS. 10 files, **119/119** (`a-round-330/unit.log`, `unit.json`). L31: no test is above 50 % of its timeout. Every test over 2.5 s runs under a raised timeout:<ul><li>CP12a–d: 4.1–9.3 s of 30 s (describe `{ timeout: 30_000 }`)</li><li>TC10: 4.3 s of 15 s (describe `timeout: 15_000`)</li><li>render-budget "does not re-render clips…": 3.1 s of 15 s (its own `{ timeout: 15_000 }`)</li></ul>No test in a file with the default timeout is over 2.5 s |
| A-MUTANT | PASS. Run on the scratch `/home/runner/a330-scratch` (never in `store/`) with the final test file (`a-round-330/mutants-a-final.txt`; the first run is `mutants-a.txt`). Each mutant is red on exactly B's rows:<ul><li>RAW-END: DP21, DP22</li><li>COMMITTED-END: DP22</li><li>OVERVIEW-COMMITTED-END: DP21, DP22, DP24</li><li>CLEAR-ANY-PREVIEW: DP20</li><li>TRANSPORT-SUBSCRIBES: DP2, DP9a, DP21</li><li>ENDTEXT-NO-MEMO: DP23</li><li>OVERVIEW-NO-LOOP: DP24</li></ul>After restore: 26/26 |
| A's own mutant | MU-A-MEMO-ALWAYS-EQUAL (`memo(Inner, () => true)`) is red on DP21 (`a-round-330/mutant-a-memo-always-equal.txt`). **Caveat:** it fails at the existing post-release line (`00:12.000` instead of `00:12.750`), before the new Undo lines run. So the Undo assertions are added coverage with no isolated red proof |
| A-REVIEW | The real `code-reviewer` subagent reviewed the 4 files. Score 9/10, no Critical, High or Medium findings |

## Reviewer findings and how they were handled
1. **Low.** DP24's `> 20` step would also pass if the loop were ignored. The loop proof is l.917 (`20.000` while the end is 12.750). The row follows B's §1.2 text, so A left it as is. Proposal for B: pin the exact far-move extent if that step should prove more.
2. **Low.** There was no jsdom Undo row on the memoised leaf. Fixed by the DP21 strengthening, with the caveat above.
3. **Low.** The viewport-bound branch has no jsdom row. It was already deferred (A-R329-REVIEW-VIEWPORT-BOUND, D-29z957) and is now in the doc TODO.
- **Architecture note for B (a signal only):** keep. The `StudioWorkspace` subscription replaces the raw-end one and adds no state or lifecycle. An extent store and a lane memo stay with stages c2–c5.

## Known gaps
- A ran no browser or perf rows (by contract). END-LIVE, VIEWPORT-BOUND, DRAG-NAMES, D-ROWS, PERF and G330-AUTH are all open for C.
- A did not run the full vitest, build or verify (speed rules). The root gate runs them.

## Exact next C checks
1. `bash b-round-329/claims-330.sh`. Expect it to equal `a-round-330/claims-after.txt`, with K6 = `176 …`.
2. SOURCE-SCOPE:
   - `git apply -R --check` of the sketch patch passes (A checked this).
   - The test diff differs from the sketch only in DP21's added `api`, `endAtRest`/`extentAtRest` and 3 Undo expects.
   - The StudioWorkspace check against the b-round-328 patch passes.
3. The rest of §2.2:
   - UNIT ×3;
   - MUTANT, plus C's own;
   - END-LIVE, VIEWPORT-BOUND, D-ROWS and G330-AUTH at both viewports;
   - DRAG-NAMES on a warm server;
   - PERF (production build, run alone, after a warm-up; the 8 move rows are record only);
   - DOCS.

## Scope completed
All of A's §2.1 rows ran and passed. B's acceptance is not met until C's browser and perf rows pass. Stage c1 and PERF-DRAG-PREVIEW are not marked done.
