# Firebase Auth Implementation Reference

## Configuration

```typescript
// lib/firebase.client.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "czaba-api.firebaseapp.com",
  projectId: "czaba-api",
  storageBucket: "czaba-api.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

## Google Sign-In Implementation

```typescript
// lib/auth.ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase.client';
import { apiClient } from '~/services/api';

export async function signInWithGoogle(): Promise<AuthResponse> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  const response = await apiClient.socialLogin({ idToken });

  localStorage.setItem('auth_user', JSON.stringify({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user
  }));

  return response;
}
```

## AuthContext Integration

```typescript
// contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const { user, accessToken } = JSON.parse(stored);
      verifyToken(accessToken).then(valid => {
        if (valid) {
          setUser(user);
        } else {
          refreshAuth();
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const response = await authLib.signInWithGoogle();
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await auth.signOut();
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Popup Blocked Handling

```typescript
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const result = await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      throw new Error('Popup blocked. Redirecting...');
    }

    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in cancelled');
    }

    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    }

    throw error;
  }
}
```

## Backend Verification (.NET)

```csharp
// AuthService.cs
public async Task<AuthResponse> SocialLoginAsync(SocialLoginRequest request)
{
    var decodedToken = await FirebaseAuth.DefaultInstance
        .VerifyIdTokenAsync(request.IdToken);

    var email = decodedToken.Claims["email"].ToString();
    var name = decodedToken.Claims["name"]?.ToString();
    var picture = decodedToken.Claims["picture"]?.ToString();

    var user = await _userRepository.GetByEmailAsync(email);

    if (user == null)
    {
        user = await _userRepository.CreateAsync(new CreateUserRequest
        {
            Email = email,
            FirstName = name?.Split(' ').FirstOrDefault() ?? "",
            LastName = name?.Split(' ').Skip(1).FirstOrDefault() ?? "",
            AvatarUrl = picture,
            AuthProvider = "google"
        });
    }

    var accessToken = GenerateAccessToken(user);
    var refreshToken = await GenerateRefreshTokenAsync(user.Id);

    return new AuthResponse
    {
        AccessToken = accessToken,
        RefreshToken = refreshToken,
        User = MapToUserResponse(user)
    };
}
```

## Token Storage Pattern

```typescript
const AUTH_STORAGE_KEY = 'auth_user';

export const tokenStorage = {
  get: () => {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  set: (auth: AuthData) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  },

  clear: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getAccessToken: () => {
    return tokenStorage.get()?.accessToken;
  },

  getRefreshToken: () => {
    return tokenStorage.get()?.refreshToken;
  }
};
```

## Auto Token Refresh

```typescript
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        const response = await apiClient.refresh({ refreshToken });

        tokenStorage.set({
          ...tokenStorage.get(),
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });

        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```
