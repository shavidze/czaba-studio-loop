import sys
root = sys.argv[1]
def rep(path, old, new):
    p = root + '/' + path
    s = open(p, encoding='utf-8').read()
    assert s.count(old) == 1, (path, old[:60], s.count(old))
    s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)

D = 'docs/design/DESIGN_SYSTEM.md'
rep(D, '| **Buy/Purchase** | `--color-buy` (#C9A46A) | "Buy Now", checkout buttons |',
       '| **Buy/Purchase** | `--color-buy` (#C9A46A) | "Buy Now" (`variant="buy"`, product page) |')
rep(D, '''"ეს action რევენიუ მოაქვს?"
    │
    ├── კი → variant="buy" (Buy Now); Add to Cart — CartButton, hand-rolled გამონაკლისი (NONBRAND N2)
    │
    └── არა
         │
         ├── "ეს secondary action-ია?" → variant="secondary" (Cancel, Back)
         │
         └── "ეს tertiary/link-ია?" → variant="ghost" (Learn More, Skip)''',
'''"ეს პროდუქტის პირდაპირი შეძენაა (product გვერდის Buy Now)?"
    │
    ├── კი → variant="buy" (Buy Now); Add to Cart — CartButton, hand-rolled გამონაკლისი (NONBRAND N2)
    │
    └── არა
         │
         ├── "ეს ეკრანის ან ფორმის მთავარი მოქმედებაა?" → variant="primary" (Submit, Proceed to Checkout, Get it free, Unlock Premium)
         │
         ├── "ეს secondary action-ია?" → variant="secondary" (Cancel, Back, Open in Studio)
         │
         └── "ეს tertiary/link-ია?" → variant="ghost" (Learn More, Skip)''')
rep(D, '''// Primary - Revenue actions
<Button variant="primary" size="lg">Add to Cart</Button>
''', '''// Primary - Main action of a screen or form
<Button variant="primary" size="lg">Proceed to Checkout</Button>

// Buy - Direct purchase on the product page
<Button variant="buy" size="lg">Buy Now</Button>
''')
rep(D, '<PrimaryButton>Buy Now</PrimaryButton>', '<PrimaryButton>Submit</PrimaryButton>')
rep(D, 'product გვერდის purchase card-ის მოქმედებები (`PurchaseHeader`: „Go to Downloads“, „Upgrade to Premium“, „Unlock Premium“, `lg`, `min-w-[160px]`)',
       'product გვერდის purchase card-ის მოქმედებები (`PurchaseHeader`, ყველა `lg`: „Buy Now“ — `buy`, `min-w-[120px]`; „Go to Downloads“ (Link-ი `buildButtonClassName`-ით), „Upgrade to Premium“ და „Unlock Premium“ — `primary`, `min-w-[160px]`; „Open in Studio“ და „Downloads“ — `secondary` Link-ები `buildButtonClassName`-ით; „Add to Cart“ — `CartButton`, hand-rolled გამონაკლისი იმავე ფორმით)')
rep(D, '''#### Primary Button (Revenue Actions)''', '''#### Primary Button (Main Actions)''')
rep(D, '''**Use for:** Submit, Primary CTA. Buy Now იყენებს variant="buy"-ს; Add to Cart — CartButton (hand-rolled გამონაკლისი, NONBRAND N2)
''', '''**Use for:** Submit, Primary CTA, „Proceed to Checkout“, „Get it free“ და upgrade-ის მოქმედებები („Unlock Premium“, „Upgrade to Premium“, cart-ის „Upgrade“). Buy Now იყენებს `variant="buy"`-ს; Add to Cart — `CartButton` (hand-rolled გამონაკლისი, NONBRAND N2). cart-ის „Upgrade“-ის ფერი Saba-ს ღია კითხვაა (SABA-Q-502-UPGRADE-VARIANT, default: primary).

#### Buy Button (Direct Purchase)
```txt
bg-buy text-brand-foreground
hover:bg-buy-hover
active:opacity-90
shadow-sm
font-semibold, radius: rounded-md (default) ან rounded-full (pill)
```

**Use for:** მხოლოდ product გვერდის „Buy Now“ (`PurchaseHeader`, `lg`). `--color-buy` ახლა `--color-brand`-ის ტოლია (#C9A46A), ამიტომ ღილაკი primary-ს ემთხვევა. ცალკე variant საშუალებას იძლევა, შესყიდვის ფერი სხვა ღილაკებისგან დამოუკიდებლად შეიცვალოს.
''')

U = 'docs/technical/components/ui-components.md'
rep(U, "| `variant` | `'primary' \\| 'secondary' \\| 'ghost' \\| 'accent'` | `'primary'` | Visual style |",
       "| `variant` | `'primary' \\| 'secondary' \\| 'ghost' \\| 'accent' \\| 'buy' \\| 'destructive'` | `'primary'` | Visual style |\n| `shape` | `'default' \\| 'pill'` | `'default'` | `rounded-md` or `rounded-full` |")
