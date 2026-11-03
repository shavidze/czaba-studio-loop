STOP — needs B ruling on K19 / §1 memo naming (`const X = memo(function X(…))`) vs A-UNIT (render-budget R11-P1e, clip-gain-pointer-preview CP1)

# A round 319: PERF-8a fix-up. STOP under §6 bullet 4 (and L11 spec-conflict clause)

**Short version.** I applied every §1 ruling. With the three memo wrappers written the way K19's claim regexes require (`export const ArrangementPeakPath = memo(function ArrangementPeakPath(…`, `const ArrangementDetailPlayhead = memo(function ArrangementDetailPlayhead(…`, and the same form for `ArrangementDetailWaveform`), **two covering tests outside round 318's 27 go red**:
- `render-budget.test.tsx` l.439 (`ArrangementDetailPlayhead` count `> 0` receives 0), R11-P1e;
- `clip-gain-pointer-preview.test.tsx` l.557 (`ArrangementPeakPath` count expected 8, received 0), CP1.

The tests are name-keyed render probes. They cannot pass with that source form, and changing them is §6 bullet 4. So I stopped. Then I put the tree back at its last consistent state: I reverted **only** those three wrappers to plain functions and kept every other §1 change. The 45-file covering set is green on that tree (897/897).

## 0. Pre-flight gate (project skill)
- **Assumptions:** continue on A's round-318 tree; memo boundaries only; no visible change; the overlay JSX is byte-equal; the transport stays frozen.
- **Smallest version:** about 60 lines over `ArrangementClip.tsx`, `StudioWorkspace.tsx` and `ArrangementDetailPanel.tsx`, plus budgets, notices and docs.
- **Files:** only the §2.1 "edited this round" paths.
- **Success criteria:** the covering vitest set is green; prod per move ≤ 15 and max ≤ 35.

## 1. Mechanism (confirmed)
- React 18.3.1. A `memo(fn)` with no `compare` and no `defaultProps` becomes a SimpleMemo fiber whose `type` is the inner function. The tests' devtools-hook probes name a fiber by `type.name`.
- esbuild renames an inner named function expression that shadows a module const of the same name: `const X = memo(function X…)` emits `function X2`.
- **vitest evidence (scratch copy `/tmp/a319s`, debug print only, store untouched):** R11-P1e counts were `ArrangementPeakPath2: 6`, `ArrangementDetailWaveform2: 1`, `ArrangementDetailPlayhead2: 1`. Under the plain names the counts were 0.
- **Dev-server evidence (`curl` of the :5173 module, memo variant):** it emits `ArrangementDetailPlayhead2`, `ArrangementDetailWaveform2`, `ArrangementPeakPath2`, `ArrangementClipRangeOverlay2` and `ArrangementRangeReadout2`.
- Log of the red run: `a-round-319/unit-memo-variant.log` (45 files, 895 passed / 2 failed).

### 1.1 Hidden vacuity (L52), which B's ruling must also cover
`clip-gain-pointer-preview.test.tsx` `PARENT_NAMES` (l.220–228) contains `'ArrangementDetailWaveform'`. Under the renaming form the Waveform renders count as `ArrangementDetailWaveform2`. `parentRenders()` would then stop guarding Waveform **silently**: the assert passes, but it can no longer fail for Waveform.

### 1.2 The same mechanism on the two kept memos
- **`ArrangementRangeReadout` (K17 form):** renamed to `…Readout2`. No test pins that name (grep 0), so the effect is only cosmetic in profiler output.
- **`ArrangementClipRangeOverlay` (new):** renamed to `…Overlay2` in dev. C's named-fiber rule (D-29z865) counts the overlay **by name**, so C must look for `ArrangementClipRangeOverlay2` (or whatever name B's convention fixes). The name can be read only on a dev serve or an unminified build; a production bundle minifies identifiers. So the named-fiber row has to run against :5173, as A's round-318 breakdown did.
- B should fix the convention for all five memo components at once.

## 2. Options for B (none applied)
- **O1, the project pattern** (`function XInner` + `const X = memo(XInner)`, as `ArrangementClipViewInner`, `ArrangementOverviewInner`, `ArrangementDetailContentInner` already do):
  - K17 and K19 match textually;
  - it needs a test grant: `render-budget.test.tsx` l.439/454/469 (`'ArrangementDetailPlayhead'` → `'ArrangementDetailPlayheadInner'`), `clip-gain-pointer-preview.test.tsx` l.224 and l.557 (`…WaveformInner`, `…PeakPathInner`);
  - the named-fiber rule then counts `ArrangementClipRangeOverlayInner`.
