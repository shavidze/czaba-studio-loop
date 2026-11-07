# Round 394: PERF-13c-ii-a. A streamed library preview recovers from a stall, an external pause and a synchronous throw

**Planned by:** B, at the round 393 → 394 planning, 2026-11-07 (`b-round-393.md`).
**Decisions:** D-29z1342 … D-29z1346 (`backlog.json` v361, `decisions_log_b`).
**Type:** bug fixes inside a STUDIO-PERFORMANCE stage (PERF-13c, stage 2 of 3). There are three tightly related bugs in one function's lifecycle (policy: at most three):
- REV-B393-M1-STALL (Medium);
- GATE393-M1-SYNC-THROW (Medium);
- A-R393-REVIEW-M1-EXTERNAL-PAUSE (re-rated Medium).

No new screen element, and no new behaviour a user must learn.

**Read first:**
- `lessons.md` in full. Most relevant here: L4, L10, L11, L23, L26, L28, L31, L49, L51, L52, L56, L57, L58, L59.
- This file. Open `tasks/round-393.md` only to look up the round-393 stream contract (D-29z1341), which this round keeps.
- **Claims:** `b-round-393/claims-394.sh`, run from the loop root.
  - Planning output: `b-round-393/claims-394-planning-output.txt`.
  - Output on B's sketch: `b-round-393/claims-394-on-sketch.txt`. §7 is the diff of those two files.
  - A runs the claims before editing.
  - C runs them at SOURCE-SCOPE start, where they must equal the planning output, and again at the end, where only the facts in §7 may differ.

## Baseline: HEAD `1091b9e`, clean tree
- Gate 393 is `published` at `1091b9e` [K1]. HEAD is `1091b9e`, with 0 status lines [K2].
- Protected files: 11/11 [K3].
- Frozen manifest `b-round-393/r394-frozen-sha256.txt`: 1284 entries, 0 failures [K4]. It covers every tracked file except the 3 granted paths.
- Grants: `b-round-393/grants-394.txt`, 3 paths (§4).

## 0. Why this round
- **PERF-13c-i is done.** C round 393 passed with `browserVerified` true and 0 bugs [K7], and gate 393 published it (D-29z1342).
- **The bug gate now applies to the stream path.** REV-B393-M1-STALL was a Medium deferred "until 13c-i lands". That stage has now shipped. The gate-393 reviewer and A's reviewer each added a Medium on the same element lifecycle.
- **Premise, measured by B at HEAD** [K14], in `b-round-393/premise/events-head.json` (1440×900):
  - **HOLD** (the media request is never answered): after 14 s the toggle still reads `Stop`, `currentTime` is 0, no fallback happened and no decode ran. Events: `play`, `waiting`, `loadstart`, `stalled`, then nothing. The user is stuck.
  - **External pause** (console `el.pause()`, a proxy for a media key or OS interruption; the bare element is listed in Chrome's and the OS's media controls): the toggle stays `Stop` with a frozen cursor.
  - **Event order (data for the guards):**
    - At the natural end, `pause` fires **before** `ended`, with `element.ended` already true.
    - An aborted source fires `error` with **no** `pause`.
    - A seek fires `seeking`, `waiting`, `seeked`, `canplay`, `playing`.
- **B's sketch fixes both in Chromium at both viewports** [K15, K16]:
  - `b-round-393/sketch-events.json`:
    - HOLD falls back after 8378 ms: `Loading “Middle East — public preview”…` → `“Middle East — public preview” is ready.`, with one decode and one buffer start of 101.35 s.
    - A console pause turns the toggle to `Preview`, and the element is released.
    - A normal 20 s stream with a seek has 0 decodes, and the live PCM is unchanged.
    - END and ABORT are unchanged.
  - `b-round-393/sketch-hold.json`:
    - live PCM +1 buffer (101.35 s);
    - requests after the click: one `media`, then one `fetch` (the round-392 decode path);
    - 0 requests after the fallback started.

## 1. Rulings (B)

