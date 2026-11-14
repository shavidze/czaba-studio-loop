# B round 515 → 516 planning (2026-11-14)

**Decision: CONTINUE.** The next task is round 516, NONBRAND N4 (Home). It is in `current-task.md`; round 515's task is archived byte-identically as `tasks/round-515.md`.

## Inputs read
- `context/active-summary.md`, `lessons.md`, `current-task.md` (round 515), `a-round-515.md`, `c-round-515.md`/`.json`, `gates/gate-round-515.json` and `gates/round-515/review.md`.
- Specific backlog ids, looked up by grep or JSON: DPG-BUTTON-CLEANUP-2-NONBRAND, GATE514-M1, C-R514-01, A-R514-R2/R3, SIG-R513 and the queue.
- product-designer's round-506 N4 rulings (`b-round-506/consult-product-designer.md`).
- `root-pre-push-review.md` and `publication-checkpoint.json` are old (2026-10-07). They hold no new finding for this round.
- Gate 515 is `published`, so the next round's baseline is its commit `63c8894`.

## Acceptance (only from C evidence)
| Id | Before | Now | Evidence |
|---|---|---|---|
| A-R514-R2-HEADER-BUTTON-ROW | dispatched | closed | C round 515 C5: R515-T5 green, M5 red |
| A-R514-R3-F8-BODY | dispatched | closed | C round 515 C5: R514-F8 asserts BODY; C2 BODY 0/22 |
| GATE514-M1-POINTER-FIELD-KEYBOARD (Medium) | dispatched | browser half verified; open only for the manual phone check (TLM-R515-PHONE-KEYBOARD, non-blocking) | C1 P1/P3 |
| C-R514-01 (Low) | dispatched | code fix verified by simulation only; open for Safari | C1 P2 (simulated) |

`browserVerified` and `realVerified` are true, with no backend-blocked rows. Nothing is marked done without C evidence.

## Findings recorded (D-29z1873)
- **Gate 515 review (9/10, all Low or info):**
  - finding 1 → GATE515-L1 (deferred);
  - finding 2 → GATE515-L2 (deferred);
  - finding 3 → `confirmedBy` on A-R515-REVIEW-READONLY;
  - finding 4 → `confirmedBy` on A-R183-COOKIE-INLINE-GRADIENT.
- **A's notes:**
  - The reviewer's Medium **A-R515-REVIEW-SELECTOR-ROWS** is re-rated **Low**. A's Chromium probe (`a-round-515/selector-probe.json`) and C1 show the behaviour is correct; only the rows are missing. It is deferred together with CE-CASE, READONLY and HELPER-ASSERT.
  - VOICEOVER becomes a SABA-DEVICE-CHECKS row.
- **Architecture notes** (A's reviewer and gate 515): recorded as `confirmedBy` on SIG-R513-COOKIE-FOCUS-GROWTH. They are a signal only. No checkpoint is needed, because round 516 leaves CookieConsent.

## Why round 516 = NONBRAND N4
- The bug gate has no Critical, High or Medium that the cloud can reproduce.
  - The open High B-R492 needs root and the backend.
  - The open Mediums are manual, root-only or `awaiting_user`.
- REGRESSION is due on or after 2026-11-16; RETRO is at 525.
- N4 is the next NONBRAND stage in DPG-FIX P1. NONBRAND is Saba's DPG item 7, Medium, in progress.

## Pre-check (`b-round-515/`)
- **Sketch:** `sketch-516.patch.txt`, sha `560cdf79…`. Built in `/tmp/b516`, a plain copy of HEAD.
  - tsc rc 0; Biome rc 0; lint 171.
  - Covering 16/194.
  - Full suite 307/4,440 on the first sketch version.
  - Scanner 50 → 48.
- **Consults:**
  - product-designer: Close inset compensated, so the glyph centre stays at 40/40.
  - tech-lead sketch review: approve-with-changes. Its one requested row was applied, and mutant M12 kills the surviving `<a href>` case.
  - Mutants M1–M12: all red.
- **Browser** (`probe/n4-probe.mjs`): HEAD on :5173 vs the sketch on scratch :5174, at 1440, 1280 and 375. Close centre 40/40 at both. Contrast 7.06. Post-close focus is equal.
- **Environment incident (fixed):** the first scratch server shared `store/node_modules/.vite` through a symlink. It re-optimized the deps, and :5173 began answering 504 "Outdated Optimize Dep", so pages stopped hydrating.
  - Fix: I touched `store/vite.config.ts`. Only its mtime changed; the sha is unchanged and `git status` stays clean. The server restarted and hydrates again (verified twice).
  - The scratch then got its own `node_modules` of symlinks without `.vite`.
  - This was a B process slip: lesson L38 already required a separate Vite cache (C-R278-ENV-01). Recorded as INFO-B515-SHARED-VITE-CACHE (D-29z1875), with `confirmedBy` on C-R278-ENV-01 (2×). The task cites L38 for C.
- **Claims:** `claims-516.sh` and its planning output; the allowed delta is in `claims-516-allowed-delta.txt`. The L58 and ledger checkers are OK.
- **Hand-off amendments after the advisor review (D-29z1875):**
  - both link boxes are stated (View Collection 170×50; x/y not compared);
  - mutants run on a copy outside `store/`;
  - the doc/e2e inventory is saved and pre-ruled (`doc-e2e-inventory.txt`; task pre-ruled 9);
  - K11 and K19 are extended.

## Architecture checkpoint
None requested. N4 touches two leaf components; there is no accumulated structural risk on one owner.

## Ready for commit
Nothing new from B. Round 515 is already published (`63c8894`).

## Order after 516
1. REGRESSION on or after 2026-11-16.
2. NONBRAND N5 (cart; Remove needs a danger tone), then N6–N9.
3. PD-R498, then DPG-BUTTON-CONTRACT-TABLE.
4. The rest of DPG P1 (with the DPG2 ids), the DP gate, then P2.
5. STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, and the rest of the queue.
6. RETRO 525.

## Files written by B this planning
- `tasks/round-515.md` (byte copy).
- `current-task.md`, `b-next.json` and `b-round-515.md`.
- `feature-status.md`: the header, round 515's result, round 516's line and the two cookie bug lines. Backup in `b-round-515/feature-status-before-516.md`.
- `backlog.json`: v521 → v522 via `b-round-515/update-backlog-516.py`, then v523 via `amend-backlog-516.py`. Backups in `b-round-515/backlog-before-516.json` and `backlog-before-amend-516.json`.
- `b-round-515/*`: the sketch, its sha and review, the pins (tree 1,430, pre, post), the consult, the mutants and their logs, the probe (HEAD and sketch), the covering, lint, Biome, tsc and full-suite logs, the scanner outputs, and the claims with their output and allowed delta.

No store file content changed (`git status` is clean; only `vite.config.ts`'s mtime, see above). The scratch server on :5174 is stopped, and :5173 is running and hydrating.
