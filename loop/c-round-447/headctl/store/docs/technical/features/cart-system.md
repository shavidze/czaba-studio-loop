# კალათის სისტემა (Cart System)

## მიმოხილვა

ეს დოკუმენტაცია აღწერს CZABA მუსიკალური მაღაზიის კალათის სისტემას.
სისტემა შექმნილია **ციფრული პროდუქტებისთვის** (ZIP ფაილები მუსიკით), რაც ნიშნავს:

- **არანაირი დუბლიკატი** - ერთი და იგივე პროდუქტი მხოლოდ ერთხელ შეიძლება დაემატოს
- **ვერსიის ჩანაცვლება** - თუ Standard კალათაშია და Premium-ს ამატებ, Standard ავტომატურად წაიშლება
- **Quantity = 1** - რაოდენობა ყოველთვის 1-ია (ციფრულ ფაილს რამდენჯერმე ყიდვა აზრი არ აქვს)
- **Backend API** - კალათა მართულია Czaba .NET Backend-ით

---

## ფაილების სტრუქტურა

```
app/
├── types/cart.ts              # TypeScript ტიპები
├── contexts/CartContext.tsx   # React Context - მთავარი ლოგიკა
├── hooks/useCart.ts           # Hook კომპონენტებისთვის
├── services/api/client.ts     # Backend API client
├── components/product/
│   └── PurchaseHeader.tsx     # Add to Cart / Buy Now ღილაკები
└── routes/cart.tsx            # კალათის გვერდი
```

---

## 1. TypeScript ტიპები (`app/types/cart.ts`)

### CartItem - კალათის ერთი ხაზი (პროდუქტი)

```typescript
// CartItem - ეს არის კალათაში დამატებული ერთი პროდუქტი
// Backend API-დან მოდის ეს სტრუქტურა

export interface CartItem {
  // -----------------------------------------------
  // id: CartItem-ის უნიკალური ID (წასაშლელად)
  // -----------------------------------------------
  // Backend-ის მიერ გენერირებული ID
  // მაგ: 101
  id: number;

  // -----------------------------------------------
  // productId: პროდუქტის ID
  // -----------------------------------------------
  // Backend პროდუქტის უნიკალური ID
  // მაგ: 5
  productId: number;

  // -----------------------------------------------
  // productVariantId: ვარიანტის ID (Standard/Premium)
  // -----------------------------------------------
  // undefined/null - თუ პროდუქტს ვარიანტები არ აქვს
  // number - Standard ან Premium ვარიანტის ID
  productVariantId?: number;

  // -----------------------------------------------
  // productTitle: პროდუქტის სახელი
  // -----------------------------------------------
  // მაგ: "Middle East Cinematic Pack"
  productTitle: string;

  // -----------------------------------------------
  // productHandle: URL-ში გამოსაყენებელი slug
  // -----------------------------------------------
  // მაგ: "middle-east" → /products/middle-east
  productHandle: string;

  // -----------------------------------------------
  // variantTitle: ვარიანტის სახელი
  // -----------------------------------------------
  // მაგ: "Standard", "Premium", ან undefined
  variantTitle?: string;

  // -----------------------------------------------
  // imageUrl: პროდუქტის სურათი
  // -----------------------------------------------
  imageUrl?: string;

  // -----------------------------------------------
  // unitPrice: ერთეულის ფასი
  // -----------------------------------------------
  // მაგ: 49.99
  unitPrice: number;

  // -----------------------------------------------
  // quantity: რაოდენობა (ყოველთვის 1)
  // -----------------------------------------------
  quantity: number;

  // -----------------------------------------------
  // total: ჯამი (unitPrice * quantity)
  // -----------------------------------------------
  total: number;
}
```

### Cart - მთლიანი კალათა

```typescript
export interface Cart {
  // -----------------------------------------------
  // id: კალათის უნიკალური ID (null თუ ცარიელია)
  // -----------------------------------------------
  id: number | null;

  // -----------------------------------------------
  // items: კალათის ელემენტები
  // -----------------------------------------------
  items: CartItem[];

  // -----------------------------------------------
  // itemCount: საერთო რაოდენობა კალათაში
  // -----------------------------------------------
  // Header-ში badge-ზე ჩანს ეს რიცხვი
  itemCount: number;

  // -----------------------------------------------
  // subtotal: ჯამი
  // -----------------------------------------------
  subtotal: number;
}
```

### CartContextValue - Context-ის ინტერფეისი

