# B — Round 2 decision record

Date: 2026-10-07 · Author: B (task writer / dispatcher)

**Advisor.** The `advisor` tool was available and I called it once, after orientation and before writing. It returned "temporarily overloaded", so I received no advice this round. Every decision below is B's own.

## 1. Inputs read

**Previous task.** `tasks/round-2.md` is a byte-identical copy of the previous `current-task.md` (checked with `cmp`). The original was replaced by the round-3 task, not deleted.

**Loop documents:**
- `a-round-2.md`, `c-round-2.md`, `c-round-2.json`;
- `backlog.json`, `b-initial.txt` (the original full scope), `plan.md`, `orchestrator-decisions.md`;
- `next-stage-t12/README.md`.

**Spot-checks of C's evidence:**
- `c-round-2/vitest-all.txt` EXIT=0, `tsc.txt` TSC_EXIT=0, `build.txt` BUILD_EXIT=0;
- `hashes-final.txt`: 4× OK;
- `r3v1_7.json`: median 0.0757, max 0.1368. This matches C's table.

**Source read to make round 3 concrete:**
- `ArrangementVideoDock.tsx` (whole file; the seek logic is at 84–111), `video.ts`, `transport.ts`, `schedule.ts`, `graph.client.ts`, `model.ts`, `types/arrangement.ts`;
- `ArrangementContext.tsx` (whole file);
- `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, `StudioWorkspace.tsx`, `components/arrangement/index.ts`.

**Prototype `workspace.js`, read for behaviour only:**
- loop brace (1893–2035), loop toggle and selection (2919–3000), loop remap in `deleteTime` (3174–3185);
- selection, group move and delete (174–235, 770, 1131, 1266, 3043);
- `frame()` rAF wrap (3399).

**Ableton rows:** LOOP-01..06, CLP-06/07/08, EDT-03.

**C baseline:** P5, P7, T5, T7. The baseline notes that the prototype has no marquee.

## 2. Backlog changes (only what C evidenced)

| Item | Before | After | Evidence |
| --- | --- | --- | --- |
| SRW-01 open bugs C-R1-01..04 | open (Low) | **resolved** | C R2-F1..F4 PASS |
| SRW-02 | in_progress | **in_progress** | C passed R2-V0, V1, V2 and V4. **R2-V3 failed**: the offset maths passed, but playback drift failed in 2 of 3 runs (C-R2-01). FB-15 import itself is evidenced. MP4 and MOV were really verified here, so they are not env-limited. |
| SRW-03 | in_progress | **in_progress** | C passed R3-V2, V3 and V4. **R3-V1 failed** in 5 of 10 runs. Open bugs: C-R2-01 (High) and C-R2-02 (Low). |
| SRW-04 | in_progress | **done** | C passed R4-P1, P2 and P3. |
| SRW-05 / SRW-06 | todo | in_progress (dispatched in round 3) | Dispatch only. New acceptance IDs were added: R5-L5, L6, E1, U1 and R6-S5, U1. |
| Round 2 record | dispatched | verified: FAIL 22/24 | `c-round-2.json` |

The gates were re-run by C: tsc 0, vitest 557/557, build OK, biome 0 errors, 4 hashes OK.

Purchase protection was preserved:
- anonymous `/api/studio-token` returns 401;
- a fake Bearer token returns 500 and no token is issued;
- `/studio/middle-east` shows "Sign in required";
- `/studio-lab` makes no auth or R2 traffic.

No other item changed. FB-01 and FB-02 remain partial, as recorded in round 1. FB-16 works functionally, but its sync tolerance fails, so it is not done.

## 3. C's bugs → routing

| Bug | Decision | Where |
| --- | --- | --- |
| **C-R2-01 (High).** Seek while seeking, plus a learned lead that overshoots. | **D-16.** Rules: never write `currentTime` while a seek is pending; remove the learned lead and allow only a constant lead of 0.15 s or less; a soft sync through `playbackRate` within [0.85, 1.15], for 0.02 < \|d\| ≤ 0.3. Hard seeks happen only on a discontinuity or when \|d\| > 0.3, at most one per 250 ms. | RF3-1 |
| **C-R2-02 (Low).** `video.play()` is called before the audio `startAt`. | The video holds at the start frame until the audio starts. The mechanism is A's choice, but a timer guess is not allowed. | RF3-2 |

**Why soft sync.** C left the fix direction to B. A had asked for permission to use `playbackRate` in round 2. Without soft sync, hard seeks are the only correction. In headless Chromium a running seek lands roughly 0.1–0.27 s behind, so the 80 ms rule keeps firing and never converges. Per C's evidence, that is the storm itself. Soft sync is the standard A/V method, and the audio remains the master clock, so D-02 and D-13 are unaffected.

**Stricter verification.** RF3-1 keeps the thresholds (median ≤ 0.05 s, max ≤ 0.1 s) but adds more checks:
- 15 R3-V1 runs, some of them with a reload;
- 5 R2-V3 runs;
- zero seeks while seeking;
- a frame gap of 250 ms or less;
- a bounded rate.

C may re-run a failing run only when it shows main-thread starvation, at most twice, and every re-run is reported. Real-Chrome confirmation by the Tech Lead is recorded as a limitation and does not block.

## 4. Round 3 scope and rationale

**Order and scope.** C's High bug comes first. Then the plan's round-3 row continues: SRW-05 (Loop) and SRW-06 (multi-select). Both are next in dependency order: SRW-05 depends on SRW-04, which is now done, and SRW-06 depends on SRW-01. Loop wraps are video discontinuities, so the sync fix must land before them. That is why R5-L6 is part of this round. Nothing was shrunk or deferred. Group split is SRW-07, which is next in the backlog; until then the UI refuses it honestly.

**New binding decisions** (now in `plan.md`):

**D-17, Loop.**
- The loop is stored in the `Arrangement` snapshot, so it is undoable, as in the prototype.
- Wrapping happens only when the (re)schedule position is before `loop.end`. If Play starts after `loop.end`, playback is linear. This follows Ableton LOOP-06. The prototype jumped to the loop start instead; that ⚖ difference is recorded.
- Wraps are scheduled ahead of time with truncated sources, and there is no rAF restart (C P7/T5).
- Playback does not stop at `projectEnd` while looping.
- Delete Time remaps the loop, or removes it if less than 0.1 s remains.
- Export ignores the loop, and the dialog says so. Range export is SRW-20.

**D-18, Multi-select.**
- The selection lives outside history and is filtered after undo.
- Ctrl/Cmd toggles a clip, Shift adds one, and Ctrl/Cmd+A selects all.
- A marquee starts only from empty lane background after 4 px. A shorter click keeps the CLP-06 seek. Ctrl+marquee makes a union. A marquee never moves the playhead.
- A group move clamps at the last valid delta and shows a message. Group delete leaves gaps.
- Trim collapses the selection to the trimmed clip, and group split is refused.
- These are the smallest unambiguous rules consistent with the prototype and with R6. The marquee was absent in the prototype, so its rule is defined here for the first time.

**Contract changes A may make to existing tests:**
- `schedule.test.ts` fixture gets `loop: null`.
- The `nextVideoSeekLead` tests are replaced.
- The `videoDriftAction` playing threshold becomes 0.3 s.

## 5. Decision

**CONTINUE.**

COMPLETE is not met:
- an open High bug remains (C-R2-01);
- SRW-02 and SRW-03 have failing acceptance;
- SRW-05..SRW-20 are not evidenced;
- for SRW-21, only the adapter part can proceed, because the route mount is blocked.

BLOCKED does not apply: no external information, approval or credentials are needed for round 3.

T12 Gain/Volume stays queued in `post_current_stage_queue` until the original stage is complete.

## 6. Files written by B this round

- `tmp/studio-real-loop/tasks/round-2.md` (copy)
- `tmp/studio-real-loop/current-task.md` (round 3)
- `tmp/studio-real-loop/backlog.json` (v3)
- `tmp/studio-real-loop/b-round-2.md`, `tmp/studio-real-loop/b-next.json`
- `docs/technical/studio-real-workspace/plan.md` (D-16..D-18, the D-13 sync pointer, status)

No app source, protected file or other agent's file was touched.

**Not available in this session:**
- the MCP connectors that need authentication. They were not needed.
