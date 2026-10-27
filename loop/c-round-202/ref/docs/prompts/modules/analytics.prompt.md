# Analytics & Tracking Module

> მოდულური პრომპტი Analytics სისტემის იმპლემენტაციისთვის (GA4, Facebook Pixel, GDPR)

---

## 📊 Prompt: Analytics with Consent Management

```markdown
დაამატე Analytics სისტემა Google Consent Mode v2-ით:

## არქიტექტურა

```
┌────────────────────────────────────────────────────────────┐
│                    ANALYTICS FLOW                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌──────────────┐    ┌──────────────┐  │
│  │   Cookie    │────▶│   Consent    │───▶│   Analytics  │  │
│  │   Banner    │     │    State     │    │   Tracking   │  │
│  └─────────────┘     └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  ┌─────────────┐     ┌──────────────┐    ┌──────────────┐  │
│  │ localStorage│     │  gtag()      │    │  GA4 + Pixel │  │
│  │   consent   │     │  consent()   │    │   Events     │  │
│  └─────────────┘     └──────────────┘    └──────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## ფაილების სტრუქტურა

```
app/
├── components/
│   └── analytics/
│       ├── GoogleAnalytics.tsx    # GA4 script + consent
│       ├── FacebookPixel.tsx      # FB Pixel script
│       ├── CookieConsent.tsx      # GDPR banner
│       └── index.ts
├── hooks/
│   └── useAnalytics.ts            # Unified tracking hook
└── root.tsx                       # Analytics integration
```

## Google Analytics 4 + Consent Mode v2

```tsx
// components/analytics/GoogleAnalytics.tsx

export function GoogleAnalytics() {
  const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!GA_ID) return null;

  return (
    <>
      {/* Google tag (gtag.js) - Always load */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Default consent state (denied until user accepts)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });

            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });

            // Check stored consent
            const consent = localStorage.getItem('cookie_consent');
            if (consent === 'accepted') {
              gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
              });
            }
          `,
        }}
      />
    </>
  );
}
```

## Facebook Pixel

```tsx
// components/analytics/FacebookPixel.tsx

export function FacebookPixel() {
  const PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

  if (!PIXEL_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}
```

## Cookie Consent Banner

```tsx
// components/analytics/CookieConsent.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show in browser, check if consent already given
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);

    // Update Google Consent
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }

    // Track acceptance
    if (typeof fbq !== 'undefined') {
      fbq('track', 'CompleteRegistration');
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
    // Consent stays denied (default state)
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md
                     bg-surface border border-outline rounded-2xl p-4 z-50 shadow-xl"
        >
          <p className="text-sm text-foreground mb-4">
            We use cookies to enhance your experience and analyze site traffic.
            By clicking "Accept", you consent to our use of cookies.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 py-2 text-sm text-muted hover:text-foreground
                         border border-outline rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-2 text-sm bg-brand text-brand-foreground
                         font-medium rounded-lg hover:bg-brand/90 transition-colors"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Unified Analytics Hook

```tsx
// hooks/useAnalytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

export function useAnalytics() {
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    // GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  };

  const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_path: path,
      });
    }
  };

  // E-commerce Events
  const trackViewItem = (product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  }) => {
    trackEvent('view_item', {
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      }]
    });

    // FB Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'USD',
      });
    }
  };

  const trackAddToCart = (product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) => {
    trackEvent('add_to_cart', {
      currency: 'USD',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      }]
    });

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price * product.quantity,
        currency: 'USD',
      });
    }
  };

  const trackBeginCheckout = (cart: {
    value: number;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }) => {
    trackEvent('begin_checkout', {
      currency: 'USD',
      value: cart.value,
      items: cart.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    });

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cart.items.map(i => i.id),
        value: cart.value,
        currency: 'USD',
        num_items: cart.items.length,
      });
    }
  };

  const trackPurchase = (order: {
    transactionId: string;
    value: number;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }) => {
    trackEvent('purchase', {
      transaction_id: order.transactionId,
      currency: 'USD',
      value: order.value,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    });

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: order.items.map(i => i.id),
        value: order.value,
        currency: 'USD',
        content_type: 'product',
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
  };
}
```

## Integration in root.tsx

```tsx
// root.tsx

import {
  GoogleAnalytics,
  FacebookPixel,
  CookieConsent
} from '~/components/analytics';

export default function App() {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <FacebookPixel />
        {/* ... other head elements */}
      </head>
      <body>
        <Outlet />
        <CookieConsent />
      </body>
    </html>
  );
}
```

## Usage Examples

```tsx
// Product Page
function ProductPage({ product }) {
  const { trackViewItem } = useAnalytics();

  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.title,
      price: parseFloat(product.price),
      category: product.productType,
    });
  }, [product.id]);

  return <ProductDetail product={product} />;
}

// Add to Cart
function AddToCartButton({ product, variant }) {
  const { addToCart } = useCart();
  const { trackAddToCart } = useAnalytics();

  const handleClick = async () => {
    await addToCart(variant.id);
    trackAddToCart({
      id: product.id,
      name: product.title,
      price: parseFloat(variant.price),
      quantity: 1,
    });
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

## Environment Variables

```env
# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=XXXXXXXXXXXXXXX
```

## GDPR Compliance Notes

1. **Default Denied:** Analytics must be denied by default
2. **Consent Before Tracking:** No personal data collection before consent
3. **Easy Opt-out:** Users must be able to decline easily
4. **Transparent:** Clear explanation of what cookies do
5. **Persistent Choice:** Remember user's choice
6. **Data Minimization:** Only collect what's needed
```

---

## გამოყენების მაგალითი

```
"დაამატე Analytics სისტემა analytics.prompt.md-ის მიხედვით.
GA4 ID: G-XXXXXXXXXX
Facebook Pixel: არ გვინდა
GDPR cookie banner: აუცილებელი"
```
