COMMIT: OK. Nothing blocks this commit. The cancel wiring is consistent on every path I traced, and no auth, purchase, cart or protected-download code is touched (`paths.txt` lists only arrangement/export files and the doc). The only downloads in the diff are the local Studio export anchors, and they now sit behind `signal.aborted` checks.

## Code Review: SRW-20 3b-1 — export cancel (round 90, HEAD eb1d0c0)

This reviews the diff only, not the whole modules. I read the diff, the 4 new files, the full `exportWav`/`exportMp3` bodies, `export-wav.client.ts`, the `encode()`/reset parts of `mp3-encoder.client.ts`, doc 078, `verify.log` (134 files and 2152 tests passed, `tsc` clean, build OK) and the reference files `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md`.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Cancelled render context is never released (Medium, can only be checked in a real browser)** — `graph.client.ts:530-541` and `:580-584`. After an abort, `resume()` is never called again, so `ctx.startRendering()` never finishes and the paused `OfflineAudioContext` stays alive with its render buffer. A 5-minute project at 48 kHz stereo is about 115 MB, plus the source graph. Doc 078 line 109 honestly labels whether Chromium frees this as unverified. Repeated cancel → export cycles could pile up memory, and no jsdom test can see that. **Fix:** add a heap check to C's CX-RENDER (Chrome DevTools memory snapshot after 3 cancel/export cycles). If memory grows, use the Alternative below.
2. **The Tab-order rules during a render changed on purpose** — `export-dialog-tab-stops.test.tsx:331-436`. TR1–TR5 were frozen, and their meaning has been rewritten. The format radio group is no longer the last stop and now uses native Tab; Cancel is the last stop. The rewrite is backed by B's grant (doc line 115). Record it in the gate as a deliberate change, not just "tests green". One consequence: wrap-around on the radio group as the last stop is no longer tested during a render, because Cancel is always present then.
3. **Holding Enter can close the dialog (Low, real-browser key timing)** — `ArrangementExportDialog.tsx:488-497` together with the focus effect at `:145-161`. Enter on Cancel removes the button and focus moves to „დახურვა“. If Enter is held, the repeated keydown then activates „დახურვა“ and the dialog closes, losing the cancelled status. **Fix (optional):** ignore `event.repeat` on the close button, or let C confirm in CX-KEYS that this is acceptable.
4. **Unused class** — `ArrangementExportDialog.tsx:493`: `disabled:opacity-40` sits on a button that is never disabled. Remove it, or leave it as an exact copy of the „დახურვა“ classes (doc line 53 says the copy is intentional).
5. **Export used only by tests** — `export-cancel.ts:13-17`: nothing in the app uses `isArrangementExportCancelledError`. Checking `signal.aborted` is the right design, because it also hides late errors that are not cancel errors. Either drop the predicate or keep it only for the tests.
6. **Doc status is out of date** — `078-…md:4` still says „C-ის შემოწმებას ელოდება“, but `c-round-90.json` is PASS. Update it before the commit.
7. **Lint result for the changed files is unconfirmed** — `verify.log` hides 199 of its 218 warnings, so I could not confirm the doc's claim that the changed files lint clean. Lint exited 0 and the warnings are repo-wide. Run `npx biome lint` on the 5 code files to confirm.

### Good Practices Found
- **One controller per run.** `finally` clears progress and the ref only while the ref still holds its own controller (`ArrangementContext.tsx:2742`, `:2947`). An old run cannot wipe a new export's progress.
- **Every `await` and `catch` is gated on `signal.aborted`, including the download step.** The only catch without a gate (`:2939`) wraps synchronous code, so a click cannot slip in. WAV + MP3 can never deliver just one of the two files.
- **No listener or timer leaks.** `raceArrangementExportAbort` removes its listener on all three exits and swallows the losing promise's rejection. The worker's handlers are set to `null` and the worker is terminated. `loadTimer` is cleared in `finally` (`:2874`). The encoder's `finally` uses `deleteFile(...).catch`, so cancelling in the `mp3` phase causes no unhandled rejection.
- **The encoder is reset exactly once.** Either the abort listener resets it (module already loaded) or `.then` does (import finishes after the abort).
- **GATE89-S1 fixed.** A `resume()` rejection now reaches the caller, so the dialog can no longer hang forever in „რენდერი“.
- **Accessibility.** `cancelled` is announced through `role="status"`, not `alert`. After cancel, focus goes to „დახურვა“ instead of `body`.
- **Tokens and render cost.** Only existing token classes (`border-outline`, `text-muted`, `ring-brand`) are used. `cancelExport` is stable (`[exportProgress]`), so the context value doesn't change identity and render-budget tests stay green.
- **TypeScript strict.** No `any`, no `as`, no ts-ignore. The `ArrangementExportPhase` union grew, and only the dialog checks phase values (grep confirmed).

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `ArrangementContext.tsx:549` (`exportAbortRef`), `:2960` (`cancelExport`), `:2978` (abort-on-unmount effect). These are added to the provider, which already holds about 280 lines of export orchestration (`:2674-2954`).
- **Signal 3 (one region changed expensively, round after round):** rounds 86–90 all changed this export region. Each time it needed provider, dialog and mock scaffolding; `export-cancel-ui.test.tsx` mocks three modules to test one button.
- **Keep for this round:** it is one lifecycle with no extra prop passing, the `useArrangement()` shape only gains a member, and audio timing and Undo/Redo are untouched.
- **Proposal for the planner (not approved scope):** after SRW-20 closes, one bounded task that moves `exportWav`/`exportMp3`/`cancelExport`/the abort ref into a `useArrangementExport` hook (or `lib/arrangement/export-orchestrator.ts`), with the dialog as its only consumer.
  - Acceptance: CU1–CU9, EC1–EC4 and TR1–TR6 pass unchanged, and the `useArrangement()` surface stays identical.
  - Doc 078 already queues this as „frontend-architect checkpoint q14“; attach this note there instead of opening a duplicate.

### Alternative Approach (Studio audio pipeline is critical logic)
- **Current:** after an abort, `resume()` is not called again. The context stays paused and is abandoned, and the UI updates immediately through the race. Cost: no further CPU, but memory may stay held until the page closes (unverified).
- **Alternative:** after an abort, stop or disconnect the scheduled sources and call `ctx.resume()`. The rest of the render is then silence, which renders fast, `startRendering()` finishes and the context can be garbage-collected. Plain `resume()` without disconnecting would burn up to about 95% of the render's CPU in the background. That works against R20-X4's "UI must not freeze" goal, so it is worse than either option.
- **Verdict:** the current approach is right for this round. It is the simplest and follows the no-freeze requirement. If C's heap measurement shows growth after cancels, switch to "disconnect + resume" as one bounded follow-up. That needs `applySchedule` to return its source handles, a change inside `graph.client.ts` only.

### Score: 8.5/10