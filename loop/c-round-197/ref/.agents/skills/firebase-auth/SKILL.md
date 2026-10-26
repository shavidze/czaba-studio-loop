---
name: firebase-auth
description: Google Sign-In integration with Firebase for CZABA Store. Use when working on authentication, login flow, social auth, or token management.
---

# Firebase Authentication

Firebase Auth for CZABA Store - Google Sign-In popup, ID token verification with backend.

## Auth Flow

```
User clicks "Sign in with Google"
        │
        ▼
Firebase popup → User selects Google account
        │
        ▼
Firebase returns ID Token (JWT with user info)
        │
        ▼
Frontend sends ID Token to Backend /api/auth/social
        │
        ▼
Backend verifies token, creates/finds user
Returns: accessToken + refreshToken
        │
        ▼
Frontend stores tokens in localStorage
User is now authenticated!
```

## Key Concepts

- **Firebase Project:** czaba-api (only Google Sign-In, no Firestore)
- **Token Storage:** `localStorage.auth_user` (accessToken, refreshToken, user)
- **Popup fallback:** If popup blocked → redirect method
- **Token refresh:** 401 interceptor auto-refreshes, on failure → logout
- **Backend verification:** Firebase Admin SDK `VerifyIdTokenAsync()`

## Error Codes

| Error Code | Handling |
|------------|----------|
| `auth/popup-blocked` | Fallback to `signInWithRedirect` |
| `auth/popup-closed-by-user` | Show "Sign in cancelled" |
| `auth/network-request-failed` | Show network error |

## Security Best Practices

1. **Always verify ID token on backend** - Never trust client-side auth alone
2. **Short access token lifetime** - 15 minutes recommended
3. **Secure refresh token** - HttpOnly cookie or encrypted storage
4. **Check token expiration** - Before making API calls
5. **Handle sign-out everywhere** - Clear all storage, revoke refresh token

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Popup blocked | Browser settings | Use redirect fallback |
| Invalid token | Expired or tampered | Re-authenticate |
| CORS error | Wrong domain in Firebase | Add domain to authorized |
| User not created | Backend error | Check logs, verify token |

## Implementation Details

Full code templates: `references/auth-implementation.md`

## References

- [Firebase Auth Web](https://firebase.google.com/docs/auth/web/start)
- [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- `docs/technical/architecture/auth-system.md` - CZABA auth documentation
