# Round 228: SABA-B-8 CALM-1b — the key in every transport tooltip, a matching `aria-keyshortcuts`, one source (plus C-R227-01, C-R227-02, B-R225-BACK-TO-START-KEY)

**Planned by:** B, at the round 227 → 228 planning, 2026-10-28. **Decisions:** D-29z278…D-29z284.
**Type:** feature stage (CALM-1, stage 2 of 2). Saba decision 1 (policy "SABA-B-8 Calm Studio"): "Every button tooltip shows its key ('Undo (Ctrl+Z)'), with a matching `aria-keyshortcuts`. One source constant feeds both the sheet and the tooltips." Three small items ride along because this round owns their files: C-R227-01 (`shortcuts.ts`), C-R227-02 (doc 177) and B-R225-BACK-TO-START-KEY (`strings.ts`).

**Read first:** `lessons.md` in full (B, A and C). These apply directly:
- L4: one element, one rule (§2.4);
- L8 and L12: no new class pins; tests use the helpers, not literals (§2.3);
- L11, L32 and L33: STOP rules;
- L23: B's pre-check is done (§0.2);
- L26 and L28: the doc cites only existing ids, and its status line is final;
- L31: timeout headroom (§0.3);
- L39: nothing persistent is added (§4);
- L40: testid elements (§0.3).

**Not this round:**
- CALM-2 (copy moves) and CALM-3 (Overview empty state and Ctrl+Alt+O).
- C-R226-04 (playhead focus after a ruler click), ruled in §1.3.
- Any title outside the transport bar. Snap (G), grid (1/2/3), Envelope (A) and the marker buttons (M, Ctrl+←/→) already carry their key in the title and in `aria-keyshortcuts`. C only reads them in C-PARITY-228 (no change).
- The round-227 gate review suggestions; their rulings are in `b-round-227.md` §3.

## 0. Baseline and scope

**Baseline:** HEAD = `d32464ea264e94f7b0aa98c5b64934340c275d33`. Gate 227 has status `published` and pushed it to both remotes.
- At the start, `git status --short` must be **empty**. The round-226/227 carry rule is over: those 10 paths are in `d32464e`.
- If HEAD differs, or any path is dirty at the start: **STOP** (L11).
- One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-227-r228-tree-sha256.txt` holds 1,070 tracked files: every tracked file except the 12 grants and the 4 root files. It gives rc 0 at planning; run it from `store/`. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/lib/auth.ts`, `AuthContext.tsx`, `app/routes/api.studio-token.ts` and `entry.server.tsx`;
- `StudioWorkspace.tsx`, `ArrangementShortcutSheet.tsx`, `ArrangementRuler.tsx`, `ui/Modal.tsx`, `track-layout.test.tsx` and `shortcut-sheet-ui.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-227-r228-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes: `b-round-227-r228-root-files-start-sha256.txt`.

### 0.1 Grants (`b-round-227-r228-grants.txt`; start sha in `b-round-227-r228-granted-start-sha256.txt`; start copies in `b-round-227/granted-start/`)
| # | Path | What may change |
|---|---|---|
| 1 | `app/lib/arrangement/shortcuts.ts` | The `ariaKeyShortcuts` values of 7 rows (§2.1). The `fit` second key (§2.2). Two new exports, `studioShortcutTitle` and `studioShortcutAria` (§2.1). Every other row, id, action, key and the order stay byte-identical. |
| 2 | `app/lib/arrangement/strings.ts` | Add the `import { studioShortcutTitle } from './shortcuts';` import. Change exactly the 9 entries of §2.2 and add `undoTitle` and `redoTitle` to `studioEditStrings`. Nothing else. |
| 3 | `app/components/arrangement/ArrangementTransport.tsx` | Undo and Redo `title` come from the new helpers. Add `aria-keyshortcuts` on 7 buttons (§2.1) and the `studioShortcutAria` import. No class, DOM structure, handler or other attribute changes. |
| 4 | `app/lib/arrangement/__tests__/shortcuts.test.ts` | SC4: only the `fit` literal. New case **SC5** (§2.3). SC1–SC3 stay unchanged. |
| 5 | `app/lib/arrangement/__tests__/strings.test.ts` | ST6, ST10 and ST17: only the literals of the changed entries. ST8: add `undoTitle` and `redoTitle` samples to `EDIT_FORMATTER_SAMPLES`. New case **ST-K1** (§2.3). |
| 6 | `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS1 and NS2: only the changed title literals (Back to start, both Split titles, both Loop titles, Fit). New case **NS5** (§2.3). |
| 7–11 | `grid-snap-loop-drop.test.tsx`, `status-announcement-ui.test.tsx`, `markers-ui.test.tsx`, `self-disabling-focus.test.tsx`, `waveform-zoom.test.tsx` (all in `app/lib/arrangement/__tests__/`) | **Ruling R1 (one pattern):** a literal Undo/Redo **title** expectation becomes the helper. `'Undo'` → `studioEditStrings.undoTitle(null)`, `` `Undo: ${X}` `` → `studioEditStrings.undoTitle(X)`, and the same for Redo. `getByTitle('Undo: Add Marker')` → `getByTitle(studioEditStrings.undoTitle('Add Marker'))`. Add the `studioEditStrings` import where it is missing. Nothing else. A hit R1 does not fit is a STOP (L23). |
| 12 | `docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md` | **The whole doc** (L34). This is CALM-1's doc and this round is its stage 2 of 2 (§2.5). |

