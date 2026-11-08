# Sketch review, B round 407 -> 408 (PERF-11c-iii-e-i)

Reviewed sha256: 029e5f8a12e55c8fe1f1de5e8db900d4a5f8ba250577ef6ccc67ef93f6cfbf8b
Dispatched sha256: 029e5f8a12e55c8fe1f1de5e8db900d4a5f8ba250577ef6ccc67ef93f6cfbf8b (b-round-407/sketch-dispatched.sha256). Reviewed = dispatched; no edit after the review.
Reviewer: `tech-lead` (read-only project agent), one pass on the frozen patch. Verdict: **APPROVE WITH LOWS**. No Critical, High or Medium.

## Findings (relayed by B) and rulings (D-29z1415)
| id | sev | finding | B ruling |
|---|---|---|---|
| TL-R408-SK-L1 | Low | AC7 key regex `'([A-Za-z]+)'` would skip a future key with a digit/underscore (fails loudly, wrong-cause message); suggest `'(\w+)'` | deferred_low_polish (fails loudly today; same keys) |
| TL-R408-SK-L2 | Low | AC8 last line `music()?.pan ?? 0` passes if the lookup finds nothing | deferred_low_polish: the same test asserts `music()?.solo` true, `volume` 0.5 and `pan` 0.5 on the same lookup first, so the track exists in that run; hardening = assert `music()` defined |
| TL-R408-SK-L3 | Low | AC8 is identity-only for setTimeRange / setActiveTrack / setInsertMarker | accepted by design (AC1-type row); the browser LANE-ACTIONS row covers active track; recorded |
| TL-R408-SK-I1 | Info | rename clean; other `livePosition` words are unrelated locals (video-sync.ts:126 param, status-lifetime helper) | matches claim K11 |
| TL-R408-SK-I2 | Info | AC1 holds for importVideoFiles / dropLibrarySource / beginTrackPanGesture (stores, empty deps, existing keys, collection.sources like addSourceToActiveTrack) | matches deps-trace.txt (K23) |
| TL-R408-SK-I3 | Info | AC7 source parsing acceptable, no type assertion; tsc already pins memo keys = Pick, AC7's unique value is the per-key toBe (catches mismap) | — |
| TL-R408-SK-I4 | Info | `declared.length > 0` guard is redundant with the following toEqual | recorded, equivalent mutant 6 |
| TL-R408-SK-I5 | Info | const-tuple ruling confirmed: needs `as const` or a helper and adds a third list | TL-R403-SK-L1 stays deferred |
| TL-R408-SK-I6 | Info | no test mocks/spies the context; the actions provider wraps the context provider, so every Lane test gets both | matches K12 |

## Equivalent mutants (recorded, not rows)
1. reordering memo object or deps entries (AC7 sorts both sides); 2. adding a stable dep; 3. removing a stable dep (Biome lint, no test); 4. the Lane reading any callback from `useArrangement()` instead of `useArrangementActions()` (same reference; detectable only in e-ii); 5. reverting the rename or aliasing `getLivePosition: livePosition`; 6. removing the `declared.length` guard; 7. removing `?? 0`; 8. `[A-Za-z]+` -> `\w+`; 9. the thrown error text.
