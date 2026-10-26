# Testing - ტესტირების სისტემა

> შექმნილია: 2026-01-07
> სტატუსი: აქტიური

---

## მოკლე მიმოხილვა

პროექტში გვაქვს ორი ტიპის ტესტი:

| ტიპი | ინსტრუმენტი | რაოდენობა | მიზანი |
|------|-------------|-----------|--------|
| **Unit Tests** | Vitest | 47 | Service Layer და Utility ლოგიკის ტესტირება |
| **E2E Tests** | Playwright | 5 | მომხმარებლის flow-ს ტესტირება |

---

## Unit Tests (Vitest)

### რა არის?

Unit ტესტები ამოწმებენ ინდივიდუალურ ფუნქციებს იზოლაციაში. Shopify API-ს mock-ით ვანაცვლებთ.

### ფაილების სტრუქტურა (Colocation Pattern)

ტესტ ფაილები მდებარეობს source ფაილების გვერდით - ეს არის **ინდუსტრიის სტანდარტი** (React/Jest recommended).

```
app/
├── lib/
│   ├── cart-utils.ts          # Cart utility functions
│   └── cart-utils.test.ts     # 17 ტესტი
└── services/shopify/
    ├── products/
    │   ├── products.ts        # ProductService
    │   └── products.test.ts   # 7 ტესტი
    ├── customers/
    │   ├── customers.ts       # CustomerService
    │   └── customers.test.ts  # 12 ტესტი
    └── cart/
        ├── cart.ts            # CartService
        └── cart.test.ts       # 11 ტესტი
```

**რატომ Colocation?**
- ფაილი და ტესტი ერთად - ადვილი მოსაძებნი
- Refactoring-ის დროს ტესტიც გადადის
- IDE-ში მარტივი ნავიგაცია

### ბრძანებები

```bash
# Watch mode - ფაილის შეცვლაზე თავიდან გაეშვება
npm run test

# Single run - ერთჯერადი გაშვება (CI-სთვის)
npm run test:run
```

### რა იტესტება?

#### ProductService (7 ტესტი)
- `getMusic()` - მუსიკალური პროდუქტების fetch
- `getSFX()` - SFX პროდუქტების fetch
- `getPresets()` - Preset პროდუქტების fetch
- `getByHandle()` - კონკრეტული პროდუქტის fetch
- `getRawProducts()` - raw Shopify data
- Error handling - შეცდომების დამუშავება

#### CustomerService (12 ტესტი)
- `signUp()` - რეგისტრაცია
- `signIn()` - ავტორიზაცია
- `signOut()` - გამოსვლა
- `getProfile()` - პროფილის წამოღება
- `recoverPassword()` - პაროლის აღდგენა
- `getPurchases()` - შეძენების ისტორია
- `isProductOwned()` - პროდუქტის ფლობის შემოწმება
- `getOrders()` - შეკვეთების ისტორია
- Error handling - TAKEN, INVALID_CREDENTIALS და სხვა

#### CartService (11 ტესტი)
- `create()` - კალათის შექმნა
- `get()` - კალათის წამოღება
- `addLines()` - პროდუქტის დამატება
- `updateLines()` - რაოდენობის შეცვლა
- `removeLines()` - პროდუქტის წაშლა
- `updateBuyerIdentity()` - მომხმარებლის მიბმა
- `getCheckoutUrl()` - checkout URL
- Error handling

#### Cart Utilities (17 ტესტი)
Pure utility ფუნქციები კალათის ლოგიკისთვის (`app/lib/cart-utils.ts`):

- `isVariantInCart()` - ვარიანტის შემოწმება კალათაში (4 ტესტი)
- `getCartLineByProductHandle()` - პროდუქტის პოვნა handle-ით (4 ტესტი)
- `shouldReplaceVersion()` - ვერსიის ჩანაცვლების ლოგიკა (4 ტესტი)
- `getCartCount()` - კალათის რაოდენობა (2 ტესტი)
- `getCartLines()` - კალათის ხაზების მიღება (3 ტესტი)

