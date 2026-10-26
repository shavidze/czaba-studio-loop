import { Link } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

interface Album {
  id: string;
  title: string;
  description: string;
  artist?: string;
  image: string;
  handle: string;
  isOriginal: boolean;
}

interface SuggestedAlbumsProps {
  albums: Album[];
}

export function SuggestedAlbums({ albums }: SuggestedAlbumsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Play all tracks from album
  };

  return (
    <div className="suggested-albums-section">
      <div className="suggested-albums-header">
        <h2 className="suggested-albums-title">Suggested albums</h2>
      </div>

      <div className="albums-carousel-wrapper">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            className="carousel-nav-button carousel-nav-left cursor-pointer"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Carousel Container */}
        <div className="albums-carousel" ref={scrollContainerRef}>
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/products/${album.handle}`}
              className="album-card cursor-pointer"
            >
              <div className="album-image-container">
                <img src={album.image} alt={album.title} className="album-image" />

                {album.isOriginal && <div className="album-badge-original">CZABA ORIGINAL</div>}

                <button
                  className="album-play-button cursor-pointer"
                  onClick={handlePlayClick}
                  aria-label={`Play ${album.title}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                <p className="album-description">
                  {album.description}
                  {album.artist && (
                    <>
                      {' · '}
                      <span className="album-artist">{album.artist}</span>
                    </>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            className="carousel-nav-button carousel-nav-right cursor-pointer"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
