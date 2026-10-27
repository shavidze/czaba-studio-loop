# B: Round 202 → 203 planning (D-29z168)

Date: 2026-10-27, planned from 04:00 UTC · Author: B · Advisor: **available and used**, once after orientation and once after writing (§8).

## 1. Inputs read
- **Loop files:**
  - `context/active-summary.md` (head), `current-task.md` (round 202), `a-round-202.md`, `c-round-202.md`, `c-round-202.json`, `b-next.json`, `b-round-201.md`, `lessons.md`.
  - `backlog.json`, looked up by id only: `SABA-B-4`, `C-R196-03`, `B-R201-*`, `systemic_tasks`, `post_current_stage_queue`, `rounds[-1]`.
  - `feature-status.md`: grep only (header, SABA-B-4, STORE-REDESIGN, FB-01..16).
- **Gate:** `gates/gate-round-202.json` is **skipped** ("C taskStatus FAIL"), so nothing was published. HEAD stays `5b1a2bb`.
- **Store tree at planning:** the round-202 work, 31 ` M` + 3 `??` (`b-round-202/git-status-at-planning.txt`). `a-round-202/end-sha256.txt` checks OK, and so does the old frozen list.
- **Regression:** `regression-last.json` is 2026-10-27 / round 199, so the next one is due on or after 2026-10-30. No regression round now.
- **Archive:** `tasks/round-202.md` = the round-202 `current-task.md` (`cmp` OK), created before any writing.
- **Backups:** `b-round-202/*-before-r203.*` (backlog, feature-status, b-next, current-task, lessons, regression-last).

## 2. Acceptance results used (independently evidenced by C)
**C round 202: FAIL**, with `browserVerified=true` and `realVerified=true`.
- **14 rows PASS:** SCOPE-202, KEY-RING, RING-VISIBLE, HIDDEN-FOCUS (R99), CHOOSE-VIDEO (harness half; the in-app half is BLOCKED, backend), CSS-CONTROLS, CARD-RING (C-R196-03), POINTER, STUDIO-NEIGHBOUR, NO-SHIFT, KEEP-LIST, T-RUN-202, AN-REVIEW-202 and G202-3 (the purchase protection still holds).
- **2 rows FAIL:**
  - ERROR-BORDER → C-R202-01 (Medium, caused by this round);
  - CONTRAST → C-R202-02 (Medium, pre-existing).
- **Status changes:**
  - **No item becomes მზადაა.** SABA-B-4 stage 2 has failing rows. Its 14 passing rows stand for the files that are frozen in round 203.
  - C-R196-03, B-R201-PRODUCTCARD-HIDDEN-PREVIEW and B-R200-HIDDEN-FOCUSABLE-GAP have PASS rows. They close with the stage-2 publication after round 203.
- **Backend-blocked rows** (kept as open evidence): BLOCKED-AUTH, and the in-app half of CHOOSE-VIDEO.

## 3. Rulings (L10; the full text is in `current-task.md` §1)
- **R101, C-R202-01:**
  - **Fix:** `ui/Input` and `Textarea` use a static `aria-[invalid=true]:border-destructive` plus `aria-invalid={error ? true : undefined}`, placed before `{...props}`.
  - **Rejected:** A's ternary. It removes `border-outline-strong` from `baseInputStyles`, and the frozen ST8 F14 turns red (L23).
  - **Scratch evidence:** `store-theme-tokens` 38/38 and `store-focus-ring` 10/10.
  - **Browser evidence** (scratch server): the email field is red unfocused, keyboard-focused and mouse-focused, with `aria-invalid="true"` (`out/errborder/b203scratch-5175-1280.json`).
- **R102, C-R202-02:**
  - **Fix:** `.audio-preview-overlay-button` replaces its rest and hover teal shadows with dark `var(--color-background)` shadows.
  - **Method:** `tools/ring-sides.cjs` reproduces C's start numbers exactly: top 2.39/2.68, bottom 3.16/1.01, left 3.12/3.50, right 4.04/4.37.
  - **With R102:** top 3.21/3.35, bottom 6.07/5.49, left 4.58/4.70, right 5.38/5.41, at 1440 and 1280 (`out/ring-sides.txt`).
  - **Rejected:** `box-shadow: none`, which gives top 2.78/3.04.
