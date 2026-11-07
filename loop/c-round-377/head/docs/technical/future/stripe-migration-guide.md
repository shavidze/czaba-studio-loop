# Stripe-ზე მიგრაციის გზამკვლევი

## შესავალი

ეს დოკუმენტი აღწერს როგორ გადავიდეთ Shopify-დან Stripe-ზე ციფრული პროდუქტების გაყიდვისთვის.
დოკუმენტი მომზადებულია CZABA პროექტისთვის.

---

## სარჩევი

1. [რატომ Stripe?](#რატომ-stripe)
2. [არქიტექტურის მიმოხილვა](#არქიტექტურის-მიმოხილვა)
3. [Stripe-ის საფუძვლები](#stripe-ის-საფუძვლები)
4. [Products და Prices](#products-და-prices)
5. [Checkout Session](#checkout-session)
6. [Webhooks](#webhooks)
7. [ციფრული პროდუქტის მიწოდება](#ციფრული-პროდუქტის-მიწოდება)
8. [Customer Portal](#customer-portal)
9. [უსაფრთხოება](#უსაფრთხოება)
10. [ტესტირება](#ტესტირება)
11. [Production Checklist](#production-checklist)
12. [კოდის მაგალითები](#კოდის-მაგალითები)

---

## რატომ Stripe?

### Shopify vs Stripe შედარება

| კრიტერიუმი | Shopify | Stripe |
|------------|---------|--------|
| თვიური fee | $39-399 | $0 |
| Transaction fee | 2-2.9% + payment fee | მხოლოდ 2.9% + 30¢ |
| Checkout დიზაინი | შეზღუდული | სრული კონტროლი |
| ციფრული პროდუქტები | მოუხერხებელი | იდეალური |
| Developer Experience | საშუალო | შესანიშნავი |
| საქართველოში | Shopify Payments არ მუშაობს | მუშაობს |

### საქართველოში Stripe

Stripe საქართველოში პირდაპირ არ მუშაობს merchant account-ისთვის, მაგრამ:
- **Stripe Atlas** - შეგიძლია დაარეგისტრირო US LLC და მიიღო Stripe account
- **Paddle/LemonSqueezy** - ალტერნატივა, Merchant of Record (თვითონ ამუშავებენ გადასახადებს)

---

## არქიტექტურის მიმოხილვა

### მიმდინარე არქიტექტურა (Shopify)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Remix     │ ───▶ │  Shopify    │ ───▶ │  Shopify    │
│  Frontend   │      │ Storefront  │      │  Checkout   │
│  (Vercel)   │      │    API      │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

### სამიზნე არქიტექტურა (Stripe)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Remix     │ ───▶ │   Remix     │ ───▶ │   Stripe    │
│  Frontend   │      │  Backend    │      │  Checkout   │
│  (Vercel)   │      │  (Actions)  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Sanity    │      │  Supabase   │      │   R2/S3     │
│    CMS      │      │  Database   │      │   Files     │
└─────────────┘      └─────────────┘      └─────────────┘
```

### კომპონენტების აღწერა

1. **Remix Frontend** - მომხმარებლის ინტერფეისი (უკვე გვაქვს)
2. **Remix Backend (Actions)** - API endpoints Stripe-თან კომუნიკაციისთვის
3. **Stripe Checkout** - გადახდის გვერდი (Stripe-ის hosted ან embedded)
4. **Sanity CMS** - პროდუქტების მენეჯმენტი (ან JSON/Supabase)
5. **Supabase** - მომხმარებლები, შეკვეთები, ლიცენზიები
6. **R2/S3** - ციფრული ფაილების შენახვა

---

## Stripe-ის საფუძვლები

### ძირითადი კონცეფციები

#### 1. API Keys

```env
# .env ფაილში

# Test mode (განვითარებისთვის)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Live mode (production)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

# Webhook signing secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### 2. Stripe SDK დაყენება

```bash
npm install stripe @stripe/stripe-js
```

#### 3. Stripe Client-ის ინიციალიზაცია

**Server-side (Node.js/Remix Action):**
```typescript
// app/lib/stripe.server.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // გამოიყენე უახლესი ვერსია
  typescript: true,
});
```

**Client-side:**
```typescript
// app/lib/stripe.client.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.STRIPE_PUBLISHABLE_KEY!
);
```

---

## Products და Prices

### კონცეფცია

Stripe-ში პროდუქტს აქვს:
- **Product** - პროდუქტის ინფორმაცია (სახელი, აღწერა, სურათი)
- **Price** - ფასი (პროდუქტს შეიძლება ჰქონდეს რამდენიმე ფასი)

### პროდუქტის შექმნა Dashboard-ში

1. გადადი [Stripe Dashboard](https://dashboard.stripe.com/products)
2. დააჭირე "Add product"
3. შეავსე ინფორმაცია
4. დააყენე ფასი (one-time payment ციფრული პროდუქტისთვის)

### პროდუქტის შექმნა კოდით

```typescript
// პროდუქტის შექმნა
const product = await stripe.products.create({
  name: 'Trap Drum Kit Vol. 1',
  description: '50+ premium trap drums',
  images: ['https://czaba.ge/images/trap-kit.jpg'],
  metadata: {
    category: 'drum-kit',
    file_url: 'https://files.czaba.ge/trap-kit-v1.zip', // დაცული URL
  },
});

// ფასის დამატება
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 2900, // $29.00 (ცენტებში!)
  currency: 'usd',
});

console.log('Product ID:', product.id);   // prod_xxxxx
console.log('Price ID:', price.id);        // price_xxxxx
```

### მნიშვნელოვანი: Price ID

Checkout Session-ის შექმნისას გჭირდება **Price ID**, არა Product ID:

```typescript
// სწორი
line_items: [{ price: 'price_xxxxx', quantity: 1 }]

// არასწორი
line_items: [{ product: 'prod_xxxxx', quantity: 1 }]
```

---

## Checkout Session

### რა არის Checkout Session?

Checkout Session არის დროებითი გადახდის სესია, რომელიც:
1. იქმნება როცა მომხმარებელი იწყებს checkout-ს
2. შეიცავს პროდუქტებს, ფასებს, redirect URL-ებს
3. იხურება გადახდის შემდეგ ან ვადის გასვლისას

### Checkout Session-ის შექმნა

```typescript
// app/routes/api.create-checkout.ts
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { stripe } from '~/lib/stripe.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const priceId = formData.get('priceId') as string;
  const customerEmail = formData.get('email') as string | null;

  try {
    const session = await stripe.checkout.sessions.create({
      // გადახდის რეჟიმი
      mode: 'payment', // 'payment' | 'subscription' | 'setup'

      // პროდუქტები
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // მომხმარებლის email (pre-fill)
      customer_email: customerEmail ?? undefined,

      // წარმატების შემდეგ redirect
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

      // გაუქმების შემდეგ redirect
      cancel_url: `${process.env.APP_URL}/cart`,

      // დამატებითი მონაცემები (webhook-ში მიიღებ)
      metadata: {
        product_type: 'digital',
        user_id: 'user_123', // თუ გაქვს auth
      },

      // გადახდის მეთოდები
      payment_method_types: ['card'],

      // ავტომატური გადასახადის გამოთვლა (თუ გჭირდება)
      // automatic_tax: { enabled: true },
    });

    // Redirect URL დააბრუნე frontend-ს
    return json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    return json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
```

### Frontend-იდან გამოძახება

```typescript
// app/components/BuyButton.tsx
import { useFetcher } from '@remix-run/react';

export function BuyButton({ priceId, email }: { priceId: string; email?: string }) {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== 'idle';

  // Redirect როცა URL მიიღება
  useEffect(() => {
    if (fetcher.data?.url) {
      window.location.href = fetcher.data.url;
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" action="/api/create-checkout">
      <input type="hidden" name="priceId" value={priceId} />
      {email && <input type="hidden" name="email" value={email} />}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Buy Now'}
      </button>
    </fetcher.Form>
  );
}
```

### Checkout Session პარამეტრები

| პარამეტრი | აღწერა |
|-----------|--------|
| `mode` | `payment` (ერთჯერადი), `subscription` (გამოწერა) |
| `line_items` | პროდუქტები და რაოდენობა |
| `success_url` | წარმატების გვერდი |
| `cancel_url` | გაუქმების გვერდი |
| `customer_email` | Email pre-fill |
| `metadata` | custom მონაცემები (მიიღებ webhook-ში) |
| `allow_promotion_codes` | ფასდაკლების კოდების დაშვება |
| `expires_at` | სესიის ვადა (default: 24 საათი) |

---

## Webhooks

### რა არის Webhook?

Webhook არის HTTP POST მოთხოვნა, რომელსაც Stripe აგზავნის შენს სერვერზე მოვლენების დროს:
- გადახდა წარმატებულია
- გადახდა ჩავარდა
- გამოწერა გაუქმდა
- და ა.შ.

### რატომ არის აუცილებელი?

```
მომხმარებელი      შენი საიტი         Stripe           შენი Backend
     │                │                 │                    │
     │─── Buy Now ───▶│                 │                    │
     │                │── Create ──────▶│                    │
     │                │   Session       │                    │
     │◀── Redirect ───│◀───────────────│                    │
     │                │                 │                    │
     │─── Payment ──────────────────────▶                    │
     │                │                 │                    │
     │◀── Success ──────────────────────│                    │
     │    Page        │                 │                    │
     │                │                 │─── Webhook ───────▶│
     │                │                 │   (payment.success) │
     │                │                 │                    │
     │                │                 │    ▼               │
     │                │                 │   DB-ში ჩაწერა     │
     │                │                 │   Email გაგზავნა   │
     │                │                 │   File URL-ის გენერაცია
```

**მნიშვნელოვანი:** არ დაეყრდნო success_url-ს ლოგიკისთვის! მომხმარებელმა შეიძლება:
- დახუროს browser გადახდის შემდეგ
- არ მოხვდეს success გვერდზე ქსელის პრობლემის გამო

Webhook **გარანტირებულად** მოვა Stripe-დან.

### Webhook Endpoint-ის შექმნა

```typescript
// app/routes/api.stripe-webhook.ts
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { stripe } from '~/lib/stripe.server';
import type Stripe from 'stripe';

// მნიშვნელოვანი: Raw body გჭირდება signature verification-ისთვის
export const config = {
  // Remix-ში ეს ავტომატურად მუშაობს
};

export async function action({ request }: ActionFunctionArgs) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Signature verification - უსაფრთხოებისთვის აუცილებელია!
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Event-ის დამუშავება
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleFailedPayment(paymentIntent);
      break;
    }

    // სხვა events...
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Stripe-ს უნდა დაუბრუნო 200
  return json({ received: true });
}

// წარმატებული გადახდის დამუშავება
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email!;
  const metadata = session.metadata!;

  console.log('Payment successful:', {
    sessionId: session.id,
    email: customerEmail,
    amount: session.amount_total,
    metadata,
  });

  // 1. შეკვეთის შენახვა DB-ში
  // await db.orders.create({
  //   stripeSessionId: session.id,
  //   email: customerEmail,
  //   amount: session.amount_total,
  //   status: 'completed',
  // });

  // 2. Download link-ის გენერაცია
  // const downloadUrl = await generateSecureDownloadUrl(metadata.product_id);

  // 3. Email-ის გაგზავნა (Brevo-ით)
  // await sendPurchaseEmail(customerEmail, downloadUrl);
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);
  // შეგიძლია email გაუგზავნო მომხმარებელს
}
```

### Webhook-ის რეგისტრაცია Stripe Dashboard-ში

1. გადადი [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. დააჭირე "Add endpoint"
3. შეიყვანე URL: `https://czaba.ge/api/stripe-webhook`
4. აირჩიე events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. დააკოპირე Webhook Signing Secret → `.env`

### ლოკალური ტესტირება

Stripe CLI-ით:

```bash
# Stripe CLI დაყენება
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Webhook-ების forward ლოკალურ სერვერზე
stripe listen --forward-to localhost:5173/api/stripe-webhook

# გამოჩნდება webhook secret (whsec_xxx)
# დააკოპირე .env-ში
```

---

## ციფრული პროდუქტის მიწოდება

### უსაფრთხო Download URL-ის გენერაცია

```typescript
// app/lib/files.server.ts

// Cloudflare R2-ის მაგალითი (S3-თან თავსებადი)
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateSecureDownloadUrl(
  fileKey: string,
  expiresInSeconds: number = 3600 // 1 საათი
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
  });

  const signedUrl = await getSignedUrl(r2, command, {
    expiresIn: expiresInSeconds,
  });

  return signedUrl;
}
```

### Download გვერდი

```typescript
// app/routes/download.$orderId.tsx
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { generateSecureDownloadUrl } from '~/lib/files.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const { orderId } = params;

  // 1. შეკვეთის შემოწმება DB-ში
  // const order = await db.orders.findUnique({ where: { id: orderId } });

  // 2. თუ არ არსებობს ან არ არის გადახდილი
  // if (!order || order.status !== 'completed') {
  //   throw new Response('Order not found', { status: 404 });
  // }

  // 3. Download URL-ის გენერაცია
  // const downloadUrl = await generateSecureDownloadUrl(order.fileKey);

  // დროებითი mock
  const downloadUrl = 'https://example.com/file.zip';

  return json({ downloadUrl, orderId });
}

export default function DownloadPage() {
  const { downloadUrl, orderId } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Your Download is Ready!</h1>
      <p className="text-muted mb-8">Order: {orderId}</p>

      <a
        href={downloadUrl}
        className="btn-primary"
        download
      >
        Download Now
      </a>

      <p className="text-sm text-muted mt-4">
        Link expires in 1 hour. You can always access your purchases from your account.
      </p>
    </div>
  );
}
```

### Email-ით Download Link-ის გაგზავნა (Brevo)

```typescript
// app/lib/email.server.ts
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export async function sendPurchaseEmail(
  email: string,
  productName: string,
  downloadUrl: string
) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Your download is ready: ${productName}`;
  sendSmtpEmail.htmlContent = `
    <h1>Thank you for your purchase!</h1>
    <p>Your download link for <strong>${productName}</strong>:</p>
    <p><a href="${downloadUrl}">Download Now</a></p>
    <p>This link expires in 24 hours.</p>
    <p>You can also access your purchases anytime from your account.</p>
  `;
  sendSmtpEmail.sender = { name: 'CZABA', email: 'noreply@czaba.ge' };
  sendSmtpEmail.to = [{ email }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent to:', email);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
```

---

## Customer Portal

Stripe Customer Portal - მომხმარებლებს საშუალებას აძლევს:
- ნახონ payment history
- განაახლონ payment method
- გააუქმონ subscription (თუ გაქვს)

### Portal Session-ის შექმნა

```typescript
// app/routes/api.customer-portal.ts
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { stripe } from '~/lib/stripe.server';
import { requireUser } from '~/lib/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  // მომხმარებლის Stripe Customer ID (უნდა შეინახო DB-ში პირველი checkout-ის დროს)
  const customerId = user.stripeCustomerId;

  if (!customerId) {
    throw new Response('No Stripe customer found', { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}/account`,
  });

  return redirect(session.url);
}
```

---

## უსაფრთხოება

### 1. Webhook Signature Verification

**ყოველთვის** გადაამოწმე webhook signature:

```typescript
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### 2. Idempotency Keys

თავიდან აცილებისთვის double-charging:

```typescript
const session = await stripe.checkout.sessions.create(
  {
    // ... options
  },
  {
    idempotencyKey: `checkout_${userId}_${productId}_${timestamp}`,
  }
);
```

### 3. Download URL-ის უსაფრთხოება

- გამოიყენე signed URLs ვადით (1-24 საათი)
- შეამოწმე user authentication
- შეზღუდე download რაოდენობა (optional)

```typescript
// თითო შეკვეთისთვის download count-ის tracking
const order = await db.orders.findUnique({ where: { id: orderId } });

if (order.downloadCount >= 5) {
  throw new Response('Download limit reached', { status: 403 });
}

await db.orders.update({
  where: { id: orderId },
  data: { downloadCount: { increment: 1 } },
});
```

### 4. Rate Limiting

```typescript
// app/middleware/rateLimit.ts
// გამოიყენე upstash/ratelimit ან მსგავსი
```

---

## ტესტირება

### Test Mode

Stripe-ს აქვს ორი mode:
- **Test mode** - ყალბი გადახდები, საიტი არ დაიჩარჯება
- **Live mode** - რეალური გადახდები

### Test Card Numbers

| Card Number | აღწერა |
|-------------|--------|
| 4242424242424242 | წარმატებული გადახდა |
| 4000000000000002 | Declined |
| 4000000000009995 | Insufficient funds |
| 4000002500003155 | Requires 3D Secure |

### Test Checkout

```typescript
// .env.development
STRIPE_SECRET_KEY=sk_test_xxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxx
```

---

## Production Checklist

### გადასვლამდე შეამოწმე:

- [ ] Live API keys დაყენებულია production-ზე
- [ ] Webhook endpoint დარეგისტრირებულია live mode-ში
- [ ] Webhook signature verification მუშაობს
- [ ] Error handling დაწერილი
- [ ] Logging დაყენებული
- [ ] Email templates მზადაა
- [ ] Download links მუშაობს
- [ ] Test purchase გაკეთებულია live mode-ში
- [ ] Refund flow მზადაა (optional)

---

## კოდის მაგალითები

### სრული Flow: Cart → Checkout → Webhook → Download

```
app/
├── routes/
│   ├── api.create-checkout.ts    # Checkout session შექმნა
│   ├── api.stripe-webhook.ts     # Webhook handler
│   ├── success.tsx               # Success page
│   └── download.$orderId.tsx     # Download page
├── lib/
│   ├── stripe.server.ts          # Stripe client
│   ├── files.server.ts           # File URL generation
│   └── email.server.ts           # Email sending
└── components/
    └── BuyButton.tsx             # Buy button component
```

### Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# R2/S3 (files)
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=czaba-files

# App
APP_URL=https://czaba.ge

# Brevo (email)
BREVO_API_KEY=xxx
```

---

## შემდეგი ნაბიჯები

1. **დაარეგისტრირე Stripe account** (Stripe Atlas თუ საქართველოში ხარ)
2. **შექმენი test products** Dashboard-ში
3. **დაწერე checkout endpoint**
4. **დააყენე Stripe CLI** ლოკალური ტესტირებისთვის
5. **დაწერე webhook handler**
6. **დატესტე full flow**
7. **გადართე live mode**

---

## რესურსები

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Checkout Session](https://stripe.com/docs/api/checkout/sessions)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Test Cards](https://stripe.com/docs/testing)

---

*დოკუმენტი მომზადებულია CZABA პროექტისთვის*
*ბოლო განახლება: 2024*