rep(U, '''#### Primary (Revenue Actions)
```tsx
<Button variant="primary">Add to Cart</Button>
<PrimaryButton>Buy Now</PrimaryButton>
```
- Background: `--color-brand` (#13D9CC)
- Use for: Add to Cart, Buy Now, Submit, Primary CTAs
''', '''#### Primary (Main Actions)
```tsx
<Button variant="primary">Proceed to Checkout</Button>
<PrimaryButton>Submit</PrimaryButton>
```
- Background: `--color-brand` (#C9A46A)
- Use for: Submit, Primary CTAs, Proceed to Checkout, upgrade actions

#### Buy (Direct Purchase)
```tsx
<Button variant="buy" size="lg">Buy Now</Button>
```
- Background: `--color-buy` (#C9A46A)
- Use for: the product page "Buy Now" only. "Add to Cart" is `CartButton`, a hand-rolled exception (`docs/design/DESIGN_SYSTEM.md`)
''')
rep(U, "- Background: `--color-accent` (#f9a91f)", "- Background: `--color-accent` (#C9A46A)")
rep(U, '// Using convenience exports\n<PrimaryButton size="lg">Buy Now</PrimaryButton>', '// Direct purchase\n<Button variant="buy" size="lg">Buy Now</Button>\n\n// Using convenience exports\n<PrimaryButton size="lg">Submit</PrimaryButton>')

I = 'docs/implementation/2026/quarter-IV/330-dpg-nonbrand-stage-n2-purchase-card.md'
rep(I, '**სტატუსი:** Completed (C round 511 PASS)', '**სტატუსი:** Completed (C round 512 PASS)')
rep(I, '`docs/design/DESIGN_SYSTEM.md`-ში ზუსტად ორი სტრიქონი შეიცვალა (variant-ის decision tree და primary-ის „Use for“), რომლებიც Add to Cart-სა და Buy Now-ს `variant="primary"`-ად ასახელებდა. იმავე ფაილის Usage Examples-ის primary მაგალითები (Add to Cart, `PrimaryButton` Buy Now), „Primary Button (Revenue Actions)“ სათაური და buy variant-ის ცალკე ბლოკის არარსებობა ამ რაუნდის grant-ს გარეთაა და B-ის გადაწყვეტილებას ელოდება.',
       '`docs/design/DESIGN_SYSTEM.md`, `docs/design/components/button.md` და `docs/technical/components/ui-components.md` Add to Cart-სა და Buy Now-ს `variant="primary"`-ად ასახელებდა. რაუნდმა 511 `DESIGN_SYSTEM.md`-ში მხოლოდ ორი სტრიქონი შეცვალა, რის გამოც ფაილი თავის თავს ეწინააღმდეგებოდა (code-reviewer-ის Medium, C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES). რაუნდმა 512 სამივე ფაილის Button-ის სექციები HEAD-ის ქცევას გაუთანაბრა: decision tree, მაგალითები, Shape-ის ცხრილი, primary-ის ბლოკი („Main Actions“) და ახალი buy-ის ბლოკი.')
rep(I, '- `docs/design/DESIGN_SYSTEM.md` — ზუსტად ორი სტრიქონი (variant-ის decision tree და primary-ის „Use for“).',
       '- `docs/design/DESIGN_SYSTEM.md` — Variant Selection Guide, ფერის ცხრილის Buy/Purchase სტრიქონი და Buttons-ის სექციები (Usage Examples, Shape, Primary, ახალი Buy) (რაუნდები 511 და 512).\n- `docs/technical/components/ui-components.md` — Button-ის სექცია: props (`buy`, `destructive`, `shape`), primary და buy ბლოკები, ფერის hex-ები (რაუნდი 512).')
rep(I, '- `DESIGN_SYSTEM.md`-ის დარჩენილი primary მაგალითები და buy variant-ის ბლოკი (code-reviewer-ის Medium, B-ის გადაწყვეტილებით).\n', '')
K = 'docs/design/components/button.md'
rep(K, '| გამოყენება | Add to Cart, Submit, Revenue actions |', '| გამოყენება | Submit, Primary CTA, Proceed to Checkout, upgrade-ის მოქმედებები |')
rep(K, '''### Secondary

| თვისება''', '''### Buy

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-buy)` (#C9A46A) |
| Text | `var(--color-brand-foreground)` (dark) |
| Hover | `var(--color-buy-hover)` |
| გამოყენება | მხოლოდ product გვერდის „Buy Now“ (`PurchaseHeader`, `lg`). „Add to Cart“ — `CartButton`, hand-rolled გამონაკლისი (NONBRAND N2) |

### Secondary

| თვისება''')
rep(K, '| Focus | `ring-2 ring-brand ring-offset-2` |', '| Focus | მხოლოდ keyboard-ის `:focus-visible`: 1.5px brass outline (80%), offset 2px; pointer-ით ფოკუსზე outline არ ჩანს (`app/styles/app.css`-ის საერთო წესი) |')
rep(K, '| Loading | Spinner icon + disabled, ტექსტი "იტვირთება..." |', '| Loading | Spinner icon + disabled, ტექსტი "Loading..." |')
rep(K, '''  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";''', '''  variant?: "primary" | "secondary" | "ghost" | "accent" | "buy" | "destructive";
  size?: "sm" | "md" | "lg";
  shape?: "default" | "pill";''')
rep(K, '<Button variant="primary" size="md">Add to Cart</Button>', '<Button variant="primary" size="md">Submit</Button>\n<Button variant="buy" size="lg">Buy Now</Button>')
rep(I, '- `docs/technical/components/ui-components.md` — Button-ის სექცია', '- `docs/design/components/button.md` — Primary-ის გამოყენება, ახალი Buy, Focus და Loading-ის სტრიქონები, props, მაგალითი (რაუნდი 512).\n- `docs/technical/components/ui-components.md` — Button-ის სექცია')
print('ok')
