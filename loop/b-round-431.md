# B round 431 → 432 planning (2026-11-10)

**Decision: CONTINUE.** Round 432 is SABA-B-12 stage 2b, the Export dialog `<progress>`, on baseline `1197dcb` (gate 431 published).
- Task: `current-task.md`. Decisions: D-29z1521 … D-29z1526, `backlog.json` v414.
- The previous task is archived as `tasks/round-431.md` (a copy; nothing deleted). Pre-edit copies are `b-round-431/{backlog-before-432.json, feature-status-before-432.md, b-next-before-432.json, current-task-before-432.md}`.
- The advisor was consulted after orientation.
- Consults: `product-designer` (ruling on how the bar looks) and `tech-lead` (sketch review). Both are recorded in `b-round-431/sketch-review.md`.

## 1. Round 431 result (B's own re-runs, not reports)
- `c-round-431.json`: PASS, 0 bugs, `browserVerified`/`realVerified` true. The gate rows are listed as gate. The fake-bearer and Firefox/Safari rows are BLOCKED (cloud).
- **B re-ran:**
  - `tools/l57-check.py`: L57 OK (`b-round-431/l57-check-c431.txt`).
  - C's own JSONs, re-judged with C's compare scripts: ALL OK (2 cells, 6 radios each) and EXTRA ALL OK (2 cells) (`b-round-431/recompare/`).
  - `c-round-431/mutants/summary.txt` is identical to `b-round-430/mutants/summary.txt`.
  - Auth: `r2` and `r3` pass true. Attempt 1 hit the cold-server hydration error, with no workspace and 0 `audio[src]`; that is environment.
- **Gate 431** published `1197dcb` on both remotes. `gates/round-431/review.md`: COMMIT OK; findings 1–3 Low, 4–5 info.
- **Closed and recorded:**
  - STUDIO-VIS-2 done; stage 2a done (D-29z1521).
  - A-R431-REVIEW-L1/L2/L3 go to `deferred_low_polish`, confirmed by gate finding 2. GATE431-REVIEW-L3-STRING-COUNT-PINS goes there too (D-29z1522).
  - Architecture signal **ARCH-SIGNAL-STUDIO-CONTROLS**: A proposed a `StudioRadio` component; the gate proposed one `studio-controls` module once a third family lands, and round 432 is that third family. It is recorded, not scheduled. Root request ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS asks for a bounded frontend-architect checkpoint at the SABA-B-12 boundary, after stage 3. It does not block.

## 2. Loop-tool finding (D-29z1523)
`cloud/optimize-backlog.py` l.49 archives any finding whose status *contains* "closed", "done" or "resolved". That moved the open Medium parent **SABA-B-12** (status "in_progress … stage 1 done …") to `archive/findings-archived.json`, and A saw K13 move in round 431.
- B restored it to `open_findings` with a status that avoids those words. The archive copy stays.
- Root request: **ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING**, to match a leading keyword instead.

## 3. Why round 432 is stage 2b, and B's pre-checks (L58: B's own runs on the final sketch)
- Round 431's fixed outcome: today is 2026-11-10, earlier than the 2026-11-13 regression date. STEM-LANES has no Saba answer, and no Critical or High bug is open.
- **Hold recipes, proved at HEAD** (`probe/progress-hold-probe.mjs`, `probe/head/`):
  - Indeterminate: a `page.route` stall of `/app/lib/arrangement/mp3-encoder.client.ts`, then release; the MP3 downloads.
  - Determinate: CDP CPU throttling ×20 during a WAV render.
  - An MP3 warm-up export is needed first. Once, Vite's dependency-discovery reload swallowed the measured download (`probe/head/`, 1440 `mp3Download` null).
- **HEAD look:** Chromium's green fill on grey with square ends, and a flat grey bar while indeterminate. Under an injected `appearance: none`, the indeterminate state shows only an empty track. That observation drove the product-designer's choice of option (b).
- **Sketch** `sketch-432.patch.txt`, sha256 `55d39d7577826fc98f192eaa8d53e3d4b3096ced454a2fdedf116075922c82af`, 4 files. v2 applies TL-R432-02 and -05.
- **Real Chromium, final probe** (`probe/progress-probe.mjs` + `compare-progress.py`):
  - The sketch at :5174 (own Vite `cacheDir`, stopped afterwards) gives **ALL OK (2 cells, 4 states each)** (`probe/compare.txt`).
  - HEAD at :5173 gives **NOT ALL OK**, with green pixels and `appearance: auto` (`probe/compare-head.txt`). The row discriminates.
  - Kept as evidence: one cold-start attempt (`probe/sketch-attempts.txt`, `sketch-attempt1.log`) and the earlier versions (`probe/sketch-v1/`, `probe/head-v1/`, `probe/v2-prev/`).
  - Crops viewed: determinate 1440 (cream on graphite, rounded) and the 1280 indeterminate dialog (dimmed bar plus label).
