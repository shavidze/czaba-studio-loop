# CURRENT TASK — Round 90: SRW-20 stage 3b-1 — Cancel the Export in every phase, abort on unmount, reset the encoder after a failed conversion, and fail on a resume error (D-29z55)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-89.md` (exact copy, sha256 `23ef2b89…`). Rationale: `b-round-89.md`. Decision record: D-29z55 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage (SRW-20 stage 3b-1: Cancel) and one tightly related Medium from the gate-89 reviewer (GATE89-S1, in the same render function). One owner (A).

## Why this round
- **C round 89: PASS**, `browserVerified=true`, `realVerified=true`, at both viewports. R88-FOCUS-ESCAPE-RENDER is fixed: 9 valid trap runs, 76 valid presses, 0 escapes. No new bugs.
- **Gate 89: published.** Commit `eb1d0c0319b209a18751067348dcaf8dc5516fbf` is on both remotes. It holds rounds 87–89. Root verify: 132 files and 2122 tests pass; the build emits the worker chunk.
- **Stage 3a is done.** The round-87 rows, the round-88 footer and the round-89 trap all have C evidence and are published.
- **What is still open in SRW-20:** the Cancel part of R20-X4. Stage 3b brings it. The work is split into two parts, and nothing is dropped:
  - **3b-1 (this round):** Cancel in every phase, abort on unmount (A-R86-L2), reset the encoder after a failed conversion (A-R87-L5), and the gate-89 Medium GATE89-S1 (a rejected `resume()` leaves the render hanging).
  - **3b-2 (round 91):** the WAV + MP3 delivery note (GATE86-S2), the timeout "reload the page" text (R87-L-TIMEOUT-RELOAD-TEXT), and the gate-89 memory Medium GATE89-S2 (in-place clamp). The two strings are locked in frozen `export-mp3.test.tsx` l.53/l.64, so they need their own test grant.
- **Regression round:** due on or after 2026-10-24 (`regression-last.json` = 2026-10-21). Today is 2026-10-22, so not yet.

