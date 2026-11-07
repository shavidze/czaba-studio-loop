**STOP — B must rule on A-R387-REVIEW-M1** (a Medium from code-reviewer that `sketch-review.md` does not rule on; task §3, L11). The tree stays at the reviewed sketch plus doc 250. A changed no line beyond the patch.

- **Finding:** `tick` (`app/contexts/ArrangementContext.tsx` l.1358–1379) calls `pumpPlaybackAudio()` and then, with no `isPlayingRef` check, `sampleMasterMeter()`, `sampleTrackMeters()` and `requestAnimationFrame(tick)`.
- **Mechanism:** when the new pump `catch` → `stopForScheduleFailure()` fires inside a rAF frame, `stopPlayback` drops the meters to the floor and cancels the frame. `tick` then samples the analysers again and publishes non-zero levels. The meter sticks, because nothing samples after that. `tick` also schedules one more frame, which exits on its `!isPlayingRef` guard.
- **A's verification:** A read the code. The sequence holds as described. The position is **not** affected: `livePosition()` returns `positionRef` once playback has stopped, so `updatePosition` writes the stop point.
- **Why no test sees it:** SF6 stubs rAF, so the pump runs from `setInterval`. `FakeAudioContext` has no `createAnalyser`, so the meter tap is null.
- **Reviewer's fix (not applied):** after `pumpPlaybackAudio();`, add `if (!isPlayingRef.current) { frameRef.current = null; return; }`, plus a row that checks the meter is back at its floor after a pump failure.
- **Severity:** in the browser this is visible only when the audio could not be scheduled: the meter shows a frozen level next to the "Playback stopped" status. No sound plays and no data is lost.
- **Requested from B:** either grant this one-line `tick` guard and a row (with a mutant) as a re-dispatch, or rule the finding Low/accepted so the round can go to C as it is.

# A round 387 — schedule-failure rollback (GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS)

Status: the sketch has been applied and every A check passed, but the round is in **STOP** on the unruled reviewer Medium above.

## 1. Pre-flight (from `store/`, HEAD `5312260`)
- `git status` empty at start.
- `sha256sum -c --quiet b-round-386/r387-frozen-sha256.txt` rc 0; `b-round-318/protected-sha256.txt` rc 0.
- Patch sha256 `a9f226140429402abe79804ac05efffced46d61ea45ecc8f04bb09f667986486` (matches K13); `git apply --check` rc 0; `git apply` rc 0.
- What A read:
  - Lessons L11, L12, L23, L26, L28, L31, L49, L51 and L58: the opening lines of each, through targeted greps.
  - Primitives AUDIO_ARCHITECTURE, REACT_CONTEXT, ERROR_TAXONOMY, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and AGENT_DISCOVERABLE_CODE: about the first 40 lines of each. A read them after applying the patch, because the code was applied verbatim from B's reviewed sketch, not written by A.
  - GEORGIAN_DOCS: after the edit hook's reminder on the doc write, and before verification. A checked the doc against it.
  - TEMPLATE.md, and doc 249 as a style reference.

## 2. Changed files (exactly the 5 granted paths)
- `app/lib/arrangement/graph.client.ts` (M): sketch verbatim.
- `app/contexts/ArrangementContext.tsx` (M): sketch verbatim.
- `app/lib/arrangement/__tests__/apply-schedule-rollback.test.ts` (new): sketch verbatim.
- `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx` (new): sketch verbatim.
- `docs/implementation/2026/quarter-IV/250-schedule-failure-rollback.md` (new): written by A. l.4 = `**სტატუსი:** Completed (C round 387 PASS)`; TEMPLATE headings in order; it names AR1–AR5, SF1–SF10 and all 15 MU-387 ids, each of which exists in the tests or the mutant script. `grep -rn 'C round [0-9]* pending' docs/implementation` = 0.
- PATCH-EQUAL: `cmp` of the 4 code and test files against `b-round-386/sketch-files/`: all identical.
- Final `git status --short --untracked-files=all`: the 5 lines above, nothing else.

## 3. Checks actually run (logs in `a-round-387/`)
- `npm run typecheck` rc 0 (`typecheck.log`).
- `npm run lint` rc 0, 205 warnings and 1 info, the same as gate 386 (`lint.log`).
- Scoped `/check`: `npx biome check` on the 4 code and test files, rc 0, no fixes (`biome-scoped.log`).
- Covering tests: `npx vitest run $(cat b-round-386/covering-387.txt)` gave **Test Files 65 passed (65), Tests 1022 passed (1022)**, rc 0 (`vitest.log`). AR1–AR5 and SF1–SF10 are present by name; `schedule-failure-ui` ran 10 tests in 605 ms and `apply-schedule-rollback` 5 tests in 7 ms.
  - Timeout headroom (L31). The slowest single tests:

    | Test | Time | Declared timeout | Share |
    |---|---|---|---|
    | CP12b, CP12c, CP12a, CP12d | 3.40–3.99 s | 30 s | ≤ 14 % |
    | TC10 | 2.36 s | 15 s | 16 % |
    | UM9 | 2.07 s | 20 s | 10 % |
    | render-budget Play → Stop | 1.92 s | 15 s | 13 % |

    UM3, UM1 and DXM3 ran under 2 s each. Nothing is near 50 %.
