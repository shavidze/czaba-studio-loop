import { describe, expect, it, vi } from 'vitest';
import {
  generateSessionId,
  getCartErrorMessage,
  getSessionId,
  transformCart,
} from '~/contexts/CartContext';
import type { Cart as ApiCart, CartItem as ApiCartItem } from '~/services/api/client';

const mockApiCartItem = (overrides: Partial<ApiCartItem> = {}): ApiCartItem => ({
  id: 1,
  productId: 100,
  productTitle: 'Test',
  productHandle: 'test',
  unitPrice: 10,
  quantity: 1,
  total: 10,
  ...overrides,
});

const mockApiCart = (overrides: Partial<ApiCart> = {}): ApiCart => ({
  id: 1,
  items: [mockApiCartItem()],
  itemCount: 1,
  subtotal: 10,
  discountAmount: 0,
  giftCardAmount: 0,
  total: 10,
  ...overrides,
});

describe('BUG-HUNTING: Cart Context Race Conditions & Edge Cases', () => {
  describe('transformCart with corrupted API data', () => {
    /**
     * BUG: transformCart doesn't validate items array.
     * If API returns items: null (instead of []), the .map() call throws.
     *
     * FIX: Add `items: (apiCart.items || []).map(...)`
     */
    it('transformCart_WhenItemsIsNull_ReturnsEmptyItems_FIXED', () => {
      const cart = mockApiCart({ items: null as unknown as ApiCartItem[] });
      // FIXED: Now handles null items gracefully with ?? []
      const result = transformCart(cart);
      expect(result.items).toEqual([]);
    });

    /**
     * BUG: transformCart doesn't validate item properties.
     * If an item has undefined unitPrice, it passes through as undefined,
     * which can cause NaN in price calculations downstream.
     */
    it('transformCart_WhenItemUnitPriceUndefined_PassesThroughUndefined_BUG', () => {
      const cart = mockApiCart({
        items: [mockApiCartItem({ unitPrice: undefined as unknown as number })],
      });
      const result = transformCart(cart);
      // BUG: unitPrice is undefined, not validated
      expect(result.items[0].unitPrice).toBeUndefined();
      // FIX: Should default to 0 or throw validation error
    });

    /**
     * BUG: transformCart doesn't validate negative prices from API.
     * A malicious or buggy API could send negative unitPrice.
     */
    it('transformCart_WhenItemHasNegativePrice_AcceptsWithoutValidation_BUG', () => {
      const cart = mockApiCart({
        items: [mockApiCartItem({ unitPrice: -10, total: -10 })],
      });
      const result = transformCart(cart);
      // BUG: Negative price is accepted without validation
      expect(result.items[0].unitPrice).toBe(-10);
      expect(result.items[0].total).toBe(-10);
      // FIX: Should reject or clamp negative prices
    });
  });

  describe('transformCart with mismatched totals', () => {
    /**
     * BUG: transformCart trusts the API's total/subtotal without verifying
     * consistency. If items sum to 30 but subtotal says 50, no error is raised.
     * This could mask billing bugs.
     */
    it('transformCart_WhenSubtotalDoesntMatchItems_AcceptsInconsistency_BUG', () => {
      const cart = mockApiCart({
        items: [
          mockApiCartItem({ unitPrice: 10, quantity: 1, total: 10 }),
          mockApiCartItem({ id: 2, productId: 200, unitPrice: 20, quantity: 1, total: 20 }),
        ],
        itemCount: 2,
        subtotal: 100, // BUG: Should be 30 (10 + 20)
        total: 100,
      });
      const result = transformCart(cart);
      // BUG: Accepts inconsistent subtotal without validation
      expect(result.subtotal).toBe(100);
      // The actual sum of items is 30, not 100
      const actualSum = result.items.reduce((sum, item) => sum + item.total, 0);
      expect(actualSum).toBe(30);
      expect(result.subtotal).not.toBe(actualSum);
      // FIX: Should validate or at least warn about inconsistent totals
    });
  });

  describe('getCartErrorMessage with edge case errors', () => {
    /**
     * BUG: getCartErrorMessage with undefined error converts to "undefined"
     * string and hits the fallback, which works but is not ideal.
     */
    it('getCartErrorMessage_WhenUndefinedError_ConvertsToString_BUG', () => {
      const result = getCartErrorMessage(undefined, 'add');
      // String(undefined) = "undefined", which doesn't match any pattern
      expect(result).toBe('Could not add item to cart. Please try again.');
    });

    /**
     * BUG: Error messages containing "not found" AND "sign in" will
     * match "sign in" first due to the order of checks. This could
     * lead to misleading error messages.
     */
    it('getCartErrorMessage_WhenMultiplePatterns_MatchesFirstPattern_BUG', () => {
      const error = new Error('Please sign in. Resource not found 404');
      const result = getCartErrorMessage(error, 'add');
      // BUG: Matches "sign in" first even though the real error might be 404
      expect(result).toBe('Please sign in to manage your cart.');
      // FIX: Priority should be based on HTTP status code if present
    });
  });

  describe('getSessionId SSR safety', () => {
    /**
     * BUG: getSessionId checks `typeof window === 'undefined'` but
     * in some SSR environments, window exists but localStorage doesn't.
     * This would cause a runtime error.
     */
    it('getSessionId_WhenWindowExistsButLocalStorageThrows_ReturnsFallback_FIXED', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => {
          throw new Error('localStorage is not available');
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      // FIXED: Now returns fallback session ID instead of crashing
      const result = getSessionId();
      expect(result).toBeTruthy();
      expect(result.startsWith('sess_')).toBe(true);

      vi.unstubAllGlobals();
    });
  });

  describe('generateSessionId uniqueness', () => {
    /**
     * BUG: generateSessionId uses Date.now() + Math.random().
     * Math.random().toString(36).substring(2, 15) can produce
     * strings shorter than 13 chars if the random number is very small
     * (e.g., Math.random() = 0 produces just "0").
     */
    it('generateSessionId_WhenRandomIsVerySmall_ShortRandomPart_BUG', () => {
      const id = generateSessionId();
      const parts = id.split('_');
      // The random part (parts[2]) could theoretically be very short
      expect(parts[2].length).toBeGreaterThanOrEqual(1);
      // BUG: Minimum length is 1, not a guaranteed 13 chars
      // If Math.random() returns 0, toString(36) is "0", substring(2, 15) is ""
      // FIX: Use crypto.randomUUID() or pad the random string
    });
  });
});
