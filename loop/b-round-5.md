# B — Round 5 decision record

Date: 2026-10-08 · Author: B (task writer / dispatcher)

**Advisor.** Available. Called once after orientation and before writing; its advice was applied (see §5). A second call follows after writing (§8).

**Subagents.** B's session has no Agent tool, so B cannot run `design-philosopher`. Round 6 requires A to invoke it, narrowly: overview placement, transport controls, list titles.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `tasks/round-5.md`: a byte-identical copy of the round-5 `current-task.md` (`cmp` OK). The original was then replaced by round 6, not deleted.
- `a-round-5.md`, `c-round-5.md`, `c-round-5.json`, `backlog.json` v5, `plan.md`, `b-round-4.md`, `b-next.json`.
- `root-pre-push-review.md` and `publication-checkpoint.json` (user steering: real Store only; library/stems/scrollbars/entry; T12 after the original scope; final-only commit/push by root; advisor/context policy).
- Source (read only): `StudioWorkspace.tsx` (whole), `ArrangementRuler.tsx` (whole), the zoom slider in `ArrangementTransport.tsx`, the `ArrangementVideoDock.tsx` strip layout, the list rows in `ArrangementLibrary.tsx`, `togglePlayback`/`beginPointerGesture` in `ArrangementContext.tsx`, the escalation constants in `video-sync.ts`, and the clip waveform rendering (SVG path, one column per px).
- Prototype navigation (`workspace.js` ~110–125, 1865, 2135–2345, 2775–2890, 3315–3355, 3451; `index.html` lines 8 and 18) and Ableton NAV-01..07 and TRN-05.
- `git status`: HEAD `354e341` + 19 M + 4 ??. This is round-5 work that C verified. The round-4 baseline in the round-5 task was already committed by root (`354e341`), which A recorded as deviation 8.

## 2. Backlog changes (only what C evidenced)

| Item | Before | After | Evidence (c-round-5) |
| --- | --- | --- | --- |
| SRW-07 | dispatched | **done** | R7-D1..D5, R7-U PASS (export maxDiff 0 / 1.19e-7). |
| SRW-08 | dispatched | **done**, with open C-R5-02 (Medium), C-R5-03 (Low) and the Shift-hint note | R8-M1..M5, R8-U PASS (synthetic pointers; real mouse on the Tech Lead list). FB-03 done. |
| SRW-09 | dispatched | **done**, with open C-R5-04 (Low) | R9-C1..C5, R9-U PASS. FB-02 done. |
| SRW-05 | in_progress | **done** | R5-L6 via RF5-2 5/5 (15 wraps, all swaps); R5-L1..L5, E1 regression PASS. A quiet real-Chrome check remains in the Tech Lead list. |
| SRW-03 | in_progress | **verified_except_manual**, with open B-R5-01 | R3-V1 via RF5-1 PASS (same-load 9 + 1 invalid re-run, reload 5/5), RF5-3, RF5-U, R3-V2/V3/V4 PASS. **Caveat:** RF5-1b passed vacuously (0 natural episodes). C also showed that the 1.0 s interval breaks RF5-1b under persistent lag. Not called done. |
| SRW-12 | done | done, with new open C-R5-01 (Low) | C-R4-03, C-R4-04, A-R4-L9 resolved (R5-B2, R5-B3, R5-B5). The tree fix narrowed the list column → C-R5-01. |
| SRW-04 | done | done, with open C-R5-05 (Low) | Pre-existing restart-at-0 behaviour, routed as a product decision (D-27). |
| SRW-10 | todo | **dispatched (round 6)** | Acceptance rewritten (D-28). |

Bugs:
- **Resolved:**
  - C-R4-01 (RF5-1/RF5-2 under D-24);
  - C-R4-02 (R5-B1/B1u/B1r; clip and brace);
  - C-R4-03, C-R4-04, A-R4-L9;
  - root L6 (R5-B4).
