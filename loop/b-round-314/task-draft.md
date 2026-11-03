# Round 315: PERF-5b. Batching closes on evidence; the peaks client survives a slow worker start, a callback error never stops or relabels other jobs, and a source's buffer reaches playback together with "ready" (A-R312-REVIEW-L1…L5)

**Planned by:** B, at the round 314 → 315 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v274 → `decisions_log_b`):
- **D-29z845: round 314 ruled.** C PASS: 10 rows, `browserVerified`/`realVerified` true, 0 bugs. Gate 314 published `abfcf78` on both remotes [K1]. **PERF-5a is done.** C-R312-01 and C-R313-01 are closed. INFO-C314-DOC-PENDING-SENTENCE is granted in this round (§5 item 5).
- **D-29z846: PERF-5b's batching closes on evidence** (§0.1; L37 premise). No deterministic row is red at HEAD. Signals are recorded, not scheduled (§0.3).
- **D-29z847: round 315 = PERF-5b, reshaped to the PERF-5 robustness batch.** It closes A-R312-REVIEW-L1, L2, L3, L4 and L5, all in the peaks client, its two context call sites and its tests. One owner.
- **D-29z848:** consults: performance-optimizer and tech-lead (§0.4).
- **D-29z849:** bookkeeping and signals (§10). `lessons.md` is unchanged.

**Read first:** `lessons.md`. These apply directly:
- L4: one element, one rule (the PW9 ruling line in §1).
- L11: STOP, and re-review after any change.
- L23: B pre-applied the change and ran the covering files (§2).
- L26 / L28 / L34: docs.
- L29 / L56: claims.
- L37: the premise was measured (§0.1).
- L49: a moved call keeps its side effects (§4.2).
- L52: asserts must be able to fail.
- L57: C's harness fields.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.

## Baseline: HEAD `abfcf78`, clean tree
- **Gate 314:** `published`, commit `abfcf78` [K1]. `git status` shows 0 entries [K2].
- **Protected and config files:** `b-round-312/protected-sha256.txt`, 11/11 OK [K18]. They must stay OK.
- **Last implementation doc in quarter IV:** `228-perf-peaks-worker.md` [K19]. No new doc number is needed.

## 0. Why this round

### 0.1 PERF-5b's batching: premise measured, closed on evidence (D-29z846)
The backlog stage read: "rAF/startTransition batching of setSourcePeaks + source state updates; own L37 premise measure; close on evidence if no HEAD-red deterministic row".

**B's probe** (`b-round-314/probe/`): a scratch production build of HEAD with commit component names and a `performance.mark` per peaks delivery. 3 loads at CPU 1× and 3 at 6×.

| | 1× (3 loads) | 6× (3 loads) |
|---|---|---|
| peaks deliveries per load | 9 | 9 |
| commits from the first delivery to settled | 9 | 9 |
| components per commit | 94 each (ArrangementProvider → StudioWorkspace) | 94 each |
| delivery gaps under 16 ms (could share a frame) | 3, 3, 2 of 8 | 0, 0, 0 of 8 |
| long tasks over 50 ms from a peaks commit | 0 | 0 |

[K12]. React 18 already merges `setSourcePeaks` and `patchSourceState` into one commit per delivery. The worker runs jobs one at a time [K22], so deliveries rarely land in the same frame.
- **A rAF coalescer** would save at most 2–3 of 9 commits at 1×, and none at 6× where it would matter. The count would also become timing-dependent (wallclock).
- **`startTransition`** can hold back `status: 'ready'`. The library preview gates on that status [K21], and D-29z835 keeps ready after peaks.
- **No deterministic row is red at HEAD.** performance-optimizer agrees: close it.

