# Round 241: SABA-B-11b stage 2a — the grid menu gets Adaptive grid / Fixed grid groups with one check mark, and plain `4` toggles Snap

**Planned by:** B, at the round 240 → 241 planning, 2026-10-29. **Decisions:** D-29z367…D-29z374.

**Type:** feature stage. This is stage 2 of 3 of SABA-B-11b (Saba-approved 2026-10-28; `transport-grid-review.md` §4.3 "11b").
- Round 240 passed C (`c-round-240.json`: 13 rows passed, `browserVerified: true`, `realVerified: true`).
- Gate 240 published `04c2a5b` on both remotes. The gate reviewer found no Critical, High or Medium issue (two Lows, §1).
- **Stage split (D-29z368).** The old "stage 2" is split in two:
  - **2a (this round):** the menu, `4`, and GATE239-S4;
  - **2b (next):** no snap on an invisible grid. It touches every snap consumer and needs its own Alt ruling.

  Doc 186 becomes "stage k of 3". ABL-R-8 closes at the 2b PASS.

**Regression and RETRO:**
- The regression round is not due. `regression-last.json` = 2026-10-27, so it is due on or after 2026-10-30, and today is 2026-10-29.
- RETRO is not due; the next one is RETRO 245.

**Read first:** `lessons.md` in full. Directly relevant:
- L23: B's pre-check (done, §0.2);
- L29: recipes B ran in Chromium (§0.3);
- L31: timeouts;
- L12 and L40: no class selectors; the menu has a `data-testid` and every test that greps it is in the covering set;
- L26 and L28: doc 186;
- L39: no new persistent text;
- L43 and L44: the Saba questions in §3;
- L47: focus target on menu open and close;
- L49: the new menu branch bypasses `stepGridDivision`/`toggleGridMode`; its side effects are ruled in §2.2.

**Not this round:**
- **SABA-B-11b stage 2b, next round** (unless the regression round is due at that planning). Snap never lands on an invisible grid: fixed mode below 6 px, and the adaptive family ends. That includes the Alt path of `resolveSnapStep` and the `titleLinesHidden` text "Snap still works". It closes ABL-R-8.
- SABA-B-10a/10b/9/11c.
- SABA-B-7 (`awaiting_user`).
- GATE239-S5 (the title helper; the select title is not rewritten in this round) and every other deferred Low.
- The purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 is `deferred_user`).

## 0. Baseline and scope

**Start state:** clean tree.
- HEAD = `04c2a5b4517c70fa2a040fd845c6f257fab24d33` (gate 240 `published`).
- `git status --short --untracked-files=all` is empty (`b-round-240/git-status-at-planning.txt`, `b-round-240/head-at-planning.txt`).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Re-hash those and continue.

**Frozen:** `b-round-240-r241-tree-sha256.txt`, **1,090** files. That is every tracked file (1,108) except the 14 grants and the 4 root files.
- At planning, `sha256sum -c --quiet` from `store/` gives rc 0.
- Each protected auth and purchase file is in the list exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen:
  - `grid.ts` (`resolveSnapStep`: stage 2b) and `ArrangementContext.tsx`;
  - `shortcuts.test.ts`, `grid-adaptive.test.ts`, `tempo-seed-ui.test.tsx` and every other grid, tempo or menu test not in the grants;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-240-r241-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). The start hashes are in `b-round-240-r241-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-240-r241-grants.txt`; start hashes in `b-round-240-r241-grants-start-sha256.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementGridMenu.tsx` | <ul><li>New props `gridMode`, `adaptiveDensity` and `onChooseAdaptiveDensity`.</li><li>Two `<fieldset>` groups with a `<legend>`: "Adaptive grid" (5 `menuitemradio`, Widest…Narrowest) and "Fixed grid" (the existing division radios and their family `<hr>`).</li><li>One check mark across both groups (§2.1).</li><li>The index math: `widthCount`, `snapIndex`, `tripletIndex`, and `checkedIndex` with an explicit fallback to 0 when no division matches.</li><li>`chooseGridMenuItem` routes widths, divisions, Snap and Triplets.</li><li>One new class constant for the legend (`px-2 pt-1 pb-0.5 text-xs text-muted`).</li></ul>Nothing else: the dismiss, swallow, position, Escape/Tab and focus-return code stays as it is. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | <ul><li>New `chooseGridMenuAdaptiveDensity` callback (§2.2).</li><li>The 3 new menu props at the `<ArrangementGridMenu>` mount.</li><li>`Digit4` → `toggleSnap()` in the window handler (right before `Digit5`; no Alt/Shift; repeat ignored) and in the division `<select>` `onKeyDown` list and branch.</li><li>Select `aria-keyshortcuts` `'1 2 4 5'` / `'1 2 3 4 5'`; Snap toggle `aria-keyshortcuts="G 4"`.</li><li>The import of `GRID_ADAPTIVE_WIDTH_OPTIONS`.</li></ul>No other line changes: not `stepGridDivision`, `toggleGridMode`, `changeGridDivision`, `toggleSnap`, the seed effect, the select `title` or any snap consumer. |
