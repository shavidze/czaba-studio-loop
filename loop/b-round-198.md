# B: Round 198 → 199 planning (D-29z164)

Date: 2026-10-26, planned from 23:40 UTC (`date -u`) · Author: B · Advisor: **available and used**. One call before writing, one review after writing; see §7.

## 1. Inputs read
- `current-task.md` (round 198, now archived), `a-round-198.md` (with the reviewer's Architecture note), `c-round-198.md` and `c-round-198.json`.
- `gates/gate-round-198.json`: **published**, commit `980cfbee1ba0…` on both remotes. The round-199 baseline is HEAD `980cfbe`, and the tree is clean (`b-round-198/git-status-at-planning.txt`).
- `context/active-summary.md` (head), `regression-last.json` (2026-10-24, round 122), `root-pre-push-review.md` and `publication-checkpoint.json`. Both root files date from round 3; their findings are already tracked.
- `user-review/ableton-decisions.md` (for the parked ABL-R-9 note).
- `backlog.json`, by id only:
  - `items` and the `post_current_stage_queue` statuses;
  - the open Medium+ findings (none is open except backend-blocked R80 and SABA-B-4 stage 2);
  - the findings parked "for the regression round";
  - `rounds`, `narrow_grants` and `deferred_low_polish`.
- `feature-status.md`, by grep only.
- `tasks/round-122.md`, the last regression round, used as the template.
- Doc status lines in `store/docs/implementation/2026/quarter-IV/`: 156, 158 and 159 are still "In Progress".
- **Archive:** `tasks/round-198.md` = round-198 `current-task.md` (`cmp` OK). It was created before the new task was written.
- **Backups** in `b-round-198/`: `backlog-before-r199.json`, `feature-status-before-r199.md`, `b-next-before-r199.json` and `regression-last-before-r199.json`.

## 2. Acceptance results used (independently evidenced by C)
- **C round 198: PASS**, `browserVerified=true`, `realVerified=true`. 12 rows passed, 0 blocked; the gate rows belong to root. Gate 198 published `980cfbe`.
- **Backlog changes, from this evidence only:**
  - **C-R196-02 → closed** (`closed_by_c_r198`). Measurements: FOCUS-REVEAL-198 tree 0/0 hidden stops vs ref 6/6. The chrome, pointer, side, ring and rest rows were equal to the ref.
  - **SABA-B-4:** stage 1 is complete, including R91. The item stays **მუშავდება**, because stage 2 (store pages) has not started.
  - **C-R198-01 (Low) → `deferred_low_polish`.** B ruling on C's `pointerRowRuling`: C's reading is accepted. The pre-written "keyboard stop above the chrome bottom → Medium" clause targets keyboard focus *landing* (Tab stops). ArrowUp on an already-focused range fires no focus event. 6 of 16 px hidden is not "entirely hidden" under WCAG 2.4.11, and the tree equals the ref, so this is not an R91 regression.
  - **C-R198-02 (Low) → `deferred_low_polish`.** It is pre-existing in the default scene (tree = ref = round 197). For the rich scene, "pre-existing" is C's inference and stays labelled as one.
  - `deferred_low_polish`: 272 → **274**.
  - **`scopeDeviationsForB` accepted as part of R91** (recorded in `rounds[198].b_rulings_d29z164`):
    - the extra guard `event.target === scroller || !scroller.contains(event.target)` (reviewer H1, the portaled marker menu);
    - the structural handler parameter type `{ target: Element }`.
  - `rounds[198]` → `c_pass_published`. Added `rounds[199]` and three `narrow_grants` (docs only). STORE-REDESIGN status updated. `backlog.json` version 183.

## 3. Decision: round 199 = REGRESSION
- **Basis:** round 198 §7, written in advance, says "C PASS → round 199 is the REGRESSION round".
- **The timestamp, recorded honestly:**
  - `regression-last.json` = 2026-10-24, and this planning ran at 2026-10-26 23:40 UTC, which is strictly 2 days.
  - The 3-day rule defines when a regression round is mandatory; it does not forbid one earlier.
  - Round 197 deviated from its §7 only because an open Medium outranked it. **Today 0 Critical/High/Medium findings reproduce in the cloud**, so nothing outranks the pre-written outcome.
  - C's run falls on 2026-10-27, when the rule is due.
  - The workflow's "შემოწმების მოცულობა" clause requires a full re-check after a shared-infrastructure change. SABA-B-4 stage 1 (every Studio focus style) and STORE-2a (the store `@theme`) are such changes, and 76 rounds have passed since the last sweep.
- **What was not done:** `regression-last.json` is **not** touched now. The task's §7 tells the round-200 planner to update it from C's result first, so that no second regression round is planned by mistake.
- **A's part:** four status lines in three docs (156, 158, 159), which are stale since rounds 190, 195 and 197. Doc 159 says "stage 1 Completed" only.
- **C's part:**
  - the round-122 rows (SRW-01..24, T12 V1), with strings and selectors corrected for V-0 English, the round-179 badge selector and the STORE-1c `Studio` link;
  - 8 consolidated rows for the Studio work since round 122;
  - 5 store rows on the mock;
  - 3 parked observations (C-R167-METRONOME-UNDER-MUTE, C-R149-OBS-SPACE-EMPTY, GATE76-S3-VIDEO-CLIP-MARKER-UNTESTED);
  - the e2e smoke and G199-3.
- **The trap avoided:** the round-122 rows were not copied verbatim. Their Georgian strings and old selectors would produce false FAILs, so the task makes `strings.ts` and testids the source of truth and requires "lookup, not deviation" notes.
- **RETRO:** the policy says "at round 200 or the STORE-REDESIGN exit, whichever comes first", so round 200 is the RETRO. If round 199 finds a Medium or higher, the fix-up goes first and the RETRO moves one round later. This is recorded in §7 of the task.
- **Order after that:** SABA-B-4 stage 2 (store pages, with C-R196-03 and the store half of GLOBAL-FOCUS-VISIBLE-UNLAYERED) → STORE-2b → 2c → 2d → STORE-3..5 → REVIEW-RECOMMENDATIONS → STUDIO-PERFORMANCE → T12-ADVANCED → PHASE2-VIDEO-SCORING (gated; skip rule) → PHASE2B-SPOTTING → STUDIO-AGENT-COMMANDS → RECORDING-META-S1.

## 4. Architecture signals (recorded, not scheduled)
- **ARCH-R198-FOCUS-REGION** (new, info). The reviewer's note, verbatim in `a-round-198.md` l.113–116:
  - Signal 3 is weak: the scroller/chrome focus region changed in rounds 196–198, and R89 was reverted.
  - The verdict is **keep**: the logic sits in `lib/focus-reveal.ts`, and the component only reads and writes refs it already owns.
  - Signal 4 is absent.
- It is folded into the frontend-architect checkpoint request already pending from `b-round-197.md` §6. That request is still non-blocking and has no result yet.
- Signals already kept: ARCH-R197-FOCUS-TEST-COST, A-R196 Signal 4 (the R85 mount owner), ARCH-R193-THEME-REGION.

## 5. Scope check (nothing shrunk, nothing deferred without authorisation)
- **FB-01..FB-16 and the prototype flows:** every SRW item is done, c_pass or verified_except_manual, except SRW-21. SRW-21 stays `deferred_user` by Saba's 2026-10-23 decision. The regression round re-verifies them; none is relabelled.
- **Out of scope and unchanged:** professional plugins, effects, pitch and multi-video layers. Grid tempo is not audio stretching (RG-15 checks the "not stretched" text).
- **Unchanged constraints:**
  - The protected auth/purchase files are untouched, and G199-3 re-checks purchase protection.
  - `/studio-lab` stays demo-only and public.
  - Real audio and video behaviour are re-measured: drift, WAV exports, MP3 and the meter rule.
- **Saba's queue entries keep their order.** The ABL-R and DUX-R `awaiting_user` items are unchanged.

## 6. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - SABA-B-4 stage 2, STORE-2b..STORE-5, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED, the phase-2 entries and 274 deferred Lows remain.
  - SRW-21 is deferred by the user, and the backend-blocked evidence is still open.
- **Not BLOCKED:** the next task needs no external input. Only the backend-dependent rows are blocked, and they are listed in the task.

## 7. Advisor
- **Availability:** the configured advisor was available and was called before writing.
- **Adopted:**
  - Follow round 198 §7 (REGRESSION) and record the 2-day timestamp and why nothing outranks it.
  - Do not touch `regression-last.json`. Copy round 122's ordering rule.
  - Do not copy the round-122 rows verbatim. Fix the strings, selectors and the `Studio` link, and base the tools on `c-round-198/tools`.
  - Add consolidated rows for the post-122 work, including a short R91 check.
  - The fake-Bearer 403 is mock-backed and is a normal row.
  - Doc 159 says "stage 1 Completed" only, and line 69 is updated too.
  - Rulings on C-R198-01/02 and on the scope deviations, as in §2.
- **Review call after writing.** Adopted in full:
  - **Fixed a factual error in doc 159 line 4.** The text said "C PASS in rounds 196–198", but round 196 was a C FAIL. It now reads "C PASS in rounds 197 and 198, published in `2505252` (rounds 196–197) and `980cfbe` (round 198)".
  - **R80-RECORDINGS-FIELD-BORDERS** (Medium): B read its full status. Its browser half really needs the backend: the fields are on signed-in routes, and the mock answers the recordings, sfx-library and sfx-scenes APIs with sign-in-required. It is now named by id in the task's blocked list. It is not done, and it stays open backend evidence.
  - **RV-TOKENS teal:** B's grep found no teal class or `--color-video-sync` consumer under `app/components/arrangement/`. The row is scoped to the `[data-studio-theme]` root, and the store header is excluded (STORE-2b).
  - **Georgian user input:** RG-16 and RG-17 type Georgian names again. RV-EN runs in its own session and excludes user-entered text.
  - **RG-01:** the wait is structural (the scroller testid). `rowLoading` is the library-row loader.
  - **SOURCE-SCOPE:** "exactly" the three docs.
  - **Title and RV-REVEAL:** the title now matches the body, and RV-REVEAL has an explicit 1440 control.
  - **Tooling note:** this session had no Edit tool. B made the task corrections with a checked replace script (`b-round-198/fix-task.py`: each target must match exactly once). A's instruction to use the Edit tool for the store docs is unchanged.

## 8. Readiness for root
- Round 198 is already published (`980cfbe`). Nothing from B is pending publication.
- **Round 199 baseline:** clean `980cfbe`, frozen list of 1029 entries, 3 doc grants (`b-round-198-r199-*`).
- On C PASS, the publish is doc-only.
