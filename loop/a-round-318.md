STOP — needs B ruling

# A round 318: PERF-8a (range store). STOP under §6, bullet 3

**Short version.** I built the range store and measured it. The production range drag drops from **108.167 to 21.033 components per move**. The task's `≤ 15` per move and `≤ 15` max **cannot be met inside the §4 grants**. The remaining cost sits in `ArrangementDetailPanel.tsx`, where my grant is "prop type only", and in the null→range transition of `ArrangementTransport`. Two of B's rulings conflict: "the detail panel is unchanged (K15 stays 1, it keeps `range` as a prop)" and "≤ 15". The per-component profiler breakdown that §6 asks for is below.

Following §6 and policy rule 6, I preserved the partial work, made no further code changes, did not revert, and stopped:
- the budgets JSON is unchanged (asserting it now would fail);
- `THIRD_PARTY_NOTICES.md` is not regenerated;
- doc 230 is not written;
- code-reviewer and the mutants are deferred.

The tree holds a working PERF-8a implementation, which B can accept, extend or discard.

## 1. Baseline / claims (A-CLAIMS)
`bash b-round-317/claims-318.sh` before my edits differed from `claims-318-head-output.txt` in three places:
- **K2** = `50662e1 0` (root's deps commit) — expected.
- **K3** = 1/1 — expected.
- **K8 = 10 OK (head 11).**
  - The only failing checksum is `package.json`, which root's `chore(deps): add zustand@5.0.16` (50662e1) legitimately changed.
  - The Baseline rule says A and C do not stop on that commit, so I did not treat it as a STOP.
  - Consequence: A-CLAIMS-AFTER K8 = 11 and C's CLAIMS row cannot reach 11 until B re-baselines `b-round-312/protected-sha256.txt` (B's artifact; I did not touch it).
  - The other 10 protected files are OK.

Claims after (`a-round-318/claims-after.txt`):
- K2: `50662e1 36`.
- K4 0, K5 0, K7 0, K11 0, K12 2, K13 1, K15 1, K16 4 — all as required.
- **K14 0:** budgets not edited because of the STOP.
- **K8 10:** see above.
- K10 is still 22. By design, the tests' `.range` read lines are unchanged; only the probe changed.

## 2. Measurement (A-PERF, alone, L38)
- **Setup.** Scratch `/tmp/a318s`: a tar copy of A's tree, `node_modules` symlinked, own vite `cacheDir`. Command: `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, run once and alone (rc 0, 1 passed, 6.0 min, `failures` []).
- **Evidence:** `a-round-318/perf-a-scratch.log`, `a-round-318/perf-a-latest-interactions.json`.

| Row | Baseline (C r306, B §0.1) | A (prod) | Task target |
|---|---|---|---|
| range.stopped.move-components-per-move | 108.167 | **21.033** | ≤ 15 ❌ |
| range.playing.move-components-per-move | 108.167 | **21.033** | ≤ 15 ❌ |
| range.stopped.move-components-max | 105 | **39** | ≤ 15 ❌ |
| range.playing.move-components-max | 105 | **39** | ≤ 15 ❌ |
| range.playing.move-restarts | 0 | 0 | == 0 ✅ |
| harness.drag-range-live | 1 | 1 | == 1 ✅ |
| range commits-per-move (record) | 1.983 | 1.967 | record |

I did not run a baseline control on the same machine. The baseline numbers are C's round 306 numbers.

### 2.1 Per-component breakdown (§6 evidence)
- **Script:** `a-round-318/diag-range-components*.mjs`. It is a devtools-hook profiler like the harness's, but it records component names and their ancestors.
- **Run on:** the :5173 dev server, which serves A's tree.
- **Output:** `diag-dev-2.json` and `diag-dev-from-down.json`.
- **Cross-check:** the dev totals match production (21 per move, max 39), so the breakdown is reliable.

**Steady state, per move = 16 + 5 = 21:**
- **Main commit (16):**
  - **Clip (5):** `ArrangementClipViewInner`, `GripVertical` + its `forwardRef`, `ArrangementPeakPath`, `ArrangementClipEnvelope`. The clip subscribes at clip level, as the ruling says.
  - **Detail panel (9):** `ArrangementRangeDetailPanel` (subscriber), `ArrangementDetailPanel`, `ChevronDown` + `forwardRef`, `ArrangementDetailContentInner`, `ArrangementDetailWaveform`, `ArrangementPeakPath`, `ArrangementDetailPlayhead`, `ArrangementDetailClipGain`. 8 of these 9 live inside `ArrangementDetailPanel.tsx`.
  - **Footer readout (2):** `ArrangementRangeReadout`, `ArrangementTimeText`.
