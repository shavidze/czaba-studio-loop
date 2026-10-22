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
