# Round 226: SABA-B-8 CALM-1a: the `?` shortcut sheet, the footer button, and the removal of the permanent shortcut line

**Planned by:** B, at the round 225 → 226 planning, 2026-10-28. **Decisions:** D-29z266…D-29z271.
**Type:** feature stage (Studio UI). The scope is `app/**` inside the grants below.
**Read first:** `lessons.md`, in full (B, A and C). These apply directly:
- L1: the hidden-focusables probe;
- L3: the widest text state;
- L4: one element, one rule;
- L12: no class selectors;
- L14: unique names in a dialog;
- L23: collisions, already pre-checked;
- L26: docs cite only existing tests;
- L28: the doc status line;
- L32/L33: a failing covering test or a regression is a STOP;
- the new **L39** (screen budget).

**Why this round:**
- Saba's SABA-B-8 decision (2026-10-28) puts Calm Studio right after the PERF fix-up and before the next PERF task.
- Round 225 passed (C PASS, published `80fbb3b`), and no Critical, High or Medium finding is open against it.
- REGRESSION is due on or after 2026-10-30 (`regression-last.json` = 2026-10-27), so it is not due today.

**CALM-1 is split into two stages (D-29z267), with the full scope kept:**
- **1a (this round):** the sheet, `?`, the footer button, the removal of the permanent line, and the lane-move hint in the contextual line.
- **1b (round 227):** keys in every button tooltip, a matching `aria-keyshortcuts`, and tooltips derived from the same constant. 1b changes titles that 7 more test files pin; B's pre-check (`b-round-225/l23-precheck-1b.txt`) found 18 red tests. Keeping it out of this round keeps the round to one feature stage.

**Not this round:** title or aria changes on existing buttons (1b), the copy moves (CALM-2), the Overview (CALM-3), the first-run status text (CALM-2).

## 0. Baseline and scope

**Baseline:** HEAD = `80fbb3b99d6fe991c4e150a9cc05b1b7332d068c`. Gate 225 published it on both remotes. The tree is clean (`b-round-225/git-status-at-planning.txt` is empty).
- If HEAD differs, or the tree is not clean at the start: **STOP** (L11).
- The one exception is a root commit that touches only `package.json`, `package-lock.json`, `vite.config.ts` or `vitest.config.ts`. In that case, re-hash those 4 files and continue.

**Frozen:** `b-round-225-r226-tree-sha256.txt` holds 1,073 files: every tracked file except the 4 grants and the 4 root files. `sha256sum -c` gives rc 0 at planning (run it from `store/`). The frozen files include:
- `ui/Modal.tsx` and every other `components/ui/*`;
- `ArrangementTransport.tsx`, `ArrangementExportDialog.tsx`, `ArrangementLibrary.tsx`, `ArrangementOverview.tsx`;
- every other test;
- the protected auth/purchase files (`app/routes/studio.$productId.tsx`, `app/lib/auth.ts`, `AuthContext`, the `api.studio-token` route, `entry.server.tsx`).

**Root-owned, must equal HEAD:** `b-round-225-r226-root-or-granted.txt` (start hashes: `b-round-225-r226-root-files-start-sha256.txt`).

### 0.1 Grants (`b-round-225-r226-grants.txt`; start sha in `b-round-225-r226-granted-start-sha256.txt`)
| # | Path | What may change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | Only:<br>(a) the sheet's open state, a ref and its render;<br>(b) the `?` branch and the "sheet open" early return in `handleKeyDown` (§3.3);<br>(c) the footer (§3.4).<br>Nothing else: no other handler, no other title, no layout outside the footer. |
| 2 | `app/lib/arrangement/strings.ts` | **Add** one object, `studioShortcutSheetStrings` (§3.5). No existing literal changes. |
| 3 | `app/lib/arrangement/__tests__/workspace-strings-ui.test.tsx` | Only **WSU1** (§3.6). Its id stays the same. The other cases stay byte-identical. |
| 4 | `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` | Only **UC12**'s first assertion (§3.6). The fold part of UC12 and every other case stay byte-identical. |

**New files** (`b-round-225-r226-new-files.txt`):
- `app/lib/arrangement/shortcuts.ts`
- `app/components/arrangement/ArrangementShortcutSheet.tsx`
- `app/lib/arrangement/__tests__/shortcuts.test.ts`
- `app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx`
- `docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md`

