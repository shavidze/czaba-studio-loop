# B round 490 → 491 planning (2026-11-13)

## For root
- **ARCH-CHECKPOINT-ENTRANCE-LOADING:** sent now (`b-round-490/checkpoint-request-entrance.md`).
- **ARCH-CHECKPOINT-ACCOUNT-PROFILE** (`b-round-488/checkpoint-request-account.md`): no answer through two plannings. The answer is wanted before round 492 (PasswordModal).
- **ROOT-REQ-LOOP-WEBM-EVIDENCE:** still open. Saba's entrance recordings are gitignored.

**Decision:** CONTINUE. **Next task:** round 491, B-R487-PROFILE-EDITOR-NARROW-OVERFLOW (`current-task.md`). Decisions D-29z1752 … D-29z1754. Checkpoint log: `b-round-490/checkpoint.md`.

## Inputs read
- `context/active-summary.md`; `current-task.md` (round 490, archived byte-equal to `tasks/round-490.md` with `cmp`; second copy `b-round-490/current-task-before-491.md`); `a-round-490.md`; `c-round-490.md` and `c-round-490.json`; `gates/gate-round-490.json` (`published`, commit `53ff249`; the `head` field `73f994d` is the pre-publish value) and `gates/round-490/review.md`; `lessons.md` in full; `regression-last.json`; `env-status.json`.
- Backlog ids were looked up with `tools/find-ids.py` and targeted Python reads. I did not read `backlog.json` whole. Before-copies are in `b-round-490/`: backlog, feature-status, lessons and b-next.
- `root-pre-push-review.md` and `publication-checkpoint.json` are from 2026-10-07 (round 3). They hold nothing open for this round.