- **O2, keep the function names and suffix the memo const** (for example `const ArrangementDetailPlayheadMemo = memo(ArrangementDetailPlayhead)`, `export const ArrangementPeakPathMemo = …`, `…WaveformMemo`):
  - no test change, and the L52 guards stay honest;
  - B rewrites the K17/K19 regexes;
  - the `ArrangementPeakPath` call sites in `ArrangementClip.tsx` and `ArrangementDetailPanel.tsx` (both granted) switch to the memo name;
  - §1's wording "PeakPath export becomes memo()" changes.
- **O3, `keepNames` in the esbuild/vite config:** not granted, and it affects every module. Listed only to show it was considered.
- **O4 (measured below), drop the three memos** and accept the current tree: per move is about 14 in dev, which leaves almost no headroom. Production was not measured.

**Origin:** B pre-check (L23). B's sketch (`b-round-318/sketch.patch.txt`) used the identical `memo(function X` form, and `render-budget` / `clip-gain-pointer-preview` CP1 were not in its run set.

## 3. Tree state at hand-off (37 status entries)
**Kept (as §1):**
- **`ArrangementClip.tsx`:**
  - the clip-level range subscription moved into a `memo()` child, `ArrangementClipRangeOverlay({ trackId, start, duration, pxPerSecond })`;
  - its selector is `selectArrangementClipRange(state.range, { trackId, start, duration })`, on one line (K18 = 1);
  - the overlay JSX (div plus label) is byte-equal to the original, re-indented only;
  - the overlay now returns `null` early instead of using `range ? … : null`;
  - `ArrangementClipViewInner` no longer subscribes to the range.
- **`StudioWorkspace.tsx`:**
  - `ArrangementRangeReadout` is `memo()` (K17 = 1);
  - the `ArrangementRangeDetailPanel` wrapper is deleted (K23 = 0) and `<ArrangementDetailPanel …>` renders directly with no `range` prop;
  - the `ArrangementDetailPanelProps` type import was dropped (unused);
  - `memo` was added to the react import (Biome sorted it).
- **`ArrangementDetailPanel.tsx`:**
  - `ArrangementDetailPanelProps` = `Omit<ContentProps,'range'> & { range?: TimeRange | null }`;
  - the panel always calls `useArrangementRange((state) => state.range)`, and an explicit prop (`!== undefined`) wins;
  - the header chevrons are hoisted to module constants `DETAIL_TOGGLE_CHEVRON_RIGHT` / `DETAIL_TOGGLE_CHEVRON_DOWN`, with the same props and output;
  - **listed extension:** §1 names only `ChevronDown`. I hoisted `ChevronRight` too, for symmetry, with the same props and output. It is inside the file grant.
  - The start/end layout effect is unchanged (K15 = 1). `ArrangementDetailClipGain` is unchanged.

**Reverted (STOP):** the memo wrappers on `ArrangementPeakPath`, `ArrangementDetailPlayhead` and `ArrangementDetailWaveform`. The exact hunks are in `a-round-319/memo-wrappers.patch.txt`. Its direction is handed-off tree → memo variant: `patch -p0 < a-round-319/memo-wrappers.patch.txt`, run from the store root, re-adds the three wrappers. The `(memo variant)` suffix on the `+++` labels is cosmetic.

**Not done (STOP):**
- budgets JSON (K14 0);
- notices regeneration (K20 `(560)`; TL5 still fails, as at HEAD, see `a-round-318/tl5-at-head.log`);
- doc 168 `## მეტრიკები`;
- doc 230 (K21 0);
- mutants and A-PERF (prod). The code-reviewer ran on the kept tree (§4a) and must re-run on the final tree.

Transport untouched (K22 `b7528ac5ab192b8d`). No test file edited. No protected file touched (K8 11 OK).

