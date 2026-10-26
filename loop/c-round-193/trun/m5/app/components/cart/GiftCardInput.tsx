import { AlertCircle, Check, Gift, X } from 'lucide-react';
import { useState } from 'react';
import { LoaderIcon } from '~/components/icons';
import { Button } from '~/components/ui';
import { useCart } from '~/hooks';
import type { AppliedGiftCard } from '~/types/cart';

interface GiftCardInputProps {
  appliedGiftCards?: AppliedGiftCard[];
}

export function GiftCardInput({ appliedGiftCards = [] }: GiftCardInputProps) {
  const [code, setCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { applyGiftCard, removeGiftCard, isApplyingDiscount: isApplyingGiftCard } = useCart();

  const [giftCardError, setGiftCardError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim() || isApplyingGiftCard) return;
    setGiftCardError(null);
    try {
      await applyGiftCard(code.trim());
      setCode('');
    } catch (error) {
      setGiftCardError(error instanceof Error ? error.message : 'Could not apply gift card');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      {/* Applied Gift Cards */}
      {appliedGiftCards.length > 0 && (
        <div className="space-y-2">
          {appliedGiftCards.map((gc) => (
            <div
              key={gc.code}
              className="flex items-center justify-between p-3 bg-brand/5 border border-brand/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand" />
                <span className="text-sm text-foreground">Gift Card {gc.maskedCode}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-brand font-medium">
                  -{formatPrice(gc.amountToUse)}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    setGiftCardError(null);
                    try {
                      await removeGiftCard();
                    } catch (error) {
                      setGiftCardError(
                        error instanceof Error ? error.message : 'Could not remove gift card',
                      );
                    }
                  }}
                  className="p-1 text-muted hover:text-destructive transition-colors cursor-pointer"
                  aria-label="Remove gift card"
                  disabled={isApplyingGiftCard}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Section */}
      {!isExpanded && appliedGiftCards.length === 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>Have a gift card or promo code?</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              aria-label="Gift card code"
              placeholder="Enter code"
              maxLength={19}
              className="flex-1 px-3 py-2 bg-surface border border-outline rounded-md text-foreground placeholder:text-muted text-sm focus:outline-none focus:border-brand transition-colors"
              disabled={isApplyingGiftCard}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleApply}
              disabled={!code.trim() || isApplyingGiftCard}
            >
              {isApplyingGiftCard ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Apply'}
            </Button>
          </div>

          {/* Error Message */}
          {giftCardError && (
            <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {giftCardError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
