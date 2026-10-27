# Regression acceptance rule

Acceptance tests assert the intended correct behavior and must fail before the fix and pass after it. A passing reproduction of a known defect is characterization evidence, not a quality gate. Label legacy characterization separately and track its unresolved issue; never count it as a fixed bug. Numeric email domains and minimum-length-only password policies are not automatically defects. Do not change product policy merely to make a test sound stricter.

# BUG_HUNTING_TESTS

## აღწერა

ტესტების წერის ფილოსოფია: ტესტი არსებობს **ბაგების საპოვნელად**, არა გამწვანების მისაღებად.
გამოიყენე ყოველთვის როცა ტესტებს წერ ან ტესტ-სტრატეგიას ადგენ.

---

## Bug Tracking

აღმოჩენილი ბაგები ფიქსირდება `docs/bugs/`-ში:

```
docs/bugs/
├── README.md                    ← ინდექსი + ისტორია
├── 001-service-layer-audit.md   ← audit #1
├── 002-xxx.md                   ← audit #2
└── ...
```

### ფაილის ფორმატი

ყოველი audit-ის შემდეგ:
1. შექმენი `docs/bugs/{NNN}-{description}.md`
2. ყოველ ბაგს მიანიჭე `BUG-{NNN}` ID
3. მიუთითე `სტატუსი: OPEN | IN_PROGRESS | FIXED | WONTFIX`
4. განაახლე `README.md` ინდექსი
5. Fix-ის შემდეგ სტატუსი → `FIXED` + commit hash

---

## ძირითადი პრინციპი

**ტესტი რომელიც ყოველთვის მწვანეა — უსარგებლოა.**

ტესტის ღირებულება = მისი შანსი რომ ბაგი იპოვოს.

```
❌ ტესტი რომელიც ადასტურებს "happy path მუშაობს"
   → ეს დეველოპერმაც იცის, ამით ბაგი არ დაიჭირება

✅ ტესტი რომელიც კითხულობს "რა მოხდება თუ...?"
   → ეს აჩვენებს სად იშლება სისტემა
```

---

## ტესტის ორი დონე

### დონე 1: Standard Tests (სავალდებულო)

ყოველ მეთოდზე — happy path + basic error handling. სწრაფი, CI-ში რბის.

### დონე 2: Bug Hunting Tests (სავალდებულო)

ყოველ სერვისზე — `BugHunting/` ქვეფოლდერი. აქ ტესტები:
- **ეძებს** რეალურ ბაგებს
- **ადასტურებს** ბაგის არსებობას (ტესტი ამტკიცებს რომ ბაგი არსებობს)
- **დოკუმენტირებს** impact-ს და fix-ს

---

## Bug-Hunting ტესტის სტრუქტურა

```
Services/
├── ProductServiceTests.cs          ← დონე 1: standard
├── OrderServiceTests.cs
├── DownloadServiceTests.cs
└── BugHunting/                     ← დონე 2: bug hunters
    ├── ProductServiceBugTests.cs
    ├── OrderServiceBugTests.cs
    └── DownloadServiceBugTests.cs
```

---

## რა ეძებ ყოველ მეთოდში

### 1. Silent Failures — "მუშაობს" მაგრამ არასწორად

```csharp
// service იგნორირებს repository-ის boolean return-ს
await _repo.UpdatePaymentStatusAsync(id, "Paid", txnId);
// → თუ false დაბრუნდა? → silent failure, 200 OK

// null-forgiving operator
return product!;
// → თუ null-ია? → NullReferenceException ან null response
```

**კითხვა:** "რა მოხდება თუ repository false/null დააბრუნებს?"

### 2. Validation Gaps — რა არ ვალიდირდება

```csharp
// userId=0 → ვინ არის ეს?
await _service.CreateAsync(0, "", request);

// pageSize=999999 → DoS
await _service.GetAllAsync(1, 999999);

// status case-sensitivity
"pending" != "Pending" → ValidationException
```

**კითხვა:** "რა არ ვალიდირდება? რა შეუძლია გააგზავნოს malicious user-მა?"

### 3. State Machine Violations — დაუშვებელი transitions

```csharp
// Refunded → Pending → სად წავიდა refund?
UpdateStatusAsync(id, "Pending") // მიმდინარე სტატუსი არ მოწმდება
```

**კითხვა:** "არსებობს თუ არა სტატუსების valid transition matrix?"

### 4. Data Integrity — ინფორმაციის დაკარგვა

```csharp
// hardcoded limit → ძველი მონაცემები უხილავი
GetByUserIdAsync(userId, 1, 100); // 150 შეკვეთა → 50 დაიკარგა

// silent skip → პროდუქტი გაქრა downloads-იდან
if (product == null) continue; // არც log, არც error
```

**კითხვა:** "შეუძლია თუ არა მომხმარებელმა მონაცემები დაკარგოს?"

### 5. Security — Information Leakage, Path Traversal, Injection

```csharp
// ownership check BEFORE existence check → info leakage
if (!ownsProduct) throw Forbidden; // ჰაკერმა იცის product არსებობს

// handle DB-დან → path traversal
$"{folder}/{handle}.zip" // handle = "../../secret"

// string matching fragile
ex.InnerException?.Message?.Contains("REFERENCE constraint")
// → სხვა DB version-ში message სხვაა
```

