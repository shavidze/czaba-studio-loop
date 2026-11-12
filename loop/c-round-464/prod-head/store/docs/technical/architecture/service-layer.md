# Service Layer Architecture

## შესავალი

Frontend პროექტს აქვს **ორი დამოუკიდებელი Service Layer**:

1. **Backend API Client** (`~/services/api`) - .NET Backend-თან კომუნიკაცია (Auth, Cart, Store)
2. **Shopify Service Layer** (`~/services/shopify`) - Shopify Storefront API (Products SSR)

**რატომ ორი?** Shopify გვაძლევს პროდუქტების მდიდარ მეტამონაცემებს (metafields), რაც SSR-ისთვის იდეალურია. მაგრამ Auth და Cart ლოგიკა ჩვენს Backend-ზეა, რადგან გვინდა სრული კონტროლი მომხმარებლებზე, შეკვეთებზე და გადახდებზე.

---

## არქიტექტურის დიაგრამა

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTES / CONTEXTS                        │
│  (store.tsx, CartContext, AuthContext, account routes)           │
└──────────────┬────────────────────────────────┬─────────────────┘
               │                                │
               ▼                                ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│    BACKEND API CLIENT    │    │      SHOPIFY SERVICE LAYER       │
│    ~/services/api        │    │      ~/services/shopify          │
├──────────────────────────┤    ├──────────────────────────────────┤
│ apiClient                │    │ ProductService                   │
│  - login()               │    │  - getMusic()                    │
│  - register()            │    │  - getSFX()                      │
│  - socialLogin()         │    │  - getPresets()                  │
│  - getCart()             │    │  - getByHandle()                 │
│  - addToCart()           │    │                                  │
│  - checkout()            │    │ CustomerService (legacy)         │
│  - getProducts()         │    │ CartService (legacy)             │
└──────────────┬───────────┘    └────────────────┬─────────────────┘
               │                                 │
               ▼                                 ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│    .NET BACKEND API      │    │     SHOPIFY STOREFRONT API       │
│    http://localhost:5199 │    │     GraphQL (2024-10)            │
└──────────────────────────┘    └──────────────────────────────────┘
```

---

## რომელი Service როდის გამოვიყენო?

| ოპერაცია | Service | რატომ |
|----------|---------|-------|
| **Auth** (login, register, social) | `apiClient` | Backend მართავს JWT tokens, refresh logic |
| **Cart** (add, remove, checkout) | `apiClient` | Backend მართავს session/user კალათებს |
| **Products** (SSR collection pages) | `ProductService` | Shopify metafields, SEO, rich data |
| **Products** (store page with filters) | `apiClient` | Backend filtering, pagination, search |
| **Orders** | `apiClient` | Backend database, payment integration |

---

## ფაილების სტრუქტურა

```
app/services/
├── index.ts                    # Re-exports shopify services
├── api/                        # .NET Backend API Client
│   ├── index.ts               # Barrel export
│   └── client.ts              # ApiClient class (REST)
└── shopify/                   # Shopify Storefront API
    ├── index.ts               # Barrel export
    ├── client/
    │   └── client.ts          # GraphQL client with retry
    ├── products/
    │   ├── products.ts        # ProductService
    │   └── products.test.ts
    ├── customers/             # LEGACY - see Backend API
    │   └── customers.ts
    └── cart/                  # LEGACY - see Backend API
        └── cart.ts
```

---

## გამოყენება

---

### 1. Backend API Client (Auth, Cart, Store)

**ფაილი:** `app/services/api/client.ts`

```typescript
import { apiClient } from '~/services/api';

// =====================
// AUTH
// =====================

// Email/Password Login
const authResponse = await apiClient.login({ email, password });
// -> { userId, email, accessToken, refreshToken, accessTokenExpires }

// Registration
const authResponse = await apiClient.register({
  email,
  password,
  firstName,
  lastName,
});

// Social Login (Firebase ID Token)
const authResponse = await apiClient.socialLogin({ idToken });

// Set token for subsequent requests
apiClient.setAccessToken(authResponse.accessToken);

// Get profile
const profile = await apiClient.getProfile();

// =====================
// CART
// =====================

// Get cart (uses session ID for guests, auth token for users)
const cart = await apiClient.getCart(sessionId);
// -> { id, items, itemCount, subtotal }

// Add to cart
const cart = await apiClient.addToCart({ productId: 123, quantity: 1 }, sessionId);

// Remove item
const cart = await apiClient.removeCartItem(itemId, sessionId);

// Checkout
const order = await apiClient.checkout();
// -> { orderId, orderNumber, total }

// =====================
// PRODUCTS (with filtering)
// =====================

// Get products with filters
const result = await apiClient.getProducts({
  category: 'Music',
  genre: 'Cinematic',
  minBpm: 80,
  maxBpm: 120,
  page: 1,
  pageSize: 20,
});
// -> { items, totalCount, pageNumber, pageSize }

// Search
const result = await apiClient.searchProducts('epic trailer');
```

---

### 2. Shopify Service Layer (Products SSR)

**გამოყენება:** SSR route loaders-ში, სადაც გვჭირდება Shopify metafields.

```typescript
import { ProductService } from '~/services/shopify';

// Music პროდუქტები (with all metafields)
const musicAssets = await ProductService.getMusic(50);
// -> MusicAsset[] with artist, bpm, key, genre, stems, etc.

// SFX პროდუქტები
const sfxAssets = await ProductService.getSFX(50);

// Preset პროდუქტები
const presetAssets = await ProductService.getPresets(50);

