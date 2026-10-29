# Round 256: SABA-B-9 stage 1 — the centre transport group, a Stop button and the honest Play label

SABA-B-10b is **done**: C round 255 passed, and gate 255 published `a061d52`. This round starts **SABA-B-9**, which is approved by Saba (policy section "SABA-B-9/10/11", decision 4). It is split into two stages (D-29z482):

- **Stage 1 (this round):**
  - the toolbar regroups into three groups, with the transport group in the centre;
  - a new **Stop** button, which also takes double-click Stop (moved from 10b, D-29z469);
  - the Play button stops turning into "Pause" (closes B-R249-PAUSE-LABEL);
  - the `?` sheet's back-to-start row gains "Double-click Stop".
- **Stage 2 (a later round):** master volume moves to the workspace bottom-right corner. It is not in this round, and `StudioWorkspace.tsx` and `ArrangementMaster.tsx` are frozen. The reason for the split: moving the master changes the 35 px header and every y below it, which is a separate set of neighbours (library inset, video dock, layout tests).

**Planned by:** B, at the round 255 → 256 planning, 2026-10-29 (≈ 22:00 UTC). **Decisions:** D-29z481…D-29z490.

**Read first:**
- `lessons.md` in full. These lessons apply directly:
  - L3, L23, L29 and L39: the pre-check numbers below come from them;
  - L12: no class selectors, and every testid you change is re-grepped;
  - L28: doc status line;
  - L43–L45: this task closes an L43 case;
  - L47 and L50: focus.
- `docs/technical/studio-real-workspace/transport-grid-review.md` §1 and §4.1.
- `reference/youtube/SABA-B-9-10-11-transcripts.md` § "SABA-B-9".
- Primitives: `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md`.

## 0. Baseline and scope

**Start state:**
- **HEAD** = `a061d524d14af347119f06b239b77747c36362a0`, the gate 255 publication (`b-round-255/head-at-planning.txt`).
- **`git status --short --untracked-files=all` is empty** (`b-round-255/git-status-at-planning.txt`, 0 lines).
- **STOP (L11)** if HEAD or status differ, or if any hash check below fails. Exception: a root commit that touches only the 4 root files. In that case, re-hash those files and continue.

