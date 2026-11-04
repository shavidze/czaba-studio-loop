# Round 335: PERF-DRAG-PREVIEW stage c3-i. A cross-lane move row in the interactions perf harness, recorded at HEAD

**Planned by:** B, at the round 334 → 335 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`; D-29z1004…D-29z1010):
- **D-29z1004: round 334 closed as PASS, from C's evidence.**
  - `c-round-334.json`: `taskStatus` PASS, `browserVerified` and `realVerified` true, 13 rows, 0 bugs.
  - Gate 334 published `0d22ab9` on both remotes [K1].
  - **Stage c2b-iii → done**, and PERF-CAND-PEAK-PRIMITIVE-PROPS with it. C measured fade 9.833 per move (max 10) and move 24.267 (max 101), equal to B's sketch (`c-round-334/perf-rowcmp-vs-c333.txt`).
- **D-29z1005: the gate-334 review.**
  - Finding 1 (`clipWaveformScale` has no production caller) is added as evidence to SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY.
  - Finding 2 (the inline dB formula in the context) is added as evidence to SIG-R334-INLINE-DB-GAIN.
  - Info 3 (doc 232 quotes the sketch numbers) is closed as GATE334-I3: C's measured values equal them.
  - Info 4 (DP43–DP48 pin exact counts) is accepted as GATE334-I4.
  - The Architecture note (move `ArrangementPeakPath` into its own file after c3–c5) becomes signal ARCH-R334-PEAKPATH-FILE. It is not scheduled.
- **D-29z1006: A's three review Lows go to `deferred_low_polish`:** A-R334-REVIEW-WG9-UNDEF, A-R334-REVIEW-DP-ORDER and A-R334-REVIEW-DP43-DETAIL. This round does not own those test files.
- **D-29z1007: checkpoint D-29z915 is still unanswered**, after rounds 332–334 were published without it. B applies the recorded default, **keep**, as was done for ARCH-R207 (D-29z182):
  - c3 goes ahead;
  - moving the preview readers out stays a separate no-behaviour task after c5.
  - The request stays open (`b-round-334-checkpoint-addendum.md`).
- **D-29z1008: c3 splits into c3-i and c3-ii,** under L37 and L58.
  - The harness has no cross-lane scenario today [K3, K5], so no c3 row can be asserted.
  - **c3-i (this round)** adds the row and records HEAD's values.
  - **c3-ii** moves `clipLaneDrag` out of provider state [K7] and is measured against c3-i.
- **D-29z1009: rounds 336 and 337.**
  - If the round-336 planning falls on or after 2026-11-05, round 336 is the REGRESSION round (speed rule) and round 337 is RETRO.
  - If it falls before 2026-11-05, round 336 is RETRO, and REGRESSION is the first round planned on or after 2026-11-05.
  - c3-ii follows both.
- **D-29z1010: this task.**

**Read first:**
- From `lessons.md`: L10, L11, L29, L30, L34, L37, L38, L56, L57, L58.
- Primitives: `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (test creation), and `GEORGIAN_DOCS.md` (docs).
- This is a test-only change. No component, context or audio code is touched.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
- HEAD is `0d22ab9` (gate 334, published), with a clean tree: 0 entries in `git status` [K2].
- Protected files: 11/11 OK [K8]. No dependency changes.
- The interactions budget file has 167 rows, and no row or function named for a lane drag exists in `perf/` or `app/` [K5].
- C round 334's perf result has 167 rows, `complete` true and 0 failures [K16]. 121 of its rows are non-wallclock: `c-round-334/perf-rowcmp-vs-c333.txt` has 121 EQUAL/DIFF lines.

## 0. Why this round, and B's evidence
**The premise was measured at HEAD,** on the dev server at 1440×900, with `b-round-334/cross-lane-probe.mjs`. It is the round-328 names probe with a cross-lane path. Two runs were identical (`b-round-334/cross-head-stability.txt`); the counts are in `b-round-334/cross-head-1440-summary.txt` [K14].
- The gesture is a press on the first music clip's name bar, then:
  - 4 moves of 10 px on its own lane;
  - 1 move down into the next lane (`stems`), then 4 moves there;
  - 1 move back up, then 4 moves on its own lane;
  - release, then Ctrl+Z.
