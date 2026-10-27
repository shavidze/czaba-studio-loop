# B: Round 200 → 201 planning (D-29z166)

Date: 2026-10-27, planned from 01:32 UTC · Author: B · Advisor: **available and used** (one call after orientation, one review after writing; §8).

## 1. Inputs read
- `context/active-summary.md`, `current-task.md` (round 200), `a-round-200.md`, `c-round-200.md`, `c-round-200.json`, `b-round-199.md`, `retros/retro-200.md`, `lessons.md`, `b-next.json`.
- `gates/gate-round-200.json`: **skipped** ("C taskStatus FAIL"), not published. The baseline for round 201 stays the gate-199 commit `5b1a2bb`. The tree is clean (`b-round-200/git-status-at-planning.txt`).
- `env-status.json` (store 200), `regression-last.json` (2026-10-27 / round 199, unchanged; the next regression is due on or after 2026-10-30).
- `backlog.json`, by id only: `SABA-B-4`, `GLOBAL-FOCUS-VISIBLE-UNLAYERED`, `C-R196-03`, `C-R180-K8-PLAYHEAD-MASK`, `systemic_tasks`, `retro_runs`, `regression_rounds[2]`, `rounds[200]`, `narrow_grants`.
- Store spec (`docs/technical/store-redesign/store-redesign-spec.md` l.36) for the Studio-owned file list; `direction-decision.md` (direction A, STORE-2..5 unblocked).
- `publication-checkpoint.json` and `root-pre-push-review.md`: old items (2026-10-07 and round-50/64/65 reviews), already handled by earlier B rounds; no new remaining finding for this round.
- **Archive:** `tasks/round-200.md` = the round-200 `current-task.md` (`cmp` OK), created before the new task was written. **Backups:** `b-round-200/*-before-r201.*` (backlog, feature-status, b-next, current-task, lessons, regression-last, retro-200).

## 2. Acceptance results used (independently evidenced by C)
- **C round 200: FAIL**, `browserVerified=true`, `realVerified=true`.
  - Passed: SOURCE-SCOPE, RT-NUM, RT-IDS, RT-SABA, R200-P1 (1440×900 and 1280×720), G200-3 (both viewports).
  - Failed: RT-CAUSE and RT-LESSONS, both C-R200-01 (Medium). Also C-R200-02 (Low).
- **B checked C-R200-01 against the cited lines and agrees:**
  - `a-round-127.md` l.3: "STATUS: STOP — B ruling needed". §3 lists the 15 red granted tests and their cause (frozen Modal ✕ vs the glossary term "Close").
  - `c-round-127.md` l.3: "This is A's P1, and A stopped for a B ruling."
  - `a-round-178.md` l.43–49: "DEVIATION 2 / BLOCKER … W2 … is mandatory in §1, so these failures are forced. Both files are protected."
  - In both rounds A found the problem before handover. The cause was the task.
- **Closed on C evidence:**
  - C-R180-K8-PLAYHEAD-MASK. R200-P1 found brass only in the playhead and overview-playhead columns, 0 elsewhere, at both viewports (`c-round-200/out/p1-colsplit.json`).
  - REG-DUX5-PLAYHEAD-RESCAN removed from the 2026-10-30 regression scope (done).
- **Recorded:** OBS-C200-ROUNDING (wording added to the retro). OBS-C200-OVERVIEW-FRAME goes into the 2026-10-30 regression scope: scan `[data-testid=arrangement-overview]`, not the frame.
- **Not changed by this result:** no feature item changes status. Round 200 changed no source.

## 3. Retro correction (round-200 outcome table, row 2: B corrects first)
- **`retros/retro-200.md`:**
  - §1: 7 B / 4 A → **9 B / 2 A**. A new bullet says that A reported in both 127 and 178.
  - §3: the class cells of rows 127 and 178; the grouping (9/2/2/1); the taxonomy (127: missing test → ambiguous task text, so 4 and 2).
  - §6: SYS-3 "two" → **three unrecorded sites in two files**.
  - §7: the lesson count is now 23 (B 11).
  - §2 notes: the rounding sentence.
  - New §9 records the correction.
  - **No RT-NUM number changed.**
