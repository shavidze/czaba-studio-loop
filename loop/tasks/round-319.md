# Round 319: PERF-8a fix-up. Finish the range store on A's round-318 tree; range drag ≤ 15 components per move

**Planned by:** B, at the round 318 → 319 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v278 → `decisions_log_b`):
- **D-29z863: round 318 ruled (L10).**
  - C round 318: FAIL, but `browserVerified` and `realVerified` are true. A stopped on §6 bullet 3 (`c-round-318.json`, `a-round-318.md`). Gate 318 was `skipped` [K1].
  - In every browser row, A's partial tree behaves **exactly like the baseline** at 1440×900 and 1280×720 (`c-round-318/rows-*.json`, `diffrows.txt`). Range and project WAV exports are byte-identical.
  - **So this round continues on that tree.** A does not revert, re-create or duplicate the round-318 work.
- **D-29z864: C-R318-02 (A's STOP, ≤ 15) is ruled. The grant widens (A's option 1); the per-move target stays.**
  - `ArrangementDetailPanel.tsx` internals are now granted (§4).
  - The per-move budget stays **≤ 15**.
  - The **max** budget becomes **≤ 35**. Reason: the largest commit in the move window is the one-time null→range transition on the first move. In that commit `ArrangementTransport` and its lucide icons re-render (about 20 fibers), because `hasRange` flips the transport's titles and enabled state (R-TRANSPORT). It happens once per gesture, not on every move.
  - The transport stays **unchanged** this round (tech-lead: wrapping its buttons in subscriber components risks remounting a focused button). Its split is recorded as a PERF-10 signal (`SIG-R319-TRANSPORT-FLIP`).
  - B's scratch sketch measured both numbers (§0.2).
- **D-29z865: C-R318-01 (+2 fibers on 37 interaction rows) is ruled. The named-fiber rule applies.**
  - **Readout wrapper:** `ArrangementRangeReadout` gets `memo()`. It has no props, so it renders only on mount and on a range change.
  - **Detail wrapper:** `ArrangementRangeDetailPanel` is **removed**.
    - `ArrangementDetailPanel` subscribes to the store itself, unconditionally. `range` becomes an **optional** prop, and an explicit value wins.
    - The two direct-render tests pass `range={null}` inside an `ArrangementProvider`, so they stay untouched.
    - Reason: `detailSelection`'s `useMemo` depends on `selectedClip` [`StudioWorkspace.tsx` ~2727–2738], so a memoised wrapper would still re-render on every clip edit.
  - **Clip overlay:** it becomes a `memo()` child with **primitive props** (track id, start, duration, `pxPerSecond`). The selector takes `Pick<ArrangementClip, 'trackId' | 'start' | 'duration'>`.
    - It bails when its clip's geometry is unchanged (click, selection, mute).
    - It renders whenever that geometry or the zoom changes (clip move, trim, zoom). That cost is inherent and named.
  - **Tolerance (named fibers).** Each non-range interaction row must satisfy A ≤ baseline + N, where N is the count of `ArrangementClipRangeOverlay` renders in that row's window. Each render is one fiber, only on commits where its clip's geometry or the zoom changed.
    - A's report gives the profiler breakdown for every row that rises.
    - C confirms the breakdown on at least 2 rising rows.
    - **Any rise not explained by the overlay is a finding.**
  - **PERF-LOAD:** the same rule, read **per load commit**. A load commit may grow only by the readout's one mount and one overlay mount per mounted clip. C states the per-commit numbers.
- **D-29z866: C-R318-03 (notices) is ruled. Accept the generator's output as is: 4 new rows, count 560 → 564.**
  - The file's own header defines a runtime entry as every lock entry without `dev: true`. TL2 asserts that `devOptional` entries are kept.
  - Root's deps commit flipped `@types/react` 18.3.27, `@types/prop-types` 15.7.15 and `csstype` 3.2.3 from `dev` to `devOptional` (zustand's optional peer).
  - So the 4 rows are the generator working correctly, not a defect. Changing what counts as runtime is a licence-policy question for root/OSS-LIC (`SIG-R319-DEVOPTIONAL-NOTICES`), not a B ruling.
