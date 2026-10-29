# B round 255 → 256 planning (2026-10-29, ≈ 22:00 UTC)

**Decision: CONTINUE.** The next task is **round 256, SABA-B-9 stage 1** (`current-task.md`): the centre transport group, a Stop button, the honest Play label and double-click Stop. Decisions: D-29z481…D-29z490.

**Advisor:** used once before writing; a second call is made after writing. Its points were adopted:
- split SABA-B-9 and keep the master move for stage 2;
- resolve the 1280 contradiction by measurement, not inheritance;
- do not settle "Play while playing" from recall; it goes to Saba;
- write the Stop contract explicitly (single click, double-click event order, status);
- grant every test collision found by a scratch run (L23);
- keep `ArrangementContext.tsx` out of the grants;
- plan a stage that can pass in one go, because round 257 will be REGRESSION.

**Consults:** no project agent was consulted. The Live 12 manual ch. 3 (Control Bar) was fetched on 2026-10-29, and the 6.3 capture was re-read. R5–R7 have no source and go to Saba; no consult can confirm them without a source.

## 1. Inputs read
- `tasks/round-255.md`: the archive of the round-255 task, copied at the start of this planning. It did not exist before, and nothing was overwritten.
- `a-round-255.md`, `c-round-255.md` and `c-round-255.json`.
- `gates/gate-round-255.json`: **published** `a061d524d14af347119f06b239b77747c36362a0`, which is the baseline of round 256.
- `lessons.md` in full.
- `context/active-summary.md` (head).
- `regression-last.json`: 2026-10-27.
- `transport-grid-review.md` §0, §1, §4.1 and §5.
- `reference/youtube/SABA-B-9-10-11-transcripts.md`.
- Backlog entries by ID.

**Snapshots before editing:** `b-round-255/*-before-256`.

## 2. C round 255 evidence → backlog (D-29z481)
**Verdict:** PASS, with `browserVerified` and `realVerified` both true and 0 bugs.
- C-SCOPE-255 passed at the start and at the end, so the 12 round-254 rows carry by diff identity.
- Gate 255 published `a061d52` (rounds 254–255).

**SABA-B-10b → done.** These close: C-R254-01, GATE249-S4, GATE249-S7, A-R250-REVIEW-SHEET-MARKER-COPY and INFO-B249-STALE-MARKER-STATUS. GATE249-S5 is answered by C-HOME-254.

**C's observations:**
- C-R254-OBS-01 stays deferred.
- The floating video covers both lines in the same order as the playhead. No action.

**L28 grep** (`In Progress (stage`): the only hit is doc 176, PERF determinism stage 1 of 2. It is tied to the open PERF-HARNESS-SHARED-LIB-b-ii stage.

**L7:** no open or deferred finding shares the closed findings' root cause. B-R249-PAUSE-LABEL is dispatched in round 256.

## 3. Why SABA-B-9 now, and not REGRESSION (D-29z488)
- **Regression is not due yet.** `regression-last.json` = 2026-10-27, and this planning is 2026-10-29, 2 days later. It is due at the next planning on or after 2026-10-30, which will almost certainly be the round 256 → 257 planning.
- **No RETRO is due:** the next one is at round 260.
- **SABA-B-9 is next in the queue,** and it is approved by Saba.

## 4. Pre-check (`b-round-255/probe/`)
**HEAD toolbar:** 49 px at 1440 (1 row) and **87 px at 1280 (2 rows)**. Saba's "must not grow or wrap at 1280" is therefore already violated at HEAD.

**One row at 1280 is impossible without removing text:**
- the measured group widths are 409 / 487 / 432, so one centred row needs about 1,399 px;
- that needs about 96 px less text: Undo/Redo labels or the Zoom word and readout;
- the CALM rules keep the transport text buttons.

**Ruling (D-29z483):**
- one centred row where it fits;
- two rows below that, with the transport alone and centred in row 1, at **87 px, the same as HEAD**;
- DOM and Tab order edit → transport → view;
- asked once as SABA-Q-9-TRANSPORT (c).

The sketch measured 49 / 87 px, with a centre offset of 1 px.

**Growth window (after the advisor's second check):**
- HEAD is one row down to about 1,351 px: 49 px at 1366 and 1400, 87 px at 1350 and 1340 (`probe/toolbar-head-mid.json`).
- Between about 1,351 and 1,398 px, the new toolbar is two rows where HEAD was one.
- This is recorded in D-29z483 and in SABA-Q-9-TRANSPORT (c). The binding heights are 1440 = 49 px and 1280 ≤ 87 px; intermediate widths are 49 or ≤ 87 px.

**Scratch (`/tmp/b255-scratch`, diff in `probe/sketch.diff`):**
- **tsc:** errors in 2 files (`pauseLabel`/`pauseTitle`).
- **vitest** over `app/lib/arrangement`, `app/components/arrangement` and `app/contexts`: 169 files, 2,504 tests; 8 files and 23 tests collide.
- **With the sheet key,** SS-T1 also collides.
- **All 9 are granted** as C1–C9.

**Chromium on the sketch:**
- Play while playing → no restart.
- Stop → frozen.
- Stop while stopped → no-op.
- Double-click → 0 / 0, stopped and playing alike.
- **Sheet:** 1,260 → 1,280; only the `back-to-start` row changes (40 px).

**L50:** 4 hits, each ruled in task §0.2.

## 5. Routing (no action this round)
| ID | Route |
|---|---|
| SABA-Q-9-TRANSPORT | `awaiting_user` (D-29z483): (a) Play while playing, (b) Stop while stopped, (c) the 1280 layout, (d) the Play on-state look; plus the R1 geometric centring |
| ARCH-CHECKPOINT-TRANSPORT-POSITIONS | Still pending and non-blocking. `ArrangementTransport.tsx` (359 lines) gets a structural change, but one owner and no repeated structural risk, so no new checkpoint request. |

## 6. Ready for commit
- Gate 255 already published rounds 254–255.
- Round 256 is not ready until C passes.

## 7. Next (D-29z489)
1. Round 256 PASS plus the gate means SABA-B-9 stage 1 is done.
2. **REGRESSION-ROUND-2026-10-30** at the round 256 → 257 planning. It includes C-LAYOUT-256, C-STOP-256 and C-SHEET-256 if round 256 passed.
3. SABA-B-9 stage 2: master to the bottom-right.
4. SABA-B-11c, after an `ableton-arrangement-expert` consult on the off-grid offset.
5. SABA-B-7 when Saba answers.
6. RETRO at round 260.
