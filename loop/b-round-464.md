# B round 464 → 465 planning report (2026-11-12)

**Decision: CONTINUE.** Round 465 is RETRO 465 (window 450–464), a code-free round. The task is in `current-task.md`. Decisions: D-29z1636 … D-29z1641. `backlog.json` v456 → v460, through `b-round-464/update-backlog-accept.py` (v457), `update-backlog-retro.py` (v458), `update-backlog-fix.py` (v459) and `update-backlog-fix2.py` (v460), each with a `.done` marker.

## Setup
- **Advisor:** available. I consulted it after orientation and before writing. Its advice, all applied:
  - read `lessons.md`, the gate-464 review and `root-review.md`;
  - redo the new-input check with absolute paths;
  - re-raise ARCH-CHECKPOINT-STYLE-SCAN instead of opening a new task;
  - rule A's Lows L4 and L5 explicitly (`l4-check.txt`);
  - check the attempt cost files, the Saba-found issues in the window and the RETRO 465 deadlines;
  - keep the lessons file from growing;
  - set `next_due` to round 480.
- **Consults (actually run):**
  - `tech-lead`: candidates, causes, lesson trims, systemic task, cost (`b-round-464/consult-tech-lead.md`).
  - `product-designer`: screen and journey (`b-round-464/consult-product-designer.md`).
  - Not consulted: `qa-engineer`, `consequence-tester`, `design-philosopher` and `first-visit-host`. They are not on B's consult list (2026-11-04 §6).
- **Baseline:** gate 464 `published`, commit `6d321c7` (both remotes). HEAD = `6d321c7`, the tree is clean. Frozen manifest: `b-round-464/r465-tree-sha256.txt`, 1,377 entries, rc 0; protected manifest rc 0.
- **Archive:** `tasks/round-464.md` is a byte-identical copy of the round-464 task (`cmp` OK). Before-copies are in `b-round-464/*-before-465.*`. The checkpoint is `b-round-464/checkpoint.md`.
- **New input:** none.
  - `user-review/`: every review file has its `.notified` marker; the decision files are unchanged; AGREE-STEM-LANES is still unanswered (K25 = 2). `questions-retro-450.md` got no answers.
  - The live `agent-workflow.md` has no section newer than Loop v2.
  - `root-review.md` round 464: COMMIT OK.
- **Regression:** `regression-last.json` = 2026-11-10 and `date -u` = 2026-11-12, so it is not due.

## 1. Round 464 accepted (D-29z1636)
- **C evidence:** `c-round-464.json` PASS, C1–C10, `browserVerified`/`realVerified` true, 0 bugs. C8 shows purchase protection intact (`/studio/middle-east` "Sign in required", audioSrc 0) and `/studio-lab` opening anonymously at both viewports.
- **Gate 464:** published `6d321c7`, COMMIT OK, 9/10.
- **Done:** STORE-2b-3d-3. A Store stage, not a scoped FB/SRW Studio feature; its browser rows C7 and C8 ran.
- **Closed:** A-R463-REVIEW-M1 (`confirmedBy` C-R463-01), B-R463-DC2-UNDERSCORE, A-R463-REVIEW-L3.
- **Gate findings:** 1 → `confirmedBy` TL-R464-L1; 2 → `confirmedBy` TL-R464-L2; info 3 → `confirmedBy` SIG-R464-PULSE-KEYFRAMES-SHADOW; info 4 → doc OK, no id. The Architecture note becomes SIG-R464-THIRD-COMMENT-STRIPPER (signal, added to ARCH-CHECKPOINT-STYLE-SCAN).
- **A's code-reviewer Lows:**
  - L1 and L2 → `confirmedBy` TL-R464-L2 (fail red);
  - L3 and L6 → deferred;
  - L4 and L5 (fail-silent / test strength, same direction as the Medium) → deferred and **ruled Low**. B's check `b-round-464/l4-check.txt` shows that the only kept keyframes used solely through the named-utility branch is `pulse`, the correct Tailwind default case. The `\b` hit on `waveform-pulse` is noted in the file.

## 2. Round 465 = RETRO 465 (D-29z1637 … D-29z1640)
- **Report:** `retros/retro-465.md` (Georgian). Data: `b-round-464/data/`, from the retro-450 scripts copied with the window set to 450–464.
- **Main numbers:**
  - $282.31 in total; round median $20.25; B median $14.44; B share 71.7 %.
  - 11 PASS, 4 FAIL (451, 456, 457, 459); `browserVerified` 15/15.
  - 10 C bugs (4 Medium), origin 10/10.
  - **5 A STOPs** (451, 456, 457, 459, 462). The RETRO 450 regex found 3; `tech-lead` caught it and `stops-head.sh` recounts from the report heads.
  - 78 new deferred Lows (union of three methods; the `added` field alone gives 52).
  - L57 15/15; L58 458 INCOMPLETE.
  - Saba-found issues: 2 (SABA-B-14, SABA-B-13), both with "Why we missed it" and a lesson clause; neither kind recurred.
