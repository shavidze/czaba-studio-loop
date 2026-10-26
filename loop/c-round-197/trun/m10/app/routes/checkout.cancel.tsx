import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { ArrowLeft, ShoppingCart, XCircle } from 'lucide-react';
import { Footer } from '~/components/layout/Footer';
import { PageContainer } from '~/components/layout/PageContainer';

export const meta: MetaFunction = () => {
  return [
    { title: 'Payment Cancelled | CZABA' },
    { name: 'description', content: 'Your payment was cancelled.' },
  ];
};

export default function CheckoutCancel() {
  return (
    <>
      <main className="min-h-screen bg-background pt-32 pb-20">
        <PageContainer>
          <div className="max-w-xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-accent" />
              </div>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Payment Cancelled
            </h1>
            <p className="text-muted text-lg mb-8">
              Your payment was cancelled. No charges have been made.
            </p>

            <div className="bg-elevated border border-outline rounded-lg p-6 mb-8 text-left">
              <p className="text-muted text-sm">
                Your items are still in your cart. You can return to checkout when you're ready to
                complete your purchase.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cart"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-background font-semibold rounded-md hover:bg-brand-hover transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Return to Cart
              </Link>
              <Link
                to="/store"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-muted font-semibold rounded-md hover:bg-elevated hover:text-foreground transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}
