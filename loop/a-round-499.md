# A round 499 — DPG-BUTTON-CLEANUP-2 stage 2b-1

## STOP — needs B ruling on A-R499-CR-STORE-TRY-UNPINNED (Medium, origin `B spec`)

**Finding (the code-reviewer subagent, real run on the applied sketch):** no test pins how the `/store` error "Try again" link is built.
- `app/lib/__tests__/store-button-cleanup-2b.test.tsx`, B2B-5 (l.130–150). For the `routes/store.tsx` block (`STAGE_2B1_SITES`, l.25–28), the test asserts only:
  - `block` contains `buildButtonClassName(`;
  - no `className="…"`, `{'…'}` or template literal in the block has the tokens `bg-brand`, `bg-elevated`, `text-black` or `rounded-lg`.
- No DOM row renders the `/store` error branch. B2B-1…B2B-4 cover EmptyState and ErrorBoundary only.
- B's mutants for this site (`b-round-498/mutants-499.sh` l.22–23):
  - N7 reverts to the HEAD literal;
  - N8 adds a `bg-elevated` literal to the `<p>`.

  No mutant changes the builder's arguments or the `to`.
- These regressions would pass every row:
  - `buildButtonClassName({ variant: 'ghost', size: 'lg', shape: 'pill' })`;
  - `{ size: 'md' }`;
  - `to="/"`;
  - `className={cn('bg-brand …')}` (tech-lead item 5 in `b-round-498/sketch-review.md` says only "the DOM rows" catch this, but `/store` has none).
- Tech-lead item 5 is Info and does not rule this site, so the Medium is unruled (L58).

**Why A cannot fix it:**
- The fix belongs in the new test file, which check 4 (`b-round-498/r499-post-sketch-sha.txt`) pins byte for byte.
- The task's STOP list includes "a granted file that would need a change beyond the sketch" (L10/L11).

**Options for B:**
- (a) Add a `/store` DOM row and re-pin check 4. The row renders the error branch, for example with `createRemixStub` and a loader returning `error`, and finds the alert link by role and name. It asserts `className === PRIMARY_LG_PILL` and `href="/store"`. Alternatively, B2B-5 requires the exact text `buildButtonClassName({ size: 'lg', shape: 'pill' })` and `to="/store"`. Either way, add a new mutant (for example `variant: 'ghost'` on the `/store` link) that turns the row red.
- (b) Rule it Low, on the strength of C's browser rows C1 and C6 for STORE-TRY, which measure the pill and the path in a real browser.

**State of the tree:** consistent; nothing changed after the review.
- `git status --short --untracked-files=all`: 5 modified (`ErrorBoundary.tsx`, `EmptyState.tsx`, `store.tsx`, DESIGN_SYSTEM.md, doc 320) and 2 new (`store-button-cleanup-2b.test.tsx`, doc 321).
- Frozen checks 1, 2 and 4 are rc 0 after the doc prose (`a-round-499/frozen-after-doc.log`).

No covering test failed or was slow. The slowest covering test is LT7 at 465 ms, under 50 % of vitest's default 5 s timeout. `vitest.config.ts` sets no `testTimeout` (`a-round-499/covering.log`). The doc 321 line numbers l.30, l.83, l.95 (build) and l.100 were confirmed with `grep -n`. B's `precheck-biome.log` also reports "Found 6 warnings."

## What A did
1. **Frozen checks at HEAD `82e118a`:** checks 1, 2 and 3 rc 0. The sketch sha `9fceab80…` equals `b-round-498/sketch-sha.txt`.
2. **Applied the sketch:**
   - `git apply --check` rc 0;
   - `git apply b-round-498/sketch-499.patch.txt` rc 0;
   - check 4 rc 0.
3. **Doc 321 prose:**
   - Wrote Georgian prose under the 7 skeleton headings. l.4 and the headings are byte-unchanged: the heading diff against TEMPLATE (without `## Prompt`) is empty, and l.4 reads `In Progress (stage 2b-1 of DPG-BUTTON-CLEANUP-2; C round 499 PASS)`.
   - It covers the 10 browser targets, D1–D4, the product-designer rulings, both Saba questions (SABA-Q-499-BUTTON-CASE, SABA-Q-499-ERROR-EMPHASIS), the reach recipes (mock off for `/store`; the L36 stubs; the malformed catalog for the root error page), B's evidence files, B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML under TODO, and 2b-2, 2b-3, 2c, 2d, 2e and NONBRAND.
4. **Backtick token check (scripted):** `git grep -qF -- <token> 82e118a -- app docs` on every backticked string in doc 321 (`a-round-499/doc321-tokens.txt`).
   - Every class token hits. The two multi-class strings were split into single tokens.
   - The remaining MISS lines are non-class only: loop paths, file paths (git grep searches content, not paths), `MOCK=on`/`MOCK=off`, `82e118a`, `/studio/1`, `{success,data}`, `validateDOMNesting` and `git apply --check`.

