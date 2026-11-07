# Sketch review — round 379 (PERF-11c-iii-c2b, MarkerRow leaf)

**Dispatched sketch:** `b-round-378/sketch.patch.txt`, sha256 `eaa1b3fdf040cf8077143f0ba8ae6e602ba8e983381b26171298cd99d357f067` (v2).
**Reviewed:** v1 `42ae6ae9006ec78bc429e26cb96b7b6dec2c27d52d9cc87f2dde436bcf77ff60` (full review), then v2 `eaa1b3fdf040cf8077143f0ba8ae6e602ba8e983381b26171298cd99d357f067` (delta re-review, L58). Reviewer: `tech-lead` (read-only), 2026-11-07. v1 is kept as `sketch-v1.patch.txt`, and the interdiff is `sketch-v1-to-v2.interdiff.txt`.

## 1. v1 review — APPROVE (no Medium+)
Answers:
- **Effects with no dependency array:**
  - `detachedFocusRef` is set only inside a flag's ref callback, which runs in a view commit, so the same commit's layout effect consumes it.
  - Every path that sets `pendingFocusRef` also triggers a view render (a move commit, an add commit, `setEditor`, `setMenu(null)`) or focuses a connected flag at once. The one exception is L1.
- **Handle:** no stale closure.
  - `closeMenu` reads the view's own `menu` state.
  - `projectEnd` is a prop.
  - `beginAddMarker` and `focusEditorSuccessor` use stable callbacks and refs only.
- **`handleRef: Ref<…>` + `useImperativeHandle`:** type-safe with no assertions. Dropping forwardRef and `displayName` is fine, because StudioWorkspace is the only user.
- **The 11 provider callbacks** are stable across ordinary commits; every dependency was followed to a `useState(() => create…())` store or a `[]` callback. The two store hooks do not subscribe.
- **Markers identity:** `markers` keeps its identity on non-marker edits. The delete-time remap in `model.ts` builds a new list, which is meant to show.

Findings and B rulings:

| Id | Severity | Finding | B ruling |
|---|---|---|---|
| TL-R379-L1 | Low | `focusEditorSuccessor` targeting a flag that is not connected leaves `pendingFocusRef` set. At HEAD the workspace render cleared it; under memo it waits, so a later Redo could pull focus to that flag | **Fixed in v2.** `pendingFocusRef.current = null` after `focusMarkerTarget(...)`, still `return true`. The reviewer's `return false` form was rejected because it would send the grid-menu close on to the group-name fallback (StudioWorkspace), which HEAD does not do. Result equals HEAD: focus if connected, otherwise nothing and no later jump |
| TL-R379-L2 | Low | RB-LEAF6 lacks playback/range zero steps (G1) and a projectEnd-only positive step plus a handle check after skipped renders (G2) | **Fixed in v2.** Play and Stop click plus `setTimeRange` → ViewInner 0. A projectEnd-only commit (music clip duration 40; projectEnd must change and markers keep their identity) → ViewInner 1, then Undo. M on body → the name input opens and has focus |
| TL-R379-ARCH | note | Fifth `useXActions(workspace)` + memo leaf, with hand-written 11-entry `useMemo`s. Proposal: one stable actions context created once in the provider | Architecture signal **SIG-R379-ACTIONS-CONTEXT**, the seventh echo to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (that request's option B). Not scheduled |

## 2. v2 delta re-review — APPROVE (no Medium+)
- **(a) The L1 form is correct and equals HEAD in every path.** Every `closeGridMenu` caller leaves markers unchanged, so at HEAD the flag could not connect before the effect cleared pending.
- **(b) The RB-LEAF6 steps are sound and deterministic.**
  - Play/Stop follow the existing synchronous `isPlaying` checks.
  - The projectEnd step is pinned from both sides.
  - The final M step is a real check that the handle is current after skipped renders.
- **Low, optional (TL-R379-D1):** the Play/Stop/range block asserts ViewInner 0 but not StudioWorkspace > 0. **Ruled not applied:** the mute/undo loop in the same row already shows StudioWorkspace rendering while ViewInner stays 0, and the three behaviour mutants are red at that loop (l.981). Adding the assertion would need a third review cycle for an optional Low. Recorded as info.

## 3. Mutants (v2, `mutants/sketch-run/`)
| Mutant | Red rows | First red line |
|---|---|---|
| MU-MR-NO-MEMO | RB-LEAF6 only (1 failed / 6 passed / 13 skipped) | l.981 (zero-render assert in the mute/undo loop) |
| MU-MR-ACTIONS-FRESH | RB-LEAF6 only | l.981 |
| MU-MR-MARKERS-FRESH | RB-LEAF6 only | l.981 |
| MU-MR-HEAD-REVERT | RB-LEAF6 only | l.966 (add-marker positive control; the name `ArrangementMarkerRowViewInner` does not exist at HEAD — a name guard, not a behaviour proof) |

The v1 mutant logs are kept in `mutants/sketch-run-v1/` with the same red lines.

**No mutant for TL-R379-L1:** a red row needs the grid menu open, a delete or Undo, then a Redo. The fix equals HEAD by construction, and the reviewer confirmed the path. The existing GM44 and GM45 (grid-snap-menu) cover the connected-flag path and pass on v2.

## 4. Pre-check runs
- **v2:** tsc rc 0 (`sketch-typecheck.log`); Biome rc 0 on the 3 files (`sketch-biome.log`); full suite 252 files / 3,725 tests rc 0 (`precheck-full.log`; the v1 run is `precheck-full-v1.log`, same totals).
- **v2 browser, dev on :5174** with its own cacheDir:
  - The marker recipe equals HEAD on s0–s17 at both viewports (`probe/marker-sketch-379.json` vs `marker-head-379.json`).
  - In the leaf probe only MarkerRow cells differ, plus `ArrangementLibraryPreviewViewInner` on `library-preview-stop` (315 vs 314/316). That cell counts preview progress frames by wallclock, and the full suite ran at the same time (L37). v1, run without load, had it equal.
- **Perf interactions spec (production build, alone):** run on **v1** (`perf-sketch.log`): 0 FAIL, 264 rows, 1 record-only count difference (the known video median). Not re-run on v2: the v1→v2 code delta is one statement in `focusEditorSuccessor`, which no perf scenario reaches, plus test-only lines. Recorded as `record — not run on sketch v2: code delta outside every perf scenario`.
