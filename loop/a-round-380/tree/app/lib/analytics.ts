/**
 * Google Analytics 4 - Analytics Utility
 *
 * გთავაზობს gtag wrapper ფუნქციებს GA4 event-ების გასაგზავნად.
 * მუშაობს მხოლოდ client-side და cookie consent-ის შემდეგ.
 */

// GA4 Measurement ID
export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';

// Consent storage key
const CONSENT_KEY = 'czaba_analytics_consent';

/**
 * შეამოწმებს აქვს თუ არა მომხმარებელს consent გაცემული
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

/**
 * შეინახავს მომხმარებლის consent-ს
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');

  // GA4-ს ვაცნობებთ consent-ის სტატუსს
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

/**
 * შეამოწმებს უკვე მიღებულია თუ არა გადაწყვეტილება consent-ზე
 */
export function hasConsentDecision(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) !== null;
}

/**
 * გაგზავნის event-ს GA4-ში
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
}

/**
 * გაგზავნის pageview-ს GA4-ში
 */
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_location: url,
    page_title: title,
  });
}

// ==========================================
// Custom Events - CZABA სპეციფიკური
// ==========================================

/**
 * მუსიკის დაკვრის ღილაკზე დაჭერა
 */
export function trackPlayButtonClicked(params: {
  trackId: string;
  trackTitle: string;
  artistName?: string;
  productHandle?: string;
}): void {
  trackEvent('play_button_clicked', {
    track_id: params.trackId,
    track_title: params.trackTitle,
    artist_name: params.artistName || '',
    product_handle: params.productHandle || '',
  });
}

/**
 * პროდუქტის კალათაში დამატება
 */
export function trackAddToCart(params: {
  productId: string;
  productTitle: string;
  productPrice: number;
  currency?: string;
  productType?: string;
}): void {
  trackEvent('add_to_cart', {
    currency: params.currency || 'USD',
    value: params.productPrice,
    items: JSON.stringify([
      {
        item_id: params.productId,
        item_name: params.productTitle,
        price: params.productPrice,
        item_category: params.productType || 'Audio',
      },
    ]),
  });
}

/**
 * Checkout-ის დაწყება (Buy Now დაჭერა)
 */
export function trackBeginCheckout(params: {
  productId: string;
  productTitle: string;
  productPrice: number;
  currency?: string;
}): void {
  trackEvent('begin_checkout', {
    currency: params.currency || 'USD',
    value: params.productPrice,
    items: JSON.stringify([
      {
        item_id: params.productId,
        item_name: params.productTitle,
        price: params.productPrice,
      },
    ]),
  });
}

/**
 * Studio-ს გახსნა
 */
export function trackStudioOpened(params: { productId: string; productTitle: string }): void {
  trackEvent('studio_opened', {
    product_id: params.productId,
    product_title: params.productTitle,
  });
}

/**
 * Newsletter გამოწერა
 */
export function trackNewsletterSignup(): void {
  trackEvent('newsletter_signup');
}

/**
 * Sign in / Sign up
 */
export function trackAuth(action: 'sign_in' | 'sign_up', method?: string): void {
  trackEvent(action, {
    method: method || 'email',
  });
}

// TypeScript declarations for analytics
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'consent',
      targetOrAction: string,
      params?: Record<string, unknown>,
    ) => void;
    dataLayer: unknown[];
    fbq: (command: string, eventOrPixelId: string, params?: Record<string, unknown>) => void;
  }
}
