# GA4 Events Implementation Reference

## TypeScript Declarations

```typescript
// types/gtag.d.ts
declare global {
  interface Window {
    gtag: (
      command: "event" | "config" | "set" | "consent",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export {};
```

## Analytics Service

```typescript
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

class AnalyticsService {
  private isEnabled = false;

  init() {
    this.isEnabled = this.hasConsent();

    if (this.isEnabled && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: false,
      });
    }
  }

  private hasConsent(): boolean {
    return localStorage.getItem("analytics_consent") === "true";
  }

  pageView(path: string, title?: string) {
    if (!this.isEnabled) return;

    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title,
    });
  }

  event(name: string, params?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    window.gtag("event", name, params);
  }
}

export const analytics = new AnalyticsService();
```

## E-Commerce Events

```typescript
analytics.event("view_item", {
  currency: "USD",
  value: 49.99,
  items: [{
    item_id: "track-001",
    item_name: "Epic Trailer Music",
    item_category: "Track",
    item_category2: "Cinematic",
    price: 49.99,
    quantity: 1,
  }],
});

analytics.event("add_to_cart", {
  currency: "USD",
  value: 49.99,
  items: [{
    item_id: "track-001",
    item_name: "Epic Trailer Music",
    price: 49.99,
    quantity: 1,
  }],
});

analytics.event("begin_checkout", {
  currency: "USD",
  value: 149.97,
  items: [
    { item_id: "track-001", item_name: "Track 1", price: 49.99, quantity: 1 },
    { item_id: "track-002", item_name: "Track 2", price: 99.98, quantity: 1 },
  ],
});

analytics.event("purchase", {
  transaction_id: "order-12345",
  currency: "USD",
  value: 149.97,
  tax: 0,
  shipping: 0,
  items: [
    { item_id: "track-001", item_name: "Track 1", price: 49.99, quantity: 1 },
  ],
});
```

## Custom Events (CZABA-specific)

```typescript
analytics.event("studio_open", {
  product_id: "track-001",
  product_name: "Epic Trailer",
});

analytics.event("stem_toggle", {
  stem_name: "drums",
  action: "mute",
  product_id: "track-001",
});

analytics.event("mixdown_export", {
  format: "mp3",
  stems_count: 4,
  product_id: "track-001",
});

analytics.event("audio_play", {
  product_id: "track-001",
  play_position: 0,
});

analytics.event("audio_complete", {
  product_id: "track-001",
  duration: 180,
});

analytics.event("search", {
  search_term: "epic trailer",
  results_count: 15,
});

analytics.event("filter_apply", {
  filter_type: "genre",
  filter_value: "Cinematic",
});
```

## Remix Integration

```typescript
// root.tsx
import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { analytics } from "~/services/analytics";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location.pathname]);

  return <Outlet />;
}
```

## Consent Management

```typescript
function CookieConsent() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("analytics_consent_asked")) {
      setShown(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("analytics_consent", "true");
    localStorage.setItem("analytics_consent_asked", "true");
    analytics.init();
    setShown(false);
  };

  const handleDecline = () => {
    localStorage.setItem("analytics_consent", "false");
    localStorage.setItem("analytics_consent_asked", "true");
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-card p-4 rounded-lg shadow-lg">
      <p>We use analytics to improve your experience.</p>
      <div className="flex gap-2 mt-2">
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleDecline}>Decline</button>
      </div>
    </div>
  );
}
```
