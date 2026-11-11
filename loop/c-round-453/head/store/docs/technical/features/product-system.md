# პროდუქტის სისტემა (Product System)

## მიმოხილვა

პროდუქტები მართულია **Czaba .NET Backend**-ით. ყველა პროდუქტს აქვს **ვერსიები** (Standard/Premium), რომლებიც Backend-ში ProductVariant-ებად ინახება.

---

## პროდუქტის სტრუქტურა

### Backend მონაცემთა ბაზა

```
პროდუქტი (Product)
├── id: 1
├── title: "Middle East Desert"
├── handle: "middle-east-desert"
├── standardPrice: 29.00
├── premiumPrice: 49.00
└── variants: ProductVariant[]
    ├── { id: 101, name: "Standard", price: 29.00 }
    └── { id: 102, name: "Premium", price: 49.00 }
```

### კავშირი Cart-თან

```
CartItem
├── productId: 1          → Product.id
├── productVariantId: 102 → ProductVariant.id (Standard ან Premium)
├── productHandle: "middle-east-desert"
└── variantName: "Premium"
```

---

## ვერსიების სისტემა

### Standard ვერსია
- WAV ფორმატი
- 24-bit / 48kHz ხარისხი
- დაბალი ფასი

### Premium ვერსია
- WAV + WAV 96kHz (ან Stems)
- 24-bit / 96kHz ხარისხი
- მაღალი ხარისხის ფაილები
- უფრო მაღალი ფასი

---

## ფაილების სტრუქტურა

```
app/
├── routes/products.$handle.tsx    # პროდუქტის გვერდის loader
├── services/api/client.ts         # Backend API client
├── components/product/
│   ├── ProductDetailPage.tsx      # მთავარი კომპონენტი
│   ├── ProductSidebar.tsx         # სურათი და აუდიო preview
│   ├── VersionSelector.tsx        # Standard/Premium არჩევა
│   ├── PurchaseHeader.tsx         # ფასი და Buy/Cart ღილაკები
│   ├── ProductFeatures.tsx        # "What's Included" სექცია
│   └── UsageTerms.tsx             # ლიცენზიის პირობები
└── types/product.ts               # TypeScript ტიპები
```

---

## TypeScript ტიპები

### BackendProduct (API-დან)

```typescript
export interface BackendProduct {
  id: number;
  title: string;
  description?: string;
  standardPrice: number;
  premiumPrice?: number;
  category: string;  // 'Music' | 'SFX' | 'Preset'
  handle: string;
  imageUrl?: string;
  audioPreviewUrl?: string;
  standardFileUrl?: string;
  premiumFileUrl?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
  formattedDuration?: string;
  vendor?: string;
  featuredArtist?: string;
  assetType?: string;
  tags?: string;
  isNew: boolean;
  isPremium: boolean;  // has Premium variant
  isActive: boolean;
  createdAt: string;
  variants?: BackendVariant[];
}
```

### BackendVariant

```typescript
export interface BackendVariant {
  id: number;
  productId: number;
  name: string;  // "Standard" | "Premium"
  price: number;
  sku?: string;
  fileUrl?: string;
  position: number;
  createdAt: string;
  updatedAt?: string;
}
```

### ProductVersion (UI-სთვის)

```typescript
export interface ProductVersion {
  id: string;                    // მაგ: "version-standard"
  variantId?: number;            // Backend variant ID (for cart)
  name: 'Standard' | 'Premium';  // ვერსიის სახელი
  displayName: string;           // UI-ში საჩვენებელი
  basePrice: number;             // საბაზო ფასი
  formats: string[];             // ['WAV'] ან ['WAV', 'WAV 96kHz']
  quality: string;               // '24-bit / 48kHz'
  fileSize: string;              // '150 MB'
  isFeatured?: boolean;          // Premium = true
  stems?: AudioStem[];           // თუ stems აქვს
}
```

---

## Backend → Frontend Mapping

`products.$handle.tsx` loader-ში:

```typescript
export const loader: LoaderFunction = async ({ params }) => {
  const { handle } = params;

  // 1. Backend-დან პროდუქტის მიღება
  const product = await apiClient.getProductByHandle(handle!);

  // 2. ვერსიების აგება variants-დან
  const versions: ProductVersion[] = [];

  // Standard ვერსია (ყოველთვის არსებობს)
  versions.push({
    id: 'version-standard',
    variantId: product.variants?.find(v => v.name === 'Standard')?.id,
    name: 'Standard',
    displayName: 'Standard',
    basePrice: product.standardPrice,
    formats: ['WAV'],
    quality: '24-bit / 48kHz',
    fileSize: '150 MB',
  });

  // Premium ვერსია (თუ არსებობს)
  if (product.premiumPrice) {
    versions.push({
      id: 'version-premium',
      variantId: product.variants?.find(v => v.name === 'Premium')?.id,
      name: 'Premium',
      displayName: 'Premium',
      basePrice: product.premiumPrice,
      formats: ['WAV', 'WAV 96kHz', 'Stems'],
      quality: '24-bit / 96kHz',
      fileSize: '800 MB',
      isFeatured: true,
    });
  }

  return json({ product, versions });
};
```

---

## UI კომპონენტები

### VersionSelector

