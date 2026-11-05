# B — Round 346 → 347 planning

Decision: **CONTINUE**. D-IDs D-29z1095 … D-29z1099.

- **Backlog:** v307 → v308, by script only (`b-round-346/update-backlog.py`, backup `b-round-346/backlog-before-347.json`).
- **`feature-status.md`:** updated by `b-round-346/update-feature-status.py` (backup `b-round-346/feature-status-before-347.md`).
- **Archive:** round 346's task is `tasks/round-346.md`, a byte-equal copy (checked with `cmp`). Nothing was deleted. Backups of `current-task.md` and `b-next.json` are in `b-round-346/`.

**Advisor:** available. I called it twice. The first call, after orientation, gave these points, which I followed:
- close round 346 first;
- route the gate Low and the doc status into this round;
- choose between per-site `useCallback` and one stable-handler hook, and do not take the structural option (checkpoint question 3);
- sketch both halves and split ClipGain off if it needs a comparator;
- verify that names stay visible through `memo(forwardRef)`;
- run the exact-count tests;
- add stale-closure rows and fader-drag rows.

The second call came before closing, after every file was written. It led to these edits in `current-task.md`:
- the fader-perf pass is now "not higher" instead of "not different", so a lower value cannot cause a false STOP;
- the `SH1:`…`SH4:` test-name prefix is stated;
- blur-by-script is allowed for FADER-LANE (e);
- the video-import note moved to FADER-CLIPGAIN (f);
- the ClipGain fallback drops DP65's ClipGain assertions;
- the hook-contract doc placement is recorded as a deliberate deviation.

No K value changed.

## 1. Inputs read
- `context/active-summary.md`.
- `gates/gate-round-346.json`: `published`, commit `4895732`, both remotes. Store HEAD equals it and the tree is clean, so **the baseline is `4895732`**.
- `gates/round-346/review.md`.
- `regression-last.json`: round 342 on 2026-11-05, so the next REGRESSION is on or after 2026-11-08.
- Round 346's files: `current-task.md`, `a-round-346.md`, `c-round-346.md`, `c-round-346.json`; also `b-round-345.md` and `b-next.json`.
- The backlog, by ID only (STUDIO-PERFORMANCE, PERF-DRAG-PREVIEW, ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, ROOT-REQ-PERF-TIMEOUT).
- Source, read-only: `ArrangementMixFader.tsx`, `ArrangementLane.tsx` (fader props and handlers), `ArrangementDetailPanel.tsx` (clip gain props and handlers), `useRelativeFaderDrag.ts`, the `ArrangementContext.tsx` callbacks, the `drag-preview-render.test.tsx` render counter, and `perf/budgets.json` / `perf/budgets.interactions.json`.

## 2. Round 346 result (independent C evidence)
- **Status:** PASS, `browserVerified`/`realVerified` true, 11 rows, 0 bugs, 0 blocked.
- **NAMES:** fade [6×4], trim [18×4], move [15, 15, 89, 15], click [88, 0].
- **VISUAL:** `outerHTML` identical to HEAD at both viewports.
- **PERF:** 60/60 asserted, 0 NEW, no row higher.
- **G346-AUTH:** `/studio-lab` opens anonymously; `/studio/<id>` asks for sign-in; the token route refuses.
- **Outcome:** c6-i → done (D-29z1095).
- **Routed (D-29z1096):**
  - GATE346-L1 (= A-R346-REVIEW-L3, the DP64 tick loop) and GATE346-INFO3 (doc 232 status) are fixed in round 347.
  - GATE346-L2 is info only.
  - The gate's architecture note → ARCH-R346-DP-HARNESS-EXTRACT, with its trigger.
  - A's two test deviations are accepted.
  - B's PERF-LIB 34 → 40 error is corrected.
  - The durations → ROOT-REQ-PERF-TIMEOUT.
  - C's chrome-icon note → PERF-CAND-CHROME-ICONS.