### D-29z1344: what the player does (all in `preview.client.ts`; zero provider change)
1. **Stall watchdog (REV-B393-M1-STALL).**
   - **Timer:** one per streamed preview, `LIBRARY_PREVIEW_STREAM_STALL_MS = 8000`. It is armed:
     - at stream start, after `currentTime` is set;
     - on the element's `waiting` event.
   - **Cleared on:** `playing`, and on every stop (`detach`).
   - **Restarted, never newly armed,** on `progress`: bytes are still arriving. A slow but working link must not pay for a 37–55 MiB decode (performance-optimizer).
   - **Not armed by:** a same-URL seek (a seek inside the buffered data fires neither `waiting` nor `playing`), or `stalled`. Chromium fires `stalled` after about 3 s even while buffered audio keeps playing (tech-lead).
   - **Expiry:** if the preview is still active **and** `element.currentTime` equals its value when the timer was armed, the preview takes the existing error route: read the time, `stopActive()`, then `onStreamError(at)`. The provider's round-393 fallback then decodes and writes the honest round-392 texts. If the time has moved, nothing happens; Chromium sometimes skips `playing` after a short wait (tech-lead).
   - **Why 8 s:** it covers a first chunk on a slow link, together with the `progress` restart, and background-tab timer throttling (about 1 s). The cost of a false positive (a full decode, remembered per collection) is recorded in doc 252.
   - **Mid-play stalls also fall back to decode.** The alternative, ending the preview silently, would hide the failure.
   - **Injection:** `LibraryPreviewPlayerOptions` gains:
     - `scheduleStallTimeout?: (callback, ms) => () => void` (it returns its cancel function, so no timer-handle types or assertions are needed), defaulting to `window.setTimeout`/`clearTimeout`;
     - `streamStallTimeoutMs?: number`.
2. **Synchronous throw (GATE393-M1-SYNC-THROW).**
   - `element.src = url`, `element.currentTime = start` and `element.play()` sit in one `try`. Its `catch` calls the error handler.
   - In the same-URL seek branch, `currentTime = start` sits in a `try` whose `catch` calls the active preview's `fail` (a new `fail` field on `ActiveStreamPreview`, set to that preview's error handler).
   - The result is the same as an `error` event (fallback to decode). It is never an uncaught exception, and never `Stop` on silence.
3. **External pause (A-R393-REVIEW-M1-EXTERNAL-PAUSE, re-rated Medium by D-29z1344; supersedes the Low A-R393-SKETCH-L4-EXTERNAL-PAUSE).**
   - A `pause` event on the active element, when `!element.ended && !element.error`, ends the preview: `stopActive()` then `onEnded()`. The toggle returns to `Preview` and the preview pin is released through the provider's existing `onEnded`. The status line is unchanged.
   - Our own stops never trigger it, because `detach` removes the listener before `pause()` and `load()`.
   - **`!element.error`, not `=== null`:** jsdom returns `undefined` for `error`.
   - **The `!element.ended` guard is not observable in a browser.** Without it, the pause handler ends the preview and the detached `ended` listener never runs, so the outcome is identical. PS21 (jsdom) is its only pin, and no C row can test it.
   - The `!element.error` guard keeps the fallback on a source error that is preceded by a pause.
   - Resuming the paused stream (Live-like "continue") is not chosen. A stopped preview is the smallest honest state, and the next Preview or waveform click starts it again.
4. **Kept unchanged, recorded:**
   - **`NotAllowedError` still falls back to decode (D-29z1344).** This closes the sketch-review #2 scope addition and gate-393 L2 (GATE393-L2-NOTALLOWED), for tech-lead's reason: on Safari/iOS the element can be blocked while the unlocked `AudioContext` works, so the fallback means sound and ending would mean silence.
   - A same-URL seek keeps the first call's `onStreamError` (A-393 L5; unreachable today: one URL per source).
   - The fallback set never expires (gate-393 L4 / A-393 L4); ruled in 13c-ii-b.

### Side effects of the code this round wraps (L49)
| Effect | Ruling |
|---|---|
| The `.catch(handleError)` on `play()` | **Kept** inside the new `try` (PS4 stays green) |
| The `if (active !== preview) return;` after `src` | **Kept** inside the `try` |
| `detach` removing `ended`/`error` | **Kept.** `detach` now also cancels the timer and removes `waiting`, `playing`, `progress` and `pause` (PS19, PS21) |
| The seek branch's `return` without a pause | **Kept** (PS2). Only the `try`/`catch` is added |

### Ruling lines (L4)
- **The stream error route vs the new pause route:** a pause with `element.error` set is left to the error event (fallback wins).
- **A watchdog expiry vs moved time:** moved time wins (no fallback).
- **`progress`:** it restarts an armed timer and never arms one.
- **The status line:** this round writes none. The fallback's texts are the unchanged round-392 ones (L51: `Loading “X”…` → `“X” is ready.` or `sourceFailed`, which can meet `Demo collection ready…`, the add text, Undo/Redo and `playingFrom`, as in round 393). The external pause writes nothing.

