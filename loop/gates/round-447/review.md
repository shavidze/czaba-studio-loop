COMMIT: OK

## Code Review: round-447 (STORE-2b-2a teal sweep)

I read the diff, the new test and the implementation doc. I also checked the tokens and the leftover references. I didn't run the browser, and I'm relying on the C PASS and the passing verify log.

### Critical Issues
- None. The diff touches no auth, purchase, download, API client or context code. The `checkout.success.tsx` change only removes a decorative ripple `motion.div`.

### Suggestions (ranked)
1. **`app/components/home/StudioMockup.tsx:52-56`**: `active` and `solo` map to the same class. The Solo state is therefore no longer visually distinct on the waveform. The doc justifies this, because brass means "playing" and Solo shouldn't use yellow. The SOLO button at line 100 still shows its own state with `bg-yellow-500`. That is a non-teal hardcoded colour and a Tailwind-token violation, but it is out of scope for this round and not in the teal regex. Fix: record it in the 2b-3/2b-4 inventory. For `WAVEFORM_TONE_CLASSES`, either merge `solo` into `active`, or keep the map as it is for a later distinct treatment.
2. **`app/components/home/StudioMockup.tsx:65`**: `w-full h-full ${…}` is string-interpolated, which is fine for Tailwind because the class names are literal in the map. There is no render-cost issue, since `WAVEFORM_TONE_CLASSES` is module-level.
3. **`app/components/loading/SpotlightLoader.tsx:~179`**: the sweep line is now `bg-brand/50` while Framer animates `width` and `opacity`. Check in a real browser that the line doesn't flash a full-width solid at 0 width. The doc says width/opacity animation is unchanged and the contrast was measured, so this is low risk.
4. **`app/components/product/ProductCard.tsx:~75`**: this removal is positive.
   - Removing `onMouseMove` with `setState` per mouse event cuts the re-render cost on every grid card.
   - No listeners or timers are left behind.
   - A grep confirms no leftover `isHovering`, `mousePosition`, `cardRef` or `React.` references.
   - The `useRef` and `useState` imports were removed together with their last use.
5. **`app/lib/__tests__/store-teal-sweep.test.ts:11`**: the regex is a hand-copied string. The test recursively scans `app/` by `readdirSync`, so it takes a bit more I/O. It's acceptable, and TS2 guards against a vacuous scan. A real concern is `hsla?\( ?17[0-9]…`, which could false-positive on other 17x-hue colours later. That would be a loud failure, which is acceptable.
6. **`app/lib/__tests__/store-teal-sweep.test.ts:36-52`**: the test uses `__dirname` with `// @vitest-environment node`. This works under vitest, and verify passed.

### Good Practices Found
- All new classes use tokens, and I confirmed they exist in `app/styles/app.css` (`--color-brand`, `--color-brand-foreground`, `--color-foreground`, `--color-dim`).
- `stroke="currentColor"` replaces the hex map, so the hardcoded hex values are gone and the `as keyof` cast has been dropped. This is better for TS strict.
- The `tone` prop is a typed union with a `Record` map, replacing `color?: string`.
- There are no `any` types, no suppressions and no new casts.
- The loader timers keep their existing cleanup, and nothing was added to them.
- The implementation doc is complete, and the mutants plus the contrast measurements in a real browser are well documented.
- The hover shadows on `SpecialOffersSection` were removed along with `transition-shadow`, so no dead transition is left.

### Accessibility notes
- The Play glyph contrast is 8.32:1, "Export Mix" is 5.82:1 and the muted waveform is 6.15:1 (as measured). These are fine.
- The `text-foreground` wordmark has the same legibility as before, and arguably better than the gradient clip, which was transparent text.
- The selected gift-card state still differs by `border-brand bg-brand/5`, so selection no longer relies on glow alone. The contrast of that border and fill is unmeasured but plausible.

### Architecture note
- None for this diff. I checked the four signals against the diff and none fits. There is no new state or lifecycle. `ProductCard` loses state. `MockWaveform` keeps one owner.
- One planner-level observation, with no action required in this round: the allow-list test in `store-teal-sweep.test.ts` is a new cross-cutting ratchet. It will need edits at every sweep stage (2b-2b, 4, LEGACY). If it keeps changing, one bounded planner task could move the allow-list into a dedicated constants file. Keep it as it is for now, because a single file with reasons per entry is cohesive.

### Alternative Approach
Not critical logic, so none.

### Score: 9/10