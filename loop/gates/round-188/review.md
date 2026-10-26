COMMIT: OK. Nothing blocks this commit: no Critical or High findings, and no auth, purchase or download code is touched.

## Code Review: STORE-1c — Header.tsx, Footer.tsx, e2e/navigation.spec.ts, store-header-footer.test.tsx, docs 154/155

I reviewed the round-188 diff and both new files against HEAD `cb24362`. This is a review of the diff only, not of the whole module. I used your verify log (182 test files and 2664 tests passed, build OK) and your report that C passed round 188. I didn't run anything myself.

### Critical Issues
- None.
- **Auth, purchase and download code:** not touched. The diff has no hunk in the auth block of `Header.tsx` (lines 99–146 and 197–235). That covers the skeleton, user menu, Sign In, `/account*` links and Logout. N5 tests that the block still behaves the same.
- **Listeners and timers:** none added. The only effect is the old cart badge timer (`Header.tsx:17-25`), unchanged and still cleaned up.

### Suggestions (most important first)
1. **Doc 155 is out of date** (`docs/implementation/2026/quarter-IV/155-store-1c-header-footer.md:4` and `:72`). It still says "In Progress (awaiting C round 188)" and that C hasn't checked it yet, though C passed. This follows the round-187 pattern, where doc 154 was updated in the next round, so it doesn't block. Fix: next round, set it to Completed and record the C-188 result, as was done for doc 154.
2. **Mobile menu accessibility** (`Header.tsx:148-154`, `:159-161`). This existing gap is now more visible because the nav was rebuilt.
   - The toggle has no `aria-expanded` or `aria-controls`.
   - The closed menu is only hidden visually (`max-h-0 opacity-0`). Its four links and the Sign In button can still be reached with Tab, under `lg`.
   - Fix (STORE-2, already listed in TODO): add `aria-expanded={isOpen}` and set `inert` or `invisible` on the wrapper when the menu is closed.
3. **N2 depends on DOM structure** (`store-header-footer.test.tsx:103`). `mobileNav?.parentElement?.parentElement` breaks if a wrapper div is added. Fix: when the menu gets an `id` for `aria-controls` (item 2), select the wrapper by that `id` or a role instead.
4. **The brand name is defined twice.** `Header.tsx:54` hardcodes `CZABA`, while `Footer.tsx:4` has its own `APP_NAME`. They match today and could drift later. Fix (optional, later): one shared constant. Not needed in this round.
5. **Stale e2e entry outside this diff** (`e2e/main-flow.spec.ts:58-61`). It still checks `/music` and `/hire-us` in the header. The `isVisible()` guard means it now silently tests nothing. It is already in the TODO. Fix: remove the entry or move it into the guard-free nav test.
6. **UX note, not a code issue.** The "Demo" badge is gone, but the `studio-lab.tsx` page title still calls it a "Demo workspace". Visitors now find out it's a demo only after they click "Studio". This is the approved D15 decision, but tell Saba about it.

### Good Practices Found
- **One h1 per page.**
  - The wordmark is now a `span` with `block` and the `text-foreground` token. Doc 155 measured the same header height (80.97 px) and found no new custom CSS.
  - `text-glow` was removed from the header without editing the frozen `app.css`.
- **Existing e2e still works.** The hero test (`e2e/navigation.spec.ts:9`) still finds an h1 containing CZABA, now the one in `HeroSection.tsx:159-164`, so losing the header h1 doesn't break it.
- **Desktop and mobile navs match.** Both have the same order and hrefs, and they still use `prefetch="intent"` and close the menu on click. The `/studio-lab` route exists.
- **Tests:**
  - Strict TypeScript: no `any`, `@ts-ignore` or `as` casts.
  - Mocks are hoisted, state resets in `beforeEach`, there is an SSR check (S1), and N1–N4, S1 and F1 started out failing as they should.
- **Footer:** it only uses the existing `APP_NAME`. The footer links (including Gift Cards and Hire Us) are unchanged, and F1 checks that they stay.

### Architecture note
- None. None of the four risk signals appears. The diff only changes markup and text, adds no state, effect or listener, and moves no ownership. Keep as is.

### Alternative Approach
- This isn't critical logic (not auth, checkout or the audio pipeline), so this section doesn't apply. The one decision worth noting, R56 (pointing Collections at `/store` instead of creating a new `/collections` route), is the better choice. A new route would invent structure before the D14 business decision.

### Score: 9/10