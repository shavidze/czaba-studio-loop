COMMIT: OK

I read the diff, the new test and the implementation doc. I did not run the code or a browser. I'm relying on C's PASS and `verify.log` for execution.

**Scope:** The candidate touches only `app/routes/account.orders.tsx`, a new test file and a doc. It has no auth, purchase or download changes. It has no `dangerouslySetInnerHTML`, no new listeners or timers, and no `any` or type assertions. In the test, `controlledPanel` uses a narrowing `throw` rather than a cast.

**Findings (all non-blocking, ranked)**

1. **Low – `app/routes/account.orders.tsx:69`: the press and select fixes have no repo regression test.**
   - `active:transform-none!` and `select-text` are the only defence against the global `button:active { transform: scale(0.98) }` rule (`app/styles/app.css:230`). They also keep text selection working inside a `<button>`.
   - OC1–OC4 don't cover either class, and the doc admits the browser proof is round-only evidence. A later Tailwind or CSS-layer change could silently bring back the scale or the selection block.
   - Fix: add a source-level guard, like the existing `store-focus-ring.test.ts`, asserting both classes on the toggle. Alternatively add it to the planned B-R486-FOCUS-OFFSET-GUARD task.

2. **Low – `account.orders.tsx:69`: `[--focus-offset:-2px]` is the first Store use of this hook.**
   - `store-focus-ring.test.ts` has no allow-list entry for it, so any offset value would pass. The doc already lists this as a TODO.
   - The inset offset itself is correct for an `overflow-hidden` card. The pointer-focus suppression at `app.css:241` still applies.

3. **Low – `account.orders.tsx:105`: collapsed panels now stay in the DOM.**
   - With up to 50 orders, every order's items are rendered up front, which adds some render cost. Previously they mounted only when opened.
   - It is bounded and static, with no effects. `hidden` removes the content from the accessibility tree and from the tab order.
   - Keeping it is the right call, because `aria-controls` then always points at a real element. If a page size above 50 is ever introduced, revisit.

4. **Info – `account-orders-card.test.tsx:160–171` (OC4) is weak.** It only shows the node isn't remounted. Real keyboard focus is covered by C's browser rows. That is acceptable, and the doc says so honestly.

5. **Info – accessible name and Tab stops.**
   - The h3's accessible name now includes the status, date, price and item count. The order number is first, so it works.
   - Each order card adds one Tab stop. This is inherent to the accordion pattern.
   - The status badge is a `<span>`, so there is no invalid nesting inside the button.

**Real-browser event ordering:** Native button Enter and Space handling replaces the old click-only `div`. The functional state update `setIsExpanded((expanded) => !expanded)` is correct for held keys. I found no leaks.

**Tailwind and tokens:** All classes are Tailwind utilities with token colours and no custom CSS. `flex-shrink-0` is carried over from the old code.

**Architecture note**
- Signal: none in the diff. `OrderCard` still has one lifecycle, a single `isExpanded` state and one `useId`.
- Keep: the disclosure lives in the same file as the route, and extracting a shared `Disclosure` component would be premature with only one other `ProductAccordion` use.
- Proposal for the planner, optional: one bounded task, B-R486-FOCUS-OFFSET-GUARD (already deferred). It would add a source-level guard for the `--focus-offset` allow-list plus the `transform-none!` and `select-text` classes, in `store-focus-ring.test.ts` only.

Score: 9/10