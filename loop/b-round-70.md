# B round 70 — evaluation of round 70, plan for round 71 (D-29z36)

Author: B · Date: 2026-10-21 · Advisor: available, consulted once after orientation. A second consultation before completion is recorded in §8.

## 1. Inputs read

- **Context:** `context/active-summary.md` and the parts of `context/active-backlog.json` covering SRW-15 and the open findings.
- **Round 70 task:** `current-task.md`, archived as **`tasks/round-70.md`** before any edit (`cp -n`, `cmp` identical; the file did not exist before).
- **Pre-state copies:** `b-round-70-pre-{b-next.json,backlog.json,current-task.md,feature-status.md}` and `b-round-70/plan.before-b-round-70.md`.
- **Round 70 reports:** `a-round-70.md` (§6 reviewer, §7 tails, §8 deviations), `c-round-70.md` and `c-round-70.json`.
- **Root:**
  - `gates/gate-round-70.json`: `published`, commit **`2be45df`** on both remotes. The `head` field `ae4fc39` is the pre-commit HEAD. `git log` confirms `2be45df` is HEAD.
  - `gates/round-70/review.md`: root reviewer 8.5/10, `COMMIT: OK`.
  - `root-review.md`.
- **`root-pre-push-review.md`:** its last entry is a **2026-10-20 root note on Phase 2**. B round 69 did not carry it; it is recorded now (§6).
- **Environment:** `env-status.json` (round 70: store 200, backend 200).
- **Looked up by ID only:**
  - in `backlog.json`: SRW-15, ROOT-R66-M1, ROOT-R65-M1, ROOT-R65-L6, DOC-059-STATUS-LINE, ARCH-CHECKPOINT-SRW14-PREFS, INFO-C66-RU-DBLCLICK-MISS-2, R67-T to R69-T, and `post_current_stage_queue`;
  - in `plan.md`: D-29z35 and the FB table;
  - also `gates/round-66/review.md` #1 and Architecture note, `tasks/round-66.md` (MT rows, F-SILENT, Ableton table) and `c-round-67.md` MT-SCRUB-INFO.
- **Source**, read-only, to write a concrete task:
  - `metronome.ts`, `ArrangementContext.tsx` (constants, refs, `fillLoopIterations`, `startGraph`, `stopGraph`, `pumpPlaybackAudio`, `tick`, `syncPlayback`, `setMetronomeBpm`);
  - `graph.client.ts` (`startClicks`, `appendClicks`), `loop.ts` (`refillLoopIterations`), `transport.ts` (the full anchor functions);
  - `metronome-ui.test.tsx` (harness, UI1–UI10), the `metronome.test.ts` index, and doc 059 (item 7, the TODO).

## 2. Evaluation of round 70 (C evidence only)

`c-round-70.json`: **taskStatus PASS, `browserVerified: true`, `realVerified: true`, `bugs: []`, `commitReady: true`.**
- Every REAL-browser row ran, and the starred rows ran at both viewports.
- Measured: DOM marks 96–144 (was 2215); zoom-step median 25.8 ms (was 69–107 ms); 0 incomplete frames on Follow, resize and fast sweeps.
- Root gate: verify 99/1683, review 8.5/10, published `2be45df` on both remotes.

| ID | Before | After (evidence) |
|---|---|---|
| ROOT-R65-M1-BEAT-DENSITY | scheduled round 70 | **closed** (C PASS round 70, `2be45df`) |
| ROOT-R69-L5-DOC061 | scheduled round 70 | **closed** (C R70-S: status line only) |
| ROOT-R65-L6 | doc 058 part scheduled | doc 058 part **closed**; the U11/U12 order stays in the Lows batch |
| SRW-15 / FB-09 | მოწმდება | **მოწმდება** (`c_pass_tech_lead_manual`); R70-T added; ROOT-R66-M1 → round 71 |

**C info → backlog:**
- INFO-C70-MUT-M/N/O are test gaps. They are merged with the reviewer's #5 as **ROOT-R70-L5-MUT-GAPS** (Lows batch).
- INFO-C70-MUT-P-EQUIV is closed (equivalent mutant).
- INFO-C70-DOC058-PLACEMENT is acknowledged.
- INFO-C66-RU-DBLCLICK-MISS-2 is still on watch, with one more miss inside the TB script. The dedicated script passed 18/18.
- **INFO-C70-SCROLL-END** goes to the Lows batch as low/open: pre-existing, and C explicitly did not file it as a bug. B does not upgrade it.
- **No browser half is pending for round 70.**

