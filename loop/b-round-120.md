# B — Round 120 result → Round 121 plan (D-29z86)

Date: 2026-10-23, planned from 23:26:24 UTC (`date -u`).
- **Advisor:** available, and consulted before writing. B adopted its points on sequencing, placement, scope, baselines and paired oracles.
- **Project subagents:** none consulted. The ruling is narrow, and the open UX question goes to DESIGN-UX-REVIEW as a signal.

## Inputs read (as data)
- `context/active-summary.md` and `context/active-backlog.json`.
- `gates/gate-round-120.json`: `status: published`, commit `0a75ba8`, both remotes. **So the round-121 baseline is the clean commit `0a75ba8`** (`git status --porcelain` is empty).
- Round 120 files: `current-task.md`, `a-round-120.md`, `c-round-120.md` and `c-round-120.json`.
- `b-round-119.md` and `b-next.json`.
- From `backlog.json` (by ID): T12-GAIN-VOLUME, its stages and the queue.
- From the T12 source: T12.18, T12.19, Test 7 and T12.27 (`gain-volume-source.txt` l.1–40, l.610–680, l.960–1080).
- Live 12 §6.1 from the saved capture `b-round-71/ableton-arrangement-view-20261021.txt`.
- Source: `ArrangementClip.tsx` (`buildPeakShape`, the memo), `ArrangementLane.tsx` (props, the clip render), and `StudioWorkspace.tsx` (the grid-control row, `isTypingTarget`, the toggle patterns).
- `regression-last.json`: 2026-10-21.

## C round 120 — what is independently evidenced
- **PASS**, `browserVerified: true`, `realVerified: true`, 0 app bugs. Published as `0a75ba8`.
- **Passed:**
  - T120-TARGETED 331/331;
  - AN-REVIEW. C re-derived the WG2 pin from HEAD `4090f6e`;
  - SOURCE-SCOPE;
  - WG-SCALE and WG-LIVE at both viewports;
  - WG-CLAMP-FLOOR, WG-DETAIL, WG-MULTI, WG-MUSTNOT;
  - WG-PLAY (0 `createBufferSource`);
  - WG-AUDIO (peak/RMS ratio 0.501187);
  - WG-VIDEO (disabled state);
  - the NB rows, G120-3 (401) and PX-NET/REG-HYD.
- **Inconclusive:** WG-VIDEO "unchanged vs the pre-round drawing" had no browser byte baseline. **Blocked:** fake-Bearer 403 (backend unavailable in cloud).

## Backlog updates (only from evidence)
- **T12 stage 4a → `c_pass_published` (`0a75ba8`).** In feature-status it is **მზადაა**. `browserVerified` is true.
- **New info findings** (none is a bug and none is a Low, so `deferred_low_polish` stays at 160):
  - **C-R120-01** (process): applied as an edit rule in round 121 §2.
  - **C-R120-WGVIDEO-NO-BASELINE**: acknowledged. B has now captured a browser baseline.
  - **ARCH-R120-PEAKSHAPE-TO-PEAKS**: added as addendum (ad).
  - **WAVEFORM-ZOOM-DISCOVERABILITY**: a DESIGN-UX-REVIEW signal.
  - **WAVEFORM-ZOOM-LIVE-PARITY**: an ABLETON-EXPERT-REVIEW signal.
- **ENV-FIRST-LOAD-GRID-NULL:** the fourth occurrence (C wg-1440-1). It stays on watch.
- **`rounds`:** 120 is closed (c_pass + published) and 121 is dispatched. `baseline_tree_at_round121` was added. Version 119.

## Sequencing ruling (D-29z86 R1)
- **The regression round is not due.** `date -u` gave 2026-10-23 23:26:24. That is 2 days after `regression-last` (2026-10-21), and the rule needs 3 or more.
- The round-120 §0/§8 forecast ("round 121 = REGRESSION") assumed planning on or after 2026-10-24. It is superseded, and the correction is recorded in `backlog.json`, plan.md and feature-status.
- **Round 121 = T12 stage 4b.** It is the next dependency-ordered scope and closes T12 V1.
- **Round 122 planning is the REGRESSION round in any case.** It falls on or after 2026-10-24 (3 or more days) and then covers V1. After a C FAIL, the bounded fix-up comes first.

## Round 121 (current-task.md) — design and rationale
- **Scope:** T12.18 Waveform Vertical Zoom, plus T12.26 Test 7. The scope is the full requirement, with nothing deferred.
- **Placement (measured; `b-round-120/probe/`):**
  - The control must not change the chrome height. The tempo and marker rows are 20 px and the loop row is 16 px, so they cannot hold a 24 px control. The transport toolbar would wrap at 1440.
  - In the 224 px grid row, a native select is 48–66 px and overflows. An `appearance-none` select with the labels `½× 1× 2× 4× 8×` is 28 px wide and ends at x = 210 ≤ 216.
  - **Choice:** a stepped select, last in the grid row. This is a deliberate difference from Live's slider, and its discoverability is a DESIGN-UX-REVIEW signal.
