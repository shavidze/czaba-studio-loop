STOP — needs B ruling on §1 "Nothing else in the file changes" / round-322 §6 "a test assertion would have to be removed": `app/lib/arrangement/__tests__/render-budget.test.tsx`, `it` "does not re-render the detail panel content over 60 position frames or Play → Stop → Play (R11-P1e)", l.467 (`expected 0 to be greater than 0`), broken by the §2 ruling-1 memo of `ArrangementDetailPanelWithSelection`.

# A round 323 — PERF-8b resume (STOPPED at a consistent tree)

## 1. The STOP

**Site:** `render-budget.test.tsx`, the `it` R11-P1e (l.422–480 on A's tree). Its line 467 (unchanged from HEAD):

```
    expect(renderLog.counts.get('ArrangementDetailPanel') ?? 0).toBeGreaterThan(0);
```

**Mechanism (fact, measured):** this is the `it`'s positive control. After Play → Stop → Play it expects the outer `ArrangementDetailPanel` to have rendered, then pins that its memoised content (`ArrangementDetailContentInner`, `ArrangementDetailPlayheadInner`) did not. At HEAD and on the round-322 tree the wrapper was a plain function, so the outer panel re-rendered on every `StudioWorkspace` commit (here the `isPlaying` flips). With §2 ruling 1 applied (`memo(ArrangementDetailPanelWithSelectionInner)`), no wrapper prop changes on Play/Stop, so the wrapper and the outer panel render 0 times. That is what §2.3 of this task predicts ("the memo removes the wrapper renders in commits where its props did not change"): the memo works, and the old positive control becomes false.

**Why this is a STOP, not an edit:** only the R9-L2 `it` of this file is granted (§1: "Nothing else in the file changes", count exactly 91). Making l.467 pass needs either inverting it (L23/10a Medium) or moving the control, both outside the grant. Un-memoising the detail wrapper would contradict §2 ruling 1 and hide the finding, so I did not do it.

**Same class as C-R322-01:** B's L58 grep covered only the R9-L2 `it`. My grep `grep -rn -E "counts\.get\('[A-Za-z]+'\) \?\? 0\)\.toBeGreaterThan\(0\)" app --include=*.tsx` gives 7 positive-control hits: `library-preview` l.273, `master-ui` l.643, `context-hygiene` l.396, `render-budget` l.438, 439, 467, 579. Only l.467 fails; the others pass on A's tree (`library-preview` 12/12 run separately, `a-round-323/library-preview.log`; `master-ui` and `context-hygiene` inside the 111-file run).

**Ruling proposal (options for B, not a decision):**
- **(a) Recommended.** Grant the R11-P1e `it` too. Move the positive control to a consumer that still legitimately re-renders on Play → Stop → Play (`ArrangementTransport`, which reads `isPlaying` via `useArrangement()`), and pin the new contract with a negative row on the outer panel. The file goes 91 → **92** `expect(`. Exact diff: `a-round-323/option-a-r11p1e.patch.txt`:
  ```
  -    expect(renderLog.counts.get('ArrangementDetailPanel') ?? 0).toBeGreaterThan(0);
  +    expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
  +    expect(renderLog.counts.get('ArrangementDetailPanel') ?? 0).toBe(0);
  ```
  Note for B: the `ArrangementDetailPanel` line keeps its subject but changes matcher (`> 0` → `0`), which is the new contract, not a removal; B decides whether L23/10a treats that as acceptable (as it did for R9-L2's `not.toBe` → `toBe` in §1).
  - **Validated on scratch** (`/tmp/a323-scratch`, outside `store/`, `node_modules` symlinked, deleted afterwards): `render-budget.test.tsx` 8/8 (`a-round-323/option-a-scratch.log`).
  - **Mutant that can fail (L52):** same scratch with option (a) and the detail wrapper un-memoised (`const ArrangementDetailPanelWithSelection = ArrangementDetailPanelWithSelectionInner;`): R11-P1e red, 7/8 (`a-round-323/option-a-mutant-nomemo.log`). So the new negative row pins the memo.
- (b) B's alternative.

## 2. Tree state (left consistent; nothing changed after the STOP)

**Edited this round (all granted):**
- `render-budget.test.tsx`: exactly the §1 edit (4 lines added after `selectClip('music-1')`; no line removed). `expect(` 88 → **91** (K28 `88 91`). The R9-L2 `it` passes. The new Ruler/Library `toBe(0)` rows are non-vacuous: at HEAD both render on this selection commit (the HEAD version of this same `it` asserted every CONTEXT_CONSUMERS name, Ruler and Library included, `> 0` right after `selectClip`; K15 also lists both among the ten live names in the browser).
- `StudioWorkspace.tsx`: §2 ruling 1. `function ArrangementGroupHeaderWithSelectionInner` + `const ArrangementGroupHeaderWithSelection = memo(…Inner)`, the same for `ArrangementDetailPanelWithSelection`. K32 = **2**. No other line changed. K22 `748 780` → `750 782` (the same lines shifted by the 2 added `const` lines; still inside the detail wrapper).

**§2 ruling 2, prop stability at both call sites (checked; no unstable prop, so no §2.2 STOP):**
- `ArrangementGroupHeaderWithSelection` (~l.3243): `group` (from the `trackRows` `useMemo`); `depth`, `selected`, `collapsed`, `containsActive`, `timelineWidth`, `pxPerSecond` (primitives); `overviewClips` (`trackGroupOverviews` `useMemo`, fallback module constant `NO_TRACK_GROUP_OVERVIEW_CLIPS`); `onSelectGroup`/`onRenameGroup`/`onToggleCollapse`/`onFocusedRowDetach` (`useCallback`s).
- `ArrangementDetailPanelWithSelection` (~l.3299): `arrangement` (changes only on a real edit), `collection` (provider prop), `videoSources`/`sourcePeaks` (provider state), `setTimeRange`, `claimPointerGesture`, `isPointerGestureActive`, `getArrangement` and the ten clip-gain callbacks (provider `useCallback`s), `setStatus` (`useReducer` dispatch), `measureTimelineFit`/`markDetailPanelUserResized` (`useCallback`s), `openHeightCap`/`isLaneAutoFitOn` (primitives), `panelRef` (`useRef`).
- Empirical confirmation: the l.467 failure itself shows the detail wrapper's props stayed equal across Play → Stop → Play (the memo bailed out), so the memo is not a no-op.

**Not done (blocked by the STOP, L11):** SS1–SS7 file; the four mutants; the §2.5 harness scenario and rows (K19 still 0); docs 168, 230 and 231 (K13 still lists doc 230; K33 0); A-PERF; code-reviewer (the change set is incomplete; it runs on the final set after the ruling).

## 3. Rows actually run
| Row | Result |
|---|---|
| A-CLAIMS (before) | **PASS**: `a-round-323/claims-before.txt` equals `a-round-322/claims-after-stop.txt` (K1–K27) and `b-round-322/claims-323-planning-output.txt` (K1–K37), empty diffs |
| Claims after the STOP | `a-round-323/claims-after-stop.txt`. Changed vs before: K2 `34` → `35`, K22 `0 748 780` → `0 750 782`, K28 `88 88` → `88 91`, K32 `0` → `2`. Not yet: K19 0, K13 lists doc 230, K33 0 |
| A-TYPE | `npm run typecheck` rc 0 |
| A-LINT | `npm run lint` rc 0 (205 warnings + 1 info, repo-wide); `biome lint` and `biome format` on the two files edited this round: no diagnostics, no fixes |
| A-UNIT (111 files: the 29 + the 81 + `range-store` + `status-lifetime`) | **110 passed, 1 failed** (`render-budget.test.tsx` R11-P1e l.467, the STOP); tests **1704 passed / 1 failed**, 206.8 s. Log `a-round-323/a-unit-stop.log`. The §1 R9-L2 `it` passes. `perf/lib/report.test.ts` not run; the SS file does not exist yet. L11 timeouts: both changed `it`s of `render-budget.test.tsx` declare 15 000 ms (50 % = 7.5 s); the whole file's 8 tests took 5.32 s combined in my run, so no `it` there is above 50 %. Not scanned for the other 110 files |
| Memo covering files (separate run) | `fader-pointer-preview`, `clip-gain-pointer-preview`, `track-group-collapse-ui`, `detail-panel`: 4/4 files, 98/98 tests |
| Option (a) scratch | 8/8; un-memo mutant 7/8, red at R11-P1e |

## 4. For B
- **Rule on §1** (the R11-P1e `it`) so A can resume: SS file, mutants, harness, docs, A-PERF, review.
- **L58 clause suggestion:** the "sketch crash hides behaviour asserts" grep should cover every `it` of the covering files and every consumer used as a positive control (`counts.get('<Consumer>') … toBeGreaterThan(0)`), and be re-checked against each planned memo/subscription change (a memo removes renders a positive control relied on). Command and 7 hits in §1.
- **Architecture note (unchanged):** A-R322-ARCH-SELECTION-WRAPPERS (D-29z901), proposal only.

## 5. Next C checks
None this round: A STOPped. Do not run C's feature rows until A resumes and hands over (L22: SOURCE-SCOPE + auth guard only if C runs).

## 6. Scope completed
- Done: A-CLAIMS; §1 edit; §2 ruling 1 (memo) and ruling 2 (prop check).
- B acceptance rows truly passed: A-CLAIMS, A-TYPE, A-LINT. A-UNIT **not** passed (1 failure). All other A rows not run. The backlog is not complete.
