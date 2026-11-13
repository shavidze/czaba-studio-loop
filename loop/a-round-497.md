# A round 497: DPG-BUTTON-CLEANUP stage 1 completion (test-only addendum + doc 319)

**STATUS: DONE, no STOP.** I applied the addendum unchanged and updated doc 319. Every run below passed. This round has no A browser rows; C11 mutants and all browser rows belong to C.

## Changed files (this round)
- `app/lib/__tests__/store-glow-shadow.test.ts`: the addendum, applied with `git apply`. No other edit.
- `app/lib/__tests__/store-button-cleanup.test.tsx`: the addendum, applied with `git apply`. No other edit.
- `docs/implementation/2026/quarter-IV/319-dpg-button-cleanup-stage-1.md`:
  - l.4 is now `In Progress (stage 1 of 2; C round 497 PASS)`. This is the L28 multi-stage form. "2 stages" comes from `backlog.json` l.17094: "done only after both stages C PASS".
  - The changed-files list now mentions the GS3 CSS scan and BC1b.
  - Three Problem → Solution entries were added: the STOP → ruling (a) with D-29z1779 and the tech-lead APPROVE; the reviewer-regex lookbehind correction with the 6 HEAD hits; and the 8/8 mutant evidence, attributed to B's files.
  - In the testing section: 41 → 42 tests, the browser check moved to round 497, and the stale "strengthening belongs to B" line was rewritten.
  - Headings: the 7 TEMPLATE headings are still present, in order. `pending` appears 0 times.

`git status --short --untracked-files=all` shows the same 13 paths as the baseline (`a-round-497/status-end.txt`).

## Runs (all actually run, from `store/`)
| Check | Result | Log |
|---|---|---|
| Frozen checks before apply: r496 tree, protected, r497-a496-frozen, r497-pre-test-sha | all rc 0 | `a-round-497/frozen-pre.log` |
| Patch sha256 vs `addendum-sha.txt` | equal (`853dc262…`) | — |
| `git apply --check` / `git apply` / `r497-post-test-sha.txt` | rc 0 / 0 / 0 | — |
| `npm run typecheck` | rc 0 | `a-round-497/typecheck.log` |
| `npm run lint` | rc 0, 182 warnings, 1 info | `a-round-497/lint.log` |
| Biome on the 2 owned test files | rc 0 | `a-round-497/biome-scoped.log` |
| `npx vitest run` on the 4 covering files | 4 files, **42/42 pass**; BC1b 1142 ms | `a-round-497/covering.log` |
| Frozen checks after the doc edit (all 4, including post-test-sha) | all rc 0 | `a-round-497/frozen-post.log` |
| HEAD `app.css` vs the addendum regex | 6 matching lines | `a-round-497/head-appcss-regex-hits.txt` |
| C13 claim exposure to the doc edits | `claims-496.sh` reads doc 319 only as a file name (K15 `ls`), not its content, so the doc edits cannot change C13 | — |

## Known gaps
- I did not run the full suite, the build or `verify` (these are gate rows). I did not run the mutants (C11) or any browser row.
- The two doc 319 lines I reworded after the review (l.67 and l.73) were not re-reviewed.
- The reviewer had no shell. It compared the BC1b literals against `a-round-496/equiv/ButtonHead.tsx`, not `git show 3bcf8cb`.

## Pre-flight
- I read `lessons.md` (A section L11–L28, with L26 and L28 in full), `.claude/primitives/GEORGIAN_DOCS.md`, TEMPLATE headings, and `tasks/round-496.md` (doc 319 grant).
- I wrote no code or test lines: the test changes are B's patch only.
- Loop-folder paths in doc 319 follow precedent: 197 quarter-IV docs cite `b-round-` or `c-round-` paths.

## Code-reviewer (real subagent, scoped to the addendum and doc 319)
- **Score 9/10.** 0 Critical, High or Medium findings; 1 Low and 3 Info.
- **A-R496-CR-GS3-GUARD: RESOLVED.**
  - Every `.css` file under `app/` is scanned. There are 5 today, and `utilities.css` is required by name.
  - The regex catches all 5 forms the reviewer listed, and its self-test proves this.
  - Dropping the lookbehind is correct, because the lookbehind misses `a.button`.
- **A-R496-CR-BC1-PIN: RESOLVED.**
  - All 288 combos are rendered.
  - The `HEAD_*` literals match the HEAD Button character for character, in HEAD's composition order. The reviewer compared against A's round-496 HEAD copy `a-round-496/equiv/ButtonHead.tsx`, because it had no shell for `git show`.
  - The `className`-last position is pinned.
- **Low (doc 319 l.67 and l.73):** these lines read as future C work, while l.4 states PASS. **Fixed** inside the doc grant. Both lines now point to `c-round-497.json` (rows C11 and browser) instead of claiming results.
- **Info, for B; the addendum lines were not edited, per the ruling line "the addendum wins":**
  - (i) `BC1B_TIMEOUT_MS` sits between the HEAD tables (`store-button-cleanup.test.tsx:45`). This is cosmetic.
  - (ii) The GS3 failure message lists only file paths, not the matched selector (`store-glow-shadow.test.ts:100`).
  - (iii) Pill is checked only for secondary/sm. The reviewer finds this acceptable.
- **Architecture note for B:** keep. This is a test-only diff. The HEAD tables intentionally duplicate the variant and size maps, as an independent oracle. The one known cost is that DPG-BUTTON-CLEANUP-2 must update BC1b on purpose whenever it changes Button output.

## For B
- The 3 Info notes above: none needs action.
- The doc 319 status uses "stage 1 of 2", based on backlog l.17094. If stage 2 is split further, the denominator changes.
- No pre-ruled Low was re-raised.

## Acceptance (B task §2) that A truly passed
- [x] Step 1: pre-sha rc 0, apply rc 0, post-sha rc 0.
- [x] Step 2: only the granted files changed: the 2 test files (addendum only) and doc 319.
- [x] Step 3: typecheck rc 0, lint rc 0, 42/42 covering tests, the real code-reviewer run, with both Mediums given as the "verbatim gist" text from `a-round-496.md` l.31–41.
- [x] Step 4: this report.
- Not A's: C0–C15. In particular, the browser rows C1–C7 and C15, and the C11 mutants, are unverified until C runs them.

## Exact next C checks
- Run C0 with the same 13 paths as `a-round-497/status-end.txt`, plus the 3 frozen checks and `r497-post-test-sha.txt`.
- Run C10 (42/42), then C11 with the working-tree copy and no `.git`: N1–N8 should be RED, and M1, M2 and M7 RED.
- Run C12: doc 319's l.4 byte for byte, and its Problem entries traced to `b-round-496/*` and `a-round-497/*` logs.
- Run the browser rows C1–C7 and C15 at both viewports, then C13 and C14.

Scope completed: the A part of round 497 only. DPG-BUTTON-CLEANUP is not done until C PASS with `browserVerified` true, followed by stage 2.
