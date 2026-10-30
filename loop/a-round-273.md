# A round 273: SYS-6 STATUS-LIFETIME, stage 2 of 3

**Status:** implemented. No STOP. Waiting for C.
**Baseline:** HEAD `b288be7` with a clean tree (checked with `git status --short`, which printed nothing before the edits).

## Scope completed
Only the paths and hunks in §4 of `current-task.md` changed.

| File | Change |
|---|---|
| `app/contexts/ArrangementContext.tsx` | **§3.1:** `describeSpaceStart` moved above `writeInsertMarker`. Its body is byte-identical to HEAD l.1404–1427 (checked with `diff`). B's sketch had added `Math.max(0, …)`; A did **not** apply that, because the grant says "body unchanged". `describeSpaceStartRef` is deleted, so the grep finds 0 hits. `writeInsertMarker` calls `describeSpaceStart()`, deps `[describeSpaceStart, insertMarkerStore]`. **§3.2:** `rewriteStoppedTruth`. **§3.3:** `setRange` moved, with Rule R (gesture guard), deps `[rewriteStoppedTruth]`. **§3.4:** the release updater uses `rewriteStoppedTruth(statusAfterGestureRelease(…))`, deps `[rewriteStoppedTruth]`. **§3.5:** Rule P after `setIsPlaying(true)`; deps unchanged, because Biome did not ask |
| `app/lib/arrangement/playback-start.ts` | the `'playing-from'` kind; selection-subject past-end and at-end forms become `'stopped'` (the sketch's loop over two subjects); playhead forms stay `null` |
| `app/lib/arrangement/strings.ts` | `playingFrom`, placed right before `insertMarkerToPlayhead` |
| `__tests__/strings.test.ts` | additions only: the ST12 sample `playingFrom` and one exact expect in ST11 |
| `__tests__/playback-start.test.ts` | **Renamed:** PB1–8 → PBS1–8. **PBS8:** the two selection samples moved from `outside` to `kinds` as `'stopped'`, and `playingFrom` was added as `'playing-from'`; the playhead sample and the other `outside` entries stay. **New PBS9.** No assertion was removed: each moved sample is still asserted, and the one-character-changed loop now also covers them |
| `__tests__/status-lifetime.test.tsx` | **LT8:** the middle step (l.333) changes to `selectionAfterStop('00:02.000')`. **New helper** `stoppedAt(seconds)`, which only combines `playAndAdvance`, `clickRuler` and `stop`. **New rows:** LT12, LT13, LT14 (three parts with `cleanup()` between them, the LT11 pattern), LT15, LT16, LT17, LT18 and LT19. **LT10 is byte-identical:** the diff hunks are only l.19 (import), l.181 (helper), l.333 and the block appended after LT11 |
| `docs/…/203-sys-6-status-lifetime-stage-1.md` | only the 3 `PB` tokens become `PBS`. A grep finds 0 `PB[1-8]` and 3 `PBS[1-8]`. l.4 is untouched |
| `docs/…/204-sys-6-status-lifetime-stage-2.md` | **new.** l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 273 PASS)`. It has the 7 TEMPLATE headings in order and the §2 sentence under `## მიდგომა`, and it records the 3-stage split |

**Untouched:** `app/components/**`, `StudioWorkspace.tsx`, `ArrangementClip.tsx`, the frozen tests, `package.json`, `perf/**`, `e2e/**` and every protected auth or purchase file.

## Deviations (for C and B)
1. **M-NO-R mapping.** §7 expects LT13's first step to turn red under M-NO-R. It stays green: Rule W's late read already sees the range written later in the same `act`, so the text becomes the selection form even without Rule R. M-NO-R is still killed, by **LT8** (the middle step, a range write with no marker write) and **LT14** (its range part). The STOP condition in §10 is not met, because other rows catch it. LT13 pins the §2 late-read semantic for both orders. The code-reviewer reached the same conclusion.
2. **LT14 is one row.** A had first split it into LT14a–c. §5.2 allows a split only above 7.5 s, so A merged it back into one `it` and re-ran the mutants.
3. **LT19(b)** also asserts that `statusSequence` is unchanged. The reviewer suggested this; it makes the row stronger.

