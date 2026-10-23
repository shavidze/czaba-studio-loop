# CURRENT TASK — Round 103: WAV worker stall watchdog + worker error text, the mp3 pre-download cancel test, PU tests runnable alone (+ doc 090 status line)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-102.md` (exact copy of the round 102 task). Rationale: `b-round-102.md`. Decision record: D-29z68 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** three tightly related Lows in the export pipeline (one behaviour change, two test gaps) plus one doc status line. One owner (A). No component, context or route changes.
  1. **GATE89-S3 (Low, behaviour).** `export-wav.client.ts` has no watchdog. If the WAV worker never answers, the export stays in "rendering" until the user presses Cancel. Also, `fail()` drops the worker's own `{type:'error', message}` text and shows only the generic constant.
     - **Evidence:** `gates/round-89/review.md` #3 and the source at `b6c9716` (`export-wav.client.ts` l.41–65).
  2. **C-R90-MUT-B-CU4-GAP (Low, test gap).** In `exportMp3`, mutation b removes the `if (signal.aborted) return;` directly before the downloads (`ArrangementContext.tsx` l.2915–2917). No test turns red, because CU4 cancels *before* the encode settles, and the encode race catches that cancel first.
     - **Evidence:** `a-round-90.md` mutation table; `c-round-90.md` Return to B.
  3. **A-R87-LOW-PU-ORDER (Low, test gap).** In `export-progress-ui.test.tsx`, only the first PU4 opens `encoderImportGate`. So `npx vitest run … -t "PU2"` (or any MP3 PU test alone) hangs until the 15 s timeout.
     - **Evidence:** `a-round-87.md` code-reviewer Low.
     - The sibling file `export-cancel-ui.test.tsx` already solved the same problem (l.348–386): the closed-gate test sits in its own first `describe`, and the main `describe`'s `beforeEach` releases the gate.
  4. **GATE102-S5 (housekeeping):** doc 090 l.4 still says the round is waiting for C. C round 102 passed, and gate 102 published it at `b6c9716`.
- **Not in this round (still open, not deferred):**
  - **GATE96-S2**, the grid/tempo Lows, the marker Lows batch, and **GATE102-S2/S3/S4** (the Export dialog guard and type nits; see `b-round-102.md`).
  - **R21-I2**, and the SRW-21 mount with **SRW-21-PREMOUNT**. These need the auth owner's release.
  - **GATE102-S1** (Firefox/WebKit `aria-valuetext`) is environment-bound: only Chromium is installed. It is filed with GATE97-S2 and GATE101-S3.
- **Frozen this round:**
  - `ArrangementContext.tsx`, `export-wav.worker.ts`, `export-wav.ts`, `export-cancel.ts`, `graph.client.ts` and `ArrangementExportDialog.tsx`;
  - `mp3-encoder.client.ts` (protected), and every other app file;
  - every existing test file other than the three below.

## Why this round
- **C round 102: PASS.** `browserVerified=true`, `realVerified=true`, 0 bugs.
- **Gate 102: published.** Commit `b6c97166b74b48414c35b06314f85135d676f7ff` is on both remotes (reviewer 8.5/10, all findings Low or nit).
- **No C bug is open.** These three Lows are next in the published order (D-29z67: "Then the remaining Lows: GATE89-S3, C-R90-MUT-B-CU4-GAP and A-R87-LOW-PU-ORDER").
  - They share one pipeline (WAV encode, then MP3, then download) and its tests.
  - Only item 1 changes behaviour.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21, and B plans this on 2026-10-23: that is 2 days, and the rule needs 3.
  - **The next B planning on or after 2026-10-24 is the regression round, whatever this round leaves open.**
