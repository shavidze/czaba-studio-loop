# B round 96: review of round 96 → round 97 task (D-29z62)

Dispatcher: B · Date: 2026-10-23
- **Advisor:** configured and available. I consulted it once before writing. I followed its advice:
  - archive and back up first;
  - regenerate the baseline at `ce44036`;
  - confirm that the held-Enter bug can be reached in a browser before writing the row;
  - close GATE90-S5 by decision instead of opening an existing test file;
  - record the two converging Architecture notes as a checkpoint addendum, not as a task.
- **Advisor, second call:** before finishing (see the end of this file).
- **Project subagents:** none consulted.

## Inputs read
- **Active context first:** `context/active-backlog.json` (open items), and `context/active-summary.md` (head only; 235 KB). I opened `backlog.json`, `feature-status.md` and `plan.md` only by ID.
- **Round 96 files:**
  - `current-task.md`, archived unchanged as `tasks/round-96.md` (sha256 `5d25d47d…`, identical; the archive did not exist before);
  - `a-round-96.md` (reviewer findings and the Architecture note);
  - `c-round-96.md`, `c-round-96.json`.
- **Gates and environment:**
  - `gates/gate-round-96.json`: **published**, commit `ce44036` on both remotes. This is the round 97 baseline.
  - `gates/round-96/review.md` (9/10, no Critical or High);
  - `gates/round-96/verify.log` (141 files pass, build OK);
  - `env-status.json`: store 200;
  - `regression-last.json`: 2026-10-21.
- **Root files:** I grepped `root-pre-push-review.md` and `publication-checkpoint.json` for round 96 or new IDs and found nothing new.
- **App source, read only** (all at `ce44036`):
  - `ArrangementExportDialog.tsx`: l.130–256 and l.480–571;
  - `export-cancel.ts`: l.1–44;
  - `ArrangementContext.tsx`: l.2975–2990 (`cancelExport`);
  - the `export-cancel-ui.test.tsx` test names;
  - `gates/round-90/review.md` #3–#5;
  - `c-round-90.md` (CX-KEYS method).
- **No edits outside my files.** `git status` in `store/` was empty at `ce44036`. Everything I read was treated as data.

## Round 96 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, **0 bugs**.
- **Browser rows:**
  - FAIL-ADD and FAIL-PREVIEW at both viewports. Preview output RMS went from 0.031 to 0 after ArrowUp onto the failed row.
  - FAIL-DBL, FAIL-BOTH, LOADING-REG (old text while pending), READY-REG, DEMO-LOAD-REG, HISTORY-REG (no Undo entry from a refusal), PX-NET, REG-HYD, G96-3.
