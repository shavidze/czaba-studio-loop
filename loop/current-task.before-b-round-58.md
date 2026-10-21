# CURRENT TASK — Round 57: SRW-14 stage 4b-1, the lane right-click grid menu, with C-R51-02 (brace keeps keyboard focus after a timeline press) and C-R48-01-GRID-RESIDUAL (test headroom in the two grid-snap files)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- Decision record: **D-29z22** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-56.md`.
- **Round size:** one feature, one owner (A).
  - The feature is the lane context menu for the grid division (user request, `docs/video-to-text-bugs/transcripts/2.srt` 00:06:41–00:07:53; Live 12 §6.10).
  - Two coupled items come with it:
    - C-R51-02 (Low). Its fix site, `releaseEditFocusOnTimelinePointerDown`, is the capture handler that every right-click on a lane passes through.
    - C-R48-01-GRID-RESIDUAL (Low). It is test-only and mechanical: the D-29z21 form in the two grid-snap files.
  - Nothing is cut: narrow/widen keys, the Ctrl+digit check and the C-R51-01 probe are **stage 4b-2** (round 58). 4c, SRW-15..20 and the rest follow (§7).

> **ROOT ACTION REQUIRED BEFORE C (environment, not BLOCKED) — FIFTH ROUND.**
> - `http://127.0.0.1:5173` and `:5199` were down in rounds 52–56:
>   - A round 56: `000` at 20:21 and 20:34;
>   - C round 56: `000` at 20:37, 20:50 and 20:51, with no listener;
>   - B: `000` at 20:54 and 21:0x (`b-round-56/gates.txt`).
> - The stage-4a browser acceptance has never run. The anonymous-workspace / purchase-protection browser check last passed in **round 51** (G51-3) and has not run since.
> - Root: start the Store dev server **and** the backend before C, **or answer yes/no: can they be restored here?** Agents never start or stop servers.
> - Round 57 is built and unit-verified offline. Its browser half (§4.6) and the carried 4a half (§4.7) run only if the servers are up.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and the log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every right-click, drag, trim, Shift and Alt case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
>
> **Scratch junctions:** use `cmd //c mklink /J …` and `cmd //c rmdir …` with stdin from `/dev/null`. Do **not** export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 56 result** (`c-round-56.md`, `c-round-56.json`): **C PASS** for every ID that could run, with **no new bug**.
- **PASS:** G56-2, R56-S (with deviation R56-S-DEV1), R56-U (M1–M5 and durations), G56-1 (87/1504, verify rc 0 on attempt 1) and R56-LOAD (control and 3 valid loaded runs, 0 timeouts).
- **C-R48-01** is closed in **form 2**: "closed as not reproduced under test load; headroom proven only by M1–M5". The control run on the snapshot files showed 0 timeouts too, so the load generator did not reproduce the bug.
- **R56-S-DEV1 → B ruling: accepted.** Biome forced 2 `toBe(` re-wraps when the body re-indented, and C's own script proved the files token-equivalent. From now on, a re-indent proven token-equivalent by C's method is the allowance for a suite-option edit.
- **Not run (environment):** the §4.5 browser half and G56-3.

**Why stage 4b-1 now (D-29z22, which narrows D-29z21):**
- D-29z21 said: no more grid code without stage-4a browser evidence, and on root silence keep to browser-independent items. That pool is now empty: C-R48-01 is closed, and every remaining C bug and feature needs new code or a browser.
- Waiting a sixth round would delay the user's Grid/Snap priority indefinitely, which the user told B not to do.
- The menu is a **second entry point** into the existing `changeGridDivision` / `toggleSnap` path, the same state the header `<select>` and `G` already use. It adds no snap, edge or precision logic.
  - `grid.ts`, `selection.ts`, `ArrangementClip.tsx`, `ArrangementRuler.tsx` and `ArrangementLoopBrace.tsx` stay **frozen**, so the unverified stage-4a diff stays exactly as C reviewed it.
- **Accepted risk:** the uncommitted `StudioWorkspace.tsx` / `ArrangementLane.tsx` hunks grow. If root has not committed rounds 50–56 before A starts, round 57 cannot be committed separately from them (ROOT-COMMIT-ROUND51 updated).
- **C-R51-02 belongs here ("C bugs first"):** a right-click on a lane while the loop brace has focus needs a defined focus answer. The fix and the menu's focus return are one contract.
- **C-R48-01-GRID-RESIDUAL belongs here:** the grid-snap files are owned again, and the D-29z21 form is mechanical and already proven.

## Baseline

Measured by B on 2026-10-17 at 21:0x +04 (`b-round-56/gates.txt`).

**Content baseline:** one of these must hold.
- **(A)** HEAD is `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` lists **exactly these 22 paths**:
  - the 17 round 50–55 paths from `tasks/round-56.md` §Baseline;
  - the round-56 paths: ` M app/lib/__tests__/sfx-library.test.tsx`, ` M app/lib/arrangement/__tests__/fader-guards.test.tsx`, ` M app/lib/arrangement/__tests__/master-ui.test.tsx`, ` M app/lib/arrangement/__tests__/track-layout.test.tsx` and `?? docs/implementation/2026/quarter-IV/049-studio-test-timeout-headroom.md`.
