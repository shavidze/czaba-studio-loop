# B round 246 → 247 planning (2026-10-29)

**Decision: CONTINUE.** Round 247 is **UNDO-GROUP-FOCUS** (B-R245-UNDO-GROUP-FOCUS, Medium). Decisions D-29z412…D-29z418. Baseline is HEAD `869d767` (gate 246 `commit`), clean, with 3 grants, 1 new doc and 1,104 frozen files.

**Advisor:** available and used once before writing; a final check follows. It asked for: the 869d767 baseline and fresh hash lists; triage of every round-246 note; a ref-detach on the row root (not BODY-based); a last-committed order snapshot; an explicit precedence ruling with a mutant; and a fresh Chromium probe for this element shape. All but the last were done. For the last: B did not run a separate ref-detach-order probe for a parent row with a focused descendant. That the detach comes before the removal in Chromium is **inferred** from the scratch fix landing on the successor at both viewports, as in round 246 (task §1). After the final advisor check, B also ran the missing 1280 HEAD rows (`head-1280-extra.json`) and its own recipes for C-VOLUME-REMOVAL-247 and C-COLLAPSE-REG-247 (`head-vol-collapse.json`), and corrected both rows: the volume needs three `Ctrl+Z` to reach the group removal. **Consults:** none. The `tech-lead` ruling from RETRO 245 (per-owner rescue; BODY never) is reused.

## 1. Inputs read
- **Gate 246:** `published`, commit `869d767`, pushed to both remotes. Review 9/10, no Critical issues; suggestions S1–S4 and an Architecture note.
- **C round 246:** PASS. `browserVerified` and `realVerified` are true, 15 rows passed, 0 bugs, and the purchased origin is BLOCKED (backend). Info notes: C-GROUP-INFO-246, INFO-C246-DRAG-RING, INFO-C246-VITE-CACHE and A-R246-REVIEW-L1 (browser).
- **A round 246:** no STOP. Notes: A-R246-REVIEW-L1 and A-R246-REVIEW-INFO1, plus the Architecture note.
- **Regression:** `regression-last.json` is round 199, 2026-10-27, so it is due on or after 2026-10-30. Today is 2026-10-29: **not due**. RETRO is next at round 260.
- **User-review folder:** no new decision file. AGREE-SABA-B-7 is still unanswered.
- **Archive:** `tasks/round-246.md` is a byte copy of the round-246 `current-task.md` (`cmp` identical; it did not exist before). Before-copies are in `b-round-246/*-before-247.*`.

## 2. Backlog changes from independent evidence (D-29z412, D-29z413)
- **Closed by C round 246 PASS and gate 246:**
  - B-R243-UNDO-MARKER-FOCUS;
  - C-R245-01, C-R245-02 and C-R245-03 (RT-FIX-246);
  - `retro_runs` 245 → done;
  - GATE246-S1 (closed by C-CUTTIME-246 and C's skip-next probe).
- **To `deferred_low_polish` (395 → 399):** A-R246-REVIEW-L1, GATE246-S3, GATE246-S4 and INFO-C246-DRAG-RING, each with its evidence and repro.
- **GATE246-S2:** info for the marker owner; ruled for groups in D-29z415.
- **A-R246-REVIEW-INFO1:** closed, not reproduced. With the marker menu open, `Ctrl+Z` undoes nothing at either viewport (`b-round-246/head-*.json` markerMenuUndo).
- **INFO-C246-VITE-CACHE:** a harness fact and a retro candidate.
- **Architecture:** GATE246-ARCH-FOCUS-SUCCESSOR is recorded as a signal and not scheduled (D-29z416).

## 3. Round 247 (D-29z414, D-29z415)
- **Re-measured at `869d767`, both viewports:** every focused group-row control falls to BODY on Undo: Group Tracks and Redo: Ungroup Tracks (Ctrl+Shift+Z, Ctrl+Y). That covers the name, fold, mute and volume, a folded group, and the outer row of a nested group. Track rows never move, because non-adjacent grouping is refused and history never adds or deletes tracks.
- **The rule:** focus goes to the next row in the last committed full row order whose name button is rendered (in practice the first former member), else the previous one. Focus elsewhere is never moved. `ungroupSelectedTrackRows`' explicit target wins.
- **Mechanism:** a memoised ref on the group row root reports `contains(activeElement)` at detach. `StudioWorkspace` keeps the last committed `allTrackRows` order. A no-deps layout effect, placed before the `pendingRowFocusRef` effect, focuses the successor.
- **B's pre-check:**
  - `precheck-scratch.diff` (+19/−1, +42, +157 lines);
  - tsc and Biome clean;
  - covering set 96 files, 1,492/1,492;
  - 9 mutant runs, each with the expected red rows;
  - Chromium at both viewports: HEAD BODY → fix Music, the Group 1 name for nested groups, and a brass 1 px ring when focus was reached by Tab.
- **Harness facts:**
  - INFO-B247-MODIFIER-NO-FOCUS-VISIBLE: a Ctrl chord is not keyboard modality, so a mouse-reached focus shows no ring after the rescue;
  - INFO-B247-VOLUME-BLUR-ON-REMOVAL: neighbour row C-VOLUME-REMOVAL-247;
  - INFO-B247-GRIDMENU-UNVERIFIED: C info probe;
  - INFO-B247-COLD-START-REACT: environment; the row was re-run clean.

## 4. Architecture checkpoint (D-29z416)
`b-round-246-checkpoint-addendum.md` asks root for a bounded `frontend-architect` checkpoint at this feature boundary. The question: keep two per-owner ref-detach rescues (marker flags, group rows) or extract one helper. It does not block, and it is wanted before SABA-B-10a.

## 5. Next (D-29z418)
1. Round 248 = **REGRESSION** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry, now including C-GROUP-ORIGINS-247. If that planning is still on 2026-10-29, SABA-B-11b stage 2b goes first.
2. Then **SABA-B-11b stage 2b** (closes ABL-R-8), then SABA-B-10a (with C-R235-02), 10b, 9 and 11c. SABA-B-7 runs when Saba answers.
3. Then SYS-5, PERF b-ii and the rest of the queue, unchanged.
- **Commit readiness for root:** round 247 changes 3 source and test files and adds doc 190. Publish only after C PASS and the gate. Round 246 is already published (`869d767`). The loop-state commit carries this planning.

## 6. Completion check
- **Not COMPLETE.**
  - One Medium is open and dispatched (B-R245-UNDO-GROUP-FOCUS).
  - The SABA-B-9/10/11 stages (2b, 10a, 10b, 9, 11c), SABA-B-7, SYS, PERF, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2 remain.
  - All 399 deferred Lows must be fixed and C-verified before final acceptance.
- **Not BLOCKED.** Runnable work exists. Only SABA-B-7 and PHASE2-VIDEO-SCORING wait for Saba.

## 7. Self-check
- **Backlog edits** come only from C-246 and gate-246 evidence, plus B's own probe files.
- **No scope shrunk; nothing deferred without authority.** The Lows were moved under the 2026-10-23 bug gate.
- **Protected files** are untouched and frozen, each listed once. `/studio-lab` stays demo-only (the Auth row).
- **The store tree was not modified:**
  - every experiment ran in `/tmp/b247-scratch`, `/tmp/b247-mut` and on `:5174`, which is now stopped;
  - `git status` is empty and the frozen list gives rc 0;
  - `:5173` still answers 200.
- **Speed rule:** no task row asks A or C for the full suite; those are gate rows.
- **Lessons:** `lessons.md` is unchanged (57 lines). No Saba-reported issue was planned, so no new lesson is required.
