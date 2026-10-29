# Round 239: SABA-B-11b stage 1 — zoom-adaptive grid (default), the 5 key for Adaptive/Fixed, and 1/2 as adaptive density

**Planned by:** B, at the round 238 → 239 planning, 2026-10-29. **Decisions:** D-29z352…D-29z359.

**Type:** feature stage, one stage of SABA-B-11b (Saba-approved 2026-10-28; closes half of ABL-R-8).
- Round 238 passed C, and gate 238 published rounds 237 + 238 as `15a0b41`.
- The regression round is not due: `regression-last.json` = 2026-10-27, so it is due on or after 2026-10-30.
- RETRO is not due; the next one is RETRO 245.

**Read first:** `lessons.md` in full. Directly relevant:
- L23 (B's pre-check, done: §0.2);
- L29 (recipes B ran in Chromium: §0.3);
- L31 (timeouts);
- L12 and L40 (no class selectors; one attribute is added to a testid element, and its tests are in the covering set);
- L26 and L28 (doc 186);
- L39 (no new persistent text);
- L43 and L44 (the Saba questions in §3);
- L45 (the musical unit is already built in 11a).

**Not this round.** These are stage 2 of SABA-B-11b, round 240, unless a Medium+ bug comes first:
- the `4` key as a Snap alias of G;
- the Adaptive / Fixed and density items in the lane grid menu (`ArrangementGridMenu.tsx`);
- "snap never lands on an invisible grid" (hidden lines below 6 px in fixed mode and at the adaptive family ends).

Also not this round:
- SABA-B-10a/10b/9/11c;
- SABA-B-7 (`awaiting_user`);
- the Lows deferred at this planning (GATE238-S1/S2/S3: `b-round-238.md` §3 and `backlog.json` `deferred_low_polish`);
- the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`).

## 0. Baseline and scope

**Start state:** clean tree.
- HEAD = `15a0b412b48740f9211bed344050fa5398130d08` (gate 238 `published`).
- `git status --short --untracked-files=all` is empty (`b-round-238/git-status-at-planning.txt`).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files; re-hash those and continue.

**Frozen:** `b-round-238-r239-tree-sha256.txt`, **1,091** files: every tracked file except the 10 tracked grants and the 4 root files. At planning, `sha256sum -c --quiet` from `store/` gives rc 0. The list includes:
- every protected auth and purchase file, each present once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`;
- the status writers of rounds 234–238, which this round does not touch: `ArrangementContext.tsx`, `status-announcement.ts`, `collection.ts`, `tempo-seed.ts`;
- `ArrangementGridMenu.tsx` (stage 2), `grid.ts`, `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-238-r239-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes are in `b-round-238-r239-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-238-r239-grants.txt`; start hashes of the 10 tracked grants in `b-round-238-r239-grants-start-sha256.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/lib/arrangement/grid-divisions.ts` | Append only, no existing line changes: <ul><li>the type `GridMode`;</li><li>the constants `GRID_ADAPTIVE_MIN_SPACING_PX = 24`, `GRID_ADAPTIVE_DENSITY_MIN = -2` and `GRID_ADAPTIVE_DENSITY_MAX = 2`;</li><li>the pure functions `gridDivisionSecondsOf(id, bpm)` and `adaptiveGridDivisionId(familyMember, bpm, pxPerSecond, density = 0)`;</li><li>one private helper.</li></ul>See §2.1. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | The grid block only (§2.2): <ul><li>`gridMode`/`gridDensity` state and refs;</li><li>`fixedGridDivisionId`, and `gridDivisionId`/`gridSeconds` derived through the chooser;</li><li>`resolveAdaptiveGrid` and `toggleGridMode`;</li><li>`changeGridDivision` sets fixed;</li><li>the adaptive branches of `stepGridDivision` and `toggleGridTriplet`;</li><li>`changeTempo` and the seed effect call `resolveAdaptiveGrid`;</li><li>`Digit5` in the window handler and in the division `<select>` `onKeyDown`;</li><li>`aria-keyshortcuts` `'1 2 5'` / `'1 2 3 5'`;</li><li>the `<select>` title suffix;</li><li>`data-grid-mode` on `arrangement-grid-control`;</li><li>the import lines and dependency arrays these need.</li></ul>Nothing else. |
| 3 | `app/lib/arrangement/strings.ts` | `studioGridStrings` gains exactly 6 properties: `adaptiveOn`, `fixedOn`, `adaptiveNarrowest`, `adaptiveWidest`, `adaptiveTitleSuffix`, `fixedTitleSuffix` (texts in §2.3). No other line changes. |
| 4 | `app/lib/arrangement/shortcuts.ts` | One row in the `grid-snap` group, right after `triplet`: `{ id: 'grid-mode', action: 'Adaptive / fixed grid', keys: ['5'] }`. |
| 5 | `app/lib/arrangement/__tests__/grid-adaptive.test.ts` | **New:** pure rows GA1–GA8 (§2.4). |
| 6 | `app/lib/arrangement/__tests__/grid-adaptive-ui.test.tsx` | **New:** workspace rows GAU1–GAU10 (§2.4). `{ timeout: 15_000 }` per describe. |
| 7 | `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | Expected values only, 3 statements: <ul><li>l.316: aria `'1 2'` → `'1 2 5'`;</li><li>l.317: the title gains `' · Adaptive: follows zoom — 5 for fixed'`;</li><li>l.444: the "other digit" control `'5'/'Digit5'` → `'6'/'Digit6'` (5 is now a grid key; GAU7 covers 5 on the select).</li></ul> |
| 8 | `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | Expected values only, 3 statements: <ul><li>l.229 (GS1, adaptive at mount): the title gains the adaptive suffix;</li><li>l.498 and l.513 (GS10, fixed after choosing 0.1 s): the title gains `' · Fixed at every zoom — 5 for adaptive'`.</li></ul> |
| 9 | `app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx` | Expected values only: <ul><li>l.353: aria `'1 2'` → `'1 2 5'`;</li><li>l.367: aria `'1 2 3'` → `'1 2 3 5'`;</li><li>l.400: the title gains the fixed suffix.</li></ul> |
| 10 | `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | Expected value only: l.353, the title gains the fixed suffix. |
| 11 | `app/lib/arrangement/__tests__/shortcuts.test.ts` | `EXPECTED_ROW_ORDER` gains `'grid-mode'` after `'triplet'`. |
| 12 | `app/lib/arrangement/__tests__/strings.test.ts` | Additions only: <ul><li>`EXPECTED_GRID_KEYS` gains the 6 keys (sorted);</li><li>`EXPECTED_GRID_PLAIN_STRINGS` gains the 2 suffixes;</li><li>`GRID_FORMATTER_SAMPLES` gains one sample for each of the 4 formatters.</li></ul> |
| 13 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | **New** (§2.5). |

- **No removed assertion anywhere.** In grants 7–12, every changed line still asserts the same element with the new expected value. A grant-7–12 diff that drops an `expect` is a Medium bug (policy, SABA-B-10a test rule).
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio);
  - `AGENT_DISCOVERABLE_CODE.md` (5 new exports);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (rows);
  - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (no class change is planned; confirm none);
  - `GEORGIAN_DOCS.md` (doc 186);
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B copied HEAD to `/tmp/b239-scratch` (outside the repo and the loop folder, `node_modules` symlinked).
- **The diff:** the full code change plus grants 7–12 is `b-round-238/precheck-scratch.diff` (534 lines, 10 files). `git apply --check -p1` on the store tree gives rc 0. **A may apply it as is**, then write the 2 new test files and doc 186.
- **Threshold choice, measured.** Each run is the full suite on the scratch (`b-round-238/precheck-runs.json`):
  - v1, 20 px: **83 red tests in 13 files** (`grid-snap-*`, `marker-snap`, `tempo-seed-ui`, `tempo-ui`, …). The seconds pick at the default 40 px/s becomes 0.5 s, and every SRW-14 row pins 1 s.
  - v2, 24 px: **2 red** (the `strings.test.ts` key lists).
  - v4, the final sketch with grants 7–12: **212 files, 3,044/3,044 green**. The slowest is CP12a, 9.96 s of 30 s.
