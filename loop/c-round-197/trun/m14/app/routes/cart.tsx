import { Link } from '@remix-run/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  Gift,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, ConfirmDialog, EmptyState } from '~/components/ui';
import { useAuth, useCart, usePurchases } from '~/hooks';
import { formatPrice } from '~/lib/cart-utils';
import type { AppliedDiscount, AppliedGiftCard, CartItem } from '~/types/cart';

// Ownership status for cart item
type OwnershipStatus =
  | { type: 'not_owned' }
  | { type: 'owns_same'; version: string }
  | { type: 'owns_higher'; version: string }
  | { type: 'can_upgrade'; currentVersion: string };

// Cart Item Component
function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
  isRemoving,
  isUpdating,
  ownershipStatus,
}: {
  item: CartItem;
  onRemove: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  isRemoving: boolean;
  isUpdating: boolean;
  ownershipStatus: OwnershipStatus;
}) {
  const productTitle = item.productTitle;
  const variantTitle = item.variantTitle;
  const imageUrl = item.imageUrl;

  const hasOwnershipIssue =
    ownershipStatus.type === 'owns_same' || ownershipStatus.type === 'owns_higher';

  const isGiftCard =
    item.productHandle?.includes('gift-card') ||
    item.productTitle?.toLowerCase().includes('gift card');

  const ImageWrapper = isGiftCard ? 'div' : Link;
  const imageWrapperProps = isGiftCard
    ? { className: 'shrink-0 w-20 h-20 rounded-md overflow-hidden bg-elevated' }
    : {
        to: `/products/${item.productHandle}`,
        className: 'shrink-0 w-20 h-20 rounded-md overflow-hidden bg-elevated',
      };

  const canChangeQuantity = isGiftCard;

  return (
    <div
      className={`flex flex-col gap-4 p-6 rounded-lg border transition-colors ${
        hasOwnershipIssue
          ? 'bg-accent/5 border-accent/20'
          : 'bg-surface border-outline hover:border-outline-hover'
      }`}
    >
      <div className="flex gap-6">
        <ImageWrapper {...(imageWrapperProps as any)}>
          {imageUrl ? (
            <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted" />
            </div>
          )}
        </ImageWrapper>

        <div className="flex-1 min-w-0">
          {isGiftCard ? (
            <span className="text-foreground font-medium line-clamp-1">{productTitle}</span>
          ) : (
            <Link
              to={`/products/${item.productHandle}`}
              className="text-foreground font-medium hover:text-brand transition-colors line-clamp-1"
            >
              {productTitle}
            </Link>
          )}
          {variantTitle && variantTitle !== 'Default Title' && (
            <p className="text-sm text-muted mt-0.5">{variantTitle}</p>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <p className="text-brand font-semibold">{formatPrice(item.unitPrice)}</p>
              {item.quantity > 1 && (
                <p className="text-muted text-sm">
                  × {item.quantity} = {formatPrice(item.total)}
                </p>
              )}
            </div>

            {canChangeQuantity && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="p-1.5 rounded-md bg-elevated border border-outline hover:border-brand hover:text-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-foreground font-medium">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating}
                  className="p-1.5 rounded-md bg-elevated border border-outline hover:border-brand hover:text-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="shrink-0 p-2 h-fit text-muted hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Remove item"
        >
          {isRemoving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Ownership Warning */}
      {ownershipStatus.type === 'owns_same' && (
        <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <AlertTriangle className="w-5 h-5 text-accent shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-accent">You already own {ownershipStatus.version}</p>
            <p className="text-xs text-accent/70 mt-0.5">
              Remove this item or upgrade to Premium instead
            </p>
          </div>
          <Link
            to={`/products/${item.productHandle}?upgrade=premium`}
            className="px-3 py-1.5 bg-brand text-black text-sm font-medium rounded hover:bg-brand/90 transition-colors flex items-center gap-1.5"
          >
            <ArrowUp className="w-4 h-4" />
            Upgrade
          </Link>
        </div>
      )}

      {ownershipStatus.type === 'owns_higher' && (
        <div className="flex items-center gap-3 p-3 bg-brand/10 rounded-lg border border-brand/20">
          <AlertTriangle className="w-5 h-5 text-brand shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-brand">You own Premium, which includes this version</p>
            <p className="text-xs text-brand/70 mt-0.5">Please remove this item from your cart</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Discount Code Input Component
function DiscountCodeInput({
  type,
  placeholder,
  onApply,
  isLoading,
  icon: Icon,
}: {
  type: 'coupon' | 'giftcard';
  placeholder: string;
  onApply: (code: string) => Promise<void>;
  isLoading: boolean;
  icon: typeof Tag;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setError(null);
    try {
      await onApply(code.trim());
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 py-2 bg-elevated border border-outline-strong rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button
          onClick={handleApply}
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          disabled={!code.trim()}
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Applied Discount Badge
function AppliedDiscountBadge({
  label,
  value,
  onRemove,
  isLoading,
}: {
  label: string;
  value: string;
  onRemove: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-brand/10 border border-brand/20 rounded-md">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-brand" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-brand">{value}</span>
        <button
          onClick={onRemove}
          disabled={isLoading}
          className="p-1 text-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary({
  subtotal,
  discountAmount,
  giftCardAmount,
  total,
  appliedCoupon,
  appliedGiftCard,
  isLoading,
  isApplyingDiscount,
  onCheckout,
  onApplyCoupon,
  onRemoveCoupon,
  onApplyGiftCard,
  onRemoveGiftCard,
  hasOwnershipIssues = false,
}: {
  subtotal: number;
  discountAmount: number;
  giftCardAmount: number;
  total: number;
  appliedCoupon?: AppliedDiscount;
  appliedGiftCard?: AppliedGiftCard;
  isLoading: boolean;
  isApplyingDiscount: boolean;
  onCheckout: () => void;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
  onApplyGiftCard: (code: string) => Promise<void>;
  onRemoveGiftCard: () => Promise<void>;
  hasOwnershipIssues?: boolean;
}) {
  return (
    <div className="bg-surface border border-outline rounded-lg p-8 sticky top-24">
      <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>

        {/* Applied Coupon */}
        {appliedCoupon && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Discount ({appliedCoupon.code})</span>
            <span className="text-brand">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {/* Applied Gift Card */}
        {appliedGiftCard && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Gift Card ({appliedGiftCard.maskedCode})</span>
            <span className="text-brand">-{formatPrice(giftCardAmount)}</span>
          </div>
        )}

        <div className="border-t border-outline pt-4">
          <div className="flex justify-between">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-brand font-bold text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Discount Codes Section */}
      <div className="mt-6 space-y-4">
        {/* Coupon */}
        {appliedCoupon ? (
          <AppliedDiscountBadge
            label={appliedCoupon.code}
            value={`-${formatPrice(discountAmount)}`}
            onRemove={onRemoveCoupon}
            isLoading={isApplyingDiscount}
          />
        ) : (
          <DiscountCodeInput
            type="coupon"
            placeholder="Coupon code"
            onApply={onApplyCoupon}
            isLoading={isApplyingDiscount}
            icon={Tag}
          />
        )}

        {/* Gift Card */}
        {appliedGiftCard ? (
          <AppliedDiscountBadge
            label={appliedGiftCard.maskedCode}
            value={`-${formatPrice(giftCardAmount)} (${formatPrice(appliedGiftCard.balance)} balance)`}
            onRemove={onRemoveGiftCard}
            isLoading={isApplyingDiscount}
          />
        ) : (
          <DiscountCodeInput
            type="giftcard"
            placeholder="Gift card code"
            onApply={onApplyGiftCard}
            isLoading={isApplyingDiscount}
            icon={Gift}
          />
        )}
      </div>

      {/* Warning when ownership issues exist */}
      {hasOwnershipIssues && (
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-accent">
            Please resolve ownership issues above before checkout
          </p>
        </div>
      )}

      <Button
        onClick={onCheckout}
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={hasOwnershipIssues}
        className="mt-6"
      >
        {hasOwnershipIssues ? 'Resolve Issues to Continue' : 'Proceed to Checkout'}
      </Button>

      <p className="text-xs text-muted text-center mt-4">Taxes calculated at checkout</p>
    </div>
  );
}

// Empty Cart Component
function EmptyCart() {
  return (
    <EmptyState
      preset="cart"
      title="Your collection awaits"
      description="You haven't added anything yet. Discover cinematic sound libraries crafted for your next production."
      actionLabel="Discover the Collection"
      actionHref="/store"
    />
  );
}

// Loading Skeleton
function CartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-6 p-6 bg-surface rounded-lg border border-outline">
            <div className="w-20 h-20 bg-elevated rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-elevated rounded w-3/4" />
              <div className="h-4 bg-elevated rounded w-1/4" />
              <div className="h-5 bg-elevated rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper: დაადგინე ownership status კონკრეტული cart item-ისთვის
function getItemOwnershipStatus(
  item: CartItem,
  purchasedProducts: Array<{
    handle: string;
    versionType: 'premium' | 'standard' | 'universal' | null;
  }>,
): OwnershipStatus {
  const productHandle = item.productHandle;
  const variantTitle = item.variantTitle?.toLowerCase() || '';

  // ვიპოვოთ ეს პროდუქტი პურჩეისებში
  const ownedProduct = purchasedProducts.find((p) => p.handle === productHandle);

  if (!ownedProduct) {
    return { type: 'not_owned' };
  }

  const ownedVersionType = ownedProduct.versionType;
  if (ownedVersionType === 'universal') {
    return { type: 'owns_same', version: 'Universal' };
  }

  // cart item-ის ვერსია (Standard თუ Premium)
  const isCartItemPremium = variantTitle.includes('premium');
  const isCartItemStandard = variantTitle.includes('standard') || !isCartItemPremium;

  // Premium მფლობელს ყველაფერი აქვს
  if (ownedVersionType === 'premium') {
    return { type: 'owns_higher', version: 'Premium' };
  }

  // Standard მფლობელი
  if (ownedVersionType === 'standard') {
    if (isCartItemStandard) {
      return { type: 'owns_same', version: 'Standard' };
    }
    // Premium-ს ყიდულობს - ეს upgrade-ია, OK
    return { type: 'can_upgrade', currentVersion: 'Standard' };
  }

  return { type: 'not_owned' };
}

// Main Cart Page
export default function CartPage() {
  const {
    cart,
    isLoading,
    isRemovingFromCart,
    updatingItemId,
    isBuyingNow,
    isApplyingDiscount,
    removeFromCart,
    updateQuantity,
    checkout,
    applyCoupon,
    removeCoupon,
    applyGiftCard,
    removeGiftCard,
  } = useCart();
  const { isAuthenticated, openModal } = useAuth();
  const { purchasedProducts } = usePurchases();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: number; title: string } | null>(null);

  const cartItems = cart?.items ?? [];
  const isEmpty = cartItems.length === 0;

  // გამოთვალე ownership status ყველა item-ისთვის
  const itemOwnershipStatuses = useMemo(() => {
    if (!isAuthenticated) {
      return cartItems.map(() => ({ type: 'not_owned' }) as OwnershipStatus);
    }
    return cartItems.map((item) => getItemOwnershipStatus(item, purchasedProducts));
  }, [cartItems, purchasedProducts, isAuthenticated]);

  // არის თუ არა რომელიმე item-ს ownership პრობლემა
  const hasOwnershipIssues = itemOwnershipStatuses.some(
    (status) => status.type === 'owns_same' || status.type === 'owns_higher',
  );

  const subtotal = cart?.subtotal ?? 0;
  const discountAmount = cart?.discountAmount ?? 0;
  const giftCardAmount = cart?.giftCardAmount ?? 0;
  const total = cart?.total ?? subtotal;

  // დადასტურების მოდალის გახსნა
  const handleRemoveClick = (itemId: number, productTitle: string) => {
    setItemToRemove({ id: itemId, title: productTitle });
  };

  // დადასტურების შემდეგ წაშლა
  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;
    try {
      await removeFromCart(itemToRemove.id);
      setItemToRemove(null);
    } catch (_error) {
      // Error handling is done in the context
    }
  };

  // გაუქმება
  const handleCancelRemove = () => {
    setItemToRemove(null);
  };

  const handleCheckout = async () => {
    if (!cart || isEmpty) return;

    // თუ მომხმარებელი არ არის ავტორიზებული - გახსენი signin მოდალი
    if (!isAuthenticated) {
      openModal('signin');
      return;
    }

    // დავიწყოთ checkout პროცესი
    setIsCheckingOut(true);

    try {
      await checkout();
    } catch (_error) {
      // Error handling is done in the context
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="h-[calc(100vh-80px)] bg-background overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-8 py-12 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Collection</h1>
            {!isLoading && !isEmpty && (
              <p className="text-muted mt-2">
                {cart?.itemCount} {cart?.itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Browsing
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <CartSkeleton />
        ) : isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
            {/* Cart Items - scrollable */}
            <div className="lg:col-span-2 overflow-y-auto overscroll-contain styled-scrollbar pr-2">
              <div className="space-y-6 pb-4">
                {cartItems.map((item, index) => (
                  <CartItemRow
                    key={`${item.id}-${item.productId}`}
                    item={item}
                    onRemove={(itemId) => handleRemoveClick(itemId, item.productTitle)}
                    onUpdateQuantity={updateQuantity}
                    isRemoving={isRemovingFromCart && itemToRemove?.id === item.id}
                    isUpdating={updatingItemId === item.id}
                    ownershipStatus={itemOwnershipStatuses[index]}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                giftCardAmount={giftCardAmount}
                total={total}
                appliedCoupon={cart?.appliedCoupon}
                appliedGiftCard={cart?.appliedGiftCard}
                isLoading={isCheckingOut || isBuyingNow}
                isApplyingDiscount={isApplyingDiscount}
                onCheckout={handleCheckout}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                onApplyGiftCard={applyGiftCard}
                onRemoveGiftCard={removeGiftCard}
                hasOwnershipIssues={hasOwnershipIssues}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToRemove}
        title="Remove from collection?"
        description={`"${itemToRemove?.title ?? ''}"`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isLoading={isRemovingFromCart}
        icon={<Trash2 className="w-7 h-7 text-muted" />}
      />
    </main>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from '~/components/errors';
