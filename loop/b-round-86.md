# B — Round 86 review → Round 87 task (D-29z52)

Author: B · 2026-10-22 · Advisor: available. Consulted twice in this run, both calls succeeded: once before writing, once before finishing.
- First call, adopted: the lab-owned encoder, the MP3-half probe, the Cancel button left out of 3a, S4 not adopted, the production MP3 request to root, an exact 5-minute recipe, and q14.
- Second call, adopted: the suspend/resume guard against fakes, the clipped count in PX-WAV-SAME reported instead of asserted, the `timedOut` flag for a late encoder module, a check of the jsdom `Worker` fallback, and relative imports in the worker chain.

## 1. Inputs read
- `context/active-summary.md`, `context/active-backlog.json` (current item SRW-20, other open items, recent rounds).
- `current-task.md` (round 86), `a-round-86.md`, `c-round-86.md`, `c-round-86.json`.
- `gates/gate-round-86.json`: **published**, commit `971141d67a1dd33da8f1165de1d895bd62b4e022` on both remotes. That commit is the baseline HEAD for round 87; `git status` is clean.
- `gates/round-86/review.md`: COMMIT OK, 8.5/10, suggestions S1–S5 and an Architecture note.
- Plan lookups by ID: SRW-20 R3 (D-29z50) and D-29z51.
- `regression-last.json` (2026-10-21): the next regression round is due on or after 2026-10-24. It is not due today.
- Source at `971141d`:
  - `graph.client.ts` l.400–477;
  - `ArrangementContext.tsx` l.160–192 and 2655–2845;
  - `ArrangementExportDialog.tsx` (whole file);
  - `app/utils/ffmpeg.ts`;
  - `@ffmpeg/ffmpeg` 0.12.15 `classes.js`;
  - the `sfx-export` worker trio;
  - the frozen tests that lock the export path (source-text, call-shape, `toEqual`, focus).

## 2. Acceptance evidence → backlog (only from independent C evidence)
| Item | C evidence | Backlog change |
|---|---|---|
| SRW-20 stage 2 / R20-X2 | C round 86 MP-MP3, MP-RANGE, MP-BOTH, MP-CDNFAIL, MP-TIMEOUT (1440 only, as specified), MP-REUSE, MP-OVERLOAD, MP-MUTE, MP-KEYS, MP-NET; both viewports; `browserVerified=true`, `realVerified=true`; published `971141d` | R20-X2 **pass**; stage 2 `c_pass_published` |
| R20-X3 | MP-X3 both viewports | evidence appended (pass stays) |
| C-R85-L2, GATE85-S2 | X1-PROJECT both viewports | closed |
| GATE85-S3 | `render-window.ts` + RW1/RW2/XU4, gate review | closed |
| FFMPEG-DEV-WORKER | MP-MP3 / MP-REUSE (encoder loads ~3.4 s in dev) | closed for dev; production-bundle MP3 stays open as **PROD-MP3-UNVERIFIED** (C `notRun`) |
| G86-3 fake-Bearer 403 | BLOCKED: backend unavailable in cloud | kept as open evidence for a later backend-enabled check; does not make the round unverified |

- **SRW-20 is not done.** Stage 3 (R20-X4) has not started. Its status stays **მუშავდება**.
- No item became **მზადაა** this round.

## 3. Decision for round 87: SRW-20 stage 3a
- **Order:** no C bug is open, and the regression round is not due yet. SRW-20 is the current dependency-ordered feature. Its remaining stage is split into two stages, with no shrinking:
  - **3a:** responsiveness + progress (this round);
  - **3b:** Cancel in every phase, abort on unmount, the WAV + MP3 delivery note.
  - R20-X4 is complete only after 3b.
- **B probe** (`b-round-86/probe/PROBE-SUMMARY.md`; facts, not C evidence):
  - **5-minute project recipe** (real UI): click the music clip, then Ctrl+D twice → `05:04.406`.
  - **WAV export at `971141d`:** max rAF gap **445 ms**. Normal gaps are 45–57 ms; the 101.7 s project gives 201 ms.
  - **Cause:** the clamp, the overload measurement and the 24-bit encode run synchronously on the main thread. The OfflineAudioContext render does not block, and `suspend` points work.
  - **MP3 conversion is already in ffmpeg's worker:** 300 s in 1.8 s, 44 ms max gap, `progress` events about every 500 ms.
  - **Consequence:** "encoding off the main thread" means the WAV stage. The task does not claim to move MP3 into a worker.
- **Encoder decision (R3):** abort in `@ffmpeg/ffmpeg` 0.12 only rejects the pending promise; only `terminate()` stops the worker. The frozen util cannot reset after a hung load (GATE86-S1) and cannot remove a progress listener.
  - `/studio-lab` therefore gets its own `mp3-encoder.client.ts`: same core and byte-identical command, a shared in-flight load, terminate + reset on timeout or failure, and progress `on`/`off`.
  - The util stays frozen because the protected purchased Studio uses it and that Studio cannot be verified in the cloud. Its leak stays open for its owner.
  - The duplication is signal FFMPEG-UTIL-UNIFY.