## 3. c6-ii design and evidence (D-29z1097, D-29z1098)
- **Shape:** a ref-based `useStableHandler` hook (layout-effect write, stable `useCallback([])`) plus `memo` on `ArrangementMixFader` and `ArrangementDetailClipGain`. The inner forwardRef keeps its `displayName`. `renderPanReadout` stays a dep-ful `useCallback`, because it runs during render.
- **Sketch:** `/home/runner/b346-scratch/sc`. `b-round-346/sketch/source.patch.txt` applies cleanly to `store/`; typecheck and Biome are clean.
- **Names on the sketch** (dev :5197, now stopped):
  - fade 6 → 4;
  - trim 18 → 15;
  - move 15 → 12 (crossing 89 → 82);
  - click 88 → 83.
- **Interactions perf on the sketch build:**
  - trim 17.7 → 14.75, move 18.467 → 15.317, fade 3.933 per move (from 5.9);
  - 0 rows higher, 0 NEW, 60/60 asserted rows pass.
  - **The item target ≤ 15/move is now met for trim.**
- **Fader spec on the sketch build:** 94/94 asserted rows pass, and no `fader.*` components, commits or restarts row differs from `c-round-341`.
- **Unit tests on the sketch:** the covering run passed 104 files, 1670/1670. The final run passed 36 files, 720/720.
- **Mutants:** removing either `memo`, inlining a handler and inlining the gains array all turn DP65 red. A stale `renderPanReadout` dep is caught by `track-pan`.
- **Consults:**
  - **`tech-lead`:** approve both halves in one round with per-half rows; no JSDoc; JSON-encode the gains (`[]` → `[0]`). Adopted.
  - **`performance-optimizer`:**
    - run the fader spec — done, and it is a C row;
    - Master and GroupHeader inline props → candidate;
    - convert trim now at 17 — kept for the conversions round (D-29z1098 says why);
    - expected values as deltas — given.
  - Its remark that the "sketch adds no unit test" referred to the store copy. B's DP65 prototype is in `b-round-346/sketch/`.

## 4. Next task
`current-task.md` = round 347, PERF-DRAG-PREVIEW c6-ii.
- **Files (7):**
  - the new hook and its test;
  - `ArrangementMixFader.tsx`, `ArrangementLane.tsx`, `ArrangementDetailPanel.tsx`;
  - `drag-preview-render.test.tsx` (DP65 and the DP64 `waitFor`);
  - doc 232.
- **C rows:** CLAIMS, SOURCE-SCOPE, READ, UNIT, MUTANT, NAMES, FADER-LANE, FADER-CLIPGAIN, VISUAL, PERF, FADER-PERF, PERF-LIB, G347-AUTH, DOCS. NAMES, FADER-LANE, FADER-CLIPGAIN, VISUAL, the two PERF rows and G347-AUTH are browser rows.
- **Fallback:** if the ClipGain half fails alone, A ships the lane half and the ClipGain half becomes c6-iii.

## 5. Architecture checkpoint
ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is still **due with root**, and no answer artifact was found. It is non-blocking. c6-ii is deliberately non-structural, so a checkpoint answer to question 3 (leaf subscriptions, lane header) can still supersede it. New signals, not scheduled:
- ARCH-R346-DP-HARNESS-EXTRACT;
- ARCH-R346-FADER-DRAG-OPTIONS-EFFECT.

## 6. Queue, completion and commit readiness
- **Order:** 347 c6-ii → conversions → PERF-CAND-VIDEO-TRIM-FADE-ROWS → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule). REGRESSION on or after 2026-11-08; RETRO about round 351.
- **Not COMPLETE:** many scoped items remain. Nothing external blocks, so the decision is not BLOCKED.
- **Commit readiness:** round 346 is already published (`4895732`). Round 347 is ready only after C PASS and the root gate.
- **Store:** `git status` 0 entries. Nothing in `store/` was written by B. The root dev server :5173 still answers 200.
