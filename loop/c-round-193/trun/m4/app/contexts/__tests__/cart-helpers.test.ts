import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cart as ApiCart, CartItem as ApiCartItem } from '~/services/api/client';
import {
  generateSessionId,
  getCartErrorMessage,
  getSessionId,
  transformCart,
} from '../CartContext';

const mockApiCartItem = (overrides: Partial<ApiCartItem> = {}): ApiCartItem => ({
  id: 1,
  productId: 100,
  productTitle: 'Epic Score',
  productHandle: 'epic-score',
  unitPrice: 29.99,
  quantity: 1,
  total: 29.99,
  ...overrides,
});

const mockApiCart = (overrides: Partial<ApiCart> = {}): ApiCart => ({
  id: 1,
  items: [mockApiCartItem()],
  itemCount: 1,
  subtotal: 29.99,
  discountAmount: 0,
  giftCardAmount: 0,
  total: 29.99,
  ...overrides,
});

describe('getCartErrorMessage', () => {
  describe('TypeError with fetch', () => {
    it('returns connection error for TypeError with fetch', () => {
      const error = new TypeError('Failed to fetch');
      expect(getCartErrorMessage(error, 'add')).toBe(
        'Unable to connect. Please check your internet connection.',
      );
    });

    it('returns connection error regardless of action', () => {
      const error = new TypeError('fetch failed');
      expect(getCartErrorMessage(error, 'checkout')).toBe(
        'Unable to connect. Please check your internet connection.',
      );
    });
  });

  describe('auth errors (401 / sign in)', () => {
    it('returns sign in message for checkout', () => {
      const error = new Error('401 Unauthorized');
      expect(getCartErrorMessage(error, 'checkout')).toBe(
        'Please sign in to complete your purchase.',
      );
    });

    it('returns cart management message for add', () => {
      const error = new Error('Please sign in');
      expect(getCartErrorMessage(error, 'add')).toBe('Please sign in to manage your cart.');
    });

    it('returns cart management message for remove', () => {
      const error = new Error('401');
      expect(getCartErrorMessage(error, 'remove')).toBe('Please sign in to manage your cart.');
    });

    it('"Sign in" (capital S) is now case-insensitive', () => {
      const error = new Error('Sign in required');
      const result = getCartErrorMessage(error, 'add');
      expect(result).toBe('Please sign in to manage your cart.');
    });
  });

  describe('permission errors (403)', () => {
    it('returns permission error for 403', () => {
      const error = new Error('403 Forbidden');
      expect(getCartErrorMessage(error, 'add')).toBe(
        'You do not have permission to perform this action.',
      );
    });

    it('returns permission error for "permission" keyword', () => {
      const error = new Error('No permission');
      expect(getCartErrorMessage(error, 'remove')).toBe(
        'You do not have permission to perform this action.',
      );
    });
  });

  describe('not found errors (404)', () => {
    it('returns product unavailable for add + 404', () => {
      const error = new Error('404 Not Found');
      expect(getCartErrorMessage(error, 'add')).toBe('This product is no longer available.');
    });

    it('returns already removed for remove + 404', () => {
      const error = new Error('not found');
      expect(getCartErrorMessage(error, 'remove')).toBe(
        'This item was already removed from your cart.',
      );
    });

    it('returns generic not found for checkout + 404', () => {
      const error = new Error('404');
      expect(getCartErrorMessage(error, 'checkout')).toBe('The requested item could not be found.');
    });
  });

  describe('service unavailable (502/503)', () => {
    it('returns unavailable message for 502', () => {
      const error = new Error('502 Bad Gateway');
      expect(getCartErrorMessage(error, 'add')).toBe(
        'Our service is temporarily unavailable. Please try again in a few minutes.',
      );
    });

    it('returns unavailable message for 503', () => {
      const error = new Error('503');
      expect(getCartErrorMessage(error, 'checkout')).toBe(
        'Our service is temporarily unavailable. Please try again in a few minutes.',
      );
    });

    it('returns unavailable message for "unavailable" keyword', () => {
      const error = new Error('Service unavailable');
      expect(getCartErrorMessage(error, 'remove')).toBe(
        'Our service is temporarily unavailable. Please try again in a few minutes.',
      );
    });
  });

  describe('unknown errors (fallback per action)', () => {
    it('returns add fallback', () => {
      const error = new Error('something weird');
      expect(getCartErrorMessage(error, 'add')).toBe(
        'Could not add item to cart. Please try again.',
      );
    });

    it('returns remove fallback', () => {
      const error = new Error('unknown issue');
      expect(getCartErrorMessage(error, 'remove')).toBe(
        'Could not remove item from cart. Please try again.',
      );
    });

    it('returns checkout fallback', () => {
      const error = new Error('random error');
      expect(getCartErrorMessage(error, 'checkout')).toBe(
        'Could not complete checkout. Please try again.',
      );
    });

    it('handles non-Error objects via String()', () => {
      expect(getCartErrorMessage(42, 'add')).toBe('Could not add item to cart. Please try again.');
    });

    it('handles null error', () => {
      expect(getCartErrorMessage(null, 'add')).toBe(
        'Could not add item to cart. Please try again.',
      );
    });
  });
});

