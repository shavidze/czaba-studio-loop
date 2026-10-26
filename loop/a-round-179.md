# A — Round 179 report: C-R178-BADGE-SELECTOR fix-up (test-only)

**Scope completed:** F1, F2 and F3, all inside the 3 grant files. No product source changed and no data-testid was added. Nothing was committed or pushed.

## Start-state checks (all OK)
- HEAD is `cc984b6`.
- `sha256sum -c --quiet b-round-178-r179-tree-sha256.txt`: OK (1000 entries).
- The 3 grant start hashes: OK.
- Before editing, I grepped both files for colour-class selectors. There were exactly 2 hits, both at the granted sites (purchased l.230, LRS l.330).

## Changed files
| File | Change |
|---|---|
| `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | Only `badgeText()` (l.229–238). It takes `headerOf(view).querySelectorAll('span')` and keeps the spans whose trimmed text is `PURCHASED_BADGE` or `DEMO_BADGE`. If more than one matches, it throws `Error('header shows more than one collection badge')`. Otherwise it returns the trimmed text, or `null`. No class token is used. |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | Only LRS5 (l.329–335). A null header throws `Error('workspace header missing')`. Then `expect(within(header).getByText(DEMO_BADGE, { selector: 'span' }).textContent?.trim()).toBe(DEMO_BADGE)`, wrapped across lines in Biome style. |
| `docs/implementation/2026/quarter-IV/147-…-label-status-colour.md` | Status is now `In Progress (awaiting C round 179)`. Added: (a) a Problem → Solution entry, (b) a "Round 179" list under შეცვლილი ფაილები, (c) the round-179 counts and m288–m290 under ტესტირება, (d) one sentence on the Biome reflow ruling. |

Evidence:
- `a-round-179/end-sha256.txt`: hashes of the 3 grant paths.
- `a-round-179/diff-vs-start.patch`: 77 lines, diffed against `b-round-178/r179-granted-start/`.

## Tests actually run
- **Before the edits:** the 14 files in `b-round-178-r179-vitest-base.txt` gave **147/150**. Exactly LRS5, PW1 and PW6 were red (`a-round-179/out/vitest-before.json`).
- **After the edits:** the same 14 files (`a-round-179/vitest-files.txt`) gave **150/150** (`out/vitest-after.json`).
- `npx biome check` on the 2 test files: clean, no fixes applied.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It checked 481 files and reported 218 warnings and 1 info that were already there (`out/lint.log`).
- **Not run (not A's job):** the full suite, verify, build, e2e and the browser rows.

## Mutations (`a-round-179/mutations/m28x.{json,diff}`; tool: `a-round-179/tools/run-mutation.sh`)
Each mutation was a temporary sed edit of `StudioWorkspace.tsx`. After each one I restored the file and checked its line in the frozen list with `sha256sum -c`. Every restore was OK (`316f7c51…`).

| ID | Result | Matches §3.1 |
|---|---|---|
| m288 `origin` → `'demo'` | 149/150. Only PW1 red; LRS5 and PW6 green. | yes |
| m289 badge `{''}` | 146/150. LRS5, PW1, PW6 and DXL3 red. | yes |
| m290 `border-outline-strong` → `border-accent` | 148/150. DXL3 and DXL8 red. **LRS5, PW1 and PW6 green**; DXT8 green. | yes |

## Post-work scope checks
- Frozen list `sha256sum -c --quiet`: OK after all mutations.
- `git status --short`: 14 ` M` + 2 `??`, the same set as round 178.
- `git diff cc984b6` on routes, styles, `components/studio`, auth, firebase, the download-routes test and `.claude`: empty.
- The AN-REVIEW-179 regex finds **0 hits** in both files.
- `sha256sum -c c-round-178/end-tree-sha256.txt` (1003 files): only the 3 grant paths differ.

## Code review (actual `code-reviewer` subagent)
**Verdict: PASS, 9/10.** No Critical, High or Medium findings. None of its notes needed a change in this round:
- **Low:** in LRS5, the `.textContent.trim()` check after `getByText` is close to a tautology. It is the exact line the spec asked for, so I kept it.
- **Info:** F1 reads the full `textContent`, while F2 reads only the element's own text. With the current markup they behave the same.
- **Info: stale text in doc 147.** The round-178 Problem entry and the TODO at l.124 ("Badge-ის selector … B-ის გადაწყვეტილება") are now out of date. I left them because F3 says "Nothing else". **For B:** close or annotate them at the next grant, when doc 147 moves to Completed.
- **Info, input for SELECTOR-SWEEP:** `library-row-strings-ui.test.tsx` still locks colour tokens through `className` checks rather than selectors:
  - l.236 `text-foreground`
  - l.250 `text-muted`
  - l.488–490, l.546, l.599, l.604
  - l.557–586 (`border-brand`, `text-brand`, `bg-brand/10`)

**Architecture note (verbatim, for B):**
> **Signal 3 (the same region keeps being changed at high cost):** across rounds 173-179, the `__tests__/*-ui.test.tsx` suites (`library-row-strings-ui.test.tsx:236-606`, `purchased-collection-ui.test.tsx:57-215`) keep breaking on presentation-token swaps. Round 179 was a whole round spent only on selector repair. Two causes add to it: each suite mounts the workspace and its fakes separately, and many suites assert colour classes on className. This diff removes one class selector but leaves the pattern. **Keep for now:** the fix is correct and within scope, and no audio timing, refs, Undo/Redo or `useArrangement()` behaviour is involved. **Proposal for B (planner):** one bounded task at the DUX-R-5 boundary. Add a shared workspace mount/fakes test harness, alongside the proposed ROOT-RECON-GRID-HARNESS extension. Add one `findCollectionBadge(header)` helper that looks the badge up by text. Then move the className colour locks listed by SELECTOR-SWEEP into a single token-assertion helper, so a future token swap only needs changes in one place. Acceptance: every existing suite stays green with the same assertion count, and the mutation runs show the same red/green sets.

This note is only a proposal. Nothing was extracted.

## Acceptance criteria A actually passed
- **§1:** F1, F2 and F3 done as written, with the constraints held. No assertion changed, PW1's negative lines are kept, and no colour selectors remain.
- **§3:** the base run was 147/150 before (the expected reds) and 150/150 after. Typecheck, lint, scoped Biome and the code review all ran and passed.
- **§3.1:** m288–m290 match their red and green sets, and every restore sha is OK.

## Known gaps
- The browser rows belong to C. The full vitest, build and verify belong to the gate. The full suite is expected to be green after F1/F2, but **A did not run it**.
- `a-round-179/tools/StudioWorkspace.backup.tsx` is A's temporary restore copy. It sits outside `store/`.

## Exact next C checks
- T179-TARGETED: `a-round-179/vitest-files.txt` → 150/150
- SCOPE-179
- AN-REVIEW-179: the grep finds 0 hits
- MUT-179: read the m288–m290 JSONs
- HASH-CARRY
- BADGE-BROWSER at both viewports
- G179-3
- FUNC-SMOKE-179
- SELECTOR-SWEEP: the reviewer's className list above is a head start
- PX-NET / REG-HYD