- **R103, C-R202-03 (design ruling, vetoable by Saba):**
  - **Rule:** an in-field editing key on a text-entry target leaves the source unchanged. That means printable keys, Backspace/Delete, ArrowLeft/Right, Home/End, IME `Process`/`Dead`, and on multi-line targets also Enter, ArrowUp/Down and PageUp/Down, all with no Ctrl, Meta or Alt held. Every other key still switches to `keyboard`: Tab, Escape, ArrowUp/Down and Enter in single-line inputs, F-keys and modifier shortcuts.
  - **Why:** "No ring after a pointer press" covers typing into the field you clicked. Keys that move focus or act as commands keep the ring.
  - **Draft corrected after the advisor review:** B's first draft let only Tab switch. Under it, ArrowDown in the Studio library search would move focus to the first result with no ring (`ArrangementLibrary.tsx` `handleSearchKeyDown`), and so would Escape and Ctrl+K.
  - **Rejected:** the reviewer's option (a). It would show a ring on a pointer press into a text field, which re-opens stage 1.
  - **Trade-off:** while typing after a click, the only indicator is the caret (and the `ui/Input` brand label). That is stated for Saba.
  - **Probe:** `out/typing-probe2-5176.json` (scratch) vs `-5173.json` (live tree). Typing, the edit keys, Shift+A and a held key keep `pointer` with no outline. Escape gives `keyboard` with a solid outline. In Studio, ArrowDown focuses the first result with a solid outline. Tab gives a solid outline on the next element.
  - **Tests:** the existing focus-source, focus-reveal and studio-focus-ring suites stay green, and tsc is clean.
  - **Superseded:** the first probe, `out/typing-probe-5175.json`, belongs to the superseded draft.
- **R104, C-R202-07 (Low):** STF2 also flags arbitrary forms. It is cheap: the test file is round 202's own, and the policy allows a cheap Low the round already owns.
- **Advisor-flagged collision checked (L23):** `grep border-destructive|aria-invalid` in the tests finds only `store-focus-ring` and `store-theme-tokens`, and both stay green on the scratch copy.

## 4. Decision: round 203 = bounded fix-up (bug gate)
- **Basis:** the round-202 outcome table, row "A store FAIL (Medium+)". There are 3 tightly related Medium findings, all SABA-B-4 stage-2 focus follow-ups in the same owner area, plus one cheap Low.
- **Baseline:** `5b1a2bb` + the round-202 tree, which is not reverted.
  - **Frozen list:** 1030 entries, regenerated on the current tree.
  - **Grants:** 5, with start copies in `b-round-202/r203-granted-start/`.
  - **New files:** 2.
  - **Publication:** root publishes rounds 202 + 203 together.
- **Round 204 (fixed in advance if round 203 passes): "hidden focusables, runtime state":**
  - C-R202-04: the closed mobile menu at 375;
  - C-R202-05: the StudioShowcase reveal;
  - B-R201-HEADER-USERMENU-KEYBOARD.
  - Two of the three live in `Header.tsx`, so it is granted then. The browser half of the user menu is BLOCKED-AUTH; its jsdom half is testable.
  - L1 is amended: B's static scan missed runtime state.
- **After that:** SYS-1, SYS-2, SYS-3, then STORE-2b (the direction gate permitting; see the policy), and the rest of the queue unchanged.
- **New Lows → `deferred_low_polish`:** C-R202-06, C-R202-08, C-R202-09 (the drop loss; not browser-verifiable in-app), B-R202-APPCSS-TEAL-REMNANTS, B-R202-FILTERBAR-UNUSED and A-R202-REVIEW-SCANNER-LOWS. The list now has 282 entries.
- **A-R202-REVIEW-SCROLL-CLIP:** the reviewer rated it Medium; B rates it **Low** and backend-blocked.
  - **Why Low:** it is pre-existing, the old ring-2 was clipped the same way, and it is unmeasured.
  - **Next step:** a harness measurement later, then a re-rating if it reproduces.

## 5. Scope check (unchanged constraints)
- FB-01..FB-16 and the SRW items are unchanged. SRW-21 stays `deferred_user`.
- Professional plugins, effects, pitch and multi-video layers stay out of scope. Grid tempo is not audio stretching.
- The protected auth/purchase files are untouched, and G203-3 re-checks them.
- `/studio-lab` stays demo-only and public.
- Saba's queue order is unchanged.
- ABL-R and DUX-R stay `awaiting_user`.
- Ableton: does not apply (store pages and focus modality).

