# ტესტირების საფუძვლები

## რატომ ვტესტავთ?

წარმოიდგინე რომ czaba-ს მაღაზიაში checkout flow-ს ცვლი. ტესტების გარეშე:

1. შენ ცვლი PaymentService-ს
2. ფიქრობ "მუშაობს" რადგან build გადის
3. Production-ში აღმოჩნდება რომ Stripe webhook-მა შეკვეთის სტატუსი ვეღარ განაახლა
4. მომხმარებლებმა გადაიხადეს მაგრამ download link არ მიიღეს

ტესტებით:
1. შენ ცვლი PaymentService-ს
2. ტესტი `ProcessWebhook_WhenPaymentSucceeded_ShouldUpdateOrderStatus` — FAIL
3. ხედავ ზუსტად სად გატყდა
4. ასწორებ **სანამ production-ში მოხვდება**

### ტესტირების ფილოსოფია

ტესტი არის **ავტომატური დაცვის მექანიზმი**. მისი მიზანი:

- **Regression prevention** — ძველი ფუნქციონალი არ გატყდეს ახალი ცვლილებით
- **Documentation** — ტესტი გიხსნის რა უნდა აკეთოს კოდმა
- **Confidence** — deploy-ის წინ იცი რომ ყველაფერი მუშაობს
- **Refactoring safety** — კოდს თავისუფლად ცვლი, ტესტი გეტყვის თუ რამე გატყდა

---

## ტესტირების პირამიდა

```
          ╱╲
         ╱E2E╲           ← ნელი, ძვირი, მაგრამ რეალური
        ╱──────╲
       ╱ Integr. ╲       ← საშუალო სიჩქარე, რამდენიმე კომპონენტი ერთად
      ╱────────────╲
     ╱  Unit Tests  ╲    ← სწრაფი, იზოლირებული, ბევრი
    ╱────────────────╲
```

### Unit Test (ერთეულის ტესტი)

**რა არის:** ერთი ფუნქციის / მეთოდის ტესტი, იზოლირებულად.

**მაგალითი:** `CalculateOrderTotal` ფუნქცია — შეამოწმე რომ 3 პროდუქტის ჯამი სწორად ითვლება.

**თვისებები:**
- სწრაფი (მილიწამები)
- არ სჭირდება database, API, ფაილური სისტემა
- მოჩვენებითი (mock) dependencies

```
Input → Function → Output
  ↑                   ↑
  ცნობილი            მოსალოდნელი
```

### Integration Test (ინტეგრაციის ტესტი)

**რა არის:** რამდენიმე კომპონენტის ერთობლივი ტესტი.

**მაგალითი:** `POST /api/orders` → შეამოწმე რომ controller იღებს request-ს, service ამუშავებს, database-ში ინახება.

**თვისებები:**
- საშუალო სიჩქარე
- შეიძლება გამოიყენოს test database
- ამოწმებს კომპონენტებს შორის კავშირს

```
HTTP Request → Controller → Service → Repository → Database
     ↑                                                 ↑
     ტესტი აგზავნის                              ტესტი ამოწმებს
```

### E2E Test (End-to-End)

**რა არის:** მთელი აპლიკაციის ტესტი, ბრაუზერში, როგორც მომხმარებელი.

**მაგალითი:** ბრაუზერი იხსნება → მომხმარებელი ლოგინდება → ეძებს პროდუქტს → ამატებს კალათაში → checkout.

**თვისებები:**
- ნელი (წამები-წუთები)
- რეალურ ბრაუზერში
- ყველაზე ახლოს მომხმარებლის გამოცდილებასთან
- მტყუნვადი (flaky) — ბევრ გარეგან ფაქტორზეა დამოკიდებული

---

## Arrange-Act-Assert (AAA) პატერნი

ყველა ტესტი სამ ნაწილად იყოფა:

```
Arrange  → მოამზადე (test data, mocks)
Act      → გააკეთე (გამოიძახე ფუნქცია)
Assert   → შეამოწმე (შედეგი სწორია?)
```

### C# მაგალითი (xUnit)

```csharp
[Fact]
public void CalculateTotal_WithThreeItems_ReturnsCorrectSum()
{
    // Arrange — მოამზადე
    var items = new List<OrderItem>
    {
        new() { Price = 29.99m, Quantity = 1 },
        new() { Price = 49.99m, Quantity = 2 }
    };

    // Act — გააკეთე
    var total = OrderCalculator.CalculateTotal(items);

    // Assert — შეამოწმე
    Assert.Equal(129.97m, total);
}
```

