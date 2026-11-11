# B round 454 → 455 planning

**Date:** 2026-11-11.

**Advisor:** available. I consulted it after orientation and before writing. I followed its advice. A second consult, before declaring done, found three rows I had not run on the sketch and a reviewed sha that was not the dispatched sha. Both were fixed. The first consult's advice:
- schedule the Saba seek-thumb Medium before the test-only STORE-2b-3c-2;
- reproduce the bug at HEAD in the browser and check two concrete causes (missing `step`, thumb inset) instead of root's "transition" guess;
- pin the keyboard step (L49);
- keep the splash out of this round, with a probe and a question for Saba;
- keep A-R454-REVIEW-M-DEAD-UNCHECKED as an open Medium;
- record DP-GATE as a root step.

**Consults:** `tech-lead` reviewed the sketch and returned APPROVE. I adopted 2 of its 3 optional suggestions (`b-round-454/sketch-review.md`). `product-designer` was not consulted, because this round is a bug fix and not a new feature.

## Inputs read
- **Round 454:**
  - `current-task.md`, archived byte-identical as `tasks/round-454.md` (`cmp` OK);
  - `a-round-454.md`, `c-round-454.md`, `c-round-454.json`.
- **Gate 454:**
  - `gates/gate-round-454.json` (`published`, `2e26962`, which is the baseline);
  - `gates/round-454/review.md` (COMMIT OK, 9/10);
  - the tail of `gates/round-454/verify.log` (build OK).
- **Context:**
  - `context/active-summary.md`;
  - the structure of `context/active-backlog.json`;
  - the B part of `lessons.md`;
  - `regression-last.json` (2026-11-10, round 425, so the next is due 2026-11-13).
- **Old root files:** `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and were already processed. They contain nothing new.
- **Backups:** `b-round-454/{backlog,feature-status,current-task,b-next}-before-455.*` and `b-round-454/lessons-before-455.md`.

## Round 454 result (only independent evidence counts) — D-29z1615
- **C round 454:** PASS on C1–C10, `browserVerified`/`realVerified` true, 0 bugs.
  - BLOCKED rows: the fake-bearer path and the signed-in legacy ExportDialog (backend unavailable in the cloud).
  - Firefox/Safari scrollbar: Tech Lead row TLM-R454-FIREFOX-SAFARI-SCROLLBAR, deadline RETRO 465.
- **Gate 454:** published `2e26962`. **STORE-2b-3c-1 is done (მზადაა).**
- **Findings:**
  - A-R454-REVIEW-M-DEAD-UNCHECKED stays an **open Medium**, owned by 2b-3c-2 (round 456).
  - A-R454-REVIEW-L1…L6 go to `deferred_low_polish`. L1 is `confirmedBy` gate suggestion 3.
  - GATE454-S1-PLAY-FOCUS (the play button's `:focus-visible` is unconfirmed) goes to `deferred_low_polish`, owner STORE-2c.
  - The two Architecture notes become signals SIG-R454-HITSBYRULE and SIG-R454-ALLOWLIST-PINS. They are not tasks.

## Saba 2026-11-11 (L42) — D-29z1616
- **SABA-B-14, seek thumb (Medium):** dispatched as round 455.
- **SABA-B-13, entrance minimum display time (Medium):** a new stage, STORE-2b-ENTRANCE, after 2b-3c-2.
  - **B probe** (`b-round-454/probe/entrance-head-1440.txt`, dev server):
    - On a fresh tab the page paints at 496 ms, and the overlay mounts at 1522 ms, after hydration. That is the "flash".
    - On a same-tab reload there is no entrance at all.
  - **Ruling:** Saba's minimum replaces D10's "≤ 1.2 s". Once-per-session stays. The non-blocking question SABA-Q-ENTRANCE-RELOAD is in `user-review/questions-saba-b-13.md` and in `open_findings` (info, `awaiting_user`), next to the other SABA-Q ids. `update-backlog-455.py` first wrote it to a new key, and a follow-up edit moved it; the default is (a), keep it once per tab.
  - **Next:** production-build timing and the `product-designer` consult happen when that stage is planned.
- **DP-GATE (design-philosophy acceptance gate):** recorded in `backlog.json` → `design_philosophy_gate`, mirrored as `root_requests_b` ROOT-REQ-DP-GATE and in the STORE-REDESIGN entry (`dp_gate_d29z1616`), as a root step after STORE-2b, STORE-5, STUDIO-VIS and ARCH-SPLIT. B does not task it.
- **Earlier Saba items:** the 2026-11-10 items were checked and are already in the backlog (STUDIO-VIS-*, SABA-B-12, SABA-LANE-RESIZE-HANDLE, ARCH-SPLIT).

## Round 455 = SABA-B-14 — D-29z1617
**HEAD measurement (Chromium, 150 s preview, 464 px track, 10 paused samples):**
- The thumb leads the fill by 4–7 px early and lags it by 4–5 px late. The maximum is 7 px at both viewports.
- **Cause 1:** the range has no `step`, so its value snaps to whole seconds.
- **Cause 2:** the 12 px thumb is inset against a 0–100 % fill.
- Root's "transition" hypothesis was rejected by the measurement.

**Sketch:**
- `step="any"`;
- a thumb-centred `calc` fill, also used by the volume slider;
- arrows, with any modifier, pinned to ±1 s from the exact time. B's browser pre-check found that the first sketch left the modified arrows at the native 1 % step, against HEAD's +1 s, and fixed it;
- `aria-valuetext`.

**Results:**
- 0 px at every sample at both viewports.
- 13 of 13 mutants red.
- Covering set: 6 files / 73 tests.
- Full suite on the dispatched sketch: 284 / 4148. Build: rc 0 (on the first sketch).
- `tech-lead`: APPROVE on the first sketch, then a delta APPROVE on the dispatched sha `c3feb718` (reviewed = dispatched).
- The volume, hover, drag and modified-arrow rows were measured on HEAD and on the sketch before they were written as asserts (`probe/extra-*`, `probe/altleft-*`).

**Rulings and checks:**
- `recordings/*` ranges are ruled out of scope: they set their own `step` and use the native `accent-brand` fill.
- One test collision (the K1 fill-percent assertion) is granted and rewritten, with no assertion lost.
- `Why we missed it` is in the task. Lesson L61 gains a "Painted range fill" clause, and the file stays at 60 lines.
- The L58 check is OK (`b-round-454/l58-check.txt`). The claims outputs are `b-round-454/claims-455-planning-output.txt` and `claims-455-sketch-output.txt` (a clone with the sketch applied), both with empty stderr. Claims run K1–K18.

## Order after this round
1. **Round 456:** STORE-2b-3c-2. If round 456 is planned on or after 2026-11-13, REGRESSION-2026-11-13 runs first.
2. SABA-B-13 entrance.
3. 2b-3d, then 2b-4, then STORE-2c…5.
4. DP-GATE, run by root.
5. ARCH-SPLIT.
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2, under the skip rule.

The next RETRO is round 465.

## Architecture checkpoint
None requested. This is a single-owner, one-file fix, and there is no accumulated structural risk on `AudioPlayer.tsx`.

## Ready to publish
Round 454 is already published (`2e26962`). Nothing from B is pending publication.

## Decision
**CONTINUE** (`b-next.json`).
