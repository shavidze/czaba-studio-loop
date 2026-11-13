# tech-lead review of addendum-497 (read-only consult, 2026-11-13)
Verdict: APPROVE (all points optional).
1. Regex without lookbehind is correct; the reviewer's (?<![\w-])\. would miss a.button. False positives (url(x.button.svg), a comment) fail loudly. Not caught: [class~="button"] and @apply (outside finding 1).
2. BC1b 288 renders ~1.5 s, under the 5 s timeout. Optional: builder-only table + ~12 renders.
3. Add headClassName('primary','md',false,false,'') === HEAD_PRIMARY_MD self-consistency. -> ADOPTED.
4. shape not in the table; add one pill render. -> ADOPTED (secondary/sm/pill).
5. BC4 not.toBe(PILL_LG) now redundant; cosmetic. -> kept (no assertion removed).
B kept 288 renders (point 2): it pins render output, which A's 288-combo equivalence run also used.
Post-adoption: tests 42/42, tsc 0, biome 0, mutants 8/8 RED (precheck-*.log, mutants-497.txt). Final patch sha in addendum-sha.txt.
