# C round 98: GATE97-S1 (toolbar Export ignores a held Enter) + GATE97-S3 (doc 085 status)

Verifier: C · 2026-10-23 · task `current-task.md` (round 98, D-29z63) · A report `a-round-98.md`
**Verdict: PASS.** `browserVerified=true`, `realVerified=true`.
- 1 Low finding for B (C-R98-B1). It is a false contract premise and predates this round; it is not a round-98 regression.
- 1 sub-check is blocked because the backend is unavailable in the cloud.

All sessions ran in fresh incognito Playwright Chromium contexts with no credentials, at `http://127.0.0.1:5173/studio-lab`. Input was real (`page.keyboard` / `page.mouse` / `locator.click`). C did not start or stop any server and did not edit any source file.
- Tools: `c-round-98/tools/` (`lib98.cjs`, `run98.cjs`, `space98.cjs`, `run-g983.cjs`, `mut98.cjs`, `wav.cjs`).
- Raw output: `c-round-98/out/`. Screenshots: `c-round-98/shots/`.

## Source state (SOURCE-UNCHANGED): PASS
Start (`c-round-98/start-hashes.txt`) and end (`end-hashes-c.txt`) are identical:
- HEAD `11d042c`; `git status` shows 2 M (`ArrangementTransport.tsx`, doc 085) and 2 ?? (`export-toolbar-hold-enter.test.tsx`, doc 086);
- frozen list 528/528 OK; `a-round-98/end-hashes.txt` 4/4 OK.

`git diff -U0`:
- Transport: one hunk `@@ -248,0 +249,5 @@`, an inline `onKeyDown` inside the Export button: `if (event.key === 'Enter' && event.repeat) { event.preventDefault(); }`. It has no stopPropagation and no new export, hook, state or prop.
- Doc 085: `@@ -4 +4 @@` only. Doc 086 l.4 says the round is waiting for C (D-29z63).

## Browser rows
| ID | VP | Result | Evidence |
|---|---|---|---|
| CLOSE-HOLD | 1280, 1440 | **PASS** (identical at both) | Mouse click on Export, then focus on დახურვა. The recorder showed, in order: keydown `Enter repeat=false` on დახურვა, then a click on დახურვა. The dialog was gone after 4–5 ms and focus was on toolbar Export after ≤1 ms. Two keydowns followed, `repeat=true` on **Export** (outside the dialog), `defaultPrevented=true`, with **0 clicks on Export**. After 1 s there was no dialog and focus was on Export. 0 errors. `out/run98-*-closehold.json`, `shots/closehold-*.png` |
| CANCEL-CLOSE-HOLD | 1440 | **PASS** (attempt 1, valid) | 3 sources plus 3× Ctrl+D. WAV export started, then a mouse click on გაუქმება at `რენდერი · 4%`. Status `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.` appeared after 1 ms, with focus on დახურვა. The same held-Enter sequence gave the same 4 events: closed once, repeats on Export `dp=true`, no click on Export. After 1 s and after 10 s the dialog was closed and focus was on Export. **0 downloads in 10 s.** `out/run98-1440x900-cancelhold.json`, `shots/cancelhold-1440x900.png` |
| FRESH-OPEN | 1280, 1440 | **Not passed as a row.** Enter: PASS; click: PASS; Space: FAIL (pre-existing, C-R98-B1) | Run in the same context as CLOSE-HOLD. `press('Enter')` on Export gave keydown `repeat=false`, `defaultPrevented=false`, then a click on Export. The dialog opened and focus went to დახურვა. A mouse click also opened it with focus on დახურვა. `press('Space')` on the focused Export did **not** open the dialog: no click event, focus stayed on Export. `shots/fresh-*.png` |
| OPEN-HOLD | 1280 | **PASS** | Export focused, one keydown `repeat=false`, `dp=false`, then one click on Export and the dialog opened. Two keydowns followed, `repeat=true` on დახურვა, `dp=true`. The dialog was still open, with focus on დახურვა, and nothing clicked დახურვა. `shots/openhold-1280x720.png` |
| ENTER-ADD-REG | 1280 | **PASS** | Dialog closed, click on the Middle East row, then Enter. Clips went 0 → 1 (`music`). Status before: `დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).` After: `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` Ctrl+Z gave 0 clips and `Undo: დამატება — Middle East — საჯარო preview`. `out/run98-1280x720-enteradd.json` |
| EXPORT-REG | 1280 | **PASS** | One download, `czaba-studio-lab.wav`, 29 290 220 B. Decoded: RIFF/WAVE PCM, 2 ch, 48 kHz, 24-bit, 4 881 696 frames = **101.702 s**, NaN 0, RMS 0.175. Status `WAV შეიქმნა: 01:41.702, 24-bit · 48 kHz · stereo.` One fresh Enter on დახურვა closed the dialog, and focus went to toolbar Export. `out/exportreg-1280x720-1-czaba-studio-lab.wav` |
| PX-NET | all 9 sessions (incl. space probe) | **PASS** | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers (`out/px-net-agg.json`). G98-3's explicit `ctx.request` 401 probe is excluded by design. |
| REG-HYD | all sessions | **PASS** | 0 non-noise console errors or warnings, 0 pageerrors, no hydration warning. 14 noise lines (cart / `localhost:5199`). |
| G98-3 | 1440 anon | **PASS** (fake-Bearer **BLOCKED**) | The header link `Studio LabDemo` opened `/studio-lab` with 1 workspace and the demo badge. `/studio/middle-east` showed „Sign in required“, 0 workspace, 0 audio. `/api/studio-token` returned **401** `{"error":"Please sign in to access Studio."}`. localStorage held only `czaba_spotlight_last_shown` and `czaba_session_id`. The fake-Bearer sub-check is blocked: backend unavailable in cloud. `out/g983.json` |

