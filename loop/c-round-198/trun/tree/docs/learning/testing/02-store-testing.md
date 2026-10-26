# Store ტესტირება (Remix + React)

## ინსტრუმენტები

| ინსტრუმენტი | რისთვის | ანალოგია |
|-------------|---------|----------|
| **Vitest** | Test framework + runner | "სად დაწერო ტესტი, როგორ გაუშვა" |
| **React Testing Library (RTL)** | კომპონენტების ტესტირება | "render კომპონენტი, იპოვე ელემენტი, დააკლიკე" |
| **@testing-library/user-event** | User interaction simulation | "მომხმარებლის მოქმედებების იმიტაცია" |
| **MSW (Mock Service Worker)** | API mocking | "ყალბი backend — HTTP requests-ს იჭერს" |
| **vi.fn() / vi.mock()** | Mocking | "ყალბი ფუნქციები და მოდულები" |

---

## პროექტის სტრუქტურა

```
store/
├── app/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Button.test.tsx        ← კომპონენტის გვერდით
│   ├── hooks/
│   │   ├── useCart.ts
│   │   └── useCart.test.ts
│   ├── services/
│   │   └── api/
│   │       ├── client.ts
│   │       └── client.test.ts
│   └── utils/
│       ├── formatters.ts
│       └── formatters.test.ts         ← ფაილის გვერდით
├── vitest.config.ts
└── package.json
```

### ტესტის ფაილი ყოველთვის production ფაილის **გვერდით**

```
Button.tsx       → Button.test.tsx
useCart.ts       → useCart.test.ts
formatters.ts    → formatters.test.ts
```

---

## 1. Unit Tests — Utils და Formatters

ყველაზე მარტივი — pure ფუნქციების ტესტი. არ სჭირდება React, DOM, არაფერი.

### მაგალითი: formatPrice

```typescript
// app/utils/formatters.ts
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
```

```typescript
// app/utils/formatters.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice, formatDuration } from "./formatters";

describe("formatPrice", () => {
  it("should format cents to dollar string", () => {
    expect(formatPrice(2999)).toBe("$29.99");
  });

  it("should handle zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("should handle large amounts", () => {
    expect(formatPrice(99999)).toBe("$999.99");
  });
});

describe("formatDuration", () => {
  it("should format seconds to mm:ss", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("should handle zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("should handle exact minutes", () => {
    expect(formatDuration(180)).toBe("3:00");
  });
});
```

### რა ხდება?

```
describe("formatPrice") — ტესტების ჯგუფი (ერთ ფუნქციაზე)
  it("should ...") — ერთი ტესტ-case
    expect(X).toBe(Y) — "X უნდა იყოს Y-ის ტოლი"
```

---

## 2. Component Tests — React Testing Library

RTL-ის ფილოსოფია: **ტესტავ როგორც მომხმარებელი**.

მომხმარებელს არ აინტერესებს state, props, ref — მას აინტერესებს:
- რა ჩანს ეკრანზე?
- რა ხდება როცა ვაკლიკებ?

### მაგალითი: Button კომპონენტი

```tsx
// app/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={variant === "primary" ? "bg-brand-500" : "bg-gray-500"}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }
);
```

```tsx
// app/components/ui/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("should render children text", () => {
    render(<Button>Add to Cart</Button>);

    // screen.getByRole — იპოვე ელემენტი role-ით (button, link, heading...)
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDefined();
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();  // ← ყალბი ფუნქცია (spy)
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Buy</Button>);

    await user.click(screen.getByRole("button", { name: "Buy" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("should show loading text when loading", () => {
    render(<Button loading>Buy</Button>);

    expect(screen.getByRole("button", { name: "Loading..." })).toBeDefined();
  });

  it("should be disabled when loading", () => {
    render(<Button loading>Buy</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>Buy</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### RTL Query-ების იერარქია

რომელი query გამოვიყენო? **პრიორიტეტის მიხედვით:**

```
1. getByRole        ← ყველაზე კარგი (accessibility)
   screen.getByRole("button", { name: "Submit" })

2. getByLabelText   ← form elements-ისთვის
   screen.getByLabelText("Email")

3. getByPlaceholderText  ← input-ებისთვის
   screen.getByPlaceholderText("Search...")

4. getByText        ← ტექსტით ძებნა
   screen.getByText("Welcome back!")

5. getByTestId      ← ბოლო საშუალება
   screen.getByTestId("product-card")
```

### getBy vs queryBy vs findBy

```typescript
// getBy — ელემენტი უნდა არსებობდეს, თორემ Error
screen.getByRole("button");

// queryBy — არ არსებობს? null (Error-ს არ აგდებს)
expect(screen.queryByText("Error")).toBeNull();

