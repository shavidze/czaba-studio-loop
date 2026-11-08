# A round 414: SYS-R2-FAKE-FIDELITY (test-only)

**Status:** implementation complete; handed to C. No STOP. Nothing committed or pushed.

## Changed files (`git status --short --untracked-files=all`: 1 ` M`, 1 `??`)
- ` M workers/r2-proxy.test.mjs`: B's sketch `b-round-413/sketch-414.patch.txt` (sha256 `5279fce53efec3003828470edc3397f4711e86b4c097197a62faeda47e824117`, matches the task's `5279fce53efec300…`), applied byte for byte with `git apply`. `--check` passed first. I made no edit after applying it. Diff: 82 insertions and 7 deletions.
- `?? docs/implementation/2026/quarter-IV/266-sys-r2-fake-fidelity.md`: new, in Georgian.
- No worker, protected, `app/`, config, package or `public/` file was touched.

## Checks (logs in `a-round-414/`)
| # | Check | Result |
|---|---|---|
| A1 | `bash b-round-413/claims-414.sh` at start | rc 0. Output is identical to `claims-414-planning-output.txt` (`diff` empty), and stderr is 0 bytes (`claims-start.txt`, `claims-start.err`). HEAD is `dc536a6` and the tree was clean |
| A2 | `node --check workers/r2-proxy.test.mjs` / `node --test workers/r2-proxy.test.mjs` | rc 0 / rc 0. **83 tests, 83 pass, 0 fail**, duration_ms 148 (`node-test.log`) |
| A3 | `npx vitest run app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts` | rc 0. 2 files, **32/32** (`vitest.log`) |
| A4 | `npm run typecheck` / `npm run lint` | rc 0 / rc 0. Lint: 205 warnings and 1 info, the same as round 413, so no new finding (`typecheck.log`, `lint.log`) |
| A5 | Style self-check on the added test lines (not a tool PASS; Biome does not cover `workers/`, L30) | Every added line ends in `;`, `{`, `,`, `(` or `[`, or is a block closer. 0 new comments. 0 `any`, `ts-ignore` or `biome-ignore` |
| A6 | Claims at end (re-run after the doc fix) | rc 0, stderr 0 bytes. Against `claims-414-sketch-output.txt`, only K1 (the HEAD sha), K2 (`1 ?? 1 M total 2`), K6 (doc 266 l.4) and K7e's `head-ref` label differ. K7e's value is still 0, and the label differs only because the HEAD sha differs. K7, K7b, K7c and K10 (83/83) are equal. K3: 1312 entries, rc 0. K4: rc 0, granted-protected 0. K2b 0, K5 `no`, K8b 0. Files: `claims-end.txt`, `claims-sketch-vs-end.diff`, `claims-planning-vs-end.diff` |
| A7 | `code-reviewer` subagent on the test diff and doc 266 (it was actually invoked) | **No Critical, High or Medium**, so there is no L11 STOP. Findings are below |
| Doc self-checks | — | l.4 is byte-exact `**სტატუსი:** Completed (C round 414 PASS)`. The 7 TEMPLATE headings are in order (diff empty). The `MU-414-` lines equal the 14 in `b-round-413/mutants/summary.txt` (diff empty; they were inserted by script, byte for byte). Every cited row (PR4, PR6, PR9, PR14–PR17, PR19–PR22) exists in the test file. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0, and `grep -rln 'In Progress (stage'` gives 7 |

**Not run by A (speed rules):** the full vitest suite, the build, `npm run verify` and the mutant runner. The mutants are C's row 4, and B's `summary.txt` is the sketch evidence. I ran no browser either: there is no user-visible change, and C's rows 5 and 6 cover the browser.

## Reviewer findings (A7)
- **Low, doc 266 Mermaid diagram:** it drew `throw` going to the proxy only and `short` going to the alternate worker only, which is wrong. **Fixed in the doc:** both modes now feed one R2-answers node that serves both workers.
- **Low, doc 266 fake-options line:** it called `outOfRange` "unchanged" and left out `cancelRejects`. **Fixed:** the line now says the names and defaults are unchanged, `outOfRange` now also controls the `TypeError` (throw only, ruling 2), and `cancelRejects` is listed.
- **Low, note only (PR16 far, l.374):** the expected value changed from `1` to a per-mode value. That is a changed expectation under ruling 2, not a removed assertion, so L4 holds.
- **Low, note only (PR20, l.430):** the `short` case uses an in-range `bytes=0-9`, so it runs the main re-read path. The coverage is correct: it kills MU-414-REREAD-NULL-UNGUARDED. Only the label is a little loose. This is sketch text, so it is left unchanged.
- The two doc fixes are prose and diagram edits only. The test file did not change after the review. I re-ran the doc self-checks and the end claims after the fix, but I did not send this doc delta back to the reviewer.

## Acceptance (A's rows only; C owns the rest)
- A1–A7: passed as above.
- C rows 1–8 are not claimed. C still has to run: row 4 (the mutants into `c-round-414/mutants`), rows 5 and 6 (the browser) and row 7 (the doc).

## For B
- **Architecture note (from the reviewer, proposal only):** in `workers/r2-proxy.test.mjs`, l.22–31 (`request` fake) and l.137–173 (`publicRequest`, now with 11 options) build different R2 object shapes. TL-R414-M1 came from exactly that difference, and the region changed in rounds 309, 311 and 414. The proposal is one bounded test-only task: a shared R2 object factory. Its acceptance would be that row assertions stay byte-identical, the result stays 83/83, and the mutant summary is unchanged. Nothing was extracted this round.
- The Lows B already recorded stay open: B-R414-RANGE-UNIT-CASE, B-R414-HEAD-RANGE-206, ROOT-REQ-VERIFY-WORKER-TESTS (the gate still never runs `node --test workers/r2-proxy.test.mjs`), and the A-R311-REVIEW-L1 pointer.

## Exact next checks for C
1. Row 1: claims equal A6 above, and status shows only the 2 granted paths.
2. Row 2: apply the sketch to a `git archive HEAD` scratch, then `cmp` its test file against the tree.
3. Row 3: `node --test` 83/83, and vitest 32/32.
4. Row 4: the mutants with `OUT=<loop>/c-round-414/mutants`, compared with B's `summary.txt`.
5. Rows 5 and 6: the browser worker probe (both workers × throw/short) and the auth probe at 1440×900 and 1280×720.
6. Row 7: doc 266, including the post-review diagram and fake-options wording.
7. Row 8: the end claims, `git diff HEAD --` on both workers is empty, and L57.
