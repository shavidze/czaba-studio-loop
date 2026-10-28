# C — Round 36 (TM-B38) verification

**STATUS: PASS** (R36-1…R36-6). realVerified=true: E2E ran against the real Electron app under xvfb (7/7, and 7/7 with `--retries=0`), and `src/` is byte-identical to `46bd74b`.
Windows packaging: BLOCKED — Windows packaging is not available in the cloud. It is not part of this round.
Baseline: HEAD `46bd74b`. C did not change any repository file. All of C's work ran in throwaway copies under `/tmp/c36/{before,after,red}`.
Evidence folder: `c-round-36/`.

## R36-1 ownership + process — PASS
- `git status --porcelain --untracked-files=all` lists 13 modified files plus `?? tests/renderer/helpers/dom-queries.ts`. All 14 are owned paths.
- `git diff --quiet 46bd74b -- . ':!<14 owned>'` exits 0.
- The frozen-list `--quiet` check (src/, package*, tsconfig*, vitest/playwright/biome/electron.vite configs, tests/e2e, tests/main, setup.ts, reset-stores.ts, window-api-mocks.ts, docs/bugs/README.md, .claude/primitives-map.json) exits 0.
- `grep -rn 'getByRole("button"' tests/renderer` finds nothing. `buttonByText` occurs only inside `getButtonByText`.
- No timeout was added. The only "timeout" in the diff is TESTING.md's "timeout-ს არ ვზრდით" line, plus one context line in docs that is unchanged.
- `dom-queries.ts` has no comment and no `any`. It is byte-identical to B's `proto/dom-queries.ts.txt`.
- Bash writes to `.claude/**` and the repository: "unknown". There is no transcript. A's result JSON has empty `permission_denials`, and A states it used the Edit tool.

## R36-2 assertions unchanged — PASS
- The `git diff -w` changed lines (`c-round-36/test-diff-lines.txt`) are only:
  - the 24 lookup replacements, each keeping the same `X`;
  - one import per file, placed before `../helpers/reset-stores`;
  - the removed local `buttonByText`;
  - the (e5) name;
  - (b7)/(b8).
- Import position, checked with `grep -n '^import'` in all 11 files: `dom-queries` sits after the package and `~/` imports and directly before `../helpers/reset-stores`. In no file is it at the top.
- No other `expect` line changed.
- Test counts per file are unchanged (20, 8, 18, 11, 49, 15, 9, 8, 5, 4). done-busy goes from 6 to 8.
- The (b7)/(b8) bodies were compared with `diff` against C's (k1)/(k2) after `sed buttonByText→getButtonByText`. The only difference is the test name.
- done-busy is byte-identical to B's prototype file.

## R36-3 helper semantics + mutants — PASS (one low finding)
Mutants were run on a copy of A's tree with the full renderer suite. The exact edits are in `c-round-36/*.diff`, the script in `mut.py`, and the output in `mutants.log`.

| Mutant | Result | Failing tests |
|---|---|---|
| CTRL | 289/289 | — |
| SM-1 | killed | (e1), (e2), (b3) |
| SM-2 | killed | (e3) |
| DM-3 | killed | (w8) |
| BM-1 | killed | (b1), (b2) |
| DM-8 | killed | (b5); (b7) with `expected 'STALE1' to be 'B'` |
| BM-6 | killed | (b8) |
| DM-9 | survives | expected, argued-equivalent; recorded |
| HM-1 | survives | — |
| HM-2 | survives | — |
| HM-3 | survives | — |

