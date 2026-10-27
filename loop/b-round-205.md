# B: Round 205 → 206 planning (D-29z171; queue move D-29z172)

- **Date:** 2026-10-27
- **Author:** B
- **Advisor:** **available and used**. It was consulted once after orientation, before writing, and once at the end (§9).
- **Project consults (read-only):**
  - `performance-optimizer` on measurement methods;
  - `tech-lead` on placement, split and the PERF-FADER traps.

## 1. Inputs read
- **Loop files:**
  - `context/active-summary.md`, by headings and the Medium+ grep;
  - `current-task.md` (round 205);
  - `a-round-205.md`, by grep;
  - `c-round-205.md` and `c-round-205.json`, in full;
  - `b-round-204.md` and `b-next.json`;
  - `lessons.md`;
  - `regression-last.json`, which says 2026-10-27, round 199, so the next regression is due on or after 2026-10-30;
  - `env-status.json`.
- **Gate:** `gates/gate-round-205.json` is **published**. Commit `c274930` is on both remotes. That makes **`c274930` the baseline** for round 206; `git log` and a clean `git status` confirm it.
  - I read `gates/round-205/review.md` in full: COMMIT OK, 9 Low or nit suggestions, and an Architecture note.
- **`backlog.json`, by id only:** `post_current_stage_queue`, `systemic_tasks`, `open_findings` (Medium+ and the round-204/205 ids), `deferred_low_polish` (related ids), `architecture_signals`, `architecture_checkpoint_requests`, `leadmagnet_dialog_rulings_d29z170` and `rounds[-1]`.
- **`feature-status.md`:** grep only, then targeted edits.
- **Source (read-only, at c274930):**
  - `ArrangementContext.tsx`: l.533 `scheduleKey`, l.703 `updateHistory`, l.1056–1100 `syncPlayback`, l.2365–2930 for the volume, group, master, pan and clip-gain previews;
  - the fader markup in `ArrangementLane.tsx` l.757–830 and `ArrangementGroupHeader.tsx` l.315–330;
  - the `aria-label`s in `ArrangementDetailPanel.tsx`;
  - `playwright.config.ts`, `playwright.smoke.config.ts`, `package.json` scripts, `tsconfig.json`, `.gitignore`.
- **Spec:** `docs/technical/performance/perf-plan.md`.
- **Archive:** `tasks/round-205.md` = the round-205 `current-task.md` (`cmp` OK). I created it before writing anything; it did not exist before.
- **Backups:** `b-round-205/*-before-r206.*`.

## 2. Acceptance results used (independently evidenced by C)
**C round 205: PASS**, with `browserVerified=true` and `realVerified=true`.
- **12 rows PASS:** SCOPE, LM-OPEN, LM-TAB, LM-STEPS, LM-CLOSE, LM-EXIT, SCROLL-LOCK, HF6B, NO-SHIFT, T-RUN, AN-REVIEW and G205-3.
  - G205-3 covers the guarantees: `/studio-lab` opens anonymously; `/studio/middle-east` asks for sign-in with 0 `audio[src]`; the token endpoint returns 401/403.
- **Gate:** gate 205 published `c274930`.
- **Now done (მზადაა):**
  - B-R203-LEADMAGNET-AUTO-OPEN-FOCUS;
  - B-R204-SCROLLLOCK-POSITION-LOST;
  - C-R202-04, C-R202-05 and B-R201-HEADER-USERMENU-KEYBOARD (C round 204 PASS, now published);
  - GATE204-B1 is closed.
- **Backend-blocked (not rows, open evidence):** the `useScrollLock` consumers `studio/ExportDialog` on `/studio/:id` and the cart ConfirmDialog.

## 3. Rulings (L10)
- **DEVIATION A-1** (focus re-anchor after a failed submit): **accepted**. C verified it (`fail-tree-1280.json`), and m13 red-proves it.
- **C-R205-01** (focus is on BODY while the submit is in flight): rated **Low**, which is C's primary rating.
  - Why Low: the window lasts only for the network time, A-1 restores focus once the response arrives, and no data is at risk.
  - The reviewer rated the post-error sibling Medium. That sibling (permanent focus loss) is already fixed by A-1.
  - It is **scheduled, not buried**. Whichever comes first fixes it, with reviewer S4's shape:
    - the next round that owns `LeadMagnetPopup.tsx`, or
    - the `useDialogFocus` task.
  - Under the 2026-10-23 bug gate, a Medium rating would have put it ahead of Saba's explicit STUDIO-PERFORMANCE order. C's evidence does not support Medium.
- **C-R205-02** (the store header does not stay sticky): Low, pre-existing (ref is identical). It is deferred, and is a candidate for the STORE-2b/3 owner.
- **Gate-205 suggestions, deduped per L7:**