## Round 490 outcome (independently evidenced)
- **C PASS**: 24 rows passed, `browserVerified` and `realVerified` true, 0 bugs, 2 infos. The gate rows were run by root. **Gate 490 published `53ff249`** with round 489.
- **Done (D-29z1752):** SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED, B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER and A-R489-REVIEW-NONZOOM-CLASSIFY. These ids had been archived by the optimizer, so B re-added them to `open_findings` with a `done` status. `find-ids.py` reads the backlog first.
- **Still open, not blocking:** TLM-R489-SABA-ENTRANCE-FEEL (C's two infos are attached to it) and TLM-R489-TOUCH-SWIPE (gate Low 2 is attached to it). Both have a deadline of RETRO 495.

## Rulings (D-29z1753)
- **A-R490-REVIEW-NOCTRL-NEG-WHEEL.** A handed it over unruled. B rules it **Low**, inside the round-490 contract, with a named closing condition: S1/E8c get a no-ctrl −100 wheel row, and the `ctrlKey || deltaY < 0` mutant must be red in the first round that touches the entrance test or extracts `useEntranceSkip`.
- **R2 and R3** (A-R490-REVIEW-TOUCH-DELTA-LABEL and A-R490-REVIEW-E18-LITERAL): Low, closed by the same round.
- **Gate 490 reviewer Lows 1, 2, 3 and 5:** filed as GATE490-L1, L2, L3 and L5 in `deferred_low_polish`.
- **Gate 490 reviewer Low 4:** recorded as `confirmedBy` on B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER.
- **Architecture notes** (from the gate reviewer, and A's reviewer "contract table"): recorded as `confirmedBy` on SIG-R489-ENTRANCE-ZOOM-RULE-TWICE. This is a signal, not a task.
- **ARCH-CHECKPOINT-ENTRANCE-LOADING: sent to root** (`b-round-490/checkpoint-request-entrance.md`). The feature boundary has passed. The request adds the gate's `useEntranceSkip` proposal.
- **ARCH-CHECKPOINT-ACCOUNT-PROFILE:** B found no root answer. It stays requested and does not block. Round 491 adds no editor state, and an answer is wanted before round 492.

## Round 491 planning
- **Order.** The bug gate fixes Mediums first. No REGRESSION is due: the last was 2026-11-13 and the next is due on or after 2026-11-16. RETRO comes at round 495. That order gives B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, as scheduled in D-29z1751.
- **Re-measured at the baseline `53ff249`** (`b-round-490/probe/narrow-491.mjs`), on the dev server (`head-narrow.json`) and on a production build (`headprod-narrow.json`). At 375, 360 and 320 px, ✓ and ✕ are offscreen: click and tap send 0 PUT and the editor stays open. Desktop works.
  - **Environment finding:** the mock API on :5199 answers `/api/downloads` with 401, and this signs the stub user out. The probes stub it, and the task tells C.
- **Sketch: `min-w-0` on both inputs only.** The patch has sha256 `a3b6e637…` (v2; v1 `9fd04bda…`).
  - On a production build of the delivered tree (docs included), 1440 and 1280 are field-for-field equal to HEAD (`probe/desk-eq.txt`).
  - At 375, 360 and 320 the buttons are on-screen and 32×32. Click and tap each send 1 PUT.
  - The DOM mutant without `min-w-0` is red at 375 and 320.
  - **Rejected:** v0 with `flex-1`, `sm:` and `shrink-0`, because those tokens survived their mutants (`probe/mutants-variant.json`). Also rejected: wrap, and a stacked layout.
- **Pre-checks on the scratch:**
  - typecheck: 0 errors;
  - Biome: 4 pre-existing warnings;
  - covering: 5 files, 82 tests;
  - full suite: 293 files, 4294 tests, rc 0;
  - L23 sweep: 0 class pins. The scanner was proven on a mutant (`b-round-490/k6-scanner-mutant.txt`).
- **Review (L58).** `tech-lead` gave v1 APPROVE with 4 Lows, and B ruled each one in `b-round-490/sketch-review.md`. Two doc Lows were adopted in v2, and the docs-only delta was re-reviewed: APPROVE.
  - "No unit test" is ruled Low in the task, so it is not an A STOP.
  - The durable guard is filed as the Low B-R491-NARROW-EDITOR-E2E-GUARD.
  - The new manual row is TLM-R491-PHONE-NAME-EDITOR.
- **Claims.** `b-round-490/claims-491.sh` has a planning output and a sketch output, both with empty stderr. K14 is `L58 OK`.
- **Reference-first.** This is a Store bug fix, so there is no Ableton claim. The task cites WCAG 1.4.10 and 2.5.8. `product-designer` was not consulted: there is no new element and no desktop change.

## Advisor
- Available, and consulted after orientation.
- **Advice applied:**
  - the baseline is the gate commit `53ff249`;
  - rule NOCTRL by id;
  - send the entrance checkpoint now;
  - re-measure at the baseline;
  - keep desktop equal to HEAD;
  - probe at 320;
  - prove click and tap;
  - pre-rule "no unit test";
  - check the smoke config before promising a spec;
  - run the full suite on the scratch;
  - get the tech-lead review;
  - write b-next early.
- Checked: SABA-Q-CTRLK-CONTENT and SABA-Q-GIFTCARDS-HEADER already exist as `awaiting_user` (L42 is satisfied).
- A final advisor call is made before hand-off; see the end of this file.

## Remaining scope (not COMPLETE)
- Open Mediums: B-R488-PASSWORD-MODAL-DIALOG (round 492), then the DPG-FIX P1/P2 items, starting with DPG-BUTTON-CLEANUP.
- Queue after that: STORE-REDESIGN, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, and the deferred Lows polish pass.
- Nothing needs external input to proceed, so the decision is not BLOCKED. Full list: `b-next.json`.

## Ready for commit (root)
- Rounds 489–490 are already published.
- Round 491 is not yet implemented, so there is nothing new to commit.

## Final advisor call (before hand-off)
- **Applied:**
  - The task pre-rules every `sketch-review.md` Low as not-a-STOP and names the likely re-raises.
  - K15 now cites the HEAD shots, both claims outputs, the before-copy, the C6 checker and its outputs, the variant mutants, the K6 scanner mutant and the env evidence.
  - New C6 checker `b-round-490/probe/c6-check.py`. Sketch: `C6 PASS`. HEAD: rc 1, with 23 RED. The keyboard rows pass at HEAD, which the task notes.
  - B looked at the ring and long-name shots at 375 and 320: not clipped.
  - `b-next.json` `remaining` now uses bare ids.
  - The floor sentence (320 asserted) and the `serve-prod.sh` redirect note are in the task.
  - The `/api/downloads` 401 sign-out is saved as `b-round-490/probe/env-downloads-401.txt` and filed as harness fact HF-MOCKAPI-DOWNLOADS-401-SIGNOUT, with a note for round 492 and the next REGRESSION.
  - A "For root" list was added at the top of this file.
- **Not applied:** the doc 317 TODO wording ("next round"). It would need a third review for a wording risk only. Round 492 is already fixed in the order, and a REGRESSION before it would make that line stale by one round. Accepted.
