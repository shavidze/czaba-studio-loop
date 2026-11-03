# A round 314: PERF-5a close-out (C-R313-01 harness Follow-off and scroll guards; round 313's docs and review)

**Status:** done, ready for C. No STOP condition was hit. Evidence is in `a-round-314/`.

## Changed files (all inside the §5 grants)
- `perf/studio-lab.perf.spec.ts`: B's sketch hunks via `git apply`. Byte-equal (`cmp`) to `b-round-313/sketch-studio-lab.perf.spec.ts.txt`.
- `perf/lib/report.ts`: sketch, append only. Byte-equal to `sketch-report.ts.txt`.
- `perf/lib/report.test.ts`: sketch, SCROLL1. Byte-equal to `sketch-report.test.ts.txt`.
- `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`, the 4 granted sections only:
  - **Pass sequence:** new step 2 (round 313 LoAF liveness) and step 6 (round 314 Follow off plus the idle bracket). The list is renumbered from 10 to 12 steps.
  - **Metrics:** the `load.script-max` row is updated (`loafEntries`; the settled-window guard is removed). A new `harness.loaf-scripts-live` row is added. A new paragraph "Follow-ისა და scroll-ის guard-ები" covers both guards and states that `fader.*.playing.*` rows are measured with Follow off.
  - **Problems:** Problem → Solution for C-R312-01 and C-R313-01. Confirmed and inferred causes are kept apart.
  - **Testing:** LOAF2, SCROLL1, MU-LIVE-BUSY0 and MU-FOLLOW-SCROLL, plus the round-314 A run evidence.
