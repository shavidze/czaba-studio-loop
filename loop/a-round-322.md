STOP — needs B ruling on §6 "a reader outside §2.1 needs a change" / "a test assertion would have to be removed": `app/lib/arrangement/__tests__/render-budget.test.tsx` (one of the 81 files in `b-round-321/precheck-outside-list.txt`)

# A round 322 — PERF-8b (STOPPED at a consistent tree)

## 1. The STOP

**Site:** `app/lib/arrangement/__tests__/render-budget.test.tsx`, test `keeps the context value and its consumers unchanged when the start hold releases (R9-L2, C-R6-02)`. These are the lines at l.616–620 (HEAD text):

```
    act(() => api.current?.selectClip('music-1'));
    expect(api.current).not.toBe(valueAtPlay);
    for (const name of CONTEXT_CONSUMERS) {
      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);
    }
```

`CONTEXT_CONSUMERS` = Transport, Ruler, Library, Lane, DetailPanel (l.245–251).

**Why it fails on A's tree:** the test uses a selection change as its *positive control* ("the value changes and every consumer re-renders"). PERF-8b removes exactly that coupling (D-29z894): `selectClip` now writes only the selection store, so `api.current` stays identical. The failure is `expected {…(114)} not to be {…(114)}` at l.617. No selection trigger can satisfy l.618–620 either, because Ruler and Library no longer re-render on a selection change.

**Why §2.4's exception does not cover it:** the test does not read a selection field, and it does not construct a value literal. It asserts behaviour. The only edit that keeps it passing in place, `not.toBe` → `toBe`, inverts an assertion (L23/10a: a Medium). B's precheck could not see this, because all 81 files crashed earlier on the type-only sketch (`undefined.length` in `StudioWorkspace`).

**Ruling proposal (options for B, not a decision):**
- **(a) Recommended.** Grant this one `it` of `render-budget.test.tsx`. Keep the positive control by moving it to a value-changing trigger (`setStatus`), and **add** a negative row: `selectClip` leaves `api.current` identical and Ruler/Library at 0 renders. No assertion is removed, and the file's `expect(` count rises by 3. **Validated on scratch:** I ran this exact edit in a copy of A's tree (`/tmp/a322-scratch`, outside `store/`, `node_modules` symlinked); `render-budget.test.tsx` gave 8/8 passed. The edit:
  ```
  act(() => api.current?.selectClip('music-1'));
  expect(api.current).toBe(valueAtPlay);
  expect(renderLog.counts.get('ArrangementRuler') ?? 0).toBe(0);
  expect(renderLog.counts.get('ArrangementLibrary') ?? 0).toBe(0);
  act(() => api.current?.setStatus('Positive control'));
  expect(api.current).not.toBe(valueAtPlay);
  for (const name of CONTEXT_CONSUMERS) { … unchanged … }
  ```
  `/tmp/a322-scratch` does not survive the job; the quoted diff is the artifact, not the directory. The negative row names only Ruler and Library. Transport flips false→true once, the music lane re-renders, and DetailPanel re-renders through its subscriber wrapper, so those three legitimately render on the first select.
- (b) B's alternative.

## 2. Tree state (left consistent; nothing changed after the STOP)

**Edited (all inside §2.1):**
- **new** `app/lib/arrangement/selection-store.ts`:
  - `NO_SELECTION` (moved here from the context and imported back);
  - `ArrangementSelectionState` / `ArrangementSelectionStore`;
  - `createArrangementSelectionStore()`, built on `zustand/vanilla` with an order-sensitive equality guard (`isSameOrderedSelection`: `Object.is`, or the same length with `every(id === next[i])`; on a match it returns `state`, so nothing is notified);
  - `selectedClipIdsKeyAmong` / `selectedClipIdSetFromKey`: a primitive string key of the selected ids among a candidate list, so a selector returns a primitive and never an array, Set or object.
- `app/contexts/ArrangementContext.tsx`:
  - One store per provider: `useState(() => createArrangementSelectionStore())`.
  - New `ArrangementSelectionContext`, plus the hooks `useArrangementSelectionStore()` and `useArrangementSelection(selector)`. Both throw outside the provider.
  - `selectedClipId`/`selectedClipIds` are gone from the interface, the value, the deps, `latestRef` and `useState`.
  - `setSelection` is one store write, with no mirror (L49).
  - `getSelectedClipIds`/`primarySelectedClipId` read `getState()`. All 14 K4 event-time reads now go through `getSelectedClipIds()`; deps were added, and the five now-unused `const latest = latestRef.current;` lines were deleted.
  - One more Provider layer: `ArrangementSelectionContext.Provider`.