**რატომ ცალკე utility?**
- Pure functions - ადვილი ტესტირება mock-ის გარეშე
- CartContext იყენებს ამ ფუნქციებს
- ვერსიის ჩანაცვლების ლოგიკა დატესტილია

### Mock-ის მაგალითი

```typescript
// products.test.ts
vi.mock('../client', () => ({
  shopifyQuery: vi.fn(),
  shopifyMutation: vi.fn(),
}));

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMusic returns transformed products', async () => {
    vi.mocked(shopifyQuery).mockResolvedValueOnce({
      products: {
        edges: [{ node: mockProduct }]
      }
    });

    const result = await ProductService.getMusic(10);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Track');
  });
});
```

---

## E2E Tests (Playwright)

### რა არის?

End-to-End ტესტები ამოწმებენ მთლიან user flow-ს ბრაუზერში. რეალური აპლიკაცია ეშვება და ტესტი იმიტირებს მომხმარებლის ქმედებებს.

### ფაილების სტრუქტურა

```
e2e/
└── main-flow.spec.ts    # მთავარი flow ტესტები

playwright.config.ts      # კონფიგურაცია
```

### ბრძანებები

```bash
# ტესტების გაშვება (headless)
npm run test:e2e

# ტესტების გაშვება UI-ით (დებაგისთვის)
npm run test:e2e:ui

# კონკრეტული ტესტის გაშვება
npx playwright test main-flow.spec.ts

# ბრაუზერების დაყენება (პირველად)
npx playwright install
```

### კონფიგურაცია

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### რა იტესტება?

| ტესტი | აღწერა |
|-------|--------|
| Homepage loads | მთავარი გვერდი იტვირთება, header ჩანს |
| Navigate to product | პროდუქტზე გადასვლა მუშაობს |
| Cart functionality | კალათის ღილაკი მუშაობს |
| Navigation works | nav links სწორად მუშაობს |
| Error page | 404 გვერდი სწორად ჩანს |

### E2E ტესტის მაგალითი

```typescript
// e2e/main-flow.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads and displays products', async ({ page }) => {
  await page.goto('/');

  // გვერდის title შემოწმება
  await expect(page).toHaveTitle(/CZABA/);

  // Header არსებობს
  await expect(page.locator('header')).toBeVisible();
});

test('can navigate to product page', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // პროდუქტის ლინკზე click
  const productLink = page.locator('a[href^="/products/"]').first();
  if (await productLink.isVisible()) {
    await productLink.click();
    await expect(page.url()).toContain('/products/');
  }
});
```

---

## CI/CD ინტეგრაცია

### GitHub Actions მაგალითი

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## საუკეთესო პრაქტიკები

### Unit Tests

1. **იზოლაცია** - ყოველი ტესტი დამოუკიდებელი უნდა იყოს
2. **Mock external APIs** - Shopify API mock-ით ჩანაცვლება
3. **Clear mocks** - `beforeEach`-ში `vi.clearAllMocks()`
4. **Test file naming** - `*.test.ts` source file-ის გვერდით

### E2E Tests

1. **Wait for network** - `waitForLoadState('networkidle')`
2. **Graceful failures** - თუ ელემენტი არ არის, skip და არა fail
3. **Test isolation** - ტესტები ერთმანეთზე არ უნდა იყოს დამოკიდებული
4. **Data-testid** - მნიშვნელოვან ელემენტებს `data-testid` მიეცით

---

## ახალი ტესტის დამატება

### Unit Test

```bash
# 1. შექმენი test file
touch app/services/shopify/newservice/newservice.test.ts

# 2. დაწერე ტესტი
# 3. გაუშვი
npm run test:run
```

### E2E Test

```bash
# 1. შექმენი spec file
touch e2e/new-feature.spec.ts

# 2. დაწერე ტესტი
# 3. გაუშვი UI-ით დებაგისთვის
npm run test:e2e:ui
```
