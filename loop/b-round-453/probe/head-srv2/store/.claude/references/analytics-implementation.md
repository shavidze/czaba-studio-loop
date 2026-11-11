# Analytics Implementation Reference

## არსებული Events

**GA4 Events:**
```typescript
trackPlayButtonClicked({ trackId, trackTitle, artistName, productHandle })
trackAddToCart({ productId, productTitle, productPrice, currency, productType })
trackBeginCheckout({ productId, productTitle, productPrice, currency })
trackStudioOpened({ productId, productTitle })
trackNewsletterSignup()
trackAuth('sign_in' | 'sign_up', method)
trackEvent(eventName, params)
trackPageView(url, title)
```

**Facebook Pixel Events:**
```typescript
trackFBViewContent({ productId, productTitle, productPrice, currency, productType })
trackFBAddToCart({ ... })
trackFBInitiateCheckout({ ... })
trackFBLead()
trackFBCompleteRegistration(method)
trackFBPlayButtonClicked({ trackId, trackTitle, productHandle })
trackFBStudioOpened({ productId, productTitle })
```

## useAnalytics Hook

```typescript
const {
  onPlayButtonClicked,   // GA4 + FB
  onAddToCart,           // GA4 + FB
  onBeginCheckout,       // GA4 + FB
  onStudioOpened,        // GA4 + FB
  onNewsletterSignup,    // GA4 + FB Lead
  onAuth,                // GA4 + FB
  onViewContent,         // FB only
  sendEvent,             // GA4 custom
  sendFBEvent,           // FB standard
  sendFBCustomEvent,     // FB custom
  sendPageView,          // GA4 pageview
} = useAnalytics();
```

## Implementation Pattern

```typescript
// კომპონენტში
const { onAddToCart } = useAnalytics();

const handleAddToCart = async () => {
  await addToCart(productId);

  // Track after successful action
  onAddToCart({
    productId: product.id,
    productTitle: product.title,
    productPrice: parseFloat(product.price),
    currency: 'USD',
    productType: product.type,
  });
};
```

## Studio-სპეციფიკური Tracking

```typescript
// Studio session events
studio_opened           // Entry
studio_stem_loaded      // Each stem load
studio_play             // Play clicked
studio_pause            // Pause clicked
studio_solo_toggle      // Solo action
studio_mute_toggle      // Mute action
studio_volume_change    // Volume adjusted
studio_export_started   // Export initiated
studio_export_completed // Export success
studio_export_failed    // Export error
studio_session_duration // Time spent (on exit)

// Implementation
export function trackStudioEvent(
  action: string,
  params?: Record<string, string | number>
) {
  trackEvent(`studio_${action}`, {
    ...params,
    session_id: studioSessionId,
    timestamp: Date.now(),
  });
}
```

## Debug Mode

```typescript
// Environment variable
VITE_ANALYTICS_DEBUG=true

// Chrome DevTools
// 1. GA4 DebugView: GA4 Admin → DebugView
// 2. Facebook Pixel Helper (Chrome extension)
// 3. Network tab → filter "collect" (GA4) or "facebook" (FB)

// Browser console
window.gtag('event', 'test_event', { test: true });
window.fbq('track', 'TestEvent', { test: true });
```

## New Event Implementation Checklist

```
[ ] Event name: snake_case, < 40 chars
[ ] GA4 function: lib/analytics.ts
[ ] FB function: lib/facebook-pixel.ts
[ ] Hook update: hooks/useAnalytics.ts
[ ] Component integration
[ ] Debug mode test
[ ] GA4 DebugView verification
[ ] FB Pixel Helper verification
[ ] Custom dimension registration (if needed)
```

## New Event Template

```typescript
// lib/analytics.ts
export function trackNewEvent(params: {
  requiredParam: string;
  optionalParam?: number;
}): void {
  trackEvent('new_event_name', {
    required_param: params.requiredParam,
    optional_param: params.optionalParam || 0,
  });
}

// lib/facebook-pixel.ts
export function trackFBNewEvent(params: {
  requiredParam: string;
}): void {
  trackFBCustomEvent('NewEventName', {
    content_ids: [params.requiredParam],
  });
}

// hooks/useAnalytics.ts
const onNewEvent = useCallback((params: { ... }) => {
  trackNewEvent(params);
  trackFBNewEvent(params);
}, []);
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Event არ იგზავნება | consent არ არის granted | Check `hasAnalyticsConsent()` |
| Duplicate events | useEffect deps wrong | Use empty deps `[]` |
| Parameters არ ჩანს | Unregistered in GA4 | Register custom dimensions |
| FB Pixel Warning | Missing params | Add content_ids, content_type |