- **D-29z867: C-R318-05 is ruled. The protected list is re-baselined.**
  - New file: `b-round-318/protected-sha256.txt`. It holds `package.json` at `50662e1`; the other 10 hashes are unchanged.
  - Claims K8 = 11/11 OK [K8].
  - The round-312 file is kept as history.
- **D-29z868: A's two round-318 exception items are accepted. C's SOURCE-SCOPE and EXPECT rows do not flag them again.**
  - `gesture-reentry.test.tsx`: the `range={null}` prop literal is removed, because `ArrangementClipView` no longer takes `range`. Its `expect(` count stays 37.
  - `mode-toggle-colour-ui.test.tsx` DXT8: the needle becomes `hasRange && 'border-foreground'`. Its count stays 1 and the class string is unchanged.
  - A's alternative is rejected: B does not name a variable just to satisfy a test's source-text needle.
- **D-29z869: C-R318-04 (incomplete deliverables) is closed by this round:** K14 = 5, notices, doc 230, A-MUTANTS and A-REVIEW.
- **D-29z870: C-R318-06 is pre-existing.**
  - It shows only at 1280, and C reproduced it on the baseline: "Could not split at the time selection." after Space/Space/Home.
  - It is recorded as a **Low (provisional)** in `open_findings`; its severity may rise once it is reproduced.
  - The REGRESSION round (on or after 2026-11-05) gets a repro and root-cause row for it. It is **not** in this round. Note that the Undo that follows correctly undoes the last real edit (the Add), because the split did not happen.
- **D-29z871: bookkeeping.**
  - REGRESSION is not due: `regression-last` is 2026-11-02, so the next falls on or after 2026-11-05 [K9].
  - RETRO is at round 320.
  - `lessons.md` gains two clauses (L37), with no new lines.

**Read first:** `lessons.md`. These apply directly:
- L10: rulings;
- L11: STOP;
- L23: sketch;
- L29: claims;
- L34: doc section;
- L35: notices;
- L37: budget headroom (new clause);
- L38: perf runs alone;
- L52: mutants that can fail;
- L56: artifacts;
- L57: C's fields.

**L29 note:** untagged code text below is an expected value or a new name. Facts about `store/` carry `[K#]` (§9).

## Baseline
- **HEAD `50662e1`**, which is root's `chore(deps): add zustand@5.0.16` on `a5a9c97`, **plus A's round-318 working tree: 36 status entries** [K2]. That is 34 modified files plus the untracked `app/lib/arrangement/range-store.ts` and `app/lib/arrangement/__tests__/range-store.test.tsx`. C listed them in `c-round-318/git-status-end.txt`.
- **Already in place on that tree** [K3–K7, K11–K13]:
  - zustand is 1/1;
  - `range` is out of the value memo, its deps, `latestRef` and the provider `useState` (K4 = K5 = K7 = 0);
  - the lane's `clipRange` is gone (K11 = 0);
  - the store module exists.
- **Protected files:** `b-round-318/protected-sha256.txt`, 11/11 OK [K8].
- **C's comparison baseline for PERF and R-rows:** a `git archive` of `50662e1`, unchanged.

## 0. Why this round

### 0.1 Where round 318 stopped
A's production measurement, reproduced exactly by C:
- **Per move: 21.033** components (baseline control 108.167).
- **Max: 39** (baseline 105).
- Playing restarts: 0. `drag-range-live`: 1.

A's per-component breakdown (`a-round-318.md` §2.1):
- **Main commit, 16 fibers:**
  - clip, 5: `ArrangementClipViewInner`, `GripVertical` and its forwardRef, `ArrangementPeakPath`, `ArrangementClipEnvelope`;
  - detail panel, 9: the wrapper, the panel, the chevron and its forwardRef, `ContentInner`, `Waveform`, `PeakPath`, `Playhead`, `ClipGain`;
  - readout, 2.
- **Layout-effect commit, 5 fibers:** `ContentInner`, `Waveform`, `PeakPath`, `Playhead`, `ClipGain`.

**Why the round-318 target broke:** B's ≤ 15 never subtracted the 5 fibers of the layout-effect commit that the task declared unchanged. The new L37 clause covers this.

