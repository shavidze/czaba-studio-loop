# A round 375: PERF-11c-iii-b (Library and preview leaves)

**STATUS:** implemented and handed to C. No STOP.

## 1. Changed files (exactly the grants, `b-round-374/grants-375.txt`)
`git status --short --untracked-files=all` shows 7 lines:
- M `app/components/arrangement/ArrangementLibrary.tsx`
- M `app/components/arrangement/ArrangementLibraryPreview.tsx`
- M `app/components/arrangement/StudioWorkspace.tsx`
- M `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`
- M `app/lib/arrangement/__tests__/library-preview.test.tsx`
- M `app/lib/arrangement/__tests__/render-budget.test.tsx`
- ?? `docs/implementation/2026/quarter-IV/242-perf-library-leaves.md` (new)

How the 6 code and test files were made:
- `sha256sum b-round-374/sketch.patch.txt` = `b246502f…` = `sketch-dispatched.sha256`.
- `patch -p1 --dry-run`, then `patch -p1`, both rc 0.
- `sha256sum -c b-round-374/sketch-files-sha256.txt` gives 6/6 OK (SKETCH-EQUAL).
- I made no other edit to those files.

## 2. Checks actually run (logs in `a-round-375/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0. 595 files, 205 warnings and 1 info (`lint.log`), the same summary as gate 374's `verify.log` (595 files, 205 warnings, 1 info; `a-round-375/gate374-verify.clean.log`) |
| `npx biome check` on the 6 sketch files | rc 0, "No fixes applied" (`biome.log`) |
| `xargs -a b-round-374/covering-375.txt npx vitest run` | rc 0. **140/140 files, 2198/2198 tests** in 156.9 s (`covering.log`, `covering.clean.log`) |
| L11 timeout headroom | No covering test is above 50 % of its declared timeout, on A's run or on gate 374's `verify.log`. Every individual test at ≥ 2.5 s at gate 374: CP12a–d (30 s), TC10 (15 s), DXM3 2.79 s (20 s, `mixer-onstate-colour-ui.test.tsx` l.344). Slowest: CP12a–d 4.2 s of 30 s (gate 374: 6.5 s); TC10 2.4 s of 15 s (gate 374: 2.9 s); render-budget Play→Stop→Play 1.96 s of 15 s (gate 374: 2.27 s); library-preview whole file 0.84 s |
| Doc 242 | l.4 is byte for byte `**სტატუსი:** Completed (C round 375 PASS)`. The `## ` headings contain the 7 TEMPLATE headings in order. `grep -rn 'C round [0-9]* pending' docs/implementation` returns 0 hits. Every row it names exists (RB-LEAF1, RB-LEAF3, LP-EQ1, LP-EQ2, and the cursor row "advances the library-preview cursor…"); the re-reviewer confirmed this |
| Browser smoke (A's own run, not a C row) | `a-round-375/smoke.mjs` → `smoke.json`, screenshots `smoke-1440.png` and `smoke-1280.png`. Run on the existing server at http://127.0.0.1:5173/studio-lab, at 1440×900 and 1280×720. Results: select Bass and press Enter gives clips 0 → 1. Add title "Add to the active track at the insert marker". On the Video lane: `aria-disabled="true"` and "Add — make an audio track active first". Back on Music: no `aria-disabled` and the first title again. 0 page errors. The first attempt timed out cold (L38) and is not a record; the result above is from the warm rerun |

I did not run the full suite, `npm run verify`, the build, perf, mutants or the leaf probe. Those are C or gate rows.

| Final state after the doc edit | `sha256sum -c sketch-files-sha256.txt`: 6/6 OK; doc l.4 unchanged; `git status --short --untracked-files=all`: 7 lines; `pending` grep: 0 |

## 3. Code review (code-reviewer subagent, 6 files and the doc)
Score 8/10. No Critical or High findings. It verified: no stale prop; every non-`tracks` prop at the StudioWorkspace site is stable; the views read only id, kind and name; the expect/it counts are 160/16, 71/14 and 526/74. Its pass had no shell, so it did not diff against HEAD; it checked stale props by reading the wrappers and views.

The reviewer's findings and what I did:
- **Medium, "the doc cites paths that do not exist":** these are loop artifacts. They exist under `tmp/studio-real-loop/b-round-374/`, outside the repo, and the reviewer could not see them. Doc 241 cites the same kind of paths. **Fixed in the doc:** each path now carries the full `tmp/studio-real-loop/…` path and is labelled as a loop artifact.
- **Reviewer's label, verbatim "Low–Medium", filed by A as Low.** The basis for Low: R-RENAMES names same-file positive controls only for render-budget and library-preview. L23's "renamed key is live (count > 0)" is met by RB-LEAF3, which is in the same covering set and runs with drag-preview-render. **If B or C rate it Medium, it is a finding on B's sketch, not an A deviation: I did not edit the frozen file.** The finding: `drag-preview-render.test.tsx` has no positive control for `ArrangementLibraryViewInner`: its 4 renamed `toBe(0)` rows have no `> 0` row in the same file. RB-LEAF3 proves the name is live. The test file is a frozen sketch file (SKETCH-EQUAL), so I did not add a row. **Doc corrected** to say this. **For B:** A-R375-REVIEW-DPR-NO-POSITIVE-CONTROL (Low).
- **Low, the wrapper-name 0 counts are site-revert guards, not behaviour checks:** reworded in the doc.
- **Low, the doc said "a key on only one side is a change":** this is not exact. A key that exists only in `previous` with the value `undefined` compares equal; React treats it the same way. Reworded in the doc. **For B:** A-R375-REVIEW-PREV-ONLY-UNDEFINED-KEY (Low), only if a strict two-sided check is wanted. That would be a sketch change, so I did not make it.
- **Low, RB-LEAF3 asserts `StudioWorkspace > 0` once for the three steps together:** a zoom that did not commit would go unseen. The file is frozen, so I did not change it. **For B:** A-R375-REVIEW-RBLEAF3-PER-STEP (Low).
- **Architecture note (proposal for B and root, not done this round):** `ArrangementLibrary.tsx` imports `sameLibraryLeafProps` and `LibraryTrackLabel` from its own child, the preview file. The reviewer proposes moving them to `app/lib/arrangement/`, with LP-EQ1/2, under ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. This adds to SIG-R375-LEAF-COMPARATOR-HOME.

## 4. Re-review (L11)
No code changed after the review. Only doc 242's wording changed, and that delta went back to the code-reviewer: **9/10, no Medium or higher findings remain.** It confirmed edits (a)–(d) against the code and the test lines. Two cosmetic Lows were left as they are: one "not in the repository" note covers all the `tmp/` paths, and the text writes `=== 1` where the tests use `toBe(1)`.

## 5. B acceptance that A truly checked
- §1 items 1–4: applied exactly as the sketch (SKETCH-EQUAL 6/6). No assertion was removed: the counts 160/16, 71/14 and 526/74 equal the sketch values in `expect-counts-375.txt`.
- §1 item 5: doc 242 written, with l.4, the headings and the cited rows checked as above.
- §2: typecheck, lint, Biome on the 6 files and the 140 covering files are green. The code-reviewer was consulted and re-consulted.
- I did **not** run these C rows and do not claim them: SOURCE-SCOPE sha checks (frozen and protected), CLAIMS, ASSERT-COUNT on C's side, UNIT shuffle, MUTANTS-TREE, PERF-INTERACT, PERF-RESOURCES, LEAF-PROBE and the LIB-*, G375-AUTH and STUDIO-SMOKE browser rows.

## 6. Next C checks (exact)
1. SOURCE-SCOPE: `git status --short --untracked-files=all` gives 7 lines; from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-374/r375-frozen-sha256.txt`; then the protected check `b-round-318/protected-sha256.txt`.
2. SKETCH-EQUAL: `sha256sum -c ../tmp/studio-real-loop/b-round-374/sketch-files-sha256.txt`.
3. CLAIMS: `bash b-round-374/claims-375.sh`. K2 should read 7 and K14 `doc 242 files: 1`.
4. UNIT, including the shuffle seed 42 runs of render-budget and library-preview. Then, each alone: MUTANTS-TREE, PERF-INTERACT (zoom.1 = 53, zoom.30 = 140) and PERF-RESOURCES.
5. LEAF-PROBE after a warm-up, then LIB-KEYS, LIB-MENU, LIB-PREVIEW, LIB-LAYOUT, G375-AUTH and STUDIO-SMOKE-375 at both viewports against a HEAD copy.
6. DOCS row on doc 242. The `tmp/studio-real-loop/…` path form is deliberate (it follows the reviewer's finding, unlike doc 241's bare `b-round-373/…`). These paths resolve from `/home/runner/czaba-project/`, not from `store/`. Its wording changed after the first review; check the comparator sentence (only `next`-only keys count as a change) and the drag-preview-render positive-control sentence.

## 7. Known gaps
- The three test-side review Lows in §3 are not fixed, because the files are frozen. B decides.
- Browser state for the orchestrator is in `a-browse.json` (fresh contexts, nothing stored).
- The doc calls the cursor row by its title text, not by its id `M-R10-1/M2`; the row exists.
- My browser smoke covers only Enter add and the Add enabled/disabled states. Every other browser row is C's.
