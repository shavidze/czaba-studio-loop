# Round 295: SYS-VACUOUS-ROWS. Give four test rows that cannot fail a mutant that makes them fail

**Planned by:** B, at the round 294 → 295 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z738:** round 294 is **C PASS** (9 of 9 rows, `browserVerified` and `realVerified` both true), and gate 294 **published** `bc85a1a` on both remotes. FIX-PD-1c, 1c2 and 1c3 are **მზადაა**.
- **D-29z739:** rulings on the gate-294 reviewer's Lows and on C's Low (§2).
- **D-29z740:** the gate-294 Architecture note is merged into signal A-R293-ARCH-SILENCE-ALL.
- **D-29z741:** rulings on round 294's INFO items. Desk-sameness is now measured as 0 px against HEAD rendered in the same job.
- **D-29z742:** this round's scope.
- **D-29z743:** where the LoAF row lives (§3.4).
- **D-29z744:** the doc (new doc 219).
- **D-29z745:** the order after this round.

**Owner:** A. **Verifier:** C. **Grants:** §4 (8 paths).
- **Test and perf-harness code only.** No app runtime file changes: no component, context, route, hook or style.
- No Store, auth, cart, checkout, purchase or protected file is touched.

## Baseline: HEAD `bc85a1a` [K1], clean tree [K2]
- Gate 294 is `published`, with commit `bc85a1a` [K1]. `git status` is empty.
- **Frozen list:** `b-round-294-r295-tree-sha256.txt`, 1,162 entries hashed on the tree; `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-294/claims-295.sh` **before editing**. Its output must equal `b-round-294/claims-295-output.txt`. Any difference is a STOP (§8).
- **Publishing:** after C PASS and the gate, root publishes the 8 §4 paths.

## 0. Read first
1. `lessons.md` (every role), especially L11, L12, L23, L28, L29, L52 and L56.
2. This task.
3. B's sketch, pre-run on a scratch copy (`/tmp/b295-scratch`, a `git archive` of HEAD with `node_modules` symlinked; the store tree was not touched):
   - the full sketch: `b-round-294/sketch-sys-vacuous-rows.diff` (7 files). From `store/`, `patch -p0 --dry-run < ../tmp/studio-real-loop/b-round-294/sketch-sys-vacuous-rows.diff` applies cleanly on `bc85a1a`, and the patched files are `cmp`-equal to B's tested scratch copy. A may apply it with the same command without `--dry-run`. C may reverse-apply it (`patch -p0 -R`) to check SOURCE-SCOPE;
   - the app covering run: `b-round-294/sketch-tests.log`, 4 files and 85 tests passing;
   - the perf unit run: `b-round-294/sketch-perf-unit.log`, 23 tests passing through a scratch vitest config;
   - the mutants, each one red:
     - `b-round-294/mutant-stall-timer.log`
     - `b-round-294/mutant-metronome-wrapper.log`
     - `b-round-294/mutant-zq3-no-polyline.log`
     - `b-round-294/mutant-loaf-any-entry.log`
   - the real-browser LoAF probe: `b-round-294/probe/loaf.cjs` and `loaf-result.json`;
   - `tsc --noEmit` rc 0, and Biome clean on all 7 files (for the perf files, with the project rules but without `files.includes`, because `biome.json` lints `app/**` only).
4. A's primitives: `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` (the "a test must be able to fail" rule) and `GEORGIAN_DOCS.md`.

## 1. Why
`systemic_tasks` → SYS-VACUOUS-ROWS (D-29z716, RETRO 290). Four deferred Lows share one root cause: **a row that no mutant can make fail** (L52). This round fixes the whole class in one test-only round, as the retro policy asks:

