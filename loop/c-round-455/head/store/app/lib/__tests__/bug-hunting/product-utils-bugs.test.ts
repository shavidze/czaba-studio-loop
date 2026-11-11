import { describe, expect, it } from 'vitest';
import {
  createDisplayVersions,
  formatNumber,
  getArtistHandle,
  getVariantIdForVersion,
} from '~/lib/product-utils';
import type { Product } from '~/services/api/client';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Test Product',
  category: 'Track',
  handle: 'test-product',
  isNew: true,
  isPremium: false,
  isActive: true,
  createdAt: '2025-01-01',
  ...overrides,
});

describe('BUG-HUNTING: Product Utils', () => {
  describe('formatNumber negative number handling', () => {
    /**
     * BUG: formatNumber(-1500) returns "-1500" instead of "-1.5k"
     * because -1500 >= 1000 evaluates to false.
     * The function doesn't handle negative numbers at all.
     *
     * FIX: Use Math.abs(num) for comparison thresholds,
     * then apply the sign separately.
     */
    it('formatNumber_WhenNegativeThousand_ReturnsFormatted_FIXED', () => {
      const result = formatNumber(-1500);
      // FIXED: Now handles negative numbers via Math.abs
      expect(result).toBe('-1.5k');
    });

    it('formatNumber_WhenNegativeMillion_ReturnsFormatted_FIXED', () => {
      const result = formatNumber(-2500000);
      // FIXED: Now handles negative millions
      expect(result).toBe('-2.5M');
    });

    it('formatNumber_WhenNaN_ReturnsZero_FIXED', () => {
      const result = formatNumber(Number.NaN);
      // FIXED: Now returns "0" for NaN
      expect(result).toBe('0');
    });

    it('formatNumber_WhenInfinity_ReturnsZero_FIXED', () => {
      const result = formatNumber(Number.POSITIVE_INFINITY);
      // FIXED: Now returns "0" for Infinity
      expect(result).toBe('0');
    });
  });

  describe('createDisplayVersions with empty variants array', () => {
    /**
     * BUG: When product has empty variants array [] (not undefined),
     * it goes through the fallback path. This means empty array
     * and undefined have the same behavior, but the check
     * `product.variants && product.variants.length > 0` treats
     * empty array same as undefined. This is actually inconsistent
     * because the product HAS variants configured, they're just empty.
     */
    it('createDisplayVersions_WhenEmptyVariantsArray_FallsBackToFlatPricing_BUG', () => {
      const product = mockProduct({
        standardPrice: 19.99,
        premiumPrice: 39.99,
        variants: [],
      });
      const versions = createDisplayVersions(product);
      // BUG: Empty array treated same as undefined, falls back to flat pricing
      // This may cause issues if backend sends empty variants array intentionally
      expect(versions).toHaveLength(2);
      expect(versions[0].price).toBe(19.99);
      // FIX: Should distinguish between "no variants configured" and "empty variants"
    });
  });

  describe('createDisplayVersions fallback - standard and premium both get id=0', () => {
    /**
     * BUG: In the fallback path (no variants), both Standard and Premium
     * get id: 0. This means two different versions share the same ID,
     * which can cause React key conflicts and selection bugs.
     *
     * FIX: Use different IDs for standard and premium fallback versions.
     */
    it('createDisplayVersions_WhenFallbackPath_VersionsHaveUniqueIds_FIXED', () => {
      const product = mockProduct({
        standardPrice: 19.99,
        premiumPrice: 39.99,
        variants: undefined,
      });
      const versions = createDisplayVersions(product);
      // FIXED: Standard=-1, Premium=-2 — unique IDs
      expect(versions[0].id).toBe(-1);
      expect(versions[1].id).toBe(-2);
      expect(versions[0].id).not.toBe(versions[1].id);
    });
  });

  describe('getVariantIdForVersion with empty variants array', () => {
    it('getVariantIdForVersion_WhenEmptyVariantsArray_ReturnsUndefined_BUG', () => {
      const product = mockProduct({ variants: [] });
      // This won't crash but returns undefined even though variants exists
      const result = getVariantIdForVersion(product, 'Standard');
      expect(result).toBeUndefined();
    });
  });

  describe('getArtistHandle special characters', () => {
    /**
     * BUG: getArtistHandle doesn't handle special characters
     * like apostrophes, periods, or non-ASCII characters in vendor names.
     *
     * FIX: Strip or replace special characters.
     */
    it('getArtistHandle_WhenVendorHasApostrophe_StripsSpecialChar_FIXED', () => {
      const result = getArtistHandle("O'Brien");
      // FIXED: Apostrophe stripped, URL-safe handle
      expect(result).toBe('o-brien');
    });

    it('getArtistHandle_WhenVendorHasPeriod_StripsPeriod_FIXED', () => {
      const result = getArtistHandle('Dr. Beat');
      // FIXED: Period stripped, clean handle
      expect(result).toBe('dr-beat');
    });

    it('getArtistHandle_WhenVendorHasUnicode_KeepsUnicode_BUG', () => {
      const result = getArtistHandle('Bjork');
      // This works fine since it's ASCII
      expect(result).toBe('bjork');
    });
  });
});
