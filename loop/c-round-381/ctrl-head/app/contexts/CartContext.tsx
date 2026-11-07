import { createContext, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { usePurchases } from '~/hooks/usePurchases';
import { type Cart as ApiCart, apiClient } from '~/services/api/client';
import type { Cart, CartContextValue } from '~/types/cart';

export function getCartErrorMessage(error: unknown, action: 'add' | 'remove' | 'checkout'): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const errorMessage = rawMessage.toLowerCase();

  if (error instanceof TypeError && errorMessage.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  if (errorMessage.includes('sign in') || errorMessage.includes('401')) {
    if (action === 'checkout') {
      return 'Please sign in to complete your purchase.';
    }
    return 'Please sign in to manage your cart.';
  }

  if (errorMessage.includes('permission') || errorMessage.includes('403')) {
    return 'You do not have permission to perform this action.';
  }

  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    if (action === 'add') {
      return 'This product is no longer available.';
    }
    if (action === 'remove') {
      return 'This item was already removed from your cart.';
    }
    return 'The requested item could not be found.';
  }

  if (
    errorMessage.includes('unavailable') ||
    errorMessage.includes('503') ||
    errorMessage.includes('502')
  ) {
    return 'Our service is temporarily unavailable. Please try again in a few minutes.';
  }

  if (action === 'add') {
    return 'Could not add item to cart. Please try again.';
  }
  if (action === 'remove') {
    return 'Could not remove item from cart. Please try again.';
  }
  return 'Could not complete checkout. Please try again.';
}

const SESSION_ID_KEY = 'czaba_session_id';

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
}

