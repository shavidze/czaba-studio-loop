# CURRENT TASK — Round 363: PERF-10b-ii-b. Guards that can fail for the three memo boundaries that still have none, and a perf record row for the lane-background range drag (PERF-10 stage 5 of 5)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 362 → 363 planning (`b-round-362.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v325 → v326):
- **D-29z1178:** round 362 closes as PASS. `c-round-362.json` has browserVerified true, and gate 362 published `9da8daa` [K1].
- **D-29z1179:** rulings on the round-362 findings (`b-round-362.md` §2). A-R362-DOC-STALE-MERMAID is fixed in this round (§1.3).
- **D-29z1180:** C-R320-01 premise re-measured at HEAD (§0.1). One of the four boundaries is already guarded. Three still are not, and this round adds their guards.
- **D-29z1181:** GATE320-S3 premise ruling (§0.2). No drag can produce an all-lanes range at HEAD. The uncovered gesture is the lane-background range drag, and it gets `record` rows.
- **D-29z1182:** the scope of this round (§1).
- **D-29z1183:** the order after this round (§5).

**Why this round, now.**
- REGRESSION is not due. `regression-last.json` says 2026-11-05, so the next one falls on 2026-11-08 or later, and today is 2026-11-06.
- No Critical, High or Medium finding can be worked in the cloud. The five open Mediums are `open_tech_lead_manual`, `awaiting_user` or `open_root` (`context/active-summary.md`).
- PERF-10b-ii-b is next by D-29z1176. It closes PERF-10.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28, 30, 31, 34, 38 and 58. C also reads 22, 37, 38, 57, 59 and 60.
- `c-round-362.md`, `b-round-362.md` and §0 below.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md` (new test helper names) and `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the YouTube request and the screen budget. This is a test-and-harness round with no `app/` source change and nothing new on screen.
- Ableton conformance: not applicable.

## Baseline
- HEAD is `9da8daa`, the gate-362 publication [K1]. The tree is clean (0 status entries) [K2].
- Protected files are 11/11 OK [K6]. There is no dependency change [K8].
- The budgets file has 252 rows, 95 of them asserted [K3].
- **Root lanes (2026-11-05 parallel policy).** Root may apply its own patches before the round on `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx`, or `docs/` outside docs 234 and 168. A HEAD that descends from `9da8daa` through only those paths is an allowed delta, not a STOP. This round touches no root-lane file.

## 0. Premises and B's evidence

### 0.1 C-R320-01: which memo boundaries still have no guard (D-29z1180, measured, L37)
Round 320 added four `memo` boundaries [K5]. C's round-320 mutants (`const X = XInner;`) showed that no test failed when any one of them was removed.

B re-ran the same four mutants on a HEAD scratch (`git archive 9da8daa`). It used the round-320 test set plus `drag-preview-render.test.tsx`: render-budget, clip-gain-pointer-preview, range-store, detail-panel, track-layout and drag-preview-render, 179 tests.
- Script: `b-round-362/run-head-mutants.sh`, with the mutator `b-round-362/mutate.py`.
- Results: `b-round-362/mutants-head/summary.txt` and one log per mutant.

| Boundary | Removing the memo at HEAD | Ruling |
|---|---|---|
| `ArrangementPeakPath` | **Red**: DP43, DP44, DP46, DP47 and DP48 fail (`mutants-head/ArrangementPeakPath.log`). Rounds 331–334 added them [K15] | Already guarded. Closed by L7, with no new row |
| `ArrangementDetailPlayhead` | Green, 179/179 | Gets RB-MEMO1 |
| `ArrangementDetailWaveform` | Green, 179/179 | Gets RB-MEMO2 |
| `ArrangementRangeReadout` | Green, 179/179 | Gets RB-MEMO3 |

**A-R320-REVIEW-WAVEFORM-NAME-POSITIVE** asked for a positive count for `ArrangementDetailWaveformInner`. One already exists in `drag-preview-render.test.tsx` [K15], and RB-MEMO1 adds another (`toBe(5)`). It closes on C PASS.

