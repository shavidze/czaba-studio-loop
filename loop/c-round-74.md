# C round 74 — SRW-16 stage 2a (marker move + marker menu) — verdict FAIL (test contract), browserVerified=true

Verifier C · 2026-10-21 · Linux cloud · Playwright Chromium, a fresh context per run, 1440x900 and 1280x720. Artifacts: `c-round-74/` (tools, run logs, `mk74-*.json`, `mt74-*.json`, `g74-*.json`, `token-api.json`, shots), `c-round-74.json`.
Env: `:5173/studio-lab` 200 at start and end. Backend `:5199` is unavailable, which is expected in the cloud.
Source unchanged: HEAD 6b574e8, 10 status lines. All 10 owned-file sha256 values equal A's section 2 at C start and at C end (7c8874b0…, 8b805616…, 592bc1a7…, 0b59c36f…, d5a1ac9c…, b0e43760…, a8508b4a…, 5c7c697a…, 608d86ec…, b8368738…). Frozen list 445/445 OK at start and end. Narrow grants checked by C (`git diff --numstat`): ArrangementGridMenu 1/1 (only `export` added to `armGridMenuDismissClickSwallow`), StudioWorkspace 2/0 (the two props), markers-ui.test 2/2 (MU8e). C did not edit any app source.

**Why FAIL:** in the real browser every row passes at both viewports. However, the tree has a known red unit test (C-R74-01) that blocks the root gate. It can only be cleared by a B decision. A C PASS would just trigger a gate that fails.

## Results (real browser, both viewports unless noted)
| Row | Result | Evidence (1440 / 1280 identical unless noted) |
|---|---|---|
| MK-DRAG-SNAP | PASS. Snap on (aria-pressed true), grid 1 s, pps 40. A REAL mouse drag of flag 5 by +96 px moves it to 7.000. Status «მარკერი «Marker 1» გადავიდა: 00:07.000.», undo `Move Marker`, Undo → 5.000, Ctrl+Y → 7.000. Position stays 0 after the drag (no click-jump). | mk74-*.json, shots/drag-snap-* |
| MK-DRAG-FREE | PASS. Pointer time 6.370. Snap off → 6.370 with a ms status. Snap on + Alt → 6.370 (free). Snap off + Alt → 6.000 (grid line). | |
| MK-DRAG-CLICK | PASS. Press-release on flag 5 → position 5, undo label unchanged, flag focused. Drag → position stays 0. A fresh dblclick on the moved flag (7) starts playback at 7.162, then 7.661. | |
| MK-DRAG-CROSS (A extra) | PASS. Flag 5 dragged across 12 to 14. Mid-drag, focus stays on the dragged flag (@13.000, DOM order [13,12]). Final [12,14], labels correct, one `Move Marker`, Undo → [5,12]. | shots/drag-cross-* |
| MK-MOVE-DUP | PASS. Dragging 5 onto 12 (+7 s) leaves it at 11.000; there is never a second 12.000. Arrows 5→11 (six presses), then → onto 12 is refused: «ამ დროზე მარკერი უკვე არის: «Marker 2»», undo unchanged, focus kept. | shots/move-dup-* |
| MK-ARROW | PASS. Snap on: ← 11 → 10. Snap off: → 10.100. Snap on: → from 10.100 → 11.000. With a selected clip, a flag click keeps the clip selected and ← moves only the marker (clip start 0.000 unchanged). Ctrl+→ on the focused flag at position 0 jumps to 10 and the markers do not change. ← at 0 → «მარკერი დროის დასაწყისშია.», no history. | shots/arrow-* |
| MK-DRAG-PLAYING | PASS. While playing, a drag 10 → 8 and → → (→ 10) give createBufferSource delta 0 (2→2). Position advances 1.14 → 1.84 → 2.159 → 2.559 with no jump to the marker. | |
| MK-MENU | PASS. Flag 5 focused, right-click flag 12 → one menu at the exact pointer (995,249 / 1280: same rule), portal on body. Items in order: სახელის შეცვლა (F2) / დაკვრა აქედან / წაშლა (Delete). aria-current 12, first item focused, position unchanged. ↓ play, ↑↑ wrap → delete, Home/End. Escape closes and focus returns to flag 12. Tab closes. An outside ruler click only closes the menu (position 5 → 5). An outside clip click only closes it (selection unchanged). Shift+F10 opens one menu at the flag bottom-left; a second Shift+F10 still gives one menu. The ContextMenu key opens it too. | shots/menu-* |
| MK-MENU-EDGE | PASS (right edge). A pointer 107 px from the right edge clamps the menu to right = vw−4 (1436 / 1276). The bottom edge cannot be reached at these viewports (menu bottom 343 / 381), so it was not run. | shots/menu-edge-* |
| MK-MENU-ONE | PASS. Lane right-click → grid menu. Then flag right-click → marker menu only. Then lane right-click → grid menu only. | |
| MK-MENU-RENAME | PASS. Menu Rename → editor focused. Typing "Drop" + Enter → «Drop», `Rename Marker`, focus on flag 12. Undo restores the name. | |
| MK-MENU-PLAY | PASS. Stopped → 5.101, then 5.600 (playing). Playing → jumps to 12.089, then 12.609 (keeps playing). | |
| MK-MENU-DELETE | PASS. Markers [5,8,10,12]: deleting 8 through the menu leaves [5,10,12], focus moves to neighbour flag 10, the clip is kept, `Delete Marker`, Undo restores. | |
| REG-STAGE1 | PASS. C73-1 delete/undo/arrow, C73-2 paths (a)(b)(c)(d), MK-DELETE + undo, C73-3, MK-NAV 5,8,101.352 / 8,5,0, MK-ADD-PLAYING (1.471 vs 1.462, src delta 0). MK-RENAME (F2) → «Intro», focus back on the flag. MK-CUT-TIME (range 7–10 all lanes): [5,8,9,10,12] → [5,7,9], «2 მარკერი წაიშალა», Undo restores. | mt74-*.json, run-reg-*.txt |
| REG-KEYS | PASS. Space/Home/G/1/2, nudge 0→1→0, Ctrl+Shift+L, fader → clip click → Delete. Grid menu on a lane right-click; an outside press closes it (MK-MENU-ONE). "Without acting" was not re-measured for the grid menu: its code is unchanged apart from the `export`. | |
| REG-HYD | PASS. 0 hydration warnings and 0 non-env errors, in every run. | |
| G74-3 | PASS (non-backend). Anonymous `/studio-lab` shows the demo badge (header link entry too). Anonymous `/studio/middle-east` shows «Sign in required» and no workspace. Anonymous `/api/studio-token?product&file` → 401. Both viewports were checked (g74-1440x900.json, g74-1280x720.json): 0 forbidden requests, 0 Authorization headers, localStorage has no auth keys. **Fake Bearer 403: BLOCKED** (backend unavailable in cloud; got 500). | g74-*.json, token-api.json |
| gate rows | `gate` (root). Not claimed. | |

