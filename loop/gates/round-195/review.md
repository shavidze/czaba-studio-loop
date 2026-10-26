COMMIT: OK. The tokens are consistent, nothing changes behaviour, C round 195 is PASS (12 checks, 0 bugs), and verify passed (185 test files / 2727 tests, build OK).

## Code Review: STORE-2a colour tokens (rounds 193–195, 26 paths against `caa09af`)

### Critical Issues
- None.

### Findings, most important first

1. **Auth, purchase and download files are touched, but only their class names.** You said this must be none, so here is the full list. Every hunk changes one Tailwind class token in a `className` string. No handler, loader/action, `apiClient` call, `localStorage` or token line changes.
   - `components/auth/ForgetPassword.tsx:80`: the check icon changes `text-foreground` → `text-brand-foreground`.
   - `routes/account.tsx:330/351/371`: the 3 fields in the password-change modal change `border-outline` → `border-outline-strong`.
   - `components/product/PurchaseHeader.tsx:348`: Buy Now text changes to `text-brand-foreground`.
   - `routes/cart.tsx:221`, `components/cart/GiftCardInput.tsx:107`, `routes/gift-cards.tsx:161`: field borders.
   - `routes/account.orders.tsx:231`: CTA text colour.
   - `routes/free-downloads.tsx:312`: the email field border on the email-gated free page. This is not the protected downloads page.
   - The rule in `architecture-checkpoint.md` (auth, access to purchased files and protected files must not change) still holds. `studio.$productId.tsx:440/471` and `account.downloads.tsx:261` are untouched; a grep shows they still have `bg-brand text-foreground`. Doc 158 records them as `STORE2A-PROTECTED-BRASS-TEXT`.
   - B granted these files in rounds 193 and 194, and SCOPE-195 passed. If you meant "must be none" to include class-only edits, this is the list to override. Otherwise no fix is needed.

2. **Low — the secondary button's hover state is now almost invisible.** In `ui/Button.tsx`, the `secondary` variant goes from `bg-elevated` (`#1d1a17`) to `hover:bg-outline` (`#24211e`) on hover. That difference is too small to see; with the old palette (12% → 22% lightness) it was clear. Doc 158's STORE-2b list covers cards, dividers and pills, but not this interactive state.
   - **Fix (STORE-2b):** use `hover:bg-muted-bg` or `hover:border-outline-strong`. Also update the `BUTTON_UNCHANGED_VARIANT_BLOCKS` byte guard in the test (`store-theme-tokens.test.ts:86–91`), as the doc already expects.

3. **Low — a colour token is used for a different purpose.** `marketing/LeadMagnetPopup.tsx:126` uses `placeholder:text-brand-foreground/60`: the dark text colour for brass fills, reused as a grey on a white field. It measures about 5.1:1, so it is accessible, but it ties the placeholder to the brass-fill token.
   - **Fix (STORE-2b):** if the popup's white field stays, add a token for text on light fields.

4. **Low — stale comments in `styles/app.css:59–61`.** They still say `/* #333640 - was 18% */` and `/* #434750 - was 25% */`, and the WCAG note doesn't match the new values. This is already a TODO in doc 158.

5. **Low (paperwork) — doc 158's status is out of date.** `docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md:4` still says "awaiting C round 195", but C round 195 passed. Update it to `Completed (C round 195 PASS, <sha>)` when committing, as was done for doc 157 in this same diff.

6. **Checked and fine — destructive text contrast.** `#d2776a` on `bg-elevated` (`#1d1a17`) works out to about 5.4:1, and about 6.1:1 on `#0e0d0c`. Error text such as `GuestForm.tsx:65` passes 4.5:1.

### What tests can't catch
- **Event ordering, listener and timer leaks:** none possible. The diff has no `useEffect`, listener, timer, ref or state change.
- **Render cost:** unchanged. The variant arrays are still built once at module level with `.join(' ')`, and the other edits are string literals.
- **Studio:** unaffected. The obsidian block overrides 18 keys and keeps exactly 21 declarations (ST4). `outline-strong` had no store usages before this change, so making it brighter changes nothing else in the store. In Studio the obsidian block already sets the same value (`app.css:3928`). C measured 0 changed pixels on `/studio-lab` at 1440 and 1280.
- **Accessibility:** improved overall. Text on brass and destructive fills goes from 1.88 and 2.57 to 8.32 and 6.09 against the new palette. Field borders measure 3.1–3.7:1, keyboard focus is still visible (brass border), and the error state still shows on fields.
- **Not measured:** `/recordings/:id` and `/scenes/:id` couldn't be checked without a backend (`RECORDINGS-195` BLOCKED). Only test ST8 R1–R4 covers them. This doesn't block the commit; it should be checked in an environment with a backend.
- **TS strict, Tailwind and semicolons:** clean. The new test has no `any`, no type assertions and no `@ts-ignore`, and uses `?? ''` guards. Colours come only from `@theme` tokens.

### Suggestions
- Leave the hard-count guards (18/21/26, the exact ST6 marker map) as they are. They are deliberate drift locks, and STORE-2b should update them on purpose.

### Good Practices Found
- R72 makes every colour key the obsidian block shares with the store `@theme` hold the identical value, so the store palette can't drift from Studio's. ST1 checks this.
- Doc 158 has proof the new tests fail on the old tree, plus a log of deliberate one-line breakages and which test caught each.
- ST8c tests the field scanner itself, so a scan that finds nothing can't pass silently.
- Auth and purchased-content routes were left alone on purpose and logged as signals.

### Architecture note
- **Signal 3 (the same region changed expensively in several rounds): `app/lib/__tests__/store-theme-tokens.test.ts:465–581`.** ST8/ST8b were rewritten in rounds 194 and 195. The test now contains its own JSX tag and constant parser (`jsxTagEndIndex`, `constantInitialiserEndIndex`, `bareOutlineFieldHitsInSource`), which repeats B's `fieldscan2.mjs`.
  - **Keep for now:** it is test-only with no runtime coupling, and it caught two real regressions (C-R194-01/02).
  - **Proposal for the planner:** as one task in STORE-2b, move the scanner into a single shared module that both T1 and B's K0 tool import, so the deny-list (`-light`, `-hover`, side variants) grows in one place. Acceptance: ST8c fixtures stay green, `fieldscan2` gives the same hit count, and no runtime file changes.

### Alternative Approach
- **Current:** store `@theme` uses exactly the same values as the Studio obsidian block, and each brass or destructive fill gets dark text individually.
- **Alternative:** give the store its own values, or change `--color-outline` globally, or add a `--color-input-border` token.
- **Verdict:** the current approach is better. Store values would create two sources for one colour (doc 158 rejects this as R72(a)). Changing `--color-outline` globally would break the shared-value rule and change every card. A new token would still need the same edit at each field. The per-field swap is the narrowest correct fix.

### Score: 8.5/10