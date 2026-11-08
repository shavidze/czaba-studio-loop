# Round 398: PERF-14a. A 200-clip scale harness, and a lane clip count that does not depend on the DOM

**Planned by:** B, at the round 397 → 398 planning, 2026-11-07 (`b-round-397.md`).
**Decisions:** D-29z1359 … D-29z1361 (`backlog.json` v365, `decisions_log_b`).
**Type:** stage 1 of 3 of PERF-14 (performance). A user sees and hears nothing new. One data attribute is added to each lane row. A new perf spec records how the Studio behaves with 200 clips.

**Read first:**
- `lessons.md` in full. Most relevant here: L11, L12, L23, L26, L28, L29, L30, L31, L37, L38, L56, L57, L58, L59.
- This file. Open `tasks/round-397.md` only to look up a row.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md`.
- **Claims:** `b-round-397/claims-398.sh`, run from the loop root.
  - Planning output: `b-round-397/claims-398-planning-output.txt`.
  - Output on B's sketch: `b-round-397/claims-398-on-sketch.txt`.
  - A runs the claims before editing. C runs them at the start of SOURCE-SCOPE, where they must equal the planning output. C runs them again at the end, where only the §7 facts may differ.

## Baseline: `c93d926`, clean tree
- Gate 397 is `published` with commit `c93d926` on both remotes [K1]. HEAD is `c93d926`, with 0 modified files [K2]. (The gate JSON's `head` field, `4f28bff`, is the tree before the commit. The baseline is the published commit.)
- Protected files: 11 of 11 [K3]. The frozen manifest is `b-round-397/r398-frozen-sha256.txt`: 1288 entries, 0 failures [K4]. It covers every tracked file except the one tracked grant, `ArrangementLane.tsx`.
- Grants: `b-round-397/grants-398.txt` (§4).

## 0. Why this round
- **C round 397 PASS:** `browserVerified` true, 0 bugs, and the L57 check is OK (`b-round-397/l57-check-c397.txt`). Gate 397 published it, so PERF-13 is done (13a–13d).
- **No open C bug.** Every open Critical/High/Medium finding is manual-only, `awaiting_user` or `open_root` (the 2026-10-23 rule).
- **No regression or RETRO this round.** The last regression was on 2026-11-07, in round 390 [K5]; the next is due on or after 2026-11-10. RETRO is at round 400.
- **PERF-14 is the next dependency-ordered item** in STUDIO-PERFORMANCE: "Clip virtualization + multi-resolution peaks. 200 clips: ≤ 2000 DOM elements; zoom p95 < 50 ms" (`docs/technical/performance/perf-plan.md`, PERF-14 row).
- **Premise measured at HEAD (L37).** B's probe is `b-round-397/probe/clips200.cjs` on the dev server. It clicks Add, clicks the clip's name bar, then presses Ctrl+D ×199 [K16]:

  | Measure | 1440×900 | 1280×720 |
  |---|---|---|
  | Whole-page elements | 4294 | 4277 |
  | Elements in clip subtrees (17 per clip) | 3400 | 3400 |
  | Clips mounted | 200 | 200 |
  | Clips in the window, default zoom | 1 | 1 |
  | Clips in the window, min zoom | 19 | 16 |
  | Zoom keydown max, 1× | 48 ms | 40 ms |
  | Zoom keydown max, 6× | 272 ms | 280 ms |
  | Ctrl+D ×199 | about 5 s | about 5 s |

  - Two conclusions: the 2000-element target fails today, and virtualization can meet it at any zoom.
  - The ruler is already windowed (95/79 elements, also with 200 clips) [K22]. PERF-14's old note that "the ruler grows with the project" is obsolete (D-29z1360).
- **Why the harness comes first.** No perf row covers 200 clips. The 30-clip rows live in the 2059-line interactions spec, and every later row there starts from the state those rows leave.
  - Once PERF-14b (virtualization) takes clips out of the DOM, every DOM clip count becomes a count of mounted clips. 51 test and perf files locate clips through the DOM [K14] (`b-round-397/sweep-clip-dom-locators.txt`).
  - The harness therefore needs a count from the model. This round adds it to the app as one attribute, so that 14b changes neither this harness nor its meaning (`tech-lead`).
- **Consults** (`b-round-397/consults.md`): `performance-optimizer` and `tech-lead`, both given the probe numbers.
  - They agree on the order: 14a harness → 14b virtualization → 14c peak pyramid and canvas tiles.
  - They agree on a new spec file and on measuring at minimum zoom scrolled to the middle. That state is where the 2000 budget is tightest (tech-lead estimates about 1860).
  - They disagree on which clips 14b keeps mounted. That question is recorded for 14b as `Q-14B-PIN-SELECTED` and is not ruled here.

## 1. Rulings (B)

### D-29z1360: scope of PERF-14a
1. **Model clip count on each lane row.** `ArrangementLane.tsx` adds `data-clip-count={clips.length}` on the element that carries `data-track-id={track.id}` [K8].
   - `clips` is the existing `useArrangementPreviewLaneClips(arrangement, track.id)` [K9]. It is the same list the lane renders at `{clips.map((clip) => {` [K9]. The count therefore follows a cross-lane drag preview, exactly as the rendered clips do.
   - **Contract:** the attribute is the number of clips this lane holds in the model (preview or committed). It never counts mounted elements, and it does not change when a lane is folded. PERF-14b must keep it equal to the model when clips are no longer mounted.
   - A member lane of a collapsed group is not rendered at all, and neither is its attribute. A harness that sums the attribute over lanes must first make sure no group is collapsed. At HEAD the demo shows 0 `[data-group-id]` rows at ready [K25]. The scale spec still checks that 0 elements carry `data-group-collapsed="true"` (the attribute `ArrangementGroupHeader.tsx` writes for a collapsed group [K25]) and records a problem otherwise.
   - **During a held cross-lane name-bar drag**, the lane keeps rendering the moving clip on its source lane, and the clip moves to the target only on release [K25]. Since the attribute and the rendered clips come from the same `clips` list [K9], the attribute equals the mounted count in every state at HEAD.
2. **New perf spec `perf/studio-lab-scale.perf.spec.ts`** and **`perf/budgets.scale.json`**. Every row is `record — not run on sketch: the spec is A's code this round (L58)`. The harness self-checks (§3 item 3) push to `problems`, and any problem fails the spec.
3. **No change to the existing perf specs or their budgets.** Adding an attribute adds no element and no component, so `res.dom.*` and the component rows stay the same. C checks this with PERF-RES (§6).
4. **Not in this round:** virtualization (14b), the peak pyramid and canvas tiles (14c), and the round-315 peaks Lows (14c is their home, D-29z854).

### Side effects (L49)
| Effect | Ruling |
|---|---|
| One new attribute on each lane row | Intended. It adds no render: a count change always comes with a new `clips` array (`tech-lead`, `b-round-397/sketch-review.md`) |
| SSR and hydration | Both sides read `preview ?? committed`, and the preview is null at load. No mismatch (`sketch-review.md`) |
| Tests that compare `outerHTML` | They compare the clip root, the detail panel and the overview, never the lane row (`drag-preview-render.test.tsx`). The full suite passes on the sketch [K24] |
| New spec in the `perf/` folder | `playwright.perf.config.ts` already picks up every `*.perf.spec.ts`, with one worker [K10]. The root gate does not run `test:perf` |

### Ruling lines (L4)
- **Lane row `[data-track-id]`:** the rule "no visible change" wins over everything else. The new attribute carries no style and no text.
- **Group rows:** the scale spec counts lanes with `[data-track-id][data-clip-count]` and never with bare `[data-track-id]`. Keyboard row navigation uses the bare selector, and it also matches group rows.

## 2. Reference
- This is a performance round, so the policy exempts it from the full reference section and from the `product-designer` consult.
- **Ableton:** `not applicable / perf`. Nothing a user sees or hears changes.
- **Screen budget (L39):** nothing new is visible.

## 3. What A changes
Apply `b-round-397/sketch-398.patch.txt` (sha256 `bd8fe321255fbac9…` [K17]). `git apply --check` passes on the tree. The patch covers items 1 and 2. Items 3 to 5 are A's own work.

1. **`app/components/arrangement/ArrangementLane.tsx`:** add the one attribute line from §1.1 and nothing else.
2. **`app/lib/arrangement/__tests__/lane-clip-count.test.tsx`** (new): rows LC1–LC5, as in the sketch (§5).
3. **`perf/studio-lab-scale.perf.spec.ts`** (new). Use the stem-cache spec as the shape model: its imports, its report through `buildPerfReportCore` and its `expect(report.failures).toEqual([])`. Reuse the existing `perf/lib` exports [K13]: `installPerfInstrumentation`, `snapshot`, `nowIn`, `waitForQuiet`, `blurActive`, `waitForCollectionReady`, `percentile`, `rateRowId`, `loadPerfBudgets`, `perfZoomSliderLabel`, `perfLibraryAddLabel` and `perfMoveTitlePattern`. Do not edit `perf/lib/**`.
   - **Passes:** 3. Each pass gets a fresh browser context at 1440×900, the config default.
   - **Scenario per pass, in order:**
     - **a. Load.** Open `/studio-lab` and wait for `waitForCollectionReady`.
     - **b. Build 200 clips.** Click the library Add button. Click the new clip's name bar (`perfMoveTitlePattern`) and blur it. Press Ctrl+D 199 times; after each press, wait until the clip's lane `data-clip-count` equals press + 1.
       - The lane is the clip's own lane, found with `closest('[data-track-id]')` from the added clip (Add uses the active track, not necessarily the first row; it is Music at HEAD [K25]).
       - Self-check: after the last press, the lane count is 200, there are 200 distinct `data-clip-start` values, and 0 `[data-group-collapsed="true"]` elements exist.
       - Record `scale.harness.build-ms` (wallclock). Then wait for quiet.
     - **c. Default zoom, scroll 0, at 1×.** Record:
       - `scale.dom.page`: `document.querySelectorAll('*').length`;
       - `scale.dom.clip-subtree`: the sum, over `[data-clip-kind="audio"]`, of 1 plus its descendants;
       - `scale.clips.model`: the sum of `Number(data-clip-count)` over `[data-track-id][data-clip-count]`;
       - `scale.clips.mounted`: the count of `[data-clip-kind="audio"]`;
       - `scale.clips.in-window`: the audio clips whose box intersects the box of the timeline scroller.
     - **d. Zoom keys at 1×.** 5 × `-`, then 5 × `=`, with one window per key from the press until quiet. Record:
       - `scale.zoom.keydown-p95-ms` (`percentile(…, 0.95)` of the per-key Event Timing keydown maximum; a key with no entry counts as 0);
       - `scale.zoom.keydown-max-ms`;
       - `scale.zoom.commits-per-key`;
       - `scale.zoom.components-per-key`.

       Self-check: the Zoom slider value changes in the key's direction on every key and ends at its start value.
     - **e. The same keys at 6×.** Set `Emulation.setCPUThrottlingRate` to 6, repeat step d, then set the rate back to 1. Use the same ids through `rateRowId(…, 6)` (`.6x`).
     - **f. Minimum zoom.** Press `-` until the slider's `aria-valuenow` equals its `aria-valuemin` (at most 60 keys; a problem otherwise), then wait for quiet. Record `scale.dom.page.min-zoom`, `scale.clips.mounted.min-zoom` and `scale.clips.in-window.min-zoom`.
     - **g. Minimum zoom, scrolled to the middle.** Set the timeline scroller's `scrollLeft` to `round((scrollWidth − clientWidth) / 2)` and wait for quiet. Record `scale.dom.page.min-zoom-mid`, `scale.clips.mounted.min-zoom-mid` and `scale.clips.in-window.min-zoom-mid`.
       - Self-check: `scrollLeft` > 0 afterwards, and `scale.clips.in-window.min-zoom-mid` ≥ 1.
     - **h. Scroll page crossings at minimum zoom.** From the middle, add `clientWidth` to `scrollLeft` 4 times, with one window per step. Record `scale.scroll.commits-per-step`, `scale.scroll.components-per-step` and `scale.scroll.loaf-max-ms`.
   - **Scroller:** the timeline scroller is the scroll container that holds `[data-testid="arrangement-ruler"]` [K12]. Find it by walking up to the first ancestor whose `scrollWidth > clientWidth`. Never hard-code a class.
   - **Results:** write `test-results/perf/latest-scale.json` and a stamped copy. The sequence text lists steps a–h.
4. **`perf/budgets.scale.json`** (new). Add one row for each id in item 3, plus `scale.harness.build-ms`, each with `mode: "record"` and `budget: null`. Use `kind: "deterministic"` for counts and `kind: "wallclock"` for ms. The owner is `PERF-14a`. Each note says what is measured and in which state, and ends with "record — not run on sketch (L58)".
5. **`docs/implementation/2026/quarter-IV/254-perf-scale-harness.md`** (new). The number 254 is free [K6]. Write it in Georgian, with the 7 TEMPLATE headings in order (L26).
   - l.4 must be byte-exact: `**სტატუსი:** In Progress (stage 1 of 3; C round 398 PASS)`. This is L28's multi-stage form; 14b and 14c will close it.
   - The contract section describes the spec's steps a–h, every row id, the self-checks and the `data-clip-count` contract (§1.1, L34).
   - Include the premise table and its files: `b-round-397/probe/head-200-*.json`.
   - TODO: list 14b (virtualization, `Q-14B-PIN-SELECTED`, the 51-file DOM-locator sweep) and 14c (the pyramid and the round-315 Lows). Cite only ids that exist (L26).

**No `as`, `any` or `@ts-ignore`.** A deviation from §1 is a STOP (L11).

**Forbidden:**
- every path outside the grants, in particular `perf/lib/**`, the three existing perf specs and their budget files, `playwright.perf.config.ts`, `ArrangementClip.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx` and `view.ts`;
- the global forbidden files and actions, the protected files and `package.json`;
- commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-397/grants-398.txt`)
- `app/components/arrangement/ArrangementLane.tsx` (the one attribute line only)
- `app/lib/arrangement/__tests__/lane-clip-count.test.tsx` (new)
- `perf/studio-lab-scale.perf.spec.ts` (new)
- `perf/budgets.scale.json` (new)
- `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md` (new)

## 5. A: tests
Row ids are binding. Run the unit mutants on a scratch copy outside `store/` with B's runner: `python3 -I b-round-397/mutants/run.py <scratch-root> a-round-398/mutants`. Never omit the second argument. B's result is in `b-round-397/mutants/summary.txt`: 5 of 5 red, and pristine rc 0 before and after [K21].

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **LC1** | Mount video 1 clip, music 2, sfx 0 | Lane counts `['1', '2', '0']` | MU-398-NO-ATTR, MU-398-TOTAL |
| **LC2** | Select m2 and duplicate; undo; select m1 and delete | music 3 → 2 → 1; video 1; sfx 0 | MU-398-NO-ATTR, MU-398-TOTAL, MU-398-STALE |
| **LC3** | After mount, and after duplicating m1+m2 | Every lane count equals the model count for its track; music 4 | MU-398-NO-ATTR, MU-398-TOTAL, MU-398-STALE |
| **LC4** | `previewClipGeometry` moves m1 to sfx, then `previewClipGeometry(before)` clears it | music/sfx `['1', '1']` during the preview, then `['2', '0']` | MU-398-COMMITTED (committed clips filtered by track) |
| **LC5** | Click "Fold or unfold — Music" | `data-track-folded` `true`; music count `2` | MU-398-FOLD-ZERO |

- **Collision (L23):** the sweep for `data-clip-count` over `app`, `perf` and `e2e` gives 0 files at HEAD [K8].
- The full suite on the sketch has 260 files and 3852 tests, rc 0 (`b-round-397/precheck-full.log`) [K24].
- **Covering set:** `b-round-397/covering-vitest.txt` holds 63 files [K20]: every test file under `app/**` that names `data-track-id`, `data-clip-count` or `ArrangementLane`, plus the new file. Its perf hits (`perf/lib/app-labels.ts`, the interactions spec) are not vitest files.
- **Timeout headroom (L31):** the slowest covering test at gate 397 is CP12a, at 5.0 s under a 30 s describe timeout (17 %) [K20, `b-round-397/gate397-slow-tests.txt`]. The new file runs in under 1 s.

**A also runs:**
- `npm run typecheck`;
- `npm run lint`;
- scoped `npx biome check` on the 2 `app/**` paths. Biome ignores `perf/**` [K11], so typecheck covers the spec (L30);
- `npx vitest run $(cat b-round-397/covering-vitest.txt)`;
- the claims script at the start and at the end;
- the `code-reviewer` (5 files changed).

**A runs the new perf spec once, alone (L38):** `npx playwright test --config playwright.perf.config.ts perf/studio-lab-scale.perf.spec.ts`.
- `failures` must be empty and every self-check must pass.
- A spec that cannot finish within the default 15-minute test timeout is a STOP. Do not cut passes on your own.
- Report the medians next to B's dev probe. They are records, not asserts.

A does not run the full suite, `verify`, the build outside the perf config, or the other perf specs.

**A's report, `a-round-398.md`:**
- the changed lines;
- each command, with its rc and a log path under `a-round-398/`;
- the mutant logs;
- the scale spec's rows;
- any deviation from the sketch;
- the reviewer's notes (Architecture notes go to B as signals).

## 6. C: rows
Run at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, with a fresh context per run. Load `/studio-lab` once, untimed, in a browser first (L38). Run the heaviest rows first (L59).

| Row | Steps | PASS when |
|---|---|---|
| **SCALE-SPEC** (run alone, first) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-scale.perf.spec.ts`; copy `test-results/perf/latest-scale.json` to `c-round-398/perf-results/` | rc 0 and `failures` empty. Every id in `perf/budgets.scale.json` has a value in all 3 passes. `scale.clips.model` = 200 and `scale.clips.mounted` = 200 (HEAD has no virtualization). `scale.dom.clip-subtree` = 3400 (B's probe [K16]). `scale.clips.in-window` = 1. `scale.clips.in-window.min-zoom-mid` ≥ 1. **Record:** every median next to B's dev probe |
| **PERF-RES** (alone) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`; copy `latest-resources.json` | `failures` empty. `res.dom.page-0/1/2`, `res.dom.clip-subtree` (17) and `res.dom.ruler-1/2` are equal to `c-round-396/perf-results/latest-resources.json` (an attribute adds no element) |
| **COUNT-BROWSER** | Each viewport, B's recipe `b-round-397/probe/groups-drag.cjs` [K25]: Add (Music), click the name bar, Ctrl+D ×2; drag the name bar onto the next lane (Stems) and hold for 400 ms; release; Ctrl+Z. Then fold Music. Record `data-clip-count` and the `[data-clip-id]` count of every lane at each step | At every step and on every lane, `data-clip-count` equals the mounted `[data-clip-id]` count. The expected mounted counts are B's HEAD probe [K25]: Music/Stems 3/0 after Ctrl+D, 3/0 while held, 2/1 after release, 3/0 after Ctrl+Z. Folding Music keeps its count 3. Take a screenshot of each step |
| **NO-VISIBLE-CHANGE** | `grep -rn 'clip-count' app --include=*.css` and `grep -rn '\[data-clip-count' app` (Tailwind arbitrary variants); full-window screenshots of the empty and the demo project at both viewports | Both greps give 0 hits, so no style can depend on the attribute. The screenshots are a plain record; no comparison is claimed |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<premium handle>` shows sign-in with no workspace; `/api/studio-token?product=<handle>&file=a.wav` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | Claims at start and end; `git status`; `sha256sum -c` on `b-round-397/r398-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | The start equals the planning output. At the end, only the 5 grants have changed (4 new); K4 has 0 failures; K3 is 11; only the §7 facts differ. `git diff` on `ArrangementLane.tsx` is the one added line |
| **DOCS** | Read doc 254 | Georgian; the 7 TEMPLATE headings in order; l.4 exact as in §3; every cited row id, mutant id and file exists; the contract section matches the spec's steps and ids. `grep -rln 'In Progress (stage' docs/implementation` gives 4 files (3 + doc 254). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **jsdom-only note:** none of the LC rows is jsdom-only in meaning, because COUNT-BROWSER covers LC1–LC5 in the browser. The mutants are A's: `a-round-398/mutants/summary.txt`.
- **Ableton:** `not applicable / perf`.
- **All L57 fields in `c-round-398.json`:**
  - `manifestPaths` = `b-round-397/r398-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
  - `missingPaths`, `countMismatches`, `claimCheckMinutes`;
  - an `origin` per finding;
  - `assertsSpecified`, `mutantsRecorded`;
  - `mutantRedOnSketch` = `b-round-397/mutants/summary.txt`;
  - `mutantRedOnTree`;
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-397/precheck-full.log`);
  - `chainHeadGateRunGreen` (gate 397 published `c93d926`);
  - `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-397/precheck-full.log` and `b-round-397/probe/head-200-*.json`; the scale spec itself was not run on a sketch, so write that);
  - `progressFile`, `stopSignal`.
- **Before hand-off:** run `tools/l57-check.py`. Write `c-round-398/progress.json` after each row (L59).

## 7. Claims that may change during the round
Taken from `diff b-round-397/claims-398-planning-output.txt b-round-397/claims-398-on-sketch.txt`, plus A's new files:
- **K2:** `c93d926 0` → `c93d926 5` (1 modified, 4 new).
- **K8:** `clip-count-attr` 0 → 1; `clip-count-sweep` 0 → 3, or 4 when a note in `perf/budgets.scale.json` names the attribute (both are allowed). The files are the lane file, the new test, the new spec and possibly the budgets file. The doc is outside the `app`/`perf`/`e2e` roots.
- **K14:** 51 → 52 on A's tree. The new spec uses `[data-clip-kind="audio"]`; the new test names neither attribute. On B's sketch it stays 51. Any other value is a mismatch to report.
- **K17:** `applies-to-tree` yes → no.
- **K18:** all three → `exists`.
- **K23:** `none` → the number of rows in `perf/budgets.scale.json`.
- **K6/K6b and K7:** doc 254 exists, l.4 as in §3, headings ≥ 7; `in-progress-docs` 3 → 4.

Every other fact must equal the planning output.

Note on `claims-398-on-sketch.txt`: B's scratch is not a git repository, so its K2 line shows a git error. Its K8 sweep is 2, because the sketch has no spec yet. Neither is a mismatch.

## 8. Out of scope (recorded, not dropped)
- **PERF-14b** (next): clip virtualization in the lane, reusing the page window that `ArrangementClip.tsx` already computes. It also covers:
  - must-stay-mounted rules, including the ruling on `Q-14B-PIN-SELECTED`, measured with select-all;
  - the 51-file DOM-locator sweep, which is its first collision block;
  - the scale rows becoming `assert` from B's sketch run: page ≤ 2000 at default zoom, at minimum zoom and at minimum zoom scrolled to the middle;
  - zoom p95 < 50 ms at 1×.
- **PERF-14c:** the power-of-two peak pyramid in the peaks worker and canvas tiles. It also closes C-R315-T1, C-R315-T2, A-R315-REVIEW-L1…L4, GATE315-S2 and GATE315-S8.
- **Architecture checkpoint, still due for root:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C with ARCH-CHECKPOINT-DECODE-REGION (`b-round-396/root-request-arch-checkpoint-due.md`). It is not blocking; this round touches neither region.
- **Deferred Low:** C-R397-NOTE-LONGTASK-1280 (D-29z1361).
- **Next items:** PERF-15, then the rest of the queue unchanged. The regression round is due at the first planning on or after 2026-11-10. RETRO is at round 400.