## Tests actually run (speed rules)
- **`npm run typecheck`:** rc 0. A re-ran `npx tsc --noEmit` after the last edit: rc 0.
- **`npm run lint`:** rc 0. It reports 205 warnings and 1 info, but none in the owned files.
- **`npx biome check` on the 6 owned code and test paths:** clean. One format fix was applied to `playback-start.test.ts`.
- **`npx vitest run` on the 15 files in §5.3:** 364/364 PASS before the LT14 merge, then a re-run after the merge: 362/362 PASS (rc 0). The files are playback-start, strings, status-lifetime, bars-ruler-ui, insert-marker-ui, ArrangementContext, status-announcement-ui, pending-status, markers-ui, background-time-selection-ui, gesture-reentry, self-disabling-focus, tempo-seed-ui, master-ui and clip-gain. JSON report: `a-round-273-vitest.json`.
  - After the LT19 strengthening and the LT14 merge, A re-ran `status-lifetime` alone: 19/19. `tsc`: rc 0. Biome is clean.
- **Headroom (L11):**
  - The slowest test is master-ui "sits in the footer's last row…" at 1656 ms. Its describe timeout is 15 000 ms, so it uses 11 %. Gate 272's `verify.log` has 1994 ms for the same test.
  - The slowest new row is LT15 at 319 ms. Every row is far below 50 %.
- **Mutants** (re-run after the LT14 merge on a refreshed scratch copy; the source files were `cmp`-identical). They ran in a scratch copy, `/tmp/a273` (the store tree with symlinked `node_modules`). The 3 mutated files were restored, and `cmp` against the working tree is clean. Script and results: `a-round-273/mutants/{mutate.py,run.sh,results.txt,*.json}`.

| Mutant | Red rows |
|---|---|
| M-NO-R | LT8, LT14 (not LT13; see deviation 1) |
| M-R-NO-GUARD | LT17 |
| M-NO-G | LT17 |
| M-NO-P | LT14, LT16 |
| M-P-ALWAYS | LT12, LT15 |
| M-NO-KIND-FROM | PBS8, PBS9, LT14, LT16 |
| M-NO-SEL-PASTEND | PBS8, PBS9, LT18 |
| M-SNAPSHOT | LT12 |
| M-STOP-EXACT | LT10, LT14 |

- **Not run by A:** the full vitest, the build, verify and e2e smoke (gate rows).
- **Browser sanity probe** (A's own check; C verifies independently):
  - **How it ran:** B's `probe-r273.cjs`, copied to `a-round-273/browse/`, against :5173 (A's working tree) at 1440×900 and 1280×720, with 0 page errors and 0 exceptions in all 12 runs. Result: `a-round-273/browse/probe-r273-a-tree.json`, with screenshots in `shots/`; state is in `a-browse.json`.
  - **First attempt:** it timed out after 150 s waiting for `Demo collection ready`, probably a transient dev-server compile. A separate load check reached that text in 5 s, and the re-run completed with rc 0.
  - **Results, both viewports:**
    - `rangeDrag`: 0 status mutations during the drag and 2 in total. After the release, `Stopped — Space plays from the time selection start at 00:02.000.`. Space gives `Playing from 00:02.000.` with the position at about 2.55. Stop gives the selection text.
    - `spaceFromStopped`: `Playing from 00:04.000.`, RMS 0.1332. Stop gives `… insert marker at 00:04.000.`.
    - `spaceCtrlLeft`: after Ctrl+←, `Insert marker at 00:00.000 — playback continues. Stop, then Space plays from here.`. After Stop, `… insert marker at 00:00.000.`.
    - `stripFromStopped`: the same as HEAD.
    - `clobberAdded`: the clip-added text is unchanged through Space and Stop.
    - `selPastEndHome`: after Home, `Stopped — Space plays from the insert marker at 00:00.000.` and the range is null.
  - **Not run by A:** B-SPACE-FROMSTART, LT-WIDTH, SCREEN-BUDGET and G273-AUTH.

