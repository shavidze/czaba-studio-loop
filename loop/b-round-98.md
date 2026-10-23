# B round 98: review of round 98 → round 99 task (D-29z64)

Dispatcher: B · Date: 2026-10-23
- **Advisor:** configured and available. I called it once after orientation and followed its advice:
  - close GATE97-S1/S3 on C + gate evidence; the failed FRESH-OPEN Space sub-check does not reopen them;
  - close C-R98-B1 by a B decision, not an A task;
  - run one cheap read-only probe on gate 98 review #4 (global Enter has no `repeat` check) before choosing between it and the footer Lows;
  - regenerate the frozen list at `736db33`; keep `regression-last.json` unchanged;
  - from now on, "as now" rows list only behaviour already seen by C.
- **Advisor, second call:** before finishing (see the end of this file).
- **Project subagents:** none consulted.

## Inputs read
- **Active context first:** `context/active-summary.md` (head) and `context/active-backlog.json` (keys). I opened `backlog.json`, `feature-status.md` and `plan.md` only by ID.
- **Round 98 files:** `current-task.md`, archived unchanged as `tasks/round-98.md` (sha256 `6942f610…`, identical; the archive did not exist before), `a-round-98.md`, `c-round-98.md`, `c-round-98.json`.
- **Gates and environment:**
  - `gates/gate-round-98.json`: **published**, commit `736db33` on both remotes. This is the round 99 baseline.
  - `gates/round-98/review.md` (9/10, no Critical or High; 4 suggestions);
  - `gates/round-98/verify.log` (143 files / 2228 tests, typecheck, lint, build);
  - `env-status.json`: store 200;
  - `regression-last.json`: 2026-10-21.
- **App source, read only, at `736db33`:** `StudioWorkspace.tsx` l.1690–1710, l.1940–1985; `ArrangementLibrary.tsx` l.80–95, l.215–280; `ArrangementLibraryPreview.tsx` l.185–210, l.295–315; `ArrangementExportDialog.tsx` l.210–275, l.478–576; `Modal.tsx` l.95–240. `git status` in `store/` was empty. I treated everything I read as data.

