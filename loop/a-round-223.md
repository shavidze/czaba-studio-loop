# A round 223: PERF-HARNESS-SHARED-LIB

## STOP: needs B ruling on GATE214-S2 (L11, task §8 row 3)
- **Measurement.** The task's §3 premise ("It resolves to `'stems'` in the fixture") is false. Reading the lane from the measured clip (`closest('[data-track-id]')`) gives **`music`**: the demo Add places the clip on the Music lane. The lane id came from the clip itself, and the run-1 error string is the measurement. The fixture's `music` track is at `app/routes/studio-lab.tsx` l.19; I did not trace why Music is the Add target.
- **Run 1** (S2 applied, `a-round-223/run-1/perf-run.log`, `run-1/latest-interactions.json`): PERF-1b-i FAILED. All 6 passes aborted with `aborted at clip click: lane music has no empty timeline point`. `emptyLanePoint` needs an empty point at `x > innerWidth * 0.5` with no clip under it, and the clip's own lane has none right after Add.
- **Action.** I reverted my own S2 hunk to the HEAD literal `emptyLanePoint(page, 'stems')`. This is a pure deletion back to HEAD lines. S3's safe quoting stays on the lane selector. GATE214-S2 is **not closed**; B rules. B's options include dropping S2 as written, or a lane other than the clip's. I propose nothing further.
- The rest of the round is complete on the reverted tree (run 2 below).

**L32 watch, pre-ruled (D-29z250), not a STOP:** PERF-1a took **7.1 min** in run 2 and 7.2 min in run 1, against its **15-min** timeout (47–48 %). Watch item PERF-1A-TIMEOUT-HEADROOM. No spec failed or ran longer than 12 min in the final run.

