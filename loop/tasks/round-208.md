# CURRENT TASK — Round 208: PERF-FADER-a0, an honest per-move metric for the fader budget (harness only)

Decision: **D-29z176** (PERF-FADER split and this round). C-R207-01 ruling: **D-29z177**. R114 (doc 164 status line): **D-29z178**. Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` in the loop root.
- `tasks/round-206.md` (the PERF-1a harness task, for the existing metric and row definitions) and `tasks/round-207.md` (the previous task, an exact copy).
- B's rationale and both consult results: `b-round-207.md` §4.
- C's harness finding: `c-round-206.md` → C-R206-01, and I-206-d.

## Baseline
- **Commit:** `d2a920c`. Gate 207 is **published** to both remotes; the tree is clean.
- **Frozen files:** the 1,044 files in `b-round-207-r208-tree-sha256.txt` (every tracked file except the 6 grants). Check from the store root: `sha256sum -c --quiet <loop>/b-round-207-r208-tree-sha256.txt`.
- **Grants:** `b-round-207-r208-grants.txt`. Start hashes: `b-round-207-r208-granted-start-sha256.txt`; start copies: `b-round-207/r208-granted-start/`.
- **New files:** `b-round-207-r208-new-files.txt` (one optional file).
- **All of `app/` is frozen this round.** Protected as always: auth and purchase files, `app/components/studio/**`, `app/styles/**`, `.claude/**`, `CLAUDE.md`, `package.json`, `biome.json`, `tsconfig*.json`, `playwright*.config.ts`.

## 0. Why this round
- **SABA-B-5 (Medium, Saba 2026-10-27): fader drag is slow.** Round 206 measured it. Components re-rendered per commit during a drag: track 83, group 85, master 80, clip gain 79/87, pan 4. Restarts while playing: 0, so the graph-rebuild hypothesis is not supported. The cause is `updateHistory` per pointermove in `previewVolumeTarget`, `previewMasterGain`, `previewClipGainFader` and `previewClipGainMembers` (`ArrangementContext.tsx` l.2365, 2727, 2846, 2892).
- **Re-measurement (policy: "re-measures before each PERF task").** `git diff --stat 60c82ed d2a920c` touches only two cursor class tokens, their tests, and docs 163/164. No fader, context or `perf/` file changed, so C's round-206 medians are the current measurement.
- **Why a metric round comes first (D-29z176).** The fix must be graded against budgets that can actually fail. Two of the harness rows cannot:
  1. **`event-share-16` is always 0 (C-R206-01 / GATE206-S4).** Event Timing does not report `pointermove`, and the faders fire 0 native `input` events during a mouse drag. Doc 163 l.60 states a false limit.
  2. **`components-per-commit` measures the wrong window for the fix.** It is the median over every commit from pointerdown until quiet. After the fix there will be ~0 commits during the moves and one large commit at pointerup (the history entry). The median of that mix says nothing about "≤ 3 committed components per move".
  - Both consults (`performance-optimizer`, `tech-lead`) support separating the metric from the behaviour change. If both landed together, a red result could not tell a harness bug from a regression.
- **The bug gate is clear:** no Critical or High is open. SABA-B-5 is the Medium in progress, and this round is its first stage.
- **Reference first:** does not apply. This is a perf/test-only round with no product behaviour change.

## 1. Rulings
- **D-29z176: PERF-FADER is split into three stages.** Full scope is unchanged.
  - **a0 (this round):** harness metrics only.
  - **a (round 209):** track, group and master volume, using the pan pattern.
    - The override lives in the context, with one `withMixOverride(arrangement)` helper applied in both `startGraph` and the `syncPlayback` setter branch.
    - A small display store holds the dragged fader's draft value.
    - Only pointer gestures change; the keyboard, Shift and double-click pending paths stay as they are.
    - On commit: clear the override, then `applyEdit` with the exact previewed value.
    - Rows: stopped, playing, **playing with a loop** (loop resync restarts the graph mid-drag), and Space mid-drag.
  - **b:** clip gain, single and members. Open design point: `clip-gain-waveform.test.tsx` WG4 requires the lane and detail waveforms to redraw during the drag. B rules on this at stage-b planning.
- **D-29z174 constraint, now carried out.** No `event-share-16` row is ever flipped to `assert`. This round removes the metric and replaces it with `move-to-paint` (below), with a liveness red-proof. That closes C-R206-01 and GATE206-S4 when C passes.
- **R-1. Only `perf/` and two doc lines/sections change.** If a needed change touches any frozen file, STOP (L11).
- **R-2. Do not tighten or loosen any existing `assert` row.** New `assert` rows are only the liveness rows named in §2.
- **R-3. Existing rows** stay and keep their ids, except the 20 `event-share-16` rows.
  - Update the note on each of the 20 `components-per-commit` rows (1× and 6×) to say that it includes the pointerdown and release commits and is not the per-move budget metric.
  - Set the `budget` of those record rows to `null`. Otherwise they would report "over ≤ 3" forever after stage a.
- **R-4. Liveness drags write only `harness.move-*` rows.** The `fader.pan.*` rows come from the normal pass, and the normal pan drag runs with no injected listener installed. Run the liveness scenario after the normal stopped faders, or in its own page state. Never write the liveness values through the `fader.*` row ids.

## 2. A — files you own (everything else is frozen)
| Path | What |
|---|---|
| `perf/lib/instrumentation.ts` (grant) | Add a capture-phase window `pointerup` timestamp list (`ups`). Add the `move-to-paint` sampler. Expose both in the snapshot. |
| `perf/studio-lab.perf.spec.ts` (grant) | New metrics and rows (below), the liveness scenario, and the I-206-d drag path |
| `perf/budgets.json` (grant) | Remove the 20 `event-share-16` rows. Add the new rows with true notes. |
| `perf/lib/stats.ts` (grant) | Only if a helper is needed |
| **new, optional** `perf/lib/move-latency.ts` | The sampler, if you prefer it separate. It is installed through the same init script. |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` (grant) | Rewrite l.60 (the false `event-share-16` limit) into the true `move-to-paint` definition and limits. Add the new rows to the metric table. Add a short Georgian section "PERF-FADER-a0" with the round-208 medians and the red-proof results. The status line l.4 becomes conditional: `In Progress (C round 206 PASS, published 60c82ed; PERF-FADER-a0 C round 208 check pending)` (L28). |
| `docs/implementation/2026/quarter-IV/164-timeline-cursor-pointer.md` (grant), **R114** (L28, D-29z178) | Change l.4 only, to: `**სტატუსი:** Completed (C round 207 PASS — c-round-207.md; published d2a920c; open: C-R207-01 Low → deferred_low_polish, SABA-B-6-R1 awaiting_user)`. |

### Metric contract
1. **`move-to-paint`** (wallclock, per move):
   - In the capture-phase `pointermove` listener, record `t0 = performance.now()`. Then call `requestAnimationFrame`, and inside it post a `MessageChannel` message.
   - In `onmessage`, push `performance.now() - t0`, tagged with the move index.
   - This counts handler time, React's deferred render and the paint. Timing only the handler would miss the render.
   - Rows per fader × state × rate: `move-to-paint-p95` (ms) and `move-to-paint-over-16` (the share of moves > 16 ms), both `record`. Owner: `PERF-FADER-a` for track, group, master and pan; `PERF-FADER-b` for clip gain. The note gives the policy target "p95 < 16 ms" and says wall-clock rows are trend-only (±30 %).
   - Also record `move-to-paint-samples`. Its detail says how many samples arrived versus `moves-dispatched`.
2. **`move-components-max`** and **`move-components-per-move`** (deterministic):
   - The window is commits with `t` after the first `pointermove` and before the in-page `pointerup` timestamp. The release commit is excluded by definition.
   - `move-components-max` = the largest `rendered` count in that window (0 if there are no commits).
   - `move-components-per-move` = the sum of `rendered` in the window ÷ moves.
   - Mode `record`, with budget `{"op":"<=","value":3}` as the target. Owner as in 1. Stage a flips its rows to `assert`. Both are in `determinismMetrics` and `crossRateMetrics`. This is safe for `-per-move`: round 206 `commits-per-move` was identical at 1× and 6× for every fader (`c-round-206/out/run1.json`). If your runs show a 1×/6× split caused only by commit merging, keep `move-components-max` in both sets, move `-per-move` to plain record, and say so in the doc.
3. **`release-commits`** (deterministic, `record`): the number of commits from the in-page `pointerup` until quiet. After stage a this must be ≥ 1, because the history entry lands on release. It is recorded now so the after-fix check has a baseline.
4. **Liveness rows (`assert`, 1× pass only):**
   - **`harness.move-latency-live.sync`:** with `page.evaluate`, add a bubble-phase window `pointermove` listener that busy-waits 30 ms. Drag Pan — Music (stopped). The result needs `move-to-paint-p95 ≥ 30`.
   - **`harness.move-latency-live.deferred`:** the listener instead posts a `MessageChannel` message whose handler busy-waits 30 ms. The result needs `p95 ≥ 30`, which proves deferred work is counted.
   - Remove both listeners afterwards. Then record **`harness.move-latency-control`** (record, the same drag without injection). The detail states that the listener count is back to the start count.
   - **`harness.move-samples-live`:** in the track-stopped drag, `move-to-paint-samples ≥ moves-dispatched − 2`.
   - **`harness.move-window-live`:** in the track-stopped drag, `move-components-max ≥ 1`. This is true at baseline (about 83), and it proves the window catches commits. Stage a replaces it with an equivalent proof (for example, the pan drag's own draft commits).
5. **I-206-d drag path:** each fader drag must change the value at both ends: `valueLow < valueStart < valueHigh`, or `valueHigh` equals the slider's `max` when the start is already at the maximum (state which faders hit this).
   - Adjust the path (for example 50 % → 5 % → 100 %) or the step counts as needed.
   - Keep `moves-dispatched` deterministic and update its `== 121` budget only if the step count changes. Say so in the doc, and keep the same value for every fader.
   - A drag that fails this rule is a run `problem` (the run fails), as "did not move" is now.

**Self-checks before handover (A runs these, not the full suite):**
- `npm run typecheck` and `npm run lint`.
- `npm run test:perf` **twice** (separate invocations). Both exit 0, and every `assert` row passes. Deterministic rows match between runs (±10 %/±2, the existing rule).
  - Do not run it in parallel with any other build: it rewrites the shared `build/` (GATE206-S5).
  - Put both result JSONs under `a-round-208/`.
- **Red-proof of the new metric**, on a scratch copy and not in the granted files:
  - (i) with the sampler's `requestAnimationFrame` step removed, the deferred liveness row fails;
  - (ii) with the window filter widened to include the release commit, `move-components-max` changes for at least one fader.
  - Record both.
- The code-reviewer runs, because 3+ files change. Carry its Architecture note to B verbatim.

**STOP (L11):** if the `move-to-paint` liveness rows cannot pass with a correct sampler (for example, a Chromium rAF throttling artefact at 6×), keep them 1×-only. If they still fail, write STOP with the measurement.

## 3. C — rows
**Setup:**
- Production build as the harness does it, with Playwright Chromium.
- Write your own probe under `c-round-208/tools/`. Do not reuse A's harness code for the independent rows.
- Do not run `test:perf` in parallel with anything else that builds.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-208** (start and end) | HEAD, `git status`, the frozen list (1,044), grant diffs vs the start copies | Only the 6 grants (plus the optional new file) differ. `app/` has 0 changes. Doc 164 differs at l.4 only, with the exact R114 text. Doc 163 changes are l.4 (conditional), l.60, the metric table and the new section. `b-round-207-r208-new-files.txt` lists the one optional new file. |
| **PERF-RUN-208** | `npm run test:perf` twice | Both exit 0, and every `assert` row passes, including the **4 new liveness `assert` rows** (`.sync`, `.deferred`, `move-samples-live`, `move-window-live`). The control row `harness.move-latency-control` is recorded, not asserted. The `fader.pan.*` values are not the injected ones (R-4). Every row has 3 samples. Deterministic rows agree between runs. There are 0 `event-share-16` rows. |
| **METRIC-LIVE-208** (independent) | C's own Playwright probe on the production build: a pan drag at 1× with C's own injected 30 ms listener (sync and deferred), then without it, measuring move→rAF→message latency the same way from C's own code | C's p95 ≥ 30 with injection and < 30 without it, in the same direction as the harness's liveness rows. C reports both numbers next to the harness's. |
| **WINDOW-208** (independent) | C's probe drags Volume — Music (stopped and playing) with C's own React-commit counting (a devtools-hook stub, like round 206's `cprobe.cjs`), and splits commits into before-first-move, move window, and after pointerup | The harness `move-components-max` and `release-commits` agree with C's split (±2). The baseline still shows the bug: move-window max ≥ 50 for track, group and master. This is the "before" evidence for stage a. |
| **DRAG-ENDS-208** | From the run JSONs and C's probe | For every fader × state, `valueLow < valueStart < valueHigh`, or the documented max case (I-206-d). |
| **DOC-208** | doc 163, `budgets.json` notes | l.60 no longer claims `event-share-16` measures `input` entries. Every new row id cited in doc 163 exists in `budgets.json` (L26). Each note matches what the code measures. The status line is conditional (L28). |
| **AN-REVIEW-208** | the `perf/` diff | No `any`, `as` assertions or `@ts-ignore`. No `context.route(` (perf-plan gotcha). The injected listeners are removed after the liveness scenario, so the control row is clean. |
| **G208-3** | Fresh contexts at 1440 and 1280: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer | `/studio-lab` opens anonymously. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. No header → 401. The fake Bearer gets 403 with the `:5199` mock, or 500 without it. **No token is issued.** Record the condition. |
| **gate** | full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | not claimed by C |

**`browserVerified`:** PERF-RUN, METRIC-LIVE, WINDOW and G208-3 are real-Chromium rows that can run in the cloud. If any of them did not run, the flag is false.

## 4. Adjacent behaviour that could break
- The existing `assert` rows: hook-live, audio-running, restart-live, idle long tasks and restarts == 0. A changed drag path must not start a graph restart.
- Run time. It was 6.4–6.6 min; keep it under 12 min with the liveness scenario added. The config test timeout is 15 min (`playwright.perf.config.ts:10`, frozen).
- The instrumentation listeners must not change the app's pointer behaviour. Capture-phase listeners stay passive, and the injected busy listeners exist only inside the liveness scenario.

## 5. Publication
After C PASS, root runs the gate. Commit message: "perf(studio): PERF-FADER-a0 move-to-paint and move-window metrics; no app change". Root amends doc 163 l.4 (L28).

## 6. After this round (not in scope)
- **Round 209: PERF-FADER-a** (track, group, master; see D-29z176). Its task flips the `move-components-*` rows for those faders to `assert` (≤ 3) and adds `release-commits ≥ 1`. It also adds rows for the export bit-identity (drag to readout V in session 1, type V in a fresh session 2, sha256 equal), Undo/Esc/pointercancel/stolen-claim revert of every group member, and the keyboard/Shift/double-click paths staying unchanged.
- Then PERF-FADER-b (clip gain), PERF-1b, PERF-2…16, SYS-1…3, STORE-2b…5 (paused), REVIEW-RECOMMENDATIONS, T12-ADVANCED.
- **Saba's fader fix itself lands in round 209 (PERF-FADER-a), not in this round.** This round makes the speed budget able to fail honestly first; `b-round-207.md` §4 explains why.
- Regression round: due on or after 2026-10-30. RETRO: at round 215 or at the end of STUDIO-PERFORMANCE.
