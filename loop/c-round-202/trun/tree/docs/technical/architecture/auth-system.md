# Authentication System Architecture

## შესავალი

CZABA Store იყენებს **Backend-centric ავტორიზაციის სისტემას**, სადაც .NET Backend მართავს ყველა auth ოპერაციას. Firebase გამოიყენება მხოლოდ Google popup-ისთვის ID Token-ის მისაღებად.

**რატომ Backend?** სრული კონტროლი მომხმარებლებზე, refresh tokens, session management და მომავალში სხვა OAuth providers-ის მარტივი დამატება.

---

## არქიტექტურის დიაგრამა

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EMAIL/PASSWORD                    SOCIAL (Google)              │
│  ──────────────                    ──────────────               │
│       │                                 │                       │
│       ▼                                 ▼                       │
│  ┌──────────┐                    ┌───────────┐                  │
│  │ Frontend │                    │  Firebase │                  │
│  │ Form     │                    │   Popup   │                  │
│  └────┬─────┘                    └─────┬─────┘                  │
│       │                                │                        │
│       │                                ▼                        │
│       │                          Get Firebase                   │
│       │                          ID Token                       │
│       │                                │                        │
│       └────────────┬───────────────────┘                        │
│                    ▼                                            │
│            ┌────────────────┐                                   │
│            │  .NET Backend  │                                   │
│            │ /api/auth/*    │                                   │
│            └───────┬────────┘                                   │
│                    │                                            │
│                    ▼                                            │
│            ┌────────────────┐                                   │
│            │ JWT Tokens     │                                   │
│            │ - accessToken  │ ◄── localStorage                  │
│            │ - refreshToken │                                   │
│            └────────────────┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## კომპონენტები

### 1. Backend API (მთავარი Auth Provider)

**Endpoint:** `.NET Backend /api/auth/*`

**ფაილი:** `app/services/api/client.ts`

Backend მართავს ყველა auth ოპერაციას:

| Endpoint | აღწერა |
|----------|--------|
| `POST /api/auth/login` | Email/Password login |
| `POST /api/auth/register` | ახალი მომხმარებლის რეგისტრაცია |
| `POST /api/auth/social` | Firebase ID Token-ით login/register |
| `POST /api/auth/refresh` | Access token განახლება |
| `GET /api/auth/profile` | მომხმარებლის პროფილი |
| `PUT /api/auth/profile` | პროფილის განახლება |
| `POST /api/auth/forgot-password` | პაროლის აღდგენის email |
| `POST /api/auth/reset-password` | ახალი პაროლის დაყენება |

### 2. Firebase (Social Login Only)

**ფაილი:** `app/lib/firebase.client.ts`

Firebase გამოიყენება **მხოლოდ** Google popup-ისთვის:

```typescript
import { initFirebase, signInWithGooglePopup, getIdToken } from '~/lib/firebase.client';

// 1. Initialize Firebase
await initFirebase();

// 2. Open Google popup
const result = await signInWithGooglePopup();

// 3. Get ID token
const idToken = await getIdToken(result.user);

// 4. Send to Backend
const response = await apiClient.socialLogin({ idToken });
```

### 3. Auth Library

**ფაილი:** `app/lib/auth.ts`

აბსტრაქცია API client-ის ზემოდან:

```typescript
export async function signIn(email: string, password: string): Promise<User>;
export async function signUp(name: string, email: string, password: string): Promise<User>;
export async function signInWithGoogle(): Promise<User>;
export async function signOut(): Promise<void>;
export async function resetPassword(email: string): Promise<void>;
export async function getCurrentCustomer(accessToken: string): Promise<User | null>;
export async function updateProfile(accessToken: string, firstName: string, lastName: string): Promise<User>;
```

### 4. Auth Context

**ფაილი:** `app/contexts/AuthContext.tsx`

React Context, რომელიც მართავს auth state-ს მთელ აპლიკაციაში.

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;  // Hydration state
  isModalOpen: boolean;
  modalView: 'signin' | 'signup' | 'forgot-password';

  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  openModal: (view?: AuthModalView) => void;
  closeModal: () => void;
}
```

**Session Storage:**
- `localStorage.auth_user` - JWT Access Token + user data

---

## User Object

```typescript
interface User {
  id: number;                    // Backend User ID
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;                  // Full name
  accessToken: string;           // JWT Access Token
  refreshToken: string;          // JWT Refresh Token
  accessTokenExpires: string;    // ISO date
  profileImageUrl?: string;
  authProvider?: string;         // 'email' | 'google'
  emailVerified?: boolean;
  registrationSource: RegistrationSource;
}

type RegistrationSource = 'email' | 'google' | 'facebook';
```

---

## Auth Flow-ები

### Email/Password Sign Up

```
1. User submits registration form
2. signUp() → apiClient.register({ email, password, firstName, lastName })
3. Backend creates user, returns JWT tokens
4. apiClient.setAccessToken(accessToken)
5. Store user in localStorage
```

### Email/Password Sign In

```
1. User submits login form
2. signIn() → apiClient.login({ email, password })
3. Backend validates, returns JWT tokens
4. apiClient.setAccessToken(accessToken)
5. Store user in localStorage
```

### Google Sign In

```
1. User clicks "Sign in with Google"
2. initFirebase() + signInWithGooglePopup()
3. Firebase popup opens
4. User authenticates with Google
5. getIdToken(firebaseUser) → Firebase ID Token
6. apiClient.socialLogin({ idToken })
7. Backend verifies token, creates/finds user
8. Returns JWT tokens
9. Store user in localStorage
```

**Backend Social Login Logic:**
- Firebase ID Token-ს ვერიფიცირებს Firebase Admin SDK-ით
- თუ email უკვე არსებობს → login
- თუ არ არსებობს → register
- აბრუნებს isNewUser: true/false

### Password Reset

```
1. User enters email
2. apiClient.forgotPassword(email)
3. Backend sends reset email with token
4. User clicks link → /account/reset?token=...
5. apiClient.resetPassword(token, newPassword)
6. User redirected to login
```

---

## ფაილების სტრუქტურა

```
app/
├── lib/
│   ├── auth.ts                    # Auth API abstraction
│   └── firebase.client.ts         # Firebase client (Google popup only)
├── services/
│   └── api/
│       └── client.ts              # ApiClient with auth methods
├── contexts/
│   └── AuthContext.tsx            # Auth state management
├── components/auth/
│   ├── AuthModal.tsx              # Modal container
│   ├── SignInForm.tsx             # Login form + social buttons
│   ├── SignUpForm.tsx             # Registration form
│   ├── ForgotPasswordForm.tsx     # Password reset request
│   └── RequireAuth.tsx            # Protected route wrapper
├── routes/
│   ├── account_.login.tsx         # Login page
│   ├── account.tsx                # My Account - profile
│   ├── account.reset.tsx          # Password reset (with token)
│   ├── account.downloads.tsx      # Protected: downloads
│   └── account.orders.tsx         # Protected: orders
└── types/
    └── auth.ts                    # Auth types & error codes
```

---

## Environment Variables

```env
# Backend API
VITE_API_URL=http://localhost:5199
API_URL=http://localhost:5199

# Firebase Client (VITE_ prefix for client-side)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

---

## JWT Token Management

### Access Token
- მოკლე ვადიანი (15-30 min)
- ინახება `localStorage.auth_user.accessToken`
- იგზავნება `Authorization: Bearer <token>`

### Refresh Token
- გრძელვადიანი (7-30 days)
- ინახება `localStorage.auth_user.refreshToken`
- გამოიყენება access token-ის განახლებისთვის

### Token Refresh Flow

```typescript
// TODO: Implement automatic token refresh
// 1. Check if accessToken is expired (or close to expiry)
// 2. Call apiClient.refreshToken(refreshToken)
// 3. Update stored tokens
```

---

## Error Handling

### Auth Errors

```typescript
// app/types/auth.ts
export const AUTH_ERRORS = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_EXISTS: 'An account with this email already exists',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  INVALID_CREDENTIALS: 'Invalid email or password',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  // ...
};
```

### Usage in Components

```typescript
try {
  await signIn(email, password);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);  // User-friendly message
  }
}
```

---

## My Account გვერდი (/account)

### Profile Section
- **Email:** Read-only
- **First Name, Last Name:** რედაქტირებადი
- **Profile Image:** Social login-ისას Google-დან

### Password Section
- **Email users:** შეუძლიათ პაროლის შეცვლა (TODO: implement endpoint)
- **Social users:** ნაჩვენებია info message

---

## TODO / გაუმჯობესებები

- [x] Backend-ზე გადატანა (Shopify-დან)
- [x] Google Social Login
- [x] JWT token management
- [ ] Automatic token refresh
- [ ] Facebook Social Login
- [ ] Email verification flow
- [ ] Account deletion
- [ ] Password change for email users

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-18 | დოკუმენტაცია განახლდა: Backend-centric auth architecture |
| 2026-01-18 | Shopify Customer API ჩანაცვლდა .NET Backend-ით |
| 2026-01-03 | My Account გვერდი, registrationSource |
| 2025-01-03 | დოკუმენტაციის შექმნა (Shopify-based) |