| Low | Row today | Why it cannot fail |
|---|---|---|
| A-R278-REVIEW-METRONOME-SPY | `metronome-ui` UI12 | `toggleMetronome` returns early by itself when the tempo is null. Removing the button's `guardSoftDisabledClick` wrapper (`ArrangementTempoRow.tsx` l.291 [K6]) leaves UI12 green. B confirmed this: in `mutant-metronome-wrapper.log`, UI12 passes and only the new SD10 fails. |
| C-R283-01 | `demo-synth-worker` DW1–DW11 | Deleting `window.clearTimeout(stallTimer)` (`demo-synth.client.ts` l.60 [K5]) leaves 12 of 12 green. The stray timer later calls `finish(null)`, which terminates the worker a second time, and no row checks for that. |
| A-R283-REVIEW-LOAF-SCRIPTS | perf `harness.loaf-scripts` (`studio-lab.perf.spec.ts` l.534 [K8]) | `scriptMax` exists whenever `scripts` is an array, including an **empty** array (`reduce(..., 0)`). So a window whose LoAF entries all have `scripts: []` satisfies the check. B's real-Chromium probe: 1440×900 gave 4 entries (3 with scripts, 1 with `[]`); 1280×720 gave 2 entries (1 with scripts, 1 with `[]`). The empty case is real, and the stricter check is still satisfiable. |
| A-R284-REVIEW-ZQ3-VACUITY | `clip-envelope-ui` ZQ3 | `before` can be `undefined` when there is no polyline. Every per-zoom compare is then `undefined === undefined`. B confirmed this: HEAD's ZQ3 stays green when the envelope renders no `<polyline>` (`mutant-zq3-no-polyline.log`). |

## 2. Rulings on round 294 and gate 294 (L10)
| Item | Ruling |
|---|---|
| Round 294 | **C PASS**, 9 of 9 rows. Gate 294 published `bc85a1a`. FIX-PD-1c, 1c2 and 1c3 are **მზადაა**, and F8 is closed. GATE293-T1, INFO-C293-DOC-L21 and A-R292-REVIEW-L-TH4-TITLE are closed. |
| A-R294-REVIEW-L-DOC-FILELIST (Low) | `deferred_low_polish`, in the bundle **DOC218-POLISH**. This round does not own doc 218. |
| Gate-294 finding 1: the narrow exit link is 71×20 px ("Low–Medium") | **Low**, ruled on a measurement. B measured `b-round-294/probe/tap-result.json` at 390×844 and 360×740: the link is 20 px tall, and the nearest other target is 158 px away. That meets the WCAG 2.5.8 spacing exception, so AA passes. Deferred, with the reviewer's Tailwind-only fix recorded. |
| Gate-294 findings 2, 4, 5 and 6 | Deferred as GATE294-R2, R4, R5 and R6. R4 and R6 are added to DOC218-POLISH. R2 is the same issue as signal A-R292-REVIEW-RENDER-REF. |
| Gate-294 finding 3 and its Architecture note (an explicit `stopPlayback` on the context) | Merged into signal A-R293-ARCH-SILENCE-ALL. Not scheduled: the context is frozen and nothing is broken today. |
| INFO-C294-DESK-BASELINE-DRIFT | **Adopted.** From now on, a desk-sameness row means **0 px against HEAD rendered in the same job** (a `git archive` on its own port, with its own `cacheDir`). |
| INFO-C294-STORE-NO-MAIN-LANDMARK | Added to the STORE-2 acceptance rows: `/` and `/store` each render exactly one `<main>`. |
| INFO-C294-TOKEN-POST-405-STACK | Added as a risk line to SRW-21-PLAN (the protected route). The loop does not edit that file. |

## 3. What A changes (exactly the hunks of `b-round-294/sketch-sys-vacuous-rows.diff`)

### 3.1 `app/lib/arrangement/__tests__/demo-synth-worker.test.ts`: append DW12 and DW12b (closes C-R283-01)
- **DW12** (`it.each`) covers 4 finish paths: a valid `complete`, a malformed message, `onerror` and `onmessageerror`. Each case runs with fake timers:
  1. Assert `vi.getTimerCount()` is 1 once the worker exists.
  2. Settle the worker through that path, then flush microtasks.
  3. Assert the promise resolved and `vi.getTimerCount()` is 0.
  4. Advance by `DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS + 1`.
  5. Assert `expectReleased(worker)`: `terminated` is still 1, and every handler is null.
- **DW12b** does the same for a throwing `postMessage`.
- Do not change DW1–DW11 or the helpers.