- **Layout-effect commit (5):** `ArrangementDetailContentInner`, `ArrangementDetailWaveform`, `ArrangementPeakPath`, `ArrangementDetailPlayhead`, `ArrangementDetailClipGain`. This is K15's `setStartText`/`setEndText`, which B said stays.

**Max 39** is the first range commit (null → range):
- `ArrangementTransport` with all its lucide icons: about 22, because `hasRange` flips its titles and enabled state (R-TRANSPORT needs that).
- `ArrangementInsertMarkerLine` (1): it hides.
- The clip (5), the detail panel (9) and the readout (2).

The pointerdown commit (96: lanes, faders, transport and library, from the gesture start's context change) is outside the harness's move window. Production's max is 39, not 96.

### 2.2 Why ≤ 15 is infeasible inside the grants
- `move-components-per-move` = `componentsSum / moves`. The K15 layout-effect commit's 5 count toward the 15, which leaves ≤ 10 for the main commit.
- The detail panel alone costs 9 in the main commit.

**In-grant floor (a projection, not measured):**
- **Per move ≈ 17:** the clip's range label moved into a child subscriber inside `ArrangementClip.tsx` (5 → 1), plus the readout 2, plus the detail panel 9 + 5.
- **Max ≈ 25:** additionally, the four range-dependent transport buttons as small subscriber components (≈ 3 each), plus the marker line 1, clip 1, readout 2 and detail panel 9.

## 3. Decision paths for B (hypotheses, not measured)
1. **Expand the grants:**
   - `ArrangementDetailPanel.tsx` internals: memoize `ArrangementDetailClipGain`/`ArrangementDetailPlayhead`/`ChevronDown`, or move the `range` read into a sub-subscriber inside the panel. Also re-examine whether the start/end layout effect needs a second commit; it alone takes a third of a ≤ 15 budget.
   - The clip range label as a child subscriber, in `ArrangementClip.tsx`.
   - Range-dependent transport buttons as subscriber components, in `ArrangementTransport.tsx`.

   Per move plausibly ≤ 15. Max probably lands at 15–19 and needs its own look.
2. **Re-budget:** accept the measured 21 per move and 39 max (with margin) as PERF-8a's done stage. Carry the panel and transport work into 8b or a separate PERF-DETAIL task.

## 4. What is implemented (partial, kept)
**New:**
- `app/lib/arrangement/range-store.ts`:
  - `createArrangementRangeStore` (`createStore` from `zustand/vanilla`; `setRange` short-circuits on the same reference);
  - `isArrangementRangeInClip`;
  - `selectArrangementClipRange` and `selectArrangementLaneRange`, which return the stored reference or `null`.
- `app/lib/arrangement/__tests__/range-store.test.tsx`: RS1–RS7, 7 tests.

**`ArrangementContext.tsx`:**
- One store per provider (`useState(() => createArrangementRangeStore())`), exposed through `ArrangementRangeContext`.
- New hooks: `useArrangementRangeStore()` and `useArrangementRange(selector)` (`useStore`). Both throw outside the provider.
- `range` is removed from the type, the value memo and its deps, and from `latestRef`. The provider's `useState` is gone.
- `setRange` writes the store and keeps its `rewriteStoppedTruth` branch exactly.
- Every event-time read uses `rangeStore.getState().range`: `describeSpaceStart`, `togglePlayback`, `placeInsertMarker`, loop, split, delete, all-tracks, duplicate, copy, cut, cut-time.
- **Ordering:** range first, then selection, in add (×2), `toggleClipSelection`, `selectAllClips`, split (×2), paste and add-video.

**Components:**
- **Lane:** the selector covers only its own overlay; no per-clip `clipRange` (K11 0); the clip's `range` prop is removed.
- **Clip:** subscribes with `selectArrangementClipRange`.
- **Transport:** primitives only, `hasRange` and `isRangeAllTracks`.
- **Export dialog:** `isOpen ? state.range : null`. The Modal renders nothing while closed.
- **Marker row:** `getState()` inside `beginAddMarker`.

**`StudioWorkspace`:**
- New `ArrangementRangeReadout` and `ArrangementRangeDetailPanel` subscriber components (2 new always-mounted components, plus the `ArrangementRangeContext.Provider`; a provider is not a counted fiber tag).
- `ArrangementInsertMarkerLine` subscribes to `range !== null` itself.
- **K6 list (9 `.range` occurrences):**
  - 3 selectors (`state.range`, lines ≈507/558/582);
  - `modifiers.range` (unrelated shift-modifier flag);
  - 5 `rangeStore.getState().range` event-time reads: hidden-track cleanup, zoom-to-range, step zoom, ruler double-click, marker edge-nav.

**Tests:**
- **The 22 listed files**, plus 4 files that typecheck flagged under the §4 exception: `insert-marker-ui`, `meta-shortcuts-ui`, `mode-toggle-colour-ui`, `status-lifetime`.
- **What changed:** only the probe (`{ ...useArrangement(), range: useArrangementRange((state) => state.range) }`), its `ArrangementRangeProbeValue` type alias and imports. Every `.range` read and assertion line is byte-identical.
- **Two items outside the written exception, for B to rule on:**
  - `gesture-reentry.test.tsx`: removed the `range={null}` **prop literal** on `ArrangementClipView`. The clip no longer takes a `range` prop. This is a prop literal, not a context literal, and no assertion is affected (37 → 37 `expect(`).
  - `mode-toggle-colour-ui.test.tsx` DXT8: the source-text needle `"range && 'border-foreground'"` → `"hasRange && 'border-foreground'"`. The expected count stays 1 and the class string is unchanged; only the transport's variable was renamed. Alternative, if B prefers no change to a test literal: keep the transport boolean under a name whose source text still contains `range && 'border-foreground'`, and revert the needle.

## 5. Checks actually run (on the current tree)
| Row | Result |
|---|---|
| A-TYPE | `npm run typecheck` rc 0 |
| A-LINT | `npm run lint` rc 0. 205 warnings + 1 info, none in a changed file (grep per changed file = 0). `biome check` on all changed and new files: clean |
| A-UNIT | `npx vitest run` on `range-store.test.tsx`, the 27 changed test files, `export-range-ui`, `shortcuts.test.ts` and `third-party-licenses.test.ts`: **31 files, 757 tests, 755 passed, 2 failed**. After fixing DXT8 (needle above), the DXT8 and range-store re-run is 15/15. The other failure, **TL5 in `third-party-licenses`, is still open**. **Verified** that it also fails on a clean `git archive` of HEAD `50662e1`, with no A changes (1 failed, 69 passed; `a-round-318/tl5-at-head.log`). The cause is the deps commit, with the notices not regenerated (STOP). Not run: `perf/lib/report.test.ts` (budgets not edited) |
| A-EXPECT | `expect-count.py` after = head exactly (22 files, TOTAL 3,139; `a-round-318/expect-count-after.txt`). The 5 extra files are unchanged too |
| A-PERF | see §2: per move and max FAIL the target; restarts and drag-live PASS |
| A-MUTANTS | **not run** (deferred: they verify a finished contract that B now has to reset) |
| A-REVIEW | **not run** (deferred for the same reason; it will run on the resumed round) |
| Notices, budgets, doc 230 | **not done** (STOP) |

## 6. Known gaps / risks
- **The tree is in a mid-round state.**
  - TL5 fails until the notices are regenerated.
  - Budgets are not asserted.
  - No code review has run yet.
  - Root should not publish this tree.
- **RS4 and RS6 begin the gesture** through the context's `beginPointerGesture()`.
- **RS7 uses `splitSelection`** right after `setTimeRange` in the same `act`, with no render in between.
- **Not browser-verified by A:**
  - the R-rows (behaviour) were not walked;
  - only the perf harness (which includes a range drag with live label checks) and the diagnostic drags ran in a browser.

## 7. Next C checks (if B accepts any part as-is)
- SOURCE-SCOPE: the §2.1 paths plus the 2 exception items above.
- CLAIMS: K8 10 is expected until the sha file is re-baselined.
- PERF-RANGE baseline control vs A.
- R-DRAG, R-ALLTRACKS, R-CLEAR, R-SPACE, R-SPLIT/DELETE/CUT-TIME, R-EXPORT, R-DETAIL, R-TRANSPORT. The export dialog's range is read only while it is open; check the scope state on open.
