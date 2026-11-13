# tech-lead sketch review (L10) — sketch v1 -> folded into v2 (2026-11-13)
Verdict: APPROVE with Lows (all folded into v2 = sketch-496.patch.txt):
L1 Button.tsx font-semibold duplicated in shapeStyles -> base string `font-semibold ${shapeStyles[shape]}`, shapes hold radius only. FOLDED.
L2 Header desktop skeleton w-[70px] h-[36px] rounded-sm vs 48px pill -> w-24 h-12 rounded-full. FOLDED.
L3 $.tsx transition-colors dead (unlayered a {transition} wins; hover:text-brand works) -> dropped. FOLDED.
L4 BC4 pinned literal styling tokens -> role/name/href + negative "not the pill builder string" + hover:text-brand only. FOLDED.
L5 `as const` (const assertion) avoided: typed ReadonlyArray<ButtonShape>, typed LINK_ROWS. FOLDED.
L6 import path: use the barrel '~/components/ui' everywhere (one path per concept). FOLDED.
Info: class-string asserts comply with L12 (elements found by role/name; builder contract is the string); BC1 literal labelled stage-1 pin; countZeroOffsetGlowHits/countTealHits are CSS-syntax counters (real guard on class strings is the regex, now incl. teal|cyan); type="button" on AssetListingPage correct; no cn (twMerge would change disabled output); naming OK; login/search inline styles pre-existing (recorded B-R496-LOGIN-SEARCH-INLINE-STYLES); text colour unchanged (#0e0d0c both).

## v2 confirmation (tech-lead, 2026-11-13)
Patch: b-round-495/sketch-496.patch.txt sha256 997099ef36801ac8ef7e2789522ffe9b81288a23f775f262e3b09d382a9e130f
Verdict: APPROVE. All six Lows folded (Button.tsx:89 `font-semibold ${shapeStyles[shape]}`, default byte-identical; Header.tsx:118 desktop skeleton w-24 h-12 rounded-full; transition-colors gone; BC4 role/name/href + not-pill + hover:text-brand; no `as const`; all imports via '~/components/ui'). No circular import (ui barrel imports only ~/hooks, ~/components/icons, ~/lib/constants, ~/types/cart). Biome import order fine; 3 warnings on untouched lines (HeroSection.tsx:138, AssetListingPage.tsx:28, $.tsx:84).
Info: desktop Sign In now sizes as flex instead of inline-block (same box 99x48 measured, sketch.json); look again in the next visual stage.
