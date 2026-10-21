# A — Round 74 report: SRW-16 stage 2a (marker move: drag + arrows + snap; marker context menu), D-29z39

Implementer: A (Claude Opus 5.5) · Date: 2026-10-21 · Status: **implemented; MU8 contract conflict open (needs a B grant); code-review: see section 7**

## 1. Baseline (checked at phase start, before any edit)
- HEAD `6b574e853d2c5c4317e38927d9d06ce2a3dba91b`, `git status --short` empty.
- Frozen list 445/445 OK (`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-73-r74-tree-sha256.txt`); re-checked at the end: still 445/445 OK.
- Snapshots 7/7 matched (prefixes a677d653, 7d83398e, 67e1786e, 20e8a5b6, 51ea7558, d5e854bf, adb44c78; LF counts 157/431/2010/248/301/833/94; CR=0).
- Protected 4/4 OK at start and end: cd68eb6e, 9f738237, 13914809, fa2cf0bc.
- `pgrep -c node` = 1 at start; `:5173/studio-lab` 200. I did not start or stop any server.
- Pre-flight read: CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/new-component.md, prompts/studio-feature.md.

## 2. Changed files (end `git status --short`: 7 `M` + 3 `??`, as expected)
| File | Change | sha256 (end) | LF | CR |
|---|---|---|---|---|
| `app/lib/arrangement/markers.ts` | `moveMarker` + `MoveMarkerResult` (moved / unchanged same ref / conflict with `other`) | 7c8874b03fab578301163cce76016ab081c756d6f409278aeffc8766edcb4df4 | 189 | 0 |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | drag, arrows, menu open/actions, a11y, props `snapSeconds`/`gridSeconds` | 8b805616b9d79d6404e9c2c19351f441ef697d6ef218499b2b585f76950be0bb | 789 | 0 |
| `app/components/arrangement/ArrangementMarkerMenu.tsx` (new) | menu (B9) | 592bc1a749b91bda76568d3f7dfcd2cf809487080c315a03bc3a71dcf20b902f | 160 | 0 |
| `app/components/arrangement/ArrangementGridMenu.tsx` | only `export` added to `armGridMenuDismissClickSwallow` (diff 1/1 line) | 0b59c36fa12f1f6645e8cb4d7df575027383ca83e8f13b82c57913e3ed67ee95 | 248 | 0 |
| `app/components/arrangement/StudioWorkspace.tsx` | only `snapSeconds={snapEnabled ? gridSeconds : null}` + `gridSeconds={gridSeconds}` on `<ArrangementMarkerRow>` (+2 lines) | d5a1ac9cd9790ec3e10483deef08757e3effd2855b6cc6cbb083b5afe3736f6a | 2012 | 0 |
| `app/lib/arrangement/__tests__/markers.test.ts` | MK-MOVE1–4 (additive + one import) | b0e43760a8c98f01342228abea31837c5c39b35e19602a126bfe46f356b9b370 | 366 | 0 |
| `app/lib/arrangement/__tests__/markers-move-ui.test.tsx` (new) | MV1–MV14 (+MV11b) | a8508b4a2ed051f6a053624ac1e2d72bd002c33c48f0e16982bdbf5ef569988c | 716 | 0 |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | MU8e's two flag-press assertions only (`toBe(intro)` → `toBe(drop)`, 2+/2−) | 5c7c697abe630cab0d19841b0f4b8c9125e49b4f32909a8cfb54ea68d42aea5b | 833 | 0 |
| `docs/implementation/2026/quarter-IV/065-studio-lab-marker-move-menu.md` (new) | implementation doc (Georgian, TEMPLATE sections) | 608d86ec672ae8c670374042b46a22bc0e86aa7578dc33dcdb49e0a9c87f4639 | 82 | 0 |
| `docs/implementation/2026/quarter-IV/064-studio-lab-markers.md` | status line only | b8368738115bbdcdbb89908481aa95b5289eb43e81d330c8aa64a4b4905cd414 | 94 | 0 |

No window key-handler or blur-clause change was needed for B5 (the existing `!isMarkerTarget` guard already keeps the clip nudge off a focused flag).

