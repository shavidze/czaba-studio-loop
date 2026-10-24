COMMIT: OK — this round only moves text into one shared strings file. Behaviour is unchanged, and it doesn't touch auth, purchase or download code.

## Code Review: round 138 (V-0.4a, clip text in English) — `ArrangementClip.tsx`, `ArrangementContext.tsx`, `strings.ts`, 17 test files, the new `clip-strings-ui.test.tsx`, docs 113/114

### Critical Issues
- None.
- `verify.log`: 163 test files and 2460 tests pass, and both builds succeed.
- Browser tests: I searched the whole repo outside `docs/` and `node_modules` for the old Georgian titles and texts that tests used to find elements or check status. No e2e spec uses them, so the browser tests won't break. The one remaining hit is in `ArrangementClipEnvelope.tsx:25` and the matching assertion in `clip-envelope-ui.test.tsx:526`. That is planned for V-0.4c.

### Suggestions (most important first)
1. **`docs/implementation/2026/quarter-IV/114-studio-v0-clip-strings.md:4,72,76`** — the status still says it is waiting for C round 138, but C 138 has passed. **Fix:** change it to `Completed (C round 138 — PASS; gate 138 — <sha>)` and remove the C 138 item from TODO. Doc 113 was handled the same way this round. Or state clearly that this moves to round 139.
2. **`docs/.../113-studio-v0-workspace-strings.md`** (the bullet at diff l.1234 and the TODO at l.1249) — "track-header selector (l.331)-ის selector" says "selector" twice. **Fix:** "track-header selector (l.331) არ შეხებია".
3. **`app/lib/arrangement/strings.ts:512-513` and `:535`** — `fadePreview` and `fadeCommitted` write the `" s"` unit themselves instead of using `seconds()`, so the unit is defined in three places. **Fix:** `` `${label}: ${seconds(value)}` ``. This is optional; the tests would still pass.
4. **`strings.ts`, `groupMovedRight` / `groupMovedLeft`** — `${count} clips` has no singular form. A group always has at least 2 clips, so this can't go wrong today. If a group of one ever becomes possible, it needs a singular branch. Not a regression.
5. **Test coverage gap (doc 114:65, mutation m60)** — `gesture-reentry.test.tsx:151` finds the left trim handle by its title only. If someone swapped the two trim titles, only `grid-snap-edit` and `track-layout` would fail. **Fix (later round, given the rule against adding tests in a pin round):** use a `data-testid` for each trim handle instead of the title.
6. **Accessibility (existing before this diff):** the trim strips at `ArrangementClip.tsx:962,967` and the time-selection area at `:858` are `div`s with only a `title`. They have no role or `aria-label`, and keyboard users can't reach them. The text is now English, but the problem is unchanged. This belongs in a separate a11y task.
7. **`verify.log:99`** — this Biome message is about a file outside this round's paths, so it was already there and isn't this round's responsibility.

### Things I checked that need no fix
- **Listeners, timers, refs and render cost:** unchanged. Every new piece is either a fixed string or a small function defined once in the module. Nothing runs again per render beyond the template literals that were already there.
- **Gesture order:** pointer and dblclick handling, the order of status messages, and which edits get saved are unchanged. The direction check for the group status message stays in `ArrangementClip.tsx`, now as a ternary that picks which formatter to call.
- **Undo labels:** nothing compares Undo labels as text (I searched for `label ===` and `startsWith`), so changing their wording can't break Undo/Redo or the merging of repeated keyboard nudges.
- **TypeScript and Tailwind:** no `any`, no type assertions, all statements end with a semicolon, and no classes or tokens changed.

### Good Practices Found
- `strings.ts` still has no imports, so there is no circular dependency. Values like `toFixed(3)` and `formatArrangementTime` are formatted by the caller before they reach the strings.
- ST34 checks the exact set of keys, and ST35 checks the component source for any leftover Georgian. The new test file checks three real flows in the actual workspace: the range badge, a group dragged left, and a group nudge with the arrow key.
- The test fixtures keep their track names (`სტემები`, `მუსიკა`), so `Move to track — სტემები` correctly shows text from user data next to the English UI.

### Architecture note
- Signal 3 (one region keeps changing, and each change is costly): `app/lib/arrangement/strings.ts` gets a new object every V-0.x round, and each time 15–20 test files have to be updated by hand. **Keep for now:** the module has no imports, ownership doesn't change, and audio timing, gestures, Undo and the `useArrangement()` shape aren't affected. The question of splitting it is already filed with root (`b-round-136-checkpoint-request.md`), so I'm not proposing a new task. Moving tests from exact text to `data-testid`s (suggestion 5) would make later rounds cheaper and could go into the same checkpoint.

### Alternative Approach
- This isn't critical logic (no auth, checkout or audio pipeline), but for the record:
- **Current:** one plain object per area, with typed formatter functions.
- **Alternative:** a message catalogue keyed by ID, with an `i18n` library such as ICU, which handles plurals.
- **Verdict:** keep the current approach. The UI only needs English, so a full i18n library would add bundle size and indirection with no payoff. Reconsider only if the UI has to support more than one language.

### Score: 9/10