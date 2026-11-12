# კალათის, ყიდვისა და Upgrade-ის ლოგიკა (Backend API - 2025)

> **მნიშვნელოვანი:** ეს სექცია აღწერს ახალ ლოგიკას, რომელიც მუშაობს ჩვენს .NET Backend API-თან. Shopify-ს აღარ ვიყენებთ.

---

## ძირითადი კონცეფციები

### პროდუქტი და ვარიანტი
```
Product (მაგ: "Middle East Desert")
├── id: 1 (უნიკალური)
├── handle: "middle-east-desert"
└── variants:
    ├── Standard (id: 101, price: $29)
    └── Premium (id: 102, price: $49)
```

- **productId** - პროდუქტის უნიკალური ID
- **productVariantId** - ვარიანტის უნიკალური ID (Standard ან Premium)
- **productHandle** - URL-ფრენდლი იდენტიფიკატორი (ორივე ვარიანტს ერთი და იგივე აქვს)

---

## კალათაში დამატების ლოგიკა

### User Story: ვერსიის თავისუფალი არჩევანი (ყიდვამდე)

**As a** მომხმარებელი, რომელმაც ჯერ არაფერი შეუძენია,
**I want to** თავისუფლად შევცვალო ვერსია (Standard ↔ Premium) კალათაში,
**So that I can** საბოლოო გადაწყვეტილება მივიღო checkout-მდე.

### Acceptance Criteria:

**სცენარი 1: პირველი დამატება**
1. მომხმარებელი ირჩევს Standard ვერსიას
2. აჭერს "Add to Cart"
3. კალათაში ემატება: `{ productId: 1, productVariantId: 101 }`
4. ღილაკი იცვლება → "In Cart" ✓

**სცენარი 2: ვერსიის შეცვლა (Standard → Premium)**
1. მომხმარებელს კალათაში აქვს Standard (variantId: 101)
2. გადადის Premium ტაბზე
3. ღილაკზე წერია "Add to Cart" (არა "In Cart"!)
4. აჭერს "Add to Cart"
5. სისტემა:
   - წაშლის Standard-ს კალათიდან
   - ამატებს Premium-ს (variantId: 102)
6. ახლა Premium-ზეა "In Cart" ✓
7. Standard-ზე კვლავ "Add to Cart"

**სცენარი 3: ვერსიის შეცვლა (Premium → Standard)**
1. მომხმარებელს კალათაში აქვს Premium (variantId: 102)
2. გადადის Standard ტაბზე
3. ღილაკზე წერია "Add to Cart"
4. აჭერს - Premium იშლება, Standard ემატება

### ტექნიკური იმპლემენტაცია:

```typescript
// PurchaseHeader.tsx - "In Cart" სტატუსის გამოთვლა
const alreadyInCart = cart?.items.some(
  item => item.productId === productId && item.productVariantId === productVariantId
);
// ⚠️ შეამოწმე productVariantId-იც, არა მხოლოდ productId!

// CartContext.tsx - addToCart ფუნქცია
const addToCart = async (productId: number, productHandle: string, productVariantId: number) => {
  // 1. შეამოწმე, ზუსტად ეს ვარიანტი ხომ არ არის კალათაში
  if (isInCart(productId, productVariantId)) {
    showToast('This item is already in your cart');
    return;
  }

  // 2. შეამოწმე, ამავე პროდუქტის სხვა ვარიანტი ხომ არ არის
  const existingItem = cart?.items.find(item => item.productHandle === productHandle);
  if (existingItem) {
    // წაშალე ძველი ვარიანტი
    await apiClient.removeCartItem(existingItem.id);
  }

  // 3. დაამატე ახალი ვარიანტი
  await apiClient.addToCart({ productId, productVariantId, quantity: 1 });
};
```
