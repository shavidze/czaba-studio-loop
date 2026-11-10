# tech-lead review of sketch v1 (sha 9c8f5d9f191945fa9bc1a5d839b056d0d857ef58bdc788c02c1d9378c2063bb8), 2026-11-10

Verdict: approve-with-lows. No finding blocks. Rulings (a), (c), (d), (f) are right; (b) and (e) acceptable but overstated (findings 1, 2).

1. Medium. helpers/source-scan.ts:50-59, 88-96: skipQuoted has no newline bound; a stray apostrophe inside braces (JSX text "don't", regex /[^']/) pairs with the next quote anywhere later in the file -> silently over-long tag, not the throw (e) describes; lastIndex = end can swallow the next <input. Count pins would probably still go red, but (e) understates. Fix: inside braces, a ' or " string that crosses \n = no end (throw); SS2 fixture.
2. Low (ruling b). ArrangementMixFader.tsx:62,75 / studio-radio.test.ts:71-76: {...props} after type="range"; Omit<'type'> is compile-time only (a JSX spread of a wider object can still pass type at runtime) and the regex reads the whole file. Follow-up outside this task: move {...props} before type="range", then pin {...} before type= in the skeleton.
3. Low. source-scan.ts:140: jsxTagSkeleton returns the raw tag when the walk fails, so the spread hazard is dropped silently; no mutant covers it. Fix: throw.
4. Low. source-scan.ts:164,181: type= / style= need no whitespace; style = {x} passes until Biome formats. Fix \s*=\s*.
5. Low. source-scan.ts:162-171: jsxAttributeLiteral searches nested expressions (render={() => <x type="radio"/>}) and takes the first match. Fix: top-level attributes only.
6. Low. source-scan.ts:145,163: name/attribute go into RegExp unescaped. Fix: escape or assert /^[\w-]+$/.
7. Low (ruling a). studio-number-field.test.ts:116-124: can tighten without dataflow: require inputClass in each of the three tags (ArrangementDetailPanel.tsx:427/1072/1088) and pin STUDIO_NUMBER_FIELD_CLASS in the l.989 definition; add a mutant "one input drops inputClass".
8. Low. studio-radio.test.ts:57-70: the literal-type and spread-owner guards protect NF2/SF2 too but live under RD2; give them their own id; SS7 should match by path suffix.

Rulings: (a) right (see 7); (b) acceptable but weaker than claimed; (c) right (H4, SS4); (d) right (studio-lab route has no scanned tags; no capitalised wrappers under arrangement); (e) understated -> finding 1; (f) right. studio-focus-ring, studio-theme-obsidian, panel-radius-ui and strings tests carry their own recursive walkers: duplication, not a hole; port later.
ARCH-SPLIT will turn every exact-path pin red; intended; the split must update those pins in the same change.
Architecture note: keep (test-only helper under __tests__/helpers). If walker edge cases pile up, replace the hand-written walker with typescript createSourceFile (already a dependency, package.json:73); its JsxSpreadAttribute node removes rulings (c) and (e).
