# Authentication System Module

> მოდულური პრომპტი Auth სისტემის იმპლემენტაციისთვის

---

## 🔐 Prompt: Hybrid Authentication System

```markdown
დაამატე Hybrid Authentication სისტემა შემდეგი არქიტექტურით:

## არქიტექტურა

```
┌─────────────────────────────────────────────────────────┐
│                   AUTH FLOW                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  EMAIL/PASSWORD              SOCIAL (Google/Facebook)    │
│       │                              │                   │
│       ▼                              ▼                   │
│  ┌─────────┐                  ┌───────────┐             │
│  │ Shopify │                  │  Firebase │             │
│  │Customer │                  │   Auth    │             │
│  │   API   │                  │  (popup)  │             │
│  └────┬────┘                  └─────┬─────┘             │
│       │                             │                    │
│       │                    Get email + UID               │
│       │                             │                    │
│       │                             ▼                    │
│       │                   ┌──────────────────┐          │
│       │                   │ Create Shopify   │          │
│       │                   │ Customer with    │          │
│       │                   │ password:        │          │
│       │                   │ {Provider}_{UID} │          │
│       │                   └────────┬─────────┘          │
│       │                            │                     │
│       └────────────┬───────────────┘                     │
│                    ▼                                     │
│            ┌───────────────┐                            │
│            │ Shopify Token │ ← localStorage              │
│            └───────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

## ფაილების სტრუქტურა

```
app/
├── lib/
│   ├── auth.ts                    # Shopify Customer API functions
│   ├── firebase.client.ts         # Firebase client init + social
│   ├── firebase-shopify-auth.ts   # Social → Shopify bridge
│   └── firebase.server.ts         # Firebase Admin (optional)
├── contexts/
│   └── AuthContext.tsx            # Global auth state
├── components/auth/
│   ├── AuthModal.tsx              # Modal container
│   ├── SignInForm.tsx             # Email/password + social buttons
│   ├── SignUpForm.tsx             # Registration form
│   ├── ForgotPasswordForm.tsx     # Password reset
│   └── RequireAuth.tsx            # Protected route wrapper
├── hooks/
│   └── useAuth.ts                 # Auth hook
└── types/
    └── auth.ts                    # Types & error constants
```

## Types (auth.ts)

```typescript
export type RegistrationSource = 'email' | 'google' | 'facebook';
export type AuthModalView = 'signin' | 'signup' | 'forgotPassword';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  accessToken: string;
  phone?: string;
  registrationSource: RegistrationSource;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isModalOpen: boolean;
  modalView: AuthModalView;
  openModal: (view?: AuthModalView) => void;
  closeModal: () => void;
  setAuthView: (view: AuthModalView) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AUTH_ERRORS = {
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_EMAIL: 'Please enter a valid email',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};
```

## GraphQL Mutations

```graphql
# რეგისტრაცია
mutation customerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer { id email firstName lastName }
    customerUserErrors { code field message }
  }
}

# ავტორიზაცია
mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken { accessToken expiresAt }
    customerUserErrors { code field message }
  }
}

# გამოსვლა
mutation customerAccessTokenDelete($customerAccessToken: String!) {
  customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
    deletedAccessToken
    userErrors { field message }
  }
}

# პაროლის აღდგენა (email გაგზავნა)
mutation customerRecover($email: String!) {
  customerRecover(email: $email) {
    customerUserErrors { code field message }
  }
}

# პაროლის დაყენება (reset link-დან)
mutation customerReset($id: ID!, $input: CustomerResetInput!) {
  customerReset(id: $id, input: $input) {
    customer { id email }
    customerUserErrors { code field message }
  }
}

# პროფილის/პაროლის განახლება
mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
  customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
    customer { id email firstName lastName phone }
    customerAccessToken { accessToken expiresAt }
    customerUserErrors { code field message }
  }
}

# მიმდინარე მომხმარებელი
query customer($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id email firstName lastName phone
  }
}
```

## Auth Functions (auth.ts)

```typescript
// ავტორიზაცია
export async function signIn(
  email: string,
  password: string,
  registrationSource: RegistrationSource = 'email'
): Promise<User>

// რეგისტრაცია
export async function signUp(
  name: string,
  email: string,
  password: string,
  registrationSource: RegistrationSource = 'email'
): Promise<User>

// გამოსვლა
export async function signOut(accessToken: string): Promise<void>

// პაროლის აღდგენის email
export async function resetPassword(email: string): Promise<void>

// პაროლის დაყენება (reset token-ით)
export async function customerResetPassword(
  id: string,
  token: string,
  password: string
): Promise<User>

// მიმდინარე მომხმარებელი
export async function getCurrentCustomer(accessToken: string): Promise<User | null>

// პროფილის განახლება
export async function updateProfile(
  accessToken: string,
  firstName: string,
  lastName: string
): Promise<User>

// პაროლის შეცვლა
export async function updatePassword(
  email: string,
  accessToken: string,
  currentPassword: string,
  newPassword: string
): Promise<void>
```

## Social Login Bridge (firebase-shopify-auth.ts)

```typescript
export async function googleSignIn(): Promise<User> {
  // 1. Firebase popup
  const result = await signInWithGoogle();
  const { email, uid, displayName } = result.user;

  // 2. Generate password from UID
  const password = `Google_${uid}`.slice(0, 39);

  // 3. Try Shopify sign in
  try {
    return await signIn(email, password, 'google');
  } catch {
    // 4. If fails, create account
    return await signUp(displayName, email, password, 'google');
  }
}

export async function facebookSignIn(): Promise<User> {
  // Same pattern with Facebook
}
```

## AuthContext Usage

```tsx
// Provider
<AuthProvider>
  <App />
</AuthProvider>

// Hook usage
const { user, isAuthenticated, signIn, signOut, openModal } = useAuth();

// Protected route
<RequireAuth>
  <AccountPage />
</RequireAuth>

// Modal trigger
<button onClick={() => openModal('signin')}>Sign In</button>
```

## Session Storage

```typescript
// შენახვა
localStorage.setItem('auth_user', JSON.stringify(user));

// წაკითხვა + validation on mount
const stored = localStorage.getItem('auth_user');
if (stored) {
  const user = JSON.parse(stored);
  // Verify token is still valid
  const customer = await getCurrentCustomer(user.accessToken);
  if (!customer) localStorage.removeItem('auth_user');
}
```

## Password Reset Flow

```
1. User: "Forgot password" → enters email
2. App: customerRecover mutation → Shopify sends email
3. User: clicks link → /account/reset/{id}/{token}
4. App: customerReset mutation with new password
5. Auto sign in
```

## UI მოთხოვნები

- AuthModal: max-w-modal (420px), dark theme
- Form inputs: rounded-xl, focus:border-brand
- Social buttons: Google/Facebook icons, hover states
- Password toggle: Eye/EyeOff icons
- Error messages: red-500, inline
- Loading states: spinner on buttons
- Toast notifications: success/error
```

---

## გამოყენების მაგალითი

```
"დაამატე authentication სისტემა auth-system.prompt.md-ის მიხედვით.
გამოიყენე Shopify + Firebase hybrid არქიტექტურა.
Social login: Google და Facebook."
```