```typescript
export interface CartContextValue {
  // ==========================================
  // STATE - მდგომარეობის ცვლადები
  // ==========================================

  // cart: მთლიანი კალათის ობიექტი ან null
  cart: Cart | null;

  // isLoading: იტვირთება თუ არა კალათა
  isLoading: boolean;

  // isAddingToCart: მიმდინარეობს თუ არა დამატება
  isAddingToCart: boolean;

  // isBuyingNow: მიმდინარეობს თუ არა Buy Now
  isBuyingNow: boolean;

  // isRemovingFromCart: მიმდინარეობს თუ არა წაშლა
  isRemovingFromCart: boolean;

  // cartCount: რამდენი პროდუქტია კალათაში
  cartCount: number;

  // ==========================================
  // ACTIONS - ფუნქციები/მოქმედებები
  // ==========================================

  // addToCart: პროდუქტის კალათაში დამატება
  // productId: პროდუქტის ID (სავალდებულო)
  // productHandle: პროდუქტის handle (ვერსიის ჩანაცვლებისთვის)
  // productVariantId: ვარიანტის ID (Standard/Premium)
  addToCart: (productId: number, productHandle?: string, productVariantId?: number) => Promise<void>;

  // removeFromCart: პროდუქტის წაშლა კალათიდან
  // itemId: CartItem-ის ID
  removeFromCart: (itemId: number) => Promise<void>;

  // buyNow: სწრაფი ყიდვა (checkout-ზე გადასვლა)
  buyNow: (productId: number, productVariantId?: number) => Promise<void>;

  // checkout: კალათის checkout (მთლიანი კალათის ყიდვა)
  checkout: () => Promise<void>;

  // ==========================================
  // CHECKS - შემოწმების ფუნქციები
  // ==========================================

  // isInCart: არის თუ არა პროდუქტი (ნებისმიერი ვარიანტი) კალათაში
  isInCart: (productId: number) => boolean;

  // isVariantInCart: არის თუ არა ზუსტი ვარიანტი კალათაში
  // ეს მთავარი ფუნქციაა "In Cart" სტატუსის გამოთვლისთვის!
  isVariantInCart: (productId: number, productVariantId?: number) => boolean;

  // isProductInCart: არის თუ არა პროდუქტი კალათაში handle-ით
  isProductInCart: (productHandle: string) => boolean;

  // getCartVariantForProduct: რომელი ვარიანტია კალათაში (handle-ით)
  getCartVariantForProduct: (productHandle: string) => number | undefined;

  // refreshCart: კალათის განახლება (auth ცვლილებისას)
  refreshCart: () => Promise<void>;
}
```

---

## 2. CartContext (`app/contexts/CartContext.tsx`)

### ძირითადი კონცეფცია

CartContext არის React Context რომელიც:
- ინახავს კალათის მდგომარეობას
- აწვდის ფუნქციებს კალათის სამართავად
- კომუნიცირებს Czaba Backend API-თან

### Session ID და Auth Integration

```typescript
const SESSION_ID_KEY = 'czaba_session_id';

// Guest მომხმარებლებისთვის უნიკალური სესია
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Session ID-ის მიღება ან შექმნა
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}
```

### კალათის განახლება Auth ცვლილებისას

```typescript
// Track auth state to refresh cart on login/logout
const { isAuthenticated, isInitializing: isAuthInitializing } = useAuth();
const prevAuthRef = useRef<boolean | null>(null);

// Refresh cart when auth state changes (login/logout)
useEffect(() => {
  // Skip during initial auth check
  if (isAuthInitializing) return;

  // Only refresh if auth state actually changed (not on initial load)
  if (prevAuthRef.current !== null && prevAuthRef.current !== isAuthenticated) {
    setIsLoading(true);
    loadCart();
  }

  // Update ref for next comparison
  prevAuthRef.current = isAuthenticated;
}, [isAuthenticated, isAuthInitializing, loadCart]);
```

**რა პრობლემას წყვეტს ეს:**
- მომხმარებელი guest-ად ამატებს პროდუქტს → login → კალათა განახლდება (მისი მომხმარებლის კალათა)
- მომხმარებელი logout → კალათა განახლდება (ახალი guest კალათა)

### isVariantInCart ფუნქცია (მთავარი!)

```typescript
// შემოწმება: არის თუ არა ზუსტი ვარიანტი კალათაში
//
// ეს ფუნქცია გამოიყენება "In Cart" სტატუსის დასადგენად!
// განსხვავება isInCart-ისგან:
// - isInCart(productId) - ამოწმებს პროდუქტის ნებისმიერ ვარიანტს
// - isVariantInCart(productId, variantId) - ამოწმებს ზუსტ ვარიანტს

const isVariantInCart = useCallback((productId: number, productVariantId?: number): boolean => {
  if (!cart?.items) return false;
  return cart.items.some(item => {
    if (item.productId !== productId) return false;
    // Normalize null/undefined for comparison
    const cartVariantId = item.productVariantId ?? undefined;
    const checkVariantId = productVariantId ?? undefined;
    return cartVariantId === checkVariantId;
  });
}, [cart]);
```

