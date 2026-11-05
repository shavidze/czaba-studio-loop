# B round 356 → 357 planning

**Decision: CONTINUE.** Round 357 = PERF-10a, the playback store: `isPlaying` leaves the ArrangementContext value. The task is in `current-task.md`. The round-356 task is archived as `tasks/round-356.md`, a byte-equal copy; nothing was deleted.

## 1. Inputs read
- `context/active-summary.md` and `tasks/round-356.md`.
- `a-round-356.md`, `c-round-356.md`, `c-round-356.json`.
- `gates/gate-round-356.json` (published `d49536b` on both remotes) and `gates/round-356/review.md`.
- `lessons.md`, `regression-last.json`.
- Backlog ids were looked up only by id.
- `docs/technical/performance/perf-plan.md` (PERF-9/10 rows) and `oss-adoption.md`, as PERF planning requires.
- `root-pre-push-review.md` and `publication-checkpoint.json`: neither has a new open item for the loop.

## 2. Round 356 closed from C's evidence (D-29z1149)
- `c-round-356.json` is PASS, with `browserVerified`/`realVerified` true and 0 bugs:
  - PERF 84/84, with 0 NEW;
  - C's own mutant M-C1 was red on all 3 new asserts;
  - VIDEO-DRAG-SMOKE and G356-AUTH passed at both viewports.
- The fake-bearer 403 sub-check is `blocked` because mock :5199 is down. That is the cloud backend rule, not a browser gap; it stays as open backend evidence.
- B's `tools/l57-check.py` gives rc 0, with 2 `null` fields that carry a reason (`b-round-356/l57-check-c356.txt`).
- Closed: PERF-CAND-VIDEO-MOVE-BUDGET (done, მზადაა) and GATE354-S1.
- Gate 356's review is routed by D-29z1150: GATE356-I1 info, the title note joins GATE354-ARCH-DOC232-SPLIT, and the signal GATE356-ARCH-BUDGET-NOTE-TEMPLATES is not scheduled.

## 3. Choosing round 357
- **The architecture checkpoint is still unanswered.** I found no answer artifact in the loop folder or in `store/.claude/references`. So PERF-CAND-MASTER-GROUP-FADER-PROPS keeps waiting.
- **PERF-CAND-FADE-RELEASE-COMMITS (D-29z1151).** B probed it at HEAD in dev and in production (`b-round-356/fade-release-*.json`). It is closed as named, with no fix:
  - commit 2 is only `ArrangementStatusTextInner`, when the status preview is cleared;
  - commit 3 is a 0-component commit after the click, and its `setState` was not identified.

  `tech-lead` agrees and suggests `<= 3` upper-bound asserts, which go to PERF-10a-BUDGETS. Spending a round on it would cost more than ≤ 1 component per release is worth.
- **PERF-9 (D-29z1152)** has no network stem path in `/studio-lab`, so its browser half cannot run yet. It gets a dependency note, not a deferral.
- **PERF-10 is next.** I re-measured its premise (`b-round-356/play-click-names-head.json`): Play and Stop are 1 commit with 70 components each, and the only provider hook that changes is `isPlaying`.
- **Consults:**
  - **`performance-optimizer`:**
    - `isPlaying` is the right first slice, at about 28 components after it. The Transport subtree of about 22 is the floor until PERF-10b.
    - Run the Follow effect in a memo leaf, not in `store.subscribe` (timing).
    - Use a committed-mirror ref for the 7 event-time reads.
    - MarkerRow should read `getState()`.
    - The mutant is "the provider subscribes again".
  - **`tech-lead`:**
    - Safe without the checkpoint, under four conditions:
      1. nothing high in the tree subscribes;
      2. one writer for the ref and the store;
      3. `data-playing` is kept;
      4. the dock effect changes only its source.
    - Remove the field rather than keep a getter (precedent D-29z894).
    - 46 test files and 262 reads are affected, and 0 tests mock the context.
- **B's sketch settled the getter question with evidence.** The getter variant broke every spread probe: `{ ...useArrangement() }` copies the getter once (TG11, `b-round-356/precheck-full-getter-variant-killed.log`). The removal variant with one shared probe helper is what the task specifies.
- **Architecture.** The 11th provider store reaches the ARCH-R338-STORES-PROVIDER trigger. I repeated the root request with question 1b in `b-round-356/root-request-arch-checkpoint.md`. It is non-blocking: `tech-lead` points to the PERF-8b precedent, and a later consolidation moves one more store.

## 4. B's sketch evidence (scratch `/home/runner/b356-scratch/sc`, git base `b61245b`; it does not survive the job — use the loop-folder copies `b-round-356/sketch/{source,tests}.patch.txt` (sha256 in `b-round-356/sketch/patches.sha256`), which pass `git apply --check` on `d49536b`)
- **Sketch:** `b-round-356/sketch/source.patch.txt` + `tests.patch.txt`, hashes in `sketch/patches.sha256`. Both pass `git apply --check` on HEAD.
- **Source changes:** 7 files. One shared probe helper replaces `useArrangement()` in 46 test files (class ruling R, `tsc-removal-files.txt`). New rows: PS1–PS3, RB-PB1, RB-PB2 and FW-PB1.
- **Full vitest on the final sketch:** 246 files, 3632/3632 (`precheck-full-final.log`). Covering set: 48 files, 962/962.
- **Mutants:**
  - M-B1 (the provider re-subscribes) turns the render-budget rows red, and in production perf play goes 28 → 71.
  - M-B2 (StudioWorkspace subscribes) turns RB-PB2 red.
  - M-B3 (no committed ref) turns 18 Follow tests red.
  - M-B4 (no HEAD pre-check on stop) turns FW-PB1, FW6, FW10, LT15, LT21, DP16 and the render rows red.
- **Production perf:** play start/stop components **70 → 28** at 1× and 6×. Every other row is equal to C356, 84/84 pass, and `durationMs` is 488158 (`perf-summary.txt`).
- **Sketch review** (`tech-lead`, `sketch-review.md`), three Medium findings:
  - The status order when a stop comes from outside a React event. Fixed defensively. The first form added a stop commit (1 → 2) and was rejected. jsdom cannot reach the split commit, so the browser half is C's VIDEO-FAIL-STOP row.
  - The render-budget positive control. Fixed.
  - The R9-L2 identity checks. Fixed with a raw probe.
- **Lows:** 5 and 6 are fixed. 4 and 7 are info. 8 is routed as B-R356-PLAYBACK-SETTER to `deferred_low_polish`, with PERF-10b as its fix home.

## 5. Gates and dates
- REGRESSION is not due: `regression-last.json` is 2026-11-05, so the next one falls on or after 2026-11-08.
- RETRO is due at round 368 or at the end of STUDIO-PERFORMANCE.
- No Critical or High finding is open. The 5 open Mediums are tech-lead-manual, awaiting_user or root-only (`context/active-summary.md`), so none is schedulable app work.

## 6. Advisor
The configured advisor was available. I consulted it after orientation, before writing, and again before declaring done.

## 7. Next (D-29z1154)
1. REGRESSION, at any planning on or after 2026-11-08.
2. PERF-10a-BUDGETS.
3. PERF-10b.
4. PERF-9, after its harness decision.
5. PERF-11 … 15, then SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and the phase-2 entries under the skip rule.

B made no store change: `store/` git status is clean. The sketch lives only in the scratch copy and in `b-round-356/sketch/*.patch.txt`.