- **Test review:** AN-REVIEW (C's own mutations a, b and d red; fail-before identical to the task), T96-TARGETED (6 files, 83 tests), SOURCE-UNCHANGED.
- **Blocked:** the fake-Bearer sub-check (backend unavailable in the cloud). It is open evidence, not a bug.
- **Notes:** C-R96-N1 (measurement method) and C-R96-N2 (HERO row used instead of a synthetic row). I accept N2: the synthetic preview is covered by READY-REG.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| C-R95-N1-FAILED-SOURCE-ADD-TEXT | → **closed** | C round 96 PASS browserVerified + gate 96 |
| GATE95-S1-DOC083-STATUS | → **closed** | C SOURCE-UNCHANGED + gate 96 |
| GATE90-S3-HOLD-ENTER-CLOSES | → dispatched round 97 | gate 90 review #3; B probe |
| GATE90-S4-CANCEL-DISABLED-CLASS | → dispatched round 97 | gate 90 review #4 |
| GATE90-S5-UNUSED-PREDICATE | → **closed by B decision** (keep; see below) | gate 90 review #5 offered "keep for tests" |
| GATE96-S1-DOC084-STATUS | **new** Low → round 97 | gate 96 review #1 |
| GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED | **new** Low → Lows batch | gate 96 review #2 (existing behaviour, not a regression) |
| GATE96-S3-DOUBLE-STATE-READ | **new** info, not scheduled | gate 96 review #3 |
| C-R96-N1, C-R96-N2 | recorded, closed (info) | C notes |
| ARCH-R96-REFUSAL-MAPPING | **new** architecture signal, not scheduled | both reviewers' Architecture notes |
| ARCH-R93-TEST-HARNESS | data point added (FakeAudioContext copied again) | gate 96 "Test fixtures" note |
| architecture_signals | round 96 entry added | — |

**Backups:**
- `b-round-96-backlog-before.json`
- `b-round-96-feature-status-before.md`
- `b-round-96-plan-before.md`
- `b-round-96-b-next-before.json`

**Round 97 baseline files:**
- the frozen list `b-round-96-r97-tree-sha256.txt` (526/526 OK at `ce44036`; the protected hashes match the earlier rounds);
- the snapshots in `b-round-96-r97-snapshots/` (`ArrangementExportDialog.tsx` `0040e050`, 571 lines; doc 084 `869f9238`, 62 lines; both LF with CR=0).

**Status board:** C-R95-N1 and GATE95-S1 are closed. No scoped item changed to მზადაა; these were bugs, not scoped features.

## Browser-reachability probe (B, read-only)
`b-round-96-probe/probe.cjs` ran on a plain `setContent` page in the installed Chromium; it did not touch the app or the repository. Result (`probe-result.json`):
- **Playwright `keyboard.down('Enter')` twice:** `a:keydown repeat=false → a:click` (a removes itself and focuses b), then `b:keydown repeat=true → b:click`. This is the exact GATE90-S3 pattern.
- **CDP `autoRepeat: true` without the guard:** a keydown with `repeat=true`, then a click.
- **With the guard** (`preventDefault` on a repeated Enter): a keydown with `repeat=true` and **no click**.
- **A fresh Enter with the guard:** a keydown with `repeat=false`, then a click.

**What this proves:** C can test HOLD-ENTER in the real browser.
**What it does not prove:** I did not reproduce the bug inside the app. A's optional pre-edit reproduction covers that.

## Round 97 task (summary)
**Export Lows part 1: the dialog footer** (D-29z62). Baseline `ce44036`, clean tree. Expected end state: **2 M + 2 ??**.
- **E1:** the „დახურვა“ button gets `onKeyDown`: `key === 'Enter' && repeat` → `preventDefault` only.
- **E2:** the Cancel button loses `disabled:opacity-40`.
- **Tests:** a new `export-dialog-hold-enter.test.tsx` with HE1–HE7. The expected fail-before is HE1, HE4, HE5 and HE7 red. Mutations a–f.
- **Docs:** doc 084 l.4 and a new doc 085.
- **C rows:**
  - primary: HOLD-ENTER at both viewports, with `repeat` flags recorded;
  - also HOLD-ENTER-MP3, FRESH-ENTER-CLOSES, SPACE-REG, CANCEL-CLASS, CX-REG (a real decodable WAV afterwards), DONE-REG, ESC-REG, PX-NET, REG-HYD and G97-3;
  - test review: AN-REVIEW, T97-TARGETED, SOURCE-UNCHANGED.

## Why this scope (not a regression round)
- **Not due:** 2026-10-21 → 2026-10-23 is 2 days, and the rule needs 3 or more. **The first round planned on or after 2026-10-24 is the regression round**, which is most likely round 98.
- **No open C bug.** The next items in the order fixed in b-round-95.md are the Export Lows. S3 and S4 sit in the same footer of one component, which keeps this to one owner and two related Lows.

## Uncertain UI contracts (smallest honest choice, with rationale)
- **Guard only a repeated Enter on Close, in every phase.** A held Enter on Close is never a deliberate second action. Tying the guard to the cancel moment would need state or a timer. Delaying focus would change frozen focus rules. Space activates on keyup, so a held Space is not part of the bug.
- **No `stopPropagation`.** The dialog's own key handling and the Tab trap keep seeing the event (HE6).
- **Cancel's `disabled:` token is removed, not kept as a copy.** It has no reachable state. Doc 078's "intentional copy" note is superseded for that token, and doc 085 records this.
- **GATE90-S5 is kept by decision.** The predicate is the type guard of an exported error class, and the regression tests use it. The app checks `signal.aborted`, which is the better design (gate 90 reviewer). Removing it would mean opening a frozen test file for an info item, and it would add no user value. This is a recorded resolution, not a deferral.

## Ableton
No Ableton claim. This is browser key-repeat behaviour on CZABA's own web dialog, so the row is marked "არ ეხება".

## Architecture checkpoint
- Both reviewers of round 96 (A's and the gate's) independently raised Signal 3 on the library refusal texts in `ArrangementContext.tsx` and on the copied audio fakes. Each says keep for now.
- I recorded the first as `ARCH-R96-REFUSAL-MAPPING` and added the second as a data point to `ARCH-R93-TEST-HARNESS`. Neither is scheduled.
- I appended **q14 (i)** to the standing request `b-round-91-checkpoint-request.md`. (g), (h) and (i) all concern the same owner and its test harness. The request to root is one bounded read-only frontend-architect checkpoint on all three. It is **non-blocking**.
- Round 97 does not touch `ArrangementContext.tsx`.

## Next
1. **Round 97 (this task):** GATE90-S3, GATE90-S4, GATE96-S1.
2. **The first round planned on or after 2026-10-24: the regression round.**
   - C checks every done or c_pass item once in the browser, at both viewports, and runs `npm run test:e2e:smoke`.
   - A fixes only what C finds.
   - B updates `regression-last.json` when the round closes.
3. **Then the remaining Export Lows,** in this order: GATE89-S4 + A-R88 #4, GATE89-S6, GATE89-S3, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER.
4. **Then:** GATE96-S2 → grid/tempo Lows → R21-I2 → T12 → VISUAL-A-OBSIDIAN.
5. **When the auth owner releases the mount:** SRW-21-PREMOUNT, then the mount.

Scope is not reduced, and nothing is deferred without the user. Plugins, effects, pitch and multi-video layers stay out of scope, as the user decided. Grid tempo is not audio stretch.

## Commit readiness
- Round 96 is already published (`ce44036`).
- Round 97 has nothing to commit until C passes.

## COMPLETE check
Not complete:
- the SRW-21 purchased mount, SRW-21-PREMOUNT and R21-I2 are open (the mount waits for the auth owner's release);
- T12 and VISUAL-A-OBSIDIAN have not started;
- open Lows remain (GATE90-S3/S4, the other Export Lows, GATE96-S2, the grid/tempo Lows);
- the regression round is due from 2026-10-24;
- Tech Lead manual checks are open;
- PROD-MP3 is unverified in the production bundle.

Not BLOCKED: independent scope remains, and only the mount needs an external release.

## Advisor, second call (before finishing)
- **No contract changes.** The advisor confirmed:
  - the fail-before and mutation mapping (b → HE2/HE4; d is caught by HE6; f is caught by HE5);
  - that the `fireEvent.keyDown` return value works for these assertions;
  - the corrected line ranges (Cancel l.528–535, Close l.537–545);
  - that HOLD-ENTER waits for the focus effect.
- **Optional sharpening, adopted:** C row **OPEN-HOLD** (1280 only). Holding Enter on the toolbar Export button opens the dialog with the initial focus on Close, and the repeat keydown would close it at once. The every-phase guard covers this, and the E1 rationale now says so.
