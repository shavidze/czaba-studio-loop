# SKELETON_LOADING

## Loading State Patterns

Remix navigation state და skeleton კომპონენტები.

## Remix Route Loading

```tsx
import { useNavigation, useLoaderData } from '@remix-run/react'

export default function ProductPage() {
  const navigation = useNavigation()
  const { product } = useLoaderData<typeof loader>()

  // Show skeleton during navigation
  if (navigation.state === 'loading') {
    return <ProductSkeleton />
  }

  return <ProductDetail product={product} />
}
```

## Skeleton Component Pattern

```tsx
// Skeleton mirrors actual component structure
export function ProductSkeleton() {
  return (
    <div className="space-y-6">
      {/* Image skeleton */}
      <div className="aspect-square bg-muted rounded-lg skeleton-shimmer" />

      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-3/4 bg-muted rounded skeleton-shimmer" />
        <div className="h-4 w-1/2 bg-muted rounded skeleton-shimmer" />
      </div>

      {/* Price skeleton */}
      <div className="h-6 w-24 bg-muted rounded skeleton-shimmer" />

      {/* Button skeleton */}
      <div className="h-12 w-full bg-muted rounded-lg skeleton-shimmer" />
    </div>
  )
}
```

## Shimmer Animation (Tailwind)

```css
/* globals.css */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## Card Skeleton

```tsx
export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 space-y-4">
      <div className="aspect-video bg-muted rounded skeleton-shimmer" />
      <div className="h-5 w-3/4 bg-muted rounded skeleton-shimmer" />
      <div className="h-4 w-1/2 bg-muted rounded skeleton-shimmer" />
    </div>
  )
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
```

## Table Skeleton

```tsx
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="h-10 bg-muted rounded skeleton-shimmer" />

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-muted/50 rounded skeleton-shimmer" />
      ))}
    </div>
  )
}
```

## Form Skeleton

```tsx
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Input fields */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded skeleton-shimmer" />
          <div className="h-10 w-full bg-muted rounded skeleton-shimmer" />
        </div>
      ))}

      {/* Button */}
      <div className="h-10 w-32 bg-muted rounded skeleton-shimmer" />
    </div>
  )
}
```

## Context isInitializing Pattern

```tsx
// For contexts that need async initialization
const [isInitializing, setIsInitializing] = useState(true)

useEffect(() => {
  async function init() {
    const stored = localStorage.getItem('data')
    if (stored) {
      // Verify/load data
      await loadData(stored)
    }
    setIsInitializing(false)
  }
  init()
}, [])

// In component using context
if (isInitializing) {
  return <FullPageSkeleton />
}
```

## Full Page Skeleton

```tsx
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand" />
    </div>
  )
}
```

## Button Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

## Loader Fallback Strategy

```tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = params

  if (!handle) {
    throw new Response('Not found', { status: 404 })
  }

  try {
    // Try API first
    const product = await apiClient.getProductByHandle(handle)
    return json({ product })
  } catch (error) {
    // Fallback to mock data
    const mockProduct = MOCK_PRODUCTS[handle]
    if (mockProduct) {
      return json({ product: mockProduct })
    }

    // Finally, 404
    throw new Response('Not found', { status: 404 })
  }
}
```

## Checklist

- [ ] navigation.state === 'loading' check
- [ ] Skeleton mirrors actual component structure
- [ ] skeleton-shimmer class for animation
- [ ] bg-muted for skeleton background
- [ ] Consistent border-radius with actual components
- [ ] Array.from for repeating skeletons
- [ ] isInitializing for context providers
- [ ] Loader fallback: API → Mock → 404
