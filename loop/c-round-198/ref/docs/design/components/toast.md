# Toast

შეტყობინებების კომპონენტი — ავტომატურად ქრება, ანიმაციური.

## კომპონენტები

### ToastContainer
გლობალური კონტეინერი — `fixed bottom-6 right-6 z-[100]`.

```tsx
import { ToastContainer } from '~/components/ui/Toast';

// root layout-ში
<ToastContainer />
```

### ToastItem
ცალკეული შეტყობინება — არ გამოიყენება პირდაპირ, `useToast` hook-ით იმართება.

## ტიპები

| ტიპი | ფერი | აიქონი | გამოყენება |
|------|------|--------|------------|
| `success` | emerald-500 | CheckCircle | წარმატებული ოპერაცია |
| `error` | red-500 | AlertCircle | შეცდომა |
| `warning` | amber-500 | AlertTriangle | გაფრთხილება |
| `info` | blue-500 | Info | ინფორმაცია |

## სტილი

- **ფონი:** `{color}-500/10` + `backdrop-blur-md`
- **ბორდერი:** `{color}-500/30`
- **ზომა:** `min-w-[320px] max-w-[420px]`
- **რადიუსი:** `rounded-xl`
- **ჩრდილი:** `shadow-2xl`

## ანიმაცია (Framer Motion)

| Phase | ეფექტი |
|-------|--------|
| Enter | `opacity: 0→1, y: 50→0, scale: 0.9→1` (spring: stiffness 400, damping 30) |
| Exit | `opacity: 1→0, x: 0→100, scale: 1→0.9` |
| Layout | `layout` prop — სხვა toast-ების გადაადგილება |

## ფუნქციონალი

- **Auto-dismiss:** 4 წამი (`duration: 4000`)
- **Progress bar:** ბოლოში, `h-0.5`, რეალურ დროში კლებადი
- **Close button:** მარჯვენა ზედა კუთხე, X აიქონი
- **Stack:** ბოლოდან ზემოთ (`flex-col-reverse`)

## გამოყენება

```tsx
import { useToast } from '~/hooks';

const { addToast } = useToast();

addToast({
  type: 'success',
  title: 'წარმატება',
  message: 'პროდუქტი დაემატა კალათაში',
});
```

## Toast ინტერფეისი

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}
```

## Accessibility

- Close button: `aria-label="Dismiss"`
- `pointer-events-none` კონტეინერზე, `pointer-events-auto` თითოეულ toast-ზე
