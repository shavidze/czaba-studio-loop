# B — Round 344 → 345 planning

Decision: **CONTINUE**. D-IDs D-29z1084 … D-29z1089. The backlog went v303 → v304 (part 1, the close-out: `b-round-344/update-backlog-closeout.py`) and then v304 → v305 (part 2, the dispatch: `b-round-344/update-backlog.py`). Both were written by script only. `feature-status.md` was updated by `b-round-344/update-feature-status.py`. Backups are in `b-round-344/*-before-345.*`. Round 344's task is archived as `tasks/round-344.md`; it is a byte-equal copy (checked with `cmp`), and nothing was deleted.

**Advisor:** available. I consulted it after orientation and before writing, and followed its points:
- close round 344 on disk first;
- the baseline is the gate's `commit`;
- check the dock selector width and the `!isVideo` status branch;
- add a group-with-video jsdom row;
- keep `endStaleClipGesture`;
- run a mutant on the sketch.

I consulted it again before declaring done.

## Inputs read
- `context/active-summary.md` and `gates/gate-round-344.json`: `published`, commit `c79642c` on both remotes. The gate's `head` field `0aa317f` is the pre-publish parent. **The baseline for round 345 is `c79642c`**; `context/head-sha.txt` (`0aa317f`) is stale.
- `regression-last.json`: 2026-11-05 / round 342, so the next regression is due on or after 2026-11-08. RETRO is due around round 351.
- Round 344's files: `current-task.md`, `a-round-344.md`, `c-round-344.md` and `c-round-344.json`; `b-round-343.md` and `b-next.json`. `root-pre-push-review.md` and `publication-checkpoint.json` are from 2026-10-07 and hold no new finding.
- The full backlog was grepped by ID only. The relevant parts of `lessons.md` were read.
- Source, read-only: `ArrangementClip.tsx` (gesture preview paths, `finishGesture`), `ArrangementVideoDock.tsx` (the four `arrangement` readers), `ArrangementContext.tsx` (`previewArrangement`, `previewClipGeometry`, `previewStatus`, `useArrangementPreviewLaneClips`), `preview-store.ts`, `video.ts`, `video-fades.ts`, `model.ts`, `selection.ts`, `drag-preview-render.test.tsx`, the budgets, and doc 232/168 structure.

## Round 344 result (independent C evidence)
- **Status:** PASS. `browserVerified`/`realVerified` true, 10 rows.
- **PERF:** 157 EQUAL, 0 DIFF, 8 NEW. Video stopped is 98.35 per move against 22.8 for audio.
- **Browser rows:** VIDEO-PREMISE matches B's HEAD probe at both viewports. G344-AUTH: `/studio-lab` opens anonymously, the purchased route shows "Sign in required", and the token endpoint answers 401/400/403.
- **Updates:**
  - c5-i → done (D-29z1084);
  - new oracle `c-round-344/perf-results/latest-interactions.json`.
- **Routed (D-29z1085):**
  - A-R344-REVIEW-* (6 Lows) → `deferred_low_polish`;
  - C-R344-PERF-DURATION → closed into ROOT-REQ-PERF-TIMEOUT (root-only config), with the new durations as evidence;
  - A's `withTeardown` Architecture note → signal ARCH-R344-WITH-TEARDOWN, not scheduled.

## Next task: round 345 = PERF-DRAG-PREVIEW c5-ii (D-29z1086 … D-29z1088)

**Scope:**
- A video clip move, trim and fade, and a group that holds a video clip, preview through the store (`previewClipGeometry`).
- The video fade readout goes through `previewStatus`, as audio does.
- `hasVideo`, `groupHasVideoClip` and `previewGroup` are removed.
- The dock reads the store's video lane (`useVideoLaneArrangement`, built on `useArrangementPreviewLaneClips` with `useShallow`) for the stopped frame, caption, gap caption and fade overlay.
- `ArrangementContext.tsx` is untouched.

**B's sketch** (`b-round-344/sketch/`, scratch `git archive c79642c`):
- **Static checks:** typecheck 0; Biome 0.
- **Tests:** drag-preview 64/64; 119 video test files with 1800 tests.
- **Unit mutants, each red:**
  - HEAD source: 8 tests;
  - dock reading committed `arrangement`: 3;
  - dock subscribed to the whole preview: 1 (DP60);
  - the old `!isVideo` status branch: 2.