- **Why 24 px is the rule, not a convenience (D-29z357):**
  - 24 CSS px is the WCAG 2.5.8 minimum target size, so every snap cell stays a minimum-size pointer target.
  - It keeps HEAD's 1 s seconds grid at the default zoom, so an empty project looks the same at load.
  - At 40 px/s, no single threshold gives both "seconds 1 s" and "1/4 at 120 BPM": 0.5 s = 1/4 @ 120 = 20 px. B chose the seconds side, because the empty `/studio-lab` is the first view of every visit.
  - Consequence: a 120 BPM seed at 40 px/s now picks **1/2**, not 1/4 (§0.3, D-29z359).
  - Live's own threshold is unpublished, so this goes to Saba as SABA-Q-11B-DENSITY (§3).
- **Static checks on the scratch:** `npx tsc --noEmit` rc 0; `npx biome check` on the 10 changed files is clean.
- **Covering set:** `b-round-238/covering-files.txt`, **39 files**: every test file that mentions the grid control, `data-grid`, `gridSeconds`, `grid-divisions`, `studioGridStrings`, the shortcut table, `Digit<n>`, the Snap toggle or `tempo-seed`. All **655 tests are green** on the final sketch (`b-round-238/precheck-covering.log`). A adds grants 5 and 6 to this set.
- **Collisions found and granted:** 11 red rows in 6 frozen files, all granted as 7–12: aria lists, the title suffix, the sheet id list, the string key lists, and GK11's "5 is not a grid key" control. No other frozen test needs a change.

