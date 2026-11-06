# B round 358 → 359 planning

**Decision: CONTINUE.** Round 359 fixes **C-R358-01** (Medium): tempo, grid, snap and metronome settings survive a StudioWorkspace remount. The task is in `current-task.md`.
- The round-358 task is archived as `tasks/round-358.md`, a byte-equal copy (`cmp` OK). Nothing was deleted.
- Advisor: available, and consulted after orientation and before declaring done.

## 1. Inputs read
- `context/active-summary.md` and the old `current-task.md`, now `tasks/round-358.md`.
- `a-round-358.md`, `c-round-358.md` and `c-round-358.json`.
- `gates/gate-round-358.json`: status **published**, commit `f269022`. The baseline HEAD for round 359 is `f269022`. Note: `context/head-sha.txt` still read `d49536b`, a pre-gate snapshot; `git log` confirms `f269022`.
- `env-status.json` (store 200) and `regression-last.json` (2026-11-05; next regression due on or after 2026-11-08). Today is 2026-11-06, so REGRESSION is not due.
- `root-pre-push-review.md` and `publication-checkpoint.json`: no new open item.
- Backlog ids were looked up by id only.
- The source was read only: `StudioWorkspace.tsx` (tempo/grid state, the seed effect, `changeTempo`, the metronome effect), `ArrangementContext.tsx` (store wiring), `studio-lab.tsx`, `playback-store.ts`, `ArrangementMarkerRow.tsx` `stepMarker` and `markers.ts` `adjacentMarkerTarget`.

## 2. Round 358 closed from C's evidence (D-29z1159)
- **PASS**, with `browserVerified` and `realVerified` true:
  - PERF 84/84, 0 NEW, play start/stop components 70 → 28;
  - REMOUNT 7/7 equal to HEAD;
  - PLAY, FOLLOW and NARROW at both viewports;
  - VIDEO-SYNC, VIDEO-FAIL-STOP (variant 1) and G358-AUTH.
- Gate 358 published `f269022`. **PERF-10a is done**; its play rows stay `record` until PERF-10a-BUDGETS. **C-R357-01 is closed.**
- C did not run two VIDEO-FAIL-STOP variants. They are carried as C rows into PERF-10a-BUDGETS, and they do not reopen PERF-10a. B made no change of its own to PERF-10a's state.

## 3. C-R358-01: ruling and B's sketch (D-29z1160)
- **Bug.** A typed tempo (100) is lost and the tempo-seed sentence is re-appended after a narrow → wide resize. It is identical on HEAD, so it is pre-existing.
- **Cause.** The route unmounts `StudioWorkspace` below 900 px, but the provider stays mounted. The tempo/grid settings are component state, so they reset, and the seed runs again.
- **Merge.** A-R357-TEMPO-SEED-REMOUNT-DUP has the same root cause. It is promoted from Low to Medium, merged into C-R358-01 and removed from `deferred_low_polish` (L7).
- **Ruling.** The ten tempo/grid/snap/metronome settings live as long as the provider, in a per-provider zustand vanilla store that follows `playback-store.ts`. StudioWorkspace restores them at mount and saves them at unmount.
- **Not in scope:**
  - **Page reload:** that would be a new feature for Saba.
  - **Keeping the workspace mounted while narrow:** that is a layout and behaviour change.
  - **Follow mode:** D-29z1156 already re-syncs it at mount.
  - **Envelope mode and waveform zoom:** these are a separate view-state class, recorded as the new Low **B-R359-VIEW-STATE-REMOUNT** (deferred). C records them in round 359.
- **B's evidence** (scratch from `git archive f269022`, files in `b-round-358/`):
  - New tests WS1–WS4 are **red on HEAD** for the bug's exact reasons (field 90 instead of 100; the sentence ×3; cleared → 90; snap/division/metronome reset). The guard row WS5 is green (`ws-on-head.log`).
  - On the sketch: the covering set is **79 files, 1452/1452** (`cover-sketch.log`); `tsc` rc 0; Biome rc 0.
  - Mutants M-S1–M-S5 are red on their named rows (`mutants/`).
  - **In a real browser**, C's own probe on a sketch dev server keeps 100 BPM after the resize, with the seed sentence ×0. HEAD gives 120 and ×1, at both viewports (`beh-sketch-*.json` vs `c-round-358/beh-head-*.json`).
  - `remount-probe3` equals C358's tree result (`remount3-sketch.json`).
  - **Perf was not run by B.** C runs PERF.
- **Claims:** `b-round-358/claims-359.sh`, with planning and sketch outputs saved. K6 reads 10 on the scratch only, because of a scratch-only `cacheDir` edit to `vite.config.ts`.

## 4. Routing (D-29z1161)
- A-R358-REVIEW-RM1-SEQ and A-R358-REVIEW-LEAF-GATE-COVER (both Low; C's mutant C-M1 survived) go to `open_findings` and `deferred_low_polish`.
- The reviewer's stale-snapshot note joins A-R357-REVIEW-SPLIT-RENDER-LATENT.
- The Architecture note joins signal **A-R357-ARCH-PLAYBACK-SPLIT-HOOKS**. It is not scheduled.
- **C's "Next marker with no marker stops playback" observation is info, not a bug, by trace.** `adjacentMarkerTarget` returns the project end (`markers.ts:162`), `stepMarker` seeks there, and playback stops at the project end. The button's label says "marker or clip edge". Recorded as C-R358-OBS-NEXT-MARKER-END (closed).
- **Architecture checkpoint, repeated and non-blocking:** `b-round-358/root-request-arch-checkpoint.md`.
  - Round 359 adds a 12th provider store and a third order-sensitive lifecycle concern to `StudioWorkspace.tsx` (3.5k lines).
  - It adds question 1c: should the workspace view settings use a live store or a mount/unmount snapshot?
- **Lesson candidate:** "Component state under a longer-lived provider gets a remount row." It is merged with round 358's candidate and parked for RETRO 368, because `lessons.md` is at 60 lines.

## 5. Order (D-29z1162)
1. Round 359: the C-R358-01 fix.
2. REGRESSION, at any planning on or after 2026-11-08.
3. PERF-10a-BUDGETS, with the VIDEO-FAIL-STOP variants.
4. PERF-10b.
5. PERF-9, then PERF-11…15.
6. STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries.

RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Files written by B
- `tasks/round-358.md` (a copy) and `current-task.md` (round 359).
- `b-round-358.md` and `b-next.json`.
- `backlog.json`, v321 → v322. The backup is `b-round-358/backlog-before-359.json`, and the script is `b-round-358/update-backlog.py`.
- `feature-status.md`. The backup is `b-round-358/feature-status-before-359.md`, and the script is `update-feature-status.py`.
- `b-round-358/`: the sketch patches, logs, mutants, probes, claims, the root request and `checkpoint.md`.

B did not modify `store/` (`git status` is clean). All sketch work ran in `/home/runner/b358-scratch`, with its own vite `cacheDir`. The sketch dev server on :5193 was stopped.

## 7. Readiness for commit
- Round 358 is already published (`f269022`).
- Round 359 is not ready. Root publishes only after C PASS on round 359 and the gate.