export function transformCart(apiCart: ApiCart): Cart {
  return {
    id: apiCart.id,
    items: (apiCart.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productVariantId: item.productVariantId ?? undefined,
      productTitle: item.productTitle,
      productHandle: item.productHandle,
      variantTitle: item.variantName ?? undefined,
      imageUrl: item.productImageUrl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total,
    })),
    itemCount: apiCart.itemCount,
    subtotal: apiCart.subtotal,
    discountAmount: apiCart.discountAmount ?? 0,
    giftCardAmount: apiCart.giftCardAmount ?? 0,
    total: apiCart.total ?? apiCart.subtotal,
    appliedCoupon: apiCart.appliedCoupon
      ? {
          code: apiCart.appliedCoupon.code,
          description: apiCart.appliedCoupon.description,
          discountType: apiCart.appliedCoupon.discountType,
          discountValue: apiCart.appliedCoupon.discountValue,
          discountAmount: apiCart.appliedCoupon.discountAmount,
        }
      : undefined,
    appliedGiftCard: apiCart.appliedGiftCard
      ? {
          code: apiCart.appliedGiftCard.code,
          maskedCode: apiCart.appliedGiftCard.maskedCode,
          balance: apiCart.appliedGiftCard.balance,
          amountToUse: apiCart.appliedGiftCard.amountToUse,
        }
      : undefined,
  };
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function CartProvider({ children, onToast }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const addingRef = useRef(false);
  const removingRef = useRef(false);
  const buyingRef = useRef(false);

  const { isAuthenticated, isInitializing: isAuthInitializing } = useAuth();
  const { getProductVersionType } = usePurchases();
  const prevAuthRef = useRef<boolean | null>(null);

  const loadCart = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const apiCart = await apiClient.getCart(sessionId);
      setCart(transformCart(apiCart));
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart({
        id: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
        discountAmount: 0,
        giftCardAmount: 0,
        total: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthInitializing) return;
    loadCart();
  }, [loadCart, isAuthInitializing]);

  useEffect(() => {
    if (isAuthInitializing) return;

    if (prevAuthRef.current !== null && prevAuthRef.current !== isAuthenticated) {
      setIsLoading(true);
      loadCart();
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, isAuthInitializing, loadCart]);

  const isInCart = useCallback(
    (productId: number): boolean => {
      if (!cart?.items) return false;
      return cart.items.some((item) => item.productId === productId);
    },
    [cart],
  );

  const isVariantInCart = useCallback(
    (productId: number, productVariantId?: number): boolean => {
      if (!cart?.items) return false;
      return cart.items.some((item) => {
        if (item.productId !== productId) return false;
        const cartVariantId = item.productVariantId ?? undefined;
        const checkVariantId = productVariantId ?? undefined;
        return cartVariantId === checkVariantId;
      });
    },
    [cart],
  );

  const isProductInCart = useCallback(
    (productHandle: string): boolean => {
      if (!cart?.items) return false;
      return cart.items.some((item) => item.productHandle === productHandle);
    },
    [cart],
  );

  const getCartVariantForProduct = useCallback(
    (productHandle: string): number | undefined => {
      if (!cart?.items) return undefined;
      const item = cart.items.find((item) => item.productHandle === productHandle);
      return item?.productVariantId ?? undefined;
    },
    [cart],
  );

  const findItemByHandle = useCallback(
    (productHandle: string) => {
      if (!cart?.items) return null;
      return cart.items.find((item) => item.productHandle === productHandle);
    },
    [cart],
  );

  const addToCart = useCallback(
    async (productId: number, productHandle?: string, productVariantId?: number) => {
      if (addingRef.current) return;

      const isGiftCard = productHandle === 'digital-gift-card';

      if (!isGiftCard && isVariantInCart(productId, productVariantId)) {
        onToast?.('Already in your collection', 'info');
        return;
      }

      if (!isGiftCard && productHandle) {
        const ownedVersion = getProductVersionType(productHandle);
        if (ownedVersion === 'premium') {
          onToast?.('You already own the Premium version', 'info');
          return;
        }
      }

      addingRef.current = true;
      setIsAddingToCart(true);

      try {
        const sessionId = getSessionId();

        if (!isGiftCard && productHandle) {
          const existingItem = findItemByHandle(productHandle);
          const existingVariantId = existingItem?.productVariantId ?? undefined;
          const newVariantId = productVariantId ?? undefined;
          if (existingItem && existingVariantId !== newVariantId) {
            await apiClient.removeCartItem(existingItem.id, sessionId);
          }
        }

        const apiCart = await apiClient.addToCart(
          { productId, productVariantId, quantity: 1 },
          sessionId,
        );

        setCart(transformCart(apiCart));
        onToast?.('Added to your collection', 'success');
      } catch (error) {
        console.error('Failed to add to cart:', error);
        onToast?.(getCartErrorMessage(error, 'add'), 'error');
        throw error;
      } finally {
        addingRef.current = false;
        setIsAddingToCart(false);
      }
    },
    [isVariantInCart, findItemByHandle, getProductVersionType, onToast],
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      if (removingRef.current) return;
      removingRef.current = true;
      setIsRemovingFromCart(true);

      try {
        const sessionId = getSessionId();
        const apiCart = await apiClient.removeCartItem(itemId, sessionId);
        setCart(transformCart(apiCart));
        onToast?.('Removed from your collection', 'success');
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        onToast?.(getCartErrorMessage(error, 'remove'), 'error');
        throw error;
      } finally {
        removingRef.current = false;
        setIsRemovingFromCart(false);
      }
    },
    [onToast],
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (quantity < 1) {
        return removeFromCart(itemId);
      }

      setUpdatingItemId(itemId);

      try {
        const sessionId = getSessionId();
        const apiCart = await apiClient.updateCartItem(itemId, quantity, sessionId);
        setCart(transformCart(apiCart));
      } catch (error) {
        console.error('Failed to update quantity:', error);
        onToast?.('Could not update quantity', 'error');
        throw error;
      } finally {
        setUpdatingItemId(null);
      }
    },
    [removeFromCart, onToast],
  );

  const buyNow = useCallback(
    async (productId: number, productVariantId?: number) => {
      if (buyingRef.current) return;
      buyingRef.current = true;
      setIsBuyingNow(true);

      try {
        const sessionId = getSessionId();

        if (!isVariantInCart(productId, productVariantId)) {
          const existingItem = cart?.items.find((item) => item.productId === productId);
          if (existingItem) {
            await apiClient.removeCartItem(existingItem.id, sessionId);
          }
          await apiClient.addToCart({ productId, productVariantId, quantity: 1 }, sessionId);
        }

        const orderResponse = await apiClient.checkout();
        const stripeResponse = await apiClient.createCheckoutSession(orderResponse.id);
        window.location.href = stripeResponse.sessionUrl;
      } catch (error) {
        console.error('Failed to process buy now:', error);
        onToast?.(getCartErrorMessage(error, 'checkout'), 'error');
        buyingRef.current = false;
        setIsBuyingNow(false);
        throw error;
      }
    },
    [isVariantInCart, cart, onToast],
  );

  const checkout = useCallback(async () => {
    if (buyingRef.current) return;
    buyingRef.current = true;
    setIsBuyingNow(true);

    try {
      const orderResponse = await apiClient.checkout();
      const stripeResponse = await apiClient.createCheckoutSession(orderResponse.id);
      window.location.href = stripeResponse.sessionUrl;
    } catch (error) {
      console.error('Failed to checkout:', error);
      onToast?.(getCartErrorMessage(error, 'checkout'), 'error');
      buyingRef.current = false;
      setIsBuyingNow(false);
      throw error;
    }
  }, [onToast]);

  const applyCoupon = useCallback(
    async (code: string) => {
      setIsApplyingDiscount(true);
      try {
        const sessionId = getSessionId();
        const apiCart = await apiClient.applyCoupon(code, sessionId);
        setCart(transformCart(apiCart));
        onToast?.('Coupon applied!', 'success');
      } catch (error) {
        console.error('Failed to apply coupon:', error);
        const message = error instanceof Error ? error.message : 'Could not apply coupon';
        onToast?.(message, 'error');
        throw error;
      } finally {
        setIsApplyingDiscount(false);
      }
    },
    [onToast],
  );

  const removeCoupon = useCallback(async () => {
    setIsApplyingDiscount(true);
    try {
      const sessionId = getSessionId();
      const apiCart = await apiClient.removeCoupon(sessionId);
      setCart(transformCart(apiCart));
      onToast?.('Coupon removed', 'success');
    } catch (error) {
      console.error('Failed to remove coupon:', error);
      onToast?.('Could not remove coupon', 'error');
      throw error;
    } finally {
      setIsApplyingDiscount(false);
    }
  }, [onToast]);

  const applyGiftCard = useCallback(
    async (code: string) => {
      setIsApplyingDiscount(true);
      try {
        const sessionId = getSessionId();
        const apiCart = await apiClient.applyGiftCard(code, sessionId);
        setCart(transformCart(apiCart));
        onToast?.('Gift card applied!', 'success');
      } catch (error) {
        console.error('Failed to apply gift card:', error);
        const message = error instanceof Error ? error.message : 'Could not apply gift card';
        onToast?.(message, 'error');
        throw error;
      } finally {
        setIsApplyingDiscount(false);
      }
    },
    [onToast],
  );

  const removeGiftCard = useCallback(async () => {
    setIsApplyingDiscount(true);
    try {
      const sessionId = getSessionId();
      const apiCart = await apiClient.removeGiftCard(sessionId);
      setCart(transformCart(apiCart));
      onToast?.('Gift card removed', 'success');
    } catch (error) {
      console.error('Failed to remove gift card:', error);
      onToast?.('Could not remove gift card', 'error');
      throw error;
    } finally {
      setIsApplyingDiscount(false);
    }
  }, [onToast]);

  const cartCount = cart?.itemCount ?? 0;

  const value: CartContextValue = {
    cart,
    isLoading,
    isAddingToCart,
    isRemovingFromCart,
    updatingItemId,
    isBuyingNow,
    isApplyingDiscount,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    buyNow,
    checkout,
    isInCart,
    isVariantInCart,
    isProductInCart,
    getCartVariantForProduct,
    applyCoupon,
    removeCoupon,
    applyGiftCard,
    removeGiftCard,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext };
