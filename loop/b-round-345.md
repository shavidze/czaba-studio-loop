# B — Round 345 → 346 planning

Decision: **CONTINUE**. D-IDs D-29z1090 … D-29z1094. The backlog went v306 → v307, by script only (`b-round-345/update-backlog.py`, backup `b-round-345/backlog-before-346.json`). `feature-status.md` was updated by `b-round-345/update-feature-status.py` (backup `feature-status-before-346.md`). Round 345's task is archived as `tasks/round-345.md`, a byte-equal copy (checked with `cmp`); nothing was deleted. Backups of `current-task.md` and `b-next.json` are in `b-round-345/`.

**Advisor:** available on the first call, after orientation. I followed its points:
- close round 345 first;
- the baseline is the gate `commit`;
- do not quietly rewrite the ≤ 15 target. Run a names probe first; it decides between a c6 stage and the conversions;
- request the checkpoint now;
- check C's SFX/Music observation against the add rule.

The second call, before writing, was refused as overloaded. This report is recorded without that review.

## 1. Inputs read
- `context/active-summary.md`, `gates/gate-round-345.json` (`published`, commit `645b2e6`, both remotes; store HEAD equals it, clean tree). **The baseline for round 346 is `645b2e6`.**
- `regression-last.json`: round 342 on 2026-11-05, so the next REGRESSION is due on or after 2026-11-08. RETRO is about round 351.
- Round 345's files: `current-task.md`, `a-round-345.md`, `c-round-345.md`, `c-round-345.json`; also `b-round-344.md` and `b-next.json`.
- The backlog was searched by ID only (STUDIO-PERFORMANCE, PERF-DRAG-PREVIEW, PERF-CAND-*, ARCH-CHECKPOINT-*, ROOT-REQ-PERF-TIMEOUT). `lessons.md`: L31, L37, L38, L58.
- Source, read-only: `ArrangementLane.tsx` (icons, fader props), `ArrangementClip.tsx` (header icon), `ArrangementDetailPanel.tsx` (clip gain props, the hoisted chevrons), `ArrangementMixFader.tsx`, `ArrangementVideoDock.tsx` (caption), `ArrangementContext.tsx` (the add-to-active-lane rule), `drag-preview-render.test.tsx` (render counter, DP58–DP62) and `perf/budgets.interactions.json`.

## 2. Round 345 result (independent C evidence)
- **Status:** PASS; `browserVerified`/`realVerified` true; 12 rows.
- **PERF:** 60/60 asserted rows pass. Against C344: 162 EQUAL, 3 DIFF, 0 NEW. Video stopped went from 98.35 to 23.617 per move.
- **Browser:** DOCK-FOLLOWS and RENDERS match HEAD at 1440 and 1280. The extra FLOW row (add, import video, move, export WAV) passed at both viewports.
- **G345-AUTH:** `/studio-lab` opens anonymously; `/studio/<id>` shows "Sign in required"; `/api/studio-token` returns 401/400 (500 only because the mock on :5199 was down, listed under blocked).
- **Outcome:** c5-ii → done (D-29z1090). New oracle: `c-round-345/perf-results/latest-interactions.json`.
- **Routed (D-29z1091):**
  - C-R345-CAPTION-MUTANT-GAP, A-R345-REVIEW-DP62-FINALLY and A-R345-REVIEW-BUDGET-NOTES are fixed in round 346. The round owns those files and the fixes are cheap, which the 2026-10-23 rule allows.
  - A-R345-REVIEW-VIDEO-TRACK-ID → `deferred_low_polish`.
  - C-R345-PERF-DURATION (465718 ms) and A's 476277 ms → evidence on ROOT-REQ-PERF-TIMEOUT.
  - ARCH-R345-VIDEO-LANE-TYPE → `architecture_signals`.
  - C's observation that "SFX added with Music active lands on Music" is **by design**: the library Add uses `latest.activeTrackId` (audio lanes only), as Live inserts into the selected track. It is not a finding.

## 3. The decision: c6 first, conversions after (D-29z1092)
The planned next stage was "conversions" (trim/move rows → `assert`). The item target is ≤ 15 components per move. Fade meets it at 9.833. Trim (21.633) and move (22.8) do not. Converting them at ~22 would have quietly rewritten the target.

- **Premise probe** (B, dev :5173, `645b2e6`; `b-round-345/names-probe-v2.mjs` is the round-328 probe plus forwardRef `displayName`). Per commit: fade 10, trim 22, move 19 (101 at the project-end crossing). Seven trim renders draw nothing the drag changes:
  - lane `ChevronDown` + its inner lucide `Icon`;
  - clip `GripVertical` + its inner `Icon`;
  - two `ArrangementMixFader`;
  - `ArrangementDetailClipGain`.