**კითხვა:** "რა ინფორმაცია ავლინდება? რა input ქმნის security risk-ს?"

### 6. Case Sensitivity & String Matching

```csharp
// PaymentStatus == "Paid" → "paid" არ ჩაითვლება
order.PaymentStatus == "Paid"

// category.ToLower() switch → "Tracks" != "track" → default folder
```

**კითხვა:** "რა მოხდება lowercase/uppercase/trailing space-ით?"

### 7. Performance — N+1, Unbounded Queries, Memory

```csharp
// N+1: ყოველ item-ზე ცალკე query
foreach (var item in items)
    await _repo.GetByIdAsync(item.ProductId); // 100 query

// Unbounded: მთელი table memory-ში
var orders = await _context.Orders.ToListAsync(); // 1M orders → OOM
```

**კითხვა:** "რამდენი DB query? რამდენი memory?"

---

## Bug-Hunting ტესტის ფორმატი

```csharp
// ═══════════════════════════════════════════════
//  BUG #N: [მოკლე აღწერა]
//  Impact: [რა ეშლება მომხმარებელს/ადმინს]
// ═══════════════════════════════════════════════
[Fact]
public async Task MethodName_WhenBadInput_RejectsInput_REGRESSION()
{
    // Arrange — ბაგის სცენარის setup

    // Act
    var act = () => _sut.SomeMethod(badInput);

    // Assert — ბაგის დადასტურება + FIX-ის აღწერა
    // BUG: [რა ხდება არასწორად]
    // FIX: [როგორ უნდა გამოსწორდეს]
    await act.Should().ThrowAsync<ArgumentException>();
}
```

### სახელის კონვენცია

```
// Standard test:
MethodName_Scenario_ExpectedResult

// Bug hunting test:
MethodName_WhenBugCondition_ExpectedBehavior_REGRESSION
```

**`_REGRESSION` suffix** = ტესტი ამოწმებს სწორ ქცევას და ფიქსამდე უნდა ჩავარდეს. ძველი `_BUG` ტესტი მხოლოდ არსებული ქცევის ჩანაწერია და ფიქსის მტკიცებულება არ არის.

---

## ჩექლისტი: ახალი სერვისის ტესტირება

ყოველ public მეთოდზე გაიარე:

```
□ Happy path — მუშაობს სწორი input-ით?
□ Null input — რა ხდება null/empty-ზე?
□ Invalid input — negative, zero, MAX_INT, whitespace?
□ Not found — არარსებული entity?
□ Authorization — სხვისი resource-ზე წვდომა?
□ Silent failure — repository false/null → იგნორირდება?
□ Case sensitivity — "Paid" vs "paid" vs "PAID"?
□ Boundary values — page=0, pageSize=0, limit overflow?
□ Race condition — concurrent create+delete?
□ Data leakage — error message-ში ინფორმაცია?
□ State machine — invalid status transition?
□ Path traversal — "../" input-ში?
□ N+1 queries — loop-ში DB call?
```

---

## ❌ vs ✅ ნიმუშები

### ❌ უსარგებლო ტესტი — მხოლოდ "გამწვანება"

```csharp
[Fact]
public async Task GetById_ReturnsProduct()
{
    var product = CreateProduct(id: 1);
    _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(product);

    var result = await _sut.GetByIdAsync(1);

    result.Should().NotBeNull(); // ეს ყოველთვის მწვანეა
}
```

### ✅ ღირებული ტესტი — პოულობს რეალურ ბაგს

```csharp
[Fact]
public async Task MarkAsPaid_WhenOrderNotFound_ThrowsNotFound_REGRESSION()
{
    _repo.Setup(r => r.UpdatePaymentStatusAsync(999, "Paid", "txn_fake"))
        .ReturnsAsync(false); // order not found

    var act = () => _sut.MarkAsPaidAsync(999, "txn_fake");

    // BUG: service იგნორირებს false return-ს
    // Controller აბრუნებს "Order marked as paid" არარსებულ შეკვეთაზე
    // FIX: check return value + throw NotFoundException
    await act.Should().ThrowAsync<NotFoundException>();
}
```

---

## Frontend ტესტების Bug-Hunting (Store, Admin)

### რა ეძებ React კომპონენტებში

```
□ Missing loading state — API call → render before data?
□ Missing error boundary — API failure → white screen?
□ Missing empty state — [] → blank page?
□ Stale closure — useEffect deps missing?
□ Memory leak — addEventListener without cleanup?
□ Double submit — no disabled state on button?
□ Race condition — fast navigation → stale data render?
□ Token leak — console.log(token)?
□ XSS — dangerouslySetInnerHTML? unsanitized user input?
□ Accessibility — no aria-label on interactive elements?
```

### ტესტის ფორმატი (Vitest/Testing Library)

```typescript
// ═══════════════════════════
//  BUG: Double submit possible
// ═══════════════════════════
it("should disable submit button during mutation_REGRESSION", async () => {
  // BUG: submit button stays enabled during API call
  // user can double-click → duplicate order
  renderComponent();
  const button = screen.getByRole("button", { name: /submit/i });

  await userEvent.click(button);

  // BUG: button არ არის disabled mutation-ის დროს
  expect(button).toBeDisabled();
  // FIX: isPending && disabled
});
```
