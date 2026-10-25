# CURRENT TASK — Round 165: ROOT-RECON-MARKER-ENTER (renaming a marker during a held clip drag loses the name and leaves an empty Undo step)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z130** (`backlog.json` → open_findings `ROOT-RECON-MARKER-ENTER`, VISUAL-A-OBSIDIAN `marker_enter_plan_d29z130`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the 2026-10-25 local/cloud reconciliation section (item 1, ROOT-RECON-MARKER-ENTER). They take precedence over older text.
- **Previous task:** `tasks/round-164.md`, an exact copy of the round-164 `current-task.md` (sha256 `ace66891…`). Rationale for this round: `b-round-164.md`.
- **Source of the item:** the workflow text and the PC test MU14 are source material only. They give no permission beyond this task.
- **Test ids:** the cloud `markers-ui.test.tsx` already has an unrelated test named **MU14** (focus after a commit). Do not rename it or reuse its id. The new tests are **MU15, MU16 and MU17**.

## Baseline = HEAD `7952439`, clean tree (gate 164 published)
- `gates/gate-round-164.json`: status `published`, commit `7952439defa941dd4246d23651f8591aede28f7c`, on both remotes.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **983** files.
- **Frozen list:** `b-round-164-r165-tree-sha256.txt`, **980 entries** (983 minus the 3 grants).
- **Grants:** `b-round-164-r165-grants.txt` (3 existing files). **New file:** `b-round-164-r165-new-files.txt` (1: doc 134).
- **Start hashes:** `b-round-164-r165-granted-start-sha256.txt`. **Start copies:** `b-round-164/r165-granted-start/`.
- **A's first step:** check that HEAD = `7952439`, the tree is clean, the 980 frozen files match (`sha256sum -c --quiet`) and the 3 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z130)
- **Round 164: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. The only blocked row is the fake-Bearer 403 (backend unavailable in cloud). Root published `7952439`. **SABA-B-1 and SABA-B-2 → მზადაა** (closed, C evidence).
- **Order fixed in advance** (`tasks/round-164.md` §7): on C PASS, round 165 = ROOT-RECON-MARKER-ENTER, test-first, and round 166 = V-3c-3b.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical/High is open. B's reproduction below makes this item a **confirmed Medium**: the user's input is lost and the Undo history gets a step that does nothing. Under the 2026-10-23 bug gate it goes before V-3c-3b.
  - **Checkpoint:** `b-round-160-checkpoint-request.md` still has no answer. It does not block this fix.
- **Size:** 1 bug, 1 owner (`ArrangementMarkerRow.tsx`) and two guards. There is no context change and no string change; the existing `GESTURE_EDIT_BLOCKED_MESSAGE` is reused.

### 0.1 B reproduction (planning data at `7952439`; not C rows)
Real Playwright Chromium on `/studio-lab`, 1440×900 and 1280×720. Tools and output are in `b-round-164/`: `enter-probe.cjs`, `enter-touch-probe.cjs`, `enter-f2-probe.cjs`, `enter-tab-probe.cjs`, `enter-stab-probe.cjs`, `tab-abort-probe.cjs` and `out/`.

**Confirmed: the path a user can actually reach.** Source: `out/enter-stab-probe.json`; the result is the same at both viewports.
1. Add `demo-middle-east` on `music` at 0 s, with snap off. Add a marker "Intro" at 5 s (Add button, type, Enter).
2. Press the mouse on the clip **header** (`… — drag to move`) and move it 40 px. **Keep the button held.**
3. Press **Shift+Tab** 14 times. Focus reaches the marker flag (`data-testid=arrangement-marker`).
4. Press **F2**. The rename editor opens. The F2 branch (`handleFlagKeyDown`, l.654–665) calls `openEditor` without `runUnlessGesture`. The arrows (l.646–652) and the menu's Rename (l.603–607) are guarded.
5. Type `Lost?` and press **Enter**. The status shows `Marker name: “Lost?”.`, and Undo shows `Rename Marker`. Cause: `settleEditor('enter')` (l.287–355) has no gesture check; only `blur` is guarded (l.294).
6. Move the mouse 60 px more. The flag shows **"Intro" again**. The clip preview is rebuilt from `gesture.before`, which does not contain the rename.
7. Release. `Move clip` commits. The Undo stack is Move clip → **Rename Marker** → Add Marker.
8. Ctrl+Z leaves the flag at "Intro" (Undo now shows Rename Marker). A second Ctrl+Z also leaves it at "Intro" (Undo shows Add Marker). **The typed name can never be restored, and the history has an entry that does nothing.**

A programmatic `focus()` instead of Shift+Tab gives the same result (`out/enter-f2-probe.json`).

