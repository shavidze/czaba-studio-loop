# B — Round 110 result and Round 111 plan (D-29z76)

Author: B · Date: 2026-10-23 (~13:55–14:35 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 111). Archive: `tasks/round-110.md` (exact copy of the round-110 task, made before overwriting).

## 1. Inputs read
- **Context:** `context/active-summary.md`.
- **Round 110:** `tasks/round-110.md` (the round-110 task), `a-round-110.md`, `c-round-110.md`, `c-round-110.json`.
- **Gate 110:** `gates/gate-round-110.json`: **published**, commit `832fee24858746c4411b1299440406c06d8baefa`, both remotes on the same hash. Also `gates/round-110/review.md` (9/10, COMMIT: OK) and the end of `verify.log` (build OK).
- **Lookups:** `backlog.json` by ID only; `regression-last.json`.
- **Source, read only:** `StudioWorkspace.tsx` l.540–650, l.805–818 and l.1678–1981; `ArrangementLibrary.tsx` l.150–240 and l.395–480; `ArrangementVideoDock.tsx` l.748–790.
- **Baseline for round 111:** HEAD `832fee2` (the gate commit), with a clean `git status`.

## 2. Backlog changes (only from independent evidence)
| ID | Before | After | Evidence |
|---|---|---|---|
| B-R108-LIB-FOCUS-LOSS (Medium) | dispatched r110 | **done / მზადაა** | C r110 PASS, `browserVerified: true`. LF-COLLAPSE/EXPAND/CLEAR 1280+1440, LF-MOUSE, LF-HOLD, LF-VIDEO-NEUTRAL, FV-710 and REG-LIB all PASS. Published `832fee2`. |
| GATE109-F6-DOC094-STATUS | dispatched r110 | **done** | C DOC-094-L4 PASS |
| A-R108-SWEEP-HITS (video part) | მოწმდება | **video part done** | C LF-SWEEP-NEG 1280+1440. The pan-reset part stays in `deferred_low_polish`. |
| **C-R110-01 (Medium, new)** | — | **dispatched r111** | `c-round-110/out/lf-video.json`, `reg.json` and `shots/s5-*.png`. A reproduced it independently (`a-round-110/probe/s5-probe-result.json`). |
| A-R110-S3-STALE-ARM (Low) | — | `deferred_low_polish` | Not reachable with the current parent (A and C agree). |
| GATE110-S1-NONCHROMIUM-MOUSE-CLICK (Low) | — | `deferred_low_polish` | Gate review #1. WebKit and Firefox are not on the cloud runner. |
| GATE110-S3-TOGGLE-ARIA-EXPANDED (Low) | — | `deferred_low_polish` | Gate review #3. It needs a separate a11y row, so it is not bundled into round 111. |
| GATE110-S4-DOC095-STATUS (Low) | — | dispatched r111 (one line) | Gate review #4 |
| GATE110-INFO | — | info | Gate review #2 (the × guard is redundant) and #5 (the `MouseEvent` import shadows the global). |
| ARCH-R110-FOCUS-HANDOFF-HOOK | — | `architecture_signals` + addendum (v) | Both reviewers say keep inline. Not scheduled. |
| HR-TOKEN-401-PARAMS | — | `harness_rules` | C's observation: without parameters the route returns 400, because validation runs before auth. |
| ABLETON-EXPERT-REVIEW | **missing** (0 occurrences) | queued after T12; added to VISUAL-A's prerequisites | User decision 2026-10-23. It was overdue from earlier planning. |

- **Counts:** `deferred_low_polish` went from 141 to 144. `backlog.json` is now version 109. The pre-edit copy is `b-round-110/backlog-before-b110.json`, and `feature-status.md` was also backed up.
- **Not changed:**
  - SRW item statuses;
  - the T12 gate (still not open);
  - `regression-last.json`;
  - SRW-21 (`deferred_user`, as recorded before).

## 3. Why round 111 is C-R110-01
- **The bug gate (user, 2026-10-23):** open Mediums come before T12. C-R110-01 is the newest open Medium, and A can fix it and C can verify it on the cloud runner.
- **The regression round:** `regression-last.json` is 2026-10-21 and today is 2026-10-23, so it is not due. The next B planning on or after **2026-10-24** is the regression round, whatever is open.
- **The other open Mediums** (C-R27-01, C-R6-02, C-R8-01, A-R38-REVIEW-TOUCH) are measurement or device questions. They stay in the C-only cloud measurement round after the regression round, as D-29z74 and D-29z75 planned.
- **Nothing external blocks the round.**

