# code-reviewer report, round 472 (verbatim, agentId a26eb505e5216df28)

## Code Review: `self-hosted-fonts.test.ts` (FN4/FN6) and implementation doc 306

The test changes are sound. FN4 now reads only the store `@theme` block, compares the three font tokens to exact values, and fails on each of the eight mutants. The real problem is in the doc: one line in "შეცვლილი ფაილები" still describes the round-471 behaviour of FN4 and contradicts the updated lines. I found no type-safety, semicolon or styling-selector problems.

### Findings

**Medium: doc line 79 contradicts the code and the doc's own lines 88 and 95**
- `/home/runner/czaba-project/store/docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md:79` still says FN4 checks every `--font-*` declaration in the whole file, "obsidian ბლოკის ჩათვლით".
- FN4 now reads only the comment-stripped store `@theme {` block (test l.192–204). Line 95 even says "Obsidian ბლოკს FN4 არ კითხულობს".
- This line needs rewriting to describe the scoped, exact-value check.

**Low: doc line 78 lists only one new constant**
- It names only `TOKEN_FONT_FAMILIES`. The test also adds `INSTRUMENT_SANS_STACK` and `STORE_THEME_FONT_TOKENS` (test l.104–110), and line 95 already refers to `STORE_THEME_FONT_TOKENS`.

**Low: doc line 90 is half-stale on quote style**
- It says FN6 forbids `'Inter'` and `'Playfair Display'` in single quotes only. FN6 now also catches double quotes (test l.230). Line 96 is correct, so the two lines now disagree.

**Low: doc line 95 slightly overstates the "only one `@theme` block" check**
- The test only looks for a second copy of the exact string `\n@theme {` (test l.195).
- `@theme inline {`, `@theme{` or `@theme static {` would not count as a second block, and could still override tokens.
- In practice this is part of SR-472-L1, which is already ruled. The fix is wording only: "exactly one `\n@theme {` occurrence".

**Low: FN6 does not strip comments, unlike FN4**
- Test l.228–229 searches raw CSS, and `[^}]*` can match text inside a comment.
- So `body { /* font-family: var(--font-sans); */ font-family: Georgia; }` stays green. So does a later second `font-family` inside the same body rule.
- Impact is limited, since this is again an override outside `@theme` (SR-472-L1) and Tailwind's preflight still sets `html` to the token. Still, applying the same `.replace(/\/\*[\s\S]*?\*\//g, '')` as FN4 would make the two tests consistent and close the commented-out case for free.

**Info: test parsing checks that came out fine**
- `\n}` as the end of the block is safe for the current file: `@theme` runs from l.30 to l.176 and nothing inside it closes at column 0. A nested block added later could only cut the block short, which turns the test red, not falsely green.
- The token regex has no false matches: `var(--font-sans)` has no `:` after it, and `--tw-font-*` doesn't contain `--font-`.
- If a token is declared twice, the last one wins in both CSS and the map, so they agree.
- An empty value fails `toEqual`, as it should.
- `if (token && value)` handles the `string | undefined` from destructuring without any type assertions.

**Info: the family-collection loop at test l.205–214 is now redundant**
- Because `toEqual` pins exact strings, the family set is fully determined by the constants. The only check that still adds anything is the `fonts.css` face lookup at l.215–218. Harmless as it is.

**Info: doc TODO lines 114–116 repeat earlier headings**
- They add second **2c-2**, **2c-3** and **2c-4** bullets instead of extending the ones at l.110–112. Merging them would read better.

**Info: the mutant table in doc line 97 is accurate**
- It matches `/home/runner/czaba-project/tmp/studio-real-loop/b-round-471/mutants-summary.txt` row for row: control 6/6; FN4 red on georgia-serif, no-mono, commented-mono and theme-unterminated; FN4 and FN6 red on sans-inter and head-css; FN6 red on body-dq-inter; obsidian-sans-georgia green in this file.
- I did not open the sibling log behind the ST4/TH2 claim.

**Already ruled (seen, not raised again):** SR-472-L1 (font override outside `@theme`, including `:root`, `@layer` and `@theme inline`), SR-472-L2 (unquoted `Inter`), and the duplicated font stack literals across tests (SIG-R472-FONT-STACK-DUP), which this file adds to through `INSTRUMENT_SANS_STACK` and `STORE_THEME_FONT_TOKENS`.

### Good Practices Found
- FN4 removes comments before parsing, which is why the commented-mono mutant goes red.
- FN4 fails explicitly if `@theme` is missing, appears twice, or is never closed.
- Comparing whole values exactly (`toEqual` on the token map) catches both a missing token and an extra one.
- The FN6 regexes are looser and no longer depend on whitespace or quote style.
- The doc's mutant evidence points to a file that exists.

### Architecture note
None for the code: this is a test-only change that keeps its existing ownership, with no new state, lifecycle or coupling. The one recurring cost is the font-stack strings copied across FN4, ST4 and TH2. Each family change (2c-2 to 2c-4) will touch all three test files. That is already logged as SIG-R472-FONT-STACK-DUP, so keep it for this round. If the planner wants to act, one bounded task would be a shared test fixture holding the store and obsidian font stacks, taken up during the 2c-4 FN/TL rewrite.

### Score: 8/10
The test logic is good. The deduction is mostly for the stale doc line 79, plus the smaller wording mismatches at l.78, l.90 and l.95.

(Note by A: the l.95 finding was addressed in-grant after this review; doc l.95 now reads "`\n@theme {` … ზუსტად ერთხელ".)
