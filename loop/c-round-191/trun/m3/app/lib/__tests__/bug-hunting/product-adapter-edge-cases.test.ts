import { describe, expect, it, vi } from 'vitest';
import { backendProductToProductDetail } from '~/services/api/adapters/productAdapter';
import type { ProductVariant as BackendVariant, Product } from '~/services/api/client';

vi.mock('~/lib/r2.config', () => ({
  normalizePreviewUrl: (value?: string) => value || '',
  getPreviewUrl: (handle: string) => `https://r2.example.com/previews/${handle}.mp3`,
}));

const mockBackendProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Test Product',
  category: 'Track',
  handle: 'test-product',
  isNew: true,
  isPremium: false,
  isActive: true,
  createdAt: '2025-01-01T00:00:00',
  standardPrice: 29.99,
  ...overrides,
});

const mockVariant = (overrides: Partial<BackendVariant> = {}): BackendVariant => ({
  id: 10,
  productId: 1,
  name: 'Standard',
  price: 29.99,
  position: 1,
  createdAt: '2025-01-01',
  ...overrides,
});

describe('BUG-HUNTING: Product Adapter Edge Cases', () => {
  describe('createdAt date parsing with space separator', () => {
    /**
     * BUG: The adapter uses `product.createdAt.split('T')[0]` for publishedAt.
     * If the date uses a space separator (e.g., "2025-06-15 10:30:00"),
     * split('T') returns the full string as element[0], including time.
     * This means publishedAt contains "2025-06-15 10:30:00" instead of "2025-06-15".
     *
     * FIX: Use split(/[T\s]/)[0] to handle both 'T' and space separators.
     */
    it('publishedAt_WhenDateHasSpaceSeparator_ExtractsDateOnly_FIXED', () => {
      const product = mockBackendProduct({ createdAt: '2025-06-15 10:30:00' });
      const result = backendProductToProductDetail(product);
      // FIXED: Now splits on both T and space
      expect(result.publishedAt).toBe('2025-06-15');
    });
  });

  describe('Product ID string conversion', () => {
    /**
     * BUG: The adapter converts product.id to string via toString().
     * If product.id is 0 (falsy but valid), it becomes "0" which is fine.
     * But if product.id is null/undefined, it throws.
     */
    it('productId_WhenIdIsNull_ReturnsFallbackZero_FIXED', () => {
      const product = mockBackendProduct({ id: null as unknown as number });
      // FIXED: Now falls back to "0" instead of crashing
      const result = backendProductToProductDetail(product);
      expect(result.id).toBe('0');
    });
  });

  describe('Variant price toFixed with non-number', () => {
    /**
     * BUG: In createVariants, variant.price.toFixed(2) will throw
     * if price is undefined or null because toFixed is a Number method.
     */
    it('variantPrice_WhenPriceIsUndefined_DefaultsToZero_FIXED', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ price: undefined as unknown as number })],
      });
      // FIXED: Now defaults to 0 instead of crashing
      const result = backendProductToProductDetail(product);
      expect(result.variants[0].price.amount).toBe('0.00');
    });

    it('variantPrice_WhenPriceIsNull_DefaultsToZero_FIXED', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ price: null as unknown as number })],
      });
      // FIXED: Now defaults to 0 instead of crashing
      const result = backendProductToProductDetail(product);
      expect(result.variants[0].price.amount).toBe('0.00');
    });
  });

  describe('Missing Standard isFeatured in fallback path', () => {
    /**
     * BUG: In the fallback createVersions path, the Standard version
     * doesn't have `isFeatured: false` explicitly set (it's just not
     * present in the object). But in the variant path, all versions
     * get isFeatured via the check. This creates an inconsistency
     * where the Standard fallback version has isFeatured as undefined.
     */
    it('standardVersion_WhenFallbackPath_IsFeaturedFalse_FIXED', () => {
      const product = mockBackendProduct({
        standardPrice: 19.99,
        variants: undefined,
      });
      const result = backendProductToProductDetail(product);
      // FIXED: isFeatured is now explicitly false in fallback Standard version
      expect(result.versions[0].isFeatured).toBe(false);
    });
  });

  describe('Vendor fallback inconsistency', () => {
    /**
     * BUG: The adapter uses `product.vendor || 'CZABA'` for artist (uppercase)
     * but `product.vendor || 'czaba'` for artistHandle (lowercase).
     * If vendor is an empty string '', both fallbacks trigger.
     * But the fallback values are case-inconsistent: "CZABA" vs "czaba".
     */
    it('vendor_WhenEmptyString_UseDifferentDefaults_BUG', () => {
      const product = mockBackendProduct({ vendor: '' });
      const result = backendProductToProductDetail(product);
      // BUG: artist is "CZABA" but artistHandle is based on "czaba"
      // This is intentional but creates coupling between two hardcoded strings
      expect(result.artist).toBe('CZABA');
      expect(result.artistHandle).toBe('czaba');
    });

    it('vendor_WhenUndefined_UseFallbacks', () => {
      const product = mockBackendProduct({ vendor: undefined });
      const result = backendProductToProductDetail(product);
      expect(result.artist).toBe('CZABA');
      expect(result.artistHandle).toBe('czaba');
    });
  });

  describe('Floating point price precision', () => {
    /**
     * BUG: toFixed(2) can produce unexpected results with floating point numbers.
     * For example, (0.1 + 0.2).toFixed(2) = "0.30" which is correct,
     * but internal calculations may have precision issues.
     */
    it('price_WhenFloatingPointEdgeCase_ToFixedHandlesCorrectly', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ price: 0.1 + 0.2 })],
      });
      const result = backendProductToProductDetail(product);
      // toFixed(2) rounds 0.30000000000000004 to "0.30" - this works correctly
      expect(result.variants[0].price.amount).toBe('0.30');
    });

    /**
     * BUG: Very large prices overflow toFixed formatting
     */
    it('price_WhenVeryLargeNumber_ToFixedStillWorks', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ price: 999999999.99 })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.variants[0].price.amount).toBe('999999999.99');
    });
  });
});
