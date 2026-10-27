# Google Analytics 4 (GA4) ინტეგრაცია

## შესავალი

GA4 (Google Analytics 4) არის Google-ის ანალიტიკის ინსტრუმენტი, რომელიც გვეხმარება გავიგოთ:
- რამდენი მომხმარებელი მოდის საიტზე
- საიდან მოდიან (Google, Facebook, პირდაპირი)
- რას აკეთებენ საიტზე
- რომელ პროდუქტებს ყიდულობენ

## არქიტექტურა

```
┌─────────────────────────────────────────┐
│  CZABA Remix App                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  app/lib/analytics.ts           │   │
│  │  - GA4 wrapper ფუნქციები       │   │
│  │  - Event tracking              │   │
│  │  - Consent management          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  app/hooks/useAnalytics.ts      │   │
│  │  - React hook კომპონენტებში    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  CookieConsent.tsx              │   │
│  │  - GDPR consent banner         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  root.tsx                       │   │
│  │  - GA4 script loading          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Google Analytics 4                     │
│  Property ID: G-C1SGC7W3WV             │
└─────────────────────────────────────────┘
```

## ფაილები

### 1. `app/lib/analytics.ts`

მთავარი utility ფაილი GA4-თან სამუშაოდ.

**ფუნქციები:**

| ფუნქცია | აღწერა |
|---------|--------|
| `hasAnalyticsConsent()` | ამოწმებს მომხმარებელს აქვს თუ არა consent გაცემული |
| `setAnalyticsConsent(granted)` | ინახავს consent-ს localStorage-ში |
| `hasConsentDecision()` | ამოწმებს მიღებულია თუ არა გადაწყვეტილება |
| `trackEvent(name, params)` | გაგზავნის ნებისმიერ event-ს GA4-ში |
| `trackPageView(url, title)` | გაგზავნის pageview-ს |

**Custom Events:**

| ფუნქცია | Event Name | როდის იძახება |
|---------|------------|--------------|
| `trackPlayButtonClicked()` | `play_button_clicked` | მომხმარებელი აჭერს Play ღილაკს |
| `trackAddToCart()` | `add_to_cart` | პროდუქტი ემატება კალათაში |
| `trackBeginCheckout()` | `begin_checkout` | მომხმარებელი აჭერს "Buy Now" |
| `trackStudioOpened()` | `studio_opened` | იხსნება Personal Mixdown Studio |
| `trackNewsletterSignup()` | `newsletter_signup` | იწერება newsletter-ზე |
| `trackAuth()` | `sign_in` / `sign_up` | ავტორიზაცია |

### 2. `app/hooks/useAnalytics.ts`

React hook კომპონენტებში გამოსაყენებლად.

```tsx
import { useAnalytics } from '~/hooks';

function MyComponent() {
  const { onPlayButtonClicked, onAddToCart } = useAnalytics();

  const handlePlay = () => {
    onPlayButtonClicked({
      trackId: '123',
      trackTitle: 'My Track',
      artistName: 'Artist',
    });
  };
}
```

### 3. `app/components/common/CookieConsent.tsx`

GDPR-სთვის აუცილებელი cookie consent banner.

**ქცევა:**
- გამოჩნდება 1.5 წამის დაყოვნებით
- თუ უკვე მიღებულია გადაწყვეტილება, არ გამოჩნდება
- "მიღება" → ჩართავს GA4-ს და გადატვირთავს გვერდს
- "უარყოფა" → GA4 არ ჩაიტვირთება

**localStorage key:** `czaba_analytics_consent`
- `'granted'` - consent გაცემულია
- `'denied'` - უარყოფილია

### 4. `app/root.tsx`

GA4 script-ის ჩატვირთვა.

**ლოგიკა:**
```tsx
const shouldLoadGA4 =
  typeof window !== 'undefined' &&
  GA4_MEASUREMENT_ID &&
  hasAnalyticsConsent();
```

- მხოლოდ client-side (არა SSR)
- მხოლოდ თუ GA4 ID კონფიგურირებულია
- მხოლოდ თუ მომხმარებელმა გასცა consent

## Event-ების ინტეგრაცია

### play_button_clicked

**ფაილი:** `app/components/audio/AudioPreviewButton.tsx`

```tsx
import { trackPlayButtonClicked } from '~/lib/analytics';

const handleClick = () => {
  if (!isPlaying) {
    play(track);
    trackPlayButtonClicked({
      trackId: track.id,
      trackTitle: track.title,
      artistName: track.artist,
      productHandle: track.productHandle,
    });
  }
};
```

