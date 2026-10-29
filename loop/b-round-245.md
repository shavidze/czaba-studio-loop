# B round 245 → 246 planning (2026-10-29)

**Decision: CONTINUE.** Round 246 is **UNDO-MARKER-FOCUS**: B-R243-UNDO-MARKER-FOCUS (Medium), one owner (`ArrangementMarkerRow.tsx`), plus **RT-FIX-246** for C's three document Lows. Decisions D-29z406…D-29z411. Baseline is HEAD `e9fb805`, clean, with 2 grants, 1 new doc and 1,104 frozen files.

**Advisor:** available and used once, before writing. It confirmed the order, kept the group sibling out of this round and asked for the jsdom removal check. A final check follows. **Consults:** none this planning. `tech-lead`'s RETRO-245 ruling (MarkerRow owns the fix; focus the neighbour, else the add control) is reused, not re-asked.

## 1. Inputs read
- **Gate 245:** `gates/gate-round-245.json` is `skipped`, "C taskStatus FAIL". Nothing was published, so the last publication is still gate 244 → baseline HEAD `e9fb805`.
- **At planning:** `git status` was empty (`b-round-245/git-status-at-planning.txt`, 0 bytes). The round-245 frozen list gave rc 0.
- **C round 245** (`c-round-245.json`):
  - taskStatus **FAIL**, from RT-LESSONS (C-R245-01, C-R245-03) and RT-SABA (C-R245-02), all Low document findings;
  - PASS: SOURCE-SCOPE, RT-NUM, RT-CAUSE, RT-IDS, RT-SCREEN, G245-AUTH and STUDIO-SMOKE-245;
  - `browserVerified` and `realVerified` true; nothing blocked.
- **A round 245:** no change. Its lesson feedback named the same three dropped clauses as C-R245-01.
- **Regression:** `regression-last.json` is round 199, 2026-10-27, so it is due on or after 2026-10-30. Today is 2026-10-29: **not due**.
- **Archive:** `tasks/round-245.md` is a byte copy of the round-245 `current-task.md` (`cmp` identical; it did not exist before). Before-copies are in `b-round-245/*-before-246.*`: backlog, lessons, feature-status, b-next, regression-last, current-task and retro-245.

## 2. Round 245 result (D-29z406)
- No product item changes status, and nothing closes from round 245.
- `retro_runs` 245 is **RT-FIX pending**, the same pattern as 230 → 231.
- The four C info notes are filed as info: INFO-C245-COST-ROUNDING, -COLLECT-DIFF, -BEFORE-COPY-UNVERIFIABLE and -SMOKE-STATE.

## 3. RT-FIX corrections (D-29z407)
- **C-R245-01** (and A's lesson feedback, accepted):
  - L11 regains three old-L32 clauses: "(a timeout included)", "not under 'For B/root'" and "its declared timeout".
  - L12 regains the old-L40 sentence: "a hit that pins classes in a frozen or protected file is a STOP (L11) with the hit list".
- **C-R245-03:** C was right; the old conditional-render alternative found 0 lines. B also found that it missed the flag list itself (`renderedMarkers.map`), which is this round's origin. Changes to L50:
  - the new alternative is `^\s*\{[^}]*(\.map\(|&&|\?)`, which catches JSX list renders and conditional renders, including multi-line ternaries;
  - the root is narrowed to the granted files plus the grep-found callers of the removing actions. The whole folder gave 206 hits, which is too many to rule on.
- **C-R245-02:**
  - R49-T gets a concrete question for Saba (relative or absolute snap of an off-grid clip) and the deadline RETRO 260; SABA-B-11c's C PASS closes it.
  - GATE244-S4 gets the deadline RETRO 260.
- `lessons.md` stays at 57 lines and only 4 lines changed (`b-round-245/lessons-rtfix.diff`). Retro §12 changed 2 lines (`retro-rtfix.diff`). C re-checks only these.

## 4. Round 246 (D-29z408)
- **The rule:** when the focused flag leaves `markers` by any path (Undo of an add, Redo of a delete, Cut Time), focus goes to the next surviving flag in time order, else the previous one, else Add marker. Focus that was elsewhere is never moved.
- **A decisive environment fact (INFO-B246-CHROMIUM-BLUR-ON-REMOVAL):** Chromium 143 fires blur and focusout when a focused element is removed; jsdom does not. A blur-based fix would pass vitest and fail in the browser. React 18 detaches a removed element's ref while it is still focused: printed in jsdom, and inferred in Chromium from the scratch probe reaching the successor. So the fix records focus there.
- **B's pre-check on a scratch copy:**
  - `precheck-scratch.diff`: 34 source lines and the rows MU18–MU23;
  - tsc and Biome clean;
  - covering set 58 files, 1,115/1,115 green;
  - 8 mutant runs, each with the expected red rows (the script was run twice);
  - Chromium probe at both viewports: HEAD BODY → fix: Add marker, the neighbour, Add marker.

## 5. New finding (D-29z409)
- **B-R245-UNDO-GROUP-FOCUS** (Medium, pre-existing), found by the L50 enumeration. With the group name button focused, `Undo: Group Tracks` and `Redo: Ungroup Tracks` leave BODY, at both viewports.
- It is a different owner (`StudioWorkspace.tsx`), and that file's focus ownership is the open root checkpoint question. So it is **not** folded into this round. It is scheduled after REGRESSION and before SABA-B-11b stage 2b, and it is question 4 of ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (non-blocking).
- `addUndoThenRedo` is info only (INFO-B246-REDO-ADD-NO-UNMOUNT). Clips are not focusable, so clip Undo is out of scope.

## 6. Next (D-29z410)
1. Round 247 = **REGRESSION** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry as a named row, including the new C-UNDO-ORIGINS-246. If that planning is still on 2026-10-29, B-R245-UNDO-GROUP-FOCUS goes first.
2. Then **B-R245-UNDO-GROUP-FOCUS**.
3. Then **SABA-B-11b stage 2b** (closes ABL-R-8).
4. Then SABA-B-10a (with C-R235-02), 10b, 9 and 11c. SABA-B-7 runs when Saba answers.
5. Then SYS-5, PERF b-ii and the rest of the queue, unchanged.
- **Commit readiness for root:** round 246 changes two source files and adds one doc. Publish only after C PASS and the gate. Nothing from round 245 is publishable from `store/`. The loop-state commit carries the RT-FIX edits.

## 7. Completion check
- **Not COMPLETE.** Two Mediums are open (B-R243-UNDO-MARKER-FOCUS, being fixed now, and B-R245-UNDO-GROUP-FOCUS). The SABA-B-9/10/11 stages, SABA-B-7, SYS, PERF, STORE, T12-ADVANCED and phase 2 remain. All 395 deferred Lows must be fixed and C-verified before final acceptance.
- **Not BLOCKED.** Runnable work exists. Only SABA-B-7 and PHASE2-VIDEO-SCORING wait for Saba.

## 8. Self-check against the planning rules
- **Backlog edits come only from independent evidence:** no closure from round 245 (C FAIL); the new findings come from B's own probes, with evidence files.
- **No scope shrunk; nothing deferred without authority.** The group bug is scheduled, not deferred.
- **Protected files:** the auth and purchase files are untouched and frozen, each listed once. `/studio-lab` stays demo-only (the Auth row).
- **The store tree was not modified:**
  - every experiment ran in `/tmp/b246-scratch` and on `:5174`, which is now stopped;
  - `git status` is empty, and the frozen list gives rc 0.
- **Speed rule:** no task row asks A or C for the full suite; those are gate rows.
