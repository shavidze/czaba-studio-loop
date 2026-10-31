# A round 281: PERF-HARNESS-DIAG-281 (test-only)

**Baseline:** HEAD `145f6c1`, clean tree at start. No commit, push or deploy. No app source, budgets, config, `.claude`, protected or frozen file touched.
**Evidence folder:** `tmp/studio-real-loop/a-round-281/`.

## Pre-flight (stated before coding)
- Assumptions: the task is B's measured v2 sketch; no app change; the proof is the real perf run, the equivalence checks and the named mutants.
- Smallest version: `b-round-280/sketch.diff` applied unchanged (5 perf files) plus the §5 doc sections.
- Success: typecheck rc 0; perf `3 passed`; 3 equivalence checks with 0 problems; each mutant gives its §6.2 signal; claims output unchanged.
- Primitives read: AGENT_DISCOVERABLE_CODE, ERROR_TAXONOMY, GEORGIAN_DOCS, TESTING_QUALITY_GATES and BUG_HUNTING_TESTS (regression-acceptance rule and checklists read; their service/.NET sections do not apply to a perf harness; the fail-before/pass-after rule is met by HEAD-CONTROL vs the mutants), `.claude/skills/pre-flight`; lessons L11/L23/L28/L30/L34/L38.

## Changed files (all within §5 grants)
| File | Change |
|---|---|
| `perf/lib/app-labels.ts` | `countedTemplatePattern` (private), `perfCollectionFailedPattern`, `perfCollectionSettledPattern` after `perfCollectionReadyPattern` |
| `perf/lib/page.ts` | import block; `waitForCollectionReady` body; `LibraryReadyState` + `waitForLibraryReady` before `waitForPlaybackSettled` |
| `perf/studio-lab.perf.spec.ts` | import; `measureLoad` uses `waitForLibraryReady` |
| `perf/studio-lab-interactions.perf.spec.ts` | import; `measureLoadReady`; `EmptyLanePoint`; `emptyLanePointAfterClip` guards/texts/return; click-live detail `clipTrackId`, `emptyLaneTrackId` |
| `perf/studio-lab-resources.perf.spec.ts` | import; `measureLoadReady` body → `await waitForLibraryReady(page);` |
| `docs/.../210-perf-harness-load-diagnostics.md` | **new**; testing section holds the measured numbers below; l.4 `**სტატუსი:** Completed (C round 281 PASS)`; 7 TEMPLATE headings |
| docs 168 | `### Liveness-ის წესები` click-live row (two keys) + l.253 b-ii TODO bullet |
| docs 169 | `## მიდგომა` first intro bullet (ready wait now shared) + one new TODO bullet (B-R281-RESOURCES-READY-FAILED) |
| docs 175 | helper map (changed `waitForCollectionReady` row, new `LibraryReadyState`/`waitForLibraryReady` row, pattern paragraph under the table) + GATE214-S2 section + one new TODO bullet |
| docs 208 | l.88 TODO bullet only |
| docs 209 | l.87 TODO bullet only |

**Code vs sketch:** the `+`/`-` lines of `git diff -- perf` are byte-identical to `b-round-280/sketch.diff` (`diff` of the two line sets: IDENTICAL). No rename, reorder or reformat. `a-round-281/a-code.diff` is the exact code diff used by the mutants.

**Doc 175 note for HUNK-SCOPE:** the paragraph under the helper-map table (`perfCollectionReadyPattern` …) is inside the granted section `### Helper-ების რუკა`; I added the two new patterns there.

