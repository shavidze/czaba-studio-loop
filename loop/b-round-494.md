# B round 494 → 495 planning (2026-11-13, started 18:17Z)

## Round 494 acceptance (D-29z1764, D-29z1765)
- **C round 494: PASS.** 0 bugs, `browserVerified`/`realVerified` true (`c-round-494.json`). The browser rows ran on a production build at 1440, 1280 and 375:
  - C5 PW-CHECK: 18 rows × 3 viewports;
  - C5b backdrop: a 40 px strip;
  - C7 visual;
  - C8 auth guard and Studio smoke;
  - C9 doc truth.
- **Gate 494:** published `3bcf8cb` on both remotes. This is the next baseline.
- **Done (client path):** B-R488-PASSWORD-MODAL-DIALOG, B-R492-PASSWORD-FIELDS-UNNAMED, B-R492-PASSWORD-ERROR-NOT-ANNOUNCED.
- **Closed:** C-R492-01, C-R493-01, A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW, A-R491-REVIEW-PWMODAL-WORDING, A-R493-REVIEW-F1, -F3, -F4 and -F7. Each was checked against C's C5/C5b/C9 rows.
- **Still open:**
  - A-R493-REVIEW-F2: its doc half is closed; the trigger's `type="button"` still has no test.
  - OWN-BACKEND: BLOCKED (backend unavailable in cloud).
  - B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED: High, with root.
- **Gate 494 review findings** (all Low/info):
  - 1 → `confirmedBy` TL-R492-L4-CTRLK-OVER-DIALOG;
  - 3 → `confirmedBy` A-R493-REVIEW-F2;
  - 4 → GATE494-L4-TEST-BLANK-LINES (deferred).
  - The Architecture note → `confirmedBy` on SIG-R487 and on ARCH-CHECKPOINT-ACCOUNT-PROFILE.
- **A's ledger gaps R2, R3 and R5** → `b-round-494/doc-ledger-addendum.md`.
  - l.90 cites `auth.ts` l.379–391 at `3bcf8cb`.
  - l.64's "before" half is labelled as a source review, not C-verified.

## Round 495 = RETRO 495 (D-29z1766…D-29z1771)
- **Window 480–494.** Task 494 §5 said 481–494; B kept the 15-round window and recorded the difference.
- **Outputs:** `retros/retro-495.md`, `user-review/screen-review-495.md` (no new SR), `user-review/questions-retro-495.md` (Q1–Q6), `lessons.md` (60 lines, 57,164 B, longest line 4,771 B), backlog v486, `feature-status.md`.
- **Numbers:** 15 rounds, $247.20 (B 70.9 %). FAIL 4 (487, 489, 492, 493), and each of the four was a STOP on a B-spec defect. l57 11/15; l58 15/15. Deferred Lows: 56 new, 6 closed.
  - Of RETRO 480's 7 counters, 1 was met.
- **New lesson clauses:**
  - L26: a doc-sentence ledger, per input origin, cross-checked against open findings;
  - L47: a focus write after an async settle;
  - L52: a reviewer-Medium fix gets mutants in both directions;
  - L57: B enforces the l57-check row.
- **Systemic task:** SYS-R495-SHARED-DIALOG closes 8 ids. It is blocked on root (`Modal.tsx` grant, ROOT-REQ-SHARED-DIALOG-GRANT).
- **L46:** SABA-DEVICE-CHECKS is opened (TLM-R468, SABA-B-15).
- **Not done:** REGRESSION is not due (2026-11-13; next on or after 2026-11-16). `regression-last.json` is unchanged.

## Advisor closing-check corrections (D-29z1771)
- Retro §3 placeholders replaced with the real rules (L47, L26).
- K24 made archive-proof through `tools/find-ids.py` (K24b), because the optimizer archives every `open_findings` status that contains closed/done/resolved.
- Row 3 selectors tagged [K32].
- The relayed citations were opened and confirmed: `b-round-486/sketch-review.md` l.9, the `l50-hits.txt` hits, `a-round-487.md` l.5, `tasks/round-493.md` l.96–102 and `tasks/round-489.md` l.46–49.
- SABA-B-17 is counted as one recurrence of SABA-B-13.
- The four full-screen PNGs the consultant did not open are disclosed in the screen review and in task row 4 (C opens them).
- Two feature-status words corrected.
- B-R471-SKETCH-UNREVIEWED closed.
- Baseline `head_round_495` set.
- §5 `account.tsx` ruling line added.
- The L26 doc-correction vs sketch-sha note added in retro §10.

## Consults
- **Advisor:** used after orientation and as the closing check.
- **`tech-lead`:** the retro analysis, lesson wording and trims, the systemic task, the RETRO 510 counters, and the checkpoint question (`b-round-494/consult-tech-lead.md`).
- **`product-designer`:** the screen and journey review (`b-round-494/consult-product-designer.md`). It opened 6 of the 12 PNGs.
- **`ableton-arrangement-expert`, `performance-optimizer`:** not needed (no Studio behaviour or performance question).
- **`qa-engineer`, `consequence-tester`, `design-philosopher`, `first-visit-host`:** not on B's list; not called.

## Architecture checkpoint
- No new request. Per `tech-lead` §7, it would duplicate ARCH-CHECKPOINT-ACCOUNT-PROFILE, which already waits for root.
- That request now has the gate 494 PasswordDialog proposal as `confirmedBy`, and an L46 deadline at RETRO 510.
- Until root answers, no further `account.tsx` task is planned, except a Critical, High or Medium fix.

## Commit readiness
- Round 494 is already published (`3bcf8cb`).
- Round 495 changes no source, so there is nothing to publish. The loop state commit records the retro.

## Next
496 = DPG-BUTTON-CLEANUP, which includes the L8 rows for B-R492-PASSWORD-SUBMIT-FOCUS-LOST and GATE488-L3. If planning happens on or after 2026-11-16, REGRESSION comes first.
