/**
 * useAnalytics - React Hook for GA4 + Facebook Pixel Analytics
 *
 */

import { useCallback } from 'react';
import {
  trackAddToCart,
  trackAuth,
  trackBeginCheckout,
  trackEvent,
  trackNewsletterSignup,
  trackPageView,
  trackPlayButtonClicked,
  trackStudioOpened,
} from '~/lib/analytics';
import {
  trackFBAddToCart,
  trackFBCompleteRegistration,
  trackFBCustomEvent,
  trackFBEvent,
  trackFBInitiateCheckout,
  trackFBLead,
  trackFBPlayButtonClicked,
  trackFBStudioOpened,
  trackFBViewContent,
} from '~/lib/facebook-pixel';

export function useAnalytics() {
  /**
   * მუსიკის დაკვრის event (GA4 + FB)
   */
  const onPlayButtonClicked = useCallback(
    (params: {
      trackId: string;
      trackTitle: string;
      artistName?: string;
      productHandle?: string;
    }) => {
      trackPlayButtonClicked(params);
      trackFBPlayButtonClicked({
        trackId: params.trackId,
        trackTitle: params.trackTitle,
        productHandle: params.productHandle,
      });
    },
    [],
  );

  /**
   * კალათაში დამატების event (GA4 + FB)
   */
  const onAddToCart = useCallback(
    (params: {
      productId: string;
      productTitle: string;
      productPrice: number;
      currency?: string;
      productType?: string;
    }) => {
      trackAddToCart(params);
      trackFBAddToCart(params);
    },
    [],
  );

  /**
   * Checkout-ის დაწყების event (GA4 + FB)
   */
  const onBeginCheckout = useCallback(
    (params: {
      productId: string;
      productTitle: string;
      productPrice: number;
      currency?: string;
    }) => {
      trackBeginCheckout(params);
      trackFBInitiateCheckout(params);
    },
    [],
  );

  /**
   * Studio-ს გახსნის event (GA4 + FB)
   */
  const onStudioOpened = useCallback((params: { productId: string; productTitle: string }) => {
    trackStudioOpened(params);
    trackFBStudioOpened(params);
  }, []);

  /**
   * Newsletter გამოწერის event (GA4 + FB Lead)
   */
  const onNewsletterSignup = useCallback(() => {
    trackNewsletterSignup();
    trackFBLead();
  }, []);

  /**
   * ავტორიზაციის event (GA4 + FB)
   */
  const onAuth = useCallback((action: 'sign_in' | 'sign_up', method?: string) => {
    trackAuth(action, method);
    if (action === 'sign_up') {
      trackFBCompleteRegistration(method);
    }
  }, []);

  /**
   * პროდუქტის ნახვის event (FB only - ViewContent)
   */
  const onViewContent = useCallback(
    (params: {
      productId: string;
      productTitle: string;
      productPrice: number;
      currency?: string;
      productType?: string;
    }) => {
      trackFBViewContent(params);
    },
    [],
  );

  /**
   * Custom event გაგზავნა (GA4 only)
   */
  const sendEvent = useCallback(
    (eventName: string, params?: Record<string, string | number | boolean>) => {
      trackEvent(eventName, params);
    },
    [],
  );

  /**
   * Custom FB event გაგზავნა (FB only)
   */
  const sendFBEvent = useCallback(
    (eventName: string, params?: Record<string, string | number | boolean | string[]>) => {
      trackFBEvent(eventName, params);
    },
    [],
  );

  /**
   * Custom FB event გაგზავნა (FB only - trackCustom)
   */
  const sendFBCustomEvent = useCallback(
    (eventName: string, params?: Record<string, string | number | boolean | string[]>) => {
      trackFBCustomEvent(eventName, params);
    },
    [],
  );

  /**
   * Pageview გაგზავნა (GA4 only - FB sends PageView automatically)
   */
  const sendPageView = useCallback((url: string, title?: string) => {
    trackPageView(url, title);
  }, []);

  return {
    onPlayButtonClicked,
    onAddToCart,
    onBeginCheckout,
    onStudioOpened,
    onNewsletterSignup,
    onAuth,
    onViewContent,
    sendEvent,
    sendFBEvent,
    sendFBCustomEvent,
    sendPageView,
  };
}