## Baseline (measured by B, 2026-10-22)
- **HEAD `eb1d0c0319b209a18751067348dcaf8dc5516fbf`.** `git status --short` is **empty** (clean tree).
- **Frozen list:** `../tmp/studio-real-loop/b-round-89-r90-tree-sha256.txt`, **505** entries, **505/505 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the five owned existing files below.
  - It includes the protected auth and route files, `Modal.tsx`, `ffmpeg.ts`, `StudioContext.tsx`, `mp3-encoder.client.ts` and every other export test.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-89-r90-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-89-r90-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/contexts/ArrangementContext.tsx` | `b83b5693` | 3281 | owned |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `41e4b11d` | 520 | owned |
  | `app/lib/arrangement/graph.client.ts` | `ba33aeeb` | 488 | owned |
  | `app/lib/arrangement/export-wav.client.ts` | `39975c69` | 59 | owned |
  | `app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx` | `0c224abd` | 457 | owned (TR1–TR5 only) |
  | `app/lib/arrangement/mp3-encoder.client.ts` | `ddb70919` | — | frozen, reference |
  | `export-dialog-focus.test.tsx` / `export-dialog-footer.test.tsx` / `export-progress-ui.test.tsx` / `export-mp3.test.tsx` / `export-wav.test.ts` | `ac53f685` / `5d6d30e4` / `0705cc16` / `86d5ddee` / `e8d93132` | — | frozen, reference (harnesses to copy) |

- **Protected:** never touch the auth files, `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `Modal.tsx` (`741c2341`) or `mp3-encoder.client.ts` (`ddb70919`; it already has `resetArrangementMp3Encoder`, which is all this round needs).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-90/mut/`), never in `store/`. Do not symlink a scratch `node_modules` in a way that writes into `store/node_modules/.vite` (round-89 housekeeping note). Set `cacheDir` to the scratch folder or use `--no-cache`.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### C1 — new module `app/lib/arrangement/export-cancel.ts`
Export exactly these names. No `any`, no assertions.
- `ARRANGEMENT_EXPORT_CANCELLED_MESSAGE` = `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`
- `ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE` = `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.`
- `class ArrangementExportCancelledError extends Error`: `name = 'ArrangementExportCancelledError'`, default message `Export cancelled`.
- `isArrangementExportCancelledError(error: unknown): error is ArrangementExportCancelledError`
- `raceArrangementExportAbort<T>(work: Promise<T>, signal?: AbortSignal): Promise<T>` behaves as follows:
  - With no signal, it returns `work` unchanged.
  - With an already-aborted signal, it rejects with `ArrangementExportCancelledError`.
  - Otherwise it settles like `work`, or rejects with `ArrangementExportCancelledError` as soon as the signal aborts, whichever comes first.
  - It removes its abort listener once it settles.
  - It attaches a no-op catch to `work`, so a late rejection is not an unhandled rejection.

### C2 — `graph.client.ts`: the render honours a signal, and a resume error fails the render
- `ArrangementRenderOptions` gains an optional `signal?: AbortSignal`. Every existing caller keeps compiling and behaving the same.
- In `renderArrangementWav`:
  - If `signal?.aborted` at entry, reject with `ArrangementExportCancelledError` **before** constructing an `OfflineAudioContext`.
  - Schedule suspend points when `onProgress` **or** `signal` is given.
  - At a suspend point with `signal.aborted`, do **not** call `ctx.resume()`. The context stays suspended and is dropped.
  - `startRendering()` is raced against the abort (`raceArrangementExportAbort`).
  - **GATE89-S1:** a rejected `ctx.resume()` must reject `renderArrangementWav` with that error. Today `.catch(() => undefined)` swallows it and the dialog stays stuck in a render with Close disabled. A rejected `suspend()` stays ignored, as today.
  - Pass the signal to `encodeArrangementWavOffMainThread`.
- **Honest limitation (write it in doc 078):**
  - Cancel takes effect at the next suspend point, at most 1/20 of the render length.
  - Where `suspend` is missing (Firefox) the render runs to its end in the background and the result is discarded.
  - In both cases the UI state is immediate and no file is created.
  - Whether Chromium frees a suspended-and-dropped `OfflineAudioContext` render buffer before page unload is **unverified**. Record it as a hypothesis, not a fact.

### C3 — `export-wav.client.ts`: the worker honours a signal
`encodeArrangementWavOffMainThread(channels, sampleRate, onProgress?, signal?)`:
- If the signal is already aborted, reject with `ArrangementExportCancelledError` and construct **no** Worker.
- If the signal aborts while the worker runs, call `worker.terminate()` and reject with `ArrangementExportCancelledError`. A later worker message is ignored.
- Remove the abort listener on every terminal path (complete, fail, abort).
- The no-Worker fallback checks the signal before it encodes.
- Every existing path, message and the transfer list stay byte-identical.

### C4 — `ArrangementContext.tsx`: `cancelExport`, a run token, abort on unmount, and the L5 reset
- **Types and value:**
  - `ArrangementExportPhase` gains `'cancelled'`.
  - The context value and interface gain `cancelExport: () => void`.
- **Run token:** add `exportAbortRef = useRef<AbortController | null>(null)`. `exportWav` and `exportMp3`, right where they set the `rendering` state:
  - abort any previous controller;
  - create a new controller, store it in the ref, and pass `signal` in `renderOptions`.
- **After every `await`** in both exports:
  - if `signal.aborted`, return without `setExportState` and without any download;
  - this includes the `catch` blocks, so **cancelled always wins over a later error**;
  - the abort check sits immediately before the anchor/download loop, so a WAV + MP3 export never delivers one file of two.
- **`finally`:** clear the progress and the ref **only** if `exportAbortRef.current === controller`. A cancelled run must not clear the progress of a newer export.
- **`cancelExport()`:**
  - If there is no controller or it is already aborted, do nothing.
  - Otherwise, read `exportProgress.getProgress()?.phase` first. Then abort, set the ref to `null` and clear the progress.
  - Then `setExportState({ phase: 'cancelled', message })`. `message` is `ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE` when the phase read was `'load'` or `'mp3'`, and `ARRANGEMENT_EXPORT_CANCELLED_MESSAGE` otherwise.
- **Encoder on abort, in `exportMp3`:** from the moment it enters the load phase until `encode` settles, an abort calls `resetArrangementMp3Encoder()` **exactly once**.
  - If the module is already imported, reset at the moment of the abort.
  - If the import resolves after the abort, the import's `.then` resets it and returns `null` (the same as the timeout path).
  - The load-failure `catch` must not reset a second time after a cancel.
  - A cancel during the **render** phase of an MP3 export does not reset the encoder. A cached encoder from an earlier export stays.
- **Load race:** race the load against the abort as well, so a cancel during a hanging import or load ends the export at once.
- **Unmount (A-R86-L2):** the provider's unmount cleanup calls `exportAbortRef.current?.abort()`. That stops the render, the worker or the encoder (through the listener above). It downloads nothing and writes no state.
- **L5 (A-R87-L5):** when `encoder.encode` rejects (not a cancel), call `encoderSlot.module?.resetArrangementMp3Encoder()` before writing the existing conversion-failure message. B checked: frozen PU2 and MX7 assert nothing about the reset count after a conversion failure.
- **Nothing else changes.** All existing messages, the 120 s timeout, file names, guards and the order of state writes in the successful paths stay exactly the same.

### C5 — `ArrangementExportDialog.tsx`: the Cancel button
- **When rendering:** render one more button in the footer button row, **before** დახურვა:
  - `type="button"`, `data-testid="arrangement-export-cancel"`, text `გაუქმება`, `onClick={cancelExport}`;
  - the same classes as დახურვა (no new colours).
  - It exists **only** while `isRendering`.
- **Status message:** in the `cancelled` phase it keeps `role="status"` (not `alert`) and gets `text-muted`.
- **Unchanged:**
  - Escape and დახურვა do nothing during a render (`handleClose` early return). That is the chosen contract: Escape does not cancel, and the explicit button does.
  - The initial-focus effect stays as it is. During a render, focus goes to the trap wrapper and does **not** jump to Cancel; frozen focus l.428 pins this.
  - After a cancel, the Cancel button disappears and the existing effect moves focus to დახურვა.
  - Format radios stay enabled during a render (D-29z52).
  - The Tab handler, selector, footer guard, texts and layout stay the same.
- **Resulting Tab contract during a render:** the stops are [X], [format group], [Cancel].
  - Tab from X → checked radio (native).
  - Tab from the checked radio → Cancel (native, not prevented).
  - Tab from Cancel → X (prevented, wrap).
  - Shift+Tab from X or from the trap wrapper → Cancel (prevented).
  - Shift+Tab from Cancel → checked radio (native).

### Docs
- New `docs/implementation/2026/quarter-IV/078-studio-lab-export-cancel.md`, written per `docs/implementation/TEMPLATE.md` (Georgian; every section).
  - Status line: `**სტატუსი:** Round 90 — C-ის შემოწმებას ელოდება (D-29z55)`.
  - It records:
    - the phase mechanics: render suspend, worker terminate, encoder reset;
    - the limitation in C2;
    - Escape does not cancel;
    - GATE89-S1 and L5;
    - 3b-2 as the next step.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/lib/arrangement/export-cancel.ts` | **new** (C1) |
