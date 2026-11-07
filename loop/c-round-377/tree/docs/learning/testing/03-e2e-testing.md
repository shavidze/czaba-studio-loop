# E2E ტესტირება (Playwright)

## რა არის E2E?

E2E (End-to-End) ტესტი **ნამდვილ ბრაუზერში** ტესტავს აპლიკაციას — ზუსტად ისე როგორც მომხმარებელი იყენებს.

```
Unit Test:       ფუნქცია → შედეგი
Integration:     Controller → Service → Database
E2E:             ბრაუზერი → დაკლიკება → გვერდი იცვლება → API → Database → UI განახლება
```

### რატომ Playwright?

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| ბრაუზერები | Chrome, Firefox, Safari, Mobile | Chrome (ძირითადად) |
| სიჩქარე | სწრაფი (parallel) | ნელი |
| Auto-wait | ავტომატური | ხელით |
| TypeScript | native | plugin |
| Network mocking | ჩაშენებული | plugin |

---

## Setup

```bash
# ინსტალაცია
npm init playwright@latest

# ეს შექმნის:
# playwright.config.ts
# tests/
# .github/workflows/playwright.yml (optional)
```

### playwright.config.ts

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,         // 30 წამი max ტესტზე
  retries: 1,             // 1 retry flaky ტესტზე
  use: {
    baseURL: "http://localhost:5173",  // store URL
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "mobile", use: { ...devices["iPhone 14"] } },
  ],
});
```

---

## Playwright-ის საფუძვლები

### Page Object — ბრაუზერის გვერდი

```typescript
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  // page = ბრაუზერის tab

  await page.goto("/");  // გახსენი URL

  // შეამოწმე რომ title ჩანს
  await expect(page.getByRole("heading", { name: "CZABA" })).toBeVisible();
});
```

### Locators — ელემენტების პოვნა

```typescript
// Role-ით (საუკეთესო)
page.getByRole("button", { name: "Add to Cart" });
page.getByRole("link", { name: "Products" });
page.getByRole("heading", { level: 1 });

// Label-ით (form elements)
page.getByLabel("Email");
page.getByLabel("Password");

// Placeholder-ით
page.getByPlaceholder("Search products...");

// ტექსტით
page.getByText("Welcome back!");

// Test ID-ით (ბოლო საშუალება)
page.getByTestId("product-card");
```

### Actions — მოქმედებები

```typescript
// დაკლიკება
await page.getByRole("button", { name: "Login" }).click();

// ტექსტის ჩაწერა
await page.getByLabel("Email").fill("test@example.com");

// Select
await page.getByLabel("Category").selectOption("Track");

// Hover
await page.getByText("Profile").hover();

// ნავიგაცია
await page.goto("/products");

// ელოდება
await page.waitForURL("/dashboard");
```

### Assertions — შემოწმებები

```typescript
// ელემენტი ჩანს
await expect(page.getByText("Success")).toBeVisible();

// ელემენტი არ ჩანს
await expect(page.getByText("Error")).not.toBeVisible();

// URL
await expect(page).toHaveURL("/products");

// Title
await expect(page).toHaveTitle("CZABA Store");

// Input value
await expect(page.getByLabel("Email")).toHaveValue("test@test.com");