Nothing else changes, and there is no new file.

### 0.2 B's collision pre-check (L23, done)
- **Scratch:** `/tmp/b228` = `git archive d32464e`.
- **App edits:** B applied exactly §2.1 and §2.2 with `b-round-227/precheck-apply.py`. `tsc` rc 0, and Biome is clean after `--write` (import order only).
- **Sweep:** `npx vitest run app/lib app/components app/hooks app/routes` → **8 files, 23 tests red** (`b-round-227/l23-precheck-1b.txt`):

  | File | Red cases |
  |---|---|
  | grid-snap-loop-drop | SD2, SD6, SD7, SL1, SL2, SL8, SK2, SK4, SL10, DE1, DE4, DE9 |
  | markers-ui | MU1 |
  | navigation-strings-ui | NS1, NS2 |
  | self-disabling-focus | FL5 |
  | shortcuts | SC4 |
  | status-announcement-ui | HK1 |
  | strings | ST6, ST8, ST10, ST17 |
  | waveform-zoom | WZ6 |

  Every one is a title literal or the ST8 formatter list. None is a behaviour failure. These are exactly grants 4–11.
- **After the test fixes** (`b-round-227/precheck-tests.py`, test-only): those 8 files plus 5 neighbours (transport-surface-ui, grid-snap-ui, delete-selection-ui, track-layout, shortcut-sheet-ui) → **13 files, 270 tests green** (`l23-precheck-fixed.log`).
- **Reference diff:** `b-round-227/precheck-scratch.diff` (46 hunks over grants 1–11). A may use it. A owns the result, and the new cases of §2.3 are not in it.
- The earlier pre-check (`b-round-225/l23-precheck-1b.txt`, on 80fbb3b) is superseded by this one.
- **`e2e/` and `perf/` (frozen, run by the gate):** `grep -rnE "Ctrl/Cmd|Back to start \(0\)|title=\"Undo|'Undo'|Undo: |Redo: |ruler or the overview|no selection\)|aria-keyshortcuts" e2e perf` finds 0 collisions. Its only hits are 4 clip-title `getByTitle` calls in `perf/*.perf.spec.ts` (clip body, trim and move titles), which this round does not change.

### 0.3 Timeouts and testids (L31, L40)
- **Times in the gate-227 `verify.log`** (whole file, default 5 s per test unless declared):

  | File | Time | Tests |
  |---|---|---|
  | grid-snap-loop-drop | 7.0 s | 36 |
  | status-announcement-ui | 5.9 s | 33 |
  | markers-ui | 5.2 s | 25 |
  | navigation-strings-ui | 3.1 s | 5 |
  | waveform-zoom | 2.8 s | 9 |

  No single test is near its limit; A reports per-test times as usual (L32). NS5 is one more workspace render in navigation-strings-ui: if any NS case exceeds 50 % of its timeout, STOP.
- **L40:** the round changes no `data-testid` element's classes or structure. It only adds `aria-keyshortcuts` and changes `title`. A still greps `arrangement-zoom-range|arrangement-zoom-back|arrangement-fit|arrangement-follow` and the transport titles in `app/**/__tests__`, and adds every hit file to the covering set.

## 1. Why

