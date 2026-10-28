# A round 226: SABA-B-8 CALM-1a (shortcut sheet, `?`, footer button, permanent line removed)

**Status:** implemented; no STOP. The code-reviewer ran: 0 Critical/High, 3 Medium fixed with tests, Lows addressed or forwarded (§6).
**Baseline:** HEAD `80fbb3b`, clean tree at start; frozen/granted/root `sha256sum -c` rc 0 at start.

## 1. Changed files (exactly 4 M + 5 ??)
- M `app/components/arrangement/StudioWorkspace.tsx`, grant 1:
  - (a) `isShortcutSheetOpen` state, `shortcutSheetOpenRef`, `shortcutButtonRef`, and `<ArrangementShortcutSheet>` render;
  - (b) `isShortcutSheetKey`, the sheet-open early return at the top of `handleKeyDown`, and the `?` open branch after the export/typing return;
  - (c) footer.
  - Also 3 import lines: `findStudioShortcut`, `studioShortcutSheetStrings`, `ArrangementShortcutSheet`.
- M `app/lib/arrangement/strings.ts`: `studioShortcutSheetStrings` added at the end. No existing literal changed.
- M `workspace-strings-ui.test.tsx`: WSU1 only (title tail renamed per §3.6).
- M `track-group-collapse-ui.test.tsx`: UC12 first assertion **plus one import line** (`findStudioShortcut` from `../shortcuts`), outside "first assertion" but required. The UC12 title is unchanged, and the fold part is byte-identical.
- ?? `app/lib/arrangement/shortcuts.ts`, `app/components/arrangement/ArrangementShortcutSheet.tsx`, `__tests__/shortcuts.test.ts`, `__tests__/shortcut-sheet-ui.test.tsx`, `docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md`.

## 2. Deviations / notes for B
- **D1, footer slot classes.** Each slot `<p>` now uses `min-w-0 flex-1 truncate` inside the new `basis-full` flex row, so the selected-clip `<p>` lost its `basis-full` (the row carries it) and the reserve gained `truncate`. Testids, text and the remaining classes are unchanged.
- **D2, group headings** use `text-xs font-medium uppercase tracking-label text-muted` (12 px), not `text-label` (11 px). C-A11Y requires all text ≥ 12 px (L4: the C row wins).
- **D3, sheet title** is `font-medium`, because TH10 forbids `font-semibold`.
- **D4, Esc stays the Modal's own close.** The sheet also adds a window capture listener that `preventDefault`s Escape while it is open. Reason: Modal closes on `document`; by the time the window bubble listener runs, React may have re-rendered, so the floating-video Escape branch could run on the same event. That branch checks `defaultPrevented`.
- **D5, Space on Close.** `handleKeyUp` (SW, not granted) `preventDefault`s Space keyup, which cancels button activation in Chromium. The sheet content's React `onKeyUp` stops Space keyup propagation (root = `hydrateRoot(document)`). Browser: Space on Close closes the sheet and playback does not start. No edit outside the grants.
- **D6, held `?` typing.** After `?` opens the sheet, the auto-repeats targeted the focused search and typed "????" (browser). The sheet now `preventDefault`s repeated `?` keydowns while open (SS3 asserts it).
- **D7, citation fixes for §3.1:**
  - `lane-lock` is ArrangementClip l.491 (`timeLocked = … event.shiftKey`), not SW l.491;
  - `add-sound` double-click is Library l.93 (confirmed).
  - `overview-scroll` is Overview l.265–275 (ArrowLeft/Right × `TIMELINE_OVERVIEW_PAN_SECONDS`);
  - `waveform-zoom` is the SW l.2450 `waveformZoomLabel` select.
  - Every §3.1 row is confirmed by a source grep. Rows `scroll`, `fader-page` (native) and `fader-step` rest on B's browser probe and the constants. No row was invented or dropped.
- **D8, glyphs.** CDP `getPlatformFontsForNode` on the subline: Instrument Sans 45 glyphs plus DejaVu Sans 2 glyphs (⌘/⌥ are real glyphs). The ⌘/⌥ subline shipped; the fallback text was not needed.