Before writing them, A reads these templates and primitives:
- `.claude/prompts/new-component.md` and `studio-feature.md`;
- `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (keyboard → transport) and `GEORGIAN_DOCS.md`.

### 0.2 B's collision pre-check (L23, done)
B made a scratch copy (`git archive 80fbb3b`) and applied: the line removed, the lane-move hint in the contextual slot, and a skeleton sheet plus footer button rendered in the workspace. It then ran `app/lib app/components app/hooks app/routes`: **2 red, 2801 green** (`b-round-225/l23-precheck-1a.txt`). Only WSU1 and UC12 fail; both are granted.

The skeleton raised no repo-scan collision. These scans run over every arrangement file, so they cover the new component, and A keeps them green:
- `studio-focus-ring.test.ts` SFR1–SFR6;
- `panel-radius-ui.test.tsx`;
- `studio-theme-obsidian.test.tsx`;
- `timeline-cursor-map.test.ts` CU4;
- the `*-colour-ui` suites.

**Class rulings that keep them green (R-1…R-4):**
- **R-1.** No `focus:outline-none`. SFR2 allows exactly one, on the Export dialog container. So the sheet has **no** focusable container: initial focus goes to the search field.
- **R-2.** No own focus recipe. None of the SFR2 forbidden prefixes (`focus-visible:ring`, `focus:ring`, `ring-offset`, `focus-within:` …). The global `:focus-visible` rule draws the ring.
- **R-3.** No `rounded-panel` (the panel-radius counts are fixed). No `STUDIO_FOCUS_RING_INSET_CLASS` in the new code (SFR3 counts it per file).
- **R-4.** No hex colours and no arbitrary colour values. Tokens only (`text-foreground`, `text-muted`, `border-outline`, `bg-background`, `bg-surface`). No plus-shaped cursor.

## 1. Why (evidence)
- **Saba (2026-10-28, approved), decision 1.** Shortcuts move to a modal sheet over Studio:
  - it opens with `?` (code-based; never in text fields or while a dialog is open) and with a quiet footer button "Shortcuts ?";
  - Esc closes it;
  - the permanent shortcut line goes away.

  Source: loop policy "SABA-B-8 Calm Studio" and `docs/technical/studio-real-workspace/calm-studio-review.md` §1–§2 and §5.
- **Measured before** (B, Chromium, `b-round-225/probe-before.json`, deterministic bbox dump `bbox-before.json` = `bbox-before-run1.json`, 0 px across two runs; screenshots `before-full-{S0,S1}-{1440x900,1280x720}.png`):

| Viewport | footer h | `arrangement-shortcut-hint` | timeline scroller `clientHeight` |
|---|---|---|---|
| 1440×900 | 69 px (y 831) | one line, h 16, w 1070, y 878 | 496 |
| 1280×720 | 69 px (y 651) | one line, h 16, w 1070, y 698 | 386 |

  The same values hold in S0 (empty demo project) and S1 (one clip added and selected). The footer gap is `gap-y-1` (4 px), so removing the line frees **20 px**.

### 1.1 Why we missed it (SABA-B-8, policy 2026-10-28)
- **What happened:**
  - The shortcut line was born in the first rounds. Round 9 N1 called it "one line".
  - Rounds then appended keys to it, for example round 80 H1 (`· Ctrl+G / Ctrl+Shift+G · F2 · U`).
  - Helper sentences were added round by round (BPM, Loop, caption, detail).
  - Each round's C rows checked only that round's element. No task counted the persistent text on the whole screen.
  - DESIGN-UX-REVIEW (round 125, DUX-R-2) did propose a shortcut sheet, but it waited 10th in REVIEW-RECOMMENDATIONS behind the visual stages.
- **Phases that should have caught it:**
  - B's spec had no screen-budget row;
  - C verified features, not the screen;
  - the RETRO (rounds 200 and 215) had no whole-screen review;
  - the consult agents (`design-philosopher`, `first-visit-host`) were not asked about the whole screen.
- **Why not:** no rule required it. Each addition was small and justified locally.
- **The rule that catches it:**
  - **L39** (added to `lessons.md` in this planning step);
  - the policy blocks `workflow_policy.screen_budget_2026_10_28` and `retro_policy.whole_screen_review_2026_10_28` (D-29z265).

  C checks that L39 exists (row C-LESSON).

## 2. Reference: how Ableton Live 12 does it
Sources were fetched on 2026-10-28 (Live 12 manual, web):
- ch. 42 "Live Keyboard Shortcuts": https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/
- 2.2.2 "Info View": https://www.ableton.com/en/live-manual/12/first-steps/
- 3.2 "The Status Bar": https://www.ableton.com/en/live-manual/12/live-concepts/

The captures that `calm-studio-review.md` cites (`/home/claude/...`) do not exist on this runner, so they are not used.

| # | Behaviour | Live 12 source | Confirmed in Live | CZABA decision / deviation | C check |
|---|---|---|---|---|---|
| R1 | Where shortcuts live | ch. 42 (whole chapter); 42.26, 42.28 (menus) | The shortcuts are listed in the manual chapter, with Windows and Mac columns. Menus carry the commands. The fetched text describes **no** permanent on-screen shortcut strip ("the manual does not describe one", not "Live has none"). | An in-app modal sheet, searchable, grouped like ch. 42. **Better than Live:** the reference is inside the app and searchable; Live sends you to the manual. | C-ROWS, C-SEARCH |
| R2 | The `?` key | 2.2.2: "The Info View displays the name and function of whatever element of the UI that you hover over" and it can be shown or hidden "with the ? key". 42.1 lists "Hide/Show Info View — Shift?". | `?` toggles a hover-help panel. | **Deviation:** CZABA has no Info View; hover help is the tooltips. `?` toggles the shortcut sheet. Both are the "help" key, so the key stays recognisable (Saba decision 1). | C-OPEN |
| R3 | Closing | 42.1 "Close Window/Dialog — Esc" | Esc closes a window or dialog. | Match. Esc closes the sheet. | C-OPEN |
| R4 | Mac modifier | ch. 42 Mac column (Cmd for Ctrl, Option for Alt) | Two columns. | One column plus a subline, "Ctrl means ⌘ on Mac · Alt means ⌥". This is a deviation to save space; the handler already accepts Meta for Ctrl (`modifier = ctrlKey \|\| metaKey`, SW l.1766). | C-ROWS |
| R5 | Key set | 42.5 Undo Ctrl+Z, Redo Ctrl+Y / Cmd+Shift+Z; 42.16 Split Ctrl+E, Z / X zoom; 42.20 Home, Space | Live's keys. | The sheet lists **CZABA's** working keys only (§3.1). Where CZABA differs (for example, Redo also takes Ctrl+Shift+Z on Windows), the sheet shows CZABA's real keys. | C-ROWS |

**Deviations (with reasons):**
- `?` opens the sheet instead of an Info View (R2).
- English-only labels (policy).
- The shared SABA-B-4 focus style.
- Subline microcopy: the review proposed "Press ? or Esc to close". Initial focus is in the search field, where `?` types a character, so that sentence would be false half the time. The subline is "Ctrl means ⌘ on Mac · Alt means ⌥ · Esc closes." (D-29z271).
- The PageUp/PageDown row says "bigger step", not "−6 dB". This is native browser range behaviour. B measured 0 → −6 → 0 on the 60 dB video fader, which is 10 % of the range; a track fader's range differs.

## 3. Changes

### 3.1 `app/lib/arrangement/shortcuts.ts` (new): the one source
- **Export** `STUDIO_SHORTCUT_GROUPS`, a readonly array of `{ id, title, rows }`. Each row is `{ id, action, keys }`:
  - `keys` is a readonly list of display alternatives. Each alternative is rendered as one chip.
  - A row may also carry `ariaKeyShortcuts` (WAI-ARIA format, modifiers first, alternatives separated by spaces).
- **Also export:**
  - `findStudioShortcut(id)`;
  - `filterStudioShortcutGroups(query)`. It is a case-insensitive substring match on the action, the group title and the key text. A trimmed empty query returns all groups. Groups with no matching row are dropped.
- **Types:** strict TypeScript, no `any`, no assertions. `StudioShortcutId` is a string-literal union derived from the data (`as const` is not a type assertion; `satisfies` is allowed).
- **Rows, in this order and with exactly these keys.** The source column is B's evidence. A re-checks each one with grep and reports any row it cannot confirm as a **STOP**; it never invents a row.

| Group | id | action | keys | Source at `80fbb3b` |
|---|---|---|---|---|
| Transport | `play-stop` | Play / Stop | Space | SW l.1769 |
| | `back-to-start` | Back to start | Home | SW l.1993 |
| | `loop` | Loop the selection · Loop on / off | Ctrl+L | SW l.1849 |
| Edit | `undo` | Undo | Ctrl+Z | SW l.1835 |
| | `redo` | Redo | Ctrl+Shift+Z · Ctrl+Y | SW l.1835, l.1844 |
| | `copy-cut-paste` | Copy · Cut · Paste | Ctrl+C · Ctrl+X · Ctrl+V | SW l.1872, 1882, 1893 |
| | `duplicate` | Duplicate | Ctrl+D | SW l.1865 |
| | `delete` | Delete (the gap remains) | Delete · Backspace | SW l.2000 |
| | `select-all` | Select all clips | Ctrl+A | SW l.1860 |
| | `add-to-selection` | Add a clip to the selection | Ctrl+click · Shift+click | ArrangementClip l.410 |
| | `rename` | Rename a marker or group | F2 | MarkerRow l.660, GroupHeader l.179 |
| Time & clips | `split` | Split at the playhead or the selection | Ctrl+E | SW l.1828 |
| | `cut-time` | Cut Time (closes the gap on all tracks) | Ctrl+Shift+X | SW l.1882 branch |
| | `extend-all-tracks` | Extend the time selection to all tracks | Ctrl+Shift+L | SW l.1849 branch |
| | `nudge` | Nudge the selection | ← / → | SW l.2011 |
| | `edge-nav` | Previous / next marker or clip edge | Ctrl+← / Ctrl+→ | SW l.1901 |
| | `marker` | Add a marker at the playhead | M | SW l.1946 |
| | `add-sound` | Add the selected sound at the playhead | Enter · Double-click | SW l.2041, Library l.93/l.298 |
| | `lane-lock` | Move to another track, keep the time | Shift while dragging | SW l.491 |
| Grid & snap | `snap` | Snap on / off | G | SW l.1953 |
| | `grid-width` | Narrower / wider grid | 1 / 2 | SW l.1975 |
| | `triplet` | Triplet grid (needs a BPM) | 3 | SW l.1986 |
| | `snap-bypass` | Ignore snap while dragging | Alt + drag | Lane l.252, LoopBrace l.145 |
| | `envelope` | Envelope mode | A | SW l.1960 |
| Zoom & view | `zoom` | Zoom in / out | + / − · Ctrl+wheel | view.ts `timelineNavigationKey`; SW l.1574 |
| | `scroll` | Scroll left / right | Shift+wheel | native; B probe: `scrollLeft` 0 → 272 (1440) / 400 (1280) |
| | `zoom-range` | Zoom to the selection · Previous zoom | Z · X | view.ts `timelineNavigationKey` |
| | `fit` | Fit the whole project | Double-click the ruler or the overview | Ruler l.439, Overview l.299 |
| | `overview-scroll` | Overview: scroll 5 s | ← / → (overview focused) | Overview l.265–275; `TIMELINE_OVERVIEW_PAN_SECONDS` = 5 (view.ts l.16) |
| | `waveform-zoom` | Waveform zoom (view only, the sound does not change) | 1× button | toolbar 1× control |
| Tracks & mix | `group` | Group · Ungroup | Ctrl+G · Ctrl+Shift+G | SW l.1932 |
| | `fold` | Fold / unfold a group | U | SW l.1967 |
| | `solo-add` | Add another Solo | Ctrl+click S | Lane l.664 |
| | `fader-step` | Volume fader ±0.1 dB | ↑ / ↓ | `TRACK_VOLUME_DB_STEP` = 0.1; B probe: 0 → −0.1 |
| | `fader-page` | Volume fader: bigger step | PageUp / PageDown | native; B probe: 0 → −6 → 0 (video fader) |
| | `fader-fine` | Fine adjustment while dragging | Shift + drag | `FADER_SHIFT_FINE_DIVISOR` = 10 |
| | `fader-reset` | Reset to the default | Double-click | Lane l.802/l.835, Master l.211 |
| Library | `library-results` | Jump to the results · Move in the list | ↓ · ↑ / ↓ | Library l.273, l.286 |
| | `library-add` | Add to the active track | Enter | Library l.298 |
| | `library-clear` | Clear the search | Esc | Library l.278 |
| | `library-preview` | Preview from a point | Click the preview waveform · Space | LibraryPreview l.203 |
| General | `shortcuts` | Keyboard shortcuts | ? | new (§3.3), `ariaKeyShortcuts` = `Shift+/` |
| | `close` | Close a dialog | Esc | Modal / Export dialog |

**Coverage check:** these rows cover all 19 entries of the old line (`Space · Home · Ctrl+E · Ctrl+D · Ctrl+C / X / V · Ctrl+Shift+X · Ctrl+Shift+L · Ctrl+L · Ctrl+A · Delete / Backspace · Ctrl+Z / Ctrl+Shift+Z · ←/→ · Enter · +/− · Z/X · Ctrl+wheel · Ctrl+G / Ctrl+Shift+G · F2 · U`).

**`aria-keyshortcuts` for `?`:** the value is `Shift+/`. WAI-ARIA names physical keys, and this matches the US-layout physical combination. Search found no spec example for a shifted punctuation key, so this is recorded as an inference (D-29z271).

### 3.2 `ArrangementShortcutSheet.tsx` (new)
- **Base:** `Modal` from `~/components/ui` (frozen; use it, do not edit it) with:
  - `size="xl"`;
  - `showCloseButton={false}`;
  - `aria-labelledby` pointing at its own title id;
  - Modal's own Esc and backdrop close.
- **Content:**
  - the title "Keyboard shortcuts";
  - the subline (§3.5);
  - a search `<input type="search">` with an `aria-label` and a placeholder;
  - one close button, an icon with `aria-label` "Close (Esc)";
  - the groups in a two-column grid (`grid-cols-2`). At 1280×720 the Modal's own `max-h-[90vh]` scroll applies.
- **Rows:** each row shows the action in `text-sm text-foreground` and the keys as `<kbd>` chips: `font-mono text-xs`, `border border-outline`, `rounded-sm`, `px-1`, no fill and no brass. Group headings use the existing label recipe: `text-label font-medium uppercase tracking-label text-muted`.
- **No match:** one line, `Nothing matches “{query}”.`
- **Focus:**
  - On open, focus moves to the search field.
  - Tab and Shift+Tab cycle inside the sheet: last → first and first → last.
  - On close (Esc, the close button or the backdrop), focus returns to the element that was focused when the sheet opened, if it is still connected and enabled. If that element was `body` or `null`, or is gone or disabled, focus goes to the footer Shortcuts button.
  - Copy the Export dialog's pattern (l.137–241) locally. Do **not** edit `ui/Modal.tsx`. The checkpoint request (`b-round-225-checkpoint-request.md`) covers the shared hook.
- **Motion:** no new animation. The Modal's existing enter animation is kept.
- **Names:** unique accessible names inside the dialog (L14): "Close (Esc)" and the search label.
- **Row width (L3/L4, one rule):** the action text may wrap to a second line inside its row; key chips never truncate and never wrap inside a chip; no horizontal overflow of the sheet; the Modal's inner scroll handles height at 1280×720. The widest row is `fit` ("Fit the whole project" / "Double-click the ruler or the overview").
- **Glyphs (L20):** the subline adds U+2318 ⌘ and U+2325 ⌥. A checks them in Chromium. **Fallback ruling:** if either glyph renders without a real font glyph, the subline becomes "Ctrl means Cmd on Mac · Alt means Option · Esc closes." in this round. That is not a STOP; report which text shipped.

### 3.3 The `?` key (`StudioWorkspace.tsx`, `handleKeyDown`)
- **The `?` test:** `!ctrlKey && !metaKey && !altKey && (event.key === '?' || (event.shiftKey && event.code === 'Slash'))`.
- **The branch is placed after** the existing `exportOpenRef` / `exportKeyEventRef` / `isTypingTarget` early return. That gives "never in text or number fields, never while Export is open" for free.
- **It is ignored when:**
  - `event.target` is inside `[role="menu"]` (grid menu, marker menu);
  - `workspaceRef.current.isPointerGestureActive()`;
  - `event.repeat` is true. A held `?` toggles once (lesson: held-key behaviour).
- **When handled:** `preventDefault`, then toggle the sheet.
- **While the sheet is open,** a new early return goes **before** every other branch, Escape and Space included. The only work allowed there is the `?` toggle-close, when the target is not a typing target **and `event.repeat` is false** (so a held `?` opens once and stays open). Everything else returns. So Space, Delete, Ctrl+Z, M, G and the arrows do nothing in Studio, and Esc reaches only the Modal.
- **Layouts:** the code check (`Slash` + Shift) covers layouts where Shift+Slash yields another character. The key check (`'?'`) covers layouts where `?` is on another physical key (for example `Minus`).

### 3.4 Footer (`StudioWorkspace.tsx` l.2576–2657)
- **Remove** the `arrangement-shortcut-hint` `<p>` and its 19-key text. After the change, grep finds 0 hits for that testid in `app/`.
- **One contextual row** replaces the selected-clip line, the reserve and the lane-move hint. It is one `basis-full` flex row:
  - **left:** one text slot, `min-w-0 flex-1 truncate`;
  - **right:** the Shortcuts button, `shrink-0`.
- **Text-slot priority (L4, one rule):**
  1. **lane-move hint** (`arrangement-lane-move-hint`, including the refusal span) while `clipLaneDrag` is set;
  2. else the **selected-clip** line (`arrangement-selected-clip`, unchanged content and title);
  3. else the **reserve** (`arrangement-selected-clip-reserve`, aria-hidden).

  The testids, texts and classes inside each slot stay the same, except that the slot gets `truncate`.
- **Unchanged:** the status `<output>`, the range `<p>` and the selection-count `<p>` keep their order and markup.
- **The button:**
  - `type="button"`;
  - visible "Shortcuts" plus a `<kbd>` "?";
  - `aria-label` "Keyboard shortcuts (?)", `title` "Keyboard shortcuts (?)";
  - `aria-keyshortcuts` from the `shortcuts` row;
  - `aria-haspopup="dialog"`, and `aria-expanded` reflecting the sheet;
  - a quiet text recipe: `text-muted hover:text-foreground`, no border box, no fill.
  - **Height ≤ 16 px:** `leading-4`, no vertical padding; the `kbd` chip `leading-none`. The row must not grow.

### 3.5 Strings (`strings.ts`, add only)
`studioShortcutSheetStrings` holds:
- `title`: "Keyboard shortcuts"
- `subline`: "Ctrl means ⌘ on Mac · Alt means ⌥ · Esc closes."
- `searchLabel`: "Search shortcuts"
- `searchPlaceholder`: "Search: split, zoom, loop…"
- `noMatch(query)`: `Nothing matches “${query}”.`
- `close`: "Close (Esc)"
- `footerButton`: "Shortcuts"
- `footerButtonLabel`: "Keyboard shortcuts (?)"

The group titles live in `shortcuts.ts`.

### 3.6 Test updates (granted cases only)
- **WSU1:**
  - Replace every `arrangement-shortcut-hint` assertion with `queryByTestId('arrangement-shortcut-hint')` → null at all three points.
  - During the drag: the lane-move hint is present **and** `arrangement-selected-clip` is absent (priority). After release: `arrangement-selected-clip` is back.
  - The footer button is present at all three points.
  - The two hint texts stay exact. Rename the title only to "…and gives way to the selected-clip line on release".
- **UC12:** replace the first assertion with:
  - `findStudioShortcut('group')?.keys` contains `Ctrl+G` and `Ctrl+Shift+G`; `rename` has `F2`; `fold` has `U`;
  - `queryByTestId('arrangement-shortcut-hint')` is null.

  The fold part stays byte-identical.

### 3.7 New tests (ids are fixed; C greps them)
**`shortcuts.test.ts`:**
- **SC1:** group ids and titles in order. Row ids are unique and in the §3.1 order. Every row has ≥ 1 key.
- **SC2:** every one of the 19 old-line keys appears in some row.
- **SC3:** filtering:
  - `split` → contains `split` with `Ctrl+E`;
  - `cut` and `CUT` → contain `copy-cut-paste` and `cut-time`;
  - `ctrl+e` → contains `split`;
  - `zzzz` → `[]`;
  - `''` and `'  '` → all groups.

**`shortcut-sheet-ui.test.tsx`** (the real `StudioWorkspace`, harness copied from `workspace-strings-ui.test.tsx`):
- **SS1:** no shortcut hint. The footer button exists, with its name, `aria-keyshortcuts` and `aria-haspopup`.
- **SS2:**
  - `?` on body opens a `dialog` named "Keyboard shortcuts", and focus is in the search field.
  - Esc closes it, and focus goes to the footer button (body opener).
  - Opened from the focused footer button, Esc returns focus to it.
  - A click on the button opens the sheet.
- **SS3:** `?` does not open the sheet, and is not `defaultPrevented`, when:
  - focus is in the library search, the BPM field, the Clip Gain field or the marker name editor;
  - Export is open;
  - the modifier is Ctrl, Alt or Meta;
  - the target is inside `role="menu"`;
  - a pointer gesture is active.

  A held `?` (first press plus 3 events with `repeat: true`) opens the sheet once and leaves it open.
- **SS4:** `{key:'_', code:'Slash', shiftKey:true}` opens the sheet. `{key:'?', code:'Minus', shiftKey:true}` opens it. `{key:'/', code:'Slash'}` does not.
- **SS5:** with the sheet open, these change nothing:
  - Space: `isPlaying` stays false;
  - Delete on a selected clip: the clip count is the same;
  - Ctrl+Z: `undoLabel` is the same;
  - M: the marker count is the same;
  - G: snap is the same.

  `?` with focus on Close closes the sheet. `?` in the search field leaves the sheet open.
- **SS6:** the Tab trap. Tab from the last focusable goes to the first, and Shift+Tab from the first goes to the last. `document.activeElement` is always inside the dialog.
- **SS7:** in the sheet, `split` shows a row with `Ctrl+E`; `cut` shows `Ctrl+X` and `Ctrl+Shift+X`; `zzzz` shows `Nothing matches “zzzz”.`
- **SS8:** the contextual slot priority through a clip lane drag (as in WSU1), plus the Shortcuts button present throughout.
- **SS9 (L14):** inside the dialog, `getAllByRole('button', {name})` has length 1 for each button name. The `searchbox` is unique.
- **SS10:** a backdrop click closes the sheet. Focus returns per §3.2.

**Red proofs (named mutants, reported with logs in `a-round-226/mutants/`):**
- MU-a: remove the sheet-open early return → SS5 red.
- MU-b: drop the `isTypingTarget` order (put the `?` branch before it) → SS3 red.
- MU-c: remove either `repeat` guard (open path or close path) → SS3 red.
- MU-d: remove the focus restore → SS2 or SS10 red.
- MU-e: remove the Tab trap → SS6 red.
- MU-f: swap the slot priority → SS8 red.

### 3.8 Implementation doc 177 (`docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md`)
- Follow TEMPLATE.md, in Georgian.
- l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 226 PASS)` (L28).
- Cite only test ids that exist (L26).
- Record the deviations (§2) and the open checkpoint request.

