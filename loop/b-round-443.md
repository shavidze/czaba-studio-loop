# B round 443 → 444 planning

**Advisor:** available, consulted after orientation (before the sketch) and before hand-off.
**Archive:** `tasks/round-443.md` = the round-443 task (byte-identical, made before `current-task.md` was rewritten).
**Baseline:** gate 443 `published`, commit `1eefb4c` (`gates/gate-round-443.json`); store tree clean.
**Regression:** not due (`regression-last.json` 2026-11-10 → due ≥ 2026-11-13). Next RETRO: round 450.

## 1. Round 443 accepted (D-29z1576), from C evidence only
- `c-round-443.json`: PASS, `browserVerified`/`realVerified` true, 0 bugs. C5 held-IME is `ALL OK (18 cells)` and the HEAD control is `NOT ALL OK (8 of 18 failing)`. C7 plain held keys are `ALL SAME`. Gate 443 published `1eefb4c`.
- Closed: C-R442-M1-HELD-KEY-UNRULED, A-R442-REVIEW-L1, A-R442-REVIEW-L2. SYS-3 stage 1 and its fix-up are done.
- New: A-R443-REVIEW-L1/L2 (Low, origin B spec), queued to stage 2b. A's Architecture note is `confirmedBy` on SIG-R442-INLINE-EDITOR-KEYS.
- INFO: `c-round-443.json` lacks the 12 L57 fields (`b-round-443/l57-check-c443.txt`). This is C bookkeeping; the PASS stands. The round-444 task asks C for all L57 fields and the checker.

## 2. Round 444 = SYS-3 stage 2a (D-29z1577)
- **Scope:** focus-source (A-R203-REVIEW-M1/I1), Library search and the shortcut-sheet search, all under IME composition. Stage 2b (next) covers the shared settle-key helper and scan, TL-R443-G3 and A-R443-REVIEW-L1/L2. SYS-3 = 3 stages; doc 288 l.4 → `stage 1 of 3`.
- **B's pre-check:**
  - Real Chromium with CDP composition: HEAD `NOT ALL OK (14 of 18 failing)`, sketch `ALL OK (18 cells)` (`probe/compare-*.txt`).
  - Full suite on the sketch: 275 files / 4053 tests, rc 0.
  - Covering set: 25 files / 440 tests.
  - Mutants: 8/8 red.
  - typecheck 0, scoped Biome 0, lint 205 = HEAD.
  - Inventory: 19 inputs, 3 global keydown listeners. L50: 30 hits, one class ruling.
- **tech-lead:** approve-with-changes, 0 Medium+ (`sketch-review.md`). Rulings:
  - sheet-local guard, not Modal;
  - no `preventDefault` on composing keys;
  - L1 → TLM step;
  - L2 → `deferred_low_polish`;
  - L3, I1 and I2 are intended.
- **B premise correction:** Modal has 3 importers, not ~22 (K25). The ruling is unchanged and recorded in `sketch-review.md`.
- **Recorded, not asserted:** under the synthetic sequence, Chromium's native `type=search` clear still empties the Library query on a composing Escape. Tech-lead judges this a CDP artefact; it is a TLM step (TL-R444-L1).

## 2b. Additions after the advisor's hand-off check
- **Gate-443 review** read (`gates/round-443/review.md`): GATE443-L1 (Low) queued to stage 2b; finding 2 needs no fix; finding 3 is covered by TLM; the Architecture note is `confirmedBy` on SIG-R442. `root-pre-push-review.md` and `publication-checkpoint.json` are 2026-10-07 artifacts with nothing new. `direction-decision.md` exists, so STORE-2b…5 are not Saba-gated.
- **C6** run on the full-sketch server: both stage-1 probes `ALL OK (18 cells)` (K26).
- **C7** scripted (`probe/focus-targets.mjs` + `compare-c7.py`, with a ring definition). Sketch vs HEAD: `ALL SAME (6 cells)` (K27).
- **Native clear is measured, not inferred:** a page capture `preventDefault` keeps the query (`drso`/`plso`); without it the query is `''` (K28). "A real IME never triggers it" stays tech-lead's inference → TLM.
- **AltGraph:** Playwright and CDP cannot set `getModifierState('AltGraph')` here (0 of 3 keydowns, K29). That half is jsdom FT9 + M3; the platform half is on TLM.
- Wording narrowed in the task, `feature-status.md` and `b-next.json` to what is proven: our handlers no longer clear, move or close.
- Claims extended to K32, both outputs regenerated, `l58-check` run last; the backlog deep-diff against `backlog-before-444.json` touches only the intended paths.

## 3. Order (D-29z1578)
1. Round 444 (SYS-3 stage 2a).
2. SYS-3 stage 2b.
3. REGRESSION-2026-11-13 (first if due).
4. STORE-REDESIGN 2b…5.
5. ARCH-SPLIT (root's frontend-architect checkpoint first).
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2 under the skip rule.

No architecture checkpoint request now: SYS-3 is not at a feature boundary, and its structural signal is scheduled as stage 2b.

## 4. Files written by B
`current-task.md`, `tasks/round-443.md`, `backlog.json` (v430; pre-edit copy `b-round-443/backlog-before-444.json`), `feature-status.md` (pre-edit copy `b-round-443/feature-status-before-444.md`), `b-next.json`, and `b-round-443/` (sketch, review, grants, claims and their outputs, probes, mutants, logs).

Commit readiness for root: round 443 is published; nothing new to commit from B (loop state only).
