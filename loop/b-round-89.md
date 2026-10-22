# B round 89: review of round 89 → round 90 task (D-29z55)

Dispatcher: B · Date: 2026-10-22 · Advisor: **available and consulted** before I wrote anything. I followed its advice:
- I granted the round-89 TR1–TR5 amendments; without them A would have to stop on red frozen tests.
- Cancel is an extra button that exists only during a render.
- A run token makes a cancel win over any later result.
- I added the `cancelled` phase with `role="status"`.
- I added the HR-PHASE harness rule.
- PX-NET now expects the encoder re-fetch after a cancel.
- The Ableton row marks offline Cancel as unconfirmed.
- I read the gate-89 review.

## Inputs read
- **Round 89 files:** `current-task.md` (archived unchanged as `tasks/round-89.md`, sha256 `23ef2b89…`, identical), `a-round-89.md`, `c-round-89.md`, `c-round-89.json`.
- **Gates and environment:** `gates/gate-round-89.json` (**published**, commit `eb1d0c0`), `gates/round-89/review.md` and `verify.log`, `env-status.json` (store 200), `regression-last.json` (2026-10-21).
- **Order:** `context/active-summary.md` and `context/active-backlog.json` first. I read `backlog.json`, `feature-status.md` and `plan.md` by ID only.
- **App source (read only, to write the contract):** `ArrangementContext.tsx` (`exportWav`/`exportMp3`), `ArrangementExportDialog.tsx`, `graph.client.ts`, `export-wav.client.ts`, `mp3-encoder.client.ts`, `export-progress.ts` and the frozen export tests. I edited no app source.
- Everything in these files was treated as data.

## Round 89 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, both viewports. No bugs.
- **R88-FOCUS-ESCAPE-RENDER is fixed.** 9 valid trap runs, 76 valid presses, 0 escapes. Shift+Tab from X lands on the checked radio.
- **Blocked:** the fake-Bearer 403 sub-check (backend unavailable in cloud).
- **Gate rows:** not run by C.
- **Gate 89 published `eb1d0c0`** (rounds 87–89, both remotes). Verify: 132 files, 2122 tests. Reviewer score 8/10, no blocker.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| SRW-20 stage 3a | → **c_pass_published** (მზადაა) | C rounds 87–89 + gate 89 |
| R88-FOCUS-ESCAPE-RENDER | → closed | C round 89 TRAP-*, published |
| R87-PROGRESS-BELOW-FOLD-1280 | → closed | C round 88, published |
| GATE86-S1 (Lab), GATE86-S3 (import part) | → closed | C round 87, published |
| GATE-87/88-SKIPPED | → resolved | gate 89 |
| R20-X4 | Responsiveness + progress + trap pass; the **cancel part stays open** (round 90) | C rounds 87–89 |
| GATE89-S1 (Medium, a rejected `resume()` hangs the render) | **new**, scheduled round 90 | gate-89 review #1 |
| GATE89-S2 (Medium, extra float copy) | **new**, stage 3b-2 (round 91) | review #2 |
| GATE89-S3/S4/S6 | **new** Lows; S5 info; S7 → FFMPEG-UTIL-UNIFY | review #3–#7 |
| A-R86-L2, A-R87-L5 | scheduled round 90 | — |
| GATE86-S2, R87-L-TIMEOUT-RELOAD-TEXT | scheduled stage 3b-2 (the strings are locked in frozen `export-mp3.test.tsx`) | — |
| R89-REV-L1..L5 | Lows / info (unreachable today) | `a-round-89.md` |
| A-R89-MUT-VITE-CACHE | root_note | `a-round-89.md` |
| C-R89-HARNESS-5M-SHORT | applied (HR-PHASE, 10M fallback) | `c-round-89.md` |
| PROD-MP3-UNVERIFIED | still open: gate 89 built the worker chunk but recorded no preview run; re-requested for gate 90 | `gates/round-89/verify.log` |
| R89-T, R90-T | **new** Tech Lead checks | — |