### 0.3 Recipes, signals, timeouts (L29, L31, L40)
**B ran both recipes in Chromium** on the scratch build (`:5174`) at 1440×900 and 1280×720, with a fresh context and 0 page errors (`b-round-238/probe-scratch-2.json` from `probe.cjs`; `probe-musical-scratch.json` from `probe-musical.cjs`). A cold-start Vite run once gave a hydration error; it was re-run, and that attempt is environment-invalid, kept as evidence.
- **Seconds family (no BPM):**
  - mount: `adaptive 1 s`;
  - `=` ×1–3: 0.5 s; ×4–6: 0.25 s. **The status text did not change once during the zoom.**
  - `5`: `fixed 0.25 s`, status `Fixed grid — 0.25 s at every zoom (5)`;
  - `−` ×3: stays 0.25 s;
  - `5`: `adaptive 0.5 s`, status `Adaptive grid — follows zoom, now 0.5 s (5)`;
  - `1`: `adaptive 0.25 s`, status `Grid: 0.25 s (Snap off)`.
- **Musical family (Enter on `demo-synth-mix`, 120 BPM):**
  - seed: `adaptive 1/2`, `data-grid-seconds` 1, Snap on, `data-bpm` 120; the status ends `… Grid only: audio is not stretched. Snap on — grid 1/2 (G)`;
  - `=` ×1–3: 1/4; ×4–5: 1/8;
  - `3`: `adaptive 1/4T`;
  - `5`: `fixed 1/4T`; `5` again: `adaptive 1/4T`.
- **Signals.** Each renders in every state used here:
  - `[data-testid="arrangement-grid-control"]` with `data-grid-mode` (new), `data-grid-division`, `data-grid-seconds`, `data-grid-lines` and `data-snap`;
  - `[data-testid="arrangement-grid-division"]`: `title`, `aria-keyshortcuts`, `value`;
  - the status `[data-testid="arrangement-status"]`;
  - `[data-testid="arrangement-bars-ruler"]` `data-bpm`;
  - the lane body's `data-grid-seconds`, and its painted period `repeating-linear-gradient(… ${gridPeriodPx}px)` (`ArrangementLane.tsx` l.867). That is the measured line spacing; it renders only while the lines are visible (l.677–681).
- **Zoom:** the keys `=`/`+` and `−` (sheet row `zoom`) and Ctrl+wheel. Each step is ×1.25 (`TIMELINE_STEP_ZOOM_FACTOR`); the default is 40 px/s (`TIMELINE_ZOOM_DEFAULT`).
- **Timeouts (L31):** new rows go into the 2 new files only. Gate 238 per-file times of the granted test files: `grid-snap-ui` 7.3 s (20 tests), `grid-triplet-ui` 6.9 s, `grid-musical-ui` 6.2 s, `grid-snap-keys` 4.2 s. Each declares 15 s per describe. No granted file gains a row.
- **Testids (L40):** `arrangement-grid-control` gains `data-grid-mode`. Every test that greps that testid is in the covering set and green. No class changes.

## 1. Why
- **Saba, 2026-10-28** (SABA-B-11, transport-grid-review §1 row 3): "the selection jumps from line to line".
- **HEAD:** the grid is fixed at any zoom. 1 s at 320 px/s is a 320 px jump, and 0.1 s at Fit is 5 px of invisible lines. ABL-R-8 (approved 2026-10-25) says the same: "far zoom 0.1 s or 1/32 too dense, near 10 s too coarse".
- **Live 12, manual 6.10:** "The grid can be set to be either zoom-adaptive or fixed". Adaptive is Live's default (tutorial GRGG 0:44, Live 11). In adaptive mode the on-screen step stays roughly constant while you zoom.
- **This stage:**
  - makes adaptive the default for both grid families (musical and seconds);
  - adds the `5` toggle;
  - makes `1`/`2` change the adaptive density.

  An explicitly chosen division still gives today's fixed grid. Snap, Alt bypass, edges, markers and every gesture read `gridSeconds` unchanged; only its value now follows zoom.

## 2. Changes