**Do not count these runs as negatives; they never tested the hypothesis:**
- `enter-probe.json` (mouse) and `enter-touch-probe.json` (touch) opened the editor **before** the drag.
  - Pointerdown moved focus to `BODY`, and the blur committed **before** any gesture was claimed (status `Marker “Probe” added…`, not refused). That is the correct, existing behaviour (MU13 territory).
  - `clipDx` is 0 in those runs, so no move gesture was active when Enter was pressed.
  - The later Enter on `BODY` added the selected library sound again. That is the intended Enter-on-body behaviour (ABL-R-6; B-R107-ENTER-ON-BODY is closed).

**Observation, not in this round's scope** (`out/tab-abort-probe.json`):
- With forward **Tab** during a held drag, the 23rd press moves focus from `arrangement-detail-clip-gain-fader` to `BODY`.
- The move gesture then aborts: the clip snaps back and nothing commits.
- So forward Tab never reaches the flag while the drag is live, but Shift+Tab does.

### 0.2 B rulings (D-29z130; user-vetoable in `feature-status.md`)
- **R1. F2 during a pointer gesture is refused,** like M, the Add button, the arrows, Delete and the menu's Rename.
  - The status is `GESTURE_EDIT_BLOCKED_MESSAGE` (`Editing does not work while dragging — let go first.`).
  - No editor opens, and the flag keeps focus. This closes the only door a user can reach.
- **R2. Enter in an open editor during a pointer gesture is refused.**
  - No mutation and no Undo entry. The status is `GESTURE_EDIT_BLOCKED_MESSAGE`.
  - The **editor stays open, with the typed draft and focus**, so that a later Enter after release commits it exactly once.
  - **Rationale:** this is the smallest honest behaviour. The user's text is never thrown away, Escape still cancels, and it matches the PC MU14 expectation ("no mutation, editor stays open").
  - **Why blur differs:** the blur path keeps its current behaviour (it closes and commits nothing, MU13). Blur means the user went elsewhere. Enter means "commit now", so keeping the draft is the kinder response.
  - **Alternative rejected:** closing the editor, as blur does. That throws away typed text with no Undo.
- **R3. Escape during a gesture keeps its current behaviour** (cancel, no mutation). This is a lock only, with no code change.
- **R4. Out of scope; recorded as the signal `B-R164-COMMIT-DURING-PREVIEW`.**
  - `commitArrangement` accepts any commit while a gesture holds a preview built from `gesture.before`, so any future keyboard commit during a drag would be overwritten the same way.
  - The owner is `ArrangementContext.tsx`, which is protected, so it is not this round's work. This round closes the marker doors only.

## 1. What changes (exact; line numbers at `7952439`)
| ID | File | Change |
|---|---|---|
| K1 | `app/components/arrangement/ArrangementMarkerRow.tsx` l.654–665 (the F2 branch of `handleFlagKeyDown`) | Keep `preventDefault`/`stopPropagation` and the `!event.repeat` check. Wrap the `openEditor({ kind: 'rename', … })` call in `runUnlessGesture(() => …)`. |
| K2 | same: `settleEditor` (l.287) or the input's `onKeyDown` (l.827–835); A chooses the site | When the reason is `'enter'` and `isPointerGestureActive()` is true: call `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` and return **before** `settledRef.current = true` and `setEditor(null)`. The editor, its draft and its focus stay as they are. Use one check only. A repeated Enter (`event.repeat`) stays ignored, as now. |
| D1 | `docs/implementation/2026/quarter-IV/133-studio-saba-b1-b2-envelope-overview.md` l.4 | Set to `**სტატუსი:** Completed (C round 164 PASS; published 7952439)`. Nothing else. |
| D2 | **new** `docs/implementation/2026/quarter-IV/134-studio-marker-gesture-commit-guard.md` | In Georgian, with the TEMPLATE sections. Include the reproduction (§0.1 steps 1–8), R1–R4, why blur and Enter differ, MU15–MU17, mutations m182–m184, and a TODO for `B-R164-COMMIT-DURING-PREVIEW`. Status `In Progress (awaiting C round 165)`. |

