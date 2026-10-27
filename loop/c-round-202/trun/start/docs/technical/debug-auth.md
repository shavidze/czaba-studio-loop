# Auth System Debugging

CZABA .NET Backend Auth სისტემის debugging გზამკვლევი.

## არქიტექტურა

```
Email/Password → Czaba API /api/auth/login → JWT tokens
Google OAuth   → Firebase popup → ID Token → /api/auth/social → JWT tokens

Token Storage: localStorage('auth_user') → { accessToken, refreshToken }
Token Refresh: 401 → /api/auth/refresh → ახალი tokens (ავტომატური)
```

---

## ფაილების მდებარეობა

| ფაილი | დანიშნულება |
|-------|-------------|
| `app/lib/auth.ts` | Auth ფუნქციები (signIn, signUp, signInWithGoogle, resetPassword, updateProfile) |
| `app/lib/firebase.client.ts` | Firebase config + Google/Facebook popup |
| `app/contexts/AuthContext.tsx` | Auth state management + modal control |
| `app/services/api/client.ts` | ApiClient (login, register, socialLogin, refreshToken, profile) |
| `app/types/auth.ts` | User, AuthContextValue, AUTH_ERRORS |
| `app/components/auth/` | Auth UI კომპონენტები |

---

## API Endpoints

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/register` | ახალი ანგარიში |
| POST | `/api/auth/social` | Firebase ID token → JWT |
| POST | `/api/auth/refresh` | Token refresh |
| GET | `/api/auth/profile` | პროფილის წამოღება |
| PUT | `/api/auth/profile` | პროფილის განახლება |
| POST | `/api/auth/forgot-password` | პაროლის აღდგენის email |
| POST | `/api/auth/reset-password` | ახალი პაროლის დაყენება |

---

## Debug Checklist

### 1. Email/Password Login არ მუშაობს

```typescript
// auth.ts → signIn() → apiClient.login()
// POST /api/auth/login { email, password }

// ხშირი შეცდომები:
// - 401 / "invalid" → AUTH_ERRORS.INVALID_CREDENTIALS
// - "exists" / "already" → AUTH_ERRORS.EMAIL_EXISTS (register-ზე)
```

**გადამოწმება:**
```typescript
import { apiClient } from '~/services/api/client';
const response = await apiClient.login({ email: 'test@example.com', password: 'password' });
// response: { userId, email, firstName, lastName, accessToken, refreshToken, accessTokenExpires }
```

### 2. Google Sign-In არ მუშაობს

**Flow:**
```
1. initFirebase() → Firebase app init (singleton)
2. signInWithGooglePopup() → GoogleAuthProvider + signInWithPopup
3. getIdToken(result.user) → Firebase ID Token
4. apiClient.socialLogin({ idToken }) → Backend verifies → JWT tokens
5. authResponseToUser() → User object
6. apiClient.setAccessToken() → subsequent API calls
```

**ხშირი პრობლემები:**

| პრობლემა | მიზეზი | გადაწყვეტა |
|----------|--------|-----------|
| Popup blocked | Browser settings | redirect fallback არ არის implement-ებული |
| "Failed to get ID token" | Firebase auth failed | შეამოწმე Firebase config |
| Backend 401/500 | ID token verification failed | შეამოწმე backend Firebase Admin SDK |
| "czaba-api" project | Firebase project ID | `firebase.client.ts`-ში config |

### 3. Token Refresh არ მუშაობს

```
401 Response → ApiClient.request() checks →
  getStoredRefreshToken() from localStorage →
  refreshTokenInternal() → POST /api/auth/refresh →
  Success: update token + retry original request
  Fail: onSessionExpired() → clear user, show login modal
```

**Subscriber pattern:** ერთდროულად მხოლოდ ერთი refresh request (this.refreshPromise).

**გადამოწმება:**
```typescript
const refreshToken = JSON.parse(localStorage.getItem('auth_user'))?.refreshToken;
const response = await apiClient.refreshToken(refreshToken);
```

### 4. Session არ ინახება / იკარგება

```typescript
// localStorage key: 'auth_user'
// შეიცავს: User object with accessToken, refreshToken, accessTokenExpires

// შეამოწმე:
JSON.parse(localStorage.getItem('auth_user'));

