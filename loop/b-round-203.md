# B: Round 203 → 204 planning (D-29z169)

Date: 2026-10-27, planned from 05:20 UTC · Author: B · Advisor: **available and used**, once after orientation (before writing). The second call, after writing, is recorded in §8.

## 1. Inputs read
- **Loop files:**
  - `context/active-summary.md` (head), `current-task.md` (round 203), `a-round-203.md`, `c-round-203.md`, `c-round-203.json`, `b-next.json`, `b-round-202.md` §4, `lessons.md`;
  - `root-pre-push-review.md` and `publication-checkpoint.json`: both from 2026-10-07 and long handled; no new remaining findings.
- **`backlog.json`, by id only:** SABA-B-4, C-R202-*, C-R196-03, B-R201-*, B-R200-*, GLOBAL-FOCUS-VISIBLE-UNLAYERED, `systemic_tasks`, `post_current_stage_queue`, `rounds[-1]`, `architecture_signals[-1]`.
- **`feature-status.md`:** grep only.
- **Gate:** `gates/gate-round-203.json` is **published**, commit `135b880` (rounds 200–203), and both remotes have the same hash. That commit is the baseline for round 204. `git status` is empty.
- **Regression:** `regression-last.json` is 2026-10-27 / round 199, so the next one is due on or after 2026-10-30. No regression round now.
- **RETRO:** the last one was round 200. The next is at round 215 or at the end of STORE-REDESIGN.
- **Archive:** `tasks/round-203.md` = the round-203 `current-task.md` (`cmp` OK), created before any writing; it did not exist before.
- **Backups:** `b-round-203/*-before-r204.*` (backlog, feature-status, b-next, current-task, lessons, regression-last).

## 2. Acceptance results used (independently evidenced by C)
**C round 203: PASS**, with `browserVerified=true` and `realVerified=true`.
- 11 rows PASS: SCOPE, ERROR-BORDER, CONTRAST, HOVER, TYPING, NONTEXT, KEY-RING, NO-SHIFT, T-RUN, AN-REVIEW and G203-3 (purchase protection still holds; `/studio-lab` opens anonymously).
- 0 rows FAIL.
- BLOCKED-AUTH-203 (`account.reset`, `/studio/:id` components) is backend-only. It is kept as open evidence and does not make the round unverified (cloud rule).
- **Status changes:**
  - **SABA-B-4 → მზადაა** (stage 1 + stage 2, published `135b880`).
  - **Closed:** C-R202-01, C-R202-02, C-R202-03, C-R202-07, A-R202-REVIEW-INPUT-ERROR-BORDER, A-R202-REVIEW-TYPING-RING, C-R196-03, B-R201-PRODUCTCARD-HIDDEN-PREVIEW, B-R200-HIDDEN-FOCUSABLE-GAP and GLOBAL-FOCUS-VISIBLE-UNLAYERED (store half; the Studio half closed in round 197). L7 grep: no other open id shares these root causes.
- **New Lows → `deferred_low_polish`:**
  - C-R203-01 (no Textarea coverage);
  - C-R203-02 (⌘K Escape leaves focus on body);
  - A-R203-REVIEW-INPUT-DESCRIBEDBY (pre-existing);
  - C-R203-AUDITOR-FORCED-COLORS (`outline:none` in forced colours; best practice, not spec text);
  - B-R203-USERMENU-HOVER-ESCAPE and B-R203-E2E-RESPONSIVE-CLOSED-ASSERT (from this planning).
  - The list now has **288** entries.

## 3. Rulings on open A/C items (L10)
- **A-R203 M1** (Android `Unidentified` / IME `isComposing`). The reviewer rated it Medium; **B rates it Low**. It is fail-safe (an extra ring, never a lost one) and not reproducible in the cloud browser.
  - **Ruling:** accept the reviewer's proposal, plus **I1** AltGraph printable keys. Both fold into **SYS-3** (the same IME root-cause class).
  - **Test rows:** jsdom FT7–FT9.
  - **Manual:** a real Android check goes on the Tech Lead list.
  - Recorded in `backlog.json` → `systemic_tasks[SYS-3].also_fixes_d29z169`.
