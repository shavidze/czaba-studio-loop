# Sketch review: sketch-472 (delta to TREE, test-only)

Reviewed patch: `b-round-471/sketch-472.patch.txt`, sha256 `b9b91596ad4c7a0776c60adf25226b8c41b8f2a7b8db58765e7f625cdef1e93f`. This is the dispatched sha; no edit after review.

**Reviewer:** `tech-lead` (code-reviewer is not on B's consult list; L58 allows tech-lead). Read-only. Agent id aa064f8f4345ce518, 2026-11-12.

**Verdict: APPROVE.** No Critical, High or Medium findings.

## Findings and B's ruling on each
| Id | Severity | Finding | B ruling |
|---|---|---|---|
| SR-472-L1 | Low | A wrong value declared outside the store `@theme` block (a later `:root { --font-serif }` or `@theme inline`), or a second later `body { font-family }` rule, is not seen by FN4/FN6 | Accepted as residual. Scheduled into STORE-2c-4, which rewrites the FN/TL rows when `--font-serif` and the old faces go (grant then: "declared nowhere else, except the obsidian block's `--font-sans`/`--font-mono`"). Not in `deferred_low_polish`, because 2c-4 owns this test |
| SR-472-L2 | Low | FN6 rejects only quoted `Inter`/`Playfair Display`; an unquoted `Inter` passes | Accepted residual; FN4's exact token match covers the token values. Same 2c-4 rewrite |
| SR-472-L3 | Low (info) | Renaming to `@theme inline` or a nested at-rule closed at column 0 fails loudly | Acceptable, fails loud |
| Arch | note | Store and Studio blocks repeat the font stacks; FN4, ST4, TH2 pin the literals separately. The Studio block could use `var(--font-sans)` | Signal SIG-R472-FONT-STACK-DUP in backlog, not a task (Studio block is outside STORE-2c grants) |

## Mutants (with the reviewed sha; `mutants.sh`, logs `mutant-<id>.log`, summary `mutants-summary.txt`)
| Mutant | Expected | Result |
|---|---|---|
| control | green | 6 passed |
| georgia-serif (`--font-serif: Georgia, serif`) | FN4 red | FN4 red |
| no-mono (delete `@theme` `--font-mono`) | FN4 red | FN4 red |
| sans-inter (`--font-sans: 'Inter', …`) | FN4 + FN6 red | both red |
| body-dq-inter (body `"Inter"`) | FN6 red | FN6 red |
| head-css (HEAD `5cd9645` app.css) | FN4 + FN6 red | both red |
| commented-mono (`--font-mono` commented out) | FN4 red | FN4 red |
| theme-unterminated (no `\n}` after `@theme`) | FN4 red | FN4 red |
| obsidian-sans-georgia | green here by design | 6 passed; ST4 and TH2 red in the sibling files (`mutant-obsidian-sans-georgia-siblings.log`) |

Covering files on the sketch: 4 files, 126 passed (`sketch-vitest.log`); `tsc --noEmit` rc 0 (`sketch-tsc.log`); Biome on the file: no fixes.
