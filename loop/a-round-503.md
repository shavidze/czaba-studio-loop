# A round 503: DPG-BUTTON-CLEANUP-2 stage 2b-3

**Status:** implemented exactly as the sketch; no STOP. HEAD `882854e`. Logs are in `a-round-503/`.

## Steps (from `store/`)
| Step | Result |
|---|---|
| Frozen check 1 (`b-round-502/r503-tree-sha256.txt`) before | rc 0 |
| Frozen check 2 (`b-round-318/protected-sha256.txt`) before | rc 0 |
| Frozen check 3 (`b-round-502/r503-pre-sha.txt`) | rc 0 |
| Sketch sha256 | `210ee872…0aed9`, equal to `sketch-sha.txt` |
| `git apply --check` / `git apply` | rc 0 / rc 0 |
| Check 4 (`r503-post-sketch-sha.txt`) after | rc 0 |
| Check 1 and check 2 after | rc 0 / rc 0 |

## Changed files (7, all granted, all sketch bytes)
- M `app/routes/cart.tsx`
- M `app/routes/recordings.$productId.tsx`
- M `app/components/home/StudioShowcase.tsx`
- M `docs/design/DESIGN_SYSTEM.md`
- M `docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md`
- ?? `app/lib/__tests__/store-button-cleanup-2b3.test.tsx`
- ?? `docs/implementation/2026/quarter-IV/324-dpg-button-cleanup-stage-2b-3.md`

`git status --short --untracked-files=all` shows exactly these 7 entries. It was re-measured as the **last** store action, after typecheck, lint, Biome, vitest and the reviewer (`a-round-503/final-status.txt`), and frozen checks 1, 2 and 4 were run again at that point: rc 0 / 0 / 0. `git diff --stat 882854e` shows 5 tracked files, +10/−12. A wrote no prose into the store.

## Process (stated plainly)
- **Primitives:** A read `TAILWIND_FIRST`, `DESIGN_TOKENS`, `FORWARDREF_COMPONENT`, `TESTING_QUALITY_GATES` and `GEORGIAN_DOCS`, but only their first 60 lines, before applying the patch.
- **Skills:** the `pre-flight` skill and the `/check` command were opened only **after** the apply. This round wrote no code of A's own; the sketch was B's, pre-checked by B and reviewed by tech-lead.
  - `/check` means `npm run verify` plus e2e smoke. Under the 2026-10-21 speed rules A did not run it; the root gate does. A ran the scoped equivalents listed below.
- **Lessons:** A read `lessons.md` "Before handing over (A self-check)" (L11–L15, L26, L28) after the apply.
  - **L11:** no STOP conditions met.
  - **L12:** no `data-testid` changed (diff grep: 0 hits). B's L23 sweep [K13] covers the removed tokens.
  - **L14:** no dialog touched.
  - **L15:** A ran no browser contrast measurement. B's sketch values (8.32 / 10.28) are C4's row.
  - **L28:** doc 323 and doc 324 l.4 match B's pinned strings.
  - **L60:** the edit used a reviewed `git apply` sketch, with no shell string edits.
- `context/active-summary.md`: read with `head` only. There is no open Medium+ finding on the three files.

## Checks actually run (B's expected value in brackets)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 [rc 0] | `a-round-503/typecheck.log` |
| `npm run lint` | rc 0, "Found 179 warnings." [same] | `a-round-503/lint.log` |
| Scoped Biome, 4 code/test files | rc 0, "Checked 4 files", "Found 6 warnings." [same] | `a-round-503/biome-scoped.log` |
| Covering vitest (`b-round-502/covering-files.txt`) | rc 0, 12 files, 115/115 passed, 0 failed; 12 B2B3-0…B2B3-7 lines present; slowest test 433 ms (< 2,500) [12 / 115 / 541 ms] | `a-round-503/covering.log` |
| code-reviewer (real subagent run, on `git diff 882854e` plus the 2 untracked files) | 0 Critical/High/Medium, 1 Low, 3 Info, score 9/10 | summarized below |

**Not run by A, per the task and speed rules:** the full suite, the build, `npm run verify`, BC1b (`store-button-cleanup.test.tsx`), and browser rows. B's sketch-tree runs are `precheck-full.log` and `precheck-build-sketch.log`; the root gate re-runs them.

## code-reviewer findings (for B; none applied, because the sketch writes every byte)
- **Low, A-R503-CR-1:** doc 324 l.4 already says "C round 503 PASS" before C has run. The reviewer suggests "pending". This text is B's mandated L28 dispatch byte-string ([K15], C11 checks it byte-equal), so A did not change it. It is not a STOP: the finding is Low, and an edit would go beyond the sketch. B rules on it.
- **Info, A-R503-CR-2:** in B2B3-6, the check "`buildButtonClassName(` count ≥ 1 per file" is weak. The exact class strings are pinned by B2B3-1, 3 and 5, so it is acceptable.
- **Info, A-R503-CR-3:** the test's `StubCatalog` (`recordings: unknown[]`) can drift from the real API type, because `vi.mock` factories are not type-checked. `satisfies` against the real type would catch that.
- **Info, A-R503-CR-4:** doc 323's new l.4 drops the three B-R502 bug ids, which makes them harder to find with grep.
- The reviewer confirmed:
  - `href`s, the `owns_same` branch and the Universal + recordings condition are unchanged;
  - no purchase or auth logic changed;
  - there are no `as` casts and no `any` in the test;
  - the global `:focus-visible` ring (`app/styles/app.css:236`) still applies.

## Architecture note (for B/root; not an in-round refactor)
This is the third stage in a row that hand-writes `<Link className={buildButtonClassName(...)}>`, and there is now a third copy of the tag scanner. The reviewer says keep it this round. The proposal is one bounded task at the stage-2 close that decides a `ButtonLink` wrapper and a single shared scanner helper. Both are already tracked as SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER. No checkpoint is needed now.

## Other notes for B
- `.claude/primitives/DESIGN_TOKENS.md` still lists `brand` as #13D9CC (teal). This staleness is already covered by DPG-DOCS-UPDATE. The file is outside the grants, so it is not touched.

## Acceptance (A's part only)
- [x] Frozen checks 1, 2, 3 before and 4, 1, 2 after (re-run at the end): all rc 0.
- [x] Exactly the 7 granted files changed, with the sketch's bytes (check 4).
- [x] typecheck, lint, scoped Biome and covering tests equal B's expected values.
- [x] code-reviewer run; findings reported above.
- [ ] C1–C14 (browser, mutants, docs trace, claims): C's job, not claimed here.
- [ ] Full suite, build and verify: root gate.

## Known gaps
- No browser check was run by A.
- CART-REAL-BACKEND-503 stays blocked ("backend unavailable in cloud").
- SABA-Q-502-UPGRADE-VARIANT is still `awaiting_user`.

## Exact next C checks
Run C0–C14 as in `current-task.md` §4, heaviest first:
1. C1–C5: `measure-503.mjs`.
2. C7: `journey-503.mjs`.
3. C6: cart neighbours.
4. C10: mutants on a copy.
5. Then C8, C9, C11, C12, C13 and C14.

For C11, note A-R503-CR-1. The byte-equal check on doc 324 l.4 stays as written.