- **Own lane:** 4 commits of 19, 19, 101 and 19 components. `ArrangementProvider` does not render, and there is no ghost. This equals round 334's `move-moves`.
- **Entering the other lane:** 2 commits of 101 and 91. The provider renders in the second.
- **On the other lane:** 4 commits of **87** components each. **The provider renders on every move.** Its hooks 0 and 35 change on every move. B did not map which hooks those are; c3-ii planning maps them.
  - One ghost is visible in the `stems` lane, `data-blocked="false"`, and its start moves from 1.100 to 2.100.
- **Back on the own lane:** the ghost is gone, and the commits are again 19, 19, 101 and 19.
- **Release:** 1 commit of 93. The clip stays on `music`, and Undo reads "Undo: Move clip". Ctrl+Z restores it.
- **Conclusion:** a cross-lane move costs about 4.5× a same-lane move, and the provider re-renders on every move.
  - The ghosts live in provider `useState` [K7], published from the clip's pointer handler [K7].
  - The rendered ghost carries `data-testid="arrangement-lane-move-ghost"` and `data-blocked` [K6].
  - The perf harness cannot see any of this today. Its `move` drag is horizontal only (`dragNames` [K3]), and its commit records carry only a time and a count [K10]. That is why c3-i comes first.

**Not applicable:** `product-designer`, `ableton-arrangement-expert`, reference-first, the screen budget and the YouTube request. This round changes only test code and docs, and nothing visible or audible.

**Consults:** none this round. The scenario follows the existing `measureDrag` pattern. c3-ii, which changes the store, will consult `performance-optimizer` and `tech-lead`.

## 1. What A changes (ownership)
A owns exactly these 4 files. Nothing else changes:
1. `perf/studio-lab-interactions.perf.spec.ts`
2. `perf/budgets.interactions.json`
3. `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`
4. `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`, only the sections named in §1.3

`app/**`, `perf/lib/**`, the other perf specs and budget files, `package.json`, the lock file and the protected files (`b-round-318/protected-sha256.txt`, including `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts` and `app/routes/account.downloads.tsx`) stay untouched [K15].

### 1.1 The scenario (`perf/studio-lab-interactions.perf.spec.ts`)
- **Function.** Add `measureLaneDrag(page, state, clip, result)`.
  - It runs once in the stopped block, right after the stopped `for (const drag of dragNames)` loop.
  - It runs once in the playing block, right after the playing loop and before `step = 'pause'`.
  - Set `step` to `drag lane stopped` and `drag lane playing`.
  - It runs in every pass and at both CPU rates, like the other drags, so the `.6x` copies exist.
  - Do not add `'lane'` to `DragName` or `dragNames` [K3]. The existing drags and their row ids stay as they are.
- **Playing.** As `measureDrag` does: Home, then wait for quiet, then check that playback is running. Push a problem if it is not running before or after.
- **Grab.** `const grab = await clipHeaderPoint(clip)`, the name bar, and `const target = await emptyLanePointAfterClip(clip)` [K4].
  - The target lane is `target.trackId`. The clip's lane is `target.clipTrackId`.
  - Read `undoBefore` and `before = readClipState(clip)`.
- **Gesture.** Let `s = dragSteps / 6` (10 steps) and `d = dragDistancePx / 3` (40 px) [K3]. Take an in-page timestamp (`nowIn`) at each of `t0` … `t3`:
  1. **Own lane, out:** `t0`; down at `grab`; move to `(grab.x + d, grab.y)` in `s` steps.
  2. **Cross:** `t1`; move to `(grab.x + d, target.y)` in 1 step, then to `(grab.x + 2d, target.y)` in `s` steps. Read the ghosts, then `t2`.
  3. **Own lane, back:** move to `(grab.x + 2d, grab.y)` in 1 step, then to `(grab.x + 3d, grab.y)` in `s` steps. Read the ghosts, then `t3`.
  4. **Release:** up, `tUp`, then wait for quiet, then `tEnd`, then `snapshot(page, t0, tEnd)`.
- **Ghost read** (in-page).
  - **Settle first.** Before each read, settle with one double-`requestAnimationFrame` `page.evaluate`, or with a `locator.waitFor` on the ghost with a timeout of 2 s or less. This keeps a ghost commit that lands late at 6× from becoming a false problem.
  - Do **not** use `waitForQuiet` here. It can pull a Follow page turn into the whole window (L37).
  - Then count `[data-testid="arrangement-lane-move-ghost"]` [K6] inside the lane element whose `data-track-id` equals `target.trackId` and whose `data-blocked` is `false`. Also count every lane-move ghost in the document.