- **(B)** Root has committed some or all of these units (rounds 50–55 and round 56):
  - HEAD is one or more newer **root** commits on top of `038ed5a`;
  - their combined stat contains only paths from the 22-path list;
  - `git status --short` lists exactly the 22-path list minus the committed paths.

**In both cases:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-56-r57-tree-sha256.txt` has **410** entries, all OK (run it from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned files below.
- **Snapshots:** `../tmp/studio-real-loop/b-round-56-r57-snapshots/` with `SHA256SUMS.txt`. None of the 4 files differs from its snapshot:

  | File | sha256 prefix | EOL | lines | `it` lines | top-level `describe` |
  |---|---|---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `baf7dd1f` | **CRLF** 1673/1673 | 1673 | — | — |
  | `app/components/arrangement/ArrangementLane.tsx` | `b2aea39b` | LF | 927 | — | — |
  | `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | `e103a124` | LF | 733 | 20 | l.281, l.391, l.635 |
  | `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | `5261ab47` | LF | 753 | 27 | l.355, l.469, l.581, l.700 |

- Anything else is a **stop and report**: another HEAD, extra paths, or a snapshot or frozen-list mismatch.

**Other measurements:**
- Protected files 4/4 OK; `node.exe` 9; `/studio-lab` 000; `:5199` 000.
- Full vitest at round-56 end: **87 files / 1504** (A and C both rc 0).
- Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.
- Biome on the 3 LF owned files: 0 diagnostics, rc 0 (`b-round-56/biome-owned-lf.txt`).

**Line endings:**
- **`StudioWorkspace.tsx` stays CRLF** (1673/1673 before; after, every line CRLF and 0 bare LF).
- **Never run `npx biome check --write` or `format --write` on it.** Check its formatting the way C did in round 51:

  ```
  biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx < <LF copy>
  ```

  It must print nothing different from the LF copy, so the only Biome error on it is still EOL.
- The other owned and new files are LF.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–56 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z22-M: the lane grid menu

**M1. Where it opens.**
- A `contextmenu` event anywhere inside a lane's **timeline area** opens one grid menu at the pointer: the element at `ArrangementLane.tsx` l.720 that carries `onPointerDown={(event) => onBackgroundPointerDown(…)}`.
  - This covers the empty lane background **and** clip bodies (audio and video), because clips render inside that element.
  - It covers audio and video lanes, folded or not.
- That `contextmenu` is always `preventDefault`ed, so the browser menu never shows over a lane timeline.
- Track headers, the ruler, the loop strip, the library, the detail panel and the transport keep the native browser menu: no `preventDefault` and no grid menu.
- **Smallest honest choice (recorded):**
  - The user asked for "right-click → choose the grid" over the arrangement (2.srt 00:07:00), and clips have no other context menu.
  - Live 12 §6.10 confirms the menu on the "track main lanes".
  - Whether Live shows grid items on a **clip's** context menu is unconfirmed, so CZABA's clip-body behaviour is a CZABA decision.

**M2. What it shows** (`role="menu"`, `aria-label="ბადის დანაყოფი"`):
1. One `role="menuitemradio"` per entry of `GRID_DIVISIONS_SECONDS`, in that order, labelled `formatGridDivision(step)`. Only the current `gridSeconds` has `aria-checked="true"`.
2. After a separator, one `role="menuitemcheckbox"` labelled `Snap (G)`, with `aria-checked` equal to the Snap state. This is the "free" choice the user asked for in the same passage ("თავისუფალი ეს უნდა გვქონდეს").

No other items: no adaptive/fixed grid, no triplets and no narrow/widen items (narrow/widen keys come in 4b-2).

**M3. What choosing does.**
- A division item calls the existing `changeGridDivision(next)`, and the Snap item the existing `toggleSnap()`.
- The status text, `data-grid-seconds`, `data-snap`, the header `<select>` value, the lane grid lines and all snapping are therefore identical to the `<select>`/`G` paths.
- The menu closes after a choice.
- Choosing writes **no history** (the division and Snap are view preferences, as today).
- It changes nothing in the arrangement, selection, playhead, insert marker, loop or transport. **Playback continues uninterrupted.**
- Choosing the already-checked division closes the menu and writes the same status line. No special case.

**M4. What right-click does not do.**
- The right-button `pointerdown` and the `contextmenu` do not select, deselect, seek, move the insert marker, start a marquee, start a move or trim, or write history.
- Today's handlers already ignore `button !== 0`; that must stay true.

**M5. When it does not open.**
- While a pointer gesture is active (`isPointerGestureActive()`), no menu opens. The native menu stays suppressed (M1).
- While the export dialog is open, no menu opens (the dialog is modal).

**M6. Only one menu.**
- At most one grid menu is in the DOM.
- A `contextmenu` while it is open replaces its position; there is still one instance. No extra state is needed.
- In a real browser the second right-click's `pointerdown` already closes the menu (M9), and M10 restores focus before the `contextmenu` reopens it.

**M7. Keyboard (WAI-ARIA menu pattern).**
- On open, focus moves to the checked division item.
- `ArrowDown`/`ArrowUp` move focus through all 8 items with wrap. `Home`/`End` go to the first/last. `Enter` and `Space` choose the focused item.
- `Escape` closes without a change. `Tab` closes without a change, and its default is not prevented.
- **Every key event inside the menu is stopped there**, so the workspace's window `keydown` handlers (`StudioWorkspace.tsx` l.1298 and the floating-video `Escape` branch at l.1079) never see it. Concretely, with the menu open:
  - `Space` does not toggle playback;
  - `G` does not toggle Snap (only the item does);
  - `Delete`/`Backspace` do not delete the selection;
  - `Ctrl+Z` does not undo;
  - `ArrowLeft`/`ArrowRight` do not nudge a clip or the brace;
  - `Escape` does not return an expanded floating video.

**M8. Closing without a change:** `Escape`, `Tab`, a press outside the menu, a scroll of `arrangement-timeline-scroller`, a window `resize` or `blur`, or the workspace unmounting.

**M9. The dismissing press is consumed.**
- A `pointerdown` outside the menu while it is open closes the menu, and **that press does nothing else**: no selection, no seek, no marquee, no drag.
- Use a capture listener registered while the menu is open, which calls `preventDefault` + `stopPropagation`. This matches a native context menu, where the dismissing click does not reach the page.
- A `pointerdown` inside the menu does not close it.
- The capture listener is removed on close and on unmount (no leaked listener; testable via a second outside press after close doing its normal action).

**M10. Focus return.**
- The menu stores `document.activeElement` at the moment it opens from closed, which is after the pointerdown capture of §0.2 ran.
- On a close **without** a choice, it restores focus there if that element is still connected and is not `document.body`; otherwise it leaves focus alone.
- On a close **with** a choice, the same rule applies.

**M11. Position and look.**
- `position: fixed` at the event's `clientX`/`clientY`, clamped so the whole menu stays inside the viewport (≥ 4 px margin).
- jsdom cannot measure the menu, so unit tests check the inline `left`/`top` for an in-bounds point. C checks the clamp in the browser.
- Design tokens only: `bg-surface`, `border-outline`, `text-foreground`; the checked marker in `text-accent`; focus `ring-brand`; a z-index above the timeline chrome. No hardcoded colours and no custom CSS.
- Item height ≥ 24 px, a mono/tabular label like the `<select>`.
- **Markup and Biome a11y (decides the conflict between "no comments" and "0 diagnostics"):**
  - Preferred: a native container (`<menu>` or a `<div role="menu">` that Biome accepts) holding `<button type="button" role="menuitemradio">` / `role="menuitemcheckbox"` items, with roving `tabIndex` on the buttons. Then no suppression is needed.
  - If Biome still flags the container role, exactly the repo precedent is allowed: one `// biome-ignore lint/…: D-29z22 requires role=menu` line, as in `ArrangementLoopBrace.tsx` l.206/208. Record it as a deviation.
  - No other comments.