### 3.2 `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx`: SD10 (closes A-R278-REVIEW-METRONOME-SPY)
- Add one import: `import { ArrangementTempoRow } from '~/components/arrangement/ArrangementTempoRow';`.
- Append SD10 (`it.each`, 2 cases) at the end of the SYS-5 `describe`. It renders `ArrangementTempoRow` on its own, with no provider:
  - `onMetronomeToggle` is a `vi.fn()`;
  - every other prop is an inert stub, exactly as in the sketch.
- The two cases:
  - **No tempo:** `aria-disabled="true"`, a click calls the spy **0** times.
  - **Tempo 120:** no `aria-disabled`, the same click calls it **once**. This is the positive control: the click really reaches `onClick`.
- No other row changes.

### 3.3 `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx`: ZQ3 (closes A-R284-REVIEW-ZQ3-VACUITY)
- After l.1054 (`const before = …` [K7]), add exactly one line: `expect(before).toBeTruthy();`.

### 3.4 LoAF row (closes A-R283-REVIEW-LOAF-SCRIPTS; D-29z743)
- **`perf/lib/instrumentation.ts`:**
  - `PerfTimedEntry` gains `scriptCount?: number;`.
  - The observer gains one spread, inline, after the `scriptMax` spread: `...(scripts === null ? {} : { scriptCount: scripts.length }),`.
  - **Do not extract a helper or import anything into `installPerfInstrumentation`.** Playwright serialises it through `context.addInitScript(fn)`, so it runs in the page with no module scope, and an imported function would be `undefined` there.
- **`perf/lib/report.ts`:**
  - Add `import type { PerfTimedEntry } from './instrumentation';`, placed in sorted order before `./stats`.
  - Export `LOAF_SCRIPTS_PROBLEM`, the exact string used today.
  - Export `loafScriptsProblem(loafs: readonly PerfTimedEntry[]): string | null`. It returns `null` only if some entry has `(scriptCount ?? 0) > 0`.
- **`perf/studio-lab.perf.spec.ts`:**
  - Import `loafScriptsProblem`, using the sketch's multi-line import.
  - l.534–536 becomes: `const loafProblem = loafScriptsProblem(settled.loafs); if (loafProblem !== null) { result.problems.push(loafProblem); }`.
  - `scriptMaxes` and `load.script-max` stay unchanged.
- **`perf/lib/report.test.ts`:** import both exports, then append **LOAF1** (`it.each`, 4 cases):
  - no entries → problem;
  - all scripts arrays empty → problem;
  - no scripts field → problem;
  - one entry with a script beside an empty one → `null`.
- **The gate does not run LOAF1:** `vitest.config.ts` includes only `app/**` [K12] (ROOT-REQ-VITEST-PERF-INCLUDE, re-raised). A and C run it with a scratch config inside a scratch copy (§5). B does not call it gate-covered.

### 3.5 `docs/implementation/2026/quarter-IV/219-sys-vacuous-rows.md` (new; 219 is free [K14])
- Follow `TEMPLATE.md`, in Georgian with English technical terms:
  - status `Completed (C round 295 PASS)` (L28);
  - context: the four Lows and L52;
  - approach: one mutant per row, the inline LoAF rule and why;
  - the changed files (all 7);
  - one Problem → Solution entry per Low;
  - testing: the rows, the mutants, and the scratch config for LOAF1;
  - a TODO: the vitest include (ROOT-REQ-VITEST-PERF-INCLUDE).