// findBy — ასინქრონული, ელოდება ელემენტის გამოჩენას
const toast = await screen.findByText("Added to cart!");
```

---

## 3. Hook Tests

Custom hook-ებს `renderHook`-ით ტესტავ.

### მაგალითი: useDebounce

```typescript
// app/hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// app/hooks/useDebounce.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));

    expect(result.current).toBe("hello");
  });

  it("should debounce value changes", () => {
    vi.useFakeTimers();  // ← დროის კონტროლი

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 500 } }
    );

    // შეცვალე value
    rerender({ value: "world", delay: 500 });

    // 500ms-მდე ძველი value რჩება
    expect(result.current).toBe("hello");

    // 500ms გავიდა
    act(() => vi.advanceTimersByTime(500));

    // ახალი value
    expect(result.current).toBe("world");

    vi.useRealTimers();
  });
});
```

### რა არის renderHook?

```
renderHook(() => useMyHook())
    ↓
result.current  ← hook-ის დაბრუნებული მნიშვნელობა
rerender()      ← hook-ს თავიდან გაუშვებს ახალი props-ით
```

---

## 4. Context ტესტირება

Context-ს wrapper-ით ტესტავ.

```tsx
// app/contexts/CartContext.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "./CartContext";

// Helper component — Context-ს იყენებს
function CartDisplay() {
  const { items, addItem, totalCount } = useCart();
  return (
    <div>
      <span data-testid="count">{totalCount}</span>
      <button onClick={() => addItem({ id: 1, title: "Test", price: 999 })}>
        Add
      </button>
    </div>
  );
}

describe("CartContext", () => {
  it("should start with empty cart", () => {
    render(
      <CartProvider>
        <CartDisplay />
      </CartProvider>
    );

    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("should add item to cart", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartDisplay />
      </CartProvider>
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByTestId("count").textContent).toBe("1");
  });
});
```

---

## 5. API Client Mocking

API ფუნქციებს `vi.mock()`-ით ან MSW-ით ტესტავ.

### vi.mock() — მარტივი

```typescript
// app/services/api/client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock-ავ მთელ მოდულს
vi.mock("./client", () => ({
  apiClient: {
    getProducts: vi.fn(),
    getProductByHandle: vi.fn(),
  },
}));

import { apiClient } from "./client";

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();  // ყველა mock reset
  });

  it("should call getProducts with filters", async () => {
    const mockProducts = [{ id: 1, title: "Track 1" }];
    vi.mocked(apiClient.getProducts).mockResolvedValue(mockProducts);

    const result = await apiClient.getProducts({ category: "Track" });

    expect(result).toEqual(mockProducts);
    expect(apiClient.getProducts).toHaveBeenCalledWith({ category: "Track" });
  });
});
```

### MSW — რეალისტური (HTTP level mock)

```typescript
// app/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:5199/api/products", () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, handle: "epic-music", title: "Epic Music", price: 2999 },
      ],
    });
  }),

  http.post("http://localhost:5199/api/auth/login", async ({ request }) => {
    const body = await request.json();
    if (body.email === "test@test.com") {
      return HttpResponse.json({
        success: true,
        data: { accessToken: "fake-token", refreshToken: "fake-refresh" },
      });
    }
    return HttpResponse.json({ success: false }, { status: 401 });
  }),
];
```

---

## 6. ტესტების გაშვება

```bash
# ყველა ტესტი
npm run test:run

# Watch mode (ფაილის შეცვლაზე თავიდან გაშვება)
npm run test

# კონკრეტული ფაილი
npx vitest run app/utils/formatters.test.ts

# კონკრეტული ტესტი სახელით
npx vitest run -t "should format cents"

# Coverage report
npx vitest run --coverage
```

---

## 7. ხშირი შეცდომები

### ❌ Implementation details ტესტავ

```tsx
// ❌ State-ს ამოწმებ
expect(component.state.isOpen).toBe(true);

// ✅ რა ხედავს მომხმარებელი
expect(screen.getByRole("dialog")).toBeDefined();
```

### ❌ Snapshot ტესტებზე დამოკიდებული ხარ

```tsx
// ❌ Snapshot — ძალიან ბრტყელი, ნებისმიერ ცვლილებაზე ტყდება
expect(container).toMatchSnapshot();

// ✅ კონკრეტული behavior
expect(screen.getByText("Product Title")).toBeDefined();
expect(screen.getByRole("button")).toBeDisabled();
```

### ❌ Async-ს არ ელოდები

```tsx
// ❌ ელემენტი ჯერ არ გამოჩნდა
render(<ProductList />);
expect(screen.getByText("Epic Music")).toBeDefined(); // FAIL!

// ✅ findBy ელოდება
render(<ProductList />);
expect(await screen.findByText("Epic Music")).toBeDefined();
```

---

## შემდეგი ნაბიჯი

→ `04-admin-testing.md` — TanStack Query, forms, tables