**M12. Keyboard ContextMenu key / Shift+F10:** no extra handling this round. Lanes are not focus targets, and the header `<select>` plus `G` are the keyboard path. Recorded as a deliberate limit, not a defect.

### 0.2 Rule D-29z22-F: C-R51-02 (keyboard ownership follows the last timeline press)

- Extend `releaseEditFocusOnTimelinePointerDown` (`StudioWorkspace.tsx` l.930). When the focused element is inside the loop brace (`isLoopBraceTarget(focused)`, l.260) and the press target is **not** inside the brace, blur it.
  - This applies to any button (a right-click on a lane releases the brace too, and the menu's focus-return value is then `body`, so it is not restored, per M10).
  - The existing guards stay: not during an active pointer gesture, and not on the scroller gutter.
- A press **inside** the brace (body or edges) keeps the brace focused.
- The other branches (range inputs, typing targets) are unchanged.
- D-29z17 rule and tests: a clip header click → `ArrowRight` nudges the clip; the LK-CLIP order (clip header, then brace, then `ArrowRight`) still moves the brace; `gesture-guard` brace fixtures stay green.

### 0.3 Rule D-29z22-T: C-R48-01-GRID-RESIDUAL

- Each of the 7 top-level `describe` calls gets `{ timeout: 15_000 }` as its second argument:
  - `grid-snap-ui.test.tsx` l.281, l.391 and l.635;
  - `grid-snap-loop-drop.test.tsx` l.355, l.469, l.581 and l.700.
- This is exactly the D-29z21 form. No other change in those two files: no assertion, no `it`, no order, no helper.
- A Biome re-indent is allowed only if it is token-equivalent by C's round-56 method (R56-S-DEV1 ruling).
- **The new mounting test file gets the same suite option from birth.** D-29z21 applies to StudioWorkspace-mounting suites. A new file has no 5 s history that the option could mask, and a hang still fails at 15 s. This rule wins over "evidence-only", and B records the choice.

### 0.4 Source

| File | Change |
|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | **new.** Presentational menu: props for items, checked value, Snap state, position, `onChoose`, `onToggleSnap`, `onClose`. Follow `prompts/new-component.md` and `FORWARDREF_COMPONENT.md`. Keyboard and outside-press handling live here. |
| `app/components/arrangement/StudioWorkspace.tsx` | menu state (open, x, y, the stored focus element), the `onGridMenuRequest` handler (M5 guards), render `<ArrangementGridMenu>`, close-on-scroll/resize/blur, pass the prop to each `ArrangementLane`; the §0.2 fix. CRLF preserved. |
| `app/components/arrangement/ArrangementLane.tsx` | one optional prop `onGridMenuRequest?: (event: MouseEvent<HTMLDivElement>, trackId: string) => void` and `onContextMenu` on the l.720 element, which calls `preventDefault()` and then the prop. Nothing else. |

- **Frozen:** `grid.ts` (no new helper is needed), `ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `components/arrangement/index.ts`.
- No comments, no `any`, no type assertions, no `@ts-ignore`, semicolons, Georgian UI text.

### 0.5 What could be affected (C checks)

- Header `<select>` and `G` (same state); lane grid lines; every stage 1–4a snapping path (one division change in GM5 proves the shared state).
- Left-button gestures on lanes and clips (marquee, move, trim, range, seek, library drop) must not change. Today's `button !== 0` returns stay.
- Brace keyboard and pointer behaviour (LK-*, LB-*), `gesture-guard`, `render-budget`, `floating-video`, `export-dialog-focus*`.
- The full suite: **88 files / 1523**.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-component.md`, `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-56-r57-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `(cd ../tmp/studio-real-loop/b-round-56-r57-snapshots && sha256sum -c SHA256SUMS.txt)` and `cmp` each owned file with its snapshot;
   - protected files 4/4; Biome numbers; `node.exe`; dev-server state.
3. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1–§0.4.

### 2.2 Tests

**New file:** `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (LF).
- It mounts `StudioWorkspace` with the same harness pattern as `grid-snap-ui.test.tsx`. A copied harness is the existing pattern; the copied-harness signal stays with root's checkpoint.
- Its top-level `describe` calls carry `{ timeout: 15_000 }`.
- **Focus in jsdom:** `fireEvent.pointerDown` has no default action and does not move focus. In FR1–FR4 (and GM11) focus the element explicitly with `element.focus()` before the press, and assert `document.activeElement` before the press too, so the test cannot pass trivially. The real-click version is C's R57-FOCUS.
- **Exactly these 19 `it`**, each named with its ID:

| ID | Setup → action | Must assert |
|---|---|---|
| GM1 | empty audio lane background → `fireEvent.contextMenu` at (300, 200) | `fireEvent` returns `false` (default prevented); one `role=menu` named `ბადის დანაყოფი`; 7 `menuitemradio` in `GRID_DIVISIONS_SECONDS` order with `formatGridDivision` labels; only the current one `aria-checked=true`; one `menuitemcheckbox` `Snap (G)` with `aria-checked` = Snap state; menu inline `left: 300px; top: 200px` |
| GM2 | a selected audio clip → right-button `pointerDown` (`button: 2`) + `contextMenu` on another clip's body | menu opens; selection ids, every clip's start/track/duration, playhead, insert marker, loop and undo availability are identical before and after; no marquee element |
| GM3 | video lane: empty area and then the video clip body | menu opens both times (one instance) |
| GM4 | Snap on (Snap starts **off** in the workspace, `useState(false)` l.324; press `G` first) → open → choose `0.25 წმ` by click | `data-grid-seconds="0.25"` on `arrangement-grid-control` and on every lane timeline; the `<select>` value `0.25`; status exactly `ბადე: 0.25 წმ (Snap ჩართულია)`; menu gone; `Ctrl+Z` afterwards does **not** change the division and the arrangement is value-equal to before |
| GM5 | own setup: Snap on (`G`), choose `0.25 წმ` from the menu, then drag a clip by a raw delta that lands between 0.25 lines | the release start is a 0.25 multiple (the menu drives the same snap state) |
| GM6 | Snap off (default) → choose `Snap (G)`; reopen → choose it again | `data-snap` `off` → `on` → `off`; the status equals the `toggleSnap` text each time (`Snap ჩართულია — ბადე 1 წმ (G)`, then `SNAP_OFF_MESSAGE`); the item's `aria-checked` matches on reopen; menu gone after each choice |
| GM7 | open → keys | focus on the checked item; `ArrowDown` ×8 returns to it (wrap); `ArrowUp` from the first goes to `Snap (G)`; `Home`/`End`; `Enter` on `0.5 წმ` chooses it; reopen, `Space` on `2 წმ` chooses it **and `isPlaying` is unchanged** |
| GM8 | expanded floating video → open menu → `Escape` | menu gone; division unchanged; the video is **still expanded** |
| GM9 | a selected clip, menu open, focus in menu → `G`, `Delete`, `Backspace`, `ctrl+z`, `ArrowRight`, `ArrowLeft` | Snap, the clip set, every clip start and the undo state are unchanged; the menu is still open |
| GM10 | menu open → left `pointerDown` + `pointerUp` on an unselected clip | menu gone; that clip is **not** selected and not moved. A second identical press after close selects it (listener removed) |
| GM11 | focus the header Snap button → `contextMenu` on a lane (no pointerdown) → `Escape` | `document.activeElement` is the Snap button again |
| GM12 | start a left-button clip drag (pointerdown + move) → `contextMenu` on a lane | no menu; default prevented; finishing the drag behaves as without the right-click (same start as a control drag) |
| GM13 | menu open → `scroll` on `arrangement-timeline-scroller`; reopen → window `resize`; reopen → window `blur` | menu gone each time; division unchanged |
| GM14 | `contextMenu` on a track header, the ruler, the loop strip and a library row | each `fireEvent` returns `true`; no menu |
| GM15 | playing (`api.togglePlayback()`; harness clock) → open menu → choose `0.5 წმ` | `isPlaying` stays `true`; the position keeps advancing after the clock advances |
| FR1 | C-R51-02: select clip, `brace.focus()` (assert it is active) → press + click on the clip **header** → `ArrowRight` | `activeElement` is not inside the brace; the clip start moved by one nudge step; the loop is unchanged |
| FR2 | LK-CLIP order: clip header press, then `brace.focus()` + brace press, then `ArrowRight` | the brace moved; the clip is unchanged |
| FR3 | select clip, `brace.focus()` (assert) → right-button `pointerDown` + `contextMenu` on the empty lane → menu → `Escape` → `ArrowRight` | focus was not restored to the brace; the clip moved; the loop is unchanged |
| FR4 | `brace.focus()` (assert) → press on the brace's start edge, release without moving → `ArrowRight` | the brace still has focus and moves (a press inside the brace keeps it) |

**Expected count:** vitest **88 files / 1523** (1504 + 19). The two grid-snap files keep **20 and 27** `it`.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Make a scratch copy with a `node_modules` junction and your own vitest config, as in round 56. Each mutation, run on the new file plus `grid-snap-ui` and `gesture-guard`, must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | drop `preventDefault()` in the lane `onContextMenu` | GM1 |
| b | division item calls `setGridSeconds` directly (no `changeGridDivision`) | GM4 |
| c | remove the key-event stop in the menu | GM7 or GM9, and GM8 |
| d | remove the outside-press consumption (M9) | GM10 |
| e | remove the `isPointerGestureActive()` guard (M5) | GM12 |
| f | revert the §0.2 brace blur | FR1, FR3 (FR2 passes) |
| g | blur the brace on every press, including inside it | FR2 or FR4 |

Write `a-round-57/mutations.txt` with the command, each result line and the failing test names. If a mutation survives, **strengthen that test** within §2.2; do not add tests outside the list.

### 2.4 After the change

- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **88 / 1523, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:**
  - read-only `npx biome check ./app` must show ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings and 1 info;
  - the LF owned and new files: 0 diagnostics;
  - `StudioWorkspace.tsx`: `biome lint` 0, and the stdin format check (Baseline) shows no change besides EOL.
- **Review:** run the real `code-reviewer` subagent on the diff (6+ files). Put findings and dispositions in the report. **Architecture notes** go to B (`a-round-57.md` §6), not into code.
- **`/check`:** `npm run verify` → exit 0, run quietly with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (only if the server is up):** one gstack load of `/studio-lab` at 1440×900 with a clean console (apart from the known `/api/cart`), plus one PW right-click on a lane showing the menu. This is not a PASS claim.

### 2.5 Doc 050

New file `docs/implementation/2026/quarter-IV/050-studio-lab-grid-menu-stage-4b1.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 57 — D-29z22; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** the user transcript 2.srt 06:41–07:53; Live 12 §6.10; C-R51-02; the grid residual;
- **Approach:** M1–M12, F, T, with the alternatives:
  - lane background only;
  - menu state per lane;
  - narrow/widen items now;
  - not consuming the dismissing press;
- **Architecture:** one Mermaid diagram (contextmenu → StudioWorkspace state → ArrangementGridMenu → `changeGridDivision`/`toggleSnap`);
- **Changed files;**
- **Problems and solutions;**
- **Testing:** GM1–GM15, FR1–FR4, mutations, gates;
- **Ableton** (the §4.8 table);
- **TODO:** 4b-2 (keys, Ctrl+digit, C-R51-01 probe, INFO-R55 tests), 4c, the browser half.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | A | new (§0.4) |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.1, §0.2 (CRLF kept) |
| `app/components/arrangement/ArrangementLane.tsx` | A | one prop + `onContextMenu` (§0.4) |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | A | new, exactly GM1–GM15, FR1–FR4 |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | A | 3 describe second arguments only (§0.3) |
| `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | A | 4 describe second arguments only (§0.3) |
| `docs/implementation/2026/quarter-IV/050-studio-lab-grid-menu-stage-4b1.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-57.md`, `a-round-57/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-57.md`, `c-round-57.json`, `c-round-57/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:**
- **Case A: 25 lines.** The 22 baseline lines (`StudioWorkspace`, `ArrangementLane` and `grid-snap-ui` stay ` M`; `grid-snap-loop-drop` stays `??`), plus 3 new `??` lines: the menu component, the menu test and doc 050.
- **Case B:** the remaining baseline lines, plus ` M` for any of the 4 owned files that root committed, plus the 3 new `??` lines.

The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-56-r57-tree-sha256.txt` and everything else under `store/`. This includes `grid.ts`, `selection.ts`, `ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `components/arrangement/index.ts`, every other test file and docs 001–049.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:**
  - new dependencies or installs; deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments; mutations run in scratch only;
  - killing processes you did not start; starting or stopping the dev server;
  - `npm run format`;
  - deleting `playwright-report/` or `store/nul` (root's call).

## 4. Acceptance (C)

**Checkpoint order:** G57-2 → R57-S → R57-U → G57-1 → (servers up) R57-MENU, R57-FOCUS, R57-PLAY, R57-LOOK → the carried 4a half (§4.7) → G57-3.
- Write `c-round-57/checkpoint.md` as you go.
- If the server is down at the start, check again after the offline items and once more before the report, and record each check. Do not start it.

### 4.1 R57-S — static (read-only)

- `diff -u --strip-trailing-cr` against the snapshots:
  - `ArrangementLane`: only the prop and `onContextMenu`;
  - `StudioWorkspace`: only §0.1/§0.2 hunks;
  - the grid-snap files: only the 7 second arguments, token-equivalent by C's round-56 method;
  - `it` counts 20 / 27 unchanged.
- **EOL:** `StudioWorkspace.tsx` has every line CRLF with 0 bare LF; every other owned or new file is LF with 0 CRLF.
- No `any`, assertions, `@ts-ignore`, comments or hardcoded colours. Tokens only.
- No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts. The new file has exactly the 19 IDs.
- Frozen list 410 OK; protected 4/4. Doc 050 exists with the §2.5 sections.
- The left-button guards are unchanged: `handleLaneBackgroundPointerDown`'s `event.button !== 0` return (`StudioWorkspace.tsx` l.963) and the Lane height-separator return (l.463) are intact, and Clip/Ruler/Brace are frozen and byte-identical.

### 4.2 R57-U — unit and mutation (C's own scratch, own strings)

- Re-run the mutations a–g in your own scratch with your own edits. Each must kill its named tests.
- **C extras (info):**
  - (h) the menu closes on choice but does not restore focus (M10) → which test fails? If none, it is a Low test gap and not a round failure.
  - (i) the menu re-stores the focus element on a `contextmenu` while it is already open (M6/M10) → record the result (info).
- Run the 19 new tests alone and record the durations. Any test > 3 s alone is info.

### 4.3 G57-1 — gates

- tsc 0; build passes.
- Read-only Biome `./app` within the baseline; the LF owned and new files have 0 diagnostics; `StudioWorkspace` lint 0 and the stdin format check unchanged.
- vitest = **88 files / 1523, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, run quietly, with at most two quiet attempts, each recorded. If neither attempt is rc 0, G57-1 is FAIL.
- No load run this round. C-R48-01 is closed (form 2), and any `Test timed out` in any file is recorded with file, test and ms.

### 4.4 G57-2 — tree

- Protected files 4/4 OK; frozen list all OK.
- `git status --short` matches §3.1 (25 lines in case A); HEAD at start and end.

### 4.5 Not run if the servers are down

Write "not run (environment)" for §4.6, §4.7 and G57-3, and say plainly in the summary that this is the sixth round.

### 4.6 Browser acceptance of 4b-1 (servers up; REAL-mouse (PW) for right-clicks and drags, gstack for keys)

Layout L52 (`tasks/round-55.md`). Test at **1440×900**, then repeat the starred items at **1280×720**.

| ID | Steps | Pass |
|---|---|---|
| MN-OPEN* | right-click on an empty music lane, on an SFX clip body and on the video lane | the CZABA menu appears at the pointer each time, with no Chrome native menu; 8 items, the current one checked |
| MN-EDGE* | right-click 5 px from the right and the bottom viewport edges | the menu is fully visible (clamped) |
| MN-NATIVE | right-click on a track header, the ruler and a library row | the Chrome native menu appears (no CZABA menu) |
| MN-CHOOSE | choose `0.25 წმ`; then drag a clip with Snap on | header `<select>` = 0.25; lane lines denser; the drag lands on 0.25 multiples (record V with full precision) |
| MN-SNAP | choose `Snap (G)` twice | `data-snap` off then on; status lines as for `G` |
| MN-KEYS | open, then `ArrowDown`, `Enter`; reopen, `Escape` | keyboard choose works; `Escape` changes nothing; `Space` inside the menu does not start playback |
| MN-DISMISS | open, then left-click on an unselected clip | the menu closes; the clip is not selected or moved |
| MN-NOEDIT | with a selection: right-click on another clip | the selection, clip positions, playhead and undo state are unchanged |
| R57-FOCUS (C-R51-02) | the C round-51 §8.1 sequence: brace focus → REAL click on a clip header → `ArrowRight` | the clip moves, the brace does not; the LK-CLIP order still moves the brace |
| R57-PLAY (real audio) | play from 0 with an SFX clip at 4 s, open the menu at about 2 s, choose `0.5 წმ`, close | no gap: the master/track meter stays non-zero across the choice, and the playhead advances monotonically (sample every 100 ms); the SFX onset is at 4.0 s ± 0.03 |
| R57-LOOK* | screenshot the open menu | tokens only (graphite surface, outline border, accent check, brand focus ring); text readable; no clipping |

### 4.7 Carried stage-4a browser half (servers up)

App code for 4a is unchanged since round 55. Run **exactly** the round-55 procedures from `tasks/round-55.md`:
- §4.4 R55-SHIFT (SH-CROSS, SH-SAME, SH-NOTE);
- §4.5 R52-EDGE;
- §4.6 R54-CROSS (CX-VIDEO, CX-NOTE);
- §4.7 R53-LANE, R52-TRIM, R52-PLAY (real audio: EP-VIDEO, EP-OFF, EP-CROSS, EP-SHIFT);
- §4.8 R52-REG and REG-HYD.

Use the same layout, labels, expected values and order (R52-EDGE before R55-SHIFT), and record V with full double precision. If the budget runs out, record where you stopped. Partial evidence is reported as partial, never as PASS.

### 4.8 G57-3 and the Ableton table

**G57-3 (anonymous workspace and purchase protection; last browser PASS in round 51).** Run it only if the servers are up, with a fresh browse state.
- `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- No request goes to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and workspace code sends no `Authorization` header, including during the right-clicks and drags.
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401.
- `/studio/middle-east` shows "Sign in required".
- Known and allowed requests: root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton** (workflow addendum 2026-10-11):
- **Source:** Live 12 Reference Manual ch. 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/` §6.10 "Using the Editing Grid". It comes from B's capture `b-round-46/ableton-6.7-6.10-20261016.txt` (captured 2026-10-16, re-used 2026-10-17). No video was watched and no Live installation was used.
- **The user request is separate:** `docs/video-to-text-bugs/transcripts/2.srt` 00:06:41–00:07:53.
- **C gives two verdicts per row:** the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / does not apply). Never write "Ableton does it this way" for an unconfirmed or no-source row.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Grid width chosen from a context menu on the track lanes | §6.10: "set the width of both zoom-adaptive and fixed grid lines using the context menu available in … the Arrangement View track main lanes" | yes | same entry point on audio and video lane timelines; the items are CZABA's seconds divisions (no meter until SRW-15), with no adaptive/fixed modes and no triplets → **deliberate difference** in content | GM1, GM3, MN-OPEN |
| Grid items on a clip's context menu | — | unconfirmed (no source) | CZABA opens the same menu on clip bodies (user: "right-click"; clips have no other menu) | GM2, MN-NOEDIT |
| Snap on/off | §6.10: Ctrl+4 toggles snapping (Options menu) | yes (shortcut/menu); **in the context menu: unconfirmed** | user asked for "free" next to the grid choice → `Snap (G)` item; `G` stays the shortcut (Ctrl+4 not used; Chrome) | GM6, MN-SNAP |
| Current spacing shown | §6.10: shown above the time ruler, lower right | yes | CZABA shows it in the header grid control (existing) → **deliberate difference** in placement | GM4 (select value) |
| Right-click does not edit | — | unconfirmed | CZABA decision M4 | GM2, MN-NOEDIT |
| Keyboard ownership after a timeline press (C-R51-02) | §6.6 (Select Loop is a selection model) | unconfirmed | CZABA rule D-29z17 | FR1–FR4, R57-FOCUS |
| Narrow/widen Ctrl+1/Ctrl+2 | §6.10 | yes | **not this round** → 4b-2, after B's Chrome Ctrl+digit check | — |

### 4.9 Not run this round, and carried items (honest)

**Not run (not PASS) unless §4.6/§4.7 run:**
- the 4b-1 browser acceptance;
- the stage-4a browser acceptance;
- G57-3.

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`; G3-R, G3-3, G3-shots);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- a real `pointercancel`.

