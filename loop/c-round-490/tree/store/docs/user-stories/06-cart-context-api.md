# Cart Context API

## Interface:

```typescript
interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;

  // Actions
  addToCart: (productId: number, productHandle: string, productVariantId: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  buyNow: (productId: number, productVariantId: number) => Promise<void>;
  checkout: () => Promise<void>;

  // Checks
  isInCart: (productId: number, productVariantId: number) => boolean;
  isProductInCart: (productHandle: string) => boolean;
  getCartVariantId: (productHandle: string) => number | null;
}
```

---

## Cart Item Structure:

```typescript
interface CartItem {
  id: number;              // CartItem ID (for removal)
  productId: number;       // Product ID
  productVariantId: number; // Variant ID (Standard/Premium)
  productHandle: string;   // URL slug
  productTitle: string;
  variantTitle: string;    // "Standard" | "Premium"
  imageUrl: string;
  unitPrice: number;
  quantity: number;        // Always 1 for digital
  total: number;
}
```