## Changed files (all within grants and new files; HEAD `2d4a93f`; frozen `sha256sum -c` rc 0; root-owned 3 rc 0)
- New: `perf/lib/page.ts`, `perf/lib/report.ts`, `docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md`.
- `M perf/studio-lab.perf.spec.ts` (1a): copies removed. Core options: `determinismRequiresKind: false`, `assertWhenPartial: false`, `crossRateMetrics`. Own `faderRowId` and envelope kept.
- `M perf/studio-lab-interactions.perf.spec.ts` (1b-i): copies removed. Core options: `determinismRequiresKind: true`, `assertWhenPartial: false`. GATE214-S3: `quotedAttributeValue` throws on `"`, `\`, `\n`, `\r` or `\f`, and `clipById` and the `emptyLanePoint` selector use it. S2 was reverted (see STOP).
- `M perf/studio-lab-resources.perf.spec.ts` (1b-ii): copies removed. Core options: `determinismRequiresKind: true`, `assertWhenPartial: true`, `guardProblems`.
  - GATE217-S1: the observer handle is kept on `window.__czabaExportObserver` (typed in the existing `declare global`). It is disconnected and cleared in the outer `finally` of `measureExport`, which runs after the window snapshot. If release fails, the pass gets the problem `export N: the "WAV created" observer was not released`.
  - GATE217-S2: `pathTimer` is cleared in `.finally` on the `Promise.race`.
- `M perf/budgets.json`: only the `harness.audio-running` `note` (GATE214-S5). `JSON.parse` of the old and new files is equal with that note removed, and that is the only changed row.
- `M` docs 163, 168, 169: granted sections only. Hunks are at 163 §არქიტექტურა / the table row / TODO, 168 l.13 / §არქიტექტურა / TODO, and 169 l.13 / §არქიტექტურა / TODO. Doc 169 §არქიტექტურა carries the observer-cost sentence. Doc 168 §არქიტექტურა states that S2 awaits a ruling.
- Doc 175: l.4 is `**სტატუსი:** Completed (C round 223 PASS)` (L28). It lists S2 as awaiting B, not as closed.

## Checks actually run
| Check | Result |
|---|---|
| Scratch equivalence (`a-round-223/equiv/`, `equiv-run.log`): HEAD builders extracted by `git show 2d4a93f` vs new core + envelope, `JSON.stringify` string compare (key order included) with `startedAt`/`finishedAt`/`durationMs` removed | 7 cases × 3 specs = 21/21 equal. The 7 cases: complete; aborted pass with short row; partial with out-of-budget assert; 1a cross-rate mismatch; 1b-ii guard; wallclock row with a deterministic metric; unbudgeted id |
| Mutants M-A, M-B, M-C (option flipped in a scratch copy of the new spec) | each red on its target case, and only there; 3/3 |
| Real perf run 2 (final tree): `CI=true npx playwright test --config playwright.perf.config.ts` | **3 passed, rc 0, 13.5 min** (1b-i 5.1 min, 1b-ii 1.0 min, 1a 7.1 min) |
| `equiv-check.py` vs `b-round-222/baseline-results/` (run 2) | latest.json (`--note-exempt harness.audio-running`) rc 0: 316 rows / 167 deterministic. latest-interactions rc 0: 144/122. latest-resources rc 0: 61/38. All `complete` true, 0 failures, 0 aborts, 0 page errors |
| Run 1 equiv (for the record) | 1b-ii rc 0. 1a rc 1 only on `load.longtasks-over-50`: [1,1,1] vs oracle [2,2,2]. It is a deterministic `record` row measured at page load, before any changed Node-side code acts. It did not recur in run 2, so I treat it as environment. C's EQUIV-223 clause applies if it recurs |
| `npm run typecheck` | rc 0 (final tree) |
| `npm run lint` | rc 0, 0 errors (205 pre-existing warnings; does not cover `perf/`, L30) |
| Scratch tsconfig `/tmp/a223-tsconfig.json` (`noUnusedLocals`, `noUnusedParameters`, include `perf/**/*.ts`, typeRoots = store `@types`) | rc 0, 0 diagnostics in all perf files (final tree). Sanity mutant: an added unused `median` import gives TS6133 |
| R1 | Read every `evaluate`/`addInitScript` body in the 5 files. No module or import identifier is used inside a body. `quietMs`/`settleCapMs` go in as args, and `expectedReactMajor` is Node-only |
| Reports | copied to `a-round-223/latest*.json` (run 2); run 1 kept in `a-round-223/run-1/` |

## Code review (actual `code-reviewer` subagent; 8/10; 0 Critical/High)
- **Medium, unverified by the reviewer: byte-identity vs HEAD.** The reviewer had no shell. This is covered by the scratch equivalence above (HEAD builders vs new, string compare) and by run-2 `equiv-check` rc 0 ×3. No change.
- **Low: S1 finally on abort.** On a broken page, "observer was not released" is listed before "aborted at …". This is accepted S1 behaviour and only occurs on an already-failing pass. Recorded here.
- **Low: 1b-i `sequence` text says "empty Stems lane click".** With S2 reverted this is accurate. Not changed (it is report output).
- **Low: 1a still uses the literal `[data-clip-kind="audio"]`.** Out of scope (task §2.1: `audioClips` is for 1b-i/1b-ii). Not changed.
- The reviewer reviewed the pre-revert tree (it assumed the clip lands on Stems; run 1 disproved that). S2 was reverted after the review.
- **Architecture note (for B):** keep the `perf/lib/page.ts` and `report.ts` split. lib imports only lib, and `storeRoot` and the envelopes stay in the specs. No further extraction proposed. Moving 1a onto `audioClips` is a possible one-liner, not needed.

## Known gaps / for B
- **GATE214-S2:** open, needs a B ruling (STOP above).
- **DOC-PERF-LINEREF-DRIFT-223:** the grep (`l\.\s?\d+`, `spec … l./line/:NNN`, `buildReport`, `787`) found **no perf-spec line references** in docs 163/168/169; the task's example "doc 168 spec buildReport l.787" is not present. One cross-doc reference drifted: doc 168 §შეცვლილი ფაილები (l.216 at HEAD), "`163-studio-perf-harness.md`: l.67 (`harness.audio-running`…)". The row is now at doc 163 l.73, because of my granted §არქიტექტურა additions. It is ungranted, so not edited. Listed for the deferred Low.
- Stage-b items untouched: GATE214-S1, GATE214-S4, A-R214 M2, R216-MEM-POLLS-HEADROOM.

## Exact next C checks
- SCOPE-223 and BUDGETS-DIFF-223 as written.
- CODE-223 (R1–R5).
- REPORT-EQUIV-223 with C's own script and mutants.
- **EQUIV-223** with a full perf run plus `equiv-check.py` ×3. Watch `load.longtasks-over-50` in 1a; if it differs, apply the HEAD-run clause.
- UNUSED-223.
- LOWS-223: S3, S5, S1-217 (with the "WAV created never appears" mutant on a copy) and S2-217 should PASS. **S2 is expected NOT passed** (literal `'stems'` remains, by STOP).
- LAB-SMOKE-223 and G223-3 at both viewports.
- AN-REVIEW-223: doc 175 cites four closed Lows plus S2 pending. Row counts are 316/167, 144/122 and 61/38.

## Acceptance criteria truly passed by A
- §2.1–2.3 contract and R1–R5: done, with the evidence above.
- GATE214-S3, GATE214-S5, GATE217-S1, GATE217-S2: done.
- **GATE214-S2: not done (STOP).**
- §4.1–4.5: done. §4.6: PERF-1a time listed. Doc 175 written.
- The whole round is not self-marked complete. C verifies.
