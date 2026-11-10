# B round 432 → 433 planning (2026-11-10)

**Decision: CONTINUE.** Round 433 is SABA-B-12 stage 3, the shortcut sheet's search clear button, on baseline `1a417fb` (gate 432 published).
- Task: `current-task.md`. Decisions: D-29z1527 … D-29z1531, `backlog.json` v415.
- The previous task is archived as `tasks/round-432.md` (a copy; nothing deleted). Pre-edit copies are `b-round-432/{backlog-before-433.json, feature-status-before-433.md, b-next-before-433.json, current-task-before-433.md}`.
- **Advisor:** consulted after orientation (available and used).
- **Consults:** `product-designer` (look, sizes, tab order) and `tech-lead` (sketch review). Both are recorded in `b-round-432/sketch-review.md`.

## 1. Round 432 result (B's own re-runs, not reports)
- `c-round-432.json`: PASS, 0 bugs, `browserVerified`/`realVerified` true. The gate rows are listed as gate. The fake-bearer and Firefox/Safari rows are BLOCKED (cloud).
- **B re-ran:**
  - `tools/l57-check.py`: L57 OK (`b-round-432/l57-check-c432.txt`).
  - C's own probe JSON: ALL OK (2 cells, 4 states each) and NEIGHBOURS OK (`b-round-432/recompare/`).
  - `c-round-432/mutants/summary.txt` is identical to `b-round-431/mutants/summary.txt`.
  - Auth: the measured run passes; the warm-up `pass false` is the expected cold-server attempt.
- **Gate 432** published `1a417fb` on both remotes; `review.md` COMMIT OK, 9/10. The gate's `head` field and `context/head-sha.txt` say `1197dcb` and are stale.
- **Stage 2b is done** (D-29z1527).
- **Lows (D-29z1528), merged where they overlap with the gate review:** RV432-1 (= gate 1, also in the TLM row), RV432-2 (= gate 2), RV432-3, RV432-4 and RV432-5 go to `deferred_low_polish`. Gate 3 = TLM; gates 4 and 5 are info.
- **Records:** R11-P1e is at 2,299 ms of 5 s and rising (record row). The `SfxSceneExport` bar joins SABA-B-12-RECORDINGS-NUMBER (STORE-REDESIGN acceptance). Architecture note: none.

## 2. Scope check: scrollbars (D-29z1529)
Saba's SABA-B-12 text names scrollbars, but the stage list had none.
- The Studio scrollers already share `STUDIO_SCROLLBAR_CLASS`.
- But the `?` sheet scrolls on both viewports (1368 px of content in 808 / 646 px) inside `Modal.tsx`'s `styled-scrollbar`. Its computed `scrollbar-color` is `rgba(18,217,200,0.4)`, the old teal (`b-round-432/probe/head/sheet.json`).
- **New Medium stage 3b SABA-B-12-DIALOG-SCROLLBAR**, the next UI round. It does not change the shared store Modal default.
- **Harness fact for 3b:** Playwright's headless mode hides scrollbars, so that round launches Chromium with `ignoreDefaultArgs: ['--hide-scrollbars']`.

