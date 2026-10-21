# CURRENT TASK — Round 38: SRW-13 stage 4b-1 — a fader press does not jump, the drag is relative, a double-click resets

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: **D-29z3** in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-37.md`.
- Round size: **one feature** (fader press/drag/double-click on the existing mixer faders). No bug batch this round.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` answered **200** at B time (18:53 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **8 → 8** during B's gate run. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

Round 37 landed: **C PASS on every ID** (`c-round-37.md`, `c-round-37.json`). C-R36-01, A-R36-TEST-NITS and DOC036-R36-REVIEW-SENTENCE are closed. Root then committed rounds 31–37 as **`134b4ab`** and pushed both remotes (`publication-checkpoint.json` → `round37Checkpoint`). No Critical/High bug is open, and no open Medium is assignable to A without the Tech Lead (C-R27-01, C-R23-01, C-R6-02, C-R8-01). So the next dependency-ordered scope runs: **SRW-13 stage 4b**, split as 4b-1 (this round) and 4b-2 (round 39+).

The user-visible problem: every mixer fader is a native `<input type="range">`, so a click **jumps** to the click point. C measured it: a real click on Master goes to **−27 dB** (`c-round-37.md` CR-2), and a click on a track Volume goes to 50 % (`c-round-37/runs/crk.txt` CR-1). Every such click also writes an undo entry. A user who only wanted to focus or grab the fader changes the mix.

## Baseline

B verified on 2026-10-13 (18:53–18:56, `b-round-37/gates.txt`):
- HEAD **`134b4ab`** (`feat(studio): add track pan and preserve editing focus`), published on both remotes; `git status --short` is **empty**.
- **New frozen list** `../tmp/studio-real-loop/b-round-37-tree-sha256.txt` → **376 OK**. It is round 36's list **minus** `ArrangementLane.tsx` and `ArrangementMaster.tsx`, **plus** `ArrangementDetailPanel.tsx` and doc 036. Both of those are now committed and C-verified. `ArrangementContext.tsx` and `StudioWorkspace.tsx` stay **frozen**.
- Protected 4/4 OK; tsc 0; build ✓; vitest **69 files, 1264/1264**.
- Biome `./app`: **2 errors** (CRLF `format` on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`; these are root's — **do not touch**) + 218 warnings + 1 info. Your files must add 0 errors.
- Dispatch snapshots of your 3 existing files: `../tmp/studio-real-loop/b-round-37-snapshots/` (`SHA256SUMS.txt` inside):

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/ArrangementLane.tsx` | `b689c710` |
  | `app/components/arrangement/ArrangementMaster.tsx` | `0de72e4f` |
  | `app/lib/arrangement/__tests__/fader-guards.test.tsx` | `3d120483` |

- **B probe of the mechanism** (`b-round-37/probe-pointerdown.txt`, live `/studio-lab`, no source change):
  - with a capture listener that calls `preventDefault()` on Master's `pointerdown`, a REAL `$B click` leaves the value at `0`. The events are `pointerdown, pointerup, click`: no `mousedown`/`input`/`change`, and no native focus (`activeElement` BODY).
  - Control without the listener: the value goes to `−27`, Master gets focus, and the events are `pointerdown, mousedown, input, focus, pointerup, mouseup, change, click`.
  - Rendered widths at 1440×900: Master **96 px**, every track Volume **107 px**, Pan **48 px**, Zoom 80 px.
- If root commits again before you start, record the new HEAD. Check that `b-round-37-tree-sha256.txt` is still 376 OK and that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules: do not revert, re-create or reformat anything. `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's. Nobody but root commits or pushes.

## 0. Scope

**Faders in scope:** each track's `Volume — {label}` (the audio tracks **and** the video track, `Volume — ვიდეოს ორიგინალი ხმა`), `Pan — {name}` (audio tracks), and `Master Volume`. **Not a fader:** the transport `Zoom (px/წმ)` slider. It is navigation and stays native, jump included.

**The contract (D-29z3):**

| Action | Result |
|---|---|
| Left-button press on a fader (anywhere on the input), then release with no horizontal movement | The value is **unchanged**, **0** history entries, and the fader **has focus**: arrow keys work, and Delete/Backspace stays a no-op on it (round 32–33). The `pointerdown` is default-prevented. |
| Press, horizontal drag, release | **Relative:** `value = snap(clamp(startValue + Δx · (max − min) / renderedWidth))`, where `startValue` is the stored value at the press, `Δx` = pointer x − press x, `renderedWidth` = the input's `getBoundingClientRect().width`, and `snap` rounds to the input's `step`. Vertical movement changes nothing. The preview goes through the **existing** functions (`previewTrackVolume`, `previewMasterGain`, the Pan draft + `previewTrackPan`), so the live sound changes during the drag. Release = **one** entry: `Volume`, `Master Volume` or `Pan — {name}`. If the final value equals `startValue`, **0** entries. |
| `renderedWidth` ≤ 0 or not finite | No change, 0 entries. |
| Blur or `pointercancel` during the drag | **Unchanged:** the value returns to the stored one and no entry is written (existing paths). Further `pointermove` events of that pointer change **nothing**: no preview, and no pending value that a later blur could commit. |
| Press while **another** pointer gesture is active (`isPointerGestureActive()` true) | The `pointerdown` is default-prevented. The value, the focus and the history are **unchanged**. Status = `GESTURE_EDIT_BLOCKED_MESSAGE` (the same text the refused native `change` gives today). Later `pointermove`s of that pointer change nothing. |
| **Double-click** on a fader (`dblclick`) | Reset to the default: Volume **1** (100 %), Master **0** dB, Pan **0** (`C`). **One** entry with the existing label, through existing APIs: Pan `setTrackPan(id, 0)`; Volume `previewTrackVolume(id, 1)` + `commitTrackVolume(id)`; Master `previewMasterGain(0)` + `commitMasterGain()`. The two presses of the double-click add **no** entries. |
| Double-click on a fader already at its default | **0** entries; the status does not change. |
| Double-click while another pointer gesture is active | The existing refusal: status `GESTURE_EDIT_BLOCKED_MESSAGE`, 0 entries. |
| Keyboard on a focused fader (arrows, Home/End, PageUp/PageDown) | **Unchanged.** The `onChange` + `onKeyUp` commit gives one entry per key; FADER-KEY-ENTRIES is 4b-2. |
| Pan readout button (`Pan → C`), Mute, Solo, Master Mute, Clip Gain, separators, lane height drag | **Unchanged.** |
| A focused text field (Clip Gain, search, detail start/end), then a press on a fader | **Unchanged order** (round 36 root capture): the field releases (blur commit) **before** the fader gesture. The fader then has focus. Because of the no-jump rule, the fader writes **no** entry of its own. |
| Touch/pen | The three fader kinds get `touch-none` (Tailwind `touch-action: none`), so a touch drag drives the fader instead of scrolling. Zoom does not get it. |

**Decisions (D-29z3):**
1. **Mechanism:** `event.preventDefault()` in each fader's `onPointerDown` for a left-button press (`button === 0`), whether the claim succeeds or not. Then:
   - if no gesture is active: `currentTarget.focus()` and begin the existing gesture, in that order, so that the blur handlers of the previously focused element run while no gesture is active;
   - otherwise: the refusal status, and nothing else.
   - The drag comes from `window` `pointermove` filtered by `pointerId`. Do not call `setPointerCapture` (jsdom lacks it). If you need it anyway, guard it with `typeof element.setPointerCapture === 'function'` and say why.
2. **`onChange` stays exactly as it is.** It serves the keyboard and the frozen tests that model a drag as `pointerDown` + `fireEvent.change` (fader-guards 44, gesture-guard 11, track-pan 10 call sites). With the prevented `pointerdown`, a real browser sends no native `input`/`change` during a press.
3. **Shared code, two new files:**
   - `app/lib/arrangement/fader.ts`: the pure function `relativeFaderValue({ startValue, deltaPx, widthPx, min, max, step })`.
   - `app/hooks/useRelativeFaderDrag.ts`: the press, move and end wiring used by the three faders.
   - Do not export them from `app/hooks/index.ts` (frozen); import by path.
   - Name per `AGENT_DISCOVERABLE_CODE.md`. No comments in code.
4. **`ArrangementContext.tsx` does not change.** Every needed API exists and `commitHistory` drops equal snapshots (`model.ts` l.603). If you find that the contract cannot be met without a context change, **stop and report** with the exact reason. Do not widen the change.
5. **Pan:** keep `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur` and `suppressPanPointerAfterBlur` (A-R32-REVIEW-1 / CP-R37-PAN-KEY-LOCK are 4b-2). The new pointer path sets the draft and calls `previewTrackPan` like the gesture branch of `handlePanChange`; release and cancel still go through the existing paths.
6. **Frozen-test amendments authorised by B, exactly these lines in `fader-guards.test.tsx`** (snapshot line numbers):
   - l.840: `expect(document.activeElement).toBe(controls.musicVolume());` → `expect(document.activeElement).toBe(sfxVolume);`
   - l.1597, the title: `'must-not: a focused music Volume keeps its focus when Master is pressed'` → `'a focused music Volume: a Master press moves the focus to Master and leaves the music Volume value unchanged (D-29z3)'`
   - l.1602: `expect(document.activeElement).toBe(volume);` → `expect(document.activeElement).toBe(controls.master());`

   Both assertions pinned a jsdom-only state. In Chrome a pressed range always took focus (C rounds 36/37, B probe P2). **Any other frozen test that fails = stop and report**; do not amend it.
7. **Rejected:**
   - (a) Compensating the native jump on the first `change`: it breaks the frozen `pointerDown` + `change` tests.
   - (b) Preventing only `mousedown`: it does not cover touch/pen, and the probe shows that `pointerdown` is enough.
   - (c) A custom `role="slider"` element instead of the native range: it means rewriting the a11y and every selector, which is far larger.
   - (d) `preventDefault` in the root capture: it would also hit Zoom and amend D-29z decision 5.

**In (A):** §2.1–§2.5. **In (C):** §4.

**Not in this round** (queued, not deferred scope):
- **stage 4b-2 (round 39+, at most three related bugs per round):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, the pending-commit order, the stale refusal status together with C-R37-01, A-R31-REVIEW-2, A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, CP-R37-DRAG-ENTRIES, A-R37-TEST-HARDENING;
- Shift fine-drag (T12.9) and Delete-to-default (Live §42.6, a deliberate difference; see §4.8);
- stage 4c + polish: round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- the round-36 root capture (text field → range press);
- the round 32–33 fader → clip → Delete matrix;
- the C-R36-01 path (it now keeps the field focused);
- the Pan readout reset;
- keyboard entries;
- live audio during a drag;
- the video-track Volume;
- Zoom (must stay native);
- the frozen `gesture-guard`, `track-pan`, `master-ui`, `clip-gain` and `fader-guards` suites.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-hook.md` and `prompts/studio-feature.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit: `git rev-parse HEAD`; `git status --short` (empty, or root's newer commit); `sha256sum -c ../tmp/studio-real-loop/b-round-37-tree-sha256.txt | grep -vc ': OK$'` → 0; your 3 files against the snapshot shas; protected 4/4; the `node.exe` count.
3. **Read:**
   - `ArrangementLane.tsx` l.255–336 (Pan handlers) and l.578–652 (the Pan and Volume inputs);
   - `ArrangementMaster.tsx` l.109–179;
   - `ArrangementContext.tsx` l.2057–2410 (the Volume/Pan/Master preview, commit, begin and blur functions) and l.596 (`refuseEditDuringGesture`);
   - `model.ts` l.589–611;
   - `StudioWorkspace.tsx` l.895–924 (both root captures) and l.1181–1184 (Delete on a range);
   - `fader-guards.test.tsx` l.613–900 and l.1540–1606 (helpers `mountFaderWorkspace`, `controls`, `press`, `windowPointer`, `stubScrollerGeometry`);
   - `b-round-37/probe-pointerdown.txt`.
4. **Re-check (report each):**
   - `commitHistory` returns the same history for an equal snapshot, so `previewTrackVolume(id, stored)` + `commitTrackVolume(id)` writes no entry. Prove it with a test (F3).
   - After `cancelTrackVolumeGesture` / `cancelMasterGainGesture` (blur during a drag), a later `previewTrackVolume` / `previewMasterGain` with **no** gesture would create a pending preview (`volumeBeforeRef` / `masterBeforeRef`). Your hook must therefore stop on blur/cancel (test F9b).
   - `GESTURE_EDIT_BLOCKED_MESSAGE` is exported from `ArrangementContext.tsx` (l.134), and `setStatus` is available from `useArrangement()` in both components.
   - A grep of the 3 test suites for `fireEvent.pointerDown(` on a fader, followed by an `activeElement` assertion. B's audit says only l.840 and l.1602 change under explicit focus (l.743/746, l.765, l.1265/1272, l.1551/1552, l.1566/1568/1573 stay green). If you find another, **stop and report**.
   - No frozen test asserts the return value of `fireEvent.pointerDown` on a fader (B's grep: none).
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `app/lib/arrangement/fader.ts` (new, pure)

`relativeFaderValue({ startValue, deltaPx, widthPx, min, max, step }): number`:
- returns `startValue` if `widthPx` is not finite or ≤ 0, or if any input is not finite;
- otherwise `clamp(min + Math.round((startValue + deltaPx * (max − min) / widthPx − min) / step) * step, min, max)`, normalised so that float noise does not appear (e.g. `0.75`, not `0.7500000000000001`). Use one honest normalisation and state it in the doc.

### 2.2 `app/hooks/useRelativeFaderDrag.ts` (new)

- Inputs: what the fader needs to read the stored value at the press, its `min`/`max`/`step`, a `begin(pointerId) → boolean`, a `preview(value)` and an `isActive()`, or an equivalent minimal set. A designs the signature.
- On a left press:
  - `preventDefault()`;
  - if a gesture is active: the refusal status, then return;
  - else `focus()` then `begin`;
  - if `begin` succeeds: listen on `window` for `pointermove` / `pointerup` / `pointercancel` of that `pointerId`.
- `pointermove`: compute with `relativeFaderValue`. Call `preview` only when the value differs from the last previewed one (or from `startValue` on the first move).
- **Stop permanently** (remove the listeners, never preview again for this press) on the fader's own `blur`, and on `pointerup` / `pointercancel` of its pointer. Do **not** decide by polling `isPointerGestureActive()`: the global flag can be true again for a different pointer, and no per-fader gesture getter is exposed.
- Clean up all listeners on `pointerup` / `pointercancel` / unmount and when the gesture ends by blur/cancel.

### 2.3 `ArrangementLane.tsx` and `ArrangementMaster.tsx`

- **Volume input** (the same element serves the video track): wire the hook; add `onDoubleClick` (reset per §0); add `touch-none`. `onChange`, `onPointerUp`, `onLostPointerCapture`, `onKeyUp` and `onBlur` stay as they are.
- **Pan input:** wire the hook (begin = the existing `handlePanPointerDown` logic, preview = set the draft + `previewTrackPan`); add `onDoubleClick` → `setTrackPan(track.id, 0)`, and do not refocus beyond what the press already did; add `touch-none`. Keep the other Pan handlers and the readout button byte-identical.
- **Master input:** wire the hook; add `onDoubleClick`; add `touch-none`.
- No other element, no layout change, no new colour, no new text. Do not change `aria-*`, except where the existing `aria-valuetext` keeps tracking the draft/stored value as today.

### 2.4 Doc 037 (`docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md`, new)

In Georgian, with technical terms in English, per `docs/implementation/TEMPLATE.md`. Cover:
- the date, status and project;
- the context (the native jump; C's −27 dB and 50 % evidence);
- the contract table;
- the mechanism and the B probe;
- why `onChange` stays;
- the focus decision, plus the 3 authorised frozen-test lines and why they changed;
- the rejected alternatives a–d;
- the drag formula and the normalisation;
- the double-click and its verification limits (no real dblclick in headless);
- the touch note;
- the files changed;
- problems → solutions;
- the tests, with the red/green numbers;
- the C IDs;
- the Ableton table of §4.8;
- TODO: 4b-2.

### 2.5 Tests (red-first in `store/`)

**New file:** `app/lib/arrangement/__tests__/fader-click.test.tsx`. Mount the workspace as `fader-guards.test.tsx` does; copy what you need, and do not import from another test file. Stub `getBoundingClientRect` on the fader inputs to `{ left: 0, width: W }`, with W per case.

| # | Case | Asserts |
|---|---|---|
| P1 | pure: Volume `start 1, Δ −25, W 100, 0…1, step 0.01` | `0.75` exactly |
| P2 | pure: clamp | `Δ −200` → `0`; `start 1, Δ +10` → `1` |
| P3 | pure: Master `start 0, Δ −24, W 132, −60…+6, step 0.5` | `−12` |
| P4 | pure: Pan steps `start 0, Δ +10, W 100, −50…50, step 1` | `10` |
| P5 | pure: guards | `W 0`, `W NaN`, `Δ NaN` → `startValue`; `Δ −0.4, W 100` on Volume 1 → `1` |
| F1 | music Volume: press (no move) + window `pointerup` | `fireEvent.pointerDown` returns `false`; the value stays at its fixture value (`fader-guards` fixture: **0.6**, l.1604; state the value of the fixture you use); 0 entries; `activeElement` = the Volume; the gesture is inactive after release |
| F2 | music Volume: press at x 50, window `pointermove` x 25, `pointerup` (W 100) | fixture start − 0.25 (with the 0.6 fixture: **0.35**); one `Volume` entry; `undo` restores |
| F3 | music Volume: move −25 then back to 0, release | 0 entries, the value unchanged |
| F4 | Master: W 132, move −24 | `−12`, one `Master Volume` entry |
| F5 | Pan (music): W 100, move +10 | during the drag `history.present` is unchanged and the draft shows `10R`; after release the pan is `0.2`, with one `Pan — {name}` entry |
| F6 | video-track Volume: press with no move → 0 entries; move −25 → one entry | as F1/F2 |
| F7 | detail-separator gesture 41 active → press music Volume 42, then window `pointermove` 42 | `pointerDown` returns `false`; focus unchanged; status `GESTURE_EDIT_BLOCKED_MESSAGE`; the value unchanged; 0 entries |
| F8 | must-not: drag, then window `pointercancel` | the value restored, 0 entries (existing) |
| F9 | must-not: drag, then `fireEvent.blur(volume)` | restored, 0 entries |
| F9b | after F9, window `pointermove` of the same id (Δ −40) | **immediately** `trackOf(arrangement, music).volume` equals the stored value (a stray `previewTrackVolume` would change `history.present` at once); then `volume.focus()` + `fireEvent.blur(volume)` (runs `commitTrackVolume`) and window `pointerup` → still 0 entries, the value still stored |
| D1 | music Volume at 0.4 (keyboard: `change` + `keyUp`, 1 entry) → `fireEvent.dblClick` | `1`, `undoChainLabels` = `[Volume, Volume]` |
| D2 | Master at −12 (keyboard) → dblClick | `0`, last label `Master Volume` |
| D3 | Pan at `-25` (keyboard) → dblClick | `C`, last label `Pan — {name}`; the readout button disabled |
| D4 | must-not: dblClick at default on Volume, Master and Pan | 0 entries; status unchanged |
| D5 | dblClick during separator gesture 41 | status blocked, 0 entries |
| D6 | the full sequence on music Volume at 0.4: pointerdown/up + click, pointerdown/up + click, dblclick, no move | exactly one new entry (the reset) |
| T1 | the classes | the Volume (audio + video), Pan and Master inputs contain `touch-none`; Zoom does not; `fireEvent.pointerDown(zoom)` returns `true` |
| R1 | root capture kept: Clip Gain typed `3` (no Enter) → press music Volume (no move) → release | `undoChainLabels` = `[Clip Gain]` (no Volume entry); SFX gain 3; focus = Volume |

**Order:**
1. Check the 3 snapshot shas.
2. Write `fader.ts` with a stub that returns `startValue` unchanged; it must type-check. Write the new test file, and apply the 3 authorised frozen-line changes of §0 decision 6.
3. **Red run:** `npx vitest run app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx`. Paste it. Expected red:
   - fader-click: every non-must-not case, except P5's guard sub-asserts that the stub satisfies;
   - fader-guards: exactly the 2 amended tests (l.835 and l.1597; focus is not moved yet).
   Must-not cases F8, F9, F9b and D4 may be green; list them. Explain any other green-on-old-source case before going on.
4. Implement §2.1–§2.3. Re-run: all green; fader-guards **71/71**.

**Rules:**
- Every other existing test and helper stays byte-identical. In `fader-guards.test.tsx` exactly the 3 lines of decision 6 change (`diff` shows 3 `-` and 3 `+`).
- **Expected counts:** fader-guards 71; the full vitest = 1264 + the number of `it` in `fader-click.test.tsx` (report it).

### 2.6 After the code

- **Self-check** (report each):
  - the frozen `gesture-guard.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `clip-gain.test.tsx`, `meter-ui.test.tsx`, `track-meter-ui.test.tsx`, `track-layout.test.tsx`, `render-budget.test.tsx`, `delete-selection-ui.test.tsx` are green;
  - the full `npx vitest run` passes.
- **Biome:** `npx biome check --write` **only** on your 6 TS/TSX files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (≥ 3 files). Report its findings and your dispositions.
- **Browser smoke (A, one run allowed if the server is up; `a-browse.json`):** a REAL `$B click` on Master → the value stays `0`, and `activeElement` is Master; a REAL click on music Volume → stays `1`. This is not a PASS claim.
- **Mutations:** only in a scratch copy outside `store/`, never in place. A may skip them; they are C's.
- **`/check`:** run `npm run verify`. `npm run test:e2e:smoke` starts its own dev server, so do not run it; say so.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `134b4ab`, with an empty `git status`, or a newer root commit that contains it.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | A | §2.3 only: the Volume and Pan inputs and the hook wiring |
| `app/components/arrangement/ArrangementMaster.tsx` | A | §2.3 only: the Master Volume input and the hook wiring |
| `app/lib/arrangement/fader.ts` | A | new (§2.1) |
| `app/hooks/useRelativeFaderDrag.ts` | A | new (§2.2) |
| `app/lib/arrangement/__tests__/fader-click.test.tsx` | A | new (§2.5) |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | exactly the 3 lines of §0 decision 6 |
| `docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md` | A | new (§2.4) |
| `../tmp/studio-real-loop/a-round-38.md`, `a-round-38/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-38.md`, `c-round-38.json`, `c-round-38/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

`a-round-37/` and `c-round-37/` are read-only now.

**Expected `git status --short` at the end** (root has not committed): exactly **7** lines:
- ` M` for `ArrangementLane.tsx`, `ArrangementMaster.tsx` and `fader-guards.test.tsx`;
- `??` for `app/hooks/useRelativeFaderDrag.ts`, `app/lib/arrangement/fader.ts`, `app/lib/arrangement/__tests__/fader-click.test.tsx` and `docs/implementation/2026/quarter-IV/037-studio-lab-fader-click.md`.

If root commits mid-round, record it and check every line against this section.

### 3.3 Frozen this round

- all **376** files in `b-round-37-tree-sha256.txt` and everything else under `store/`;
- that includes `ArrangementContext.tsx`, `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementTransport.tsx` (Zoom), `ArrangementTrackMeter.tsx`, `app/hooks/index.ts`, `model.ts`, `graph.client.ts`, `gesture-guard.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `clip-gain.test.tsx`;
- docs 001–036.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport:** 1440×900 with the detail panel expanded (a real click on `arrangement-detail-toggle`), plus the 1280×720 spot checks named below.

**Harness rules (unchanged):**
- A "real click" is `$B click` at the element centre; keys are real `$B press`/`$B type`.
- These are synthetic and must be labelled: pointer events at computed coordinates, drags, the separator gesture, window `pointerup`, `dblclick` and blur.
- C may hook browser APIs (fetch/XHR, `AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start`); label them.
- No source instrumentation. Mutations only in a scratch copy outside `store/`.
- **Every run and gate records `node.exe`.**

**Layout L38** = L37: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

Before and after every step record:
- the fader values (music/SFX/video Volume, music Pan, Master);
- `history.past.length` and the tail;
- the status line;
- `document.activeElement`;
- `isPointerGestureActive` when readable.

**Checkpoint order if the session may end:** G38-2 → R38-S → R38-PG → R38-DR → R38-DC → R38-MN → R38-CR → R38-U → the rest. Write `c-round-38/checkpoint.md` as you go.

### 4.1 R38-PG — a press does not jump (REAL clicks; primary)

Use a real `$B click` at the centre of each fader. Under the old code, the centre maps to Volume 50 %, Master −27 dB and Pan `C`.

| Case | Setup | Expected |
|---|---|---|
| PG-V | music Volume at 1 | still `1`; 0 entries; `activeElement` = music Volume; no status change |
| PG-S | SFX Volume at 1 | as PG-V |
| PG-VID | video Volume at 1 | as PG-V |
| PG-M | Master at 0 | still `0`; 0 entries; focus Master |
| PG-P | music Pan set to `10R` first (focus + 10 × REAL ArrowRight; record the entries) | the real centre click leaves `10R` (old code: `C`); 0 new entries; focus Pan |
| PG-KEY | after PG-M, REAL ArrowDown ×2 | Master −1.0 dB, 2 entries (keyboard unchanged) |
| PG-DEL | select the SFX clip; REAL click on music Volume; REAL Delete | the clip is **not** deleted, 0 entries (Delete on a focused range = no-op); then a REAL click on the SFX clip header + REAL Delete → deleted, `კლიპის წაშლა` (round 33 matrix) |
| PG-1280 | 1280×720: PG-V and PG-M once | as above |

Compare with the round-37 baseline (`c-round-37/runs/crk.txt`: Volume 0.5; Master −27). **FAIL** = any value change or entry from a press without movement.

### 4.2 R38-DR — relative drag (SYNTHETIC pointer events; live audio)

Read each input's `getBoundingClientRect()`. Dispatch a `pointerdown` (`pointerId` 51, `button` 0, `buttons` 1, `clientX` = left + 0.3·width, the vertical centre) on the input, then `window` `pointermove` events in 3 steps to x + Δ, then a `window` `pointerup`. C computes the expected value with the §0 formula, from the measured width.

| Case | Δ | Expected |
|---|---|---|
| DR-V | music Volume, Δ = −0.25·width | `0.75`; one `Volume`; Ctrl+Z → `1` |
| DR-VID | video Volume, Δ = −0.5·width | `0.5`; one `Volume` |
| DR-M | Master, Δ = −(12/66)·width | `−12.0 dB` (± one step if the width rounds; record the exact px); one `Master Volume` |
| DR-P | music Pan, Δ = +0.2·width | `20R`; one `Pan — მუსიკა`; during the drag `history.past.length` is unchanged |
| DR-0 | music Volume, Δ −20 px then back to 0 | 0 entries |
| DR-Y | music Volume, a pure vertical move of 40 px | 0 entries, the value unchanged |
| DR-AU | live audio: seek to 8 s, Play; hook `setTargetAtTime` and `AudioBufferSourceNode.prototype.start`; DR-V during playback | ≥ 1 `setTargetAtTime` on the music track gain during the move, with a target consistent with the new volume; **0** new `start` calls during the drag. B read this: a volume-only change keeps `scheduleKey` (clips + loop) and goes through the handle, `ArrangementContext.tsx` l.876/898. Then Pause |
| DR-AU-P | as DR-AU for DR-P | `setTargetAtTime` on the music `StereoPannerNode.pan` toward 0.4 (`20R`); 0 starts |
| DR-1280 | 1280×720: DR-V once | as DR-V |

### 4.3 R38-DC — double-click (SYNTHETIC `dblclick`, labelled)

| Case | Expected |
|---|---|
| DC-V | music Volume 0.75 (after DR-V, no undo) → `dblclick` → `1`, +1 `Volume` |
| DC-M | Master −12 → `0`, +1 `Master Volume` |
| DC-P | Pan `20R` → `C`, +1 `Pan — მუსიკა`; the readout disabled |
| DC-VID | video Volume 0.5 → `1`, +1 |
| DC-0 | `dblclick` at default on all three kinds → 0 entries; status unchanged |
| DC-G | `dblclick` on music Volume 0.75 during synthetic separator 41 → status blocked, 0 entries |
| DC-SEQ | the synthetic full sequence (pointerdown/pointerup/click ×2, then `dblclick`) on Master −12 → exactly +1 entry |
| DC-REAL (info only) | inject a `dblclick` counter, then two REAL `$B click`s on Master issued in one `$B chain` as fast as possible; record whether a `dblclick` fired. **Not a PASS/FAIL row**: real double-click = Tech Lead R38-T |

### 4.4 R38-MN — must-not

| Case | Expected |
|---|---|
| MN-Z | Zoom: a REAL click at the centre still moves the zoom (native, unchanged); Zoom has no `touch-none` |
| MN-G | synthetic separator 41 held → a REAL click on music Volume: value unchanged, focus unchanged, status `GESTURE_EDIT_BLOCKED_MESSAGE`, 0 entries |
| MN-CR36 | C-R36-01 path: Clip Gain `3` typed → synthetic separator 41 → a REAL click on Master: the field **keeps focus** and `3`; status blocked; 0 entries; after `pointerup` 41, REAL Enter → +1 `Clip Gain` `+3.0 dB` |
| MN-BLUR | a synthetic drag on music Volume (Δ −0.25·width, no release) → a REAL `Tab` (keyboard focus move; not gated by the gesture) → the value returns to the stored one, 0 entries. A further synthetic `window` `pointermove` of id 51 → the value **still equals the stored one immediately** (read `history.present`, not only the entries); then synthetic `pointerup` 51 and a REAL click elsewhere → still 0 entries. If `Tab` does not move the focus off the fader, use a labelled synthetic `volume.blur()` instead and say so. Note: a REAL ruler click during the drag does **not** blur the fader. That is the existing contract (D-29z row 2; frozen `fader-guards.test.tsx` l.750), not a failure |
| MN-CANCEL | the same with a synthetic `window` `pointercancel` 51 instead of the blur |
| MN-RESET | Pan readout `Pan → C` (REAL click) at `10R` → `C`, +1 (unchanged) |

### 4.5 R38-CR — rounds 33–37 regression

- **CR-1:** Clip Gain `3` (no Enter) → a REAL click on music Volume → `[…, Clip Gain]` **only** (round 37 had `[…, Clip Gain, Volume]` from the jump), SFX 3, focus music Volume, no blocked status. One Ctrl+Z (after a REAL click on the ruler) → `Undo: Clip Gain`.
- **CR-2:** the same with Master and with music Pan.
- **CR-3:** library search typed `ab` → a REAL click on music Pan → the search is released, its text and filter unchanged, 0 entries.
- **CR-4:** R34-CG CG-1: Clip Gain `3` → a REAL click on the music header → +1 `Clip Gain`, focus BODY, Delete deletes.
- **CR-5:** a REAL click on music Volume → a REAL click on the SFX clip header → REAL Delete → the clip is deleted (R33-FT row).

### 4.6 R38-K — adjacent

- Mute/Solo/Master Mute REAL clicks: one entry each.
- Clip Gain Enter (+1), Escape (0), 0 dB reset (+1).
- A REAL Tab onto music Volume, then REAL ArrowLeft: one entry (keyboard unchanged).
- Lane height drag (synthetic): one layout change, no fader entry.

### 4.7 R38-S, R38-U, R38-Doc

**R38-S** (static, read-only): `diff -u` of `b-round-37-snapshots/` against the live files.
- `ArrangementLane.tsx` / `ArrangementMaster.tsx`: changes only on the Volume/Pan/Master inputs, the hook imports and wiring, the `onDoubleClick` handlers, and `handlePanPointerDown` (snapshot l.274–302; it may be changed or wrapped for `preventDefault`, the explicit focus and a boolean `begin`). Byte-identical: `suppressPanPointerAfterBlur`, `handlePanChange`, `handlePanPointerEnd`, `handlePanBlur` and the Pan readout button.
- `fader-guards.test.tsx`: exactly 3 `-` and 3 `+` lines (§0 decision 6).
- The new files exist.
- `b-round-37-tree-sha256.txt`: 376 OK.
- No hardcoded colour, no `any`/`@ts-ignore`, no type assertion, no new `// comment`.

**R38-U:**
- The new tests exist and are green, and A's red run matches §2.5 step 3.
- Mutations in a scratch copy outside `store/` (each must make a test fail; report which):
  - (a) remove `preventDefault` from the hook's press → F1 (and T1 for Zoom stays green);
  - (b) remove the explicit `focus()` → F1 and the 2 amended fader-guards tests;
  - (c) scale with `2 · widthPx` → F2/F4/F5;
  - (d) remove Volume's `onDoubleClick` → D1/D6;
  - (e) drop the refusal status → F7;
  - (f) keep previewing after blur/cancel → F9b;
  - (g) remove `touch-none` from Master → T1;
  - (h) `relativeFaderValue` without `snap` → P1/P3 or P5.

**R38-Doc:** doc 037 covers §2.4, matches the code, and its Ableton table matches §4.8.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

Live 12 Reference Manual, captured with gstack `/browse`:
- §18.1 "The Live Mixer": https://www.ableton.com/en/live-manual/12/mixing/, 2026-10-12, `b-round-29/ableton-mixing-20261012.txt`;
- §42.4 "Working with Devices and Plug-Ins" and §42.6 "Adjusting Values": https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/, 2026-10-13, `b-round-37/ableton-live-keyboard-shortcuts-20261013.txt`;
- also read with no relevant text found: "Live Concepts", "Working with Instruments and Effects" and "First Steps" (2026-10-13, `b-round-37/`).

No video was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Pan double-click resets to the default | §18.1: "Double-clicking the Pan control resets it to its default value." | **Confirmed** | Pan `dblclick` → `C`, one entry | R38-DC DC-P |
| Volume / Master double-click resets | §42.4 "Reset Parameter Value — Delete or double-click" (device parameters); §18.1 names only Pan | **Unconfirmed** for mixer Volume / Main | CZABA applies the same reset to Volume (100 %) and Master (0 dB), as the user-requested fader UX (plan 4b) | DC-V, DC-M, DC-VID |
| A click on a fader does not jump; the drag is relative | no text found in §18.1, Live Concepts or §42 | **Unconfirmed** | CZABA requirement (C round 22 §5; plan 4b) | R38-PG, R38-DR |
| Delete on a selected control returns it to the default | §42.6 "Return to Default — Delete" | **Confirmed** | **Deliberate difference:** Delete on a focused fader stays a no-op (`StudioWorkspace.tsx` l.1182; round 32–33 contract). Not implemented this round | PG-DEL |
| Shift = finer resolution while dragging | §42.6 "Finer Resolution When Dragging — Shift" | **Confirmed** | Not in this round (T12.9) | — |

C reports two verdicts per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.9 Gates

**G38-1:**
- tsc 0;
- vitest = 1264 + the new `it` count, 0 failures (record `node.exe`; on a timeout under load, re-run that file alone and report both runs);
- build passes;
- Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218 + 1 info;
- green: `fader-click.test.tsx`, `fader-guards.test.tsx` (71), `gesture-guard.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `clip-gain.test.tsx`, `meter-ui.test.tsx`, `track-meter-ui.test.tsx`, `track-layout.test.tsx`, `render-budget.test.tsx`, `delete-selection-ui.test.tsx`, `ArrangementContext.test.ts`.

**G38-2:** protected 4/4 OK; `sha256sum -c b-round-37-tree-sha256.txt` → 376 OK; `git status --short` = §3.2 (7 lines); HEAD at start and end.

**G38-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during R38-PG/DR);
- media is only the 2 demo MP3s and `blob:`;
- anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: root `CartContext` `GET /api/cart`, root GA consent-denied events, the dev-module `GET /app/lib/r2.config.ts`, the homepage hero image from `images.unsplash.com`.

**Not re-run this round** (not PASS):
- exports and WAV integrity (the export path is unchanged; R38-DR checks only the live preview);
- PUI geometry, video sync and the C-R27-01 table;
- the full find sound → add → fit video → export flow and FB-01..FB-16 (stage regression).

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 (Tech Lead; record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 37: 2 at 28013/28014, 63 520 bytes);
  - C-R30-01 (polish);
  - C-R37-01 (4b-2).
- **Open low items:** R26-M1; the stage 4b-2 items (§0); R9-REVIEWER-M1-L8 (4c); A-R34-REVIEW-RESIDUALS; A-R37-TEST-HARDENING; DEMO-SFX-FULL-SCALE; L3-REMOVED-TRACK-TAPS; LIB-SEP-REASON; DOC034-UNREACHABLE-NOTE; DOC035-NOTES; DOC036-R37-TAIL; DOC036-ROUND-REF; DOC015-DELETE-GAP-NOTE; EXPORT-DIALOG-FOCUS-RESTORE.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `checkpoint-r37-review.md`):
  - rounds 31–37 are committed (`134b4ab`); round 38 becomes ready for a checkpoint only after C passes it;
  - `npm run test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS (the clamp stays; no limiter);
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` Write/Bash grant;
  - the shared `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - the fake Bearer → 500;
  - the CDP allowlist (it blocks a real dblclick/drag);
  - `Content-Type` without a charset;
  - the dev server's availability.
- **Tech Lead manual checks:** `feature-status.md` §5, including **R38-T**:
  - with a real mouse, a click on each fader does not jump, a drag follows the pointer smoothly, and a real double-click resets Volume, Master and Pan;
  - on a touch device, a fader drag does not scroll the page.
  - Also R35-T, R30-T, R31-T, R33-T, R34-T and TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-37-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementLane.tsx app/components/arrangement/ArrangementMaster.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx app/lib/arrangement/__tests__/track-meter-ui.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-37-snapshots/ArrangementLane.tsx app/components/arrangement/ArrangementLane.tsx
diff -u ../tmp/studio-real-loop/b-round-37-snapshots/ArrangementMaster.tsx app/components/arrangement/ArrangementMaster.tsx
diff -u ../tmp/studio-real-loop/b-round-37-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If a test path above does not exist, report it and run the rest. Do not create test files other than `fader-click.test.tsx`.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G38-1/2, R38-S, R38-U, R38-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-38.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run and the green run;
3. the diff summary per file, and the hook signature;
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including `node.exe`;
6. the deviations and the §2.6 self-check results;
7. the optional browser smoke.

Do not claim PASS. If you hit a stop condition, stop and report; do not widen or narrow the change to avoid it.

**C → `c-round-38.md` and `c-round-38.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R38-PG table side by side with the round-37 jump values;
- the R38-DR table with the measured widths and Δ px;
- DR-AU / DR-AU-P;
- the R38-DC table and the DC-REAL info;
- the mutation table;
- the Ableton two-verdict table (§4.8);
- the gates, the C-R23-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers; **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 39+ — stage 4b-2**, at most three related bugs per round. Proposed order:
  1. (FADER-KEY-ENTRIES, A-R29-REVIEW-1, the pending-commit order);
  2. (the stale refusal status + C-R37-01, A-R31-REVIEW-2);
  3. (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE);
  4. CP-R37-DRAG-ENTRIES re-evaluated after round 38.
- **Then:** stage 4c (round-9 M1/L8) and polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE). After that:
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 38 -StartPhase A` and a higher limit.
