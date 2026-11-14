# Round 512 doc ledger (L26): changed behaviour sentences → code fact / test row

Tree: HEAD f5d1b9e + round-511 tree + sketch-512 (check 5 rc 0). Line numbers at this tree.

## docs/design/DESIGN_SYSTEM.md
| # | Changed sentence | Code fact | Test row |
|---|---|---|---|
| D1 | Colour table: Buy/Purchase `--color-buy` (#C9A46A), "Buy Now" `variant="buy"`, product page | `app/styles/app.css:86` `--color-buy: #c9a46a`; `PurchaseHeader.tsx:348` `variant="buy"`, label l.364 | N2-1, N2-9, B2C-7 |
| D2 | Decision tree: direct purchase → `buy` (Buy Now); Add to Cart = `CartButton` hand-rolled exception | `PurchaseHeader.tsx:348`; `CartButton` `motion.button` l.413–440 | N2-7, N2-9 (`motion.button` 1) |
| D3 | Main action → `primary` (Submit, Proceed to Checkout, Get it free, Unlock Premium) | `cart.tsx:389–398` Button no variant → default `primary` (`Button.tsx:105`); `ProductSidebar.tsx:84–96` `variant="primary"` "Get it free"; `PurchaseHeader.tsx:277–292` Unlock Premium no variant → primary | Unlock/Checkout/Get it free: no dedicated row (code fact only) |
| D4 | Secondary → Cancel, Back, Open in Studio | `PurchaseHeader.tsx:160` `variant: 'secondary'`, label l.166 | N2-5 |
| D5 | Usage example `<Button variant="primary" size="lg">Proceed to Checkout</Button>`; `<Button variant="buy" size="lg">Buy Now</Button>`; `<PrimaryButton>Submit</PrimaryButton>` | `cart.tsx:391` size lg; `PurchaseHeader.tsx:348` buy lg; `Button.tsx:148–149` PrimaryButton = primary | N2-1 |
| D6 | Shape table PurchaseHeader list: Buy Now `buy` `min-w-[120px]`; Go to Downloads (Link + builder), Upgrade to Premium, Unlock Premium `primary` `min-w-[160px]`; Open in Studio, Downloads `secondary` Links with builder; Add to Cart CartButton same shape; all `lg` | `PurchaseHeader.tsx:354` min-w-[120px]; l.171–173 builder lg min-w-[160px] (default primary, `Button.tsx:80`); l.217/219 Upgrade lg min-w-[160px]; l.279/282 Unlock lg min-w-[160px]; l.160–161, l.206–207 secondary lg; l.413 CartButton `rounded-md px-6 py-3 text-base font-semibold` | N2-1, N2-5, N2-6, N2-7, B2C-8 |
| D7 | Shape table: cart "Upgrade" `sm` `min-h-11`, default radius | `cart.tsx:162` `buildButtonClassName({ size: 'sm', className: 'min-h-11 shrink-0' })` (default primary, default shape `Button.tsx:80,82`) | none (code fact) |
| D8 | Primary block class list `bg-brand text-background / hover:bg-brand-hover / active:opacity-90 / shadow-sm` + `font-semibold`, radius md/full | `Button.tsx:18–23`, l.89, `shapeStyles` l.65–67 | ST5 (Button part) |
| D9 | Primary Use for incl. cart "Upgrade"; colour is SABA-Q-502-UPGRADE-VARIANT (default primary) | `cart.tsx:162` primary by default | none; question id cited, no rule invented |
| D10 | Buy block class list `bg-buy text-brand-foreground / hover:bg-buy-hover / active:opacity-90 / shadow-sm` + `font-semibold` + shape | `Button.tsx:45–50`, l.89, l.65–67 | N2-1 (class equals builder buy lg) |
| D11 | Buy Use for: only product Buy Now (`PurchaseHeader`, `lg`); `--color-buy` equals `--color-brand` (#C9A46A) | `PurchaseHeader.tsx:348–354`; `app.css:63` and `:86` both #c9a46a; `buy` used once (N2-9) | N2-9, B2C-8 |

## docs/design/components/button.md
| # | Changed sentence | Code fact | Test row |
|---|---|---|---|
| B1 | Primary usage: Submit, Primary CTA, Proceed to Checkout, upgrade actions | as D3, D9 | — |
| B2 | Buy: bg `var(--color-buy)` #C9A46A, text `--color-brand-foreground`, hover `--color-buy-hover` | `Button.tsx:46–47`; `app.css:65,86,87` | N2-1, ST5 |
| B3 | Buy usage: only product Buy Now; Add to Cart = CartButton exception | as D2, D11 | N2-7, N2-9 |
| B4 | Focus: keyboard `:focus-visible` only, 1.5px brass 80 %, offset 2px; none on pointer focus (shared `app.css` rule) | `app.css:236–243` | none (browser-only cascade, L12) |
| B5 | Loading: spinner + disabled, text "Loading..." | `Button.tsx:117` `isDisabled = disabled \|\| isLoading`; l.133–136 `<span>Loading...</span>` | N2-1 asserts no "Loading..." when idle; no positive row (code fact) |
| B6 | Props `variant` adds `buy`, `destructive`; `shape?: "default" \| "pill"` | `Button.tsx:4,6,9,11` | — |
| B7 | Examples `variant="primary" size="md"` Submit; `variant="buy" size="lg"` Buy Now; `PrimaryButton size="lg"` Submit | `Button.tsx:4–5,148–149` | — |

## docs/technical/components/ui-components.md
| # | Changed sentence | Code fact | Test row |
|---|---|---|---|
| U1 | Props table `variant` incl. `buy`, `destructive`, default `primary`; `shape` default `default`, `rounded-md`/`rounded-full` | `Button.tsx:4,6,65–67,80,82,105,107` | — |
| U2 | Primary (Main Actions): example Proceed to Checkout, `PrimaryButton` Submit; bg `--color-brand` (#C9A46A); Use for Submit, CTAs, Checkout, upgrade | `Button.tsx:18`; `app.css:63`; as D3 | — |
| U3 | Buy (Direct Purchase): `variant="buy" size="lg"` Buy Now; bg `--color-buy` #C9A46A; only product Buy Now; Add to Cart = CartButton | as D10, D11 | N2-1, N2-9 |
| U4 | Accent bg `--color-accent` (#C9A46A) | `app.css:66` | — |
| U5 | Examples: "Direct purchase" `variant="buy" size="lg"` Buy Now; `PrimaryButton size="lg"` Submit | as above | — |

## docs/implementation/.../330 (changed parts)
| # | Changed sentence | Fact |
|---|---|---|
| I1 | l.4 `**სტატუსი:** Completed (C round 512 PASS)` | L28 / D-29z1859; byte-checked |
| I2 | Approach: the three docs named Add to Cart / Buy Now as `primary`; round 511 changed two lines → self-contradiction (C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES); round 512 aligned all three Button sections | K6 planning output; stale scan 0/0/0 now (`stale-scan.txt`) |
| I3 | Changed-files list names button.md and ui-components.md (round 512) | `git status` (frozen-post.txt) |
| I4 | Test rows cited N2-1…N2-9, B2C-7, B2C-8, ST5 | all exist: `store-button-cleanup-n2.test.tsx:204–340`, `store-button-cleanup-2c.test.tsx:263,273`, `store-theme-tokens.test.ts:692` |

Headings: 7 TEMPLATE `## ` headings in order (l.7, 13, 24, 36, 46, 55, 71). `grep -c 'pending\|C round 511 PASS'` = 0.