Standard/Premium არჩევის კომპონენტი. აჩვენებს:
- ვერსიის სახელი და ფასი
- რა ფორმატები შედის
- "Most Popular" badge Premium-ზე

```typescript
interface VersionSelectorProps {
  versions: ProductVersion[];
  selectedVersion: ProductVersion;
  onSelectVersion: (version: ProductVersion) => void;
  ownedVersionType?: 'standard' | 'premium' | null;
}
```

თუ მომხმარებელს უკვე აქვს Standard ნაყიდი:
- Standard ნაცრისფერია "Owned" badge-ით
- Premium აჩვენებს upgrade ფასს

### PurchaseHeader

```typescript
interface PurchaseHeaderProps {
  product: BackendProduct;
  selectedVersion: ProductVersion;
  isUpgrade?: boolean;
  upgradePrice?: number;
}
```

**Cart Integration:**

```typescript
const { addToCart, isVariantInCart, isAddingToCart } = useCart();

// Check if THIS EXACT variant is in cart
const alreadyInCart = selectedVersion.variantId
  ? isVariantInCart(product.id, selectedVersion.variantId)
  : false;

const handleAddToCart = async () => {
  await addToCart(
    product.id,              // productId
    product.handle,          // productHandle (for version replacement)
    selectedVersion.variantId // productVariantId
  );
};
```

### ProductFeatures

"What's Included" სექცია:
- ფაილის ფორმატები (WAV + WAV 96kHz)
- ხარისხი (24-bit / 96kHz)
- ფაილის ზომა
- "Individual stems included" (Premium-ისთვის)

### UsageTerms

ლიცენზიის პირობების ჩვენება:
- სად შეიძლება გამოყენება (YouTube, Films, TV...)
- Key terms (Royalty-free, Lifetime license...)
- შეზღუდვები (Cannot resell, Cannot claim ownership)

---

## Version Replacement Logic

პროდუქტის გვერდზე Standard/Premium-ს შორის გადართვისას:

1. მომხმარებელი Standard ვარიანტზეა → "Add to Cart" ღილაკი
2. Standard-ს ამატებს კალათაში → ღილაკი იცვლება "In Cart"
3. გადადის Premium ტაბზე → ღილაკი ხდება "Add to Cart" (არა "In Cart"!)
4. Premium-ს ამატებს → Standard ავტომატურად იშლება, Premium ემატება

**Implementation:**

```typescript
// CartContext.tsx
const addToCart = async (productId, productHandle, productVariantId) => {
  // Check if exact variant already in cart
  if (isVariantInCart(productId, productVariantId)) {
    onToast?.('This item is already in your cart', 'success');
    return;
  }

  // Version replacement: remove old variant if exists
  if (productHandle) {
    const existingItem = findItemByHandle(productHandle);
    if (existingItem && existingItem.productVariantId !== productVariantId) {
      await apiClient.removeCartItem(existingItem.id, sessionId);
    }
  }

  // Add new variant
  await apiClient.addToCart({ productId, productVariantId, quantity: 1 }, sessionId);
};
```

---

## Upgrade Flow

მომხმარებელს Standard აქვს ნაყიდი და Premium-ზე გადადის:

1. `usePurchases` hook ამოწმებს ownership-ს
2. `VersionSelector`-ში Standard დისაბლდება
3. `PurchaseHeader`-ში ჩანს upgrade ფასი (Premium - Standard)
4. Checkout-ში სრული ფასი იხდის

---

## API Endpoints

### Products

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| GET | `/api/products` | ყველა პროდუქტი (filtered) |
| GET | `/api/products/{id}` | პროდუქტი ID-ით |
| GET | `/api/products/handle/{handle}` | პროდუქტი handle-ით |

### Filter Parameters

```typescript
interface ProductFilterParams {
  category?: string;     // 'Music' | 'SFX' | 'Preset'
  search?: string;       // ძიება
  genre?: string;        // ჟანრი
  minPrice?: number;
  maxPrice?: number;
  minBpm?: number;
  maxBpm?: number;
  isNew?: boolean;
  isPremium?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
```

---

## Local Images

პროდუქტის სურათები შეიძლება ინახებოდეს `/public/images/packs/`-ში:

```typescript
const LOCAL_IMAGES: Record<string, string> = {
  'middle-east': '/images/packs/middle-east.png',
  'wandio': '/images/packs/wandio.png',
};

// Usage
const imageUrl = LOCAL_IMAGES[product.handle] || product.imageUrl;
```

ან Backend-ის `imageUrl` field-იდან (Cloudflare R2).

---

## დაკავშირებული ფაილები

### Core
- `app/services/api/client.ts` - Backend API client
- `app/routes/products.$handle.tsx` - Product detail loader

### Components
- `app/components/product/ProductDetailPage.tsx`
- `app/components/product/VersionSelector.tsx`
- `app/components/product/PurchaseHeader.tsx`

### Documentation
- `docs/technical/features/cart-system.md` - Cart integration
- `docs/api/PRODUCTS.md` (Backend) - Products API

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-22 | სრული გადაწერა Backend API-სთვის |
| 2026-01-21 | Cart integration update (isVariantInCart) |
| 2026-01-19 | Version replacement logic |