| Suggestion | Ruling |
|---|---|
| S1 | GATE205-S1-NESTED-SCROLL-LOCK. This is the same issue as C's Info #8. |
| S2 | A note on C-R204-02. |
| S3 | GATE205-S3-TRAP-SELECTOR |
| S4 | This is C-R205-01. |
| S5 | A note on GATE204-S3. |
| S6 | A note on B-R203-USERMENU-HOVER-ESCAPE. |
| S7 | GATE205-S7-MENU-HISTORY-NAV |
| S8, S9 | Info nits. |

- **Doc 162 l.4 was published stale** (GATE205-DOC162-STATUS, Low). I granted the one-line fix in round 206 (R112). Lesson **L28** is new: a doc status that depends on C is written conditionally, and root amends it at publication.
- **GATE204-S4** (HF8b uses a real `setTimeout`) stays in `deferred_low_polish`. A did not apply the optional fix in round 205.
- `deferred_low_polish` now holds **302** entries.

## 4. B's own probes at planning (L1, L23)
- **Setup:**
  - Scratch copy at `/tmp/b206s`: a tar of `store/` with node_modules symlinked.
  - Production build (`remix vite:build`, log in `b-round-205/out/build.log`), served by `remix-serve` on :5186.
  - Root's :5173 was not touched. Nothing was built inside `store/`.
- **Tool:** `b-round-205/tools/perfprobe.cjs`, with outputs in `out/perfprobe-head-*.json`. Runs: `head` (first), `head-t1` and `head-t4` (CPU 1× and 4×), and `head-f1` and `head-f6` (with frame timing, 1× and 6×).
- **Facts:**
  - The `__REACT_DEVTOOLS_GLOBAL_HOOK__` stub receives the commits of the prod bundle: 6 at load.
  - The fiber walk (PerformedWork flag, descending only where `child !== alternate.child`) measures:
    - **83** components per commit for track volume "Volume — Music", with 91–92 commits per 121 moves (runs `music-f1/f6`). The first runs (`head-*`) hit the first Volume fader, "Original video sound", and also gave 83;
    - **80** for master;
    - **4** for pan.
  - The `start()` patch (including `AudioBufferSourceNode`) counts 1 on Play and **0 during every fader drag while playing**.
  - At 1×, the frame p95 is 16.8 ms everywhere. At 6× while playing:
    - volume and master: frame p95 50 ms, with 53–105 and 96–134 frames over 33 ms;
    - pan: frame p95 33.4 ms, with 31–66 frames over 33 ms.
    - Frame counts vary between runs (wall-clock), while component counts were identical in every run.
  - The pointermove handler time is about 0.1 ms, because React renders later. Event Timing (threshold 16) recorded no pointermove entries. The task therefore uses rAF/LoAF for wall-clock and treats counts as the deterministic metric.
  - The window `input` listener saw no events: the fader drag hook does not fire native `input` during a pointer drag. This is an observation, not a defect.
- **Not probed by B:** the group fader (it needs Ctrl+G) and the clip-gain fader (it needs a clip selection). A covers both, with a STOP rule if either cannot be reached.
- **Inference vs fact:**
  - Root's hypothesis "a fader move rebuilds the graph" is **not supported**. `scheduleKey` excludes tracks, master and `gainDb`, and the probe counted 0 restarts.
  - **Inference:** Saba's slowness comes from the whole-provider re-render on every move (83 components). Its cost per frame shows up on slower CPUs (the 6× profile).
  - **Not confirmed:** the slowness on Saba's own machine has not been measured.

## 5. Decision: round 206 = STUDIO-PERFORMANCE PERF-1a (+ R112 doc line)
- **Why now:**
  - Saba's 2026-10-27 order puts STUDIO-PERFORMANCE right after rounds 204 and 205.
  - The bug gate is clear: the only open Medium is SABA-B-5, which this stage measures. The rest are Tech Lead, environment or accepted classes.
  - No regression or RETRO is due.
- **Why it is split:**
  - The tech-lead consult recommends it: infra plus 10 fader scenarios at two CPU rates already fill a round.
  - PERF-1b keeps all remaining baseline scenarios of perf-plan.md: zoom, clip click, range drag, play/pause, export, bytes, DOM and memory. It also covers the fade-handle and trim drags that Saba's SABA-B-5 text asks B to check.
  - This is staging, not a reduction in scope.
- **Placement:** a new `perf/` testDir, so `e2e/` and `playwright.config.ts` stay untouched (tech-lead). Budgets have `assert` and `record` modes, and only deterministic rows are assertable this round.
- **All of `app/` is frozen.**
  - Instrumentation is `addInitScript` only.
  - No `route()` interception, because of the perf-plan gotcha.
