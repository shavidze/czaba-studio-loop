# Audio Cache System - IndexedDB-based Stem Caching

## შესავალი

CZABA Store იყენებს **IndexedDB-ზე დაფუძნებულ კეშირების სისტემას** Studio-ს აუდიო stem-ებისთვის. ეს სისტემა საშუალებას აძლევს მომხმარებელს, რომ მეორე ჩატვირთვისას არ დაელოდოს ქსელიდან დიდი ფაილების (~29MB თითო stem) გადმოწერას.

---

## არქიტექტურის დიაგრამა

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUDIO LOADING FLOW                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Studio Page Load                                                        │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────┐                                                     │
│  │ loadProduct()   │ ◄── StudioContext.tsx                               │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│     For each stem:                                                       │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐      YES      ┌─────────────────┐                   │
│  │ Check IndexedDB │ ──────────────▶│ Return cached   │                   │
│  │ getCachedStem() │               │ ArrayBuffer     │                   │
│  └────────┬────────┘               │ (skip network!) │                   │
│           │ NO                     └────────┬────────┘                   │
│           ▼                                 │                            │
│  ┌─────────────────┐                        │                            │
│  │ fetch() from    │                        │                            │
│  │ Cloudflare R2   │                        │                            │
│  └────────┬────────┘                        │                            │
│           │                                 │                            │
│           ▼                                 │                            │
│  ┌─────────────────┐                        │                            │
│  │ cacheStem()     │ ◄── Save for next time │                            │
│  │ (fire & forget) │                        │                            │
│  └────────┬────────┘                        │                            │
│           │                                 │                            │
│           └─────────────┬───────────────────┘                            │
│                         ▼                                                │
│               ┌─────────────────┐                                        │
│               │ Clone buffer    │ ◄── .slice(0) for safety               │
│               │ before decode   │                                        │
│               └────────┬────────┘                                        │
│                        ▼                                                 │
│               ┌─────────────────┐                                        │
│               │ decodeAudioData │ ◄── Web Audio API                      │
│               │ (async)         │                                        │
│               └────────┬────────┘                                        │
│                        ▼                                                 │
│               ┌─────────────────┐                                        │
│               │ Store in        │                                        │
│               │ audioBuffersRef │ ◄── Ready for playback                 │
│               └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ფაილები

| ფაილი | აღწერა |
|-------|--------|
| `app/lib/audio-cache.ts` | IndexedDB cache ლოგიკა |
| `app/contexts/StudioContext.tsx` | Cache-ის ინტეგრაცია loading-ში |
| `app/components/studio/StemsLoadingAnimation.tsx` | Loading UI optimistic progress-ით |

---

## IndexedDB სტრუქტურა

### Database Configuration

```typescript
const DB_NAME = 'czaba-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'stems';
const CACHE_EXPIRY_DAYS = 30;
```

### Object Store Schema

```typescript
interface CachedStem {
  key: string;           // `${productHandle}:${stemId}` - Primary Key
  productHandle: string; // პროდუქტის ID (ინდექსი)
  stemId: string;        // Stem-ის ID
  arrayBuffer: ArrayBuffer; // აუდიო მონაცემები (raw bytes)
  size: number;          // ზომა ბაიტებში
  cachedAt: number;      // Timestamp (ვადის გასაშვებად)
}
```

### Indexes

```typescript
// Object Store creation
const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
store.createIndex('productHandle', 'productHandle', { unique: false });
store.createIndex('cachedAt', 'cachedAt', { unique: false });
```

**productHandle index** - პროდუქტის ყველა stem-ის სწრაფი წაშლა

**cachedAt index** - ვადაგასული entries-ის სწრაფი პოვნა და წაშლა

---

## API ფუნქციები

### getCachedStem()

```typescript
export async function getCachedStem(
  productHandle: string,
  stemId: string
): Promise<ArrayBuffer | null>
```

**აღწერა:** ამოწმებს IndexedDB-ში არის თუ არა stem-ი cached.

**Return:**
- `ArrayBuffer` - თუ cache-ში არის და ვადა არ გასულა
- `null` - თუ cache-ში არ არის ან ვადა გასულია

**ვადის შემოწმება:**
```typescript
const ageInDays = (Date.now() - result.cachedAt) / (1000 * 60 * 60 * 24);
if (ageInDays > CACHE_EXPIRY_DAYS) {
  deleteCachedStem(productHandle, stemId); // წაშალე ვადაგასული
  return null;
}
```

---

### cacheStem()

```typescript
export async function cacheStem(
  productHandle: string,
  stemId: string,
  arrayBuffer: ArrayBuffer
): Promise<void>
```

