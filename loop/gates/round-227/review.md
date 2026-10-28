COMMIT: OK (no blocker. Nothing touches auth, purchase or download code. The changes stay inside `components/arrangement`, `lib/arrangement`, its tests and doc 177.)

## Code Review: round-227 — CALM-1a `?` shortcut sheet

**Checked:**
- The diff and the 5 new files.
- Supporting code: `ui/Modal.tsx`, the workspace `keydown`/`keyup` handlers (`StudioWorkspace.tsx:1755–2115`), `focus-source.ts`, every global key listener in `app/`, and the obsidian theme scoping.
- `verify.log`: 205/205 test files passed, `tsc` is clean, the build succeeded and there are no lint errors (the warnings are in old, unrelated files).

This reviews the diff only. I did not audit the whole module.

### Critical Issues
- None.

### Suggestions (most important first)

1. **Esc only works because the floating-video branch also checks `defaultPrevented` — `StudioWorkspace.tsx:1762` and `:2101–2103`.**
   - In a real browser, Esc goes: the sheet's capture listener calls `preventDefault`, then Modal's `document` listener calls `onClose`, then React re-renders before the next listener runs. By the time the `window` handler runs, `shortcutSheetOpenRef.current` is already `false`, so the guard at the top doesn't fire.
   - Today this is safe. The only Escape branch (`:1789`) checks `!event.defaultPrevented`, and I found no other Escape branch.
   - The risk: any future Escape branch without that check (clear selection, cancel rename, etc.) would also run when the sheet closes. Export avoids this with `exportKeyEventRef`, which marks the event itself.
   - **Fix:** `exportKeyEventRef.current = exportOpenRef.current || shortcutSheetOpenRef.current ? event : null;`. Add a test where React re-renders between listeners for the sheet, like the existing floating-video one.

2. **The `Shift+Slash` code fallback can fire on non-US keyboards — `StudioWorkspace.tsx:1761`.**
   - On German QWERTZ that key with Shift types `_`, and on French AZERTY it types `§`. Both would open the sheet and have their default blocked.
   - **Fix:** use only `event.key === '?'`. Keep the `code` check only when `event.key` isn't a printable character (`'Unidentified'`/`'Dead'`).

3. **A test lost one of its checks — `track-layout.test.tsx:268–272`.**
   - The test is still named "…renders the real line as one truncated full-width row (C-R15-02)", but it no longer checks `truncate`.
   - **Fix:** `expect(selected?.className.split(' ')).toEqual(expect.arrayContaining(['truncate', 'min-w-0', 'flex-1']));`. This checks the classes that matter without listing every class, so the original gate failure doesn't come back.

4. **Small render cost — `StudioWorkspace.tsx:155` and `ArrangementShortcutSheet.tsx:102`.**
   - `findStudioShortcut('shortcuts')` runs on every workspace render. Make it a module-level constant.
   - `ArrangementShortcutSheet` re-renders every time the workspace does, even when closed. All its props are stable, so wrap it in `memo`. It's cheap now (43 rows, and an empty query returns the constant), but the workspace renders often.

5. **Accessibility details (non-blocking).**
   - The "no match" text (`ArrangementShortcutSheet.tsx:149`) isn't announced to screen readers. Add `aria-live="polite"` / `role="status"`.
   - On the footer button, `title` repeats the `aria-label`. The accessible name "Keyboard shortcuts (?)" does contain the visible "Shortcuts", so label-in-name is met.
   - While the sheet is open, the Studio ignores keys, so Space can't stop playback. This is intended (the doc says so); it's just worth knowing about.

6. **`findStudioShortcut` returns `| undefined` even though the id is a typed literal union.** Return a non-optional row by throwing when an id is missing. Then the `?.` calls in the code and tests can go, and a wrong id fails the build instead of quietly passing `undefined`.

### Good Practices Found
- The sheet-open check sits above every other branch, so Space, Delete, Ctrl+Z, M and G are blocked while the sheet is open.
- `?` is skipped for menus, active pointer gestures, auto-repeat and text fields. Repeat `?` is blocked in the capture phase, so the search box doesn't fill with "????".
- Space `onKeyUp` uses `stopPropagation`. The React root is on `document` and the workspace `keyup` listener is on `window` (bubble phase), so the stop runs before the workspace sees it.
- Focus restore is correct. The opener is saved in a layout effect before the search box takes focus. The cleanup runs after the portal is removed, and falls back to the footer button when the opener was `body` or is gone.
- Each of the two listeners has one add/remove keyed on `isOpen`, with matching capture flags. No timers.
- Shortcuts come from a single list, typed with `as const satisfies` (the same pattern as `grid.ts` and `view.ts`). No `any`, no type-error suppression, and semicolons are consistent.
- Styling uses tokens only (`border-outline`, `text-muted`, `tracking-label`). The theme still reaches the portal through `body:has([data-studio-theme="obsidian"])`. Focus rings come from the global `:focus-visible` rule.
- No leftover references to the removed hint: `arrangement-shortcut-hint` only appears in `toBeNull` assertions and an old doc. Auto-fit has no hard-coded footer height.

### Architecture note
- **Signals 4 and 3 at `StudioWorkspace.tsx:487–491`, `:1762–1787` and `:2101–2103`:** a third dialog's state is added inside `handleKeyDown` (a ref, two branches and the Export marker). `ArrangementShortcutSheet.tsx:31–100` repeats Export's focus trap and restore locally.
- **Keep for now:** audio timing, gestures and Undo/Redo are untouched, and the change follows the existing pattern.
- **Proposal for the planner:** one `activeDialogRef` that replaces `exportOpenRef`, `shortcutSheetOpenRef` and `exportKeyEventRef`, plus the shared dialog focus hook already in `b-round-225-checkpoint-request.md`.
  - Acceptance: Esc with a React re-render between listeners for both dialogs, Space keyup on the close button, and focus restore to the opener or fallback.
  - Cost: medium; risk: low.

### Alternative Approach
- **Current:** a ref that mirrors `isOpen` at the top of the window handler, with Esc protected by `preventDefault` and the `defaultPrevented` check.
- **Alternative:** mark the event itself in the capture phase (the way `exportKeyEventRef` works) for any open dialog. This doesn't depend on when React re-renders.
- **Verdict:** the current approach works today. The alternative closes the hole a future Escape branch could fall into, and it's the first suggestion above. It's not a commit blocker.

### Score: 8.5/10