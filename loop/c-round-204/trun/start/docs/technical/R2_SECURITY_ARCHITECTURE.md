# R2 Security Architecture & Cloudflare Workers

> Created: 2026-01-05
> Author: Claude Code
> Status: Implementation Ready

---

## Cloudflare Worker Bindings

Worker-ს შეუძლია სხვადასხვა Cloudflare სერვისებთან დაკავშირება "Bindings"-ით:

### ჩვენ ვიყენებთ:

| Binding | რა არის | CZABA-ში |
|---------|---------|----------|
| **R2 Bucket** | Object storage (S3-ის მსგავსი) | Audio files, Downloads |
| **Environment Variables** | Secrets, config | TOKEN_SECRET |

### სამომავლო იდეები:

| Binding | რა არის | იდეა CZABA-სთვის |
|---------|---------|------------------|
| **KV Namespace** | Key-Value storage, ultra-fast | Audio preview cache, Session tokens |
| **D1 Database** | SQLite serverless DB | Download statistics, Rate limiting logs |
| **Analytics Engine** | Custom analytics | Track plays, downloads, popular tracks |
| **Workers AI** | AI models on edge | Audio classification, Mood detection |
| **Rate Limiter** | Request limiting | Prevent abuse, DDoS protection |
| **Queue** | Background job processing | Audio transcoding, Email notifications |
| **Durable Objects** | Stateful serverless | Real-time collaboration in Studio |
| **Browser Rendering** | Headless browser | Generate waveform images, Social previews |

---

### იდეა 1: KV Cache for Previews
```javascript
// Preview-ები KV-ში cache, R2-ზე fallback
const cached = await env.PREVIEW_CACHE.get(r2Key, 'arrayBuffer');
if (cached) return new Response(cached, { headers });

const object = await env.R2_BUCKET.get(r2Key);
await env.PREVIEW_CACHE.put(r2Key, object.body, { expirationTtl: 86400 });
```

### იდეა 2: Analytics - Track Downloads
```javascript
// D1-ში ჩაწერე ყოველი download
await env.ANALYTICS_DB.prepare(
  'INSERT INTO downloads (product, user_id, timestamp) VALUES (?, ?, ?)'
).bind(productHandle, userId, Date.now()).run();
```

### იდეა 3: Rate Limiting
```javascript
// თითო IP-ზე 100 request/საათში
const { success } = await env.RATE_LIMITER.limit({ key: clientIP });
if (!success) return new Response('Too Many Requests', { status: 429 });
```

### იდეა 4: AI Audio Tagging
```javascript
// Workers AI - ავტომატური genre/mood detection
const analysis = await env.AI.run('@cf/audio-classification', {
  audio: audioBuffer
});
// { genre: "cinematic", mood: "epic", bpm: 120 }
```

### იდეა 5: Real-time Studio Collaboration
```javascript
// Durable Objects - მრავალი მომხმარებელი ერთ Studio-ში
export class StudioSession {
  async fetch(request) {
    // WebSocket-ით real-time sync
    // ერთი მომხმარებელი აჭერს Play → ყველას უკრავს
  }
}
```

---

## Problem Statement

CZABA-ს R2 bucket-ში სამი ტიპის კონტენტი ინახება:

1. **Preview** - აუდიო პრევიუები პროდუქტის გვერდებისთვის (საჯარო)
2. **Studio-Assets** - WAV stems სტუდიოსთვის (Premium მფლობელებისთვის)
3. **Downloads** - ZIP ფაილები გადმოსაწერად (მყიდველებისთვის)

**პრობლემა:** R2 bucket მთლიანად private ან public უნდა იყოს. ჩვენ გვჭირდება path-based access control.

## Solution: Cloudflare Worker Proxy

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser/App   │────▶│ Cloudflare Worker│────▶│  R2 Bucket  │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Access Check │
                        │  - Path      │
                        │  - Token     │
                        └──────────────┘
