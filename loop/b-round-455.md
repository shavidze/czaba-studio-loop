# B round 455 → 456 planning

**Date:** 2026-11-11.

**Advisor:** available. I consulted it after orientation and before writing, and followed its advice:
- keep the recorded order (2b-3c-2 before SABA-B-13);
- use the gate `commit` `db95f40` as the baseline, not the stale `head-sha.txt`;
- read gate 455's review;
- rule on doc 298 l.4;
- centre 2b-3c-2 on the shared reader plus the Medium, and split the rest;
- reuse the round-452 resolver;
- request an architecture checkpoint explicitly.

A second consult before hand-off found rows that had not been run on the sketch and cited artifacts that had no claim. Fixes:
- saved `expect(` counts (`expect-counts.txt`), `apply-check.txt` and `precheck-biome-scoped.log`, claimed as K17/K18;
- K12 extended to every cited file;
- C7 pinned to `c-round-455/c12-tree.json`, with the mock-API start and warm recipe;
- C4 run with `--reporter=verbose`;
- doc 299 l.4 in the L28 form "stage 1 of 2";
- the export names checked against `AGENT_DISCOVERABLE_CODE.md`;
- the new statuses checked against the optimizer's archive keywords (no hit);
- two new Lows recorded: B-R455-GS2-DEAD-LABELS-UNVERIFIED, and CSS `@apply`/`theme()` reads added to TL-R455-WALKER-LIMITS.

**Consults:**
- `tech-lead` reviewed the sketch twice (`b-round-455/sketch-review.md`):
  - v1: APPROVE-WITH-CHANGES, with two Mediums, both fixed in v2;
  - v2 delta: APPROVE on the dispatched sha `b3eab344…`.
- `product-designer` was not consulted: this is a test-only round with no user-visible change.

## Inputs read
- `tasks/round-455.md`: archived byte-identical from `current-task.md` (`cmp` OK).
- `a-round-455.md`, `c-round-455.md`, `c-round-455.json`, `gates/gate-round-455.json` (published `db95f40`).
- `gates/round-455/review.md`: COMMIT OK, 9/10.
- The `verify.log` tail: 284 files / 4148 tests, build OK.
- `context/active-summary.md`; `backlog.json`, looked up by id only; the B part of `lessons.md`, plus L28/L29/L31/L56/L58 in full.
- `regression-last.json`: 2026-11-10, so the next regression is due 2026-11-13.
- **Backups:** `b-round-455/{backlog,feature-status,b-next,lessons}-before-456.*`.

## Round 455 result (independent evidence only) — D-29z1618
- **C round 455:** PASS on C1–C9, `browserVerified`/`realVerified` true, 0 bugs. HEAD control lead 7 px → tree 0 px at both viewports.
- **Gate 455:** published `db95f40`. **SABA-B-14 is done (მზადაა).**
- **TLM-R455-FIREFOX-SEEK-THUMB** stays open (deadline RETRO 465).
- **Findings:**
  - R455-1 (NaN duration) → `deferred_low_polish` A-R455-REVIEW-L1-NONFINITE-DURATION, `confirmedBy` gate finding 1.
  - R455-2 and R455-3 were fixed in the doc by A.
  - R455-4/5/6 and C's swapped probe-label note → info.
  - The range-fill architecture notes from A and the gate → SIG-R455-RANGE-FILL. This is a signal, not a task.
- **Doc 298 l.4 ruling (L10):** the B task pinned "In Progress" against L28, so the origin is B spec (B-R455-DOC298-STATUS-LINE). Round 456 grants that single line. L28 gains a B clause; `lessons.md` stays at 60 lines.

## Round 456 = STORE-2b-3c-2a (test-only) — D-29z1619
- **Why this and not SABA-B-13:** no new Saba or root file has arrived. SABA-B-13 still needs its `product-designer` consult, reference section and production-build probe, and its policy slot is "STORE-2b or STORE-3". 2b-3c-2 carries the open Medium A-R454-REVIEW-M-DEAD-UNCHECKED, which was promised to round 456.
- **Split, to keep one feature per round:**
  - **2a (this round):** the shared rule reader, the dead-consumer proof and the GS gaps.
  - **2b:** the zero-offset glow regex forms, all Low/info, after SABA-B-13.
  - A-R454-REVIEW-L1 (`.code-4` undefined token) needs `app.css`, so it stays with 2b-3d.
- **B measured at HEAD:**
  - The new rule keys and counts equal the old allow-list (37/6).
  - The dead-token consumers are only TrackRow, WaveForm, TrackRowSkeleton and PianoLoadingAnimation, all unreachable from the routes, plus AudioPreviewButton, which is overlay-only.
  - Whole-barrel walking would mark the four as reachable (control), so the name-precise walk is what makes the check meaningful.
  - `.audio-player-artwork` has a legitimate `@media` copy, so LT1 expects 2.
- **Sketch v2** (`b-round-455/sketch-456.patch.txt`):
  - full suite 284 / 4150, rc 0;
  - `tsc` rc 0;
  - lint 205 warnings, the same as HEAD;
  - covering set 4 files / 26 tests;
  - 22 mutant lines: BASE and C1 green, M1–M20 red, with per-mutant logs.
- **Claims K1–K18** (`claims-456.sh`): the planning and sketch outputs are saved with empty stderr, and L58 is OK.
- **Lows recorded, not fixed:** TL-R455-WALKER-LIMITS, the reviewers' list of walker and reader limits.

## Architecture checkpoint
Requested from root, non-blocking: `b-round-455-checkpoint-request.md` (ARCH-CHECKPOINT-STYLE-SCAN).
- **Why:** `helpers/style-scan.ts` now mixes CSS reading with an import-graph walker. Five rounds have edited it, and three signals sit on it.
- **Question:** a `css-rules.ts` + `module-graph.ts` split, and one shared dead-code allow-list.
- **Timing:** an answer is preferred before 2b-3c-2b is planned. Nothing waits on it.

## Order after this round
1. REGRESSION-2026-11-13, if round 457 is planned on or after 2026-11-13; otherwise SABA-B-13 (entrance).
2. 2b-3c-2b.
3. 2b-3d.
4. 2b-4.
5. STORE-2c…5.
6. DP-GATE (root).
7. ARCH-SPLIT.
8. REVIEW-RECOMMENDATIONS.
9. T12-ADVANCED.
10. Phase 2, under the skip rule.

The next RETRO is round 465.

## Ready to publish
Round 455 is already published (`db95f40`). Nothing from B is pending publication.

## Decision
**CONTINUE** (`b-next.json`).