## 3. Why round 433 is stage 3, and B's pre-checks (L58: B's own runs on the final sketch)
- Round 432's fixed outcome: today, 2026-11-10, is earlier than the 2026-11-13 regression date, STEM-LANES has no answer, and no Critical or High bug is open.
- **HEAD (real Chromium):** Chromium draws its blue ✕ in the sheet search (8 blue pixels in the field's right 42 px, both viewports).
- **Sketch v2:** `sketch-433.patch.txt`, sha256 `82d7d76c…`, 4 files. v1 is in `sketch-v1/`. v2 applies TL-R433-01…05:
  - a quote-aware whole-tag scanner, which also covers `type={'search'}`;
  - an SC2 click with focus on the body;
  - the focusables order in SC3;
  - the no-op held-Enter loop dropped;
  - the meaningless cancel-pseudo probe field dropped.
- **Probe** (`probe/clear-probe.mjs` + `compare-clear.py`): the sketch at :5174 (own `cacheDir`, stopped afterwards) gives **ALL OK (2 cells)**, and HEAD at :5173 gives **NOT ALL OK**. The row discriminates.
  - Crops viewed: typed (muted X, no blue), long query (stops before the X), keyboard focus (brass ring on the X).
  - Earlier runs are kept in `probe/v1/`; one v1 geometry false-negative came from measuring two boxes at different moments, fixed by a joint measurement.
- **Mutants** (`mutants/run.py`): M1–M8 are all red and the sketch is green, 23/23. The v1 and bash runs are in `mutants/v1/` and `mutants/bash-run/`.
- **Checks:** covering 10 files 196/196; typecheck rc 0; lint rc 0 (205 warnings, 1 info = HEAD); Biome rc 0 on the 4 files.
- **Claims:** `claims-433.sh`. Planning output rc 0 with empty stderr. The sketch-side run is on a scratch clone, and its diff (`claims-433-planning-vs-sketch.diff`) shows only the expected K2/K5/K8/K8e/K17 lines. L58 OK.
- **Reference:** Live 12 manual 4.2 (fetched 2026-11-10). The X clears the search terms, which matches. Esc clears the search in Live but closes our sheet: the existing Saba CALM-1 decision, not a new deviation and not a new question. "No reference found" for the X's look.

## 4. Other records
- **Close-review follow-ups (advisor, D-29z1531):**
  - B's full vitest on the sketch: 271 files, 4,014 tests, rc 0 (`precheck-full.log`). No suite outside the covering set breaks, so the sketch is unchanged.
  - K1 no longer prints `context/head-sha.txt`, which `run.sh` rewrites before each round. K8b now proves the Library's `hadFocus` guard. Both claim outputs and the diff were regenerated, and the stderr is empty.
  - The Live 4.2 quotes ("You can click the x button in the search bar to clear any search terms"; "Esc to clear the search field and show all items in the All label again") are verbatim in the page HTML (curl).
  - **Inputs:** `ableton-decisions.md` 3b132399, `design-ux-decisions.md` 0da40d98 and `direction-decision.md` b8494bb4 match the recorded hashes. `agent-workflow.md` on disk is 87 lines (Loop v2 end), and the prompt snapshot carries the later sections. `root-pre-push-review.md` (round 3) and `publication-checkpoint.json` (2026-10-07; remaining items of rounds 38–41) bring nothing new beyond what feature-status §6 already carries.
  - SF2's top-level-only scan is ruled in task ruling 8.
- `direction-decision.md` exists (direction A, 2026-10-25, already recorded as note_d29z1448). STORE-2b…5 wait only for the 2026-10-27 order. The task text says so.
- TL-R433-06 (a shared search constant) is added to ARCH-SIGNAL-STUDIO-CONTROLS. ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS stays open, and B confirms it to root after stage 3 passes.
- REGRESSION-2026-11-13 gains REG-SABA-B-12-SEARCH-CLEAR.
- **Scratch:** `/tmp/b433` (HEAD + sketch; its `vite.config` was restored after the probe) is outside the store. The store tree is clean at `1a417fb`.

## 5. Order after round 433
1. REGRESSION-2026-11-13, when due.
2. SABA-B-12 stage 3b (dialog scrollbar), then the ARCH checkpoint request.
3. COPY-PD-VIS (with the lane resize handle).
4. SYS-1, then SYS-3.
5. STORE-REDESIGN 2b…5.
6. ARCH-SPLIT.
7. REVIEW-RECOMMENDATIONS (includes stage 4, the selects).
8. T12-ADVANCED.
9. The phase-2 queues, under their gates.

STEM-LANES jumps ahead when Saba answers. RETRO-435 runs at round 435.

## 6. Open items carried
- TLM-SABA-B-12-FIREFOX-SAFARI (now also the search field and the RV432-1 Firefox contrast), deadline RETRO 435.
- ARCH-CHECKPOINT-SYS-2, ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING and ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS: with root.
- Saba-dependent: STEM-LANES, SRW-21 (`deferred_user`), PHASE2-VIDEO-SCORING and SABA-Q-NUMBER-FIELD-DRAG.

## 7. Readiness for commit
Round 432 is published. This planning wrote only loop artifacts, and the store tree is clean (`git status` empty at `1a417fb`). No dev server was left running except root's :5173.
