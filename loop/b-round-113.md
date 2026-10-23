# B — Round 113 result and Round 114 plan (D-29z79)

Author: B · Date: 2026-10-23 (~16:40–17:30 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 114).
Archive: `tasks/round-113.md` is an exact copy of the round-113 task. It was made with `cp -n` and checked with `cmp` before `current-task.md` was overwritten.

## 1. Inputs read
- **Context:** `context/active-summary.md`.
- **Round 113:** `current-task.md` (round 113), `a-round-113.md`, `c-round-113.md`, `c-round-113.json`.
- **Gate 113:** `gates/gate-round-113.json`: **published**, commit `c2837f1cb72e702742a7cf51362214009983d30b` on both remotes. Its `head` field `ad58b5e` is the pre-commit HEAD.
  - `gates/round-113/review-result.json`: 9/10, COMMIT: OK, verify 151 files / 2341 tests, build OK.
- **Lookups by ID only:**
  - `backlog.json`: A-R38-REVIEW-TOUCH, TOUCH-DOUBLE-TAP-RESET, C-R6-02, C-R8-01, SRW-13, SRW-21 / R21-I2, the T12 queue entry, every finding with severity Critical/High/Medium (scan), `architecture_signals` (tail), the round/baseline formats;
  - `plan.md`: D-29z78, and l.636 / l.775 for the saved Ableton citations.
- **T12 sources (DATA):** `next-stage-t12/README.md` and `gain-volume-source.txt` (whole). `ableton-notes-source.txt` was not opened; it is recorded as unverified.
- **Source, read only, at `c2837f1`:**
  - `model.ts` l.18–22 and l.460–580 (gain, volume and master helpers);
  - `fader.ts`;
  - `useRelativeFaderDrag.ts` (whole);
  - `ArrangementDetailPanel.tsx` l.40–120, l.225–420 and l.540–600;
  - `ArrangementLane.tsx` l.740–785;
  - `ArrangementContext.tsx` l.371–375, l.500–530, l.1060–1075, l.2390–2420 and l.2590–2640;
  - `StudioWorkspace.tsx` l.2450–2470;
  - test files that reference the clip gain block (grep).
- **Baseline check:**
  - HEAD = `c2837f1`, and `git status` is clean;
  - protected hashes `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257` are unchanged;
  - the new frozen list `b-round-113-r114-tree-sha256.txt` (911 of 922 tracked files) checks OK.
- **Regression timing:** `date -u` gives 2026-10-23 16:39. `regression-last.json` is 2026-10-21 (2 days), so the regression round is not due.

## 2. Backlog changes (only from independent evidence)
`backlog.json` goes from version 111 to **112**. The pre-edit copies (backlog, feature-status, plan, b-next, checkpoint request) are in `b-round-113/`.

| ID | Before | After | Evidence |
|---|---|---|---|
| A-R38-REVIEW-TOUCH (Medium) | confirmed, dispatched r113 | **done for Chromium**; real device stays Tech Lead R38-T | C r113 PASS: TC-ZOOM valid 4/4, touchStart jumps 0/42, TC-REL/UNDO/TAP, MC-*, KB-ARROW, TC-VIDEO-VOL; gate 113 `c2837f1` |
| SRW-13 | in_progress_bug_open | **c_pass_tech_lead_manual** | task §5 rule; C-R41-01 is a Low |
| TOUCH-DOUBLE-TAP-RESET (info) | signal | + C's browser confirmation, + the gate reviewer's future-fix idea (not scheduled; R4 stands) | C TC-DTAP; review finding 2 |
| GATE113-S1-DOC097-STATUS (Low, new) | — | **dispatched round 114** (R9, one-line grant; A owns doc 097 anyway) | review finding 1 |
| TOUCH-LONGPRESS-CONTEXTMENU (info, new) | — | signal; a candidate row for the regression round | A reviewer; C §7 |
| R38-T-SR-SWIPE (info, new) | — | added to the Tech Lead R38-T checklist | review finding 3 |
| ARCH-CHECKPOINT-PHASE1-BOUNDARY (info, new) | — | requested from root (§7) | — |
| T12-GAIN-VOLUME | queued | **in_progress**: stage 1 is round 114. `t12_gate_status_round114_planning` = OPEN, plus `gap_analysis_round114` and `stages` 1–5+ | §3, §4 |
| rounds | 113 dispatched | 113 `c_pass_published`; 114 dispatched | — |

- **Feature-status:**
  - FB-05, FB-14 and SRW-13 → **მოწმდება**;
  - A-R38-REVIEW-TOUCH → **მზადაა (Chromium)**;
  - T12-GAIN-VOLUME → **მუშავდება**;
  - a Round 114 line is added, plus a header bullet.
