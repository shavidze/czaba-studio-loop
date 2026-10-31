# A round 291: FIX-PD-1b2 (library heading a11y, stable group keys, doc 216 l.17, ST47/ST51 titles)

**STOP — needs B ruling on two items:**
1. **§8 LRS4 timing** (detail below).
2. **A-R291-REVIEW-M1** (reviewer Medium, test gap): the `#occurrence` key suffix is not pinned by any row. Its only fixes are an LG10 row or a `console.error` spy in LG7, and both are outside the R3 grant.

**Timeline:** after the STOP was identified, A applied three wording fixes to doc 217 from the reviewer (M2, M3, L1), within the §4 grant. No code or test file changed after the STOP.

**Item 1: §8 "a covering test exceeds 50 % of its timeout" (L11/L31): `library-row-strings-ui.test.tsx` LRS4.**
- **Declared timeout:** none on the test or its describe, and `vitest.config.ts` has no `testTimeout`, so the vitest default of 5000 ms applies. 50 % is 2500 ms.
- **A's times in the §5 15-file covering run:**
  - run 1: 2609 ms (`a-round-291/covering.log`);
  - run 2: 2543 ms (`a-round-291/covering-2.log`).
- **Other times:**
  - the same file alone: 1061 ms (`a-round-291/lrs4-alone.log`);
  - B's scratch run: 2431 ms (`b-round-290/scratch-covering.log`);
  - last gate (`gates/round-289/verify.log`): 1044 ms.
- **The higher time decides:** 2609 ms.
- **Assessment (data, not a ruling):**
  - LRS4 is in an unchanged file. The extra time appears only under the parallel 15-file load, and LRS4 has no group heading in its path.
  - B's own pre-check was already at 97 % of the threshold.
  - Nothing else timed out. The next slowest test is tempo-seed-ui TU4 at 1919 / 1830 ms.
- **The tree is at a consistent, complete §3 state.** Nothing was changed for the STOP, and the test was not split, because it is outside the grants.

## Changed files (exactly the 5 §4 paths)
`git status --short --untracked-files=all`:
- `M app/components/arrangement/ArrangementLibrary.tsx`:
  - §3.1(2): each run gets `key: \`${label}#${occurrence}\``, through a `seen` Map. This is B's sketch verbatim.
  - The group `key={run.key}`.
  - §3.1(1): `aria-hidden="true"` on the heading `div`. Its `id`, classes and text are unchanged, and so is the group's `aria-labelledby`.
- `M app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx`:
  - the `threeRunSources` fixture is inserted after `nonContiguousSources`;
  - LG8 (`it.each`: c-two, b-two) and LG9 are appended;
  - 0 lines removed, so LG1–LG7 are byte-identical (R3).
- `M app/lib/arrangement/__tests__/strings.test.ts`: the ST47 and ST51 titles only. The diff is 2−/2+ lines (R4).
- `M docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md`:
  - only l.17 changes; l.4 is unchanged (R2).
  - **Interpretation:** the task's `\`` escapes inside the code span were written as plain backticks. A scripted compare of the unescaped task text against the file's l.17 gives L17-MATCH.
- `?? docs/implementation/2026/quarter-IV/217-fix-pd-library-heading-a11y.md`:
  - new doc;
  - l.4 is `**სტატუსი:** Completed (C round 291 PASS)`;
  - it has all seven TEMPLATE `## ` headings in order;
  - it cites only LG8, LG9, ST47 and ST51;
  - it records the key choice, the M2 rejection, and B-R290-LIB-SHAPE-SWITCH-FOCUS under TODO.

## Checks actually run (logs in `a-round-291/`)
- **Claims before editing:** `claims-291.sh` output equals `b-round-290/claims-291-output.txt` (empty diff).
- **`npm run typecheck`:** rc 0 (`typecheck.log`).
- **`npm run lint`:** rc 0, with 205 warnings and 1 info repo-wide (`lint.log`). A did not diff this count against HEAD. Scoped `npx biome lint` on the 3 owned code files gives 0 diagnostics, so none of the 205 come from this round's paths.
- **`npx biome check` on the 3 code files:** rc 0, "No fixes applied" (`biome.log`). No new ignore was needed.
- **`npx vitest run` on the 15 §5 files:** 15 files and 258 tests passed, in 2 runs.
  - LG8 (c-two) ✓ and LG8 (b-two) ✓, so 2 rows;
  - LG9 ✓;
  - LG1–LG7 ✓;
  - ST47 ✓ and ST51 ✓, under their new titles.