## 4. Decision D-29z76 (summary; the full text is in `plan.md` and `current-task.md`)
- **Rule:** the workspace never takes focus from outside the library. It only rescues focus that was inside the library when `returnFloatingVideo` re-collapsed it, and moves it to ▶.
  - This amends D-29z75's "video-driven collapse never moves focus". LF6 and LF-VIDEO-NEUTRAL stay valid, because in those cases focus is on Play or ⤢.
- **Mechanism:**
  - In `returnFloatingVideo`, only in the `libraryOpenedForVideo` branch, take a snapshot: `libraryAsideRef.contains(activeElement)`.
  - Then one deps-free layout effect runs, on the same pattern as the existing `pendingRowFocusRef` effect. It calls `focus({ preventScroll: true })` only when focus is on body or `null`.
  - It uses refs only.
- **Why the workspace and not a library focus-within flag (B's experiment):**
  - **Start state:** `<aside><button>` with the button focused, in Chromium 143.0.7499.4.
  - **Action:** `button.remove()`.
  - **Result:** `blur` and then `focusout` fire synchronously, with `relatedTarget: null` and `isConnected: true` at dispatch time (`b-round-110/probe/blur-on-remove-result.json`).
  - **Inference:** a flag tracked through blur events would depend on whether React delivers that event for a node it is deleting. The snapshot is taken before the DOM changes, so it is deterministic.
  - **Hypothesis (not tested):** the dock's `floatFocusRef` works today because React does not dispatch the synthetic blur for the deleted node. B does not rely on that.
- **Smallest honest UI contract, and why ▶:**
  - It keeps focus in the region the user was in.
  - It matches D-29z75.
  - One Enter re-opens the library only. It does not re-float the video.
  - ⤢ was rejected as a bigger action.
- **Scope guard:**
  - one product file, narrow (four named parts);
  - `aria-expanded` and the Safari mouse case are not bundled;
  - the Enter-on-BODY contract stays the user's question (B-R107-ENTER-ON-BODY).

## 5. Ownership and baseline
- **Owned:**
  - `StudioWorkspace.tsx`, narrow (a helper, a ref, the arm, one layout effect);
  - the new `library-video-return-focus.test.tsx`;
  - the new doc 096;
  - doc 095, l.4 only.
- **Expected end state:** 2 M + 2 ??.
- **Frozen list:** `b-round-110-r111-tree-sha256.txt`, 545 entries. It is the round-110 list (544), minus `StudioWorkspace.tsx`, plus `ArrangementLibrary.tsx` and `library-focus-handoff.test.tsx`. Checked OK at `832fee2`.
- **Snapshot:** `b-round-110-r111-snapshots/StudioWorkspace.tsx` (`e83fa485`).
- **Protected files:** the auth, purchase and token files are unchanged and in the frozen list: `studio.$productId` `fa2cf0bc`, `api.studio-token` `13914809`, `auth.ts` `56f5b76f`, `AuthContext` `bf9ee257`.
- **Public `/studio-lab`:** stays demo-only (G111-3).

## 6. COMPLETE / BLOCKED check
- **Not COMPLETE:**
  - open Mediums remain (C-R110-01 and the measurement set);
  - T12, ABLETON-EXPERT-REVIEW, VISUAL-A and the deferred-Low polish have not started;
  - the final full regression is still to come.
- **Not BLOCKED:** round 111 needs no outside information, approval or credentials.
  - SRW-21 is `deferred_user` by the user's decision.
  - Phase 2 waits for the user's go-ahead only after T12 and VISUAL-A.

## 7. Root / architecture
- **Architecture:** addendum (v) is appended to `b-round-91-checkpoint-request.md`. The question is now narrow: keep four inline focus-rescue sites, or extract one hook with an explicit "the action took effect" predicate. It is non-blocking.
- **Gate 110:** published. Nothing in round 110 waits for a commit.
- **Round 111** touches the shared `StudioWorkspace.tsx`, so root's gate should look closely at the diff, which is limited to the four named parts.

## 8. Advisor
The advisor was available and consulted once, before writing. B followed its advice:
- archive first;
- state the mechanism and the discriminator;
- explicit fallback reasoning;
- C rows, including the 401-with-params fix;
- the missing ABLETON-EXPERT-REVIEW queue step;
- no bundling of `aria-expanded`.

On the mechanism, the advisor leaned library-side unless removal semantics argued otherwise. B's Chromium probe showed that blur fires on removal, so B chose the workspace side. The probe is recorded above as the deciding evidence.

STATUS: DONE. Round 111 is ready for A.
