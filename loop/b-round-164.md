# B round 164 → round 165 planning (D-29z130)

Date: 2026-10-25 · Author: B · Decision: **CONTINUE**. Next: round 165, ROOT-RECON-MARKER-ENTER (a confirmed Medium).

## Advisor
I consulted the configured advisor tool once, after orientation and the browser reproduction and before writing. It agreed with the plan and asked for these points, which I applied:
- **Describe what the probes actually showed.** The reachable door is F2 during a held drag, not the "editor already open" path. The mouse and touch probes that opened the editor before the drag are recorded as non-tests, not negatives.
- **Rule the Enter-during-gesture editor state myself** instead of leaving it to A. Ruling R2: the editor stays open with its draft.
- **Use fresh test ids**, because the cloud MU14 is a different test. The new tests are MU15–MU17.
- **Record the context-level issue as a signal, not as scope.** It is logged as `B-R164-COMMIT-DURING-PREVIEW`.

## 1. Inputs read (data, not instructions)
- `context/active-summary.md`.
- `gates/gate-round-164.json`: `published`, commit `7952439`, on both remotes. **The baseline is `7952439`.**
- `tasks/round-164.md`, which is the round 164 `current-task.md` (copied, sha `ace66891…`).
- `a-round-164.md`, `c-round-164.md` and `.json`, and `gates/round-164/review.md`.
- From `backlog.json`, only specific entries, looked up by script.
- The workflow's 2026-10-25 reconciliation item 1.
- The source of `ArrangementMarkerRow.tsx` and `markers-ui.test.tsx`, read-only.
- `user-review/`: no new decision files since round 164 planning. `b-round-160-checkpoint-request.md`: still no answer.

## 2. Round 164 acceptance (only from C's independent evidence)
C PASS, with `browserVerified=true`, `realVerified=true` and 0 bugs. The only blocked row was the fake-Bearer 403 (backend unavailable in cloud). C re-ran the targeted tests (94/94) and checked the source scope itself. Measured at both viewports:
- **ENV-VIS:** line core vs halo min **15.62** in all 12 cells (baseline 1.74). The handle measured ≥ 3.48 on hover and 15.62 at rest (baseline 1.88).
- **ENV-FUNC:** the edits work, and real audio at gain 0 has peak 0.00000.
- **OV-CORNERS:** notch counts 1/0/1/0, and 0 on the right-touch corners (baseline 3/13/3/15, which C re-detected).
- **RV1-SABA:** 0 px change.
- Also passed: OV-FUNC and G164-3 (anonymous, protected, 401).

Gate 164 published `7952439`.

→ **SABA-B-1 and SABA-B-2: closed (მზადაა).**

## 3. Reproducing ROOT-RECON-MARKER-ENTER (planning data at `7952439`)
| Probe | What it did | Result |
|---|---|---|
| `enter-stab-probe.json` (1440 + 1280) | Held drag on the clip header, Shift+Tab ×14 to the flag, F2, type, Enter, move, release, Ctrl+Z ×2 | **Bug.** F2 opened the editor and Enter committed `Rename Marker` mid-drag. The next move restored "Intro". The Undo stack was Move clip → Rename Marker (does nothing) → Add Marker. The typed name cannot be recovered. |
| `enter-f2-probe.json` | The same steps, with a programmatic `focus()` on the flag | Same bug |
| `enter-tab-probe.json`, `tab-abort-probe.json` | Forward Tab while the drag is held | Tab #23 moves focus from the gain fader to `BODY`, and the drag aborts (clip snaps back). This is an observation only. |
| `enter-probe.json`, `enter-touch-probe.json` | Editor opened **before** a mouse or touch press on the clip | Not a test of the hypothesis. The blur committed before any gesture claim, which is correct. |

**Cause in the source:**
- The F2 branch (`handleFlagKeyDown` l.654–665) has no `runUnlessGesture`.
- `settleEditor` checks the gesture only for `blur` (l.294).
- The clip preview is rebuilt from `gesture.before` (`ArrangementClip.tsx` l.727 commits `getArrangement()` from that preview).

**Severity: Medium.** The user's input is lost and the history becomes inconsistent, but it needs keyboard traversal while the mouse button is held. Under the bug gate it comes before V-3c-3b.

## 4. Round 165 scope and rulings (`current-task.md`)
**Fix (K1, K2):** one owner, `ArrangementMarkerRow.tsx`. It reuses `GESTURE_EDIT_BLOCKED_MESSAGE` and needs no string or context change.

