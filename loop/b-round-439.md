# B round 439 → 440 planning (2026-11-10)

**Advisor:** available and used twice.
- **First call**, after orientation and before writing: re-run A's wrapper mutants myself, read gate 439's review, and split SYS-1 where it needs a production hook.
- **Second call**, before hand-off. It led to these changes:
  - named failing tests in the mutant results;
  - an L31 number computed against the declared timeout;
  - claims K26–K28;
  - extra K11 artifacts;
  - a de-duplicated Low.
**Consults:** `tech-lead` reviewed sketch v1, then the delta v1 → v2. Both verbatim/dispositions are in `b-round-439/tech-lead-review-v1.md` and `sketch-review.md`. No other consult was needed: the round is test-only, so the reference-first and product-designer rules do not apply.

## 1. Round 439 result (from independent evidence)
- `c-round-439.json`: **PASS**, rows C1–C11 passed, `browserVerified` and `realVerified` true. One row is BLOCKED: the fake bearer (backend unavailable in the cloud).
- C ran in Chromium at both viewports:
  - the anonymous auth guard: `auth_user` null, "Sign in required", 0 `audio[src]`, token 401;
  - play;
  - a real WAV export: 29189420 bytes, RIFF/WAVE.
- `gates/gate-round-439.json`: **published**, commit `efd71f6`, on both remotes. The review says COMMIT OK, 9/10. Verify: 273 files, 4029 tests.
- **D-29z1563:** SYS-R435-SOURCE-SCAN-HELPER is **done**. This closes:
  - C-R438-01 and A-R438-REVIEW-L1;
  - the 9 deferred Lows named in D-29z1557;
  - the subfolder half of GATE434-S2.
- The baseline for round 440 is `efd71f6`. The store tree is clean.

## 2. Rulings
- **D-29z1564: A-R439-REVIEW-M1-RD2-SF2-WRAPPER-TAG.** C-R439-01 confirms it (one id, L7). It is **Low**, `deferred_low_polish`.
  - B re-ran A's scripts on `git archive` copies of `142918b` and `efd71f6` (`b-round-439/wrapper-rerun/results.jsonl`). W1, W2, W1b and W2b are green on both; W3 and W4 are red on both. So the gap is equal to HEAD.
  - It must land before SABA-B-12 stage 4, or before any wrapper `Input` of type radio or search (L8).
- **Deferred Lows:**
  - A's reviewer Low 1 is the same issue as TL-R439-N1. It is recorded there as `confirmedBy`, with no new id (L7).
  - A's reviewer Lows L2–L5 go to `deferred_low_polish`.
  - Gate 439's Lows 1, 2, 4 and 5 go there too. Gate-439 L5 is already applied to doc 286. Gate-439 L3 is not a finding.
- **Architecture notes:** both notes (A's "signal: none", and the gate's "port HS1 + 4 suites to `listSourceFiles`") are recorded as `confirmedBy` on SIG-R438-OTHER-SCANNERS. That is a backlog signal, not a scheduled task.
- **RETRO-450 candidate B-R439-SIBLING-SUITE-GAP:** when NF2 was fixed, the sketch review did not ask RD2 and SF2 the same question.

## 3. Next task: round 440 = SYS-1 stage 1 (test-only)
- **Why now:**
  - No Critical or High finding is open.
  - The 7 open Mediums are either root, manual or Saba items, or parked by Saba's "defer" (claim K14).
  - SYS-1 is next in D-29z1562's order.
  - REGRESSION is not due until 2026-11-13.
- **D-29z1565: SYS-1 is split into two stages, with no scope dropped.**
  - **Stage 1 = this round:** RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS, C-R127-L1f-SELF-COMPARE-TESTS. It touches 6 test files.
  - **Stage 2 = next:** GATE164-OV1, GATE173-S4 and GATE81-S2-UM8. It needs data attributes in `ArrangementOverview.tsx` (K23 = 0 hooks today) and a jsdom render of the export dialog's video-sound line (K24 = 0 tests). That is a production grant and a different covering set.
- **B's sketch v2:** `b-round-439/sketch-440.patch.txt`, sha `dd7dc3c7…`.
  - Typecheck rc 0. Lint: 205 warnings, the same as HEAD. Full suite: 273 files, 4029 tests, rc 0. Covering set: 6 files, 89 tests.
  - The slowest test (L31) is at 12.5 % of its declared 15 s timeout (K26).
  - **15 named mutants:** S1–S10 are red on both HEAD and the sketch. R1 and R2 are green on the sketch, by ruling S1-R1. V1–V3 are vacuous (green) at HEAD and red on the sketch.
  - Claims: `claims-440.sh`, with the planning output and the expected-after-A diff simulated on a clone. `l58-check` passes.
- **Grants:** 7 paths (`grants-440.txt`). Frozen manifest: 1343 files, rc 0. Protected files: none granted.
- **C:** scope, patch identity, covering, the mutant matrix and the sweep. In Chromium: the auth guard, play, and a real WAV export at both viewports. Then claims, the doc and L57.
- **Out of scope, recorded:** the other `className).toBe(` style pins, plus the `.sr-only` and icon-class finders. They are in the `sys1_other_classname_pins` note on SYS-1 as a RETRO-450 question. No new ids.

## 4. Order after round 440 (D-29z1566)
1. SYS-1 stage 2.
2. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13.
3. SYS-3.
4. STORE-REDESIGN 2b…5. The direction decision exists.
5. ARCH-SPLIT, after a frontend-architect checkpoint through root (ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS is still open).
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2, under the skip rule.

STEM-LANES jumps ahead once Saba answers its AGREE note (`user-review/AGREE-STEM-LANES.md`, still unanswered). The next RETRO is round 450.

**Architecture checkpoint:** no new request. This round is test-only, and the existing request before ARCH-SPLIT stays.

## 5. Ready for commit
Round 439 is already published (`efd71f6`). Nothing new is ready until C passes round 440.

## Files written
- `current-task.md` (round 440). The archive `tasks/round-439.md` is byte-identical to the previous task (K12).
- `backlog.json` v426 (D-29z1563…D-29z1566). The pre-edit copy is `b-round-439/backlog-before-440.json`.
- `feature-status.md`.
- `b-next.json`.
- `b-round-439/` holds the sketch v1 and v2, mutants, logs, claims, reviews, the wrapper re-run and the grants/frozen manifests.
- `lessons.md` was not edited (60 lines; the candidate goes to RETRO 450).