| `app/lib/arrangement/graph.client.ts` | C2 only: `ArrangementRenderOptions`, `scheduleArrangementRenderProgress`, `renderArrangementWav` |
| `app/lib/arrangement/export-wav.client.ts` | C3 only |
| `app/contexts/ArrangementContext.tsx` | C4 only: export types, `exportAbortRef`, `exportWav`, `exportMp3`, `cancelExport`, the unmount cleanup, the value object and interface |
| `app/components/arrangement/ArrangementExportDialog.tsx` | C5 only |
| `app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx` | **TR1–TR5** titles and bodies, amended as in §1 Tests below, plus any small helper they need (e.g. `cancelButton(dialog)`). The TS1, TS2 and TR6 test bodies stay byte-identical |
| `app/lib/arrangement/__tests__/export-cancel.test.ts` | **new** |
| `app/lib/arrangement/__tests__/export-cancel-ui.test.tsx` | **new** |
| `docs/implementation/2026/quarter-IV/078-studio-lab-export-cancel.md` | **new** |

**Expected end state: 5 M + 4 ??**, and all 505 frozen entries unchanged.
- If any frozen test turns red, **stop and report**; do not edit it.
- B walked the frozen tests against C1–C5 and expects all of them to stay green:
  - **focus l.428:** focus stays on the trap during a render; Tab from the trap goes to X (first stop).
  - **focus l.458:** a focused format radio keeps focus.
  - **focus l.480 and l.531:** these are idle tests, and nothing changes in idle.
  - **footer FT2:** the busy button's parent is still the button row.
  - **PU1–PU5:** the options object only gains `signal`; reset counts are unchanged without a cancel.
  - **MX1–MX7 and MP-***: messages are unchanged.
  - **export-wav tests:** a 3-argument call is unchanged.

