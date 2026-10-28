COMMIT: OK

The candidate is safe to commit. The diff changes Studio copy, adds one dismiss control and a hint that only shows when the project is empty. None of it is a correctness, security or TypeScript-strictness problem that warrants a block. Auth, purchase and download code are not touched. One clarification: `app/lib/arrangement/collection.ts`, which handles purchased collections, is in `paths.txt`, but its diff (patch lines 533–565) only changes the two `ready` strings and removes an unused `studioLibraryPanelStrings` import. Fetching, signed URLs and stem access are unchanged. I relied on the round-231 check (`c-round-231.json` PASS) and `verify.log` for test results and did not re-run them. This is a review of the diff only, not of the whole module.

## Code Review: CALM-2b (ArrangementDetailPanel / ArrangementLane / ArrangementLibrary / library-notice)

### Critical Issues
- none

### Suggestions (most important first)
1. **A mouse click on dismiss puts focus in the search box, so Studio shortcuts stop working** — `ArrangementLibrary.tsx:517-520`
   - The click handler always calls `librarySearchInputRef.current?.focus()`. After a mouse click, focus stays in the search input. The user's next Space or `?` is then typed into the search, filtering the library, instead of starting playback or opening the shortcut sheet. The focus ring is hidden because `data-focus-source="pointer"` is set, so the user can't see why.
   - Moving focus is only needed for keyboard activation, so focus doesn't fall to `body`.
   - **Fix:** `onClick={(event) => { dismissLibraryNotice(collection.id); if (event.detail === 0) librarySearchInputRef.current?.focus(); }}`. Update LN2 to cover both cases: a mouse click (`detail: 1`) should not move focus.
   - LN6 does not cover this, because jsdom `fireEvent.click` uses `detail: 0`.
2. **Extra `localStorage` reads on every library render** — `library-notice.ts:10-22` together with `ArrangementLibrary.tsx:192-196`
   - React calls `getSnapshot` during render and again after commit (to detect tearing). The in-memory set only skips the read once the notice is dismissed.
   - So in the default first-run state, every `ArrangementLibrary` render (a `useArrangement()` consumer) makes at least 2 synchronous `getItem` calls.
   - **Fix:** cache the read per collection in a `Map<string, boolean>` and set it to `true` inside `dismissLibraryNotice`. Doc 179 already accepts that dismissal does not sync across tabs, so nothing visible changes.
3. **The dismiss button is the only library button without `onKeyDown={preventRepeatedLibraryEnter}`** — `ArrangementLibrary.tsx:515`
   - The expand, collapse and clear-search buttons all have it. Holding Enter sends repeat keydowns to the search box after focus moves. `handleSearchKeyDown` ignores Enter, so I see no wrong-clip bug today, but the button should still match the others.
   - **Fix:** add the handler.
4. **LN5 hides every `console.error`** — `library-notice-ui.test.tsx:229`
   - In jsdom `window` exists, so the layout-effect branch `ArrangementContext.tsx:559` (`usePositionWriterEffect`) is chosen and runs in `renderToString`. That probably explains the expected warning.
   - But the mute would also hide a hydration or snapshot warning.
   - **Fix:** keep the mock, then assert that no call contains `getServerSnapshot`, `hydrat` or `snapshot`.
5. **Things only a real browser can show (not findings; for C-DETAIL / C-NOTICE):**
   - `ArrangementDetailPanel.tsx:855-869`: with nothing selected, check whether the two `sr-only` reason paragraphs (`position:absolute`) collapse a grid or flex row or a gap.
   - `ArrangementLibrary.tsx:475`: after dismissing, with no active filter, check for leftover `space-y-1.5` or `p-3` spacing.
   - The dismiss button sits close to `p-3` and `border-b`, so the 2px `:focus-visible` outline offset may be clipped.
   - Notice flash on reload when SSR shows the notice and the browser then hides it: this is accepted, and C is measuring it.
6. **Copy edge case** — `ArrangementLane.tsx:888-899`
   - The lane hint says "press Enter" even when the library has 0 sounds or every load failed. Low priority; no change needed this round.
7. **Commit hygiene**
   - The status change in `170-perf-16a-mp3-mediabunny.md` (C round 221) is bundled into the CALM-2b commit. Confirm that's intended; it doesn't block.

### Good Practices Found
- `aria-describedby` targets are kept: the reasons are only hidden visually with `sr-only`, and RF7 checks that From, To and Clip Gain still point to an existing element.
- The header keeps its `h2` and label element; only the text is empty.
- The lane hint uses `pointer-events-none`, so lane gestures don't change. Its conditions are fully covered by LSU9, including drag, ghost, fold and undo, and it reuses the video hint's existing `sticky left-56` pattern.
- `useSyncExternalStore` is used correctly: unsubscribe works, the server snapshot is chosen deliberately, and there is no hydration mismatch.
- A storage error falls back to in-memory dismissal (LN4). The key contains no personal data, only the collection id.
- Tailwind-only, design tokens only (`text-muted`, `text-dim`, `hover:text-foreground`), no new CSS. TypeScript is strict: no `any`, no type assertions, semicolons present.
- The dismiss button is 24×24, so it meets the WCAG 2.5.8 minimum. It has `aria-label`, `title` and `type="button"`, and the icon is `aria-hidden`.
- The single source of truth for strings is kept: `nothingSelected` is removed together with its only consumer, and `videoSoloTitle` is checked against `soloLabel(videoMixLabel)`.

### Architecture note
- **Signal 2 (who owns state):** `app/lib/arrangement/library-notice.ts:1-45` is a new module-level store with its own `localStorage` access and listener `Set`. Searching `lib/arrangement`, `components/arrangement` and `contexts` finds no other `localStorage` owner in Studio, so this is Studio's first persisted UI preference outside component state.
  - **Keep it this round:** it is small, its lifecycle is isolated, and it doesn't touch audio timing, refs or Undo/Redo.
  - **Proposal for the planner (not approved scope):** when a second persisted Studio preference appears (for example library width or detail height), create one `studio-prefs` module with versioned keys, a per-key cache and a `storage` event subscription, and move notice dismissal into it. Acceptance: LN1–LN6 stay green, plus a new cross-tab test.

### Alternative Approach
Not applicable: this is not checkout, auth or the audio pipeline. For reference, the alternative to storing dismissal in `localStorage` per browser would be storing it in the user's backend profile. That doesn't suit the anonymous demo, and the current choice is correct.

### Score: 8.5/10