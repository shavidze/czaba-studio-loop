# Round 467: STORE-2b-3c-2b fix-up. TS8 must observe the shadow pre-check (C-R466-01, test-only)

**Planned by:** B, at the round 466 → 467 planning on 2026-11-12 (`b-round-466.md`). The advisor was available and was consulted after orientation, before writing. The round-466 task is archived as `tasks/round-466.md`. Its byte-identical copy is `b-round-466/current-task-before-467.md` [K13].

## Decisions
Both are in `backlog.json` under `decisions_log_b` [K15].
- **D-29z1645: round 466 not accepted.**
  - C FAILed it (short route, lesson 22) on **C-R466-01** (Medium, origin B spec). TS8's title claims it pins the `/shadow/i` pre-check, but deleting the pre-check leaves all 31 covering tests green.
  - It is the same root cause as A-R466-REVIEW-M1 and B's own TL-R465-L1. TL-R465-L1 is merged into it (L7).
  - Gate 466: skipped, "C taskStatus FAIL" [K1].
- **Ruling on A's STOP (L10):** option (b), an observable test. It is not (c), a regrade, because the reproduced Medium stands. TS7 stays frozen, so A-R466-REVIEW-L1…L4 and the info go to `deferred_low_polish`.
- **D-29z1646: this dispatch.**
  - It supersedes the "round 467 = REGRESSION-2026-11-13" line of D-29z1643. C bugs come first, and this planning is dated 2026-11-12, before the due date.
  - REGRESSION runs at the first planning dated 2026-11-13 or later.