### Required tests (IDs for C to cite)
- **`export-cancel.test.ts`** (unit; fakes copied from `export-wav.test.ts`, never imported from a test file):
  - **EC1 `raceArrangementExportAbort`:** no signal → the same promise result; pre-aborted → cancelled error; abort mid-flight → cancelled error even though `work` resolves later; `work` rejects first → that error; the listener is removed after settle (spy on `removeEventListener`); a late `work` rejection after an abort raises no unhandled rejection.
  - **EC2 render abort:**
    - pre-aborted signal → rejects cancelled, and the `OfflineAudioContext` constructor is not called;
    - abort before the first suspend resolves → `resume` is never called after that point, and the promise rejects cancelled;
    - abort after `startRendering` resolved but before the worker → no Worker is constructed.
  - **EC3 GATE89-S1:** a fake context whose `resume()` rejects with `Error('resume failed')` → `renderArrangementWav` rejects with that message, within the test (no hang). A rejected `suspend()` alone still renders.
  - **EC4 worker abort:**
    - pre-aborted → no Worker constructed;
    - abort mid-encode → `terminate` called once, rejects cancelled, and a later `complete` message changes nothing;
    - the listener is removed on complete;
    - a 3-argument call behaves exactly as before.
- **`export-cancel-ui.test.tsx`** (provider + dialog; mount and mocks copied from `export-progress-ui.test.tsx`, with `renderArrangementWav` and `mp3-encoder.client` mocked and the mock capturing `options.signal`):
  - **CU1 render-phase cancel, WAV:**
    - The Cancel button exists only while rendering.
    - Click → state `{ phase: 'cancelled', message: ARRANGEMENT_EXPORT_CANCELLED_MESSAGE }`, `role="status"`, progress `null`, Cancel gone, დახურვა enabled and focused, and the captured signal is aborted.
    - Then resolve the mock render late → 0 downloads and the state is still cancelled.
  - **CU2 cancelled wins over a late error:** cancel, then reject the mock render → the state is still cancelled, not an error.
  - **CU3 load-phase cancel, MP3:**
    - Use the import gate or a hanging `loadArrangementMp3Encoder`. Cancel → the encoder message and `resetEncoderMock` called **exactly once**.
    - Releasing the gate or load later adds no reset, no `encode` and no download.
    - The next MP3 export loads again and downloads `czaba-studio-lab.mp3` with the exact MP3 done message.
  - **CU4 mp3-phase cancel, WAV + MP3:** `encode` pending → Cancel → the encoder message and reset once. Resolving `encode` later → **0 downloads** (no `.wav` either).
  - **CU5 render-phase cancel of an MP3 export:** the plain message, and `resetEncoderMock` **not** called.
  - **CU6 new export after a cancel:** cancel, start a new WAV export at once, then settle the **old** mock render → the new export's progress is not cleared and the old run writes nothing. The new export completes normally.
  - **CU7 unmount:** unmount the provider during the mp3 phase → the signal is aborted, reset once, and resolving `encode` later gives 0 downloads and no React warning. Repeat during the render phase (signal aborted, 0 downloads).
  - **CU8 L5:** `encode` rejects → `resetEncoderMock` once, plus the unchanged conversion-failure message. The next MP3 export loads again.
  - **CU9 keyboard:** jsdom does not move focus on Tab, so dispatch `keydown`. During a render the focusable list is [X, wav, mp3, both, Cancel]. Enter or click on the focused Cancel → focus on დახურვა. Escape during a render leaves the export running (no cancel).
