# Backend Integration Guide

## შესავალი

`feature/backend-integration` branch-ში Frontend უკავშირდება **Czaba .NET Backend**-ს Shopify-ის ნაცვლად. ეს გვაძლევს სრულ კონტროლს მომხმარებლებზე, შეკვეთებზე და გადახდებზე.

---

## არქიტექტურის დიაგრამა

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐         ┌──────────────────────────────┐       │
│  │  Remix Frontend │────────►│    Czaba .NET Backend        │       │
│  │  localhost:5173 │         │    localhost:5199            │       │
│  └────────┬────────┘         ├──────────────────────────────┤       │
│           │                  │  /api/products   - Products  │       │
│           │                  │  /api/auth/*     - Auth      │       │
│           │                  │  /api/cart/*     - Cart      │       │
│           │                  │  /api/orders/*   - Orders    │       │
│           │                  └──────────────────────────────┘       │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                 │
│  │    Firebase     │  ◄── მხოლოდ Google Sign-In popup               │
│  │   (czaba-api)   │      არა: Firestore, data storage              │
│  └─────────────────┘                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## რა შეიცვალა Shopify-დან?

| ფუნქცია | ადრე (Shopify) | ახლა (Czaba Backend) |
|---------|----------------|----------------------|
| Products | Shopify Storefront API | `/api/products` |
| Auth | Shopify Customer API | `/api/auth/*` + Firebase social |
| Cart | Shopify Cart API | `/api/cart/*` |
| Checkout | Shopify Checkout | `/api/cart/checkout` |
| Orders | Shopify Orders | `/api/orders/*` |

---

## ძირითადი ფაილები

### 1. API Client

**ფაილი:** `app/services/api/client.ts`

Backend-თან კომუნიკაციის ცენტრალური წერტილი.

```typescript
import { apiClient } from '~/services/api';

// Products
const products = await apiClient.getProducts({ category: 'Music', genre: 'Cinematic' });
const product = await apiClient.getProductByHandle('epic-trailer-music');

// Auth
const auth = await apiClient.login({ email, password });
const auth = await apiClient.register({ email, password, firstName, lastName });
const auth = await apiClient.socialLogin({ idToken });  // Firebase ID token
const auth = await apiClient.refreshToken(refreshToken);
const profile = await apiClient.getProfile();

// Cart
const cart = await apiClient.getCart(sessionId);
const cart = await apiClient.addToCart({ productId, quantity }, sessionId);
const cart = await apiClient.removeCartItem(itemId, sessionId);
const order = await apiClient.checkout();
```

### 2. Auth Library

**ფაილი:** `app/lib/auth.ts`

აბსტრაქცია API client-ის ზემოდან, ვალიდაციით.

```typescript
import { signIn, signUp, signInWithGoogle, signOut, resetPassword } from '~/lib/auth';

// Email/Password
const user = await signIn(email, password);
const user = await signUp(name, email, password);

// Google OAuth
const user = await signInWithGoogle();

// Password Reset
await resetPassword(email);
```

### 3. Firebase Client

**ფაილი:** `app/lib/firebase.client.ts`

Firebase გამოიყენება **მხოლოდ** Google Sign-In-ისთვის.

```typescript
import { signInWithGoogle, getIdToken } from '~/lib/firebase.client';

// Google popup
const result = await signInWithGoogle();
const idToken = await getIdToken(result.user);

// idToken იგზავნება Backend-ზე verification-ისთვის
await apiClient.socialLogin({ idToken });
```

**Firebase Project:** `czaba-api`

**არ გამოიყენება:**
- Firestore database
- Firebase Storage
- Cloud Functions
- Authentication state management (მართავს Backend JWT)

### 4. Auth Context

**ფაილი:** `app/contexts/AuthContext.tsx`

React Context auth state-ის მართვისთვის.

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
}
```

**Token Storage:** `localStorage.auth_user`

### 5. Cart Context

**ფაილი:** `app/contexts/CartContext.tsx`

Cart state management Backend API-ით.

```typescript
interface CartContextValue {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  isAddingToCart: boolean;

  addToCart: (productId: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  buyNow: (productId: number) => Promise<void>;
  checkout: () => Promise<void>;
  isInCart: (productId: number) => boolean;
}
```

**Session ID:** Guest users-ისთვის `localStorage.czaba_session_id`

---

## ავტორიზაციის Flow-ები

### Email/Password Sign In

```
1. User submits login form
2. signIn() → apiClient.login({ email, password })
3. Backend validates credentials
4. Returns JWT tokens (accessToken, refreshToken)
5. apiClient.setAccessToken(accessToken)
6. Store user in localStorage.auth_user
```

### Email/Password Sign Up

```
1. User submits registration form
2. signUp() → apiClient.register({ email, password, firstName, lastName })
3. Backend creates user
4. Returns JWT tokens
5. Store user in localStorage
```

### Google Sign In

```
1. User clicks "Sign in with Google"
2. initFirebase() → Firebase app initialization
3. signInWithGooglePopup() → Google OAuth popup
4. User authenticates with Google
5. getIdToken(firebaseUser) → Firebase ID Token
6. apiClient.socialLogin({ idToken })
7. Backend verifies token with Firebase Admin SDK
8. Backend creates/finds user
9. Returns JWT tokens
10. Store user in localStorage
```

---

## JWT Token Management

### Access Token
- **ვადა:** მოკლე (15-30 წუთი)
- **Storage:** `localStorage.auth_user.accessToken`
- **გამოყენება:** `Authorization: Bearer <token>`

### Refresh Token
- **ვადა:** გრძელი (7-30 დღე)
- **Storage:** `localStorage.auth_user.refreshToken`
- **გამოყენება:** access token-ის განახლებისთვის

### Token Refresh

```typescript
// როცა access token expires
const newAuth = await apiClient.refreshToken(refreshToken);
apiClient.setAccessToken(newAuth.accessToken);
localStorage.setItem('auth_user', JSON.stringify(newAuth));
```

---

## Environment Variables

```env
# Backend API
VITE_API_URL=http://localhost:5199
API_URL=http://localhost:5199

# Firebase (Client-side)
VITE_FIREBASE_API_KEY=AIzaSyCWZd1kxAgYmHViNnyNFJFZ3966Gq_KLLU
VITE_FIREBASE_AUTH_DOMAIN=czaba-api.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=czaba-api
VITE_FIREBASE_APP_ID=1:466379096804:web:b386fd5f0cff543bf122f1
```

---

## API Endpoints Reference

### Auth Endpoints

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/register` | New user registration |
| POST | `/api/auth/social` | Firebase social login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Product Endpoints

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/api/products` | Get products (with filters) |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/handle/{handle}` | Get product by handle |

**Filter Parameters:**
- `category` - Music, SFX, Preset
- `search` - ძიება
- `genre` - ჟანრი
- `minPrice`, `maxPrice` - ფასის დიაპაზონი
- `minBpm`, `maxBpm` - BPM დიაპაზონი
- `isNew`, `isPremium` - flags
- `page`, `pageSize` - pagination
- `sortBy`, `sortDesc` - სორტირება

### Cart Endpoints

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/{id}` | Update item quantity |
| DELETE | `/api/cart/items/{id}` | Remove item |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/cart/checkout` | Checkout |

**Headers:**
- `X-Session-Id` - Guest user session ID
- `Authorization: Bearer <token>` - Authenticated user

---

## Type Definitions

### User

```typescript
interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  profileImageUrl?: string;
  authProvider?: string;
  emailVerified?: boolean;
  registrationSource: 'email' | 'google' | 'facebook';
}
```

### Product

```typescript
interface BackendProduct {
  id: number;
  title: string;
  description?: string;
  standardPrice: number;
  premiumPrice?: number;
  category: string;
  handle: string;
  imageUrl?: string;
  audioPreviewUrl?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
  vendor?: string;
  isNew: boolean;
  isPremium: boolean;
}
```

### Cart

```typescript
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
```

---

## დაკავშირებული დოკუმენტაცია

- [Auth System Architecture](../technical/architecture/auth-system.md)
- [Service Layer Architecture](../technical/architecture/service-layer.md)
- [Cart System](../technical/features/cart-system.md)
- [Testing Guide](../technical/testing.md)

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-19 | დოკუმენტაციის შექმნა feature/backend-integration branch-ისთვის |
