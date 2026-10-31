# Round 281: PERF-HARNESS-DIAG-281 (test-only, perf-harness diagnostics). A failed demo source stops a perf pass at once with a named error instead of a generic 90 s or 15 s timeout; the click-live row records which lanes the deselect click used; the lane error never reads "lane null"

**Planned by:** B, at the round 280 → 281 planning, 2026-10-31. **Decisions:**
- D-29z650: round 280 closed (C PASS, gate 280 published `145f6c1`). b-ii-2, PERF-HARNESS-SHARED-LIB-b-ii and PERF-HARNESS-SHARED-LIB-b are **მზადაა**.
- D-29z651: the gate-280 review and the A/C notes are recorded (Lows deferred; info; one architecture signal; A's L1/L2 key names kept).
- D-29z652: the round-281 design in §2 (consults: `tech-lead`, `performance-optimizer`), amended by D-29z657.
- D-29z653: the equivalence contract in §2.5, amended by D-29z657.
- D-29z654: docs. New doc 210, plus sections of docs 208, 175, 168, 169 and 209 (§5).
- D-29z655: the outcome table in §11.
- D-29z656: lessons. L38 gains the cold-start warm-up clause (2×).
- **D-29z657: the pre-check finding.** B's first sketch changed only `waitForCollectionReady`. B's mutant showed that this cannot fire, because a 90 s library-ready wait runs first and times out (§1). The design was widened inside the same three items.

**Kind of round:** performance harness, test-only. These do not apply (policy 2026-10-27/28: "pure performance, refactor, test-only … rounds"):
- reference-first;
- the AGREE note;
- the YouTube request;
- `product-designer`;
- the screen budget.

No app source changes. No new dependency (`oss-adoption.md`).

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §5 and `b-round-280-r281-grants.txt`. **Frozen list:** `b-round-280-r281-tree-sha256.txt` (1134 files: every tracked file except the 10 tracked grant paths).

**Items closed by this round** (three tightly related harness-diagnostics items, D-29z645):
| Id | Severity | What |
|---|---|---|
| GATE279-S1 | Medium | a failed demo source and a slow wait look the same: the pass aborts on a generic timeout. The gate reviewer named `waitForCollectionReady` [K2]; B measured that the first wait to time out is the 90 s library-ready wait (§1, B-R281-GATE279-S1-PREMISE) |
| B-R280-CLICK-LIVE-LANE-ID | Low | D-29z254 leftover: the chosen deselect lane id is not in the `interact.harness.click-live` detail [K9] |
| A-R279-REVIEW-LANE-NULL | Low | the error text of `emptyLanePointAfterClip` prints `found.ownTrack`, which can be `null` [K8] |

## Baseline: HEAD `145f6c1`, clean tree
`gates/gate-round-280.json` is `published`, commit `145f6c1` [K1]. At planning, `git status --short` was empty and `git ls-files | wc -l` was 1144 (`b-round-280/git-status-at-planning.txt`, `head-at-planning.txt`).

## 0. Read first
1. `lessons.md`, every role. Especially L11, L23, L28, L29, L30, L34 and **L38**: perf runs alone; a second dev server gets its own `cacheDir`; warm up before a timed browser probe.
2. This task.
3. B's sketch: `b-round-280/sketch.diff`. Apply it with `patch -p1` from `store/`. It touches the five code files only, not the docs.

**Primitives for A:**
- `AGENT_DISCOVERABLE_CODE.md` (new names);
- `ERROR_TAXONOMY.md` (error texts; no error codes are added, because this is harness text, not an app error);
- `TESTING_QUALITY_GATES.md`;
- `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

`.claude/prompts/new-test.md` does not apply (no new test file).

## 1. What changes, and why
**Two waits run after load in every perf pass** [K3][K18]:
1. **The library-ready wait.** All three specs poll the page every frame, for up to 90 s, until the library's Add button is enabled and the preview waveform is drawn [K17][K18]. The three copies check the same DOM condition. The PERF-1b-ii copy returns a boolean that its caller ignores; the other two return `performance.now()` as `readyMs` [K19].
2. **The status wait** (PERF-1a and PERF-1b-i only) [K3][K16]. `waitForCollectionReady` waits up to 15 s for the status line to match the ready text [K2][K7].

**What a failed demo source does** (B, at `145f6c1`, dev server, 1440×900, `page.route` abort):
| Aborted request | Status line (`failed-status-probe.json`) | Add / waveform 3 s after the status settles (`failed-other-probe.json`) | Which wait fails at HEAD |
|---|---|---|---|
| none | `Demo collection ready. …` at ≈ 2.3 s | enabled / drawn | none |
| `/middle-east.mp3` (the selected library item) | `1 sound in the demo collection failed to load — details are in the library.` at ≈ 2.3 s, unchanged 15 s later | `aria-disabled="true"` / not drawn | the library-ready wait, after **90 s**: `aborted at load: page.waitForFunction: Timeout 90000ms exceeded.` (`head-load-control-partial.json`, 2 passes) |
| `/videos/hero/hero-music.mp3` (not selected) | the same failed text | enabled / drawn | the status wait, after **15 s**, with a generic `toHaveText` timeout (1a, 1b-i); PERF-1b-ii does not notice at all |
| both | `2 sounds in the demo collection failed to load — details are in the library.` at ≈ 1.2 s | — | as for `/middle-east.mp3` |

The failed text has a singular and a plural branch [K5]. Both specs record a throw during `load` as `aborted at ${step}: <first line of the message>` [K4]. This round uses that path, so each named text reaches `problems` exactly once.

**B-R280-CLICK-LIVE-LANE-ID and A-R279-REVIEW-LANE-NULL.**
- `emptyLanePointAfterClip` already finds the clip's lane and the chosen lane in the page, but returns only `{ x, y }` [K8].
- Its first error text interpolates `found.ownTrack`, which is `null` when the clip has no lane [K8].
- The click-live detail has three keys [K9]. The detail type accepts strings [K10].

## 2. The contract
### 2.1 `perf/lib/app-labels.ts`: two new patterns built from the app's copy
Directly after `perfCollectionReadyPattern` [K7], add the following (as in the sketch):
- **A private `countedTemplatePattern(render: (count: number) => string): string`.** For count 1 and for count 2 it:
  - renders the template;
  - finds the count's digits, which must occur exactly once, or it throws at import with `count template needs exactly one count: <JSON>`;
  - escapes the text before and after them.

  It then joins the two forms with `|`, with `\d+` in place of the count. Two forms are needed because the copy has a singular and a plural branch [K5].
- `export const perfCollectionFailedPattern = new RegExp(`^(?:${countedTemplatePattern(workspaceCollectionCopy('demo').failed)})`);`
- `export const perfCollectionSettledPattern = new RegExp(`${perfCollectionReadyPattern.source}|${perfCollectionFailedPattern.source}`);`

Both are anchored at the start only, like the ready pattern [K7], because the settled text can keep a loading suffix.

B checked them by bundling the sketch with esbuild (`b-round-280/pattern-check.txt`):
- the settled pattern matches ready, ready + suffix, failed(1), failed(2), failed(12) and failed(1) + suffix;
- the failed pattern matches only the failed forms;
- neither matches the loading or empty text, or the purchased collection's texts.

### 2.2 `perf/lib/page.ts`: a new shared `waitForLibraryReady(page): Promise<number>`
Add it directly before `waitForPlaybackSettled`, with a local discriminated type:

`type LibraryReadyState = | { readyMs: number; failedStatus: null } | { readyMs: null; failedStatus: string };`

1. One `page.waitForFunction` with `{ polling: 'raf', timeout: 90000 }` (unchanged) and the argument `{ addLabel: perfLibraryAddLabel, failedSource: perfCollectionFailedPattern.source }`. A `RegExp` does not cross into the page, so its `source` string is passed. The in-page function, every frame:
   1. reads the text of `[data-testid="arrangement-status"]` [K6] (or `''`);
   2. if `new RegExp(failedSource)` matches it: returns `{ readyMs: null, failedStatus: <text> }`;
   3. otherwise it runs the HEAD condition unchanged [K17]: the button whose trimmed text is the Add label is an `HTMLButtonElement` without `aria-disabled="true"`, **and** `[data-testid="arrangement-library-preview-wave"] rect` exists. If both hold it returns `{ readyMs: performance.now(), failedStatus: null }`, else `null` (keep polling).
2. `const state = await handle.jsonValue();`
3. `if (state === null) throw new Error('the library ready wait resolved without a state');`. `waitForFunction` resolves only on a truthy value, so this line cannot run. It is there because the handle's type includes the falsy wait value, and strict TS needs the guard. It is a type guard, not an assertion. Reviewers: this is deliberate (compare round 280 review I4).
4. `if (state.failedStatus !== null) throw new Error(`demo collection failed before the library was ready: ${state.failedStatus}`);`
5. `return state.readyMs;`

**The three call sites** [K18] (nothing else in those functions changes):
- **PERF-1a `measureLoad`:** `const readyMs = await waitForLibraryReady(page);` replaces the `waitForFunction` + `jsonValue` lines; the snapshot and the `load.*` rows that follow are unchanged.
- **PERF-1b-i `measureLoadReady`:** the same replacement; `interact.load.ready-ms` is unchanged.
- **PERF-1b-ii `measureLoadReady`:** its body becomes `await waitForLibraryReady(page);`. The returned number is ignored, exactly as the boolean is ignored at HEAD [K19].

Each spec's import from `./lib/page` gains `waitForLibraryReady`; `perfLibraryAddLabel` stays imported where the spec still uses it (all three do).

### 2.3 `perf/lib/page.ts`: `waitForCollectionReady`
Import `perfCollectionFailedPattern`, `perfCollectionReadyPattern`, `perfCollectionSettledPattern` and `perfLibraryAddLabel`, and keep the existing imports. The body becomes:
1. `const status = page.getByTestId('arrangement-status');`
2. `await expect(status).toHaveText(perfCollectionSettledPattern, { timeout: 15000 });` (the timeout stays 15000);
3. `const text = (await status.textContent()) ?? '';`
4. if `perfCollectionFailedPattern.test(text)`: `throw new Error(`${label}: demo collection failed: ${text}`)`. **Throw only, with no `problems.push`** (`tech-lead`): the spec's catch records it once [K4];
5. if `!perfCollectionReadyPattern.test(text)`: `throw new Error(`${label}: demo collection status is not ready: ${text}`)`. This follows `performance-optimizer`: never continue silently on an unexpected status;
6. `return waitForStudioQuiet(page, problems, label);` (unchanged).

The signature stays `(page, problems, label): Promise<number>`. The two callers do not change [K3].

**The two prefixes are different on purpose**, so a run shows which wait caught the failure:
- library-ready wait: `aborted at load: demo collection failed before the library was ready: <status>`;
- status wait: `aborted at load: after load: demo collection failed: <status>`.

### 2.4 `perf/studio-lab-interactions.perf.spec.ts`: lane ids and texts
- After `interface GrabPoint`, add `interface EmptyLanePoint extends GrabPoint { trackId: string; clipTrackId: string; }`.
- `emptyLanePointAfterClip(clip: Locator): Promise<EmptyLanePoint>`. The in-page `evaluate` does not change. After it, in this order:
  1. `found.ownTrack === null` → throw `the clip is not inside a lane with a data-track-id`;
  2. `found.point === null` → the existing text (`no lane after the clip's lane ${found.ownTrack} has an empty timeline point`); `ownTrack` is now a string here;
  3. `found.point.trackId === null` → throw `the empty timeline point is on a lane without a data-track-id`;
  4. the existing own-lane check and its text;
  5. return `{ x, y, trackId: found.point.trackId, clipTrackId: found.ownTrack }`.

  There is no type assertion and no non-null assertion: the checks do the narrowing. MU-NO-OWN-GUARD (§6.2) proves that step 1 is what lets the return type check.
- In `measureClipClick`, the click-live detail gains two keys **after** the existing three: `clipTrackId: empty.clipTrackId` and `emptyLaneTrackId: empty.trackId`. The value, the `live` rule and the problem text do not change.

**Measured lane ids** (B's sketch runs, every pass at 1× and 6×): `clipTrackId` = `music`, `emptyLaneTrackId` = `stems` (`b-round-280/sketch-click-live.txt`, `v2-click-live.txt`). So the sequence text and the row notes that say "empty Stems lane" [K15] stay true and **do not change** (`tech-lead` (c)).

### 2.5 Equivalence contract (D-29z653, D-29z657)
**Oracles** (C's own runs on content identical to `145f6c1` for these specs):
- PERF-1a: `c-round-279/results-1/latest.json`;
- PERF-1b-i: `c-round-279/results-1/latest-interactions.json`;
- PERF-1b-ii: `c-round-280/run-1/latest-resources.json`.

For 1a and 1b-i: the two specs, `perf/lib/**`, both budgets files, the perf config and `app/**` are byte-identical between `1dbf3af` and `145f6c1`. At planning, `git diff --quiet 1dbf3af 145f6c1 -- app perf/lib perf/studio-lab.perf.spec.ts perf/studio-lab-interactions.perf.spec.ts perf/budgets.json perf/budgets.interactions.json playwright.perf.config.ts` returned rc 0. Round 280's C run is on the published `145f6c1` content.

**Pass on A's tree**, all from `store/`:
- `python3 -I ../tmp/studio-real-loop/b-round-222/scripts/equiv-check.py <oracle> <new>` for `latest.json` and for `latest-interactions.json`;
- `python3 -I ../tmp/studio-real-loop/b-round-279/scripts/equiv-check-b2.py <oracle> <new> --tol res.export.1.peak-backing-delta-mib=0.1 res.export.2.peak-backing-delta-mib=0.1` for `latest-resources.json`.

Each must exit **0 with 0 problems** (tolerated lines allowed only for the two named rows):
- the same envelope, row ids and order, and row fields, `note` included;
- every deterministic median and every assert pass identical;
- `complete: true`, no failures, and no pass with `abortedAt`, `pageErrors` or `problems`.

The two `--tol` rows are the round-280 machine-variance rows (65 ↔ 65.1, D-29z647); no note exemption remains.

**The one allowed difference:** the click-live detail keys. The equivalence scripts do not read `details`, so DETAIL-LANE (§8) checks them separately.

**Same-machine HEAD re-run clause** (the round-223 rule): a deterministic difference counts against A only if a `git archive 145f6c1` run on the same machine, run alone (L38), reproduces the oracle's value for that row. If HEAD reproduces A's value instead, the row is machine-sensitive: record it as data, not a FAIL.

## 3. Consults and rulings
| Consult | Advice | Ruling |
|---|---|---|
| `tech-lead` (a1) | the first sketch pushed the problem and then threw, so the spec's catch recorded it twice | adopted: throw only (§2.2, §2.3) |
| `tech-lead` (a2) | no race: failed and ready are terminal during a load | recorded; §2.3 step 5 still guards |
| `tech-lead` (b) | keep the resources spec out of scope for the status wait: its ready signal differs and the rows are time-sensitive | adopted for the status wait. **After D-29z657** the resources spec does get the shared library-ready wait: its HEAD copy checks the same DOM condition [K17][K19], so only the failed branch is new. The non-selected-source case in 1b-ii stays a signal (B-R281-RESOURCES-READY-FAILED, narrowed) |
| `tech-lead` (c) | change the note only if the lane is not Stems | measured `stems`; the notes stay unchanged |
| `tech-lead` (d) | MU-FAILED-SOURCE should prove the abort comes well inside the timeout; add a tsc mutant for the own-lane guard | adopted (§6.2) |
| `tech-lead` (e) | a new doc 210, linking back to 208 | adopted |
| `performance-optimizer` (1) | the extra `textContent` read cannot move a row; check the detail keys separately; guard an unexpected status | adopted (§2.3 step 5, §8 DETAIL-LANE) |
| `performance-optimizer` (2, 3) | no 1b-ii re-run for the status-wait change; the string keys are safe | the status-wait part holds; 1b-ii is re-run because of D-29z657 |
| advisor | the per-frame status read must be proven by the contract, not argued; the non-selected-source mutant may fire either wait, so do not fix one text for it | adopted (§2.5, §6.2) |

## 4. B's pre-check (L23: the sketch is pre-applied and measured)
All runs were alone (L38), on `git archive 145f6c1` copies with `node_modules` symlinked.
- **Sketch v1** (`sketch-v1-push-and-throw.diff`, then `sketch-v1b-waitonly.diff`: only the status wait and the lane items):
  - the 1a + 1b-i perf run was equivalent (`sketch-equiv.txt`: 1a 0 problems, 1b-i 0 problems; click-live `music`/`stems` ×6);
  - but its MU-FAILED-SOURCE run aborted every pass with `page.waitForFunction: Timeout 90000ms exceeded.` (`mutants/MU-FAILED-SOURCE/run-v1-killed.log`, `head-load-control-partial.json`). The fix could not fire. This is D-29z657.
- **Sketch v2 = `sketch.diff`** (this task): `tsc --noEmit` rc 0 (`v2-tsc.log`). The three-spec perf run and its equivalence: see `v2-perf-run.log`, `v2-equiv.txt`, `v2-click-live.txt` (numbers in §4a).
- **Mutants** on v2 (PERF-1a only): `mutants-summary.txt` (numbers in §4a). The MU-STATUS-WAIT sed in `run-mutant.sh` matches the sketch's exact in-page line; if A reformats that line, A adapts the sed and reports it. MU-NO-OWN-GUARD gave tsc rc 2, `TS2322: Type 'string | null' is not assignable to type 'string'` (`mu-no-own-guard-tsc.log`, run on the v1b tree; the §2.4 code is the same in v2).
- **Claims:** `b-round-280/claims.sh` → `claims-output-at-145f6c1.txt` (K1–K20, SW-A … SW-D).
- **Grants:** `b-round-280-r281-grants.txt` (11 paths: 5 code files, 1 new doc, sections of 5 docs).
- **Frozen list:** `b-round-280-r281-tree-sha256.txt`, 1134 files; `sha256sum -c` rc 0 at planning.

### 4a. v2 measurements
- **Perf run** (`v2-perf-run.log`), all three specs, alone: `3 passed (13.3m)`; PERF-1b-i 5.1 min, PERF-1b-ii 1.1 min, PERF-1a 6.8 min.
- **Equivalence** (`v2-equiv.txt`):
  - PERF-1a: rows 316, deterministic 166, **problems 0**;
  - PERF-1b-i: rows 144, deterministic 106, **problems 0**;
  - PERF-1b-ii: rows 61, deterministic 37, **problems 0, tolerated 0**.
- **Click-live details** (`v2-click-live.txt`): `clipTrackId`, `emptyLaneTrackId` follow the three old keys; `music` → `stems` in 6/6 samples (1× and 6×).
- **Mutants** (`mutants-summary.txt`; PERF-1a only, each run alone):
  - **MU-FAILED-SOURCE:** `1 failed`; 6/6 passes `abortedAt` `load` with exactly one problem, `aborted at load: demo collection failed before the library was ready: 1 sound in the demo collection failed to load — details are in the library.`; the whole report took 9.2 s (`durationMs` 9196). The HEAD control took 90 s per pass.
  - **MU-FAILED-OTHER:** `1 failed`; 6/6 passes `abortedAt` `load` with exactly one problem, the same library-ready prefix: the status settled before Add was ready in every pass; 6.7 s.
  - **MU-STATUS-WAIT** (added after MU-FAILED-OTHER showed the library-ready wait catching both cases): the library-ready wait's failed check is disabled and `/hero-music.mp3` is aborted. Result: `1 failed`; 6/6 passes `abortedAt` `load` with exactly one problem, `aborted at load: after load: demo collection failed: 1 sound in the demo collection failed to load — details are in the library.`; 7.0 s. This proves the §2.3 branch.
  - **MU-NO-OWN-GUARD:** tsc rc 2, TS2322 (`mu-no-own-guard-tsc.log`).

## 5. Grants (exact; also in `b-round-280-r281-grants.txt`)
| Path | What may change |
|---|---|
| `perf/lib/page.ts` | the import block from `./app-labels`; the body of `waitForCollectionReady`; the new `LibraryReadyState` type and `waitForLibraryReady`, directly before `waitForPlaybackSettled` |
| `perf/lib/app-labels.ts` | the three new declarations of §2.1, directly after `perfCollectionReadyPattern` |
| `perf/studio-lab.perf.spec.ts` | the import block from `./lib/page`; in `measureLoad`, the `waitForFunction` + `jsonValue` lines → `waitForLibraryReady` |
| `perf/studio-lab-interactions.perf.spec.ts` | the import block from `./lib/page`; the same replacement in `measureLoadReady`; `EmptyLanePoint` after `GrabPoint`; `emptyLanePointAfterClip` after its `evaluate` (return type, guards, texts, return); the click-live `detail` in `measureClipClick` (two new keys) |
| `perf/studio-lab-resources.perf.spec.ts` | the import block from `./lib/page`; the body of `measureLoadReady` → `await waitForLibraryReady(page);` |
| `docs/implementation/2026/quarter-IV/210-perf-harness-load-diagnostics.md` | **new** (content: §7) |
| `docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md` | only the TODO bullet that names round 281 (l.88) [K12] |
| `docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md` | the whole sections `### Helper-ების რუკა (`perf/lib/page.ts`)` (new row for `waitForLibraryReady`, changed row for `waitForCollectionReady`) and `### GATE214-S2: შესრულდა round 279-ში …` (L34), plus one TODO bullet |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | the whole section `### Liveness-ის წესები` (the click-live row: the two detail keys) and the b-ii TODO bullet (l.253) |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | the `## მიდგომა` intro, l.11–20, before `### Pass-ის თანმიმდევრობა (1×)` (it says the ready wait `measureLoadReady` stays in the spec [K20]), plus one TODO bullet |
| `docs/implementation/2026/quarter-IV/209-perf-export-window-page-clock.md` | only the TODO bullet that names round 281 (l.87) |

**Not granted (frozen):**
- `perf/lib/report.ts` and every other `perf/lib/*` except `page.ts` and `app-labels.ts`;
- all `perf/budgets*.json` (the notes stay true, §2.4);
- `playwright.perf.config.ts`;
- `app/**`, `e2e/**`, `package*.json`;
- the four protected auth/purchase files;
- `.claude/**`.

A hunk in a grant path that falls outside its "What may change" column is a scope FAIL.

## 6. Tests
There is no vitest change: `perf/**` is outside the vitest include and outside Biome [K11] (L30). The proof is the real perf run, the equivalence check and the named mutants.

### 6.1 What A runs (speed rules; L38: perf alone, nothing else running)
1. `npm run typecheck` (it covers `perf/**`) and `npm run lint` (app only; report the count, L30).
2. `CI=true npx playwright test --config playwright.perf.config.ts` (all three specs) once on the final tree, **alone**. Then the three equivalence runs of §2.5 and the detail check of §8 DETAIL-LANE. Report each spec's time.
3. The mutants of §6.2:
   - Run the three runtime mutants (MU-FAILED-SOURCE, MU-FAILED-OTHER, MU-STATUS-WAIT) with `b-round-280/scripts/run-mutant.sh <ID> 145f6c1 <A's diff> <A's out dir>`, one at a time and alone. The script builds its own archive copy and runs PERF-1a only.
   - MU-NO-OWN-GUARD is tsc-only: copy the final tree, delete the §2.4 step-1 guard, run `npx tsc --noEmit -p .`.
4. `claims.sh` on a fresh `git archive 145f6c1` copy: its output must equal `b-round-280/claims-output-at-145f6c1.txt`.
5. The code-reviewer subagent (3+ changed files).

Not A's rows: the full vitest, the build, `npm run verify` and `test:e2e:smoke` (gate rows).

### 6.2 Named mutants (each signal fixed in advance)
| Id | Mutation (on the final tree) | Expected signal |
|---|---|---|
| MU-FAILED-SOURCE | the PERF-1a context aborts `**/middle-east.mp3` (`context.route`), the selected library item | `1 failed`; every pass has `abortedAt` = `load` and **exactly one** problem, byte-exact: `aborted at load: demo collection failed before the library was ready: 1 sound in the demo collection failed to load — details are in the library.`; the whole run takes far less than one 90 s timeout per pass (the HEAD control took 90 s per pass) |
| MU-FAILED-OTHER | the PERF-1a context aborts `**/hero-music.mp3`, a non-selected item | `1 failed`; every pass has `abortedAt` = `load` and exactly one problem that contains `demo collection failed` and the exact status text `1 sound in the demo collection failed to load — details are in the library.`; either prefix of §2.3 may fire (which wait catches it depends on whether the status settles before Add is ready); the report records which; no pass reaches `library Add` |
| MU-STATUS-WAIT | in `waitForLibraryReady`, the failed check is disabled (the in-page `if (new RegExp(failedSource).test(status))` line becomes a condition that is never true), and the PERF-1a context aborts `**/hero-music.mp3` | `1 failed`; every pass has `abortedAt` = `load` and exactly one problem, byte-exact: `aborted at load: after load: demo collection failed: 1 sound in the demo collection failed to load — details are in the library.` (proves the §2.3 branch) |
| MU-NO-OWN-GUARD | delete the §2.4 step-1 `ownTrack === null` guard | `tsc` rc ≠ 0, with TS2322 on the `clipTrackId` line |

**HEAD control (not re-run):** `b-round-280/head-load-control-partial.json`. It is the v1b sketch's MU-FAILED-SOURCE run, stopped by B after 2 passes. Its load step is byte-identical to HEAD: v1b did not touch `measureLoad`, see `sketch-v1b-waitonly.diff`. With `/middle-east.mp3` aborted, both recorded passes are `aborted at load: page.waitForFunction: Timeout 90000ms exceeded.`, with `complete: false` and `durationMs` 180735.

## 7. Doc 210 (new) and the other doc edits
Write `docs/implementation/2026/quarter-IV/210-perf-harness-load-diagnostics.md` in Georgian, with English technical terms:
- l.4 is exactly `**სტატუსი:** Completed (C round 281 PASS)` (L28; this is a one-round item, not a stage).
- It has the seven TEMPLATE headings in order (L26):
  - **context:** the three ids, the §1 table, and the premise correction (B-R281-GATE279-S1-PREMISE);
  - **approach:** §2, the consult rulings, and the resources-spec scope (library-ready yes, status wait no);
  - **architecture:** a small Mermaid flow (load → library-ready: failed? → throw / ready → status wait: failed? → throw / ready? → quiet);
  - **changed files**;
  - **problems/solutions:** the double record that `tech-lead` found, and the v1 sketch that could not fire;
  - **testing:** A's perf run, the three equivalence checks, DETAIL-LANE, and the mutants with their signals;
  - **TODO:** B-R281-RESOURCES-READY-FAILED, GATE280-S1/S2, the architecture signals, and a link back to doc 208.
- Every test claim names an existing row or mutant (L26).

**Other doc edits:**
- Doc 208 l.88, doc 209 l.87 and the doc 168/169/175 TODO bullets say that round 281 did the work (doc 210).
- Doc 175's helper map gets a row for `waitForLibraryReady` and the changed `waitForCollectionReady` row; its GATE214-S2 section describes the live code.
- Doc 169's approach intro no longer says the ready wait stays in the spec.
- Doc 168's click-live row names the two new detail keys.
- **Doc 208's body stays as written** (its approach l.18, the Mermaid node at l.34 and the problem at l.71 describe the round-279 `waitForCollectionReady`). Doc 208 is the round-279 record; doc 175's helper map and doc 210 are the live description. Only l.88 changes. The same rule protects doc 209's body.

## 8. C rows (C runs nothing else while a perf spec runs, L38)
| Row | Check |
|---|---|
| SOURCE-SCOPE | `sha256sum -c b-round-280-r281-tree-sha256.txt` rc 0 at the start and at the end; `git status` shows only §5 paths (at most 10 `M` + 1 `??` for doc 210) |
| HUNK-SCOPE | every hunk is inside its §5 column. For the five code files, compare with `git archive 145f6c1` + `b-round-280/sketch.diff`. A difference is allowed only if it is a pure rename, reorder or reformat that A explains, with the same behaviour |
| CLAIMS | `claims.sh` on a clean `145f6c1` archive equals `b-round-280/claims-output-at-145f6c1.txt`; plus the L29 untagged-fact sweep over this task |
| SWEEP | SW-A and SW-D: the new names occur only in the granted code files (and the docs); SW-B and SW-C re-run with no new consumer; K17 on A's tree: `polling: 'raf', timeout: 90000` occurs once, in `perf/lib/page.ts` |
| TYPECHECK | `npm run typecheck` rc 0 |
| PERF-RUN | `CI=true npx playwright test --config playwright.perf.config.ts`, run alone, gives `3 passed` |
| EQUIV | §2.5: the three equivalence runs exit 0 with 0 problems (tolerated lines only for the two named rows). On a deterministic difference, apply the same-machine HEAD clause before calling it a FAIL. An environment-invalid run is kept and replaced at most twice (L38) |
| DETAIL-LANE | **(1)** In C's `latest-interactions.json`, every sample of `interact.harness.click-live` and `.6x` has `clipTrackId` and `emptyLaneTrackId` as two different non-empty strings, after the three old keys in the same order. **(2)** A browser probe on `/studio-lab` (dev server, 1440×900, after Add) confirms that `[data-track-id="<emptyLaneTrackId>"]` exists and contains no `[data-clip-kind="audio"]` element, while `[data-track-id="<clipTrackId>"]` does contain one |
| FAILED-SOURCE | C's own MU-FAILED-SOURCE run (the §6.2 signal, byte-exact text) |
| FAILED-OTHER | C's own MU-FAILED-OTHER run (the §6.2 signal; record which prefix fired in each pass) |
| STATUS-WAIT | C's own MU-STATUS-WAIT run (the §6.2 signal, byte-exact text) |
| NO-OWN-GUARD | C's own tsc-only mutant (the §6.2 signal) |
| HEAD-CONTROL | evidence check, not a re-run: `b-round-280/head-load-control-partial.json` shows the 90 s generic timeout per pass at HEAD |
| G281-AUTH | a fresh context with no credentials, at both viewports. **`/studio-lab`:** renders the demo workspace with the badge `Demo collection — no sign-in required`, and `auth_user` is null. **`/studio/middle-east`:** shows `Sign in required`, `audio[src]` is 0, and no workspace renders. **`/api/studio-token`:** with no header → 401; with a fake bearer → not 200 and no token. After the perf builds, warm `/studio-lab` once (untimed) before the timed probe (L38) |
| DOC-210 | doc 210 l.4 is byte-exact; the seven TEMPLATE headings are in order; each test claim names a row or mutant that exists; docs 168/169/175/208/209 changed only in their §5 sections; `grep -rn 'In Progress (stage' docs/implementation` = 0 [K13] |
| gate | full vitest, build, Biome, `npm run verify` and `test:e2e:smoke` are the root gate's and are not claimed |

`browserVerified` and `realVerified` are true only if PERF-RUN, DETAIL-LANE (both halves), FAILED-SOURCE, FAILED-OTHER, STATUS-WAIT and G281-AUTH ran in the real browser.

## 9. Neighbour risk
- **The happy path of all three specs.** The library-ready wait now reads the status text every frame before its HEAD condition. That is one extra `querySelector` per frame and no DOM write. EQUIV on all three specs is the proof (`load.*`, `interact.load.ready-ms`, `res.mem.used-ready-mib`, `harness.hook-live` are the closest rows).
- **PERF-1b-ii, non-selected source.** It still has no status wait, so with `/hero-music.mp3` failed it can continue and measure. This is recorded as **B-R281-RESOURCES-READY-FAILED** (signal, Low, narrowed by D-29z657). A status wait there would move time-since-load rows (round 279 measured `res.mem.used-ready-mib` moving with it).
- **An empty demo collection** (no sounds) matches neither pattern. The library-ready wait then times out at 90 s, and the status wait at 15 s, as today. The demo is never empty, so nothing changes.
- **A later copy change.** `countedTemplatePattern` throws at import if the failed copy stops having exactly one count. Every perf spec then fails loudly instead of silently matching nothing.

## 10. STOP conditions (L11)
- EQUIV shows a deterministic difference that the same-machine HEAD clause does not explain.
- A §6.2 mutant does not give its signal.
- `clipTrackId`/`emptyLaneTrackId` is not `music`/`stems`. The notes [K15] would then be false. STOP, and do not edit the notes (they are frozen).
- Any change is needed outside §5.

## 11. Outcome, fixed in advance (D-29z655)
| Result | Next |
|---|---|
| C PASS and the gate publishes | GATE279-S1, B-R280-CLICK-LIVE-LANE-ID and A-R279-REVIEW-LANE-NULL are closed; PERF-HARNESS-DIAG-281 is **მზადაა**. Round 282 = REGRESSION if its planning falls on or after 2026-11-02, otherwise PERF-2 (consults first) |
| C FAIL on a harness row | a bounded fix-up with the same grants |
| EQUIV moves a row for machine reasons only | data, not a FAIL (the §2.5 clause) |

## 12. Deliverables
- **A:** the five code files, doc 210 and the doc sections; `a-round-281.md` with the commands, results, the mutant table, the review and its Architecture note.
- **C:** `c-round-281.md`, `c-round-281.json`, and evidence in `c-round-281/`.

## 13. Root notes
- Test-only: nothing under `app/**` changes. The gate runs the full verify.
- ROOT-REQ-PERF-TIMEOUT stays open (B's v2 sketch run: PERF-1a 6.8 min = 45 % of 15 min).

## Claims block (L29)
Run `bash ../tmp/studio-real-loop/b-round-280/claims.sh` from `store/` at HEAD `145f6c1` (or on a clean archive). The expected output is `b-round-280/claims-output-at-145f6c1.txt`.

| Tag | Claim | Command (in `claims.sh`) | Expected |
|---|---|---|---|
| K1 | HEAD is `145f6c1` | `git rev-parse --short HEAD` | `145f6c1` |
| K2 | `waitForCollectionReady` waits for `perfCollectionReadyPattern` with a 15000 ms timeout, then calls `waitForStudioQuiet` | `grep -n -A10 '^export async function waitForCollectionReady' perf/lib/page.ts` | l.108–117, as in the output file |
| K3 | there are two callers of `waitForCollectionReady`, both with `'after load'` | `grep -rn 'waitForCollectionReady(' app perf e2e` | 3 lines (the definition + `studio-lab-interactions…:652` + `studio-lab.perf…:576`) |
| K4 | both specs start at step `load` and record `aborted at ${step}: <first line>` | `grep -n "let step = 'load'\|aborted at \${step}" …` | 4 lines (563/688, 639/738) |
| K5 | the demo failed copy has a singular and a plural branch | `grep -n -A4 '^  failed: (count) =>' app/lib/arrangement/collection.ts` | l.22–25 |
| K6 | the status line renders with `data-testid="arrangement-status"` | `grep -rn 'data-testid="arrangement-status"' app --include=*.tsx` (tests excluded) | 1 line, `StudioWorkspace.tsx:3138` |
| K7 | the ready pattern is anchored at the start only | `grep -n -A2 '^export const perfCollectionReadyPattern' perf/lib/app-labels.ts` | l.32–34 |
| K8 | `emptyLanePointAfterClip` interpolates `found.ownTrack` in two texts and returns only `{ x, y }` | `grep -n "found.ownTrack\|return { x: found.point.x" …interactions…` | l.219, 221, 222, 224 |
| K9 | the click-live detail has three keys | `grep -n -A7 "put('interact.harness.click-live'" …` | l.514–521 |
| K10 | `PerfSample.detail` is `Record<string, number \| string \| boolean>` | `grep -n 'detail?: Record' perf/lib/report.ts` | l.7 |
| K11 | vitest and Biome include `app/**` only | `grep -n include vitest.config.ts biome.json` | 2 lines |
| K12 | doc 208 l.88 names round 281 | `grep -n 'round 281' …208…` | l.88 |
| K13 | no `In Progress (stage` line in the docs | `grep -rn … \| wc -l` | 0 |
| K14 | the last doc number is 209 | `ls … \| tail -1` | `209-perf-export-window-page-clock.md` |
| K15 | "empty Stems lane" is in the sequence text and in both click-live notes | `grep -n 'empty Stems lane' …` | 3 lines (spec l.60, budgets l.53 and l.797) |
| K16 | the resources spec does not call `waitForCollectionReady` | `grep -c … perf/studio-lab-resources.perf.spec.ts` | 0 |
| K17 | the 90 s library-ready predicate exists in three copies | `grep -n "polling: 'raf', timeout: 90000" perf/*.ts` | 3 lines (interactions l.581, resources l.235, studio-lab l.528) |
| K18 | the three load-measure functions | `grep -n "^async function measureLoad" perf/*.ts` | interactions l.569 `measureLoadReady(page, result)`, resources l.225 `measureLoadReady(page)`, studio-lab l.516 `measureLoad(page, result)` |
| K19 | the resources copy returns a boolean that its caller ignores | `sed -n '/^async function measureLoadReady(page: Page)/,/^}/p' … \| grep -n …` | `await page.waitForFunction(` (no assignment) and the condition ending `wave !== null;` |
| K20 | doc 169's approach says the ready wait stays in the spec | `grep -n measureLoadReady …169…` | l.13 |
| SW-A | the new pattern and lane names do not exist at HEAD (roots `app perf e2e`) | grep count | 0 |
| SW-B | consumers of the ready pattern / status testid (roots `app perf e2e`) | file list | `StudioWorkspace.tsx`, 47 `app/lib/arrangement/__tests__` files (they render the status; none imports a perf pattern), `perf/lib/app-labels.ts`, `perf/lib/page.ts` |
| SW-C | consumers of the click-live detail keys (roots `app perf e2e`) | file list | only `perf/studio-lab-interactions.perf.spec.ts` |
| SW-D | `waitForLibraryReady` / `LibraryReadyState` do not exist at HEAD (roots `app perf e2e`) | grep count | 0 |
