# MobileWarning

მობილური მოწყობილობის გაფრთხილება — ორი ვარიანტი: banner და blocker.

## კომპონენტები

### MobileWarning (Banner)
ქვედა ნაწილში გამოჩენილი dismissible banner — რეკომენდაციის ხასიათის.

### MobileBlocker (Full-screen)
სრულეკრანიანი overlay — desktop-only ფუნქციებისთვის (მაგ. Studio/DAW).

## MobileWarning Props

| Prop | ტიპი | Default | აღწერა |
|------|------|---------|--------|
| `title` | `string` | `"Best on Desktop"` | სათაური |
| `description` | `string` | optimization message | აღწერა |
| `breakpoint` | `number` | `1024` | პიქსელი (< breakpoint = mobile) |
| `dismissible` | `boolean` | `true` | შესაძლებელია დახურვა |
| `onDismiss` | `() => void` | — | dismiss callback |

### სტილი
- **პოზიცია:** `fixed inset-x-0 bottom-0 z-50 p-4 md:hidden`
- **ფონი:** `bg-gradient-to-br from-neutral-900 to-neutral-950`
- **ბორდერი:** `border-white/10 rounded-2xl`
- **დეკორატიული:** gradient overlay `from-brand/10 via-transparent to-accent/10`
- **აიქონები:** Monitor (ძირითადი) + Smartphone (badge)

### ანიმაცია
```
initial: { opacity: 0, y: 50 }
animate: { opacity: 1, y: 0 }
exit:    { opacity: 0, y: 50 }
```

## MobileBlocker Props

| Prop | ტიპი | Default | აღწერა |
|------|------|---------|--------|
| `title` | `string` | `"Desktop Only"` | სათაური |
| `description` | `string` | desktop required message | აღწერა |
| `showContinueAnyway` | `boolean` | `false` | "Continue Anyway" ღილაკი |
| `onContinue` | `() => void` | — | continue callback |

### სტილი
- **პოზიცია:** `fixed inset-0 z-50 bg-background`
- **Layout:** `flex-col items-center justify-center p-6 text-center`
- **დეკორატიული:** ორი blur blob (`brand/10` + `accent/10`)
- **აიქონი:** Monitor `w-10 h-10 text-brand` gradient box-ში
- **Footer:** "Mobile detected" ტექსტი Smartphone აიქონით

### ანიმაცია (staggered)
| ელემენტი | Delay |
|----------|-------|
| Icon | 0s |
| Title | 0.1s |
| Description | 0.2s |
| Button | 0.3s |

## გამოყენება

```tsx
import { MobileWarning, MobileBlocker } from '~/components/ui/MobileWarning';

// რეკომენდაცია (dismissible)
<MobileWarning
  title="უკეთესია Desktop-ზე"
  description="Studio ოპტიმიზირებულია დიდი ეკრანებისთვის"
/>

// Studio-ში (blocking)
<MobileBlocker
  title="Studio მხოლოდ Desktop-ზე"
  description="Personal Mixdown Studio მოითხოვს desktop ბრაუზერს"
  showContinueAnyway
  onContinue={() => setBypass(true)}
/>
```

## Breakpoint ლოგიკა

- `window.innerWidth < breakpoint` → mobile
- `resize` event listener-ით real-time detection
- MobileBlocker-ს ფიქსირებული `1024px` breakpoint აქვს