## Checks A ran (logs in `a-round-499/`)
| Check | Result | Log |
|---|---|---|
| Frozen 1, 2, 3 (before apply) | rc 0 | this report |
| `git apply --check` / `git apply` / check 4 | rc 0 / rc 0 / rc 0 | this report |
| Frozen 1, 2, 4 after the doc prose | rc 0 ×3 | `frozen-after-doc.log` |
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, 180 warnings, 1 info | `lint.log` |
| Biome on the 4 code/test files (non-mutating) | rc 0, 6 warnings (= B `precheck-biome.log`) | `biome-scoped.log` |
| Covering set `b-round-498/covering-files.txt` | 14 files, 137/137 pass, rc 0 | `covering.log` |
| code-reviewer subagent (real run) | 1 Medium (above), 6 Low, score 8/10 | this report |
| Doc 321 token check | no class-token miss | `doc321-tokens.txt` |

**Not run by A:**
- the build;
- the full suite and `npm run verify` (gate rows; B's sketch runs are `b-round-498/precheck-full.log` and `precheck-build-sketch.log`);
- the mutants;
- any browser row (C1–C8, C10 and C13 belong to C).

## Reviewer Lows (for B; none applied, because each is beyond the sketch or waits on the STOP)
- **A-R499-CR-PAIR-ORDER:** no row asserts the order of the pairs (EmptyState primary before ghost; "Try Again" before "Go Home"). Suggested: `compareDocumentPosition` in B2B-1, B2B-2 and B2B-3 (test file, pinned by check 4).
- **A-R499-CR-TRYAGAIN-TYPE:** `ErrorBoundary.tsx` l.37 `<Button … onClick={reload}>` has no `type="button"`. This is pre-existing and harmless, because no form wraps it. The new EmptyState buttons do have it.
- **A-R499-CR-DS-SAME-RULE:** in DESIGN_SYSTEM.md l.1193, „იგივე წესი“ follows the 404 text-link sentence, so it reads ambiguously. Suggested: „Store-ის CTA წყვილის წესი (`ghost` `lg` `pill`)“. This is a sketch hunk.
- **Doc 321 Lows** (granted prose, held because of the STOP; proposed exact replacements for a re-dispatch):
  - **D1 l.30:** the 52 px height is not only a border. REC-DENIED-PRIMARY measures 52 at 1280 and 1440 with no border, because of row stretch next to the bordered secondary, and 50 at 375 (`measure/summary.txt`). Proposed: „სიმაღლე 50-დან (denied წყვილში 52-დან: border ან flex row-ის stretch) ხდება 48“.
  - **Build line:** doc 321 says „build rc 0 (`precheck-build-sketch.log`)“. A saw `✓ built in 1.85s` in that log's tail and no `rc` line.
    - The reviewer says the build ran on sketch v1. The task §5 table says "Build on v2". A did not resolve this conflict and did not adopt "v1".
    - Proposed: „build `✓ built` (`precheck-build-sketch.log`)“, with B confirming the sketch version.
  - **l.83 coverage sentence:** „B2B-1…B2B-4 target-ებს ამ oracle-ებს ადარებს“ overstates coverage, because `/store` is covered only by B2B-5. Proposed: „B2B-1…B2B-4 EmptyState-ისა და შეცდომის გვერდების target-ებს ამ oracle-ებს ადარებს; `/store`-ს მხოლოდ B2B-5 ამოწმებს“, or more if option (a) adds a row.
- **Pre-ruled items the reviewer acknowledged and did not raise:** #4 (EmptyState `<button>` branches with no caller) and #5 (faint ghost hover, 1.12).
- **Conditional note (not a finding):** doc 321 l.4 and l.100 are post-PASS claims under the L28 form. They are true only if C passes.

## Architecture note (code-reviewer, verbatim)
"No signal; keep as is. The diff only moves class strings onto the existing builder: no new state, lifecycle or ownership change, and no responsibilities mixed into one file. The only possible signal is that the same builder-call pattern keeps getting copied across rounds, and the ButtonLink wrapper for that is already pre-ruled as #2 with B planning to look at it again."

## Acceptance status (only what A actually ran)
- Sketch applied as dispatched; checks 1–4 rc 0; typecheck, lint, scoped Biome and covering 14/137 green.
- The code-reviewer ran and returned an unruled Medium, so this round is a **STOP**.
- **Not claimed:** C0–C14 and stage 2b-1 verified. Under L22, C runs C0, C12 and C14 only.

## Exact next checks for C (L22, STOP)
- **C0:** `git status --short --untracked-files=all` shows the 5 modified and 2 new paths above; frozen checks 1, 2 and 4 rc 0.
- **C12:** `bash b-round-498/claims-499.sh`, compared with `claims-499-sketch-output.txt`.
- **C14:** as C0, then `python3 -I tools/l57-check.py c-round-499.json c-round-499/l57-check.txt`.
