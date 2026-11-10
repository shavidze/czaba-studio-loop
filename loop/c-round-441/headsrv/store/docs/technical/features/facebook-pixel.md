# Facebook Pixel ინტეგრაცია

## შესავალი

Facebook Pixel არის Meta-ს თრექინგ კოდი, რომელიც გვეხმარება:
- გავიგოთ ვინ მოდის Facebook/Instagram რეკლამიდან
- თრექავს conversions (ვინ იყიდა)
- შევქმნათ retargeting აუდიტორიები
- შევქმნათ Lookalike აუდიტორიები

## არქიტექტურა

```
┌─────────────────────────────────────────┐
│  CZABA Remix App                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  app/lib/facebook-pixel.ts      │   │
│  │  - FB Pixel wrapper ფუნქციები  │   │
│  │  - Event tracking              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  app/hooks/useAnalytics.ts      │   │
│  │  - React hook (GA4 + FB)       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  root.tsx                       │   │
│  │  - FB Pixel script loading     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Facebook Events Manager                │
│  Pixel ID: [შენი Pixel ID]             │
└─────────────────────────────────────────┘
```

## ფაილები

### 1. `app/lib/facebook-pixel.ts`

მთავარი utility ფაილი Facebook Pixel-თან სამუშაოდ.

**ფუნქციები:**

| ფუნქცია | აღწერა |
|---------|--------|
| `trackFBEvent(name, params)` | გაგზავნის standard event-ს |
| `trackFBCustomEvent(name, params)` | გაგზავნის custom event-ს |

**Standard Events:**

| ფუნქცია | Event Name | როდის იძახება |
|---------|------------|--------------|
| `trackFBViewContent()` | `ViewContent` | პროდუქტის გვერდზე |
| `trackFBAddToCart()` | `AddToCart` | კალათაში დამატება |
| `trackFBInitiateCheckout()` | `InitiateCheckout` | "Buy Now" დაჭერა |
| `trackFBLead()` | `Lead` | Newsletter გამოწერა |
| `trackFBCompleteRegistration()` | `CompleteRegistration` | ანგარიშის შექმნა |

**Custom Events (CZABA-სპეციფიკური):**

| ფუნქცია | Event Name | როდის იძახება |
|---------|------------|--------------|
| `trackFBPlayButtonClicked()` | `PlayButtonClicked` | მუსიკის მოსმენა |
| `trackFBStudioOpened()` | `StudioOpened` | Studio გახსნა |

### 2. `app/hooks/useAnalytics.ts`

React hook რომელიც ერთდროულად აგზავნის GA4 და FB Pixel events-ს.

```tsx
import { useAnalytics } from '~/hooks';

function MyComponent() {
  const { onAddToCart, onPlayButtonClicked } = useAnalytics();

  const handleAddToCart = () => {
    // ავტომატურად გაიგზავნება GA4-ში და FB Pixel-ში
    onAddToCart({
      productId: '123',
      productTitle: 'My Product',
      productPrice: 29.99,
      currency: 'USD',
    });
  };
}
```

### 3. `app/root.tsx`

FB Pixel script-ის ჩატვირთვა.

**ლოგიკა:**
```tsx
const shouldLoadFBPixel =
  typeof window !== 'undefined' &&
  FB_PIXEL_ID &&
  hasAnalyticsConsent();
```

- მხოლოდ client-side (არა SSR)
- მხოლოდ თუ FB Pixel ID კონფიგურირებულია
- მხოლოდ თუ მომხმარებელმა გასცა cookie consent

## Event-ების ინტეგრაცია

### AddToCart

**ფაილი:** `app/components/product/PurchaseHeader.tsx`

```tsx
import { trackFBAddToCart } from '~/lib/facebook-pixel';

const handleAddToCart = async () => {
  await addToCart(variantId);
  trackFBAddToCart({
    productId,
    productTitle,
    productPrice: price,
    currency: currencyCode,
  });
};
```

### InitiateCheckout

**ფაილი:** `app/components/product/PurchaseHeader.tsx`

```tsx
import { trackFBInitiateCheckout } from '~/lib/facebook-pixel';

const handleBuyNow = async () => {
  trackFBInitiateCheckout({
    productId,
    productTitle,
    productPrice: price,
    currency: currencyCode,
  });
  await buyNow(variantId);
};
```

### PlayButtonClicked (Custom)

