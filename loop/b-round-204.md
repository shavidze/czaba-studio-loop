# B: Round 204 → 205 planning (D-29z170)

Date: 2026-10-27, planned from 07:50 UTC · Author: B · Advisor: **available and used**, once after orientation, before writing. The second call, after writing, is recorded in §9.

## 1. Inputs read
- **Loop files:**
  - `context/active-summary.md` (head); `current-task.md` (round 204); `a-round-204.md`, `c-round-204.md`, `c-round-204.json`; `b-round-203.md`; `b-next.json`; `lessons.md`; `b-round-203-checkpoint-request.md`.
- **Gate:** `gates/gate-round-204.json` is **blocked** ("reviewer did not return COMMIT: OK"), head `135b880`.
  - `gates/round-204/review.md` was read in full: BLOCK on Critical #1 (doc 161 l.111 claims a test that does not exist), Suggestions #1–#5 (all Low), and an Architecture note, score 8/10.
  - `verify.log` is green: 194 test files, Biome "No fixes applied", build OK.
  - Because the gate is not `published`, the baseline is **not** a new HEAD: it stays `135b880` plus the round-204 work. This is the round-104/105 precedent (`tasks/round-105.md`).
- **`backlog.json`, by id only:** C-R202-04/05/06, B-R201-HEADER-USERMENU-KEYBOARD, B-R203-LEADMAGNET-AUTO-OPEN-FOCUS, B-R203-USERMENU-HOVER-ESCAPE, `systemic_tasks`, `post_current_stage_queue`, `rounds[-1]`, `architecture_checkpoint_requests`, plus the entry formats.
- **`feature-status.md`:** grep only.
- **Source (read only):**
  - `LeadMagnetPopup.tsx`, `useLeadMagnet.ts`, `useScrollLock.ts`, `ui/Modal.tsx`, `api.subscribe.tsx`, `root.tsx` l.145–165;
  - the ExportDialog focus-trap grep;
  - `store-focus-ring.test.ts` (GRANTED_STORE_SOURCES, STF2) and `store-theme-tokens.test.ts` (ST5, ST7);
  - `store-hidden-focusables.test.tsx` helpers, and `Header.tsx` l.41–45.
- **Regression:** `regression-last.json` is 2026-10-27 / round 199, so the next one is due on or after 2026-10-30. **RETRO:** round 215 or the end of STORE-REDESIGN.
- **Archive:** `tasks/round-204.md` = the round-204 `current-task.md` (`cmp` OK), created before any writing; it did not exist before.
- **Backups:** `b-round-204/*-before-r205.*` (backlog, feature-status, b-next, current-task, lessons, regression-last, and the checkpoint request).

## 2. Acceptance results used (independently evidenced by C)
**C round 204: PASS**, with `browserVerified=true` and `realVerified=true`.
- 10 rows PASS: SCOPE, HIDDEN, MOBILE, USERMENU, SHOWCASE, NO-SHIFT, RING, T-RUN, AN-REVIEW and G204-3 (purchase protection still holds; `/studio-lab` opens anonymously; the `auth_user` seam does not bypass premium auth).
- 0 rows FAIL. No backend-blocked row.
- **Status changes:**
  - C-R202-04, C-R202-05 and B-R201-HEADER-USERMENU-KEYBOARD → **`c_pass_gate_blocked`**. They are **not** მზადაა: C's evidence exists, but publication does not. They become done when root publishes rounds 204+205.
  - No item moves to done in this planning.
- **New findings → `deferred_low_polish`:**
  - C-R204-01: CTA at opacity 0 under `preventScroll` focus; the owner is the frozen `_index.tsx` ScrollReveal;
  - C-R204-02: null-blur close, the same as reviewer Suggestion 1; the fix shape is recorded;
  - A-R204-GLOBAL-TRANSITION;
  - A-R204-CTA-FOCUS-DELAY;
  - GATE204-S3;
  - GATE204-S5;
  - A-R204-ACCOUNT-LINK-ENTER-FOCUS;
  - GATE204-S4, which is optional in round 205 (owned file).
  - The list now has **296** entries.
- **Tech Lead list:** A-R204-SAFARI-USERMENU-CLICK (no WebKit run in the cloud).

