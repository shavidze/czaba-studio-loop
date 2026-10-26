import { Link, useNavigate } from '@remix-run/react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  AudioLines,
  Check,
  Download,
  Loader2,
  ShoppingCart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { useCart } from '~/hooks/useCart';
import { usePurchases } from '~/hooks/usePurchases';
import { useToast } from '~/hooks/useToast';
import { trackAddToCart, trackBeginCheckout } from '~/lib/analytics';
import { trackFBAddToCart, trackFBInitiateCheckout } from '~/lib/facebook-pixel';

interface PurchaseHeaderProps {
  price: number;
  currencyCode: string;
  productId: number;
  productTitle: string;
  productHandle: string;
  selectedVersionName: 'Standard' | 'Premium' | string;
  onSelectPremium?: () => void;
  // Upgrade pricing
  ownedPrice?: number;
  isUpgrade?: boolean;
  // Backend variant ID for cart
  productVariantId?: number;
  recordingsHref?: string;
}

export function PurchaseHeader({
  price,
  currencyCode,
  productId,
  productTitle,
  productHandle,
  selectedVersionName,
  onSelectPremium,
  ownedPrice = 0,
  isUpgrade = false,
  productVariantId,
  recordingsHref,
}: PurchaseHeaderProps) {
  const { addToCart, buyNow, isAddingToCart, isBuyingNow, isVariantInCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const {
    getProductVersionType,
    isProductOwnedByHandle,
    isLoading: isPurchasesLoading,
  } = usePurchases();
  const { isAuthenticated, openModal } = useAuth();

  // შევამოწმოთ მომხმარებელს რა ვერსია აქვს ნაყიდი
  const ownedVersionType = isAuthenticated ? getProductVersionType(productHandle) : null;
  const isSupportedVersion = ['standard', 'premium', 'universal'].includes(
    selectedVersionName.toLowerCase(),
  );
  const isPremiumSelected = selectedVersionName.toLowerCase() === 'premium';
  const ownsSfx =
    Boolean(recordingsHref) && isAuthenticated && isProductOwnedByHandle(productHandle);
  const ownsStandard = ownedVersionType === 'standard';
  const ownsPremium = ownedVersionType === 'premium';

  // Upgrade price გამოთვლა
  const upgradePrice = isUpgrade ? price - ownedPrice : price;

  // შევამოწმოთ valid product ID არის თუ არა
  const isValidProductId = productId > 0;

  // ციფრული პროდუქტი - შევამოწმოთ ეს კონკრეტული ვარიანტი არის თუ არა კალათაში
  const alreadyInCart = isValidProductId && isVariantInCart(productId, productVariantId);

  const handleAddToCart = async () => {
    if (!isValidProductId || !isSupportedVersion) {
      showToast('This product is not yet available for purchase', 'info');
      return;
    }
    try {
      await addToCart(productId, productHandle, productVariantId);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
      trackAddToCart({
        productId: productId.toString(),
        productTitle,
        productPrice: price,
        currency: currencyCode,
      });
      // Facebook Pixel Event: AddToCart
      trackFBAddToCart({
        productId: productId.toString(),
        productTitle,
        productPrice: price,
        currency: currencyCode,
      });
    } catch {
      // Error is already handled in context with toast
    }
  };

  const handleBuyNow = async () => {
    // არაავტორიზებული მომხმარებლისთვის - ჯერ ავტორიზაცია
    if (!isAuthenticated) {
      showToast('Please sign in to continue with your purchase', 'info');
      openModal('signin');
      return;
    }

    if (!isValidProductId || !isSupportedVersion) {
      showToast('This product is not yet available for purchase', 'info');
      return;
    }
    try {
      // GA4 Event: begin_checkout
      trackBeginCheckout({
        productId: productId.toString(),
        productTitle,
        productPrice: price,
        currency: currencyCode,
      });
      // Facebook Pixel Event: InitiateCheckout
      trackFBInitiateCheckout({
        productId: productId.toString(),
        productTitle,
        productPrice: price,
        currency: currencyCode,
      });
      await buyNow(productId, productVariantId);
    } catch {
      // Error is already handled in context with toast
    }
  };

  const isDisabled = isAddingToCart || isBuyingNow || !isSupportedVersion;
  const [justAdded, setJustAdded] = useState(false);

  if (!isSupportedVersion) {
    return (
      <output className="block rounded-xl border border-outline bg-surface p-6 text-muted">
        This edition is not available for online purchase. Please contact support.
      </output>
    );
  }

  // Case 1: მომხმარებელს აქვს Premium - ყველაფერი აქვს
  if (ownsPremium || ownsSfx) {
    return (
      <div className="p-6 bg-brand/5 rounded-xl border border-brand/20">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
              <Check size={24} className="text-brand" />
            </div>
            <div>
              <div className="text-[10px] text-brand uppercase tracking-[0.2em] mb-1">
                {ownsSfx ? 'Universal License' : 'Premium Owner'}
              </div>
              <div className="text-xl font-medium text-brand">
                {ownsSfx ? 'You own this collection' : 'You own Premium'}
              </div>
              <div className="text-sm text-brand/70 mt-1">
                {ownsSfx
                  ? 'Your recordings and downloads are ready'
                  : 'Your Premium edition is ready to download'}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {recordingsHref && (
              <Link
                to={recordingsHref}
                className="group px-5 py-3 border border-brand/30 text-brand font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 hover:bg-brand/10"
              >
                <AudioLines size={16} />
                <span>Open in Studio</span>
              </Link>
            )}
            <Link
              to="/account/downloads"
              className="group px-6 py-3 bg-brand text-background font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand-hover"
            >
              <Download size={16} />
              <span>Go to Downloads</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: მომხმარებელს აქვს Standard და ცდილობს სტანდარტი შეიძინოს (იგივე ვერსია)
  if (ownsStandard && !isPremiumSelected) {
    return (
      <div className="p-6 bg-accent/5 rounded-xl border border-accent/20">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <Check size={24} className="text-accent" />
            </div>
            <div>
              <div className="text-[10px] text-accent uppercase tracking-[0.2em] mb-1">
                Already Owned
              </div>
              <div className="text-xl font-medium text-accent">You own Standard</div>
              <div className="text-sm text-accent/70 mt-1">Compare the Premium edition below</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/account/downloads"
              className="group px-5 py-3 border border-accent/30 text-accent font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 hover:bg-accent/10"
            >
              <Download size={16} />
              <span>Downloads</span>
            </Link>
            {onSelectPremium && (
              <button
                type="button"
                onClick={onSelectPremium}
                className="group px-6 py-3 bg-brand text-black font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand/90"
              >
                <ArrowUp size={16} />
                <span>Upgrade to Premium</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Upgrade - მომხმარებელს აქვს Standard და Premium-ს ირჩევს
  if (isUpgrade && upgradePrice > 0) {
    return (
      <div className="p-6 bg-surface/80 rounded-xl border border-brand/20">
        {/* Upgrade Header - Premium Feel */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20">
            <ArrowUp size={22} className="text-brand" />
          </div>
          <div>
            <div className="text-xl font-semibold text-foreground tracking-tight">
              Unlock Premium
            </div>
            <div className="text-sm text-muted mt-0.5">
              Review the collection details for included files
            </div>
          </div>
        </div>

        {/* Upgrade Price and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-5 border-t border-outline/30">
          {/* Price - Clear Upgrade Display */}
          <div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-light text-foreground tracking-tight">
                ${upgradePrice.toFixed(2)}
                <span className="text-lg text-muted ml-1">USD</span>
              </div>
            </div>
            <div className="text-xs text-muted mt-1">Standard credit applied</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <CartButton
              alreadyInCart={alreadyInCart}
              justAdded={justAdded}
              isAddingToCart={isAddingToCart}
              isDisabled={isDisabled}
              onAdd={handleAddToCart}
              onGoToCart={() => navigate('/cart')}
            />

            {/* Upgrade Now - Brand color */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isDisabled}
              className="group px-6 py-3 bg-brand text-background font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand-hover"
            >
              {isBuyingNow ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="opacity-80" />
                  <span>Unlock Premium</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - purchases ჯერ იტვირთება
  if (isPurchasesLoading && isAuthenticated) {
    return (
      <div className="p-6 bg-surface/50 rounded-xl border border-outline/50">
        <div className="flex items-center justify-center gap-3 py-2">
          <Loader2 size={20} className="animate-spin text-muted" />
          <span className="text-muted text-sm">Checking purchase status...</span>
        </div>
      </div>
    );
  }

  // Default: ახალი შეძენა
  return (
    <div className="p-6 bg-surface/50 rounded-xl border border-outline/50">
      {/* Price and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
        {/* Price - Premium Typography */}
        <div>
          <div className="text-[10px] text-muted uppercase tracking-[0.2em] mb-1">Total Price</div>
          <div className="text-4xl font-light text-foreground tracking-tight">
            ${price.toFixed(2)}
            <span className="text-lg text-muted ml-1">USD</span>
          </div>
        </div>

        {/* Action Buttons - Premium Style */}
        <div className="flex flex-wrap gap-3">
          <CartButton
            alreadyInCart={alreadyInCart}
            justAdded={justAdded}
            isAddingToCart={isAddingToCart}
            isDisabled={isDisabled}
            onAdd={handleAddToCart}
            onGoToCart={() => navigate('/cart')}
          />

          {/* Buy Now - Commerce Blue */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isDisabled}
            className="group px-6 py-3 bg-buy text-brand-foreground font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] hover:bg-buy-hover"
          >
            {isBuyingNow ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={16} className="opacity-80" />
                <span>Buy Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CartButtonProps {
  alreadyInCart: boolean;
  justAdded: boolean;
  isAddingToCart: boolean;
  isDisabled: boolean;
  onAdd: () => void;
  onGoToCart: () => void;
}

function CartButton({
  alreadyInCart,
  justAdded,
  isAddingToCart,
  isDisabled,
  onAdd,
  onGoToCart,
}: CartButtonProps) {
  return (
    <motion.button
      onClick={alreadyInCart ? onGoToCart : onAdd}
      disabled={isDisabled && !alreadyInCart}
      animate={justAdded ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group px-5 py-3 border rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] ${
        alreadyInCart
          ? 'bg-brand/10 text-brand border-brand/30 hover:bg-brand/20'
          : 'bg-transparent text-foreground border-outline hover:border-outline-hover hover:bg-elevated disabled:opacity-50'
      } ${justAdded ? 'shadow-[0_0_20px_rgba(var(--color-brand-rgb),0.3)]' : ''}`}
    >
      {isAddingToCart ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Adding...</span>
        </>
      ) : justAdded ? (
        <>
          <Sparkles size={16} />
          <span>Added</span>
        </>
      ) : alreadyInCart ? (
        <>
          <Check size={16} />
          <span>In Cart</span>
        </>
      ) : (
        <>
          <ShoppingCart
            size={16}
            className="opacity-60 group-hover:opacity-100 transition-opacity"
          />
          <span>Add to Cart</span>
        </>
      )}
    </motion.button>
  );
}
