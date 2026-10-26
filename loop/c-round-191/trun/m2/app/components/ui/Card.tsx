import { forwardRef } from 'react';

/**
 * CZABA Design System - Card Component
 *
 * Variants:
 * - default: Standard card with surface background
 * - elevated: Slightly elevated appearance
 * - outline: Border emphasis, transparent bg
 * - interactive: Hover effects for clickable cards
 *
 * @see docs/design/DESIGN_SYSTEM.md
 */

type CardVariant = 'default' | 'elevated' | 'outline' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: 'div' | 'article' | 'section';
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: ['bg-surface', 'border border-outline'].join(' '),

  elevated: ['bg-elevated', 'border border-outline', 'shadow-md'].join(' '),

  outline: ['bg-transparent', 'border-2 border-outline'].join(' '),

  interactive: [
    'bg-surface',
    'border border-outline',
    'transition-all duration-150',
    'hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5',
    'cursor-pointer',
  ].join(' '),
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      as: Component = 'div',
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={['rounded-lg', variantStyles[variant], paddingStyles[padding], className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Card.displayName = 'Card';

// ============================================
// Card Header
// ============================================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={['mb-4', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  },
);

CardHeader.displayName = 'CardHeader';

// ============================================
// Card Title
// ============================================

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  children: React.ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className = '', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={['text-lg font-semibold text-foreground', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

CardTitle.displayName = 'CardTitle';

// ============================================
// Card Description
// ============================================

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={['text-sm text-muted', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </p>
    );
  },
);

CardDescription.displayName = 'CardDescription';

// ============================================
// Card Content
// ============================================

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = 'CardContent';

// ============================================
// Card Footer
// ============================================

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={['mt-4 pt-4 border-t border-outline', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = 'CardFooter';