- **Asserted now** (rows already met, or liveness checks):
  - hook live;
  - audio running;
  - restart counter live;
  - idle playback has 0 long tasks over 50 ms;
  - fader restarts while playing = 0;
  - count determinism within ±10 % or ±2.
- **Recorded:** everything that a later PERF-n owns.
- **Ableton:** does not apply (no product behaviour changes).
- **Traps for the later PERF-FADER, from the tech-lead consult** (carried to round 207 planning):
  - The readouts and `ArrangementExportDialog.tsx:518` read React state, so they need a local display value.
  - Group volume goes through `trackEffectiveGains`, including mute and solo.
  - Multi-clip gain uses `clipGainMemberIdsRef`.
  - `startGraph` and `syncPlayback` must apply the override, as they already do for pan. Otherwise a loop wrap snaps the value back.
  - The `flushPending*` calls must still produce exactly one history entry each.
  - Esc, pointercancel and the unmount cleanup (l.3480) must restore the value or clear the refs.
  - An export started mid-gesture must see the committed state, or be refused.
  - Budget: export of a dragged mix is bit-identical to the same mix with typed values.

## 6. Queue move (D-29z172, Saba 2026-10-27)
- In `post_current_stage_queue`, STUDIO-PERFORMANCE moved to just after VISUAL-A-OBSIDIAN, ahead of STORE-REDESIGN. Its status is `in_progress`.
- STORE-REDESIGN's status now starts with `paused`. It keeps all its history and its RETRO-at-end rule.
- `systemic_tasks` SYS-1…3 got `order_d29z172`: after STUDIO-PERFORMANCE, before STORE-2b…5.
- STUDIO-PERFORMANCE got stages in this order: PERF-1a, PERF-1b, PERF-FADER, PERF-2…16.
- **SABA-B-5** is recorded in `open_findings` as Medium, with its source facts, its measured facts and the rejected hypothesis.

## 7. Architecture
- The gate-205 note proposes one `useDialogFocus` hook (LeadMagnet, AuthModal, `ui/Modal`) plus a lock counter in `useScrollLock`. It is recorded in `architecture_signals` (round 205) and is **not scheduled**.
- The Header Signal 4 stays "keep".
- **New non-blocking checkpoint request:** `b-round-205-checkpoint-request.md` (ARCH-CHECKPOINT-STUDIO-PERFORMANCE). This is a feature boundary on the 3,832-line `ArrangementContext.tsx`, before PERF-FADER, PERF-8 and PERF-10. It asks three questions: an external store vs refs for preview state, the first slice of the context split, and the shared gesture helper.
- The earlier ARCH-CHECKPOINT-SABA-B-4 request is still pending with root.

## 8. For Saba (questions, the loop does not wait)
- **Order question.** Read literally, the 2026-10-27 order puts **all** of STUDIO-PERFORMANCE before SYS-1…3 and STORE-2b…5. That is 16 PERF tasks in perf-plan, or about 25 rounds. B follows it literally.
  - The alternative: after PERF-FADER (his reported bug) and the cheap high-value items (PERF-2, PERF-3), go back to SYS and STORE.
  - B needs his answer before about round 212.
- The questions from earlier rounds remain open (see `b-next.json` → remaining).

## 9. Advisor (end)
The final advisor call was made after all files were written. It found six problems, all now fixed:
1. **Wrong fader in the reference.** The first probe runs hit the first "Volume —" fader, which is "Original video sound", not "Music". B rebuilt the scratch server on :5186 and re-ran the probe on "Volume — Music" at 1× and 6× (`out/perfprobe-music-f*.json`). The Music fader also gives **83** components per commit, with 91–92 commits and 0 restarts. The tables are corrected in `current-task.md` §0, in SABA-B-5 `facts_measured` and in §4 here.
2. **Pass structure.** R-D now defines a pass as one fresh context running the full sequence, with 3 passes per CPU rate. The scenario order is fixed: track → pan → master → clip gain → group last, because Ctrl+G changes the lane tree. C uses the same order.
3. **Determinism assert.** It now applies only to components-per-commit, restarts and moves dispatched. Commit counts are record-only, because the Scheduler merges commits under load.
4. **`harness.restart-live` window.** It now runs from pointerdown until 500 ms after pointerup.
5. **PERF-1b scope.** It now includes the fade-handle and trim drags (from Saba's SABA-B-5 text), in the backlog stage, `current-task.md` §0/§6 and §5 here.
6. **Board consistency.** The STORE-REDESIGN row in `feature-status.md` §7 now starts with "დაპაუზებულია (D-29z172)".

Optional items, also added:
- a STOP line for an AudioContext that stays suspended in headless Chromium;
- a read-only `biome format` check on `perf/` in A's self-checks.

The decision is unchanged: CONTINUE.
