# New Service Pattern

ახალი Service-ის შექმნა Service Layer-ში.

---

## ფაილის სტრუქტურა

```typescript
// app/services/shopify/{service-name}.ts

import { shopifyQuery, shopifyMutation, ShopifyError } from './client';

// ========================================
// Types
// ========================================

export interface EntityType {
  id: string;
  // ...
}

interface EntityResponse {
  entity: EntityType | null;
}

// ========================================
// Queries
// ========================================

const ENTITY_QUERY = `
  query GetEntity($id: ID!) {
    entity(id: $id) {
      id
      # fields...
    }
  }
`;

const ENTITIES_QUERY = `
  query GetEntities($first: Int!) {
    entities(first: $first) {
      edges {
        node {
          id
          # fields...
        }
      }
    }
  }
`;

// ========================================
// Mutations
// ========================================

const CREATE_ENTITY_MUTATION = `
  mutation CreateEntity($input: EntityInput!) {
    entityCreate(input: $input) {
      entity {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ========================================
// Service
// ========================================

export const EntityService = {
  /**
   * Get single entity by ID
   */
  async getById(id: string): Promise<EntityType | null> {
    const data = await shopifyQuery<EntityResponse>(ENTITY_QUERY, { id });
    return data.entity;
  },

  /**
   * Get all entities
   */
  async getAll(first = 50): Promise<EntityType[]> {
    const data = await shopifyQuery<EntitiesResponse>(ENTITIES_QUERY, { first });
    return data.entities.edges.map(edge => edge.node);
  },

  /**
   * Create new entity
   */
  async create(input: CreateEntityInput): Promise<EntityType> {
    const data = await shopifyMutation<CreateEntityResponse>(
      CREATE_ENTITY_MUTATION,
      { input },
      { retry: false } // No retry for mutations
    );

    if (data.entityCreate.userErrors.length > 0) {
      throw new ShopifyError(
        data.entityCreate.userErrors[0].message,
        'VALIDATION_ERROR'
      );
    }

    return data.entityCreate.entity;
  },
};
```

---

## Barrel Export დამატება

```typescript
// app/services/shopify/index.ts
export { EntityService } from './entity-name';
export type { EntityType } from './entity-name';
```

---

## გამოყენება Routes-ში

```typescript
// app/routes/entities.tsx
import { EntityService } from '~/services/shopify';

export async function loader() {
  const entities = await EntityService.getAll(50);
  return json({ entities });
}
```

---

## Error Handling Pattern

```typescript
import { ShopifyError, ShopifyGraphQLError } from '~/services/shopify';

try {
  const result = await EntityService.create(input);
} catch (error) {
  if (error instanceof ShopifyGraphQLError) {
    // GraphQL errors (syntax, validation)
    console.error('GraphQL:', error.errors);
  } else if (error instanceof ShopifyError) {
    // Business logic errors
    console.error('Shopify:', error.message, error.code);
  }
  throw error;
}
```

---

## Client Functions

```typescript
// Query (with retry)
const data = await shopifyQuery<ResponseType>(QUERY, variables);

// Mutation (no retry by default)
const data = await shopifyMutation<ResponseType>(MUTATION, variables, {
  retry: false
});
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Service file | `{entity}.ts` | `products.ts` |
| Service object | `{Entity}Service` | `ProductService` |
| Query const | `{ENTITY}_QUERY` | `PRODUCT_QUERY` |
| Mutation const | `{ACTION}_{ENTITY}_MUTATION` | `CREATE_PRODUCT_MUTATION` |

---

## ტესტის დამატება

```typescript
// app/services/shopify/__tests__/entity.test.ts
import { describe, it, expect, vi } from 'vitest';
import { EntityService } from '../entity';

describe('EntityService', () => {
  it('should get entity by id', async () => {
    const entity = await EntityService.getById('gid://shopify/Entity/123');
    expect(entity).toBeDefined();
    expect(entity?.id).toBe('gid://shopify/Entity/123');
  });
});
```
