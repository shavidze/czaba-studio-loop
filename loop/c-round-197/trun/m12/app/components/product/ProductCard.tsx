import { Link } from '@remix-run/react';
import { useRef, useState } from 'react';
import { AudioPreviewButton } from '~/components/audio';
import { getPreviewUrl, normalizePreviewUrl, R2_DIRECT_URL, R2_WORKER_URL } from '~/lib/r2.config';
import type { Product } from '~/services/api/client';
import type { DisplayProduct } from '~/types';
import type { Track } from '~/types/audio';

interface ProductCardProps {
  product: Product | DisplayProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isApiProduct = 'category' in product;

  const image = isApiProduct ? product.imageUrl || '' : product.featuredImage?.url || '';

  const priceAmount = isApiProduct
    ? (product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0)
    : Number(product.priceRange?.minVariantPrice?.amount ?? 0);

  const isFree = priceAmount === 0;
  const price = isFree ? 'Complimentary' : `$${priceAmount}`;

  const genre = isApiProduct ? product.genre : undefined;

  let audioPreviewUrl = isApiProduct
    ? normalizePreviewUrl(product.audioPreviewUrl) || getPreviewUrl(product.handle)
    : getPreviewUrl(product.handle);

  if (audioPreviewUrl.includes(R2_DIRECT_URL)) {
    audioPreviewUrl = audioPreviewUrl
      .replace(R2_DIRECT_URL, R2_WORKER_URL)
      .replace(`/${product.handle}/Preview/`, `/preview/${product.handle}/`);
  }

  const rawTags = isApiProduct ? product.tags : undefined;
  const tags = rawTags?.split(',').map((t) => t.trim().toLowerCase()) || [];
  const productType = isApiProduct ? product.category : product.productType;

  const category = productType?.toLowerCase();
  const isPack =
    category === 'sfx' ||
    category === 'sound effects' ||
    category === 'presets' ||
    tags.includes('pack');
  const isBundle = tags.includes('bundle') || tags.includes('album');
  const shouldShowAudio =
    Boolean(audioPreviewUrl) && category !== 'presets' && category !== 'preset';

  const track: Track = {
    id: isApiProduct ? String(product.id) : product.id,
    title: product.title,
    artist: genre || 'CZABA',
    audioUrl: audioPreviewUrl || '',
    imageUrl: image,
    productHandle: product.handle,
  };

  const isNew = isApiProduct && product.isNew;

  let badgeText = genre;
  if (isNew) {
    badgeText = 'New';
  } else if (isPack && !isFree) {
    badgeText = 'Pack';
  } else if (isBundle) {
    badgeText = tags.includes('album') ? 'Album' : 'Bundle';
  } else if (isFree) {
    badgeText = 'Complimentary';
  }

  return (
    <article
      ref={cardRef}
      className="group relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="transition-transform duration-200 ease-out group-hover:scale-[1.02]">
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isHovering
              ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(19, 217, 204, 0.15), transparent 40%)`
              : 'none',
          }}
        />

        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isHovering
              ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(19, 217, 204, 0.4), transparent 40%)`
              : 'none',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        <Link to={`/products/${product.handle}`}>
          <div className="light-flicker-effect relative aspect-square rounded-xl overflow-hidden bg-card mb-4">
            <img
              src={image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {shouldShowAudio && (
              <>
                <div className="md:hidden absolute bottom-3 right-3 z-10">
                  <AudioPreviewButton track={track} variant="overlay" />
                </div>

                <div className="hidden md:flex absolute inset-0 bg-background/60 backdrop-blur-sm items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <AudioPreviewButton track={track} variant="overlay" />
                </div>
              </>
            )}

            {badgeText && (
              <div
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  isNew ? 'bg-brand/90 text-background' : 'bg-primary/90 text-primary-foreground'
                }`}
              >
                {badgeText}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">
              {productType || 'Music'}
            </p>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{price}</span>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
