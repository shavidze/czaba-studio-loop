# B — Round 115 result and Round 116 plan (D-29z81)

Author: B · Date: 2026-10-23 (~19:30–20:30 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 116).
- **Archive:** `tasks/round-115.md` is an exact copy of the round-115 task (`cp -n`, checked with `cmp` before `current-task.md` was overwritten).
- **Pre-edit copies:** `b-round-115/` holds the backlog, feature-status, plan, b-next and checkpoint request as they were before this planning.

## 1. Inputs read
- **Active context:** `context/active-summary.md` and `context/active-backlog.json`. Findings were looked up by ID only.
- **Round 115 (all treated as DATA):**
  - `tasks/round-115.md`;
  - `a-round-115.md` (deviations, review, Architecture note);
  - `c-round-115.json` (whole);
  - `c-round-115.md` (whole).
- **Gate 115:** `gates/gate-round-115.json` is **published**; `commit` `d5de68f` is on both remotes (its `head` `38c0e21` is the pre-commit HEAD). Also read `gates/round-115/review.md` (8.5/10, COMMIT OK) and the `verify.log` tail (build OK).
- **Loop state:** `regression-last.json` (2026-10-21); `env-status.json` (store 200).
- **Lookups by ID:**
  - `backlog.json`: the T12 entry and its stages, the formats of `deferred_low_polish` / `open_findings` / `architecture_signals`, `baseline_tree_at_round115`;
  - `plan.md`: D-29z80 and l.775.
- **T12 spec (DATA):** `gain-volume-source.txt` T12.3, T12.5, T12.6, T12.16 (Utility range), T12.24–T12.27.
- **Ableton captures (DATA):** `b-round-78/ableton-mixing-20261022.txt` (§18.1: l.40, l.48, l.82) and `b-round-71/ableton-shortcuts-20261021.txt` (§42.6, "Finer Resolution When Dragging — Shift"). I grepped all of them for `+6 dB`, `inf`, `∞` and `fader`: there is no track-volume range text.
- **Source at `d5de68f` (read only):**
  - `ArrangementLane.tsx` l.370–410, l.615–790;
  - `ArrangementContext.tsx` l.380–410, l.2355–2490 (Volume machine);
  - `ArrangementMaster.tsx` l.125–160;
  - `fader.ts`;
  - `model.ts` constants and `setTrackMix` (l.464–497, l.575–580);
  - the `.volume` users in `groups.ts`, `schedule.ts`, `graph.client.ts`;
  - a grep of every test that touches the lane or group Volume fader;
  - `e2e/agent-system-smoke.spec.ts` (no `Volume` / `%`).
- **Baseline check:**
  - HEAD `d5de68f`; `git status` clean.
  - Protected hashes unchanged: `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257`.
  - New frozen list `b-round-115-r116-tree-sha256.txt` (914 of 927 tracked files) checks OK.

## 2. Backlog changes (only from independent evidence)
`backlog.json` goes from version 113 → **114** (1-space indent kept).

