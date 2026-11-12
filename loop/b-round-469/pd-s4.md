# product-designer consult on candidate s4 (B round 469 → 470, 2026-11-12)

Read-only consult (`product-designer`). Inputs were `look-s4/*`, `look-s0/*`, `look-s4-profile.txt` and `patches-s4.txt`. Its text is data; B's rulings follow.

## Answer (summary)
1. **At 100 %, s4 looks like today's glow in both sections.** The lean is consistent and runs in opposite directions:
   - **Product section, slightly weak.** All listed patches are dimmer. The peak is 3.58 vs 4.73 (0.76×).
   - **Showcase, slightly strong.** It is brighter everywhere. The top flanks are 1.28×, at the ceiling.
   - The round-468 haze behind the title is gone.
2. **No visible banding, ring or seam at 100 %.** 200 % was not checked by the consult. Edge jumps equal HEAD's.
3. **Bound.**
   - Apply 0.7–1.3× to **every** patch where HEAD's glow is at least 2 levels, not only the peak. A single peak missed the s0 flatness.
   - **Lean rule:** fail if every changed patch in a section moves the same way and the section ratio is outside 0.9–1.1.
   - Keep the per-patch bound at ≤ 1.5 levels, because one unit is about 1/3 of a level.
   - **Suggested nudge:** product stops up one step (`from-brand/6`), showcase `via-brand/15` → `/12`.
4. **C-R469-01 if s4 ships: Low.** It would be "none" after the nudge.

## B's rulings
- **Nudge applied, with one more step.** That gives s5 and then s6.
  - s5 (`from-brand/6`) did not lift the product's bright patches (still 0.70–0.80). The lower-left peak sits below the P1 centre, so it needed a stronger middle stop. s6 = `via-brand/3`.
- **s6 measured** (`patches-s6.txt`, `look-s6-profile.txt`):
  - section ratio product 1.21 / 1.18, showcase 0.94 / 0.94;
  - bright patches 0.78–1.08;
  - max |cand − HEAD| per patch 0.54–0.78;
  - mixed lean (product 16+/7−, showcase 13+/2− and 9+/8−);
  - edge jumps ≤ HEAD + 1.
- **All four of the consult's rows become C rows** (C6a–C6d in `current-task.md`).
- **s0 (the round-469 tree) is the mutant.** It is red on C6c (max 2.64–2.77) and C6b (bright patches 0.44–0.69).
