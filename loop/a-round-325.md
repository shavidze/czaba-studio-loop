# A round 325: PERF-DRAG-PREVIEW stage a (audio trim and same-lane move preview store) + §5 doc fixes

**Status:** implemented, no STOP. Partial checkpoint log: `a-round-325/checkpoint-log.md`. Nothing was committed or pushed.

## Changed files (16 status entries, all §2.1 or §2.3)
- New: `app/lib/arrangement/preview-store.ts`, `app/lib/arrangement/__tests__/preview-store.test.ts`, `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`, `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`.
- Modified source: `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/{ArrangementClip,ArrangementLane,StudioWorkspace,ArrangementTransport}.tsx`, `perf/budgets.interactions.json` (2 rows only). On those two rows (`interact.drag.{trim,move}.playing.move-restarts`) `mode` → `assert` and `budget` → `{op: ==, value: 0}` as ruled. I also changed `owner` → `PERF-DRAG-PREVIEW-a` and the `note` to say "Asserted since PERF-DRAG-PREVIEW stage a …". This mirrors the same-file precedent for the PERF-8a range rows (owner `PERF-8a`, "Asserted since" note). No other row changed.
- Modified tests (P1 only): `grid-snap-ui.test.tsx`, `grid-snap-edit.test.tsx`, `gesture-guard.test.tsx`.
- Docs: 168 (`## მეტრიკები`, one paragraph), 230 (D-29z860 line in Georgian), 231 (K19 problem solution + მიდგომა item 8). l.4 of 230/231 unchanged.
- `ArrangementOverview.tsx` is **not** changed: the overview wrapper lives in `StudioWorkspace.tsx` (§2.1 option).
- Protected files: K8 = 11.

## What was built (§1)
- `previewClipGeometry(next)` in the provider: it sets `previewActiveRef`, writes only `historyRef.current = { ...historyRef.current, present: next }`, and calls `previewStore.setPreview(next)`. It never calls `setHistory`, `updateHistory` or `syncPlayback`. It is a stable `useCallback([previewStore])` and is part of the context type and value. `previewArrangement` keeps its HEAD body (K3 1, K27 `0 1`).
- `updateHistory` sets `publishedHistoryRef`, calls `setHistory` and then `clearPreview` in the same call. `setHistory` has no other caller.
- Convergence (§1.4) lives in the `beginPointerGesture` release when the count reaches 0: `if (historyRef.current !== publishedHistoryRef.current) updateHistory(historyRef.current)`. No flush was added.
- Call sites (§1.2) use a local `previewGeometry = isVideo ? previewArrangement : (previewClipGeometry ?? previewArrangement)` at two places: the `moveClip` success branch and the trim branch. K5 is 5 (fade 1, group 1, `gesture.before` 3) and K7 Clip is 5. The prop is **optional**, so `gesture-reentry.test.tsx`, which renders `ArrangementClipView` directly, needs no edit.
- Subscribers (§1.5):
  - Lane `clips` comes from `useArrangementPreviewLaneClips(arrangement, track.id)`, a new context hook with `useShallow`. It feeds the range and selection keys and the view.
  - `ArrangementSelectedClipReadoutInner` uses `selectPreviewClip`.
  - `ArrangementDetailPanelWithSelectionInner` uses `useShallow(selectPreviewClipsAmong)`.
  - A new `ArrangementOverviewWithPreviewInner` + `memo` uses `selectPreviewOrCommittedArrangement`.
  - The project end is a primitive (`selectPreviewProjectEnd`) in `StudioWorkspace` (timelineSeconds/extent) and `ArrangementTransport`.
- Within-grant deviation: §2.1 lists the hooks under `preview-store.ts`. The store-context hooks (`useArrangementPreviewStore`, `useArrangementPreview`, `useArrangementPreviewLaneClips`) are in `ArrangementContext.tsx`, next to the range and selection hooks, because a hook in `preview-store.ts` that needs the provider's store would import the context (circular import). `preview-store.ts` holds the store and the pure selector helpers.
- Existing `…Inner` names are unchanged. The new name `ArrangementOverviewWithPreviewInner` is live in DP6 (> 0) and in the dev probe.