- **C's T-RUN note** ("STF2 red on start copy" cannot be proven). It is a B text defect, not A's. Lesson L23 is amended: repo-scan tests prove red only through a named mutant.
- **C's process note** (A went past a literal step-2 STOP, on grep hits in 2 unrelated frozen Studio tests). It is accepted, because both stayed green. In round 204, step 2 lists the expected hits explicitly, so "any other hit" is the only STOP.
- **Auditor suggestions** (caret-only indicator after a click): this is Saba's R103 veto question. It stays on the Saba list, unchanged.

## 4. B's own probes at planning (L1, L23)
Tools are in `b-round-203/tools/`, outputs in `b-round-203/out/`.
- **Servers:** HEAD on :5173 (root's dev server) and the mock on :5199, which B started from `mock-api/server.mjs`. Background processes do not survive a job; `cloud/run.sh` restarts the mock when the file exists. The scratch copy `/tmp/b204s` with R105–R107 ran on :5176 with its own `cacheDir`; it is now **stopped**.
- **L1 runtime Tab probe** (`tabprobe.cjs`, 5 pages × 375/1280/1440):
  - **HEAD:** the hidden stops are exactly C-R202-04 (5 per page at 375) and C-R202-05 (2 on `/` at 375 and 1280).
  - **Scratch:** 0 hidden stops.
  - **`/` stop counts:** 42→36, 41→40, 41→40.
- **DIV stop cause** (confirmed in source): motion-dom's press gesture sets `tabIndex=0` (`node_modules/motion-dom/dist/es/gestures/press/index.mjs:76`).
- **Signed-in seam:** `auth_user` without `accessToken` → `AuthContext.tsx:93-94` sets the user without a network call.
  - HEAD: the user menu cannot be reached by keyboard.
  - Scratch: the disclosure works end to end (`usermenu-*.json`).
  - **So B-R201-HEADER-USERMENU-KEYBOARD's browser half is not backend-blocked.**
- **Mobile close fade kept** (`mobile-5176.json`): visible at +100 ms, hidden at +600 ms.
- **Backward entry** (`backward-end-*.json`: End, then Shift+Tab, 1.2 s settle): HEAD CTA opacity 0 at all three widths; scratch opacity 1.
- **New pre-existing Medium: B-R203-LEADMAGNET-AUTO-OPEN-FOCUS.**
  - **Observed:** after End, then Shift+Tab, focus went off-screen (`lenistrace-5173-1280.json`).
  - **First hypothesis, Lenis — withdrawn.** A Lenis no-op stub reproduces the jump (`lenistrace-nolenis-5173-1280.json`), and no JS scroll API ran (`scrollculprit-5173.json`).
  - **Confirmed cause:** a per-frame poll (`heightpoll-5173-1280.json`) shows `scrollHeight` 4841 → 720. The End scroll passes the LeadMagnet 40 % threshold, and the popup opens 8 s after load. `useScrollLock` fixes the body, so `scrollY` → 0.
  - **Defect:** the popup takes no focus and has no dialog role and no Escape. Tab walks the page behind it (`popupcheck2-5173-1280.json/.png`).
  - **Ownership and scheduling:** this supersedes the LeadMagnet half of C-R202-06 (deferred Low, "no focus trap"). The new evidence (no announcement, no initial focus, prior focus forced off-screen, on an auto-opening popup) justifies Medium. Owner `LeadMagnetPopup.tsx`; keep-list rules apply. Round 205.
  - **Also checked:** forward Tab with 1.2 s settle gives 0/65 off-screen (`offscreen-*.json`). C rows suppress the popup with `czaba_lead_magnet.dismissed=true`.
- **Auth seam recorded** as the info finding B-R203-AUTH-USER-CLIENT-TRUST (root note; protected file; no Studio action).
- **L23 collision grep:**
  - `store-header-footer.test.tsx`: N1–N5 and S1 green on scratch (9/9).
  - The e2e specs are outside the gate: `playwright.smoke.config.ts` runs only `agent-system-smoke.spec.ts`.
  - `responsive.spec.ts:80` already fails on HEAD (`out/e2e-collide.txt`) → Low B-R203-E2E-RESPONSIVE-CLOSED-ASSERT.
- **Scratch typecheck and Biome:** `tsc` clean. Biome shows only the pre-existing `useButtonType` warnings, which R106 (5) removes.
- **Threshold:** B first tried 0.1, then kept **0.3** (the advisor's minimal-diff point). It was re-verified with 0.3: 0 hidden stops, the backward reveal works, and the scroll reveal is unchanged.

## 5. Decision: round 204 = three tightly related Medium bugs (bug gate)
- **Items:** R105 (C-R202-04), R106 (B-R201-HEADER-USERMENU-KEYBOARD), R107 (C-R202-05). See `current-task.md` §1.
- **Grants:** `Header.tsx` and `StudioShowcase.tsx`.
- **New files:** `store-hidden-focusables.test.tsx` and doc 161.
- **Frozen list:** 1035 entries on clean `135b880`.
- **C viewports:** 375, 1280 and 1440.
- **Smallest honest choices** (vetoable, recorded in `backlog.json` → `hidden_focusables_rulings_d29z169`):
  - **Hover reveal kept, with `aria-expanded` = keyboard/click state.** The user asked for keyboard reach, not a mouse change. The 1.4.13 hover-Escape gap is a deferred Low.
  - **`invisible`, not `inert`.** React 18 has no typed `inert` prop, and an assertion or string hack is forbidden.
  - **Once + on-focus reveal, threshold unchanged.**
- **Ableton:** does not apply (არ ეხება).
- **Next, fixed in advance:**
  - **Round 205:** B-R203-LEADMAGNET-AUTO-OPEN-FOCUS, owner `LeadMagnetPopup.tsx`. The likely scope is dialog semantics, initial focus, Escape close, focus restore and Tab containment. B plans it after round 204 and checks the shared `ui/Modal` and CommandPalette patterns first. Keep-list: no removal and no rewording.
  - **Then:** SYS-1, SYS-2, SYS-3 (+M1/I1), STORE-2b, and the rest of the queue unchanged.

## 6. Architecture (backlog signals, not tasks)
- **`architecture_signals` +1:** the round-203 Signal 2 (text-entry predicate duplication) and minor signal 3 (a second CSS rule parser).
- **Checkpoint:** SABA-B-4 is a feature boundary, and the focus system has accumulated risk across owners. B requests a **bounded frontend-architect checkpoint** from root in `b-round-203-checkpoint-request.md` (4 questions, non-blocking), which replaces the pending request in `b-round-197.md` §6. It is recorded in `backlog.json` → `architecture_checkpoint_requests`.

## 7. Scope check (unchanged constraints)
- Protected auth files are untouched by any grant.
- `/studio-lab` stays the anonymous demo (G204-3).
- Purchase protection is re-checked (G204-3).
- Nothing in the scope was shrunk or deferred without authorisation:
  - SRW-21 stays `deferred_user` (the user's decision);
  - PHASE2-VIDEO-SCORING still awaits Saba's go-ahead;
  - the out-of-scope list is unchanged (professional plugins/effects/pitch/multi-video-layer, and grid tempo ≠ audio stretch).
- Commit readiness: round 203 is already published. Round 204 is ready for A.

## 8. Advisor
- **Call 1 (after orientation)** produced these changes:
  - a backward-entry probe, which found the off-screen focus (first attributed to Lenis, then traced to the LeadMagnet popup after call 2);
  - the auth seam is runnable, so the user-menu row is no longer BLOCKED;
  - explicit hover/`aria-expanded` and showcase-semantics rulings, with threshold 0.3 kept;
  - the M1 ruling;
  - the checkpoint request now;
  - doc 161 kept separate from 160;
  - the L23 amendment.
- **Call 2 (after writing):** see the closing note appended below.

### Advisor call 2 (after writing) — what changed
- **Lenis stated as the cause without proof.** B ran the disambiguating stub; it disproved Lenis. The real cause (LeadMagnet scroll lock) was found and confirmed, and every artifact was corrected: task §1, §2, §3; backlog (Lenis entry withdrawn, new Medium); feature-status; lessons L1; b-next.
- **T-RUN "except as noted".** Per-row start-copy expectations were written.
- **A's probe output went into B's folder.** A now copies the tools to `a-round-204/tools/`; the claim that the mock was "left running" was removed.
- **Auth seam.** Recorded as the info finding B-R203-AUTH-USER-CLIENT-TRUST.
- **§0 wording vs SABA-B-4 მზადაა.** Aligned: the stage rows passed, and the hidden focusables are tracked as their own Mediums.
- **Also:** C rows seed `czaba_lead_magnet` so that the popup does not disturb unrelated rows.