### 0.2 GATE320-S3: the "all-lanes drag" (D-29z1181)
The gate-320 reviewer wrote that on an all-tracks drag, every lane re-renders on every move, because `selectArrangementLaneRange` hands every lane the same `range` when `allTracks` is true [K11].
- **That branch still exists** [K11]. But at HEAD no drag can set `allTracks`:
  - In the context, the only range write with `allTracks: true` is `extendRangeToAllTracks`, the Ctrl+Shift+L keypress. The second `allTracks: true` hit is the clipboard, not the range [K11].
  - The lane-background drag (`updateRange` in `StudioWorkspace.tsx`) writes `{ start, end, trackId }` with no `allTracks` [K11].
  - Saba's SABA-B-11c answer #2 keeps multi-lane time selection out of scope.
- So an "all-lanes drag" row would measure a gesture that does not exist. **Ruling:** the gap that remains is that the harness does not time the **lane-background range drag** at all. The perf range drag uses the clip body [K12].
- This round adds that drag as `record` rows. They are a measurement, not a budget. The keyboard all-lanes extension is one write per key press, not per move, so it gets no row.

### 0.3 B's sketch for the jsdom rows (L58)
Scratch `/home/runner/b363-scratch/sc` (`git archive 9da8daa`). It does not survive the job.
- **Patch:** `b-round-362/sketch.patch.txt` (only `render-budget.test.tsx`; sha256 in `b-round-362/sketch-dispatched.sha256`). It applies on HEAD with `git apply --check`.
- **Rows** (added at the end of the existing `describe` block, reusing its `mountWorkspace()` and `beforeEach`):
  - **RB-MEMO1:** select `music-1`, open the detail panel and set a range of 2–4 s on `music`. Then make five range changes (end 5…9 s). Result: `ArrangementDetailWaveformInner` = **5** (positive control) and `ArrangementDetailPlayheadInner` = **0**.
  - **RB-MEMO2:** same setup, then two `fireEvent.change` events on `arrangement-detail-start` [K17] ("2.5", "2.75"). Result: `ArrangementDetailContentInner` = **2** (positive), `ArrangementDetailWaveformInner` = **0** and `ArrangementDetailPlayheadInner` = **0**.
    - B first tried a status write as the trigger. The detail content does not re-render on a status write, so the positive control failed. Typing in the Start field is the real user action that re-renders the content while the waveform props stay the same.
  - **RB-MEMO3:** set a range of 2–4 s on `music`. One range change re-renders `ArrangementRangeReadoutInner` exactly **1** time (positive). Then two `setStatus` writes re-render `StudioWorkspace` (> 0, positive) and `ArrangementRangeReadoutInner` = **0**.
- **Listed deviation from C-R320-01's recipe.**
  - C asked for a count of 0 "per range-drag move". RB-MEMO1 writes `setTimeRange` directly. That is the same store write the drag makes on each move: the lane-background `updateRange` and the clip range drag both write through `setTimeRange` [K11].
  - The boundary under test is a props-equality skip, so it does not depend on the pointer path.
  - C records this as a listed deviation, not as a B-spec Low.
- **Checks on the sketch:**
  - `render-budget.test.tsx` passes 13/13 (`b-round-362/sketch-render-budget.log`). The three new rows took 62–162 ms; gate 362's slowest row in this file took 1994 ms (L31 headroom).
  - `biome check` on the file is clean (`sketch-biome.log`). `npm run typecheck` rc 0 (`sketch-typecheck.log`).

| Mutant (`b-round-362/mutants/`) | Change | Red (B ran it on the sketch) |
|---|---|---|
| MU-P | `const ArrangementDetailPlayhead = ArrangementDetailPlayheadInner;` | **RB-MEMO1 only**, 12/13 (`MU-P-render-budget.log`) |
| MU-W | `const ArrangementDetailWaveform = ArrangementDetailWaveformInner;` | **RB-MEMO2 only**, 12/13 (`MU-W-render-budget.log`) |
| MU-R | `const ArrangementRangeReadout = ArrangementRangeReadoutInner;` | **RB-MEMO3 only**, 12/13 (`MU-R-render-budget.log`) |

