# B — Round 121 result → Round 122 plan (D-29z87)

Date: 2026-10-24 (planning started 00:18:55 UTC, `date -u`) · Author: B · Advisor: available, used before writing and before finishing.

## 1. Inputs read
- `context/active-summary.md` (whole), `context/active-backlog.json` (structure, recent rounds).
- `current-task.md` (round 121), `a-round-121.md`, `c-round-121.md`, `c-round-121.json`.
- `gates/gate-round-121.json`: `published`, commit `425a807…`, on both remotes. Also `gates/round-121/review.md` (8.5/10, COMMIT OK) and the `verify.log` tail.
- `env-status.json` (store 200), `regression-last.json` (2026-10-21).
- `backlog.json`: only the queue, items, stages and findings by ID.
- `e2e/agent-system-smoke.spec.ts`, `playwright.smoke.config.ts`, `.gitignore`.

## 2. Evidence-based updates (only from independent C/gate evidence)
| ID | Before | After | Evidence |
|---|---|---|---|
| T12 stage 4b | dispatched | **c_pass_published** | `c-round-121.json`: PASS with `browserVerified` and `realVerified`, 0 bugs, 23 rows passed. Gate 121 published `425a807` |
| T12-GAIN-VOLUME | in_progress | **v1_complete** (stages 1–4b); stage 5+ = T12-ADVANCED, not started | same evidence |
| round 121 | dispatched | c_pass, gate published | same evidence |
| ABLETON-EXPERT-REVIEW | queued | next after the regression round; T12 V1 prerequisite met | — |

Nothing else changed status. Every phase-1 status stays as it was: no new evidence, and the regression round re-checks them.

## 3. Why round 122 is the regression round
- `regression-last.json` is 2026-10-21 and planning is 2026-10-24, which is 3 days. The speed rules make the next round a REGRESSION round instead of new scope.
- It follows the round-112 pattern:
  - **A** changes only line 4 of docs 102 and 103 (stale "In Progress"; this fixes gate-121 reviewer suggestion 6, and doc 102 had the same stale line);
  - **C** does the browser sweep.
- The loop runs B → A → C, so findings are fixed in **round 123** as a bounded fix-up. The outcome table in `current-task.md` §6 fixes this in advance.
- **`regression-last.json` is not updated now.** B updates it at round 123 planning, once C has run every row. If rows are left over, it waits until they have run.
  - **Ordering:** at round 123 planning, update `regression-last.json` from round 122's C result **before** applying the 3-day rule. It will still read 2026-10-21, and the rule would otherwise plan a second regression round.

## 4. Scope of the sweep (no shrinking)
- **One row per item that is done or c_pass:**
  - SRW-01..SRW-24, except SRW-21 (`deferred_user`);
  - the T12 stages 1, 2, 3a, 3b, 4a and 4b;
  - each at both viewports.
- **Rows that earlier findings parked "for the regression round":**
  - C-R83-S-1280-RANGE-SHIFT;
  - GATE85-S6-ROW-BOUNDARY-HANDLES;
  - TOUCH-LONGPRESS-CONTEXTMENU;
  - GATE111-SUGG-E2E-S5;
  - gate-121 suggestion 7 (header width).
  - For each, B pre-ruled which result counts as Low and which as Medium.
- **Smoke:** `npm run test:e2e:smoke` covers only `/cart`. The task says it is not Studio coverage. It must run serially, because it starts its own dev server on 5187.
- **SRW-03 drift:** keeps the round-112 rules unchanged. A failure that matches C-R6-02 is recorded as a known recurrence; any other failure is a new finding.
- **Backend-dependent checks** go under `blocked` and do not flip `browserVerified`.

## 5. Gate-121 reviewer suggestions and the Architecture note
| Suggestion | Ruling |
|---|---|
| S1/S2: no affordance and no hover on the zoom select | The hover class is the new deferred Low **GATE121-S1-ZOOM-NO-HOVER**. The affordance question is merged into WAVEFORM-ZOOM-DISCOVERABILITY (DESIGN-UX-REVIEW) |
| S3: literal default `1` instead of `WAVEFORM_ZOOM_DEFAULT` | Deferred Low **GATE121-S3-DEFAULT-LITERAL** |
| S4: render cost | Acknowledged (info). It is the same cost class as horizontal zoom |
| S5: aria-label language | DESIGN-UX-REVIEW signal **GATE121-S5-ARIA-LANGUAGE** |
| S6: doc 103 status | Fixed in round 122 by A, together with doc 102 |
| S7: header width | C row **RP-HEADER-WIDTH** |
| Architecture note, Signal 4 (keep) | Signal **ARCH-R121-LANE-VIEW-OPTIONS**, an addendum to ARCH-CHECKPOINT-SRW14-PREFS |

- `deferred_low_polish`: 160 → **162**. None was dropped.
- T12 V1 is a feature boundary, so B wrote a bounded request to root: `b-round-121-checkpoint-request.md`, with four questions answered keep/extract.
  - It is non-blocking, and no refactor is scheduled without root's result.

## 6. Ableton
- The regression round adds no behaviour, so C judges only the CZABA requirement.
- C round 121's unconfirmed rows are now in `ABLETON-EXPERT-REVIEW.inputs_from_round121`:
  - the stepped select vs the slider;
  - zoom not being an Undo step;
  - the detail panel not zooming;
  - video not zooming.

## 7. Files written by B
- `tasks/round-121.md` (copy, `cmp` OK);
- `current-task.md` (round 122);
- `b-round-121-r122-tree-sha256.txt` (935, OK on the clean `425a807`);
- `backlog.json` (version 120; backup at `b-round-121/backlog.pre-r122.json`);
- `feature-status.md` (backup at `b-round-121/feature-status.pre-r122.md`);
- `docs/technical/studio-real-workspace/plan.md` (D-29z87; backup at `b-round-121/plan.pre-r122.md`);
- `b-round-121-checkpoint-request.md`;
- `b-next.json`.

Helper scripts are in `b-round-121/tools/`. B did not touch any app or store file.

## 8. Decision
**CONTINUE.**
- **Not COMPLETE.** Still open:
  - the regression round itself;
  - ABLETON-EXPERT-REVIEW, DESIGN-UX-REVIEW and VISUAL-A;
  - T12-ADVANCED;
  - 162 deferred Lows;
  - the Tech Lead checks;
  - SRW-21 (`deferred_user`);
  - the final full regression;
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED.
- **Not BLOCKED.** No outside information or approval is missing for the next round.
- **Commit readiness:** round 121 is already published. Round 122 changes two doc lines only, and they can be published once C passes.
