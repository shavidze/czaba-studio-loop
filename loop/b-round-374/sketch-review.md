# tech-lead sketch review — PERF-11c-iii-b (round 375), B planning 374 → 375

Reviewed: `b-round-374/sketch-v1.patch.txt` (sha 0379bb61…), applied in `b-round-374/scratch` on ad13a96. Verdict: **approve with changes**.

## Rulings (tech-lead, verbatim in substance)
1. **Correctness:** no stale reads. Old Library read 10 `useArrangement()` fields and old Preview 9 (baseline `ArrangementLibraryPreview.tsx:93-103`); every one is now a prop. Extra subscriptions: `useArrangementActiveTrackId` and the insert-marker store only. `optionHandlersRef` never reads `tracks`. The 7 actions are stable (`ArrangementContext.tsx:1552-1810`, refs inside). Preview reads only `id`, `kind`, `name` of a track; typing the prop as `readonly LibraryTrackLabel[]` enforces it. Refs are `useRef`, `changeLibraryCollapsed` is `useCallback([])`, `bottomInsetPx` a number. Missing-vs-undefined optional prop only causes an extra render, never a stale one. The context has no rename/add/delete-track API.
2. **Shape and home:** no circular import (Library already imported Preview). Generic for-in comparator acceptable. Low: only `memo(x, compare)` in the folder → put a pure `library-leaf-props.ts` on the architect checkpoint's list. Low: Preview wrapper builds actions with an inline `useMemo` while Library exports a hook.
3. **Tests:** the renames are required (wrappers no longer mount under StudioWorkspace). New names are proven counted by positive asserts. Replacing the CONTEXT_CONSUMERS row by "ViewInner 0 after `resetExportState`" is stronger.
4. **Mutants:** all 7 planned die (MU-PREVIEW-NO-MEMO only on the search step; label/extra-key mutants only in LP-EQ1/LP-EQ2).

## Findings and B's action
| # | Sev | Finding | B action (sketch v2) |
|---|---|---|---|
| TL-375-H1 | High | MU-LIB-SITE-REVERT / MU-PREVIEW-SITE-REVERT (StudioWorkspace or Library renders the old wrapper) survive | **Fixed:** RB-LEAF3 asserts `ArrangementLibrary` 0 and `ArrangementLibraryPreview` 0 after mute/zoom/Undo; both mutants added |
| TL-375-M1 | Medium | `render-budget` Play→Stop→Play row still counted `'ArrangementLibrary'` (always 0 now) | **Fixed:** renamed to `ArrangementLibraryViewInner` |
| TL-375-M2 | Medium | LP-EQ1 had no id-only case (MU-TRACK-LABEL-NO-ID survives) | **Fixed:** id-only and kind-only cases added; MU-TRACK-LABEL-NO-ID added |
| TL-375-L1 | Low, pre-existing (round 374) | `master-ui.test.tsx:639,676` and `fader-pointer-preview.test.tsx:221` count `'ArrangementMaster'` under StudioWorkspace, where the wrapper is no longer mounted: vacuous | Filed B-R374-MASTER-VACUOUS-NAME-COUNTS (Low, deferred_low_polish; fix home: the next round that owns those test files, or the polish pass). Not granted now (not this round's files) |
| TL-375-L2 | Low | swapping `selectedSourceId` / `libraryPreviewSourceId` (both `string \| null`) type-checks | info; guarded by existing workspace UI tests and C's browser rows |
| TL-375-L3 | Low | comparator home (`library-leaf-props.ts`) + inline preview actions memo | architecture signal SIG-R375-LEAF-COMPARATOR-HOME → ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING list |

**Checkpoint:** safe to wait for the frontend-architect checkpoint; moving to pattern B later touches two call sites; the comparator is the only pattern-A-specific part.

## Delta review of v2 (tech-lead, same planning)
**Approve v2 (sha b246502f…79da2f).** H1 fixed (RB-LEAF3 asserts both wrappers 0 after mute/zoom/Undo with a StudioWorkspace > 0 control; MU-LIB-SITE-REVERT and MU-PREVIEW-SITE-REVERT red on RB-LEAF3). M1 fixed (the Play→Stop→Play row counts `ArrangementLibraryViewInner`; MU-LIB-NO-MEMO and MU-LIB-ACTIONS-FRESH red on it). M2 fixed (id-only and kind-only LP-EQ1 cases; MU-TRACK-LABEL-NO-ID red on LP-EQ1). Nothing new: the interdiff is test-only; all 10 mutants red; `restore-check rc 0`. Note: no NO-KIND mutant was run; the kind-only case covers it (not blocking). **Reviewed sha = dispatched sha.**
