Section has `overflow-hidden`, so the scaled glows are clipped. I found no auth, purchase or download code in the diff. The styles stay Tailwind-only with design tokens. The new test file is only a static scan.

COMMIT: OK

## Code Review: ProductSection.tsx, StudioShowcase.tsx, store-scroll-paint.test.ts, doc 305

### Critical Issues
- None.

### Suggestions (ranked)
1. **`store-scroll-paint.test.ts:31`**: the counter only matches `blur-[Npx]`. Named utilities such as `blur-3xl` (64px) and `blur-2xl`, and arbitrary-unit values such as `blur-[8rem]`, are invisible to it, so the guard can be bypassed. Fix: add a comment-free second regex for `blur-(2xl|3xl)` and for `rem` values, or document the limit in the test name. This does not block the commit, since SP1 and SP2 cover the measured regression.
2. **`ProductSection.tsx:38-39` and `StudioShowcase.tsx:75`**: the `scale-*` values (160, 180, 145) are tuned numbers and the stops are magic percentages. The doc records the 70% stop ceiling (SIG-R470-STOP-CEILING), but nothing enforces it. Fix: if a restyle is planned, extract a shared `GlowOrb` component. For now the doc entry is enough.
3. **Accessibility**: the glows are decorative `div`s with `pointer-events-none` and no content, so there is no a11y impact. The contrast of the text over the glow is similar to before, because the measured luminance ratio is 0.94–1.21.
4. **`docs/.../305-...md:77-79`**: some evidence lives only in `tmp/studio-real-loop/`, outside the repository, and can't be reproduced from the repo. Fix: acceptable, since the doc says so. Avoid citing those paths as proof later.
5. **Environment limit (not code)**: the scroll gain was measured only on SwiftShader (software raster). Real GPU-raster behavior is unconfirmed, and the doc tracks it as TLM-R468-SABA-SCROLL-DEVICE.

### What I checked
- **Tailwind 4.1.18**: `bg-radial`, `scale-160/180/145`, `via-30%` and `to-60%` all exist at this version (`bg-radial` arrived in 4.1). `from-brand/6` and `via-accent/2` use integer opacity, which v4 supports. The `scale` and `translate` utilities use separate CSS properties, so `-translate-x-1/2` and `scale-*` compose without conflict.
- **Event ordering, listeners and timers**: the diff touches no JS behavior, so nothing can leak. Render cost drops: the filter-blur pass is replaced by a plain gradient background.
- **Clipping**: `ProductSection` has `overflow-hidden` at line 33. `StudioShowcase` has it at line 72.
- **TS strict**: the test has no `any`, no type assertions and no suppression directives. The helpers it imports exist in `helpers/style-scan.ts`. Verify log: `# pass 2`, `# fail 0`, agent checks passed. The "must be used within Provider" lines in the log are expected error output from tests, not failures.
- **Security**: no `dangerouslySetInnerHTML`, no secrets, no token or API changes. SECURITY_AUDIT and ERROR_TAXONOMY don't apply to this diff.
- **Allow-list**: the Newsletter (1) and SpecialOffers (2) counts are exact. Drift in either direction fails SP1.

### Good Practices Found
- The guard is a static scan with an allow-list that carries reasons, and SP3 prevents a vacuous pass.
- The new doc has measured acceptance criteria and a record of rejected options. It rejects `will-change` for a measured reason.
- The change is scoped to the measured sections only, and keep-list files are untouched.

### Architecture note
- none. Two signals were considered and neither warrants action:
  - `store-scroll-paint.test.ts:31`: this adds a style-scan guard next to the existing `style-scan` helpers. It reuses their API and has a single responsibility, so keep it.
  - Three near-identical glow `div`s across two files: the repetition is small and each has its own tuning. Keep it. If a fourth glow or another restyle round arrives, the planner could take one bounded task to extract a `GlowOrb` presentational component, with the existing SP1–SP3 tests as the guard. This is a proposal only.

### Alternative Approach
Not critical logic (no auth, checkout or audio). Current: a static radial gradient with `scale`. Alternative: remove the glows (cheapest, but it changes the look, which is Saba's decision), or use `will-change`/`transform-gpu` (measured about 10× worse). Verdict: the current approach is better.

### Score: 9/10