### 1.1 Saba's decision and what is left of it
- CALM-1a (rounds 226–227, published `d32464e`) did the sheet, `?`, the footer button and the line removal.
- What remains is the tooltip half:
  - Undo and Redo titles name **no key**.
  - "Back to start (0)" names a key that **does not exist**; the binding is Home (SW l.2025). This is B-R225-BACK-TO-START-KEY.
  - Split and Loop say "Ctrl/Cmd+E" and "Ctrl/Cmd+L", while the sheet says "Ctrl+E" and "Ctrl+L". These are two sources that have already drifted.
  - **No** transport button except Z and X has `aria-keyshortcuts` (`grep` at planning: only Z, X, G, A, the 1/2/3 grid menu, M, Ctrl+←/→, the marker flag and `?`).

### 1.2 The two Lows this round owns
- **C-R227-01 (Low, copy):** "Double-click the ruler (no selection)" is imprecise. With a clip selected and no time selection, the ruler double-click still fits (C round 227, probe d). Fix: `(no time selection)`. Fit's own title says the same thing (L4: one fact, one wording; §2.2).
- **C-R227-02 (Low, doc):** doc 177 l.74 and l.109 still say "SC1–SC3", and its changed-files list omits `track-layout.test.tsx`. Fix in §2.5.

### 1.3 Rulings carried from round 227 (L10)
- **C-R226-04 (playhead focus): stays in `deferred_low_polish` (D-29z282).** D-29z275 set two conditions: `StudioWorkspace.tsx` is granted anyway, and a Live reference supports the fix. The first one fails: this round needs no SW change. The fix is a focus-behaviour change in two frozen files; adding it to a title round would break "one feature stage per round". It stays for the polish pass. B searched for no Live reference, because the precondition already failed. Its candidacy moves to "polish pass".
- **A round-227 deviation D1** (`row.children` length 2 in the track-layout case): **kept (D-29z283).** MU-4 showed its value, and it contains no class token. The cost is recorded: CALM-2 and CALM-3 must put `track-layout.test.tsx` into their L23 pre-check and covering set when they touch the footer row's direct children.

## 2. Changes

### 2.1 One source: `shortcuts.ts`
**New exports** (exact behaviour; names are fixed because tests import them):
```ts
export function studioShortcutTitle(label: string, id: StudioShortcutId): string;
// `${label} (${keys[0]})` for the row with that id; `label` if the row is missing.
export function studioShortcutAria(id: StudioShortcutId): string | undefined;
// The row's ariaKeyShortcuts, or undefined.
```

**Format rule (D-29z279):**
- The title shows the row's **first** key, as in Saba's examples "Undo (Ctrl+Z)" and "Redo (Ctrl+Shift+Z)".
- `aria-keyshortcuts` lists **every** key that works.
- **Why:** a tooltip is read at a glance, while `aria-keyshortcuts` is the full machine-readable list. The sheet shows every key.

**`ariaKeyShortcuts` values (D-29z280).** Syntax per WAI-ARIA: a space-separated list; within each combination, the modifiers come first, joined with `+`. MDN `aria-keyshortcuts` gives "Meta (Command key on Mac)" and the example `Meta+C Meta+Shift+C`. The workspace handler accepts `ctrlKey || metaKey` (SW l.1798), so both are listed.

| Row id | Button | `ariaKeyShortcuts` |
|---|---|---|
| `play-stop` | Play / Pause | `Space` |
| `back-to-start` | Back to start | `Home` |
| `loop` | Loop | `Control+L Meta+L` |
| `undo` | Undo | `Control+Z Meta+Z` |
| `redo` | Redo | `Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y` |
| `split` | Split | `Control+E Meta+E` |
| `delete` | Delete | `Delete Backspace` |

- **The `shortcuts` row keeps `Shift+/`.**
- **The Z and X buttons:** their hard-coded `aria-keyshortcuts="Z"` / `"X"` and their titles "(Z)"/"(X)" stay. `zoom-range` is one sheet row with two keys for two buttons. NS5 proves that both equal that row's keys (one-source parity by test, not by refactor).
- **Fit** has no single key, so it gets no `aria-keyshortcuts`.

