# B round 330 → 331 planning

**Decision: CONTINUE.** Round 331 is PERF-DRAG-PREVIEW stage c2a. The task is in `current-task.md` (D-29z962…D-29z971, backlog v290). The baseline is `1e5f552`, a published gate commit, with a clean tree. The round-330 task is archived as `tasks/round-330.md`, a byte-equal copy.

## 1. Round 330 result (from C's evidence)
- C round 330: PASS, `browserVerified`/`realVerified` true, 11/11 rows, no bugs (`c-round-330.json`).
- Gate 330: published `1e5f552` on both remotes (`gates/gate-round-330.json`). Review score 9/10, COMMIT OK.
- **Stage c1 → done.** Closed: C-R329-01, C-R329-02, C-R328-01 and A-R329-REVIEW-LOOP-EXTENT (D-29z962).
- **Ruled:**
  - INFO-C330-DP21-GRANT is accepted (D-29z963).
  - Gate Lows: GATE330-S1 and S2 go into round 331's doc edit; S3 (= INFO-C330-DP24-FAR) → `deferred_low_polish` (D-29z964).
  - The gate's Architecture proposal → ARCH-R330-LANE-MEMO-WIDTH, a signal linked to the pending checkpoint D-29z915 (D-29z965).
- `root-pre-push-review.md` and `publication-checkpoint.json`: only old checkpoints, with no new open finding ids for this stream.

## 2. Why stage c2a, and not REGRESSION
`regression-last` is 2026-11-02, and today is 2026-11-04 (2 days). The 3-day rule makes REGRESSION due for a round planned on or after 2026-11-05 (D-29z971). There are no open Critical, High or Medium findings in this stream, and no C bug.

## 3. Consults (read-only)
- **`performance-optimizer`:**
  - its per-gesture table found that during a same-lane move the readout shows the lane-move hint, so its render there is waste as well;
  - it recommended c2a = readout + detail + overview + `memo(ArrangementTrackMeter)`;
  - stale-guard via an exhaustive mutation table;
  - inferred counts: fade 22 → 11, move 23 → 21.
- **`tech-lead`:**
  - put the helpers in `preview-store.ts`;
  - narrow the panel's clip with a `Pick`;
  - split c2a/c2b;
  - leave the overview out, because it is in the signal-3 churn region and D-29z915 should decide its geometry source.
- **B's rulings:**
  - The overview is held, following tech-lead (SIG-R331-OVERVIEW-FADE). The TrackMeter memo moves to c2b (D-29z966).
  - The `Pick` is rejected for c2a because it ripples into lane code (`ArrangementPeakPath` props, `clipLinearGain`, `clipWaveformScale`). It stays as SIG-R331-DETAIL-PICK for T12-ADVANCED (D-29z967).
  - The ref-held selector hook stays next to its callers (D-29z968).
- **Not consulted:** product-designer and ableton-arrangement-expert. This is a perf round with no visible change; reference-first does not apply.

## 4. B's sketch and what it caught (all under `b-round-330/`)
- **The patch:** `sketch/sketch.patch.txt`, 4 files; `git apply --check` is clean on `store/`. Scratch: `/home/runner/b330-scratch`.
- **Perf** (production build, spec alone): 104 EQUAL / 17 DIFF against C round 330 (`perf-rowcmp-vs-c330.txt`).
  - fade 21.633 → 13.767 per move, max 22 → 14;
  - move 30.367 → 29.4, max 108 → 107;
  - trim unchanged; 36/36 asserted.
- **Browser names probe** (`names-sketch.json`, `names-compare.txt`): fade [14×4]; move [22, 2, 22, 2, 107, 2, 22, 2]; trim and click equal. The first attempt was a cold-compile timeout, environment-invalid and kept.
- **Tests:** full vitest 3570/3570 (`precheck-full.log`); covering set 17 files / 247 tests (`covering-unit.log`); typecheck rc 0.
- **Mutants:** 7/7 red, files restored (`mutants-summary.txt`).
- **Two planning errors caught before dispatch:**
  1. B's first DP26 assumed the readout renders on a move. It is replaced by the hint, so the readout now selects nothing during a lane move (this round's code), and DP26 asserts it.
  2. B's first DP27 compared markup in one mount. MU-DETAIL-SHOWS-FADE and MU-DETAIL-FADE-ATTR survived, because the equality itself freezes the stale markup. DP27 now compares fresh mounts (with `useId` normalised), and the same-mount case is DP28. Both fade-display mutants are red on the new DP27.
- **Claims:** `claims-331.sh` → `claims-331-planning-output.txt` (HEAD) and `claims-331-sketch-output.txt` (sketch).
- **Lessons:** unchanged. The two catches above are L58 working as written; no new rule is needed.

## 5. Advisor
The configured advisor was available and used three times: before the approach, after the sketch measurements (before the acceptance rows), and for a final review. The final review led to precise DRAG-NAMES names, a corrected GROUP-SHOWN recipe (K23, listed L29 deviation), the assert/record wording on the PERF rows, the hook-template override and the L31 durations. Its points that changed the task:
- the per-gesture framing and the c2a/c2b split;
- a markup DOM guard instead of a text guard;
- an exhaustive variant map;
- perf rows as record with finding thresholds, with no budget change;
- running the claims script on both trees;
- browser rows for stale shown values (trim, move hint, group gain).

## 6. Order after round 331
1. REGRESSION (if planned on or after 2026-11-05). Its scope additions now include one c2a row.
2. Stage c2b.
3. c3 (cross-lane ghosts), c4 (group move), c5 (video).
4. The record → assert conversions, including PERF-CAND-FADE-BUDGET.
5. PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → the rest of the queue.

The next RETRO is at round 336 or at the end of STUDIO-PERFORMANCE. Checkpoint D-29z915 is still pending with root and does not block c2a. c2b proceeds with the overview whether or not it has been answered by then (D-29z966).

## 7. Commit readiness
Nothing new is ready. Rounds 329 and 330 are already published (`1e5f552`). Round 331 is ready only after C PASS and the root gate.

## 8. Housekeeping
- **Scratch:** `/home/runner/b330-scratch` (sketch applied; its `vite.config.ts` has a private `cacheDir`, which is not in the patch). Vite cache: `/tmp/b330-vite-cache`. Neither touches `store/`. `/home/runner/a330-scratch` was left alone.
- **Dev server:** `:5198` was started for the names probe and is stopped.
- `store/` is unchanged: `git status` shows 0 entries.
- **Backups:** `b-round-330/backlog-before.json`, `b-next-before.json`, `feature-status-before.md`.