## 3. Tests actually run
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0. The 205 warnings are pre-existing, with 0 in owned files. `npx biome check` on the 8 owned code/test paths: clean.
- `npx vitest run` covering set (25 files, `--reporter=verbose`, log `a-round-226/covering-run.log`): first run 1 red, **TH10** (my `font-semibold`, fixed: D3). After the fix, TH10 and the SS file were re-run green. Final covering-set re-run after the review fixes: **25 files, 320 tests, all green** (`covering-run-final.log`); slowest 3.9 s / 20 s.
  - Files: shortcuts, shortcut-sheet-ui, workspace-strings-ui, track-group-collapse-ui, studio-focus-ring, panel-radius-ui, studio-theme-obsidian, timeline-cursor-map, affordance/label-status/drag-feedback/content/mode-toggle/mixer-onstate colour suites, grid-snap-keys, status-announcement-ui, markers-ui, marker-edge-nav-ui, navigation-strings-ui, waveform-zoom, self-disabling-focus, export-dialog-focus, export-dialog-tab-stops, export-dialog-focus-restore, strings.
  - Slowest: UC5 3.78 s (limit 20 s, gate 225 3.64 s), DXM3 3.13 s (limit 20 s). SS tests under the 25-file load: SS2 1.85 s, SS1 1.07 s, the others < 0.91 s. The describe now carries `{ timeout: 20_000 }`, like the sibling workspace suites, so SS2 is at 9 %. The file was re-run green after that change. Nothing is above 50 %.
- Mutants (`a-round-226/mutants/*.log`; originals restored, sha verified):
  - MU-a → SS5 red;
  - MU-b → SS3 red;
  - MU-c-open → SS3 red;
  - MU-c-close → SS3 (held) red;
  - MU-d → SS2 and SS10 red;
  - MU-e → SS6 red;
  - MU-f → SS8 red.
  - Post-review: MU-g → SS2, MU-h → SS5, MU-i → SS2, each red. Originals restored and sha re-verified.

## 4. Browser self-check (Chromium, 127.0.0.1:5173; `a-round-226/browser/probe-after.json`, `probe2.json`, screenshots)
| Check | 1440×900 | 1280×720 |
|---|---|---|
| `arrangement-shortcut-hint` | absent | absent |
| footer h (S0/S1) | 49/49 | 49/49 |
| scroller `clientHeight` (S0/S1) | 516/516 | 406/406 |
| contextual row h / button h | 16/16 | 16/16 |
| footer button contrast rest / hover (text and `?` chip) | 6.68 / 14.78 | 6.68 / 14.78 |
| sheet: subline / action / chip / heading contrast | 6.68 / 14.78 / 14.78 / 6.68 | same |
| min text size in the sheet | 12 px | 12 px |
| `fit` row chip scrollW = clientW; sheet scrollW = clientW | 274 = 274; 718 = 718 | same |
| sheet height | inner scroll (1162 > 808) | inner scroll (1162 > 646) |
| `Shift+Slash` on body → open, focus on search; Esc → closed, focus on footer button | yes | yes |
| Tab from search → Close; keyboard focus ring on Close | 1 px solid brass α 0.8 | same |
| Space on Close → closed, no playback | yes | yes |
| backdrop click → closed, focus on footer button | yes | yes |
| `?` in library search → typed, no sheet | yes | yes |
| lane-move refusal hint during a drag onto video | 1 line, h 16, no overflow, footer 49, selected-clip absent | 1 line, sw = cw 1164, footer 49 |

Only at 1280×720 (`probe2.json`):
- mouse open, then mouse close on Close → focus on the footer button, `:focus-visible` false, outline none;
- a held `Shift+Slash` (5 downs) → opens once, search empty;
- CDP `?`/Minus+Shift → opens; `_`/Slash+Shift → opens; `/`/Slash → does not.

Screenshots: `after-S0-*.png`, `after-S1-*.png`, `sheet-open-*.png`, `drag-*.png`. Page errors: 0.