### 2.2 `strings.ts`: the 9 entries plus 2 helpers (exact results, measured on the scratch)
| Entry | Before | After (the value it evaluates to) |
|---|---|---|
| `studioEditStrings.splitRangeTitle` | `…time selection (Ctrl/Cmd+E)` | `studioShortcutTitle('Split at both edges of the time selection', 'split')` → `Split at both edges of the time selection (Ctrl+E)` |
| `studioEditStrings.splitPlayheadTitle` | `Split at the playhead (Ctrl/Cmd+E)` | `Split at the playhead (Ctrl+E)` |
| `studioEditStrings.deleteClipTitle` | `Delete clip — leaves a gap (Delete)` | from the helper; the value is **unchanged** |
| `studioEditStrings.undoTitle` (new) | — | `(label: string \| null) => studioShortcutTitle(label ? \`Undo: ${label}\` : 'Undo', 'undo')` → `Undo (Ctrl+Z)` / `Undo: Add Marker (Ctrl+Z)` |
| `studioEditStrings.redoTitle` (new) | — | the same with `Redo`/`redo` → `Redo (Ctrl+Shift+Z)` / `Redo: Add Marker (Ctrl+Shift+Z)` |
| `studioPlaybackStrings.backToStartTitle` | `Back to start (0)` | `Back to start (Home)` |
| `studioPlaybackStrings.playTitle` / `pauseTitle` | `Play (Space)` / `Pause (Space)` | from the helper; the values are **unchanged** |
| `studioLoopStrings.selectionTitle` | `Loop the time selection (Ctrl/Cmd+L)` | `Loop the time selection (Ctrl+L)` |
| `studioLoopStrings.toggleTitle` | `Loop on / off (Ctrl/Cmd+L)` | `Loop on / off (Ctrl+L)` |
| `studioViewStrings.fitTitle` | `Fit — the entire project is visible (double-click the ruler or the overview)` | the plain literal `Fit — the entire project is visible (double-click the overview, or the ruler with no time selection)` |

`shortcuts.ts` row `fit`: the keys become `['Double-click the overview', 'Double-click the ruler (no time selection)']` (C-R227-01).

**Fit check (L3, measured by B):** on the live `/studio-lab`, B swapped the chip text in the DOM, with no source change (`b-round-227/fit-measure/result.json`). At 1280×720 and 1440×900, the new chip is 304×18 inside the 319 px `li`, with `scrollWidth` = `clientWidth` and 0 overflowing elements in the dialog. The old chip was 269 px, so the new one leaves 15 px of margin.

**Import direction:** `strings.ts` imports from `shortcuts.ts`, never the reverse. `shortcuts.ts` imports nothing today. A checks that there is no cycle: `grep -n "import" app/lib/arrangement/shortcuts.ts` returns 0 lines.

### 2.3 Tests: the new cases
- **SC5 (`shortcuts.test.ts`):**
  - `studioShortcutTitle('Undo', 'undo')` = `Undo (Ctrl+Z)`.
  - `studioShortcutTitle('Redo: X', 'redo')` = `Redo: X (Ctrl+Shift+Z)`.
  - `studioShortcutAria` returns exactly the §2.1 table for the 7 ids, and `Shift+/` for `shortcuts`.
  - Every non-empty `ariaKeyShortcuts` in the source matches the grammar `^((Control|Meta|Shift|Alt)\+)*[^\s+]+( ((Control|Meta|Shift|Alt)\+)*[^\s+]+)*$`.
  - For every row with an `ariaKeyShortcuts` whose `keys[i]` starts with `Ctrl+`, the value contains both `Control+<rest>` and `Meta+<rest>`.
- **ST-K1 (`strings.test.ts`):** exact literals for `undoTitle(null)`, `undoTitle('Add Marker')`, `redoTitle(null)` and `redoTitle('Add Marker')`, as in §2.2.
- **NS5 (`navigation-strings-ui.test.tsx`)**, real `StudioWorkspace`:
  1. With no selection and an empty history: Play, Back to start, Undo, Redo, Split, Delete and Loop each have `aria-keyshortcuts` = `studioShortcutAria(<id>)` (7 equalities).
  2. Each title ends with ` (${findStudioShortcut(<id>)?.keys[0]})`. The Undo title equals `studioEditStrings.undoTitle(null)`.
  3. After one edit (for example, add a marker), the Undo title = `undoTitle(<label>)`, and it keeps the `aria-keyshortcuts`.
  4. The Z button's `aria-keyshortcuts` = `findStudioShortcut('zoom-range')?.keys[0]`, and X's = `keys[1]`.
  5. The Fit button has no `aria-keyshortcuts` attribute.

  Find the elements by role and name or by an existing `data-testid` (L12).
