# Round 267: GATE264-S2. Ctrl/Cmd+letter shortcuts must not fire while Alt or AltGr is held (Medium)

**Planned by:** B, at the round 266 → 267 planning, 2026-10-30.

**Decisions:**
- D-29z566: the round-266 result and its closures;
- D-29z567: gate-266 triage;
- D-29z568: this round's rule and the outcome table;
- D-29z569: rulings on A's and C's notes;
- D-29z570: signals, the checkpoint addendum and the RETRO candidates.

**Read first:** `lessons.md` in full. These apply directly:
- L11 (STOP);
- L12 (no class selectors);
- L23 (B's scratch pre-check, §3);
- L26 and L28 (doc 199);
- L29 (claims, §7);
- L31 (timeouts);
- L47 and L50 (focus, §2.5);
- L51 (status writes, §2.5).

**Previous task:** `tasks/round-266.md`.
- C's result: `c-round-266.json` = **PASS**, with `browserVerified` true and `realVerified` true.
- Gate 266 published rounds 265–266 as `7ba7cd2`.

**What this round is:** a single Medium bug fix in one handler.
- The bug is pre-existing, not a regression.
- D-29z564 fixed it in advance as the next bug round.
- REGRESSION is not due yet: `regression-last.json` says the next one is on or after 2026-11-02.

## Baseline: published HEAD `7ba7cd2`
- HEAD is `7ba7cd297accd7c1fadda76f95f54342a93205ef`, gate 266's published commit. The working tree is clean [K1].
- **Grant (edit):** `b-round-266-r267-grants.txt`, 3 files:
  - `app/components/arrangement/StudioWorkspace.tsx`: only the `handleKeyDown` function in the keydown `useEffect` (it starts at `const handleKeyDown` [K12]), and only the changes in §2.1.
  - `app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`: **add-only.** Append one new `describe` block. The existing 318 lines stay byte-identical, with one allowed exception: you may add names to existing import lines, for example `GESTURE_EDIT_BLOCKED_MESSAGE` [K10].
  - **New file** `docs/implementation/2026/quarter-IV/199-gate264-s2-altgr-shortcuts.md`. 199 is the next free number [K13].
- **Not granted:** everything else, including:
  - `shortcuts.ts` and its sheet. No sheet row changes: the sheet lists no Ctrl+Alt+letter except O [K11].
  - `view.ts` and `ArrangementContext.tsx`.
  - Every other test.
  - `perf/**`, `e2e/**`, `package.json`, `.claude/**` and `CLAUDE.md`.
  - The protected auth and purchase files and the rest of `global_forbidden_files` in `backlog.json`. Examples: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth*`, `app/contexts/AuthContext.tsx`.
- **Scope check:** `git status --porcelain` lists only the 3 grant paths: ` M` on the two code files and `??` on the doc.

## 0. Why this round
**The bug.** The gate-264 reviewer found it, and B reproduced it in cloud Chromium (`b-round-264/probe-altgr-edit.json`). At this planning B reproduced it again on `7ba7cd2` at both viewports, with 0 page errors (`b-round-266/probe-fix-head.json`). Each of these chords runs the plain Ctrl command and is `preventDefault`-ed:
- AltGr+Z (`ż`, `KeyZ`, ctrl + alt + AltGraph) runs Undo.
- AltGr+Shift+Z and AltGr+Y run Redo.
- AltGr+E splits the selected clip.
- AltGr+L reaches the loop handler.
- AltGr+D duplicates the selection (2 clips → 4).
- Without AltGr too: a real Playwright `Control+Alt+KeyZ` (no AltGraph) also undoes, and `Control+Alt+KeyE` reaches the split handler.

**Who it hurts.** Polish, Czech or German users who type ż, ę, ł, ą or € outside a text field. On Windows AltGr layouts, Chromium reports AltGr as `ctrlKey && altKey`. The KeyO branch already guards AltGraph for this reason [K4].

**The cause.**
- The Ctrl-letter branches test only `modifier = event.ctrlKey || event.metaKey` [K6].
- Ten of them never check `altKey` or AltGraph [K2]. Only G checks `!event.altKey`, and only KeyO checks AltGraph [K4].

## 1. Reference: how Ableton Live 12 does it (checked 2026-10-30)
Source: Live 12 Reference Manual, ch. 42 "Live Keyboard Shortcuts", https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/. Read with WebFetch on 2026-10-30, up to character 100000 of the page.

| Behaviour | Live source | Confirmed in Live | CZABA decision | C check |
|---|---|---|---|---|
| Undo / Redo | §42.5 Editing: Ctrl+Z / Cmd+Z; Ctrl+Y / Cmd+Shift+Z | no Alt in the chord | unchanged | POS-CTRL |
| Split, loop, select, duplicate, clipboard, group | §42.16: Ctrl+E Split Clip at Selection, Ctrl+L Toggle Loop Brace; §42.5: Ctrl+A/D/C/X/V; §42.19: Ctrl+G Group Selected Tracks | no Alt in the chord | unchanged | POS-CTRL |
| Ctrl+Alt+letter is a **different** command | §42.1: Ctrl+Alt+O Overview, +V Video Window, +B Browser, +M Mixer; §42.12: Ctrl+Alt+E Full-Size Clip View; §42.16: Ctrl+Alt+F Create Fade; §42.19: Ctrl+Alt+T Insert Return Track; §42.22: Ctrl+Alt+G Filter View | Ctrl+Alt+E is not Split and Ctrl+Alt+G is not Group: adding Alt never means the plain Ctrl command | Ctrl/Cmd+Alt+letter runs **no** Ctrl-letter command. CZABA implements only Ctrl+Alt+O (Overview, CALM-3), so every other such chord does nothing and is not prevented | ALT-CHORDS (ALTGR-UNDO, ALTGR-EDIT), CTRLALT-REAL, META-ALT-REAL; Ctrl+Alt+O in POS-CTRL |
| AltGr (Windows AltGr layouts) | **No source found.** Searched the ch. 42 text for "AltGr" and "Alt Gr" | — | An AltGr character press is typing, not a shortcut: same rule as Ctrl+Alt | ALTGR-* rows; Ableton conformance "unconfirmed (no source)" |

- **Deviations:** none from Live. CZABA does not add the Ctrl+Alt commands Live has and CZABA lacks (V, B, M, E, F, T, G and the rest); they are outside this round. This is not a ⚖ deviation, because we do not run a different command on those keys. We run none.
- **Screen budget (L39):** nothing visible is added or changed, and no shortcut-sheet row changes.

## 2. A: what to do
### 2.1 Behaviour (only `handleKeyDown` in `StudioWorkspace.tsx`)
1. **Add one boolean.** Right after `const modifier = event.ctrlKey || event.metaKey;` [K6], add a derived boolean meaning "a command chord: Ctrl or Cmd, with no Alt and no AltGraph". Its exact value is `modifier && !event.altKey && !event.getModifierState('AltGraph')`. Give it a discoverable name, for example `commandChord` (AGENT_DISCOVERABLE_CODE).
2. **Use it instead of `modifier`** in exactly these places:
   - the `modifier && (key === 'e' || …)` arm of the pointer-gesture block [K3];
   - the ten Ctrl-letter branches e, z, y, l, a, d, c, x, v and g [K2]. On g, the existing `&& !event.altKey` may stay or go; both are equivalent.
3. **Do not change:**
   - the KeyO branch [K4];
   - the Space branch;
   - `timelineNavigationKey`, which already rejects Alt [K7];
   - the Ctrl+Arrow and Apple Alt+Arrow branch;
   - the `if (modifier) { return; }` line [K5]. It keeps `modifier`, so an Alt chord stops there and never reaches the plain-letter branches (M, G, A, U and the digits);
   - any status string or shortcut-sheet text.
4. **Result.** An Alt or AltGr chord with Ctrl or Cmd plus one of those letters:
   - changes no state;
   - writes no status;
   - is **not** `preventDefault`-ed (`dispatchEvent` returns true);
   - does not show the gesture-blocked message while a pointer gesture is active.

   Plain Ctrl/Cmd chords behave exactly as at HEAD. B's sketch is `b-round-266/sketch.diff` (1 added line and 11 substitutions). A may use it as is.

### 2.2 Tests: add-only, one new `describe` in `meta-shortcuts-ui.test.tsx`
Name the block `GATE264-S2: Alt or AltGr held with Ctrl/Meta runs no Ctrl-letter command`. Reuse the file's `mountMetaWorkspace`, `live`, `press` and `addOneClip`.

Put the chord variants in one table:
- `AltGr` = `{ ctrlKey: true, altKey: true, modifierAltGraph: true }`;
- `Ctrl+Alt` = `{ ctrlKey: true, altKey: true }`;
- `Meta+Alt` = `{ metaKey: true, altKey: true }`.

Rules for every row:
- AG1–AG4 use `it.each` over the three variants.
- Assert the effect first and `notPrevented === true` last.
- End with a positive plain-chord control in the same mount, so that a broken mount cannot pass as "nothing happened".

| Row | Start state | Action | Expected |
|---|---|---|---|
| AG1 (each variant) | 1 clip added (Undo available) | chord+Z | clip count 1, `undoLabel` unchanged, status unchanged, not prevented |
| | | plain Ctrl+Z (positive control) | clip count 0 (Redo now available) |
| | | chord+Shift+Z, then chord+Y | clip count still 0, status unchanged, both not prevented |
| AG2 (each variant) | 1 clip selected, insert marker inside it (`setInsertMarker(clip.start + 5)`) | chord+E | clip count 1, status unchanged, not prevented |
| | | plain Ctrl+E (positive control) | clip count 2 |
| AG3 (each variant) | 1 clip; `setTimeRange({ start: 2.5, end: 7.5, trackId: 'music' })` | chord+L, then chord+Shift+L | `arrangement.loop` null; loop button `aria-pressed="false"`; the range deep-equals the one set, so it was not extended to all tracks; status unchanged; both not prevented |
| | | plain Ctrl+L (positive control) | the loop is set (the same assertion as MS5) |
| AG4 (each variant) | 1 clip selected | chord+A, D, C, X, V, G and Shift+G | after each: clip count 1, selected clip ids unchanged, `undoLabel` unchanged, 0 `[data-group-id]`, status unchanged, not prevented |
| | | plain Ctrl+D (positive control) | clip count 2 |
| AG5 | 1 clip; then `act(() => { release = live(api).claimPointerGesture(42, () => {}); })` (the technique of `track-groups-ui.test.tsx` [K14]) | AltGr+E | status unchanged (not `GESTURE_EDIT_BLOCKED_MESSAGE`), clip count 1 |
| | | plain Ctrl+E (positive control), then release the gesture | status `GESTURE_EDIT_BLOCKED_MESSAGE` |
| AG6 | 1 clip, Undo available; read the Snap toggle's `aria-pressed` (`getByTestId('arrangement-snap-toggle')` [K16]) | `{ ctrlKey: true, altKey: false, modifierAltGraph: true }` with Z, then with G (`key: 'g', code: 'KeyG'`) | clip count 1, Snap `aria-pressed` unchanged, status unchanged, both not prevented |

AG6 makes the AltGraph term non-vacuous. It is a contract row, not a claim about a real platform.

**Red-proofs.** A runs these on a scratch copy outside `store/`, logs them to `a-round-267/` and restores the scratch afterwards:
- **10 per-branch mutants:** revert one of the ten letter branches to `modifier` at a time. Each mutant turns at least one AG row red. Name the row and the line.
- **M-ALT:** the boolean without `!event.altKey`. The Ctrl+Alt and Meta+Alt variants go red.
- **M-AG:** the boolean without the AltGraph term. AG6 goes red.
- **M-GESTURE:** the gesture arm keeps `modifier`. AG5 goes red.
- **M-RETURN:** change `if (modifier)` to `if (commandChord)`. AG6's G step goes red, because the plain-letter G branch (`!event.altKey`) then toggles Snap.

**Timeouts (L31).** At gate 266 the file ran 11 tests in 7175 ms, about 0.65 s per test against the 5 s default, so the new rows have headroom. If any new row takes more than 2.5 s in A's run, report it at the top of the report (L11).

### 2.3 Implementation doc 199 (L26, L28)
- l.4 is exactly `**სტატუსი:** Completed (C round 267 PASS)`.
- Write it in Georgian, following `docs/implementation/TEMPLATE.md`. Its `## ` headings contain TEMPLATE's seven headings in order.
- Cite only rows that exist (AG1–AG6), the mutants and the manual §42 source.
- State the §6 item 4 Linux hypothesis as an open question, not as fixed.

### 2.4 Checks (speed rules), from `store/`
- `npm run typecheck`, `npm run lint`, and `npx biome check` on the 2 granted code files.
- `npx vitest run` on these 13 files:
  - `meta-shortcuts-ui.test.tsx`, `overview-visibility-ui.test.tsx`, `shortcut-sheet-ui.test.tsx`;
  - `insert-marker-ui.test.tsx`, `marker-edge-nav-ui.test.tsx`;
  - `grid-snap-keys.test.tsx`, `grid-adaptive-ui.test.tsx`, `grid-triplet-ui.test.tsx`;
  - `clip-envelope-ui.test.tsx`, `track-group-collapse-ui.test.tsx`, `track-groups-ui.test.tsx`;
  - `background-time-selection-ui.test.tsx`, `focus-source-typing.test.tsx`.
- 3 files change, so run the read-only `code-reviewer` subagent and pass its Architecture note to B.
- No full suite and no `npm run verify`: those are gate rows.

### 2.5 Focus and status (L47, L50, L51)
- **L50 grep** over the code grant: `grep -cE "onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)" app/components/arrangement/StudioWorkspace.tsx` gives 20 hits. **None of them** lies inside `handleKeyDown` (HEAD lines 2206–2584) [K15].
  - **Class ruling:** every hit is outside the changed function and out of scope. The change only removes action paths for Alt chords, so nothing mounts or unmounts because of them, and no new focus origin exists.
  - C's row FOCUS-ALT checks that a focused element keeps focus across Alt chords.
- **L51:** the change adds no `setStatus`. It removes one path to the existing `GESTURE_EDIT_BLOCKED_MESSAGE` write [K3] for Alt chords, and AG5 covers both sides. The handler's status writes are at HEAD lines 2263, 2341 and 2566 [K15].

### 2.6 STOP conditions (L11: write them at the top of `a-round-267.md`)
- A needed change outside the 3 grants or outside `handleKeyDown`.
- An existing test goes red. B's pre-check (§3) found none.
- An existing line of `meta-shortcuts-ui.test.tsx` changes, other than names added to an import line.
- A §2.2 mutant stays green and you cannot show it is equivalent.
- A test runs above 50 % of its timeout.

## 3. Neighbouring behaviour at risk, and B's pre-check (L23)
**Pre-check on a scratch copy** (`/tmp/b266-scratch`, with the sketch `b-round-266/sketch.diff` applied):
- `npx vitest run` on every test file under `app/` that mentions `altKey|modifierAltGraph|getModifierState`: 24 files (`b-round-266/precheck-files.txt`), **507/507** tests pass (`b-round-266/precheck-sketch-vitest.txt`).
- Every test file that mentions `ctrlKey|metaKey|Control+|Meta+`: 40 files, **725/725** tests pass (`b-round-266/precheck-ctrl-vitest.txt`).
- `tsc --noEmit`: rc 0 (`b-round-266/precheck-typecheck.txt`).
- **Collisions: 0.** No existing test sends Ctrl/Meta+Alt+letter and expects the Ctrl command. At HEAD the only `modifierAltGraph` use is the Overview negative row [K9].

**Browser sketch.** A scratch server on :5174 ran `b-round-266/probe-altgr-fix.mjs` at both viewports, with 0 page errors. Compared with HEAD (`probe-fix-head.json`), the sketch run (`probe-fix-sketch.json`) shows:
- **No effect:** every AltGr chord (Z, Shift+Z, Y, E, L, A, D) and the real `Control+Alt+KeyZ` and `Control+Alt+KeyE` leave clips and status unchanged and are not prevented.
- **Plain chords still work:**
  - `Control+KeyZ` undoes (1 clip → 0) and `Control+Shift+KeyZ` redoes;
  - `Control+KeyE` splits (1 → 2) with "Clip split at 00:07.500.";
  - `Control+KeyL` gives the needsSelection text.
- **Overview still toggles:** `Control+Alt+KeyO` gives "Overview hidden. Ctrl+Alt+O shows it again.", then "Overview shown. Ctrl+Alt+O hides it.".

**At risk.** Each of these is covered by A's test list or by C's rows:
- Ctrl+Alt+O (Overview), which runs before the changed lines;
- Ctrl+Shift+Space, which checks `!event.altKey` itself;
- the macOS Alt+Arrow marker step;
- Alt-alone letters (MS6);
- plain letters with Alt, which already require `!event.altKey`;
- the Mac Cmd chords (the Meta halves of MS1–MS5).

## 4. C: what to verify
Run the browser rows at 1440×900 and 1280×720, in a fresh anonymous context on `http://127.0.0.1:5173/studio-lab`. Wait for "Demo collection ready" first (L48).

| Row | Steps | PASS when |
|---|---|---|
| SOURCE-SCOPE | `git rev-parse HEAD`; `git status --porcelain` | HEAD is `7ba7cd2`; only the 3 grant paths are listed |
| HUNK-SCOPE | `git diff -U0 app/components/arrangement/StudioWorkspace.tsx`; `git diff app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` | every hunk lies between HEAD lines 2206 and 2584 [K12, K15]; exactly 1 added declaration line and 11 substitutions [K2, K3] (the g line may also drop `&& !event.altKey`); the test diff is add-only (import-line additions allowed) |
| CLAIMS | re-run §7 K1–K16 verbatim at HEAD | every output matches |
| TESTS-TARGETED | the §2.4 file list | all green; report the counts |
| MUTANTS | on C's own scratch: M-ALT, M-AG, M-GESTURE, M-RETURN and at least 3 of the 10 per-branch mutants | each turns its named row red |
| ALTGR-UNDO | add a clip (focus the first library option, press Enter), blur; on `document.body` dispatch `new KeyboardEvent('keydown', {key:'ż', code:'KeyZ', ctrlKey:true, altKey:true, modifierAltGraph:true, bubbles:true, cancelable:true})`; then the same with Shift (`'Ż'`); then with `KeyY` | clips stay 1, status text unchanged, `dispatchEvent` returns true each time |
| ALTGR-EDIT | click inside the clip 300 px from its left edge (this selects it and sets the marker), blur; AltGr `KeyE` (`'ę'`), `KeyL` (`'ł'`), `KeyA` (`'ą'`), `KeyD` | clips stay 1, loop button `aria-pressed="false"`, status unchanged, not prevented |
| CTRLALT-REAL | Playwright `page.keyboard.press('Control+Alt+KeyZ')`, then `Control+Alt+KeyE` | clips and status unchanged |
| META-ALT-REAL | `Meta+Alt+KeyZ`, then `Meta+Alt+KeyE` | clips and status unchanged |
| POS-CTRL | see the list below the table | all as listed |
| FOCUS-ALT | focus the first library option (`role="option"`); AltGr Z, then E, then L | after each, `document.activeElement` is the same option; clips unchanged |
| DOC-199 | read l.4 and the headings; grep the cited rows | l.4 byte-exact; headings contain TEMPLATE's 7 in order; every cited row (AG1–AG6) exists in the test file |
| G267-AUTH | `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token` with no header | workspace and demo notice shown, `auth_user` null; "Sign in required", 0 `audio[src]`; 401, no token |
| Gate rows | full vitest, build, Biome full, `npm run verify`, `npm run test:e2e:smoke` | **gate**, not claimed |

**POS-CTRL**, in order:
1. `Control+KeyZ`: clips 0, status "Undo: Add — …".
2. `Control+Shift+KeyZ`: clips 1.
3. Re-select the clip with the marker inside it, then `Control+KeyE`: 2 clips and "Clip split at 00:07.500." (or the exact split time C sets).
4. `Control+KeyL` with no range: "To set a loop, first make a time selection (drag in a lane)."
5. `Control+Alt+KeyO` twice: "Overview hidden. Ctrl+Alt+O shows it again.", then "Overview shown. Ctrl+Alt+O hides it."

**Ableton conformance**, judged separately from the CZABA requirement:
- the Ctrl+Alt rows: "confirmed" (§42: a different command, never the Ctrl one);
- the AltGr rows: "unconfirmed (no source)";
- the plain chords: "confirmed" (§42.5, §42.16).

**Not in scope:**
- real Windows AltGr hardware (TLM-R232-ALTGR-WIN stays with Saba);
- Linux AltGr without `ctrlKey` (§6 item 4);
- the Ctrl+Alt commands Live has and CZABA lacks.

## 5. Outcome, fixed in advance (D-29z568)
- **PASS and gate published:** GATE264-S2 is closed. Round 268 fixes the stage-1 readout bugs of 11c (§6 item 1), unless REGRESSION is due (on or after 2026-11-02 at planning time).
- **Gate fail:** a bounded fix-up with the same grants.
- **C finds a Medium or higher in a changed path:** a fix-up with the same grants.
- **STOP:** B rules first (L10).

## 6. Signals and the next rounds (not this round)
1. **GATE266-S1 (Medium, open, D-29z567).** When a time selection extends past the selected clip, the details panel shows Start/End values clamped to the clip, and Enter in those fields shrinks the selection to the clip. It is planned for round 268, together with two Lows on the same stage-1 readouts:
   - B-R266-1 / GATE266-S4: `splitRangeDone` and `splitRangeTitle` say "both edges" when only one edge is cut;
   - `splitRangeClipsDone` says "Clips split" when one selected part was not cut.

   Before dispatch, B reproduces GATE266-S1 in the browser at that planning.
2. **Gate-266 Lows go to `deferred_low_polish`:**
   - GATE266-S2: scroll or zoom drift during a drag, joined to A-R265-REVIEW-SCROLL-DRIFT;
   - GATE266-S3: the Mac Ctrl+drag label and the context menu it may open;
   - GATE266-S5: a background selection is not announced to screen readers.
3. Then SYS-6, as already ordered.
4. **Hypothesis, not scheduled: B-R266-LINUX-ALTGR-PLAIN-LETTERS.** A platform may report AltGr as AltGraph **without** `altKey` or `ctrlKey`; Linux X11 is suspected. The plain-letter branches (M, G, A, U, 1–5) check only `!event.altKey`, so there AltGr+M could add a marker. This is unverified and goes to the Tech Lead list. A real repro makes it a normal finding.

## 7. Claims (L29)
C re-runs each command verbatim at HEAD `7ba7cd2`. Commands run from `store/` unless marked "loop root". Set `W=app/components/arrangement/StudioWorkspace.tsx`. Line numbers are HEAD's; the commands read HEAD through `git show HEAD:` or `git grep … HEAD`, so A's diff does not change them. In the table, `\|` stands for a literal `|`.

| Tag | Claim | Command | Expected output |
|---|---|---|---|
| K1 | HEAD and a clean tree at planning | `git rev-parse HEAD`; loop root: `wc -l < b-round-266/git-status-at-planning.txt` | `7ba7cd297accd7c1fadda76f95f54342a93205ef`; `0` |
| K2 | the ten Ctrl-letter branches test `modifier` | `git show HEAD:$W \| grep -n "if (modifier && key === '"` | 10 lines: 2344 e, 2351 z, 2360 y, 2365 l, 2376 a, 2381 d, 2388 c, 2398 x, 2409 v, 2448 g (the g line ends `&& !event.altKey) {`) |
| K3 | the gesture-block arm and its status write in the handler | `git show HEAD:$W \| grep -n "((modifier &&\|setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)" \| awk -F: '$1>=2206 && $1<=2584'` | `2323:        ((modifier &&` and `2341:        current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);` |
| K4 | only KeyO guards AltGraph | `git show HEAD:$W \| grep -n "getModifierState('AltGraph')"` | 1 line: `2252:        !event.getModifierState('AltGraph')` |
| K5 | the modifier early return | `git show HEAD:$W \| grep -n "if (modifier) {"` | `2459:      if (modifier) {` |
| K6 | the modifier definition | `git show HEAD:$W \| grep -n "const modifier = event.ctrlKey \|\| event.metaKey;"` | 1 line at `2269:` |
| K7 | navigation keys reject Alt | `grep -n "input.ctrlKey \|\| input.metaKey \|\| input.altKey" app/lib/arrangement/view.ts` | 1 line at `278:` |
| K8 | shortcut letters come from `event.code` | `git show HEAD:$W \| grep -n "event.code.startsWith('Key')"` | 1 line at `498:` |
| K9 | the only `modifierAltGraph` use at HEAD | `git grep -n "modifierAltGraph" HEAD -- app perf e2e` | 1 line, starting `HEAD:app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx:247:` |
| K10 | the test file at HEAD | `git show HEAD:app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx \| sha256sum`; the same piped to `wc -l` | `fc9a6b9ebaeec2661e0a6e142f30f7322ef3daad6da13237a58f8886109510a8`; `318` |
| K11 | the sheet lists only one Ctrl+Alt key | `grep -n "keys: \['Ctrl+Alt" app/lib/arrangement/shortcuts.ts` | 1 line: `158:        keys: ['Ctrl+Alt+O'],` |
| K12 | the handler and its listener | `git show HEAD:$W \| grep -n "const handleKeyDown = (event: KeyboardEvent)\|window.addEventListener('keydown', handleKeyDown)"` | `2206:` and `2606:` |
| K13 | 199 is free | `git ls-tree --name-only HEAD docs/implementation/2026/quarter-IV/ \| sort -V \| tail -1` | `docs/implementation/2026/quarter-IV/198-saba-b-11c-background-time-selection.md` |
| K14 | the gesture technique exists | `grep -n "claimPointerGesture(42" app/lib/arrangement/__tests__/track-groups-ui.test.tsx` | 1 line at `579:` |
| K15 | the L50 and L51 counts | (a) `git show HEAD:$W \| grep -cE "onPointerDown(Capture)?\|onBlur\|settleEditor\(\|\.focus\(\|^\s*\{[^}]*(\.map\(\|&&\|\?)"`; (b) the same pattern with `-nE` piped to `awk -F: '$1>=2206 && $1<=2584' \| wc -l`; (c) `git show HEAD:$W \| grep -n "setStatus(" \| awk -F: '$1>=2206 && $1<=2584' \| cut -d: -f1 \| tr '\n' ' '` | (a) `20`; (b) `0`; (c) `2263 2341 2566 ` |
| K16 | the Snap toggle testid (unquoted grep, because a JSX attribute value may be an expression) | `git grep -n "arrangement-snap-toggle" HEAD -- app/components` | 1 line: `HEAD:app/components/arrangement/StudioWorkspace.tsx:2870:` |

**Browser claims (§0, §3):** in the loop root, `b-round-266/probe-fix-head.json` and `b-round-266/probe-fix-sketch.json`. Script: `b-round-266/probe-altgr-fix.mjs <base> <out.json>`.