### 2.1 `grid-divisions.ts` (grant 1; exact code in the pre-check diff)
```ts
export type GridMode = 'adaptive' | 'fixed';
export const GRID_ADAPTIVE_MIN_SPACING_PX = 24;
export const GRID_ADAPTIVE_DENSITY_MIN = -2;   // Narrowest
export const GRID_ADAPTIVE_DENSITY_MAX = 2;    // Widest; 0 = Medium (5 levels)
export function gridDivisionSecondsOf(id: string, bpm: number | null): number
export function adaptiveGridDivisionId(familyMember: string, bpm: number | null, pxPerSecond: number, density = 0): string
```
- **Family:** that of `familyMember`: seconds (10 … 0.1 s), straight musical (bar … 1/32) or triplet (1/2T … 1/32T).
- **Base:** the finest member whose `seconds × pxPerSecond ≥ 24 − 1e-6`; if none reaches it, the widest.
- **Result:** `family[clamp(base − density)]`. Positive density means wider.
- **Unknown input:** an unknown id, or `pxPerSecond ≤ 0`, returns `familyMember` unchanged.
- No React, no status.

### 2.2 `StudioWorkspace.tsx` (grant 2)
- **State:**
  - `gridMode` (default `'adaptive'`) and `gridDensity` (default 0), each with a ref;
  - `fixedGridDivisionId` = today's `gridDivisionId` expression;
  - `gridDivisionId = gridMode === 'adaptive' ? adaptiveGridDivisionId(fixedGridDivisionId, tempoBpm, pxPerSecond, gridDensity) : fixedGridDivisionId`;
  - `gridSeconds = gridDivisionSecondsOf(gridDivisionId, tempoBpm)`.

  These are derived during render. **No new effect.** Zooming writes no status.
- **`resolveAdaptiveGrid(familyMember, tempo)`:** synchronously updates `gridDivisionIdRef`/`gridSecondsRef` from `pxPerSecondRef`, using the same chooser. It is for handlers that read refs before the next render.
- **`changeGridDivision(id)`** (select, menu, fixed-mode keys): unchanged, plus `gridMode` → `'fixed'`. Choosing a division means "this width at every zoom".
- **`toggleGridMode()`** (`5`):
  - adaptive → fixed freezes the current pick, written into the family state;
  - fixed → adaptive resets the density to 0 (Medium) and re-picks within the current family;
  - status `adaptiveOn(label)` / `fixedOn(label)`;
  - no history entry: the grid is a view setting, like Snap.
- **`stepGridDivision`** (`1`/`2`):
  - fixed: unchanged;
  - adaptive: the density moves one level (narrow −1, wide +1), and the status is `gridDivisionStatusMessage(newPick, …)`;
  - at the family end: the existing `gridDivisionEndMessage`;
  - at the density limit (±2) while the family still has room: `adaptiveNarrowest/Widest(label)`.
- **`toggleGridTriplet`** (`3`): in adaptive mode it switches the family marker to the triplet (or straight) variant and stays adaptive. In fixed mode it is unchanged. The refusals are unchanged.
- **Seed effect and `changeTempo`:** set the family marker as today (`'1/4'`), then call `resolveAdaptiveGrid`. The seed's `Snap on — grid <label> (G)` uses the resolved label: `1/4` in fixed mode, the adaptive pick in adaptive mode.
- **Keys:**
  - `Digit5` toggles the mode, in the window handler and in the division `<select>`'s `onKeyDown`. No Alt or Shift; Ctrl and Meta keep the browser default, as for 1/2/3; nothing on auto-repeat.
  - The select handler is needed: without it, the focused select would type-ahead to "5 s" (the C-R59-01 class).
  - `aria-keyshortcuts` is `'1 2 5'`, or `'1 2 3 5'` with a BPM.
- **Title:** `gridDivisionTitle(…)` + `adaptiveTitleSuffix` or `fixedTitleSuffix`. `gridDivisionTitle` itself is unchanged.
- **`data-grid-mode`** = `adaptive` | `fixed` on `arrangement-grid-control`.

### 2.3 Strings (grant 3, exact)
- `adaptiveOn(label)` → `Adaptive grid — follows zoom, now ${label} (5)`
- `fixedOn(label)` → `Fixed grid — ${label} at every zoom (5)`
- `adaptiveNarrowest(label)` → `The adaptive grid is already at its narrowest density — now ${label} (1)`
- `adaptiveWidest(label)` → `The adaptive grid is already at its widest density — now ${label} (2)`
- `adaptiveTitleSuffix` = `' · Adaptive: follows zoom — 5 for fixed'`
- `fixedTitleSuffix` = `' · Fixed at every zoom — 5 for adaptive'`

