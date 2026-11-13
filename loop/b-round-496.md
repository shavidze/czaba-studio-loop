# B round 496 → 497 planning (2026-11-13)

**Decision: CONTINUE.** The next round is 497: DPG-BUTTON-CLEANUP stage 1 completion. A applies a test-only addendum; C runs the full C0–C15 table.

## Inputs read
- `context/active-summary.md`
- `current-task.md` (round 496), now archived byte-identical as `tasks/round-496.md`
- `a-round-496.md`, `c-round-496.md` and `c-round-496.json`
- `gates/gate-round-496.json`: `skipped`, "C taskStatus BLOCKED". The baseline stays HEAD `3bcf8cb` plus the 13-line round-496 worktree.
- `regression-last.json`: 2026-11-13, next on or after 2026-11-16, so it is not due.
- `env-status.json`: store 200.

## Round 496 result (D-29z1778)
- **A STOP:** two code-reviewer Mediums in the sketch's test lines. **C:** BLOCKED, with only C0/C13 passed (L22) and `browserVerified` false.
- **Backlog: nothing is marked done.** C's `measure.mjs` run is labelled a non-acceptance observation, so the following stay open, now dispatched to round 497:
  - DPG-BUTTON-CLEANUP;
  - B-R496-404-BROWSE-STORE-UNSTYLED.
- C reported 0 bugs, and no Critical/High is open from C.

## Ruling (D-29z1779): option (a), a test-only addendum
- **Evidence that the gaps are real.** B wrote 8 mutants (`b-round-496/mutants-497.sh`): retired selectors in `utilities.css`, `a.button`, `.btn-secondary`, a variant hover, a size gap, the class order, the destructive text colour, and `bg-brand` on Browse Store.
  - All 8 **survive** A's round-496 tests (`mutants-497-on-a496-tests.txt`).
  - All 8 are **red** with the addendum (`mutants-497.txt`).
- **The reviewer's suggested regex was wrong.** `(?<![\w-])\.` cannot match `a.button`, the reviewer's own example; B's self-test failed on it. The addendum drops the lookbehind. Tree hits are 0, and HEAD `app.css` has 6.
- **tech-lead (read-only consult): APPROVE** (`b-round-496/addendum-review.md`).
  - Adopted: point 3 (the HEAD self-consistency pin) and point 4 (one pill render).
  - Not adopted: point 2 (render cost is about 1.5 s, under the timeout) and point 5 (cosmetic; no assertion is removed).
- **Pre-check on a scratch copy of the worktree** (removed afterwards):
  - tsc rc 0, Biome rc 0, covering tests 42/42 (logs in `b-round-496/`);
  - **full suite 295 files / 4,316 tests, rc 0** (`precheck-full.log`);
  - claims rc 0 on the real tree;
  - `git apply --check` passes on the real tree, and the result equals `r497-post-test-sha.txt` (patch sha `853dc262…`).
- **Advisor (available, used twice: after orientation and at the closing check), D-29z1781:**
  - BC1b got a 20 s timeout, because it took 2.46 s under full-suite load against vitest's default 5 s;
  - C12's content check is restored. B read the DESIGN_SYSTEM diff against `Button.tsx`, and it matches;
  - C11's copy now excludes `.git`;
  - A's code review is scoped to the addendum;
  - retro candidate RC-R496-SKETCH-TEST-STRENGTH.

## New and updated ids (backlog v490; D-29z1778…D-29z1781)
- **Medium, origin `A code-reviewer`, dispatched round 497:**
  - A-R496-CR-GS3-GUARD;
  - A-R496-CR-BC1-PIN.
- **Lows** (`deferred_low_polish`, D-29z1780):
  - **Pre-ruled, so a re-raise is not a STOP:** A-R496-CR-LINK-DISABLED-VISUAL-ONLY, A-R496-CR-BC5-CLASS-ONLY, A-R496-CR-SIGNED-IN-SKELETON-SHIFT (now measured by C row C15) and A-R496-CR-BC6-BARE-BUTTON-TOKEN.
  - **Fixed by the addendum; they close on C PASS:** A-R496-CR-BC3-SELF-DERIVED and A-R496-CR-BC4-NEAR-VACUOUS.
- **Reviewer #11** is the existing SIG-R496-UNLAYERED-A-TRANSITION (DPG-CSS-DEDUP).
- **Architecture note:** none from the code-reviewer ("class ownership stays in Button.tsx"). No architecture checkpoint is requested: this is a small, isolated test-only addendum on one owner.

## No source change by B (proof at hand-off)
B wrote only loop artifacts. At hand-off:
- `git status --short --untracked-files=all` = 13 lines, the same as at the start;
- the r496 manifest, the protected manifest, `r497-a496-frozen-sha256.txt` and `r497-pre-test-sha.txt` are all rc 0.

## Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - stage 1 is not C-accepted;
  - DPG P1/P2 and the DP gate;
  - STORE-2c..5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE remainder, T12-ADVANCED, phase 2, STEM-LANES;
  - the High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (root);
  - the deferred Lows.
- **Not BLOCKED.** Round 497 needs no external input.

## Order after 497 (unchanged, D-29z1776)
1. DPG-BUTTON-CLEANUP-2. REGRESSION comes first if planning happens on or after 2026-11-16.
2. DPG-CSS-DEDUP, COLOR-CONSOLIDATE and FONT-RESOLVE.
3. The DP-gate re-run, then P2.
4. RETRO 510.