## Non-browser rows
- **T98-TARGETED: PASS.** `npx vitest run $(cat a-round-98/targeted-list.txt)` gave **14 files, 210 tests, all pass** (`c-round-98/targeted-c.log`). C re-ran the grep (`ArrangementTransport|name: 'Export'|/^Export$/`). Its 11 hits are all in A's list; the other 3 are the files the task names directly (focus-restore, hold-enter, master-hold-tick). No file is missing.
- **AN-REVIEW: PASS.** C used its own scratch (`c-round-98/mut/`, own `cacheDir`) and wrote its own mutation edits (`tools/mut98.cjs`, `out/mut98.json`):

  | variant | red |
  |---|---|
  | control | none (5/5) |
  | fail-before (baseline `35b03a95`) | TH1 only, as B expects |
  | a: no preventDefault | TH1 |
  | b: every Enter | TH2 |
  | d: + stopPropagation | TH4 |

  The test file contains no `as` and no `@ts-`. Every keyDown return value is asserted with `toBe(true/false)`, and there is no `toBeTruthy`. `afterEach` unstubs globals, restores mocks and removes the document listeners. TH3 checks only the Transport handler; it does not mount the StudioWorkspace global Space handler, so it does not contradict C-R98-B1.
- **Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Finding for B: C-R98-B1 (Low, pre-existing, false contract premise)
- **Contract:** FRESH-OPEN says "Space also opens it, as now".
- **Observed** (`space98.cjs`, 1280; same result in run98 at 1440):
  - Export is focused and the key is `press('Space')`.
  - A window bubble listener added after mount sees keydown `' '` `defaultPrevented=true` and keyup `defaultPrevented=true`. No click reaches Export and the dialog stays closed.
  - Empty project: Play stays Play.
  - With 1 clip: **Play → Pause**; a second Space → Play.
- **Cause:** the global play/stop shortcut, `StudioWorkspace.tsx` l.1699–1704 (keydown `preventDefault` + `togglePlayback`) and l.1970–1978 (keyup `preventDefault` while export is closed). That file is frozen with an unchanged hash. The round-98 diff is Enter-only, so this behaviour predates the round.
- **B decides:**
  - either drop Space from the FRESH-OPEN contract, since the shortcut footer `Space · Home · …` documents Space as global play;
  - or decide that a focused button wins over global Space.
- Ableton correspondence: **დაუდასტურებელი**; no source was consulted.

## Notes (not bugs)
- **N1:** the evidence is Chromium only. The code-reviewer's Low #1 is untested here and stays for B. It describes Safari / macOS Firefox: a mouse click there may leave focus on `body`, so repeated Enters would reach the global Enter shortcut, which has no `repeat` check.
- **N2:** the EXPORT-REG mix clips: the app's alert reads +1.7 dBFS with 470 samples limited. C's ≥0.9999 counter gives 486, a different threshold. This is the existing overload feature.
- **N3:** the library row stops Enter propagation, so the recorder shows `NOT-REACHED-BUBBLE`. This existed before round 98 and the add works.
- **N4:** the run98 recorder's bubble listener runs before the app's window handler. Its `defaultPrevented` is valid for the React Export guard, but not for app-global keys; the Space evidence uses the late listener.

## Ableton correspondence
| Behaviour | Status |
|---|---|
| A held Enter that closes the dialog does not re-open it from the toolbar | არ ეხება (B makes no claim about Live) |
| Space on a focused toolbar button vs global play | დაუდასტურებელი |

## Remaining for B / root
- C-R98-B1: the decision above.
- Reviewer Low #1: Safari / Firefox focus, plus whether the global Enter shortcut should ignore `event.repeat`.
- Reviewer architecture note: a shared fixtures module for the test fakes. A carries it, B decides.
- GATE97-S4: the `=== true` at `ArrangementExportDialog.tsx` l.542, together with GATE89-S4.
