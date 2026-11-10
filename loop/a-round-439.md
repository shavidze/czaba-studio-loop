# A round 439: SYS-R435-SOURCE-SCAN-HELPER v4.1 (test-only)

**STOP — needs B ruling on A-R439-REVIEW-M1-RD2-SF2-WRAPPER-TAG** (code-reviewer Medium, not ruled in `b-round-438/sketch-review.md`; task §2 step 1 + L11).

- **Finding (reviewer, Medium):** RD2 (`studio-radio.test.ts:13-14`) and SF2 (`studio-search-field.test.ts:11-15`) select only lowercase `input` tags. NF2 now catches a number wrapper on any tag (C-R438-01), but a wrapper `<Input type="radio" />` or `<Input type="search" />` passes RD2/SF2. IN1's raw `<input` guard does not see a capitalised wrapper either. The reviewer's fix: the NF2 pattern (`scanAllJsxOpeningTags` filtered on `type`, non-`input` list pinned to `[]`).
- **A's measurement:** two named mutants, run in scratch copies only (`git archive HEAD`; v4.1 = HEAD plus the 8 working-tree paths; `node_modules` symlink; scratch deleted afterwards). Script: `a-round-439/wrapper-mutants.sh`. Results: `a-round-439/wrapper-mutants.jsonl`. Logs: `a-round-439/W*-{head,v41}.log`.

  | Id | Mutant (new file in `app/components/arrangement/`) | Suite | HEAD | v4.1 |
  |---|---|---|---|---|
  | W1-RD2-WRAPPER-RADIO | `<Input type="radio" name="f" className="x" />` | studio-radio | rc 0 (green) | rc 0 (green) |
  | W2-SF2-WRAPPER-SEARCH | `<Input type="search" className="x" />` | studio-search-field | rc 0 (green) | rc 0 (green) |
  | W0-BASELINE-NONE | a file with no tags (not a pick-up proof) | studio-radio | rc 0 | rc 0 |

  Second run, in fresh scratch trees (`a-round-439/wrapper-mutants-2.sh`, `wrapper-mutants-2.jsonl`, logs `W1b…/W2b…/W3…/W4…-{head,v41}.log`). This run covers placement inside an owner file and adds positive controls:

  | Id | Mutant | Suite | HEAD | v4.1 |
  |---|---|---|---|---|
  | W1b-RD2-WRAPPER-IN-OWNER | `<Input type="radio" … />` component appended to `ArrangementExportDialog.tsx` | studio-radio | rc 0 (green) | rc 0 (green) |
  | W2b-SF2-WRAPPER-IN-OWNER | `<Input type="search" … />` component appended to `ArrangementShortcutSheet.tsx` | studio-search-field | rc 0 (green) | rc 0 (green) |
  | W3-RD2-POSITIVE-CONTROL | a new file with a lowercase `<input type="radio" className="x" />` | studio-radio | rc 1 (red) | rc 1 (red) |
  | W4-SF2-POSITIVE-CONTROL | a new file with a lowercase `<input type="search" className="x" />` | studio-search-field | rc 1 (red) | rc 1 (red) |

  W3 and W4 show that both scanners read a new top-level file. The four wrapper mutants (W1, W2, W1b, W2b), in a new file or inside an owner file, are green at HEAD and green on v4.1. So on the measured placements this gap is **equal to HEAD**, and no HEAD assertion is lost on them. Not measured: wrappers in subfolders (HEAD does not read subfolders) and computed `type` values. B makes the call; A does not rule.
- **Options for B (A does not pick one):** (a) defer it as a Low equal to HEAD, like A-R438-REVIEW-L2; (b) a v4.2 sketch that applies the NF2 any-tag pattern to RD2 and SF2.
- **Tree state:** the v4.1 delta and doc 285 are applied, and A1–A4 pass (below). A did not revert or hand-edit anything. Nothing changed after the code-reviewer ran, so no re-review is needed.

## Changed files (all within `b-round-438/grants-439.txt`)
- `app/lib/arrangement/__tests__/helpers/source-scan.ts`, `source-scan.test.ts`, `studio-number-field.test.ts`, `studio-progress.test.ts`, `studio-radio.test.ts`: the v4.1 delta, applied with `git apply -p1 b-round-438/sketch-439-delta.patch.txt`. Its sha256 `4596eec7…` matches `sketch-439.sha256`. `--check` passed first.
- `held-enter-source-scan.test.ts`, `studio-dialog-scrollbar.test.tsx`, `studio-search-field.test.ts`: unchanged in this round (v3 = v4.1).
- `docs/implementation/2026/quarter-IV/285-sys-r435-source-scan-helper.md`: edits E1–E8, applied with B's script `b-round-438/apply-doc285-edits.py` on A's current doc. The output is byte-identical to `doc285-expected.md`.
- `git status --short`: 6 `M` + 3 `??`, exactly the 9 granted paths.

