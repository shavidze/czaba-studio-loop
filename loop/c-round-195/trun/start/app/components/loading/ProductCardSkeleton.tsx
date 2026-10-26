export function ProductCardSkeleton() {
  return (
    <article className="group relative">
      {/* Skeleton Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-elevated mb-4">
        <div className="skeleton-shimmer w-full h-full" />
      </div>

      {/* Skeleton Content */}
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="skeleton-shimmer h-6 w-3/4 rounded" />

        {/* Price skeleton */}
        <div className="skeleton-shimmer h-5 w-1/3 rounded" />

        {/* Button skeleton */}
        <div className="skeleton-shimmer h-10 w-full rounded-lg" />
      </div>
    </article>
  );
}
