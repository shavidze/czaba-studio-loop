# B round 332 → 333 planning

**Decision: CONTINUE.** Round 333 is PERF-DRAG-PREVIEW stage c2b-ii, specified in `current-task.md` (D-29z984…D-29z994, backlog v292).
- **Baseline:** `de28cca`, the published gate-332 commit, with a clean tree.
- **Archive:** the round-332 task is saved as `tasks/round-332.md`, a byte copy of the old `current-task.md`. No archive existed before this planning.

## 1. Round 332 result (from C's evidence)
- **C round 332:** PASS, `browserVerified`/`realVerified` true, 11 rows, 0 bugs, nothing blocked (`c-round-332.json`).
- **Gate 332:** published `de28cca` on both remotes (`gates/gate-round-332.json`). Review: COMMIT OK, 9/10, no Critical issue (`gates/round-332/review.md`).
- **Stage c2b-i → done** (D-29z984). Fade 13.767 → 10.817 per move (max 11); OVERVIEW-SHOWN and METER-SHOWN equal HEAD; the export sha is equal.
- **Closed:** GATE331-S1 (as ruled), GATE331-S2 and GATE331-S3.
- **Rulings:**
  - **A's l.5 doc edit** beyond the task is accepted (D-29z985).
  - **A-R332-REVIEW-OVERVIEW-PROP-TYPE** (latent Medium per A's reviewer) → info SIG-R332-OVERVIEW-PICK, folded into checkpoint D-29z915, L46 deadline RETRO 336 (D-29z986).
    - C found 0 overview diffs, and the gate reviewer traced the same independently.
    - A's loop-toggle Low → a named REGRESSION row; the other A Lows → `deferred_low_polish` (A-R332-REVIEW-LOWS).
  - **Gate-332 suggestion 1** (`heldRef` written during render) → info GATE332-S1-HELDREF-RENDER, accepted as is (D-29z987).
  - **The gate architecture note** → evidence on ARCH-R331-PREVIEW-READERS.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are unchanged old checkpoints (2026-10-07), with no new finding ids. `root-review.md` round 332: COMMIT OK.
- **User-review:** no new decision files. `direction-decision.md` already exists and is recorded.

## 2. Why stage c2b-ii, and not REGRESSION
- `regression-last` is 2026-11-02 and today is 2026-11-04, only 2 days. The speed rule triggers at 3, so REGRESSION is not due.
- D-29z982 had assumed round 333 would be planned on 2026-11-05 or later. That did not hold, and the timing is corrected in D-29z988: REGRESSION is the first round planned on or after 2026-11-05.
- Its `scope_additions` gain a c2b-ii row and the loop-toggle row.
- No Critical, High or Medium finding is open in this stream. The 5 Medium findings in the active summary are Tech Lead/manual, `awaiting_user` or root-only items, as already ruled.

## 3. Consults (read-only)
- **`performance-optimizer`:**
  - The render-phase sentinel is safe: `Object.is` stops a `NaN` loop, it adds no extra commit, and it is safe under StrictMode and concurrent rendering. Nothing read the input after the commit.
  - Seed the initial state.
  - PeakPath primitive props: small value (about 2 per plain move, 0 per trim), moderate risk → its own stage.
  - New candidate: ArrangementDetailClipGain is not memoised and takes inline callbacks → signal PERF-CAND-DETAIL-CLIPGAIN-MEMO.
- **`tech-lead`:**
  - Seed instead of `null`, and keep the helpers at module level.
  - Optional `is` prefix → adopted (D-29z993).
  - Add rows: trimEnd, range on/off the clip, Enter-apply, Undo, focused input → DP38–DP42.
  - PeakPath → c2b-iii.
  - c2b-ii does not wait for D-29z915. The dependency of the render counts on the selection path is recorded (D-29z992).
- **Not consulted:** `product-designer` and `ableton-arrangement-expert`. This is a perf round with no visible or audible change, so reference-first, the screen budget and the YouTube request do not apply.

## 4. B's sketch and what it caught (all under `b-round-332/`)
- **Final sketch (v2):**
  - **Patch:** `sketch/sketch.patch.txt`, 2 files; `git apply --check` is clean on `store/`.
  - **Tests:** covering 37 files 613/613 (`covering-unit.log`); typecheck rc 0; Biome clean. The slowest row in the file takes 389 ms.
  - **Mutants:** 6/6 red, and the file is restored (`mutants-summary.txt`).
  - **Perf** (production build, spec alone): rc 0; 103 rows EQUAL and 18 DIFF vs C round 332, every one lower (`perf-rowcmp-vs-c332.txt`):
    - trim 23.6 → 21.633 per move;
    - move 28.2 → 26.233;
    - range 9.233 → 7.267 (asserted rows);
    - click commits 3 → 2 and components 102 → 100;
    - select 24 → 22;
    - `hook-live` 2 → 1 (assert ≥ 1, still passing → SIG-R333-HOOK-LIVE-MARGIN, D-29z991).
  - **Names** (`names-sketch.json`, `names-compare.txt`): click [100, 0], fade [11 ×4], trim [22 ×4], move [21, 21, 103, 21]. Only the `[ArrangementDetailContentInner, host]` commits are lost, and every other commit's name multiset is equal.
- **Caught before dispatch:**
  1. **DP37 v1** assumed the deselected inputs keep the typed text. HEAD shows `''`, because the content is keyed by clip id and remounts. The row was rewritten as a HEAD pin, and both consults confirmed the remount.
  2. **DP40 v1** assumed Enter clamps an out-of-clip Start. HEAD refuses it as invalid. The row now pins the HEAD behaviour, and it is green on HEAD's source.
  3. **The v1 sentinel was seeded with `null`,** which costs one more render pass per mount. v2 seeds it. The perf output is identical; v1 is kept (`sketch/sketch-v1.patch.txt`, `mutants-summary-v1.txt`, `perf-sketch-results-v1/`, `perf-rowcmp-vs-c332-v1.txt`).
  4. **The duration and on-clip comparisons were unguarded** in v1's mutant set. DP38 and DP39 plus two new mutants close that.
- **Environment-invalid attempt (kept):** the names warm-up crashed on a cold compile (`names-warmup.log`). The measured run came after it.
- **Claims:** `claims-333.sh` → `claims-333-planning-output.txt` (HEAD) and `claims-333-sketch-output.txt` (sketch).
- **Lessons:** unchanged. A candidate for RETRO 336 (seen once): a HEAD-pin row must be run on HEAD's source before it is written as a pin (DP37, DP40).

## 5. Architecture checkpoint
- D-29z915 has no recorded answer. Round 333 does not touch `StudioWorkspace.tsx`, so it does not wait.
- c3 still waits for the checkpoint if it is answered by then, as in the round-331 addendum.
- Gate 332 added signal 3/4 evidence to ARCH-R331-PREVIEW-READERS. No new addendum is written, because the request is already open with root.

## 6. Order after round 333
1. REGRESSION: the first round planned on or after 2026-11-05.
2. c2b-iii (PERF-CAND-PEAK-PRIMITIVE-PROPS).
3. c3 (after the checkpoint, if it is answered by then), c4, c5.
4. The record → assert conversions (PERF-CAND-FADE-BUDGET).
5. PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

The next RETRO is at round 336 or at the end of STUDIO-PERFORMANCE, whichever comes first.

## 7. Commit readiness
Round 332 is already published (`de28cca`). Round 333 is ready only after C PASS and the root gate.

## 8. Advisor
The configured advisor was available. It was used before the approach: c2b-ii vs REGRESSION, the rulings and the sketch plan. It was called again for the final review before declaring the round done.

## 9. Housekeeping
- **Scratch:** `/home/runner/b332-scratch/sc` (a git repo on `de28cca`'s tree, with the v2 sketch applied). Vite cache: `/tmp/b332-vite-cache`. Neither touches `store/`.
- **Dev server:** `:5198` is stopped. The scratch `vite.config.ts` is restored.
- **Store:** unchanged; `git status` shows 0 entries.
- **Backups:** `b-round-332/backlog-before.json`, `b-next-before.json`, `feature-status-before.md`. The update scripts are `update-backlog.py` and `update-feature-status.py`.