- **Progress location:**
  - Frozen tests assert `exportState` with exact `toEqual`, so progress lives in a separate store (`export-progress.ts`, `useSyncExternalStore`), like `position-store.ts`. The provider does not re-render.
  - The renderer gets a 4th `{ onProgress }` argument. Three frozen test files assert the call length; the task grants exactly those lines (export-range-ui l.278/354/397/410, export-mp3 l.383/403/414, metronome-ui l.464) plus the export-mp3 mock re-target.
- **Smallest honest UI:**
  - a non-focusable `<progress>` plus a phase label, after the status message, only while rendering;
  - the bar restarts per phase;
  - the encoder load is indeterminate;
  - status messages, radios, Close and button rules stay byte-identical, so the frozen focus contracts hold.
  - No Cancel button in 3a. A visible button that cannot cancel would be dishonest.
- **Thresholds:** max rAF gap ≤ 150 ms is a B estimate from the probe (baseline 445 ms). 150–250 ms is reported and triaged by B; above 250 ms is a FAIL. Tolerances are never weakened after a measurement.
- **Ableton:**
  - §5.1.3.5 confirms a progress bar and a Cancel that deletes the partial file, for real-time rendering.
  - §5.1.3.4 confirms that the bar resets per video pass.
  - The ordinary offline audio progress bar is not stated in the text, so it is **unconfirmed**.
  - CZABA's per-phase bar is a conscious adaptation.

## 4. Reviewer triage (gate 86 S1–S5, A-R86 L1–L9)
- **S1 (Medium, poller retry):** round 87 for the lab path (C row PX-RETRY). The purchased path stays FFMPEG-LOAD-POLLER-HANG.
- **S2 (Low, the WAV + MP3 note promises delivery):** stage 3b, same dialog.
- **S3 (Low, the timeout misses the import and the conversion):** the import moves inside the timer in round 87. The conversion has no fixed limit by decision, because its duration scales with the project length; Cancel (3b) is the escape.
- **S4 (format radios enabled during a render): rejected.** The round-86 spec and the frozen render-time focus test (l.454–472) require it, and C's EXTRA-FORMAT-SWITCH-DURING-MP3 passed.
- **S5 (production MP3) → root request below.**
- **A-R86 findings:**
  - L2 (late download after unmount) → 3b.
  - L3 → S3.
  - L4 (optimizeDeps in purchased dev) → open evidence.
  - L7 and L8 → Lows batch.
  - L9 → S1.
  - L1 and L5/L6 are covered (MP-NET; fixed by A).

## 5. Architecture
- Both round-86 Architecture notes say the export region keeps changing and that `exportMp3` repeats `exportWav`. They propose `export-pipeline.ts` or `prepareArrangementRender`.
- These are recorded as signal **ARCH-EXPORT-PIPELINE** (backlog `architecture_signals`), not as a scheduled refactor.
- Round 87 puts all new logic in new modules, so the context only wires them.
- SRW-20 reaches its feature boundary after 3b. B appended **q14** to `b-round-83-checkpoint-request.md`, asking root for the bounded frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`) on q1–q14 after 3b passes. This does not block round 87.
- Accumulated risk on one owner: A has owned `ArrangementContext.tsx`'s export region for three rounds. That is the reason for q14.

## 6. Requests to root
1. **Gate 87:** if possible, run `npm run build` and serve the built app (preview), then do one MP3 export and one WAV export on `/studio-lab`. That would close PROD-MP3-UNVERIFIED and verify the new module worker in the bundle. If it is not possible, keep the item open; it is never PASS.
2. **Checkpoint q1–q14** at the SRW-20 boundary (see §5).
3. The round-86 work is published; nothing is pending a commit from B's side.

## 7. Artifacts written this run (previous copies kept)
- `tasks/round-86.md` (exact copy of the round-86 task, sha256 `d292bf2f…`). Nothing was deleted.
- `current-task.md` (round 87).
- `backlog.json` v86 (previous copy `b-round-86/backlog.before.json`; script `b-round-86/update_backlog.py`).
- `feature-status.md` (previous copy `b-round-86/feature-status.before.md`).
- `docs/technical/studio-real-workspace/plan.md`: D-29z52 inserted before D-29z51 (previous copy `b-round-86/plan.before-b-round-86.md`; text `b-round-86/d-29z52.md`).
- `b-round-83-checkpoint-request.md` q14 (previous copy `b-round-86/checkpoint-request.before-addendum.md`).
- `b-round-86-r87-tree-sha256.txt` (490 entries, 490/490 OK at `971141d`) and `b-round-86-r87-snapshots/` (8 files).
- `b-round-86/probe/` (probe scripts, outputs, `PROBE-SUMMARY.md`).
- `b-next.json` (previous copy `b-round-86/b-next.before.json`).
- No app source was modified. B ran Playwright probes against the running dev server only; nothing was installed, started or stopped.

## 8. Why not COMPLETE, why not BLOCKED
- **Not COMPLETE.** Still open:
  - SRW-20 stages 3a/3b (R20-X4);
  - SRW-21;
  - the Lows batch;
  - the regression round (due 2026-10-24) and the final full regression;
  - Tech Lead manual checks;
  - T12 and VISUAL-A-OBSIDIAN;
  - production-bundle evidence.
- **Not BLOCKED.** Round 87 needs only in-tree code, the running `/studio-lab` and unpkg.com, which the runner's Chromium reached in rounds 86 and 87. Backend-only sub-checks stay open evidence.
