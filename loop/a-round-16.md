# A — Round 16 report: panel polish 14a (C-R11-01..03, deviation 9) + C-R15-02 + C-R15-03 test

Implementer: A (Claude Opus 5.5) · 2026-10-11 · Task: `tasks/current-task.md` (round 16) · No commits, no push, no installs.
**No verdict is claimed. Everything below is A's evidence; every acceptance ID is pending C.**

## 1. Pre-flight gate

**Assumptions**
- D-29c (2)/D-29g reserve only the selected-clip line. The range, ≥ 2-clip and lane-move lines stay as residuals: measured, not fixed.
- C-R11-03: "auto-fit turns off while the cap is engaged" is the only cap release that keeps the panel height. Room growth and user resize behave as before.
- The folded handle stays keyboard-reachable. Pointer unfold goes through the fold button only.
- No `panels.ts` helper is needed.

**Smallest design**
- Lane: one class switch and a one-line folded branch.
- Workspace: the footer `<p>` attributes plus a placeholder `<p>`, one prop, one `setStatus` line.
- Panel: one prop, two branches in the existing committed-refs layout effect and a two-line memory clear.
- About 45 product lines in total.

**Files and why**

| File | Why |
|---|---|
| `ArrangementLane.tsx` | §2.1 |
| `StudioWorkspace.tsx` | §2.2 footer, §2.3 prop, §2.4 status |
| `ArrangementDetailPanel.tsx` | §2.3 |
| 3 test files | R16-U |
| doc 024 | status/TODO |
| doc 025 | new |

**Success commands:** the §7 command list. The guard proof must fail under all 5 mutations. Browser: footer Δ0 at both viewports.

**Before code**
- `sha256sum -c b-round-15-tree-sha256.txt` gave **45 OK** (`a-round-16/gates/sha-start.txt`).
- `frozen-start.txt` holds the 35 frozen files and is identical to B's hashes (`gates/frozen-expected.txt`, diff empty).
- 9 base backups are in `a-round-16/bak/*.base.*`, all matching B's hashes (`gates/bak-base-check.txt`).

### §1.4 measurements (pre-edit, no source edit while the browser ran)

Files: `a-round-16/runs/pre-1440x900.json`, `pre-1280x720.json` and `pre-fold-1440.json`. Auto-fit on, panel open, C's standard layout (`c-round-11/scripts/lay11.js`).

**(a) Footer `offsetHeight`** (row tops relative to the footer)

| State | 1440×900 | 1280×720 |
|---|---|---|
| nothing selected | 49 (status 7, shortcut 27) | 49 |
| one clip (longest: „ღამის პულსი · სრული მიქსი“, 580 px) | 49: the selected line shares row 27 with the shortcut hint | 69: own row 27, shortcut 47 |
| range only | not reachable through the UI (see below) | same |
| clip + range | 69 | 89 |
| Ctrl+A (≥ 2 clips) | 69 (count and selected line share row 27) | 69 |
| lane move held | 49 (hint replaces shortcut, shares row 27) | 49 |

- "Range only" was not reachable. A range drag in a clip body also selects that clip. Ctrl-toggle, a lane click, the marquee and Ctrl+A all clear the range (`toggleClipSelection` and `selectAllClips` call `setRange(null)`).
- With ≥ 2 clips, the selected-clip line is still rendered (primary `selectedClipId`).

**(b) Layout, auto-fit on, panel open**

| Viewport | no selection | one clip selected |
|---|---|---|
| 1440×900 | scroller 516, lanes 81/81/81/81, panel 144, body 233–684 (451) | identical |
| 1280×720 | scroller 298, lanes 53/67/67/67, panel 144, body 271–504 (233) | scroller 280, lanes 53/61/61/61, panel 142 (cap), body 271–484 (213) |

**Library-body confounder (important for C).**
- The preview strip's „აქტიური ხაზი: {lane} · playhead …“ `<p>` wraps to 2 lines at width 288 for „მუსიკა“ (32 px) but not for „SFX“ (16 px).
- So the library body moves ±16 px whenever the **active track** changes, independent of selection or the footer. Pre-edit at 1440: selecting the music clip after an SFX-lane click moved the body 467 → 451, with the footer unchanged.
- This comes from the frozen `ArrangementLibraryPreview.tsx`.
- **For R16-F1.2, deselect by clicking the empty background of the same lane the clip sits on.** Esc does not deselect clips in the current code: the workspace Esc only returns the expanded video.