```

Worker-ი მოქმედებს როგორც proxy:
- იღებს request-ს
- ამოწმებს path-ს და token-ს
- ან უშვებს, ან აბრუნებს 401/403

## Access Matrix

| Path Pattern | Access Level | Token Required | Expiration |
|--------------|--------------|----------------|------------|
| `/preview/*` | Public | No | N/A |
| `/studio/*` | Protected | Yes | 2 hours |
| `/download/*` | Protected | Yes | 30 minutes |

## Token Architecture

### Token Structure
```typescript
interface Token {
  productHandle: string;  // რომელი პროდუქტისთვის
  userId: string;         // რომელი მომხმარებლისთვის
  expiresAt: number;      // როდის ვადაგასული
  signature: string;      // HMAC-SHA256 ხელმოწერა
}
```

### Token Generation (Server-side)
```typescript
// app/lib/r2-tokens.server.ts

const payload = {
  productHandle: "middle-east",
  userId: "user-123",
  expiresAt: Date.now() + 2 * 60 * 60 * 1000,  // 2 საათი
  signature: HMAC_SHA256(`${productHandle}:${userId}:${expiresAt}`, SECRET)
};

const token = base64(JSON.stringify(payload));
```

### Token Validation (Worker-side)
```javascript
// cloudflare/r2-worker.js

1. Decode base64
2. Parse JSON
3. Check expiresAt < Date.now()
4. Verify HMAC signature
5. Check productHandle matches request path
```

## File Structure

```
czaba-store/
├── cloudflare/
│   ├── r2-worker.js      # Cloudflare Worker კოდი
│   └── wrangler.toml     # Worker კონფიგურაცია
├── app/
│   └── lib/
│       └── r2-tokens.server.ts  # Token generation
└── docs/
    ├── R2_ACCESS_CONTROL.md     # Setup guide
    └── technical/
        └── R2_SECURITY_ARCHITECTURE.md  # This file
```

## Security Considerations

### 1. Token Security
- **Short Expiration**: Downloads 30min, Studio 2hr
- **Product-Specific**: Token მხოლოდ ერთ პროდუქტზე მუშაობს
- **User-Bound**: Token მიბმულია კონკრეტულ user ID-ზე
- **HMAC Signed**: ვერ დაფორჯავ token-ს secret-ის გარეშე

### 2. Transport Security
- HTTPS მხოლოდ
- CORS კონფიგურაცია ბრაუზერებისთვის

### 3. Secret Management
- `TOKEN_SECRET` ინახება Cloudflare-ის encrypted environment variables-ში
- იგივე secret უნდა იყოს Remix app-ში

## URL Examples

### Public Preview
```
GET https://r2.czaba.com/preview/middle-east/preview.mp3
→ 200 OK (public)
```

### Protected Studio Asset
```
GET https://r2.czaba.com/studio/middle-east/Bass.wav
→ 401 Unauthorized (no token)

GET https://r2.czaba.com/studio/middle-east/Bass.wav?token=eyJ...
→ 200 OK (valid token)
→ 401 Unauthorized (expired/invalid token)
→ 403 Forbidden (token for different product)
```

### Protected Download
```
GET https://r2.czaba.com/download/middle-east/premium.zip?token=eyJ...
→ 200 OK + Content-Disposition: attachment
```

## Integration Points

### 1. Product Page (Preview)
```typescript
// No token needed
const previewUrl = `${R2_WORKER_URL}/preview/${handle}/preview.mp3`;
```

### 2. Studio Page
```typescript
// In loader - generate tokens for authenticated user
export async function loader({ request }) {
  const user = await requireAuth(request);

  const stems = stemsData.map(stem => ({
    ...stem,
    audioUrl: getStudioAssetUrl(productHandle, stem.file, user.id)
  }));

  return json({ stems });
}
```

### 3. Downloads Page
```typescript
// In loader - generate download URLs
const downloadUrl = getDownloadUrl(productHandle, 'premium.zip', user.id);
```

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 401 | No token or invalid | Redirect to login |
| 403 | Wrong product access | Show "Access Denied" |
| 404 | File not found | Show "Not Found" |
| 500 | Worker error | Retry or show error |

## Monitoring

Cloudflare Dashboard-ში:
- Analytics → Workers → czaba-r2-proxy
- Request count, error rate, latency

## Future Improvements

1. **Rate Limiting** - თითო IP-ზე request limit
2. **Logging** - Access logs Cloudflare Analytics-ში
3. **Geo-Blocking** - თუ საჭირო გახდა
4. **Bandwidth Quotas** - თითო მომხმარებელზე download limit