### TypeScript მაგალითი (Vitest)

```typescript
it("should format price correctly", () => {
  // Arrange
  const priceInCents = 2999;

  // Act
  const formatted = formatPrice(priceInCents);

  // Assert
  expect(formatted).toBe("$29.99");
});
```

---

## ტესტის სახელწოდების კონვენცია

ტესტის სახელი უნდა იყოს წინადადება — წაიკითხო და გაიგო რა ხდება.

### ფორმატი: `MethodName_Scenario_ExpectedResult`

```
GetProduct_WithValidHandle_ReturnsProduct
GetProduct_WithInvalidHandle_ReturnsNotFound
Login_WithWrongPassword_ReturnsUnauthorized
CalculateTotal_WithEmptyCart_ReturnsZero
```

### TypeScript-ში: `should [result] when [scenario]`

```
"should return product when handle is valid"
"should return 404 when handle does not exist"
"should display error message when login fails"
```

---

## რა ვტესტოთ და რა არა?

### ✅ აუცილებლად ტესტავ:

| რა | რატომ |
|----|-------|
| Business logic (Service layer) | ეს არის აპლიკაციის გული |
| Validation rules | მომხმარებლის input არასწორი იყოს და error მივიღოთ |
| Edge cases (null, empty, max) | ეს ადგილებში ყველაზე ხშირია ბაგი |
| Error handling | შეცდომის დროს აპლიკაცია არ "ჩავარდეს" |
| Critical paths | Auth, Payment, Download — ფული და უსაფრთხოება |

### ❌ არ ტესტავ:

| რა | რატომ |
|----|-------|
| Framework-ის კოდი | Microsoft-მა/Meta-მ უკვე ტესტავა |
| Trivial getters/setters | `get Name => _name;` ტესტის ღირებულება = 0 |
| Third-party libraries | Stripe SDK-ს Stripe ტესტავს |
| Private methods პირდაპირ | public API-ს ტესტავ, private თავისით დაიფარება |

---

## Mock, Stub, Fake — რა განსხვავებაა?

რეალურ აპლიკაციაში ფუნქციას აქვს **dependencies** (database, API, email).
ტესტში ამ dependencies-ს ჩვენ ვანაცვლებთ "ყალბებით".

### Mock — ამოწმებს ინტერაქციას

"დარწმუნდი რომ `SendEmail` გამოიძახეს 1-ჯერ"

```csharp
var mockEmail = new Mock<IEmailService>();
// ... გამოიძახე ლოგიკა ...
mockEmail.Verify(e => e.SendAsync(It.IsAny<string>()), Times.Once);
```

### Stub — აბრუნებს წინასწარ განსაზღვრულ პასუხს

"როცა `GetProduct(5)` გამოიძახებენ, დააბრუნე ეს product"

```csharp
var stubRepo = new Mock<IProductRepository>();
stubRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(testProduct);
```

### Fake — მარტივი ალტერნატიული იმპლემენტაცია

"InMemory database — ნამდვილ SQL-ს არ იყენებს, მაგრამ ისე იქცევა"

```csharp
var options = new DbContextOptionsBuilder<CzabaDbContext>()
    .UseInMemoryDatabase("TestDb")
    .Options;
var fakeDb = new CzabaDbContext(options);
```

---

## ტესტირების ინსტრუმენტები (czaba-ში)

| პროექტი | Framework | Runner | Assertion | Mocking |
|---------|-----------|--------|-----------|---------|
| **Backend** | xUnit | `dotnet test` | xUnit Assert / FluentAssertions | Moq |
| **Store** | Vitest | `npm run test:run` | Vitest expect | vi.fn() / vi.mock() |
| **Admin** | Vitest | `npm run test:run` | Vitest expect | vi.fn() / vi.mock() |
| **E2E** | Playwright | `npx playwright test` | Playwright expect | — |

---

## შემდეგი გაკვეთილები

- `02-backend-testing.md` — .NET ტესტირება (xUnit, Moq, WebApplicationFactory)
- `03-store-testing.md` — Store ტესტირება (Vitest, React Testing Library, hooks)
- `04-admin-testing.md` — Admin ტესტირება (Vitest, TanStack Query, forms/tables)
- `05-e2e-testing.md` — E2E ტესტირება (Playwright)
