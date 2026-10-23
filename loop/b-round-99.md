# B round 99: review of round 99 → round 100 task (D-29z65)

Dispatcher: B · Date: 2026-10-23
- **Advisor:** configured and available. I called it once after orientation, before writing anything, and once at the end (see the last section).
- **Project subagents:** none consulted.

## Inputs read
- **Active context:** `context/active-summary.md` (head and status) and `context/active-backlog.json` (size only). I opened `backlog.json`, `feature-status.md` and `plan.md` only by ID.
- **Round 99 files:**
  - `current-task.md`, archived unchanged as `tasks/round-99.md` (sha256 `b8315fe9…`, identical; the archive did not exist before);
  - `a-round-99.md`, `c-round-99.md`, `c-round-99.json`.
- **Gate:** `gates/gate-round-99.json` says **published**, commit `e2412db`, on both remotes. This is the round 100 baseline. I also read `gates/round-99/review.md` (9/10, three Lows, Architecture note).
- **Environment:** `env-status.json` (store 200) and `regression-last.json` (2026-10-21).
- **App source, read only, at `e2412db`:** `ArrangementLibraryPreview.tsx` l.195–210 and l.270–320, `ArrangementExportDialog.tsx` l.240–275 and l.480–576, `Modal.tsx` l.200–232, and `library-preview.test.tsx` and `held-enter-add.test.tsx` (structure).
- `git status --short` in `store/` was empty. Everything I read was treated as data.

## Round 99 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs.
- **Passed:**
  - HOLD-ROW, HOLD-BODY and HOLD-PLUS at both viewports: 0 → 1 clip, with keydowns false/true/true;
  - FRESH-ADD: +2, +2, +1, and double-click +1;
  - HELD-ARROW-REG, SPACE-REG and CLOSE-HOLD-REG;
  - EXPORT-REG: a real WAV, 48 kHz, 2 ch, 24-bit, 101.352 s;
  - PX-NET, REG-HYD and G99-3;
  - AN-REVIEW: C's own mutations a, b, c and g match A's;
  - T99-TARGETED (55 files / 969 tests) and SOURCE-UNCHANGED.
- **Blocked:** the fake-Bearer sub-check (backend unavailable in the cloud). It stays open evidence, not a bug.
- **Notes:**
  - N1: concurrent route loading invalidated one run. This is now a setup rule.
  - N2: full-scale samples in the WAV, the existing DEMO-SFX-FULL-SCALE pattern.
  - N3: the row stops propagation, by design.
  - N4: `root-pre-push-review.md` and `publication-checkpoint.json` date from round 3 and add no remaining findings.
  - N5: superseded by the probe below.

## B's probe (read-only, Chromium, 1280×720)
- **Script:** `b-round-99-probe/probe-toggle.cjs`. Results are in `probe-toggle-result.json`, with screenshots.
- **Method:** decline consent, wait until Middle East is ready, click the row, `locator.focus()` on ▶ მოუსმინე. A capture recorder logged keydowns, clicks and label changes.

| Case | Keydowns | Clicks on the toggle | Label sequence |
|---|---|---|---|
| held3 (`down` ×3, 50 ms) | false/true/true | **3** | ▶ → ■ → ▶ → ■ |
| fresh1 (`press`) | false | 1 | ▶ → ■ |