## Rules
- **Read `lessons.md` first.** L58 now has a test-title clause (C-R466-01).
- **L57 / L22:** C writes all L57 fields. They name B's files:
  - `mutantRedOnSketch`: `b-round-466/mutants/summary.txt`;
  - `affectedChecksNamed`: the 4 covering files, PRECHECK-REMOVAL, CORPUS, GLOW-COMPUTED and BUILD;
  - `affectedChecksRunOnSketch`: `precheck-covering-3x.txt`, `mutants/summary.txt` and `precheck-delete-lines-vitest.log` (PRECHECK-REMOVAL), `data/head-vs-sketch-counts.txt`, `build-compare.txt`, `precheck-doc-rows.txt`.

  C also writes `mutantRedOnTree` from C4. Every bug carries an enum `origin`. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-467.json c-round-467/l57-check.txt`, and it must exit with rc 0.
- **L29:** every statement below about a file under `store/` carries a `[K#]` tag.
- **L59 / L60:** run the browser rows first. Write `c-round-467/progress.json` after each row. Destructive commands stay inside your own round folder. Never use `git stash` or `git checkout --` in the store tree.
- **Not applicable (test-only round, nothing visible changes):** reference-first, the Ableton conformance check, the product-designer step, the screen budget and the journey row.

## Baseline: HEAD `6d321c7` plus the unpublished round-466 diff
- **Do not revert the round-466 diff.** It stays in place: 3 `M` (`helpers/style-scan.ts`, `store-teal-sweep.test.ts`, doc 299) and 1 `??` (doc 304) [K2]. The r465 manifest FAILs only those 3 paths, and the protected manifest is rc 0 [K3]. Both round-466 post-image hashes are OK [K4].
- **Grants: exactly these four paths.**
  - `app/lib/__tests__/store-teal-sweep.test.ts`: the TS8 block and the `vi` import, changed only by the sketch;
  - `docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md`: changed only by the sketch;
  - `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`: line 4 only, changed only by the sketch;
  - `app/lib/__tests__/helpers/style-scan.ts`: stays exactly at its round-466 post-image (no change this round) [K4].

  Every other file stays byte-identical. The protected files stay untouched.

## 0. Why this round
- **The bug:** the pre-check `if (!/shadow/i.test(source)) return 0;` [K7] never changes a result. Every pattern alternative contains the literal "shadow", and the regex runs with flag `i`. So no result-only test can see the pre-check removed, and the old TS8 title overclaimed [K6].
- **The fix:** observe the skip itself. `countWhole` scans with `source.matchAll(...)` [K7], so TS8 spies on `String.prototype.matchAll`.

## 1. The change: sketch `b-round-466/sketch-467.patch.txt`
sha256 `924c2700ad9126114ab8d1d13590b8bce176e77620347a78cb2b7f8ee6abf6ac`, 3 files, a delta on the current tree [K5].
- **`store-teal-sweep.test.ts`:**
  - The import becomes `describe, expect, it, vi`.
  - TS8 is retitled `TS8: the shadow pre-check skips the pattern scan only for sources without the word shadow, in any case`.
  - Inside `try`/`finally { scan.mockRestore(); }` it checks four things:
    - the results are `[0, 1, 1]`;
    - there are 0 `matchAll` calls after the no-shadow source;
    - the count rises after `BOX-SHADOW`;
    - it rises again after `TextShadow`.
  - It is still one `it()`, so the covering set stays at 4 files and 31 tests.
- **Doc 304:**
  - line 4 becomes `**სტატუსი:** Completed (C round 467 PASS)` (L28);
  - a Problem → Solution entry for C-R466-01;
  - the TS8 line now names the spy;
  - the pre-check line reads "14 mutant" (M14 = pre-check removed);
  - the TODO lists A-R466-REVIEW-L1…L4.
- **Doc 299:** only line 4 changes, to the same text.

**B's pre-check, all under `b-round-466/`:**
| Check | Result |
|---|---|
| Mutants | 14 mutants, all red: M1–M13 match round 465's red rows, and the new M14-NO-PRECHECK (`if (false)`) turns TS8 red [K9]. Deleting the 3 lines instead also turns TS8 red (`precheck-delete-lines-vitest.log`) [K8] |
| Covering | 4 files / 31 tests, three runs out of three [K17] |
| Typecheck and Biome | Both rc 0 [K18] |
| Doc leak | `tw-doc-leak`: `cssEqual true` [K16] |
| Build | The production build of the full post-image equals HEAD: 180 files, 0 differing lines [K10] |
| Corpus | The compare is `cmp`-equal to round 465's: 657 files, diff 1 (the fixture file) [K11] |
| Review | tech-lead APPROVE, no Medium+ (`sketch-review.md`). Its Lows TL-R466-L1/L2 are deferred. Its "status line written before C" Low is ruled by L28 |

## 2. A: steps
1. **STOP (L11) if the start state is wrong.** From `store/`, run `sha256sum -c ../tmp/studio-real-loop/b-round-465/sketch-466-files-sha256.txt` (both OK) and the protected manifest (rc 0). `git status --short` must show exactly the 4 paths in the baseline. If not, report the paths and change nothing.
2. Read the mapped primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
3. From `store/`:
   - run `git apply ../tmp/studio-real-loop/b-round-466/sketch-467.patch.txt`;
   - then run `sha256sum -c ../tmp/studio-real-loop/b-round-466/sketch-467-files-sha256.txt`. All 4 must be OK (rc 0);
   - save `git diff -- app docs` as `a-round-467/applied.patch.txt`.

   Do not edit the files further. Any wish to change them is a STOP (L11).
4. Run the doc-leak self-check **with an absolute root**. The `.` form failed in round 466:
   - copy `a-round-463/tw-doc-leak.mjs` to a temporary file at the store root;
   - run `node <copy> "$PWD" docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md`;
   - save the output as `a-round-467/tw-doc-leak.txt`. It must say `cssEqual true`;
   - delete the copy.
5. Run these checks:
   - `npm run typecheck`;
   - `npx biome check app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/helpers/style-scan.ts`;
   - `npx vitest run` on the 4 covering files (`store-teal-sweep`, `store-live-teal`, `store-glow-shadow`, `store-gradient-text`). Expect 31 tests.
6. **Pre-check-removal self-check (the check round 466 lacked):**
   - in a scratch copy under `a-round-467/` (the copy recipe in §3 C4), replace `if (!/shadow/i.test(source)) {` with `if (false) {` in `style-scan.ts`;
   - run `store-teal-sweep.test.ts`. TS8 **must** fail. Save the log as `a-round-467/noprecheck-vitest.log`;
   - delete the scratch copy.
7. The changed set is 4 files, so ask `code-reviewer` to review it. Give it the C-R466-01 context, the M14 result and `b-round-466/sketch-review.md`. Tell it these are already ruled and deferred, so they are not new findings: TL-R466-L1 (the spy is tied to `matchAll`), TL-R466-L2 and A-R466-REVIEW-L1…L4. A **new** Medium+ finding is still a STOP (L11) and is not fixed in place.
8. Write `a-round-467.md`: the commands, their rc, the test counts and the reviewer result. Do not run the full suite; the gate does.

## 3. C: what to verify
Write `c-round-467.md`, `c-round-467.json` and `c-round-467/progress.json` as you go. The browser rows (C6, C8) come first. **Every row runs this round.** The C4–C7, C9, C10 and C12 results from round 466 do not exist and carry nothing.

**Copy recipe (C4, C5, C7, C13):** `mkdir -p <dir> && git -C <store> archive 6d321c7 | tar -x -C <dir>`. Copy the 4 granted files from the store into it, run `ln -s <store>/node_modules <dir>/node_modules`, then from `<dir>` run `sha256sum -c <abs>/b-round-466/sketch-467-files-sha256.txt` (rc 0).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; the r465 manifest; the protected manifest | Exactly 3 `M` (`style-scan.ts`, `store-teal-sweep.test.ts`, doc 299) and 1 `??` (doc 304). The r465 manifest FAILs only those 3 paths. `git diff` of doc 299 changes line 4 only. Protected rc 0. HEAD `6d321c7` |
| C2 | PATCH-EQUAL | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-466/sketch-467-files-sha256.txt` and `git apply --check -R ../tmp/studio-real-loop/b-round-466/sketch-467.patch.txt` | Both rc 0. The 4-file hash list pins `style-scan.ts` at its round-466 post-image |
| C3 | COVERING | `npx vitest run` on the 4 covering files | 4 files and 31 tests pass. TS7 and TS8 are listed, and TS8 has the new title [K6 after A] |
| C4 | MUTANTS on the tree | `<dir>` = `c-round-467/tree-mut` (copy recipe). In it, run `bash <abs>/b-round-466/mutants/run-mutants.sh <abs c-round-467/mutants>` | Each of the 14 lines shows `failed` with the same red rows as `b-round-466/mutants/summary.txt`. `mutantRedOnTree` = 14/14 |
| C13 | PRECHECK-REMOVAL (the C-R466-01 row) | Read C4's `mutant-M14-NO-PRECHECK.log`. Independently: in a second fresh copy `c-round-467/tree-del`, **delete** the 3 pre-check lines (not `if (false)`), then run `store-teal-sweep.test.ts` | Both are red on **TS8** (`× TS8`), and TS1–TS7 stay green. Green here means C-R466-01 is still open: FAIL |
| C5 | CORPUS | In `tree-mut`, after C4: place `b-round-465/compare.test.ts.txt` as `app/lib/__tests__/b466/compare.test.ts` and HEAD's `style-scan.ts` (`git show 6d321c7:…`) as `helpers/style-scan-head.ts`. Run it with `B466_OUT=<abs c-round-467/data/head-vs-sketch-counts.txt>` | `cmp`-equal to `b-round-466/data/head-vs-sketch-counts.txt`: 657 files, diff 1 [K11] |
| C6 | GLOW-COMPUTED (browser, Chromium) | From `store/`: `node <abs>/b-round-465/probe/glow-computed.mjs <abs c-round-467/glow-computed.json>`. TS7 is unchanged, so the probe is unchanged. Add your own cases built from the TS7 source strings: `0pt 0 8px red`, and the concat row evaluated with `radius = 8` | `allOk true`, 22 rows, `cmp`-equal to `b-round-465/probe/glow-computed.json`. Your extra cases read offsets 0 and blur > 0 |
| C7 | BUILD vs HEAD | Fresh copies `c-round-467/head` (`git archive 6d321c7` plus the `node_modules` symlink only) and `c-round-467/tree-build` (copy recipe). Run `npm run build` in each, then `bash b-round-465/build-compare.sh <head> <tree-build>`. Never build `tree-mut` | `differing lines: 0` over 180 files [K10] |
| C8 | AUTH + SMOKE (browser, 1440×900 and 1280×720) | Fresh anonymous context, after one untimed warm-up load (L38). Open `/studio-lab`, wait for `Demo collection ready`, then add a library item with Enter. Open `/studio/middle-east`. Call `GET /api/studio-token?product=middle-east&file=stem.mp3` without auth | `auth_user` is null and the clip count rises. The product route shows "Sign in required" and 0 `audio[src]`. The token API returns 401. The fake-bearer path is BLOCKED (backend unavailable in cloud) |
| C9 | DOCS | Docs 304 and 299 | Line 4 of each is exactly `**სტატუსი:** Completed (C round 467 PASS)`. Doc 304 has TEMPLATE's 7 `## ` headings in order. It names C-R466-01 and the 3 target ids. Every test row id the doc cites (TS1, TS3, TS6, TS7, TS8) exists as an `it('TS…:` row in the test file (L26). `grep -nE '[a-z]-\[|\[[a-z-]+:'` on doc 304 gives 0 hits. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. `a-round-467/tw-doc-leak.txt` says `cssEqual true`. B ran these checks on the post-image: `b-round-466/precheck-doc-rows.txt` |
| C10 | TYPECHECK / LINT | `npm run typecheck`; `npx biome check` on the 2 test files | rc 0 and rc 0 |
| C11 | CLAIMS | `bash b-round-466/claims-467.sh` | Matches `b-round-466/claims-467-planning-output.txt`, except the differences listed in `b-round-466/claims-467-expected-after-A.txt`. No `MISSING` |
| C12 | SOURCE-SCOPE (end) + L57 | As C1; then `l57-check` | Same as C1; rc 0 |
| gate | Full suite / verify | Root gate | Not claimed in `passed` |

**What could break nearby:**
- TS3 and the GS/LT rows use the same counter [K19]. `style-scan.ts` is unchanged this round, and C3/C5 cover them.
- The spy patches a global prototype for the duration of one synchronous test. C3 shows that the other covering files still pass in the same run.

## 4. Claims
The script is `b-round-466/claims-467.sh`. B's run at planning is in `b-round-466/claims-467-planning-output.txt`; its stderr, `claims-467-planning.err`, is empty.

| Claim | What it checks |
|---|---|
| K1 | Gate 466 |
| K2 | HEAD and status lines |
| K3 | r465 manifest FAILED paths; protected rc |
| K4 | Round-466 post-image hashes |
| K5 | The sketch-467 sha, its file count, and that it applies |
| K6 | The TS8 title |
| K7 | The pre-check line and `countWhole`'s `matchAll` |
| K8 | B's pre-check artifacts exist |
| K9 | The mutant summary, including M14 |
| K10 | Build compare |
| K11 | Corpus compare, and its equality with round 465 |
| K12 | Line 4 of docs 299 and 304 |
| K13 | The archived round-466 task |
| K14 | `regression-last.json` |
| K15 | Backlog version and last D-ID (D-29z1646) |
| K16 | Doc leak |
| K17 | Covering runs ×3 |
| K18 | Typecheck and Biome logs |
| K19 | The `countZeroOffsetGlowHits` importers in `app/**` and `perf/**` |
| K20 | `tools/l58-check.py` on this task (the sketch review names the sha) |

## 5. After this round (D-29z1646)
1. **Next planning dated 2026-11-13 or later:** REGRESSION-2026-11-13. It carries every `scope_additions` entry (L6).
2. **On C PASS here,** the following close:
   - C-R466-01, A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC and GATE452-L1-GLOW-REGEX-WHOLE-SOURCE;
   - the STORE-2b-3c-2b code stage.

   STORE-2b stays open on 2b-4's rows inside STORE-3 and STORE-4. Root may then run the first DP-GATE review.
3. **Then:** STORE-2c, STORE-2d, STORE-3, STORE-4, STORE-5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule. SYS-R465-DEAD-CSS-MATCHER runs at its trigger. The next RETRO is round 480.
