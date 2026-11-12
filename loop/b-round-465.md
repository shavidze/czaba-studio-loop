# B round 465 → 466 planning

**Date:** 2026-11-12 · **Decision:** CONTINUE · **Next:** round 466 = STORE-2b-3c-2b, test-only (`current-task.md`)

## Advisor and consults
- **Advisor:** available. I consulted it after orientation and before writing. It pointed me to D-29z1640 (2b-3c-2b next) over a jump to STORE-2c, and to the pre-check items (HEAD preserved, guard vs Chromium, mutants, review, claims).
- **tech-lead, review 1 on v1 `fc2c0836`:** APPROVE-WITH-CHANGES. I applied its unit-list change (`[a-z]*`, `0pt`/`0dvh` rows) and its concat negative.
- **tech-lead, review 2 on the dispatched `06b2af46`:** APPROVE. Both reviews are in `b-round-465/sketch-review.md`.
- **Not consulted:** product-designer, performance-optimizer and ableton-arrangement-expert. This round is test-only and changes nothing visible.

## Inputs read
- `context/active-summary.md`
- `tasks/round-465.md`, `a-round-465.md` ("RETRO round, no implementation."), `c-round-465.md` and `.json` (PASS, 0 bugs)
- `gates/gate-round-465.json`: `skipped`, "no real changes", head `6d321c7`
- `regression-last.json`: 2026-11-10
- `lessons.md`
- The STORE-REDESIGN stages in `backlog.json`, the three finding ids, and `gates/round-452/review.md`
- `user-review/`: no new answer. AGREE-STEM-LANES is still `awaiting_user`.
- `root-pre-push-review.md` and `publication-checkpoint.json`: old entries only, nothing new for this round.
- ARCH-CHECKPOINT-STYLE-SCAN: still unanswered (deadline round 480).

## Acceptance of round 465 (D-29z1642)
I updated the backlog only from what C showed:
- C PASS on rows 1–12, `browserVerified`/`realVerified` true, 0 bugs. The fake-bearer row stays BLOCKED (no backend in the cloud).
- Gate 465 skipped, so the baseline stays `6d321c7`.
- No finding opened.
- `regression-last.json` is unchanged.
- `tasks/round-465.md` is a copy of the RETRO task (`cmp` equal); nothing was deleted.

## Round 466 (D-29z1643)
**Order:** I followed D-29z1640. This planning is on 2026-11-12, one day before REGRESSION-2026-11-13 is due, so round 467 is the regression round.

**The change:** in the zero-offset glow scanner, the offset token now covers any zero spelling (any unit or sign). The blur also covers `calc`, `min`, `max`, `clamp` and concatenated values. A `/shadow/i` pre-check is added. Two new rows, TS7 and TS8.

**It closes 3 findings:**
- A-R451-REVIEW-L2-ZERO-OFFSET-UNITS (Low)
- INFO-TL-R451-GLOW-CALC (info). Its backgroundClip half is ruled fail-safe and kept.
- GATE452-L1-GLOW-REGEX-WHOLE-SOURCE (Low)

**Pre-check, all under `b-round-465/`:**
| Check | Result |
|---|---|
| Corpus, HEAD vs sketch | 657 sources; only the fixture file differs |
| Mutants | 13, all red |
| Chromium oracle | 22/22 agree |
| Full suite on the sketch | 285 files / 4,188 tests (gate 464: 4,186) |
| Typecheck, Biome | rc 0 |
| Production build vs HEAD | 0 differing lines, with and without a doc-304 placeholder (L56) |
| Claims | 23 claims, stderr empty |
| L58 | OK |

**Found during the pre-check:** Tailwind v4 scans test files. Three new className fixtures would have added utilities to the production `app.css`, so they are built with `join('')`. The TS6 fixtures at HEAD already put 5 utilities into the production CSS. I filed that as **B-R465-TEST-FIXTURE-CSS-LEAK** (Low, pre-existing, deferred), and the task does not touch it.

**Rulings:**
- **STORE-2b-4:** it has no code scope of its own. Its F6 visual rows live in STORE-3/STORE-4 and in the DP-GATE review. It is **not** marked done.
- **Not folded into SYS-R465-DEAD-CSS-MATCHER:** that task changes a different matcher and has its own trigger.
- **Signals:** SIG-R453-CSSRULEBODIES, SIG-R454-HITSBYRULE and SIG-R454-ALLOWLIST-PINS stay signals.
- **New deferred Lows:** TL-R465-L1…L6 (tech-lead review 1) and B-R465-TEST-FIXTURE-CSS-LEAK.

## For root
- **DP-GATE:** round 466 is the last STORE-2b code stage, but STORE-2b stays open on 2b-4's rows, which live in STORE-3/4. Root may run the first DP-GATE review (design-philosopher + product-designer on the Store pages) after round 466 passes, or at STORE-4; that is root's choice. B schedules any finding below 10/10 once root files it (D-29z1644).
- **Commit readiness:** round 466 is ready for the gate after C PASS. It changes 2 test files, adds doc 304 and changes doc 299 line 4. Round 466 is the final stage of STORE-2b-3c-2 (L28), so both docs get `Completed (C round 466 PASS)` (D-29z1644).
- **No architecture checkpoint requested.** This is a small test-only change on the style-scan helper, and ARCH-CHECKPOINT-STYLE-SCAN is still pending.

## After round 466
1. Round 467: REGRESSION-2026-11-13, carrying all `scope_additions` (L6).
2. STORE-2c (typography) and STORE-2d.
3. STORE-3, STORE-4 and STORE-5.
4. ARCH-SPLIT, REVIEW-RECOMMENDATIONS and T12-ADVANCED.
5. Phase 2, under the skip rule.

The next RETRO is round 480.

## Files written by B
- **Loop root:**
  - `current-task.md`
  - `tasks/round-465.md` (archive copy)
  - `backlog.json` (v460 → v461; before-copy `b-round-465/backlog-before-466.json`; script `update-backlog-466.py` + `.done`)
  - `feature-status.md` (before-copy in `b-round-465/`)
  - `b-next.json`
  - this file
- **`b-round-465/`:** sketch, review, mutants, probe, data, claims and build compare.
- **Outside the store:** B edited no store file. All sketch work ran in `/tmp/b466-scratch` and `/tmp/b466-head`.