| 3 | `app/lib/arrangement/grid-divisions.ts` | Append only: `interface GridAdaptiveWidthOption` and `GRID_ADAPTIVE_WIDTH_OPTIONS` (density 2 … −2 → Widest … Narrowest, labels from `studioGridStrings`). |
| 4 | `app/lib/arrangement/strings.ts` | `studioGridStrings` gains exactly 8 properties: `menuAdaptiveGroup` `'Adaptive grid'`, `menuFixedGroup` `'Fixed grid'`, `widthWidest` `'Widest'`, `widthWide` `'Wide'`, `widthMedium` `'Medium'`, `widthNarrow` `'Narrow'`, `widthNarrowest` `'Narrowest'`, and `adaptiveWidthOn(width, label)` → `` `Adaptive grid — ${width}, now ${label}` ``. |
| 5 | `app/lib/arrangement/shortcuts.ts` | The `snap` row: `keys: ['G']` → `keys: ['G', '4']`. |
| 6 | `app/lib/arrangement/__tests__/grid-adaptive-ui.test.tsx` | <ul><li>New rows GAU18–GAU23 and their helpers (`gridMenu`, `openGridMenu`, `menuGroupRadios`, `checkedRadioNames`).</li><li>`within` is added to the import, and `'4'` to the `pressKey` digit type.</li><li>GAU1: aria `'1 2 5'` → `'1 2 4 5'`.</li><li>GAU14: `34.359738368` → the named `ZOOM_TEN_STEPS_OUT_FROM_320` (GATE240-S2).</li></ul> |
| 7 | `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | Expected values and query scope only (§2.5). One helper is added: `fixedGridRadios`. |
| 8 | `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | l.316 aria `'1 2 5'` → `'1 2 4 5'`. |
| 9 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | Expected values and query scope only in GM1, GM7 and GM30 (§2.5), plus the `fixedGridRadios` helper. |
| 10 | `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | l.224 Snap toggle aria `'G'` → `'G 4'`. |
| 11 | `app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx` | Expected values and query scope only in TU1, TU2 and TU7 (§2.5), plus the `fixedGridRadios` helper. |
| 12 | `app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx` | DXL8: `expectCount(GRID_MENU_PATH, 'justify-center text-foreground', 3)` → `4`. The check-mark span recipe now appears once more (width items). |
| 13 | `app/lib/arrangement/__tests__/strings.test.ts` | Additions only: <ul><li>`EXPECTED_GRID_PLAIN_STRINGS` gains the 7 plain strings;</li><li>`EXPECTED_GRID_KEYS` gains the 8 keys (sorted);</li><li>`GRID_FORMATTER_SAMPLES` gains `adaptiveWidthOn`.</li></ul> |
| 14 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | <ul><li>l.4 exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 241 PASS)` (L28; the split is D-29z368).</li><li>`## მიდგომა`: one paragraph each on the menu groups and the single check (D-29z369), `4` (D-29z370) and the GATE239-S4 ruling.</li><li>`## შეცვლილი ფაილები`: the stage-2a files; l.128 `GAU1–GAU13` → `GAU1–GAU23` (C-R240-01).</li><li>`## პრობლემები და გადაწყვეტები`: GATE239-S4, the GM1/GU9 contract change (D-29z369) and GATE240-S2.</li><li>`## ტესტირება`: GAU18–GAU23 and the 5 mutants.</li><li>`## TODO`: stage 2b with the facts in §7.</li></ul>No other section changes. |