- **Windows.** `firstMove` is the first in-page pointermove after the down, as in `measureDrag`.
  - The **whole** window is the same as in `measureDrag` [K4]: `firstMove < t < up`.
  - The **cross** window is the commits and pointermoves with `t1 < t < t2`.
  - The **lane** window is `firstMove < t < t1` together with `t2 < t < up`. It starts at `firstMove`, not `t0`, so the pointerdown commit (select, active track, range clear) is excluded.
- **Metric names.** No new row may use the metric `commits-per-move`. DC-KINDS in `perf/lib/report.test.ts` requires every `commits-per-move` row to match `interact.drag.(range|fade|trim|move)…` [K18].
- **Rows** (`base = interact.drag.lane.<state>`). Each is written through `rateRowId`, as the drag rows are:

| Row | Kind | Value |
|---|---|---|
| `<base>.move-components-per-move` | deterministic | the whole window's rendered-component sum ÷ its pointermoves (the `measureDrag` formula) |
| `<base>.move-components-max` | deterministic | the largest commit in the whole window |
| `<base>.release-commits` | deterministic | commits with `t >= up` |
| `<base>.cross-components-per-move` | wallclock | the cross window's sum ÷ its pointermoves |
| `<base>.lane-components-per-move` | wallclock | the lane window's sum ÷ its pointermoves |
| `<base>.move-restarts` (playing only) | deterministic | starts with `firstMove < t < up` |
| `<base>.release-restarts` (playing only) | deterministic | starts with `t >= up` |

  Each row's detail holds the move and commit counts of its window, as `windowDetail` does.

- **Liveness: `interact.harness.drag-lane-live`.** Use `setLive`, which merges the two states. Call it **after** the reset. (`measureDrag` calls `setLive` before `resetAfterDrag`; the lane drag does not.) The value is 1 only when all four hold:
  - (a) at the cross read, the target-lane non-blocked ghost count is ≥ 1;
  - (b) at the back read, the document ghost count is 0;
  - (c) after the release, the clip's closest `[data-track-id]` equals `target.clipTrackId`, and its `data-clip-start` differs from `before.start`;
  - (d) after the reset, a re-read gives a clip state equal to `before` (start, fade-in, width, no range) and a lane equal to `target.clipTrackId`. (d) is this re-read. It is not a check of the `problems` array.

  When any of these fails, push a problem that names the failed letter and the values.
  - Every pushed problem becomes a run failure: `buildPerfReport` copies each pass's `problems` into `failures` [K17].
  - So a correct run has `failures` [], and a mutant run has a non-empty `failures` that names the condition.
- **Reset.** Ctrl+Z, as `resetAfterDrag` does for the non-range drags.
  - The same restored check applies: start, fade-in, width, no range, and the Undo title back at `undoBefore`.
  - It also checks that the clip's lane `data-track-id` equals `target.clipTrackId`.
  - A may call `resetAfterDrag` and add the lane check after it, or extend it with an optional lane argument. The other drags' behaviour must not change.
- **Sequence text.** Add the lane drag to `interactionSequence`: one new entry after the stopped drags and one after the playing drags. Use the exact gesture words of the steps above.
- **Kind ruling (L37).** The segment windows are bounded by in-page timestamps, so their rows are `wallclock`. The whole-window rows use the same bounds as the existing drag rows, which are `deterministic` [K13].
  - **Pre-ruled (L10):** if a `deterministic` row of the table above varies across the 3 passes of one rate in A's run (the determinism check fails), A changes that row's kind to `wallclock` and reports the values per pass.
  - That is the only allowed kind change; it is not a STOP. Any other determinism failure is a STOP.

### 1.2 Budgets (`perf/budgets.interactions.json`)
- Add exactly 26 rows, all `mode: "record"` with `budget: null` and owner `PERF-DRAG-PREVIEW-c3-i`:
  - stopped: 5 rows;
  - playing: 7 rows;
  - `interact.harness.drag-lane-live` (`deterministic`, `record`);
  - the `.6x` copy of each of these 13.
- Each `note` says the scenario in one sentence, and the window for the window rows.
- Why the liveness row is `record`, unlike `interact.harness.drag-move-live` (assert `== 1`) [K13]: L58 says an assert ships only from C's command run on B's sketch, and B has not run this spec on a sketch. c3-ii converts it to assert `== 1` after C round 335 measures it.
- The existing 167 rows are unchanged, byte for byte [K5].