- **Consults:**
  - **`performance-optimizer`:** the revision "is not defensible"; the cheap cuts reach the target (trim 15, move 12, fade 4). Use ceil budgets, not ceil+1. Assert release-commits == 1, proved by a `flushSync`-on-release mutant. Use one gross and one fine mutant. Keep move max and the 6× rows as `record`.
  - **`tech-lead`:** folding the three Lows in is sound. The caption test must assert a value that differs mid-drag. Wrap DP62 in try/finally. Three questions for the checkpoint. The move per-move value includes the crossing commit.
  - Both were adopted.
- **Split:**
  - **c6-i (round 346):** the icons. They are pure module-constant hoists, the pattern of `DETAIL_TOGGLE_CHEVRON_*`.
  - **c6-ii:** MixFader and DetailClipGain memo. Both take many inline handlers (lane volume/pan, detail field and fader), so they need stable props or a header split. That is checkpoint question 3, so it waits for c6-ii, where the answer can be used when present.
  - **Then:** the conversions, then PERF-CAND-VIDEO-TRIM-FADE-ROWS.

## 4. B's sketch for round 346 (`b-round-345/`)
- **Scratch:** `/home/runner/b345-scratch/sc2` (`git archive 645b2e6`, `node_modules` symlinked, private Vite `cacheDir` `/tmp/b345-vite-cache`).
- **Patch:** `sketch/apply-source.py` → `sketch/source.patch.txt`, with Biome formatting applied. `git apply --check` is clean on `store/`. Typecheck rc 0; Biome clean on both files.
- **Names on the sketch** (dev :5197, now stopped; `names-sketch-v2.json`, `names-compare.txt`). Components are only removed, never added:
  - fade 10 → 6;
  - trim 22 → 18;
  - move 19 → 15 (crossing 101 → 89);
  - click 100 → 88.
- **Covering unit tests:** the 108 files that import `ArrangementLane`, `StudioWorkspace` or `ArrangementClip` all pass, 1713/1713 (`sketch-covering-vitest.log`).
- **Claims:** `claims-346.sh`; outputs at HEAD and on the sketch are saved.
- **No production perf run by B**, so every perf row stays `record` this round (L58). The task predicts ~17.7, ~18.9 and ~5.9 per move. A different value is recorded and explained; a higher one is a STOP.
- **Not sketched by B:** DP63, DP64 and the counter widening. The task gives exact steps, red-proof mutants for A and C, and a STOP-and-defer path for DP64 if its module mock disturbs other DPs.
- `store/` is unchanged (`git status` 0 entries); the root dev server :5173 still answers 200.

## 5. Next task
`current-task.md` = round 346, PERF-DRAG-PREVIEW c6-i:
- **Files (5):** `ArrangementLane.tsx`, `ArrangementClip.tsx`, `drag-preview-render.test.tsx`, `perf/budgets.interactions.json` (notes only) and doc 232.
- **C rows:** CLAIMS, SOURCE-SCOPE, READ, UNIT, MUTANT, NAMES (browser), VISUAL (browser, `outerHTML` identical at 1440 and 1280), PERF, PERF-LIB, G346-AUTH, DOCS.
- Reference-first, product-designer, the screen budget and YouTube do not apply (performance round, identical DOM).

## 6. Architecture checkpoint (D-29z1093)
ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is **due now** for root and frontend-architect. It is non-blocking. The questions, from the `tech-lead` consult:
1. Should the project-end crossing (~101 components, StudioWorkspace re-render) get its own store, and inside which item?
2. Should the preview paths converge on one store contract typed `Pick<Arrangement, 'tracks' | 'clips'>`? This would also settle ARCH-R343-THREE-PREVIEW-PATHS and ARCH-R345-VIDEO-LANE-TYPE.
3. Which leaf components own their subscriptions: the dock overlays (ARCH-R344-DOCK-SUBTREE), the lane header and faders and the detail clip gain (c6-ii), and ARCH-R344-WITH-TEARDOWN?

## 7. Queue, completion and commit readiness
- **Order:** 346 c6-i → c6-ii → conversions → video trim/fade rows → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule). REGRESSION on or after 2026-11-08; RETRO about round 351.
- **Not COMPLETE:** many scoped items remain. Nothing external blocks, so not BLOCKED.
- **Commit readiness:** round 345 is already published (`645b2e6`). Round 346 is ready only after C PASS and the root gate.

## 8. Housekeeping
- **Scratch:** `/home/runner/b345-scratch/sc2` and the Vite cache `/tmp/b345-vite-cache`, outside `store/`. The scratch dev server on :5197 was stopped.
- **Checkpoint:** `b-round-345/checkpoint.md`.