## 3. Behaviour B1–B12 (what the code does)
- **B1** pointerdown (button 0) on a flag: `preventDefault` + `stopPropagation`, explicit `focus({preventScroll:true})`, selects the flag. <3 px = click (existing click-jump / double-click-play unchanged). Past 3 px: `resolveGridTime(roundMarkerTime(original + dx/pxPerSecond), snapSeconds, gridSeconds, altKey)`; clamped at 0 by `moveMarker`; past `projectEnd` allowed.
- **B2** preview via `previewArrangement`; on release the claim is released first, then one `commitArrangement(next, 'Move Marker', before)`; status `მარკერი «{name}» გადავიდა: {time}.`; ending at the original time commits nothing. `claimPointerGesture` + `setPointerCapture`, `watchUncapturedPointerGesture` fallback; abort restores `before` if moved. A press while another pointer's gesture is active is refused with `GESTURE_EDIT_BLOCKED_MESSAGE`.
- **B3** after a drag that passed the threshold, `click` and `dblclick` on that flag are ignored for one task (`setTimeout 0` clears the flag). Real Chromium probe confirmed (section 6).
- **B4** collision: drag preview stays at the last valid time, release commits it; arrows refuse with `ამ დროზე მარკერი უკვე არის: «{other}»`, no history.
- **B5** plain ←/→ on the focused flag (`target === currentTarget`, no Ctrl/Meta/Alt/Shift): Snap on → `adjacentGridLine`, Snap off → ±0.1 s; ← at 0 → `მარკერი დროის დასაწყისშია.`; one `Move Marker` per press (repeat allowed); focus kept (re-focused after the keyed re-sort via `pendingFocusRef`); `preventDefault` + `stopPropagation`. Ctrl/Meta/Alt+arrows still reach the window (Ctrl+→ navigation, MV7).
- **B6** `moveMarker` re-sorts and keeps `id`/`name`.
- **Extra (needed for B1/B2 in a real DOM):** during a drag the flags render in the drag-start order (`dragOrder`) and are positioned by time, so React does not move the dragged node (which would drop pointer capture and focus) while it passes a neighbour; label widths use the sorted list. After release the normal sorted order returns.
- **B7** right-click: native menu prevented; marker selected + focused; menu at the pointer, clamped with a 4 px margin; items `სახელის შეცვლა (F2)`, `დაკვრა აქედან`, `წაშლა (Delete)`; actions target the right-clicked marker.
- **B8** Shift+F10 and the ContextMenu key on a focused flag open it at the flag's bottom-left. A keyboard-originated `contextmenu` (button ≠ 2) for the marker whose menu is already open is ignored (no double open).
- **B9** `role="menu"` / `menuitem`, first item focused, ↑/↓ wrap, Home/End, Enter/Space, Escape (focus back to the flag), Tab closes (focus back to the flag, then the default Tab move). Outside press: closes only, swallowed with the exported `armGridMenuDismissClickSwallow`. Also closes on window resize/blur. Only one CZABA menu at a time (MV11b, both directions).
- **B10** Rename → the existing name editor (Enter → `Rename Marker`, focus back to the flag); Play from here → jump + `togglePlayback` only when stopped (no new transport code); Delete → existing `removeMarker`. Refused during an active gesture with `GESTURE_EDIT_BLOCKED_MESSAGE`.
- **B11** `scheduleKey` serialises only `[clips, loop]`; MV13 proves 0 extra buffer sources and an advancing position while dragging and arrow-moving during playback (jsdom counter; the real-browser counter is C's MK-DRAG-PLAYING).
- **B12** flag `aria-keyshortcuts="F2 Delete ArrowLeft ArrowRight Shift+F10"`; `MARKER_FLAG_HINT` now mentions drag, ← →, right-click / Shift+F10; `aria-current` kept.
- **FORWARDREF_COMPONENT:** `ArrangementMarkerMenu` is a plain function component. No parent needs a ref to it and it manages its own focus, same as `ArrangementGridMenu`. The row stays `forwardRef` (existing imperative handle).

## 4. OPEN — contract/test conflict for B (not fixed, outside my grant)
`app/lib/arrangement/__tests__/markers-ui.test.tsx` **MU8, line 526**: `expect(live(api).undoLabel).toBeNull();` after plain `ArrowRight` + `ArrowLeft` on the focused 40.000 flag. Under B5 (Snap off by default → ±0.1 s, one `Move Marker` per press) the label is now `'Move Marker'` (the marker goes 40.000 → 40.100 → 40.000). This is the **only** failing assertion. I checked by running a temporary copy of the file with line 526 changed to `toBe('Move Marker')` (scratch copy in my own new file path, deleted right after): MU8 then passed in full. The original file is untouched outside MU8e.
**B decision needed:** grant a one-line change at l.526 (e.g. `toBe('Move Marker')`, which keeps the round trip and clip-not-nudged checks), or drop that assertion. **Until then `markers-ui.test.tsx` has 1 red test and the root gate's full vitest will be red; this blocks publishing.** The B task's MU8f/mutation (iv) expectations are still met.

## 5. Commands actually run and results
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0 (218 warnings, all in other files; 0 diagnostics in owned files).
- `npx biome check` on the 8 owned code/test files → "No fixes applied", 0 errors/warnings (read-only check; no `--write`).
- `npx vitest run markers.test.ts markers-ui.test.tsx markers-move-ui.test.tsx delete-selection-ui.test.tsx grid-musical-ui.test.tsx grid-snap-menu.test.tsx grid-snap-keys.test.tsx grid-triplet-ui.test.tsx` → **8 files, 156 tests: 155 passed, 1 failed (MU8 l.526, section 4)** (final run, after the review fixes). Per file: markers 30/30, markers-move-ui 15/15, markers-ui 21/22, delete-selection-ui 13/13, grid-musical-ui 14/14, grid-snap-menu 39/39, grid-snap-keys 13/13, grid-triplet-ui 10/10. Output: `a-round-74/vitest.txt`.
- No full suite, no `npm run verify`, no build (root gate, speed rules).

## 6. Mutation proofs (each restored with `cp` from `a-round-74/backup/` and `cmp` OK; logs `a-round-74/mutations-1.txt`, `mutations-2.txt`). MU8 is red in every run because of section 4.
| # | Mutation | Result |
|---|---|---|
| (i) | `moveMarker` without the re-sort | MK-MOVE1, MV5 red |
| (ii) | click handler without the "moved" guard | MV4, MV13 red |
| (iii) | no explicit focus on press | MV8, MU8e red |
| (iv) | flag arrow branch placed before the `target === currentTarget` guard | MU8f red |
| (iv-b) | only `stopPropagation` dropped in the arrow branch | **survives** (as expected: window `!isMarkerTarget` guard; defense in depth). Recorded, not fixed. |
| (v) | collision check removed from `moveMarker` | MK-MOVE2, MV5, MV6 red |
| (vi) | keyboard double-open guard (`fromKeyboard && menu?.markerId === marker.id`) removed | MV11 red (`mutations-3.txt`) |
| (vii) | click suppression on drag abort removed | MV14 red (`mutations-3.txt`) |

The smoke was re-run after the review fixes (portal menu): same results (`browse/smoke-r2.txt`, `browse/click-r2.txt`).
**A's own real-Chromium smoke (not C evidence; scripts and output in `a-round-74/browse/`)** against the running `:5173/studio-lab` (Playwright + installed Chromium, fresh context): M+Enter adds at 0; a real mouse drag of 200 px (Snap off) → 5.000 with the status text and the flag still focused; → → 5.100; right-click → menu with the 3 items, first item focused; Escape → closed, focus on the flag; Shift+F10 → exactly one menu; ↓↓ Enter → Delete removed it; no page errors. At 1280x720 with Snap on: a 96 px drag → 2.000 and the position stayed 00:00.000 (no jump after the drag); a later plain click jumped to 2.000; click then a quick drag → the position did not move again and playback did not start.

## 7. Code review
The `code-reviewer` subagent actually ran: static read of the working tree against the r74 snapshots, without a shell. **Score 8/10. No Critical or High code defect.** It confirmed the narrow grants (StudioWorkspace +2 lines, GridMenu `export` only). Fixes after the review (all inside ownership):
- **Low, fixed — menu stacking:** the menu sat inside the sticky `z-30` chrome, so the floating video dock (`fixed z-40`) could paint over it. It now renders through `createPortal(…, document.body)`.
- **Low, fixed — abort path:** a drag aborted by blur after moving now also suppresses the following click (MV14).
- **Low, fixed — a11y:** flag `aria-haspopup="menu"` and `aria-expanded="true"` while its menu is open.
- **Medium/Low, fixed — test gaps:**
  - MV14 covers the blur abort restore: no history, gesture released, no seek.
  - MV11 now fires a keyboard `contextmenu` (button 0) while the menu is open: still one menu and focus kept, so the guard is mutation-proven (vi).
  - MV11 also asserts that Home inside the portal menu does not reach the window Home→seek(0) handler (position stays 3). This was added last and re-run: markers-move-ui 15/15.
  - MV11 now stubs `getBoundingClientRect`, so the flag anchor (333, 77) is really asserted.
  - The MV9 clamp check still relies on jsdom `offsetWidth`=0; real positioning is C's MK-MENU row.
- **Not changed (outside grant) → for B:**
  - (1) The MU8 l.526 conflict (section 4).
  - (2) **MU8e weakness:** the pointerdowns for 75 and 76 never get a `pointerUp`, so a claim stays active for the rest of MU8e. The label assertion is then trivially true, and the name-editor half runs with `isPointerGestureActive()` true. Proposed fix: add a `pointerUp` for 75/76. That needs a grant beyond "two assertions".
- **Kept deliberately:**
  - `pointercancel` commits like the loop brace does.
  - Focus and select happen before the claim, so a refused press still focuses and selects (documented in section 8).
  - `snapSeconds?`/`gridSeconds?` stay optional, matching `ArrangementLoopBrace`.
- **Needs C/browser:**
  - The real `button` value of a keyboard `contextmenu` in Chromium.
  - macOS Ctrl+click (button 0) would start a drag claim and anchor at the flag. This can't be covered on Linux.
- **Reviewer's out-of-scope remark:** it saw 6 M + 2 ?? at its start, so no doc 065 / 064 yet. That was a timing artifact: both docs exist now (section 2).

**Architecture note (signal for B, not acted on):** The marker row now holds the drag state, `dragOrder`, click suppression and the menu state. This is the third copy of the claim + `setPointerCapture` + `watchUncapturedPointerGesture` + stale-end scaffold (ArrangementMarkerRow, ArrangementLoopBrace, ArrangementClip). Keep the row as it is for now. After SRW-16 closes, consider one bounded task to extract the shared gesture scaffold, with the three callers' existing tests as the gate.

## 8. Known gaps / notes for B
- The marker menu now renders in a portal on `document.body`. It closes on window resize/blur and on an outside press, but **not on timeline scroll** (the grid menu closes on user scroll; that logic lives in StudioWorkspace, outside my grant). A scrolled timeline leaves the fixed menu at its pointer position.
- A drag-then-click inside the browser's double-click interval: the drag's own click and dblclick are suppressed; a fresh click after the 0 ms suppression window behaves normally (click-jump and, if it pairs with an earlier click, double-click-play).
- A press refused because another pointer's gesture is active still focuses and selects the flag and shows the refusal; its later click still jumps (existing click behaviour kept).

## 9. Exact next checks for C
Run the B task section 5 rows at 1440x900 and 1280x720, with the Snap state set explicitly: MK-DRAG-SNAP, MK-DRAG-FREE (incl. Alt both ways), MK-DRAG-CLICK (no jump/play after a drag; press-release still jumps; dblclick still plays), MK-MOVE-DUP, MK-ARROW (incl. clip not nudged, Ctrl+→ navigation), MK-DRAG-PLAYING (createBufferSource counter = 0 extra), MK-MENU (pointer position near the right/bottom edge, one menu only vs. the lane grid menu, Escape focus return, outside click no seek/select, Shift+F10), MK-MENU-RENAME/-PLAY/-DELETE, REG-STAGE1, REG-KEYS, REG-HYD, G74-3. Also check: drag a flag across a neighbour (capture and focus kept during the drag, labels correct after release), and the menu with the timeline scrolled (gap noted above), the menu above the floating video dock, and the keyboard `contextmenu` button value. Verify the end hashes in section 2 at C start and end, and frozen 445/445.

## 10. Scope status
B1–B12 implemented and covered by unit/jsdom tests (passed locally, except the MU8 l.526 conflict). **No browser acceptance row is claimed as passed by A**: that is C's job; my smoke above is supporting data only. Root gate rows (full vitest/verify/build/e2e smoke) were not run by me. Not complete until B resolves section 4 and C verifies.
