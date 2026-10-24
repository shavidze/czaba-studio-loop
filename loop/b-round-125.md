# B — Round 125 result and Round 126 plan (D-29z91)

Date: 2026-10-24 (planning from ~04:16 UTC) · Author: B · Advisor: available; consulted before writing and again at the end.

## 1. Inputs read
- `context/active-summary.md`, `tasks/round-125.md` (the round-125 `current-task.md`), `a-round-125.md`, `c-round-125.md` / `c-round-125.json`, `gates/gate-round-125.json`, `env-status.json`, `regression-last.json`.
- The full `backlog.json` was opened only for specific IDs: VISUAL-A-OBSIDIAN, the SRW-11B D-29b contract, the design signals, and the last `deferred_low_polish` entry.
- **Gate 125:** `skipped`, "no real changes", head `608187f`. It was not published, so the baseline commit does not change. The last published gate is 122 (`608187f`, both remotes).
  - **Baseline for round 126 = `608187f`.** `git status --porcelain` was empty.
  - The frozen list still verifies (937 entries, the same count as `git ls-files -co --exclude-standard`).
- Decision files: `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
- `root-pre-push-review.md` and `publication-checkpoint.json` have no new follow-up.

## 2. Round 125 result (independent C evidence)
- **C: PASS.** Flags: `browserVerified: true`, `realVerified: true`, `allRowsRan: true`, `partComplete: true`. D6, D1 and D2 are done; nothing spilled.
  - SOURCE-SCOPE was OK at start and end.
  - G125-3 passed. Only its fake-Bearer 403 sub-check is blocked (backend unavailable in cloud).
- **B spot-checks:**
  - **WAV headers** (parsed by B): the project export is 7217877 frames, 48 kHz / 24-bit / 2 ch, at both viewports. The range export is 192000 frames (4.000 s).
  - **Contrast:** `contrast-baseline.json` `byToken.text-dim`: 53/53 elements are below 4.5:1 (range 3.08–3.67).
  - **Auth guard:** `g125-3.json` shows 401, "Sign in required" and 0 `audio[src]`.
  - **Baseline files:** all four (`bbox-baseline-1280.json`, `bbox-baseline-1440.json`, `contrast-baseline.json`, `under24px.json`) carry the label "pre-V-0 baseline (608187f)".
  - **Screenshots opened:**
    - `D6-S1-1280.png`: only the top edge of the SFX lane shows above the detail panel.
    - `D2-hint-1440.png`: the hint line fits on one line, in low-contrast grey.
    - Both match C's descriptions.
- **A:** no-op; all three start-state checks were OK.

## 3. Backlog updates (evidence only)
- **DUX-B-1 (Low) → `deferred_low_polish`** (166 → 167), with its repro, contract and evidence.
  - It is expected to close in VISUAL-A V-1 (the `dim` token), with RV-2 verifying ≥ 4.5:1 on the same elements. It stays in the list until C verifies that, so it is not scheduled twice.
- **`design_ux_recommendations` += DUX-R-1 and DUX-R-2**, both `awaiting_user` (authority: the user request of 2026-10-23).
  - **Cross-links:**
    - DUX-R-1 ↔ TRACK-VOLUME-NUMERIC-FIELD and ABL-R-14. The earlier "deliberate difference" ruling is not reversed; the decision is routed to Saba.
    - DUX-R-2 ↔ SHIFT-FINE-DISCOVERABILITY and WAVEFORM-ZOOM-DISCOVERABILITY.
- **New info entries (from C's `notesForB`):**
  - C-R125-OBS-CTRL-ALT-PASTE-SPLIT;
  - C-R125-OBS-1280-SFX-LANE-UNDER-PANEL, with the pre-ruled D-29b test;
  - C-R125-OBS-VOLUME-DEADZONE-6PX;
  - C-R125-OBS-S1-FULL-SCALE;
  - C-R125-HARNESS-OVERWRITE, now a harness rule: every run writes a uniquely named output.
- **VISUAL-A-OBSIDIAN:**
  - status: part 1 is done; part 2 runs in round 126;
  - `part1_result_round125`;
  - the RV-1 and RV-2 `baseline` fields now say "captured", with the file paths. They are frozen inputs. The RV-2 note says the baseline already shows `dim` at 53/53;
  - `part2_round126_rules_d29z91`.
- **Records:** `rounds[125]` → completed, `rounds[126]` → dispatched, `current_task`, and `baseline_tree_at_round126`.
- **Other files:**
  - `feature-status.md`: the header, a Round 125 line, and the VISUAL-A row (part 1 **შესრულდა** with evidence; still **მუშავდება**).
  - `plan.md`: D-29z91 (R1–R7), round-table rows 125→/126/127, and the ownership line.
- **Backups:** `b-round-125-{backlog,b-next,feature-status,plan,current-task,regression-last}-before.*`. The scripts are in `b-round-125/tools/`.
- **Frozen list:** `b-round-125-r126-tree-sha256.txt` (937), byte-identical to the r125 list.
- `regression-last.json` is unchanged; the next regression is due on or after 2026-10-27.

## 4. Round 126 decision
- **Round 126 = DESIGN-UX-REVIEW part 2.** This is the "Otherwise" row of the round-125 task §7: nothing spilled, no Medium+ DUX-B, and regression is not due. C-only; A is a no-op.
- **Scope of part 2:**
  - D3 friction points at both viewports;
  - D4 "better than Ableton" ideas from DUX-R-3, each with `fitsVisualA`;
  - D5 final verdict, index and questions for Saba.
  - The user's five-section output is then complete.
- **D3-A runs first, with a pre-ruled test**, because it is the one item that could escalate.
  - **The observation:** at 1280, with the detail panel expanded, the SFX lane sits behind the panel.
  - **The contract is SRW-11B D-29b.** With auto-fit on and no user resize, the panel cap keeps every lane visible at its auto-fit minimum; if no height fits, the cap is 120.
  - **The test fixes the outcome in advance:**
    - panel > 120 px with a lane hidden → Medium DUX-B;
    - panel = 120 px and the SFX clip reachable by scroll → friction;
    - reachable only by collapsing the panel or dragging the separator → Low DUX-B;
    - unreachable → Medium DUX-B.
  - C also measures S1 without the group, because group rows were added after D-29b.
- **Smallest honest behaviour where the contract is unclear:**
  - The AltGr collision is a DUX-B only if typing in a CZABA text field triggers an edit. Otherwise it is an observation.
  - Target sizes stay Low unless they block use.
  - Differences from Live are not bugs.
- **Part 1 is protected.** C backs up the review file, never rewrites §2, §3 or §7, and checks row integrity at the end. The frozen D6 baseline files are not rewritten.
- **Roles:** all six named by the user. `design-philosopher` and `design-auditor`, which part 1 did not use, are named explicitly.

## 5. Architecture checkpoint
- This round brought no new Architecture note: A and C changed no code.
- ARCH-CHECKPOINT-PHASE1-BOUNDARY (`b-round-124-checkpoint-request.md`) is still unanswered and non-blocking. Round 126 is the last no-code window before V-0.
- If no answer arrives, V-0 stage 1 uses the fallback recorded in that request: one module in `app/lib/arrangement/`, plain constants plus small formatter functions, and one owner group per round. B records the rationale when it plans V-0. No re-request is needed.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** These remain:
  - DESIGN-UX-REVIEW part 2, and any Medium+ DUX-B it finds;
  - VISUAL-A V-0…V-3 and M1/M3/M4;
  - T12-ADVANCED;
  - 167 deferred Lows (including DUX-B-1);
  - the Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED;
  - the final full regression.
  - ABL-R-1…18 and DUX-R-1/2 await Saba.
- **Not BLOCKED:** nothing external is needed for round 126.
- **Purchase protection** was re-verified in G125-3. The anonymous `/studio-lab` workspace opens with the demo badge.
- **Commit readiness:** none. Rounds 123–126 produce no `store/` diff.
