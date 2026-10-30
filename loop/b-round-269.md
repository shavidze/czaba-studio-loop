# B: round 269 → 270 planning (2026-10-30, D-29z580…D-29z585)

**Decision: CONTINUE.** Round 270 = **GATE266-S1** (Medium; reproduced in the browser), together with its same-cause sibling **B-R269-DETAIL-ALLTRACKS-DROP** (Medium, found by B this planning) and the two Lows on the same split strings, **GATE266-S4** and **B-R266-CLIPS-SPLIT-COPY**. Task: `current-task.md`. Grants: `b-round-269-r270-grants.txt`.

## 1. Inputs read
- `lessons.md` in full, plus specific ids grepped in `backlog.json`, `feature-status.md` and `context/`.
- `tasks/round-269.md`: an exact copy of the round-269 `current-task.md` (`cmp` identical; it did not exist before, nothing was overwritten).
- `a-round-269.md`, `c-round-269.md`, `c-round-269.json`, `b-round-268.md`.
- `gates/gate-round-269.json`: **published**, commit `f6ebd2d` on both remotes. That commit is the baseline for round 270 (clean tree).
- `gates/round-269/review.md` and `gates/round-266/review.md` (suggestions 1 and 4).
- `regression-last.json`: last regression round 258 on 2026-10-30, so the next is due on or after 2026-11-02 and is not due now.
- **Advisor:** available and consulted before the design. Its two main points were followed:
  - rule the contract now, naming the rejected options;
  - keep S4 and CLIPS-SPLIT-COPY wording-only (`splitClipsByRange` unchanged), and add the `perf/**` root to the sweep.
- **One advice point not followed, with evidence:** the advisor suggested disabling the fields with a reason. B's code read found that a focused Set button would then be disabled under the focus by Ctrl+Shift+L, because a button is not a typing target (K9; an L47 hazard). It would also add a persistent reason line. B chose the keep-branch design instead (D-29z581). It satisfies the same invariant without disabling anything.

## 2. Round 269 result (D-29z580)
- **C PASS** with 22 rows; `browserVerified` and `realVerified` are true, and there are 0 bugs.
- **Gate 269 published `f6ebd2d`.**
- **SABA-B-7 / SABA-B-7-ENVELOPE-DB → done**, which makes it **მზადაა** in `feature-status.md`.
- **Info only:** INFO-C269-DB3-FLOOR (DB2 catches the floor mutant, DB3 does not) and INFO-C269-1280-DETAIL-COLLAPSED. The round-270 recipes now expand the panel at 1280.

## 3. Gate-269 and A-269 reviewer triage (D-29z583)
- **S1 + S2 + A-L2** (ramp density; the per-step envelope scan) are one root cause. They become the architecture signal **GATE269-ARCH-ENVELOPE-RAMP-DENSITY**: keep the code, optional bounded task, not scheduled, a STUDIO-PERFORMANCE candidate. The sound is correct today.
- **S3** (vertical wobble rewrites a legacy gain below −60 dB) → `deferred_low_polish` as GATE269-S3-LEGACY-WOBBLE.
- **S4 = A-L4** → accepted limitation GATE269-S4-LEGACY-SEGMENT, documented in doc 200.
- **A-L1** is documented in doc 200 and closed.
- **A-L3, A-L5 and A-L6** → `deferred_low_polish`. The list now holds 449.
- **Architecture note:** keep.

## 4. Round 270 plan (D-29z581, D-29z582)
**Repro at HEAD `f6ebd2d`** (both viewports, 0 page errors; `b-round-269/probe-detail-range-head.json` and `probe-alltracks-head.json`):

| Case | Selection | Fields show | After Enter |
|---|---|---|---|
| Past start | 6.25–12.5 | 10 / 12.5 | 10–12.5 (shrunk) |
| Past end | 12.5–115.102 | 12.5 / 111.352 | 12.5–111.352 (shrunk) |
| All tracks | 11.5–14, all tracks | 11.5 / 14 | one track, "· Music." |

**The contract:**
- When the selection overlaps the selected clip, the fields show the selection's own values.
- Enter or Set with unchanged values keeps the range object as it is (all-tracks included) and announces it.
- Edited values keep the existing clip contract.
- Nothing is disabled.