- **Production perf, alone:**
  - rc 0, 230 rows, **162 EQUAL, 3 DIFF**, all video: stopped per-move **98.35 → 23.617**, and both max rows 100 → 25;
  - 55/55 asserted pass;
  - 471.9 s. Read-only consult greps were running at the same time.
  - The perf run used the pre-rename names; the final sketch differs only by the rename and the formatter reflow, with the diff saved.
- **Budgets:** 5 video rows become `assert`, so 60 asserted in total. The sketch fails 0. HEAD fails 1 (computed from C344, not run).
- **Dock probe (new, `b-round-344/dock-probe.mjs`):** HEAD (dev) and the sketch (production) are identical at 1440 and 1280. That covers clip start, fade, gap caption, overlay opacity, status strings and Undo.
- **Render probe:** I found that production builds minify component names, so the probe's provider, workspace and dock columns are invalid there. C's RENDERS row runs on the dev server instead, with no B oracle for those columns. This is stated in the task.

**Consults (D-29z1086):**
- **`tech-lead`:** no Critical or High. Applied: the rename to `videoLaneArrangement`, DP53's post-release check, and DP61 and DP62. Pre-existing findings were recorded (D-29z1088). TL-R344-FADE-CANCEL-STATUS was re-rated Medium → Low with a stated reason, and goes to `deferred_low_polish` with TL-R344-CANCEL-COMMITS-MOVE. Signal ARCH-R344-DOCK-SUBTREE.
- **`performance-optimizer`:** the 5-row assert rule. PERF-CAND-VIDEO-TRIM-FADE-ROWS goes to the conversions stage.

**Claims:** `b-round-344/claims-345.sh` (K1–K16). The outputs at HEAD and on the sketch are saved. K16 shows all 43 artifacts present, stderr is empty, and a re-run at the end is unchanged.

**Not applicable this round:** reference-first, product-designer, screen budget and the YouTube request. This is a performance change with behaviour proven equal to HEAD.

## Scope and gates
- **No scope was shrunk** and no feature request was deferred. Professional plugins, effects, pitch and multi-video layers stay out of scope, as before.
- **Bugs:** no open Critical or High. The open Mediums are root, manual or `awaiting_user` only (the 2026-10-23 clarification).
- **Purchase protection:** G344-AUTH PASS, and G345-AUTH is a C row.
- **Decision:** not COMPLETE, because 33 items remain (`b-next.json`). Not BLOCKED, because nothing external is missing.
- **Architecture checkpoint:** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is due after round 345 C PASS. Root calls `frontend-architect` with 3 questions (current-task §8). This is the c5 feature boundary.
- **Commit readiness:** none from B. Gate 344 already published c5-i.

## B's environment notes
- **Scratch tree:** `/home/runner/b344-scratch/sc`, with `node_modules` symlinked.
  - Used for typecheck, Biome, vitest, mutants, the production perf build (:5188, owned by Playwright) and a production `remix-serve` on :5189 for the probes. That server is stopped.
  - No dev server was started from the scratch (D-29z1057).
- **Probes:** the HEAD probes used root's dev server :5173 read-only, and it is still up (200).
- **One process mistake:** I stopped :5189 with `pkill -f`, which also matched my own shell, so that command ended with exit 144. No other process was affected: `ps` shows no `remix-serve`, and :5173 answers 200.
- **Store tree:** untouched throughout (`git status` 0 entries, claims K2 `c79642c 0`).

## After the final advisor review (D-29z1089, backlog v305 → v306 via `b-round-344/update-backlog-part3.py`)
- **RENDERS ruling.** `providerRenders` 0 is the hard assert for every video gesture. `workspaceRenders` 0 applies to trim and fade. For the move gestures, `workspaceRenders` ≤ 3 is recorded. The imported clip is the only clip, so the move pushes the project end from 7 to 10 s, and the workspace renders once per crossed second (the DP22 contract). Without this ruling, C would report a false FAIL.
- **A-MUTANT** now runs only on a scratch copy of A's tree. `run-unit-mutants.sh` refuses the store path (tested: rc 2) and creates its output folder.
- **Harness fact B-R344-PROD-NAMES** and retro candidate RC-R344-PROD-NAME-PROBES are recorded.
- **`lessons.md` is unchanged** this planning. The new probe fact is a candidate for RETRO ~351.
- **No perf-level mutant was run by B.** HEAD failing the new budgets is computed from C344's run, not run. C may run a HEAD-source perf mutant if time allows; this is optional, not a gate.
