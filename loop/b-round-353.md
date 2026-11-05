# B — Round 353 → 354 planning

## Round 353 outcome (evidence only)
- **C passed round 353 (RETRO 353).** `c-round-353.json` says PASS, with `browserVerified` and `realVerified` true. All 11 rows passed: RT-SCREEN, G353-AUTH and STUDIO-SMOKE-353 at both viewports, and the document rows. C found 0 app bugs. Gate rows are not claimed.
- **Bookkeeping check.** B re-ran `tools/l57-check.py` on C's JSON: rc 0 (`b-round-353/l57-check-c353.txt`).
- **Baseline.** Gate 353 was `skipped`, because nothing changed. The round-354 baseline stays `a55543b`, and HEAD is clean (K1, K2).
- **Backlog** (v316 → v317, `b-round-353/update-backlog.py`, D-29z1135…D-29z1139):
  - round 353 → `c_pass`, and RETRO 353 → **მზადაა** in `feature-status.md`;
  - C-R353-01 and C-R353-02 are recorded and closed by B's fix.
- **Archive.** `tasks/round-353.md` is a byte-equal copy of the round-353 task. Nothing was deleted.

## C findings against B text (D-29z1136)
- **C-R353-01.** L58 had lost the "fixed in the sketch or ruled" alternative. It is restored in l.41, the only hunk (`b-round-353/lessons-diff.txt`). The file is still 60 lines. C re-checks it in RT-FIX-354.
- **C-R353-02.** The undo label for a cross-lane drag is "Move to track — <lane>" (`strings.ts` l.701), and the token row now names `?product=&file=`. Both are fixed in the round-354 rows.

## Round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 2
- **Why now.** Planning date is 2026-11-05, before REGRESSION, which is due on 2026-11-08. The outcome table of task 353 sends a C PASS to this stage.
- **Shape (D-29z1138).**
  - 12 of the 22 video trim and fade rows become `assert` at C round 350's values.
  - 10 stay `record` under the file's own rules: wallclock rows, `release-restarts`, and the unexplained video-fade `release-commits` (which goes to PERF-CAND-FADE-RELEASE-COMMITS). This is not a scope cut.
  - The task says this explicitly, because earlier text said "22 rows → assert".
- **B's evidence.** The perf spec ran on the sketch in production, alone (L58):

  | Run | Result |
  |---|---|
  | Sketch | 82/82 asserted rows pass, 0 NEW, 0 deterministic rows higher than C350; 488086 ms |
  | M-B2′ | 16 red: the 6 new video component rows and 10 audio rows |
  | M-B2 | **exactly the 6 new rows red, every audio row green.** No existing row caught this regression |

  Each prediction was written in `checkpoint.md` before its run. One M-B2′ guess was wrong: lane, group and video-move stayed green. It is recorded as measured.
- **Review and claims.**
  - `sketch-review.md` opens with the sha256s. `tech-lead` found 0 Medium+, and both of its Lows are fixed in the sketch.
  - PERF-LIB is 40/40 on the sketch.
  - Both patches reproduce the sketch byte for byte.
  - The claims script `claims-354.sh` has 11 tags. Both outputs were saved, and stderr was empty.
- **Doc 232.** l.4 moves to the L28 form: `…, video-trim-fade-cost-2; C round 354 PASS)`. After the patch, no implementation doc has the `pending` form (K5).
- **New candidate: PERF-CAND-VIDEO-MOVE-BUDGET.** Under M-B2 the video-move per-move value went from 9.883 to 15.75, and it still passed `<= 24`. It is queued as one budgets-only step after SYS-R353-DP-TEST-POLISH. It is not added to this round.

## Scope and rules kept
- **No source edits by B.** Nothing in `store/` was touched; the sketch and mutants live in `/home/runner/b353-scratch`. Protected files are 11/11 (K6).
- **Access.** `/studio-lab` stays demo-only and anonymous. G354-AUTH re-checks the purchase guard.
- **Scope.** Nothing was cut or deferred without Saba. SR-353-1 and SR-353-4 were measured by C and stay `awaiting_user`. ROOT-REQ-PERF-TIMEOUT stays a Saba question; the new evidence is 488086 ms.
- **Architecture checkpoint.** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is still requested from root (D-29z1129) and has no answer. Stage 2 does not need it. PERF-CAND-MASTER-GROUP-FADER-PROPS does; if it is still unanswered then, B runs PERF-CAND-FADE-RELEASE-COMMITS or PERF-9 first (D-29z1139).
- **Root files.** `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and add nothing new.

## Advisor
The advisor was available and used twice: before the substantive work and before closing. The first call set:
- the 12/10 split;
- reusing M-B2′ instead of writing a new mutant;
- the L28 l.4 form;
- routing C's two Lows to B's own text.

## Readiness
Round 354 changes 2 files: a budgets JSON and doc 232. It is ready for A. Nothing is publishable until C passes and root's gate runs.

The closing review led to three changes:
- K11 now covers every cited artifact (`b-round-353/cited-artifacts.txt`);
- B confirmed that the M-B2 run used the dispatched budgets file (`perf-mu-b2.sha256`, `c212eec…`);
- `retro_runs[353]` is closed (`b-round-353/patch-retro-runs.py`).
