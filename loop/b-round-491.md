# B round 491 → 492 planning (2026-11-13)

## For root
- **B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High, new) → ROOT-REQ-PASSWORD-CHANGE-ENDPOINT.**
  - Account "Change password" can never succeed. `app/lib/auth.ts` `updatePassword` (a protected file) checks the current password through login, then always throws "Password change is not yet implemented…".
  - The fix needs a .NET endpoint plus the `auth.ts` call, or a Saba decision to send users to forgot-password until then.
  - It does not block the loop. It does block the final COMPLETE.
- **ARCH-CHECKPOINT-ACCOUNT-PROFILE:** re-sent (`b-round-491/checkpoint-request-account-492.md`). There has been no answer since round 488, and it is non-blocking. Round 492 adds dialog state to `PasswordModal`.
- **Still open from earlier:** ARCH-CHECKPOINT-ENTRANCE-LOADING (`b-round-490/checkpoint-request-entrance.md`) and ROOT-REQ-LOOP-WEBM-EVIDENCE.

**Decision:** CONTINUE. **Next task:** round 492, B-R488-PASSWORD-MODAL-DIALOG (`current-task.md`). Decisions D-29z1755 … D-29z1757. Checkpoint log: `b-round-491/checkpoint.md`.

## Inputs read
- `context/active-summary.md`.
- `current-task.md`: the round-491 task, archived byte-equal (`cmp`) to `tasks/round-491.md`. Second copy: `b-round-491/current-task-before-492.md`.
- Round-491 reports: `a-round-491.md`, `c-round-491.md`, `c-round-491.json`.
- `gates/gate-round-491.json`: `published`, commit `e4e1d1c`, which is the baseline. Also `gates/round-491/review.md`.
- `b-round-490.md` and `b-next.json`, the previous plan.
- `lessons.md` in full, `regression-last.json`, `env-status.json`, `root-review.md`.
- Backlog ids were looked up with `tools/find-ids.py` and targeted Python reads. `backlog.json` was not read whole.
- Before-copies are in `b-round-491/`: backlog, feature-status, lessons, b-next.
- Data only, no instructions taken from: the APG Dialog (Modal) page (fetched) and the framer-motion source (read by tech-lead).

## Round 491 outcome (independently evidenced)
- **C PASS**: C1–C11 passed, `browserVerified` and `realVerified` true, 0 bugs. OWN-BACKEND is BLOCKED (cloud).
- **Gate 491** published `e4e1d1c` on both remotes.
- **Done (D-29z1755):** B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, client path. TLM-R491-PHONE-NAME-EDITOR stays open (RETRO 495).
- **Rulings:**
  - A-R491-REVIEW-PWMODAL-WORDING is closed by this sketch, pending C.
  - Three A info notes go to `deferred_low_polish`.
  - Gate reviewer point 1 is ruled not a bug from C's own ring evidence (GATE491-I1, closed).
  - Gate reviewer points 2 and 3 are recorded as `confirmedBy` on existing ids (L7).
  - Architecture notes ("keep") are recorded as `confirmedBy` on SIG-R487.

## Round 492 planning
- **Order.** The bug gate takes open Mediums first, so the next item is B-R488-PASSWORD-MODAL-DIALOG (D-29z1754). No REGRESSION is due before 2026-11-16, and RETRO is at round 495.
- **Re-measured at the baseline** (`b-round-491/probe/pw-492.mjs` on a production build of `e4e1d1c`, at 1440×900, 1280×720 and 375×812):
  - 0 dialogs;
  - focus is not moved into the window;
  - Esc does not close it;
  - Cancel drops focus to `<body>`;
  - the fields and eye buttons have no name;
  - the error is silent.
  - `pw-check.py`: HEAD has 48 RED.
