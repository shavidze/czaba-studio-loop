# Round 387: a failed audio schedule never leaves sound running or the transport stuck (GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS)

**Planned by:** B, at the round 386 → 387 planning, 2026-11-07 (`b-round-386.md`).

**Baseline:** HEAD `5312260` (gate 386 `published`, `gates/gate-round-386.json`), 0 status lines [K1, K2].

**Decisions** (`backlog.json` v353 → v354, `decisions_log_b`):
- **D-29z1300:** round 386 is accepted on C's evidence: C PASS, 19 rows, `browserVerified` true, 0 bugs (`c-round-386.json`). GATE384-M1, A-R383-REVIEW-L1, GATE384-L2 and GATE384-L4 are closed. Gate 386 published `5312260`.
- **D-29z1301:** **scope = three bugs with one root cause** (a throw while building the playback graph):
  - **GATE-B385-M2** (Medium): `applySchedule` is not all-or-nothing. B reproduced it in the real browser at HEAD [K19]: when the 2nd source `start()` of a Play throws, the 1st source keeps sounding and Stop cannot stop it; each throw is an uncaught page error.
  - **A-R386-REVIEW-M1** (Medium): a Play that throws leaves `isPlaying` true with no graph. The next press acts as Stop, and Stop jumps the clock to a stale anchor (HEAD: 00:00.000 → 00:02.011) [K19].
  - **B-R386-UNGUARDED-GRAPH-CALLERS** (Medium, new; from A's round-386 reviewer note, ruled here): the other graph builders let the throw escape while the old graph keeps playing the old arrangement. These are `syncPlayback` (edits, loop resync), `seekTo`, `scrubPlayhead`, `endPlayheadScrub` and the audio pump's loop/metronome fill [K4, K6]. This is the silently-wrong-mix class that D-29z1295 rated Medium.
- **D-29z1302:** **the contract after a schedule throw is the D-29z1295 contract, now applied everywhere:**
  - playback stops and nothing keeps sounding;
  - the status line shows `studioPlaybackStrings.scheduleFailed` (an existing string; no new text) [K7];
  - an edit that triggered the reschedule is **kept** in history;
  - the next successful Play replaces the text with "Playing from …" (the existing clause).

  The status write is deferred to a microtask, so the failure text is the last write of the action. Commit actions write their own status synchronously after the reschedule, and that text would otherwise hide the failure [K22].
- **D-29z1303:** **architecture ruling** (the TL-R385-ARCH vs A-R386 build-or-stop conflict). Both are adopted, and they do not conflict:
  - `graph.client.ts` guarantees "a throw means nothing changed" (TL-R385-ARCH);
  - one provider-owned wrapper decides what the user sees (A's reviewer).

  `resyncAfterDecode` keeps its own `catch` (round-386 contract, frozen). It is now a second line of defence.
- **D-29z1304:** A-R386-REVIEW-L1 (`stopPlayback` inside a catch could throw on a half-built graph) closes with this round. After the rollback, no half-built graph is ever stored in `handleRef`, and `handle.stop` already catches each `source.stop` (AR3). Gate-386 suggestions S1–S5, A-R386-REVIEW-L2 and the two round-386 Architecture notes are recorded, not scheduled (`b-round-386.md` §3).
- **D-29z1305:** **the sketch review** (`tech-lead`, `b-round-386/sketch-review.md`) found TL-R387-M1 (Medium: a failed reschedule after a time-removing edit stopped at a stale-timeline position) and L1–L6.
  - **Fixed in the sketch:** M1, L1, L2, L4, L5 and L6, with new rows SF8, SF9 and SF10 and three new mutants.
  - **L3** (the catch logs no diagnostic) is deferred like TL-R385-L8: the Studio has no client diagnostic channel.
  - A delta review covered the dispatched sha.

**Why this round.** GATE-B385-M2 is the only open, scheduled Medium. The regression round is due on **2026-11-08** (`regression-last.json`: 2026-11-05 + 3 days). Today is 2026-11-07, so D-29z1298 puts this bug first. The next planning opens REGRESSION-2026-11-08.

**What the user notices:**
- **Normally: nothing.** The export is byte-identical to HEAD (B measured: `probe/export-sha256.txt`, 1 distinct hash) [K21].
- **In the rare case that the browser refuses to schedule audio:**
  - playback stops cleanly, and nothing keeps playing behind the user's back;
  - the status line says "Playback stopped — the audio could not be scheduled. Press Play to try again.";
  - Play works again. Before this round, a sound could keep playing that no button could stop, and the transport got stuck.

**Read first:**
- `lessons.md`: A reads 11, 12, 23, 26, 28, 31, 49, 51 and 58. C also reads 38, 56, 57, 59 and 60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`.
- `b-round-386/sketch-review.md`: findings, rulings and the throw-site × caller matrix.

**Not applicable:**
- **Reference-first, `product-designer`, YouTube:** a bug round with no new feature. Live has no documented equivalent of an internal scheduling failure; no reference was searched.
- **Screen budget (L39):** no new persistent element. `scheduleFailed` is an existing error-only text in the existing status line.

## 1. Behaviour that must not change
- **Happy-path audio.** Every node is created, connected and started in the same order as at HEAD. The only reorder is `trackGains.set`/`panners.set` before their `connect` calls, which has no observable effect. The export of the round-386 C recipe (Pulse + Bass stems, WAV 24-bit) is **byte-identical** to HEAD [K21].
- **Round-386 contracts:**
  - EV1–EV15 and PW19/PW20 pass unchanged;
  - `resyncAfterDecode` still has its `try`/`catch` [K9];
  - the direct-preview stop is unchanged (Q-PREVIEW-STOPS-TRANSPORT stays `awaiting_user`).
- **Meter taps.** The cached master tap and the track taps passed in as `tap`/`trackTaps` are never disconnected by a rollback; only the nodes `applySchedule` created are (AR1, AR4).
- **Purchase protection:** unchanged. No protected file is touched [K15].
- **L49, side effects of the replaced direct calls.** `startGraph` itself is unchanged: the wrapper calls it, so every side effect stays. In `startPlaybackAt` the effects before the build are:
  - `stopLibraryPreview` and `playbackEndedAtRef = null`: kept;
  - `isPlaying`/store true, the status updater, `updatePosition(from)` and `meterFreshFromRef`: undone or overwritten by `stopPlayback(from)` and the failure status on a throw (SF1, SF2);
  - the rAF tick and audio pump: **not started** on a throw (the early `return`; mutant MU-387-PLAY-NO-GUARD).
- **L51: what the failure text overwrites and what replaces it.**
  - **Overwrites:** "Playing from …" (Play), the action's own text after an edit (e.g. "“One” added to the Music track …"), and scrub or seek texts.
  - **Replaced by:** the next successful Play (the existing `startPlaybackAt` clause, SF2), any later action's status, and later async settles (TL-R385-L4, accepted).
  - **Rows:** SF2 (a repeated failing Play keeps the text, a clean Play replaces it) and SF3 (an edit's own text does not hide the failure).
- **Position after a failure** (rows in brackets):
  - Play: stays at the start point (SF1, not the stale anchor);
  - seek: the seek target (SF4);
  - scrub and scrub end: the scrub point (SF5, SF7);
  - edit: the position remapped into the new timeline (SF8);
  - loop and pump: the live position of the graph that was playing.

## 2. What A changes (grants: `b-round-386/grants-387.txt`, 5 paths)
**Apply the reviewed sketch verbatim:** from `store/`, run `git apply ../tmp/studio-real-loop/b-round-386/sketch-387.patch.txt` (sha256 `a9f22614…6486` [K13]; `--check` rc 0 at HEAD [K14]). Reviewed = dispatched (L58): A changes no line of the four files beyond the patch. If a check fails, A writes **STOP** (L11) and does not improvise. The patch contains:
1. **`app/lib/arrangement/graph.client.ts`:**
   - `applySchedule` builds inside one `try`. On a throw it calls `stop()` on every clip and click source whose `start()` returned (sources are recorded only after `start`). It then disconnects every node it created through `releaseNodes()`, which `handle.disconnect()` now shares, and rethrows the **same** error.
   - Inside `startPlan`, a failing `start()` disconnects that item's own chain before rethrowing. This also covers `appendPlan` on a live handle (AR5).
   - `startClicks` does the same for a click whose `start()` throws (TL-R387-L2, AR2).
2. **`app/contexts/ArrangementContext.tsx`:**
   - `stopForScheduleFailure(stopAt?)` = `stopPlayback(stopAt)` + a microtask that writes `scheduleFailed` only if playback has not been restarted in the meantime (SF10). One Georgian-context comment explains why the write is deferred (an allowed comment under the project rules).
   - `resyncAfterDecode`'s `catch` also calls `stopForScheduleFailure()` (TL-R387-L1).
   - `startGraphOrStop(arrangement, anchor, stopAt?)`: `boolean`.
   - **Used by:**
     - `syncPlayback`, the only direct `startGraph` call left, with `stopAt` = `positionAt(anchor, startAt)`: the remapped, loop-wrapped position in the new timeline (TL-R387-M1, SF8);
     - `startPlaybackAt` (`stopAt` = `from`; returns before the rAF and the pump start);
     - `seekTo` (`stopAt` = the target; TL-R387-L5);
     - `scrubPlayhead` and `endPlayheadScrub` (`stopAt` = the target).
   - `pumpPlaybackAudio` wraps the loop fill, the loop resync and the metronome fill in `try`/`catch` → `stopForScheduleFailure()`.
   - Deps were updated; `npm run typecheck` and Biome are clean on the sketch.
3. **New `app/lib/arrangement/__tests__/apply-schedule-rollback.test.ts`:** AR1–AR5, the real `applySchedule` with a recording fake context:
   - AR1: a mid-plan throw stops the started source, disconnects every node once, leaves the tap untouched and rethrows the same error;
   - AR2: a metronome click throw;
   - AR3: a `stop()` that throws during the rollback does not replace the original error;
   - AR4: the happy path stops and disconnects nothing;
   - AR5: an `appendPlan` throw keeps the earlier sources stoppable.
4. **New `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx`:** SF1–SF10, the provider with a fake `AudioContext` whose Nth `start()` throws, and the real `applySchedule`. Each row covers no window error or unhandled rejection, stopped, the status, nothing left sounding, and the position:
   - SF1: Play;
   - SF2: a repeated Play throw, then a clean Play;
   - SF3: an edit while playing (the edit is kept);
   - SF4: seek;
   - SF5: scrub;
   - SF6: the loop pump (polls up to 20 × 150 ms);
   - SF7: scrub end;
   - SF8: a Cut Time edit while playing (stops at the remapped position, about 1 s);
   - SF9: a throw in the first loop fill inside the Play build;
   - SF10: a clean Play in the same task as a failed one is not overwritten by the failure text.
5. **New doc `docs/implementation/2026/quarter-IV/250-schedule-failure-rollback.md`** (number free [K10]), in Georgian, with the TEMPLATE headings in order (L26):
   - l.4 byte for byte: `**სტატუსი:** Completed (C round 387 PASS)` (L28);
   - Problem → Solution for the three bugs;
   - the D-29z1302 contract;
   - the D-29z1303 ruling;
   - every AR/SF/MU id it names exists.

   Doc 249 is not edited.

## 3. A: checks (speed rules)
- **Pre-flight:** `git status` empty; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-386/r387-frozen-sha256.txt` (1,279 entries) and the protected manifest `b-round-318/protected-sha256.txt`, both rc 0 from `store/`.
- **Static checks:** `npm run typecheck` and `npm run lint` (gate 386 had 205 warnings; the count must not rise).
- **Tests:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-386/covering-387.txt)` (65 files: round 386's 34 covering files, the 40 test files that import `graph.client`, and the 2 new files). B's full suite on the sketch passed 257 files and 3,787 tests (`precheck-full.log`) [K20]. Paste the totals.
  - **Timeout headroom (L31, every covering file):**
    - SF6 takes about 0.3 s, polling at most 3 s against the 5 s default.
    - The slowest covering tests in B's full run on the sketch (`precheck-full.log`):

      | Test | Time | Declared timeout | Share |
      |---|---|---|---|
      | CP12a | 5.9 s | 30 s | 20 % |
      | UM9 | 3.3 s | 20 s | 16 % |
      | TG1 | 3.1 s | 20 s | 16 % |
      | TC10 | 4.0 s | 15 s | 27 % (gate 386 `verify.log`) |
      | `render-budget` Play → Stop → Play | 2.6 s | 15 s | 17 % |

      Every other covering test is under 2 s. Nothing is near 50 %.
- **Mutants:** run `TREE=<abs cp -a copy of store> OUT=<abs a-round-387/mutants> bash ../tmp/studio-real-loop/b-round-386/mutants/run-mutants-387.sh` on a copy, never on `store/`. All 15 must be red on their rows (table in `sketch-review.md`; B's logs are under `b-round-386/mutants/` [K18]), and `restored` must be printed.
- **No full suite, no perf run, no browser run is required of A.**
- **`code-reviewer`:** required (3+ files). Paste its Architecture note verbatim.
  - A Medium+ that `sketch-review.md` did not rule is a **STOP**. The findings in `sketch-review.md` are already ruled.

**STOP (L11):** in any of these cases A writes STOP at the top of `a-round-387.md` and changes nothing else:
- the frozen manifest is not rc 0 at the start;
- `git apply` fails;
- a covering test fails or exceeds 50 % of its timeout.

## 4. C: what to verify
C writes `c-round-387.md` and `c-round-387.json` as it goes, with **all L57 fields**, including the five that `c-round-386.json` lacked (INFO-B386-L57-C386-FIELDS): `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`. Run `python3 -I tools/l57-check.py` before hand-off.
- `assertsSpecified` = AR1–AR5 and SF1–SF10;
- `mutantsRecorded` = 15;
- `mutantRedOnSketch` = "15/15 (b-round-386/mutants)";
- `affectedChecksRunOnSketch`: B's `precheck-full.log`, `probe/flow-sketch-*.json` and `probe/export-sha256.txt`;
- `progress.json` after every row (L59); copies and destructive commands stay under `c-round-387/` (L60); browser jobs run alone (L38); warm `/studio-lab` up once in a browser before timed probes.

**Browser scripts:** under `b-round-386/probe/`. Run them **in place**, with absolute output paths under `c-round-387/`. They import `../../c-round-382/lib.mjs`; do not edit them. The clock (the first `mm:ss.mmm` on the page) is the playing signal. `leaked` counts realtime sources that started and never got `stop()`.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At start and end: `git status --short --untracked-files=all`; `sha256sum -c --quiet b-round-386/r387-frozen-sha256.txt` and the protected manifest, from `store/` | Status lines are exactly the 2 patched files, the 2 new test files and the new doc 250; both checks rc 0 |
| **CLAIMS** | `bash b-round-386/claims-387.sh` from the loop root, compared with `b-round-386/claims-387-sketch-output.txt` (B's run on the sketch) | Identical to the sketch output, with these allowed deltas only: **K15 and K16** (rc 0 expected on store; rc 1 in B's output only because of a scratch-only `vite.config.ts` cacheDir edit) and **K1** only if root landed a pre-round commit (INFO-C268). On A's tree K2 (5 = 4 code files + doc 250), K12 (41) and K14 (`--check` rc 1, `-R --check` rc 0) **match** the sketch output. K4 shows one direct call, inside `startGraphOrStop`. No `MISSING` |
| **PATCH-EQUAL** | `cmp store/<f> b-round-386/sketch-files/<f>` for the 4 code and test files | All identical (reviewed = dispatched) |
| **UNIT** | The 65 covering files | All pass; AR1–AR5 and SF1–SF10 present by name |
| **MUTANTS** | `run-mutants-387.sh` on a `cp -a` copy of store, with `OUT` under `c-round-387/` | All 15 red on their named rows (K18 table: B's logs); `restored` printed; the copy only |
| **BROWSER-M2-FLOW** (1440×900, 1280×720) | `node b-round-386/probe/m2-flow.mjs http://127.0.0.1:5173 <abs out> <w> <h>` | `errors` [] everywhere; **play1** `thrown` 1, `leaked` 0, `scheduleFailed` true, clock frozen; **play2** `thrown` 2, `leaked` 0, still `scheduleFailed`, clock frozen; **play3** `playingFrom` true, clock advancing, `leaked` 2; **commit** `thrown` 3, `clips` 3 (the edit kept), `leaked` 0, `scheduleFailed` true, clock frozen; **afterStop** `leaked` 0. B's sketch values: `probe/flow-sketch-*.json`. HEAD control: `probe/flow-head-*.json` (errors, `leaked` 1, stuck). Screenshots |
| **BROWSER-M1-NEIGHBOUR** (both viewports) | `node b-round-385/probe/resync-throw.mjs http://127.0.0.1:5173 <abs out> <w> <h>` (round-386 script, in place) | As round 386: `thrown` 1, `errors` [], clock frozen, `statusHasScheduleFailed` true, `replayStatusPlayingFrom` true, `replayStatusStillFailed` false |
| **EXPORT-EQUAL** | `node b-round-386/probe/export-compare.mjs http://127.0.0.1:5173 <abs c-round-387 dir> c387`, then `sha256sum` | The WAV's sha256 equals the HEAD/sketch hash in `probe/export-sha256.txt` (`06aeb3de…e9fd`) |
| **G387-AUTH** (both viewports) | Fresh anonymous context (the G386 recipe; L29: valid `product`/`file` params) | `/studio-lab` workspace with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=stem.mp3` without Authorization → 401, no token. Fake bearer → `blocked` (backend) |
| **STUDIO-SMOKE** (both viewports) | Enter adds a clip, Play for 1.5 s (clock advances), Stop (clock frozen), Export dialog opens, Esc closes | As in round 386, with 0 page errors |
| **DOCS** | Doc 250 | l.4 byte for byte; TEMPLATE headings in order; every AR/SF/MU id it names exists; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 hits |

**`browserVerified`:** true only if BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, EXPORT-EQUAL, G387-AUTH and STUDIO-SMOKE all ran in this round (each at both viewports where listed).

**Verdict:**
- **PASS:** every row passes.
- **Gate rows** (verify, full suite, build) are not claimed.

## 5. Neighbour risk
- **Status timing.** The failure text now lands one microtask later. A test or UI that reads the status synchronously right after a failing call sees the previous text; SF rows flush once.
- **`resyncAfterDecode`.** Its `catch` is now normally unreachable, because `syncPlayback` catches inside. That is why round-386 mutant MU-386-NO-CATCH would no longer turn EV11 red. This is expected and is recorded, not a regression. EV11, EV15 and PW20 still pass.
- **Loop pump.** A throw in the loop or metronome fill now stops playback instead of leaving a silent gap and a page error (SF6).
- **Export.** It uses `applySchedule` on an offline context. The happy path is unchanged (EXPORT-EQUAL). A throw there now rolls back before the existing export error handling sees it.

## 6. Order after this round
1. **REGRESSION-2026-11-08** (due; the next planning is on or after 2026-11-08).
2. **PERF-13b-ii,** then PERF-13c, PERF-13d, PERF-14 and PERF-15.
   - PERF-11c-iii-d/e stay held for Saba (questions-arch-leaf-plumbing). If there is no answer by RETRO 400, the default is SYS-R385-LEAF-ACTIONS-CONTEXT.
   - ARCH-CHECKPOINT-DECODE-REGION stays requested from root before PERF-13b-ii.
3. **SYS-R2-FAKE-FIDELITY** and **SYS-CLOCK-DETERMINISM.**
4. **STEM-LANES,** then SYS-1…3, then STORE-2b…5 (direction gate).
5. **REVIEW-RECOMMENDATIONS,** then T12-ADVANCED.
6. **The phase-2 entries,** under the skip rule.

## 7. Claims
Run `bash b-round-386/claims-387.sh` from the loop root (optionally with a store root). The outputs at planning:
- `b-round-386/claims-387-output.txt`: HEAD;
- `b-round-386/claims-387-sketch-output.txt`: B's sketch scratch.

Tags:
- **K1/K2:** HEAD and status.
- **K3:** `releaseNodes` and `throw error;` counts in `graph.client.ts`.
- **K4:** the direct `startGraph(` call lines in the provider (5 at HEAD: l.1383, 1686, 1829, 1910, 1930; 1 on the sketch).
- **K5:** `startPlaybackAt` sets `isPlayingRef` (l.1676) before the build (l.1686).
- **K6:** no `try` in `pumpPlaybackAudio` at HEAD.
- **K7:** `scheduleFailed` exists in `strings.ts`.
- **K8:** the AR/SF ids.
- **K9:** the `resyncAfterDecode` catch.
- **K10:** doc 250 is free.
- **K11:** 0 `perf`/`e2e` importers.
- **K12:** the test importers of `graph.client`.
- **K13/K14:** the sketch sha and `apply --check`.
- **K15/K16:** the manifests.
- **K17:** every cited `b-round-386/` artifact.
- **K18:** the mutant logs.
- **K19:** the HEAD browser repro (`probe/m2-head-1440.json`: 2 page errors per throw, `leaked` 1).
- **K20:** the full suite on the sketch.
- **K21:** the export hash.
- **K22:** the status-clobber premise (MU-387-STATUS-SYNC turns SF3 red).
