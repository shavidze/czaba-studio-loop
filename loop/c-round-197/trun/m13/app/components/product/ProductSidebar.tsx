import { Link } from '@remix-run/react';
import { Download } from 'lucide-react';
import { AudioPreviewButton } from '~/components/audio';
import type { Track } from '~/contexts/AudioContext';
import { getArtistHandle, parseTags } from '~/lib/product-utils';
import { normalizePreviewUrl } from '~/lib/r2.config';
import type { Product } from '~/services/api/client';
import { Product3DBox } from './Floating3DAlbum';

const BOX_IMAGES: Record<string, string> = {
  gold: '/images/packs/1.png',
  silver: '/images/packs/2.png',
  copper: '/images/packs/3.png',
};

interface ProductSidebarProps {
  product: Product;
}

export function ProductSidebar({ product }: ProductSidebarProps) {
  const artistHandle = getArtistHandle(product.vendor);
  const tags = parseTags(product.tags);

  const track: Track = {
    id: product.id.toString(),
    title: product.title,
    artist: product.vendor || 'CZABA',
    audioUrl: normalizePreviewUrl(product.audioPreviewUrl),
    imageUrl: product.imageUrl || '',
    productHandle: product.handle,
  };

  const boxImage = product.imageUrl || BOX_IMAGES.gold;
  const standardPrice =
    product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0;
  const isFree = standardPrice === 0;

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Product3DBox imageSrc={boxImage} title={product.title} />

        {product.audioPreviewUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300">
            <AudioPreviewButton track={track} variant="overlay" />
          </div>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground tracking-wide mb-1">
          {product.title}
        </h1>
        <Link
          to={`/artist/${artistHandle}`}
          className="text-sm text-muted hover:text-foreground transition-colors tracking-wider uppercase"
        >
          by {product.vendor || 'CZABA'}
        </Link>
      </div>

      {isFree && (
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-lg font-semibold transition-all hover:bg-foreground/90">
          <Download size={18} />
          <span>Complimentary Download</span>
        </button>
      )}

      <div className="pt-4 border-t border-outline/50">
        <div className="grid grid-cols-2 gap-3 text-center">
          {product.bpm && product.bpm > 0 && (
            <div className="p-3 bg-surface/50 rounded-lg">
              <div className="text-xs text-muted uppercase tracking-wider mb-1">BPM</div>
              <div className="text-foreground font-medium">{product.bpm}</div>
            </div>
          )}
          {product.key && product.key !== '-' && (
            <div className="p-3 bg-surface/50 rounded-lg">
              <div className="text-xs text-muted uppercase tracking-wider mb-1">Key</div>
              <div className="text-foreground font-medium">{product.key}</div>
            </div>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-[10px] text-muted border border-outline rounded-full hover:border-outline-hover transition-colors cursor-pointer uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
