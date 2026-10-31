COMMIT: OK. Nothing blocks this commit. All findings below are follow-up suggestions.

## Code Review: round 296 (STUDIO-LINK-a, product page deep link to the Studio)

**What I checked:** the 10 paths in `paths.txt`, the diff, the 3 new files and the verify log (227 test files and 3412 tests pass). The "must be used within an ArrangementProvider" errors in the log are expected: they come from the deliberate outside-provider cases in `context-hygiene.test.tsx`. I read `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md`. This is a review of the diff only, not a full check of the modules.

**No auth, purchase or download code is touched.** `ProductSidebar.tsx` does contain the "Complimentary Download" button (`:74-79`), but the change only adds a new `<p>` with a link inside the title block (`:60-71`). It does not change `isFree`, the button, `resolveCatalogPrice` or any handler. Auth, cart and checkout files are not in the diff.

### Critical Issues
- None.

### Checks that could have blocked the commit (both clean)
- **The deep-linked source is what Enter adds.** `addSourceToActiveTrack` falls back to `latestRef.current.selectedSourceId` (`ArrangementContext.tsx:1636`). That ref is built from the `selectedSourceId` state (`:751-757`), which now uses the lazy initializer (`:664-670`). So Enter on the focused option adds the deep-linked source, not `sources[0]`.
- **Real-browser focus order.** The new test stubs `requestAnimationFrame`, so I checked for any delayed focus on mount that could steal focus from the option in a real browser. The only delayed library focus is `focusLibraryOption` (`ArrangementLibrary.tsx:280-282`), and it only runs after a user action. The focus calls in `StudioWorkspace` either respond to something the user did or only act when nothing is focused (`:1013-1015`). None runs on its own at mount.
- **Hydration.** The server snapshot for the wide check is `true` (`useStudioWideViewport.ts:23-25`), so a full page load on a wide screen never counts as a narrow-to-wide change, and the existing focus on `arrangement-exit` (`studio-lab.tsx:77-86`) doesn't compete. The preview focus waits for the first hydrated commit, and the settled ref stops it from running again. The server and client pick the same initial selection from the URL, so there is no mismatch. After a client-side navigation the clicked link is already unmounted, so focus is on `<body>` and the guard lets the option take it.
- **Security (SECURITY_AUDIT §2, URL parameters).** `?preview=` only passes through an allow-list `Map`, so `__proto__`, `constructor` and `toString` give `null` (LK1). The value placed in the selector always comes from that fixed map.
- **TypeScript, Tailwind and listeners.** No `any`, no type assertions, no suppression directives. The link uses only design tokens (`text-muted`, `hover:text-foreground`), and the arrow icon has `aria-hidden`. No new listeners or timers; the effect has nothing to clean up.
- **Error codes.** No new error paths, so ERROR_TAXONOMY doesn't apply.

### Suggestions (ranked)
1. **`ProductSidebar.tsx:62-66` — phones reach a dead end.** On a narrow screen the link opens the Studio's "use a wider screen" page. Fix: add `hidden min-[900px]:inline-flex` (replacing `inline-flex`) so the link only shows from the same 900px breakpoint the route uses. If you'd rather keep it visible on phones, have the narrow screen mention the product.
2. **`ProductSidebar.tsx:62` — no prefetch.** `/studio-lab` is the heaviest route. Fix: add `prefetch="intent"` to the `Link` so the Studio code starts loading on hover or focus.
3. **`studio-lab.tsx:72-74` — the selector is only safe while the map is fixed.** It builds `[data-source-id="${previewSourceId}"]` from the id. When STUDIO-LINK-DYNAMIC starts using backend ids, wrap the id in `CSS.escape(...)`, or switch to focusing through a ref (see the architecture note).
4. **`studio-lab.tsx:64-75` and `ArrangementContext.tsx:664` — changing `?preview=` on a mounted route does nothing.** The selection is only read once and the focus only runs once. The doc already lists this as a TODO; STUDIO-LINK-b (round 297) should handle it, or key the provider by `previewSourceId` when it adds the reverse link.
5. **`studio-lab.tsx:64-75` — focus does nothing if the library is collapsed.** If the option isn't rendered, the lookup finds nothing and the settled ref still blocks a retry. The library starts expanded today (`StudioWorkspace.tsx:701`), so this isn't reachable yet. Keep it in mind if the collapsed state is ever saved between visits.

### Good Practices Found
- The link module imports nothing, so the demo synth doesn't end up in the product page bundle.
- Using a `Map` lookup avoids prototype-key bugs, and LK1 tests those keys.
- The deep link only selects and focuses; it never edits the arrangement, so no Undo entry is needed.
- LK4 uses a three-source collection, so the result can't pass just because the target happens to be first.
- The doc records the mutants used and the rejected alternatives.

### Architecture note
- **Signal 2, coupling/ownership: `studio-lab.tsx:72-74`.** This is the second place the route finds an element inside a child component by attribute (the first is `arrangement-exit` at `:83-85`). The route now depends on the library rendering options with `role="option"` and `data-source-id`.
  - **Keep it for now:** there is one mapping, the attributes are stable and the tests pin them. Audio timing, refs, gesture lifecycle, Undo and the shape of `useArrangement()` are not affected. Cost of keeping: low.
  - **Proposal for the planner (one bounded task, not part of this round):** let `ArrangementLibrary` or the provider take an "initial focus" request, such as an `initialFocusedSourceId` passed through the provider, and focus it through its existing `optionRefs` map. The route would then stop looking into the library's DOM. Done when LK5–LK7 still pass unchanged and the attribute selector is gone from the route.

### Alternative Approach (critical logic: Studio entry and selection)
- **Current:** a fixed allow-list map, an initial selection set through a provider prop, and a one-time DOM focus from the route on the first hydrated commit.
- **Alternative:** a Remix `loader` that reads `?preview=` and returns the source id, with the library focusing the option itself through its option refs.
- **Verdict:** keep the current approach. Selecting on the server already works without a loader because `useSearchParams` gives the same value on both sides. A loader would add a server round trip and a new `json()` contract for what is only a lookup. The ref-based focus is better long-term, but it's the architecture note's task, not this round's.

### Score: 9/10