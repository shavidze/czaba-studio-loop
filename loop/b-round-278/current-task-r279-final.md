# Round 279: PERF-HARNESS-SHARED-LIB-b-ii stage 1 (b-ii-1, test-only). The perf harness waits for real states instead of fixed settles outside its measurement windows, picks the deselect lane from the DOM instead of a hard-coded id, and always releases the export observer and heap poll loop

**Planned by:** B, at the round 278 → 279 planning, 2026-10-30/31. **Decisions:**
- D-29z634: round 278 closed (C PASS, gate 278 published `873d835`). SYS-5 is **მზადაა**.
- D-29z635: the gate-278 and A/C notes are recorded (Lows deferred, info, architecture signals).
- D-29z636: round 279 = b-ii-1. Stage b-ii is split (`tech-lead`): R216-MEM-POLLS-HEADROOM moves to b-ii-2 (round 280). Nothing is dropped.
- D-29z637: the per-site wait rulings of §2.1.
- D-29z638: PERF-1A-TIMEOUT-HEADROOM goes to root as ROOT-REQ-PERF-TIMEOUT (`b-round-278-root-request-perf-timeout.md`). A does not touch the timeout.
- D-29z640: the equivalence contract of §2.5.
- D-29z641: the outcome table of §11.

**Kind of round:** performance-harness, test-only. Reference-first, the AGREE note, the YouTube request, `product-designer` and the screen budget do not apply (policy 2026-10-27/28: "pure performance, refactor, test-only … rounds"). No app source changes. `oss-adoption.md` was read: no new dependency.

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §5 and `b-round-278-r279-grants.txt`. **Frozen list:** `b-round-278-r279-tree-sha256.txt` (every tracked file except the grants).

## Baseline: HEAD `873d835`, clean tree
`gates/gate-round-278.json` is `published`, commit `873d835`. At planning, `git status --short` was empty and `git ls-files | wc -l` was 1142 (`b-round-278/git-status-at-planning.txt`).

## 0. Read first
1. `lessons.md`, every role. Especially L11, L23 (the deleted-export and `perf/**` grep-root clauses), L29, L30, L31, L34, L37 and **L38 (perf runs alone)**.
2. This task.
3. B's sketch: `b-round-278/sketch.diff` (v2, §4).

**Primitives for A:** `AGENT_DISCOVERABLE_CODE.md` (new exports), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `.claude/prompts/new-test.md` does not apply (no new test file).

## 1. What changes, and why
The three perf specs wait a fixed `idleSettleMs` (1000 ms) at several places outside their measurement windows [K1][K2] (GATE214-S1). A fixed wait either wastes time or, on a slow machine, lets late work spill into the next window. The deselect click picks the lane by the hard-coded id `'stems'` [K3] (GATE214-S2). The export spec installs its "WAV created" observer and starts its heap poll loop before the `try` whose `finally` releases them [K6] (GATE223-S2).

**B measured why a plain "quiet" wait is not enough after load** (`b-round-278/probe/load-tail.json`, 3 loads of the production build):
- the readiness predicate commits at about 1.06–1.13 s;
- the collection-ready status commits about 470–510 ms later ("Demo collection ready…").

The 200 ms quiet window returns between the two. B's sketch v1 used it and the late status commit landed in the Add window: `harness.hook-live` and `interact.harness.hook-live` went from 2 to 3, and `res.mem.used-ready-mib` became nondeterministic (5.6–5.8 against 5.3) (`b-round-278/sketch1-results/`). The fixed 1000 ms had been hiding this. Sketch v2 waits for the collection-ready status text, then for quiet (§2.1).