## 4. A: checks to run (speed rule; no full suite, no `verify`)
1. Start checks:
   - `git rev-parse HEAD` = baseline, and `git status` is clean;
   - `sha256sum -c` of the frozen list, the grants and the root files is rc 0.
2. `npm run typecheck`, `npm run lint`.
3. `npx vitest run` on:
   - the 2 new files;
   - `workspace-strings-ui`, `track-group-collapse-ui`;
   - the scans `studio-focus-ring`, `panel-radius-ui`, `studio-theme-obsidian`, `timeline-cursor-map`, `affordance-colour-ui`, `label-status-colour-ui`, `drag-feedback-colour-ui`;
   - the keyboard suites that share `handleKeyDown`: `grid-snap-keys`, `status-announcement-ui`, `markers-ui`, `marker-edge-nav-ui`, `navigation-strings-ui`, `waveform-zoom`, `self-disabling-focus`;
   - `export-dialog-focus`, `export-dialog-tab-stops`;
   - `strings.test.ts`.

   Any red test, or one above 50 % of its timeout, is a STOP (L32).
4. Mutants MU-a…MU-f (§3.7).
5. Browser self-check at 1440×900 and 1280×720:
   - footer h, scroller `clientHeight`, and the contextual row height against §5 C-GEOM;
   - one screenshot with the sheet open at each viewport.

   Save the evidence in `a-round-226/`.
