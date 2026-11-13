# B round 488 → 489 planning (2026-11-13)

**Decision: CONTINUE.** Round 489 = **SABA-B-17-ENTRANCE-3-4S** (Saba, Medium), together with the two Mediums its longer floor would amplify (B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED, B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER). Task: `current-task.md`. Archive of round 488: `tasks/round-488.md` (byte-equal, `cmp`; B copy `b-round-488/current-task-before-489.md`). Baseline: gate 488 `published`, HEAD **`73f994d`**, clean tree.

- **Advisor:** available and consulted (before the sketch, and at the end). It caught the slow-JS first visit and a probe sized for 1.9 s; both changed the design (§3).
- **Consults:** `product-designer` ×2 (`b-round-488/pd-consult.md`); `tech-lead` ×3 (v1 APPROVE WITH CHANGES → v2 APPROVE → v3 doc-only delta; `b-round-488/sketch-review.md`).

## 1. Input evidence (round 488)
- **C round 488 (`c-round-488.json`):** PASS, `browserVerified` true, `realVerified` true, 0 bugs. OWN-BACKEND is BLOCKED (backend unavailable in cloud). Safari/Firefox-mac rows are Chromium emulation only (SAFARI-CHECKS).
- **Gate 488:** `published`, commit `73f994d`, on both remotes. The gate reviewer found 3 Lows and 4 Infos, none blocking (`gates/round-488/review.md`).
- **A round 488:** the sketch was applied byte-equal; typecheck, lint and covering 82/82 pass. The code-reviewer found no Medium+; its Lows are listed in §2.
- **INFO-C488-L57-ABSENT:** `tools/l57-check.py c-round-488.json` gives rc 1 (5 fields absent). This is C bookkeeping, not a row FAIL; the round-489 task names all the fields (C18).
- `root-pre-push-review.md` / `publication-checkpoint.json`: no new remaining findings for this window.

## 2. Backlog changes (only from evidenced results)
- **D-29z1741:**
  - C-R487-01 is closed.
  - B-R486-PROFILE-NAME-KEYBOARD is **done for the client path** (archive entry updated); OWN-BACKEND stays open evidence.
  - The round-487 Lows L1/L2 are confirmed closed by the C PASS.
- **D-29z1742:** these go to `deferred_low_polish`:
  - A-R488 reviewer Lows L1 (exit-animation window), L2 (`onClick` void), L5 (redundant asserts);
  - doc Low 2 (PN2/PN3 cite) and the stale doc-315 TODO;
  - gate-488 Low 1 (`active:transform-none!`) and Low 3 (Save/Cancel focus and disabled styling; round 490 owns those buttons).
  - Gate Low 2 is recorded as `confirmedBy` on SIG-R487-REPEAT-SAFE-HOME, and A-R488 L3 as `confirmedBy` on A-R488-SKETCH-L2-CLOSED-DIALOG-TEST (L7).
- **D-29z1743:**
  - SABA-B-17 is dispatched as round 489.
  - New Mediums B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED and B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER are dispatched inside round 489.
  - New Low B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER (deferred).
  - New Saba questions SABA-Q-ENTRANCE-SCROLL-SKIP and SABA-Q-ENTRANCE-SLOW-WAIT (`awaiting_user`, defaults applied); SABA-Q-ENTRANCE-WORDMARK re-asked with the new evidence (`user-review/questions-saba-b-13.md`).
  - TLM-R489-SABA-ENTRANCE-FEEL and TLM-R489-TOUCH-SWIPE, deadline RETRO 495.
- **D-29z1744, architecture:** `account.tsx` is owned by rounds 487, 488, 490 and 491. A bounded frontend-architect checkpoint, **ARCH-CHECKPOINT-ACCOUNT-PROFILE**, is requested from root (`b-round-488/checkpoint-request-account.md`), with an answer wanted before round-491 planning. It does not block. Signals get `confirmedBy` entries and are not scheduled as tasks.
- **D-29z1745, order:** 489 SABA-B-17, 490 B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, 491 B-R488-PASSWORD-MODAL-DIALOG, then DPG-BUTTON-CLEANUP and the rest of DPG P1. REGRESSION comes first from 2026-11-16; RETRO at round 495.
- **D-29z1746:** a lesson (L18 "felt quantity" clause, merged; `lessons.md` stays at 60 lines; before: `b-round-488/lessons-before-489.md`) plus the tech-lead review rulings.
- `feature-status.md` updated: header, the round-488/489 paragraph, and the rows for SABA-B-17, the two B-R489 Mediums, B-R486 (მზადაა, client path) and C-R487-01 (მზადაა).
- Nothing with `browserVerified=false` was promoted.