## 6. Architecture signals and checkpoint
- **Reviewer note** (verbatim in `a-round-202.md` §6): `AppContent` owns the document listeners. Keep it. Minor side effect: the error-boundary page shows the ring on mouse focus. Recorded in `architecture_signals`, no task.
- **New signal:** R103's local text-entry predicate duplicates Studio's `isTypingTarget` (minus `select`). It is a candidate shared helper.
- **Frontend-architect checkpoint:** still requested at the stage-2 boundary, which is after round 203 passes.
  - Scope: `b-round-197.md` §6 + ARCH-R198-FOCUS-REGION + the hidden-file-input button question + the text-entry predicate duplication.
  - It is non-blocking.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - SABA-B-4 stage 2 has 2 failing rows;
  - there are open Mediums: C-R202-01..05 and B-R201-HEADER-USERMENU-KEYBOARD;
  - still to do: SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED and the phase-2 entries;
  - 282 deferred Lows;
  - the backend-blocked evidence and the Tech Lead manual checks.
- **Not BLOCKED:** every ruling is B's to make, and nothing needs external input. R103 is vetoable, but it does not wait for Saba.

## 8. Advisor
- **After orientation.**
  - **Adopted:**
    - the round split (203 = 01/02/03 + cheap 07; 204 = the runtime-hidden class, with a Header grant);
    - the dirty-tree baseline, with a frozen list regenerated on the current tree and publication of 202+203 together;
    - the F14 collision check on scratch;
    - a defined per-side contrast method, and the hover glow changed too;
    - option (b) for typing, with a local predicate and an architecture signal;
    - the L24 lesson (the CONTRAST/RING-VISIBLE clause asymmetry) and the L25 filechooser lesson;
    - the Lows bookkeeping.
  - **Not adopted, with evidence:** granting `store-theme-tokens.test.ts` to move the F14 anchor. R101's attribute variant keeps F14 green on the scratch copy and shows the red border in all 3 states in the browser, so no frozen test needs to change.
- **Review after writing:** see §10.

## 9. Readiness for root
- B changed nothing in `store/`: `git status` equals the planning snapshot.
- B's scratch copy `/tmp/b203s` and its dev server on :5175 were stopped and deleted. B's mock on :5199 was stopped.
- **Round-203 artifacts:**
  - `b-round-202-r203-grants.txt` (5);
  - `b-round-202-r203-new-files.txt` (2);
  - `b-round-202-r203-tree-sha256.txt` (1030, OK);
  - `b-round-202-r203-granted-start-sha256.txt`;
  - `b-round-202/r203-granted-start/`;
  - `b-round-202/tools/{fl.cjs,png.cjs,shadow-probe.cjs,ring-sides.cjs,col.cjs,errborder-scratch.cjs,typing-probe.cjs}`;
  - `b-round-202/out/*`;
  - `b-round-202/update-backlog.py`.
- **The loop state commit should include:**
  - `tasks/round-202.md`, `current-task.md`;
  - `lessons.md`;
  - `backlog.json` (v188), `feature-status.md`, `b-next.json`;
  - `b-round-202/`.
- **No store stage is ready to commit.** Round 202 + 203 publish together after C PASS on round 203.

## 10. Addendum — advisor review after writing (adopted)
1. **T-RUN-203:** it now lists the expected start-copy result per row.
   - **Red:** IE1, the error half of IE4, FT1, FT2, FT5, PB1 and the new STF cases. FT6 is red by a missing export.
   - **Green:** IE2, IE3, FT3, FT4 and PB2.
   - B's first list wrongly expected IE2, IE3, FT3 and FT4 to be red.
2. **The ref build:** C copies the working tree with tar, restores the 5 grants and deletes the 2 new files. `git archive 5b1a2bb` would fail the 1030-entry frozen list.
3. **R103 × Escape:** checked in the source. Escape in the library search clears the query, and ArrowDown moves focus to the results. So R103 was narrowed to in-field editing keys (§3) and re-verified on a second scratch copy (:5176, deleted). FT3 now covers Escape, ArrowDown, Enter, PageDown, F6 and the Ctrl/Meta/Alt shortcuts. Mutants n5, n6b and n6c were added.
4. **CONTRAST-203 on `/`:** it uses the same per-side ≥ 3:1 criterion as the product page. B's `/` start crops were off-centre, so B cites no numbers for them.
5. **Mutant n8 touches the frozen IconButton:** restore it and run `sha256sum -c`, or use a scratch copy.
- **The F14 point:** the advisor withdrew the suggestion to grant `store-theme-tokens.test.ts`. R101 keeps F14 green.