- **Confirmed fact:** in real Chromium a held Enter on the toggle starts and stops the preview once per auto-repeat.
- **Method consequence:** with 3 keydowns the end state is ■ both with and without the fix. C therefore uses 4 keydowns, where the end state discriminates (▶ without the fix, ■ with it), plus the click count and the label log.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| B-R98-HELD-ENTER-MULTI-ADD | → **closed** | C round 99 HOLD-* rows + gate 99 |
| GATE98-S5-DOC086-STATUS | → **closed** | C SOURCE-UNCHANGED + gate 99 |
| B-R98-H1-PREVIEW-TOGGLE-HOLD | hypothesis → **confirmed Low**, → round 100; `open_bug` on SRW-12 | B probe; gate 99 #2 |
| GATE99-S1-DOC087-STATUS | **new** Low → round 100 | gate 99 #1 |
| GATE99-S3-INLINE-ARROW-KEYDOWN | **new** info, keep | gate 99 #3 |
| C-R99-N1-CONCURRENT-ROUTE-LOAD, C-R99-N2-N5-INFO | **new** info | C notes |
| GATE97-S2 | data point: the Firefox behaviour was reasoned from the spec, not tested | gate 99 |
| ARCH-R97-EXPORT-FOOTER-KEYBOARD, ARCH-R93-TEST-HARNESS | data points (6 guard sites; ~60th harness copy) | gate 99 + A reviewers |
| rounds / baseline_tree_at_round100 / version 98 | round 99 → `c_pass_published`; round 100 dispatched | — |

- **SRW-12 restore note:** before round 99, SRW-12's status on the board was **მოწმდება** (functions C-verified; Tech Lead R12-L4, R17-T and R34-T remain). After a C PASS on round 100, the next B returns it there.
- **Backups:** `b-round-99-backlog-before.json`, `b-round-99-feature-status-before.md`, `b-round-99-plan-before.md` and `b-round-99-b-next-before.json`.
- **Scripts:** `b-scripts/b-round-99-backlog.py`, `-feature-status.py` and `-plan.py`.

**Round 100 baseline files:**
- **The frozen list** `b-round-99-r100-tree-sha256.txt`: **531/531 OK** at `e2412db`. That is the 534 tracked `app/**`, `docs/implementation/**` and `vite.config.ts` files minus the 3 owned ones. The protected hashes match the earlier rounds.
- **The snapshots** in `b-round-99-r100-snapshots/`:
  - Preview `f074a9bb`, 320 lines;
  - `library-preview.test.tsx` `b42334fc`, 287 lines;
  - doc 087 `38cbeb22`, 81 lines.

  All three are LF with CR=0. A's round 99 end hashes are now the HEAD content.

**Status board:**
- SRW-12 → **ბაგია** (round 100).
- The two closed rows and the new rows are updated.
- No scoped item moved to მზადაა.
- `regression-last.json` is unchanged.

## Round 100 task (summary)
**A held Enter on ▶ მოუსმინე toggles the preview once** (D-29z65). Baseline `e2412db`, clean tree. Expected end state: **3 M + 1 ??**.
- **T1:** the toggle `<button>` (l.281–303) gets `onKeyDown`: `Enter && event.repeat` → `preventDefault`. There is no `stopPropagation`, and nothing else changes.
- **Tests:** `library-preview.test.tsx` gets HT1–HT3, appended after l.285 with no existing line changed. This reuses the file's harness instead of making another copy. The expected fail-before is HT1 red. Mutations a–d.
- **Docs:** doc 087 l.4 and a new doc 088.
- **C rows:**
  - primary: HOLD-TOGGLE at both viewports (4 keydowns, 1 click, one label change, RMS > 0 by the C round 96 method);
  - regressions: FRESH-TOGGLE, WAVE-REG, HOLD-PLUS-REG, HOLD-ROW-REG and EXPORT-REG;
  - also PX-NET, REG-HYD and G100-3 (run alone);
  - test review: AN-REVIEW, T100-TARGETED and SOURCE-UNCHANGED.

## Why this scope (and not the footer Lows or a regression round)
- **The regression round is not due.** 2026-10-21 → 2026-10-23 is 2 days. **The next B planning on or after 2026-10-24 is the regression round, whatever round 100 leaves open.**
- **C has no open bug.** The gate 99 reviewer's Low #2 asked for this guard once B had reproduced it, and B now has.
  - It changes what the user hears.
  - It is the last held-Enter site on the SRW-12 panel, so closing it ends that bug family.
  - It is one hunk.