**Red base** (`3035ffc` `SchemaEditor.tsx` + `MetadataPanel.tsx` with A's tests; `red-base.log`):
- (b1) fails on `toBeDisabled`, (b2) on `expected 3 to be 2`, and (b5) on the missing `qtwo`. These are the same symptoms as in `c-round-35/r35-2-red.log`.
- (b7) fails on `expected 'STALE1' to be 'B'`.
- (b4) gives `Unhandled Rejection: reread failed`.

**HM survivors are equivalent today.** C put an identity probe in the copy's helper (`helper-identity-probe.log`). For all 257 lookups across the 11 component files, it logged:
- the count with exact match;
- the count with `includes`;
- the count without `trim`;
- whether `screen.getByRole("button",{name})` returns the same element.

Every lookup gave matches=1, includes=1, notrim=1 and sameAsRole=true. This includes `/Done/` while an `Applying...` label exists, `+ Category (UCS)`, `Artist`, `Save Tags` and `Save to 2 files`. No test passes because the wrong button was picked. → **C-R36-01 (low):** no test pins the helper's uniqueness, exact-match or trim semantics. A small unit test for `dom-queries.ts` would kill HM-1…HM-3.

## R36-4 durations — PASS
Same runner, sequential, interleaved before1 / after1 / before2 / after2. "Before" is a `git archive 46bd74b` copy; "after" is the repository. Both after runs: **289/289 in 18 files**. The before runs were 287/287.

| file | before r1/r2 ms | after r1/r2 ms | speedup (mean) | slowest test after ms |
|---|---|---|---|---|
| file-list | 886 / 807 | 496 / 528 | 1.7x | 71 / 85 |
| folder-read-during-save | 2330 / 2170 | 656 / 585 | 3.6x | 187 / 152 |
| folder-read-overlap | 3076 / 3361 | 1424 / 1310 | 2.4x | 274 / 300 |
| folder-read-rejected-chunk | 1474 / 1480 | 379 / 329 | 4.2x | 73 / 66 |
| metadata-panel-batch-save | 6337 / 5954 | 1348 / 1285 | 4.7x | 108 / 105 |
| **metadata-panel-schema-change** | 18385 / 18647 | 1307 / 1297 | **14.2x** | 193 / 220 |
| **reread-after-folder-switch** | 7374 / 7148 | 958 / 974 | **7.5x** | 223 / 210 |
| **schema-change-during-folder-load** | 15526 / 15743 | 1564 / 1381 | **10.6x** | 382 / 315 |
| schema-editor-done-busy | 1044 / 1104 (6 tests) | 1441 / 1391 (8 tests) | 0.8x | 339 / 297 |
| **schema-editor-stale-close** | 9122 / 8859 | 988 / 942 | **9.3x** | 402 / 360 |
| schema-editor | 2880 / 2887 | 330 / 338 | 8.6x | 100 / 131 |

- Slowest test overall is 402 ms in run 1 and 360 ms in run 2, both (e1). No test reached 1.5 s.
- (b1)–(b8) are all ≤ 339 ms.
- The four named files are each ≥ 5× faster.
- On this runner the before figure for schema-change-during-folder-load is 15.6 s, not B's 23 s. The ratio still holds.
- Each component file run alone is green (`each-alone.log`).

## R36-5 gate — PASS
I cleaned first (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) and ran the full `verifyCommand` (`gate.log`):
- exit 0;
- Biome: 0 errors and **8 warnings**, the same file/rule list as `c-round-35/biome-new.txt`;
- typecheck (node, web, test) 0. `tsc -p tsconfig.test.json --listFiles` includes `dom-queries.ts`;
- renderer 289/289, main 93/93, E2E 7/7 in the real Electron app.

`xvfb-run -a npx playwright test --retries=0` → 7/7, exit 0 (`e2e-retries0.log`).

## R36-6 docs — PASS
**`docs/bugs/001`:**
- `--word-diff` shows exactly the three §5 changes.
- The new (e5) name: 1 match in the docs and 1 in the test. The old name: 0 and 0.
- The new D-40 and D-41 phrases: 1 match each.
- Every `file:line` ref is identical to `46bd74b` apart from the new `:227-228`, which the task asked for.
- `MetadataPanel.tsx:227-228` are `schemaReadIdRef.current += 1;` and `const schemaReadId = …`. `:229` is `await waitForFolderLoadIdle();`.

**TESTING.md:**
- Rule 6 sits between rule 5's code block and `## Main Process ტესტის pattern`.
- It is 5 lines of Georgian with English terms. It gives the helper path, the reason with B's numbers (23 s→1.9 s, 4.05 s→0.61 s), the unique-match rule, a `getByTitle` line, and "no timeout raise". The `getByTitle` line is extra but within scope.
- Nothing else in the file changed.

## Findings
- **C-R36-01 (low):** HM-1, HM-2 and HM-3 survive. They are equivalent on all 257 current lookups, as the identity probe shows. A unit test for `dom-queries.ts` would pin the semantics.
- **Info:** A's latent notes R36-A-01 (no inner-whitespace collapse) and R36-A-02 (`g`/`y` RegExp `lastIndex`) are confirmed as not reachable today: the probe shows `sameAsRole=true` everywhere and no call site uses a `g` or `y` flag.

Closes, on PASS: TM-B38, C-R34-02, B-R34-02, C-R34-03, C-R35-02, C-R35-03.
