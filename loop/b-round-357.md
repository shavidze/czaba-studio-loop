# B round 357 → 358 planning

**Decision: CONTINUE.** Round 358 re-dispatches PERF-10a with the ruling on C-R357-01. The task is in `current-task.md`.
- The round-357 task is archived as `tasks/round-357.md`, a byte-equal copy (`cmp` OK). Nothing was deleted.
- A's 56-entry round-357 tree is kept as partial work.
- Advisor: available, and consulted after orientation and before declaring done.

## 1. Inputs read
- `context/active-summary.md` and the old `current-task.md`, now `tasks/round-357.md`.
- `a-round-357.md`, `c-round-357.md` and `c-round-357.json`.
- `gates/gate-round-357.json`: status `skipped`, reason "C taskStatus FAIL". It is not published, so the baseline HEAD stays `d49536b`.
- `env-status.json` (store 200), `regression-last.json` (2026-11-05, round 342; the next regression is due on or after 2026-11-08) and `lessons.md`.
- `root-pre-push-review.md` and `publication-checkpoint.json`: neither has a new open item.
- The architecture-checkpoint answer: still absent.
- Backlog ids were looked up only by id.
- The source was read only, to rule on the STOP: `StudioWorkspace.tsx` (the tempo-seed effect, `syncFollowWithPlayback`, the follow leaf, `setFollowMode`), HEAD's Follow effect, `entry.client.tsx` (no StrictMode) and `playback-start.ts` (`insertMarkerStatusKind`).

## 2. Round 357 closed from C's evidence (D-29z1155)
- **FAIL.** A wrote a STOP on an unruled code-reviewer Medium. C ran the L22 short round and reproduced **C-R357-01 (Medium)** in a real browser.
  - HEAD (`c-round-357/remount3-head.json`) ends with the insert-marker sentence only.
  - A's tree (`remount3-atree.json`) appends the tempo-seed sentence.
- `browserVerified` and `realVerified` are false. PERF, PLAY, FOLLOW, VIDEO, NARROW, MUTANT and UNIT did not run in C. So PERF-10a is **not done**; the status board shows it as ბაგია.
- A's own figures are A-reported and not independently verified: play rows 70 → 28, cover 1273/1273, mutants red.

## 3. Ruling on C-R357-01: (b), restore HEAD (D-29z1156)
- **Why not (a).** PERF-10a promised no behaviour change. The visible delta exists only because the tempo seed re-runs on every remount. That re-run is itself a pre-existing defect (A-R357-TEMPO-SEED-REMOUNT-DUP). Accepting (a) would bake that defect's output into a perf round.
- **Mechanism.** It is the smallest change that keeps B's ruled form for every play/stop transition:
  1. The follow leaf calls `onPlayingChange` only on a transition. It uses a prev-value ref, which is StrictMode-safe.
  2. A StudioWorkspace mount effect, declared after the tempo-seed effect (HEAD's position), calls `syncFollowWithPlayback(committedIsPlayingRef.current, true)`.
  3. Its stopped branch keeps HEAD's **string** write at mount, so the re-announce (sequence +1) is preserved.
- **B's evidence, on a scratch made from `git archive HEAD` + A's diff + the delta (`b-round-357/`):**
  - RM1 and RM2 (new `follow-remount-ui.test.tsx`) are **red on A's tree**, green on HEAD and green on the sketch. They are C-R357-01's two halves in jsdom.
  - M-B5 (no mount effect) and M-B6 (functional mount write) are red.
  - The covering set is 71 files, 1290/1290.
  - `typecheck` rc 0, and Biome rc 0 on the two changed files.
  - **C's own remount probe** on a sketch dev server equals HEAD's on all 7 steps (`remount3-sketch.json`).
- **Perf was not re-run by B.** The delta adds no component and no render. A-PERF and C's PERF still run with 357's expected values.
- **M-B1–M-B4 were re-run on the sketch** with A's round-357 builder (`b-round-357/mutants/make-mutants-on-sketch.py`). Their red sets are identical to A's round 357: 3, 2, 18 and 9 names (`b-round-357/mutants/sketch-m-b*-red.txt`). The task asserts equality to these measured sets (L58).
- **Claims:** `b-round-357/claims-358.sh` re-runs K1–K15 and adds K16–K20. The planning and sketch outputs are saved, and K20 shows 15 cited artifacts, 0 missing.

## 4. Routing (D-29z1157)
- Into `open_findings` and `deferred_low_polish` (the 2026-10-23 rule):
  - A-R357-REVIEW-SPLIT-RENDER-LATENT;
  - A-R357-REVIEW-FWPB1-TIMING;
  - A-R357-REVIEW-READ-POLICY;
  - A-R357-TEMPO-SEED-REMOUNT-DUP.
- **A-R357-TEMPO-SEED-REMOUNT-DUP** is pre-existing by trace. Tempo and grid state live in StudioWorkspace, so a remount resets them. C's record row PRE-REMOUNT checks it on HEAD in round 358, including whether a typed BPM is lost. If it is, B re-evaluates the severity as a state-loss finding.
- **C-R357-01** is open as Medium, with the fix in round 358.
- **Architecture note → signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS** (not scheduled). It joins the repeated, non-blocking checkpoint request `b-round-356/root-request-arch-checkpoint.md`.
  - **Request to root:** a bounded `frontend-architect` checkpoint. This feature boundary (the 11th store, the `useArrangement()` shape invariant in `architecture-checkpoint.md:33`) has been flagged since round 339.
  - It does not block PERF-10a.

## 5. Order (D-29z1158, unchanged)
1. Round 358: PERF-10a re-dispatch.
2. REGRESSION, at any planning on or after 2026-11-08.
3. PERF-10a-BUDGETS.
4. PERF-10b.
5. PERF-9 and PERF-11…15.
6. STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries.

RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

**Lesson candidate**, parked for RETRO 368 because `lessons.md` is already at 60 lines: "When a task moves an effect into a child, it lists the parent's sibling effects that write the same state and their mount order, and it carries a remount row."

## 6. Files written by B
- `tasks/round-357.md` (a copy) and `current-task.md` (round 358).
- `b-round-357.md` and `b-next.json`.
- `backlog.json`, v320 → v321. The backup is `b-round-357/backlog-before-358.json`, and the script is `b-round-357/update-backlog.py`.
- `feature-status.md`. The backup is `b-round-357/feature-status-before-358.md`.
- `b-round-357/`: the sketch patches, logs, mutants, claims and probe output.

B did not modify `store/`. All sketch work ran in `/home/runner/b357-scratch`. The one side effect is that the scratch dev server shared and re-optimised the cache `node_modules/.vite` through the symlink. That is cache only, and the task tells C to restart :5173 if it is stale.

## 7. Readiness for commit
Not ready. PERF-10a has no C PASS. Root publishes only after C PASS on round 358 and the gate.