- **Limits stated:** round 459's B cost ($1.51) is a lower bound, because `b-round-458-result.json.attempt1.json` is 0 bytes. Deferred Lows: 78 by the union of three methods (`added` field, first D-ID 1602…1640, id round); the `added` field alone gives 52, and `classify.txt` gives 49.
- **Counters from RETRO 450:** round median, B median, B share and the deferred-Low count all missed. The reuse hypothesis is not confirmed (2b-3b…3d B average $15.08 vs $13.73).
- **Lessons** (60 lines, 58,399 → 57,320 B; ids unchanged; all from `tech-lead`):
  - L52: "A guard must be able to disagree with what it checks" (4×: 451, 456, 457, 463).
  - L56: "Pre-check tree = delivered tree" (2×, 462).
  - L18: the pre-hydration handshake sentence (1×, 459).
  - L60: one evidence id.
  - l.3, L23 and L58 shortened.
  - Diff: `b-round-464/lessons-diff.txt`.
- **Candidates:** all five RETRO465-* are ruled (D-29z1639). New counters: RETRO480-PINNED-SKETCH-MICRO-FIX and RETRO480-COLLECTOR-UNDERCOUNT.
- **Systemic task:** SYS-R465-DEAD-CSS-MATCHER (test-only) closes 5 Lows and 1 signal. It is planned with a trigger and **not dispatched now**: it starts on root's ARCH-CHECKPOINT-STYLE-SCAN answer, the next dead-CSS deletion stage, or round 480, whichever comes first.
  - **Disagreement:** the retro rule says a class of Lows gets one task. `tech-lead` says wait, because the Lows have 0 cases in `app/` today and unifying before the root answer means two ports. B followed `tech-lead`, but with a deadline.
  - ARCH-CHECKPOINT-STYLE-SCAN gets a deadline of round 480.
- **Screen:** `user-review/screen-review-465.md`. Line counts equal 450's; SR-465-1…3 are `awaiting_user` Lows; nothing Medium.
- **Saba:** `user-review/questions-retro-465.md` Q1–Q7, each with a default.
  - Firefox ×5 and the Safari list get new deadlines (RETRO 480).
  - IME, asked for the second time, is reopened as a task blocked on a real IME platform.
  - STUDIO-PERFORMANCE parked items are asked for the third time.
  - Hire-Us e-mail clients; the screen candidates.
  - Q7 is a process proposal (micro-fix allowance) that the loop does not apply.
- **Root:** ROOT-REQ-PLAYWRIGHT-FIREFOX re-raised (the runner has only `chromium-1200`, `chromium_headless_shell-1200` and `ffmpeg-1011`). ARCH-CHECKPOINT-STYLE-SCAN re-raised with a deadline. GATE462-M1-EMAIL-SERVER-POLICY is still open and non-blocking.
- **Architecture checkpoint:** no new request. The signals are attached to the existing one.

## 2b. Advisor closing check (D-29z1641)
The advisor found four problems before hand-off. All are fixed:
- the deferred-Low count was an undercount (52 → 78);
- the four FAIL origins are now cited from `data/manifest-fields.txt`;
- the RETRO 450 counter table now has the fix-up-chain row (MISSED). The round-463 Medium, published by gate 463 before B ruled, is stated as PARTLY;
- the `l4-check` greps are saved as `l4-check.sh`, so C can re-run them.

Also: the §3/§5 avoiding rules are labelled `tech-lead`'s opinion, the walker cluster is ruled, and the L58 heading is fixed (57,320 B).

## 3. Ready for commit
Round 464 is published (`6d321c7`). Round 465 changes no store source, so there is nothing to publish from code. The loop-state commit records the RETRO.

## 4. Not COMPLETE, not BLOCKED
- **Still open:**
  - STORE-2b-3c-2b, 2b-4 and STORE-2c…5;
  - the LEGACY-DEAD remainder;
  - ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STEM-LANES (`awaiting_user`), T12-ADVANCED and phase 2;
  - SYS-R465-DEAD-CSS-MATCHER;
  - the deferred Lows and the Tech Lead manual rows.
- **Not BLOCKED:** no external input is needed for the next round.
