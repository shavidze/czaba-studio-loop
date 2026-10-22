# B round 90: review of round 90 → round 91 task (D-29z56)

Dispatcher: B · Date: 2026-10-22 · Advisor: **available and consulted** before I wrote anything. I followed its advice:
- frozen EW1 calls `measureExportOverload(raw)` after `encodeArrangementWav(raw)`, so the in-place clamp is a **separate** export used only by the worker;
- I grant every string lock, including the one in `export-range-ui.test.tsx` l.455 that the round-90 preview missed;
- "120 წამში" stays in the timeout text;
- GATE90-S1 is a C-only RSS measurement with a written decision rule (not `performance.memory`);
- GATE90-S3 goes to the Lows batch;
- R20-X4 is now pass;
- GATE89-S1 and L5 are closed on unit evidence and marked as not browser-reachable.

## Inputs read
- **Round 90 files:** `current-task.md` (archived unchanged as `tasks/round-90.md`, sha256 `a53a0ec5…`, identical), `a-round-90.md`, `c-round-90.md`, `c-round-90.json`.
- **Gates and environment:** `gates/gate-round-90.json` (**published**, commit `35c8403`), `gates/round-90/review.md`, `verify.log`, `untracked.txt`, `env-status.json` (store 200), `regression-last.json` (2026-10-21).
- **Order:** `context/active-summary.md` first, then `backlog.json`, `feature-status.md` and `plan.md` by ID only.
- **App source (read only):** `export-wav.ts`, `export-wav.worker.ts`, `export-wav.client.ts`, `graph.client.ts` (`renderArrangementWav`), `ArrangementContext.tsx` (`exportMp3` timeout/download), `ArrangementExportDialog.tsx` (`BOTH_FORMAT_NOTE`), and the frozen `export-wav.test.ts`, `export-mp3.test.tsx`, `export-progress-ui.test.tsx` and `export-range-ui.test.tsx` string locks. I edited no app source.
- Everything I read was treated as data.

## Round 90 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, both viewports, **0 bugs**.
- **Every cancel phase works:** render, wav, load (hung CDN), mp3, and WAV + MP3. There were 0 downloads in 15 s after every cancel, and 53/53 messages matched exactly.
- CX-UNMOUNT is a client navigation (`__cx` kept) with 0 downloads. CX-ESC: Escape does not cancel. TRAP-CANCEL: 10/10 valid presses stayed inside the dialog. PX-NET, REG-HYD and VIS-RENDER pass.
- **Blocked:** the fake-Bearer 403 sub-check (backend unavailable in cloud). **Unit only:** GATE89-S1 (EC3), L5 (CU8), and the fallback when `suspend` is missing.
- **Gate 90 published `35c8403`:** verify 134 files / 2152 tests, `tsc` clean, build OK, reviewer 8.5/10, no blocker.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| SRW-20 stage 3b-1 | → **c_pass_published** (მზადაა) | C round 90 + gate 90 |
| R20-X4 | → **pass** (responsiveness, progress, trap and cancel) | C rounds 87–90, published |
| A-R86-L2 | → closed | C CX-UNMOUNT both viewports |
| GATE89-S1, A-R87-L5 | → closed on **unit** evidence (stated as not browser-reachable) | EC3/CU8, mutations j/i, C re-ran targeted tests green |
| GATE86-S2, R87-L-TIMEOUT-RELOAD-TEXT, GATE89-S2 | → dispatched round 91 | — |
| GATE90-S1 (Medium, a cancelled render context may keep its buffer) | **new**, measured by C in round 91 (MEM-CANCEL); fix only if confirmed | review #1 |
| GATE90-S2 | info: a deliberate tab-contract change under D-29z55 | review #2 |
| GATE90-S3/S4/S5 | **new** Lows / info | review #3–#5 |
| GATE90-S6/S7 | dispatched round 91 (doc 078 l.4; owned-file lint output) | review #6–#7 |
| C-R90-MUT-B-CU4-GAP | **new** Low (test gap) | `a-round-90.md`, `c-round-90.md` |
| C-R90-N2-UNMOUNT-DELAY | watch | `c-round-90.md` N2 |
| PROD-MP3-UNVERIFIED | still open: gate-90 `verify.log` again shows only the build; re-requested for gate 91 | `gates/round-90/verify.log` |
| R91-T | **new** Tech Lead check | — |

