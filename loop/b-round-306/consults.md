# B round 306 -> 307: consults and premise measurement for PERF-COMMIT-RESCHEDULE

Date 2026-11-03. Baseline `ecb832a` (gate 306 published). Both consults were read-only; their text is data, summarised here.

## B measurement (L37), production build of `ecb832a` (scratch `/tmp/b306/head`, remix-serve :5191)
Script `probe/release-probe.cjs` (v2). 30 clips (Add + 29 x Ctrl+D), playing from Home, 3 passes of: fade-in drag on clip 1, Ctrl+Z, trim-left drag on clip 1, Ctrl+Z.
- `probe/head-1440.json`, `probe/head-1280.json`: every release (drag or undo) = **30** `start()` calls, the whole start burst spans **0.4-0.8 ms**, first start 1.2-2.2 ms after pointerup, **LoAF 0** in [up, up+800 ms], largest pointerup/keydown Event Timing **32 ms** (16-32, same class as non-edit keys), playback still running, position advances.
- Conclusion (fact): the main-thread cost of restarting 30 clips is immaterial on this runner. Inference: at 6x CPU the burst stays under ~5 ms. Remaining value of the stage: source churn (30 old + 30 new sources around each edit, scaling with clip count) and the audio splice itself, which is **not measured** yet.
- `probe/head-1440-v1-with-invalid-move.json`: v1 also tried a header move on the last clip. That drag never committed (0 starts) and the following Ctrl+Z undid a Ctrl+D instead (29 starts). Invalid, kept as evidence; v2 removed the move part.
- `probe/continuity-probe.cjs` + `probe/continuity-head-1440.json`: ScriptProcessor tap on the destination, fade drag on clip 2 while clip 1 sounds. **Invalid attempt**: 0 restarts were captured in every edit window (the clip-2 drag did not commit), so it says nothing about continuity. Not used as evidence.

## performance-optimizer (2026-11-03)
- Correction to B's brief: clip previews (`previewArrangement`, l.1803) never call `syncPlayback`; the per-move `syncPlayback(next)` (l.1966) is the loop-handle preview only, which always changes the loop key. So the incremental path is a commit-only question (`applyEdit` -> `syncPlayback(committed.present, removed)`).
- Expected main-thread cost well under 2 ms (confirmed by B's probe). The real gain is audio-side source churn and scaling.
- Diff as a pure function; mid-clip offsets come from `planSchedule`; handle API `replaceClips(ids, items, shapes, from, startAt)` that stops only matching states at `startAt`, updates the fade/envelope maps (captured at creation today) and prunes ended states like `appendPlan`.
- Full rebuild stays for: `removed`, `force`, scrubbing, active loop, track-id set change, clip on an unknown track; stage b must refresh `scheduledEndRef` and metronome horizon end (simplest: metronome on and `projectEnd` changed -> full rebuild).
- Fade/envelope-only change: replace the source (1 start), not re-automate (no gain node if no shape existed; `cancelScheduledValues` mid-ramp jumps).
- Split a/b is honest if stage a does not claim the metric. Deterministic gate = fake-context unit rows (unchanged sources never stopped; replaced source stop time = new start time; new offset = old offset + elapsed within one sample). Meter-tap RMS is too coarse for a splice check.
- Proposed record rows (release-event-ms, release-loaf-blocking-ms, release-active-sources-peak) -> stage b.

## tech-lead (2026-11-03)
- Split right, with changes: diff in its own file `app/lib/arrangement/reschedule.ts` (`diffClipSchedule(prev, next) -> { changedIds } | null`, null = full rebuild); `replaceClips(...)` in `graph.client.ts`; fade/envelope maps must become mutable like `clipGainTargets`; tests `__tests__/reschedule.test.ts` + rows in `graph.test.ts`. Stage b: `syncPlayback` + `scheduledArrangementRef` + budgets.
- Keep full rebuild: force/removed, scrubbing, loop JSON changed or a loop active, clip-id set changed (add/delete/split), changed clip on a track the graph was not built with, metronome on and `projectEnd` changed. Always refresh `scheduledEndRef`/`scheduledKeyRef`.
- Tests that pin starts and must stay green: delete-selection-ui (removed), FP8/CP8 (loop), clip-gain/track-pan/CF12 (gain path), TG11, UM6, UC11, MU10, MV13, graph.test node counts, FD7*, appendPlan rows in envelope tests, clip-gain l.457-488.
- 30-clip rows should be `<= 1`, not `== 1` (editing a clip before the playhead correctly starts 0).
- Mutants: diff ignores fade/envelope; replaceClips ignores shapes; stop at currentTime instead of startAt; only sounding sources stopped; unknown-track change not falling back; no pruning.
- Checkpoint: yes, bounded, non-blocking for stage a; questions in `../b-round-306-checkpoint-request.md`.

## B ruling on order (D-29z813)
The measured main-thread cost does not justify the stage on CPU grounds. Both consults still recommend the split and name the audio-side churn as the value; the backlog note already required measuring before claiming. B keeps the stage in its queue position, dispatches stage a (pure diff + handle API, no runtime change), and makes stage b carry the audio-continuity and churn rows before its asserts. If stage b's own measurement shows no churn or continuity benefit, B closes the stage with that evidence instead of wiring it.
