# Cart & Checkout Module

> მოდულური პრომპტი Cart და Checkout სისტემის იმპლემენტაციისთვის

---

## 🛒 Prompt: Shopping Cart System

```markdown
დაამატე Shopping Cart სისტემა Shopify Cart API-ით:

## არქიტექტურა

```
┌──────────────────────────────────────────────────────────┐
│                    CART FLOW                              │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐     ┌─────────────┐    ┌─────────────┐  │
│  │   Add to    │────▶│  Cart API   │───▶│  Checkout   │  │
│  │    Cart     │     │  (Shopify)  │    │  (Shopify)  │  │
│  └─────────────┘     └─────────────┘    └─────────────┘  │
│         │                   │                   │         │
│         ▼                   ▼                   ▼         │
│  ┌─────────────┐     ┌─────────────┐    ┌─────────────┐  │
│  │ localStorage│     │ Cart Drawer │    │  Redirect   │  │
│  │   (backup)  │     │   (UI)      │    │  to Shopify │  │
│  └─────────────┘     └─────────────┘    └─────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## ფაილების სტრუქტურა

```
app/
├── contexts/
│   └── CartContext.tsx          # Global cart state
├── components/cart/
│   ├── CartDrawer.tsx           # Slide-out cart
│   ├── CartItem.tsx             # Individual line item
│   ├── CartSummary.tsx          # Totals, checkout button
│   ├── AddToCartButton.tsx      # Product page button
│   └── CartIcon.tsx             # Header cart icon + count
├── hooks/
│   └── useCart.ts               # Cart hook
├── lib/
│   └── shopify.queries.ts       # Cart mutations
└── types/
    └── cart.ts                  # Cart types
```

## Types (cart.ts)

```typescript
export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{ node: CartLine }>;
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: string;
      currencyCode: string;
    } | null;
  };
}

export interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  itemCount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}
```

## GraphQL Mutations

```graphql
# Cart შექმნა
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                product {
                  id
                  title
                  handle
                  featuredImage { url altText }
                }
                selectedOptions { name value }
              }
            }
            cost {
              totalAmount { amount currencyCode }
            }
          }
        }
      }
      cost {
        totalAmount { amount currencyCode }
        subtotalAmount { amount currencyCode }
        totalTaxAmount { amount currencyCode }
      }
    }
    userErrors { field message }
  }
}

# პროდუქტის დამატება
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { ...CartFragment }
    userErrors { field message }
  }
}

# რაოდენობის შეცვლა
mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart { ...CartFragment }
    userErrors { field message }
  }
}

# პროდუქტის წაშლა
mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart { ...CartFragment }
    userErrors { field message }
  }
}

# Cart-ის მიღება
query cart($cartId: ID!) {
  cart(id: $cartId) { ...CartFragment }
}
```

## CartContext

```typescript
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize cart from localStorage or create new
  useEffect(() => {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (cartId) {
      fetchCart(cartId);
    }
  }, []);

  const addToCart = async (variantId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      if (!cart) {
        // Create new cart
        const newCart = await createCart(variantId, quantity);
        setCart(newCart);
        localStorage.setItem('shopify_cart_id', newCart.id);
      } else {
        // Add to existing cart
        const updatedCart = await addToExistingCart(cart.id, variantId, quantity);
        setCart(updatedCart);
      }
      setIsDrawerOpen(true); // Open drawer after adding
    } finally {
      setIsLoading(false);
    }
  };

  // ... updateQuantity, removeItem, clearCart
}
```

## CartDrawer Component

```tsx
export function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, isLoading } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={closeDrawer}>
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart?.lines.edges.map(({ node }) => (
            <CartItem key={node.id} item={node} />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline">
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>{formatPrice(cart?.cost.subtotalAmount)}</span>
          </div>
          <a
            href={cart?.checkoutUrl}
            className="w-full block text-center py-3 bg-brand text-black rounded-xl font-medium"
          >
            Checkout
          </a>
        </div>
      </div>
    </>
  );
}
```

## AddToCartButton

```tsx
export function AddToCartButton({
  variantId,
  disabled = false,
}: {
  variantId: string;
  disabled?: boolean;
}) {
  const { addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    setIsAdding(true);
    await addToCart(variantId);
    setIsAdding(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || isAdding}
      className="w-full py-4 bg-brand text-black font-semibold rounded-xl
                 hover:bg-brand/90 disabled:opacity-50 transition-colors"
    >
      {isAdding ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> Adding...
        </span>
      ) : (
        'Add to Cart'
      )}
    </button>
  );
}
```

## CartIcon (Header)

```tsx
export function CartIcon() {
  const { itemCount, openDrawer } = useCart();

  return (
    <button onClick={openDrawer} className="relative">
      <ShoppingBag size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-black
                        text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
}
```

## Optimistic Updates

```typescript
const updateQuantity = async (lineId: string, quantity: number) => {
  // Optimistic update
  setCart(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      lines: {
        edges: prev.lines.edges.map(edge =>
          edge.node.id === lineId
            ? { node: { ...edge.node, quantity } }
            : edge
        )
      }
    };
  });

  // API call
  try {
    const updatedCart = await updateCartLine(cart.id, lineId, quantity);
    setCart(updatedCart);
  } catch (error) {
    // Revert on error
    fetchCart(cart.id);
  }
};
```

## localStorage Persistence

```typescript
// Save cart ID
localStorage.setItem('shopify_cart_id', cart.id);

// Restore cart
const cartId = localStorage.getItem('shopify_cart_id');
if (cartId) {
  const cart = await fetchCart(cartId);
  if (cart) setCart(cart);
  else localStorage.removeItem('shopify_cart_id'); // Cart expired
}
```

## Checkout Redirect

```typescript
// Redirect to Shopify Checkout
const handleCheckout = () => {
  if (cart?.checkoutUrl) {
    window.location.href = cart.checkoutUrl;
  }
};

// Or for SPA feel, open in same tab
<a href={cart?.checkoutUrl}>Proceed to Checkout</a>
```

## UI მოთხოვნები

- Drawer: slide-in from right, backdrop blur
- Items: image, title, variant, price, quantity controls
- Quantity: +/- buttons, min 1, max from inventory
- Remove: trash icon with confirmation
- Empty state: illustration + "Browse products" link
- Loading: skeleton while fetching
- Toast: "Added to cart" notification
```

---

## გამოყენების მაგალითი

```
"დაამატე shopping cart სისტემა cart-checkout.prompt.md-ის მიხედვით.
Cart drawer უნდა გაიხსნას პროდუქტის დამატებისას.
Checkout გადაამისამართოს Shopify-ზე."
```