### 1.3 Docs
**Doc 232:**
- **l.1:** append `, ეტაპი c3-i — cross-lane move-ის perf row` inside the parentheses.
- **l.4:** exactly `**სტატუსი:** In Progress (stage c3-i of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4, c5; C round 335 PASS)` (L28).
- **l.5:** add `perf/studio-lab-interactions.perf.spec.ts` to the list.
- **New section** `### ეტაპი c3-i: cross-lane move-ის perf row (round 335, D-29z1008)`, after the c2b-iii section. It says, in Georgian:
  - the HEAD premise from §0, with its numbers;
  - the gesture and its three windows;
  - the 26 rows and why they are `record`;
  - that c3-ii moves `clipLaneDrag` out of provider state and is measured against these rows.
- **Other sections:**
  - one entry each under files, testing and problems (the whole-window vs segment-window kind ruling);
  - TODO: c3-ii with the liveness-row conversion.
- The `^## ` heading count stays 7 [K12].

**Doc 168 (L34):** these three sections are granted and must match the live spec after the edit:
- `### Pass-ის თანმიმდევრობა`: the lane drag in both blocks.
- `### Liveness-ის წესები`: one row for `interact.harness.drag-lane-live`, conditions (a)–(d).
- `## მეტრიკები`: a short paragraph on the `interact.drag.lane.*` rows (kinds, windows, record, owner).

No other section of doc 168 changes.

## 2. Acceptance

