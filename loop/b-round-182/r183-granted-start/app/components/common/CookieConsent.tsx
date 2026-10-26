/**
 * CookieConsent - მინიმალისტური Cookie Consent Banner
 *
 * GDPR-სთვის აუცილებელი consent მექანიზმი.
 * გამოჩნდება ქვემოთ და გაქრება გადაწყვეტილების შემდეგ.
 */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GA4_MEASUREMENT_ID, hasConsentDecision, setAnalyticsConsent } from '~/lib/analytics';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // თუ GA4 არ არის კონფიგურირებული, არ ვაჩვენოთ
    if (!GA4_MEASUREMENT_ID) return;

    // თუ უკვე მიღებულია გადაწყვეტილება, არ ვაჩვენოთ
    if (hasConsentDecision()) return;

    // პატარა დაყოვნება რომ არ გამოჩნდეს მაშინვე
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setIsVisible(false);

    // Facebook Pixel consent grant + PageView
    if (typeof window.fbq === 'function') {
      window.fbq('consent', 'grant');
      window.fbq('track', 'PageView');
    }
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Text */}
        <p className="text-sm text-muted text-center sm:text-left">
          We use cookies to enhance your experience.{' '}
          <a
            href="/privacy"
            className="text-foreground underline underline-offset-2 hover:text-brand transition-colors"
          >
            Privacy Policy
          </a>
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-neutral-100 transition-colors"
          >
            Accept
          </button>
        </div>

        {/* Close button (acts as decline) */}
        <button
          onClick={handleDecline}
          className="absolute top-2 right-2 sm:hidden p-2 text-dim hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
