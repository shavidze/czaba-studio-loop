# B: round 275 → 276 planning (2026-10-30, D-29z613…D-29z617)

**Decision: CONTINUE.** Round 276 is **SYS-5 stage 1** (the seven transport buttons keep their reason reachable by keyboard) plus the RT-FIX-276 row. Task: `current-task.md`; grants `b-round-275-r276-grants.txt` (10 paths); frozen list `b-round-275-r276-tree-sha256.txt` (1129 files, `sha256sum -c` rc 0 at planning).

## 1. Inputs read
- **Gate:** `gates/gate-round-275.json` = `skipped` ("C taskStatus FAIL"). Nothing was published, so the baseline HEAD stays **`a4c0e24`** (gate 274). At planning: `git rev-parse HEAD` = `a4c0e240…`, `git status --short` empty.
- **Round 275:** `current-task.md` archived as **`tasks/round-275.md`** (no-clobber copy, `cmp` equal; the archive did not exist before).
- **Reports:** `a-round-275.md` (no change, baseline confirmed), `c-round-275.md`, `c-round-275.json` (FAIL on RT-IDS only; `browserVerified` and `realVerified` true).
- **Context:** `context/active-summary.md` (head only), `lessons.md`, `b-round-274.md`, `b-next.json`, `retros/retro-275.md` §8. Ids looked up in `backlog.json` with Python.
- **Regression date:** `regression-last.json` round 258, 2026-10-30. Due on or after 2026-11-02: **not due**.
- **User-review folder:** no new decision file since round 274 (newest is `screen-review-275.md`, written by B).
- **Before-copies:** `b-round-275/*-before-276.*`.

## 2. Round 275 result and RT-FIX (D-29z613)
C ran every row. All product/browser rows PASS (G275-AUTH, STUDIO-SMOKE-275 with export sha `1fea093b…` at both viewports, RT-SCREEN counts 142/170/121/147). RT-NUM, RT-CAUSE, RT-LESSONS, RT-SABA PASS. **RT-IDS FAIL** on two Low document findings against B. Under task §4 (D-29z612) B corrects the files now and round 276 runs as planned, with one RT-FIX row that re-checks only the changed lines.

| Finding | Correction |
|---|---|
| C-R275-01: RC-R265-AT-RISK-NO-ROW (named in D-29z565, D-29z575) had no `retro_candidates` entry and no disposition | Entry added to `retro_candidates`, status `applied`: instance 1 (C-R265-01) is covered by the L49 `SWEEP` clause, whose evidence already lists C-R265-01; instance 2 (C-R267-01) by the L4 "Same key path, two clauses" clause (D-29z575). The general form is watched until RETRO 290. `retro-275.md` §8 gains one bullet. No lesson line changes |
| C-R275-02: GATE264-ARCH-TEST-HELPER still said "candidate for RETRO 275" | Status rewritten: kept as a systemic test-only candidate, re-reviewed at RETRO 290; interim rule: every **new** test file uses `helpers/workspace-test-environment.ts`. `retro-275.md` §8 gains one bullet |
| INFO-C275-01 | `b-round-274/stops.txt` comment corrected (13 grep hits, all negations; 1 real STOP) |
| INFO-C275-05 | `screen-review-275.md` SR-275-1 wording narrowed (all four formats on the 1440 screenshots; at 1280 Clip details is collapsed) |
| INFO-C275-02 | Not changed: §8 already discloses the 2× vs 1× count disagreement. Acknowledged |
| INFO-C275-03, INFO-C275-04 | No action (cost offset explained; one environment retry) |

`open_findings` gains C-R275-01 and C-R275-02 as "fixed at round-276 planning, pending C RT-FIX-276 row". `retro_runs` 275: `done_pending_rt_fix_276`.

## 3. Round 276: SYS-5 stage 1 (D-29z614…D-29z617)
**Why now:** the round-275 task §4 fixed it (D-29z612): RT rows only → RT-FIX rides along; the planning is before 2026-11-02, so no REGRESSION. SYS-5 is Saba-approved (DUX-R-4(b), 2026-10-25).

**Scope split (D-29z614):** the backlog `owner_area` placed the metronome in `ArrangementTransport.tsx`; it is in `ArrangementTempoRow.tsx` l.317, and the library Add is `ArrangementLibraryPreview.tsx` l.333. Stage 1 = 7 transport buttons; stage 2 (round 277) = metronome + Add, with the helper moved to a shared file. Corrected in `backlog.json`.

**Consults (read-only, both actually run; the store tree was not touched: `git status` 0 lines and the frozen list rc 0 afterwards):**
- `product-designer`: Q1 silent no-op (rejected: status write — double announcement, screen budget, not Live); Q2 keep the handoff; Q3 same look but the ring must not be dimmed and hover must not light; mousedown must not steal focus; Undo/Redo/Split/Delete titles state no reason today → add reasons; 8 acceptance rows (folded into §8 of the task).
- `tech-lead`: helper local to the file (stage 2 moves it); Tailwind 4.1.18 variants `aria-disabled:` / `not-aria-disabled:hover:` compile; every `enabled:` override in the file must move together (tailwind-merge); rekey the handoff (doc 093 / D-29z73) rather than remove it; runtime `disabled` readers ruled; status writers become unreachable from the buttons; Space is prevented by the workspace handler, Ctrl+Space is not (covered by the guard); the sweep regex must include class tokens; the four test files to rewrite; `perf/lib/app-labels.ts` needle.
- **Disagreement ruled, not averaged:** button opacity (`tech-lead`) vs children opacity (`product-designer`). Chosen: children (`aria-disabled:*:opacity-40`), because the button is now focusable and opacity on it dims its own outline; the trade-off (the `bg-foreground/5` fill is no longer dimmed) is a named, measured delta (V-REST).

