# A round 502: cart layout (B-R502-CART-MOBILE-ITEMS-HIDDEN, B-R502-CART-LG-SUMMARY-CLIPPED, B-R502-CART-WHEEL-NESTED-SCROLL)

**Result:** sketch applied exactly. No STOP. A wrote no code or doc prose (the sketch writes every granted byte).

## Changed files (exactly the 3 grants, bytes = sketch v5)
- `app/routes/cart.tsx` (modified)
- `app/lib/__tests__/cart-mobile-layout.test.ts` (new, untracked)
- `docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md` (new, untracked)

`git status --short --untracked-files=all` = 1 modified + 2 untracked, nothing else. Diff vs `3bb55d4`: `a-round-502/diff.patch` (49 lines).

## Steps and checks (all run from `store/`, HEAD `3bb55d4`)
| Step | Result | Expected (task §3) |
|---|---|---|
| Frozen check 1 (`r502-tree-sha256.txt`) before | rc 0 | rc 0 |
| Frozen check 2 (protected) before | rc 0 | rc 0 |
| Frozen check 3 (`r502-pre-sha.txt`) | rc 0 | rc 0 |
| Sketch sha256 | `7d14eae2…667c0` = `sketch-sha.txt` | equal |
| `git apply --check` / `git apply` | rc 0 / rc 0 | rc 0 |
| Check 4 (`r502-post-sketch-sha.txt`) after | rc 0 | rc 0 |
| Check 1 after / check 2 after | rc 0 / rc 0 | rc 0 |
| `npm run typecheck` | rc 0 (`a-round-502/typecheck.log`) | rc 0 |
| `npm run lint` | rc 0, "Found 179 warnings." (`lint.log`) | rc 0, 179 |
| `npx biome check` cart.tsx + test | rc 0, "Found 5 warnings." (`biome-scoped.log`) | rc 0, 5 (pre-existing) |
| Covering vitest (`covering-files.txt`) | 3 files, 54/54, CML1–CML4 present, rc 0 (`covering.log`) | 3 files, 54/54 |
| code-reviewer (3 files, vs `3bb55d4`) | APPROVE, 9/10, 0 Critical/High/Medium, 5 Low | — |

Not run by A (per task and speed rules): the full vitest suite, the build, `npm run verify`, and the browser probes (C's rows C1–C7).

## code-reviewer findings (all Low; not fixed, because the granted bytes are the sketch's. These are "For B", not a STOP)
1. **Doc 323 l.28 (D1) wording:** "at lg … at its end the wheel scrolls the window" is imprecise. A column that actually overflows has `lg:overscroll-contain` (plus `.styled-scrollbar`'s contain), so at its end the wheel does not chain to the window. Only a non-overflowing column at lg, or any column below lg, passes the wheel to the window natively. The task's L4 ruling line uses the same wording. Nothing breaks, because `main` is overflow-hidden at lg. Related to pre-ruled #9.
2. **Below-lg mouse wheel feel:** on a narrow desktop window, the wheel scrolls natively over a column but is Lenis-smoothed elsewhere (= ruled D1). Suggested for later: a `prevent` predicate in `useSmoothScroll`. That is out of scope and belongs with SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE.
3. **CML4 regex** `/(^|:)(sticky|top-\d+)$/` misses `top-[96px]`, `top-px` and `top-1/2`; `sticky` is still caught. Optional fix: `top-\S+`.
4. **Test order:** CML4 is declared before CML3 (cosmetic).
5. **CML2 depends on attribute order:** it matches only when `data-lenis-prevent-wheel` directly follows `className`. It fails loudly (empty match), which is acceptable; close to pre-ruled #1.

The reviewer confirmed:
- only className values and two `data-lenis-prevent-wheel` attributes changed;
- no handler, checkout, Remove, auth or ownership logic changed;
- Lenis 1.3.x (`lenis.mjs:629`) checks the attribute along `composedPath`;
- CML1, CML2 and CML4 fail on HEAD.

**Why Low 1 is not an L11 STOP:** two task clauses do not disagree with each other. Instead, the task's descriptive ruling text (L4, D1) and doc 323 l.28 overstate when the wheel reaches the window at lg. No C row (C3 or C4) depends on that clause; C3's rows have the column scrolling, not chaining. No regression against HEAD follows from it, because HEAD's items column already had `overscroll-contain`. The reviewer rated it Low. B rules on whether doc 323 l.28 and the ruling text need a correction (that would be a sketch revision, not an A edit).

## End-of-round state (re-checked after all commands and the review)
`git status --short --untracked-files=all` still lists only the 3 paths above. Frozen checks 1, 2 and 4: rc 0.

## Process disclosure
- I did not run the `pre-flight` skill before applying. The task gives A no authored bytes: the sketch writes everything and B ran its own pre-check. I did not read the mapped primitives either. `git apply` does not trigger the Edit/Write hook, and A edited no code by hand.
- I read `context/active-summary.md` after the apply, through a grep for 502. It shows ENV_CHECK round 502 with the store at 200, and the three bugs scheduled for round 502 (D-29z1805). There is no root note for this round.
- I read lessons L11, L26 and L28 in full after the apply. Nothing in them requires a field this report omits.

## Architecture note (for B)
code-reviewer: "None found." The change touches only presentation classes in `CartPage`, with no new state or ownership; keep it as is. The sitewide Lenis nested-scroll policy is the planner's (already SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE and in doc 323's TODO).

## B acceptance (A's part, §3), only what truly passed
- [x] Frozen checks 1, 2 and 3 before; apply check and apply; check 4 and check 1 after. All rc 0.
- [x] Grants: exactly the 3 files, as the sketch writes them.
- [x] typecheck rc 0; lint rc 0 / 179; scoped Biome rc 0 / 5; covering 3 files 54/54 with CML1–CML4.
- [x] code-reviewer run on the whole change; Architecture note relayed.
- Not claimed: any C row (C0–C13), browser behaviour, the full suite, the build or verify. Doc 323 l.4 says "C round 502 PASS" before C has run (pre-ruled #3, L28 form). It is true only after C passes.

## Scope completed
Only A's §3 steps 1–4. The three bugs are **not** claimed fixed until C passes. The backlog is not marked done.

## Known gaps
- A did no browser verification. All layout, wheel, touch and journey behaviour belongs to C (C1–C7).
- Real cart backend: BLOCKED (backend unavailable in cloud).
- Reviewer Lows 1–5 above are open for B's ruling.

## Exact next C checks
Run C0 → C13 as in `current-task.md` §4, heaviest first:
1. C1 (`cart-states.mjs` + `compare-502.py`);
2. C3 (`cart-wheel.mjs`, 1366×600 screenshot, focus ring);
3. C7 (journey with the mock API);
4. C2, C4, C5, C6;
5. then C8–C13.

Server: `http://127.0.0.1:5173`, already running; do not start a duplicate. Warm `/cart` once first (L38).