- **New:**
  - C-R5-02 Medium (pre-existing, extended by the cross-lane commit; same as code-reviewer #7 and A's known gap);
  - C-R5-01, C-R5-03, C-R5-04, C-R5-05 Low;
  - B-R5-01 (B-derived from C's RF5-1b note: escalation interval vs. criterion).
- **Root M3:** B still reads doc 012 lines 126–131 as corrected. C §7 lists it open again, so round 6 asks A to re-check and C to cite the lines (R6-D1). The two sides now resolve it on evidence, not by assertion.

C re-ran the gates: tsc 0; vitest 47 files 709/709; build OK; Biome 0 errors (218 pre-existing warnings); 4 protected hashes OK.

Purchase protection is preserved:
- anonymous `/api/studio-token` → 401;
- a fake Bearer → 500 and no token. The backend was down, so this proves only that no token was issued;
- `/studio/middle-east` → "Sign in required";
- `/studio-lab` makes no auth, R2 or download traffic. Media is only the 2 public MP3s.

## 3. C's bugs → routing (bugs first)

| Bug | Decision | Where |
| --- | --- | --- |
| C-R5-02 (Medium) | **D-26:** one edit gesture at a time, workspace-wide. A second pointer's pointerdown on any clip, brace, lane background, ruler or playhead is ignored. A same-pointer pointerdown ends the stale gesture, so nothing deadlocks. Arrangement commands mid-gesture are refused; this includes the Volume slider, which is not a gesture. A gesture's ghost/hint state is owned by that gesture. Rebasing commits onto the current state was rejected as the larger, riskier change. | R26-1..3, R26-U |
| B-R5-01 | **D-24a:** the escalation interval is 600 ms from the previous `seeked`. The worst case is then ≈ 320 ms of counted time, inside `T` + 150. C's forced persistent-lag diagnostic becomes a verdict (≥ 3 consecutive escalations), so the criterion is no longer vacuous. | RF6-1, RF6-2, RF6-U |
| C-R5-05 (Low) | **D-27:** if the position is beyond `projectEnd`, Play does not start, the position is kept and a status message explains why. At the end after a natural stop, Play restarts from 0 as before. Rationale: D-15 says the playhead is the insert position; restarting at 0 loses it (seek 20 → Space → paste at 0). Playing silence past the end would need a transport that never auto-stops. | R27-1, R27-U |
| C-R5-01 (Low) | Outcome criterion on the list itself: no ellipsis, ≤ 2 lines, 9/9 distinct visible titles at 288 px. R5-B2's "list ≥ 140 px" is what let the regression through. | R6-L1 |
| C-R5-03 (Low) | The ghost text stays inside the ghost; the refusal reason goes to the footer drag line. | R6-G1 |
| C-R5-04 (Low) | The lane-kind refusal names the time. | R6-P1 |
| C note (Shift hint) | `ჩაიკეტება` before Shift is held, `ჩაკეტილია` while it is held. | R6-H1 |

## 4. Uncertain UI contracts — the smallest honest choice (D-28)

- **The ruler seek moves from pointerdown to release** (< 4 px). Otherwise a drag-to-zoom would seek first. TRN-05 semantics are unchanged (stopped: no play start). R1-B8 is in the regression list.
- **Zoom range 0.5–320 px/s with a log slider.** The current [10, 200] clamp makes the backlog's own "Fit on a 4-minute project" impossible (≈ 3.75 px/s needed). The 0.5 floor covers D-14's 20-minute limit. Ruler ticks adapt so labels stay ≥ 40 px apart.
- **The overview sits in the existing dock strip,** left of the video box, as in the prototype. It costs no height (R11A-3) and reads the position store, not the per-frame context (root M2).
- **Follow** follows prototype/NAV-06: manual navigation while playing pauses it, and Follow or Play resumes it.
- **Ctrl+wheel** is verified with a synthetic `WheelEvent` (gstack has no wheel). Real wheel and trackpad are added to the Tech Lead list.
- **The zoom history is outside the edit history.** Undo never changes the view. Ctrl+X stays Cut; plain X is zoom back.

## 5. Round 6 scope and rationale

**Track S** = the bugs above plus docs honesty (doc 014 status; doc 012 root-M3 check).

**Track U** = SRW-10, the next dependency-ordered unimplemented scope (it depends on SRW-04, which is done; plan.md slot 6). SRW-10 alone is large: ruler gesture semantics, wheel/keys, zoom history, overview, Follow, Fit and the zoom floor. It also touches the same layout files as SRW-11B, so SRW-11B (now unblocked: SRW-03 verified_except_manual, SRW-11A done) is the next Track U item. SRW-16 (markers) also shares the ruler. This is ordering, not shrinking: nothing was removed, deferred or marked optional.

Still queued in dependency order: SRW-11B, SRW-13..SRW-20, the SRW-21 adapter part, SRW-23's manual check and T12 Gain/Volume.

**Carried root and publication findings.** None of these is A scope:
- purchased `/studio/:productId` loader hardcodes `middle-east` (High, inherited, protected) → SRW-21 / Tech Lead;
- `api.studio-token` category whitespace and the Studio vs. download `userId` hash mismatch (Medium) → auth agent / Tech Lead;
- `AGENTS.md` / `.codex` portable paths (Medium) and the root cookie banner covering the footer → root owner;
- root L5 and L7 → accepted.

## 6. Decision

**CONTINUE.**

COMPLETE is not met:
- open bugs: C-R5-02 (Medium), B-R5-01, C-R5-01, C-R5-03, C-R5-04, C-R5-05 and the Shift-hint note (Low);
- SRW-03 awaits D-24a and a real Chrome check; SRW-23 awaits the Tech Lead's visual check;
- SRW-10, SRW-11B and SRW-13..SRW-20 are not evidenced; SRW-21's adapter part is not done;
- the Tech Lead manual list is open;
- T12 Gain/Volume is queued after the original scope (user instruction).

BLOCKED does not apply: no external information, approval or credentials are needed for the next round. SRW-21's route mount is blocked only on the protected file; its adapter part is independent.

## 7. Files written by B this round

- `tmp/studio-real-loop/tasks/round-5.md` (copy, verified identical)
- `tmp/studio-real-loop/current-task.md` (round 6)
- `tmp/studio-real-loop/backlog.json` (v6; v5 backed up in `%TEMP%\b-r5\backlog-v5.bak.json`)
- `tmp/studio-real-loop/b-round-5.md`, `tmp/studio-real-loop/b-next.json`
- `docs/technical/studio-real-workspace/plan.md`:
  - D-24a, D-26, D-27, D-28;
  - FB-01/02/03/16 rows;
  - rounds table;
  - status section.
  - Backup: `%TEMP%\b-r5\plan.bak.md`.

Helper scripts are outside the repo: `%TEMP%\b-r5\backlog-v6.js`, `plan-r6.js`, `task-fix.js` and `b5-fix.js`. No app source, protected file or other agent's file was touched.

## 8. Second advisor call (after writing)

The advisor reviewed the written artifacts. All findings are fixed in `current-task.md` and mirrored in `plan.md` D-28 and `backlog.json` SRW-10:

1. **Follow during a drag.** With Follow on, the timeline would scroll under a pointer-anchored clip drag while playing. Follow is now suspended during any active pointer gesture (Ableton NAV-06 also stops on edits). R10-N4 has a drag-while-playing check, and R8-M1/R8-M5 are re-run while playing with Follow on.
2. **R26-3 synthetic stale repro.** It needs `buttons: 1`; under round-5 deviation 1, a pointerdown with buttons 0 starts no gesture. This is now in R26-3 and the harness notes.
3. **Fit is now defined.** zoom = (scroller.clientWidth − header − 4) / extent, scrollLeft 0. Scrolling into the 30 s tail is allowed.
4. **Ruler double-click.** Two release-seeks happen first, then Z/Fit. No delayed-click timer.
5. **R10-N3 frame ratio.** It applies only when the viewport shows less than the extent.
6. **R10-N1/N2 anchor.** A mark visible at the current zoom is used, since 30 s is off-screen at the default zoom.
7. **R10-N6 attribution.** No start/stop within ±50 ms of a navigation action, and the counts equal a control run without navigation.
8. **Doc 013 was stale.** It still showed C-R4-01..04 as open. It is now in §2.2/§6.5 and in R6-D1.
9. **Superseded rules.** plan.md D-15 and D-24 now point to D-27 and D-24a. b-round-5 §8 is filled in.

Also stated explicitly: under D-26, Mute/Solo/Volume are refused during a playhead scrub, a marquee or a ruler drag too. This is intended, not a bug.

The advisor confirmed the D-24a arithmetic, that D-27 does not collide with D-17/R4-P3, and that the 0.5 px/s floor fits a 20-minute extent (≈ 0.69 px/s needed at 1280). It also confirmed that CONTINUE is right.
