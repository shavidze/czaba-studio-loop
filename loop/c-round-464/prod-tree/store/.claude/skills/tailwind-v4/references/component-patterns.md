# Tailwind v4 Component Patterns Reference

## CSS-First Configuration

```css
/* app/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-background: #0a0a0a;
  --color-foreground: #e5e5e5;
  --color-surface: #141414;
  --color-elevated: #1e1e1e;
  --color-border: #262626;

  --color-brand: #13D9CC;
  --color-accent: #F9A80C;

  --color-error: #EF4444;
  --color-success: #22C55E;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif;

  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --duration-fast: 150ms;
  --duration-normal: 250ms;
}
```

## Button

```tsx
const buttonVariants = {
  primary: 'bg-brand text-background hover:bg-brand/90',
  secondary: 'bg-surface text-foreground hover:bg-elevated',
  ghost: 'bg-transparent text-foreground hover:bg-surface',
  accent: 'bg-accent text-background hover:bg-accent/90',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

<button className={cn(
  'rounded-md font-medium transition-colors duration-fast',
  'focus:outline-none focus:ring-2 focus:ring-brand/50',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  buttonVariants.primary,
  buttonSizes.md
)}>
  Click me
</button>
```

## Card

```tsx
<div className={cn(
  'bg-surface rounded-lg border border-border',
  'p-6',
  'transition-all duration-normal',
  'hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5'
)}>
  <h3 className="font-serif text-xl text-foreground">Title</h3>
  <p className="mt-2 text-muted">Description</p>
</div>
```

## Input

```tsx
<input
  className={cn(
    'w-full bg-surface text-foreground',
    'border border-border rounded-md',
    'px-4 py-2',
    'placeholder:text-muted',
    'focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error && 'border-error focus:border-error focus:ring-error/30'
  )}
  placeholder="Enter text..."
/>
```

## Responsive Design

```tsx
<div className={cn(
  'p-4',
  'md:p-6',
  'lg:p-8',
  'xl:p-12'
)}>
  <div className={cn(
    'grid gap-4',
    'grid-cols-1',
    'md:grid-cols-2',
    'lg:grid-cols-3',
    'xl:grid-cols-4'
  )}>
    {/* items */}
  </div>
</div>
```

## Animation

```tsx
<div className="transition-all duration-fast hover:scale-105" />

<button className="transition-colors duration-fast hover:bg-brand/90" />

<div className={cn(
  'transition-all duration-normal',
  'opacity-0 translate-y-2',
  'group-hover:opacity-100 group-hover:translate-y-0'
)} />
```

## cn() Helper

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

<div className={cn(
  'base-classes',
  condition && 'conditional-class',
  props.className
)} />
```

## CZABA-Specific Classes

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .glass {
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(12px);
  }
}
```
