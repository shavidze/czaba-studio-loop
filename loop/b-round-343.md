# B — Round 343 → 344 planning

Decision: **CONTINUE**. D-IDs D-29z1079 … D-29z1083. Backlog v302 → v303, written by script only (`b-round-343/update-backlog.py`, `update-feature-status.py`). Backups are in `b-round-343/*-before-344.*`. Round 343's task is archived as `tasks/round-343.md`; it is a byte-equal copy (checked with `cmp`), and nothing was deleted.

**Advisor:** available. I consulted it once after orientation and before writing the sketch, and followed its points:
- the baseline moves to `0aa317f`;
- a measured HEAD premise;
- the fixture and selector checks;
- the timeout ruling from measurements, not an invented number;
- the L58 stance stated explicitly.

I consulted it again before declaring done.

## Inputs read
- `context/active-summary.md` and `gates/gate-round-343.json`: `published`, `0aa317f` on both remotes. **The baseline for round 344 is `0aa317f`.** `context/head-sha.txt` still said `99a5912`, which is stale.
- `regression-last.json`: 2026-11-05 / round 342, so the next regression is due on or after 2026-11-08.
- Round 343's files: `current-task.md` (round 343), `a-round-343.md`, `c-round-343.md`, `c-round-343.json`, `b-round-342.md` and `b-next.json`.
- The full backlog was grepped by ID only (PERF-DRAG-PREVIEW, GATE338-S1, the queue, the checkpoint requests).
- Source, read-only: `ArrangementClip.tsx` (preview paths), `ArrangementVideoDock.tsx` (arrangement readers), `ArrangementContext.tsx` (`runVideoImport`, `previewClipGeometry`), `preview-store.ts`, the perf spec, the budgets, `perf/lib/report.test.ts` (DC-KINDS) and `playwright.perf.config.ts`.

## Round 343 result (independent C evidence)
- **Status:** `taskStatus` PASS, with `browserVerified` and `realVerified` true. 12 rows PASS, 0 bugs.
- **PERF:** 219 rows, 55/55 asserted. 149 EQUAL and 8 DIFF, exactly as specified: group move 74.781 → 26.969 per move.
- **Browser rows** at 1440 and 1280: GROUP-BEHAVIOUR, OVERVIEW-FOLLOWS, BLOCKED-STATUS and G343-AUTH.
- **Updates:**
  - stage c4-ii → done (D-29z1079);
  - GATE338-S1-IDENTITY-INVARIANT → closed on the READ row;
  - the new perf oracle is `c-round-343/perf-results/latest-interactions.json`.
- **A's notes (D-29z1080):**
  - The six A-R343-REVIEW-* Lows go to `deferred_low_polish`.
  - The Architecture note becomes signal ARCH-R343-THREE-PREVIEW-PATHS. It folds into c5-ii and into question (2) of ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.
- **C's note** that the mock API was down at phase start is an environment note for root, not a finding.

## Next task: round 344 = PERF-DRAG-PREVIEW c5-i (D-29z1081 … D-29z1083)
- **The split.** c5 (video clips) is split like c3 and c4:
  - c5-i: a video drag row in the harness, all rows `record`;
  - c5-ii: the video preview moves into the store, the dock, caption, gap caption and fade overlay select the preview, and the `hasVideo` fallback is removed.
- **HEAD premise, measured** (`b-round-343/video-probe.mjs`, `probe/head-{1440,1280}.json`, `head-summary.txt`):
  - a video move costs 99.4 components per move, trim 100.7 and fade 94.4;
  - the provider, the workspace and the video dock render on every move;
  - for comparison, an audio move costs about 24.9.
- **B's sketch** (`b-round-343/sketch/`) was run three times on a production build in a scratch tree.
  - v1 had no zoom-in. It aborted with "no visible grab point", which led to the bounded zoom-in.
  - v2 had one determinism failure in the playing per-move ratio (5903/5901/5903). That row was ruled `wallclock`.
  - v3, the final, passed:
    - rc 0 and 0 failures, 230 rows;
    - 157 EQUAL, 0 DIFF and 8 NEW against `c-round-343`;
    - 55/55 asserted pass;
    - 382.5 s;
    - video stopped 98.35 per move, `drag-video-live` 1 in 3/3 passes.
