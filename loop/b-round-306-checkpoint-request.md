# Bounded frontend-architect checkpoint request (B, round 306 -> 307 planning, 2026-11-03)

**For root.** Non-blocking: round 307 (PERF-COMMIT-RESCHEDULE stage a) does not touch `ArrangementContext.tsx`; stage b (round 308 or later) does not wait for the answer either. Procedure: `store/.claude/references/architecture-checkpoint.md`. Read-only. The answer is keep/extract per question, value, risk, at most three sentences each.

## Why now
PERF-COMMIT-RESCHEDULE stage b adds one more writer to the playback scheduling refs in `app/contexts/ArrangementContext.tsx` (4,329 lines at `ecb832a`). The same owner already carries the signals ROOT-R71-ARCH-REFILL (two refill pipelines beside `startGraph`), ARCH-R81-VOLUME-STATE-MACHINE and GATE83-M2/SRW19-RESCHEDULE (rebuild per preview). Round 306 also left two notes on the timeline window contract.

## Questions (constraint: "do not rewrite the playback engine"; `positionStore` and the imperative position writers stay)
1. **Scheduler state.** Should `handleRef`, `anchorRef`, `loopScheduleRef`, `metronomeHorizonRef`, `scheduledKeyRef`/`scheduledEndRef` (plus the planned `scheduledArrangementRef`) and `retiredRef` become one scheduler object that the context holds but does not implement? (tech-lead, round 306 consult)
2. **One definition of "needs rebuild".** Should the structured diff (`diffClipSchedule` in `app/lib/arrangement/reschedule.ts`, round 307) replace `scheduleKey` (`ArrangementContext.tsx` l.633) as the single rule, and should there be one `sync(next)` owner instead of three (full rebuild, loop refill, metronome refill, incremental replace)?
3. **Timeline window contract (A round 306 note + gate-306 reviewer).** `StudioWorkspace` passes the window contract as one `timelineWindow` object to the lane and as three callbacks to the rulers. Proposal: a `TimelineWindowProvider` + `useTimelineSpanInWindow(fromPx, toPx)` in `lib/arrangement`, and `getTimelineViewportPx` reading `viewportWidthRef` instead of `scroller.clientWidth` (GATE306-S1). Keep or extract, and when?

Earlier requests (ARCH-CHECKPOINT-STUDIO-LINK, the end-of-STUDIO-PERFORMANCE request D-29z811) are still unanswered; this one can be answered together with D-29z811.
