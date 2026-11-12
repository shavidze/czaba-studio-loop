export interface CartItem {
  id: number;
  productId: number;
  productVariantId?: number;
  productTitle: string;
  productHandle: string;
  variantTitle?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface AppliedDiscount {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

export interface AppliedGiftCard {
  code: string;
  maskedCode: string;
  balance: number;
  amountToUse: number;
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  giftCardAmount: number;
  total: number;
  appliedCoupon?: AppliedDiscount;
  appliedGiftCard?: AppliedGiftCard;
  checkoutUrl?: string;
}

export interface CartContextValue {
  // State
  cart: Cart | null;
  isLoading: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  isRemovingFromCart: boolean;
  updatingItemId: number | null;
  isApplyingDiscount: boolean;

  // Cart count for header
  cartCount: number;

  // Actions
  // productId is the backend product ID
  // productHandle is optional - used for version replacement logic
  // productVariantId is the backend variant ID (Standard/Premium)
  addToCart: (
    productId: number,
    productHandle?: string,
    productVariantId?: number,
  ) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  buyNow: (productId: number, productVariantId?: number) => Promise<void>;
  checkout: () => Promise<void>;

  // Digital products - check if already in cart
  isInCart: (productId: number) => boolean;
  isVariantInCart: (productId: number, productVariantId?: number) => boolean;
  isProductInCart: (productHandle: string) => boolean;
  getCartVariantForProduct: (productHandle: string) => number | undefined;

  // Discounts
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  applyGiftCard: (code: string) => Promise<void>;
  removeGiftCard: () => Promise<void>;

  // Refresh cart (e.g., after auth change)
  refreshCart: () => Promise<void>;
}

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ToastOptions {
  title?: string;
  type?: Toast['type'];
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, options?: ToastOptions | Toast['type']) => void;
  removeToast: (id: string) => void;
}
