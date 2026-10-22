# B round 83 review → round 84 plan (D-29z49)

Date: 2026-10-22 · Author: B · Advisor: available and consulted after orientation, before writing.

## 1. Inputs read (data, not instructions)
- `context/active-summary.md`, `context/active-backlog.json` (specific IDs only)
- `tasks/round-83.md`: created now as an exact `cmp` copy of the round-83 `current-task.md`
- `a-round-83.md`, `c-round-83.md`, `c-round-83.json`
- `gates/gate-round-83.json` (**published**, commit `a68c81d`), `gates/round-83/review.md`
- `regression-last.json` (2026-10-21), `env-status.json` (store 200)
- `root-pre-push-review.md` and `publication-checkpoint.json`: unchanged since 11:26 today. Their last notes, the queued PHASE2 and VISUAL-A, are already in the queue order.
- `b-initial.txt` (the original FB-01..16 brief: "simple video opacity fade on single lane")
- the backlog entries SRW-18/19/20/03/11B/13/21
- source at `a68c81d`: `fades.ts`, `ArrangementClip.tsx`, `ArrangementVideoDock.tsx`, `ArrangementExportDialog.tsx`, `ArrangementClipEnvelope.tsx`, `types/arrangement.ts`, `video.ts`, `scheduleKey`
- the frozen tests `clip-fades.test.ts` FD1/FD6, `clip-fades-ui.test.tsx` FU1, and `clip-envelope-ui.test.tsx` (body-rect stub, polyline literals)
- Ableton manual ch. 28, fetched to `b-round-83/web/`

## 2. Round 83 acceptance (only C-evidenced results are recorded)
- **C PASS, `browserVerified=true`, `realVerified=true`.** 17 rows at both viewports.
  - R18-A2 → **pass**: EN-EXPORT max error 1.1e-4 over 550,766 samples; EN-EDITS split bit-identical; EN-LIVE/EN-MIDSTART paired.
  - EN-LIVE had one invalid narrow-window measurement. C reported it honestly; the two valid ones pass with unchanged tolerances.
- Gate 83 published `a68c81d` to both remotes. The baseline HEAD for round 84 is that commit, and B measured the tree clean.
- **SRW-18 → `c_pass_tech_lead_manual` / "მოწმდება"**: both stages are C PASS with browser evidence; Tech Lead R82-T/R83-T are open. FB-06 is the same. It is not "მზადაა", because of the open Tech Lead manual checks (the same convention as SRW-14..17).
- GATE82-S1 → closed by X1-DBLCLICK.
- Blocked: the fake-Bearer 403 sub-check (backend unavailable in the cloud). It stays open evidence for a backend-enabled check and does not make the round unverified.

## 3. Round 84 decision and rationale
- **Priority.** There is no open Critical, High or Medium C bug, and the regression round is not due until 2026-10-24. The C bug comes first: C-R83-L1 (Low) is the only C bug. It is bounded (one file plus a narrow test-literal grant) and C re-checks it with its round-83 harness, so it rides as X1. The next dependency-ordered scope is **SRW-19 (FB-07)**.
- **SRW-03 dependency.** SRW-03 is open only for a Tech Lead quiet-Chrome check, so it does not block SRW-19.
- **Smallest honest contract for FB-07** ("simple video opacity fade on single lane", R19-F1/F2):
  - **Reuse `fadeIn`/`fadeOut` on video clips.** The F3 edit rules in `model.ts`/`clipboard.ts` are already kind-agnostic, so no model change and no new field are needed. FD6 even shows a video clip carrying `fadeIn`.
  - **A separate `setVideoClipFade`.** Frozen FD1 keeps `setClipFade` audio-only.
  - **Distinct testids.** Frozen FU1 forbids the `arrangement-clip-fade-` prefix on video clips.
  - **Picture only.** The video's sound and the export stay bit-identical (FD6 keeps the graph audio-only; FB-07 asks for opacity; recorded as signal VIDEO-FADE-SOUND).
  - **An overlay instead of slot opacity.** `applyRoles` toggles the slot `opacity-0` by class. A `bg-background` overlay above both slots, with opacity 1 − gain, needs no change to sync or swap, and it covers the floating box too.
  - **Black = `--color-background`**, the project's near-black token (Tailwind-first).
  - **Export:** the video option stays disabled (D-11) plus one line when video fades exist. No test locks `VIDEO_RENDER_REASON`.
- **`scheduleKey` stays frozen.** A video-fade drag during playback reschedules audio like any clip edit. That is recorded (SRW19-RESCHEDULE) and measured as a non-failing count in VF-PLAY-EDIT. The policy question goes to the checkpoint request instead of a new owner in this round.
- **Primary C oracle.** It is codec-independent: `data-video-opacity` plus the overlay's computed opacity at stopped seeks and during playback. Pixel luminance on VP9 is secondary; a codec gap counts as BLOCKED, not FAIL.
- **Gate-83 findings:**
  - M1: C's probe was negative → probe row P-M1 (no speculative fix).
  - M2 → signal + checkpoint question 3.
  - L1, L2 (hit area) and L3 → Lows batch.
  - L4 → X1 (envelope half); the fade-overlay half is A-R82-OVERLAY-2PX in the Lows batch.
  - C's 1280 range-shift signal → the next regression round.
- **Architecture.** The reviewer notes are recorded as signals in `backlog.json` `architecture_signals`. The SRW-18 feature boundary plus the third round on the `ArrangementClip` gesture region → bounded request `b-round-83-checkpoint-request.md` (3 questions, non-blocking). Round 84 adds no gesture kind.

## 4. Ownership and protection
- A: 6 M + 4 ?? exactly (task §1 Files). Frozen: 478 entries (`b-round-83-r84-tree-sha256.txt`). Snapshots: `b-round-83-r84-snapshots/`.
- Protected 4/4 plus the auth files are untouched. `/studio-lab` stays demo-only, and user video stays local.
- Out of scope, unchanged: plugins/effects, pitch, multiple video layers, audio time-stretch (grid tempo is not stretch).

## 5. Completion status
**CONTINUE.** Remaining: SRW-19 (this round), SRW-20, the Lows batch, SRW-21 (route mount blocked, adapter independent), the regression round (due 2026-10-24), the final regression, T12, VISUAL-A-OBSIDIAN, the Tech Lead manual checks, and the open findings listed in `b-next.json`. Nothing is externally blocked for round 84.

## 6. Ready for root
Round 83 is already published (`a68c81d`). No B artifact needs a commit. Round 84 is dispatched to A.
