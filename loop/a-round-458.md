# A round 458: STORE-2b-3c-2a re-dispatch v3 (the walker resolves directory forms and keeps names)

STATUS: DONE, ready for C. No STOP.

## Changed files (only the 6 grants)
`git status --short --untracked-files=all` lists exactly these six paths:
- `app/lib/__tests__/helpers/style-scan.ts` and `app/lib/__tests__/store-live-teal.test.ts`
  - Change: `git apply b-round-457/sketch-458-delta.patch.txt`, with no hand edits.
  - Before: `b-round-456/sketch-files-sha256.txt` gave 4 OK, and the delta sha256 was OK.
  - After: `b-round-457/sketch-files-sha256.txt` gives 4 OK.
- `store-glow-shadow.test.ts` and `store-gradient-text.test.ts`: unchanged this round (tree state).
- Doc 298: no byte changes this round. `git diff db95f40` on it is 1 line (l.4).
- Doc 299 is rewritten, following the Ruling lines:
  - l.4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 458 PASS)`; l.3 is still `2026-11-11`.
  - The [K9] grep returns 0, and `pending` appears 0 times.
  - The seven TEMPLATE headings are in order.
  - მიდგომა covers the three forms (module, directory, index), both measured resolvers (Vite via `b-round-457/probe/vite-resolution.txt`, TypeScript in A round 457), the string-aware arm, its `IMPORT_CLAUSE_GRAMMAR` fallback, and the LT7 lookahead.
  - It adds an A-R457-REVIEW-M1 Problem → Solution entry covering P1, P2, P4b and P5.
  - ტესტირება cites LT9/LT10 and M1–M38, M21a and M22a.
  - TODO lists the stop-loss, TL-R458-L1..L4, A-R457-REVIEW-L4/L5 and the new Low below.
  - Every cited LT/GS/GT/TS id exists in the test files (grep check).

## Tests actually run (logs in `a-round-458/`)
- Claims-before equals `claims-458-planning-output.txt` (`cmp` OK); stderr is empty.
- `npm run typecheck`: rc 0 (`typecheck.log`).
- `npm run lint`: rc 0, 205 warnings (`lint.log`).
- `npx biome check` on the 4 test files: rc 0, "No fixes applied" (`biome-scoped.log`).
- `npx vitest run --reporter=verbose $(cat b-round-457/covering-458.txt)`: 4 files and 28 tests passed, rc 0. LT1–LT10, GS1–GS4, GT1/1b/2/3/4/4b/5/5b and TS1–TS6 each passed (`covering.log`).
- Mutants: scratch `/tmp/a458-scratch` is `db95f40` plus the tree's 4 test files, committed, with `node_modules` symlinked. `run-mutants.sh` gives `a-round-458/mutants/mutants.txt`, which is `cmp`-equal to `b-round-457/mutants/mutants.txt`: 42 lines, BASE and C1 green, M1–M38, M21a and M22a red with the same ids.
- Claims-after equals `claims-458-expected-after-A.txt`; stderr is empty. I re-ran it after the final doc edit.
- `walker-forms.py` on the tree prints `brace_comment=1 dir_form=0 dot_spec=0 brace_comment_files_with_star_or_backtick=0`; the single hit is `components/animations/index.ts` (`walker-forms-tree.txt`).
- Not run by A, because they are gate rows: the full suite, build and `npm run verify`.

## Code review
The code-reviewer ran on the applied delta and doc and returned **APPROVE** (8/10), with no Critical/High/Medium findings. Its Lows:
1. **NWF-1, a new walker form (Low, extends TL-R458-L1).** The string-aware arm's quote tracking can desync without any regex literal: a nested template with `//` or `/*`, `${'`'}`, or an unpaired backtick in JSX. Names are lost only if a later import also has a comment in its braces.
   - Combined count in non-test `app/`: 0. One file has a brace comment (`animations/index.ts`) and it contains none of the hazards; the nested-template grep returns 0.
   - Stop-loss rule 1: count 0 and no verdict flip, so it is a Low and does not STOP.
   - Greps and counts: `a-round-458/new-walker-forms.txt`, for C8b to replay.
