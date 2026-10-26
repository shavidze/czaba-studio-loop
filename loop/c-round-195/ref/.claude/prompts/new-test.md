# New Test Template (Vitest)

ტესტების წერისას დაიცავი ეს pattern-ები (ProductService, CartService ტესტების მაგალითებიდან).

---

## ფაილის სტრუქტურა

```typescript
// app/services/shopify/{service-name}/{service-name}.test.ts
// ან
// app/lib/{file-name}.test.ts

/**
 * ServiceName Tests
 *
 * Tests for the ServiceName including:
 * - Feature 1 description
 * - Feature 2 description
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ========================================
// Mocks (ფაილის დასაწყისში)
// ========================================

// Mock external dependencies
vi.mock('../client', () => ({
  shopifyQuery: vi.fn(),
  shopifyMutation: vi.fn(),
}));

// Import AFTER mocking
import { ServiceName } from './index';
import { shopifyQuery, shopifyMutation } from '../client';

// Type-safe mock references
const mockShopifyQuery = vi.mocked(shopifyQuery);
const mockShopifyMutation = vi.mocked(shopifyMutation);

// ========================================
// Test Helpers
// ========================================

// Helper to create mock data
function createMockEntity(overrides = {}) {
  return {
    id: 'gid://shopify/Entity/123',
    title: 'Test Entity',
    handle: 'test-entity',
    ...overrides,
  };
}

function createMockResponse(data: any) {
  return {
    entity: data,
  };
}

// ========================================
// Test Suite
// ========================================

describe('ServiceName', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Optional: cleanup after tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==============================
  // Feature Group 1
  // ==============================
  describe('methodName', () => {
    it('should return data when successful', async () => {
      // Arrange
      const mockData = createMockEntity();
      mockShopifyQuery.mockResolvedValue(createMockResponse(mockData));

      // Act
      const result = await ServiceName.methodName('test-handle');

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe('gid://shopify/Entity/123');
      expect(mockShopifyQuery).toHaveBeenCalledTimes(1);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockShopifyQuery.mockResolvedValue({ entity: null });

      // Act
      const result = await ServiceName.methodName('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle missing optional fields gracefully', async () => {
      // Arrange
      const mockData = createMockEntity({
        title: 'Minimal Entity',
        optionalField: null,
        metafields: null,
      });
      mockShopifyQuery.mockResolvedValue(createMockResponse(mockData));

      // Act
      const result = await ServiceName.methodName('minimal');

      // Assert
      expect(result).toBeDefined();
      expect(result?.title).toBe('Minimal Entity');
    });

    it('should call API with correct parameters', async () => {
      // Arrange
      mockShopifyQuery.mockResolvedValue({ entity: null });

      // Act
      await ServiceName.methodName('test-handle');

      // Assert
      expect(mockShopifyQuery).toHaveBeenCalledWith(
        expect.stringContaining('entity(handle: $handle)'),
        { handle: 'test-handle' }
      );
    });
  });

  // ==============================
  // Mutation Tests
  // ==============================
  describe('createMethod', () => {
    it('should create entity successfully', async () => {
      // Arrange
      const mockResponse = {
        entityCreate: {
          entity: createMockEntity({ id: 'new_123' }),
          userErrors: [],
        },
      };
      mockShopifyMutation.mockResolvedValue(mockResponse);

      // Act
      const result = await ServiceName.create({ name: 'Test' });

      // Assert
      expect(result.id).toBe('new_123');
      expect(mockShopifyMutation).toHaveBeenCalledWith(
        expect.stringContaining('entityCreate'),
        { input: { name: 'Test' } }
      );
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const mockResponse = {
        entityCreate: {
          entity: null,
          userErrors: [{ field: ['input'], message: 'Validation failed' }],
        },
      };
      mockShopifyMutation.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(ServiceName.create({ name: '' }))
        .rejects.toThrow('Validation failed');
    });
  });

  // ==============================
  // Error Cases
  // ==============================
  describe('error handling', () => {
    it('should handle network errors', async () => {
      // Arrange
      mockShopifyQuery.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(ServiceName.methodName('test'))
        .rejects.toThrow('Network error');
    });

    it('should handle GraphQL errors', async () => {
      // Arrange
      mockShopifyQuery.mockRejectedValue({
        errors: [{ message: 'GraphQL syntax error' }],
      });

      // Act & Assert
      await expect(ServiceName.methodName('test'))
        .rejects.toMatchObject({
          errors: expect.arrayContaining([
            expect.objectContaining({ message: 'GraphQL syntax error' })
          ])
        });
    });
  });
});
```

---

## Mock Patterns

### Service Mock