- **`lessons.md`** (32 lines):
  - L12: a hit in a protected or frozen file is a STOP, not an edit.
  - L14: only the dialog-unique-name rule remains, stated against the speed rule (A's feedback in `a-round-200.md`).
  - **L23 (B), new:** a mandatory change that collides with a frozen or protected file gets a grant or a ruling before dispatch, checked on a scratch copy.
  - The header note says the numbers are stable ids.
- **`backlog.json` v186:** `retro_runs[0]` (headline, lessons, status, correction), `rounds[200]` → `c_fail_process`, `rounds[201]`, the open findings C-R200-01 (open until RT-FIX), C-R200-02 (closed), OBS-C200-*, `systemic_tasks` SYS-3 count, `regression_rounds[2]`, `narrow_grants` (round 201) and the SABA-B-4 rulings.
- `b-next.json` carries the same partition.
- C re-checks only the changed lines in round 201 (row RT-FIX).

## 4. Decision: round 201 = SABA-B-4 stage 2 (store pages) + RT-FIX
- **Basis:**
  - the round-200 outcome table (row 2);
  - Saba's SABA-B-4 widening ("fix it everywhere", at most 2 rounds; stage 1 is done);
  - no open Critical/High/Medium finding that reproduces in the cloud blocks it.
- **Inventory first (L1), at HEAD `5b1a2bb`:**
  - **Scanner:** `b-round-200/tools/store-focus-inventory.py` finds store 155 tokens in 31 files and Studio 13 in 5. It caught all 4 mutant shapes.
  - **CSS:** 5 unlayered class rules with `outline: none` (AudioPlayer ×2, VideoShowcase ×2, ⌘K input) plus `.sort-select:focus` beat the global rule, so those controls have no ring today. `.newsletter-input-large` and `.glass-input` are unused.
  - **Browser probe** (`b-round-200/tools/sticky-probe.cjs`, mock on :5199): on `/store`, 3 inputs draw a double indicator (outline + glow). 0 elements are obscured by the sticky header going forward. Going backward, the only candidate is the LeadMagnet "Close" in a fixed overlay (`LeadMagnetPopup.tsx` l.56–60, `absolute top-6`, y 24–56), which is not obscured. So there is no sticky-chrome fix row, only a measured baseline.
- **Collision check (new L23):**
  - **Copy 1, the token sweep (140 tokens in 27 files):** the full vitest was green (189 files, 2753 tests; `b-round-200/out/sim-full-vitest.log`). The 5 covering files were also green (69 tests).
  - **Copy 2, the mount move plus the CSS deletions:** `studio-focus-ring`, `focus-reveal-ui`, `focus-source` and `store-theme-tokens` were green (58 tests).
  - The two were not run together; the task says so. The scratch copies were deleted, and `store/` was not touched.
- **Rulings** (IDs R92–R97, because R91 is taken by round 198; all vetoable):
  - **R92:** the global rule stays **unlayered**. This overrides the old split note "layer it". SFR1 pins the rule, layering brings no visible gain after the sweep, and an unlayered rule cannot be switched off by a utility.
  - **R93:** the focus-source mount moves to `root.tsx`.
  - **R94:** sweep by token class; keep `peer-focus:*`.
  - **R95:** the CSS deletions.
  - **R96:** C-R196-03. The cause is a labelled hypothesis (inline `<Link>`); A confirms it in the browser.
  - **R97:** the inset offset where a ring is measured as clipped.
- **Cloud limits:** `/account*`, `app/components/studio/*` (behind the protected purchased route) and possibly `/recordings`, `/scenes` are BLOCKED "backend unavailable in cloud". STF2 covers them statically.
- **Ableton:** does not apply (store pages).

## 5. Architecture signals
- No A reviewer note (round 200 had no code).
- The frontend-architect checkpoint request (`b-round-197.md` §6 + ARCH-R198-FOCUS-REGION) is unchanged and non-blocking.
- SABA-B-4 stage 2 ends a feature boundary. If round 201 passes, the checkpoint request stays open for root, without blocking SYS-1.

## 6. Scope check
- **FB-01..FB-16 and the SRW items:** unchanged. All are done, c_pass or verified_except_manual. SRW-21 stays `deferred_user` (Saba, 2026-10-23); its stage 1 stays.
- **Still out of scope:** professional plugins, effects, pitch and multi-video layers. Grid tempo is not audio stretching.
- **Unchanged constraints:**
  - The protected auth/purchase files are untouched, and G201-3 re-checks them.
  - `/studio-lab` stays demo-only and public.
  - Saba's queue order is unchanged: SABA-B-4 stage 2, then SYS-1..3, then STORE-2b..5, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED, then the phase-2 entries.
  - The ABL-R and DUX-R `awaiting_user` items are unchanged.
  - The store keep-list is checked (row KEEP-LIST).

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - the RT-FIX re-check, SABA-B-4 stage 2, SYS-1..3, STORE-2b..5;
  - REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED and the phase-2 entries;
  - 275 deferred Lows, the backend-blocked evidence and the Tech Lead manual checks.
- **Not BLOCKED:** nothing needs external input. The open Saba questions (retro §8) do not block round 201.

## 8. Advisor
- **After orientation.** Adopted:
  - follow the round-200 outcome table;
  - keep every RT-NUM number;
  - fix the partition in all three places;
  - do not layer the global rule;
  - mount in root;
  - sweep rules by token class, keeping `peer-focus`;
  - fix the CSS `outline: none` sites;
  - a new store guard with mutants;
  - cloud-unreachable sites → BLOCKED;
  - check for 178-class collisions before granting;
  - identify the backward-Tab "Close" before writing about it.
- **Review after writing:** see §10 (added after the call).

## 9. Readiness for root
- Nothing in `store/` changed in this planning step: `git status` is empty, and HEAD is `5b1a2bb`.
- **Round 201 artifacts:**
  - `b-round-200-r201-grants.txt` (31);
  - `b-round-200-r201-new-files.txt` (2);
  - `b-round-200-r201-tree-sha256.txt` (1001, checked OK);
  - `b-round-200-r201-granted-start-sha256.txt`;
  - `b-round-200/r201-granted-start/` (31 copies).
- The loop state commit should include `retros/retro-200.md`, `lessons.md`, `b-round-200/`, `tasks/round-200.md`, `backlog.json`, `feature-status.md` and `b-next.json`.

## 10. Addendum — advisor review after writing (all adopted)
1. **Board status word.** The `feature-status.md` RETRO row was **მოწმდება**. The board's glossary reserves that word for "all C IDs PASS". It is now **ბაგია**, matching the Round-200 bullet.
2. **Step 3 expected count.** B's scanner also counts non-focus `ring`/`outline` tokens. After the sweep the expected result is **store 15 tokens in 5 files** (155 − 140): Input 8 `peer-focus:*`, `Card.tsx:15` `outline`, `StudioTrack.tsx:214` ×3, `StemsLoadingAnimation.tsx` ×2 and `CustomCursor.tsx:90`. The task now lists them, so A does not STOP on a correct result.
3. **STF4 call count.** `useFocusSourceAttribute(` also appears in its own definition (`app/lib/focus-source.ts:43`). STF4 and mutant m4 now count call sites outside that file.
4. **Minor:**
   - A confirms with an all-file-type `grep` that `.newsletter-input-large` and `.glass-input` are unused before deleting them. B's check covered `*.tsx` only.
   - The `post_current_stage_queue` STORE-REDESIGN status records the round-201 dispatch.
