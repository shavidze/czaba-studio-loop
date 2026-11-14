COMMIT: OK

C round 503 passed and `verify.log` shows a pass. I read the diff, the new test and doc, `Button.tsx` and the cart context. I did not run a browser. The checks below come from reading the code and the logs.

## What I checked
- **Auth, purchase and download code:** none touched. The cart "Upgrade" change only swaps the `className` on a `<Link>` (`cart.tsx:160-166`). The `ownershipStatus` logic, the `href`, `useCart`, `usePurchases` and checkout are unchanged. The recordings change is the same kind of `className` swap. `recordings.$productId.tsx` keeps its `RequireAuth` wrapper, and the stream-grant and token code is untouched.
- **Event ordering, listeners and timers:** there are no new effects, listeners or timers. The changes are `className` strings. The test file adds no `setTimeout` or global listener. It stubs `IntersectionObserver` and restores it in `afterEach` with `unstubAllGlobals` and `cleanup`.
- **Render cost:** `buildButtonClassName` is a pure function that builds one short string per render. The old `className` values were string literals, so there is no meaningful change. I didn't memoize it, and it doesn't need it.
- **TypeScript strict:** the only app change is a typed call to the builder. The test has no `any`, `@ts-ignore` or type assertions. It narrows with `instanceof Element`. The `vi.hoisted` state is typed.
- **Tailwind and tokens:** the classes now come from the design-token variant (`bg-brand text-background hover:bg-brand-hover`). The hard-coded `text-black` and `bg-brand/90` are gone from "Upgrade". `Button.tsx` shows the builder output matches the test oracles (B2B3-0).
- **Accessibility:**
  - "Upgrade" and "Create a scene" both get `min-h-11` (44px), an improvement over the old 32px "Upgrade".
  - Contrast for "Upgrade" is 8.32 and 10.28 on hover, per the doc.
  - Label order and the `<a>` role are unchanged.
  - The document's global `:focus-visible` ring is claimed unchanged, and I saw nothing in the diff that removes it.

## Findings, ranked
All of these are low and none block the commit.

1. **`StudioShowcase.tsx:154`, behavior regression, documented.** The hover `scale(1.05)` and press `scale(0.98)` are gone, and the button shrinks from 257×58 to 241×48. The doc records this as D3, so it is a deliberate deviation, not a bug. Fix, if the hover feedback is missed: add it as a design decision in a later round, not as a one-off `hover:[transform:...]` class.
2. **`StudioShowcase.tsx:11`, minor bundle risk.** The home component imports `buildButtonClassName` from the `~/components/ui` barrel. Vite tree-shakes this in production, and the build passed. In dev, or if a ui module gains a side effect, the barrel pulls in more than needed. Fix: leave it, since the other call sites in this stage use the same barrel.
3. **`store-button-cleanup-2b3.test.tsx:97-114`, brittle tests.** The tests pin whole class strings and the exact HEAD tag text. Any edit to the shared `Button.tsx` styles breaks them, and the failure points at the wrong stage. B2B3-0 at least makes the dependency explicit. Fix: when the shared scanner arrives (SIG-R501-SHARED-BUTTON-SCANNER), replace the full-string equality with token checks.
4. **`store-button-cleanup-2b3.test.tsx:158-182`, scanner limits.** The hand-written JSX tag scanner treats `>` inside template-literal expressions only roughly. B2B3-7 covers the three HEAD shapes, so it is acceptable for now. Fix: move it to the shared helper in `style-scan` when that exists.
5. **`324-…md:4` vs `323-…md:4`, status wording.** Doc 323 goes to "Completed" while 324 stays "In Progress". That is consistent with 2b-3 being one stage of a larger task. Fix: none, but set 324 to Completed when the 2c to 2e stages close.

## Architecture note
- **Signal:** `app/routes/cart.tsx:160`, `app/routes/recordings.$productId.tsx:187` and `app/components/home/StudioShowcase.tsx:154` are Links styled as buttons through `buildButtonClassName`. That is the repeated-cost signal. Stages 2a to 2b-3 each hand-convert one group, and each stage adds its own tag scanner and class-string oracles.
- **Keep or extract:** keep this change as it is. The invariants here (auth, purchase and download access, audio timing, refs, gesture lifecycle, Undo/Redo) are untouched. Extracting now would widen the scope of a pure `className` change.
- **Proposal for the planner:** one bounded task after stage 2e. Decide on a `ButtonLink` wrapper (SIG-R498-BUTTONLINK-WRAPPER) and one shared brass-action scanner (SIG-R501-SHARED-BUTTON-SCANNER). Acceptance: all `<Link className={buildButtonClassName(...)}>` sites migrated, one scanner test replacing the per-stage ones, and no change in rendered class output. This is a proposal only. It is not a finding for this round.

## Alternative approach
Not critical logic (no auth, checkout or audio path), so I did not weigh alternatives.

**Score: 9/10**