# A round 256 — SABA-B-9 stage 1: centre transport, Stop, honest Play

**No STOP.** Code-reviewer ran (8/10); its one Medium (M-1) is fixed and red-proved (§7).

**DEVIATION: needs a B/C ruling on grant rows 5 and 6 (L4: two clauses bind the same lines).**
- **What was added:**
  - `render-budget.test.tsx` around the Stop clicks at HEAD l.411, l.454 and l.611;
  - `master-ui.test.tsx` around l.651;
  - at each site, `expect(view.getByRole('button', { name: 'Play' }).dataset.playing).toBe('true')` before the click and `.toBe('false')` after it.
- **The conflict:**
  - Row 5 says "assertions are unchanged", and row 6 says "Nothing else".
  - The §0.1 rule says "No collision row may lose an assertion … replaces each assertion with an equal or stronger one".
- **Why A followed §0.1:**
  - At HEAD, the `name: 'Pause'` lookup implicitly asserted "playing before the click".
  - At l.454, the following `name: 'Play'` lookup asserted "stopped after it".
  - With Play constant, those checks vanished. This is reviewer finding M-1: Medium at l.454, Low at the other three sites.
- **Red-proof:** a mutant whose Stop onClick does nothing turns 6 rows red (`a-round-256/mutants.txt`).
- **No other line changed in these two files.** If B/C rule for the literal row text instead, the minimal revert is to drop the l.411, l.611 and master-ui pairs and keep the l.454 pair.

## 1. Start state (§0) — verified before any edit
- HEAD `a061d524d14af347119f06b239b77747c36362a0`; `git status --short --untracked-files=all` empty.
- `sha256sum -c --quiet b-round-255-r256-tree-sha256.txt` rc 0; root-files rc 0; grants-start rc 0; 7 protected files `git diff --quiet HEAD` rc 0.