**Open C bugs:**
- C-R53-01, C-R54-01, C-R54-02 (fixed at unit/probe level; browser pending);
- C-R51-02 (this round); C-R51-01 (→ 4b-2 probe);
- C-R52-T1 (→ 4c);
- C-R48-01-GRID-RESIDUAL (this round);
- C-R41-01 (TL-Q-VIEWPORT);
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead).

**Open Low / info:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE, R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE, A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG, A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS, INFO-R55-FREE-ROUND-UNGUARDED (→ 4b-2), A-R55-REVIEW-SHIFT-MIDDRAG-TEST (→ 4b-2).

**`root-pre-push-review.md` (mtime 2026-10-07, unchanged):**
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
- **Partially measured:** R5-L3.
- **Unit tests only:** R5-L5, R5-E1, R6-S2 and R6-S3.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value makes every consumer re-render.
- **Lows:** L1 (undo/redo unguarded during a gesture), L2 (`holdUntil` on a reschedule in the hold window), L3 (Delete ignores `event.repeat`), L4 (`setPointerCapture` throw leaves gesture state), L6 (export-dialog wording with the loop on), L7 (unbounded history), L8 (unguarded `new AudioContext`).

**`publication-checkpoint.json` (mtime 2026-10-17 11:11, unchanged):**
- SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
- Instruction files need portable paths.
- **Scrollbar refinement:** tokens on both timeline axes and the library; wheel, keyboard and drag preserved; checks at 1280×720 and 1440×900.
- **Library and stems parity:** the SRW-12 tree and the SRW-11 panel; audible, honestly labelled demo stems; find → stems folder → preview → drag.
- T12 continuation.