## A's checks (actually run)
| # | Result | Evidence |
|---|---|---|
| Precondition | `K2 status total 9 outside-grants 0`, `K5 tree-equals-v3 8/8`, `K6 delta-applies yes` | `a-round-439/claims-pre.txt` (run before the apply) |
| A1 | **PASS**: 8/8 paths identical to `sketch-files/`; doc identical to `doc285-expected.md`; the E8 self-check grep prints nothing (rc 1) | `a-round-439/a1-cmp.txt` |
| A2 | **PASS**: 7 files, 24/24, rc 0 | `a-round-439/covering.log` |
| A3 | **PASS**: typecheck rc 0; lint rc 0 with 205 warnings (= `lint-sketch.log`) | `a-round-439/typecheck.log`, `lint.log` |
| A4 | **PASS**: `diff planning-output after-A` equals `claims-439-expected-after-A.diff.txt` exactly; stderr empty | `a-round-439/claims-after-A.txt`, `claims-diff.txt`, `claims-after-A.err` (0 bytes) |
| /check (scoped Biome) | rc 0, "Checked 8 files … No fixes applied" | `a-round-439/biome-scoped.log` |
| code-reviewer | run (Agent `code-reviewer`). Score 8/10; 0 Critical/High, **1 Medium (STOP above)**, 6 Low | `a-round-439/code-reviewer.md` (verbatim) |

- **Pre-flight / primitives:** A did not run the separate pre-flight skill, and did not re-read the primitive files in this round. A wrote no code. The 5-file delta was applied byte-for-byte from B's `sketch-439-delta.patch.txt`, which had been reviewed twice by tech-lead. The doc edits were B's verbatim E1–E8 fences. Compliance evidence: strict typecheck rc 0, Biome rc 0, and the reviewer's "no any / assertions / suppressions, semicolons consistent".

- L31: the slowest covering test was RD2 at 1042 ms (21 % of the 5 s default), then NF2 at 988 ms and PG2 at 894 ms (`covering.log`). All are under 50 %, so this is not a STOP. These times are higher than B's 663 ms in `l31-headroom.txt`; A's run was a single cold run.
- Not run by A (gate rows): the full vitest suite, build and `npm run verify`.

## Reviewer Lows (none applied; for B)
1. **A-R439-REVIEW-L1-RAW-COUNT-CANCEL:** the NF2/PG2/IN1 raw-count guards compare counts only. One markup string plus one real tag that the regex misses (for example `type = "number"`) would cancel out. A stricter guard would compare line positions.
2. **A-R439-REVIEW-L2-IN1-OMIT-REGEX:** IN1's `Omit` check is a whole-file text regex. It requires `'type' |`, so a valid `Omit<…, 'type'>` would fail.
3. **A-R439-REVIEW-L3-INPUTCLASS-BY-NAME:** NF2 matches `inputClass` by name, not by binding. This is safe today because the child component is not exported.
4. **A-R439-REVIEW-L4-HS1-EMPTY-ROOT:** HS1 does not assert that each scan root returned at least one file.
5. **A-R439-REVIEW-L5-SEARCH-ENV:** `studio-search-field.test.ts:1` lacks `// @vitest-environment node`, which its sibling suites have.
6. Doc line 4 says "Completed (C round 439 PASS)" before C has run. This is B's verbatim E1 text, so A left it. The reviewer also called the HEAD assertion map "missing", but it only looked inside `store/`. The map is at `tmp/studio-real-loop/b-round-438/head-assertion-map.md`, as the doc cites. Not a finding.

## Architecture note (for B; not a refactor instruction)
"signal: none." Keep the single test-only helper. The suites with their own walkers are already SIG-R438-OTHER-SCANNERS. The reviewer's alternative, a Biome/ESLint JSX rule ("`<input type=number>` needs `STUDIO_NUMBER_FIELD_CLASS`"), fits TL-R438-04 / SIG-R438-OTHER-SCANNERS later.

## Known gaps
- STOP above: B must rule on A-R439-REVIEW-M1 before C runs the round as written. If B picks (b), a v4.2 delta changes A1/A2/C2/C5.
- The C rows (C1–C11) are not run by A, and none is claimed.

## Exact next C checks (if B rules (a) and keeps the task)
C1 SOURCE-SCOPE, then C7/C8 in the browser (warm up first; no vitest during the browser rows), then C2 patch identity (a)/(b), C4 covering, C5 all three mutant runs, plus `a-round-439/wrapper-mutants.sh` and `wrapper-mutants-2.sh` on both scratch trees as an extra row, then C6, C9 (diff = `claims-439-expected-after-A.diff.txt`), C10 doc cmp, and C11 with L57.

## Scope completed
Task §2 steps 1–2 and A1–A4 are done. The round is not complete: it waits on B's ruling on A-R439-REVIEW-M1.
