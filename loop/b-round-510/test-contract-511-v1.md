# Round 511 test contract (NONBRAND N2, PurchaseHeader) — A writes these rows; B's mutants must turn the named rows red

Product sketch: `b-round-510/sketch-511-purchaseheader.patch.txt` (sha in `sketch-sha.txt`). Under RC-R510-SKETCH-SCOPE A writes the tests and the doc against this contract.

## New file `app/lib/__tests__/store-button-cleanup-n2.test.tsx`
Mocks: same specifiers as `store-button-cleanup-2c.test.tsx` (`~/hooks/useAuth`, `~/hooks/useCart`, `~/hooks/useToast`, `~/hooks/usePurchases`, `~/lib/analytics`, `~/lib/facebook-pixel`, `useNavigate`). Find elements by role + accessible name only (L12). Fresh element per rerender (L52). `vi.clearAllMocks()` before every click; assert every spy's count after every click.

Expected class strings are built in the test by calling the real `buildButtonClassName` with the literal params below (not copied from the component).

| Row | State | Assert |
|---|---|---|
| N2-1 | anonymous, price 99, Standard | `button` "Buy Now": `type="button"`, not disabled, no `aria-disabled`, no `aria-describedby`; `className` === `buildButtonClassName({ variant: 'buy', size: 'lg', className: 'min-w-[120px] whitespace-nowrap aria-disabled:opacity-50 aria-disabled:cursor-not-allowed!' })`; contains one `svg` and the text "Buy Now"; no text "Loading..." |
| N2-2 | price `undefined` | "Buy Now": `aria-disabled="true"`, `disabled` false (native), `aria-describedby` = id of the element whose text starts "Price unavailable"; its className === the N2-1 string (isDisabled false); click → `buyNow`, `openModal`, `showToast`, `trackBeginCheckout` each 0 |
| N2-3 | signed in, `isBuyingNow` true | "Processing..." button: native `disabled` true; className === builder with `isDisabled: true` and the same variant/size/className; contains `svg.animate-spin`; no "Loading..." and no "Buy Now" text |
| N2-4 | signed in, `isAddingToCart` true | the Buy Now button (name "Buy Now") is native-disabled |
| N2-5 | signed in, `recordingsHref="/recordings/6"`, owned by handle | `link` "Open in Studio": `href` "/recordings/6", className === `buildButtonClassName({ variant: 'secondary', size: 'lg', className: 'whitespace-nowrap' })`; `link` "Go to Downloads": `href` "/account/downloads", className === HEAD's builder string (primary lg `min-w-[160px] whitespace-nowrap`) |
| N2-6 | signed in, owns Standard, Standard selected, `onSelectPremium` set | `link` "Downloads": `href` "/account/downloads", className === secondary-lg builder string of N2-5; `button` "Upgrade to Premium" className unchanged (2c's `PRIMARY_LG_CARD_ACTION`); click Upgrade → `onSelectPremium` 1, nothing else |
| N2-7 | anonymous; then signed in with the product in cart (`alreadyInCart`) | "Add to Cart" class tokens ⊇ {`rounded-md`,`px-6`,`py-3`,`text-base`,`font-semibold`,`gap-2`,`min-w-[140px]`} and ∩ {`rounded-lg`,`px-5`,`font-medium`} = ∅; "In Cart" tokens ⊇ {`rounded-md`,`bg-brand/10`,`text-brand`,`border-brand/30`} |
| N2-8 | signed in, price 99, variant 12 | click "Buy Now" → `buyNow` 1 with `(1, 12)`, `addToCart` 0; clear; click "Add to Cart" → `addToCart` 1, `buyNow` 0 (swap guard) |
| N2-9 | source scan of PurchaseHeader.tsx (2c's `openingTags`) | 0 `<button` opening tags; 3 `<Button` tags, exactly 1 containing `variant="buy"`; `buildButtonClassName(` count 3; 1 `<motion.button` tag (CartButton, named exception) |

## Rewrites (no assertion lost; equal or stronger replacements allowed, L4)
- **B2C-7** (`store-button-cleanup-2c.test.tsx`): replace `HEAD_BUY_NOW_CLASS` with the N2-1 builder string (computed with `buildButtonClassName`); the openModal/buyNow asserts stay. Title may change to "…uses the buy Button and asks to sign in…".
- **B2C-8**: `handRolledBrassActions` [] stays; builder count 1 → 3; `Button` tags 2 → 3; the lowercase `button`+`bg-buy` count (1) is replaced by "exactly 1 `Button` tag contains `variant="buy"` and 0 lowercase `<button` tags". Title updated accordingly.
- **ST5** (`store-theme-tokens.test.ts` ~l.695–700): the PurchaseHeader part becomes `classAttributesWithTokens(src, ['bg-buy'])` length 0 **and** `src.split('variant="buy"').length - 1 === 1`; the Button `buy` variant dark-text check earlier in ST5 is unchanged and covers the fill.

## Mutants (site × attribute, L52). A or C applies each on a copy outside `store/`; the named row must go red
| Id | Edit | Red row |
|---|---|---|
| M1 | Buy Now `variant="buy"` → `"primary"` | N2-1, B2C-7 |
| M2 | Buy Now className drops `aria-disabled:opacity-50` | N2-1 |
| M3 | Buy Now `aria-disabled` removed | N2-2 |
| M4 | Buy Now `aria-describedby` removed | N2-2 |
| M5 | Buy Now `disabled={isDisabled}` removed | N2-3, N2-4 |
| M6 | Buy Now adds `isLoading={isBuyingNow}` | N2-3 |
| M7 | Buy Now `type="button"` removed | N2-1 |
| M8 | Buy Now `onClick={handleAddToCart}` (swap) | N2-8 |
| M9 | Open in Studio `variant: 'secondary'` → `'primary'` | N2-5 |
| M10 | Open in Studio `size: 'lg'` → `'md'` | N2-5 |
| M11 | Downloads (Case 2) `to="/account/downloads"` → `to="/account"` | N2-6 |
| M12 | swap the two Case-2 children's classNames (Downloads gets Upgrade's, Upgrade keeps own → Downloads primary) | N2-6 |
| M13 | CartButton `rounded-md` → `rounded-lg` | N2-7 |
| M14 | CartButton `font-semibold` → `font-medium` | N2-7 |
| M15 | Buy Now className adds `pointer-events-none` constant | N2-1 |
