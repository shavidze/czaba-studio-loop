import React from "react";
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'buy' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand text-background',
    'hover:bg-brand-hover',
    'active:opacity-90',
    'shadow-sm',
  ].join(' '),

  secondary: [
    'bg-elevated text-foreground',
    'border border-outline',
    'hover:bg-outline hover:border-outline-hover',
    'active:opacity-90',
  ].join(' '),

  ghost: [
    'bg-transparent text-muted',
    'hover:bg-elevated hover:text-foreground',
    'active:opacity-90',
  ].join(' '),

  accent: [
    'bg-accent text-background',
    'hover:brightness-110',
    'active:opacity-90',
    'shadow-sm',
  ].join(' '),

  buy: [
    'bg-buy text-brand-foreground',
    'hover:bg-buy-hover',
    'active:opacity-90',
    'shadow-sm',
  ].join(' '),

  destructive: [
    'bg-destructive text-brand-foreground',
    'hover:bg-destructive/90',
    'active:opacity-90',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const shapeStyles: Record<ButtonShape, string> = {
  default: 'rounded-md',
  pill: 'rounded-full',
};

export interface ButtonClassNameParams {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function buildButtonClassName({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  fullWidth = false,
  isDisabled = false,
  className = '',
}: ButtonClassNameParams): string {
  return [
    'inline-flex items-center justify-center',
    `font-semibold ${shapeStyles[shape]}`,
    'transition-all duration-150',
    'cursor-pointer',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'default',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={buildButtonClassName({
          variant,
          size,
          shape,
          fullWidth,
          isDisabled,
          className,
        })}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />,
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />,
);
SecondaryButton.displayName = 'SecondaryButton';

export const GhostButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />,
);
GhostButton.displayName = 'GhostButton';

export const AccentButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="accent" {...props} />,
);
AccentButton.displayName = 'AccentButton';