- **Scope.** One owner (`account.tsx` `PasswordModal`), three Mediums: B-R488, B-R492-PASSWORD-FIELDS-UNNAMED and B-R492-PASSWORD-ERROR-NOT-ANNOUNCED. It also closes A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW.
- **Sketch v3 `f530e0f3…`.** The browser and the reviewer each found problems in the earlier versions:
  - **v1, found by B's browser run:** a Tab during the exit fade entered the fading dialog. Fix: `inert` while exiting. The browser mutant without it is RED on P11–P13.
  - **v1, found by tech-lead (Medium):** reopening during the fade gave a dead dialog. Fix in v2: an `[isPresent]` effect plus PD14 and browser row P18.
  - **v2, found by tech-lead (Low):** a control that became disabled could leak focus. Fixed with `tabbable.some`; PD15 covers it.
  - **Advisor:** Esc during an IME composition is ignored, as in LeadMagnet; PD13 covers it.
  - **Advisor:** an idempotent `closePasswordModal`, so a late settle never steals focus (PD7, MA).
- **Pre-checks on the scratch copy:**
  - typecheck rc 0;
  - Biome 0 warnings (HEAD has 4);
  - covering 6 files / 97 tests;
  - full suite 294 / 4309, rc 0;
  - 20 jsdom mutants RED;
  - sketch browser run: 54/54 rows PASS;
  - the open dialog is 0 px different from HEAD.
- **Review (L58):** in `b-round-491/sketch-review.md`. Each finding is ruled, and the file holds the ordering matrix.
- **Claims:** `b-round-491/claims-492.sh`, with a planning output and a sketch output. Both have empty stderr, and K14 reads `L58 OK`.
- **Reference-first:** the APG Dialog (Modal) pattern, fetched and mapped point by point to rows. Deviations are recorded: no ring after a mouse open (SABA-B-4 rule), no scroll lock, and the shared `Modal` is not used. `product-designer` was not consulted, because there is no new element and no visual change at rest.
- **Lows recorded in `deferred_low_polish` (D-29z1757):**
  - TL-R492-L2: a late success from an earlier open (unreachable today);
  - TL-R492-L4: Ctrl+K over the dialog;
  - TL-R492-V2-L1: reopen keeps the typed values;
  - B-R492-PASSWORD-BACKDROP-SHORT: 860/900 px;
  - B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW;
  - B-R492-PASSWORD-SUBMIT-FOCUS-LOST.
- **Also recorded:**
  - new manual row TLM-R492-SR-PASSWORD-DIALOG;
  - harness facts HF-FOCUS-SOURCE-POINTER-NO-RING and HF-EXIT-ANIMATION-TABBABLE;
  - retro candidate RC-R492-EXIT-ANIMATION-DIALOG for RETRO 495;
  - `lessons.md` is not changed (60 lines).

## Advisor
- Available, and consulted after orientation.
- **Advice applied:**
  - the baseline is the gate commit;
  - the ref guard stays killable (PN10f/g blur, MK);
  - focus return is idempotent;
  - every close goes through one function;
  - ring rows are split by modality;
  - jsdom traps are avoided;
  - no refactor, and no shared `Modal`;
  - no casts;
  - the APG page was fetched;
  - signed-in probes stub downloads and login;
  - round 491 was closed from C's evidence.
- Final advisor call done (attempt 2): it verified the patch applies on `e4e1d1c`, the sha matches, the ids are present, nothing depends on `/tmp`, and the gate and backend rows are correct. No changes were needed.

## Remaining scope (not COMPLETE)
- Open Mediums: round 492's three, then the DPG-FIX P1/P2 items, starting with DPG-BUTTON-CLEANUP.
- B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) is with root.
- Queue: STORE-REDESIGN, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, and the deferred Lows polish pass.
- Not BLOCKED, because the next round needs no external input. Full list: `b-next.json`.

## Ready for commit (root)
- Round 491 is already published (`e4e1d1c`).
- Round 492 is not yet implemented, so there is nothing new to commit. Planning artifacts only.