// Count
await expect(page.getByTestId("product-card")).toHaveCount(10);
```

---

## Czaba Critical Path Tests

### 1. Auth Flow

```typescript
// tests/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("SecurePass123!");

    await page.getByRole("button", { name: "Register" }).click();

    // წარმატებული რეგისტრაციის შემდეგ redirect
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Test User")).toBeVisible();
  });

  test("should login with email", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("SecurePass123!");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL("/");
  });

  test("should show error for wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("WrongPassword");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("should logout", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("SecurePass123!");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL("/");

    // Logout
    await page.getByRole("button", { name: "Logout" }).click();

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });
});
```

### 2. Product Browsing

```typescript
// tests/products.spec.ts
test.describe("Products", () => {
  test("should display products list", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByTestId("product-card").first()).toBeVisible();
  });

  test("should filter by category", async ({ page }) => {
    await page.goto("/products");

    await page.getByRole("button", { name: "SFX" }).click();

    // URL-ში category parameter
    await expect(page).toHaveURL(/category=SFX/);
  });

  test("should open product detail page", async ({ page }) => {
    await page.goto("/products");

    await page.getByTestId("product-card").first().click();

    // Product detail page
    await expect(page.getByRole("button", { name: /add to cart/i })).toBeVisible();
  });

  test("should search products", async ({ page }) => {
    await page.goto("/products");

    await page.getByPlaceholder("Search").fill("Epic");

    await expect(page.getByText("Epic")).toBeVisible();
  });
});
```

### 3. Cart + Checkout Flow

```typescript
// tests/checkout.spec.ts
test.describe("Checkout Flow", () => {
  test("should complete purchase flow", async ({ page }) => {
    // 1. ნავიგაცია პროდუქტზე
    await page.goto("/products");
    await page.getByTestId("product-card").first().click();

    // 2. კალათაში დამატება
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page.getByText("Added to cart")).toBeVisible();

    // 3. კალათის გახსნა
    await page.getByRole("button", { name: /cart/i }).click();
    await expect(page.getByText(/total/i)).toBeVisible();

    // 4. Checkout (Stripe redirect)
    await page.getByRole("button", { name: /checkout/i }).click();

    // Stripe-ზე redirect
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });
});
```

---

## Page Object Model (POM)

დიდ პროექტში **Page Object**-ებს იყენებ — თითოეული გვერდისთვის კლასი.

```typescript
// tests/pages/LoginPage.ts
import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

```typescript
// tests/auth.spec.ts — POM-ით
import { LoginPage } from "./pages/LoginPage";

test("should login successfully", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login("test@example.com", "SecurePass123!");

  await expect(page).toHaveURL("/");
});
```

### რატომ POM?

```
POM-ის გარეშე:
  ტესტი 1: page.getByLabel("Email").fill(...)
  ტესტი 2: page.getByLabel("Email").fill(...)
  ტესტი 3: page.getByLabel("Email").fill(...)
  → Label შეიცვალა? 3 ადგილას ასწორებ

POM-ით:
  LoginPage.emailInput = page.getByLabel("Email")
  ტესტი 1: loginPage.login(...)
  ტესტი 2: loginPage.login(...)
  ტესტი 3: loginPage.login(...)
  → Label შეიცვალა? 1 ადგილას ასწორებ
```

---

## Network Mocking (Playwright)

```typescript
test("should handle API error gracefully", async ({ page }) => {
  // API call-ს იჭერ და error-ს აბრუნებ
  await page.route("**/api/products", (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ success: false, message: "Server Error" }),
    })
  );

  await page.goto("/products");

  await expect(page.getByText(/something went wrong/i)).toBeVisible();
});
```

---

## ტესტების გაშვება

```bash
# ყველა ტესტი
npx playwright test

# კონკრეტული ფაილი
npx playwright test tests/auth.spec.ts

# კონკრეტული ტესტი
npx playwright test -g "should login"

# UI Mode (ინტერაქტიული — ძალიან სასარგებლო!)
npx playwright test --ui

# Headed (ბრაუზერს ხედავ)
npx playwright test --headed

# კონკრეტული ბრაუზერი
npx playwright test --project=chromium

# Report
npx playwright show-report
```

---

## ხშირი შეცდომები

### ❌ Hard-coded waits

```typescript
// ❌ დრო
await page.waitForTimeout(3000);

// ✅ Auto-wait (Playwright თვითონ ელოდება)
await expect(page.getByText("Loaded")).toBeVisible();
```

### ❌ არასტაბილური selectors

```typescript
// ❌ CSS class — ხშირად იცვლება
page.locator(".btn-primary-lg");

// ✅ Role/Label — სტაბილური
page.getByRole("button", { name: "Submit" });
```

### ❌ ტესტები ერთმანეთზეა დამოკიდებული

```typescript
// ❌ Test2 ეყრდნობა Test1-ის შედეგს
test("create product", ...);
test("edit created product", ...);  // ← ვერ იმუშავებს Test1-ის გარეშე

// ✅ ყოველი ტესტი დამოუკიდებელი
test("edit product", async ({ page }) => {
  // Arrange — თვითონ ამზადებს data-ს
  await createTestProduct();
  // Act + Assert
});
```
