# QA Audit #001 — 2026-03-09

**სტატუსი:** DONE (20 FIXED, 1 WONTFIX, 3 OPEN — backend/low priority)
**სკოპი:** Unit Tests (Vitest) + E2E (Playwright)
**აუდიტორი:** Claude QA Agents (2 პარალელური)
**ტესტები დაწერილი:** 50 unit + 78 E2E = 128 ახალი ტესტი

---

## შედეგები

| Severity | რაოდენობა |
|----------|-----------|
| Critical | 2 |
| High | 5 |
| Medium | 12 |
| Low | 5 |
| **ჯამი** | **24** |

---

## Critical

### BUG-001: `determineVersionType` crashes null licenseType-ზე

- **ფაილი:** `app/contexts/PurchasesContext.tsx:28`
- **სტატუსი:** FIXED
- **აღწერა:** `.toLowerCase()` null/undefined-ზე იძახება. თუ API-დან licenseType null მოვა, purchases loading მთლიანად ფეილდება TypeError-ით.
- **Impact:** მომხმარებლის ნაყიდი პროდუქტები არ ჩანს, ownership guard არ მუშაობს
- **FIX:** null check დამატება: `if (!licenseType) return null;`
- **ტესტი:** `purchases-context-bugs.test.ts`

### BUG-002: `transformCart` crashes `items: null`-ზე

- **ფაილი:** `app/contexts/CartContext.tsx:73`
- **სტატუსი:** FIXED
- **აღწერა:** `.map()` null-ზე იძახება. თუ backend null items array-ს აბრუნებს, კალათა ვერ იტვირთება.
- **Impact:** კალათა მთლიანად გატეხილია, checkout შეუძლებელი
- **FIX:** `(apiCart.items ?? []).map(...)`
- **ტესტი:** `cart-context-race-bugs.test.ts`

---

## High

### BUG-003: Email typo detection false positives

- **ფაილი:** `app/lib/auth.ts:74`
- **სტატუსი:** FIXED
- **აღწერა:** `endsWith(typo)` subdomain-ებზეც მატჩდება. მაგ. `user@mail.gmail.co` → suggests `gmail.com`, `user@not-yahoo.co` → suggests `yahoo.com`. ლეგიტიმური `.co` domain-ების მომხმარებლებს არასწორ suggestion-ს აძლევს.
- **Impact:** UX confusion, მომხმარებელმა შეიძლება სწორი მეილი შეცვალოს
- **FIX:** exact domain match `===` ან strict suffix `.` + typo
- **ტესტი:** `auth-bugs.test.ts`

### BUG-004: `getProducts` drops `minPrice=0` ფილტრს

- **ფაილი:** `app/services/api/client.ts:434-441`
- **სტატუსი:** FIXED
- **აღწერა:** Truthiness check `if (params.minPrice)` — `0` falsy-ა, ამიტომ `minPrice=0` ფილტრი არ გაიგზავნება API-ზე. უფასო პროდუქტების ფილტრაცია შეუძლებელია.
- **Impact:** Store-ის ფილტრი არ მუშაობს free products-ისთვის
- **FIX:** `if (params.minPrice != null)` ან `!== undefined`
- **ტესტი:** `api-client-bugs.test.ts`

### BUG-005: `buyNow` variant-ს იგნორებს

- **ფაილი:** `app/contexts/CartContext.tsx:316`
- **სტატუსი:** FIXED
- **აღწერა:** `isInCart(productId)` მხოლოდ productId-ს ამოწმებს, variant-ს არა. თუ Standard კალათაშია და მომხმარებელი Premium-ზე Buy Now-ს აჭერს, checkout Standard-ით ხდება Premium-ის ნაცვლად.
- **Impact:** მომხმარებელი არასწორ ვერსიას იყიდის
- **FIX:** `isInCart` → `isVariantInCart(productId, productVariantId)` + variant swap logic
- **ტესტი:** `cart-context-race-bugs.test.ts`

### BUG-006: `getSessionId` crashes private browsing-ში

- **ფაილი:** `app/contexts/CartContext.tsx:62`
- **სტატუსი:** FIXED
- **აღწერა:** localStorage-ზე წვდომა try/catch-ის გარეშე. Private browsing-ში ან restricted environments-ში localStorage throw-ს აკეთებს.
- **Impact:** კალათა მთლიანად გატეხილია private browsing-ში
- **FIX:** try/catch + fallback session ID
- **ტესტი:** `cart-context-race-bugs.test.ts`

### BUG-007: Product adapter crashes null id/price-ზე

- **ფაილი:** `app/services/api/adapters/productAdapter.ts:14,115`
- **სტატუსი:** FIXED
- **აღწერა:** `null.toString()` და `null.toFixed(2)` → TypeError. API-დან null id ან null price-ით პროდუქტის მოსვლისას აპლიკაცია ფეილდება.
- **Impact:** Store page crash თუ API-ს არასრული data აქვს
- **FIX:** fallback values: `(product.id ?? 0).toString()`, `(variant.price ?? 0).toFixed(2)`
- **ტესტი:** `product-adapter-bugs.test.ts` (არსებული)

---

## Medium

### BUG-008: `formatNumber` უარყოფით რიცხვებზე

- **ფაილი:** `app/lib/product-utils.ts:101-108`
- **სტატუსი:** FIXED
- **აღწერა:** `-1500 >= 1000` → false, ამიტომ `-1500` raw string-ად ბრუნდება `-1.5k`-ის ნაცვლად.
- **ტესტი:** `product-utils-bugs.test.ts`

