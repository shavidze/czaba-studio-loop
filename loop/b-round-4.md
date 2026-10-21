# B — Round 4 decision record

Date: 2026-10-08 · Author: B (task writer / dispatcher)

**Advisor.** Available. Called once after orientation and before writing; its advice was applied (see §5). A second call follows after writing (§8).

**Subagents.** B's session has no Agent tool, so B cannot run `design-philosopher`. Round 5 requires A to invoke it, narrowly, for the tree fix and the cross-lane ghost.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `tasks/round-4.md`: a byte-identical copy of the round-4 `current-task.md` (`cmp` OK). The original was replaced by round 5, not deleted.
- `a-round-4.md`, `c-round-4.md`, `c-round-4.json`, `backlog.json` v4, `plan.md`, `b-initial.txt` (full original scope), `b-round-3.md`, `b-next.json`.
- `root-pre-push-review.md` (§2–§4), `publication-checkpoint.json` (user steering: real Store only, scrollbars/library/entry priorities, T12 after original scope, final-only commit/push by root, advisor/context policy).
- Docs 012 (lines 108–133) and 013 (status, TODO).
- Source: `ArrangementClip.tsx` (gesture code 50–310), `StudioWorkspace.tsx` (whole), `model.ts` (whole), `selection.ts` (whole), `types/arrangement.ts`, `ArrangementContext.tsx` (nudge/split/delete/undo/redo 1091–1240), grep of `ArrangementLoopBrace`/`ArrangementRuler` gesture code, `studio-lab-demo.ts` labels, `ArrangementLibrary*` truncation and peaks code.
- Prototype duplicate (`workspace.js` 3073–3119) and Ableton CLP/EDT rows.
- `git status`: HEAD `cc1e531` + 18 M + 12 ?? (round-4 work, identical to C's `git-status-start.txt` count).

## 2. Backlog changes (only what C evidenced)

| Item | Before | After | Evidence (c-round-4) |
| --- | --- | --- | --- |
| SRW-02 | in_progress | **done** | R2-V3 playback via RF4-1: 5/5 (3 same-load + 2 reload), no seek/swap at the continuous boundary. It was SRW-02's only failing part. |
| SRW-11A | in_progress | **done** | R11A-1..3 PASS. |
| SRW-12 | in_progress | **done**, with open Low bugs C-R4-03, C-R4-04 and A-R4-L9 | R12-L1..L5, R12-S1, R12-S2, R12-U PASS (R12-L4 synthetic DnD; real mouse on the Tech Lead list). |
| SRW-22 | in_progress | **done** | R22-1..4 PASS. |
| SRW-23 | in_progress | **verified_except_manual_visual** | R23-3/4 PASS; R23-1 blocked (headless hides scrollbars), R23-2 keyboard PASS, wheel/thumb drag not possible in gstack. Not done until the Tech Lead check. |
| SRW-03 | in_progress | in_progress | R3-V1 via RF4-1: same-load 9/10 (after 2 starvation re-runs), reload 2/5. RF4-3 PASS. |
| SRW-05 | in_progress | in_progress | R5-L6 via RF4-2: 4/5. The l6_5 symptom (frames past `loop.end`) is gone: 15/15 wraps via standby swap. |
| SRW-01 / SRW-05 | — | + open bug **C-R4-02** (Medium) | Gesture re-entry leak, clip and brace. |
| SRW-07/08/09 | todo | **dispatched (round 5)** | Acceptance rewritten with oracles (D-25). |

Bugs:
- **Resolved:** C-R3-03 (RF4-3), C-R3-04 (R4-B2), C-R3-05 (R4-B1), C-R3-06 (R4-B3).
- **Superseded by C-R4-01:** C-R3-01 and C-R3-02. The mechanisms behind them are fixed and verified; only the tolerance under load remains.
- **Root review:** L1, L2, L3, L4, L8, M1, M2 resolved by C. L6 routed (R5-B4). L5, L7 accepted. **M3:** C §7 lists it as open, but doc 012 lines 126–131 already contain the corrected TODO (RF3-1 counts, R5-L3, R5-L5/E1/R6-S2/S3). B keeps M3 resolved and reads C's listing as carried over from the root review text. Doc 013's status is updated in round 5 (§5.5) so the docs stay honest.

Gates re-run by C: tsc 0; vitest 45 files 654/654; build OK; Biome 0 errors; 4 protected hashes OK.

Purchase protection preserved: anonymous `/api/studio-token` → 401; a fake Bearer → 500 and no token; `/studio/middle-east` → "Sign in required"; `/studio-lab` (direct and via the header link) makes no auth/R2/download traffic.

## 3. C's bugs → routing (bugs first)

| Bug | Decision | Where |
| --- | --- | --- |
| C-R4-02 (Medium) | **D-23:** re-entry on a component with an active gesture is ignored; every `beginPointerGesture()` gets exactly one `release()`. Ignoring (not the ruler's release-first) keeps the first drag intact. Component tests that would fail on the old code. | R5-B1, R5-B1u, R5-B1r |
| C-R4-01 (Medium) | **D-24**, two halves. App: stall escalation to seek-and-hold when the rate sits at the band edge and |d| does not shrink (fixes Lr5, where the decoder could not follow rate 2.0 and the app waited for the 1.0 s limit). Measurement: stall-exclusion windows (LoAF / rAF gap ≥ 50 ms → end + 300 ms), capped at 10 % per run, max 5 invalid re-runs, raw series always reported. Thresholds unchanged. | RF5-1, RF5-1b, RF5-2, RF5-U |
| RF4-3 text conflict (C §2) | Hold = paused **until `play()` is issued**; `play()` ≥ `startAt − min(frameInterval, 20 ms)`; shown media time may not advance before `startAt` by more than one frame. | RF5-3 |
| C-R4-03 (Low) | Outcome criterion: every tree node fully readable at 288 px (no ellipsis, ≤ 3 lines), collections distinguishable; list ≥ 140 px. Overrides the design-philosopher `w-24` ruling; A re-consults it. | R5-B2 |
| C-R4-04 (Low) | Display-only normalisation of the **preview** waveform. Lane clip waveforms stay un-normalised so SRW-13 clip gain will remain visible. | R5-B3 |
| root L6 (Low) | Export dialog wording with the loop on. | R5-B4 |
| A-R4-L9 (Low, A self-reported) | Preview waveform as a keyboard slider; empty message out of the listbox. Routed so no known in-scope bug stays open. | R5-B5 |

## 4. Why D-24 is honest and not goalpost-moving

- C measured it: every failing light-harness run had a coincident long task / rAF gap of 50–117 ms whose LoAF script attribution was ≈ 0 ms; the machine was running Brave, ChatGPT and a VS Code installer. Quiet runs (L1–L5, L7, L9, L10, H1–H3) passed.
- The tolerance is not relaxed. Excluding stall windows follows the same logic as the existing hard-seek exclusion (no frame can be presented on time during a stall). The 10 % cap and the 5-re-run cap stop the exclusion from swallowing a run. Any failure outside a stall still fails, and the raw series is reported next to the verdict series.
- The part that **is** app-attributable (Lr5: the decoder could not follow rate 2.0) gets a code fix and its own criterion (RF5-1b), which fails if a growing episode runs > 600 ms without an escalation.
- The Tech Lead's real-Chrome check on a quiet machine remains the closing evidence for the environmental half. It is a manual item, not a BLOCKED claim.

## 5. Round 5 scope and rationale

**Track S** = the bugs above. **Track U** = the next dependency-ordered unimplemented scope: SRW-07 → SRW-08 → SRW-09 (all depend on SRW-06/SRW-04, both done; plan.md already sequenced them as round 5). Per-item "not ready" lists, so an unfinished SRW-09 does not cost SRW-07/08 their verification.

Smallest honest choices for uncertain UI contracts (D-25):
- **Duplicate:** prototype semantics (copies at `start + span` on the same lanes, all-or-nothing, one entry, copies selected, refused with a range). Keyboard + footer hint only; no transport button, because R4-B3 just verified stable transport boxes.
- **Group split:** split every selected clip crossed by the playhead; replaces the round-3 refusal.
- **Lane-move modifier:** **Shift held during the drag**, read on `pointermove`. Ctrl/Cmd and Shift at `pointerdown` already toggle/add selection (D-18), so backlog v4's "Ctrl" would conflict. Recorded in `backlog.json` (`SRW-08.modifier_change`).
- **Gesture survival:** the dragged clip must not unmount mid-gesture when it crosses lanes (ghost on the target lane, commit on release); D-20/D-23 apply.
- **Clipboard:** internal memory only (no `navigator.clipboard` permission prompt, no PII), not in history. Copy: range-track window (leading gap kept) or selected clips. Cut keeps the gap. Cut Time is exactly `deleteTime` plus all-lane material. Paste at the playhead (D-15); single-audio-lane material goes to the active audio track (same rule as Enter/＋, R1-B1), otherwise original lanes; all-or-nothing refusal. Delete with a range stays Delete Time (D-09).
- **Header.tsx** is frozen this round (its round-4 diff must stay byte-identical).
- **Baseline:** the tree is dirty with C-verified round-4 work; the task lists it exactly, forbids reverting it, and G5-2 compares against it.

Nothing was removed, deferred or marked optional. SRW-10, SRW-11B, SRW-13..SRW-20, SRW-21 (adapter part) and T12 remain queued in dependency order.

## 6. Decision

**CONTINUE.**

COMPLETE is not met:
- open bugs: C-R4-01, C-R4-02 (Medium), C-R4-03, C-R4-04, A-R4-L9, root L6 (Low);
- SRW-03 and SRW-05 have failing acceptance; SRW-23 awaits the Tech Lead's visual check;
- SRW-07..SRW-10, SRW-11B, SRW-13..SRW-20 are not evidenced; SRW-21's adapter part is not done;
- T12 Gain/Volume is queued after the original scope (user instruction).

BLOCKED does not apply: no external information, approval or credentials are needed for the next round. SRW-21's route mount stays blocked only on the protected file; its adapter part is independent. The Tech Lead manual checks (real mouse, real Chrome) are listed in `backlog.json` → `tech_lead_manual_checks` and are needed before COMPLETE, but they do not block current work.

## 7. Files written by B this round

- `tmp/studio-real-loop/tasks/round-4.md` (copy, verified identical)
- `tmp/studio-real-loop/current-task.md` (round 5)
- `tmp/studio-real-loop/backlog.json` (v5; v4 backed up in `%TEMP%\b-r4\backlog-v4.bak.json`)
- `tmp/studio-real-loop/b-round-4.md`, `tmp/studio-real-loop/b-next.json`
- `docs/technical/studio-real-workspace/plan.md` (status line, D-23..D-25, FB-02/03/15 rows, rounds table, status section)

Helper scripts: `%TEMP%\b-r4\backlog-v5.js`, `%TEMP%\b-r4\plan-r5.js` (outside the repo). No app source, protected file or other agent's file was touched.

## 8. Second advisor call (after writing) and fixes applied

The advisor reviewed the written artifacts and found criteria that would have failed a correct implementation. All are fixed in `current-task.md`, and mirrored in `plan.md` D-23/D-24 and `backlog.json`:

1. **R5-B3** asked for a bit-identical stem export (maxDiff 0). R12-S1 measured 8.94e-8 (24-bit quantisation). Now: within 2⁻²² + quantisation.
2. **Two re-run rules overlapped** (RF4-1's 2 starvation re-runs and D-24's 5 invalid re-runs). D-24 now explicitly replaces the RF4-1 rule.
3. **RF5-1b vs the 1.0 s escalation limit.** A correct dock could exceed 600 ms inside the post-seek window. The episode clock now counts only non-excluded time, and the 1.0 s limit is measured from the previous escalation's `seeked`.
4. **The stall exclusion would have excused app JS.** It now covers only LoAF with < 10 ms of app script, or rAF gaps without app script. App-attributed long tasks count against the app.
5. **D-23 could deadlock a clip** after a missed pointerup. A same-pointerId pointerdown now ends the stale gesture (release, revert preview, no history) and starts anew; a different pointerId is ignored. A test was added to R5-B1u.
6. **R5-B5 slider keys** would reach the global Home and Space handlers (transport seek/start). Space/Enter now toggle the preview locally; Home/Space must not reach the global handlers; the transport position must stay unchanged.
7. **R12-L1 regression risk.** If A shortened the synthetic label, `ბასი დემო` could stop matching. The synthetic label must keep "სინთეზური დემო".

Also: R9-C3 compares by lane and time, not by ids (ids differ after a reload); the R5-B1u wording no longer suggests a git stash.
