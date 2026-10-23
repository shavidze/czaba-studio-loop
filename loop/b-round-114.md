# B — Round 114 result and Round 115 plan (D-29z80)

Author: B · Date: 2026-10-23 (~18:00–19:00 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 115).
Archive: `tasks/round-114.md` is an exact copy of the round-114 task (`cp -n`, checked with `cmp` before `current-task.md` was overwritten). Pre-edit copies (backlog, feature-status, plan, b-next, checkpoint request) are in `b-round-114/`.

## 1. Inputs read
- `context/active-summary.md`, `context/active-backlog.json` (current items, other open items; findings by ID only).
- Round 114: `tasks/round-114.md` (the task), `a-round-114.md` (deviations, review), `c-round-114.json` (whole), `c-round-114.md` (not re-read whole; the JSON carries the rows, bug and measurements).
- Gate 114: `gates/gate-round-114.json` — **published**, `commit` `38c0e21` on both remotes (its `head` `c2837f1` is the pre-commit HEAD); `gates/round-114/review.md` (8.5/10, COMMIT OK), `verify.log` tail (build OK).
- `regression-last.json` (2026-10-21), `env-status.json` (store 200).
- `root-pre-push-review.md` / `publication-checkpoint.json`: the review is the 2026-10-07 round-3 review (historical, its findings were triaged long ago); no new remaining finding for this round.
- Lookups by ID: `backlog.json` T12-GAIN-VOLUME (stages), GATE113-S1, ARCH-R81, ARCH-CHECKPOINT-PHASE1-BOUNDARY, the deferred-Low and architecture-signal formats; `plan.md` D-29z79 and l.636/l.775 (saved Ableton citations).
- T12 spec (DATA): `gain-volume-source.txt` T12.7 (l.237–274) and T12.8.
- Source at `38c0e21`, read only: `ArrangementDetailPanel.tsx` l.40–120, l.225–690; `StudioWorkspace.tsx` l.2095–2140 (`detailSelection`/`detailGroup`), l.2450–2475, l.1800–1820 (Ctrl+A); `ArrangementContext.tsx` l.1075–1165, l.2630–2900 (clip gain machine); `model.ts` l.500–534, l.575–580; grep of every test that references the Clip Gain controls or the group reason.
- Baseline check: HEAD `38c0e21`, `git status` clean, protected hashes `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257` unchanged; new frozen list `b-round-114-r115-tree-sha256.txt` (915 of 924 tracked) checks OK.

## 2. Backlog changes (only from independent evidence)
`backlog.json` 112 → **113** (1-space indent kept).

| ID | Before | After | Evidence |
|---|---|---|---|
| T12-GAIN-VOLUME stage 1 | dispatched | **c_pass_published** | C r114 PASS, browserVerified/realVerified true, 29 rows; G-T2 0.50119, +3 dB 1.41254, G-T8 0 LSB, G-T9 −124.4 dBFS, G-NONDESTRUCT 0 LSB; gate 114 `38c0e21` |
| T12 stage 2 | not_started | **dispatched round 115** (D-29z80) | — |
| GATE113-S1-DOC097-STATUS | dispatched | **done** | C DOC-097-L4 PASS; gate 114 |
| GATE114-S1 / S2 / S5 (Low, new) | — | **dispatched round 115** (R8–R10): stage 2 rewrites exactly that code; cheap | gate review 1, 2, 5 |
| GATE114-S3 (Low, new) | — | C observation row MC-BLUR-DISABLED, no code | gate review 3 |
| GATE114-S4, A-R114-REVIEW-FINEDIVISOR-VALIDATION (info) | — | acknowledged | gate review 4; A review Low 6 |
| C-R114-01 (Low, pre-existing) | — | **deferred_low_polish** | c-round-114.json bug; info column, not Clip Gain code |
| A-R114-REVIEW-DBL-1PX / -PREVIEWARR-FLUSH / -DISABLED-STYLE (Low) | — | **deferred_low_polish** | A review Lows 5, 8, 7 |
| ARCH-R114-PENDING-PREVIEW-MERGE | — | architecture signal + checkpoint addendum (z) | both round-114 Architecture notes |
| rounds | 114 dispatched | 114 `c_pass_published`; 115 dispatched | — |

`deferred_low_polish`: 146 → 150. `regression-last.json` not changed (no regression round ran). SRW-21 stays `deferred_user`. Feature-status: T12 stage 1 → მზადაა; T12 stays მუშავდება (stage 2); header bullet and Round 114 result / Round 115 lines added.

## 3. Why stage 2 now, not the regression round
- Speed rule: "missing or 3 or more days old". `regression-last.json` = 2026-10-21, `date -u` = 2026-10-23 → 2 days. Not due. Every previous B report says the first planning on or after 2026-10-24; B keeps that.
- C round 114 has no bug above Low, so no fix round comes first.
- Stage 2 depends on stage 1 only (it reuses the fader/field/`0 dB`). It is written self-contained, with neighbour rows (NB-SINGLE, NB-TRACK-SHIFT, NB-MASTER, MC-LAYOUT, MC-PLAY) inside it, because the next planning is almost certainly the regression round.

