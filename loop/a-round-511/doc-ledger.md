# Doc 330 ledger (L26): each behaviour sentence → test row or evidence

Doc: `store/docs/implementation/2026/quarter-IV/330-dpg-nonbrand-stage-n2-purchase-card.md`. Row ids are grep-able in `store-button-cleanup-n2.test.tsx` (N2-*), `store-button-cleanup-2c.test.tsx` (B2C-*) and `store-theme-tokens.test.ts` (ST5). Non-test claims cite source/diff evidence or a C row (browser).

| Doc section | Sentence (short) | Row / evidence |
|---|---|---|
| კონტექსტი | HEAD had four hand-rolled controls (bg-buy `<button>`, brand/accent outline Links, CartButton rounded-lg/font-medium) | `git diff f5d1b9e -- app/components/product/PurchaseHeader.tsx` (sketch, check 4); B's [K5] |
| მიდგომა | Buy Now = `<Button variant="buy" size="lg">` | N2-1, B2C-7, B2C-8, N2-9 |
| მიდგომა | no `isLoading`; "Processing..." + spinner kept | N2-3 (no "Loading...", one `svg` with class `animate-spin`); mutant M6 |
| მიდგომა | keeps handler | N2-8 (M8, M20) |
| მიდგომა | keeps `disabled` | N2-3, N2-4 (M5) |
| მიდგომა | price unknown: focusable (`aria-disabled`, not native disabled; `document.activeElement` after focus and after click), points to the reason text | N2-2 (M3, M4) |
| მიდგომა | Open in Studio / Downloads → secondary lg builder; no brand/accent outline | N2-5, N2-6 (M9, M10, M12, M16, M17, M18) |
| მიდგომა | SABA-Q-507-OUTLINE-VARIANT default no | question reference, no behaviour claim |
| მიდგომა | Add to Cart hand-rolled, shape aligned (`rounded-md`, `px-6`, `text-base`, `font-semibold`) | N2-7 (M13, M14, M21a, M21b); N2-9 (one `motion.button`) |
| მიდგომა | colours of all three CartButton states unchanged | sketch diff touches only shape tokens (the ternary colour strings are unchanged context lines); N2-7 In Cart tokens; C1/C6 browser |
| მიდგომა | framer "Added" pulse unchanged | sketch diff does not touch `animate`/`transition` lines; C6 record row |
| მიდგომა | PlayStems out of N2; never renders (no runtime producer; `mockProductDetail.ts` stems unused in app) | D-29z1852 (B's K9/K18); `grep -rn MOCK_PRODUCT_DETAIL app` = only `app/data/` (A, round 511); C7 |
| მიდგომა | DESIGN_SYSTEM exactly two lines changed; Usage Examples primary samples, heading and missing buy block pending B | `git diff f5d1b9e -- docs/design/DESIGN_SYSTEM.md` (C0); STOP in `a-round-511.md` |
| არქიტექტურა | Go to Downloads primary lg unchanged | N2-5, B2C-1, B2C-2 |
| არქიტექტურა | Upgrade / Unlock Premium unchanged primary lg | N2-6, B2C-3, B2C-4 |
| შეცვლილი ფაილები | `HEAD_BUY_NOW_CLASS` deleted | `grep -rn HEAD_BUY_NOW_CLASS app` → 0 hits |
| პრობლემები 1 | ST5: 0 `bg-buy` className, `variant="buy"` once, no `text-*`/`bg-*` on buy tag | ST5 (M23) |
| პრობლემები 2 | busy Buy Now gets `pointer-events-none` (B-R510-BUSY-CURSOR-HIDDEN) | N2-3 / N2-4 busy class equals builder with `isDisabled: true` (contains `pointer-events-none`); C4 record |
| პრობლემები 3 | 2 px height difference when wrapped (375) | C1 (browser, pre-ruled 4); no unit row |
| ტესტირება | N2-1 … N2-9, B2C-7, B2C-8, ST5 descriptions | each row id exists (`grep -c 'N2-[1-9]:'` = 9 in covering log; B2C-7/B2C-8/ST5 present) |