// ერთი პროდუქტის მიღება handle-ით
const product = await ProductService.getByHandle('cinematic-drums');
```

**Route Loader მაგალითი:**

```typescript
// app/routes/collections.music.tsx
import { json } from '@remix-run/node';
import { ProductService } from '~/services/shopify';

export async function loader() {
  const assets = await ProductService.getMusic(50);
  return json({ assets });
}
```

---

### Legacy Services (Shopify)

> **არ გამოიყენო პირდაპირ!** CustomerService და CartService Shopify-ში დარჩა legacy მიზნებისთვის.
> Auth და Cart ლოგიკა გადატანილია Backend API-ზე.

```typescript
// LEGACY - არ გამოიყენო!
import { CustomerService, CartService } from '~/services/shopify';
```

---

## API Clients

### Backend API Client

**ფაილი:** `app/services/api/client.ts`

**Features:**
- Singleton instance (`apiClient`)
- JWT Bearer token management
- Session ID header for guest carts
- Automatic JSON parsing

```typescript
class ApiClient {
  setAccessToken(token: string | undefined): void;  // Set/clear auth token

  // Auth
  login(request: LoginRequest): Promise<AuthResponse>;
  register(request: RegisterRequest): Promise<AuthResponse>;
  socialLogin(request: SocialLoginRequest): Promise<AuthResponse>;
  getProfile(): Promise<UserProfile>;

  // Cart
  getCart(sessionId?: string): Promise<Cart>;
  addToCart(request: AddCartItemRequest, sessionId?: string): Promise<Cart>;
  removeCartItem(itemId: number, sessionId?: string): Promise<Cart>;
  checkout(): Promise<CheckoutResponse>;

  // Products
  getProducts(params: ProductFilterParams): Promise<PagedResult<BackendProduct>>;
  getProductByHandle(handle: string): Promise<BackendProduct>;
}
```

### Shopify GraphQL Client

**ფაილი:** `app/services/shopify/client/client.ts`

**Features:**
- SSR/Client environment detection
- Retry logic (2 attempts for queries, 0 for mutations)
- Custom error types

```typescript
// Query with retry
const data = await shopifyQuery<T>(query, variables);

// Mutation without retry
const data = await shopifyMutation<T>(mutation, variables);
```

**Error Types:**
```typescript
ShopifyError         // Base error
ShopifyNetworkError  // Network failures
ShopifyGraphQLError  // GraphQL errors with details
```

---

## კონფიგურაცია (Environment Variables)

```bash
# Backend API
VITE_API_URL=http://localhost:5199
API_URL=http://localhost:5199

# Shopify (Server-side)
SHOPIFY_STORE_DOMAIN=czaba.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token

# Shopify (Client-side / Vite)
VITE_SHOPIFY_STORE_DOMAIN=czaba.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_token

# Firebase (Social Login)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## Error Handling

### Backend API Errors

```typescript
try {
  const cart = await apiClient.addToCart({ productId: 123, quantity: 1 });
} catch (error) {
  if (error instanceof Error) {
    // error.message contains API error message
    console.error('API Error:', error.message);
  }
}
```

### Shopify Service Errors

```typescript
import { ShopifyError, ShopifyGraphQLError } from '~/services/shopify';

try {
  const products = await ProductService.getMusic();
} catch (error) {
  if (error instanceof ShopifyGraphQLError) {
    console.error('GraphQL errors:', error.errors);
  } else if (error instanceof ShopifyError) {
    console.error('Shopify error:', error.message, error.code);
  }
}
```

---

## Type Definitions

### Backend API Types

```typescript
// Auth
interface AuthResponse {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  isNewUser?: boolean;
}

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  authProvider?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Cart
interface Cart {
  id: number | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

interface CartItem {
  id: number;
  productId: number;
  productTitle: string;
  productHandle: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

// Products
interface BackendProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  category: string;
  handle: string;
  imageUrl?: string;
  audioPreviewUrl?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
  isNew: boolean;
  isPremium: boolean;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
```

### Shopify ProductService Types

```typescript
interface MusicAsset {
  id: string;
  title: string;
  type: 'music';
  artist: string;
  featuredArtist?: string;
  genre: string;
  subGenres: string[];
  bpm: number;
  key?: string;
  duration?: string;
  image: string;
  audioUrl: string | null;
  handle: string;
  isNew: boolean;
  isPremium: boolean;
}

interface SFXAsset {
  id: string;
  title: string;
  type: 'sfx';
  category: string;
  tags: string[];
  duration?: string;
  image: string;
  audioUrl: string | null;
  handle: string;
  isNew: boolean;
  isPremium: boolean;
  price?: string;
  soundCount?: number;
  previewUrl?: string;
}

interface PresetAsset {
  id: string;
  title: string;
  type: 'preset';
  software: string;
  category: string;
  tags: string[];
  image: string;
  audioUrl: string | null;
  handle: string;
  isNew: boolean;
  isPremium: boolean;
}
```

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-18 | დოკუმენტაცია განახლდა: ორი Service Layer (Backend API + Shopify) |
| 2026-01-18 | Backend API Client დოკუმენტაცია დამატდა |
| 2026-01-18 | Legacy CustomerService/CartService მონიშნულია deprecated |
| 2026-01-06 | Service Layer შექმნა: ProductService, CustomerService, CartService |
| 2026-01-06 | Unified GraphQL client retry logic და error handling |
| 2026-01-06 | collections.music.tsx, collections.presets.tsx მიგრაცია |