- **No `any`, no `as`, no `@ts-ignore`.** Narrow with `if (!x) throw new Error(...)`.

### 2.4 One element, one rule (L4)
- The Delete button keeps its `aria-label` and its range-state title (`deleteRangeHint` / `deleteRangeAllTracksHint`, which already name "Delete / Backspace"). Only `aria-keyshortcuts` is added.
- The Undo and Redo visible text (`Undo: <label>` in the `w-28 truncate` span) is **unchanged**. Only the `title` gains the key, so the accessible name (from the content) is unchanged.
- **Deviation from Live (recorded, §3):** "Ctrl/Cmd" becomes "Ctrl" in the titles. That matches the sheet, whose subline says "Ctrl means ⌘ on Mac". The `aria-keyshortcuts` carries `Meta` for assistive tech.

### 2.5 Doc 177 (the whole doc is granted)
- l.4, exactly: `**სტატუსი:** Completed (C round 228 PASS)` (L28: the last stage of CALM-1).
- Update the title line and „კონტექსტი“ to name CALM-1a and CALM-1b.
- „მიდგომა“: one section for CALM-1b, covering the one source, the format rule (first key / all keys) and the "Ctrl/Cmd → Ctrl" deviation.
- „შეცვლილი ფაილები“: add `track-layout.test.tsx` (round 227) and the round-228 files.
- l.74 and l.109: list SC1–SC5, ST-K1, NS5 and SS1–SS10 (C-R227-02).
- „პრობლემები და გადაწყვეტები“: add B-R225-BACK-TO-START-KEY and C-R227-01.
- Cite only ids that exist (L26). Georgian, with English technical terms.

## 3. Reference: how Ableton Live 12 does it
Sources checked 2026-10-28:
- Live 12 manual 2.2.2 "Info View": https://www.ableton.com/en/live-manual/12/first-steps/ (fetched).
- ch. 42 "Live Keyboard Shortcuts": https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/ (round 226 R1–R5).
- MDN `aria-keyshortcuts`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts (fetched).

| # | Behaviour | Source | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|---|
| K1 | Where a user learns a button's key | 2.2.2: "The Info View displays the name and function of whatever element of the UI that you hover over"; toggled with `?` | Hover help is a panel. The fetched section says nothing about keys shown on hover or tooltips. | **Deviation (Saba decision 1):** CZABA has no Info View, so hover help is the native `title` tooltip, and it carries the key. **Better than Live:** the key is right where the pointer is, with no panel to open. | C-TITLES-228 |
| K2 | The key names | ch. 42 (round-226 R5: 42.5 Undo Ctrl+Z, Redo Ctrl+Y / Cmd+Shift+Z; 42.16 Split Ctrl+E; 42.20 Home, Space) | Live's keys | The titles show CZABA's working keys, read from the sheet source. Redo shows `Ctrl+Shift+Z` first (Saba's example); `Ctrl+Y` stays in `aria-keyshortcuts` and in the sheet. | C-PARITY-228 |
| K3 | Mac modifier | ch. 42 Mac column (round-226 R4) | Two columns | **Deviation (D-29z279):** the title says "Ctrl", as the sheet does; `aria-keyshortcuts` lists `Meta` as well. The old "Ctrl/Cmd" wording is dropped so the title and the sheet cannot drift apart again. | C-TITLES-228, C-ARIA-228 |
| K4 | `aria-keyshortcuts` syntax | MDN: space-separated combinations, modifiers first, `Meta` = Command, e.g. `Meta+C Meta+Shift+C` | Web platform, not Live | It follows that syntax, with both platforms listed. | C-ARIA-228 |

No Live claim is made about Undo/Redo tooltips. Live shows no button tooltips in the fetched text, so "Live shows the key in a tooltip" is **not** stated anywhere.

**Screen budget (L39):** nothing persistent is added. A tooltip shows only on hover; `aria-keyshortcuts` is invisible. C counts the persistent text lines outside the timeline (C-BUDGET-228): they must equal round 227.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start:**
   - HEAD is `d32464e`;
   - `git status --short` is empty;
   - `sha256sum -c` gives rc 0 for the tree, granted-start and root-files lists.
2. `npm run typecheck` rc 0. `npm run lint` rc 0, with no new warnings in the granted files. `npx biome check` on the 11 granted code and test paths is clean.
3. **Covering set:** `npx vitest run` on:
   - the 8 pre-check files;
   - transport-surface-ui, grid-snap-ui, delete-selection-ui, shortcut-sheet-ui, track-layout and workspace-strings-ui;
   - every extra hit of A's grep: `grep -rlnE "Undo: |Redo: |'Undo'|'Redo'|Ctrl/Cmd|Back to start|ruler or the overview|no selection\)|arrangement-zoom-range|arrangement-zoom-back|arrangement-fit|aria-keyshortcuts|keyshortcuts" app --include=*.test.*`.

   Everything must be green. Report the per-test times, with any test above 50 % at the top (L32).
4. **Mutants** (restore each one and verify its sha):
   - **MU-1:** `studioShortcutTitle` returns `label`. NS1, NS5 and SC5 must go red.
   - **MU-2:** delete the `undo` row's `ariaKeyShortcuts`. SC5 and NS5 must go red.
   - **MU-3:** revert the `fit` key to `(no selection)`. SC4 must go red.
   - **MU-4:** remove `aria-keyshortcuts` from the Split button. NS5 must go red.
   - **MU-5:** set the `loop` aria to `Control+L` only. SC5 must go red (the Meta pair).
5. **Optional, short browser self-check** at 1280×720: hover Undo after one edit; the title ends "(Ctrl+Z)".
6. **code-reviewer:** run it (12 files). Forward its Architecture notes.
7. **End:**
   - `git status` shows exactly the changed grants, all `M`, and no `??`;
   - the frozen and root lists give rc 0;
   - write `a-round-228/changed-end-sha256.txt` and `a-round-228/granted-hunks.diff` (diff against `b-round-227/granted-start/`).

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720)
States:
- **S0:** fresh anonymous empty demo.
- **S1:** one clip added and selected.
- **S2:** S1 plus a one-track time selection.
- **S3:** after one edit (for example, Add Marker), so Undo is enabled.
- **S4:** after Undo, so Redo is enabled.

