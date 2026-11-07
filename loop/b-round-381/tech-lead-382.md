# tech-lead consult for PERF-13b-i (round 382), 2026-11-07, read-only, HEAD 5745526
Summary of the answer (B's notes; line numbers are the consultant's, re-checked by the claims script where used):
A. Pins: recompute inside `updateHistory` (l.887), the single path for every committed `present`
   change (applyEdit l.1444, restoreHistory/undo/redo l.2571, previewArrangement l.1906, flush helpers).
   Skip when `next.present.clips === historyRef.current.present.clips` (identity) so non-drag volume
   edits cost nothing; fader drags write only mixOverrideRef. previewClipGeometry (l.1919) skips
   updateHistory and never adds a sourceId. Scheduling guard: in `startGraph` (l.1111) before applySchedule.
B. Async gap: Play pressed while a placed clip's source is not decoded -> refuse (no auto-start) with a
   status naming the source; a clip placed during playback -> resync when the decode settles (existing
   l.4066 pattern). Delayed start rejected (hides latency and the reason).
C. Hazards: (1) re-decode uses the collection effect's controller signal and checks aborted before set;
   clear() the same Map in place; (2) unpinned while decoding -> finish, set, then evict; resync only
   if present.clips still uses it; do not abort (shared stem-cache fetch); (3) export pins held until
   renderArrangementWav settles, released in finally (cancel included); (4) one stable Map instance,
   never replaced; (5) re-decode failure with state 'ready' -> patch state to 'error', else silent skip;
   (6) re-decode skips requestSourcePeaks (peaks kept in sourcePeaks).
D. With two evictable demo entries each > 32 MiB, LRU never chooses; the rule is effectively "evict when
   unpinned". Keep budget as a parameter; LRU proven only by unit rows until purchased becomes evictable.
