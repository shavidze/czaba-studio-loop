export function DownloadCardSkeleton() {
  return (
    <div className="bg-elevated border border-outline rounded-lg overflow-hidden">
      {/* Thumbnail Skeleton */}
      <div className="aspect-square bg-surface">
        <div className="skeleton-shimmer w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Name Skeleton */}
        <div className="skeleton-shimmer h-6 w-3/4 rounded mb-3" />

        {/* Metadata Skeleton */}
        <div className="flex items-center gap-2 mb-1">
          <div className="skeleton-shimmer h-4 w-4 rounded" />
          <div className="skeleton-shimmer h-4 w-16 rounded" />
          <span className="text-muted">•</span>
          <div className="skeleton-shimmer h-4 w-16 rounded" />
        </div>
        <div className="skeleton-shimmer h-3 w-48 rounded mb-4" />

        {/* Buttons Skeleton */}
        <div className="flex gap-2">
          <div className="skeleton-shimmer h-10 flex-1 rounded-lg" />
          <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
