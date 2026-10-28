# A round 228 — SABA-B-8 CALM-1b (key in transport tooltips, `aria-keyshortcuts`, one source) + C-R227-01, C-R227-02, B-R225-BACK-TO-START-KEY

**Status:** implemented; handed to C. No STOP. Code-review done (§5). Scope completed: CALM-1b grants 1–12 only; A does not mark any C acceptance row as passed.

## 1. Start (task §4.1)
- HEAD `d32464ea264e94f7b0aa98c5b64934340c275d33`; `git status --short` empty at start.
- `sha256sum -c` rc 0 for `b-round-227-r228-tree-sha256.txt`, `…-granted-start-sha256.txt`, `…-root-files-start-sha256.txt`.
- Pre-flight run; primitives read: AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES; `lessons.md` read in full.

## 2. Changed files (all 12 grants, all `M`, no `??`)
1. `app/lib/arrangement/shortcuts.ts` — `ariaKeyShortcuts` on play-stop, back-to-start, loop, undo, redo, delete, split (§2.1 table, exact); `fit` second key → `Double-click the ruler (no time selection)`; new exports `studioShortcutTitle`, `studioShortcutAria`. Still 0 `import` lines.
2. `app/lib/arrangement/strings.ts` — import of `studioShortcutTitle`; the 9 entries of §2.2 + `undoTitle`/`redoTitle`.
3. `app/components/arrangement/ArrangementTransport.tsx` — Undo/Redo `title` from the helpers; `aria-keyshortcuts` on Play, Back to start, Undo, Redo, Split, Delete, Loop; `studioShortcutAria` import. No class/DOM/handler change.
4. `shortcuts.test.ts` — SC4 `fit` literal; new **SC5**.
5. `strings.test.ts` — ST6/ST10/ST17 literals; ST8 `undoTitle`/`redoTitle` samples; new **ST-K1**.
6. `navigation-strings-ui.test.tsx` — NS1/NS2 literals; new **NS5** (imports `findStudioShortcut`, `StudioShortcutId`, `studioShortcutAria`, `studioEditStrings`).
7–11. `grid-snap-loop-drop`, `status-announcement-ui`, `markers-ui`, `self-disabling-focus`, `waveform-zoom` — R1 swaps only (+ the `studioEditStrings` import where missing), identical to `b-round-227/precheck-scratch.diff`.
12. `docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md` — §2.5.

Grants 1–3 and 7–11 are exactly B's reference diff (`git apply` of `b-round-227/precheck-scratch.diff`, Biome clean with no fixes). A's own additions: SC5, ST-K1, NS5, doc 177.

Artifacts: `a-round-228/granted-hunks.diff` (vs `b-round-227/granted-start/`), `a-round-228/changed-end-sha256.txt`, `a-round-228/covering-files.txt`, `a-round-228/covering.log`, `a-round-228/mutants.txt`.

## 3. Checks actually run
- `npm run typecheck` rc 0.
- `npm run lint` rc 0 (205 warnings / 1 info repo-wide; not compared with HEAD, so "pre-existing" is unverified). `npx biome check` on the 11 granted code/test paths: 0 diagnostics, no fixes, so no new warnings in granted files.
- `grep -c "Ctrl/Cmd" app/lib/arrangement/strings.ts` = 3 (l.655, 656, 685: the soloLabel formatters and soloTitle; outside the grant scope).
- `grep -n "import" app/lib/arrangement/shortcuts.ts` → 0 lines (no cycle).
- Note: `covering.log` predates the post-review SC5 extension (§5), which changed only `shortcuts.test.ts` and doc 177; shortcuts.test re-ran 5/5 green afterwards.
- **Covering set** (27 files = task §4.3 named files ∪ the §4.3 grep ∪ the L40 testid grep incl. `arrangement-follow` ∪ a title-literal grep): **27 files, 488 tests, all green** (`a-round-228/covering.log`).
  - No test above 50 % of its timeout. Slowest: UM9 4007 ms, UM11 3600 ms, UM3 3516 ms, UM4 3394 ms, UM1 3206 ms (track-group-mix-ui, declared `timeout: 20_000` → max 20 %; gate-227 times 3329/2529/3233/2963/2802 ms). Slowest default-5 s test: "titles the transport delete button…" 1841 ms (37 %).
  - navigation-strings-ui: NS1 606 ms, NS5 540 ms in the first run (≤ 12 % of 5 s).
- **Mutants** (each restored, then `sha256sum -c` of the finished files rc 0):
  - MU-1 `studioShortcutTitle` returns `label` → SC5, NS1, NS2, NS5 red.
  - MU-2 no `ariaKeyShortcuts` on `undo` → SC5, NS5 red.
  - MU-3 `fit` key back to `(no selection)` → SC4 red.
  - MU-4 no `aria-keyshortcuts` on Split → NS5 red.
  - MU-5 `loop` aria = `Control+L` → SC5 red.
- End: `git status` = exactly the 12 grants `M`; frozen tree list rc 0; root-files list rc 0; protected files `git diff --quiet HEAD` rc 0.
- Browser self-check (optional §4.5): see §6.
- Not run by A (speed rule): full suite, `verify`, build, e2e smoke — gate rows.

## 4. Doc 177 (new line numbers for AN-REVIEW-228)
- l.4: `**სტატუსი:** Completed (C round 228 PASS)`.
- The old l.74 is now **l.103** (`SC1–SC5`); the old l.109 is now **l.160** (`SC1–SC5, ST-K1, NS5 და SS1–SS10`).
- `track-layout.test.tsx` is in the changed-files list (round 227 entry).
- l.154 still contains the string "SC1–SC3" on purpose: it is the C-R227-02 Problem text describing the old state.
- Ids cited and grepped: SC1–SC5, ST6, ST8, ST10, ST17, ST-K1, NS1, NS2, NS5, SS1–SS10, WSU1, UC12, D-29z267/279/280, C-R227-01/02, B-R225-BACK-TO-START-KEY.

