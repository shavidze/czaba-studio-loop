COMMIT: OK

I read the diff, `EntranceCover.tsx` and the call sites. I did not run a browser, so event ordering is judged from the code and the 19 E-tests. `SECURITY_AUDIT.md` and `ERROR_TAXONOMY.md` produced nothing blocking. No auth, cart/checkout, download or API code is touched. The inline `dangerouslySetInnerHTML` carries only module constants, with no user input, so there is no XSS path.

## Findings, ranked (none block the commit)

1. **`EntranceCover.tsx:24` — the cover background depends on a Tailwind variable.**
   - `background:var(--color-black)` is not in `@theme` in `app.css`. It resolves only because `bg-black` is used in about 13 files, so Tailwind v4 emits the default variable.
   - If those usages go away, the property becomes invalid and the cover turns transparent. The first frame then flashes white, and no test catches it.
   - Fix: write `var(--color-black,#000)`. Then update the E1 assertion, which currently expects the bare `var(--color-black)`.

2. **`SpotlightLoader.tsx:285-306` — the dust particles are re-randomized on every phase change.**
   - `Math.random()` runs in render. The block was previously mounted only after the spotlight phase, but it now renders from mount.
   - The three `setPhase` calls therefore create new `initial`, `delay` and `duration` props during the first 300 ms. Framer Motion reads `initial` only at mount, so the visible impact is small. It is wasted work, and it is non-deterministic.
   - Fix: build the 15 particle configs once with `useMemo` or `useState(() => …)`.

3. **`EntranceCover.tsx:27,30` — inline `<script>` and `<style>` will need a nonce if a CSP is introduced.**
   - No CSP exists in the repo today. `SECURITY_AUDIT.md` §6 says to keep inline scripts minimal.
   - This one is small, wrapped in try/catch, and has no user input. Keep it, and add a docs note.
   - Fix: carry a nonce through the root loader when a CSP is added.

4. **`store-entrance-loader.test.tsx` E11 — the test reads `root.tsx` and matches it with a regex.**
   - It breaks on any formatting change or when another element is inserted between `<Links />` and the cover.
   - Fix: assert on the order of rendered head children, or relax the pattern to `/<Links \/>\s*<EntranceCoverHead \/>/`.

5. **Test E8 uses `let notPrevented = false; notPrevented = skip();`.** The initial assignment is dead code. Use `const notPrevented = skip();`.

## Checked and fine
- **Event ordering:** the capture-phase `keydown` and `click` listeners never call `preventDefault`. The overlay is `z-50` and the cover is `z-60`. The cover is switched off in the effect after the overlay commits, so there is no white gap.
- **Listener and timer leaks:** the boot listeners are removed on skip, on takeover, on failsafe expiry, and by a 1250 ms timer. E15, E17 and E18 assert this. The effect cleanup clears all four timers and both listeners.
- **React StrictMode:** a second `claimEntranceStart` returns null once the handshake is `live`, and the already-set state keeps the overlay visible. The session-claim path behaves as it did at HEAD.
- **Re-entry:** a client navigation back to `/` never replays the entrance, because the handshake state is no longer `pending`.
- **Reduced motion and no JS:** the cover is `media="not all"` by default and sits inside `prefers-reduced-motion: no-preference`. It is a pseudo-element with no accessible content, so there is nothing for a screen reader to trip on.
- **TypeScript:** `instanceof HTMLStyleElement` is used instead of an assertion. The `Window` augmentation is typed. There is no `any` and there are no suppressions. The `suppressHydrationWarning` on the head elements is intentional.
- **Docs:** the implementation doc `300-…` is present.

## Architecture note
- signal: `SpotlightLoader.tsx:48-136` (and `EntranceCover.tsx:30`).
  - The component now also owns the handshake protocol (`window.__czabaEntrance`), the DOM sync of the head `<style>`, and the timeline math, on top of rendering the overlay. This is signal 4 (new lifecycle in an existing owner) and partly signal 1 (mixed responsibilities).
  - The boot script, the React side and the CSS must stay in lockstep through string constants.
  - **Keep for now.** The handshake is cohesive with the single effect that consumes it. The tests cover each side, and `entranceTimeline` is already a pure exported function. Splitting it now would only add prop plumbing.
  - **Proposal for the planner, only if a later round touches this region again:** one bounded task to extract `useEntranceHandshake()`, which would hold claim, takeover and the cover sync and return `{ startMs, visible }`. Ownership would be the `loading/` folder. Acceptance would be that E1–E19 pass unchanged, with no change to the timeline numbers.
  - This is a review of the diff only. I do not claim the whole module was audited.

## Alternative Approach (critical logic: first-visit entrance)
- Current: an inline head script flips a `media`-gated `<style>` and writes a `window` handshake. React takes over in `useEffect`, and the failsafe is a CSS animation.
- Alternative: a React-only loader, or a server-rendered cover keyed on a cookie.
  - React-only: the first paint is not covered, so you get a flash of the page before hydration.
  - Cookie: this adds a server dependency and cache variance per user.
- Verdict: the current approach is better. It gives a black first frame, works with no JS or when hydration fails, and cannot get stuck, thanks to the CSS failsafe.

### Score: 8.5/10