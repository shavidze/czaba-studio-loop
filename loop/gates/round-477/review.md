COMMIT: OK

I found no blockers. I read the diff and the `app.css` tokens it relies on, and I didn't run it in a browser. C's PASS and the passing verify log cover tests and build.

**What I checked**
- **Auth, purchase and download code:** none of it is touched. The changes are limited to `Header.tsx`, `EntranceCover.tsx`, `SpotlightLoader.tsx`, two test files and the implementation doc.
- **Tokens:**
  - All the tokens the diff uses are defined in `app.css`: `--color-background` (line 47), `--color-brand` (63), `--color-foreground` (69) and `--color-brand-rgb` (133).
  - `rgba(var(--color-brand-rgb), a)` is already used in `app.css` and `store.tsx`.
  - The new `color-mix(in srgb, var(--color-background) 80%, transparent)` matches the pattern at `app.css:237`.
  - Tailwind `bg-background`, `text-brand` and `bg-foreground/50` resolve to those tokens.
- **Event ordering and leaks:**
  - The timers, the `keydown` listener and the click listener are unchanged, and the effect still cleans all of them up.
  - The dust particles now come from `useState(createDustParticles)`, so `Math.random()` runs once per mount instead of on every render.
  - Before, the particle `x`, `duration` and `delay` were re-rolled on every phase change (four times in an entrance), and framer-motion could see new `initial` and `transition` values. That was a real jitter and render-cost bug, and it is fixed.
  - There is no hydration risk, because the component returns `null` until `isVisible` is true after the mount effect. The Math.random call in the initializer runs during SSR but isn't rendered.
- **Cover-to-overlay handoff:**
  - The head cover (`EntranceCover.tsx:24`) and the overlay (`SpotlightLoader.tsx:~181`) now share `--color-background` (#0e0d0c). Before, both used pure black, so there is no colour pop between them.
  - Both rely on a CSS variable that comes from the stylesheet. The old `--color-black` had the same dependency, so the risk is unchanged.
- **Accessibility:** the overlay stays `aria-hidden`. The brass wordmark (#c9a46a) on the near-black background has high contrast. Skipping with Esc or Tab and clicking are unchanged. The header link has no hover colour that could now clash.
- **Strict TypeScript:** the new `DustParticle` interface is typed, and there are no `any` types, assertions or suppressions. The tests use `instanceof` narrowing and a throw instead of casts.

**Findings, ranked**
1. Low: `store-entrance-loader.test.tsx:~340` (test P3) reads the component source and regex-counts the stops (six `rgba(var(--color-brand-rgb),…)` matches and a literal `color-mix` string). Reformatting the file or adding a seventh stop would fail it. Fix: if it gets noisy, assert on the rendered inline styles instead of the source text.
2. Low: `SpotlightLoader.tsx:32` says time is counted "from claimEntranceStart's performance.now()". That is only true on the session-fallback path. On the head-cover path the start is `handshake.start`. Fix: reword it to "from the entrance start (handshake.start or performance.now() at claim)".
3. Info: the dust `x`, `duration` and `delay` are still unseeded `Math.random()`. That is fine visually, but it means the tests (P4) can only count calls, not check values.

**Architecture note**
- Signal: `SpotlightLoader.tsx:64-170` is the only one. The component now owns the handshake claim, the timeline timers, the key and click listeners, and the particle generation. That is mixed responsibilities plus new state in an existing owner. This diff adds only a pure, one-shot `createDustParticles` helper, which is a small, isolated addition.
- Keep it. Everything shares one lifecycle: the effect cleanup, the timers and the phase state sit together, and the tests (P1–P4 and the existing ones) pin the timing and the listener cleanup. Splitting it now would risk the entrance timing and the cover handoff, with little gain.
- Proposal for the planner, only if a later round touches the entrance again: extract the handshake and timeline logic into a `useEntranceTimeline()` hook inside the same module. The acceptance criteria would be that the public `SpotlightLoader` behaviour and the existing store-entrance-loader tests stay unchanged.

This was a review of the diff. It does not mean the module was fully audited.