- **Not changed:**
  - `regression-last.json`;
  - SRW-21 (`deferred_user`);
  - B-R107-ENTER-ON-BODY (still the user's open question);
  - the 146 deferred Lows.
  - No `deferred_low_polish` entry was added: GATE113-S1 is fixed in round 114.

## 3. The T12 gate
- **Open**, under the user's 2026-10-23 rule:
  - every phase-1 item is `done`, `c_pass_tech_lead_manual`, `verified_except_manual*` or `deferred_user`;
  - the Critical/High/Medium scan of `open_findings` finds 0 Critical and 0 High;
  - the only open Mediums are C-R6-02 / C-R8-01 (`open_tech_lead_quiet_chrome`, no app attribution) and A-R73-SAFARI-FLAG-FOCUS (no WebKit in the cloud). The root clarification puts all three on the Tech Lead list, and they do not block.
- **Phase 1 status:** complete for the gate, but **not finally accepted**. The deferred Lows, the Tech Lead checks, SRW-21 and the final regression (R21-I2) remain. This is recorded separately from T12 completion, as the queue entry requires.
- **Why T12 and not the regression round now:** the speed rule's "3 or more days" is not met (2 days). Every earlier B report said "first planning on or after 10-24", and B keeps that rule.
  - Round 114 is written as one self-contained stage. Its C rows include the neighbour regressions it can cause (NB-*).
  - The next planning (on or after 10-24) is the REGRESSION round.

## 4. T12 gap analysis (source at `c2837f1`)
| T12 | Today | Gap / stage |
|---|---|---|
| 12.1–12.3 Clip Gain, non-destructive, dB → linear | `gainDb` per clip, default 0, stored only when ≠ 0; `clipLinearGain = 10^(dB/20)`; range −60…+24 (model.ts l.21–22, 500–534) | Exists. −∞ is not representable for clip gain (the floor is −60 dB); recorded, not scheduled; clip mute covers silence |
| 12.5 / 12.24 Track Volume | linear 0…1, shown as %; group Volume the same (ArrangementLane l.756–780) | **Stage 3:** dB fader and readout, −∞ at the bottom (T12.3), track (incl. video) and group; range/boost ruling at that planning |
| 12.6 Clip Gain ≠ Track Volume | separate state and graph nodes | Exists |
| 12.7 Multi-clip Gain | field disabled for a multi-selection (`DETAIL_CLIP_GAIN_GROUP_REASON`) | **Stage 2:** relative differences kept (the delta is limited at the bounds), a range shown (e.g. `−6.0 … +1.0 dB`), one entry |
| 12.8 Gain UI | numeric field (step 0.1) + `0 dB` button; no slider, no double-click | **Stage 1 (round 114)** |
| 12.9 Fine adjustment | typed values (exists); no fine drag | **Stage 1** (Shift ×10, opt-in) |
| 12.10 Clip Gain Envelope | the SRW-18 clip volume envelope exists | Stage 5+: check the "relative modulation, never above the clip gain" semantics against SRW-18 |
| 12.11 Fade ≠ Gain | SRW-18 fades do not touch `gainDb` | Exists; C re-checks it in G-T9 |
| 12.12 Crossfade | none | Stage 5+ |
| 12.13 Micro fades | none | Stage 5+ (a preference) |
| 12.14 / 12.15 Volume automation + override | none | Stage 5+ |
| 12.4, Tests 5–6, the T12.25 FX step | no FX chain; effects/plugins are out of scope | **Not applicable.** The order without FX is still asserted (C G-T rows; later stages) |
| 12.16 / 12.17 Utility | none | **awaiting_user** (an effects device versus the out-of-scope rule). Kept in the stage list |
| 12.18 / 12.19 Waveform zoom ≠ gain, waveform shows gain | neither exists | **Stage 4** |
| 12.20–12.23 Meters, dBFS, overs | track and master peak meters with a clip latch (SRW-13 2b); master over warning on export | Exists. RMS/LUFS are stage 5+; C may re-check the dBFS semantics in G-T2 |
| 12.26 Tests 1, 2, 8, 9 | measurable on exports today | C rows G-T1/T2/T8/T9 in round 114. Tests 3/4 come in stage 3; Test 7 in stage 4 |

- **Why stage 1 is the fader:** T12.27 V1 items 1, 3, 6 and 7 already exist. Item 4 (Gain UI) is the first missing one, and item 5 (multi-clip) depends on it, because "moving the Gain control" needs a control to move.
- **Track Volume in dB** has no dependency on the fader. It was put third because it changes the semantics of every mixer fader (track, video, group) and their tests. It needs its own range ruling.

## 5. Round 114 (D-29z79) summary
- **Scope:** one feature stage.
  - A Clip Gain range fader (−60…+24 dB, step 0.1) in the detail panel, using `useRelativeFaderDrag`.
  - An opt-in Shift fine mode (×10, re-anchored at the toggle). The other faders stay byte-identical, and CF11/NB-TRACK-SHIFT check that.
  - Double-click → 0.0 dB, with no entry when the value is already 0.0.
  - Keyboard ±0.1 dB, and one `Clip Gain` entry per drag.
  - A live preview with no source restart. The basis: `gainDb` is excluded from `scheduleKey`, and C's CG-PLAY counts `createBufferSource`.
  - Typed pending text commits first through the existing blur path.
  - Disabled for a video clip, a multi-selection or no selection.
  - Plus GATE113-S1.
- **Uncertain UI contracts, decided in the smallest honest way (rationale):**
  - **Step 0.1:** equals the storage precision, so typed values sit on a step and the browser never sanitises the thumb.
  - **Fine ×10 with re-anchoring:** avoids a jump at the Shift toggle. The toggle behaviour is CZABA's own decision; Live's Shift-fine is confirmed only for controls generally.
  - **Double-click only, no context menu:** the spec says "or".
  - **Multi-selection stays disabled:** that is stage 2, and it is not hidden.
  - **Fine mode is opt-in for Clip Gain only:** Shift on the mixer faders belongs to stage 3. This keeps the round-113 fader contracts byte-identical.
- **A owns:**
  - 4 app files (the hook, the context, the detail panel, and the workspace props only);
  - the new `clip-gain-fader.test.tsx` (CF1–CF12, m1–m5) and doc 098;
  - doc 097 (R9);
  - six existing tests, conditionally, for the block/tab-stop/layout enumerations only, each change listed.
  - Frozen: 911 files.
- **C:** UI rows at 1440 and 1280; T12.26 Tests 1/2/8/9 and T12.2, measured on WAV exports; playback without restart; touch; neighbours; network/hydration; G114-3. All tolerances are fixed in advance.

## 6. Ownership and protection
- **A:** only the §2 paths of the task. `model.ts`, `fader.ts`, the Lane/Master/GroupHeader/Transport components and all other tests are frozen. So are the protected auth/purchase files.
- **C:** `tmp/studio-real-loop/c-round-114/**` and its reports.
- **Public `/studio-lab`** stays demo-only (G114-3). Purchase protection is checked by the token 401 and the "Sign in required" product route.

## 7. Root / architecture
- **Round-113 Architecture notes (signals, not tasks):**
  - Signal 4 (keep, both reviewers);
  - Signal 3 → the `useTrackPanFader` proposal. Recorded in `architecture_signals` and as addendum (x).
- **Feature boundary:** phase 1 is complete for the gate. That is the boundary the workflow names, and accumulated volume-machine risk lands on `ArrangementContext` in T12 stages 1–3.
  - **Request to root (once):** run the pending bounded frontend-architect checkpoint per `store/.claude/references/architecture-checkpoint.md`. The open questions are in `b-round-78/83/91-checkpoint-request*.md`, addenda (a)–(y).
  - The new question is (y): should the volume preview/commit machine move to a pure module before T12 stages 2–3? It sits next to (x).
  - **Non-blocking:** round 114 proceeds now.
- **Commit readiness:** round 113 is published. Round 114 is ready for the gate only after C PASS.

## 8. COMPLETE / BLOCKED check
- **Not COMPLETE:**
  - T12 stages 1–5+ are not done;
  - the regression round, ABLETON-EXPERT-REVIEW, VISUAL-A-OBSIDIAN, the 146 deferred Lows, the Tech Lead manual checks, SRW-21 (deferred by the user) and the final regression are not done;
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED are gate rows.
- **Not BLOCKED:** round 114 needs no outside information, approval or credentials.
  - The user questions (Utility under the effects exclusion, B-R107-ENTER-ON-BODY) do not block it.

## 9. Advisor
The advisor was available and was consulted once before writing. B followed it on these points:
- the baseline is the gate `commit` (`c2837f1`), not its `head`;
- the regression round stays at the next planning (the 3-day rule);
- the T12 gate was verified by a Medium+ scan before opening it;
- the spec and the code were read before the acceptance was written (§4);
- FX is "not applicable" and Utility is "awaiting_user", not dropped;
- the Ableton column is honest (earlier captures, not re-opened; the attachment notes are unverified);
- the GATE113-S1 grant, and the checkpoint re-request at the phase boundary.

B's own additions:
- the opt-in fine mode, to keep the round-113 contracts intact;
- the pending-text-then-drag two-entry rule;
- the CG-PLAY `createBufferSource` count;
- the export-based T12.26 rows.

**Second advisor call (before finishing).** B then edited the task:
- **R5:** `readStoredValue` reads the live arrangement. The track, Pan and Master faders already do this (`getArrangement()`, verified by B in source). CG-PENDING-DRAG now asserts the final value −3.0 + Δ.
- **A frozen test fails only because the new fader exists:** A stops and reports it, and does not edit the test. B's grep found only first-match and lane-scoped `input[type="range"]` selectors, which are expected to be unaffected.
- **G-T1 validity:** the baseline must have no full-scale samples; otherwise C uses another clip, or the row is marked inconclusive.
- **AN-REVIEW and R2:** the wording is now "computed values identical", not "source byte-identical".
- **CG-FINE:** the tolerance is now `Δ_fine ≤ Δ_drag / 5`.