## 5. Known gaps / not done
- Not run: the full suite, `npm run verify` and `npm run build` (gate rows; neither B §4 nor the speed rule lists them for A). The Esc + floating-video race (review M1) is pinned only in jsdom; it is left to C as a browser sub-row. The C-BBOX dump (`bbox-before.mjs`) was not re-run by A. C-ROWS (performing each row in the real Studio) was not run by A.
- C-NO-OPEN: BPM, Clip Gain, marker editor, Export open, grid menu and clip drag were checked in jsdom (SS3); the browser checked only the library search.

## 6. Code review (real `code-reviewer` subagent, score 8/10)
- **M1 (Esc `defaultPrevented` contract untested):** fixed. SS2 asserts that Esc keydown returns `false` (prevented). MU-g (remove the sheet's Esc `preventDefault`) → SS2 red. C sub-row proposed: floating video expanded + sheet open + Esc → sheet closes, video stays.
- **M2 (Space keyup stop untested):** fixed. SS5 asserts that keyup Space on Close is not prevented. MU-h → SS5 red.
- **M3 (restore to opener vs fallback):** fixed. SS2 opens from the focused Snap toggle and checks that Esc returns focus there. MU-i (always fallback) → SS2 red.
- **L1:** fixed. If `opener.focus()` does not take, focus falls back to the footer button.
- **L3:** fixed. `onClose` is a stable `useCallback` (grant a).
- **L2:** recorded as D2 in doc 177; needs a B ruling.
- **L4:** not changed (`findStudioShortcut` lookup per render; trivial).
- **L5:** intended (D6).
- **L6:** the menu guard is target-based as specified; C-NO-OPEN covers it in the browser.
- **L7:**
  - the second SS3 case is renamed "SS3 held key", so the id grep still finds SS3;
  - SS5 Space has no positive control in jsdom (the browser shows no playback on Space while open);
  - SC1 pins keys only for `split` and `shortcuts`;
  - the UC12 title still says "the shortcut hint lists…" (title frozen by the grant). For B.
- **Architecture notes for B/root (proposals, not done):**
  1. One `blockingDialogOpenRef` (export + sheet), read by both `handleKeyDown` and `handleKeyUp`. That would remove the sheet's `onKeyUp` Space workaround (`handleKeyUp` is outside the grant).
  2. A shared dialog focus hook (Export + sheet), already in the checkpoint request.
  3. `app/routes/studio.$productId.tsx` l.283–296 has its own `?`/Esc handler without typing guards. It is not mounted with StudioWorkspace today, so it is a convergence candidate for CALM-1b planning. It is a protected file and was not touched.

## 7. Exact next C checks
- C-SCOPE.
- C-GEOM / C-BBOX: rerun `b-round-225/bbox-before.mjs`. Expect the footer −20 h, the scroller +20, and the new `button:Shortcuts` key.
- C-OPEN / C-NO-OPEN (real keys, all listed focus targets, held key ≥ 1 s).
- C-LAYOUT, C-INERT, C-ROWS (every row performed once), C-SEARCH.
- C-A11Y: verify D2 (12 px headings) and the D8 glyph result.
- C-SLOT (the refusal text at 1280), C-BUDGET, C-REF, C-LESSON, G226-3, LAB-SMOKE-226, AN-REVIEW-226 (doc 177 l.4 byte-exact; cited ids SC1–SC3, SS1–SS10, MU-a…MU-f exist).
- Neighbours:
  - Esc with the sheet closed still returns the floating video and still clears the library search;
  - Esc with the floating video expanded **and** the sheet open closes only the sheet (D4).

## 8. B acceptance criteria A passed (self-check only; C decides)
- §4.1: start checks passed.
- §4.2: typecheck and lint rc 0.
- §4.3: covering set green.
- §4.4: mutants MU-a…MU-f red as specified (plus MU-g/h/i).
- §4.5: browser self-check; final re-run after the review fixes gives the same values.
- §4.6: code-reviewer done and findings addressed.
- §4.7: end state:
  - `git status` = exactly 4 M + 5 ??;
  - HEAD `80fbb3b`;
  - frozen `sha256sum -c` rc 0, root files rc 0;
  - `a-round-226/changed-end-sha256.txt` written (9 files).
- No C row is claimed. The whole backlog is not marked complete.
