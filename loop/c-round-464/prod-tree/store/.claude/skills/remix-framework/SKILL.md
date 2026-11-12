---
name: remix-framework
description: Remix full-stack React framework patterns - SSR, loaders, actions, file-based routing. Use when creating routes, handling forms, or working with server-side data loading.
---

# Remix Framework

Remix - full-stack React framework with SSR, nested routing, loaders/actions.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Remix Request Flow                        │
│                                                              │
│   Browser ──► Route ──► Loader (GET) ──► Component          │
│      │                                       │               │
│      │         Action (POST) ◄───────────────┘               │
│      │              │                                        │
│      └──────────────┴──► Revalidate ──► Re-render           │
└─────────────────────────────────────────────────────────────┘
```

## File-Based Routing

```
app/routes/
├── _index.tsx              → /
├── products._index.tsx     → /products
├── products.$handle.tsx    → /products/:handle
├── products.$handle_.stems.tsx → /products/:handle/stems
├── api.auth.login.tsx      → /api/auth/login
└── ($lang).about.tsx       → /about or /ka/about
```

### Route Naming

| Pattern | Example | URL |
|---------|---------|-----|
| `_index` | `_index.tsx` | `/` |
| `.` (dot) | `products.list.tsx` | `/products/list` |
| `$param` | `products.$id.tsx` | `/products/123` |
| `_` (escape) | `products.$id_.edit.tsx` | `/products/123/edit` |
| `($optional)` | `($lang).about.tsx` | `/about` or `/en/about` |

## Loader (Server-Side Data)

```typescript
// app/routes/products.$handle.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const product = await getProduct(params.handle);

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ product });
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();

  return <ProductDetails product={product} />;
}
```

## Action (Form Handling)

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  const errors = validate(email);
  if (errors) {
    return json({ errors }, { status: 400 });
  }

  await subscribe(email);
  return redirect("/thank-you");
}

export default function Newsletter() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <input name="email" type="email" />
      {actionData?.errors && <p>{actionData.errors.email}</p>}
      <button type="submit">Subscribe</button>
    </Form>
  );
}
```

## Client vs Server

```typescript
// .server.ts - server only
// app/services/db.server.ts
export const db = new Database();

// .client.ts - client only
// app/lib/firebase.client.ts
export const auth = getAuth(app);

// Regular - both (be careful!)
// app/utils/format.ts
export const formatPrice = (price: number) => `$${price}`;
```

## Meta & Links

```typescript
import type { MetaFunction, LinksFunction } from "@remix-run/node";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.product.name },
    { name: "description", content: data?.product.description },
    { property: "og:image", content: data?.product.image },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/styles/product.css" },
  { rel: "canonical", href: "https://czaba.store/products" },
];
```

## Error Handling

```typescript
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
      </div>
    );
  }

  return <div>Something went wrong</div>;
}
```

## Fetcher (Non-Navigation)

```typescript
import { useFetcher } from "@remix-run/react";

function AddToCartButton({ productId }: { productId: string }) {
  const fetcher = useFetcher();
  const isAdding = fetcher.state === "submitting";

  return (
    <fetcher.Form method="post" action="/api/cart/add">
      <input type="hidden" name="productId" value={productId} />
      <button disabled={isAdding}>
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
    </fetcher.Form>
  );
}
```

## Common Patterns

### Protected Routes
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return json({ user });
}
```

### API Routes
```typescript
// app/routes/api.products.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  const products = await getProducts({ category });
  return json(products);
}
```

## References

- [Remix Docs](https://remix.run/docs)
- [Route Conventions](https://remix.run/docs/en/main/file-conventions/routes)
- `docs/technical/overview.md` - CZABA Remix setup
