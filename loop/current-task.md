# Round 320: PERF-8a fix-up 2. Memo naming ruling, the explicit-range guard, and the missing deliverables

**Planned by:** B, at the round 319 → 320 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v279 → `decisions_log_b`):
- **D-29z872: round 319 ruled (L10).**
  - C round 319: FAIL, `browserVerified` and `realVerified` true. A stopped on §6 bullet 4 (`a-round-319.md`, `c-round-319.json`). Gate 319 `skipped` [K1].
  - A's handed-off tree (37 status entries [K2]) behaves exactly like the baseline in every browser row at both viewports. All 4 WAV exports are byte-identical. In production it already measures **14.15 per move, max 32**, `failures` [] (`c-round-319.md`, `perf-a-interactions.log`).
  - **This round continues on that tree.** A does not revert, re-create or duplicate rounds 318–319.
- **D-29z873: C-R319-01 (memo naming) is ruled: option O1, the project's `XInner` convention, for all five memo components.**
  - The form is `function XInner(…) { … }` followed by `const X = memo(XInner);`. `ArrangementPeakPath` keeps the `export` on the const.
  - **Why O1:** the store already has six `memo(XInner)` boundaries (`ArrangementClipViewInner`, `ArrangementOverviewInner`, `ArrangementDetailContentInner`, `ArrangementLibraryOptionInner`, `ArrangementBarsRulerInner`, `ArrangementRulerTicksInner`). The tests already key on `…Inner` runtime names. A module-level `function XInner` is not shadowed, so esbuild does not rename it to `X2`.
  - **O2 is rejected** (`XMemo = memo(X)`). It has one precedent (`LibraryInsertMarkerTextMemo`). It leaves the exported `ArrangementPeakPath` pointing at the function that is not memoised, so a later caller silently loses the boundary.
  - **O3 is rejected** (`keepNames`): a config change that affects every module.
  - **O4 is rejected** (no memos): 0.85 of headroom on per move is not a budget.
  - **Test grant (outside round 318's 27):** five string literals change from `'X'` to `'XInner'` and nothing else changes:
    - `render-budget.test.tsx` l.439, l.454, l.469: `'ArrangementDetailPlayhead'` → `'ArrangementDetailPlayheadInner'`;
    - `clip-gain-pointer-preview.test.tsx` l.224 (`PARENT_NAMES`): `'ArrangementDetailWaveform'` → `'ArrangementDetailWaveformInner'`;
    - the same file, l.557: `'ArrangementPeakPath'` → `'ArrangementPeakPathInner'`.

    No assertion is removed, and each file keeps its `expect(` count (88 / 184) [K27].
  - **B's L23 pre-check, measured on a scratch copy** (`b-round-319/sketch-o1.patch.txt`, `sketch-o1.py`):
    - the five files with O1 applied: `render-budget`, `clip-gain-pointer-preview`, `detail-panel`, `track-layout` and `range-store` pass, 5 files / 100 tests;
    - `tsc --noEmit` is clean.
    - **Name liveness (L52):** in CP1's setup window, all five new names are rendered with a count > 0: `ArrangementPeakPathInner`, `ArrangementClipRangeOverlayInner`, `ArrangementRangeReadoutInner`, `ArrangementDetailWaveformInner` and `ArrangementDetailPlayheadInner` (`b-round-319/sketch-name-liveness.txt`). So the renamed `toBe(0)` guards can fail.
- **D-29z874: C-R319-03 (the unguarded explicit `range` prop) is closed by a new unit row, RS8**, inside `detail-panel.test.tsx` (already in round 318's 27). C's mutant `C-MU-DETAIL-IGNORE-PROP` becomes a required red mutant.
- **D-29z875: C-R319-02 (incomplete deliverables) is closed by this round:** K14 = 5, K19, notices, doc 168, doc 230, A-PERF, A-MUTANTS and the full A-REVIEW.
  - A's **ChevronRight hoist** (beyond §1's ChevronDown) is accepted: same props, same output, inside the grant.
- **D-29z876: four rows of round 319 were mis-specified by B. They are rewritten here, with the same strength.**
  - R-WAVEFORM: the clip `d` does not change with zoom at the baseline either. The row now compares `d` with the baseline at each zoom step. The late-peaks sub-check is dropped, because `/studio-lab` has no mechanism for it: the demo peaks are ready before Add. The in-place mutation risk moves to A-REVIEW as a grep.
  - R-DETAIL: at 1280×720 the panel starts collapsed, and Space went to the focused toggle. The script now moves the focus off the toggle before Space. The playhead sub-check is required at **both** viewports.
  - PERF-LOAD: the harness has no per-commit breakdown. The row uses the matched-commit-count totals, and the dev profiler gives the per-commit check.
  - Named-fiber rule: the production bundle minifies names (C round 319), so attribution runs on **dev** only and counts `ArrangementClipRangeOverlayInner`.
- **D-29z877: RETRO moves from 320 to 321.** Its window becomes 305–320.
  - Reason: C's Medium findings come first, and the tree is mid-round and unpublished. A RETRO now would go through a gate that cannot pass (TL5 is red).
  - REGRESSION is not due: `regression-last` is 2026-11-02, so the next falls on or after 2026-11-05 [K9]. After RETRO 321 comes REGRESSION if its planning falls on or after 2026-11-05, otherwise PERF-8b.
- **D-29z878:** `lessons.md` L23 gains the runtime-name clause (A's §7 proposal, C-R319-01). No new line.
- **D-29z879:** two architecture signals are recorded and **not** scheduled:
  - A-R319-ARCH-DETAIL-SUBSCRIPTION: move the panel's range subscription into `ArrangementDetailContent`, so that resize and collapse state are not re-rendered during range drags;
  - SIG-R320-WAVEFORM-VIDEO-NONBAIL: `ArrangementDetailWaveform` receives a fresh `videoClipGainReason` node for video selections, so its memo does not bail there.

  Both go to PERF-10.

**Read first:** `lessons.md`. These apply directly:
- L10: rulings;
- L11: STOP;
- L23: sketch, now with the runtime-name clause;
- L29: claims;
- L34: doc section;
- L35: notices;
- L37: budget headroom;
- L38: perf runs alone;
- L52: mutants and asserts that can fail;
- L56: artifacts;
- L57: C's fields.

**L29 note:** untagged code text below is an expected value or a new name. Facts about `store/` carry `[K#]` (§9).

## Baseline
- **HEAD `50662e1`** plus **A's handed-off tree: 37 status entries** [K2]. That is round 318's 36 plus `ArrangementDetailPanel.tsx`.
- **Already in place** [K4–K7, K11–K13, K15, K18, K23]:
  - the range store;
  - `range` out of the context value;
  - the clip overlay as a child subscriber;
  - the readout memo;
  - the detail wrapper removed, with the panel subscribing itself and `range` optional;
  - both chevrons hoisted.
- Under the old `memo(function X` form there are 2 sites [K24]: the overlay and the readout.
- **Protected files:** `b-round-318/protected-sha256.txt`, 11/11 OK [K8].
- **C's comparison baseline:** a `git archive` of `50662e1`, unchanged.

## 0. Why this round
- Round 319 measured that the range store already meets the user-facing goal in production: 108.167 → 14.15 components per move. What is missing is the work that makes it safe to publish:
  - the asserted budgets;
  - the memo boundaries with honest test probes;
  - the notices (the gate's full vitest is red on TL5 without them);
  - the docs;
  - A's own measurement and mutants.
- **Expected effect of the three memos** (B's projection, not measured; C's PERF-RANGE decides it):
  - main commit 9 → 7, because PeakPath and Playhead bail;
  - layout commit 5 → 2, because Waveform, PeakPath and Playhead bail;
  - so about **9 per move**. The max (32) can only fall.
- **What changes for the user: nothing visible.** Only the render work per drag move drops.
- **Not applicable:** reference-first, `product-designer`, the screen budget and the journey row. This is a pure performance round with no visible change.
- **Consults:** round 318's `performance-optimizer` and `tech-lead` conclusions still hold (`b-round-318.md` §3). This round only rules a naming form, which the codebase convention settles, so no new consult was needed.

## 1. Rulings
| Id | Ruling |
|---|---|
| Keep | Everything in the 37-entry tree stays. A changes it only where a row below requires it |
| Memo form (D-29z873) | Five components use `function XInner(…)` + `const X = memo(XInner);`: `ArrangementClipRangeOverlay` and `ArrangementPeakPath` (`export const`) in `ArrangementClip.tsx`; `ArrangementRangeReadout` in `StudioWorkspace.tsx`; `ArrangementDetailPlayhead` and `ArrangementDetailWaveform` in `ArrangementDetailPanel.tsx`. The bodies are byte-equal to the current functions; only the declaration line and the closing line change. After the change, `memo(function` occurs 0 times in the three files [K24]. Call sites stay as they are |
| Test keys (D-29z873) | Exactly the five literals listed in D-29z873, in `render-budget.test.tsx` and `clip-gain-pointer-preview.test.tsx`. Nothing else changes in those two files |
| RS8 (D-29z874) | See §2.2 |
| Untouched | `ArrangementTransport.tsx` (K22 sha), `ArrangementDetailClipGain`, the start/end layout effect (K15 = 1), and `applyDetailRange`'s documented render-time read |

## 2. Contract

### 2.1 Files (grants, §4)
**Edited this round:**
- `app/components/arrangement/ArrangementClip.tsx`, `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`: the memo form only.
- `app/lib/arrangement/__tests__/render-budget.test.tsx` and `clip-gain-pointer-preview.test.tsx`: the five literals only.
- `app/lib/arrangement/__tests__/detail-panel.test.tsx`: RS8 added.
- `perf/budgets.interactions.json`: the 5 rows of §2.3.
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: the whole `## მეტრიკები` section (L34). One paragraph names the 5 asserted rows, with owner PERF-8a and the measured values.
- `THIRD_PARTY_NOTICES.md`: regenerated (§2.4).

**New:** `docs/implementation/2026/quarter-IV/230-perf-range-store.md` (§2.5).

**Expected K2 after A:** `50662e1 43`. That is the 37 entries, plus budgets, doc 168, notices, doc 230, `render-budget` and `clip-gain-pointer-preview`.

### 2.2 Unit rows
- RS1–RS7 stay as in `tasks/round-318.md` §2.2, and they must pass.
- **RS8 (new, explicit `range` prop wins)** goes in `detail-panel.test.tsx`, follows `.claude/prompts/new-test.md` and has `RS8` in its title [K26]. Inside an `ArrangementProvider`, with an audio clip selection:
  - **(a)** The store holds a range r inside the clip, and the panel gets `range={null}`. The panel shows the no-range state: the From/To fields and the waveform range overlay follow `null`, not r.
  - **(b)** The store holds `null`, and the panel gets `range={r}`. The panel shows r.
  - **(c)** With the prop omitted, the panel follows the store, and it updates when `setRange` runs (no remount).
  - A names the observable it uses (input values or the overlay testid) and states how the store is driven.
  - **Mutant `C-MU-DETAIL-IGNORE-PROP`** (`rangeOverride === undefined ? storeRange : rangeOverride` → `… : storeRange`) turns RS8 red. A second mutant, **`MU-DETAIL-IGNORE-STORE`** (always use the prop), turns RS8(c) red.

### 2.3 Budgets (`perf/budgets.interactions.json`). Unchanged from round 319
| Row | Change |
|---|---|
| `interact.drag.range.stopped.move-components-per-move` | `mode: "assert"`, budget `<= 15`, `owner: "PERF-8a"` |
| `interact.drag.range.playing.move-components-per-move` | same |
| `interact.drag.range.stopped.move-components-max` | `mode: "assert"`, budget `<= 35`, `owner: "PERF-8a"`. The note says that the max is the first-move null→range commit including the transport flip (D-29z864) |
| `interact.drag.range.playing.move-components-max` | same |
| `interact.drag.range.playing.move-restarts` | `mode: "assert"`, budget `== 0`, `owner: "PERF-8a"` |

- Use the existing `"op"` spelling.
- The `commits-per-move` rows and the `.6x` rows stay `record`.
- `interact.harness.drag-range-live` stays an assert `== 1`.

### 2.4 Notices (L35, D-29z866). Unchanged from round 319
Run `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u` after the code changes.

**Expected:**
- exactly 4 new rows: `zustand | 5.0.16 | MIT`, `@types/react | 18.3.27`, `@types/prop-types | 15.7.15` and `csstype | 3.2.3`, each with its licence as the lock reports it;
- the heading `(560)` becomes `(564)` [K20];
- no other line changes;
- the licence test file does not change.

### 2.5 Doc 230 (Georgian, technical terms in English; TEMPLATE's 7 headings)
- **l.4:** `**სტატუსი:** In Progress (stage 1 of 2; C round 320 PASS)` (L28).
- **Contents:**
  - the mechanism (`tasks/round-318.md` §0.2);
  - the store and the selector rule;
  - the memo boundaries and the `XInner` naming rule, with its reason: esbuild renames to `X2` and the tests key on runtime names;
  - the rulings D-29z864, D-29z866 and D-29z873;
  - the measured numbers: 108.167 → round 318 21.033 → round 319 14.15 → this round.
- **Testing:** names RS1–RS8, the mutants and C's rows. Cite only tests that exist (L26).

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-319/claims-320.sh`. Its output equals `b-round-319/claims-320-head-output.txt`. Any difference is a STOP |
| A-IMPL | §1 and §2 |
| A-CLAIMS-AFTER | K2 `50662e1 43`; K4 0, K5 0, K6 8, K7 0, K8 11, K11 0, K13 1, **K14 5**, K15 1, K16 12/12, **K17 1 / 1**, K18 1, **K19 1+1 / 1+1 / 1+1 / 1+1**, **K20 `(564)` and 1**, **K21 1**, K22 `b7528ac5ab192b8d`, K23 0, **K24 0**, **K25 `0+0+0 / 3+1+1`**, **K26 ≥ 1**, **K27 88 / 184** |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0, with no new warning in a changed file |
| A-UNIT | `npx vitest run` on round 319's 45 files (`a-round-319/unit-files.txt`) plus `app/lib/__tests__/third-party-licenses.test.ts`. All pass, **TL5 included**. Also run `perf/lib/report.test.ts` through a scratch vitest config that includes `perf/**` (rounds 312–313). A reports the counts |
| A-EXPECT | `python3 -I b-round-317/expect-count.py <store>` gives 22 files, with no file lower. `detail-panel.test.tsx` (one of the 22) grows by RS8's asserts, so TOTAL is 3,139 + RS8's count; every other file keeps its count. `render-budget` and `clip-gain-pointer-preview` keep 88 / 184 [K27] |
| A-MUTANTS | On a scratch copy, never in `store/`: MU-RANGE-IN-VALUE, MU-LANE-NEW-OBJECT, MU-NO-STATUS-REWRITE and MU-STALE-LATESTREF (as `tasks/round-318.md` §2.2), plus C-MU-DETAIL-IGNORE-PROP and MU-DETAIL-IGNORE-STORE (RS8). Each turns its row red. Restored, they are green |
| A-PERF (alone, L38) | Production build on a scratch copy, then `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` once. Report the §2.3 rows, `drag-range-live` and `failures`, which must be `[]` with the new asserts. Also give a per-component breakdown, on a dev serve, of one steady move and of the max commit, using A's round-318 profiler (names are `…Inner`) |
| A-REVIEW | `code-reviewer` on the **final** tree (3+ files). It checks: no selector builds a new object; no event-time read uses a render snapshot, except the documented `applyDetailRange`; each memo boundary has stable props or is listed as not bailing (the Waveform on video selections, SIG-R320-WAVEFORM-VIDEO-NONBAIL); the memo bodies are byte-equal; the two renamed test files differ only in the five literals; peaks arrays are never mutated in place (grep `app/lib/arrangement` and `app/components/arrangement` for index writes or `.push`/`.fill`/`.set` on a peaks value); RS8 can fail. A Medium+ finding inside the grants is fixed and re-reviewed (L11). Architecture notes are passed to B |

### 3.2 C's rows
C writes `c-round-320.md` and `c-round-320.json` as it goes, with the L57 fields:
- `assertsSpecified` = 8 (RS1–RS8);
- `mutantsRecorded` = 6;
- `mutantRedOnSketch` (on A's tree).

Each finding carries an `origin`.

**Builds.** Production builds of the baseline (a `git archive` of `50662e1`) and of A's tree, each in its own scratch. Never build inside `store/`. Keep both interactions JSONs.

**Browser rows** run at 1440×900 and 1280×720 on `/studio-lab`. Each compares A's build with the baseline: the same visible result and the same status text. C may reuse `c-round-319/c319-rows.mjs`, `c319-wave.mjs` and `c319-diag.mjs`.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status`; protected sha | The only changes beyond the 37 entries are the §2.1 paths and doc 230. In the three source files, the diff vs the 37-entry tree is the memo form only. The two test files differ only in the five literals. Protected 11/11 OK |
| CLAIMS | `claims-320.sh` | As A-CLAIMS-AFTER |
| UNIT | A-UNIT's files on C's scratch, the 6 mutants and at least one mutant of C's own | All pass, TL5 included. Each mutant is red. Restored, they are green |
| NAME-LIVE (L52) | On C's scratch, a temporary log of `renderLog.counts` in CP1's setup window and in R11-P1e before its first `clear()` | All five `…Inner` names appear with a count > 0. A name that never appears is a finding (a vacuous guard) |
| EXPECT | `expect-count.py` HEAD vs A | No file loses an `expect(`. K27 is 88 / 184 |
| PERF-RANGE (alone, L38) | Interactions spec on both production builds | **Baseline control:** range per move ≈ 108 (it must be > 15, or the row is vacuous). **A:** stopped and playing per move ≤ 15, max ≤ 35, `drag-range-live` = 1, playing move-restarts 0, `failures` [], and the 5 rows asserted (K14 5). **Non-range rows:** every drag, click, zoom and play/pause row satisfies A ≤ baseline + N (the named-fiber rule, D-29z865). C checks the rows of `c-round-319/rowcmp-interactions.txt` |
| PERF-NAMED (dev) | `c319-diag.mjs`, adapted to the `…Inner` names, on a dev serve of the baseline and of A, each with its own `cacheDir` | For clip click, name-bar move and zoom30, every added fiber is `ArrangementClipRangeOverlayInner`: N = 0 on click, 1 per move, 1 per clip on zoom. The range steady move gives the main and layout commit lists. Any rise not explained by the overlay is a finding |
| PERF-LOAD (alone) | `studio-lab.perf.spec.ts` on both builds, then the row compare | `failures` []. No rise in a fader or interaction row. `load.components` is compared at **matched commit counts** (the harness has no per-commit breakdown). On the dev profiler, one load gives per-commit lists: a commit may grow only by the readout's one mount and one overlay mount per clip mounted in it |
| R-WAVEFORM | Add a clip. Zoom in and out twice (`=` / `-`). Select the clip. Open the detail panel | At every zoom step, the clip waveform path (`arrangement-clip-waveform`) is non-empty and its `d` equals the baseline's. The detail waveform `d` equals the baseline's |
| R-DRAG | Body-drag a time selection across a clip | The label updates during the drag, snaps as at the baseline (Snap on and off, Alt), and stays after release. The overlay box's left and width equal the baseline's |
| R-DETAIL | Select a clip with a selection. Type From/To. Drag the range with the panel open. Then **move the focus off the detail toggle** (for example click an empty ruler-free area, or `blur()` the toggle) and press Space over the selected clip | The fields follow the drag; typing moves the range; the status text equals the baseline. The detail playhead moves during playback **at both viewports** |
| R-ALLTRACKS / R-CLEAR / R-SPACE | As in round 319 | As at the baseline |
| R-SPLIT / R-DELETE / R-CUT-TIME | Ctrl+E, Delete, Ctrl+Shift+X on a selection, then Undo/Redo | The same clips and status as at the baseline (C-R318-06 is pre-existing; note it if seen, do not count it) |
| R-LOOP / R-ZOOM / R-EXPORT | As in round 319 | The same loop brace and zoom. The range WAV and project WAV exports are byte-identical to the baseline's (round 319: 279,600 frames) |
| R-BG / R-MARQUEE / R-TRANSPORT | As in round 319 | As at the baseline. Transport titles and enabled state are equal with and without a range |
| G320-AUTH | As G319-AUTH, both viewports (L38 warm-up in a browser) | `/studio-lab`: anonymous workspace + demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401 |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, the build in `store/`, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if every row from PERF-RANGE through G320-AUTH ran.

**Ableton conformance:** not applicable. The behaviour is unchanged, and there is no new reference.

## 4. Grants
A edits only the §2.1 paths and creates doc 230.
- **Nothing else:**
  - not `ArrangementTransport.tsx`;
  - not `package.json` or the lock;
  - no other `app/**` or `perf/**` file;
  - no test file beyond round 318's 27 plus the two literal-only files;
  - no config;
  - no protected file.
- **If another file seems to need changing**, A STOPs and names it.

## 5. Neighbouring behaviour at risk (C probes)
- **PeakPath memo:** the clip and detail waveforms draw as at the baseline at every zoom (R-WAVEFORM). Peaks are never mutated in place (A-REVIEW grep).
- **Waveform memo:** the detail range overlay still follows the drag (R-DETAIL).
- **Playhead memo:** the detail playhead still moves. It writes through `useArrangementPositionWriter`, not through props (R-DETAIL, both viewports).
- **Overlay and readout renamed to Inner:** no visible change. Their geometry and label equal the baseline's (R-DRAG).
- **The explicit `range` prop:** RS8.
- **Renamed test keys:** NAME-LIVE.

## 6. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-320.md` and changes nothing else when:
- A-CLAIMS differs from the head output;
- the per move > 15 or the max > 35 (A reports the breakdown);
- a non-range interaction row rises above the baseline by more than N and the cause is outside the grants;
- a test assertion would have to be removed, or a test file outside §2.1 would have to change;
- the notices regeneration differs from the 4 rows of §2.4 and the count 564.

## 7. Next
- **After C PASS and gate 320:** PERF-8a is done.
- **Round 321:** RETRO (window 305–320, D-29z877).
- **Then:** REGRESSION if its planning falls on or after 2026-11-05, with the C-R318-06 repro row; otherwise PERF-8b.
- **Signals carried:**
  - `SIG-R319-TRANSPORT-FLIP`, `SIG-R319-CLIPGAIN-PROPS`, `A-R319-ARCH-DETAIL-SUBSCRIPTION` and `SIG-R320-WAVEFORM-VIDEO-NONBAIL` → PERF-10;
  - `SIG-R319-DEVOPTIONAL-NOTICES` → root/OSS-LIC.

## 8. Commit readiness
After C PASS and gate 320, root publishes the round 318–320 paths together, on top of `50662e1`. The tree is mid-round until then; root does not publish it.

## 9. Claims (L29 + L56)
Run `bash b-round-319/claims-320.sh` (`CLAIMS_STORE` may override the path). The head output, taken on the 37-entry tree, is `b-round-319/claims-320-head-output.txt`.

| Tag | Claim | Now | After A |
|---|---|---|---|
| K1 | gate 319 | skipped (C FAIL) | same |
| K2 | HEAD, status entries | 50662e1 37 | 50662e1 43 |
| K3 | zustand in package.json / lock | 1 / 1 | same |
| K4 / K5 / K7 / K11 | range in the value, `latestRef`, `useState`, lane `clipRange` | 0 / 0 / 0 / 0 | same |
| K6 | `.range` in StudioWorkspace | 8 | 8 |
| K8 | protected OK | 11 | 11 |
| K9 | regression-last | 2026-11-02 | same |
| K12 / K13 | zustand importers / store module | 2 / 1 | ≥ 1 / 1 |
| K14 | range budget rows asserted | 0 | 5 |
| K15 | detail start/end layout effect | 1 | 1 |
| K16 | cited artifacts | 12/12 | 12/12 |
| K17 | `function ArrangementRangeReadoutInner(` / `const ArrangementRangeReadout = memo(ArrangementRangeReadoutInner);` | 0 / 0 | 1 / 1 |
| K18 | `selectArrangementClipRange(state.range,` lines | 1 | 1 |
| K19 | Inner + memo lines: PeakPath / ClipRangeOverlay / DetailPlayhead / DetailWaveform | 0+0 each | 1+1 each |
| K20 | notices heading; zustand row | (560); 0 | (564); 1 |
| K21 | doc 230 | 0 | 1 |
| K22 | `ArrangementTransport.tsx` sha prefix | b7528ac5ab192b8d | same |
| K23 | `ArrangementRangeDetailPanel` in StudioWorkspace | 0 | 0 |
| K24 | `memo(function` in the three source files | 2 | 0 |
| K25 | old name keys / new `Inner` keys (render-budget Playhead + CP PeakPath + CP Waveform) | 3+1+1 / 0+0+0 | 0+0+0 / 3+1+1 |
| K26 | `RS8` in detail-panel.test.tsx | 0 | ≥ 1 |
| K27 | `expect(` in render-budget / clip-gain-pointer-preview | 88 / 184 | 88 / 184 |
