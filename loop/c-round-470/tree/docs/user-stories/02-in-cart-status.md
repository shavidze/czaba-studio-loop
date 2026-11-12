# "In Cart" სტატუსის ლოგიკა

## მიმდინარე პრობლემა:
```typescript
// ❌ არასწორი - მხოლოდ productId-ს ამოწმებს
const isInCart = (productId: number) => cart?.items.some(i => i.productId === productId);
```

## გადაწყვეტა:
```typescript
// ✅ სწორი - productVariantId-საც ამოწმებს
const isInCart = (productId: number, productVariantId: number) =>
  cart?.items.some(i => i.productId === productId && i.productVariantId === productVariantId);

// ან: შეამოწმე, ამ პროდუქტის ᲖᲣᲡᲢᲐᲓ რომელი ვარიანტია კალათაში
const getCartItemForProduct = (productHandle: string) =>
  cart?.items.find(i => i.productHandle === productHandle);
```

## UI ლოგიკა (PurchaseHeader):

| მდგომარეობა | Standard ღილაკი | Premium ღილაკი |
|------------|-----------------|----------------|
| კალათა ცარიელი | Add to Cart | Add to Cart |
| Standard კალათაში | In Cart ✓ | Add to Cart |
| Premium კალათაში | Add to Cart | In Cart ✓ |
