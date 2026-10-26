# Ownership Detection (usePurchases Hook)

## API:

```typescript
const {
  purchasedProducts,    // Array of owned products
  isLoading,
  getProductVersionType // (handle: string) => 'standard' | 'premium' | null
} = usePurchases();
```

---

## Usage in Components:

```typescript
// ProductDetailPage
const ownedVersionType = getProductVersionType(product.handle);
// null = არ აქვს | 'standard' = Standard აქვს | 'premium' = Premium აქვს

// VersionSelector
if (ownedVersionType === 'premium') {
  // დამალე Version Selector - ყველაფერი აქვს
}

// PurchaseHeader
if (ownedVersionType === 'standard' && selectedVersion === 'premium') {
  // აჩვენე Upgrade UI, ფასი = premium - standard
}
```