### add_to_cart

**ფაილი:** `app/components/product/PurchaseHeader.tsx`

```tsx
import { trackAddToCart } from '~/lib/analytics';

const handleAddToCart = async () => {
  await addToCart(variantId);
  trackAddToCart({
    productId,
    productTitle,
    productPrice: price,
    currency: currencyCode,
  });
};
```

### begin_checkout

**ფაილი:** `app/components/product/PurchaseHeader.tsx`

```tsx
import { trackBeginCheckout } from '~/lib/analytics';

const handleBuyNow = async () => {
  trackBeginCheckout({
    productId,
    productTitle,
    productPrice: price,
    currency: currencyCode,
  });
  await buyNow(variantId);
};
```

### studio_opened

**ფაილი:** `app/routes/studio.$productId.tsx`

```tsx
import { trackStudioOpened } from '~/lib/analytics';

useEffect(() => {
  if (!hasTrackedRef.current) {
    trackStudioOpened({
      productId: product.id,
      productTitle: product.title,
    });
    hasTrackedRef.current = true;
  }
}, [product]);
```

## კონფიგურაცია

### Environment Variable

`.env` ფაილში:
```
VITE_GA4_MEASUREMENT_ID=G-C1SGC7W3WV
```

**Vercel-ზე:** Settings → Environment Variables → დაამატე იგივე

### GA4 Console

1. შედი: https://analytics.google.com
2. აირჩიე Property: `G-C1SGC7W3WV`
3. Reports → Realtime → ნახე live მონაცემები
4. Reports → Engagement → Events → ნახე custom events

## Shopify Integration

**პრობლემა:** Shopify checkout სხვა დომეინზეა, Remix-ის GA4 ვერ თრექავს.

**გადაწყვეტა:** Shopify Admin → Settings → Customer events → Custom Pixel

```javascript
const GA4_ID = 'G-C1SGC7W3WV';

// Load gtag
const script = document.createElement('script');
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', GA4_ID);

// Purchase event
analytics.subscribe('checkout_completed', (event) => {
  gtag('event', 'purchase', {
    transaction_id: event.data.checkout.order.id,
    value: event.data.checkout.totalPrice.amount,
    currency: event.data.checkout.totalPrice.currencyCode,
  });
});
```

## Debugging

### Chrome DevTools

1. გახსენი Console
2. ჩაწერე: `window.dataLayer`
3. ნახე გაგზავნილი events

### GA4 DebugView

1. GA4 Console → Configure → DebugView
2. დააინსტალირე [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger)
3. ჩართე extension და განაახლე გვერდი
4. DebugView-ში real-time ნახავ events-ს

### localStorage Check

```javascript
// Console-ში:
localStorage.getItem('czaba_analytics_consent')
// → 'granted' ან 'denied' ან null
```

## რა ინფორმაციას ვაგროვებთ

| Event | Parameters |
|-------|------------|
| `play_button_clicked` | track_id, track_title, artist_name, product_handle |
| `add_to_cart` | product_id, product_title, price, currency |
| `begin_checkout` | product_id, product_title, price, currency |
| `studio_opened` | product_id, product_title |
| `page_view` | page_location, page_title |

## GDPR Compliance

- ✅ Cookie consent banner პირველ ვიზიტზე
- ✅ GA4 იტვირთება მხოლოდ consent-ის შემდეგ
- ✅ მომხმარებელს შეუძლია უარი თქვას
- ✅ გადაწყვეტილება ინახება localStorage-ში

## დაკავშირებული დოკუმენტაცია

- [Facebook Pixel ინტეგრაცია](./facebook-pixel.md) - FB/Instagram რეკლამებისთვის
- [Shopify Custom Pixels](./shopify-pixels.md) - Purchase tracking Shopify checkout-ზე

## შემდეგი ნაბიჯები

1. ✅ **Facebook Pixel** - FB/Instagram რეკლამებისთვის
2. ⏳ **Shopify Custom Pixel** - purchase event-ის თრექინგი
3. ⏳ **Conversion Tracking** - Google Ads-თან დაკავშირება
4. ⏳ **Enhanced E-commerce** - უფრო დეტალური product tracking
5. ⏳ **User ID Tracking** - ავტორიზებული მომხმარებლების თრექინგი
