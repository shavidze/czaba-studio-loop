export function TrackRowSkeleton() {
  return (
    <div className="track-row">
      {/* 1. Play/Image Section */}
      <div className="track-row-main" style={{ order: 1 }}>
        <div className="track-row-content">
          {/* Cover Image Skeleton */}
          <div className="track-row-image-wrapper">
            <div className="skeleton-shimmer w-full h-full rounded" />
          </div>

          {/* Title & Artist Skeleton */}
          <div className="track-row-info">
            <div className="skeleton-shimmer h-5 w-48 rounded mb-2" />
            <div className="skeleton-shimmer h-4 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* 2. Genres/Tags Skeleton */}
      <div className="track-row-tags" style={{ order: 4 }}>
        <div className="track-row-tags-wrapper gap-2">
          <div className="skeleton-shimmer h-6 w-16 rounded" />
          <div className="skeleton-shimmer h-6 w-20 rounded" />
        </div>
      </div>

      {/* 3. Waveform & Duration Skeleton */}
      <div className="track-row-waveform-section" style={{ order: 7 }}>
        <div className="track-row-waveform-container">
          <div className="skeleton-shimmer h-4 w-12 rounded mb-2" />
          <div className="track-row-waveform">
            <div className="skeleton-shimmer h-full w-full rounded" style={{ opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* 4. Actions Skeleton */}
      <div className="track-row-actions" style={{ order: 8 }}>
        <div className="track-row-actions-wrapper gap-2">
          <div className="skeleton-shimmer h-9 w-9 rounded" />
          <div className="skeleton-shimmer h-9 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