## 4. Uncertain UI contracts — smallest honest choice and why
| Contract | Choice | Rationale |
|---|---|---|
| Video in a multi-selection | Disabled with a new reason; no partial edit | Silent editing of only some selected clips would mislead; disabling matches the single-video rule and keeps the granted tests at the same strength. "Apply to audio members only" is a possible later change, recorded here, not scheduled. |
| Relative edit at the bounds | Shared delta clamped to `[MIN − minDb, MAX − maxDb]` | The backlog stage text and T12.7 ("relative difference maximally preserved"): differences stay exact instead of collapsing at a bound. |
| Mixed display | Range text node + `aria-valuetext`, field empty | A `type="number"` field cannot show a range; a painted slider indicator needs custom CSS (forbidden). T12.7 itself offers `Gain: -6 … +1 dB`. |
| Fader anchor when mixed | `maxDb` | One scalar is needed by the relative hook; the max is where the upper clamp applies; the range text carries the truth. |
| Typing in the field when mixed | Absolute set for all members | Keeps "exact numeric input" (T12.8) for multi; Live behaviour unconfirmed → CZABA decision. |
| Reset | All members → 0.0, one entry, none if already all 0 | Same as stage 1, extended to the set. |
| Hook/model | Frozen; new pure module `clip-gain-multi.ts` | The hook changed in rounds 113 and 114; smaller blast radius. |
| Layout | No new row; block may widen to `w-56`; stop-and-report if it cannot fit | A's round-114 probe showed zero spare height at 1280 (and C-R114-01 already clips the info column). |

## 5. Ownership and protection
- **A:** 3 app files, new `clip-gain-multi.ts`, new `clip-gain-multi.test.tsx`, new doc 099, doc 098 (R10), and named lines in 5 existing tests (`clip-gain-fader`, `clip-gain`, `detail-panel-reason`, `detail-panel-fit`, `pending-status`). Each granted line asserts "two audio clips → disabled with the old group reason", which stage 2 inverts on purpose; the replacement is a selection with a video clip, at the same strength. Any other frozen-test failure → A stops and reports.
- Frozen: 915 files, including `model.ts`, `fader.ts`, `useRelativeFaderDrag.ts`, the Lane/Master/GroupHeader/Transport components and the four protected auth/purchase files.
- Public `/studio-lab` stays demo-only; purchase protection is checked by G115-3 (token 401, product route "Sign in required"; the fake-Bearer 403 sub-check is BLOCKED by the cloud's missing backend).

## 6. Root / architecture
- Both round-114 reviewers flag the same structure: three pending-preview machines in `ArrangementContext` with ~10 flush sites (n² growth), and name **after stage 2** as the point to decide. Recorded as `ARCH-R114-PENDING-PREVIEW-MERGE` and addendum (z) in `b-round-91-checkpoint-request.md`. Not an A task.
- **Request to root:** the bounded frontend-architect checkpoint (per `store/.claude/references/architecture-checkpoint.md`) is still pending from round 113 (ARCH-CHECKPOINT-PHASE1-BOUNDARY, addenda (x)–(y)); (z) is added. B sends the focused request at the planning after stage 2 closes, before stage 3 touches the Volume machine. Non-blocking for round 115.
- **Commit readiness:** round 114 is published. Round 115 is ready for the gate only after C PASS.

## 7. COMPLETE / BLOCKED check
- **Not COMPLETE:** T12 stages 2–5+; the regression round; ABLETON-EXPERT-REVIEW; VISUAL-A-OBSIDIAN; 150 deferred Lows; Tech Lead manual checks; SRW-21 (`deferred_user`); the final regression; gate rows PROD-SSR-NUL and PROD-MP3-UNVERIFIED.
- **Not BLOCKED:** round 115 needs no outside information, approval or credentials. Open user questions (Utility under the effects exclusion, B-R107-ENTER-ON-BODY) do not block it.

## 8. Advisor
Available; consulted once before writing. Followed: baseline = gate `commit` `38c0e21`; regression not due (2 days); stage 1 → `c_pass_published` and GATE113-S1 → done from evidence; fold gate Lows S1/S2/S5 into stage 2 (S1 is load-bearing for a member-set gesture); S3 as a C row; C-R114-01 and A-review Lows 5/8 to `deferred_low_polish`; delta clamp as a pure function in a new file; anchor at max; range as text; enumerate the frozen-test grants instead of leaving A to stop; G-T2-MULTI with a fixed tolerance; honest Ableton column (range display confirmed by the saved 2026-10-12 record, relative preservation and the field rule unconfirmed); addendum (z). Where B differed: the advisor suggested applying multi edits to the audio members of a mixed audio+video selection; B chose to disable instead (smaller, no partial hidden effect; §4), and recorded the alternative.

**Second advisor call (before finishing).** B then edited the task: G-T2-MULTI drags **left** (−20 px) so the export oracle has no headroom/clipping dependency (a +17.5 dB shift would push the SFX clip past full scale); MC-BLUR-DISABLED now uses a keyboard selection change (Ctrl+A with a video clip present) because a mouse click blurs the fader first and would pass trivially, with an inconclusive rule; B grepped the remaining Clip Gain / multi-selection tests (`self-disabling-focus`, `fader-guards`, `fader-click`, `fader-focus-order`, `status-announcement-ui`, `detail-panel-polish`) and found no further two-audio-disabled assertion, so no extra grant; `detail-panel-reason` l.328 removed from the grant (scrollbar-class assertion only).
