# New Component Template

ახალი კომპონენტის შექმნისას დაიცავი ეს სტანდარტები:

---

## ფაილის სტრუქტურა

```tsx
// app/components/{category}/{ComponentName}.tsx

import { type ReactNode } from 'react';
import { cn } from '~/lib/utils';

// Types
interface ComponentNameProps {
  children?: ReactNode;
  className?: string;
  // ... other props
}

// Component
export function ComponentName({
  children,
  className,
  ...props
}: ComponentNameProps) {
  return (
    <div
      className={cn(
        // Base styles
        'bg-surface border border-outline rounded-lg',
        // External className (can override base)
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## Tailwind-First Rule

```tsx
// CORRECT
<div className="p-6 bg-surface/60 backdrop-blur-lg border border-white/10 rounded-lg">

// WRONG - no custom CSS classes
<div className="custom-card-class">
```

---

## ფერები (მხოლოდ ტოკენები)

```tsx
// Backgrounds
bg-background      // Page background
bg-surface         // Cards, modals
bg-elevated        // Hover states

// Text
text-foreground    // Primary text
text-muted         // Secondary text
text-dim           // Disabled, hints

// Brand
bg-brand           // Primary actions (#13D9CC)
text-brand         // Brand text
bg-accent          // Secondary accent (#F9A80C)

// Borders
border-outline     // Default borders
border-outline-hover
```

---

## Spacing Scale

```tsx
// Use spacing tokens only
p-1    // 4px
p-2    // 8px
p-3    // 12px
p-4    // 16px
p-5    // 20px
p-6    // 24px
p-8    // 32px

// Component padding: p-4 to p-6
// Section padding: py-12 to py-20
// Card padding: p-5 or p-6
```

---

## Typography

```tsx
// Font families
font-serif         // Playfair - ONLY for headlines
font-sans          // Inter - everything else

// Sizes
text-xs            // 12px - captions
text-sm            // 14px - UI labels, buttons
text-base          // 16px - body
text-lg            // 20px - card titles
text-xl            // 24px - section titles
text-2xl           // 30px
text-3xl           // 36px
text-4xl           // 48px - hero

// Weights
font-normal        // 400 - body
font-medium        // 500 - UI elements
font-semibold      // 600 - headlines, buttons
font-bold          // 700 - hero titles
```

---

## Border Radius

```tsx
rounded-sm         // 6px - small elements
rounded-md         // 8px - buttons, inputs
rounded-lg         // 12px - cards, modals
rounded-xl         // 16px - large cards
rounded-full       // pills, avatars
```

---

## Animation

```tsx
// Durations
duration-150       // fast - hover
duration-250       // normal - modals
duration-400       // slow - page transitions

// Easings
ease-out           // default (cubic-bezier(0.16, 1, 0.3, 1))

// Example
<div className="transition-all duration-150 ease-out hover:bg-elevated">
```

---

## Interactive States

```tsx
// Hover
hover:bg-elevated
hover:border-outline-hover
hover:text-foreground

// Focus (accessibility required!)
focus:outline-none
focus-visible:ring-2
focus-visible:ring-brand
focus-visible:ring-offset-2
focus-visible:ring-offset-background

// Disabled
disabled:opacity-50
disabled:cursor-not-allowed
disabled:pointer-events-none
```

---

## Component Checklist

შექმნის წინ შეამოწმე:

- [ ] Tailwind-only (no custom CSS)
- [ ] Color tokens only (no hex/rgb)
- [ ] Spacing tokens only (no arbitrary values)
- [ ] Typography from scale
- [ ] Hover state
- [ ] Focus state (accessibility)
- [ ] Disabled state (if applicable)
- [ ] WCAG contrast 4.5:1 minimum
- [ ] Mobile responsive
- [ ] Props properly typed
- [ ] className prop for customization
- [ ] Uses cn() for class merging

---

## Import Pattern

```tsx
// Export from index
// app/components/ui/index.ts
export { ComponentName } from './ComponentName';

// Usage
import { ComponentName } from '~/components/ui';
```

---

## არსებული კომპონენტები (გამოიყენე!)

```tsx
import {
  Button,
  IconButton,
  Input,
  PasswordInput,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  ConfirmDialog
} from '~/components/ui';
```