// AuthContext mount-ზე:
// 1. localStorage-დან წაიკითხავს
// 2. apiClient.setAccessToken() - API client-ს მისცემს token-ს
// 3. getCurrentCustomer() - backend-ზე ვერიფიცირებს (GET /api/auth/profile)
// 4. თუ invalid → localStorage.removeItem('auth_user')
```

### 5. Multi-tab Sync არ მუშაობს

```typescript
// AuthContext listens to 'storage' event:
// - e.key === 'auth_user'
// - e.newValue === null → logout
// - e.newValue !== null → parse and update user + token
```

**ტესტი:** ორ tab-ში გახსენი, ერთში logout → მეორეში ავტომატურად უნდა გაილოგაუთოს.

### 6. Profile Update არ მუშაობს

```typescript
// auth.ts → updateProfile() → apiClient.updateProfile()
// PUT /api/auth/profile { firstName, lastName }
// Backend-დან ბრუნდება: UserProfile
// localStorage-ში ნახლდება
```

### 7. Password Reset არ მუშაობს

```typescript
// Step 1: auth.ts → resetPassword(email) → apiClient.forgotPassword(email)
//         POST /api/auth/forgot-password { email }
//         Backend ყოველთვის 200 აბრუნებს (security)

// Step 2: auth.ts → customerResetPassword(token, newPassword)
//         POST /api/auth/reset-password { token, newPassword }
//         token მოდის email link-იდან
```

**Password change (authenticated):** არ არის implement-ებული backend-ზე.

---

## User Object Structure

```typescript
interface User {
  id: number;                    // Backend user ID
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;                  // firstName + lastName ან email
  accessToken: string;           // JWT
  refreshToken: string;
  accessTokenExpires: string;    // ISO datetime
  profileImageUrl?: string;      // Google avatar
  authProvider?: string;         // 'email' | 'google' | 'facebook'
  emailVerified?: boolean;
  registrationSource: RegistrationSource;  // 'email' | 'google' | 'facebook' | 'apple'
}
```

---

## AuthResponse (API-დან)

```typescript
interface AuthResponse {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  isNewUser?: boolean;          // social login-ზე, ახალი user-ია თუ არსებული
}
```

---

## ApiClient Token Management

```typescript
// Token-ის დაყენება
apiClient.setAccessToken(token);

// ავტომატური refresh callback
apiClient.setTokenRefreshCallback((response: AuthResponse) => {
  // localStorage-ში ნახლდება
  // user state ნახლდება
});

// Session expired callback
apiClient.setSessionExpiredCallback(() => {
  // user = null
  // localStorage cleared
  // login modal opens
});
```

---

## Environment Variables

```env
# API URL (default: http://localhost:5199)
VITE_API_URL=http://localhost:5199

# Firebase Client (hardcoded in firebase.client.ts)
# Project: czaba-api
# authDomain: czaba-api.firebaseapp.com
```

---

## Console Debugging

```typescript
// მიმდინარე user
JSON.parse(localStorage.getItem('auth_user'));

// Token validity - profile request
const { apiClient } = await import('~/services/api/client');
apiClient.setAccessToken(JSON.parse(localStorage.getItem('auth_user')).accessToken);
await apiClient.getProfile();

// Firebase state
const { getFirebaseAuth } = await import('~/lib/firebase.client');
getFirebaseAuth().currentUser;

// Force token refresh
const user = JSON.parse(localStorage.getItem('auth_user'));
await apiClient.refreshToken(user.refreshToken);
```

---

## Common Issues

| პრობლემა | მიზეზი | გადაწყვეტა |
|----------|--------|-----------|
| "Please sign in to continue" | Token expired + refresh failed | Clear localStorage, re-login |
| "Connection failed" | Backend არ არის გაშვებული | `dotnet run` port 5199 |
| Google popup არ იხსნება | Browser blocks popup | User gesture required |
| Profile ცარიელია login-ის შემდეგ | firstName/lastName null backend-იდან | Check register request |
| "Password change not implemented" | Backend endpoint არ არსებობს | Use forgot-password flow |
| Multi-tab out of sync | storage event არ fires same tab-ზე | მხოლოდ cross-tab მუშაობს |

თუ $ARGUMENTS მითითებულია, debug კონკრეტული auth პრობლემა. თუ ცარიელია, შეამოწმე მთელი auth flow.
