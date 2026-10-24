COMMIT: OK

## Code Review: round 146 (V-0.5a source-load strings, library row status, kind search keywords)

I reviewed the 17 candidate paths in `diff.patch` and the 2 new files against HEAD 9a67abd. This is a review of the diff only, not a full audit of the modules. Two checks back the verdict:
- **Verify:** `verify.log` shows 168 test files and 2498 tests passed, plus a clean build.
- **C round 146:** `c-round-146.json` has `taskStatus: PASS`, with `browserVerified` and `realVerified` both true.

Nothing in the diff touches auth, purchase or download code. `collection.ts` is the adapter for purchased stems, but only its error and label text changed. The `fetchAudio(url, { credentials: 'omit', signal })` call, the URL handling and the abort/rethrow branches are identical. The PC3, PC6 and PC10 tests still check that error messages contain no secret URL or token. No old Georgian error strings remain anywhere in `app/`, so no code compares against the old text.

### Critical Issues
- None.

### Suggestions (most important first)
1. **The 119 doc has a stale status. Fix before commit or as the first item next round.** `docs/implementation/2026/quarter-IV/119-studio-v0-library-source-strings.md:4` still says "C round 145 — FAIL … round 146 fix-up — C ჯერ არ გაშვებულა", and line 91 says "C round 146 ჯერ არ გაშვებულა". C round 146 has actually passed in a real browser.
   - **Fix:** use the same wording as 118, e.g. `**სტატუსი:** Completed (C round 146 — PASS, browserVerified; gate 146)`, and replace line 91 with the C 146 result.
   - This doesn't block, because the last gate handled 118 the same way (status updated a round later).
   - Also, line 71 lists only "LRS1–LRS2" for the new test file. Line 74 adds LRS3, so it would be cleaner to say LRS1–LRS3 in one place.
2. **Layout shift during preview.** `ArrangementLibrary.tsx:127-134`: the marker is now its own line inside the `flex-col` button. Starting or stopping a preview makes the row grow or shrink by about 16px, which pushes every row below it while the pointer is over the list. This is a deliberate trade-off: it fixes C-R145-01, and B's probe ruled out `flex-wrap` because it moved the `Error: …` text in the error state. C confirmed visibility in the browser.
   - **Watch:** dragging from a row while a preview is running, and keyboard focus scrolling near the bottom edge of the list. No test covers either.
   - **Optional fix:** always render a fixed-height slot, e.g. `min-h-4` with the marker inside it. But that would change the ready/error layout, which the round deliberately kept identical, so it should go to B as a decision rather than a change now.
3. **Accessibility (old issue, now more visible).** `ArrangementLibrary.tsx:132`: the option's accessible name comes from its content. Screen readers will read "▶" as "black right-pointing triangle", and the option's name changes when a preview starts or stops.
   - **Fix (for a later strings round):** `<span aria-hidden="true">▶</span>` plus the text "Playing", or put the state on the option itself (e.g. `aria-describedby`). This doesn't block; the same pattern existed before this round.
4. **Brittle test.** `library-row-strings-ui.test.tsx:212,225`: `className.toBe('…')` pins the exact class strings. Any token tweak, such as Tailwind class reordering, will break LRS3 even though behaviour is unchanged.
   - **Fix:** check only the classes that matter: `toContain('whitespace-nowrap')`, `not.toContain('flex-wrap')`. The structural checks (`parentElement`, `lastElementChild`, `nextElementSibling`) are what actually guard the fix.
5. **Search regression (documented and intentional).** `library.ts:120-124`: searching by kind in Georgian (`მუსიკა`, `სტემები`) no longer works. `library.test.ts:81` already expects `[]` for this, and the doc records it as `LIB-SEARCH-GEORGIAN-SYNONYMS` (info). Nothing to do; I'm mentioning it so the change in behaviour is visible.
6. **Minor.** `strings.ts:757`: `rowError('')` returns `"Error: "`, and ST46 pins that. It only happens when an `Error` has an empty message. The old code did the same. You could fall back to `loadFailedFallback` for empty messages in a later round.

### Things I checked that are fine
- **Re-renders:** `isPreviewing` was already a prop of the memoised option. No new props, state, effects, timers or listeners, so render cost is unchanged and nothing can leak.
- **Event order:** the only DOM change is where one span sits. Click, double-click, keyboard and drag handlers are untouched. `draggable` still depends only on `status === 'ready'`.
- **TypeScript strict:** no `any`, no `@ts-ignore`, no `as`. ST48 uses a typed `readonly WorkspaceSourceKind[]` instead of `as const`. Every statement ends with `;`.
- **Tailwind/tokens:** `text-brand`, `text-xs` and `whitespace-nowrap` are existing tokens. No custom CSS and no hardcoded colours.
- **XSS:** `state.error` and the labels are rendered as plain text by React. No `dangerouslySetInnerHTML`.

### Good Practices Found
- `studioSourceLoadStrings` is the single source for both loaders, the Context fallback and the row, so the same error can't end up in two languages on one row. `strings.ts` still imports nothing.
- `LIBRARY_KIND_SEARCH_KEYWORDS` separates search from display labels, and ST48 makes a future label rename fail loudly instead of silently breaking search.
- The PC2 `toThrow(Error)` checks now match exact messages, which makes them stronger.
- The ST13 list of remaining Georgian lines is now `[]`, and ST47 lists exactly which Georgian lines remain in the library, collection and demo files.
- The ready and error layouts are identical to before, and the `flex-wrap` alternative was rejected based on a real Chromium probe, not a guess.

### Architecture note
- **Signal 2 (ownership/coupling):** `app/data/studio-lab-demo.ts:9` and `app/lib/arrangement/collection.ts:3` now import from `lib/arrangement/strings.ts`. The dependency goes one way, to a module that imports nothing, so there is no cycle. ArrangementContext only gains one name in an import list (`ArrangementContext.tsx:156`). **Keep:** cohesion improves and no invariant is affected (audio timing, refs, gestures, Undo/Redo, `useArrangement()` shape).
- **Signal 3 (repeated costly change):** `ArrangementLibrary.tsx:103-134`, the library row layout, has been changed in rounds 142, 145 and 146. Each time it needed a real-browser width probe, and the copy moving to English is what makes the text longer. V-0.5b will touch the same file again (16 lines).
  - **Proposal for planner B (not approved scope):** one bounded task, "Library option row layout contract". Ownership: `ArrangementLibrary.tsx`, the option component only. Acceptance criteria:
    - ready, error, loading and previewing states each fit within 126px without clipping;
    - the row height while previewing is either fixed or explicitly accepted.
  - **Tests:** an LRS-style structure test plus one C browser row at the narrowest library width. Value: medium; risk: low. Schedule it only if V-0.5b's longer English copy breaks the row again.

### Alternative Approach
This is not auth, checkout or the Studio audio pipeline, so it's short:
- **Current:** the marker is a separate last child of the option button (`flex-col`), shown only while previewing.
- **Alternatives:**
  - `flex-wrap` on the meta row. Rejected because it changes the error-state layout (probe shows `x 47→8, y 0→16`).
  - An icon-only ▶ with `aria-label`. That fits the width, but the visible state is less clear and it adds an icon dependency.
- **Verdict:** the current approach is the best choice for this round. It fixes the clipping without touching the other states. Its cost, the height jump during preview (Suggestion 2), is something B should decide on.

### Score: 9/10