## Acceptance rows (A), as actually run
| Row | Result |
|---|---|
| A-CLAIMS | PASS. The output equals `claims-325-planning-output.txt` (`a-round-325/claims-before.txt`) |
| A-IMPL | §1, §2 and §5 done |
| A-CLAIMS-AFTER | `a-round-325/claims-after.txt`. The changes from planning are K2 `b925434 16`; K3 1; K5 5; K7 Clip 5 / Envelope 2 / MarkerRow 2 / Context 1; K13 doc 232 only; K15 `48 46`; K16 `0 0`; K17 `present 1`; K22 shows no `same`, because the list gained only `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (count 51; the planning file still has 50). These are unchanged: K8 11, K10 1, K11 1, K12 `2 1`, K18 6, K23 `1 2`, K24 `1 1`, K25 `1 0`, K26 1, K27 `0 1`, K28 53, K29 8, K30 release-before-commit |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0 (205 warnings and 1 info, all pre-existing). Biome on the 11 owned code files: clean (`a-round-325/biome-owned.log`) |
| A-UNIT | Covering set of 54 files (`a-round-325/covering-set.txt`): 54/54 files and 1033/1033 tests (`covering-run-2.log`). No source file changed after `covering-run-2`. Only `drag-preview-render.test.tsx` and `gesture-guard.test.tsx` were edited afterwards, and both were re-run green (10 + 19), so the other 52 files are unaffected. `preview-store.test.ts` was not edited after the run. `perf/lib/report.test.ts` via the scratch config `/tmp/a325s`: 34/34. The slowest tests are under 50 % of their declared timeouts: CP12a–d about 10 s of 30 s, TC10 4.5 s of 15 s |
| A-EXPECT | `expect-count.py`: the b321 list is identical for HEAD and A. The 3 edited files keep their counts: 114/104/199 at HEAD and after (`expect-count-changed.txt`) |
| A-MUTANTS | `a-round-325/mutants.py`, run on the scratch `/tmp/a325-mut` with the final code. All 7 turn red, each on its named row: MU-NO-SHALLOW→DP1, MU-PREVIEW-THROUGH-HISTORY→DP2, MU-NO-CLEAR-ON-UPDATE→DP3/DP8b, MU-REF-NOT-TRACKED→DP5, MU-READOUT-COMMITTED→DP6, MU-END-COMMITTED→DP7, MU-NO-CONVERGE→DP8a. Restored: 14/14 (`mutants/`) |
| A-PERF (alone) | Production builds of HEAD (`git archive b925434` → `/tmp/a325h`) and A (`/tmp/a325a`, the **final source**: after it was built only the two test files changed; `diff -rq /tmp/a325a/app app` shows only `__tests__` differences), each spec run once, with nothing else running. Both rc 0, `failures` [] on both, 0 problems in 6/6 passes. **Trim 1× per-move: HEAD 106.2 → A 24.583 (ratio 0.231)**, max 106 → 23, `commits-per-move` 1.967 on both. Move per-move 105.317 → 106.85, max 107/107. `move-restarts` 0/0 (now asserted, pass). `drag-trim-live`/`drag-move-live` 1/1. Full table: `a-round-325/perf-rowcmp.txt` |
| A-NAMES (dev) | `a-round-325/probe/c324-names-probe.mjs` on :5173 (A's tree). `trim-moves`: per commit [23,2,23,2,23,2,23,2], none of the 8 names in any commit, `ArrangementLane` 1 per move commit → **holds**. The first attempt timed out at the cold page load (L38, environment-invalid, not counted); the re-run is valid. `move-moves`: provider no longer renders, but `StudioWorkspace` plus the whole tree still renders (the end moves, stage c) |
| A-REVIEW | `code-reviewer` ×3. Pass 1: no Critical/High. Pass 2, on the test edits: one Medium, fixed. Pass 3: clean. Details below |

## Code review (3 passes)
- **Pass 1.** The 7 checklist points were verified clean: selectors, no `setHistory`/`syncPlayback` from `previewClipGeometry`, `updateHistory` is the only `setHistory` writer and clears the store, convergence exists, names unchanged, old paths kept, stable callback.
  - **Medium (perf):** `StudioWorkspace` subscribes to the live project end, so a trimEnd or a move that extends the end still renders the whole tree. **Not changed:** §1.5 rules exactly this ("the workspace renders as at HEAD"), and it is stage c. → B.
  - **Low 4c:** when a clip unmounts mid-drag, convergence runs in passive-effect cleanup. `setHistory` gets DefaultLane while the store clear re-renders subscribers on SyncLane, so one frame can show the pre-drag geometry before the converged state. The end state equals HEAD. The suggested fix (clear in a layout effect after the history commit) contradicts ruling §1.3 ("updateHistory clears … in the same call"), so per L11 it is **not applied** → B to rule.
  - **Low (fixed):** the DP2 clip-view count is now pinned at `toBe(2)`; DP3 uses `studioClipStrings.trimStartLabel`; new row **DP5b** covers same lane → other lane → back → release.
  - **Low, not changed:**
    - The `move-restarts == 0` asserts could flake if the harness scenario ever enables a loop, because the loop-wrap resync calls `syncPlayback`. The current scenario has no loop.
    - The overview bars are read through inline `style.left`, not a class selector; a bar testid would be sturdier but is outside the grants.
- **Pass 2, test edits.**
  - **Medium:** `gesture-guard.test.tsx:272` `clipStart(...).toBe(2)` after the stale-gesture re-claim had become vacuous, because React state stays 2 during the drag. Fixed with the P1 pattern (`previewClipStart`, which reads `getArrangement()`); the expect count is unchanged.
  - **Low:** DP5b gained a `getArrangement()` check during the cross-lane step.
  - **Low, not changed:** `gesture-guard.test.tsx:355` (after a window-only pointerup, the gesture has ended) still reads `clipStart`. It is not mid-gesture, so it is outside P1; lines 356–357 cover the cleanup.
- **Pass 3:** both edits confirmed correct and non-vacuous; nothing new.
- **Architecture note (proposal for B/root, not applied):** this adds new state and lifecycle in an existing owner (`previewStore`, `publishedHistoryRef`, convergence in the release closure). The reviewer's verdict is keep, because convergence must observe `gestureCountRef`. Optional: a small `lib/` object that owns `historyRef`, `publishedHistoryRef` and the store (`preview` / `publish` / `converge`), so the invariant "ref ≠ React state only while the store holds a preview" can be unit-tested without rendering.

## P1 hunks (old → new; the helper reads `live(api).getArrangement()`)
- `gesture-guard.test.tsx`: new helper `previewClipStart`. Line 259→265 `clipStart(api,'music-1')).toBe(4)` → `previewClipStart`; line 266→272 `.toBe(2)` → `previewClipStart` (reviewer pass 2); line 344→350 `.toBe(4)` → `previewClipStart`.
- `grid-snap-edit.test.tsx`: new helper `previewClipOf`. SE5 392→402 `toBeCloseTo(7.05, 9)`, SE20 420→430 `toBeCloseTo(7.6, 9)`, SE14 544→554 `toBe(7.925)`; each `clipOf` → `previewClipOf` (mid-gesture, before pointerUp).
- `grid-snap-ui.test.tsx`: new helper `previewClipOf`. GS12 536→546 `toBe(7.5)`, GS13 557→567 and 561→571 `toBe(8.5)`; each → `previewClipOf`.
- No P2 case: the 8 consumer-count positive controls (K29) are unchanged and all covering files pass.
- Full diff: `a-round-325/test-hunks.patch.txt` (the final state, including line 272 and DP5b).

## PERF-LOAD-relevant note (for C)
The new always-mounted subscriber is `ArrangementOverviewWithPreviewInner`: one instance, rendered once per `StudioWorkspace` commit when its props change. In the interactions run, `interact.zoom.{1,30}.components-*` and `interact.drag.fade.*.move-components-*` rose by exactly +1 per commit for this reason (zoom 98→99 and 243→244; fade 102.267→103.25, max 104→105). The move rise (105.317→106.85) is +1 wrapper plus 2 more window commits (120 vs 118): store updates commit on React's SyncLane, which is my inference, not measured. Move rows are `record` (stage c). I did not run `studio-lab.perf.spec.ts` (PERF-LOAD is C's row).

## Known gaps / not run by A
- Gate rows not run: full vitest, build in `store/`, `npm run verify`, e2e smoke. I made no browser behaviour comparisons (D-* rows are C's).
- Low 4c (unmount mid-drag one-frame split) is open for a B ruling. The reviewer's Medium about the project-end subscription is stage c by ruling.
- Mid-drag, the fit command reads the committed `projectEnd`, but `fitTimeline` already returns during a gesture (reviewer pass 1), so this has no effect.

## Exact next C checks
1. CLAIMS first: expect the A-CLAIMS-AFTER values above, including K22's list delta (the one new test file).
2. SOURCE-SCOPE: the 16 entries listed above; protected 11/11.
3. UNIT: DP1–DP9 plus DP5b. Re-run `a-round-325/mutants.py` on a scratch copy, plus one mutant of C's own, for example dropping `useShallow` in `selectPreviewClipsAmong`'s caller or making `previewGeometry` ignore `isVideo`.
4. DRAG-NAMES on HEAD and A (`trim-moves` as above; `move-moves`/`fade-moves` record; A shows `ArrangementOverviewWithPreviewInner` once per workspace commit).
5. PERF-DRAG and PERF-LOAD alone. Attribute each +1 rise to `ArrangementOverviewWithPreviewInner` by name. Check the move commit count (120 vs 118).
6. D-NOFLASH on release (5 rAF frames), D-MIXED (i)/(ii), D-ABORT, D-LOOP, D-OLDPATH (fade, group, video), EXPORT sha256, G325-AUTH, and DOCS (232 l.4, headings, doc 168 paragraph, §5 lines).

## Scope completed
PERF-DRAG-PREVIEW **stage a only**. Stages b (fades) and c (group, cross-lane, video, a move that extends the project end) are not started. The backlog is not complete.