**Root items:**
- ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53 (fifth round; §6);
- ROOT-COMMIT-ROUND51: units 50–55 and 56;
- ARCH-CHECKPOINT-SRW14-PREFS and ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- the CRLF Biome errors on auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; the stray `store/nul`; the git autocrlf warning on LF files.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T with INFO-R53-NARROW-GAP), plus **R57-T:** a right-click on a lane in the Tech Lead's own Chrome shows the CZABA menu, not Chrome's, and choosing a division feels immediate.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-56-r57-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-56-r57-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementLane.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-56-r57-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
node -e "const s=require('fs').readFileSync('app/components/arrangement/StudioWorkspace.tsx','utf8');console.log((s.match(/\r\n/g)||[]).length,(s.match(/\n/g)||[]).length)"
npx vitest run app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app --diagnostic-level=error --max-diagnostics=100
npx biome check ./app
npx biome check app/components/arrangement/ArrangementGridMenu.tsx app/components/arrangement/ArrangementLane.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
npx biome lint app/components/arrangement/StudioWorkspace.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A; needed for C and for completion)

1. **Servers, fifth round:** start the Store dev server and the backend before C, **or answer yes/no: can they be restored in this environment?**
   - **Yes / started:** C runs §4.6, §4.7 and G57-3 this round.
   - **No:** that is external missing information. B then asks the user how completion is to be evidenced without a browser, because COMPLETE needs browser evidence and the purchase-protection check.
   - **Silence:** B keeps dispatching dependency-ordered offline-verifiable stages and records the growing browser debt, ID by ID.