## 3. Rulings on open A/C items (L10)
- **DEVIATION 1 (round 204)** is **accepted**: `hover:[transform:scale(1.05)]` replaces the ruled `hover:scale-105`. C's `dev1-1280.json` shows that the ruled form snaps under the unlayered global transition rule.
- **The in-grant `isAuthenticated` reset effect** is **accepted**. HF6b now covers it (R108).
- **C-R204-02 / reviewer Suggestion 1 (null blur)** is consistent with R106 as ruled. It stays a Low, because `Header.tsx` is frozen in round 205.
- **C's T-RUN note** (HF8 red as a whole on the start copy) was a B text defect, already covered by L23. In round 205, HF6b is green on the start copy by construction, and its red-proof is the named mutant m11.
- **Reviewer Suggestion 2** (the commit message must not say "auth not touched") goes to root in `current-task.md` §5. It is not an A item.

## 4. B's own probes at planning (L1, L23)
Tools are in `b-round-204/tools/`, outputs in `b-round-204/out/`. The scratch copy was `/tmp/b205s` on :5176 with its own `cacheDir`; it is now **stopped**. Root's :5173 was left as it was.
- **LeadMagnet on HEAD** (`lmprobe*.cjs`, 1280×720):
  - focus stays on the page;
  - Tab walks the header or page behind the overlay;
  - Escape does nothing;
  - there is no dialog role.
  - Files: `lm-head-1280.json`, `lm-head-mid-1280.json`.
- **New pre-existing Medium: B-R204-SCROLLLOCK-POSITION-LOST.**
  - **Observed:** `body.style.top` is `0px` while the popup is open, although `scrollY` was 2037 before. After ✕ the page is at 0 (`lm-head-close-1280.json`).
  - **Cause (source):** `useScrollLock` sets `position: fixed` before it reads `window.scrollY`.
  - **Same on AuthModal:** 1500 → 0 (`authmodal-scroll-5173.json`).
  - **Fixed by reading `scrollY` first:** 2037 and 1500 kept (`lm-sketch2-close-1280.json`, `authmodal-scroll-5176.json`). Lenis does not fight it (the value is stable at +1.8 s).
  - This is the real cause of the "scrollY → 0 / focus off-screen" half of B-R203-LEADMAGNET-AUTO-OPEN-FOCUS, so it belongs in the same round.
- **Sketch of R109:**
  - focus lands on ✕ at open;
  - Tab and Shift+Tab alternate ✕ ↔ FREE DOWNLOAD;
  - Escape closes it, and focus returns to the pre-open link;
  - the keyboard ring is solid 1px (`lm-sketch2-mid-1280.json`).
- **L23 collisions:** `store-focus-ring` + `store-theme-tokens` were run on the sketch: 48/48 green. No other test references `useScrollLock` or LeadMagnet.
- **jsdom feasibility** (`b205-probe.test.tsx`):
  - the scroll-lock row (a `scrollY` getter clamped while the body is fixed) and the dialog-focus row are both red on HEAD and green on the sketch.
- **HF6b** (`hf6b-sketch.test.tsx`):
  - green on the round-204 tree, and red with the effect removed.
  - The first attempt failed on the good tree because `rerender(sameElement)` bails out. Lesson L27 records this.
- **Cloud constraint:** `/api/subscribe` returns 500 without `BREVO_API_KEY`. C reaches the success step with a browser-side `page.route` fixture. That is not a backend dependency, so the row is not BLOCKED.

## 5. Decision: round 205 = gate-204 fix-up + two Medium bugs of one class (bug gate)
- **Items:** R108 (GATE204-B1), R109 (B-R203-LEADMAGNET-AUTO-OPEN-FOCUS), R110 (B-R204-SCROLLLOCK-POSITION-LOST). See `current-task.md` §1. All three concern focus or position lost around an overlay. The fix-up is test + doc only.
- **Why bundle the fix-up:** a separate round for one test row would cost a full A+C cycle, while rounds 204+205 publish together anyway. C reports HF6B-205 as its own row.
- **Grants:** `LeadMagnetPopup.tsx`, `useScrollLock.ts`, `store-hidden-focusables.test.tsx`, doc 161. **New files:** `store-lead-magnet-dialog.test.tsx`, doc 162. **Frozen list:** 1035, with `Header.tsx` and `StudioShowcase.tsx` at their round-204 hashes (= `a-round-204/end-sha256.txt`).
- **Smallest honest choices** (vetoable; recorded in `backlog.json` → `leadmagnet_dialog_rulings_d29z170`):
  - **Initial focus on ✕**, not FREE DOWNLOAD: the APG default (first control), and it avoids an accidental opt-in.
  - **Escape = the existing `close()`:** no new snooze state.
  - **No `inert`, portal or `ui/Modal` reuse:** keep-list markup and frozen `root.tsx`.
  - **`role="alert"` on the error text:** one attribute.
