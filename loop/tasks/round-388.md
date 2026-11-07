# Round 388: the meters return to the floor after a schedule failure in the loop pump (C-R387-01), closing round 387

**Planned by:** B, at the round 387 → 388 planning, 2026-11-07 (`b-round-387.md`).

**Baseline:** HEAD `5312260`. Gate 387 is `skipped` (C FAIL), so nothing was published. The baseline is HEAD **plus the uncommitted round-387 tree**: 5 status lines (`graph.client.ts`, `ArrangementContext.tsx`, `apply-schedule-rollback.test.ts`, `schedule-failure-ui.test.tsx`, doc 250) [K2]. **Do not re-apply the round-387 sketch, and do not revert anything.** If root lands a pre-round commit, K1 changes; that is allowed (INFO-C268).

**Decisions** (`backlog.json` v354 → v355, `decisions_log_b`):
- **D-29z1306: round 387 is not accepted** (`c-round-387.json`: FAIL, `browserVerified` true).
  - Rows that passed: SOURCE-SCOPE, PATCH-EQUAL, CLAIMS, BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, EXPORT-EQUAL, G387-AUTH and STUDIO-SMOKE.
  - Rows that C did not complete: UNIT (C ran 2 of 65 files) and MUTANTS (C did not run them).
  - GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS, TL-R387-M1 and A-R386-REVIEW-L1 stay `dispatched`. **They close on C round 388 PASS.**
- **D-29z1307: C-R387-01 = A-R387-REVIEW-M1 stays Medium.** C offered a downgrade; B rules no. A level frozen at about −20 dB next to a "Playback stopped" status is a silently wrong display. That is the class D-29z1295 rated Medium, and the fix is one guard.
- **D-29z1308: this rules on A's round-387 STOP (L10).** The round grants the one-line `tick` guard that the reviewer proposed, plus row SF11 and mutant MU-388-TICK-NO-GUARD.
  - The loop ran C although A reported STOP. Recorded for root as ROOT-NOTE-R387-STOP-NOT-HONOURED; it is not an A or C fault.
- **D-29z1309: the round-387 code-reviewer Lows.**
  - **Deferred** to `deferred_low_polish`, with their evidence:
    - L-a: AR6, a throw from `createGain`/`connect`;
    - L-b: an unguarded `releaseNodes()` in the rollback;
    - L-d: SF7 does not assert the locator;
    - L-e: SF2 hardcodes "Playing from 00:00.000";
    - L-f: SF3 checks the clip count but not undo availability.
  - L-c (the `resyncAfterDecode` catch can no longer fire) was already accepted in round 387 §5 and is closed as `accepted`.
  - **Why not fixed now:** this round re-dispatches a reviewed sketch byte for byte (L58). L-e and L-f would change SF rows that C must keep identical to round 387.

**Why this round.** C-R387-01 is the only Medium that a real browser reproduces, and it blocks closing three Medium bugs.
- The regression round is due on **2026-11-08** (`regression-last.json`). Today is 2026-11-07, so the bug goes first (D-29z1298).
- **The next planning opens REGRESSION-2026-11-08 unconditionally**, whatever round 388's result is, unless C reports a new Critical or High.

**What the user notices:**
- **Normally:** nothing changes.
- **When the browser refuses to schedule audio during a looped playback:** the meters fall to silence (−∞), as they do after a normal Stop. Before this round they froze at the last level (about −19.8 dB) next to the "Playback stopped" text.

**Read first:**
- **`lessons.md`:**
  - A reads 10, 11, 26, 28, 31, 49, 52 and 58.
  - C also reads 22, 38, 56, 57, 59 and 60.