6. The code-reviewer subagent (≥ 3 files). Forward the findings and any Architecture note.
7. End: `git status` shows exactly the 4 grants as `M` and the 5 new files as `??`. Frozen `sha256sum -c` is rc 0. Write `a-round-226/changed-end-sha256.txt`.

## 5. C: acceptance (real Chromium, both viewports; S0 = fresh anonymous empty demo, S1 = one clip added and selected)
| Row | Check | Pass when |
|---|---|---|
| C-SCOPE | start and end | HEAD `80fbb3b`. Exactly 4 `M` + 5 `??`. Frozen `sha256sum -c` rc 0. The root files equal HEAD. Protected auth files unchanged. |
| C-GEOM | before/after | `arrangement-shortcut-hint` is absent. Footer h = **49 ± 1** (before 69). Scroller `clientHeight` = **516 ± 1** at 1440 and **406 ± 1** at 1280 (before 496/386), in S0 and S1. The contextual row is 16 ± 1 px high, and the button does not exceed it. |
| C-BBOX | D6 dump vs `b-round-225/bbox-before.json` (same script: `b-round-225/bbox-before.mjs`) | Every key ≤ 1 px, **except** these, each listed with its delta:<br>(a) the footer and its children: y and h follow the 20 px change;<br>(b) the scroller: h +20;<br>(c) the elements whose y or h changes by exactly 20 ± 1 because the column gained 20 px (C names them).<br>The `button:Shortcuts` key is new. Any other delta is a bug. |
| C-OPEN | real keys (`page.keyboard.press('Shift+Slash')`) | The sheet opens from: body, the focused timeline scroller, the focused overview, a focused ruler/transport button and the footer button (click). Esc closes it. Focus returns per §3.2. A backdrop click closes it. |
| C-NO-OPEN | the same key | `?` is typed in the library search and the marker name editor. In BPM and Clip Gain, the sheet does not open and the field keeps focus. The sheet does not open while Export or the grid menu is open, or during a clip drag. A held `?` (keydown held ≥ 1 s, auto-repeat) toggles once. |
| C-LAYOUT | CDP `Input.dispatchKeyEvent` | `key:'?', code:'Minus', shift` opens the sheet. `key:'_', code:'Slash', shift` opens it. `key:'/', code:'Slash'` does not. |
| C-INERT | sheet open | Space does not play (transport unchanged). Delete leaves the clip. Ctrl+Z leaves `Undo`'s title unchanged. M adds no marker. G leaves Snap unchanged. |
| C-ROWS | §3.1 table | Every row is present in its group, in order, with its keys, and there are 0 extra rows. **Each row is performed once in the real Studio (sheet closed) and has its stated effect (0 rows "do nothing").** Rows that need a state (group, marker, BPM for `3`) get it first. |
| C-SEARCH | the sheet | `split` → Ctrl+E. `cut` → Ctrl+X and Ctrl+Shift+X. `zzzz` → `Nothing matches “zzzz”.` |
| C-A11Y | the sheet and the footer button | `role=dialog`, `aria-modal`, the name "Keyboard shortcuts". Tab and Shift+Tab stay inside. All text ≥ 12 px. Action text, chips and subline ≥ 4.5:1 (measured). **The footer button text and its `?` chip ≥ 4.5:1 at rest and on hover (measured; the old line's `text-dim` was 3.67:1, DUX-B-1).** Keyboard focus shows the global ring (outline ≥ 1 px painted, brass); a pointer press shows none. The names are unique. **Glyphs:** CDP `getPlatformFontsForNode` on the subline shows real glyphs for ⌘/⌥, or the §3.2 fallback text shipped. **Widest row** `fit` at 1280×720: chips are not truncated, there is no horizontal overflow, and wrapping is inside the row only. |
| C-SLOT | clip lane drag | During the drag the lane-move hint shows in the contextual row and the selected-clip line does not. Footer h is constant (Δ ≤ 1 px) at drag start, at the Shift toggle and at release. The refusal text (drag onto the video lane) fits on one line at 1280, or is truncated with nothing wrapping. |
| C-BUDGET | screen budget (L39) | Persistent text lines outside the timeline content: S0 and S1, before vs after, at both viewports. Expected: −1 line (the 19-key line) and +1 short label inside an existing row. Full-window screenshots after, against B's `before-full-*.png`. |
| C-REF | §2 R1–R5 | Each row is a match or a listed deviation. Any other difference is a bug (Medium if the user must learn it, else Low). |
| C-LESSON | `lessons.md` | L39 exists, and §1.1 is present. |
| G226-3 | auth guard, unstubbed | `/studio/middle-east`: "Sign in required", 0 `audio`. `/api/studio-token` with no header → 401. |
| LAB-SMOKE-226 | anonymous `/studio-lab` | Add → 1 clip. Export WAV equals round 225 (4,864,896 frames, 24-bit, 48 kHz, stereo). 0 page errors (known C-R223-OBS-01 cold-load noise excepted, with a fresh context recheck). |
| AN-REVIEW-226 | doc 177 | l.4 is byte-exact. Every cited SC/SS/MU id exists. |
| gate | full suite, build, lint, verify, e2e smoke | Not claimed by C (gate rows). |

## 6. Neighbouring behaviour that could break (C probes these first)
- The global key handler: Space, Delete, Ctrl+Z and the arrows must still work when the sheet is **closed** (C-ROWS covers them).
- Esc with the sheet closed still clears the library search and still returns the floating video.
- The footer layout at 1280 with a range plus a multi-selection: the range and count lines wrap as before.
- The perf harness is not run this round. The 20 px taller scroller may change the PERF-1b counts. b-ii re-baselines, and this is recorded as R226-PERF-LAYOUT-WATCH, not a C row.

## 7. Outcomes for B's next planning
1. **C PASS, before 2026-10-30:** round 227 = CALM-1b, using B's 1b pre-check (`l23-precheck-1b.txt`). The new Low **B-R225-BACK-TO-START-KEY** ("Back to start (0)" names a key that does not exist; Home is the binding) is fixed there.
2. **C PASS, on or after 2026-10-30:** REGRESSION first, then CALM-1b.
3. **C FAIL:** B rules on each finding (L10). The fix-up stays in these grants.
4. **A STOP:** B rules before re-dispatch.
