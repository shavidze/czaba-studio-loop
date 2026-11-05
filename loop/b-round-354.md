# B — Round 354 → 355 planning

## Round 354 outcome (evidence only)
- **C passed round 354.** `c-round-354.json`: PASS, `browserVerified` and `realVerified` true, 0 bugs. The rows were CLAIMS, SOURCE-SCOPE, READ, PERF, PERF-LIB, VIDEO-DRAG-SMOKE at both viewports, G354-AUTH, RT-FIX-354, DOCS and C's own mutant.
  - PERF: 82/82 asserted, 0 NEW, none above C350, `durationMs` 478956.
- **Gate 354 published `7219291`** on both remotes (`gates/gate-round-354.json`). That commit is the round-355 baseline. HEAD is clean.
- **What this closes:** PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 → **მზადაა** in `feature-status.md` (D-29z1140). Twelve asserted rows now guard the video trim/fade costs.
- **Still open:**
  - The fake-bearer row (500, mock :5199 down) stays open backend evidence. It is not a bug.
  - C's own mutant C-MUT-1 stayed green with every row EQUAL. It is recorded as INFO-C354-MUT-VACUOUS and is not red evidence.
- **Archive.** `tasks/round-354.md` is a byte copy of the round-354 task. Nothing was deleted.
- **Backlog:** v317 → v318 (`b-round-354/update-backlog.py`, D-29z1140…D-29z1144). Backups are `b-round-354/*-before-355.*`.

## Gate 354 review (D-29z1141)
- **GATE354-S1 (Low):** the "Record until…" clause in the 12 notes. Folded into PERF-CAND-VIDEO-MOVE-BUDGET, the next budgets-only edit.
- **GATE354-S2 (Low):** near-zero headroom. Ruled intended (doc 232 item 107) and closed.
- **Architecture note** (doc 232 grows every stage): signal GATE354-ARCH-DOC232-SPLIT, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE. Not scheduled.

## Round 355 = SYS-R353-DP-TEST-POLISH (D-29z1142)
- **Why now.** There are no C bugs and no open schedulable Critical, High or Medium. REGRESSION is due on 2026-11-08, and today is 2026-11-05. This is the next queued item (D-29z1139).
- **Scope:** test-only. `drag-preview-render.test.tsx` (DP69, DP70, DP72) and doc 232. It closes four Lows on C PASS.
- **B's evidence (L58).**
  - The scratch `/home/runner/b354-scratch/sc` is a `git archive` of `7219291` with the sketch applied: 74/74; Biome rc 0; typecheck rc 0; shuffled order 74/74 twice.
  - **Every tightened assert has a mutant that is red on the sketch and green on the HEAD test file** (`b-round-354/sketch/mutant-summary.txt`):

    | Mutant | Assert it proves |
    |---|---|
    | M-B1-LATE | the 20 ms window → timer drain |
    | FX-SHORTDRAG | distance > 0.01 |
    | A-M5 | DP69 writes nothing |
    | M-B8 and M-B9 | the DP70 gap |

  - M-B6's first red line in DP72 is now the exact `toBe`.
  - Every prediction was written in `checkpoint.md` before its run.
- **Rulings.**
  - The DP70 caption check is removed: it is `''` in every state, and DP64 covers the caption.
  - The `'Video Fade In'` literal stays, because exporting the label is app source.
  - The coverage limit (rAF stub, timers saved at module load, the playing path) is recorded in doc 232 item 111.
- **Review.** `tech-lead` found 0 Medium+ (`sketch-review.md`, which opens with the sha256s). TL-R355-1, -3 and -4 are fixed in the sketch, -2 is ruled keep, and -5 is info.
- **Claims.** `claims-355.sh` has 11 tags. The planning and sketch outputs are saved, stderr is empty, and K11 reads 24 listed, 0 missing.
- **Not fired:** GATE352-S1's trigger. Round 355 does not touch the dock.

## Policy recorded (D-29z1143)
The 2026-11-05 parallel-execution policy was missing from the backlog (L42).
- Root lanes: COPY-PD (export/*, StudioToolbar.tsx) and SRW-21-PLAN (docs).
- Round 355 overlaps neither.
- K2 accepts a HEAD that descends from the gate commit through root-lane paths only.

## Scope and rules kept
- **No source edits by B.** The sketch and mutants live in `/home/runner/b354-scratch`, and the store tree is clean.
- **Protected files:** 11/11 (K6).
- **`/studio-lab`** stays demo-only and anonymous. G355-AUTH re-checks the purchase guard.
- **Nothing was cut or deferred without Saba.** The open Saba questions remain non-blocking: ROOT-REQ-PERF-TIMEOUT, SR-353-1/4 and the others.
- **Architecture checkpoint.** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is still requested from root (D-29z1129). It is not needed before PERF-CAND-VIDEO-MOVE-BUDGET, PERF-CAND-FADE-RELEASE-COMMITS or PERF-9.
- **`lessons.md`** is unchanged (60 lines). There was no Saba-found issue and no new lesson class.

## Advisor
The advisor was available and was used twice.

**Before the substantive work.** It set:
- the per-finding mutant proofs;
- the fixture mutant for the distance guard;
- the rAF-stub point;
- the root-lane K2 rule;
- the gate-354 bookkeeping.

**At the close.** It led to four changes:
1. Both patches are regenerated with `git diff` on a fresh `git archive 7219291` and re-applied there. Both files are byte-equal to the sketch (`sketch/patch-reproduce.txt`).
2. The FAKE-TIMER-LEAK row now proves the order really changes: in seed 1, DP72 sits at index 27 with 46 tests after it (`sketch/shuffle-runs.txt`).
3. The doc 232 TODO has a single "next" line.
4. §3 notes the `runAllTimersAsync` 10 000-timer abort.

K10 and both claims outputs were re-run afterwards: stderr empty, K11 reads 27 listed, 0 missing.

## Readiness
Round 355 changes 2 files: a test file and doc 232. It is ready for A. Nothing is publishable until C passes and root's gate runs.
