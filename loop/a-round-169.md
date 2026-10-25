# A round 169: V-3c-4c-1, Library panel and Library preview button surfaces

**Status:** A-side scope done. It is now waiting for C's browser verification. Nothing was committed or pushed, and the build was not run.

## Start checks (task §0 "A's first step")
- HEAD was `e50498f`, and the tree was clean (987 files).
- `b-round-168-r169-tree-sha256.txt` (983 files) passed with `sha256sum -c --quiet`.
- All 4 granted start hashes matched.

## Pre-flight gate (written after the fact)
I did not post this gate in chat before coding. I posted a short version after the baseline run and before the first edit. Here it is in full:
- **Assumptions:** only the class strings change, at P1–P4 and B1–B3, exactly per R1, R3, R7 and R9–R11. LBS1 and LPS1 go in a new describe block. D1 is limited to l.4 and the struck-through l.136 TODO. D2 is a new doc.
- **Smallest version:** 8 class-string edits, about 135 test lines, and the docs. No new abstraction in the components.
- **Files:** the 4 grants plus doc 138. Each one is required by §1/§2.
- **Success:** the 8 vitest files go from 163 to 165 passing, typecheck and lint exit 0, Biome is clean on the 3 files, and m206–m212 are killed.

## Changed files
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | **P1:** toggle base `rounded-md` + SURF + MOTION. **P2:** on = `'border-accent text-accent'`. **P3:** off = `'text-brand'`. **P4:** Add takes the R11 look (`rounded-md`, `bg-foreground/5`, enabled hover/active fills, MOTION; no `border-transparent`; `font-medium` kept). The ternary now fits on one line, so the file is 2 lines shorter; Biome accepts it. |
| `app/components/arrangement/ArrangementLibrary.tsx` | **B1–B3:** `rounded-sm` → `rounded-md` at l.99, 438, 457, 473 and 482. Nothing else changed. |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | Appended after l.471: module-level helpers and a new describe `library button surfaces (V-3c-4c-1)` with **LPS1** and **LBS1**. 0 lines removed. |
| `docs/.../137-studio-v3c4b-lane-group-button-surfaces.md` | **D1:** l.4 status → `Completed (C round 168 PASS; published e50498f)`, and the l.136 TODO is struck through. Exactly 2 lines changed. |
| **new** `docs/.../138-studio-v3c4c1-library-button-surfaces.md` | **D2:** follows TEMPLATE, in Georgian. Status `In Progress (awaiting C round 169)`. |

All 4 grants were used; none went unused.

### Notes for AN-REVIEW (deliberate readings, so C does not have to guess)
1. **P1 token order.** SURF is split around MOTION: `border border-transparent bg-foreground/5 px-2 py-1.5 text-sm font-medium <MOTION> enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 focus-visible…`. This mirrors the transport `toolButtonClass` and the round-168 Lane base. Every SURF token is present, and order has no effect on the CSS.
2. **Test-file scope.** §2 says "a new describe at the end … Nothing else." I added module-level helpers after the existing helpers, outside the describe:
   - the constants `LIBRARY_SURFACE_MOTION` and `LIBRARY_SURFACE_FILL`;
   - the functions `libraryClassTokens`, `expectLibraryTokens` and `expectRadiusOnlyButton`.

   The new describe also repeats the file's `beforeEach`/`afterEach` stubs. The helpers serve only LBS1 and LPS1, and no existing line changed. **B may ask for them to be inlined into the describe.**
3. **Locks check tokens, not whole strings.** LPS1 and LBS1 split `className` on whitespace and check which tokens are present or absent, as §2 specifies. They do not compare the exact string, so an extra token such as `enabled:hover:border-brand`, or a MOTION token losing its `!`, would not turn them red. No `!`-only mutant was added.

## Tests and commands (actually run)
| Command | Result |
|---|---|
| Baseline: 8 files from `b-round-168-r169-vitest-base.txt` → `a-round-169/vitest-baseline.json` | **163/163** pass |
| After the edits: same 8 files → `a-round-169/vitest-after.json` | **165/165** pass (LPS1 and LBS1 added; LI1–LI3, LRS1–LRS5 and TH5 green) |
| `npm run typecheck` | exit 0 (`a-round-169/typecheck.log`) |
| `npm run lint` | exit 0 (`a-round-169/lint.log`) |
| `npx biome check` (read-only) on the 3 code and test files | clean, 0 errors |
| `expect(` count in `library-row-strings-ui` | 95 → **105** (`a-round-169/expect-counts.json`) |

### Mutations (`a-round-169/mutations/m2xx.json`; runner `a-round-169/run-mutant.sh` runs `library-row-strings-ui` only)
| Mutant | Change | Result |
|---|---|---|
| m206 | `border-outline` put back on toggle off | killed (LPS1) |
| m207 | `hover:bg-accent/10` put back on toggle on | killed (LPS1) |
| m208 | Add `bg-foreground/5` → `bg-brand/10` | killed (LPS1) |
| m209 | toggle base `rounded-md` → `rounded-sm` | killed (LPS1) |
| m210 | option row `rounded-md` → `rounded-sm` | killed (LBS1) |
| m211 | search input `rounded-md` → `rounded-sm` | killed (LBS1) |
| m212 | collapse `rounded-md` → `rounded-sm` | killed (LBS1) |