## 3. Root reviewer findings (round-70 gate)

| ID | Severity | Disposition |
|---|---|---|
| ROOT-R70-L1-FIRST-MOUNT-FULL | low | Lows batch. It matters once a tempo is restored from a saved project, and today the tempo starts as `null` |
| ROOT-R70-L2-LAYOUT-READ | low | Lows batch. It needs a `StudioWorkspace` change (`viewportWidthRef`) |
| ROOT-R70-L3-FIBER-PROBE | low | Lows batch / ARCH (c) shared harness |
| ROOT-R70-L4-BW5-WALLCLOCK | low | Lows batch. C measured 4–6 ms over 3 runs |
| ROOT-R70-L5-MUT-GAPS | low | Lows batch, merged with the C info items m/n/o |
| ROOT-R70-L6-DOC062 | low | **Round 71**, status line only |
| ROOT-R70-ARCH-TIMELINE-TRIO | info | A signal merged into ARCH-CHECKPOINT-SRW14-PREFS (seventh request). Both reviewers said "keep until a fourth consumer" |

## 4. Round 71 decision (D-29z36): ROOT-R66-M1, metronome horizon

**Why this item.** No C bug is open, and ROOT-R66-M1 is the last open reviewer Medium. `done_policy` forbids an open Medium at COMPLETE, and `b-round-69.md` §4 set it as round 71. It is one Medium with one owner. The two doc status lines are one-line housekeeping on docs the round already touches or that the reviewer named.

**What the source showed:**
- Without a loop, `startGraph` plans clicks to `projectEnd`, and every `startGraph` call re-plans them.
- `syncPlayback` calls `startGraph` on every scrub reschedule (100 ms).
- Retired graphs live 250 ms.
- `graph.client.ts` already has `appendClicks`, which purges ended sources and maps `startAt + (when − from)`.
- `transport.ts`: `holdUntil ≤ startAt` always, so the graph's mapping is linear in `(from, startAt)`. The refill must use the pair passed to `applySchedule`, never the anchor at pump time.

**The design fact that decided the spec: chunk boundaries cut clicks.** `planMetronomeClicks(bpm, a, b)` caps a click's duration at `b` (frozen M5, used on purpose at `loop.end`). Chunking `[a, b) + [b, c)` would therefore shorten every click within 30 ms before a chunk boundary.
- **Chosen:** an optional `soundUntil` (default `until`). Beat selection is unchanged; only the cap moves to the project end.
- **Rejected:** snapping boundaries to beat times. It hides the rule in floating-point arithmetic and holds only while 30 ms < one beat.
- MH2 pins the invariant: the chunks concatenate to the full plan (same beats, accents and audible ends).

**Late rule (the smallest honest behaviour).** If a pump is late, the missed clicks are dropped.
- A click is never started in the past, which would be a burst.
- A late click never triggers a resync. The loop path resyncs because its *clips* need re-anchoring; here the clips are already scheduled to the end.
- Horizon 2 s, the same as the loop horizon. A hidden tab clamps timers to about 1 s, so the 200 ms pump stays inside it.

**Test grant.** The backlog note said "UI2/UI4/UI5". The source shows that **UI10** also pins `planMetronomeClicks(120, 0, PROJECT_END)`. The grant therefore covers exactly those four expectations and the import. UI2's original meaning (a click on every beat to the end) moves to HU2, which proves it over the whole playback as a union of all appended clicks.

**Verification design:**
- **Pure:** MH1 (default path identical), MH2 (chunk invariant sweep), MH3 (cap), MH4 (chunk rules with worked literals; B checked each by hand), MH5 (seeded no-burst simulation).
- **Mounted:** HU1–HU8, using UI7's fake-timer pump pattern.
- **Mutations:** a–l.
- **C, real audio:** across many refills (MT-BEATS, MH-LONG), at the project end (MH-END), after seek, tempo change, live toggle and scrub.
- **C, worst case:** MH-NODES and MH-SCRUB-PERF use 999 BPM on the 133 s timeline with a PW `createBufferSource` counter. This is the measurement MT-SCRUB-INFO (120 BPM, short project) could not give.
- The hidden-tab late case is unit-only. C must record it honestly as "not run (environment)".

**Ownership:**
- `metronome.ts` (additive) and `ArrangementContext.tsx` (§0.1 (2) only);
- `metronome-ui.test.tsx` (the grant only) and two new test files;
- doc 063 (new), doc 059 (status line plus one sentence), doc 062 (status line).

