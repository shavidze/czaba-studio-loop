import { forwardRef, useCallback, useState } from 'react';
import { cn } from '~/lib/utils';
import type { GuestInfo } from './types';

interface GuestFormProps {
  onSubmit: (info: GuestInfo) => void;
}

export const GuestForm = forwardRef<HTMLDivElement, GuestFormProps>(({ onSubmit }, ref) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = useCallback(() => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validate()) {
        onSubmit({ name: name.trim(), email: email.trim() });
      }
    },
    [name, email, validate, onSubmit],
  );

  return (
    <div ref={ref} className="flex flex-col h-full p-6">
      <div className="mb-6 text-center">
        <h3 className="text-foreground font-semibold text-lg mb-2">Start a conversation</h3>
        <p className="text-muted text-sm">Please fill in your details</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div>
          <label htmlFor="guest-name" className="block text-sm text-muted mb-1.5">
            Name
          </label>
          <input
            id="guest-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={cn(
              'w-full px-3 py-2.5',
              'bg-elevated border rounded-lg',
              'text-foreground text-sm placeholder:text-dim',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand/20',
              errors.name
                ? 'border-destructive focus:border-destructive'
                : 'border-outline-strong focus:border-brand',
            )}
          />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="guest-email" className="block text-sm text-muted mb-1.5">
            Email
          </label>
          <input
            id="guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={cn(
              'w-full px-3 py-2.5',
              'bg-elevated border rounded-lg',
              'text-foreground text-sm placeholder:text-dim',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand/20',
              errors.email
                ? 'border-destructive focus:border-destructive'
                : 'border-outline-strong focus:border-brand',
            )}
          />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mt-auto pt-4">
          <button
            type="submit"
            className={cn(
              'w-full px-4 py-3',
              'bg-brand text-background font-semibold',
              'rounded-lg',
              'transition-all duration-150',
              'hover:bg-brand-hover hover:shadow-glow',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              'cursor-pointer',
            )}
          >
            Start Chat
          </button>
        </div>
      </form>
    </div>
  );
});

GuestForm.displayName = 'GuestForm';