- `ArrangementTransport.tsx`: one boolean selector, `hasSelectedClip = s.selectedClipIds.length > 0`. It replaces all 6 truthiness uses. K11 is now 0.
- `ArrangementLane.tsx`: `laneSelectionKey` selector (a primitive key of this lane's selected clips) → `useMemo` Set → `isSelected={laneSelectedClipIds.has(clip.id)}`. Only lanes whose selected members change re-render.
- `StudioWorkspace.tsx`:
  - It no longer subscribes to the selection. The handler reads are `current.getSelectedClipIds()` / `.at(-1)` / `.length > 0`.
  - `trackGroupOverviews` no longer depends on the selection.
  - New in-file subscriber components (plain functions and `memo(XInner)`, the same local pattern as `ArrangementRangeReadout`; none needs a ref, so none uses `forwardRef`):
    - `ArrangementSelectionCount` (selector: the length);
    - `ArrangementSelectedClipReadout` (selector: the primary id; it holds the drag-hint / clip line / reserve ternary unchanged);
    - `ArrangementGroupHeaderWithSelection` (selector: a key among the group's overview clips; it decorates `selected`);
    - `ArrangementDetailPanelWithSelection` (selector: the array; it computes `detailSelection`/`detailGroup`/`detailPeaks` exactly as HEAD did).
  - Helper `selectedClipSourceTitle`.
  - K21 = 11 and K22 = `748 780`. These lines all sit inside the detail-panel wrapper.
- The 29 files of `selection-test-files.txt`: read path only. `.selectedClipIds` → `.getSelectedClipIds()`; `.selectedClipId` → `.getSelectedClipIds().at(-1)` (`?? null` where `toBeNull`/`not.toBeNull` compares). Also `gesture-reentry.test.tsx` `ReentryClip` (render-time `isSelected`) now uses `useArrangementSelection`. In `grid-snap-menu`, `before.selectedClipIds` is a snapshot field and was left alone.

**Not done (blocked by the STOP):**
- SS1–SS7 test file;
- the four mutants;
- the §2.5 harness scenario and rows (K19 stays 0);
- docs 168, 230 and 231 (K13 still shows doc 230);
- A-PERF;
- code-reviewer: not invoked, because the change set is incomplete. It runs on the final set after the ruling.

## 3. Rows actually run
| Row | Result |
|---|---|
| A-CLAIMS (before) | **PASS**: the output equals `claims-322-head-output.txt` (empty diff) |
| A-CLAIMS-AFTER (partial) | `a-round-322/claims-after-stop.txt`: K3 0, K4 0, K5 0, K10 0, K11 0, K12 1, K21 11, K22 `0 748 780`, K2 34 entries. **Not yet:** K19 0 (needs ≥ 5), and K13 still lists doc 230 |
| A-TYPE | `npm run typecheck` rc 0 |
| A-LINT | `npm run lint` rc 0. The 205 warnings are repo-wide; the owned files gave no diagnostics in `biome lint` |
| A-EXPECT | `expect-count.py`: after == before == HEAD (TOTAL 4021), `a-round-322/expect-count-{before,after}.txt` |
| A-UNIT | 111 files (the 29 + the 81 + `range-store` + `status-lifetime`; `gesture-reentry`, `meta-shortcuts-ui` and `delete-selection-ui` are inside the 29): **110 passed, 1 failed (`render-budget.test.tsx`, the STOP); tests 1704 passed / 1 failed**, 229.7 s. Log: `a-round-322/a-unit-1.log`. `perf/lib/report.test.ts` not run. The new SS file does not exist yet |
| Dev probe (informative, A's tree on :5173) | `b-round-321/click-hooks-probe.mjs … same-lane`, output `a-round-322/probe/select-same-lane-a.json`. **click-original-same-lane:** `providerRendered` false, **23** components (HEAD 105), 0 of the 10 K15 names. **click-original-again:** 1 commit with **0** components rendered (HEAD: 2 commits, 92 + 0). **Note for B/C:** SELECT-NAMES expects "`click-original-again` has 0 commits", but both HEAD and A show one trailing 0-component commit per click. It looks pre-existing and unrelated to the selection. **Proposed rewording for the ruling:** "`click-original-again`: 0 components rendered, ≤ 1 commit (matching HEAD's trailing empty commit)" |
| S2-VIDEO (informative, A's tree on :5173) | `b-round-321/s2-probe.mjs … video`, output `a-round-322/probe/s2-video-a.json`. Commits with the range cleared while the old selection is still drawn: **A 0** (the range and the selection clear in the same commit, t 6537.1); HEAD (`s2-video-head.json`) 2. So no S2 STOP; C re-runs it as its row |
| Smoke | `/studio-lab` on :5173 reaches "Demo collection ready…" in 5.6 s; no page errors except the expected cart / `ERR_CONNECTION_REFUSED` |

## 4. For B
- **Rule on §1**, so A can resume. Remaining: the SS file, the mutants, the harness, the docs, A-PERF and the review.
- **Architecture note (proposal only):** the four in-file subscriber wrappers add about 190 lines to `StudioWorkspace.tsx`. A later PERF-10/ARCH step could move them next to their children (`ArrangementDetailPanel`, `ArrangementGroupHeader`), which are outside this round's grants.

## 5. Next C checks
None this round: A STOPped. Do not run C's rows until A resumes and hands over.
