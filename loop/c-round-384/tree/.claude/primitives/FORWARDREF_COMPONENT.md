# FORWARDREF_COMPONENT

## UI Component Template

### სტანდარტული სტრუქტურა

```tsx
import * as React from 'react'
import { cn } from '~/lib/utils'

// 1. Types
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

// 2. Variant styles
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white hover:bg-brand/90',
  secondary: 'bg-surface text-foreground border border-outline hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  accent: 'bg-accent text-white hover:bg-accent/90'
}

// 3. Size styles
const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

// 4. Component with forwardRef
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

// 5. Display name
Button.displayName = 'Button'

// 6. Convenience exports
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
)

export { Button }
export type { ButtonProps }
```

### Card Component Example

```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-6',
          variant === 'default' && 'bg-surface',
          variant === 'elevated' && 'bg-surface shadow-lg',
          variant === 'outlined' && 'bg-transparent border border-outline',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
```

### Input Component Example

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 rounded-lg',
            'bg-surface border border-outline',
            'text-foreground placeholder:text-dim',
            'focus:outline-none focus:ring-2 focus:ring-brand',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

### Barrel Export

```tsx
// components/ui/index.ts
export { Button, PrimaryButton, SecondaryButton } from './Button'
export type { ButtonProps } from './Button'

export { Card } from './Card'
export type { CardProps } from './Card'

export { Input } from './Input'
export type { InputProps } from './Input'
```

### გამოყენება

```tsx
import { Button, Card, Input } from '~/components/ui'

function MyForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Card variant="elevated">
      <Input
        ref={inputRef}
        label="Email"
        placeholder="you@example.com"
      />
      <Button fullWidth isLoading={isSubmitting}>
        Submit
      </Button>
    </Card>
  )
}
```