## 2. The contract
### 2.1 Fixed waits: one ruling per site (D-29z637) [K1]
| Site at HEAD | Ruling | After |
|---|---|---|
| 1a l.574, 1b-i l.637 (after load) [K1] | replace | `waitForCollectionReady(page, result.problems, 'after load')` |
| 1b-ii l.524 (after load, before the forced GC and the ready-heap read) [K1] | **keep** | B measured that `res.mem.used-ready-mib` depends on the time since load: 5.3 at HEAD, 5.6–5.8 with a quiet wait (v1), 5.9–6.0 with the status wait (v2). The fixed 1000 ms is part of that measurement's definition, so it stays. Sketch v3 keeps it, and 1b-ii is then equivalent (§4) |
| 1a l.668 (after Play, before the group fader) [K1] | replace | `waitForPlaybackSettled(page, result.problems, 'play for fader.group.playing')` |
| 1b-i l.703 (after Play with 30 clips, before the fade drag) [K1] | replace | `waitForPlaybackSettled(page, result.problems, \`play with ${clipsTarget} clips\`)` |
| 1b-ii l.279 (300 ms after the export dialog's primary is enabled, before the click) [K1] | replace | `waitForStudioQuiet(page, result.problems, \`export ${clips}: dialog open\`)` |
| 1a l.579 (2000 ms after the Add click) [K1] | **keep** | It defines the `harness.hook-live` window [K13]. `tech-lead` (keep; doc 168's hygiene ruling [K15]) over `performance-optimizer` (replace as a named exception): keep, so this round has no named exception |
| 1a l.597 (1 s after Play, before the 5 s idle window) [K1] | **keep** | It defines where the `play.idle-*` window starts; the spec sequence and `budgets.json` notes say "1 s settle" [K10]. Both consults: keep |
| 1a l.600 [K1] | **keep** | It is the idle measurement window itself |
| 1b-ii l.180 (300 ms after forced GC) [K1] | **keep** | GC completion has no page-side signal |
| 1b-ii l.342 (`observerSettleMs` after the export window) [K1] | **keep** | A flush wait after the window closes; it feeds only wallclock long-task/LoAF rows. `performance-optimizer` proposed a double-rAF replacement; not adopted, because a rAF does not guarantee that buffered observer callbacks have run |
| 1b-ii l.659, `page.ts` l.40/l.53 [K1] | out of scope | poll intervals, not settles |

`idleSettleMs` stays declared in all three specs [K2]: 1a l.597, 1b-i l.527, 1b-ii l.524 [K16].

### 2.2 New helpers in `perf/lib/page.ts`
- `QuietWaitResult { at: number; capped: boolean }` and `waitForQuietState(page, from, minMs)`: the old `waitForQuiet` loop, which also reports whether it stopped because the 3 s cap was hit [K7]. The quiet test, cap and poll interval are unchanged.
- `waitForQuiet(page, from, minMs)` keeps its signature and returns `waitForQuietState(...).at`. Every existing caller is unchanged.
- `waitForStudioQuiet(page, problems, label)`: quiet from now with `minMs` 0. If the cap was hit it pushes `${label}: no 200 ms without commits or start() calls within 3000 ms` to `problems`. A cap hit is never silent.
- `waitForCollectionReady(page, problems, label)`: `expect(getByTestId('arrangement-status')).toHaveText(perfCollectionReadyPattern, { timeout: 15000 })`, then `waitForStudioQuiet`.
- `waitForPlaybackSettled(page, problems, label)`: `expect.poll(() => isPlaying(page), { timeout: 15000 }).toBe(true)`, then `waitForStudioQuiet`.

`perf/lib/app-labels.ts` exports `perfCollectionReadyPattern`: `^` + the escaped `workspaceCollectionCopy('demo').ready`, imported from `app/lib/arrangement/collection.ts` [K14]. The pattern is anchored at the start because `settledCollectionStatus` may append text after the ready sentence [K14]. The status line has one `data-testid="arrangement-status"` [K17]. The status text is never written into the harness by hand.

### 2.3 GATE214-S2: the deselect lane (D-29z254, re-ruled here)
`emptyLanePoint(page, 'stems')` [K3] becomes `emptyLanePointAfterClip(clip)`:
- it starts from `clip.closest('[data-track-id]')`;
- it walks the `[data-track-id]` lanes in DOM order **after** that lane, skipping a lane that contains or is contained by it;
- it uses the same probe as before: an `elementFromPoint` scan every 8 px at the lane's middle y, right half of the window only, not inside a clip, button, input or slider;
- it throws if no later lane has such a point, and also if the chosen lane is the clip's own lane.

B's probe at `873d835` (`b-round-278/probe/lane.json`): the DOM order is video, music, stems, sfx. Add lands on music, which has no free right-half point. The first later lane with one is stems (x 724 at 1440×900, x 644 at 1280×720). So behaviour is unchanged, and the 1b-i sequence text "empty Stems lane click" [K4] and the `budgets.interactions.json` note stay true and unchanged (D-29z640).

The old `emptyLanePoint` is deleted. It has no other caller in `perf`, `app` or `e2e` [SW-A].

### 2.4 GATE223-S2: release on every path [K6]
In `measureExport` (1b-ii), the observer install, the `timeOrigin` read, the poll-loop start and the download listener move inside the `try` whose `finally` releases them. Their order is unchanged: install → `timeOrigin` → poll loop → download listener → click.
- `pollLoop` is declared before the `try` as `let pollLoop: Promise<void> = Promise.resolve();` and assigned inside it.
- `let observerInstalled = false;` is set to `true` right after the install `evaluate` resolves.
- The `finally` reports `the "WAV created" observer was not released` only when `observerInstalled && !released`.

`performance-optimizer` found the wider leak: a throw between the old install and the old `try` also left the poll loop polling `cdp` every 50 ms after the context closed.

### 2.5 Equivalence contract (D-29z640)
**Oracle:** `b-round-278/baseline-results/latest*.json`. This is B's run at `873d835` on a `git archive`: 3/3 pass in 15.2 min. 1b-i took 5.5 min, 1b-ii 1.1 min and 1a 8.4 min. `complete` is true, `failures` and `problems` are empty. Its 1a (166) and 1b-i (106) deterministic medians are identical to `c-round-259/latest*.json`. Its 1b-ii differs from round 259 only in 3 DOM rows and 4 JS-bytes rows, moved by app rounds 260–278.

**Pass on A's tree:** run `python3 -I ../tmp/studio-real-loop/b-round-222/scripts/equiv-check.py <oracle> <new>` from `store/`, for each of the three reports. Each must exit **0 with 0 problems**:
- same envelope (sequence included), row ids and order, and row fields (`note` included);
- every deterministic median identical;
- every assert row's pass identical;
- `complete: true`, `failures: []`, and no pass with `abortedAt`, `pageErrors` or `problems`.

**There is no named exception.** A deterministic row that moves is a STOP (§10), not a re-baseline. b-ii-2 owns the re-baseline of the export window.

**Same-machine HEAD re-run clause** (the round-223 rule, `consults_round_223`): each cloud job runs on a fresh machine, and B measured that `res.mem.used-ready-mib` shifts with half a second of timing. A deterministic difference counts against A only if a `git archive 873d835` run **on the same machine** reproduces the oracle's value for that row. Run it alone (L38), with the same command, and give it its own Vite `cacheDir` if a dev server is involved (L38). If HEAD reproduces A's value instead, the row is machine-sensitive: record it as data, not a FAIL, and it becomes a candidate for b-ii-2's exception list.

## 3. Consults and rulings
- **`tech-lead`:**
  - helpers in `page.ts` as a thin wrapper over `waitForQuiet`, returning `capped`;
  - keep l.579, and rule l.597 [K1];
  - no new unit rows, because `vitest.config.ts` includes `app/**` only [K9] (ROOT-REQ-VITEST-PERF-INCLUDE stays open);
  - grants, and the frozen config and budgets;
  - **split (b) into its own round**;
  - the poll loop is also before the `try`;
  - file the timeout request now;
  - architecture signal B-R279-PERF-READY-WAIT-DUP (recorded, not scheduled).
- **`performance-optimizer`:**
  - the per-site table;
  - the poll-loop leak and the installed flag;
  - the lane guard;
  - "filter `kind` deterministic, then compare";
  - the mutant ideas;
  - 25 min for the timeout;
  - the b-ii-2 design (clock-offset probe, sample midpoints, keep ≥ 5).
- **Disagreements:**
  - **l.579:** keep (tech-lead) [K1].
  - **l.342:** keep (B, reason in §2.1) [K1].
  - Both are recorded in `backlog.json` `consults_round_279`.
- **Advisor:** used before writing.

## 4. B's pre-check (L23: the sketch is pre-applied and measured)
B applied all of §2 to a `git archive` copy of `873d835` (`/tmp/b278-sketch`, node_modules symlinked), saved as `b-round-278/sketch.diff`.

**Sketch v1** (quiet-only wait after load):
- `tsc` rc 0;
- perf 3/3 run: 1a and 1b-i passed, and 1b-ii failed its own determinism check on `res.mem.used-ready-mib` (`b-round-278/sketch-perf-run.log`);
- equiv-check against the oracle: 1a 1 problem and 1b-i 1 problem (`hook-live` 2 → 3); 1b-ii 2 problems (`used-ready-mib`). Every other deterministic row was identical, including `fader.group.playing.*`, `interact.drag.fade.30.playing.*`, the export rows after the dialog-open wait, and the clip-click rows after the lane change.

That result is why §2.1 uses `waitForCollectionReady` after load.

**Sketch v2** (status wait after load at all three load sites):
- `tsc` rc 0, and perf 3/3 pass in 15.0 min (1b-i 5.4, 1b-ii 1.1, 1a 8.2 min) (`b-round-278/sketch2-perf-run.log`);
- equiv-check: 1a **0 problems** and 1b-i **0 problems** (`sketch2-results/`). `hook-live` is back to 2;
- 1b-ii had 1 problem: `res.mem.used-ready-mib` 5.3 → 5.9–6.0.

**Sketch v3 = this task's sketch** (v2 with 1b-ii l.524 kept, §2.1) [K1]:
- `tsc` rc 0;
- 1b-ii re-run alone: 1 passed, equiv-check **0 problems** (`sketch3-perf-run.log`, `sketch3-results/`);
- 1a and 1b-i are byte-identical between v2 and v3, so their v2 results stand.

The final files are in `b-round-278/sketch-final/`, and `sketch.diff` is regenerated from them.

**Mutants B ran on v3** (scratch copies, removed afterwards; logs `b-round-278/mutant-*.log`):
- **MU-OBS-2: red.** Both passes shown: `abortedAt` `export 1 clip`, problems `the "WAV created" observer was not released`.
- **MU-OBS-3, the control: green.** Only `aborted at export 1 clip: MU-OBS-2`.
- **MU-LANE: red.** `abortedAt` `clip click`: "no lane after the clip's lane music has an empty timeline point".

MU-READY, MU-CAP and MU-PLAY are left to A and C.

**Re-measurement (policy: "re-measures"):** B's HEAD run (§2.5) is the oracle. PERF-1a took 8.4 min at HEAD and 8.2 min on the sketch, so the state waits save about 2 % (`performance-optimizer` estimated about 3 %).

## 5. Grants (exact; also in `b-round-278-r279-grants.txt`)
| Path | What may change |
|---|---|
| `perf/lib/page.ts` | §2.2 helpers; `waitForQuiet` becomes the wrapper. The import line from `./app-labels`. Nothing else |
| `perf/lib/app-labels.ts` | the `workspaceCollectionCopy` import and `perfCollectionReadyPattern` (§2.2). Nothing else |
| `perf/studio-lab.perf.spec.ts` | the l.574 and l.668 replacements and the import list |
| `perf/studio-lab-interactions.perf.spec.ts` | the l.637 and l.703 replacements, §2.3 (`emptyLanePoint` → `emptyLanePointAfterClip` and its call), the import list |
| `perf/studio-lab-resources.perf.spec.ts` | the l.279 replacement, §2.4, the import list. l.524 and `idleSettleMs` stay |
| `docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md` | new [K11]. l.4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 279 PASS)` (L28 multi-stage). The seven TEMPLATE headings (L26). Every cited row or mutant id exists in this task |
| `docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md` | the whole `### Helper-ების რუკა (\`perf/lib/page.ts\`)` section (L34: the new helpers), the whole `### GATE214-S2: …` section (now done in round 279), and the `PERF-HARNESS-SHARED-LIB-b-ii` bullet of `## TODO` |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | the `PERF-HARNESS-SHARED-LIB-b-ii` bullet of `## TODO` only |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | the `PERF-HARNESS-SHARED-LIB-b-ii` bullet of `## TODO` only (GATE223-S2 done; R216 → b-ii-2) |
| `docs/implementation/2026/quarter-IV/176-perf-determinism-contract.md` | the `PERF-HARNESS-SHARED-LIB-b-ii` bullet of `## TODO` only |

**Frozen:** the manifest is the authority. It includes all of `app/**` (no app change: `collection.ts` is imported, never edited), `perf/budgets*.json`, `perf/lib/{report,determinism,instrumentation,budgets,stats}.ts`, `perf/lib/report.test.ts`, `playwright.perf.config.ts`, `vitest.config.ts`, `package.json` and `package-lock.json`. **No `test.setTimeout` anywhere** (D-29z638).

**Protected auth/purchase (never touched):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`.

## 6. Tests
There is no vitest change: `perf/**` is outside the vitest include [K9]. The proof is the real perf run, the equivalence check and the named mutants.

### 6.1 What A runs (speed rules; L38: perf alone, nothing else running)
1. `npm run typecheck` (it covers `perf/**`; Biome does not, L30) and `npm run lint` (app scope, should be unchanged).
2. `CI=true npx playwright test --config playwright.perf.config.ts` once on the final tree, **alone**. Then the three `equiv-check.py` runs of §2.5. Report each spec's time from the Playwright list lines.
3. The mutants of §6.2, each on a scratch copy outside `store/` (the a-round-223 method: `git archive` + A's diff + the mutant, node_modules symlinked). Run only the spec named in the row. A spec may be stopped once its first pass's report shows the red signal (the report is written after every pass).
4. `code-reviewer` (more than 3 files). Pass its Architecture note to B.

**L31:** the harness test is above 50 % of its 15-min timeout (1a 8.4 min = 56 %). This is ruled: ROOT-REQ-PERF-TIMEOUT is filed, and this round adds no row and no pass. It is not a STOP for A unless 1a goes **above 9.4 min** (more than 1 min over B's run). Report the time either way.

### 6.2 Named mutants (each must be red; the signal is fixed in advance)
| Id | Mutant (scratch only) | Spec to run | Red signal |
|---|---|---|---|
| MU-READY | `perfCollectionReadyPattern` built from `.empty` instead of `.ready` (a copy the demo never shows; `.loading` is not used, because the status can still read the loading text when the wait starts, so it could match at once) | 1b-i | pass 1 `abortedAt` = `load` (the `toHaveText` times out after 15 s) |
| MU-CAP | in `waitForQuietState`, the evaluate argument `quietFor: quietMs` → `quietFor: 10000` (no window can be quiet; every wait runs to its 3 s cap) | 1b-ii | pass 1 `problems` contains `export 1: dialog open: no 200 ms without commits or start() calls within 3000 ms` |
| MU-PLAY | `waitForPlaybackSettled` polls `.toBe(false)` | 1b-i | pass 1 (1×) `abortedAt` = `play with 30 clips` |
| MU-LANE | `emptyLanePointAfterClip` walks only `[ownLane]` | 1b-i | pass 1 `abortedAt` = `clip click`, and the error text names `music` |
| MU-OBS-1 | `throw new Error('MU-OBS-1')` right after `observerInstalled = true;` | 1b-ii | pass 1 `abortedAt` = `export 1 clip`, and `problems` has **no** `was not released` (the `finally` released it) |
| MU-OBS-2 | MU-OBS-1's throw moved to the first line of the `try`, **and** `observerInstalled &&` removed from the `finally` | 1b-ii | `problems` **has** `was not released` (proves the flag) |
| MU-OBS-3 | MU-OBS-2's throw with the flag kept (A's code) | 1b-ii | `problems` has **no** `was not released`; this is the control for MU-OBS-2 |

MU-OBS-3 is a control, not a mutant, and must be green on that line. "Delete the wait" mutants are not used; on a fast runner they can stay green (advisor).

## 7. B's claims and sweeps (L29). Run `bash ../tmp/studio-real-loop/b-round-278/claims.sh` from `store/` at HEAD `873d835`
B's output is `b-round-278/claims-output-at-873d835.txt`.

| Tag | What | Expected |
|---|---|---|
| K1 | `waitForTimeout(` in `perf/*.ts`, `perf/lib/*.ts` | 14 lines: interactions l.637/l.703; resources l.180/l.279/l.342/l.524/l.659; 1a l.574/l.579/l.597/l.600/l.668; page.ts l.40/l.53 |
| K2 | `const idleSettleMs` | interactions l.45, resources l.50, 1a l.50 |
| K3 | `emptyLanePoint(` | definition l.188; the call l.467 with `'stems'` |
| K4 | sequence text "empty Stems lane click" | interactions l.58 |
| K5 | `perfFixtureTracks` | music, stems, sfx (app-labels l.96–98) |
| K6 | resources: `new MutationObserver` l.287, `const timeOrigin =` l.296, `const pollLoop =` l.301, the export `try {` l.321, `was not released` l.445 | as listed |
| K7 | `waitForQuiet` returns on the cap as if quiet | page.ts l.48 (`… \|\| now - start >= cap`), l.52 |
| K8 | perf timeout | `playwright.perf.config.ts` l.10, 15 min |
| K9 | vitest include | `app/**/*.test.{ts,tsx}` only |
| K10 | `budgets.json` notes with "1 s settle", "2 s after the Add" or 2000 | count 4 |
| K11 | last doc in quarter-IV | `207-sys-5-disabled-reasons-stage-2.md` |
| K12 | docs that describe these waits | 163, 168, 169, 175, 176 |
| K13 | the 1a hook-live window | l.579 `waitForTimeout(2000)` |
| K14 | `collection.ts`: `ready:` copy lines and the prefix-append branch | l.19 (demo `ready:`), l.33 (purchased), l.60 (`${settled} ${current.slice(…)}`), l.65 `workspaceCollectionCopy` |
| K15 | doc 168's ruling on the 1a Add wait | doc 168 l.209: the `waitForTimeout(2000)` after Add is the `harness.hook-live` window and stays |
| K16 | every `idleSettleMs` use | 11 lines (interactions l.45/527/637/703; resources l.50/524; 1a l.50/81/574/597/668) |
| K17 | the status testid in `app/components` | 1 |
| SW-A | `emptyLanePoint\|idleSettleMs\|waitForQuiet\b` in `perf`, `app`, `e2e` outside the specs and `page.ts` | 0 hits |
| K-LANE | browser recipe, `b-round-278/probe/lane.cjs` (run with `NODE_PATH=$PWD/node_modules` from `store/`) | `lane.json`: lanes video, music, stems, sfx; the clip on music; the first later empty lane is stems at both viewports |
| K-TAIL | browser recipe, `b-round-278/probe/load-tail.json` (the probe spec is kept as `/tmp/b278-probe/zz-probe.perf.spec.ts`, copy in `b-round-278/probe/`) | ready commit at ~1.06–1.13 s, status commit 470–510 ms later, 0 `start()` calls |

**Focus origins (L50):** not applicable. No app code, no focus change.

## 8. C rows (C runs nothing else while a perf spec runs, L38)
| Row | Check |
|---|---|
| SOURCE-SCOPE | `sha256sum -c b-round-278-r279-tree-sha256.txt` rc 0. `git status --short` lists only §5 paths (1 `??`: doc 208) |
| HUNK-SCOPE | the five perf code files (`page.ts`, `app-labels.ts` and the three specs) equal `b-round-278/sketch.diff` applied to `873d835`. Formatting may differ (Biome does not cover `perf/`); state any semantic difference. The doc hunks stay inside the §5 sections |
| CLAIMS | `claims.sh` on a clean `873d835` archive equals `claims-output-at-873d835.txt`. Plus the L29 sweep over this task |
| SWEEP | SW-A on A's tree: 0 hits. Also `grep -rn "test.setTimeout" perf` = 0 |
| KEEP-WAITS | on A's tree, 1a still has `waitForTimeout(2000)` (the hook-live window), `waitForTimeout(idleSettleMs)` once (the idle settle) and `waitForTimeout(idleMeasureMs)`. 1b-ii still has `waitForTimeout(idleSettleMs)` once (before the ready heap), l.180's 300 ms GC wait and `observerSettleMs`. 1b-i has no `waitForTimeout(idleSettleMs)` |
| TYPECHECK | `npm run typecheck` rc 0 (it covers `perf/**`) |
| PERF-RUN | `CI=true npx playwright test --config playwright.perf.config.ts` alone on A's tree: 3/3 pass. Record each spec's time and Chromium version |
| EQUIV | §2.5: the three `equiv-check.py` runs against `b-round-278/baseline-results/` exit 0 with 0 problems. On a deterministic difference, apply §2.5's same-machine HEAD re-run clause before calling it a FAIL. An environment-invalid run (overlap, machine load) is kept and replaced at most twice (L38) |
| MUTANTS | re-run MU-LANE, MU-OBS-2, MU-OBS-3 and MU-READY (fast: their passes abort early; 1b-ii is about 1 min). Each gives its §6.2 signal |
| TIMEOUT-DATA | PERF-1a time on A's tree, against 15 min. Data for ROOT-REQ-PERF-TIMEOUT, not a pass/fail row unless above 9.4 min |
| LANE-BROWSER | run `b-round-278/probe/lane.cjs` against :5173: the same order, and stems as the first later empty lane at both viewports |
| G279-AUTH | `/studio-lab` anonymous with the badge "Demo collection — no sign-in required". `/studio/middle-east` signed out shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` with no header → 401, no token. **Both viewports** (this is the round's browser row besides the perf run) |
| DOC-208 | doc 208 l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 279 PASS)`. The seven TEMPLATE headings in order (L26). The 175 helper table lists the §2.2 helpers as they are in `page.ts`. The four TODO bullets say what round 279 did and that R216 goes to b-ii-2 |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, `test:e2e:smoke`: **gate** rows, not claimed in `passed` |

`browserVerified` is about the real browser rows: PERF-RUN, MUTANTS, LANE-BROWSER and G279-AUTH. All of them run in the cloud; none needs the backend.

**Ableton conformance:** not applicable (test-only harness round).

## 9. Neighbour risk
- **Every deterministic perf row.** EQUIV covers them all; sketch v2 measured it (§4).
- **A future change to the collection-ready copy.** The pattern follows the copy through the import, so a wording change cannot break the wait silently. A removed status write would make `waitForCollectionReady` time out (MU-READY shows that failure mode), which is loud.
- **App code.** None is touched.

## 10. STOP conditions (L11)
- Any EQUIV problem: a deterministic median, an assert, the envelope or a note. Report the row and the samples. If you can, also give the same-machine HEAD re-run value (§2.5). **Do not re-baseline**, and do not rule an exception yourself.
- A §6.2 mutant that does not give its red signal: write a STOP, do not drop the row.
- Any change needed in a frozen file (budgets, config, report/determinism, app).
- PERF-1a above 9.4 min, or any spec failing.

## 11. Outcome, fixed in advance (D-29z641)
| C result | B at the round-280 planning |
|---|---|
| PASS, gate publishes, planning before 2026-11-02 | b-ii-1 is **მზადაა**. It closes GATE214-S1, GATE214-S2, GATE223-S2 and C-R223-01-GATE214-S2-PREMISE. Round 280 = b-ii-2 (R216-MEM-POLLS-HEADROOM, re-baseline with named exceptions), with the consults first |
| PASS, planning on or after 2026-11-02 | REGRESSION round first (the 3-day rule); b-ii-2 after it |
| EQUIV fails on a load-settle row only (sketch v3 was equivalent, so this would mean machine sensitivity) | a bounded fix-up: that site goes back to a kept fixed wait with a recorded reason; same grants |
| SOURCE-SCOPE fails | stop; root inspects; nothing is published |
| Gate fails | one bounded fix-up with its cause recorded |
| Root applies ROOT-REQ-PERF-TIMEOUT before C | C's TIMEOUT-DATA row also reports the percentage against the new limit, and PERF-1A-TIMEOUT-HEADROOM closes when it is ≤ 50 % |

## 12. Deliverables
- **A:**
  - the §2 changes and doc 208 plus the granted doc sections;
  - `a-round-279.md`: changed files; commands with results; the perf times; the three equiv-check outputs; the mutants table; the code-reviewer result and its Architecture note.
- **C:**
  - `c-round-279.md`;
  - `c-round-279.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`);
  - evidence under `c-round-279/`.

## 13. Root notes
- No dependency change.
- **ROOT-REQ-PERF-TIMEOUT** (`b-round-278-root-request-perf-timeout.md`) is open and non-blocking. ROOT-REQ-VITEST-PERF-INCLUDE (`b-round-223-root-request-vitest.md`) is still open.
- **SYS-5 is complete** (gate 278). ARCH-CHECKPOINT-SYS5-SOFT-DISABLED (`b-round-277.md` §5) stays optional and non-blocking.
- After C PASS, b-ii-1 is ready for the gate. That is not a release.