## 3. Round 489 design (sketch v3 `4a15bff3…`)
- **HEAD measured on production builds** (`b-round-488/probe/head/`, `probe/head-matrix/table.txt`):
  - the cover lifts about 1.6 s after its first frame; logo 448–708 ms, tagline 249–467 ms;
  - JS delayed 1.5 s and Fast 3G: `expired`, no logo;
  - 4G + 4× CPU: tagline 27 ms;
  - a wheel under the cover scrolls the page 600 px unseen.
- **Rule:**
  - floor 3500 ms from the first cover frame; cap 5000 = takeover window 2000 + post-takeover floor 2500 + overlay exit 500;
  - pacing: logo +400 ms (700 ms fade), line and tagline +1100 ms (500 ms);
  - the no-JS CSS fade stays 250 ms;
  - wheel and touchmove skip the entrance before and after hydration, and their first event does not scroll (window capture, `preventDefault` + `stopPropagation`). Zoom gestures (Ctrl+wheel, pinch) skip but are never blocked.
- **Sketch measured** (`probe/sketch/table.txt`):
  - fresh 1×: 3451–3455 ms from the first covered sample (3491–3503 from `data-start`); logo 1717–1737, tagline 1062–1069;
  - 4×: 3867–3945 ms;
  - 4G and JS +1.5 s: play (`live`, ≤ 4680 ms from `data-start`);
  - wheel: `scrollY` 0, both after takeover and before hydration;
  - reload and reduced motion: no black frame;
  - skips before hydration: ≤ 275 ms;
  - Fast 3G still expires after about 2.3 s of black. This is a Saba question, not a bug of this round.
- **Tests:** L3, E1 and E6 ported (every HEAD pin mapped in the task's ruling lines), plus new rows S1, S2, S3, E6b, E8c, E8d, E8e. 22 mutants, all red. Covering: 4 files, 92 tests. The full suite on the sketch is in `b-round-488/precheck-full-489.log`. Production CSS is byte-equal across HEAD, the sketch and the sketch with doc 316 (`probe/css-compare.txt`).
- **Why we missed it:** SABA-B-13 took Saba's example "1.2–1.5 s" as the target, and no slow-network first-visit row existed. Lesson merged into L18. C13 records before/after videos for Saba.

## 3b. Advisor follow-ups (final review), all applied
- §2: A never edits a sketch line; a false doc-316 line is a STOP, not a grant.
- C16 is limited to the browser-measurement bullet. `blackFrames` is removed (vacuous: the cover is `--color-background`). C5 asserts `firstCovered ≤ fp`.
- C13: B ran `record.mjs` (`probe/rec/`; stills checked: after@2 s = wordmark, before@2 s = page). C records into `c-round-489/rec/` and then **copies** the videos to `user-review/img/`. B already copied its own pair there for Saba.
- The late-JS pin is restored with clearly-outside and clearly-inside delays:
  - C7b `delay3000`: `expired`, logo 0, cover gone ~2.3 s;
  - C7 `delay800`: plays;
  - `delayjs` (1.5 s) and `net3g` are `record` only (each about 300 ms from the 2 s edge).
- product-designer's rows are mapped one by one (task §3 table). New C11b (Esc/Tab/click at 1.5 s, during the logo) and C5b (no second cover after client navigation back to `/`).
- C14 now asserts `hydrationErrors` 0 from the production matrix (the field was added to the probe).
- Bounds were re-checked on the final all-modes matrices (`probe/sketch-all-modes/table.txt`, `probe/head-matrix-all-modes/table.txt`). `remFc` bounds were loosened to 3300, because clientnav measured 3418; the floor is asserted on `remDs` ≥ 3450.
- K21 prints found/NOT-FOUND. K17 now covers every cited file (32/32).
- **INFO-B489-OPTIMIZER-SUBSTRING** (for root): `cloud/optimize-backlog.py` archives any finding whose status contains "closed", "done" or "resolved" as a substring. B-R486-PROFILE-NAME-KEYBOARD was archived while its status read "not done". B checked every status written in this planning: no hits. A word-boundary or status-prefix rule would avoid this. Recorded here only; root owns `cloud/`.

## 4. Scope status (whole request)
**Not COMPLETE.** Many scoped items remain open, among them:
- SABA-B-17 (this round);
- the account Mediums (490, 491);
- DPG-FIX P1/P2;
- STORE-REDESIGN 2c+, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED;
- the phase-2 queue entries;
- every deferred Low;
- the Safari, Firefox and e-mail manual checks.

**Not BLOCKED:** round 489 needs no external input; the Saba questions do not block.

Ready for commit: not applicable to B (no store source changed). Round 488 was already published by the root gate (`73f994d`).