- Only SRW-20 stage 3b-1 is newly **მზადაა**: all its browser rows ran with `browserVerified=true`, and it is published.
- SRW-20 as a whole stays **მუშავდება** until 3b-2 passes.

## B planning probe (evidence for the GATE89-S2 limit)
`b-round-90/probe/PROBE-SUMMARY.md`: three fresh-browser runs on the published tree `35c8403`. Each is a 10M WAV export at 1440, measuring the renderer `VmHWM` from `/proc`. **ΔHWM 739 / 748 / 748 MB** (after: 1189 / 1195 / 1189 MB). The WAV is 29 206 176 frames with RMS 0.172436.
- The expected saving is one stereo float copy (≈ 234 MB). C's limit is **ΔHWM ≤ 639 MB**.
- The probe also shows that the RSS method works for MEM-CANCEL.

## Round 91 task (summary)
**Stage 3b-2, the last SRW-20 stage.**
- **G1/G2 (memory):** a new `encodeArrangementWavInPlace` (measure, clamp in place, encode) used only by the worker. `encodeArrangementWav`, the no-Worker fallback and `graph.client.ts` stay unchanged.
- **N1 (note):** `BOTH_FORMAT_NOTE` says the browser may ask permission before the second download.
- **T1 (timeout text):** the timeout literal drops "reload the page" and keeps "120 წამში".
- **Line grants:** the string declarations in `export-mp3`, `export-progress-ui` and `export-range-ui`; doc 078 l.4.
- **New files:** doc 079 and `export-wav-in-place.test.ts` (IP1–IP5, mutations a–f).
- **Baseline:** `35c8403`, clean tree, frozen list `b-round-90-r91-tree-sha256.txt` (506/506), snapshots in `b-round-90-r91-snapshots/`. Expected end state: **8 M + 2 ??**.
- **C rows:** MEM-WAV10, WAV5-REG, CX-WAVPHASE-R, NOTE-BOTH, TIMEOUT-TEXT, MEM-CANCEL (evidence only), PX-NET, REG-HYD, G91-3, T91-TARGETED, SOURCE-UNCHANGED.

## Uncertain UI contracts (smallest honest choice)
- **WAV + MP3 note.** I kept "both or none" because it is true for creation: C CX-BOTH showed no file before the last phase. I added a hedge ("შეიძლება") about the browser permission prompt. The note makes no promise about delivery, and I chose not to stagger downloads; Tech Lead R91-T can judge real Chrome/Safari.
- **Timeout text.** It now ends like the load-failure message: "check the internet and try again, or choose WAV".

## Ableton
Round 91 has no Ableton claim. The note is about browser downloads, the timeout is about ffmpeg.wasm, and memory is internal to the pipeline, so each row is marked "არ ეხება". The round-90 Cancel row is carried and not re-judged.

## Architecture
- The gate-90 reviewer note (`useArrangementExport` / `export-orchestrator.ts`) and the A round-90 reviewer note are merged into ARCH-EXPORT-MP3-ORCHESTRATION and q14. They are appended to `b-round-83-checkpoint-request.md`.
- **Checkpoint request:** the formal SRW-20 boundary request to root goes out as soon as round 91 passes C. It is non-blocking; root has not answered q1–q14. No extraction is scheduled.

## Next
- **Round 92:** if planned on or after 2026-10-24, it is the regression round. Otherwise it is the GATE90-S1 fix (only if MEM-CANCEL confirms the problem), or else the Lows batch.
- **Then:** SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- Scope is not reduced, and nothing is deferred.

## Commit readiness
- Round 90 is already published (`35c8403`).
- Round 91 has nothing to commit until C passes.