### 0.4 The perf record rows: written by A, not sketched by B
- L58 governs asserted numbers. These rows are all `record` with `budget: null`, so no number is pinned before A's run.
- B pins the row ids, the gesture, the reset and the liveness rule (§1.2). A's run and C's run supply the values.
- A later PERF task may turn them into asserts from C's values.

## 1. Scope (A)

### 1.1 Files (exactly 5)
| # | File | Change |
|---|---|---|
| 1 | `app/lib/arrangement/__tests__/render-budget.test.tsx` | From the store root: `git apply ../tmp/studio-real-loop/b-round-362/sketch.patch.txt`, unchanged. Afterwards K7 equals `b-round-362/claims-363-sketch-output.txt` |
| 2 | `perf/studio-lab-interactions.perf.spec.ts` | §1.2 |
| 3 | `perf/budgets.interactions.json` | §1.2: 12 new `record` rows. No existing row changes |
| 4 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | §1.3 |
| 5 | `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | §1.3 |

A changes nothing else.
- No `app/` source file changes. The memo boundaries stay exactly as they are [K5].
- `perf/lib`, the other perf specs and `perf/budgets.json` / `perf/budgets.resources.json` are not touched [K9].
- e2e, config and the protected files are not touched.
- A code-reviewer Medium+ finding, or any change A believes is needed beyond these 5 files, is a STOP (L11), not an edit.

### 1.2 The lane-background range drag in the perf harness
**Gesture.**
- Add a new step, `step = 'drag background-range stopped'`, in `runInteractionPass`. It goes right after the stopped `for (const drag of dragNames)` loop and before `step = 'drag lane stopped';` [K12]. It runs at both CPU rates (1× and 6×), stopped only.
- **Grab point:** a lane-background point on a lane other than the clip's own. Both the press point and the point +`dragDistancePx` to its right must hit the lane element itself: `elementFromPoint` returns an element whose closest `[data-track-id]` is that lane, with no `[data-clip-id]` and no button, input or slider ancestor. Both points must lie inside the viewport.
  - A may add a new helper, or an options parameter on `emptyLanePointAfterClip`, as long as its existing three callers [K18] get exactly the same point as before.
  - If no such point exists, push a problem and set the live row to 0. Do not throw.
- **Drag:** `pressedGesture` with the same two halves as `measureDrag`: `dragSteps / 2` steps to +`dragDistancePx / 2`, read the mid state, then the rest to +`dragDistancePx`, then read the end state.
- **State read** (mid and end):
  - the number of `[data-testid="arrangement-lane-range"]` [K18] elements inside the target lane and in all other lanes;
  - the end time parsed from the workspace range readout `[data-testid="arrangement-range"]` [K17].

**Rows.** Write them with `rowWriter(result, 'interact.drag.background-range.stopped')` and the window from `dragWindow(whole)`. Compute them exactly as `measureDrag` computes the `rows: 'all'` stopped rows:
- `commits-per-move`;
- `move-components-max`;
- `release-commits`;
- `move-to-paint-p95`;
- `move-components-per-move`.

`rateRowId` gives the `.6x` copies. The liveness row is `interact.harness.drag-background-range-live` (and `.6x`), written with `setLive`. Its value is 1 only when **all** of these hold:
- at mid and at end, exactly 1 lane-range element is in the target lane and 0 are in other lanes;
- the end readout's end time is greater than the mid readout's end time;
- after the reset, there are 0 lane-range elements and 0 `[data-range-start]` elements.

**Reset.** One click on the clip's name bar (`clipHeaderPoint(clip)`), then `waitForQuiet`.
- That press selects the clip, makes its lane active and clears the range. A non-range clip press calls `setTimeRange(null)` [K18].
- On release without movement, the name-bar gesture returns before any commit. The clip's only `seekTo(` is in the range-body branch, and the file has no `setInsertMarker` [K18]. So the press does not move the Insert Marker and adds no Undo entry.
- After the reset, push a problem unless all of these hold: the clip is selected again (the Clip Gain fader is enabled, as `measureClipClick` reads it); 0 range elements; the Undo `title` equals its value before the step.
- **Do not** reset with a click on the lane background. That moves the Insert Marker and would change later rows.

**Budgets file.**
- Add 12 rows: the 5 metrics and the live row, each at 1× and `.6x`.
- For each row: `mode: "record"`, `budget: null` and `owner: "PERF-10b-ii-b"`. `scenario` is `lane-background range drag (time selection), stopped`, with ` (6x CPU throttle)` on the `.6x` rows. `kind` and `unit` copy the matching `interact.drag.range.stopped.*` / `interact.harness.drag-range-live` row. `note` names D-29z1181 and says the row is a record-only measurement.
- Rows become **264**. Asserted rows stay **95** [K3].

**Sequence text.** Add one entry to `interactionSequence`, between the stopped-drags entry and the lane-drag entry: `drag background-range stopped: press on an empty lane background of another lane; ${dragSteps} steps, +${dragDistancePx} px; reset with a click on the clip name bar (interact.drag.background-range.stopped.*)`.

### 1.3 Docs (Georgian, technical terms in English)
**Doc 234** (L34: the whole stage-5 section and the `## არქიტექტურა` diagram are granted). PERF-10 closes with this stage.
- **l.4 (L28):** exactly `**სტატუსი:** Completed (C round 363 PASS)`.
- **A new subsection** under `## მიდგომა`, after stage 4, titled exactly `### ეტაპი 5: PERF-10b-ii-b (round 363, D-29z1182)`. It contains:
  - §0.1's table (the HEAD mutant result, with PeakPath already guarded);
  - the three RB-MEMO rows with the MU-P/MU-W/MU-R table;
  - §0.2's ruling;
  - the 12 record rows and A's measured values (1× and 6×);
  - the closure of C-R320-01, A-R320-REVIEW-WAVEFORM-NAME-POSITIVE and GATE320-S3.
- **A-R362-DOC-STALE-MERMAID (fixed here):** the mermaid diagram matches HEAD.
  - `S -->|useArrangementIsPlaying| T[ArrangementTransport]` becomes an edge to the Play/Stop leaf (`ArrangementTransportPlayStop leaf`).
  - `S -->|getState, event time| M[ArrangementMarkerRow callback]` becomes an edge labelled `useArrangementIsPlayingReader, event time`.
  - After the edit, K14 `mermaid-old-T-edge` and `mermaid-old-M-edge` are both 0. Nothing else in the diagram changes.
- **`## შეცვლილი ფაილები`:** one dated bullet each for `render-budget.test.tsx`, the interactions spec and the budgets file.
- **`## ტესტირება`:** one stage-5 bullet that cites only real artifacts: RB-MEMO1–3, `b-round-362/mutants/summary.txt`, the new perf rows and C's round-363 PERF row.
- **`## TODO / შემდეგი ნაბიჯები`:** the bullet that starts "**PERF-10b-ii-b:**" is struck as done (C round 363 PASS).
- **The `## ` count stays 7** [K14], in TEMPLATE order (L26).

**Doc 168** (L34: the `### Pass-ის თანმიმდევრობა` section and the `## მეტრიკები` section are granted for additions only; l.4 is unchanged [K16]):
- In the sequence, one sub-bullet under item 5 for the background drag and its reset (round 363).
- In `## მეტრიკები`, one bullet naming the 12 rows, `record`, owner PERF-10b-ii-b, with D-29z1181.

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-362/claims-363.sh`, from the loop root | equals `b-round-362/claims-363-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K1, K5, K6, K8, K9, K10, K11, K13, K15 and K17 equal the planning output.</li><li>K7 equals `claims-363-sketch-output.txt`.</li><li>K3 = `rows 264 asserted 95 bg-rows 12 bg-record 12 bg-owner PERF-10b-ii-b`.</li><li>K12 `bg-mentions` ≥ 2, `dragNames 1`, `lane-drag-stopped-step 1`.</li><li>K14 = `doc234-l4 0555f820 doc234-h2 7 doc234-stage5 1 mermaid-old-T-edge 0 mermaid-old-M-edge 0` (`0555f820` is the md5 prefix of the §1.3 l.4 line with its newline).</li><li>K18 equals the planning output.</li><li>K16: `doc168-seq-heading 1`, `doc168-l4 ca98da32`, `doc168-bg` ≥ 1.</li><li>K2 = `9da8daa 5`.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck` (covers `perf/**`, L30); `npm run lint` | rc 0; lint warnings ≤ 205 (equal to HEAD) |
| A-TESTS | `npx vitest run --reporter=verbose app/lib/arrangement/__tests__/render-budget.test.tsx` | 13/13. RB-MEMO1–3 are named in the log. Each row runs under 50 % of its timeout (L31) |
| A-MUTANT | B's MU-P, MU-W and MU-R (§0.3) on A's tree, one at a time, using `b-round-362/mutate.py` on a copy. Restore after each and `git diff --stat` the source | Each is red on its own RB-MEMO row only. The source tree is unchanged afterwards. Logs go under `a-round-363/` |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1) | 40/40 |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then `python3 -I b-round-329/perf-rowcmp.py c-round-362/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` []; `problems` [] in every pass.</li><li>264 rows; **95/95** asserted pass; 0 NEW.</li><li>`interact.harness.drag-background-range-live` = 1 at 1× and 6×.</li><li>All 12 new rows have a value; A records them.</li><li>**Hard floor:** no pre-existing deterministic components or commits row is higher than C362.</li><li>Rows measured **before** the new step (load, click, zoom with 1 clip, the four stopped drags) are reported as INFO if they differ.</li><li>Rows measured **after** it (the stopped lane drag onward, both rates) must equal C362. An unexplained difference there is a STOP.</li><li>Wallclock rows are recorded only.</li><li>`durationMs` ≤ 560000, recorded.</li></ul> |
| A-REVIEW | `code-reviewer` on the 5 files | No unruled Medium+ (a Medium+ is a STOP, §1.1). Any change after the review goes back to the reviewer (L11). The Architecture note goes to B |
| A-DOC | docs 234 and 168 | as §1.3 |

### 2.2 C rows
Use a warm dev server (L38): load `/studio-lab` once in a browser before any timed probe. If `:5173` returns "504 Outdated Optimize Dep", restart it first.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-362/claims-363.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check ../tmp/studio-real-loop/b-round-362/sketch.patch.txt`; `git diff --stat` | <ul><li>5 modified files, 0 untracked.</li><li>The sketch patch reverse-applies.</li><li>No `app/` file outside `render-budget.test.tsx` changed.</li></ul> |
| RB-MEMO (jsdom guard rows) | A-TESTS' command, then B's MU-P, MU-W and MU-R on a scratch copy | 13/13 on the tree. Each mutant is red on its own row only |
| MUTANT (C's own, scratch, predicted first in `c-round-363/progress.json`) | One mutant that is **not** MU-P, MU-W or MU-R and that should defeat a boundary. Examples: <ul><li>`ArrangementDetailContentInner` passes `selection={{ ...selection }}` to the waveform;</li><li>the waveform passes `clipStart={clip.start + 0}` and a fresh object prop to the playhead;</li><li>`ArrangementRangeReadout` gets an inline `key` that changes on each StudioWorkspace render.</li></ul> Run `render-budget.test.tsx` on it | <ul><li>Red on an RB-MEMO row, or reported with its counts if it stays green.</li><li>Scratch is under `c-round-363/` only and deleted afterwards (L60); `store/` is unchanged.</li><li>A green mutant that really re-renders a guarded component is a finding against B's rows.</li></ul> |
| PERF (browser, production, alone) | A-PERF's command and comparison | <ul><li>As A-PERF: 264 rows, 95/95, 0 NEW, live = 1 at both rates, the hard floor, and the before/after rule.</li><li>C records the 12 new values.</li><li>`durationMs` is recorded.</li></ul> |
| PERF-LIB | A-PERF-LIB | 40/40 |
| BG-RANGE (browser, dev, both viewports; the harness premise) | On `/studio-lab` after "Demo collection ready" (L48), add the demo Full mix. Then, with screenshots at 1440×900 and 1280×720: <ol><li>Drag 120 px right on an empty background of another lane.</li><li>Read the lane-range elements per lane, the workspace range readout, the selected clip and the active lane.</li><li>Click the clip's name bar.</li></ol> | <ul><li>During and after the drag: exactly one lane-range element, on the dragged lane, and none on other lanes.</li><li>The readout shows a positive length.</li><li>No clip is selected.</li><li>After the name-bar click: 0 range elements, the clip is selected and the Insert Marker position text is unchanged.</li></ul> |
| MARKER-NONE-PLAYING-BACK (browser, dev, 1440×900; best effort; the round-362 playing half) | Load `/studio-lab` and add the Full mix, with no markers. Press Home, then Space. Press Ctrl+Left as soon as possible after Space; script it in the same `page.evaluate`/keyboard sequence. Repeat up to 5 times | <ul><li>If the status reads "No more markers before the playhead", the row passes.</li><li>Otherwise C records the status texts and the position at the key press, as "not observable". That is not a FAIL.</li><li>Fact: the backward target is null only while the position is ≤ `MARKER_TIME_EPS` (0.5 ms) [K18].</li><li>This row does not count toward browserVerified.</li></ul> |
| G363-AUTH (browser, both viewports) | `c-round-358/auth.mjs`, copied to `c-round-363/` | As G362-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | docs 234 and 168 | <ul><li>Doc 234 l.4 byte-exact: `**სტატუსი:** Completed (C round 363 PASS)`.</li><li>7 `## ` headings in TEMPLATE order (L26).</li><li>The mermaid diagram has no old T/M edge (K14).</li><li>Every count in stage 5 matches the live budgets file and C's PERF run (L34).</li><li>Every test the docs name exists (L26).</li><li>Doc 168 l.4 is unchanged (K16).</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify` and the e2e smoke.

**browserVerified** is false if PERF, BG-RANGE or G363-AUTH does not run. None of them needs the backend.

**L57: write all L57 fields** in `c-round-363.json`, and run `python3 -I tools/l57-check.py c-round-363.json c-round-363/l57-check.txt` until it exits 0.
- `assertsSpecified`: RB-MEMO1, RB-MEMO2 and RB-MEMO3. `interact.harness.drag-background-range-live` is an acceptance value, `record` in the budgets file, and is not listed here.
- `mutantsRecorded`: MU-P, MU-W, MU-R and C's own.
- `mutantRedOnSketch`: `b-round-362/mutants/MU-P-render-budget.log`, `MU-W-render-budget.log` and `MU-R-render-budget.log`.
- `gateChecksRunOnSketch`: `b-round-362/sketch-typecheck.log`, `b-round-362/sketch-biome.log` and `b-round-362/sketch-render-budget.log`. The full suite was **not** run by B on this sketch; the gate runs it, so write that as the reason.
- `affectedChecksNamed`: the interactions perf spec, `render-budget.test.tsx` and the perf-lib tests.
- `affectedChecksRunOnSketch`: `b-round-362/sketch-render-budget.log` and `b-round-362/mutants/summary.txt`. The perf spec has no B sketch run (§0.4).

## 3. Neighbouring behaviour that could break
- **Later perf rows.** The new step runs before the stopped lane drag. If its reset leaves a different selection, active lane, Insert Marker or Undo state, later rows change. A-PERF and PERF require every pre-existing deterministic row to equal C362.
- **The existing helpers.** `emptyLanePointAfterClip` has three callers [K18]. If A changes it, their points must stay the same, and the rows above guard it.
- **render-budget.test.tsx.** The new rows share its `beforeEach` and fake rAF. They add about 0.3 s to a file that took 8.9 s at gate 362.
- **App behaviour:** unchanged, because no `app/` source changes. G363-AUTH guards purchase protection.

## 4. STOP conditions (A)
- An A-CLAIMS pre mismatch, or a final mismatch outside §2.1. A HEAD that descends through root-lane paths only is not a mismatch.
- The sketch patch does not apply, or a change is needed outside the 5 files.
- An RB-MEMO row fails on A's tree, or a B mutant is not red on its own row.
- A-PERF: any asserted row fails; any NEW row; any `problems` entry; the live row is 0 at either rate; any pre-existing deterministic row differs from C362; or `durationMs` is above 560000.
- The code-reviewer reports a Medium+ finding.

## 5. Routed, not in scope
- **D-29z1179 (round 362 findings, `b-round-362.md` §2):**
  - A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT (= gate 362 finding 1) goes to PERF-11, which owns the `ArrangementContext.tsx` selector work. It is not a harness-round edit.
  - GATE362-L2-PS4-REACH: no action. The K7-style sweep for `setPlaying(` callers stays a claims line in any task that touches the playback store.
  - The gate-362 Architecture proposal (`ArrangementTransportLeaves.tsx`) is recorded as SIG-R362-TRANSPORT-LEAVES-FILE. It is not scheduled.
  - C-R362-MARKER-PLAYING-NONE-UNREACHABLE: the forward playing branch is not reachable by a user, because project end is a forward target and playback stops there. The backward branch needs a position ≤ 0.5 ms while playing [K18]. C gets one best-effort row for it (MARKER-NONE-PLAYING-BACK). IM24 stays the guard.
- **Architecture checkpoint:** PERF-10 closes with this round, which is a feature boundary. B has refreshed the bounded root request (`b-round-362/root-request-arch-checkpoint.md`). It is non-blocking.
- **D-29z1183, next:**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. PERF-9.
  3. PERF-11 (absorbs GATE361-S1, SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE, SIG-R361-CONTEXT-LEAF-CONSUMERS and A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT).
  4. PERF-12…15, SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
  5. STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED.

  RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- **A:** `a-round-363.md`, with every §2.1 row, its evidence under `a-round-363/`, the 12 new perf values and the code-reviewer result.
- **C:** `c-round-363.md` and `c-round-363.json` with all L57 fields, and evidence under `c-round-363/`.

## 7. Claims
Run `bash b-round-362/claims-363.sh` from the loop root. `CLAIMS_STORE` points it at a scratch.

| Output | File |
|---|---|
| Planning, on `9da8daa` (clean tree) | `b-round-362/claims-363-planning-output.txt` |
| Sketch (render-budget rows only) | `b-round-362/claims-363-sketch-output.txt` |

| Tag | What it pins |
|---|---|
| K1 | gate 362 status and commit |
| K2 | HEAD and the status entry count |
| K3 | budgets rows; asserted count; background-range rows, their `record` count and owner |
| K4 | budgets sha256 prefix |
| K5 | the four `memo` lines: `ArrangementDetailPlayhead`, `ArrangementDetailWaveform` (`ArrangementDetailPanel.tsx`), `ArrangementRangeReadout` (`StudioWorkspace.tsx`) and `ArrangementPeakPath` (`ArrangementClip.tsx`) |
| K6 | protected files OK |
| K7 | RB-MEMO row count, test count and sha of `render-budget.test.tsx` |
| K8 | `package.json` sha256 prefix |
| K9 | sha over `perf/lib`; sha over the two other perf specs and the two other budget files |
| K10 | cited artifacts missing |
| K11 | `allTracks: true` hits in `ArrangementContext.tsx` (the Ctrl+Shift+L range write and the clipboard); `allTracks` inside the workspace `updateRange`; the `allTracks` branch in `selectArrangementLaneRange` |
| K12 | the interactions spec: `background-range` mentions, the `dragNames` line, the `'drag lane stopped'` step and its sha |
| K13 | quarter-IV doc count; `pending` docs |
| K14 | doc 234: l.4 md5 prefix, `## ` count, the stage-5 heading and the two old mermaid edges |
| K15 | DP43–DP48 rows and the `ArrangementDetailWaveformInner` positive in `drag-preview-render.test.tsx` |
| K16 | doc 168: sequence heading, l.4 md5 prefix and `background-range` mentions |
| K17 | test ids `arrangement-detail-start`, `arrangement-detail-range` and `arrangement-range` |
| K18 | `arrangement-lane-range` test id; the `kind !== 'range'` range clear, the `seekTo(` calls and the `setInsertMarker` hits in `ArrangementClip.tsx`; `emptyLanePointAfterClip` callers; `MARKER_TIME_EPS` and the backward null return in `markers.ts` |

The values are in the two output files.

L29 check for C: every backticked `store/` path or symbol in §0.1, §0.2 and the Baseline section that states a current-code fact carries a `[K#]`. C lists any untagged one as a B-spec Low; no separate grep tool is required.