- **Forced colours (TL-R432-07):** emulated forced colours draw an all-white bar at HEAD and on the sketch alike, in both states (`probe/forced-determinate.txt`). It is a record row, and real High Contrast goes to the TLM.
- **Contrast** (`probe/contrast.txt`): fill vs track 11.45:1; fill vs surface 14.78:1; the indeterminate mid pixel vs surface 4.37:1. The track vs surface is 1.29:1, and that track carries no meaning (product-designer).
- **Mutants:** 8/8 red (`mutants/summary.txt`). The v1 runs are in `mutants-v1/`.
- **Checks on the final sketch:** covering 30 files, 386/386 (`precheck-a2.log`); full vitest 270 files, 4,006 tests, rc 0 (`precheck-full.log`); typecheck rc 0; lint rc 0 (205 warnings, 1 info = HEAD); Biome rc 0 on 4 files.
  - One earlier full run overlapped sketch edits and mutant runs. It is kept as `precheck-full-INVALID-overlap.log` and is not cited.
- **Collisions (L23):** DXL7c and DXL8 are granted and replaced with equal or stronger assertions. PU1, PU2, FV1 and CU1 are unchanged and in the covering set.
- **Claims:** `claims-432.sh` rc 0 with empty stderr (`claims-432-planning-output.txt`). The sketch-side run and its diff are saved. L58 OK.

## 4. Reference (corrected from the primary source at close review, D-29z1526)
- Live 12 manual **5.1.3.5**: "a progress bar appears in the dialog" (real-time rendering). **5.1.3.4**: "the progress bar in the dialog resets for each individual pass". Both fetched 2026-11-10.
- Our per-phase reset therefore matches Live's export. The earlier "12.4.5b11 stem separation overall progress" claim came from a search summary only; the release-notes page was too large to fetch. It is withdrawn, and so is SABA-Q-EXPORT-PROGRESS-OVERALL, before it reached Saba.
- "No reference found" for colour, height or animation.

## 5. Other records (D-29z1525, D-29z1526)
- Row 4b got its own script, `probe/compare-neighbours.py`. B's run of the sketch vs HEAD gives NEIGHBOURS OK (`probe/compare-neighbours.txt`).
- The timeout STOP is limited to the two changed test files. R11-P1e (2,006 ms of the 5 s default) is a record row.
- REGRESSION-2026-11-13 gains REG-SABA-B-12-PROGRESS.
- Optimizer: only the top-level `status` is tested. An archive scan found no other open item outside `open_findings` (`archive-open-scan.txt`).
- B-R431-DUP-ENCODER-LOADING-TEXT (Low → `deferred_low_polish`): two visible lines say "Loading … encoder" during the MP3 load.
- The `agent-workflow.md` on disk ends at the Loop v2 section (87 lines). B followed the prompt snapshot for the later sections and found no newer entry.
- **RETRO-435 input:** A reported in rounds 430 and 431 that it could not read `lessons.md` (54 KB in 60 lines) in full, so this task inlines the applicable lessons.
- The auth row now warms `/studio/middle-east` first. Attempt 1 hit the cold hydration error in both rounds 430 and 431.

## 6. Order after round 432
1. REGRESSION-2026-11-13, when due.
2. SABA-B-12 stage 3 (shortcut sheet search ✕), then the ARCH checkpoint request.
3. COPY-PD-VIS (with the lane resize handle).
4. SYS-1, then SYS-3.
5. STORE-REDESIGN 2b…5 (direction gate).
6. ARCH-SPLIT.
7. REVIEW-RECOMMENDATIONS (includes stage 4, the selects).
8. T12-ADVANCED.
9. The phase-2 queues, under their gates.

STEM-LANES jumps ahead when Saba answers. RETRO-435 runs at round 435.

## 7. Open items carried
- TLM-SABA-B-12-FIREFOX-SAFARI: now also covers the progress bar and real High Contrast; deadline RETRO 435.
- ARCH-CHECKPOINT-SYS-2: awaiting root.
- ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING and ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS: new.
- Saba-dependent: STEM-LANES, the STORE-2b direction, SRW-21 (`deferred_user`), PHASE2-VIDEO-SCORING and SABA-Q-NUMBER-FIELD-DRAG.

## 8. Readiness for commit
Round 431 is published. This planning wrote only loop artifacts, and the store tree is clean (`git status` empty at `1197dcb`). The scratch copies `/tmp/b432` and `/tmp/b432c` are outside the store, and the sketch Vite server is stopped.