**null vs undefined ნორმალიზაცია:**
Backend შეიძლება დააბრუნოს `null`, ხოლო Frontend იყენებს `undefined`.
`?? undefined` უზრუნველყოფს თანმიმდევრულ შედარებას.

### addToCart ფუნქცია (ვერსიის ჩანაცვლებით)

```typescript
const addToCart = useCallback(async (productId: number, productHandle?: string, productVariantId?: number) => {
  // ========================================
  // ნაბიჯი 1: შევამოწმოთ ზუსტი ვარიანტის დუბლიკატი
  // ========================================
  if (isVariantInCart(productId, productVariantId)) {
    // ზუსტად ეს ვარიანტი უკვე კალათაშია!
    onToast?.('This item is already in your cart', 'success');
    return;
  }

  setIsAddingToCart(true);

  try {
    const sessionId = getSessionId();

    // ========================================
    // ნაბიჯი 2: ვერსიის ჩანაცვლება (თუ საჭიროა)
    // ========================================
    // თუ productHandle მოცემულია, შევამოწმოთ არის თუ არა
    // იმავე პროდუქტის სხვა ვერსია კალათაში
    if (productHandle) {
      const existingItem = findItemByHandle(productHandle);
      // Normalize null/undefined for comparison
      const existingVariantId = existingItem?.productVariantId ?? undefined;
      const newVariantId = productVariantId ?? undefined;
      if (existingItem && existingVariantId !== newVariantId) {
        // სხვა ვერსია არის კალათაში! წავშალოთ ძველი
        // მაგ: Standard → Premium ან Premium → Standard
        await apiClient.removeCartItem(existingItem.id, sessionId);
      }
    }

    // ========================================
    // ნაბიჯი 3: დამატება კალათაში
    // ========================================
    const apiCart = await apiClient.addToCart(
      { productId, productVariantId, quantity: 1 },
      sessionId
    );

    setCart(transformCart(apiCart));
    onToast?.('Added to cart!', 'success');

  } catch (error) {
    console.error('Failed to add to cart:', error);
    onToast?.('Failed to add to cart. Please try again.', 'error');
    throw error;
  } finally {
    setIsAddingToCart(false);
  }
}, [isVariantInCart, findItemByHandle, onToast]);
```

### buyNow და checkout ფუნქციები (Stripe Integration)

```typescript
// Buy Now - adds to cart and proceeds to Stripe checkout
const buyNow = useCallback(async (productId: number, productVariantId?: number) => {
  setIsBuyingNow(true);

  try {
    const sessionId = getSessionId();

    // If not in cart, add it first
    if (!isInCart(productId)) {
      await apiClient.addToCart({ productId, productVariantId, quantity: 1 }, sessionId);
    }

    // Step 1: Create order (POST /api/cart/checkout)
    const orderResponse = await apiClient.checkout();

    // Step 2: Create Stripe checkout session (POST /api/payments/checkout)
    const stripeResponse = await apiClient.createCheckoutSession(orderResponse.id);

    // Step 3: Redirect to Stripe checkout
    window.location.href = stripeResponse.sessionUrl;
  } catch (error) {
    console.error('Failed to process buy now:', error);
    onToast?.('Failed to proceed to checkout. Please try again.', 'error');
    setIsBuyingNow(false);
    throw error;
  }
  // Note: We don't set isBuyingNow to false here because we're redirecting
}, [isInCart, onToast]);

// Checkout - for cart page
const checkout = useCallback(async () => {
  setIsBuyingNow(true);

  try {
    // Step 1: Create order
    const orderResponse = await apiClient.checkout();

    // Step 2: Create Stripe checkout session
    const stripeResponse = await apiClient.createCheckoutSession(orderResponse.id);

    // Step 3: Redirect to Stripe checkout
    window.location.href = stripeResponse.sessionUrl;
  } catch (error) {
    console.error('Failed to checkout:', error);
    onToast?.('Failed to proceed to checkout. Please try again.', 'error');
    setIsBuyingNow(false);
    throw error;
  }
}, [onToast]);
```

---

## 3. Backend API Integration

### API Endpoints

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/api/cart` | კალათის მიღება |
| POST | `/api/cart/items` | პროდუქტის დამატება |
| PUT | `/api/cart/items/{id}` | რაოდენობის განახლება |
| DELETE | `/api/cart/items/{id}` | პროდუქტის წაშლა |
| DELETE | `/api/cart` | კალათის გასუფთავება |
| POST | `/api/cart/checkout` | შეკვეთის შექმნა |

### Headers

```typescript
// Guest users
headers['X-Session-Id'] = sessionId;