2. **Unpinned lines (Low, for B).** No mutant pins `namespaceReExports(stringAware, …)` (`style-scan.ts:421`). The `form|` key in `followed` (`:433`, `:441`) is also unpinned: a target-only key still gives the same LT9 result. I did not change the tests: they are sha-pinned and outside the doc fix.
3. **Doc l.25 overclaimed arm pinning.** Fixed: the doc now names M21a/M22a/M35 and says the string-aware `export * as` record has no mutant of its own.
4. **Doc l.31 gave the wrong cause for `'./a/index'`.** Fixed: the cause is that `scriptFilesFor` returns an empty list for the index form.
5. **TL-R458-L4 was labelled "fail closed".** Rejecting a leading `_` misses consumers, which is the fail-open direction. Count is 0. I removed the label from the doc. **For B:** the task's own wording of TL-R458-L4 ("This fails closed") is inaccurate; the count of 0 still keeps it a Low.
6. **Info:** `'…/index/'` is classified as `index`. Count 0.

- After the three doc fixes I sent the doc back to the code-reviewer. Its answer: "OK. I found no factual errors in the three passages."
- **Advisor follow-up and further doc-only iterations (each re-reviewed):**
  - **NWF-2 count, full list.** I re-counted against the full `DEAD_RULE_TOKENS` list (21 tokens, l.282–311). Both lookbehinds treat `_` as `\w`, so a leading `_` is rejected. Count: **0** (rg rc 1), so it stays a Low. The command is in `new-walker-forms.txt`.
  - **Doc l.25 union sentence.** It was an absolute "one arm's error cannot fail open" claim, which the evidence contradicts. It is now a measured statement:
    - each arm covers a hazard that blinds the others (the LT9 regex-literal row is the example);
    - single-arm removal is pinned by M21a, M22a and M35;
    - both comment-stripping arms are blinded by `/*` in a regex literal (TL-R458-L1) and by a nested template with `/*`;
    - all arms miss an import only when its clause also holds a comment, which the raw arm cannot parse.
  - **TODO NWF-1 bullet.** `` ${'`'} `` and an unpaired backtick blind only the string-aware arm. A nested template with `/*` blinds both comment-stripping arms.
  - **Review rounds.** Four short re-reviews; each later one returned only Low wording points, which I applied. The last edit (from "braces" to "clause (e.g. braces)", on l.25 and the TODO) is the reviewer's own correction. I did not send it back for another review.
  - **For B (not applied):** the reviewer notes that TL-R458-L1's ruled wording ("a regex literal with `/*` or a backtick blinds the comment-stripping arms") is imprecise. A backtick blinds only the string-aware arm; `/*` blinds both. Doc l.91 keeps B's wording.
- **Primitives:** I skimmed the four primitives (headings and first sections) rather than reading them in full. Only the A part of lessons was read.
- **Claims-after** was re-run after the last doc edit: equal, stderr empty. `pending` 0, [K9] 0, headings in order.
- **Architecture note (for B/root; I did not act on it):** the walker region (`style-scan.ts:353-498`) has changed in rounds 456, 457 and 458. The reviewer's advice is to keep it for now and add the TL-R458-TRIPWIRE-GUARD CI grep for the counted forms. If the stop-loss triggers, it would bring the TypeScript-compiler-API walker task forward. This adds to ARCH-CHECKPOINT-STYLE-SCAN.

## Acceptance (A's own steps; C verifies the C rows)
- Steps 1–9 are done and each result matched what the task expected.
- Of the C rows, A ran the same commands for C1, C3 and C4, C5 (on its own scratch), C8b (on the tree only) and C9. They all match.
- A did not run C2's HEAD clone, C6 (assert-map), C7 (browser), C8 (sweep/probe) or C10. Those are for C.

## Known gaps
- The Lows NWF-1, the unpinned lines (item 2) and the TL-R458-L4 label go to B for `deferred_low_polish` / TL-R455-WALKER-LIMITS.
- No browser check by A: no app file changed, and C7 covers it.

## Exact next C checks
- C1–C10 as written in the task.
- C8b also replays the commands in `a-round-458/new-walker-forms.txt`:
  - NWF-1 (a) gives 1 (`app/components/animations/index.ts:1`);
  - NWF-1 (b) gives 0;
  - NWF-2 (full token list) gives 0.
- NWF-1's combined count of 0 rests on `walker-forms.py` (`brace_comment_files_with_star_or_backtick=0`, no backtick or `/*` in that file), not on grep (b), which covers only one hazard.
- `/tmp/a458-scratch` is A's scratch. C should use its own.
