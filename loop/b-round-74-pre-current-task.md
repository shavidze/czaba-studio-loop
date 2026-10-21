# CURRENT TASK — Round 74: SRW-16 (FB-10) stage 2a — move markers (drag + arrows, snap) and the marker context menu, D-29z39

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-21
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` and the LOOP POLICY / Loop v2 / cloud-runner / speed rules in your prompt (they win over older text).
- **Previous task:** `tasks/round-73.md` (exact copy). Rationale: `b-round-73.md`. Decision record D-29z39 in `plan.md`.
- **Round size:** one feature stage, one owner (A). SRW-16 stage 2 is split into **2a (this round)** and **2b (round 75, scheduled, not deferred)**: 2b = snapping clips / range / playhead to markers (Live 6.7) and Ctrl+←/→ (Option+←/→ on macOS, Live 6.9) also stopping at clip edges. The split follows owner clusters: 2a lives in the marker row; 2b touches grid.ts, clip, lane, loop brace and the workspace key handler.

## Why this round
C round 73 (`c-round-73.md`, `.json`): **PASS, `browserVerified=true`**, no bugs. Root gate 73 **published `6b574e8`** (both remotes; reviewer 8.5/10, COMMIT OK, verify 103 files / 1744 tests). SRW-16 stage 1 is done on C browser evidence. Open findings carry no Critical/High bug. The regression round is not due (`regression-last.json` = 2026-10-21, due on/after 2026-10-24). So the next dependency-ordered scope is SRW-16 stage 2.

## Baseline (measured by B, 2026-10-21)
- **HEAD `6b574e853d2c5c4317e38927d9d06ce2a3dba91b`** (gate 73 commit). `git status --short` must be **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-73-r74-tree-sha256.txt`, **445** entries, 445/445 OK (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-73-r74-tree-sha256.txt`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 7 existing owned files below.
- **Snapshots:** `../tmp/studio-real-loop/b-round-73-r74-snapshots/` (`SHA256SUMS.txt`), all LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `markers.ts` | `a677d653` | 157 |
  | `ArrangementMarkerRow.tsx` | `7d83398e` | 431 |
  | `StudioWorkspace.tsx` | `67e1786e` | 2010 |
  | `ArrangementGridMenu.tsx` | `20e8a5b6` | 248 |
  | `markers.test.ts` | `51ea7558` | 301 |
  | `markers-ui.test.tsx` | `d5e854bf` | 833 |
  | `064-studio-lab-markers.md` | `adb44c78` | 94 |
- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers (B, Linux cloud):** `:5173/studio-lab` 200; backend `:5199` unavailable (expected). A and C re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud", never PASS.
- **NEVER** stash, reset, checkout, clean or re-create anything. A mismatch (a different tree, a changed frozen file) means stop and report. Never run `biome check --write`, `format --write`, `npm run format`, `check:fix`.

## 1. What changes (A)

### Behaviour contract (user scope FB-10 + Live 12 manual §6.4; CZABA choices marked)
| # | Behaviour | Contract |
|---|---|---|
| B1 | **Drag a flag** (left button) | Press on a flag selects it and focuses it (explicit `focus({preventScroll:true})`, because the press calls `preventDefault`, like the loop brace). Movement under 3 px (same value as `LOOP_DRAG_THRESHOLD_PX`) is a click: the existing click-jump and double-click-play stay exactly as now. Past the threshold the marker follows the pointer: `time = roundMarkerTime(original + dx / pxPerSecond)`, then `resolveGridTime(time, snapSeconds, gridSeconds, event.altKey)` (Snap on → grid line; Snap off → free ms; Alt held inverts Snap for the drag — free while Snap is on, grid line while Snap is off — the existing SRW-14 `resolveSnapStep` rule, GE-ALT-ENABLE). Clamped at 0. Moving past `projectEnd` is allowed (CZABA choice; markers can already sit there after Cut Time). |
| B2 | Drag preview / commit | Preview through `previewArrangement`; release commits **one** history entry via `commitArrangement(next, 'Move Marker', before)`; status `მარკერი «{name}» გადავიდა: {formatArrangementTime(time)}.`. A drag that ends at the original time commits nothing. The gesture is claimed with `claimPointerGesture` (plus `setPointerCapture`, with `watchUncapturedPointerGesture` as fallback — the loop-brace pattern), so M / menu actions / Delete during the drag are refused with `GESTURE_EDIT_BLOCKED_MESSAGE` like other gestures. The claim's abort callback restores `before` if the drag moved. |
| B3 | **No click after drag** | After a drag that passed the threshold, the browser's `click`/`dblclick` on the same flag must NOT jump the playhead or start playback. |
| B4 | **Collision** | A marker may not land within `MARKER_TIME_EPS` of another marker. During a drag the preview stays at the last valid time; on release that time is committed. For arrows: the step is refused, status `ამ დროზე მარკერი უკვე არის: «{other}»`, no history entry. (CZABA choice; merging exists only in Cut Time.) |
| B5 | **Arrows on a focused flag** (plain ←/→, no modifiers, `target === currentTarget`) | Snap on → `adjacentGridLine(time, snapSeconds, dir)`; Snap off → ±0.1 s (same size as clip nudge). At 0 with ← → status `მარკერი დროის დასაწყისშია.`, nothing changes. One history entry `Move Marker` per press (key repeat allowed, as clip nudge). Focus stays on the flag; the flag stays selected. `preventDefault` + `stopPropagation`, consistent with the F2/Delete branches; the primary protection against also nudging a selected clip is the window branch's existing `!isMarkerTarget` guard. Ctrl/Meta/Alt+arrows still go to the window (Ctrl+←/→ stays marker navigation). |
| B6 | Order invariant | `moveMarker` in `markers.ts` re-sorts by time (`adjacentMarkerTarget`, label widths and Cut Time rely on sorted order). Moving keeps `id` and `name`. |
| B7 | **Right-click a flag** | `preventDefault` of the native menu; the marker becomes selected and focused, and a CZABA menu opens at the pointer (clamped into the viewport with a 4 px margin, like the grid menu). Items in this order: `სახელის შეცვლა (F2)`, `დაკვრა აქედან`, `წაშლა (Delete)`. Actions apply to the **right-clicked** marker even if another flag had focus. |
| B8 | Keyboard open | `Shift+F10` and the `ContextMenu` key on a focused flag open the same menu anchored at the flag's bottom-left. |
| B9 | Menu behaviour | `role="menu"`, items `role="menuitem"`; first item focused on open; ↑/↓ wrap, Home/End, Enter/Space activate, Escape closes and returns focus to the flag; Tab closes. An outside press closes the menu and does nothing else (the grid menu's swallow rule). At most one CZABA menu is open at a time. |
| B10 | Menu actions | **Rename** opens the existing name editor for that marker (Enter commits `Rename Marker`, Escape cancels; focus returns to the flag, as with F2). **Play from here**: stopped → jump to the marker and start playback; playing → jump and keep playing (same as double-click; no new transport code). **Delete** = the existing `removeMarker` (one `Delete Marker` entry, focus to the neighbour flag or `+`). |
| B11 | No audio resync | Marker moves never change `scheduleKey`: during playback a drag or an arrow move creates **0** extra `AudioBufferSourceNode`s and the position keeps advancing. |
| B12 | a11y text | Flag `aria-keyshortcuts="F2 Delete ArrowLeft ArrowRight Shift+F10"`; `MARKER_FLAG_HINT` adds drag, arrows and right-click. Keep `aria-current` (C harnesses use it). |

### Files and change
- **F1 `app/lib/arrangement/markers.ts` (additive):** `moveMarker(arrangement, id, time)` with a discriminated result: moved arrangement / unchanged (same reference) / conflict carrying the other marker (so the row can name it). Uses `roundMarkerTime`, re-sorts, keeps id and name. No React import.
- **F2 `app/components/arrangement/ArrangementMarkerRow.tsx`:** drag gesture (B1–B4), arrows (B5), context-menu open (B7, B8), menu actions (B10), a11y text (B12). New props `snapSeconds: number | null` and `gridSeconds: number`. Reuse `previewArrangement`, `commitArrangement`, `claimPointerGesture`, `isPointerGestureActive` from `useArrangement`, and `watchUncapturedPointerGesture` from `./ArrangementClip` (import only).
- **F3 `app/components/arrangement/ArrangementMarkerMenu.tsx` (new):** small menu (B9), Tailwind tokens only. Follow `prompts/new-component.md`; justify in the report whether `forwardRef` is needed (FORWARDREF_COMPONENT).
- **F4 `app/components/arrangement/ArrangementGridMenu.tsx` — narrow grant:** the only allowed edit is adding `export` to `armGridMenuDismissClickSwallow`, so F3 reuses the swallow rule. No other byte changes.
- **F5 `app/components/arrangement/StudioWorkspace.tsx` — narrow grant:** only pass `snapSeconds={snapEnabled ? gridSeconds : null}` and `gridSeconds={gridSeconds}` to `<ArrangementMarkerRow>` (~l.1856), exactly as `ArrangementLoopBrace` receives them. No key-handler or blur-clause change. If A finds a window branch must change for B5, stop and report instead of editing.
- **F6 tests:** `app/lib/arrangement/__tests__/markers.test.ts` (add MK-MOVE unit cases); new `app/lib/arrangement/__tests__/markers-move-ui.test.tsx`. `markers-ui.test.tsx` — **narrow grant:** only MU8e's two flag-press assertions (l.633–640) may change, to "the pressed flag (or the flag of the pressed label) becomes `document.activeElement`", which matches real Chromium (C73-2c). Its name-editor half and every other test stay byte-identical. Leave the file untouched if MU8e still passes.
- **F7 docs:** new `docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md` (TEMPLATE sections, Georgian, LF). Doc 064: status line only (stage 1 done, published `6b574e8`; stage 2a → doc 065).

### Required tests (meaningful; do not weaken existing ones)
- **Unit (`markers.test.ts`):** MK-MOVE1 moves and re-sorts (a marker that passes another changes order; `adjacentMarkerTarget` follows); MK-MOVE2 a conflict within EPS returns the other marker and leaves the arrangement unchanged; MK-MOVE3 clamps at 0 and rounds to ms; MK-MOVE4 unknown id / same time → unchanged, same reference.
- **UI (`markers-move-ui.test.tsx`, jsdom with the pointer-capture stub used in markers-ui):** MV1 drag with Snap on (1 s) lands on the grid line, one `Move Marker` undo entry, Undo restores, Redo re-applies; MV2 Snap off → ms time; Alt with Snap on → free; Alt with Snap off → grid line; MV3 movement under the threshold = jump only, no history; MV4 click after a drag does not seek; MV5 dragging onto another marker keeps the last valid time; MV6 arrows Snap on/off, ← at 0 status, collision refusal, focus stays on the flag, a selected clip does not move; MV7 Ctrl+→ on a focused flag still navigates (no move); MV8 a press focuses the pressed flag; MV9 contextmenu → menu with the 3 items in order, the selected marker is the right-clicked one even when another flag was focused; MV10 Rename / Play from here (stopped → playing; playing → seek only) / Delete through the menu; MV11 Shift+F10 and the ContextMenu key open it; ↑/↓/Escape/Tab; Escape returns focus to the flag; an outside press closes and does not act; MV12 during another active gesture the menu actions and a drag are refused with `GESTURE_EDIT_BLOCKED_MESSAGE`.
- **Mutation proofs (A runs and records; restore + `cmp` after each):** (i) remove the re-sort in `moveMarker` → MK-MOVE1 red; (ii) remove the "moved" guard on click → MV4 red; (iii) drop the explicit focus on press → MV8 red; (iv) remove the `target === currentTarget` guard for the flag's arrow branch → MU8f red (ArrowRight from a label span must not move the marker); dropping only `stopPropagation` is expected to SURVIVE because of the window `!isMarkerTarget` guard (defense-in-depth, as round-72 mutation h) — record it, do not fix; (v) drop the collision check → MK-MOVE2 / MV5 red.
- **A's checks (speed rules):** `npm run typecheck`, `npm run lint`, `npx vitest run app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/markers-move-ui.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx` plus the grid-menu test files (`grep -l ArrangementGridMenu app/lib/arrangement/__tests__`). No full suite, no `npm run verify` (root gate). **Code-reviewer is required** (3+ files). Pass its Architecture note to B as a signal.

## 2. Pre-flight for A
Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `TAILWIND_FIRST`, `DESIGN_TOKENS`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/new-component.md`, `prompts/studio-feature.md`. Then verify the baseline (HEAD, empty status, frozen 445/445, snapshots 7/7, protected 4/4, EOL). Process count: `pgrep -c node`.

## 3. File ownership (exact)
Writable: `app/lib/arrangement/markers.ts`, `app/components/arrangement/ArrangementMarkerRow.tsx`, `app/components/arrangement/ArrangementMarkerMenu.tsx` (new), `app/components/arrangement/ArrangementGridMenu.tsx` (one `export` only), `app/components/arrangement/StudioWorkspace.tsx` (two props only), `app/lib/arrangement/__tests__/markers.test.ts`, `app/lib/arrangement/__tests__/markers-move-ui.test.tsx` (new), `app/lib/arrangement/__tests__/markers-ui.test.tsx` (MU8e two assertions only), `docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md` (new), `docs/implementation/2026/quarter-IV/064-studio-lab-markers.md` (status line only). A's report: `a-round-74.md` (+ `a-round-74/` scratch in the loop folder). Everything else is read-only. Expected end `git status --short`: up to 7 `M` lines (6 if `markers-ui.test.tsx` stays untouched) + 3 `??` lines. Only root commits.

## 4. Ableton source table
Source: Live 12 manual, https://www.ableton.com/en/live-manual/12/arrangement-view/ §6.4 "Using Locators", §6.7, §6.9; capture fetched by B on 2026-10-21 (`b-round-71/ableton-arrangement-view-20261021.txt`). gstack `/browse` is not installed in the cloud, so the stored capture is reused; no new research.
| Behaviour | Source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Move a selected locator by drag or arrow keys | §6.4: "Selected locators can be moved by clicking and dragging or by using the arrow keys." | confirmed (text) | same | MK-DRAG-*, MK-ARROW |
| Arrow step size; locator drag snapping to the grid | not stated | unconfirmed | CZABA: grid line with Snap on, 0.1 s with Snap off; Alt inverts Snap during a drag (SRW-14 convention) | MK-DRAG-SNAP, MK-DRAG-FREE, MK-ARROW |
| Two locators at one time | not stated | unconfirmed | CZABA: refused (B4) | MK-MOVE-DUP |
| Locator context menu | §6.4: the menu has Edit Info Text, Loop to Next Locator, Set Song Start Time Here; Rename is in the Edit menu (Ctrl/Cmd+R); Delete key / Delete Locator | the context menu exists (confirmed); its items differ | CZABA menu = Rename / Play from here / Delete (user scope FB-10). Deliberate difference; Loop to Next Locator / Song Start / Info Text are not added (not requested) | MK-MENU* |
| Play from a locator | §6.4: double-click (stopped) plays from it | confirmed | "Play from here" in the menu runs the same action; the menu entry itself is a CZABA choice | MK-MENU-PLAY |
| Clips snap to locators; Ctrl/Option+arrows to locators and clip edges | §6.7, §6.9 | confirmed | **stage 2b, round 75** | — |

## 5. Acceptance (C, real browser, 1440x900 and 1280x720; Playwright + installed Chromium; fresh context per run; C sets the Snap state explicitly — it is off by default)
| ID | Action → expected | Evidence |
|---|---|---|
| MK-DRAG-SNAP | Snap on, grid 1 s. Markers at 5 and 12. REAL mouse drag of flag 5 by ≈ +2.4 s of pixels → `data-marker-time` 7.000; the status names the marker; one Undo label `Move Marker`; Undo → 5.000; Redo → 7.000. | times, undo labels, shots |
| MK-DRAG-FREE | Snap off: the same drag → a non-grid ms time within ±0.05 s of the pointer time. Snap on + Alt held during the drag → free time. Snap off + Alt held → grid line (SRW-14 inversion). | times |
| MK-DRAG-CLICK | Press-release without moving → the playhead jumps, no history entry; drag then release → the playhead does NOT jump to the marker; double-click (stopped) still plays from the marker. | position, isPlaying, undo |
| MK-MOVE-DUP | Drag flag 7 onto 12 → it stays at the last valid time, never two markers at 12.000; an arrow step onto a neighbour 1 s away (Snap on) → refused, the status names the other marker, no undo entry. | times, status |
| MK-ARROW | Focus a flag: → with Snap on → next grid line; Snap off → +0.100; ← at 0 → status, unchanged; a selected clip does not move; Ctrl+→ still navigates to the next marker. | times, clip start |
| MK-DRAG-PLAYING | During playback drag a marker and press arrows on it: playback continues, position advances, **0** extra `createBufferSource` (instrumented counter as in rounds 72/73). | counter, positions |
| MK-MENU | Right-click a flag while another flag is focused → menu with the 3 items in order at the pointer; the right-clicked marker is selected; the menu stays fully inside the viewport near the right/bottom edge; only one menu is open (lane right-click grid menu vs marker menu); ↑/↓/Enter/Escape; Escape returns focus to the flag; an outside click closes it and does not seek/select. Shift+F10 on a focused flag opens it. | screenshots, active element |
| MK-MENU-RENAME / -PLAY / -DELETE | Rename through the menu (Enter → new name, `Rename Marker`, Undo); Play from here when stopped → playing from the marker (±0.15 s); when playing → jump and keep playing; Delete → only that marker removed, focus on the neighbour flag, Undo restores. | values, labels |
| REG-STAGE1 | C73-1 (add marker, click the clip, Delete removes the clip), C73-2 (a)(b) blur paths and (c) another flag focused, MK-DELETE, MK-NAV, MK-CUT-TIME one run, MK-RENAME (F2). | results |
| REG-KEYS | Space/Home/G/1/2, clip arrow nudge (body focused), Ctrl+Shift+L; grid menu on lane right-click still opens and closes on an outside press without acting. | results |
| REG-HYD | no hydration warning on load | console |
| G74-3 | `/studio-lab` anonymous shows the demo badge; `/studio/middle-east` shows "Sign in required"; anonymous `/api/studio-token?product&file` 401; fake-Bearer 403 = BLOCKED (backend unavailable in cloud); 0 forbidden requests, 0 Authorization headers. | network log |
| gate rows | vitest/typecheck/build/Biome/verify/e2e smoke → `gate` in the JSON (root gate). Do not claim them. | — |

Ableton column for C: MK-DRAG-*/MK-ARROW movement = დადასტურებული; step size, snap and collision = დაუდასტურებელი (CZABA choice); menu items = შეგნებული განსხვავება; menu Play = დადასტურებული via double-click; focus hand-off = არ ეხება.
**Source-unchanged check for C:** the sha256 of all owned files equal A's reported hashes at C start and end; frozen 445/445 OK.
C writes `c-round-74.md` and `c-round-74.json` (`taskStatus`, `browserVerified`, `realVerified`, `bugs`, `passed`, `blocked`, `notRun`, `gate`, `info`, `ableton`). `browserVerified=true` only if MK-DRAG-SNAP, MK-DRAG-CLICK, MK-ARROW, MK-MENU, MK-MENU-*, REG-STAGE1 and G74-3 (non-backend rows) ran at both viewports in the real browser.

## 6. Neighbours that can break (C watches these)
Clip-click blur of a focused flag (round-73 clause), flag click-jump / double-click-play, F2 rename focus return, flag Delete focus hand-off, grid-menu dismiss swallow (F4 export), window arrow nudge of a selected clip, marker label widths after re-sort, Cut Time remap.

## 7. Reports and next
- A: `a-round-74.md` (baseline results, change summary per B1–B12, mutation proofs, commands actually run, code-reviewer result + Architecture note, end hashes of all owned files).
- C: as above; bugs go back to B.
- Next (B): if C PASS with `browserVerified=true` → round 75 = SRW-16 stage 2b (clips / range / playhead snap to markers; Ctrl+←/→ and macOS Option+←/→ also stopping at clip edges of the selected tracks; root-review S1 macOS binding), then the bounded frontend-architect checkpoint request at the SRW-16 boundary, then SRW-17…SRW-20. The regression round is due on or after 2026-10-24.
