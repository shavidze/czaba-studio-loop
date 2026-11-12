import { TrackRowSkeleton } from './TrackRowSkeleton';

interface TrackListSkeletonProps {
  count?: number;
}

export function TrackListSkeleton({ count = 8 }: TrackListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <TrackRowSkeleton key={`track-skeleton-${index}`} />
      ))}
    </div>
  );
}