- **`export-dialog-tab-stops.test.tsx` amendments (TR1–TR5 only):**
  - **TR1** (WAV checked): Tab from `format-wav` and from the unchecked `format-mp3` is **not** prevented. Tab from Cancel is prevented and goes to X.
  - **TR2** (MP3 checked): Tab from `format-mp3` is not prevented. Tab from Cancel → X.
  - **TR3** (WAV + MP3 checked): Tab from `format-both` is not prevented. Tab from Cancel → X.
  - **TR4:** Shift+Tab from X and from the trap wrapper → Cancel (prevented).
  - **TR5:** keep the existing checks, and add "Shift+Tab from Cancel is not prevented".
  - Update the test titles to match. TS1, TS2 and TR6 stay byte-identical.

**Mutation proofs** (scratch copy; each must turn at least one listed test red):

| ID | Mutation | Expected red |
|---|---|---|
| a | `cancelExport` sets the state but does not abort | CU1, CU3 |
| b | no `signal.aborted` check before downloads | CU1, CU4 |
| c | the suspend point always resumes | EC2 |
| d | the worker ignores the signal | EC4 |
| e | no encoder reset on abort | CU3, CU4 |
| f | the load `catch` writes its error after a cancel | CU2 or CU3 |
| g | `finally` clears the progress unconditionally | CU6 |
| h | no unmount abort | CU7 |
| i | L5 reset removed | CU8 |
| j | resume rejection swallowed again | EC3 |
| k | Cancel rendered outside a render | CU1 |
| l | Tab trap reverted to the round-89 two-stop expectation | TR1, TR4 |

## 2. Pre-flight for A
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md` (new exports), `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md` + `TAILWIND_FIRST.md` (a button), `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
- **Prompts:** `studio-feature.md`, `new-test.md`.
- **Verify the baseline before the first edit:** HEAD; clean status; frozen 505/505; the snapshots; LF/CR.
- **Checks (speed rules):**
  - Run `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the owned code files (no `--write`).
  - **Targeted vitest:** every file in `a-round-89/targeted-list.txt`, plus the two new files, plus every test that imports `graph.client`, `export-wav.client` or `export-cancel` (grep).
  - Write the list to `a-round-90/targeted-list.txt`. Do not run the full suite.
- **A's own Playwright smoke at 1280×720 and 1440×900** (not C evidence): 5M WAV, cancel in the render phase; 5M MP3, cancel in the mp3 phase; record the message, downloads and focus.
- **Code-reviewer: required** (9 files). Pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table.
- **C** owns `c-round-90*`.
- **B** owns the planning artifacts.
- **Root** owns gates, commits and pushes.
- **Protected (never edited):**
  - `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`;
  - the auth files: `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`, `app/types/auth.ts`;
  - for this loop: `app/contexts/StudioContext.tsx`, `app/utils/ffmpeg.ts`, `app/components/ui/Modal.tsx` and `app/lib/arrangement/mp3-encoder.client.ts`.
- **`/studio-lab`** stays the public **demo-only** workspace:
  - it shows the demo badge;
  - it has no purchased audio and makes no token/R2 requests;
  - its only third-party requests are to the unpkg ffmpeg core, after an MP3 click;
  - user video stays local.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Cancel during an export | Live 12 Reference Manual, "Managing Files and Sets" §5.1.3.5 Real-Time Rendering, `https://www.ableton.com/en/live-manual/12/managing-files-and-sets/`. B fetched it on 2026-10-22 and stored it as untrusted text: `b-round-84/web/managing-files.txt` l.281 | The Cancel button "stop[s] the process completely and delete[s] any partially rendered file". **Confirmed for real-time rendering only.** | CZABA offers Cancel in every offline phase and never writes a partial file: no download happens before the last phase. Whether Live's **offline** render has a Cancel is **unconfirmed** (not stated in §5.1.3.4/5.1.3.5), so B makes no claim that "Live cancels offline exports the same way" | CX-RENDER, CX-LOAD, CX-MP3, CX-BOTH: match status = **unconfirmed** for offline; **confirmed** only for "Cancel deletes partial output" |
