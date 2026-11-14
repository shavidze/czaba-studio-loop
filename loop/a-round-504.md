# A round 504: DPG-BUTTON-CLEANUP-2 stage 2c (PurchaseHeader brass actions → Button / buildButtonClassName)

**Result: implemented. No STOP.** B's sketch was applied byte for byte. A wrote no code or prose of its own in the store.

## Scope completed
- Frozen checks run from `store/`, before applying:
  - check 1 (`b-round-503/r504-tree-sha256.txt`): rc 0;
  - check 2 (`b-round-318/protected-sha256.txt`): rc 0;
  - check 3 (`r504-pre-sha.txt`): rc 0;
  - HEAD `b806cad`, worktree clean.
- The sketch sha256 is `84cc9df33deee81e1de91f33c952b7689593c97b1b0003c30b79c41538dae03d`, equal to `b-round-503/sketch-sha.txt`.
- `git apply --check`: rc 0. `git apply`: rc 0.
- After applying: check 4 (`r504-post-sketch-sha.txt`), check 1 and check 2 are all rc 0.

## Changed files (`git status --short --untracked-files=all`)
```
 M app/components/product/PurchaseHeader.tsx
 M docs/design/DESIGN_SYSTEM.md
?? app/lib/__tests__/store-button-cleanup-2c.test.tsx
?? docs/implementation/2026/quarter-IV/325-dpg-button-cleanup-stage-2c.md
```
These are exactly the 4 granted paths. The tracked diff is `a-round-504/diff-vs-b806cad.patch.txt` (2 files, +15/−9). No protected file was touched.

## Checks actually run (logs in `a-round-504/`)
| Check | Result | B expected | Log |
|---|---|---|---|
| `npm run typecheck` | rc 0 | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, "Found 179 warnings." | rc 0, 179 | `lint.log` |
| `npx biome check` (PurchaseHeader + 2c test) | rc 0, "Checked 2 files", no fixes or warnings | same | `biome-scoped.log` |
| Covering vitest (`b-round-503/covering-files.txt`) | 6 files, 79/79 passed, rc 0. The 10 distinct ids B2C-0…B2C-9 are each on a ✓ line. Slowest per-test times are 287, 332 and 449 ms, all < 2,500 ms (read from the ANSI-stripped `covering-clean.log`; B's 368 ms is the same order). Wall Duration 3.43 s | 6 / 79/79 | `covering.log`, `covering-clean.log` |
| code-reviewer (real subagent) | No Critical/High/Medium; 4 Lows; 9/10 | — | `code-review.md` |

**End state, re-run after all checks and the review:**
- check 4: rc 0;
- check 1: rc 0;
- check 2: rc 0;
- `git status` shows the same 4 paths as above, and no stray artifacts.

**/check skill:** `source-command-check` → `.claude/commands/check.md` asks for `npm run verify` plus `npm run test:e2e:smoke`. Under the speed rules and task §3, A ran the scoped, non-mutating subset only: typecheck, lint, scoped `biome check` and the covering tests. A ran no `check:fix` and no auto-fix. `verify` and e2e smoke were **omitted by A**; they belong to the root gate.

**Pre-flight and primitives:**
- The pre-flight gate was posted in chat before applying.
- A read `.claude/skills/pre-flight/SKILL.md` in full. For the mapped primitives, A read only the heads of FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES and GEORGIAN_DOCS.
- A wrote no code: the change is B's reviewed `git apply` sketch.
- DESIGN_TOKENS.md still names teal as brand. It is stale; the DPG-DOCS item already tracks it, and A did not touch it.

**Not run by A** (speed rules, task §3): the full suite, the build, `npm run verify`, and browser rows. B ran the full suite and the build on the sketch tree. The root gate re-runs them.

## Code-reviewer findings (for B; no Medium+, so no STOP)
- **L1 (test:210):** the `not.toContain('text-black')` assertion is redundant after the exact class `toBe`.
- **L2 (test:244-245):** the click on the disabled button in B2C-5 cannot fail independently of the `disabled` assertion (test:239). This is a **new Low with no pre-ruled cover**. `b-round-503/mutants-504.txt` M6 (drops `disabled`) turns B2C-5 red, but no mutant targets the click line alone. It is a mutant-signal gap, not a behaviour gap.
- **L3 (test:38-42):** the `Link` mock passes only `to`, `className` and `children`. This sits with pre-ruled Low #3 (A-R503-CR-3-STUBCATALOG-DRIFT).
- **L4:** the busy class from `Button.tsx` carries both `cursor-pointer` and `cursor-not-allowed`. This is pre-existing, outside the diff, and covered by D5 / PD-R504-DISABLED-NO-REASON.

These lines are sketch-owned test bytes, so A did not edit them. Suggested ids: A-R504-CR-1 … CR-4. All are Low and belong in `deferred_low_polish`, or `confirmedBy` on the existing ids named above (L7).

## Architecture note (for B/root, not a task)
Keep `PurchaseHeader.tsx` as it is. The change is a class and element swap on three actions, with no new state or coupling. The Link+builder pattern and the duplicated scanner are already tracked as SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER (stage-2 close).

## B acceptance items passed by A
- §3.1: frozen checks 1–3 before applying, apply, then checks 4 and 1 after: all rc 0.
- §3.2: grants, only the 4 files, as written by the sketch.
- §3.3: typecheck, lint, scoped Biome and covering run match B's expected values. The code-reviewer was invoked.
- §3.4: this report.

C rows C0–C14 are **not** claimed by A.

## Known gaps
- The browser behaviour (C1–C7, C12) is not verified by A.
- The doc 325 l.4 status reads "C round 504 PASS" before C runs (L28 contract, pre-ruled Low #5).
- 8 px brass actions sit beside 12 px siblings until NONBRAND (pre-ruled Low #6).

## Exact next C checks
In the order of task §4, heaviest first (L59):
1. C10 mutants on a copy (`b-round-503/mutants-504.py`).
2. C1–C6 with `measure-504.mjs`, then C7 with `journey-504.mjs`. Start the mock API first and warm up `/products/middle-east` and `/products/door-slams`.
3. C5 with `compare-504.py`.
4. C8 scanner: 96/35. K3 `0 0 0`, K4 `1 2 3`, K5 `1 1`.
5. C9 covering tests.
6. C11 docs.
7. C12 protection and `/studio-lab`.
8. C13 claims.
9. C0/C14 source scope and the L57 check.
