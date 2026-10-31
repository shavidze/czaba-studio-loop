# C round 295 — SYS-VACUOUS-ROWS (independent verification)

**Verdict: PASS.** 9 of 9 C rows pass. `browserVerified` = `realVerified` = true. 1 info finding (origin B). The full suite, build, Biome, `verify` and `test:e2e:smoke` are gate rows.

Tree: HEAD `bc85a1a`. A's working-tree diff is 7 modified files plus 1 new doc. All evidence is under `c-round-295/`.

## A's STOP (K6, K10): ruled as a B spec omission, not an A defect
A wrote "STOP — needs B ruling" because two CLAIMS deltas are missing from §6's allowed list. None of the six §8 STOP conditions fired, and the change is fully applied, so L22 (short round) does not apply. C traced both deltas:
- **K6** (`TempoRow imported by self-disabling-focus` 0 → 1) is the import that §3.2 grants. §6 left it off the allowed list.
- **K10** (readers become `perf/lib/report.test.ts perf/lib/report.ts`): the extra hit in `report.test.ts` is the LOAF1 row title `'LOAF1: harness.loaf-scripts with $label'`. That title is verbatim in B's own sketch (`b-round-294/sketch-sys-vacuous-rows.diff` l.192). The problem string itself now lives only in `report.ts` l.53, and the spec no longer holds it.