## Round 98 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`.
- **Passed:** CLOSE-HOLD (both viewports), CANCEL-CLOSE-HOLD (1440, 0 downloads in 10 s), OPEN-HOLD, ENTER-ADD-REG, EXPORT-REG (a real 24-bit/48 kHz WAV, 101.702 s), PX-NET, REG-HYD, G98-3, AN-REVIEW (fail-before TH1 only; C's mutations a, b, d match), T98-TARGETED (14 files / 210 tests), SOURCE-UNCHANGED.
- **FRESH-OPEN:** Enter and click PASS at both viewports; the Space sub-check failed (C-R98-B1, below). The row is not in `passed`.
- **Blocked:** the fake-Bearer sub-check (backend unavailable in the cloud). Open evidence, not a bug.
- **Notes N1–N4:** recorded as info (N1 merges into GATE97-S2; N2 is the existing overload feature; N3 is by design; N4 is a C tooling note).

## C-R98-B1: closed by decision (no code)
- **What C saw:** Space on the focused toolbar Export does not open the dialog; it toggles playback.
- **Why this is not a bug:** global Space is the play/stop shortcut. The workspace shortcut footer documents it (`Space · Home · …`). `StudioWorkspace.tsx` prevents Space on keydown (l.1699–1704) and keyup (l.1970–1978) on every non-typing target while Export is closed, so every workspace button outside the dialog behaves this way. It has done so since well before round 98.
- **The error was mine:** the round 98 task said "Space also opens it, as now" with no evidence ID. From now on, "as now" rows list only behaviour that C has already observed.
- **Keyboard access stays:** Enter opens Export (C FRESH-OPEN Enter PASS), and so does a mouse click.
- **Ableton:** დაუდასტურებელი. No source was consulted, and B makes no claim about Live.

## B's probe (read-only, Chromium, 1280×720)
Gate 98 review #4 and A's reviewer Low #1 said that in Safari focus can land on `body`, and the global Enter shortcut does not check `event.repeat`. I checked whether Chromium can reach the same path.
- **Script:** `b-round-98-probe/probe.cjs`, `probe-plus.cjs` and `probe-arrow.cjs`. Results are in `probe-result*.json`.
- **Method:** decline consent, wait until Middle East is ready, then `keyboard.down('Enter')` ×3, 50 ms apart, then `up`.

| Case | Focus during the hold | Clips |
|---|---|---|
| click the row | the row (`<button role=option>`) | 0 → **3** |
| click the row, then click the status text | BODY | 0 → **3** |
| click the row, then JS blur (upper bound only) | BODY | 0 → **3** |
| focus ＋ დამატება | the button | 0 → **3** |
| held ArrowDown on the row (baseline for a regression row) | the row | selection moved 3 rows to `demo-slow-rise` |

- **Confirmed fact:** in real Chromium a held Enter adds one clip per auto-repeat on all three add paths. Each repeated keydown arrived with `repeat=true`.
- **Inference:** each add is its own Undo step. HA8 and C's HOLD-ROW Ctrl+Z check this.
- **Not probed (hypothesis):** a held Enter on ▶ მოუსმინე may toggle the preview on every repeat (`B-R98-H1-PREVIEW-TOGGLE-HOLD`).

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| GATE97-S1-TOOLBAR-EXPORT-HOLD-REOPEN | → **closed** | C round 98 CLOSE-HOLD / CANCEL-CLOSE-HOLD / OPEN-HOLD + gate 98 |
| GATE97-S3-DOC085-STATUS | → **closed** | C SOURCE-UNCHANGED + gate 98 |
| C-R98-B1-SPACE-ON-TOOLBAR-EXPORT | **new**, closed by decision D-29z64 | `c-round-98.json` |
| C-R98-N1..N4 | recorded (info) | C notes |
| B-R98-HELD-ENTER-MULTI-ADD | **new** Low → round 99; also `open_bug` on SRW-12 | B probe; gate 98 #4; A round 98 reviewer Low #1 |
| GATE98-S5-DOC086-STATUS | **new** Low → round 99 | doc 086 l.4 at `736db33` |
| GATE98-S2-TH1-HELPER-DUP | **new** Low, test hygiene → with the fixture task | gate 98 #2 |
| B-R98-H1-PREVIEW-TOGGLE-HOLD | **new** hypothesis, not scheduled | code reading |
| GATE97-S4 | note: gate 98 #1 repeats it | gate 98 #1 |
| GATE97-S2 | gate 98 #4 merged; its global-Enter consequence is fixed for all browsers by round 99 T2 | gate 98 #4 |
| ARCH signals | round 98 note appended; ARCH-R97-EXPORT-FOOTER-KEYBOARD data point | gate 98 + A Architecture notes |
| rounds / baseline_tree_at_round99 | round 98 → `c_pass_published`; round 99 dispatched | — |

**Backups:** `b-round-98-backlog-before.json`, `b-round-98-feature-status-before.md`, `b-round-98-plan-before.md`, `b-round-98-b-next-before.json`.

**Round 99 baseline files:**
- the frozen list `b-round-98-r99-tree-sha256.txt`: **528/528 OK** at `736db33`. It holds 532 tracked files minus the 4 owned ones. The protected hashes match the earlier rounds.
- the snapshots in `b-round-98-r99-snapshots/`:
  - `ArrangementLibrary.tsx` `a2b6f78d`, 566 lines;
  - `StudioWorkspace.tsx` `1270f6c5`, 2516 lines;
  - `ArrangementLibraryPreview.tsx` `c6efc0ef`, 315 lines;
  - doc 086 `524d9b22`, 74 lines.
  - All four are LF with CR=0.

**Status board:**
- SRW-12 → **ბაგია** (round 99).
- GATE97-S1/S3 are closed, and the new rows are added.
- No scoped item changed to მზადაა.
- `regression-last.json` is unchanged.

## Round 99 task (summary)
**A held Enter adds exactly one clip** (D-29z64). Baseline `736db33`, clean tree. Expected end state: **4 M + 2 ??**.
- **T1, library row:** `preventDefault`/`stopPropagation` stay for every Enter; the select and add happen only on `!event.repeat`.
- **T2, global Enter:** the add happens only on `!event.repeat` (the same pattern as the Space branch).
- **T3, ＋ დამატება:** `Enter && repeat` → `preventDefault` only.
- **Tests:** a new `held-enter-add.test.tsx`, HA1–HA8, mounting the real `StudioWorkspace`. The expected fail-before is HA1, HA3, HA5 and HA8 red. Mutations a–h.
- **Docs:** doc 086 l.4 and a new doc 087.
- **C rows:**
  - primary: HOLD-ROW, HOLD-BODY and HOLD-PLUS at both viewports;
  - regressions: FRESH-ADD, HELD-ARROW-REG, SPACE-REG, CLOSE-HOLD-REG and EXPORT-REG (a real WAV);
  - also PX-NET, REG-HYD and G99-3;
  - test review: AN-REVIEW, T99-TARGETED and SOURCE-UNCHANGED.

## Why this scope (and not the footer Lows or a regression round)
- **The regression round is not due.** 2026-10-21 → 2026-10-23 is 2 days, and the rule needs 3 or more. **The next B planning on or after 2026-10-24 is the regression round**, whatever else is open.
- **C has no open bug.** The probe turned a reviewer's inferred Safari-only Low into a Chromium-reproduced change to the arrangement from a held key. It belongs to the same mechanism family as rounds 97–98, so it comes before the footer's cosmetic 16 px strip.
- **Round size:** it is one bug with three entry points to the same action, plus one doc line. One owner and three small hunks.
- **The user's order is kept:** finish all current work, then T12, then VISUAL-A-OBSIDIAN.

## Uncertain UI contracts (smallest honest choice, with rationale)
- **One press = one add (SRW-12 R12-L2).** Only `repeat=true` keydowns are skipped. Fast, deliberate fresh presses still add, so there is no time window. This needs no new state, and the frozen context is untouched.
- **The row keeps `preventDefault` and `stopPropagation` on repeats.** That matches today's propagation exactly (C-R98-N3).
- **＋ gets the round 98 opener rule (prevent only).** Other listeners still see the key.
- **The preview toggle is not touched.** No evidence yet (B-R98-H1).
- **Space stays global** (C-R98-B1).

## Ableton
- I consulted no source.
- Both rows are "დაუდასტურებელი".
- No Ableton claim is made.

## Architecture checkpoint
- Gate 98 and A's reviewer both say keep (Signal 3).
- Addendum **(k)** was appended to `b-round-91-checkpoint-request.md`:
  - after round 99 the repeat-Enter guard will be at 5 sites, which raises the question of an `isRepeatedEnter` helper;
  - the fixture proposal (ARCH-R93-TEST-HARNESS) is now at 10 files.
- Nothing is scheduled and nothing blocks. The reviewer's trigger, after the Export Lows, is noted.

## Next
1. **Round 99 (this task).**
2. **The next B planning, on or after 2026-10-24: the regression round.**
   - C checks each done or c_pass item once in the browser at both viewports, and runs `npm run test:e2e:smoke`.
   - A fixes only what C finds.
   - B updates `regression-last.json` when the round closes.
3. **Then the Export footer Lows:**
   - GATE89-S4 + A-R88 #4 + GATE97-S4: the 16 px strip, `pt-4 pb-4` → `py-4`, and `=== true`. `Modal.tsx` stays protected.
   - GATE89-S6 (`aria-valuetext`).
   - Then GATE89-S3, C-R90-MUT-B-CU4-GAP and A-R87-LOW-PU-ORDER.
   - The (j)/(k) checkpoint follows these.
4. **Then:** GATE96-S2 → grid/tempo Lows → R21-I2 → T12 → VISUAL-A-OBSIDIAN.
5. **When the auth owner releases the mount:** SRW-21-PREMOUNT, then the mount.

Scope is not reduced, and nothing is deferred without the user. Plugins, effects, pitch and multi-video layers stay out of scope, as the user decided. Grid tempo is not audio stretch.

## Commit readiness
- Round 98 is already published (`736db33`).
- Round 99 has nothing to commit until C passes.

## COMPLETE check
Not complete:
- SRW-12 has an open Low (round 99);
- the SRW-21 purchased mount, SRW-21-PREMOUNT and R21-I2 are open (the mount waits for the auth owner's release);
- T12 and VISUAL-A-OBSIDIAN have not started;
- open Lows remain;
- the regression round is due from 2026-10-24;
- Tech Lead manual checks are open;
- PROD-MP3 is unverified in the production bundle.

Not BLOCKED: independent scope remains, and only the mount needs an external release.

## Advisor, second call (before finishing)
- **No scope or decision change.** The advisor confirmed:
  - the probe-based priority over the footer Lows;
  - the C-R98-B1 decision;
  - the closures, the 528 frozen list and the regression timing.
- **Sharpened in `current-task.md`:**
  - **Test dispatch target.** Every keydown goes to `document.activeElement` at that moment, and focus is expected to stay on the row after an add. HA7 now says each ArrowDown goes to the moved focus. As first written, HA7 would have gone red on both versions, because the second keydown would have moved from row 1 again.
  - **Fail-before note.** HA2, HA4, HA6 and HA7 are locks, not detectors. HA6 discriminates only through mutations f and g.
  - **HOLD-ROW:** blur before Ctrl+Z, the same method as C round 98 ENTER-ADD-REG.
  - **HOLD-PLUS:** focus ＋ with `locator.focus()` or Tab, record which, and never click it.
  - **FRESH-ADD:** the evidence is deltas (+2, +2, +1), measured from a fresh context or with the count recorded before each step.
- **Re-checked after the edits:** `git status --short` in `store/` is empty, and the frozen list is 528/528 OK.
