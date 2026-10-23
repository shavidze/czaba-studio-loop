# B — Round 119 result → Round 120 plan (D-29z85)

Date: 2026-10-23, from 22:38:46 UTC (`date -u`). The advisor was available and was consulted before writing. No project subagent was consulted, because the ruling is narrow.

## Inputs read (as data)
- `context/active-summary.md`: gate 119 `published`, commit `4090f6e` (rounds 118 + 119), both remotes. env-status: store 200.
- `gates/gate-round-119.json`: `status: published`. **So the round-120 baseline is the clean commit `4090f6e`** (`git status --porcelain` is empty).
- Round 119 files: `current-task.md`, `a-round-119.md`, `c-round-119.md` and `c-round-119.json`.
- From `backlog.json` (by ID only): T12-GAIN-VOLUME and the related findings.
- The T12 sources §T12.18/§T12.19/Test 7/§T12.27 in `next-stage-t12/gain-volume-source.txt`.
- Source read: `ArrangementClip.tsx` `buildPeakShape` (l.240–269) and its call site (l.304–309, l.840–848); `ArrangementDetailPanel.tsx` l.191–232; `peaks.ts`; `model.ts` `clipLinearGain` (l.523–525); `previewClipGainFader` (`ArrangementContext.tsx` l.2779–2812, which writes `history.present`).
- `regression-last.json` = 2026-10-21. 2 days have passed, so it is not due yet.

## C round 119 — what is independently evidenced
- **PASS**, `browserVerified: true`, `realVerified: true`, 0 app bugs.
- **Passed:** T119-TARGETED (452/452), AN-REVIEW (test file reverse hash `261472d6` exact; doc 100 exact; doc 101 by content), SOURCE-SCOPE, SH-MASTER and GV-DRAG at 1440 and 1280, G119-3 (401), PX-NET/REG-HYD.
- **Carried:** the round-118 browser rows, because the app is byte-identical to B's round-118 end snapshot.
- **Blocked:** fake-Bearer 403 (backend unavailable in cloud).
- **Observation C-R119-01 (process):** there was no pre-edit copy of the untracked doc 101.

## Backlog updates (only from evidence)
- **T12 stage 3b → `c_pass_published`** (`4090f6e`). In feature-status it is **მზადაა**.
- Closed: **C-R118-01**, **A-R118-REVIEW-DOC100-L69** and **GATE117-S1-DOC100-STALE** (published).
- **C-R119-01** was added as an info process rule: before touching an untracked granted file, store its pre-edit copy with sha256. The rule is written into round 120 §2.
- **ENV-FIRST-LOAD-GRID-NULL:** this is the third occurrence. It stays a watch item, and the harness rule is repeated in §5.
- **T12 stages:** stage 4 is split into **4a** (dispatched, round 120) and **4b** (not started; after the regression round). V1 = 1, 2, 3a, 3b, 4a, 4b.
- `rounds`: 118 and 119 are closed and 120 is dispatched. `baseline_tree_at_round120` was added. Version 118.
- Deferred Lows: 160, unchanged. No new Low.

## Round 120 (current-task.md)
- **Scope:** T12 stage 4a, T12.19: the waveform drawing shows the clip's Clip Gain.
  - It is display only, on the lane and in the detail panel.
  - It follows a drag live, and Undo restores the exact drawing.
  - Track/group Volume, Master, Pan, fades and the envelope must not change the drawing.
  - The audio path is untouched.
- **Design:**
  - `buildPeakShape` gets one `scale` parameter, applied before the clamp; the 0.02 floor is kept.
  - Both call sites pass `clipLinearGain(clip)`, and `clip.gainDb` joins the memo deps.
  - `model.ts` is not edited.
  - 4b will multiply its zoom into the same factor, matching the spec formula.
- **Choices B made, with rationale:**
  - **The detail panel follows the lane:** one clip, one picture, and the fader sits in that panel.
  - **Linear amplitude:** T12.19 says `× clipGainDisplayScale`, and peaks are linear amplitude.
  - **Clamp to the clip height:** this is the smallest honest drawing, and the export overload warning already exists.
  - **No clipped-column marker:** the spec does not ask for one.