English only (V-0.3a rule, ST25).

### 2.4 New tests (grants 5, 6)
**`grid-adaptive.test.ts` (pure):**
| Row | Case | Expected |
|---|---|---|
| GA1 | Seconds family at 40 / 50 / 97.66 / 320 / 0.5 px/s | `'1'` / `'0.5'` / `'0.25'` / `'0.1'` / `'10'` |
| GA2 | Invariant for every family at 30 log-spaced zooms, 0.5…320 px/s: seconds (no BPM); straight musical and triplet at 90 BPM and at 120 BPM | The pick's spacing is ≥ 24 px, and the next finer member is < 24 px, unless the pick is a family end |
| GA3 | Musical | 120 BPM @ 40 px/s → `'1/2'`; 90 BPM @ 40 → `'1/4'` (26.67 px); 120 BPM @ 97.66 → `'1/8'`; all exact |
| GA4 | Triplet family, 120 BPM @ 122.07 px/s | `'1/4T'` |
| GA5 | Density −1 / −2 / +1 / +2, seconds @ 40 | `'0.5'` / `'0.25'` / `'2'` / `'5'`; clamped at the family ends (density −2 @ 320 stays `'0.1'`) |
| GA6 | An unknown id; `pxPerSecond` 0, negative or NaN | Returns the input id |
| GA7 | `gridDivisionSecondsOf` | `'1/4'` @ 90 = 0.6667; `'0.25'` = 0.25; musical with a null BPM = NaN |
| GA8 | The constants | 24, −2, 2 (pins the agreed threshold) |

**`grid-adaptive-ui.test.tsx`** (workspace; the existing mount pattern of `grid-snap-ui`, with `live(api).setPxPerSecond`):
| Row | Case | Expected |
|---|---|---|
| GAU1 | Mount | `data-grid-mode` adaptive, division `1`, the title ends with the adaptive suffix, aria `'1 2 5'` |
| GAU2 | `setPxPerSecond(50)`, then `(100)`, then `(320)` | The division goes `0.5` → `0.25` → `0.1`, and the lane bodies' `data-grid-seconds` follow. **`statusSequence` and the status text do not change** across the 3 zooms. |
| GAU3 | `5`; then `setPxPerSecond(320)`; then `5` again | Mode fixed with the exact `fixedOn('1 s')` status; the zoom keeps `1`; `5` again gives adaptive `0.1` with the exact `adaptiveOn('0.1 s')` |
| GAU4 | Adaptive `1` at 40 px/s, three times; then `2` once | First `1`: `0.5`, mode stays adaptive, status `Grid: 0.5 s (Snap off)`. Second: `0.25`. Third: the exact `adaptiveNarrowest('0.25 s')`. `2`: back to `0.5` |
| GAU5 | Choosing `0.1` in the select while adaptive | Mode fixed, division `0.1` at any zoom (the existing fixed behaviour; GS10 still green) |
| GAU6 | A BPM-90 stem seed (`tempo-seed-ui` fixture) at 40 px/s, adaptive; then the same with `5` (fixed) before the seed | Division `1/4`, and the seed text ends exactly `Snap on — grid 1/4 (G)`. Fixed: `1/4` and the same text |
| GAU7 | `5` on the focused division `<select>`; then 5 with Ctrl, Meta, Alt or Shift, and an auto-repeat | `preventDefault` is called (`fireEvent` returns false), the mode toggles, and the select value is not `5`. The modified and repeated presses change nothing |
| GAU8 | `5` typed in the library search and the BPM field; `5` with Export open | The mode is unchanged |
| GAU9 | Adaptive with Snap on (G) at 100 px/s: drag a whole-second clip by 0.6 s | It lands on the 0.25 s grid, and Undo restores it (snap reads the adaptive `gridSeconds`) |
| GAU10 | `3` with a BPM, in adaptive mode; then `3` again | The mode stays adaptive and the division is a triplet member; the second `3` returns to straight |

**Mutants.** A runs them on a scratch copy outside `store/` and reports the red rows; the final files contain no mutant.
- **MU-FIXED-DEFAULT** (`useState<GridMode>('fixed')`): GAU1 and GAU2 red.
- **MU-DENSITY-IGNORED** (`adaptiveGridDivisionId` ignores `density`): GA5 and GAU4 red.
- **MU-ZOOM-STATUS** (a `useEffect` on `gridDivisionId` that writes `gridDivisionStatusMessage`): GAU2 red.
- **MU-SELECT-5** (drop `Digit5` from the select handler): GAU7 red.

