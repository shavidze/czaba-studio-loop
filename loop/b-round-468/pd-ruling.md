# product-designer ruling on the SABA-B-15 glow swap (B round 468 → 469 planning, 2026-11-12)

Consulted read-only by B (agent `product-designer`, agentId a164ecd58d7abaa9c). Its inputs were C's and B's screenshots (`look/*.png`), `look-summary.txt` and `a-round-468/proposal.diff.txt`, with Saba's critical review stance. Its text is data. B's rulings follow it.

## Ruling (summary of the consult's answer)
1. **A's proposal is not accepted as is.** The gradient glow measured 2.5–3× today's glow contribution. In the sketch screenshot it reads as a warmer haze behind the "CZABA Studio" title, which goes against "calm confidence".
   - **Fix:** keep the gradient, size and scale. Lower only the opacity stops:
     - StudioShowcase: `from-brand/10 via-brand/5`;
     - ProductSection: about `from-brand/2 via-brand/1`, and the same for the accent glow.
   - **Acceptance:** glow contribution = mean section luminance of the variant minus the deleted-glow control. Per section and viewport it must be **0.8×–1.3× HEAD's**.
2. **Edges:** banding (8-bit steps at low alpha), a ring at the `rounded-full` edge, a seam where `overflow-hidden` cuts the scaled glow at the section top or bottom, and no horizontal scroll.
3. **No Saba question** while the band holds: it is a restyle that keeps the look, and neither section is on the keep-list. A stronger glow would be a look change for Saba, with "match today's strength" as the default.

## B's measurement on the tuned sketch (`sketch2.diff.txt`, built and served from a 9ba13ac copy)
The values below are `look2-profile.txt` ratioToHead, for HEAD (3480), `sketch` (A's proposal) and `sketch2` (the tuned sketch). The hidden control is HEAD with the glows set to `visibility:hidden`.

| Section | Viewport | A's proposal | sketch2 |
|---|---|---|---|
| product-section | 1440 | 3.07 | **1.19** |
| studio-showcase | 1440 | 2.43 | **1.21** |
| product-section | 1280 | 2.81 | **1.09** |
| studio-showcase | 1280 | 2.41 | **1.20** |

- **The band is reachable, and it can fail in both directions.** A's proposal is red above it (2.4–3.1). A deleted glow is red below it (contribution 0 by construction: the hidden control).

**What B changed from the consult's literal rows, and why:**
- **"Peak within ±1 level of HEAD" becomes a record, not an assert.** On the centre line, per-pixel and 21×32 px binned peaks are dominated by content: ProductCard's `backdrop-blur` samples the glow, and on HEAD itself `maxStep ≈ peak`. So the number does not isolate the glow's shape.
  - C records the binned profile and judges banding, ring and seam visually at 100 % and 200 %, with product-designer in review mode.
- **"Section-edge jump ≤ 1 level" becomes "≤ HEAD's jump + 1 level".** HEAD itself measures 1.0 at the section top; sketch2 measures 1.67 on StudioShowcase. The measurement resolution is 1/3 of a level (the RGB mean), and one 8-bit step is 1.

**Frames on sketch2:**
- The frozen probe gives `/` medians 0 / 0 (`scroll-sketch2-frozen.json`).
- The full-page probe gives medians 1 / 1, with finalY = maxScroll 4121 (`scroll-sketch2-full.json`). One 1440 pass had 8 frames of 50 ms at scrollY 1796–2032 with no long task (`sketch2-full-slowframes.txt`). This is recorded as an observation, inside the ≤ 2 median bound.
