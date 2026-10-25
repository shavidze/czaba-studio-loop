COMMIT: OK (none of the changes are in auth, purchase or download code. No listeners, timers or effects are added. TS strict and Tailwind tokens are fine. verify passed with 2512 tests; C round 150 passed, including the STATE-DISTINCT check.)

## Code Review: round-150 — Studio V-1a, Obsidian & Brass scoped tokens

### Critical Issues
- None.

### Suggestions (ranked)
1. **The `body:has()` selector reaches further than the doc says.** `root.tsx:159-161` always renders `AuthModal`, `ToastContainer` and `CookieConsent`. On `/studio-lab` the selector at `app/styles/app.css:3917-3918` turns all three gold. Doc `122-…md:28` only mentions the cookie banner and toasts. AuthModal is an auth screen. Auth code isn't touched, but the visual change there should be written down.
   **Fix:** add one sentence to doc 122:28 naming AuthModal and the `nav-loading-bar` (`app.css:246`). Pass to the planner the question of whether the auth/cookie screens should stay in the old cool palette inside the Studio (an M4 task).
2. **The same colour now means several things.** Because brand and accent are now the same colour (decision R5), the Loop brace focus ring (`ArrangementLoopBrace.tsx:233-235`, `border-accent` plus `ring-brand`) only shows as the border getting 2px thicker. A selected clip (`ArrangementClip.tsx:825`, `border-brand ring-2 ring-brand`), the Loop and the playhead are also now one colour. C's STATE-DISTINCT check covered Loop on/off, but not keyboard focus on the brace. **Fix (next round):** use `focus-visible:ring-foreground` or `ring-offset-1 ring-offset-background` on the brace, and add one browser check for focus versus enabled.
3. **Colours flip during route transitions (cosmetic).** When you leave `/studio-lab`, `AnimatePresence mode="wait"` keeps the old page mounted while it exits. So the Header, AudioPlayer and toasts appear with Obsidian colours for a moment, then switch to teal. The global hover transitions near `app.css:297` may animate that switch. The existing `body:has(.studio-container)` padding rule (`app.css:458`) has the same issue, so this isn't new. **Fix:** none needed now; just note it.
4. **The test pins the selector with a literal `\n`** (`studio-theme-obsidian.test.tsx:23-24`). A formatter or whitespace change in app.css would break TH2. **Fix:** match with a normalized string or a regex like `/\[data-studio-theme="obsidian"\],\s*body:has\(/`.
5. **TH3's hex regex will give false positives** (`test:163`, `#[0-9a-fA-F]{3,8}\b`). A fragment like `#add`, `#face` or `#1234` would trip it. **Fix:** anchor the regex to class or style context, or require the 3/4/6/8 lengths with a `[^\w-]` boundary.
6. **TH4 reads every file under `app/` as text** (`test:175`), including any binary. **Fix:** limit the include filter to `/\.(tsx?|css)$/`.
7. **Minor:** the new block uses hex while `@theme` uses hsl. Fine for now.

### Good Practices Found
- **Why the override works:** `@theme` isn't `inline` (`app.css:31`), so utilities read `var(--color-*)`. Tailwind v4 puts theme variables in `@layer theme`, and the new block is unlayered at the top level, so it wins the cascade no matter the specificity. No component needed to change.
- **No JS:** the attribute is rendered on the server (`StudioWorkspace.tsx:2186`). There's no hydration flash, effect or cleanup, and no extra render cost beyond one style recalculation on mount.
- **Portals are covered:** the export dialog and marker menu render in `document.body` and get the new colours without touching the frozen `Modal.tsx`.
- **Contrast fixes are documented:** dim `#928a7d` gives 4.60, the Loop brace fill `/20` gives 5.47, and the playhead `ring-1 ring-background` halo gives 8.32. The halo is a box-shadow, so layout (RV-1) doesn't change. B computed these numbers and C confirmed them in the browser; I didn't re-measure them.
- Text fields moved to `border-outline-strong` (#736b60 on #0e0d0c is about 3.6:1, above the 3:1 needed for UI parts). The pending Clip Gain field keeps `border-warning` via twMerge.
- The tokens Studio doesn't use (`brand-rgb`, `info`, `error*`, `secondary`) don't appear in arrangement components, so no teal or orange leaks in. I checked this with grep.
- Updating doc 121's status is accurate and matches gate 148.

### Architecture note
- **Signal 2 (coupling):** `StudioWorkspace.tsx:2186` → `app.css:3917-3918`. Whether one feature component is in the DOM now decides the body-level tokens for every global screen. **Keep:** it's SSR-safe, has no lifecycle, and `Modal.tsx` is frozen. **Proposal for the planner (M4):** decide explicitly whether to scope portals (a theme attribute on the portal root) or accept body-level theming, with focused tests for AuthModal and toast colours.
- **Signal 2 (location):** the Studio palette sits at the end of a ~3900-line global stylesheet, and TH2/TH4 pin it to `styles/app.css`. **Keep for now.** **Proposal:** move it to `app/styles/studio-theme.css`, import that from app.css, and update TH2/TH4 in the same task. The acceptance check is computed tokens unchanged in C.
- This reviews the diff only; I haven't fully checked the module.

### Alternative Approach
- **Current:** an SSR `data-studio-theme` attribute plus `body:has()`. No JS, no flash, and portals are covered.
- **Alternative:** a `useEffect` that sets `data-studio-theme` on `document.documentElement` and removes it on cleanup. This needs no `:has()` and covers portals deterministically. But it adds a new lifecycle to StudioWorkspace (signal 4), the first paint before hydration would be in the cool palette (a flash), and SSR wouldn't show the theme.
- **Verdict:** the current approach is better. It's server-rendered, has no lifecycle, and follows the existing `body:has(.studio-container)` pattern. The route-transition flip happens with either approach.

### Score: 8.5/10