# New Remix Route Pattern

Remix route-ის შექმნის template.

---

## Basic Route Structure

```typescript
// app/routes/{route-name}.tsx

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

// ========================================
// Meta
// ========================================

export const meta: MetaFunction = () => {
  return [
    { title: 'Page Title | CZABA' },
    { name: 'description', content: 'Page description' },
  ];
};

// ========================================
// Loader (Server-side data fetching)
// ========================================

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get data from services
  const data = await SomeService.getData();

  return json({ data });
}

// ========================================
// Component
// ========================================

export default function RouteName() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Page Title
        </h1>
        {/* Content */}
      </div>
    </div>
  );
}
```

---

## Route with Action (Form handling)

```typescript
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';

// ========================================
// Action (Form submission)
// ========================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const name = formData.get('name') as string;

    // Validation
    if (!name) {
      return json({ error: 'Name is required' }, { status: 400 });
    }

    // Create
    await SomeService.create({ name });

    return redirect('/success');
  }

  return json({ error: 'Unknown action' }, { status: 400 });
}

// ========================================
// Component with Form
// ========================================

export default function RouteName() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post" className="space-y-4">
      <input type="hidden" name="intent" value="create" />

      <Input
        label="Name"
        name="name"
        error={actionData?.error}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </Form>
  );
}
```

---

## Protected Route (Auth Required)

```typescript
import { useAuth } from '~/contexts/AuthContext';
import { RequireAuth } from '~/components/auth/RequireAuth';

export default function ProtectedRoute() {
  const { user } = useAuth();

  return (
    <RequireAuth>
      <div>
        <h1>Welcome, {user?.firstName}</h1>
        {/* Protected content */}
      </div>
    </RequireAuth>
  );
}
```

---

## Dynamic Route (with params)

```typescript
// app/routes/products.$handle.tsx

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = params;

  if (!handle) {
    throw new Response('Not Found', { status: 404 });
  }

  const product = await ProductService.getByHandle(handle);

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  return json({ product });
}
```

---

## API Route (Resource Route)

```typescript
// app/routes/api.something.tsx

import { json, type ActionFunctionArgs } from '@remix-run/node';

// No default export = resource route (no UI)

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();

  // Process...

  return json({ success: true });
}

export async function loader() {
  // GET requests
  return json({ data: 'something' });
}
```

---

## Error Boundary

```typescript
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">
            {error.status}
          </h1>
          <p className="text-muted mt-2">{error.statusText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Error</h1>
        <p className="text-muted mt-2">Something went wrong</p>
      </div>
    </div>
  );
}
```

---

## Route Naming Conventions

| Pattern | File | URL |
|---------|------|-----|
| Index | `_index.tsx` | `/` |
| Static | `about.tsx` | `/about` |
| Dynamic | `products.$handle.tsx` | `/products/:handle` |
| Nested | `account.orders.tsx` | `/account/orders` |
| Pathless | `account_.login.tsx` | `/account/login` (no layout) |
| API | `api.endpoint.tsx` | `/api/endpoint` |

---

## Imports to Remember

```typescript
// Remix
import { json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  useActionData,
  useNavigation,
  Form,
  Link,
  useParams,
  useSearchParams
} from '@remix-run/react';

// UI Components
import { Button, Input, Card } from '~/components/ui';

// Services
import { ProductService, CustomerService } from '~/services/shopify';

// Auth
import { useAuth } from '~/contexts/AuthContext';
```
