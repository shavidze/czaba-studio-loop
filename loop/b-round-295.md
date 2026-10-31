# B round 295 → 296 planning

**Date:** 2026-10-31. **Decisions:** D-29z746 to D-29z751. **Next task:** `current-task.md`, round 296, STUDIO-LINK-a.

The round-295 task is archived as `tasks/round-295.md` (copied, not moved; `cmp` equal).

## 1. Evidence read
- **C round 295** (`c-round-295.json`, `c-round-295.md`): **PASS**.
  - 10 rows passed and 0 failed. `browserVerified` and `realVerified` are both true.
  - The browser rows were B-LOAF-REAL, B-PERF-LOAF (one PERF-1a run) and G295-AUTH, each at both viewports where the row required it.
  - 1 info finding: C-R295-INFO-01 (origin B).
- **A round 295** (`a-round-295.md`): STOP on K6/K10, ruled below. A changed exactly the 8 §4 paths. Code-reviewer score 8/10; M1 and M2 were already known.
- **Gate 295** (`gates/gate-round-295.json`): **published**, commit `eded57a`, with matching hashes on both remotes.
  - `gates/round-295/review.md`: COMMIT OK, 9/10. Finding 1 is Low and findings 2–5 are info, plus an Architecture note.
- **Baseline for round 296:** HEAD `eded57a`, clean tree.
- **Regression:** `regression-last.json` is 2026-10-30 (round 258), so the next is due on or after 2026-11-02. Today is 2026-10-31, so round 296 is **not** a regression round, and `regression-last.json` is untouched. **The next B planning on or after 2026-11-02 must plan REGRESSION.**
- **RETRO:** next at round 305.

## 2. Backlog updates (C and gate evidence only)
- **SYS-VACUOUS-ROWS → done** (D-29z746). The evidence is C round 295 PASS (`browserVerified` true) plus gate 295 published `eded57a`. It closes A-R278-REVIEW-METRONOME-SPY, C-R283-01, A-R283-REVIEW-LOAF-SCRIPTS and A-R284-REVIEW-ZQ3-VACUITY.
- **A's STOP** (D-29z747): the K6 and K10 deltas are accepted. They came from B's own grant and sketch.
- **C-R295-INFO-01:** closed. Its method is adopted from this round: the allowed CLAIMS deltas now come from running the claims script on B's sketch-applied scratch copy. Retro candidate RC-R295-CLAIMS-FROM-SKETCH. `lessons.md` is unchanged at 59 lines.
- **Gate 295** (D-29z748):
  - finding 1 → `deferred_low_polish` GATE295-R1-LOAF-FALSE-ALARM;
  - finding 2 widens ROOT-REQ-VITEST-PERF-INCLUDE to cover `biome.json` too;
  - findings 3–5: no action;
  - the Architecture note becomes signal GATE295-ARCH-PERF-RULES ("keep").
- **No Critical, High or Medium finding is open** from C or the gate.
- **PD-REVIEW queue entry:** STUDIO-LINK is split into STUDIO-LINK-a (round 296, dispatched) and STUDIO-LINK-b (round 297). STUDIO-LINK-DYNAMIC is added as a later candidate, not queued. SABA-Q-STUDIO-LINK is added as `awaiting_user` (non-blocking, defaults applied).
- `rounds`: 295 → c_pass_published; the round-296 entry is added. `current_task` is updated.
- **Backups:**
  - `b-round-295/backlog-before-296.json`
  - `b-round-295/b-next-before-296.json`
  - `b-round-295/feature-status-before-296.md`
  - `b-round-295/lessons-before-296.md`
- **Edit script:** `b-round-295/update-backlog.py`.

## 3. Round 296 in one paragraph
**STUDIO-LINK-a.** A product whose preview lives in the Studio demo (today only `middle-east`) gets a quiet "Try it in the Studio" text link under its title on the product page. The link opens `/studio-lab?preview=middle-east`. There the provider starts with that source selected (a new optional `initialSelectedSourceId` prop), and the route focuses that library option once, at the first hydrated wide commit. Enter then adds the clip. Nothing is auto-added, and nothing new is written to the status line. Unmapped products have no link. Unknown parameters are ignored. A narrow window keeps the FIX-PD-1c behaviour.