2. **Commit units:**
   - Rounds 50–55 (17 paths) on root's decision: C found no open defect, but there is no browser evidence.
   - **Round 56** (4 test files + doc 049) is commit-ready on C's round-56 PASS (`test(store): CZABA… C-R48-01 timeout headroom`).
   - Committing both **before A starts round 57** keeps round 57 a separately reviewable unit. Otherwise round 57's `StudioWorkspace`/`ArrangementLane`/`grid-snap-*` hunks join the same uncommitted files.
3. **ARCH-CHECKPOINT-SRW14-PREFS (bounded, non-gating; feature boundary plus the fifth round on one owner):** the time-precision rule in four places; the StudioWorkspace view/edit-prefs question, now with a fifth consumer (the grid menu); `handlePointerMove` scope; the copied test harness.

   Answer format: keep/extract, value, risk, ≤ 3 sentences. An approved change becomes its own B task with one owner.
4. **C-R48-01:** closed (form 2). A root `testTimeout` or worker cap is still the systemic lever (A round-56 note) and is welcome; it is not required.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-57.md`:**
1. the pre-flight gate and the §1.2 baseline (case A/B);
2. the diff summary per file with EOL counts;
3. tests GM1–GM15 and FR1–FR4 with alone-durations;
4. mutations a–g;
5. smoke (if any);
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-57.md` and `c-round-57.json`** (usual schema). Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment). Cover:
- R57-S, R57-U, G57-1, G57-2;
- §4.6 (MN-*, R57-FOCUS, R57-PLAY, R57-LOOK), §4.7 and G57-3, or "not run (environment)";
- the Ableton rows;
- the carried items.

`passed` lists only IDs run this round. State **commit readiness** for root, separately for round 57, round 56 and rounds 50–55.

**Next (orientation only):**
- **Round 58:**
  - If round 57 fails → those bugs first.
  - Otherwise **stage 4b-2**:
    - narrow/widen keys (B first checks Chrome's handling of Ctrl+1/Ctrl+2: CTRL-DIGIT-BROWSER-RESERVED);
    - the C-R51-01 probe (browser) or its recorded debt;
    - the INFO-R55-FREE-ROUND-UNGUARDED and SHIFT-MIDDRAG tests.
  - Browser bugs from §4.6/§4.7, if any, come before 4b-2.
- **Then:** stage 4c (C-R52-T1, group-move edges, library-drop edges), SRW-15 (+ stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 57 -StartPhase A` and a higher limit.