- **Primitives:** `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
- **`b-round-387/checkpoint.md`:** what B ran on the sketch.

**Not applicable:**
- **Reference-first, `product-designer`, YouTube:** a bug round with no new feature. The reference behaviour is our own normal Stop, which floors the meters.
- **Screen budget (L39):** nothing new is drawn.

## 1. Behaviour that must not change
- **Every round-387 contract:**
  - AR1–AR5 and SF1–SF10 pass unchanged; the SF1–SF10 code is byte-identical (only a new `describe` is appended, and two imports are added);
  - `graph.client.ts` and `apply-schedule-rollback.test.ts` stay byte-identical to the round-387 sketch [K12].
- **Normal playback.** On the happy path the guard is never true at that point (`pumpPlaybackAudio` returns with `isPlayingRef` true), so `tick` runs exactly as before.
  - Meters keep moving while playing. The tick's own end-of-arrangement stop is unchanged.
  - Export is unaffected: `tick` is realtime-only.
- **L49, the replaced path's side effects.** On a pump failure, `stopForScheduleFailure` → `stopPlayback` has already done the following:
  - cancelled the frame;
  - cleared the pump interval;
  - written the stop position;
  - floored and published both meter stores.

  The guard only prevents `tick` from re-sampling the analysers and re-queuing a frame afterwards. `updatePosition` is not called again after the guard. Its value would have been the same, because `livePosition()` returns `positionRef` once playback has stopped.
- **L51, status:** no new status write. `scheduleFailed` is still written by the round-387 microtask.
- **Purchase protection:** unchanged. No protected file is touched [K9].

## 2. What A changes (grants: `b-round-387/grants-388.txt`, 3 paths)
**Apply the reviewed sketch verbatim:** from `store/`, run `git apply ../tmp/studio-real-loop/b-round-387/sketch-388.patch.txt` (sha256 `494afafc…4c71` [K5]; `--check` rc 0 on the round-387 tree). Reviewed = dispatched (L58): A changes no line of the two code and test files beyond the patch. If a check fails, A writes **STOP** (L11) and improvises nothing.
1. **`app/contexts/ArrangementContext.tsx`**, in `tick`, right after `pumpPlaybackAudio();`:
   ```ts
   if (!isPlayingRef.current) {
     frameRef.current = null;
     return;
   }
   ```
   This is the code-reviewer's fix (A-R387-REVIEW-M1). Nothing else in the file changes.
2. **`app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx`:**
   - It imports `ArrangementMaster` and `ArrangementTrackMeter`.
   - It appends one `describe` with a metered fake: `MeteredFailureAudioContext` extends the file's `FakeAudioContext` with `createChannelSplitter`/`createAnalyser`; its analysers return `meterSignal`, the same pattern as `master-hold-tick.test.tsx`.
   - rAF callbacks are captured, not dropped, so the test drives the real `tick`. `setInterval` is stubbed so the pump runs **only** from `tick`, which is the path of the bug.
   - **SF11:** render the provider with the master meter and the Music and SFX track meters, loop 0–0.5 s, Play, signal −20 dBFS, run frames. The meters must read other than `-inf`. Then arm a `start()` throw and run frames until the pump's loop fill throws. Assertions:
     - thrown 1;
     - no window error;
     - stopped;
     - status `scheduleFailed`;
     - nothing left sounding;
     - master `data-level-db` and `data-hold-db` `-inf`;
     - both track meters' `data-level-db` `-inf`;
     - **no frame left queued**.
3. **Doc `docs/implementation/2026/quarter-IV/250-schedule-failure-rollback.md`**, edited by A in Georgian (L26, L28):
   - l.4 byte for byte: `**სტატუსი:** Completed (C round 388 PASS)`;
   - Problem → Solution for **C-R387-01**: `tick` re-sampled the meters after the pump stopped playback → a guard after `pumpPlaybackAudio()`;
   - the testing section names **SF11** and **MU-388-TICK-NO-GUARD**;
   - the TEMPLATE headings stay in order.

   Doc 249 is not edited.

**What B verified on the sketch** (`b-round-387/`):
- `tsc --noEmit` rc 0; Biome on the 2 files: clean.
- `schedule-failure-ui`: 11/11, 3 runs; SF11 takes about 0.64 s (5 s default timeout, 13 %).
- Covering set: **66 files, 1,026 tests** green. That is the 65 round-387 files, 1,023 tests (`precheck-covering-388.log`), plus `master-hold-tick.test.tsx`, 3 tests (`precheck-master-hold-tick-388.log`). That file was added because it drives `tick` with an analyser fake.
- `MU-388-TICK-NO-GUARD` red on SF11: master `-20.0` vs `-inf` (`mutants/b-run2/`).
- The 15 round-387 mutants, rerun on the sketch (`mutants/b-run-387set/`): every red-row set is the same as round 387, except that **MU-387-PUMP-NO-CATCH** is now red on **SF6 and SF11**.
- Browser, on a scratch dev server from the sketch (`probe/`):
  - `meter-sketch-1440/1280.json`: all meters `-inf` after the failure, clock frozen, `errors` [];
  - `meter-head-1440/1280.json` on the round-387 tree: frozen at `-19.8`;
  - `flow-sketch388-1440.json`: identical to the round-387 contract.

## 3. A: checks (speed rules)
- **Pre-flight:**
  - `git status --short --untracked-files=all` = the 5 round-387 lines;
  - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-387/r388-frozen-sha256.txt` (1,281 entries, covering the tracked and round-387 untracked files minus the 3 grants);
  - `../tmp/studio-real-loop/b-round-318/protected-sha256.txt`;
  - both rc 0, from `store/`.