**B's scratch pre-run** (`/tmp/b296-scratch`; the store tree was untouched):
- the sketch diff covers 9 files;
- L23 collision proof: the 4 route test files fail until a `useSearchParams` mock line is added;
- 9 files and 89 tests pass; `tsc` rc 0; Biome is clean, apart from 1 warning that already exists;
- mutants a–d are each red;
- **real Chromium journey** on the sketch dev server with the mock API, at both viewports:
  - the link is present (137×20 px) on Middle East and absent on Harbour Lights;
  - the landing focus is on the `demo-middle-east` option;
  - Enter adds the clip;
  - plain `/studio-lab` leaves focus on BODY;
  - HEAD has no link.

  A cold-cache Vite hydration error appeared once and was gone on the warm re-run.

## 4. Product and reference consults (user-visible task)
- **`product-designer`** (consulted, read-only; summary):
  - **Q1:** hide the link on unmapped products.
  - **Q2:** a text link in the sidebar after the title and artist block, with the copy "Try it in the Studio", same tab. It does not compete with Buy, which sits in `PurchaseHeader`.
  - **Q3:** select and focus, no auto-add, no visible status. It proposed an SR-only announcement. **B ruled against it:** focus on a `role=option` with `aria-selected` already announces the selection, the Studio has no sr-only announcer, and a new one would add a component for one line.
  - **Q4 (round 297):** a context menu item "View in store" on mapped library options. It opens by right-click, Shift+F10 or the ContextMenu key, opens a new tab, and gets a `?` sheet row.
  - **Q5:** `?preview=<handle>`; an unknown value is ignored silently.
  - **Q6:** states and rows; these were adopted into §6 of the task.
  - **Q7:** three Saba questions, recorded as SABA-Q-STUDIO-LINK.
  - Its note that the review doc "does not exist on this checkout" refers to `store/docs/…`. The doc lives in the project `docs/` folder (`/home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md`), which B read.
- **Reference-first:** WebSearch for Epidemic Sound Adapt and Splice found **no confirmed** product-page-to-editor link with the item preselected. That is written in the task as "no reference found", with what was searched. Ableton is not applicable, because Live has no store hand-off.
- **Why no AGREE note or `youtube-request.json`:** the 2026-10-31 policy section gives STUDIO-LINK an exact approved scope, and the tutorial step targets Ableton features. Live has no equivalent. Recorded in D-29z749, so the next B does not re-litigate it.
- **Advisor:** available and consulted before writing. It confirmed:
  - the bookkeeping order;
  - the static map over the dynamic preview (backend dependency and R2 CORS);
  - checking the mock API for product-page rows (C ran it in round 286; B ran it for the probe);
  - the bundle boundary (the links module must not import the demo synth);
  - a context menu for "View in store", with the split if it grows;
  - the L54 journey row.

## 5. Order after 296 (D-29z751)
REGRESSION if round 297 is planned on or after 2026-11-02. Otherwise:
1. STUDIO-LINK-b (297)
2. NAME-AND-HINT
3. PERF-3c and the rest of STUDIO-PERFORMANCE
4. STEM-LANES
5. SYS-1…3
6. STORE-2b…5: `direction-decision.md` exists (direction A), so STORE-2b…5 is not gated.
7. REVIEW-RECOMMENDATIONS
8. T12-ADVANCED
9. The phase-2 entries (skip rule)

SRW-21-PLAN stays parallel planning. RETRO at round 305.

**Architecture checkpoint: not requested now.**
- Round 296 adds one optional prop to `ArrangementContext`.
- B will request a bounded frontend-architect checkpoint at the PD-REVIEW stage boundary if the context gains more route-driven props (STUDIO-LINK-b, STEM-LANES).

## 6. Ready for commit?
- **Round 295:** already published by root as `eded57a`.
- **Round 296:** after C PASS and the gate, root publishes the 10 §4 paths.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** most of the queued scope is not done:
  - STUDIO-LINK-a/b, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries;
  - the deferred Lows, which must all be fixed before final acceptance;
  - SRW-21, which is `deferred_user`.
- **Not BLOCKED:** nothing external is missing. The open Saba questions do not block.

## 8. Housekeeping
- **Probe servers:** B's probe ran a scratch dev server (:5296) and the mock API (:5199). Both were stopped afterwards; :5173 is still 200. `git status` in `store/` is empty.
- **Artifacts:** all in `b-round-295/`:
  - `claims-296.sh`, `claims-296-output.txt`, `claims-296-after-sketch.txt`;
  - the sketch diff, the logs and the mutant logs;
  - `probe/`;
  - the backups.
- **Frozen list:** `b-round-295-r296-tree-sha256.txt` (1163).