## Commands and results (actually run)
| Step | Command | Result |
|---|---|---|
| TYPECHECK | `npm run typecheck` | rc 0 |
| LINT | `npm run lint` (app only, L30) | rc 0; 205 warnings, 1 info, 0 errors (pre-existing; perf is outside Biome) |
| PERF-RUN | `CI=true npx playwright test --config playwright.perf.config.ts`, alone (L38; it builds and serves its own :5188; the :5173 dev server was left running, idle) | **3 passed (13.4m)**: PERF-1b-i 5.1 min, PERF-1b-ii 1.1 min, PERF-1a 7.0 min. Log `a-round-281/perf-run.log`, reports `a-round-281/results/` |
| EQUIV 1a | `equiv-check.py c-round-279/results-1/latest.json <new>` | rc 0; rows 316, deterministic 166, **problems 0** |
| EQUIV 1b-i | `equiv-check.py c-round-279/results-1/latest-interactions.json <new>` | rc 0; rows 144, deterministic 106, **problems 0** |
| EQUIV 1b-ii | `equiv-check-b2.py c-round-280/run-1/latest-resources.json <new> --tol …` | rc 0; rows 61, deterministic 37, **problems 0, tolerated 1** (`res.export.1.peak-backing-delta-mib` 65 → 65.1, a named `--tol` row) |
| DETAIL-LANE (1) | python over `results/latest-interactions.json` | PASS: 6/6 samples (3 × click-live, 3 × click-live.6x) keys `faderEnabledAfterAdd, faderDisabledBeforeClick, faderEnabledAfterClick, clipTrackId, emptyLaneTrackId`; values `music` / `stems`. Report `complete: true`, `failures []`, 6 passes with no `abortedAt`, no problems, 0 pageErrors (`detail-lane.txt`) |
| Frozen list | `sha256sum -c b-round-280-r281-tree-sha256.txt` | rc 0 (`frozen-check.txt`) |
| Claims | `claims.sh` on a fresh `git archive 145f6c1` copy | identical to `claims-output-at-145f6c1.txt` except K1, which prints `(archive)` because the archive is not a git repo; K1 in the repo = `145f6c1` (`claims-output-archive.txt`) |
| K17 on A's tree | `grep -rn "polling: 'raf', timeout: 90000" perf` | 1 line, `perf/lib/page.ts:151` |
| SW-A/SW-D on A's tree | grep of the new names in `app perf e2e docs` | only the 5 granted code files and the 6 granted docs (`sweep.txt`) |

