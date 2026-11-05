# A round 355 — SYS-R353-DP-TEST-POLISH

No STOP. Scope done as written: both of B's patches applied unchanged. Nothing else changed.

## Changed files (2)
1. `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: `git apply b-round-354/sketch/test.patch.txt`. `cmp` with `drag-preview-render.test.sketch355.tsx` → byte-equal.
2. `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`: `git apply b-round-354/sketch/doc232.patch.txt`, unchanged.

`git status --short`: these 2 files (M), 0 untracked. No app source, dock, context, perf, e2e, config or protected file was touched.

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-equal to `b-round-354/claims-355-planning-output.txt` | `a-round-355/claims-pre.txt` |
| A-CLAIMS final | PASS: <ul><li>K3 and K5 equal the sketch output.</li><li>K2 = `7219291 2 outside-root-lanes-since-7219291 0`.</li><li>K7 = `diff-lines-outside-2 0 untracked 0`.</li><li>Every other K equals the planning output (K11: `27 listed, 0 missing`).</li></ul> | `a-round-355/claims-final.txt`, `claims-final-vs-planning.diff` (differs only in K2/K3/K5), `claims-final-vs-sketch.diff` (differs only in K2, `no-git` there) |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-355/typecheck.log` |
| A-LINT | `npm run lint` rc 0, 205 warnings (= the 205 ceiling) | `a-round-355/lint.log` |
| A-UNIT | 74/74, rc 0, tests 5.6 s; slowest test 369 ms against the 5 s timeout (< 50 %, L11) | `a-round-355/unit.log`, `unit-verbose.log` |
| Biome on the test file | `npx biome check <test>` rc 0 | `a-round-355/biome.log` |
| A-MUTANT | PASS: A's `mutant-summary.txt` is **identical** (`diff` rc 0, 0 lines) to B's `b-round-354/sketch/mutant-summary.txt` across all 22 lines (control, M-B1, M-B1-LATE, M-B3, M-B4, M-B6, M-B7, A-M5, M-B8, M-B9, FX-SHORTDRAG × sketch/head). Same red ids and first failing lines | `a-round-355/mut/mutant-summary.txt`, `mut/summary-diff.txt` (empty), `mut/mut-*.json/log` |
| store unchanged by mutants | `git status --short` before/after the mutant runs is identical | `a-round-355/store-status-before.txt`, `store-status-after.txt` |
| A-REVIEW | Not run. The change is 2 files (a test and a doc), below the 3-file rule, and the task does not require it | — |

**Primitives and pre-flight.**
- Read the lessons named in the task, plus the primitives `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
- The primitives were read after applying the patches. The content is B's byte-fixed patch, so no code was written by A.
- Pre-flight: patch-apply only.
- `git apply` does not trigger the Edit/Write primitive hook.
- The per-test timing figure (slowest test 369 ms) comes from a sort of the verbose log. DP72's own duration was not isolated.

**Scratch.**
- Built: `git archive HEAD` to `/home/runner/a355-scratch/sc`, then `git diff HEAD` applied (saved as `a-round-355/a355-diff.patch.txt`) and `node_modules` symlinked.
- Removed afterwards, together with the script's `/tmp/b354-*.orig` copies. Store `node_modules` is intact.

## Not run by A (gate / C)
- Full vitest, build, `npm run verify` and e2e smoke: gate rows.
- FAKE-TIMER-LEAK shuffle, browser STUDIO-SMOKE-355, G355-AUTH and the DOCS review: C rows.

## Known gaps
- The coverage limit is as B wrote it in doc 232 item 111:
  - rAF stays stubbed;
  - a timer reference saved at module load is not faked;
  - the playing path is not exercised.
- `'Video Fade In'` literal stays (ruled §0.1 c).

## Exact next C checks
1. CLAIMS: `bash b-round-354/claims-355.sh` must equal `a-round-355/claims-final.txt`.
2. SOURCE-SCOPE: `git apply -R --check` on both patches, plus `cmp` with the sketch file.
3. ASSERT-LOSS on the test diff.
4. UNIT 74/74.
5. MUTANT: M-B1-LATE, FX-SHORTDRAG and M-B9, plus C's own mutant.
6. FAKE-TIMER-LEAK: seeds 1 and 2.
7. STUDIO-SMOKE-355 and G355-AUTH at 1440×900 and 1280×720.
8. DOCS (doc 232: l.4, the section, 7 `## `, `20 ms settle` appearing 0 times, no `pending` docs).

## For B
No architecture notes; no review was run.
