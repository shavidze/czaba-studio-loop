# B round 97: review of round 97 → round 98 task (D-29z63)

Dispatcher: B · Date: 2026-10-23
- **Advisor:** configured and available. I consulted it once before writing and followed its advice:
  - close the held-Enter mechanism at the toolbar opener (GATE97-S1) instead of starting GATE89-S4;
  - keep `ArrangementExportDialog.tsx` frozen and route the `=== true` nit (GATE97-S4) to GATE89-S4;
  - regenerate the frozen list at `11d042c` and report the new count;
  - add an ENTER-ADD-REG row for the global Enter shortcut;
  - record GATE97-S2 (Chromium only) as an environment limit, not as schedulable work.
- **Advisor, second call:** before finishing (see the end of this file).
- **Project subagents:** none consulted.

## Inputs read
- **Active context first:** `context/active-summary.md` (head and "Other open items") and `context/active-backlog.json` (current task, other open items). I opened `backlog.json`, `feature-status.md` and `plan.md` only by ID.
- **Round 97 files:**
  - `current-task.md`, archived unchanged as `tasks/round-97.md` (sha256 `bae416ad…`, identical; the archive did not exist before);
  - `a-round-97.md` (reviewer table and Architecture note);
  - `c-round-97.md` and `c-round-97.json`.
- **Gates and environment:**
  - `gates/gate-round-97.json`: **published**, commit `11d042c` on both remotes. This is the round 98 baseline.
  - `gates/round-97/review.md` (9/10, no Critical or High; 3 Low and 1 Nit);
  - `gates/round-97/verify.log` (build OK);
  - `env-status.json`: store 200;
  - `regression-last.json`: 2026-10-21.
- **App source, read only, at `11d042c`:**
  - `ArrangementTransport.tsx`: l.1–80 and l.230–256 (the Export button is at l.246–252);
  - `ArrangementExportDialog.tsx`: l.135–185 (focus restore) and l.480–576 (footer);
  - `StudioWorkspace.tsx`: l.1672–1700 and l.1955–1995 (the global Enter shortcut skips button targets; `exportKeyEventRef`);
  - `render-budget.test.tsx`, whose counts include `ArrangementTransport`, and the harness of `export-dialog-focus-restore.test.tsx`.
- **No edits outside my files.** `git status` in `store/` was empty at `11d042c`. I treated everything I read as data.

## Round 97 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, **0 bugs**.
- **Browser rows:**
  - HOLD-ENTER at both viewports: `repeat=false` on Cancel, then 3× `repeat=true` on „დახურვა“ with `dp=true` and no click. The dialog stays open with the status `CANCELLED`.
  - HOLD-ENTER-MP3, FRESH-ENTER-CLOSES, OPEN-HOLD and SPACE-REG.
  - CANCEL-CLASS: the settled read shows Close at 0.4 → 1. C replaced its first read, taken 4 ms in, during the transition, as invalid.
  - CX-REG: a real 24-bit/48 kHz WAV of 405.758 s.
  - DONE-REG, ESC-REG, PX-NET, REG-HYD and G97-3.