- Cite only ids that exist (L26).

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/lib/arrangement/__tests__/demo-synth-worker.test.ts` | DW12 and DW12b appended (§3.1) |
| `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` | 1 import + SD10 (§3.2) |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | 1 line in ZQ3 (§3.3) |
| `perf/lib/instrumentation.ts` | the type field + 1 inline spread (§3.4) |
| `perf/lib/report.ts` | the type import, the constant and the function (§3.4) |
| `perf/lib/report.test.ts` | the imports + LOAF1 (§3.4) |
| `perf/studio-lab.perf.spec.ts` | the import + the l.534 check (§3.4) |
| `docs/implementation/2026/quarter-IV/219-sys-vacuous-rows.md` | new (§3.5) |

**Frozen:** every other entry of `b-round-294-r295-tree-sha256.txt`. That includes:
- all app source: `demo-synth.client.ts`, `ArrangementTempoRow.tsx`, `studio-soft-disabled.ts` and `ArrangementClipEnvelope.tsx` in particular;
- `metronome-ui.test.tsx`;
- `perf/lib/page.ts`, the other two perf specs and `budgets*.json`;
- `vitest.config.ts`, `biome.json`, `package.json` and the lock file;
- the 7 protected files [K4].

## 5. A's checks (speed rules)
- Claims before editing (equal output) and after (the §6 CLAIMS deltas).
- `npm run typecheck` (rc 0; this covers `perf/**`) and `npm run lint`.
- `npx biome check` on the 3 app test files: rc 0, with no new ignore.
- The 4 perf files are outside `biome.json`'s `files.includes`. Run Biome on them in the scratch copy with `files` removed from its `biome.json` (B's method): rc 0.
- **Covering set** (`npx vitest run`):
  - `demo-synth-worker.test.ts`
  - `self-disabling-focus.test.tsx`
  - `metronome-ui.test.tsx`
  - `clip-envelope-ui.test.tsx`

  Expected: 4 files and 85 tests, all passing (17 + 22 + 14 + 32). Report every test above 50 % of its timeout (L11).
- **LOAF1:** in a scratch copy, write `vitest.perf-scratch.config.ts` with `test.include: ['perf/**/*.test.ts']`, then run `npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts`. Expected: 23 tests passing. Never put that config in `store/`.
- **Mutants**, on a scratch copy only (never in `store/`). Each must turn its row red:
  - (a) Delete `window.clearTimeout(stallTimer);` → DW12 (4 cases) and DW12b fail.
  - (b) `onClick={guardSoftDisabledClick(onMetronomeToggle)}` becomes `onClick={onMetronomeToggle}` → SD10's no-tempo case fails.
  - (c) Change both envelope `<polyline points=…>` to `<line data-points=…>` in `ArrangementClipEnvelope.tsx` → ZQ3 fails on `toBeTruthy`.
  - (d) In `loafScriptsProblem`, change `> 0` to `>= 0` → LOAF1's "all empty" and "no field" cases fail.

  Restore after each mutant and `cmp` the file.
