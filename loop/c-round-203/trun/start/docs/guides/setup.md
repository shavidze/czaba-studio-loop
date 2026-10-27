# Setup Guide - Czaba Music Store

## მიმდინარე სტატუსი (feature/backend-integration)

Frontend გაშვებულია: **http://localhost:5173/**
Backend API: **http://localhost:5199/**

## არქიტექტურა

### Backend-Centric მიდგომა

ეს branch იყენებს **Czaba .NET Backend**-ს Shopify-ის ნაცვლად:

```
┌─────────────────┐     ┌──────────────────────┐
│  Remix Frontend │────►│  Czaba .NET Backend  │
│  localhost:5173 │     │  localhost:5199      │
└─────────────────┘     └──────────────────────┘
         │
         ▼
┌─────────────────┐
│    Firebase     │  ◄── მხოლოდ Google Sign-In
│    (czaba-api)  │
└─────────────────┘
```

### რა მართავს Backend?
- **Products** - პროდუქტების ბაზა, ფილტრაცია, ძიება
- **Auth** - Email/Password + Social login (JWT tokens)
- **Cart** - კალათა (guest + authenticated users)
- **Orders** - შეკვეთები და checkout

### რისთვის გამოიყენება Firebase?
- **მხოლოდ** Google Sign-In popup
- **არ** გამოიყენება: Firestore, data storage

## Technical Stack

- **Remix** - React framework with SSR
- **TypeScript** - Type-safe code
- **Tailwind v4** - Styling
- **Vite** - Fast development
- **Czaba .NET Backend** - API server
- **Firebase** - Social authentication only

## გაშვება (Development Setup)

### 1. Backend-ის გაშვება

```bash
# Backend folder-ში
cd czaba-api
dotnet run
# API გაეშვება: http://localhost:5199
```

### 2. Frontend-ის გაშვება

```bash
# Frontend folder-ში
cd czaba-store
npm install
npm run dev
# App გაეშვება: http://localhost:5173
```

### 3. Environment Variables

შექმენი `.env` ფაილი:

```env
# Backend API
VITE_API_URL=http://localhost:5199
API_URL=http://localhost:5199

# Firebase (Social Login - Google Sign-In)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=czaba-api.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=czaba-api
VITE_FIREBASE_APP_ID=your_app_id
```

## პროდუქტების მართვა

### Backend Database

პროდუქტები ინახება .NET Backend-ის ბაზაში. თითოეულ პროდუქტს აქვს:

| ველი | ტიპი | აღწერა |
|------|------|--------|
| `id` | number | უნიკალური ID |
| `title` | string | პროდუქტის სახელი |
| `handle` | string | URL-friendly slug |
| `category` | string | "Music", "SFX", "Preset" |
| `standardPrice` | number | ფასი |
| `genre` | string | ჟანრი |
| `bpm` | number | BPM (მუსიკისთვის) |
| `key` | string | კლავიში (მაგ: "Am") |
| `duration` | number | ხანგრძლივობა წამებში |
| `isNew` | boolean | ახალი პროდუქტი? |
| `isPremium` | boolean | Premium პროდუქტი? |

### ფილტრაცია

Frontend იყენებს Backend API-ს ფილტრაციისთვის:

```typescript
// მაგალითი: მუსიკის ფილტრაცია
const products = await apiClient.getProducts({
  category: 'Music',
  genre: 'Cinematic',
  minBpm: 80,
  maxBpm: 120,
  page: 1,
  pageSize: 20,
});
```

## ავტორიზაცია

### Email/Password Login

```typescript
import { apiClient } from '~/services/api';

// Login
const response = await apiClient.login({ email, password });
// response: { accessToken, refreshToken, userId, ... }

// Register
const response = await apiClient.register({
  email,
  password,
  firstName,
  lastName,
});
```

### Google Sign-In (Firebase)

```typescript
import { signInWithGoogle } from '~/lib/firebase.client';
import { apiClient } from '~/services/api';

// 1. Firebase popup
const result = await signInWithGoogle();
const idToken = await result.user.getIdToken();

// 2. Backend verification
const response = await apiClient.socialLogin({ idToken });
```

### JWT Token Management

- **Access Token:** მოკლევადიანი (15-30 წთ), `Authorization: Bearer <token>`
- **Refresh Token:** გრძელვადიანი (7-30 დღე)
- **Storage:** `localStorage.auth_user`

## კალათა (Cart)

```typescript
import { apiClient } from '~/services/api';

// Guest users use sessionId
const sessionId = localStorage.getItem('czaba_session_id');

// Get cart
const cart = await apiClient.getCart(sessionId);

// Add item
const cart = await apiClient.addToCart({ productId: 123, quantity: 1 }, sessionId);

// Remove item
const cart = await apiClient.removeCartItem(itemId, sessionId);

// Checkout
const order = await apiClient.checkout();
```

## Development Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run test:run    # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
```

## პროექტის სტრუქტურა

```
czaba-store/
├── app/
│   ├── routes/                    # Remix routes
│   ├── services/
│   │   └── api/
│   │       └── client.ts          # Backend API client
│   ├── lib/
│   │   ├── auth.ts                # Auth functions
│   │   └── firebase.client.ts     # Firebase config
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state
│   │   └── CartContext.tsx        # Cart state
│   └── components/
├── docs/                          # Documentation
└── .env                           # Environment variables
```

## ხშირი პრობლემები

### Backend არ პასუხობს?
- შეამოწმე გაშვებულია თუ არა: `dotnet run`
- შეამოწმე port: `http://localhost:5199`

### Google Sign-In არ მუშაობს?
- შეამოწმე Firebase config `.env`-ში
- შეამოწმე Firebase Console-ში Google provider enabled-ია

### Cart არ ინახება?
- შეამოწმე `czaba_session_id` localStorage-ში
- შეამოწმე Backend logs

## დოკუმენტაცია

| თემა | ფაილი |
|------|-------|
| Auth System | `docs/technical/architecture/auth-system.md` |
| Service Layer | `docs/technical/architecture/service-layer.md` |
| Cart System | `docs/technical/features/cart-system.md` |
| Testing | `docs/technical/testing.md` |