## code-reviewer: actually invoked; score 8.5/10; no Critical, High or Medium
- **Addressed:** LT19(b) now also checks the sequence.
- **Low, for B (code reading only, not probed in a browser):**
  - **A-R273-REPEAT-PASTEND.** Group move and nudge key repeats (`ArrangementContext.tsx` around l.2004 and l.2024) call `setRange(null)`. When the line shows a past-end or at-end text and the nudged clip sets the project end, each repeat re-derives a new end time, so the sequence bumps and the change is announced on every repeat. The text is true, so this is better than HEAD, but it contradicts §3.3's "no sequence bump". Recipe for the stage-3 GATE270-S2-REPEAT-ANNOUNCE probe.
  - **A-R273-TOPLAYHEAD-REWRITE.** `insertMarkerToPlayhead` is classified `'stopped'`. While stopped, any later gesture release (a fader, a loop brace) or a non-gesture `setRange` (`selectAllClips`) rewrites it to `insertMarkerAfterStop(t)` with an announcement. The meaning is the same; this is mild noise.
- **Info:** the SYS-6 describe title still says "stage 1 … D-29z594". The contract says to put the new rows inside the existing describe, so A left the title unchanged.
- **Architecture note (a proposal for B or root; nothing to refactor this round).** The status-truth rules are split across two owners:
  - Rules R, G, P and W live in `ArrangementContext.tsx`.
  - Rule S lives in `StudioWorkspace.tsx` l.1933–1944.

  This is the third SYS-6 round in a row on this region. The reviewer's verdict is to keep the split this round. After stage 3, one bounded task could move Rule S next to `rewriteStoppedTruth` in the provider, or put all five rules into one internal status-truth helper with a table-driven test. Its acceptance: LT1–LT19 and the frozen UI suites pass unchanged, and the `useArrangement()` shape does not change.
- **Alternative considered by the reviewer:** a `useLayoutEffect` re-derive. It is rejected because it runs one commit late and needs its own gesture suppression.

## B acceptance criteria A truly passed
- **SOURCE-SCOPE and HUNK-SCOPE (self-check):** pass. `git diff -- app/components` is empty.
- **NO-REF:** pass. The grep finds 0 hits.
- **TEST-CHANGES:** pass. ST12 and ST11 have additions only. PBS8's samples moved and are each still asserted. LT8's middle step was replaced by the stronger exact text. LT10 is byte-identical.
- **TESTS-TARGETED:** pass (362/362 after the merge).
- **MUTANTS:** all 9 turn red, with the mapping difference in deviation 1.
- **DOC-204 and doc 203:** self-checked. Line 4 is exact, the headings are in order, and every cited row id exists.
- **Not claimed (C's rows):**
  - every browser row: B-RANGE-STATUS, B-SPACE-PLAYING, B-SPACE-FROMSTART, B-SEL-PASTEND-HOME, B-STRIP-STOPPED, B-CLOBBER, B-AUDIO, LT-WIDTH, SCREEN-BUDGET and G273-AUTH;
  - CLAIMS, which is a re-run at HEAD;
  - the gate rows.

## Known gaps
- **B-R273-PLAYING-TEXT-WITH-RANGE** stays a known limit, as §3.7 says.
- The two reviewer Lows above have not been probed.

## Exact next C checks
1. Copy `b-round-272/probe-r273.cjs` to `c-round-273/`. Run it against :5173 (A's tree) at 1440×900 and 1280×720, waiting for `Demo collection ready`. Cover these scenarios:
   - `rangeDrag`: 0 status mutations during the drag; after release, the selection text; Space → `Playing from 00:02.000.`; Stop → the selection text.
   - `spaceFromStopped`, `spaceCtrlLeft`, B-SPACE-FROMSTART, `selPastEndHome`, `stripFromStopped` and `clobberAdded`, plus followResumed.
2. B-AUDIO: analyser RMS > 0 while playing.
3. LT-WIDTH, SCREEN-BUDGET and G273-AUTH.
4. Re-run the mutants with `a-round-273/mutants/run.sh`. It needs a scratch copy at `/tmp/a273`, or change its `cd`.
5. Observe the A-R273-REPEAT-PASTEND recipe if time allows. It is an observation only.
