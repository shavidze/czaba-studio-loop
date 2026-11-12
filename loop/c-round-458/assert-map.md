# C6 assert map, round 458 (git diff db95f40 -- app/lib/__tests__)
expect( counts: live-teal 76, glow 21, gradient 23, teal-sweep 10 (== expect-counts.txt sketch458).
Removed/changed expectations and replacements:
- live-teal LIVE_HEADER_COUNTS lineCount loop -> LIVE_SELECTOR_COUNTS with cssRuleSelectorCount + bodies.length + teal/glow hit checks per body (stronger).
- live-teal key format 'x.css .a, .b {' -> 'x.css .a, .b' (header key drops brace; same grouping, same counts); '.dead {' keys likewise.
- LT9 row "const accept = 'audio/*'... from './q'" ['./q'] -> [] (hazard now followed); replaced by regex-literal row still ['./q'] and LT10.
- glow ruleBodiesFor -> cssRuleBodies (same assertion, plus added background assertion, PRIMARY_BUTTON_SELECTORS loop, @supports/@media nested case 't: 6;').
- glow RETIRED_UTILITY_PATTERN sample 'shadow-glow-accent' -> '--shadow-glow-accent' plus new 'accents' boundary row (count 1).
- gradient: resolvedImports -> mountGraphImports, +3 positive rows.
No assertion dropped without equal or stronger replacement.
