import { Link } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '~/components/icons';

export interface RelatedTrack {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  artist: string;
}

interface RelatedTracksCarouselProps {
  tracks: RelatedTrack[];
  artistName?: string;
  productType?: 'Music' | 'Presets' | 'Sound Effects';
}

export function RelatedTracksCarousel({
  tracks,
  artistName = 'ARAM',
  productType = 'Music',
}: RelatedTracksCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 216;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">More {productType}</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full bg-elevated hover:bg-muted-bg text-foreground disabled:bg-surface disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full bg-elevated hover:bg-muted-bg text-foreground disabled:bg-surface disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div ref={scrollRef} className="flex flex-nowrap gap-4 overflow-hidden scroll-smooth pb-2">
          {tracks.map((track) => (
            <Link
              key={track.id}
              to={`/products/${track.handle}`}
              className="flex-shrink-0 w-[200px] group"
            >
              <div className="space-y-2">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-surface">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-black ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-muted">{track.artist}</p>
                  <p className="text-sm font-bold text-foreground">${track.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
