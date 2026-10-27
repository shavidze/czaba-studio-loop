# Card — კომპონენტის სპეციფიკაცია

**ფაილი:** `app/components/ui/Card.tsx`

## Variants

### Default

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-surface)` |
| Border | 1px `var(--color-outline)` |
| Radius | `rounded-lg` (12px) |
| გამოყენება | კონტენტ ბარათები, ფორმები |

### Elevated

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-surface)` |
| Shadow | `shadow-card` |
| Border | none |
| გამოყენება | გამოყოფილი კონტენტი |

### Outline

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | transparent |
| Border | 1px `var(--color-outline)` |
| გამოყენება | მსუბუქი სექციები |

### Interactive

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-surface)` |
| Border | 1px `var(--color-outline)` |
| Hover | `translateY(-2px)` + `shadow-card` + `outline-hover` |
| Cursor | pointer |
| გამოყენება | პროდუქტის ბარათები, clickable ელემენტები |

---

## Padding

| Size | მნიშვნელობა |
|------|------------|
| `none` | 0 |
| `sm` | `p-3` (12px) |
| `md` | `p-5` (20px) |
| `lg` | `p-6` (24px) |

---

## Sub-components

```tsx
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>სათაური</CardTitle>
    <CardDescription>აღწერა</CardDescription>
  </CardHeader>
  <CardContent>
    კონტენტი
  </CardContent>
  <CardFooter>
    მოქმედებები
  </CardFooter>
</Card>
```

### CardHeader

- `flex flex-col gap-1.5`
- სათაურის და აღწერის wrapper

### CardTitle

- `font-semibold text-lg text-foreground`
- heading level `as` prop-ით (h2, h3...)

### CardDescription

- `text-sm text-muted`

### CardContent

- `flex-1` — იკავებს დარჩენილ სივრცეს

### CardFooter

- `flex items-center gap-3`
- border-top separator (optional)

---

## Semantic HTML

`as` prop საშუალებას იძლევა სემანტიკური element-ის არჩევა:

```tsx
<Card as="article" variant="interactive" padding="md">
  {/* Product card */}
</Card>

<Card as="section" variant="default" padding="lg">
  {/* Form section */}
</Card>
```

---

## Product Card Pattern

```tsx
<Card as="article" variant="interactive" padding="none">
  <div className="aspect-square overflow-hidden rounded-t-lg">
    <img src={product.coverUrl} alt={product.title} />
  </div>
  <CardContent className="p-4">
    <CardTitle>{product.title}</CardTitle>
    <CardDescription>{product.category}</CardDescription>
    <div className="flex items-center justify-between mt-3">
      <span className="text-brand font-semibold">${product.price}</span>
      <Button variant="primary" size="sm">Add to Cart</Button>
    </div>
  </CardContent>
</Card>
```

## Glass Card Pattern

```css
background: hsl(220, 18%, 8%, 0.8);
backdrop-filter: blur(16px);
border: 1px solid hsl(220, 15%, 22%, 0.5);
```

გამოყენება: hero overlay, floating elements.