## 4. Checks actually run
| Row | Result |
|---|---|
| A-CLAIMS (before) | `claims-319.sh` output **identical** to `claims-319-head-output.txt` (`a-round-319/claims-before.txt`) |
| A-TYPE | `npm run typecheck` rc 0 (both variants) |
| A-LINT | `npm run lint` rc 0: 205 warnings + 1 info, 0 in the three changed files. `biome check` on the three files is clean |
| A-UNIT, memo variant | 45 files (`a-round-319/unit-files.txt`: the A-UNIT list plus every test that reads the three sources or keys on their component names). **895 passed / 2 failed** (R11-P1e, CP1) |
| A-UNIT, handed-off tree | same 45 files: **897 / 897 passed** (`a-round-319/unit-reverted.log`). `third-party-licenses.test.ts` not run: TL5 is known red until the notices are regenerated, and that is not done (STOP). `perf/lib/report.test.ts` not run (budgets not edited) |
| Claims after (handed-off tree) | K2 `50662e1 37`, K4 0, K5 0, K6 **8**, K7 0, K8 11, K11 0, K12 2, K13 1, K14 0, K15 1, K16 10/10, K17 1, K18 1, **K19 0 / 0**, K20 `(560)`/0, K21 0, K22 unchanged, K23 0 (`a-round-319/claims-after-reverted.txt`) |
| Dev profiler (A's round-318 script, :5173, handed-off tree, alone) | 30 moves, 59 commits. Pointerdown 92 (outside the window). In-window histogram: 29 × 5, 28 × 9, 1 × 32. **Per move ≈ (521 − 92) / 30 = 14.3; max 32.** Main commit 9: overlay, detail panel, ContentInner, Waveform, PeakPath, Playhead, ClipGain, readout + TimeText. Layout commit 5: ContentInner, Waveform, PeakPath, Playhead, ClipGain. File: `a-round-319/diag-dev-reverted.json`. Dev only; production not measured. **Proof that the server served the handed-off tree:** `ArrangementPeakPath`, `ArrangementDetailPlayhead` and `ArrangementDetailWaveform` appear without the `2` suffix, while `ArrangementClipRangeOverlay2` and `ArrangementRangeReadout2` carry it |

**K6, the 8 `.range` reads in StudioWorkspace:**
- 2 selectors: the `ArrangementInsertMarkerLine` `state.range !== null` and the readout's `state.range`;
- `modifiers.range` (an unrelated modifier flag);
- 5 `rangeStore.getState().range` event-time reads: hidden-track cleanup, zoom-to-range, step zoom, ruler double-click, marker edge-nav.

Round 318's 9 minus the removed wrapper's selector gives 8.

**Expected with the three memos (B's sketch arithmetic, not measured by me):** main 7 + layout 2 = 9 per move.

## 4a. Code review on the kept tree (A-REVIEW, partial)
I ran the actual `code-reviewer` subagent on the three changed files. Score 8/10; no Critical or High.
- **Medium (d), a possibly missing `z-10` on the clip overlay: rejected after checking.** At HEAD (`git show HEAD:…ArrangementClip.tsx` l.1024) the class string is `pointer-events-none absolute inset-y-0 border-x-2 border-foreground bg-foreground/30`, with no `z-10`; the new overlay has the identical string. The `z-10` it saw is on the **lane's** overlay (`ArrangementLane.tsx`), which is a different element.
- **Low (f):** the panel still subscribes to the store when a `range` prop is passed. That is a test-only cost. The panel throws outside a provider, and both direct-render tests are inside one (they passed).
- **Low (c):** `ArrangementDetailPanel` itself is not memoised. This is the same as the old wrapper.
- **Checks that pass:** (a) no selector builds a new object; (b) no event-time read uses a render snapshot except the documented `applyDetailRange`; (e) the hoisted chevron elements are safe; (g) clips outside the range render no overlay.
- **Architecture note (for B):** keep the panel's subscription. Candidate: move it into `ArrangementDetailContent`, so that resize and collapse state are not re-rendered during range drags.

**The review must re-run** on the final tree after B's ruling (L11), because code will change again.

## 5. Known gaps
- The tree is mid-round and must not be published.
- TL5 is red (notices).
- Budgets are not asserted.
- The code review covers only the kept tree (§4a). It re-runs on the final tree (L11).
- C's named-fiber counting must use the runtime name (`…Overlay2` under the current form).
- `ArrangementDetailWaveform`'s `videoClipGainReason` is a fresh node for video clips, so a Waveform memo would not bail on video selections. On audio it is `null`. This is a note for the memo option B picks.

## 6. Next C checks
None beyond SOURCE-SCOPE and CLAIMS on this tree, until B rules. The browser and PERF rows wait for the resumed round.

## 7. Architecture note for B
The codebase already has a memo naming convention (`XInner` + `memo(XInner)`), and several tests key on runtime component names. A one-line convention in the PERF task template ("memo: `function XInner` + `const X = memo(XInner)`; grep tests for `'X'` name keys") would have prevented this STOP. This is a proposal only.
