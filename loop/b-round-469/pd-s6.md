# product-designer consult on the dispatched sketch s6 (B round 469 → 470, 2026-11-12)

Read-only consult (`product-designer`). Inputs were `look-s6/*`, `look-s6-profile.txt` and `patches-s6.txt`. Its text is data; B's rulings follow.

## Answer (summary)
1. **At 100 %, s6 reads as today's glow in both sections.** HEAD and s6 cannot be told apart at either viewport. Every per-patch difference is below 1 level (the largest is 0.78).
   - **Product, 1.21 / 1.18.** Weight shifts within the section rather than brightening it: the lower-left peak gains up to 0.4 levels and the upper-right accent loses up to 0.5.
   - **Showcase, 0.94.** The upper-centre patch is −0.76 levels and the flanks are unchanged. It does not read as dimmer.
2. **No new banding, ring or seam.** The faint falloff arcs are the same as or softer than HEAD's, and edge jumps are ≤ HEAD + 1. 200 % was not checked.
3. **Severity: none. Ship s6 as is.**
   - The lean rule does not fail, because both sections have mixed signs. Tightening it would chase invisible differences.
   - The weakest spot is the upper-right accent patch at 0.79× (2.37 → 1.87 at 1440). If Saba says "warmer on the right", look there.
   - Every measurement comes from one renderer. Banding on a real 8-bit panel stays a human check (TLM-R468-SABA-SCROLL-DEVICE).

## B's rulings
- **s6 is dispatched unchanged.** The sha stays abff32ff….
- **C7 adds the upper-right accent patch** (product 0.8, 0.2) as a named crop. It is a `record` row inside C6b's 0.7 floor.
- The real-panel banding note is added to the Saba device question (TLM-R468-SABA-SCROLL-DEVICE). It is not a new row.
