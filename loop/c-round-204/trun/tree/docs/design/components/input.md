# Input — კომპონენტის სპეციფიკაცია

**ფაილი:** `app/components/ui/Input.tsx`

## Variants

### Default

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | transparent |
| Border | 1px `var(--color-outline)` |
| Text | `var(--color-foreground)` |
| Placeholder | `var(--color-dim)` |
| გამოყენება | ფორმის ველები |

### Filled

| თვისება | მნიშვნელობა |
|---------|------------|
| Background | `var(--color-elevated)` |
| Border | 1px transparent |
| გამოყენება | Search, ფილტრები |

---

## Sizes

| Size | Padding | Font | Height |
|------|---------|------|--------|
| `md` | `pt-6 pb-2 px-4` | `text-sm` | ~48px |
| `lg` | `pt-7 pb-2.5 px-4` | `text-base` | ~56px |

---

## States

| State | ვიზუალი |
|-------|--------|
| Default | `outline` border |
| Hover | `outline-hover` border |
| Focus | `outline-strong` border + ring |
| Error | `destructive` border + error message below |
| Disabled | `opacity-50`, `muted-bg` background |
| Filled | floating label ზემოთ |

---

## Floating Label

Input იყენებს floating label pattern-ს:

```
┌──────────────────────┐
│  Label               │  ← focus/filled: label მცირდება ზემოთ
│  [User input here]   │
└──────────────────────┘
```

- Default: label ცენტრში, `text-muted`
- Focus/Filled: label ზემოთ, `text-xs`, `text-brand` (focus) ან `text-muted` (filled)

---

## Exports

### Input

```typescript
interface InputProps {
  variant?: "default" | "filled";
  size?: "md" | "lg";
  label: string;
  error?: string;
  disabled?: boolean;
}
```

### PasswordInput

Input + visibility toggle ღილაკი (Eye/EyeOff icon).

```tsx
<PasswordInput label="პაროლი" error={errors.password} />
```

### Textarea

Multi-line variant, იგივე სტილებით:

```tsx
<Textarea label="შეტყობინება" rows={4} />
```

---

## Error Display

```tsx
<Input label="ელ-ფოსტა" error="ელ-ფოსტა სავალდებულოა" />
```

ვიზუალი:

```
┌──────────────────────┐
│  ელ-ფოსტა            │  ← destructive border
│  [                 ]  │
└──────────────────────┘
  ✕ ელ-ფოსტა სავალდებულოა   ← text-destructive text-xs
```

---

## Search Input Pattern

```tsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
  <Input
    variant="filled"
    label="ძებნა..."
    className="pl-10"
  />
</div>
```

---

## Select Pattern

```tsx
<select className="bg-elevated border border-outline rounded-md px-4 py-2.5 text-foreground">
  <option value="">აირჩიეთ...</option>
  <option value="track">Track</option>
  <option value="sfx">SFX</option>
</select>
```

---

## Accessibility

- ყველა input-ს უნდა ჰქონდეს `label` (floating ან aria-label)
- Error messages: `role="alert"` + `aria-describedby`
- Required ველი: `aria-required="true"`
- Password toggle: `aria-label="Toggle password visibility"`
