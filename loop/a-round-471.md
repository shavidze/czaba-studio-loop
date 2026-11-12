# A round 471 — STORE-2c-1 font family tokens

**STOP — needs B ruling on A-R471-REVIEW-M1** (Medium, origin: B spec — the sketch's FN4 was applied verbatim).

The sketch's FN4 scans every `--font-(sans|serif|mono)` declaration in the whole of `app.css`. The obsidian block (l.1644–1645 after the change) alone yields {IBM Plex Mono, Instrument Sans, Noto Sans Georgian}, so the **store `@theme` font tokens are unguarded** on TREE. HEAD's FN4 also scanned the whole file. It caught the measured HEAD mutant (`--font-serif: Georgia, serif`) only because Playfair appeared nowhere else in `app.css`. `--font-mono` did not exist at HEAD, so the no-mono mutant has no HEAD control.

So the measured regression is limited to the serif case: red at HEAD, green on TREE. The mono case is a new token that is unguarded from the start. A measured both in full scratch copies under `a-round-471/mut/`:

| Mutant (self-hosted-fonts.test.ts) | Result | Log |
|---|---|---|
| TREE control | 6 passed | `a-round-471/mut-tree-ctrl.log` |
| TREE, l.124 `--font-mono` deleted | 6 passed (should be red) | `mut-tree-nomono.log` |
| TREE, `--font-serif: Georgia, serif;` | 6 passed (should be red) | `mut-tree-georgia.log` |
| HEAD control | 5 passed | `mut-head-ctrl.log` |
| HEAD, `--font-serif: Georgia, serif;` | FN4 red | `mut-head-georgia.log` |
| Both TREE mutants on all 4 covering files | 126/126 passed | `mut-tree-*-4files.log` |

**Environment notes:**
- A's first mutant attempt was environment-invalid. It copied only `app.css` and the test, and all 5 runs (controls included) failed on the `~/root` import. Those logs were overwritten by the valid rerun on full `git ls-files` copies, which is the table above.
- The full scratch copies were then deleted under `a-round-471/mut/` (L60). Only the mutant CSS and test inputs and the logs remain.
- The scratch runs symlinked the store's `node_modules` (L38). After them, A loaded `http://127.0.0.1:5173/studio-lab` in Playwright: HTTP 200, 0 responses with status 504. The document title was empty at load + 3 s; A did not investigate further.

- The fix is outside A's grants: "Do not tune", and `store-theme-tokens.test.ts` is listed as unchanged. So A changed nothing in the test.
- The reviewer suggests pinning, in `store-theme-tokens.test.ts` through `loadStoreThemeBlocks()`:
  - theme `--font-sans` === obsidian `--font-sans`;
  - theme `--font-mono` === obsidian `--font-mono`;
  - theme `--font-serif` === theme `--font-sans`.

  An alternative inside the granted file is to make FN4 scan only the store `@theme` block.
- A's view, a proposal only: this is a test-strength gap, not a product defect. B rules on the severity.

The tree is at a consistent state: the sketch plus doc 306.

## Changed files (`git diff --stat`, `a-round-471/diff-stat.txt`)
- `app/lib/__tests__/self-hosted-fonts.test.ts` | 13 +++++++++++-
- `app/styles/app.css` | 7 ++++---
- `?? docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md` (new, Georgian)

## What A did
1. **Start state:** HEAD `5cd9645`, 0 status lines, protected manifest rc 0, sketch `git apply --check` rc 0, sha `358dcb8179b8e039`.
2. **Read** pre-flight, TAILWIND_FIRST, DESIGN_TOKENS, TESTING_QUALITY_GATES, GEORGIAN_DOCS, TEMPLATE, and lessons L11/L12/L26/L28/L60.
3. **`git apply` of the sketch:** rc 0, no tuning. The `+`/`-` lines are identical to the sketch; only the order of the two files differs (`a-round-471/tree.diff`). The obsidian block is byte-identical: HEAD l.1623–1650 == TREE l.1624–1651, shifted by 1 by the new `--font-mono` line.
4. **Doc 306:**
   - The seven TEMPLATE `## ` headings are in order, and l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 471 PASS)`.
   - It cites FN4 and FN6, which exist at l.183 and l.207.
   - After the review, A narrowed the "no fake bold" claim to Latin, marked it pending C5, and noted that Georgian bold is faked. A also described FN4 accurately (it scans the whole file) and added A-R471-REVIEW-M1 under პრობლემები.

## Tests actually run (logs in `a-round-471/`)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0 (192 warnings, 1 info, repo-wide, rc 0) | `lint.log` |
| Biome scoped to the owned paths | rc 0, but only the TS file was checked: CSS is outside the Biome config | `biome-scoped.log` |
| 4 covering files (self-hosted-fonts, store-theme-tokens, studio-theme-obsidian, third-party-licenses) | 4 files, 126 passed | `vitest.log` |
| Mutants | see the table above | `mut-*.log` |

**Not run by A:** production build, any browser or Playwright row, the full suite, or verify. These belong to C or the gate. B's browser numbers in doc 306 are attributed to B.

## Code review
The real `code-reviewer` subagent ran once, after the sketch and the doc were in place. `a-round-471/code-review.md` is **A's condensed summary** of its hand-back, not the verbatim output; the full text is in A's session transcript.
- The reviewer had no shell and did not see the diff. A verified its Medium with mutants.
- Score 8/10.
- No code changed after the review; only doc 306's wording changed.
- **M1:** see the STOP above.
- **Lows, for B; not fixed because they are outside the grants:**
  - `app.css:746` `.artist-title { font-family: var(--font-serif) }` is a CSS rule, not a class. Add it to the 2c-2 sweep list, or `--font-serif` cannot be deleted later.
  - `CommandPalette.tsx:189,192,195`: the bare `<kbd>` now renders in Plex Mono through preflight, and ↵ (U+21B5) falls back to another font on the same chip. This is cosmetic; C may record it in C1/C6.
  - FN6 is a brittle literal: it needs the first declaration, LF line endings and 2-space indentation, and it catches only single-quoted names. FN4's containment loop at l.192–194 is constant against constant.
  - **Info:** Plex Mono is about 9 % wider than Consolas (Windows is unmeasured), and Cyrillic and Greek lose Inter's coverage.
- **Architecture note:** none. The change is token values plus one test file; keep as is.

## For B / Saba (proposals only)
- **Doc 306 needs rewriting whichever way B rules.** It now names A-R471-REVIEW-M1 and says "B-ს გადაწყვეტილებას ელოდება" under პრობლემები და გადაწყვეტები. Those lines must be rewritten before publication, either by B's re-dispatch grant or by A in the fix round.
- **Stale typography references.** These still teach "Playfair 700 / Inter":
  - `.claude/primitives/DESIGN_TOKENS.md:57-63` and `.claude/primitives/TAILWIND_FIRST.md:101-105`;
  - `docs/design/DESIGN_SYSTEM.md:755-762`;
  - the comments at `store.tsx:535` and `PremiumProductCard.tsx:7,81`.

  The primitives are a "For Saba" item. Schedule the rest with 2c-2.

## B acceptance status
- **Truly passed by A:** steps 1–4 (start state, the verbatim apply, doc 306, typecheck, lint, 126 tests) and step 5 (review run).
- **Not passed:** the round is not clean because of the STOP on M1.
- **C rows C1–C14:** none claimed.

## Next C checks (if B rules the round proceeds as is)
- Run C10 with the extra mutants above.
- Run C11: SOURCE-SCOPE, with the doc showing the M1 note.
- Then C1–C9, C12–C14 as the task specifies.
- Per L22, a STOP naming an unruled Medium is a short FAIL until B rules.