| Row | What | Pass |
|---|---|---|
| C-SCOPE-228 | HEAD, `git status`, the hash lists, the hunks | HEAD is `d32464e`. Only granted paths are changed, all `M`, with no `??`. The frozen and root lists give rc 0. A's `changed-end-sha256.txt` gives rc 0. The protected files show `git diff --quiet HEAD` rc 0. **Hunk scope:** `diff -u b-round-227/granted-start/<path> store/<path>` shows only what §0.1 permits. In grants 7–11, every changed line is an R1 swap, an import, or Biome's line wrapping of such a swap (compare with `b-round-227/precheck-scratch.diff`). |
| C-UNIT-228 | `npx vitest run` on shortcuts, strings, navigation-strings-ui and grid-snap-loop-drop | Green. SC5, ST-K1 and NS5 exist. `grep -c "Ctrl/Cmd" app/lib/arrangement/strings.ts` is 3: only the two `soloLabel` formatters and `soloTitle` (l.648, 649 and 678 at HEAD; not in the grant scope). |
| C-TITLES-228 | The `title` of every transport button, byte-exact, in each state | Play `Play (Space)`; while playing, `Pause (Space)`. Back to start `Back to start (Home)`. Undo: S0 `Undo (Ctrl+Z)`, S3 `Undo: <label> (Ctrl+Z)`. Redo: S0 `Redo (Ctrl+Shift+Z)`, S4 `Redo: <label> (Ctrl+Shift+Z)`. Split: S1 `Split at the playhead (Ctrl+E)`, S2 `Split at both edges of the time selection (Ctrl+E)`. Delete: S1 `Delete clip — leaves a gap (Delete)`; S2 unchanged from round 227. Loop: S0 `Loop on / off (Ctrl+L)`, S2 `Loop the time selection (Ctrl+L)`. Z, X and Follow unchanged from round 227. Fit: the §2.2 literal. Both viewports. |
| C-ARIA-228 | `aria-keyshortcuts` in the DOM | The 7 values of the §2.1 table, exactly, in S0 and S3. Z = `Z`, X = `X`, footer button = `Shift+/`. Fit and Follow have none. Accessible names are unchanged from round 227 (Play/Pause, Back to start, Undo/Redo visible text, Delete aria-label). |
| C-PARITY-228 | One source, checked programmatically, in S0, S1 and S3 (no time selection: the range-state Delete title `(Delete / Backspace). Cut Time…` is covered by C-TITLES, not here) | For each of the 7 buttons plus Z and X, the key inside the title's last `( … )` is a key that the open sheet shows in that row (the sheet DOM, row `data-*`/text). 0 mismatches. Also read the titles of Snap (G), Envelope (A), Add Marker (M) and previous/next marker (Ctrl+←/→): each names a key that its sheet row shows. These are listed, not changed; a mismatch is reported as a Low for B. |
| C-KEYS-228 | The advertised keys really work (one press each, S3 at 1440, plus Home and Space at 1280) | Home → playhead 0. Space → plays, then stops. Ctrl+Z → undo. Ctrl+Shift+Z → redo. Ctrl+Y → redo. Ctrl+E on S1 → split. Delete on S1 → delete, gap remains. Ctrl+L on S2 → loop on. Each row is one before/after measurement. Meta variants are a Tech Lead manual check on a Mac (not runnable here; listed, not claimed). |
| C-HOVER-228 | Real tooltip | Real-mouse hover on Undo in S3 for ≥ 1.5 s. A screenshot at both viewports shows the native tooltip, if headless Chromium paints it. If it does not, C records "native tooltip not painted headless" and C-TITLES stands. That alone is not a FAIL. |
| C-ROWS-228 | The sheet against `tasks/round-226.md` §3.1, with the two round-227 rows and the new `fit` key | 43/43 rows, 0 mismatches, 0 extra, both viewports. `fit` row = `Double-click the overview`, `Double-click the ruler (no time selection)`. Each chip is one line (h ≤ 18) with `scrollWidth` = `clientWidth` at 1280 (L3). |
| C-SEARCH-228 | Search | `time selection` → includes `fit`. `ruler`, `menu`, `split`, `cut`, `zzzz` and `ctrl+e` give the round-227 results. |
| C-BBOX-228 | `c-round-226/bbox-after.mjs` against `c-round-227/bbox-after.json` (C's round-227 capture) | 0 deltas over 1 px in all 4 states (titles do not lay out). The Undo/Redo `w-28` boxes are unchanged. |
| C-BUDGET-228 | L39 | The persistent text lines outside the timeline at S0 and S1 equal round 227, at both viewports. |
| C-OPEN-228 | Neighbour | `?` opens the sheet and Esc closes it, with focus back on the opener. A footer click opens it. |
| G228-3 | Auth guard | `/studio/middle-east` → "Sign in required", 0 `audio`. `/api/studio-token` with no header → 401. A fresh `/studio-lab` shows the demo badge, and `auth_user` is null. |
| LAB-SMOKE-228 | Add a clip, then Export WAV | 24-bit, 48 kHz, stereo. The RMS segments are identical to round 227. 0 page errors. |
| AN-REVIEW-228 | Doc 177 | l.4 is byte-exact (§2.5). l.74 and l.109 list SC1–SC5. The changed-files list includes `track-layout.test.tsx`. Every cited id exists. |
| C-REF-228 | §3 K1–K4 | Each one is a match or a listed deviation. Any other difference is a bug (Medium if the user must learn it, else Low). |
| gate | full suite, build, lint, `verify`, e2e smoke | Not claimed by C. |

## 6. Neighbouring behaviour that could break (C probes these first)
- The Undo and Redo focus hand-off (FL rows): the titles changed, but the handlers did not. One Delete → focus on Undo.
- The held-key guards (HK1): one held Ctrl+L gives one announcement.
- Undo with a long label at 1280: the visible text still truncates in `w-28`, with no width change (C-BBOX).
- The `?` sheet's Space keyup workaround: untouched (frozen SW).

## 7. Outcomes for B's next planning
- **C PASS and gate PASS:** CALM-1b is done, so CALM-1 is done. DUX-R-2 closes (REVIEW-RECOMMENDATIONS). B-R225-BACK-TO-START-KEY, C-R227-01 and C-R227-02 close. Next comes CALM-2. If the planning date is on or after 2026-10-30, REGRESSION goes first. RETRO is at round 230.
- **C FAIL:** a fix-up on the same grants.
- **Gate fail:** B re-runs L23 against the actual tree and grants the fix precisely.