## 5. Code review (real `code-reviewer` subagent, 12 files; score 8/10; no Critical/High)
- **Medium — the "Ctrl/Cmd" → "Ctrl" wording loses the ⌘ hint for Mac users in the native tooltip** (`strings.ts` Split/Loop titles). **Not changed:** it is B's ruled deviation D-29z279 (§2.4, §3 K3); `aria-keyshortcuts` carries `Meta`. Forwarded to B: the reviewer suggests B consider a static "Ctrl/⌘+L" form in the sheet and the titles together (no SSR risk). Not a regression of this round, so not an L33 STOP.
- Low — doc l.4 "Completed (C round 228 PASS)" written early. **Not changed:** L28 requires the final value (§2.5).
- Low — doc called ST8 a "literal" change. **Fixed:** l.113 now names ST8's `EDIT_FORMATTER_SAMPLES` entries.
- Low — SC5 was one-directional (an extra `Control+K` would pass). **Fixed inside SC5:** every `Control+…`/`Meta+…` combo must have a matching `Ctrl+…` in the row's `keys`. Proven red by a mutant (`loop` aria `Control+L Meta+L Control+K` → SC5 red), restored; shortcuts.test 5/5 green, typecheck rc 0. `expect(checked).toBe(8)` kept deliberately (a new aria row must be acknowledged in the test).
- Low — NS5 compares the hard-coded Z/X `aria-keyshortcuts` against the sheet's display keys. **Not changed:** §2.3 item 4 prescribes exactly this parity. Forwarded to B.
- Low — `deleteRangeHint` still hard-codes "(Delete / Backspace)". **Not changed:** §2.4 keeps it (L4). Forwarded.
- **Architecture notes (proposals for B/root only, nothing extracted):**
  1. `strings.ts` → `shortcuts.ts` load-time dependency: keep; protect with a repo-scan test that `shortcuts.ts` has no imports (a TDZ crash if it ever imports `strings.ts`).
  2. `ariaKeyShortcuts` is a second hand-written field next to `keys`: keep for now; a possible bounded task is a structured key model (modifiers + key) producing both display and aria.
  3. `StudioWorkspace.tsx:2692` uses `findStudioShortcut('shortcuts')?.ariaKeyShortcuts` instead of `studioShortcutAria` (frozen file; proposal only).
- After the fixes: shortcuts (5), strings + navigation-strings-ui (67) green; Biome clean; `changed-end-sha256.txt`, `finished-code-sha256.txt` and `granted-hunks.diff` regenerated; tree and root lists rc 0; `git status` = 12 × `M`, no `??`.

## 6. Browser self-check (optional §4.5; real Chromium, existing server 127.0.0.1:5173, 1280×720)
Script `a-round-228/self-check.mjs`, output `a-round-228/self-check.json`, screenshot `a-round-228/self-check-1280-undo-hover.png`, state `a-browse.json`.
- S0 (fresh): Play `Play (Space)`/`Space`; Back to start `Back to start (Home)`/`Home`; Undo `Undo (Ctrl+Z)`/`Control+Z Meta+Z`; Redo `Redo (Ctrl+Shift+Z)`/`Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y`; Split `Split at the playhead (Ctrl+E)`/`Control+E Meta+E`; Delete `Delete clip — leaves a gap (Delete)`/`Delete Backspace` (aria-label unchanged); Loop `Loop on / off (Ctrl+L)`/`Control+L Meta+L`; Fit = the §2.2 literal, no `aria-keyshortcuts`.
- After Add Marker (button, then Enter in the name editor): Undo title `Undo: Add Marker (Ctrl+Z)`, aria kept, accessible name `Undo: Add Marker`. 0 page errors.
- Hover ≥ 1.5 s on Undo: the native tooltip is **not painted** in headless Chromium (screenshot shows none); the DOM `title` is correct. This is only A's self-check; C-HOVER/C-TITLES remain C's.

## 7. Acceptance status (A's view only; C decides)
A ran only §4 rows. Every §5 row is C's: C-SCOPE, C-UNIT, C-TITLES, C-ARIA, C-PARITY, C-KEYS, C-HOVER, C-ROWS, C-SEARCH, C-BBOX, C-BUDGET, C-OPEN, G228-3, LAB-SMOKE, AN-REVIEW, C-REF. Gate row: full suite/build/verify/e2e.

## 8. Next C checks (suggested order)
1. C-SCOPE-228 with `a-round-228/changed-end-sha256.txt` and `granted-hunks.diff`.
2. C-TITLES-228 / C-ARIA-228 in S0–S4 at both viewports (Undo S3 `Undo: <label> (Ctrl+Z)`; Redo S4 `Redo: <label> (Ctrl+Shift+Z)`).
3. C-PARITY-228 against the open sheet; C-ROWS-228 `fit` chip one line at 1280.
4. Neighbours §6: one Delete → focus on Undo; held Ctrl+L → one announcement; long Undo label still truncates in `w-28`.
5. LAB-SMOKE-228, G228-3, AN-REVIEW-228 (line numbers in §4 above).

## 9. Known gaps
- Meta variants of the keys are not runnable here (Tech Lead manual check on a Mac).
- Native tooltip painting in headless Chromium is uncertain (C-HOVER-228 allows recording that).
