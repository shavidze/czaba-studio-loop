# Round 254: SABA-B-10b — the visible flashing insert marker and the transport rows of the shortcut sheet

This round makes the insert marker from SABA-B-10a visible, and puts its keys in the `?` sheet.

- **Item 1 (SABA-B-10b, GATE249-S4).** The hidden test-only `ArrangementInsertMarkerSignal` (`StudioWorkspace.tsx` l.498–520) becomes a **visible line**. It is drawn the same way as the playhead line: thin light ink, flashing only under `motion-safe:`. It keeps `data-testid="arrangement-insert-marker"` and `data-insert-marker`, so every existing reader stays valid. The hidden node goes away.
- **Item 2 (GATE249-S7).** The sheet gets two new transport rows: Shift+Space and Ctrl/Cmd+Shift+Space. `play-stop` and `back-to-start` get honest action text.
- **Item 3 (A-R250-REVIEW-SHEET-MARKER-COPY, Low).** The sheet's `marker` (M) row names the same three cases as `addTitle`.
- **Item 4 (A's round-253 STOP, L10/L31).** `render-budget.test.tsx` gets a declared timeout on its Play → Pause → Play test, plus one row that the marker line survives that sequence as the same node.

**Planned by:** B, at the round 253 → 254 planning, 2026-10-29. **Decisions:** D-29z467…D-29z474.
**Double-click Stop is not in this round.** The Stop button does not exist yet; it arrives with SABA-B-9, which owns the button, its double-click and its label (B-R249-PAUSE-LABEL).

**Why this round (D-29z467):**
- **C round 253: PASS**, with `browserVerified` and `realVerified` both true. Gate 253 **published `c65e5e9`** (rounds 252 + 253). **SABA-B-10a is done.**
- **C-R253-01 (Low, new).** After a lower-zone click past the end and a stop, the stopped text promises playback that the next Space refuses. It goes to `deferred_low_polish`. The bug gate allows an early fix only when it is cheap and the round owns the code, and here neither holds. The refusal predicate in `startPlaybackAt` (`ArrangementContext.tsx` l.1339–1346: `loopActive`, `endedHere` from `playbackEndedAtRef`, `current > end + ARRANGEMENT_EPS`) reads context refs that `StudioWorkspace` cannot see. A second copy of that predicate that might disagree would be one more false sentence. The fix needs an exported pure resolver, which is the ARCH-CHECKPOINT-TRANSPORT-POSITIONS proposal (D-29z468).
- **REGRESSION is not due today.** `regression-last.json` = 2026-10-27; today (2026-10-29) is only 2 days later. It **is due at the next planning on or after 2026-10-30** (§7).
- **SABA-B-10b is next in the agreed order** (10a → 10b → 9 → 11c). Saba agreed to it on 2026-10-28, and its reference transcripts are already in `reference/youtube/SABA-B-9-10-11-transcripts.md`, so no AGREE step is needed.

**Read first:** `lessons.md` in full. These lessons apply directly:
- **L23:** B's pre-check, in §0.2.
- **L29:** every claim about the code here cites a grep or a probe.
- **L39:** a new permanently visible element.
- **L2/L15:** contrast of the new line.
- **L31:** headroom.
- **L12:** no class selectors in tests.
- **L50:** focus grep.
- **L28:** doc status line.
- **L44:** deviations go to Saba.

## 0. Baseline and scope

**Start state:**
- **HEAD** = `c65e5e9ab7d53d66d2225ed794bd0c7ef657151b` (`b-round-253/head-at-planning.txt`).
- **`git status --short --untracked-files=all` is empty** (`b-round-253/git-status-at-planning.txt`, 0 lines).
- **STOP (L11)** if HEAD differs, the tree is dirty, or any hash check below fails. Exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Hash checks** (run from `store/`; each gave rc 0 at planning):
- **Frozen.** `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-253-r254-tree-sha256.txt` covers **1,103** files: `git ls-files` minus the 7 tracked grants and the 4 root files.
  - Each of the 7 protected auth and purchase files appears once, and `git diff --quiet HEAD` gives rc 0 on each:
    - `app/routes/studio.$productId.tsx`
    - `app/routes/api.studio-token.ts`
    - `app/routes/account.downloads.tsx`
    - `app/lib/__tests__/download-routes.test.ts`
    - `app/lib/auth.ts`
    - `app/contexts/AuthContext.tsx`
    - `app/entry.server.tsx`
  - The frozen list also includes `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `strings.ts`, `store-theme-tokens.test.ts`, `studio-theme-obsidian.test.tsx` and `bars-ruler-ui.test.tsx`.
- **Grants start state:** `b-round-253-r254-grants-start-sha256.txt` (7 tracked grants), with copies in `b-round-253/r254-granted-start/`.
- **Root-owned files:** `b-round-253-r254-root-files-start-sha256.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`) must equal HEAD. No dependency is needed.
- **HEAD control for C:** a `git archive HEAD` copy of the store.

### 0.1 Grants (`b-round-253-r254-grants.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | <ul><li>Replace `ArrangementInsertMarkerSignal` with a visible `ArrangementInsertMarkerLine` (§1.1).</li><li>Mount it just before `<ArrangementPlayheadLine>` (l.3053–3054), so the playhead paints over it.</li><li>Nothing else.</li></ul> |
| 2 | `app/styles/app.css` | <ul><li>Inside `@theme`, add exactly one declaration: `--animate-insert-marker-blink: insert-marker-blink 1.2s step-end infinite;`.</li><li>Add exactly one `@keyframes insert-marker-blink` block **outside** `@theme`, under the existing `/* Keyframes */` comment: `0%, 100% { opacity: 1; }` and `50% { opacity: 0.25; }`.</li><li>Nothing else. `@keyframes` inside `@theme` turns ST2–ST4 of the frozen `store-theme-tokens.test.ts` red (§0.2).</li></ul> |
| 3 | `app/lib/arrangement/shortcuts.ts` | Transport rows and the `marker` row (§1.2). |
| 4 | `app/lib/arrangement/__tests__/shortcuts.test.ts` | SC1: `EXPECTED_ROW_ORDER` gets the two new ids. SC5: the aria count goes from 9 to 11, plus exact asserts for the two new rows. No assertion is removed. |
| 5 | `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` | New rows IMV1–IMV5 (§2). |
| 6 | `app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx` | New rows SS-T1 and SS-T2 (§2). |
| 7 | `app/lib/arrangement/__tests__/render-budget.test.tsx` | <ul><li>Declare `{ timeout: 15_000 }` on the test `does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play`.</li><li>Add row RB-IM (§2).</li></ul> |
| 8 | `docs/implementation/2026/quarter-IV/192-saba-b-10b-visible-insert-marker.md` | **New** (untracked) implementation doc. l.4 is exactly `**სტატუსი:** Completed (C round 254 PASS)` (L28). It has the 7 TEMPLATE headings in order (L26). |

- **Every other file is frozen.** That includes `strings.ts`, because the new sheet copy lives in `shortcuts.ts`, and `ArrangementTransport.tsx`. Titles are built from `keys[0]` (`studioShortcutTitle`, `shortcuts.ts` l.209–212), so `Play (Space)`, `Pause (Space)` and `Back to start (Home)` do not change. ST and NS stay green on the scratch (§0.2).
- **No assertion may be removed** unless a stronger one replaces it in the same place. A test whose only change is a removed assertion is a Medium bug (policy).
- **Read before editing:**
  - `AGENT_DISCOVERABLE_CODE.md` (new component and ids)
  - `FORWARDREF_COMPONENT.md`
  - `DESIGN_TOKENS.md`
  - `TAILWIND_FIRST.md`
  - `AUDIO_ARCHITECTURE.md`
  - `TESTING_QUALITY_GATES.md`
  - `BUG_HUNTING_TESTS.md`
  - `GEORGIAN_DOCS.md`
  - `docs/implementation/TEMPLATE.md`
  - `.claude/prompts/studio-feature.md`

### 0.2 B's pre-check (L23, done)
**Setup:** the scratch `/tmp/b254-scratch` is a `git archive HEAD` copy with `node_modules` symlinked, plus B's sketch (`b-round-253/precheck-sketch.diff`, 127 lines: grants 1–3). The results are in `b-round-253/precheck-fails.txt`.

**Results:**
- `tsc --noEmit` gives rc 0. Biome reports only one formatter wrap, in the `marker` row string.
- `npx vitest run app/lib/arrangement app/components`: 165 files, 2,411 tests. **2 fail, both in grant 4:**
  - SC1: the row order.
  - SC5: `expected 11 to be 9`, the aria row count. The ARIA grammar and the Ctrl↔Control check already accept `Control+Shift+Space Meta+Shift+Space`.
- **Every other file stays green:** insert-marker-ui, bars-ruler-ui (it reads `data-insert-marker`), shortcut-sheet-ui, workspace-strings-ui, overview-visibility-ui, collection, render-budget, navigation-strings-ui, strings and track-layout.
- **The 7 test files that read `app.css`** (grep `app.css|styles/app`):
  - **First attempt:** `@keyframes` inside `@theme` turned **ST2/ST3/ST4** of `store-theme-tokens.test.ts` red, because its parser rejects `{` inside `@theme`.
  - **Final sketch:** the keyframes sit outside `@theme`. All 7 files pass, 94/94.
- **Browser** (`b-round-253/probe/scratch2.json`, `p.cjs`, 8 screenshots): a scratch dev server on :5180, since stopped, at 1440×900 and 1280×720, with `reducedMotion` `no-preference` and `reduce`.
  - **The line:** `w` = 1 px, `bg` = `rgb(236, 230, 218)` (`foreground`), the same height as the playhead (408 px / 392 px), `animation-name` = `insert-marker-blink`.
  - **Blink:** opacity sampled every 100 ms for 2.4 s reads 1 ×6, then 0.25 ×6, repeating. That is a 1.2 s cycle, with at least 3 changes in any 2 s.
  - **`reduce`:** `animation-name: none` and opacity 1 in all 24 samples.
  - **After a 2 s click:** the marker is at 2.000 and the playhead stays separate (a brass 2 px line).
  - **The background under the line,** found by `elementFromPoint` with both lines hidden: `rgb(22, 20, 18)` (ruler and marker strip) and `rgb(14, 13, 12)` (video dropzone).
- **Contrast** (computed from those colours):
  - The ink line: **14.8:1** and **15.6:1**.
  - The dim phase (0.25): about 2.0:1. That is the "off" half of a blink, and the rows do not measure it.
  - Ink on the selected clip's brass title bar: 1.88:1. The brass playhead on that bar already has the same limit. This is recorded, not a row (§1.1).
- **The scratch probe's sequence drifted.** Its 2 s click hit the bars scrub strip and started playback. C's recipe in §5 aims the lane body instead, and confirms the target with `elementFromPoint`.
- **L28 planning grep:** `grep -rn 'In Progress (stage' docs/implementation` gives one hit, doc 176 (`stage 1 of 2; C round 225 PASS`). That doc belongs to the open PERF-HARNESS-SHARED-LIB-b-ii stage and is not this feature. Doc 191 is `Completed`.
- **e2e:** `grep -rn "insert-marker\|arrangement-playhead" e2e/` gives 0 hits, so no smoke selector depends on the hidden node.
- **L50 grep on grant 1:**

  ```
  grep -nE "onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)" app/components/arrangement/StudioWorkspace.tsx | wc -l
  ```

  It gives **20 hits** at HEAD, the same as round 252. The new line is `pointer-events-none`, `aria-hidden` and not focusable; it adds no handler and moves no focus. **Ruling: out of scope for focus.** C re-runs the grep, and any hit beyond 20 needs a ruling.
- **The sketch is not a prescription.** A may write it differently as long as §1 and §2 hold.

## 1. Rulings

### 1.1 The visible insert marker (D-29z469)
**What it is:** one vertical line, `ArrangementInsertMarkerLine`.

**Where and how it is drawn:**
- **Position:** `left = ARRANGEMENT_HEADER_WIDTH_PX + insertMarker × pxPerSecond`.
  - It is written from `useArrangementInsertMarkerStore().subscribePosition`, as the hidden signal is today. A subscription writes it, not a React render.
  - **No change to `ArrangementContext.tsx`.** The `useArrangementInsertMarkerWriter` idea (addendum 3) stays an architecture item.
- **Height:** the same container and `top-0 bottom-0` as the playhead. It covers the lanes area at the same height as the playhead line (408 px / 392 px in the probe).
- **Look:**
  - `w-px bg-foreground` (light ink), `pointer-events-none`, `aria-hidden="true"`, z-10.
  - It is **mounted before** the playhead, so the brass playhead (`w-0.5 bg-accent`) paints over it where they meet.
  - When stopped right after a click, the two coincide. That reads as one brass line with a 1 px ink edge, and is intended.
- **Flash:** `motion-safe:animate-insert-marker-blink`: 1.2 s, step-end, opacity 1 ↔ 0.25. Under `prefers-reduced-motion: reduce` it is static at opacity 1.
  - That is about 0.83 changes per second, below WCAG 2.3.1's 3 flashes/s.

**When it is visible:**
- **Always, stopped and playing,** except while a time selection exists. Then it is `hidden` (the `hidden` attribute), and `data-insert-marker` still updates.
  - **Why playing:** under Saba decision 1, a click during playback moves only the marker. Without a visible marker that click has no on-screen result except the status line (INFO-B249-STALE-MARKER-STATUS).
  - **Why hidden with a selection:** Space plays from the selection start when one exists (`togglePlayback`, context l.1369–1380). A visible line at the old marker would show a start point Space does not use. Live 6.9 also treats a point and a timespan as alternative selections.
- **Selection gone by any other path** (for example Delete/Backspace, Cut Time or Undo, wherever these clear it): the line reappears at the **unchanged** marker. That point can be far from the old selection, and Cut Time remaps it (10a). This is expected under the 10a model, not a bug. The marker moves only through its own commands.
- **Past the project end** (C-R253-01's 16.5 s): the line is drawn at its true time, like the playhead would be. It is not clamped and gets no special state.

**Tokens and identity:**
- Ink, `w-px`, is used rather than brass. Under reduced motion two brass lines (marker 2.0 and playhead 3.5) would be told apart only by 1 px of width. Ink against brass is a different colour role, with 14.8:1 against the lane.
- The cost: on a **selected** clip's brass title bar (20 px tall), ink is 1.88:1. The brass playhead has the same limit there today. This is recorded as INFO-B254-INK-ON-BRASS and is not a row.

**Signals:**
- The element keeps `data-testid="arrangement-insert-marker"` and `data-insert-marker` (3 decimals).
- The hidden `div` is removed, so `[data-testid="arrangement-insert-marker"]` matches exactly one element.
- The playhead keeps `data-testid="arrangement-playhead"` and is unchanged.

**GATE249-S5 (the double store write in `returnToStart`/`playFrom`):** two writes in one task must not repaint visibly. C counts `data-insert-marker` attribute mutations per Home press. The count may be 1 or 2, and the final value must be `0.000`. No intermediate value may differ from the final one or the previous one.

### 1.2 Sheet rows (D-29z470)
**Transport group order:**
1. `play-stop`
2. **`continue-playback`** (new)
3. **`insert-marker-to-playhead`** (new)
4. `back-to-start`
5. `play-from-point`
6. `loop`

| id | action (exact) | keys | ariaKeyShortcuts |
|---|---|---|---|
| `play-stop` | `Play from the insert marker or the selection start · Stop` | `Space` | `Space` |
| `continue-playback` | `Continue from where playback stopped` | `Shift+Space` | `Shift+Space` |
| `insert-marker-to-playhead` | `Move the insert marker to the playhead` | `Ctrl+Shift+Space` | `Control+Shift+Space Meta+Shift+Space` |
| `back-to-start` | `Back to start (the insert marker too)` | `Home` | `Home` |
| `marker` (Time & clips) | `Add a marker at the selection start, the insert marker, or the playhead while playing` | `M` | unchanged (none) |

- **The Live names are the reference** (§3): "Play from Start Marker/Stop", "Continue Play from Stop Point", "Move Insert Marker to Playhead Position", "Move Insert Marker to Beginning".
- **Our wording names the CZABA objects instead.** `Start Marker` does not exist in CZABA, and in Live 6.6 it means "the insert marker or active time selection".
- **No "double-click Stop" text** in `back-to-start` until SABA-B-9 adds the button (L29).
- **No control gets new `aria-keyshortcuts`.** Shift+Space and Ctrl+Shift+Space have no button of their own; the sheet row is where they are found. This rules on GATE249-S7. The Play button keeps `aria-keyshortcuts="Space"` (`studioShortcutAria('play-stop')`).
- **The `marker` row matches `studioMarkerStrings.addTitle`** (`strings.ts` l.515–516) in its three cases. This closes A-R250-REVIEW-SHEET-MARKER-COPY.
- **Search:** with `insert marker` typed, `filterStudioShortcutGroups` returns rows from both groups (play-stop, insert-marker-to-playhead, back-to-start, marker, split, add-sound).

### 1.3 A's round-253 STOP: render-budget headroom (D-29z471)
- **The numbers:** A measured 2,534 ms in the covering run (50.7 % of the 5 s vitest default) and 1,420 ms alone. Gate 253's `verify.log` l.1477 shows 2,479 ms.
- **Ruling:** the higher time decides (L11/L31). Grant 7 declares `{ timeout: 15_000 }` on that test, as the A-R238-LRS4-HEADROOM precedent did. No split.
- **The marker line is now a node on the Play → Pause → Play path,** so the same test file gets RB-IM.

### 1.4 Screen budget (L39)
**What is added:** a 1 px line inside the timeline content. It is not text and not a strip, so the persistent text line count must stay **85/101 at 1440 and 69/85 at 1280** (round 253).

**Quieter homes considered:**
- **Tooltip, sheet, empty-state or first-run hint:** rejected. The marker is the state the user acts on, and Live shows it permanently (6.3).
- **Status only:** that is today's behaviour, and it is the bug class INFO-B249-STALE-MARKER-STATUS.

**C attaches before and after full-window screenshots** at both viewports, in the empty and demo projects.

### 1.5 Why we missed it (SABA-B-10, policy rule)
- **Which phase should have caught it:**
  - B's round-1 planning, which ruled D-15 "single position model" ("the prototype works this way").
  - The ABLETON-EXPERT-REVIEW (P8), which recorded it as a ⚖ deviation.
- **Why it was missed:** a ⚖ recorded by the planner was read as a Saba decision, and "simpler" was accepted as a reason (`transport-grid-review.md` §2, l.128–137).
- **The rule:** **L44** (a planner ⚖ is not a Saba decision) and **L45** (build the reference's unit first) already exist in `lessons.md`. This round adds no lesson. C's C-LESSON-254 row checks that L44 and L45 are present.

## 2. Test rows (grants 4–7)
| Row | What it pins | Red-proof (named mutant A runs on a scratch) |
|---|---|---|
| SC1 (amended) | The `EXPECTED_ROW_ORDER` with `continue-playback`, then `insert-marker-to-playhead`, after `play-stop`. | MU-SHEET-NO-ROWS (the two rows deleted) |
| SC5 (+) | <ul><li>`studioShortcutAria('continue-playback') === 'Shift+Space'`.</li><li>`studioShortcutAria('insert-marker-to-playhead') === 'Control+Shift+Space Meta+Shift+Space'`.</li><li>The checked count is 11.</li><li>The `play-stop` and `back-to-start` asserts stay.</li></ul> | MU-SHEET-NO-ROWS; MU-ARIA-NO-META (`Meta+Shift+Space` dropped) |
| SS-T1 (new) | In the real StudioWorkspace, `?` opens the sheet. The four transport rows render with these exact action texts and keys: `Shift+Space`, `Ctrl+Shift+Space`, and `Home` with the new back-to-start text. Each lookup by text returns 1 (L14). | MU-SHEET-NO-ROWS; MU-COPY-OLD (old `Play / Stop` and `Add a marker at the insert marker` restored) |
| SS-T2 (new) | The sheet search `insert marker` lists at least `play-stop`, `insert-marker-to-playhead`, `back-to-start` and `marker`, and the `marker` row's exact new text. | MU-COPY-OLD |
| IMV1 (new) | `[data-testid="arrangement-insert-marker"]` matches exactly 1 element. It is **not** `hidden`, it has `aria-hidden="true"`, and its `style.left` equals `HEADER + marker × pxPerSecond`, both after mount (0) and after a stopped lane click (for example 2.000). | MU-HIDDEN-SIGNAL (the old hidden `div` restored) |
| IMV2 (new) | While playing (rAF stubbed; L52: `setPosition(getLivePosition())` and assert the store moved), a lower-zone or lane click moves the line's `style.left` and `data-insert-marker` to the click. The playhead's `style.left` does not equal the line's. | MU-LEFT-FROZEN (the `style.left` write removed from the subscription) |
| IMV3 (new) | With a time selection (any existing recipe that sets `range`), the line is `hidden`. Clearing the selection with an empty-lane click shows it again at the new marker. | MU-NO-HIDE (the `hidden` prop dropped) |
| IMV4 (new) | Home: `data-insert-marker` ends at `0.000` and `style.left` at `HEADER px`. | MU-LEFT-FROZEN |
| IMV5 (new) | Zoom: after `=` (or a `pxPerSecond` change) the line's `style.left` follows the new scale with the marker unchanged. | MU-NO-PPS-DEP (`pxPerSecond` dropped from the effect deps) |
| RB-IM (new, render-budget) | Over Play → Pause → Play, the `arrangement-insert-marker` element is the same node (`===`) before and after. | MU-REMOUNT (a `key` that changes with `isPlaying`) |
| render-budget timeout | `{ timeout: 15_000 }` is declared on the named test. | — (declaration) |

- **No class-token assertions (L12).** The blink, the colour and the width are browser rows only.
- **Helpers:** reuse the existing `insert-marker-ui` helpers and the `shortcut-sheet-ui` mount. A states each recipe it used.
- **Mutant table:** A lists each mutant with its failing line in `a-round-254/mutants/summary.txt`, plus FIX-CONTROL, which must be green. The mutants run on a tar scratch outside the repo, and the repo `git status` is identical before and after.

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- Live 12 Reference Manual, chapter 6 "Arrangement View", https://www.ableton.com/en/manual/arrangement-view/.
- Chapter 42 "Live Keyboard Shortcuts", https://www.ableton.com/en/manual/live-keyboard-shortcuts/.
- **Checked:** B fetched both pages with curl on 2026-10-29 (raw HTML in `/tmp/b254-web`, which is not kept) and grepped every sentence containing "insert marker". The quotes are verbatim.
- **Consults:** `docs-explorer` matched. `ableton-arrangement-expert` had no web access and found no extra source.
- **Video:** `reference/youtube/SABA-B-9-10-11-transcripts.md`, riOD 1:37 and m84w 0:00–0:58, read by root.

| Behaviour | Ableton source | Confirmed there | CZABA decision / deviation | C check |
|---|---|---|---|---|
| A visible, flashing insert marker | 6.3: "The flashing blue insert marker on a track determines where playback starts."; 6.9: "Clicking into the Arrangement background selects a point in time, represented by a flashing insert marker." | Confirmed: flashing, blue, "on a track" | Flashing line. **Colour: ink, not blue** (CZABA palette; distinct from the brass playhead under reduced motion). **Full height, not one track** (CZABA's marker has no track dimension since 10a; Live's ↑/↓ moves it between tracks). Both go to Saba: SABA-Q-10B-MARKER-LOOK (L44). | C-MARKER-VISIBLE-254, C-BLINK-254 |
| Blink rate | Not in the manual. B searched both pages; the expert found no source. | No reference found | 1.2 s, step-end, 1 ↔ 0.25 (B's choice; below WCAG 2.3.1) | C-BLINK-254 |
| Reduced motion | Not applicable (no Live setting found) | – | CZABA addition: static under `prefers-reduced-motion` | C-BLINK-254 |
| Visible during playback | Not in the manual | No reference found | Visible, because a click during playback moves only the marker (Saba decision 1) | C-MARKER-PLAYING-254 |
| With a time selection | 6.6: playback starts "at the insert marker or active time selection"; 6.9 treats a point and a timespan as alternatives | Inference only | Hidden while a selection exists | C-MARKER-RANGE-254 |
| Two positions after Stop | 6.3: "To continue playback from where it last stopped, rather than from the insert marker, hold Shift while pressing the space bar." | Confirmed (two starting points) | The playhead stays at the stop point and the marker at its time; both lines show | C-TWO-LINES-254 |
| Back to the start | 6.3: "To return the insert marker to the starting play position, you can double-click the Stop button or press the Home key (Win) or Function + left arrow key (Mac)." | Confirmed | Home (10a). **Double-click Stop waits for SABA-B-9** (no button yet). | IMV4, C-HOME-254 |
| Sheet names | 42.20 Transport: "Play from Start Marker/Stop — Space", "Continue Play from Stop Point — Shift Space", "Move Insert Marker to Beginning — Home"; 42.16 Arrangement View: "Move Insert Marker to Playhead Position — Ctrl Shift Space / Cmd Shift Space" | Confirmed | Same keys. The CZABA wording names the insert marker and the selection start instead of "Start Marker" (§1.2). | SS-T1, C-SHEET-254 |

**Deviations listed for Saba** (one question, SABA-Q-10B-MARKER-LOOK, `awaiting_user`; D-29z472):
- (a) ink, not blue;
- (b) full height, not per track;
- (c) visible while playing (Live's manual is silent);
- (d) hidden while a time selection exists.

SABA-Q-FOLLOW-EDIT-RESTART, SABA-Q-TIME-RULER-ROLE and the SABA-Q-10A-* questions stay `awaiting_user`, unchanged.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state.** Every §0 check gives rc 0, and the tree is clean.
2. **Implement** §1 and §2.
3. **Static checks.** Run `npm run typecheck`, `npx biome check` on grants 1 and 3–7, and `npm run lint`. Biome does not check `app.css`; cite the vitest css-reading files instead (L30).
4. **Covering set.** Run `b-round-253/covering-254.txt` **alone** (132 files: the round-253 set plus the 7 css-reading files and the sheet and marker files). Report the counts and any test above 50 % of its declared timeout (L11).
5. **Mutants.** Run the mutants named in §2 plus FIX-CONTROL, on a tar scratch outside the repo.
6. **Code review.** Run the code-reviewer subagent (8 files, so ≥ 3), and pass on its Architecture note.
7. **Playwright at both viewports**, a fresh context each time, with `reducedMotion` `no-preference` and `reduce`.
   - **Setup:** open `/studio-lab` and wait for `Demo collection ready`. Click `demo-stem-pulse`, then Add, blur, and press `=` four times.
   - **Sequences:**
     - a stopped click on the **SFX lane body** at 2 s:
       - x = the centre of the playhead at 0 + 2 × 97.7 px;
       - y = the vertical centre of `[data-track-id="sfx"]`;
       - confirm with `elementFromPoint` that `closest('[data-track-id]')` is the SFX lane, not `arrangement-bars-scrub-strip`;
       - B ran this recipe at HEAD and got the marker `2.000`, stopped, at both viewports (`b-round-253/probe/lane-click-baseline.json`, `lane.cjs`);
     - opacity sampling;
     - play about 1.5 s, then Space;
     - the two lines;
     - Home.
   - **Output:** save the JSON and screenshots under `a-round-254/browser/`.
8. **Report.** Write `a-round-254.md`: files changed, tests actually run, mutants, reviewer findings, and a STOP at the top if there is one.

## 5. C: acceptance
Run each browser row at **1440×900 and 1280×720**, in a fresh context, with the setup from §4 step 7. Wait for `Demo collection ready` first (L48).

**Never use Playwright's `animations: 'disabled'` on the blink rows.** For opacity-1 measurements, use `reducedMotion: 'reduce'` or a sampled opacity-1 instant.

| ID | Check | Pass |
|---|---|---|
| C-SCOPE-254 | HEAD, status, hashes | <ul><li>HEAD is `c65e5e9`.</li><li>The status lists only grants 1–7 as `M` and grant 8 as `??`.</li><li>The frozen (1,103) and root checks give rc 0.</li><li>The 7 protected files give rc 0.</li><li>`app.css`'s diff is exactly one `@theme` declaration and one `@keyframes` block outside `@theme`.</li><li>Grant 1's diff touches only the signal → line component and its mount.</li></ul> |
| C-UNIT-254 | Run alone: `shortcuts.test`, `shortcut-sheet-ui`, `insert-marker-ui`, `render-budget`, `bars-ruler-ui`, `store-theme-tokens`, `studio-theme-obsidian` | <ul><li>All green.</li><li>SC1, SC5, SS-T1, SS-T2, IMV1–IMV5 and RB-IM are present (grep the ids).</li><li>The timeout declaration is present.</li><li>Every removed `expect` has its replacement in the same place.</li></ul> |
| C-MUT-254 | C re-runs at least 3 of A's mutants: MU-HIDDEN-SIGNAL, MU-NO-HIDE and MU-SHEET-NO-ROWS | Each is red on its row, and FIX-CONTROL is green. |
| C-MARKER-VISIBLE-254 | Stopped; click the SFX lane body at 2 s with the §4 step 7 recipe (`[data-track-id="sfx"]` centre; B ran it at HEAD: `b-round-253/probe/lane-click-baseline.json`) | <ul><li>Exactly one `[data-testid="arrangement-insert-marker"]`.</li><li>It is displayed (not `display:none`), its width is ≥ 1 px painted (L9), and its colour is `rgb(236, 230, 218)`.</li><li>`data-insert-marker` is the click time, and the line's x equals the lane x for that time ±1 px.</li><li>It is `pointer-events: none`: a click through it at its x hits the lane.</li><li>**HEAD control:** the element is `hidden` there and has 0×0 size.</li></ul> |
| C-BLINK-254 | Sample `getComputedStyle(line).opacity` every 100 ms for 2.4 s | <ul><li>**`no-preference`:** at least 2 changes between 1 and 0.25 in any 2 s window, and `animation-name` is `insert-marker-blink`.</li><li>**`reduce`:** opacity is 1 in every sample, and `animation-name` is `none`.</li></ul> |
| C-CONTRAST-254 | At opacity 1, the line against the background behind it (`elementFromPoint` with both lines hidden, walking up to the first non-transparent background) on the lane, the marker strip and an **unselected** clip body (`bg-elevated`) | <ul><li>≥ 3:1 on each (WCAG 1.4.11). B's computed 14.8:1 / 15.6:1 is the expectation.</li><li>On the **selected** clip's brass title bar: measured and listed, not a pass/fail (INFO-B254-INK-ON-BRASS, §1.1).</li></ul> |
| C-TWO-LINES-254 | Stopped click at 2 s; Space; wait about 1.5 s; Space | <ul><li>The marker x matches `0:02` ±1 px.</li><li>The playhead x matches its own time (`data-*` or the clock) and differs from the marker by ≥ 20 px at 97.7 px/s.</li><li>Both lines are displayed.</li><li>The next Space plays from 2.000. The clock starts at `00:02.0xx` (L48 lead).</li></ul> |
| C-MARKER-PLAYING-254 | During playback, click the lower zone of the bars ruler at about 6 s, and click a lane body | <ul><li>The line moves to each click within 1 frame (rAF).</li><li>Playback continues; the clock keeps advancing.</li><li>The playhead keeps moving independently.</li></ul> |
| C-MARKER-RANGE-254 | Make a time selection with the C-RANGE-249 recipe: drag from 5 s to 7 s inside the music clip's waveform body, then confirm `[data-testid=arrangement-range]`. Then clear it with an empty SFX-lane click (L29: Escape does not clear a selection). | <ul><li>With the selection, the line is `hidden`.</li><li>After the clear, it shows at the new marker.</li><li>Space with the selection still plays from the selection start (10a, unchanged).</li></ul> |
| C-HOME-254 | Marker at 6 s, then Home; and Home during playback | <ul><li>The final `data-insert-marker` is `0.000`, and the line x is the header edge ±1 px.</li><li>Attribute mutations per Home: ≤ 2, with no foreign intermediate value (GATE249-S5).</li><li>Home during playback: playback continues from 0 (10a IM7).</li></ul> |
| C-ZOOM-254 | Marker at 2 s; `=` and `-`; then scroll the timeline | The line stays on `0:02` of the ruler ±1 px after each step. |
| C-SHEET-254 | Open the sheet with `?` | <ul><li>The transport group lists the 6 rows in the §1.2 order, with the exact §1.2 texts and keys.</li><li>The `marker` row text is exact.</li><li>Searching `insert marker` lists the §1.2 rows.</li><li>At both viewports, no row wraps beyond its neighbours' height pattern. Row heights are measured; a two-line action is allowed only if the dialog does not scroll more than at HEAD (HEAD control).</li><li>Esc closes the sheet and returns focus as at HEAD.</li></ul> |
| C-TITLES-254 | Play, Pause and Back to start titles and `aria-keyshortcuts` | Unchanged from HEAD: `Play (Space)`, `Pause (Space)`, `Back to start (Home)`, `Space`, `Home`. |
| C-FOCUS-254 | Re-run the L50 grep (§0.2) | 20 hits. Tab order around the timeline is unchanged from HEAD, and the line is never focused. |
| C-BUDGET-254 | Persistent text lines, empty and demo projects, plus before/after full-window screenshots | 85/101 at 1440 and 69/85 at 1280, as in round 253. |
| C-LESSON-254 | `lessons.md` | ≤ 60 lines; L44 and L45 are present (§1.5). |
| AN-REVIEW-254 | Doc 192 | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 254 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>Every cited row id exists (L26).</li></ul> |
| LAB-SMOKE-254 | `/studio-lab` loads, plays and exports a WAV | <ul><li>No page errors.</li><li>The export sha256 equals round 253's (`1fea093b…`). A change is a regression; the marker is view-only.</li></ul> |
| Auth | `/studio/<handle>` without a session | <ul><li>`Sign in required`, and no `audio[src]`.</li><li>`/api/studio-token` never returns 200.</li></ul> |
| Purchased origin | `/studio/$productId`, purchased copy | **BLOCKED:** backend unavailable in cloud. |
| gate | full vitest, typecheck, lint, build, verify, e2e smoke | Gate rows; C does not claim them. |

**Ableton conformity:** C reports each §3 row separately as confirmed, deliberate difference, unconfirmed, or not applicable.

## 6. Neighbouring behaviour that could break (C probes these first)
- **The playhead line.** Its look, its rAF-driven movement and Follow scrolling must stay the same. Check them with the marker present, and when the two lines coincide.
- **Clicks.** Clip drag, trim, the marquee and lane clicks at the marker's x: the line is `pointer-events-none`, so no target may change.
- **Overview, loop brace, marker strip and ruler.** No overlap regression: the line starts in the same container as the playhead.
- **Video dock and the floating video.** No z-order change.
- **The export hash.** It must be unchanged.
- **Store pages.** `app.css` is global, so open `/` once at 1280 and check that there is no visual or console change. The new keyframe name is unique (grep `insert-marker-blink` returns only grants 1–2).
- **Past the end (observe, not a failure):** a lower-zone click at 16.4 s while playing, then Space. The line is drawn at 16.5 s. C-R253-01's text is deferred; report it only if it changes.

## 7. Next (D-29z474)
**If C passes and the gate publishes:**
- **SABA-B-10b is done.** The exception is double-click Stop, which is SABA-B-9 scope by design.
- **These close:** GATE249-S4, GATE249-S7, A-R250-REVIEW-SHEET-MARKER-COPY and INFO-B249-STALE-MARKER-STATUS (the visible marker now shows the state).
- GATE249-S5 is answered by C-HOME-254.

**If C fails:** a fix-up on the same grants.

**Then:**
1. **REGRESSION-ROUND-2026-10-30.** It is due at the next planning on or after 2026-10-30 and goes before any new scope.
   - It carries every `scope_additions` entry.
   - The rows from rounds 252–254 are added: C-FOLLOW-252/253, C-STOP-*-253, C-TITLES-253, C-NAV-ORIGIN-253, C-MARKER-VISIBLE-254, C-BLINK-254 and C-SHEET-254.
2. **SABA-B-9:** the centre transport, the Stop button with double-click and its label (closes B-R249-PAUSE-LABEL), and master volume at the bottom right.
3. **SABA-B-11c.** It needs the expert consult on the off-grid offset first.
4. **SABA-B-7** when Saba answers.