**აღწერა:** ინახავს stem-ს IndexedDB-ში შემდგომი გამოყენებისთვის.

**მნიშვნელოვანი:** ArrayBuffer უნდა იყოს **clone** (`.slice(0)`), რადგან `decodeAudioData` "detache უკეთებს, ანუ აცლის რა" ორიგინალ buffer-ს.

**გამოყენება StudioContext-ში:**
```typescript
// Cache for next time (don't await - fire and forget)
cacheStem(product.id, stem.id, arrayBuffer.slice(0));
```

---

### deleteCachedStem()

```typescript
export async function deleteCachedStem(
  productHandle: string,
  stemId: string
): Promise<void>
```

**აღწერა:** წაშლის კონკრეტულ stem-ს cache-დან.

---

### clearProductCache()

```typescript
export async function clearProductCache(productHandle: string): Promise<void>
```

**აღწერა:** წაშლის პროდუქტის **ყველა** stem-ს cache-დან.

**გამოყენება:** თუ პროდუქტის stem-ები განახლდა სერვერზე.

---

### clearExpiredCache()

```typescript
export async function clearExpiredCache(): Promise<void>
```

**აღწერა:** წაშლის ყველა ვადაგასულ entry-ს (30+ დღიანი).

**გამოძახება:** ავტომატურად `loadProduct()`-ის დასაწყისში:
```typescript
// Clear expired cache entries on load
clearExpiredCache();
```

---

### getCacheStats()

```typescript
export async function getCacheStats(): Promise<{
  totalSize: number;     // სულ ბაიტები
  stemCount: number;     // რამდენი stem არის cached
  products: string[];    // უნიკალური productHandle-ები
}>
```

**აღწერა:** სტატისტიკა დებაგინგისთვის ან UI-სთვის.

---

## StudioContext ინტეგრაცია

### Loading Flow

```typescript
// app/contexts/StudioContext.tsx - loadProduct()

const loadPromises = product.stems.map(async (stem) => {
  let arrayBuffer: ArrayBuffer;

  // 1. Try cache first
  const cached = await getCachedStem(product.id, stem.id);

  if (cached) {
    // 2a. Cache hit - clone and use
    arrayBuffer = cached.slice(0);
    debug.log(`📦 Cache hit: ${stem.name}`);
  } else {
    // 2b. Cache miss - fetch from network
    debug.log(`Loading stem: ${stem.name} from ${stem.audioUrl}`);
    const response = await fetch(stem.audioUrl);
    arrayBuffer = await response.arrayBuffer();

    // 3. Save to cache (fire & forget)
    cacheStem(product.id, stem.id, arrayBuffer.slice(0));
  }

  // 4. Decode (ALWAYS clone before decode!)
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

  return audioBuffer;
});
```

### რატომ `.slice(0)`?

**პრობლემა:** `decodeAudioData()` ფუნქცია **"detaches" უკეთებს** ArrayBuffer-ს. ეს ნიშნავს, რომ decode-ის შემდეგ ორიგინალი ArrayBuffer-ი ცარიელი ხდება (`byteLength === 0`).

**გადაწყვეტა:** ყოველთვის clone ArrayBuffer `.slice(0)`-ით decode-მდე:

```typescript
// ❌ არასწორი - buffer განადგურდება
const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
cacheStem(id, stem.id, arrayBuffer); // ცარიელი buffer!

// ✅ სწორი - clone-ები
cacheStem(id, stem.id, arrayBuffer.slice(0)); // clone for cache
const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0)); // clone for decode
```

---

## Loading Animation (Optimistic Progress)

### კომპონენტი

**ფაილი:** `app/components/studio/StemsLoadingAnimation.tsx`

### Optimistic Progress Hook

```typescript
function useOptimisticProgress(realLoaded: number, total: number) {
  // Simulates progress reaching ~70% in 15 seconds
  // Then slows down to 85% max
  // Real progress takes over when stems actually load
}
```

**ლოგიკა:**

1. **0-15 წამი:** ease-out ანიმაციით მიდის 70%-მდე
2. **15+ წამი:** ნელა მიცოცავს 85%-მდე
3. **რეალური პროგრესი:** როცა stem იტვირთება, ნამდვილი რიცხვი "catches up"

```typescript
// Progress calculation
if (elapsed < 15000) {
  // 0-15s: ease-out to 70%
  const t = elapsed / 15000;
  const eased = 1 - Math.pow(1 - t, 2.5);
  simulatedProgress = eased * 0.7;
} else {
  // After 15s: slow crawl to 85%
  const extraTime = elapsed - 15000;
  simulatedProgress = 0.7 + Math.min(0.15, extraTime / 30000);
}
```

