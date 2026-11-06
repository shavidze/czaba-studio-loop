import type { MetaFunction } from '@remix-run/node';
import {
  CheckCircle,
  ChevronDown,
  CreditCard,
  Gift,
  Mail,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '~/components/layout';
import { Footer } from '~/components/layout/Footer';
import { Button } from '~/components/ui';
import { useCart } from '~/hooks';
import { formatPrice } from '~/lib/cart-utils';
import { apiClient } from '~/services/api/client';

export const meta: MetaFunction = () => {
  return [
    { title: 'Digital Gift Cards | CZABA' },
    {
      name: 'description',
      content:
        'Give the gift of cinematic sound. CZABA digital gift cards never expire and can be used on any product.',
    },
  ];
};

interface GiftCardVariant {
  id: number;
  amount: number;
  description: string;
}

const FALLBACK_VARIANTS: GiftCardVariant[] = [
  { id: 0, amount: 19, description: 'Perfect for a single license' },
  { id: 0, amount: 25, description: 'Universal amount' },
  { id: 0, amount: 49, description: 'Covers a Premium license' },
  { id: 0, amount: 50, description: 'Universal amount' },
  { id: 0, amount: 100, description: 'For the ultimate gift' },
];

const FAQ_ITEMS = [
  {
    question: 'How does the recipient use the gift card?',
    answer:
      'At checkout, they will see a field to enter the gift card code. The amount will be automatically deducted from their total.',
  },
  {
    question: 'What if the purchase amount is more than the gift card value?',
    answer: 'The remaining balance can be paid using any of our accepted payment methods.',
  },
  {
    question: 'What if the purchase is less than the gift card value?',
    answer:
      'The remaining balance stays on the same gift card code and can be used for future purchases.',
  },
  {
    question: 'Do gift cards expire?',
    answer: 'No, our gift cards never expire. The balance is valid forever.',
  },
  {
    question: 'Can I get a cash refund for a gift card?',
    answer: 'Gift cards are non-refundable and cannot be exchanged for cash.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-outline">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-muted">{answer}</p>
      </div>
    </div>
  );
}

// Balance Checker Component
function BalanceChecker() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    balance?: number;
    errorMessage?: string;
  } | null>(null);

  const handleCheck = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5199'}/api/gift-cards/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim() }),
        },
      );

      const data = await response.json();

      if (data.success && data.data?.isValid) {
        setResult({
          isValid: true,
          balance: data.data.currentBalance,
        });
      } else {
        setResult({
          isValid: false,
          errorMessage: data.data?.errorMessage || 'Invalid gift card code',
        });
      }
    } catch {
      setResult({
        isValid: false,
        errorMessage: 'Unable to check balance. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-elevated border border-outline">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-brand" />
        Check Your Balance
      </h3>

      <div className="flex gap-3 mb-3">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setResult(null);
          }}
          placeholder="Enter gift card code"
          className="flex-1 px-4 py-2.5 bg-surface border border-outline-strong rounded-lg text-foreground placeholder:text-muted font-mono tracking-wider text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
        />
        <Button
          onClick={handleCheck}
          variant="secondary"
          isLoading={isLoading}
          disabled={!code.trim()}
        >
          Check
        </Button>
      </div>

      {result && (
        <div
          className={`p-3 rounded-lg ${
            result.isValid
              ? 'bg-brand/10 border border-brand/20'
              : 'bg-destructive/10 border border-destructive/20'
          }`}
        >
          {result.isValid ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand" />
              <span className="text-sm text-foreground">
                Balance:{' '}
                <span className="font-bold text-brand">{formatPrice(result.balance || 0)}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive">{result.errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GiftCardsPage() {
  const { addToCart, isAddingToCart } = useCart();
  const [productId, setProductId] = useState<number | null>(null);
  const [variants, setVariants] = useState<GiftCardVariant[]>(FALLBACK_VARIANTS);
  const [selectedVariant, setSelectedVariant] = useState<GiftCardVariant>(FALLBACK_VARIANTS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGiftCardProduct = async () => {
      try {
        const product = await apiClient.getProductByHandle('digital-gift-card');
        if (product?.variants && product.variants.length > 0) {
          setProductId(product.id);
          const mappedVariants: GiftCardVariant[] = product.variants.map((v) => ({
            id: v.id,
            amount: v.price,
            description: v.name.replace(/^\$\d+\s*-\s*/, ''),
          }));
          setVariants(mappedVariants);
          setSelectedVariant(mappedVariants[0]);
        }
      } catch (err) {
        console.error('Failed to load gift card product:', err);
        setError('Gift cards will be available soon');
      } finally {
        setIsLoading(false);
      }
    };

    loadGiftCardProduct();
  }, []);

  const handleAddToCart = async () => {
    if (!productId || !selectedVariant.id) {
      setError('Gift cards will be available soon');
      return;
    }

    try {
      await addToCart(productId, 'digital-gift-card', selectedVariant.id);
    } catch (err) {
      console.error('Failed to add gift card to cart:', err);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

          <PageContainer>
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand mb-6">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-medium">Digital Gift Card</span>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                Give the Gift of <span className="text-brand">Cinematic Sound</span>
              </h1>

              <p className="text-lg md:text-xl text-muted max-w-xl mx-auto">
                Empower a creator's next masterpiece. The perfect present for filmmakers, producers,
                and storytellers.
              </p>
            </div>
          </PageContainer>
        </section>

        {/* Denomination Selector */}
        <section className="py-12 md:py-16">
          <PageContainer>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-center text-lg font-medium text-foreground mb-8">
                Select an Amount
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {variants.map((variant, index) => (
                  <button
                    key={variant.id || index}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={isLoading}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                      selectedVariant.amount === variant.amount
                        ? 'border-brand bg-brand/5 shadow-[0_0_20px_rgba(19,217,204,0.2)]'
                        : 'border-outline bg-surface hover:border-outline-hover'
                    }`}
                  >
                    <div className="text-2xl font-bold text-foreground mb-1">${variant.amount}</div>
                    <div className="text-xs text-muted">{variant.description}</div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  isLoading={isAddingToCart}
                  disabled={isLoading || !productId}
                  className="px-12"
                >
                  {isLoading ? 'Loading...' : `Select — $${selectedVariant.amount}`}
                </Button>

                {error && <p className="text-sm text-muted">{error}</p>}

                <p className="text-sm text-muted">Delivered instantly via email</p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Balance Checker Section */}
        <section className="py-8">
          <PageContainer>
            <div className="max-w-md mx-auto">
              <BalanceChecker />
            </div>
          </PageContainer>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-surface">
          <PageContainer>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: <CreditCard className="w-6 h-6 text-brand" />,
                  step: '01',
                  title: 'Choose & Purchase',
                  description: 'Select the perfect amount and complete checkout',
                },
                {
                  icon: <Mail className="w-6 h-6 text-brand" />,
                  step: '02',
                  title: 'Receive the Code',
                  description: 'A unique 16-digit code delivered to your email',
                },
                {
                  icon: <ShoppingBag className="w-6 h-6 text-brand" />,
                  step: '03',
                  title: 'Redeem at Checkout',
                  description: 'Enter the code to apply the gift card balance',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-full bg-brand/5 border border-brand/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-elevated border border-outline flex items-center justify-center text-[10px] font-medium text-muted">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <PageContainer>
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12">
                Why CZABA Gift Cards?
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-surface border border-outline">
                  <h3 className="font-semibold text-foreground mb-2">Never Expires</h3>
                  <p className="text-sm text-muted">
                    No rush — the gift card balance is valid forever
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-surface border border-outline">
                  <h3 className="font-semibold text-foreground mb-2">Instant Delivery</h3>
                  <p className="text-sm text-muted">Sent directly to your email within minutes</p>
                </div>
                <div className="p-6 rounded-xl bg-surface border border-outline">
                  <h3 className="font-semibold text-foreground mb-2">Works on Everything</h3>
                  <p className="text-sm text-muted">
                    Use on any product — music, sound effects, presets
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-surface border border-outline">
                  <h3 className="font-semibold text-foreground mb-2">Stackable Balance</h3>
                  <p className="text-sm text-muted">Remaining balance stays for future purchases</p>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-surface">
          <PageContainer>
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12">
                Frequently Asked Questions
              </h2>

              <div className="border-t border-outline">
                {FAQ_ITEMS.map((item, index) => (
                  <FAQItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer />
    </>
  );
}
