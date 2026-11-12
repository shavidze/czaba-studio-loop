# Signed URLs - დეტალური გზამკვლევი

## სარჩევი
1. [რა არის Signed URLs?](#რა-არის-signed-urls)
2. [არქიტექტურა](#არქიტექტურა)
3. [Cloudflare R2 კონფიგურაცია](#cloudflare-r2-კონფიგურაცია)
4. [API Endpoint ანალიზი](#api-endpoint-ანალიზი)
5. [Frontend ინტეგრაცია](#frontend-ინტეგრაცია)
6. [უსაფრთხოების მოდელი](#უსაფრთხოების-მოდელი)

---

## რა არის Signed URLs?

### პრობლემა: Public URLs

```
Public URL:
https://pub-xxx.r2.dev/middle-east/Downloads/premium.zip

პრობლემა:
├── ვინც URL-ს იცის, გადმოწერს
├── URL გაზიარება = უფასო წვდომა ყველასთვის
├── ვერ გააკონტროლებ ვინ წერს
└── ვერ გააუქმებ წვდომას
```

### გადაწყვეტა: Signed URLs

```
Signed URL:
https://bucket.r2.dev/middle-east/Downloads/premium.zip
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Credential=AKIAIOSFODNN7EXAMPLE/20260101/auto/s3/aws4_request
  &X-Amz-Date=20260101T120000Z
  &X-Amz-Expires=3600
  &X-Amz-SignedHeaders=host
  &X-Amz-Signature=fe5f80f77d5fa3beca038a248ff027d0445342fe2855ddc963176630326f1024

უპირატესობები:
├── დროებითი (1 საათი)
├── კრიპტოგრაფიულად დაცული
├── გაზიარება უსარგებლოა (იწურება)
└── მხოლოდ მფლობელი იღებს ახალს
```

### როგორ მუშაობს ხელმოწერა?

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNATURE GENERATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input:                                                      │
│  ├── Secret Key (მხოლოდ სერვერმა იცის)                      │
│  ├── Bucket name                                             │
│  ├── Object key (file path)                                  │
│  ├── Expiration time                                         │
│  └── HTTP method (GET)                                       │
│                                                              │
│  Output:                                                     │
│  └── Signature: "fe5f80f77d5fa3beca..."                     │
│                                                              │
│  Verification (R2-ს მხარეს):                                │
│  ├── იგივე ალგორითმით ითვლის signature-ს                   │
│  ├── ადარებს URL-ში მოცემულს                               │
│  ├── ამოწმებს ვადას (Expires)                               │
│  └── თუ ემთხვევა → ფაილს აძლევს                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## არქიტექტურა

### სრული Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         DOWNLOAD FLOW                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User clicks "Download"                                        │
│     │                                                             │
│     ▼                                                             │
│  ┌─────────────┐                                                  │
│  │   Browser   │                                                  │
│  └─────────────┘                                                  │
│     │                                                             │
│     │ GET /api/download?product=middle-east&type=premium          │
│     │ Authorization: Bearer {customerAccessToken}                 │
│     ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Remix API Route                           │ │
│  │                  (api.download.ts)                           │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  2. Validate Authorization Header                            │ │
│  │     └── Bearer token არსებობს?                              │ │
│  │                                                              │ │
│  │  3. Check Ownership (Shopify API)                            │ │
│  │     ├── Query: CUSTOMER_PURCHASES_QUERY                      │ │
│  │     ├── Filter: financialStatus === 'PAID'                   │ │
│  │     └── Find: product.handle === requested handle            │ │
│  │                                                              │ │
│  │  4. Validate License Type                                    │ │
│  │     └── Premium file? → Check premium license                │ │
│  │                                                              │ │
│  │  5. Generate Signed URL (AWS SDK)                            │ │
│  │     ├── S3Client with R2 credentials                         │ │
│  │     ├── GetObjectCommand                                     │ │
│  │     └── getSignedUrl(expiresIn: 3600)                        │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│     │                                                             │
│     │ Response: { downloadUrl: "https://...signed..." }          │
│     ▼                                                             │
│  ┌─────────────┐                                                  │
│  │   Browser   │                                                  │
│  └─────────────┘                                                  │
│     │                                                             │
│     │ 6. Redirect/Open signed URL                                 │
│     ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Cloudflare R2                             │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  7. Verify Signature                                         │ │
│  │  8. Check Expiration                                         │ │
│  │  9. Serve File                                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│     │                                                             │
│     │ File binary stream                                          │
│     ▼                                                             │
│  ┌─────────────┐                                                  │
│  │   Browser   │ → Downloads file                                 │
│  └─────────────┘                                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### კომპონენტები

| კომპონენტი | როლი |
|-----------|------|
| **DownloadDialog** | UI - download ღილაკები, loading states |
| **api.download.ts** | Backend - validation, signed URL generation |
| **AWS SDK** | Library - S3-compatible API for R2 |
| **Cloudflare R2** | Storage - ფაილების შენახვა და სერვირება |
| **Shopify API** | Validation - ownership შემოწმება |

---

## Cloudflare R2 კონფიგურაცია

### 1. API Token შექმნა

```
Cloudflare Dashboard
  → R2
  → Overview
  → Manage R2 API Tokens
  → Create API Token

Settings:
  ├── Token name: "Signed-URLs-Production"
  ├── Permissions: Object Read only
  ├── Bucket: Apply to specific buckets only → your-bucket
  └── TTL: Forever (ან 1 year)
```

### 2. Credentials

Token შექმნის შემდეგ მიიღებ:

```
Access Key ID:     c77a3e4fcc4c03b0b314aa1a72d835e8
Secret Access Key: 722a7712a987d34483f877560a3d8c52341093a73b523f8aecfd3a14f56fdde0
Endpoint:          https://b972c2b9a3b0e3d4f63137ab9b6457ee.r2.cloudflarestorage.com
```

### 3. Environment Variables

```env
# .env
R2_ACCESS_KEY_ID=c77a3e4fcc4c03b0b314aa1a72d835e8
R2_SECRET_ACCESS_KEY=722a7712a987d34483f877560a3d8c52341093a73b523f8aecfd3a14f56fdde0
R2_ENDPOINT=https://b972c2b9a3b0e3d4f63137ab9b6457ee.r2.cloudflarestorage.com
R2_BUCKET_NAME=czaba-music-store
```

### 4. R2 ფაილების სტრუქტურა

```
czaba-music-store/
├── middle-east/
│   ├── Downloads/
│   │   ├── premium.zip      # Premium ლიცენზიის ფაილი
│   │   ├── standart.zip     # Standard ლიცენზიის ფაილი
│   │   └── license.pdf      # ლიცენზიის დოკუმენტი
│   └── Stems/
│       ├── drums.mp3
│       ├── bass.mp3
│       └── ...
├── another-product/
│   └── Downloads/
│       └── ...
└── ...
```

---

## API Endpoint ანალიზი

### ფაილი: `app/routes/api.download.ts`

```typescript
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ===========================================
// R2 CLIENT
// ===========================================

/**
 * getR2Client - S3Client-ის ინიციალიზაცია R2-სთვის
 *
 * რატომ S3Client?
 * Cloudflare R2 არის S3-compatible, ანუ იგივე API-ს იყენებს
 * როგორც Amazon S3. ამიტომ AWS SDK მუშაობს.
 */
function getR2Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('R2 credentials not configured');
  }

  return new S3Client({
    region: 'auto',  // R2 იყენებს 'auto' რეგიონს
    endpoint,        // Custom endpoint (არა AWS)
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// ===========================================
// SHOPIFY OWNERSHIP CHECK
// ===========================================

/**
 * checkUserOwnership - ამოწმებს მომხმარებელს აქვს თუ არა პროდუქტი
 *
 * @param customerAccessToken - Shopify customer token
 * @param productHandle - პროდუქტის URL slug
 * @returns { owned: boolean, license: 'premium' | 'standard' | null }
 *
 * Flow:
 * 1. Shopify API-ს ვუგზავნით customer token-ს
 * 2. ვიღებთ მომხმარებლის ყველა შეკვეთას
 * 3. ვფილტრავთ მხოლოდ PAID შეკვეთებს
 * 4. ვეძებთ მოთხოვნილ პროდუქტს
 * 5. ვადგენთ რა ლიცენზია აქვს (Premium/Standard)
 */
async function checkUserOwnership(
  customerAccessToken: string,
  productHandle: string
): Promise<{ owned: boolean; license: 'premium' | 'standard' | null }> {

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: CUSTOMER_PURCHASES_QUERY,
        variables: { customerAccessToken },
      }),
    }
  );

  const result = await response.json();

  // შეკვეთების iteration
  for (const orderEdge of result.data.customer.orders.edges) {
    const order = orderEdge.node;

    // მხოლოდ PAID!
    if (order.financialStatus !== 'PAID') continue;

    for (const lineItemEdge of order.lineItems.edges) {
      const variant = lineItemEdge.node.variant;

      // ვიპოვეთ პროდუქტი?
      if (variant?.product?.handle === productHandle) {

        // ლიცენზიის ტიპის დადგენა selectedOptions-დან
        const licenseOption = variant.selectedOptions.find(
          opt => opt.name.toLowerCase() === 'license'
        );

        let license: 'premium' | 'standard' | null = null;
        if (licenseOption?.value.toLowerCase().includes('premium')) {
          license = 'premium';
        } else if (licenseOption?.value.toLowerCase().includes('standard')) {
          license = 'standard';
        }

        return { owned: true, license };
      }
    }
  }

  return { owned: false, license: null };
}

// ===========================================
// MAIN LOADER
// ===========================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // ===========================================
  // 1. PARAMETER VALIDATION
  // ===========================================

  const productHandle = url.searchParams.get('product');
  const fileType = url.searchParams.get('type'); // 'premium' | 'standard' | 'license'

  if (!productHandle) {
    return json({ error: 'Missing product parameter' }, { status: 400 });
  }

  if (!fileType || !['premium', 'standard', 'license'].includes(fileType)) {
    return json({ error: 'Invalid type parameter' }, { status: 400 });
  }

  // ===========================================
  // 2. AUTHENTICATION
  // ===========================================

  /**
   * Authorization Header Format:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * ეს არის Shopify Customer Access Token, რომელიც
   * მომხმარებელს ენიჭება login-ის შემდეგ.
   */
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  const customerAccessToken = authHeader.replace('Bearer ', '');

  // ===========================================
  // 3. OWNERSHIP CHECK
  // ===========================================

  const { owned, license } = await checkUserOwnership(
    customerAccessToken,
    productHandle
  );

  if (!owned) {
    return json({ error: 'Product not purchased' }, { status: 403 });
  }

  // ===========================================
  // 4. LICENSE VALIDATION
  // ===========================================

  /**
   * Premium ფაილის მოთხოვნა + Standard ლიცენზია = 403
   *
   * მაგალითი:
   * - მომხმარებელმა იყიდა Standard ($29)
   * - ცდილობს premium.zip გადმოწერას
   * - უარი! უნდა იყიდოს Premium ($49)
   */
  if (fileType === 'premium' && license !== 'premium') {
    return json({ error: 'Premium license required' }, { status: 403 });
  }

  // ===========================================
  // 5. GENERATE SIGNED URL
  // ===========================================

  try {
    const r2Client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;

    // ფაილის path R2-ში
    let fileKey: string;
    if (fileType === 'license') {
      fileKey = `${productHandle}/Downloads/license.pdf`;
    } else {
      fileKey = `${productHandle}/Downloads/${fileType === 'premium' ? 'premium' : 'standart'}.zip`;
    }

    /**
     * GetObjectCommand - S3/R2-ს ვეუბნებით რომელი ფაილი გვინდა
     */
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    /**
     * getSignedUrl - კრიპტოგრაფიული ხელმოწერის გენერაცია
     *
     * @param expiresIn - ვადა წამებში (3600 = 1 საათი)
     *
     * რატომ 1 საათი?
     * - საკმარისია გადმოწერისთვის (დიდი ფაილებისთვისაც)
     * - საკმარისად მოკლეა რომ გაზიარება უსარგებლო იყოს
     * - ინდუსტრიის სტანდარტი
     */
    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    return json({ downloadUrl: signedUrl });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
```

### API Endpoints Summary

| Endpoint | Method | Parameters | Response |
|----------|--------|------------|----------|
| `/api/download` | GET | `product`, `type` | `{ downloadUrl }` |

### Error Codes

| Status | Error | მიზეზი |
|--------|-------|--------|
| 400 | Missing product parameter | `product` არ არის URL-ში |
| 400 | Invalid type parameter | `type` არ არის premium/standard/license |
| 401 | Missing Authorization | Authorization header არ არის |
| 403 | Product not purchased | მომხმარებელს არ აქვს ნაყიდი |
| 403 | Premium license required | Standard-ით Premium-ს ითხოვს |
| 500 | Failed to generate URL | R2 კონფიგურაციის პრობლემა |

---

## Frontend ინტეგრაცია

### DownloadDialog კომპონენტი

```typescript
// app/components/studio/DownloadDialog.tsx

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productHandle: string;              // ახალი: პროდუქტის handle
  userVersion: 'premium' | 'standard' | null;  // რა ვერსია იყიდა
  customerAccessToken?: string;       // ახალი: auth token
}

export function DownloadDialog({
  productHandle,
  customerAccessToken,
  ...props
}: DownloadDialogProps) {

  // Loading და Error states
  const [isDownloading, setIsDownloading] = useState<'premium' | 'standard' | 'license' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * handleDownload - Signed URL-ის მოთხოვნა და გადმოწერა
   */
  const handleDownload = async (
    type: 'premium' | 'standard' | 'license',
    filename: string
  ) => {
    if (!customerAccessToken) {
      setError('Authentication required');
      return;
    }

    setIsDownloading(type);
    setError(null);

    try {
      // ===========================================
      // API CALL
      // ===========================================

      const response = await fetch(
        `/api/download?product=${encodeURIComponent(productHandle)}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${customerAccessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Download failed');
      }

      // ===========================================
      // TRIGGER DOWNLOAD
      // ===========================================

      /**
       * პროგრამული გადმოწერა:
       * 1. ვქმნით <a> ელემენტს
       * 2. href = signed URL
       * 3. download = filename (browser-ს ეუბნება რომ გადმოწეროს, არ გახსნას)
       * 4. click() - პროგრამულად ვაჭერთ
       * 5. ვშლით ელემენტს
       */
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // დიალოგის დახურვა
      setTimeout(() => onClose(), 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(null);
    }
  };

  // ... UI rendering
}
```

### ProductCard-ში License Download

```typescript
// app/routes/account.downloads.tsx

function ProductCard({ product, customerAccessToken }: ProductCardProps) {
  const [isDownloadingLicense, setIsDownloadingLicense] = useState(false);

  const handleDownloadLicense = async () => {
    if (!customerAccessToken) return;

    setIsDownloadingLicense(true);
    try {
      const response = await fetch(
        `/api/download?product=${encodeURIComponent(product.handle)}&type=license`,
        {
          headers: {
            Authorization: `Bearer ${customerAccessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // PDF-ს ახალ tab-ში ვხსნით (არა download)
      window.open(data.downloadUrl, '_blank');

    } catch (error) {
      console.error('License download error:', error);
    } finally {
      setIsDownloadingLicense(false);
    }
  };

  return (
    // ... UI
    <button onClick={handleDownloadLicense} disabled={isDownloadingLicense}>
      {isDownloadingLicense ? 'Loading...' : 'Download License'}
    </button>
  );
}
```

---

## უსაფრთხოების მოდელი

### Defense in Depth (მრავალშრიანი დაცვა)

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Frontend Guard (RequireAuth)                       │
│  ├── ტიპი: UX Protection                                    │
│  ├── რას აკეთებს: არაავტორიზებულს არ აჩვენებს გვერდს       │
│  └── შეზღუდვა: Client-side, შეიძლება bypass                 │
│                                                              │
│  Layer 2: API Authentication                                 │
│  ├── ტიპი: Token Validation                                 │
│  ├── რას აკეთებს: Authorization header-ს ამოწმებს           │
│  └── შეზღუდვა: Token შეიძლება მოიპარონ                      │
│                                                              │
│  Layer 3: Shopify Ownership Check                            │
│  ├── ტიპი: Business Logic Validation                        │
│  ├── რას აკეთებს: Shopify-ს ეკითხება აქვს თუ არა ნაყიდი    │
│  └── შეზღუდვა: არცერთი - Shopify-ს ენდობით                 │
│                                                              │
│  Layer 4: License Type Check                                 │
│  ├── ტიპი: Authorization                                    │
│  ├── რას აკეთებს: Premium ფაილს Premium ლიცენზიით          │
│  └── შეზღუდვა: არცერთი                                      │
│                                                              │
│  Layer 5: Signed URL                                         │
│  ├── ტიპი: Cryptographic Protection                         │
│  ├── რას აკეთებს: დროებითი, ხელმოწერილი URL                │
│  └── შეზღუდვა: 1 საათში იწურება                             │
│                                                              │
│  Layer 6: R2 Signature Verification                          │
│  ├── ტიპი: Server-side Validation                           │
│  ├── რას აკეთებს: ხელმოწერას და ვადას ამოწმებს             │
│  └── შეზღუდვა: არცერთი - კრიპტოგრაფიულად უსაფრთხოა        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Attack Vectors და Protection

| Attack | Protection |
|--------|------------|
| URL გაზიარება | 1 საათში იწურება |
| Token მოპარვა | Shopify ownership check |
| API abuse | Rate limiting (TODO) |
| Man-in-the-middle | HTTPS everywhere |
| Replay attack | Timestamp in signature |

### Ownership vs Download Link

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   OWNERSHIP (საკუთრება)          DOWNLOAD LINK              │
│   ═══════════════════           ═════════════               │
│                                                              │
│   ✓ მუდმივი                     ✓ დროებითი (1 საათი)        │
│   ✓ Shopify-ში ინახება          ✓ ყოველ ჯერზე ახალი        │
│   ✓ წაშლა შეუძლებელია           ✓ წაშლა არ სჭირდება        │
│   ✓ გადაცემა შეუძლებელია        ✓ გაზიარება უსარგებლოა      │
│                                                              │
│   ანალოგია:                                                 │
│   ├── Ownership = სახლის საკუთრება                         │
│   └── Download Link = დროებითი გასაღები                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Production Checklist

### Deploy-მდე:

- [ ] R2 bucket გახადე Private (გათიშე public access)
- [ ] Production API token შექმენი (test token-ის ნაცვლად)
- [ ] Environment variables დააყენე Cloudflare-ზე
- [ ] Error monitoring დაამატე (Sentry)
- [ ] Rate limiting დაამატე API-ზე

### Environment Variables (Production):

```env
R2_ACCESS_KEY_ID=<production-key>
R2_SECRET_ACCESS_KEY=<production-secret>
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=czaba-music-store
```

### R2 Private გახდომა:

```
Cloudflare Dashboard
  → R2
  → czaba-music-store
  → Settings
  → Public Access: Disable
```

---

## Troubleshooting

### Error: "R2 credentials not configured"

```
მიზეზი: .env-ში არ არის R2 credentials
გადაწყვეტა: დაამატე R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT
```

### Error: "Product not purchased"

```
მიზეზი:
  ├── მომხმარებელს არ აქვს ნაყიდი
  ├── შეკვეთა არ არის PAID სტატუსში
  └── product handle არასწორია

გადაწყვეტა: შეამოწმე Shopify Admin-ში
```

### Error: "Premium license required"

```
მიზეზი: Standard ლიცენზიით Premium ფაილს ითხოვს
გადაწყვეტა: სწორი ქცევაა - მომხმარებელმა უნდა იყიდოს Premium
```

### Signed URL არ მუშაობს

```
შესაძლო მიზეზები:
  ├── URL ვადა გასულია (1 საათი)
  ├── ფაილი არ არსებობს R2-ში
  ├── Bucket name არასწორია
  └── File key (path) არასწორია

Debug:
  console.log('File key:', fileKey);
  console.log('Bucket:', bucketName);
```