### 2.5 Doc 186 (grant 13)
`docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md`, Georgian (`TEMPLATE.md`).
- **l.4** exactly: `**სტატუსი:** In Progress (stage 1 of 2; C round 239 PASS)` (L28).
- **Headings:** the 7 TEMPLATE headings, in order (L26).
- **It states:**
  - the 24 px rule, its two reasons, and the v1/v2 measurements;
  - "choose a division = fixed";
  - the silent zoom;
  - the `1/4` → `1/2` change for a 120 BPM seed at 40 px/s (D-29z359);
  - the §3 table and its deviations;
  - the stage-2 list.
- **Citations:** only rows that exist (grep).

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- [Live 12 manual 6.10 "Using the Editing Grid"](https://www.ableton.com/en/live-manual/12/arrangement-view/), read by B through WebFetch on 2026-10-29.
- [KS 42.13](https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/), via `transport-grid-review.md` §2.
- The tutorials in `reference/youtube/SABA-B-9-10-11-transcripts.md`: GRGG = OSCILLATR "How to change the grid size in Ableton Live 11" (0:00, 0:44); riOD 2:22.
- WebSearch, 2026-10-29: "Ableton Live 12 adaptive grid context menu Narrowest Narrow Medium Wide Widest Fixed grid". It found only Live 10/11 course pages (musicgurus, Isaac Cotec: "Adaptive Grid … default … Widest … Narrowest") and no Live 12 menu text.

| # | Behaviour | Source | Live (status) | CZABA decision | C check |
|---|---|---|---|---|---|
| R1 | Two modes, adaptive and fixed | 6.10: "The grid can be set to be either zoom-adaptive or fixed." | confirmed | both modes | C-MODE-239 |
| R2 | Adaptive is the default | GRGG 0:44 (Live 11); Cotec (Live 10/11) | inference for 12 | default adaptive | C-ADAPT-SEC/MUS-239 |
| R3 | Ctrl/Cmd+5 toggles the mode | 6.10; KS 42.13 "Fixed/Zoom-Adaptive Grid Ctrl5 Cmd5" | confirmed | **plain `5`** (deviation ⚖1) | C-MODE-239 |
| R4 | Ctrl/Cmd+1 "narrows … doubling the density"; 2 widens | 6.10 | confirmed (the manual names no mode) | fixed: next division (unchanged); adaptive: one density level, 5 levels, default Medium | C-DENSITY-239 |
| R5 | Ctrl/Cmd+3 triplets | 6.10 | confirmed | `3`; adaptive stays adaptive | C-MUS-239 |
| R6 | Ctrl/Cmd+4 Snap on/off | 6.10 | confirmed | **stage 2** (G today) | — |
| R7 | The spacing readout "above the time ruler in the lower right corner" | 6.10; GRGG 0:00 "changes with zoom" | confirmed | the existing division `<select>` (top-left of the timeline) shows the pick; no new readout (L39). Deviation ⚖2 → Saba question | C-BUDGET-239 |
| R8 | Adaptive and fixed widths in the lane context menu | 6.10 "using the context menu"; exact items unconfirmed for 12 | partly confirmed | **stage 2** | — |
| R9 | The density threshold in px | **no reference found** (the manual is silent; WebSearch above) | — | 24 px (D-29z357) → SABA-Q-11B-DENSITY | GA2, C-ADAPT-SEC-239 |
| R10 | Picking a fixed width makes the grid fixed | the menu's "Fixed" items (Live 10/11 tutorials) | inference | choosing in the select or menu = fixed | C-MODE-239 |
| R11 | Zoom changes the grid silently | GRGG 0:00 (the readout changes, no message) | observed in video (root's summary) | no status, no announcement | C-SILENT-239 |
| R12 | Seconds grid | Live has none: beat-time only (6.10) | n/a | a CZABA family (Saba decision 3) with the same adaptive rule; ABL-R-8 names "0.1 s … 10 s" | C-ADAPT-SEC-239 |

**Deviations:**
- **⚖1 plain digits.** Ctrl+1…5 switch Chrome tabs (D-29z24, round 47). The policy's SABA-B-11b row says "map our keys or list each difference as a deviation", so this listing is the approved form. The key is shown in the sheet and in the select title. Saba also gets it once as SABA-Q-11B-PLAIN-DIGITS (L44, non-blocking).
- **Why R9 is dispatched and not parked (L44, unlike SABA-B-7):** the 24 px value is one view constant. It changes no audio and no saved data, it keeps HEAD's default grid at the default zoom, and editing `GRID_ADAPTIVE_MIN_SPACING_PX` reverses it. The SABA-B-7 taper, by contrast, changes how saved projects sound. Saba still gets the question (SABA-Q-11B-DENSITY).
- **⚖2 readout position.** Live puts the readout bottom-right; ours stays in the grid control. A position frozen by the rules becomes a question: **SABA-Q-11B-READOUT** (L43). SABA-B-9 will put the master bottom-right, so that corner is shared.
- **Better than Live (claim to check):** the select title and the toggle status name the mode and its key, and the shortcut sheet lists `5`. Live shows the mode only as a menu checkmark.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. Start-state check (§0): HEAD, a clean status, and `sha256sum -c` on the frozen, root and grant-start lists.
2. Apply `b-round-238/precheck-scratch.diff`; write grants 5, 6 and 13.
3. `npm run typecheck` rc 0; `npx biome check` on the 12 code and test files clean; `npm run lint` rc 0.
4. `npx vitest run $(cat ../tmp/studio-real-loop/b-round-238/covering-files.txt) app/lib/arrangement/__tests__/grid-adaptive.test.ts app/lib/arrangement/__tests__/grid-adaptive-ui.test.tsx`: all green. Any test above 50 % of its timeout goes at the top of the report (L32).
5. The 4 mutants (§2.4) on a scratch copy outside `store/`.
6. `code-reviewer` (3+ files); pass its Architecture note to B.
7. Playwright against `:5173` at both viewports: `b-round-238/probe.cjs` and `probe-musical.cjs` (copy and extend them; do not edit them in place). Expect the §0.3 sequences.
8. `a-round-239.md`: changed hunks, the tests run with counts, the mutants, the reviewer result, any STOP at the top.

## 5. C: acceptance
Real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-239 | HEAD, status, hashes | <ul><li>HEAD is `15a0b41`; only the 13 granted paths changed (10 `M`, 3 `??`).</li><li>`sha256sum -c` on `b-round-238-r239-tree-sha256.txt` (1,091) and on the root list gives rc 0; the protected files give `git diff --quiet HEAD` rc 0.</li><li>Grants 7–12: `git diff -U0` shows **no removed `expect(`** without a replacement on the same element. Count the `-` and `+` `expect(` lines per file: the `+` count is ≥ the `-` count, and the removed lines are only the statements named in §0.1.</li><li>Grant 1 has 0 removed lines. In grant 3, the `-` lines are 0 or only Biome reflow inside `studioGridStrings`.</li></ul> |
| C-UNIT-239 | The covering set + GA1–GA8 + GAU1–GAU10 | All green. The full suite is a gate row. |
| C-MUT-239 | C re-runs MU-FIXED-DEFAULT and MU-ZOOM-STATUS once each, on a scratch copy outside the repo | MU-FIXED-DEFAULT turns GAU1/GAU2 red; MU-ZOOM-STATUS turns GAU2 red. The repo status is identical before and after. |
| C-ADAPT-SEC-239 | Empty demo (no BPM). Read the division, then press `=` 6× and `−` 10×, one at a time | <ul><li>At mount: `data-grid-mode` adaptive, `data-grid-division` 1.</li><li>After every step, the lane body's painted period (`backgroundImage` px) equals `data-grid-seconds × px/s` within 0.5 px and is **≥ 24 px**. The next finer seconds step would be < 24 px, unless the pick is 0.1 s or 10 s. C derives px/s from period ÷ seconds and cross-checks it with two ruler ticks.</li><li>Hidden lines (`data-grid-lines` hidden at the widest end) are recorded, not failed (stage 2).</li></ul> |
| C-ADAPT-MUS-239 | Enter on `demo-synth-mix` (120 BPM), then `=` ×5 | Read `data-grid-division` immediately after the seed lands, before the first `=`: the seed status ends exactly `Snap on — grid <that label> (G)` (the seed label is frozen at seed time; later zooms move the attribute, not the status). At the load zoom §0.3 gives `1/2`; if the load zoom differs, the invariant decides. Each zoom step keeps the invariant in the straight musical family, and `data-bpm` stays 120. |
| C-SILENT-239 | The seconds and musical runs above | On no zoom step does the status text change, nor the live-region child key (`statusSequence`: count the child replacements of `<output aria-live>` with a MutationObserver). |
| C-MODE-239 | `5`, zoom `=` ×3, `5`, `−` ×3; then choose `0.1 s` in the select | <ul><li>`5` → fixed, with the exact `Fixed grid — <label> at every zoom (5)`; the division stays frozen through the zoom.</li><li>`5` → adaptive, with the exact `Adaptive grid — follows zoom, now <label> (5)`.</li><li>Choosing `0.1 s` in the select → `data-grid-mode` fixed.</li><li>The title suffixes are exact in both modes.</li></ul> |
| C-DENSITY-239 | Adaptive at the load zoom: `1` ×3, then `2` ×5 | `1` goes one step finer each time (status `Grid: <label> (Snap off)`) until the exact `adaptiveNarrowest(...)` or family-end text. `2` goes back, then wider, up to the exact `adaptiveWidest(...)` or end text. The mode stays adaptive throughout. |
| C-MUS-239 | With the 120 BPM seed: `3`, `3` | First a triplet member, then straight again. The mode stays adaptive, and the invariant holds in the triplet family. |
| C-KEYS-239 | `5` in the library search, the BPM field and a marker name editor; `5` with Export open; `5` on the focused division select; Ctrl+5; a held `5` (auto-repeat) | <ul><li>In the fields, the text gets the `5` and the mode is unchanged.</li><li>With Export open, nothing changes.</li><li>On the focused select, the mode toggles and the select value is not `5`.</li><li>Ctrl+5: the default is not prevented and the mode is unchanged.</li><li>Held: one toggle.</li></ul> |
| C-SNAP-239 | Snap on (G), adaptive, at the load zoom and after `=` ×4: drag a clip, click the ruler, nudge with `→` | Each lands on a multiple of the current `data-grid-seconds`, and Alt bypasses. Undo restores the drag. |
| C-BUDGET-239 | L39 | The count of persistent text lines outside the timeline is the same before and after, at both viewports, on the empty and the demo project. The sheet (`?`) has the new row `Adaptive / fixed grid` `5` in Grid & snap, and the sheet search finds it with "adaptive". |
| C-SHOTS-239 | Evidence | Full-window screenshots at both viewports: at mount, after `=` ×4 (adaptive), and after `5` (fixed), with the select tooltip shown once. |
| C-REF-239 | §3 | One row per R1–R12: a match, or the listed deviation. The Live-conformance judgement is kept separate: confirmed / deliberate difference / unconfirmed / n/a. SABA-Q-11B-READOUT, SABA-Q-11B-DENSITY and SABA-Q-11B-PLAIN-DIGITS are in `backlog.json`. |
| AN-REVIEW-239 | Doc 186 | l.4 byte-exact; the 7 headings in order; it cites only existing row ids (grep GA*/GAU*); it states the 120 BPM `1/2` change. |
| LAB-SMOKE-239 | `/studio-lab` | It loads. Space plays and pauses. The export dialog exports a WAV whose sha256 equals HEAD's for the same untouched project (the grid does not touch audio). 0 page errors. |
| Auth | Standing check | In a fresh context: `/studio-lab` opens anonymously with `auth_user` null; `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`; `/api/studio-token` with no header returns 401. |
| Purchased origin (browser) | The grid on the purchased copy | BLOCKED: backend unavailable in cloud. The grid code has no origin branch: grepping `origin` in the grant-2 hunks gives 0. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **SRW-14 fixed-grid rows** (`grid-snap-*`, the menu, triplets, `marker-snap`): they now run in adaptive mode at 40 px/s, where the pick equals HEAD's 1 s. A change of the default zoom or of the threshold would move them. GA8 pins the constant.
- **The 11a seed contract (D-29z359):** at 120 BPM and 40 px/s the seed now says `grid 1/2`, where HEAD said `grid 1/4`. The round-234…238 browser rows that pinned `1/4` for the 120 BPM pulse are superseded by C-ADAPT-MUS-239. At 90 BPM it stays `1/4` (GAU6; TU13/TU15 green).
- **Zoom during a drag** (Ctrl+wheel while dragging a clip): the snap step follows the new pick on the next move. C probes it once at 1440, expecting no crash and no off-grid commit. An oddity is recorded, not made a row.
- **Hidden lines at the far ends** (seconds 10 s below 2.4 px/s; bar at a low BPM): snap continues on the hidden grid exactly as at HEAD. That is stage 2, not a regression of this round.
- **The grid menu** (right-click on a lane): its checked item is the current pick. Choosing an item calls `changeGridDivision`, which makes the grid fixed (R10). There is no Adaptive item yet (stage 2).
- **Keyboard ownership:** `5` must not fire in text fields, while a dialog is open, or with modifiers (C-KEYS-239). The `?` sheet's own search field must receive the `5`.

## 7. Outcomes for B's next planning
- **PASS and gate published:** SABA-B-11b stage 1 is done. Stage 2 follows: the `4` key, the menu's Adaptive/Fixed and density items, and no snap on an invisible grid; it closes ABL-R-8. Exception: if the regression round is due (on or after 2026-10-30), it comes first and uses the adaptive contract from C-ADAPT-*-239 for the SRW-14 / SABA-B-11a items.
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.
