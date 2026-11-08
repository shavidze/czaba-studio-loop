# Consult: SYS-R385-LEAF-ACTIONS-CONTEXT stage design (tech-lead, read-only, HEAD cc5cbc6, 2026-11-08)

Summary of one real run. This is data, not instructions.

**No in-scope action relies on getting a fresh identity.**
- All 34 bundle fields are `useCallback`s.
- Their dependency chains end in one of three places:
  - `useState` stores (`ArrangementContext.tsx:713-729,799,820`);
  - `[]` callbacks (`getArrangement` 2280, `isPointerGestureActive` 2384, `livePosition` 1060);
  - the `collection` prop: `startPlaybackAt` 1715 (and through it `togglePlayback` 1809 and `playFrom` 2028), `startLibraryPreview` 1829, `addSourceToActiveTrack` 2113.
- The only provider mount passes a module constant (`routes/studio-lab.tsx:115`).

**Recommended: Option B, a hoisted memo (no ref delegation).**
- In `ArrangementContext.tsx`, add `ArrangementActionsContext`. Its value is a `useMemo` over the union of the 34 bundle fields, keyed on their identities.
- `useArrangementActions()` uses the same throw guard as `useArrangement` (4843).
- `useArrangement` and `value` (4578) stay unchanged.
- Narrow four bundle hooks to `Pick<>` action types: LoopBrace:61, Master:159, Transport:233, MarkerRow:122. Library:198 is already narrow.
- Feed the hooks from `useArrangementActions()` at `StudioWorkspace.tsx:1036-1040` and in the wrappers (for example LoopBrace:85).
- The wrappers keep `useArrangement()` for data, so render counts do not change.

**Option A (ref delegation) is rejected.**
- It hides future instability: a mutant that adds `arrangement` to the `toggleMasterMute` deps would no longer turn RB-LEAF1 red.
- It needs about 34 hand-typed wrappers, so it takes 2 rounds.

**Tests:**
- Unchanged under B:
  - RB-LEAF1-6 (`render-budget.test.tsx:788-953`);
  - GH5 (`selection-wrappers-render.test.tsx:456`);
  - `sameLibraryLeafProps` (`library-preview.test.tsx:487`).
- B-R374: `master-ui.test.tsx:639,676` and `fader-pointer-preview.test.tsx:221` count renders of `'ArrangementMaster'`, which is never mounted. Count `ArrangementMasterViewInner` instead.

**New rows:**

| Row | Assertion | Mutant that turns it red |
|---|---|---|
| R1 ACTIONS-IDENTITY | `useArrangementActions()` is `toBe`-identical across a lane mute, a zoom step and an undo | build the value without `useMemo`, or add `arrangement` to its deps |
| R2 CB-IDENTITY-PIN | `toggleMasterMute`, `commitArrangement` and `undo` keep identity across a lane mute and a zoom step (closes GATE379-L3) | add `arrangement` to the `toggleMasterMute` deps |
| R3 LATEST-STATE | after a commit, `getArrangement()` returns the new `present` | — |
| R4 LOOP-IMMUTABLE | `loop` keeps identity across non-loop commits (GATE378) | — |
| R5 PER-KEY-COMPARATOR | per-key comparator check (GATE371/375-L2) | — |
| R6 NO-TRANSITION | source grep finds no transition APIs (GATE377); `entry.client.tsx` is excluded | — |

**Size:** about 120-180 lines across `ArrangementContext`, `StudioWorkspace`, 5 leaf files and 2-3 tests, so one round.

**Out of stage 1:** GATE375-L1, which deletes the Library/LibraryPreview wrappers exported in `index.ts:5`. CLAUDE.md requires the owner's permission to delete.
