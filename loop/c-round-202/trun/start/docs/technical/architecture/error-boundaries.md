# Error Boundaries Architecture

## შესავალი

Error Boundaries არის React/Remix მექანიზმი JavaScript შეცდომების დაჭერისა და graceful fallback UI-ს ჩვენებისთვის. CZABA Store იყენებს გასტილულ error გვერდებს მომხმარებლის გამოცდილების გასაუმჯობესებლად.

---

## კომპონენტები

### ფაილების სტრუქტურა

```
app/components/errors/
├── index.ts              # Barrel export
└── ErrorBoundary.tsx     # Error components
```

### RootErrorBoundary

მთლიანი აპლიკაციის დონეზე error handling. გამოიყენება `root.tsx`-ში.

**Features:**
- HTTP error responses (404, 401, 403, 500)
- JavaScript runtime errors
- Styled UI with brand colors
- Action buttons (Try Again, Go Home)

**გამოყენება root.tsx-ში:**
```typescript
export { RootErrorBoundary as ErrorBoundary } from '~/components/errors';
```

### RouteErrorBoundary

ცალკეული route-ის დონეზე error handling. არ ცვლის მთლიან layout-ს.

**გამოყენება route-ში:**
```typescript
import { RouteErrorBoundary } from '~/components/errors';

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}
```

---

## Error Types & Messages

| HTTP Status | Title | Message |
|-------------|-------|---------|
| 404 | Page Not Found | The page you're looking for doesn't exist or has been moved. |
| 401 | Unauthorized | You need to sign in to access this page. |
| 403 | Access Denied | You don't have permission to view this page. |
| 500 | Server Error | Something went wrong on our end. Please try again later. |
| Other | Error {status} | Dynamic statusText |

**JavaScript Errors:**
- Development: აჩვენებს error.message
- Production: "An unexpected error occurred. Please try again."

---

## UI დიზაინი

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ⚠️ (AlertTriangle icon)            │
│                                                 │
│              Page Not Found                      │
│                                                 │
│   The page you're looking for doesn't exist     │
│   or has been moved.                            │
│                                                 │
│   ┌──────────────┐  ┌──────────────┐           │
│   │  Try Again   │  │   Go Home    │           │
│   │  (RefreshCw) │  │    (Home)    │           │
│   └──────────────┘  └──────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**სტილები:**
- Background: `bg-background` (dark theme)
- Error icon container: `bg-error-bg`
- Icon: `text-error` (AlertTriangle)
- Primary button: `bg-brand` (Go Home)
- Secondary button: `bg-surface` (Try Again)

---

## კოდის მაგალითი

### ErrorDisplay Component

```typescript
interface ErrorDisplayProps {
  title: string;
  message: string;
  showRefresh?: boolean;
  showHome?: boolean;
}

function ErrorDisplay({ title, message, showRefresh = true, showHome = true }: ErrorDisplayProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-bg">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>

        {/* Message */}
        <p className="text-muted mb-8">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRefresh && (
            <button onClick={() => window.location.reload()} className="...">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}

          {showHome && (
            <a href="/" className="...">
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Remix Integration

### Root Level (root.tsx)

```typescript
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

// Error Boundary export
export { RootErrorBoundary as ErrorBoundary } from '~/components/errors';
```

### Route Level

```typescript
// app/routes/products.$handle.tsx
import { RouteErrorBoundary } from '~/components/errors';

export async function loader({ params }) {
  const product = await ProductService.getByHandle(params.handle);

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  return json({ product });
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

export default function ProductPage() {
  // ...
}
```

---

## Error Logging

### Development

```typescript
// Console-ში სრული error
console.error('Uncaught error:', error);
```

### Production (TODO)

```typescript
// Sentry-ში გაგზავნა
import * as Sentry from '@sentry/remix';

// In ErrorBoundary
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error);
}
```

---

## Testing Error Pages

### 404 Page
```bash
# Browser-ში
http://localhost:5173/nonexistent-page
```

### 500 Page (Simulated)
```typescript
// Temporary test route
export async function loader() {
  throw new Error('Test error');
}
```

### Throw Response
```typescript
// In any loader/action
throw new Response('Custom error message', { status: 403 });
```

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-06 | Error Boundaries შექმნა: RootErrorBoundary, RouteErrorBoundary |
| 2026-01-06 | Styled error pages with brand design |
| 2026-01-06 | root.tsx integration |