// Authenticated users
headers['Authorization'] = `Bearer ${accessToken}`;
```

### Field Name Mappings

Backend-დან Frontend-ზე ველების mapping:

```typescript
function transformCart(apiCart: ApiCart): Cart {
  return {
    id: apiCart.id,
    items: apiCart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      // Normalize null to undefined for consistent comparisons
      productVariantId: item.productVariantId ?? undefined,
      productTitle: item.productTitle,
      productHandle: item.productHandle,
      variantTitle: item.variantName ?? undefined,
      imageUrl: item.productImageUrl,  // Map from backend field name
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total,
    })),
    itemCount: apiCart.itemCount,
    subtotal: apiCart.subtotal,
  };
}
```

**მნიშვნელოვანი mappings:**
- `item.productImageUrl` (backend) → `item.imageUrl` (frontend)
- `item.variantName` (backend) → `item.variantTitle` (frontend)
- `null` → `undefined` (normalization)

---

## 4. Stripe Checkout Flow

### სრული პროცესი

```
1. მომხმარებელი აჭერს "Buy Now" ან "Checkout"
   │
   ▼
2. POST /api/cart/checkout (შეკვეთის შექმნა)
   │ Response: { id: 1, orderNumber: "CZ-20240120-ABC123", total: 49.99 }
   │
   ▼
3. POST /api/payments/checkout (Stripe Session შექმნა)
   │ Body: { orderId: 1 }
   │ Response: { sessionUrl: "https://checkout.stripe.com/...", sessionId: "cs_..." }
   │
   ▼
4. window.location.href = sessionUrl (გადამისამართება Stripe-ზე)
   │
   ▼
5. მომხმარებელი იხდის Stripe-ზე
   │
   ▼
6. Success: /checkout/success?session_id=xxx&order_id=xxx
   Cancel: /checkout/cancel
   │
   ▼
7. Stripe Webhook → Backend → Order status: "Paid"
```

---

## 5. PurchaseHeader Component

პროდუქტის გვერდზე ფასის და ღილაკების სექცია.

### "In Cart" სტატუსის ლოგიკა

```typescript
// მთავარი: გამოიყენე isVariantInCart, არა isInCart!
const { isVariantInCart, addToCart, isBuyingNow, isAddingToCart } = useCart();

// შეამოწმე ზუსტი ვარიანტი
const alreadyInCart = isVariantInCart(productId, selectedVariantId);
```

| მდგომარეობა | Standard ღილაკი | Premium ღილაკი |
|------------|-----------------|----------------|
| კალათა ცარიელი | Add to Cart | Add to Cart |
| Standard კალათაში | In Cart (green) | Add to Cart |
| Premium კალათაში | Add to Cart | In Cart (green) |

### addToCart გამოძახება

```typescript
// IMPORTANT: გადაეცი productHandle ვერსიის ჩანაცვლებისთვის!
const handleAddToCart = async () => {
  try {
    await addToCart(productId, productHandle, selectedVariantId);
  } catch {
    // Error handled in context
  }
};
```

---

## 6. მნიშვნელოვანი შენიშვნები

### ციფრული პროდუქტების სპეციფიკა

1. **Quantity = 1**: მომხმარებელს არ შეუძლია რაოდენობის შეცვლა
2. **არანაირი დუბლიკატი**: ერთი პროდუქტი მხოლოდ ერთხელ
3. **ვერსიის ჩანაცვლება**: Standard → Premium ან Premium → Standard ცვლილებისას ძველი ვერსია ავტომატურად წაიშლება

### null vs undefined

Backend აბრუნებს `null`, Frontend იყენებს `undefined`. ყოველთვის გამოიყენე normalization:

```typescript
// Correct
const variantId = item.productVariantId ?? undefined;

// Also correct
const variantId = item.productVariantId || undefined;
```

### Session Management

- Guest users: `localStorage.czaba_session_id`
- Authenticated users: JWT token in `Authorization` header
- Cart refresh: ავტომატურად login/logout-ზე

---

## 7. დაკავშირებული ფაილები

### Core
- `app/types/cart.ts` - TypeScript ტიპები
- `app/contexts/CartContext.tsx` - React Context (მთავარი state management)
- `app/hooks/useCart.ts` - Hook კომპონენტებისთვის

### API
- `app/services/api/client.ts` - Backend API client

### UI
- `app/components/product/PurchaseHeader.tsx` - Add to Cart / Buy Now ღილაკები
- `app/routes/cart.tsx` - კალათის გვერდი

### Backend Documentation
- `docs/api/CART.md` - Cart API documentation
- `docs/api/PAYMENTS.md` - Stripe integration

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-22 | სრული გადაწერა Backend API-სთვის, Shopify-ის მოხსნა |
| 2026-01-21 | isVariantInCart ფუნქციის დამატება |
| 2026-01-21 | Auth state change-ზე კალათის refresh |
| 2026-01-20 | Stripe Checkout integration |
| 2026-01-19 | Version replacement logic |