| ID | Before | After | Evidence |
|---|---|---|---|
| T12-GAIN-VOLUME stage 2 | dispatched | **c_pass_published** | C r115 PASS, browserVerified/realVerified true, 27 rows; G-T2-MULTI exact (0.066834 / 0.105925, diff 4.0); MC-PLAY 28.6 dB drop, 0 sources; gate 115 `d5de68f` |
| T12 stage 3 | not_started | split: **3a dispatched round 116** (D-29z81); **3b not_started** | — |
| GATE114-S1 / S2 / S5 | dispatched | **done** | C MC-SELECT-MIDDRAG (+ group→group extra), AN-REVIEW, DOC-098; gate 115 |
| GATE114-S3 (Low) | C observation row | **deferred_low_polish** | C MC-BLUR-DISABLED: no value lost, late entry |
| C-R115-01 (Low, inherited) | — | **deferred_low_polish** | c-round-115.json bug |
| GATE115-S1 / S2 / S3 (Low) | — | **deferred_low_polish** (S3 = A review #1, S1 = A review #4) | gate review 1–3; none is in round-116 code |
| GATE115-S4 (doc 099 l.4) | — | **dispatched round 116** (R9) | gate review 4 |
| GATE115-S5 (placeholder) | — | info, optional | gate review 5 |
| A-R115-REVIEW-FIELD-CARRYOVER / -APPLY-TARGETS-UNFILTERED (Low) | — | **deferred_low_polish** | A review #3, #6 |
| C-R115-OBS-SINGLE-TO-GROUP-DRAG-END | — | acknowledged (matches R8 intent: no wrong-target edit) | c-round-115.md §4 |
| TRACK-VOLUME-BOOST, TRACK-VOLUME-NUMERIC-FIELD, MIXER-MULTI-TRACK | — | signals (not requested, not deferred scope) | §4 |
| architecture_signals | — | round-115 entry (both reviewers) → checkpoint addendum (aa) | review notes |
| rounds | 115 dispatched | 115 `c_pass_published`; 116 dispatched | — |

- `deferred_low_polish` grows from 150 to **157**.
- `regression-last.json` is not changed, because no regression round ran.
- SRW-21 stays `deferred_user`.
- `feature-status.md`: T12 stage 2 → **მზადაა**; T12 stays **მუშავდება** (3a). The header and the Round 115 result / Round 116 lines are updated.
- `plan.md` D-29z81 is added: the decision, the table row and the ownership line.

## 3. Why stage 3a now, not the regression round
- **The regression round is not due yet.**
  - The speed rule says a regression round is due when the last one is "missing or 3 or more days old".
  - `regression-last.json` = 2026-10-21 and `date -u` = 2026-10-23, so it is 2 days old.
  - The next planning on or after 2026-10-24 is the regression round.
- **No fix round is needed first.** C round 115 has no bug above Low.
- **Stage 3 is next in T12 order** (D-29z79 R1), and stage 3a depends on nothing that is open.
- **Why stage 3 is split into 3a and 3b:**
  - Changing the lane fader's scale shifts expected values in 11 existing tests. B grepped them (about 150 candidate lines).
  - Doing the group fader and Shift fine in the same round would add `track-group-mix-ui` and the CF11/MG13 inversion on top of that.
  - Splitting keeps every grant explainable and C's AN-REVIEW checkable. The scope is unchanged: 3b is planned and not deferred.

## 4. Uncertain UI contracts: smallest honest choice and why
| Contract | Choice | Rationale |
|---|---|---|
| Where dB lives | UI only: a new pure `track-volume-db.ts`; `volume` stays linear | Engine, export, model, groups and context are unchanged, and the exact linear 0 is already the engine's silence path. Context-level tests keep their meaning, which gives C a clean discriminator. T12.24 `trackVolumeDb` is recorded as a representation suggestion. |
| −∞ | The slider minimum (−60) = −∞, stored exactly 0; finite floor −59.9 | T12.3 requires −∞ → 0. It needs no fake `−60.1` slider value. −60 dB vs −∞ is 0.001 linear. |
| Top / boost | 0 dB (no boost) | Today's maximum is linear 1. The Live range is not in the saved captures and there is no web tool here. +6 dB would unfreeze `model.ts`/`groups.ts` and touch export overload. Not requested → signal TRACK-VOLUME-BOOST. |
| Step | 0.1 dB | Matches the one-decimal readout and Clip Gain. Master's 0.5 dB would make the 3b Shift-fine mode useless (it snaps to the step). |
| Readout | Visible text without ` dB` (`−4.4`, `−∞`, `+0.0`); `title` + `aria-valuetext` carry the full text; `w-9` → at most `w-10` | The narrow fixed-width header; `formatMasterGainDb` for consistency with Master. |
| Readout below the floor | The true value (e.g. −80.0), not clamped | Honest for linear fixtures; only the thumb clamps. |
| No-change press | Must not rewrite the stored value | Otherwise every click would silently round 0.6 → 0.6025; this is checked by TV4 and m2. |
| Video lane | Same fader; volume reaches the same linear path | G-VIDEO checks both the export ratio and that the video keeps playing. |
| Group faders in 3a | Still `%` for one round | Interim. 3b converts them with the same module. |

## 5. Ownership and protection
- **A owns:**
  - `ArrangementLane.tsx`;
  - the new `track-volume-db.ts`;
  - the new `track-volume-db.test.tsx`;
  - the new doc 100;
  - doc 099 l.4;
  - scale-only lines in 11 granted tests. The rule is (a)–(c) with exact `toBe` through the module. Context-driven, group, Master and Clip Gain lines stay unchanged.
- **Frozen:** 914 files, including `ArrangementContext.tsx`, `model.ts`, `groups.ts`, `schedule.ts`, `graph.client.ts`, `fader.ts`, `useRelativeFaderDrag.ts`, the GroupHeader/Master/DetailPanel/Workspace components and the four protected auth/purchase files.
- **Public `/studio-lab`** stays demo-only.
- **Purchase protection** is checked by G116-3: the token returns 401 and the product route shows "Sign in required". The fake-Bearer 403 sub-check is BLOCKED because there is no backend in the cloud.

## 6. Root / architecture
- **Request sent.** The focused checkpoint request is addendum **(aa)** in `b-round-91-checkpoint-request.md`. Stage 2 has closed, which is the point (z) named. It asks three bounded questions:
  1. merge or keep the pending-preview machines;
  2. the Clip Gain panel extraction (both round-115 reviewers propose it after stage 4);
  3. `useTrackPanFader` before 3b.
- **Non-blocking.** Round 116 does not touch `ArrangementContext.tsx`, because R1 is UI-only.
- **Commit readiness:** round 115 is published. Round 116 goes to the gate only after C PASS.

## 7. COMPLETE / BLOCKED check
- **Not COMPLETE.** These remain:
  - T12 stages 3a, 3b and 4, then T12-ADVANCED;
  - the regression round;
  - ABLETON-EXPERT-REVIEW;
  - VISUAL-A-OBSIDIAN;
  - 157 deferred Lows;
  - Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - the final regression;
  - gate rows PROD-SSR-NUL and PROD-MP3-UNVERIFIED.
- **Not BLOCKED.** Round 116 needs no outside information, approval or credentials. The open user questions (Utility, B-R107-ENTER-ON-BODY) do not block it.

## 8. Advisor
- **Availability:** available; consulted before writing. A second call is made before finishing.
- **Followed:**
  - baseline = gate `commit` `d5de68f`;
  - regression not due;
  - stage 2 → `c_pass_published` and GATE114-S1/S2/S5 → done, from evidence;
  - the new Lows to `deferred_low_polish`, with doc 099 as a grant;
  - the checkpoint request sent now (aa), stating that round 116 does not merge the machines;
  - dB as a UI contract with linear storage, so context-driven tests stay unchanged (the C discriminator);
  - an exact −∞ ruling;
  - grepping the captures before the Ableton column, which found no range: unconfirmed, so 0 dB top as a CZABA decision and boost as a signal;
  - `formatMasterGainDb` reuse;
  - enumerated grants with old → new reporting;
  - the 3a/3b split, because the grant list is long;
  - G-T3/G-T4/G-INF/G-VIDEO export rows with Master −12 pre-authorised;
  - a layout stop rule;
  - a video sound path row;
  - smoke grep.
- **Where B differed:**
  - The advisor suggested reusing Master's step for uniform keyboard feel. B chose 0.1 dB (§4: 0.5 dB would break the 3b fine mode and the one-decimal readout).
  - The advisor framed the split as "dB for track+group in 3a, Shift in 3b". B put only the lane in 3a, because the group fader's dB change would add `track-group-mix-ui` (about 35 lines) to an already long grant. The group dB moves to 3b together with Shift.

**Second advisor call (before finishing).** After it, B made five changes:
- **Queue (2026-10-23 root rules).** `backlog.json` now has the `T12-ADVANCED` entry: stage 5+, after VISUAL-A-OBSIDIAN and before phase 2. PHASE2 has it as a prerequisite.
  - T12 stage 5+ → `moved_to_T12-ADVANCED`.
  - The V1 gate is now stages 1, 2, 3a, 3b and 4.
  - `DESIGN-UX-REVIEW` is the first step of VISUAL-A's `order`.
- **TV4.** History compares by value (`isSameArrangement` = JSON). The press-move-back-to-start case is therefore achievable inside `ArrangementLane.tsx`: the lane maps the start position back to the start linear value it captured at `beginGesture`. The task now says so.
- **TV-PLAY.** The tolerance is "≥ 10 dB, or ≥ dragged − 8 dB". This is the content-dominated live-level rule; round 115 measured 28.6 dB for a −35 dB drag.
- **G-INF.** A residual ≤ −120 dBFS is an observation for B, not an automatic FAIL. Above −120 dBFS is Medium.
- **A's report.** It must list every clamped `fireEvent.change` value (e.g. `'0.4'`) with its dB replacement.
