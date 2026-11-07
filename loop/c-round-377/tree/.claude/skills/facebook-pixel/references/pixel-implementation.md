# Facebook Pixel Implementation Reference

## TypeScript Declarations

```typescript
// types/fbq.d.ts
declare global {
  interface Window {
    fbq: (
      command: "init" | "track" | "trackCustom",
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};
```

## Pixel Service

```typescript
const PIXEL_ID = "YOUR_PIXEL_ID";

class FacebookPixelService {
  private isEnabled = false;

  init() {
    this.isEnabled = this.hasConsent();

    if (this.isEnabled && typeof window !== "undefined" && window.fbq) {
      window.fbq("init", PIXEL_ID);
    }
  }

  private hasConsent(): boolean {
    return localStorage.getItem("marketing_consent") === "true";
  }

  track(event: string, params?: Record<string, unknown>) {
    if (!this.isEnabled) return;
    window.fbq("track", event, params);
  }

  trackCustom(event: string, params?: Record<string, unknown>) {
    if (!this.isEnabled) return;
    window.fbq("trackCustom", event, params);
  }

  pageView() {
    if (!this.isEnabled) return;
    window.fbq("track", "PageView");
  }
}

export const fbPixel = new FacebookPixelService();
```

## Standard Events

```typescript
fbPixel.track("ViewContent", {
  content_name: "Epic Trailer Music",
  content_category: "Track",
  content_ids: ["track-001"],
  content_type: "product",
  value: 49.99,
  currency: "USD",
});

fbPixel.track("AddToCart", {
  content_name: "Epic Trailer Music",
  content_ids: ["track-001"],
  content_type: "product",
  value: 49.99,
  currency: "USD",
});

fbPixel.track("InitiateCheckout", {
  content_ids: ["track-001", "track-002"],
  content_type: "product",
  num_items: 2,
  value: 149.97,
  currency: "USD",
});

fbPixel.track("Purchase", {
  content_ids: ["track-001"],
  content_type: "product",
  value: 49.99,
  currency: "USD",
  num_items: 1,
});

fbPixel.track("Lead", {
  content_name: "Newsletter Signup",
  content_category: "Marketing",
});

fbPixel.track("CompleteRegistration", {
  content_name: "Account Created",
  status: true,
});

fbPixel.track("Search", {
  search_string: "epic trailer",
  content_category: "Track",
});
```

## Custom Events (CZABA-specific)

```typescript
fbPixel.trackCustom("StudioOpen", {
  product_id: "track-001",
  product_name: "Epic Trailer",
});

fbPixel.trackCustom("MixdownExport", {
  product_id: "track-001",
  format: "mp3",
  stems_used: 4,
});

fbPixel.trackCustom("AudioPreview", {
  product_id: "track-001",
  duration: 30,
});

fbPixel.trackCustom("LicenseSelect", {
  product_id: "track-001",
  license_type: "Extended",
  value: 199.99,
});
```

## E-Commerce Flow Hook

```typescript
function usePurchaseTracking() {
  const trackViewContent = (product: Product) => {
    fbPixel.track("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "USD",
    });
  };

  const trackAddToCart = (product: Product) => {
    fbPixel.track("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      value: product.price,
      currency: "USD",
    });
  };

  const trackCheckout = (cart: CartItem[]) => {
    fbPixel.track("InitiateCheckout", {
      content_ids: cart.map(item => item.productId),
      num_items: cart.length,
      value: cart.reduce((sum, item) => sum + item.price, 0),
      currency: "USD",
    });
  };

  const trackPurchase = (order: Order) => {
    fbPixel.track("Purchase", {
      content_ids: order.items.map(item => item.productId),
      content_type: "product",
      value: order.total,
      currency: "USD",
      num_items: order.items.length,
    });
  };

  return { trackViewContent, trackAddToCart, trackCheckout, trackPurchase };
}
```

## Retargeting Audiences

| Audience | Event | Window |
|----------|-------|--------|
| Site visitors | PageView | 180 days |
| Product viewers | ViewContent | 30 days |
| Cart abandoners | AddToCart (no Purchase) | 14 days |
| Purchasers | Purchase | 180 days |
| Studio users | StudioOpen | 60 days |
