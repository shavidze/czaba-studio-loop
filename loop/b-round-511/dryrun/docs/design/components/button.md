# Button — კომპონენტის სპეციფიკაცია

**ფაილი:** `app/components/ui/Button.tsx`

## Variants

### Primary (default)

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-brand)` (#C9A46A) |
| Text | `var(--color-brand-foreground)` (dark) |
| Hover | `var(--color-brand-hover)` |
| გამოყენება | Submit, Primary CTA, Proceed to Checkout, upgrade-ის მოქმედებები |

### Buy

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-buy)` (#C9A46A) |
| Text | `var(--color-brand-foreground)` (dark) |
| Hover | `var(--color-buy-hover)` |
| გამოყენება | მხოლოდ product გვერდის „Buy Now“ (`PurchaseHeader`, `lg`). „Add to Cart“ — `CartButton`, hand-rolled გამონაკლისი (NONBRAND N2) |

### Secondary

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-elevated)` |
| Border | 1px `var(--color-outline)` |
| Text | `var(--color-foreground)` |
| Hover | `outline` bg + `outline-hover` border |
| გამოყენება | Cancel, Back, Secondary actions |

### Ghost

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | transparent |
| Text | `var(--color-muted)` |
| Hover | `elevated` bg + `foreground` text |
| გამოყენება | Links as buttons, Tertiary actions |

### Accent

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-accent)` (#C9A46A) |
| Hover | brightness-110 |
| გამოყენება | Special attention, highlights |

---

## Sizes

| Size | Padding | Font | Height |
|------|---------|------|--------|
| `sm` | `py-1.5 px-3` | `text-sm` | ~32px |
| `md` | `py-2.5 px-4` | `text-sm` | ~40px |
| `lg` | `py-3 px-6` | `text-base` | ~48px |

---

## States

```
Default → Hover → Active → Focus → Disabled → Loading
```

| State | ცვლილება |
|-------|---------|
| Hover | ფერის ცვლილება + cursor:pointer |
| Active | `scale(0.98)` |
| Focus | მხოლოდ keyboard-ის `:focus-visible`: 1.5px brass outline (80%), offset 2px; pointer-ით ფოკუსზე outline არ ჩანს (`app/styles/app.css`-ის საერთო წესი) |
| Disabled | `opacity-50 cursor-not-allowed` |
| Loading | Spinner icon + disabled, ტექსტი "Loading..." |

---

## Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "accent" | "buy" | "destructive";
  size?: "sm" | "md" | "lg";
  shape?: "default" | "pill";
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

---

## Exports

| Export | აღწერა |
|--------|--------|
| `Button` | ძირითადი კომპონენტი |
| `PrimaryButton` | `variant="primary"` shortcut |
| `SecondaryButton` | `variant="secondary"` shortcut |
| `GhostButton` | `variant="ghost"` shortcut |
| `AccentButton` | `variant="accent"` shortcut |

---

## IconButton

**ფაილი:** `app/components/ui/IconButton.tsx`

| Variant | აღწერა |
|---------|--------|
| `default` | Elevated background |
| `ghost` | Transparent |
| `brand` | Brand color background |

| Size | ზომა | Icon |
|------|------|------|
| `sm` | 32×32px | 16px |
| `md` | 40×40px | 20px |
| `lg` | 48×48px | 24px |

**აუცილებელი prop:** `label` — accessibility-სთვის (aria-label).

---

## გამოყენების მაგალითები

```tsx
<Button variant="primary" size="md">Submit</Button>
<Button variant="buy" size="lg">Buy Now</Button>
<Button variant="secondary" isLoading>Processing...</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<IconButton label="Play" variant="brand" size="lg">
  <PlayIcon />
</IconButton>
```