## 2. Reference
- **This is a performance and bug-fix stage.** No `product-designer` consult or full reference section is needed (policy exemption).
- **Alignment:** Live's browser preview stops when it is interrupted and restarts from a new click (Live 12 manual ch. 5, browser preview). The external pause → `Preview` follows that direction. This is "consistent in direction", not "identical".
- **Screen budget (L39):** nothing new is visible.

## 3. What A changes
1. **`app/lib/arrangement/preview.client.ts`:** §1 items 1–3. It exports `LIBRARY_PREVIEW_STREAM_STALL_MS`; read `AGENT_DISCOVERABLE_CODE.md` for the name. `playLibraryPreview` and `getLibraryPreviewOffset` are unchanged.
2. **`app/lib/arrangement/__tests__/library-preview-stream.test.tsx`:** PS16–PS24 in a new `describe`. PS1–PS14 are unchanged (no assert removed or weakened).
3. **`docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`** (L34: the whole doc is granted).
   - l.4 becomes, byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 394 PASS)`.
   - Add a stage-2 part, in Georgian, under the existing 7 TEMPLATE headings. Do not add a new `## ` heading. It covers:
     - the watchdog rule and 8 s, with its false-positive cost;
     - the pause guards and the jsdom `undefined` note;
     - the synchronous-throw route;
     - the NotAllowedError ruling;
     - the premise and sketch numbers with their files (`b-round-393/premise/events-head.json`, `b-round-393/sketch-events.json`, `b-round-393/sketch-hold.json`);
     - only row ids that exist (L26).
   - TODO lists stage 3 = 13c-ii-b.

**B's sketch.**
- The file is `b-round-393/sketch-394.patch.txt`, sha256 `723a6d9e42b1aaa0…` [K19]. It covers the source and tests only; the doc is A's.
- On it, B ran:
  - `tsc` and scoped Biome, both clean;
  - the covering set, 14 files and 256 tests, rc 0 [K18];
  - 12/12 mutants red, pristine rc 0 [K17];
  - the browser probes [K15, K16].
- A may follow it. **No `as`, `any` or `@ts-ignore`.** The sketch tests use `Object.defineProperty` for `ended`, `error` and a throwing `currentTime`, and `vi.spyOn` for `play`.
- A deviation from §1's semantics is a STOP (L11).

**Forbidden:**
- every path outside the grants. In particular:
  - `ArrangementContext.tsx` (zero provider change; claim K9 must stay equal);
  - `ArrangementLibraryPreview.tsx`;
  - `collection.ts`, `studio-lab-demo.ts`, `types/arrangement.ts` (13c-ii-b);
  - `perf/**` (13c-ii-b);
  - `strings.ts`;
