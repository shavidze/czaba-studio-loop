/**
 * PremiumProductCard - Film Crux Style 3D Stacked Card
 *
 * Design System Compliance:
 * - Colors: --color-surface, --color-outline, gold accent
 * - Spacing: 8-point grid (spacing-4, spacing-6, spacing-8)
 * - Typography: Playfair Display for titles, Inter for body
 * - Radius: radius-lg (12px)
 * - Animation: 600ms, ease-out easing
 */

import { Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';

// Gold accent color for premium feel
const ACCENT_COLOR = 'var(--color-accent)';
const ACCENT_BG = 'rgba(var(--color-accent-rgb), 0.13)';
const ACCENT_BORDER = 'rgba(var(--color-accent-rgb), 0.25)';

interface PremiumProductCardProps {
  title: string;
  description: string;
  price: number;
  image: string;
  href: string;
  badge?: string;
}

export function PremiumProductCard({
  title,
  description,
  price,
  image,
  href,
  badge,
}: PremiumProductCardProps) {
  return (
    <Link
      to={href}
      className="premium-card-container group relative block"
      style={{ perspective: '1200px' }}
    >
      {/* Back layers - fan out on hover */}
      <div className="premium-card-stack">
        {/* Layer 4 (furthest back) */}
        <div className="premium-card-layer premium-card-layer-4" aria-hidden="true" />
        {/* Layer 3 */}
        <div className="premium-card-layer premium-card-layer-3" aria-hidden="true" />
        {/* Layer 2 */}
        <div className="premium-card-layer premium-card-layer-2" aria-hidden="true" />

        {/* Layer 1 - Main card (front) */}
        <div className="premium-card-front">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={title}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badge */}
            {badge && (
              <div
                className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                style={{
                  backgroundColor: ACCENT_BG,
                  color: ACCENT_COLOR,
                  border: `1px solid ${ACCENT_BORDER}`,
                }}
              >
                {badge}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Title - Playfair Display */}
            <h3 className="premium-card-title font-serif text-xl font-semibold text-foreground transition-colors duration-500 ease-out">
              {title}
            </h3>

            {/* Description - Inter */}
            <p className="text-sm text-muted line-clamp-2">{description}</p>

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                ${price}
              </span>

              {/* CTA Button - slides in */}
              <div className="premium-card-cta flex items-center gap-2 text-sm font-medium transition-all duration-500 ease-out">
                <span>Discover</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * PremiumProductCardsSection - Grid wrapper for premium cards
 */
interface PremiumProductCardsSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PremiumProductCardsSection({
  title = 'Premium Collection',
  subtitle = 'Handcrafted sounds for cinematic excellence',
  children,
}: PremiumProductCardsSectionProps) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">{title}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Cards Grid - responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {children}
        </div>
      </div>
    </section>
  );
}

export default PremiumProductCard;
