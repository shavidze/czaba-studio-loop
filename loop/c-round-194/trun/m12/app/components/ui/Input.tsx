import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';

/**
 * CZABA Design System - Input Component
 *
 * Features:
 * - Floating label animation
 * - Error state with icon
 * - Password visibility toggle
 * - Disabled state
 * - Design system tokens
 *
 * @see docs/design/DESIGN_SYSTEM.md
 */

type InputVariant = 'default' | 'filled';
type InputSize = 'md' | 'lg';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  onChange?: (value: string) => void;
  onChangeEvent?: React.ChangeEventHandler<HTMLInputElement>;
}

// Base input styles using design system tokens
const baseInputStyles = [
  'w-full',
  'bg-surface',
  'border-2 border-outline',
  'rounded-md',
  'text-foreground',
  'placeholder-transparent',
  'transition-all duration-150',
  'focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10',
  'peer',
].join(' ');

const variantStyles: Record<InputVariant, string> = {
  default: 'bg-surface',
  filled: 'bg-elevated',
};

const sizeStyles: Record<InputSize, string> = {
  md: 'px-4 pt-6 pb-2 text-base',
  lg: 'px-4 pt-7 pb-2.5 text-base',
};

// Label position classes - must be complete strings for Tailwind to detect
const labelStyles = {
  md: {
    // When placeholder shown (empty input) - centered
    base: 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
    // When focused or has value - floated to top
    focused: 'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs',
    filled:
      'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
  },
  lg: {
    base: 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
    focused: 'peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs',
    filled:
      'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
  },
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      variant = 'default',
      size = 'md',
      disabled,
      className = '',
      type = 'text',
      onChange,
      onChangeEvent,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
      if (onChangeEvent) {
        onChangeEvent(e);
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          placeholder=" "
          onChange={handleChange}
          className={[
            baseInputStyles,
            variantStyles[variant],
            sizeStyles[size],
            error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        <label
          htmlFor={id}
          className={[
            'absolute left-4',
            'transition-all duration-200',
            'pointer-events-none',
            // Base state (when empty)
            labelStyles[size].base,
            // Focus state
            labelStyles[size].focused,
            // Filled state (has value)
            labelStyles[size].filled,
            // Color
            error ? 'text-destructive' : 'text-muted peer-focus:text-brand',
          ].join(' ')}
        >
          {label}
        </label>
        {error && (
          <p className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ============================================
// Password Input with visibility toggle
// ============================================

interface PasswordInputProps extends Omit<InputProps, 'type'> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`pr-12 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

// ============================================
// Textarea variant
// ============================================

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  error?: string;
  variant?: InputVariant;
  onChange?: (value: string) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      variant = 'default',
      disabled,
      className = '',
      onChange,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          placeholder=" "
          onChange={(e) => onChange?.(e.target.value)}
          className={[
            'w-full px-4 pt-6 pb-2 min-h-[120px]',
            'bg-surface border-2 border-outline-strong rounded-md',
            'text-foreground placeholder-transparent',
            'transition-all duration-150',
            'focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10',
            'resize-y peer',
            variantStyles[variant],
            error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        <label
          htmlFor={id}
          className={[
            'absolute left-4 top-2 text-xs',
            'transition-all duration-200',
            'pointer-events-none',
            error ? 'text-destructive' : 'text-muted peer-focus:text-brand',
          ].join(' ')}
        >
          {label}
        </label>
        {error && (
          <p className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