### Waveform Bars

```typescript
// Static when not loaded, animated reveal when loaded
<motion.div
  animate={isRevealed ? {
    height: barHeight,
    opacity: 0.9,
  } : {
    height: 4,       // Minimal static height
    opacity: 0.15,   // Dim
  }}
  transition={{
    delay: isRevealed ? i * 0.01 : 0,
    duration: 0.4,
    ease: 'easeOut'
  }}
/>
```

---

## Debugging

### debug.log ფუნქცია

პროექტში `console.log`-ის ნაცვლად გამოიყენება `debug.log`:

```typescript
import { debug } from '~/lib/debug';

debug.log('📦 Cache hit: stemName');
debug.error('Failed to cache stem:', error);
```

**უპირატესობა:** Production-ში ავტომატურად გათიშულია.

### Console Messages

```
📦 Cache hit: Drums (29.5MB)     # IndexedDB-დან ჩატვირთა
💾 Cached: Drums (29.5MB)        # IndexedDB-ში შეინახა
🧹 Cleared 5 expired entries     # ვადაგასული წაიშალა
🗑️ Cleared cache for: product-1  # პროდუქტის cache წაიშალა
```

### Browser DevTools

IndexedDB-ის ნახვა:
1. DevTools → Application → Storage → IndexedDB
2. `czaba-audio-cache` → `stems`
3. ნახავთ cached stem-ებს

---

## Performance შედარება

### პირველი ჩატვირთვა (ქსელიდან)

| Stem | ზომა | დრო (fast 3G) |
|------|------|---------------|
| Drums | 29MB | ~15-20 წამი |
| Bass | 29MB | ~15-20 წამი |
| ... | | |
| **სულ (10 stems)** | **290MB** | **~2-3 წუთი** |

### მეორე ჩატვირთვა (IndexedDB)

| ოპერაცია | დრო |
|----------|-----|
| IndexedDB read (10 stems) | ~100-500ms |
| Audio decode (10 stems) | ~2-5 წამი |
| WaveSurfer init | ~1-2 წამი |
| **სულ** | **~5-8 წამი** |

**დაზოგვა: 95%+ ქსელის დრო!**

---

## შეზღუდვები და მომავალი გაუმჯობესებები

### ამჟამინდელი შეზღუდვები

1. **Storage Limit** - IndexedDB-ს აქვს ლიმიტი (~50% ხელმისაწვდომი დისკიდან)
2. **No LRU Eviction** - თუ storage სავსეა, ძველი არ იშლება ავტომატურად
3. **No Version Check** - თუ stem განახლდა სერვერზე, cache არ იცის

### დაგეგმილი გაუმჯობესებები

1. **LRU Cache Eviction** - ძველი/ნაკლებად გამოყენებული stem-ების წაშლა
2. **Version Headers** - ETag/Last-Modified შემოწმება სერვერთან
3. **Cache Size Indicator** - UI-ში მაჩვენებელი რამდენი MB cached არის
4. **Manual Cache Clear** - მომხმარებელს შეუძლია ხელით გაწმინდოს

---

## Testing

### Manual Testing

1. **პირველი ჩატვირთვა:**
   - გახსენი Studio გვერდი
   - Console-ში ნახე: `Loading stem: X from URL`
   - DevTools → Application → IndexedDB → ნახე cached stems

2. **მეორე ჩატვირთვა:**
   - Refresh გვერდი
   - Console-ში ნახე: `📦 Cache hit: X`
   - უფრო სწრაფად იტვირთება

3. **Cache Expiry:**
   - DevTools-ში შეცვალე `cachedAt` ძველი თარიღით
   - Refresh - უნდა წაშალოს და ხელახლა ჩამოტვირთოს

### Unit Tests (TODO)

```typescript
// app/lib/audio-cache.test.ts
describe('audio-cache', () => {
  it('should cache and retrieve ArrayBuffer');
  it('should expire entries after 30 days');
  it('should clear product cache');
});
```

---

## მიმოხილვა

| ფუნქცია | სტატუსი |
|---------|---------|
| IndexedDB Caching | ✅ დასრულებული |
| Cache Expiry (30 days) | ✅ დასრულებული |
| Optimistic Loading UI | ✅ დასრულებული |
| ArrayBuffer Cloning | ✅ დასრულებული |
| debug.log Integration | ✅ დასრულებული |
| LRU Eviction | ❌ TODO |
| Version Checking | ❌ TODO |
| UI Cache Indicator | ❌ TODO |

---

**Last Updated**: 2025-01-07
**Version**: 1.0.0
**Author**: Claude Code Assistant
