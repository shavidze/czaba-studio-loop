import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLeadMagnet, useScrollLock } from '~/hooks';

interface LeadMagnetPopupProps {
  isLoggedIn: boolean;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LeadMagnetPopup({ isLoggedIn }: LeadMagnetPopupProps) {
  const { shouldShow, currentStep, setStep, close, submitEmail, isSubmitting, error } =
    useLeadMagnet(isLoggedIn);
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Lock body scroll when popup is visible
  useScrollLock(shouldShow);

  useEffect(() => {
    if (!shouldShow) return;
    const previous = document.activeElement;
    returnFocusRef.current = previous instanceof HTMLElement ? previous : null;
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (currentStep === 'email') dialog.querySelector('input')?.focus({ preventScroll: true });
    if (currentStep === 'success') dialog.querySelector<HTMLButtonElement>('[data-step-primary]')?.focus({ preventScroll: true });
  }, [shouldShow, currentStep]);

  if (!shouldShow) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const items = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialog)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  };

  const handleContinueToEmail = () => {
    setStep('email');
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!email) {
      setValidationError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    try {
      await submitEmail(email);
    } catch (_err) {
      // Error is handled by the hook
    }
  };

  const handleBackToSite = () => {
    close();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-magnet-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 bg-background z-[9999] flex items-center justify-center animate-fade-in"
    >
      {/* Close Button */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={close}
        className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Content Container */}
      <div className="w-full px-6 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12">
          <span id="lead-magnet-title" className="text-glow  tracking-[0.5em] uppercase">CZABA</span>
        </div>

        {/* Step 1: Initial Offer */}
        {currentStep === 'offer' && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <h2 className="text-foreground text-[32px] md:text-[38px] font-bold text-center leading-tight mb-2">
              Get Your
            </h2>
            <h2 className="text-foreground text-3xl md:text-4xl font-bold text-center mb-12">
              Tracks, Sound Effects & More
            </h2>

            <button
              type="button"
              onClick={handleContinueToEmail}
              className="
                w-full max-w-[320px]
                py-4 px-8
                bg-brand hover:bg-brand-hover
                text-background font-semibold uppercase tracking-wide
                rounded-md
                transition-colors
                cursor-pointer
              "
            >
              FREE DOWNLOAD
            </button>
          </div>
        )}

        {/* Step 2: Email Input */}
        {currentStep === 'email' && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <h2 className="text-foreground text-2xl md:text-3xl font-bold text-center mb-3">
              CONTINUE TO
            </h2>
            <h2 className="text-foreground text-2xl md:text-3xl font-bold text-center mb-12">
              CLAIM YOUR OFFER
            </h2>

            <form onSubmit={handleSubmitEmail} className="w-full max-w-[320px]">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError('');
                }}
                placeholder="Enter your email address"
                disabled={isSubmitting}
                className="
                  w-full
                  py-4 px-5
                  bg-white
                  text-black
                  rounded-md
                  border-2 border-transparent
                  placeholder:text-brand-foreground/60
                  mb-4
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />

              {(validationError || error) && (
                <p className="text-destructive text-sm mb-4 text-center">
                  {validationError || error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 bg-destructive hover:brightness-110 text-brand-foreground font-semibold uppercase tracking-wide rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'SENDING...' : 'CONTINUE'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 'success' && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            {/* Success Icon */}
            <div className="mb-8 flex items-center justify-center">
              <div className="text-6xl">✉️</div>
              <div className="text-6xl text-brand -ml-4">✓</div>
            </div>

            <h2 className="text-foreground text-xl md:text-2xl font-medium text-center mb-12 max-w-[400px]">
              We've sent your free mystery pack to your email!
            </h2>

            <button
              type="button"
              data-step-primary
              onClick={handleBackToSite}
              className="
                w-full max-w-[320px]
                py-4 px-8
                bg-brand hover:bg-brand-hover
                text-background font-semibold uppercase tracking-wide
                rounded-md
                transition-colors
                cursor-pointer
              "
            >
              BACK TO SITE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
