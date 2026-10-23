import { Link } from '@remix-run/react';
import { Gift, Percent } from 'lucide-react';
import { PageContainer } from '../layout';

export function SpecialOffersSection() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gift Cards */}
          <div className="group relative min-h-[300px] overflow-hidden rounded-xl transition-shadow hover:shadow-[0_0_20px_rgba(19,217,204,0.3)]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800"
                alt="Gift Card"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-center p-8">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
                <Gift size={16} className="text-brand" />
                <span>Gift Cards</span>
              </div>
              <h3 className="mb-3 font-serif text-2xl font-semibold md:text-3xl">
                Give the Gift of Sound
              </h3>
              <p className="mb-6 max-w-xs text-muted">
                Empower a creator's next masterpiece. The perfect gift for producers, artists, and
                content creators.
              </p>
              <Link
                to="/gift-cards"
                className="w-fit cursor-pointer rounded-lg border border-outline bg-elevated px-6 py-3 font-medium transition-colors hover:border-outline-hover hover:bg-outline"
              >
                Browse Gift Cards
              </Link>
            </div>
          </div>

          {/* Bundle Deals */}
          <div className="group relative min-h-[300px] overflow-hidden rounded-xl bg-gradient-to-br from-brand/20 via-background to-accent/10 transition-shadow hover:shadow-[0_0_20px_rgba(19,217,204,0.3)]">
            {/* Glow effects */}
            <div className="pointer-events-none absolute -left-20 -top-20 size-40 rounded-full bg-brand/30 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 size-40 rounded-full bg-accent/20 blur-[80px]" />

            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-center p-8">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm text-accent">
                <Percent size={16} />
                <span>Exclusive</span>
              </div>
              <h3 className="mb-3 font-serif text-2xl font-semibold md:text-3xl">
                The Complete Collection
              </h3>
              <p className="mb-6 max-w-xs text-muted">
                Everything you need for professional productions. One purchase, unlimited creative
                freedom.
              </p>
              <Link
                to="/store"
                className="w-fit cursor-pointer rounded-lg border border-outline bg-elevated px-6 py-3 font-medium transition-colors hover:border-outline-hover hover:bg-outline"
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
