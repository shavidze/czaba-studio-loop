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

describe('BUG-HUNTING: Product Adapter', () => {
  describe('Premium fallback Stems formats (FIXED)', () => {
    it('variant path does not infer stems from Premium', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ name: 'Premium', price: 49.99 })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions[0].formats).toEqual([]);
    });

    it('fallback path does not infer stems from Premium', () => {
      const product = mockBackendProduct({
        premiumPrice: 49.99,
        variants: undefined,
      });
      const result = backendProductToProductDetail(product);
      const premiumVersion = result.versions.find((v) => v.name === 'Premium');
      expect(premiumVersion).toBeDefined();
      expect(premiumVersion!.formats).toEqual([]);
    });

    it('both paths now produce consistent Premium formats', () => {
      const withVariants = mockBackendProduct({
        variants: [mockVariant({ name: 'Premium', price: 49.99 })],
      });
      const withFallback = mockBackendProduct({
        premiumPrice: 49.99,
        variants: undefined,
      });

      const variantFormats = backendProductToProductDetail(withVariants).versions[0].formats;
      const fallbackFormats = backendProductToProductDetail(withFallback).versions[1].formats;

      expect(variantFormats).toEqual(fallbackFormats);
    });
  });

  describe('createdAt date parsing edge cases', () => {
    it('handles date without T separator (just date string)', () => {
      const product = mockBackendProduct({ createdAt: '2025-06-15' });
      const result = backendProductToProductDetail(product);
      expect(result.publishedAt).toBe('2025-06-15');
    });

    it('handles ISO format with T separator', () => {
      const product = mockBackendProduct({ createdAt: '2025-06-15T10:30:00' });
      const result = backendProductToProductDetail(product);
      expect(result.publishedAt).toBe('2025-06-15');
    });

    it('handles ISO format with timezone', () => {
      const product = mockBackendProduct({ createdAt: '2025-06-15T10:30:00Z' });
      const result = backendProductToProductDetail(product);
      expect(result.publishedAt).toBe('2025-06-15');
    });

    it('handles date with space instead of T_FIXED', () => {
      const product = mockBackendProduct({ createdAt: '2025-06-15 10:30:00' });
      const result = backendProductToProductDetail(product);
      // FIXED: Now splits on both T and space
      expect(result.publishedAt).toBe('2025-06-15');
    });
  });

  describe('zero and negative price handling', () => {
    it('handles zero standard price in fallback', () => {
      const product = mockBackendProduct({
        standardPrice: 0,
        variants: undefined,
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions[0].basePrice).toBe(0);
      expect(result.variants[0].price.amount).toBe('0.00');
    });

    it('handles zero price in variant', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ price: 0 })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.variants[0].price.amount).toBe('0.00');
    });

    it('handles negative price (should it be allowed?)', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ price: -5.99 })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.variants[0].price.amount).toBe('-5.99');
    });
  });

  describe('empty vs undefined variants', () => {
    it('empty variants array uses fallback pricing', () => {
      const product = mockBackendProduct({
        standardPrice: 19.99,
        premiumPrice: 39.99,
        variants: [],
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions).toHaveLength(2);
      expect(result.variants).toHaveLength(2);
    });

    it('undefined variants uses fallback pricing', () => {
      const product = mockBackendProduct({
        standardPrice: 19.99,
        premiumPrice: 39.99,
        variants: undefined,
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions).toHaveLength(2);
      expect(result.variants).toHaveLength(2);
    });

    it('single variant uses variant path (not fallback)', () => {
      const product = mockBackendProduct({
        standardPrice: 19.99,
        premiumPrice: 39.99,
        variants: [mockVariant({ name: 'Standard', price: 25.99 })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions).toHaveLength(1);
      expect(result.versions[0].basePrice).toBe(25.99);
    });
  });

  describe('unknown variant names', () => {
    it('unknown variant name gets Standard-level defaults', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ name: 'Enterprise' })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions[0].formats).toEqual([]);
      expect(result.versions[0].quality).toBe('');
      expect(result.versions[0].fileSize).toBe('');
      expect(result.versions[0].isFeatured).toBe(false);
    });

    it('variant name with mixed case "PREMIUM" gets premium treatment', () => {
      const product = mockBackendProduct({
        variants: [mockVariant({ name: 'PREMIUM' })],
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions[0].formats).not.toContain('Stems');
      expect(result.versions[0].isFeatured).toBe(true);
    });
  });

  describe('standardPrice undefined in fallback path (FIXED)', () => {
    it('no longer crashes, falls back to 0', () => {
      const product = mockBackendProduct({
        standardPrice: undefined,
        variants: undefined,
      });
      const result = backendProductToProductDetail(product);
      expect(result.versions[0].basePrice).toBe(0);
      expect(result.variants[0].price.amount).toBe('0.00');
    });
  });
});