- **Levels:** `½×`, `1×`, `2×`, `4×` and `8×`.
  - `1×` and `2×` are what Test 7 needs.
  - `½×` covers T12.18's "increase or decrease". This is the user's spec; Live's text only says "enlarge".
  - `4×` and `8×` cover the spec's "+12 dB visual" example.
- **Scope of the drawing:**
  - All audio clips on lanes, including new clips (Live 12 §6.1 confirms both).
  - **The video drawing and the detail panel are unchanged.** That is the smaller change: DetailPanel stays frozen, the panel keeps showing the true clip level, and the manual says "audio clips … in the Arrangement".
- **View only:** a session state in StudioWorkspace. It is not in history, the arrangement or `localStorage`, so it cannot reach `scheduleKey`, the graph, the meters or the export. A status line says so.
- **One factor:** `clipWaveformScale` = `clipLinearGain × zoom`, through the existing pre-clamp `scale` parameter. At `1×` the drawing is byte-identical to round 120.
  - The new props are optional and default to 1, so no existing test needs a grant.
  - B's greps found no test that pins tab order or counts the grid controls. `grid-snap-ui:387` forbids a select in the transport toolbar, so the select does not go there.
- **Test literals:** WZ1 was derived in node with Float32 input (`b-round-120/literals.txt`).
- **The memo:** the deps are prescribed by their meaning, not by an exact line. This is the round-120 deviation-1 lesson: Biome's `useExhaustiveDependencies` decides the form.
- **Browser baseline** (`b-round-120/probe/baseline-r121.json`, taken on the clean `0a75ba8`):
  - the chrome rows `[28, 20, 20, 16]`;
  - the lane y at both viewports;
  - the four waveform `d` sha256 at `1×`.
  - This gives C exact 1× identity and a layout must-not. It also closes the round-120 WG-VIDEO gap for this round.
- **Test 7 oracles:**
  - WZ-AUDIO: a WAV export at `1×` vs `2×`, within ≤ 1 LSB and a ratio of 1.0000.
  - WZ-METER: paired per-iteration output-tap peaks on a loop, within ±0.1 dB, with an equal `createBufferSource` count per iteration (C-R82-LIVE-ORACLE-PAIRED).
- **Process:** tightened after C-R120-01. Every lasting edit goes through Edit/Write, and A lists every shell write.

## Ableton source
- **§6.1, confirmed** (capture `b-round-71/…20261021.txt`):
  - a separate Waveform Vertical Zoom Level slider enlarges the display of audio clips "without having to adjust the clip gain";
  - it applies to all audio tracks and to new clips.
- **Unconfirmed (დაუდასტურებელი):** the range, the location, the Undo behaviour (an inference: it is a view setting) and the Clip View behaviour. All go to ABLETON-EXPERT-REVIEW.

## Architecture
- T12 V1 closes with round 121. That is a feature boundary, so addendum (ad) was appended to `b-round-91-checkpoint-request.md`. The request is still pending with root and non-blocking.
- **Not re-sent as a new request:**
  - The phase-1 boundary request (ARCH-CHECKPOINT-PHASE1-BOUNDARY) is already open, and (ad) adds to it.
  - The workspace gains one view state, the same signal as ARCH-CHECKPOINT-SRW14-PREFS (a).
  - No single-owner risk has accumulated beyond what is already filed.

## Why not COMPLETE, why not BLOCKED
- **Not COMPLETE.** Still remaining:
  - stage 4b, then the regression round, ABLETON-EXPERT-REVIEW, DESIGN-UX-REVIEW, VISUAL-A and T12-ADVANCED;
  - 160 deferred Lows, the Tech Lead checks, SRW-21 (`deferred_user`) and the final regression.
  - FB-01..FB-16 are all covered by SRW items, which are `c_pass_tech_lead_manual`, except SRW-21 (`deferred_user`).
- **Not BLOCKED.** Nothing needs outside information, approval or credentials.

## Artifacts written
- `tasks/round-120.md`: copied before the overwrite. `cmp` OK, 22282 bytes.
- `b-round-120/pre/`: pre-edit copies of `backlog.json`, `feature-status.md`, `plan.md`, `b-next.json` and `b-round-91-checkpoint-request.md`.
- `b-round-120/probe/`: the measure scripts, `baseline-r121.json` and the screenshots. `lib.cjs` is a copy of C's round-120 helper with ROOT changed.
- `b-round-120/literals.mjs` and `b-round-120/literals.txt`.
- `b-round-120/tools/`: `update_backlog.js`, `update_fs.py` and `update_plan.py`.
- `b-round-120-r121-tree-sha256.txt`: 931 entries, `sha256sum -c` OK.
- Updated: `current-task.md`, `backlog.json`, `feature-status.md`, `docs/technical/studio-real-workspace/plan.md` (D-29z86, the round table and the ownership line), `b-round-91-checkpoint-request.md` (addendum ad) and `b-next.json`.
- No `store/` writes. `git status --porcelain` is still empty.