**Baseline:**
- `2be45df`, clean tree;
- frozen list `b-round-70-r71-tree-sha256.txt`, 439/439 OK;
- snapshots `b-round-70-r71-snapshots/` (5 files, all LF);
- protected files 4/4; Biome 4/218/1;
- vitest 99/1683 → 101 files.

**Ableton:**
- "A click on every beat" is confirmed (§19.4, round 66 source, re-used).
- The scheduling technique is "not applicable". No claim is made that Live does the same.

## 5. Architecture checkpoint

ARCH-CHECKPOINT-SRW14-PREFS is still unanswered, after six requests. Round 70's reviewers added the timeline-trio signal, and B re-states the request in task §6 as the seventh. It is non-gating: B does not schedule an extraction, and independent core work does not wait. The metronome-buffers signal (ARCH (f)) remains a signal and is not part of round 71.

## 6. Root note: Phase 2 (2026-10-20)

`root-pre-push-review.md` records the root note. The user queued `PHASE2-VIDEO-SCORING` (SRW-40…44, `docs/technical/studio-real-workspace/phase-2-requirements.md`) after T12. It is not planned, started or mixed into current tasks.

When Phase 1 and T12 are complete, B's decision is **BLOCKED: "phase 2 awaiting user go-ahead"**, not COMPLETE, until root records the user's confirmation.

This is recorded as `PHASE2-ROOT-NOTE-20261020` in the backlog, in feature-status §7/§8, in plan D-29z36 and in task §6.4. Correction: `b-round-69.md` §1 said the file had not changed since round 65. Its mtime (2026-10-21 15:35) and this note prove otherwise.

## 7. Carried (not this round; in the backlog)

**Own tasks, in order:**
1. SRW-16 (FB-10) named markers/locators, stage 1;
2. then SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07) and SRW-20;
3. the open follow-ups for SRW-03, 05, 09, 10, 11B, 13, 23 and 24;
4. SRW-21 (blocked-partial, route mount only).

**Lows batch:**
- ROOT-R64-L3 to L6; ROOT-R65-L2, L4 and L5 (plus L6's U11/U12 order);
- ROOT-R66-L3; ROOT-R68-L2, L4 and L5; ROOT-R69-L1 to L4; **ROOT-R70-L1 to L5**; INFO-C70-SCROLL-END;
- A-R65-TEMPO-HINT-ANCHOR and the A-R66/A-R67 review residuals;
- INFO-C66-UI9-NO-PLAY, INFO-C67-MUT-P, INFO-C68-MUT-K and INFO-C67-DROP-GHOST-ATTR.

**Then:** the full regression, root review and T12. After T12, Phase 2 waits for the user.

**Tech Lead:** R65-T … R71-T.

## 8. Decision

**CONTINUE.**
- **Why not COMPLETE:**
  - ROOT-R66-M1 (Medium) is open and goes to round 71.
  - SRW-16…SRW-20 have not started.
  - SRW-03, 05, 09, 10, 11B, 13, 14, 15, 23 and 24 still need bug fixes or Tech Lead checks.
  - SRW-21 is blocked-partial.
  - The Lows batch, the full regression, the root review and T12 remain.
- **Why not BLOCKED:** no external information, approval or credential is missing for round 71.

**Readiness:** round 70 is already published (`2be45df`). Round 71 is commit-ready only after a C PASS with `browserVerified: true`.

**Advisor:** available. First consultation after orientation. It caught the UI10 pin, the stored `(from, startAt)` rule, late-drop without resync, the union oracle, the worst-case perf rows, the Phase 2 note and the close-on-evidence list. B then found the chunk-boundary truncation (M5) and added `soundUntil` and MH2. Final consultation before completion: see the end of this file if it gave changes.

**Final advisor consultation (before completion) — changes applied:**
1. **HU4** now jumps `Date` by **5 s**, not 3 s. With 2 s chunks, up to 4 s are already planned, so a 3 s jump is not late on correct code. The absent set is defined from the last appended beat `B`: `(B, now + 0.02)`, which at ~4 s → ~9.2 means 8.0, 8.5 and 9.0 are absent.
2. **MH-SCRUB-PERF:** the bound is now ≤ 5000 in total and ≤ 80 per resync burst. Correct code produces about 68 per resync (the initial chunk plus one refill), so the old ≤ 3000 total would have been a false FAIL.

Both fixes are mirrored in `b-next.json` and in plan D-29z36 R6. The advisor confirmed the MH4 literals, the UI2/UI4/UI5/UI10 grant values, the MH2 boundary cases, and HU7/HU8.
