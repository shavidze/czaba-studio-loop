# REACT_CONTEXT

## React Context Pattern

Czaba იყენებს Context API state management-ისთვის.

### Context სტრუქტურა

```tsx
// 1. Types
interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

// 2. Initial State
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null
}

// 3. Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// 4. Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  // Actions with useCallback to prevent re-renders
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.login({ email, password })
      localStorage.setItem('auth_tokens', JSON.stringify(response.data))
      setState(prev => ({ ...prev, user: response.data.user, isLoading: false }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_tokens')
    setState({ ...initialState, isLoading: false })
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.getMe()
      setState(prev => ({ ...prev, user: response.data }))
    } catch {
      logout()
    }
  }, [logout])

  // Initialize on mount
  useEffect(() => {
    const tokens = localStorage.getItem('auth_tokens')
    if (tokens) {
      refreshUser()
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [refreshUser])

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 5. Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Provider Hierarchy (root.tsx)

```tsx
export default function App() {
  return (
    <AuthProvider>
      <PurchasesProvider>
        <CartProvider>
          <ToastProvider>
            <AudioProvider>
              <Outlet />
            </AudioProvider>
          </ToastProvider>
        </CartProvider>
      </PurchasesProvider>
    </AuthProvider>
  )
}
```

### გამოყენება კომპონენტში

```tsx
function UserProfile() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) return <Spinner />
  if (!user) return <LoginPrompt />

  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### useCallback Pattern

```tsx
// ✅ სწორი - useCallback ფუნქციებისთვის
const addToCart = useCallback(async (productId: number) => {
  setState(prev => ({ ...prev, isLoading: true }))
  // ...
}, []) // dependencies

// ✅ სწორი - setState callback
setState(prev => ({ ...prev, count: prev.count + 1 }))

// ❌ არასწორი - setState direct
setState({ ...state, count: state.count + 1 }) // stale closure
```

### Cleanup Pattern

```tsx
useEffect(() => {
  let isMounted = true

  async function fetchData() {
    const data = await apiClient.getData()
    if (isMounted) {
      setState(prev => ({ ...prev, data }))
    }
  }

  fetchData()

  return () => {
    isMounted = false
  }
}, [])
```

### Context Types Export

```tsx
// contexts/AuthContext.tsx
export type { AuthContextValue, AuthState }
export { AuthProvider, useAuth }
```

## File Size Limits (Saba, 2026-11-10)

**Hard limits — enforced by B and C:**

| File type | Max lines | Action when exceeded |
|-----------|-----------|---------------------|
| Component (.tsx) | **400 lines** | B must plan extraction in the same round |
| Context (.tsx) | **800 lines** | B must split into separate contexts |
| Hook (.ts) | **300 lines** | B must split into composable hooks |
| Utility (.ts) | **200 lines** | B must split by domain |
| Test (.test.ts/tsx) | **1000 lines** | Acceptable (tests are verbose) |

**How it works:**
1. Before A starts implementation, B checks: will the target file exceed the limit after this change?
2. If yes, B's plan MUST include an extraction step — move existing code to a new file first, then add the new code
3. C verifies: no file exceeds its limit after the round (except tests)
4. If C finds a violation, it is a Medium finding that blocks the gate

**Existing violations (tech debt, to be resolved):**
- `ArrangementContext.tsx: 5,327 lines (limit 800)) — needs architecture redesign
- `StudioWorkspace.tsx`: 3,718 lines (limit 400) — needs component extraction
- `ArrangementDetailPanel.tsx`: 1,423 lines (limit 400)
- `ArrangementLane.tsx`: 1,371 lines (limit 400)
- `StudioContext.tsx: 1,755 lines (limit 800))

These are tracked in `docs/technical/studio-real-workspace/architecture-file-size-audit-2026-11-10.md` and will be resolved when the frontend-architect agent provides the split plan.

**The rule applies to NEW code only** — agents must not add lines to an already-oversized file without extracting at least as many lines first ("one in, one out" until the file is under the limit).