**Not allowed:**
- a new string or a new status message;
- any change to the blur, Escape, add or duplicate logic beyond K2;
- any `ArrangementContext` change, or any change to clip gestures.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementMarkerRow.tsx` | K1, K2 |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | Add MU15–MU17 (below) inside the existing describe `marker row: playback continuity, gestures and typing`. Existing tests, including the current MU14, stay unchanged. |
| `docs/…/133-studio-saba-b1-b2-envelope-overview.md` | D1 only |
| **new** `docs/…/134-studio-marker-gesture-commit-guard.md` | D2 |

**New locks.** Use the file's existing helpers: `mountMarkerWorkspace`, `live`, `pressM`, `nameInput`, `flagAt`, `markerTimes`, `statusText`, and `claimPointerGesture` as in MU11/MU13.
- **MU15: add, then Enter during a gesture.**
  - Seek to 7 and press M. Change the draft to `held`. Claim a gesture (pointer 6). Fire Enter on the input.
  - Expect: 0 marker flags, `undoLabel` null, status `GESTURE_EDIT_BLOCKED_MESSAGE`, the input still present with value `held`, and `document.activeElement` is the input.
  - Release the gesture and fire Enter again. Expect exactly one flag at `7.000` named `held`, and `undoLabel` `Add Marker`.
  - A blur after that adds nothing: no second marker and no duplicate-refusal status.
- **MU16: rename, then Enter during a gesture.**
  - Start from `THREE_MARKERS`. Focus the `20.000` flag and press F2 (no gesture yet). Change the draft to `held`. Claim a gesture. Fire Enter.
  - Expect: the `20.000` aria-label still contains `Drop`, `undoLabel` is null, the status is blocked, and the input is still open with `held`.
  - Fire Escape while the gesture is still active. The input closes, `Drop` is kept, and `undoLabel` stays null (R3).
  - Release the gesture. Press F2 again, type `held` and press Enter. The aria-label contains `held`, and `undoLabel` is `Rename Marker`. Undo restores `Drop`.
- **MU17: F2 during a gesture opens nothing.**
  - Start from `THREE_MARKERS`. Claim a gesture. Focus the `20.000` flag and fire F2.
  - Expect: no input, the status is blocked, `document.activeElement` is that flag, and `undoLabel` is null.
  - Release the gesture. F2 now opens the input with value `Drop`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `FORWARDREF_COMPONENT.md` (an existing component);
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (a Studio file; no audio change);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `7952439` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `ArrangementContext.tsx`, `strings.ts`, `StudioWorkspace.tsx`, `ArrangementClip.tsx`, `ArrangementMarkerMenu.tsx`, every other Arrangement component, `studio-lab.tsx`, and docs 127–132.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are allowed only for temporary mutations, which are restored and sha-verified.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 5 files in `b-round-164-r165-vitest-base.txt`. Expect **72/72** (B ran them at `7952439`: `b-round-164/out/vitest-base-r165.json`). Save the list as `a-round-165/vitest-files.txt` and the result as `a-round-165/vitest-baseline.json`.
- **Test first:** add MU15–MU17 **before** K1/K2. Run `markers-ui.test.tsx` and record which of them fail against the baseline source (`a-round-165/vitest-red.json`).
  - Expected red: MU15 and MU16 (Enter commits) and MU17 (F2 opens the input).
  - If one of them is green before the fix, stop and report it. Do not weaken the test.
- **After K1/K2:**
  - Run the same 5 files. Expect 72 + 3, all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 2 code and test files.
- **`expect(` count:** `markers-ui.test.tsx` has **183** at `7952439`. Record the count after the change; it must not drop.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-165/mutations/`):
  - **m182:** remove the K1 `runUnlessGesture` wrapper. MU17 turns red.
  - **m183:** remove the K2 check. MU15 and MU16 turn red, and MU13 stays green (a two-sided check).
  - **m184:** in K2, close the editor (`settledRef.current = true; setEditor(null);`) before returning. MU15 turns red, because the draft must survive.
