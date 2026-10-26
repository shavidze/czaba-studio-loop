/**
 * Facebook Pixel - Analytics Utility
 *
 * გთავაზობს fbq wrapper ფუნქციებს Facebook Pixel event-ების გასაგზავნად.
 * მუშაობს მხოლოდ client-side და cookie consent-ის შემდეგ.
 */

import { hasAnalyticsConsent } from './analytics';

// Facebook Pixel ID
export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || '';

/**
 * გაგზავნის event-ს Facebook Pixel-ში
 */
export function trackFBEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | string[]>,
): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.fbq !== 'function') return;

  window.fbq('track', eventName, params);
}

/**
 * გაგზავნის custom event-ს Facebook Pixel-ში
 */
export function trackFBCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | string[]>,
): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.fbq !== 'function') return;

  window.fbq('trackCustom', eventName, params);
}

// ==========================================
// Standard Facebook Events
// ==========================================

/**
 * ViewContent - პროდუქტის ნახვა
 */
export function trackFBViewContent(params: {
  productId: string;
  productTitle: string;
  productPrice: number;
  currency?: string;
  productType?: string;
}): void {
  trackFBEvent('ViewContent', {
    content_ids: [params.productId],
    content_name: params.productTitle,
    content_type: 'product',
    content_category: params.productType || 'Audio',
    value: params.productPrice,
    currency: params.currency || 'USD',
  });
}

/**
 * AddToCart - კალათაში დამატება
 */
export function trackFBAddToCart(params: {
  productId: string;
  productTitle: string;
  productPrice: number;
  currency?: string;
  productType?: string;
}): void {
  trackFBEvent('AddToCart', {
    content_ids: [params.productId],
    content_name: params.productTitle,
    content_type: 'product',
    value: params.productPrice,
    currency: params.currency || 'USD',
  });
}

/**
 * InitiateCheckout - Checkout-ის დაწყება
 */
export function trackFBInitiateCheckout(params: {
  productId: string;
  productTitle: string;
  productPrice: number;
  currency?: string;
}): void {
  trackFBEvent('InitiateCheckout', {
    content_ids: [params.productId],
    content_name: params.productTitle,
    content_type: 'product',
    value: params.productPrice,
    currency: params.currency || 'USD',
    num_items: 1,
  });
}

/**
 * Lead - Newsletter signup
 */
export function trackFBLead(): void {
  trackFBEvent('Lead');
}

/**
 * CompleteRegistration - ანგარიშის შექმნა
 */
export function trackFBCompleteRegistration(method?: string): void {
  trackFBEvent('CompleteRegistration', {
    content_name: method || 'email',
  });
}

// ==========================================
// Custom Events - CZABA სპეციფიკური
// ==========================================

/**
 * მუსიკის დაკვრის event
 */
export function trackFBPlayButtonClicked(params: {
  trackId: string;
  trackTitle: string;
  productHandle?: string;
}): void {
  trackFBCustomEvent('PlayButtonClicked', {
    content_ids: [params.trackId],
    content_name: params.trackTitle,
    product_handle: params.productHandle || '',
  });
}

/**
 * Studio გახსნის event
 */
export function trackFBStudioOpened(params: { productId: string; productTitle: string }): void {
  trackFBCustomEvent('StudioOpened', {
    content_ids: [params.productId],
    content_name: params.productTitle,
  });
}