- **Test literals:** B computed the WG1 path literals in node with `Float32Array` input. This is the C-R118-01 lesson: derive the values through the real rounding path. If a literal does not match, A stops.
- **Grants:** ArrangementClip.tsx, ArrangementDetailPanel.tsx (call site only), the new `clip-gain-waveform.test.tsx` and the new doc 102. No existing test is granted; B's grep found no peak-path pins, and A repeats it.
- **Frozen:** `b-round-119-r120-tree-sha256.txt`, 930 entries.
- **C ratio rule (fixed after the advisor review):** a column is judged only when `0.021 ≤ h0 ≤ 0.999` and `0.021 ≤ s·h0 ≤ 0.999`, with `|h − s·h0| ≤ 0.0006·(1+s)`. Clamped and floor columns have exact rules, and floor columns at 0 dB are never judged. B fuzz-checked the rule in node: 927,232 judged columns, 0 violations. The first draft would have failed floor columns at +3 dB and in the live drag.
- **C:** WG-SCALE and WG-LIVE (both viewports), WG-CLAMP-FLOOR, WG-DETAIL, WG-MULTI, WG-MUSTNOT, WG-PLAY, WG-AUDIO (neighbour), WG-VIDEO, G120-3, PX-NET/REG-HYD.

## Ableton source
- **§8.4.7 "Clip Gain and Pitch" — confirmed:** Gain is in dB. New capture `b-round-119/ableton-clip-view-20261023.txt`, fetched with curl on 2026-10-23 (gstack is not installed in the cloud).
- **§6.1 "Layout" — confirmed:** a separate Waveform Vertical Zoom slider exists for all audio tracks. That is stage 4b.
- **Inference (დასკვნა):** that the drawing reacts to clip gain is inferred from the §6.1 sentence "without having to adjust the clip gain". It is not stated.
- **Unconfirmed (დაუდასტურებელი):** the scale and clamp, and that Volume does not change the drawing. ABLETON-EXPERT-REVIEW checks these.

## Sequencing
- **If round 120 passes C,** round 121 is the **REGRESSION round**, because its planning falls on or after 2026-10-24 UTC.
- **If round 120 fails C,** the bounded fix-up comes first (the 116→117 / 118→119 pattern). A fix-up is not new scope, and the regression round re-verifies **published** items. The regression round then runs at the next planning, on the published tree, so its results are not mixed with a known round-120 defect. The advisor raised this point and B adopted it.
- After it comes T12 stage 4b, then ABLETON-EXPERT-REVIEW, then DESIGN-UX-REVIEW + VISUAL-A, then T12-ADVANCED.

## Architecture
- No new checkpoint request. Stage 4a is not a new boundary and does not touch the Volume machine.
- ARCH-CHECKPOINT-PHASE1-BOUNDARY, with addenda through (ac), is still pending with root and non-blocking.
- A's reviewer note, if any, becomes an addendum.

## Why not COMPLETE, why not BLOCKED
- **Not COMPLETE.** Still remaining:
  - stage 4a and 4b, and T12-ADVANCED;
  - the regression round, ABLETON-EXPERT-REVIEW, DESIGN-UX-REVIEW and VISUAL-A;
  - 160 deferred Lows, the Tech Lead checks, SRW-21 (`deferred_user`) and the final regression.
- **Not BLOCKED.** Nothing needs outside information, approval or credentials.

## Artifacts written
- `tasks/round-119.md`: an archive copy, made before `current-task.md` was overwritten. The first chained command failed on the missing `plan.md` before `cmp` ran. Checked afterwards: 13834 bytes, the same as the original, and the same round-119 title.
- `b-round-119/`: pre-edit snapshots, the Ableton capture, and `tools/update_backlog.js` and `tools/update_fs.py`.
- `b-round-119-r120-tree-sha256.txt`: the frozen list, `sha256sum -c` OK.
- Updated: `current-task.md`, `backlog.json`, `feature-status.md`, `docs/technical/studio-real-workspace/plan.md` (D-29z85, the round table and the ownership line) and `b-next.json`.