- **The applied diff:** grants 1–13 are exactly `b-round-240/precheck-scratch.diff` (822 lines). `git apply --check -p1` on the store tree gives rc 0. **A may apply it as is**, then write grant 14.
- **No removed assertion anywhere.** In grants 6–11, every changed `expect(` line still asserts the same element, with a new expected value or a narrower query. Counted on the diff (`-` → `+` `expect(` lines): GAU file 1 → 46, musical 3 → 4, snap-keys 1 → 1, snap-menu 3 → 4, snap-ui 1 → 1, triplet 5 → 5, label-status 0 → 0 (one number changed inside a call), strings 0 → 0. A diff in these grants that drops an `expect` without a replacement is a Medium bug.
- **Read before editing:**
  - `FORWARDREF_COMPONENT.md` (the menu component changes);
  - `AGENT_DISCOVERABLE_CODE.md` (2 new exports: `GridAdaptiveWidthOption`, `GRID_ADAPTIVE_WIDTH_OPTIONS`);
  - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (the legend class uses existing tokens only; no colour added);
  - `AUDIO_ARCHITECTURE.md` (Studio; no audio change);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` (doc 186);
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B worked on a copy of HEAD in `/tmp/b241-scratch`, outside the repo and the loop folder, with `node_modules` symlinked.
- **Collision scan:**
  - `grep -rlE "arrangement-grid-menu|ArrangementGridMenu|menuitemradio|Grid division|STUDIO_SHORTCUT_GROUPS|shortcut-sheet|ShortcutSheet|aria-keyshortcuts|studioGridStrings|grid-divisions|KeyG|Digit" app --include=*.test.ts --include=*.test.tsx`, plus round 240's 41 files, gives the **covering set** `b-round-240/covering.txt` (**49 files**).
  - `grep -rn "Digit4|'4'"` in the tests finds no test that uses `4` as a "not a grid key" control (the hits are field values, waveform zoom and bar labels).
- **First run with the code change only:** 14 red rows in 8 files:
  - GAU1, GU1, GU9, GK1, GM1, GM7, GM30, GS1, TU1, TU2, TU7, DXL8, ST23, ST25;
  - every one is an aria list, the radio count or checked set, the menu focus on open, a string key list or the DXL8 class count.

  All are granted as 6–13.
- **Final sketch** (code plus grants 6–13, after the advisor's `checkedIndex` fallback fix): **49 files, 780/780 green** (`b-round-240/covering.log`; 774 at HEAD + 6 new rows).
  - `npx tsc --noEmit` rc 0 (`b-round-240/tsc.log`).
  - `npx biome check` on all 13 files is clean (`b-round-240/biome.log`).
- **Red proofs.** These are runs of `grid-adaptive-ui.test.tsx` on the scratch copy (`b-round-240/mutants/*.log`; the script is `mutate.py`):

| Mutant | Change | Red rows |
|---|---|---|
| MU-MENU-FLAG-MISSING | delete `gridHandChosenRef.current = true;` in `chooseGridMenuAdaptiveDensity` | GAU21 |
| MU-MENU-MODE-MISSING | delete the two mode lines | GAU20 |
| MU-MENU-DENSITY-MISSING | delete the two density lines | GAU19, GAU20, GAU21 |
| MU-CHECK-PICK-IN-ADAPTIVE | fixed item `checked = option.id === checkedId` (the round-239 contract) | GAU18, GAU19, GAU20 |
| MU-4-REPEAT | `Digit4` toggles on auto-repeat too | GAU22 |

  HEAD code with the new rows: GAU18–GAU23 are all red. HEAD has no width items and no `4`. The mutant logs predate the advisor's `checkedIndex` fallback fix. The mutated lines are unchanged by it, and A re-runs the mutants.

### 0.3 Recipes, signals, timeouts (L29, L31, L40, L47)
**B ran the recipes in Chromium.** The script is `b-round-240/probe-241.cjs`. It ran against HEAD (`:5173`) and the scratch build (`:5174`) at 1440×900 and 1280×720, with a fresh context per recipe and 0 page errors. Results are in `probe-241-head.json` and `probe-241-scratch.json`, screenshots in `shots-head/` and `shots-scratch/`. The first scratch attempt timed out on a cold Vite start; it is environment-invalid and kept as `probe-241-scratch-attempt1.err`. The scratch run predates the `checkedIndex` fallback fix, which changes no reachable path (the jsdom re-run was green).

| Recipe | HEAD | After |
|---|---|---|
| Right-click an empty lane point at mount | 7 radios, checked `1 s` (adaptive mode), focus `1 s`, no groups | groups "Adaptive grid" (Widest, Wide, Medium, Narrow, Narrowest) and "Fixed grid" (10 s…0.1 s); **checked only `Medium`**, focus `Medium`; menu 144×436 px |
| Click `Narrow` | (no item) | `adaptive 0.5`, status exactly `Adaptive grid — Narrow, now 0.5 s` |
| `4`, then `4` | nothing; Snap toggle aria `G`, select aria `1 2 5` | Snap on, `Snap on — grid 0.5 s (G)`; then off, `Snap off — free movement (G)`; aria `G 4` and `1 2 4 5` |
| `5`, then reopen the menu | — | `fixed 0.5`; checked only `0.5 s` (Fixed grid), focus `0.5 s` |
| Select accessible description (CDP `Accessibility.getFullAXTree`, combobox "Grid division") | — | adaptive: `Grid 1 s · 1 — narrower, 2 — wider · Adaptive: follows zoom — 5 for fixed`; fixed: `… · Fixed at every zoom — 5 for adaptive` |
| Enter on `demo-synth-mix` (120 BPM), then the menu | 13 radios, checked `1/2`, 448 px tall | 18 radios (5 + 13), checked only `Medium`, plus Snap and Triplets; **641 px tall: y 75 → 716 at 1280×720, inside the viewport (79 px spare)**; y 255 → 896 at 1440×900 |

- **The menu recipe.** Find a point inside a `[data-track-id] [data-grid-lines]` lane body whose `document.elementFromPoint` is that body (not a clip), and right-click it. After the seed, the first music-lane point is a clip header, which opens no menu, so use the hit-test.
- **Signals:**
  - `[data-testid="arrangement-grid-menu"]`, which renders only while the menu is open;
  - its `fieldset` groups, named by their legend (`getByRole('group', {name})`);
  - `menuitemradio` `aria-checked`;
  - `[data-testid="arrangement-grid-control"]` with `data-grid-mode`, `data-grid-division` and `data-snap`;
  - `[data-testid="arrangement-snap-toggle"]` `aria-keyshortcuts`;
  - `[data-testid="arrangement-grid-division"]` `aria-keyshortcuts`, and its accessible description;
  - the status `[data-testid="arrangement-status"]`.
- **Focus (L47).**
  - On open, focus goes to the checked item: Medium in adaptive mode, the division in fixed mode.
  - On choose or Escape, focus returns to the element that had it before the menu opened (`closeGridMenu`, unchanged; GM11/GM18).
  - Choosing a width calls `closeGridMenu` exactly like choosing a division.
- **Timeouts (L31).** Gate 240 per-file times:
  - `grid-snap-menu` 11.4 s for 39 tests;
  - `grid-adaptive-ui` 8.4 s for 17;
  - `grid-snap-ui` 6.7 s;
  - `grid-triplet-ui` 6.4 s;
  - `grid-musical-ui` 6.0 s;
  - `grid-snap-keys` 4.2 s;
  - `label-status-colour-ui` 2.7 s;
  - `strings` 0.15 s.

  Each UI file declares 15 s per describe. Only `grid-adaptive-ui` gains rows (now 23). The slowest is GAU6 at 712 ms of 15 s on the scratch copy. No test is near 50 %.

## 1. Why
- **Saba, 2026-10-28** (SABA-B-11, `transport-grid-review.md` §4.3 11b): "კლავიში 5 = Fixed/Adaptive, **4 = Snap (G რჩება alias-ად)** … მენიუში ემატება „Adaptive / Fixed“ და adaptive-ის სიგანეები". Stage 1 (rounds 239–240) built the adaptive model, `5` and `1`/`2`. The menu and `4` remain.
- **GATE239-S4 (Low)**, from gate 239 reviewer #4: the Adaptive/Fixed mode is shown only in the select title (hover) and the transient status, so it is not reliable for screen readers. The ruling is in §2.4.
- **Lows from round 240:**
  - C-R240-01: doc 186 l.128 still says `GAU1–GAU13`. Folded into grant 14 (the doc is granted anyway, L7).
  - GATE240-S2: the magic number in GAU14. Folded into grant 6 (the file is granted anyway).
  - GATE240-S1: `pxPerSecond ≤ 0` gives the density-limit text. It goes to `deferred_low_polish` with the reviewer's repro. It cannot be reached in the browser (zoom is clamped at 0.5 px/s), and this round does not touch `stepGridDivision`.

## 2. Changes

### 2.1 The menu (grant 1; exact code in the pre-check diff)
Order, top to bottom:
1. The group **Adaptive grid**: Widest, Wide, Medium, Narrow, Narrowest (density 2 … −2).
2. `<hr>`.
3. The group **Fixed grid**: the seconds divisions, then `<hr>` and the musical divisions when a BPM exists (unchanged).
4. `<hr>`.
5. Snap (G).
6. Triplets (3), only with a BPM.

The rest of the menu works like this:
- **One check mark across the menu (D-29z369).** In adaptive mode only the width whose density equals the stored `gridDensity` is checked; no fixed item is. In fixed mode only the current division is checked. This replaces the round-239 contract ("the checked item is the current pick", `tasks/round-239.md` §6), and GM1 and GU9 change for exactly that reason (§2.5). The current adaptive pick stays visible in the division select, and in the select's accessible description.
- **Choosing a width** calls `onChooseAdaptiveDensity(density)`. **Choosing a division** works as before: `changeGridDivision`, then fixed. Snap and Triplets are unchanged.
- **Keyboard:** the roving index runs over all items. Home goes to Widest, End to the last checkbox, and the arrows wrap. Enter and Space choose, and auto-repeat is ignored. All unchanged in kind.
- **The legend** is visible text inside a transient menu, so it is not persistent screen text (L39). Its class uses existing tokens only.

### 2.2 `chooseGridMenuAdaptiveDensity` (grant 2) and its side effects (L49)
It bypasses both `stepGridDivision` and `toggleGridMode`. B ruled on each of their side effects:

| Effect | Ruling | Row / mutant |
|---|---|---|
| `gridHandChosenRef = true` | **keep.** An accepted width choice before the seed is a hand choice (D-29z362 rule; same as adaptive `1`/`2`) | GAU21 / MU-MENU-FLAG-MISSING |
| mode → adaptive (ref + state) | **keep**, from fixed too: choosing an adaptive width makes the grid adaptive (Live's menu inference, R10 mirror) | GAU20 / MU-MENU-MODE-MISSING |
| `gridDensity` ← the chosen level (ref + state) | **keep** | GAU19 / MU-MENU-DENSITY-MISSING |
| `toggleGridMode`'s reset of the density to 0 | **drop:** the user chose a level explicitly | GAU20 (Wide = density 1 after fixed) |
| `resolveAdaptiveGrid(current, tempo)` (division and seconds refs) | **keep** | GAU19/GAU20 division rows |
| status | **keep, new text** `Adaptive grid — <Width>, now <label>` (no key suffix: the item has no key) | GAU19/GAU20 exact text |
| the refusal guards of `stepGridDivision` (family end, ±2) | **not applicable:** a menu level is absolute and always valid (−2…2). At a clamped family end the pick can equal the old one; the level is still stored and checked, which is what the menu shows | GAU18–GAU20 |
| `closeGridMenu()` | **keep** (focus returns as for a division) | GAU19 (`gridMenu` null) |

### 2.3 `4` = Snap (grant 2, grant 5; D-29z370)
- `Digit4`, with no Ctrl/Meta/Alt/Shift, outside text fields, with no dialog open, and not on auto-repeat, calls `toggleSnap()`. This is the same guard as `Digit5` in the window handler, and the same guard in the division select's own `onKeyDown`.
- **A silent alias.** The status texts stay byte-exact: `Snap on — grid <label> (G)` and `Snap off — free movement (G)`. The Snap button tooltip keeps `(G)`.
  - Reason: G stays the primary key. These strings are pinned across about 40 tests and every C recipe since round 47.
  - The tooltip `(G)` next to `aria-keyshortcuts="G 4"` is a deliberate mismatch with CALM-1's "tooltip and aria match". It is ruled by D-29z370 and tracked as signal B-R240-SNAP-ARIA-TOOLTIP-MISMATCH.
  - The second key is listed where keys are listed: the `?` sheet row `Snap on / off` shows the two keys `G` and `4`; the Snap toggle has `aria-keyshortcuts="G 4"`; the select has `aria-keyshortcuts` `1 2 4 5` / `1 2 3 4 5`.
- `G` is unchanged.

### 2.4 GATE239-S4 ruling (D-29z369)
The mode is readable without hover in two ways, and no new element is needed:
- **(a) In the menu:** `menuitemradio` items inside the named groups "Adaptive grid" and "Fixed grid", with exactly one checked. The checked item's group is the mode.
- **(b) At rest:** Chromium exposes the select's `title` as its accessible description, because the name comes from `aria-label`. B read it through CDP (§0.3). It contains `Adaptive: follows zoom — 5 for fixed` or `Fixed at every zoom — 5 for adaptive`.
- **Rejected:** an `aria-describedby` to an `sr-only` span. It would replace the title as the description and drop the `1 — narrower, 2 — wider` hint for screen readers, and it adds an element for no gain.

S4 closes on C's rows C-MENU-CHECK-241 and C-S4-AX-241.

### 2.5 Changed frozen-test expectations (grants 7–13), and why
| Test | Old | New | Why |
|---|---|---|---|
| GAU1, GK1, TU1 | aria `1 2 5` | `1 2 4 5` | `4` is a select key |
| TU2 | `1 2 3 5` | `1 2 3 4 5` | same |
| GS1 | Snap toggle aria `G` | `G 4` | same |
| GU1, GM1, TU1, TU7 | `within(menu).getAllByRole('menuitemradio')` count 7/13/12 | `fixedGridRadios(menu)` with the same count | the division radios now sit in the "Fixed grid" group, next to 5 width radios |
| GM1 | fixed `aria-checked` `'true'` for `1 s` (adaptive mode) | all fixed `'false'`; added: `Medium` checked | D-29z369 one check (adaptive mode at mount) |
| GU9 | `hr` count 2; checked `[radios[3]]` (adaptive at 120 BPM) | `hr` 3 (one more between the groups); checked fixed `[]`; added: `Medium` checked | the new separator; D-29z369 |
| GU9 (reopen), TU7 (reopen) | the checked division after a choice (fixed) | unchanged values, query scoped to the Fixed group | a chosen division is fixed, so the old index is still right |
| GM7 | open focus `1 s`; 8 arrows wrap; Home → `10 s`; Home + 4 → `0.5 s` | open focus `Medium`; 13 arrows wrap (5 + 7 + Snap); Home → `Widest`; Home + 9 → `0.5 s` | the new items come first; focus on open = the checked item |
| GM30 | focus `1 s` on open | `Medium` | same |
| DXL8 | `justify-center text-foreground` ×3 | ×4 | the check span recipe is used by the width items too |
| ST23, ST25 | key, plain-string and sample lists | + 8 keys, 7 plain strings, 1 sample | new copy |

### 2.6 New rows (grant 6)
| Row | Case | Expected |
|---|---|---|
| GAU18 | menu at mount | group radios Widest…Narrowest and 10 s…0.1 s; checked names `['Medium']`; focus on Medium |
| GAU19 | click Narrow | menu closed; adaptive `0.5`; status exactly `Adaptive grid — Narrow, now 0.5 s`; reopen: checked `['Narrow']`; Escape; zoom 80 px/s → `0.25` (the stored level follows the zoom) |
| GAU20 | `5` (fixed 1 s), menu | checked `['1 s']`, focus on `1 s`. Click Wide: adaptive `2`, status `Adaptive grid — Wide, now 2 s`, select title ends with the adaptive suffix; reopen: checked `['Wide']` |
| GAU21 | Narrow, then `addSource('stem-90')` | tempo 90; adaptive `0.5` is kept; status ends `Snap on — grid 0.5 s (G)` |
| GAU22 | `4`, a held `4`, `4`, Ctrl+4, Alt+4, `4` in the BPM field | on with `Snap on — grid 1 s (G)`; the held key leaves it on; off with `Snap off — free movement (G)`; the modified and typed keys are not prevented and leave Snap off; toggle aria `G 4` |
| GAU23 | `4` on the focused select | prevented; Snap on; select value `1`; division `1`; adaptive; aria `1 2 4 5` |

### 2.7 Doc 186 (grant 14)
- l.4 byte-exact as in §0.1.
- The 7 TEMPLATE headings stay in order (L26).
- Cite only rows that exist (grep `GAU1[89]|GAU2[0-3]`).
- State D-29z368 (the 3-stage split), D-29z369 and D-29z370, and the §3 reference status (inferred labels).

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- [Live 12 manual 6.10 "Using the Editing Grid"](https://www.ableton.com/en/live-manual/12/arrangement-view/), read by B through WebFetch on 2026-10-29.
- The same text in [Live 11 manual 6.9](https://www.ableton.com/en/live-manual/11/arrangement-view/) (docs-explorer).
- [Isaac Cotec, "Using the grid" (Live 10 course)](https://www.musicgurus.com/courses/create-new-parts-audio-midi-in-ableton-live-online-course-with-isaac-cotec/lessons/the-grid-ableton-live).
- [LinkedIn Learning, Live 10 Essential Training "Configuring the grid"](https://www.linkedin.com/learning/ableton-live-10-essential-training/configuring-the-grid-2).
- The `ableton-arrangement-expert` consult (2026-10-29: UI recollection, unconfirmed for 12).
- `reference/youtube/SABA-B-9-10-11-transcripts.md` (GRGG 0:00, 0:44).

| # | Behaviour | Source | Live (status) | CZABA decision | C check |
|---|---|---|---|---|---|
| M1 | Widths of both adaptive and fixed grid are set "using the context menu" in the track lanes | 6.10 | confirmed | lane right-click menu (exists since SRW-14) | C-MENU-GROUPS-241 |
| M2 | Group names "Adaptive Grid" and "Fixed Grid" | Cotec (Live 10); a Live 11 manual search snippet "Adaptive Grid: Narrow", "Fixed Grid: 1/16" (not opened) | partly confirmed (Live 10/11) | legends "Adaptive grid" and "Fixed grid" (sentence case, the CZABA copy rule) | C-MENU-GROUPS-241 |
| M3 | Adaptive widths Widest, Wide, Medium, Narrow, Narrowest | Widest, Narrowest: Cotec; Narrow: the snippet; Wide, Medium: expert recollection | partly confirmed; Wide and Medium inferred | the 5 labels, mapped onto density 2…−2 | C-MENU-GROUPS-241 |
| M4 | Order coarse → fine; Medium is the default | expert recollection | inference | Widest…Narrowest and 10 s…0.1 s; Medium = density 0 at mount | C-MENU-GROUPS-241 |
| M5 | Which item is checked in adaptive mode | none found | **no reference found** (searched: manual 6.10/6.9, the courses above, WebSearch "Ableton grid context menu Narrowest … Fixed Grid", the docs-explorer run) | one check across the menu = the mode (D-29z369) | C-MENU-CHECK-241 |
| M6 | Submenus or a flat list | expert recollection: two submenus | inference | two flat labelled groups (one click instead of two) → deviation ⚖3 | C-MENU-GROUPS-241 |
| M7 | Ctrl/Cmd+4 "turns grid snapping on or off" | 6.10 | confirmed | **plain `4`** + `G` (deviation ⚖1, the approved form) | C-KEY4-241 |
| M8 | "When the grid is off, the cursor does not snap" | 6.10 | confirmed | Snap off (unchanged); there is no separate "Off" item → ⚖4 | C-KEY4-241 |
| M9 | "Off" as a fixed choice | Cotec mentions "Off"; its menu position is unknown | partly confirmed | not added (Snap and `4` cover it) → ⚖4 | C-REF-241 |
| M10 | Alt (Win) / **Cmd (Mac)** bypasses snap; "if the grid is switched off, the modifier will temporarily enable it" | 6.10 | confirmed | Alt/Option on both platforms (`resolveSnapStep`, unchanged); the temporary enable already exists (Alt with Snap off snaps to `gridSeconds`) → ⚖5 | C-REF-241 (judged from source and the round-239 C-SNAP evidence) |
| M11 | Grid readout lower right | 6.10 | confirmed | unchanged (SABA-Q-11B-READOUT) | — |

**Deviations:**
- **⚖1 plain digits.** Ctrl+1…5 switch Chrome tabs (D-29z24). This is the listing form the policy approves; Saba already has SABA-Q-11B-PLAIN-DIGITS.
- **⚖3 flat groups, not submenus.** It is one click, every option is visible, and the legend names the mode. Inferred structure; non-blocking.
- **⚖4 no "Off" item.** Snap off (`G`/`4`, or the menu checkbox) is CZABA's "grid off". A Live user may look for "Off" next to the widths. New question for Saba: **SABA-Q-11B-MENU-OFF** (L44).
- **⚖5 Mac bypass.** Live uses Cmd. CZABA uses Option, because Cmd+click and Cmd+drag mean other things in the browser and in macOS. New question for Saba: **SABA-Q-11B-MAC-BYPASS** (L44; `transport-grid-review.md` 11b asked B to assess this). It is non-blocking and recorded only: no code changes.
- **The seconds family** has no Live equivalent (Saba decision 3).

**Better than Live (claim to check):**
- The legends name the mode next to the widths, with a single check.
- `4` is listed in the `?` sheet and in `aria-keyshortcuts`.
- The current pick is always in the select and in its accessible description.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. Start-state check (§0): HEAD, a clean status, and `sha256sum -c` on the frozen, root and grant-start lists.
2. Apply `b-round-240/precheck-scratch.diff`, then write grant 14.
3. `npm run typecheck` rc 0. `npx biome check` on grants 1–13 is clean. `npm run lint` rc 0.
4. `npx vitest run $(cat ../tmp/studio-real-loop/b-round-240/covering.txt)`: 49 files, all green (780 expected). Any test above 50 % of its timeout goes at the top of the report (L32).
5. The 5 mutants (§0.2) on a scratch copy outside `store/`. `b-round-240/mutants/mutate.py` paths point at B's scratch; copy it and edit the paths.
6. `code-reviewer` is **required** (14 files). Pass its Architecture note to B.
7. Playwright against `:5173` at both viewports: copy `b-round-240/probe-241.cjs`; do not edit it in place. Expect the "After" column of §0.3.
8. Write `a-round-241.md`: the changed hunks, the tests run with counts, the mutants, the reviewer result, any STOP at the top.

## 5. C: acceptance
Real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48). Open the menu by right-clicking an empty lane point (§0.3 hit-test).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-241 | HEAD, status, hashes | <ul><li>HEAD is `04c2a5b`, and exactly the 14 granted paths are `M`.</li><li>`sha256sum -c` on `b-round-240-r241-tree-sha256.txt` (1,090) and on the root list gives rc 0. The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>Grant 2: every `git diff -U0` hunk is one of the §0.1 items. `stepGridDivision`, `toggleGridMode`, `changeGridDivision`, `toggleSnap` and the select `title` have 0 changed lines.</li><li>Grants 6–11: no removed `expect(` without a replacement on the same element (the §0.1 counts).</li><li>Grants 3, 4 and 13: additions only (0 `-` lines, apart from a Biome reflow inside `studioGridStrings`).</li></ul> |
| C-UNIT-241 | `b-round-240/covering.txt` (49 files) | All green, including GAU1–GAU23. The full suite is a gate row. |
| C-MUT-241 | MU-MENU-FLAG-MISSING and MU-CHECK-PICK-IN-ADAPTIVE, once each, on a scratch copy outside the repo | GAU21 red; GAU18 red. The repo status is identical before and after. |
| C-MENU-GROUPS-241 | The menu at mount; then with the 120 BPM seed (`demo-synth-mix`); then `3` (triplets) | <ul><li>Groups named "Adaptive grid" (Widest, Wide, Medium, Narrow, Narrowest, in that order) and "Fixed grid" (10 s…0.1 s; plus `1 bar`…`1/32`, or the triplet list, with a BPM). Snap (G) and, with a BPM, Triplets (3) follow.</li><li>**The menu box lies inside the viewport** in all three states at both viewports (record the top, the height and 720 − bottom; the reference is 641 px tall with a BPM at 1280×720).</li><li>Screenshots.</li></ul> |
| C-MENU-CHECK-241 | (a) adaptive at mount; (b) after `5`; (c) after choosing `0.25 s`; (d) adaptive after the seed | Exactly **one** `menuitemradio` across the menu has `aria-checked="true"`: (a) Medium; (b) the frozen division; (c) `0.25 s`; (d) Medium. Focus on open is that item (`document.activeElement`, L47). The menu is opened by mouse, so `:focus-visible` may not match; record what C sees as info, not a criterion. The ring is checked on the keyboard path in C-MENU-CHOOSE-241 (c). |
| C-MENU-CHOOSE-241 | (a) click Narrow at 40 px/s; (b) `5`, then click Wide; (c) keyboard: open the menu (focus on Medium), ArrowDown ×2 to Narrowest, Enter; (d) Narrow, then the seed | <ul><li>(a): Tab to the Snap toggle first, then right-click an empty lane point and click Narrow: adaptive `0.5`, exact `Adaptive grid — Narrow, now 0.5 s`; menu closed; `document.activeElement` = the Snap toggle (GM18 shape; never BODY, L47). Then `=` ×3: after each step the division is exactly one family step finer than the Medium pick for that zoom (the finest seconds member whose painted period is ≥ 24 px), or `0.1` when that pick is already the finest; record each division and its painted lane period.</li><li>(b): adaptive `2`, exact `Adaptive grid — Wide, now 2 s`, select title ends with the adaptive suffix.</li><li>(c): after the first ArrowDown the focused item (Narrow) shows a visible ring (`:focus-visible` matches after a key); Enter on Narrowest gives `Adaptive grid — Narrowest, now 0.25 s` at 40 px/s.</li><li>(d): tempo 120, adaptive `0.5` kept, status ends `Snap on — grid 0.5 s (G)`.</li><li>0 page errors.</li></ul> |
| C-KEY4-241 | `4` on the body; a held `4`; Ctrl+4; `4` in the library search, the BPM field, a marker name editor and the `?` sheet search; `4` with Export open; `4` on the focused division select | <ul><li>Body: Snap toggles, with exact statuses `Snap on — grid <label> (G)` / `Snap off — free movement (G)`, as G does.</li><li>Held: one toggle.</li><li>Ctrl+4: the default is not prevented and Snap is unchanged.</li><li>In the fields and the sheet search, the text gets the `4` and Snap is unchanged.</li><li>With Export open, nothing changes.</li><li>On the select: Snap toggles and the select value is unchanged.</li><li>Snap toggle aria `G 4`; select aria `1 2 4 5` (`1 2 3 4 5` with a BPM).</li><li>The `?` sheet row "Snap on / off" shows two keys `G` and `4`, and the sheet search for `4` finds it.</li></ul> |
| C-S4-AX-241 | GATE239-S4 at rest | CDP `Accessibility.getFullAXTree`, combobox named "Grid division": the description contains `Adaptive: follows zoom` in adaptive mode and `Fixed at every zoom` after `5`, at both viewports. |
| C-GRID-REG-241 | Short re-run of C-ADAPT-SEC-239 (mount, then `=` ×6), C-DENSITY-239 (`1` ×3, then `2` ×5) and C-HAND-240 (a) | The same divisions and exact status texts as `c-round-240.md`. Zoom stays silent (the `output[aria-live]` MutationObserver count does not change on a zoom step). |
| C-MENU-REG-241 | Neighbours of the menu | <ul><li>Tab to the Snap toggle, right-click, Escape: the menu closes with no change, and `document.activeElement` = the Snap toggle.</li><li>A division choice while playing keeps playback.</li><li>The dismissing press is swallowed (GM10/GM16 shape: one press outside, then Play works on the next press).</li><li>Right-click on a header keeps the native menu.</li></ul> |
| C-BUDGET-241 | L39 | The persistent text lines outside the timeline match round 240: empty 85/69, demo 101/85 at 1440/1280. The menu is transient and is not counted. |
| C-REF-241 | §3 | Each of M1–M10 is judged twice, against the CZABA requirement and against Live: confirmed / deliberate difference / unconfirmed / n/a. ⚖3–⚖5 are listed. SABA-Q-11B-MENU-OFF and SABA-Q-11B-MAC-BYPASS each appear once as an id in `backlog.json`. |
| AN-REVIEW-241 | Doc 186 | l.4 is byte-exact. The 7 headings are in order. It cites only existing rows (GAU18–GAU23). l.128 says `GAU1–GAU23`. D-29z368/369/370 are stated. |
| LAB-SMOKE-241 | `/studio-lab` | It loads. Space plays and pauses. The export WAV for the untouched demo has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` (rounds 237–240). 0 page errors. |
| Auth | Standing check | In a fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`. `/api/studio-token` with no header returns 401. |
| Purchased origin (browser) | The menu on the purchased copy | BLOCKED: backend unavailable in cloud. Grant 2 adds no origin branch: grep `origin` in the grant-1/2 hunks = 0. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **The menu height** with a BPM at 1280×720 (79 px spare). The menu has no `max-h`/`overflow-y`. A shorter window would overflow, which is recorded as signal B-R240-MENU-HEIGHT and not scheduled. A real overflow at either acceptance viewport is a Medium bug.
- **Keyboard ownership of `4`:** text fields, dialogs, modifiers and the sheet search (C-KEY4-241). The old `5`, `1`, `2` and `3` rows must still pass in the same fields (sample one each).
- **The SRW-14 menu rows** (GM1–GM35 shapes): the dismiss swallow, the focus return, scroll-closes and the right-click during a drag. Only the item count and the checked item changed.
- **Hand-choice rule:** a width chosen before a seed is kept (GAU21). `5` is still not a hand choice (GAU6, unchanged).
- **Snap texts:** any status or tooltip with `(G 4)` or `(4)` is a bug (§2.3).

## 7. Outcomes for B's next planning
- **PASS and gate published:** SABA-B-11b stage 2a is done; GATE239-S4, C-R240-01 and GATE240-S2 close. **Stage 2b** follows, unless the regression round is due at that planning (on or after 2026-10-30), in which case the regression comes first. Known facts for 2b:
  - every `snapSeconds` comes from `StudioWorkspace` (5 sites: `snapEnabled ? gridSeconds : null`);
  - `resolveSnapStep` (`grid.ts` l.67–76) returns `gridSeconds` on Alt independently, so "hidden + Alt" needs its own ruling and rows;
  - `titleLinesHidden` says "Snap still works" and must change;
  - `data-grid-lines` is the signal;
  - **no reference found** for hidden-line snapping in Live (expert + docs-explorer, 2026-10-29);
  - the behaviour (suspend vs. coarsen to the finest visible step) is within the approved 11b text: "snap ხილულ ბიჯზე გადადის ან status-ს წერს". It is a B ruling plus one SABA-Q, not an AGREE blocker.
- **FAIL:** a fix-up on the same grants.
- The architecture checkpoint ARCH-CHECKPOINT-TEMPO-GRID is re-asked after 2b (addendum 6 records the third writer of `gridHandChosenRef`).
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.
