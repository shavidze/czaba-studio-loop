# C — Round 89 verification: R88-FOCUS-ESCAPE-RENDER (stop-based Tab trap, D-29z54)

Verifier: C · Date: 2026-10-22 · **Verdict: PASS** · `browserVerified=true`, `realVerified=true`
Environment: `env-status.json` (round 89, store 200). Playwright Chromium (headless), anonymous fresh contexts, `http://127.0.0.1:5173/studio-lab`, 1440×900 and 1280×720. Backend `:5199` is unavailable (cloud).

## Source state (read-only)
- **Start and end are identical** (`c-round-89/start-hashes.txt` = `end-hashes.txt`):
  - HEAD `971141d`; 7 M + 13 ??;
  - frozen list `b-round-88-r89-tree-sha256.txt` 506/506 OK;
  - A's end hashes match; Modal `741c2341`, ffmpeg `0995ae78`, StudioContext `caa388e7`.
- **The diff against B's snapshot** is exactly G2 plus the doc-077 lines:
  - one import;
  - the `handleDialogTabKey` body (stops + `dialogTabStopFocusTarget`, `preventDefault` only at the ends).
- `dialog-tab-stops.ts` matches G1: it groups radios by non-empty `name`, returns the checked radio or `stop[0]` or `null`, and uses no assertions.

## Results
| ID | Result | Evidence |
|---|---|---|
| TRAP-WAV | **PASS** at 1440 (a2) and 1280 | `trap89-*-wav-*.json`, `shots/trap-wav-*` |
| TRAP-MP3 | **PASS** at both viewports, fast and slow runs | `trap89-*-mp3-a1.json`, `trap89-*-mp3-aslow.json` |
| TRAP-BOTH (1440) | **PASS** | `trap89-1440x900-both-a1.json` |
| PX-KEYS-R2 | **PASS** at both viewports | `trap89-*-keys2-a1.json` |
| IDLE-ORDER | **PASS** at both viewports | `v89-*-A.json` |
| FOCUS-NOT-OBSCURED-R | **PASS** at both viewports | `v89-*-A.json` (idle, done), `v89-*-C.json` (render) |
| VIS-RENDER-S | **PASS** at 1280; 1440 also passes | `v89-*-C.json` |
| PX-NET | **PASS** | all sessions |
| REG-HYD | **PASS** | all sessions |
| G89-3 | **PASS**; the fake-Bearer sub-check is BLOCKED | `g89-*.json`, `token-api-89.json` |
| T89-TARGETED | **PASS**: 52 files, 933 tests | `c-round-89/targeted-c.log` |
| SOURCE-UNCHANGED | **PASS** | start/end hashes |

### TRAP details
**HR-RENDERING was checked on every press.** A press counts only if the busy button read `მიმდინარეობს…` just before and just after it.

**The press sequence.** Every TRAP run used a fresh page, the 5M setup and a keyboard-only path: toolbar Export → Enter → Tab to the format → (ArrowDown) → Tab to the export button → Enter.
- Tab ×6: TRAP-WRAPPER (the `DIV` with `tabIndex=-1`) → X → checked radio → X → checked radio → X → checked radio.
- Shift+Tab ×4: checked radio → X → checked radio → X → checked radio.
- **Shift+Tab from X always went to the checked radio**: `format-wav`, `format-mp3` or `format-both`.
- No press landed on `BODY`, `arrangement-exit` or the Master controls.

**Side effects:**
- The URL did not change.
- The transport stayed stopped (`Play` label) during and after the render.
- Master Volume and Master Mute were the same before and after.
- The progress bar never took focus (`focusProg=false`).

**Files:**
- WAV runs: one `czaba-studio-lab.wav`, RIFF, 48 kHz, 2 ch, 24-bit, 304.406 s (it matches the 5M end, 05:04.406).
- MP3 runs: one `.mp3`.
- WAV + MP3: both files.

**One invalid run.** TRAP-WAV 1440 a1 was harness-invalid and is not counted.
- At 110 ms per press, the 5M WAV render (~880 ms) ended at press 6.
- The rerun (a2) used 20 ms per press and all 10 presses were valid.
- The 1280 run passed on its first attempt.