**Restore caveat:** every restore was done with Edit. The restores of m206, m208, m210 and m212 were each sha-checked against `a-round-169/post-edit-sha256.txt` on their own. For m207, m209 and m211, I applied the next mutant before running the standalone sha check. Their restores were verified jointly, after the following mutant's restore; for m209, the Preview file was also checked on its own while m210 was applied. The final sha check passed, and `post-edit-sha256.txt` still matches at the end.

### Code-reviewer (real subagent, `code-reviewer`)
- **Score 9/10.** No Critical, High or Medium findings. It confirmed each ruling token by token, the twMerge behaviour in the Stop state, the append-only test file and the 2-line change to doc 137.
- **Low:** the locks check tokens rather than exact strings (as noted above). Doc 138 now says so.
- **Nit:** the duplicated `beforeEach`/`afterEach`.
- **Nit:** `expectLibraryTokens` could be named `expectLibraryClassTokens`. Not changed.
- **Architecture note, verbatim for B:** "Signal 3 (the same costly change repeated across rounds): the toggle at `ArrangementLibraryPreview.tsx:307` and Add at `:332` each add another copy of the SURF/FILL/MOTION tokens. Earlier copies came from rounds 158–168, and round 170 will add more. Keep for this round because fallback (c) applies and the copies are locked by tests. Behaviour, timing and the public hook shape are unaffected. Proposal for planner B, once the checkpoint is answered: one bounded task that adds a shared surface-class constant for the Arrangement buttons, migrates the existing copies, and keeps every existing LPS/LBS/TH lock green. Its cost grows with each stage. This is a hand-off note, not a fix for this round."

## End state
- The frozen 983 files are OK at the end.
- The protected diff vs `e50498f` is empty. That covers the routes, contexts, styles, root, icons, ui, `strings.ts`, `studio-lab.tsx` and `package.json`, and the frozen list covers every other file.
- `git status --short` shows 4 ` M` (the grants) and 1 `??` (doc 138). Nothing else.
- `a-round-169/end-sha256.txt` lists the 5 paths.
- `a-round-169/diff-vs-start.patch` holds the 4 grants compared with `b-round-168/r169-granted-start/`, plus doc 138 as a new file.

## B acceptance: what A actually passed
- **§3 A commands:** passed. That is the baseline 163/163, the post-edit run of 165/165, typecheck, lint, the Biome check on 3 files, the `expect(` counts, 7/7 mutants killed, and the code-reviewer.
- **T169-TARGETED, count side only:** A's numbers are 165/165, and LBS1, LPS1, LI1–LI3 and TH5 are green. C must re-run it.
- **SOURCE-SCOPE, A side only:** the end state above. C must re-check it.
- **Not claimed:** AN-REVIEW, SURF-V3C4C1, BOX-V3C4C1, CONTRAST-V3C4C1, RV1-V3C4C1, FUNC-SMOKE-V3C4C1, G169-3 and PX-NET/REG-HYD. These are C rows; A ran no browser.
- **Not run by A (speed rules):** the full suite, `npm run verify`, the build and e2e.

## Known gaps
- No browser evidence from A. Every visual, contrast, box and audio claim is still B-probe data until C measures it.
- The locks check tokens rather than exact strings (see above).
- Three mutant restores were sha-verified jointly rather than on their own (see above).
- User-visible decisions Saba can still veto:
  - R11: Add loses its brand tint.
  - R10: Stop now gives hover and press feedback.
  - R7: the option rows get 8 px corners.

## Exact next C checks
1. **T169-TARGETED:** re-run `a-round-169/vitest-files.txt` and expect 165/165.
2. **SOURCE-SCOPE:** HEAD `e50498f`, frozen 983 OK, `a-round-169/end-sha256.txt` matches, the git status shape above, and an empty protected diff.
3. **AN-REVIEW:** read `a-round-169/diff-vs-start.patch`, with notes 1–3 above in mind.
4. **SURF-V3C4C1:** at both viewports, states P0–P3. Cover the toggle off and on, Add, the borderless buttons and rows, the search field, a reduced-motion context, and the 4× crops.
5. **BOX-V3C4C1:** compare against `b-round-168/out/v3c4c1-probe.json` `before.box`. Expect 0.00 px.
6. **CONTRAST-V3C4C1:** the toggle and Add must be ≥ 4.5 at rest and on hover (B measured 7.05 and 6.58).
7. **RV1-V3C4C1:** one run of `d6.cjs` per viewport, compared with `c-round-168/out/d6/`.
8. **FUNC-SMOKE-V3C4C1:** check real preview audio at the destination tap, Add plus Undo, option row click and double-click, search and clear, and collapse/expand focus hand-off.
9. **G169-3** and **PX-NET/REG-HYD**.