- Mutants: `run-mutants-387.sh` on a `cp -a` copy at `a-round-387/store-copy`, never on `store/`. The copy was removed afterwards because it included `node_modules`. **15/15 red**, each one exactly on its rows in the sketch-review table. `restored` is printed in all 15 logs, and the copy's files matched store after the restore (`mutants/`):

  | Mutant | Red rows |
  |---|---|
  | NO-ROLLBACK-STOP | AR1 AR2 AR3 SF1 SF2 SF3 SF10 |
  | NO-RELEASE | AR1–AR3 |
  | REPLACE-ERROR | AR1–AR3 |
  | NO-ITEM-DETACH | AR1 AR3 AR5 |
  | CLICK-NO-DETACH | AR2 |
  | PLAY-NO-GUARD | SF1 SF2 SF9 SF10 |
  | PLAY-NO-STOPAT | SF1 |
  | SYNC-DIRECT | SF3 SF8 |
  | SYNC-NO-STOPAT | SF8 |
  | SEEK-DIRECT | SF4 |
  | SCRUB-DIRECT | SF5 |
  | ENDSCRUB-DIRECT | SF7 |
  | PUMP-NO-CATCH | SF6 |
  | STATUS-SYNC | SF3 SF8 |
  | MICROTASK-NO-PLAYING-GUARD | SF10 |
- Claims: `bash b-round-386/claims-387.sh` on A's tree (`a-round-387/claims-387-a.txt`), compared with `claims-387-sketch-output.txt`. The only deltas:
  - K15 and K16: rc 0 here (allowed).
  - K2 matches the sketch (5 = 4 code files + doc 250), and so do K12 and K14, so the K10 delta comes only from A writing doc 250. It is not a stray file.
  - **K10 "doc 250 files: 1"** (sketch: 0). This is expected, because A created doc 250, but it is not in C's list of allowed deltas. C and B, please treat it as expected.
- Not run by A (speed rules): the full suite, `npm run verify`, the build and the browser rows. Those belong to the gate and C.

## 4. B acceptance (A's part)
- [x] Pre-flight manifests rc 0; patch applied verbatim (reviewed = dispatched).
- [x] typecheck, lint (warnings not risen) and scoped Biome.
- [x] 65 covering files pass, with timeout headroom.
- [x] 15/15 mutants red on their named rows, restored.
- [x] Doc 250 per L26/L28.
- [x] code-reviewer run. **Not passed:** it raised one unruled Medium, so the round is in STOP (see the top).
- The C rows (BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, EXPORT-EQUAL, G387-AUTH, STUDIO-SMOKE, DOCS) are not claimed by A.

## 5. code-reviewer
`code-reviewer` subagent, run on the applied tree. Score 8/10. No Critical or High findings.

**Confirmed correct:**
- the rollback stops each started source once and disconnects each node once;
- the meter taps are untouched and the same error is rethrown;
- every `startGraph(` call goes through `startGraphOrStop`;
- the dependency arrays are complete;
- the happy-path order is unchanged;
- there is no `any` and no type assertion.

**Findings:**

| ID | Severity | Finding | Status |
|---|---|---|---|
| A-R387-REVIEW-M1 | Medium | `tick` keeps sampling and re-scheduling after the pump stops playback | **Unruled → STOP** (see the top) |
| A-R387-REVIEW-L-a | Low | AR1 is cited for S3 (a throw from `createGain`, `createStereoPanner` or `connect`), but no AR row throws there. Proposed: an AR6 | For B |
| A-R387-REVIEW-L-b | Low | In the rollback, `releaseNodes()` is unguarded, so a throwing `disconnect()` could replace the error. A real no-argument `disconnect` does not throw | Note |
| A-R387-REVIEW-L-c | Low | The `resyncAfterDecode` catch can no longer fire, and no row exercises it | Already recorded in task §5 as expected |
| A-R387-REVIEW-L-d | Low | SF7 does not assert `getLocatorPosition()`. A failed scrub end leaves the marker where it was, the same as a normal scrub end while playing | For B |
| A-R387-REVIEW-L-e | Low | SF2 hardcodes `'Playing from 00:00.000'` instead of `studioPlaybackStrings.playingFrom(...)` | For B |
| A-R387-REVIEW-L-f | Low | SF3 checks the clip count, not that the edit is in history (undo availability) | For B |

None of these was fixed, because the dispatched code must equal the reviewed sketch (L58). They are proposals for B.

**Architecture note (verbatim):**
> Signal 3 (repeated costly changes to one region): the scheduling region in `ArrangementContext.tsx` (around 1136-1456) has changed again this round. The keep decision (D-29z1303) still holds: `applySchedule` owns the all-or-nothing rollback, and the provider owns stop-and-status policy in one wrapper, without touching audio timing, refs or the `useArrangement()` hook. M1 is a lifecycle gap in `tick` to fix in this round, not a reason to extract anything.

For B and root: this is a proposal, not an instruction for this round.

## 6. Known gaps
- TL-R387-L3 (no diagnostic in the catch) is deferred per D-29z1305.
- A ran no browser check; all browser evidence is C's.

## 7. Next C checks
Section 4 of `current-task.md` as written:
- SOURCE-SCOPE, CLAIMS (expect the K10 delta above), PATCH-EQUAL, UNIT, MUTANTS;
- BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, G387-AUTH and STUDIO-SMOKE, each at both viewports;
- EXPORT-EQUAL and DOCS.