## Mutants (§6.2), each run alone with `b-round-280/scripts/run-mutant.sh <ID> 145f6c1 a-round-281/a-code.diff a-round-281/mutants` (PERF-1a only)
The MU-STATUS-WAIT sed matched without changes (the in-page line is the sketch's exact line; mutant.diff 23 lines).
| Id | Result | Signal met? |
|---|---|---|
| MU-FAILED-SOURCE | `1 failed`; 6/6 passes `abortedAt` = `load`, exactly 1 problem: `aborted at load: demo collection failed before the library was ready: 1 sound in the demo collection failed to load — details are in the library.`; `durationMs` 9206 (HEAD control: 90 s per pass) | yes |
| MU-FAILED-OTHER | `1 failed`; 6/6 passes `abortedAt` = `load`, exactly 1 problem; prefix fired = **library-ready** in all 6 (`… before the library was ready: 1 sound in the demo collection failed to load — details are in the library.`); `durationMs` 6716; no pass reached Add | yes |
| MU-STATUS-WAIT | `1 failed`; 6/6 passes `abortedAt` = `load`, exactly 1 problem: `aborted at load: after load: demo collection failed: 1 sound in the demo collection failed to load — details are in the library.`; `durationMs` 6969 | yes |
| MU-NO-OWN-GUARD | final tree copy, step-1 guard deleted, `npx tsc --noEmit -p .` → rc 2, `perf/studio-lab-interactions.perf.spec.ts(237,5): error TS2322: Type 'string \| null' is not assignable to type 'string'.`; line 237 is `clipTrackId: found.ownTrack,` | yes |

Summary: `a-round-281/mutants/summary.txt`; each mutant's `run.log`, `mutant.diff`, `latest.json`.

## Code review
`code-reviewer` subagent, actually run (read-only, no shell in its session; it reviewed the working-tree files). **Score 9/10. No Critical, High or Medium findings.**
| # | Sev | Finding | Action |
|---|---|---|---|
| 1 | Low | doc 210:36 said a `RegExp` cannot cross into the page. Playwright's serializer does carry it (`utilityScriptSerializers.js:203-204`); passing `.source` is still fine and matches `rangeLabelEnd.source` | **fixed in doc 210** (reason reworded; doc only) |
| 2 | Low | `app-labels.ts:55-57` `perfCollectionSettledPattern` joins two sources with `\|`; correct today (ready source has no top-level `\|`, failed source is wrapped in `(?:…)`), but would silently lose the `^` on a later ready-copy alternation. Suggest `(?:ready)\|(?:failed)` | **not changed**: code is byte-identical to B's measured sketch; any code edit invalidates EQUIV/mutants. Signal for B: **A-R281-REVIEW-SETTLED-GROUP** (Low) |
| 3 | Low | `page.ts:120-127` re-reads `textContent()` after `toHaveText`; the shared aria-live status could change in between and give a misleading "not ready" text; `toHaveText` normalises whitespace, `.test` does not | not changed (very small chance at load). Signal: **A-R281-REVIEW-STATUS-REREAD** (Low) |
| 4 | Info | `page.ts:140` failed is checked before ready in the same frame; for 1b-ii a non-selected source failure is timing-dependent | already B-R281-RESOURCES-READY-FAILED |
| 5 | Info | doc 175 TODO said "both load waits" stop a failed source; true only for 1a/1b-i | **fixed in doc 175** (1b-ii has only the library-ready wait) |
| 6 | Info | `page.ts:153` `waitForFunction` handle not disposed; bounded by `context.close()` per pass | not changed; info |

After the two doc fixes: `git diff -- perf` is still identical to `a-round-281/a-code.diff`, and the frozen check is still rc 0.

**Architecture note (for B/root, not an in-round task):**
- `perf/lib/page.ts:135-159`: shared timing helpers now also hold Studio-specific readiness checks (status testid, preview-wave `rect`, Add by text). Reviewer: **keep** (3 copies became 1; narrow signature).
- `perf/lib/app-labels.ts:13-57`: pattern builders accumulate (`escapeRegExp`, `splitAtSentinel`, `countedTemplatePattern`). Reviewer: **keep**; already tracked as GATE279-ARCH-COPY-STRINGS.

## Not run by A (gate or C rows)
Full vitest, build as a gate row, `npm run verify`, `test:e2e:smoke` (gate). DETAIL-LANE (2) browser probe and G281-AUTH (C rows); I did not run them.

## B acceptance status (A's view; C decides)
- §6.1 items 1–5: done, results above.
- STOP conditions (§10): none hit. Lanes `music`/`stems`; no deterministic EQUIV difference; every mutant gave its signal; nothing needed outside §5.

## Known gaps / signals for B
- A-R281-REVIEW-SETTLED-GROUP and A-R281-REVIEW-STATUS-REREAD (Low, from the review; not fixed to keep the code identical to the measured sketch).
- C on an archive copy: claims.sh K1 prints `(archive)`; check K1 with `git rev-parse` in the repo.
- B-R281-RESOURCES-READY-FAILED (Low signal, unchanged): PERF-1b-ii has no status wait, so a failed non-selected source can still let it measure.
- In this run MU-FAILED-OTHER was caught by the library-ready wait in 6/6 passes (as in B's run), so the status-wait branch is proven only by MU-STATUS-WAIT.
- ROOT-REQ-PERF-TIMEOUT stays open: PERF-1a took 7.0 min (47 % of the 15 min limit).

## Next C checks (exact)
SOURCE-SCOPE (`sha256sum -c`, `git status`: 10 M + 1 ??), HUNK-SCOPE (code = sketch byte-identical; doc hunks per §5), CLAIMS (archive copy; K1 prints `(archive)` outside git), SWEEP, TYPECHECK, PERF-RUN alone, EQUIV ×3, DETAIL-LANE (1) and (2), FAILED-SOURCE, FAILED-OTHER (record the prefix), STATUS-WAIT, NO-OWN-GUARD, HEAD-CONTROL, G281-AUTH at both viewports (warm `/studio-lab` once first, L38), DOC-210.

## Scope completed
Round 281 implementation and A-side checks only. The backlog is not complete; PERF-HARNESS-DIAG-281 is ready for C.
