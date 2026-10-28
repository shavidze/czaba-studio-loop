COMMIT: OK

## Code Review: CALM-1b — keys in transport tooltips and `aria-keyshortcuts` (round 228)

The commit has 12 paths: `ArrangementTransport.tsx`, `shortcuts.ts`, `strings.ts`, 8 test files and the 177 implementation doc. There are no new files. The verify log shows 205 test files passing, the typecheck clean, the build done, and only lint warnings that existed before. This is a review of the diff, not a full audit of the module.

**Auth, purchase and download code: none touched.** No changes to API, routes, contexts, localStorage or `dangerouslySetInnerHTML`. Security checklist: nothing applies. Error taxonomy: not affected.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Mac users now see "Ctrl" in tooltips** — `strings.ts:650-651, 686-687`. Split and Loop used to say "Ctrl/Cmd+E" and "Ctrl/Cmd+L". Now they say "Ctrl+E" and "Ctrl+L". A Mac user hovering the button never sees the sheet's subtitle "Ctrl means ⌘ on Mac", so this is a small step back for them. The doc says this is a deliberate choice; it is not a blocker.
   **Fix (later task):** let `studioShortcutTitle` show the key per platform, using `navigator.platform` on the client after hydration. Or change only the title text, e.g. "Ctrl/⌘+Z". Keep the sheet as the single source in both cases.
2. **Some hints still hardcode their keys, so they can drift from the shortcut source:**
   - `deleteRangeHint` and `deleteRangeAllTracksHint` (`strings.ts:652-655`: "(Delete / Backspace) … Ctrl+Shift+X")
   - `braceHint` ("(Ctrl+L)")
   - `playPastEnd` ("Home returns to 0")

   The doc's TODO lists only Snap, grid, Envelope and markers.
   **Fix:** add these to that TODO line. `cut-time` already exists as a row in `shortcuts.ts`.
3. **The footer button doesn't use the new helper** — `StudioWorkspace.tsx:2692` still reads `findStudioShortcut('shortcuts')?.ariaKeyShortcuts`. It should call `studioShortcutAria('shortcuts')`. The behaviour is the same; this is only consistency.
4. **Small render cost** — `ArrangementTransport.tsx:136-233`. Each transport render does 7 `studioShortcutAria` lookups and 2 `undoTitle`/`redoTitle` lookups, each a linear search over about 45 rows. The transport re-renders only when the undo label, range, loop or play state changes (the playhead is in its own `ArrangementTransportPosition`), so this is negligible.
   **Fix (optional):** compute the 7 aria strings once as module constants.
5. **One test count is brittle** — `shortcuts.test.ts:440` checks `expect(checked).toBe(8)`. Adding any new `ariaKeyShortcuts` row will fail it. That may be intended, but it is a small extra cost on every future row.
6. **Old wording left in the doc** — `177-calm-1-shortcut-sheet.md:141` still quotes "(no selection)" in the old Solution text. A note points to C-R227-01, so this is cosmetic.

### What I checked that tests can't catch
- **The listed keys match the real handler** in `StudioWorkspace.tsx:1798-1891, 2025, 2032`:
  - Space, Home and Delete/Backspace match.
  - The handler treats `ctrlKey || metaKey` as one modifier, so listing both Control and Meta is correct. This covers E, Z, Shift+Z, Y and L.
  - `shortcutLetter` reads `event.code`, so the letter keys don't depend on the keyboard layout.
  - `Space` is the correct ARIA name for the space bar.
- **Accessibility:**
  - Undo/Redo keep their visible text, so their accessible name doesn't change. The title is now only the description ("Undo: X (Ctrl+Z)"). It repeats the name, which is acceptable.
  - Delete keeps its `aria-label`.
  - Play/Pause and Back to start get their names from `aria-label`, so the change is safe there too.
  - `aria-keyshortcuts` on a disabled button is valid.
- **No new state, effects, timers or listeners**, so there is nothing that could leak. The focus-handoff layout effect and `preventRepeatedEnterKeyDown` are untouched.
- **Module load order is safe:** `strings.ts` imports `shortcuts.ts`, and `shortcuts.ts` imports nothing. So calling `studioShortcutTitle` at the top of `strings.ts` while it loads is fine.
- **TypeScript:** no `any`, no type assertions, no suppressions. `StudioShortcutId` is a literal union, so a wrong id fails at compile time. The `as const satisfies` keeps the optional `ariaKeyShortcuts` property typed.
- **Tailwind:** no class changes.
- **No old strings left elsewhere:** no remaining references to "Back to start (0)", "Ctrl/Cmd+E" or "Ctrl/Cmd+L" in `app/`. The tests that select by `title^="Undo"` still match.

### Good Practices Found
- The key text comes from one place, so the tooltips and the sheet can no longer disagree.
- The title shows the first key and `aria-keyshortcuts` lists all of them. The test checks this with a grammar regex and a Ctrl→Control+Meta cross-check.
- A wrong key name was fixed: Back to start said `0`, but the key is Home.
- Tests now build their expected text with `studioEditStrings.undoTitle(...)` instead of copying the literal string.
- The doc records mutation tests showing that the new tests catch broken versions of the code.

### Architecture note
- Signal 2 (ownership/coupling), `strings.ts:1`: `strings.ts` now depends on `shortcuts.ts` instead of being a standalone table of strings. → **keep.** The dependency goes one way, `shortcuts.ts` stays a leaf with no imports, and it removes a real past source of drift. Cost: low.
- Proposal for the planner (not current scope): one task to move the remaining hardcoded key text onto the helper — Snap/grid/Envelope/marker titles plus `deleteRange*Hint`, `braceHint` and `playPastEnd` — and optionally add a platform-aware formatter for tooltips. Acceptance: no hardcoded key text left in `strings.ts`, SC5 and NS5 extended. Focused tests: `strings.test.ts`, `navigation-strings-ui`, `markers-ui`, `grid-snap-ui`.

### Alternative Approach
- **Current:** each row in `shortcuts.ts` stores both its display keys and a hand-written `ariaKeyShortcuts` string, and a test checks that the two agree.
- **Alternative:** generate the aria string from the display keys (`Ctrl+X` → `Control+X Meta+X`).
- **Verdict:** keep the current approach. The display keys include free text ("Double-click the overview", "← / →") that can't be converted mechanically. Explicit strings plus the agreement test are easier to read, and the test already catches drift.

### Score: 8.5/10