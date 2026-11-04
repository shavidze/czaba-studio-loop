# B round 328 → 329 planning (2026-11-04)

**Decision: CONTINUE.** Round 329 is PERF-DRAG-PREVIEW stage c1, the project-end path, plus DP20 for C-R328-01. The task is in `current-task.md` (D-29z945…D-29z953, backlog v288). The baseline is `dae81bf`, a published gate commit, with a clean tree.

## 1. Inputs read
- `c-round-328.md` and `c-round-328.json`: **PASS**, `browserVerified`/`realVerified` true, 15 rows passed. Two new Lows: C-R328-01 and C-R328-02.
- `a-round-328.md`: no STOP. The reviewer raised a Low hypothesis (A-R328-REVIEW-SAME-TEXT-RACE) and an Architecture note.
- `gates/gate-round-328.json`: **published** `dae81bf` on both remotes. That commit is the next baseline.
- `gates/round-328/review.md` (gate code-reviewer, 8/10): no Critical or Medium. Three Lows (GATE328-S1 lane ordering, browser-only; S2 reducer action check; S3 fade budget headroom), two infos and an Architecture note. Triaged in D-29z953 (§2). `verify.log` has no drag-preview test near its timeout (L31).
- `env-status.json`: store 200.
- `regression-last.json`: 2026-11-02. Today is 2026-11-04, which is 2 days, so REGRESSION is not due.
- `lessons.md`; `backlog.json` and `feature-status.md` by id only.
- The task archive: `tasks/round-328.md` is a byte-equal copy of the previous `current-task.md` (K15). It was made before any edit and nothing was deleted.

## 2. Backlog changes (evidence only)
- **PERF-DRAG-PREVIEW stage b → done** (C round 328 PASS + gate 328 published, D-29z945).
  - **C-R327-01 and C-R327-02 are closed.** SETTLE-REMOUNT passed 3/3 plus a clean 4th run at both viewports, and the positive control reproduces the bug.
  - **The item itself stays `in_progress`.** Fade is 21.633 per move against the target ≤ 15 (the D-29z935 gap carries).
- **C-R328-01 (Low)** is fixed in round 329 as DP20 (D-29z946). It is test-only. B's mutant MU-CLEAR-ANY-PREVIEW is red on DP20, and DP20 passes on HEAD.
- **C-R328-02 (Low)** → `deferred_low_polish`, with its numbers (D-29z947): fade stopped `release-commits` 1 → 3, playing 1 → 2.
- **A-R328-REVIEW-SAME-TEXT-RACE** stays an open Low hypothesis (D-29z948). Its probe goes into the next REGRESSION round.
- **A-R328-ARCH-STATUS-HOOK** → `b-round-328-checkpoint-addendum.md` under D-29z915 (D-29z949). Its trigger is not met. The checkpoint still has no recorded answer, and stage c does not wait for it.
- **Stage c is split into c1…c5** (D-29z950; see §5 for the order).
- **Gate 328 review (D-29z953):**
  - GATE328-S1, S2 and S3 → `deferred_low_polish`; S1 also gets a REGRESSION probe;
  - GATE328-S4 is a signal;
  - GATE328-ARCH-STATUS-STORE is added to the checkpoint addendum.
- `REGRESSION-ROUND-2026-11-05` gains five `scope_additions`: CAND-R323-FOLD-CLEARS-SELECTION, SIG-R327-NOBPM-RULER-CLICK, the A-R328 race probe, the GATE328-S1 probe, and one row each for stages b and c1.
- **Nothing else is marked done.**

## 3. Why stage c1, and the premise (L37)
- **At HEAD,** C's names probe shows that a same-lane move pushing the project end renders **105–107 components per move**, and the provider does not render.
  - The cause is `StudioWorkspace`'s raw preview-end subscription. It feeds `timelineSeconds` and the overview extent, and the transport subscribes to the same value.
  - The harness gesture is end-bound: the end changes 60 times, the ruler width only 3 times (`b-round-328/end-bound-head-dae81bf.json`).