- **Mutants:** A did not run them (M1–M3 are C's UNIT-MUTANTS row; B ran them on its scratch copy).
- **Claims after editing** (`a-round-291/claims-after.diff`). Expected deltas:
  - K2: 5 lines.
  - K3: rc1. `sha256sum -c` fails only on the 4 granted existing paths (checked).
  - K6: `208:runs.push({`, one site.
  - K7: `2482 2750 0`.
  - K8: no `ყოველთვის ჩანს` hit; l.4 unchanged.
  - K11: `217 1`.
  - K12: the count stays 17. The ternary moves to l.668, and the key code added no L50 hit.
  - K16: LG1–LG9.
  - All other K lines (K1, K4, K9, K10, K13–K15, K17–K19) are identical.
- **K5 note for C/B:** §6 expects "the 3 `headingId` lines". The script greps `key=\{headingId\}|aria-labelledby=…|id=…`. Because §3.1(2) itself replaces `key={headingId}`, only 2 lines remain: `676:aria-labelledby={headingId}` and `680:id={headingId}`. `aria-hidden` is 8. This is the same result B's own sketch produces, so it is a wording slip in §6 K5, not a deviation from the code in §3.

## Code review
The real `code-reviewer` subagent ran on the 5 paths and scored the change 8/10. It found no Critical or High issues and no code bug. Its findings and what A did with each:
- **A-R291-REVIEW-M1 (Medium, test gap; open for B).**
  - **Finding:** no row pins the `#${occurrence}` suffix. A mutant whose key is the label only, or always `#0`, survives LG8 and LG9. LG7 (A, B, A) would then render duplicate React keys, which only log a `console.error`, so the LG7 group-name asserts stay green.
  - **What would fix it:** a `console.error` spy in LG7, or a new LG10 on `nonContiguousSources`.
  - **Why not done:** R3 freezes LG1–LG7 and grants only the fixture plus LG8/LG9, so A did not add it. B should rule it as a follow-up row.
- **A-R291-REVIEW-M2 (Medium, doc 217): fixed.**
  - **Finding:** the case (a) claim overstated stability. With labels A, B, A, removing the first A changes the key `A#1` to `A#0`, and removing B merges the two A runs into one new parent. No key can prevent the merge case.
  - **Done:** doc 217 now states this limit. Demo and purchased data do not produce such runs today.
- **A-R291-REVIEW-M3 (Medium, doc 217 status line vs "browser pending" text): fixed within L28.**
  - L28 binds l.4 to `Completed (C round 291 PASS)`, so l.4 was kept.
  - The testing line was reworded neutrally: "Browser: … (C round 291)", with no "pending" phrasing.
  - `c-round-291.json` stays the source of truth.
- **A-R291-REVIEW-L1 (Low, doc 217 TODO): fixed.** The TODO now says the grouped ↔ flat remount happens in both directions.
- **Info rows confirmed by the reviewer:**
  - no key collision;
  - no stale `headingId`, because `id` and `aria-labelledby` update in the same render;
  - `aria-labelledby` pointing at an `aria-hidden` element is valid under accname, so LG9 is real evidence in jsdom, and the Chromium AX check is C's B-AX;
  - mutant analysis: the index key fails both LG8 cases, M2 fails b-two only, removing `aria-hidden` fails LG9.
- **Architecture note (verbatim, for B):** "Signal 3 (one region changed again at a cost): the run grouping, keys and heading at `ArrangementLibrary.tsx:198-217` and `:668-694` changed in round 289 and again here. Keep for now: the key and heading logic belong to the same render lifecycle as the roving-focus refs (`optionRefs`), and moving them out would need wider test mocks. The planner can note it as a one-line backlog signal."
  - Relevant to A-R289-ARCH-GROUP-RUNS; nothing was extracted.

## Known gaps
- B-R290-LIB-SHAPE-SWITCH-FOCUS (Low, deferred): the grouped ↔ flat switch still remounts.
- No browser row was run by A. All of §6's browser rows (B-AX, B-KEYS-291, B-STATES-291, B-SCREEN, B-JOURNEY-291, G291-AUTH) are C's.

## Exact next C checks
All of §6:
- CLAIMS, with the K5 note above;
- SOURCE-SCOPE, TYPECHECK, UNIT and UNIT-MUTANTS (M1/M2/M3);
- B-AX, B-KEYS-291, B-STATES-291, B-SCREEN and B-JOURNEY-291 at both viewports;
- G291-AUTH, DOC-216, DOC-217 and RT-FIX-291 (B's file; A did not touch `retros/`).

Also note the LRS4 timing STOP above, for B's ruling.

## Acceptance claimed by A
Only these were run by A:
- TYPECHECK: rc 0;
- UNIT: 15 files and 258 tests, with LG1–LG9, ST47 and ST51 present by name;
- SOURCE-SCOPE: 5 paths;
- DOC-216: l.17 matches and only l.17 differs.

The round is not complete: there is a STOP pending B's ruling, and the browser rows are pending C.