- **Static checks:** `npm run typecheck`; `npm run lint` (205 warnings at gate 386 and in round 387; the count must not rise).
- **Tests:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-387/covering-388.txt)`: 66 files, the 65 round-387 files plus `master-hold-tick.test.tsx` (it drives `tick` with an analyser fake). Paste the totals; expect 66 / 1,026. L31 headroom: SF11 is about 0.64 s against 5 s; the other covering tests are as in round 387.
- **Mutants**, on a `cp -a` copy only, never on `store/`:
  - `TREE=<abs copy> OUT=<abs a-round-388/mutants> bash ../tmp/studio-real-loop/b-round-387/mutants/run-mutant-388.sh`: SF11 red, `restored` printed;
  - `run-mutants-387.sh` (`b-round-386/mutants/`): all 15 red on the rows in the table in `a-round-387.md` §3, with the one delta in §2 (PUMP-NO-CATCH: SF6 and SF11). Delete the copy afterwards (L60: under `a-round-388/`).
- **No full suite, no perf run and no browser run** are required of A.
- **`code-reviewer`:** required (it is the same 3-file set as round 387). Paste the Architecture note verbatim.
  - Rulings for this round: a Medium+ that this task does not rule is a **STOP**. The round-387 Lows are already ruled (D-29z1309).
- **STOP (L11):** A writes STOP if any of these happens:
  - a manifest is not rc 0 at the start;
  - `git apply` fails;
  - a covering test fails or exceeds 50 % of its timeout;
  - a mutant is not red on its rows.

## 4. C: what to verify
C writes `c-round-388.md` and `c-round-388.json` as it goes, with **all L57 fields**:
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`;
- `assertsSpecified` = AR1–AR5 and SF1–SF11;
- `mutantsRecorded` = 16;
- `mutantRedOnSketch` = "16/16 (b-round-387/mutants)";
- `manifestPaths` = `b-round-387/r388-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`.

Run `python3 -I tools/l57-check.py` before hand-off. Write `progress.json` after every row (L59). Copies and destructive commands stay under `c-round-388/` (L60). Browser jobs run alone (L38). Warm `/studio-lab` up once before timed probes.

**Browser scripts** (do not edit; pass absolute output paths under `c-round-388/`; they import `../../c-round-382/lib.mjs`):
- `b-round-387/probe/meter-freeze.mjs <w> <h> <abs out.json>` and `meter-control.mjs`. These are copies of C's round-387 scripts with the screenshot paths parameterized, so they never write into `c-round-387/`.
- `b-round-386/probe/m2-flow.mjs <base> <abs out.json> <w> <h>`.
- `b-round-385/probe/resync-throw.mjs`.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At start and end: `git status --short --untracked-files=all`; `r388-frozen-sha256.txt` and the protected manifest, from `store/` | Exactly the 5 round-387 lines (no new path); both rc 0 |
| **CLAIMS** | `bash b-round-387/claims-388.sh` from the loop root; compare with `b-round-387/claims-388-output.txt` (round-387 tree, before A) | After A: K2 5, K3 1, K4 `SF11 rows: 1; SF rows total: 11`, K7 both `same`, K8 rc 0, K9 rc 0, K10 = `**სტატუსი:** Completed (C round 388 PASS)`, K11 each ≥ 1, K12 `same same`. K1 may differ only if root landed a pre-round commit. (`claims-388-sketch-output.txt` was run on the scratch copy inside the loop repository, so its K1, K2, K8 and K9 mean nothing; use only its K3, K4 and K7) |
| **PATCH-EQUAL** | `cmp` each of the 2 files with `b-round-387/sketch-files/`; the 2 other round-387 code files with `b-round-386/sketch-files/` | All 4 identical |
| **UNIT** | The 66 covering files (`covering-388.txt`), **all of them**. In round 387 C ran only 2 of 65 | All pass; AR1–AR5 and SF1–SF11 present by name; totals pasted |
| **MUTANTS** | `run-mutant-388.sh` and `run-mutants-387.sh` on a `cp -a` copy under `c-round-388/`. In round 387 C did not run them | **16/16** red: MU-388 on SF11; the 15 on the rows in the table in `a-round-387.md` §3, except PUMP-NO-CATCH, which is red on SF6 and SF11; `restored` printed; only the copy is touched |
| **BROWSER-METER-FLOOR** (1440×900, 1280×720) | `meter-freeze.mjs` | `thrown` 1, `status` true, every entry of `metersAfter1` and `metersAfter2` `-inf`, `clock` = `clock2` (frozen), `errors` []. B's sketch values: `probe/meter-sketch-*.json`. The round-387 tree before A: `probe/meter-head-*.json` (`-19.8`) |
| **BROWSER-METER-CONTROL** (1440×900) | `meter-control.mjs` | `thrown` 0, all `-inf` after a normal Stop |
| **BROWSER-METER-PLAYING** (both, from the same run) | `metersPlaying` | At least one entry is not `-inf` before the failure: the meters still move while playing (guards against a guard that floors meters always) |
| **BROWSER-M2-FLOW** (both) | `m2-flow.mjs` | The round-387 contract unchanged: errors [] everywhere; play1 thrown 1 / leaked 0 / scheduleFailed / clock frozen; play2 thrown 2 / leaked 0; play3 playingFrom, clock advancing, leaked 2; commit thrown 3, clips 3, leaked 0, scheduleFailed; afterStop leaked 0 (B: `probe/flow-sketch388-1440.json`) |
| **BROWSER-M1-NEIGHBOUR** (both) | `resync-throw.mjs` | As in round 387 |
| **EXPORT-EQUAL** | `b-round-386/probe/export-compare.mjs` → `sha256sum` | `06aeb3de…e9fd` (`b-round-386/probe/export-sha256.txt`) |
| **G388-AUTH** (both) | The G387 recipe in a fresh anonymous context | `/studio-lab` workspace, `auth_user` null; `/studio/middle-east` "Sign in required" with 0 `audio[src]`; token API without Authorization → 401. Fake bearer → `blocked` (backend) |
| **STUDIO-SMOKE** (both) | Enter adds a clip, Play for 1.5 s, Stop, Export dialog, Esc | As in round 387, with 0 page errors |
| **DOCS** | Doc 250 | l.4 byte for byte (round 388); the doc does not claim that SF11 covers unhandled rejections (SF11 listens only to window `error`); C-R387-01 Problem → Solution; SF11 and MU-388-TICK-NO-GUARD named and existing; TEMPLATE headings in order; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 |

