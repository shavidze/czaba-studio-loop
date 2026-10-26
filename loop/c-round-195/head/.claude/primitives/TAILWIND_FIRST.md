# TAILWIND_FIRST

## Tailwind-First Styling წესები

### აკრძალული

```tsx
// ❌ Custom CSS files
import './Button.css'

// ❌ CSS Modules
import styles from './Button.module.css'

// ❌ Inline styles
<div style={{ padding: '16px', background: '#13D9CC' }} />

// ❌ Hardcoded colors
<div className="bg-[#13D9CC]" />
<div className="text-gray-500" />

// ❌ Hardcoded spacing
<div className="p-[15px]" />
<div className="mt-[23px]" />
```

### სწორი მიდგომა

```tsx
// ✅ Design tokens
<div className="bg-brand text-foreground" />
<div className="bg-surface border-outline" />

// ✅ Spacing scale (4px base)
<div className="p-4 gap-2" />
<div className="space-y-6" />

// ✅ Responsive
<div className="p-4 md:p-6 lg:p-8" />

// ✅ States
<button className="bg-brand hover:bg-brand/90 active:bg-brand/80" />

// ✅ Focus
<button className="focus-visible:ring-2 focus-visible:ring-brand" />
```

### cn() Utility

```tsx
import { cn } from '~/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  className?: string
}

function Button({ variant = 'primary', className }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'px-4 py-2 rounded-lg font-medium',
        'transition-colors duration-200',
        // Variants
        variant === 'primary' && 'bg-brand text-white hover:bg-brand/90',
        variant === 'secondary' && 'bg-surface text-foreground hover:bg-muted',
        // Custom classes (override)
        className
      )}
    />
  )
}
```

### Color Tokens

| Token | გამოყენება |
|-------|------------|
| `bg-brand` | Primary buttons, links |
| `bg-accent` | Secondary accent |
| `bg-background` | Page background |
| `bg-surface` | Cards, modals |
| `text-foreground` | Primary text |
| `text-muted` | Secondary text |
| `text-dim` | Disabled, hints |
| `border-outline` | Borders |

### Spacing Tokens

| Class | Value | გამოყენება |
|-------|-------|------------|
| `p-1`, `gap-1` | 4px | Tight |
| `p-2`, `gap-2` | 8px | Small |
| `p-4`, `gap-4` | 16px | Default |
| `p-6`, `gap-6` | 24px | Cards |
| `p-8`, `gap-8` | 32px | Sections |

### Typography

```tsx
// Headlines - Playfair Display
<h1 className="font-serif text-4xl font-bold" />
<h2 className="font-serif text-2xl font-bold" />

// Body - Inter
<p className="font-sans text-base" />
<span className="font-sans text-sm text-muted" />

// UI Labels
<label className="text-sm font-medium" />
```

### Responsive Patterns

```tsx
// Mobile first
<div className="
  flex flex-col     // mobile: stack
  md:flex-row       // tablet+: row
  gap-4
  md:gap-6
" />

// Grid
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-4
  gap-4
" />
```

### Animation

```tsx
// Transitions
<div className="transition-colors duration-200" />
<div className="transition-transform duration-300 ease-out" />

// Hover effects
<div className="hover:scale-105 transition-transform" />

// Loading spinner
<Loader2 className="animate-spin" />
```
