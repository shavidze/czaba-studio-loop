# B — round 321 → 322 planning

**Date:** 2026-11-03. **Advisor:** available and used: before writing, and before finishing.
**Output:** `current-task.md` (round 322), `backlog.json` v281 (D-29z890…D-29z895), `feature-status.md`, `b-next.json` (CONTINUE), `retros/retro-321.md` (RT-FIX), `tasks/round-321.md` (archive).

## 0. Inputs and the round-321 ruling
- **C round 321:** `taskStatus` FAIL; `browserVerified` and `realVerified` true.
  - 8 rows PASS: SOURCE-SCOPE, CLAIMS, RT-CAUSE, RT-LESSONS, RT-SABA, RT-SCREEN, G321-AUTH and STUDIO-SMOKE-321.
  - RT-NUM and RT-IDS FAIL on three Low findings, all with origin B: C-R321-01, C-R321-02 and C-R321-03.
  - No app bug.
- **Gate 321:** `skipped` (C FAIL). The baseline stays gate 320's `53c5c79`; store HEAD is `53c5c79`, clean.
- **Next round (round-321 task §4):** an RT row failed, so B corrects the files now, and round 322 re-checks only the changed lines (RT-FIX) together with the next task. Planning on 2026-11-03 is before 2026-11-05, so that task is **PERF-8b**, not REGRESSION.
- **Archive:** `tasks/round-321.md` is a copy of the round-321 `current-task.md` (cmp equal; claim K23). The before-copies are in `b-round-321/`: backlog, feature-status, b-next, lessons, retro-321 and current-task.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are present. Neither has a new finding that bears on PERF-8b; the latest gate review (`gates/round-320/review.md`) items are already triaged (D-29z881) and carried: GATE320-L1 and GATE320-S2 are in the task.
- **ARCH-CHECKPOINT-PERF8-STORE-PATTERN:** no answer from root, so the task follows D-29z193 (D-29z894).

## 1. RT-FIX (`retros/retro-321.md`; diff `b-round-321/retro-321-fix.diff.txt`)
- **C-R321-01, §9:** 15 of 16 rounds name asserts (305 is null), range 1–19. This is the saved output of C's own one-liner, `b-round-321/asserts-specified-305-320.txt`.
- **C-R321-02, §8:** the widened inventory `b-round-321/retro321-mentions-v2.py`, run on `b-round-320/backlog-before-321.json`:
  - regex `retro[ -_]?32[01]|RETRO \(32[01]\)|round 32[01]`; it also keeps a parent's own fields;
  - it finds 18 ids and 4 strings;
  - the 9 old ids are kept, and the 9 new ids have dispositions: one row for D-29z801, one row for the 7 implementation-round mentions, and the 2 new strings named.
- **C-R321-03, §4:** "9 + 2", with the open/deferred split from `classify.txt`.
- **No other line** of the retro changed.
- The three ids are in `open_findings` as open, and close when the RT-FIX row passes.

## 2. PERF-8b premise (L37), measured at HEAD on the dev server
| Probe | Output | Finding |
|---|---|---|
| `click-hooks-probe.mjs` (harness path) | `click-hooks-head.json` | The harness click changes hooks 1 (`selectedClipIds`) **and** 3 (`activeTrackId`) in one commit |
| same, `same-lane` | `select-same-lane-head.json` | A selection-only click changes hook 1 only and renders 105 components (dev). A re-click stores an equal-content array and renders 92. The ten selection-free names are live |
| `s2-probe.mjs` | `s2-head.json` | Library Enter-add: the range clear and the new selection land in the first commit |
| `s2-probe.mjs video` | `s2-video-head.json` | Add video: 2 commits with the range cleared and the old selection drawn (~8 ms); 0 rAF frames observed. GATE320-S2's mechanism is real in the DOM; no paint was seen |

## 3. Consults
- **tech-lead.** Recommended one selection store holding `selectedClipIds` and `activeTrackId`, or the split 8b-1/8b-2, each with its own row.
  - Equality guard: yes, but grep the dependency arrays first.
  - GATE320-S2 likely resolves once both writes are store writes in one tick (an inference; a trace row is needed).
  - Grant the shape change explicitly, with GATE320-C1 as the precedent.
  - Top risks: a selection-only change does not move the click row; the guard could suppress an effect keyed on array identity; churn across many test files.
- **performance-optimizer.** Keep `activeTrackId` in PERF-10, so each gain traces to one change.
  - Scenario: Ctrl+D, then click the other clip.
  - Transport should subscribe to a boolean.
  - The guard must be order-sensitive, because `add` mode changes the primary clip.
  - No selector may build a new array or `Set`.
  - Every `latest.selectedClipIds` read moves to `getState()`.
- **B's choice (D-29z891).** `performance-optimizer`'s scope, which equals tech-lead's 8b-1. It keeps D-29z860 and needs no unapproved widening. tech-lead's one-store option is recorded as SIG-R322-ACTIVE-TRACK-STORE for PERF-10.

## 4. Pre-check (L23, L58)
- **Type-only sketch** in `/tmp/b321-scratch` (`git archive HEAD`): the two fields are removed from the type and the value. `sketch-type-tsc.log`: 92 errors, 3 app files, 29 test files (`selection-test-files.txt`). HEAD `expect(` total: 4,021 (`expect-count-head.txt`).
- **Full suite on that sketch:** `precheck-full.log`, classified in `precheck-classify.txt`.
  - 110 failed, 128 passed.
  - All 29 listed files fail.
  - The 81 others all fail on the unmigrated `StudioWorkspace` render crash, so they are the covering set, not collisions.
- **Why no store sketch:** building the store sketch would mean implementing the round. So under L58, every new budget row is `record — not run on sketch: …`, and C's acceptance is relative to the HEAD control plus the saved HEAD name probe (D-29z893). This applies A's L58 feedback (RC-R321-RECORD-WORDING).
- **EXP-R321 fields:** `gateChecksNamed` 6; `gateChecksRunOnSketch` 2 (typecheck and full vitest, both red by design on a type sketch: they are collision lists, not green runs); `chainHeadGateRunGreen` null (not a fix-up chain).
- **Claims:** `b-round-321/claims-322.sh`, whose output `claims-322-head-output.txt` was run after the last edit; stderr is empty and K26 prints `done`.
- **Advisor's end review (applied):**
  - PERF-SELECT no longer asserts "≤ half": the result must be strictly below the control, and the ratio is only reported (L58).
  - The doc 230 GATE320-L1 line now cites D-29z860 / `tasks/round-318.md` l.102.
  - K24 and the inventory script write only to a temp or `c-round-322/` folder.
  - S-GROUP is now a screenshot compare.
  - S-TRANSPORT cites K11.
  - SELECT-NAMES keys on `providerRendered` and names, not hook indexes.
  - The claims were re-run after these edits.

## 5. Signals and requests
- **SIG-R322-ACTIVE-TRACK-STORE** goes to PERF-10.
- **ARCH-CHECKPOINT-PERF8-STORE-PATTERN** is still open for root and non-blocking. PERF-8 ends with this round, so this is its natural answer point.
- **No new Saba approvals** found in policy this planning (L42): the last sections (2026-10-31) are already in the backlog.
- **REGRESSION** is due on or after 2026-11-05. `regression-last.json` is unchanged.

## 6. Commit readiness
Nothing to publish from round 321: no store change. The loop-state commit records the RT-FIX. Round 322 is publishable after C PASS and the gate.
