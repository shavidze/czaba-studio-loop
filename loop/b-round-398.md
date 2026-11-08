# B round 398 → 399 planning (2026-11-08)

**Decision: CONTINUE.** Next task: round 399 = **PERF-14b-i**, harness readiness for clip virtualization (`current-task.md`). It touches only `perf/**` and docs; no `app/**` file changes.

## Inputs read
- `context/active-summary.md` and `context/active-backlog.json`.
- `current-task.md`, archived as `tasks/round-398.md` (a copy, not a move).
- `a-round-398.md`, `c-round-398.md` and `c-round-398.json`.
- `gates/gate-round-398.json`: `published` at `c3ee1d6`, so that commit is the baseline.
- `gates/round-398/review.md`, `lessons.md` and `regression-last.json`.
- Pre-edit copies: `b-round-398/*-before-399.*`.

## Round 398 result (taken only from independent evidence)
- **C PASS, all 7 rows:** SCALE-SPEC, PERF-RES, COUNT-BROWSER at both viewports, NO-VISIBLE-CHANGE, AUTH, SOURCE-SCOPE, DOCS.
  - `browserVerified` and `realVerified` are true. There are 0 bugs.
  - B re-ran the L57 check: OK (`b-round-398/l57-check-c398.txt`).
- Gate 398 published `c3ee1d6` on both remotes.
- **PERF-14a is done** (D-29z1362).
- **No open C bug.** Every open Critical/High/Medium finding is manual-only, `awaiting_user` or `open_root`.

## What B did
1. **Sketched PERF-14b in full** on a scratch copy (`/tmp/b399-scratch`, evidence under `b-round-398/`).
   - The lane renders only clips inside the page window, plus pinned clips. A clip is pinned while it is under an active press, or while it is a lane-move source.
   - New rows VZ1–VZ7. Rows WG2–WG5 gain a pin step; 0 assertion lines were removed.
   - **jsdom:** 7 of 7 mutants are red. The full suite failed only on WG2–WG5, before the pin step was added.
   - **Production build, 200 clips:**
     - page elements 950 / 1532 / 1868 (HEAD 4333 / 4303 / 4333);
     - zoom components per key 42.4 (HEAD 638).
   - **Browser mutants:** with no filter, the page asserts fail. A shifted window trips the new gap check 36 times.
   - **Per-frame probe:** 0 gap frames out of about 455, at both viewports. With select-all, 55 / 46 clips stay mounted. A held press keeps its clip mounted through a 2-page scroll.
2. **`tech-lead` review** (`sketch-review.md`): no Critical or High findings.
   - Medium: the pin is not released on window `blur` (touch and pen).
   - Medium: the interactions spec counts mounted clips.
   - Three Lows.
3. **Collision runs on the sketch:**
   - `studio-lab-interactions` aborts at its 30-clip build.
   - `studio-lab-resources` step e fails.
   - `stem-cache` and `studio-lab` pass.
4. **Pivot (advisor, D-29z1364):** split 14b into 14b-i (harness readiness) → RETRO 400 → 14b-ii (virtualization). No scope is dropped.
   - The patches are separate: `sketch-399-harness.patch.txt` (this round) and `sketch-14bii-lane.patch.txt` plus `sketch-14bii-budget-flips.patch.txt` (kept for 14b-ii).
   - **HEAD baselines saved for C:**
     - interactions: 189 deterministic rows (`perf-head-interactions.json`, rc 0, 8.3 min);
     - resources: 46 (`c-round-398`);
     - scale with the harness patch: 17 rows, no problems (`perf-head-harness-scale.json`);
     - perf/lib: 3 files, 54 tests.
5. **Rulings:**
   - M2/M3 (D-29z1363).
   - Rule R and the harness contract (D-29z1365).
   - Docs and the 4-stage count (D-29z1366).
   - `Q-14B-PIN-SELECTED`: selected clips are not pinned (D-29z1364).
6. **Bookkeeping:**
   - `backlog.json` v366.
   - `feature-status.md`.
   - Claims: `claims-399.sh`, with its planning and on-sketch outputs.
   - Grants, and a frozen manifest of 1285 entries.

## Backlog signals (not scheduled automatically)
- **Architecture signals:**
  - A-R398-ARCH-FIND-TIMELINE-SCROLLER (A's reviewer and the gate 398 reviewer);
  - PERF-CAND-14-SCROLL-HYSTERESIS.
- **To `deferred_low_polish`:** C-R398-NOTE-FIRST-RUN-1440 (environment), GATE398-L1-L5, and TL-R398-SK-L1-L3. Their fix homes are 14b-i and 14b-ii.
- **TL-R398-SK-M1** (sketch input, Medium): fixed in the 14b-ii sketch before that round is dispatched. It is not in app code.

## Architecture checkpoint
- ARCH-CHECKPOINT-PREVIEW-AFTER-13C, together with ARCH-CHECKPOINT-DECODE-REGION, is still due for root (`b-round-396/root-request-arch-checkpoint-due.md`). It does not block this round.
- Round 399 touches neither region.
- PERF-14b-ii is the next structural change to `ArrangementLane.tsx`. It is a natural place for a bounded checkpoint at the PERF-14 feature boundary (after 14c), and B will request it then.

## Readiness for publishing
- Round 398 has been published by root.
- Round 399 changes `perf/**` and docs only. Root may publish it after C PASS and the gate.

## Next
RETRO 400 (window 385–399), then PERF-14b-ii, PERF-14c and PERF-15, then the queue unchanged. The regression round is due at the first planning on or after 2026-11-10.

## Hand-off fixes (advisor review)
- **R-b now fixes each target clip by model identity** (`data-clip-id` or `data-clip-start`), never by mounted order. Under virtualization, DOM order is only the mounted set. A target that cannot be named this way is a STOP.
- **Run-to-run controls (L37):** a second unmodified HEAD run of the interactions spec gives 0 differing deterministic rows out of 189 (`b-round-398/interactions-run-control.txt`). The resources rows that differ between C 396 and C 398 are only the 4 `res.js.*` bundle-size rows, and the app is unchanged this round (`resources-run-control.txt`).
- **Delta re-review (L58):** `tech-lead` confirmed the dispatched harness patch `204e282a` against the reviewed combined sketch `a99828fd`. The spec is byte-identical, only the budget notes changed, and there is no new Medium+ (`sketch-review.md`, claim K17b).
- **Superseded-doc list:** the grep finds 20 docs, not 8 (K27). The task now names them.
- **New claims:** K26–K29 and K17b. The planning output and the on-sketch output were regenerated after the last edit. The store tree is still clean.