### BUG-009: `formatNumber` NaN/Infinity

- **ფაილი:** `app/lib/product-utils.ts:101-108`
- **სტატუსი:** FIXED
- **აღწერა:** NaN → "NaN", Infinity → "InfinityM". Guard არ აქვს.
- **ტესტი:** `product-utils-bugs.test.ts`

### BUG-010: `createDisplayVersions` — duplicate id=0

- **ფაილი:** `app/lib/product-utils.ts:62-73`
- **სტატუსი:** FIXED
- **აღწერა:** Standard/Premium fallback versions ორივეს id=0 → React key conflict.
- **ტესტი:** `product-utils-bugs.test.ts`

### BUG-011: `transformCart` negative prices

- **ფაილი:** `app/contexts/CartContext.tsx:73-84`
- **სტატუსი:** OPEN
- **აღწერა:** Malicious/buggy API response-ით negative prices ვალიდაციის გარეშე გადის.

### BUG-012: Email regex accepts RFC-invalid domains

- **ფაილი:** `app/lib/auth.ts:17`
- **სტატუსი:** OPEN
- **აღწერა:** `user@-invalid.com` ვალიდურად ითვლება.
- **ტესტი:** `auth-bugs.test.ts`

### BUG-013: Homepage `isLoading` infinite loop

- **ფაილი:** `app/routes/_index.tsx:166`
- **სტატუსი:** FIXED
- **აღწერა:** `musicProducts.length === 0` — ცარიელი კატალოგისას loading skeleton სამუდამოდ ჩანს empty state-ის ნაცვლად.
- **ტესტი:** `homepage.spec.ts` (E2E)

### BUG-014: არარსებული პროდუქტის 404 missing

- **ფაილი:** product detail route
- **სტატუსი:** WONTFIX
- **აღწერა:** `/products/nonexistent` — loader throw-ს აკეთებს 404-ს, `RouteErrorBoundary` "Not Found" ტექსტს აჩვენებს. E2E ტესტმა სხვა აპლიკაციაზე გაეშვა.
- **ტესტი:** `navigation.spec.ts` (E2E)

### BUG-015: Cart infinite skeleton backend-ის გარეშე

- **ფაილი:** `app/services/api/client.ts`
- **სტატუსი:** FIXED
- **აღწერა:** API client-ს fetch timeout არ ჰქონდა. 15 წამიანი AbortController timeout დაემატა.
- **ტესტი:** `cart-page.spec.ts` (E2E)

### BUG-016: "undefined sounds" store page-ზე

- **ფაილი:** `app/routes/store.tsx:555`
- **სტატუსი:** FIXED
- **აღწერა:** `mapProductToPack` არასდროს აყენებს `itemCount`, ტემპლეიტში `{pack.itemCount} sounds` → "undefined sounds".
- **ტესტი:** `store-page.spec.ts` (E2E)

### BUG-017: Product adapter `publishedAt` space-separated dates

- **ფაილი:** `app/services/api/adapters/productAdapter.ts:23`
- **სტატუსი:** FIXED
- **აღწერა:** `split('T')` space-separated datetime-ს ვერ ჰენდლავს.

### BUG-018: Product adapter Standard fallback missing `isFeatured`

- **ფაილი:** `app/services/api/adapters/productAdapter.ts:77-87`
- **სტატუსი:** FIXED
- **აღწერა:** Fallback Standard version-ს `isFeatured: undefined` აქვს `false`-ის ნაცვლად.

### BUG-019: `transformCart` subtotal inconsistency

- **ფაილი:** `app/contexts/CartContext.tsx:70-108`
- **სტატუსი:** OPEN
- **აღწერა:** subtotal=100 მიიღება როცა items sum=30 — billing ბაგის დამალვა.

---

## Low

### BUG-020: `validatePassword` accepts all-whitespace

- **ფაილი:** `app/lib/auth.ts:91-93`
- **სტატუსი:** FIXED
- **აღწერა:** 8 space-ით პაროლი ვალიდურია.
- **ტესტი:** `auth-bugs.test.ts`

### BUG-021: `getArtistHandle` URL-unsafe characters

- **ფაილი:** `app/lib/product-utils.ts:91-93`
- **სტატუსი:** FIXED
- **აღწერა:** Apostrophe, period URL handle-ში რჩება.
- **ტესტი:** `product-utils-bugs.test.ts`

### BUG-022: HTTP error exposes raw status code

- **ფაილი:** `app/services/api/client.ts:22`
- **სტატუსი:** OPEN
- **აღწერა:** Unmapped status codes (405, 413) raw "code: 405" ტექსტს აჩვენებს.
- **ტესტი:** `api-client-bugs.test.ts`

### BUG-023: `generateSessionId` empty random part

- **ფაილი:** `app/contexts/CartContext.tsx:56`
- **სტატუსი:** OPEN
- **აღწერა:** `Math.random()=0` → empty string session ID-ში.
- **ტესტი:** `cart-context-race-bugs.test.ts`

### BUG-024: Vendor fallback inconsistent casing

- **ფაილი:** `app/services/api/adapters/productAdapter.ts:19-20`
- **სტატუსი:** OPEN
- **აღწერა:** `'CZABA'` artist-ისთვის vs `'czaba'` handle-ისთვის — coupling.