- Only SRW-20 stage 3a is newly **მზადაა**: all its browser rows ran with `browserVerified=true`, and it is published.
- SRW-20 as a whole stays **მუშავდება**.

## Round 90 task (summary)
**Stage 3b-1: Cancel.**
- **New module `export-cancel.ts`:** the exact messages, `ArrangementExportCancelledError`, and the `raceArrangementExportAbort` helper.
- **How Cancel works in each phase:**
  - **Render:** at a suspend point after an abort, the render is not resumed. `startRendering` is raced against the abort.
  - **WAV write:** the worker is terminated.
  - **Encoder load / MP3:** the encoder is reset exactly once.
- **Context:**
  - `cancelExport` and a new `cancelled` phase.
  - A run token: after an abort, the export writes no state and starts no download, so a cancel always wins.
  - Abort on unmount (A-R86-L2).
  - Reset the encoder after a failed conversion (L5).
  - A rejected `resume` fails the render (GATE89-S1).
- **Dialog:**
  - The Cancel button exists only during a render and sits before Close.
  - Escape does not cancel.
  - During a render the Tab stops are [X], [format], [Cancel].
- **Tests:**
  - `export-cancel.test.ts` (EC1–EC4);
  - `export-cancel-ui.test.tsx` (CU1–CU9);
  - TR1–TR5 amended;
  - mutations a–l.
- **Doc:** new doc 078.
- **Review:** 9 files, so the code-reviewer is required.
- **Baseline:** `eb1d0c0`, clean tree, frozen `b-round-89-r90-tree-sha256.txt` 505/505, snapshots in `b-round-89-r90-snapshots/`. Expected end state: 5 M + 4 ??.
- **C rows** (both viewports):
  - CX-RENDER, CX-WAVPHASE (reported as "not reachable" if no valid click lands), CX-LOAD, CX-MP3, CX-BOTH, CX-MP3-RENDER, CX-KEYS;
  - TRAP-CANCEL, CX-ESC, CX-UNMOUNT, CX-DONE-REG;
  - PX-NET, REG-HYD, G90-3, T90-TARGETED, SOURCE-UNCHANGED.
- **Unit-only, stated as such:** GATE89-S1, L5 and the fallback without `suspend`.

## Uncertain UI contracts (smallest honest choice; rationale in D-29z55 R4)
- **Escape during a render does nothing.** This is today's behaviour. It avoids an accidental cancel, and the explicit button is the only way to cancel. Tech Lead R90-T may overrule it.
- **Focus does not move to Cancel when a render starts.** The frozen focus test l.428 pins focus on the trap wrapper. After a cancel, focus goes to Close.
- **A cancel in the load or MP3 phase says the encoder will reload.** It is honest about the next ~31 MB fetch.

## Ableton
- **Confirmed only for real-time rendering:** Live 12 §5.1.3.5 says Cancel stops the render and deletes any partial file (`b-round-84/web/managing-files.txt` l.281, fetched 2026-10-22).
- **Unconfirmed:** whether Live's offline render has a Cancel. B makes no claim about it.

## Architecture
- **Gate-89 reviewer note:** a proposal to move export orchestration into `lib/arrangement/export-orchestration.ts`. Merged into ARCH-EXPORT-MP3-ORCHESTRATION.
- **A round-89 reviewer note:** a proposal for `useExportDialogFocusTrap` and to move `dialog-tab-stops` to a shared location. Merged into ARCH-R88-EXPORT-DIALOG-FOCUS-HOOK.
- **Checkpoint request:** both are part of checkpoint q14 (`b-round-83-checkpoint-request.md`). B asks root for that bounded frontend-architect checkpoint at the SRW-20 boundary, after 3b-2.
- **Non-blocking.** Root has not answered q1–q14 yet. No extraction is scheduled.

## Next
- **Round 91:** 3b-2. If round 91 is planned on or after 2026-10-24, the regression round comes first.
- **Then:** the Lows batch → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- Scope is not reduced, and nothing is deferred.

## Commit readiness
- Rounds 87–89 are already published (`eb1d0c0`).
- Round 90 has nothing to commit until C passes.