- **Why not new feature scope:** every SRW item FB-01..FB-16 is implemented and C-passed in the browser. What is left is one of these:
  - Tech Lead manual checks (external);
  - the SRW-21 purchased mount (auth owner's release);
  - T12 and VISUAL-A-OBSIDIAN, which start only after the original scope is confirmed done (user/root order).

  See `b-round-102.md` § "Why this scope".

## Baseline (measured by B, 2026-10-23)
- **HEAD `b6c97166b74b48414c35b06314f85135d676f7ff`** (gate 102 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-102-r103-tree-sha256.txt`, **532** entries.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts` (537), **except** the 5 owned files below.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-102-r103-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-102-r103-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/lib/arrangement/export-wav.client.ts` | `b56ca58e` | 75 | **owned** (T1). Keep the exported function's signature, the pre-abort check (l.16–18), the no-Worker fallback (l.19–21) and the constructor-catch message (l.28–30). |
  | `app/lib/arrangement/__tests__/export-wav.test.ts` | `e8d93132` | 456 | owned **append-only**: one new `describe` after the last line (l.456). Reuse its `FakeWorker` (l.49), `lastWorker`. |
  | `app/lib/arrangement/__tests__/export-cancel-ui.test.tsx` | `e850f4eb` | 658 | owned **append-only**: one new `describe` after l.658 (T2). Only if CU10 is kept (see T2). |
  | `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` | `4c47dfd4` | 539 | owned **structurally**, only in l.243–321 (T3). Every `it` body stays byte-identical. |
  | `docs/implementation/2026/quarter-IV/090-studio-export-focus-card-progress-once.md` | `53e116a2` | 71 | owned (l.4 only) |
  | `ArrangementContext.tsx`, `export-cancel.ts`, `export-wav.worker.ts` | `db7a477d`, `07826749`, `51cc32db` | — | reference only (frozen) |

  New file: `docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md`.
- **Expected end state:** `git status --short` = **5 M + 1 ??**: the four code/test files above that changed, doc 090, and the new doc 091.
  - If A drops CU10 under the T2 rule, the end state is **4 M + 1 ??**, and the cancel-ui file is unchanged.
  - Nothing else.
- **Protected (frozen, never edited; hashes as in round 102, re-checked by B at `b6c9716`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`)
  - `app/routes/api.studio-token.ts` (`13914809`)
  - `app/contexts/StudioContext.tsx` (`caa388e7`)
  - `app/utils/ffmpeg.ts` (`0995ae78`)
  - `app/components/ui/Modal.tsx` (`741c2341`)
  - `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`)
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`) and `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs and the fail-before in a scratch copy (`a-round-103/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. Mutation m6 edits `ArrangementContext.tsx` **only in scratch**.
  - Stop and report if anything does not match: a different HEAD, a dirty tree at the start, or a changed frozen file.

## 1. What changes (A)

Read the primitives first: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` and `studio-feature.md` (Studio audio), `ERROR_TAXONOMY.md` (error text; no new error code is required), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

### T1 — stall watchdog and worker error text (`export-wav.client.ts`)
- **New exports** (names per `AGENT_DISCOVERABLE_CODE.md`):
  - `ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS = 30_000`;
  - `ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE = 'WAV-ის ჩაწერა შეჩერდა — worker 30 წამი არ პასუხობს.'`
- **A stall timer, not a total-time cap (B decision):**
  - Start the timer once `worker.postMessage(...)` has returned without throwing.
  - **Every** message from the worker restarts it (`progress`, and also the terminal types before they clear it).
  - Clear it on `complete`, on an `error` message, on `onerror`, on `onmessageerror`, on abort, and when `postMessage` throws.
  - **When it fires:** remove the abort listener, null `onmessage`/`onerror`/`onmessageerror`, call `terminate()` once, and reject with `new Error(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE)`. A message that arrives later changes nothing.
  - **Why:** the worker posts at every whole percent, so on any real machine the gap between messages is far below 30 s, even for long projects. A total-time cap would wrongly fail a long project on a slow machine; a stall timer only fires when the worker is truly silent. Background-tab timer throttling can only make it fire *later*, never earlier.
- **Error text:**
  - A `{type:'error', message}` whose trimmed `message` is non-empty rejects with `` `${ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE} ${trimmed}` ``, e.g. `WAV-ის ჩაწერა ვერ მოხერხდა (worker). boom`. The constant stays a prefix, so EW5's substring `toThrow` stays green.
  - An empty or whitespace-only message, `onerror`, `onmessageerror`, a `postMessage` throw and a constructor throw reject with the **exact** constant, as today.
  - The text is rendered as a React text node in the existing `role="alert"` message, so there is no injection path. No length cap is needed this round.
- **Unchanged:**
  - The UI message composition stays in `ArrangementContext.tsx`: `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. ${error.message}` (WAV path l.2751–2754; MP3 render path l.2823–2826).
  - Progress clearing (`finally`) and the Cancel behaviour.
  - Do not touch `export-wav.worker.ts`.

### T2 — CU10: a cancel between the settled encode and the downloads (`export-cancel-ui.test.tsx`, append-only)
- **Append one new `describe` after l.658.** Use the same `beforeEach` as the main describe at l.382–386 (`cancelEncoderGate.release(); setUpCancelEnvironment();`) and `afterEach(tearDownCancelEnvironment)`. Reuse `pendingEncode`, `mountCancelDialog`, `chooseFormat`, `clickExport`, `flushAsync`, `live`, `downloads`, `CANCELLED_ENCODER` and `mp3Blob`.
- **CU10 steps:**
  1. Run WAV + MP3 (`both`) with `pendingEncode()` and reach `MP3_ENCODING_MESSAGE`, as CU4 does.
  2. Then, in one `act(async () => { encode.finish(mp3Blob); await Promise.resolve(); live(api).cancelExport(); })`, follow with `await flushAsync()`.
  3. Assert exactly: `downloads` is `[]`, `exportState` is `CANCELLED_ENCODER`, and `resetEncoderMock` was called once.
- **Why this ordering reaches l.2915 (B trace, ECMAScript job order, `export-cancel.ts` l.23–42):**
  - `finish` resolves the encode promise. Its reactions (the `work.catch` passthrough, then the race's `then`) run before the test's `await Promise.resolve()` continuation.
  - The race's `then` resolves the outer promise and queues `exportMp3`'s `await` continuation *after* the test's continuation.
  - So `cancelExport()` aborts after the race has settled, and before l.2914–2917 run. The race listener is already removed, so only the l.2915 check stops the downloads.
- **Keep-or-drop rule (honesty):** CU10 is kept **only if** mutation m6 (below) turns it red in **3/3** runs, and it is green unmutated in 3/3.
  - If the interleaving does not hold (m6 stays green), do **not** add the test and do not weaken it into something vacuous. Leave the file unchanged and report the trace.
  - B then closes C-R90-MUT-B-CU4-GAP by decision: l.2915 would be unreachable from the UI, because a user's click is a separate task.
  - Either outcome is acceptable; a vacuous test is not.

### T3 — PU tests runnable alone (`export-progress-ui.test.tsx`, l.243–321 only)
- Copy the cancel-ui pattern:
  1. **Module-level setup function.** Move the describe-level `downloads`, `renderedBlob` and `mp3Blob` constants (l.244–246) to module level, together with the `beforeEach` body (l.248–281) as a named function (e.g. `setUpProgressEnvironment`) and the `afterEach` body (l.283–285) as another (e.g. `tearDownProgressEnvironment`). Place them directly before the first describe.
  2. **A new first `describe`** holds **only** the first PU4 (`'PU4 the 120 s timer covers the encoder import, …'`). Its title says it runs first in this file, while the import gate is still closed (like CU3). It has `beforeEach(setUpProgressEnvironment)` and `afterEach(tearDownProgressEnvironment)`.
  3. **The existing `describe`** (same title and `{ timeout: 15_000 }`) keeps the other 7 `it` blocks in their current order. Its `beforeEach` first calls `encoderImportGate.release()`, then the setup function. Its `afterEach` calls the teardown function.
- Every `it` title and body stays byte-identical, and the test count stays **8**.
- No change outside l.243–321, apart from the moved constants and the two functions.
- `vitest.config` has no `sequence.shuffle`, so the file order of the two describes is deterministic. The cancel-ui file relies on the same thing.

### Tests for T1 — append to `app/lib/arrangement/__tests__/export-wav.test.ts` (no new test file)
- **One new `describe` ("EW8 stall watchdog and worker error text (GATE89-S3)") after l.456.**
  - Use `vi.stubGlobal('Worker', FakeWorker)` and `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })`.
  - In `afterEach`: `vi.useRealTimers()`, `FakeWorker.instances = []`, `vi.unstubAllGlobals()`.
- Track settlement with a flag set in `.then`/`.catch`. Advance time **only** with `await vi.advanceTimersByTimeAsync(ms)` (never the sync `advanceTimersByTime`), and read the flag only after that `await`, so the rejection reaction has run before the "still pending" or "rejected" check.
- Rules:
  - Assert exact values with `toBe`, `toEqual`, or `toThrow(new Error(exact))`.
  - Use no type assertions (including `as const`) and no `@ts-` directives.
- **The tests:**
  - **EW8a — a silent worker times out once.** Advance `STALL − 1` ms: still pending, `terminated` is 0. Advance 1 more ms: it rejects with exactly `ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE`, and `terminated` is 1. A later `emit({type:'complete', …})` leaves the outcome a rejection, with `terminated` still 1.
  - **EW8b — progress restarts the timer.**
    - Advance 20 000 ms, then `emit progress 0.5` (forwarded to `onProgress`).
    - Advance `STALL − 1` ms: still pending.
    - Advance 1 ms: it rejects with the stall message.
  - **EW8c — complete clears the timer.** `emit complete` before the timeout: it resolves. Then `vi.getTimerCount()` is 0, advancing 60 000 ms leaves `terminated` at 1, and nothing else happens.
  - **EW8d — abort clears the timer.** Abort mid-encode: it rejects cancelled. Then `vi.getTimerCount()` is 0, and after 60 000 ms `terminated` is still 1.
  - **EW8e — worker error text.**
    - `emit({type:'error', message:'  boom  '})` rejects with exactly `WAV-ის ჩაწერა ვერ მოხერხდა (worker). boom`.
    - `emit({type:'error', message:'   '})` rejects with exactly `ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE`.
    - `onerror` rejects with exactly the constant.
    - After each, `vi.getTimerCount()` is 0.
  - **EW8f — constants.** `ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS` is exactly `30000`, and the stalled message is exactly the string in T1.
- **Fail-before:** in scratch, run the extended file against the baseline snapshot `b56ca58e`. B expects:
  - EW8a, EW8b, EW8d, EW8e and EW8f **red**;
  - EW8c possibly green: the baseline has no timer, so `getTimerCount()` is already 0 and `terminated` stays 1;
  - EW1–EW7 green.

  Report the exact list and explain any difference.
- **Mutations (scratch only; record the red tests for each and for an unmutated control):**
  - **m1:** no timer is ever started → EW8a, EW8b red.
  - **m2:** progress does not restart the timer → EW8b red.
  - **m3:** `complete` does not clear the timer → EW8c red.
  - **m4:** abort does not clear the timer → EW8d red.
  - **m5:** the error message text is dropped (the baseline `fail()`) → EW8e red.
  - **m6** (only if CU10 is kept): in a scratch copy of `ArrangementContext.tsx`, delete l.2915–2917 → CU10 red. CU1–CU9 stay as they are.
  - **T3 proof:**
    - `npx vitest run <scratch>/export-progress-ui.test.tsx -t "PU2"` on the **baseline** test file is red (timeout).
    - On the new file it is green.
    - Same for `-t "PU1"`.

### Docs
- **Doc 090 l.4:** `**სტატუსი:** C PASS (Round 102), გამოქვეყნდა b6c9716 (D-29z67)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z68). Record:
  - why it is a stall timer and not a total cap;
  - the 30 s value and why it cannot fire on a healthy worker;
  - the error-text format;
  - CU10's ordering trace, or why it was dropped;
  - the PU split and that it copies the cancel-ui pattern.

### Checks A runs (speed rules)
- `npm run typecheck`
- `npm run lint`
- **Targeted vitest:**
  - write the list: `grep -rlE "export-wav\.client|export-wav'|mp3-encoder\.client|export-progress-ui|encodeArrangementWavOffMainThread" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-103/targeted-list.txt`;
  - run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-103/targeted-list.txt)`.
  - B's grep at `b6c9716` gives 9 files: collection-load-status, export-cancel-ui, export-cancel, export-dialog-hold-enter, export-mp3, export-progress-ui, export-wav-in-place, export-wav, mp3-encoder.
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** this round changes 5–6 files, so run it. Pass its Architecture note through verbatim.

## 2. Acceptance — what C checks (real Chromium)
**Setup for every browser row unless stated:**
- a fresh incognito context on `/studio-lab`, and Decline consent;
- focus the Middle East row and press **Enter** (one clip);
- open Export with a real click, then click the export button.

**Fault injection (C's own harness, not app code).** Use `page.addInitScript` to wrap `window.Worker`.
- **The stub:** when `String(url)` contains `export-wav.worker`, construct instead a module worker from a Blob URL whose body is the stub for the row:
  - **stall:** `self.onmessage = () => {};`
  - **error:** `self.onmessage = () => self.postMessage({ type: 'error', message: 'C-stub boom' });`
- **The wrapper records:** construction time (`performance.now()`), every message time, and the `terminate()` count.
- Other URLs pass through unchanged.
- `context.route` holding the worker module request is an acceptable alternative, if C shows it really intercepts the worker fetch.
- The app's timer, terminate, reject, state and UI paths all run for real. Only the worker's answer is simulated, and C states that in the report.

| ID | Steps | PASS when |
|---|---|---|
| **WD-STALL** (primary; 1280 and 1440) | Stall stub. Real WAV export. Wait. | <ul><li>The message `<p role="alert">` reads exactly `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა შეჩერდა — worker 30 წამი არ პასუხობს.` It appears 30 s ± 2 s after the stub worker was constructed (record the measured delay).</li><li>The progress bar and label are gone, Close is enabled, and Cancel is not rendered.</li><li>`terminate()` was called exactly once, and there are 0 downloads.</li><li>Before the 30 s, the status is still rendering, with the progress label showing the render/wav phase.</li><li>Take a screenshot.</li></ul> |
| **WD-CANCEL** (1280) | Stall stub. Export WAV, wait about 5 s after the worker is constructed, then click Cancel. Wait 35 s more. | <ul><li>**PASS condition: `terminate()` was called exactly once** in total, recorded 35 s after Cancel. This is the only browser-visible proof that abort cleared the timer: a late timer fire on an already-settled promise would show no second alert, only a second `terminate()`.</li><li>The cancelled message appears.</li><li>Neighbour check: no stall alert appears after 30 s; the status text stays the cancelled message, with 0 alerts.</li><li>There are 0 downloads.</li></ul> |
| **WD-ERRTEXT** (1280) | Error stub. Export WAV. | <ul><li>The alert reads exactly `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა ვერ მოხერხდა (worker). C-stub boom`.</li><li>`terminate()` was called once, and there are 0 downloads.</li><li>Close is enabled.</li></ul> |
| **WD-MP3** (1280) | Stall stub. Choose MP3 and export. | <ul><li>After about 30 s, the alert shows the same stall text (the MP3 render-error path).</li><li>No MP3 encoder load starts: no request to unpkg ffmpeg in this session, and no load-phase label.</li><li>There are 0 downloads.</li></ul> |
| **WD-SLOW** (false-positive guard; 1280) | No stub (the wrapper only records). Apply CDP `Emulation.setCPUThrottlingRate` `{rate: 6}`, then run a real WAV export. | <ul><li>Exactly one valid WAV downloads, and the done message is shown.</li><li>Record the wav-phase duration and the **largest gap** between worker messages. It must be < 30 000 ms; report the value.</li></ul> |
| **EXPORT-REG** | No stub. WAV at 1280 and 1440, and one MP3 at 1280. | <ul><li>WAV: exactly one download, a real WAV (RIFF/WAVE, PCM, 2 ch, 48 kHz, 24-bit, duration > 0, no NaN).</li><li>MP3: one file that decodes in Web Audio. If the CDN is unreachable, MP3 is BLOCKED (environment), not FAIL.</li><li>The done message and the progress phases are unchanged from round 102.</li></ul> |
| **CANCEL-REG** (1280, no stub) | Real WAV export, Cancel during the render phase; then a real MP3 export, Cancel in the mp3 phase. | The cancelled messages are unchanged (plain / encoder), with 0 downloads and Close focused. |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning and no pageerror. No non-noise console error, except the expected rejection log, if any, of the injected stall/error rows. Record any such log verbatim. |
| **G103-3** | anonymous, run alone, after all measurement rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **PU-ALONE** (offline) | In C's scratch: `npx vitest run …/export-progress-ui.test.tsx -t "PU2"`, `-t "PU1"` and `-t "PU3"`, with A's file and with the baseline snapshot `4c47dfd4`. | <ul><li>With A's file, each passes alone, well under 15 s.</li><li>With the baseline, at least `PU2` fails (timeout).</li><li>The whole file passes, with 8 tests and the same titles as the baseline.</li><li>Every `it` body is byte-identical to the baseline (C diffs them).</li></ul> |
| **AN-REVIEW** | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs m1, m3, m5 and (if CU10 is kept) m6 in its own scratch, and gets the same red tests.</li><li>CU10, if present, is green 3/3 unmutated.</li><li>Assertions are exact, and the added lines have no `as` and no `@ts-`.</li><li>The `export-wav.test.ts` and `export-cancel-ui.test.tsx` hunks are pure additions at the end.</li></ul> |
| **T103-TARGETED** | `npx vitest run $(cat a-round-103/targeted-list.txt)` | All pass. Record the files and test counts. C re-runs the grep from §1 and reports any missing file. |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `b6c9716`, with 5 M + 1 ?? (or 4 M + 1 ?? if CU10 was dropped).</li><li>The frozen list is 532/532, and A's end hashes match.</li><li>`export-wav.client.ts` keeps the exported function's signature.</li><li>`export-progress-ui.test.tsx` changes only inside l.243–321 (plus the moved constants and functions).</li><li>Doc 090 changes only at l.4.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- **A healthy export wrongly times out.** WD-SLOW checks this.
- **A late stall error overwrites a cancel.** WD-CANCEL checks this.
- **The MP3 path starts a load after a WAV-stage failure.** WD-MP3 checks this.
- The progress store not clearing after an error.
- Close staying disabled.
- PU/CU test isolation (a released gate leaking into the first PU4).

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A silent encoder fails the export after 30 s with a clear message | none consulted; Live's export internals are not a reference for a browser worker | — | CZABA's own robustness rule for its Web Worker encoder. No Ableton claim. | არ ეხება |
| The worker's own error text is shown | none consulted | — | CZABA's own error-reporting rule (`ERROR_TAXONOMY.md` spirit: say what failed) | არ ეხება |

## 4. Report (A)
Write `a-round-103.md` and `a-round-103-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the fail-before list and the mutation table (m1–m6, plus the T3 proof);
- the CU10 decision, with 3/3 evidence;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

A may also do a pre-edit/post-edit browser reproduction with the same Worker wrapper in `a-round-103/`. It is A's own check, not C's acceptance.

If you stop early, write a checkpoint with the next step.