**Rejected:**
- (a) Disable the fields with a reason: an L47 hazard and a persistent line.
- (b) Edit a lane range beyond the clip: a new ability, recorded as later candidate LATER-DETAIL-LANE-RANGE-EDIT, which needs Saba.

**Split wording:** neutral and true for one-edge, two-edge and whole-clip cases. It is closer to Live's command name "Split Clip at Selection" (42.16).

**Reference:** the Live 12 manual, sections 6.9 and 6.12, fetched on 2026-10-30. The manual has no numeric field for a time selection, so the detail fields have no reference and this is said explicitly.

**Pre-check (L23), all files in `b-round-269/`:**
- The sketch is `sketch.diff`. `tsc` rc 0 and Biome are clean.
- **Collision sweep:** the regex found 27 files; across 168 test files (`app/lib/arrangement/__tests__` and `app/components`) exactly 5 tests fail, all granted rewrites.
- **Mutants:** all 6 red; the unmutated sketch passes 114/114.
- **Browser:** HEAD and sketch probes at both viewports (`*-head.json`, `*-sketch.json`).
- **Scratch:** `/tmp/b269-scratch`, with its server on :5182, stopped after the probe. `store/` is untouched (`git status` empty).

## 5. Consults and lessons (D-29z584)
- **`product-designer`:** not consulted. This is a bug fix-up with no new screen element, which the policy exempts. C may use it in review mode.
- **No lesson added;** `lessons.md` stays at 59 lines. The miss pattern is recorded as **RC-R266-PANEL-CLAMP-CONSUMER** for RETRO 275: a gesture that newly crosses a boundary makes every clamped readout a consumer row.

## 6. Order and checkpoint (D-29z585)
- **Order:**
  - 270: GATE266-S1 and its siblings;
  - 271: SABA-B-11c stage 2 (relative snap, Saba option (a));
  - then SYS-6;
  - REGRESSION goes first on or after 2026-11-02, and the RETRO runs at round 275.
- **No new `frontend-architect` checkpoint:** `ArrangementDetailPanel.tsx` has no repeated-owner streak. The existing checkpoint requests stay with root, and none blocks.

## 7. Not COMPLETE, not BLOCKED
- **Not COMPLETE:**
  - open Mediums: GATE266-S1 and B-R269-DETAIL-ALLTRACKS-DROP;
  - unimplemented scope: SABA-B-11c stage 2, SYS-5/6, STUDIO-PERFORMANCE, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries;
  - 449 deferred Lows.
- **Not BLOCKED:** nothing external is missing.
- **Ready for commit:** nothing new; round 269 is already published (`f6ebd2d`). Root publishes round 270 after C PASS and the gate.

## 8. Artifacts
- **`b-round-269/` probes and pre-check:**
  - probes: `probe-detail-range.mjs`, `probe-alltracks.mjs`, `probe-split-copy.mjs`, with their `*-head.json` and `*-sketch.json` results and `shots/`;
  - pre-check: `sketch.diff`, `precheck-files.txt`, `precheck-sketch-vitest.txt`, `precheck-folder.txt`, `precheck-typecheck.txt`, `mutants.py`, `mutants.txt`, `scratch-server.log`.
- **Pre-edit copies:** `backlog.before.json`, `feature-status-before.md`, `lessons-before.md`, `b-next-before.json`, `current-task-before.md`.
- **Updated:**
  - `backlog.json` (version 234: rounds, queue, `open_findings`, `deferred_low_polish`, `architecture_signals`, `retro_candidates`, D-29z580…585);
  - `feature-status.md`;
  - `current-task.md`;
  - `b-next.json`;
  - `tasks/round-269.md` (archive).

## 9. Advisor's done-check (applied)
- **§3.2:** the keep branch now compares normalised values (`rangeInputText(parseSecondsInput(text))`), so a retyped `6.250` keeps the selection. Two rows pin it: new row DR6 and mutant M-RAW-TEXT. B's sketch used the raw-text form; A implements the stated rule.
- **§1:** "Why we missed it" now cites the verifiable fact: `grep -ci detail tasks/round-265.md` = 0.