**(c) Folded music lane at 1440, pre-edit**
- Row 316–352 (36). Handle 345–351, pointer-events auto, cursor row-resize.
- `elementFromPoint` at the clip's bottom −2/−1 px (y 345, 346) returned the **handle**, at both the centre and the trim edge. This is the C-R11-01 repro.

**Stop conditions:** neither was hit.
- After the reservation, select/deselect gives Δ0 at both viewports.
- The longest selected text fits on one line at 1280: `scrollWidth == clientWidth` = 1256/1256.

## 2. Design of each fix

### C-R11-01 (`ArrangementLane.tsx`)
- Folded handle classes: `absolute inset-x-0 bottom-0 z-20 h-1.5 pointer-events-none touch-none focus-visible:…`, with no cursor and no hover background. Unfolded, the class string is byte-identical to round 15; a test asserts the exact string.
- `tabIndex`, role, `aria-*` and the test id are unchanged. ↑/↓ on a folded handle still unfold only (unchanged l.290).
- **The folded branch in `handleHeightPointerDown` is kept, but now just returns.** It no longer calls `toggleTrackFold`.
  - A real pointer can't reach it any more.
  - CSS `pointer-events` does not stop a synthetic event dispatched on the element itself (R16-L1.4).
  - Deleting the branch would let that event claim a gesture, and `changeTrackHeight` would unfold 36 → 80, which D-29c forbids.
- The drag/drop handlers stay. A drop on a folded lane's bottom now lands directly on the lane body.

### C-R11-02 + C-R15-02 (`StudioWorkspace.tsx` footer)
- The real line keeps the same JSX and text. It adds `className="basis-full truncate tabular-nums text-muted"` and a `title` template string with the same text (a test asserts `title === textContent`).
- Placeholder: `<p className="basis-full tabular-nums text-muted" aria-hidden="true" data-testid="arrangement-selected-clip-reserve">&nbsp;</p>` in the same position.
- Status, range, count, lane-move and shortcut lines are unchanged.
- No floating-video code changed (no ResizeObserver, polling or re-anchor), and the dock file is untouched.

### C-R11-03 (`StudioWorkspace.tsx` prop + `ArrangementDetailPanel.tsx`)

**Why this mechanism.** Both "auto-fit turned off" and "room grew" look the same to the panel: the cap goes from a number to `null`. The smallest honest signal is the existing workspace state, passed down as `isLaneAutoFitOn={trackLaneLayout.autoFit}`. There is no new context, no history entry and no `panels.ts` helper.

The panel's existing committed-refs `useLayoutEffect` gains two branches:
1. **Clamp:**
   - Condition: the cap released in this commit was a number, the new cap is `null`, auto-fit is off and stored > released.
   - Action: `expandedHeight = min(previous, releasedCap)`; `{from, to}` is remembered.
   - The existing cap-resize rule already disarms the transition. The layout effect re-renders before paint, so there is no 144 frame. Browser H1 sampled 99 rAF frames: only 142 seen, 0 animations.
2. **Restore (added after review M1):**
   - Condition: auto-fit comes back on. The only path is the workspace snapshot restore after a cancelled or aborted lane drag.
   - Action: if the stored height still equals `to`, it goes back to `from`. The rendered height stays capped, so there is no visible change.
   - A user panel resize (separator key or drag) clears the memory (review pass 2, Low 1).

**Your question: stored height after a cancelled height drag.**
- During the drag the panel stores the capped value, e.g. 142 at 1280.
- After `pointercancel` it gets back the pre-clamp value (144). The cap is restored too, so the rendered height stays 142.
- When room later grows, the panel shows 144, exactly as before round 16. Tests: "restores the pre-clamp stored height after a cancelled lane-height drag" and "gives the pre-clamp height back when auto-fit returns with the cap".

**Collapsed panel (review L1, kept on purpose).** The clamp also applies while the panel is collapsed. The collapsed separator already announces `დაკეცილია · 142 px`, so reopening there is Δ0 against what was announced. A test pins this.

