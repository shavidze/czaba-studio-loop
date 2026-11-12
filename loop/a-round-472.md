# A round 472 — STORE-2c-1 fix-up (C-R471-01): FN4 scoped to the store `@theme`

**STOP — needs B ruling on A-R472-REVIEW-M1** (Medium, origin: grant scope — doc 306 l.79 is outside the round-472 doc grant). Full reviewer text: `a-round-472/code-review.md`.

- **For B, re-dispatch note.** If this is re-dispatched as round 473, L28's implicit grant covers only l.4. Lines l.48, l.94 and l.106 also say "round 472", so they need an explicit grant too, the same gap D-29z1666 had to patch.
- **Finding.** `code-reviewer` rates it **Medium**. Doc 306 l.79 (under `## შეცვლილი ფაილები`) still describes the round-471 FN4: "FN4 ახლა მთელ ფაილში ყველა `--font-*` declaration-ის family-ებს (obsidian ბლოკის ჩათვლით) ზუსტ სიას უტოლებს …".
  - After sketch-472 that is false: FN4 reads only the comment-stripped store `@theme {` block.
  - It also contradicts the granted lines l.88 and l.95 ("Obsidian ბლოკს FN4 არ კითხულობს").
  - This is an L26 doc-accuracy issue.
- **Why it is a STOP.** The grant row allows l.4, l.48, l.49, l.87–88, l.94–97, l.106 and TODO only, and says "All other text stays". The fix is outside the grant (L11: a reviewer Medium whose fix is outside the grants). I did not edit l.79.
- **Proposed one-line replacement (for B to rule on):**
  `  - FN4 ახლა მხოლოდ Store-ის `@theme {` ბლოკის `--font-sans`/`--font-serif`/`--font-mono`-ს ზუსტ მნიშვნელობებს (R-471-1) ამოწმებს, ხოლო მათ family-ებს ზუსტ სიას უტოლებს და ამოწმებს, რომ თითოეული self-hosted სიაშია;`
- **Related Lows, also outside the grant and not edited:**
  - **l.78** names only `TOKEN_FONT_FAMILIES`. sketch-472 also adds `INSTRUMENT_SANS_STACK` and `STORE_THEME_FONT_TOKENS`.
  - **l.90** says FN6 forbids only single-quoted `'Inter'`/`'Playfair Display'`. FN6 now forbids either quote style; l.96 says so.
  - B may rule all three lines in one grant.
- **Tree state.** It is left at the last consistent state:
  - sketch-472 applied byte for byte;
  - doc 306 rewritten inside the grant;
  - nothing else changed.

## Scope done (A steps 1–6)
| Step | Result |
|---|---|
| 1 Start state (L11) | All checks matched: HEAD `5cd9645`, the 3 status paths, diff sha `60a7043de64c22c8`, `app.css` `d3af7582d8199712`, protected rc 0, sketch-472 `--check` rc 0, sketch sha `b9b91596…` |
| 2 Apply | `git apply b-round-471/sketch-472.patch.txt` rc 0. No tuning. Primitives read first: `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md` |
| 3 Doc 306 | Granted lines done; l.79 STOP (details below). Snapshot of the pre-edit TREE doc: `a-round-472/doc306.tree.md`; diff: `a-round-472/doc306.diff` |
| 4 Checks | typecheck rc 0, lint rc 0, scoped Biome rc 0 with no fixes, 4 covering files 126 passed, mutants equal to B's (logs below) |
| 5 Reviewer | `code-reviewer` ran. Findings below; one new Medium → STOP above |
| 6 Report | This file |

## Changed files
- **Relative to HEAD `5cd9645`** (`a-round-472/diff-stat-head.txt`):
  - `app/lib/__tests__/self-hosted-fonts.test.ts`: 41 lines;
  - `app/styles/app.css`: 7 lines, round 471's, unchanged this round;
  - doc 306, untracked.
- **Relative to TREE** (`a-round-472/diff-stat-tree.txt`: test file 34 lines, +27/−7):
  - `self-hosted-fonts.test.ts` = TREE + sketch-472 exactly (`git apply -R --check` rc 0);
  - doc 306 (`doc306.diff`).
- **Unchanged:**
  - `app.css` sha is still `d3af7582d8199712`;
  - `git status` shows exactly 3 paths;
  - no component or protected file was touched.

### Doc 306 edits (granted lines only; line numbers stable)
- **l.4:** exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 472 PASS)`.
  - L28 form: this is the post-PASS value and is a claim pending C.
- **l.48:** the hedge and "C5 ამოწმებს" are removed. It now states that C round 472 C5 confirmed Latin 700 renders from the 600 face. This is the L28 post-PASS form, so it is true only if C5 passes.
- **l.49:** keeps the Georgian fact and adds that the store UI has no Georgian text (D-29z1663, K15).
- **l.87–88:** M1 is solved. The problem text is now in the past tense, and the solution cites D-29z1662 (store `@theme` only, exact R-471-1 values; obsidian is covered by ST4/TH2).
- **l.94:** the round-472 unit run.
- **l.95–96:** FN4 and FN6 as written by sketch-472.
  - l.95 wording was tightened after review to "`\n@theme {` occurs exactly once", which is what the test actually checks.
- **l.97:** B's sketch-472 mutants, attributed to B.
- **l.106:** C round 472.
- **TODO:** three bullets were appended after l.113 (l.114–116):
  - `.artist-title` → 2c-2;
  - `<kbd>`/↵ and the mono width → 2c-3;
  - SR-472-L1/L2 and the Cyrillic/Greek coverage loss → 2c-4.

  The bullets were appended rather than merged into l.110–112, because those lines are "other text".
- **Self-check:**
  - `pending` 0, `ელოდება` 0, `C5 ამოწმებს` 0;
  - "round 471" appears only on l.87, as history;
  - the seven TEMPLATE `## ` headings are in order;
  - it cites FN4, FN6, R-471-1/2/3 and D-29z1662.

## Logs (`a-round-472/`)
- `typecheck.log`: rc 0.
- `lint.log`: rc 0. 192 warnings and 1 info, all pre-existing repo-wide.
- `biome-scoped.log`: rc 0, "No fixes applied" on the test file.
- `vitest.log`: 4 files, **126 passed**.
- `mutants-summary.txt` + `mutant-*.log`: equal to `b-round-471/mutants-summary.txt` once the ms timings are ignored.
  - control: 6 passed;
  - FN4 red on `georgia-serif`, `no-mono`, `commented-mono`, `theme-unterminated`;
  - FN4 and FN6 red on `sans-inter`, `head-css`;
  - FN6 red on `body-dq-inter`;
  - `obsidian-sans-georgia` is green in this file, by design.
  - The scratch copy was a full `git ls-files` copy plus the tree's 2 modified files plus a `node_modules` symlink. It was unlinked and deleted inside `a-round-472/` (L60).
- `claims-472-a.txt`: differs from B's planning output only on the expected rows, and the last line is `L58 OK`. `MISSING` 0.
  - K1: same paths, new diff sha;
  - K4: `--check` rc 1, because the sketch is applied;
  - K9: doc sha `242b45e3f214c8f7`, l.4 says round 472, M1-open-lines 0.
  - K3 and K14 are unchanged.
- **No build** was run. It is not required by A's speed rules or by step 4; the gate builds.

## code-reviewer findings (score 8/10)
- **Medium, A-R472-REVIEW-M1:** doc l.79 is stale. STOP above.
- **Low, A-R472-REVIEW-L1:** doc l.78 does not mention the two new constants. Outside the grant; proposed for the same ruling.
- **Low, A-R472-REVIEW-L2:** doc l.90 still describes the single-quote-only FN6. Outside the grant; proposed for the same ruling.
- **Low, A-R472-REVIEW-L3:** l.95 overstated the "one `@theme` block" check. **Fixed in-grant** (wording only).
- **Low, A-R472-REVIEW-L4:** FN6 does not strip comments. For example, `body { /* font-family: var(--font-sans); */ font-family: Georgia; }` stays green.
  - It is a variant of SR-472-L1 (an override outside `@theme`), which is ruled → 2c-4.
  - It was not fixed, because the test file is byte-locked to sketch-472.
- **Info:**
  - the `\n}` block end and the token regex are safe, and the `if (token && value)` narrowing needs no assertion;
  - the family loop is now redundant given the exact `toEqual`, but harmless;
  - the TODO bullets duplicate the 2c headings;
  - doc l.97 matches B's summary row for row.
- **Already ruled, seen and not raised:** SR-472-L1/L2, SIG-R472-FONT-STACK-DUP.
- **Architecture note (proposal for B/root, not an edit):** none for the code. The recurring cost is the font-stack literals copied across FN4, ST4 and TH2, so every family change in 2c-2…2c-4 touches three test files (already SIG-R472-FONT-STACK-DUP). If acted on: one bounded task during the 2c-4 FN/TL rewrite, adding a shared test fixture with the store and obsidian stacks.

## Known gaps
- **The STOP above.** Doc l.79 (and l.78/l.90) need a B grant.
- **No browser work by A.** C1–C9 and C13 are C's rows. `app.css` is byte-unchanged since B's measured sketch (K3).

## Next C checks
- **If B rules l.79/l.78/l.90 first:** re-dispatch with that doc grant, then the full C route of `current-task.md` §2 (C1–C14).
- **Otherwise (L22, a STOP with a diff):** C runs SOURCE-SCOPE (C11), CLAIMS (C14), the auth smoke (C13), and the STOP's named check: `sed -n 79p` doc 306 vs `git diff 5cd9645 -- app/lib/__tests__/self-hosted-fonts.test.ts`.
- **Either way:**
  - C10 mutants with `B=<c folder>` must give FN4 red on `georgia-serif`, `no-mono`, `commented-mono` and `head-css`;
  - C12 doc strings: l.4 byte for byte, 0 `pending`, 0 `ელოდება`, 0 `C5 ამოწმებს`.

## Acceptance (A's part only)
- Passed by A:
  - step 1 start state;
  - step 2 apply byte for byte;
  - step 4 checks and mutants equal to B's;
  - C11-shaped scope (3 paths, `app.css` sha unchanged, test = TREE + sketch-472).
- **Not passed:** step 3 doc correctness is incomplete because of the STOP on l.79.
- Every browser row is C's; none is claimed here. STORE-2c-1 is not marked done.
