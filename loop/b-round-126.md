# B — Round 126 result and Round 127 plan (D-29z92)

Date: 2026-10-24 (planning from ~05:05 UTC) · Author: B · Advisor: available; I consulted it after orientation, before writing anything.

## 1. Inputs read
- **Context and reports:**
  - `context/active-summary.md`;
  - `current-task.md` (round 126), which is now archived as `tasks/round-126.md` (`cmp` OK, 24995 bytes);
  - `a-round-126.md`, `c-round-126.md` and `c-round-126.json`;
  - `gates/gate-round-126.json`, `env-status.json` and `regression-last.json`.
- **Gate 126:** `skipped` ("no real changes"), head `608187f`. It was not published, so **the baseline stays `608187f`**. `git status --porcelain` is empty.
- **Root checkpoint answer:** none. There is no result for `b-round-124-checkpoint-request.md` in `gates/` or in the loop folder.
- **Decision files:** `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` add no new follow-up.
- **Opened for specific facts only** (the full backlog was not read):
  - `backlog.json`: VISUAL-A-OBSIDIAN, the design findings, `deferred_low_polish` and `design_ux_recommendations`;
  - `visual-direction-a.md`: the V-0 and M2 sections;
  - `plan.md`: the round table;
  - the export source and tests, so the task could name exact files and lines.

## 2. Round 126 result (independent C evidence)
- **C: PASS.** `browserVerified`, `realVerified`, `allRowsRan` and `reviewComplete` are all true. D3, D4 and D5 are done, and nothing spilled.
  - SOURCE-SCOPE was OK at the start and at the end.
  - G126-3 passed. Only its fake-Bearer 403 sub-check is blocked, because the backend is not available in the cloud.
- **B spot-checks:**
  - **WAV headers, parsed by B:** `d3cfirst-bc-1440` is 4864896 frames (101.352 s) and `d3cfb-1280` is 7217877 frames. Both are 48 kHz / 24-bit / 2 ch.
  - **Screenshot `D3A-S1-withGroup-real-…0431.png`:** at 1280×720, only a thin top sliver of the SFX lane shows above the 120 px detail panel. That matches C's description.
  - **`d3a-summary.json`:** the panel is 120 px and `aria-valuenow` is 120.
  - **`g126-3.json`:** 401, "Sign in required", 0 `audio[src]`.
  - **Part-1 integrity:** 126 rows checked, and none is missing.
- **D3-A ruling:** this is pre-ruled line 2. The panel is at the D-29b fallback of 120, and the SFX lane can be reached by wheel or scrollbar. So it is **friction, not a bug**, and it becomes DUX-R-3.
- **A:** no-op. All three start checks were OK.

## 3. Backlog updates (evidence only; `backlog.json` v121)
- **DESIGN-UX-REVIEW → done.** Recorded under VISUAL-A: `part2_result_round126` and `design_ux_review_status`.
- **`deferred_low_polish` += DUX-B-2, DUX-B-3, DUX-B-4** (167 → 170). Each keeps its contract, evidence and repro.
- **`design_ux_recommendations` += DUX-R-3…9**, all `awaiting_user`.
  - DUX-R-1 gains the group-readout extension.
  - DUX-R-3 links to C-R125-OBS-1280-SFX-LANE-UNDER-PANEL.
  - DUX-R-6 records the WCAG 2.1.1 question.
- **WCAG 2.1.1 (keyboard clip selection) is not adopted as a contract by B.** It stays a question for Saba, and DUX-R-6 stays a recommendation. Adopting a new contract silently would turn a recommendation into a bug without the user's decision.
- **Open findings:**
  - C-R125-OBS-VOLUME-DEADZONE-6PX: **closed** as a harness artifact.
  - C-R125-OBS-CTRL-ALT-PASTE-SPLIT: judged acceptable (info). The new signal **ALTGR-SHORTCUT-GUARD** is not scheduled.
  - C-R125-OBS-1280-SFX-LANE-UNDER-PANEL → DUX-R-3.
  - C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER: acceptable.
  - GROUP-VOLUME-VISIBLE-READOUT → DUX-R-1.
  - WAVEFORM-ZOOM-DISCOVERABILITY → DUX-R-2.
  - ARCH-CHECKPOINT-PHASE1-BOUNDARY: noted as still unanswered.
- **VISUAL-A forward constraints** (`forward_constraints_d29z92`):
  - V-1 must keep field boundaries ≥ 3:1 (DUX-B-3).
  - **V-1 needs a narrow grant on `app/styles/app.css`**, because `app/styles/**` is globally forbidden. The user-approved spec names that file.
  - The last V-0 stage adds `lang="en"` on the Studio root and re-captures the RV-1 baseline.
  - DUX-R-5 joins V-1 only if Saba approves it.
