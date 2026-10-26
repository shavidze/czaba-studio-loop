import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCartErrorMessage, getSessionId, transformCart } from '~/contexts/CartContext';
import type { Cart as ApiCart, CartItem as ApiCartItem } from '~/services/api/client';

describe('BUG-HUNTING: Cart Context', () => {
  describe('getCartErrorMessage case-sensitivity (FIXED)', () => {
    it('"Sign in" (capital S) IS now caught after fix', () => {
      const error = new Error('Sign in to continue');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe('Please sign in to manage your cart.');
    });

    it('"sign in" (lowercase) IS caught', () => {
      const error = new Error('Please sign in');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe('Please sign in to manage your cart.');
    });

    it('"Not Found" (capital N) IS now caught after fix', () => {
      const error = new Error('Not Found');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe('This product is no longer available.');
    });

    it('"not found" (lowercase) IS caught', () => {
      const error = new Error('not found');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe('This product is no longer available.');
    });

    it('"Permission denied" (capital P) IS now caught after fix', () => {
      const error = new Error('Permission denied');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe('You do not have permission to perform this action.');
    });

    it('"Unavailable" (capital U) IS now caught after fix', () => {
      const error = new Error('Unavailable');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe(
        'Our service is temporarily unavailable. Please try again in a few minutes.',
      );
    });

    it('HTTP status codes still work (they are numeric strings)', () => {
      expect(getCartErrorMessage(new Error('401'), 'add')).toBe(
        'Please sign in to manage your cart.',
      );
      expect(getCartErrorMessage(new Error('403'), 'add')).toBe(
        'You do not have permission to perform this action.',
      );
      expect(getCartErrorMessage(new Error('404'), 'add')).toBe(
        'This product is no longer available.',
      );
      expect(getCartErrorMessage(new Error('502'), 'add')).toBe(
        'Our service is temporarily unavailable. Please try again in a few minutes.',
      );
    });
  });

  describe('transformCart null/undefined edge cases', () => {
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

    it('handles null discountAmount with nullish coalescing', () => {
      const cart = mockApiCart({ discountAmount: null as unknown as number });
      const result = transformCart(cart);
      expect(result.discountAmount).toBe(0);
    });

    it('handles null giftCardAmount with nullish coalescing', () => {
      const cart = mockApiCart({ giftCardAmount: null as unknown as number });
      const result = transformCart(cart);
      expect(result.giftCardAmount).toBe(0);
    });

    it('handles null total with fallback to subtotal', () => {
      const cart = mockApiCart({
        total: null as unknown as number,
        subtotal: 42.99,
      });
      const result = transformCart(cart);
      expect(result.total).toBe(42.99);
    });

    it('handles 0 total correctly (should NOT fallback to subtotal)', () => {
      const cart = mockApiCart({ total: 0, subtotal: 42.99 });
      const result = transformCart(cart);
      expect(result.total).toBe(0);
    });

    it('_BUG undefined total falls back to subtotal via nullish coalescing', () => {
      const cart = mockApiCart({
        total: undefined as unknown as number,
        subtotal: 99.99,
      });
      const result = transformCart(cart);
      expect(result.total).toBe(99.99);
    });

    it('handles null productVariantId in items', () => {
      const cart = mockApiCart({
        items: [mockApiCartItem({ productVariantId: null as unknown as undefined })],
      });
      const result = transformCart(cart);
      expect(result.items[0].productVariantId).toBeUndefined();
    });

    it('handles null variantName in items', () => {
      const cart = mockApiCart({
        items: [mockApiCartItem({ variantName: null as unknown as undefined })],
      });
      const result = transformCart(cart);
      expect(result.items[0].variantTitle).toBeUndefined();
    });
  });

  describe('Session ID race condition', () => {
    let storage: Record<string, string>;

    beforeEach(() => {
      storage = {};
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => storage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: vi.fn(),
      });
    });

    it('concurrent calls to getSessionId generate consistent session', () => {
      const id1 = getSessionId();
      const id2 = getSessionId();
      expect(id1).toBe(id2);
    });

    it('session ID persists across calls', () => {
      const first = getSessionId();
      const second = getSessionId();
      expect(first).toBe(second);
    });

    it('generates new session after localStorage clear', () => {
      const first = getSessionId();
      storage = {};
      const second = getSessionId();
      expect(second).not.toBe(first);
    });
  });
});