## 2. Changed files (exactly the 14 grants)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementTransport.tsx` | Root `data-testid="arrangement-transport"` grid (`grid-cols-2` + areas `'centre centre' 'edit view'`; `min-[1408px]:grid-cols-[1fr_auto_1fr]` + `[grid-template-areas:none]`). Groups `arrangement-transport-edit` / `-centre` / `-view`. Centre: Follow · clock · Play · Stop · Back to start · Loop. Play: constant `aria-label`/`title`, `data-playing`, `if (!isPlaying) togglePlayback()`, `preventRepeatedEnterKeyDown`, on-state `bg-brand` (+ `enabled:hover:bg-brand/92`, `enabled:active:bg-brand/88`) while playing, `bg-foreground` set when stopped; `Pause` import/icon removed. Stop: lucide `Square` `size-3` `strokeWidth 2` `aria-hidden`, `toolButtonClass` + `w-8 justify-center px-0`, `if (isPlaying) togglePlayback()`, `onDoubleClick={returnToStart}`, `preventRepeatedEnterKeyDown`, never disabled. Separators: after-clock and after-Delete removed; after-Redo and before-Export kept. Undo/Redo/Split/Delete/Loop/Follow/Zoom/Fit/Export handlers, names, titles and classes byte-identical (re-indented only). |
| 2 | `app/lib/arrangement/strings.ts` | `pauseLabel`/`pauseTitle` deleted; `stopLabel: 'Stop'`, `stopTitle: studioShortcutTitle('Stop', 'play-stop')` in the same positions. |
| 3 | `app/lib/arrangement/shortcuts.ts` | `back-to-start` `keys: ['Home', 'Double-click Stop']`; action and `ariaKeyShortcuts` unchanged. |
| 4–12 | collision tests C1–C9 | §3 below. |
| 13 | `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` (new) | TC1–TC9, `describe(…, { timeout: 15_000 })`, shared `createWorkspaceTestEnvironment`, `createBufferSource` spy as the source-start counter. |
| 14 | `docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md` (new) | l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 256 PASS)` (checked with `[ "$(sed -n 4p …)" = … ]`). The 7 TEMPLATE headings are in order. Every cited TC/TS row id exists (grep). |

Deviation from B's sketch: breakpoint **1408** rather than 1400 (measured, §4). No other deviation.

## 3. Collision hunks (old → new); full `git diff -w` in `a-round-256/collisions.diff`
- **C1 transport-surface-ui:**
  - Toolbar lookup: the `flex-wrap` ancestor walk → `getByTestId('arrangement-transport')`, plus two new asserts that it contains `arrangement-position` and `arrangement-fit`.
  - TS1: `toHaveLength(12)` → `13`; plain `10` → `11`, plus `expect(plain).toContain(byName('Stop'))`. The title count changes to match. Every per-button token assert is unchanged.
  - TS2: the "fills Play with foreground in both states; Pause icon while playing" row becomes a two-state contract:
    - Stopped: `bg-foreground` and its hover/active.
    - Playing: `bg-brand` and its hover/active, with the other state's three fill tokens asserted absent.
    - Kept: `w-8`, `h-8`, `rounded-full`, `px-0`, `justify-center`, `text-background`, `border-transparent`, the absent list, 1 hidden svg, empty text, no `▶`/`❚`, title, and `getByRole('button',{name:'Play'})` identity before and after.
    - Replaced: the old `name:'Pause'` identity becomes "the Play element is the same node and its name stays `Play`" while playing. `lucide-pause` while playing becomes `lucide-play` plus `not lucide-pause`. `pauseTitle` becomes a constant `playTitle`. The old second click (Pause → Play) becomes Stop → Play.
    - Added: `data-playing` in both states; a second Play click while playing keeps the playing surface; `queryByRole('button',{name:'Pause'})` is null.
  - TS6: a Stop entry (`lucide-square`, `size-3`, `shrink-0`, stroke 2, text `''`) is appended to `iconButtons`, so the destructured indices are unchanged; the title says "seven V-3b transport glyphs and the Stop square".
- **C2 render-budget:** 8× `name: 'Pause'` → `name: 'Stop'`; 3 titles "Play → Pause → Play" → "Play → Stop → Play". Each click happens while playing, so the meaning (stop) is the same. Budgets, timeouts and existing asserts are unchanged.
  - **Added after review M-1:** at HEAD, the `name: 'Pause'` lookup implicitly proved "playing before the click", and the following `name: 'Play'` lookup proved "stopped after it". At the 3 Stop clicks with no nearby `isPlaying` assert (l.411, l.454, l.611), I added `expect(Play.dataset.playing).toBe('true')` before the click and `.toBe('false')` after it. This replaces the lost implicit asserts with explicit, equal ones.
- **C3 master-ui:** l.651 `'Pause'` → `'Stop'`, plus the same `data-playing` `'true'` before / `'false'` after pair (review M-1, Low part), to replace the implicit HEAD assert.
- **C4 bars-ruler-ui:** the `transportLabel` helper (`queryByRole(name: pauseLabel)` → label) becomes `transportPlaying` (`getByRole('button',{name: playLabel}).dataset.playing`). Its 3 uses change from `toBe(pauseLabel)` ×2 and `toBe(playLabel)` ×1 to `toBe('true')` ×2 and `toBe('false')` ×1. The states are the same. It is stronger, because `getByRole` throws if Play is absent.
- **C5 strings.test ST10:** `pauseLabel: 'Pause'` → `stopLabel: 'Stop'`; `pauseTitle: 'Pause (Space)'` → `stopTitle: 'Stop (Space)'`.
- **C6 grid-snap-ui GS14:** `Play.parentElement` → `getByTestId('arrangement-transport')`, plus an assert that it contains Play. Length 12 → 13. All 12 old label asserts are kept and re-indexed to the new DOM order: Undo, Redo, Split, Delete, Follow, Play, Stop (new), Back to start, Loop, Zoom to selection (Z), Zoom, Fit, Export. The zoom slider, no-`Snap` and no-`select` asserts are unchanged.
- **C7 mode-toggle-colour-ui DXT2 helper:** `Play.parentElement` (+ throw) → `getByTestId('arrangement-transport')`; the whole toolbar is searched. Assertions are unchanged.
- **C8 navigation-strings-ui:**
  - The toolbar is `getByTestId('arrangement-transport')` and `centre` is `getByTestId('arrangement-transport-centre')`.
  - `backToStart`: `toolbar.querySelectorAll('button')[1]` → `centre.querySelectorAll('button')[3]`. It is still index-based, so NS1's `aria-label`/`title` asserts still check the button in that slot and are not tautological.
  - NS2 helper: whole toolbar.
  - NS5: adds `['play-stop', Stop]`, and the existing Play row is kept. Every existing assert stays.
- **C9 shortcut-sheet-ui SS-T1:** the `back-to-start` expected keys `['Home']` → `['Home', 'Double-click Stop']`. Biome splits that object over 5 lines.

## 4. Chromium measurements (127.0.0.1:5173/studio-lab, Playwright; `a-round-256/browser/`)
- Every probe used a fresh browser context. No session state was persisted, so no `a-browse.json` state file exists.
- Scripts: `a-round-256/a256.cjs`, `contrast.cjs` and `sheet.cjs`.
- I did not start or stop the 5173 server.
**Breakpoint:**
- Natural one-row widths: edit 409, centre 487, view 432.2.
- Need: 2 × 432.2 + 487 + 2 × 12 + 24 = **1,399.4 px**.
- **Breakpoint `min-[1408px]` (≈ 8.6 px headroom).**

| Viewport | Toolbar h | Rows | Centre offset | Overflow (root/groups) | Overlap | Clock h / line | Library top / ruler / 1st lane |
|---|---|---|---|---|---|---|---|
| 1440×900 | **49** | 1 | 0 | 0/0/0/0 | none | 32 / position 24 = line 24 | 84 / 191 / 275 |
| 1280×720 | **87** | 2 (centre alone in row 1) | 0 | 0 | none | 32 / 24 | 122 / 229 / 313 |
| 1366×768 | 87 (HEAD 49, D-29z483 window) | 2 | 0 | 0 | none | 32 / 24 | 122 / … |
| 1408×800 (breakpoint) | 49 | 1 | 0 | 0 | none | 32 / 24 | 84 |
| 1407×800 (1 px below) | 87 | 2 | 0 | 0 | none | 32 / 24 | 122 |
| 1400×800 | 87 | 2 | 0 | 0 | none | 32 / 24 | 122 |

- The header is 35 px at both canonical viewports, the same as B's HEAD probe. The toolbar heights 49 and 87 equal HEAD, so the y values below it are unchanged by construction.
- A did not run a HEAD control in this round (C's row). The 1600 px reference is `geometry-1600x900`.

**Contrast** (computed colours converted through canvas to sRGB and composited on the toolbar `surface` #161412; `browser/contrast.json`):

| State | Play fill | Play glyph : fill | Stop glyph : fill |
|---|---|---|---|
| Stopped | #ECE6DA | **15.62** | **13.24** |
| Playing | #C9A46A | **8.32** | 13.24 |
| Playing + hover | brand/92 | 7.24 | 12.35 (Stop hover) |
| Stopped + hover | foreground/92 | 13.33 | – |

- The Play box is `[x,43,32,32]`, identical in both states at both viewports (±0).
- The first attempt read `oklab()` as rgb and reported 1.07; that result was discarded as a parser bug and re-measured.

**Play → Stop → double-click run** (`browser/run-*.json`; RMS from the output tap; the marker was at 0 in A's run, and C's setup uses 2.000):

| Step | 1440 | 1280 |
|---|---|---|
| Play | 0.882, playing | 0.870 |
| Play again (+500 ms) | 1.512, still playing (monotonic), no Pause button | 1.471 |
| Stop at +300 ms | 1.552 frozen, RMS 0 | 1.512, RMS 0 |
| Stop at +800 ms | 1.552 | 1.512 |
| Stop while stopped | no change (position, marker, status) | same |
| Double-click | 00:00.000, marker 0.000, stopped | same |
| Play, then double-click while playing | stopped at 00:00.000, marker 0, RMS 0 at +300 ms and +1 s | same |

- `activeElement` after the double-click is Stop. No page errors.

**`?` sheet:**
- The `back-to-start` row is 40 px with keys `Home`, `Double-click Stop`.
- `scrollHeight` is 1,280 and `clientHeight` is 808 / 646.
- `scrollWidth` equals `clientWidth` (718).

## 5. Tests actually run
- `npm run typecheck`: rc 0. One TS error in my new file (`stop.disabled` on an `HTMLElement`) was fixed to `hasAttribute('disabled')` and re-run clean.
- `npm run lint`: no errors, and no diagnostics in any owned file. The repo-wide warning count is 205; none comes from owned paths (grep).
- Biome check scoped to the 13 owned code and test files: clean.
- `npx vitest run` on the 12 §2.7.3 files (run before the M-1 fix; §7 has the re-run of the two changed files): **12 files, 220 tests, all passed** (`a-round-256/vitest-required.log`). File times:

| File | Time | Tests |
|---|---|---|
| transport-centre-ui | 9.8 s | 9 |
| render-budget | 9.6 s | 8 |
| bars-ruler-ui | 8.5 s | 25 |
| grid-snap-ui | 7.9 s | 25 |
| shortcut-sheet-ui | 7.8 s | 13 |
| insert-marker-ui | 7.7 s | 29 |
| navigation-strings-ui | 4.1 s | 7 |
| transport-surface-ui | 3.4 s | 8 |
| master-ui | 2.4 s | 18 |
| mode-toggle-colour-ui | 1.8 s | 8 |
| strings | 0.08 s | 64 |
| shortcuts | 0.01 s | 6 |

- **L31 (per test, verbose run):**
  - The highest is render-budget "does not re-render clips…" at 2,892 ms against a 15 s declared timeout (19 %).
  - NS5 is 1,855 ms against the vitest default of 5 s (37 %); gate 255 measured 1,358 ms.
  - TC5 is 1,618 ms against 15 s.
  - **No test is above 50 %.**
- **L12 / blind-spot run:** every file that greps the re-wrapped testids (25 files), plus the source scanners (`studio-focus-ring`, `affordance-colour-ui`, `panel-radius-ui`, `strings`) and the required set: **31 files, 627 tests, all passed** (`a-round-256/vitest-covering.log`). All testid hits are inside `app/lib/arrangement/__tests__`. `e2e/**` has no hit on Pause, the toolbar classes or these testids.

## 6. Mutants (on the component in place; restored from `/tmp` copy, sha256 verified each time; `a-round-256/mutants.txt`)
| Mutant | Red rows |
|---|---|
| M1 Play → `togglePlayback` unconditionally | **TC2** |
| M2 `onDoubleClick` removed | **TC5** |
| M3 Stop → `togglePlayback` unconditionally | **TC4**, TC5, TC9 |
| M4 Play label → `Pause` while playing | **TC6** |
| M5 clock moved into the view group | **TC1** |

All five mutants ran with the 1400 class string; the breakpoint change to 1408 came later and does not affect jsdom.

## 7. Code-reviewer (actual `code-reviewer` subagent; score 8/10; no Critical or High)
**Fixed**
- **M-1 (Medium), fixed.** The C2/C3 Stop clicks had lost the implicit "it really stopped / was playing" checks. The fix is the explicit `data-playing` pairs in §3. Red-proof: a mutant where Stop's onClick does nothing turns **6 rows red** (5 in render-budget, 1 in master-ui); `mutants.txt` has the tail. After the fix both files are green: 26 tests (render-budget 5.7 s, master-ui 1.7 s).

**Not fixed: needs a decision from B or Saba**
- **M-2 (a11y, spec-conformant).** The "Pause" name was the only screen-reader signal that playback was running. Now the playing state shows as colour plus `data-playing` only, and `startPlaybackAt` writes no status. The fix options are `aria-pressed`, which misdescribes a button that does nothing when pressed again, or a "Playing…" status, which needs a context change and the context is frozen. Proposed for SABA-Q-9-TRANSPORT (d) as **A-R256-REVIEW-PLAYING-SR-STATE**. I rate it Medium-candidate a11y; B decides.
- **Low A-R256-REVIEW-SPACE-ON-FOCUSED.** Space on a focused Stop while stopped *starts* playback, and Space on a focused Play while playing *stops* it. This follows the "one toggle" rule in §2.4, but it undercuts the honest label. Propose it as a SABA-Q-9 part.

**Info (no action)**
- **A-R256-REVIEW-STALE-GUARD.** The guards read the rendered `isPlaying`, while `togglePlayback` reads the ref. A Stop click between a non-click auto-stop and React's commit could start playback. The window is theoretical.
- Breakpoint 1408 against a need of ~1,399; this is reported in §4.
- On narrow widths, the visual order (centre first) differs from the Tab order (SABA-Q-9 (c)).
- Pre-existing: no `role="toolbar"`/`role="group"`, and the separators lack `aria-hidden`.
- `text-background` on `bg-brand`, where `text-brand-foreground` is the semantic token with the same value.
- Stop's title doesn't mention the double-click.
- TC7 tests the frozen window handler and kills none of this diff's mutants (as §2.6 says). TC3's line l.257 is redundant (l.258 proves it). NS1 still finds its button by index.

**Architecture note (for B, not refactored in this round)**
- Signal 2, ownership/coupling: the R5/R6 no-op rules live as guards in `ArrangementTransport.tsx` on rendered state, while the context decides on `isPlayingRef`.
- Proposal: add additive `play()`/`stop()` commands to `useArrangement()`, guarded on the ref, and have Transport call them.
- Acceptance: TC2–TC5 and TC8 pass unchanged, plus one test where the ref and the state disagree. Cost: low.
- Keep the current shape this round, because the context is frozen.

## 8. Hashes after edits (final, after the M-1 fix)
- `npm run typecheck` rc 0.
- `npm run lint` rc 0: 205 warnings, none in owned paths.
- `sha256sum -c --quiet b-round-255-r256-tree-sha256.txt` **rc 0**.
- Root files **rc 0**.
- The 7 protected files: `git diff --quiet HEAD` **0 0 0 0 0 0 0**.
- `git status`: 14 entries, exactly the granted paths. 12 are modified and 2 are new (the test file and doc 193).

## 9. Known gaps / for B
- A did not run a HEAD control server. The C-LAYOUT ±1 px comparison against HEAD, C-STATUS (clobber), C-FOCUS (full Tab sequence, ring only on `:focus-visible`), C-BUDGET, C-KEYS in the browser, LAB-SMOKE export sha and Auth are C's rows; A did not run them.
- TC7 cannot prove "no second native click from Space keyup" in jsdom. C-KEYS-256 covers it.
- The 1,351–1,407 px window is two rows (87 px) where HEAD had one row (49 px) at 1,351–1,399. This is D-29z483 / SABA-Q-9-TRANSPORT (c); the breakpoint choice widens the window by 8 px (1,400–1,407).
- Play's playing look (brass fill) is A's pick under SABA-Q-9-TRANSPORT (d).

## 10. Exact next C checks
C-SCOPE-256, C-UNIT-256 (re-run M1 and M4), C-COLLISION-256 (`collisions.diff`), and C-LAYOUT-256 at 1440, 1280, 1366, **1408** and **1407**. Then C-STOP-256 with the marker at 2.000, C-STATUS-256, C-KEYS-256, C-ONSTATE-256, C-FOCUS-256, C-SHEET-256, C-BUDGET-256, C-REF-256, C-LESSON-256, AN-REVIEW-256 (doc 193), LAB-SMOKE-256 (export sha `1fea093b…033f94`) and Auth.

## 10b. Acceptance A truly checked
- §2.1 order: TC1 and Chromium.
- §2.2 bounds at 1440, 1280, 1366, 1408 and 1407.
- §2.3 contract (TC2, TC6, Chromium) and contrast in both states.
- §2.4 Stop (TC3–TC5, TC8, TC9, Chromium run).
- §2.5 sheet bound.
- §2.6 TC1–TC9 and M1–M5.

All other §3 rows are C's.
