# Shopify to Czaba Backend Migration Plan

## Executive Summary

ეს დოკუმენტი აღწერს დეტალურ მიგრაციის გეგმას Shopify-დან Czaba .NET Backend API-ზე გადასვლისთვის czaba-store frontend აპლიკაციაში.

---

## Current State Analysis

### უკვე მიგრირებული (Backend API)

| კომპონენტი | ფაილი | სტატუსი |
|------------|-------|---------|
| **Authentication** | `app/contexts/AuthContext.tsx` | ✅ Backend |
| **Cart** | `app/contexts/CartContext.tsx` | ✅ Backend |
| **Checkout/Payments** | `CartContext.tsx` + Stripe | ✅ Backend |

### მიგრაციას საჭიროებს (Shopify)

| კომპონენტი | ფაილი | პრიორიტეტი |
|------------|-------|------------|
| **ProductService** | `services/shopify/products/products.ts` | 🔴 Critical |
| **Product Detail Page** | `routes/products.$handle.tsx` | 🔴 Critical |
| **Homepage Products** | `routes/_index.tsx` | 🟡 High |
| **PurchasesContext** | `contexts/PurchasesContext.tsx` | 🟡 High |
| **Downloads Page** | `routes/account.downloads.tsx` | 🟢 Medium |
| **Orders Page** | `routes/account.orders.tsx` | 🟢 Medium |

---

## Critical Type Mismatches

| Field | Backend (Czaba) | Frontend (Shopify) | Solution |
|-------|-----------------|-------------------|----------|
| Product ID | `number` (123) | `string` ("gid://shopify/...") | Adapter: `id.toString()` |
| Tags | `string` ("a,b,c") | `string[]` | Adapter: `tags.split(',')` |
| Versions | `StandardPrice` + `PremiumPrice` | `ProductVersion[]` | Create version objects |
| Price | `decimal` | `{ amount, currencyCode }` | Format in adapter |

---

## Phase 1: Fix Immediate Issue (products.$handle.tsx)

**პრიორიტეტი:** 🔴 CRITICAL
**დრო:** 2-3 საათი

### 1.1 Create Product Adapter

შექმენი: `app/services/api/adapters/productAdapter.ts`

```typescript
import type { BackendProduct } from '../client';
import type { ProductDetail, ProductVersion, ProductVariant } from '~/data';

export function backendProductToProductDetail(
  product: BackendProduct
): ProductDetail {
  return {
    id: product.id.toString(),
    title: product.title,
    handle: product.handle,
    productType: mapCategory(product.category),
    artist: product.vendor || 'CZABA',
    artistHandle: (product.vendor || 'czaba').toLowerCase().replace(/\s+/g, '-'),
    featuredImage: product.imageUrl || '',
    audioPreviewUrl: product.audioPreviewUrl || '',
    publishedAt: product.createdAt.split('T')[0],
    bpm: product.bpm || 0,
    musicalKey: product.key || '-',
    plays: 0,
    likes: 0,
    reposts: 0,
    tags: parseTags(product.tags),
    genre: product.genre || 'Music',
    versions: createVersions(product),
    variants: createVariants(product),
    relatedTracks: [],
  };
}

function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags.split(',').map(t => t.trim()).filter(Boolean);
}

function mapCategory(category: string): 'Music' | 'Presets' | 'Sound Effects' {
  const cat = category.toLowerCase();
  if (cat === 'sfx' || cat === 'sound effects') return 'Sound Effects';
  if (cat === 'presets' || cat === 'preset') return 'Presets';
  return 'Music';
}

function createVersions(product: BackendProduct): ProductVersion[] {
  const versions: ProductVersion[] = [{
    id: 'version-standard',
    name: 'Standard',
    displayName: 'Standard',
    basePrice: product.standardPrice,
    formats: ['WAV'],
    quality: '24-bit / 48kHz',
    fileSize: '150 MB',
  }];

  if (product.premiumPrice) {
    versions.push({
      id: 'version-premium',
      name: 'Premium',
      displayName: 'Premium',
      basePrice: product.premiumPrice,
      formats: ['WAV', 'WAV 96kHz'],
      quality: '24-bit / 96kHz',
      fileSize: '320 MB',
      isFeatured: true,
    });
  }

  return versions;
}

function createVariants(product: BackendProduct): ProductVariant[] {
  const variants: ProductVariant[] = [{
    id: `${product.id}-standard`,
    versionId: 'version-standard',
    price: {
      amount: product.standardPrice.toFixed(2),
      currencyCode: 'USD',
    },
  }];

  if (product.premiumPrice) {
    variants.push({
      id: `${product.id}-premium`,
      versionId: 'version-premium',
      price: {
        amount: product.premiumPrice.toFixed(2),
        currencyCode: 'USD',
      },
    });
  }

  return variants;
}
```

### 1.2 Update products.$handle.tsx

```typescript
// შეცვალე import (line 38):
// import { ProductService } from '~/services/shopify';
import { apiClient } from '~/services/api/client';
import { backendProductToProductDetail } from '~/services/api/adapters/productAdapter';

// შეცვალე loader ფუნქცია:
export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = params;

  if (!handle) {
    throw new Response('Product not found', { status: 404 });
  }

  try {
    const backendProduct = await apiClient.getProductByHandle(handle);
    const product = backendProductToProductDetail(backendProduct);
    return json({ product });
  } catch (error) {
    console.error('Failed to fetch product:', error);

    // Fallback to mock data
    const mockProduct = MOCK_PRODUCTS[handle];
    if (mockProduct) {
      return json({ product: mockProduct });
    }

    throw new Response('Product not found', { status: 404 });
  }
}
```

