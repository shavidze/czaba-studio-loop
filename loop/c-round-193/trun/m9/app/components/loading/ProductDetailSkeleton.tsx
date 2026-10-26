export function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Skeleton */}
        <div className="lg:w-[320px] lg:flex-shrink-0">
          <div className="space-y-4">
            {/* Image Skeleton */}
            <div className="aspect-square rounded-xl overflow-hidden bg-elevated">
              <div className="skeleton-shimmer w-full h-full" />
            </div>

            {/* Title Skeleton */}
            <div className="skeleton-shimmer h-8 w-full rounded" />

            {/* Artist Skeleton */}
            <div className="skeleton-shimmer h-5 w-2/3 rounded" />

            {/* Description Skeleton */}
            <div className="space-y-2 pt-4">
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-3/4 rounded" />
            </div>

            {/* Metadata Skeleton */}
            <div className="space-y-3 pt-4 border-t border-outline">
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-4 w-16 rounded" />
                <div className="skeleton-shimmer h-4 w-20 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-4 w-16 rounded" />
                <div className="skeleton-shimmer h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-4 w-20 rounded" />
                <div className="skeleton-shimmer h-4 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Purchase Header Skeleton */}
          <div className="bg-elevated border border-outline rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="skeleton-shimmer h-10 w-32 rounded" />
              <div className="skeleton-shimmer h-12 w-40 rounded-lg" />
            </div>
          </div>

          {/* Version Selector Skeleton */}
          <div className="bg-elevated border border-outline rounded-xl p-6">
            <div className="skeleton-shimmer h-6 w-40 rounded mb-4" />
            <div className="flex gap-3">
              <div className="skeleton-shimmer h-24 w-32 rounded-lg" />
              <div className="skeleton-shimmer h-24 w-32 rounded-lg" />
            </div>
          </div>

          {/* Play Button Skeleton */}
          <div className="skeleton-shimmer h-14 w-full rounded-xl" />

          {/* License Selector Skeleton */}
          <div className="bg-elevated border border-outline rounded-xl p-6">
            <div className="skeleton-shimmer h-6 w-48 rounded mb-4" />
            <div className="space-y-3">
              <div className="skeleton-shimmer h-20 w-full rounded-lg" />
              <div className="skeleton-shimmer h-20 w-full rounded-lg" />
              <div className="skeleton-shimmer h-20 w-full rounded-lg" />
            </div>
          </div>

          {/* Usage Terms Skeleton */}
          <div className="bg-elevated border border-outline rounded-xl p-6">
            <div className="skeleton-shimmer h-6 w-32 rounded mb-4" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-5/6 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