**`browserVerified`:** true only if BROWSER-METER-FLOOR, BROWSER-METER-CONTROL, BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, EXPORT-EQUAL, G388-AUTH and STUDIO-SMOKE all ran in this round (both viewports where listed).

**Verdict:** PASS only if every row passes, UNIT and MUTANTS included. Gate rows (verify, the full suite, build) are not claimed. On PASS the round closes C-R387-01 and the five round-387 items together.

## 5. Neighbour risk
- **Scrub while playing.** `tick` re-queues a frame early when `scrubbingRef` is set. The guard sits before that branch, so a pump failure during a scrub also exits. That is correct: playback has stopped.
- **The end-of-arrangement stop.** That path is after the guard and is unchanged; it is still reached when playing.
- **Tests that stub `setInterval`.** Only the new `describe` stubs it; `vi.unstubAllGlobals()` in `afterEach` restores it. The SF1–SF10 `describe` is untouched.

## 6. Order after this round
1. **REGRESSION-2026-11-08:** the next planning, unconditionally (§ Why this round).
2. **PERF-13b-ii,** then PERF-13c, PERF-13d, PERF-14 and PERF-15.
   - PERF-11c-iii-d/e stay held for Saba. If there is no answer by RETRO 400, the default is SYS-R385-LEAF-ACTIONS-CONTEXT.
   - ARCH-CHECKPOINT-DECODE-REGION stays requested from root before PERF-13b-ii. Round 387's Architecture note, signal 3 on the same region, is added to that request.
3. **SYS-R2-FAKE-FIDELITY** and **SYS-CLOCK-DETERMINISM.**
4. **STEM-LANES,** then SYS-1…3, then STORE-2b…5 (direction gate).
5. **REVIEW-RECOMMENDATIONS,** then T12-ADVANCED.
6. **The phase-2 entries,** under the skip rule.

## 7. Claims
`bash b-round-387/claims-388.sh [store-root]`. Outputs at planning:
- `claims-388-output.txt`: the round-387 tree;
- `claims-388-sketch-output.txt`: the scratch copy.

Tags:
- **K1/K2:** HEAD and status lines.
- **K3:** the `tick` guard right after `pumpPlaybackAudio();` (0 before A, 1 after).
- **K4:** the SF11 and SF row counts.
- **K5:** the sketch sha.
- **K7:** PATCH-EQUAL.
- **K8/K9:** the manifests.
- **K10:** doc 250 l.4.
- **K11:** doc 250 names C-R387-01, SF11 and MU-388-TICK-NO-GUARD.
- **K12:** the other two round-387 files equal the round-387 sketch.