**TRAP-MP3 phase coverage.**
- The fast runs fell entirely in the render phase.
- The extra slow runs (600 ms per press) covered WAV write 99 % → encoder load ×5–6 → MP3 creation 0–60 %. All 10 presses were valid and inside the dialog.

**PX-KEYS-R2.**
- Setup: snap on, range 4–9 s on stems (`00:04.000 — 00:09.000`), the first MP3 of the session, Enter / ArrowDown / Tab / Enter.
- All 3 Tabs fell in the "MP3 encoder-ის ჩატვირთვა" phase. That is the round-88 escape condition, and focus now goes TRAP-WRAPPER → X → format-mp3 → X.
- `czaba-studio-lab-range.mp3` downloaded.
- Escape after done closed the dialog with focus on the toolbar `Export` button.
- In `afterEscape` the probe field `inToolbar:false` is a probe limitation, not a failure: the heuristic `closest('[role=toolbar],header,nav')` does not match the workspace toolbar. The identification holds because the opener was located with the strict `getByRole('button',{name:'Export',exact:true})`, which throws if more than one element matches. The focused element is a `BUTTON` with text `Export`, and the dialog is closed.

### Other rows
**IDLE-ORDER (101.702 s project):**
- Initial focus is on დახურვა (Close).
- Tab ×5: Export → X → format-wav → scope-project → Close.
- Shift+Tab ×5 gives the exact reverse.
- The range scope is disabled with no range, so the "checked enabled scope" is project.

**FOCUS-NOT-OBSCURED-R:**
- Idle: 10 presses. Done: 101.702 s WAV with the overload warning (+1.7 dBFS, 470 samples), Tab ×6 and Shift+Tab ×6. Render: 5M MP3, Tab ×6 and Shift+Tab ×4.
- Every focused element was inside the dialog.
- No element outside the footer had `bottom > footer.top`.
- The progress bar was never focused.

**VIS-RENDER-S:**
- 5M MP3: render 20/20, wav 101/101, load 3/3 and mp3 9/9 samples were HR-VISIBLE.
- `scrollTop` was 0 before and after the click, and 0 throughout.
- The message read `MP3 შეიქმნა: 05:04.406`.

**PX-NET:**
- unpkg requests appear only after the MP3 Enter or click, and are only `ffmpeg-core.js` / `ffmpeg-core.wasm`. There were none in the WAV runs.
- 0 studio-token / R2 / download requests from the workspace.
- 0 auth headers.

**REG-HYD:**
- 0 hydration or `useLayoutEffect` warnings.
- The only console errors are the expected cloud noise (`ERR_CONNECTION_REFUSED`, "Failed to load cart").

**G89-3:**
- The header link opens `/studio-lab` with the demo badge and the workspace.
- `/studio/middle-east` anonymous shows "Sign in required" with no workspace.
- `/api/studio-token?product=middle-east&file=stem1.wav` anonymous returns **401**.
- Fake Bearer returns 500 "Unable to prepare Studio access". That sub-check is **BLOCKED (backend unavailable in cloud)** and is not claimed.
- The 1440 G run hit a harness navigation race on its first attempt (body null mid-goto); the retry passed.

## Bugs
None new. **R88-FOCUS-ESCAPE-RENDER is fixed by C browser evidence:** 9 valid trap runs (7 × 10 presses + 2 × 3), 76 valid presses, 0 escapes.

## Not claimed / gate
- Gate rows: full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production bundle (PROD-MP3-UNVERIFIED).
- Ableton match: not applicable (§4).

## Notes for B
- **Scope of the browser rows:** they confirm where focus lands. They cannot tell a native middle Tab from a trapped-and-redirected one. The "no `preventDefault` in the middle" contract rests on TR5/TR6 and the frozen focus tests (T89-TARGETED green; full suite = gate).
- **Harness constraint:** the 5M WAV render is ~0.9 s in this runner. A 10-press keyboard sequence needs ≤ ~70 ms per press, or a longer project.
- **Reviewer residuals:** R89-REV-L1..L4 are unreachable in this dialog today, and C did not observe them.
- **Cancel (stage 3b):** it will add an enabled control during render. The stop-based trap must then be re-checked: [X], [format group], [Cancel].
