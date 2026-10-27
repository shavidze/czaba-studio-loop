import { forwardRef } from 'react';

/**
 * CZABA Design System - IconButton Component
 *
 * Icon-only buttons for actions like close, play, settings, etc.
 *
 * @see docs/design/DESIGN_SYSTEM.md
 */

type IconButtonVariant = 'default' | 'ghost' | 'brand';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  label: string; // Required for accessibility
  children: React.ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: [
    'bg-elevated text-foreground',
    'border border-outline',
    'hover:bg-outline hover:text-brand',
    'active:scale-95',
  ].join(' '),

  ghost: [
    'bg-transparent text-muted',
    'hover:bg-elevated hover:text-foreground',
    'active:scale-95',
  ].join(' '),

  brand: [
    'bg-brand text-background',
    'hover:bg-brand-hover',
    'active:scale-95',
    'shadow-sm hover:shadow-glow',
  ].join(' '),
};

const sizeStyles: Record<IconButtonSize, { button: string; icon: number }> = {
  sm: { button: 'w-8 h-8', icon: 16 },
  md: { button: 'w-10 h-10', icon: 20 },
  lg: { button: 'w-12 h-12', icon: 24 },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { variant = 'default', size = 'md', label, disabled, className = '', children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={[
          // Base styles
          'inline-flex items-center justify-center',
          'rounded-lg',
          'transition-all duration-150',
          'cursor-pointer',

          // Variant styles
          variantStyles[variant],

          // Size styles
          sizeStyles[size].button,

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',

          // Custom classes
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';

// Export size mapping for icon sizing
export const iconButtonSizes = sizeStyles;
