# Sketch review: round 387 (GATE-B385-M2 + A-R386-REVIEW-M1 + B-R386-UNGUARDED-GRAPH-CALLERS)

- **Dispatched sketch:** `b-round-386/sketch-387.patch.txt`, sha256 `a9f226140429402abe79804ac05efffced46d61ea45ecc8f04bb09f667986486` (4 files, +734/−71), against HEAD `5312260`.
- **First review:** `tech-lead`, on sha256 `6e30325e4ed150ece75d76e229dd52c3540f05c2874bd829b418f97c92e34b0d` (v1, kept as `sketch-387-v1.patch.txt`). The reviewer is `tech-lead` because `code-reviewer` is not on B's consult list (L58).
- **Delta review:** `tech-lead`, on sha256 `a9f22614…6486`. Verdict: "Delta correct, no new Medium+".
- **Reviewed = dispatched:** yes. There were no edits after the delta review; K13 pins the sha.

## Findings and rulings
| Id | Sev | Finding | Ruling |
|---|---|---|---|
| TL-R387-M1 | Medium | `syncPlayback` passed no `stopAt`. After a time-removing edit, a failed reschedule stopped at the old-timeline `livePosition()`, off by `b − a` | **Fixed in v2:** `stopAt = positionAt(anchor, startAt)`, which is the remapped and loop-folded position. Row SF8; mutant MU-387-SYNC-NO-STOPAT |
| TL-R387-L1 | Low | The `resyncAfterDecode` catch wrote the status synchronously, bypassing the microtask rule | **Fixed in v2:** the catch calls `stopForScheduleFailure()` |
| TL-R387-L2 | Low | `startClicks` did not detach a click whose `start()` throws | **Fixed in v2.** AR2 asserts every node is disconnected once; mutant MU-387-CLICK-NO-DETACH |
| TL-R387-L3 | Low | The catches discard the error (no diagnostic) | **Deferred** (`deferred_low_polish`), the same class as TL-R385-L8: the Studio has no client diagnostic channel |
| TL-R387-L4 | Low | The deferred write could overwrite a successful restart in the same task | **Fixed in v2:** the write happens only if not playing. Row SF10; mutant MU-387-MICROTASK-NO-PLAYING-GUARD |
| TL-R387-L5 | Low | `seekTo` passed no `stopAt`; the end state was correct but a stale position was published first | **Fixed in v2** (`stopAt` = the target). No row: the end state is identical; recorded |
| TL-R387-L6 | Low | No row for a throw in the initial loop fill inside the build; SF6's fixed wait | **Fixed in v2:** row SF9 was added and SF6 now polls |
| TL-R387-L7 | Low | The stop point is the position at `startAt`, up to `PLAYBACK_LOOKAHEAD` (50 ms) ahead of now | **Accepted, deferred Low:** inaudible, and no row depends on it |
| TL-R387-L8 | info | A user Stop in the same task after a failed reschedule still shows the failure text | Correct behaviour; recorded, no row |

**Architecture note** (both reviews): keep both layers and extract nothing further.
- `applySchedule` itself guarantees all-or-nothing, so the export paths get it for free (TL-R385-ARCH).
- Stopping playback and showing the status is provider policy, and it lives in exactly one wrapper (the round-386 request).
- This is recorded as the D-29z1303 ruling.

## Throw-site × caller matrix (L58)
**Throw sites (columns):**
- **S1:** a clip source `start()` during the initial build;
- **S2:** a click `start()` during the initial build;
- **S3:** a node creation or `connect` during the initial build;
- **S4:** `appendPlan` or `appendClicks` after the handle swap (the loop or metronome fill inside `startGraph`);
- **S5:** `appendPlan` or `appendClicks` from the pump.

**Callers (rows):** each cell names the row that proves "stopped, nothing left sounding, status, no page error", or a ruled exclusion.

**Exclusions:**
- **ex-a:** the same mechanism and wrapper are proved by the named row on another caller, and the throw site is unit-proved by AR1–AR5.
- **ex-b:** not reachable from this caller (the pump never builds).

| caller \ site | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| Play (`startPlaybackAt`) | SF1, SF2, SF10 | ex-a (AR2) | ex-a (AR1) | SF9 | ex-b |
| Edit (`syncPlayback` via commit) | SF3, SF8 | ex-a (AR2) | ex-a (AR1) | ex-a (SF9) | ex-b |
| Loop resync (`syncPlayback` via pump) | ex-a (SF3) | ex-a (AR2) | ex-a (AR1) | ex-a (SF9) | ex-b |
| Decode resync (`resyncAfterDecode` → `syncPlayback`) | EV11, EV15, PW20 (round 386, still pass) | ex-a | ex-a | ex-a | ex-b |
| `seekTo` | SF4 | ex-a | ex-a | ex-a | ex-b |
| `scrubPlayhead` | SF5 | ex-a | ex-a | ex-a | ex-b |
| `endPlayheadScrub` | SF7 | ex-a | ex-a | ex-a | ex-b |
| Pump (`pumpPlaybackAudio`) | ex-b | ex-b | ex-b | ex-b | SF6 |

8 × 5 = 40 cells; each holds a row id or a ruled exclusion.

## B's evidence on v2
- **Full suite** on the sketch: 257 files, 3,787 tests pass (`precheck-full.log`). v1's run is `precheck-full-v1.log`.
- **Mutants:** 15/15 red on their rows (`mutants/mutant-*.log`; K18). The v1 logs are kept in `mutants-v1/`.

| Mutant | Red rows |
|---|---|
| MU-387-NO-ROLLBACK-STOP | AR1 AR2 AR3 SF1 SF2 SF3 SF10 |
| MU-387-NO-RELEASE | AR1 AR2 AR3 |
| MU-387-REPLACE-ERROR | AR1 AR2 AR3 |
| MU-387-NO-ITEM-DETACH | AR1 AR3 AR5 |
| MU-387-CLICK-NO-DETACH | AR2 |
| MU-387-PLAY-NO-GUARD | SF1 SF2 SF9 SF10 |
| MU-387-PLAY-NO-STOPAT | SF1 |
| MU-387-SYNC-DIRECT | SF3 SF8 |
| MU-387-SYNC-NO-STOPAT | SF8 |
| MU-387-SEEK-DIRECT | SF4 |
| MU-387-SCRUB-DIRECT | SF5 |
| MU-387-ENDSCRUB-DIRECT | SF7 |
| MU-387-PUMP-NO-CATCH | SF6 |
| MU-387-STATUS-SYNC | SF3 SF8 |
| MU-387-MICROTASK-NO-PLAYING-GUARD | SF10 |

- **Browser:** dev server on :5175 from the scratch copy, with its own Vite `cacheDir`; both viewports.
  - `probe/flow-sketch-*.json`: 0 errors, 0 leaked sources, `scheduleFailed`, the edit kept;
  - `probe/m1-sketch-*.json`: the round-386 neighbour passes;
  - HEAD controls: `probe/m2-head-*.json` and `probe/flow-head-*.json`.
- **Export:** HEAD and the sketch WAV are byte-identical (`probe/export-sha256.txt`).