Both deltas come from B's task and sketch. A applied the sketch byte-for-byte. Recorded as **C-R295-INFO-01** (origin B, info). CLAIMS is reported as "row text unsatisfiable as written; every delta traced to §3.2 and the sketch". The verdict does not change.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **PASS** (with C-R295-INFO-01). C's run equals A's after-file. Deltas: K2 8; K3 rc 1; K6 1 (the §3.2 import, see above); K7 1; K8 `spec check l.` empty, scriptCount 7, loafScriptsProblem 5; K9 DW12 2 / SD10 1 / LOAF1 1, each in its granted file only; K10 report.ts (constant) + report.test.ts (row title only), spec 0; K13 grew (dsw 334, sdf 754, cev 1075, instr 266, report 189, rtest 430, spec 780); K14 1. K1, K4, K5, K11, K12, K15 identical. | `c-round-295/claims-after.txt` |
| SOURCE-SCOPE | **PASS.** `git status`: exactly the 8 §4 paths. `sha256sum -c` fails on exactly the 7 modified paths (1,155 OK, all 7 protected files OK). No non-test `app/` file differs. The 7 modified files are `cmp`-equal to a `git archive HEAD` + B's sketch. | `c-round-295/sha-fail.txt` |
| TYPECHECK | **PASS.** `npm run typecheck` rc 0 (18 s). | `c-round-295/typecheck.log` |
| UNIT | **PASS.** 4 files, 85/85. DW12 (4 cases), DW12b, SD10 (2 cases) and ZQ3 pass by name. Slowest test 1,134 ms against the 5,000 ms default (23 %); none above 50 %. | `c-round-295/unit-cover.log` |
| UNIT-PERF | **PASS.** Scratch copy (`/tmp/c295-rev/tree`, a `git archive HEAD` + the sketch, `node_modules` symlinked) with `vitest.perf-scratch.config.ts` (`include: ['perf/**/*.test.ts']`): 23/23, including the 4 LOAF1 cases. The config was never placed in `store/`. | `c-round-295/unit-perf.log` |
| UNIT-MUTANTS | **PASS.** (a) `window.clearTimeout(stallTimer);` deleted → DW12 ×4 and DW12b red (5 failed, 12 passed: DW1–DW11 stay green, confirming the old rows' vacuity). (b) `onClick={onMetronomeToggle}` → SD10 "without a tempo" red, SD10 "with a tempo" green; **control:** UI12 green. (c) both `<polyline points=` → `<line data-points=` → ZQ3 red at l.1055 `toBeTruthy`; **control:** HEAD's `clip-envelope-ui.test.tsx` (without the new line) under the same mutant keeps ZQ3 green. (d) `> 0` → `>= 0` → LOAF1 "all empty" and "no field" red, other 2 green (2 failed, 21 passed). After each mutant the file was restored and `cmp`-checked against `store/`; the final 7-file `cmp` is empty. | `c-round-295/mut-a.log`, `mut-b.log`, `mut-c.log`, `mut-c-control.log`, `mut-d.log` |
| B-LOAF-REAL | **PASS.** Real Chromium, fresh contexts, a raw buffered `long-animation-frame` observer, one untimed warm-up load first (L38). 1440×900: 5 entries, 4 with scripts, 1 with `scripts: []`, 0 without the field, max script 63 ms. 1280×720: 6 entries, 5 with scripts, 1 empty, 0 without the field, max 55 ms. No observer error. | `c-round-295/c295.json`, `c295.cjs`, `shots/loaf-*.png` |
| B-PERF-LOAF | **PASS.** `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts` on A's tree, run alone (nothing else running): rc 0, 1 passed (7.0 min), `complete: true`, `failures: []`. **0** `harness.loaf-scripts` in the log and in `latest.json`. All 6 passes (rates 1 and 6, 3 each) have `problems: []`, so there was no `observer unavailable` either. `load.script-max` samples [56, 48, 51], median 51 > 0, assert < 100 PASS. The stricter check needs some entry with `scriptCount > 0`. It passing in all 6 passes shows that the inline `scriptCount` spread runs in-page after `addInitScript` serialisation. That closes the code-reviewer's M2 gap in the browser. 0 FAIL rows in the log. | `c-round-295/perf-run.log`, `perf-latest.json` |
| G295-AUTH | **PASS.** Fresh context, no credentials. `/studio-lab` at 1440×900 renders the workspace with the "Demo collection — no sign-in required" badge. `auth_user` is null; the only localStorage key is `czaba_session_id`. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` and 0 `audio`. `/api/studio-token` returns GET 401 and POST 405, with no token in either body. Premium auth is not bypassed. | `c-round-295/c295.json`, `shots/auth-lab-1440.png`, `shots/auth-legacy-1440.png` |
| DOC-219 | **PASS.** l.4 is exactly `**სტატუსი:** Completed (C round 295 PASS)`. The 7 TEMPLATE `## ` headings appear in order. All 7 changed files are listed. There is one Problem → Solution entry for each of C-R283-01, A-R278-REVIEW-METRONOME-SPY, A-R284-REVIEW-ZQ3-VACUITY and A-R283-REVIEW-LOAF-SCRIPTS. The TODO cites ROOT-REQ-VITEST-PERF-INCLUDE. Every cited id exists: backlog hits are 5/6/7/6/10/5/20, L52 is in `lessons.md`, and row ids DW1/DW11/DW12/DW12b/SD10/UI12/ZQ3/LOAF1 are in their test files. | grep in this report's session |
| gate | gate | Full suite, `npm run build`, Biome, `verify` and `test:e2e:smoke` are root's rows. LOAF1 is **not** gate-covered until ROOT-REQ-VITEST-PERF-INCLUDE lands. |

## Findings
- **C-R295-INFO-01** (info, origin B): §6 CLAIMS lists the allowed deltas but omits K6 (0 → 1, the §3.2 import) and the K10 row-title hit in `perf/lib/report.test.ts` that B's own sketch introduces. A raised a STOP on this. Next time, generate the allowed-delta list by running the claims script on the scratch copy where the sketch is applied (L29/L56).
- Code-reviewer M1 (LOAF1 not gate-run) stays open as ROOT-REQ-VITEST-PERF-INCLUDE (root). M2 (no unit row for the in-page `scriptCount` spread) is covered by B-PERF-LOAF in the browser, as above.

## Conformity (§7)
- **CZABA requirement:** met. Each of the four rows now fails when its named behaviour breaks (mutants a–d), and both vacuity controls show that the old rows could not fail.
- **Ableton conformity:** not applicable (test and harness round). Reference-first, product-designer and screen budget are out of scope; no app runtime file changed.

## Side effects
- `store/build/` and `store/test-results/` were written by the perf harness (both git-ignored). `git status` still shows only the 8 §4 paths.
- The scratch copy `/tmp/c295-rev` is outside the repo. No source edits, commits or pushes.
