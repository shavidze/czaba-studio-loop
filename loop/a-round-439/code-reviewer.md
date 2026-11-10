# code-reviewer report, round 439 (Agent `code-reviewer`, agentId a1f30096018c3d364)

Copied verbatim from the Agent result. The reviewer was read-only and had no shell.

## Code Review: Studio source-scan helper (SYS-R435), test-only diff

**Scope and limits.** I only reviewed the diff. I could not run `git show HEAD`, the tests, or typecheck from here because I have read-only file tools and no shell. So the comparison with HEAD is based on the old scanner docs (277–282) and the claims in doc 285. Doc 285 points to a HEAD assertion map at `tmp/studio-real-loop/b-round-438/head-assertion-map.md`, but that file is not in the tree, so I could not check it myself.

I found no Critical or High issues. I found no lost HEAD guarantee beyond the three that doc 285 drops on purpose: `<Modal` inside strings, the PG2 self-closing check, and reading test/spec files.

### Critical Issues
- None.

### Suggestions
1. **Medium: radio and search fields only check `<input>` tags, unlike number fields.** See `studio-radio.test.ts:13-14` and `studio-search-field.test.ts:11-15`.
   - After C-R438-01, NF2 picks up `type="number"` on any tag and requires that list to be empty for anything other than `<input>`. RD2 and SF2 still only look at `<input>`.
   - So a new `<RadioOption type="radio" />` or `<SearchField type="search" />` wrapper passes RD2/SF2, and IN1's raw `<input` count does not catch it either.
   - This is not a regression: doc 279 §6 confirms HEAD's RD2 also only looked at `<input>`. But it is the same gap C-R438-01 just closed for number fields.
   - Fix: use the NF2 pattern. Filter `scanAllJsxOpeningTags(...)` on `type`, and expect the list of non-`input` tags to be `[]`.
2. **Low: the raw-text count guards can hide two mistakes that cancel out.** See `studio-number-field.test.ts:43-51`, `studio-progress.test.ts:58-67` and `studio-radio.test.ts:70-79`.
   - Each guard only checks that the raw-text count equals the AST tag count per file. One markup string plus one real tag the regex misses (`type={ "number" }`, `type = "number"`, `< input`) still gives equal counts, so the test stays green.
   - Biome formatting makes most of these spellings unlikely. A stricter version would compare the line positions of the regex matches with the tag lines, not just the counts.
3. **Low: IN1's `Omit` check is not tied to the props that are actually spread.** See `studio-radio.test.ts:66-68`.
   - It is a text regex over the whole file, so it also matches inside a comment or on an unrelated type.
   - It requires `'type' |`, so a valid `Omit<…, 'type'>` with only that one key fails the test for no reason.
   - Doc 285 tracks the MixFader spread order, but not this check.
4. **Low: NF2 matches `inputClass` by name, not by which variable it refers to.** See `studio-number-field.test.ts:71-83`.
   - The tag at `ArrangementDetailPanel.tsx:408` gets `inputClass` from a prop (`:283`). That prop is only checked through `inputClass=` hand-offs in the same file.
   - This is safe today because the child component is not exported. If it ever is, a call site in another file could pass a class without the spin-button tokens and NF2 would not notice.
5. **Low: HS1 has no check that it actually scans anything.** See `held-enter-source-scan.test.ts:16-26`.
   - The shared walker now skips every `*.spec.*` and `*.test.*` file in `perf/` (5 `*.perf.spec.ts` and 3 `perf/lib/*.test.ts`). Doc 277 says HEAD's HS1 also skipped test files, and none of those files contain an Enter or repeat pattern today.
   - Still, HS1 never asserts that each scan root returned some files. Adding something like `expect(files.length).toBeGreaterThan(0)` per root would make that visible.
6. **Low: doc status runs ahead of the work.** `docs/implementation/2026/quarter-IV/285-sys-r435-source-scan-helper.md:4` says "Completed (C round 439 PASS)", but the change is uncommitted and still under review. The HEAD assertion map it cites (`:29`, `:83`) is also missing from the tree.
7. **Low: `studio-search-field.test.ts:1` is missing `// @vitest-environment node`, which its sibling scan tests have.** The test does nothing in the DOM, so this only makes it slower and less consistent.

These are not findings, checked against current sources:
- The raw guards are green today: `ArrangementDetailPanel.tsx:618` (`target.type === 'number'`) does not match `NUMBER_TYPE_TEXT`, and `ArrangementExportDialog.tsx:59` contains no `<input`.
- The pins in NF2 (3 tags at `:408`, `:1063`, `:1079`) and RD2 (6 radios) match the sources.
- If a pinned file moves into a subfolder, the `?? ''` fallbacks make the tests fail rather than pass, which is the right direction.
- `tsconfig.json` has `strict: true` and includes `**/*.ts`, so the tests are type-checked. `tags[1]` and `legacy[0]` are allowed because `noUncheckedIndexedAccess` is off.

### Good Practices Found
- Parsing with the TypeScript compiler API (`helpers/source-scan.ts:58-80`) removes a whole class of regex blind spots: spread attributes are AST nodes, attribute names are exact, and nested JSX is a separate node. A file that fails to parse throws with `path:line` instead of being skipped (SS2).
- `jsxOpeningTags` is now just a filter over `allJsxOpeningTags` (`:140-142`), so there is one traversal for both. SS9 pins the `name` field, including `ui.Field`.
- If the same attribute appears twice, the last one wins in the Map (`:109`), which matches how React behaves. Spread is flagged no matter where it appears.
- The helper finds the store root from `__dirname` instead of `process.cwd()`, the file walk is recursive and sorted, and it returns posix paths (SS6 builds a real temp tree and cleans it up).
- No `any`, no type assertions, no suppression directives, and semicolons are consistent.

### Architecture note
- signal: none from the four listed. The helper (`app/lib/arrangement/__tests__/helpers/source-scan.ts`) brings six scanners into one test-only owner and touches no runtime code, audio timing, refs or hooks. Keep it. The four suites that still have their own walkers (SIG-R438-OTHER-SCANNERS) are already logged in doc 285 for the planner. I have no extra proposal.

### Alternative Approach
- Current: TypeScript AST tag scan, plus per-file raw-text count guards that catch markup in strings and comments.
- Alternative: a Biome/ESLint JSX lint rule (e.g. "`<input type=number>` requires `STUDIO_NUMBER_FIELD_CLASS`"). It would run at edit time and know which variable a name refers to.
- Verdict: keep the current approach for this round. It is test-only, deterministic and has mutant evidence behind it. A lint rule fits better as part of TL-R438-04 / SIG-R438-OTHER-SCANNERS.

### Score: 8/10