- the global forbidden files and actions, the protected files and `package.json`;
- commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-393/grants-394.txt`)
- `app/lib/arrangement/preview.client.ts`
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx`
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`

## 5. A: tests
Row ids are binding. Each row names the mutant that must turn it red. A runs the mutants on a scratch copy outside `store/` and saves the logs in `a-round-394/mutants/`. B's run is `b-round-393/mutants/run.py` and `summary.txt`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **PS16** | Fake scheduler; stream at offset 7; fire | One timer of 8000 ms is armed; `onStreamError(7)` once; `onEnded` never; `src` removed; offset `null` | MU-394-NO-WATCHDOG, MU-394-DEFAULT-DELAY |
| **PS17** | Start; `playing`; `progress`; fire; `waiting`; `progress`; fire | After `playing`: 0 pending, and `progress` does not arm. Firing does nothing. `waiting` arms 1; `progress` restarts it (3 schedules in total). The second fire gives `onStreamError` once | MU-394-PLAYING-NOT-DISARM, MU-394-NO-WAITING-REARM, MU-394-PROGRESS-ARMS-ALWAYS |
| **PS18** | Start at 0; set the element time to 2.5; fire | No error; offset 2.5; `src` kept | MU-394-NO-PROGRESS-CHECK |
| **PS19** | `playing`, then a same-URL seek; stop; new stream; then a buffer preview; fire | 0 pending after the seek and after the stop; 1 after the new stream; 0 after the buffer preview; no error | MU-394-STALL-SURVIVES-STOP |
| **PS20** | `playing`, then `pause` | `onEnded` once; no error; `src` removed; offset `null`. A later `pause` or `ended` adds nothing | MU-394-PAUSE-IGNORED |
| **PS21** | (a) stop, then `pause` on the old element; (b) `ended` = true, `pause`, `ended`; (c) `error` set, `pause`, `error` | (a) no `onEnded`; (b) `onEnded` once, only from `ended`; (c) no `onEnded`, and `onStreamError` once | MU-394-PAUSE-NO-ENDED-GUARD, MU-394-PAUSE-NO-ERROR-GUARD |
| **PS22** | The `currentTime` setter throws; separately, `play()` throws synchronously | It does not throw; `onStreamError` once each; offset `null`; `src` removed; 0 pending timers | MU-394-SYNC-THROW-START |
| **PS23** | Streaming; the `currentTime` setter then throws (getter 9); same-URL seek to 60 | It does not throw; `onStreamError(9)` once; `src` removed | MU-394-SYNC-THROW-SEEK |
| **PS24** | Default scheduler with `vi.useFakeTimers()`; advance 7999 then 1; then start and stop; advance 20000 | No error at 7999; one error at 8000; none after the stop | MU-394-DEFAULT-DELAY, MU-394-NO-WATCHDOG |

**Collision rows (L23).**
- The covering set is `a-round-393/covering-files.txt` (14 files). On the sketch it is green: `b-round-393/precheck-covering.log`, 256 tests.
- PS1–PS14 and every other file are unchanged.
- **Timeout headroom (L31):** the slowest covering test is LRS4 at 2.24 s, under a 15 s describe timeout [K18].
- The new rows take at most 6 ms each.

**A also runs:**
- `npm run typecheck` and `npm run lint`;
- scoped `npx biome check` on the 2 code paths;
- `npx vitest run` on the covering set;
- the claims script, at the start and at the end;
- the `code-reviewer` (3 files changed). A reviewer Medium whose fix falls outside §1 is a STOP (L11).

A does not run the full suite, `verify`, the build or a browser.

**A's report, `a-round-394.md`:**
- the changed files;
- each command, with its rc and a log path under `a-round-394/`;
- the mutant logs;
- any deviation from the sketch;
- the reviewer's notes. Architecture notes go to B as signals.

## 6. C: browser rows
Run at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, with a fresh context per row.
- **Probes:**
  - Copy `b-round-393/premise/events.mjs`, `hold.mjs` and `warm.mjs` (with `c-round-382/lib.mjs`'s `open`) into `c-round-394/`.
  - Warm up the server with `warm.mjs` before any timed row (L38).
  - Locate the toggle by `data-testid="arrangement-library-preview-toggle"` and the wave by `data-testid="arrangement-library-preview-wave"` [K13].
  - Record the media events through the `play` hook in `events.mjs`.
  - **The route recipes:** HOLD answers no request whose `resourceType()` is `media` (the handler returns without fulfilling); ABORT aborts media only.

| Row | Steps | PASS when |
|---|---|---|
| **R1 STALL-FALLBACK** (the bug) | HOLD route; select Middle East; click the toggle | **Assert:** within 15 s, the status sequence is `Loading “Middle East — public preview”…` → `“Middle East — public preview” is ready.`; exactly one `decodeAudioData` of 101.35 s; exactly one buffer start of 101.35 s; the toggle reads `Stop`; live PCM after GC×2 = before + one 101.35 entry; 0 requests for `middle-east.mp3` after the buffer start. **Record:** the time from click to buffer start (sketch 8378–8390 ms), the request types (sketch: `media`, `fetch`) |
| **R2 EXTERNAL-PAUSE** (the bug; a console `el.pause()` is the proxy for a media key or OS interruption) | Stream Middle East; wait until `currentTime` > 1; `window.__media[0].pause()` | Within 1.5 s the toggle reads `Preview`; the element has no `src` and `networkState` is 0; the status text is unchanged; 0 decodes; 0 buffer starts |
| **R3 NORMAL-20S** (false-positive guard) | Stream Middle East for 10 s; click the wave at 5 %; 10 s more | Still one element, playing, `src` `/middle-east.mp3`; toggle `Stop`; 0 decodes; 0 buffer starts; live PCM unchanged; the status text unchanged |
| **R4 END** (round-393 S5) | Click the wave at 98 %; Preview; wait for `ended` (≤ 30 s) | **Assert:** toggle `Preview`; no second element; the status unchanged; 0 decodes. **Record:** the event order (sketch: `pause`, then `ended`; a browser fact, not a contract) |
| **R5 ABORT** (round-393 S9) | ABORT route; Preview; then Stop and Preview again | `Loading…` → `is ready.`; one decode and one start of 101.35 s; toggle `Stop`; the second Preview creates no new element |
| **R6 STOP** (round-393 S2) | Stream, then click the toggle | Paused, no `src`, `networkState` 0; toggle `Preview`; 20 s later still `Preview`, 0 decodes (no late watchdog) |
| **R7 PLAY-STOPS-PREVIEW** (round-393 S6) | Add Full mix (Enter); stream Middle East; Space | `data-playing` true; the element paused with no `src`; 20 s later 0 decodes (no late watchdog) |
| **PERF-RES** | `perf/studio-lab-resources.perf.spec.ts`, run alone (L38) | `res.mem.pcm-live-mib-ready` ≤ 60 and `pcm-live-decode-mib-ready` ≤ 0. Copy the results to `c-round-394/perf-results/` |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<any premium handle>` shows sign-in with no workspace; `/api/studio-token` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | The claims script at start and end; `git status`; `sha256sum -c` on `b-round-393/r394-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | Start = the planning output. End: only the 3 granted paths changed; K4 0 failures; K3 11; K9 unchanged (no provider change); only the §7 facts differ |
| **DOC-252** | Read the doc | Georgian; the 7 TEMPLATE headings in order, none added; l.4 exact as in §3; every cited row id exists; the cited files exist |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **Not testable in a browser (jsdom only):** the synchronous throw (PS22, PS23) and the `!element.ended` guard (PS21b). These get no C row. C writes a `jsdom-only` note in `c-round-394.md` naming PS21(b), PS22 and PS23 and the A mutant logs it relied on. It does not put them in `blocked` or `passed`, so they do not affect `browserVerified`.
- **Ableton:** report "consistent in direction (an interrupted browser preview stops; a new click restarts it)", with the status `not applicable / perf`.
- **All L57 fields go in `c-round-394.json`:**
  - `manifestPaths` = `b-round-393/r394-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
  - `missingPaths`, `countMismatches`, `claimCheckMinutes`;
  - an `origin` for every finding;
  - `assertsSpecified` and `mutantsRecorded`;
  - `mutantRedOnSketch` = `b-round-393/mutants/summary.txt`;
  - `mutantRedOnTree`;
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-393/precheck-covering.log`) and `chainHeadGateRunGreen` (gate 393 published `1091b9e`);
  - `affectedChecksNamed` and `affectedChecksRunOnSketch` (`b-round-393/sketch-events.json`, `sketch-hold.json`);
  - `progressFile` and `stopSignal`.
- **Before hand-off:**
  - Run `tools/l57-check.py`.
  - Run the heaviest rows first: PERF-RES, R1, R3.
  - Write `c-round-394/progress.json` after each row (L59).

## 7. Claims that may change during the round
From `diff b-round-393/claims-394-planning-output.txt b-round-393/claims-394-on-sketch.txt`, plus the doc:
- **K2:** `1091b9e 0` → `1091b9e 3` (3 modified, 0 new).
- **K8:**
  - `stall-const` 0 → 1;
  - listeners `waiting`, `playing`, `progress` and `pause` each 0 → 1;
  - `removes` 2 → 6;
  - `try` 1 → 3;
  - everything else unchanged (`ended` 1, `error` 1, `play-catch` 1, `audio-element` 1, `to-destination` 1).
- **K10:** `stream-file` 14 → 23; `last` PS14 → PS24; `describes` 2 → 3; `demo-PS15` stays 1.
- **K11:** the l.4 text becomes the §3 string; `headings` stays 7; `in-progress-docs` stays 6.

Every other fact must equal the planning output, including K9 (provider) and K12 (the player's users). K14–K20 cover B's artifacts.

## 8. Out of scope (recorded, not dropped)
- **PERF-13c-ii-b** (stage 3 of 3; next):
  - the purchased adapter's `previewUrl` (a fresh signed URL per call; its browser half is BLOCKED "backend unavailable in cloud"; try L36 stubs first);
  - the stable seek key: a source id instead of the URL (A-393 L6);
  - fallback-set expiry (gate-393 L4 / A-393 L4);
  - the perf harness preview row;
  - the stem-cache warm ruling (SIG-R393-PREVIEW-NO-CACHE-WARM; the fallback's one `fetch` [K16]).
- **Known gap, not fixed:** a stream that keeps delivering bytes (`progress` keeps restarting the timer) but never reaches `playing` does not trip the watchdog. Corrupt data ends in `error`; a pathological trickle does not. It is recorded in doc 252.
- **Unchanged:** Q-PREVIEW-STOPS-TRANSPORT; A-R392-REVIEW-M1 and sketch-review #5 (SRW-21-PLAN rows); the settle-helper and preview-controller extractions (architecture signals; checkpoint after 13c-ii-b).
- **Next:** PERF-13c-ii-b → PERF-13d → PERF-14 → PERF-15. The regression round is due at the first planning on or after 2026-11-10. The RETRO is at round 400.
