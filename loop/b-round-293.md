# B round 293 → 294 planning

**Date:** 2026-10-31. **Decisions:** D-29z732 to D-29z737. **Next task:** `current-task.md`, round 294, FIX-PD-1c3. The round-293 task is archived as `tasks/round-293.md` (copied, not moved).

## 1. Evidence read
- **C round 293** (`c-round-293.json`, `c-round-293.md`): **PASS**.
  - 13 of 13 rows pass, with 0 bugs. `browserVerified` and `realVerified` are both true.
  - The browser rows ran at 1440×900 and 1280×720 (plus 390): B-NARROW-PREVIEW, B-NARROW-MIX, B-RESIZE-KEEP, B-NARROW-WIDE, B-DESK-SAME (0 px), B-NARROW-LOAD and G293-AUTH.
  - INFO items: K15, DOC-L21, BASS-NAME, AUTH-ATTEMPT1 and L49.
- **A round 293** (`a-round-293.md`): no STOP. It changed exactly 3 paths. The code-reviewer ran and found 0 Medium+ issues. Its Architecture note is `silenceAll()`.
- **Gate 293** (`gates/gate-round-293.json`): **failed**, "verify exit 1".
  - `gates/round-293/verify.log`: agents check, lint and typecheck pass. The test step reports `Test Files 1 failed | 225 passed (226)` and 1 of 3,385 tests failed: `store-theme-tokens.test.ts` ST6, "expected { total: 4, script: 2 } to deeply equal { total: 3, script: 1 }".
  - The build was not reached, because `verify` stops at tests.
  - The status is not `published`, so the baseline stays HEAD `88b23dd` plus the 9-path tree.
- `regression-last.json`: 2026-10-30, round 258. The next regression is due on or after 2026-11-02, so round 294 is **not** a regression round.

## 2. Backlog updates (C and gate evidence only)
- **C-R292-01:** closed on C round 293 evidence. Publication waits for the gate.
- **FIX-PD-1c and FIX-PD-1c2:** `c_pass_unpublished`. On the board they read **მოწმდება**, not **მზადაა**: C passed them, but the gate did not.
- **GATE293-T1:** opened as Medium (D-29z733) and dispatched as round 294.
- **A-R292-REVIEW-L-TH4-TITLE:** scheduled early in round 294.
- **A-R293-ARCH-SILENCE-ALL:** recorded in `architecture_signals`. Not scheduled.
- **INFO-C293-DOC-L21:** scheduled in round 294. **INFO-C293-K15:** noted.
- **New stages:** FIX-PD-1c2 (recorded) and FIX-PD-1c3, both under PD-REVIEW-2026-10-31.
- The 2026-10-23 bug-gate decisions in `backlog.json` and `feature-status.md` are unchanged.

## 3. Round 294 in one paragraph
Round 294 is a test- and doc-only fix-up, with 3 grants.
- ST6's exact per-file map gains `components/arrangement/StudioNarrowScreen.tsx`, and its totals become 4/2. It deliberately stays per-file, with no folder rule.
- TH4's title is corrected.
- Doc 218: l.4 becomes `Completed (C round 294 PASS)` (L28 re-dispatch), l.21 adds `stopLibraryPreview`, and a GATE293-T1 Problem → Solution entry is added.

**B's scratch pre-run** (`/tmp/b294-scratch`; the store was untouched):
- the covering set from the K8 sweep, 6 files and 90 tests, passes;
- Biome is clean on both test files;
- mutant (a), a marker added to the Store `Footer.tsx`, turns ST6 red;
- mutant (b), the old map restored, turns ST6 red;
- `npm run build` gives rc 0 (`b-round-293/scratch-build.log`). Gate 293 never reached the build step.

**C's rows:**
- **B-MARKER** checks in the real browser exactly what ST6 guards: one marker on both Studio surfaces (1440, 1280 and 390), and none on `/` or `/store`. A Store page that cannot render is marked BLOCKED, not PASS.
- **B-DESK-SAME:** 0 px difference.
- **G294-AUTH**, plus the claims, scope, unit and mutant rows.

Root publishes rounds 292, 293 and 294 together: 10 paths.

## 4. Why we missed it (D-29z736)
- Round 292's covering set named only the `app/lib/arrangement/__tests__` scanners. Its marker claim counted non-test source only.
- ST6 lives in `app/lib/__tests__` and scans the whole tree, so it was never run.
- L23 already asks for an `app/**/__tests__` grep. This was an execution gap, so L23 gains an "added token" clause rather than a new lesson. `lessons.md` stays at 59 lines (the old copy is `b-round-293/lessons-before-294.md`).

## 5. Ready for commit?
No.
- Rounds 292 and 293 both passed C, but the gate failed.
- Root publishes rounds 292, 293 and 294 together after the round-294 C PASS and a green gate.

## 6. Order after 294 (D-29z737, unchanged from D-29z731)
REGRESSION if round 295 is planned on or after 2026-11-02. Otherwise:
1. SYS-VACUOUS-ROWS
2. STUDIO-LINK
3. NAME-AND-HINT
4. PERF-3c and the rest of STUDIO-PERFORMANCE
5. STEM-LANES
6. SYS-1…3
7. STORE-2b…5 (direction gate)
8. REVIEW-RECOMMENDATIONS
9. T12-ADVANCED
10. Phase-2 entries (skip rule)

SRW-21-PLAN stays parallel planning. The RETRO is due at round 305.

**Architecture checkpoint:** not requested.
- FIX-PD-1c is a route-level boundary.
- Its one structural note (`silenceAll`) is recorded as a signal.
- No owner shows repeated structural risk.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - GATE293-T1 (Medium) is open.
  - FIX-PD-1c is unpublished.
  - Most of the queued scope is not done: STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-*, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2.
  - The deferred Lows are open.
- **Not BLOCKED:** nothing external is missing. The open Saba questions do not block.

## 8. Process
- **Advisor:** available and consulted before writing. It confirmed the baseline, asked for an archive copy and a browser marker row, flagged the TH4 ruling as an explicit choice, and asked for the root cause to come from round 292's own claims.
- **Product consults:** not needed. There is no user-visible change, and reference-first does not apply.
- **Claims:** `b-round-293/claims-294.sh` was re-run after the last edit, and its output equals `claims-294-output.txt` (K1–K15).
- **Backups:**
  - `b-round-293/backlog-before-294.json`
  - `b-next-before-294.json`
  - `feature-status-before-294.md`
  - `lessons-before-294.md`