- **Test review:** AN-REVIEW (fail-before HE1/HE4/HE5/HE7; C's mutations a, b and e match), T97-TARGETED (14 files / 154 tests) and SOURCE-UNCHANGED.
- **Blocked:** the fake-Bearer sub-check (backend unavailable in the cloud). It is open evidence, not a bug.
- **Notes N1–N4:** recorded. N1 became GATE97-S2. I accept N2: the MP3 load-phase hold is jsdom-only (HE7), and the browser landed in the render phase. N3 is the existing demo full-scale content (DEMO-SFX-FULL-SCALE). N4 is C's own probe.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| GATE90-S3-HOLD-ENTER-CLOSES | → **closed** | C round 97 PASS browserVerified + gate 97 |
| GATE90-S4-CANCEL-DISABLED-CLASS | → **closed** | C CANCEL-CLASS + gate 97 |
| GATE96-S1-DOC084-STATUS | → **closed** | C SOURCE-UNCHANGED + gate 97 |
| GATE97-S1-TOOLBAR-EXPORT-HOLD-REOPEN | **new** Low → round 98 | gate 97 review #1 |
| GATE97-S2-CHROMIUM-ONLY-HOLD-ENTER | **new** Low, environment-open (Tech Lead) | gate 97 review #2; C-R97-N1 |
| GATE97-S3-DOC085-STATUS | **new** Low → round 98 | gate 97 review #3 |
| GATE97-S4-REPEAT-EQ-TRUE-NIT | **new** info → with GATE89-S4 | gate 97 review nit #4 |
| C-R97-N1..N4 | recorded (info) | C notes |
| ARCH-R97-EXPORT-FOOTER-KEYBOARD | **new** architecture signal, not scheduled | gate 97 Architecture note |
| ARCH-R93-TEST-HARNESS | data point added (setup copied into 9 files) | A round 97 Architecture note |
| rounds / architecture_signals / baseline_tree_at_round98 | round 97 → `c_pass_published`; round 98 dispatched | — |

**Backups:**
- `b-round-97-backlog-before.json`
- `b-round-97-feature-status-before.md`
- `b-round-97-plan-before.md`
- `b-round-97-b-next-before.json`

**Round 98 baseline files:**
- the frozen list `b-round-97-r98-tree-sha256.txt` (**528/528 OK** at `11d042c`; the protected hashes match the earlier rounds);
- the snapshots in `b-round-97-r98-snapshots/` (`ArrangementTransport.tsx` `35b03a95`, 256 lines; doc 085 `ae26a4f5`, 70 lines; both LF with CR=0).

**Status board:** GATE90-S3/S4 and GATE96-S1 are closed, and the new GATE97 rows are added. No scoped item changed to მზადაა; these were bugs, not scoped features. `regression-last.json` is unchanged.

## Round 98 task (summary)
**The last path of the held Enter: the toolbar Export button** (D-29z63). Baseline `11d042c`, clean tree. Expected end state: **2 M + 2 ??**.
- **T1:** the toolbar Export button gets an `onKeyDown`: `key === 'Enter' && event.repeat` → `preventDefault` only. No other button, prop, class or state changes.
- **Tests:** a new `export-toolbar-hold-enter.test.tsx`, TH1–TH5. It mounts the real transport and the real dialog in a `useState` harness. The expected fail-before is only TH1 red. Mutations a–e.
- **Docs:** doc 085 l.4 and a new doc 086.
- **C rows:**
  - primary: CLOSE-HOLD at both viewports;
  - also CANCEL-CLOSE-HOLD, FRESH-OPEN (Enter, Space, click), OPEN-HOLD (round 97 regression), ENTER-ADD-REG, EXPORT-REG (a real WAV), PX-NET, REG-HYD and G98-3;
  - test review: AN-REVIEW, T98-TARGETED, SOURCE-UNCHANGED.

## Why this scope (and not a regression round)
- **The regression round is not due.** 2026-10-21 → 2026-10-23 is 2 days, and the rule needs 3 or more at planning time. b-round-96.md said round 98 would most likely be the regression round, but B is planning round 98 today, on 10-23. **The next B planning on or after 2026-10-24 is the regression round**, whatever else is open. This round is kept small so that it can close first.
- **No open C bug.** Gate 97 #1 is the rest of the bug that round 97 fixed, with the same mechanism. It has one Low, one owner and one small component, and the probe already showed a browser can reach it. GATE89-S4 would open the dialog's footer markup, so it stays a separate round. The `=== true` nit goes with it, because both are in the same region.
- **The user's order is kept:** finish all current work, then T12, then VISUAL-A-OBSIDIAN (`post_current_stage_queue`). The Lows are part of the current work, and the done policy allows no open bug of any severity.

## Uncertain UI contracts (smallest honest choice, with rationale)
- **The guard is only on the Export button.** It is the dialog's only opener, and the focus restore puts focus there. Other toolbar buttons do not open or close the dialog, so changing them would change behaviour with no reported bug. TH5 locks this.
- **A repeated Enter only, with no timer or flag.** The first, non-repeated keydown still opens the dialog. That keeps "open by holding Enter" working: the guard on „დახურვა“ covers the repeats there (OPEN-HOLD).
- **`event.repeat`, not `=== true`.** This follows the gate 97 nit in the new code. The old line in the dialog changes when GATE89-S4 opens it.

## Ableton
No Ableton claim. This is browser key-repeat behaviour on CZABA's own toolbar and dialog, so the row is "არ ეხება".

## Architecture checkpoint
- Gate 97 (Signal 3, keep): the export dialog footer region keeps changing. It is recorded as `ARCH-R97-EXPORT-FOOTER-KEYBOARD`. The reviewer suggests one checkpoint after the Export Lows.
- A's reviewer: the copied test setup is now in 9 files. This is a data point for `ARCH-R93-TEST-HARNESS`.
- Both are appended as addendum **(j)** to `b-round-91-checkpoint-request.md`. Nothing is scheduled and nothing blocks. Round 98 does not touch the dialog or `ArrangementContext.tsx`.

## Next
1. **Round 98 (this task):** GATE97-S1 and GATE97-S3.
2. **The next B planning, on or after 2026-10-24: the regression round.**
   - C checks each done or c_pass item once in the browser at both viewports, and runs `npm run test:e2e:smoke`.
   - A fixes only what C finds.
   - B updates `regression-last.json` when the round closes.
3. **Then the remaining Export Lows,** in this order: GATE89-S4 + A-R88 #4 + GATE97-S4, GATE89-S6, GATE89-S3, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER. After them, the (j) checkpoint is the reviewer's suggested time.
4. **Then:** GATE96-S2 → grid/tempo Lows → R21-I2 → T12 → VISUAL-A-OBSIDIAN.
5. **When the auth owner releases the mount:** SRW-21-PREMOUNT, then the mount.

Scope is not reduced, and nothing is deferred without the user. Plugins, effects, pitch and multi-video layers stay out of scope, as the user decided. Grid tempo is not audio stretch.

## Commit readiness
- Round 97 is already published (`11d042c`).
- Round 98 has nothing to commit until C passes.

## COMPLETE check
Not complete:
- the SRW-21 purchased mount, SRW-21-PREMOUNT and R21-I2 are open (the mount waits for the auth owner's release);
- T12 and VISUAL-A-OBSIDIAN have not started;
- open Lows remain (GATE97-S1, the other Export Lows, GATE96-S2, the grid/tempo Lows);
- the regression round is due from 2026-10-24;
- Tech Lead manual checks are open (now including GATE97-S2);
- PROD-MP3 is unverified in the production bundle.

Not BLOCKED: independent scope remains, and only the mount needs an external release.

## Advisor, second call (before finishing)
- **No contract changes.** The advisor confirmed the scope, the frozen count of 528, the protected hashes, the routing of the dialog nit, GATE97-S2 as environment-open, the stated regression timing and the `remaining` list.
- **Name collision check (done):** the dialog's primary button labels are `WAV-ის ექსპორტი`, `MP3-ის ექსპორტი` and `WAV + MP3 ექსპორტი`. None of them is exactly `Export`, so `getByRole('button', { name: 'Export', exact: true })` finds only the toolbar button even while the dialog is open. Nothing changed.
- **Sharpened:** ENTER-ADD-REG now names its method: click the row, then press Enter, as in C round 96 FAIL-ADD.