The detail playhead line, its writer and the waveform SVG are untouched. Hunk list against `bak/ArrangementDetailPanel.base.tsx` (`gates/detailpanel-hunks.txt`):
```
71a72  380a382  403a406  418a422  420c424  429c433,454  466a492  511a538
```
`writeDetailPlayhead` is at l.102, the `useArrangementPositionWriter` call at l.120, `arrangement-detail-playhead` at l.126 and `arrangement-detail-waveform` at l.167. No hunk falls between l.72 and l.380.

### Deviation 9 (`toggleTrackFold`)
`current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` runs before the early return. The layout is unchanged, and so are the constant and its text.

### C-R15-03
One added test, described in §6. `ArrangementExportDialog.tsx` is unchanged (sha OK).

## 3. Files actually changed (a subset of §3.2)

- `app/components/arrangement/ArrangementLane.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`
- `app/components/arrangement/ArrangementDetailPanel.tsx`
- `app/lib/arrangement/__tests__/track-layout.test.tsx` (I chose this file for the footer tests; `footer-reserve.test.tsx` was not created)
- `app/lib/arrangement/__tests__/detail-panel.test.tsx`
- `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx`
- `docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md` (status and TODO lines only)
- **new:** `docs/implementation/2026/quarter-IV/025-studio-lab-panel-polish-14a.md`
- `panels.ts` and `panels.test.ts` are **not** changed: no helper was needed, and their hashes equal B's.

**Confirmations**
- **No round-6..15 file reverted.** `sha-end.txt` shows only the 7 owned files changed; all other baseline files are OK.
- **`frozen-end.txt`:** 35/35 OK against `frozen-start.txt`, which is identical to B's hashes.
- **`Header.tsx`:** `git diff` is empty and `git diff --stat HEAD` is empty. `git diff --stat cc1e531 -- Header.tsx` still shows +21/−0.
- **Frozen files unchanged:** `ArrangementVideoDock.tsx`, `ArrangementLibrary.tsx`, `ArrangementExportDialog.tsx` (restored byte-identical after the G5 mutation, `cmp` IDENTICAL), `ArrangementContext.tsx` and `Modal.tsx` all match B's sha.
- **Detail playhead/waveform:** untouched (see the hunk list in §2).
- **Instrumentation:** the grep on owned source returns 0 (`gates/instrumentation-grep.txt`, 0 bytes). The guard and browse scripts live only under `tmp/`.
- **Protected files:** 4/4 OK (`gates/protected.txt`).
- **`git status`** (`gates/git-status-end.txt`, 38 lines, re-captured after doc 025): only §3.1/§3.2 paths, plus the new doc 025. The two foreign agent files (`.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml`) are untouched and reported to root.

## 4. Verbatim command tails

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-15-tree-sha256.txt   (start)
45 × OK
$ sha256sum -c ... (end; gates/sha-end.txt)
app/components/arrangement/ArrangementDetailPanel.tsx: FAILED
app/components/arrangement/ArrangementLane.tsx: FAILED
app/components/arrangement/StudioWorkspace.tsx: FAILED
app/lib/arrangement/__tests__/detail-panel.test.tsx: FAILED
app/lib/arrangement/__tests__/export-dialog-focus.test.tsx: FAILED
app/lib/arrangement/__tests__/track-layout.test.tsx: FAILED
docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md: FAILED
sha256sum: WARNING: 7 computed checksums did NOT match      (= exactly the owned files; 38 OK)

$ npx vitest run track-layout detail-panel export-dialog-focus
 Test Files  3 passed (3)
      Tests  74 passed (74)
$ npx vitest run app/lib/arrangement
 Test Files  23 passed (23)
      Tests  515 passed (515)
$ npx vitest run
 Test Files  55 passed (55)
      Tests  979 passed (979)          (965 + 14 new; no sfx-library flake this run)
