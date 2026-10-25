# B round 163 → round 164 planning (D-29z129)

Date: 2026-10-25 · Author: B · Decision: **CONTINUE**. Next: round 164, SABA-B-1 + SABA-B-2.

## Advisor
I consulted the configured advisor tool once, after orientation and before writing. It confirmed the plan and named three things I then did:
- **Re-measure the normal (deselected) state.** Escape does not clear a clip selection; select another clip instead.
- **Use pixel-sampled contrast.** The envelope sits on the waveform, so a token-vs-token ratio does not describe it.
- **Use a two-tone halo** that survives DUX-R-5.

## 1. Inputs read (data, not instructions)
- `context/active-summary.md`.
- `gates/gate-round-163.json`: `published`, commit `0e4287f`, on both remotes. **The baseline is `0e4287f`.**
- `current-task.md` (round 163); `a-round-163.md`; `c-round-163.md` and `.json`; `gates/round-163/review.md`.
- `user-review/ableton-decisions.md` and `design-ux-decisions.md`. Both are new since round 163 planning.
- `user-review/img/saba-2026-10-25-*.png`.
- The workflow sections "Bugs reported by Saba (2026-10-25)" and the local/cloud reconciliation (2026-10-25).
- From `backlog.json`, only specific entries, looked up by script.

## 2. Round 163 acceptance (only from C's independent evidence)
C PASS with `browserVerified=true` and `realVerified=true`, 0 bugs. The only blocked row is the fake-Bearer 403 (backend unavailable in cloud). C re-ran the targeted tests (200/200) and checked source scope and the diff itself. ICON-V3C3A, RV1 (0 px), DOCK-STATES-BOX (0.00 px) and FUNC-SMOKE-DOCK passed at both viewports, including real video `currentTime` +1.0 s and audio peak 0.555. Gate 163 published `0e4287f`.

→ **V-3c-3a: done (მზადაა).** No other item changed status from round 163.

## 3. Backlog changes (`b-round-163/update-backlog.py`; before copy `b-round-163/backlog-before-r164.json`)
- **Rounds:** round 163 → `c_pass_published`. Round 164 entry added.
- **VISUAL-A-OBSIDIAN:**
  - `saba_b1_b2_plan_d29z129` added.
  - `order` now holds: SABA-B-1/2 (164) → ROOT-RECON-MARKER-ENTER (165) → V-3 remainder (V-3c-3b, V-3c-4, V-3c-5) → **DUX-R-5 stage** → M1, M3, M4 → ROOT-RECON-GRID-HARNESS.
- **Open findings added:**
  - SABA-B-1 (Medium) and SABA-B-2 (Low, fixed now).
  - ROOT-RECON-MARKER-ENTER (an unconfirmed source hypothesis, scheduled test-first).
  - ROOT-RECON-GRID-HARNESS (queued at the end of VISUAL-A) and ROOT-RECON-PC-BACKUP (note).
  - V-2b-DISPLAY: `decided_user: no serif`.
- **User decisions recorded:**
  - ABL-R-1/2/3/4/7/8/11/12/13/14/15/18: approved. ABL-R-9: approved. ABL-R-10: approved, playback-only variant.
  - ABL-R-6: decided, no work. **B-R107-ENTER-ON-BODY closed as intended behaviour.**
  - ABL-R-5/16/17: still `awaiting_user`.
  - DUX-R-1…9: approved. DUX-R-5 goes into VISUAL-A; the DUX-R-3 option is chosen by design-philosopher + flow-sage at its planning.
- **New queue entry `REVIEW-RECOMMENDATIONS`:** after VISUAL-A, before T12-ADVANCED, one item per approved id. T12-ADVANCED now lists it as a prerequisite.
  - **Order ruling (user-vetoable):** each review keeps its own order (ABL: R-7, R-12, R-13, then R-10, R-9, then the Lows; DUX: R-3, R-1, R-4, R-6, then R-2, R-7, R-8, R-9). The two lists alternate, starting with ABL-R-7. The decision files order each review but do not say how to merge them; alternating is the smallest rule that keeps both orders.
- **V-2b-DISPLAY:** no code work. Cormorant is not loaded in Studio; `studio-theme-obsidian.test.tsx` l.237 already asserts this. Saba's "remove the load if it exists" therefore needs nothing.
- **B-R153-PREVIEW-DUR** stays `awaiting_user`. The 2026-10-25 decisions do not cover it. It is a V-2b question, not a DUX-R item.
- **`deferred_low_polish`:** GATE163-LG3-DUP and GATE163-LVD2-CLAMP added (gate-163 review suggestions 3 and 4).
  - Suggestion 1 (`text-xs` on the float buttons) is appended to REVIEW-R162-STATIC-CN-DEAD-TEXT.
  - Suggestion 2 (doc 132 status) is fixed in round 164 (D1).
