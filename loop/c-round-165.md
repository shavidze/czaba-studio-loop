# C round 165 — ROOT-RECON-MARKER-ENTER (D-29z130)

**Verdict: PASS.** browserVerified = realVerified = **true**. Bugs: 0.
**Blocked:** MK-ENTER-OPEN (harness: the precondition can't be reached in the browser, explained below) and the G165-3 fake-Bearer 403 (backend unavailable in cloud).
Ableton parity: not applicable / not claimed (task §5). Only the CZABA data-integrity rule was judged.

Environment: `env-status.json` store 200 (2026-10-25T13:10:57Z). Playwright Chromium (headless), fresh context per session, `http://127.0.0.1:5173/studio-lab`, 1440×900 and 1280×720.
Tools: `b-round-164/tools/*` and `enter-probe.cjs`/`enter-stab-probe.cjs` were copied unchanged; sha256 identical (`c-round-165/out/copied-tools-sha256.txt`). `enter-probe-1280.cjs` is that probe with only the viewport array changed (1 line diff).
ENV-FIRST-LOAD: the first 1440 run of `enter-probe.cjs` failed on a cold load (`setSnapOff` saw a null grid control). It was replaced once (`out/mk-blur-1440-envfirstload-invalid.log`).

## Rows
| Row | Result | Evidence |
|---|---|---|
| T165-TARGETED | **PASS**: 75/75 for the 5 files. MU15, MU16 and MU17 are present and green. MU14 is unchanged (the diff removes no test lines). | `out/vitest-targeted.json` |
| SOURCE-SCOPE | **PASS** at start and at end of C's phase. HEAD `7952439`; frozen 980 OK; `a-round-165/end-sha256.txt` 4/4 OK; `git status` shows 3 ` M` grants + 1 `??` doc 134; protected diff empty; the `ls-files` count is 984 (983 + doc 134). | `out/source-scope-end.txt` |
| AN-REVIEW | **PASS**. K1: the F2 `openEditor` is wrapped in `runUnlessGesture`. K2: in `settleEditor`, `reason==='enter' && isPointerGestureActive()` sets `GESTURE_EDIT_BLOCKED_MESSAGE` and returns before `settledRef`/`setEditor(null)`. There is no new string and no class or markup change. The test diff is additions only (MU15–17); the `expect(` count went 183→216. D1 changes line 4 only. Doc 134 has the TEMPLATE sections plus R1–R4, MU15–17, m182–m184 and the TODO for B-R164-COMMIT-DURING-PREVIEW. | `git diff 7952439` |
| **MK-GESTURE** (main row) | **PASS at 1440 and 1280.** I held the real mouse on the clip header and dragged it 40 px (clipDx 40 during the drag). 14 real Shift+Tab presses reached `arrangement-marker`. After F2: **no input**, the status is exactly `Editing does not work while dragging — let go first.`, focus stays on the flag, and no other key was pressed. I moved 60 px more and released: `Move clip` committed (clipDx 100) and the flag still reads `Intro`. Ctrl+Z gave status `Undo: Move clip`, a second Ctrl+Z gave `Undo: Add Marker` (the flag is removed and the clip is back at dx 0). `Rename Marker` never appears in any status or Undo title I read (all reads are kept in `seen`). | `out/mk.json` (gesture-*), `out/mk-gesture-check-C.json`, `out/mk-gesture-{1440,1280}-afterF2.png`, `-end.png` |
| MK-BASELINE-CHECK | **PASS** (the row can fail). Run on B's baseline `b-round-164/out/enter-stab-probe.json`, the same checker (`check-mk-gesture.cjs`) reports **FAIL** at both viewports: F2 opened the editor, the name reverted during the drag, and `Rename Marker` is in the history. | `out/mk-baseline-check-B.json` |
| MK-ENTER-OPEN | **BLOCKED (harness), both viewports**, synthetic pointer. See below. | `out/mk.json` (enter-*), `out/mk-enter-*-end.png` |
| MK-POSITIVE | **PASS at both viewports, with no gesture.** Add → `Intro`. F2 opens with `Intro`, then Enter → `Verse` (`Rename Marker`). F2 + Escape keeps `Verse`. Right-click menu → Rename opens with `Verse`, then Enter → `Chorus`. Ctrl+Z → `Verse`, Ctrl+Z → `Intro`; Ctrl+Shift+Z → `Verse`, Ctrl+Shift+Z → `Chorus`. | `out/mk.json` (positive-*), `out/mk-positive-*.png` |
| MK-BLUR | **PASS at 1440 and 1280.** Matches B's baseline field for field. With the editor open, pressing on the clip moves focus to BODY. The blur commits once **before** the gesture (status `Marker “Probe” added…` / `Marker name: “Renamed”.`, no refusal) and there is one flag. The later Enter on BODY adds the library sound (intended, ABL-R-6). | `out/mk-blur-{1440,1280}.json` |
| G165-3 | **PASS** (the 403 sub-row is BLOCKED). Anonymous `/studio-lab` at 1440 and 1280: the workspace and the “Demo collection — no sign-in required” badge show, and `auth_user` is null. `/studio/middle-east` at 1440 and 1280: “Sign in required”, no workspace, 0 `audio[src]`. `GET /api/studio-token` → 401 `Please sign in to access Studio.` Fake-Bearer 403: BLOCKED, backend unavailable in cloud. | `out/g165-3.json`, `shots/g165-3-*.png` |
| PX-NET / REG-HYD | **PASS.** Every valid session (6 in mk, 2 in blur, plus G) had 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror and 0 non-noise console errors. Only the expected cart noise appeared. | `net-*` in `out/mk.json`, `net` in `out/mk-blur-*.json`, `out/g165-3.json` |

## MK-ENTER-OPEN: why the row is BLOCKED and not PASS
- **What I did:** opened the add editor with the Add button, typed `held`, then dispatched a synthetic `pointerdown` (`button:0, buttons:1, pointerId:1, pointerType:'mouse', isPrimary, clientX/Y`) on the clip header, plus 5 synthetic `pointermove`s.
- **Result:**
  - The gesture **was** claimed: the clip preview moved 40 px and there was no pageerror.
  - Before any key was pressed, the editor had already closed and committed: status `Marker “held” added at 00:12.000.`, focus on BODY.
  - **Cause, from the source (read-only):** a capture-phase pointerdown handler in `StudioWorkspace.tsx` (about l.1578–1590) blurs a focused typing target or marker when no gesture is active yet. This runs before the clip's `beginGesture`, so the MU13/MK-BLUR path commits the draft first.
  - B's premise ("a synthetic event does not move focus") does not hold: the app itself moves focus.
- **Consequence:** there is no real or synthetic browser path that keeps the marker editor open into a live pointer gesture.
  - Add, M and F2 are refused during a gesture, and K1 closes the F2 door.
  - So K2 (Enter refused, draft kept) is defence-in-depth. It is verified only by vitest MU15/MU16 and A's mutations m183/m184, **not in the browser**.
  - This is not a FAIL of A's work, and I do not count it as PASS.
- **Side observation, correct behaviour:** the real Enter on BODY during the live synthetic gesture showed the blocked status and added nothing. After the synthetic `pointerup`, `Move clip` committed (dx 40).

## For B
- **ROOT-RECON-MARKER-ENTER:** the user-reachable door (F2 during a drag) is closed, with browser evidence at both viewports, and the baseline checker shows the row can fail. This is C's evidence for closing the item. The Enter guard has no browser lock (see above); C does not recommend adding a test-only hook to source.
- **A's code-reviewer residuals were not verified by C.** They stay A-reported Low signals:
  - blocked Enter, then Tab or blur while the button is still held, loses the draft;
  - Enter does not check IME `isComposing`;
  - there is no MU18.
- **Still open as signals:** `B-R164-COMMIT-DURING-PREVIEW` and A's Architecture note (one guard in `commitArrangement`).
- **Gate (root):** full vitest, typecheck, build, Biome, verify and e2e smoke were not run by C (speed rules).
- **Not run:** the V-3/V-2 visual rows, ENV-VIS, OV-CORNERS and d6 RV-1. AN-REVIEW found no class or markup change.