### 2.1 A rows (A writes `a-round-335.md` and `a-round-335/`)
| Row | Command | Pass |
|---|---|---|
| A-CLAIMS | `bash b-round-334/claims-335.sh` before any edit | Equals `b-round-334/claims-335-planning-output.txt` (empty diff). A mismatch is a STOP |
| A-TYPE | `npm run typecheck` (it covers `perf/`; Biome does not, L30) | rc 0 |
| A-LINT | `npm run lint` | rc 0, diagnostic count unchanged |
| A-PERF | Production perf, **alone** (L38), once: `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` | <ul><li>rc 0, `failures` [], `complete` true, **193** rows.</li><li>`interact.harness.drag-lane-live` and its `.6x` copy read 1 in every pass.</li><li>`python3 -I b-round-329/perf-rowcmp.py c-round-334/perf-results/latest-interactions.json <A's latest-interactions.json>` prints `EQUAL` for every one of the 121 pre-existing non-wallclock rows, 0 `DIFF`, and 18 `NEW`.</li><li>Save the results and the rowcmp output under `a-round-335/`.</li></ul> |
| A-PREMISE | From A's results | <ul><li>**STOP row:** at 1×, stopped and playing, `cross-components-per-move` > `lane-components-per-move`. If this fails, write a STOP with the numbers: the harness is not seeing the cross-lane cost B measured in §0.</li><li>**Report only:** `interact.drag.lane.<state>.move-components-max` against `interact.drag.move.<state>.move-components-max`. B did not map the dev probe's 101-component enter commit, so this is not a STOP.</li><li>Report all values.</li></ul> |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts`. This is the scratch config outside `store/` (GATE304-M1) | 34/34 pass, as at HEAD (`b-round-334/perf-lib-report-head.log`) [K19]. DC-KINDS must stay green with the 26 new rows |
| A-MUTANT (liveness red-proof) | <ul><li>A scratch copy of A's tree, not `store/`.</li><li>Mutant MU-LANE-NO-CROSS: in the cross step, use `grab.y` in place of `target.y`.</li><li>Run the spec once, alone.</li></ul> | <ul><li>`interact.harness.drag-lane-live` reads 0.</li><li>A problem naming condition (a) is pushed.</li><li>The scratch is discarded.</li><li>Save the log and results under `a-round-335/mutant/`.</li></ul> |
| A-SCOPE | `git status --short` | Exactly the 4 files of §1, 0 untracked; `app/` and `perf/lib/` clean [K15] |
| A-REVIEW | The real `code-reviewer` subagent on the 4 changed files (the 3+ files rule) | <ul><li>Report its score and findings.</li><li>A Medium+ finding inside the grants is fixed and then re-reviewed.</li><li>Code changed after the review goes back to the reviewer (L11).</li></ul> |

A does not run the full vitest suite or `npm run verify` (gate rows).

### 2.2 C rows (C writes `c-round-335.md`, `c-round-335.json` and `c-round-335/`)
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-334/claims-335.sh` at start and end | The differences from `claims-335-planning-output.txt` are exactly these:<ul><li>K2: `0d22ab9 4`;</li><li>K5: `193` plus a non-zero hit count;</li><li>K11: the new l.4;</li><li>K12: `1 1 1 7 11 ≥1`.</li></ul>K17–K20 are unchanged. Anything else is a finding |
| SOURCE-SCOPE | `git status`, `git diff --stat` | <ul><li>Exactly the 4 files; 0 untracked.</li><li>`app/` and `perf/lib/` unchanged [K15]; protected 11 OK [K8].</li><li>`DragName` and `dragNames` unchanged [K3].</li><li>The 167 old budget rows are byte-equal: compare them by id with `git show HEAD:perf/budgets.interactions.json`.</li></ul> |
| PERF | Production build of A's tree. Run the spec alone, after a browser warm-up (L38), then run `perf-rowcmp.py` vs `c-round-334/perf-results/latest-interactions.json` | <ul><li>rc 0, `failures` [], `complete` true, 193 rows, and every asserted row passes.</li><li>All 121 pre-existing non-wallclock rows are `EQUAL`. Any `DIFF` is a finding, reported with its number.</li><li>18 rows print `NEW`.</li><li>`interact.harness.drag-lane-live` (and `.6x`) reads 1 in all 3 passes.</li><li>`interact.harness.hook-live` reads 1.</li></ul> |
| PREMISE | From C's results | <ul><li>At 1× and 6×, stopped and playing: `cross-components-per-move` > `lane-components-per-move`.</li><li>`move-components-max`, lane against move: record only.</li><li>Record every new row's 3 pass values in `c-round-335/lane-rows.txt`. That file becomes c3-ii's baseline.</li><li>A deterministic new row that varies across passes is a finding, unless A ruled it `wallclock` under §1.1.</li></ul> |
| MUTANT | <ul><li>C re-runs MU-LANE-NO-CROSS on its own scratch.</li><li>C adds one mutant of its own, for example dropping condition (b)'s document count or skipping the release lane check, chosen so it fails a different condition.</li></ul> | Both make the live row 0 with a problem naming the condition. Files are restored (`cmp`) |
| CROSS-NAMES (browser) | `node b-round-334/cross-lane-probe.mjs <base> <out>` on A's tree (:5173) and on HEAD (git archive, own Vite `cacheDir`, L38), at 1440×900 | <ul><li>Both equal `b-round-334/cross-head-1440.json` in commit counts, rendered counts, ghosts, tracks and the Undo title.</li><li>The app is unchanged, so A's tree must draw the same.</li><li>The provider renders on each of the 4 cross-lane moves on both trees.</li></ul> |
| HARNESS-READ | Read the new function against §1.1 | <ul><li>The gesture, all three windows (lane from `firstMove`) and the four liveness conditions are present as specified.</li><li>The ghost reads settle with rAF or `waitFor`, not `waitForQuiet`.</li><li>`setLive` comes after the reset, and (d) is a re-read.</li><li>The reset checks the lane.</li><li>The other drags' code paths are unchanged in the diff.</li></ul> |
| PERF-LIB | The A-PERF-LIB command | 34/34 pass; DC-KINDS green |
| G335-AUTH | As G334-AUTH (`c-round-330/g330-auth.cjs`), at both viewports, in fresh anonymous contexts | <ul><li>`/studio-lab` shows the anonymous workspace and demo badge, with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| DOCS | Read doc 232 and doc 168 | <ul><li>§1.3 is matched: l.1, l.4 (byte-exact) and l.5.</li><li>The c3-i section has the §0 numbers.</li><li>The files, testing, problems and TODO entries are present.</li><li>Seven `## ` headings, in TEMPLATE order.</li><li>Doc 168's three granted sections match the live spec and budgets (L34).</li><li>Nothing else in doc 168 changed: `git diff` shows hunks only inside those sections.</li></ul> |

**L57 fields:** C writes all of them:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified`, `mutantsRecorded`;
- `mutantRedOnSketch`: `null`, with the reason "B ran no sketch; c3-i rows are record, L58";
- `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`.

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify` and e2e smoke.

**browserVerified:** CROSS-NAMES, PERF and G335-AUTH are real browser rows that can run here. None needs the backend.