### 0.2 What this round fixes (the PERF-5 robustness batch, A-R312-REVIEW-L1…L5)
| Id | Problem at HEAD | Fix (sketch) |
|---|---|---|
| L1 | One 3,000 ms stall timer [K3] also covers the worker's cold start (module fetch while the main thread is busy). A slow first start turns the worker off for the whole session; demo-synth allows 10 s | 10,000 ms until the worker's first reply, then 3,000 ms per reply |
| L2 | `onPeaks` is called directly in `handleReply` and in the main-thread fallback [K3]. A throwing callback skips `startNext` (the stall timer later turns the worker off) or stops the `failWorker` loop (later jobs are lost). A synchronous throw from `request()` would also reach the collection `.catch` and could mark a source `error` after it was already `ready` | One `deliver` helper. A callback error is rethrown on a timer; it never stops the queue and never reaches the caller |
| L3 | `buffersRef.current.set` runs before the peaks request in both call sites [K4]. Playback and export can read the buffer of a source that still shows `loading` | The set moves into the peaks callback, after its guard and before `setSourcePeaks`. The collection callback re-syncs playback when a clip uses the source, as the video callback already does [K5] |
| L4 | No row covers the video call site, an empty buffer, or a stall re-armed per reply | PW15, PW19 (A), PW20 |
| L5 | PW13 covers no throw on `end` or `cancel`, and asserts no timer count | PW13b |

### 0.3 What changes for the user
- **Normal load: nothing visible.** 9 sources, 9 waveforms, the same commits.
- **Slow machine or slow network:** the worker is no longer dropped after 3 s of cold start. Waveforms still arrive, and the main thread is not used for fallback peaks.
- **A source that is still computing peaks** no longer plays or exports before it shows `ready`; when it becomes ready during playback, it joins the playing mix. This is reachable in the browser through a video's own sound (the video clip exists before its audio peaks). `/studio-lab` starts with no clips [K20], so the collection path matters only for an initial project with clips (tests, and later SRW-21).