**ფაილი:** `app/components/audio/AudioPreviewButton.tsx`

```tsx
import { trackFBPlayButtonClicked } from '~/lib/facebook-pixel';

const handleClick = () => {
  play(track);
  trackFBPlayButtonClicked({
    trackId: track.id,
    trackTitle: track.title,
    productHandle: track.productHandle,
  });
};
```

### StudioOpened (Custom)

**ფაილი:** `app/routes/studio.$productId.tsx`

```tsx
import { trackFBStudioOpened } from '~/lib/facebook-pixel';

useEffect(() => {
  if (!hasTrackedRef.current) {
    trackFBStudioOpened({
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
VITE_FB_PIXEL_ID=XXXXXXXXXXXXXXX
```

**Vercel-ზე:** Settings → Environment Variables → დაამატე იგივე

### Facebook Pixel ID-ის მიღება

1. შედი [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Data Sources → დააჭირე **Connect Data Sources**
3. აირჩიე **Web** → **Facebook Pixel**
4. მიეცი სახელი (მაგ: "CZABA Pixel")
5. დააკოპირე **Pixel ID** (15 ციფრიანი რიცხვი)

## რაში გამოიყენება Facebook Pixel?

### 1. Conversion Tracking

რეკლამის ეფექტურობის გაზომვა:
- რეკლამაზე დახარჯე $100
- Facebook Pixel გეუბნება: 5 კაცმა იყიდა, $250 შემოსავალი
- ROI = 150%

### 2. Retargeting

მომხმარებლების დაბრუნება:
```
მომხმარებელი:
1. დააკლიკა რეკლამას
2. შემოვიდა საიტზე
3. მოუსმინა 5 თრექს
4. დაამატა კალათაში
5. არ იყიდა, წავიდა

Facebook Pixel-ით:
→ მეორე დღეს ხედავს Instagram-ზე:
→ "დაგავიწყდა რამე? -10% კოდი: COMEBACK"
→ ბრუნდება და ყიდულობს!
```

### 3. Lookalike Audiences

მსგავსი აუდიტორიის პოვნა:
- Facebook-ს ეუბნები: აი ჩემი 100 მყიდველი
- Facebook პოულობს 10,000 მსგავს ადამიანს
- მათზე უშვებ რეკლამას
- კონვერსია უფრო მაღალია

### 4. Custom Audiences

აუდიტორიის სეგმენტაცია:
- ვინც მოუსმინა მუსიკას (PlayButtonClicked)
- ვინც გახსნა Studio (StudioOpened)
- ვინც დაამატა კალათაში მაგრამ არ იყიდა (AddToCart without Purchase)

## Debugging

### Facebook Pixel Helper

1. დააინსტალირე [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) Chrome extension
2. შედი საიტზე
3. დააკლიკე extension icon-ს
4. ნახავ რომელი events იგზავნება

### Facebook Events Manager

1. შედი [Events Manager](https://business.facebook.com/events_manager)
2. აირჩიე შენი Pixel
3. Test Events tab → გააკეთე test actions საიტზე
4. Real-time ნახავ events-ს

### Console Debugging

```javascript
// Console-ში:
window.fbq  // უნდა არსებობდეს ფუნქცია
```

## Shopify Purchase Tracking

Shopify checkout-ზე purchase event-ის თრექინგისთვის საჭიროა Custom Pixel.

**Shopify Admin → Settings → Customer events → Add custom pixel**

კოდი იხილე: `docs/technical/features/shopify-pixels.md`

## GDPR Compliance

- ✅ Cookie consent banner პირველ ვიზიტზე
- ✅ FB Pixel იტვირთება მხოლოდ consent-ის შემდეგ
- ✅ მომხმარებელს შეუძლია უარი თქვას
- ✅ გადაწყვეტილება ინახება localStorage-ში

## GA4 vs Facebook Pixel

| | GA4 | Facebook Pixel |
|---|-----|----------------|
| **დანიშნულება** | ვებ ანალიტიკა | რეკლამის ოპტიმიზაცია |
| **მწარმოებელი** | Google | Meta |
| **რეკლამა** | Google Ads | Facebook/Instagram Ads |
| **Retargeting** | Google Display Network | Facebook/Instagram |
| **უფასო ანალიტიკა** | დიახ | შეზღუდული |

**რეკომენდაცია:** ორივე გამოიყენე - GA4 ანალიტიკისთვის, FB Pixel რეკლამისთვის.
