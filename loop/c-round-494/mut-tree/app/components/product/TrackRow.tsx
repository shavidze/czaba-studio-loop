import { Link } from '@remix-run/react';
import { useState } from 'react';

interface TrackRowProps {
  track: {
    id: string;
    title: string;
    artist: string;
    cover: string;
    tags: string[];
    duration: string;
    bpm?: number;
    key?: string;
    price: number;
    isPack?: boolean;
    audioPreviewUrl?: string | null;
  };
}

export function TrackRow({ track }: TrackRowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className="track-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Play/Image Section (Order 1) */}
      <div className="track-row-main" style={{ order: 1 }}>
        <div className="track-row-content">
          {/* Cover Image with Play Overlay */}
          <div className="track-row-image-wrapper">
            <img src={track.cover} alt={track.title} className="track-row-image" loading="lazy" />

            {/* Hover Play Overlay - Only show if not a pack */}
            {!track.isPack && track.audioPreviewUrl && (
              <div className={`track-row-play-overlay ${isHovered ? 'visible' : ''}`}>
                <button
                  className="track-row-play-button cursor-pointer"
                  onClick={handlePlayClick}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    // Pause Icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    // Play Icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="track-row-info">
            <Link to={`/products/${track.id}`} className="track-row-title cursor-pointer">
              {track.title}
            </Link>
            <span className="track-row-artist">{track.artist}</span>
          </div>
        </div>
      </div>

      {/* 2. Genres/Tags (Order 4) - Hidden on mobile */}
      <div className="track-row-tags" style={{ order: 4 }}>
        <div className="track-row-tags-wrapper">
          {track.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="track-row-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Waveform & Duration (Order 7) */}
      <div className="track-row-waveform-section" style={{ order: 7 }}>
        <div className="track-row-waveform-container">
          <span className="track-row-duration">{track.duration}</span>

          {/* Waveform Placeholder */}
          <div className="track-row-waveform">
            <div className="track-row-waveform-progress" style={{ width: '33%' }}></div>
            <div className="track-row-waveform-placeholder">
              {/* Visual bars to simulate waveform */}
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    opacity: 0.3,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actions (Order 8) */}
      <div className="track-row-actions" style={{ order: 8 }}>
        <div className="track-row-actions-wrapper">
          {/* Download Button */}
          <button
            className="track-row-action-btn cursor-pointer"
            aria-label="Download"
            title="Download"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Add to Cart Button */}
          <button
            className="track-row-action-btn track-row-cart-btn cursor-pointer"
            aria-label="Add to Cart"
            title="Add to Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1" strokeWidth="2" />
              <circle cx="20" cy="21" r="1" strokeWidth="2" />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="track-row-price">${track.price.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