- **The footer Lows touch a different file and family.** `ArrangementExportDialog.tsx` stays frozen, and the Lows follow the regression round.
- **The user's order is kept:** finish the current work, then T12, then VISUAL-A-OBSIDIAN.

## Uncertain UI contract (smallest honest choice, with rationale)
- **One press = one toggle.** After a held Enter the preview plays; the repeats do not stop it. This matches R12-L2 (round 99) and the waveform handler.
- **No `stopPropagation`, and Space is not touched:** global Space stays the transport shortcut (D-29z64, C-R98-B1). B makes no claim about Space on the focused toggle, because nobody has observed it.
- **Rejected:** a guard in the context (frozen, and it cannot tell a key from the mouse), a debounce (it would block a fast deliberate press), and a shared helper (it touches frozen files and needs the checkpoint first).

## Ableton
- I consulted no source.
- The row is "დაუდასტურებელი".
- No Ableton claim is made.

## Architecture checkpoint (request to root)
- Gate 99's Architecture note (Signal 3, keep) counts 5 repeat-Enter sites. Round 100 makes it 6. The reviewer proposes a small shared helper (value low, risk low). A's reviewer counts the ~60th copy of the test harness.
- **Addendum (l)** was appended to `b-round-91-checkpoint-request.md`. Round 100 closes the SRW-12 held-Enter family, which is a feature boundary. So B asks root for **one bounded, read-only frontend-architect checkpoint** on (g) and (k)/(l) together.
- It is not blocking, and nothing is scheduled until root approves.

## Next
1. **Round 100 (this task).**
2. **The next B planning, on or after 2026-10-24: the regression round.**
   - C checks each done or c_pass item once in the browser at both viewports, and runs `npm run test:e2e:smoke`.
   - A fixes only what C finds.
   - B updates `regression-last.json` when the round closes.
3. **The Export footer Lows:** GATE89-S4 + A-R88 #4 + GATE97-S4, then GATE89-S6.
4. **Then:** GATE89-S3, C-R90-MUT-B-CU4-GAP and A-R87-LOW-PU-ORDER → GATE96-S2 → grid/tempo Lows → R21-I2 → T12 → VISUAL-A-OBSIDIAN.
5. **When the auth owner releases the mount:** SRW-21-PREMOUNT, then the mount.

Scope is not reduced, and nothing is deferred without the user. Plugins, effects, pitch and multi-video layers stay out of scope, as the user decided. Grid tempo is not audio stretch.

## Commit readiness
- Round 99 is already published (`e2412db`).
- Round 100 has nothing to commit until C passes.

## COMPLETE check
Not complete:
- SRW-12 has an open Low (round 100);
- the SRW-21 mount, SRW-21-PREMOUNT and R21-I2 are open;
- T12 and VISUAL-A-OBSIDIAN have not started;
- open Lows remain;
- the regression round is due from 2026-10-24;
- the Tech Lead manual checks are open;
- PROD-MP3 is unverified.

Not BLOCKED: independent scope remains, and only the mount needs an external release.

## Advisor, second call (before finishing)
- **Confirmed, with no scope or decision change:**
  - CONTINUE;
  - the 4-keydown discriminator;
  - HT1 red at baseline, with HT2 and HT3 as locks;
  - the appended `it`s inside the existing `describe`;
  - the cited RMS method (`c-round-96/tools/r96.cjs` l.23);
  - G100-3 run alone;
  - the end state 3 M + 1 ?? and the regression timing.
- **Changed in `current-task.md`:**
  - **Pre-edit repro:** A copies the probe to `a-round-100/` and runs it there. Run inside `b-round-99-probe/`, it would overwrite B's cited evidence.
  - **Space wording:** the unobserved claim about "a held Space fires one click on keyup" is removed. Only the C-observed global Space rule (C-R98-B1) stays. This file was corrected the same way.
- **Re-checked after the edits:** `git status --short` in `store/` is empty, and the frozen list is 531/531 OK.