- `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`:
  - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 314 PASS)` (L28).
  - Problems: entries for C-R312-01 and C-R313-01. C-R313-01 is marked as not caused by PERF-5a, with confirmed and inferred causes split.
  - Testing: one bullet with `harness.loaf-scripts-live`, the HEAD-app control (47/50/49) and the round-314 run values.

Not touched: `perf/budgets.json` (OK in the manifest), `instrumentation.ts`, `page.ts`, the other perf specs, every `app/**` file, every protected or config file.

## Rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: before editing, output equals `claims-314-head-output.txt` | `a-round-314/claims-before.txt` |
| A-APPLY | PASS: `git apply` clean; 3 × `cmp` OK; `budgets.json` untouched | — |
| A-TYPE | PASS: `npm run typecheck` rc 0 | `typecheck.log` |
| A-UNIT | PASS: scratch `/tmp/a314s` (own `cacheDir`, `vitest.perf-scratch.config.ts`); 34/34 pass. `unit-mutants.sh` output is byte-equal to `precheck-unit-mutants.txt` (1/3/1/3/1 red; restored 34 passed) | `unit.log`, `unit-mutants.txt` |
| A-PERF | PASS ×2, each run alone (see below) | `perf-a.json`/`.log`, `perf-a-run1-warmup-crashed.*` |
| A-DOC | Done (see above) | — |
| A-REVIEW | Done: code-reviewer run, findings fixed, re-reviewed (see below) | — |

### A-PERF details
**Run 1**
- Warm-up: `c-round-313/warm.cjs` crashed with a null `innerText` on the cold dev server (`warm-run1-crashed.log`). The spec still ran alone afterwards.
- Result: 1 passed (6.1 min), `failures` `[]`.
- Because the warm-up did not complete, I re-ran the spec to follow L38 exactly.

**Run 2** (canonical `perf-a.json`/`perf-a.log`)
- The warm-up succeeded: ready in 2,123 ms.
- Result: 1 passed (5.9 min), rc 0, `failures` `[]`.
- The log has 0 hits for `timeline scrolled`, `Follow is` or `nondeterministic`.

**Both runs**
- 6× clip-gain playing: commits 91, 91, 91 / 121 moves, and release commits 1, 1, 1.
- `harness.loaf-scripts-live`: [79, 79, 80] in run 1 and [79, 79, 79] in run 2. `loafEntries` is 1 in both.
- `harness.restart-live`: 1, 1, 1.
- `play.idle-commits`: 0, 0, 0.
- Row equality with `a-round-313/perf-control-headharness.json`: 164/164 deterministic rows equal, 0 differ in both runs (`row-compare-run{1,2}.txt`; my own script `/tmp/a314-rowcmp.py`, which compares `samples`).

### Other checks
- `npm run lint`: rc 0, warnings only (`lint.log`). Biome does not cover `perf/**` (L30); `npx biome check` on the 3 perf files reports them as ignored.
- Manifests after my edits:
  - app code: 6/6 OK;
  - protected: 11/11 OK;
  - `a313-tree-sha256.txt`: 3/8 OK (`budgets.json`, `instrumentation.ts`, `page.ts`), as designed.
- `git status`: 12 entries.
- Claims after my edits (`claims-after.txt`) against the sketch output: the only differences are the by-design ones (K2 `12 dfa4502`, K4 `3`, K9 the round-314 l.4, K10 `3 20 41 60 92 103 115`, K19 `11`).

### A-REVIEW
**First review**
- Code: no Critical, High or Medium findings. The reviewer confirmed:
  - **(a) Follow-off placement:** correct. Idle rows are snapshotted before the click, and the idle bracket reads `scrollLeft` before `idleStart` and after Follow off and quiet.
  - **(b) Scroll guard:** it cannot fire falsely on stopped drags or after `scrollIntoViewIfNeeded`, and the app sets `scroll-behavior: auto`. It is a tripwire with `scrollLeft` likely 0; MU-FOLLOW-SCROLL is its red-proof.
  - **(c) Hidden fader cost:** none, because the Follow subscriber returns early during gestures.
- Doc findings and how each was handled:
  - **M1** (228 l.4 claims C 314 PASS before C has ruled): kept, because the task mandates that exact line (L28) and C checks it byte for byte.
  - **M2** (doc 228 stated the inferred cause as fact): fixed with a confirmed / inferred split.
  - **M3** (no round-314 run evidence): fixed in both docs.
  - **M4** (the page-turn cost is now measured nowhere): already B's signal R313-FOLLOW-PAGE-TURN-COVERAGE; reported here, not implemented.
  - **L1** (scratch config and mutant script are outside the repo): fixed in the doc text.
  - **L2 / L3 / L4:** reported below.

**Re-review (L11):** M2, M3 and L1 are resolved, with no new Medium+ findings. The reviewer also verified every cited number against the artifacts.

## Known gaps and notes for B
- **M4 / R313-FOLLOW-PAGE-TURN-COVERAGE:** with Follow on (the default), the page-turn re-render cost has no row. It is a candidate for a deterministic scenario that forces a page turn in a later PERF task.
- **L2:** the scroll guard cannot tell "not scrollable" from "did not scroll". Recording `scrollWidth`/`clientWidth` would make that visible. This is a spec change outside this round's sketch.
- **L3:** Follow starting `paused` leaves a short `on` gap between the two clicks. The idle bracket would catch a page turn there. Info only.
- **L4:** the `budgets.json` scenario text for playing faders does not say "Follow off". The `sequence` field and doc 163 carry it. Left unchanged by design (§0.5).
- **Optional Lows from the re-review:**
  - phrase "აპის ქცევა სწორია" as conditional on the inference;
  - give the artifact location in the docs' run lines;
  - the "C-ის შემოწმება მოლოდინშია" sentences in 163/228 must be updated when C rules, to stay consistent with 228 l.4.
- **Idle bracket:** it has no browser negative control, as §6 records (a gap, not a claim).
- **Architecture note (reviewer):** keep `runPass`/`dragFader` linear. If a fourth guard round comes, a bounded task could fold the per-drag preconditions into one `fenceFaderWindow` helper with the same problem strings. This is a proposal for B/root only.
- **Warm-up script:** `c-round-313/warm.cjs` crashes if the dev server is cold (it reads `document.body` before it exists). Run 1 is kept as evidence.

## Next C checks (round 314 §3.2)
- **SOURCE-SCOPE:** expect 12 entries; app 6/6; tree 3/8; protected 11/11.
- **CLAIMS:** compare against the sketch output, with the by-design differences listed above.
- **CARRY.**
- **HARNESS-PASS:** 2 runs alone, after a warm-up.
- **ROW-EQUALITY:** 164/164.
- **MU-FOLLOW-SCROLL:** record the counts per class.
- **UNIT:** 34 pass, plus C's own mutant.
- **FOLLOW-UI:** at 1440×900.
- **DOC:**
  - doc 163: the 4 sections against the live spec;
  - doc 228: l.4, the 7 headings in order, and the C-R312-01 and C-R313-01 entries.
- **G314-AUTH:** both viewports.

## Scope
Done: every A row in §3.1. I do not claim any C row or gate row. PERF-5a closes only after C PASS and the gate; PERF-5 stays in progress until 5b.