- **This is the largest remaining per-move cost** on the most common drag (the harness move row is 106.85, against trim's 24.583).

## 4. B's evidence (`b-round-328/`)
- **Sketch:** `sketch/sketch.patch.txt` touches 3 files. `git apply` on a copy of HEAD reproduces the scratch byte for byte, and `--check` is clean on `store/`.
- **Names probe on the sketch:** **[23, 2, 23, 2, 108, 2, 23, 2]** (HEAD: [105, 2, 105, 2, 107, 2, 105, 2]).
  - No in-second commit names `StudioWorkspace`, the transport, the ruler or the library.
  - Fade and trim are unchanged.
  - One cold-compile timeout was environment-invalid and replaced (`names-sketch-attempts.txt`).
- **End probe:** equal to HEAD at both viewports, including the overview `data-extent` and `aria-valuetext` on every sample.
- **C's stage-a rows** (`rows.mjs`, a copy of `c325-rows.mjs`), HEAD vs sketch at both viewports: **0 differences**. This ran before the tech-lead tweaks (a compile-time alias and a test assert, so the runtime is the same). B's files were renamed to `rows-*-b.json` so that C's run cannot overwrite them.
- **Full vitest on the final sketch: 3562/3562**, and typecheck rc 0.
  - The first run was stopped mid-way because B changed the sketch after it started. It is kept as `precheck-full-invalid-run1.log` and was replaced.
- **Mutants:** 5, all red on the named rows. HEAD parity: DP20 green, DP21 and DP22 red.
- **No perf harness run on a production build.** The move rows stay `record` (L58). B's inference is at most about 29 per move.
- **Claims:** `claims-329.sh`, with the planning and sketch outputs saved.

## 5. Consults and advisor
- **Advisor: available and used** before the design. I followed it:
  - measure end-bound vs viewport-bound and the crossings before writing any budget;
  - keep the move rows `record`;
  - split stage c;
  - carry the race probe into REGRESSION;
  - do not schedule the hook extraction.
- **`tech-lead`:**
  - keep the ownership and the inline selector (the tail and the viewport are layout policy, not store state);
  - use a named props alias;
  - add a Provider-render assert to DP22.

  Both changes are applied to the sketch, and every check was re-run afterwards. Tech-lead preferred the group move as the next sub-stage.
- **`performance-optimizer`:**
  - no correctness risk in the selector closure (zustand 5 `useStore`);
  - ship as `record`, because an assert at ≤ 15 would fail on the in-second floor of 23;
  - the next cut should be that shared floor, because it helps trim, fade and move alike; then cross-lane ghosts before the group move.

  **B chose the performance-optimizer order** (D-29z950). The group move is the rarer gesture, and the shared floor is about 22 of the ~29 per move. Tech-lead's ownership-risk point is kept: c3 and c4 each get their own round and mutants.
- **Not consulted:** product-designer, ableton-arrangement-expert. Nothing visible changes (perf round; reference-first does not apply).

## 6. Order after round 329
1. REGRESSION (if planned on or after 2026-11-05).
2. Stage c2 (the shared in-second remainder).
3. c3 (cross-lane ghosts).
4. c4 (group move).
5. c5 (video).
6. The record → assert conversions.
7. Then PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → the rest of the queue.

The next RETRO is at round 336 or at the end of STUDIO-PERFORMANCE. The checkpoint D-29z915 is due before PERF-10 is planned.

## 7. Commit readiness
Nothing new is ready. Round 328 is already published (`dae81bf`). Round 329 is ready only after C PASS and the root gate.

## 8. Housekeeping
- **Scratch copies outside the loop:** `/home/runner/b328-scratch` (the sketch; its `vite.config.ts` has a `cacheDir`) and `/home/runner/b328-pristine` (HEAD). Neither touches `store/`.
- **Dev server:** I started one on :5198 for the sketch and stopped it at the end. `store/` is unchanged (`git status` shows 0 entries).
