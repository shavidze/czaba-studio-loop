# Dashboard System - დეტალური გზამკვლევი

## სარჩევი
1. [არქიტექტურის მიმოხილვა](#არქიტექტურის-მიმოხილვა)
2. [Route Protection (RequireAuth)](#route-protection-requireauth)
3. [My Orders გვერდი](#my-orders-გვერდი)
4. [My Downloads გვერდი](#my-downloads-გვერდი)
5. [Data Flow დიაგრამა](#data-flow-დიაგრამა)

---

## არქიტექტურის მიმოხილვა

Dashboard სისტემა შედგება სამი ძირითადი ნაწილისგან:

```
┌─────────────────────────────────────────────────────────────┐
│                      Dashboard System                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ RequireAuth  │───▶│  My Orders   │    │ My Downloads │   │
│  │  (Guard)     │    │   (გვერდი)   │    │   (გვერდი)   │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Shopify Storefront API                   │   │
│  │         (Source of Truth - წყარო)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### ძირითადი პრინციპები:

1. **Shopify = Source of Truth**: ყველა მონაცემი მოდის Shopify-დან
2. **Client-side Fetching**: მონაცემები იტვირთება კლიენტის მხარეს (არა SSR)
3. **Token-based Auth**: Shopify Customer Access Token გამოიყენება ავტორიზაციისთვის

---

## Route Protection (RequireAuth)

### რა არის RequireAuth?

RequireAuth არის "Guard" კომპონენტი, რომელიც იცავს გვერდებს არაავტორიზებული წვდომისგან.

### ფაილის მდებარეობა
```
app/components/auth/RequireAuth.tsx
```

### კომპონენტის სრული კოდი კომენტარებით

```tsx
import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '~/hooks';
import { Loader2, Lock } from 'lucide-react';

// ===========================================
// PROPS INTERFACE
// ===========================================

interface RequireAuthProps {
  children: ReactNode;        // დაცული კონტენტი
  fallback?: 'redirect' | 'prompt';  // რა მოხდეს თუ არ არის ავტორიზებული
  redirectTo?: string;        // სად გადამისამართდეს (redirect რეჟიმში)
}

// ===========================================
// ᲙᲝᲛᲞᲝᲜᲔᲜᲢᲘ
// ===========================================

export function RequireAuth({
  children,
  fallback = 'prompt',  // default: აჩვენე Sign In ღილაკი
  redirectTo = '/',     // default: მთავარ გვერდზე გადასვლა
}: RequireAuthProps) {

  // ვიღებთ auth state-ს კონტექსტიდან
  const { isAuthenticated, openModal } = useAuth();
  const navigate = useNavigate();

  // ===========================================
  // HYDRATION PROBLEM-ის გადაჭრა
  // ===========================================

  /**
   * რატომ გვჭირდება isChecking state?
   *
   * პრობლემა: React-ის hydration-ის დროს:
   * 1. Server-ზე რენდერდება (isAuthenticated = false)
   * 2. Client-ზე hydration-ის შემდეგ localStorage-დან იტვირთება user
   * 3. ამ დროს isAuthenticated შეიძლება გახდეს true
   *
   * თუ არ დაველოდებით, მომხმარებელი ნახავს "Sign In" ეკრანს
   * მიუხედავად იმისა, რომ ავტორიზებულია.
   *
   * გადაწყვეტა: 100ms დაყოვნება, რომ auth state-ს ჰქონდეს
   * დრო localStorage-დან ჩატვირთვისთვის.
   */
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);  // 100ms საკმარისია hydration-ისთვის

    return () => clearTimeout(timer);
  }, []);

  // ===========================================
  // REDIRECT LOGIC
  // ===========================================

  /**
   * თუ fallback = 'redirect' და მომხმარებელი არ არის ავტორიზებული,
   * ავტომატურად გადამისამართდება redirectTo-ზე (default: '/')
   */
  useEffect(() => {
    if (!isChecking && !isAuthenticated && fallback === 'redirect') {
      navigate(redirectTo);
    }
  }, [isChecking, isAuthenticated, fallback, navigate, redirectTo]);

  // ===========================================
  // RENDER LOGIC
  // ===========================================

  // 1. ჯერ ვამოწმებთ auth-ს - ვაჩვენოთ loader
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // 2. არ არის ავტორიზებული
  if (!isAuthenticated) {

    // 2a. Redirect რეჟიმი - ვაჩვენოთ loader სანამ გადავა
    if (fallback === 'redirect') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      );
    }

    // 2b. Prompt რეჟიმი - ვაჩვენოთ Sign In ეკრანი
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-4xl">
          {/* Lock Icon */}
          <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Sign in required
          </h1>
          <p className="text-muted mb-6">
            You need to sign in to access this page.
          </p>

          {/* Sign In Button - ხსნის Auth Modal-ს */}
          <button
            onClick={() => openModal('signin')}
            className="px-6 py-3 bg-brand text-white font-medium rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // 3. ავტორიზებულია - ვაჩვენოთ დაცული კონტენტი
  return <>{children}</>;
}
```

### გამოყენების მაგალითები

```tsx
// მაგალითი 1: Prompt რეჟიმი (default)
// თუ არ არის ავტორიზებული, აჩვენებს Sign In ეკრანს
export default function DownloadsPage() {
  return (
    <RequireAuth>
      <DownloadsContent />
    </RequireAuth>
  );
}

// მაგალითი 2: Redirect რეჟიმი
// თუ არ არის ავტორიზებული, გადამისამართდება /login-ზე
export default function SettingsPage() {
  return (
    <RequireAuth fallback="redirect" redirectTo="/login">
      <SettingsContent />
    </RequireAuth>
  );
}
```

---

## My Orders გვერდი

### ფაილის მდებარეობა
```
app/routes/account.orders.tsx
```

### GraphQL Query

```graphql
query customerOrders($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    # შეკვეთები დალაგებული თარიღის მიხედვით (უახლესი პირველი)
    orders(first: 100, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          id                    # შეკვეთის უნიკალური ID
          orderNumber           # შეკვეთის ნომერი (#1001, #1002...)
          processedAt           # შეკვეთის თარიღი (ISO 8601)
          financialStatus       # PAID, PENDING, REFUNDED...
          fulfillmentStatus     # FULFILLED, UNFULFILLED...
          totalPrice {
            amount              # ჯამური თანხა
            currencyCode        # USD, EUR, GEL...
          }
          lineItems(first: 50) {
            edges {
              node {
                title           # პროდუქტის სახელი
                quantity        # რაოდენობა
                variant {
                  id
                  title         # ვარიანტის სახელი (Standard, Premium)
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    handle      # URL slug
                    productType # Music, Preset, SFX
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### კომპონენტის სტრუქტურა

```
OrdersPage
├── RequireAuth (Guard)
│   └── OrdersContent
│       ├── Loading State (Skeleton)
│       ├── Error State
│       └── Orders List
│           └── OrderCard (x N)
│               ├── Header (Order #, Date, Status, Total)
│               └── Expandable Details
│                   └── LineItem (x M)
```

### OrderCard კომპონენტის ანალიზი

```tsx
function OrderCard({ order }: OrderCardProps) {
  // ===========================================
  // STATE: Expand/Collapse
  // ===========================================

  /**
   * isExpanded აკონტროლებს შეკვეთის დეტალების ჩვენებას.
   * Default: false (დახურული)
   *
   * რატომ ლოკალური state და არა URL?
   * - უფრო სწრაფი UX (არ იცვლება URL)
   * - მრავალი შეკვეთა შეიძლება იყოს გახსნილი ერთდროულად
   */
  const [isExpanded, setIsExpanded] = useState(false);

  // LineItems-ის ექსტრაქცია edges-დან
  const lineItems = order.lineItems.edges.map(e => e.node);

  return (
    <div className="bg-elevated border border-outline rounded-lg overflow-hidden">

      {/* ========================================= */}
      {/* HEADER - ყოველთვის ჩანს                   */}
      {/* ========================================= */}

      <div
        onClick={() => setIsExpanded(!isExpanded)}  // Toggle expand
        className="p-4 md:p-6 cursor-pointer hover:bg-surface/50"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Order Info */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-brand" />
            </div>

            <div>
              {/* Order Number + Status Badge */}
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-white">
                  Order #{order.orderNumber}
                </h3>
                {getStatusBadge(order.financialStatus)}
              </div>

              {/* Date + Total */}
              <div className="flex items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(order.processedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">
              {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
            </span>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* EXPANDABLE DETAILS                        */}
      {/* ========================================= */}

      {isExpanded && (
        <div className="border-t border-outline">
          <div className="p-4 md:p-6 space-y-4">

            {/* Line Items */}
            {lineItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-surface rounded-lg">

                {/* Product Image */}
                <div className="w-16 h-16 bg-background rounded-lg overflow-hidden">
                  {item.variant?.product?.featuredImage?.url ? (
                    <img src={item.variant.product.featuredImage.url} alt={item.title} />
                  ) : (
                    <Package className="w-6 h-6 text-muted" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{item.title}</h4>
                  {/* Variant Title (თუ არ არის Default) */}
                  {item.variant?.title !== 'Default Title' && (
                    <p className="text-sm text-muted">{item.variant.title}</p>
                  )}
                  <p className="text-xs text-muted">Qty: {item.quantity}</p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span className="text-white font-medium">
                    {formatPrice(item.variant.price.amount, item.variant.price.currencyCode)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex justify-between items-center pt-4 border-t border-outline">
              <span className="text-muted font-medium">Total</span>
              <span className="text-xl font-bold text-white">
                {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Status Badge ლოგიკა

```tsx
/**
 * getStatusBadge - შეკვეთის სტატუსის ვიზუალური წარმოდგენა
 *
 * Shopify financialStatus შესაძლო მნიშვნელობები:
 * - PAID: გადახდილი (მწვანე)
 * - PENDING: მოლოდინში (ყვითელი)
 * - REFUNDED: დაბრუნებული (წითელი)
 * - PARTIALLY_REFUNDED: ნაწილობრივ დაბრუნებული (ნარინჯისფერი)
 * - VOIDED: გაუქმებული (ნაცრისფერი)
 */
function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    PAID: {
      bg: 'bg-emerald-900/50',    // მუქი მწვანე ფონი
      text: 'text-emerald-400',    // ღია მწვანე ტექსტი
      label: 'Paid'
    },
    PENDING: {
      bg: 'bg-yellow-900/50',
      text: 'text-yellow-400',
      label: 'Pending'
    },
    REFUNDED: {
      bg: 'bg-red-900/50',
      text: 'text-red-400',
      label: 'Refunded'
    },
    PARTIALLY_REFUNDED: {
      bg: 'bg-orange-900/50',
      text: 'text-orange-400',
      label: 'Partial Refund'
    },
    VOIDED: {
      bg: 'bg-gray-900/50',
      text: 'text-gray-400',
      label: 'Voided'
    },
  };

  const style = statusMap[status] || {
    bg: 'bg-gray-900/50',
    text: 'text-gray-400',
    label: status
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
```

---

## My Downloads გვერდი

### ფაილის მდებარეობა
```
app/routes/account.downloads.tsx
```

### GraphQL Query

```graphql
query customerPurchasedProducts($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    orders(first: 100) {
      edges {
        node {
          id
          orderNumber
          processedAt
          financialStatus      # PAID-ს ვფილტრავთ კლიენტზე
          lineItems(first: 50) {
            edges {
              node {
                title
                variant {
                  id
                  title
                  selectedOptions {   # რომელი ვარიანტი იყიდა
                    name              # "License", "Type"
                    value             # "Premium", "Standard"
                  }
                  product {
                    id
                    handle            # URL და R2 path-ისთვის
                    title
                    productType       # Music, Preset, SFX
                    tags              # დამატებითი მეტადატა
                    featuredImage {
                      url
                      altText
                    }
                    metafields(identifiers: [
                      {namespace: "custom", key: "is_premium"}
                    ]) {
                      key
                      value           # "true" ან "false"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### მონაცემთა ტრანსფორმაცია

```tsx
// ===========================================
// R2 DOWNLOAD URLS
// ===========================================

/**
 * Cloudflare R2-ში ფაილების სტრუქტურა:
 *
 * {product-handle}/
 * ├── Downloads/
 * │   ├── premium.zip      (Premium ლიცენზია)
 * │   ├── standart.zip     (Standard ლიცენზია)
 * │   └── license.pdf      (ლიცენზიის დოკუმენტი)
 * └── Stems/               (Premium მუსიკისთვის)
 *     ├── drums.mp3
 *     ├── bass.mp3
 *     └── ...
 */
const R2_BASE_URL = 'https://pub-7b0efa7da5324b45a8eb64027c6d08ac.r2.dev';

// ===========================================
// OWNED PRODUCT INTERFACE
// ===========================================

interface OwnedProduct {
  id: string;                  // უნიკალური ID (order_id + variant_id)
  productId: string;           // Shopify Product ID
  handle: string;              // URL slug (R2 path-ისთვისაც)
  name: string;                // პროდუქტის სახელი
  category: 'music' | 'presets' | 'sfx';
  tier: 'basic' | 'premium';   // პროდუქტის tier
  versionLabel: string;        // "Premium" ან "Standard"
  purchaseDate: string;        // ISO თარიღი
  thumbnailUrl: string;        // სურათის URL
  userVersion: 'premium' | 'standard' | null;  // რა ვერსია იყიდა
  downloads: {
    premiumUrl?: string;       // Premium zip URL
    standardUrl?: string;      // Standard zip URL
  };
}

// ===========================================
// TRANSFORMATION FUNCTIONS
// ===========================================

/**
 * mapProductTypeToCategory
 *
 * Shopify-ს productType-ს გარდაქმნის ჩვენს category-ად
 */
function mapProductTypeToCategory(productType: string): 'music' | 'presets' | 'sfx' {
  const type = productType.toLowerCase();
  if (type === 'preset' || type === 'presets') return 'presets';
  if (type === 'sfx' || type === 'sound effects') return 'sfx';
  return 'music';  // default
}

/**
 * determineVersionType
 *
 * Variant-ის selectedOptions-დან ადგენს რა ვერსია იყიდა მომხმარებელმა
 *
 * მაგალითი selectedOptions:
 * [
 *   { name: "Variant", value: "Premium" }
 * ]
 */
function determineVersionType(
  selectedOptions: Array<{ name: string; value: string }>
): 'premium' | 'standard' | null {

  // ვეძებთ "Variant", "Version Type" ან "Version" option-ს
  const versionOption = selectedOptions.find(
    opt => opt.name === 'Variant' ||
           opt.name === 'Version Type' ||
           opt.name === 'Version' ||
           opt.name.toLowerCase().includes('version')
  );

  if (!versionOption) return null;

  const value = versionOption.value.toLowerCase();

  // Premium
  if (value.includes('premium')) {
    return 'premium';
  }

  // Standard
  if (value.includes('standard')) {
    return 'standard';
  }

  return null;
}

/**
 * isPremiumProduct
 *
 * Metafield-დან ადგენს პროდუქტი Premium არის თუ არა
 */
function isPremiumProduct(
  metafields: Array<{ key: string; value: string } | null>
): boolean {
  const isPremiumField = metafields.find(m => m?.key === 'is_premium');
  return isPremiumField?.value === 'true';
}

/**
 * transformShopifyToOwnedProduct
 *
 * Shopify-ს მონაცემებს გარდაქმნის ჩვენს OwnedProduct ფორმატში
 */
function transformShopifyToOwnedProduct(
  order: ShopifyOrder,
  lineItem: ShopifyLineItem
): OwnedProduct | null {

  const product = lineItem.variant?.product;
  if (!product) return null;

  const category = mapProductTypeToCategory(product.productType);
  const userVersion = determineVersionType(lineItem.variant?.selectedOptions || []);
  const isPremium = isPremiumProduct(product.metafields || []);

  // ===========================================
  // DOWNLOAD URLs GENERATION
  // ===========================================

  /**
   * Download URL-ების გენერაცია:
   *
   * Music პროდუქტებისთვის:
   * - Premium: premium.zip + standart.zip (ორივე ხელმისაწვდომია)
   * - Standard: მხოლოდ standart.zip
   *
   * Presets/SFX:
   * - ერთი files.zip ფაილი
   */
  const downloads: OwnedProduct['downloads'] = {};

  if (category === 'music') {
    // Premium პროდუქტი ან Premium ვერსია
    if (isPremium || userVersion === 'premium') {
      downloads.premiumUrl = `${R2_BASE_URL}/${product.handle}/Downloads/premium.zip`;
    }
    downloads.standardUrl = `${R2_BASE_URL}/${product.handle}/Downloads/standart.zip`;
  } else {
    // Presets და SFX - ერთი ფაილი
    downloads.standardUrl = `${R2_BASE_URL}/${product.handle}/Downloads/files.zip`;
  }

  return {
    id: `${order.id}-${lineItem.variant?.id}`,
    productId: product.id,
    handle: product.handle,
    name: product.title,
    category,
    tier: isPremium ? 'premium' : 'basic',
    versionLabel: userVersion === 'premium' ? 'Premium' : 'Standard',
    purchaseDate: order.processedAt,
    thumbnailUrl: product.featuredImage?.url || '',
    userVersion,
    downloads,
  };
}
```

### მონაცემთა Fetching და Deduplication

```tsx
useEffect(() => {
  async function fetchPurchasedProducts() {
    if (!user?.accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await shopifyFetch<CustomerPurchasedProductsResponse>({
        query: CUSTOMER_PURCHASED_PRODUCTS_QUERY,
        variables: {
          customerAccessToken: user.accessToken,
        },
      });

      if (!response.customer?.orders) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // ===========================================
      // DEDUPLICATION LOGIC
      // ===========================================

      /**
       * რატომ გვჭირდება deduplication?
       *
       * მომხმარებელმა შეიძლება ერთი პროდუქტი რამდენჯერმე იყიდოს
       * (მაგ: ჯერ Standard, მერე Premium upgrade).
       *
       * ჩვენ გვინდა თითოეული პროდუქტი მხოლოდ ერთხელ გამოჩნდეს,
       * ამიტომ ვინახავთ seenProductIds Set-ში.
       */
      const ownedProducts: OwnedProduct[] = [];
      const seenProductIds = new Set<string>();

      for (const orderEdge of response.customer.orders.edges) {
        const order = orderEdge.node;

        // ===========================================
        // PAID ONLY FILTER
        // ===========================================

        /**
         * მხოლოდ PAID შეკვეთები!
         *
         * PENDING - ჯერ არ გადაუხდია
         * REFUNDED - თანხა დაბრუნებულია
         * VOIDED - გაუქმებულია
         *
         * ეს ფილტრი უზრუნველყოფს რომ მომხმარებელი ვერ გადმოწერს
         * პროდუქტს, რომელზეც არ გადაუხდია.
         */
        if (order.financialStatus !== 'PAID') continue;

        for (const lineItemEdge of order.lineItems.edges) {
          const lineItem = lineItemEdge.node;
          const productId = lineItem.variant?.product?.id;

          // Skip duplicates
          if (!productId || seenProductIds.has(productId)) continue;
          seenProductIds.add(productId);

          const ownedProduct = transformShopifyToOwnedProduct(order, lineItem);
          if (ownedProduct) {
            ownedProducts.push(ownedProduct);
          }
        }
      }

      // ===========================================
      // SORTING
      // ===========================================

      /**
       * დალაგება შეძენის თარიღის მიხედვით (უახლესი პირველი)
       * ეს უფრო ლოგიკურია მომხმარებლისთვის
       */
      ownedProducts.sort((a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );

      setProducts(ownedProducts);
    } catch (err) {
      console.error('Failed to fetch purchased products:', err);
      setError('Failed to load your products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  fetchPurchasedProducts();
}, [user?.accessToken]);
```

### ProductCard კომპონენტი

```tsx
function ProductCard({ product, onOpenDownloadDialog }: ProductCardProps) {
  const navigate = useNavigate();

  // ===========================================
  // CATEGORY ICON
  // ===========================================

  const getCategoryIcon = () => {
    switch (product.category) {
      case 'music':
        return <Music size={16} className="text-teal-500" />;
      case 'presets':
        return <AudioWaveform size={16} className="text-purple-500" />;
      case 'sfx':
        return <Volume2 size={16} className="text-orange-500" />;
    }
  };

  // ===========================================
  // STUDIO BUTTON LOGIC
  // ===========================================

  /**
   * "Open in Studio" ღილაკი ჩანს მხოლოდ:
   * 1. Music კატეგორიის პროდუქტებისთვის
   * 2. Premium tier-ის პროდუქტებისთვის
   *
   * რატომ? Premium მუსიკას აქვს Stems (ცალკეული ტრეკები),
   * რომელთა მიქსირება შეიძლება Studio-ში.
   */
  const shouldShowStudioButton = product.category === 'music' && product.tier === 'premium';

  // License download URL
  const licenseUrl = `${R2_BASE_URL}/${product.handle}/Downloads/license.pdf`;

  return (
    <div className="bg-elevated border border-outline rounded-lg overflow-hidden">

      {/* Thumbnail */}
      <div className="aspect-square bg-surface">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={48} className="text-muted" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2">{product.name}</h3>

        {/* Metadata */}
        <div className="flex items-center gap-2 mb-1">
          {getCategoryIcon()}
          <span className="text-sm text-muted capitalize">{product.category}</span>
          <span className="text-muted">•</span>
          <span className="text-sm text-muted capitalize">{product.tier}</span>
        </div>
        <div className="text-xs text-muted mb-4">
          {product.versionLabel} • Purchased {formatDate(product.purchaseDate)}
        </div>

        {/* Download Buttons */}
        <div className="space-y-2">

          {/* Download Files - ხსნის Dialog-ს */}
          <button
            onClick={() => onOpenDownloadDialog(product)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg"
          >
            <Download size={18} />
            <span>Download Files</span>
          </button>

          {/* Download License */}
          <button
            onClick={() => window.open(licenseUrl, '_blank')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-700 text-white rounded-lg"
          >
            <FileText size={18} />
            <span>Download License</span>
          </button>

          {/* Open in Studio (Conditional) */}
          {shouldShowStudioButton && (
            <button
              onClick={() => navigate(`/studio/${product.handle}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg"
            >
              <AudioWaveform size={18} />
              <span>Open in Studio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Data Flow დიაგრამა

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER ACTION                               │
│                    მომხმარებელი ხსნის /account/orders             │
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                        RequireAuth                                │
│                                                                   │
│  1. isChecking = true (100ms timeout)                            │
│  2. Check: isAuthenticated?                                       │
│     ├── NO → Show "Sign In" prompt                               │
│     └── YES → Render children                                    │
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                       OrdersContent                               │
│                                                                   │
│  useEffect(() => {                                               │
│    if (!user?.accessToken) return;                               │
│                                                                   │
│    shopifyFetch({                                                │
│      query: CUSTOMER_ORDERS_QUERY,                               │
│      variables: { customerAccessToken: token }                   │
│    })                                                            │
│  }, [user?.accessToken])                                         │
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Shopify Storefront API                         │
│                                                                   │
│  POST https://czaba.myshopify.com/api/2024-10/graphql.json       │
│                                                                   │
│  Headers:                                                        │
│    Content-Type: application/json                                │
│    X-Shopify-Storefront-Access-Token: {public_token}             │
│                                                                   │
│  Body:                                                           │
│    { query: CUSTOMER_ORDERS_QUERY, variables: { token } }        │
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Response Processing                         │
│                                                                   │
│  response.customer.orders.edges                                  │
│    .map(e => e.node)           // Extract orders                 │
│    .filter(o => o.financialStatus === 'PAID')  // Only paid      │
│                                                                   │
│  setOrders(orders)                                               │
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                          UI Render                                │
│                                                                   │
│  orders.map(order => <OrderCard order={order} />)                │
│                                                                   │
│  თითოეული OrderCard:                                             │
│    - Header: Order #, Date, Status, Total                        │
│    - Expandable: LineItems with images and prices                │
└──────────────────────────────────────────────────────────────────┘
```

---

## დამატებითი შენიშვნები

### უსაფრთხოების მოდელი

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: RequireAuth Component                              │
│  ├── Client-side route protection                            │
│  └── ვერ შევა გვერდზე თუ არ არის ავტორიზებული               │
│                                                              │
│  Layer 2: Shopify Access Token                               │
│  ├── Token ინახება localStorage-ში                          │
│  ├── ვადა: 24 საათი (Shopify default)                       │
│  └── ვადაგასულ token-ზე API აბრუნებს null                   │
│                                                              │
│  Layer 3: Shopify API Validation                             │
│  ├── Customer ვერ ნახავს სხვისი შეკვეთებს                   │
│  ├── Token ვალიდაცია ხდება Shopify-ს მხარეს                 │
│  └── PAID ფილტრი - ვერ გადმოწერს გადაუხდელ პროდუქტს        │
│                                                              │
│  Layer 4: R2 Files                                           │
│  ├── Public bucket (ვინც URL-ს იცის, გადმოწერს)             │
│  └── URL obfuscation: handle-based paths                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### შესაძლო გაუმჯობესებები

1. **Signed URLs for R2**: დროებითი, ხელმოწერილი URL-ები უფრო უსაფრთხოა
2. **Server-side Auth Check**: Remix loader-ში token ვალიდაცია
3. **Pagination**: თუ ბევრი შეკვეთა/პროდუქტია, პაგინაცია გჭირდება
4. **Caching**: React Query ან SWR ქეშირებისთვის
5. **Optimistic Updates**: UI განახლება API პასუხის მოლოდინის გარეშე
