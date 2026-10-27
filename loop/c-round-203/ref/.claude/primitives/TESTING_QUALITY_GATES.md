# Regression acceptance rule

Acceptance tests assert the intended correct behavior and must fail before the fix and pass after it. A passing reproduction of a known defect is characterization evidence, not a quality gate. Label legacy characterization separately and track its unresolved issue; never count it as a fixed bug. Numeric email domains and minimum-length-only password policies are not automatically defects. Do not change product policy merely to make a test sound stricter.

# TESTING_QUALITY_GATES

## აღწერა

ტესტირების სტრატეგია და quality gates czaba-project-ისთვის.
გამოიყენე ტესტების შექმნის, CI pipeline-ის ან ახალი feature-ის ხარისხის კონტროლისთვის.

---

## ტესტირების პირამიდა

```
        ╱╲
       ╱E2E╲          ← Critical paths (checkout, auth)
      ╱──────╲
     ╱ Integr. ╲      ← API endpoints, DB queries
    ╱────────────╲
   ╱  Unit Tests  ╲   ← Service logic, utils, validators
  ╱────────────────╲
```

---

## ჩექლისტი

### 1. Unit Tests (Service Layer)

- [ ] ყველა Service მეთოდს აქვს unit test
- [ ] Edge cases დაფარულია (null, empty, boundary values)
- [ ] Exception scenarios ტესტირებულია
- [ ] Mock-ები გამოყენებულია external dependencies-ისთვის

### 2. Integration Tests (API Endpoints)

- [ ] ყველა Controller endpoint-ს აქვს integration test
- [ ] Auth-protected endpoint-ები ტესტირებულია (authorized + unauthorized)
- [ ] Validation errors ტესტირებულია (400 Bad Request)
- [ ] Database state ტესტირებულია (CRUD operations)

### 3. E2E Tests (Critical Paths)

- [ ] რეგისტრაცია → ლოგინი → ტოკენ refresh
- [ ] პროდუქტის ძებნა → კალათაში დამატება → checkout
- [ ] Stripe payment flow (test mode)
- [ ] Download flow (signed URL generation)

### 4. Pre-Commit Quality Gates

- [ ] Biome lint pass (`npm run lint` / `npx biome check`)
- [ ] Biome format pass (`npm run check`)
- [ ] TypeScript compilation (`tsc --noEmit`)
- [ ] Build success (`dotnet build` / `npm run build`)
- [ ] Husky pre-commit hook კონფიგურირებულია

### 5. Bug-Hunting Tests (სავალდებულო)

- [ ] ყოველ სერვისს აქვს `BugHunting/` ტესტები (`primitives/BUG_HUNTING_TESTS.md`)
- [ ] Silent failures დოკუმენტირებულია (_BUG suffix)
- [ ] Validation gaps, case sensitivity, state machine violations ტესტირებულია
- [ ] Security vectors (path traversal, info leakage) ტესტირებულია

### 6. Test Naming Convention

- [ ] სახელი აღწერს სცენარს: `MethodName_Scenario_ExpectedResult`
- [ ] Bug ტესტი: `MethodName_WhenBugCondition_ExpectedBehavior_REGRESSION`
- [ ] Arrange-Act-Assert პატერნი

### 7. Code Coverage

- [ ] Service layer: 80%+ coverage
- [ ] Critical paths (auth, payments): 90%+ coverage
- [ ] Utils/helpers: 100% coverage
- [ ] UI components: snapshot + interaction tests

---

## ❌ vs ✅ ნიმუშები

### Test Naming

```csharp
// ❌ არაინფორმატიული
[Fact]
public async Task Test1() { ... }

// ✅ აღწერითი
[Fact]
public async Task GetProduct_WithInvalidHandle_ReturnsNotFound() { ... }
```

```typescript
// ❌ არაინფორმატიული
it("works", () => { ... });

// ✅ აღწერითი
it("should display error message when login fails with invalid credentials", () => { ... });
```

### Mock Usage

```csharp
// ❌ Real dependencies
var service = new ProductService(new ProductRepository(new CzabaDbContext()));

// ✅ Mocked dependencies
var mockRepo = new Mock<IProductRepository>();
mockRepo.Setup(r => r.GetByHandleAsync("test")).ReturnsAsync(testProduct);
var service = new ProductService(mockRepo.Object);
```

### Pre-Commit Hook

```json
// ❌ Hook-ი გვერდის ავლით
// git commit --no-verify

// ✅ Hook-ი ყოველთვის რბის
// .husky/pre-commit
// npx biome check --staged
```

---

## Quality Gate Pipeline

```
Code Change
    │
    ▼
┌─────────────┐
│ Biome Lint   │ ── FAIL → Fix linting
└──────┬──────┘
       │ PASS
       ▼
┌─────────────┐
│ TypeScript   │ ── FAIL → Fix types
│ Compilation  │
└──────┬──────┘
       │ PASS
       ▼
┌─────────────┐
│ Unit Tests   │ ── FAIL → Fix tests
└──────┬──────┘
       │ PASS
       ▼
┌─────────────┐
│ Build        │ ── FAIL → Fix build
└──────┬──────┘
       │ PASS
       ▼
  ✅ Ready to Commit
```

---

## აუდიტის პროცესი

1. ყველა ახალ feature-ზე გაიარე ეს ჩექლისტი
2. ახალი ტესტები უნდა იყოს feature-ის PR-ის ნაწილი
3. Coverage regression არ არის მისაღები
4. Critical path ტესტები ვერ წაიშლება reviewer-ის დასტურის გარეშე