---

## Phase 2: Replace ProductService in _index.tsx

**პრიორიტეტი:** 🟡 HIGH
**დრო:** 2-3 საათი

```typescript
// შეცვალე import:
import { apiClient } from '~/services/api/client';
import { backendProductToProductCard } from '~/services/api/adapters/productAdapter';

// შეცვალე loader:
export async function loader() {
  try {
    const result = await apiClient.getProducts({ pageSize: 12 });
    const musicProducts = result.items.map(backendProductToProductCard);

    return json({
      musicProducts,
      sfxProducts: [],
      presetsProducts: [],
      freeDownloads: [],
    });
  } catch (error) {
    console.error('Error loading homepage products:', error);
    return json({
      musicProducts: [],
      sfxProducts: [],
      presetsProducts: [],
      freeDownloads: [],
    });
  }
}
```

---

## Phase 3: Replace PurchasesContext

**პრიორიტეტი:** 🟡 HIGH
**დრო:** 4-5 საათი

### 3.1 Add API Client Methods

`app/services/api/client.ts`-ში დაამატე:

```typescript
export interface DownloadableProduct {
  productId: number;
  productTitle: string;
  handle: string;
  imageUrl?: string;
  category: string;
  licenseType: string;
  purchasedAt: string;
  orderNumber: string;
}

export interface UserDownloadsResponse {
  products: DownloadableProduct[];
}

// ApiClient კლასში:
async getUserDownloads(): Promise<UserDownloadsResponse> {
  return this.request<UserDownloadsResponse>('/api/downloads');
}
```

### 3.2 Rewrite PurchasesContext

```typescript
import { apiClient } from '~/services/api/client';

interface PurchasedProduct {
  id: string;
  productId: number;
  handle: string;
  versionType: 'premium' | 'standard' | null;
}

const fetchPurchases = useCallback(async () => {
  if (!user?.accessToken) {
    setPurchasedProducts([]);
    return;
  }

  setIsLoading(true);
  try {
    apiClient.setAccessToken(user.accessToken);
    const response = await apiClient.getUserDownloads();

    const products: PurchasedProduct[] = response.products.map(p => ({
      id: p.productId.toString(),
      productId: p.productId,
      handle: p.handle,
      versionType: p.licenseType.toLowerCase().includes('premium') ? 'premium' : 'standard',
    }));

    setPurchasedProducts(products);
  } catch (error) {
    console.error('Failed to fetch purchases:', error);
  } finally {
    setIsLoading(false);
  }
}, [user?.accessToken]);
```

---

## Phase 4: Replace Account Pages

### 4.1 account.downloads.tsx

წაშალე Shopify imports და გამოიყენე `apiClient.getUserDownloads()`.

### 4.2 account.orders.tsx

დაამატე API client-ში:

```typescript
async getMyOrders(page = 1, pageSize = 10): Promise<PagedResult<BackendOrder>> {
  return this.request<PagedResult<BackendOrder>>(
    `/api/orders/my?page=${page}&pageSize=${pageSize}`
  );
}
```

---

## File Structure After Migration

```
app/services/api/
├── client.ts                    # API client
├── index.ts                     # Exports
├── adapters/
│   ├── index.ts
│   ├── productAdapter.ts        # BackendProduct → ProductDetail
│   ├── orderAdapter.ts          # BackendOrder → Order
│   └── downloadAdapter.ts       # Downloads transformation
```

---

## Testing Checklist

### Unit Tests
- [ ] Product adapter transforms correctly
- [ ] Tags parsing handles edge cases
- [ ] Version/variant creation works

### Integration Tests
- [ ] Product detail page loads
- [ ] Homepage products load
- [ ] Add to cart works
- [ ] Ownership check works
- [ ] Downloads page works
- [ ] Orders page works

### Manual Testing
- [ ] `/products/{handle}` - loads correctly
- [ ] Audio preview plays
- [ ] Version selection works
- [ ] "Add to Cart" works
- [ ] "Buy Now" → Stripe
- [ ] `/account/downloads` shows products
- [ ] `/account/orders` shows orders

---

## Implementation Timeline

| Phase | პრიორიტეტი | დრო | დამოკიდებულება |
|-------|------------|-----|----------------|
| 1. products.$handle.tsx | 🔴 CRITICAL | 2-3 სთ | - |
| 2. _index.tsx | 🟡 HIGH | 2-3 სთ | Phase 1 |
| 3. PurchasesContext | 🟡 HIGH | 4-5 სთ | Phase 1 |
| 4. Account pages | 🟢 MEDIUM | 4-6 სთ | Phase 3 |
| 5. Testing | 🟡 HIGH | 3-4 სთ | All |

**სულ: ~18-25 საათი**

---

## Cleanup After Migration

წასაშლელი ფაილები:
- `app/services/shopify/` (მთლიანი ფოლდერი)
- `app/lib/shopify.client.ts`
- `app/lib/shopify.server.ts`
- `app/lib/shopify.queries.ts`
- `app/lib/shopify.queries.homepage.ts`

წასაშლელი env variables:
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `VITE_SHOPIFY_STORE_DOMAIN`
- `VITE_SHOPIFY_STOREFRONT_TOKEN`