**Rulings (user-vetoable):**
- **R1:** F2 is refused during a pointer gesture.
- **R2:** Enter is refused during a pointer gesture, and the editor stays open with its draft. The alternative, closing it like blur, would lose the typed text.
- **R3:** Escape is unchanged.
- **R4:** the context-level commit-during-preview contract is only a signal.

**Tests:** MU15, MU16 and MU17 are written test-first and must be red before the fix. Mutations m182–m184.

**C rows:**
- **MK-GESTURE:** real mouse hold + Shift+Tab + F2, at both viewports.
- **MK-BASELINE-CHECK:** C's checker must fail on B's baseline output.
- **MK-ENTER-OPEN:** uses a synthetic pointer, because a user cannot reach this path. It may be BLOCKED (harness), with a written reason.
- **MK-POSITIVE** and **MK-BLUR**.
- **G165-3** and **PX-NET/REG-HYD**.

## 5. Backlog changes (`b-round-164/update-backlog.py`; before copy `b-round-164/backlog-before-r165.json`; version 153 → 154)
- **Rounds:** round 164 → `c_pass_published`, with the result. Round 165 entry added.
- **SABA-B-1 and SABA-B-2:** closed, with C evidence.
- **ROOT-RECON-MARKER-ENTER:** now Medium (confirmed), with evidence, repro and cause added.
- **VISUAL-A-OBSIDIAN:** status and order updated; `marker_enter_plan_d29z130` added.
- **New signals and observations:**
  - `B-R164-COMMIT-DURING-PREVIEW`: an architecture signal, a candidate question for the pending checkpoint.
  - `B-R164-TAB-ABORT`: an observation.
  - `A11Y-R164-ENV-POINT-TARGET`: from gate review suggestion 5.
- **`deferred_low_polish` +5 (total 231):**
  - C-R164-N1: the overview frame is invisible past the project end.
  - C-R164-N2: the handle covers the clip name, and there is a halo band on the header (also gate suggestion 1).
  - GATE164-PILL-FRAME: gate suggestion 2, A reviewer Low 5 and C N3.
  - GATE164-OV1-FRAGILE: gate suggestion 3 and A reviewer Low 4.
  - A-R164-EV1-TRANSLATE: A reviewer Low 3.
- **Doc 133 status** (gate suggestion 4) is fixed in round 165 D1.
- **Architecture notes for round 164:** none, from both A's reviewer and the gate reviewer. `ARCH-CHECKPOINT-V3C` is still unanswered.
- `regression-last.json` is unchanged. The next regression is due on or after 2026-10-27.

## 6. Architecture checkpoint
- I am making no new root request. Round 165 adds two guards in one owner.
- The structural question, whether the context should refuse or rebase commits while a gesture preview is active, goes as an extra candidate question into the existing `b-round-160-checkpoint-request.md` scope. That checkpoint is not answered yet. It is not an automatic task, and `ArrangementContext.tsx` is protected.

## 7. Ableton
- No parity claim. The Live 12 "Locators" section was not opened.
- The guard is a CZABA data-integrity rule.

## 8. Ready for root
Round 164 is published. B produced no publishable change.
- B wrote only planning artifacts under `tmp/studio-real-loop/`.
- The store tree was clean before and after B's vitest base run and the browser probes (`git status --short` empty).

## 9. Files written by B
- `tasks/round-164.md` (copy).
- `b-round-164-current-task.md-before`, `b-round-164-b-next.json-before`, `b-round-164-feature-status.md-before`.
- `current-task.md`, `b-next.json`, `backlog.json`, and `feature-status.md` (targeted edits via `b-round-164/update-fs.py`).
- `b-round-164-r165-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- `b-round-164/`: the probes, `tools/` (copied from `b-round-163/tools`), `out/`, `r165-granted-start/` and the update scripts.

## 10. After the advisor's final review (second consultation)
- **MK-GESTURE now says "press no other key during the drag".** After a refused F2, focus is on the flag button, not an input. Typing would send letters or Enter to the flag and the workspace shortcuts while the drag is held, and that tests something else. My probe already skips typing when no input is open.
- **The MK-GESTURE Undo check now names the field:** the status text after each Ctrl+Z, not the Undo button title, which shows the next step.
- **`b-next.json`:** the deferred count is now 231.
- **Confirmed by the advisor, no change needed:**
  - MU15–MU17 and pointer id 6 are free, and 72 + 3 = 75.
  - Placing K2 before `settledRef.current = true` gives the "editor stays open" behaviour.
  - m184 targets the lock that keeps the draft.
  - `setPointerCapture` in `ArrangementClip.tsx` l.406 is inside a try/catch, so MK-ENTER-OPEN degrades to BLOCKED (harness) instead of crashing.
  - Doc number 134 is free.