**Ableton conformance:** not applicable. This round adds a measurement and changes no behaviour.

## 3. Neighbouring behaviour that could break
- **Pre-existing perf rows**, for example through state left behind by the new drag. PERF requires all 121 to be `EQUAL`.
- **Later rows in the pass** (`play`, `pause`, the 30-clip block, `select`) if the reset leaves the clip elsewhere. The reset's lane check and the `EQUAL` rows cover this.
- **The harness's own vacuity.** A cross step that never leaves the lane would record same-lane numbers. Liveness condition (a) and MU-LANE-NO-CROSS cover this.

## 4. STOP conditions (A)
- A-CLAIMS mismatch.
- Any pre-existing row `DIFF`.
- A-PREMISE fails.
- The mutant does not turn the live row 0.
- Any change needed outside the 4 files.
- A determinism failure other than the pre-ruled kind change.

## 5. Not in scope
- **c3-ii:**
  - the `clipLaneDrag` store;
  - the provider hooks seen in §0;
  - converting the c3-i rows to assert;
  - jsdom DP rows for ghosts.
- **Later stages:** c4 (groups), c5 (video), PERF-CAND-FADE-BUDGET.
- **For checkpoint D-29z915:** the preview-readers module, ARCH-R334-PEAKPATH-FILE, SIG-R334-INLINE-DB-GAIN and removing `clipWaveformScale`.
- **Deferred Lows:** A-R334-REVIEW-WG9-UNDEF, -DP-ORDER and -DP43-DETAIL.
- **Root only:**
  - `vitest.config.ts`: GATE304-M1. Nothing in `perf/lib` changes, so no scratch-config row is needed;
  - commits and pushes.

## 7. Claims
Run `bash b-round-334/claims-335.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). The expected output at HEAD is `b-round-334/claims-335-planning-output.txt`.
- **K1:** gate 334 is published, commit `0d22ab9`.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** these lines in the spec, one each:
  - `type DragName = 'range' | 'fade' | 'trim' | 'move';`;
  - the `dragNames` array;
  - `dragSteps = 60`;
  - `dragDistancePx = 120`.
- **K4:** these, one each:
  - `emptyLanePointAfterClip`;
  - `measureDrag`;
  - the whole-window filter `commit.t > firstMove && commit.t < up`.
- **K5:** the budget row count (167), and hits for `interact.drag.lane`, `drag-lane-live` or `measureLaneDrag` in `perf/` and `app/` (0).
- **K6:** the ghost testid and its `data-blocked` attribute in `ArrangementLane.tsx` (1 1).
- **K7:** the provider `useState` for `clipLaneDrag` in `ArrangementContext.tsx`, and `setClipLaneDrag({ ghosts, timeLocked })` in `ArrangementClip.tsx` (1 1).
- **K8:** protected sha, 11 OK.
- **K9:** the `regression-last` date (2026-11-02).
- **K10:** `PerfCommitRecord` has 2 fields (`t`, `rendered`) in `perf/lib/instrumentation.ts`.
- **K11:** doc 232 l.4.
- **K12:** these doc counts:
  - doc 232: c3-i in l.1, the spec in l.5, the c3-i section, and the `## ` count;
  - doc 168: the `## ` count, and its `drag-lane-live` hits.
- **K13:** kind and mode of the move rows (`deterministic/record` ×3) and of `interact.harness.drag-move-live` (`deterministic/assert`).
- **K14:** every cited artifact exists (L56).
- **K15:** `app/` and `perf/lib/` have no diff against HEAD.
- **K16:** C round 334's perf result: 167 rows, `complete` True, 0 failures.
- **K17:** `perf/lib/report.ts` puts each pass's `problems` into `failures` (the `pass.problems.map(` line, 1).
- **K18:** `perf/lib/report.test.ts`:
  - the DC-KINDS regex line for `interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move`, 1;
  - its `toHaveLength(16)`, 1.
- **K19:** the perf/lib report test at HEAD through the scratch config: `Tests 34 passed (34)` in `b-round-334/perf-lib-report-head.log`.
- **K20 (L23 sweep):** `budgets.interactions` is referenced only by the spec and `perf/lib/report.test.ts` in `app/`, `perf/` and `e2e/`; K18 covers the latter. `owner` is read in `perf/lib/budgets.ts`, which takes any non-empty string; no test enumerates owners.
