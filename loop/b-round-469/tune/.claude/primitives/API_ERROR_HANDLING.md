# API_ERROR_HANDLING

## API Client Error Handling Pattern

Token refresh, retry logic და error extraction.

## API Client Structure

```typescript
class ApiClient {
  private accessToken?: string
  private refreshPromise: Promise<AuthResponse> | null = null
  private onSessionExpired?: () => void

  setAccessToken(token?: string) {
    this.accessToken = token
  }

  setOnSessionExpired(callback: () => void) {
    this.onSessionExpired = callback
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    skipAuthRefresh = false
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken && {
            Authorization: `Bearer ${this.accessToken}`,
          }),
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      // Handle 401 - Token expired
      if (response.status === 401 && !skipAuthRefresh) {
        return this.handleUnauthorized(method, url, data)
      }

      if (!response.ok) {
        const error = await response.json()
        throw new ApiError(response.status, error.message, error.errorCode)
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error')
    }
  }

  private async handleUnauthorized<T>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      this.onSessionExpired?.()
      throw new ApiError(401, 'Session expired')
    }

    // Prevent multiple simultaneous refresh calls
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshTokenInternal(refreshToken)
    }

    try {
      const authResponse = await this.refreshPromise
      this.accessToken = authResponse.accessToken
      this.saveTokens(authResponse)

      // Retry original request with new token
      return this.request<T>(method, url, data, true)
    } catch {
      this.onSessionExpired?.()
      throw new ApiError(401, 'Session expired')
    } finally {
      this.refreshPromise = null
    }
  }

  private async refreshTokenInternal(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Refresh failed')
    }

    return response.json()
  }
}
```

## ApiError Class

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorCode?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
```

## Error Message Extraction

```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any
    return (
      err.response?.data?.message ||
      err.response?.data?.error?.message ||
      err.message ||
      'Something went wrong'
    )
  }

  return 'Something went wrong'
}
```

## Component-ში გამოყენება

```typescript
// Form submission
const handleSubmit = async (data: FormData) => {
  setIsLoading(true)
  setError(null)

  try {
    await apiClient.createProduct(data)
    toast.success('Product created')
    navigate('/products')
  } catch (error) {
    const message = getErrorMessage(error)

    // Field-level vs general error
    if (error instanceof ApiError && error.errorCode) {
      if (error.errorCode >= 50001 && error.errorCode <= 50099) {
        // Validation error - show at field level
        setFieldError('name', message)
      } else {
        // Business error - show as toast
        toast.error(message)
      }
    } else {
      toast.error(message)
    }
  } finally {
    setIsLoading(false)
  }
}
```

## AuthContext Integration

```typescript
// AuthContext.tsx
useEffect(() => {
  // Set up session expired callback
  apiClient.setOnSessionExpired(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
    toast.error('Session expired. Please log in again.')
  })
}, [])
```

## HTTP Status → User Message

```typescript
export function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Please log in',
    403: 'Access denied',
    404: 'Not found',
    409: 'Already exists',
    429: 'Too many requests. Please wait.',
    500: 'Server error. Please try again.',
  }
  return messages[status] || 'Something went wrong'
}
```

## Error Code → Action Mapping

```typescript
function handleApiError(error: ApiError) {
  const { status, errorCode, message } = error

  // 401 - Already handled by API client (refresh or logout)
  if (status === 401) return

  // 403 - Redirect to home
  if (status === 403) {
    toast.error('Access denied')
    navigate('/')
    return
  }

  // 404 - Show not found
  if (status === 404) {
    toast.error(message || 'Not found')
    return
  }

  // 50001-50099 - Validation (field-level)
  if (errorCode && errorCode >= 50001 && errorCode <= 50099) {
    // Let form handle it
    throw error
  }

  // Everything else - toast
  toast.error(message || getHttpErrorMessage(status))
}
```

## Checklist

- [ ] ApiError class with status, message, errorCode
- [ ] Token refresh with single promise (prevent duplicate calls)
- [ ] Retry original request after refresh
- [ ] onSessionExpired callback for logout
- [ ] getErrorMessage utility for catch blocks
- [ ] Field-level vs toast error display
- [ ] HTTP status → user message mapping