- **Rulings (D-29z1082):**
  - one gesture (move): trim and fade share the same `isVideo` branch;
  - 1× only and measured last, because the import seeks to 0 and clears the range;
  - `'all-but-ratio'` rows, because DC-KINDS pins 16 `commits-per-move` rows;
  - the fixture is the tracked `1.mp4`, so there is no new binary;
  - liveness is `record`, as in c3-i, because B ran no mutant;
  - L31 timing is recorded (bound 450 s); I added this evidence to the open ROOT-REQ-PERF-TIMEOUT (round 278, 25 min), non-blocking. My first draft's new id, ROOT-REQ-PERF-INTERACTIONS-TIMEOUT, is recorded as merged into it.
- **Claims:** `b-round-343/claims-344.sh`, with K1–K16. The expected outputs at HEAD and on the sketch are saved. K16 reports every cited artifact present.
- **Not applicable:** reference-first, product-designer, screen budget and the YouTube request. This is a test-and-docs perf round with no app change. The VIDEO-PREMISE browser row proves that behaviour equals HEAD.

## Scope and gates
- **No scope was shrunk** and no feature request was deferred. Video trim and fade stay in c5-ii scope, covered by jsdom and browser rows. Professional plugins, effects, pitch and multi-video layers stay out of scope, as before.
- **Bugs:** no open Critical or High. The open Mediums are root, manual or `awaiting_user` only (2026-10-23 clarification).
- **Purchase protection:** G343-AUTH PASS. `/studio-lab` opens anonymously.
- **Decision:** not COMPLETE, because 33 items remain in `b-next.json`. Not BLOCKED, because nothing external is missing.
- **Architecture:** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is now requested after c5-ii C PASS (D-29z1081). Root calls `frontend-architect` then. It is not due this round.
- **Commit readiness:** none from B. Gate 343 already published c4-ii.
- **RETRO:** the last was 336; the next is due around round 351. The next regression is due on or after 2026-11-08.
- **Still open for root:**
  - ROOT-REQ-PERF-TIMEOUT (round 278, new evidence, non-blocking);
  - ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1);
  - checkpoint D-29z915;
  - R80-RECORDINGS-FIELD-BORDERS.

## B's environment notes
- Scratch tree: `/home/runner/b343-scratch/sc`, a `git archive` of `0aa317f` with `node_modules` symlinked. It was used only for typecheck, the stdin format check and production perf builds on :5188. No dev server was started from it (D-29z1057). It does not survive the job, and acceptance depends only on files in `b-round-343/`.
- The probe used root's dev server :5173 read-only. The store tree was untouched: `git status` was clean before and after (claims K2 `0aa317f 0`).

## After the final advisor review
- The perf-lib report test was run on the sketch: 34/34, rc 0 (`b-round-343/perf-lib-sketch.log`). It is now in §0.3 and K16.
- **VIDEO-PREMISE is pre-ruled:**
  - stopped gestures are exact;
  - playing gestures: renders = 59 and `max` exact; `perMove` ±0.1 and release commits 1–3 are recorded;
  - the 1280 trim gesture is recorded, not compared (probe artifact).
- **The MUTANT examples now fail loudly** (setup width, or no `setInputFiles`). §3 names the gap that `record` liveness leaves (a live press on another clip) and how c5-ii closes it.
- **The claims outputs were regenerated** at HEAD and on the sketch: K16 all present, stderr empty, and a re-run on HEAD equals the saved output.
- **`lessons.md` is unchanged.** This is a perf round with no new failure class; the v1 and v2 sketch failures were caught by B before dispatch, as L58 intends.
- **The store tree was untouched throughout** (`git status` clean).