**Hash checks** (run from `store/`; each gave rc 0 at planning):
- **Frozen tree.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-255-r256-tree-sha256.txt` covers **1,099** files: `git ls-files` (1,115) minus the 4 root files and the 12 granted files that exist.
- **Protected files.** The 7 protected files are inside the frozen list, and each also gives `git diff --quiet HEAD` rc 0:
  - `app/routes/studio.$productId.tsx`
  - `app/routes/api.studio-token.ts`
  - `app/routes/account.downloads.tsx`
  - `app/lib/__tests__/download-routes.test.ts`
  - `app/lib/auth.ts`
  - `app/contexts/AuthContext.tsx`
  - `app/entry.server.tsx`
- **Root files.** `b-round-255-r256-root-files-start-sha256.txt` covers `package.json`, `package-lock.json`, `vite.config.ts` and `vitest.config.ts`. No dependency is needed: `Square` is in the installed `lucide-react`.
- **Grant start state.** `b-round-255-r256-grants-start-sha256.txt` covers 12 files, with a copy in `b-round-255/r256-granted-start/`.

### 0.1 Grants (`b-round-255-r256-grants.txt`, 14 paths)
| # | Path | What may change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementTransport.tsx` | §2.1–§2.4: the three groups, the Stop button, the Play contract, `data-testid` hooks. Nothing else: zoom, Follow, Undo, Split, Delete, Loop, Fit and Export keep their handlers, names, titles and classes. |
| 2 | `app/lib/arrangement/strings.ts` | In `studioPlaybackStrings` only: `pauseLabel`/`pauseTitle` are **deleted**, and `stopLabel: 'Stop'` and `stopTitle: studioShortcutTitle('Stop', 'play-stop')` are added (→ `'Stop (Space)'`). No other key changes. |
| 3 | `app/lib/arrangement/shortcuts.ts` | Row `back-to-start`: `keys` becomes `['Home', 'Double-click Stop']`. Its `action` and `ariaKeyShortcuts` (`'Home'`) stay byte-identical. No other row changes. |
| 4 | `__tests__/transport-surface-ui.test.tsx` | Collision C1. The toolbar lookup (l.174–178 finds the class `flex-wrap`) moves to `data-testid="arrangement-transport"`. TS1 counts become 13 buttons and 11 plain. TS2 is rewritten to the Play contract of §2.3, with no `Pause`. TS6 gains the Stop glyph, or a new TS row does. |
| 5 | `__tests__/render-budget.test.tsx` | Collision C2. The 8 `name: 'Pause'` clicks become `name: 'Stop'`; same semantics (stop). Test titles "Play → Pause → Play" become "Play → Stop → Play". Budgets, timeouts and assertions are unchanged. |
| 6 | `__tests__/master-ui.test.tsx` | Collision C3. l.651 `'Pause'` becomes `'Stop'`. Nothing else. |
| 7 | `__tests__/bars-ruler-ui.test.tsx` | Collision C4. The `transportLabel` helper (l.169–172) and its 3 uses (l.273, 283, 292) read the playing state from the Play button's `data-playing` (§2.3) instead of the Pause name. The asserted states are unchanged. |
| 8 | `__tests__/strings.test.ts` | Collision C5. ST10 key list and literals: `pauseLabel`/`'Pause'` and `pauseTitle`/`'Pause (Space)'` are replaced by `stopLabel`/`'Stop'` and `stopTitle`/`'Stop (Space)'` (l.667–670). |
| 9 | `__tests__/grid-snap-ui.test.tsx` | Collision C6. GS14 ("keeps the transport toolbar unchanged and without a Snap control") reads the new structure: 13 buttons, and still no Snap control in the toolbar. |
| 10 | `__tests__/mode-toggle-colour-ui.test.tsx` | Collision C7. The transport-button lookup helper (DXT2 failed "transport button Delete missing") searches the whole toolbar, not its direct children. Assertions unchanged. |
| 11 | `__tests__/navigation-strings-ui.test.tsx` | Collision C8. NS1 (an index-based order: it got `'Play'` where it expected `'Back to start'`), NS2 (helper) and NS5 (titles and `aria-keyshortcuts` from the shortcut source: add Stop → `play-stop` / `'Space'`). Every existing name, title and key assertion stays. |
| 12 | `__tests__/shortcut-sheet-ui.test.tsx` | Collision C9. SS-T1's expected keys for `back-to-start` become `['Home', 'Double-click Stop']`. |
| 13 | `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` (**new**) | TC1–TC9 (§2.6). |
| 14 | `docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md` (**new**) | Implementation doc. l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 256 PASS)` (L28). It has the 7 TEMPLATE headings in order. |

**Rules for the grants:**
- **Every other file is frozen,** including `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementMaster.tsx`, `app.css` and `e2e/**`. **No context change is needed:** `togglePlayback`, `returnToStart` and `isPlaying` are already in `useArrangement()` (`ArrangementContext.tsx` l.305–309, l.1370–1381, l.1474–1477).
- **No collision row may lose an assertion.** A rewrite keeps or replaces each assertion with an equal or stronger one. A test whose only change is a removed assertion is a Medium bug (policy, SABA-B-10a). A reports every collision hunk old → new.
- **A collision outside C1–C9 is a STOP (L11, L23),** with the hit list. A must not edit a frozen file.

### 0.2 B's pre-check (L3, L23, L29, L50)
Everything below is in `b-round-255/probe/`.

**1. HEAD geometry (`toolbar-head.json`, `head-*.png`)**

| Viewport | Toolbar height | Rows | Header height |
|---|---|---|---|
| 1440×900 | 49 px | 1 | 35 px |
| 1280×720 | 87 px | 2 | 35 px |

- At 1280, the 1440 row's right group (Follow … Export) wraps to row 2. Play is at x 12, far left.
- The master control sits in the header: x 766 at 1440, x 606 at 1280.

**2. Sketch geometry (`sketch2.json`, `sketch2-*.png`)**
- **Natural group widths:** edit (left) 409 px, transport (centre) 487 px, view (right) 432 px.
- **One centred row needs about 1,399 px:** 2 × 432 + 487 + 2 × 12 gaps + 24 padding.
- **1440:** grid `1fr auto 1fr`, height **49**, centre offset **1 px**.
- **1280:** two rows. The centre group is alone in row 1; row 2 has edit at the left and view at the right. Height **87** (= HEAD), centre offset **1 px**, and row 2 does not overlap (edit ends at 421, view starts at 836).
- **HEAD at intermediate widths (`toolbar-head-mid.json`):** 49 px at 1400 and 1366, and 87 px at 1350 and 1340. HEAD's one-row content is about 1,350 px wide: the 1440 `ml-auto` gap is 90 px. This gives the growth window in §2.2.
- **One row at 1280 is impossible without removing text.** The first sketch (`sketch.json`) overflowed: the view group ended at x 1,322 of 1,268, and the clock wrapped to 46 px. It would need at least about 96 px less text, for example Undo/Redo labels moved to tooltips, or the Zoom word and readout dropped. SABA-B-8's rule keeps the "transport text buttons", so this is a Saba question (§5, D-29z483).

**3. Scratch applied, with typecheck and the arrangement suites (L23)**
- Copy: `git archive HEAD` in `/tmp/b255-scratch`. Diff: `probe/sketch.diff`, 325 lines. It is a sketch, not a prescription.
- **`tsc`:** the only errors are `pauseLabel`/`pauseTitle` in `bars-ruler-ui` and `transport-surface-ui`. That is the deleted-export clause.
- **`vitest run app/lib/arrangement app/components/arrangement app/contexts`:** 169 files, 2,504 tests. It found **8 files / 23 tests** failing (C1–C8, `probe/scratch-collisions.txt`).
- **With the sheet key:** `shortcut-sheet-ui` SS-T1 fails (C9). `shortcuts.test` and `insert-marker-ui` stay green, including IM1 and IM7.
- `e2e/**` has no `Pause` or Play-name pin (grep).

**4. Sketch in Chromium (`stop-probe-sketch.json`, `stop-sheet-*`, `stop-full-*`)**
- **Behaviour:**
  - Play → playing.
  - Play again → still playing: the position goes on from 0.882 to 1.413, no restart.
  - Stop → stopped at 1.471, and the position is frozen.
  - Stop again → no change.
  - Double-click Stop → 00:00.000, marker 0.000.
  - Play, then double-click Stop while playing → stopped at 00:00.000.
- **Tab order from Undo:** Undo, Split, Delete, Follow, Play, Stop, Back to start, Zoom slider, Fit, Export. Redo, Loop and zoom-range are disabled in that state.
- **Sheet:** `back-to-start` wraps to 40 px. `scrollHeight` goes 1,260 → **1,280**, `clientHeight` stays 808 / 646, no horizontal overflow, and every other row equals HEAD (`stop-probe-head.json`).

**5. L50 grep**

```
grep -nE "onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)" app/components/arrangement/ArrangementTransport.tsx app/lib/arrangement/shortcuts.ts app/lib/arrangement/strings.ts
```

4 hits, each ruled:
- **l.119** `handoff.partner.focus()`: the Undo/Redo/Delete/Zoom-back handoff. It is kept as is; TC9 covers it.
- **l.142** `{isPlaying ? (`: the Play/Pause icon swap. It is removed, because Play no longer swaps (§2.3). No element unmounts.
- **l.274** Follow text: same element, text only, unchanged.
- The 4th hit is `shortcuts.ts` l.197 (the `shortcuts` row object, matched by `?` in its keys). It is data, not a render.

The Stop button never unmounts or disables. So a double-click leaves focus on Stop (L47 target: Stop itself), and C-FOCUS-256 checks it.

**6. Live 12 manual, re-fetched 2026-10-29**
- Ch. 3 "Live Concepts" > The Control Bar: the nine-section order.
- 6.3 "Transport and Playback", quoted in §1.

## 1. Reference: how Ableton Live 12 does it

**Sources:**
- **[LC]** <https://www.ableton.com/en/live-manual/12/live-concepts/>, "The Control Bar" (WebFetch 2026-10-29).
- **[AV]** <https://www.ableton.com/en/live-manual/12/arrangement-view/>, 6.3 "Transport and Playback" (capture `b-round-71/ableton-arrangement-view-20261021.txt`, re-read 2026-10-29).
- **[m84w]** Ableton's official "Learn Live: Transport bar and Follow behavior", <https://www.youtube.com/watch?v=m84wUU8CQnY>, 0:00–1:50 (root's summary in `reference/youtube/SABA-B-9-10-11-transcripts.md` l.35).
- Live version 12.

| # | Behaviour | Live source | Confirmed in Live | CZABA decision / deviation | C check |
|---|---|---|---|---|---|
| R1 | Where the transport sits | [LC] | Nine sections in order: … **Follow and Arrangement Position → Transport Controls** → Automation → **Arrangement Loop Settings** …; the transport is section 5 of 9. The manual says nothing about geometry. | Centre group **Follow · clock · Play · Stop · Back to start · Loop**, geometrically centred (Saba decision 4). Deviation ⚖ (review §4.1): geometric centre, where Live only orders the sections. | C-LAYOUT-256 |
| R2 | Separate Play and Stop | [AV] 6.3: "You can click the Play button to start playback; to stop playback, click the Stop button." Figure: "The Play and Stop Buttons in the Control Bar". [m84w] 0:00–1:50. | Yes | Match: two buttons, Stop is new. | C-STOP-256 |
| R3 | Space | [AV] 6.3: "you can use the space bar to toggle playback on or off." | Yes | Unchanged from 10a: Space plays from the insert marker or the selection start, and Space stops. | C-KEYS-256 |
| R4 | Double-click Stop | [AV] 6.3: "To return the insert marker to the starting play position, you can double-click the Stop button or press the Home key." | Yes | Match: double-click = `returnToStart` (Home): marker 0 and playhead 0. While playing it also stops: the first click stops, the double-click returns. | C-STOP-256 |
| R5 | Play pressed while playing | Not found. I searched [AV] 6.3, [LC] and WebSearch (forum threads only, `forum.ableton.com/viewtopic.php?p=1822403` is a feature *wish*). | **Unconfirmed** | Smallest honest default: **no-op** (playback continues, no restart). Play is never a second Stop (B-R249-PAUSE-LABEL). Saba question SABA-Q-9-TRANSPORT (a). | C-STOP-256 |
| R6 | Single click on Stop while stopped | Not in [AV]. A third-party Native Instruments controller guide says Stop while stopped relocates to the song start; that is a hardware mapping, not Live's UI. | **Unconfirmed** | **No-op.** Only the double-click returns, which is R4's documented gesture. SABA-Q-9-TRANSPORT (b). | C-STOP-256 |
| R7 | The Play button shows that it is playing | No text source. Live's Play button lights while playing; that is common knowledge, not a cited source. | **Unconfirmed** | A visible on-state while playing, using theme tokens only (§2.3). Its look is SABA-Q-9-TRANSPORT (d). | C-ONSTATE-256 |
| R8 | Arrangement Position next to the transport | [LC] section 4, "Follow and Arrangement Position". [m84w]: the display shows bars.beats.sixteenths. | Yes | Position: match, the clock is in the centre group. Content: deviation, the clock stays min:sec (SABA-B-11 keeps the min:sec ruler; the bars display is not in this stage's scope). | C-LAYOUT-256 |
| R9 | No Back-to-start button in Live | [LC]/[AV]: Home key and double-click Stop. | Yes | Deviation ⚖: the ↤ button stays, because Saba kept the transport text buttons (CALM rules) and listed "back to start" in the centre group (decision 4). | – |
| R10 | Undo/Redo/Split/Delete | Live: the Edit menu, not the Control Bar. | Yes | Deviation ⚖: they stay as toolbar buttons, in the left group (review §4.1). | – |

**Deviations needing Saba (L44):** R5, R6, R7, R1-geometry and the 1280 layout (§2.2). They are collected in SABA-Q-9-TRANSPORT (§5).

**Better than Live:** Stop's double-click is also listed in the `?` sheet next to Home. In Live it is only in the manual.

## 2. A: what to build

### 2.1 Three groups (ArrangementTransport.tsx)
- **The toolbar root** gets `data-testid="arrangement-transport"`. Each group gets a testid:
  - **`arrangement-transport-edit`** (left): Undo, Redo, separator, Split, Delete. Their handlers, `w-28`, handoff and titles are unchanged.
  - **`arrangement-transport-centre`** (centre): **Follow · position clock (with `/ end`) · Play · Stop · Back to start · Loop**, in that DOM order.
  - **`arrangement-transport-view`** (right): Zoom label, slider and readout · zoom-to-selection · Zoom back · Fit · separator · Export.
- **DOM order is edit, centre, view at every width.** Tab order follows the DOM. You must not use CSS `order` or a per-breakpoint DOM swap: either one would make the focus order differ from the DOM, or remount on resize. At 1280 this means Tab visits row 2 left, then row 1, then row 2 right. That is listed in SABA-Q-9-TRANSPORT (c).
- **Separators:** HEAD has four, all non-focusable `div`s: after the clock (l.165), after Redo (l.198), after Delete (l.228) and before Export (l.343).
  - The ones after the clock and after Delete go, because the groups now separate those places.
  - The one after Redo (edit group) and the one before Export (view group) stay.

### 2.2 Geometry (measured bound, D-29z483)
**Wide (one row):** when one row fits, the toolbar is one row with the centre group geometrically centred (`1fr auto 1fr` or equivalent). The edit group is at the start and the view group at the end.
- **1440×900:** height **49 px** (= HEAD).
- The centre of the centre group is within **±24 px** of the toolbar centre (sketch: 1 px).

**Narrow (two rows):** when one row does not fit (below about 1,400 px; A picks the breakpoint and reports the measured threshold):
- the centre group is alone in row 1, centred within **±24 px**;
- row 2 has edit at the start and view at the end;
- **1280×720:** height **≤ 87 px** (= HEAD; sketch 87).

**At every width from 1280 to 1440:**
- the toolbar height is either the one-row height (49 px) or the two-row height (≤ 87 px), never more;
- no group overlaps another, and nothing overflows (`scrollWidth = clientWidth` on the root and on each group);
- the clock never wraps (its height equals its one-line height).

**The binding heights are the two canonical viewports:** 1440 = 49 px and 1280 ≤ 87 px. Saba's wording is about 1280.

**C measures** at 1440, 1280, 1366, A's reported breakpoint, and 1 px below that breakpoint.

**A known growth window (D-29z483).** HEAD stays one row down to about 1,351 px: it is 49 px at 1366 and 1400 and 87 px at 1350 and 1340 (`probe/toolbar-head-mid.json`). The centred three-group row needs about 1,399 px. So between about 1,351 and 1,398 px, the new toolbar is two rows (87 px) where HEAD is one (49 px).
- This is a consequence of Saba's centre decision plus the CALM keep-rule. It is not a bug.
- It is part of SABA-Q-9-TRANSPORT (c).
- C records the 1366 heights of HEAD and of the new build as evidence, not as a FAIL.

**Everything below the toolbar keeps its y (±1 px) at 1440 and 1280:** library top, video dock top, ruler top, first lane top. This follows from the equal heights; C-LAYOUT-256 measures it.

**Classes:** Tailwind only, with existing tokens and no new CSS (`TAILWIND_FIRST.md`). An arbitrary breakpoint such as `min-[1400px]:` is allowed.

### 2.3 Play: an honest label (closes B-R249-PAUSE-LABEL)
**The accessible name never changes:**
- `aria-label` is always `studioPlaybackStrings.playLabel` (`'Play'`).
- `title` is always `playTitle` (`'Play (Space)'`).
- `aria-keyshortcuts` is `studioShortcutAria('play-stop')` (`'Space'`).
- The `Pause` icon and its import are removed. The glyph is always `Play`.

**Click behaviour:**
- **While stopped:** a click calls `togglePlayback()`, so it plays from the selection start or the insert marker (10a, unchanged).
- **While playing:** a click is a **no-op**: no stop, no restart, no status write, no history entry (R5).

**`data-playing`:** the button has `data-playing="true"` while playing and `"false"` when stopped. Tests use it (C4) and C reads it. It is not a class selector.

**On-state:** while playing, Play shows a visible on-state that differs from stopped.
- Use existing theme tokens only; no new token and no hardcoded colour.
- A picks the treatment. (The toolbar's Loop/Follow "on" fill, `bg-foreground/20`, would put Play's `text-background` glyph below 3:1, so it does not fit as is.)
- Glyph against button fill must be **≥ 3:1** in **both** states (WCAG 1.4.11). Measure it in Chromium and put the numbers in the report (L15).
- The 32 px round shape and the position do not change between states (no layout shift).

### 2.4 Stop: the new button
**Placement and labels:**
- It sits right after Play in the centre group.
- `type="button"`, a lucide **`Square`** glyph (`aria-hidden`, sized like the other 3 px/4 px glyphs: A picks and TS6 pins it), and the toolbar's `toolButtonClass` square 32 px form (`w-8 justify-center px-0`).
- `aria-label` = `stopLabel` (`'Stop'`), `title` = `stopTitle` (`'Stop (Space)'`), `aria-keyshortcuts` = `studioShortcutAria('play-stop')`.
- **Persistent text:** the button is icon-only, so it adds **0** persistent text lines (L39).
- **It is never disabled.** A double-click must work while stopped.

**Click behaviour:**
- **While playing:** a single click stops (`togglePlayback()` under an `isPlaying` guard). The playhead stays where playback stopped, and the insert marker is unchanged (10a).
- **While stopped:** a single click is a **no-op**: position, marker, status and history are all unchanged (R6).
- **Double-click (`onDoubleClick`):** calls `returnToStart()`, so marker = 0 and playhead = 0, with no history entry. It works while stopped and while playing (the first click has already stopped).
  - The event sequence is `click`, `click`, `dblclick`. TC5 proves the first click's stop has flushed before `dblclick`, so the end state is stopped at 0 and never playing.
- **Status (L51):** `returnToStart` writes no status (INFO-B249-STALE-MARKER-STATUS, closed by the visible marker), and Stop writes none either.
  - The only status that can be on the line is the stop status 10a writes through `togglePlayback` (C-STOP-*-253).
  - The clobber row: Play → Stop → double-click Stop. The final status text is read 500 ms after the last event. It equals the text the same sequence gives with Space → Space → Home at HEAD (C-STATUS-256).
- **Keyboard:**
  - **Enter** on a focused Stop is a single click; held Enter auto-repeat is ignored (`preventRepeatedEnterKeyDown`, as on Undo).
  - **Space** on a focused Stop or Play gives exactly one toggle: the window handler acts on keydown, and the keyup `preventDefault` stops the native button click. TC7 proves this.
  - There is no keyboard double-click. Home is the keyboard path (sheet row).

### 2.5 Sheet
- `back-to-start` keys are `['Home', 'Double-click Stop']`.
- **The measured bound (sketch, D-29z484):**
  - `scrollHeight` ≤ **1,280** at both viewports, with `clientHeight` 808 / 646;
  - no horizontal overflow;
  - `back-to-start` ≤ 40 px;
  - every other row's height equals HEAD's.
- No new row. The play-stop row text is unchanged ("… · Stop" already names the stop action).

### 2.6 Tests: new file `transport-centre-ui.test.tsx`
Use the existing arrangement harness pattern: the FakeAudioContext stubs, as `insert-marker-ui.test.tsx` does. Find elements by role, name, text or `data-testid` only (L12). Use `describe(…, { timeout: 15_000 })`.

| Row | Asserts |
|---|---|
| TC1 | The groups' testids exist, and their buttons and controls are in the §2.1 DOM order. The centre group's accessible names are `Follow`, `Play`, `Stop`, `Back to start`, `Loop` in order, and the position clock sits between Follow and Play. |
| TC2 | Insert marker at 2 s. Clicking Play while stopped starts playback from 2.000. Clicking Play while playing calls no stop and no restart: `isPlaying` stays true, the start count of the fake source graph is unchanged, `data-playing` is `"true"`, and the status and undo label are unchanged. |
| TC3 | Clicking Stop while playing stops: `data-playing` becomes `"false"`, the position is frozen at the stop point (L52: move the store first and assert that it moved), and the marker is still 2.000. The next Space plays from 2.000. |
| TC4 | Clicking Stop while stopped (marker 2, playhead 3.4) changes nothing: position, marker, status text and undo label are all unchanged. |
| TC5 | `dblClick` on Stop. While stopped (marker 2, playhead 3.4): marker 0, position 0. While playing (fire the real order `click`, `click`, `dblclick`): stopped, marker 0, position 0, never restarted. In both cases the undo label is unchanged. |
| TC6 | Names, titles and `aria-keyshortcuts`: Play is `Play` / `Play (Space)` / `Space` in both states, and Stop is `Stop` / `Stop (Space)` / `Space`. No button named `Pause` exists in either state. |
| TC7 | Focus on Play, then on Stop. A Space keydown gives exactly one toggle per press (the window handler), and `repeat: true` keydowns are ignored. jsdom does not synthesise a click from Space keyup, so the "no second native click" half is proven only in the browser by C-KEYS-256. |
| TC8 | Enter on Stop while playing stops it once. Held Enter (the first press plus 3 `repeat: true` keydowns) on Stop and on Play changes nothing beyond the first press. |
| TC9 | Focus target (L47): after double-clicking Stop, `document.activeElement` is Stop. The Undo → Redo handoff (l.103–121) still works. |

**Red-proofs (named mutants on a scratch copy; report each red row):**
- **M1:** Play calls `togglePlayback` unconditionally. TC2 must go red.
- **M2:** `onDoubleClick` removed. TC5 must go red.
- **M3:** Stop toggles while stopped. TC4 must go red.
- **M4:** Play's label switches back to `Pause` while playing. TC6 must go red.
- **M5:** the clock moved out of the centre group. TC1 must go red.

### 2.7 Checks A runs (speed rule: no full suite, no `verify`)
1. The start state of §0.
2. Run `npm run typecheck` and `npm run lint`.
3. Run `npx vitest run` on the 9 collision files, the new file, `shortcuts.test.ts` and `insert-marker-ui.test.tsx`.
   - Report each file's time against its declared timeout (L31).
   - Any test above 50 % is a STOP (L11).
4. Run the mutants M1–M5.
5. **Chromium, both viewports:**
   - the §2.2 geometry at 1440, 1280, 1366, your breakpoint and 1 px below it;
   - the §2.3 on-state contrast in both states;
   - one Play → Stop → double-click run.
6. **code-reviewer:** 3 or more files changed, so it is required. Pass every Architecture note to B.
7. **Re-check the hashes:** the frozen tree and the protected files give rc 0 after your edits, and the root files are unchanged.
8. **Report `a-round-256.md`:**
   - each collision hunk, old → new;
   - the measured breakpoint;
   - the contrast numbers;
   - test times;
   - mutants;
   - reviewer notes;
   - a STOP at the top if there is one.

## 3. C: acceptance
Run each browser row at **1440×900 and 1280×720**, in a fresh context. Add 1366, A's breakpoint and 1 px below it where a row says so.

**Setup:** open `/studio-lab` and wait for `Demo collection ready` (L48). Click `demo-stem-pulse`, then Add, and blur. Set the insert marker at 2.000 by clicking an empty lane at the 2 s x, as in C round 254. A HEAD control is needed (a `git archive HEAD` copy on a scratch port, as in round 255); stop it afterwards.

| ID | Check | Pass |
|---|---|---|
| C-SCOPE-256 | HEAD, status, hashes | <ul><li>HEAD is `a061d52`.</li><li>The status lists only granted paths.</li><li>The frozen tree (1,099), root and protected checks give rc 0.</li><li>Re-check at the end of the phase.</li></ul> |
| C-UNIT-256 | The §2.7.3 files, run alone | All green. Report the counts. Re-run M1 and M4 yourself on a scratch copy: both must be red. |
| C-COLLISION-256 | `git diff -w` of the 9 collision files | <ul><li>No assertion is removed without an equal or stronger replacement.</li><li>Each change matches its §0.1 row.</li><li>Any other change is a FAIL.</li></ul> |
| C-LAYOUT-256 | Toolbar geometry against the HEAD control | <ul><li>The §2.2 bounds at 1440 (= 49 px) and 1280 (≤ 87 px, the centre group alone in row 1).</li><li>At 1366, at A's breakpoint and at 1 px below it: the height is 49 or ≤ 87, no overlap, no overflow, and the clock is on one line.</li><li>The centre offset is ≤ 24 px everywhere.</li><li>Record the HEAD and new heights at 1366: this is the known window (D-29z483), and it is evidence, not a FAIL.</li><li>The order of the three groups' controls is as in §2.1.</li><li>Library top, video dock top, ruler top and first lane top are ±1 px of HEAD at 1440 and 1280.</li><li>The floating video's default position is unchanged against HEAD.</li><li>Screenshots before and after.</li></ul> |
| C-STOP-256 | Real audio (output RMS tap, as in LAB-SMOKE) | <ol><li>Play → RMS > 0, and the position advances from 2.000.</li><li>Play again after 500 ms → still playing, no jump back (position monotonic), and RMS stays > 0.</li><li>Stop → RMS falls to ≈ 0 within 300 ms, the position is frozen, and `data-insert-marker` is still 2.000.</li><li>Space → plays from 2.000.</li><li>Stop. A single click on Stop while stopped → nothing changes (position, marker, status).</li><li>Double-click Stop → marker 0.000, position 00:00.000, stopped.</li><li>Play, then double-click Stop while playing → stopped at 00:00.000 with marker 0, never restarted. Check RMS ≈ 0 at +300 ms and +1 s.</li></ol> |
| C-STATUS-256 | Clobber row (L51) | Play → Stop → double-click Stop, then read the status 500 ms after the last event. It equals the HEAD control's text for Space → Space → Home. |
| C-KEYS-256 | Keyboard | <ul><li>Tab to Play: Space plays once. Tab to Stop: Space stops once.</li><li>Enter on Stop while playing stops it.</li><li>Held Enter (hold for 1 s) on Stop and on Play gives no second action.</li><li>Space elsewhere is unchanged from HEAD.</li></ul> |
| C-ONSTATE-256 | Play's state | <ul><li>Stopped and playing look different (screenshots).</li><li>Glyph against fill ≥ 3:1 in both states, and Stop's glyph ≥ 3:1 against its fill.</li><li>`data-playing` flips.</li><li>Name and title are constant (§2.3).</li><li>The Play box does not move between states (±0 px).</li></ul> |
| C-FOCUS-256 | Focus | <ul><li>Tab through the toolbar follows edit → centre → view at both viewports. List the stops.</li><li>Stop shows the SABA-B-4 ring on `:focus-visible` only, not after a mouse press.</li><li>After double-clicking Stop, `activeElement` = Stop.</li><li>The full Tab sequence from the page start equals HEAD's, except the reordered toolbar stops. List both sequences.</li></ul> |
| C-SHEET-256 | `?` sheet against the HEAD control | <ul><li>`back-to-start` keys are exactly `Home`, `Double-click Stop`.</li><li>The row is ≤ 40 px.</li><li>`scrollHeight` ≤ 1,280, `clientHeight` 808 / 646, no horizontal overflow.</li><li>Every other row equals HEAD (per id).</li><li>Esc returns focus to the opener.</li></ul> |
| C-BUDGET-256 | Screen budget (L39) | <ul><li>Full-window screenshots, before and after, empty and demo project, at both viewports.</li><li>The number of persistent text lines outside the timeline is **unchanged** (Stop is icon-only).</li><li>A new always-visible strip is a Medium.</li></ul> |
| C-REF-256 | §1 R1–R10 | One row each: match, or the listed deviation. A behaviour that differs from §1 with no listed deviation is a bug (Medium when the user must learn it). Ableton conformity is reported separately from CZABA-requirement conformity. |
| C-LESSON-256 | `lessons.md` | ≤ 60 lines. L43, L44 and L45 present. The new L43 evidence line names SABA-B-9 stage 1. |
| AN-REVIEW-256 | Doc 193 | <ul><li>l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 256 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>Every test it cites exists (L26).</li><li>The doc is in Georgian.</li></ul> |
| LAB-SMOKE-256 | Load, play, export WAV | No page errors. The export sha256 equals round 255's (`1fea093b…033f94`): the export is untouched. |
| Auth | `/studio/<handle>` without a session | `Sign in required`, no `audio[src]`, and `/api/studio-token` never returns 200. |
| Purchased origin | `/studio/$productId` | **BLOCKED:** backend unavailable in cloud. |
| gate | Full vitest, typecheck, lint, build, verify, e2e smoke | Gate rows; C does not claim them. |

**`browserVerified`** is true only if C-LAYOUT, C-STOP, C-STATUS, C-KEYS, C-ONSTATE, C-FOCUS, C-SHEET, C-BUDGET, LAB-SMOKE and Auth all ran in the browser.

## 4. Neighbouring behaviour that could break
- **Toolbar height consumers.** The floating video's default position, the library `bottomInsetPx`, and the timeline height (`h-screen` flex). The heights are equal by design, and C-LAYOUT-256 measures them.
- **Follow.** It moves into the centre group. Its three modes, title, `data-follow-mode` and `A11Y-GATE177-FOLLOW-PAUSED-NAME` (deferred) are unchanged.
- **Loop.** Disabled and on states (TS5) are unchanged.
- **Zoom group.** It keeps its controls; SR-230-4 stays a Saba question.
- **Space contract (10a):** IM1 and IM7 stay green, and C-KEYS-256 covers it.
- **render-budget.** The Stop click replaces the Pause click; the budgets are unchanged.
- **Master.** It stays in the header this round (stage 2).

## 5. Saba question SABA-Q-9-TRANSPORT (D-29z483; L43/L44: asked once)
| Part | Question | Default chosen until answered |
|---|---|---|
| (a) | Play pressed while playing: nothing, or restart from the insert marker? The manual is silent. | Nothing (no-op). |
| (b) | Stop clicked once while stopped: nothing, or back to start? Only a controller guide says the latter. | Nothing; double-click returns. |
| (c) | 1280×720: one row is impossible unless about 96 px of text goes. The options are Undo/Redo labels → tooltip, or the Zoom word and readout → tooltip (both against the CALM "transport text buttons stay" rule). Also: between about 1,351 and 1,398 px wide (for example 1366×768), the toolbar is now two rows (87 px) where it was one (49 px). | Two rows below about 1,399 px: the transport alone and centred in row 1, edit and view in row 2, height = 87 px, the same as today's 1280. Tab order: edit, then transport, then view. |
| (d) | Play's playing look. | An existing theme "on" treatment (§2.3). |

## 6. Why we missed it (SABA-B-9; from `transport-grid-review.md` §1.4)
- **Which phase should have caught it:**
  - B's SRW-01 task (round 1) copied the prototype toolbar with no layout reference row;
  - the ABLETON-EXPERT-REVIEW P1 checked regions, not the Control Bar's inner order;
  - VISUAL-A M1 (round 181) changed Play's shape and kept its position as "±0".
- **Why it was missed:** "positions do not move" was treated as a pass, not as a question for Saba. The reference-first rule only appeared on 2026-10-27.
- **The rule:** L43, already in `lessons.md` (l.29). No new line is needed; its evidence gets "SABA-B-9 stage 1 closes it" at this planning.

## 7. Next (D-29z489)
**If C passes and the gate publishes:**
- SABA-B-9 stage 1 is done, and B-R249-PAUSE-LABEL closes.
- Then, at the round 256 → 257 planning (on or after 2026-10-30): **REGRESSION-ROUND-2026-10-30**. It carries every `scope_additions` entry, plus C-LAYOUT-256, C-STOP-256 and C-SHEET-256.
- Then **SABA-B-9 stage 2** (master bottom-right; the 11b grid readout question shares that corner), then **SABA-B-11c** (after the expert consult on the off-grid offset), then **SABA-B-7** when Saba answers.

**If C fails:** a fix-up on the same grants, with a ruling on what C found.
