# B: round 268 → 269 planning (2026-10-30, D-29z576…D-29z579)

**Decision: CONTINUE.** Round 269 = **SABA-B-7**: the clip volume envelope moves onto the lane fader's dB scale (Medium; Saba agreed option A on 2026-10-30). Task: `current-task.md`; grants: `b-round-268-r269-grants.txt`.

## 1. Inputs read
- `context/active-summary.md` (head), `lessons.md` in full, and specific ids grepped in `backlog.json` and `feature-status.md`.
- `tasks/round-268.md`: an exact copy of the round-268 `current-task.md` (`cmp` identical; it did not exist before).
- `a-round-268.md`, `c-round-268.md`, `c-round-268.json`, `b-round-267.md`.
- `gates/gate-round-268.json`: **published**, commit `3058a7c` on both remotes. That commit is this round's baseline (clean tree).
- `regression-last.json`: the next REGRESSION is due on or after 2026-11-02, so it is not due now.
- For SABA-B-7:
  - `user-review/AGREE-SABA-B-7.md`;
  - `reference/ableton-live-measurements-2026-10-30.md`;
  - `reference/youtube/SABA-B-7-transcripts.md`;
  - the round-83 C rows (EN-EXPORT, EN-MULTIPLY, EN-PLAY-EDIT) and their WAV tool.
- **Advisor:** available and consulted before the design. Followed:
  - do the round-268 bookkeeping first;
  - interpolate in fader-depth space so that −∞ works;
  - rule on storage precision in the task;
  - keep the round single, so display and audio change together;
  - define C's export method;
  - add a step-count mutant.

## 2. Round 268 result (D-29z576)
- **C PASS.** `browserVerified` and `realVerified` are true. Every row passed at both viewports, and every mutant was red.
- **Gate 268 published** `3058a7c` (rounds 267–268).
- **GATE264-S2** and **C-R267-01** are closed.
- **L7 sweep:** B-R266-LINUX-ALTGR-PLAIN-LETTERS (a hypothesis) and TLM-R232-ALTGR-WIN (a Tech Lead manual check) share the AltGr cause. They are platform halves, so both stay open.
- **Info notes:** INFO-C268-HEAD-DRIFT and INFO-C268-PROBE-LOAD are recorded.

## 3. Findings from round 268 (D-29z577)
- **C-R268-01 (Low)** and A's reviewer finding A-R268-REVIEW-SPACE-ALTGRAPH are one finding, kept under one id with an alias.
  - Ctrl+Shift+AltGraph+Space without `altKey` still moves the insert marker to the playhead.
  - Only a contract state reaches it; no real platform has been shown to send this chord.
  - The Space arm and keyup are pre-existing code, frozen in round 268.
  - It goes to `deferred_low_polish`, with the chord-classifier as its fix hint.
- **D-29z572's wording is narrowed.** Its rule, "never a command chord anywhere in `handleKeyDown`", claimed more than the code does. It now covers the branches that rounds 267–268 changed.
- **A-R268-REVIEW-AG8-ONE-DIRECTION** (Low: AG8 tests one direction only) goes to `deferred_low_polish`.
- **A's architecture note** (a `classifyChord` helper; keep for now) is appended as `addendum_268` to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS, question 10. It is non-blocking and not scheduled.
- **Checkpoint note:** `handleKeyDown`'s single-owner streak (rounds 265–268) ends here, because round 269 does not touch it. The checkpoint request stays with root.

## 4. SABA-B-7 plan (D-29z578)
**The contract** (task §3):
- **Depth:** depth = dB / −60, using the lane fader's `TRACK_VOLUME_DB_MIN`; the bottom is −∞.
- **Interpolation:** in dB when both gains are > 0, otherwise in depth. Stored gains stay exact at the points.
- **Scheduling:** a pure step helper with ≤ 0.5 dB linear ramps. A 0 dB → −∞ segment takes 120 steps.
- **Display:** a point's `top` and every polyline `y` equal the depth.
- **Drag:** the drag works on depth, and dy = 0 keeps the stored gain.
- **Storage:** 4 decimals kept. Below about −50 dB a stored step is coarser than the readout; this is an accepted limit.
- **Saved projects:** the consequence is D-29z573 (Saba), cited and not re-decided.

**Pre-check:**
- The sketch is `b-round-268/sketch.diff`; `tsc` rc 0 and Biome clean.
- 0 dB → −∞ reads −15.000 / −30.000 / −45.000 dB at 25 / 50 / 75 %.
- **Arrangement test folder:** 15 tests in 3 files pin the old linear values. Each is listed in task §5.1 with old and new values, to be rewritten equal or stronger. The other 164 of 167 files pass.
- **Browser:** HEAD and sketch were probed at both viewports (`b-round-268/probe-envelope-*.json`, 0 page errors). On the sketch, a mid point added on a 0 dB → −∞ line reads −30.0 dB at depth 0.5, and a quarter-body drag reads −15.0 dB.

**Reference and deviations:**
- **Reference:** the Live 12 manual (25.5, 27.2.3), root's Live measurement, and the transcripts.
- **D1:** dB readout instead of Live's %.
- **D2:** −60 dB floor instead of Live's slight compression below −36 dB.
- **D3:** dB interpolation, where Live's line is straight in %.

All three are approved by Saba. The later candidates (Alt-drag curves, Edit Value, point snap) stay out of scope.

**Consults:**
- `product-designer` was not consulted. Saba fixed the behaviour himself, and the round adds no new screen element (D-29z579).
- The round-232 `ableton-arrangement-expert` and `docs-explorer` consults are reused; root's measurement outranks them.

## 5. Lessons (D-29z579)
- L29 gains one clause: K1 is read at dispatch, and a root-only commit that leaves `app/**` unchanged is accepted with a note. Source: INFO-C268-HEAD-DRIFT.
- `lessons.md` stays at 59 lines.
- No new lesson for SABA-B-7. Its "Why we missed it" points to L41, which already exists; C's LESSON row greps it.

## 6. Order (unchanged from D-29z574)
- 269: SABA-B-7.
- 270: GATE266-S1, with GATE266-S4 and B-R266-CLIPS-SPLIT-COPY.
- 271: SABA-B-11c stage 2 (relative snap).
- Then SYS-6.
- REGRESSION goes first on or after 2026-11-02.

## 7. Not COMPLETE, not BLOCKED
- **Not COMPLETE:**
  - SABA-B-7 and GATE266-S1 are open Mediums.
  - Not yet done: SABA-B-11c stage 2, SYS-5/6, STUDIO-PERFORMANCE, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries.
  - 445 deferred Lows remain.
- **Not BLOCKED:** no credentials or approvals are missing.
- **Ready for commit:** nothing new. Root publishes after C PASS on round 269 and the gate.

## 8. Artifacts
- `b-round-268/`:
  - `checkpoint.md`;
  - `sketch.diff`;
  - `b268-sanity.test.ts`;
  - `precheck-arrangement-folder-tail.txt`;
  - `probe-envelope.mjs`, `probe-envelope-head.json` and `probe-envelope-sketch.json` (+ png);
  - `probe-meter.mjs` and `probe-meter-head.json`. These are the baseline for the PLAY-THROUGH row, added after the advisor's done-check: the lane meter reads `-inf` from about 1.3 s after the silence starts. The task's CURVE-EXPORT method was also changed to a median per-sample ratio, with point times read from `data-envelope`.
  - pre-edit copies `backlog.before.json`, `feature-status-before.md`, `lessons-before.md` and `b-next-before.json`.
- Scratch: `/tmp/b268-scratch`, with its own dev server on :5180, stopped after the probe. Nothing under `store/` was modified.