```typescript
vi.mock('~/services/shopify', () => ({
  ProductService: {
    getMusic: vi.fn(),
    getByHandle: vi.fn(),
  },
  CartService: {
    create: vi.fn(),
    addLines: vi.fn(),
  },
}));
```

### Context Mock

```typescript
vi.mock('~/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user_123', email: 'test@test.com' },
    isAuthenticated: true,
    signOut: vi.fn(),
  })),
}));
```

### Module Mock (partial)

```typescript
vi.mock('~/lib/utils', async () => {
  const actual = await vi.importActual('~/lib/utils');
  return {
    ...actual,
    // Override specific functions
    formatPrice: vi.fn((price) => `$${price}`),
  };
});
```

---

## Async Test Patterns

```typescript
// Promise resolution
it('should resolve with data', async () => {
  const result = await service.getData();
  expect(result).toBeDefined();
});

// Promise rejection
it('should reject with error', async () => {
  await expect(service.getData()).rejects.toThrow('Error message');
});

// Multiple async operations
it('should handle concurrent requests', async () => {
  const [result1, result2] = await Promise.all([
    service.getData('id1'),
    service.getData('id2'),
  ]);

  expect(result1).toBeDefined();
  expect(result2).toBeDefined();
});

// Waiting for state updates
it('should update state after async operation', async () => {
  const { result } = renderHook(() => useMyHook());

  await act(async () => {
    await result.current.fetchData();
  });

  expect(result.current.data).toBeDefined();
});
```

---

## Assertion Patterns

```typescript
// Basic assertions
expect(value).toBe('exact value');
expect(value).toEqual({ id: 1, name: 'test' }); // Deep equality
expect(value).toBeDefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Array assertions
expect(array).toHaveLength(3);
expect(array).toContain('item');
expect(array).toEqual(expect.arrayContaining(['a', 'b']));

// Object assertions
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ id: 1 }); // Partial match
expect(obj).toEqual(expect.objectContaining({ id: 1 }));

// String assertions
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Function call assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('lastArg');

// Error assertions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('Error message');
expect(() => fn()).toThrow(CustomError);
```

---

## Test Data Transformation

```typescript
describe('transformFunction', () => {
  it('should transform API response to domain type', () => {
    // Arrange - API response shape
    const apiResponse = {
      id: 'gid://shopify/Product/123',
      title: 'Product',
      priceRange: {
        minVariantPrice: {
          amount: '29.00',
          currencyCode: 'USD',
        },
      },
      metafields: [
        { key: 'genre', value: 'Rock', type: 'single_line_text_field' },
        { key: 'bpm', value: '120', type: 'number_integer' },
      ],
    };

    // Act
    const result = transformProduct(apiResponse);

    // Assert - Domain type shape
    expect(result).toEqual({
      id: 'gid://shopify/Product/123',
      title: 'Product',
      price: '$29',
      genre: 'Rock',
      bpm: 120,
    });
  });
});
```

---

## Integration Test Example

```typescript
// app/routes/__tests__/products.test.ts

import { describe, it, expect, vi } from 'vitest';
import { loader } from '../products';
import { ProductService } from '~/services/shopify';

vi.mock('~/services/shopify', () => ({
  ProductService: {
    getMusic: vi.fn(),
  },
}));

describe('products route', () => {
  describe('loader', () => {
    it('should return products from service', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', title: 'Track 1' },
        { id: '2', title: 'Track 2' },
      ];
      vi.mocked(ProductService.getMusic).mockResolvedValue(mockProducts);

      // Act
      const request = new Request('http://localhost/products');
      const response = await loader({ request, params: {}, context: {} });
      const data = await response.json();

      // Assert
      expect(data.products).toHaveLength(2);
      expect(ProductService.getMusic).toHaveBeenCalledWith(50);
    });
  });
});
```

---

## ტესტის გაშვება

```bash
# Watch mode (development)
npm run test

# Single run (CI)
npm run test:run

# Specific file
npm run test -- products.test.ts

# With coverage
npm run test:run -- --coverage
```

---

## Coverage Expectations

| ტიპი | მინიმუმი |
|------|---------|
| Service Layer | 80%+ |
| Utility Functions | 90%+ |
| Hooks | 70%+ |
| Components | 50%+ |

---

## Checklist

ტესტის წერის წინ შეამოწმე:

- [ ] ფაილის სახელი `*.test.ts`
- [ ] Mocks defined before imports
- [ ] `vi.clearAllMocks()` in `beforeEach`
- [ ] Type-safe mocks (`vi.mocked()`)
- [ ] Helper functions for mock data
- [ ] Happy path tests
- [ ] Error case tests
- [ ] Edge case tests (null, empty, missing fields)
- [ ] API call verification (`toHaveBeenCalledWith`)
- [ ] Async/await properly used
- [ ] No console.log in tests
- [ ] Tests are independent (no shared state)
