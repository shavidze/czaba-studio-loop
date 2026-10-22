# Request to root: bounded frontend-architect checkpoint at the SRW-16 boundary (B, 2026-10-22)

- **Status:** requested. Backlog ID `ARCH-CHECKPOINT-SRW16`.
- **Non-blocking:** round 79 (SRW-17 stage 1) goes ahead as dispatched, and its ownership does not change.
- **Process:** `store/.claude/references/architecture-checkpoint.md`, using the read-only `frontend-architect`.
- **Output:** per question, a keep/extract verdict, its value, its risk and at most three sentences.
- **Follow-up:** an approved extraction becomes its own B task, with one owner and behaviour-preserving tests.

## Why now
- SRW-16 (markers) is finished. All of its stages have C PASS with browser evidence: 6b574e8, e347b97, db9cc25, 60006d4 and c062147.
- Over rounds 76–78, the same four files changed in every round: `ArrangementClip`, `ArrangementLoopBrace`, `ArrangementRuler` and `StudioWorkspace`, together with `grid.ts`. This is reviewer signal 3: one region changed repeatedly at high cost.
- `StudioWorkspace.tsx` (2044 lines) grows again in SRW-17. It gains the track selection, the Ctrl+G block and the group rows.

## Questions (at most one line of evidence each)
1. **Snap entry points:** should there be one `resolveSnapTime(time, {snapSeconds, gridSeconds, bypass, targets = []})`, with `resolveGridTime` retired (its single caller is `ArrangementMarkerRow.tsx` l.490)? And should a microsecond rounding helper be exported, instead of the inline `Math.round(x*1e6)/1e6` in `ArrangementLoopBrace.tsx`? Evidence: gate-78 review (Architecture note, #1), `ARCH-R78-RESOLVE-SNAP-TIME`, `GATE78-S1-LOOP-MICROSECOND-HELPER`.
2. **`snapTargetsFor(arrangement, excludeClipId, lanes)`:** this would replace the `clipEdgeTargets(..., markerSnapTimes(arr))` call that repeats at 4 sites. Evidence: `ARCH-R76-SNAP-TARGETS-HELPER`, `GATE76-S1` (computed 3× per pointermove).
3. **Pure `resolveArrowShortcut(...)` for the `handleKeyDown` arrow/modifier precedence:** its outcomes would be step, nudge, block, browser or null, with a table test. This precedence changed in rounds 73, 76 and 77. A related question is whether a `timeline-stops` module should be created. Evidence: `ARCH-R77-RESOLVE-ARROW-SHORTCUT`.
4. **Owner risk in `ArrangementMarkerRow.tsx` (813 lines):** it handles the drag, the menu, the editor and stepping. The marker and grid menus duplicate about 70% of their logic between them. Evidence: gate-75 Architecture note. **Pending Lows on this file:** GATE75 S1–S6. S1 is unreachable at c062147 (B source read: every zoom path refuses during a gesture), so it needs only a lock test.
5. **The `isFollowAutoScroll` duplicate**, and the open items of `ARCH-CHECKPOINT-SRW14-PREFS`: grid preferences, time precision, the shared UI test harness (now the 6th copy), grid-menu state, the focus-release predicate, and the metronome buffers.
6. **GATE76-S2:** in a group move where the nearest marker is out of bounds, the move falls back to the grid. Should the nearest **in-bounds** candidate win instead? This is a product and architecture question, recorded as deliberate in doc 066.
7. **Placement of the SRW-17 track selection:** should it stay as UI state in `StudioWorkspace`, or go into a small hook or slice? For context, stage 1 deliberately keeps `ArrangementContext.tsx` (2948 lines) untouched.

## Not requested
- No refactor in round 79.
- The line count alone is not a reason to split anything.

## Addendum — SRW-17 (B round 79 planning, 2026-10-22; still non-blocking, no root result found yet)
- **Accumulated risk:** `StudioWorkspace.tsx` went from 2044 to 2225 lines in round 79, and round 80 (stage 2, collapse) adds `collapsedGroups` to `TrackLaneLayout`, a `u` key block and focus restore. Signals 2 and 4 come from two independent reviewers: A's code-reviewer and the gate-79 reviewer.
- **Proposal from both reviewers (verbatim summary):** extract the track-row selection, its anchor ref, live filtering and the group commands into one bounded `useTrackRowSelection` hook. Acceptance criteria:
  - `useArrangement()` keeps its shape;
  - TG1–TG11, TG8b and GU1–GU6 stay green and unedited;
  - no new window listeners;
  - Undo/Redo stays one entry per command.
  - Move `ARRANGEMENT_HEADER_WIDTH_PX` and `TRACK_HEADER_PADDING_X_PX` into `lib/arrangement/` only if that extraction happens.
- **8.** Should this extraction happen at the SRW-17 boundary (after stage 3), and should the stage-2 collapse state (now in `TrackLaneLayout`, beside the track fold) go into the same hook, or into a separate lane-layout hook?
- **Round 80 does not extract anything.** It keeps the existing pattern: the collapse state sits beside `folded`, and pure helpers go in `groups.ts`.

## Addendum 2 — SRW-17 feature boundary (B round 80 planning, 2026-10-22; still non-blocking, no root result found yet)
- **Feature boundary:** round 81 is the last SRW-17 stage (group Mute/Solo/Volume). After its C PASS, SRW-17 is feature-complete pending Tech Lead checks, so this is the boundary the round-79 addendum named.
- **Accumulated risk:**
  - Round 81 is the first SRW-17 round that opens `ArrangementContext.tsx` (2948 lines). It adds group mix actions and a group volume pipeline beside the track volume pipeline (`volumeGestureRef`, `volumeBeforeRef`, flush/commit/blur/cancel).
  - `StudioWorkspace.tsx` is now 2471 lines (2044 before SRW-17).
  - Signal 4 came from both round-80 reviewers: `collapsedGroups`, `pendingRowFocusRef` with a dependency-less layout effect, and three DOM focus helpers.
- **9.** Answer these together with question 8:
  - (a) Should the track and group volume pipelines in `ArrangementContext` share one target-kind abstraction, or stay parallel?
  - (b) Should the row-focus helpers move to `app/lib/arrangement/row-focus.ts`, with a `data-testid` on the lane name button replacing the Georgian label match (gate-80 #3, `ARCH-R80-ROW-FOCUS`)?
  - (c) Should the collapse state and the track-row selection go into one hook or two?
- **Round 81 does not extract anything.** Any approved extraction becomes its own B task, with one owner and with the stage-1/2/3 test files as the behaviour lock.

## Addendum 3 — SRW-17 boundary reached (B round 81 planning, 2026-10-22; still non-blocking, no root result found yet)
- **Status:** SRW-17 stage 3 is C PASS and published (`efbed86`), so the SRW-17 boundary named in addenda 1–2 is now reached. Both the SRW-16 and the SRW-17 boundaries have passed without a checkpoint result. B does not hold back the independent SRW-18 work for it (agent-workflow: non-urgent structural notes do not stop core features).
- **New signal (round 81, two reviewers, verbatim summary):** `ArrangementContext.tsx` (3088 lines) now holds a general track-or-group volume lifecycle: `MixVolumeTarget`, `volumeTargetKeyRef`, cross-flush between targets, six new group members. Both say **keep for now**: the flush points (`applyEdit`, Undo/Redo, Master) protect Undo atomicity and belong with one owner. Proposal: one bounded task that moves the pending-volume state machine (before-snapshot, target key, gesture handle) into a pure `lib/arrangement/` module; the `useArrangement()` shape stays; acceptance UM3, UM9, `fader-guards.test.tsx` and UC2 green and unedited.
- **10.** (a) Is that extraction worth doing now that question 9(a) has been answered in code (one `MixVolumeTarget` abstraction), or only when a third target kind arrives? (b) Round 82 (SRW-18 stage 1) touches `ArrangementContext.tsx` by exactly one `startGraph` option line and `ArrangementClip.tsx` (737 lines) by new fade gestures. Does the clip gesture code (`move`/`trim`/`range`/`fade*`) need its own pure gesture module before SRW-18 stage 2 adds envelope breakpoints to the same component?
- **Round 82 does not extract anything.** Any approved extraction becomes its own B task with one owner and behaviour-locking tests.

## Addendum 4 — SRW-18 feature boundary, accumulated owner risk (B round 82 planning, 2026-10-22; still non-blocking, no root result found yet)
- **Feature boundary:** round 83 is the last SRW-18 stage (clip volume envelope). After its C PASS, SRW-18 is feature-complete pending Tech Lead R82-T/R83-T.
- **Accumulated risk on one owner:** `ArrangementClip.tsx` (895 lines) has been an owner file in rounds 80, 81, 82 and now 83.
  - Both round-82 reviewers (A's code-reviewer and the gate reviewer) raise signals 3 and 4. `beginGesture`/`handlePointerMove`/`finishGesture` handle six kinds, with a per-kind capture element (l.341) and a separate fade cancel/commit branch (l.619–641).
  - Both say **keep for now**: one claim, capture and release lifecycle keeps every gesture a single Undo entry.
  - Their proposal is a per-kind handler table `{ capture, onMove, onRelease, onCancel }` behind the same `ClipGesture` record. The acceptance gate: grid-snap, lane, selection, clip-fades UI and render-budget tests unchanged. Value medium, risk medium.
- **What round 83 does instead:** envelope point gestures go into a new child component, `ArrangementClipEnvelope.tsx`. It uses the same `claimPointerGesture` / `previewArrangement` / `commitArrangement` props, so no kinds 7–9 are added to the switch.
- **11.** (a) Is the per-kind handler table worth one bounded task after SRW-18 closes, or only when a seventh in-switch kind is needed? (b) Should the child-component pattern (own capture on the target element, revert on cancel/unmount) become the rule for future clip sub-editors, with the trim/fade handles moved to it in the same task? (c) Should `lostpointercapture` be handled once at the clip level (GATE82-S7)?
- **Round 83 does not extract anything from the existing switch.** Any approved extraction becomes its own B task, with one owner and behaviour-locking tests.