$ npx tsc --noEmit
tsc exit 0
$ npx biome check --write <6 owned files>
Checked 6 files in 76ms. No fixes applied.
$ npx biome check app/lib/arrangement app/components/arrangement
Checked 54 files in 168ms. No fixes applied.
$ npx biome check ./app
Checked 321 files in 517ms. No fixes applied.
Found 218 warnings.        (0 errors; same 218 as round 15)
Found 1 info.
$ npm run build
build/server/index.js                    1,280.21 kB
✓ built in 2.28s
build exit 0
$ git diff app/components/layout/Header.tsx
(empty)
$ node -e "...protected-baseline.json..."
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ git diff --stat
 18 files changed, 2845 insertions(+), 381 deletions(-)   (tracked M files only; full in gates/git-diff-stat.txt)
```

`npm.cmd run check` was **not** run. The read-only `./app` check shows warnings outside my files, and the rule allows Biome writes only on the named owned files.

## 5. A's browser runs

All runs: headless gstack, state file `a-browse.json`, server `127.0.0.1:5173`, no source edit during runs. **These are not verdicts.**

### R16-L1 (`runs/l1-1440.txt`, shot `shots/folded-handle-1440.png`)
1. Fold with a real click. Handle computed `pointer-events: none`, cursor `auto`.
2. `elementFromPoint` at the clip's bottom 3/2/1 px:
   - centre: the clip (×3);
   - trim edge: the trim edge at y 344/345, the clip root at y 346 (the trim-edge rect ends at 346).
   - The handle is never returned (pre-edit: the handle at y 345/346).
3. Synthetic trim on the folded right trim edge at bottom −2 px, −40 px:
   - duration 16 → 15;
   - Undo label `Undo: დამატება — Soft impact` → `Undo: Trim — მარჯვენა კიდე` (one entry);
   - the row stays 36, folded.
4. Synthetic pointerdown/move/up dispatched **on the handle element** at its old rect: the row stays 36, folded. `elementFromPoint` there returns the lane body (DIV).
5. With `.focus()` on the handle, real ArrowDown unfolds: 81, `aria-valuetext` "80 px". Refold with a real click: "დაკეცილია · 80 px". Real ArrowUp unfolds only: 81.
6. Handle drag +20 on the unfolded lane: 81 → mid 101 → 101, valuenow 100. The Undo label is unchanged, so no history entry.
7. Synthetic library DragEvent drop of „Soft impact“ at the folded music lane's bottom −2 px, t = 22 s:
   - target is the lane body;
   - music clips 1 → 2;
   - status „„Soft impact“ დაემატა მუსიკა ხაზზე 00:22.000-ზე.“

### R16-F1 (`runs/f1-1280x720.txt`, `f1-1440x900.txt`, shot `shots/footer-select-deselect-1280.png`)

Method: select with a real `$B click` on the music clip; deselect with a click on the empty music lane (same lane, see the confounder in §1). Two cycles per viewport.

Provenance: re-run on the **final tree**, after all reviewer fixes, with numbers identical to the two earlier runs. `post-*.json` was regenerated in the same run.

L1 ran before the reviewer fixes. Those fixes touched only `ArrangementDetailPanel.tsx`, the source form of the footer NBSP and tests. `ArrangementLane.tsx` has not changed since L1.

H1, G1, F2 and F3 ran on the final tree.

| Viewport | every state (none / select / deselect / select / deselect) |
|---|---|
| 1280×720 | footer 69, scroller 280, lanes 53/61/61/61, panel 142 (cap), body 271–484 (h 213): **Δ0** |
| 1440×900 | footer 69, scroller 496, lanes 81/81/81/81, panel 144, body 233–664 (h 431): **Δ0** |

- **Reserve:** present, `aria-hidden="true"`, height 16. `arrangement-selected-clip` is absent when nothing is selected.
- **Selected line:** `კლიპი: ღამის პულსი · სრული მიქსი · start 00:00.000 · length 00:16.000 · source offset 00:00.000`; `title` equals the text; `scrollWidth/clientWidth` 1256/1256 at 1280 and 1416/1416 at 1440, so one line with no truncation needed.
- **C-R11-02 repro at 1280:** lanes 60 (row 61) and cap 142 are now constant.

**Footer cost (D-29g price)**

| Viewport | no-selection footer, round 15 → 16 | effect |
|---|---|---|
| 1440×900 | 49 → **69** (+20, a permanent row) | scroller 516 → 496, body 451 → 431, lanes stay 81, cap stays off (panel 144) |
| 1280×720 | 49 → 69 | equals round 15's selected layout; no extra row compared with what a selection added before |

**Residuals (`runs/post-*.json`)**

| State | 1440×900 | 1280×720 |
|---|---|---|
| clip + range | footer 89 (+20), scroller 476, body 411 | footer 89 (+20), panel cap 122, body 193 |
| Ctrl+A | 89 (+20) | 89 (+20), panel 122 |
| lane move held | 69 (Δ0: the hint replaces the shortcut row) | 69 (Δ0) |

At 1280, Ctrl+A was footer 69 / panel 142 in round 15 and is now 89 / 122. The delta (+20) is the same as before; the base is higher.

### R16-F2 (`runs/f2-1440-288.txt`, `f2-1280-480.txt`)
No selection (the reserve is present), real `$B click` on ⤢.

| Case | aside | body (t–b, h) | box (l, t, w×h) | formula Δ | inset | round 15 (A) |
|---|---|---|---|---|---|---|
| 1440/288 | 0,84 288 | 233–664 (431) | 8, 503, 272×153 | 0/0/0/0 | 169px | body 233–684 (451), box 8, 523, 272×153, inset 169px |
| 1280/480 | 0,122 480 | 255–500 (245) | 8, 369.5, 217.77×122.48 | 0/0/−0.01/−0.02 | 138.5px | body 255–520 (265), box 8, 379.5, 235.55×132.48, inset 148.5px |

- Inset = height + 16 in both cases (153 + 16 = 169; 122.48 + 16 ≈ 138.5).
- Hit-tests on ◀, search, separator and the preview toggle return the control in both cases.

### R16-F3 (`runs/f3-1280-480.txt`, shot `shots/c-r15-02-flow-1280-480.png`)

Setup: 1280×720, library 480 (separator focus + real ArrowRight ×14), video imported (C's `lay11`), no clip selected (deselected on the music lane, so the active lane is music). Detail panel collapsed (1280 mount default).

| Step | body | box | box bottom − (body.b − 8) | preview top 12 px: in box / sampled | controls (wave, toggle, ◀, search, separator) | footer |
|---|---|---|---|---|---|---|
| pre | 255–500 | compact 160×90 | — | 0/168 | all OK | 69 |
| ⤢ real click | 255–500 | 8, 369.5, 217.77×122.48 | −0.02 | 0/168 | all OK | 69 |
| search (real click), type `soft`, option (real click), real Enter | **255–500 (Δ0)** | **unchanged** | −0.02 | **0/168** | all OK | 69 |
| deselect (music lane click) | 255–500 (Δ0) | unchanged | −0.02 | 0/168 | all OK | 69 |
| residual: range drag on the music clip | 255–**480** (−20) | unchanged | **+19.98** | **66/168** | all OK (none covered) | 89 |

- The add: clips 4 → 5, status „„Soft impact“ დაემატა მუსიკა ხაზზე 00:25.000-ზე.“, the new clip selected, and the box neither moved nor returned (still expanded).
- **Undo check** (`runs/f3-undo-1280-480.txt`): the label reads `Undo: დამატება — Soft impact` before and after, because `lay11` also ended with that add.
  - One real Ctrl+Z from the end state removes exactly the added clip: clips 5 → 4, music 2 → 1.
  - The box is unchanged (8, 369.5, 217.77×122.48) and still expanded.
  - The range drag added no history entry.
- **Range residual:** with the video still expanded, the range row adds +20 and the box then overlaps the top of the preview strip (66/168 sample points). No preview control, ◀, search or separator is covered. Information for B (D-29g), not a fix of this round.

### R16-H1 (`runs/h1-1280.txt`, `h1-control-1440.txt`, shot `shots/cap-autofit-off-1280.png`)

1280×720, C's layout:
- Mount: collapsed (D-29a kept), valuenow 142.
- Real-click open: panel 142 (cap), lanes 53/61/61/61, scroller 280.

| Step | panel | other |
|---|---|---|
| 1. sfx handle focused, real ArrowDown | 142 → **142** | 99 rAF samples saw only `[142]`; 0 animations; transition class absent after; lanes 53/61/61/69 |
| 2. viewport 1440×900 / back to 1280×720 | 142 / 142 | |
| 3. toggle collapse (real) / reopen (real) | 36 / **142** | |
| 4. synthetic separator drag −10 px (i.e. +10 height) | mid 144…152, after **152**, valuenow 152 | |
| 5. control at 1440×900 (no cap), first real ArrowDown on sfx | stays **144** | rAF samples `[144]`, lanes 81/81/81/89 |

6. R9-D3 static check: see the hunk list in §2.

### R16-G1 (`runs/g1-1440.txt`)
1. Held clip drag: synthetic pointerdown on the stems clip header plus 4 moves, not released.
2. Synthetic second-pointer (id 9) pointerdown/up and click on the music fold button: not folded (81), status `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, verbatim equal to `GESTURE_EDIT_BLOCKED_MESSAGE`.
3. Still held, focus on the fold button, real `$B press Space`: not folded (81), and the status is the same text.
   - Caveat: the status was already that text from step 2. The Space path's own status write is proven by the unit test, which resets the status between the click and the Space.