- **No perf harness run is required of A** (PERF-1a takes about 7 minutes; it is C's row). `npm run build` is a gate row.
- **code-reviewer:** the real subagent is **required**, because 8 paths change. Pass its Architecture note to B.

## 6. Acceptance (C)
Browser rows run in Playwright Chromium. Use fresh contexts with empty storage, and load each page once, untimed, first (L38).

| Row | What | Pass |
|---|---|---|
| CLAIMS | claims script on A's tree | Differences only in:<br>• K2: 8 lines;<br>• K3: rc 1, failing only on the 7 modified §4 paths;<br>• K7: toBeTruthy 1;<br>• K8: the `scriptMax !== undefined` check is gone (`spec check l.` empty), `scriptCount` > 0, `loafScriptsProblem` > 0;<br>• K9: DW12 ≥ 1, SD10 ≥ 1, LOAF1 ≥ 1, and each hit is in its granted file only;<br>• K10: `harness.loaf-scripts` readers become `perf/lib/report.ts` (the constant), and the spec no longer holds the string;<br>• K13: line counts grow;<br>• K14: 1.<br>Every other K line is identical. |
| SOURCE-SCOPE | `git status` + frozen list | The union is exactly the 8 §4 paths. `sha256sum -c` fails only on the 7 modified paths. The 7 protected files are unchanged. **No file under `app/` that is not a test differs.** |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | §5 covering set | 4 files and 85 tests pass. DW12 (4 cases), DW12b and SD10 (2 cases) are present by name, and ZQ3 passes. None is above 50 % of its timeout. |
| UNIT-PERF | LOAF1 through a scratch config (§5) | 23 tests pass, including the 4 LOAF1 cases |
| UNIT-MUTANTS | scratch copy | Mutants (a)–(d) each turn their named rows red. **Vacuity controls** (they prove the old rows could not fail): under mutant (b), UI12 stays green; under mutant (c), HEAD's ZQ3 (without the new line) stays green. The restore diff is empty. |
| B-LOAF-REAL (real browser) | `/studio-lab` at 1440×900 and 1280×720 | A raw `PerformanceObserver` (`long-animation-frame`, buffered) on a fresh load: ≥ 1 entry, and ≥ 1 entry with `scripts.length > 0`. Record the counts of entries with empty `scripts`. B's probe `b-round-294/probe/loaf.cjs` may be reused. |
| B-PERF-LOAF (real browser, harness) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts` on A's tree, once (L38: alone, with nothing else running) | The log and `test-results/perf/latest.json` contain **0** `harness.loaf-scripts` problems. The `load.script-max` row is present in all 3 passes at rate 1 with a median > 0. Any other failing row is reported with its HEAD comparison only if it reads LoAF or `scriptCount`. Otherwise it is a separate finding, not a FAIL of this round. |
| G295-AUTH | fresh context | `/studio-lab` loads anonymously at 1440×900 (the workspace and the demo badge), with `auth_user` null. `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`. |
| DOC-219 | doc | It exists. l.4 is `**სტატუსი:** Completed (C round 295 PASS)`. It lists the 7 changed files, has one Problem → Solution entry for each of the 4 Low ids, and has the vitest-include TODO. Every cited id exists. |
| gate | — | The full suite, build, Biome, `verify` and `test:e2e:smoke` are root's gate rows. |

**Not re-run:** every round-292–294 row. SOURCE-SCOPE proves that no app runtime file changed, so the Studio's behaviour is byte-identical to `bc85a1a`.

**Adjacent behaviour that could break:**
- the perf harness itself: the in-page serialisation of `installPerfInstrumentation` (B-PERF-LOAF; any perf spec would show `observerErrors`);
- a stricter LoAF check that falsely reports a problem in real Chromium (B-LOAF-REAL, B-PERF-LOAF);
- the existing DW, SD and ZQ rows (UNIT).

## 7. Ableton conformity (C reports separately)
- **CZABA requirement:** every listed row can fail, and fails when the behaviour it names breaks.
- **Ableton:** not applicable.
- **Reference-first** and **product-designer:** not in scope, because this is a test-only and harness round.
- **Screen budget:** not in scope, because no app runtime file changes.

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-295.md` and change nothing else if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- any mutant (a)–(d) leaves its row green;
- the change needs any path outside §4, or any app runtime file;
- Biome asks for a new ignore;
- the K9 sweep finds an existing DW12, SD10 or LOAF1 id anywhere before editing. (B already renamed a colliding `LS1` to `LOAF1`.)

## 9. Deliverables
- **A:** `a-round-295.md`, with:
  - the changed files;
  - the claims before and after;
  - the covering-run and LOAF1 counts and timings;
  - typecheck, lint and Biome (app and perf);
  - the 4 mutant results;
  - the reviewer's findings and its Architecture note.

  A STOP goes at the top.
- **C:** `c-round-295.md` and `c-round-295.json`, with evidence under `c-round-295/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`, and an `origin` for each finding.
- **Root:** publish the 8 paths after C PASS and the gate.

## 10. Claims (`b-round-294/claims-295.sh`; expected output `b-round-294/claims-295-output.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `bc85a1a`; gate 294 `published bc85a1a` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1162 lines, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | `demo-synth.client.ts`: `clearTimeout(stallTimer)` at l.60, the stall `setTimeout` at l.71 |
| K6 | the metronome guard at `ArrangementTempoRow.tsx` l.291; `self-disabling-focus` does not import `ArrangementTempoRow` yet (0) |
| K7 | ZQ3 `before` at l.1054; 0 `expect(before).toBeTruthy();` |
| K8 | the LoAF check at spec l.534; 0 `scriptCount` in `perf/lib`; 0 `loafScriptsProblem` in `perf` |
| K9 | SWEEP (L23) for the new ids in `app perf e2e`: DW12 0, SD10 0, LOAF1 0 |
| K10 | SWEEP: the only reader of `harness.loaf-scripts` is `perf/studio-lab.perf.spec.ts` |
| K11 | SWEEP: the importers of `perf/lib/report` are `page.ts`, `report.test.ts` and the three perf specs |
| K12 | the `vitest.config.ts` include is `app/**` only |
| K13 | line counts: dsw 294, sdf 714, cev 1074, instr 264, report 181, rtest 401, spec 774 |
| K14 | 0 quarter-IV docs start with 219 |
| K15 | B's artifacts exist |