- **Ableton:** does not apply (არ ეხება).
- **Next, fixed in advance:** SYS-1, SYS-2, SYS-3 (+M1/I1), then STORE-2b; the rest of the queue is unchanged. The regression round comes first if B plans on or after 2026-10-30.
- **Still open, not deferred by B:** `shared-modal-no-focus-management` (`ui/Modal` / AuthModal focus) and the palette half of C-R202-06 (deferred Low, as before).

## 6. Architecture (backlog signals, not tasks)
- **`architecture_signals` +1:** the round-204 Signal 4. `Header.tsx` now owns the user-menu lifecycle, and `UserDropdown.tsx` is dead. Both reviewers said keep. A candidate `HeaderUserMenu` extraction was recorded.
- It is appended as **question 5** to the pending non-blocking checkpoint request `b-round-203-checkpoint-request.md` (still with root; nothing new is requested). Round 205 does not wait for it.

## 7. Scope check (unchanged constraints)
- Protected auth files are untouched by any grant.
- `/studio-lab` stays the anonymous demo and never mounts the popup (G205-3).
- Purchase protection is re-checked (G205-3).
- Nothing in the scope was shrunk or deferred without authorisation:
  - SRW-21 stays `deferred_user`;
  - PHASE2-VIDEO-SCORING still awaits Saba's go-ahead;
  - the out-of-scope list is unchanged (professional plugins/effects/pitch/multi-video-layer; grid tempo ≠ audio stretch).
- **Keep-list:** the LeadMagnet gains semantics and focus only. No string, class or step is removed or reworded.

## 8. Commit readiness
- **Round 204** is C-PASSed but gate-blocked. Its 4 paths stay in the tree.
- **Not ready to commit** until round 205 C PASS. Then root publishes rounds 204+205 together: 4 + 6 paths, with 2 shared files (the round-204 test and doc 161).

## 9. Advisor
- **Call 1 (after orientation)** produced these changes:
  - the gate fix-up became a formal grant with its own row and mutant (HF6b over deleting l.111);
  - the `c_pass_gate_blocked` bookkeeping;
  - the STF2/ST5/ST7 constraints written into the task;
  - the scroll-restore ordering, and Escape reusing `close()`;
  - the `/api/subscribe` 500 handling;
  - the deterministic trigger and the exit-intent row;
  - the archive and backups before writing;
  - the scratch-probe scope.
  - **B's own probe then found B-R204-SCROLLLOCK-POSITION-LOST**, which the advisor had not anticipated, and it was added as R110.
- **Call 2 (after writing):** see the note appended below.

### Advisor call 2 (after writing): what changed
- **L26 applied to this round.** AN-REVIEW-205 now fails if doc 161 or doc 162 cites a test id that does not exist, or if a doc's mutant table differs from A's report; A's step 8 has the same grep. This is the exact class that blocked gate 204.
- **R110 is shared infrastructure.** B grepped the `ui/Modal` consumers: `ArrangementExportDialog` (`/studio-lab`, reachable in the cloud) became SCROLL-LOCK-205 (d). `studio/ExportDialog` (`/studio/:id`) and the `cart.tsx` `ConfirmDialog` are backend-only; they are named in §4 as evidence, not rows.
- **LM6 split.** jsdom only checks Shift+Tab from the dialog element (a handler case). The forward Tab from the dialog element is the browser's default and is proven only by C's LM-TAB-205. A must not add a handler for it.
- **Doc 161 status** uses the TEMPLATE vocabulary (`In Progress` plus a parenthetical).
- **Draft:** the pre-edit task is kept as `b-round-204/current-task-r205-draft1.md`.
- **Decision unchanged:** CONTINUE.