4. After pointerup: one `.click()` folds (81 → 36). The drag committed as `Undo: კლიპის გადატანა`.

Not run by A (C's gates or quick checks): G16-3 network/anonymous checks, R15-P3 quick, R13-F2/F3 quick, R14-E quick, R11A-1 quick, dock quick and RF7-P2 in the browser. `render-budget.test.tsx` is unchanged by sha and green inside the 979.

## 6. New and changed tests

**`track-layout.test.tsx`: 23 → 31**

New describe `panel polish 14a (…, R16-U)`:
1. Folded handle: `pointer-events-none`, no `cursor-row-resize`, no hover; tabIndex 0, separator role, aria values; ArrowUp unfolds; the unfolded className equals the exact round-15 string; ArrowDown on a folded handle unfolds only. (C-R11-01)
2. Reserve placeholder: exists, `aria-hidden`, NBSP, class set exactly `basis-full tabular-nums text-muted`, and the real test id is absent. On select: the real line has `basis-full truncate`, verbatim text, `title === textContent`, and the reserve is gone. On deselect: the reserve is back. (C-R11-02)
3. Cap 130 → first manual ArrowDown keeps 130, aria 130, no transition class. It stays 130 through resize 560/410 and collapse/reopen, and after a later lane key. A separator drag +10 gives 140, which then survives a resize. (C-R11-03)
4. Control: the cap released by room growth (560) restores 144, and 410 caps again to 130.
5. Cancelled lane drag (snapshot path): 130 during and after the cancel; after the room grows, **144**.
6. Committed lane drag, then a cancelled second drag: stays 130 (review pass 2, Low 2).
7. A user separator resize (↑ then ↓) during a lane drag, then cancel: stays 130, not 144 (review pass 2, Low 1).
8. Deviation 9: a fold click and Space during a claimed gesture keep the row at 81 and write `GESTURE_EDIT_BLOCKED_MESSAGE`; after release, a click folds.

**Named exceptions** (existing assertions changed)
- *"a pointerdown on the handle of a folded lane only unfolds it and starts no gesture"* is renamed to *"… neither unfolds it nor starts a gesture (C-R11-01)"*.
  - Before: `rowHeight('stems')` 81 after pointerdown, 81 after move.
  - After: 36 and 36. The `isPointerGestureActive() === false` assertion is unchanged.
- *"caps the detail panel … and drops it after a manual lane change"* is renamed to *"… and keeps the rendered height when a manual lane change drops it"*.
  - Before: the last two assertions were `'144px'` and `'144'`.
  - After: `'130px'` and `'130'`.

**`detail-panel.test.tsx`: 19 → 24**

New describe `C-R11-03 cap release …`, a standalone `ArrangementDetailPanel` inside `ArrangementProvider` with prop rerenders:
1. Auto-fit off stores 130, with no transition class and a toggle round-trip.
2. Cap released with auto-fit on gives 144.
3. Auto-fit returning with the cap gives back the pre-clamp height (144 once the cap releases).
4. Collapsed clamp: reopens at the announced 130.
5. A non-limiting cap (200) leaves 144.

**`export-dialog-focus.test.tsx`: 18 → 19**
- *"leaves Enter and Space alone on the last control and Enter on the first, so focus stays put (C-R15-03, D-29g)"*: on WAV, Enter and Space each give `defaultPrevented === false` and `activeElement === WAV`; on the X, Enter gives the same and the dialog stays open.
- No existing test changed.

**Guard proof** (`a-round-16/guard-proof.txt`, script `a-round-16/scripts/guard.cjs`; every restore checked with `cmp` = IDENTICAL; backups `a-round-16/guard/*.pre-G*`)

| Mutation | Result |
|---|---|
| G1: drop `pointer-events-none` on the folded handle | 1 failed (C-R11-01 classes test) |
| G2: no placeholder (render only when selected) | 1 failed (reserve test) |
| G3: auto-fit off clears without keeping (`Math.min` → `previous`) | 8 failed (track-layout + detail-panel) |
| G3b (extra): drop the pre-clamp restore | 2 failed |
| G3c (extra): keep the clamp memory after a user key resize | 1 failed |
| G4: remove `setStatus` in `toggleTrackFold` | 1 failed (deviation 9) |
| G5: C's G6 (`event.key !== 'Tab' && event.key !== 'Enter'`) in `ArrangementExportDialog.tsx` | 1 failed (C-R15-03 test); file restored IDENTICAL, sha = B's |

C's "handles every key" variant: Enter on WAV would then wrap focus to the X and be prevented, so the new test fails by construction. I did not run it.

## 7. code-reviewer (actual subagent, two passes)

**Pass 1 (full diff, `a-round-16/diff-round16.txt`), score 8/10.** Summary, quoted:

> "The change does what all five contract items ask, with tight scope and tests that fail without the fix. The layout-effect clamp has no loop, no intermediate frame and no transition, the folded handle stays keyboard-reachable, and the footer reserve row works for single select/deselect. The one real problem is M1: a cancelled lane drag now permanently changes the panel's stored height (130 instead of 144 once the room grows). That breaks the contract's 'other cap releases behave as before', and the new snapshot-path test locks it in, so decide whether the contract or the test is right. The rest is small: collapsed-panel semantics without a test, the updater ignoring `previous`, the raw NBSP character, and the press-through on folded handles."

| Finding | My action |
|---|---|
| **M1** | **Fixed**: `{from, to}` memory and a restore when auto-fit returns. The snapshot-path test flipped to 144, plus a harness test. |
| **L1** collapsed clamp | **Kept by design** (reason in §2); a pinning test was added. |
| **L2** updater ignores `previous` | **Fixed**: `Math.min(previous.expandedHeight, releasedCap)`. |
| **L3** raw U+00A0 | **Fixed**: JSX `&nbsp;`, and `String.fromCharCode(160)` in the test. |
| **L4** a press on the folded strip now goes to the lane/clip | Contract-intended (D-29c 1); reported here. R16-L1.2/3/4 cover it. |
| **L5** multi-select/range/lane-move rows | Out of scope (D-29g residual), measured in §5. |
| **Nits:** title/text maintained twice; class-string duplication; export test "focus unchanged" is weak in jsdom | Not changed. The title equality is tested; the unfolded string must stay byte-identical; `defaultPrevented` is the meaningful assertion and G5 proves it. |

**Pass 2 (fix delta, `a-round-16/review-fix-delta.txt` and `diff-round16-final.txt`), score 9/10.** Quoted:

> "I found no Critical, High or Medium issues in the fix delta. The M1 restore does not loop, does not show an extra frame, and does not restore wrongly on any normal path. The one wrong-restore case needs an unlikely keyboard sequence (Low 1 below)."

| Finding | My action |
|---|---|
| **Low 1:** a value-match restore could override a user separator key resize made during a live lane drag | **Fixed**: `autoFitClampRef.current = null` in both user-resize paths, with a test and guard G3c. |
| **Low 2:** no test for "committed drag, then cancelled drag" | **Added.** |
| Alternative: lift the panel height into the workspace snapshot | Not done this round (cross-component state lift). Noted for B in doc 025. |

After these two fixes I re-ran the owned tests (74/74), the full guard proof, Biome, tsc, the full vitest (979) and the build. I did **not** start a third reviewer pass: the two Low fixes are 2 product lines plus 2 tests.

## 8. Deviations

1. **The folded pointerdown branch now returns instead of being removed** (the task allowed either). Reason: robustness against synthetic dispatch on the element (§2). This required one named test exception.
2. **The C-R11-03 restore on a cancelled lane drag** goes beyond the literal task, which only asked me to report the stored height after a cancel. The reviewer found the no-restore version contradicts "cap release for any other reason behaves as before". The restore keeps rendered Δ0 at the cancel itself.
3. **The clamp also applies while the panel is collapsed** (reasoned in §2). If B wants it only while open, it is a one-condition change.
4. **The placeholder uses the `&nbsp;` JSX entity**, not a raw character (review L3). The rendered DOM is identical (one U+00A0).
5. **Esc does not deselect clips** in the current code (the workspace Esc only returns the expanded video). For R16-F1.2 and F3.3, C should deselect with an empty-lane click, **on the same lane** (the active-lane preview wrap confounder).
6. **"Range only" could not be produced through the UI** (§1). The §1.4a row is recorded as not reachable.
7. Real coordinate clicks via CDP are blocked by gstack's allowlist (not bypassed). Lane-background clicks, pointer drags, the trim and the second-pointer fold click are synthetic (`buttons: 1`). Clip selection, ⤢, search, option, fold and toggle clicks use real `$B click`, and keys use real `$B press`.

## 9. "Not ready" acceptance IDs

**None from A's side.** All of R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U and R16-Doc have an implementation and A-side evidence. **All are pending C**; none is claimed PASS.

## Exact next C checks (suggested)

- **R16-F1.2:** select with a real click on the music clip; deselect with an empty-lane click **on the music lane**. Expect footer 69, scroller 280/496, lanes 53/61/61/61 or 81×4, panel 142/144, body 213/431, all constant.
- **R16-F1.3 footer cost:**
  - 1440: 49 → 69, scroller −20, body −20, lanes 81, no cap;
  - 1280: no extra row versus round-15 "selected".
- **R16-H1.1:** ArrowDown on the sfx handle at 1280 with the panel open; the cap is 142 regardless of selection now.
- **R16-L1.4:** dispatch the synthetic pointerdown **on the handle element itself** too; it must not unfold.
- **R16-L1.7:** the drop target at bottom −2 px is the lane body DIV.
- **R16-T1:** C's G6 and an every-key variant on a copy of `ArrangementExportDialog.tsx`.
- **New for B (information):** with the expanded video, a range adds +20 to the footer and the box overlaps the top of the preview strip (66/168 sample points at 1280/480). No control is covered.
- **Regression quick list per §6.2:** in particular R11-P2a at 1280, where the open panel is now always capped at 142 (it used to be 144 with no selection). D-29a mount is still collapsed at 1280 and open at 1440 (h1 runs).

## Root / B carry (unchanged; honest)

Still open, from `root-pre-push-review.md` / `publication-checkpoint.json`:
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*` (Tech Lead);
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything;
- the uncommitted round-6..16 tree;
- the shared `Modal.tsx` focus gap (root/UI owner);
- root GA sends `scroll` with consent denied;
- the two foreign agent files (root);
- the publication checkpoint requirements (library/stems/scrollbars, T12, final commit/push).

Not this round: C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome), C-R12-01 (RF5-3), polish 14b/14c (rounds 17–18), the 21 regression-debt IDs, and the Tech Lead manual checks.

## Artifacts

- `a-round-16/`:
  - `checkpoint.md`;
  - `gates/`: sha-start/end, frozen-start/end/expected, bak-base-check, tsc, biome-*, vitest-*, build, git-status-end, git-diff-stat, protected, instrumentation-grep, detailpanel-hunks;
  - `runs/`: pre-*, post-*, l1, f1, f2, f3, h1, g1;
  - `shots/` (4 required);
  - `guard-proof.txt`, `guard/`, `diff-round16*.txt`, `review-fix-delta.txt`, `scripts/`, `bak/`.
