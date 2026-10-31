STOP — needs B ruling on §6 CLAIMS: K6 (0→1, the §3.2 import) and K10 (`perf/lib/report.test.ts` matches the LOAF1 row title from B's sketch) differ, but neither is in §6's list of allowed deltas. Every other §5 check passed. The tree is at its final, consistent state: exactly the 8 §4 paths. Nothing else changed after this was noticed.

# A round 295 — SYS-VACUOUS-ROWS

All §5 checks ran. The results are below.

**Extra verification:**
- `sha256sum -c` on the frozen list fails on exactly the 7 modified §4 paths.
- `grep -rln 'DW12\|SD10\|LOAF1' app perf e2e` returns only the 3 granted test files.
- L52, which doc 219 cites, exists at `lessons.md` l.37.

## Scope completed
- I applied B's sketch exactly: `patch -p0 < ../tmp/studio-real-loop/b-round-294/sketch-sys-vacuous-rows.diff`, after a clean dry run. The 7 patched files contain only the sketch hunks.
- New doc: `docs/implementation/2026/quarter-IV/219-sys-vacuous-rows.md`.
  - l.4 is `**სტატუსი:** Completed (C round 295 PASS)` (L28).
  - The 7 TEMPLATE headings appear in order.
  - It lists the 7 changed files, with one Problem → Solution entry per Low id, and has the ROOT-REQ-VITEST-PERF-INCLUDE TODO.
  - Every cited id exists. Each backlog id has at least 2 hits in `backlog.json`, and each row id appears in its test file.
- No app runtime file, protected file or frozen file changed. No commit and no push.

## Changed files (8, exactly the §4 grants)
- `app/lib/arrangement/__tests__/demo-synth-worker.test.ts`: DW12 (4 cases) and DW12b.
- `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx`: the import and SD10 (2 cases).
- `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx`: ZQ3 `expect(before).toBeTruthy();` at l.1055.
- `perf/lib/instrumentation.ts`: `scriptCount?` and the inline spread.
- `perf/lib/report.ts`: the type import, `LOAF_SCRIPTS_PROBLEM` and `loafScriptsProblem`.
- `perf/lib/report.test.ts`: the imports and LOAF1 (4 cases).
- `perf/studio-lab.perf.spec.ts`: the multi-line import and the check, now at l.539.
- `docs/implementation/2026/quarter-IV/219-sys-vacuous-rows.md`: new.

## Claims
- **Before editing:** the output equals `b-round-294/claims-295-output.txt`; `diff` is empty. Saved as `a-round-295/a295-claims-before.txt`.
- **After editing:** saved as `a-round-295/a295-claims-after.txt`. The deltas:

  | Claim | After |
  |---|---|
  | K2 | 8 lines |
  | K3 | rc 1 (the 7 modified paths) |
  | K6 | TempoRow imported by self-disabling-focus: 0 → **1** |
  | K7 | toBeTruthy 1 |
  | K8 | `spec check l.` empty; scriptCount 7; loafScriptsProblem 5 |
  | K9 | DW12 2; SD10 1; LOAF1 1 (each in its granted file) |
  | K10 | `perf/lib/report.test.ts perf/lib/report.ts` |
  | K13 | dsw 334, sdf 754, cev 1075, instr 266, report 189, rtest 430, spec 780 |
  | K14 | 1 |

  Every other K line is identical.
- **The STOP at the top (for B to rule on):** these are the details. The code is not affected.
  - (1) The CLAIMS row does not list K6, yet its 0 → 1 is the intended §3.2 import.
  - (2) K10 also lists `perf/lib/report.test.ts`. That hit is the LOAF1 row title, `'LOAF1: harness.loaf-scripts with $label'`, verbatim from B's sketch. It is not a second copy of the problem string. The spec no longer holds the string.

## Checks run
- `npm run typecheck`: rc 0. This covers `perf/**`.
- `npm run lint`: rc 0, with 205 warnings and 1 info project-wide. The scoped Biome runs below found nothing in the changed files.
- `npx biome check` on the 3 app test files: rc 0, no fixes, no new ignore.
- The 4 perf files in the scratch copy, with `files` removed from `biome.json`: `npx biome check` rc 0.
- **Covering set** (`npx vitest run` on the 4 files):
  - 4 files, **85 passed** of 85, 9.81 s wall time.
  - DW12 (4 cases), DW12b and SD10 (2 cases) are present by name. ZQ3 passes in 113 ms.
  - The slowest test took 1012 ms against the default 5000 ms timeout (20 %). No test is above 50 % of its timeout.
  - Log: `a-round-295/a295-cover.log`.
- **LOAF1:** run in the scratch copy `/tmp/a295-scratch` (a `git archive HEAD` plus A's diff, with `node_modules` symlinked).
  - Config: `vitest.perf-scratch.config.ts` with `include: ['perf/**/*.test.ts']`.
  - Result: **23 passed**, the 4 LOAF1 cases included, in 285 ms. Log: `a295-loaf1.log`.
  - That config was never placed in `store/`.

## Mutants (scratch copy only)
Each mutant was restored afterwards and `cmp`-checked against `store/`.

| Mutant | Result |
|---|---|
| (a) delete `window.clearTimeout(stallTimer);` | DW12 (4 cases) and DW12b are **red**: 5 failed, 12 passed. DW1–DW11 stay green. Log: `a295-mut-a.log` |
| (b) `onClick={onMetronomeToggle}` | SD10 "without a tempo" is **red**; SD10 "with a tempo" stays green. **Vacuity control:** UI12 stays green. Log: `a295-mut-b.log` |
| (c) both `<polyline points=…>` → `<line data-points=…>` | ZQ3 is **red** at l.1055 `toBeTruthy`. **Vacuity control:** HEAD's ZQ3, without the new line, stays **green** under the same mutant. Logs: `a295-mut-c.log`, `a295-mut-c-control.log` |
| (d) `> 0` → `>= 0` | LOAF1 "all empty" and "no field" are **red**; "no entries" and the positive case stay green (2 failed, 21 passed). Log: `a295-mut-d.log` |

After all restores, the 7 patched files in the scratch copy are `cmp`-equal to `store/`.

## Code review (the real `code-reviewer` subagent, required because 8 paths changed)
Score 8/10. No Critical and no High findings.

| Finding | Severity | Content | Handling |
|---|---|---|---|
| M1 | Medium | The gate does not run LOAF1, because `vitest.config.ts` includes `app/**` only. | Already known as ROOT-REQ-VITEST-PERF-INCLUDE (task §3.4). `vitest.config.ts` is frozen, so this is not fixable in this round. For B/root. |
| M2 | Medium | No unit row covers the observer-side `scriptCount` spread, because LOAF1 builds the entries by hand. | **Addressed in the doc:** a testing bullet now says that only B-PERF-LOAF catches a removed spread. A unit test would need to run `installPerfInstrumentation` in a page, which is impossible from unit tests because of the `addInitScript` serialisation. Covered by C's real-browser rows. |
| L1 | Low | The stricter check could fire falsely on a fast machine, since Chromium attributes only scripts over about 5 ms. | This is C's B-LOAF-REAL / B-PERF-LOAF row. B's probe found ≥ 1 entry with scripts at both viewports. |
| L2 | Low | The doc's status runs ahead of C. | Required by L28. C checks the string; `c-round-295.json` is the source of truth. |
| L3 | Low | DW12's `getTimerCount() === 1` is exact-count brittle. | Kept: the 1 → 0 change is what kills mutant (a). Noted. |
| L4 | Low | ZQ3 could also check the shape of `points`. | Not done: §3.3 grants exactly one line. Optional follow-up for B. |

**Architecture note (for B):** none needed. Keep `loafScriptsProblem` in `report.ts`. Reconsider extracting a `harness-guards.ts` only if 3 or more harness guards accumulate there.

## Not run by A (C or gate rows)
- B-LOAF-REAL
- B-PERF-LOAF (perf harness, about 7 minutes, run alone)
- G295-AUTH
- `npm run build`, the full suite, `verify` and `test:e2e:smoke` (gate rows)

## Known gaps
- The gate does not run LOAF1 until ROOT-REQ-VITEST-PERF-INCLUDE lands.
- No unit row covers the observer-side `scriptCount`. That relies on B-PERF-LOAF.
- A has not checked the stricter LoAF check in real Chromium.

## Exact next C checks
1. CLAIMS, once B has ruled on the K6 and K10 STOP at the top.
2. SOURCE-SCOPE: the union is the 8 §4 paths, and no non-test `app/` file differs.
3. UNIT: 85/85.
4. UNIT-PERF: 23/23 through a scratch config.
5. UNIT-MUTANTS (a)–(d), plus the UI12 and HEAD-ZQ3 controls.
6. B-LOAF-REAL at 1440×900 and 1280×720.
7. B-PERF-LOAF, run alone:
   - 0 `harness.loaf-scripts` problems;
   - `load.script-max` present in all 3 passes;
   - `observerErrors` empty, which shows that `installPerfInstrumentation` still serialises.
8. G295-AUTH.
9. DOC-219.

## B acceptance criteria A truly passed
Of the rows A can run: CLAIMS (with the INFO above), SOURCE-SCOPE (by `git status`), TYPECHECK, UNIT, UNIT-PERF and UNIT-MUTANTS (including both controls). The browser rows, DOC-219 and the gate are left to C and root.