- **`v0_plan_d29z92`:** the module contract, the 5 stages, the inventory rules (what is UI copy, what is user content, what is out of scope) and the RV-1 rule for V-0.
- **Records:**
  - `rounds[126]` → completed;
  - `rounds[127]` → dispatched;
  - `current_task`;
  - `baseline_tree_at_round127`.
- **Other files:**
  - `feature-status.md`: the header, the Round 126/127 line, the VISUAL-A row and the deferred Low count (170).
  - `plan.md`: D-29z92 (R1–R9), the round table (126→, 127, 128) and the ownership line.
- **Backups and tools:**
  - backups: `b-round-126-{backlog,b-next,feature-status,plan,current-task,regression-last}-before.*`;
  - script: `b-round-126/tools/update_backlog.py`.
- **Frozen list:** `b-round-126-r127-tree-sha256.txt`, 913 entries (937 minus the 24 granted tracked files). `sha256sum -c` gave OK.
- `regression-last.json` is unchanged; the next regression is due on or after 2026-10-27.

## 4. Round 127 decision: V-0 stage 1, Export
- **Why V-0 now:** this is the "Otherwise" row of the round-126 §7. Regression is not due, and no finding is Critical, High or Medium.
- **Module shape** (fallback, because root has not answered):
  - `app/lib/arrangement/strings.ts`;
  - one exported object per area (`studioExportStrings` now);
  - plain strings plus small pure formatters;
  - no locale switch. That is the smallest honest structure: one language today, easy to extend later.
  - Tests reference the module. Only `strings.test.ts` pins the English literals, so a wrong value cannot pass by comparing it with itself. ST4 scans the migrated files for Georgian, and later stages add their files to that scan.
- **Why Export first:** it is one feature with its own test family, every state can be checked in the browser, and it does not touch `StudioWorkspace.tsx`.
  - `ArrangementContext.tsx` and `graph.client.ts` are granted narrowly: only the export bodies, the overload text and the empty-project error.
- **The scope is not shrunk.** V-0 needs 5 stages instead of the spec's 2–3, because of the measured inventory. Every stage and the RV-4 end condition are recorded.
- **Uncertain contracts, with the smallest honest behaviour:**
  - User content (sound titles, file names, `audioNote` from `video.client.ts`) stays as it is.
  - Mixed language outside Export is expected during V-0.
  - Size changes caused only by copy length count as the RV-1 V-0 exception, and C must attribute every delta.
  - Terms follow Live 12 where the saved manual captures confirm them ("Export Audio/Video", "time selection").
- **GATE103-S2** (the `30` written twice in the stall message) is fixed at little cost, because the line is already owned. C verifies it through ST2.

## 5. Architecture
- No Architecture note came from round 126, because no code changed.
- ARCH-CHECKPOINT-PHASE1-BOUNDARY / `b-round-124-checkpoint-request.md` is still unanswered and non-blocking. I am not re-requesting it.
- The round-127 reviewer note, if any, becomes a signal for the hotspot (ARCH-EXPORT-MP3-ORCHESTRATION / SRW20 q14).

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** These remain:
  - VISUAL-A V-0.1…V-0.5, V-1…V-3 and M1/M3/M4;
  - T12-ADVANCED;
  - 170 deferred Lows;
  - the Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the final full regression;
  - Saba's answers on ABL-R-1…18 and DUX-R-1…9.
- **Not BLOCKED:** nothing external is needed for round 127.
- **Purchase protection** was re-verified in G126-3, and the anonymous `/studio-lab` workspace opens with the demo badge.
- **Commit readiness:** none from rounds 123–126, which made no `store/` diff. Round 127 will be committable on its own after C PASS and the gate.

## 7. Advisor close-out (applied)
- **R1 leaf rule:** `strings.ts` imports nothing from `~/lib/arrangement`, `~/contexts` or `~/components`. Without that rule, `export-wav.client.ts` and `strings.ts` would import each other, because `export-wav.client.ts` imports the module and owns the timeout constant.
  - The stall text is now `wavWorkerStalled(timeout / 1000)`, called in `export-wav.client.ts`.
  - ST2 pins its exact literal, and ST5 pins the alias.
  - AN-REVIEW checks that `strings.ts` has no such imports.
- **The glossary is kept in `backlog.json`** (`v0_plan_d29z92.glossary`), so V-0.2…V-0.5 do not drift. Doc 104 is the canonical per-string map.
- **EX-EN-RUN** cites the HR-PHASE / 10M fallback for the short WAV render. The MP3 phase is the primary place to read the progress text.
- **GATE103-S2** is marked `scheduled round 127` in `open_findings`.
- **`b-next.json` `remaining`** uses the stage ids `V-0.1`…`V-0.5`.