**L49 / SWEEP:** every side effect of native `disabled` is ruled in task §2.1 (kept / moved / dropped with reason, each with a row or mutant). Shortcut paths stay unchanged, because guarding them would drop the Z/X status reasons (D-29z616). The SWEEP grep [SW1] gives 40 test/perf files; 4 of them pin a transport button (all granted, plus `strings.test.ts` by text). Runtime readers: 3 exclusions, 2 intended changes (opener restore), CSS press scale changed, handoff rekeyed.

**tech-lead's setStatus check (from D-29z612):** the actions behind the buttons do write status in the unavailable state, but the new click guard runs first, so stage 1 adds **no** status write. L51 reduces to "status unchanged" rows. Evidence line appended to ARCH-CHECKPOINT-SYS6-STATUS-TAG.

**Reference-first:** WAI-ARIA APG "Focusability of disabled controls" (confirmed by fetch); Live 12 manual "Accessibility and Keyboard Navigation" §41.1.1 / §41.4.1.1 (Tab navigation exists; nothing on unavailable controls) → "no reference found" for that point, not guessed; **LIVE-MEAS-SYS5-DISABLED** appended to `user-review/live-checks.md` for root (non-blocking). This is a fix-up of an approved recommendation, so no AGREE note and no YouTube request (D-29z616).

**B's pre-check:** baseline Playwright probe at HEAD (`b-round-275/probe/baseline.cjs`, `baseline.json`, `head-1440.png`, `head-1280.png`): 7 transport Tab stops at both viewports, the seven buttons natively disabled with the titles quoted in the task. The Space probe was inconclusive in the empty demo (no clip, so playback did not start even from the body: `space.json`); B-SPACE therefore uses a same-run control. L23 used in its "cannot pre-apply" form (the change was not applied on a scratch copy); STOP rule for any other collision.

**Final review fixes (advisor, before reporting):** (1) the §9 table escapes pipes as `\|`, which `grep -E` does not match (`echo a | grep -E 'a\|b'` → no match), so the claims are also in `b-round-275/claims.sh`, with B's output at HEAD in `b-round-275/claims-output-at-a4c0e24.txt`; (2) B-MOUSE-FOCUS no longer deletes the focused clip first (that would unmount the focus); (3) V-REST's bound is derived from the tokens instead of guessed: with children dimming the label composites over the 5 % fill, so text = surface + 0.43·(fg − surface) = rgb(114,110,104) against HEAD's 0.40 → rgb(108,104,98), ΔE2000 2.43; fill rgb(33,30,28) vs rgb(26,24,22), ΔE2000 1.99 (`--color-surface` #161412, `--color-foreground` #ECE6DA, `app.css` l.49/l.70). The bound is ±4 per channel of the predicted values and ΔE ≤ 3; (4) `aria-disabled:*:opacity-40` was not one of the forms `tech-lead` compiled; the task now says so and gives A a compile pre-step with a STOP.

**Housekeeping note:** B deleted its own working file `b-round-275-checkpoint.md` at the end of the planning (it only listed the next steps, now all done). Nothing else was deleted.

**New Lows (deferred, 2026-10-23 rule):** B-R275-SPLIT-HELD-ENTER, B-R275-FOCUS-REASON-VISIBLE → `deferred_low_polish` 466.

## 4. Order
1. **Round 276: SYS-5 stage 1** (+ RT-FIX-276).
2. Round 277: SYS-5 stage 2 (metronome + library Add) — or REGRESSION first if the planning is on/after 2026-11-02.
3. STUDIO-PERFORMANCE (candidates GATE269-ARCH-ENVELOPE-RAMP-DENSITY, GATE273-S1-NOOP-RANGE-RERENDER), SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries (PHASE2-VIDEO-SCORING gated on Saba's go-ahead; skip rule).

## 5. Not COMPLETE, not BLOCKED
**Not COMPLETE:** RT-FIX-276 check, SYS-5 (both stages), STUDIO-PERFORMANCE, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, 466 deferred Lows, open Mediums GATE271-S1 (`awaiting_user`), GATE274-S1 and GATE232-S2 (Tech Lead / Saba manual), and the Saba-owned manual items. **Not BLOCKED:** nothing external is missing.

**Ready for commit:** nothing new from `store/` (gate 275 skipped; round 274 is published as `a4c0e24`).

**Architecture:** no new signal this planning. The SYS-5 helper is local by design; stage 2 is its extraction point (three users). The round-274 checkpoint addendum stands, non-blocking.

**Advisor:** available and consulted (before the approach; again before finishing).

## 6. Artifacts
- `tasks/round-275.md` (archive), `current-task.md`, `b-round-275-r276-grants.txt`, `b-round-275-r276-tree-sha256.txt`, `b-next.json`, `backlog.json` (version 240), `feature-status.md`, `user-review/live-checks.md` (LIVE-MEAS-SYS5-DISABLED), RT-FIX edits in `retros/retro-275.md`, `user-review/screen-review-275.md`, `b-round-274/stops.txt`.
- `b-round-275/`: before-copies `*-before-276.*`, `probe/` (baseline and Space probes with outputs and screenshots).
- `regression-last.json` unchanged (round 258, next due 2026-11-02).