## Bugs (to B)
- **C-R74-01 (medium, blocks publication):** `markers-ui.test.tsx` MU8 l.526 `expect(undoLabel).toBeNull()` now receives `'Move Marker'`, because B5 makes plain ←/→ on a focused flag move it by 0.1 s with Snap off. C reproduced it with `npx vitest run markers-ui.test.tsx markers-move-ui.test.tsx`: 1 failed / 36 passed (`c-round-74/vitest-markers.txt`). The old stage-1 contract conflicts with B5. B needs to grant the one-line change (A suggests `toBe('Move Marker')`) or remove the assertion. A's MU8e weakness (no pointerUp for 75/76) can go in the same grant.
- **C-R74-02 (low):** the marker menu stays open at its fixed position when the timeline is wheel-scrolled. After a 300 px scroll the flag sat 300 px left of the menu. The lane grid menu closes on a user scroll. A already reported this as a gap (section 8); the fix needs the StudioWorkspace scroll-close path or a scroll listener in the row. Evidence: shots/menu-scrolled-*.

## Not run / unverified
- Menu over the floating expanded video dock (A's portal fix): not exercised.
- Real-keyboard `contextmenu` button value: Chromium CDP key presses send no `contextmenu` event (capture log empty). The menu opens through the keydown branch, so the native path, and A's `button !== 2` guard against it, is unverified (ALT-CHROME-MENU class).
- WebKit/Safari flag focus (A-R73-SAFARI-FLAG-FOCUS) and macOS Ctrl+click: Chromium only.

## Ableton compliance (separate from the CZABA requirement)
Drag/arrow movement: დადასტურებული (Live 12 §6.4 text, stored capture b-round-71). Step size, snap, Alt inversion and collision refusal: დაუდასტურებელი (CZABA choice). Menu items: შეგნებული განსხვავება. Menu Play: დადასტურებული via §6.4 double-click. Focus hand-off: არ ეხება.

## Harness notes
The first mk74 runs failed MK-MENU-RENAME/-DELETE/-CUT-TIME/-EDGE because of C's own wrong index, regex and expected values. The app values were correct. C fixed the harness and re-ran both viewports in full; the final logs are `run-mk74-*.txt`.