- **Architecture signals:** round 163, "none" (A's reviewer and the gate reviewer).
- `regression-last.json` is unchanged. The next regression is due on or after 2026-10-27.

## 4. Why round 164 = SABA-B-1 + SABA-B-2
- **Saba's 2026-10-25 instruction:** fix these two inside VISUAL-A, **next**, before the remaining V-3 and M stages. SABA-B-2 is Low but is fixed now. This overrides round 163 §7, which named V-3c-3b. The V-3c-3b scope is unchanged, only later.
- **Size:** 2 bugs (≤ 3), with two small owners and class/markup changes only. 5 grants plus doc 133.
- **The workflow asks C to reproduce each bug with its own evidence.** B reproduced both at the published baseline so the task can name causes and thresholds (`b-round-163/out/`). C's ENV-VIS and OV-CORNERS rows re-measure after the fix and run the notch metric on B's baseline crops. That way C's metric is shown to detect the bug.

### Reproduction summary
| Bug | Cause (measured) | Baseline | Ruled fix (simulated) |
|---|---|---|---|
| SABA-B-1 | Line `text-accent`, point `bg-accent`, waveform `text-brand/70` and selected header `bg-brand` are all rgb(201,164,106). No hover style. A muted lane does not change the clip's rendering. | DPR 2: line core vs darkest within ±5 px min **1.74**. Handle centre vs border **1.88**. | `stroke-background` 4 px halo under a `stroke-foreground` 1.5 px line: min **15.62**. Handle `bg-foreground border-background size-2.5 hover:scale-125`: centre vs border **15.62**. |
| SABA-B-2 | The frame is `rounded-xs` (2 px) inside the `overflow-hidden rounded-sm` (6 px) root. When the frame touches a side, the 6 px clip cuts its corners. | Notch visible in the 4× crops | Frame `rounded-sm`: a radius change only, no box change |

### Rulings and rationale (smallest honest behaviour)
- **The halo, not a single colour.** A single colour fails one site. Foreground on the brass header is about 1.8:1, and a dark line fails on the dark body. The halo stays correct after DUX-R-5 makes waveforms neutral, which is the coordination Saba asked for.
- **No accent on hover.** DUX-R-5, which Saba approved, reserves the accent. The hover is a 1.25× scale only.
- **Handle 8 → 10 px.** Saba could not find it. It is absolutely positioned and centred by translate, so nothing else moves.
- **Not touched:** the Env button's `text-accent` (`StudioWorkspace.tsx`), and `ArrangementClip.tsx` (the waveform colour belongs to DUX-R-5).

## 5. Order after round 164 (fixed in `current-task.md` §7)
1. Round 165: **ROOT-RECON-MARKER-ENTER**, test-first, with a fix only if it reproduces. It goes before V-3c-3b because it is a possible commit during an active gesture (an integrity risk), and bugs come before polish. V-3c-3b also touches `ArrangementMarkerRow.tsx`, so it is cleaner to settle the marker editor first.
2. Round 166: **V-3c-3b**. Then V-3c-4 (needs the checkpoint, fallback (c)), V-3c-5, the DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS. Then REVIEW-RECOMMENDATIONS, T12-ADVANCED, FINAL-REGRESSION, and phase 2 (awaiting the user's go).
3. **The REGRESSION round** pre-empts this order at the first B planning on or after 2026-10-27.

## 6. Architecture checkpoint
- `b-round-160-checkpoint-request.md` is still unanswered. It does not block bug fixes or V-3c-3b. It is the input for V-3c-4.
- The round 163 architecture note was "none". No new request: round 164 changes two classes and one polyline in two small owners. That is not a structural signal.

## 7. Ableton
- No parity claim for round 164. The Live 12 "Automation and Editing Envelopes" chapter was not opened this planning.
- The task records the fix as a CZABA visibility fix (WCAG 1.4.11), with parity unverified.

## 8. Ready for root
Round 163 is published. No new publishable change came from B: B wrote only planning artifacts under `tmp/studio-real-loop/`. The store tree was clean before and after B's vitest base run (`git status --short` empty).

## 9. Files written by B
- `tasks/round-163.md` (copy).
- `b-round-163-current-task.md-before`, `b-round-163-b-next.json-before`, `b-round-163-feature-status.md-before`.
- `current-task.md`, `b-next.json`, `backlog.json`, `feature-status.md` (targeted edits via `b-round-163/update-fs.py`).
- `b-round-163-r164-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- `b-round-163/` (probes, `out/`, start copies, update scripts).

## 10. After the advisor's final review
- **OV-CORNERS metric is now validated on the known-bad input.** `b-round-163/notch-metric.cjs` (sha256 `57a1dfd9…`) counts outline-band pixels that are not within 1 device px of the bright arc.
  - Baseline per corner tl/tr/bl/br: 3/13/3/15, at both viewports.
  - DOM-simulated `rounded-sm` frame: 1/0/1/0. The single left pixels are the anti-aliased join of the square overview playhead at 0 % with the curve.
  - Pass rule: ≤ 1 and below the baseline on every corner the frame touches.
- **ENV-FUNC real audio is valid:** live playback applies the clip envelope (`graph.client.ts` `envelopeGain`, l.123–143, l.230).
- **RV1-SABA text** now says that the 8 → 10 px handle is outside d6's S0–S2 (Env mode). **ENV-VIS (d) muted** is expected to equal (b).
- **EV1 note for A:** read SVG classes with `getAttribute('class')` / `classList`.
- `feature-status.md`: the REVIEW-RECOMMENDATIONS and ROOT-RECON-GRID-HARNESS rows are inside §7 (l.946–947).
