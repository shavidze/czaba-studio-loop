import { describe, expect, it } from 'vitest';
import type { Cart, CartItem } from '~/types/cart';
import {
  formatPrice,
  getCartCount,
  getCartItemByProductHandle,
  getCartItems,
  isProductHandleInCart,
  isProductInCart,
  shouldReplaceVersion,
} from '../cart-utils';

const mockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 1,
  productId: 100,
  productTitle: 'Epic Score',
  productHandle: 'epic-score',
  unitPrice: 29.99,
  quantity: 1,
  total: 29.99,
  ...overrides,
});

const mockCart = (overrides: Partial<Cart> = {}): Cart => ({
  id: 1,
  items: [mockCartItem()],
  itemCount: 1,
  subtotal: 29.99,
  discountAmount: 0,
  giftCardAmount: 0,
  total: 29.99,
  ...overrides,
});

describe('isProductInCart', () => {
  it('returns false for null cart', () => {
    expect(isProductInCart(null, 100)).toBe(false);
  });

  it('returns false for cart with no items', () => {
    const cart = mockCart({ items: [] });
    expect(isProductInCart(cart, 100)).toBe(false);
  });

  it('returns false for cart with undefined items', () => {
    const cart = {
      id: 1,
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      giftCardAmount: 0,
      total: 0,
    } as Cart;
    expect(isProductInCart(cart, 100)).toBe(false);
  });

  it('returns true when product exists in cart', () => {
    const cart = mockCart();
    expect(isProductInCart(cart, 100)).toBe(true);
  });

  it('returns false when product does not exist in cart', () => {
    const cart = mockCart();
    expect(isProductInCart(cart, 999)).toBe(false);
  });
});

describe('isProductHandleInCart', () => {
  it('returns false for null cart', () => {
    expect(isProductHandleInCart(null, 'epic-score')).toBe(false);
  });

  it('returns true when product handle exists', () => {
    const cart = mockCart();
    expect(isProductHandleInCart(cart, 'epic-score')).toBe(true);
  });

  it('returns false when product handle does not exist', () => {
    const cart = mockCart();
    expect(isProductHandleInCart(cart, 'nonexistent')).toBe(false);
  });
});

describe('getCartItemByProductHandle', () => {
  it('returns null for null cart', () => {
    expect(getCartItemByProductHandle(null, 'epic-score')).toBeNull();
  });

  it('returns null when handle not found', () => {
    const cart = mockCart();
    expect(getCartItemByProductHandle(cart, 'nonexistent')).toBeNull();
  });

  it('returns item info when handle found', () => {
    const cart = mockCart();
    const result = getCartItemByProductHandle(cart, 'epic-score');
    expect(result).toEqual({ itemId: 1, productId: 100 });
  });
});

describe('shouldReplaceVersion', () => {
  it('returns null for null cart', () => {
    expect(shouldReplaceVersion(null, 200, 'epic-score')).toBeNull();
  });

  it('returns null when no existing item with that handle', () => {
    const cart = mockCart();
    expect(shouldReplaceVersion(cart, 200, 'nonexistent')).toBeNull();
  });

  it('returns null when same productId already in cart', () => {
    const cart = mockCart();
    expect(shouldReplaceVersion(cart, 100, 'epic-score')).toBeNull();
  });

  it('returns item info when different productId with same handle exists', () => {
    const cart = mockCart();
    const result = shouldReplaceVersion(cart, 200, 'epic-score');
    expect(result).toEqual({ itemId: 1, productId: 100 });
  });
});

describe('getCartCount', () => {
  it('returns 0 for null cart', () => {
    expect(getCartCount(null)).toBe(0);
  });

  it('returns itemCount from cart', () => {
    const cart = mockCart({ itemCount: 3 });
    expect(getCartCount(cart)).toBe(3);
  });

  it('returns 0 when itemCount is undefined', () => {
    const cart = { id: 1 } as Cart;
    expect(getCartCount(cart)).toBe(0);
  });
});

describe('getCartItems', () => {
  it('returns empty array for null cart', () => {
    expect(getCartItems(null)).toEqual([]);
  });

  it('returns items from cart', () => {
    const items = [mockCartItem(), mockCartItem({ id: 2, productId: 200 })];
    const cart = mockCart({ items });
    expect(getCartItems(cart)).toEqual(items);
  });

  it('returns empty array when items is undefined', () => {
    const cart = { id: 1 } as Cart;
    expect(getCartItems(cart)).toEqual([]);
  });
});

describe('formatPrice', () => {
  it('formats USD price correctly', () => {
    expect(formatPrice(29.99)).toBe('$29.99');
  });

  it('formats zero price', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats price with no decimals', () => {
    expect(formatPrice(100)).toBe('$100.00');
  });

  it('formats large price with commas', () => {
    expect(formatPrice(1000)).toBe('$1,000.00');
  });

  it('formats price with custom currency', () => {
    const result = formatPrice(29.99, 'EUR');
    expect(result).toContain('29.99');
  });
});