describe('generateSessionId', () => {
  it('starts with "sess_" prefix', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^sess_/);
  });

  it('contains timestamp portion', () => {
    const id = generateSessionId();
    const parts = id.split('_');
    expect(parts.length).toBe(3);
    const timestamp = Number(parts[1]);
    expect(timestamp).toBeGreaterThan(0);
  });

  it('contains random alphanumeric portion', () => {
    const id = generateSessionId();
    const parts = id.split('_');
    expect(parts[2]).toMatch(/^[a-z0-9]+$/);
    expect(parts[2].length).toBeGreaterThanOrEqual(1);
  });

  it('generates unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateSessionId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('getSessionId', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
    });
  });

  it('generates and stores session ID when none exists', () => {
    const id = getSessionId();
    expect(id).toMatch(/^sess_/);
    expect(localStorage.setItem).toHaveBeenCalledWith('czaba_session_id', id);
  });

  it('returns existing session ID from localStorage', () => {
    storage['czaba_session_id'] = 'sess_existing_123';
    const id = getSessionId();
    expect(id).toBe('sess_existing_123');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('returns empty string when window is undefined (SSR)', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error SSR simulation
    delete globalThis.window;
    const id = getSessionId();
    expect(id).toBe('');
    globalThis.window = originalWindow;
  });
});

describe('transformCart', () => {
  it('transforms basic cart fields', () => {
    const apiCart = mockApiCart();
    const result = transformCart(apiCart);

    expect(result.id).toBe(1);
    expect(result.itemCount).toBe(1);
    expect(result.subtotal).toBe(29.99);
    expect(result.discountAmount).toBe(0);
    expect(result.giftCardAmount).toBe(0);
    expect(result.total).toBe(29.99);
  });

  it('transforms cart items correctly', () => {
    const apiCart = mockApiCart({
      items: [
        mockApiCartItem({
          id: 1,
          productId: 100,
          productVariantId: 200,
          productTitle: 'Test Product',
          productHandle: 'test-product',
          variantName: 'Premium',
          productImageUrl: 'https://example.com/img.jpg',
          unitPrice: 49.99,
          quantity: 2,
          total: 99.98,
        }),
      ],
    });

    const result = transformCart(apiCart);
    const item = result.items[0];

    expect(item.id).toBe(1);
    expect(item.productId).toBe(100);
    expect(item.productVariantId).toBe(200);
    expect(item.productTitle).toBe('Test Product');
    expect(item.productHandle).toBe('test-product');
    expect(item.variantTitle).toBe('Premium');
    expect(item.imageUrl).toBe('https://example.com/img.jpg');
    expect(item.unitPrice).toBe(49.99);
    expect(item.quantity).toBe(2);
    expect(item.total).toBe(99.98);
  });

  it('converts null productVariantId to undefined', () => {
    const apiCart = mockApiCart({
      items: [mockApiCartItem({ productVariantId: undefined })],
    });

    const result = transformCart(apiCart);
    expect(result.items[0].productVariantId).toBeUndefined();
  });

  it('converts null variantName to undefined', () => {
    const apiCart = mockApiCart({
      items: [mockApiCartItem({ variantName: undefined })],
    });

    const result = transformCart(apiCart);
    expect(result.items[0].variantTitle).toBeUndefined();
  });

  it('defaults discountAmount to 0 when null', () => {
    const apiCart = mockApiCart({ discountAmount: undefined as unknown as number });
    const result = transformCart(apiCart);
    expect(result.discountAmount).toBe(0);
  });

  it('defaults giftCardAmount to 0 when null', () => {
    const apiCart = mockApiCart({ giftCardAmount: undefined as unknown as number });
    const result = transformCart(apiCart);
    expect(result.giftCardAmount).toBe(0);
  });

  it('falls back total to subtotal when total is null/undefined', () => {
    const apiCart = mockApiCart({
      subtotal: 59.99,
      total: undefined as unknown as number,
    });
    const result = transformCart(apiCart);
    expect(result.total).toBe(59.99);
  });

  it('transforms appliedCoupon when present', () => {
    const apiCart = mockApiCart({
      appliedCoupon: {
        code: 'SAVE20',
        description: '20% off',
        discountType: 'percentage',
        discountValue: 20,
        discountAmount: 5.99,
      },
    });

    const result = transformCart(apiCart);
    expect(result.appliedCoupon).toEqual({
      code: 'SAVE20',
      description: '20% off',
      discountType: 'percentage',
      discountValue: 20,
      discountAmount: 5.99,
    });
  });

  it('returns undefined appliedCoupon when not present', () => {
    const apiCart = mockApiCart({ appliedCoupon: undefined });
    const result = transformCart(apiCart);
    expect(result.appliedCoupon).toBeUndefined();
  });

  it('transforms appliedGiftCard when present', () => {
    const apiCart = mockApiCart({
      appliedGiftCard: {
        code: 'GC-123',
        maskedCode: '****-123',
        balance: 50.0,
        amountToUse: 29.99,
      },
    });

    const result = transformCart(apiCart);
    expect(result.appliedGiftCard).toEqual({
      code: 'GC-123',
      maskedCode: '****-123',
      balance: 50.0,
      amountToUse: 29.99,
    });
  });

  it('returns undefined appliedGiftCard when not present', () => {
    const apiCart = mockApiCart({ appliedGiftCard: undefined });
    const result = transformCart(apiCart);
    expect(result.appliedGiftCard).toBeUndefined();
  });

  it('handles empty items array', () => {
    const apiCart = mockApiCart({ items: [], itemCount: 0 });
    const result = transformCart(apiCart);
    expect(result.items).toEqual([]);
    expect(result.itemCount).toBe(0);
  });

  it('handles multiple items', () => {
    const apiCart = mockApiCart({
      items: [
        mockApiCartItem({ id: 1, productId: 100 }),
        mockApiCartItem({ id: 2, productId: 200 }),
        mockApiCartItem({ id: 3, productId: 300 }),
      ],
      itemCount: 3,
    });

    const result = transformCart(apiCart);
    expect(result.items).toHaveLength(3);
  });
});