### 0.2 B's scratch sketch (L23): measured, not projected
- **Setup:**
  - a tar copy of A's tree at `/tmp/b319s`, with `node_modules` symlinked;
  - its own vite `cacheDir`, served by a dev server on :5196;
  - A's profiler `a-round-318/diag-range-components-from-down.mjs`.
- **Sketch changes:**
  - (i) `memo()` on `ArrangementRangeReadout` and `ArrangementRangeDetailPanel`. The task removes the latter instead (D-29z865);
  - (ii) the clip's range overlay moved into a child `ArrangementClipRangeOverlay({ clip, pxPerSecond })`, which holds the existing `selectArrangementClipRange` selector;
  - (iii) `memo()` on `ArrangementDetailPlayhead` and on `ArrangementPeakPath`.
- **Evidence:**
  - `b-round-318/sketch.patch.txt` (diff against A's tree);
  - `sketch.py` and `sketch2.py`;
  - `sketch-diag-dev.json`.
- **Result** (30 moves; histogram 29 × 3, 28 × 10, 1 × 33, plus the pointerdown commit of 91, which is outside the harness window):
  - **steady state per move = 10 + 3 = 13**;
  - **first-move commit = 33**.
  - Main commit (10): overlay 1, wrapper 1, panel 1, chevron 2, ContentInner 1, Waveform 1, ClipGain 1, readout 2.
  - Layout commit (3): ContentInner, Waveform, ClipGain.
- **A's round-318 cross-check:** A found the dev totals equal to production (21/39). B expects the same, but production is C's PERF-RANGE row.

**Headroom (new L37 clause).** The 3-fiber layout commit is subtracted first: 15 − 3 = 12 for the main commit, against 10 measured.
- §1 adds three more cuts:
  - the chevron hoisted (−2 in the main commit);
  - the detail wrapper removed, with the panel subscribing itself (−1 in the main commit);
  - `memo()` on `Waveform` (−1 in the layout commit).
- B's expectation is about **9 per move**: 4 below the sketch, 6 below the budget.

**What the sketch did not measure.** It measured only the range drag. The non-range rows are governed by the named-fiber rule (D-29z865).

**Max.** 33 was measured in **dev**, without the chevron hoist. The bridge to production is A's round-318 cross-check, which found dev equal to prod (21/39). The ≤ 35 budget therefore has about 4 fibers of headroom, before the hoist.

**PeakPath memo.** It gains nothing on a clip drag, where the whole `clip` prop changes. It helps only on the range drag and on the detail panel's layout commit. A does not chase it further.

### 0.3 What changes for the user
**Nothing visible.** The time selection looks, snaps, labels, plays, splits, deletes, exports and announces exactly as at the baseline. The waveforms of the clip and the detail panel draw exactly as before. Only the render work per drag move drops.

### 0.4 Consults, reference and screen budget
- **Consults (D-29z864):** `performance-optimizer` and `tech-lead`, summarised in `b-round-318.md` §3. B adopted their conclusions:
  - `ArrangementDetailClipGain` will not bail under `memo()` without about 10 `useCallback`s and 2 `useMemo`s. It stays as it is: 1 fiber in each commit. It is recorded as a signal.
  - The Playhead and PeakPath memos are safe, since their props are numbers or stable references.
  - `Waveform` re-renders by design in the main commit, because it draws the range overlay. In the layout commit its props are unchanged.
  - The clip's `range` is read only at render time, so moving it to a child carries no stale-closure risk.
  - All props that StudioWorkspace passes to the detail wrapper are memoised or callbacks, except `detailPeaks`, whose identity is unconfirmed (INFERENCE). C's interaction rows decide it.
  - Leave the transport to PERF-10.
- **Not applicable:** reference-first, `product-designer`, the screen budget and the journey row. This is a pure performance round: no visible change and no new persistent element.

## 1. Rulings
| Id | Ruling |
|---|---|
| Keep | All round-318 work stays: the store, hooks, provider changes, event-time `getState()` reads, the range-then-selection ordering and the 27 test-file read paths. A changes it only where a row below requires it |
| Clip overlay | In `ArrangementClip.tsx`, the clip-level `useArrangementRange(... selectArrangementClipRange(state.range, …))` moves into a `memo()` child component with primitive props (track id, start, duration, `pxPerSecond`; the selector accepts the `Pick`). The child renders the existing overlay JSX and label, byte for byte. `ArrangementClipViewInner` no longer subscribes to the range. The selector line count stays 1 (K18) |
| PeakPath | `ArrangementPeakPath` becomes `memo()` (it is exported from `ArrangementClip.tsx`). Its props and output stay the same |
| Readout | `ArrangementRangeReadout` in `StudioWorkspace.tsx` becomes `memo()` (K17 = 1) |
| Detail wrapper removed | `ArrangementRangeDetailPanel` is deleted (K23 = 0). StudioWorkspace renders `<ArrangementDetailPanel …>` directly, without a `range` prop. In `ArrangementDetailPanelProps`, `range` becomes optional. The panel always calls `useArrangementRange((state) => state.range)` and uses the prop when it is not `undefined`, else the store value. The two direct-render tests (`detail-panel.test.tsx` CapHarness, `track-layout.test.tsx` R24-F) pass `range={null}` inside a provider and stay untouched. K6 becomes 8 (the wrapper's selector goes) |
| Detail panel internals | In `ArrangementDetailPanel.tsx`: `ArrangementDetailPlayhead` becomes `memo()`; `ArrangementDetailWaveform` becomes `memo()`; the header's `ChevronDown` element is hoisted into a module-level constant (or a memo wrapper) with the same props and output. The start/end layout effect is **unchanged** (K15 stays 1). `applyDetailRange`'s render-time `range` read stays: it is correct because `ContentInner` still re-renders on every range change. `ArrangementDetailClipGain` is **not** changed |
| Transport | `ArrangementTransport.tsx` is **not edited** this round. K22 is its sha, which must stay the same |
| Names | New component names follow `AGENT_DISCOVERABLE_CODE.md` (e.g. `ArrangementClipRangeOverlay`) |

## 2. Contract

### 2.1 Files (grants, §4)
**Edited this round:**
- `app/components/arrangement/ArrangementClip.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`
- `app/components/arrangement/ArrangementDetailPanel.tsx`, now internals as §1 (D-29z864)
- `perf/budgets.interactions.json`: the 5 rows of §2.3
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: the whole `## მეტრიკები` section (L34). One paragraph names the 5 asserted rows, with owner PERF-8a and the measured values.
- `THIRD_PARTY_NOTICES.md`: regenerated (§2.4)

**New:** `docs/implementation/2026/quarter-IV/230-perf-range-store.md`.

**Already changed in round 318, unchanged unless a row requires it:**
- `app/contexts/ArrangementContext.tsx`
- `ArrangementLane.tsx`, `ArrangementExportDialog.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementTransport.tsx` (frozen this round)
- `range-store.ts` and its test
- the 27 test files of round 318

### 2.2 Unit rows
- RS1–RS7 stay as in `tasks/round-318.md` §2.2, and they must pass.
- No new unit row is required. The memo changes are measured by PERF-RANGE.
- If A adds a test, it follows `.claude/prompts/new-test.md`.

### 2.3 Budgets (`perf/budgets.interactions.json`)
| Row | Change |
|---|---|
| `interact.drag.range.stopped.move-components-per-move` | `mode: "assert"`, budget `<= 15`, `owner: "PERF-8a"` |
| `interact.drag.range.playing.move-components-per-move` | same |
| `interact.drag.range.stopped.move-components-max` | `mode: "assert"`, budget `<= 35`, `owner: "PERF-8a"`. The note says that the max is the first-move null→range commit including the transport flip (D-29z864) |
| `interact.drag.range.playing.move-components-max` | same |
| `interact.drag.range.playing.move-restarts` | `mode: "assert"`, budget `== 0`, `owner: "PERF-8a"` |

- Use the existing `"op"` spelling (grep it in the budgets files).
- The `commits-per-move` rows (wallclock) and the `.6x` rows stay `record`.
- `interact.harness.drag-range-live` stays an assert `== 1`.

### 2.4 Notices (L35, D-29z866)
After the code changes, run `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u`.

**Expected:**
- **Exactly 4 new table rows:**
  - `zustand | 5.0.16 | MIT`
  - `@types/react | 18.3.27`
  - `@types/prop-types | 15.7.15`
  - `csstype | 3.2.3`
  
  The three `@types`/`csstype` rows carry their licence as the lock reports it.
- The heading `## Runtime packages (560)` becomes `(564)` [K20].
- No other line changes.
- The licence test file does not change.

### 2.5 Doc 230 (Georgian, technical terms in English; TEMPLATE's 7 headings)
- **l.4:** `**სტატუსი:** In Progress (stage 1 of 2; C round 319 PASS)` (L28).
- **Contents:**
  - the mechanism (`tasks/round-318.md` §0.2);
  - the store and the selector rule;
  - the memo boundaries of this round;
  - both STOP rulings (D-29z864, D-29z866);
  - the measured before/after numbers (108.167 → round 318's 21.033 → this round).
- **Testing:** names RS1–RS7, the mutants and C's rows. Cite only tests that exist (L26).

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-318/claims-319.sh`. Its output equals `b-round-318/claims-319-head-output.txt`. Any difference is a STOP |
| A-IMPL | §1, §2.3–§2.5 |
| A-CLAIMS-AFTER | K4 0, K5 0, K7 0, K8 11, K11 0, K12 ≥ 1, K13 1, **K14 5**, K15 1, K16 10/10, **K17 1**, K18 1, **K19 1 / 1**, **K20 `(564)` and 1**, **K21 1**, **K22 unchanged** (`b7528ac5ab192b8d`), **K23 0**, **K2 `50662e1 41`**. K6 is 8: A lists its `.range` reads, which are round 318's 9 minus the removed wrapper's selector |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0, with no new warning in a changed file |
| A-UNIT | `npx vitest run` on: `range-store.test.tsx`; the 22 files of `b-round-317/range-test-files.txt`; `gesture-reentry`, `status-lifetime`, `meta-shortcuts-ui`, `insert-marker-ui`, `mode-toggle-colour-ui`; `shortcuts.test.ts`, `export-range-ui`; `detail-panel`, `detail-panel-polish`, `track-layout`, `clip-gain-pointer-preview`, `clip-envelope-ui`, `clip-fades-ui`; `app/lib/__tests__/third-party-licenses.test.ts`. All pass, **TL5 included**. Also run `perf/lib/report.test.ts` through a scratch vitest config that includes `perf/**`, as in rounds 312–313. A reports the counts |
| A-EXPECT | `python3 -I b-round-317/expect-count.py <store>` gives 22 files and TOTAL 3,139 (no file lower). The 5 extra files keep their round-318 counts |
| A-MUTANTS | On a scratch copy, never in `store/`: MU-RANGE-IN-VALUE, MU-LANE-NEW-OBJECT, MU-NO-STATUS-REWRITE and MU-STALE-LATESTREF each turn their RS row red (as `tasks/round-318.md` §2.2). Restored, they are green |
| A-PERF (alone, L38) | Production build on a scratch copy, then `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` once. Report the §2.3 rows, `drag-range-live` and `failures` (which must be `[]` with the new asserts). Also give a per-component breakdown of one steady move and of the max commit, with A's round-318 profiler |
| A-REVIEW | `code-reviewer` (3+ files). It checks: no selector builds a new object; no event-time read uses a render snapshot, except the documented `applyDetailRange`; each memo boundary has stable props or is listed as not bailing; the overlay JSX is byte-equal; the test diffs only change the read path. A Medium+ inside the grants is fixed and re-reviewed (L11). Architecture notes are passed to B |

### 3.2 C's rows
C writes `c-round-319.md` and `c-round-319.json` as it goes, with the L57 fields:
- `assertsSpecified` = 7 (RS1–RS7);
- `mutantsRecorded` = 4;
- `mutantRedOnSketch` (on A's tree).

Each finding carries an `origin`.

**Builds.** Production builds of the baseline (a `git archive` of `50662e1`) and of A's tree, each in its own scratch. Never build inside `store/`. C re-keeps the baseline interactions JSON this time; in round 318 it was lost.

**Browser rows** run at 1440×900 and 1280×720 on `/studio-lab`. Each compares A's build with the baseline: the same visible result and the same status text. C's `c-round-318/c318-rows.mjs` may be reused.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status`; protected sha (`b-round-318/protected-sha256.txt`) | Changes beyond round 318's 36 entries are only the §2.1 "edited this round" paths and doc 230. Protected 11/11 OK. D-29z868's two items are accepted |
| CLAIMS | `claims-319.sh` | As A-CLAIMS-AFTER |
| UNIT | A-UNIT's files on C's scratch, the 4 mutants and at least one mutant of C's own | All pass, TL5 included; each mutant red; restored green |
| EXPECT | `expect-count.py` HEAD vs A | No file loses an `expect(` |
| PERF-RANGE (alone, L38) | Interactions spec on both builds | **Baseline control:** range per move ≈ 108 (it must be > 15, or the row is vacuous). **A:** stopped and playing per move ≤ 15, max ≤ 35, `drag-range-live` = 1, playing move-restarts 0, `failures` []. **Every non-range drag, click, zoom and play/pause row: A ≤ baseline + N**, where N is the number of `ArrangementClipRangeOverlay` renders in that row's window (the named-fiber rule, D-29z865). C checks the 37 rows of `c-round-318/rowcmp-interactions.txt` plus any other deterministic interaction row. For at least 2 rising rows (clip name-bar drag and clip click), C runs A's round-318 profiler (`a-round-318/diag-range-components*.mjs`, adapted) on A's build and confirms that the only added fiber is the overlay. Any rise not explained by the overlay is a finding. Clip click and the other geometry-unchanged rows are expected to show N = 0. Lower rows are listed |
| PERF-LOAD (alone) | `studio-lab.perf.spec.ts` on both builds, then the row compare | `failures` []. No rise in a fader or interaction row. `load.components` is read per load commit: a commit may grow only by the readout's one mount and one overlay mount per clip mounted in it. C states the per-commit numbers (D-29z865) |
| R-WAVEFORM (new; PeakPath memo) | Add a clip; zoom in and out twice (the toolbar zoom or Z); select the clip; open the detail panel | The clip waveform path (`arrangement-clip-waveform`) is non-empty, and its `d` changes with zoom exactly as at the baseline (compare `d` strings at the same zoom). The detail waveform (`arrangement-detail-waveform`) path equals the baseline's. A late peaks load (fresh profile, empty cache) draws the waveform without a reload |
| R-DRAG | Body-drag a time selection across a clip | The label (`mm:ss.mmm – mm:ss.mmm · n s`) updates during the drag, snaps as at the baseline (Snap on and off, Alt), and stays after release. The overlay box's left and width are equal to the baseline's |
| R-ALLTRACKS / R-CLEAR / R-SPACE | As in round 318 | As at the baseline |
| R-SPLIT / R-DELETE / R-CUT-TIME | Ctrl+E, Delete, Ctrl+Shift+X on a selection, then Undo/Redo | The same clips and status as at the baseline |
| R-LOOP / R-ZOOM / R-EXPORT | As in round 318 | The same loop brace and zoom. Range WAV export ±1 sample of the baseline (round 318: 279,600 frames) |
| R-DETAIL | Select a clip with a selection; type From/To; drag the range while the detail panel is open | The fields follow the drag (the layout effect is still there); typing moves the range; the status text equals the baseline. The detail playhead moves during playback over the selected clip, as at the baseline (Playhead memo) |
| R-BG / R-MARQUEE / R-TRANSPORT | As in round 318 | As at the baseline. Transport titles and enabled state are equal with and without a range |
| G319-AUTH | As G318-AUTH, both viewports | `/studio-lab`: anonymous workspace + demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401 |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, the build in `store/`, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if every row from PERF-RANGE through G319-AUTH ran.

**Ableton conformance:** not applicable. The behaviour is unchanged, and there is no new reference.

## 4. Grants (D-29z864)
A edits only the §2.1 "edited this round" paths and creates doc 230.
- **Nothing else:**
  - not `ArrangementTransport.tsx`;
  - not `package.json` or the lock;
  - no other `app/**` or `perf/**` file;
  - no test file beyond round 318's 27;
  - no config;
  - no protected file.
- **If another file seems to need changing**, A STOPs and names it.

## 5. Neighbouring behaviour at risk (C probes)
- **PeakPath memo:** a peaks array mutated in place would leave a stale waveform (R-WAVEFORM covers the late load).
- **Waveform memo:** the detail range overlay must still follow the drag (R-DETAIL).
- **Playhead memo:** the detail playhead must still move. It writes through `useArrangementPositionWriter`, not through props.
- **The clip overlay as a child:** its box geometry and label must equal the baseline (R-DRAG). Clips outside the range must not draw an overlay.
- **The detail panel's own subscription:** selection or group changes and range moves must still reach the panel (R-DETAIL; select another clip; drag a range).
- **The explicit `range` prop:** in the two direct-render tests it still wins over the store.
- **The 37 interaction rows:** they may rise only by the named overlay fibers (PERF-RANGE).

## 6. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-319.md` and changes nothing else when:
- A-CLAIMS differs from the head output;
- the per move > 15 or the max > 35 after §1 (A reports the breakdown);
- any non-range interaction row rises above the baseline and the cause is outside the grants;
- a test assertion would have to be removed, or a test outside round 318's 27 would have to change;
- the notices regeneration differs from the 4 rows of §2.4 and the count 564.

## 7. Next
- **After C PASS and gate 319:** PERF-8a is done.
- **Round 320:** RETRO (it is due at 320). Then REGRESSION if its planning falls on or after 2026-11-05 (with the C-R318-06 repro row), otherwise PERF-8b.
- **Signals carried:**
  - `SIG-R319-TRANSPORT-FLIP` → PERF-10;
  - `SIG-R319-CLIPGAIN-PROPS` (the detail clip gain's unstable props) → PERF-10/PERF-FADER;
  - `SIG-R319-DEVOPTIONAL-NOTICES` → root/OSS-LIC;
  - `INFO-C317-WARMUP-TIMEOUT`.

## 8. Commit readiness
After C PASS and gate 319, root publishes the round-318 and round-319 paths together, on top of `50662e1`. The tree is mid-round until then; root does not publish it.

## 9. Claims (L29 + L56)
Run `bash b-round-318/claims-319.sh` (`CLAIMS_STORE` may override the path). The head output is `b-round-318/claims-319-head-output.txt`.

| Tag | Claim | Now | After A |
|---|---|---|---|
| K1 | gate 318 | skipped (C FAIL) | same |
| K2 | HEAD, status entries | 50662e1 36 | 50662e1 41 (+ `ArrangementDetailPanel.tsx`, `perf/budgets.interactions.json`, doc 168, `THIRD_PARTY_NOTICES.md`, doc 230; round 318's 36 do not include the detail panel) |
| K3 | zustand in package.json / lock | 1 / 1 | same |
| K4 / K5 / K7 / K11 | range in the value, `latestRef`, `useState`, lane `clipRange` | 0 / 0 / 0 / 0 | same |
| K6 | `.range` in StudioWorkspace | 9 | 8 (listed) |
| K8 | protected OK (re-baselined) | 11 | 11 |
| K9 | regression-last | 2026-11-02 | same |
| K12 / K13 | zustand importers / store module | 2 / 1 | ≥ 1 / 1 |
| K14 | range budget rows asserted (all 5) | 0 | 5 |
| K15 | detail start/end layout effect | 1 | 1 |
| K16 | cited artifacts | 10/10 | 10/10 |
| K17 | memo() on `ArrangementRangeReadout` | 0 | 1 |
| K18 | `selectArrangementClipRange(state.range,` lines in ArrangementClip.tsx | 1 | 1 (now inside the memo child) |
| K19 | memo() on DetailPlayhead / PeakPath | 0 / 0 | 1 / 1 |
| K20 | notices heading; zustand row | (560); 0 | (564); 1 |
| K21 | doc 230 | 0 | 1 |
| K22 | `ArrangementTransport.tsx` sha prefix | b7528ac5ab192b8d | same |
| K23 | `ArrangementRangeDetailPanel` occurrences in StudioWorkspace | 2 | 0 |
