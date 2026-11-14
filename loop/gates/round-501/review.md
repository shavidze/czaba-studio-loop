COMMIT: OK

I read the diff, `Button.tsx`, the new test and the touched code in `free-downloads.tsx`. I did not rerun the tests or the build, and I did not read the new doc `322-dpg-button-cleanup-stage-2b-2.md`. Of the stated checks, only the auth/purchase/download scope check ties to a command: the verify log and C's PASS are your inputs. The rest is from reading the code.

**Scope**
- Nothing here touches auth, the cart, checkout, purchases, the real file download or the API client.
- The "Download" button on `/free-downloads` only toggles a local `isExpanded` flag that opens the email-lead form. The form action and the raw "Send Download Link" submit button are unchanged.
- `hire-us` and the newsletter form still submit through Remix `Form` and `fetcher.Form`. The submit buttons keep `type="submit"` and the same `disabled={isSubmitting}`.

**Event ordering and leaks**
- `Button` spreads `...props` after its own props, so `onClick` and `aria-expanded` reach the DOM. It also forwards the ref.
- The change adds no listeners, timers or effects.
- During submit the button becomes `disabled` and swaps its label. That is the same lifecycle as before, and the form keeps the same submit path.
- The `Button` builder adds `pointer-events-none` when disabled, so a disabled button no longer takes hover or click events. This matches the stated design, and nothing here relied on those events.

**Render cost:** It is unchanged. `Button` is a thin component, and each file renders exactly one.

**Accessibility**
- Adding `aria-expanded` to the Download toggle is an improvement.
- Both spinners now have `motion-reduce:animate-none`.
- The `hire-us` spinner was a hardcoded `border-white` div. It is now a `Loader2` icon that inherits its colour, which is correct for the tokens.

**Tailwind and tokens:** No custom CSS and no hardcoded colours. The classes come from the builder, and `h-14` does not collide with it. The test helper asserts the exact class strings against `buildButtonClassName`.

**TypeScript:** No `any`, no suppression directives and no type assertions.

### Findings, ranked
1. **Low, visual and intentional.** `hire-us.tsx:277` and `NewsletterSection.tsx:82` change visually.
   - `hire-us` goes from `rounded-xl` to `rounded-md` and from `py-4` to `py-3`. Its text goes from `text-brand-foreground` to `text-background`.
   - The newsletter button goes from `px-8` to `px-6`, and its disabled opacity from 70 to 50.
   - DESIGN_SYSTEM.md documents the radius change. Do a quick visual check of contrast and width in a real browser. No code fix is needed.
2. **Low.** `NewsletterSection.tsx:86`: `Loader2` carries `motion-reduce:animate-none`, but `Button`'s own `isLoading` spinner (`Button.tsx:135`) does not. Fix: add `motion-reduce:animate-none` there in a later round. It is outside this diff.
3. **Info.** `free-downloads.tsx:287`: the toggle sets `aria-expanded` but no `aria-controls`. This is optional. The sibling "Send Download Link" button (`free-downloads.tsx:319`) is still a raw `<button>`. It is not brass, so the new test does not cover it. It could be a follow-up in the same cleanup series.

### Architecture note
- None. The diff makes three call sites use the shared `Button`, which moves ownership toward the design system.
- Proposal for the planner: when the cleanup series finishes, replace the regex tag scanner in the test (`openingTags` and `hasSolidBrass` in `store-button-cleanup-2b2.test.tsx`) with one shared lint rule or helper. Several stages now carry similar scanners, and the cost grows with each stage. The proposal is only to decide at stage close-out.

### Score: 9/10