### 0.4 Consults (read-only)
- **performance-optimizer:** close batching. Do not use `startTransition`. The 94 components per delivery belong to PERF-10: a peaks-only store would not change the count while `sourceStates` stays in the provider. **Hazard found:** a synchronous rethrow in `failWorker` can reach the collection `.catch` and mark the wrong source `error` → adopted as the timer rethrow. With L3, the collection path also needs the playback re-sync → adopted.
- **tech-lead:** the plan holds, with corrections, all adopted:
  - carry the reply flag per worker and set it on any parsed reply, before the job-id filter;
  - one `deliver` helper so that no callback error touches the scheduler state;
  - keep `if (!active)` after the delivery (PW12);
  - leave an exception inside the video callback uncaught, not relabelled (`deliver` now reports it on a timer);
  - PW9 must be rewritten.

  Readers of `buffersRef`: the graph build [K22], the library preview (already gated on `ready` [K21]) and export [K21].
  - Video export is refused while the video's audio is `decoding` [K21], so for video L3 changes playback only.
  - The only remover of a video source runs before decode is called [K20], so the `videoSourcesRef` guard is not reachable today.
  - There is no buffer prune anywhere [K22] (pre-existing; PERF-13's SOURCE-PEAKS-NEVER-PRUNED).
  - Export of a clip whose collection source is still `loading` has no gate → signal B-R314-EXPORT-LOADING-GATE (§10), not this round.
- **Not consulted:** product-designer and ableton-arrangement-expert. Nothing user-visible changes shape; reference-first does not apply (§0.5).

### 0.5 Reference / screen budget
This is a performance and robustness round with no new user-visible behaviour, so the reference rule does not apply. Nothing persistent is added to the screen.

## 1. Rulings
| Id | Severity | Ruling |
|---|---|---|
| A-R312-REVIEW-L1 | Low | This round: `PEAKS_WORKER_COLD_START_TIMEOUT_MS = 10_000` until the first parsed reply of the session's worker; 3,000 ms per reply after it |
| A-R312-REVIEW-L2 | Low | This round: `deliver` with a timer rethrow, used by the worker path and the main-thread fallback |
| A-R312-REVIEW-L3 | Low | This round: the set moves into both callbacks; the collection callback re-syncs playback |
| A-R312-REVIEW-L4 | Low | This round: PW15, PW19, PW20. The video-callback exception bullet is ruled by L2's contract (reported on a timer, never relabelled); no extra row |
| A-R312-REVIEW-L5 | Low | This round: PW13b (`end`, `cancel`, `vi.getTimerCount() === 0`) |
| A-R312-REVIEW-L6 | info | Unchanged (callers check `signal.aborted`) |
| PERF2-STEREO-COPY | low signal | Moved to PERF-13, together with R314-DEMO-BUFFER-LONGTASK-6X (§10) |
| R313-FOLLOW-PAGE-TURN-COVERAGE | signal | Decided now: deferred to PERF-10's planning. A page turn's cost is render work of the timeline-scroll subscribers, which PERF-10's context split changes; a row today would measure code that PERF-10 rewrites |
| INFO-C314-DOC-PENDING-SENTENCE | info | This round, §5 item 5 |

**Ruling line (L4).** PW9: L1's contract wins over PW9's old assertion ("no reply → fallback at 3,000 ms"). The old assertion is replaced by two stronger rows: PW14 (no reply yet → fallback exactly at 10,000 ms, not before) and PW9 (after the first reply → fallback exactly at 3,000 ms). No other existing assertion changes.

## 2. B's pre-check (L23, L37)
On the scratch `/tmp/b315k` (HEAD plus `b-round-314/sketch.patch.txt`, own Vite `cacheDir`):
| Check | Result |
|---|---|
| `tsc --noEmit` | rc 0 (`precheck-tsc.log`) |
| `biome check` on the 3 files | clean (`precheck-biome.log`) |
| `peaks-worker.test.ts` | 25/25 tests (HEAD 17). `it`/`it.each` lines 16 → 23 [K11] |
| Mutants (`unit-mutants.py`) | 11 mutants: 10 red on the rows named in §6; MU-REPLIED-AFTER-FILTER is equivalent by design; restored 25 passed [K13] (`precheck-unit-mutants.txt`) |
| The 8 covering files named by tech-lead | 8 files, 97/97 [K14] (`precheck-covering.log`) |
| Full unit suite on the scratch (B's own check; not an A or C row) | 235 files, 3502/3502, rc 0 [K14] (`precheck-full-suite.log`; run before PW20 was added; PW20 is test-only and is in the covering run) |
| Perf spec on the sketch, alone (`precheck-perf.json`/`.log`) | rc 0, `failures` empty; 164/164 deterministic rows equal `c-round-314/perf-harness-1.json` [K24] |
| Browser cold-start probe (prod builds, `probe/cold-start.cjs`, first peaks reply held for 4 s) | HEAD: the peaks worker is terminated exactly 3,000 ms after creation (316 → 3316 ms). Sketch: not terminated at 1440×900 or 1280×720 (180 replies). Both builds reach ready with 0 page errors; without the delay neither terminates (`probe/cold-start-summary.txt`) |

`git apply --check b-round-314/sketch.patch.txt` succeeds on HEAD.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-314/claims-315.sh` equals `b-round-314/claims-315-head-output.txt`. A difference is a STOP |
| A-APPLY | From `store/`: `git apply ../tmp/studio-real-loop/b-round-314/sketch.patch.txt`. Then `peaks.client.ts` is byte-equal (`cmp`) to `b-round-314/sketch-peaks.client.ts.txt` and `ArrangementContext.tsx` to `sketch-ArrangementContext.tsx.txt`. A change to either beyond the sketch is a STOP |
| A-TESTS | Write PW19 (§6) in the new file `app/lib/arrangement/__tests__/peaks-worker-video.test.tsx`. `peaks-worker.test.ts` keeps the sketch rows; A may only append to it |
| A-TYPE | `npm run typecheck` rc 0 |
| A-LINT | `npm run lint` rc 0 |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/peaks-worker.test.ts app/lib/arrangement/__tests__/peaks-worker-video.test.tsx` plus the 8 covering files (§7). All pass |
| A-MUTANTS | On a scratch copy of A's tree (never in `store/`), `python3 -I b-round-314/unit-mutants.py <scratch>` prints the same red rows as `b-round-314/precheck-unit-mutants.txt`. Then A's own MU-VIDEO-BUFFER-BEFORE-PEAKS (§6) is red on PW19 |
| A-DOC | §5 items 4 and 5, in Georgian with technical terms in English. Cite only rows that exist (L26). Edit whole granted sections (L34) |
| A-REVIEW | Run `code-reviewer` on the changed files. Ask about: the `deliver` contract (no callback error reaches the scheduler or a caller), the cold-start flag, the moved `buffersRef.set` and its side effects (L49), the new `syncPlayback` dependency of the load effect, and the doc's accuracy. A Medium+ inside the grants is fixed and re-reviewed (L11). A §4 rule change is a STOP |

### 3.2 C's rows
C writes `c-round-315.md` and `c-round-315.json` as it goes, with the L57 fields:
- `assertsSpecified` = 9: PW9, PW13b, PW14, PW15, PW16, PW17, PW18, PW19, PW20;
- `mutantsRecorded` = 12: the 11 in `unit-mutants.py` plus A's MU-VIDEO-BUFFER-BEFORE-PEAKS;
- `mutantRedOnSketch` = 10 (MU-REPLIED-AFTER-FILTER is equivalent by design: the protocol cannot deliver a stale reply first; A's video mutant is not in the sketch).

Each finding carries an `origin`.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `sha256sum -c b-round-312/protected-sha256.txt` from `store/` | Exactly: M `app/contexts/ArrangementContext.tsx`, M `app/lib/arrangement/peaks.client.ts`, M `app/lib/arrangement/__tests__/peaks-worker.test.ts`, M doc 228, M doc 163, ?? `app/lib/arrangement/__tests__/peaks-worker-video.test.tsx`. Protected 11/11 OK |
| CLAIMS | Re-run `claims-315.sh` | Equals `claims-315-sketch-output.txt` except by design: K2 `6 abfcf78`; K9 the round-315 l.4; K10 `0 0`; K11 may grow by A's appended rows; K7 may also list the new video test file; K18 `11` (A's tree has no scratch `cacheDir`). K3–K6, K12–K17 and K19–K24 equal the sketch output |
| SKETCH-EQUAL | `cmp` the two app files with the `sketch-*.txt` copies; `diff b-round-314/sketch-peaks-worker.test.ts.txt app/lib/arrangement/__tests__/peaks-worker.test.ts` | The app files are equal. The test-file diff has only added lines (`>`), none removed or changed (§4.3) |
| UNIT | A-UNIT's file list on C's own scratch copy (own `cacheDir`); then `unit-mutants.py` on that scratch, plus A's video mutant, plus at least one mutant of C's own on `deliver` or the cold-start flag | All pass. Red rows equal `precheck-unit-mutants.txt`. Record C's own mutant |
| PK-LOAD | Browser, production build of A's tree, both viewports: load `/studio-lab` 3 times | Status reaches the demo ready text; 9 sources ready; the library preview wave draws; 0 page errors; exactly one peaks worker is constructed and it is not terminated (wrap `window.Worker` as `probe/cold-start.cjs` does, with the delay 0). The demo-synth worker terminates itself after its one reply, as at HEAD; that is expected |
| PK-COLD-START | Browser, both builds, each with its own build and port. **HEAD build:** `git -C /home/runner/czaba-project/store archive abfcf78 \| tar -x -C <scratch-head>`, symlink `node_modules`, give its `vite.config.ts` its own `cacheDir`, `npm run build`, then `PORT=<port> npx remix-serve build/server/index.js`; never touch `store/`. **A's tree:** a tar copy of `store/` built the same way (or the perf spec's own build). Run `node b-round-314/probe/cold-start.cjs http://127.0.0.1:<port> 4000 <out.json> <WxH>` with the first peaks reply held for 4,000 ms, at 1440×900; A's tree also at 1280×720 | HEAD: the peaks worker is terminated about 3 s after its creation (the old stall). A's tree: it is not terminated; every source still reaches ready; 0 page errors. Report each worker's created / first-reply / terminated times. Note: the probe's `firstReply` is the native arrival time, before the 4 s hold; the app sees the reply only after the hold (B's HEAD run: created 316, firstReply 377, terminated 3316) |
| PK-VIDEO-SOUND | Browser, A's tree, 1440×900: import a short local video that has an audio track (generate one with the browser's MediaRecorder or a committed-free fixture made at test time), press Play as soon as the clip appears, then wait | The video's own sound plays once its audio shows ready (Original sound audible: an AnalyserNode on the master or the existing meter shows non-zero level after ready); no page error. If the environment cannot produce a video with audio, write the reason under `notRunnableHere`; PW19 still covers the contract |
| PK-PERF-LOAD | Perf spec `perf/studio-lab.perf.spec.ts` on A's tree, **alone**, after a browser warm-up (L38), 1 run; then `python3 -I c-round-314/rowcmp.py c-round-314/perf-harness-1.json <run json>` | `failures` empty; `harness.loaf-scripts-live` ≥ 50; every `deterministic` row equals C round 314's run: 164/164, 0 differ, 0 extra (B's sketch run: the same [K24]). A differing row is reported with its id |
| DOC | Doc 228 l.4 byte for byte; the 7 TEMPLATE headings in order (L26); the granted sections against the code. Doc 163: its one "C-ის შემოწმება მოლოდინშია" sentence [K10] now reads "C round 314 PASS", and nothing else changed (`git diff` shows one changed line) | Doc 228 l.4 is `**სტატუსი:** Completed (C round 315 PASS)`; its TODO no longer lists PERF-5b as open and names where each signal went; each claimed test row exists |
| G315-AUTH | As G314-AUTH (copy `c-round-314/g314-auth.cjs`), **both viewports** | `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, build, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if PK-LOAD, PK-COLD-START, PK-PERF-LOAD and G315-AUTH all ran. PK-VIDEO-SOUND is wanted; when the environment cannot produce a video with an audio track, it goes under `"notRunnableHere"` with the reason, and it does not make `browserVerified` false.

## 4. Contract (D-29z847)

### 4.1 `app/lib/arrangement/peaks.client.ts`: exactly the sketch
- New export `PEAKS_WORKER_COLD_START_TIMEOUT_MS = 10_000`. `PEAKS_WORKER_STALL_TIMEOUT_MS` stays `3_000`.
- `workerReplied` is set on every parsed reply, before the job-id filter. `armStall` picks 3,000 ms once it is set, otherwise 10,000 ms. A worker is created at most once per computer (`workerFailed` stays true after a failure [K22]), so the flag needs no reset.
- `deliver(job, peaks)`: calls `job.onPeaks(peaks)`. If the callback throws, the error is rethrown from `window.setTimeout(..., 0)`. Nothing else catches or swallows it. `handleReply`, `deliverOnMainThread` and so the `failWorker` loop all use it; the abort checks stay where they are; `if (!active) startNext()` stays after the delivery.
- Peaks computation (`computePeaksOnMainThread`) stays outside the `try`: a failure to compute is not a callback error.

### 4.2 `app/contexts/ArrangementContext.tsx`: exactly the sketch hunks
- **Video call site** [K4]: `buffersRef.current.set(sourceId, buffer)` moves from before `requestSourcePeaks` into its callback, after the `signal.aborted || !videoSourcesRef.current.has(sourceId)` guard and before `setSourcePeaks`. The existing re-sync stays after it.
- **Collection call site** [K4]: the set moves the same way, after the `controller.signal.aborted` guard. After `settle(false)`, when `historyRef.current.present` has a clip with that `sourceId`, it calls `syncPlayback(present, undefined, true)`, the same call the video callback makes [K5].
- The load effect's dependency list gains `syncPlayback` [K5]. `syncPlayback` is stable: its only dependency is `startGraph`, whose three helpers have empty dependency lists [K6]. So the effect does not re-run and the collection does not reload.
- **L49, side effects of the moved call:** the only effect of `buffersRef.current.set` is to make the buffer visible to its three readers (graph build, library preview, export). It is kept, only later. No other line changes.

### 4.3 `app/lib/arrangement/__tests__/peaks-worker.test.ts`: the sketch rows
- PW9 rewritten (§1 ruling line);
- new rows PW13b, PW14, PW15, PW16, PW17, PW18 and PW20 as in the sketch;
- every other row byte-unchanged.

A may append rows; A changes no sketch row.

### 4.4 Unchanged
- `peaks.worker.ts`, `peaks.worker-protocol.ts`, `peaks.ts`;
- `perf/**` (no harness change; `budgets.json` stays);
- every other app file.

## 5. Grants
A edits only:
1. `app/lib/arrangement/peaks.client.ts`: §4.1.
2. `app/contexts/ArrangementContext.tsx`: §4.2.
3. `app/lib/arrangement/__tests__/peaks-worker.test.ts`: §4.3, append only after the sketch.
4. New file `app/lib/arrangement/__tests__/peaks-worker-video.test.tsx`: PW19 (§6).
5. Docs:
   - `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`:
     - l.4 exactly `**სტატუსი:** Completed (C round 315 PASS)` (L28);
     - the whole sections `## მიდგომა`, `## არქიტექტურა`, `## შეცვლილი ფაილები`, `## პრობლემები და გადაწყვეტები`, `## ტესტირება` and `## TODO / შემდეგი ნაბიჯები` (L34);
     - the batching premise and its closure (§0.1), the L1–L5 contracts, PW9/PW13b–PW20, and where each signal went;
     - the sentence "C-ის შემოწმება მოლოდინშია" is removed [K10];
     - `## არქიტექტურა` describes the two stall budgets and the `deliver` path; `## შეცვლილი ფაილები` lists the new test file.
   - `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`: only the one sentence "C-ის შემოწმება მოლოდინშია" in `## ტესტირება` [K10], replaced by "C round 314 PASS". Nothing else in doc 163.

**Nothing else:**
- no other `app/**` file;
- no `perf/**` file;
- not `package.json`, `biome.json`, `vite.config.ts`, `vitest.config.ts`, any Playwright config, or any protected file;
- no dependency change.

## 6. Specified test rows (L52)
| Assert | Red-proof |
|---|---|
| PW9 (after the first reply, fallback exactly at 3,000 ms; timer count 0) | MU-NEVER-REPLIED, MU-STALL-ONLY-AT-BEGIN |
| PW13b (`end` / `cancel` post throws → worker off, no stray timer; `end` still delivers byte-equal main-thread peaks) | MU-FAIL-KEEPS-TIMER |
| PW14 (no reply yet → no fallback at 3,000 or 9,999 ms; fallback at 10,000 ms) | MU-COLD-START-SAME |
| PW15 (each reply re-arms: 4 replies 2,999 ms apart do not fall back) | MU-STALL-ONLY-AT-BEGIN, MU-NEVER-REPLIED |
| PW16 (a throwing `onPeaks` in `handleReply`: the next job begins and delivers; the error surfaces on a timer) | MU-DELIVER-NO-CATCH, MU-DELIVER-SWALLOW, MU-DELIVER-SYNC-THROW |
| PW17 (worker `onerror` with two pending jobs, the first callback throws: both deliver, nothing throws synchronously, the error surfaces on a timer) | the same three |
| PW18 (context: a clip on a `loading` source is not started while peaks run; after `ready` the playing graph is re-synced and starts it) | MU-BUFFER-BEFORE-PEAKS, MU-NO-COLLECTION-RESYNC |
| PW20 (an empty buffer: delivered at once on the main thread, byte-equal to `computePeaks`, no Worker constructed) | MU-EMPTY-TO-WORKER |
| **PW19 (A writes, new file)** | **MU-VIDEO-BUFFER-BEFORE-PEAKS** (A's own: the video set moved back before `requestSourcePeaks`) |

**PW19 recipe.**
- **Setup.** Copy the mocks and fakes of `video-import-status-ui.test.tsx`: `video.client` with `probeVideoFile`/`decodeVideoAudio` as `vi.fn()`, `graph.client`'s `renderArrangementWav`, `mp3-encoder.client`, `@remix-run/react`. Use a fake peaks Worker in manual mode, the same shape as `FakePeaksWorker` in `peaks-worker.test.ts`. Use an `AudioContext` whose buffer sources record `start()` with their `buffer`, as PW18's `RecordingAudioContext` does.
- **Steps.**
  1. Mount with the empty collection and a video + music arrangement.
  2. `importVideoFiles([file])`; resolve the probe; let `decodeVideoAudio` resolve with `{ buffer }`.
  3. Before running the worker, assert:
     - the video source's `audio` is still `decoding`;
     - `sourcePeaks` lacks it;
     - after `togglePlayback()`, no started source has that buffer.
  4. Run the worker's posted messages.
  5. Assert:
     - `audio` is `ready`;
     - `sourcePeaks` has the source;
     - a started source has the buffer (the existing re-sync).
- **Why step 5 holds.** A video clip is scheduled like any clip: the schedule plan has no kind filter, and the graph looks its buffer up by `sourceId`, and `createArrangement` creates tracks unmuted [K23].
- **Red-proof.** MU-VIDEO-BUFFER-BEFORE-PEAKS must turn it red at step 3. If the import path cannot reach step 3 or step 5 in jsdom, that is a STOP with the observed state, not a weaker row.

## 7. A's order of work
1. A-CLAIMS.
2. A-APPLY.
3. A-TYPE and A-LINT.
4. Run the covering files on the sketch:
   - `peaks-worker.test.ts`, `clip-gain-waveform.test.tsx`, `content-colour-ui.test.tsx`, `clip-gain-pointer-preview.test.tsx`, `waveform-zoom.test.tsx`, `failed-source-refusal.test.tsx`, `video-import-status-ui.test.tsx`, `export-mp3.test.tsx`, all under `app/lib/arrangement/__tests__/`;
   - B's run: 8 files, 97/97 [K14] (`precheck-covering.log`).
5. Write PW19 and show its mutant red.
6. A-MUTANTS.
7. A-DOC.
8. A-REVIEW, fix inside the grants, re-review.
9. Write `a-round-315.md` with every row actually run.

## 8. Neighbouring behaviour at risk (C probes)
- **The load:** 9 sources, ready order (ready only after peaks, D-29z835), the library preview wave. A collection reload loop would show as repeated `loading` and is caught by PK-LOAD.
- **Playback restarts:** the new collection re-sync fires only when a clip uses a source that becomes ready while playing. `/studio-lab` starts with no clips [K20], so the demo load must show no graph restart. PK-PERF-LOAD's `play.*` rows and `harness.restart-live` cover it.
- **Video:** import, its sound, and the export refusal while audio is `decoding` [K21].
- **Auth:** purchased Studio protection (G315-AUTH).

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-315.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- `git apply` fails, or a change is needed outside §5;
- a covering test fails, or one runs above 50 % of its timeout (L11);
- PW19 cannot reach its step 3 or its step 5 in jsdom;
- a §4 contract would have to change (the two budgets, the timer rethrow, the moved set, the re-sync);
- the reviewer reports a Medium+ outside the grants.

## 10. Next, and requests (D-29z849)
- **After C PASS and the gate:** PERF-5 is done (5a + 5b). Root publishes the 6 paths.
- **Next round:**
  - **REGRESSION**, if the round-316 planning falls on or after **2026-11-05** [K15];
  - otherwise **PERF-7** (self-hosted fonts), after the performance-optimizer and tech-lead consults and B's own measurement.
- **RETRO:** at round 320.
- **Signals recorded (not scheduled):**
  - R314-PEAKS-COMMIT-COMPONENTS → PERF-10: 9 deliveries × 94 components per load (846). PERF-10's row is components per peaks delivery.
  - R314-DEMO-BUFFER-LONGTASK-6X → PERF-13 (with PERF2-STEREO-COPY): a 142–168 ms task at 6× just before the demo stems' buffers appear. Hypothesis, not confirmed: AudioBuffer creation and the channel copies in `loadDemoSource`. Attribution probe: `performance.mark`/`measure` around the buffer creation per source.
  - PERF2-FIRST-FRAME-LONGTASK (exists) → PERF-11. PERF-5's plan target "load long tasks > 50 ms = 0" is not met by PERF-5: the remaining 53–61 ms task at 1× is the first frame (no script over 5 ms), not peaks. PERF-5 closes on its own scope (main-thread peaks).
  - B-R314-EXPORT-LOADING-GATE (info): export has no gate for a collection source that is still `loading`; its clip is silently left out. Not reachable in `/studio-lab` today [K20]. Revisit at SRW-21-PLAN.
  - R313-FOLLOW-PAGE-TURN-COVERAGE → PERF-10 planning (§1).
- **For Saba (unchanged):** SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **For root (unchanged):** ROOT-REQ-VITEST-PERF-INCLUDE and ROOT-REQ-VERIFY-WORKER-TESTS. No new checkpoint request: one owner, small diff.
- **`lessons.md`:** unchanged. No new failure class this round.

## 11. Commit readiness
After C PASS and the gate, root publishes:
- M `ArrangementContext.tsx`, `peaks.client.ts`, `peaks-worker.test.ts`, docs 228 and 163;
- the new `peaks-worker-video.test.tsx`.

There is no deploy step.

## 12. Claims (L29 + L56)
Run `bash b-round-314/claims-315.sh` from the loop root. Outputs:
- `b-round-314/claims-315-head-output.txt`: HEAD at planning;
- `b-round-314/claims-315-sketch-output.txt`: `CLAIMS_STORE=/tmp/b315k`, the final sketch.

| Tag | Claim | Expected at planning (HEAD) | Sketch |
|---|---|---|---|
| K1 | gate 314 status, commit | `published abfcf78` | same |
| K2 | `git status` entries, HEAD | `0 abfcf78` | (none: the scratch has no git) |
| K3 | in `peaks.client.ts`: the 3,000 ms stall line; the 10,000 ms cold-start line; `job.onPeaks(` calls; `window.setTimeout(` calls | `1 0 2 1` | `1 1 1 2` |
| K4 | lines of `buffersRef.current.set(` \| lines of `requestSourcePeaks(buffer` in the context | `2506 3924 \| 2507 3925` (set before the request) | `2510 3928 \| 2506 3924` (set inside the callback) |
| K5 | `syncPlayback(present, undefined, true);` count; the old load-effect dependency line; the new one | `1 1 0` | `2 0 1` |
| K6 | dependency lists of `syncPlayback`, `startGraph` and its three helpers | `[startGraph], [fillLoopIterations,fillMetronomeHorizon,releaseRetiredGraphs], },[]); },[]); },[]);` | same |
| K7 | files naming the stall/cold-start constants or `createSourcePeaksComputer` | the context, `peaks-worker.test.ts`, `peaks.client.ts` | same (after A: plus the new video test file if it names them) |
| K8 | test files that stub `Worker` | 5 files (`sfx-export`, `demo-synth-worker`, `export-cancel`, `export-wav`, `peaks-worker`) | same |
| K9 | doc 228 l.4 | `**სტატუსი:** In Progress (stage 1 of 2; C round 314 PASS)` | same (after A: `Completed (C round 315 PASS)`) |
| K10 | "C-ის შემოწმება მოლოდინშია" in docs 228 and 163 | `1 1` | same (after A: `0 0`) |
| K11 | `it`/`it.each` lines and row ids in `peaks-worker.test.ts` | `16`, PW1…PW13 | `23`, plus PW13b, PW14–PW18, PW20 |
| K12 | probe per load: deliveries / commits from the first delivery / components per commit / gaps under 16 ms / long tasks overlapping a delivery→commit window / other long tasks after the first delivery | 1×: `9/9/94/3/[]/[]`, `9/9/94/3/[]/[]`, `9/9/94/2/[]/[]`; 6×: `9/9/94/0/[]/[168]`, `[151]`, `[142]` | — |
| K13 | unit mutants: 0-red lines; red lines; restored | — | `1 10 restored: 25 passed` |
| K14 | covering run \| full suite on the scratch | — | `Tests 97 passed (97) \| Test Files 235 passed (235) Tests 3502 passed (3502)` |
| K15 | last regression date | `2026-11-02` | same |
| K16 | round-314 archive equals the copy | `archive-equal-314` | same |
| K17 | every cited `b-round-314/` artifact exists (L56) | `done` | same |
| K18 | the 11 protected/config files | `11` | `10` (the scratch's own `cacheDir` in `vite.config.ts`) |
| K19 | last doc in quarter IV | `228-perf-peaks-worker.md` | same |
| K20 | `clips` in `routes/studio-lab.tsx`; line of the video decode call; line of the only video-source removal | `0 2621 2599` | same |
| K21 | `status !== 'ready'` checks; `audio === 'decoding'` export refusals; `renderArrangementWav(arrangement, buffersRef.current` calls | `3 2 3` | same |
| K22 | in `peaks.client.ts`: `workerFailed = true;` sites; the `if (workerFailed \|\|` guard; `const job = queue.shift();` (one job at a time); in the context: the graph-build `buffers: buffersRef.current,`; `buffersRef.current.delete` | `2 1 1 1 0` | same |
| K23 | `planSchedule`: `.filter(` calls and `kind` mentions (no kind filter); the graph's buffer lookup by `sourceId` in `graph.client.ts`; `mute: false` in `createArrangement` | `3 0 1 1` | same |
| K24 | B's perf run on the sketch: failures; row comparison with C round 314's run | — | `0 ref-det 164 run-det 164 equal 164 differ 0 [] extra []` |
