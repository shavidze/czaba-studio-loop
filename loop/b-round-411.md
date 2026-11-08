# B round 411 → 412 planning

**Date:** 2026-11-08.
**Advisor:** used, after orientation and before the ruling. It agreed with option (b) and named the delta-patch mechanics, the discriminating mutant, the doc 264 re-grant and the B-side miss record.
**Consults:** `tech-lead`, twice: v6 got APPROVE WITH LOWS, and the v6.1 delta got APPROVE WITH LOWS. No Medium or higher in either.
**Checkpoint:** `b-round-411/checkpoint.md`.

## Round 411 result (independent evidence)
- **C: FAIL** (`c-round-411.json`). A stopped under L11 on **A-R411-REVIEW-M1** (Medium), and C confirmed it by reading the code.
- **Gate 411 was skipped** (C FAIL), so nothing was published. HEAD stays `328db74`, and the round-411 work stays uncommitted in the tree: 12 granted lines, kept.
- **Browser rows 3, 4, 5a and 7 passed** at both viewports on this exact runtime (`browserVerified` true). They are recorded as evidence, **not** as done:
  - rows 2, 5b, the mutants, 8, 9 and 11 were not run;
  - the stage FAILed.

  PERF-15b-i is **ბაგია**.

## Ruling (L10, D-29z1432)
**Option (b): fix M1, do not re-rate it.**
- Two reviewers rated it Medium.
- The 2026-10-23 bug gate fixes Mediums now.
- Doc 264 promises regeneration that reproduces the files exactly.

**The v6.1 delta** (`b-round-411/sketch-412-delta.patch.txt`, sha `833196f8…`, 2 files, no runtime file):
- **Generator:**
  - the AudioContext is pinned at 44100, and the script throws if Chromium does not honour that;
  - a non-ok audio response throws;
  - the browser is closed in a `try/finally`;
  - the channel `for` loop has braces;
  - all files are written only after both decodes succeed.
- **PS17:**
  - reads `sampleRate` from the meta and pins it at 44100;
  - ties the header's `sample_rate` and `samples_per_pixel` to that rate (this folds A-R411-REVIEW-L1);
  - runs the 48 kHz cross-check scaled from the meta rate.

**Evidence** (scratch `/tmp/b412`):
- Regeneration is byte-identical, 3 of 3 files.
- Mutants: 13 of 13 red. On the old v5 test, MU-412-META-RATE-48K and MU-412-HEADER-RATE-48K survive.
- `tsc` and Biome rc 0. Covering run: 425/425.
- Full vitest on v6: 264 files, 3,911/3,911.
- The cumulative patch, applied to `git archive HEAD`, gives the same 10 files.

**Rulings on the other findings:**
- **A-R411-REVIEW-L2** (a sha256 in the meta) and the **L5 test row** go to 15b-ii. Doc 264 l.31 is reworded now.
- **TL-R412-L-D and L-E** go to `deferred_low_polish`.
- **TL-R412-L-F** is fixed by the doc 264 wording.
- **The code-reviewer's Architecture note** becomes **SIG-R411-PEAKS-URL-COPIES**, a signal only, not scheduled.
- **B's own miss:** the v5 review approved the Medium. This is recorded as **B-R411-SKETCH-M1-MISSED**, an input for RETRO 416. INFO-A411-SKETCH-REVIEW-HEADER is resolved: line 1 of the new `sketch-review.md` names the dispatched sha.

## Next task: round 412
- **What A does:** apply the PERF-15b-i fix-up delta byte for byte and update doc 264 (l.4 becomes `In Progress (stage 2 of 3; C round 412 PASS)`, plus the M1 bullet and the 13 mutant lines). Doc 263 stays unchanged.
- **What C does:** verify the **whole stage in full**, rows 1 to 11. That includes:
  - patch identity against the cumulative patch;
  - C's own comparison of the held and ready heights;
  - the 410 probe (row 5b);
  - the 13 mutants;
  - a regeneration in a scratch copy only, which must be byte-identical;
  - the docs;
  - the Ableton 5.1.2 reference;
  - the screen budget;
  - the L57 fields.
- **Grants:** the same 12 paths, frozen at 1,300 entries. Protected files are untouched, and no auth file is involved.

## Queue and checks
- **Regression:** not due until 2026-11-10 (`regression-last.json` says 2026-11-07).
- **RETRO:** at round 416.
- **Open bugs:** no Critical or High is open. The open Mediums are root, manual or `awaiting_user` only, plus M1, which this round fixes.
- **Architecture checkpoint:** no new request this round. PERF-15 is mid-feature, and ARCH-CHECKPOINT-PERF11C-III-BOUNDARY (`ArrangementContext`) is still waiting for root. The two peaks signals (SIG-R410, SIG-R411) join it.
- **Commit readiness:** not ready. Nothing is ready to publish until C passes round 412.

## Files written
- `tasks/round-411.md`: archive of the round 411 task.
- `current-task.md`: round 412.
- `b-round-411/`, which holds:
  - the sketch patches;
  - the review;
  - the claims script and its outputs;
  - the mutants and the 48 kHz fixtures;
  - the sketch logs;
  - grants and the frozen list;
  - the update scripts;
  - the backups.
- `backlog.json`: v387.
- `feature-status.md`.
- `b-next.json`.
