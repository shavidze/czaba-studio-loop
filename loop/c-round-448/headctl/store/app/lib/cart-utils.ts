/**
 * Cart Utility Functions
 * Pure functions for cart logic - easily testable
 */

import type { Cart, CartItem } from '~/types/cart';

export interface CartItemInfo {
  itemId: number;
  productId: number;
}

/**
 * Check if a specific product is already in the cart
 */
export function isProductInCart(cart: Cart | null, productId: number): boolean {
  if (!cart?.items) return false;
  return cart.items.some((item) => item.productId === productId);
}

/**
 * Check if a product (by handle) is in the cart
 * Used for version replacement - finds any version of the same product
 */
export function isProductHandleInCart(cart: Cart | null, productHandle: string): boolean {
  if (!cart?.items) return false;
  return cart.items.some((item) => item.productHandle === productHandle);
}

/**
 * Find a cart item by product handle
 * Used for version replacement - finds any version of the same product
 */
export function getCartItemByProductHandle(
  cart: Cart | null,
  productHandle: string,
): CartItemInfo | null {
  if (!cart?.items) return null;

  const item = cart.items.find((i) => i.productHandle === productHandle);

  if (item) {
    return {
      itemId: item.id,
      productId: item.productId,
    };
  }

  return null;
}

/**
 * Determine if we need to replace an existing version in cart
 * Returns the item to remove if replacement is needed
 */
export function shouldReplaceVersion(
  cart: Cart | null,
  productId: number,
  productHandle: string,
): CartItemInfo | null {
  const existingItem = getCartItemByProductHandle(cart, productHandle);

  // If there's an existing item with a different productId, we should replace it
  if (existingItem && existingItem.productId !== productId) {
    return existingItem;
  }

  return null;
}

/**
 * Get cart item count
 */
export function getCartCount(cart: Cart | null): number {
  return cart?.itemCount ?? 0;
}

/**
 * Get all cart items as a flat array
 */
export function getCartItems(cart: Cart | null): CartItem[] {
  return cart?.items ?? [];
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}