| Progress bar while exporting | same manual, §5.1.3.4 l.248 and §5.1.3.5 | A progress bar in the dialog for video and real-time rendering | Carried from round 87 (`tasks/round-87.md` §4) | not re-checked |
| Escape during an export | none found | — | **CZABA contract:** Escape does nothing during a render; only the button cancels. This prevents an accidental cancel. It is not an Ableton claim | CX-ESC |
| Encoder reload after a cancel | not applicable (CZABA's ffmpeg.wasm) | — | A cancel in the load or mp3 phase terminates the encoder, so the next MP3 fetches the core again. The message says so | CX-LOAD, CX-MP3, PX-NET |

## 5. C acceptance (real browser, Playwright Chromium, **both 1440×900 and 1280×720** unless the row says otherwise, `/studio-lab` anonymous)

**Setup:**
- Check `env-status.json` and that `:5173` returns 200. Do one warm-up load.
- Use the round-88/89 demo setup.
  - **5M** = click the music clip, then press Ctrl+D twice (`05:04.406`).
  - **10M** = click the music clip, then press Ctrl+D five times (≈ 10:08). Use it only if a render-phase click cannot land on 5M. If the 10M tab runs out of memory, record it as GATE89-S2 evidence (extra float copy, 3b-2), not a round-90 FAIL.
- **HR-PHASE:** a Cancel click counts only if the progress label just before the click shows the named phase:

  | Phase | Label |
  |---|---|
  | render | `რენდერი · N%` with N < 100 |
  | wav | `WAV-ის ჩაწერა · N%` |
  | load | `MP3 encoder-ის ჩატვირთვა…` |
  | mp3 | `MP3-ის შექმნა · N%` |

  Record the label per click. A click that lands in another phase is harness-invalid, not a FAIL. The budget per row is three valid attempts plus two extra.
- **Downloads:** listen for downloads for **15 s** after every cancel (longer than the 7.5 s conversion).

| ID | Action | Pass evidence |
|---|---|---|
| CX-RENDER (primary) | 5M (or 10M), WAV, Export; Cancel in the **render** phase | Within 500 ms the footer status reads exactly `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.` (`role="status"`, not `alert`). `<progress>` and label are gone, Cancel is gone, დახურვა is enabled, and the Export button reads `WAV-ის ექსპორტი` and is enabled. **0 downloads** in 15 s. Then Export again → one `.wav`: RIFF, 24-bit/48k/2ch, frames `ceil(304.406 × 48000)` for 5M, and the exact WAV done message |
| CX-WAVPHASE | Same, with Cancel in the **wav** phase | Same evidence as CX-RENDER. If no valid click lands in 5 attempts on 5M or 10M, report **not reachable** with the label timeline. That is not a FAIL; unit EC4 covers the worker |
| CX-LOAD | Fresh page, 5M, MP3. Route `unpkg.com` so that it **never responds**, Export, Cancel in the **load** phase | Exact status `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.` 0 downloads in 15 s, no `alert`. Then remove the route and export MP3 again → one `.mp3` that decodes to 304.406 ± 0.1 s, with the exact MP3 done message. The core is fetched again from unpkg (expected) |
| CX-MP3 | 5M, MP3 (encoder loaded or loading), Cancel in the **mp3** phase | The encoder message, 0 downloads in 15 s, and the next MP3 export succeeds (`.mp3`, exact message). Record the cancel's `MP3-ის შექმნა · N%` |
| CX-BOTH (1440) | 5M, WAV + MP3, Cancel in the **mp3** phase | The encoder message, and **neither** `.wav` **nor** `.mp3` in 15 s |
| CX-MP3-RENDER (1440) | MP3 after a completed MP3 in the same page (encoder cached), Cancel in the **render** phase | The **plain** message (no encoder sentence). The next MP3 makes **no** new unpkg request (the cached encoder is kept) and succeeds |
| CX-KEYS | Keyboard only: open Export, Tab to the export button, Enter, during the render Tab to Cancel, Enter (HR-RENDERING per press; use 10M if 5M ends first) | The cancelled message; `document.activeElement` is დახურვა; then Escape closes the dialog and focus returns to the toolbar Export |
| TRAP-CANCEL | Fresh page, 5M, WAV, keyboard start; during the render Tab ×6, then Shift+Tab ×4 (HR-RENDERING from round 89: the busy button reads `მიმდინარეობს…` before and after each press) | Never outside the dialog. Tab sequence: (trap wrapper →) X → `format-wav` → Cancel → X → `format-wav` → Cancel. Shift+Tab from X → Cancel; from Cancel → `format-wav`. Do not press Enter on Cancel here; the export completes and `.wav` downloads |
| CX-ESC | 5M WAV; during the render press Escape twice | The dialog stays open and the export completes with the normal done message and one `.wav` (Escape does not cancel) |
| CX-UNMOUNT | Warm up `/` once in a separate context first (ENV-VITE-REOPTIMIZE-RELOAD: a first visit of a non-lab route can reload every tab). 5M MP3; in the **mp3** phase set `window.__cx = 1`, then DOM-click `[data-testid="arrangement-exit"]` with `element.click()` (a client navigation; it sits behind the modal) | The URL leaves `/studio-lab` **and `window.__cx === 1` afterwards** (no full reload; otherwise the attempt is harness-invalid). **0 downloads** in 15 s. No non-noise console error. Repeat once in the **render** phase of a WAV export: 0 downloads |
| CX-DONE-REG | One complete 5M WAV and one complete MP3 without a cancel | The done messages and files are as in rounds 87/89. No Cancel button after done. Focus stays inside |
| PX-NET | All sessions | No unpkg request before the first MP3 click. Then only `ffmpeg-core.js`/`.wasm`, **including the expected re-fetch after a load/mp3 cancel**. Workers are same-origin. 0 studio-token / R2 / download requests and 0 auth headers |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning and no non-noise console error |
| G90-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace. `/api/studio-token?…` anonymous → 401. The header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T90-TARGETED | A's `a-round-90/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD `eb1d0c0`; 5 M + 4 ??; frozen 505/505; A's end hashes; `Modal.tsx` = `741c2341`; `ffmpeg.ts` = `0995ae78`; StudioContext `caa388e7`; `mp3-encoder.client.ts` `ddb70919` |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production bundle (PROD-MP3-UNVERIFIED).
- **Not browser-reachable** (unit only; say so, not PASS): GATE89-S1 (a rejected `resume()`), L5 (a failed conversion), and the no-`suspend` fallback.
- **Ableton match:** report per §4, with offline Cancel as **unconfirmed**.
- **Neighbour behaviour that could break:**
  - the frozen focus rules (initial Close, focus to Close at render end, a radio keeps focus);
  - the sticky footer (VIS rows of round 88: one VIS-RENDER sample at 1280 is enough, with Cancel in the row);
  - the 120 s timeout message;
  - CDN failure;
  - range export file names;
  - the overload warning after done.
- **Known and intended (not new bugs):**
  - Escape does not cancel;
  - the encoder reloads after a load/mp3 cancel;
  - a render-phase cancel stops the CPU at the next suspend point;
  - the WAV + MP3 note and the timeout text change in 3b-2;
  - the headless `<progress>` colour (R87-T).

## 6. After this round
- **If C PASS:** the Cancel part of R20-X4 is C-verified. Round 91 is 3b-2, unless planning falls on or after **2026-10-24**; then round 91 is the regression round and 3b-2 follows it.
- **SRW-20 boundary:** after 3b-2, B asks root for the bounded frontend-architect checkpoint q14 (export orchestration, dialog focus hook, export-cancel placement). It is non-blocking.
- **Then:** the Lows batch → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- **Architecture:** the gate-89 reviewer note (move export orchestration into `lib/arrangement/export-orchestration.ts`) is merged into ARCH-EXPORT-MP3-ORCHESTRATION / q14. Do not extract it in this round; C4 adds the abort to the existing functions.