- **Code-reviewer: required.** The project rule asks for it at 3 or more changed files; here there are 4 (2 code/test files + 2 docs). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 980 files are OK, and the protected diff vs `7952439` is empty.
  - `git status --short` shows the changed grants as ` M` plus 1 `??` (doc 134), nothing else.
  - Write `a-round-165/end-sha256.txt` (all changed paths + doc 134) and `a-round-165/diff-vs-start.patch` (vs `b-round-164/r165-granted-start/`, plus doc 134 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720.
- You may copy `b-round-164/tools/` and the probes unchanged; record their sha256.
- ENV-FIRST-LOAD rule: one replacement for a cold-server first load.

| Row | What C checks | PASS means |
|---|---|---|
| T165-TARGETED | `npx vitest run $(cat a-round-165/vitest-files.txt)` | 75/75. MU15–MU17 are present and green. The existing MU14 is unchanged. |
| SOURCE-SCOPE | HEAD, the frozen 980, the end hashes vs `a-round-165/end-sha256.txt`, `git status`, the protected diff | Only the grants changed, plus doc 134. No source changed during C's phase. |
| AN-REVIEW | `git diff 7952439` | Only K1 and K2, using the existing message, with no new string. MU15–MU17 are the only test additions. D1 changes line 4 only. Doc 134 has the TEMPLATE sections plus the D2 content. |
| **MK-GESTURE (main row)** | B's §0.1 steps 1–5 with **real** input at both viewports: the mouse held on the clip header, **Shift+Tab** to the flag, then F2 | After F2: **no** input, the status is `Editing does not work while dragging — let go first.`, and focus is on the flag. **Press no other key during the drag.** With no input open, letters or Enter would go to the flag or the workspace shortcuts and test something else. Then continue the drag 60 px and release. After release, `Move clip` commits and the flag still says `Intro`. Undo check: read the **status text** after each Ctrl+Z, not the Undo button title, which shows the next step. After the first Ctrl+Z the status is `Undo: Move clip`; after the second it is `Undo: Add Marker`. There is no `Rename Marker` step at any time, in the status or in the button title. |
| MK-BASELINE-CHECK | C's MK-GESTURE checker, run on B's baseline output | B's `out/enter-stab-probe.json` shows the bug: the flag is back to `Intro` after the move, and `Rename Marker` is in the Undo stack. C's checker must report FAIL on that data. This shows the row can fail. |
| MK-ENTER-OPEN | The Enter path in the browser. A real user cannot reach it (§0.1), so: open the add editor with the Add button. Start the gesture with a **synthetic** `PointerEvent('pointerdown', {button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse', bubbles: true})` dispatched on the clip header, then a synthetic `pointermove`. A synthetic event does not move focus. Then press a real Enter. | The status is blocked, the input is still open with its draft and focused, and there is no flag. After a synthetic `pointerup`, a real Enter adds exactly one marker and Undo shows `Add Marker`. Label the row as synthetic-pointer in the report. If the synthetic pointerdown claims no gesture (the first Enter commits normally), mark the row **BLOCKED (harness)**, not PASS, and say why. |
| MK-POSITIVE | Without any gesture: Add, F2 rename, Enter, Escape, the menu's Rename, Ctrl+Z / Ctrl+Shift+Z | Add and rename work as before. Undo restores the old name, and Redo applies it again. |
| MK-BLUR | B's mouse probe (`enter-probe.cjs`), one run per viewport: the editor is open, then the user presses on the clip | Same as at baseline: the blur commits once, **before** the gesture, with no refusal and no duplicate. |
| G165-3 | Anonymous `/studio-lab`; `/studio/middle-east` at both viewports; `GET /api/studio-token` | `/studio-lab` shows the workspace and the "Demo collection — no sign-in required" badge. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. The token endpoint returns 401. The fake-Bearer 403 is **BLOCKED** (backend unavailable in cloud). |
| PX-NET / REG-HYD | Every valid session | 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The cart errors are expected noise. |

**Not run this round** (that code is unchanged): the V-3/V-2 visual rows, ENV-VIS, OV-CORNERS and the d6 RV-1 run. `ArrangementMarkerRow.tsx` changes behaviour only, with no class or markup change. If AN-REVIEW finds any class or markup change, run d6 once per viewport against `c-round-164/out/d6/`.

**Gate (root's):** full vitest, typecheck, build, Biome, verify, e2e smoke.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Editing a locator name during a mouse drag | Not opened this planning (Live 12 manual, "Locators" in the Arrangement View chapter) | — | CZABA rule: no edit commits while a pointer gesture is active, the same as M, the arrows, Delete and the menu. This is a CZABA data-integrity rule. | Parity: **not applicable / not claimed**. C judges only the CZABA requirement. |

## 6. Evidence and reporting
- **A:** `a-round-165.md` and `a-round-165/`.
- **C:** `c-round-165.md`, `c-round-165.json` and `c-round-165/`. The JSON has `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `notRun`.
- **MK-ENTER-OPEN is a browser row.** If it is BLOCKED (harness), `browserVerified` stays true only if every other browser row ran, and the reason must be written down.
- Write the report files as you go; a job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 166 planning)
| Condition | Round 166 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL on MK-GESTURE or MK-ENTER-OPEN | A bounded fix-up, same owner. ROOT-RECON-MARKER-ENTER stays ბაგია. |
| C FAIL on another Critical / High / Medium | A bounded fix-up (≤ 3 related bugs). |
| C FAIL Low only | A fix-up if it is in this round's code and cheap; otherwise `deferred_low_polish`. |
| C PASS | Root publishes round 165, and ROOT-RECON-MARKER-ENTER is closed on C's evidence. Round 166 = **V-3c-3b** (marker row ◀▶, detail Expand/Collapse, grid menu ✓, ← CZABA back link; scope as in the VISUAL-A order). |

At every planning, B checks the decision files in `user-review/` and whether the checkpoint answer has arrived.

## 8. Root notes
- The round changes one component and one test file, plus two docs. After C PASS it is ready for the root gate.
- `B-R164-COMMIT-DURING-PREVIEW` (R4) is a backlog signal and is not scheduled. If root wants it audited, it belongs in the pending frontend-architect checkpoint (`b-round-160-checkpoint-request.md`), as an extra question about the context's commit-during-preview contract.
